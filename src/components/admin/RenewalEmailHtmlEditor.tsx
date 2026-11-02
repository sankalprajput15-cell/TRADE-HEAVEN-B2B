import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Code2,
  Eye,
  Send,
  Save,
  RotateCcw,
  Copy,
  CheckCircle2,
  Smartphone,
  Monitor,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Printer,
  ExternalLink,
  Mail,
  Sliders,
  FileCode
} from 'lucide-react';
import { PaymentCheckoutData } from '../../types';

export type RenewalSectionId =
  | 'HEADER_BANNER'
  | 'GREETING_INTRO'
  | 'ACCOUNT_LEDGER'
  | 'BENEFITS_LIST'
  | 'POLICY_NOTICE'
  | 'CTA_BUTTON'
  | 'SUPPORT_FOOTER';

export interface RenewalSectionConfig {
  id: RenewalSectionId;
  label: string;
  description: string;
  enabled: boolean;
}

export interface RenewalCopyConfig {
  presetId: string;
  subjectTemplate: string;
  kickerText: string;
  headlineText: string;
  subheadlineText: string;
  headerBgColor: string;
  accentColor: string;
  greetingLine: string;
  introParagraph1: string;
  introParagraph2: string;
  ledgerSectionTitle: string;
  benefitsSectionTitle: string;
  benefitItems: string[];
  policyNoticeHeading: string;
  policyNoticeCopy: string;
  ctaButtonText: string;
  ctaButtonColor: string;
  ctaDestinationUrl: string;
  footerSupportText: string;
}

export interface RenewalPreviewVariables {
  recipientName: string;
  decisionMakerName: string;
  email: string;
  companyName: string;
  address: string;
  paymentMethod: string;
  planName: string;
  planId: string;
  standardPriceUsd: string;
  amountPaidUsd: string;
  renewalAmountUsd: string;
  discountLabel: string;
  promoCode: string;
  invoiceRef: string;
}

interface RenewalPresetTemplate {
  id: string;
  name: string;
  summary: string;
  copy: RenewalCopyConfig;
  variables: RenewalPreviewVariables;
}

const DEFAULT_SECTIONS_ORDER: RenewalSectionConfig[] = [
  {
    id: 'HEADER_BANNER',
    label: '01. Brand Header & Hero Headline',
    description: 'Top corporate header with kicker, main renewal headline, and account reference.',
    enabled: true
  },
  {
    id: 'GREETING_INTRO',
    label: '02. Personalized Greeting & Opening Copy',
    description: 'Salutation and executive renewal or balance settlement introduction paragraphs.',
    enabled: true
  },
  {
    id: 'ACCOUNT_LEDGER',
    label: '03. Account & Billing Summary Table',
    description: 'Structured table displaying company, email, plan rate, credited deposit, and net balance.',
    enabled: true
  },
  {
    id: 'BENEFITS_LIST',
    label: '04. Included Plan Benefits & Deliverables',
    description: 'Bullet list highlighting ad campaign impressions, buyer RFQ quotas, and escrow perks.',
    enabled: true
  },
  {
    id: 'POLICY_NOTICE',
    label: '05. Service Continuity & Refund Policy Terms',
    description: 'Compliance notice referencing 30-day eligibility and partial-payment rules.',
    enabled: true
  },
  {
    id: 'CTA_BUTTON',
    label: '06. Primary Checkout / Portal CTA Button',
    description: 'Direct action button linking to https://www.tradeheaven.net without proxy redirects.',
    enabled: true
  },
  {
    id: 'SUPPORT_FOOTER',
    label: '07. Corporate Support & Concierge Footer',
    description: 'Sender attribution, WhatsApp concierge contact, and reply-to desk details.',
    enabled: true
  }
];

