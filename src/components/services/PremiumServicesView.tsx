import React, { useState, useEffect } from 'react';
import { Currency, PaymentCheckoutData } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { planPricingService } from '../../services/planPricingService';
import { SaaSPlan } from '../../types/planPricingTypes';
import { 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  ShoppingBag, 
  Factory, 
  BadgeCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenPaymentCheckout: (checkoutData: PaymentCheckoutData) => void;
  onNavigateToAdmin?: () => void;
}

export const PremiumServicesView: React.FC<Props> = ({
  selectedCurrency,
  onOpenPaymentCheckout,
  onNavigateToAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'SUPPLIER' | 'BUYER'>('SUPPLIER');
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await planPricingService.getPlans('ACTIVE');
      setPlans(res.plans || []);
    } catch (e) {
      console.error('Failed to load active plans:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleSelectPackage = (plan: SaaSPlan) => {
    const isAnn = billingCycle === 'ANNUAL';
    const amountUsd = isAnn ? plan.annualPriceUsd : plan.monthlyPriceUsd;
    const cycleSuffix = isAnn ? 'Annual' : 'Monthly';

    onOpenPaymentCheckout({
      planId: plan.slug || plan.id,
      title: `${plan.name} (${cycleSuffix})`,
      description: plan.description || `${plan.name} membership plan`,
      amountUsd,
      type: 'MEMBERSHIP'
    });
  };

  // Filter plans based on activeTab category
  const targetCategory = activeTab === 'SUPPLIER' ? 'SUPPLIER_MEMBERSHIP' : 'BUYER_MEMBERSHIP';
  const displayedCategoryPlans = plans
    .filter(p => p.category === targetCategory && p.status === 'ACTIVE')
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  return (
    <div id="premium-services-view" className="space-y-8 sm:space-y-10">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-9 lg:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>International B2B Trade Acceleration Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Verified Memberships &amp; Sourcing Upgrades
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Equip your enterprise with verified KYC trust credentials, direct unmasked contact channels, algorithmic search priority, and dedicated trade managers. Managed live through the Admin Plan Engine.
          </p>

          {/* Role Mode Toggle Switch & Billing Cycle Switch */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
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
                type="button"
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
      </div>

      {/* Section Header with live status & admin edit hint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>
              {activeTab === 'SUPPLIER' ? 'Gold & VIP Supplier Export Plans' : 'Verified Corporate Buyer Sourcing Plans'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
              Live Dynamic Catalog
            </span>
          </h2>
          <p className="text-xs text-slate-600">
            {activeTab === 'SUPPLIER'
              ? 'Direct factory listing expansion, guaranteed RFQ matching, and global verified exporter seals.'
              : 'Unlock direct factory export desk lines, verified KYC trust credentials, sample inspections, and dedicated procurement assistance.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SUPPLIER' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Audited Factory Assurance</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span>Verified Importer Status</span>
            </span>
          )}

          {onNavigateToAdmin && (
            <button
              type="button"
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Open Admin Plan Management Engine"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit in Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* PLANS GRID (Dynamically Rendered from Database / Service) */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading live membership plans from Admin Engine...</p>
        </div>
      ) : displayedCategoryPlans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300">
          <p className="text-sm font-bold text-slate-700 mb-1">No active plans found for this category.</p>
          <p className="text-xs text-slate-500">Go to Admin Management to create or activate membership tiers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {displayedCategoryPlans.map(plan => {
            const isAnn = billingCycle === 'ANNUAL';
            const price = isAnn ? plan.annualPriceUsd : plan.monthlyPriceUsd;
            const isHighlight = plan.isPopular;

            // Determine card theme styling
            const isVip = (plan.tierBadge || '').toUpperCase().includes('VIP') || (plan.name || '').toUpperCase().includes('VIP');

            if (isVip) {
              return (
                <div
                  key={plan.id}
                  className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6 relative"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                        {plan.targetAudience || 'Strategic Enterprise'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black border border-blue-400/30">
                        {plan.tierBadge || 'VIP ELITE'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">{plan.name}</h3>

                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      {formatPrice(price)}{' '}
                      <span className="text-xs font-normal text-slate-400">/ {isAnn ? 'year' : 'month'}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-200">
                      {(plan.featuresList && plan.featuresList.length > 0
                        ? plan.featuresList
                        : [
                            'Dedicated Human Account Manager',
                            'Unlimited Direct Buy Lead Unlocks',
                            'On-Site Factory Video Audit Verification',
                            'Guaranteed RFQ Introductions',
                            '$2,000,000 trade protection Vault Capacity'
                          ]
                      ).map((feat, fIdx) => {
                      const isHeader = feat.startsWith('**') && feat.endsWith('**');
                      const cleanText = isHeader ? feat.slice(2, -2) : feat;
                      if (isHeader) {
                        return (
                          <div key={fIdx} className="pt-3 pb-1">
                            <span className="font-bold text-[13px]">{cleanText}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{cleanText}</span>
                        </div>
                      );
                    })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(plan)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Get Started with Trade Heaven</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            if (isHighlight) {
              return (
                <div
                  key={plan.id}
                  className={`bg-gradient-to-b ${
                    activeTab === 'SUPPLIER'
                      ? 'from-amber-500/10 via-white to-white border-2 border-amber-400'
                      : 'from-blue-500/10 via-white to-white border-2 border-blue-500'
                  } rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6 relative`}
                >
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${
                      activeTab === 'SUPPLIER'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    } font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap`}
                  >
                    Most Popular Choice
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          activeTab === 'SUPPLIER' ? 'text-amber-800' : 'text-blue-800'
                        }`}
                      >
                        {plan.targetAudience || 'Growth Tier'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          activeTab === 'SUPPLIER'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {plan.tierBadge || 'GOLD PARTNER'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>

                    <div
                      className={`text-2xl sm:text-3xl font-black font-mono ${
                        activeTab === 'SUPPLIER' ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    >
                      {formatPrice(price)}{' '}
                      <span className="text-xs font-normal text-slate-500">/ {isAnn ? 'year' : 'month'}</span>
                    </div>

                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Features List */}
                    <div
                      className={`space-y-2.5 pt-4 border-t text-xs text-slate-800 ${
                        activeTab === 'SUPPLIER' ? 'border-amber-200/60' : 'border-blue-200/60'
                      }`}
                    >
                      {(plan.featuresList && plan.featuresList.length > 0
                        ? plan.featuresList
                        : [
                            'Certified Factory Audit Badge',
                            'Unlimited Product Listings',
                            '100 Buy Lead Inquiries / month',
                            'Top Search Placement Priority',
                            'Factory Video Tour Integration'
                          ]
                      ).map((feat, fIdx) => {
                      const isHeader = feat.startsWith('**') && feat.endsWith('**');
                      const cleanText = isHeader ? feat.slice(2, -2) : feat;
                      if (isHeader) {
                        return (
                          <div key={fIdx} className="pt-3 pb-1">
                            <span className="font-bold text-[13px]">{cleanText}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{cleanText}</span>
                        </div>
                      );
                    })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(plan)}
                    className={`w-full py-3.5 rounded-xl ${
                      activeTab === 'SUPPLIER'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                    } font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <span>Get Started with Trade Heaven</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            // Standard Tier
            return (
              <div
                key={plan.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {plan.targetAudience || 'Standard Tier'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {plan.tierBadge || 'STANDARD'}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>

                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {formatPrice(price)}{' '}
                    <span className="text-xs font-normal text-slate-500">/ {isAnn ? 'year' : 'month'}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                    {(plan.featuresList && plan.featuresList.length > 0
                      ? plan.featuresList
                      : [
                          'Standard Verified Exporter Badge',
                          'Up to 50 Product Listings',
                          '20 Buy Lead Credits / month',
                          'Standard Trade Protection'
                        ]
                    ).map((feat, fIdx) => {
                      const isHeader = feat.startsWith('**') && feat.endsWith('**');
                      const cleanText = isHeader ? feat.slice(2, -2) : feat;
                      if (isHeader) {
                        return (
                          <div key={fIdx} className="pt-3 pb-1">
                            <span className="font-bold text-[13px]">{cleanText}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{cleanText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPackage(plan)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Select {plan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
