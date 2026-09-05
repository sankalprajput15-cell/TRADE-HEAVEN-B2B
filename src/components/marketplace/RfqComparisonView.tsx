import React, { useState, useEffect, useRef } from 'react';
import { RfqRequirement, SupplierQuote, Currency, Incoterm, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { EmptyState } from '../EmptyState';
import { getFreshRfqDate } from '../../utils/rfqDateUtils';
import { 
  FileText, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Building, 
  Building2,
  Truck, 
  Layers, 
  ArrowRight, 
  PlusCircle, 
  Download, 
  Calendar,
  DollarSign,
  Radio,
  ExternalLink,
  MessageCircle,
  Clock,
  Send,
  Lock,
  Crown,
  Search,
  X
} from 'lucide-react';

interface Props {
  rfqs: RfqRequirement[];
  selectedRfqId: string | null;
  onSelectRfqId: (id: string) => void;
  selectedCurrency: Currency;
  onOpenCreateRfq: () => void;
  onAcceptQuote: (quote: SupplierQuote) => void;
  onOpenRfqModal?: (rfq: RfqRequirement) => void;
  onOpenBuyerProfile?: (buyerId: string) => void;
  onOpenNegotiation?: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  isLoading?: boolean;
}

export const RfqCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none" />
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-blue-100/70 rounded border border-blue-200/50 animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-4.5 w-4/5 bg-slate-200 rounded-md animate-pulse mt-1" />
        </div>
        <div className="h-5 w-14 rounded-full bg-emerald-100/70 border border-emerald-200/60 animate-pulse shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
        <div className="space-y-1">
          <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
        <div className="h-7 flex-1 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-7 flex-1 rounded-lg bg-blue-100/80 animate-pulse" />
      </div>
    </div>
  );
};

export const RfqDetailHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-4 w-32 bg-blue-100/80 rounded animate-pulse" />
            <div className="h-4 w-24 bg-emerald-100/80 rounded-full animate-pulse" />
            <div className="h-4 w-28 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="h-6 w-3/4 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-8 w-36 bg-slate-100 rounded-xl border border-slate-200/80 animate-pulse shrink-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
            <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-300/80 rounded animate-pulse" />
            <div className="h-2.5 w-14 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2">
        <div className="h-3.5 w-32 bg-slate-300 rounded animate-pulse" />
        <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-8 w-32 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-44 rounded-xl bg-blue-200/80 animate-pulse" />
      </div>
    </div>
  );
};

export const QuoteCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none" />
      <div className="space-y-3">
        {/* Supplier Top Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-12 bg-amber-100 rounded border border-amber-200 animate-pulse" />
              <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-4.5 w-3/4 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-20 rounded-full bg-blue-50 border border-blue-200 animate-pulse shrink-0" />
        </div>

        {/* Pricing Box */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-32 bg-slate-300 rounded animate-pulse" />
          <div className="h-3 w-28 bg-emerald-100 rounded animate-pulse mt-1" />
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
            <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-3.5 w-20 bg-slate-300 rounded animate-pulse" />
          </div>
          <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
            <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-3.5 w-20 bg-slate-300 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div className="h-8.5 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-8.5 rounded-xl bg-blue-200/80 animate-pulse" />
      </div>
    </div>
  );
};

