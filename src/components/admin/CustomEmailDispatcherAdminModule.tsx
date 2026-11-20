import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Key, 
  ExternalLink, 
  Copy, 
  Eye, 
  Edit3, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  User, 
  Phone, 
  Globe, 
  Briefcase,
  Layers,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  PanelRightOpen,
  PanelRightClose,
  X,
  CheckCheck,
  Check,
  MousePointerClick,
  Activity
} from 'lucide-react';
import type {
  CustomAdminInquiryItem,
  CustomAdminEmailPayload,
  MailSuiteAnalyticsSummary,
  CompanyEmailHistoryEntry
} from '../../services/smtpService';
import { CompanyEmailHistorySection } from './CompanyEmailHistorySection';

const MEMBERSHIP_RENEWAL_DEFAULTS = {
  companyName: 'ACE Intermediary',
  address: '1241 Hackberry Avenue Corsicana Texas 75110',
  email: 'ezekiahali355@gmail.com',
  decisionMakerName: 'Ali Charley Ezekiah',
  paymentMethod: 'Debit Card'
};

type BuiltinSectionKey =
  | 'headerBanner'
  | 'greetingIntro'
  | 'billingSummary'
  | 'credentialsBox'
  | 'loginGuide'
  | 'inquiries'
  | 'ctaButton'
  | 'closingNote'
  | 'escrowBadge'
  | 'footer';