const RENEWAL_PRESETS: RenewalPresetTemplate[] = [
  {
    id: 'preset-standard-renewal',
    name: 'Annual Membership Renewal Offer ($990/yr — 10% OFF)',
    summary: 'Standard annual renewal template for Basic Business Plan members with 10% festival discount.',
    copy: {
      presetId: 'preset-standard-renewal',
      subjectTemplate:
        'Membership Renewal Offer ({{renewalAmountUsd}} USD/yr — {{discountLabel}}) & Active Buyer Leads for {{companyName}}',
      kickerText: 'TRADE HEAVEN GLOBAL B2B · MEMBERSHIP RENEWAL DESK',
      headlineText: '{{planName}} Annual Renewal & Buyer Matchmaking',
      subheadlineText: 'Prepared for {{companyName}} · Attn: {{decisionMakerName}} (Ref: {{invoiceRef}})',
      headerBgColor: '#0f172a',
      accentColor: '#2563eb',
      greetingLine: 'Dear {{recipientName}},',
      introParagraph1:
        'Thank you for being a verified trading partner on the Trade Heaven Global B2B Marketplace. Your annual subscription for {{companyName}} ({{email}}) is eligible for priority renewal under our {{discountLabel}} promotional rate (Promo Code: {{promoCode}}).',
      introParagraph2:
        'Renewing your {{planName}} ensures uninterrupted storefront visibility, priority indexing across international buyer search directories, and continuous automated matching with verified wholesale RFQs.',
      ledgerSectionTitle: 'MEMBERSHIP RENEWAL & BILLING STATEMENT ({{invoiceRef}})',
      benefitsSectionTitle: 'Included with Your {{planName}} Renewal:',
      benefitItems: [
        'Uninterrupted Verified Supplier Badge and priority catalog ranking for 12 months',
        'Direct access to verified global buyer RFQs and up to 20–60+ buyer inquiries per month',
        '2x Sponsored Marketplace Showcase Ad Banners across targeted commodity categories',
        'Dedicated International Export Manager support and regulated escrow contract protection'
      ],
      policyNoticeHeading: 'Service Continuity & Compliance Terms:',
      policyNoticeCopy:
        'All annual membership renewals are governed by the Trade Heaven Return & Refund Policy (Article 3: Non-Availability of Partial Payment Refunds for Services and Article 4: 30-Day Eligibility Window from Plan Start Date).',
      ctaButtonText: 'Complete {{planName}} Renewal (${{renewalAmountUsd}} USD) →',
      ctaButtonColor: '#2563eb',
      ctaDestinationUrl:
        'https://www.tradeheaven.net/?action=renew-membership&company={{companyNameUrl}}&email={{emailUrl}}&decisionMaker={{decisionMakerUrl}}&planId={{planId}}&amountUsd={{renewalAmountUsd}}',
      footerSupportText:
        'Dispatched via noreply@tradeheaven.net · Need assistance with your renewal invoice? Contact our Billing Desk on WhatsApp at +91 85329 34479 or email help@tradeheaven.net.'
    },
    variables: {
      recipientName: 'Ali Charley Ezekiah',
      decisionMakerName: 'Ali Charley Ezekiah',
      email: 'ezekiahali355@gmail.com',
      companyName: 'ACE Intermediary',
      address: '1241 Hackberry Avenue Corsicana Texas 75110',
      paymentMethod: 'Debit Card',
      planName: 'Basic Business Plan',
      planId: 'basic-business-plan',
      standardPriceUsd: '1,100',
      amountPaidUsd: '0',
      renewalAmountUsd: '990',
      discountLabel: '10% OFF',
      promoCode: 'DIWALI10',
      invoiceRef: 'TRD-REN-2026-0108'
    }
  },
  {
    id: 'preset-zac-balance-fund',
    name: 'Zac — Balance Fund Settlement ($590 USD Balance after $400 Paid)',
    summary: 'Reconciled balance fund invoice for IMPORTATION FADE-TECH (zac@otec.ltd) to complete Full Basic Plan and relaunch ads.',
    copy: {
      presetId: 'preset-zac-balance-fund',
      subjectTemplate:
        'Payment of Balance Fund (${{renewalAmountUsd}}.00 USD) & Full Plan Activation for {{companyName}} (Ref: {{invoiceRef}})',
      kickerText: 'TRADE HEAVEN GLOBAL B2B · TREASURY & BILLING DESK',
      headlineText: 'Payment of Balance Fund (${{renewalAmountUsd}}.00 USD) & Full Plan Activation',
      subheadlineText: 'Prepared for {{companyName}} · Attn: {{decisionMakerName}} (Ref: {{invoiceRef}})',
      headerBgColor: '#0f172a',
      accentColor: '#059669',
      greetingLine: 'Dear {{recipientName}},',
      introParagraph1:
        'Following up on your earlier payment of ${{amountPaidUsd}}.00 USD credited toward your {{planName}} for {{companyName}} ({{email}}), our Treasury Desk has verified and applied your deposit credit in full.',
      introParagraph2:
        'Please review your reconciled statement below for the remaining Balance Fund (${{renewalAmountUsd}}.00 USD after {{discountLabel}} Code {{promoCode}}) required to complete your Full Plan and immediately relaunch your Sponsored Ads Campaign.',
      ledgerSectionTitle: 'RECONCILED BALANCE FUND STATEMENT ({{invoiceRef}})',
      benefitsSectionTitle: 'What Completing Your ${{renewalAmountUsd}}.00 USD Balance Unlocks Immediately:',
      benefitItems: [
        '100% Credit of Your Earlier ${{amountPaidUsd}}.00 USD Deposit + {{discountLabel}} Discount (Code: {{promoCode}})',
        'Immediate Relaunch of Your Sponsored Buyer Acquisition & Commodity Banner Campaign',
        'Full 12-Month {{planName}} Activation with Direct Global Buyer RFQ Connections',
        'Uninterrupted Storefront Visibility & Dedicated Senior Export Manager Support'
      ],
      policyNoticeHeading: 'Compliance & Return Policy Notice:',
      policyNoticeCopy:
        'In accordance with the Trade Heaven Return & Refund Policy, partial or part-payment deposits toward service plans are non-refundable (Article 3) and remain 100% credited toward full plan activation.',
      ctaButtonText: 'Complete Balance Payment (${{renewalAmountUsd}}.00 USD) & Relaunch Ads →',
      ctaButtonColor: '#059669',
      ctaDestinationUrl:
        'https://www.tradeheaven.net/?pay_zac=1&email={{emailUrl}}&amount={{renewalAmountUsd}}&company={{companyNameUrl}}&view=PREMIUM_MEMBERSHIP',
      footerSupportText:
        'Dispatched via noreply@tradeheaven.net · Questions regarding your balance statement? Contact Treasury Support on WhatsApp at +91 85329 34479 or email help@tradeheaven.net.'
    },
    variables: {
      recipientName: 'Zachary Aldin (Zac)',
      decisionMakerName: 'Zachary Aldin (Zac)',
      email: 'zac@otec.ltd',
      companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
      address: '42a Bassett street hurstville, New South Wales 2220, Australia',
      paymentMethod: 'Bank Wire / Card ($400 Paid Earlier)',
      planName: 'Basic Business Plan',
      planId: 'basic-business-plan',
      standardPriceUsd: '1,100',
      amountPaidUsd: '400',
      renewalAmountUsd: '590',
      discountLabel: '10% OFF',
      promoCode: 'DIWALI10',
      invoiceRef: 'TRD-INV-27-0004'
    }
  },
  {
    id: 'preset-case-closed-extension',
    name: 'Case Closed — Approved Extension of Services Notice',
    summary: 'Executive confirmation from Senior Export Manager (David) closing escalation case on approved Extension of Services.',
    copy: {
      presetId: 'preset-case-closed-extension',
      subjectTemplate:
        'Case Closed: Escalation Resolved via Approved Extension of Services — {{companyName}} (Ref: {{invoiceRef}})',
      kickerText: 'TRADE HEAVEN · COMPLIANCE & EXPORT MANAGEMENT DESK',
      headlineText: 'Case Closed: Resolved on Approved Extension of Services',
      subheadlineText: 'Case Reference: #ESC-REF-2026-0004 · Supplier: {{companyName}}',
      headerBgColor: '#064e3b',
      accentColor: '#059669',
      greetingLine: 'Dear {{recipientName}},',
      introParagraph1:
        'Following the executive compliance review conducted by your Senior Export Manager, Mr. David, and the Trade Heaven Operations Desk, we formally confirm that your escalated case (#ESC-REF-2026-0004 under Agreement {{invoiceRef}}) has been closed on the basis of an approved Extension of Services for {{companyName}} ({{email}}).',
      introParagraph2:
        'Your prior deposit credit (${{amountPaidUsd}}.00 USD) remains 100% protected on your corporate profile, and your service window has been extended so your export catalog and buyer matchmaking continue without interruption.',
      ledgerSectionTitle: 'FINAL CASE RESOLUTION & SERVICE EXTENSION SUMMARY',
      benefitsSectionTitle: 'Active Extended Services Applied to Your Account:',
      benefitItems: [
        'Prior Deposit Credit (${{amountPaidUsd}}.00 USD under {{invoiceRef}}) 100% Protected & Retained',
        'Approved Extension of Services for Storefront Hosting & Global Coal Catalog Indexing',
        'Assigned Senior Export Manager (Mr. David) Oversight & Buyer Inquiry Routing',
        'Escalation Ticket #ESC-REF-2026-0004 Formally Marked CLOSED in Compliance Registry'
      ],
      policyNoticeHeading: 'Policy Governance & Service Continuity:',
      policyNoticeCopy:
        'This resolution preserves 100% of your service value under the Trade Heaven Return & Refund Policy (Article 3: Non-Availability of Partial Payment Refunds and Article 4: 30-Day Eligibility Window).',
      ctaButtonText: 'Access Supplier Portal & Extended Services →',
      ctaButtonColor: '#059669',
      ctaDestinationUrl: 'https://www.tradeheaven.net/?view=DASHBOARD&email={{emailUrl}}&company={{companyNameUrl}}',
      footerSupportText:
        'Trade Heaven Compliance & Export Management Desk · Approved by Senior Export Manager (David) · Support: help@tradeheaven.net'
    },
    variables: {
      recipientName: 'Zachary Aldin (Zac)',
      decisionMakerName: 'Zachary Aldin (Zac)',
      email: 'zac@otec.ltd',
      companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
      address: '42a Bassett street hurstville, New South Wales 2220, Australia',
      paymentMethod: 'Service Extension Credit ($400 Deposit Applied)',
      planName: 'Basic Business Plan (Extended Service Window)',
      planId: 'basic-business-plan',
      standardPriceUsd: '1,100',
      amountPaidUsd: '400',
      renewalAmountUsd: '590',
      discountLabel: 'SERVICES EXTENDED',
      promoCode: 'EXT2026',
      invoiceRef: 'TRD-INV-27-0004'
    }
  },
  {
    id: 'preset-vip-upgrade-renewal',
    name: 'VIP Business Plan Renewal & Golden Lead Access ($5,490/yr)',
    summary: 'High-tier VIP annual renewal template with 100% Advance Payment Golden Lead access and direct escrow payout perks.',
    copy: {
      presetId: 'preset-vip-upgrade-renewal',
      subjectTemplate:
        'VIP Business Plan Renewal Offer (${{renewalAmountUsd}}/yr — {{discountLabel}}) & Golden Buyer Tenders for {{companyName}}',
      kickerText: 'TRADE HEAVEN GLOBAL B2B · VIP INSTITUTIONAL TRADE DESK',
      headlineText: 'VIP Membership Renewal & Direct Buyer Settlement Access',
      subheadlineText: 'Prepared for {{companyName}} · Attn: {{decisionMakerName}} (Ref: {{invoiceRef}})',
      headerBgColor: '#1e1b4b',
      accentColor: '#d97706',
      greetingLine: 'Dear {{recipientName}},',
      introParagraph1:
        'Your {{companyName}} supplier profile is eligible for our flagship {{planName}} annual renewal at the preferential {{discountLabel}} rate of ${{renewalAmountUsd}} USD/year (Standard Rate: ${{standardPriceUsd}} USD/year · Promo Code: {{promoCode}}).',
      introParagraph2:
        'VIP Membership unlocks exclusive access to 100% Advance Payment Golden Leads, direct on-site escrow fund transfers, and 4x Sponsored Homepage Spotlight campaigns.',
      ledgerSectionTitle: 'VIP MEMBERSHIP RENEWAL SUMMARY ({{invoiceRef}})',
      benefitsSectionTitle: 'Exclusive VIP Institutional Privileges:',
      benefitItems: [
        'Unlock 100% Advance Payment Golden Buyer Leads across North America, Europe & APAC',
        'Direct-to-Site Escrow Fund Receiving & Automated Corporate Bank Wire Payouts',
        '4x Sponsored Homepage & Category Top-Feed Advertising Campaigns',
        '60+ Verified Institutional Buyer Orders / Month with Dedicated Key Account Director'
      ],
      policyNoticeHeading: 'Institutional Escrow & Renewal Policy:',
      policyNoticeCopy:
        'Governed by the Trade Heaven Return & Refund Policy (30-Day Eligibility Window from Plan Start Date; Partial Payments Non-Refundable).',
      ctaButtonText: 'Renew VIP Membership (${{renewalAmountUsd}} USD/yr) →',
      ctaButtonColor: '#d97706',
      ctaDestinationUrl:
        'https://www.tradeheaven.net/?action=renew-membership&company={{companyNameUrl}}&email={{emailUrl}}&decisionMaker={{decisionMakerUrl}}&planId=vip-business-plan&amountUsd={{renewalAmountUsd}}',
      footerSupportText:
        'Dispatched via noreply@tradeheaven.net · VIP Concierge Desk WhatsApp: +91 85329 34479 · Email: help@tradeheaven.net'
    },
    variables: {
      recipientName: 'Mark Johnson',
      decisionMakerName: 'Mark Johnson (President)',
      email: 'mjohnson@atlanticpowerequip.com',
      companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
      address: 'P.O. Box 1176, Marmora, NJ 08223 USA',
      paymentMethod: 'Corporate Wire / Debit Card',
      planName: 'VIP Business Plan',
      planId: 'vip-business-plan',
      standardPriceUsd: '6,100',
      amountPaidUsd: '0',
      renewalAmountUsd: '5490',
      discountLabel: '10% OFF',
      promoCode: 'DIWALI10',
      invoiceRef: 'TRD-VIP-2026-0891'
    }
  }
];

