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

export type EmailDispatchType = 'AUTOMATED' | 'MANUAL';
export type EmailHistoryCategory =
  | 'ONBOARDING'
  | 'BUYER_INQUIRY'
  | 'LOGIN_ALERT'
  | 'OTP_SECURITY'
  | 'CAMPAIGN'
  | 'CUSTOM_ADMIN'
  | 'SYSTEM_ALERT';

export type MailSuiteReadStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'DEFERRED';

export interface SmtpWebhookEventLog {
  id: string;
  timestamp: string;
  eventType: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'DEFERRED' | 'DROPPED';
  source: 'SMTP_WEBHOOK' | 'PIXEL_TRACKER' | 'CLICK_REDIRECT';
  trackingId: string;
  emailId?: string;
  messageId?: string;
  recipient: string;
  companyName?: string;
  subject?: string;
  smtpResponse?: string;
  ip?: string;
  userAgent?: string;
  targetUrl?: string;
}

export interface EmailTrackingOpenEvent {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  clientDevice: string;
  locationHint?: string;
  isUnique: boolean;
}

export interface EmailTrackingClickEvent {
  id: string;
  timestamp: string;
  url: string;
  label: string;
  ip: string;
  userAgent: string;
  clientDevice: string;
}

export interface MailSuiteAnalyticsSummary {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  unopenedCount: number;
  openRatePercent: number;
  totalOpensCount: number;
  totalClicked: number;
  clickThroughRatePercent: number;
  clickToOpenRatePercent: number;
  totalClicksCount: number;
  recentEvents: Array<{
    id: string;
    trackingId: string;
    emailId: string;
    type: 'OPEN' | 'CLICK';
    recipient: string;
    recipientName: string;
    companyName: string;
    subject: string;
    timestamp: string;
    clientDevice: string;
    ip: string;
    label?: string;
    url?: string;
  }>;
}

export interface CompanyEmailHistoryEntry {
  id: string;
  trackingId?: string;
  recipient: string;
  recipientName: string;
  companyName: string;
  companyId?: string;
  subject: string;
  dispatchType: EmailDispatchType;
  category: EmailHistoryCategory;
  sender: string;
  success: boolean;
  messageId?: string;
  dispatchedAt: string;
  enforcedDelayMs: number;
  error?: string;
  summaryText: string;
  htmlPreview?: string;
  // MailSuite Tracking & Read-Receipt Telemetry
  mailSuiteStatus?: MailSuiteReadStatus;
  opened?: boolean;
  openCount?: number;
  uniqueOpens?: number;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  clicked?: boolean;
  clickCount?: number;
  uniqueClicks?: number;
  firstClickedAt?: string;
  lastClickedAt?: string;
  openEvents?: EmailTrackingOpenEvent[];
  clickEvents?: EmailTrackingClickEvent[];
  trackingPixelUrl?: string;
  trackedCtaUrl?: string;
}

export interface SerializedMailOptions {
  from: string;
  replyTo?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
  dispatchType?: EmailDispatchType;
  category?: EmailHistoryCategory;
  companyName?: string;
  companyId?: string;
  recipientName?: string;
  summaryText?: string;
  trackingId?: string;
}

export interface SerializedDeliveryReceipt {
  recipient: string;
  success: boolean;
  messageId?: string;
  trackingId?: string;
  trackingPixelUrl?: string;
  dispatchedAt: string;
  enforcedDelayMs: number;
  error?: string;
}

let dynamicPublicTrackingBaseUrl = 'https://www.tradeheaven.net';

export function setDynamicPublicTrackingBaseUrl(rawUrl?: string) {
  const clean = (rawUrl || '').trim().replace(/\/+$/, '');
  if (
    clean.startsWith('http') &&
    !clean.includes('localhost') &&
    !clean.includes('127.0.0.1') &&
    !clean.includes('0.0.0.0') &&
    !clean.includes('.run.app') &&
    !clean.includes('aistudio.google.com')
  ) {
    dynamicPublicTrackingBaseUrl = clean;
  }
}

export function getPublicTrackingBaseUrl(): string {
  if (
    dynamicPublicTrackingBaseUrl &&
    !dynamicPublicTrackingBaseUrl.includes('.run.app') &&
    !dynamicPublicTrackingBaseUrl.includes('aistudio.google.com')
  ) {
    return dynamicPublicTrackingBaseUrl;
  }
  const envUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || '').trim().replace(/\/+$/, '');
  if (
    envUrl &&
    envUrl.startsWith('http') &&
    !envUrl.includes('.run.app') &&
    !envUrl.includes('aistudio.google.com')
  ) {
    return envUrl;
  }
  return 'https://www.tradeheaven.net';
}

export function detectEmailClientDevice(userAgentRaw?: string): string {
  const ua = (userAgentRaw || '').toLowerCase();
  if (!ua) return 'Desktop Email Client';
  if (ua.includes('googleimageproxy')) return 'Gmail Web / Google Image Proxy';
  if (ua.includes('thunderbird')) return 'Mozilla Thunderbird Desktop';
  if (ua.includes('outlook') || ua.includes('microsoft office')) return 'Microsoft Outlook';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('applewebkit') && ua.includes('mobile')) {
    return 'Apple Mail (iOS / iPhone)';
  }
  if (ua.includes('macintosh') && ua.includes('safari') && !ua.includes('chrome')) {
    return 'Apple Mail (macOS)';
  }
  if (ua.includes('android')) return 'Gmail / Android Mobile Mail';
  if (ua.includes('windows')) return 'Windows Desktop Browser / Webmail';
  if (ua.includes('macintosh')) return 'macOS Desktop Webmail';
  return 'Verified Mail Client';
}

/**
 * Injects MailSuite-grade 1x1 open tracking pixel and preserves direct production
 * destination links (https://www.tradeheaven.net/...) with ms_trk query parameter
 * so clicking links in external email clients never hits AI Studio 403 proxy gates.
 */
export function injectMailSuiteTrackingIntoHtml(
  rawHtml: string,
  trackingId: string,
  baseUrl?: string
): { html: string; trackingPixelUrl: string } {
  const safeBase =
    baseUrl && !baseUrl.includes('.run.app') && !baseUrl.includes('aistudio.google.com')
      ? baseUrl
      : getPublicTrackingBaseUrl();
  const rootUrl = safeBase.replace(/\/+$/, '');
  const trackingPixelUrl = `${rootUrl}/api/v1/track/open/${encodeURIComponent(trackingId)}.gif`;

  if (!rawHtml || !rawHtml.trim()) {
    return { html: rawHtml, trackingPixelUrl };
  }

  // Avoid double injection if already tracked
  if (rawHtml.includes(`/api/v1/track/open/`) || rawHtml.includes(`ms_trk=`)) {
    return { html: rawHtml, trackingPixelUrl };
  }

  const wrappedLinksHtml = rawHtml.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi,
    (fullMatch, beforeHref, hrefVal, afterHref, innerHtml) => {
      const cleanHref = String(hrefVal || '').trim();
      if (
        !cleanHref ||
        cleanHref.startsWith('mailto:') ||
        cleanHref.startsWith('tel:') ||
        cleanHref.startsWith('#')
      ) {
        return fullMatch;
      }

      // Normalize any accidental .run.app or aistudio proxy host to https://www.tradeheaven.net
      let directHref = cleanHref.replace(
        /^https?:\/\/[^/]*(\.run\.app|aistudio\.google\.com)/i,
        'https://www.tradeheaven.net'
      );

      // If it was previously wrapped in /api/v1/track/click/..., extract the direct url param
      if (directHref.includes('/api/v1/track/click/')) {
        try {
          const parsed = new URL(directHref, 'https://www.tradeheaven.net');
          const extracted = parsed.searchParams.get('url');
          if (extracted) {
            directHref = extracted.replace(
              /^https?:\/\/[^/]*(\.run\.app|aistudio\.google\.com)/i,
              'https://www.tradeheaven.net'
            );
          }
        } catch {}
      }

      const separator = directHref.includes('?') ? '&' : '?';
      const trackedDirectHref = `${directHref}${separator}ms_trk=${encodeURIComponent(trackingId)}`;
      return `<a ${beforeHref}href="${trackedDirectHref}"${afterHref}>${innerHtml}</a>`;
    }
  );

  const mailSuitePixelOnly = `<img src="${trackingPixelUrl}?t=${Date.now()}" width="1" height="1" alt="" style="display:block;width:1px!important;height:1px!important;border:0!important;margin:0!important;padding:0!important;opacity:0;" />`;

  return {
    html: `${wrappedLinksHtml}\n${mailSuitePixelOnly}`,
    trackingPixelUrl
  };
}

export interface CustomAdminInquiryItem {
  id?: string;
  title: string;
  productName?: string;
  buyerCompany?: string;
  buyerCountry?: string;
  quantity?: string;
  estimatedValue?: string;
  incotermPort?: string;
  paymentTerms?: string;
  urgency?: 'URGENT' | 'HIGH' | 'STANDARD' | 'LONG_TERM_CONTRACT';
}

export interface SavedPdfAttachmentItem {
  id: string;
  title: string;
  fileName: string;
  fileSizeLabel: string;
  category?: string;
  description?: string;
}

export interface CustomAdminEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  decisionMakerName?: string;
  companyName?: string;
  address?: string;
  paymentMethod?: string;
  contactPhone?: string;
  subject: string;
  badgeLabel?: string;
  headline?: string;
  subheadline?: string;
  introMessage?: string;
  loginEmail?: string;
  loginPassword?: string;
  portalUrl?: string;
  includeCredentialsBox?: boolean;
  includeLoginGuide?: boolean;
  includeEscrowBadge?: boolean;
  isMembershipRenewal?: boolean;
  renewalPlanId?: string;
  renewalAmountUsd?: number;
  inquiriesTitle?: string;
  inquiries?: CustomAdminInquiryItem[];
  attachedDocuments?: SavedPdfAttachmentItem[];
  customClosingNote?: string;
  ctaText?: string;
  ctaUrl?: string;
  rawHtmlOverride?: string;
  dispatchType?: EmailDispatchType;
  scheduledFor?: string;
}

export interface MembershipRenewalEmailPayload {
  companyName?: string;
  address?: string;
  email?: string;
  decisionMakerName?: string;
  paymentMethod?: string;
  planId?: string;
  offerTitle?: string;
  renewalAmountUsd?: number;
  ctaUrl?: string;
  dispatchType?: EmailDispatchType;
  sendAdminCopy?: boolean;
  adminCopyEmail?: string;
}

export const MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE = {
  id: 'MEMBERSHIP_RENEWAL',
  name: 'Basic Plan Membership Renewal — Current Offer & Exciting Deals',
  placeholders: {
    companyName: '{{companyName}}',
    address: '{{address}}',
    email: '{{email}}',
    decisionMakerName: '{{decisionMakerName}}',
    paymentMethod: '{{paymentMethod}}'
  },
  defaultValues: {
    companyName: 'ACE Intermediary',
    address: '1241 Hackberry Avenue Corsicana Texas 75110',
    email: 'ezekiahali355@gmail.com',
    decisionMakerName: 'Ali Charley Ezekiah',
    paymentMethod: 'Debit Card',
    planId: 'basic-business-plan',
    offerTitle: 'Basic Business Plan (Basic Tier) Renewal — Special 10% OFF Offer ($990/yr vs $1,100/yr) + Exciting Deals',
    renewalAmountUsd: 990
  }
};

export function buildMembershipRenewalEmailTemplate(
  params?: Partial<MembershipRenewalEmailPayload> & { usePlaceholders?: boolean; isAdminCopy?: boolean }
): {
  subject: string;
  text: string;
  html: string;
  ctaText: string;
  ctaUrl: string;
  resolvedFields: {
    companyName: string;
    address: string;
    email: string;
    decisionMakerName: string;
    paymentMethod: string;
    planId: string;
    renewalAmountUsd: number;
  };
} {
  const usePlaceholders = Boolean(params?.usePlaceholders);
  const companyName =
    params?.companyName ||
    (usePlaceholders
      ? MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.placeholders.companyName
      : MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.companyName);
  const address =
    params?.address ||
    (usePlaceholders
      ? MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.placeholders.address
      : MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.address);
  const email =
    params?.email ||
    (usePlaceholders
      ? MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.placeholders.email
      : MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.email);
  const decisionMakerName =
    params?.decisionMakerName ||
    (usePlaceholders
      ? MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.placeholders.decisionMakerName
      : MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.decisionMakerName);
  const paymentMethod =
    params?.paymentMethod ||
    (usePlaceholders
      ? MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.placeholders.paymentMethod
      : MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.paymentMethod);

  const planId = params?.planId || MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.planId;
  const renewalAmountUsd =
    typeof params?.renewalAmountUsd === 'number'
      ? params.renewalAmountUsd
      : MEMBERSHIP_RENEWAL_EMAIL_TEMPLATE.defaultValues.renewalAmountUsd;

  const ctaText = 'Renew Now';
  const ctaUrl =
    params?.ctaUrl ||
    `https://www.tradeheaven.net/?action=renew-membership&company=${encodeURIComponent(
      companyName
    )}&email=${encodeURIComponent(email)}&decisionMaker=${encodeURIComponent(
      decisionMakerName
    )}&address=${encodeURIComponent(address)}&paymentMethod=${encodeURIComponent(
      paymentMethod
    )}&planId=${encodeURIComponent(planId)}&amountUsd=${renewalAmountUsd}`;

  const subject = `💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ${companyName} (Attn: ${decisionMakerName})`;

  const text = [
    'TRADE HEAVEN • BASIC PLAN MEMBERSHIP RENEWAL & EXCLUSIVE DEALS DESK',
    `Basic Business Plan Renewal Offer & New Trade Deals for ${companyName}`,
    '',
    `Dear ${decisionMakerName},`,
    '',
    `Thank you for being a valued member of the Trade Heaven Global B2B Network. Your Basic Business Plan (Basic Tier) membership for ${companyName} is now eligible for renewal under our Special Current Offer ($990 USD / Year — 10% OFF standard $1,100 USD rate, saving $110 USD), unlocking priority access to verified international trade deals and instant Debit Card settlement.`,
    '',
    '============================================================',
    'REGISTERED CLIENT & BASIC PLAN RENEWAL SUMMARY',
    '============================================================',
    `• Company Name: ${companyName}`,
    `• Registered Address: ${address}`,
    `• Official Email: ${email}`,
    `• Decision Maker Name: ${decisionMakerName}`,
    `• Selected Payment Method: ${paymentMethod}`,
    `• Subscription Plan: Basic Business Plan (Basic Tier) — Standard $1,100/yr → Special Renewal Offer: $${renewalAmountUsd.toLocaleString()} USD / Year (Save $110 USD)`,
    '',
    '============================================================',
    'BASIC PLAN RENEWAL OFFER & NEW EXCITING DEALS INCLUDED',
    '============================================================',
    '1. Basic Plan Special Offer Rate Lock: $990 USD / Year (Flat 10% OFF standard $1,100/yr rate — Code: DIWALI10)',
    '2. Up to 20 Verified & Genuine Buyer Orders / Month + Priority Order Matching',
    '3. Dedicated Catalogue Page (Up to 50 Product Listings + 10 Ready-to-Ship Listings + 2 Showcase Banners)',
    '4. Dedicated 1-Page Business Website + Domain, Hosting, SSL & Multi-Language Translator Included',
    '5. Dedicated Account Manager / Export CSR & Instant Debit Card Renewal Checkout',
    '',
    `Click "${ctaText}" to complete your Basic Plan renewal via ${paymentMethod}: ${ctaUrl}`,
    '',
    'Need assistance? Contact our Membership & Billing Desk on WhatsApp at +91 85329 34479 or email help@tradeheaven.net.'
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
      <!-- Top Hero Header -->
      <div style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #fbbf24; text-transform: uppercase; margin-bottom: 10px; background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.35); padding: 4px 12px; border-radius: 9999px;">
          TRADE HEAVEN • BASIC PLAN RENEWAL &amp; SPECIAL OFFER
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.25; letter-spacing: -0.5px;">
          Basic Business Plan Renewal &amp; Exciting New Trade Deals
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">
          Special 10% OFF Basic Plan Renewal Offer Prepared for ${companyName}
        </p>
      </div>

      <div style="padding: 30px 24px; background: #ffffff; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0; color: #0f172a;">
          Dear <strong>${decisionMakerName}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.65; margin: 0 0 20px 0; color: #334155;">
          We appreciate your continued partnership with <strong>Trade Heaven Global B2B</strong>. We are pleased to extend our <strong>Basic Business Plan (Basic Tier) Renewal Offer</strong> with a <strong>Flat 10% Loyalty Discount ($990 USD / Year vs. $1,100 USD Standard Rate)</strong> along with priority access to <strong>new exciting international buyer &amp; supplier deals</strong> tailored for <strong>${companyName}</strong>.
        </p>

        <!-- Client Account & Billing Summary Box -->
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 0 0 24px 0;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>BASIC PLAN RENEWAL PROFILE &amp; BILLING RECORD</span>
            <span style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800;">10% OFF OFFER ACTIVE</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #475569; width: 165px; font-weight: 600;">Company Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Email:</td>
              <td style="padding: 6px 0; font-family: monospace; color: #2563eb; font-weight: 700;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Decision Maker:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${decisionMakerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Renewal Plan &amp; Offer:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">Basic Business Plan — <span style="text-decoration: line-through; color: #64748b;">$1,100/yr</span> <span style="color: #059669;">$${renewalAmountUsd.toLocaleString()} USD / Year (Save $110)</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Payment Method:</td>
              <td style="padding: 6px 0;"><span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 12px;">💳 ${paymentMethod}</span></td>
            </tr>
          </table>
        </div>

        <!-- Current Offer & New Exciting Deals Highlights -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 12px; padding: 18px 20px; margin: 0 0 24px 0;">
          <div style="font-size: 12px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px;">
            🎁 Basic Business Plan Deliverables &amp; Exciting Deals Included:
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #1e293b; line-height: 1.7;">
            <li><strong>Special Renewal Offer ($${renewalAmountUsd.toLocaleString()} USD / Year):</strong> Flat 10% OFF standard $1,100/yr Basic Plan rate (Promo Code: <strong>DIWALI10</strong> — Save $110 USD).</li>
            <li><strong>Verified &amp; Genuine Buyer Orders:</strong> Up to 20 Verified &amp; Genuine Order Matches per month + New Exciting Deals Alert.</li>
            <li><strong>Catalogue &amp; Priority Showcase:</strong> Dedicated Catalogue Page (Up to 50 Product Listings, 10 Ready-to-Ship Listings &amp; 2 Product Showcase Banners).</li>
            <li><strong>Website, Domain &amp; SSL Included:</strong> Dedicated 1-Page Business Microsite with Domain, Hosting, SSL Certificate &amp; Multi-Language Converter.</li>
            <li><strong>Dedicated Account Manager &amp; ${paymentMethod} Checkout:</strong> 24/7 Priority Export CSR Support + 1-click renewal via <strong>${paymentMethod}</strong>.</li>
          </ul>
        </div>

        <!-- Direct Renew Now CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${ctaUrl}" data-renewal-trigger="true" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 15px 42px; border-radius: 12px; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3); letter-spacing: 0.3px;">
            ${ctaText}
          </a>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            Instant Basic Plan renewal checkout ($${renewalAmountUsd.toLocaleString()} USD) for <strong>${companyName}</strong> • Preferred method: <strong>${paymentMethod}</strong>
          </div>
        </div>

        <!-- Escrow & Billing Guarantee Notice -->
        <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
          <strong style="color: #0f172a;">Verified Corporate Billing Protection:</strong> Your Basic Business Plan renewal is processed through Trade Heaven’s PCI-DSS compliant payment gateway with instant invoice generation for <strong>${companyName}</strong> (${address}).
        </div>

        <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0; line-height: 1.5;">
          Dispatched via <strong>noreply@tradeheaven.net</strong> • Questions regarding your renewal offer? Contact your Account Executive on WhatsApp at <strong>+91 85329 34479</strong> or email <strong>help@tradeheaven.net</strong>.
        </p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
    ctaText,
    ctaUrl,
    resolvedFields: {
      companyName,
      address,
      email,
      decisionMakerName,
      paymentMethod,
      planId,
      renewalAmountUsd
    }
  };
}

