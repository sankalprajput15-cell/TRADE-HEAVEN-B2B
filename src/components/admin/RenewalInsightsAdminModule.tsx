import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Mail,
  MousePointerClick,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  CreditCard,
  Eye,
  Send,
  Sparkles,
  Building2,
  BarChart3,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { PaymentCheckoutData } from '../../types';

export type RenewalConversionStatus =
  | 'CONVERTED'
  | 'CHECKOUT_INITIATED'
  | 'CLICKED'
  | 'OPENED'
  | 'SENT';

export interface RenewalOfferEmailRecord {
  id: string;
  recipientName: string;
  decisionMakerName: string;
  recipientEmail: string;
  companyName: string;
  address: string;
  paymentMethod: string;
  planId: string;
  planName: string;
  offerTitle: string;
  standardAmountUsd: number;
  renewalAmountUsd: number;
  discountLabel: string;
  promoCode: string;
  subject: string;
  sentAt: string;
  delivered: boolean;
  adminCopySent: boolean;
  adminCopyEmail?: string;
  opened: boolean;
  openCount: number;
  lastOpenedAt?: string;
  clicked: boolean;
  clickCount: number;
  lastClickedAt?: string;
  conversionStatus: RenewalConversionStatus;
  convertedAt?: string;
  orderId?: string;
}

