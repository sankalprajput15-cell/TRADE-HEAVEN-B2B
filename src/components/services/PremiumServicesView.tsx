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
  Layers
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenPaymentCheckout: (checkoutData: PaymentCheckoutData) => void;
}

export const PremiumServicesView: React.FC<Props> = ({
  selectedCurrency,
  onOpenPaymentCheckout
}) => {
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
    <div id="premium-services-view" className="space-y-10">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-9 lg:p-12 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Exporters &amp; Manufacturers Growth Acceleration Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Trade Heaven Gold &amp; VIP Supplier Memberships
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Gain verified factory status, top-tier search algorithm priority, unlimited direct buy-lead access, and dedicated International Export Manager (IEM) representation.
          </p>
        </div>
      </div>

      {/* Membership Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Tier 1: Silver (Standard) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Tier</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Standard</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Silver Verified</h3>
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
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
            Most Popular Choice
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

        {/* Tier 3: VIP Tier (Strategic Global) */}
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
  );
};
