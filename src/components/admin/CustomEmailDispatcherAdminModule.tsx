import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import type {
  CustomAdminInquiryItem,
  CustomAdminEmailPayload
} from '../../services/smtpService';
import { CompanyEmailHistorySection } from './CompanyEmailHistorySection';

const MEMBERSHIP_RENEWAL_DEFAULTS = {
  companyName: 'ACE Intermediary',
  address: '1241 Hackberry Avenue Corsicana Texas 75110',
  email: 'ezekiahali355@gmail.com',
  decisionMakerName: 'Ali Charley Ezekiah',
  paymentMethod: 'Debit Card'
};

interface DispatchedHistoryItem {
  id: string;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  subject: string;
  templatePreset: string;
  messageId?: string;
  dispatchedAt: string;
  success: boolean;
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
}> = [
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
  const [selectedPreset, setSelectedPreset] = useState<string>('MEMBERSHIP_RENEWAL');
  const [activeSubTab, setActiveSubTab] = useState<'FORM' | 'PREVIEW' | 'HISTORY'>('FORM');
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
  const [sendAdminCopy, setSendAdminCopy] = useState(true);
  const [adminCopyEmail, setAdminCopyEmail] = useState('yr943334@gmail.com');
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
    dispatchedAt?: string;
  } | null>(null);

  // History State
  const [history, setHistory] = useState<DispatchedHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('th_admin_dispatched_emails_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'hist-ali-basic-renewal-client',
        recipientEmail: 'ezekiahali355@gmail.com',
        recipientName: 'Ali Charley Ezekiah',
        companyName: 'ACE Intermediary',
        subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
        templatePreset: 'MEMBERSHIP_RENEWAL',
        messageId: '<basic-plan-renewal-ace-intermediary-2026@tradeheaven.net>',
        dispatchedAt: new Date().toISOString(),
        success: true
      },
      {
        id: 'hist-ali-basic-renewal-admin-copy',
        recipientEmail: 'yr943334@gmail.com',
        recipientName: 'Admin Copy (Sarah Jenkins / Master Admin)',
        companyName: 'ACE Intermediary',
        subject: '[ADMIN COPY] 💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
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

  const handleApplyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const matched = PRESET_TEMPLATES.find(p => p.id === presetId);
    if (!matched) return;
    setFormData({
      ...matched.data,
      inquiries: (matched.data.inquiries || []).map(inq => ({ ...inq }))
    });
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

  const handleSendEmail = async () => {
    if (!formData.recipientEmail || !formData.recipientEmail.includes('@')) {
      alert('Please provide a valid recipient email address.');
      return;
    }
    if (!formData.subject) {
      alert('Please provide an email subject line.');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/v1/admin/send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          sendAdminCopy,
          adminCopyEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        const nowIso = new Date().toISOString();
        const newHistItem: DispatchedHistoryItem = {
          id: `hist-${Date.now()}`,
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName || 'Trade Partner',
          companyName: formData.companyName || 'Corporate Entity',
          subject: formData.subject,
          templatePreset: selectedPreset,
          messageId: data.receipt?.messageId || data.messageId,
          dispatchedAt: nowIso,
          success: true
        };
        const itemsToAdd: DispatchedHistoryItem[] = [newHistItem];
        if (sendAdminCopy && adminCopyEmail) {
          itemsToAdd.push({
            id: `hist-admin-${Date.now()}`,
            recipientEmail: adminCopyEmail,
            recipientName: `Admin Copy (${formData.recipientName || 'Ali Charley Ezekiah'})`,
            companyName: formData.companyName || 'ACE Intermediary',
            subject: `[ADMIN COPY] ${formData.subject}`,
            templatePreset: selectedPreset,
            messageId: data.adminCopyReceipt?.messageId || `<admin-copy-${Date.now()}@tradeheaven.net>`,
            dispatchedAt: nowIso,
            success: true
          });
        }
        setHistory(prev => [...itemsToAdd, ...prev]);
        setSendResult({
          success: true,
          message:
            data.message ||
            `Email delivered to ${formData.recipientEmail}${sendAdminCopy ? ` + Admin Copy sent to ${adminCopyEmail}` : ''}`,
          messageId: data.receipt?.messageId || data.messageId,
          dispatchedAt: new Date().toLocaleTimeString()
        });
      } else {
        const failItem: DispatchedHistoryItem = {
          id: `hist-${Date.now()}`,
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName || 'Trade Partner',
          companyName: formData.companyName || 'Corporate Entity',
          subject: formData.subject,
          templatePreset: selectedPreset,
          dispatchedAt: new Date().toISOString(),
          success: false,
          error: data.message || 'SMTP transmission failed'
        };
        setHistory(prev => [failItem, ...prev]);
        setSendResult({
          success: false,
          message: data.message || 'SMTP delivery error'
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Network error while attempting to dispatch email.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="custom-email-dispatcher-admin" className="space-y-6">
      
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
              <span>Live Render Preview</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
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

      {/* SUB-TAB 1: FORM EDITOR */}
      {activeSubTab === 'FORM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: RECIPIENT & CREDENTIALS */}
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
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span className="font-semibold">Send Copy to Admin on Mail:</span>
                    <input
                      type="checkbox"
                      checked={sendAdminCopy}
                      onChange={e => setSendAdminCopy(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                  </label>
                  {sendAdminCopy && (
                    <div className="space-y-1">
                      <input
                        type="email"
                        value={adminCopyEmail}
                        onChange={e => setAdminCopyEmail(e.target.value)}
                        placeholder="Admin email for copy..."
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
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={isSending || !formData.recipientEmail}
                onClick={handleSendEmail}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-wide uppercase transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Client &amp; Admin...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Send Renewal to {formData.recipientName || 'Ali'} {sendAdminCopy ? '+ Admin Copy' : 'Now'}
                    </span>
                  </>
                )}
              </button>
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

          </div>
        </div>
      )}

      {/* SUB-TAB 2: LIVE HTML PREVIEW */}
      {activeSubTab === 'PREVIEW' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
              <span>Preview Mode:</span>
              <button
                type="button"
                onClick={() => setPreviewDevice('DESKTOP')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === 'DESKTOP' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Desktop (640px)
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('MOBILE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === 'MOBILE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Mobile (380px)
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Simulated Client: <span className="font-bold text-slate-800">{formData.recipientEmail || 'None'}</span>
            </div>
          </div>

          <div className="bg-slate-100 p-6 rounded-2xl flex justify-center overflow-x-auto">
            <div 
              style={{ width: previewDevice === 'DESKTOP' ? '640px' : '380px' }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 transition-all duration-300"
            >
              {/* HEADER */}
              <div style={{ background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1536 100%)' }} className="p-8 text-center text-white">
                <div className="inline-block text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full mb-3">
                  {formData.badgeLabel || 'TRADE HEAVEN • GLOBAL B2B DESK'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {formData.headline || 'Welcome to Trade Heaven'}
                </h1>
                <p className="text-xs text-slate-300 mt-2">
                  {formData.subheadline || `Communication for ${formData.companyName || 'Corporate Entity'}`}
                </p>
              </div>

              {/* BODY CONTENT */}
              <div className="p-6 space-y-5 text-slate-800">
                <p className="text-sm">
                  Hello <strong>{formData.decisionMakerName || formData.recipientName || 'Trade Partner'}</strong>,
                </p>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {formData.introMessage || 'Please review your account access details and matched inquiries.'}
                </div>

                {/* MEMBERSHIP RENEWAL & CLIENT DETAILS BOX */}
                {(formData.address || formData.paymentMethod || formData.isMembershipRenewal || selectedPreset === 'MEMBERSHIP_RENEWAL') && (
                  <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-900 tracking-wider uppercase">
                      <span>CLIENT MEMBERSHIP &amp; BILLING SUMMARY</span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-black">
                        CURRENT OFFER ACTIVE
                      </span>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Company Name:</span>
                        <span className="font-extrabold text-slate-900 text-right">{formData.companyName || '{{companyName}}'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Address:</span>
                        <span className="font-semibold text-slate-900 text-right">{formData.address || '{{address}}'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Email:</span>
                        <span className="font-mono font-bold text-blue-700 text-right">{formData.recipientEmail || '{{email}}'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 font-semibold">Decision Maker Name:</span>
                        <span className="font-extrabold text-slate-900 text-right">
                          {formData.decisionMakerName || formData.recipientName || '{{decisionMakerName}}'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-500 font-semibold">Payment Method:</span>
                        <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-extrabold text-emerald-800">
                          💳 {formData.paymentMethod || '{{paymentMethod}}'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CREDENTIALS BOX */}
                {formData.includeCredentialsBox !== false && (
                  <div className="bg-blue-50/70 border-2 border-blue-500 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-blue-900 tracking-wider uppercase">
                      <span>PORTAL LOGIN CREDENTIALS &amp; USER ID</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">VERIFIED ACCESS</span>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Portal Website:</span>
                        <a href={formData.portalUrl || 'https://www.tradeheaven.net'} className="text-blue-600 font-bold underline">
                          {formData.portalUrl || 'https://www.tradeheaven.net'}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">User ID / Login:</span>
                        <span className="font-mono font-bold text-slate-900">{formData.loginEmail || formData.recipientEmail}</span>
                      </div>
                      {formData.loginPassword && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Assigned Password:</span>
                          <span className="bg-white border border-blue-200 px-2 py-0.5 rounded font-mono font-bold text-blue-700">
                            {formData.loginPassword}
                          </span>
                        </div>
                      )}
                      {formData.contactPhone && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Registered Phone:</span>
                          <span className="font-semibold text-slate-900">{formData.contactPhone}</span>
                        </div>
                      )}
                      {formData.companyName && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Company Entity:</span>
                          <span className="font-semibold text-slate-900">{formData.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LOGIN GUIDE */}
                {formData.includeLoginGuide !== false && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide">
                      Quick 3-Step Login Guide:
                    </div>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Go to <strong className="text-blue-600">{formData.portalUrl || 'https://www.tradeheaven.net'}</strong> and click &ldquo;Sign In&rdquo; at top right.</li>
                      <li>Enter your User ID (<strong>{formData.loginEmail || formData.recipientEmail}</strong>) and Password.</li>
                      <li>Open your <strong>Dashboard &gt; Inquiries &amp; Buy Leads</strong> to review specifications and submit quotations.</li>
                    </ol>
                  </div>
                )}

                {/* INQUIRIES */}
                {formData.inquiries && formData.inquiries.length > 0 && (
                  <div className="space-y-3 pt-2">
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
                        key={idx}
                        className="bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-xl p-3.5 space-y-1.5 text-xs shadow-xs"
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {inq.id || `RFQ-${idx + 1}`}
                          </span>
                          {inq.estimatedValue && (
                            <span className="font-extrabold text-emerald-700">
                              Est: {inq.estimatedValue}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {inq.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                          {inq.buyerCompany && <div><strong>Buyer:</strong> {inq.buyerCompany} {inq.buyerCountry ? `(${inq.buyerCountry})` : ''}</div>}
                          {inq.quantity && <div><strong>Volume:</strong> <span className="font-bold text-slate-800">{inq.quantity}</span></div>}
                          {inq.incotermPort && <div><strong>Terms:</strong> {inq.incotermPort}</div>}
                          {inq.paymentTerms && <div><strong>Payment:</strong> {inq.paymentTerms}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA BUTTON */}
                <div className="text-center pt-3 pb-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleTriggerRenewNowPayment}
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-8 py-3.5 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {formData.ctaText || 'Renew Now'}
                  </button>
                  <div className="text-[10px] text-slate-500">
                    Clicking <strong>&ldquo;{formData.ctaText || 'Renew Now'}&rdquo;</strong> opens the live Subscription Renewal Checkout Modal ({formData.paymentMethod || 'Debit Card'})
                  </div>
                </div>

                {/* ESCROW BADGE */}
                {formData.includeEscrowBadge !== false && (
                  <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Trade Heaven Escrow Protection:</strong> All high-value institutional contracts finalized on Trade Heaven operate under regulated escrow protocols with independent SGS/Saybolt verification prior to funds release.
                  </div>
                )}

                {/* FOOTER */}
                <p className="text-[10px] text-slate-400 text-center pt-2">
                  Dispatched via <strong>noreply@tradeheaven.net</strong> • Immediate support on WhatsApp +91 85329 34479 or help@tradeheaven.net
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DISPATCH HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="space-y-6">
          {/* Per-Company Automated + Manual Email History Section */}
          <CompanyEmailHistorySection
            companyName={formData.companyName || 'Middle Fox LLC'}
            contactEmail={formData.recipientEmail || 'randy@midforkcap.com'}
            contactName={formData.recipientName || 'Mr. Randy'}
            contactPhone={formData.contactPhone || '+1 (406) 309 5590'}
          />

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  All Manual Dispatches Across Companies (Local Session Log)
                </h3>
                <p className="text-[10px] text-slate-500">
                  Quick-reload any previously composed manual email template across all company contacts
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear dispatch history?')) {
                    setHistory([]);
                    localStorage.removeItem('th_admin_dispatched_emails_history');
                  }
                }}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {history.length > 0 ? (
                history.map(item => (
                  <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {item.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
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
                        </div>
                        <div className="text-xs text-slate-700 font-semibold truncate max-w-xl">
                          {item.subject}
                        </div>
                        {item.messageId && (
                          <div className="text-[10px] font-mono text-emerald-800">
                            Message-ID: {item.messageId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.dispatchedAt).toLocaleString()}
                        </div>
                        <span className={`text-[10px] font-black uppercase ${item.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {item.success ? 'Delivered (SMTP 465)' : 'Failed'}
                        </span>
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
                ))
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
