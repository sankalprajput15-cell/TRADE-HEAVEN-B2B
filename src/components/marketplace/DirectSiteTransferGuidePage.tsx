import React, { useState, useMemo } from 'react';
import { AuthUser, ActiveView } from '../../types';
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  Building2,
  CheckCircle2,
  FileCheck2,
  Landmark,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Lock
} from 'lucide-react';

interface Props {
  currentUser: AuthUser | null;
  onNavigate: (view: ActiveView | string, options?: any) => void;
  onOpenStorefront?: (companyId: string) => void;
}

interface TraditionalComparisonItem {
  id: string;
  aspect: string;
  traditionalIssue: string;
  traditionalImpact: string;
  tradeHeavenSolution: string;
  clientBenefit: string;
}

const TRADITIONAL_VS_TRADEHEAVEN: TraditionalComparisonItem[] = [
  {
    id: 'counterparty-risk',
    aspect: '01. Protecting Buyers & Exporters from Unsecured Upfront Wires',
    traditionalIssue:
      'In traditional cross-border trade, buyers are often asked to wire 30%–100% upfront directly to an overseas bank account with no neutral coordinator to safeguard order fulfillment.',
    traditionalImpact: 'High exposure to shipping delays, specification mismatches, or tied-up working capital.',
    tradeHeavenSolution:
      'Trade Heaven acts as a trusted neutral mediator. Clients can transfer funds directly through the platform into a protected settlement flow, ensuring suppliers see proof of committed funds before production while buyers stay protected.',
    clientBenefit: 'Mutual trust for both first-time and repeat trade partners'
  },
  {
    id: 'settlement-speed',
    aspect: '02. Eliminating 3–7 Day SWIFT Delays & Intermediary Bank Deductions',
    traditionalIssue:
      'Every individual supplier invoice traditionally requires a separate international wire taking 3 to 7 business days, with 2–3 correspondent banks deducting $35–$85 per transfer along the way.',
    traditionalImpact: 'Delayed production starts, missed vessel bookings, and unpredictable net supplier receipts.',
    tradeHeavenSolution:
      'Clients top up their personal Trade Heaven wallet once—uploading their transfer screenshot on the portal for rapid verification and email confirmation—and can then allocate funds to verified suppliers on-site in seconds.',
    clientBenefit: 'Instant on-platform allocation & predictable net supplier payouts'
  },
  {
    id: 'quality-disputes',
    aspect: '03. Bridging the Shipment & Quality Verification Gap',
    traditionalIssue:
      'Bank Letters of Credit (L/C) involve heavy paperwork, high bank issuance fees, and weeks of document handling, making them impractical for fast-moving wholesale and mid-sized B2B orders.',
    traditionalImpact: 'Slow order turnaround and complex cross-border dispute resolution.',
    tradeHeavenSolution:
      'Clients can choose Direct On-Site Settlement for trusted repeat partners or Mediated Order Escrow, where Trade Heaven holds the funds safely and releases payment as soon as Bill of Lading (B/L) and inspection milestones are confirmed.',
    clientBenefit: 'Flexible protection tailored to your relationship with each supplier'
  },
  {
    id: 'financial-privacy',
    aspect: '04. Complete Financial Privacy & Streamlined Accounting',
    traditionalIssue:
      'Exchanging raw bank statements, remittance PDFs, and scattered email threads across multiple brokers creates reconciliation confusion and exposes sensitive company account details.',
    traditionalImpact: 'Manual bookkeeping overhead and lack of a single source of truth.',
    tradeHeavenSolution:
      'Every client accesses an isolated personal wallet showing only their own balance and transaction history. Portal screenshot verification and automated email receipts keep every transfer organized in one auditable ledger.',
    clientBenefit: 'Private personal balance view + automated email & ledger receipts'
  }
];

const GUIDE_PARTNERS = [
  {
    id: 'comp-melissa-mpcommodity',
    name: 'MP Commodity Brokers Australia Pty Ltd (Melissa Prezios)',
    country: 'Australia',
    category: 'Agricultural & Bulk Commodities'
  },
  {
    id: 'comp-shenzhen-solar',
    name: 'Shenzhen Lumina New Energy Tech Co., Ltd. (Chen Wei)',
    country: 'China',
    category: 'Solar & Industrial Electronics'
  },
  {
    id: 'comp-bharat-steel',
    name: 'Bharat Precision Forgings & Alloys Ltd. (Vikramaditya Singh)',
    country: 'India',
    category: 'Engineered Metals & Forgings'
  }
];

