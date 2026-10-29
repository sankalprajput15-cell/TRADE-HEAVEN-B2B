import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  HelpCircle, 
  Upload, 
  FileSpreadsheet, 
  ClipboardPaste, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Copy, 
  Plus, 
  Download, 
  Send, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  UserCheck, 
  Info,
  Check,
  X,
  Mail,
  Bookmark,
  Edit3,
  Eye,
  Sparkles,
  Save,
  Tag,
  Paperclip,
  Clock,
  Calendar,
  BarChart3,
  MousePointerClick,
  AlertOctagon,
  TrendingUp,
  Activity,
  Filter
} from 'lucide-react';

export type EntityCategory = 'BUYER_LEAD' | 'SUPPLIER_PROFILE' | 'RFQ' | 'GENERAL_INQUIRY';
export type InputMode = 'SPREADSHEET' | 'UPLOADER' | 'SMART_PASTE' | 'EMAIL_TEMPLATES' | 'DELIVERY_ANALYTICS';
export type TemplateTargetAudience = 'SUPPLIER' | 'BUYER' | 'ALL';
export type TemplateDeliveryEventStatus = 'DELIVERED' | 'OPENED' | 'CLICKED' | 'SOFT_BOUNCE' | 'HARD_BOUNCE';

export interface SentTemplateDeliveryRecord {
  id: string;
  templateId: string;
  templateName: string;
  targetAudience: TemplateTargetAudience;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  country: string;
  subject: string;
  dispatchedAt: string;
  status: TemplateDeliveryEventStatus;
  openCount: number;
  lastOpenedAt?: string;
  clickCount: number;
  lastClickedAt?: string;
  clickedTargetLabel?: string;
  bounceReason?: string;
  bounceCode?: string;
  attachedPdfTitles: string[];
}

export interface SavedPdfDocument {
  id: string;
  title: string;
  fileName: string;
  fileSizeLabel: string;
  category: string;
  description: string;
}

export interface ScheduledEmailJob {
  id: string;
  templateId: string;
  templateName: string;
  entityCategory: string;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  scheduledFor: string;
  scheduledDateLabel: string;
  scheduledTimeLabel: string;
  timezone: string;
  status: 'SCHEDULED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  dispatchedAt?: string;
  messageId?: string;
  error?: string;
  emailPayload: Record<string, any>;
}

export interface ReusableEmailTemplate {
  id: string;
  name: string;
  targetAudience: TemplateTargetAudience;
  subject: string;
  badgeLabel: string;
  headline: string;
  subheadline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  includeCredentialsBox: boolean;
  includeLoginGuide: boolean;
  includeEscrowBadge: boolean;
  updatedAt: string;
}

export interface RowValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type LeadPipelineStatus =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'IN_NEGOTIATION'
  | 'PROPOSAL_SENT'
  | 'ONBOARDED'
  | 'NURTURE'
  | 'DISQUALIFIED';

export interface LeadFollowUpSchedule {
  date: string;
  time: string;
  timezone: string;
  channel: string;
  note?: string;
  templateName?: string;
}