const PLACEHOLDER_TOKENS: Array<{ token: string; label: string }> = [
  { token: '{{recipientName}}', label: 'Recipient Name' },
  { token: '{{decisionMakerName}}', label: 'Decision Maker' },
  { token: '{{email}}', label: 'Recipient Email' },
  { token: '{{companyName}}', label: 'Company Name' },
  { token: '{{address}}', label: 'Billing Address' },
  { token: '{{paymentMethod}}', label: 'Payment Method' },
  { token: '{{planName}}', label: 'Plan Name' },
  { token: '{{planId}}', label: 'Plan ID' },
  { token: '{{standardPriceUsd}}', label: 'Standard Rate ($)' },
  { token: '{{amountPaidUsd}}', label: 'Earlier Paid ($)' },
  { token: '{{renewalAmountUsd}}', label: 'Net Renewal / Balance ($)' },
  { token: '{{discountLabel}}', label: 'Discount Label' },
  { token: '{{promoCode}}', label: 'Promo Code' },
  { token: '{{invoiceRef}}', label: 'Invoice / Case Ref' },
  { token: '{{ctaUrl}}', label: 'Resolved CTA URL' }
];

const STORAGE_KEY_RENEWAL_EDITOR = 'th_admin_renewal_email_html_editor_v2';

