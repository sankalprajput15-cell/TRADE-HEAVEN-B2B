import React, { useState, useEffect } from 'react';
import { RfqRequirement, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { supabaseService } from '../../lib/supabaseClient';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  Radio, 
  Search, 
  Filter, 
  ShieldCheck, 
  Globe2, 
  PlusCircle, 
  Calendar, 
  Anchor, 
  Building2, 
  ArrowRight,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Crown,
  Lock,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onSelectRfq: (rfq: RfqRequirement) => void;
  onOpenCreateRfq: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
}

export const BuyLeadsView: React.FC<Props> = ({
  selectedCurrency,
  onSelectRfq,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [rfqs, setRfqs] = useState<RfqRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const loadLiveRfqs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRfqs(currentUser);
      if (data) {
        setRfqs(data);
      }
    } catch (err) {
      console.error('[BuyLeadsView error loading rfqs]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveRfqs();

    const unsubscribe = supabaseService.subscribeToInquiries(() => {
      loadLiveRfqs();
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const filtered = rfqs.filter(r => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = q === '' ||
      (r.productName || '').toLowerCase().includes(q) ||
      (r.buyerCompany || '').toLowerCase().includes(q) ||
      (r.buyerName || '').toLowerCase().includes(q) ||
      (r.detailedRequirements || r.detailedDescription || '').toLowerCase().includes(q) ||
      (r.destinationPort || '').toLowerCase().includes(q) ||
      (r.preferredIncoterm || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', ...Array.from(new Set(rfqs.map(r => r.category)))];

  const isUserPremium = currentUser?.role === 'ADMIN' || currentUser?.isPremium === true;

  return (
    <div id="buy-leads-view-root" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Live International Purchase Requests &amp; Sourcing Tenders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Global Buy Leads &amp; RFQ Tender Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
            Direct buyer procurement requirements from verified international importers. Paid enterprise members receive unmasked buyer phone/email contacts for direct communication.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Buy Requirement</span>
          </button>
        </div>
      </div>

      {/* Security & Access Clearance Notice */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 flex-wrap ${
        isUserPremium 
          ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex items-center gap-2.5">
          {isUserPremium ? (
            <Crown className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
          )}
          <span className="font-semibold">
            {isUserPremium 
              ? 'Premium Sourcing Clearance Active: All buyer corporate contact channels are unmasked in real time.'
              : 'Free Tier Clearance: Direct buyer corporate email and telephone contacts are securely masked.'}
          </span>
        </div>

        {!isUserPremium && onOpenUpgradeModal && (
          <button
            onClick={onOpenUpgradeModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Upgrade to Gold Supplier Plan</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, buyer company, or port..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadLiveRfqs}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Live RFQ Feed from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <div className="text-xs text-slate-500 font-mono">
            <strong>{filtered.length}</strong> Live Leads
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(rfq => (
          <div
            key={rfq.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {rfq.id}
                  </span>
                  <div className="text-xs text-slate-500 font-bold mt-1 truncate">{rfq.category}</div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                  {rfq.quotesCount} Factory Bids
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                {rfq.productName}
              </h3>

              {/* Volume & Destination Matrix */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Volume:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination Port:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">{rfq.destinationPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Incoterms / Target:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {rfq.preferredIncoterm} • {formatPrice(rfq.targetPriceUsd)}/unit
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                "{rfq.detailedDescription}"
              </p>

              {/* Buyer Contact Channel with Server-Side Gating */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-semibold text-slate-700">
                      {rfq.buyerCompany} ({rfq.buyerCountry})
                    </span>
                  </div>
                </div>

                {/* Gated Buyer Email & Phone */}
                <div className="pt-1">
                  <PremiumContactGate
                    currentUser={currentUser}
                    onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                    isMasked={Boolean(rfq.isContactMasked)}
                    resourceTitle="Buyer Direct Desk Contact"
                  >
                    <div className="space-y-1 text-xs text-slate-700">
                      <div><strong>Email:</strong> {rfq.buyerEmail || 'procurement@buyer.org'}</div>
                      <div><strong>Phone:</strong> {rfq.buyerPhone || '+1 (555) 902-8411'}</div>
                    </div>
                  </PremiumContactGate>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => onSelectRfq(rfq)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>Quote Tender</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${encodeURIComponent(`Hello TradeHeaven, I am quoting on Buy Lead: "${rfq.productName}" for ${rfq.buyerCompany} (Target: ${rfq.targetQuantity} ${rfq.quantityUnit} @ $${rfq.targetPriceUsd} ${rfq.preferredIncoterm}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm text-center"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
