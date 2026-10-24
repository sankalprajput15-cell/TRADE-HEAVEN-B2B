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
    const host = (process.env.NOREPLY_SMTP_HOST || 'tradeheaven.net').trim();
    const port = Number(process.env.NOREPLY_SMTP_PORT || 465);
    const user = (process.env.NOREPLY_SMTP_USER || 'noreply@tradeheaven.net').trim();
    const pass = (process.env.NOREPLY_SMTP_PASS || '').trim();

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      name: 'tradeheaven.net',
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
  public readonly replyToAddress = 'help@tradeheaven.net';
  public readonly whatsappSupportNumber = '+91 8532934479';
  public readonly remoteMtaGatewayUrl = 'https://tradeheaven.net/api.php';

  // Deduplication cache to prevent accidental double-dispatches within a 5-second window
  private recentDispatches = new Map<string, { timestamp: number; result: SmtpDispatchResult }>();

  /**
   * Use verified corporate SMTP (tradeheaven.net:465 • noreply@tradeheaven.net) with DKIM signing.
   */
  private getPrimarySmtpCredentials() {
    const host = (process.env.NOREPLY_SMTP_HOST || 'tradeheaven.net').trim();
    const port = Number(process.env.NOREPLY_SMTP_PORT || 465);
    const user = (process.env.NOREPLY_SMTP_USER || this.senderAddress).trim();
    const pass = (process.env.NOREPLY_SMTP_PASS || '').trim();
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
      name: 'tradeheaven.net',
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

    const subject = `Your Trade Heaven Password Reset Code: ${finalOtpCode}`;

    const textBody = [
      `TRADE HEAVEN AUTOMATED SECURITY`,
      `Password Reset Verification Code`,
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff;">
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #34d399; text-transform: uppercase; margin-bottom: 8px;">
            TRADE HEAVEN AUTOMATED SECURITY
          </div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
            Password Reset Verification Code
          </h2>
        </div>
        <div style="padding: 28px 24px; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; color: #0f172a; margin: 0 0 14px 0;">Hello <strong>${displayName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
            Use the 6-digit verification code (OTP) below to reset the password for your Trade Heaven corporate account (<strong>${cleanEmail}</strong>):
          </p>
          <div style="background: #eff6ff; color: #1e40af; padding: 18px; border-radius: 12px; font-size: 32px; font-weight: 900; font-family: monospace; text-align: center; letter-spacing: 8px; margin: 20px 0; border: 2px solid #3b82f6;">
            ${finalOtpCode}
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;">
            Valid for ${expiryMinutes} minutes • Dispatched via <strong>${this.senderAddress}</strong> • Reply to <strong>${this.replyToAddress}</strong> or WhatsApp <strong>${this.whatsappSupportNumber}</strong>.
          </p>
        </div>
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

    const optimizedBannerPath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'diwali-offer-banner-mail.jpg'
    );
    const fallbackBannerPath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'Gemini_Generated_Image_obbsb1obbsb1obbs-clean_264b6c61.png'
    );
    const bannerFilePath = fs.existsSync(optimizedBannerPath) ? optimizedBannerPath : fallbackBannerPath;
    const hasBannerFile = fs.existsSync(bannerFilePath);
    const bannerCid = 'diwali-maha-utsav-banner@tradeheaven.net';

    const subject = `Your Trade Heaven VIP Business Plan Proposal — Diwali Maha Utsav (Code: DIWALI10)`;

    const textBody = [
      `TRADE HEAVEN AUTOMATED SECURITY`,
      `VIP Business Plan (VIP ELITE) — Exclusive Membership Proposal`,
      ``,
      `Hello ${displayName}${companyLabel},`,
      ``,
      `Here are the complete details for the Trade Heaven VIP Business Plan (VIP ELITE) tailored for your corporate account (${cleanEmail}):`,
      ``,
      `VIP BUSINESS PLAN (VIP ELITE) PRICING:`,
      `• Standard Annual Membership: $6,100 USD / Year ($610 / Month)`,
      `• Diwali Maha Utsav 10% OFF Price (Code: DIWALI10): $5,490 USD / Year (Save $610 USD)`,
      ``,
      `INCLUDED VIP BUSINESS PLAN DELIVERABLES:`,
      `1. Verified & Genuine Orders:`,
      `   • 60+ Verified & Genuine Orders / Month + Priority Escrow Protection`,
      `2. Catalog & Priority Listings:`,
      `   • Dedicated Catalogue Page (200+ Products & Custom Flipbook)`,
      `   • 100 Ready to Ship Listings`,
      `   • Top Priority Marketplace Listings & Spotlight`,
      `   • 4 Premium Product Banners & Spotlight Ads`,
      `3. Website, Domain & Security:`,
      `   • Business Website (Dynamic / E-commerce Corporate Website)`,
      `   • Custom Domain and Hosting Services (High Speed CDN)`,
      `   • Advanced SSL (Secure Socket Layer) & DDoS Protection`,
      `   • Multi-Language Translator Widget`,
      `4. Trade Intelligence, Direct Funds & VIP Support:`,
      `   • Enable Funds Receiving Option from Buyers Directly on Site`,
      `   • Trade Analyst Data & Comprehensive Customs Reports`,
      `   • Global Trade Events VIP Delegation Access`,
      `   • Senior International Export Manager & Dedicated Account Manager`,
      `   • 24/7 VIP Working Support`,
      ``,
      `Activation Code: DIWALI10`,
      `Portal: https://www.tradeheaven.net`,
      ``,
      `Dispatched via ${this.senderAddress} • Reply to ${this.replyToAddress} or WhatsApp ${this.whatsappSupportNumber}.`
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff;">
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #34d399; text-transform: uppercase; margin-bottom: 8px;">
            TRADE HEAVEN AUTOMATED SECURITY
          </div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
            VIP Business Plan (VIP ELITE)
          </h2>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
            Exclusive Corporate Membership Proposal • Diwali Maha Utsav Privilege
          </p>
        </div>

        ${
          hasBannerFile
            ? `<div style="background: #0f172a; text-align: center; border-top: 1px solid #1e293b;">
                <img src="cid:${bannerCid}" alt="Trade Heaven VIP Business Plan - Code DIWALI10" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto;" />
              </div>`
            : ''
        }

        <div style="padding: 28px 24px; background: #ffffff; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0; color: #0f172a;">
            Hello <strong>${displayName}</strong>${companyLabel},
          </p>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #334155;">
            Below are the exclusive deliverables and Diwali Maha Utsav pricing for the <strong>Trade Heaven VIP Business Plan (VIP ELITE)</strong> for your corporate account (<strong>${cleanEmail}</strong>):
          </p>

          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 22px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
              VIP BUSINESS PLAN • ANNUAL MEMBERSHIP
            </div>
            <div style="font-size: 14px; color: #64748b; text-decoration: line-through; margin-bottom: 4px;">
              Standard Annual Rate: $6,100 USD / Year
            </div>
            <div style="font-size: 30px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; margin-bottom: 6px;">
              $5,490 USD <span style="font-size: 14px; font-weight: 700; color: #1e40af;">/ Year</span>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 12px;">
              Instant 10% Savings ($610 USD OFF) with Code: DIWALI10
            </div>
            <div style="display: inline-block; background: #0f172a; color: #fde047; padding: 10px 22px; border-radius: 8px; font-family: monospace; font-size: 20px; font-weight: 900; letter-spacing: 4px;">
              DIWALI10
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              VIP Business Plan Deliverables Included:
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #059669; font-weight: 900;">✓</td>
                <td style="padding: 6px 0;"><strong>60+ Verified &amp; Genuine Orders / Month</strong> + Priority Escrow Protection</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; color: #059669; font-weight: 900;">✓</td>
                <td style="padding: 6px 0;"><strong>Dedicated Catalogue Page</strong> (200+ Products, Custom Flipbook &amp; 100 Ready-to-Ship Listings)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; color: #059669; font-weight: 900;">✓</td>
                <td style="padding: 6px 0;"><strong>Top Priority Marketplace Listings</strong> + 4 Premium Product Banners &amp; Spotlight Ads</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; color: #059669; font-weight: 900;">✓</td>
                <td style="padding: 6px 0;"><strong>Dynamic E-Commerce Corporate Website</strong> + Custom Domain, High-Speed CDN Hosting &amp; Advanced SSL</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; color: #059669; font-weight: 900;">✓</td>
                <td style="padding: 6px 0;"><strong>Direct Buyer Funds Receiving Option</strong> Enabled Directly on Site</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; color: #059669; font-weight: 900;">✓</td>
                <td style="padding: 6px 0;"><strong>Senior International Export Manager</strong>, Trade Analyst Customs Reports, VIP Trade Events Pass &amp; 24/7 VIP Support</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 22px 0;">
            <a href="https://www.tradeheaven.net" style="display: inline-block; background: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px;">
              Activate VIP Business Plan at www.tradeheaven.net
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;">
            Valid for your corporate account • Dispatched via <strong>${this.senderAddress}</strong> • Reply to <strong>${this.replyToAddress}</strong> or WhatsApp <strong>${this.whatsappSupportNumber}</strong>.
          </p>
        </div>
      </div>
    `;

    const transporter = this.createPrimaryTransporter();
    const attachments: nodemailer.SendMailOptions['attachments'] = hasBannerFile
      ? [
          {
            filename: 'TradeHeaven-Diwali-Maha-Utsav-10-Off.jpg',
            path: bannerFilePath,
            cid: bannerCid,
            contentDisposition: 'inline'
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