export function buildStructuredRenewalHtml(
  sections: RenewalSectionConfig[],
  copy: RenewalCopyConfig
): string {
  const enabledBlocks: string[] = [];

  for (const section of sections) {
    if (!section.enabled) continue;

    switch (section.id) {
      case 'HEADER_BANNER':
        enabledBlocks.push(`
      <!-- 01. Brand Header Banner -->
      <div style="background: ${copy.headerBgColor}; padding: 34px 28px; text-align: center; color: #ffffff; border-bottom: 3px solid ${copy.accentColor};">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.8px; color: #cbd5e1; text-transform: uppercase; margin-bottom: 10px;">
          ${copy.kickerText}
        </div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
          ${copy.headlineText}
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">
          ${copy.subheadlineText}
        </p>
      </div>`);
        break;

      case 'GREETING_INTRO':
        enabledBlocks.push(`
        <!-- 02. Personalized Greeting & Intro Copy -->
        <div style="margin-bottom: 22px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px 0; color: #0f172a; font-weight: 700;">
            ${copy.greetingLine}
          </p>
          <p style="font-size: 14px; line-height: 1.65; margin: 0 0 14px 0; color: #334155;">
            ${copy.introParagraph1}
          </p>
          ${
            copy.introParagraph2.trim()
              ? `<p style="font-size: 14px; line-height: 1.65; margin: 0; color: #334155;">
            ${copy.introParagraph2}
          </p>`
              : ''
          }
        </div>`);
        break;

      case 'ACCOUNT_LEDGER':
        enabledBlocks.push(`
        <!-- 03. Account & Billing Summary Table -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px 20px; margin: 0 0 22px 0;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
            ${copy.ledgerSectionTitle}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #475569; width: 180px; font-weight: 600;">Company Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{companyName}}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Decision Maker &amp; Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{decisionMakerName}} (<span style="font-family: monospace; color: #2563eb;">{{email}}</span>)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Address:</td>
              <td style="padding: 6px 0; color: #334155;">{{address}}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Membership Plan:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{planName}} (Standard: \${{standardPriceUsd}} USD)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #475569; font-weight: 600;">Earlier Paid / Credited:</td>
              <td style="padding: 6px 0; color: #059669; font-weight: 700;">\${{amountPaidUsd}}.00 USD · Promo: {{promoCode}} ({{discountLabel}})</td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1;">
              <td style="padding: 10px 0 4px 0; color: #0f172a; font-weight: 800; font-size: 14px;">Net Amount Due:</td>
              <td style="padding: 10px 0 4px 0; color: #dc2626; font-weight: 800; font-size: 16px;">\${{renewalAmountUsd}}.00 USD <span style="font-size: 11px; color: #475569; font-weight: 600;">({{paymentMethod}})</span></td>
            </tr>
          </table>
        </div>`);
        break;

      case 'BENEFITS_LIST':
        enabledBlocks.push(`
        <!-- 04. Included Plan Benefits -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 0 0 22px 0;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">
            ${copy.benefitsSectionTitle}
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.7;">
            ${copy.benefitItems
              .filter((b) => b.trim())
              .map((item) => `<li style="margin-bottom: 4px;">${item}</li>`)
              .join('\n            ')}
          </ul>
        </div>`);
        break;

      case 'POLICY_NOTICE':
        enabledBlocks.push(`
        <!-- 05. Service Continuity & Refund Policy Notice -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 0 0 22px 0; font-size: 12.5px; color: #92400e; line-height: 1.6;">
          <strong style="color: #78350f;">${copy.policyNoticeHeading}</strong> ${copy.policyNoticeCopy}
        </div>`);
        break;

      case 'CTA_BUTTON':
        enabledBlocks.push(`
        <!-- 06. Primary Direct CTA Button -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="{{ctaUrl}}" data-renewal-trigger="true" style="display: inline-block; background: ${copy.ctaButtonColor}; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
            ${copy.ctaButtonText}
          </a>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            Direct Production Link: <span style="font-family: monospace;">https://www.tradeheaven.net</span> · Ref: {{invoiceRef}}
          </div>
        </div>`);
        break;

      case 'SUPPORT_FOOTER':
        enabledBlocks.push(`
        <!-- 07. Corporate Support Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 22px; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
          ${copy.footerSupportText}
        </div>`);
        break;
    }
  }

  const headerSection = sections.find((s) => s.id === 'HEADER_BANNER' && s.enabled);
  const headerHtml = headerSection ? enabledBlocks.shift() || '' : '';

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1;">
  ${headerHtml}
  <div style="padding: 28px 24px; background: #ffffff; color: #1e293b;">
    ${enabledBlocks.join('\n')}
  </div>
</div>`;
}

export function interpolateRenewalTemplate(
  rawTemplate: string,
  vars: RenewalPreviewVariables,
  ctaDestinationTemplate: string
): { html: string; resolvedCtaUrl: string } {
  const cleanDirectBase = ctaDestinationTemplate
    .replace(/^https?:\/\/[^/]*(\.run\.app|aistudio\.google\.com)/i, 'https://www.tradeheaven.net')
    .replace(/\{\{companyNameUrl\}\}/g, encodeURIComponent(vars.companyName))
    .replace(/\{\{emailUrl\}\}/g, encodeURIComponent(vars.email))
    .replace(/\{\{decisionMakerUrl\}\}/g, encodeURIComponent(vars.decisionMakerName))
    .replace(/\{\{planId\}\}/g, encodeURIComponent(vars.planId))
    .replace(/\{\{renewalAmountUsd\}\}/g, encodeURIComponent(vars.renewalAmountUsd.replace(/,/g, '')));

  const replaceTokens = (input: string): string =>
    input
      .replace(/\{\{recipientName\}\}/g, vars.recipientName)
      .replace(/\{\{userName\}\}/g, vars.recipientName)
      .replace(/\{\{decisionMakerName\}\}/g, vars.decisionMakerName)
      .replace(/\{\{email\}\}/g, vars.email)
      .replace(/\{\{companyName\}\}/g, vars.companyName)
      .replace(/\{\{address\}\}/g, vars.address)
      .replace(/\{\{paymentMethod\}\}/g, vars.paymentMethod)
      .replace(/\{\{planName\}\}/g, vars.planName)
      .replace(/\{\{planId\}\}/g, vars.planId)
      .replace(/\{\{standardPriceUsd\}\}/g, vars.standardPriceUsd)
      .replace(/\{\{standardPrice\}\}/g, `$${vars.standardPriceUsd}`)
      .replace(/\{\{amountPaidUsd\}\}/g, vars.amountPaidUsd)
      .replace(/\{\{renewalAmountUsd\}\}/g, vars.renewalAmountUsd)
      .replace(/\{\{offerPrice\}\}/g, `$${vars.renewalAmountUsd}`)
      .replace(/\{\{discountLabel\}\}/g, vars.discountLabel)
      .replace(/\{\{discountPercent\}\}/g, vars.discountLabel)
      .replace(/\{\{promoCode\}\}/g, vars.promoCode)
      .replace(/\{\{invoiceRef\}\}/g, vars.invoiceRef)
      .replace(/\{\{ctaUrl\}\}/g, cleanDirectBase);

  return {
    html: replaceTokens(rawTemplate),
    resolvedCtaUrl: replaceTokens(cleanDirectBase)
  };
}

interface RenewalEmailHtmlEditorProps {
  onOpenPaymentCheckout?: (data: PaymentCheckoutData) => void;
  onNavigateToInsights?: () => void;
}

export const RenewalEmailHtmlEditor: React.FC<RenewalEmailHtmlEditorProps> = ({
  onOpenPaymentCheckout,
  onNavigateToInsights
}) => {
  const [sections, setSections] = useState<RenewalSectionConfig[]>(DEFAULT_SECTIONS_ORDER);
  const [copyConfig, setCopyConfig] = useState<RenewalCopyConfig>(RENEWAL_PRESETS[0].copy);
  const [previewVars, setPreviewVars] = useState<RenewalPreviewVariables>(RENEWAL_PRESETS[0].variables);

  // Editor workspace mode: 'SPLIT' (Structure/Copy + Live Preview), 'HTML_SOURCE' (Raw HTML + Live Preview), or 'PREVIEW_ONLY' (Full Preview Testing Mode)
  const [workspaceMode, setWorkspaceMode] = useState<'SPLIT' | 'HTML_SOURCE' | 'PREVIEW_ONLY'>('SPLIT');
  const [previewViewport, setPreviewViewport] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [isCustomHtmlDetached, setIsCustomHtmlDetached] = useState<boolean>(false);
  const [rawHtmlSource, setRawHtmlSource] = useState<string>(() =>
    buildStructuredRenewalHtml(DEFAULT_SECTIONS_ORDER, RENEWAL_PRESETS[0].copy)
  );

  // Dispatch & persistence state
  const [sendAdminCopy, setSendAdminCopy] = useState<boolean>(true);
  const [testAdminEmail, setTestAdminEmail] = useState<string>('yr943334@gmail.com');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDispatchingTest, setIsDispatchingTest] = useState<boolean>(false);
  const [isDispatchingLive, setIsDispatchingLive] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Hydrate saved state from localStorage or backend on mount
  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem(STORAGE_KEY_RENEWAL_EDITOR);
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          setSections(parsed.sections);
        }
        if (parsed.copyConfig) {
          setCopyConfig(parsed.copyConfig);
        }
        if (parsed.previewVars) {
          setPreviewVars(parsed.previewVars);
        }
        if (typeof parsed.rawHtmlSource === 'string' && parsed.rawHtmlSource.trim()) {
          setRawHtmlSource(parsed.rawHtmlSource);
          setIsCustomHtmlDetached(Boolean(parsed.isCustomHtmlDetached));
        }
        if (parsed.savedAt) {
          setLastSavedAt(parsed.savedAt);
        }
      }
    } catch {}
  }, []);

  // Automatically regenerate HTML from structure + copy whenever not in detached raw HTML mode
  useEffect(() => {
    if (!isCustomHtmlDetached) {
      setRawHtmlSource(buildStructuredRenewalHtml(sections, copyConfig));
    }
  }, [sections, copyConfig, isCustomHtmlDetached]);

  // Interpolated subject, HTML, and CTA link for preview and dispatch
  const renderedOutput = useMemo(() => {
    const { html, resolvedCtaUrl } = interpolateRenewalTemplate(
      rawHtmlSource,
      previewVars,
      copyConfig.ctaDestinationUrl
    );
    const { html: interpolatedSubject } = interpolateRenewalTemplate(
      copyConfig.subjectTemplate,
      previewVars,
      copyConfig.ctaDestinationUrl
    );
    return {
      subject: interpolatedSubject,
      html,
      resolvedCtaUrl
    };
  }, [rawHtmlSource, previewVars, copyConfig.ctaDestinationUrl, copyConfig.subjectTemplate]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 6500);
  };

  // Load a preset template
  const handleSelectPreset = (presetId: string) => {
    const found = RENEWAL_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setCopyConfig({ ...found.copy, benefitItems: [...found.copy.benefitItems] });
    setPreviewVars({ ...found.variables });
    setIsCustomHtmlDetached(false);
    const nextHtml = buildStructuredRenewalHtml(sections, found.copy);
    setRawHtmlSource(nextHtml);
    showToast('info', `Loaded preset: "${found.name}"`);
  };

  // Toggle section visibility
  const handleToggleSection = (id: RenewalSectionId) => {
    setIsCustomHtmlDetached(false);
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec))
    );
  };

  // Move section up or down in structure
  const handleMoveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    setIsCustomHtmlDetached(false);
    setSections((prev) => {
      const clone = [...prev];
      const temp = clone[index];
      clone[index] = clone[targetIdx];
      clone[targetIdx] = temp;
      return clone;
    });
  };

  // Insert placeholder token at cursor in raw HTML source editor
  const handleInsertToken = (token: string) => {
    setIsCustomHtmlDetached(true);
    const textarea = htmlTextareaRef.current;
    if (!textarea) {
      setRawHtmlSource((prev) => `${prev}${token}`);
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const updated = `${rawHtmlSource.slice(0, start)}${token}${rawHtmlSource.slice(end)}`;
    setRawHtmlSource(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 10);
  };

  // Save template structure, copy, and HTML to localStorage & backend
  const handleSaveTemplate = async () => {
    setIsSaving(true);
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      localStorage.setItem(
        STORAGE_KEY_RENEWAL_EDITOR,
        JSON.stringify({
          sections,
          copyConfig,
          previewVars,
          rawHtmlSource,
          isCustomHtmlDetached,
          savedAt: nowLabel
        })
      );

      await fetch('/api/v1/admin/renewal-offer-template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectTemplate: copyConfig.subjectTemplate,
          htmlTemplate: rawHtmlSource,
          defaultVariables: previewVars
        })
      });

      setLastSavedAt(nowLabel);
      showToast('success', 'Renewal email structure, copy, and HTML template saved.');
    } catch {
      setLastSavedAt(nowLabel);
      showToast('success', 'Renewal email template saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset structure and copy back to default preset
  const handleResetToDefault = () => {
    const base = RENEWAL_PRESETS[0];
    setSections(DEFAULT_SECTIONS_ORDER);
    setCopyConfig({ ...base.copy, benefitItems: [...base.copy.benefitItems] });
    setPreviewVars({ ...base.variables });
    setIsCustomHtmlDetached(false);
    setRawHtmlSource(buildStructuredRenewalHtml(DEFAULT_SECTIONS_ORDER, base.copy));
    localStorage.removeItem(STORAGE_KEY_RENEWAL_EDITOR);
    showToast('info', 'Reset structure and copy to default Membership Renewal template.');
  };

  // Copy rendered HTML to clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(renderedOutput.html);
      showToast('success', 'Rendered HTML copied to clipboard.');
    } catch {
      showToast('error', 'Unable to copy to clipboard.');
    }
  };

  // Print / Export rendered email preview as PDF
  const handleExportPdf = () => {
    const printWin = window.open('', '_blank', 'width=820,height=920');
    if (!printWin) {
      window.print();
      return;
    }
    printWin.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${renderedOutput.subject}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 24px; background: #f8fafc; color: #0f172a; }
      .meta-box { max-width: 650px; margin: 0 auto 18px auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 18px; font-size: 12px; line-height: 1.6; }
      @media print { body { background: #ffffff; margin: 0; } }
    </style>
  </head>
  <body>
    <div class="meta-box">
      <div><strong>Subject:</strong> ${renderedOutput.subject}</div>
      <div><strong>To:</strong> ${previewVars.recipientName} &lt;${previewVars.email}&gt; (${previewVars.companyName})</div>
      <div><strong>Direct CTA Destination:</strong> ${renderedOutput.resolvedCtaUrl}</div>
    </div>
    ${renderedOutput.html}
    <script>
      window.onload = function() { setTimeout(function() { window.print(); }, 250); };
    </script>
  </body>
</html>`);
    printWin.document.close();
  };

  // Test the CTA button checkout modal directly in-app
  const handleTestCtaCheckout = () => {
    const amountNum = Number(previewVars.renewalAmountUsd.replace(/[^0-9.]/g, '')) || 990;
    if (onOpenPaymentCheckout) {
      onOpenPaymentCheckout({
        planId: previewVars.planId || 'basic-business-plan',
        title: `${previewVars.planName} Renewal — ${previewVars.companyName}`,
        description: `Annual Renewal / Balance Settlement for ${previewVars.decisionMakerName} (${previewVars.companyName} · ${previewVars.address}) · Ref: ${previewVars.invoiceRef}`,
        amountUsd: amountNum,
        type: 'SUBSCRIPTION',
        supplierCompany: previewVars.companyName,
        clientEmail: previewVars.email,
        billingName: `${previewVars.decisionMakerName} (${previewVars.companyName})`,
        address: previewVars.address,
        decisionMakerName: previewVars.decisionMakerName,
        preferredPaymentMethod: previewVars.paymentMethod
      });
      showToast('info', `Opened Payment Checkout test modal for ${previewVars.companyName} ($${amountNum} USD).`);
    }
  };

  // Dispatch either a Test Preview to Admin or Live Renewal Email to the recipient
  const handleDispatchEmail = async (isTestPreview: boolean) => {
    if (isTestPreview) {
      setIsDispatchingTest(true);
    } else {
      setIsDispatchingLive(true);
    }

    try {
      const numericAmount = Number(previewVars.renewalAmountUsd.replace(/[^0-9.]/g, '')) || 990;
      const res = await fetch('/api/v1/admin/renewal-offer-template/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: previewVars.email,
          recipientName: previewVars.recipientName,
          companyName: previewVars.companyName,
          address: previewVars.address,
          paymentMethod: previewVars.paymentMethod,
          planId: previewVars.planId,
          renewalAmountUsd: numericAmount,
          subject: renderedOutput.subject,
          renderedHtml: renderedOutput.html,
          isTestPreview,
          testAdminEmail,
          sendAdminCopy,
          adminCopyEmails: ['yr943334@gmail.com', 'sankalprajput15@gmail.com']
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || 'Email dispatched successfully.');
      } else {
        showToast('error', data.message || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      showToast('error', `Dispatch error: ${err?.message || 'Network failure'}`);
    } finally {
      setIsDispatchingTest(false);
      setIsDispatchingLive(false);
    }
  };

  // Intercept clicks inside the live preview container so admins can test the CTA button without leaving the editor
  const handlePreviewContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor) {
      e.preventDefault();
      handleTestCtaCheckout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Automated Membership Renewal Studio</span>
              <span aria-hidden="true">·</span>
              <span>Direct Production Links Enabled</span>
              {lastSavedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-medium">Saved at {lastSavedAt}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Renewal Email HTML &amp; Structure Editor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Modify the structural sections, copywriting, dynamic placeholders, and raw HTML source of automated membership renewal emails, and test live desktop/mobile rendering before dispatch.
            </p>
          </div>

          {/* Workspace Mode Segmented Control */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setWorkspaceMode('SPLIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  workspaceMode === 'SPLIT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Structure &amp; Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('HTML_SOURCE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  workspaceMode === 'HTML_SOURCE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw HTML Code</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('PREVIEW_ONLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  workspaceMode === 'PREVIEW_ONLY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Preview Mode</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to default template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusBanner && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : statusBanner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-slate-500 hover:text-slate-800 text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Preset Template Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1">Load Renewal Preset:</span>
            {RENEWAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  copyConfig.presetId === preset.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {onNavigateToInsights && (
            <button
              type="button"
              onClick={onNavigateToInsights}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View Open Rate &amp; Conversion Insights</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: STRUCTURE & COPY EDITOR OR RAW HTML EDITOR */}
        {workspaceMode !== 'PREVIEW_ONLY' && (
          <div className="xl:col-span-6 space-y-6">
            {workspaceMode === 'SPLIT' ? (
              <>
                {/* 1. Email Structure Manager (Reorder & Toggle Blocks) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>01. Email Structural Blocks (Toggle &amp; Reorder)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enable, disable, or reorder the modular sections of the automated renewal email.
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {sections.filter((s) => s.enabled).length}/{sections.length} Active
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          section.enabled ? 'bg-white' : 'bg-slate-50 opacity-65'
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={section.enabled}
                            onChange={() => handleToggleSection(section.id)}
                            className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900">{section.label}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {section.description}
                            </div>
                          </div>
                        </label>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'UP')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-35 text-slate-600 cursor-pointer"
                            title="Move block up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sections.length - 1}
                            onClick={() => handleMoveSection(idx, 'DOWN')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-35 text-slate-600 cursor-pointer"
                            title="Move block down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Email Copywriting & CTA Configuration */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      02. Renewal Copywriting, Benefits &amp; Direct Link Settings
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Edit subject line, hero headlines, body paragraphs, benefit bullet points, and direct CTA link.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Subject Line Template
                      </label>
                      <input
                        type="text"
                        value={copyConfig.subjectTemplate}
                        onChange={(e) => {
                          setIsCustomHtmlDetached(false);
                          setCopyConfig((prev) => ({ ...prev, subjectTemplate: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Header Kicker Line
                        </label>
                        <input
                          type="text"
                          value={copyConfig.kickerText}
                          onChange={(e) => {
                            setIsCustomHtmlDetached(false);
                            setCopyConfig((prev) => ({ ...prev, kickerText: e.target.value }));
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Header Background
                          </label>
                          <input
                            type="color"
                            value={copyConfig.headerBgColor}
                            onChange={(e) => {
                              setIsCustomHtmlDetached(false);
                              setCopyConfig((prev) => ({ ...prev, headerBgColor: e.target.value }));
                            }}
                            className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer p-1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            CTA Button Color
                          </label>
                          <input
                            type="color"
                            value={copyConfig.ctaButtonColor}
                            onChange={(e) => {
                              setIsCustomHtmlDetached(false);
                              setCopyConfig((prev) => ({ ...prev, ctaButtonColor: e.target.value }));
                            }}
                            className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hero Headline
                      </label>
                      <input
                        type="text"
                        value={copyConfig.headlineText}
                        onChange={(e) => {
                          setIsCustomHtmlDetached(false);
                          setCopyConfig((prev) => ({ ...prev, headlineText: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hero Subheadline
                      </label>
                      <input
                        type="text"
                        value={copyConfig.subheadlineText}
                        onChange={(e) => {
                          setIsCustomHtmlDetached(false);
                          setCopyConfig((prev) => ({ ...prev, subheadlineText: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Salutation / Greeting
                        </label>
                        <input
                          type="text"
                          value={copyConfig.greetingLine}
                          onChange={(e) => {
                            setIsCustomHtmlDetached(false);
                            setCopyConfig((prev) => ({ ...prev, greetingLine: e.target.value }));
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Ledger Table Heading
                        </label>
                        <input
                          type="text"
                          value={copyConfig.ledgerSectionTitle}
                          onChange={(e) => {
                            setIsCustomHtmlDetached(false);
                            setCopyConfig((prev) => ({
                              ...prev,
                              ledgerSectionTitle: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Opening Paragraph 1
                      </label>
                      <textarea
                        rows={3}
                        value={copyConfig.introParagraph1}
                        onChange={(e) => {
                          setIsCustomHtmlDetached(false);
                          setCopyConfig((prev) => ({ ...prev, introParagraph1: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Opening Paragraph 2
                      </label>
                      <textarea
                        rows={3}
                        value={copyConfig.introParagraph2}
                        onChange={(e) => {
                          setIsCustomHtmlDetached(false);
                          setCopyConfig((prev) => ({ ...prev, introParagraph2: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 leading-relaxed"
                      />
                    </div>

                    {/* Editable Benefit Bullet Items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700">
                          Included Renewal Benefits List
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomHtmlDetached(false);
                            setCopyConfig((prev) => ({
                              ...prev,
                              benefitItems: [
                                ...prev.benefitItems,
                                'Priority buyer matchmaking and verified exporter protection'
                              ]
                            }));
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Benefit</span>
                        </button>
                      </div>
                      {copyConfig.benefitItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              setIsCustomHtmlDetached(false);
                              const updated = [...copyConfig.benefitItems];
                              updated[idx] = e.target.value;
                              setCopyConfig((prev) => ({ ...prev, benefitItems: updated }));
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomHtmlDetached(false);
                              setCopyConfig((prev) => ({
                                ...prev,
                                benefitItems: prev.benefitItems.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Remove benefit line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Policy Compliance Notice Copy
                      </label>
                      <textarea
                        rows={2}
                        value={copyConfig.policyNoticeCopy}
                        onChange={(e) => {
                          setIsCustomHtmlDetached(false);
                          setCopyConfig((prev) => ({ ...prev, policyNoticeCopy: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CTA Button Label
                        </label>
                        <input
                          type="text"
                          value={copyConfig.ctaButtonText}
                          onChange={(e) => {
                            setIsCustomHtmlDetached(false);
                            setCopyConfig((prev) => ({ ...prev, ctaButtonText: e.target.value }));
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Direct CTA Destination URL (Production)
                        </label>
                        <input
                          type="text"
                          value={copyConfig.ctaDestinationUrl}
                          onChange={(e) => {
                            setIsCustomHtmlDetached(false);
                            setCopyConfig((prev) => ({
                              ...prev,
                              ctaDestinationUrl: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* RAW HTML SOURCE CODE EDITOR */
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-blue-600" />
                      <span>Raw HTML Email Source Editor</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Directly edit the HTML markup and insert dynamic recipient or plan placeholders.
                    </p>
                  </div>

                  {isCustomHtmlDetached && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomHtmlDetached(false);
                        setRawHtmlSource(buildStructuredRenewalHtml(sections, copyConfig));
                        showToast('info', 'Re-synced HTML source with visual structure & copy settings.');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Re-sync with Structure Builder
                    </button>
                  )}
                </div>

                {/* Clickable Placeholder Insertion Bar */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Click a token to insert at cursor:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PLACEHOLDER_TOKENS.map((item) => (
                      <button
                        key={item.token}
                        type="button"
                        onClick={() => handleInsertToken(item.token)}
                        className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-mono text-slate-800 transition-colors cursor-pointer"
                        title={item.label}
                      >
                        {item.token}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  ref={htmlTextareaRef}
                  rows={22}
                  value={rawHtmlSource}
                  onChange={(e) => {
                    setIsCustomHtmlDetached(true);
                    setRawHtmlSource(e.target.value);
                  }}
                  spellCheck={false}
                  className="w-full p-3.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 3. Test Recipient & Variable Values Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    03. Recipient &amp; Plan Variables for Preview / Dispatch
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize the recipient profile values interpolated into the live preview and outgoing dispatch.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={previewVars.recipientName}
                    onChange={(e) =>
                      setPreviewVars((prev) => ({
                        ...prev,
                        recipientName: e.target.value,
                        decisionMakerName: e.target.value
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={previewVars.email}
                    onChange={(e) =>
                      setPreviewVars((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={previewVars.companyName}
                    onChange={(e) =>
                      setPreviewVars((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={previewVars.planName}
                    onChange={(e) =>
                      setPreviewVars((prev) => ({ ...prev, planName: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Standard Rate ($)
                    </label>
                    <input
                      type="text"
                      value={previewVars.standardPriceUsd}
                      onChange={(e) =>
                        setPreviewVars((prev) => ({ ...prev, standardPriceUsd: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Earlier Paid ($)
                    </label>
                    <input
                      type="text"
                      value={previewVars.amountPaidUsd}
                      onChange={(e) =>
                        setPreviewVars((prev) => ({ ...prev, amountPaidUsd: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Net Due ($)
                    </label>
                    <input
                      type="text"
                      value={previewVars.renewalAmountUsd}
                      onChange={(e) =>
                        setPreviewVars((prev) => ({ ...prev, renewalAmountUsd: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN (OR FULL WIDTH IN PREVIEW_ONLY): LIVE RENDERING PREVIEW & DISPATCH BAR */}
        <div
          className={`${
            workspaceMode === 'PREVIEW_ONLY' ? 'xl:col-span-12' : 'xl:col-span-6'
          } space-y-5`}
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            {/* Preview Control Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Live Email Rendering Preview</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify exact layout, interpolated variables, and direct CTA link before dispatch.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('DESKTOP')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'DESKTOP'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (650px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('MOBILE')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      previewViewport === 'MOBILE'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (375px)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy HTML</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Simulated Email Client Envelope Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500 w-16">Subject:</span>
                <span className="font-bold text-slate-900">{renderedOutput.subject}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500 w-16">To:</span>
                <span className="text-slate-800">
                  {previewVars.recipientName} &lt;
                  <span className="font-mono text-blue-600">{previewVars.email}</span>&gt; ·{' '}
                  {previewVars.companyName}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-500 shrink-0">CTA URL:</span>
                  <span className="font-mono text-[11px] text-emerald-700 truncate">
                    {renderedOutput.resolvedCtaUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTestCtaCheckout}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline shrink-0 cursor-pointer"
                >
                  Test CTA Checkout Flow
                </button>
              </div>
            </div>

            {/* Rendered HTML Viewport Container */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 sm:p-6 overflow-x-auto">
              <div
                onClick={handlePreviewContainerClick}
                className={`mx-auto transition-all ${
                  previewViewport === 'MOBILE' ? 'max-w-[375px]' : 'max-w-[650px]'
                }`}
                dangerouslySetInnerHTML={{ __html: renderedOutput.html }}
              />
            </div>

            {/* Pre-Dispatch Test & Live Dispatch Bar */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Test Admin Inbox:
                  </label>
                  <input
                    type="email"
                    value={testAdminEmail}
                    onChange={(e) => setTestAdminEmail(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendAdminCopy}
                    onChange={(e) => setSendAdminCopy(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>CC Admin Copies (yr943334@gmail.com &amp; sankalprajput15@gmail.com)</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDispatchingTest || isDispatchingLive}
                  onClick={() => handleDispatchEmail(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-700" />
                  <span>
                    {isDispatchingTest
                      ? 'Sending Test Preview...'
                      : `Send Test Preview to ${testAdminEmail}`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isDispatchingLive || isDispatchingTest}
                  onClick={() => handleDispatchEmail(false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isDispatchingLive
                      ? 'Dispatching Live Email...'
                      : `Dispatch Live Renewal Email to ${previewVars.email}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
