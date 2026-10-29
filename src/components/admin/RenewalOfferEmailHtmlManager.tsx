import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Code2,
  Eye,
  Send,
  Save,
  RotateCcw,
  Copy,
  CheckCircle2,
  Sparkles,
  UserCheck,
  CreditCard,
  Building2,
  Smartphone,
  Monitor,
  FileCode,
  RefreshCw,
  AlertCircle,
  Plus,
  Mail,
  Upload,
  Image as ImageIcon,
  Trash2,
  Layers
} from 'lucide-react';
import { PaymentCheckoutData } from '../../types';

export interface RenewalOfferTemplateVariables {
  userName: string;
  decisionMakerName: string;
  planName: string;
  planId: string;
  offerDetails: string;
  offerPrice: string;
  standardPrice: string;
  discountPercent: string;
  savingsAmount: string;
  promoCode: string;
  companyName: string;
  address: string;
  email: string;
  paymentMethod: string;
  ctaText: string;
  ctaUrl: string;
  supplierSegment: string;
  headerImageUrl: string;
  footerImageUrl: string;
}

export type SupplierSegmentId =
  | 'GLOBAL_B2B'
  | 'ENERGY_COMMODITIES'
  | 'INDUSTRIAL_MACHINERY'
  | 'ELECTRONICS_SOLAR'
  | 'AGRO_TEXTILES';

export interface SupplierSegmentBrandConfig {
  segmentId: SupplierSegmentId;
  segmentName: string;
  tagline: string;
  accentColor: string;
  showHeaderImage: boolean;
  headerImageUrl: string;
  headerAltText: string;
  showFooterImage: boolean;
  footerImageUrl: string;
  footerAltText: string;
}

export const DEFAULT_SUPPLIER_SEGMENT_BRANDING: Record<
  SupplierSegmentId,
  SupplierSegmentBrandConfig
> = {
  GLOBAL_B2B: {
    segmentId: 'GLOBAL_B2B',
    segmentName: 'Global B2B & Multi-Sector Exporters',
    tagline: 'Verified International Trade & Swiss Escrow Protection Network',
    accentColor: '#2563eb',
    showHeaderImage: true,
    headerImageUrl:
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
    headerAltText: 'Trade Heaven Global B2B Shipping & Trade Network Header',
    showFooterImage: true,
    footerImageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80',
    footerAltText: 'Trade Heaven Verified Global Corporate Compliance Footer'
  },
  ENERGY_COMMODITIES: {
    segmentId: 'ENERGY_COMMODITIES',
    segmentName: 'Energy, Petroleum & Bulk Commodities',
    tagline: 'EN 590, Jet Fuel A-1, Metals & Institutional Commodity Trade Desk',
    accentColor: '#d97706',
    showHeaderImage: true,
    headerImageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    headerAltText: 'Energy, Petroleum & Bulk Commodities Supplier Segment Banner',
    showFooterImage: true,
    footerImageUrl:
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&auto=format&fit=crop&q=80',
    footerAltText: 'SGS & Saybolt Verified Port Inspection & Tanker Logistics Footer'
  },
  INDUSTRIAL_MACHINERY: {
    segmentId: 'INDUSTRIAL_MACHINERY',
    segmentName: 'Industrial Machinery & Heavy Power Equipment',
    tagline: 'CAT / Cummins Generators, CNC Centers & Earth-Moving Fleet Division',
    accentColor: '#059669',
    showHeaderImage: true,
    headerImageUrl: '/assets/aistudio/image002_50ab7837.png',
    headerAltText: 'Heavy Industrial Machinery & Power Generators Supplier Banner',
    showFooterImage: true,
    footerImageUrl: '/assets/aistudio/image005_20fe3db0.png',
    footerAltText: 'Verified Heavy Construction & OEM Equipment Compliance Footer'
  },
  ELECTRONICS_SOLAR: {
    segmentId: 'ELECTRONICS_SOLAR',
    segmentName: 'Electronics, Solar & Clean Energy Tech',
    tagline: 'Tier-1 Lithium ESS, Solar Inverters & Semiconductor Supply Chain',
    accentColor: '#0284c7',
    showHeaderImage: true,
    headerImageUrl:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    headerAltText: 'Renewable Solar & Electronics Manufacturing Segment Header',
    showFooterImage: true,
    footerImageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    footerAltText: 'CE / ISO9001 & UN38.3 Certified Clean Tech Export Footer'
  },
  AGRO_TEXTILES: {
    segmentId: 'AGRO_TEXTILES',
    segmentName: 'Agro-Commodities, Food Processing & Textiles',
    tagline: 'Global Agricultural Exports, Organic Spices, Grains & Apparel Mills',
    accentColor: '#16a34a',
    showHeaderImage: true,
    headerImageUrl:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&auto=format&fit=crop&q=80',
    headerAltText: 'Global Agro-Commodities & Textile Export Segment Header',
    showFooterImage: true,
    footerImageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    footerAltText: 'Phytosanitary & Global Cold-Chain Export Logistics Footer'
  }
};

export interface PlaceholderDescriptor {
  token: string;
  key: keyof RenewalOfferTemplateVariables;
  label: string;
  category: 'USER' | 'PLAN' | 'OFFER' | 'COMPANY' | 'BRANDING';
  description: string;
}

export const RENEWAL_OFFER_PLACEHOLDERS: PlaceholderDescriptor[] = [
  {
    token: '{{userName}}',
    key: 'userName',
    label: 'User Name',
    category: 'USER',
    description: 'Primary account holder or recipient full name'
  },
  {
    token: '{{decisionMakerName}}',
    key: 'decisionMakerName',
    label: 'Decision Maker',
    category: 'USER',
    description: 'Authorized corporate decision maker name'
  },
  {
    token: '{{email}}',
    key: 'email',
    label: 'User Email',
    category: 'USER',
    description: 'Registered corporate email address'
  },
  {
    token: '{{planName}}',
    key: 'planName',
    label: 'Plan Name',
    category: 'PLAN',
    description: 'Target subscription tier name (e.g. Basic Business Plan)'
  },
  {
    token: '{{planId}}',
    key: 'planId',
    label: 'Plan Slug / ID',
    category: 'PLAN',
    description: 'Checkout plan identifier (e.g. basic-business-plan)'
  },
  {
    token: '{{offerDetails}}',
    key: 'offerDetails',
    label: 'Offer Details',
    category: 'OFFER',
    description: 'Summary of the renewal promotion & included perks'
  },
  {
    token: '{{offerPrice}}',
    key: 'offerPrice',
    label: 'Offer Price (USD)',
    category: 'OFFER',
    description: 'Discounted annual renewal price (e.g. $990)'
  },
  {
    token: '{{standardPrice}}',
    key: 'standardPrice',
    label: 'Standard Price',
    category: 'OFFER',
    description: 'Regular non-discounted plan rate (e.g. $1,100)'
  },
  {
    token: '{{discountPercent}}',
    key: 'discountPercent',
    label: 'Discount %',
    category: 'OFFER',
    description: 'Percentage discount offered (e.g. 10% OFF)'
  },
  {
    token: '{{savingsAmount}}',
    key: 'savingsAmount',
    label: 'Total Savings',
    category: 'OFFER',
    description: 'Dollar amount saved on renewal (e.g. $110 USD)'
  },
  {
    token: '{{promoCode}}',
    key: 'promoCode',
    label: 'Promo Code',
    category: 'OFFER',
    description: 'Applicable promotional voucher code (e.g. DIWALI10)'
  },
  {
    token: '{{companyName}}',
    key: 'companyName',
    label: 'Company Name',
    category: 'COMPANY',
    description: 'Registered legal business or enterprise name'
  },
  {
    token: '{{address}}',
    key: 'address',
    label: 'Billing Address',
    category: 'COMPANY',
    description: 'Corporate street address, city, state, and postal code'
  },
  {
    token: '{{paymentMethod}}',
    key: 'paymentMethod',
    label: 'Payment Method',
    category: 'COMPANY',
    description: 'Preferred renewal settlement method (e.g. Debit Card)'
  },
  {
    token: '{{ctaText}}',
    key: 'ctaText',
    label: 'CTA Button Label',
    category: 'COMPANY',
    description: 'Call-to-action button text (e.g. Renew Now)'
  },
  {
    token: '{{ctaUrl}}',
    key: 'ctaUrl',
    label: 'Checkout CTA URL',
    category: 'COMPANY',
    description: 'Direct parameterized URL that opens the renewal payment checkout'
  },
  {
    token: '{{supplierSegment}}',
    key: 'supplierSegment',
    label: 'Supplier Segment',
    category: 'BRANDING',
    description: 'Target supplier industry segment name for brand alignment'
  },
  {
    token: '{{headerImageUrl}}',
    key: 'headerImageUrl',
    label: 'Header Image URL',
    category: 'BRANDING',
    description: 'Custom uploaded or segment-aligned header banner image URL'
  },
  {
    token: '{{footerImageUrl}}',
    key: 'footerImageUrl',
    label: 'Footer Image URL',
    category: 'BRANDING',
    description: 'Custom uploaded or segment-aligned footer banner image URL'
  }
];