const DEFAULT_RENEWAL_RECORDS: RenewalOfferEmailRecord[] = [
  {
    id: 'ren-ali-ace-001',
    recipientName: 'Ali Charley Ezekiah',
    decisionMakerName: 'Ali Charley Ezekiah',
    recipientEmail: 'ezekiahali355@gmail.com',
    companyName: 'ACE Intermediary',
    address: '1241 Hackberry Avenue Corsicana Texas 75110',
    paymentMethod: 'Debit Card',
    planId: 'basic-business-plan',
    planName: 'Basic Business Plan',
    offerTitle: 'Basic Plan Renewal — Flat 10% OFF ($990/yr vs $1,100/yr) + New Exciting Deals',
    standardAmountUsd: 1100,
    renewalAmountUsd: 990,
    discountLabel: '10% OFF',
    promoCode: 'DIWALI10',
    subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) & Exciting B2B Deals for ACE Intermediary (Attn: Ali Charley Ezekiah)',
    sentAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    delivered: true,
    adminCopySent: true,
    adminCopyEmail: 'yr943334@gmail.com',
    opened: true,
    openCount: 3,
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    clicked: true,
    clickCount: 2,
    lastClickedAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    conversionStatus: 'CHECKOUT_INITIATED'
  },
  {
    id: 'ren-mark-atlantic-002',
    recipientName: 'Mark Johnson',
    decisionMakerName: 'Mark Johnson (President)',
    recipientEmail: 'mjohnson@atlanticpowerequip.com',
    companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
    address: 'P.O. Box 1176, Marmora, NJ 08223 USA',
    paymentMethod: 'Debit Card',
    planId: 'vip-business-plan',
    planName: 'VIP Business Plan',
    offerTitle: 'VIP Business Plan Renewal — 10% OFF ($5,490/yr) + Golden Lead Access',
    standardAmountUsd: 6100,
    renewalAmountUsd: 5490,
    discountLabel: '10% OFF',
    promoCode: 'DIWALI10',
    subject: '💎 VIP Business Plan Renewal Offer ($5,490/yr — 10% OFF) & Exciting B2B Deals for Atlantic Power & Equipment Co.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    delivered: true,
    adminCopySent: true,
    adminCopyEmail: 'yr943334@gmail.com',
    opened: true,
    openCount: 5,
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    clicked: true,
    clickCount: 3,
    lastClickedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    conversionStatus: 'CONVERTED',
    convertedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    orderId: 'ORD-REN-884920'
  },
  {
    id: 'ren-randy-middlefox-003',
    recipientName: 'Mr. Randy',
    decisionMakerName: 'Mr. Randy',
    recipientEmail: 'randy@midforkcap.com',
    companyName: 'Middle Fox LLC',
    address: 'Billings, Montana 59101, United States',
    paymentMethod: 'Corporate Wire / Debit Card',
    planId: 'premium-partner-plan',
    planName: 'Premium Partner Plan',
    offerTitle: 'Premium Partner Plan Renewal — 10% OFF ($1,890/yr vs $2,100/yr)',
    standardAmountUsd: 2100,
    renewalAmountUsd: 1890,
    discountLabel: '10% OFF',
    promoCode: 'RENEW10',
    subject: '💎 Premium Partner Plan Renewal Offer ($1,890/yr — 10% OFF) & Buyer Tenders for Middle Fox LLC',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    delivered: true,
    adminCopySent: true,
    adminCopyEmail: 'yr943334@gmail.com',
    opened: true,
    openCount: 4,
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    clicked: true,
    clickCount: 2,
    lastClickedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    conversionStatus: 'CONVERTED',
    convertedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    orderId: 'ORD-REN-773104'
  },
  {
    id: 'ren-marcus-apex-004',
    recipientName: 'Marcus Vance',
    decisionMakerName: 'Marcus Vance (VP Global Sourcing)',
    recipientEmail: 'm.vance@apexglobal.com',
    companyName: 'Apex Global Logistics & Sourcing',
    address: '450 Mission Street, San Francisco, CA 94105 USA',
    paymentMethod: 'Debit Card',
    planId: 'basic-business-plan',
    planName: 'Basic Business Plan',
    offerTitle: 'Basic Plan Renewal — Flat 10% OFF ($990/yr vs $1,100/yr)',
    standardAmountUsd: 1100,
    renewalAmountUsd: 990,
    discountLabel: '10% OFF',
    promoCode: 'DIWALI10',
    subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) for Apex Global Logistics & Sourcing',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    delivered: true,
    adminCopySent: true,
    adminCopyEmail: 'yr943334@gmail.com',
    opened: true,
    openCount: 2,
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    clicked: true,
    clickCount: 1,
    lastClickedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    conversionStatus: 'CLICKED'
  },
  {
    id: 'ren-elena-apexmicro-005',
    recipientName: 'Elena Zhao',
    decisionMakerName: 'Elena Zhao (Export Director)',
    recipientEmail: 'elena.zhao@apexmicro.cn',
    companyName: 'Shenzhen Apex Microelectronics Co., Ltd.',
    address: 'Nanshan Hi-Tech Industrial Park, Shenzhen, China',
    paymentMethod: 'Debit Card / SWIFT',
    planId: 'premium-partner-plan',
    planName: 'Premium Partner Plan',
    offerTitle: 'Premium Partner Plan Renewal — 10% OFF ($1,890/yr)',
    standardAmountUsd: 2100,
    renewalAmountUsd: 1890,
    discountLabel: '10% OFF',
    promoCode: 'DIWALI10',
    subject: '💎 Premium Partner Plan Renewal Offer ($1,890/yr — 10% OFF) for Shenzhen Apex Microelectronics',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    delivered: true,
    adminCopySent: true,
    adminCopyEmail: 'yr943334@gmail.com',
    opened: true,
    openCount: 3,
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    clicked: true,
    clickCount: 2,
    lastClickedAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    conversionStatus: 'CONVERTED',
    convertedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    orderId: 'ORD-REN-662019'
  },
  {
    id: 'ren-carlos-iberia-006',
    recipientName: 'Carlos Mendez',
    decisionMakerName: 'Carlos Mendez',
    recipientEmail: 'cmendez@iberiaparts.es',
    companyName: 'Iberia Clean Energy Solutions',
    address: 'Paseo de la Castellana 95, Madrid, Spain',
    paymentMethod: 'Debit Card',
    planId: 'basic-business-plan',
    planName: 'Basic Business Plan',
    offerTitle: 'Basic Plan Renewal — Flat 10% OFF ($990/yr vs $1,100/yr)',
    standardAmountUsd: 1100,
    renewalAmountUsd: 990,
    discountLabel: '10% OFF',
    promoCode: 'DIWALI10',
    subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) for Iberia Clean Energy Solutions',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    delivered: true,
    adminCopySent: true,
    adminCopyEmail: 'yr943334@gmail.com',
    opened: true,
    openCount: 1,
    lastOpenedAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    clicked: false,
    clickCount: 0,
    conversionStatus: 'OPENED'
  },
  {
    id: 'ren-vikram-apex-007',
    recipientName: 'Vikram Mehta',
    decisionMakerName: 'Vikram Mehta (Managing Director)',
    recipientEmail: 'vmehta@apexmachinery.in',
    companyName: 'Apex Precision Engineering Ltd.',
    address: 'Andheri East, Mumbai, Maharashtra 400069, India',
    paymentMethod: 'Debit Card',
    planId: 'basic-business-plan',
    planName: 'Basic Business Plan',
    offerTitle: 'Basic Plan Renewal — Flat 10% OFF ($990/yr vs $1,100/yr)',
    standardAmountUsd: 1100,
    renewalAmountUsd: 990,
    discountLabel: '10% OFF',
    promoCode: 'DIWALI10',
    subject: '💎 Basic Plan Membership Renewal Offer ($990/yr — 10% OFF) for Apex Precision Engineering Ltd.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    delivered: true,
    adminCopySent: false,
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    conversionStatus: 'SENT'
  }
];

