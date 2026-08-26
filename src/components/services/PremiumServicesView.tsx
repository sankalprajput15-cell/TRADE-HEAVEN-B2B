import React, { useState } from 'react';
import { Currency, PaymentCheckoutData } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { 
  Crown, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Globe2, 
  CreditCard, 
  ArrowRight,
  TrendingUp,
  Headphones,
  Building2,
  Lock,
  Layers,
  ShoppingBag,
  Factory,
  Search,
  FileCheck2,
  BadgeCheck
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenPaymentCheckout: (checkoutData: PaymentCheckoutData) => void;
}

export const PremiumServicesView: React.FC<Props> = ({
  selectedCurrency,
  onOpenPaymentCheckout
}) => {
  const [activeTab, setActiveTab] = useState<'SUPPLIER' | 'BUYER'>('SUPPLIER');
  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleSelectPackage = (item: {
    title: string;
    description: string;
    amountUsd: number;
    planCode: string;
  }) => {
    onOpenPaymentCheckout({
      planId: item.planCode,
      title: item.title,
      description: item.description,
      amountUsd: item.amountUsd,
      type: 'MEMBERSHIP'
    });
  };

  return (
    <div id="premium-services-view" className="space-y-8 sm:space-y-10">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-9 lg:p-12 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>International B2B Trade Acceleration Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Verified Memberships &amp; Sourcing Upgrades
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Equip your enterprise with verified KYC trust credentials, direct unmasked contact channels, algorithmic search priority, and dedicated trade managers.
          </p>

          {/* Role Mode Toggle Switch */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('SUPPLIER')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'SUPPLIER'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>For Suppliers &amp; Exporters</span>
            </button>
            <button
              onClick={() => setActiveTab('BUYER')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'BUYER'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>For Verified Buyers &amp; Importers</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUPPLIER MEMBERSHIP TIERS */}
      {activeTab === 'SUPPLIER' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Gold &amp; VIP Supplier Export Plans
              </h2>
              <p className="text-xs text-slate-600">
                Direct factory listing expansion, guaranteed RFQ matching, and global verified exporter seals.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Audited Factory Assurance</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Tier 1: Silver Supplier */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Tier</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Standard</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Silver Verified Exporter</h3>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {formatPrice(499)} <span className="text-xs font-normal text-slate-500">/ year</span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Essential verified supplier status for emerging exporters entering international commerce.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Silver Verification Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 50 Product Listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>20 Buy Lead Credits / month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard Escrow Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage({
                  title: 'Silver Verified Exporter (Annual)',
                  description: 'Essential verification badge, 50 product listings, 20 monthly buy leads.',
                  amountUsd: 499,
                  planCode: 'SILVER_ANNUAL'
                })}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                Upgrade to Silver
              </button>
            </div>

            {/* Tier 2: Gold Supplier (Most Popular) */}
            <div className="bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                Most Popular Exporter Choice
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Enterprise Growth</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">Gold Partner</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Gold Exporter</h3>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                  {formatPrice(1890)} <span className="text-xs font-normal text-slate-500">/ year</span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  High-visibility tier for established manufacturers seeking consistent high-volume import tenders.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-amber-200/60 text-xs text-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">Gold Certified Factory Audit Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Product Listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100 Buy Lead Inquiries / month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Top 3 Search Algorithm Placement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom Video Factory Tour Upload</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage({
                  title: 'Gold Certified Exporter (Annual)',
                  description: 'Top-tier search priority, unlimited listings, 100 buy leads/mo, verified factory badge.',
                  amountUsd: 1890,
                  planCode: 'GOLD_ANNUAL'
                })}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
              >
                Upgrade to Gold Exporter
              </button>
            </div>

            {/* Tier 3: VIP Supplier */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Strategic Tier</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black border border-blue-400/30">VIP Elite</span>
                </div>
                <h3 className="text-xl font-black text-white">VIP Global Exporter</h3>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {formatPrice(3990)} <span className="text-xs font-normal text-slate-400">/ year</span>
                </div>
                <p className="text-xs text-slate-300 font-normal">
                  Full enterprise international trade representation with dedicated human trade manager.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-amber-300">Dedicated IEM Trade Manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Direct Buy Lead Unlocks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>On-Site Factory Video Audit Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Guaranteed RFQ Tender Introductions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>$2,000,000 Escrow Capacity Vault</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage({
                  title: 'VIP Global Exporter + IEM (Annual)',
                  description: 'Dedicated trade manager, unlimited buy leads, on-site audit verification.',
                  amountUsd: 3990,
                  planCode: 'VIP_ANNUAL'
                })}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
              >
                Join VIP Elite Program
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* BUYER MEMBERSHIP TIERS */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Verified Corporate Buyer Sourcing Plans
              </h2>
              <p className="text-xs text-slate-600">
                Unlock direct factory export desk lines, verified KYC trust credentials, sample inspections, and dedicated procurement assistance.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span>Verified Importer Status</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Buyer Tier 1: Silver Verified Buyer */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Procurement</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Silver Buyer</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Silver Verified Buyer</h3>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {formatPrice(399)} <span className="text-xs font-normal text-slate-500">/ year</span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Verified corporate identity for importers looking to contact authenticated manufacturing plants.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Verified Corporate Buyer Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>50 Direct Factory Contact Unlocks / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Priority RFQ Placement &amp; Ticker Feature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Standard Escrow Buyer Protection ($250k)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage({
                  title: 'Silver Verified Buyer (Annual)',
                  description: 'Verified corporate badge, 50 factory unlocks/mo, priority RFQ broadcast.',
                  amountUsd: 399,
                  planCode: 'BUYER_SILVER_ANNUAL'
                })}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                Upgrade to Silver Buyer
              </button>
            </div>

            {/* Buyer Tier 2: Gold Enterprise Sourcing (Most Popular) */}
            <div className="bg-gradient-to-b from-blue-500/10 via-white to-white border-2 border-blue-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                Most Popular Buyer Choice
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Corporate Importer</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black">Gold Importer</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Gold Corporate Procurement</h3>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
                  {formatPrice(1490)} <span className="text-xs font-normal text-slate-500">/ year</span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Comprehensive sourcing tier for wholesale distributors, retail brands, and multi-container importers.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-blue-200/60 text-xs text-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold">Gold Verified Importer Seal &amp; D&amp;B Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Unlimited Direct Factory Unlocks &amp; WhatsApp Lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>0.5% Escrow Fee Discount on Container Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Guaranteed 24-Hour Factory Quote Turnaround</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Sample Pre-Shipment Audit Discounts (15%)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage({
                  title: 'Gold Corporate Procurement (Annual)',
                  description: 'Gold Importer seal, unlimited factory direct dials, 0.5% escrow discount, sample audit discounts.',
                  amountUsd: 1490,
                  planCode: 'BUYER_GOLD_ANNUAL'
                })}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md cursor-pointer"
              >
                Upgrade to Gold Importer
              </button>
            </div>

            {/* Buyer Tier 3: VIP Procurement Elite */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enterprise Sourcing</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-400/30">VIP Procurement</span>
                </div>
                <h3 className="text-xl font-black text-white">VIP Global Procurement Elite</h3>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {formatPrice(3490)} <span className="text-xs font-normal text-slate-400">/ year</span>
                </div>
                <p className="text-xs text-slate-300 font-normal">
                  Dedicated human sourcing desk with factory visits, contract negotiation, and end-to-end QC management.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-amber-300">Dedicated Human Sourcing Specialist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom On-Site Factory Audit &amp; Video Inspection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Direct Factory Desks across 12 Sectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>$2,000,000 Swiss Escrow Capacity Vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Landed Cost CIF/DDP Optimization &amp; Customs Assist</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage({
                  title: 'VIP Global Procurement Elite (Annual)',
                  description: 'Dedicated sourcing specialist, on-site factory audits, unlimited factory unlocks, $2M escrow capacity.',
                  amountUsd: 3490,
                  planCode: 'BUYER_VIP_ANNUAL'
                })}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md cursor-pointer"
              >
                Join VIP Procurement Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
