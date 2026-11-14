import React, { useEffect, useState } from 'react';
import {
  X,
  Crown,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Globe2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Currency, PaymentCheckoutData, RfqRequirement } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { INITIAL_SAAS_PLANS } from '../../data/planPricingMockData';
import { SaaSPlan } from '../../types/planPricingTypes';
import { planPricingService } from '../../services/planPricingService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rfq?: RfqRequirement | null;
  selectedCurrency?: Currency;
  onSelectPlanCheckout: (checkoutData: PaymentCheckoutData) => void;
  onViewAllPlans?: () => void;
}

export const MembershipUpgradeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  rfq = null,
  selectedCurrency = 'USD',
  onSelectPlanCheckout,
  onViewAllPlans
}) => {
  const [plans, setPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);
  const [billingCycle, setBillingCycle] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    planPricingService
      .getPlans('ACTIVE')
      .then(res => {
        if (active && Array.isArray(res?.plans) && res.plans.length > 0) {
          setPlans(res.plans);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const curr =
    (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) ||
    CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatMoney = (usd?: number) => {
    if (!usd) return '$0';
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const supplierPlans = plans
    .filter(p => p.category === 'SUPPLIER_MEMBERSHIP' && p.status === 'ACTIVE')
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  const basicPlan =
    supplierPlans.find(p => p.slug === 'basic-business-plan' || p.id === 'plan-basic-business') ||
    supplierPlans[0] ||
    INITIAL_SAAS_PLANS[0];

  const premiumPlan =
    supplierPlans.find(p => p.slug === 'establishment-plan' || p.id === 'plan-premium-partner') ||
    supplierPlans[1] ||
    INITIAL_SAAS_PLANS[1];

  const vipPlan =
    supplierPlans.find(p => p.slug === 'vip-business-plan' || p.id === 'plan-vip-business') ||
    supplierPlans[2] ||
    INITIAL_SAAS_PLANS[2];

  const handleChoosePlan = (plan: SaaSPlan, label: string) => {
    const amountUsd =
      billingCycle === 'MONTHLY'
        ? plan.monthlyPriceUsd || Math.round((plan.annualPriceUsd || 1100) / 10)
        : plan.annualPriceUsd || 1100;

    onClose();
    onSelectPlanCheckout({
      planId: plan.slug || plan.id,
      title: `${label} (${billingCycle === 'MONTHLY' ? 'Monthly' : 'Annual'})`,
      description: `${plan.name} — Instant Buyer Contact Unlock (Name, Company, Email, WhatsApp/Phone & Full Address)${
        rfq ? ` • Unlocking "${rfq.productName}"` : ''
      }`,
      amountUsd,
      type: 'MEMBERSHIP',
      supplierCompany: 'Trade Heaven Seller Membership'
    });
  };

  const orderValueUsd =
    rfq?.estimatedOrderValueUsd ||
    (rfq?.targetPriceUsd && rfq?.targetQuantity ? rfq.targetPriceUsd * rfq.targetQuantity : 0);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-upgrade-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full my-auto border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-5 sm:p-7 text-white border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close upgrade modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-2.5 pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Trade Heaven Seller Membership Plans</span>
            </div>
            <h2 id="membership-upgrade-modal-title" className="text-xl sm:text-2xl font-black tracking-tight">
              Unlock Verified Buyer Contact Details &amp; Send Direct Quotes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upgrade to a Basic or Premium Seller plan to unblur buyer names, importing company names, direct business emails, WhatsApp/phone numbers, and full delivery addresses across all global RFQs.
            </p>
          </div>

          {rfq && (
            <div className="mt-4 p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span>Unlocking Direct Buyer Contact For:</span>
                </div>
                <div className="text-sm font-black text-white truncate">{rfq.productName}</div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>{rfq.destinationPort || rfq.buyerCountry}</span>
                  <span>•</span>
                  <span>
                    Qty: {rfq.targetQuantity?.toLocaleString()} {rfq.quantityUnit}
                  </span>
                  {rfq.preferredIncoterm && (
                    <>
                      <span>•</span>
                      <span>{rfq.preferredIncoterm}</span>
                    </>
                  )}
                </div>
              </div>
              {orderValueUsd > 0 && (
                <div className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-right">
                  <div className="text-[10px] text-emerald-200 uppercase font-bold">Est. Order Value</div>
                  <div className="text-sm font-black font-mono text-emerald-300">
                    {formatMoney(orderValueUsd)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto bg-slate-50/70">
          {/* Billing Toggle + What Gets Unlocked */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-600 font-semibold">
              <span className="inline-flex items-center gap-1 text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Company Name
              </span>
              <span className="inline-flex items-center gap-1 text-slate-800">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Direct Email
              </span>
              <span className="inline-flex items-center gap-1 text-slate-800">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp / Phone
              </span>
              <span className="inline-flex items-center gap-1 text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Full Address
              </span>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual (Save 16%)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Basic Seller vs Premium Seller Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BASIC SELLER PLAN */}
            <div className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                      Basic Seller Plan
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{basicPlan.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {basicPlan.description || 'Starter exporter package with verified buyer contact unlocks.'}
                    </p>
                  </div>
                </div>

                <div className="pb-4 border-b border-slate-100 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {formatMoney(
                      billingCycle === 'MONTHLY' ? basicPlan.monthlyPriceUsd : basicPlan.annualPriceUsd
                    )}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    /{billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Unblur Buyer Contacts:</strong> View Buyer Name, Company, Direct Email, WhatsApp &amp; Address
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Up to 20 Verified &amp; Genuine Buyer RFQs / Month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Dedicated Supplier Catalogue (Up to 50 Product Listings)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Instant &ldquo;Send Quote&rdquo; &amp; &ldquo;WhatsApp Buyer&rdquo; Direct Access</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleChoosePlan(basicPlan, 'Basic Seller Plan')}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
              >
                <Zap className="w-4 h-4" />
                <span>Upgrade to Basic Seller</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* PREMIUM SELLER PLAN */}
            <div className="bg-slate-950 text-white border-2 border-amber-400 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>Premium Seller Plan</span>
                    </span>
                    <h3 className="text-lg font-black text-white mt-2">{premiumPlan.name}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {premiumPlan.description || 'Full global market intelligence, priority quoting & unlimited buyer reveals.'}
                    </p>
                  </div>
                </div>

                <div className="pb-4 border-b border-slate-800 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-300 font-mono">
                    {formatMoney(
                      billingCycle === 'MONTHLY' ? premiumPlan.monthlyPriceUsd : premiumPlan.annualPriceUsd
                    )}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    /{billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Unlimited Buyer Contact Unlocks</strong> across all Verified &amp; Market-Synced RFQs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>40+ Verified International Orders / Month + Advance LC/TT Tenders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Priority Supplier Quote Placement &amp; Verified Exporter Seal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Dedicated International Export Manager &amp; 24/7 Trade Desk</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => handleChoosePlan(premiumPlan, 'Premium Seller Plan')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>Upgrade to Premium Seller</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {vipPlan && (
                  <button
                    type="button"
                    onClick={() => handleChoosePlan(vipPlan, vipPlan.name)}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-200 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Or Select {vipPlan.name} ({formatMoney(billingCycle === 'MONTHLY' ? vipPlan.monthlyPriceUsd : vipPlan.annualPriceUsd)}/{billingCycle === 'MONTHLY' ? 'mo' : 'yr'})
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 flex-wrap text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant activation upon checkout • Protected by Trade Heaven Verification</span>
            </div>
            {onViewAllPlans && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewAllPlans();
                }}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Compare Full Membership Directory</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipUpgradeModal;