interface CustomEmailSectionBlock {
  id: string;
  title: string;
  badge: string;
  body: string;
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

const BUILTIN_SECTION_LABELS: Record<BuiltinSectionKey, string> = {
  headerBanner: 'Header Banner',
  greetingIntro: 'Greeting & Message Body',
  billingSummary: 'Membership & Billing Box',
  credentialsBox: 'Portal Credentials Box',
  loginGuide: '3-Step Login Guide',
  inquiries: 'Active Inquiries / Tenders',
  ctaButton: 'Call-to-Action Button',
  closingNote: 'Custom Closing Note',
  escrowBadge: 'Escrow Protection Notice',
  footer: 'Email Footer'
};

function escapeEmailHtml(val: string): string {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEmailMultilineHtml(val: string): string {
  return escapeEmailHtml(val).replace(/\n/g, '<br/>');
}

interface DispatchedHistoryItem {
  id: string;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  subject: string;
  templatePreset: string;
  messageId?: string;
  trackingId?: string;
  dispatchedAt: string;
  success: boolean;
  deliveryMode?: string;
  error?: string;
}

interface CustomEmailDispatcherProps {
  onOpenPaymentCheckout?: (data: any) => void;
}

const PRESET_TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  data: CustomAdminEmailPayload;
  defaultCustomSections?: CustomEmailSectionBlock[];
}> = [
  {
    id: 'GLOBAL_AD_CAMPAIGN_VISIBILITY_REPORT',
    name: '🌍 Global Ad Campaign Report — Country Clicks, Procedure/Price/Payment Inquiries & Visibility Growth',
    description: 'Ready-to-send client ad performance report showing buyers by country & region who clicked ads, requested procedure, pricing & payment terms, and rising product visibility.',
    data: {
      recipientName: '{{decisionMakerName}}',
      decisionMakerName: '{{decisionMakerName}}',
      recipientEmail: '{{email}}',
      companyName: '{{companyName}}',
      address: '{{address}}',
      contactPhone: '',
      paymentMethod: 'Active Global Ad Campaign',
      portalUrl: 'https://www.tradeheaven.net',
      subject: '🌍 Global Ad Campaign Report: Rising Product Visibility & Verified Buyer Inquiries (Procedure, Price & Payment Terms) — {{companyName}}',
      badgeLabel: '🌍 GLOBAL AD PERFORMANCE & BUYER INTEREST REPORT',
      headline: 'Your Global Ad Campaign Is Driving Strong Buyer Interest & Higher Visibility',
      subheadline: 'Regional Clicks, Procedure / Price / Payment Term Requests & Storefront Growth Summary for {{companyName}}',
      introMessage:
        'We are pleased to share the latest performance report from your active Global Ad Campaign on Trade Heaven.\n\nFollowing the launch of your promoted listings across international B2B trade corridors, your storefront and product listings are experiencing a steady increase in global visibility, ad clicks, and direct buyer engagement. Buyers from multiple countries and trading hubs have clicked your ads, reviewed your products, and specifically requested your Supply Procedure (SCO/FCO), Unit Pricing (FOB/CIF), and Payment Terms.',
      includeCredentialsBox: false,
      includeLoginGuide: false,
      includeEscrowBadge: true,
      isMembershipRenewal: false,
      inquiriesTitle: 'Sample High-Intent Buyer Inquiries From Your Global Ad Run',
      inquiries: [
        {
          id: 'AD-LEAD-ME-01',
          title: 'Requested Supply Procedure, CIF Price & Payment Terms (SBLC / LC)',
          buyerCompany: 'Verified Importer — Middle East & UAE (Dubai / Jebel Ali)',
          buyerCountry: 'United Arab Emirates',
          quantity: 'Trial + Monthly Contract Volume',
          estimatedValue: 'High-Intent Corporate Buyer',
          incotermPort: 'CIF Jebel Ali / Fujairah',
          paymentTerms: 'Requested Procedure, Unit Price & LC / Escrow Terms',
          urgency: 'HIGH'
        },
        {
          id: 'AD-LEAD-EU-02',
          title: 'Clicked Product Ad & Requested Formal Quotation + Delivery Procedure',
          buyerCompany: 'Verified Trading Desk — Europe & UK (Rotterdam / London)',
          buyerCountry: 'Netherlands / UK',
          quantity: 'Bulk Commercial Order',
          estimatedValue: 'Verified B2B Buyer',
          incotermPort: 'CIF Rotterdam / Antwerp',
          paymentTerms: 'Requested Pricing Sheet & Payment Procedure',
          urgency: 'HIGH'
        },
        {
          id: 'AD-LEAD-APAC-03',
          title: 'Product Interest & Direct Inquiry on Pricing, MOQ & Payment Terms',
          buyerCompany: 'Industrial Procurement Group — Asia-Pacific (Singapore / India)',
          buyerCountry: 'Singapore / India',
          quantity: 'Recurring Quarterly Supply',
          estimatedValue: 'Active Sourcing Mandate',
          incotermPort: 'CIF Singapore / Nhava Sheva',
          paymentTerms: 'Requested SCO, Pricing & DLC / TT Terms',
          urgency: 'HIGH'
        }
      ],
      customClosingNote:
        'Next Step: Please reply to this email or log in to your Trade Heaven dashboard with your latest Procedure, Pricing (FOB/CIF), and acceptable Payment Terms so we can respond immediately to these interested buyers and keep your ad momentum growing.',
      ctaText: 'View Buyer Inquiries & Ad Insights on Trade Heaven →',
      ctaUrl: 'https://www.tradeheaven.net'
    },
    defaultCustomSections: [
      {
        id: 'ad-report-country-breakdown',
        title: '1. Global Reach & Interested Buyers by Country / Region',
        badge: 'WORLDWIDE AD CLICKS',
        tone: 'info',
        body:
          '• Middle East (UAE, Saudi Arabia, Qatar, Oman): 142 Ad Clicks | 18 Buyers Showed Direct Product Interest\n' +
          '• Europe & UK (Netherlands, Germany, UK, Italy, Spain): 118 Ad Clicks | 15 Buyers Showed Direct Product Interest\n' +
          '• North America (USA — Texas, New York, California; Canada): 96 Ad Clicks | 12 Buyers Showed Direct Product Interest\n' +
          '• Asia-Pacific (Singapore, India, China, Australia, Malaysia): 134 Ad Clicks | 16 Buyers Showed Direct Product Interest\n' +
          '• Africa & Latin America (South Africa, Nigeria, Brazil, Kenya): 64 Ad Clicks | 9 Buyers Showed Direct Product Interest\n\n' +
          'Total Worldwide Engagement: 554 Targeted Ad Clicks | 70 Qualified Buyers Expressed Interest Across 5 Global Regions.'
      },
      {
        id: 'ad-report-inquiry-topics',
        title: '2. What Buyers Asked About Your Products',
        badge: 'HIGH BUYER INTENT',
        tone: 'warning',
        body:
          '• Supply & Transaction Procedure (SCO / FCO / Inspection Steps): 29 Buyers Requested Procedure\n' +
          '• Product Pricing & Volume Discounts (FOB / CIF Rates): 41 Buyers Requested Pricing\n' +
          '• Payment Terms & Instruments (LC, DLC, SBLC, TT, Escrow): 24 Buyers Asked for Payment Terms\n' +
          '• Direct Product Interest & Specification Requests: 70 Total Buyers Engaged With Your Catalog'
      },
      {
        id: 'ad-report-visibility-growth',
        title: '3. Rising Storefront & Product Visibility After Running Ads',
        badge: 'VISIBILITY UP ↑',
        tone: 'success',
        body:
          '• Global Ad Impressions: +285% Increase Since Campaign Launch (14,800+ Verified B2B Views)\n' +
          '• Storefront & Product Page Visits: +190% Growth Week-over-Week\n' +
          '• Marketplace Search Positioning: Featured in Top Category Results Across Target Importing Countries\n' +
          '• Repeat Buyer Profile Visits: +64% Increase in Returning Procurement Managers Reviewing Your Listings'
      }
    ]
  },
  {
    id: 'MELISSA_VIP_UPGRADE_AGREEMENT',
    name: '💳 Melissa Prezios (melissa@mpcommoditybrokers.com) — VIP Upgrade, Escrow Release & 30-Day Agreement',
    description: 'Clarification on VIP Upgrade ($5,000 discounted from $6,100), $50,000 USD escrow commission release, and 30-day service judgement agreement.',
    data: {
      recipientName: 'Melissa',
      decisionMakerName: 'Melissa',
      recipientEmail: 'melissa@mpcommoditybrokers.com',
      companyName: 'MP Commodity Brokers Australia Pty Ltd',
      address: 'Sydney, Australia',
      contactPhone: '+61411510887',
      paymentMethod: 'Trade Heaven Escrow Vault (TH-VAULT-AU-61648)',
      portalUrl: 'https://www.tradeheaven.net/?view=VENDOR_PROFILE&supplier=comp-melissa-mpcommodity&action=upgrade_vip',
      subject: 'Clarification on VIP Upgrade, Escrow Release, and 30-Day Service Agreement – Trade Heaven',
      badgeLabel: '💳 VIP UPGRADE & 30-DAY SERVICE AGREEMENT • $50K ESCROW',
      headline: 'Clarification on VIP Upgrade, Escrow Release & 30-Day Service Agreement',
      subheadline: 'Official Support Clarification for Melissa Prezios (MP Commodity Brokers Australia Pty Ltd)',
      introMessage: 'Dear Melissa,\n\nThank you for connecting with the Trade Heaven support desk. We are writing to formally summarize the current status of your account, your pending $50,000 USD commission transaction, and the necessary steps required to unlock full liquidity withdrawals.\n\n1. Account Tier & Withdrawal Status\nAs indicated on your dashboard, your current account is under the Standard / Basic Plan, which maintains locked fund withdrawals for high-volume transactions. To process SWIFT wire releases and escrow liquidity withdrawals, platform compliance strictly requires active VIP Plan status ($6,100/yr standard rate).\n\n2. Special VIP Upgrade & Reduced Fee Structure\nTo assist you with your current deal, we have arranged a special adjusted rate:\n\nInstead of the full standard fee, your upgrade to the VIP Plan is available at a discounted rate of $5,000 USD.\n\nPlease note that per platform escrow security regulations, platform fees cannot be deducted directly from pending escrow funds before account tier verification; the upgrade fee must be settled through standard checkout to transition the profile.\n\n3. The 30-Day Service Judgement Agreement\nTo ensure complete confidence and risk-free transparency, your VIP upgrade will be backed by our 30-Day Service Judgement Period:\n\nEvaluation Window: You will have full, unrestricted access to VIP priority matching, dedicated account management, and instant withdrawal routing for 30 days.\n\nFlexibility Guarantee: If you determine that the VIP service does not align with your trading volume or expectations during this 30-day window, you retain full evaluation flexibility under Trade Heaven’s partnership terms.\n\nPlease let us know when you are ready to proceed with the secure checkout so we can immediately reactivate your VIP status and ensure your $50,000 USD funds are successfully released to your bank account.',
      includeCredentialsBox: false,
      includeLoginGuide: false,
      includeEscrowBadge: true,
      isMembershipRenewal: true,
      inquiriesTitle: 'VIP Upgrade & Escrow Release Summary ($5,000 USD • $50,000 USD Escrow)',
      customClosingNote: 'Please review and proceed with secure checkout to unlock your $50,000 USD escrow release.',
      ctaText: 'Proceed with Secure VIP Checkout ($5,000 USD) →',
      ctaUrl: 'https://www.tradeheaven.net/?view=VENDOR_PROFILE&supplier=comp-melissa-mpcommodity&action=upgrade_vip'
    }
  },
  {
    id: 'MELISSA_UNCLAIMED_FUNDS_48H_ALERT',
    name: '⏳ Melissa Prezios (melissa@mpcommoditybrokers.com) — Funds >12h in Account (Auto-Reverse in 48h if Unclaimed)',
    description: 'Urgent Treasury Alert to Melissa Prezios (MP Commodity Brokers Australia Pty Ltd): $50,000 USD in account for >12 hours; if unclaimed for 48 hours, clearing gateway will automatically reverse and send funds back.',
    data: {
      recipientName: 'Melissa Prezios',
      decisionMakerName: 'Melissa Prezios',
      recipientEmail: 'melissa@mpcommoditybrokers.com',
      companyName: 'MP Commodity Brokers Australia Pty Ltd',
      address: 'Sydney, Australia',
      contactPhone: '+61411510887',
      paymentMethod: 'SBLC / Trade Heaven Escrow Vault (TH-VAULT-AU-61648)',
      portalUrl: 'https://www.tradeheaven.net/?view=SUPPLIER_DASHBOARD&email=melissa%40mpcommoditybrokers.com',
      subject: '⏳ URGENT TREASURY ALERT: Funds in Account for >12 Hours — Unclaimed Funds Auto-Reversed After 48 Hours (MP Commodity Brokers Australia Pty Ltd)',
      badgeLabel: '⏳ 48-HOUR AUTO-REVERSAL ALERT • UNCLAIMED FUNDS (>12H ACTIVE)',
      headline: 'Funds in Account for >12 Hours — Unclaimed Funds Auto-Reversed After 48 Hours',
      subheadline: 'Urgent Escrow Action Required for Melissa Prezios (MP Commodity Brokers Australia Pty Ltd • Sydney, Australia)',
      introMessage: 'Dear Melissa Prezios,\n\nThis is an urgent notice from the Trade Heaven Custodial Treasury & Escrow Desk regarding the $50,000.00 USD balance currently held in your account for MP Commodity Brokers Australia Pty Ltd.\n\n• Your funds have now remained in your Trade Heaven account for MORE THAN 12 HOURS without a completed withdrawal or claim instruction.\n• CRITICAL 48-HOUR AUTOMATED RETURN POLICY: Under Trade Heaven International Custodial Escrow & Banking Clearing Regulations, if allocated funds remain unclaimed / unwithdrawn for 48 HOURS, the system will automatically cancel the release authorization and SEND THE FUNDS BACK to the originating remitter / bank account.\n• You have approximately 36 HOURS REMAINING to claim your funds before automated reversal.',
      includeCredentialsBox: false,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      isMembershipRenewal: false,
      inquiriesTitle: 'Treasury Escrow Balance & 48-Hour Return Deadline',
      customClosingNote: 'Please claim your funds immediately before the remaining 36-hour window closes to avoid automatic fund rollback.',
      ctaText: 'Claim Your Funds & Open Treasury Payout Desk →',
      ctaUrl: 'https://www.tradeheaven.net/?view=SUPPLIER_DASHBOARD&email=melissa%40mpcommoditybrokers.com',
      inquiries: [
        {
          id: 'MELISSA-FUNDS-01',
          title: 'Treasury Escrow Balance: $50,000.00 USD (Vault: TH-VAULT-AU-61648)',
          buyerCompany: 'Originating Commercial Buyer / Escrow Remitter',
          buyerCountry: 'International Clearing Depository',
          quantity: 'Full Available Balance',
          estimatedValue: '$50,000.00 USD',
          incotermPort: 'Direct Bank Wire Payout / SWIFT',
          paymentTerms: 'Unclaimed (>12 Hours in Account) • 48h Reversal Policy',
          urgency: 'URGENT' as const
        }
      ]
    }
  },
  {
    id: 'BUYER_REQUEST_COUNTER_OFFER_LISTED_CLIENT',
    name: '🔔 Listed Clients Alert — Buyers Made Request to Buy (Log In to Counter Offer)',
    description: 'Notifies listed Trade Heaven clients that buyers have made purchase requests and invites them to log in to submit a Counter Offer.',
    data: {
      recipientName: '{{decisionMakerName}}',
      decisionMakerName: '{{decisionMakerName}}',
      recipientEmail: '{{email}}',
      companyName: '{{companyName}}',
      portalUrl: 'https://www.tradeheaven.net/?view=SUPPLIER_DASHBOARD',
      subject: '🔔 Buyers Have Made Requests to Buy — Log In to Submit Your Counter Offer ({{companyName}})',
      badgeLabel: 'TRADE HEAVEN • BUYER PURCHASE REQUESTS ACTIVE',
      headline: 'Buyers Have Made a Request to Buy — Log In to Counter Offer',
      subheadline: 'Active Buyer Purchase Requests Waiting in Your Trade Heaven Account',
      introMessage: 'Verified institutional buyers on Trade Heaven have made active requests to buy from your listed catalog. Please log in to your Trade Heaven account now to review buyer purchase terms, quantities, and submit your official Counter Offer.',
      includeCredentialsBox: false,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      isMembershipRenewal: false,
      inquiriesTitle: 'Active Buyer Purchase Requests Ready for Counter Offer',
      customClosingNote: 'Log in promptly to review buyer targets and issue your official Proforma Invoice / Counter Offer under Trade Heaven Escrow protection.',
      ctaText: 'Log In to Trade Heaven Account & Counter Offer →',
      ctaUrl: 'https://www.tradeheaven.net/?view=SUPPLIER_DASHBOARD',
      inquiries: []
    }
  },
  {
    id: 'MARK_JOHNSON_15_BUYERS_GENERATORS_CRANES',
    name: '⚡🏗️ Mark Johnson (mjohnson@atlanticpowerequip.com • Atlantic Power & Equipment Co.) — 10 Buyers Inquired for Generators & 5 for Cranes',
    description: 'Official Notification to Mark Johnson (Shore Technical Equipment Inc. / Atlantic Power & Equipment Co., Marmora NJ): 10 Buyers Visited Profile & Inquired to Buy Generators + 5 Buyers Inquired for Cranes',
    data: {
      recipientName: 'Mark Johnson (President)',
      decisionMakerName: 'Mark Johnson (President)',
      recipientEmail: 'mjohnson@atlanticpowerequip.com',
      companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
      address: 'P.O. Box 1176, Marmora, NJ 08223 USA',
      paymentMethod: 'Irrevocable DLC / SBLC / T/T + Trade Heaven Escrow',
      contactPhone: '+1-609-374-5131',
      loginEmail: 'mjohnson@atlanticpowerequip.com',
      loginPassword: 'Mark@2026',
      portalUrl: 'https://www.tradeheaven.net',
      subject: '⚡🏗️ Profile Activity & Inquiry Alert: 10 Buyers Visited Your Profile & Inquired to Buy Generators + 5 Buyers Inquired for Cranes',
      badgeLabel: '⚡🏗️ 15 BUYERS VISITED PROFILE • 10 GENERATOR RFQs + 5 CRANE RFQs',
      headline: '10 Buyers Inquired to Buy Generators & 5 Buyers Inquired for Cranes',
      subheadline: '15 Verified Institutional Buyers Visited Your Atlantic Power & Equipment Co. Profile (Attn: Mark Johnson • Marmora, NJ)',
      introMessage: 'Dear Mark Johnson,\n\nGreat news from the Trade Heaven Heavy Machinery & Power Generation Desk! Over the last 24 hours, 15 verified institutional buyers visited your Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.) supplier profile on Trade Heaven:\n\n• ⚡ 10 Buyers Visited Your Profile & Inquired to Buy Industrial Generators (Caterpillar, Cummins, MTU & Perkins Diesel & Gas Generator Sets from 500 kW to 3,000 kVA)\n• 🏗️ 5 Buyers Visited Your Profile & Inquired to Buy Heavy Cranes (Liebherr 300T All-Terrain, Manitowoc 275T Crawler, Grove 130T Rough-Terrain, Tadano 220T & Terex/Demag 250T Mobile Cranes)\n\nAll 15 visiting buyers are KYC Level 3 & Escrow/L/C verified. Please log in to your Atlantic Power & Equipment Co. Supplier Console to review each buyer\'s specifications and issue your official Proforma Invoices / quotations.',
      includeCredentialsBox: true,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      isMembershipRenewal: false,
      inquiriesTitle: '15 Verified Buyers Who Visited Your Profile (10 Generators + 5 Cranes)',
      customClosingNote: 'All 15 buyer inquiries (10 for Generators and 5 for Cranes) are live in your Atlantic Power & Equipment Co. Supplier Console. Please keep all communications on the official Trade Heaven Negotiation Room.',
      ctaText: 'View All 15 Buyer Visits (10 Generators + 5 Cranes) & Submit Quotes →',
      ctaUrl: 'https://www.tradeheaven.net',
      inquiries: [
        {
          id: 'MJ-GEN-01',
          title: '⚡ [Generator Inquiry #1] 8× 2,000 kW Caterpillar 3516B Containerized Diesel Generators',
          buyerCompany: 'Gulf Data Center Infrastructure LLC',
          buyerCountry: 'Saudi Arabia / UAE',
          quantity: '8 Units (16 MW Total Backup Power)',
          estimatedValue: '$4,960,000 USD',
          incotermPort: 'CIF Jebel Ali / Dammam Port (from Newark, NJ)',
          paymentTerms: 'Irrevocable L/C at Sight / Trade Heaven Escrow',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-GEN-02',
          title: '⚡ [Generator Inquiry #2] 6× 1,500 kW Cummins QSK50 Prime Power Diesel Generators',
          buyerCompany: 'Andes Gold & Copper Mining Corp S.A.',
          buyerCountry: 'Chile / Peru',
          quantity: '6 Units',
          estimatedValue: '$2,850,000 USD',
          incotermPort: 'CIF Port of Callao / San Antonio',
          paymentTerms: '30% T/T Advance + 70% Against B/L & SGS Load Test',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-GEN-03',
          title: '⚡ [Generator Inquiry #3] 12× 1,000 kVA Perkins & Cummins Super-Silent Canopy Generators',
          buyerCompany: 'Lagos Industrial Grid & Power IPP Ltd',
          buyerCountry: 'Nigeria',
          quantity: '12 Units',
          estimatedValue: '$2,160,000 USD',
          incotermPort: 'CIF Apapa Port, Lagos',
          paymentTerms: 'Confirmed Irrevocable DLC / Trade Heaven Escrow',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-GEN-04',
          title: '⚡ [Generator Inquiry #4] 4× 2,500 kW Caterpillar G3520C Natural Gas Generator Sets',
          buyerCompany: 'TexMex Petrochemical & Midstream Energy LP',
          buyerCountry: 'United States / Mexico',
          quantity: '4 Units',
          estimatedValue: '$3,400,000 USD',
          incotermPort: 'EXW Marmora, NJ / DDP Monterrey, Mexico',
          paymentTerms: 'Trade Heaven Escrow / Domestic Wire upon Inspection',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-GEN-05',
          title: '⚡ [Generator Inquiry #5] 10× 750 kW MTU 16V2000 Hospital Standby Diesel Generators + ATS',
          buyerCompany: 'EuroMed Hospital & Healthcare Engineering GmbH',
          buyerCountry: 'Germany / Poland',
          quantity: '10 Units',
          estimatedValue: '$1,950,000 USD',
          incotermPort: 'CIF Port of Hamburg / Bremerhaven',
          paymentTerms: 'Irrevocable L/C at Sight',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-GEN-06',
          title: '⚡ [Generator Inquiry #6] 15× 500 kW Caterpillar C15 Trailer-Mounted Mobile Generators',
          buyerCompany: 'Caribbean Resort & Island Utility Power Corp',
          buyerCountry: 'Jamaica / Bahamas',
          quantity: '15 Units',
          estimatedValue: '$2,175,000 USD',
          incotermPort: 'CIF Kingston / Nassau Port',
          paymentTerms: 'Trade Heaven Escrow / 40% T/T + 60% Prior to Shipment',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-GEN-07',
          title: '⚡ [Generator Inquiry #7] 14× 600 kW Cummins KTA38-G5 Enclosed Diesel Generator Sets',
          buyerCompany: 'Manila Telecom Tower & Infrastructure Inc.',
          buyerCountry: 'Philippines',
          quantity: '14 Units',
          estimatedValue: '$1,890,000 USD',
          incotermPort: 'CIF Port of Manila',
          paymentTerms: 'Irrevocable L/C at Sight / SBLC',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-GEN-08',
          title: '⚡ [Generator Inquiry #8] 6× 1,250 kW Caterpillar 3512C Heavy Mining Skid Generators',
          buyerCompany: 'Queensland Mining & Remote Camp Services Pty Ltd',
          buyerCountry: 'Australia',
          quantity: '6 Units',
          estimatedValue: '$2,340,000 USD',
          incotermPort: 'CIF Port of Brisbane, Australia',
          paymentTerms: 'Trade Heaven Escrow / DLC at Sight',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-GEN-09',
          title: '⚡ [Generator Inquiry #9] 8× 800 kW / 1,000 kVA Perkins 4008TAG2A Reefer Power Generators',
          buyerCompany: 'East Africa Port & Cold Chain Logistics Ltd',
          buyerCountry: 'Kenya / Tanzania',
          quantity: '8 Units',
          estimatedValue: '$1,480,000 USD',
          incotermPort: 'CIF Port of Mombasa, Kenya',
          paymentTerms: 'Confirmed L/C / Trade Heaven Escrow',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-GEN-10',
          title: '⚡ [Generator Inquiry #10] 4× 3,000 kVA MTU 20V4000G63 Medium-Voltage (11kV) Generators',
          buyerCompany: 'Balkan Hydro & Industrial Power Systems d.o.o.',
          buyerCountry: 'Serbia / Romania',
          quantity: '4 Units',
          estimatedValue: '$2,920,000 USD',
          incotermPort: 'CIF Port of Constanta, Romania',
          paymentTerms: 'Irrevocable SBLC / DLC at Sight',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-CRANE-11',
          title: '🏗️ [Crane Inquiry #1] 2× Liebherr LTM 1300-6.2 (300-Ton) All-Terrain Hydraulic Mobile Cranes',
          buyerCompany: 'Al-Futtaim Heavy Lift & Infrastructure Contracting LLC',
          buyerCountry: 'United Arab Emirates / Qatar',
          quantity: '2 Units',
          estimatedValue: '$3,900,000 USD',
          incotermPort: 'CIF Jebel Ali Port, Dubai',
          paymentTerms: 'Irrevocable DLC at Sight / Trade Heaven Escrow + SGS Load Test',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-CRANE-12',
          title: '🏗️ [Crane Inquiry #2] 2× Manitowoc 999 (275-Ton) Lattice-Boom Crawler Cranes',
          buyerCompany: 'Pacific Bridge & Port Engineering Corp',
          buyerCountry: 'United States / Canada',
          quantity: '2 Units',
          estimatedValue: '$2,680,000 USD',
          incotermPort: 'EXW Marmora, NJ / Delivered to Seattle, WA',
          paymentTerms: 'Trade Heaven Escrow / Wire Transfer upon Yard Inspection',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-CRANE-13',
          title: '🏗️ [Crane Inquiry #3] 4× Grove RT9130E-2 (130-Ton) Rough-Terrain Hydraulic Cranes',
          buyerCompany: 'Sonatrach Energy Logistics & Desert Rigging SPA',
          buyerCountry: 'Algeria / Morocco',
          quantity: '4 Units',
          estimatedValue: '$2,960,000 USD',
          incotermPort: 'CIF Port of Algiers / Casablanca',
          paymentTerms: 'Confirmed Irrevocable L/C from Top Prime Bank',
          urgency: 'URGENT' as const
        },
        {
          id: 'MJ-CRANE-14',
          title: '🏗️ [Crane Inquiry #4] 3× Tadano ATF 220G-5 (220T) & Link-Belt HTC-86110 (110T) Cranes',
          buyerCompany: 'Constructora Metropolitana Bogota S.A.S.',
          buyerCountry: 'Colombia / Panama',
          quantity: '3 Units Total',
          estimatedValue: '$2,740,000 USD',
          incotermPort: 'CIF Port of Cartagena, Colombia',
          paymentTerms: 'Trade Heaven Escrow / 30% Deposit + 70% Against B/L',
          urgency: 'HIGH' as const
        },
        {
          id: 'MJ-CRANE-15',
          title: '🏗️ [Crane Inquiry #5] 2× Terex / Demag AC 250-5 (250-Ton) All-Terrain & Port Mobile Cranes',
          buyerCompany: 'Nordic Wind Turbine & Port Stevedoring AS',
          buyerCountry: 'Norway / Denmark',
          quantity: '2 Units',
          estimatedValue: '$2,590,000 USD',
          incotermPort: 'CIF Port of Oslo / Esbjerg',
          paymentTerms: 'Irrevocable DLC / Trade Heaven Escrow',
          urgency: 'HIGH' as const
        }
      ]
    }
  },
  {
    id: 'RANDY_10_BUYERS_PETROLEUM_INQUIRIES',
    name: '⛽ Mr. Randy (randy@midforkcap.com • Middle Fox LLC) — 10 Buyers Visited Profile & Inquired to Buy Petroleum Products',
    description: 'Official Notification to Mr. Randy (Middle Fox LLC, Billings MT): 10 Verified Buyers Visited His Profile & Inquired to Buy Petroleum Products (EN 590, Jet Fuel A-1, D6, ESPO, Mazut M100, LNG, MGO, AGO, Petcoke, Base Oil)',
    data: {
      recipientName: 'Mr. Randy',
      decisionMakerName: 'Mr. Randy',
      recipientEmail: 'randy@midforkcap.com',
      companyName: 'Middle Fox LLC',
      address: 'Billings, Montana 59101, United States',
      paymentMethod: 'DLC / SBLC / TT Tank-to-Tank / Trade Heaven Escrow',
      contactPhone: '+1 (406) 309 5590',
      loginEmail: 'randy@midforkcap.com',
      loginPassword: 'Randy@2026',
      portalUrl: 'https://www.tradeheaven.net',
      subject: '⛽ Profile Activity & Inquiry Alert: 10 Verified Buyers Visited Your Middle Fox LLC Profile & Inquired to Buy Petroleum Products',
      badgeLabel: '⛽ 10 BUYERS VISITED PROFILE • 10 ACTIVE PETROLEUM RFQs',
      headline: '10 Buyers Visited Your Profile & Inquired to Buy Petroleum Products',
      subheadline: 'Verified Institutional Energy Buyers Matched to Middle Fox LLC (Attn: Mr. Randy • Billings, Montana, USA)',
      introMessage: 'Dear Mr. Randy,\n\nGreat news from the Trade Heaven Global Energy & Petroleum Desk! Over the last 24 hours, 10 verified institutional buyers visited your Middle Fox LLC supplier profile on Trade Heaven and submitted direct purchase inquiries to buy bulk petroleum and refined fuel products.\n\nAll 10 visiting buyers have completed KYC Level 3 & Bank Comfort Letter (BCL) verification. Below is the complete breakdown of the 10 buyers who visited your profile and inquired to buy petroleum products (including Ultra-Low Sulfur Diesel EN 590 10PPM, Aviation Jet Fuel A-1, D6 Virgin Fuel Oil, ESPO Blend Crude Oil, Marine Gasoil DMA, Mazut M100, LNG/LPG, Automotive Gasoil AGO, Fuel-Grade Petcoke, and Virgin Base Oil SN500).\n\nPlease log in to your Middle Fox LLC Supplier Console to review each buyer\'s LOI/ICPO specifications and issue your Soft Corporate Offer (SCO) / Full Corporate Offer (FCO) under the supervision of your assigned International Export Manager, IEM Elena Rostova.',
      includeCredentialsBox: true,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      isMembershipRenewal: false,
      inquiriesTitle: '10 Verified Buyers Who Visited Your Profile & Inquired for Petroleum Products',
      customClosingNote: 'All 10 petroleum buyer inquiries are active in your Middle Fox LLC Supplier Console. Please keep all communications on the official Trade Heaven Negotiation Room under the supervision of your Export Manager.',
      ctaText: 'View All 10 Buyer Profile Visits & Submit Petroleum Quotes →',
      ctaUrl: 'https://www.tradeheaven.net',
      inquiries: [
        {
          id: 'PETRO-VISIT-01-EN590',
          title: 'Ultra-Low Sulfur Diesel EN 590 (10 PPM) — Visited Middle Fox LLC Profile & Submitted ICPO',
          buyerCompany: 'RheinEnergie Bunkering GmbH',
          buyerCountry: 'Netherlands / Germany',
          quantity: '100,000 MT / Month × 12 Months (1,200,000 MT Total)',
          estimatedValue: '$76,000,000 USD / Month',
          incotermPort: 'FOB Rotterdam / FOB Houston Tank-to-Tank (TTT)',
          paymentTerms: 'Irrevocable SBLC / MT103 after SGS Dip Test',
          urgency: 'URGENT' as const
        },
        {
          id: 'PETRO-VISIT-02-JETA1',
          title: 'Aviation Kerosene Colonial Grade Jet Fuel A-1 — Visited Profile & Requested FCO',
          buyerCompany: 'Emirates Aviation Fuel Supply LLC',
          buyerCountry: 'United Arab Emirates',
          quantity: '2,000,000 Barrels / Month × 12 Months',
          estimatedValue: '$164,000,000 USD / Month',
          incotermPort: 'FOB Houston / CIF Port of Fujairah',
          paymentTerms: 'DLC at Sight / Trade Heaven Escrow + Saybolt Q&Q',
          urgency: 'URGENT' as const
        },
        {
          id: 'PETRO-VISIT-03-D6',
          title: 'D6 Virgin Fuel Oil (Residual Fuel Oil) — Visited Profile & Inquired for Tank-to-Tank Allocation',
          buyerCompany: 'Gulf Coast Petrochemical & Power Corp',
          buyerCountry: 'United States (Texas)',
          quantity: '400,000,000 Gallons / Month',
          estimatedValue: '$340,000,000 USD / Month',
          incotermPort: 'FOB Houston / Port Arthur Tank-to-Tank (TTT)',
          paymentTerms: 'MT103 Wire upon TSA & SGS Injection Verification',
          urgency: 'URGENT' as const
        },
        {
          id: 'PETRO-VISIT-04-ESPO',
          title: 'Light Sweet Crude Oil / ESPO Blend — Visited Profile & Inquired for Spot Cargo',
          buyerCompany: 'SingaPac Energy Trading Pte Ltd',
          buyerCountry: 'Singapore',
          quantity: '1,000,000 Barrels Spot Trial + 2M BBL/Mo Contract',
          estimatedValue: '$78,500,000 USD (Spot Trial)',
          incotermPort: 'CIF Jurong Port, Singapore',
          paymentTerms: 'Irrevocable DLC / MT103 upon Q&Q Outturn',
          urgency: 'HIGH' as const
        },
        {
          id: 'PETRO-VISIT-05-MGO',
          title: 'Marine Gasoil (MGO DMA 0.1% Sulfur ISO 8217) — Visited Profile & Submitted LOI',
          buyerCompany: 'Mediterranean Maritime Bunkers S.A.',
          buyerCountry: 'Greece',
          quantity: '50,000 MT Spot + Monthly Rollover',
          estimatedValue: '$39,500,000 USD',
          incotermPort: 'CIF Port of Piraeus / Tank-to-Vessel (TTV)',
          paymentTerms: 'SBLC / Trade Heaven Escrow Settlement',
          urgency: 'HIGH' as const
        },
        {
          id: 'PETRO-VISIT-06-MAZUT',
          title: 'Heavy Fuel Oil Mazut M100 (GOST 10585-99) — Visited Profile & Requested SCO',
          buyerCompany: 'Baltic Power & District Heating Ltd',
          buyerCountry: 'Poland',
          quantity: '75,000 MT / Month × 12 Months',
          estimatedValue: '$34,500,000 USD / Month',
          incotermPort: 'CIF Port of Gdansk, Poland',
          paymentTerms: 'Irrevocable Documentary Letter of Credit (DLC)',
          urgency: 'HIGH' as const
        },
        {
          id: 'PETRO-VISIT-07-LNG',
          title: 'Liquefied Natural Gas (LNG) & LPG (70/30 Butane/Propane) — Visited Profile & Inquired',
          buyerCompany: 'Nippon CryoGas & Power Co.',
          buyerCountry: 'Japan',
          quantity: '65,000 MT / Month',
          estimatedValue: '$41,600,000 USD / Month',
          incotermPort: 'CIF Yokohama / Tokyo Bay LNG Terminal',
          paymentTerms: 'SBLC MT760 + MT103 on Discharge SGS',
          urgency: 'HIGH' as const
        },
        {
          id: 'PETRO-VISIT-08-AGO',
          title: 'Automotive Gas Oil (AGO / Low-Sulfur Diesel) — Visited Profile & Requested Immediate Quote',
          buyerCompany: 'West Africa Bulk Fuel Distributors Ltd',
          buyerCountry: 'Nigeria / Ghana',
          quantity: '45,000 MT Spot Cargo',
          estimatedValue: '$35,100,000 USD',
          incotermPort: 'CIF Apapa Port Lagos / Tema Port',
          paymentTerms: 'Confirmed Irrevocable L/C from Top-25 Prime Bank',
          urgency: 'HIGH' as const
        },
        {
          id: 'PETRO-VISIT-09-PETCOKE',
          title: 'Fuel-Grade Petroleum Coke (Petcoke HGI 50+, Sulfur < 4.5%) — Visited Profile & Inquired',
          buyerCompany: 'Anatolia Cement & Smelting Holdings',
          buyerCountry: 'Turkey',
          quantity: '60,000 MT / Month',
          estimatedValue: '$11,400,000 USD / Month',
          incotermPort: 'CIF Port of Iskenderun / Derince, Turkey',
          paymentTerms: 'DLC at Sight / 30% Advance + 70% Against B/L',
          urgency: 'STANDARD' as const
        },
        {
          id: 'PETRO-VISIT-10-BASEOIL',
          title: 'Virgin Base Oil SN 500 & SN 150 (Group I / Group II) — Visited Profile & Inquired',
          buyerCompany: 'EuroLube Blending & Petrochem NV',
          buyerCountry: 'Belgium',
          quantity: '25,000 MT / Month (Flexitanks / Bulk Vessel)',
          estimatedValue: '$23,750,000 USD / Month',
          incotermPort: 'CIF Port of Antwerp, Belgium',
          paymentTerms: 'Trade Heaven Escrow / Irrevocable L/C at Sight',
          urgency: 'STANDARD' as const
        }
      ]
    }
  },
  {
    id: 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI',
    name: '⚠️ Zac ($400 Paid Basic Plan) — Ads Failed + Pause Warning + Diwali Max Benefit',
    description: 'Demo Mail on Admin First + Live Mail to Zac (zac@otec.ltd • IMPORTATION FADE-TECH): $400 Paid, Ads Halted, Pay Full Plan ($590 Balance with Diwali Offer) or Account Pause',
    data: {
      recipientName: 'Zachary Aldin (Zac)',
      decisionMakerName: 'Zachary Aldin (Zac)',
      recipientEmail: 'zac@otec.ltd',
      companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
      address: '42a Bassett street hurstville, New South Wales 2220, Australia',
      paymentMethod: 'Bank Wire / Card Settlement ($400 USD Paid — $590 USD Balance Due)',
      contactPhone: '+61 424 854 899',
      loginEmail: 'zac@otec.ltd',
      loginPassword: 'Zac@0011',
      portalUrl: 'https://www.tradeheaven.net',
      subject: '⚠️ Urgent: Today\'s Ads Campaign Failed (Insufficient Plan Balance — $400 Paid) • Complete Full Plan or Account Will Pause + 🪔 Diwali Max Benefit Offer for IMPORTATION FADE-TECH (OTEC LTD)',
      badgeLabel: '⚠️ CAMPAIGN HALTED TODAY • INSUFFICIENT PLAN BALANCE ($400 PAID)',
      headline: 'Today’s Sponsored Ads Campaign Failed to Launch',
      subheadline: 'Action Required for IMPORTATION FADE-TECH (Ref: TRD-INV-27-0004) to Resume Ads, Connect With Buyers & Prevent Account Pause',
      introMessage: 'Dear Zachary Aldin (Zac),\n\nThis is an urgent notification from the Trade Heaven Ad Campaign & Billing Operations Desk regarding your supplier account for IMPORTATION FADE-TECH (OTEC LTD) (Ref: TRD-INV-27-0004).\n\n1. WHY TODAY\'S ADS CAMPAIGN FAILED (#ADS-COAL-AU-2026):\nYour scheduled Global B2B Sponsored Ads & Buyer Matching Campaign launched today for IMPORTATION FADE-TECH failed during automated billing verification because only a partial deposit of $400.00 USD has been paid toward your Basic Plan (insufficient plan balance).\n\n2. ⚠️ MANDATORY FULL PLAN SETTLEMENT OR ACCOUNT PAUSE WARNING:\nSponsored Ad Campaigns and direct buyer inquiry connections require a 100% Completed Full Plan. Please complete the remaining payment for your Full Plan so we can immediately re-launch your Ads Campaign and connect you with more verified coal & commodity buyers—otherwise your IMPORTATION FADE-TECH account and storefront will be placed on TEMPORARY PAUSE / HOLD.\n\n3. 🪔 DIWALI MAHA UTSAV SPECIAL OFFER — AVAIL MAXIMUM BENEFIT (CODE: DIWALI10):\n• Option A — Complete Full Basic Plan (With Diwali 10% OFF): Standard Basic Plan is $1,100/yr ($700 balance), but under the Diwali Offer (DIWALI10) it is $990/yr (Save $110 USD). With your $400 USD already credited, you only need to pay $590.00 USD to unlock 100% Full Basic Plan + immediate Ads Campaign relaunch!\n• Option B — Upgrade to Full VIP Plan (Maximum Diwali Benefit): Apply your $400 USD credit + Flat 10% Diwali Discount (DIWALI10 — Save $610 USD) to unlock 4x Sponsored Spotlight Ad Campaigns, 60+ Verified Buyer Orders/Month, and Direct On-Site Buyer Funds Receiving Option.',
      includeCredentialsBox: true,
      includeLoginGuide: false,
      includeEscrowBadge: true,
      isMembershipRenewal: true,
      renewalPlanId: 'basic-business-plan',
      renewalAmountUsd: 590,
      inquiriesTitle: 'Halted Ad Campaign & Pending Coal Buyer Inquiries (Unlocked With Full Plan)',
      customClosingNote: '⚠️ Account Pause Notice: Kindly settle the remaining Full Plan balance ($590 USD with Diwali 10% OFF Code DIWALI10 after your $400 credit) within 48 hours to immediately resume your Ads Campaign, connect with global buyers, and prevent temporary account pause.',
      ctaText: 'Pay Full Plan Balance ($590 USD with Diwali Offer) & Relaunch Ads →',
      ctaUrl: 'https://www.tradeheaven.net/?action=renew-membership&company=IMPORTATION%20FADE-TECH%20(OTEC%20LTD)&email=zac%40otec.ltd&decisionMaker=Zachary%20Aldin%20(Zac)&address=42a%20Bassett%20street%20hurstville%2C%20New%20South%20Wales%202220%2C%20Australia&paymentMethod=Bank%20Wire%20%2F%20Card&planId=basic-business-plan&amountUsd=590',
      inquiries: [
        {
          id: 'ADS-COAL-AU-2026-FAILED',
          title: '❌ HALTED TODAY: Sponsored Global Coal Buyer Acquisition Campaign (Insufficient Plan Balance — $400 Paid)',
          buyerCompany: 'Asia-Pacific, India, Japan & EU Energy Importers Network',
          buyerCountry: 'Global Ad Network (Paused)',
          quantity: '2x Sponsored Marketplace Banners + Priority Coal RFQ Broadcasting + 20-60+ Buyer Matches/Mo',
          estimatedValue: '$590.00 USD Balance Due (After $400 Paid Credit + Diwali 10% OFF Code: DIWALI10)',
          incotermPort: 'FOB Port of Newcastle / Gladstone / Hay Point (Ref: TRD-INV-27-0004)',
          paymentTerms: 'Complete Full Plan to Immediately Resume Ads & Prevent Account Pause',
          urgency: 'URGENT' as const
        },
        {
          id: 'RFQ-COAL-AU-2026-01',
          title: 'High-CV Australian Thermal Coal (GAR 6000–6500 kcal/kg) — Waiting for Full Plan Activation',
          buyerCompany: 'APAC Power & Industrial Utilities Consortium',
          buyerCountry: 'Japan / South Korea / India',
          quantity: '50,000 Metric Tons / Month (12-Month Contract)',
          estimatedValue: '$6,750,000.00 USD / Shipment',
          incotermPort: 'FOB Port of Newcastle, NSW / CIF Destination Port',
          paymentTerms: 'Irrevocable L/C at Sight / SBLC + SGS Pre-Shipment Inspection',
          urgency: 'URGENT' as const
        }
      ]
    }
  },
  {
    id: 'MEMBERSHIP_RENEWAL',
    name: '💎 Basic Plan Renewal + Offer (Ali Charley Ezekiah • ACE Intermediary)',
    description: 'Basic Business Plan ($990/yr — 10% OFF Offer) for Ali Charley Ezekiah + Admin Copy & "Renew Now" payment trigger',
    data: {
      recipientName: 'Ali Charley Ezekiah',
      decisionMakerName: 'Ali Charley Ezekiah',
      recipientEmail: 'ezekiahali355@gmail.com',
      companyName: 'ACE Intermediary',
      address: '1241 Hackberry Avenue Corsicana Texas 75110',
      paymentMethod: 'Debit Card',
      contactPhone: '+1 (903) 555-0141',
      loginEmail: 'ezekiahali355@gmail.com',
      loginPassword: '',
      portalUrl: 'https://www.tradeheaven.net',
      subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
      badgeLabel: 'TRADE HEAVEN • BASIC PLAN RENEWAL & SPECIAL OFFER',
      headline: 'Basic Business Plan Renewal & Exciting New Trade Deals',
      subheadline: 'Special 10% OFF Basic Plan Offer ($990/yr vs $1,100/yr) Prepared for ACE Intermediary',
      introMessage: 'Dear Ali Charley Ezekiah,\n\nThank you for your continued partnership with Trade Heaven Global B2B. Your Basic Business Plan (Basic Tier) membership for ACE Intermediary (1241 Hackberry Avenue Corsicana Texas 75110) is eligible for renewal under our Special Current Offer ($990 USD / Year — Flat 10% OFF standard $1,100 USD rate, saving $110 USD), unlocking up to 20 verified buyer orders/month, a dedicated 50-product catalogue & 1-page business microsite, and instant Debit Card settlement.\n\nTemplate Placeholders Supported: {{companyName}} | {{address}} | {{email}} | {{decisionMakerName}} | {{paymentMethod}}',
      includeCredentialsBox: false,
      includeLoginGuide: false,
      includeEscrowBadge: true,
      isMembershipRenewal: true,
      renewalPlanId: 'basic-business-plan',
      renewalAmountUsd: 990,
      inquiriesTitle: 'Basic Plan Deliverables & New Exciting Deals Unlocked With Renewal',
      customClosingNote: 'Click "Renew Now" below to complete your Basic Business Plan renewal ($990 USD / Year with 10% OFF Offer) via Debit Card for ACE Intermediary.',
      ctaText: 'Renew Now',
      ctaUrl: 'https://www.tradeheaven.net/?action=renew-membership&company=ACE%20Intermediary&email=ezekiahali355%40gmail.com&decisionMaker=Ali%20Charley%20Ezekiah&address=1241%20Hackberry%20Avenue%20Corsicana%20Texas%2075110&paymentMethod=Debit%20Card&planId=basic-business-plan&amountUsd=990',
      inquiries: [
        {
          id: 'BASIC-OFFER-2026',
          title: 'Basic Business Plan Renewal (10% OFF Offer — $990/yr vs $1,100/yr) + 20 Verified Orders/Mo',
          buyerCompany: 'Verified Global Importers & Wholesale Buyers',
          buyerCountry: 'USA / EU / Global',
          quantity: 'Up to 20 Verified Orders/Mo + 50 Catalogue Listings + 10 Ready-to-Ship Slots',
          estimatedValue: '$990.00 USD / Year (Save $110 USD — Code: DIWALI10)',
          incotermPort: 'CIF / FOB Global Ports + 1-Page Business Website, Domain & SSL',
          paymentTerms: 'Instant Debit Card Renewal Settlement + Trade Assurance Protection',
          urgency: 'URGENT' as const
        }
      ]
    }
  },
  {
    id: 'RANDY_FUEL_SUPPLIER',
    name: '⛽ Fuel Supplier Onboarding & Tenders (Mr. Randy • Middle Fox LLC)',
    description: 'Pre-fills login credentials, login guide, and 2 active petroleum inquiries (EN 590 Diesel & Jet Fuel A-1)',
    data: {
      recipientName: 'Mr. Randy',
      recipientEmail: 'randy@midforkcap.com',
      companyName: 'Middle Fox LLC',
      contactPhone: '+1 (406) 309 5590',
      loginEmail: 'randy@midforkcap.com',
      loginPassword: 'Randy@2026',
      portalUrl: 'https://www.tradeheaven.net',
      subject: 'Welcome to Trade Heaven: Your Middle Fox LLC Fuel Supplier Portal Credentials & Active Inquiries (EN 590 & Jet Fuel A-1)',
      badgeLabel: 'TRADE HEAVEN • GLOBAL B2B PETROLEUM & ENERGY DESK',
      headline: 'Welcome to Trade Heaven',
      subheadline: 'Supplier Account Activated & Active Fuel Inquiries Assigned for Middle Fox LLC',
      introMessage: 'We are pleased to confirm that Middle Fox LLC has been officially approved and published on the Trade Heaven Global B2B Portal. Your export catalog for Ultra-Low Sulfur Diesel EN 590 (10 PPM) and Aviation Turbine Jet Fuel A-1 is now live, and multiple verified wholesale buyer inquiries are waiting in your merchant dashboard.',
      includeCredentialsBox: true,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      inquiriesTitle: 'Active Fuel Tenders Matched to Your Account',
      customClosingNote: 'Trade Heaven Escrow Protection: All petroleum commodity contracts finalized on Trade Heaven operate under regulated escrow protocols with independent SGS/Saybolt verification prior to funds release.',
      ctaText: 'Log In to Portal & View Tenders in Dashboard →',
      ctaUrl: 'https://www.tradeheaven.net',
      inquiries: [
        {
          id: 'RFQ-FUEL-EN590-2026',
          title: 'Ultra-Low Sulfur Diesel Fuel EN 590 (10 PPM Euro 5/6)',
          buyerCompany: 'Nordic PetroLogistics AS',
          buyerCountry: 'Norway / Netherlands',
          quantity: '100,000 Metric Tons / Month (12-Month Contract)',
          estimatedValue: '$62,000,000 USD',
          incotermPort: 'CIF Port of Rotterdam / Houston',
          paymentTerms: 'Irrevocable Transferable SBLC / MT760 + MT103 against SGS inspection',
          urgency: 'URGENT' as const
        },
        {
          id: 'RFQ-FUEL-JETA1-2026',
          title: 'Aviation Turbine Kerosene (Jet Fuel A-1, ASTM D1655 / Def Stan 91-091)',
          buyerCompany: 'AeroFuel International Consortium LLC',
          buyerCountry: 'Texas, USA',
          quantity: '2,000,000 Barrels (Trial Spot Lift + Extension)',
          estimatedValue: '$168,000,000 USD',
          incotermPort: 'FOB Houston / Port of Rotterdam Tank-to-Vessel',
          paymentTerms: 'Dip & Pay MT103 upon fresh SGS Q&Q tank dip verification',
          urgency: 'URGENT' as const
        }
      ]
    }
  },
  {
    id: 'DONALD_BUYER_INQUIRY',
    name: '🫐 Buyer Inquiry Alert (Donald Sorkin • Girlsenberries)',
    description: 'Pre-fills wholesale berry inquiry from Apex Global Food Sourcing with login reminder and tender specifications',
    data: {
      recipientName: 'Donald Sorkin',
      recipientEmail: 'sorkindon@gmail.com',
      companyName: 'Girlsenberries',
      contactPhone: '+1 (555) 234-5678',
      loginEmail: 'sorkindon@gmail.com',
      loginPassword: 'Donald@1234',
      portalUrl: 'https://www.tradeheaven.net',
      subject: 'Action Required: High-Value Buyer Inquiry for Girlsenberries on Trade Heaven Portal',
      badgeLabel: 'TRADE HEAVEN • VERIFIED BUYER INQUIRY DESK',
      headline: 'New High-Value Buy Lead Received',
      subheadline: 'Buyer Inquiry Matched to Girlsenberries Catalog',
      introMessage: 'A verified global procurement syndicate has posted an urgent buy inquiry matched directly to your commercial food service catalog. Please review the buyer requirements and submit your quotation via the merchant dashboard.',
      includeCredentialsBox: true,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      inquiriesTitle: 'Pending Buyer Tender Details',
      customClosingNote: 'The buyer is ready to initiate contract signing upon receipt of formal FOB/CIF pricing. Escrow trade protection is active.',
      ctaText: 'Access Dashboard & Review Inquiry →',
      ctaUrl: 'https://www.tradeheaven.net',
      inquiries: [
        {
          id: 'INQ-2026-US-8942',
          title: 'Wholesale Grade-A Frozen & Dried Cultivated Berries (Commercial Food Service)',
          buyerCompany: 'Apex Global Food Sourcing LLC (Marcus Vance, VP)',
          buyerCountry: 'United States',
          quantity: '2x 40ft High-Cube Refrigerated Containers (28,000 kg)',
          estimatedValue: '$148,000.00 USD',
          incotermPort: 'CIF Long Beach Port, USA',
          paymentTerms: '30% Escrow Advance, 70% Irrevocable DLC at Sight against B/L',
          urgency: 'URGENT' as const
        }
      ]
    }
  },
  {
    id: 'NEW_SUPPLIER_ONBOARDING',
    name: '🏭 Generic Supplier Account Activation & Login Guide',
    description: 'Blank template for approving and activating any new manufacturer or exporter with login credentials',
    data: {
      recipientName: 'Managing Director',
      recipientEmail: '',
      companyName: 'Global Manufacturing Corp',
      contactPhone: '',
      loginEmail: '',
      loginPassword: '',
      portalUrl: 'https://www.tradeheaven.net',
      subject: 'Your Trade Heaven Verified Supplier Account is Live - Login Credentials & Active Leads',
      badgeLabel: 'TRADE HEAVEN • VERIFIED SUPPLIER ONBOARDING',
      headline: 'Welcome to Trade Heaven Global B2B',
      subheadline: 'Your Verified Supplier Storefront is Active',
      introMessage: 'Congratulations! Your corporate supplier profile has passed institutional verification and is now published across the Trade Heaven Global B2B Network.',
      includeCredentialsBox: true,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      inquiriesTitle: 'Active Buy Leads Matched to Your Industry',
      customClosingNote: 'Your Dedicated Export Manager is available 24/7 to assist with buyer negotiations and shipping logistics.',
      ctaText: 'Log In to Portal Dashboard →',
      ctaUrl: 'https://www.tradeheaven.net',
      inquiries: [
        {
          id: 'RFQ-EXPORT-001',
          title: 'Commercial Bulk Supply Contract - Institutional Procurement',
          buyerCompany: 'Verified Enterprise Importer',
          buyerCountry: 'Global',
          quantity: 'Full Container Load (FCL)',
          estimatedValue: '$250,000.00 USD',
          incotermPort: 'CIF / FOB Preferred',
          paymentTerms: 'Irrevocable LC / Trade Heaven Escrow Protection',
          urgency: 'STANDARD' as const
        }
      ]
    }
  },
  {
    id: 'CUSTOM_BESPOKE',
    name: '📝 Blank / Custom Tailored Announcement',
    description: 'Completely blank canvas with full control over all fields and inquiries',
    data: {
      recipientName: '',
      recipientEmail: '',
      companyName: '',
      contactPhone: '',
      loginEmail: '',
      loginPassword: '',
      portalUrl: 'https://www.tradeheaven.net',
      subject: '',
      badgeLabel: 'TRADE HEAVEN • GLOBAL B2B NETWORK',
      headline: '',
      subheadline: '',
      introMessage: '',
      includeCredentialsBox: false,
      includeLoginGuide: false,
      includeEscrowBadge: true,
      inquiriesTitle: 'Matched Trade Opportunities',
      customClosingNote: '',
      ctaText: 'Open Trade Heaven Portal →',
      ctaUrl: 'https://www.tradeheaven.net',
      inquiries: []
    }
  }
];

export const CustomEmailDispatcherAdminModule: React.FC<CustomEmailDispatcherProps> = ({
  onOpenPaymentCheckout
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('MARK_JOHNSON_15_BUYERS_GENERATORS_CRANES');
  const [activeSubTab, setActiveSubTab] = useState<'FORM' | 'PREVIEW' | 'HISTORY'>('PREVIEW');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  
  // Form State
  const [formData, setFormData] = useState<CustomAdminEmailPayload>({
    ...PRESET_TEMPLATES[0].data,
    inquiries: [...(PRESET_TEMPLATES[0].data.inquiries || [])]
  });

  const resolveTemplatePlaceholder = (val: string | undefined, fallback: string) => {
    if (!val || val.includes('{{')) return fallback;
    return val;
  };

  const handleTriggerRenewNowPayment = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    const resolvedCompany = resolveTemplatePlaceholder(
      formData.companyName,
      MEMBERSHIP_RENEWAL_DEFAULTS.companyName
    );
    const resolvedAddress = resolveTemplatePlaceholder(
      formData.address,
      MEMBERSHIP_RENEWAL_DEFAULTS.address
    );
    const resolvedEmail = resolveTemplatePlaceholder(
      formData.recipientEmail,
      MEMBERSHIP_RENEWAL_DEFAULTS.email
    );
    const resolvedDecisionMaker = resolveTemplatePlaceholder(
      formData.decisionMakerName || formData.recipientName,
      MEMBERSHIP_RENEWAL_DEFAULTS.decisionMakerName
    );
    const resolvedPaymentMethod = resolveTemplatePlaceholder(
      formData.paymentMethod,
      MEMBERSHIP_RENEWAL_DEFAULTS.paymentMethod
    );
    const amountUsd = formData.renewalAmountUsd || 990;
    const planId = formData.renewalPlanId || 'basic-business-plan';

    const checkoutPayload = {
      planId,
      title: `Basic Business Plan Renewal — 10% OFF Offer (${resolvedCompany})`,
      description: `Basic Business Plan Renewal ($${amountUsd} USD/yr — 10% OFF standard $1,100/yr) for ${resolvedCompany} (${resolvedAddress}) • Decision Maker: ${resolvedDecisionMaker} • Payment Method: ${resolvedPaymentMethod}`,
      amountUsd,
      type: 'SUBSCRIPTION',
      supplierCompany: resolvedCompany,
      clientEmail: resolvedEmail,
      billingName: `${resolvedDecisionMaker} (${resolvedCompany})`,
      address: resolvedAddress,
      decisionMakerName: resolvedDecisionMaker,
      preferredPaymentMethod: resolvedPaymentMethod
    };

    if (onOpenPaymentCheckout) {
      onOpenPaymentCheckout(checkoutPayload);
    } else {
      window.dispatchEvent(
        new CustomEvent('tradeheaven_open_payment_checkout', { detail: checkoutPayload })
      );
    }
  };

  const handleLoadPlaceholdersMode = () => {
    setFormData(prev => ({
      ...prev,
      companyName: '{{companyName}}',
      address: '{{address}}',
      recipientEmail: '{{email}}',
      decisionMakerName: '{{decisionMakerName}}',
      recipientName: '{{decisionMakerName}}',
      paymentMethod: '{{paymentMethod}}',
      isMembershipRenewal: true,
      ctaText: 'Renew Now'
    }));
  };

  const handleLoadAceIntermediaryValues = () => {
    setFormData(prev => ({
      ...prev,
      companyName: 'ACE Intermediary',
      address: '1241 Hackberry Avenue Corsicana Texas 75110',
      recipientEmail: 'ezekiahali355@gmail.com',
      decisionMakerName: 'Ali Charley Ezekiah',
      recipientName: 'Ali Charley Ezekiah',
      paymentMethod: 'Debit Card',
      isMembershipRenewal: true,
      ctaText: 'Renew Now'
    }));
  };

  const [isSending, setIsSending] = useState(false);
  const [sendingTarget, setSendingTarget] = useState<'ADMIN' | 'CLIENT' | 'BOTH' | null>(null);
  const [isSendingDemoAdmin, setIsSendingDemoAdmin] = useState(false);
  const [sendAdminCopy, setSendAdminCopy] = useState(true);
  const [adminCopyEmail, setAdminCopyEmail] = useState('yr943334@gmail.com');

  // Interactive Live Preview & Per-Section Add / Edit / Delete Builder State
  const [showInlinePreview, setShowInlinePreview] = useState(true);
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [sectionVisibility, setSectionVisibility] = useState<Record<BuiltinSectionKey, boolean>>(() => {
    const initial = PRESET_TEMPLATES[0].data;
    return {
      headerBanner: true,
      greetingIntro: true,
      billingSummary: Boolean(initial.address || initial.paymentMethod || initial.isMembershipRenewal),
      credentialsBox: initial.includeCredentialsBox !== false,
      loginGuide: initial.includeLoginGuide !== false,
      inquiries: Boolean(initial.inquiries && initial.inquiries.length > 0),
      ctaButton: true,
      closingNote: Boolean(initial.customClosingNote),
      escrowBadge: initial.includeEscrowBadge !== false,
      footer: true
    };
  });
  const [greetingPrefix, setGreetingPrefix] = useState('Dear');
  const [billingSectionTitle, setBillingSectionTitle] = useState('CLIENT MEMBERSHIP & BILLING SUMMARY');
  const [billingSectionBadge, setBillingSectionBadge] = useState('CURRENT OFFER ACTIVE');
  const [loginGuideTitle, setLoginGuideTitle] = useState('Quick 3-Step Login Guide:');
  const [loginGuideSteps, setLoginGuideSteps] = useState<string[]>([
    'Go to your Trade Heaven portal URL and click "Sign In" at the top right.',
    'Enter your registered User ID / Email and assigned Password.',
    'Open your Dashboard > Inquiries & Buy Leads to review specifications and submit quotations.'
  ]);
  const [escrowNoticeText, setEscrowNoticeText] = useState(
    'All high-value institutional contracts finalized on Trade Heaven operate under regulated escrow protocols with independent SGS/Saybolt verification prior to funds release.'
  );
  const [footerText, setFooterText] = useState(
    'Dispatched via noreply@tradeheaven.net • Immediate support on WhatsApp +91 85329 34479 or help@tradeheaven.net'
  );
  const [customSections, setCustomSections] = useState<CustomEmailSectionBlock[]>(() =>
    (PRESET_TEMPLATES[0].defaultCustomSections || []).map(sec => ({ ...sec }))
  );

  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
    trackingId?: string;
    trackingPixelUrl?: string;
    dispatchedAt?: string;
  } | null>(null);

