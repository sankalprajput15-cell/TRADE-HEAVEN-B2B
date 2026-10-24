import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface OtpEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  otpCode: string;
  expiryMinutes?: number;
}

export interface SmtpDispatchResult {
  success: boolean;
  sender: string;
  recipient: string;
  mode: 'SMTP_TLS' | 'BIGROCK_MTA_RELAY' | 'FALLBACK_QUEUE';
  dispatchedCode?: string;
  messageId?: string;
  error?: string;
}

/**
 * Normalizes corporate email addresses where a field label prefix like "mail-" was accidentally prepended
 * (e.g. "mail-sorkindon@gmail.com" -> "sorkindon@gmail.com").
 */
export function normalizeRecipientEmail(rawEmail: string): string {
  const clean = (rawEmail || '').toLowerCase().trim();
  if (clean.startsWith('mail-') && clean.includes('@')) {
    return clean.slice(5);
  }
  return clean;
}

export interface SerializedMailOptions {
  from: string;
  replyTo?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
}

export interface SerializedDeliveryReceipt {
  recipient: string;
  success: boolean;
  messageId?: string;
  dispatchedAt: string;
  enforcedDelayMs: number;
  error?: string;
}

interface QueuedEmailTask {
  id: string;
  recipient: string;
  mailOptions: nodemailer.SendMailOptions;
  customTransporter?: nodemailer.Transporter;
  enqueuedAt: number;
  resolve: (receipt: SerializedDeliveryReceipt) => void;
}

export interface DeliveryQueueStatus {
  minDelayMs: number;
  queueDepth: number;
  isProcessing: boolean;
  totalProcessed: number;
  consecutiveFailures: number;
  failureThreshold: number;
  isFlagged: boolean;
  lastFailureReason: string | null;
  lastFailureAlertId: string | null;
  lastFailureAlertTriggeredAt: string | null;
  lastDispatchedAt: string | null;
  recentDeliveries: SerializedDeliveryReceipt[];
}

/**
 * Server-Side Delivery Queue Manager
 * Enforces a strict minimum delay (default: 2000ms / 2 seconds) between consecutive emails,
 * decomposes any multi-recipient batch operation into strictly serialized individual single-recipient messages,
 * and flags critical status when 5 consecutive failures occur.
 */
export class ServerDeliveryQueueManager {
  private readonly minDelayMs: number;
  public readonly failureThreshold = 5;
  private queue: QueuedEmailTask[] = [];
  private isProcessing = false;
  private lastDispatchedAt = 0;
  private totalProcessed = 0;
  private consecutiveFailures = 0;
  private lastFailureReason: string | null = null;
  private lastFailureAlertId: string | null = null;
  private lastFailureAlertTriggeredAt: string | null = null;
  private recentDeliveries: SerializedDeliveryReceipt[] = [];

  constructor(minDelayMs = 2000) {
    this.minDelayMs = Math.max(2000, minDelayMs);
  }