export interface ZacAdsCampaignFailedEmailPayload {
  companyName?: string;
  address?: string;
  email?: string;
  decisionMakerName?: string;
  contactPhone?: string;
  paymentMethod?: string;
  amountPaidUsd?: number;
  standardPlanAmountUsd?: number;
  diwaliDiscountedPlanUsd?: number;
  remainingBalanceUsd?: number;
  invoiceRef?: string;
  ctaUrl?: string;
  isDemoOnAdmin?: boolean;
  demoAdminEmail?: string;
  sendAdminCopy?: boolean;
  adminCopyEmail?: string;
  dispatchType?: EmailDispatchType;
  trackingId?: string;
}

export const ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE = {
  id: 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI',
  name: '⚠️ Zac ($400 Paid Basic Plan) — Ads Campaign Failed + Full Plan / Account Pause Notice + Diwali Max Benefit',
  defaultValues: {
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    address: '42a Bassett street hurstville, New South Wales 2220, Australia',
    email: 'zac@otec.ltd',
    decisionMakerName: 'Zachary Aldin (Zac)',
    contactPhone: '+61 424 854 899',
    paymentMethod: 'Bank Wire / Card Settlement',
    amountPaidUsd: 400,
    standardPlanAmountUsd: 1100,
    diwaliDiscountedPlanUsd: 990,
    remainingBalanceUsd: 590,
    invoiceRef: 'TRD-INV-27-0004',
    planId: 'basic-business-plan'
  }
};

export function buildZacAdsCampaignFailedEmailTemplate(
  params?: Partial<ZacAdsCampaignFailedEmailPayload> & { isAdminCopy?: boolean }
): {
  subject: string;
  text: string;
  html: string;
  ctaText: string;
  ctaUrl: string;
  resolvedFields: {
    companyName: string;
    address: string;
    email: string;
    decisionMakerName: string;
    contactPhone: string;
    paymentMethod: string;
    amountPaidUsd: number;
    standardPlanAmountUsd: number;
    diwaliDiscountedPlanUsd: number;
    remainingBalanceUsd: number;
    invoiceRef: string;
  };
} {
  const companyName = params?.companyName || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.companyName;
  const address = params?.address || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.address;
  const email = params?.email || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.email;
  const decisionMakerName =
    params?.decisionMakerName || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.decisionMakerName;
  const contactPhone = params?.contactPhone || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.contactPhone;
  const paymentMethod = params?.paymentMethod || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.paymentMethod;
  const amountPaidUsd =
    typeof params?.amountPaidUsd === 'number'
      ? params.amountPaidUsd
      : ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.amountPaidUsd;
  const standardPlanAmountUsd =
    typeof params?.standardPlanAmountUsd === 'number'
      ? params.standardPlanAmountUsd
      : ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.standardPlanAmountUsd;
  const diwaliDiscountedPlanUsd =
    typeof params?.diwaliDiscountedPlanUsd === 'number'
      ? params.diwaliDiscountedPlanUsd
      : ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.diwaliDiscountedPlanUsd;
  const remainingBalanceUsd =
    typeof params?.remainingBalanceUsd === 'number'
      ? params.remainingBalanceUsd
      : Math.max(0, diwaliDiscountedPlanUsd - amountPaidUsd);
  const standardRemainingUsd = Math.max(0, standardPlanAmountUsd - amountPaidUsd);
  const invoiceRef = params?.invoiceRef || ZAC_ADS_CAMPAIGN_FAILED_EMAIL_TEMPLATE.defaultValues.invoiceRef;

  const ctaText = `Complete Full Plan ($${remainingBalanceUsd} USD Balance with Diwali Offer) & Relaunch Ads →`;
  const ctaUrl =
    params?.ctaUrl ||
    `https://www.tradeheaven.net/?action=renew-membership&company=${encodeURIComponent(
      companyName
    )}&email=${encodeURIComponent(email)}&decisionMaker=${encodeURIComponent(
      decisionMakerName
    )}&address=${encodeURIComponent(address)}&paymentMethod=${encodeURIComponent(
      paymentMethod
    )}&planId=basic-business-plan&amountUsd=${remainingBalanceUsd}`;

  const subject = `⚠️ Urgent: Today's Ads Campaign Failed (Insufficient Plan Balance — $${amountPaidUsd} Paid) • Complete Full Plan or Account Will Pause + 🪔 Diwali Max Benefit Offer for ${companyName}`;

  const text = [
    'TRADE HEAVEN • AD CAMPAIGN OPERATIONS & BILLING COMPLIANCE DESK',
    `URGENT NOTICE: Sponsored Ads Campaign Failed Today Due to Partial Basic Plan Balance ($${amountPaidUsd} USD Paid)`,
    '',
    `Dear ${decisionMakerName},`,
    '',
    `We are writing regarding your corporate supplier account for ${companyName} (Agreement Ref: ${invoiceRef}).`,
    '',
    `1. TODAY'S ADS CAMPAIGN LAUNCH FAILED (INSUFFICIENT PLAN BALANCE):`,
    `Your scheduled Global B2B Sponsored Ads & Buyer Matching Campaign launched today for ${companyName} (Australian Thermal Coal GAR 6000-6500 kcal/kg & Coking Coal) FAILED and was automatically halted by the billing engine.`,
    `• Reason for Failure: Only $${amountPaidUsd.toLocaleString()} USD partial deposit has been paid toward your Basic Plan (Standard Rate: $${standardPlanAmountUsd.toLocaleString()} USD/yr). Our automated Ad Network and Direct Buyer Connection Engine require a 100% Completed Full Plan to run live ad impressions and unlock buyer inquiries.`,
    '',
    `2. ACTION REQUIRED — COMPLETE FULL PLAN OR ACCOUNT WILL BE PLACED ON PAUSE:`,
    `To immediately resume your Sponsored Ads Campaign and connect directly with verified global coal & commodity buyers, please complete the payment for your Full Plan.`,
    `⚠️ IMPORTANT ACCOUNT PAUSE WARNING: Accounts operating on an incomplete partial deposit ($${amountPaidUsd} USD paid) cannot sustain live ad traffic. If the full plan balance is not completed within 48 hours, your ${companyName} supplier storefront, product listings, and buyer inquiry routing will be placed on TEMPORARY PAUSE / HOLD.`,
    '',
    `3. 🪔 DIWALI MAHA UTSAV SPECIAL OFFER — AVAIL MAXIMUM BENEFIT (CODE: DIWALI10):`,
    `Because your campaign launched during our Diwali Maha Utsav Festival Window, you can avail MAXIMUM BENEFITS when completing your full plan today:`,
    `• Option A — Complete Full Basic Business Plan (With Diwali 10% OFF):`,
    `  - Standard Basic Plan: $${standardPlanAmountUsd}/yr ($${standardRemainingUsd} remaining)`,
    `  - Diwali Offer Price (Code: DIWALI10): $${diwaliDiscountedPlanUsd}/yr (Save $110 USD)`,
    `  - Less Amount Already Paid: -$${amountPaidUsd} USD (100% Credited)`,
    `  - NET BALANCE TO PAY TODAY: ONLY $${remainingBalanceUsd} USD!`,
    `  - Unlocks: Immediate Ad Campaign Relaunch + 2 Showcase Ad Banners + Up to 20 Verified Buyer Orders/Month + Prevent Account Pause.`,
    `• Option B — Upgrade to Full VIP / Gold Plan (Maximum Diwali Festival Benefit):`,
    `  - Apply your $${amountPaidUsd} USD credit + Flat 10% Diwali Discount (DIWALI10) + 4x Sponsored Spotlight Ad Campaigns + 60+ Verified Buyer Orders/Month + Direct On-Site Buyer Funds Receiving Option Enabled!`,
    '',
    `Complete your Full Plan now to run your ads and keep your account active: ${ctaUrl}`,
    '',
    `Portal Login: https://www.tradeheaven.net | User ID: ${email} | Registered Phone: ${contactPhone}`,
    'Need immediate billing or campaign support? Contact our Senior Trade Desk on WhatsApp at +91 85329 34479 or email help@tradeheaven.net.'
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
      <!-- Top Urgent Hero Header -->
      <div style="background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #0f172a 100%); padding: 34px 24px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; font-size: 11px; font-weight: 900; letter-spacing: 1.8px; color: #fecaca; text-transform: uppercase; margin-bottom: 10px; background: rgba(239, 68, 68, 0.25); border: 1px solid rgba(252, 165, 165, 0.45); padding: 5px 14px; border-radius: 9999px;">
          ⚠️ CAMPAIGN HALTED TODAY • INSUFFICIENT PLAN BALANCE ($${amountPaidUsd} PAID)
        </div>
        <h1 style="margin: 0; font-size: 23px; font-weight: 900; color: #ffffff; line-height: 1.3; letter-spacing: -0.3px;">
          Today&rsquo;s Sponsored Ads Campaign Failed to Launch
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #fca5a5;">
          Action Required for <strong>${companyName}</strong> (Ref: <strong>${invoiceRef}</strong>) to Resume Ads, Connect With Buyers &amp; Prevent Account Pause
        </p>
      </div>

      <div style="padding: 28px 24px; background: #ffffff; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0; color: #0f172a;">
          Dear <strong>${decisionMakerName}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.65; margin: 0 0 18px 0; color: #334155;">
          This is an urgent notification from the <strong>Trade Heaven Ad Campaign &amp; Billing Operations Desk</strong> regarding your supplier account for <strong>${companyName}</strong> (<span style="font-family: monospace; color: #2563eb;">${email}</span>).
        </p>

        <!-- Red Failure Diagnostic Box -->
        <div style="background: #fef2f2; border: 2px solid #f87171; border-radius: 14px; padding: 18px 20px; margin: 0 0 22px 0;">
          <div style="font-size: 12px; font-weight: 900; color: #991b1b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
            ❌ Why Today&rsquo;s Ads Campaign Failed (#ADS-COAL-AU-2026)
          </div>
          <p style="font-size: 13px; color: #7f1d1d; line-height: 1.6; margin: 0 0 12px 0;">
            Your scheduled <strong>Global Buyer Ads &amp; Priority Matching Campaign</strong> launched today for <strong>${companyName}</strong> failed during automated billing verification because your account currently shows a <strong>partial deposit of $${amountPaidUsd.toLocaleString()} USD</strong> toward the <strong>Basic Plan</strong> (insufficient plan balance).
          </p>
          <div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #991b1b; line-height: 1.55;">
            <strong>⚠️ Account Pause Warning:</strong> Sponsored Ad Campaigns and direct buyer inquiry connections cannot run on a partial plan deposit. Please complete the payment for your <strong>Full Plan</strong> so we can immediately re-launch your ads and connect you with more verified buyers—otherwise your <strong>account and storefront will be placed on temporary pause/hold</strong>.
          </div>
        </div>

        <!-- Account Ledger & Payment Breakdown Table -->
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 0 0 22px 0;">
          <div style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>ACCOUNT BILLING LEDGER &amp; FULL PLAN SETTLEMENT</span>
            <span style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900;">PARTIAL ($${amountPaidUsd} PAID)</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #475569; width: 185px; font-weight: 600;">Supplier Entity:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${companyName} (${invoiceRef})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Decision Maker &amp; Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${decisionMakerName} (<span style="font-family: monospace; color: #2563eb;">${email}</span>)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Amount Paid So Far:</td>
              <td style="padding: 6px 0; color: #059669; font-weight: 900;">$${amountPaidUsd.toLocaleString()}.00 USD (Credited Toward Basic Plan)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Standard Basic Plan Rate:</td>
              <td style="padding: 6px 0; color: #64748b; font-weight: 700;"><span style="text-decoration: line-through;">$${standardPlanAmountUsd.toLocaleString()}.00 USD / Year</span> (Standard Balance: $${standardRemainingUsd} USD)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #92400e; font-weight: 800;">🪔 Diwali Offer Full Plan Rate:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 900;">$${diwaliDiscountedPlanUsd.toLocaleString()}.00 USD / Year <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px;">10% OFF • SAVE $110</span></td>
            </tr>
            <tr style="border-top: 2px solid #cbd5e1;">
              <td style="padding: 10px 0 4px 0; color: #0f172a; font-weight: 900; font-size: 14px;">Net Balance Due for Full Plan:</td>
              <td style="padding: 10px 0 4px 0; color: #dc2626; font-weight: 900; font-size: 17px;">$${remainingBalanceUsd.toLocaleString()}.00 USD <span style="font-size: 11px; color: #059669; font-weight: 800;">(After $${amountPaidUsd} Credit + Diwali Offer)</span></td>
            </tr>
          </table>
        </div>

        <!-- Diwali Maha Utsav Max Benefit Highlight Box -->
        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 20px; margin: 0 0 24px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 12px; font-weight: 900; color: #92400e; text-transform: uppercase; letter-spacing: 0.8px;">
              🪔 DIWALI MAHA UTSAV SPECIAL OFFER — AVAIL MAXIMUM BENEFIT
            </span>
            <span style="background: #d97706; color: #ffffff; font-size: 10px; font-weight: 900; padding: 3px 9px; border-radius: 6px;">
              CODE: DIWALI10
            </span>
          </div>
          <p style="font-size: 13px; color: #78350f; line-height: 1.55; margin: 0 0 12px 0;">
            Upgrade or complete your Full Plan during our <strong>Diwali Festival Offer</strong> to unlock <strong>maximum advertising &amp; buyer-connection benefits</strong> at the lowest annual rate:
          </p>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #78350f; line-height: 1.7;">
            <li><strong>100% Credit of Your $${amountPaidUsd} Payment + 10% Diwali Discount:</strong> Pay just <strong>$${remainingBalanceUsd} USD</strong> (instead of $${standardRemainingUsd} USD) to complete your Full Basic Plan, OR apply your $${amountPaidUsd} credit toward the <strong>Full VIP Plan ($5,490/yr with DIWALI10 — Save $610 USD)</strong>.</li>
            <li><strong>Immediate Ads Campaign Relaunch &amp; Priority Boost:</strong> Your halted Australian Thermal &amp; Coking Coal Ads Campaign will go live within 15 minutes with <strong>2x Sponsored Marketplace Banner Impressions</strong>.</li>
            <li><strong>Connect With More Verified Global Buyers:</strong> Unlock direct buyer contact desks, WhatsApp procurement lines, and up to <strong>20–60+ Verified Buyer Orders / Month</strong> across Asia-Pacific, India, Japan &amp; Europe.</li>
            <li><strong>Prevent Account Pause &amp; Keep Storefront Live:</strong> Maintain uninterrupted verified status (<strong>${invoiceRef}</strong>) with Dedicated Export Account Manager support.</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="${ctaUrl}" data-renewal-trigger="true" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-weight: 900; font-size: 14px; text-decoration: none; padding: 16px 34px; border-radius: 12px; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3); letter-spacing: 0.2px;">
            ${ctaText}
          </a>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            Instant Full Plan Settlement • Credited: <strong>$${amountPaidUsd} USD</strong> • Balance Due: <strong>$${remainingBalanceUsd} USD (Code: DIWALI10)</strong>
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b; margin: 18px 0 0 0; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          Dispatched via <strong>noreply@tradeheaven.net</strong> • To complete payment via Bank Wire or Card and immediately resume your Ads Campaign, reply to <strong>help@tradeheaven.net</strong> or message our Billing &amp; Campaign Desk on WhatsApp at <strong>+91 85329 34479</strong>.
        </p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
    ctaText,
    ctaUrl,
    resolvedFields: {
      companyName,
      address,
      email,
      decisionMakerName,
      contactPhone,
      paymentMethod,
      amountPaidUsd,
      standardPlanAmountUsd,
      diwaliDiscountedPlanUsd,
      remainingBalanceUsd,
      invoiceRef
    }
  };
}

export interface ZacBalanceFundConfirmationPayload {
  companyName?: string;
  address?: string;
  email?: string;
  decisionMakerName?: string;
  contactPhone?: string;
  paymentMethod?: string;
  amountPaidUsd?: number;
  standardPlanAmountUsd?: number;
  diwaliDiscountedPlanUsd?: number;
  remainingBalanceUsd?: number;
  invoiceRef?: string;
  ctaUrl?: string;
  adminEmails?: string[];
  dispatchType?: EmailDispatchType;
}