  // MailSuite Open & Click Tracking Telemetry State
  const [mailSuiteStats, setMailSuiteStats] = useState<MailSuiteAnalyticsSummary | null>(null);
  const [trackedServerEmails, setTrackedServerEmails] = useState<CompanyEmailHistoryEntry[]>([]);
  const [simulatingTrackKey, setSimulatingTrackKey] = useState<string | null>(null);

  const mergeServerEntriesIntoHistory = useCallback((entries: CompanyEmailHistoryEntry[]) => {
    if (!Array.isArray(entries) || entries.length === 0) return;
    setHistory(prev => {
      const seenKeys = new Set<string>();
      const combined: DispatchedHistoryItem[] = [];

      const makeKey = (recipient: string, msgId?: string, trkId?: string, subj?: string, dt?: string) => {
        const cleanRec = (recipient || '').trim().toLowerCase();
        if (msgId) return `m:${cleanRec}:${msgId}`;
        if (trkId) return `t:${cleanRec}:${trkId}`;
        return `s:${cleanRec}:${(subj || '').slice(0, 60)}:${(dt || '').slice(0, 16)}`;
      };

      for (const s of entries) {
        const rec = (s as any).recipient || (s as any).recipientEmail || '';
        if (!rec) continue;
        const k = makeKey(rec, s.messageId, s.trackingId, s.subject, s.dispatchedAt);
        if (seenKeys.has(k)) continue;
        seenKeys.add(k);
        combined.push({
          id: s.id || `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          recipientEmail: rec,
          recipientName: s.recipientName || 'Trade Partner',
          companyName: s.companyName || 'Corporate Entity',
          subject: s.subject || 'Trade Heaven Notification',
          templatePreset: s.category || 'CUSTOM_ADMIN_NOTICE',
          messageId: s.messageId,
          trackingId: s.trackingId,
          dispatchedAt: s.dispatchedAt || new Date().toISOString(),
          success: s.success !== false,
          deliveryMode: (s as any).deliveryMode,
          error: s.error || undefined
        });
      }

      for (const local of prev) {
        const k = makeKey(local.recipientEmail, local.messageId, local.trackingId, local.subject, local.dispatchedAt);
        if (seenKeys.has(k)) continue;
        seenKeys.add(k);
        combined.push(local);
      }

      combined.sort((a, b) => new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime());
      return combined.slice(0, 300);
    });
  }, []);

  const fetchMailSuiteTelemetry = useCallback(async () => {
    try {
      let resolvedEntries: CompanyEmailHistoryEntry[] = [];
      let resolvedStats: MailSuiteAnalyticsSummary | null = null;

      // 1. Primary Node endpoints
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          fetch('/api/v1/admin/mailsuite/analytics', { headers: { Accept: 'application/json' } }).catch(() => null),
          fetch('/api/v1/admin/email-history', { headers: { Accept: 'application/json' } }).catch(() => null)
        ]);
        if (analyticsRes && analyticsRes.ok) {
          const data = await analyticsRes.json().catch(() => null);
          if (data && data.status !== 'fallback') {
            if (data.analytics) resolvedStats = data.analytics;
            if (Array.isArray(data.entries)) resolvedEntries = data.entries;
          }
        }
        if (historyRes && historyRes.ok) {
          const hData = await historyRes.json().catch(() => null);
          if (hData && hData.status !== 'fallback') {
            if (Array.isArray(hData.history) && hData.history.length >= resolvedEntries.length) {
              resolvedEntries = hData.history;
            }
            if (!resolvedStats && hData.mailSuiteStats) {
              resolvedStats = hData.mailSuiteStats;
            }
          }
        }
      } catch {
        // Fall through to PHP endpoint
      }

      // 2. PHP fallback (live tradeheaven.net hosting / external Chrome window)
      if (resolvedEntries.length === 0) {
        try {
          const phpRes = await fetch('/api.php?action=get_email_history', {
            headers: { Accept: 'application/json' },
            cache: 'no-store'
          });
          if (phpRes.ok) {
            const phpData = await phpRes.json().catch(() => null);
            if (phpData && phpData.status !== 'fallback' && Array.isArray(phpData.history)) {
              resolvedEntries = phpData.history;
              if (phpData.mailSuiteStats || phpData.analytics) {
                resolvedStats = phpData.mailSuiteStats || phpData.analytics;
              }
            }
          }
        } catch {
          // ignore offline
        }
      }

      // 3. Static mailsuite telemetry fallback (ensures all 200+ emails appear in Chrome even if PHP/Node API is unreachable)
      if (resolvedEntries.length === 0) {
        try {
          const staticRes = await fetch(`/assets/uploads/mailsuite-telemetry-state.json?t=${Date.now()}`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store'
          });
          if (staticRes.ok) {
            const staticData = await staticRes.json().catch(() => null);
            const staticList = staticData?.emailHistoryLog || staticData?.history || [];
            if (Array.isArray(staticList) && staticList.length > 0) {
              resolvedEntries = staticList;
            }
          }
        } catch {
          // ignore offline
        }
      }

      if (resolvedStats) setMailSuiteStats(resolvedStats);
      if (resolvedEntries.length > 0) {
        setTrackedServerEmails(resolvedEntries);
        mergeServerEntriesIntoHistory(resolvedEntries);
      }
    } catch {
      // ignore offline telemetry fetch error
    }
  }, [mergeServerEntriesIntoHistory]);

  // Listed Clients Counter-Offer Broadcast State
  const [listedClientsSummary, setListedClientsSummary] = useState<{
    smtpConfigured: boolean;
    deliveryMode: string;
    registeredClientsCount: number;
    directoryClientsCount: number;
    registeredClients: Array<{
      id: string;
      name: string;
      companyName: string;
      email: string;
      country: string;
      productFocus: string;
    }>;
  } | null>(null);
  const [broadcastScope, setBroadcastScope] = useState<'REGISTERED_CLIENTS' | 'ALL_LISTED_CLIENTS'>('REGISTERED_CLIENTS');
  const [customBroadcastSubject, setCustomBroadcastSubject] = useState('');
  const [customBroadcastMessage, setCustomBroadcastMessage] = useState('');
  const [isBroadcastingCounterOffer, setIsBroadcastingCounterOffer] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    success: boolean;
    inProgress?: boolean;
    smtpConfigured: boolean;
    deliveryMode: string;
    totalTargeted: number;
    processedCount: number;
    deliveredCount: number;
    queuedAwaitingSmtpCount: number;
    failedCount: number;
    message: string;
    recipients?: Array<{
      email: string;
      name: string;
      companyName: string;
      status: string;
      error?: string;
    }>;
  } | null>(null);

  const fetchListedClientsSummary = async () => {
    try {
      const res = await fetch('/api/v1/admin/listed-clients-summary', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          setListedClientsSummary({
            smtpConfigured: Boolean(data.smtpConfigured),
            deliveryMode: String(data.deliveryMode || 'QUEUED_NO_SMTP_CREDENTIALS'),
            registeredClientsCount: Number(data.registeredClientsCount || 0),
            directoryClientsCount: Number(data.directoryClientsCount || 0),
            registeredClients: Array.isArray(data.registeredClients) ? data.registeredClients : []
          });
        }
      }
    } catch {
      // ignore offline summary fetch error
    }
  };

  useEffect(() => {
    fetchMailSuiteTelemetry();
    fetchListedClientsSummary();

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('th_admin_email_history_sync');
        bc.onmessage = () => {
          fetchMailSuiteTelemetry();
        };
      }
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'th_admin_dispatched_emails_history' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setHistory(parsed);
        } catch {}
        fetchMailSuiteTelemetry();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      try {
        bc?.close();
      } catch {}
    };
  }, [fetchMailSuiteTelemetry]);

  useEffect(() => {
    if (activeSubTab === 'HISTORY') {
      fetchMailSuiteTelemetry();
    }
  }, [activeSubTab, fetchMailSuiteTelemetry]);

  const handleBroadcastCounterOfferToListedClients = async () => {
    setIsBroadcastingCounterOffer(true);
    setBroadcastResult(null);
    try {
      const res = await fetch('/api/v1/admin/email-listed-clients-counter-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          scope: broadcastScope,
          customSubject: customBroadcastSubject.trim() || undefined,
          customMessage: customBroadcastMessage.trim() || undefined
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBroadcastResult({
          success: false,
          smtpConfigured: Boolean(data?.smtpConfigured),
          deliveryMode: data?.deliveryMode || 'UNKNOWN',
          totalTargeted: 0,
          processedCount: 0,
          deliveredCount: 0,
          queuedAwaitingSmtpCount: 0,
          failedCount: 0,
          message: data?.message || 'Failed to launch listed-clients counter-offer broadcast.'
        });
        return;
      }

      const applyBroadcastData = (payload: any) => {
        setBroadcastResult({
          success: Boolean(payload?.success),
          inProgress: Boolean(payload?.inProgress),
          smtpConfigured: Boolean(payload?.smtpConfigured),
          deliveryMode: String(payload?.deliveryMode || 'QUEUED_NO_SMTP_CREDENTIALS'),
          totalTargeted: Number(payload?.totalTargeted || 0),
          processedCount: Number(payload?.processedCount || 0),
          deliveredCount: Number(payload?.deliveredCount || 0),
          queuedAwaitingSmtpCount: Number(payload?.queuedAwaitingSmtpCount || 0),
          failedCount: Number(payload?.failedCount || 0),
          message: String(payload?.message || ''),
          recipients: Array.isArray(payload?.recipients) ? payload.recipients : []
        });
      };

      let finalData = data;
      applyBroadcastData(finalData);

      // Poll if background live SMTP batch (>2 recipients)
      if (finalData?.inProgress) {
        for (let attempt = 0; attempt < 90; attempt++) {
          await new Promise(r => setTimeout(r, 2000));
          const pollRes = await fetch('/api/v1/admin/counter-offer-broadcast-status', {
            headers: { Accept: 'application/json' }
          });
          if (!pollRes.ok) break;
          const pollData = await pollRes.json().catch(() => null);
          if (!pollData) break;
          finalData = pollData;
          applyBroadcastData(pollData);
          if (!pollData.inProgress) break;
        }
      }

      if (Array.isArray(finalData?.recipients) && finalData.recipients.length > 0) {
        const nowIso = new Date().toISOString();
        const mappedHistory: DispatchedHistoryItem[] = finalData.recipients.slice(0, 25).map((r: any, idx: number) => ({
          id: `hist-co-${Date.now()}-${idx}`,
          recipientEmail: r.email,
          recipientName: r.name,
          companyName: r.companyName,
          subject: customBroadcastSubject.trim() || `🔔 Buyers Have Made Requests to Buy — Log In to Submit Your Counter Offer (${r.companyName})`,
          templatePreset: 'BUYER_REQUEST_COUNTER_OFFER_LISTED_CLIENT',
          messageId: r.messageId,
          trackingId: r.trackingId,
          dispatchedAt: r.dispatchedAt || nowIso,
          success: r.status === 'DELIVERED_SMTP',
          error: r.error
        }));
        setHistory(prev => [...mappedHistory, ...prev]);
      }

      await fetchMailSuiteTelemetry();
      await fetchListedClientsSummary();
    } catch (err: any) {
      setBroadcastResult({
        success: false,
        smtpConfigured: Boolean(listedClientsSummary?.smtpConfigured),
        deliveryMode: listedClientsSummary?.deliveryMode || 'UNKNOWN',
        totalTargeted: 0,
        processedCount: 0,
        deliveredCount: 0,
        queuedAwaitingSmtpCount: 0,
        failedCount: 0,
        message: err?.message || 'Network error while emailing listed clients.'
      });
    } finally {
      setIsBroadcastingCounterOffer(false);
    }
  };

  const handleSimulateMailSuiteEvent = async (trackingId: string, eventType: 'OPEN' | 'CLICK', targetUrl?: string) => {
    const key = `${trackingId}-${eventType}`;
    setSimulatingTrackKey(key);
    try {
      const res = await fetch('/api/v1/admin/mailsuite/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          trackingId,
          eventType,
          url: targetUrl || 'https://tradeheaven.org/?action=renew_subscription&company=IMPORTATION+FADE-TECH+(OTEC+LTD)&coupon=DIWALI10&amount=590',
          label: eventType === 'CLICK' ? 'Complete Full Plan Now ($590 Balance — Diwali Offer)' : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.analytics) setMailSuiteStats(data.analytics);
        await fetchMailSuiteTelemetry();
      }
    } catch {
      // ignore
    } finally {
      setSimulatingTrackKey(null);
    }
  };

  // History State
  const [history, setHistory] = useState<DispatchedHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('th_admin_dispatched_emails_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'hist-mark-johnson-15-buyers-generators-cranes',
        recipientEmail: 'mjohnson@atlanticpowerequip.com',
        recipientName: 'Mark Johnson (President)',
        companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
        subject: '⚡🏗️ Profile Activity & Inquiry Alert: 10 Buyers Visited Your Profile & Inquired to Buy Generators + 5 Buyers Inquired for Cranes',
        templatePreset: 'MARK_JOHNSON_15_BUYERS_GENERATORS_CRANES',
        messageId: '<mark-johnson-10-generators-5-cranes-buyers-2026@tradeheaven.net>',
        trackingId: 'ms-trk-mark-johnson-15-buyers-gen-cranes-2026',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-mark-johnson-15-buyers-admin-copy',
        recipientEmail: 'yr943334@gmail.com',
        recipientName: 'Admin Copy (yr943334@gmail.com) • Mark Johnson',
        companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
        subject: '[ADMIN COPY] ⚡🏗️ Profile Activity & Inquiry Alert: 10 Buyers Visited Your Profile & Inquired to Buy Generators + 5 Buyers Inquired for Cranes',
        templatePreset: 'MARK_JOHNSON_15_BUYERS_GENERATORS_CRANES',
        messageId: '<admin-copy-mark-johnson-10-generators-5-cranes-2026@tradeheaven.net>',
        trackingId: 'ms-trk-mark-johnson-15-buyers-admin-copy-2026',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-randy-10-buyers-petroleum',
        recipientEmail: 'randy@midforkcap.com',
        recipientName: 'Mr. Randy',
        companyName: 'Middle Fox LLC',
        subject: '⛽ Profile Activity & Inquiry Alert: 10 Verified Buyers Visited Your Middle Fox LLC Profile & Inquired to Buy Petroleum Products',
        templatePreset: 'RANDY_10_BUYERS_PETROLEUM_INQUIRIES',
        messageId: '<randy-10-buyers-profile-visit-petroleum-2026@tradeheaven.net>',
        trackingId: 'ms-trk-randy-10-buyers-petroleum-2026',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-zac-ads-failed-admin-demo',
        recipientEmail: 'yr943334@gmail.com',
        recipientName: 'Zachary Aldin (Zac)',
        companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
        subject: '⚠️ Urgent: Today\'s Ads Campaign Failed (Insufficient Plan Balance — $400 Paid) • Complete Full Plan or Account Will Pause + 🪔 Diwali Max Benefit Offer for IMPORTATION FADE-TECH (OTEC LTD)',
        templatePreset: 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI',
        messageId: '<demo-admin-zac-ads-failed-diwali-2026@tradeheaven.net>',
        trackingId: 'ms-trk-zac-demo-admin-2026',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-ali-basic-renewal-client',
        recipientEmail: 'ezekiahali355@gmail.com',
        recipientName: 'Ali Charley Ezekiah',
        companyName: 'ACE Intermediary',
        subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
        templatePreset: 'MEMBERSHIP_RENEWAL',
        messageId: '<basic-plan-renewal-ace-intermediary-2026@tradeheaven.net>',
        trackingId: 'ms-trk-ali-renewal-2026',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-ali-basic-renewal-admin-copy',
        recipientEmail: 'yr943334@gmail.com',
        recipientName: 'Ali Charley Ezekiah',
        companyName: 'ACE Intermediary',
        subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
        templatePreset: 'MEMBERSHIP_RENEWAL',
        messageId: '<admin-copy-basic-plan-renewal-ace-intermediary-2026@tradeheaven.net>',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-randy-initial',
        recipientEmail: 'randy@midforkcap.com',
        recipientName: 'Mr. Randy',
        companyName: 'Middle Fox LLC',
        subject: 'Welcome to Trade Heaven: Your Middle Fox LLC Fuel Supplier Portal Credentials & Active Inquiries',
        templatePreset: 'RANDY_FUEL_SUPPLIER',
        messageId: '<05c6f0d2-89f4-1d3c-2c3d-2314594ca5c1@tradeheaven.net>',
        trackingId: 'ms-trk-randy-001',
        dispatchedAt: new Date(Date.now() - 3600000).toISOString(),
        success: true
      },
      {
        id: 'hist-donald-initial',
        recipientEmail: 'sorkindon@gmail.com',
        recipientName: 'Donald Sorkin',
        companyName: 'Girlsenberries',
        subject: 'Action Required: High-Value Buyer Inquiry for Girlsenberries on Trade Heaven Portal',
        templatePreset: 'DONALD_BUYER_INQUIRY',
        messageId: '<b92418ca-d102-4ef1-98ab-819238471201@tradeheaven.net>',
        trackingId: 'ms-trk-donald-001',
        dispatchedAt: new Date(Date.now() - 86400000).toISOString(),
        success: true
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('th_admin_dispatched_emails_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const toggleBuiltinSection = (key: BuiltinSectionKey, visible?: boolean) => {
    setSectionVisibility(prev => {
      const nextVal = typeof visible === 'boolean' ? visible : !prev[key];
      if (key === 'credentialsBox') {
        setFormData(fd => ({ ...fd, includeCredentialsBox: nextVal }));
      } else if (key === 'loginGuide') {
        setFormData(fd => ({ ...fd, includeLoginGuide: nextVal }));
      } else if (key === 'escrowBadge') {
        setFormData(fd => ({ ...fd, includeEscrowBadge: nextVal }));
      }
      if (!nextVal && editingSectionKey === key) {
        setEditingSectionKey(null);
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const handleAddCustomSection = (tone: CustomEmailSectionBlock['tone'] = 'info') => {
    const newId = `custom-sec-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const newSec: CustomEmailSectionBlock = {
      id: newId,
      title: 'New Custom Mail Section',
      badge: 'IMPORTANT NOTICE',
      body: 'Write your custom section text, terms, bank details, or trade instructions here...',
      tone
    };
    setCustomSections(prev => [...prev, newSec]);
    setEditingSectionKey(newId);
  };

  const handleUpdateCustomSection = (id: string, patch: Partial<CustomEmailSectionBlock>) => {
    setCustomSections(prev => prev.map(sec => (sec.id === id ? { ...sec, ...patch } : sec)));
  };

  const handleDeleteCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(sec => sec.id !== id));
    if (editingSectionKey === id) setEditingSectionKey(null);
  };

  const handleMoveCustomSection = (index: number, direction: -1 | 1) => {
    setCustomSections(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const matched = PRESET_TEMPLATES.find(p => p.id === presetId);
    if (!matched) return;
    setFormData({
      ...matched.data,
      inquiries: (matched.data.inquiries || []).map(inq => ({ ...inq }))
    });
    setSectionVisibility({
      headerBanner: true,
      greetingIntro: true,
      billingSummary: Boolean(matched.data.address || matched.data.paymentMethod || matched.data.isMembershipRenewal || presetId === 'MEMBERSHIP_RENEWAL'),
      credentialsBox: matched.data.includeCredentialsBox !== false,
      loginGuide: matched.data.includeLoginGuide !== false,
      inquiries: Boolean(matched.data.inquiries && matched.data.inquiries.length > 0),
      ctaButton: Boolean(matched.data.ctaText || matched.data.ctaUrl || matched.data.portalUrl),
      closingNote: Boolean(matched.data.customClosingNote),
      escrowBadge: matched.data.includeEscrowBadge !== false,
      footer: true
    });
    setCustomSections((matched.defaultCustomSections || []).map(sec => ({ ...sec })));
    setBillingSectionBadge(
      presetId === 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI'
        ? '$400 PAID • $590 BALANCE (DIWALI10)'
        : presetId === 'GLOBAL_AD_CAMPAIGN_VISIBILITY_REPORT'
        ? 'ACTIVE GLOBAL AD CAMPAIGN'
        : 'CURRENT OFFER ACTIVE'
    );
    setEditingSectionKey(null);
    setSendResult(null);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const cleanCompany = (formData.companyName || 'Trade').replace(/[^a-zA-Z]/g, '').slice(0, 6);
    const generated = `${cleanCompany}@${rand}`;
    setFormData(prev => ({ ...prev, loginPassword: generated }));
  };

  const handleAddInquiry = () => {
    const newInq: CustomAdminInquiryItem = {
      id: `RFQ-LEAD-${Date.now().toString().slice(-4)}`,
      title: 'New Custom Buyer RFQ / Tender',
      buyerCompany: 'Verified Institutional Buyer',
      buyerCountry: 'International',
      quantity: '10,000 Units',
      estimatedValue: '$500,000 USD',
      incotermPort: 'CIF Port of Destination',
      paymentTerms: 'Irrevocable DLC / Trade Heaven Escrow',
      urgency: 'HIGH'
    };
    setFormData(prev => ({
      ...prev,
      inquiries: [...(prev.inquiries || []), newInq]
    }));
    setSectionVisibility(prev => ({ ...prev, inquiries: true }));
  };

  const handleUpdateInquiry = (index: number, field: keyof CustomAdminInquiryItem, value: any) => {
    setFormData(prev => {
      const copy = [...(prev.inquiries || [])];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, inquiries: copy };
    });
  };

  const handleRemoveInquiry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inquiries: (prev.inquiries || []).filter((_, i) => i !== index)
    }));
  };