export const DEFAULT_RENEWAL_SUBJECT_TEMPLATE =
  '💎 {{planName}} Renewal Offer ({{offerPrice}}/yr — {{discountPercent}}) & Exciting B2B Deals for {{companyName}} (Attn: {{userName}})';

export const DEFAULT_RENEWAL_HTML_TEMPLATE = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <!-- Top Hero Header -->
  <div style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #fbbf24; text-transform: uppercase; margin-bottom: 10px; background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.35); padding: 4px 12px; border-radius: 9999px;">
      TRADE HEAVEN • {{supplierSegment}}
    </div>
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.25; letter-spacing: -0.5px;">
      {{planName}} Renewal &amp; Exclusive Trade Offer
    </h1>
    <p style="margin: 8px 0 0 0; font-size: 14px; color: #cbd5e1;">
      Prepared exclusively for <strong>{{userName}}</strong> at <strong>{{companyName}}</strong>
    </p>
  </div>

  <!-- Main Email Body -->
  <div style="padding: 30px 24px; background: #ffffff; color: #1e293b;">
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0; color: #0f172a;">
      Dear <strong>{{userName}}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.65; margin: 0 0 20px 0; color: #334155;">
      Thank you for your continued partnership with <strong>Trade Heaven Global B2B</strong>. Your <strong>{{planName}}</strong> subscription for <strong>{{companyName}}</strong> is now eligible for renewal under our limited-time promotion: <strong>{{offerDetails}}</strong>.
    </p>

    <!-- Dynamic Offer Banner Callout -->
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 18px 20px; margin: 0 0 24px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: 900; color: #92400e; text-transform: uppercase; letter-spacing: 1.2px;">
          🔥 ACTIVE RENEWAL OFFER • CODE: {{promoCode}}
        </span>
        <span style="background: #d97706; color: #ffffff; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px;">
          {{discountPercent}} (SAVE {{savingsAmount}})
        </span>
      </div>
      <div style="font-size: 15px; font-weight: 800; color: #78350f; margin-bottom: 4px;">
        {{planName}} — <span style="text-decoration: line-through; color: #92400e; font-weight: 600;">{{standardPrice}}/yr</span> <span style="color: #059669; font-size: 18px; font-weight: 900;">{{offerPrice}} USD / Year</span>
      </div>
      <div style="font-size: 13px; color: #92400e; line-height: 1.5;">
        {{offerDetails}}
      </div>
    </div>

    <!-- Client Account & Billing Summary Box -->
    <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 0 0 24px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span>CLIENT MEMBERSHIP &amp; BILLING SUMMARY</span>
        <span style="background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800;">VERIFIED ACCOUNT</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #475569; width: 165px; font-weight: 600;">User / Decision Maker:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">{{userName}} ({{decisionMakerName}})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Company Name:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">{{companyName}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Supplier Segment:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{supplierSegment}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Address:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{address}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Registered Email:</td>
          <td style="padding: 6px 0; font-family: monospace; color: #2563eb; font-weight: 700;">{{email}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Selected Plan:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">{{planName}} ({{offerPrice}} USD/yr)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 600;">Payment Method:</td>
          <td style="padding: 6px 0;">
            <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 12px;">💳 {{paymentMethod}}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Plan Benefits & Offer Deliverables -->
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 12px; padding: 18px 20px; margin: 0 0 24px 0;">
      <div style="font-size: 12px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px;">
        🎁 {{planName}} Renewal Benefits &amp; Exciting Deals Included:
      </div>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #1e293b; line-height: 1.7;">
        <li><strong>Special Renewal Offer ({{offerPrice}} USD / Year):</strong> {{offerDetails}} (Promo Code: <strong>{{promoCode}}</strong>).</li>
        <li><strong>Verified &amp; Genuine Buyer Orders:</strong> Up to 20 Verified &amp; Genuine Order Matches per month + Priority Deal Alerts.</li>
        <li><strong>Catalogue &amp; Priority Showcase:</strong> Dedicated Catalogue Page (Up to 50 Product Listings, 10 Ready-to-Ship Listings &amp; 2 Showcase Banners).</li>
        <li><strong>Website, Domain &amp; SSL Included:</strong> Dedicated 1-Page Business Microsite with Domain, Hosting, SSL &amp; Multi-Language Translator.</li>
        <li><strong>Dedicated Account Manager &amp; {{paymentMethod}} Checkout:</strong> 24/7 Priority Export CSR Support + instant renewal via <strong>{{paymentMethod}}</strong>.</li>
      </ul>
    </div>

    <!-- Direct Renew Now CTA Button -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{ctaUrl}}" data-renewal-trigger="true" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 15px 42px; border-radius: 12px; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3); letter-spacing: 0.3px;">
        {{ctaText}}
      </a>
      <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
        Instant {{planName}} renewal checkout ({{offerPrice}} USD) for <strong>{{companyName}}</strong> • Preferred method: <strong>{{paymentMethod}}</strong>
      </div>
    </div>

    <!-- Corporate Billing Protection Footer -->
    <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
      <strong style="color: #0f172a;">Verified Corporate Billing Protection:</strong> Your {{planName}} renewal is processed through Trade Heaven’s PCI-DSS compliant gateway with instant GST/commercial invoice generation for <strong>{{companyName}}</strong> ({{address}}).
    </div>

    <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0; line-height: 1.5;">
      Dispatched via <strong>noreply@tradeheaven.net</strong> • Questions regarding your renewal offer? Contact your Account Executive on WhatsApp at <strong>+91 85329 34479</strong> or email <strong>help@tradeheaven.net</strong>.
    </p>
  </div>