export const RfqComparisonView: React.FC<Props> = ({
  rfqs,
  selectedRfqId,
  onSelectRfqId,
  selectedCurrency,
  onOpenCreateRfq,
  onAcceptQuote,
  onOpenRfqModal,
  onOpenBuyerProfile,
  onOpenNegotiation,
  currentUser = null,
  onOpenUpgradeModal,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRfqs = (rfqs || []).filter(r => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.id || '').toLowerCase().includes(q) ||
      (r.productName || '').toLowerCase().includes(q) ||
      (r.buyerCompany || '').toLowerCase().includes(q) ||
      (r.buyerName || '').toLowerCase().includes(q) ||
      (r.buyerCountry || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.destinationPort || '').toLowerCase().includes(q) ||
      (r.preferredIncoterm || '').toLowerCase().includes(q) ||
      (r.paymentTerms || '').toLowerCase().includes(q) ||
      (r.targetPriceUsd ? String(r.targetPriceUsd) : '').toLowerCase().includes(q) ||
      (r.detailedRequirements || r.detailedDescription || '').toLowerCase().includes(q)
    );
  });

  const activeRfq = (filteredRfqs || []).find(r => r.id === selectedRfqId) || (rfqs || []).find(r => r.id === selectedRfqId) || (filteredRfqs && filteredRfqs[0]) || (rfqs && rfqs[0]);
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const comparisonStudioRef = useRef<HTMLDivElement>(null);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const loadQuotesForActiveRfq = async () => {
    if (!activeRfq?.id) return;
    setIsLoadingQuotes(true);
    try {
      const data = await api.getQuotesForRfq(activeRfq.id);
      setQuotes(data || []);
    } catch (err) {
      console.error('Error loading quotes:', err);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  useEffect(() => {
    loadQuotesForActiveRfq();

    const handleQuoteSubmitted = () => {
      loadQuotesForActiveRfq();
    };
    window.addEventListener('tradeheaven_quote_submitted', handleQuoteSubmitted);
    return () => {
      window.removeEventListener('tradeheaven_quote_submitted', handleQuoteSubmitted);
    };
  }, [activeRfq?.id]);

  const handleSelectCard = (rfq: RfqRequirement) => {
    onSelectRfqId(rfq.id);
    if (window.innerWidth < 1024 && comparisonStudioRef.current) {
      comparisonStudioRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="rfq-comparison-hub" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Supplier Bid Evaluation &amp; Proforma Comparison Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            RFQ Sourcing Hub &amp; Quotation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
            Click any active sourcing tender below to inspect complete technical specifications, review verified factory bids, or submit a competitive quote directly to the buyer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New RFQ</span>
          </button>
          
          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Sourcing Desk WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Layout: RFQ Selector Left + Quotes Comparison Right or Loading Skeletons */}
      {isLoading ? (
        <div id="rfq-hub-loading-skeletons" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel Skeletons */}
          <div className="lg:col-span-4 space-y-3">
            <div className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
            <div className="flex items-center justify-between px-2">
              <div className="h-3 w-36 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map(i => (
                <RfqCardSkeleton key={`rfq-card-skeleton-${i}`} />
              ))}
            </div>
          </div>

          {/* Right Panel Skeletons */}
          <div className="lg:col-span-8 space-y-6">
            <RfqDetailHeaderSkeleton />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-36 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <QuoteCardSkeleton key={`quote-skeleton-${i}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : rfqs.length === 0 ? (
        <EmptyState
          type="rfqs"
          title="No Active Sourcing RFQs Found"
          description="There are currently no active RFQ tenders in the database. Post a custom sourcing requirement to invite factory bids."
          actionLabel="Post a Custom Sourcing RFQ"
          onAction={onOpenCreateRfq}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active RFQs List Left */}
          <div className="lg:col-span-4 space-y-3">
            {/* Search Bar for Live RFQs */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search RFQs by keyword, company, port, ID..."
                className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Sourcing Tenders ({filteredRfqs.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Select to View</span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredRfqs.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700">No matching RFQs found</p>
                  <p className="text-[11px] text-slate-500">Try searching for "EN590", "Jet A1", "Global Fuel Oil", "Rotterdam", or "0821".</p>
                </div>
              ) : (
                filteredRfqs.map(rfq => {
                const isSelected = rfq.id === activeRfq?.id;
                const quotesCount = rfq.quotesCount || (rfq.id === activeRfq?.id ? quotes.length : 2);

                return (
                  <div
                    key={rfq.id}
                    onClick={() => handleSelectCard(rfq)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {rfq.id}
                          </span>
                          <span className="text-[9px] text-blue-700 font-semibold flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            <Clock className="w-2.5 h-2.5 text-blue-500" />
                            <span>{getFreshRfqDate(rfq)}</span>
                          </span>
                          <span className="text-xs font-bold text-slate-500 truncate">{rfq.category}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {rfq.productName}
                        </h4>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        {quotesCount} Bids
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500">Volume Target:</span>
                        <div className="font-mono font-bold text-slate-900 text-[11px]">
                          {rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Destination:</span>
                        <div className="font-bold text-slate-800 text-[11px] truncate">
                          {rfq.destinationPort}
                        </div>
                      </div>
                    </div>

                    {/* Direct Action Buttons on Card */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenRfqModal) {
                            onOpenRfqModal(rfq);
                          } else {
                            handleSelectCard(rfq);
                          }
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span>Tender Dossier</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenRfqModal) {
                            onOpenRfqModal(rfq);
                          } else {
                            handleSelectCard(rfq);
                          }
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Quote Bid</span>
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Selected RFQ & Comparison Studio Right */}
          <div ref={comparisonStudioRef} className="lg:col-span-8 space-y-6">
            {activeRfq ? (
              <>
                {/* Selected RFQ Header Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Active RFQ Tender • {activeRfq.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {quotes.length} Verified Quotations
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Posted: {getFreshRfqDate(activeRfq)}</span>
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900">
                        {activeRfq.productName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border font-mono">
                        Target: <strong>{formatPrice(activeRfq.targetPriceUsd)}</strong> / {activeRfq.quantityUnit}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px]">Buyer Enterprise:</span>
                      <div className="font-bold text-slate-900 mt-0.5 truncate">{activeRfq.buyerCompany}</div>
                      <div className="text-[10px] text-slate-500">{activeRfq.buyerCountry}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px]">Shipping Term:</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">{activeRfq.preferredIncoterm}</div>
                      <div className="text-[10px] text-slate-500 truncate">{activeRfq.destinationPort}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px]">Payment Terms:</span>
                      <div className="font-semibold text-slate-900 mt-0.5 truncate">{activeRfq.paymentTerms}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px]">Target Delivery:</span>
                      <div className="font-mono font-bold text-emerald-700 mt-0.5">{activeRfq.targetDeliveryDate || '30 - 45 Days'}</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                    <strong>Specifications Note:</strong> {activeRfq.detailedRequirements || activeRfq.detailedDescription}
                  </div>

                  {/* Primary Action Bar for the Active RFQ */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2">
                      {onOpenBuyerProfile && (
                        <button
                          onClick={() => onOpenBuyerProfile(activeRfq.buyerId || 'buyer-001')}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Buyer Profile</span>
                        </button>
                      )}

                      {onOpenNegotiation && (
                        <button
                          onClick={onOpenNegotiation}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                          <span>Direct Trade Chat</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenRfqModal && (
                        <button
                          onClick={() => onOpenRfqModal(activeRfq)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Open Full Tender Dossier &amp; Bid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quotations Matrix Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Received Factory Quotations ({isLoadingQuotes ? '...' : quotes.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Evaluated by Unit FOB/CIF Rate &amp; Lead Time
                  </span>
                </div>

                {/* Quotes Cards Grid */}
                {isLoadingQuotes ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <QuoteCardSkeleton key={`quote-loading-skeleton-${i}`} />
                    ))}
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">No factory quotations registered yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Be the first verified factory to submit a quotation for this tender.
                    </p>
                    {onOpenRfqModal && (
                      <button
                        onClick={() => onOpenRfqModal(activeRfq)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Submit Factory Quote Now</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quotes.map(quote => (
                      <div
                        key={quote.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all space-y-4 shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Supplier Top Header */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  {quote.supplierTier}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{quote.supplierCountry}</span>
                              </div>
                              <div className="font-bold text-sm text-slate-900 truncate">
                                {quote.supplierName}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs text-slate-500 font-mono">Trust Score</div>
                              <div className="font-black text-emerald-600 text-sm font-mono">
                                {quote.supplierTrustScore || 95} / 100
                              </div>
                            </div>
                          </div>

                          {/* Financial Bid Details */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs text-slate-500">Quoted Unit Price:</span>
                              <span className="text-base font-black text-emerald-700 font-mono">
                                {formatPrice(quote.unitPriceUsd)} <span className="text-xs font-normal text-slate-500">({quote.incoterm || quote.offeredIncoterm})</span>
                              </span>
                            </div>
                            <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                              <span className="text-slate-500">Total Cargo Value:</span>
                              <span className="font-mono font-bold text-slate-900">
                                {formatPrice(quote.totalAmountUsd || quote.unitPriceUsd * activeRfq.targetQuantity)}
                              </span>
                            </div>
                          </div>

                          {/* Technical Breakdown */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                              <span>Dispatch Port:</span>
                              <strong className="text-slate-900">{quote.dispatchPort || quote.portOfLoading}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Production Lead Time:</span>
                              <strong className="text-slate-900">{quote.productionLeadTimeDays || quote.leadTimeDays} Days</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Estimated Transit:</span>
                              <strong className="text-slate-900">{quote.estimatedTransitDays || 20} Days ({quote.shippingMethod || 'Ocean Freight'})</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Payment Terms:</span>
                              <strong className="text-slate-900 text-right truncate max-w-[170px]">{quote.paymentTerms}</strong>
                            </div>
                          </div>

                          {/* Quotation Note */}
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-slate-600 italic">
                            "{quote.technicalNotes || quote.notes}"
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => onAcceptQuote(quote)}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Bid &amp; Generate Proforma Invoice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                Select an RFQ on the left to review incoming quotations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