  private getDefaultTransporter(): nodemailer.Transporter | null {
    const host = (process.env.SMTP_HOST || process.env.NOREPLY_SMTP_HOST || '').trim();
    const port = Number(process.env.SMTP_PORT || process.env.NOREPLY_SMTP_PORT || 587);
    const user = (process.env.SMTP_USER || process.env.NOREPLY_SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || process.env.NOREPLY_SMTP_PASS || '').trim();

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  /**
   * Parses a single recipient, comma-separated recipient string, or recipient array
   * into deduplicated, normalized individual recipient email addresses.
   */
  public parseSingleRecipients(toField: string | string[]): string[] {
    const rawList = Array.isArray(toField) ? toField : String(toField || '').split(',');
    const unique: string[] = [];
    for (const item of rawList) {
      const normalized = normalizeRecipientEmail(item);
      if (normalized && normalized.includes('@') && !unique.includes(normalized)) {
        unique.push(normalized);
      }
    }
    return unique;
  }

  /**
   * Enqueues a single-recipient or multi-recipient batch operation.
   * Multi-recipient batches are automatically split into strictly serialized individual single-recipient messages,
   * spaced by at least `minDelayMs` (2000ms).
   */
  public enqueue(
    mailOptions: SerializedMailOptions,
    customTransporter?: nodemailer.Transporter
  ): Promise<SerializedDeliveryReceipt[]> {
    const recipients = this.parseSingleRecipients(mailOptions.to);
    if (recipients.length === 0) {
      return Promise.resolve([]);
    }

    const promises = recipients.map((singleRecipient, idx) => {
      return new Promise<SerializedDeliveryReceipt>((resolve) => {
        const task: QueuedEmailTask = {
          id: `mail-q-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          recipient: singleRecipient,
          mailOptions: {
            from: mailOptions.from,
            replyTo: mailOptions.replyTo,
            to: singleRecipient, // Strictly single recipient per message
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: mailOptions.html,
            attachments: mailOptions.attachments
          },
          customTransporter,
          enqueuedAt: Date.now(),
          resolve
        };
        this.queue.push(task);
      });
    });

    void this.processQueue();
    return Promise.all(promises);
  }

  /**
   * Convenience wrapper for enqueuing strictly one single-recipient email.
   */
  public async enqueueSingle(
    recipient: string,
    mailOptions: Omit<SerializedMailOptions, 'to'>,
    customTransporter?: nodemailer.Transporter
  ): Promise<SerializedDeliveryReceipt> {
    const cleanRecipient = normalizeRecipientEmail(recipient);
    const receipts = await this.enqueue(
      {
        ...mailOptions,
        to: [cleanRecipient]
      },
      customTransporter
    );
    return (
      receipts[0] || {
        recipient: cleanRecipient,
        success: false,
        dispatchedAt: new Date().toISOString(),
        enforcedDelayMs: 0,
        error: 'Invalid recipient address'
      }
    );
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const task = this.queue.shift()!;

        // Enforce minimum delay (e.g., 2000ms) between consecutive emails
        let enforcedDelayMs = 0;
        if (this.lastDispatchedAt > 0) {
          const elapsed = Date.now() - this.lastDispatchedAt;
          if (elapsed < this.minDelayMs) {
            enforcedDelayMs = this.minDelayMs - elapsed;
            await new Promise((r) => setTimeout(r, enforcedDelayMs));
          }
        }

        const transporter = task.customTransporter || this.getDefaultTransporter();
        this.lastDispatchedAt = Date.now();

        if (!transporter) {
          const simReceipt: SerializedDeliveryReceipt = {
            recipient: task.recipient,
            success: false,
            dispatchedAt: new Date(this.lastDispatchedAt).toISOString(),
            enforcedDelayMs,
            error: 'SMTP credentials not configured'
          };
          this.recordReceipt(simReceipt);
          task.resolve(simReceipt);
          continue;
        }

        try {
          const info = await transporter.sendMail(task.mailOptions);
          this.lastDispatchedAt = Date.now();
          const receipt: SerializedDeliveryReceipt = {
            recipient: task.recipient,
            success: true,
            messageId: info.messageId,
            dispatchedAt: new Date(this.lastDispatchedAt).toISOString(),
            enforcedDelayMs
          };
          console.log(
            `[ServerDeliveryQueueManager] Serialized single-recipient email delivered to ${task.recipient} (delay=${enforcedDelayMs}ms, remainingQueue=${this.queue.length}, messageId=${info.messageId})`
          );
          this.recordReceipt(receipt);
          task.resolve(receipt);
        } catch (err: any) {
          this.lastDispatchedAt = Date.now();
          const failReceipt: SerializedDeliveryReceipt = {
            recipient: task.recipient,
            success: false,
            dispatchedAt: new Date(this.lastDispatchedAt).toISOString(),
            enforcedDelayMs,
            error: err?.message || String(err)
          };
          console.warn(
            `[ServerDeliveryQueueManager] Serialized delivery failed for ${task.recipient} (consecutiveFailures=${this.consecutiveFailures + 1}):`,
            failReceipt.error
          );
          this.recordReceipt(failReceipt);
          task.resolve(failReceipt);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private recordReceipt(receipt: SerializedDeliveryReceipt) {
    this.totalProcessed += 1;
    if (receipt.success) {
      this.consecutiveFailures = 0;
      this.lastFailureReason = null;
      this.lastFailureAlertId = null;
      this.lastFailureAlertTriggeredAt = null;
    } else {
      this.consecutiveFailures += 1;
      this.lastFailureReason = receipt.error || 'Unknown SMTP transport failure';
      if (this.consecutiveFailures >= this.failureThreshold && !this.lastFailureAlertId) {
        this.lastFailureAlertId = `dq-alert-${Date.now()}-${this.consecutiveFailures}`;
        this.lastFailureAlertTriggeredAt = new Date().toISOString();
        console.error(
          `[ServerDeliveryQueueManager] CRITICAL ALERT: Delivery queue experienced ${this.consecutiveFailures} consecutive failures (alertId=${this.lastFailureAlertId}, reason=${this.lastFailureReason})`
        );
      }
    }

    this.recentDeliveries.unshift(receipt);
    if (this.recentDeliveries.length > 25) {
      this.recentDeliveries.length = 25;
    }
  }

  /**
   * Resets the consecutive failure counter and clears the flagged status indicator.
   */
  public resetFailureState(): DeliveryQueueStatus {
    this.consecutiveFailures = 0;
    this.lastFailureReason = null;
    this.lastFailureAlertId = null;
    this.lastFailureAlertTriggeredAt = null;
    return this.getQueueStatus();
  }

  /**
   * Records simulated failure receipts to test or verify the 5-consecutive-failure notification pipeline
   * without sending broken traffic to live recipient inboxes.
   */
  public recordSimulatedFailures(count = 5, reason = 'SMTP connection timeout / relay refusal'): DeliveryQueueStatus {
    const safeCount = Math.max(1, Math.min(10, count));
    for (let i = 0; i < safeCount; i++) {
      const nowIso = new Date().toISOString();
      this.recordReceipt({
        recipient: `diagnostic-probe-${i + 1}@tradeheaven.net`,
        success: false,
        dispatchedAt: nowIso,
        enforcedDelayMs: 2000,
        error: reason
      });
    }
    return this.getQueueStatus();
  }

  public getQueueStatus(): DeliveryQueueStatus {
    return {
      minDelayMs: this.minDelayMs,
      queueDepth: this.queue.length,
      isProcessing: this.isProcessing,
      totalProcessed: this.totalProcessed,
      consecutiveFailures: this.consecutiveFailures,
      failureThreshold: this.failureThreshold,
      isFlagged: this.consecutiveFailures >= this.failureThreshold,
      lastFailureReason: this.lastFailureReason,
      lastFailureAlertId: this.lastFailureAlertId,
      lastFailureAlertTriggeredAt: this.lastFailureAlertTriggeredAt,
      lastDispatchedAt: this.lastDispatchedAt ? new Date(this.lastDispatchedAt).toISOString() : null,
      recentDeliveries: this.recentDeliveries
    };
  }
}

export const serverDeliveryQueueManager = new ServerDeliveryQueueManager(2000);

/**
 * Automated SMTP Service for Trade Heaven Security
 * Ensures each password reset request dispatches strictly ONE single OTP email to the client
 * via the ServerDeliveryQueueManager (enforcing a 2-second minimum delay between consecutive emails).
 */
export class AutomatedSmtpService {
  public readonly senderAddress = 'noreply@tradeheaven.net';
  public readonly senderFormatted = '"Trade Heaven Security" <noreply@tradeheaven.net>';
  public readonly replyToAddress = 'noreply@tradeheaven.net';
  public readonly whatsappSupportNumber = '+91 8532934479';
  public readonly remoteMtaGatewayUrl = 'https://tradeheaven.net/api.php';

  // Deduplication cache to prevent accidental double-dispatches within a 5-second window
  private recentDispatches = new Map<string, { timestamp: number; result: SmtpDispatchResult }>();

  /**
   * Prioritize the verified primary SMTP transport (process.env.SMTP_HOST = smtp.gmail.com)
   */
  private getPrimarySmtpCredentials() {
    const host = (process.env.SMTP_HOST || process.env.NOREPLY_SMTP_HOST || '').trim();
    const port = Number(process.env.SMTP_PORT || process.env.NOREPLY_SMTP_PORT || 587);
    const user = (process.env.SMTP_USER || process.env.NOREPLY_SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || process.env.NOREPLY_SMTP_PASS || '').trim();
    return { host, port, user, pass };
  }

  private createPrimaryTransporter() {
    const { host, port, user, pass } = this.getPrimarySmtpCredentials();

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });
  }

  public buildWhatsAppSupportUrl(email?: string): string {
    const clean = normalizeRecipientEmail(email || '');
    const text = clean
      ? `Hello Trade Heaven Support, I need assistance with password reset / OTP verification for my corporate account (${clean}).`
      : `Hello Trade Heaven Support, I need assistance signing in / resetting my corporate account password.`;
    return `https://wa.me/918532934479?text=${encodeURIComponent(text)}`;
  }

  /**
   * Fallback relay to BigRock MTA Gateway ONLY used when primary Nodemailer SMTP is unavailable.
   */
  private async relayViaBigRockMta(
    cleanEmail: string,
    displayName: string,
    otpCode: string
  ): Promise<SmtpDispatchResult | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.remoteMtaGatewayUrl}?action=forgot_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          name: displayName,
          code: otpCode
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const data: any = await response.json().catch(() => null);
      if (data && (data.success || data.status === 'success')) {
        const remoteCode = String(data.verification_code || data.code || otpCode).trim();
        console.log(
          `[AutomatedSmtpService] Fallback BigRock MTA dispatched OTP (${remoteCode}) for ${cleanEmail}`
        );
        return {
          success: true,
          sender: this.senderAddress,
          recipient: cleanEmail,
          mode: 'BIGROCK_MTA_RELAY',
          dispatchedCode: remoteCode,
          messageId: `bigrock-mta-${Date.now()}@tradeheaven.net`
        };
      }
    } catch (err: any) {
      console.warn(
        `[AutomatedSmtpService] BigRock fallback relay warning for ${cleanEmail}:`,
        err?.message || err
      );
    }
    return null;
  }

  /**
   * Synchronizes a password reset verification and new password with the live BigRock MySQL gateway.
   */
  public async syncRemotePasswordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    const cleanEmail = normalizeRecipientEmail(email);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.remoteMtaGatewayUrl}?action=reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          code: code.trim(),
          new_password: newPassword
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const data: any = await response.json().catch(() => null);
      if (response.ok && data && (data.success || data.status === 'success')) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data?.message };
    } catch (err: any) {
      return { success: false, message: err?.message };
    }
  }

  /**
   * Dispatches strictly ONE single 6-digit password reset OTP email to the client,
   * serialized via ServerDeliveryQueueManager with a 2-second minimum inter-email delay.
   */
  public async sendPasswordResetOtp(payload: OtpEmailPayload): Promise<SmtpDispatchResult> {
    const cleanEmail = normalizeRecipientEmail(payload.recipientEmail);
    const displayName = payload.recipientName || (cleanEmail === 'sorkindon@gmail.com' ? 'Donald Sorkin' : 'Valued Trade Partner');
    const expiryMinutes = payload.expiryMinutes ?? 60;
    const finalOtpCode = payload.otpCode;

    // Prevent duplicate emails if triggered twice within 5 seconds for the same recipient
    const recent = this.recentDispatches.get(cleanEmail);
    if (recent && Date.now() - recent.timestamp < 5000) {
      console.log(`[AutomatedSmtpService] Deduplicated rapid OTP request for ${cleanEmail} (reusing single email dispatch ${recent.result.dispatchedCode})`);
      return recent.result;
    }

    const subject = `🔑 Trade Heaven Password Reset OTP: ${finalOtpCode}`;

    const textBody = [
      `Trade Heaven Security (${this.senderAddress})`,
      ``,
      `Hello ${displayName},`,
      ``,
      `We received a password reset request for your Trade Heaven corporate account (${cleanEmail}).`,
      `Your 6-Digit Verification Code (OTP) is: ${finalOtpCode}`,
      ``,
      `This verification code is valid for ${expiryMinutes} minutes and was dispatched automatically from ${this.senderAddress}.`,
      ``,
      `Need instant support? Contact Trade Heaven Support on WhatsApp at ${this.whatsappSupportNumber} or email ${this.replyToAddress}.`
    ].join('\n');

    const htmlBody = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;">
        <h2 style="color: #2563eb; margin-top: 0; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">🔑 Trade Heaven Password Reset Code</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #334155;">Hello <strong>${displayName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #334155;">
          Use the 6-digit verification code (OTP) below to reset the password for your Trade Heaven corporate account (<strong>${cleanEmail}</strong>):
        </p>
        <div style="background: #eff6ff; color: #1e40af; padding: 18px; border-radius: 10px; font-size: 32px; font-weight: bold; font-family: monospace; text-align: center; letter-spacing: 8px; margin: 20px 0; border: 2px solid #3b82f6;">
          ${finalOtpCode}
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Account Email:</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 13px; font-family: monospace; border-bottom: 1px solid #f1f5f9;">${cleanEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Dispatched Via:</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 13px; font-family: monospace; border-bottom: 1px solid #f1f5f9;">${this.senderAddress}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Code Validity:</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">${expiryMinutes} Minutes</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">WhatsApp Support:</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">${this.whatsappSupportNumber}</td>
          </tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Automated account recovery notification from Trade Heaven Security (${this.senderAddress}). If you need assistance, contact Trade Heaven on WhatsApp at ${this.whatsappSupportNumber}.</p>
      </div>
    `;

    // Primary Path: Enqueue strictly ONE single-recipient email via ServerDeliveryQueueManager
    const transporter = this.createPrimaryTransporter();
    if (transporter) {
      const receipt = await serverDeliveryQueueManager.enqueueSingle(
        cleanEmail,
        {
          from: this.senderFormatted,
          replyTo: this.replyToAddress,
          subject,
          text: textBody,
          html: htmlBody
        },
        transporter
      );

      if (receipt.success) {
        console.log(
          `[AutomatedSmtpService] Single OTP email (${finalOtpCode}) delivered to ${cleanEmail} via serialized queue (${this.getPrimarySmtpCredentials().host}, delay=${receipt.enforcedDelayMs}ms, messageId=${receipt.messageId})`
        );
        const result: SmtpDispatchResult = {
          success: true,
          sender: this.senderAddress,
          recipient: cleanEmail,
          mode: 'SMTP_TLS',
          dispatchedCode: finalOtpCode,
          messageId: receipt.messageId
        };
        this.recentDispatches.set(cleanEmail, { timestamp: Date.now(), result });
        return result;
      } else {
        console.warn(
          `[AutomatedSmtpService] Primary serialized SMTP transport error for ${cleanEmail}, falling back to BigRock MTA:`,
          receipt.error
        );
      }
    }

    // Fallback Path: Only used if primary SMTP is unavailable or failed
    const relayResult = await this.relayViaBigRockMta(cleanEmail, displayName, finalOtpCode);
    if (relayResult && relayResult.success) {
      this.recentDispatches.set(cleanEmail, { timestamp: Date.now(), result: relayResult });
      return relayResult;
    }

    console.log(
      `[AutomatedSmtpService] Automated OTP (${finalOtpCode}) queued via ${this.senderAddress} for ${cleanEmail}`
    );
    return {
      success: false,
      sender: this.senderAddress,
      recipient: cleanEmail,
      mode: 'FALLBACK_QUEUE',
      dispatchedCode: finalOtpCode
    };
  }

  /**
   * Dispatches a single personalized Diwali Maha Utsav (FLAT 10% OFF • Code: DIWALI10) promotional email
   * with the official banner image attached inline to an existing client via ServerDeliveryQueueManager.
   */
  public async sendDiwaliOfferEmailToClient(client: {
    email: string;
    name?: string;
    companyName?: string;
    tier?: string;
  }): Promise<SerializedDeliveryReceipt> {
    const cleanEmail = normalizeRecipientEmail(client.email);
    const displayName = client.name || 'Valued Trade Partner';
    const companyLabel = client.companyName ? ` (${client.companyName})` : '';

    const bannerFilePath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'Gemini_Generated_Image_obbsb1obbsb1obbs-clean_264b6c61.png'
    );
    const hasBannerFile = fs.existsSync(bannerFilePath);
    const bannerCid = 'diwali-maha-utsav-banner@tradeheaven.net';

    const subject = `🪔 Diwali Maha Utsav Offer: FLAT 10% OFF on All Trade Heaven Membership Plans (Code: DIWALI10)`;

    const textBody = [
      `TH TRADE HEAVEN — Take Your Business Online`,
      `DIWALI MAHA UTSAV — BRIGHTEN YOUR B2B BUSINESS`,
      ``,
      `Hello ${displayName}${companyLabel},`,
      ``,
      `Celebrate Diwali Maha Utsav with Trade Heaven! Brighten your B2B global trade operations with our special festive offer:`,
      ``,
      `🎉 FLAT 10% OFF ON ALL SUBSCRIPTION & MEMBERSHIP PLANS`,
      `🏷️ Use Promo Code: DIWALI10`,
      `🌐 Visit: https://www.tradeheaven.net`,
      ``,
      `Whether you are renewing or upgrading your Basic, Silver, Gold, or VIP Enterprise Membership Plan, apply promo code DIWALI10 at checkout to receive an instant 10% discount.`,
      ``,
      `Need assistance claiming your offer? Contact Trade Heaven Support on WhatsApp at ${this.whatsappSupportNumber} or reply to ${this.replyToAddress}.`
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 2px solid #f59e0b; color: #f8fafc;">
        <div style="background: linear-gradient(90deg, #580816 0%, #8b1122 50%, #0f172a 100%); padding: 20px 24px; text-align: center; border-bottom: 1px solid rgba(245, 158, 11, 0.35);">
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #fcd34d; text-transform: uppercase;">Trade Heaven • Take Your Business Online</div>
          <h1 style="margin: 6px 0 4px 0; font-size: 26px; font-weight: 900; color: #fde047; letter-spacing: 1px;">🪔 DIWALI MAHA UTSAV</h1>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">BRIGHTEN YOUR B2B BUSINESS</div>
        </div>

        ${
          hasBannerFile
            ? `<div style="background: #020617; text-align: center;">
                <img src="cid:${bannerCid}" alt="Trade Heaven Diwali Maha Utsav - Flat 10% OFF on All Subscription & Membership Plans - Use Promo Code DIWALI10" style="width: 100%; max-width: 640px; height: auto; display: block; margin: 0 auto;" />
              </div>`
            : ''
        }

        <div style="padding: 28px 24px; background: #ffffff; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0; color: #0f172a;">
            Hello <strong>${displayName}</strong>${companyLabel},
          </p>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #334155;">
            This festive season, accelerate your international sourcing and verified export reach with the <strong>Trade Heaven Diwali Maha Utsav</strong> celebration! We are delighted to extend an exclusive client privilege to your corporate account:
          </p>

          <div style="background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); color: #ffffff; border: 2px solid #f59e0b; border-radius: 14px; padding: 22px; text-align: center; margin: 0 0 22px 0;">
            <div style="font-size: 28px; font-weight: 900; color: #fde047; letter-spacing: 1px; margin-bottom: 6px;">
              FLAT 10% OFF
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
              ON ALL SUBSCRIPTION &amp; MEMBERSHIP PLANS
            </div>
            <div style="display: inline-block; background: #0f172a; border: 1.5px dashed #fbbf24; border-radius: 8px; padding: 10px 20px; font-family: monospace; font-size: 18px; font-weight: 900; color: #fde047; letter-spacing: 2px;">
              Use Promo Code: DIWALI10
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://www.tradeheaven.net" style="display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; letter-spacing: 0.5px; text-transform: uppercase;">
              Claim 10% OFF at www.tradeheaven.net →
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 22px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
            Dispatched via <strong>${this.senderAddress}</strong> • Need help upgrading or applying promo code <strong>DIWALI10</strong>? Contact Trade Heaven Support on WhatsApp at <strong>${this.whatsappSupportNumber}</strong>.
          </p>
        </div>
      </div>
    `;

    const transporter = this.createPrimaryTransporter();
    const attachments: nodemailer.SendMailOptions['attachments'] = hasBannerFile
      ? [
          {
            filename: 'TradeHeaven-Diwali-Maha-Utsav-10-Off.png',
            path: bannerFilePath,
            cid: bannerCid
          }
        ]
      : undefined;

    return await serverDeliveryQueueManager.enqueueSingle(
      cleanEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject,
        text: textBody,
        html: htmlBody,
        attachments
      },
      transporter || undefined
    );
  }

  /**
   * Sends the Diwali Maha Utsav offer email to a list of existing clients as strictly serialized
   * single-recipient messages (enforcing the 2-second minimum delay between consecutive emails).
   */
  public async sendDiwaliOfferCampaignToClients(
    clients: Array<{ email: string; name?: string; companyName?: string; tier?: string }>
  ): Promise<SerializedDeliveryReceipt[]> {
    const seen = new Set<string>();
    const uniqueClients: Array<{ email: string; name?: string; companyName?: string; tier?: string }> = [];

    for (const c of clients) {
      const norm = normalizeRecipientEmail(c.email);
      if (norm && norm.includes('@') && !seen.has(norm)) {
        seen.add(norm);
        uniqueClients.push({ ...c, email: norm });
      }
    }

    const promises = uniqueClients.map((client) => this.sendDiwaliOfferEmailToClient(client));
    return await Promise.all(promises);
  }
}

export const automatedSmtpService = new AutomatedSmtpService();


