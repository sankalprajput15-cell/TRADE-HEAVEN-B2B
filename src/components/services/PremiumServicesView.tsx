import React, { useState, useEffect } from 'react';
import { Currency, PaymentCheckoutData } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { planPricingService } from '../../services/planPricingService';
import { SaaSPlan } from '../../types/planPricingTypes';
import { INITIAL_SAAS_PLANS } from '../../data/planPricingMockData';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';
import { 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  ShoppingBag, 
  Factory, 
  BadgeCheck,
  ArrowRight,
  RefreshCw,
  Sliders,
  Mail,
  MessageSquare,
  PhoneCall,
  CreditCard,
  Link,
  Send,
  Check,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const BUYER_TESTIMONIALS = [
  {
    id: 1,
    quote: "The Advance Buyer Plan transformed our sourcing. We cut out the middlemen and got direct access to top-tier factories. Saved us $2M in procurement costs last year.",
    author: "Sarah Jenkins",
    role: "Head of Global Sourcing",
    company: "TechTronics Inc.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 2,
    quote: "Having a dedicated personal sourcing agent has been a game-changer. The priority RFQ matching got us quotes in 12 hours instead of 5 days.",
    author: "Marcus Chen",
    role: "Procurement Director",
    company: "Global Retail Partners",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 3,
    quote: "Live video stream factory inspections gave us the confidence to place a $500k order without flying a team to Asia. The ROI on this membership is undeniable.",
    author: "Elena Rostova",
    role: "Chief Supply Chain Officer",
    company: "Vostok Sourcing",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150"
  }
];

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
  const [plans, setPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);
  const [isLoading, setIsLoading] = useState(true);

  // Support request form states
  const [supportName, setSupportName] = useState('');
  const [supportCompany, setSupportCompany] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportType, setSupportType] = useState('Payment Link Request');
  const [customAmount, setCustomAmount] = useState(4100);
  const [supportNotes, setSupportNotes] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'BUYER') {
      interval = setInterval(() => {
        setTestimonialIndex((prev) => (prev + 1) % BUYER_TESTIMONIALS.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

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
    onOpenPaymentCheckout({
      planId: plan.slug || plan.id,
      title: plan.name,
      description: plan.description || `${plan.name} membership plan`,
      amountUsd: plan.annualPriceUsd,
      type: 'MEMBERSHIP'
    });
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail) return;
    setIsSubmittingSupport(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSupportSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSupport(false);
    }
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
        <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <TradeHeavenDataLoader 
            message="Fetching membership plans..." 
            subMessage="Synchronizing live tier pricing, features, and token quotas..."
          />
        </div>
      ) : displayedCategoryPlans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300">
          <p className="text-sm font-bold text-slate-700 mb-1">No active plans found for this category.</p>
          <p className="text-xs text-slate-500">Go to Admin Management to create or activate membership tiers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {displayedCategoryPlans.map(plan => {
            
            const price = plan.annualPriceUsd;
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
                      <span className="text-xs font-normal text-slate-400">/ year</span>
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
                      <span className="text-xs font-normal text-slate-500">/ year</span>
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
                    <span className="text-xs font-normal text-slate-500">/ year</span>
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

      {/* SUPPLIER COMPARISON TABLE */}
      {activeTab === 'SUPPLIER' && (
        <div className="mt-16 mb-8 animate-in fade-in duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Compare Supplier Export Plans</h2>
            <p className="text-sm text-slate-600 mt-2">See how an upgraded membership boosts your global visibility.</p>
          </div>
          
          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 sm:p-6 text-sm font-black text-slate-900 w-1/4">Feature Capability</th>
                  <th className="p-4 sm:p-6 text-sm font-black text-emerald-700 w-1/4 text-center border-l border-emerald-100 bg-emerald-50/50">Basic Business ($1100/yr)</th>
                  <th className="p-4 sm:p-6 text-sm font-black text-blue-700 w-1/4 text-center border-l border-blue-100 bg-blue-50/50">Premium Partner ($2100/yr)</th>
                  <th className="p-4 sm:p-6 text-sm font-black text-amber-700 w-1/4 text-center border-l border-amber-100 bg-amber-50/50">VIP Business ($4100/yr)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Verified Exporter Badge</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-emerald-900 border-l border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Included</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-blue-600" />
                      <span>Verified Gold</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-amber-900 border-l border-amber-100 bg-amber-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span>VIP Elite Status</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Global Directory Ranking</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-emerald-900 border-l border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Priority Ranking</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span>High Priority</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-amber-900 border-l border-amber-100 bg-amber-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Top Tier Priority</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Product Listings</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-emerald-900 border-l border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Up to 50</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Up to 150</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-amber-900 border-l border-amber-100 bg-amber-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Unlimited</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Buy Lead Credits</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-emerald-900 border-l border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>20 / month</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>50 / month</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-amber-900 border-l border-amber-100 bg-amber-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Unlimited</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Dedicated Account Manager</td>
                  <td className="p-4 sm:p-6 text-center text-slate-400 border-l border-emerald-100 bg-emerald-50/50">—</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Priority Support</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-center font-bold text-amber-900 border-l border-amber-100 bg-amber-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Yes (Personal Sourcing Agent)</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BUYER COMPARISON TABLE */}
      {activeTab === 'BUYER' && (
        <div className="mt-16 mb-8 animate-in fade-in duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Compare Buyer Access Levels</h2>
            <p className="text-sm text-slate-600 mt-2">See why top procurement teams choose the Advance Buyer Plan.</p>
          </div>
          
          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 sm:p-6 text-sm font-black text-slate-900 w-1/3">Feature Capability</th>
                  <th className="p-4 sm:p-6 text-sm font-black text-slate-500 w-1/3 text-center border-l border-slate-200">Standard Access (Free)</th>
                  <th className="p-4 sm:p-6 text-sm font-black text-blue-700 w-1/3 text-center border-l border-blue-100 bg-blue-50/50">Advance Buyer Plan ($4100/yr)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Factory Direct Contacts</td>
                  <td className="p-4 sm:p-6 text-center text-slate-500 border-l border-slate-200">Masked / Limited Views</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Unlimited Unmasked Access</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Priority RFQ Matching</td>
                  <td className="p-4 sm:p-6 text-center text-slate-500 border-l border-slate-200">Standard Queue</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Priority Broadcast to Top Tier</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Dedicated Account Manager</td>
                  <td className="p-4 sm:p-6 text-center text-slate-400 border-l border-slate-200">—</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Yes (Personal Sourcing Agent)</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Factory Audits & Inspections</td>
                  <td className="p-4 sm:p-6 text-center text-slate-500 border-l border-slate-200">Paid Add-on</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Full Access (Live Video Stream)</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-6 font-bold text-slate-700">Verified Importer Trust Badge</td>
                  <td className="p-4 sm:p-6 text-center text-slate-400 border-l border-slate-200">—</td>
                  <td className="p-4 sm:p-6 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/50 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Included (Highest Trust)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TESTIMONIAL CAROUSEL */}
          <div className="mt-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Quote className="w-32 h-32 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold text-sm tracking-wide uppercase">Enterprise Buyer Success Stories</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTestimonialIndex(prev => prev === 0 ? BUYER_TESTIMONIALS.length - 1 : prev - 1)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setTestimonialIndex(prev => (prev + 1) % BUYER_TESTIMONIALS.length)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div key={testimonialIndex} className="min-h-[180px] flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-8">
                  "{BUYER_TESTIMONIALS[testimonialIndex].quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={BUYER_TESTIMONIALS[testimonialIndex].image} 
                    alt={BUYER_TESTIMONIALS[testimonialIndex].author}
                    className="w-14 h-14 rounded-full border-2 border-white/20 object-cover"
                  />
                  <div>
                    <h4 className="text-white font-bold text-base">{BUYER_TESTIMONIALS[testimonialIndex].author}</h4>
                    <p className="text-blue-200 text-xs sm:text-sm">{BUYER_TESTIMONIALS[testimonialIndex].role}, {BUYER_TESTIMONIALS[testimonialIndex].company}</p>
                  </div>
                </div>
              </div>
              
              {/* Carousel Dots */}
              <div className="flex items-center gap-2 mt-8">
                {BUYER_TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestimonialIndex(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === testimonialIndex ? 'bg-amber-400 w-8' : 'bg-white/20 hover:bg-white/40 w-2.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT LINK & CUSTOMIZED AMOUNT SUPPORT PORTAL */}
      <div id="card-payment-support-portal" className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 space-y-8 mt-12 text-slate-900">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black tracking-wide border border-indigo-200">
            <Link className="w-3.5 h-3.5 text-indigo-600" />
            <span>CUSTOM SETTLEMENTS &amp; ENTERPRISE SUPPORT</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
            Customized Pricing &amp; Request Payment Link
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Need customized token thresholds, corporate API volume discounts, customized duration options, or looking to request an encrypted payment link or invoice? Fill out the details below, or initiate an instant chat with our senior treasury team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Direct Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Direct Global Sourcing Desks
              </h3>
              
              {/* WhatsApp Support Card */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Official WhatsApp</h4>
                      <p className="text-[10px] text-emerald-700 font-bold">Average response: 3 mins</p>
                    </div>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                
                <div className="text-[13px] font-bold text-slate-800 font-mono">
                  +91 85329 34479
                </div>

                <a
                  href="https://wa.me/918532934479?text=Hello%20Trade%20Heaven%20Treasury,%20I%20would%20like%20to%20inquire%20about%20Customized%20Pricing%20and%20Payment%20Link%20options."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Email Support Card */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Treasury Email Support</h4>
                    <p className="text-[10px] text-blue-700 font-bold">Official Proforma requests</p>
                  </div>
                </div>

                <div className="text-[13px] font-bold text-slate-800 font-mono">
                  support@tradeheaven.net
                </div>

                <a
                  href="mailto:support@tradeheaven.net?subject=Inquiry%20-%20Custom%20Pricing%20and%20Payment%20Link%20Trade%20Heaven&body=Hello%20Treasury%20Operations,%0D%0A%0D%0AI%20would%20like%20to%20request%20information%20on%20Payment%20Link%20Generation%20or%20Custom%20Corporate%20Pricing."
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Request Proforma Link</span>
                </a>
              </div>

              {/* Secure Checkout Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>🔒 Treasury Payment Link Safeguard:</strong> Payment links are issued directly by Trade Heaven Treasury with 256-bit SSL encryption and trade protection guarantees.
              </div>
            </div>
          </div>

          {/* Column 2: Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                Draft Customized Plan &amp; Request Payment Link
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={supportName}
                    onChange={e => setSupportName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-950 font-medium bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={supportCompany}
                    onChange={e => setSupportCompany(e.target.value)}
                    placeholder="e.g. Vostok Sourcing Group"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-950 font-medium bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    placeholder="e.g. elena@vostoksourcing.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-950 font-medium bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    WhatsApp / Direct Phone
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={e => setSupportPhone(e.target.value)}
                    placeholder="e.g. +91 99201 88392"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-950 font-medium bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                  What can we help you with?
                </label>
                <select
                  value={supportType}
                  onChange={e => setSupportType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-950 font-medium"
                >
                  <option value="Payment Link Request">Customized Secure Payment Link Generation</option>
                  <option value="Customized Membership Price Request">Customized Corporate Membership Tier</option>
                  <option value="Custom Token/API Quota Request">Custom Token Quota / API Rate Limits</option>
                  <option value="Custom Sourcing Escrow Setup">Custom Sourcing Escrow Setup &amp; Contract Auditing</option>
                </select>
              </div>

              {/* Interactive Slider for Customized Amount */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Customized Plan Target Budget:</span>
                  <span className="font-mono text-indigo-600 font-black">
                    ${customAmount.toLocaleString()} USD / year
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="100"
                  value={customAmount}
                  onChange={e => setCustomAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$500</span>
                  <span>$5,000</span>
                  <span>$10,000</span>
                  <span>$15,000+</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                  Requirement Specifications or Special Requests
                </label>
                <textarea
                  rows={3}
                  value={supportNotes}
                  onChange={e => setSupportNotes(e.target.value)}
                  placeholder="Describe your customized requirements (e.g. customized target markets, number of licenses needed, preference for payment link delivery, target deployment timeline)..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-950 font-medium bg-white"
                />
              </div>

              {/* High-visibility Action Callout Card asking them to submit by mail */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3.5">
                <div className="flex gap-2.5 items-start">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-indigo-950">Confirm via Official Sourcing Mail</h4>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      To complete secure verification, please submit these customized requirements as a formal confirmation email directly to the Trade Heaven Treasury at <strong className="font-mono">support@tradeheaven.net</strong>.
                    </p>
                  </div>
                </div>

                <a
                  href={`mailto:support@tradeheaven.net?subject=${encodeURIComponent(
                    `Custom Pricing Confirmation - ${supportType} - ${supportCompany || supportName || 'Enterprise Client'}`
                  )}&body=${encodeURIComponent(
                    `Dear Trade Heaven Treasury Ops,\n\nI am submitting a confirmation for a custom pricing plan & payment link request:\n\n` +
                    `• Name: ${supportName || 'Client'}\n` +
                    `• Company: ${supportCompany || 'Not Specified'}\n` +
                    `• Corporate Email: ${supportEmail || 'Not Specified'}\n` +
                    `• Contact Phone/WhatsApp: ${supportPhone || 'Not Specified'}\n` +
                    `• Selected Request: ${supportType}\n` +
                    `• Target Plan Budget: $${customAmount.toLocaleString()} USD/year\n\n` +
                    `Requirement Specifications:\n${supportNotes || 'None'}\n\n` +
                    `Please generate the corresponding secure payment link and confirm our account upgrades.\n\n` +
                    `Best regards,\n${supportName || 'Trade Heaven Member'}`
                  )}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] duration-150"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Confirmation Email to Trade Heaven</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
