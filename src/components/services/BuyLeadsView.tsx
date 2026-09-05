import React, { useState, useEffect, useMemo } from 'react';
import { RfqRequirement, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { EmptyState } from '../EmptyState';
import { 
  Radio, 
  Search, 
  Filter, 
  ShieldCheck, 
  Globe2, 
  PlusCircle, 
  Calendar, 
  Clock,
  Anchor, 
  Building2, 
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Crown,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  Zap,
  SlidersHorizontal,
  Tag,
  X
} from 'lucide-react';
import { getFreshRfqDate } from '../../utils/rfqDateUtils';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';

interface Props {
  selectedCurrency: Currency;
  onSelectRfq: (rfq: RfqRequirement) => void;
  onOpenCreateRfq: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
}

const QUICK_SEARCH_CHIPS = [
  'Automotive Diesel EN590',
  'A1 Jet Fuel',
  'Copper Ore',
  'Aluminium Billets',
  'Sulphur',
  'Acetic Acid',
  'CNC Machines',
  'Cement',
  'Bamboo Wood',
  'Raw Jute',
  'Elevator Parts',
  'Solar Inverter',
  'Lithium Battery'
];

export const BuyLeadsView: React.FC<Props> = ({
  selectedCurrency,
  onSelectRfq,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal
}) => {
  const ITEMS_PER_PAGE = 18;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'bids' | 'volume' | 'price-high' | 'price-low'>('newest');
  const [urgentOnly, setUrgentOnly] = useState(false);
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
      const data = await api.getRfqs(undefined, currentUser);
      if (data && Array.isArray(data)) {
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

    const handleRfqCreated = () => {
      loadLiveRfqs();
    };
    window.addEventListener('tradeheaven_rfq_created', handleRfqCreated);

    return () => {
      window.removeEventListener('tradeheaven_rfq_created', handleRfqCreated);
    };
  }, [currentUser]);

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: rfqs.length };
    rfqs.forEach(r => {
      if (r.category) {
        counts[r.category] = (counts[r.category] || 0) + 1;
      }
    });
    return counts;
  }, [rfqs]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rfqs.forEach(r => {
      if (r.category) set.add(r.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [rfqs]);

  // Robust multi-token filtering & sorting
  const filtered = useMemo(() => {
    let list = [...rfqs];

    const q = searchTerm.toLowerCase().trim();
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);
      list = list.filter(r => {
        const searchableText = [
          r.productName,
          r.category,
          r.detailedDescription,
          r.detailedRequirements,
          r.buyerCompany,
          r.buyerName,
          r.buyerCountry,
          r.destinationPort,
          r.preferredIncoterm,
          r.paymentTerms,
          r.urgency,
          r.targetQuantity ? `${r.targetQuantity} ${r.quantityUnit}` : '',
          r.targetPriceUsd ? `${r.targetPriceUsd} ${formatPrice(r.targetPriceUsd)}` : '',
          r.id
        ].filter(Boolean).join(' ').toLowerCase();

        return tokens.every(token => searchableText.includes(token));
      });
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(r => (r.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    if (urgentOnly) {
      list = list.filter(r => r.urgency === 'URGENT');
    }

    if (sortBy === 'bids') {
      list.sort((a, b) => (b.quotesCount || 0) - (a.quotesCount || 0));
    } else if (sortBy === 'volume') {
      list.sort((a, b) => (b.targetQuantity || 0) - (a.targetQuantity || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.targetPriceUsd || 0) - (a.targetPriceUsd || 0));
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => (a.targetPriceUsd || 0) - (b.targetPriceUsd || 0));
    } else {
      // Default: newest by ID / creation
      list.sort((a, b) => (b.postedDate || b.id || '').localeCompare(a.postedDate || a.id || ''));
    }

    return list;
  }, [rfqs, searchTerm, selectedCategory, urgentOnly, sortBy, curr]);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, urgentOnly, sortBy]);
  
  const isUserPremium = currentUser?.role === 'ADMIN' || currentUser?.isPremium === true;

  const handleClearFilters = () => {
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedCategory('ALL');
    setUrgentOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'ALL' || urgentOnly || sortBy !== 'newest';

  
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
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

      {/* Filter and Search Bar Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Tier 1: Search Input, Sorting, Urgent Toggle, and Refresh Feed */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
            <input
              id="buy-leads-search-input"
              type="text"
              placeholder="Search product name, specifications, material, destination port, or buyer country..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls Cluster: Sort, Urgency Toggle, Refresh Feed */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Sort Selector */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <span className="text-slate-400 mr-1 text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                aria-label="Sort RFQ leads"
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest">Latest RFQs</option>
                <option value="bids">Most Factory Bids</option>
                <option value="volume">Highest Target Volume</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>

            {/* Urgent Leads Filter Toggle */}
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                urgentOnly 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Urgent / Fast Procurement Only"
            >
              <Zap className={`w-3.5 h-3.5 ${urgentOnly ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
              <span>Urgent Tenders</span>
            </button>

            {/* Refresh Feed Button */}
            <button
              onClick={loadLiveRfqs}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh Live RFQ Feed from Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Category Filter Horizontal Scrolling Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span>Category:</span>
          </span>
          {categories.map(cat => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier 3: Quick Product Keyword Chips & Status Indicator */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-blue-500" />
              <span>Suggested searches:</span>
            </span>
            {QUICK_SEARCH_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => setSearchTerm(chip)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  searchTerm.toLowerCase() === chip.toLowerCase()
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer mr-1"
              >
                <X className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            )}
            <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-800 text-[11px] font-mono font-bold">
              <strong>{filtered.length}</strong> {filtered.length === 1 ? 'tender match' : 'tenders matching'}
            </div>
          </div>
        </div>
      </div>

      {/* Leads Grid / Empty State */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <TradeHeavenDataLoader 
            message="Fetching live procurement buy leads..." 
            subMessage="Connecting to verified international importer tenders and global buyer RFQs..."
            size="lg"
          />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="rfqs"
          title="No Active Buying Leads Found"
          description={hasActiveFilters ? `No live buyer inquiries match "${searchTerm || selectedCategory}". Try clearing your search parameters or selecting "All Categories".` : "There are currently no active buying leads in the database. Be the first to post an RFQ and receive competitive factory quotes."}
          actionLabel="Clear All Search Filters"
          onAction={handleClearFilters}
        />
      ) : (
                <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentItems.map(rfq => (
            <div
              key={rfq.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 inline-block max-w-full truncate">
                        {rfq.id}
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-200/80">
                        <Clock className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                        <span>{getFreshRfqDate(rfq)}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold mt-1 truncate">{rfq.category}</div>
                  </div>

                  <div className="flex flex-wrap justify-end items-center gap-1.5 shrink-0 ml-1">
                    {rfq.urgency === 'URGENT' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 shrink-0 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                        <span>Urgent</span>
                      </span>
                    ) : null}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      {rfq.quotesCount} Factory Bids
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                  {rfq.productName}
                </h3>

                {/* Volume & Destination Matrix */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 shrink-0">Target Volume:</span>
                    <span className="font-mono font-bold text-slate-900 text-right truncate">
                      {rfq.targetQuantity?.toLocaleString()} {rfq.quantityUnit}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 shrink-0">Destination Port:</span>
                    <span className="font-semibold text-slate-800 text-right truncate">{rfq.destinationPort}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 shrink-0">Incoterms / Target:</span>
                    <span className="font-mono font-bold text-emerald-700 text-right truncate">
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
                        <div className="flex items-center flex-wrap gap-1">
                          <strong>Email:</strong> 
                          {rfq.buyerEmail ? (
                            <a href={`mailto:${rfq.buyerEmail}`} className="text-blue-600 hover:underline">{rfq.buyerEmail}</a>
                          ) : (
                            <a href="mailto:support@tradeheaven.net" className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-200 transition-colors font-medium">
                              Contact via Trade Heaven
                            </a>
                          )}
                        </div>
                        <div><strong>Phone:</strong> {rfq.buyerPhone || 'Not Provided'}</div>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200 gap-4">
              <span className="text-sm text-slate-600 font-medium">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} Leads
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                          currentPage === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