interface RenewalInsightsAdminModuleProps {
  onOpenPaymentCheckout?: (data: PaymentCheckoutData) => void;
  onNavigateToHtmlEditor?: () => void;
  onNavigateToDispatcher?: () => void;
}

export const RenewalInsightsAdminModule: React.FC<RenewalInsightsAdminModuleProps> = ({
  onOpenPaymentCheckout,
  onNavigateToHtmlEditor,
  onNavigateToDispatcher
}) => {
  const [records, setRecords] = useState<RenewalOfferEmailRecord[]>(DEFAULT_RENEWAL_RECORDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RenewalConversionStatus>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [toastBanner, setToastBanner] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const fetchRenewalInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/renewal-insights');
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.records) && data.records.length > 0) {
          setRecords(data.records);
        }
      }
    } catch {
      // Fallback to local records
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRenewalInsights();
  }, [fetchRenewalInsights]);

  const handleTrackEvent = async (
    recordId: string,
    eventType: 'OPEN' | 'CLICK' | 'CONVERT' | 'CHECKOUT_INITIATED'
  ) => {
    const nowIso = new Date().toISOString();

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        if (eventType === 'OPEN') {
          return {
            ...rec,
            opened: true,
            openCount: rec.openCount + 1,
            lastOpenedAt: nowIso,
            conversionStatus: rec.conversionStatus === 'SENT' ? 'OPENED' : rec.conversionStatus
          };
        }
        if (eventType === 'CLICK') {
          return {
            ...rec,
            opened: true,
            openCount: Math.max(1, rec.openCount),
            lastOpenedAt: rec.lastOpenedAt || nowIso,
            clicked: true,
            clickCount: rec.clickCount + 1,
            lastClickedAt: nowIso,
            conversionStatus:
              rec.conversionStatus === 'SENT' || rec.conversionStatus === 'OPENED'
                ? 'CLICKED'
                : rec.conversionStatus
          };
        }
        if (eventType === 'CHECKOUT_INITIATED') {
          return {
            ...rec,
            opened: true,
            openCount: Math.max(1, rec.openCount),
            clicked: true,
            clickCount: Math.max(1, rec.clickCount),
            lastClickedAt: nowIso,
            conversionStatus: rec.conversionStatus === 'CONVERTED' ? 'CONVERTED' : 'CHECKOUT_INITIATED'
          };
        }
        if (eventType === 'CONVERT') {
          return {
            ...rec,
            opened: true,
            openCount: Math.max(1, rec.openCount),
            clicked: true,
            clickCount: Math.max(1, rec.clickCount),
            conversionStatus: 'CONVERTED',
            convertedAt: nowIso,
            orderId: rec.orderId || `ORD-REN-${Math.floor(100000 + Math.random() * 900000)}`
          };
        }
        return rec;
      })
    );

    try {
      const res = await fetch('/api/v1/admin/renewal-insights/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, eventType })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.records)) {
          setRecords(data.records);
        }
      }
    } catch {
      // Local state already updated
    }

    const target = records.find((r) => r.id === recordId);
    const labelMap = {
      OPEN: 'Email Open event recorded',
      CLICK: '"Renew Now" Click-Through event recorded',
      CHECKOUT_INITIATED: 'Checkout Initiated status updated',
      CONVERT: 'Membership Renewal marked as Converted (Paid)'
    };
    setToastBanner({
      type: 'success',
      text: `${labelMap[eventType]} for ${target?.recipientName || 'client'} (${target?.companyName || ''}).`
    });
  };

  const handleOpenCheckoutForRecord = (rec: RenewalOfferEmailRecord) => {
    void handleTrackEvent(rec.id, 'CHECKOUT_INITIATED');
    const checkoutPayload: PaymentCheckoutData = {
      planId: rec.planId,
      planName: `${rec.planName} Renewal (${rec.companyName} — ${rec.discountLabel})`,
      amount: rec.renewalAmountUsd,
      currency: 'USD',
      billingCycle: 'ANNUAL',
      clientEmail: rec.recipientEmail,
      billingName: rec.companyName,
      address: rec.address,
      decisionMakerName: rec.decisionMakerName,
      preferredPaymentMethod: rec.paymentMethod
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

  // Compute aggregate Renewal Insights metrics
  const metrics = useMemo(() => {
    const totalSent = records.length;
    const deliveredCount = records.filter((r) => r.delivered).length;
    const openedCount = records.filter((r) => r.opened).length;
    const totalOpens = records.reduce((sum, r) => sum + r.openCount, 0);
    const clickedCount = records.filter((r) => r.clicked).length;
    const totalClicks = records.reduce((sum, r) => sum + r.clickCount, 0);
    const checkoutInitiatedCount = records.filter(
      (r) => r.conversionStatus === 'CHECKOUT_INITIATED' || r.conversionStatus === 'CONVERTED'
    ).length;
    const convertedCount = records.filter((r) => r.conversionStatus === 'CONVERTED').length;

    const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const clickThroughRate = deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;
    const clickToOpenRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
    const conversionRate = deliveredCount > 0 ? (convertedCount / deliveredCount) * 100 : 0;

    const convertedRevenueUsd = records
      .filter((r) => r.conversionStatus === 'CONVERTED')
      .reduce((sum, r) => sum + r.renewalAmountUsd, 0);

    const pipelineRevenueUsd = records
      .filter((r) => r.conversionStatus !== 'CONVERTED')
      .reduce((sum, r) => sum + r.renewalAmountUsd, 0);

    const totalDiscountSavingsUsd = records
      .filter((r) => r.conversionStatus === 'CONVERTED')
      .reduce((sum, r) => sum + Math.max(0, r.standardAmountUsd - r.renewalAmountUsd), 0);

    return {
      totalSent,
      deliveredCount,
      openedCount,
      totalOpens,
      clickedCount,
      totalClicks,
      checkoutInitiatedCount,
      convertedCount,
      openRate,
      clickThroughRate,
      clickToOpenRate,
      conversionRate,
      convertedRevenueUsd,
      pipelineRevenueUsd,
      totalDiscountSavingsUsd
    };
  }, [records]);

  // Compute Plan Tier performance breakdown
  const planTierStats = useMemo(() => {
    const tiers = [
      { id: 'basic-business-plan', name: 'Basic Business Plan', offerRate: '$990/yr (10% OFF)' },
      { id: 'premium-partner-plan', name: 'Premium Partner Plan', offerRate: '$1,890/yr (10% OFF)' },
      { id: 'vip-business-plan', name: 'VIP Business Plan', offerRate: '$5,490/yr (10% OFF)' }
    ];

    return tiers.map((tier) => {
      const subset = records.filter((r) => r.planId === tier.id);
      const sent = subset.length;
      const opened = subset.filter((r) => r.opened).length;
      const clicked = subset.filter((r) => r.clicked).length;
      const converted = subset.filter((r) => r.conversionStatus === 'CONVERTED').length;
      const revenue = subset
        .filter((r) => r.conversionStatus === 'CONVERTED')
        .reduce((s, r) => s + r.renewalAmountUsd, 0);

      return {
        ...tier,
        sent,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        ctr: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
        conversionRate: sent > 0 ? Math.round((converted / sent) * 100) : 0,
        converted,
        revenue
      };
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesStatus = statusFilter === 'ALL' || rec.conversionStatus === statusFilter;
      const matchesPlan = planFilter === 'ALL' || rec.planId === planFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        rec.recipientName.toLowerCase().includes(q) ||
        rec.recipientEmail.toLowerCase().includes(q) ||
        rec.companyName.toLowerCase().includes(q) ||
        rec.planName.toLowerCase().includes(q) ||
        rec.address.toLowerCase().includes(q);
      return matchesStatus && matchesPlan && matchesQuery;
    });
  }, [records, statusFilter, planFilter, searchQuery]);

  const renderConversionBadge = (status: RenewalConversionStatus) => {
    switch (status) {
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Converted • Paid</span>
          </span>
        );
      case 'CHECKOUT_INITIATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
            <CreditCard className="w-3 h-3 text-amber-700" />
            <span>Checkout Initiated</span>
          </span>
        );
      case 'CLICKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-black uppercase tracking-wider">
            <MousePointerClick className="w-3 h-3 text-blue-600" />
            <span>CTA Clicked • Considering</span>
          </span>
        );
      case 'OPENED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-900 border border-violet-300 text-[10px] font-black uppercase tracking-wider">
            <Eye className="w-3 h-3 text-violet-600" />
            <span>Opened • Reviewing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-black uppercase tracking-wider">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Sent • Awaiting Open</span>
          </span>
        );
    }
  };

  return (
    <div id="renewal-insights-admin-section" className="space-y-6">
      {/* HEADER HERO BANNER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-black uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Renewal Offer Campaign Telemetry &amp; Attribution</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Renewal Insights: Open Rates, Click-Throughs &amp; Conversion Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitor real-time engagement across all dispatched <strong>Membership Renewal Offer</strong> emails — including email open rates, <strong>&ldquo;Renew Now&rdquo;</strong> CTA click-through rates (CTR), active payment checkouts, and completed subscription conversions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToHtmlEditor && (
              <button
                type="button"
                onClick={onNavigateToHtmlEditor}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Edit Renewal HTML Template</span>
              </button>
            )}
            {onNavigateToDispatcher && (
              <button
                type="button"
                onClick={onNavigateToDispatcher}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send New Renewal Offer</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => void fetchRenewalInsights()}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="text-[11px] font-black underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. OPEN RATE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Email Open Rate
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {metrics.openRate.toFixed(1)}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              <strong className="text-slate-900">{metrics.openedCount}</strong> of{' '}
              <strong className="text-slate-900">{metrics.deliveredCount}</strong> opened
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-bold text-[11px]">
              {metrics.totalOpens} total views
            </span>
          </div>
        </div>

        {/* 2. CLICK-THROUGH RATE (CTR) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Click-Through Rate (CTR)
              </span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {metrics.clickThroughRate.toFixed(1)}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              <strong className="text-slate-900">{metrics.clickedCount}</strong> clicked &ldquo;Renew Now&rdquo;
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
              CTOR: {metrics.clickToOpenRate.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 3. CONVERSION RATE & STATUS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Renewal Conversion Rate
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {metrics.conversionRate.toFixed(1)}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              <strong className="text-emerald-700">{metrics.convertedCount}</strong> Paid •{' '}
              <strong className="text-amber-700">
                {metrics.checkoutInitiatedCount - metrics.convertedCount}
              </strong>{' '}
              In Checkout
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
              {metrics.totalSent} Sent
            </span>
          </div>
        </div>

        {/* 4. RENEWAL REVENUE & PIPELINE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Converted Renewal Revenue
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ${metrics.convertedRevenueUsd.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              Open Pipeline: <strong className="text-slate-900">${metrics.pipelineRevenueUsd.toLocaleString()}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[11px]">
              Saved ${metrics.totalDiscountSavingsUsd.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* CONVERSION FUNNEL & PLAN PERFORMANCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: RENEWAL EMAIL CONVERSION FUNNEL */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Renewal Offer Attribution &amp; Conversion Funnel</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                End-to-end progression from automated email dispatch to completed renewal checkout.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
              100% Serialized SMTP Delivery
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                stage: '1. Renewal Offers Dispatched & Delivered',
                count: metrics.deliveredCount,
                pct: 100,
                barColor: 'bg-slate-800',
                badgeText: `${metrics.deliveredCount}/${metrics.totalSent} Delivered`
              },
              {
                stage: '2. Opened Renewal Email (Unique Opens)',
                count: metrics.openedCount,
                pct: metrics.openRate,
                barColor: 'bg-violet-600',
                badgeText: `${metrics.openRate.toFixed(1)}% Open Rate`
              },
              {
                stage: '3. Clicked "Renew Now" Offer Button (CTR)',
                count: metrics.clickedCount,
                pct: metrics.clickThroughRate,
                barColor: 'bg-blue-600',
                badgeText: `${metrics.clickThroughRate.toFixed(1)}% CTR`
              },
              {
                stage: '4. Initiated Renewal Payment Checkout',
                count: metrics.checkoutInitiatedCount,
                pct:
                  metrics.deliveredCount > 0
                    ? (metrics.checkoutInitiatedCount / metrics.deliveredCount) * 100
                    : 0,
                barColor: 'bg-amber-500',
                badgeText: `${metrics.checkoutInitiatedCount} Active / Paid`
              },
              {
                stage: '5. Converted • Membership Renewed & Paid',
                count: metrics.convertedCount,
                pct: metrics.conversionRate,
                barColor: 'bg-emerald-600',
                badgeText: `${metrics.conversionRate.toFixed(1)}% Converted`
              }
            ].map((step) => (
              <div key={step.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{step.count} recipients</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {step.badgeText}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${step.barColor}`}
                    style={{ width: `${Math.max(6, Math.min(100, step.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 5 COLS: PERFORMANCE BY SUBSCRIPTION PLAN TIER */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Performance by Subscription Plan Offer</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison of open rates, CTR, and renewal revenue across Basic, Premium, and VIP plans.
            </p>
          </div>

          <div className="space-y-3">
            {planTierStats.map((tier) => (
              <div
                key={tier.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-slate-900">{tier.name}</div>
                    <div className="text-[11px] text-emerald-700 font-bold">{tier.offerRate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      ${tier.revenue.toLocaleString()} USD
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {tier.converted}/{tier.sent} Converted ({tier.conversionRate}%)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Sent</span>
                    <span className="font-black text-slate-800">{tier.sent} emails</span>
                  </div>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Open Rate</span>
                    <span className="font-black text-violet-700">{tier.openRate}%</span>
                  </div>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">CTR</span>
                    <span className="font-black text-blue-700">{tier.ctr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SENT RENEWAL EMAILS TABLE WITH FILTERS & INTERACTIVE TRACKING */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Dispatched Renewal Offer Emails — Recipient Engagement &amp; Conversion Log</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredRecords.length} of {records.length} sent renewal offers. Track opens, CTA clicks, or trigger checkout directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, email, company..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by Conversion Status"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Conversion Statuses</option>
              <option value="CONVERTED">Converted • Paid</option>
              <option value="CHECKOUT_INITIATED">Checkout Initiated</option>
              <option value="CLICKED">CTA Clicked • Considering</option>
              <option value="OPENED">Opened • Reviewing</option>
              <option value="SENT">Sent • Awaiting Open</option>
            </select>

            {/* PLAN FILTER */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              aria-label="Filter by Plan Tier"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Subscription Plans</option>
              <option value="basic-business-plan">Basic Business Plan ($990)</option>
              <option value="premium-partner-plan">Premium Partner Plan ($1,890)</option>
              <option value="vip-business-plan">VIP Business Plan ($5,490)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Client &amp; Corporate Entity</th>
                <th className="py-3.5 px-4">Plan &amp; Renewal Offer</th>
                <th className="py-3.5 px-4">Open Tracking</th>
                <th className="py-3.5 px-4">Click-Through (CTR)</th>
                <th className="py-3.5 px-4">Conversion Status</th>
                <th className="py-3.5 px-4 text-right">Actions &amp; Checkout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* CLIENT & COMPANY */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-black text-slate-900">{rec.recipientName}</div>
                    <div className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{rec.companyName}</span>
                    </div>
                    <div className="font-mono text-[11px] text-blue-600 font-semibold mt-0.5">
                      {rec.recipientEmail}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rec.address}</div>
                    {rec.adminCopySent && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                        ✓ Admin Copy Sent ({rec.adminCopyEmail || 'yr943334@gmail.com'})
                      </span>
                    )}
                  </td>

                  {/* PLAN & OFFER */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-black text-slate-900">{rec.planName}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="line-through text-slate-400 text-[11px]">
                        ${rec.standardAmountUsd.toLocaleString()}/yr
                      </span>
                      <span className="font-black text-emerald-700 text-sm">
                        ${rec.renewalAmountUsd.toLocaleString()} USD/yr
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[10px]">
                        {rec.discountLabel}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Method: <strong className="text-slate-700">💳 {rec.paymentMethod}</strong> • Code:{' '}
                      <code className="font-mono font-bold text-amber-800">{rec.promoCode}</code>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Sent: {new Date(rec.sentAt).toLocaleString()}
                    </div>
                  </td>

                  {/* OPEN TRACKING */}
                  <td className="py-4 px-4 align-top">
                    {rec.opened ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 border border-violet-200 font-bold text-[11px]">
                          <Eye className="w-3 h-3 text-violet-600" />
                          <span>Opened ({rec.openCount}x)</span>
                        </span>
                        {rec.lastOpenedAt && (
                          <div className="text-[10px] text-slate-400">
                            Last: {new Date(rec.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold text-[11px]">
                        Not Opened Yet
                      </span>
                    )}
                  </td>

                  {/* CLICK-THROUGH TRACKING */}
                  <td className="py-4 px-4 align-top">
                    {rec.clicked ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px]">
                          <MousePointerClick className="w-3 h-3 text-blue-600" />
                          <span>Clicked CTA ({rec.clickCount}x)</span>
                        </span>
                        {rec.lastClickedAt && (
                          <div className="text-[10px] text-slate-400">
                            Last: {new Date(rec.lastClickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold text-[11px]">
                        0 Clicks
                      </span>
                    )}
                  </td>

                  {/* CONVERSION STATUS */}
                  <td className="py-4 px-4 align-top">
                    <div className="space-y-1">
                      {renderConversionBadge(rec.conversionStatus)}
                      {rec.orderId && (
                        <div className="font-mono text-[10px] text-emerald-700 font-bold">
                          Ref: {rec.orderId}
                        </div>
                      )}
                      {rec.convertedAt && (
                        <div className="text-[10px] text-slate-400">
                          Paid: {new Date(rec.convertedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-4 align-top text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {rec.conversionStatus !== 'CONVERTED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenCheckoutForRecord(rec)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                            title="Open Renewal Payment Checkout pre-filled for this client"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Renew Checkout</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleTrackEvent(rec.id, 'CONVERT')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold cursor-pointer transition-all"
                            title="Mark renewal offer as Converted (Paid)"
                          >
                            Mark Paid
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleTrackEvent(rec.id, 'OPEN')}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-all"
                        title="Simulate / log email open event"
                      >
                        +Open
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleTrackEvent(rec.id, 'CLICK')}
                        className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold cursor-pointer transition-all"
                        title="Simulate / log 'Renew Now' button click"
                      >
                        +Click
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                    No sent renewal offer emails match your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalInsightsAdminModule;