export const DirectSiteTransferGuidePage: React.FC<Props> = ({
  onNavigate,
  onOpenStorefront
}) => {
  const [selectedRoleGuide, setSelectedRoleGuide] = useState<'BUYER' | 'SUPPLIER'>('BUYER');
  const [simSupplierId, setSimSupplierId] = useState<string>('comp-melissa-mpcommodity');
  const [simMode, setSimMode] = useState<'DIRECT_SETTLEMENT' | 'ESCROW_HOLD'>('ESCROW_HOLD');
  const [simAmountInr, setSimAmountInr] = useState<string>('500000');

  const selectedPartner = useMemo(
    () => GUIDE_PARTNERS.find(s => s.id === simSupplierId) || GUIDE_PARTNERS[0],
    [simSupplierId]
  );

  const estimateResult = useMemo(() => {
    const amount = Math.max(0, parseFloat(simAmountInr) || 0);
    const feeRate = simMode === 'DIRECT_SETTLEMENT' ? 0.015 : 0.025;
    const mediationFee = Math.round(amount * feeRate);
    const netSupplierPayout = Math.max(0, amount - mediationFee);

    return {
      amount,
      mediationFee,
      netSupplierPayout,
      settlementSpeed:
        simMode === 'DIRECT_SETTLEMENT'
          ? 'Instant credit to supplier wallet'
          : 'Locked immediately · Released upon shipment confirmation',
      recommendedFor:
        simMode === 'DIRECT_SETTLEMENT'
          ? 'Repeat shipments, established supplier relationships, and final balance settlements.'
          : 'First-time supplier orders, custom manufacturing runs, and milestone-based cargo shipments.'
    };
  }, [simMode, simAmountInr]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Sticky Sub-Header Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-20">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate('HOMEPAGE')}
              className="hover:text-slate-900 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <button
              type="button"
              onClick={() => onNavigate('WALLET_TOPUP')}
              className="hover:text-slate-900 transition-colors font-medium cursor-pointer"
            >
              Wallet &amp; Settlement Portal
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">
              Direct-to-Site Fund Transfer &amp; Client Mediation Guide
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('WALLET_TOPUP')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Wallet Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Hero & Client Support Overview */}
      <section className="bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-medium text-emerald-400 tracking-wide">
                Trade Heaven Client Settlement &amp; Trade Mediation Guide
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15]">
                How Direct-to-Site Transfers &amp; Trade Heaven Mediation Simplify Global Trade
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Sending money across borders shouldn’t mean waiting a week for international bank wires or worrying about unverified shipments. Trade Heaven helps buyers and suppliers settle payments directly on the platform—combining a private personal wallet, screenshot-verified top-ups, and optional mediated escrow protection.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('WALLET_TOPUP')}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Go to Wallet Top-Up &amp; Supplier Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('MEDIATOR_ENGINE')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Explore 4-Stage Escrow Protection</span>
                </button>
              </div>
            </div>

            {/* Right Column: 4-Pillar Client Protection Summary */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <div className="text-xs text-emerald-400 font-medium">
                  How Trade Heaven Helps Every Transaction
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  4 Pillars of Mediated On-Site Settlement
                </h2>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>1. Private Personal Wallet Balance</span>
                    <span className="text-emerald-400 font-medium">100% Isolated</span>
                  </div>
                  <p className="text-slate-400">
                    Only you can view your personal account balance. Top up via bank transfer or instant payment gateway, upload your receipt screenshot, and receive email confirmation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>2. Direct or Escrow-Protected Transfers</span>
                    <span className="text-emerald-400 font-medium">Buyer &amp; Supplier Choice</span>
                  </div>
                  <p className="text-slate-400">
                    Send funds immediately to trusted partners or lock the order amount in Trade Heaven Escrow until shipping and quality inspection documents are verified.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>3. Smooth Bank Withdrawals for Suppliers</span>
                    <span className="text-emerald-400 font-medium">SWIFT / RTGS / IMPS</span>
                  </div>
                  <p className="text-slate-400">
                    Once funds are settled or released from escrow, suppliers can withdraw their balance directly to their verified business bank account with full remittance documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-14">
        {/* Section 2: How Trade Heaven Solves Traditional Trade Payment Issues */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-semibold text-blue-700">
              Solving Traditional Cross-Border Challenges
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How Trade Heaven Solves Traditional B2B Payment Bottlenecks
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In traditional international trade, buyers worry about paying upfront before seeing cargo, while suppliers worry about manufacturing goods without guaranteed payment. Here is how Trade Heaven’s mediated transfer system helps both sides trade with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRADITIONAL_VS_TRADEHEAVEN.map(item => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {item.aspect}
                  </h3>

                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                    <div className="text-xs font-bold text-rose-900">
                      Traditional Trade Challenge
                    </div>
                    <p className="text-xs text-rose-950/90 leading-relaxed">
                      {item.traditionalIssue}
                    </p>
                    <div className="text-[11px] font-medium text-rose-800 pt-1">
                      Common Friction: {item.traditionalImpact}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-900">
                      How Trade Heaven Helps
                    </div>
                    <p className="text-xs text-emerald-950/90 leading-relaxed">
                      {item.tradeHeavenSolution}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Key Advantage</span>
                  <span className="text-slate-800 font-semibold">{item.clientBenefit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Step-by-Step Client Guide (Buyers & Suppliers) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-semibold text-emerald-700">
                Step-by-Step Client Walkthrough
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                How to Use Direct-to-Site Transfers with Trade Heaven
              </h2>
              <p className="text-sm text-slate-600">
                Choose your role below for a clear, step-by-step guide on sending or receiving trade funds through Trade Heaven.
              </p>
            </div>

            {/* Interactive Role Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedRoleGuide('BUYER')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedRoleGuide === 'BUYER'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guide for Buyers (Sending Funds)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleGuide('SUPPLIER')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedRoleGuide === 'SUPPLIER'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guide for Suppliers (Receiving Funds)
              </button>
            </div>
          </div>

          {selectedRoleGuide === 'BUYER' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 01 · TOP UP PERSONAL WALLET
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add Funds &amp; Upload Payment Proof
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Open the <strong>Wallet Top-Up Portal</strong> to view your private account balance. Add funds via bank wire (SWIFT/NEFT) or instant gateway, upload your transfer screenshot on the portal, and receive an email confirmation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('WALLET_TOPUP')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Top-Up Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 02 · SELECT SUPPLIER &amp; INVOICE
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Choose Your Trade Partner
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Select your supplier directly from the <strong>Transfer Funds to Supplier</strong> panel or from their Storefront page, and enter your Purchase Order or Proforma Invoice reference number.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Browse Verified Suppliers</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 03 · PICK SETTLEMENT METHOD
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Direct Transfer or Escrow Hold
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose <strong>Direct On-Site Settlement</strong> for immediate credit to a trusted partner, or choose <strong>Mediated Order Escrow</strong> so Trade Heaven holds the funds safely while your order is produced and shipped.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('WALLET_TOPUP')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Start a Supplier Transfer</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 04 · VERIFY &amp; RELEASE
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Confirm Shipment &amp; Keep Receipts
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Once shipping documents (Bill of Lading, packing list, or inspection certificate) are verified, release the escrow funds with one click. Every transaction is recorded in your personal ledger.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('MEDIATOR_ENGINE')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View 4-Stage Escrow Flow</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 01 · SHARE PAYMENT DETAILS
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Provide Storefront or Invoice Link
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Share your company storefront or Proforma Invoice reference with your buyer so they can initiate a direct transfer or fund an escrow order directly on Trade Heaven.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('DASHBOARD')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Supplier Dashboard</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 02 · INSTANT FUNDING CONFIRMATION
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Begin Production with Confidence
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    As soon as the buyer locks funds in Trade Heaven Escrow or sends a direct settlement, you receive immediate notification—eliminating the 3–7 day wait for international bank wires to clear.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('MEDIATOR_ENGINE')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Check Active Escrow Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 03 · SUBMIT SHIPPING PROOF
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Bill of Lading &amp; Certificates
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    For escrow-backed orders, upload your Bill of Lading (`B/L`), commercial invoice, and quality inspection certificate so Trade Heaven and the buyer can release the locked payment into your available balance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('WALLET_TOPUP')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Personal Wallet Balance</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    STEP 04 · BANK PAYOUT WITHDRAWAL
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Transfer to Your Business Bank
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Withdraw your available wallet balance to your corporate bank account via SWIFT, RTGS, NEFT, or IMPS at any time with full settlement advice for your accounting team.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('MEDIATOR_ENGINE')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Request Bank Payout</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Interactive Trade Settlement & Escrow Estimator */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
                <span>Interactive Settlement &amp; Escrow Estimator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Plan Your Supplier Transfer &amp; Mediation Protection
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Estimate net supplier payouts, mediation protection coverage, and settlement timelines before initiating your transfer.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenStorefront && (
                <button
                  type="button"
                  onClick={() => onOpenStorefront(selectedPartner.id)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Selected Supplier Storefront</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Estimator Controls */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Select Verified Supplier Partner
                </label>
                <select
                  value={simSupplierId}
                  onChange={e => setSimSupplierId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {GUIDE_PARTNERS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country}) — {s.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Choose Settlement Protection Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSimMode('ESCROW_HOLD')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      simMode === 'ESCROW_HOLD'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mediated Order Escrow (2.5%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMode('DIRECT_SETTLEMENT')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      simMode === 'DIRECT_SETTLEMENT'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Instant Direct Settlement (1.5%)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. Enter Order / Invoice Amount (INR ₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={simAmountInr}
                  onChange={e => setSimAmountInr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Estimator Output */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        {simMode === 'ESCROW_HOLD'
                          ? 'MEDIATED ESCROW PROTECTION SUMMARY'
                          : 'DIRECT ON-SITE SETTLEMENT SUMMARY'}
                      </div>
                      <div className="text-[11px] text-emerald-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{estimateResult.settlementSpeed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emerald-200/80 text-xs">
                  <div>
                    <span className="text-[11px] text-emerald-800 block">Order Amount</span>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      ₹{estimateResult.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-800 block">
                      Mediation Fee ({simMode === 'DIRECT_SETTLEMENT' ? '1.5%' : '2.5%'})
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      ₹{estimateResult.mediationFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-800 block">Net Supplier Payout</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
                      ₹{estimateResult.netSupplierPayout.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-200/80 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">Best Suited For:</div>
                  <p className="text-slate-600 leading-relaxed">{estimateResult.recommendedFor}</p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('WALLET_TOPUP')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Wallet &amp; Transfer Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('MEDIATOR_ENGINE')}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-950 text-xs font-semibold cursor-pointer"
                  >
                    Open 4-Stage Escrow Desk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DirectSiteTransferGuidePage;
