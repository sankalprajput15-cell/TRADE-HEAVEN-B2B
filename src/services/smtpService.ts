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

export interface CompanyEmailHistoryEntry {
  id: string;
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
}

export interface SerializedDeliveryReceipt {
  recipient: string;
  success: boolean;
  messageId?: string;
  dispatchedAt: string;
  enforcedDelayMs: number;
  error?: string;
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

  const baseSubject = `💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ${companyName} (Attn: ${decisionMakerName})`;
  const subject = params?.isAdminCopy ? `[ADMIN COPY] ${baseSubject}` : baseSubject;

  const text = [
    params?.isAdminCopy
      ? 'ADMIN DISPATCH COPY • TRADE HEAVEN MEMBERSHIP RENEWAL DESK'
      : 'TRADE HEAVEN • BASIC PLAN MEMBERSHIP RENEWAL & EXCLUSIVE DEALS DESK',
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
          ${params?.isAdminCopy ? 'ADMIN COPY • BASIC PLAN RENEWAL DISPATCHED TO CLIENT' : 'TRADE HEAVEN • BASIC PLAN RENEWAL &amp; SPECIAL OFFER'}
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.25; letter-spacing: -0.5px;">
          Basic Business Plan Renewal &amp; Exciting New Trade Deals
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">
          Special 10% OFF Basic Plan Renewal Offer Prepared for ${companyName}
        </p>
      </div>

      <div style="padding: 30px 24px; background: #ffffff; color: #1e293b;">
        ${
          params?.isAdminCopy
            ? `<div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 10px; padding: 12px 16px; margin: 0 0 18px 0; font-size: 12px; color: #1e3a8a;">
                <strong>Admin Notification Copy:</strong> This is an official copy of the Basic Plan Membership Renewal Offer email dispatched to <strong>${decisionMakerName}</strong> (<strong>${email}</strong>) at <strong>${companyName}</strong>.
              </div>`
            : ''
        }
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
    recipientName: 'Zac',
    companyName: 'Zac Importation Fadetech',
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
    id: 'eh-ace-intermediary-basic-renewal-001',
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
    dispatchedAt: new Date().toISOString(),
    enforcedDelayMs: 0,
    summaryText: 'BASIC PLAN RENEWAL OFFER & NEW EXCITING DEALS: Sent to Ali Charley Ezekiah (ezekiahali355@gmail.com) | Company: ACE Intermediary | Address: 1241 Hackberry Avenue Corsicana Texas 75110 | Payment Method: Debit Card. Plan: Basic Business Plan (Basic Tier) at $990 USD/Year (10% OFF standard $1,100/yr rate, Save $110 USD) + direct "Renew Now" payment checkout link.'
  },
  {
    id: 'eh-ace-intermediary-basic-renewal-admin-copy-002',
    recipient: 'yr943334@gmail.com',
    recipientName: 'Sarah Jenkins (Master Admin)',
    companyName: 'ACE Intermediary',
    companyId: 'comp-ace-intermediary',
    subject: '[ADMIN COPY] 💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
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
          metadata: {
            dispatchType: mailOptions.dispatchType,
            category: mailOptions.category,
            companyName: mailOptions.companyName,
            companyId: mailOptions.companyId,
            recipientName: mailOptions.recipientName,
            summaryText: mailOptions.summaryText
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
          this.recordReceipt(simReceipt, task);
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
          this.recordReceipt(receipt, task);
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
          this.recordReceipt(failReceipt, task);
          task.resolve(failReceipt);
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

      const historyEntry: CompanyEmailHistoryEntry = {
        id: `eh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
        htmlPreview: typeof task.mailOptions.html === 'string' ? task.mailOptions.html : undefined
      };

      this.emailHistoryLog.unshift(historyEntry);
      if (this.emailHistoryLog.length > 300) {
        this.emailHistoryLog.length = 300;
      }
    }
  }

  public getEmailHistory(filters?: {
    email?: string;
    companyName?: string;
    companyId?: string;
    dispatchType?: 'ALL' | 'AUTOMATED' | 'MANUAL';
  }): CompanyEmailHistoryEntry[] {
    let list = [...this.emailHistoryLog];
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
}


export const automatedSmtpService = new AutomatedSmtpService();