export const LEAD_STATUS_OPTIONS: {
  value: LeadPipelineStatus;
  label: string;
  badgeClass: string;
}[] = [
  { value: 'NEW_LEAD', label: 'New Lead', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'CONTACTED', label: 'Contacted', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { value: 'QUALIFIED', label: 'Qualified', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'IN_NEGOTIATION', label: 'In Negotiation', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  { value: 'ONBOARDED', label: 'Onboarded', badgeClass: 'bg-teal-50 text-teal-800 border-teal-200' },
  { value: 'NURTURE', label: 'Nurture Queue', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'DISQUALIFIED', label: 'Disqualified', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' }
];

export interface BulkEntityRecord {
  id: string;
  // Common / Buyer
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  targetProduct?: string;
  requiredQuantity?: string;
  budget?: string;
  priority?: 'HOT' | 'WARM' | 'COLD';
  
  // Supplier specific
  category?: string;
  starRating?: number;
  productShowcaseLimit?: number;
  assignedManager?: string;

  // RFQ specific
  rfqTitle?: string;
  targetPrice?: string;
  volumeUnit?: string;
  portOfDestination?: string;
  incoterm?: string;
  expiryDate?: string;

  // General Inquiry specific
  subject?: string;
  message?: string;
  inquiryType?: string;
  status?: string;

  // Meta & Bulk CRM Pipeline
  assignedIem?: string;
  leadStatus?: LeadPipelineStatus;
  scheduledFollowUp?: LeadFollowUpSchedule;
  isSynced?: boolean;
}

const CRM_TEMPLATES_STORAGE_KEY = 'th_crm_reusable_email_templates_v1';
const CRM_SAVED_PDFS_STORAGE_KEY = 'th_crm_saved_pdf_documents_v1';
const CRM_SCHEDULED_EMAILS_STORAGE_KEY = 'th_crm_scheduled_emails_v1';
const CRM_DELIVERY_ANALYTICS_STORAGE_KEY = 'th_crm_delivery_analytics_v1';
const MAX_PDF_ATTACHMENTS = 3;

const DEFAULT_DELIVERY_ANALYTICS_RECORDS: SentTemplateDeliveryRecord[] = [
  {
    id: 'da-1000-mark-johnson-golden-lead',
    templateId: 'tpl-golden-lead-canada-10-generators-diwali',
    templateName: 'Golden Lead: 10 Generators to Canada (100% Advance • VIP Exclusive + Diwali Offer)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'mjohnson@atlanticpowerequip.com',
    recipientName: 'Mark Johnson (President)',
    companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
    country: 'United States',
    subject: '🌟 GOLDEN LEAD [VIP Exclusive • 100% Advance Payment]: 10 Units Industrial Diesel Generators to Canada + Special Diwali Offer',
    dispatchedAt: new Date().toISOString(),
    status: 'CLICKED',
    openCount: 3,
    lastOpenedAt: new Date().toISOString(),
    clickCount: 2,
    lastClickedAt: new Date().toISOString(),
    clickedTargetLabel: 'Unlock 10-Generator Canada Golden Lead (100% Advance Payment) with Diwali VIP Offer →',
    attachedPdfTitles: ['Trade Assurance Terms', 'Marketplace Onboarding Guide', 'SGS & Saybolt Q&Q Inspection Protocol']
  },
  {
    id: 'da-1001',
    templateId: 'tpl-supplier-onboarding-fuel',
    templateName: 'Supplier Onboarding & Active Buyer Tenders (Fuel / Commodities)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'randy@midforkcap.com',
    recipientName: 'Mr. Randy',
    companyName: 'Middle Fox LLC',
    country: 'United States',
    subject: 'Welcome to Trade Heaven: Middle Fox LLC Supplier Portal Credentials & Active Inquiries (Petroleum & Fuel (EN 590, Jet Fuel A-1))',
    dispatchedAt: '2026-10-25T06:50:55.212Z',
    status: 'CLICKED',
    openCount: 4,
    lastOpenedAt: '2026-10-25T08:15:10.000Z',
    clickCount: 3,
    lastClickedAt: '2026-10-25T08:16:42.000Z',
    clickedTargetLabel: 'Log In to Supplier Portal & View Inquiries + Trade Assurance Terms PDF',
    attachedPdfTitles: ['Trade Assurance Terms', 'Marketplace Onboarding Guide', 'SGS & Saybolt Q&Q Inspection Protocol']
  },
  {
    id: 'da-1002',
    templateId: 'tpl-supplier-onboarding-fuel',
    templateName: 'Supplier Onboarding & Active Buyer Tenders (Fuel / Commodities)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'export@zjprecision.cn',
    recipientName: 'Chen Wei',
    companyName: 'Zhejiang Precision Machinery Co.',
    country: 'China',
    subject: 'Welcome to Trade Heaven: Zhejiang Precision Machinery Co. Supplier Portal Credentials & Active Inquiries (Industrial Machinery)',
    dispatchedAt: '2026-10-25T05:12:00.000Z',
    status: 'CLICKED',
    openCount: 2,
    lastOpenedAt: '2026-10-25T06:30:00.000Z',
    clickCount: 1,
    lastClickedAt: '2026-10-25T06:31:15.000Z',
    clickedTargetLabel: 'Log In to Supplier Portal & View Inquiries →',
    attachedPdfTitles: ['Marketplace Onboarding Guide', 'Verified Supplier Code of Conduct & SLA']
  },
  {
    id: 'da-1003',
    templateId: 'tpl-supplier-onboarding-fuel',
    templateName: 'Supplier Onboarding & Active Buyer Tenders (Fuel / Commodities)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'sales@vanguardsteel.in',
    recipientName: 'Rajesh Patel',
    companyName: 'Vanguard Steel & Alloy Works',
    country: 'India',
    subject: 'Welcome to Trade Heaven: Vanguard Steel & Alloy Works Supplier Portal Credentials & Active Inquiries (Metals & Metallurgy)',
    dispatchedAt: '2026-10-24T19:40:00.000Z',
    status: 'OPENED',
    openCount: 2,
    lastOpenedAt: '2026-10-25T04:10:00.000Z',
    clickCount: 0,
    attachedPdfTitles: ['Trade Assurance Terms', 'Marketplace Onboarding Guide']
  },
  {
    id: 'da-1004',
    templateId: 'tpl-supplier-buyer-inquiry-alert',
    templateName: 'Urgent Buyer RFQ Match Notification (For Suppliers)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'sorkindon@gmail.com',
    recipientName: 'Donald Sorkin',
    companyName: 'Girlsenberries',
    country: 'United States',
    subject: 'Action Required: New Verified Buyer Inquiry for Girlsenberries (Wholesale Frozen & Dried Berries)',
    dispatchedAt: '2026-10-24T22:15:30.400Z',
    status: 'CLICKED',
    openCount: 3,
    lastOpenedAt: '2026-10-25T01:22:00.000Z',
    clickCount: 2,
    lastClickedAt: '2026-10-25T01:24:05.000Z',
    clickedTargetLabel: 'Access Dashboard & Submit Quote →',
    attachedPdfTitles: ['Trade Assurance Terms']
  },
  {
    id: 'da-1005',
    templateId: 'tpl-supplier-buyer-inquiry-alert',
    templateName: 'Urgent Buyer RFQ Match Notification (For Suppliers)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'orders@nordictimber.se',
    recipientName: 'Lars Lindqvist',
    companyName: 'Nordic Timber & Pulp AB',
    country: 'Sweden',
    subject: 'Action Required: New Verified Buyer Inquiry for Nordic Timber & Pulp AB (Forestry & Paper)',
    dispatchedAt: '2026-10-24T16:00:00.000Z',
    status: 'OPENED',
    openCount: 1,
    lastOpenedAt: '2026-10-24T18:45:00.000Z',
    clickCount: 0,
    attachedPdfTitles: ['Trade Assurance Terms']
  },
  {
    id: 'da-1006',
    templateId: 'tpl-supplier-buyer-inquiry-alert',
    templateName: 'Urgent Buyer RFQ Match Notification (For Suppliers)',
    targetAudience: 'SUPPLIER',
    recipientEmail: 'smendoza@andeanagro.pe',
    recipientName: 'Sofia Mendoza',
    companyName: 'Andean Agro-Export S.A.C.',
    country: 'Peru',
    subject: 'Action Required: New Verified Buyer Inquiry for Andean Agro-Export S.A.C. (Agriculture & Foods)',
    dispatchedAt: '2026-10-24T15:20:00.000Z',
    status: 'SOFT_BOUNCE',
    openCount: 0,
    clickCount: 0,
    bounceCode: '452 4.2.2',
    bounceReason: 'Recipient mailbox storage quota full — automatic retry queued by MTA',
    attachedPdfTitles: ['Marketplace Onboarding Guide']
  },
  {
    id: 'da-1007',
    templateId: 'tpl-buyer-verified-suppliers-ready',
    templateName: 'Verified Supplier Quotations Ready (For Buyers)',
    targetAudience: 'BUYER',
    recipientEmail: 'm.vance@apexglobal.com',
    recipientName: 'Marcus Vance',
    companyName: 'Apex Global Logistics & Sourcing',
    country: 'United States',
    subject: 'Trade Heaven Sourcing Update: Verified Supplier Quotes for Solar Inverters 10kW (Apex Global Logistics & Sourcing)',
    dispatchedAt: '2026-10-25T03:40:00.000Z',
    status: 'CLICKED',
    openCount: 5,
    lastOpenedAt: '2026-10-25T07:50:00.000Z',
    clickCount: 3,
    lastClickedAt: '2026-10-25T07:52:18.000Z',
    clickedTargetLabel: 'Review Supplier Quotes in Buyer Console →',
    attachedPdfTitles: ['Trade Assurance Terms', 'International Incoterms 2026 & LC Banking Guide']
  },
  {
    id: 'da-1008',
    templateId: 'tpl-buyer-verified-suppliers-ready',
    templateName: 'Verified Supplier Quotations Ready (For Buyers)',
    targetAudience: 'BUYER',
    recipientEmail: 'schmidt@bavarian-auto.de',
    recipientName: 'Greta Schmidt',
    companyName: 'Bavarian Auto Components GmbH',
    country: 'Germany',
    subject: 'Trade Heaven Sourcing Update: Verified Supplier Quotes for CNC Aluminum Castings (Bavarian Auto Components GmbH)',
    dispatchedAt: '2026-10-25T02:10:00.000Z',
    status: 'OPENED',
    openCount: 2,
    lastOpenedAt: '2026-10-25T06:05:00.000Z',
    clickCount: 0,
    attachedPdfTitles: ['Trade Assurance Terms']
  },
  {
    id: 'da-1009',
    templateId: 'tpl-buyer-verified-suppliers-ready',
    templateName: 'Verified Supplier Quotations Ready (For Buyers)',
    targetAudience: 'BUYER',
    recipientEmail: 'k-sato@tokyoretail.jp',
    recipientName: 'Kenji Sato',
    companyName: 'Tokyo Retail Enterprises',
    country: 'Japan',
    subject: 'Trade Heaven Sourcing Update: Verified Supplier Quotes for Organic Cotton Apparel (Tokyo Retail Enterprises)',
    dispatchedAt: '2026-10-24T21:00:00.000Z',
    status: 'CLICKED',
    openCount: 3,
    lastOpenedAt: '2026-10-25T01:15:00.000Z',
    clickCount: 2,
    lastClickedAt: '2026-10-25T01:17:00.000Z',
    clickedTargetLabel: 'Review Supplier Quotes in Buyer Console + Marketplace Onboarding Guide PDF',
    attachedPdfTitles: ['Marketplace Onboarding Guide']
  },
  {
    id: 'da-1010',
    templateId: 'tpl-buyer-verified-suppliers-ready',
    templateName: 'Verified Supplier Quotations Ready (For Buyers)',
    targetAudience: 'BUYER',
    recipientEmail: 'tariq@horizon-dubai.ae',
    recipientName: 'Tariq Al-Mansoor',
    companyName: 'Dubai Horizon Trading FZE',
    country: 'United Arab Emirates',
    subject: 'Trade Heaven Sourcing Update: Verified Supplier Quotes for Refined Sunflower Oil (Dubai Horizon Trading FZE)',
    dispatchedAt: '2026-10-24T14:30:00.000Z',
    status: 'HARD_BOUNCE',
    openCount: 0,
    clickCount: 0,
    bounceCode: '550 5.1.1',
    bounceReason: 'Destination MX rejected recipient address (550 5.1.1 Mailbox unavailable or decommissioned)',
    attachedPdfTitles: ['Trade Assurance Terms']
  },
  {
    id: 'da-1011',
    templateId: 'tpl-buyer-escrow-assurance',
    templateName: 'Trade Assurance & SBLC/Escrow Protection Guide (For Buyers)',
    targetAudience: 'BUYER',
    recipientEmail: 'csilva@spimport.com.br',
    recipientName: 'Camila Silva',
    companyName: 'São Paulo Importadora Ltda',
    country: 'Brazil',
    subject: 'Trade Protection Advisory for São Paulo Importadora Ltda: Securing Your Medical Nitrile Gloves Shipment',
    dispatchedAt: '2026-10-25T04:00:00.000Z',
    status: 'CLICKED',
    openCount: 2,
    lastOpenedAt: '2026-10-25T07:10:00.000Z',
    clickCount: 2,
    lastClickedAt: '2026-10-25T07:12:40.000Z',
    clickedTargetLabel: 'View Escrow Terms & Activate Protection + SGS Inspection Protocol PDF',
    attachedPdfTitles: ['Trade Assurance Terms', 'SGS & Saybolt Q&Q Inspection Protocol']
  },
  {
    id: 'da-1012',
    templateId: 'tpl-buyer-escrow-assurance',
    templateName: 'Trade Assurance & SBLC/Escrow Protection Guide (For Buyers)',
    targetAudience: 'BUYER',
    recipientEmail: 'jan@ecopower.nl',
    recipientName: 'Jan van Dijk',
    companyName: 'EcoPower Solutions BV',
    country: 'Netherlands',
    subject: 'Trade Protection Advisory for EcoPower Solutions BV: Securing Your High-Efficiency Monocrystalline Solar Panels 550W Shipment',
    dispatchedAt: '2026-10-25T01:30:00.000Z',
    status: 'DELIVERED',
    openCount: 0,
    clickCount: 0,
    attachedPdfTitles: ['Trade Assurance Terms', 'International Incoterms 2026 & LC Banking Guide']
  }
];

const SCHEDULE_TIMEZONES = [
  'UTC',
  'EST (America/New_York)',
  'IST (Asia/Kolkata)',
  'CET (Europe/Berlin)',
  'GST (Asia/Dubai)',
  'SGT (Asia/Singapore)'
];

const DEFAULT_SAVED_PDF_DOCUMENTS: SavedPdfDocument[] = [
  {
    id: 'pdf-trade-assurance-terms',
    title: 'Trade Assurance Terms',
    fileName: 'Trade_Heaven_Escrow_&_Trade_Assurance_Terms_2026.pdf',
    fileSizeLabel: '420 KB',
    category: 'Escrow & Legal',
    description: 'Regulated SBLC/MT103 Escrow payment protection, SGS inspection release conditions, and dispute resolution framework.'
  },
  {
    id: 'pdf-marketplace-onboarding-guide',
    title: 'Marketplace Onboarding Guide',
    fileName: 'Trade_Heaven_Global_Marketplace_Onboarding_Guide.pdf',
    fileSizeLabel: '680 KB',
    category: 'Onboarding',
    description: 'Step-by-step supplier & buyer portal navigation, RFQ bidding instructions, and KYC verification checklist.'
  },
  {
    id: 'pdf-sgs-inspection-protocol',
    title: 'SGS & Saybolt Q&Q Inspection Protocol',
    fileName: 'SGS_Saybolt_Port_Inspection_Protocol_2026.pdf',
    fileSizeLabel: '315 KB',
    category: 'Quality Control',
    description: 'Standardized port loading quality & quantity inspection procedures for EN 590, Jet Fuel A-1, and bulk commodities.'
  },
  {
    id: 'pdf-incoterms-banking-guide',
    title: 'International Incoterms 2026 & LC Banking Guide',
    fileName: 'Incoterms_2026_FOB_CIF_SBLC_Banking_Guide.pdf',
    fileSizeLabel: '510 KB',
    category: 'Trade Finance',
    description: 'Reference manual for CIF/FOB port terms, Documentary Letters of Credit (DLC), and SBLC MT760 formatting.'
  },
  {
    id: 'pdf-supplier-compliance-sla',
    title: 'Verified Supplier Code of Conduct & SLA',
    fileName: 'Verified_Supplier_Compliance_SLA_2026.pdf',
    fileSizeLabel: '290 KB',
    category: 'Compliance',
    description: 'Export compliance, response time SLAs, and verified badge requirements for global suppliers.'
  }
];

const AVAILABLE_MERGE_TAGS = [
  { tag: '{{companyName}}', label: 'Company Name' },
  { tag: '{{decisionMakerName}}', label: 'Decision Maker Name' },
  { tag: '{{address}}', label: 'Company Address' },
  { tag: '{{email}}', label: 'Contact Email' },
  { tag: '{{paymentMethod}}', label: 'Payment Method' },
  { tag: '{{contactPerson}}', label: 'Contact Person' },
  { tag: '{{country}}', label: 'Country' },
  { tag: '{{targetProduct}}', label: 'Product / Category' },
  { tag: '{{requiredQuantity}}', label: 'Quantity / Volume' },
  { tag: '{{budget}}', label: 'Budget / Target Price' },
  { tag: '{{assignedIem}}', label: 'Assigned IEM Manager' }
];

const DEFAULT_REUSABLE_TEMPLATES: ReusableEmailTemplate[] = [
  {
    id: 'tpl-membership-renewal-current-offer',
    name: 'Membership Renewal — Current Subscription Offer & Exciting Deals',
    targetAudience: 'ALL',
    subject: '💎 Exclusive Membership Renewal Offer & Priority B2B Deals for {{companyName}} (Attn: {{decisionMakerName}})',
    badgeLabel: 'TRADE HEAVEN • VIP MEMBERSHIP RENEWAL & EXCLUSIVE DEALS',
    headline: 'Renew Your Membership & Unlock Exciting New Trade Deals',
    subheadline: 'Special Subscription Renewal Offer Prepared for {{companyName}}',
    body: 'Dear {{decisionMakerName}},\n\nThank you for your continued partnership with Trade Heaven Global B2B. Your corporate membership for {{companyName}} is now eligible for renewal under our Current Subscription Offer—unlocking priority access to new exciting international trade deals, 100% Advance Payment Golden Leads, and zero-fee Escrow protection.\n\nREGISTERED CLIENT & RENEWAL ACCOUNT SUMMARY:\n• Company Name: {{companyName}}\n• Address: {{address}}\n• Email: {{email}}\n• Decision Maker Name: {{decisionMakerName}}\n• Preferred Payment Method: {{paymentMethod}}\n\nClick "Renew Now" below to lock in your current subscription offer rate and complete your renewal via {{paymentMethod}}.',
    ctaText: 'Renew Now',
    ctaUrl: 'https://www.tradeheaven.net/?action=renew-membership&company={{companyName}}&email={{email}}&decisionMaker={{decisionMakerName}}&address={{address}}&paymentMethod={{paymentMethod}}',
    includeCredentialsBox: false,
    includeLoginGuide: false,
    includeEscrowBadge: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-golden-lead-canada-10-generators-diwali',
    name: 'Golden Lead: 10 Generators to Canada (100% Advance • VIP Exclusive + Diwali Offer)',
    targetAudience: 'SUPPLIER',
    subject: '🌟 GOLDEN LEAD [VIP Exclusive • 100% Advance Payment]: 10 Units Industrial Diesel Generators to Canada + Special Diwali Offer for {{companyName}}',
    badgeLabel: 'TRADE HEAVEN • GOLDEN LEAD DESK • VIP EXCLUSIVE (100% ADVANCE)',
    headline: 'Golden Lead Alert: 10 Units Generators to Canada (100% Advance Payment)',
    subheadline: 'Exclusively Accessed by VIP Members • Special Diwali Upgrade Offer Active',
    body: 'Dear {{contactPerson}},\n\nWelcome to Trade Heaven! Your supplier profile for {{companyName}} (Basic Plan Member — CAT Earth Moving Machines & Industrial Generators) has been matched with an urgent GOLDEN LEAD:\n\n• Requirement: 10 Units Heavy-Duty Industrial Diesel Generators (CAT / Cummins Power Generation)\n• Destination: Canada (Toronto / Calgary / Vancouver)\n• Payment Terms: 100% ADVANCE PAYMENT (Upfront TT / Wire Settlement)\n• Access Policy: ONLY ACCESSED BY VIP MEMBER with 100% Advance Payment Protection\n\n🪔 SPECIAL DIWALI OFFER: Upgrade your Basic Plan membership to VIP Member today using our Special Diwali Festival Offer (Promo Code: DIWALI10 — Flat 10% OFF + Instant Golden Lead Unlock) to unlock full buyer contact details and claim this 10-Generator Canada order with 100% Advance Payment!',
    ctaText: 'Claim Diwali VIP Offer & Unlock 10-Generator Canada Golden Lead →',
    ctaUrl: 'https://www.tradeheaven.net',
    includeCredentialsBox: true,
    includeLoginGuide: true,
    includeEscrowBadge: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-supplier-onboarding-fuel',
    name: 'Supplier Onboarding & Active Buyer Tenders (Fuel / Commodities)',
    targetAudience: 'SUPPLIER',
    subject: 'Welcome to Trade Heaven: {{companyName}} Supplier Portal Credentials & Active Inquiries ({{targetProduct}})',
    badgeLabel: 'TRADE HEAVEN • VERIFIED SUPPLIER ONBOARDING DESK',
    headline: 'Welcome to Trade Heaven, {{companyName}}',
    subheadline: 'Supplier Profile Activated & Verified Buyer Inquiries Assigned',
    body: 'Dear {{contactPerson}},\n\nWe are pleased to confirm that {{companyName}} ({{country}}) has been officially approved on the Trade Heaven Global B2B Portal under {{targetProduct}}. Your dedicated International Export Manager is {{assignedIem}}.\n\nWe have matched active wholesale buyer inquiries directly to your export catalog. Please use your portal credentials below to log in, review buyer specifications, and submit your official FOB/CIF quotation.',
    ctaText: 'Log In to Supplier Portal & View Inquiries →',
    ctaUrl: 'https://www.tradeheaven.net',
    includeCredentialsBox: true,
    includeLoginGuide: true,
    includeEscrowBadge: true,
    updatedAt: '2026-10-25T06:30:00.000Z'
  },
  {
    id: 'tpl-supplier-buyer-inquiry-alert',
    name: 'Urgent Buyer RFQ Match Notification (For Suppliers)',
    targetAudience: 'SUPPLIER',
    subject: 'Action Required: New Verified Buyer Inquiry for {{companyName}} ({{targetProduct}})',
    badgeLabel: 'TRADE HEAVEN • GLOBAL PROCUREMENT MATCH DESK',
    headline: 'New High-Value Buyer Inquiry Matched',
    subheadline: 'Verified Institutional Buyer Seeking {{targetProduct}}',
    body: 'Dear {{contactPerson}},\n\nA verified international buyer has submitted an urgent procurement inquiry matching {{companyName}}\'s supply capabilities in {{targetProduct}}.\n\nYour account manager ({{assignedIem}}) has prioritized your profile for this tender. Please log in to your Trade Heaven dashboard to inspect the required volume, destination port, and payment terms.',
    ctaText: 'Access Dashboard & Submit Quote →',
    ctaUrl: 'https://www.tradeheaven.net',
    includeCredentialsBox: true,
    includeLoginGuide: false,
    includeEscrowBadge: true,
    updatedAt: '2026-10-25T06:45:00.000Z'
  },
  {
    id: 'tpl-buyer-verified-suppliers-ready',
    name: 'Verified Supplier Quotations Ready (For Buyers)',
    targetAudience: 'BUYER',
    subject: 'Trade Heaven Sourcing Update: Verified Supplier Quotes for {{targetProduct}} ({{companyName}})',
    badgeLabel: 'TRADE HEAVEN • BUYER SOURCING & ESCROW DESK',
    headline: 'Verified Supplier Quotations Ready for {{companyName}}',
    subheadline: 'Matched Export Manufacturers for {{targetProduct}} ({{requiredQuantity}})',
    body: 'Dear {{contactPerson}},\n\nThank you for sourcing with Trade Heaven. Our procurement team led by {{assignedIem}} has vetted and matched top-tier verified suppliers for your requirement of {{targetProduct}} (Target Volume: {{requiredQuantity}} | Budget: {{budget}}).\n\nLog in to your Buyer Console to compare audited factory quotes, request SGS inspection reports, and initiate Escrow-protected trade contracts.',
    ctaText: 'Review Supplier Quotes in Buyer Console →',
    ctaUrl: 'https://www.tradeheaven.net',
    includeCredentialsBox: true,
    includeLoginGuide: true,
    includeEscrowBadge: true,
    updatedAt: '2026-10-25T07:00:00.000Z'
  },
  {
    id: 'tpl-buyer-escrow-assurance',
    name: 'Trade Assurance & SBLC/Escrow Protection Guide (For Buyers)',
    targetAudience: 'BUYER',
    subject: 'Trade Protection Advisory for {{companyName}}: Securing Your {{targetProduct}} Shipment',
    badgeLabel: 'TRADE HEAVEN • TRADE FINANCE & ESCROW DIVISION',
    headline: '100% Payment & Quality Protection for {{companyName}}',
    subheadline: 'Regulated Escrow & Pre-Shipment SGS Inspection Protocol',
    body: 'Dear {{contactPerson}},\n\nTo ensure complete security on your upcoming procurement of {{targetProduct}} ({{requiredQuantity}} to {{country}}), your assigned manager {{assignedIem}} has enabled Trade Heaven Escrow Protection on your account.\n\nAll supplier disbursements remain locked until independent SGS/Saybolt quality & quantity verification is completed at the loading port.',
    ctaText: 'View Escrow Terms & Activate Protection →',
    ctaUrl: 'https://www.tradeheaven.net',
    includeCredentialsBox: false,
    includeLoginGuide: false,
    includeEscrowBadge: true,
    updatedAt: '2026-10-25T07:10:00.000Z'
  }
];

const INITIAL_IEM_MANAGERS = [
  'IEM Sarah Jenkins (Global Accounts)',
  'IEM Michael Chang (APAC Manufacturing)',
  'IEM David Vance (EMEA Trade)',
  'IEM Elena Rostova (Americas Sourcing)',
  'IEM Omar Al-Farsi (MENA Procurement)'
];

const SAMPLE_DATA: Record<EntityCategory, BulkEntityRecord[]> = {
  BUYER_LEAD: [
    { id: 'b-1', companyName: 'Apex Global Logistics & Sourcing', contactPerson: 'Marcus Vance', email: 'm.vance@apexglobal.com', phone: '+1-415-892-3321', country: 'United States', targetProduct: 'Solar Inverters 10kW', requiredQuantity: '500 units', budget: '$120,000', priority: 'HOT', assignedIem: 'IEM Sarah Jenkins', leadStatus: 'QUALIFIED', scheduledFollowUp: { date: '2026-10-26', time: '09:30', timezone: 'EST (America/New_York)', channel: 'Automated Template Email', note: 'Send verified supplier CIF quotations' } },
    { id: 'b-2', companyName: 'Bavarian Auto Components GmbH', contactPerson: 'Greta Schmidt', email: 'schmidt@bavarian-auto.de', phone: '+49-89-4412-90', country: 'Germany', targetProduct: 'CNC Aluminum Castings', requiredQuantity: '2,500 pcs', budget: '€85,000', priority: 'WARM', assignedIem: 'IEM David Vance', leadStatus: 'CONTACTED' },
    { id: 'b-3', companyName: 'Tokyo Retail Enterprises', contactPerson: 'Kenji Sato', email: 'k-sato@tokyoretail.jp', phone: '+81-3-5521-8840', country: 'Japan', targetProduct: 'Organic Cotton Apparel', requiredQuantity: '10,000 units', budget: '$45,000', priority: 'HOT', assignedIem: 'IEM Michael Chang', leadStatus: 'IN_NEGOTIATION' },
    { id: 'b-4', companyName: 'Dubai Horizon Trading FZE', contactPerson: 'Tariq Al-Mansoor', email: 'tariq@horizon-dubai.ae', phone: '+971-4-332-9911', country: 'United Arab Emirates', targetProduct: 'Refined Sunflower Oil', requiredQuantity: '20 Metric Tons', budget: '$30,000', priority: 'COLD', assignedIem: 'IEM Omar Al-Farsi', leadStatus: 'NEW_LEAD' },
    { id: 'b-5', companyName: 'São Paulo Importadora Ltda', contactPerson: 'Camila Silva', email: 'csilva@spimport.com.br', phone: '+55-11-3099-4411', country: 'Brazil', targetProduct: 'Medical Nitrile Gloves', requiredQuantity: '50,000 boxes', budget: '$150,000', priority: 'HOT', assignedIem: 'IEM Elena Rostova', leadStatus: 'PROPOSAL_SENT' }
  ],
  SUPPLIER_PROFILE: [
    { id: 's-mark-johnson', companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)', contactPerson: 'Mark Johnson (President)', email: 'mjohnson@atlanticpowerequip.com', phone: 'C: +1-609-374-5131 | O: +1-609-965-8200 | WhatsApp: +16093745131', country: 'United States (P.O. Box 1176, Marmora, NJ 08223)', category: 'CAT Earth Moving Machines & Industrial Generators (Basic Plan Member)', starRating: 5, productShowcaseLimit: 50, assignedIem: 'IEM Sarah Jenkins (Global Accounts)', leadStatus: 'ONBOARDED', scheduledFollowUp: { date: '2026-10-26', time: '09:00', timezone: 'EST (America/New_York)', channel: 'Automated Template Email', note: 'Golden Lead: 10 Generators to Canada (100% Advance Payment • VIP Exclusive + Diwali Offer)' } },
    { id: 's-0', companyName: 'Middle Fox LLC', contactPerson: 'Mr. Randy', email: 'randy@midforkcap.com', phone: '+1 (406) 309 5590', country: 'United States', category: 'Petroleum & Fuel (EN 590, Jet Fuel A-1)', starRating: 5, productShowcaseLimit: 50, assignedIem: 'IEM Elena Rostova', leadStatus: 'ONBOARDED', scheduledFollowUp: { date: '2026-10-26', time: '10:00', timezone: 'EST (America/New_York)', channel: 'Escrow & Contract Review', note: 'Review active EN 590 buyer tenders' } },
    { id: 's-1', companyName: 'Zhejiang Precision Machinery Co.', contactPerson: 'Chen Wei', email: 'export@zjprecision.cn', phone: '+86-571-8899-2211', country: 'China', category: 'Industrial Machinery', starRating: 5, productShowcaseLimit: 50, assignedIem: 'IEM Michael Chang', leadStatus: 'QUALIFIED' },
    { id: 's-2', companyName: 'Vanguard Steel & Alloy Works', contactPerson: 'Rajesh Patel', email: 'sales@vanguardsteel.in', phone: '+91-22-6644-1122', country: 'India', category: 'Metals & Metallurgy', starRating: 4, productShowcaseLimit: 30, assignedIem: 'IEM Sarah Jenkins', leadStatus: 'CONTACTED' },
    { id: 's-3', companyName: 'Nordic Timber & Pulp AB', contactPerson: 'Lars Lindqvist', email: 'orders@nordictimber.se', phone: '+46-8-555-1234', country: 'Sweden', category: 'Forestry & Paper', starRating: 5, productShowcaseLimit: 40, assignedIem: 'IEM David Vance', leadStatus: 'NEW_LEAD' },
    { id: 's-4', companyName: 'Andean Agro-Export S.A.C.', contactPerson: 'Sofia Mendoza', email: 'smendoza@andeanagro.pe', phone: '+51-1-442-9900', country: 'Peru', category: 'Agriculture & Foods', starRating: 4, productShowcaseLimit: 25, assignedIem: 'IEM Elena Rostova', leadStatus: 'NURTURE' }
  ],
  RFQ: [
    { id: 'r-golden-canada-10gen', rfqTitle: '🌟 GOLDEN LEAD [VIP Exclusive • 100% Advance Payment]: 10 Units Industrial Diesel Generators to Canada + Special Diwali Offer', targetPrice: '$95,000 / Unit (100% Advance)', volumeUnit: '10 Generators', portOfDestination: 'Toronto / Calgary / Vancouver, Canada', incoterm: 'DDP / CIF', expiryDate: '2026-12-31', companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)', contactPerson: 'Mark Johnson (President)', email: 'mjohnson@atlanticpowerequip.com', assignedIem: 'IEM Sarah Jenkins (Global Accounts)', leadStatus: 'PROPOSAL_SENT' },
    { id: 'r-1', rfqTitle: 'High-Efficiency Monocrystalline Solar Panels 550W', targetPrice: '$110 / panel', volumeUnit: '2,000 Panels', portOfDestination: 'Port of Rotterdam, Netherlands', incoterm: 'CIF', expiryDate: '2026-09-30', companyName: 'EcoPower Solutions BV', contactPerson: 'Jan van Dijk', email: 'jan@ecopower.nl', assignedIem: 'IEM David Vance', leadStatus: 'QUALIFIED' },
    { id: 'r-2', rfqTitle: 'Lithium-Ion Battery Cell 3.2V 100Ah for EV Storage', targetPrice: '$45 / cell', volumeUnit: '5,000 Cells', portOfDestination: 'Port of Long Beach, USA', incoterm: 'FOB', expiryDate: '2026-10-15', companyName: 'VoltDrive Systems Inc', contactPerson: 'Sarah Connor', email: 'sconnor@voltdrive.us', assignedIem: 'IEM Sarah Jenkins', leadStatus: 'IN_NEGOTIATION' },
    { id: 'r-3', rfqTitle: 'Seamless Carbon Steel Pipes API 5L Gr. B', targetPrice: '$820 / Ton', volumeUnit: '450 Metric Tons', portOfDestination: 'Jebel Ali Port, UAE', incoterm: 'CFR', expiryDate: '2026-09-15', companyName: 'Gulf Pipeline Contractors', contactPerson: 'Nasser Al-Sabah', email: 'nasser@gulfpipes.kw', assignedIem: 'IEM Omar Al-Farsi', leadStatus: 'NEW_LEAD' }
  ],
  GENERAL_INQUIRY: [
    { id: 'g-1', subject: 'Custom Customs Clearance Inquiry for ASEAN shipments', contactPerson: 'Li Ming', companyName: 'Shanghai Express Logistics', email: 'ming@shanghaiexpress.cn', phone: '+86-21-6000-1111', message: 'Seeking official advisory on customs expedited clearance for electronic parts entering Rotterdam.', inquiryType: 'Customs & Regulatory', status: 'Pending Review', leadStatus: 'NEW_LEAD' },
    { id: 'g-2', subject: 'Trade Assurance Escrow limit increase request', contactPerson: 'Arthur Pendelton', companyName: 'Global Trade Partners UK', email: 'arthur@gtpuk.co.uk', phone: '+44-20-7946-0912', message: 'We wish to elevate our escrow threshold to $500,000 for upcoming bulk agricultural shipments.', inquiryType: 'Trade Finance', status: 'In Review', leadStatus: 'QUALIFIED' }
  ]
};

export const BulkEntityCrmModule: React.FC = () => {
  const [entityCategory, setEntityCategory] = useState<EntityCategory>('BUYER_LEAD');
  const [inputMode, setInputMode] = useState<InputMode>('SPREADSHEET');
  const [records, setRecords] = useState<BulkEntityRecord[]>(SAMPLE_DATA['BUYER_LEAD']);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['b-1', 'b-2']);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<LeadPipelineStatus>('QUALIFIED');
  const [showBulkFollowUpDrawer, setShowBulkFollowUpDrawer] = useState<boolean>(false);
  const [bulkFollowUpDate, setBulkFollowUpDate] = useState<string>(() => {
    const tom = new Date(Date.now() + 24 * 3600 * 1000);
    return tom.toISOString().slice(0, 10);
  });
  const [bulkFollowUpTime, setBulkFollowUpTime] = useState<string>('10:00');
  const [bulkFollowUpTimezone, setBulkFollowUpTimezone] = useState<string>('UTC');
  const [bulkFollowUpChannel, setBulkFollowUpChannel] = useState<string>('Automated Template Email');
  const [bulkFollowUpNote, setBulkFollowUpNote] = useState<string>('Follow up on verified quotation & Escrow terms');
  const [bulkFollowUpQueueEmail, setBulkFollowUpQueueEmail] = useState<boolean>(true);
  const [globalIem, setGlobalIem] = useState<string>('IEM Sarah Jenkins (Global Accounts)');
  const [rawPasteText, setRawPasteText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessCount, setSubmitSuccessCount] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reusable Email Templates State
  const [templates, setTemplates] = useState<ReusableEmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(CRM_TEMPLATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_REUSABLE_TEMPLATES;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_REUSABLE_TEMPLATES[0].id);
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'SUPPLIER' | 'BUYER'>('ALL');
  const [editingTemplate, setEditingTemplate] = useState<ReusableEmailTemplate>(DEFAULT_REUSABLE_TEMPLATES[0]);
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState<boolean>(false);
  const [previewRecordIndex, setPreviewRecordIndex] = useState<number>(0);
  const [showEmailPreviewPanel, setShowEmailPreviewPanel] = useState<boolean>(true);
  const [isDispatchingEmail, setIsDispatchingEmail] = useState<boolean>(false);
  const [dispatchResultBanner, setDispatchResultBanner] = useState<{
    success: boolean;
    message: string;
    sentCount: number;
  } | null>(null);

  // Saved PDF Documents Library & Attached PDFs (up to 3 max)
  const [savedPdfLibrary, setSavedPdfLibrary] = useState<SavedPdfDocument[]>(() => {
    try {
      const stored = localStorage.getItem(CRM_SAVED_PDFS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_SAVED_PDF_DOCUMENTS;
  });
  const [attachedPdfIds, setAttachedPdfIds] = useState<string[]>([
    'pdf-trade-assurance-terms',
    'pdf-marketplace-onboarding-guide'
  ]);
  const [showAddPdfForm, setShowAddPdfForm] = useState<boolean>(false);
  const [newPdfTitle, setNewPdfTitle] = useState<string>('');
  const [newPdfCategory, setNewPdfCategory] = useState<string>('Compliance & Terms');
  const [newPdfDescription, setNewPdfDescription] = useState<string>('');
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Persist templates to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(CRM_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // ignore storage errors
    }
  }, [templates]);

  // Persist saved PDF library to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(CRM_SAVED_PDFS_STORAGE_KEY, JSON.stringify(savedPdfLibrary));
    } catch {
      // ignore storage errors
    }
  }, [savedPdfLibrary]);

  const selectedPdfAttachments = savedPdfLibrary.filter(doc => attachedPdfIds.includes(doc.id)).slice(0, MAX_PDF_ATTACHMENTS);

  const handleTogglePdfAttachment = (pdfId: string) => {
    setAttachedPdfIds(prev => {
      if (prev.includes(pdfId)) {
        return prev.filter(id => id !== pdfId);
      }
      if (prev.length >= MAX_PDF_ATTACHMENTS) {
        showToast(`You can attach up to ${MAX_PDF_ATTACHMENTS} PDF documents per email. Deselect one first.`);
        return prev;
      }
      const doc = savedPdfLibrary.find(d => d.id === pdfId);
      if (doc) {
        showToast(`Attached "${doc.title}" (${prev.length + 1}/${MAX_PDF_ATTACHMENTS} PDFs)`);
      }
      return [...prev, pdfId];
    });
  };

  const handleAddCustomSavedPdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdfTitle.trim()) {
      showToast('Please enter a title for the saved PDF document.');
      return;
    }
    const cleanSlug = newPdfTitle.trim().replace(/[^a-zA-Z0-9]+/g, '_');
    const newDoc: SavedPdfDocument = {
      id: `pdf-custom-${Date.now()}`,
      title: newPdfTitle.trim(),
      fileName: `${cleanSlug}_2026.pdf`,
      fileSizeLabel: '380 KB',
      category: newPdfCategory.trim() || 'Trade Document',
      description: newPdfDescription.trim() || 'Official Trade Heaven PDF document attachment for suppliers and buyers.'
    };
    setSavedPdfLibrary(prev => [newDoc, ...prev]);
    if (attachedPdfIds.length < MAX_PDF_ATTACHMENTS) {
      setAttachedPdfIds(prev => [...prev, newDoc.id]);
    }
    setNewPdfTitle('');
    setNewPdfDescription('');
    setShowAddPdfForm(false);
    showToast(`Saved "${newDoc.title}" to reusable PDF library!`);
  };

  const handleUploadNewPdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const baseTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
    const sizeKb = Math.max(120, Math.round(file.size / 1024));
    const newDoc: SavedPdfDocument = {
      id: `pdf-upload-${Date.now()}`,
      title: baseTitle,
      fileName: file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`,
      fileSizeLabel: `${sizeKb} KB`,
      category: 'Uploaded PDF',
      description: `Uploaded corporate PDF document (${file.name})`
    };
    setSavedPdfLibrary(prev => [newDoc, ...prev]);
    if (attachedPdfIds.length < MAX_PDF_ATTACHMENTS) {
      setAttachedPdfIds(prev => [...prev, newDoc.id]);
      showToast(`Uploaded & attached "${newDoc.title}" (${attachedPdfIds.length + 1}/${MAX_PDF_ATTACHMENTS})`);
    } else {
      showToast(`Uploaded "${newDoc.title}" to PDF library (3/3 attachments already active).`);
    }
    e.target.value = '';
  };

  // When entity category changes, switch records
  useEffect(() => {
    const nextRecords = SAMPLE_DATA[entityCategory] || [];
    setRecords(nextRecords);
    setSelectedRowIds(nextRecords.slice(0, 2).map(r => r.id));
    setPreviewRecordIndex(0);
    setSubmitSuccessCount(null);
  }, [entityCategory]);

  // Interpolate template variables with a BulkEntityRecord
  const interpolateText = (rawText: string, rec?: BulkEntityRecord): string => {
    if (!rawText) return '';
    const sample: BulkEntityRecord = rec || records[0] || {
      id: 'sample-default',
      companyName: 'ACE Intermediary',
      contactPerson: 'Ali Charley Ezekiah',
      email: 'ezekiahali355@gmail.com',
      country: '1241 Hackberry Avenue Corsicana Texas 75110',
      targetProduct: 'VIP Membership Renewal & Global Trade Deals',
      requiredQuantity: 'Annual Subscription Renewal',
      budget: '$1,499 USD',
      assignedIem: globalIem
    };
    const productOrCategory = sample.targetProduct || sample.category || sample.rfqTitle || sample.inquiryType || 'Global Commodities';
    const qtyOrVolume = sample.requiredQuantity || sample.volumeUnit || 'Bulk Contract Volume';
    const priceOrBudget = sample.budget || sample.targetPrice || 'Negotiable FOB/CIF';
    const contactName = sample.contactPerson || sample.companyName || 'Ali Charley Ezekiah';
    const addressVal = sample.country || '1241 Hackberry Avenue Corsicana Texas 75110';
    const paymentMethodVal = 'Debit Card';

    return rawText
      .replace(/\{\{companyName\}\}/g, sample.companyName || 'ACE Intermediary')
      .replace(/\{\{decisionMakerName\}\}/g, contactName)
      .replace(/\{\{contactPerson\}\}/g, contactName)
      .replace(/\{\{address\}\}/g, addressVal)
      .replace(/\{\{email\}\}/g, sample.email || 'ezekiahali355@gmail.com')
      .replace(/\{\{paymentMethod\}\}/g, paymentMethodVal)
      .replace(/\{\{country\}\}/g, sample.country || sample.portOfDestination || 'Global')
      .replace(/\{\{targetProduct\}\}/g, productOrCategory)
      .replace(/\{\{requiredQuantity\}\}/g, qtyOrVolume)
      .replace(/\{\{budget\}\}/g, priceOrBudget)
      .replace(/\{\{assignedIem\}\}/g, sample.assignedIem || globalIem);
  };

  // Return structured list of variables and their filled values for the Email Preview panel
  const getResolvedVariablesList = (rec?: BulkEntityRecord) => {
    const sample: BulkEntityRecord = rec || records[0] || {
      id: 'sample-default',
      companyName: 'ACE Intermediary',
      contactPerson: 'Ali Charley Ezekiah',
      email: 'ezekiahali355@gmail.com',
      country: '1241 Hackberry Avenue Corsicana Texas 75110',
      targetProduct: 'VIP Membership Renewal & Global Trade Deals',
      requiredQuantity: 'Annual Subscription Renewal',
      budget: '$1,499 USD',
      assignedIem: globalIem
    };
    return [
      { tag: '{{companyName}}', label: 'Company Name', value: sample.companyName || 'ACE Intermediary' },
      { tag: '{{decisionMakerName}}', label: 'Decision Maker Name', value: sample.contactPerson || 'Ali Charley Ezekiah' },
      { tag: '{{address}}', label: 'Address', value: sample.country || '1241 Hackberry Avenue Corsicana Texas 75110' },
      { tag: '{{email}}', label: 'Recipient Email', value: sample.email || 'ezekiahali355@gmail.com' },
      { tag: '{{paymentMethod}}', label: 'Payment Method', value: 'Debit Card' },
      { tag: '{{contactPerson}}', label: 'Recipient Name', value: sample.contactPerson || sample.companyName || 'Ali Charley Ezekiah' },
      { tag: '{{country}}', label: 'Country / Port', value: sample.country || sample.portOfDestination || 'Global' },
      { tag: '{{targetProduct}}', label: 'Product / Category', value: sample.targetProduct || sample.category || sample.rfqTitle || sample.inquiryType || 'Global Commodities' },
      { tag: '{{requiredQuantity}}', label: 'Volume / Quantity', value: sample.requiredQuantity || sample.volumeUnit || 'Bulk Contract Volume' },
      { tag: '{{budget}}', label: 'Budget / Target Price', value: sample.budget || sample.targetPrice || 'Negotiable FOB/CIF' },
      { tag: '{{assignedIem}}', label: 'Assigned Manager', value: sample.assignedIem || globalIem }
    ];
  };

  // Open the Email Preview panel for a specific row index before sending
  const handleOpenPreviewForRow = (index: number) => {
    setPreviewRecordIndex(index);
    setShowEmailPreviewPanel(true);
    showToast(`Loaded "${records[index]?.companyName || records[index]?.contactPerson || 'Contact'}" into Email Preview.`);
  };

  // Select a template from the list
  const handleSelectTemplate = (tpl: ReusableEmailTemplate) => {
    setSelectedTemplateId(tpl.id);
    setEditingTemplate({ ...tpl });
    setIsCreatingNewTemplate(false);
  };

  // Start creating a new blank/customizable template
  const handleStartNewTemplate = (defaultAudience?: TemplateTargetAudience) => {
    const newId = `tpl-custom-${Date.now()}`;
    const aud: TemplateTargetAudience =
      defaultAudience || (entityCategory === 'SUPPLIER_PROFILE' ? 'SUPPLIER' : 'BUYER');
    const draft: ReusableEmailTemplate = {
      id: newId,
      name: aud === 'SUPPLIER' ? 'New Supplier Outreach Template' : 'New Buyer Outreach Template',
      targetAudience: aud,
      subject: aud === 'SUPPLIER'
        ? 'Trade Heaven Supplier Invitation & Active Buyer Inquiries for {{companyName}}'
        : 'Trade Heaven Verified Supplier Quotations for {{companyName}} ({{targetProduct}})',
      badgeLabel: aud === 'SUPPLIER'
        ? 'TRADE HEAVEN • SUPPLIER ONBOARDING & TENDERS'
        : 'TRADE HEAVEN • BUYER SOURCING DESK',
      headline: 'Hello {{contactPerson}} at {{companyName}}',
      subheadline: 'Exclusive B2B Trade Update for {{targetProduct}}',
      body: 'Dear {{contactPerson}},\n\nWe are reaching out regarding {{companyName}}\'s trade operations in {{targetProduct}} ({{country}}).\n\nYour dedicated International Export Manager {{assignedIem}} has prepared your portal workspace. Please click the link below to access your dashboard.',
      ctaText: 'Log In to Trade Heaven Portal →',
      ctaUrl: 'https://www.tradeheaven.net',
      includeCredentialsBox: true,
      includeLoginGuide: true,
      includeEscrowBadge: true,
      updatedAt: new Date().toISOString()
    };
    setEditingTemplate(draft);
    setSelectedTemplateId(newId);
    setIsCreatingNewTemplate(true);
  };

  // Save current template (either new or existing)
  const handleSaveTemplate = () => {
    if (!editingTemplate.name.trim() || !editingTemplate.subject.trim()) {
      showToast('Please provide both a Template Name and Subject Line before saving.');
      return;
    }
    const updatedTpl: ReusableEmailTemplate = {
      ...editingTemplate,
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => {
      const exists = prev.some(t => t.id === updatedTpl.id);
      if (exists) {
        return prev.map(t => (t.id === updatedTpl.id ? updatedTpl : t));
      }
      return [updatedTpl, ...prev];
    });
    setSelectedTemplateId(updatedTpl.id);
    setIsCreatingNewTemplate(false);
    showToast(`Saved reusable template "${updatedTpl.name}"!`);
  };

  // Duplicate template
  const handleDuplicateTemplate = (tpl: ReusableEmailTemplate) => {
    const copyId = `tpl-copy-${Date.now()}`;
    const cloned: ReusableEmailTemplate = {
      ...tpl,
      id: copyId,
      name: `${tpl.name} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [cloned, ...prev]);
    setSelectedTemplateId(copyId);
    setEditingTemplate(cloned);
    setIsCreatingNewTemplate(false);
    showToast(`Duplicated template "${tpl.name}"`);
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    if (templates.length <= 1) {
      showToast('At least one reusable template must remain.');
      return;
    }
    const remaining = templates.filter(t => t.id !== id);
    setTemplates(remaining);
    if (selectedTemplateId === id && remaining.length > 0) {
      setSelectedTemplateId(remaining[0].id);
      setEditingTemplate({ ...remaining[0] });
    }
    showToast('Deleted email template.');
  };

  // Insert merge tag into body or subject
  const handleInsertMergeTag = (tag: string, targetField: 'subject' | 'body') => {
    setEditingTemplate(prev => ({
      ...prev,
      [targetField]: `${prev[targetField]}${prev[targetField].endsWith(' ') || !prev[targetField] ? '' : ' '}${tag}`
    }));
  };

  // -------------------------------------------------------------
  // DELIVERY ANALYTICS STATE & ENGAGEMENT TRACKING ENGINE
  // -------------------------------------------------------------
  const [deliveryAnalyticsRecords, setDeliveryAnalyticsRecords] = useState<SentTemplateDeliveryRecord[]>(() => {
    try {
      const stored = localStorage.getItem(CRM_DELIVERY_ANALYTICS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_DELIVERY_ANALYTICS_RECORDS;
  });
  const [analyticsTemplateFilter, setAnalyticsTemplateFilter] = useState<string>('ALL');
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState<'ALL' | 'CLICKED' | 'OPENED' | 'DELIVERED' | 'BOUNCED'>('ALL');
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(CRM_DELIVERY_ANALYTICS_STORAGE_KEY, JSON.stringify(deliveryAnalyticsRecords));
    } catch {
      // ignore storage errors
    }
  }, [deliveryAnalyticsRecords]);

  const recordNewSentAnalyticsEntry = (rec: BulkEntityRecord, tpl: ReusableEmailTemplate, resolvedSubject: string, didSucceed = true) => {
    const newEntry: SentTemplateDeliveryRecord = {
      id: `da-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      templateId: tpl.id,
      templateName: tpl.name,
      targetAudience: tpl.targetAudience,
      recipientEmail: rec.email || 'contact@company.com',
      recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
      companyName: rec.companyName || 'Partner Organization',
      country: rec.country || rec.portOfDestination || 'Global',
      subject: resolvedSubject,
      dispatchedAt: new Date().toISOString(),
      status: didSucceed ? 'DELIVERED' : 'SOFT_BOUNCE',
      openCount: 0,
      clickCount: 0,
      bounceCode: didSucceed ? undefined : '421 4.4.0',
      bounceReason: didSucceed ? undefined : 'Temporary SMTP relay timeout — queued for retry',
      attachedPdfTitles: selectedPdfAttachments.map(d => d.title)
    };
    setDeliveryAnalyticsRecords(prev => [newEntry, ...prev]);
  };

  const handleSimulateLeadEngagement = (recordId: string, action: 'OPEN' | 'CLICK') => {
    const nowIso = new Date().toISOString();
    setDeliveryAnalyticsRecords(prev =>
      prev.map(item => {
        if (item.id !== recordId) return item;
        if (action === 'OPEN') {
          return {
            ...item,
            status: item.status === 'CLICKED' ? 'CLICKED' : 'OPENED',
            openCount: item.openCount + 1,
            lastOpenedAt: nowIso
          };
        }
        return {
          ...item,
          status: 'CLICKED',
          openCount: Math.max(1, item.openCount),
          lastOpenedAt: item.lastOpenedAt || nowIso,
          clickCount: item.clickCount + 1,
          lastClickedAt: nowIso,
          clickedTargetLabel: item.clickedTargetLabel || 'Portal CTA Link & Attached PDF'
        };
      })
    );
    showToast(
      action === 'OPEN'
        ? 'Recorded new email open event in Delivery Analytics!'
        : 'Recorded new link click-through event in Delivery Analytics!'
    );
  };

  const handleRetryBouncedDelivery = async (entry: SentTemplateDeliveryRecord) => {
    setIsDispatchingEmail(true);
    try {
      const res = await fetch('/api/v1/admin/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: entry.recipientName,
          recipientEmail: entry.recipientEmail,
          companyName: entry.companyName,
          subject: entry.subject,
          headline: entry.subject,
          introMessage: `Re-dispatched template "${entry.templateName}" following bounce resolution.`,
          attachedDocuments: selectedPdfAttachments
        })
      });
      if (res.ok) {
        setDeliveryAnalyticsRecords(prev =>
          prev.map(item =>
            item.id === entry.id
              ? {
                  ...item,
                  status: 'DELIVERED',
                  bounceCode: undefined,
                  bounceReason: undefined,
                  dispatchedAt: new Date().toISOString()
                }
              : item
          )
        );
        showToast(`Successfully re-dispatched bounced email to ${entry.recipientEmail}!`);
      }
    } catch {
      showToast('Failed to retry bounced delivery.');
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  // Compute global and per-template Delivery Analytics metrics
  const totalSentEmails = deliveryAnalyticsRecords.length;
  const totalHardBounced = deliveryAnalyticsRecords.filter(r => r.status === 'HARD_BOUNCE').length;
  const totalSoftBounced = deliveryAnalyticsRecords.filter(r => r.status === 'SOFT_BOUNCE').length;
  const totalBouncedEmails = totalHardBounced + totalSoftBounced;
  const totalDeliveredEmails = Math.max(0, totalSentEmails - totalBouncedEmails);
  const uniqueOpenedEmails = deliveryAnalyticsRecords.filter(
    r => r.status === 'OPENED' || r.status === 'CLICKED' || r.openCount > 0
  ).length;
  const uniqueClickedEmails = deliveryAnalyticsRecords.filter(
    r => r.status === 'CLICKED' || r.clickCount > 0
  ).length;
  const totalOpenEventsCount = deliveryAnalyticsRecords.reduce((acc, r) => acc + r.openCount, 0);
  const totalClickEventsCount = deliveryAnalyticsRecords.reduce((acc, r) => acc + r.clickCount, 0);

  const globalDeliveryRatePct = totalSentEmails > 0 ? Math.round((totalDeliveredEmails / totalSentEmails) * 1000) / 10 : 0;
  const globalOpenRatePct = totalDeliveredEmails > 0 ? Math.round((uniqueOpenedEmails / totalDeliveredEmails) * 1000) / 10 : 0;
  const globalClickThroughRatePct = totalDeliveredEmails > 0 ? Math.round((uniqueClickedEmails / totalDeliveredEmails) * 1000) / 10 : 0;
  const globalBounceRatePct = totalSentEmails > 0 ? Math.round((totalBouncedEmails / totalSentEmails) * 1000) / 10 : 0;

  const perTemplateAnalytics = templates.map(tpl => {
    const rows = deliveryAnalyticsRecords.filter(r => r.templateId === tpl.id);
    const sent = rows.length;
    const hardBounces = rows.filter(r => r.status === 'HARD_BOUNCE').length;
    const softBounces = rows.filter(r => r.status === 'SOFT_BOUNCE').length;
    const bounced = hardBounces + softBounces;
    const delivered = Math.max(0, sent - bounced);
    const opened = rows.filter(r => r.status === 'OPENED' || r.status === 'CLICKED' || r.openCount > 0).length;
    const clicked = rows.filter(r => r.status === 'CLICKED' || r.clickCount > 0).length;
    const totalOpens = rows.reduce((sum, r) => sum + r.openCount, 0);
    const totalClicks = rows.reduce((sum, r) => sum + r.clickCount, 0);
    const openRate = delivered > 0 ? Math.round((opened / delivered) * 1000) / 10 : 0;
    const ctr = delivered > 0 ? Math.round((clicked / delivered) * 1000) / 10 : 0;
    const bounceRate = sent > 0 ? Math.round((bounced / sent) * 1000) / 10 : 0;

    return {
      templateId: tpl.id,
      templateName: tpl.name,
      targetAudience: tpl.targetAudience,
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      hardBounces,
      softBounces,
      totalOpens,
      totalClicks,
      openRate,
      ctr,
      bounceRate
    };
  });

  const filteredAnalyticsFeed = deliveryAnalyticsRecords.filter(r => {
    if (analyticsTemplateFilter !== 'ALL' && r.templateId !== analyticsTemplateFilter) return false;
    if (analyticsStatusFilter === 'CLICKED' && r.status !== 'CLICKED') return false;
    if (analyticsStatusFilter === 'OPENED' && r.status !== 'OPENED' && r.status !== 'CLICKED') return false;
    if (analyticsStatusFilter === 'DELIVERED' && (r.status === 'HARD_BOUNCE' || r.status === 'SOFT_BOUNCE')) return false;
    if (analyticsStatusFilter === 'BOUNCED' && r.status !== 'HARD_BOUNCE' && r.status !== 'SOFT_BOUNCE') return false;
    if (analyticsSearchQuery.trim()) {
      const q = analyticsSearchQuery.toLowerCase();
      return (
        r.companyName.toLowerCase().includes(q) ||
        r.recipientName.toLowerCase().includes(q) ||
        r.recipientEmail.toLowerCase().includes(q) ||
        r.templateName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Send the active template to a single row contact
  const handleSendTemplateToSingleRow = async (rec: BulkEntityRecord) => {
    if (!rec.email || !rec.email.includes('@')) {
      showToast(`Row for "${rec.companyName || 'Unknown'}" does not have a valid email address.`);
      return;
    }
    setIsDispatchingEmail(true);
    setDispatchResultBanner(null);

    const resolvedSubject = interpolateText(editingTemplate.subject, rec);
    const resolvedHeadline = interpolateText(editingTemplate.headline, rec);
    const resolvedSubheadline = interpolateText(editingTemplate.subheadline, rec);
    const resolvedBody = interpolateText(editingTemplate.body, rec);

    try {
      const response = await fetch('/api/v1/admin/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
          recipientEmail: rec.email,
          companyName: rec.companyName || 'Partner Organization',
          contactPhone: rec.phone || '',
          loginEmail: rec.email,
          loginPassword: `${(rec.companyName || 'Trade').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'Partner'}@2026`,
          portalUrl: editingTemplate.ctaUrl || 'https://www.tradeheaven.net',
          subject: resolvedSubject,
          badgeLabel: editingTemplate.badgeLabel,
          headline: resolvedHeadline,
          subheadline: resolvedSubheadline,
          introMessage: resolvedBody,
          includeCredentialsBox: editingTemplate.includeCredentialsBox,
          includeLoginGuide: editingTemplate.includeLoginGuide,
          includeEscrowBadge: editingTemplate.includeEscrowBadge,
          ctaText: editingTemplate.ctaText,
          ctaUrl: editingTemplate.ctaUrl,
          inquiries: [],
          attachedDocuments: selectedPdfAttachments
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        recordNewSentAnalyticsEntry(rec, editingTemplate, resolvedSubject, true);
        const pdfNote =
          selectedPdfAttachments.length > 0
            ? ` with ${selectedPdfAttachments.length} PDF attachment(s) (${selectedPdfAttachments.map(d => d.title).join(', ')})`
            : '';
        showToast(`Dispatched "${editingTemplate.name}"${pdfNote} to ${rec.email}`);
        setDispatchResultBanner({
          success: true,
          message: `Successfully sent "${resolvedSubject}" to ${rec.contactPerson || rec.companyName} (${rec.email})${pdfNote}. Logged in Company Email History & Delivery Analytics.`,
          sentCount: 1
        });
      } else {
        recordNewSentAnalyticsEntry(rec, editingTemplate, resolvedSubject, false);
        setDispatchResultBanner({
          success: false,
          message: data.error || `Failed to dispatch email to ${rec.email}`,
          sentCount: 0
        });
      }
    } catch (err: any) {
      setDispatchResultBanner({
        success: false,
        message: err?.message || 'Network error while dispatching template email.',
        sentCount: 0
      });
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  // Bulk send the active template to all valid rows in the current staging table
  const handleBulkSendTemplateToAllValidRows = async () => {
    const validRows = records.filter((r, idx) => validationResults[idx]?.isValid && r.email?.includes('@'));
    if (validRows.length === 0) {
      showToast('No valid rows with email addresses found in the current table.');
      return;
    }

    setIsDispatchingEmail(true);
    setDispatchResultBanner(null);
    let sentCounter = 0;

    for (const rec of validRows) {
      const resolvedSubject = interpolateText(editingTemplate.subject, rec);
      const resolvedHeadline = interpolateText(editingTemplate.headline, rec);
      const resolvedSubheadline = interpolateText(editingTemplate.subheadline, rec);
      const resolvedBody = interpolateText(editingTemplate.body, rec);

      try {
        const res = await fetch('/api/v1/admin/send-custom-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
            recipientEmail: rec.email,
            companyName: rec.companyName || 'Partner Organization',
            contactPhone: rec.phone || '',
            loginEmail: rec.email,
            loginPassword: `${(rec.companyName || 'Trade').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'Partner'}@2026`,
            portalUrl: editingTemplate.ctaUrl || 'https://www.tradeheaven.net',
            subject: resolvedSubject,
            badgeLabel: editingTemplate.badgeLabel,
            headline: resolvedHeadline,
            subheadline: resolvedSubheadline,
            introMessage: resolvedBody,
            includeCredentialsBox: editingTemplate.includeCredentialsBox,
            includeLoginGuide: editingTemplate.includeLoginGuide,
            includeEscrowBadge: editingTemplate.includeEscrowBadge,
            ctaText: editingTemplate.ctaText,
            ctaUrl: editingTemplate.ctaUrl,
            inquiries: [],
            attachedDocuments: selectedPdfAttachments
          })
        });
        if (res.ok) {
          sentCounter++;
          recordNewSentAnalyticsEntry(rec, editingTemplate, resolvedSubject, true);
        } else {
          recordNewSentAnalyticsEntry(rec, editingTemplate, resolvedSubject, false);
        }
      } catch {
        // continue with remaining rows
      }
    }

    setIsDispatchingEmail(false);
    const pdfSummary =
      selectedPdfAttachments.length > 0
        ? ` including ${selectedPdfAttachments.length} PDF attachment(s) (${selectedPdfAttachments.map(d => d.title).join(', ')})`
        : '';
    showToast(`Bulk dispatched template "${editingTemplate.name}" to ${sentCounter} contacts!`);
    setDispatchResultBanner({
      success: sentCounter > 0,
      message: `Bulk Campaign Complete: Sent reusable template "${editingTemplate.name}"${pdfSummary} to ${sentCounter} of ${validRows.length} valid ${entityCategory} contacts. All dispatches recorded in Company Email History & Delivery Analytics.`,
      sentCount: sentCounter
    });
  };

  // -------------------------------------------------------------
  // SCHEDULE EMAIL STATE & AUTOMATED DELIVERY HANDLERS
  // -------------------------------------------------------------
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmailJob[]>(() => {
    try {
      const saved = localStorage.getItem(CRM_SCHEDULED_EMAILS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [scheduleTimezone, setScheduleTimezone] = useState<string>('UTC');
  const [showScheduleQueuePanel, setShowScheduleQueuePanel] = useState<boolean>(true);
  const [isSchedulingEmail, setIsSchedulingEmail] = useState<boolean>(false);
  const [editingScheduleJobId, setEditingScheduleJobId] = useState<string | null>(null);
  const [editJobDate, setEditJobDate] = useState<string>('');
  const [editJobTime, setEditJobTime] = useState<string>('');
  const [editJobTimezone, setEditJobTimezone] = useState<string>('UTC');

  const fetchScheduledEmails = async () => {
    try {
      const res = await fetch('/api/v1/admin/scheduled-emails');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.scheduledEmails)) {
          setScheduledEmails(data.scheduledEmails);
          try {
            localStorage.setItem(CRM_SCHEDULED_EMAILS_STORAGE_KEY, JSON.stringify(data.scheduledEmails));
          } catch {
            // ignore storage errors
          }
        }
      }
    } catch {
      // keep existing state if offline
    }
  };

  useEffect(() => {
    void fetchScheduledEmails();
    const pollTimer = setInterval(() => {
      void fetchScheduledEmails();
    }, 10000);
    return () => clearInterval(pollTimer);
  }, []);

  const applyQuickSchedulePreset = (preset: 'IN_1_HOUR' | 'TOMORROW_9AM' | 'NEXT_MONDAY_9AM') => {
    const now = new Date();
    if (preset === 'IN_1_HOUR') {
      const inOneHr = new Date(now.getTime() + 3600 * 1000);
      setScheduleDate(inOneHr.toISOString().slice(0, 10));
      const hh = String(inOneHr.getHours()).padStart(2, '0');
      const mm = String(inOneHr.getMinutes()).padStart(2, '0');
      setScheduleTime(`${hh}:${mm}`);
      showToast(`Preset applied: 1 hour from now (${inOneHr.toISOString().slice(0, 10)} at ${hh}:${mm})`);
    } else if (preset === 'TOMORROW_9AM') {
      const tom = new Date(now.getTime() + 24 * 3600 * 1000);
      setScheduleDate(tom.toISOString().slice(0, 10));
      setScheduleTime('09:00');
      showToast(`Preset applied: Tomorrow (${tom.toISOString().slice(0, 10)}) at 09:00`);
    } else if (preset === 'NEXT_MONDAY_9AM') {
      const daysUntilMon = ((8 - now.getDay()) % 7) || 7;
      const nextMon = new Date(now.getTime() + daysUntilMon * 24 * 3600 * 1000);
      setScheduleDate(nextMon.toISOString().slice(0, 10));
      setScheduleTime('09:00');
      showToast(`Preset applied: Next Monday (${nextMon.toISOString().slice(0, 10)}) at 09:00`);
    }
  };

  const buildEmailPayloadForRecord = (rec: BulkEntityRecord) => {
    const resolvedSubject = interpolateText(editingTemplate.subject, rec);
    const resolvedHeadline = interpolateText(editingTemplate.headline, rec);
    const resolvedSubheadline = interpolateText(editingTemplate.subheadline, rec);
    const resolvedBody = interpolateText(editingTemplate.body, rec);

    return {
      recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
      recipientEmail: rec.email || '',
      companyName: rec.companyName || 'Partner Organization',
      contactPhone: rec.phone || '',
      loginEmail: rec.email || '',
      loginPassword: `${(rec.companyName || 'Trade').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'Partner'}@2026`,
      portalUrl: editingTemplate.ctaUrl || 'https://www.tradeheaven.net',
      subject: resolvedSubject,
      badgeLabel: editingTemplate.badgeLabel,
      headline: resolvedHeadline,
      subheadline: resolvedSubheadline,
      introMessage: resolvedBody,
      includeCredentialsBox: editingTemplate.includeCredentialsBox,
      includeLoginGuide: editingTemplate.includeLoginGuide,
      includeEscrowBadge: editingTemplate.includeEscrowBadge,
      ctaText: editingTemplate.ctaText,
      ctaUrl: editingTemplate.ctaUrl,
      inquiries: [],
      attachedDocuments: selectedPdfAttachments
    };
  };

  const handleScheduleSingleLead = async (rec: BulkEntityRecord) => {
    if (!rec.email || !rec.email.includes('@')) {
      showToast(`Row for "${rec.companyName || 'Unknown'}" does not have a valid email address.`);
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      showToast('Please select both a Delivery Date and Time to schedule the email.');
      return;
    }

    setIsSchedulingEmail(true);
    setDispatchResultBanner(null);

    const isoScheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    const jobItem = {
      templateId: editingTemplate.id,
      templateName: editingTemplate.name,
      entityCategory,
      recipientEmail: rec.email,
      recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
      companyName: rec.companyName || 'Partner Organization',
      scheduledFor: isoScheduledFor,
      scheduledDateLabel: scheduleDate,
      scheduledTimeLabel: scheduleTime,
      timezone: scheduleTimezone,
      emailPayload: buildEmailPayloadForRecord(rec)
    };

    try {
      const res = await fetch('/api/v1/admin/schedule-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [jobItem] })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.scheduledEmails)) {
          setScheduledEmails(data.scheduledEmails);
        }
        setShowScheduleQueuePanel(true);
        const pdfNote =
          selectedPdfAttachments.length > 0
            ? ` with ${selectedPdfAttachments.length} PDF attachment(s)`
            : '';
        showToast(`Scheduled "${editingTemplate.name}" for ${rec.email} on ${scheduleDate} at ${scheduleTime} (${scheduleTimezone})`);
        setDispatchResultBanner({
          success: true,
          message: `Scheduled Automated Delivery: "${editingTemplate.name}"${pdfNote} will be automatically delivered to ${rec.contactPerson || rec.companyName} (${rec.email}) on ${scheduleDate} at ${scheduleTime} (${scheduleTimezone}).`,
          sentCount: 1
        });
      } else {
        setDispatchResultBanner({
          success: false,
          message: data.message || 'Failed to schedule email delivery.',
          sentCount: 0
        });
      }
    } catch (err: any) {
      setDispatchResultBanner({
        success: false,
        message: err?.message || 'Network error while scheduling email.',
        sentCount: 0
      });
    } finally {
      setIsSchedulingEmail(false);
    }
  };

  const handleScheduleBulkValidLeads = async () => {
    const validRows = records.filter((r, idx) => validationResults[idx]?.isValid && r.email?.includes('@'));
    if (validRows.length === 0) {
      showToast('No valid rows with email addresses found to schedule.');
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      showToast('Please select both a Delivery Date and Time to schedule the batch.');
      return;
    }

    setIsSchedulingEmail(true);
    setDispatchResultBanner(null);

    const isoScheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    const items = validRows.map(rec => ({
      templateId: editingTemplate.id,
      templateName: editingTemplate.name,
      entityCategory,
      recipientEmail: rec.email,
      recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
      companyName: rec.companyName || 'Partner Organization',
      scheduledFor: isoScheduledFor,
      scheduledDateLabel: scheduleDate,
      scheduledTimeLabel: scheduleTime,
      timezone: scheduleTimezone,
      emailPayload: buildEmailPayloadForRecord(rec)
    }));

    try {
      const res = await fetch('/api/v1/admin/schedule-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.scheduledEmails)) {
          setScheduledEmails(data.scheduledEmails);
        }
        setShowScheduleQueuePanel(true);
        showToast(`Scheduled batch of ${items.length} emails for ${scheduleDate} at ${scheduleTime} (${scheduleTimezone})!`);
        setDispatchResultBanner({
          success: true,
          message: `Batch Scheduled Successfully: ${items.length} valid ${entityCategory} leads queued for automated delivery of "${editingTemplate.name}" on ${scheduleDate} at ${scheduleTime} (${scheduleTimezone}).`,
          sentCount: items.length
        });
      }
    } catch (err: any) {
      setDispatchResultBanner({
        success: false,
        message: err?.message || 'Network error while scheduling batch.',
        sentCount: 0
      });
    } finally {
      setIsSchedulingEmail(false);
    }
  };

  const handleTriggerScheduledJobNow = async (jobId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/scheduled-emails/${jobId}/send-now`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.scheduledEmails)) {
        setScheduledEmails(data.scheduledEmails);
        if (data.job) {
          const matchedTpl = templates.find(t => t.id === data.job.templateId) || editingTemplate;
          recordNewSentAnalyticsEntry(
            {
              id: data.job.id,
              companyName: data.job.companyName,
              contactPerson: data.job.recipientName,
              email: data.job.recipientEmail,
              country: 'Global'
            },
            matchedTpl,
            data.job.emailPayload?.subject || data.job.templateName,
            Boolean(data.success)
          );
        }
        showToast(data.message || 'Dispatched scheduled email immediately!');
      }
    } catch {
      showToast('Failed to trigger scheduled email.');
    }
  };

  const handleCancelScheduledJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/scheduled-emails/${jobId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.scheduledEmails)) {
        setScheduledEmails(data.scheduledEmails);
        showToast(data.message || 'Cancelled scheduled email.');
      }
    } catch {
      showToast('Failed to cancel scheduled email.');
    }
  };

  const handleSaveRescheduledJob = async (jobId: string) => {
    if (!editJobDate || !editJobTime) {
      showToast('Please select a valid date and time.');
      return;
    }
    const isoScheduledFor = new Date(`${editJobDate}T${editJobTime}:00`).toISOString();
    try {
      const res = await fetch(`/api/v1/admin/scheduled-emails/${jobId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledFor: isoScheduledFor,
          scheduledDateLabel: editJobDate,
          scheduledTimeLabel: editJobTime,
          timezone: editJobTimezone
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.scheduledEmails)) {
        setScheduledEmails(data.scheduledEmails);
        setEditingScheduleJobId(null);
        showToast(data.message || 'Updated scheduled delivery time!');
      }
    } catch {
      showToast('Failed to reschedule email.');
    }
  };

  const activeScheduledCount = scheduledEmails.filter(j => j.status === 'SCHEDULED').length;

  // Validation function for a record
  const validateRecord = (rec: BulkEntityRecord, category: EntityCategory): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (category === 'BUYER_LEAD') {
      if (!rec.companyName?.trim()) errs.companyName = 'Company name is required';
      if (!rec.contactPerson?.trim()) errs.contactPerson = 'Contact person required';
      if (!rec.email?.includes('@')) errs.email = 'Valid email required';
      if (!rec.country?.trim()) errs.country = 'Country required';
    } else if (category === 'SUPPLIER_PROFILE') {
      if (!rec.companyName?.trim()) errs.companyName = 'Company name required';
      if (!rec.category?.trim()) errs.category = 'Category required';
      if (!rec.email?.includes('@')) errs.email = 'Valid email required';
    } else if (category === 'RFQ') {
      if (!rec.rfqTitle?.trim()) errs.rfqTitle = 'RFQ title required';
      if (!rec.companyName?.trim()) errs.companyName = 'Buyer company required';
      if (!rec.portOfDestination?.trim()) errs.portOfDestination = 'Destination port required';
    } else if (category === 'GENERAL_INQUIRY') {
      if (!rec.subject?.trim()) errs.subject = 'Subject required';
      if (!rec.contactPerson?.trim()) errs.contactPerson = 'Name required';
      if (!rec.email?.includes('@')) errs.email = 'Valid email required';
    }
    return errs;
  };

  const validationResults = records.map(r => {
    const errs = validateRecord(r, entityCategory);
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  });

  const totalRows = records.length;
  const validCount = validationResults.filter(v => v.isValid).length;
  const errorCount = totalRows - validCount;

  // Handlers for record updates
  const handleUpdateCell = (index: number, field: keyof BulkEntityRecord, value: any) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    setRecords(updated);
  };

  const handleAddRow = () => {
    const newId = `rec-${Date.now()}`;
    const emptyRec: BulkEntityRecord = { id: newId, assignedIem: globalIem, leadStatus: 'NEW_LEAD' };
    if (entityCategory === 'BUYER_LEAD') {
      emptyRec.companyName = '';
      emptyRec.contactPerson = '';
      emptyRec.email = '';
      emptyRec.country = '';
      emptyRec.priority = 'WARM';
    } else if (entityCategory === 'SUPPLIER_PROFILE') {
      emptyRec.companyName = '';
      emptyRec.category = '';
      emptyRec.starRating = 4;
      emptyRec.productShowcaseLimit = 25;
    } else if (entityCategory === 'RFQ') {
      emptyRec.rfqTitle = '';
      emptyRec.companyName = '';
      emptyRec.volumeUnit = '';
      emptyRec.portOfDestination = '';
    } else {
      emptyRec.subject = '';
      emptyRec.contactPerson = '';
      emptyRec.email = '';
    }
    setRecords([emptyRec, ...records]);
  };

  const handleDeleteRow = (index: number) => {
    const removedId = records[index]?.id;
    setRecords(records.filter((_, idx) => idx !== index));
    if (removedId) {
      setSelectedRowIds(prev => prev.filter(id => id !== removedId));
    }
  };

  const handleCloneRow = (index: number) => {
    const target = records[index];
    const cloned: BulkEntityRecord = { ...target, id: `rec-${Date.now()}` };
    const updated = [...records];
    updated.splice(index + 1, 0, cloned);
    setRecords(updated);
  };

  const handleApplyGlobalIem = () => {
    const updated = records.map(r => ({ ...r, assignedIem: globalIem }));
    setRecords(updated);
    showToast(`Assigned ${globalIem} to all ${records.length} records successfully.`);
  };

  // -------------------------------------------------------------
  // MULTI-SELECT & BULK ACTION TOOLBAR HANDLERS
  // -------------------------------------------------------------
  const selectedRecords = records.filter(r => selectedRowIds.includes(r.id));
  const selectedCount = selectedRecords.length;
  const isAllSelected = records.length > 0 && selectedCount === records.length;

  const handleToggleSelectRow = (rowId: string) => {
    setSelectedRowIds(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(records.map(r => r.id));
    }
  };

  const handleSelectAllValidLeads = () => {
    const validIds = records
      .filter((r, idx) => validationResults[idx]?.isValid && r.email?.includes('@'))
      .map(r => r.id);
    setSelectedRowIds(validIds);
    showToast(`Selected ${validIds.length} valid leads with verified email addresses.`);
  };

  const handleClearSelection = () => {
    setSelectedRowIds([]);
  };

  // Bulk Action 1: Bulk Email Selected Leads
  const handleBulkEmailSelectedLeads = async () => {
    if (selectedRecords.length === 0) {
      showToast('Please select at least one lead in the contact list first.');
      return;
    }
    const emailableSelected = selectedRecords.filter(r => r.email && r.email.includes('@'));
    if (emailableSelected.length === 0) {
      showToast('None of the selected leads have a valid email address.');
      return;
    }

    setIsDispatchingEmail(true);
    setDispatchResultBanner(null);
    let sentCounter = 0;

    for (const rec of emailableSelected) {
      const resolvedSubject = interpolateText(editingTemplate.subject, rec);
      const resolvedHeadline = interpolateText(editingTemplate.headline, rec);
      const resolvedSubheadline = interpolateText(editingTemplate.subheadline, rec);
      const resolvedBody = interpolateText(editingTemplate.body, rec);

      try {
        const res = await fetch('/api/v1/admin/send-custom-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
            recipientEmail: rec.email,
            companyName: rec.companyName || 'Partner Organization',
            contactPhone: rec.phone || '',
            loginEmail: rec.email,
            loginPassword: `${(rec.companyName || 'Trade').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'Partner'}@2026`,
            portalUrl: editingTemplate.ctaUrl || 'https://www.tradeheaven.net',
            subject: resolvedSubject,
            badgeLabel: editingTemplate.badgeLabel,
            headline: resolvedHeadline,
            subheadline: resolvedSubheadline,
            introMessage: resolvedBody,
            includeCredentialsBox: editingTemplate.includeCredentialsBox,
            includeLoginGuide: editingTemplate.includeLoginGuide,
            includeEscrowBadge: editingTemplate.includeEscrowBadge,
            ctaText: editingTemplate.ctaText,
            ctaUrl: editingTemplate.ctaUrl,
            inquiries: [],
            attachedDocuments: selectedPdfAttachments
          })
        });
        if (res.ok) {
          sentCounter++;
          recordNewSentAnalyticsEntry(rec, editingTemplate, resolvedSubject, true);
        } else {
          recordNewSentAnalyticsEntry(rec, editingTemplate, resolvedSubject, false);
        }
      } catch {
        // continue with remaining selected rows
      }
    }

    // Automatically advance NEW_LEAD status to CONTACTED for emailed leads
    const emailedIds = new Set(emailableSelected.map(r => r.id));
    setRecords(prev =>
      prev.map(r =>
        emailedIds.has(r.id) && (!r.leadStatus || r.leadStatus === 'NEW_LEAD')
          ? { ...r, leadStatus: 'CONTACTED' }
          : r
      )
    );

    setIsDispatchingEmail(false);
    const pdfSummary =
      selectedPdfAttachments.length > 0
        ? ` with ${selectedPdfAttachments.length} PDF attachment(s)`
        : '';
    showToast(`Bulk Email sent "${editingTemplate.name}" to ${sentCounter} selected lead(s)!`);
    setDispatchResultBanner({
      success: sentCounter > 0,
      message: `Bulk Email Action Complete: Sent "${editingTemplate.name}"${pdfSummary} to ${sentCounter} of ${selectedRecords.length} selected lead(s). Lead statuses updated & logged in Delivery Analytics.`,
      sentCount: sentCounter
    });
  };

  // Bulk Action 2: Assign Lead Status to Selected Leads
  const handleBulkAssignLeadStatus = (statusOverride?: LeadPipelineStatus) => {
    const targetStatus = statusOverride || bulkTargetStatus;
    if (selectedRowIds.length === 0) {
      showToast('Please select at least one lead to assign a Lead Status.');
      return;
    }
    const statusLabel =
      LEAD_STATUS_OPTIONS.find(opt => opt.value === targetStatus)?.label || targetStatus;
    const selectedSet = new Set(selectedRowIds);

    setRecords(prev =>
      prev.map(r => (selectedSet.has(r.id) ? { ...r, leadStatus: targetStatus } : r))
    );
    showToast(`Assigned status "${statusLabel}" to ${selectedRowIds.length} selected lead(s)!`);
    setDispatchResultBanner({
      success: true,
      message: `Bulk Status Assigned: Updated ${selectedRowIds.length} selected lead(s) to "${statusLabel}" in one go.`,
      sentCount: selectedRowIds.length
    });
  };

  // Bulk Action 3: Schedule Follow-up for Selected Leads (updates row follow-up schedule + optional automated email queue)
  const handleBulkScheduleFollowUp = async () => {
    if (selectedRecords.length === 0) {
      showToast('Please select at least one lead to schedule a follow-up.');
      return;
    }
    if (!bulkFollowUpDate || !bulkFollowUpTime) {
      showToast('Please select a follow-up date and time.');
      return;
    }

    const selectedSet = new Set(selectedRowIds);
    const followUpPayload: LeadFollowUpSchedule = {
      date: bulkFollowUpDate,
      time: bulkFollowUpTime,
      timezone: bulkFollowUpTimezone,
      channel: bulkFollowUpChannel,
      note: bulkFollowUpNote.trim() || `Follow-up via ${bulkFollowUpChannel}`,
      templateName: bulkFollowUpQueueEmail ? editingTemplate.name : undefined
    };

    // Apply follow-up badge to all selected rows in the contact list
    setRecords(prev =>
      prev.map(r =>
        selectedSet.has(r.id)
          ? {
              ...r,
              scheduledFollowUp: followUpPayload,
              leadStatus: !r.leadStatus || r.leadStatus === 'NEW_LEAD' ? 'CONTACTED' : r.leadStatus
            }
          : r
      )
    );

    // If automated follow-up email queue is enabled, schedule in backend queue too
    const emailableSelected = selectedRecords.filter(r => r.email && r.email.includes('@'));
    if (bulkFollowUpQueueEmail && emailableSelected.length > 0) {
      setIsSchedulingEmail(true);
      const isoScheduledFor = new Date(`${bulkFollowUpDate}T${bulkFollowUpTime}:00`).toISOString();
      const items = emailableSelected.map(rec => ({
        templateId: editingTemplate.id,
        templateName: editingTemplate.name,
        entityCategory,
        recipientEmail: rec.email,
        recipientName: rec.contactPerson || rec.companyName || 'Valued Partner',
        companyName: rec.companyName || 'Partner Organization',
        scheduledFor: isoScheduledFor,
        scheduledDateLabel: bulkFollowUpDate,
        scheduledTimeLabel: bulkFollowUpTime,
        timezone: bulkFollowUpTimezone,
        emailPayload: buildEmailPayloadForRecord(rec)
      }));

      try {
        const res = await fetch('/api/v1/admin/schedule-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.scheduledEmails)) {
          setScheduledEmails(data.scheduledEmails);
        }
      } catch {
        // local state already updated
      } finally {
        setIsSchedulingEmail(false);
      }
    }

    setShowBulkFollowUpDrawer(false);
    showToast(
      `Scheduled follow-up (${bulkFollowUpDate} at ${bulkFollowUpTime} ${bulkFollowUpTimezone}) for ${selectedRecords.length} selected lead(s)!`
    );
    setDispatchResultBanner({
      success: true,
      message: `Bulk Follow-up Scheduled: Set "${bulkFollowUpChannel}" follow-up on ${bulkFollowUpDate} at ${bulkFollowUpTime} (${bulkFollowUpTimezone}) for ${selectedRecords.length} selected lead(s)${
        bulkFollowUpQueueEmail && emailableSelected.length > 0
          ? ` and queued "${editingTemplate.name}" in the Automated Delivery Queue.`
          : '.'
      }`,
      sentCount: selectedRecords.length
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Smart Paste parser
  const handleParseSmartPaste = () => {
    if (!rawPasteText.trim()) return;
    const lines = rawPasteText.split('\n').filter(l => l.trim().length > 0);
    const parsed: BulkEntityRecord[] = [];
    lines.forEach((line, idx) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        parsed.push({
          id: `paste-${Date.now()}-${idx}`,
          companyName: parts[0]?.trim() || 'Imported Co',
          contactPerson: parts[1]?.trim() || 'Contact',
          email: parts[2]?.trim() || 'import@tradeheaven.org',
          phone: parts[3]?.trim() || '+1-800-555-0199',
          country: parts[4]?.trim() || 'Global',
          targetProduct: parts[5]?.trim() || 'General Cargo',
          assignedIem: globalIem
        });
      }
    });
    if (parsed.length > 0) {
      setRecords([...parsed, ...records]);
      setInputMode('SPREADSHEET');
      setRawPasteText('');
      showToast(`Successfully parsed and added ${parsed.length} records from raw paste.`);
    } else {
      showToast('Could not parse paste data. Please use Tab or Comma delimited format.');
    }
  };

  // File Upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const mockImported: BulkEntityRecord[] = [
        { id: `file-1`, companyName: `${file.name.split('.')[0]} Enterprise`, contactPerson: 'Arthur Pendelton', email: 'arthur@enterprise.com', phone: '+1-212-555-0144', country: 'United Kingdom', targetProduct: 'Industrial Automation Units', requiredQuantity: '100 units', budget: '£75,000', priority: 'HOT', assignedIem: globalIem },
        { id: `file-2`, companyName: 'Pacific Rim Importers Ltd', contactPerson: 'Mei Lin', email: 'mlin@pacificrim.hk', phone: '+852-2810-0011', country: 'Hong Kong', targetProduct: 'Consumer Electronics', requiredQuantity: '5,000 pcs', budget: '$220,000', priority: 'HOT', assignedIem: globalIem },
        { id: `file-3`, companyName: 'Mediterranean Freight & Trading', contactPerson: 'Giannis Papadopoulos', email: 'gpap@medfreight.gr', phone: '+30-210-555-4321', country: 'Greece', targetProduct: 'Extra Virgin Olive Oil Bulk', requiredQuantity: '50 Metric Tons', budget: '€110,000', priority: 'WARM', assignedIem: globalIem }
      ];
      setRecords([...mockImported, ...records]);
      setIsSubmitting(false);
      setInputMode('SPREADSHEET');
      showToast(`Successfully imported 3 verified rows from ${file.name}`);
    }, 800);
  };

  // Export Sample CSV
  const handleExportSampleTemplate = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (entityCategory === 'BUYER_LEAD') {
      csvContent += "Company Name,Contact Person,Email,Phone,Country,Target Product,Required Quantity,Budget,Priority\n";
      csvContent += "Apex Global,Marcus Vance,m.vance@apex.com,+14158923321,USA,Solar Inverters,500 units,$120000,HOT\n";
    } else if (entityCategory === 'SUPPLIER_PROFILE') {
      csvContent += "Company Name,Category,Email,Phone,Country,Star Rating,Showcase Limit\n";
      csvContent += "Zhejiang Machinery,Industrial Machinery,export@zj.cn,+865718899,China,5,50\n";
    } else if (entityCategory === 'RFQ') {
      csvContent += "RFQ Title,Buyer Company,Contact Email,Volume Unit,Target Price,Port of Destination,Incoterm\n";
      csvContent += "Solar Panels 550W,EcoPower BV,jan@ecopower.nl,2000 Panels,$110,Rotterdam,CIF\n";
    } else {
      csvContent += "Subject,Contact Person,Company,Email,Phone,Inquiry Type,Message\n";
      csvContent += "Customs Clearance,Li Ming,Shanghai Express,ming@shanghai.cn,+86216000,Customs,Advisory needed\n";
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trade_heaven_${entityCategory.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded official CSV sample template for ${entityCategory}.`);
  };

  // Submit to CRM / Marketplace
  const handlePushToCrm = () => {
    if (validCount === 0) {
      showToast('No valid records to submit. Please check validation errors.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccessCount(validCount);
      showToast(`Successfully synchronized ${validCount} ${entityCategory} records into Trade Heaven CRM & Marketplace database!`);
    }, 1200);
  };

  const filteredTemplates = templates.filter(t => {
    if (audienceFilter === 'ALL') return true;
    return t.targetAudience === audienceFilter || t.targetAudience === 'ALL';
  });

  const activePreviewRecord = records[previewRecordIndex] || records[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Enterprise CRM &amp; Bulk Import Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bulk Lead, Entity &amp; Email Template Studio
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Parse, validate, and push batches of B2B buyer inquiries and verified suppliers, or create reusable email templates with dynamic merge tags to send to suppliers and buyers without rewriting content.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setInputMode(inputMode === 'DELIVERY_ANALYTICS' ? 'SPREADSHEET' : 'DELIVERY_ANALYTICS')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 cursor-pointer ${
                inputMode === 'DELIVERY_ANALYTICS'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/25 text-white border-white/15'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Delivery Analytics ({globalOpenRatePct}% Open • {globalClickThroughRatePct}% CTR)</span>
            </button>
            <button
              onClick={() => setInputMode(inputMode === 'EMAIL_TEMPLATES' ? 'SPREADSHEET' : 'EMAIL_TEMPLATES')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 cursor-pointer ${
                inputMode === 'EMAIL_TEMPLATES'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/25 text-white border-white/15'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Reusable Email Templates ({templates.length})</span>
            </button>
            <button
              onClick={handleExportSampleTemplate}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV Template</span>
            </button>
            <button
              onClick={handlePushToCrm}
              disabled={isSubmitting || validCount === 0}
              className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Send className="w-4 h-4 text-slate-950" />
              )}
              <span>Push {validCount} Records to CRM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Result Notification Banner */}
      {dispatchResultBanner && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          dispatchResultBanner.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center gap-3">
            {dispatchResultBanner.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs font-bold">{dispatchResultBanner.message}</span>
          </div>
          <button
            onClick={() => setDispatchResultBanner(null)}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Banner if pushed */}
      {submitSuccessCount !== null && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-950">Batch Synchronization Successful!</h3>
              <p className="text-xs text-emerald-800">
                Successfully pushed {submitSuccessCount} records of type <span className="font-bold underline">{entityCategory}</span> into the Trade Heaven live database and assigned managers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmitSuccessCount(null)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-950 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Entity Selector & Mode Switcher Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          {/* Entity Category Selector */}
          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              1. Select Target Entity Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'BUYER_LEAD', label: 'Buyer Leads', icon: Users },
                { id: 'SUPPLIER_PROFILE', label: 'Suppliers', icon: Building2 },
                { id: 'RFQ', label: 'RFQs', icon: FileText },
                { id: 'GENERAL_INQUIRY', label: 'Inquiries', icon: HelpCircle }
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = entityCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setEntityCategory(cat.id as EntityCategory)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-md ring-2 ring-slate-950/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Mode Selector */}
          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              2. Choose Workspace Mode
            </label>
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {[
                { id: 'SPREADSHEET', label: 'Spreadsheet Grid', icon: FileSpreadsheet },
                { id: 'EMAIL_TEMPLATES', label: 'Reusable Email Templates', icon: Mail },
                { id: 'DELIVERY_ANALYTICS', label: 'Delivery Analytics', icon: BarChart3 },
                { id: 'UPLOADER', label: 'CSV / Excel Upload', icon: Upload },
                { id: 'SMART_PASTE', label: 'Smart Paste', icon: ClipboardPaste }
              ].map(mode => {
                const Icon = mode.icon;
                const isSelected = inputMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setInputMode(mode.id as InputMode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Global IEM Manager & Quick Reusable Template Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Global IEM Manager Assignment</h4>
                <p className="text-[11px] text-slate-600">Assign all batch records to an International Export Manager.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={globalIem}
                onChange={(e) => setGlobalIem(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-52"
              >
                {INITIAL_IEM_MANAGERS.map(mgr => (
                  <option key={mgr} value={mgr}>{mgr}</option>
                ))}
              </select>
              <button
                onClick={handleApplyGlobalIem}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shrink-0 cursor-pointer"
              >
                Apply All
              </button>
            </div>
          </div>

          {/* Active Reusable Email Template Quick Selector & Bulk Dispatch Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Active Reusable Email Template</h4>
                <p className="text-[11px] text-slate-600">Select a saved template to dispatch to any row or the entire batch.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  const found = templates.find(t => t.id === e.target.value);
                  if (found) handleSelectTemplate(found);
                }}
                className="px-3 py-2 rounded-xl bg-white border border-blue-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-52"
              >
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    [{tpl.targetAudience}] {tpl.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowEmailPreviewPanel(prev => !prev)}
                className={`px-3 py-2 rounded-xl border text-xs font-black shrink-0 cursor-pointer flex items-center gap-1 transition-colors ${
                  showEmailPreviewPanel
                    ? 'bg-slate-900 text-amber-400 border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-blue-200'
                }`}
                title="Toggle Email Preview Panel with variables filled in"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showEmailPreviewPanel ? 'Hide Preview' : 'Email Preview'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleQueuePanel(prev => !prev)}
                className={`px-3 py-2 rounded-xl border text-xs font-black shrink-0 cursor-pointer flex items-center gap-1 transition-colors ${
                  showScheduleQueuePanel
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200'
                }`}
                title="View & Manage Scheduled Automated Email Deliveries"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Scheduled ({activeScheduledCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('EMAIL_TEMPLATES')}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 text-xs font-black shrink-0 cursor-pointer flex items-center gap-1"
                title="Create or Edit Reusable Templates"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manage</span>
              </button>
              <button
                type="button"
                disabled={isDispatchingEmail || validCount === 0}
                onClick={handleBulkSendTemplateToAllValidRows}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Send active reusable template to all valid rows in current table"
              >
                {isDispatchingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Email Batch ({validCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated 'Email Preview' Panel (renders filled variables before clicking Send or Schedule) */}
        {showEmailPreviewPanel && inputMode !== 'EMAIL_TEMPLATES' && (
          <div className="rounded-3xl border-2 border-blue-200 bg-slate-50/80 overflow-hidden shadow-md animate-fade-in">
            {/* Preview Header Bar */}
            <div className="p-4 sm:px-6 bg-slate-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black tracking-tight text-white">
                      Email Preview
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                      Variables Filled In
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Review how <strong className="text-amber-300">{editingTemplate.name}</strong> renders with recipient variables before clicking <strong>Send</strong> or <strong>Schedule Email</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Recipient Row:</span>
                  <select
                    value={previewRecordIndex}
                    onChange={e => setPreviewRecordIndex(Number(e.target.value))}
                    className="bg-transparent text-white text-xs font-black focus:outline-none cursor-pointer"
                  >
                    {records.map((r, i) => (
                      <option key={r.id} value={i} className="bg-slate-900 text-white">
                        #{i + 1} — {r.contactPerson || 'Contact'} ({r.companyName || 'Company'}) &lt;{r.email || 'no-email'}&gt;
                      </option>
                    ))}
                  </select>
                </div>

                {activePreviewRecord && (
                  <button
                    type="button"
                    disabled={isDispatchingEmail}
                    onClick={() => handleSendTemplateToSingleRow(activePreviewRecord)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isDispatchingEmail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send to {activePreviewRecord.contactPerson || activePreviewRecord.companyName || 'Contact'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowEmailPreviewPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Close Email Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filled Variables Breakdown Strip */}
            <div className="px-6 py-3 bg-blue-950/5 border-b border-blue-200/70">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-blue-600" />
                <span>Resolved Template Variables for Selected Recipient:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getResolvedVariablesList(activePreviewRecord).map(v => (
                  <div key={v.tag} className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-[11px] flex flex-col">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-400 text-[10px]">{v.label}</span>
                      <code className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1 rounded">{v.tag}</code>
                    </div>
                    <span className="font-black text-slate-900 truncate mt-0.5" title={v.value}>
                      {v.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved PDF Document Attachments Selector (Up to 3 PDFs Max) */}
            <div className="px-6 py-4 bg-white border-b border-blue-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Attach Saved PDF Documents (Up to {MAX_PDF_ATTACHMENTS} Max)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    selectedPdfAttachments.length >= MAX_PDF_ATTACHMENTS
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {selectedPdfAttachments.length} / {MAX_PDF_ATTACHMENTS} Attached
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={pdfFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadNewPdfFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfFileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-blue-600" />
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPdfForm(prev => !prev)}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddPdfForm ? 'Cancel' : 'Save New PDF'}</span>
                  </button>
                  {selectedPdfAttachments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttachedPdfIds([])}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer px-1.5"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Optional Inline Form to Save a New Reusable PDF Document */}
              {showAddPdfForm && (
                <form onSubmit={handleAddCustomSavedPdf} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={newPdfTitle}
                      onChange={e => setNewPdfTitle(e.target.value)}
                      placeholder="e.g. Trade Assurance Terms"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Category</label>
                    <input
                      type="text"
                      value={newPdfCategory}
                      onChange={e => setNewPdfCategory(e.target.value)}
                      placeholder="e.g. Escrow & Legal"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={newPdfDescription}
                      onChange={e => setNewPdfDescription(e.target.value)}
                      placeholder="Brief summary of PDF contents"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer"
                    >
                      Save &amp; Attach
                    </button>
                  </div>
                </form>
              )}

              {/* Selectable Saved PDF Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {savedPdfLibrary.map(doc => {
                  const isAttached = attachedPdfIds.includes(doc.id);
                  const isDisabled = !isAttached && attachedPdfIds.length >= MAX_PDF_ATTACHMENTS;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleTogglePdfAttachment(doc.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isAttached
                          ? 'bg-rose-50/70 border-rose-400 ring-1 ring-rose-400/40 shadow-2xs'
                          : isDisabled
                          ? 'bg-slate-50 border-slate-200 opacity-55 cursor-not-allowed'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isAttached}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 pointer-events-none"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                            PDF
                          </span>
                          <span className="text-xs font-black text-slate-900 truncate">
                            {doc.title}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                          {doc.fileName} • {doc.fileSizeLabel}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {doc.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Schedule Email (Automated Template Delivery) Control Bar */}
            <div className="px-6 py-4 bg-indigo-50/70 border-b border-indigo-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    Schedule Email — Automated Template Delivery
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-black">
                    {scheduleDate} at {scheduleTime} ({scheduleTimezone.split(' ')[0]})
                  </span>
                </div>

                {/* Quick Time Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyQuickSchedulePreset('IN_1_HOUR')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black cursor-pointer transition-colors"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickSchedulePreset('TOMORROW_9AM')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black cursor-pointer transition-colors"
                  >
                    Tomorrow 09:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickSchedulePreset('NEXT_MONDAY_9AM')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black cursor-pointer transition-colors"
                  >
                    Next Monday 09:00 AM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Delivery Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Target Timezone
                  </label>
                  <select
                    value={scheduleTimezone}
                    onChange={e => setScheduleTimezone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {SCHEDULE_TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-4 flex flex-wrap items-center gap-2">
                  {activePreviewRecord && (
                    <button
                      type="button"
                      disabled={isSchedulingEmail}
                      onClick={() => handleScheduleSingleLead(activePreviewRecord)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Schedule Lead</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isSchedulingEmail || validCount === 0}
                    onClick={handleScheduleBulkValidLeads}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Schedule All ({validCount})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rendered Email Message Canvas */}
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden max-w-4xl mx-auto">
                {/* Envelope Headers */}
                <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400">From: </span>
                    <span className="font-bold text-slate-800">Trade Heaven Global B2B &lt;noreply@tradeheaven.net&gt;</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">To: </span>
                    <span className="font-black text-slate-900">
                      {activePreviewRecord?.contactPerson || 'Valued Partner'} ({activePreviewRecord?.companyName || 'Company'}) &lt;{activePreviewRecord?.email || 'contact@company.com'}&gt;
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-200/60">
                    <span className="font-bold text-slate-400">Subject: </span>
                    <span className="font-black text-blue-950">
                      {interpolateText(editingTemplate.subject, activePreviewRecord)}
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-200/60 flex items-center flex-wrap gap-1.5">
                    <span className="font-bold text-slate-400 flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-rose-600" />
                      <span>Attachments ({selectedPdfAttachments.length}/{MAX_PDF_ATTACHMENTS}):</span>
                    </span>
                    {selectedPdfAttachments.length > 0 ? (
                      selectedPdfAttachments.map(doc => (
                        <span
                          key={doc.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold"
                        >
                          <span className="px-1 rounded bg-rose-600 text-white text-[9px] font-black">PDF</span>
                          <span>{doc.title}</span>
                          <span className="text-[10px] font-mono text-rose-700">({doc.fileSizeLabel})</span>
                          <button
                            type="button"
                            onClick={() => handleTogglePdfAttachment(doc.id)}
                            className="text-rose-500 hover:text-rose-800 cursor-pointer ml-0.5"
                            title="Remove attachment"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No PDF documents attached</span>
                    )}
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-6 space-y-5">
                  <div className="bg-slate-950 text-white p-5 rounded-2xl space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      {editingTemplate.badgeLabel}
                    </div>
                    <h4 className="text-lg font-black">
                      {interpolateText(editingTemplate.headline, activePreviewRecord)}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {interpolateText(editingTemplate.subheadline, activePreviewRecord)}
                    </p>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {interpolateText(editingTemplate.body, activePreviewRecord)}
                  </div>

                  {editingTemplate.includeCredentialsBox && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                      <div className="font-black text-amber-950 uppercase text-[10px] tracking-wider">
                        Official Trade Heaven Portal Credentials
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div>
                          <span className="text-slate-500 font-bold">Portal URL: </span>
                          <span className="font-mono font-bold text-blue-700">{editingTemplate.ctaUrl || 'https://www.tradeheaven.net'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold">Login User ID: </span>
                          <span className="font-mono font-black text-slate-900">{activePreviewRecord?.email || 'partner@company.com'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold">Password: </span>
                          <span className="font-mono font-black text-slate-900">
                            {`${(activePreviewRecord?.companyName || 'Trade').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'Partner'}@2026`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingTemplate.includeLoginGuide && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                      <div className="font-black text-blue-950 uppercase text-[10px] tracking-wider">
                        Quick 3-Step Portal Login Guide
                      </div>
                      <ol className="list-decimal list-inside text-slate-700 space-y-1 text-[11px] font-medium">
                        <li>Visit <strong>{editingTemplate.ctaUrl || 'https://www.tradeheaven.net'}</strong> and click <strong>Sign In</strong>.</li>
                        <li>Enter your registered email (<strong>{activePreviewRecord?.email || 'contact@company.com'}</strong>) and temporary password.</li>
                        <li>Open your <strong>{activePreviewRecord?.companyName || 'Company'}</strong> dashboard to review matched tenders and submit quotations.</li>
                      </ol>
                    </div>
                  )}

                  {/* Rendered Attached PDF Documents Box inside the Email Body */}
                  {selectedPdfAttachments.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                        <span>Attached Official PDF Documents ({selectedPdfAttachments.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {selectedPdfAttachments.map(doc => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black">
                                  PDF
                                </span>
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {doc.title}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 truncate mt-1">
                                {doc.fileName} • {doc.fileSizeLabel}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTogglePdfAttachment(doc.id)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                              title="Detach PDF"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <span className="inline-block px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black shadow-sm">
                      {editingTemplate.ctaText}
                    </span>
                  </div>

                  {editingTemplate.includeEscrowBadge && (
                    <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
                      <strong className="text-slate-900">Trade Heaven Escrow Protection:</strong> All institutional B2B transactions for <strong>{activePreviewRecord?.companyName || 'your organization'}</strong> operate under regulated escrow protocols with independent SGS/Saybolt verification.
                    </div>
                  )}
                </div>

                {/* Preview Action Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Ready to dispatch or schedule? Variables filled for <strong className="text-slate-800">{activePreviewRecord?.contactPerson || 'this contact'}</strong> ({activePreviewRecord?.companyName || 'Company'}) with <strong className="text-rose-700">{selectedPdfAttachments.length} PDF attachment(s)</strong>.
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activePreviewRecord && (
                      <>
                        <button
                          type="button"
                          disabled={isDispatchingEmail}
                          onClick={() => handleSendTemplateToSingleRow(activePreviewRecord)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isDispatchingEmail ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Send Now</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSchedulingEmail}
                          onClick={() => handleScheduleSingleLead(activePreviewRecord)}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Schedule ({scheduleDate} {scheduleTime})</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={isDispatchingEmail || validCount === 0}
                      onClick={handleBulkSendTemplateToAllValidRows}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Send to All {validCount} Valid Contacts</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Email Deliveries Queue & Automation Monitor */}
        {showScheduleQueuePanel && (
          <div className="rounded-3xl border border-indigo-200 bg-white overflow-hidden shadow-xs animate-fade-in">
            <div className="p-4 sm:px-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black tracking-tight">
                      Scheduled Email Queue &amp; Automated Lead Delivery
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-black">
                      {activeScheduledCount} Queued
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Scheduled templates are automatically dispatched by the server when their target date &amp; time arrives, or can be sent immediately or rescheduled below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void fetchScheduledEmails()}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleQueuePanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {scheduledEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No scheduled email deliveries yet. Select a date and time above and click <strong>Schedule Lead</strong> or <strong>Schedule All</strong>.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {scheduledEmails.map(job => {
                  const attachedDocsCount = Array.isArray(job.emailPayload?.attachedDocuments)
                    ? job.emailPayload.attachedDocuments.length
                    : 0;
                  const isEditingThis = editingScheduleJobId === job.id;

                  return (
                    <div key={job.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                            job.status === 'SCHEDULED'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : job.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : job.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {job.recipientName} ({job.companyName})
                          </span>
                          <span className="text-xs font-mono text-blue-700">
                            &lt;{job.recipientEmail}&gt;
                          </span>
                          {attachedDocsCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
                              <Paperclip className="w-3 h-3" />
                              <span>{attachedDocsCount} PDF(s)</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-700 truncate">
                          Template: <span className="text-slate-900">{job.templateName}</span> — <span className="text-slate-500 font-normal">{job.emailPayload?.subject}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-700">
                            <Calendar className="w-3 h-3" />
                            <span>Scheduled For: {job.scheduledDateLabel} at {job.scheduledTimeLabel} ({job.timezone})</span>
                          </span>
                          {job.dispatchedAt && (
                            <span className="text-emerald-700 font-bold">
                              • Delivered at {new Date(job.dispatchedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        {isEditingThis && (
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <input
                              type="date"
                              value={editJobDate}
                              onChange={e => setEditJobDate(e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-indigo-300 text-xs font-bold text-slate-900"
                            />
                            <input
                              type="time"
                              value={editJobTime}
                              onChange={e => setEditJobTime(e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-indigo-300 text-xs font-bold text-slate-900"
                            />
                            <select
                              value={editJobTimezone}
                              onChange={e => setEditJobTimezone(e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-indigo-300 text-xs font-bold text-slate-800"
                            >
                              {SCHEDULE_TIMEZONES.map(tz => (
                                <option key={tz} value={tz}>{tz}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => void handleSaveRescheduledJob(job.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer"
                            >
                              Save Time
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingScheduleJobId(null)}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {job.status === 'SCHEDULED' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleTriggerScheduledJobNow(job.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Dispatch this scheduled email right now"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Now</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingScheduleJobId(job.id);
                              setEditJobDate(job.scheduledDateLabel);
                              setEditJobTime(job.scheduledTimeLabel);
                              setEditJobTimezone(job.timezone);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Reschedule</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCancelScheduledJob(job.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODE: DELIVERY ANALYTICS DASHBOARD (Open Rates, Click-Through Rates & Bounce Status per Sent Template) */}
      {inputMode === 'DELIVERY_ANALYTICS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Analytics Top Hero & Global KPIs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Lead Engagement &amp; Telemetry</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Delivery Analytics Dashboard
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Monitor email open rates, portal CTA &amp; PDF click-through rates (CTR), and SMTP bounce status for every sent reusable template to assess buyer and supplier lead engagement.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAnalyticsTemplateFilter('ALL');
                    setAnalyticsStatusFilter('ALL');
                    setAnalyticsSearchQuery('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('SPREADSHEET')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Back to Staging Grid</span>
                </button>
              </div>
            </div>

            {/* 4 Global KPI Cards */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 border-b border-slate-200">
              {/* Total Sent & Delivery Rate */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Delivered Rate
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-950">{globalDeliveryRatePct}%</span>
                  <span className="text-xs font-bold text-emerald-700">
                    ({totalDeliveredEmails}/{totalSentEmails} Delivered)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, globalDeliveryRatePct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Across {templates.length} active B2B email templates
                </p>
              </div>

              {/* Email Open Rate */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Email Open Rate
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">{globalOpenRatePct}%</span>
                  <span className="text-xs font-bold text-slate-600">
                    ({uniqueOpenedEmails} Unique • {totalOpenEventsCount} Total Opens)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, globalOpenRatePct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Tracked via embedded pixel &amp; portal session auth
                </p>
              </div>

              {/* Click-Through Rate (CTR) */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Click-Through Rate (CTR)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">{globalClickThroughRatePct}%</span>
                  <span className="text-xs font-bold text-slate-600">
                    ({uniqueClickedEmails} Leads • {totalClickEventsCount} Clicks)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, globalClickThroughRatePct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Clicks on Portal CTA &amp; attached PDF documents
                </p>
              </div>

              {/* Bounce Status & Rate */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Bounce Rate &amp; Status
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600">{globalBounceRatePct}%</span>
                  <span className="text-xs font-bold text-slate-600">
                    ({totalHardBounced} Hard • {totalSoftBounced} Soft)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, globalBounceRatePct)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Real-time SMTP 550/452 DSN bounce diagnostics
                </p>
              </div>
            </div>

            {/* Per-Template Performance Breakdown Table */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Engagement Breakdown by Sent Email Template</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compare open rates, click-through rates, and bounce status across each reusable buyer and supplier template.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                      <th className="p-3.5">Template Name &amp; Audience</th>
                      <th className="p-3.5 text-center">Sent / Delivered</th>
                      <th className="p-3.5">Open Rate (%)</th>
                      <th className="p-3.5">Click-Through Rate (CTR %)</th>
                      <th className="p-3.5">Bounce Status</th>
                      <th className="p-3.5 text-right">Inspect Leads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {perTemplateAnalytics.map(stat => {
                      const isFiltered = analyticsTemplateFilter === stat.templateId;
                      return (
                        <tr
                          key={stat.templateId}
                          className={`hover:bg-slate-50/80 transition-colors ${isFiltered ? 'bg-emerald-50/40' : ''}`}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                stat.targetAudience === 'SUPPLIER'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : stat.targetAudience === 'BUYER'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}>
                                {stat.targetAudience}
                              </span>
                              <span className="font-black text-slate-900">{stat.templateName}</span>
                            </div>
                          </td>

                          <td className="p-3.5 text-center font-mono">
                            <span className="font-black text-slate-900">{stat.delivered}</span>
                            <span className="text-slate-400"> / {stat.sent} Sent</span>
                          </td>

                          <td className="p-3.5 w-52">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-black text-emerald-700">{stat.openRate}%</span>
                                <span className="text-slate-500">
                                  {stat.opened}/{stat.delivered} ({stat.totalOpens} opens)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(100, stat.openRate)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 w-52">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-black text-amber-600">{stat.ctr}%</span>
                                <span className="text-slate-500">
                                  {stat.clicked}/{stat.delivered} ({stat.totalClicks} clicks)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${Math.min(100, stat.ctr)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            {stat.bounced === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>0% Bounced (100% Clean)</span>
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>{stat.bounceRate}% Bounced ({stat.bounced})</span>
                                </span>
                                <div className="text-[10px] text-slate-500 pl-1">
                                  {stat.hardBounces > 0 && `${stat.hardBounces} Hard `}
                                  {stat.softBounces > 0 && `${stat.softBounces} Soft`}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setAnalyticsTemplateFilter(
                                  analyticsTemplateFilter === stat.templateId ? 'ALL' : stat.templateId
                                )
                              }
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                                isFiltered
                                  ? 'bg-slate-900 text-amber-400'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isFiltered ? 'Showing Template' : 'Filter Recipients'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Individual Recipient Engagement & Bounce Status Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Recipient Lead Engagement &amp; Bounce Diagnostic Log ({filteredAnalyticsFeed.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect individual lead opens, clicked links/PDFs, and SMTP bounce codes, or trigger test engagement events.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="text"
                  value={analyticsSearchQuery}
                  onChange={e => setAnalyticsSearchQuery(e.target.value)}
                  placeholder="Search lead, company, or email..."
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 w-56 focus:outline-none focus:bg-white focus:border-blue-500"
                />
                <select
                  value={analyticsTemplateFilter}
                  onChange={e => setAnalyticsTemplateFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All Templates ({templates.length})</option>
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['ALL', 'CLICKED', 'OPENED', 'DELIVERED', 'BOUNCED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAnalyticsStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                        analyticsStatusFilter === st
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Lead Contact &amp; Company</th>
                    <th className="p-3.5">Sent Template &amp; Subject</th>
                    <th className="p-3.5">Delivery / Bounce Status</th>
                    <th className="p-3.5">Opens</th>
                    <th className="p-3.5">Clicks &amp; Target</th>
                    <th className="p-3.5 text-right">Engagement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAnalyticsFeed.map(entry => {
                    const isBounced = entry.status === 'HARD_BOUNCE' || entry.status === 'SOFT_BOUNCE';
                    return (
                      <tr key={entry.id} className={`hover:bg-slate-50/80 transition-colors ${isBounced ? 'bg-rose-50/20' : ''}`}>
                        <td className="p-3.5">
                          <div className="font-black text-slate-900">{entry.recipientName}</div>
                          <div className="text-[11px] font-bold text-slate-600">
                            {entry.companyName} <span className="text-slate-400">({entry.country})</span>
                          </div>
                          <div className="text-[11px] font-mono text-blue-700">{entry.recipientEmail}</div>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="font-bold text-slate-900 truncate" title={entry.templateName}>
                            {entry.templateName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate" title={entry.subject}>
                            {entry.subject}
                          </div>
                          {entry.attachedPdfTitles.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap mt-1">
                              {entry.attachedPdfTitles.map(title => (
                                <span
                                  key={title}
                                  className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[9px] font-bold"
                                >
                                  PDF: {title}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            entry.status === 'CLICKED'
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : entry.status === 'OPENED'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : entry.status === 'DELIVERED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : entry.status === 'SOFT_BOUNCE'
                              ? 'bg-orange-100 text-orange-900 border-orange-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}>
                            {entry.status === 'CLICKED' && <MousePointerClick className="w-3 h-3 text-amber-700" />}
                            {entry.status === 'OPENED' && <Eye className="w-3 h-3 text-emerald-700" />}
                            {entry.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3 text-blue-700" />}
                            {isBounced && <AlertOctagon className="w-3 h-3 text-rose-700" />}
                            <span>{entry.status.replace('_', ' ')}</span>
                          </span>
                          {isBounced && entry.bounceReason && (
                            <div className="mt-1 text-[10px] text-rose-700 font-medium max-w-xs">
                              <strong className="font-mono">{entry.bounceCode}:</strong> {entry.bounceReason}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Sent {new Date(entry.dispatchedAt).toLocaleString()}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-black text-slate-900 font-mono">
                            {entry.openCount} {entry.openCount === 1 ? 'Open' : 'Opens'}
                          </div>
                          {entry.lastOpenedAt ? (
                            <div className="text-[10px] text-emerald-700 font-medium">
                              Last: {new Date(entry.lastOpenedAt).toLocaleTimeString()}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">Not opened yet</div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="font-black text-amber-700 font-mono">
                            {entry.clickCount} {entry.clickCount === 1 ? 'Click' : 'Clicks'}
                          </div>
                          {entry.clickedTargetLabel ? (
                            <div className="text-[10px] text-slate-600 truncate max-w-[180px]" title={entry.clickedTargetLabel}>
                              {entry.clickedTargetLabel}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">No link clicks</div>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isBounced ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSimulateLeadEngagement(entry.id, 'OPEN')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black cursor-pointer"
                                  title="Simulate recipient opening this email"
                                >
                                  +Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSimulateLeadEngagement(entry.id, 'CLICK')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black cursor-pointer"
                                  title="Simulate recipient clicking Portal CTA / PDF attachment"
                                >
                                  +Click
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={isDispatchingEmail}
                                onClick={() => void handleRetryBouncedDelivery(entry)}
                                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Retry Delivery</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE: REUSABLE EMAIL TEMPLATES STUDIO */}
      {inputMode === 'EMAIL_TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (4 cols): Saved Templates Library */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Saved Email Templates</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reusable templates for Suppliers &amp; Buyers
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStartNewTemplate()}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Template</span>
              </button>
            </div>

            {/* Filter by Audience */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5">
              {(['ALL', 'SUPPLIER', 'BUYER'] as const).map(aud => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setAudienceFilter(aud)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    audienceFilter === aud
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {aud === 'ALL' ? `All (${templates.length})` : aud === 'SUPPLIER' ? 'Suppliers' : 'Buyers'}
                </button>
              ))}
            </div>

            {/* Template Cards List */}
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredTemplates.map(tpl => {
                const isSelected = tpl.id === selectedTemplateId && !isCreatingNewTemplate;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            tpl.targetAudience === 'SUPPLIER'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : tpl.targetAudience === 'BUYER'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-200 text-slate-800'
                          }`}>
                            {tpl.targetAudience}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Saved {new Date(tpl.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          {tpl.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {tpl.subject}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleDuplicateTemplate(tpl)}
                          title="Duplicate Template"
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          title="Delete Template"
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (8 cols): Template Builder + Live Dynamic Preview */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Editor Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      {isCreatingNewTemplate ? 'Create New Reusable Email Template' : 'Edit Reusable Email Template'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Use dynamic merge tags like <code className="font-mono font-bold text-blue-700">{'{{companyName}}'}</code> or <code className="font-mono font-bold text-blue-700">{'{{contactPerson}}'}</code> so you never have to rewrite emails manually.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>

              {/* Template Name & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Template Title (For Admin Reference) *
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="e.g. Fuel Supplier Onboarding & Active Tenders"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Recipient Type
                  </label>
                  <select
                    value={editingTemplate.targetAudience}
                    onChange={e => setEditingTemplate({ ...editingTemplate, targetAudience: e.target.value as TemplateTargetAudience })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SUPPLIER">Suppliers Only</option>
                    <option value="BUYER">Buyers Only</option>
                    <option value="ALL">Both Suppliers &amp; Buyers</option>
                  </select>
                </div>
              </div>

              {/* Merge Tags Insertion Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-600" />
                    <span>Click to Insert Dynamic Placeholder into Body or Subject:</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_MERGE_TAGS.map(item => (
                    <div key={item.tag} className="inline-flex items-center rounded-lg border border-blue-200 bg-white overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleInsertMergeTag(item.tag, 'body')}
                        className="px-2.5 py-1 hover:bg-blue-50 text-slate-800 font-mono font-bold cursor-pointer transition-colors"
                        title={`Insert ${item.tag} into Email Body`}
                      >
                        {item.tag}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertMergeTag(item.tag, 'subject')}
                        className="px-1.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[9px] border-l border-blue-200 cursor-pointer"
                        title={`Insert ${item.tag} into Subject Line`}
                      >
                        +Subj
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject & Header Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="Welcome to Trade Heaven: {{companyName}} Portal Credentials"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Header Headline
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.headline}
                      onChange={e => setEditingTemplate({ ...editingTemplate, headline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Subheadline
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.subheadline}
                      onChange={e => setEditingTemplate({ ...editingTemplate, subheadline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reusable Email Body Content *
                  </label>
                  <textarea
                    rows={5}
                    value={editingTemplate.body}
                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Call-To-Action Button Text
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.ctaText}
                      onChange={e => setEditingTemplate({ ...editingTemplate, ctaText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Portal CTA Destination URL
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.ctaUrl}
                      onChange={e => setEditingTemplate({ ...editingTemplate, ctaUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* Checkboxes for Credentials, Login Guide & Escrow Badge */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeCredentialsBox}
                      onChange={e => setEditingTemplate({ ...editingTemplate, includeCredentialsBox: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Include Portal Login Credentials Box</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeLoginGuide}
                      onChange={e => setEditingTemplate({ ...editingTemplate, includeLoginGuide: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Include 3-Step Login Guide</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeEscrowBadge}
                      onChange={e => setEditingTemplate({ ...editingTemplate, includeEscrowBadge: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Include Trade Heaven Escrow Protection Footer</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Email Preview Card inside Templates Studio */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Email Preview (Rendered Template with Variables Filled In)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Previewing with row:</span>
                  <select
                    value={previewRecordIndex}
                    onChange={e => setPreviewRecordIndex(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-white border border-slate-700 text-xs font-bold"
                  >
                    {records.map((r, i) => (
                      <option key={r.id} value={i}>
                        #{i + 1} {r.companyName || r.contactPerson || 'Record'} ({r.email || 'no-email'})
                      </option>
                    ))}
                  </select>
                  {activePreviewRecord && (
                    <>
                      <button
                        type="button"
                        disabled={isDispatchingEmail}
                        onClick={() => handleSendTemplateToSingleRow(activePreviewRecord)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSchedulingEmail}
                        onClick={() => handleScheduleSingleLead(activePreviewRecord)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                        title={`Schedule automated delivery for ${scheduleDate} at ${scheduleTime} (${scheduleTimezone})`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Schedule</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Studio Schedule Date/Time Bar */}
              <div className="px-6 py-3 bg-indigo-50/70 border-b border-indigo-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950">
                    Schedule Automated Delivery:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-slate-900"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-slate-900"
                  />
                  <select
                    value={scheduleTimezone}
                    onChange={e => setScheduleTimezone(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-slate-800"
                  >
                    {SCHEDULE_TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isSchedulingEmail || validCount === 0}
                    onClick={handleScheduleBulkValidLeads}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Schedule All ({validCount})</span>
                  </button>
                </div>
              </div>

              {/* Filled Variables Summary inside Studio Email Preview */}
              <div className="px-6 py-3 bg-blue-50/60 border-b border-slate-200">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Filled Variables for {activePreviewRecord?.contactPerson || 'Selected Recipient'} ({activePreviewRecord?.companyName || 'Company'}):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {getResolvedVariablesList(activePreviewRecord).map(v => (
                    <div key={v.tag} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] flex flex-col">
                      <span className="text-[9px] font-mono text-blue-700">{v.tag}</span>
                      <span className="font-black text-slate-900 truncate">{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved PDF Attachments Selector inside Studio Email Preview */}
              <div className="px-6 py-3.5 bg-white border-b border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      Attach Saved PDF Documents (Up to {MAX_PDF_ATTACHMENTS} Max)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black">
                    {selectedPdfAttachments.length} / {MAX_PDF_ATTACHMENTS} PDFs Attached
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedPdfLibrary.map(doc => {
                    const isAttached = attachedPdfIds.includes(doc.id);
                    const isDisabled = !isAttached && attachedPdfIds.length >= MAX_PDF_ATTACHMENTS;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleTogglePdfAttachment(doc.id)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isAttached
                            ? 'bg-rose-50/70 border-rose-400 font-bold text-slate-900'
                            : isDisabled
                            ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isAttached}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-rose-600 pointer-events-none"
                          />
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black shrink-0">
                            PDF
                          </span>
                          <span className="truncate font-bold">{doc.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{doc.fileSizeLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 space-y-4 bg-slate-50/60">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  <div className="pb-3 border-b border-slate-100 space-y-1 text-xs">
                    <div>
                      <span className="font-bold text-slate-400">To: </span>
                      <span className="font-bold text-slate-900">
                        {activePreviewRecord?.contactPerson || 'Valued Partner'} &lt;{activePreviewRecord?.email || 'contact@company.com'}&gt;
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">Subject: </span>
                      <span className="font-black text-blue-900">
                        {interpolateText(editingTemplate.subject, activePreviewRecord)}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="font-bold text-slate-400">Attached PDFs ({selectedPdfAttachments.length}/{MAX_PDF_ATTACHMENTS}): </span>
                      {selectedPdfAttachments.length > 0 ? (
                        selectedPdfAttachments.map(doc => (
                          <span key={doc.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-900 text-[10px] font-bold">
                            <span className="px-1 rounded bg-rose-600 text-white text-[8px] font-black">PDF</span>
                            <span>{doc.title}</span>
                            <span className="font-mono text-rose-700">({doc.fileSizeLabel})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 text-white p-5 rounded-xl space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      {editingTemplate.badgeLabel}
                    </div>
                    <h4 className="text-base font-black">
                      {interpolateText(editingTemplate.headline, activePreviewRecord)}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {interpolateText(editingTemplate.subheadline, activePreviewRecord)}
                    </p>
                  </div>

                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {interpolateText(editingTemplate.body, activePreviewRecord)}
                  </div>

                  {editingTemplate.includeCredentialsBox && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="font-black text-amber-950 uppercase text-[10px]">
                        Official Trade Heaven Portal Credentials
                      </div>
                      <div>
                        <strong>Login ID:</strong> <span className="font-mono">{activePreviewRecord?.email || 'partner@company.com'}</span>
                      </div>
                      <div>
                        <strong>Temporary Password:</strong>{' '}
                        <span className="font-mono">
                          {`${(activePreviewRecord?.companyName || 'Trade').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'Partner'}@2026`}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedPdfAttachments.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-rose-600" />
                        <span>Attached Official PDF Documents ({selectedPdfAttachments.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {selectedPdfAttachments.map(doc => (
                          <div key={doc.id} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">{doc.fileName}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black">
                      {editingTemplate.ctaText}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Content View based on Input Mode */}
      {inputMode === 'UPLOADER' && (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Upload CSV, XLS, or XLSX Spreadsheet</h3>
              <p className="text-xs text-slate-500">Drag and drop your file here, or click browse to auto-parse and stage records.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls, .txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Browse Files on Computer
            </button>
            <p className="text-[11px] text-slate-400">Supported formats: .CSV, .XLSX, .XLS. Maximum batch size: 500 rows.</p>
          </div>
        </div>
      )}

      {inputMode === 'SMART_PASTE' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Smart Paste from Excel / Google Sheets</h3>
              <p className="text-xs text-slate-500">Paste your tab-separated spreadsheet rows directly below. Columns will be auto-mapped.</p>
            </div>
            <button
              onClick={handleParseSmartPaste}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Parse &amp; Load Records</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={rawPasteText}
            onChange={(e) => setRawPasteText(e.target.value)}
            placeholder={`Company Name\tContact Person\tEmail\tPhone\tCountry\tTarget Product\nApex Global\tMarcus Vance\tm.vance@apex.com\t+14158923321\tUSA\tSolar Inverters\nBavarian Auto\tGreta Schmidt\tschmidt@bavarian.de\t+4989441290\tGermany\tCNC Castings`}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {inputMode === 'SPREADSHEET' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
          
          {/* Table Control Bar */}
          <div className="p-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-black text-slate-900">Contact List &amp; Inline Staging Grid</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold">Total: {totalRows}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Valid: {validCount}</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-black border border-blue-200">
                  Selected: {selectedCount}
                </span>
                {errorCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">Errors: {errorCount}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                {isAllSelected ? 'Deselect All' : `Select All (${totalRows})`}
              </button>
              <button
                type="button"
                onClick={handleSelectAllValidLeads}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
              >
                Select Valid ({validCount})
              </button>
              <button
                onClick={handleAddRow}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BULK ACTION TOOLBAR FOR MULTI-SELECTED LEADS                  */}
          {/* ------------------------------------------------------------- */}
          <div
            className={`px-6 py-4 border-b transition-all ${
              selectedCount > 0
                ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-slate-800'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
              {/* Left: Selection Counter & Quick Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border ${
                    selectedCount > 0
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-400 text-blue-600 cursor-pointer"
                    title="Select or deselect all leads in contact list"
                  />
                  <span>
                    {selectedCount > 0
                      ? `${selectedCount} of ${totalRows} Lead${selectedCount === 1 ? '' : 's'} Selected`
                      : '0 Leads Selected (Check rows below)'}
                  </span>
                </div>

                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Selection</span>
                  </button>
                )}

                <span
                  className={`text-[11px] hidden sm:inline ${
                    selectedCount > 0 ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Bulk Action Toolbar — Run operations across all selected leads in one go:
                </span>
              </div>

              {/* Right: The 3 Core Bulk Operations ('Bulk Email', 'Assign Lead Status', 'Schedule Follow-up') */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. BULK EMAIL ACTION */}
                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded-2xl border ${
                    selectedCount > 0
                      ? 'bg-white/10 border-white/15'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <select
                    value={selectedTemplateId}
                    onChange={e => {
                      const found = templates.find(t => t.id === e.target.value);
                      if (found) handleSelectTemplate(found);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold max-w-[190px] truncate ${
                      selectedCount > 0
                        ? 'bg-slate-900 text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                    title="Select reusable template for Bulk Email"
                  >
                    {templates.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>
                        [{tpl.targetAudience}] {tpl.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={selectedCount === 0 || isDispatchingEmail}
                    onClick={handleBulkEmailSelectedLeads}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                    title={`Send "${editingTemplate.name}" (${selectedPdfAttachments.length} PDFs) to ${selectedCount} selected lead(s)`}
                  >
                    {isDispatchingEmail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>Bulk Email ({selectedCount})</span>
                  </button>
                </div>

                {/* 2. ASSIGN LEAD STATUS ACTION */}
                <div
                  className={`flex items-center gap-1.5 p-1.5 rounded-2xl border ${
                    selectedCount > 0
                      ? 'bg-white/10 border-white/15'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <select
                    value={bulkTargetStatus}
                    onChange={e => setBulkTargetStatus(e.target.value as LeadPipelineStatus)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                      selectedCount > 0
                        ? 'bg-slate-900 text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                    title="Choose Lead Status to assign to selected leads"
                  >
                    {LEAD_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        Status: {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => handleBulkAssignLeadStatus()}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                    title={`Assign "${LEAD_STATUS_OPTIONS.find(o => o.value === bulkTargetStatus)?.label}" to ${selectedCount} selected lead(s)`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Assign Lead Status ({selectedCount})</span>
                  </button>
                </div>

                {/* 3. SCHEDULE FOLLOW-UP ACTION */}
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => setShowBulkFollowUpDrawer(prev => !prev)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 border shadow-xs ${
                    showBulkFollowUpDrawer
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                  }`}
                  title="Schedule automated follow-up date, time, and channel for all selected leads"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Follow-up ({selectedCount})</span>
                </button>
              </div>
            </div>

            {/* Expandable Bulk Schedule Follow-up Drawer */}
            {showBulkFollowUpDrawer && selectedCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/15 bg-slate-900/90 rounded-2xl p-4 space-y-3 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Bulk Schedule Follow-up for {selectedCount} Selected Lead{selectedCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const tom = new Date(Date.now() + 24 * 3600 * 1000);
                        setBulkFollowUpDate(tom.toISOString().slice(0, 10));
                        setBulkFollowUpTime('10:00');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-slate-200 cursor-pointer"
                    >
                      Tomorrow 10:00
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const in3Days = new Date(Date.now() + 3 * 24 * 3600 * 1000);
                        setBulkFollowUpDate(in3Days.toISOString().slice(0, 10));
                        setBulkFollowUpTime('14:00');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-slate-200 cursor-pointer"
                    >
                      +3 Days 14:00
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkFollowUpDrawer(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Follow-up Date</label>
                    <input
                      type="date"
                      value={bulkFollowUpDate}
                      onChange={e => setBulkFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Follow-up Time</label>
                    <input
                      type="time"
                      value={bulkFollowUpTime}
                      onChange={e => setBulkFollowUpTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Timezone</label>
                    <select
                      value={bulkFollowUpTimezone}
                      onChange={e => setBulkFollowUpTimezone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    >
                      {SCHEDULE_TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Follow-up Channel</label>
                    <select
                      value={bulkFollowUpChannel}
                      onChange={e => setBulkFollowUpChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    >
                      <option value="Automated Template Email">Automated Template Email</option>
                      <option value="Phone / WhatsApp Call">Phone / WhatsApp Call</option>
                      <option value="Escrow & Contract Review">Escrow &amp; Contract Review</option>
                      <option value="RFQ Quotation Follow-up">RFQ Quotation Follow-up</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Action Note / Objective</label>
                    <input
                      type="text"
                      value={bulkFollowUpNote}
                      onChange={e => setBulkFollowUpNote(e.target.value)}
                      placeholder="e.g. Confirm CIF port terms & SBLC"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkFollowUpQueueEmail}
                      onChange={e => setBulkFollowUpQueueEmail(e.target.checked)}
                      className="rounded border-slate-600 text-amber-400"
                    />
                    <span>
                      Also queue active template <strong className="text-amber-300">"{editingTemplate.name}"</strong> ({selectedPdfAttachments.length} PDFs) for automated delivery at this date &amp; time
                    </span>
                  </label>

                  <button
                    type="button"
                    disabled={isSchedulingEmail}
                    onClick={handleBulkScheduleFollowUp}
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Follow-up for {selectedCount} Lead{selectedCount === 1 ? '' : 's'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spreadsheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      title="Select all leads"
                      className="rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 w-10 text-center">#</th>
                  {entityCategory === 'BUYER_LEAD' && (
                    <>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Contact Person</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone / WhatsApp</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Target Product</th>
                      <th className="p-3">Budget</th>
                      <th className="p-3">Priority</th>
                    </>
                  )}
                  {entityCategory === 'SUPPLIER_PROFILE' && (
                    <>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Star Rating</th>
                      <th className="p-3">Showcase Limit</th>
                    </>
                  )}
                  {entityCategory === 'RFQ' && (
                    <>
                      <th className="p-3">RFQ Title</th>
                      <th className="p-3">Buyer Company</th>
                      <th className="p-3">Contact Email</th>
                      <th className="p-3">Volume / Unit</th>
                      <th className="p-3">Target Price</th>
                      <th className="p-3">Destination Port</th>
                      <th className="p-3">Incoterm</th>
                    </>
                  )}
                  {entityCategory === 'GENERAL_INQUIRY' && (
                    <>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Inquiry Type</th>
                      <th className="p-3">Status</th>
                    </>
                  )}
                  <th className="p-3">Lead Status &amp; Follow-up</th>
                  <th className="p-3">Assigned IEM</th>
                  <th className="p-3 text-right">Actions &amp; Quick Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec, index) => {
                  const valRes = validationResults[index];
                  const isRowSelected = selectedRowIds.includes(rec.id);
                  const currentStatusObj =
                    LEAD_STATUS_OPTIONS.find(o => o.value === (rec.leadStatus || 'NEW_LEAD')) ||
                    LEAD_STATUS_OPTIONS[0];
                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${
                        isRowSelected
                          ? 'bg-blue-50/70 hover:bg-blue-50'
                          : !valRes.isValid
                          ? 'bg-rose-50/30 hover:bg-rose-50/50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleToggleSelectRow(rec.id)}
                          className="rounded border-slate-300 text-blue-600 cursor-pointer"
                          title={`Select ${rec.companyName || rec.contactPerson || 'row'}`}
                        />
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400 font-bold">
                        {index + 1}
                      </td>

                      {entityCategory === 'BUYER_LEAD' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                              placeholder="Company Name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.contactPerson || ''}
                              onChange={(e) => handleUpdateCell(index, 'contactPerson', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                              placeholder="Contact Person"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border ${valRes.errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} focus:bg-white focus:ring-1 focus:ring-blue-500`}
                              placeholder="Email Address"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.phone || ''}
                              onChange={(e) => handleUpdateCell(index, 'phone', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                              placeholder="Phone / WhatsApp"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.country || ''}
                              onChange={(e) => handleUpdateCell(index, 'country', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                              placeholder="Country"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.targetProduct || ''}
                              onChange={(e) => handleUpdateCell(index, 'targetProduct', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                              placeholder="Commodity / Product"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.budget || ''}
                              onChange={(e) => handleUpdateCell(index, 'budget', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                              placeholder="Budget USD"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={rec.priority || 'WARM'}
                              onChange={(e) => handleUpdateCell(index, 'priority', e.target.value)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-black border ${
                                rec.priority === 'HOT' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                rec.priority === 'WARM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="HOT">HOT</option>
                              <option value="WARM">WARM</option>
                              <option value="COLD">COLD</option>
                            </select>
                          </td>
                        </>
                      )}

                      {entityCategory === 'SUPPLIER_PROFILE' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                              placeholder="Supplier Company"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.category || ''}
                              onChange={(e) => handleUpdateCell(index, 'category', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white"
                              placeholder="Industry Category"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white"
                              placeholder="Email"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.phone || ''}
                              onChange={(e) => handleUpdateCell(index, 'phone', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]"
                              placeholder="Phone"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.country || ''}
                              onChange={(e) => handleUpdateCell(index, 'country', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Country"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={rec.starRating || 4}
                              onChange={(e) => handleUpdateCell(index, 'starRating', Number(e.target.value))}
                              className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px]"
                            >
                              <option value="3">3 Star Vetted</option>
                              <option value="4">4 Star Verified</option>
                              <option value="5">5 Star Elite</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={rec.productShowcaseLimit || 25}
                              onChange={(e) => handleUpdateCell(index, 'productShowcaseLimit', Number(e.target.value))}
                              className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-center"
                            />
                          </td>
                        </>
                      )}

                      {entityCategory === 'RFQ' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.rfqTitle || ''}
                              onChange={(e) => handleUpdateCell(index, 'rfqTitle', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium"
                              placeholder="Requirement Title"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Buyer Company"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Email"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.volumeUnit || ''}
                              onChange={(e) => handleUpdateCell(index, 'volumeUnit', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]"
                              placeholder="Volume (e.g. 2000 Units)"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.targetPrice || ''}
                              onChange={(e) => handleUpdateCell(index, 'targetPrice', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]"
                              placeholder="Target Price"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.portOfDestination || ''}
                              onChange={(e) => handleUpdateCell(index, 'portOfDestination', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Destination Port"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={rec.incoterm || 'CIF'}
                              onChange={(e) => handleUpdateCell(index, 'incoterm', e.target.value)}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 font-bold text-[11px]"
                            >
                              <option value="CIF">CIF</option>
                              <option value="FOB">FOB</option>
                              <option value="EXW">EXW</option>
                              <option value="DDP">DDP</option>
                            </select>
                          </td>
                        </>
                      )}

                      {entityCategory === 'GENERAL_INQUIRY' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.subject || ''}
                              onChange={(e) => handleUpdateCell(index, 'subject', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium"
                              placeholder="Inquiry Subject"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.contactPerson || ''}
                              onChange={(e) => handleUpdateCell(index, 'contactPerson', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Contact Name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Company"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Email"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.inquiryType || ''}
                              onChange={(e) => handleUpdateCell(index, 'inquiryType', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Type"
                            />
                          </td>
                          <td className="p-2">
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                              {rec.status || 'Pending'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Lead Status & Scheduled Follow-up Column */}
                      <td className="p-2 min-w-[180px]">
                        <div className="space-y-1">
                          <select
                            value={rec.leadStatus || 'NEW_LEAD'}
                            onChange={e =>
                              handleUpdateCell(index, 'leadStatus', e.target.value as LeadPipelineStatus)
                            }
                            className={`w-full px-2 py-1 rounded-lg text-[10px] font-black border ${currentStatusObj.badgeClass}`}
                          >
                            {LEAD_STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {rec.scheduledFollowUp && (
                            <div
                              className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-900 flex items-center justify-between gap-1"
                              title={`${rec.scheduledFollowUp.channel}: ${rec.scheduledFollowUp.note || ''}`}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
                                <span className="font-bold truncate">
                                  {rec.scheduledFollowUp.date} {rec.scheduledFollowUp.time}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUpdateCell(index, 'scheduledFollowUp', undefined)}
                                className="text-indigo-400 hover:text-rose-600 shrink-0 cursor-pointer"
                                title="Clear follow-up"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned IEM Column */}
                      <td className="p-2">
                        <select
                          value={rec.assignedIem || globalIem}
                          onChange={(e) => handleUpdateCell(index, 'assignedIem', e.target.value)}
                          className="w-36 px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 truncate"
                        >
                          {INITIAL_IEM_MANAGERS.map(m => (
                            <option key={m} value={m}>{m.split(' ')[0]} {m.split(' ')[1]}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions & Preview / Send Saved Template */}
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenPreviewForRow(index)}
                            title={`Preview email with variables filled in for ${rec.contactPerson || rec.companyName || 'this contact'}`}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer ${
                              previewRecordIndex === index && showEmailPreviewPanel
                                ? 'bg-slate-900 text-amber-400 border-slate-900'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            disabled={isDispatchingEmail}
                            onClick={() => handleSendTemplateToSingleRow(rec)}
                            title={`Send active template "${editingTemplate.name}" to ${rec.email || 'this contact'}`}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSchedulingEmail}
                            onClick={() => handleScheduleSingleLead(rec)}
                            title={`Schedule "${editingTemplate.name}" for ${rec.email || 'this contact'} on ${scheduleDate} at ${scheduleTime} (${scheduleTimezone})`}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Schedule</span>
                          </button>
                          <button
                            onClick={() => handleCloneRow(index)}
                            title="Clone Row"
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(index)}
                            title="Delete Row"
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Batch Summary Bar */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="font-bold">Batch Summary:</span>
              <span>Total Rows: <strong className="text-slate-900 font-mono">{totalRows}</strong></span>
              <span>Selected Leads: <strong className="text-blue-700 font-mono">{selectedCount}</strong></span>
              <span>Valid Records: <strong className="text-emerald-700 font-mono">{validCount}</strong></span>
              {errorCount > 0 && (
                <span className="text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errorCount} rows have validation warnings</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleAddRow}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Row</span>
              </button>
              <button
                onClick={handlePushToCrm}
                disabled={isSubmitting || validCount === 0}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950" />
                )}
                <span>Push {validCount} Records to Database</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