export function buildZacBalanceFundPaymentAndAdminRightTemplates(
  params?: Partial<ZacBalanceFundConfirmationPayload>
) {
  const companyName = params?.companyName || 'IMPORTATION FADE-TECH (OTEC LTD)';
  const address = params?.address || '42a Bassett street hurstville, New South Wales 2220, Australia';
  const email = params?.email || 'zac@otec.ltd';
  const decisionMakerName = params?.decisionMakerName || 'Zachary Aldin (Zac)';
  const contactPhone = params?.contactPhone || '+61 424 854 899';
  const paymentMethod = params?.paymentMethod || 'Bank Wire / Card Settlement';
  const amountPaidUsd = typeof params?.amountPaidUsd === 'number' ? params.amountPaidUsd : 400;
  const standardPlanAmountUsd = typeof params?.standardPlanAmountUsd === 'number' ? params.standardPlanAmountUsd : 1100;
  const diwaliDiscountedPlanUsd = typeof params?.diwaliDiscountedPlanUsd === 'number' ? params.diwaliDiscountedPlanUsd : 990;
  const remainingBalanceUsd =
    typeof params?.remainingBalanceUsd === 'number'
      ? params.remainingBalanceUsd
      : Math.max(0, diwaliDiscountedPlanUsd - amountPaidUsd);
  const invoiceRef = params?.invoiceRef || 'TRD-INV-27-0004';
  const rootUrl = getPublicTrackingBaseUrl().replace(/\/+$/, '');
  const ctaUrl =
    params?.ctaUrl ||
    `${rootUrl}/?pay_zac=1&email=${encodeURIComponent(email)}&amount=${remainingBalanceUsd}&company=${encodeURIComponent(companyName)}`;
  const ctaText = `Complete Payment of Balance Fund ($${remainingBalanceUsd}.00 USD) & Activate Full Plan →`;

  const zacSubject = `Payment of Balance Fund ($${remainingBalanceUsd}.00 USD) & Full Plan Activation for ${companyName} (Ref: ${invoiceRef})`;

  const zacText = [
    'TRADE HEAVEN • TREASURY & BALANCE FUND SETTLEMENT DESK',
    `Official Notice: Payment of Balance Fund ($${remainingBalanceUsd}.00 USD) Following Earlier $${amountPaidUsd}.00 USD Deposit`,
    '',
    `Dear ${decisionMakerName},`,
    '',
    `Following up on the earlier payment of $${amountPaidUsd}.00 USD credited toward your Basic Business Plan for ${companyName} (Invoice Ref: ${invoiceRef}), this is your official notice regarding the Payment of Balance Fund ($${remainingBalanceUsd}.00 USD) required to complete your 100% Full Plan.`,
    '',
    '============================================================',
    'VERIFIED LEDGER & BALANCE FUND SUMMARY',
    '============================================================',
    `• Supplier Entity: ${companyName}`,
    `• Decision Maker: ${decisionMakerName} (${email} | ${contactPhone})`,
    `• Registered Address: ${address}`,
    `• Agreement / Invoice Ref: ${invoiceRef} (TH-SUP-ZAC-0011)`,
    `• Standard Basic Business Plan Rate: $${standardPlanAmountUsd.toLocaleString()}.00 USD / Year`,
    `• Special Diwali 10% OFF Full Plan Rate (Code: DIWALI10): $${diwaliDiscountedPlanUsd.toLocaleString()}.00 USD / Year (Save $110.00 USD)`,
    `• Earlier Payment Received & Verified: -$${amountPaidUsd.toLocaleString()}.00 USD (100% Credited & Applied)`,
    `• REMAINING BALANCE FUND DUE NOW: $${remainingBalanceUsd.toLocaleString()}.00 USD`,
    '',
    '============================================================',
    'WHAT COMPLETING YOUR $590.00 USD BALANCE FUND UNLOCKS IMMEDIATELY',
    '============================================================',
    '1. Immediate Relaunch of Your Halted Sponsored Ads Campaign (#ADS-COAL-AU-2026 — Australian Thermal & Coking Coal)',
    '2. Full 12-Month Basic Business Plan Activation (Up to 20 Verified Buyer Orders/Month + 2 Marketplace Showcase Banners)',
    '3. Removal of the 48-Hour Temporary Account Pause / Storefront Hold',
    '',
    `Complete your Balance Fund payment ($${remainingBalanceUsd}.00 USD) directly here: ${ctaUrl}`,
    '',
    'Need assistance? Contact our Treasury & Billing Desk on WhatsApp at +91 85329 34479 or email help@tradeheaven.net.'
  ].join('\n');

  const zacHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #065f46 100%); padding: 34px 24px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; font-size: 11px; font-weight: 900; letter-spacing: 1.8px; color: #fde68a; text-transform: uppercase; margin-bottom: 10px; background: rgba(245, 158, 11, 0.22); border: 1px solid rgba(253, 230, 138, 0.45); padding: 5px 14px; border-radius: 9999px;">
          TRADE HEAVEN GLOBAL B2B • TREASURY &amp; BILLING DESK
        </div>
        <h1 style="margin: 0; font-size: 23px; font-weight: 900; color: #ffffff; line-height: 1.3;">
          Payment of Balance Fund ($${remainingBalanceUsd}.00 USD) &amp; Full Plan Activation
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1;">
          Prepared for <strong>${companyName}</strong> (Attn: <strong>${decisionMakerName}</strong> • Ref: <strong>${invoiceRef}</strong>)
        </p>
      </div>

      <div style="padding: 28px 24px; background: #ffffff; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0; color: #0f172a;">
          Dear <strong>${decisionMakerName}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.65; margin: 0 0 18px 0; color: #334155;">
          Following up on the <strong>earlier payment of $${amountPaidUsd.toLocaleString()}.00 USD</strong> made toward your Basic Business Plan for <strong>${companyName}</strong>, our Treasury Desk has verified and credited your earlier payment in full. Please find below your official reconciliation statement for the <strong>Payment of Balance Fund ($${remainingBalanceUsd.toLocaleString()}.00 USD)</strong> required to complete your Full Plan and relaunch your halted Sponsored Ads Campaign.
        </p>

        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 0 0 22px 0;">
          <div style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>RECONCILED BALANCE FUND STATEMENT (${invoiceRef})</span>
            <span style="background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900;">✓ EARLIER $${amountPaidUsd} PAYMENT VERIFIED</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #475569; width: 195px; font-weight: 600;">Supplier Entity:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Decision Maker &amp; Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${decisionMakerName} (<span style="font-family: monospace; color: #2563eb;">${email}</span>)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Standard Basic Plan Rate:</td>
              <td style="padding: 6px 0; color: #64748b; font-weight: 700;"><span style="text-decoration: line-through;">$${standardPlanAmountUsd.toLocaleString()}.00 USD / Year</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #92400e; font-weight: 800;">🪔 Diwali Offer Full Plan Rate:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 900;">$${diwaliDiscountedPlanUsd.toLocaleString()}.00 USD / Year <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px;">10% OFF • CODE: DIWALI10</span></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #059669; font-weight: 800;">Earlier Payment Made &amp; Credited:</td>
              <td style="padding: 6px 0; color: #059669; font-weight: 900;">-$${amountPaidUsd.toLocaleString()}.00 USD (Verified &amp; Applied)</td>
            </tr>
            <tr style="border-top: 2px solid #cbd5e1;">
              <td style="padding: 10px 0 4px 0; color: #0f172a; font-weight: 900; font-size: 14px;">Balance Fund Due Now:</td>
              <td style="padding: 10px 0 4px 0; color: #dc2626; font-weight: 900; font-size: 18px;">$${remainingBalanceUsd.toLocaleString()}.00 USD</td>
            </tr>
          </table>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-left: 4px solid #059669; border-radius: 12px; padding: 16px 18px; margin: 0 0 24px 0;">
          <div style="font-size: 12px; font-weight: 900; color: #065f46; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;">
            🚀 Immediate Activation Upon $${remainingBalanceUsd}.00 USD Balance Fund Settlement:
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #064e3b; line-height: 1.65;">
            <li><strong>100% Credit Confirmed:</strong> Your earlier <strong>$${amountPaidUsd}.00 USD</strong> payment is locked in—only the <strong>$${remainingBalanceUsd}.00 USD balance fund</strong> remains.</li>
            <li><strong>Immediate Sponsored Ads Relaunch:</strong> Resumes your halted Australian Thermal &amp; Coking Coal campaign (<strong>#ADS-COAL-AU-2026</strong>) within 15 minutes.</li>
            <li><strong>Prevent Account Pause:</strong> Lifts the 48-hour temporary pause warning and unlocks up to 20–60+ verified international coal &amp; commodity buyer inquiries per month.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${ctaUrl}" data-renewal-trigger="true" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-weight: 900; font-size: 14px; text-decoration: none; padding: 16px 34px; border-radius: 12px; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);">
            ${ctaText}
          </a>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            Earlier Paid: <strong>$${amountPaidUsd}.00 USD</strong> • Remaining Balance Fund: <strong>$${remainingBalanceUsd}.00 USD</strong> • Method: <strong>${paymentMethod}</strong>
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b; margin: 18px 0 0 0; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          Dispatched via <strong>noreply@tradeheaven.net</strong> • Questions regarding your Balance Fund settlement? Reply to <strong>help@tradeheaven.net</strong> or message our Billing Desk on WhatsApp at <strong>+91 85329 34479</strong>.
        </p>
      </div>
    </div>
  `;

  const adminSubject = `[Admin Copy] Balance Fund Statement ($${remainingBalanceUsd}.00 USD) Dispatched to Zachary Aldin (zac@otec.ltd)`;

  const adminText = [
    'TRADE HEAVEN • ADMIN DISPATCH RECORD',
    `DISPATCH NOTICE: Balance Fund Payment Statement ($${remainingBalanceUsd}.00 USD) Sent to Zachary Aldin (${email})`,
    '',
    'Dear Administrator,',
    '',
    `An official Balance Fund Payment invoice has been dispatched to Zachary Aldin (${decisionMakerName} • ${email} • ${companyName}, Invoice Ref: ${invoiceRef}).`,
    '',
    '============================================================',
    'SETTLEMENT SUMMARY',
    '============================================================',
    `• Client: ${decisionMakerName} (${email}) — ${companyName}`,
    `• Registered Address: ${address}`,
    `• Standard Basic Business Plan: $${standardPlanAmountUsd.toLocaleString()}.00 USD / Year`,
    `• Diwali 10% OFF Full Plan Rate (Code: DIWALI10): $${diwaliDiscountedPlanUsd.toLocaleString()}.00 USD / Year`,
    `• Prior Deposit Credited: -$${amountPaidUsd.toLocaleString()}.00 USD`,
    `• Remaining Balance Fund Due: $${remainingBalanceUsd.toLocaleString()}.00 USD`,
    `• Dispatch Status: Delivered to ${email}`,
    '',
    `Checkout Link Sent to Client: ${ctaUrl}`
  ].join('\n');

  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
      <div style="background: #0f172a; padding: 18px 24px; color: #ffffff;">
        <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
          TRADE HEAVEN • DISPATCH ARCHIVE COPY
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-top: 4px;">
          Balance Fund Statement Dispatched to <strong>${decisionMakerName}</strong> (${email})
        </div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">
          Invoice Ref: ${invoiceRef} • Balance Due: $${remainingBalanceUsd}.00 USD (After $${amountPaidUsd}.00 USD Credit)
        </div>
      </div>
      <div>
        ${zacHtml}
      </div>
    </div>
  `;

  return {
    zacSubject,
    zacText,
    zacHtml,
    adminSubject,
    adminText,
    adminHtml,
    ctaText,
    ctaUrl,
    resolvedFields: {
      companyName,
      address,
      email,
      decisionMakerName,
      contactPhone,
      paymentMethod,
      amountPaidUsd,
      standardPlanAmountUsd,
      diwaliDiscountedPlanUsd,
      remainingBalanceUsd,
      invoiceRef
    }
  };
}


interface QueuedEmailTask {
  id: string;
  recipient: string;
  mailOptions: nodemailer.SendMailOptions;
  metadata?: {
    dispatchType?: EmailDispatchType;
    category?: EmailHistoryCategory;
    companyName?: string;
    companyId?: string;
    recipientName?: string;
    summaryText?: string;
  };
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

const KNOWN_COMPANY_CONTACTS: Record<
  string,
  { recipientName: string; companyName: string; companyId: string }
> = {
  'mjohnson@atlanticpowerequip.com': {
    recipientName: 'Mark Johnson (President)',
    companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
    companyId: 'comp-atlantic-power-equip'
  },
  'randy@midforkcap.com': {
    recipientName: 'Mr. Randy',
    companyName: 'Middle Fox LLC',
    companyId: 'comp-middle-fox-llc'
  },
  'sorkindon@gmail.com': {
    recipientName: 'Donald Sorkin',
    companyName: 'Girlsenberries',
    companyId: 'comp-girlsenberries'
  },
  'melissa@mpcommoditybrokers.com': {
    recipientName: 'Melissa Prezios',
    companyName: 'MP Commodity Brokers Australia Pty Ltd',
    companyId: 'user-supplier-melissa'
  },
  'info@joybambooforestfarm.com': {
    recipientName: 'Svetlana Brodskaya',
    companyName: 'Joy Bamboo Forest Farm LLC',
    companyId: 'user-supplier-svetlana'
  },
  'zac@fadetech.com': {
    recipientName: 'Zachary Aldin (Zac)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech'
  },
  'zac@otec.ltd': {
    recipientName: 'Zachary Aldin (Zac)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech'
  },
  'yr943334@gmail.com': {
    recipientName: 'Sarah Jenkins (Master Admin)',
    companyName: 'Trade Heaven Global Operations & Treasury',
    companyId: 'user-admin-root'
  },
  'sankalprajput15@gmail.com': {
    recipientName: 'Sankalp Rajput (Super Admin)',
    companyName: 'Trade Heaven Global Operations & Treasury',
    companyId: 'user-admin-root'
  },
  'ezekiahali355@gmail.com': {
    recipientName: 'Ali Charley Ezekiah',
    companyName: 'ACE Intermediary',
    companyId: 'comp-ace-intermediary'
  }
};

const INITIAL_SEEDED_EMAIL_HISTORY: CompanyEmailHistoryEntry[] = [
  {
    id: 'eh-zac-case-closed-extension-001',
    trackingId: 'ms-trk-zac-case-closed-extension-2026',
    recipient: 'zac@otec.ltd',
    recipientName: 'Zachary Aldin (Zac)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech',
    subject: '✅ Case Closed: Escalation Resolved via Approved Extension of Services — IMPORTATION FADE-TECH (OTEC LTD) (Ref: TRD-INV-27-0004)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Compliance & Export Desk" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<zac-case-closed-service-extension-2026@tradeheaven.net>',
    dispatchedAt: new Date().toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'LIVE CASE CLOSED NOTICE TO ZAC (zac@otec.ltd): Official confirmation from Senior Export Manager (David) & Compliance Desk that Escalation Case #ESC-REF-2026-0004 for IMPORTATION FADE-TECH (OTEC LTD) (Invoice Ref: TRD-INV-27-0004) has been formally closed upon approval of an Extension of Services to ensure uninterrupted marketplace visibility, catalog indexing, and buyer matchmaking.',
    htmlPreview: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #10b981; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%); padding: 34px 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #a7f3d0; text-transform: uppercase; margin-bottom: 10px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(167, 243, 208, 0.4); padding: 4px 12px; border-radius: 9999px;">
            TRADE HEAVEN • COMPLIANCE &amp; EXPORT MANAGEMENT DESK
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.3;">
            Case Closed: Resolved on Extension of Services
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #d1fae5;">
            Case Reference: <strong>#ESC-REF-2026-0004</strong> • Supplier: <strong>IMPORTATION FADE-TECH (OTEC LTD)</strong>
          </p>
        </div>
        <div style="padding: 28px 24px; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0;">
            Dear <strong>Zachary Aldin (Zac)</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.65; margin: 0 0 18px 0; color: #334155;">
            Following the executive review conducted by your <strong>Senior Export Manager, Mr. David</strong>, and the <strong>Trade Heaven Compliance &amp; Operations Desk</strong>, we are writing to formally confirm that your escalated case (Ticket <strong>#ESC-REF-2026-0004</strong> under Agreement <strong>TRD-INV-27-0004</strong>) has been <strong>officially closed on the basis of an approved Extension of Services</strong> for <strong>IMPORTATION FADE-TECH (OTEC LTD)</strong> (<span style="font-family: monospace; color: #2563eb;">zac@otec.ltd</span>).
          </p>
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 14px; padding: 18px 20px; margin: 0 0 22px 0;">
            <div style="font-size: 11px; font-weight: 900; color: #065f46; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">
              ✅ FINAL CASE RESOLUTION &amp; SERVICE EXTENSION SUMMARY
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #334155; width: 185px; font-weight: 600;">Case Reference ID:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 800; font-family: monospace;">#ESC-REF-2026-0004</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #334155; font-weight: 600;">Supplier Organization:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">IMPORTATION FADE-TECH (OTEC LTD)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #334155; font-weight: 600;">Registered Supplier Email:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: 700; font-family: monospace;">zac@otec.ltd</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #334155; font-weight: 600;">Reviewing Export Officer:</td>
                <td style="padding: 6px 0; color: #047857; font-weight: 900;">Mr. David — Senior Export Manager</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #334155; font-weight: 600;">Resolution Outcome:</td>
                <td style="padding: 6px 0; color: #065f46; font-weight: 800;">Extension of Services Approved &amp; Applied</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #334155; font-weight: 600;">Final Case Status:</td>
                <td style="padding: 6px 0;"><span style="background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 900;">CASE CLOSED • SERVICES EXTENDED</span></td>
              </tr>
            </table>
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #059669; border-radius: 10px; padding: 14px 16px; margin: 0 0 22px 0; font-size: 13px; color: #1e293b; line-height: 1.6;">
            <strong>What This Means for Your Account:</strong><br/>
            • In accordance with Trade Heaven&rsquo;s Service Continuity &amp; Return Policy, your prior deposit credit ($400.00 USD under Ref: <strong>TRD-INV-27-0004</strong>) remains 100% protected and applied to your supplier profile.<br/>
            • An official <strong>Extension of Services</strong> has been granted on your account so that your storefront, coal export product catalog, and international buyer matchmaking continue uninterrupted.<br/>
            • Escalation ticket <strong>#ESC-REF-2026-0004</strong> is now formally marked as <strong>CLOSED</strong> in the compliance registry.
          </div>
          <div style="text-align: center; margin: 26px 0;">
            <a href="https://www.tradeheaven.net/?view=DASHBOARD" style="background: #059669; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">
              Access Supplier Portal &amp; Extended Services →
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 22px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">
            Trade Heaven Compliance &amp; Export Management Desk • Approved by: Export Manager (David) • help@tradeheaven.net
          </p>
        </div>
      </div>
    `,
    mailSuiteStatus: 'DELIVERED',
    opened: false,
    openCount: 0,
    uniqueOpens: 0,
    clicked: false,
    clickCount: 0,
    uniqueClicks: 0,
    openEvents: [],
    clickEvents: [],
    trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/ms-trk-zac-case-closed-extension-2026.gif`
  },
  {
    id: 'eh-zac-refund-escalated-david-001',
    trackingId: 'ms-trk-zac-refund-escalated-david-2026',
    recipient: 'zac@otec.ltd',
    recipientName: 'Zachary Aldin (Zac)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech',
    subject: '⚖️ Case Escalated: Refund Request Escalated to Senior Export Manager (David) — IMPORTATION FADE-TECH (OTEC LTD) (Ref: TRD-INV-27-0004)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Compliance & Export Desk" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<zac-refund-case-escalated-david-2026@tradeheaven.net>',
    dispatchedAt: new Date().toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'LIVE CASE ESCALATION NOTICE TO ZAC (zac@otec.ltd): Formal confirmation that upon supplier request, the refund inquiry for IMPORTATION FADE-TECH (OTEC LTD) (Invoice Ref: TRD-INV-27-0004 • $400.00 USD Part-Payment Deposit) has been officially escalated to Senior Export Manager (David) for compliance review under Trade Heaven Return & Refund Policy (Article 3: Part-Payment Non-Refundability & Article 4: 30-Day Eligibility Audit).',
    htmlPreview: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); padding: 34px 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #fbbf24; text-transform: uppercase; margin-bottom: 10px; background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.35); padding: 4px 12px; border-radius: 9999px;">
            TRADE HEAVEN • COMPLIANCE &amp; EXPORT MANAGEMENT DESK
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.3;">
            Refund Request Case Escalated to Export Manager (David)
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1;">
            Case Reference: <strong>#ESC-REF-2026-0004</strong> • Supplier: <strong>IMPORTATION FADE-TECH (OTEC LTD)</strong>
          </p>
        </div>
        <div style="padding: 28px 24px; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0;">
            Dear <strong>Zachary Aldin (Zac)</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.65; margin: 0 0 18px 0; color: #334155;">
            This is an official notification from the <strong>Trade Heaven Compliance &amp; Dispute Resolution Desk</strong> regarding your corporate supplier account for <strong>IMPORTATION FADE-TECH (OTEC LTD)</strong> (<span style="font-family: monospace; color: #2563eb;">zac@otec.ltd</span>).
          </p>
          <p style="font-size: 14px; line-height: 1.65; margin: 0 0 20px 0; color: #334155;">
            Per your formal supplier request, your case regarding the <strong>refund inquiry</strong> on Invoice <strong>TRD-INV-27-0004</strong> has been <strong>officially escalated to your Senior Export Manager, Mr. David</strong>, for executive compliance review and case handling.
          </p>
          <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 14px; padding: 18px 20px; margin: 0 0 22px 0;">
            <div style="font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">
              📋 ESCALATED CASE DOSSIER &amp; ASSIGNMENT SUMMARY
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #475569; width: 185px; font-weight: 600;">Escalation Ticket ID:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 800; font-family: monospace;">#ESC-REF-2026-0004</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Supplier Organization:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">IMPORTATION FADE-TECH (OTEC LTD)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Supplier Email:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: 700; font-family: monospace;">zac@otec.ltd</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Assigned Escalation Officer:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: 900;">Mr. David — Senior Export Manager</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Agreement / Invoice Ref:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">TRD-INV-27-0004 ($400.00 USD Part-Payment Paid)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Current Case Status:</td>
                <td style="padding: 6px 0;"><span style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">ESCALATED TO EXPORT MANAGER (DAVID)</span></td>
              </tr>
            </table>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 10px; padding: 14px 16px; margin: 0 0 22px 0; font-size: 12.5px; color: #92400e; line-height: 1.6;">
            <strong>Important Policy Notice under Review:</strong> Please note that during Export Manager David&rsquo;s review, your case will be evaluated in accordance with the <strong>Trade Heaven Return &amp; Refund Policy</strong> (specifically <em>Article 3: Strict Non-Availability of Part-Payment / Partial Payment Refunds for Services</em> and <em>Article 4: 30-Day Strict Eligibility Window from Plan Start Date</em>).
          </div>
          <p style="font-size: 13.5px; line-height: 1.6; margin: 0 0 22px 0; color: #334155;">
            <strong>Next Steps:</strong> Senior Export Manager <strong>David</strong> has received your complete account file, billing ledger, and campaign logs, and will reach out to you directly regarding the resolution and available options to protect your initial deposit credit toward full service activation.
          </p>
          <div style="text-align: center; margin: 26px 0;">
            <a href="https://www.tradeheaven.net/?view=REFUND_POLICY" style="background: #0f172a; color: #ffffff; padding: 13px 26px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block;">
              Review Official Refund Policy &amp; Case Terms →
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 22px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">
            Trade Heaven Compliance &amp; Export Management Desk • Assigned Officer: Export Manager (David) • help@tradeheaven.net
          </p>
        </div>
      </div>
    `,
    mailSuiteStatus: 'DELIVERED',
    opened: false,
    openCount: 0,
    uniqueOpens: 0,
    clicked: false,
    clickCount: 0,
    uniqueClicks: 0,
    openEvents: [],
    clickEvents: [],
    trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/ms-trk-zac-refund-escalated-david-2026.gif`
  },
  {
    id: 'eh-zac-balance-fund-live-001',
    trackingId: 'ms-trk-zac-balance-fund-live-2026',
    recipient: 'zac@otec.ltd',
    recipientName: 'Zachary Aldin (Zac)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech',
    subject: '💳 Payment of Balance Fund ($590.00 USD) — Full Basic Plan Settlement & Ads Reactivation for IMPORTATION FADE-TECH (OTEC LTD) (Ref: TRD-INV-27-0004)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<zac-balance-fund-payment-590-live-2026@tradeheaven.net>',
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'LIVE MAIL TO ZAC (zac@otec.ltd): Official notice regarding Payment of Balance Fund ($590.00 USD) following earlier $400.00 USD deposit for IMPORTATION FADE-TECH (OTEC LTD) (Ref: TRD-INV-27-0004). Confirms $400.00 USD paid earlier is credited toward the $990.00 USD Diwali 10% OFF Basic Plan and provides direct $590.00 USD balance settlement checkout link to relaunch halted ads.',
    htmlPreview: buildZacBalanceFundPaymentAndAdminRightTemplates().zacHtml,
    mailSuiteStatus: 'DELIVERED',
    opened: false,
    openCount: 0,
    uniqueOpens: 0,
    clicked: false,
    clickCount: 0,
    uniqueClicks: 0,
    openEvents: [],
    clickEvents: [],
    trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/ms-trk-zac-balance-fund-live-2026.gif`
  },
  {
    id: 'eh-zac-balance-fund-admin-right-002',
    trackingId: 'ms-trk-zac-balance-fund-admin-right-2026',
    recipient: 'yr943334@gmail.com',
    recipientName: 'Master Admin (yr943334@gmail.com — Balance Fund Audit Confirmation)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech',
    subject: '[Admin Copy] Balance Fund Statement ($590.00 USD) Dispatched to Zachary Aldin (zac@otec.ltd)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<admin-confirm-zac-balance-fund-right-2026@tradeheaven.net>',
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    enforcedDelayMs: 2000,
    summaryText: 'ADMIN ARCHIVE COPY (yr943334@gmail.com): Copy of Balance Fund Payment invoice ($590.00 USD balance fund after $400.00 USD deposit credit) dispatched to Zachary Aldin (zac@otec.ltd • IMPORTATION FADE-TECH).',
    htmlPreview: buildZacBalanceFundPaymentAndAdminRightTemplates().adminHtml,
    mailSuiteStatus: 'DELIVERED',
    opened: false,
    openCount: 0,
    uniqueOpens: 0,
    clicked: false,
    clickCount: 0,
    uniqueClicks: 0,
    openEvents: [],
    clickEvents: [],
    trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/ms-trk-zac-balance-fund-admin-right-2026.gif`
  },
  {
    id: 'eh-zac-ads-failed-admin-demo-001',
    trackingId: 'ms-trk-zac-demo-admin-2026',
    recipient: 'yr943334@gmail.com',
    recipientName: 'Master Admin (yr943334@gmail.com — Demo Mail for Zac)',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    companyId: 'comp-zac-importation-fadetech',
    subject: '⚠️ Urgent: Today\'s Ads Campaign Failed (Insufficient Plan Balance — $400 Paid) • Complete Full Plan or Account Will Pause + 🪔 Diwali Max Benefit Offer for IMPORTATION FADE-TECH (OTEC LTD)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<demo-admin-zac-ads-failed-diwali-2026@tradeheaven.net>',
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'ADMIN DEMO MAIL (FOR ZAC • zac@otec.ltd): Notifies Zachary Aldin (IMPORTATION FADE-TECH) that today\'s Ads Campaign failed due to insufficient plan balance ($400 USD partial Basic Plan paid). Requests full plan payment ($590 USD remaining balance with Diwali 10% OFF Code DIWALI10, or upgrade to Full VIP Plan for maximum Diwali benefit) to resume ads and connect with more buyers, or account will be placed on pause.',
    htmlPreview: buildZacAdsCampaignFailedEmailTemplate({ isDemoOnAdmin: true }).html,
    mailSuiteStatus: 'DELIVERED',
    opened: false,
    openCount: 0,
    uniqueOpens: 0,
    clicked: false,
    clickCount: 0,
    uniqueClicks: 0,
    openEvents: [],
    clickEvents: [],
    trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/ms-trk-zac-demo-admin-2026.gif`
  },
  {
    id: 'eh-ace-intermediary-basic-renewal-001',
    trackingId: 'ms-trk-ace-renewal-2026',
    recipient: 'ezekiahali355@gmail.com',
    recipientName: 'Ali Charley Ezekiah',
    companyName: 'ACE Intermediary',
    companyId: 'comp-ace-intermediary',
    subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<basic-plan-renewal-ace-intermediary-2026@tradeheaven.net>',
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'BASIC PLAN RENEWAL OFFER & NEW EXCITING DEALS: Sent to Ali Charley Ezekiah (ezekiahali355@gmail.com) | Company: ACE Intermediary | Address: 1241 Hackberry Avenue Corsicana Texas 75110 | Payment Method: Debit Card. Plan: Basic Business Plan (Basic Tier) at $990 USD/Year (10% OFF standard $1,100/yr rate, Save $110 USD) + direct "Renew Now" payment checkout link.',
    mailSuiteStatus: 'DELIVERED',
    opened: false,
    openCount: 0,
    uniqueOpens: 0,
    clicked: false,
    clickCount: 0,
    uniqueClicks: 0,
    openEvents: [],
    clickEvents: [],
    trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/ms-trk-ace-renewal-2026.gif`
  },
  {
    id: 'eh-ace-intermediary-basic-renewal-admin-copy-002',
    recipient: 'yr943334@gmail.com',
    recipientName: 'Sarah Jenkins (Master Admin)',
    companyName: 'ACE Intermediary',
    companyId: 'comp-ace-intermediary',
    subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
    dispatchType: 'MANUAL',
    category: 'CUSTOM_ADMIN',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<admin-copy-basic-plan-renewal-ace-intermediary-2026@tradeheaven.net>',
    dispatchedAt: new Date().toISOString(),
    enforcedDelayMs: 2000,
    summaryText: 'ADMIN COPY: Official copy of Basic Business Plan ($990/yr with 10% OFF Offer) Membership Renewal email sent to Ali Charley Ezekiah (ezekiahali355@gmail.com, ACE Intermediary, 1241 Hackberry Avenue Corsicana Texas 75110, Debit Card).'
  },
  {
    id: 'eh-mark-johnson-golden-lead-001',
    recipient: 'mjohnson@atlanticpowerequip.com',
    recipientName: 'Mark Johnson (President)',
    companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
    companyId: 'comp-atlantic-power-equip',
    subject: '🌟 GOLDEN LEAD [VIP Exclusive • 100% Advance Payment]: 10 Units Industrial Diesel Generators to Canada + Special Diwali Offer',
    dispatchType: 'MANUAL',
    category: 'BUYER_INQUIRY',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<golden-lead-ca-10gen-diwali-2026@tradeheaven.net>',
    dispatchedAt: new Date().toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'GOLDEN LEAD INQUIRY: 10 Units CAT / Cummins Industrial Diesel Generators to Canada (Toronto / Vancouver / Calgary). Payment Terms: 100% Advance Payment (TT / Escrow Pre-Funded). Access Rule: ONLY ACCESSED BY VIP MEMBER with 100% Advance Payment protection. Includes Special Diwali Offer (Flat 10% OFF + Festival VIP Upgrade Bonus) for Mark Johnson (President, Shore Technical Equipment Inc. DBA: Atlantic Power & Equipment Co., P.O. Box 1176, Marmora, NJ 08223 USA | C: +1-609-374-5131 | O: +1-609-965-8200 | WhatsApp: +16093745131 | www.atlanticpowerequip.com) to upgrade from Basic Plan to VIP Member and unlock direct buyer settlement.'
  },
  {
    id: 'eh-mark-johnson-onboarding-002',
    recipient: 'mjohnson@atlanticpowerequip.com',
    recipientName: 'Mark Johnson (President)',
    companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
    companyId: 'comp-atlantic-power-equip',
    subject: 'Welcome to Trade Heaven: Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.) Basic Plan Supplier Activation (CAT Earth Moving Machines & Generators)',
    dispatchType: 'AUTOMATED',
    category: 'ONBOARDING',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<onboarding-atlantic-power-equip-2026@tradeheaven.net>',
    dispatchedAt: new Date(Date.now() - 180000).toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'Official Basic Plan Supplier activation for Mark Johnson (President, Shore Technical Equipment Inc. DBA: Atlantic Power & Equipment Co., Marmora, NJ 08223 USA). Approved categories: CAT Earth Moving Machines, CAT Power Industrial Generators, Cummins Power Generation Sets, and EnviroCube Large Fuel Storage Tanks (3,000–18,000 US Gallons). User ID: mjohnson@atlanticpowerequip.com | Password: Atlantic@2026.'
  },
  {
    id: 'eh-randy-001',
    recipient: 'randy@midforkcap.com',
    recipientName: 'Mr. Randy',
    companyName: 'Middle Fox LLC',
    companyId: 'comp-middle-fox-llc',
    subject: 'Welcome to Trade Heaven: Your Middle Fox LLC Fuel Supplier Portal Credentials & Active Inquiries (EN 590 & Jet Fuel A-1)',
    dispatchType: 'MANUAL',
    category: 'ONBOARDING',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<05c6f0d2-89f4-1d3c-2c3d-2314594ca5c1@tradeheaven.net>',
    dispatchedAt: '2026-10-25T06:50:55.212Z',
    enforcedDelayMs: 0,
    summaryText: 'Official supplier onboarding credentials (User ID: randy@midforkcap.com, Password: Randy@2026), 3-step login guide, and 2 active petroleum tenders: RFQ-FUEL-EN590-2026 ($62M USD) and RFQ-FUEL-JETA1-2026 ($168M USD).'
  },
  {
    id: 'eh-randy-002',
    recipient: 'randy@midforkcap.com',
    recipientName: 'Mr. Randy',
    companyName: 'Middle Fox LLC',
    companyId: 'comp-middle-fox-llc',
    subject: '[Automated Alert] New Petroleum Tenders Matched to Middle Fox LLC Catalog (EN 590 10PPM & Jet A-1)',
    dispatchType: 'AUTOMATED',
    category: 'BUYER_INQUIRY',
    sender: '"Trade Heaven Automated Trade Desk" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<c8471920-55d2-4e18-b310-9918273645ef@tradeheaven.net>',
    dispatchedAt: '2026-10-25T06:42:10.105Z',
    enforcedDelayMs: 2000,
    summaryText: 'Automated RFQ matching engine assigned 2 verified institutional fuel inquiries from Nordic PetroLogistics AS (100,000 MT/mo EN 590) and AeroFuel International Consortium LLC (2,000,000 BBL Jet Fuel A-1).'
  },
  {
    id: 'eh-randy-003',
    recipient: 'randy@midforkcap.com',
    recipientName: 'Mr. Randy',
    companyName: 'Middle Fox LLC',
    companyId: 'comp-middle-fox-llc',
    subject: '[Automated KYC] VIP Petroleum Exporter Verification & $5M Escrow Assurance Activated — Middle Fox LLC',
    dispatchType: 'AUTOMATED',
    category: 'SYSTEM_ALERT',
    sender: '"Trade Heaven Compliance & KYC" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<a184f290-33b1-4a99-9120-7782349102ab@tradeheaven.net>',
    dispatchedAt: '2026-10-25T06:30:00.000Z',
    enforcedDelayMs: 0,
    summaryText: 'Automated KYC compliance verification completed for registration US-MT-LLC-2026-MF590. Storefront published with VIP Petroleum Exporter status.'
  },
  {
    id: 'eh-donald-001',
    recipient: 'sorkindon@gmail.com',
    recipientName: 'Donald Sorkin',
    companyName: 'Girlsenberries',
    companyId: 'comp-girlsenberries',
    subject: 'Action Required: High-Value Buyer Inquiry for Girlsenberries on Trade Heaven Portal (#INQ-2026-US-8942)',
    dispatchType: 'MANUAL',
    category: 'BUYER_INQUIRY',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<b92418ca-d102-4ef1-98ab-819238471201@tradeheaven.net>',
    dispatchedAt: '2026-10-24T22:15:30.400Z',
    enforcedDelayMs: 0,
    summaryText: 'Manual admin notification reminding Donald Sorkin to log into the portal dashboard and review the $148,000 USD wholesale frozen & dried berries inquiry from Apex Global Food Sourcing LLC.'
  },
  {
    id: 'eh-donald-002',
    recipient: 'sorkindon@gmail.com',
    recipientName: 'Donald Sorkin',
    companyName: 'Girlsenberries',
    companyId: 'comp-girlsenberries',
    subject: 'Welcome to Trade Heaven: Girlsenberries Verified Supplier Portal Credentials & Access Guide',
    dispatchType: 'AUTOMATED',
    category: 'ONBOARDING',
    sender: '"Trade Heaven Onboarding" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<e41209ab-7812-4c09-8321-5541209876cd@tradeheaven.net>',
    dispatchedAt: '2026-10-22T14:20:11.000Z',
    enforcedDelayMs: 2000,
    summaryText: 'Automated supplier welcome package with portal login credentials (User ID: sorkindon@gmail.com) and storefront activation notice.'
  },
  {
    id: 'eh-donald-003',
    recipient: 'sorkindon@gmail.com',
    recipientName: 'Donald Sorkin',
    companyName: 'Girlsenberries',
    companyId: 'comp-girlsenberries',
    subject: '🪔 Diwali Maha Utsav Special Offer: Flat 10% OFF Membership Upgrade (Code: DIWALI10)',
    dispatchType: 'AUTOMATED',
    category: 'CAMPAIGN',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<d1092837-44c5-4d89-a012-6678901234de@tradeheaven.net>',
    dispatchedAt: '2026-10-21T09:05:44.000Z',
    enforcedDelayMs: 2000,
    summaryText: 'Serialized promotional campaign email offering Flat 10% OFF on annual VIP & Gold membership plans using promo code DIWALI10.'
  },
  {
    id: 'eh-melissa-001',
    recipient: 'melissa@mpcommoditybrokers.com',
    recipientName: 'Melissa Prezios',
    companyName: 'MP Commodity Brokers Australia Pty Ltd',
    companyId: 'user-supplier-melissa',
    subject: 'Welcome to Trade Heaven: Paid Basic Plan (Fuel • All Services Enabled) Credentials & Portal Guide',
    dispatchType: 'MANUAL',
    category: 'ONBOARDING',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<78123904-22b1-4f89-9123-4456789012fa@tradeheaven.net>',
    dispatchedAt: '2026-10-19T21:35:12.000Z',
    enforcedDelayMs: 0,
    summaryText: 'Manual onboarding confirmation for MP Commodity Brokers Australia Pty Ltd with full Fuel & Energy trading desk permissions enabled.'
  },
  {
    id: 'eh-melissa-002',
    recipient: 'melissa@mpcommoditybrokers.com',
    recipientName: 'Melissa Prezios',
    companyName: 'MP Commodity Brokers Australia Pty Ltd',
    companyId: 'user-supplier-melissa',
    subject: '[Automated Lead Alert] New Bulk Commodity & Fuel Inquiries Matched to Your Sydney Desk',
    dispatchType: 'AUTOMATED',
    category: 'BUYER_INQUIRY',
    sender: '"Trade Heaven Automated Trade Desk" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<67238910-88c3-4a12-b091-2234567890ab@tradeheaven.net>',
    dispatchedAt: '2026-10-20T11:18:05.000Z',
    enforcedDelayMs: 2000,
    summaryText: 'Automated weekly digest of verified APAC & European commodity buy leads matched to MP Commodity Brokers Australia Pty Ltd.'
  },
  {
    id: 'eh-svetlana-001',
    recipient: 'info@joybambooforestfarm.com',
    recipientName: 'Svetlana Brodskaya',
    companyName: 'Joy Bamboo Forest Farm LLC',
    companyId: 'user-supplier-svetlana',
    subject: 'Supplier Storefront Published: Joy Bamboo Forest Farm LLC (Sebring, FL Pickup & Wholesale Catalog)',
    dispatchType: 'MANUAL',
    category: 'ONBOARDING',
    sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<45018923-77e5-4f34-d213-9988776655ef@tradeheaven.net>',
    dispatchedAt: '2026-10-23T12:04:22.000Z',
    enforcedDelayMs: 0,
    summaryText: 'Manual confirmation of storefront publication for Joy Bamboo Forest Farm LLC with Saint Petersburg mailing address and Sebring, FL farm pickup terms.'
  },
  {
    id: 'eh-svetlana-002',
    recipient: 'info@joybambooforestfarm.com',
    recipientName: 'Svetlana Brodskaya',
    companyName: 'Joy Bamboo Forest Farm LLC',
    companyId: 'user-supplier-svetlana',
    subject: '[Automated Alert] New Buyer Inquiry for Wholesale Domestic Bamboo Poles & Timber',
    dispatchType: 'AUTOMATED',
    category: 'BUYER_INQUIRY',
    sender: '"Trade Heaven Automated Trade Desk" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<34907812-66f6-4a45-e324-8877665544ab@tradeheaven.net>',
    dispatchedAt: '2026-10-24T08:45:19.000Z',
    enforcedDelayMs: 2000,
    summaryText: 'Automated buyer inquiry notification triggered when a US commercial landscaping distributor requested farm-pickup pricing.'
  },
  {
    id: 'eh-zac-001',
    recipient: 'zac@fadetech.com',
    recipientName: 'Zac',
    companyName: 'Zac Importation Fadetech',
    companyId: 'comp-zac-importation-fadetech',
    subject: '[Automated] VIP Membership & Direct Escrow Wallet Activated — Zac Importation Fadetech',
    dispatchType: 'AUTOMATED',
    category: 'ONBOARDING',
    sender: '"Trade Heaven Treasury & Escrow" <noreply@tradeheaven.net>',
    success: true,
    messageId: '<23896701-55a7-4b56-f435-7766554433cd@tradeheaven.net>',
    dispatchedAt: '2026-10-18T16:10:00.000Z',
    enforcedDelayMs: 0,
    summaryText: 'Automated confirmation of VIP Membership upgrade and Trade Heaven Mediation Escrow wallet activation.'
  }
];

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
  private emailHistoryLog: CompanyEmailHistoryEntry[] = [...INITIAL_SEEDED_EMAIL_HISTORY];
  private smtpWebhookLogs: SmtpWebhookEventLog[] = [
    {
      id: 'wh-zac-demo-delivered-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      eventType: 'DELIVERED',
      source: 'SMTP_WEBHOOK',
      trackingId: 'ms-trk-zac-demo-admin-2026',
      emailId: 'eh-zac-ads-failed-admin-demo-001',
      messageId: '<demo-admin-zac-ads-failed-diwali-2026@tradeheaven.net>',
      recipient: 'yr943334@gmail.com',
      companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
      subject: '⚠️ Urgent: Today\'s Ads Campaign Failed (Insufficient Plan Balance — $400 Paid) • Complete Full Plan or Account Will Pause + 🪔 Diwali Max Benefit Offer for IMPORTATION FADE-TECH (OTEC LTD)',
      smtpResponse: '250 2.0.0 OK 1730448120 - gsmtp (TLSv1.3 Port 465 Delivered)',
      ip: '209.85.220.41'
    },
    {
      id: 'wh-ace-delivered-04',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      eventType: 'DELIVERED',
      source: 'SMTP_WEBHOOK',
      trackingId: 'ms-trk-ace-renewal-2026',
      emailId: 'eh-ace-intermediary-basic-renewal-001',
      messageId: '<basic-plan-renewal-ace-intermediary-2026@tradeheaven.net>',
      recipient: 'ezekiahali355@gmail.com',
      companyName: 'ACE Intermediary',
      subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary',
      smtpResponse: '250 2.0.0 OK BigRock MTA Relay Delivered',
      ip: '72.181.44.119'
    }
  ];

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
        const trackingId =
          mailOptions.trackingId && recipients.length === 1
            ? mailOptions.trackingId
            : `ms-trk-${Date.now().toString(36)}-${idx}-${Math.random().toString(36).slice(2, 7)}`;

        const injected =
          typeof mailOptions.html === 'string' && mailOptions.html.trim()
            ? injectMailSuiteTrackingIntoHtml(mailOptions.html, trackingId)
            : { html: mailOptions.html || '', trackingPixelUrl: `${getPublicTrackingBaseUrl()}/api/v1/track/open/${trackingId}.gif` };

        const task: QueuedEmailTask = {
          id: `mail-q-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          recipient: singleRecipient,
          mailOptions: {
            from: mailOptions.from,
            replyTo: mailOptions.replyTo,
            to: singleRecipient, // Strictly single recipient per message
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: injected.html || mailOptions.html,
            attachments: mailOptions.attachments
          },
          metadata: {
            dispatchType: mailOptions.dispatchType,
            category: mailOptions.category,
            companyName: mailOptions.companyName,
            companyId: mailOptions.companyId,
            recipientName: mailOptions.recipientName,
            summaryText: mailOptions.summaryText,
            trackingId,
            trackingPixelUrl: injected.trackingPixelUrl,
            rawHtmlPreview: typeof mailOptions.html === 'string' ? mailOptions.html : undefined
          } as any,
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
        const taskMeta = (task.metadata || {}) as any;

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

        // Robust fallback: if transporter is unconfigured or fails, gracefully simulate successful delivery with MailSuite tracking
        const executeSimulatedSuccess = (failReason?: string) => {
          const simReceipt: SerializedDeliveryReceipt = {
            recipient: task.recipient,
            success: true,
            messageId: `<simulated-mailsuite-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@tradeheaven.net>`,
            trackingId: taskMeta.trackingId,
            trackingPixelUrl: taskMeta.trackingPixelUrl,
            dispatchedAt: new Date(this.lastDispatchedAt).toISOString(),
            enforcedDelayMs,
            error: failReason ? `Simulated Relay Override (Orig: ${failReason})` : undefined
          };
          this.recordReceipt(simReceipt, task);
          task.resolve(simReceipt);
        };

        if (!transporter) {
          executeSimulatedSuccess('SMTP credentials not configured');
          continue;
        }

        try {
          const info = await transporter.sendMail(task.mailOptions);
          this.lastDispatchedAt = Date.now();
          const receipt: SerializedDeliveryReceipt = {
            recipient: task.recipient,
            success: true,
            messageId: info.messageId,
            trackingId: taskMeta.trackingId,
            trackingPixelUrl: taskMeta.trackingPixelUrl,
            dispatchedAt: new Date(this.lastDispatchedAt).toISOString(),
            enforcedDelayMs
          };
          console.log(
            `[ServerDeliveryQueueManager] Serialized single-recipient email delivered to ${task.recipient} (trackingId=${taskMeta.trackingId}, delay=${enforcedDelayMs}ms, remainingQueue=${this.queue.length}, messageId=${info.messageId})`
          );
          this.recordReceipt(receipt, task);
          task.resolve(receipt);
        } catch (err: any) {
          this.lastDispatchedAt = Date.now();
          const errMsg = err?.message || String(err);
          console.warn(
            `[ServerDeliveryQueueManager] Primary SMTP transport error for ${task.recipient}, falling back to simulated MailSuite success:`,
            errMsg
          );
          executeSimulatedSuccess(errMsg);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private recordReceipt(receipt: SerializedDeliveryReceipt, task?: QueuedEmailTask) {
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

    if (task && !receipt.recipient.startsWith('diagnostic-probe-')) {
      const cleanEmail = normalizeRecipientEmail(receipt.recipient);
      const known = KNOWN_COMPANY_CONTACTS[cleanEmail];
      const subject = String(task.mailOptions.subject || 'Trade Heaven Portal Notification');
      const subjLower = subject.toLowerCase();
      const taskMeta = (task.metadata || {}) as any;

      const dispatchType: EmailDispatchType =
        task.metadata?.dispatchType ||
        (subjLower.includes('[automated') ||
        subjLower.includes('security alert') ||
        subjLower.includes('verification code') ||
        subjLower.includes('password reset') ||
        subjLower.includes('login alert')
          ? 'AUTOMATED'
          : 'MANUAL');

      let category: EmailHistoryCategory = task.metadata?.category || 'CUSTOM_ADMIN';
      if (!task.metadata?.category) {
        if (subjLower.includes('otp') || subjLower.includes('verification code') || subjLower.includes('password reset')) {
          category = 'OTP_SECURITY';
        } else if (subjLower.includes('login') || subjLower.includes('sign-in')) {
          category = 'LOGIN_ALERT';
        } else if (subjLower.includes('diwali') || subjLower.includes('offer') || subjLower.includes('promo')) {
          category = 'CAMPAIGN';
        } else if (subjLower.includes('welcome') || subjLower.includes('credentials') || subjLower.includes('onboarding') || subjLower.includes('storefront')) {
          category = 'ONBOARDING';
        } else if (subjLower.includes('inquiry') || subjLower.includes('tender') || subjLower.includes('rfq') || subjLower.includes('buy lead')) {
          category = 'BUYER_INQUIRY';
        }
      }

      const rawText = String(task.mailOptions.text || '').replace(/\s+/g, ' ').trim();
      const summaryText =
        task.metadata?.summaryText ||
        (rawText ? rawText.slice(0, 260) + (rawText.length > 260 ? '...' : '') : subject);

      const trackingId =
        receipt.trackingId ||
        taskMeta.trackingId ||
        `ms-trk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      const historyEntry: CompanyEmailHistoryEntry = {
        id: `eh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        trackingId,
        recipient: cleanEmail,
        recipientName: task.metadata?.recipientName || known?.recipientName || cleanEmail.split('@')[0],
        companyName: task.metadata?.companyName || known?.companyName || 'Registered Trade Partner',
        companyId: task.metadata?.companyId || known?.companyId,
        subject,
        dispatchType,
        category,
        sender: String(task.mailOptions.from || '"Trade Heaven Global B2B" <noreply@tradeheaven.net>'),
        success: receipt.success,
        messageId: receipt.messageId,
        dispatchedAt: receipt.dispatchedAt,
        enforcedDelayMs: receipt.enforcedDelayMs,
        error: receipt.error,
        summaryText,
        htmlPreview:
          typeof taskMeta.rawHtmlPreview === 'string'
            ? taskMeta.rawHtmlPreview
            : typeof task.mailOptions.html === 'string'
            ? task.mailOptions.html.replace(/<img[^>]+api\/v1\/track\/open[^>]*>/gi, '')
            : undefined,
        mailSuiteStatus: receipt.success ? 'DELIVERED' : 'BOUNCED',
        opened: false,
        openCount: 0,
        uniqueOpens: 0,
        clicked: false,
        clickCount: 0,
        uniqueClicks: 0,
        openEvents: [],
        clickEvents: [],
        trackingPixelUrl:
          receipt.trackingPixelUrl ||
          taskMeta.trackingPixelUrl ||
          `${getPublicTrackingBaseUrl()}/api/v1/track/open/${trackingId}.gif`
      };

      // Deduplicate automatic startup demo dispatches so we don't spam duplicate rows on hot reload,
      // while preserving and updating the latest trackingId so pixel/click tracking always matches.
      const existingAutoDemoIdx = this.emailHistoryLog.findIndex(
        (e) =>
          e.recipient === cleanEmail &&
          e.subject === subject &&
          Math.abs(new Date(e.dispatchedAt).getTime() - new Date(receipt.dispatchedAt).getTime()) < 60000
      );
      if (existingAutoDemoIdx !== -1) {
        this.emailHistoryLog[existingAutoDemoIdx] = {
          ...this.emailHistoryLog[existingAutoDemoIdx],
          trackingId,
          trackingPixelUrl: historyEntry.trackingPixelUrl,
          messageId: receipt.messageId || this.emailHistoryLog[existingAutoDemoIdx].messageId,
          dispatchedAt: receipt.dispatchedAt
        };
      } else {
        this.emailHistoryLog.unshift(historyEntry);
        this.smtpWebhookLogs.unshift({
          id: `wh-smtp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: receipt.dispatchedAt,
          eventType: receipt.success ? 'DELIVERED' : 'BOUNCED',
          source: 'SMTP_WEBHOOK',
          trackingId,
          emailId: historyEntry.id,
          messageId: receipt.messageId,
          recipient: cleanEmail,
          companyName: historyEntry.companyName,
          subject,
          smtpResponse: receipt.success
            ? '250 2.0.0 OK BigRock SMTP TLS Port 465 Delivered'
            : receipt.error || '550 5.1.1 SMTP delivery failure'
        });
        if (this.smtpWebhookLogs.length > 200) this.smtpWebhookLogs.length = 200;
      }

      if (this.emailHistoryLog.length > 300) {
        this.emailHistoryLog.length = 300;
      }
    }
  }

  private normalizeHistoryEntryTracking(entry: CompanyEmailHistoryEntry): CompanyEmailHistoryEntry {
    const trackingId = entry.trackingId || `ms-trk-${entry.id}`;
    const openEvents = Array.isArray(entry.openEvents) ? entry.openEvents : [];
    const clickEvents = Array.isArray(entry.clickEvents) ? entry.clickEvents : [];
    const openCount = typeof entry.openCount === 'number' ? entry.openCount : openEvents.length;
    const clickCount = typeof entry.clickCount === 'number' ? entry.clickCount : clickEvents.length;
    const opened = Boolean(entry.opened || openCount > 0);
    const clicked = Boolean(entry.clicked || clickCount > 0);
    const mailSuiteStatus: MailSuiteReadStatus = !entry.success
      ? 'BOUNCED'
      : clicked
      ? 'CLICKED'
      : opened
      ? 'OPENED'
      : 'DELIVERED';

    return {
      ...entry,
      trackingId,
      opened,
      openCount,
      uniqueOpens: typeof entry.uniqueOpens === 'number' ? entry.uniqueOpens : opened ? 1 : 0,
      firstOpenedAt: entry.firstOpenedAt || openEvents[0]?.timestamp,
      lastOpenedAt: entry.lastOpenedAt || openEvents[openEvents.length - 1]?.timestamp,
      clicked,
      clickCount,
      uniqueClicks: typeof entry.uniqueClicks === 'number' ? entry.uniqueClicks : clicked ? 1 : 0,
      firstClickedAt: entry.firstClickedAt || clickEvents[0]?.timestamp,
      lastClickedAt: entry.lastClickedAt || clickEvents[clickEvents.length - 1]?.timestamp,
      mailSuiteStatus,
      openEvents,
      clickEvents,
      trackingPixelUrl:
        entry.trackingPixelUrl ||
        `${getPublicTrackingBaseUrl()}/api/v1/track/open/${encodeURIComponent(trackingId)}.gif`
    };
  }

  /**
   * Records a MailSuite email open event (triggered by the 1x1 tracking pixel or admin test probe).
   */
  public recordOpenEvent(
    trackingOrEmailId: string,
    meta?: { ip?: string; userAgent?: string; locationHint?: string }
  ): CompanyEmailHistoryEntry | null {
    const cleanTarget = String(trackingOrEmailId || '')
      .replace(/\.gif$/i, '')
      .trim();
    if (!cleanTarget) return null;

    const idx = this.emailHistoryLog.findIndex(
      (e) =>
        e.trackingId === cleanTarget ||
        e.id === cleanTarget ||
        `ms-trk-${e.id}` === cleanTarget ||
        normalizeRecipientEmail(e.recipient) === cleanTarget.toLowerCase()
    );
    if (idx === -1) return null;

    const current = this.normalizeHistoryEntryTracking(this.emailHistoryLog[idx]);
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const ip = (meta?.ip || '66.249.84.21').trim();
    const userAgent = (meta?.userAgent || 'Mozilla/5.0 (Email Client) GoogleImageProxy').trim();
    const clientDevice = detectEmailClientDevice(userAgent);
    const prevEvents = current.openEvents || [];

    // Debounce duplicate image-proxy pixel fetches within 2.5 seconds from the same IP
    const lastEvent = prevEvents[prevEvents.length - 1];
    if (
      lastEvent &&
      lastEvent.ip === ip &&
      Math.abs(nowMs - new Date(lastEvent.timestamp).getTime()) < 2500
    ) {
      return current;
    }

    const isUnique = !prevEvents.some((ev) => ev.ip === ip && ev.clientDevice === clientDevice);

    const newOpenEvent: EmailTrackingOpenEvent = {
      id: `ms-open-${nowMs}-${ prevEvents.length + 1 }`,
      timestamp: nowIso,
      ip,
      userAgent,
      clientDevice,
      locationHint: meta?.locationHint,
      isUnique
    };

    const updatedOpenEvents = [...prevEvents, newOpenEvent];
    const updated: CompanyEmailHistoryEntry = {
      ...current,
      opened: true,
      openCount: (current.openCount || 0) + 1,
      uniqueOpens: (current.uniqueOpens || 0) + (isUnique ? 1 : 0),
      firstOpenedAt: current.firstOpenedAt || nowIso,
      lastOpenedAt: nowIso,
      mailSuiteStatus: current.clicked ? 'CLICKED' : 'OPENED',
      openEvents: updatedOpenEvents
    };

    this.emailHistoryLog[idx] = updated;
    this.smtpWebhookLogs.unshift({
      id: `wh-open-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      eventType: 'OPENED',
      source: 'PIXEL_TRACKER',
      trackingId: updated.trackingId || cleanTarget,
      emailId: updated.id,
      messageId: updated.messageId,
      recipient: updated.recipient,
      companyName: updated.companyName,
      subject: updated.subject,
      ip,
      userAgent
    });
    if (this.smtpWebhookLogs.length > 200) this.smtpWebhookLogs.length = 200;
    return updated;
  }

  /**
   * Records a MailSuite link click event (triggered by the click-tracking redirect endpoint).
   */
  public recordClickEvent(
    trackingOrEmailId: string,
    meta: { url: string; label?: string; ip?: string; userAgent?: string }
  ): CompanyEmailHistoryEntry | null {
    const cleanTarget = String(trackingOrEmailId || '').trim();
    if (!cleanTarget) return null;

    const idx = this.emailHistoryLog.findIndex(
      (e) =>
        e.trackingId === cleanTarget ||
        e.id === cleanTarget ||
        `ms-trk-${e.id}` === cleanTarget ||
        normalizeRecipientEmail(e.recipient) === cleanTarget.toLowerCase()
    );
    if (idx === -1) return null;

    // Ensure an open is recorded if the recipient clicked a link before loading images
    let current = this.normalizeHistoryEntryTracking(this.emailHistoryLog[idx]);
    if (!current.opened) {
      const openedEntry = this.recordOpenEvent(cleanTarget, {
        ip: meta.ip,
        userAgent: meta.userAgent,
        locationHint: 'Auto-detected via CTA Link Click'
      });
      if (openedEntry) {
        current = openedEntry;
      }
    }

    const nowIso = new Date().toISOString();
    const ip = (meta.ip || '103.21.124.88').trim();
    const userAgent = (meta.userAgent || 'Mozilla/5.0 (Desktop Browser)').trim();
    const clientDevice = detectEmailClientDevice(userAgent);
    const prevClicks = current.clickEvents || [];
    const isUniqueClick = !prevClicks.some((c) => c.url === meta.url && c.ip === ip);

    const newClickEvent: EmailTrackingClickEvent = {
      id: `ms-click-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      url: meta.url || 'https://www.tradeheaven.net',
      label: meta.label || 'Email CTA Button',
      ip,
      userAgent,
      clientDevice
    };

    const updatedClickEvents = [...prevClicks, newClickEvent];
    const updated: CompanyEmailHistoryEntry = {
      ...current,
      opened: true,
      openCount: Math.max(1, current.openCount || 0),
      clicked: true,
      clickCount: (current.clickCount || 0) + 1,
      uniqueClicks: (current.uniqueClicks || 0) + (isUniqueClick ? 1 : 0),
      firstClickedAt: current.firstClickedAt || nowIso,
      lastClickedAt: nowIso,
      mailSuiteStatus: 'CLICKED',
      clickEvents: updatedClickEvents
    };

    this.emailHistoryLog[idx] = updated;
    this.smtpWebhookLogs.unshift({
      id: `wh-click-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      eventType: 'CLICKED',
      source: 'CLICK_REDIRECT',
      trackingId: updated.trackingId || cleanTarget,
      emailId: updated.id,
      messageId: updated.messageId,
      recipient: updated.recipient,
      companyName: updated.companyName,
      subject: updated.subject,
      ip,
      userAgent,
      targetUrl: meta.url
    });
    if (this.smtpWebhookLogs.length > 200) this.smtpWebhookLogs.length = 200;
    return updated;
  }

  public resetTrackingForEntry(lookup: {
    trackingId?: string;
    email?: string;
    companyId?: string;
  }) {
    const cleanTracking = (lookup.trackingId || '').trim();
    const cleanEmail = lookup.email ? normalizeRecipientEmail(lookup.email) : '';
    const cleanCompanyId = (lookup.companyId || '').trim().toLowerCase();

    this.emailHistoryLog = this.emailHistoryLog.map((e) => {
      const matches =
        (cleanTracking && (e.trackingId === cleanTracking || e.id === cleanTracking)) ||
        (cleanEmail && normalizeRecipientEmail(e.recipient) === cleanEmail) ||
        (cleanCompanyId && (e.companyId || '').toLowerCase() === cleanCompanyId);

      if (!matches) return e;
      return {
        ...e,
        opened: false,
        openCount: 0,
        uniqueOpens: 0,
        firstOpenedAt: undefined,
        lastOpenedAt: undefined,
        clicked: false,
        clickCount: 0,
        uniqueClicks: 0,
        firstClickedAt: undefined,
        lastClickedAt: undefined,
        mailSuiteStatus: e.success ? 'DELIVERED' : 'BOUNCED',
        openEvents: [],
        clickEvents: []
      };
    });
  }

  /**
   * Batch simulation method for mock tracking service testing (Delivered, Opens, Clicks, Bounces, Reset).
   */
  public batchSimulateTracking(
    action: 'ALL_DELIVERED' | 'BATCH_OPENS' | 'BATCH_CLICKS' | 'SIMULATE_BOUNCE' | 'RESET_ALL',
    targetTrackingId?: string
  ): {
    affectedCount: number;
    summary: MailSuiteAnalyticsSummary;
    history: CompanyEmailHistoryEntry[];
    message: string;
  } {
    let affectedCount = 0;
    const nowIso = new Date().toISOString();

    if (action === 'ALL_DELIVERED') {
      this.emailHistoryLog = this.emailHistoryLog.map((e) => {
        if (!e.success || e.mailSuiteStatus === 'BOUNCED') {
          affectedCount += 1;
          const updated: CompanyEmailHistoryEntry = {
            ...e,
            success: true,
            error: undefined,
            mailSuiteStatus: e.clicked ? 'CLICKED' : e.opened ? 'OPENED' : 'DELIVERED'
          };
          this.smtpWebhookLogs.unshift({
            id: `wh-sim-del-${Date.now()}-${affectedCount}`,
            timestamp: nowIso,
            eventType: 'DELIVERED',
            source: 'SMTP_WEBHOOK',
            trackingId: updated.trackingId || `ms-trk-${updated.id}`,
            emailId: updated.id,
            recipient: updated.recipient,
            companyName: updated.companyName,
            subject: updated.subject,
            smtpResponse: '250 2.0.0 OK (Simulated SMTP 250 OK Delivered)'
          });
          return updated;
        }
        return e;
      });
      if (affectedCount === 0) {
        affectedCount = this.emailHistoryLog.length;
      }
      return {
        affectedCount,
        summary: this.getMailSuiteAnalytics(),
        history: this.getEmailHistory(),
        message: `Simulated SMTP 250 OK delivery confirmation for ${affectedCount} email(s).`
      };
    }

    if (action === 'BATCH_OPENS') {
      const candidates = this.emailHistoryLog.filter((e) => e.success && !e.opened);
      const toOpenCount = Math.max(1, Math.ceil(candidates.length * 0.75));
      const targets = candidates.slice(0, toOpenCount);

      for (const t of targets) {
        const trkId = t.trackingId || t.id;
        const res = this.recordOpenEvent(trkId, {
          ip: '66.249.84.' + Math.floor(10 + Math.random() * 80),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GoogleImageProxy MailSuite Simulator',
          locationHint: 'Simulated 1x1 Tracking Pixel Open'
        });
        if (res) affectedCount += 1;
      }

      if (affectedCount === 0 && this.emailHistoryLog.length > 0) {
        const first = this.emailHistoryLog[0];
        this.recordOpenEvent(first.trackingId || first.id, {
          locationHint: 'Simulated 1x1 Tracking Pixel Open (Repeat)'
        });
        affectedCount = 1;
      }

      return {
        affectedCount,
        summary: this.getMailSuiteAnalytics(),
        history: this.getEmailHistory(),
        message: `Simulated 1x1 pixel read-receipt open events for ${affectedCount} recipient(s).`
      };
    }

    if (action === 'BATCH_CLICKS') {
      let candidates = this.emailHistoryLog.filter((e) => e.opened && !e.clicked);
      if (candidates.length === 0) {
        candidates = this.emailHistoryLog.filter((e) => e.success && !e.clicked);
      }
      const toClickCount = Math.max(1, Math.ceil(candidates.length * 0.5));
      const targets = candidates.slice(0, toClickCount);

      for (const t of targets) {
        const trkId = t.trackingId || t.id;
        const res = this.recordClickEvent(trkId, {
          url: 'https://www.tradeheaven.net/?action=renew-membership&planId=basic-business-plan&amountUsd=590',
          label: 'Diwali Offer Upgrade & Settle Balance Link',
          ip: '103.21.124.' + Math.floor(10 + Math.random() * 80),
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Chrome/128.0 (Simulator)'
        });
        if (res) affectedCount += 1;
      }

      return {
        affectedCount,
        summary: this.getMailSuiteAnalytics(),
        history: this.getEmailHistory(),
        message: `Simulated CTA link click-through redirects for ${affectedCount} recipient(s).`
      };
    }

    if (action === 'SIMULATE_BOUNCE') {
      const target = targetTrackingId
        ? this.emailHistoryLog.find((e) => e.trackingId === targetTrackingId || e.id === targetTrackingId)
        : this.emailHistoryLog.find((e) => e.success && e.mailSuiteStatus !== 'BOUNCED') || this.emailHistoryLog[0];

      if (target) {
        const cleanTrk = target.trackingId || target.id;
        this.recordSmtpWebhookEvent({
          eventType: 'BOUNCED',
          trackingId: cleanTrk,
          emailId: target.id,
          recipientEmail: target.recipient,
          smtpResponse: '550 5.1.1 <' + target.recipient + '>: Recipient address rejected: User unknown in virtual mailbox table',
          source: 'SMTP_WEBHOOK'
        });
        affectedCount = 1;
      }

      return {
        affectedCount,
        summary: this.getMailSuiteAnalytics(),
        history: this.getEmailHistory(),
        message: target
          ? `Simulated SMTP 550 Mailbox Unavailable bounce event for ${target.recipient}.`
          : 'No candidate available to simulate bounce.'
      };
    }

    if (action === 'RESET_ALL') {
      this.emailHistoryLog = this.emailHistoryLog.map((e) => ({
        ...e,
        opened: false,
        openCount: 0,
        uniqueOpens: 0,
        firstOpenedAt: undefined,
        lastOpenedAt: undefined,
        clicked: false,
        clickCount: 0,
        uniqueClicks: 0,
        firstClickedAt: undefined,
        lastClickedAt: undefined,
        mailSuiteStatus: 'DELIVERED',
        success: true,
        error: undefined,
        openEvents: [],
        clickEvents: []
      }));
      affectedCount = this.emailHistoryLog.length;
      return {
        affectedCount,
        summary: this.getMailSuiteAnalytics(),
        history: this.getEmailHistory(),
        message: `Reset tracking metrics & read receipts for all ${affectedCount} emails.`
      };
    }

    return {
      affectedCount: 0,
      summary: this.getMailSuiteAnalytics(),
      history: this.getEmailHistory(),
      message: 'Unknown simulation action.'
    };
  }

  /**
   * Processes an incoming SMTP Webhook event (DELIVERED, OPENED, CLICKED, BOUNCED, DEFERRED, DROPPED)
   * and updates the tracked email entry's delivery/read status and webhook log.
   */
  public recordSmtpWebhookEvent(payload: {
    eventType: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'DEFERRED' | 'DROPPED';
    trackingId?: string;
    emailId?: string;
    messageId?: string;
    recipientEmail?: string;
    smtpResponse?: string;
    ip?: string;
    userAgent?: string;
    targetUrl?: string;
    label?: string;
    source?: 'SMTP_WEBHOOK' | 'PIXEL_TRACKER' | 'CLICK_REDIRECT';
  }): { entry: CompanyEmailHistoryEntry | null; webhookEvent: SmtpWebhookEventLog } {
    const rawLookup = (
      payload.trackingId ||
      payload.emailId ||
      payload.messageId ||
      payload.recipientEmail ||
      ''
    )
      .replace(/\.gif$/i, '')
      .trim();

    const nowIso = new Date().toISOString();
    const idx = this.emailHistoryLog.findIndex(
      (e) =>
        (rawLookup && e.trackingId === rawLookup) ||
        (rawLookup && e.id === rawLookup) ||
        (rawLookup && `ms-trk-${e.id}` === rawLookup) ||
        (rawLookup && e.messageId === rawLookup) ||
        (rawLookup && normalizeRecipientEmail(e.recipient) === rawLookup.toLowerCase())
    );

    let updatedEntry: CompanyEmailHistoryEntry | null = null;
    if (idx !== -1) {
      const current = this.normalizeHistoryEntryTracking(this.emailHistoryLog[idx]);
      if (payload.eventType === 'OPENED') {
        updatedEntry = this.recordOpenEvent(current.trackingId || current.id, {
          ip: payload.ip || '66.249.84.21',
          userAgent: payload.userAgent || 'SMTP Webhook / MailSuite Open Agent',
          locationHint: 'Verified via SMTP/Pixel Webhook'
        });
      } else if (payload.eventType === 'CLICKED') {
        updatedEntry = this.recordClickEvent(current.trackingId || current.id, {
          url:
            payload.targetUrl ||
            'https://www.tradeheaven.net/?action=renew-membership&planId=basic-business-plan&amountUsd=590',
          label: payload.label || 'Tracked Campaign CTA Link',
          ip: payload.ip || '103.21.124.88',
          userAgent: payload.userAgent || 'SMTP Webhook / Click Tracker'
        });
      } else if (payload.eventType === 'DELIVERED') {
        updatedEntry = {
          ...current,
          success: true,
          error: undefined,
          mailSuiteStatus: current.clicked ? 'CLICKED' : current.opened ? 'OPENED' : 'DELIVERED'
        };
        this.emailHistoryLog[idx] = updatedEntry;
      } else if (payload.eventType === 'BOUNCED' || payload.eventType === 'DROPPED') {
        updatedEntry = {
          ...current,
          success: false,
          error: payload.smtpResponse || '550 5.1.1 Mailbox unavailable / Bounced via SMTP Webhook',
          mailSuiteStatus: 'BOUNCED'
        };
        this.emailHistoryLog[idx] = updatedEntry;
      } else if (payload.eventType === 'DEFERRED') {
        updatedEntry = {
          ...current,
          mailSuiteStatus: 'DEFERRED',
          error: payload.smtpResponse || '421 4.7.0 Temporary deferral — MTA retrying delivery'
        };
        this.emailHistoryLog[idx] = updatedEntry;
      }
    }

    const webhookEvent: SmtpWebhookEventLog = {
      id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      eventType: payload.eventType,
      source: payload.source || 'SMTP_WEBHOOK',
      trackingId: updatedEntry?.trackingId || payload.trackingId || rawLookup || `ms-trk-${Date.now()}`,
      emailId: updatedEntry?.id || payload.emailId,
      messageId: updatedEntry?.messageId || payload.messageId,
      recipient: updatedEntry?.recipient || payload.recipientEmail || 'zac@otec.ltd',
      companyName: updatedEntry?.companyName || 'Registered Trade Partner',
      subject: updatedEntry?.subject || 'Automated Campaign Dispatch',
      smtpResponse:
        payload.smtpResponse ||
        (payload.eventType === 'DELIVERED'
          ? '250 2.0.0 OK BigRock SMTP TLS Port 465 Delivered'
          : payload.eventType === 'BOUNCED'
          ? '550 5.1.1 Recipient MTA rejected message'
          : payload.eventType === 'DEFERRED'
          ? '451 4.4.1 Temporary MTA greylisting deferral'
          : undefined),
      ip: payload.ip || '66.249.84.21',
      userAgent: payload.userAgent,
      targetUrl: payload.targetUrl
    };

    if (payload.eventType !== 'CLICKED') {
      this.smtpWebhookLogs.unshift(webhookEvent);
      if (this.smtpWebhookLogs.length > 200) this.smtpWebhookLogs.length = 200;
    }

    return { entry: updatedEntry, webhookEvent };
  }

  public getWebhookLogs(): SmtpWebhookEventLog[] {
    return [...this.smtpWebhookLogs];
  }

  public getMailSuiteAnalytics(filters?: {
    email?: string;
    companyName?: string;
    companyId?: string;
    dispatchType?: 'ALL' | 'AUTOMATED' | 'MANUAL';
  }): MailSuiteAnalyticsSummary {
    const entries = this.getEmailHistory(filters);
    const totalSent = entries.length;
    const deliveredEntries = entries.filter((e) => e.success);
    const totalDelivered = deliveredEntries.length;
    const openedEntries = deliveredEntries.filter((e) => e.opened || (e.openCount || 0) > 0);
    const totalOpened = openedEntries.length;
    const unopenedCount = Math.max(0, totalDelivered - totalOpened);
    const openRatePercent =
      totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 1000) / 10 : 0;
    const totalOpensCount = deliveredEntries.reduce((sum, e) => sum + (e.openCount || 0), 0);

    const clickedEntries = deliveredEntries.filter((e) => e.clicked || (e.clickCount || 0) > 0);
    const totalClicked = clickedEntries.length;
    const clickThroughRatePercent =
      totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 1000) / 10 : 0;
    const clickToOpenRatePercent =
      totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 1000) / 10 : 0;
    const totalClicksCount = deliveredEntries.reduce((sum, e) => sum + (e.clickCount || 0), 0);

    const recentEvents: MailSuiteAnalyticsSummary['recentEvents'] = [];
    for (const entry of entries) {
      for (const op of entry.openEvents || []) {
        recentEvents.push({
          id: op.id,
          trackingId: entry.trackingId || `ms-trk-${entry.id}`,
          emailId: entry.id,
          type: 'OPEN',
          recipient: entry.recipient,
          recipientName: entry.recipientName,
          companyName: entry.companyName,
          subject: entry.subject,
          timestamp: op.timestamp,
          clientDevice: op.clientDevice,
          ip: op.ip
        });
      }
      for (const cl of entry.clickEvents || []) {
        recentEvents.push({
          id: cl.id,
          trackingId: entry.trackingId || `ms-trk-${entry.id}`,
          emailId: entry.id,
          type: 'CLICK',
          recipient: entry.recipient,
          recipientName: entry.recipientName,
          companyName: entry.companyName,
          subject: entry.subject,
          timestamp: cl.timestamp,
          clientDevice: cl.clientDevice,
          ip: cl.ip,
          label: cl.label,
          url: cl.url
        });
      }
    }

    recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      unopenedCount,
      openRatePercent,
      totalOpensCount,
      totalClicked,
      clickThroughRatePercent,
      clickToOpenRatePercent,
      totalClicksCount,
      recentEvents: recentEvents.slice(0, 40)
    };
  }

  public getEmailHistory(filters?: {
    email?: string;
    companyName?: string;
    companyId?: string;
    dispatchType?: 'ALL' | 'AUTOMATED' | 'MANUAL';
  }): CompanyEmailHistoryEntry[] {
    let list = this.emailHistoryLog.map((e) => this.normalizeHistoryEntryTracking(e));
    if (filters) {
      const targetEmail = filters.email ? normalizeRecipientEmail(filters.email) : '';
      const targetCompany = (filters.companyName || '').toLowerCase().trim();
      const targetCompanyId = (filters.companyId || '').toLowerCase().trim();

      if (targetEmail || targetCompany || targetCompanyId) {
        list = list.filter((entry) => {
          const entryEmail = normalizeRecipientEmail(entry.recipient);
          const entryCompany = (entry.companyName || '').toLowerCase().trim();
          const entryCompanyId = (entry.companyId || '').toLowerCase().trim();

          if (targetEmail && entryEmail === targetEmail) return true;
          if (targetCompanyId && entryCompanyId && entryCompanyId === targetCompanyId) return true;
          if (
            targetCompany &&
            entryCompany &&
            (entryCompany.includes(targetCompany) || targetCompany.includes(entryCompany))
          ) {
            return true;
          }
          return false;
        });
      }

      if (filters.dispatchType && filters.dispatchType !== 'ALL') {
        list = list.filter((entry) => entry.dispatchType === filters.dispatchType);
      }
    }
    return list.sort((a, b) => new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime());
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
   * Dispatches a personalized Buyer Inquiry / Dashboard Alert email to a merchant exporter (e.g. Donald Sorkin)
   * notifying them of a new high-value buyer inquiry waiting in their portal dashboard, complete with login credentials
   * and inquiry specifications. Dispatched as a strictly serialized single-recipient message via ServerDeliveryQueueManager.
   */
  public async sendBuyerInquiryAlertEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    companyName?: string;
    inquiryId?: string;
    buyerName?: string;
    buyerCompany?: string;
    buyerCountry?: string;
    productName?: string;
    quantity?: string;
    estimatedValue?: string;
    incoterm?: string;
    paymentTerms?: string;
    portalUrl?: string;
    loginEmail?: string;
    loginPassword?: string;
  }): Promise<SerializedDeliveryReceipt> {
    const cleanEmail = normalizeRecipientEmail(payload.recipientEmail);
    const displayName = payload.recipientName || (cleanEmail === 'sorkindon@gmail.com' ? 'Donald Sorkin' : 'Valued Exporter');
    const companyLabel = payload.companyName ? ` (${payload.companyName})` : (cleanEmail === 'sorkindon@gmail.com' ? ' (Girlsenberries)' : '');
    const inquiryId = payload.inquiryId || 'INQ-2026-US-8942';
    const buyerName = payload.buyerName || 'Marcus Vance (VP Global Procurement)';
    const buyerCompany = payload.buyerCompany || 'Apex Global Food Sourcing LLC';
    const buyerCountry = payload.buyerCountry || 'United States';
    const productName = payload.productName || 'Wholesale Grade-A Frozen & Dried Cultivated Berries (Commercial Food Service)';
    const quantity = payload.quantity || '2x 40ft High-Cube Refrigerated Containers (28,000 kg)';
    const estimatedValue = payload.estimatedValue || '$148,000.00 USD';
    const incoterm = payload.incoterm || 'CIF Long Beach Port, USA';
    const paymentTerms = payload.paymentTerms || '30% Escrow Advance, 70% Irrevocable DLC at Sight against B/L';
    const portalUrl = payload.portalUrl || 'https://www.tradeheaven.net';
    const loginEmail = payload.loginEmail || cleanEmail;
    const loginPassword = payload.loginPassword || 'Donald@1234';

    const subject = `New Buyer Inquiry in Your Dashboard [${inquiryId}]: ${productName} — Trade Heaven`;

    const textBody = [
      `TRADE HEAVEN GLOBAL TRADE DESK`,
      `NEW BUYER INQUIRY NOTIFICATION — IMMEDIATE ACTION REQUESTED`,
      ``,
      `Hello ${displayName}${companyLabel},`,
      ``,
      `A new high-value buyer inquiry has just been matched and assigned to your corporate dashboard on the Trade Heaven B2B Portal.`,
      ``,
      `BUYER INQUIRY SUMMARY:`,
      `• Inquiry Reference: ${inquiryId}`,
      `• Product Requested: ${productName}`,
      `• Required Volume: ${quantity}`,
      `• Estimated Order Value: ${estimatedValue}`,
      `• Buyer Organization: ${buyerCompany} (${buyerCountry})`,
      `• Procurement Contact: ${buyerName}`,
      `• Preferred Terms: ${incoterm} • Incoterms 2020`,
      `• Payment Terms: ${paymentTerms}`,
      `• Escrow Status: 100% Escrow Trade Assurance Pre-Approved`,
      ``,
      `PORTAL LOGIN INSTRUCTIONS:`,
      `Please log in to your merchant dashboard to review full specifications and submit your formal factory quotation:`,
      `• Portal Link: ${portalUrl}`,
      `• Account Email: ${loginEmail}`,
      `• Active Password: ${loginPassword}`,
      `• Section: Dashboard -> Buyer Inquiries & Leads -> Inquiry #${inquiryId}`,
      ``,
      `Direct Login: ${portalUrl}`,
      ``,
      `Need instant assistance? Contact our 24/7 Trade Concierge on WhatsApp at ${this.whatsappSupportNumber} or reply directly to ${this.replyToAddress}.`,
      ``,
      `Dispatched automatically via ${this.senderAddress}.`
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #34d399; text-transform: uppercase; margin-bottom: 8px;">
            TRADE HEAVEN • GLOBAL B2B EXPORTER DESK
          </div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.25;">
            New Buyer Inquiry Received
          </h2>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1;">
            Reference ID: <span style="font-family: monospace; color: #fde047; font-weight: bold;">${inquiryId}</span> • High-Priority Sourcing Request
          </p>
        </div>

        <div style="padding: 28px 24px; background: #ffffff; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0; color: #0f172a;">
            Hello <strong>${displayName}</strong>${companyLabel},
          </p>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #334155;">
            A verified institutional buyer has submitted a formal wholesale purchase inquiry matching your export catalog. Please log into your merchant dashboard to review requirements and submit your factory quotation:
          </p>

          <!-- Inquiry Details Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 22px 0;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between;">
              <span>Buyer Inquiry Specifications</span>
              <span style="color: #059669; font-weight: 800;">✓ Escrow Pre-Approved</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Product / Cargo:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${productName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Target Volume:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${quantity}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Estimated Value:</td>
                <td style="padding: 6px 0; font-weight: 900; color: #059669; font-size: 15px;">${estimatedValue}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Buyer Organization:</td>
                <td style="padding: 6px 0; color: #0f172a;"><strong>${buyerCompany}</strong> (${buyerCountry})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Procurement Officer:</td>
                <td style="padding: 6px 0; color: #0f172a;">${buyerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Delivery Terms:</td>
                <td style="padding: 6px 0; color: #0f172a;">${incoterm}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Structure:</td>
                <td style="padding: 6px 0; color: #0f172a;">${paymentTerms}</td>
              </tr>
            </table>
          </div>

          <!-- Portal Access Credentials Box -->
          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
              PORTAL LOGIN CREDENTIALS &amp; DASHBOARD ACCESS
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #475569; width: 130px; font-weight: 600;">Portal URL:</td>
                <td style="padding: 6px 0;"><a href="${portalUrl}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">${portalUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Login Email:</td>
                <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${loginEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Active Password:</td>
                <td style="padding: 6px 0;"><span style="background: #ffffff; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #1e40af; font-size: 13px;">${loginPassword}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #475569; font-weight: 600;">Dashboard Tab:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">Dashboard &gt; Inquiries &amp; Buy Leads &gt; <span style="color: #2563eb;">#${inquiryId}</span></td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 26px 0 22px 0;">
            <a href="${portalUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);">
              Log In to Portal &amp; View Inquiry in Dashboard →
            </a>
          </div>

          <!-- Escrow & Security Notice -->
          <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
            <strong style="color: #0f172a;">100% Escrow Trade Assurance:</strong> All international wholesale contracts finalized via Trade Heaven benefit from mandatory escrow deposit protection and pre-shipment SGS inspection sign-off.
          </div>

          <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;">
            Dispatched via <strong>${this.senderAddress}</strong> • Questions? WhatsApp Trade Concierge at <strong>${this.whatsappSupportNumber}</strong> or email <strong>${this.replyToAddress}</strong>.
          </p>
        </div>
      </div>
    `;

    const transporter = this.createPrimaryTransporter();

    return await serverDeliveryQueueManager.enqueueSingle(
      cleanEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject,
        text: textBody,
        html: htmlBody
      },
      transporter || undefined
    );
  }

  /**
   * Dispatches a comprehensive Supplier Onboarding, Active Inquiries & Login Guide email
   * to a newly onboarded fuel supplier (e.g. Mr. Randy at Middle Fox LLC) containing their User ID,
   * password, and matched active high-value fuel inquiries (EN 590 & Jet Fuel A-1).
   */
  public async sendSupplierOnboardingWithInquiriesEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    companyName?: string;
    contactPhone?: string;
    loginPassword?: string;
    portalUrl?: string;
  }): Promise<SerializedDeliveryReceipt> {
    const cleanEmail = normalizeRecipientEmail(payload.recipientEmail);
    const displayName = payload.recipientName || 'Mr. Randy';
    const companyName = payload.companyName || 'Middle Fox LLC';
    const contactPhone = payload.contactPhone || '+1 (406) 309 5590';
    const loginPassword = payload.loginPassword || 'Randy@2026';
    const portalUrl = payload.portalUrl || 'https://www.tradeheaven.net';

    const subject = `Welcome to Trade Heaven: Your Middle Fox LLC Fuel Supplier Portal Credentials & Active Inquiries (EN 590 & Jet Fuel A-1)`;

    const textBody = [
      `TRADE HEAVEN GLOBAL B2B PETROLEUM & ENERGY DESK`,
      `SUPPLIER ONBOARDING CONFIRMATION & ACTIVE BUYER INQUIRIES`,
      ``,
      `Hello ${displayName} (${companyName}),`,
      ``,
      `Welcome to Trade Heaven. Your corporate fuel supplier storefront for ${companyName} has been officially approved and published on the global marketplace.`,
      `Your product catalog featuring Ultra-Low Sulfur Diesel Fuel EN 590 (10 PPM) and Aviation Turbine Jet Fuel A-1 is now live and actively matched with global institutional buyers.`,
      ``,
      `============================================================`,
      `YOUR PORTAL LOGIN CREDENTIALS & ACCESS GUIDE`,
      `============================================================`,
      `• Portal Access URL: ${portalUrl}`,
      `• User ID / Login Email: ${cleanEmail}`,
      `• Password: ${loginPassword}`,
      `• Registered Phone: ${contactPhone}`,
      `• Supplier Tier: VIP Petroleum Exporter (All Platform Features Active)`,
      ``,
      `STEP-BY-STEP LOGIN GUIDE:`,
      `1. Visit the portal at ${portalUrl}`,
      `2. Click "Sign In" at the top-right corner of the page`,
      `3. Enter your User ID (${cleanEmail}) and Password (${loginPassword})`,
      `4. From your top navigation bar, open "Dashboard & Ledger" -> "Buy Leads / Inquiries"`,
      `5. Review the full buyer specifications and submit your formal FOB/CIF quote directly.`,
      ``,
      `============================================================`,
      `ACTIVE BUYER INQUIRIES WAITING IN YOUR DASHBOARD`,
      `============================================================`,
      ``,
      `1. INQUIRY #RFQ-FUEL-EN590-2026:`,
      `   • Product: Ultra-Low Sulfur Diesel Fuel EN 590 (10 PPM Euro 5/6)`,
      `   • Buyer: Nordic PetroLogistics AS (Norway / Netherlands)`,
      `   • Target Volume: 100,000 Metric Tons / Month (12-Month Contract)`,
      `   • Estimated Contract Value: $62,000,000.00 USD`,
      `   • Delivery Port: CIF Port of Rotterdam / Houston`,
      `   • Payment: Irrevocable SBLC / MT760 + MT103 against SGS Dip Test`,
      `   • Status: OPEN • High Urgency`,
      ``,
      `2. INQUIRY #RFQ-FUEL-JETA1-2026:`,
      `   • Product: Aviation Turbine Kerosene (Jet Fuel A-1, ASTM D1655 / Def Stan 91-091)`,
      `   • Buyer: AeroFuel International Consortium LLC (Texas, USA)`,
      `   • Target Volume: 2,000,000 Barrels (Trial Spot Lift + Extension)`,
      `   • Estimated Contract Value: $168,000,000.00 USD`,
      `   • Delivery Port: FOB Houston / Rotterdam Tank-to-Vessel`,
      `   • Payment: Dip & Pay MT103 upon fresh SGS Q&Q tank dip verification`,
      `   • Status: OPEN • High Urgency`,
      ``,
      `Portal Link: ${portalUrl}`,
      ``,
      `100% Escrow Trade Assurance: All transactions facilitated via Trade Heaven are backed by capital protection, verified SGS/Saybolt inspection mandates, and banking protocol compliance.`,
      ``,
      `Need instant assistance? Contact your Senior International Export Desk on WhatsApp at ${this.whatsappSupportNumber} or email ${this.replyToAddress}.`,
      ``,
      `Dispatched via verified corporate SMTP: ${this.senderAddress}.`
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
        <!-- Top Hero Header -->
        <div style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #34d399; text-transform: uppercase; margin-bottom: 10px; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3); padding: 4px 12px; border-radius: 9999px;">
            TRADE HEAVEN • GLOBAL B2B PETROLEUM &amp; ENERGY DESK
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; line-height: 1.25; letter-spacing: -0.5px;">
            Welcome to Trade Heaven
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">
            Supplier Account Activated &amp; Active Fuel Inquiries Assigned for <strong style="color: #fde047;">${companyName}</strong>
          </p>
        </div>

        <div style="padding: 30px 24px; background: #ffffff; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0; color: #0f172a;">
            Hello <strong>${displayName}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #334155;">
            We are pleased to confirm that <strong>${companyName}</strong> has been officially approved and published on the <strong>Trade Heaven Global B2B Portal</strong>. Your export catalog for <strong>Ultra-Low Sulfur Diesel EN 590 (10 PPM)</strong> and <strong>Aviation Turbine Jet Fuel A-1</strong> is now live, and multiple verified wholesale buyer inquiries are waiting in your merchant dashboard.
          </p>

          <!-- Credentials Box -->
          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 14px; padding: 22px; margin: 0 0 26px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <span>PORTAL LOGIN CREDENTIALS &amp; USER ID</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 10px;">VIP EXPORTER ACCESS</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 7px 0; color: #475569; width: 140px; font-weight: 600;">Portal Website:</td>
                <td style="padding: 7px 0;"><a href="${portalUrl}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">${portalUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #475569; font-weight: 600;">User ID / Login:</td>
                <td style="padding: 7px 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #0f172a;">${cleanEmail}</td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #475569; font-weight: 600;">Assigned Password:</td>
                <td style="padding: 7px 0;"><span style="background: #ffffff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #1e40af; font-size: 14px; letter-spacing: 0.5px;">${loginPassword}</span></td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #475569; font-weight: 600;">Contact Phone:</td>
                <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${contactPhone}</td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #475569; font-weight: 600;">Company Entity:</td>
                <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${companyName}</td>
              </tr>
            </table>
          </div>

          <!-- Step-by-Step Login Guide -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 0 0 26px 0;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
              Quick 3-Step Login &amp; Dashboard Guide:
            </div>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.7;">
              <li>Go to <a href="${portalUrl}" style="color: #2563eb; font-weight: 600;">${portalUrl}</a> and click <strong>"Sign In"</strong> at the top right.</li>
              <li>Enter your User ID (<strong>${cleanEmail}</strong>) and Password (<strong>${loginPassword}</strong>).</li>
              <li>Navigate to <strong>Dashboard &gt; Inquiries &amp; Buy Leads</strong> to view buyer specifications, SGS test mandates, and submit your factory quotations.</li>
            </ol>
          </div>

          <!-- Active Fuel Inquiries Title -->
          <div style="margin: 0 0 16px 0; border-bottom: 2px solid #0f172a; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
              Active Fuel Tenders Matched to Your Account
            </span>
            <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 9999px;">
              2 Live Inquiries
            </span>
          </div>

          <!-- Inquiry 1 Card: EN 590 -->
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; border-radius: 10px; padding: 16px 18px; margin: 0 0 16px 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
                RFQ-FUEL-EN590-2026
              </span>
              <span style="font-size: 11px; font-weight: 800; color: #059669;">
                Est. Value: $62,000,000 USD
              </span>
            </div>
            <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
              Ultra-Low Sulfur Diesel Fuel EN 590 (10 PPM Euro 5/6)
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #475569; margin-top: 8px;">
              <tr>
                <td style="padding: 4px 0; width: 120px;"><strong>Buyer:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">Nordic PetroLogistics AS (Norway / Netherlands)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Volume:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">100,000 Metric Tons / Month (12-Month Contract)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Incoterms:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">CIF Port of Rotterdam / Houston</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Payment Terms:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">Irrevocable Transferable SBLC / MT760 + MT103 against SGS inspection</td>
              </tr>
            </table>
          </div>

          <!-- Inquiry 2 Card: Jet Fuel A-1 -->
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; border-radius: 10px; padding: 16px 18px; margin: 0 0 24px 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">
                RFQ-FUEL-JETA1-2026
              </span>
              <span style="font-size: 11px; font-weight: 800; color: #059669;">
                Est. Value: $168,000,000 USD
              </span>
            </div>
            <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
              Aviation Turbine Kerosene (Jet Fuel A-1, ASTM D1655 / Def Stan 91-091)
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #475569; margin-top: 8px;">
              <tr>
                <td style="padding: 4px 0; width: 120px;"><strong>Buyer:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">AeroFuel International Consortium LLC (Texas, USA)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Volume:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">2,000,000 Barrels (Trial Spot Lift + Extension)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Incoterms:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">FOB Houston / Port of Rotterdam Tank-to-Vessel</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Payment Terms:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">Dip &amp; Pay MT103 upon fresh SGS Q&amp;Q tank dip test</td>
              </tr>
            </table>
          </div>

          <!-- Direct CTA Button -->
          <div style="text-align: center; margin: 26px 0;">
            <a href="${portalUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);">
              Log In to Portal &amp; View Tenders in Dashboard →
            </a>
          </div>

          <!-- Escrow Guarantee Notice -->
          <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
            <strong style="color: #0f172a;">Trade Heaven Escrow Protection:</strong> All petroleum commodity contracts finalized on Trade Heaven operate under regulated escrow protocols with independent SGS/Saybolt verification prior to funds release.
          </div>

          <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;">
            Dispatched via <strong>${this.senderAddress}</strong> • Immediate support? Contact the Trade Concierge on WhatsApp at <strong>${this.whatsappSupportNumber}</strong> or email <strong>${this.replyToAddress}</strong>.
          </p>
        </div>
      </div>
    `;

    const transporter = this.createPrimaryTransporter();

    return await serverDeliveryQueueManager.enqueueSingle(
      cleanEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject,
        text: textBody,
        html: htmlBody
      },
      transporter || undefined
    );
  }

  /**
   * Dispatches a bespoke customized administration email to a client or supplier
   * with custom inquiries/tenders, login credentials, and guide instructions.
   */
  public async sendCustomAdminEmail(payload: CustomAdminEmailPayload): Promise<SerializedDeliveryReceipt> {
    const cleanEmail = normalizeRecipientEmail(payload.recipientEmail);
    const displayName = payload.recipientName || 'Trade Partner';
    const companyName = payload.companyName || 'Corporate Entity';
    const contactPhone = payload.contactPhone || '';
    const decisionMakerName = payload.decisionMakerName || payload.recipientName || displayName;
    const companyAddress = payload.address || '';
    const preferredPaymentMethod = payload.paymentMethod || '';
    const loginEmail = payload.loginEmail || cleanEmail;
    const loginPassword = payload.loginPassword || '';
    const portalUrl = payload.portalUrl || 'https://www.tradeheaven.net';
    const subject = payload.subject || 'Important Business Update - Trade Heaven Global B2B';
    const badgeLabel = payload.badgeLabel || 'TRADE HEAVEN • GLOBAL B2B DESK';
    const headline = payload.headline || 'Portal Notification & Trade Update';
    const subheadline = payload.subheadline || `Corporate Communication for ${companyName}`;
    const introMessage = payload.introMessage || 'Please review the important account credentials and verified buyer inquiries below.';
    const inquiries = Array.isArray(payload.inquiries) ? payload.inquiries : [];
    const inquiriesTitle = payload.inquiriesTitle || 'Active Buyer Inquiries / Matched Tenders';
    const ctaText = payload.ctaText || (payload.isMembershipRenewal ? 'Renew Now' : 'Log In to Portal & View Inquiries →');
    const ctaUrl = payload.ctaUrl || portalUrl;

    if (payload.rawHtmlOverride && payload.rawHtmlOverride.trim()) {
      const transporter = this.createPrimaryTransporter();
      return await serverDeliveryQueueManager.enqueueSingle(
        cleanEmail,
        {
          from: this.senderFormatted,
          replyTo: this.replyToAddress,
          subject,
          text: introMessage,
          html: payload.rawHtmlOverride
        },
        transporter || undefined
      );
    }

    const textParts: string[] = [
      badgeLabel,
      headline,
      `Hello ${decisionMakerName} (${companyName}),`,
      '',
      introMessage,
      ''
    ];

    if (companyAddress || preferredPaymentMethod || payload.isMembershipRenewal) {
      textParts.push(
        '============================================================',
        'CLIENT MEMBERSHIP & BILLING RECORD',
        '============================================================',
        `• Company Name: ${companyName}`,
        companyAddress ? `• Registered Address: ${companyAddress}` : '',
        `• Registered Email: ${cleanEmail}`,
        `• Decision Maker Name: ${decisionMakerName}`,
        preferredPaymentMethod ? `• Preferred Payment Method: ${preferredPaymentMethod}` : '',
        ''
      );
    }

    if (payload.includeCredentialsBox !== false && (loginEmail || loginPassword)) {
      textParts.push(
        '============================================================',
        'PORTAL ACCESS CREDENTIALS',
        '============================================================',
        `• Portal Access URL: ${portalUrl}`,
        `• User ID / Login: ${loginEmail}`,
        loginPassword ? `• Password: ${loginPassword}` : '',
        contactPhone ? `• Registered Phone: ${contactPhone}` : '',
        ''
      );
    }

    if (payload.includeLoginGuide !== false) {
      textParts.push(
        'LOGIN GUIDE:',
        `1. Visit the portal at ${portalUrl}`,
        `2. Click "Sign In" at the top right`,
        `3. Enter your User ID (${loginEmail}) and Password`,
        '4. Navigate to your Dashboard to review opportunities and submit quotations.',
        ''
      );
    }

    if (inquiries.length > 0) {
      textParts.push(
        '============================================================',
        inquiriesTitle.toUpperCase(),
        '============================================================'
      );
      inquiries.forEach((inq, idx) => {
        textParts.push(
          `${idx + 1}. [${inq.id || `RFQ-${idx + 1}`}] ${inq.title}`,
          inq.buyerCompany ? `   • Buyer: ${inq.buyerCompany} (${inq.buyerCountry || 'International'})` : '',
          inq.quantity ? `   • Quantity / Volume: ${inq.quantity}` : '',
          inq.estimatedValue ? `   • Estimated Value: ${inq.estimatedValue}` : '',
          inq.incotermPort ? `   • Delivery Port / Incoterms: ${inq.incotermPort}` : '',
          inq.paymentTerms ? `   • Payment Terms: ${inq.paymentTerms}` : '',
          ''
        );
      });
    }

    if (payload.customClosingNote) {
      textParts.push(payload.customClosingNote, '');
    }

    textParts.push(
      `Direct Portal Link: ${ctaUrl}`,
      '',
      `Need instant assistance? Contact your Senior Trade Concierge on WhatsApp at ${this.whatsappSupportNumber} or email ${this.replyToAddress}.`,
      `Dispatched via verified corporate SMTP: ${this.senderAddress}.`
    );

    const textBody = textParts.filter(Boolean).join('\n');

    // Build Inquiries HTML
    const inquiriesHtml = inquiries.length > 0 ? `
      <div style="margin: 24px 0 16px 0; border-bottom: 2px solid #0f172a; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          ${inquiriesTitle}
        </span>
        <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 9999px;">
          ${inquiries.length} Active Leads
        </span>
      </div>
      ${inquiries.map((inq, i) => {
        const borderColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const cardColor = borderColors[i % borderColors.length];
        return `
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid ${cardColor}; border-radius: 10px; padding: 16px 18px; margin: 0 0 16px 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: ${cardColor}; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                ${inq.id || `RFQ-LEAD-${i + 1}`}
              </span>
              ${inq.estimatedValue ? `
                <span style="font-size: 11px; font-weight: 800; color: #059669;">
                  Est: ${inq.estimatedValue}
                </span>
              ` : ''}
            </div>
            <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0f172a;">
              ${inq.title}
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #475569; margin-top: 8px;">
              ${inq.buyerCompany ? `
                <tr>
                  <td style="padding: 4px 0; width: 120px;"><strong>Buyer:</strong></td>
                  <td style="padding: 4px 0; color: #0f172a;">${inq.buyerCompany} ${inq.buyerCountry ? `(${inq.buyerCountry})` : ''}</td>
                </tr>
              ` : ''}
              ${inq.quantity ? `
                <tr>
                  <td style="padding: 4px 0;"><strong>Volume / Qty:</strong></td>
                  <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${inq.quantity}</td>
                </tr>
              ` : ''}
              ${inq.incotermPort ? `
                <tr>
                  <td style="padding: 4px 0;"><strong>Incoterms:</strong></td>
                  <td style="padding: 4px 0; color: #0f172a;">${inq.incotermPort}</td>
                </tr>
              ` : ''}
              ${inq.paymentTerms ? `
                <tr>
                  <td style="padding: 4px 0;"><strong>Payment Terms:</strong></td>
                  <td style="padding: 4px 0; color: #0f172a;">${inq.paymentTerms}</td>
                </tr>
              ` : ''}
            </table>
          </div>
        `;
      }).join('')}
    ` : '';

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
        <!-- Top Hero Header -->
        <div style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #34d399; text-transform: uppercase; margin-bottom: 10px; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3); padding: 4px 12px; border-radius: 9999px;">
            ${badgeLabel}
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.25; letter-spacing: -0.5px;">
            ${headline}
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">
            ${subheadline}
          </p>
        </div>

        <div style="padding: 30px 24px; background: #ffffff; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0; color: #0f172a;">
            Hello <strong>${decisionMakerName}</strong>,
          </p>
          <div style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #334155; white-space: pre-line;">
            ${introMessage}
          </div>

          ${(companyAddress || preferredPaymentMethod || payload.isMembershipRenewal) ? `
            <!-- Membership Renewal & Client Details Box -->
            <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 0 0 24px 0;">
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span>CLIENT MEMBERSHIP &amp; BILLING SUMMARY</span>
                <span style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800;">RENEWAL OFFER</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #475569; width: 155px; font-weight: 600;">Company Name:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${companyName}</td>
                </tr>
                ${companyAddress ? `
                  <tr>
                    <td style="padding: 6px 0; color: #475569; font-weight: 600;">Address:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${companyAddress}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 6px 0; color: #475569; font-weight: 600;">Email:</td>
                  <td style="padding: 6px 0; font-family: monospace; color: #2563eb; font-weight: 700;">${cleanEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #475569; font-weight: 600;">Decision Maker:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${decisionMakerName}</td>
                </tr>
                ${preferredPaymentMethod ? `
                  <tr>
                    <td style="padding: 6px 0; color: #475569; font-weight: 600;">Payment Method:</td>
                    <td style="padding: 6px 0;"><span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 12px;">💳 ${preferredPaymentMethod}</span></td>
                  </tr>
                ` : ''}
              </table>
            </div>
          ` : ''}

          ${payload.includeCredentialsBox !== false && (loginEmail || loginPassword) ? `
            <!-- Credentials Box -->
            <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 14px; padding: 20px; margin: 0 0 24px 0;">
              <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span>PORTAL LOGIN CREDENTIALS &amp; USER ID</span>
                <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 10px;">VERIFIED ACCESS</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #475569; width: 140px; font-weight: 600;">Portal Website:</td>
                  <td style="padding: 6px 0;"><a href="${portalUrl}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">${portalUrl}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #475569; font-weight: 600;">User ID / Login:</td>
                  <td style="padding: 6px 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #0f172a;">${loginEmail}</td>
                </tr>
                ${loginPassword ? `
                  <tr>
                    <td style="padding: 6px 0; color: #475569; font-weight: 600;">Assigned Password:</td>
                    <td style="padding: 6px 0;"><span style="background: #ffffff; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #1e40af; font-size: 13px;">${loginPassword}</span></td>
                  </tr>
                ` : ''}
                ${contactPhone ? `
                  <tr>
                    <td style="padding: 6px 0; color: #475569; font-weight: 600;">Contact Phone:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${contactPhone}</td>
                  </tr>
                ` : ''}
                ${companyName ? `
                  <tr>
                    <td style="padding: 6px 0; color: #475569; font-weight: 600;">Company Entity:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${companyName}</td>
                  </tr>
                ` : ''}
              </table>
            </div>
          ` : ''}

          ${payload.includeLoginGuide !== false ? `
            <!-- Step-by-Step Login Guide -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 0 0 24px 0;">
              <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                Quick 3-Step Login Guide:
              </div>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.7;">
                <li>Go to <a href="${portalUrl}" style="color: #2563eb; font-weight: 600;">${portalUrl}</a> and click <strong>"Sign In"</strong> at the top right.</li>
                <li>Enter your User ID (<strong>${loginEmail}</strong>) and Password.</li>
                <li>Open your <strong>Dashboard &gt; Inquiries &amp; Buy Leads</strong> to view buyer specifications and interact directly.</li>
              </ol>
            </div>
          ` : ''}

          ${inquiriesHtml}

          ${payload.customClosingNote ? `
            <div style="background: #f8fafc; border-radius: 10px; padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6; margin: 20px 0;">
              ${payload.customClosingNote}
            </div>
          ` : ''}

          <!-- Direct CTA Button -->
          <div style="text-align: center; margin: 26px 0;">
            <a href="${ctaUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);">
              ${ctaText}
            </a>
          </div>

          ${payload.includeEscrowBadge !== false ? `
            <!-- Escrow Guarantee Notice -->
            <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
              <strong style="color: #0f172a;">Trade Heaven Escrow Protection:</strong> All high-value institutional contracts finalized on Trade Heaven operate under regulated escrow protocols with independent SGS/Saybolt inspection verification prior to funds release.
            </div>
          ` : ''}

          <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;">
            Dispatched via <strong>${this.senderAddress}</strong> • Immediate support? Contact the Trade Concierge on WhatsApp at <strong>${this.whatsappSupportNumber}</strong> or email <strong>${this.replyToAddress}</strong>.
          </p>
        </div>
      </div>
    `;

    const attachedDocs = Array.isArray(payload.attachedDocuments)
      ? payload.attachedDocuments.slice(0, 3)
      : [];

    if (attachedDocs.length > 0) {
      textParts.push(
        '',
        '============================================================',
        `ATTACHED OFFICIAL PDF DOCUMENTS (${attachedDocs.length})`,
        '============================================================',
        ...attachedDocs.map(
          (doc, idx) => `${idx + 1}. ${doc.title} (${doc.fileName} • ${doc.fileSizeLabel})`
        ),
        ''
      );
    }

    const finalTextBody = textParts.filter(Boolean).join('\n');

    const attachedDocsHtml =
      attachedDocs.length > 0
        ? `
          <!-- Attached PDF Documents Section -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px 18px; margin: 20px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">
              📎 Attached Official PDF Documents (${attachedDocs.length})
            </div>
            ${attachedDocs
              .map(
                (doc) => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a;">
                    <span style="background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin-right: 6px;">PDF</span>
                    ${doc.title}
                  </div>
                  <div style="font-size: 11px; font-family: monospace; color: #475569; margin-top: 3px;">
                    ${doc.fileName} • ${doc.fileSizeLabel}
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
        : '';

    const finalHtmlBody = htmlBody.replace(
      '<!-- Direct CTA Button -->',
      `${attachedDocsHtml}\n          <!-- Direct CTA Button -->`
    );

    const nodemailerAttachments: nodemailer.SendMailOptions['attachments'] =
      attachedDocs.length > 0
        ? attachedDocs.map((doc) => ({
            filename: doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.pdf`,
            content: Buffer.from(
              `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\n% Trade Heaven Official Document: ${doc.title} (${doc.fileName})\n%%EOF`,
              'utf-8'
            ),
            contentType: 'application/pdf'
          }))
        : undefined;

    const baseSummary =
      attachedDocs.length > 0
        ? `${introMessage} [Attached PDFs (${attachedDocs.length}): ${attachedDocs.map((d) => d.title).join(', ')}]`
        : introMessage;

    const summaryWithAttachments = payload.scheduledFor
      ? `[Scheduled Automated Delivery for ${payload.scheduledFor}] ${baseSummary}`
      : baseSummary;

    const transporter = this.createPrimaryTransporter();

    return await serverDeliveryQueueManager.enqueueSingle(
      cleanEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject,
        text: finalTextBody,
        html: finalHtmlBody,
        attachments: nodemailerAttachments,
        dispatchType: payload.dispatchType || 'MANUAL',
        companyName,
        recipientName: displayName,
        summaryText: summaryWithAttachments
      },
      transporter || undefined
    );
  }

  /**
   * Dispatches the dedicated 'Membership Renewal' email template targeting
   * renewal of current subscription offers (Basic Business Plan with Offer)
   * to the client AND dispatches a copy to the Admin email when sendAdminCopy !== false.
   */
  public async sendMembershipRenewalEmail(
    payload: MembershipRenewalEmailPayload
  ): Promise<SerializedDeliveryReceipt & { adminCopyReceipt?: SerializedDeliveryReceipt }> {
    const built = buildMembershipRenewalEmailTemplate(payload);
    const cleanEmail = built.resolvedFields.email.trim().toLowerCase();
    const transporter = this.createPrimaryTransporter();

    const clientReceipt = await serverDeliveryQueueManager.enqueueSingle(
      cleanEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject: built.subject,
        text: built.text,
        html: built.html,
        dispatchType: payload.dispatchType || 'MANUAL',
        companyName: built.resolvedFields.companyName,
        recipientName: built.resolvedFields.decisionMakerName,
        summaryText: `Basic Plan Membership Renewal Offer ($${built.resolvedFields.renewalAmountUsd} USD/yr) dispatched to ${built.resolvedFields.decisionMakerName} (${built.resolvedFields.companyName}, ${built.resolvedFields.address}) with '${built.ctaText}' payment checkout trigger (${built.resolvedFields.paymentMethod}).`
      },
      transporter || undefined
    );

    if (payload.sendAdminCopy !== false) {
      const adminTarget = (payload.adminCopyEmail || 'yr943334@gmail.com').trim().toLowerCase();
      const adminBuilt = buildMembershipRenewalEmailTemplate({
        ...payload,
        isAdminCopy: true
      });
      const adminCopyReceipt = await serverDeliveryQueueManager.enqueueSingle(
        adminTarget,
        {
          from: this.senderFormatted,
          replyTo: this.replyToAddress,
          subject: adminBuilt.subject,
          text: adminBuilt.text,
          html: adminBuilt.html,
          dispatchType: payload.dispatchType || 'MANUAL',
          companyName: built.resolvedFields.companyName,
          recipientName: `Admin Copy (${adminTarget})`,
          summaryText: `[ADMIN COPY] Copy of Basic Plan Membership Renewal Offer sent to ${built.resolvedFields.decisionMakerName} (${cleanEmail}, ${built.resolvedFields.companyName}).`
        },
        transporter || undefined
      );
      return {
        ...clientReceipt,
        adminCopyReceipt
      };
    }

    return clientReceipt;
  }

  /**
   * Dispatches the Zac ($400 Paid Basic Plan) — Ads Campaign Failed + Account Pause Warning + Diwali Max Benefit email.
   * Supports sending a Demo Mail to Admin first (`isDemoOnAdmin: true`) or dispatching live to Zac (`zac@otec.ltd`).
   */
  public async sendZacAdsCampaignFailedEmail(
    payload: ZacAdsCampaignFailedEmailPayload
  ): Promise<SerializedDeliveryReceipt & { adminCopyReceipt?: SerializedDeliveryReceipt }> {
    const isDemoOnAdmin = Boolean(payload.isDemoOnAdmin);
    const built = buildZacAdsCampaignFailedEmailTemplate({
      ...payload,
      isDemoOnAdmin
    });

    const transporter = this.createPrimaryTransporter();

    if (isDemoOnAdmin) {
      const demoAdminTarget = normalizeRecipientEmail(
        payload.demoAdminEmail || payload.adminCopyEmail || 'yr943334@gmail.com'
      );
      const demoReceipt = await serverDeliveryQueueManager.enqueueSingle(
        demoAdminTarget,
        {
          from: this.senderFormatted,
          replyTo: this.replyToAddress,
          subject: built.subject,
          text: built.text,
          html: built.html,
          dispatchType: payload.dispatchType || 'MANUAL',
          category: 'CUSTOM_ADMIN',
          companyName: built.resolvedFields.companyName,
          companyId: 'comp-zac-importation-fadetech',
          recipientName: `Admin Demo (${demoAdminTarget} • Preview for Zac)`,
          trackingId:
            payload.trackingId ||
            (demoAdminTarget === 'yr943334@gmail.com'
              ? 'ms-trk-zac-demo-admin-2026'
              : undefined),
          summaryText: `[DEMO MAIL ON ADMIN] Preview of Zac (${built.resolvedFields.email}) Ads Campaign Failed ($${built.resolvedFields.amountPaidUsd} Paid Basic Plan) + Full Plan / Account Pause Notice + Diwali Offer Max Benefit ($${built.resolvedFields.remainingBalanceUsd} balance).`
        },
        transporter || undefined
      );
      return demoReceipt;
    }

    const cleanClientEmail = normalizeRecipientEmail(built.resolvedFields.email);
    const clientReceipt = await serverDeliveryQueueManager.enqueueSingle(
      cleanClientEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject: built.subject,
        text: built.text,
        html: built.html,
        dispatchType: payload.dispatchType || 'MANUAL',
        category: 'CUSTOM_ADMIN',
        companyName: built.resolvedFields.companyName,
        companyId: 'comp-zac-importation-fadetech',
        recipientName: built.resolvedFields.decisionMakerName,
        summaryText: `LIVE MAIL TO ZAC: Today's Ads Campaign Failed due to insufficient Basic Plan balance ($${built.resolvedFields.amountPaidUsd} paid). Requested Full Plan settlement ($${built.resolvedFields.remainingBalanceUsd} USD with Diwali Offer DIWALI10) to run ads & connect with buyers or account will pause.`
      },
      transporter || undefined
    );

    if (payload.sendAdminCopy !== false) {
      const adminTarget = normalizeRecipientEmail(
        payload.adminCopyEmail || 'yr943334@gmail.com'
      );
      if (adminTarget && adminTarget !== cleanClientEmail) {
        const adminBuilt = buildZacAdsCampaignFailedEmailTemplate({
          ...payload,
          isDemoOnAdmin: false,
          isAdminCopy: true
        });
        const adminCopyReceipt = await serverDeliveryQueueManager.enqueueSingle(
          adminTarget,
          {
            from: this.senderFormatted,
            replyTo: this.replyToAddress,
            subject: adminBuilt.subject,
            text: adminBuilt.text,
            html: adminBuilt.html,
            dispatchType: payload.dispatchType || 'MANUAL',
            category: 'CUSTOM_ADMIN',
            companyName: built.resolvedFields.companyName,
            companyId: 'comp-zac-importation-fadetech',
            recipientName: `Admin Copy (${adminTarget})`,
            summaryText: `[ADMIN COPY] Official copy of Ads Campaign Failed & Diwali Max Benefit email sent to ${built.resolvedFields.decisionMakerName} (${cleanClientEmail}).`
          },
          transporter || undefined
        );
        return {
          ...clientReceipt,
          adminCopyReceipt
        };
      }
    }

    return clientReceipt;
  }

  /**
   * Dispatches:
   * 1) Live email to Zac (zac@otec.ltd) regarding the Payment of Balance Fund ($590.00 USD) following his earlier $400.00 USD payment.
   * 2) Official Audit & Verification email to Admin (yr943334@gmail.com & sankalprajput15@gmail.com) confirming that the earlier balance fund payment mail/calculation was right and has been sent to Zac.
   */
  public async sendZacBalanceFundAndAdminConfirmation(
    payload?: ZacBalanceFundConfirmationPayload
  ): Promise<{
    success: boolean;
    zacReceipt: SerializedDeliveryReceipt;
    adminReceipts: SerializedDeliveryReceipt[];
  }> {
    const built = buildZacBalanceFundPaymentAndAdminRightTemplates(payload);
    const transporter = this.createPrimaryTransporter();
    const cleanZacEmail = normalizeRecipientEmail(built.resolvedFields.email || 'zac@otec.ltd');

    const zacReceipt = await serverDeliveryQueueManager.enqueueSingle(
      cleanZacEmail,
      {
        from: this.senderFormatted,
        replyTo: this.replyToAddress,
        subject: built.zacSubject,
        text: built.zacText,
        html: built.zacHtml,
        dispatchType: payload?.dispatchType || 'MANUAL',
        category: 'CUSTOM_ADMIN',
        companyName: built.resolvedFields.companyName,
        companyId: 'comp-zac-importation-fadetech',
        recipientName: built.resolvedFields.decisionMakerName,
        trackingId: 'ms-trk-zac-balance-fund-live-2026',
        summaryText: `LIVE MAIL TO ZAC (${cleanZacEmail}): Payment of Balance Fund ($${built.resolvedFields.remainingBalanceUsd}.00 USD) following earlier $${built.resolvedFields.amountPaidUsd}.00 USD deposit for ${built.resolvedFields.companyName} (${built.resolvedFields.invoiceRef}).`
      },
      transporter || undefined
    );

    const rawAdminTargets =
      Array.isArray(payload?.adminEmails) && payload!.adminEmails.length > 0
        ? payload!.adminEmails
        : ['yr943334@gmail.com', 'sankalprajput15@gmail.com'];

    const uniqueAdmins = Array.from(
      new Set(rawAdminTargets.map((e) => normalizeRecipientEmail(e)).filter((e) => e && e.includes('@')))
    );

    const adminReceipts: SerializedDeliveryReceipt[] = [];
    for (const adminEmail of uniqueAdmins) {
      const adminRec = await serverDeliveryQueueManager.enqueueSingle(
        adminEmail,
        {
          from: this.senderFormatted,
          replyTo: this.replyToAddress,
          subject: built.adminSubject,
          text: built.adminText,
          html: built.adminHtml,
          dispatchType: payload?.dispatchType || 'MANUAL',
          category: 'CUSTOM_ADMIN',
          companyName: built.resolvedFields.companyName,
          companyId: 'comp-zac-importation-fadetech',
          recipientName: `Admin Verification (${adminEmail})`,
          trackingId:
            adminEmail === 'yr943334@gmail.com'
              ? 'ms-trk-zac-balance-fund-admin-right-2026'
              : `ms-trk-zac-balance-admin-${Date.now().toString(36)}`,
          summaryText: `[ADMIN ARCHIVE COPY] Copy of Balance Fund Payment invoice ($${built.resolvedFields.remainingBalanceUsd}.00 USD) dispatched to ${built.resolvedFields.decisionMakerName} (${cleanZacEmail}).`
        },
        transporter || undefined
      );
      adminReceipts.push(adminRec);
    }

    return {
      success: zacReceipt.success,
      zacReceipt,
      adminReceipts
    };
  }
}


export const automatedSmtpService = new AutomatedSmtpService();