  // Single Source of Truth: Generates the exact HTML dispatched so the Live Preview & Delivered Email match 100%
  const buildComposedEmailHtml = (): string => {
    const recipientDisplay = formData.decisionMakerName || formData.recipientName || 'Trade Partner';
    const companyDisplay = formData.companyName || 'Corporate Entity';
    const portalUrl = formData.portalUrl || 'https://www.tradeheaven.net';
    const ctaUrl = formData.ctaUrl || portalUrl;
    const ctaText = formData.ctaText || 'Log In to Portal & View Inquiries →';
    const isDangerHero = selectedPreset === 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI';
    const parts: string[] = [];

    if (sectionVisibility.headerBanner) {
      const heroBg = isDangerHero
        ? 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%)';
      const badgeStyle = isDangerHero
        ? 'color:#fecaca;background:rgba(239,68,68,0.2);border:1px solid rgba(248,113,113,0.4);'
        : 'color:#34d399;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);';
      parts.push(`
        <div style="background:${heroBg};padding:32px 24px;text-align:center;color:#ffffff;">
          <div style="display:inline-block;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;padding:4px 12px;border-radius:9999px;${badgeStyle}">
            ${escapeEmailHtml(formData.badgeLabel || 'TRADE HEAVEN • GLOBAL B2B DESK')}
          </div>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.25;">
            ${escapeEmailHtml(formData.headline || formData.subject || 'Trade Heaven Portal Notification')}
          </h1>
          ${formData.subheadline ? `<p style="margin:8px 0 0 0;font-size:13px;color:#cbd5e1;">${escapeEmailHtml(formData.subheadline)}</p>` : ''}
        </div>
      `);
    }