</div>`;

const SAMPLE_CLIENT_PRESETS: Array<{
  id: string;
  label: string;
  badge: string;
  recommendedSegment: SupplierSegmentId;
  variables: Omit<
    RenewalOfferTemplateVariables,
    'ctaUrl' | 'supplierSegment' | 'headerImageUrl' | 'footerImageUrl'
  >;
}> = [
  {
    id: 'ali-basic-plan',
    label: 'Ali Charley Ezekiah — ACE Intermediary (Basic Plan • $990)',
    badge: 'DEFAULT CLIENT',
    recommendedSegment: 'ENERGY_COMMODITIES',
    variables: {
      userName: 'Ali Charley Ezekiah',
      decisionMakerName: 'Ali Charley Ezekiah',
      planName: 'Basic Business Plan',
      planId: 'basic-business-plan',
      offerDetails:
        'Flat 10% Loyalty Discount ($990 USD/yr vs. $1,100/yr standard rate) + 20 Verified Buyer Orders/mo & New Exciting Deals',
      offerPrice: '$990',
      standardPrice: '$1,100',
      discountPercent: '10% OFF',
      savingsAmount: '$110 USD',
      promoCode: 'DIWALI10',
      companyName: 'ACE Intermediary',
      address: '1241 Hackberry Avenue Corsicana Texas 75110',
      email: 'ezekiahali355@gmail.com',
      paymentMethod: 'Debit Card',
      ctaText: 'Renew Now'
    }
  },
  {
    id: 'mark-vip-plan',
    label: 'Mark Johnson — Atlantic Power & Equipment (VIP Plan • $5,490)',
    badge: 'VIP UPGRADE',
    recommendedSegment: 'INDUSTRIAL_MACHINERY',
    variables: {
      userName: 'Mark Johnson',
      decisionMakerName: 'Mark Johnson (President)',
      planName: 'VIP Business Plan',
      planId: 'vip-business-plan',
      offerDetails:
        'Flat 10% Diwali Maha Utsav Discount ($5,490 USD/yr vs. $6,100/yr) + 60 Verified Buyers/mo & Direct Escrow Settlement',
      offerPrice: '$5,490',
      standardPrice: '$6,100',
      discountPercent: '10% OFF',
      savingsAmount: '$610 USD',
      promoCode: 'DIWALI10',
      companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
      address: 'P.O. Box 1176, Marmora, NJ 08223 USA',
      email: 'mjohnson@atlanticpowerequip.com',
      paymentMethod: 'Debit Card',
      ctaText: 'Renew Now'
    }
  },
  {
    id: 'randy-premium-plan',
    label: 'Mr. Randy — Middle Fox LLC (Premium Partner • $1,890)',
    badge: 'PREMIUM TIER',
    recommendedSegment: 'ENERGY_COMMODITIES',
    variables: {
      userName: 'Mr. Randy',
      decisionMakerName: 'Mr. Randy',
      planName: 'Premium Partner Plan',
      planId: 'premium-partner-plan',
      offerDetails:
        'Flat 10% Renewal Discount ($1,890 USD/yr vs. $2,100/yr) + 40 Verified Buyer Tenders/mo & Dedicated Export Manager',
      offerPrice: '$1,890',
      standardPrice: '$2,100',
      discountPercent: '10% OFF',
      savingsAmount: '$210 USD',
      promoCode: 'RENEW10',
      companyName: 'Middle Fox LLC',
      address: 'Billings, Montana 59101, United States',
      email: 'randy@midforkcap.com',
      paymentMethod: 'Corporate Wire / Debit Card',
      ctaText: 'Renew Now'
    }
  }
];

const STORAGE_KEY_HTML = 'th_admin_renewal_offer_html_template_v1';
const STORAGE_KEY_SUBJECT = 'th_admin_renewal_offer_subject_template_v1';
const STORAGE_KEY_SEGMENT_BRANDING = 'th_admin_renewal_segment_branding_v1';
const STORAGE_KEY_ACTIVE_SEGMENT = 'th_admin_renewal_active_segment_v1';

export function interpolateRenewalTemplate(
  template: string,
  vars: RenewalOfferTemplateVariables,
  preserveTokens = false
): string {
  if (preserveTokens) return template;
  return template
    .replace(/\{\{\s*userName\s*\}\}/g, vars.userName)
    .replace(/\{\{\s*decisionMakerName\s*\}\}/g, vars.decisionMakerName)
    .replace(/\{\{\s*planName\s*\}\}/g, vars.planName)
    .replace(/\{\{\s*planId\s*\}\}/g, vars.planId)
    .replace(/\{\{\s*offerDetails\s*\}\}/g, vars.offerDetails)
    .replace(/\{\{\s*offerPrice\s*\}\}/g, vars.offerPrice)
    .replace(/\{\{\s*standardPrice\s*\}\}/g, vars.standardPrice)
    .replace(/\{\{\s*discountPercent\s*\}\}/g, vars.discountPercent)
    .replace(/\{\{\s*savingsAmount\s*\}\}/g, vars.savingsAmount)
    .replace(/\{\{\s*promoCode\s*\}\}/g, vars.promoCode)
    .replace(/\{\{\s*companyName\s*\}\}/g, vars.companyName)
    .replace(/\{\{\s*address\s*\}\}/g, vars.address)
    .replace(/\{\{\s*email\s*\}\}/g, vars.email)
    .replace(/\{\{\s*paymentMethod\s*\}\}/g, vars.paymentMethod)
    .replace(/\{\{\s*ctaText\s*\}\}/g, vars.ctaText)
    .replace(/\{\{\s*ctaUrl\s*\}\}/g, vars.ctaUrl)
    .replace(/\{\{\s*supplierSegment\s*\}\}/g, vars.supplierSegment)
    .replace(/\{\{\s*headerImageUrl\s*\}\}/g, vars.headerImageUrl)
    .replace(/\{\{\s*footerImageUrl\s*\}\}/g, vars.footerImageUrl);
}

export function applyHeaderAndFooterBrandingToHtml(
  baseHtml: string,
  segmentConfig: SupplierSegmentBrandConfig,
  preserveTokens = false
): string {
  let result = baseHtml;

  const headerImgSrc = preserveTokens ? '{{headerImageUrl}}' : segmentConfig.headerImageUrl;
  const footerImgSrc = preserveTokens ? '{{footerImageUrl}}' : segmentConfig.footerImageUrl;
  const segmentTitle = preserveTokens ? '{{supplierSegment}}' : segmentConfig.segmentName;

  const headerBannerHtml =
    segmentConfig.showHeaderImage && segmentConfig.headerImageUrl.trim()
      ? `<!-- Supplier Segment Custom Header Banner (${segmentConfig.segmentName}) -->
  <div style="position: relative; width: 100%; background: #090d16; border-bottom: 3px solid ${segmentConfig.accentColor}; overflow: hidden;">
    <img src="${headerImgSrc}" alt="${segmentConfig.headerAltText}" style="width: 100%; height: 155px; object-fit: cover; display: block; opacity: 0.88;" />
    <div style="background: linear-gradient(90deg, rgba(9,13,22,0.92) 0%, rgba(15,23,42,0.75) 100%); padding: 8px 20px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 10px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.4px;">
        ★ ${segmentTitle}
      </span>
      <span style="font-size: 10px; font-weight: 700; color: #e2e8f0;">
        ${segmentConfig.tagline}
      </span>
    </div>
  </div>`
      : '';

  const footerBannerHtml =
    segmentConfig.showFooterImage && segmentConfig.footerImageUrl.trim()
      ? `<!-- Supplier Segment Custom Footer Banner (${segmentConfig.segmentName}) -->
  <div style="width: 100%; background: #0f172a; border-top: 2px solid ${segmentConfig.accentColor}; overflow: hidden;">
    <img src="${footerImgSrc}" alt="${segmentConfig.footerAltText}" style="width: 100%; height: 110px; object-fit: cover; display: block; opacity: 0.82;" />
    <div style="padding: 10px 20px; background: #090d16; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600;">
      Official Trade Heaven Brand Alignment • <strong style="color: #ffffff;">${segmentTitle}</strong> • Verified Global B2B Compliance
    </div>
  </div>`
      : '';

  // Inject header right before <!-- Top Hero Header --> if not already containing a custom header image
  if (headerBannerHtml && !result.includes('Supplier Segment Custom Header Banner')) {
    if (result.includes('<!-- Top Hero Header -->')) {
      result = result.replace(
        '<!-- Top Hero Header -->',
        `${headerBannerHtml}\n  <!-- Top Hero Header -->`
      );
    } else {
      result = `${headerBannerHtml}\n${result}`;
    }
  }

  // Inject footer right before closing outer div if not already containing a custom footer image
  if (footerBannerHtml && !result.includes('Supplier Segment Custom Footer Banner')) {
    const lastDivIdx = result.lastIndexOf('</div>');
    if (lastDivIdx !== -1) {
      result =
        result.slice(0, lastDivIdx) + `\n  ${footerBannerHtml}\n` + result.slice(lastDivIdx);
    } else {
      result = `${result}\n${footerBannerHtml}`;
    }
  }

  return result;
}

interface RenewalOfferEmailHtmlManagerProps {
  onOpenPaymentCheckout?: (data: PaymentCheckoutData) => void;
}

export const RenewalOfferEmailHtmlManager: React.FC<RenewalOfferEmailHtmlManagerProps> = ({
  onOpenPaymentCheckout
}) => {
  const [subjectTemplate, setSubjectTemplate] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SUBJECT) || DEFAULT_RENEWAL_SUBJECT_TEMPLATE;
    } catch {
      return DEFAULT_RENEWAL_SUBJECT_TEMPLATE;
    }
  });

  const [htmlTemplate, setHtmlTemplate] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_HTML) || DEFAULT_RENEWAL_HTML_TEMPLATE;
    } catch {
      return DEFAULT_RENEWAL_HTML_TEMPLATE;
    }
  });

  const [activeSegmentId, setActiveSegmentId] = useState<SupplierSegmentId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_SEGMENT) as SupplierSegmentId | null;
      return saved && DEFAULT_SUPPLIER_SEGMENT_BRANDING[saved] ? saved : 'ENERGY_COMMODITIES';
    } catch {
      return 'ENERGY_COMMODITIES';
    }
  });

  const [segmentBrandingMap, setSegmentBrandingMap] = useState<
    Record<SupplierSegmentId, SupplierSegmentBrandConfig>
  >(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SEGMENT_BRANDING);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SUPPLIER_SEGMENT_BRANDING, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SUPPLIER_SEGMENT_BRANDING;
  });

  const activeSegmentBranding =
    segmentBrandingMap[activeSegmentId] || DEFAULT_SUPPLIER_SEGMENT_BRANDING.GLOBAL_B2B;

  const [selectedPresetId, setSelectedPresetId] = useState<string>('ali-basic-plan');
  const [variables, setVariables] = useState<
    Omit<
      RenewalOfferTemplateVariables,
      'ctaUrl' | 'supplierSegment' | 'headerImageUrl' | 'footerImageUrl'
    >
  >(SAMPLE_CLIENT_PRESETS[0].variables);

  const [previewMode, setPreviewMode] = useState<'RESOLVED' | 'RAW_TOKENS'>('RESOLVED');
  const [viewportSize, setViewportSize] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<
    'SPLIT' | 'CODE_ONLY' | 'PREVIEW_ONLY'
  >('SPLIT');
  const [sendAdminCopy, setSendAdminCopy] = useState<boolean>(true);
  const [adminCopyEmail, setAdminCopyEmail] = useState<string>('yr943334@gmail.com');

  const [isUploadingHeader, setIsUploadingHeader] = useState<boolean>(false);
  const [isUploadingFooter, setIsUploadingFooter] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const subjectInputRef = useRef<HTMLInputElement | null>(null);
  const headerFileInputRef = useRef<HTMLInputElement | null>(null);
  const footerFileInputRef = useRef<HTMLInputElement | null>(null);
  const [lastFocusedField, setLastFocusedField] = useState<'HTML' | 'SUBJECT'>('HTML');

  // Load saved template & supplier segment branding from backend on mount if available
  useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/admin/renewal-offer-template')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.success || !data.template) return;
        if (data.template.htmlTemplate && !localStorage.getItem(STORAGE_KEY_HTML)) {
          setHtmlTemplate(data.template.htmlTemplate);
        }
        if (data.template.subjectTemplate && !localStorage.getItem(STORAGE_KEY_SUBJECT)) {
          setSubjectTemplate(data.template.subjectTemplate);
        }
        if (
          data.template.segmentBranding &&
          Object.keys(data.template.segmentBranding).length > 0 &&
          !localStorage.getItem(STORAGE_KEY_SEGMENT_BRANDING)
        ) {
          setSegmentBrandingMap((prev) => ({
            ...prev,
            ...data.template.segmentBranding
          }));
        }
        if (data.template.updatedAt) {
          setLastSavedAt(data.template.updatedAt);
        }
      })
      .catch(() => {
        // Ignore offline/fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist segment branding locally whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEGMENT_BRANDING, JSON.stringify(segmentBrandingMap));
      localStorage.setItem(STORAGE_KEY_ACTIVE_SEGMENT, activeSegmentId);
    } catch {
      // ignore
    }
  }, [segmentBrandingMap, activeSegmentId]);

  const updateActiveSegmentBranding = (
    updates: Partial<SupplierSegmentBrandConfig>
  ) => {
    setSegmentBrandingMap((prev) => ({
      ...prev,
      [activeSegmentId]: {
        ...prev[activeSegmentId],
        ...updates
      }
    }));
  };

  const handleUploadBrandAsset = async (
    slot: 'header' | 'footer',
    file: File | undefined
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusBanner({
        type: 'error',
        message: 'Please select a valid image file (PNG, JPG, WEBP, SVG, GIF).'
      });
      return;
    }

    if (slot === 'header') {
      setIsUploadingHeader(true);
    } else {
      setIsUploadingFooter(true);
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      let finalImageUrl = dataUrl;

      try {
        const res = await fetch('/api/v1/admin/renewal-offer-template/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl,
            fileName: file.name,
            slot,
            segmentId: activeSegmentId
          })
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload?.url) {
            finalImageUrl = payload.url;
          }
        }
      } catch {
        // Use dataUrl directly if offline
      }

      if (slot === 'header') {
        updateActiveSegmentBranding({
          headerImageUrl: finalImageUrl,
          showHeaderImage: true,
          headerAltText: `${activeSegmentBranding.segmentName} — ${file.name}`
        });
      } else {
        updateActiveSegmentBranding({
          footerImageUrl: finalImageUrl,
          showFooterImage: true,
          footerAltText: `${activeSegmentBranding.segmentName} Footer — ${file.name}`
        });
      }

      setStatusBanner({
        type: 'success',
        message: `Uploaded custom ${slot.toUpperCase()} image ("${file.name}") for the ${
          activeSegmentBranding.segmentName
        } supplier segment.`
      });
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: `Failed to upload ${slot} image: ${err?.message || 'Unknown error'}`
      });
    } finally {
      if (slot === 'header') {
        setIsUploadingHeader(false);
      } else {
        setIsUploadingFooter(false);
      }
    }
  };

  const numericOfferAmount = useMemo(() => {
    const parsed = Number(String(variables.offerPrice).replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 990;
  }, [variables.offerPrice]);

  const computedCtaUrl = useMemo(() => {
    return `https://www.tradeheaven.net/?action=renew-membership&company=${encodeURIComponent(
      variables.companyName
    )}&email=${encodeURIComponent(variables.email)}&decisionMaker=${encodeURIComponent(
      variables.decisionMakerName || variables.userName
    )}&address=${encodeURIComponent(variables.address)}&paymentMethod=${encodeURIComponent(
      variables.paymentMethod
    )}&planId=${encodeURIComponent(variables.planId)}&amountUsd=${numericOfferAmount}`;
  }, [variables, numericOfferAmount]);

  const fullVariables: RenewalOfferTemplateVariables = useMemo(
    () => ({
      ...variables,
      ctaUrl: computedCtaUrl,
      supplierSegment: activeSegmentBranding.segmentName,
      headerImageUrl: activeSegmentBranding.headerImageUrl,
      footerImageUrl: activeSegmentBranding.footerImageUrl
    }),
    [variables, computedCtaUrl, activeSegmentBranding]
  );

  const resolvedSubject = useMemo(
    () => interpolateRenewalTemplate(subjectTemplate, fullVariables, previewMode === 'RAW_TOKENS'),
    [subjectTemplate, fullVariables, previewMode]
  );

  const resolvedHtml = useMemo(() => {
    const interpolated = interpolateRenewalTemplate(
      htmlTemplate,
      fullVariables,
      previewMode === 'RAW_TOKENS'
    );
    return applyHeaderAndFooterBrandingToHtml(
      interpolated,
      activeSegmentBranding,
      previewMode === 'RAW_TOKENS'
    );
  }, [htmlTemplate, fullVariables, activeSegmentBranding, previewMode]);

  // Check which placeholders exist in the template
  const placeholderUsageStats = useMemo(() => {
    return RENEWAL_OFFER_PLACEHOLDERS.map((item) => {
      const regex = new RegExp(`\\{\\{\\s*${item.key}\\s*\\}\\}`, 'g');
      const htmlMatches = (htmlTemplate.match(regex) || []).length;
      const subjectMatches = (subjectTemplate.match(regex) || []).length;
      return {
        ...item,
        count: htmlMatches + subjectMatches
      };
    });
  }, [htmlTemplate, subjectTemplate]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = SAMPLE_CLIENT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setVariables({ ...found.variables });
      setActiveSegmentId(found.recommendedSegment);
      setStatusBanner({
        type: 'info',
        message: `Loaded sample preview context for ${found.variables.userName} (${found.variables.companyName}) aligned with ${DEFAULT_SUPPLIER_SEGMENT_BRANDING[found.recommendedSegment].segmentName}.`
      });
    }
  };

  const handleInsertPlaceholder = (token: string) => {
    if (lastFocusedField === 'SUBJECT' && subjectInputRef.current) {
      const input = subjectInputRef.current;
      const start = input.selectionStart ?? subjectTemplate.length;
      const end = input.selectionEnd ?? subjectTemplate.length;
      const updated = subjectTemplate.slice(0, start) + token + subjectTemplate.slice(end);
      setSubjectTemplate(updated);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    } else if (htmlTextareaRef.current) {
      const textarea = htmlTextareaRef.current;
      const start = textarea.selectionStart ?? htmlTemplate.length;
      const end = textarea.selectionEnd ?? htmlTemplate.length;
      const updated = htmlTemplate.slice(0, start) + token + htmlTemplate.slice(end);
      setHtmlTemplate(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    } else {
      setHtmlTemplate((prev) => `${prev}\n${token}`);
    }

    navigator.clipboard?.writeText(token).catch(() => {});
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  const handleInsertHtmlSnippet = (
    snippetType: 'OFFER_BOX' | 'CTA_BUTTON' | 'SUMMARY_ROW' | 'HEADER_IMG_TAG' | 'FOOTER_IMG_TAG'
  ) => {
    const snippets: Record<typeof snippetType, string> = {
      OFFER_BOX: `\n<!-- Automated Offer Highlight Block -->\n<div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px 20px; margin: 18px 0;">\n  <div style="font-size: 12px; font-weight: 900; color: #92400e; text-transform: uppercase;">🎁 Exclusive Renewal Offer for {{userName}}</div>\n  <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 4px;">{{planName}}: <span style="color: #059669;">{{offerPrice}} USD/yr ({{discountPercent}})</span></div>\n  <div style="font-size: 13px; color: #475569; margin-top: 4px;">{{offerDetails}}</div>\n</div>\n`,
      CTA_BUTTON: `\n<!-- Renew Now Checkout Trigger Button -->\n<div style="text-align: center; margin: 24px 0;">\n  <a href="{{ctaUrl}}" data-renewal-trigger="true" style="display: inline-block; background: #059669; color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 14px 38px; border-radius: 10px;">\n    {{ctaText}} — {{planName}} ({{offerPrice}})\n  </a>\n</div>\n`,
      SUMMARY_ROW: `\n<p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>{{userName}}</strong>, your <strong>{{planName}}</strong> membership for <strong>{{companyName}}</strong> ({{supplierSegment}}) includes: <strong>{{offerDetails}}</strong>.</p>\n`,
      HEADER_IMG_TAG: `\n<!-- Custom Segment Header Image -->\n<div style="width: 100%; overflow: hidden;">\n  <img src="{{headerImageUrl}}" alt="{{supplierSegment}} Header" style="width: 100%; height: 150px; object-fit: cover; display: block;" />\n</div>\n`,
      FOOTER_IMG_TAG: `\n<!-- Custom Segment Footer Image -->\n<div style="width: 100%; overflow: hidden; margin-top: 16px;">\n  <img src="{{footerImageUrl}}" alt="{{supplierSegment}} Footer" style="width: 100%; height: 110px; object-fit: cover; display: block;" />\n</div>\n`
    };
    handleInsertPlaceholder(snippets[snippetType]);
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    setStatusBanner(null);
    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY_HTML, htmlTemplate);
      localStorage.setItem(STORAGE_KEY_SUBJECT, subjectTemplate);
      localStorage.setItem(STORAGE_KEY_SEGMENT_BRANDING, JSON.stringify(segmentBrandingMap));
      localStorage.setItem(STORAGE_KEY_ACTIVE_SEGMENT, activeSegmentId);
    } catch {
      // ignore storage quota errors
    }

    try {
      const res = await fetch('/api/v1/admin/renewal-offer-template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectTemplate,
          htmlTemplate,
          defaultVariables: variables,
          activeSegmentId,
          segmentBranding: segmentBrandingMap
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLastSavedAt(data?.template?.updatedAt || nowIso);
      } else {
        setLastSavedAt(nowIso);
      }
      setStatusBanner({
        type: 'success',
        message: `Saved Renewal Offer HTML template and custom header/footer branding for ${activeSegmentBranding.segmentName}.`
      });
    } catch {
      setLastSavedAt(nowIso);
      setStatusBanner({
        type: 'success',
        message: 'Saved Renewal Offer HTML template and segment branding to local admin storage.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    setSubjectTemplate(DEFAULT_RENEWAL_SUBJECT_TEMPLATE);
    setHtmlTemplate(DEFAULT_RENEWAL_HTML_TEMPLATE);
    setSegmentBrandingMap(DEFAULT_SUPPLIER_SEGMENT_BRANDING);
    try {
      localStorage.removeItem(STORAGE_KEY_HTML);
      localStorage.removeItem(STORAGE_KEY_SUBJECT);
      localStorage.removeItem(STORAGE_KEY_SEGMENT_BRANDING);
    } catch {
      // ignore
    }
    setStatusBanner({
      type: 'info',
      message: 'Restored default Automated Renewal Offer HTML template and supplier segment header/footer images.'
    });
  };

  const handleTriggerRenewalPaymentPreview = () => {
    const checkoutPayload: PaymentCheckoutData = {
      planId: variables.planId || 'basic-business-plan',
      planName: `${variables.planName} Renewal (${variables.companyName} — ${variables.discountPercent})`,
      amount: numericOfferAmount,
      currency: 'USD',
      billingCycle: 'ANNUAL',
      clientEmail: variables.email,
      billingName: variables.companyName,
      address: variables.address,
      decisionMakerName: variables.decisionMakerName || variables.userName,
      preferredPaymentMethod: variables.paymentMethod
    };

    if (onOpenPaymentCheckout) {
      onOpenPaymentCheckout(checkoutPayload);
    } else {
      window.dispatchEvent(
        new CustomEvent('tradeheaven_open_payment_checkout', {
          detail: checkoutPayload
        })
      );
    }
  };

  const handlePreviewContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      const isRenewalTrigger =
        anchor.getAttribute('data-renewal-trigger') === 'true' ||
        href.includes('action=renew-membership') ||
        href.includes('{{ctaUrl}}') ||
        (anchor.textContent || '').toLowerCase().includes('renew');

      if (isRenewalTrigger) {
        e.preventDefault();
        handleTriggerRenewalPaymentPreview();
      }
    }
  };

  const handleDispatchLiveRenewalEmail = async () => {
    if (!variables.email.trim()) {
      setStatusBanner({
        type: 'error',
        message: 'Please enter a valid recipient email address in the Dynamic Placeholder Variables panel.'
      });
      return;
    }

    setIsDispatching(true);
    setStatusBanner(null);

    const finalSubject = interpolateRenewalTemplate(subjectTemplate, fullVariables, false);
    const interpolatedHtml = interpolateRenewalTemplate(htmlTemplate, fullVariables, false);
    const finalHtml = applyHeaderAndFooterBrandingToHtml(
      interpolatedHtml,
      activeSegmentBranding,
      false
    );

    try {
      const response = await fetch('/api/v1/admin/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: variables.email.trim(),
          recipientName: variables.userName.trim(),
          decisionMakerName: (variables.decisionMakerName || variables.userName).trim(),
          companyName: variables.companyName.trim(),
          address: variables.address.trim(),
          paymentMethod: variables.paymentMethod.trim(),
          subject: finalSubject,
          badgeLabel: `TRADE HEAVEN • ${activeSegmentBranding.segmentName.toUpperCase()}`,
          headline: `${variables.planName} Renewal & Exclusive Trade Offer`,
          subheadline: `Prepared for ${variables.userName} at ${variables.companyName}`,
          introMessage: `Dear ${variables.userName},\n\nYour ${variables.planName} membership for ${variables.companyName} (${activeSegmentBranding.segmentName}) is eligible for renewal under our current offer: ${variables.offerDetails} (${variables.offerPrice} USD/yr).`,
          isMembershipRenewal: true,
          renewalPlanId: variables.planId,
          renewalAmountUsd: numericOfferAmount,
          ctaText: variables.ctaText || 'Renew Now',
          ctaUrl: computedCtaUrl,
          rawHtmlOverride: finalHtml,
          sendAdminCopy,
          adminCopyEmail: adminCopyEmail.trim() || 'yr943334@gmail.com',
          dispatchType: 'AUTOMATED'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            `Renewal Offer email (with ${activeSegmentBranding.segmentName} header/footer branding) dispatched to ${variables.email}${
              sendAdminCopy ? ` + Admin Copy sent to ${adminCopyEmail}` : ''
            }.`
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data.message || 'Failed to dispatch Renewal Offer email.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: `Network error while dispatching Renewal Offer email: ${err?.message || 'Unknown error'}`
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div id="renewal-offer-email-html-manager" className="space-y-6">
      {/* TOP HEADER BANNER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-widest">
              <Code2 className="w-3.5 h-3.5" />
              <span>Automated Email HTML Studio &amp; Segment Brand Alignment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              &lsquo;Renewal Offer&rsquo; HTML Editor, Segment Header/Footer Branding &amp; Live Preview
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Customize the raw HTML layout, upload custom <strong>Header &amp; Footer images</strong> aligned with specific supplier segments, and inject dynamic placeholders for user names (<code className="text-amber-300 font-mono">{'{{userName}}'}</code>), plan names (<code className="text-emerald-300 font-mono">{'{{planName}}'}</code>), and offer details (<code className="text-sky-300 font-mono">{'{{offerDetails}}'}</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Restore default Renewal Offer HTML template and segment images"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Template &amp; Branding</span>
            </button>

            <button
              type="button"
              onClick={handleDispatchLiveRenewalEmail}
              disabled={isDispatching}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Dispatch Live Renewal Email</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            Active Supplier Segment:{' '}
            <strong className="text-amber-300">{activeSegmentBranding.segmentName}</strong>
            {lastSavedAt ? ` • Last Saved: ${new Date(lastSavedAt).toLocaleTimeString()}` : ''}
          </span>
          <span>
            Active Target: <strong className="text-emerald-400">{variables.userName} ({variables.email})</strong> • Plan:{' '}
            <strong className="text-amber-300">{variables.planName} ({variables.offerPrice}/yr)</strong>
          </span>
        </div>
      </div>

      {/* STATUS FEEDBACK BANNER */}
      {statusBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-[11px] font-black underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SUPPLIER SEGMENT BRAND ALIGNMENT: CUSTOM HEADER & FOOTER IMAGE UPLOAD STUDIO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600">
              <Layers className="w-4 h-4" />
              <span>Supplier Segment Brand Alignment Studio</span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              Custom Header &amp; Footer Email Banners by Supplier Segment
            </h3>
            <p className="text-xs text-slate-500">
              Select a target supplier industry segment below and upload custom header/footer banner images (PNG, JPG, WEBP, SVG) or paste an image URL to align renewal emails with segment branding.
            </p>
          </div>

          {/* SUPPLIER SEGMENT PILL SELECTOR */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(DEFAULT_SUPPLIER_SEGMENT_BRANDING) as SupplierSegmentId[]).map((segId) => {
              const seg = segmentBrandingMap[segId] || DEFAULT_SUPPLIER_SEGMENT_BRANDING[segId];
              const isSelected = activeSegmentId === segId;
              return (
                <button
                  key={segId}
                  type="button"
                  onClick={() => setActiveSegmentId(segId)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {seg.segmentName}
                </button>
              );
            })}
          </div>
        </div>

        {/* HEADER & FOOTER UPLOAD CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. CUSTOM HEADER BANNER UPLOAD CARD */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Custom Email Header Image ({activeSegmentBranding.segmentName})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Token: <code className="text-blue-700 font-bold">{'{{headerImageUrl}}'}</code>
                  </span>
                </div>
              </div>

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSegmentBranding.showHeaderImage}
                  onChange={(e) =>
                    updateActiveSegmentBranding({ showHeaderImage: e.target.checked })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Enable Header</span>
              </label>
            </div>

            {/* LIVE THUMBNAIL PREVIEW */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 flex items-center justify-center">
              {activeSegmentBranding.headerImageUrl ? (
                <>
                  <img
                    src={activeSegmentBranding.headerImageUrl}
                    alt={activeSegmentBranding.headerAltText}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-3 py-1.5 flex items-center justify-between text-[10px] text-white">
                    <span className="font-bold truncate">{activeSegmentBranding.headerAltText}</span>
                    <span className="text-amber-300 font-mono shrink-0 ml-2">640×155px Banner</span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">
                  No header banner image configured
                </span>
              )}
            </div>

            {/* UPLOAD BUTTON & URL INPUT */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                ref={headerFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handleUploadBrandAsset('header', e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingHeader}
                onClick={() => headerFileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-black flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all"
              >
                {isUploadingHeader ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload Header Image</span>
              </button>

              <input
                type="text"
                value={activeSegmentBranding.headerImageUrl}
                onChange={(e) =>
                  updateActiveSegmentBranding({
                    headerImageUrl: e.target.value,
                    showHeaderImage: true
                  })
                }
                placeholder="Or paste custom Header Image URL (https://...)"
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {activeSegmentBranding.headerImageUrl && (
                <button
                  type="button"
                  onClick={() =>
                    updateActiveSegmentBranding({
                      headerImageUrl: '',
                      showHeaderImage: false
                    })
                  }
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                  title="Remove Header Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">
                Header Tagline:
              </span>
              <input
                type="text"
                value={activeSegmentBranding.tagline}
                onChange={(e) => updateActiveSegmentBranding({ tagline: e.target.value })}
                className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* 2. CUSTOM FOOTER BANNER UPLOAD CARD */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-600 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Custom Email Footer Image ({activeSegmentBranding.segmentName})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Token: <code className="text-emerald-700 font-bold">{'{{footerImageUrl}}'}</code>
                  </span>
                </div>
              </div>

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSegmentBranding.showFooterImage}
                  onChange={(e) =>
                    updateActiveSegmentBranding({ showFooterImage: e.target.checked })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Enable Footer</span>
              </label>
            </div>

            {/* LIVE THUMBNAIL PREVIEW */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 flex items-center justify-center">
              {activeSegmentBranding.footerImageUrl ? (
                <>
                  <img
                    src={activeSegmentBranding.footerImageUrl}
                    alt={activeSegmentBranding.footerAltText}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-3 py-1.5 flex items-center justify-between text-[10px] text-white">
                    <span className="font-bold truncate">{activeSegmentBranding.footerAltText}</span>
                    <span className="text-emerald-300 font-mono shrink-0 ml-2">640×110px Footer</span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">
                  No footer banner image configured
                </span>
              )}
            </div>

            {/* UPLOAD BUTTON & URL INPUT */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                ref={footerFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handleUploadBrandAsset('footer', e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingFooter}
                onClick={() => footerFileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-black flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all"
              >
                {isUploadingFooter ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload Footer Image</span>
              </button>

              <input
                type="text"
                value={activeSegmentBranding.footerImageUrl}
                onChange={(e) =>
                  updateActiveSegmentBranding({
                    footerImageUrl: e.target.value,
                    showFooterImage: true
                  })
                }
                placeholder="Or paste custom Footer Image URL (https://...)"
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {activeSegmentBranding.footerImageUrl && (
                <button
                  type="button"
                  onClick={() =>
                    updateActiveSegmentBranding({
                      footerImageUrl: '',
                      showFooterImage: false
                    })
                  }
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                  title="Remove Footer Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">
                Footer Alt Text:
              </span>
              <input
                type="text"
                value={activeSegmentBranding.footerAltText}
                onChange={(e) => updateActiveSegmentBranding({ footerAltText: e.target.value })}
                className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC PLACEHOLDER PALETTE & SAMPLE CONTEXT CONTROLS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: CLICK-TO-INSERT DYNAMIC PLACEHOLDERS */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  Dynamic Placeholders (Click to Insert into{' '}
                  {lastFocusedField === 'SUBJECT' ? 'Subject' : 'HTML Editor'})
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any token chip below to insert it at your active cursor position and copy it to your clipboard.
              </p>
            </div>
            {copiedToken && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Inserted {copiedToken}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {placeholderUsageStats.map((item) => {
              const catBadgeColor =
                item.category === 'USER'
                  ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                  : item.category === 'PLAN'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : item.category === 'OFFER'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : item.category === 'BRANDING'
                  ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100';

              return (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => handleInsertPlaceholder(item.token)}
                  title={`${item.description} (Current value: ${fullVariables[item.key]})`}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${catBadgeColor}`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <span className="font-mono text-xs font-black tracking-tight">{item.token}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        item.count > 0 ? 'bg-white/90 text-slate-800' : 'bg-slate-200/70 text-slate-500'
                      }`}
                    >
                      {item.count}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-[10px] opacity-85 truncate w-full">
                    <span className="font-bold truncate">{item.label}</span>
                    <Plus className="w-3 h-3 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* QUICK HTML BLOCK SNIPPETS */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500">Quick Insert HTML Components:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInsertHtmlSnippet('HEADER_IMG_TAG')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold cursor-pointer transition-all"
              >
                + Header Image Tag
              </button>
              <button
                type="button"
                onClick={() => handleInsertHtmlSnippet('FOOTER_IMG_TAG')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-bold cursor-pointer transition-all"
              >
                + Footer Image Tag
              </button>
              <button
                type="button"
                onClick={() => handleInsertHtmlSnippet('OFFER_BOX')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold cursor-pointer transition-all"
              >
                + Offer Highlight Box
              </button>
              <button
                type="button"
                onClick={() => handleInsertHtmlSnippet('CTA_BUTTON')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold cursor-pointer transition-all"
              >
                + &ldquo;Renew Now&rdquo; CTA Button
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: LIVE VARIABLE VALUES FOR PREVIEW & TEST DISPATCH */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Placeholder Preview Values &amp; Recipient Context</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Edit user name, plan name, or offer details below to test real-time interpolation.
              </p>
            </div>

            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              aria-label="Select Sample Client Preset"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SAMPLE_CLIENT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                User Name (<code className="text-violet-600">{'{{userName}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.userName}
                onChange={(e) =>
                  setVariables((prev) => ({
                    ...prev,
                    userName: e.target.value,
                    decisionMakerName: e.target.value
                  }))
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Plan Name (<code className="text-emerald-600">{'{{planName}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.planName}
                onChange={(e) => setVariables((prev) => ({ ...prev, planName: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Offer Details (<code className="text-amber-600">{'{{offerDetails}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.offerDetails}
                onChange={(e) => setVariables((prev) => ({ ...prev, offerDetails: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Offer Price (<code className="text-amber-600">{'{{offerPrice}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.offerPrice}
                onChange={(e) => setVariables((prev) => ({ ...prev, offerPrice: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Discount &amp; Code (<code className="text-amber-600">{'{{discountPercent}}'}</code>)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={variables.discountPercent}
                  onChange={(e) => setVariables((prev) => ({ ...prev, discountPercent: e.target.value }))}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                  placeholder="10% OFF"
                />
                <input
                  type="text"
                  value={variables.promoCode}
                  onChange={(e) => setVariables((prev) => ({ ...prev, promoCode: e.target.value }))}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-amber-800 bg-amber-50/50"
                  placeholder="DIWALI10"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Company Name (<code className="text-sky-600">{'{{companyName}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.companyName}
                onChange={(e) => setVariables((prev) => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Recipient Email (<code className="text-sky-600">{'{{email}}'}</code>)
              </label>
              <input
                type="email"
                value={variables.email}
                onChange={(e) => setVariables((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Billing Address (<code className="text-sky-600">{'{{address}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.address}
                onChange={(e) => setVariables((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Payment Method (<code className="text-sky-600">{'{{paymentMethod}}'}</code>)
              </label>
              <input
                type="text"
                value={variables.paymentMethod}
                onChange={(e) => setVariables((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ADMIN COPY OPTION */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sendAdminCopy}
                onChange={(e) => setSendAdminCopy(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Send copy to Admin on dispatch:</span>
            </label>
            <input
              type="email"
              value={adminCopyEmail}
              onChange={(e) => setAdminCopyEmail(e.target.value)}
              disabled={!sendAdminCopy}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-700 disabled:opacity-50"
              placeholder="yr943334@gmail.com"
            />
          </div>
        </div>
      </div>

      {/* SUBJECT LINE TEMPLATE BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Automated Renewal Email Subject Line Template</span>
          </label>
          <span className="text-[11px] text-slate-500">
            Supports <code className="font-mono text-violet-700">{'{{userName}}'}</code>, <code className="font-mono text-emerald-700">{'{{planName}}'}</code>, <code className="font-mono text-amber-700">{'{{offerPrice}}'}</code>, <code className="font-mono text-sky-700">{'{{companyName}}'}</code>
          </span>
        </div>
        <input
          ref={subjectInputRef}
          type="text"
          value={subjectTemplate}
          onFocus={() => setLastFocusedField('SUBJECT')}
          onChange={(e) => setSubjectTemplate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-amber-200 font-mono text-xs sm:text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center gap-2">
          <span className="font-black text-slate-500 uppercase text-[10px] tracking-wider">Resolved Subject:</span>
          <span className="font-bold text-slate-900">{resolvedSubject}</span>
        </div>
      </div>

      {/* WORKSPACE VIEW MODE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveWorkspaceView('SPLIT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeWorkspaceView === 'SPLIT'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Split Editor &amp; Live Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspaceView('CODE_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeWorkspaceView === 'CODE_ONLY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML Source Only</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspaceView('PREVIEW_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeWorkspaceView === 'PREVIEW_ONLY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Preview Only</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* RESOLVED VS RAW PLACEHOLDERS TOGGLE */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewMode('RESOLVED')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                previewMode === 'RESOLVED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved Values
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('RAW_TOKENS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all ${
                previewMode === 'RAW_TOKENS'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {'Raw {{Placeholders}}'}
            </button>
          </div>

          {/* DESKTOP VS MOBILE VIEWPORT TOGGLE */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewportSize('DESKTOP')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewportSize === 'DESKTOP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportSize('MOBILE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewportSize === 'MOBILE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleTriggerRenewalPaymentPreview}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test &ldquo;Renew Now&rdquo; Checkout</span>
          </button>
        </div>
      </div>

      {/* MAIN SPLIT EDITOR & LIVE RENDERED PREVIEW */}
      <div
        className={`grid gap-6 ${
          activeWorkspaceView === 'SPLIT' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
        }`}
      >
        {/* HTML CODE EDITOR PANE */}
        {(activeWorkspaceView === 'SPLIT' || activeWorkspaceView === 'CODE_ONLY') && (
          <div
            className={`${
              activeWorkspaceView === 'SPLIT' ? 'lg:col-span-6' : 'col-span-1'
            } bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col`}
          >
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono font-bold text-slate-200">
                  renewal-offer-email.html
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {htmlTemplate.split('\n').length} lines • {htmlTemplate.length.toLocaleString()} chars
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(resolvedHtml);
                    setStatusBanner({
                      type: 'info',
                      message: 'Copied resolved HTML email code (including segment header/footer) to clipboard.'
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy HTML</span>
                </button>
              </div>
            </div>

            <textarea
              ref={htmlTextareaRef}
              value={htmlTemplate}
              onFocus={() => setLastFocusedField('HTML')}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              spellCheck={false}
              rows={28}
              aria-label="Renewal Offer HTML Template Editor"
              className="w-full flex-1 p-4 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-blue-600 selection:text-white"
            />

            <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>
                Header/Footer Branding: {activeSegmentBranding.showHeaderImage ? 'Header ON' : 'Header OFF'} •{' '}
                {activeSegmentBranding.showFooterImage ? 'Footer ON' : 'Footer OFF'}
              </span>
              <span className="text-emerald-400 font-semibold">
                Live Sync Active → Preview updates instantaneously
              </span>
            </div>
          </div>
        )}

        {/* LIVE HTML EMAIL RENDERED PREVIEW PANE */}
        {(activeWorkspaceView === 'SPLIT' || activeWorkspaceView === 'PREVIEW_ONLY') && (
          <div
            className={`${
              activeWorkspaceView === 'SPLIT' ? 'lg:col-span-6' : 'col-span-1'
            } bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col`}
          >
            {/* EMAIL CLIENT HEADER SIMULATION */}
            <div className="px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Live Rendered HTML Preview ({activeSegmentBranding.segmentName})
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                  {viewportSize === 'MOBILE' ? '375px Mobile Viewport' : '640px Desktop Client'}
                </span>
              </div>

              <div className="bg-slate-800/90 rounded-xl p-2.5 text-[11px] space-y-1 border border-slate-700/80">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 font-semibold w-14 shrink-0">From:</span>
                  <span className="text-slate-200 font-mono truncate">
                    &ldquo;Trade Heaven Global B2B&rdquo; &lt;noreply@tradeheaven.net&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 font-semibold w-14 shrink-0">To:</span>
                  <span className="text-emerald-300 font-mono font-bold truncate">
                    {variables.userName} &lt;{variables.email}&gt;
                  </span>
                  {sendAdminCopy && (
                    <span className="ml-auto px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold shrink-0">
                      + Admin Copy ({adminCopyEmail})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 font-semibold w-14 shrink-0">Subject:</span>
                  <span className="text-white font-bold truncate">{resolvedSubject}</span>
                </div>
              </div>
            </div>

            {/* RENDERED HTML CANVAS */}
            <div
              onClick={handlePreviewContainerClick}
              className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto max-h-[760px] flex justify-center"
            >
              <div
                className={`w-full transition-all duration-200 ${
                  viewportSize === 'MOBILE' ? 'max-w-[375px]' : 'max-w-[640px]'
                }`}
                dangerouslySetInnerHTML={{ __html: resolvedHtml }}
              />
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <span>
                Clicking <strong>&ldquo;{variables.ctaText || 'Renew Now'}&rdquo;</strong> inside the preview opens the live Payment Checkout Modal pre-filled for <strong>{variables.companyName}</strong>.
              </span>
              <button
                type="button"
                onClick={handleTriggerRenewalPaymentPreview}
                className="text-emerald-700 hover:text-emerald-800 font-black underline cursor-pointer"
              >
                Open Checkout Modal →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RenewalOfferEmailHtmlManager;