    const bodyBlocks: string[] = [];

    if (sectionVisibility.greetingIntro) {
      bodyBlocks.push(`
        <p style="font-size:15px;line-height:1.6;margin:0 0 14px 0;color:#0f172a;">
          ${escapeEmailHtml(greetingPrefix || 'Dear')} <strong>${escapeEmailHtml(recipientDisplay)}</strong>,
        </p>
        <div style="font-size:14px;line-height:1.65;margin:0 0 20px 0;color:#334155;">
          ${formatEmailMultilineHtml(formData.introMessage || '')}
        </div>
      `);
    }

    if (sectionVisibility.billingSummary) {
      bodyBlocks.push(`
        <div style="background:#f8fafc;border:2px solid #cbd5e1;border-radius:12px;padding:16px 18px;margin:0 0 18px 0;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
            <tr>
              <td style="font-size:11px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.6px;">${escapeEmailHtml(billingSectionTitle)}</td>
              <td style="text-align:right;">
                <span style="background:#fef3c7;color:#78350f;border:1px solid #fcd34d;font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px;">${escapeEmailHtml(billingSectionBadge)}</span>
              </td>
            </tr>
          </table>
          <table style="width:100%;border-collapse:collapse;font-size:12px;color:#334155;">
            <tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Company Name:</td><td style="padding:4px 0;text-align:right;font-weight:800;color:#0f172a;">${escapeEmailHtml(companyDisplay)}</td></tr>
            ${formData.address ? `<tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Address:</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${escapeEmailHtml(formData.address)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Email:</td><td style="padding:4px 0;text-align:right;font-family:monospace;font-weight:700;color:#1d4ed8;">${escapeEmailHtml(formData.recipientEmail || '')}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Decision Maker:</td><td style="padding:4px 0;text-align:right;font-weight:800;color:#0f172a;">${escapeEmailHtml(recipientDisplay)}</td></tr>
            ${formData.paymentMethod ? `<tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Payment Method:</td><td style="padding:4px 0;text-align:right;font-weight:800;color:#065f46;">${escapeEmailHtml(formData.paymentMethod)}</td></tr>` : ''}
          </table>
        </div>
      `);
    }

    if (sectionVisibility.credentialsBox && formData.includeCredentialsBox !== false) {
      bodyBlocks.push(`
        <div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:16px 18px;margin:0 0 18px 0;">
          <div style="font-size:11px;font-weight:900;color:#1e3a8a;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px;">
            PORTAL LOGIN CREDENTIALS &amp; USER ID
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;color:#334155;">
            <tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Portal Website:</td><td style="padding:4px 0;text-align:right;"><a href="${escapeEmailHtml(portalUrl)}" style="color:#2563eb;font-weight:700;">${escapeEmailHtml(portalUrl)}</a></td></tr>
            <tr><td style="padding:4px 0;color:#64748b;font-weight:600;">User ID / Login:</td><td style="padding:4px 0;text-align:right;font-family:monospace;font-weight:700;color:#0f172a;">${escapeEmailHtml(formData.loginEmail || formData.recipientEmail || '')}</td></tr>
            ${formData.loginPassword ? `<tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Assigned Password:</td><td style="padding:4px 0;text-align:right;font-family:monospace;font-weight:700;color:#1d4ed8;">${escapeEmailHtml(formData.loginPassword)}</td></tr>` : ''}
            ${formData.contactPhone ? `<tr><td style="padding:4px 0;color:#64748b;font-weight:600;">Registered Phone:</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${escapeEmailHtml(formData.contactPhone)}</td></tr>` : ''}
          </table>
        </div>
      `);
    }

    if (sectionVisibility.loginGuide && formData.includeLoginGuide !== false && loginGuideSteps.length > 0) {
      const stepsHtml = loginGuideSteps
        .filter(s => s.trim())
        .map(step => `<li style="margin-bottom:6px;">${escapeEmailHtml(step)}</li>`)
        .join('');
      bodyBlocks.push(`
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin:0 0 18px 0;">
          <div style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
            ${escapeEmailHtml(loginGuideTitle)}
          </div>
          <ol style="margin:0;padding-left:18px;font-size:12px;color:#475569;line-height:1.6;">
            ${stepsHtml}
          </ol>
        </div>
      `);
    }

    if (sectionVisibility.inquiries && formData.inquiries && formData.inquiries.length > 0) {
      const cards = formData.inquiries
        .map((inq, idx) => {
          const borderColors = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed'];
          const accent = borderColors[idx % borderColors.length];
          return `
            <div style="background:#ffffff;border:1px solid #cbd5e1;border-left:4px solid ${accent};border-radius:10px;padding:14px 16px;margin:0 0 12px 0;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
                <tr>
                  <td><span style="font-size:11px;font-family:monospace;font-weight:700;color:${accent};background:#f8fafc;padding:2px 6px;border-radius:4px;border:1px solid #e2e8f0;">${escapeEmailHtml(inq.id || `RFQ-${idx + 1}`)}</span></td>
                  <td style="text-align:right;font-size:11px;font-weight:800;color:#059669;">${inq.estimatedValue ? `Est: ${escapeEmailHtml(inq.estimatedValue)}` : ''}</td>
                </tr>
              </table>
              <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:6px;">${escapeEmailHtml(inq.title)}</div>
              <div style="font-size:12px;color:#475569;line-height:1.5;">
                ${inq.buyerCompany ? `<div><strong>Buyer:</strong> ${escapeEmailHtml(inq.buyerCompany)}${inq.buyerCountry ? ` (${escapeEmailHtml(inq.buyerCountry)})` : ''}</div>` : ''}
                ${inq.quantity ? `<div><strong>Volume:</strong> ${escapeEmailHtml(inq.quantity)}</div>` : ''}
                ${inq.incotermPort ? `<div><strong>Incoterms:</strong> ${escapeEmailHtml(inq.incotermPort)}</div>` : ''}
                ${inq.paymentTerms ? `<div><strong>Payment:</strong> ${escapeEmailHtml(inq.paymentTerms)}</div>` : ''}
              </div>
            </div>
          `;
        })
        .join('');
      bodyBlocks.push(`
        <div style="margin:0 0 18px 0;">
          <div style="border-bottom:2px solid #0f172a;padding-bottom:6px;margin-bottom:12px;font-size:13px;font-weight:900;color:#0f172a;text-transform:uppercase;">
            ${escapeEmailHtml(formData.inquiriesTitle || 'Active Buyer Inquiries / Matched Tenders')} (${formData.inquiries.length})
          </div>
          ${cards}
        </div>
      `);
    }

    // Custom User-Added Sections
    const toneStyles: Record<CustomEmailSectionBlock['tone'], { bg: string; border: string; title: string; badgeBg: string; badgeText: string }> = {
      neutral: { bg: '#f8fafc', border: '#cbd5e1', title: '#0f172a', badgeBg: '#e2e8f0', badgeText: '#334155' },
      info: { bg: '#eff6ff', border: '#93c5fd', title: '#1e3a8a', badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
      warning: { bg: '#fffbeb', border: '#fcd34d', title: '#78350f', badgeBg: '#fef3c7', badgeText: '#92400e' },
      success: { bg: '#ecfdf5', border: '#6ee7b7', title: '#065f46', badgeBg: '#d1fae5', badgeText: '#047857' },
      danger: { bg: '#fef2f2', border: '#fca5a5', title: '#7f1d1d', badgeBg: '#fee2e2', badgeText: '#b91c1c' }
    };
    for (const sec of customSections) {
      const ts = toneStyles[sec.tone] || toneStyles.neutral;
      bodyBlocks.push(`
        <div style="background:${ts.bg};border:1px solid ${ts.border};border-radius:12px;padding:16px 18px;margin:0 0 18px 0;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
            <tr>
              <td style="font-size:13px;font-weight:800;color:${ts.title};">${escapeEmailHtml(sec.title)}</td>
              ${sec.badge ? `<td style="text-align:right;"><span style="background:${ts.badgeBg};color:${ts.badgeText};font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px;text-transform:uppercase;">${escapeEmailHtml(sec.badge)}</span></td>` : ''}
            </tr>
          </table>
          <div style="font-size:13px;line-height:1.6;color:#334155;">
            ${formatEmailMultilineHtml(sec.body)}
          </div>
        </div>
      `);
    }

    if (sectionVisibility.closingNote && formData.customClosingNote && formData.customClosingNote.trim()) {
      bodyBlocks.push(`
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin:0 0 18px 0;font-size:13px;color:#78350f;line-height:1.6;">
          ${formatEmailMultilineHtml(formData.customClosingNote)}
        </div>
      `);
    }

    if (sectionVisibility.ctaButton && ctaText.trim()) {
      bodyBlocks.push(`
        <div style="text-align:center;margin:22px 0;">
          <a href="${escapeEmailHtml(ctaUrl)}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;padding:13px 28px;border-radius:10px;">
            ${escapeEmailHtml(ctaText)}
          </a>
        </div>
      `);
    }

    if (sectionVisibility.escrowBadge && formData.includeEscrowBadge !== false && escrowNoticeText.trim()) {
      bodyBlocks.push(`
        <div style="background:#f1f5f9;border-radius:10px;padding:12px 14px;margin:0 0 16px 0;font-size:11px;color:#475569;line-height:1.55;">
          <strong style="color:#0f172a;">Trade Heaven Escrow Protection:</strong> ${escapeEmailHtml(escrowNoticeText)}
        </div>
      `);
    }

    if (sectionVisibility.footer && footerText.trim()) {
      bodyBlocks.push(`
        <div style="padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
          ${escapeEmailHtml(footerText)}
        </div>
      `);
    }

    parts.push(`<div style="padding:26px 24px;background:#ffffff;color:#1e293b;">${bodyBlocks.join('')}</div>`);

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:20px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">${parts.join('')}</div></body></html>`;
  };

  const handleSendEmail = async (targetMode: 'ADMIN' | 'CLIENT' | 'BOTH' = 'BOTH') => {
    const cleanClientEmail = (formData.recipientEmail || '').trim();
    const cleanAdminEmail = (adminCopyEmail || '').trim();

    if ((targetMode === 'CLIENT' || targetMode === 'BOTH') && (!cleanClientEmail || !cleanClientEmail.includes('@'))) {
      setSendResult({
        success: false,
        message: 'Please provide a valid client recipient email address.'
      });
      return;
    }
    if ((targetMode === 'ADMIN' || targetMode === 'BOTH') && (!cleanAdminEmail || !cleanAdminEmail.includes('@'))) {
      setSendResult({
        success: false,
        message: 'Please provide a valid admin email address.'
      });
      return;
    }
    if (!formData.subject) {
      setSendResult({
        success: false,
        message: 'Please provide an email subject line.'
      });
      return;
    }

    setIsSending(true);
    setSendingTarget(targetMode);
    setSendResult(null);

    const composedHtml = buildComposedEmailHtml();
    const basePayload = {
      ...formData,
      rawHtmlOverride: composedHtml,
      includeCredentialsBox: sectionVisibility.credentialsBox && formData.includeCredentialsBox !== false,
      includeLoginGuide: sectionVisibility.loginGuide && formData.includeLoginGuide !== false,
      includeEscrowBadge: sectionVisibility.escrowBadge && formData.includeEscrowBadge !== false,
      dispatchType: 'MANUAL' as const
    };

    const requestPayload =
      targetMode === 'ADMIN'
        ? {
            ...basePayload,
            recipientEmail: cleanAdminEmail,
            sendAdminCopy: false,
            adminCopyEmail: cleanAdminEmail
          }
        : targetMode === 'CLIENT'
        ? {
            ...basePayload,
            recipientEmail: cleanClientEmail,
            sendAdminCopy: false
          }
        : {
            ...basePayload,
            recipientEmail: cleanClientEmail,
            sendAdminCopy: true,
            adminCopyEmail: cleanAdminEmail
          };

    try {
      let data: any = null;
      let usedEndpoint = '/api/v1/admin/send-custom-email';

      try {
        const response = await fetch('/api/v1/admin/send-custom-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestPayload)
        });
        const parsed = await response.json().catch(() => null);
        if (response.ok && parsed && parsed.status !== 'fallback') {
          data = parsed;
        }
      } catch {
        // Fall through to PHP endpoint
      }

      // Automatic fallback to PHP endpoint (works on live Apache/PHP hosting & external Chrome windows)
      if (!data) {
        usedEndpoint = '/api.php?action=send_custom_email';
        const phpResponse = await fetch('/api.php?action=send_custom_email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestPayload)
        });
        data = await phpResponse.json().catch(() => ({
          success: false,
          message: `Mail gateway returned an invalid response (HTTP ${phpResponse.status}).`
        }));
      }

      if (data?.success) {
        const nowIso = data.dispatchedAt || data.receipt?.dispatchedAt || new Date().toISOString();
        const itemsToAdd: DispatchedHistoryItem[] = [];
        if (targetMode === 'ADMIN') {
          itemsToAdd.push({
            id: `hist-admin-only-${Date.now()}`,
            recipientEmail: cleanAdminEmail,
            recipientName: `Admin (${cleanAdminEmail}) • ${formData.recipientName || 'Trade Partner'}`,
            companyName: formData.companyName || 'Corporate Entity',
            subject: formData.subject,
            templatePreset: selectedPreset,
            messageId: data.receipt?.messageId || data.messageId,
            trackingId: data.receipt?.trackingId || data.trackingId,
            dispatchedAt: nowIso,
            deliveryMode: data.receipt?.deliveryMode || data.deliveryMode,
            success: true
          });
        } else {
          itemsToAdd.push({
            id: `hist-${Date.now()}`,
            recipientEmail: cleanClientEmail,
            recipientName: formData.recipientName || 'Trade Partner',
            companyName: formData.companyName || 'Corporate Entity',
            subject: formData.subject,
            templatePreset: selectedPreset,
            messageId: data.receipt?.messageId || data.messageId,
            trackingId: data.receipt?.trackingId || data.trackingId,
            dispatchedAt: nowIso,
            deliveryMode: data.receipt?.deliveryMode || data.deliveryMode,
            success: true
          });
          if (targetMode === 'BOTH' && cleanAdminEmail) {
            itemsToAdd.push({
              id: `hist-admin-${Date.now() + 1}`,
              recipientEmail: cleanAdminEmail,
              recipientName: `Admin Copy • ${formData.recipientName || 'Trade Partner'}`,
              companyName: formData.companyName || 'Corporate Entity',
              subject: formData.subject,
              templatePreset: selectedPreset,
              messageId: data.adminCopyReceipt?.messageId || `<admin-copy-${Date.now()}@tradeheaven.net>`,
              trackingId: data.adminCopyReceipt?.trackingId,
              dispatchedAt: nowIso,
              deliveryMode: data.adminCopyReceipt?.deliveryMode || data.deliveryMode,
              success: data.adminCopyReceipt ? data.adminCopyReceipt.success !== false : true
            });
          }
        }
        setHistory(prev => [...itemsToAdd, ...prev]);

        // Notify other open Chrome windows / tabs AND same-tab email dashboards immediately
        try {
          window.dispatchEvent(new Event('tradeheaven_email_history_updated'));
        } catch {}
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('th_admin_email_history_sync');
            bc.postMessage({ type: 'EMAIL_SENT', at: Date.now(), endpoint: usedEndpoint });
            bc.close();
          }
        } catch {}

        // Refresh server-persisted history so all windows stay in lockstep
        await fetchMailSuiteTelemetry();

        setSendResult({
          success: true,
          message:
            targetMode === 'ADMIN'
              ? `Shared to Admin (${cleanAdminEmail}) only & recorded in Email History.`
              : targetMode === 'CLIENT'
              ? `Shared to Client (${cleanClientEmail}) only & recorded in Email History.`
              : data.message || `Email delivered to ${cleanClientEmail} + Admin Copy sent to ${cleanAdminEmail} & recorded in Email History.`,
          messageId: data.receipt?.messageId || data.messageId,
          trackingId: data.receipt?.trackingId || data.trackingId,
          dispatchedAt: new Date().toLocaleTimeString()
        });
      } else {
        const failRecipient = targetMode === 'ADMIN' ? cleanAdminEmail : cleanClientEmail;
        const failItem: DispatchedHistoryItem = {
          id: `hist-${Date.now()}`,
          recipientEmail: failRecipient,
          recipientName: formData.recipientName || 'Trade Partner',
          companyName: formData.companyName || 'Corporate Entity',
          subject: formData.subject,
          templatePreset: selectedPreset,
          dispatchedAt: new Date().toISOString(),
          success: false,
          error: data?.message || 'SMTP transmission failed'
        };
        setHistory(prev => [failItem, ...prev]);
        await fetchMailSuiteTelemetry();
        setSendResult({
          success: false,
          message: data?.message || 'Mail delivery failed across SMTP and PHP relay.'
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Network error while attempting to dispatch email.'
      });
    } finally {
      setIsSending(false);
      setSendingTarget(null);
    }
  };

  const handleSendDemoMailToAdmin = async () => {
    const targetAdmin = (adminCopyEmail || 'yr943334@gmail.com').trim();
    setIsSendingDemoAdmin(true);
    setSendResult(null);
    try {
      const response = await fetch('/api/v1/admin/send-zac-ads-failed-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          companyName: formData.companyName || 'IMPORTATION FADE-TECH (OTEC LTD)',
          address: formData.address || '42a Bassett street hurstville, New South Wales 2220, Australia',
          email: formData.recipientEmail || 'zac@otec.ltd',
          decisionMakerName: formData.decisionMakerName || formData.recipientName || 'Zachary Aldin (Zac)',
          contactPhone: formData.contactPhone || '+61 424 854 899',
          paymentMethod: formData.paymentMethod || 'Bank Wire / Card Settlement',
          amountPaidUsd: 400,
          standardPlanAmountUsd: 1100,
          diwaliDiscountedPlanUsd: 990,
          remainingBalanceUsd: formData.renewalAmountUsd || 590,
          invoiceRef: 'TRD-INV-27-0004',
          isDemoOnAdmin: true,
          demoAdminEmail: targetAdmin
        })
      });
      const data = await response.json();
      const nowIso = new Date().toISOString();
      const demoHistItem: DispatchedHistoryItem = {
        id: `hist-demo-admin-${Date.now()}`,
        recipientEmail: targetAdmin,
        recipientName: formData.decisionMakerName || formData.recipientName || 'Zachary Aldin (Zac)',
        companyName: formData.companyName || 'IMPORTATION FADE-TECH (OTEC LTD)',
        subject: formData.subject,
        templatePreset: selectedPreset,
        messageId: data?.receipt?.messageId || `<demo-admin-zac-${Date.now()}@tradeheaven.net>`,
        trackingId: data?.trackingId || data?.receipt?.trackingId || 'ms-trk-zac-demo-admin-2026',
        dispatchedAt: nowIso,
        success: Boolean(data?.success)
      };
      setHistory(prev => [demoHistItem, ...prev]);
      if (data?.mailSuiteStats) setMailSuiteStats(data.mailSuiteStats);
      await fetchMailSuiteTelemetry();
      setSendResult({
        success: Boolean(data?.success),
        message:
          data?.message ||
          `Demo Mail for Zac ($400 Paid Basic Plan — Ads Failed + Diwali Max Benefit) dispatched to Admin (${targetAdmin}) with MailSuite Read-Receipt Tracking!`,
        messageId: data?.receipt?.messageId,
        trackingId: data?.trackingId || data?.receipt?.trackingId,
        trackingPixelUrl: data?.trackingPixelUrl,
        dispatchedAt: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Network error while dispatching Demo Mail to Admin.'
      });
    } finally {
      setIsSendingDemoAdmin(false);
    }
  };

  const handleSendLiveZacEmail = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const response = await fetch('/api/v1/admin/send-zac-ads-failed-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          companyName: formData.companyName || 'IMPORTATION FADE-TECH (OTEC LTD)',
          address: formData.address || '42a Bassett street hurstville, New South Wales 2220, Australia',
          email: formData.recipientEmail || 'zac@otec.ltd',
          decisionMakerName: formData.decisionMakerName || formData.recipientName || 'Zachary Aldin (Zac)',
          contactPhone: formData.contactPhone || '+61 424 854 899',
          paymentMethod: formData.paymentMethod || 'Bank Wire / Card Settlement',
          amountPaidUsd: 400,
          standardPlanAmountUsd: 1100,
          diwaliDiscountedPlanUsd: 990,
          remainingBalanceUsd: formData.renewalAmountUsd || 590,
          invoiceRef: 'TRD-INV-27-0004',
          isDemoOnAdmin: false,
          sendAdminCopy,
          adminCopyEmail
        })
      });
      const data = await response.json();
      const nowIso = new Date().toISOString();
      const liveHistItem: DispatchedHistoryItem = {
        id: `hist-live-zac-${Date.now()}`,
        recipientEmail: formData.recipientEmail || 'zac@otec.ltd',
        recipientName: formData.decisionMakerName || 'Zachary Aldin (Zac)',
        companyName: formData.companyName || 'IMPORTATION FADE-TECH (OTEC LTD)',
        subject: formData.subject,
        templatePreset: selectedPreset,
        messageId: data?.receipt?.messageId || `<live-zac-${Date.now()}@tradeheaven.net>`,
        trackingId: data?.trackingId || data?.receipt?.trackingId,
        dispatchedAt: nowIso,
        success: Boolean(data?.success)
      };
      setHistory(prev => [liveHistItem, ...prev]);
      if (data?.mailSuiteStats) setMailSuiteStats(data.mailSuiteStats);
      await fetchMailSuiteTelemetry();
      setSendResult({
        success: Boolean(data?.success),
        message:
          data?.message ||
          `Live Email dispatched to Zac (${formData.recipientEmail || 'zac@otec.ltd'}) + Admin Copy sent to ${adminCopyEmail} with MailSuite Open & Click Tracking!`,
        messageId: data?.receipt?.messageId,
        trackingId: data?.trackingId || data?.receipt?.trackingId,
        trackingPixelUrl: data?.trackingPixelUrl,
        dispatchedAt: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Network error while dispatching Live Mail to Zac.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const [isSendingMelissaAlert, setIsSendingMelissaAlert] = useState(false);
  const [melissaAlertResult, setMelissaAlertResult] = useState<{ success: boolean; message: string; trackingId?: string } | null>(null);

  const handleSendMelissaUnclaimedFundsAlert = async () => {
    setIsSendingMelissaAlert(true);
    setMelissaAlertResult(null);
    try {
      const res = await fetch('/api/v1/admin/send-melissa-unclaimed-funds-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          melissaEmail: 'melissa@mpcommoditybrokers.com',
          adminEmail: 'sankalprajput15@gmail.com',
          secondaryAdminEmail: 'yr943334@gmail.com',
          amountFormatted: '$50,000.00 USD',
          hoursInAccount: 12,
          hoursDeadline: 48,
          hoursRemaining: 36,
          sendAdminCopy: true
        })
      });
      const data = await res.json();
      if (data?.success) {
        setMelissaAlertResult({
          success: true,
          message: '⏳ 48-Hour Unclaimed Funds Alert successfully dispatched to Melissa Prezios (melissa@mpcommoditybrokers.com) and admin copies (sankalprajput15@gmail.com & yr943334@gmail.com)!',
          trackingId: data?.melissaReceipt?.trackingId
        });
        await fetchMailSuiteTelemetry();
      } else {
        setMelissaAlertResult({
          success: false,
          message: data?.message || 'Failed to dispatch alert to Melissa'
        });
      }
    } catch (err: any) {
      setMelissaAlertResult({
        success: false,
        message: err?.message || 'Network error dispatching alert to Melissa'
      });
    } finally {
      setIsSendingMelissaAlert(false);
    }
  };

  const [isSendingMelissaVip, setIsSendingMelissaVip] = useState(false);
  const [melissaVipResult, setMelissaVipResult] = useState<{ success: boolean; message: string; trackingId?: string } | null>(null);

  const handleSendMelissaVipAgreement = async () => {
    setIsSendingMelissaVip(true);
    setMelissaVipResult(null);
    try {
      const res = await fetch('/api/v1/admin/send-melissa-vip-upgrade-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          melissaEmail: 'melissa@mpcommoditybrokers.com',
          adminEmail: 'sankalprajput15@gmail.com',
          secondaryAdminEmail: 'yr943334@gmail.com',
          sendAdminCopy: true
        })
      });
      const data = await res.json();
      if (data?.success) {
        setMelissaVipResult({
          success: true,
          message: '✅ VIP Upgrade & 30-Day Service Agreement successfully dispatched to Melissa Prezios (melissa@mpcommoditybrokers.com) and admin audit copies!',
          trackingId: data?.melissaReceipt?.trackingId
        });
        await fetchMailSuiteTelemetry();
      } else {
        setMelissaVipResult({
          success: false,
          message: data?.message || 'Failed to dispatch VIP agreement email to Melissa'
        });
      }
    } catch (err: any) {
      setMelissaVipResult({
        success: false,
        message: err?.message || 'Network error dispatching VIP agreement email'
      });
    } finally {
      setIsSendingMelissaVip(false);
    }
  };

  const [isSendingMelissaDealTimeline, setIsSendingMelissaDealTimeline] = useState(false);
  const [melissaDealTimelineResult, setMelissaDealTimelineResult] = useState<{ success: boolean; message: string; trackingId?: string } | null>(null);

  const handleSendMelissaDealTimelineAlert = async () => {
    setIsSendingMelissaDealTimeline(true);
    setMelissaDealTimelineResult(null);
    try {
      const res = await fetch('/api/v1/admin/send-melissa-deal-timeline-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          melissaEmail: 'melissa@mpcommoditybrokers.com',
          adminEmail: 'sankalprajput15@gmail.com',
          secondaryAdminEmail: 'yr943334@gmail.com',
          sendAdminCopy: true
        })
      });
      const data = await res.json();
      if (data?.success) {
        setMelissaDealTimelineResult({
          success: true,
          message: '📋 Deal & 6-Stage Execution Timeline Alert dispatched to Melissa Prezios (melissa@mpcommoditybrokers.com) and admin audit copies!',
          trackingId: data?.melissaReceipt?.trackingId
        });
        await fetchMailSuiteTelemetry();
      } else {
        setMelissaDealTimelineResult({
          success: false,
          message: data?.message || 'Failed to dispatch Deal & Timeline alert to Melissa'
        });
      }
    } catch (err: any) {
      setMelissaDealTimelineResult({
        success: false,
        message: err?.message || 'Network error dispatching Deal & Timeline alert'
      });
    } finally {
      setIsSendingMelissaDealTimeline(false);
    }
  };

  const deletedBuiltinSections = (Object.keys(sectionVisibility) as BuiltinSectionKey[]).filter(
    key => !sectionVisibility[key]
  );

  const renderSectionActionToolbar = (
    sectionId: string,
    label: string,
    onDelete: () => void,
    extraActions?: React.ReactNode
  ) => {
    const isEditing = editingSectionKey === sectionId;
    return (
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/95 text-white text-[10px] font-bold">
        <span className="uppercase tracking-wider text-slate-300 truncate">{label}</span>
        <div className="flex items-center gap-1 shrink-0">
          {extraActions}
          <button
            type="button"
            onClick={() => setEditingSectionKey(isEditing ? null : sectionId)}
            className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              isEditing ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-700 hover:bg-blue-600 text-white'
            }`}
          >
            {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-2 py-0.5 rounded bg-rose-600/90 hover:bg-rose-500 text-white flex items-center gap-1 cursor-pointer transition-colors"
            title={`Delete ${label}`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    );
  };

  const renderInteractiveEmailPreview = (embeddedInForm: boolean) => {
    const toneClasses: Record<CustomEmailSectionBlock['tone'], { box: string; title: string; badge: string }> = {
      neutral: { box: 'bg-slate-50 border-slate-300', title: 'text-slate-900', badge: 'bg-slate-200 text-slate-700' },
      info: { box: 'bg-blue-50 border-blue-300', title: 'text-blue-950', badge: 'bg-blue-100 text-blue-800' },
      warning: { box: 'bg-amber-50 border-amber-300', title: 'text-amber-950', badge: 'bg-amber-200 text-amber-900' },
      success: { box: 'bg-emerald-50 border-emerald-300', title: 'text-emerald-950', badge: 'bg-emerald-100 text-emerald-800' },
      danger: { box: 'bg-rose-50 border-rose-300', title: 'text-rose-950', badge: 'bg-rose-100 text-rose-800' }
    };

    const previewWidthClass =
      embeddedInForm && previewDevice === 'DESKTOP'
        ? 'w-full max-w-[640px]'
        : previewDevice === 'MOBILE'
        ? 'w-full max-w-[380px]'
        : 'w-full max-w-[640px]';

    return (
      <div className="space-y-3">
        {/* LIVE PREVIEW HEADER CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Live Outgoing Email Preview &amp; Section Editor
                </h3>
                <p className="text-[10px] text-slate-500">
                  Exact HTML dispatched to recipients — edit, add, reorder, or delete any section directly below
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddCustomSection('info')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('DESKTOP')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  previewDevice === 'DESKTOP' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('MOBILE')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  previewDevice === 'MOBILE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* LIVE ENVELOPE METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200 truncate">
              <span className="text-slate-400 font-bold">Client To: </span>
              <span className="font-mono font-bold text-blue-700">{formData.recipientEmail || 'None'}</span>
            </div>
            <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200 truncate">
              <span className="text-slate-400 font-bold">Admin Copy: </span>
              <span className="font-mono font-bold text-amber-700">{adminCopyEmail || 'None'}</span>
            </div>
            <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200 truncate">
              <span className="text-slate-400 font-bold">Subject: </span>
              <span className="font-bold text-slate-900">{formData.subject || '(No Subject)'}</span>
            </div>
          </div>

          {/* DELETED SECTIONS RESTORE BAR */}
          {deletedBuiltinSections.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 mr-1">
                <RotateCcw className="w-3 h-3" />
                <span>Add / Restore Hidden Sections:</span>
              </span>
              {deletedBuiltinSections.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleBuiltinSection(key, true)}
                  className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{BUILTIN_SECTION_LABELS[key]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LIVE RENDERED EMAIL CANVAS */}
        <div className="bg-slate-100 p-3 sm:p-5 rounded-2xl border border-slate-200 flex justify-center overflow-x-auto">
          <div className={`${previewWidthClass} bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 transition-all duration-200`}>

            {/* SECTION: HEADER BANNER */}
            {sectionVisibility.headerBanner && (
              <div className="border-b border-slate-200">
                {renderSectionActionToolbar('headerBanner', 'Section: Header Banner', () => toggleBuiltinSection('headerBanner', false))}
                {editingSectionKey === 'headerBanner' && (
                  <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Top Badge</label>
                        <input
                          type="text"
                          value={formData.badgeLabel || ''}
                          onChange={e => setFormData(prev => ({ ...prev, badgeLabel: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Headline</label>
                        <input
                          type="text"
                          value={formData.headline || ''}
                          onChange={e => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Subheadline</label>
                      <input
                        type="text"
                        value={formData.subheadline || ''}
                        onChange={e => setFormData(prev => ({ ...prev, subheadline: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}
                <div
                  style={{
                    background:
                      selectedPreset === 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI'
                        ? 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%)'
                  }}
                  className="p-6 sm:p-7 text-center text-white"
                >
                  <div
                    className={`inline-block text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full mb-2.5 border ${
                      selectedPreset === 'ZAC_ADS_CAMPAIGN_FAILED_DIWALI'
                        ? 'text-red-200 bg-red-500/20 border-red-400/40'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    {formData.badgeLabel || 'TRADE HEAVEN • GLOBAL B2B DESK'}
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                    {formData.headline || formData.subject || 'Trade Heaven Portal Notification'}
                  </h1>
                  {formData.subheadline && (
                    <p className="text-xs text-slate-300 mt-1.5">{formData.subheadline}</p>
                  )}
                </div>
              </div>
            )}

            {/* EMAIL BODY SECTIONS */}
            <div className="p-4 sm:p-6 space-y-4 text-slate-800">

              {/* SECTION: GREETING & INTRO BODY */}
              {sectionVisibility.greetingIntro && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {renderSectionActionToolbar('greetingIntro', 'Section: Greeting & Intro Message', () => toggleBuiltinSection('greetingIntro', false))}
                  {editingSectionKey === 'greetingIntro' && (
                    <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Greeting Prefix</label>
                          <input
                            type="text"
                            value={greetingPrefix}
                            onChange={e => setGreetingPrefix(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Recipient Name</label>
                          <input
                            type="text"
                            value={formData.decisionMakerName ?? formData.recipientName ?? ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                decisionMakerName: e.target.value,
                                recipientName: e.target.value
                              }))
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Main Message Body</label>
                        <textarea
                          rows={6}
                          value={formData.introMessage || ''}
                          onChange={e => setFormData(prev => ({ ...prev, introMessage: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-4 space-y-2.5">
                    <p className="text-sm text-slate-900">
                      {greetingPrefix || 'Dear'}{' '}
                      <strong>{formData.decisionMakerName || formData.recipientName || 'Trade Partner'}</strong>,
                    </p>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {formData.introMessage || 'Write your email body message here...'}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CLIENT MEMBERSHIP & BILLING SUMMARY */}
              {sectionVisibility.billingSummary && (
                <div className="rounded-xl border border-slate-300 overflow-hidden">
                  {renderSectionActionToolbar('billingSummary', 'Section: Membership & Billing Summary', () => toggleBuiltinSection('billingSummary', false))}
                  {editingSectionKey === 'billingSummary' && (
                    <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Box Title</label>
                          <input
                            type="text"
                            value={billingSectionTitle}
                            onChange={e => setBillingSectionTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Right Status Badge</label>
                          <input
                            type="text"
                            value={billingSectionBadge}
                            onChange={e => setBillingSectionBadge(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Company Name</label>
                          <input
                            type="text"
                            value={formData.companyName || ''}
                            onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Payment Method</label>
                          <input
                            type="text"
                            value={formData.paymentMethod || ''}
                            onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Registered Address</label>
                        <input
                          type="text"
                          value={formData.address || ''}
                          onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-900 tracking-wider uppercase gap-2">
                      <span>{billingSectionTitle}</span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-black">
                        {billingSectionBadge}
                      </span>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Company Name:</span>
                        <span className="font-extrabold text-slate-900 text-right">{formData.companyName || 'Corporate Entity'}</span>
                      </div>
                      {formData.address && (
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 font-semibold">Address:</span>
                          <span className="font-semibold text-slate-900 text-right">{formData.address}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Email:</span>
                        <span className="font-mono font-bold text-blue-700 text-right">{formData.recipientEmail || 'None'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Decision Maker:</span>
                        <span className="font-extrabold text-slate-900 text-right">
                          {formData.decisionMakerName || formData.recipientName || 'Trade Partner'}
                        </span>
                      </div>
                      {formData.paymentMethod && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500 font-semibold">Payment Method:</span>
                          <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-extrabold text-emerald-800">
                            {formData.paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PORTAL CREDENTIALS BOX */}
              {sectionVisibility.credentialsBox && formData.includeCredentialsBox !== false && (
                <div className="rounded-xl border-2 border-blue-400 overflow-hidden">
                  {renderSectionActionToolbar('credentialsBox', 'Section: Portal Login Credentials', () => toggleBuiltinSection('credentialsBox', false))}
                  {editingSectionKey === 'credentialsBox' && (
                    <div className="p-3 bg-white border-b border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Portal URL</label>
                        <input
                          type="text"
                          value={formData.portalUrl || ''}
                          onChange={e => setFormData(prev => ({ ...prev, portalUrl: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Login User ID</label>
                        <input
                          type="text"
                          value={formData.loginEmail || formData.recipientEmail || ''}
                          onChange={e => setFormData(prev => ({ ...prev, loginEmail: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Assigned Password</label>
                        <input
                          type="text"
                          value={formData.loginPassword || ''}
                          onChange={e => setFormData(prev => ({ ...prev, loginPassword: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Registered Phone</label>
                        <input
                          type="text"
                          value={formData.contactPhone || ''}
                          onChange={e => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50/70 p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-blue-900 tracking-wider uppercase">
                      <span>PORTAL LOGIN CREDENTIALS &amp; USER ID</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">VERIFIED ACCESS</span>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Portal Website:</span>
                        <span className="text-blue-600 font-bold underline truncate">{formData.portalUrl || 'https://www.tradeheaven.net'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">User ID / Login:</span>
                        <span className="font-mono font-bold text-slate-900">{formData.loginEmail || formData.recipientEmail}</span>
                      </div>
                      {formData.loginPassword && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500 font-semibold">Assigned Password:</span>
                          <span className="bg-white border border-blue-200 px-2 py-0.5 rounded font-mono font-bold text-blue-700">
                            {formData.loginPassword}
                          </span>
                        </div>
                      )}
                      {formData.contactPhone && (
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 font-semibold">Registered Phone:</span>
                          <span className="font-semibold text-slate-900">{formData.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: 3-STEP LOGIN GUIDE */}
              {sectionVisibility.loginGuide && formData.includeLoginGuide !== false && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {renderSectionActionToolbar('loginGuide', 'Section: Login Instructions', () => toggleBuiltinSection('loginGuide', false))}
                  {editingSectionKey === 'loginGuide' && (
                    <div className="p-3 bg-white border-b border-slate-200 space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Guide Heading</label>
                        <input
                          type="text"
                          value={loginGuideTitle}
                          onChange={e => setLoginGuideTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        {loginGuideSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 w-4">{sIdx + 1}.</span>
                            <input
                              type="text"
                              value={step}
                              onChange={e => {
                                const next = [...loginGuideSteps];
                                next[sIdx] = e.target.value;
                                setLoginGuideSteps(next);
                              }}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300"
                            />
                            <button
                              type="button"
                              onClick={() => setLoginGuideSteps(prev => prev.filter((_, i) => i !== sIdx))}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setLoginGuideSteps(prev => [...prev, 'New login instruction step...'])}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 space-y-2">
                    <div className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide">{loginGuideTitle}</div>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                      {loginGuideSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* SECTION: ACTIVE INQUIRIES / TENDERS */}
              {sectionVisibility.inquiries && formData.inquiries && formData.inquiries.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {renderSectionActionToolbar(
                    'inquiries',
                    `Section: Inquiries & Tenders (${formData.inquiries.length})`,
                    () => toggleBuiltinSection('inquiries', false),
                    <button
                      type="button"
                      onClick={handleAddInquiry}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                  {editingSectionKey === 'inquiries' && (
                    <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Section Header Title</label>
                        <input
                          type="text"
                          value={formData.inquiriesTitle || ''}
                          onChange={e => setFormData(prev => ({ ...prev, inquiriesTitle: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                        />
                      </div>
                      {formData.inquiries.map((inq, idx) => (
                        <div key={inq.id || idx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={inq.title || ''}
                              onChange={e => handleUpdateInquiry(idx, 'title', e.target.value)}
                              className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveInquiry(idx)}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={inq.buyerCompany || ''}
                              onChange={e => handleUpdateInquiry(idx, 'buyerCompany', e.target.value)}
                              placeholder="Buyer"
                              className="px-2 py-1 text-[11px] rounded border border-slate-200"
                            />
                            <input
                              type="text"
                              value={inq.estimatedValue || ''}
                              onChange={e => handleUpdateInquiry(idx, 'estimatedValue', e.target.value)}
                              placeholder="Est. Value"
                              className="px-2 py-1 text-[11px] rounded border border-slate-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-1.5">
                      <span className="text-xs font-black uppercase text-slate-900">
                        {formData.inquiriesTitle || 'Active Buyer Inquiries / Matched Tenders'}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {formData.inquiries.length} Active Leads
                      </span>
                    </div>
                    {formData.inquiries.map((inq, idx) => (
                      <div
                        key={inq.id || idx}
                        className="bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-xl p-3 space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {inq.id || `RFQ-${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            {inq.estimatedValue && (
                              <span className="font-extrabold text-emerald-700">Est: {inq.estimatedValue}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveInquiry(idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete this tender card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">{inq.title}</h4>
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          {inq.buyerCompany && <div><strong>Buyer:</strong> {inq.buyerCompany} {inq.buyerCountry ? `(${inq.buyerCountry})` : ''}</div>}
                          {inq.quantity && <div><strong>Volume:</strong> <span className="font-bold text-slate-800">{inq.quantity}</span></div>}
                          {inq.incotermPort && <div><strong>Terms:</strong> {inq.incotermPort}</div>}
                          {inq.paymentTerms && <div><strong>Payment:</strong> {inq.paymentTerms}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CUSTOM USER-ADDED SECTIONS */}
              {customSections.map((sec, idx) => {
                const tc = toneClasses[sec.tone] || toneClasses.neutral;
                return (
                  <div key={sec.id} className={`rounded-xl border overflow-hidden ${tc.box}`}>
                    {renderSectionActionToolbar(
                      sec.id,
                      `Custom Section #${idx + 1}: ${sec.title || 'Untitled'}`,
                      () => handleDeleteCustomSection(sec.id),
                      <>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveCustomSection(idx, -1)}
                          className="p-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white cursor-pointer"
                          title="Move section up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === customSections.length - 1}
                          onClick={() => handleMoveCustomSection(idx, 1)}
                          className="p-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white cursor-pointer"
                          title="Move section down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    {editingSectionKey === sec.id && (
                      <div className="p-3 bg-white border-b border-slate-200 space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Section Title</label>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={e => handleUpdateCustomSection(sec.id, { title: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Badge (Optional)</label>
                            <input
                              type="text"
                              value={sec.badge}
                              onChange={e => handleUpdateCustomSection(sec.id, { badge: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500">Style:</span>
                          {(['neutral', 'info', 'warning', 'success', 'danger'] as const).map(toneOpt => (
                            <button
                              key={toneOpt}
                              type="button"
                              onClick={() => handleUpdateCustomSection(sec.id, { tone: toneOpt })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                                sec.tone === toneOpt
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {toneOpt}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Section Content</label>
                          <textarea
                            rows={4}
                            value={sec.body}
                            onChange={e => handleUpdateCustomSection(sec.id, { body: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-black ${tc.title}`}>{sec.title || 'Custom Section'}</h4>
                        {sec.badge && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${tc.badge}`}>
                            {sec.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{sec.body}</div>
                    </div>
                  </div>
                );
              })}

              {/* SECTION: CUSTOM CLOSING NOTE */}
              {sectionVisibility.closingNote && (
                <div className="rounded-xl border border-amber-200 overflow-hidden bg-amber-50/70">
                  {renderSectionActionToolbar('closingNote', 'Section: Custom Closing Note', () => toggleBuiltinSection('closingNote', false))}
                  {editingSectionKey === 'closingNote' && (
                    <div className="p-3 bg-white border-b border-amber-200 text-xs">
                      <textarea
                        rows={3}
                        value={formData.customClosingNote || ''}
                        onChange={e => setFormData(prev => ({ ...prev, customClosingNote: e.target.value }))}
                        placeholder="Write closing note..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  )}
                  <div className="p-3.5 text-xs text-amber-950 leading-relaxed whitespace-pre-line">
                    {formData.customClosingNote || 'Click Edit to write a closing note...'}
                  </div>
                </div>
              )}

              {/* SECTION: CTA BUTTON */}
              {sectionVisibility.ctaButton && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {renderSectionActionToolbar('ctaButton', 'Section: Call-to-Action Button', () => toggleBuiltinSection('ctaButton', false))}
                  {editingSectionKey === 'ctaButton' && (
                    <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Button Label</label>
                        <input
                          type="text"
                          value={formData.ctaText || ''}
                          onChange={e => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Button Target URL</label>
                        <input
                          type="text"
                          value={formData.ctaUrl || ''}
                          onChange={e => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-4 text-center space-y-1.5">
                    <button
                      type="button"
                      onClick={handleTriggerRenewNowPayment}
                      className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-7 py-3 rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      {formData.ctaText || 'Log In to Portal →'}
                    </button>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Links to: {formData.ctaUrl || formData.portalUrl || 'https://www.tradeheaven.net'}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: ESCROW PROTECTION NOTICE */}
              {sectionVisibility.escrowBadge && formData.includeEscrowBadge !== false && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {renderSectionActionToolbar('escrowBadge', 'Section: Escrow Protection Notice', () => toggleBuiltinSection('escrowBadge', false))}
                  {editingSectionKey === 'escrowBadge' && (
                    <div className="p-3 bg-white border-b border-slate-200 text-xs">
                      <textarea
                        rows={3}
                        value={escrowNoticeText}
                        onChange={e => setEscrowNoticeText(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  )}
                  <div className="bg-slate-100 p-3 text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Trade Heaven Escrow Protection:</strong> {escrowNoticeText}
                  </div>
                </div>
              )}

              {/* SECTION: FOOTER */}
              {sectionVisibility.footer && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {renderSectionActionToolbar('footer', 'Section: Footer', () => toggleBuiltinSection('footer', false))}
                  {editingSectionKey === 'footer' && (
                    <div className="p-3 bg-white border-b border-slate-200 text-xs">
                      <input
                        type="text"
                        value={footerText}
                        onChange={e => setFooterText(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  )}
                  <div className="p-3 bg-white">
                    <p className="text-[10px] text-slate-400 text-center">{footerText}</p>
                  </div>
                </div>
              )}

              {/* QUICK ADD SECTION FOOTER BAR */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 border-t border-dashed border-slate-200">
                <button
                  type="button"
                  onClick={() => handleAddCustomSection('info')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Section to Mail</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomSection('warning')}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Warning / Terms Box</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="custom-email-dispatcher-admin" className="space-y-6">

      {/* LISTED CLIENTS COUNTER-OFFER BROADCAST CARD */}
      <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                BULK BUYER-REQUEST ALERT
              </span>
              {listedClientsSummary ? (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    listedClientsSummary.smtpConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {listedClientsSummary.smtpConfigured
                    ? 'SMTP Live (TLS Configured)'
                    : 'SMTP Credentials Unset (Queues in MailSuite / Use BigRock PHP)'}
                </span>
              ) : null}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Email Every Listed Client: Buyers Made Requests to Buy — Log In to Counter Offer
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Notifies every listed client on Trade Heaven that buyers have made requests to buy and directs them to log in to their Trade Heaven account (`?view=SUPPLIER_DASHBOARD`) to submit a Counter Offer.
            </p>
          </div>

          <button
            type="button"
            disabled={isBroadcastingCounterOffer}
            onClick={handleBroadcastCounterOfferToListedClients}
            className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {isBroadcastingCounterOffer ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Dispatching to Listed Clients...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  Email Every Listed Client (
                  {broadcastScope === 'ALL_LISTED_CLIENTS'
                    ? listedClientsSummary?.directoryClientsCount ?? '...'
                    : listedClientsSummary?.registeredClientsCount ?? '...'}
                  )
                </span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Listed Client Scope</label>
            <select
              value={broadcastScope}
              onChange={e => setBroadcastScope(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
            >
              <option value="REGISTERED_CLIENTS">
                Registered &amp; Onboarded Listed Clients ({listedClientsSummary?.registeredClientsCount ?? '...'})
              </option>
              <option value="ALL_LISTED_CLIENTS">
                All Directory Listed Companies ({listedClientsSummary?.directoryClientsCount ?? '...'})
              </option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Optional Subject Override</label>
            <input
              type="text"
              value={customBroadcastSubject}
              onChange={e => setCustomBroadcastSubject(e.target.value)}
              placeholder="Default: Buyers Have Made Requests to Buy — Log In to Counter Offer"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Optional Custom Message Note</label>
            <input
              type="text"
              value={customBroadcastMessage}
              onChange={e => setCustomBroadcastMessage(e.target.value)}
              placeholder="Optional custom note inside every client email..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {broadcastResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              broadcastResult.deliveredCount > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : broadcastResult.queuedAwaitingSmtpCount > 0
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="font-black">{broadcastResult.message}</div>
            <div className="flex flex-wrap gap-3 text-[11px] font-bold">
              <span>Targeted: {broadcastResult.totalTargeted}</span>
              <span>Delivered (Live SMTP): {broadcastResult.deliveredCount}</span>
              <span>Queued (Awaiting SMTP Credentials): {broadcastResult.queuedAwaitingSmtpCount}</span>
              <span>Failed: {broadcastResult.failedCount}</span>
            </div>
            {broadcastResult.recipients && broadcastResult.recipients.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-white/80 rounded-lg border border-slate-200 p-2 space-y-1 text-[11px]">
                {broadcastResult.recipients.map((r, idx) => (
                  <div key={`${r.email}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-slate-800">
                      {r.companyName} ({r.email})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                        r.status === 'DELIVERED_SMTP'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'QUEUED_NO_SMTP'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* MELISSA 48-HOUR UNCLAIMED FUNDS ALERT (>12H IN ACCOUNT) WORKFLOW BANNER */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 rounded-2xl border-2 border-red-500/80 p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                ⏳ 48-HOUR UNCLAIMED FUNDS ALERT (&gt;12 HOURS IN ACCOUNT)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                $50,000.00 USD Available &bull; Vault: TH-VAULT-AU-61648
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                Automatic Return / Reverse Remittance Policy
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Melissa Prezios (MP Commodity Brokers Australia Pty Ltd &bull; <span className="font-mono text-amber-300">melissa@mpcommoditybrokers.com</span>)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Alerts Melissa that her funds (<strong className="text-emerald-300">$50,000.00 USD</strong>) have remained unclaimed in her Trade Heaven account for <strong className="text-white">more than 12 hours</strong>, and that under Trade Heaven Custodial Treasury rules, if funds are unclaimed for <strong className="text-red-300">48 hours</strong>, the clearing gateway will automatically reverse the transaction and <strong className="text-amber-300">send the funds back to the remitter</strong> (<strong className="text-white">~36 hours remaining to claim</strong>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSendingMelissaAlert}
              onClick={handleSendMelissaUnclaimedFundsAlert}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSendingMelissaAlert ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching to Melissa...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Email Melissa 48h Unclaimed Funds Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {melissaAlertResult && (
          <div
            className={`mt-3.5 p-3 rounded-xl text-xs flex items-center justify-between gap-3 border ${
              melissaAlertResult.success
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{melissaAlertResult.message}</span>
            </div>
            {melissaAlertResult.trackingId && (
              <span className="font-mono text-[10px] text-slate-400">
                MailSuite ID: {melissaAlertResult.trackingId}
              </span>
            )}
          </div>
        )}
      </div>

      {/* MELISSA VIP UPGRADE & 30-DAY SERVICE AGREEMENT WORKFLOW BANNER */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-sky-500/80 p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-600 text-white shadow-xs">
                💳 VIP UPGRADE &amp; 30-DAY SERVICE AGREEMENT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                $5,000 USD Discounted Rate &bull; $50K Escrow Release
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
                30-Day Risk-Free Judgement Guarantee
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Melissa Prezios (MP Commodity Brokers Australia Pty Ltd &bull; <span className="font-mono text-sky-300">melissa@mpcommoditybrokers.com</span>)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Clarification on VIP Upgrade (<strong className="text-emerald-300">$5,000 USD</strong> discounted from standard $6,100/yr), pending <strong className="text-emerald-300">$50,000 USD</strong> escrow commission release, and the <strong className="text-white">30-Day Service Judgement Period</strong> providing full evaluation flexibility and risk-free transparency.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSendingMelissaVip}
              onClick={handleSendMelissaVipAgreement}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSendingMelissaVip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Agreement...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Email Melissa VIP Agreement &amp; Escrow Release</span>
                </>
              )}
            </button>
          </div>
        </div>

        {melissaVipResult && (
          <div
            className={`mt-3.5 p-3 rounded-xl text-xs flex items-center justify-between gap-3 border ${
              melissaVipResult.success
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{melissaVipResult.message}</span>
            </div>
            {melissaVipResult.trackingId && (
              <span className="font-mono text-[10px] text-slate-400">
                MailSuite ID: {melissaVipResult.trackingId}
              </span>
            )}
          </div>
        )}
      </div>

      {/* MELISSA DEAL SUMMARY & 6-STAGE EXECUTION TIMELINE ALERT WORKFLOW BANNER */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 rounded-2xl border-2 border-cyan-500/80 p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-600 text-white shadow-xs">
                📋 DEAL &amp; 6-STAGE TIMELINE ALERT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                DEAL-TH-AU-61648-FUEL &bull; EN590 / Jet A-1 / D6 &bull; SBLC Only
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Platts Pricing &bull; $50K Vault &bull; 6 Milestones
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Melissa Prezios (MP Commodity Brokers Australia Pty Ltd &bull; <span className="font-mono text-cyan-300">melissa@mpcommoditybrokers.com</span>)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Sends Melissa the consolidated <strong className="text-white">Fuel &amp; Petroleum Deal Schedule (DEAL-TH-AU-61648-FUEL)</strong>, Platts &amp; SBLC-Only terms, <strong className="text-emerald-300">$50,000.00 USD</strong> escrow vault status (<strong className="text-cyan-300">TH-VAULT-AU-61648</strong>), and the complete <strong className="text-amber-300">6-Stage Execution &amp; Settlement Timeline</strong> (~36h left in 48h window).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSendingMelissaDealTimeline}
              onClick={handleSendMelissaDealTimelineAlert}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSendingMelissaDealTimeline ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Deal &amp; Timeline...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Email Melissa Deal &amp; Timeline Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {melissaDealTimelineResult && (
          <div
            className={`mt-3.5 p-3 rounded-xl text-xs flex items-center justify-between gap-3 border ${
              melissaDealTimelineResult.success
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{melissaDealTimelineResult.message}</span>
            </div>
            {melissaDealTimelineResult.trackingId && (
              <span className="font-mono text-[10px] text-slate-400">
                MailSuite ID: {melissaDealTimelineResult.trackingId}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ZAC ($400 PAID BASIC PLAN) DEMO MAIL ON ADMIN FIRST + LIVE DISPATCH WORKFLOW BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border-2 border-amber-400/70 p-5 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                STEP 1: DEMO MAIL ON ADMIN FIRST • STEP 2: SEND LIVE TO ZAC
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
                $400 USD Paid (Basic Plan Partial) • Ads Campaign Failed Today
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                🪔 Diwali Offer Max Benefit (Code: DIWALI10 • $590 Balance)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Zac (Zachary Aldin • IMPORTATION FADE-TECH • <span className="font-mono text-amber-300">zac@otec.ltd</span>) — Ads Campaign Failed &amp; Account Pause Notice
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Notifies Zac that today&rsquo;s scheduled Ads Campaign failed due to insufficient plan balance (<strong className="text-white">$400 USD paid</strong> toward Basic Plan), requests Full Plan completion (<strong className="text-emerald-300">$590 USD remaining balance with Diwali 10% OFF Code DIWALI10</strong>, or Full VIP Plan upgrade for maximum Diwali benefits) to run ads and connect with more buyers, and warns that the account will be placed on <strong className="text-rose-300">temporary pause</strong> if unpaid.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSendingDemoAdmin}
              onClick={handleSendDemoMailToAdmin}
              className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSendingDemoAdmin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Demo to Admin...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>1. Send Demo Mail to Admin ({adminCopyEmail})</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={handleSendLiveZacEmail}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Live to Zac...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>2. Approve &amp; Send Live to Zac (zac@otec.ltd)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MAILSUITE REAL-TIME READ-RECEIPT & OPEN/CLICK TRACKING TELEMETRY STRIP */}
        {(() => {
          const activeTrackId = sendResult?.trackingId || 'ms-trk-zac-demo-admin-2026';
          const zacEntry =
            trackedServerEmails.find(e => e.trackingId === activeTrackId) ||
            trackedServerEmails.find(e => e.companyId === 'comp-zac-importation-fadetech');
          const isOpened = Boolean(zacEntry?.opened || (zacEntry?.openCount && zacEntry.openCount > 0));
          const isClicked = Boolean(zacEntry?.clicked || (zacEntry?.clickCount && zacEntry.clickCount > 0));

          return (
            <div className="mt-4 pt-4 border-t border-white/15 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black tracking-wide">
                  <CheckCheck className="w-3.5 h-3.5" />
                  MAILSUITE TRACKING ACTIVE
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold">
                  Open Rate: <strong className="text-emerald-300">{mailSuiteStats?.openRatePercent ?? 80}%</strong> ({mailSuiteStats?.totalOpened ?? 4}/{mailSuiteStats?.totalSent ?? 5} ✓✓)
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold">
                  Click Rate (CTR): <strong className="text-sky-300">{mailSuiteStats?.clickThroughRatePercent ?? 60}%</strong> ({mailSuiteStats?.totalClicksCount ?? 3} Link Clicks)
                </span>

                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black ${
                  isOpened
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {isOpened ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5" />
                      Zac Mail: OPENED ({zacEntry?.openCount || 1}x)
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Zac Mail: ✓ SENT (Waiting for Open)
                    </>
                  )}
                </span>

                {isClicked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-400 text-slate-950 text-[11px] font-black">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    CTA CLICKED ({zacEntry?.clickCount || 1}x)
                  </span>
                )}

                <span className="text-[10px] font-mono text-slate-400">
                  Pixel ID: {activeTrackId}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={simulatingTrackKey === `${activeTrackId}-OPEN`}
                  onClick={() => handleSimulateMailSuiteEvent(activeTrackId, 'OPEN')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{simulatingTrackKey === `${activeTrackId}-OPEN` ? 'Recording Open...' : 'Test Open Pixel (✓✓)'}</span>
                </button>

                <button
                  type="button"
                  disabled={simulatingTrackKey === `${activeTrackId}-CLICK`}
                  onClick={() => handleSimulateMailSuiteEvent(activeTrackId, 'CLICK')}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>{simulatingTrackKey === `${activeTrackId}-CLICK` ? 'Recording Click...' : 'Test CTA Link Click'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('HISTORY')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open MailSuite Logs</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Mail className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Manual Email Dispatcher &amp; Onboarding Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Corporate SMTP (Port 465)
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Manually compose, customize, and dispatch verified onboarding emails, login credentials, and high-value buyer inquiry tenders directly to fuel suppliers, importers, and global trade partners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('FORM')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'FORM'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Message &amp; Tenders</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('PREVIEW')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'PREVIEW'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Render Preview (Demo Mail)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('HISTORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'HISTORY'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* PRESET TEMPLATES SELECTOR BAR */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">
            Quick Template Presets (Click to Load):
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_TEMPLATES.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPreset === p.id
                    ? 'bg-blue-50/70 border-blue-400 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULT BANNER */}
      {sendResult && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
          sendResult.success 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          {sendResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black">{sendResult.message}</div>
            {sendResult.messageId && (
              <div className="text-[11px] font-mono text-emerald-800 mt-1">
                Message-ID: <span className="font-bold">{sendResult.messageId}</span>
              </div>
            )}
            {sendResult.dispatchedAt && (
              <div className="text-[10px] text-emerald-700 mt-0.5">
                Delivered At: {sendResult.dispatchedAt} via verified SMTP queue
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 1: FORM EDITOR + LIVE INLINE PREVIEW */}
      {activeSubTab === 'FORM' && (
        <div className="space-y-6">
          {/* LIVE PREVIEW VISIBILITY & QUICK SECTION MANAGER BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Mail Sections Builder</span>
              </span>
              <span className="text-[11px] text-slate-500">
                ({Object.values(sectionVisibility).filter(Boolean).length} built-in + {customSections.length} custom active)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddCustomSection('info')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Section</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInlinePreview(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer border transition-colors ${
                  showInlinePreview
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {showInlinePreview ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                <span>{showInlinePreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: RECIPIENT, CREDENTIALS & LIVE DISPATCH CONTROLLER */}
            <div className="lg:col-span-5 space-y-6">
            
            {/* 1. RECIPIENT PROFILE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  1. Recipient &amp; Corporate Identity
                </h3>
              </div>

              <div className="space-y-3">
                {/* Template Placeholders Quick Switcher */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                      Membership Renewal Placeholders
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleLoadPlaceholdersMode}
                        className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold cursor-pointer"
                      >
                        Use &#123;&#123;Placeholders&#125;&#125;
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadAceIntermediaryValues}
                        className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Fill ACE Intermediary
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono text-amber-900">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-amber-200">{'{{companyName}}'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-amber-200">{'{{address}}'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-amber-200">{'{{email}}'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-amber-200">{'{{decisionMakerName}}'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-amber-200">{'{{paymentMethod}}'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Decision Maker Name <span className="text-[10px] font-mono text-slate-400">({'{{decisionMakerName}}'})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.decisionMakerName ?? formData.recipientName ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        decisionMakerName: e.target.value,
                        recipientName: e.target.value
                      })
                    }
                    placeholder="e.g. Ali Charley Ezekiah or {{decisionMakerName}}"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Target Corporate Email <span className="text-rose-500">*</span> <span className="text-[10px] font-mono text-slate-400">({'{{email}}'})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.recipientEmail || ''}
                    onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                    placeholder="e.g. ezekiahali355@gmail.com or {{email}}"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company / Entity Name <span className="text-[10px] font-mono text-slate-400">({'{{companyName}}'})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. ACE Intermediary or {{companyName}}"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Registered Company Address <span className="text-[10px] font-mono text-slate-400">({'{{address}}'})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 1241 Hackberry Avenue Corsicana Texas 75110 or {{address}}"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Payment Method <span className="text-[10px] font-mono text-slate-400">({'{{paymentMethod}}'})</span>
                    </label>
                    <input
                      type="text"
                      value={formData.paymentMethod || ''}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                      placeholder="e.g. Debit Card"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Contact Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.contactPhone || ''}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="e.g. +1 (406) 309 5590"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PORTAL CREDENTIALS & ACCESS BOX */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    2. Portal Credentials &amp; Access Guide
                  </h3>
                </div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeCredentialsBox !== false}
                    onChange={e => setFormData({ ...formData, includeCredentialsBox: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Include in Email</span>
                </label>
              </div>

              {formData.includeCredentialsBox !== false && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Portal Access URL
                    </label>
                    <input
                      type="text"
                      value={formData.portalUrl || 'https://www.tradeheaven.net'}
                      onChange={e => setFormData({ ...formData, portalUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      User ID / Login Username
                    </label>
                    <input
                      type="text"
                      value={formData.loginEmail || formData.recipientEmail || ''}
                      onChange={e => setFormData({ ...formData, loginEmail: e.target.value })}
                      placeholder="e.g. randy@midforkcap.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-mono font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Assigned Password
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate Random</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.loginPassword || ''}
                      onChange={e => setFormData({ ...formData, loginPassword: e.target.value })}
                      placeholder="e.g. Randy@2026"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.includeLoginGuide !== false}
                        onChange={e => setFormData({ ...formData, includeLoginGuide: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Include 3-Step Login Instructions</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.includeEscrowBadge !== false}
                        onChange={e => setFormData({ ...formData, includeEscrowBadge: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Include 100% Escrow Trade Assurance Notice</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* SEND DISPATCH ACTION CARD */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Live Dispatch Controller
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Transmits via verified SMTP <span className="text-blue-400 font-mono">noreply@tradeheaven.net</span>
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Client Target:</span>
                  <span className="font-mono text-white font-bold">{formData.recipientEmail || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Plan &amp; Offer:</span>
                  <span className="text-amber-300 font-bold">Basic Plan ($990/yr • 10% OFF)</span>
                </div>
                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">Admin Email Target:</span>
                    <span className="font-mono text-[11px] text-emerald-300 truncate max-w-[180px]">{adminCopyEmail || 'None'}</span>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="email"
                      value={adminCopyEmail}
                      onChange={e => setAdminCopyEmail(e.target.value)}
                      placeholder="Admin email address..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-hidden focus:border-blue-500"
                    />
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400">Quick Admin:</span>
                      <button
                        type="button"
                        onClick={() => setAdminCopyEmail('yr943334@gmail.com')}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                      >
                        yr943334@gmail.com
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminCopyEmail('sankalprajput15@gmail.com')}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                      >
                        sankalprajput15@gmail.com
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSending || !adminCopyEmail}
                    onClick={() => handleSendEmail('ADMIN')}
                    className="w-full py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs tracking-wide uppercase transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSending && sendingTarget === 'ADMIN' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sharing to Admin...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Share to Admin</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSending || !formData.recipientEmail}
                    onClick={() => handleSendEmail('CLIENT')}
                    className="w-full py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-wide uppercase transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSending && sendingTarget === 'CLIENT' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sharing to Client...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Share to Client</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSending || !formData.recipientEmail || !adminCopyEmail}
                  onClick={() => handleSendEmail('BOTH')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-emerald-300 font-bold text-[11px] tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSending && sendingTarget === 'BOTH' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sharing to Client &amp; Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Share to Both (Client + Admin)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EMAIL COPY & INQUIRIES BUILDER */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 3. HEADLINE & MESSAGING */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  3. Subject, Headers &amp; Copy Text
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Top Header Badge Label
                    </label>
                    <input
                      type="text"
                      value={formData.badgeLabel || ''}
                      onChange={e => setFormData({ ...formData, badgeLabel: e.target.value })}
                      placeholder="e.g. TRADE HEAVEN • GLOBAL B2B DESK"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Main Email Headline
                    </label>
                    <input
                      type="text"
                      value={formData.headline || ''}
                      onChange={e => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g. Welcome to Trade Heaven"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Subheadline
                  </label>
                  <input
                    type="text"
                    value={formData.subheadline || ''}
                    onChange={e => setFormData({ ...formData, subheadline: e.target.value })}
                    placeholder="e.g. Supplier Account Activated & Active Fuel Inquiries Assigned"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Introduction Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={formData.introMessage || ''}
                    onChange={e => setFormData({ ...formData, introMessage: e.target.value })}
                    placeholder="Provide detailed instructions or welcome note..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 4. ACTIVE INQUIRIES / BUYER TENDERS BUILDER */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    4. Active Inquiries &amp; Tenders (Customizable)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddInquiry}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tender</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Inquiries Section Header Title
                </label>
                <input
                  type="text"
                  value={formData.inquiriesTitle || 'Active Buyer Inquiries / Matched Tenders'}
                  onChange={e => setFormData({ ...formData, inquiriesTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold"
                />
              </div>

              {/* LIST OF INQUIRIES */}
              <div className="space-y-4 pt-2">
                {formData.inquiries && formData.inquiries.length > 0 ? (
                  formData.inquiries.map((inq, index) => (
                    <div 
                      key={inq.id || index}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                            #{index + 1}
                          </span>
                          <input
                            type="text"
                            value={inq.id || ''}
                            onChange={e => handleUpdateInquiry(index, 'id', e.target.value)}
                            placeholder="e.g. RFQ-FUEL-EN590-2026"
                            className="px-2 py-1 text-[11px] font-mono font-bold rounded border border-slate-200 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInquiry(index)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Product / Tender Title
                        </label>
                        <input
                          type="text"
                          value={inq.title || ''}
                          onChange={e => handleUpdateInquiry(index, 'title', e.target.value)}
                          placeholder="Product Name / Tender Specification"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Buyer Entity &amp; Country
                          </label>
                          <input
                            type="text"
                            value={inq.buyerCompany || ''}
                            onChange={e => handleUpdateInquiry(index, 'buyerCompany', e.target.value)}
                            placeholder="e.g. Nordic PetroLogistics AS"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Estimated Cargo Value
                          </label>
                          <input
                            type="text"
                            value={inq.estimatedValue || ''}
                            onChange={e => handleUpdateInquiry(index, 'estimatedValue', e.target.value)}
                            placeholder="e.g. $62,000,000 USD"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-bold text-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Quantity / Volume
                          </label>
                          <input
                            type="text"
                            value={inq.quantity || ''}
                            onChange={e => handleUpdateInquiry(index, 'quantity', e.target.value)}
                            placeholder="e.g. 100,000 Metric Tons / Month"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Incoterms &amp; Port
                          </label>
                          <input
                            type="text"
                            value={inq.incotermPort || ''}
                            onChange={e => handleUpdateInquiry(index, 'incotermPort', e.target.value)}
                            placeholder="e.g. CIF Port of Rotterdam / Houston"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Payment Terms
                          </label>
                          <input
                            type="text"
                            value={inq.paymentTerms || ''}
                            onChange={e => handleUpdateInquiry(index, 'paymentTerms', e.target.value)}
                            placeholder="e.g. Irrevocable Transferable SBLC / MT760 + MT103"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No inquiries attached. Click &ldquo;Add Tender&rdquo; to attach bespoke buy leads.
                  </div>
                )}
              </div>
            </div>

            {/* 5. CALL TO ACTION & CLOSING NOTE */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ArrowRight className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  5. Call to Action &amp; Closing Note
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText || 'Log In to Portal & View Inquiries →'}
                      onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Button Target URL
                    </label>
                    <input
                      type="text"
                      value={formData.ctaUrl || 'https://www.tradeheaven.net'}
                      onChange={e => setFormData({ ...formData, ctaUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Custom Closing / Escrow Note
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customClosingNote || ''}
                    onChange={e => setFormData({ ...formData, customClosingNote: e.target.value })}
                    placeholder="Optional note before the footer..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    Clicking <strong className="text-slate-800">&ldquo;{formData.ctaText || 'Renew Now'}&rdquo;</strong> triggers the subscription renewal payment flow for <strong className="text-slate-800">{formData.companyName || 'ACE Intermediary'}</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerRenewNowPayment}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wide transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Renew Now (Open Payment Flow)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 6. CUSTOM EMAIL SECTIONS (ADD / EDIT / REORDER / DELETE) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    6. Custom Mail Sections ({customSections.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustomSection('info')}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-black border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Section</span>
                </button>
              </div>

              {customSections.length > 0 ? (
                <div className="space-y-3">
                  {customSections.map((sec, idx) => (
                    <div key={sec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500">Section #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCustomSection(idx, -1)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === customSections.length - 1}
                            onClick={() => handleMoveCustomSection(idx, 1)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection(sec.id)}
                            className="p-1 rounded bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="Delete section"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={e => handleUpdateCustomSection(sec.id, { title: e.target.value })}
                          placeholder="Section Title"
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-bold"
                        />
                        <input
                          type="text"
                          value={sec.badge}
                          onChange={e => handleUpdateCustomSection(sec.id, { badge: e.target.value })}
                          placeholder="Badge (optional)"
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={sec.body}
                        onChange={e => handleUpdateCustomSection(sec.id, { body: e.target.value })}
                        placeholder="Section body content..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No custom sections added yet. Click &ldquo;Add Custom Section&rdquo; to insert extra blocks into the email.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* INLINE LIVE EMAIL PREVIEW PANEL (ALWAYS IN SYNC WITH DISPATCHED EMAIL) */}
        {showInlinePreview && (
          <div className="pt-2">
            {renderInteractiveEmailPreview(true)}
          </div>
        )}
      </div>
      )}

      {/* SUB-TAB 2: LIVE HTML PREVIEW */}
      {activeSubTab === 'PREVIEW' && (
        <div className="space-y-4">
          {renderInteractiveEmailPreview(false)}
        </div>
      )}

      {/* SUB-TAB 3: DISPATCH HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="space-y-6">
          {/* Per-Company Automated + Manual Email History Section with Full MailSuite Tracking */}
          <CompanyEmailHistorySection
            companyId={
              (formData.companyName || '').toLowerCase().includes('fade-tech') ||
              (formData.recipientEmail || '').toLowerCase().includes('zac@otec.ltd')
                ? 'comp-zac-importation-fadetech'
                : undefined
            }
            companyName={formData.companyName || 'IMPORTATION FADE-TECH (OTEC LTD)'}
            contactEmail={formData.recipientEmail || 'zac@otec.ltd'}
            contactName={formData.recipientName || 'Zachary Aldin (Zac)'}
            contactPhone={formData.contactPhone || '+61 424 854 899'}
          />

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>All Manual Dispatches Across Companies (Session &amp; MailSuite Log)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                    ✓✓ Read Receipts Active
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Track real-time open counts, CTA clicks, or re-load any previously composed email template
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchMailSuiteTelemetry()}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Server History</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('th_admin_dispatched_emails_history');
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                >
                  Clear Local
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {history.length > 0 ? (
                history.map(item => {
                  const matchedServer = trackedServerEmails.find(
                    e =>
                      (item.trackingId && e.trackingId === item.trackingId) ||
                      (item.messageId && e.messageId === item.messageId)
                  );
                  const trackId = item.trackingId || matchedServer?.trackingId || `ms-trk-${item.id}`;
                  const isOpened = Boolean(matchedServer?.opened || (matchedServer?.openCount && matchedServer.openCount > 0));
                  const openCount = matchedServer?.openCount || 0;
                  const isClicked = Boolean(matchedServer?.clicked || (matchedServer?.clickCount && matchedServer.clickCount > 0));
                  const clickCount = matchedServer?.clickCount || 0;

                  return (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          item.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {item.success ? <CheckCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{item.recipientName}</span>
                            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                              {item.recipientEmail}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              ({item.companyName})
                            </span>
                            {isOpened ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                OPENED ({openCount}x)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <Check className="w-3 h-3 text-slate-500" />
                                SENT • TRACKING ACTIVE
                              </span>
                            )}
                            {isClicked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                <MousePointerClick className="w-3 h-3 text-blue-600" />
                                CLICKED ({clickCount}x)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-700 font-semibold truncate max-w-xl">
                            {item.subject}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-emerald-800">
                            {item.messageId && <span>Message-ID: {item.messageId}</span>}
                            <span className="text-slate-500">MailSuite ID: {trackId}</span>
                            {matchedServer?.lastOpenedAt && (
                              <span className="text-emerald-700 font-sans font-bold">
                                Last Read: {new Date(matchedServer.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => handleSimulateMailSuiteEvent(trackId, 'OPEN')}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold cursor-pointer"
                        >
                          + Test Open
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateMailSuiteEvent(trackId, 'CLICK')}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold cursor-pointer"
                        >
                          + Test Click
                        </button>
                        <div className="text-right px-1">
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(item.dispatchedAt).toLocaleString()}
                          </div>
                          <span className={`text-[10px] font-black uppercase ${item.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {item.success
                              ? item.deliveryMode === 'PHP_MAIL_RELAY'
                                ? 'Delivered (Mail Relay)'
                                : 'Delivered (SMTP)'
                              : 'Delivery Failed'}
                          </span>
                          {!item.success && item.error && (
                            <div className="text-[10px] text-rose-600 max-w-[200px] truncate" title={item.error}>
                              {item.error}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleApplyPreset(item.templatePreset);
                            setFormData(prev => ({
                              ...prev,
                              recipientEmail: item.recipientEmail,
                              recipientName: item.recipientName,
                              companyName: item.companyName,
                              subject: item.subject
                            }));
                            setActiveSubTab('FORM');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                        >
                          Re-load
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No email dispatch history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
