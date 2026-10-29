import React, { useState, useEffect, useMemo } from 'react';
import { RfqRequirement, Currency, AuthUser, ActiveView } from '../../types';
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
  UserPlus,
  SlidersHorizontal,
  Tag,
  X,
  Package,
  Share2,
  CheckCircle2,
  DollarSign,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { getFreshRfqDate } from '../../utils/rfqDateUtils';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';
import { DailyFreeLeadBanner } from '../marketplace/DailyFreeLeadBanner';
import { PitchBuyerModal } from '../marketplace/PitchBuyerModal';
import { PaginationControls } from '../common/PaginationControls';
import { SearchRegistrationGate } from '../common/SearchAutoSuggestDropdown';
import { getFreeLeadStatus, claimDailyFreeLead, isRfqClaimedFree, FreeLeadState, isPaidEntity, isPaidMemberUser } from '../../services/freeLeadService';
import { LeadAccessValueModal } from '../marketplace/LeadAccessValueModal';
import { getSavedLeadIds, toggleSaveLead, subscribeToSavedLeads } from '../../services/savedLeadsService';

interface Props {
  selectedCurrency: Currency;
  onSelectRfq: (rfq: RfqRequirement) => void;
  onOpenCreateRfq: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  onOpenRegisterFree?: () => void;
  onNavigate?: (view: ActiveView) => void;
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

export const BUDGET_RANGES = [
  { id: 'ALL', label: 'All Budgets (Any Deal Size)' },
  { id: 'UNDER_25K', label: 'Under $25,000' },
  { id: '25K_100K', label: '$25,000 – $100,000' },
  { id: '100K_500K', label: '$100,000 – $500,000' },
  { id: '500K_2M', label: '$500,000 – $2,000,000' },
  { id: 'OVER_2M', label: 'Over $2,000,000 (Mega Tenders)' },
  { id: 'CUSTOM', label: 'Custom Range...' }
] as const;

export const BuyLeadsView: React.FC<Props> = ({
  selectedCurrency,
  onSelectRfq,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal,
  onOpenRegisterFree,
  onNavigate
}) => {
  const [itemsPerPage, setItemsPerPage] = useState(18);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>('ALL');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'bids' | 'volume' | 'price-high' | 'price-low'>('newest');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [rfqs, setRfqs] = useState<RfqRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pitchRfq, setPitchRfq] = useState<RfqRequirement | null>(null);
  const [freeLeadStatus, setFreeLeadStatus] = useState<FreeLeadState>(getFreeLeadStatus());
  const [leadAccessModalRfq, setLeadAccessModalRfq] = useState<RfqRequirement | null>(null);
  const [isLeadAccessModalOpen, setIsLeadAccessModalOpen] = useState(false);

  const handleOpenLeadAccessModal = (rfq: RfqRequirement) => {
    setLeadAccessModalRfq(rfq);
    setIsLeadAccessModalOpen(true);
  };

  const handleProceedToPremiumServices = () => {
    setIsLeadAccessModalOpen(false);
    if (onNavigate) {
      onNavigate('PREMIUM_SERVICES');
    } else if (onOpenUpgradeModal) {
      onOpenUpgradeModal();
    }
  };

  const [savedLeadIds, setSavedLeadIds] = useState<string[]>(() => 
    getSavedLeadIds(currentUser?.email)
  );

  useEffect(() => {
    setSavedLeadIds(getSavedLeadIds(currentUser?.email));
    const unsub = subscribeToSavedLeads((ids) => setSavedLeadIds(ids));
    return () => unsub();
  }, [currentUser?.email]);

  const handleToggleSaveLead = (rfq: RfqRequirement) => {
    toggleSaveLead(rfq, currentUser?.email);
  };

  useEffect(() => {
    const handleFreeLeadUpdated = () => {
      setFreeLeadStatus(getFreeLeadStatus());
    };
    window.addEventListener('tradeheaven_free_lead_updated', handleFreeLeadUpdated);
    return () => {
      window.removeEventListener('tradeheaven_free_lead_updated', handleFreeLeadUpdated);
    };
  }, []);

  const handleClaimLead = (rfq: RfqRequirement) => {
    if (!currentUser) {
      if (onOpenRegisterFree) onOpenRegisterFree();
      else window.dispatchEvent(new CustomEvent('tradeheaven_open_register'));
      return;
    }
    const isPaidLead = isPaidEntity(rfq);
    const isCallerPaid = isPaidMemberUser(currentUser);
    if (isPaidLead && !isCallerPaid) {
      if (onOpenUpgradeModal) onOpenUpgradeModal();
      return;
    }
    const updated = claimDailyFreeLead(rfq.id, rfq, currentUser);
    setFreeLeadStatus(updated);
    setPitchRfq(rfq);
  };

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

  // Dynamic Country List & Counts
  const countries = useMemo(() => {
    const set = new Set<string>();
    rfqs.forEach(r => {
      if (r.buyerCountry && r.buyerCountry.trim()) {
        set.add(r.buyerCountry.trim());
      }
    });
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rfqs]);

  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: rfqs.length };
    rfqs.forEach(r => {
      if (r.buyerCountry && r.buyerCountry.trim()) {
        const c = r.buyerCountry.trim();
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    return counts;
  }, [rfqs]);

  // Helper to compute total deal value in USD
  const getDealBudgetUsd = (r: RfqRequirement): number => {
    if (r.targetPriceUsd && r.targetQuantity) {
      return r.targetPriceUsd * r.targetQuantity;
    }
    return r.targetPriceUsd || 0;
  };

  // Dynamic Budget Range Counts
  const budgetCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: rfqs.length };
    rfqs.forEach(r => {
      const val = getDealBudgetUsd(r);
      if (val > 0 && val < 25000) counts['UNDER_25K'] = (counts['UNDER_25K'] || 0) + 1;
      else if (val >= 25000 && val <= 100000) counts['25K_100K'] = (counts['25K_100K'] || 0) + 1;
      else if (val >= 100000 && val <= 500000) counts['100K_500K'] = (counts['100K_500K'] || 0) + 1;
      else if (val >= 500000 && val <= 2000000) counts['500K_2M'] = (counts['500K_2M'] || 0) + 1;
      else if (val > 2000000) counts['OVER_2M'] = (counts['OVER_2M'] || 0) + 1;
    });
    return counts;
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

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(r => (r.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Country filter
    if (selectedCountry !== 'ALL') {
      list = list.filter(r => (r.buyerCountry || '').trim().toLowerCase() === selectedCountry.trim().toLowerCase());
    }

    // Budget range filter
    if (selectedBudgetRange !== 'ALL') {
      list = list.filter(r => {
        const val = getDealBudgetUsd(r);
        switch (selectedBudgetRange) {
          case 'UNDER_25K':
            return val > 0 && val < 25000;
          case '25K_100K':
            return val >= 25000 && val <= 100000;
          case '100K_500K':
            return val >= 100000 && val <= 500000;
          case '500K_2M':
            return val >= 500000 && val <= 2000000;
          case 'OVER_2M':
            return val > 2000000;
          case 'CUSTOM': {
            const minVal = minBudget !== '' ? parseFloat(minBudget) : 0;
            const maxVal = maxBudget !== '' ? parseFloat(maxBudget) : Infinity;
            return val >= minVal && val <= maxVal;
          }
          default:
            return true;
        }
      });
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
  }, [rfqs, searchTerm, selectedCategory, selectedCountry, selectedBudgetRange, minBudget, maxBudget, urgentOnly, sortBy, curr]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedCountry, selectedBudgetRange, minBudget, maxBudget, urgentOnly, sortBy]);
  
  const isUserPremium = currentUser?.role === 'ADMIN' || currentUser?.isPremium === true;

  const handleClearFilters = () => {
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedCountry('ALL');
    setSelectedBudgetRange('ALL');
    setMinBudget('');
    setMaxBudget('');
    setUrgentOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters = 
    searchTerm.trim() !== '' || 
    selectedCategory !== 'ALL' || 
    selectedCountry !== 'ALL' || 
    selectedBudgetRange !== 'ALL' || 
    minBudget !== '' || 
    maxBudget !== '' || 
    urgentOnly || 
    sortBy !== 'newest';

  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
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
            Direct buyer procurement requirements from verified international importers. Contact channels are protected to prevent spam—verify your business to connect directly for free.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {onNavigate && (
            <button
              type="button"
              onClick={() => {
                onNavigate('DASHBOARD');
                window.dispatchEvent(new CustomEvent('tradeheaven_open_dashboard_tab', { detail: { tab: 'SAVED_LEADS' } }));
                window.dispatchEvent(new CustomEvent('tradeheaven_dashboard_tab', { detail: { tab: 'SAVED_LEADS' } }));
              }}
              className="px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center gap-2 border border-amber-300 transition-all cursor-pointer shadow-2xs"
              title="Open your bookmarked saved leads in the Dashboard"
            >
              <Bookmark className={`w-4 h-4 ${savedLeadIds.length > 0 ? 'text-amber-600 fill-amber-500' : 'text-amber-600'}`} />
              <span>Saved Leads ({savedLeadIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('tradeheaven_open_share', {
                  detail: {
                    type: 'PAGE',
                    view: 'BUY_LEADS',
                    title: 'Global Buy Leads & RFQ Tender Hub | Trade Heaven',
                    subtitle: 'Live international purchase requests and verified importer sourcing tenders.'
                  }
                })
              );
            }}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer"
            title="Share Custom Link to Buy Leads Hub"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Share Hub</span>
          </button>

          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Buy Requirement</span>
          </button>
        </div>
      </div>

      {/* 1 Free Buy Order Daily Banner */}
      <DailyFreeLeadBanner
        onUpgradeToPlans={onOpenUpgradeModal}
        featuredRfq={filtered.find(r => !isPaidEntity(r)) || rfqs.find(r => !isPaidEntity(r)) || null}
        onClaimLead={handleClaimLead}
        currentUser={currentUser}
        onOpenRegisterFree={onOpenRegisterFree}
        onSelectClaimedRfq={(rfqId) => {
          const target = rfqs.find(r => r.id === rfqId);
          if (target) {
            onSelectRfq(target);
          }
        }}
      />

      {/* Security & Access Clearance Notice */}
      <div className="p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 flex-wrap bg-blue-50/80 border-blue-200 text-blue-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">
            Protected Business Verification Active: Direct buyer corporate email and telephone contacts are secured against automated scraping. Free one-click business verification available.
          </span>
        </div>
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

        {/* Tier 1.5: Smart Sourcing Filter Matrix (Country, Category, Budget Range) */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Buyer Country Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="buy-leads-country-filter" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Buyer Country:</span>
              </span>
              {selectedCountry !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCountry('ALL')}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                id="buy-leads-country-filter"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                  selectedCountry !== 'ALL'
                    ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <option value="ALL">All Countries / Global ({rfqs.length})</option>
                {countries.filter(c => c !== 'ALL').map(country => (
                  <option key={country} value={country}>
                    {country} ({countryCounts[country] || 0})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* 2. Product Category Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="buy-leads-category-filter" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Product Category:</span>
              </span>
              {selectedCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                id="buy-leads-category-filter"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                  selectedCategory !== 'ALL'
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <option value="ALL">All Product Categories ({rfqs.length})</option>
                {categories.filter(c => c !== 'ALL').map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryCounts[cat] || 0})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* 3. Budget Range Filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="buy-leads-budget-filter" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Budget / Deal Size:</span>
              </span>
              {selectedBudgetRange !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBudgetRange('ALL');
                    setMinBudget('');
                    setMaxBudget('');
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                id="buy-leads-budget-filter"
                value={selectedBudgetRange}
                onChange={e => setSelectedBudgetRange(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
                  selectedBudgetRange !== 'ALL'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <option value="ALL">All Budgets ({rfqs.length})</option>
                <option value="UNDER_25K">Under $25,000 ({budgetCounts['UNDER_25K'] || 0})</option>
                <option value="25K_100K">$25,000 – $100,000 ({budgetCounts['25K_100K'] || 0})</option>
                <option value="100K_500K">$100,000 – $500,000 ({budgetCounts['100K_500K'] || 0})</option>
                <option value="500K_2M">$500,000 – $2,000,000 ({budgetCounts['500K_2M'] || 0})</option>
                <option value="OVER_2M">Over $2,000,000 Mega Tenders ({budgetCounts['OVER_2M'] || 0})</option>
                <option value="CUSTOM">Custom Range...</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Custom Min/Max Budget Inputs (when CUSTOM is chosen) */}
        {selectedBudgetRange === 'CUSTOM' && (
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 shrink-0">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Custom Deal Budget Range (USD):</span>
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="Min Budget"
                  value={minBudget}
                  onChange={e => setMinBudget(e.target.value)}
                  className="w-full bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold">to</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="Max Budget"
                  value={maxBudget}
                  onChange={e => setMaxBudget(e.target.value)}
                  className="w-full bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
              {(minBudget || maxBudget) && (
                <button
                  type="button"
                  onClick={() => { setMinBudget(''); setMaxBudget(''); }}
                  className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline shrink-0 cursor-pointer"
                >
                  Clear Min/Max
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Filter Tags Bar (Shows when any filter is active) */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Active filters:</span>
            </span>

            {selectedCountry !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-200">
                <Globe2 className="w-3 h-3 text-blue-700" />
                <span>Country: {selectedCountry}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCountry('ALL')}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Remove Country Filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-bold text-[11px] border border-indigo-200">
                <Package className="w-3 h-3 text-indigo-700" />
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Remove Category Filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBudgetRange !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                <DollarSign className="w-3 h-3 text-emerald-700" />
                <span>
                  Budget:{' '}
                  {selectedBudgetRange === 'CUSTOM'
                    ? `$${minBudget || '0'} – $${maxBudget || '∞'}`
                    : (BUDGET_RANGES.find(b => b.id === selectedBudgetRange)?.label || selectedBudgetRange)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBudgetRange('ALL');
                    setMinBudget('');
                    setMaxBudget('');
                  }}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Remove Budget Filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {urgentOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-bold text-[11px] border border-rose-200">
                <Zap className="w-3 h-3 text-rose-600 fill-rose-600" />
                <span>Urgent Only</span>
                <button
                  type="button"
                  onClick={() => setUrgentOnly(false)}
                  className="hover:text-rose-700 ml-0.5 cursor-pointer"
                  title="Remove Urgent Filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchTerm.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                <Search className="w-3 h-3 text-slate-600" />
                <span>Keyword: "{searchTerm.trim()}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Clear Keyword Search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
            >
              <X className="w-3 h-3" />
              <span>Clear All ({filtered.length} matches)</span>
            </button>
          </div>
        )}

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
              {!currentUser && searchTerm.trim() !== '' ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Search Locked</span>
                </span>
              ) : (
                <><strong>{filtered.length}</strong> {filtered.length === 1 ? 'tender match' : 'tenders matching'}</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leads Grid / Empty State */}
      {!currentUser && searchTerm.trim() !== '' ? (
        <SearchRegistrationGate
          query={searchTerm}
          variant="panel"
          onRegister={onOpenRegisterFree}
          onClearSearch={() => setSearchTerm('')}
        />
      ) : isLoading ? (
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
          description={
            hasActiveFilters 
              ? `No live buyer inquiries match your active filters (${[
                  selectedCountry !== 'ALL' ? `Country: ${selectedCountry}` : null,
                  selectedCategory !== 'ALL' ? `Category: ${selectedCategory}` : null,
                  selectedBudgetRange !== 'ALL' ? `Budget: ${selectedBudgetRange === 'CUSTOM' ? `$${minBudget || '0'} – $${maxBudget || '∞'}` : (BUDGET_RANGES.find(b => b.id === selectedBudgetRange)?.label || selectedBudgetRange)}` : null,
                  urgentOnly ? 'Urgent Tenders' : null,
                  searchTerm.trim() ? `Keyword: "${searchTerm.trim()}"` : null
                ].filter(Boolean).join(', ')}). Try adjusting or resetting your filter criteria.` 
              : "There are currently no active buying leads in the database. Be the first to post an RFQ and receive competitive factory quotes."
          }
          actionLabel="Clear All Search Filters"
          onAction={handleClearFilters}
        />
      ) : (
                <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {currentItems.map((rfq, idx) => {
              const isPaidLead = isPaidEntity(rfq);
              const isCallerPaid = isPaidMemberUser(currentUser);
              const isClaimed = Boolean(currentUser) && isRfqClaimedFree(rfq.id);

              return (
                <div
                  key={rfq.id}
                  className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between h-full shadow-sm ${
                    isClaimed && !isPaidLead
                      ? 'border-amber-400 ring-2 ring-amber-300/40 hover:border-amber-500'
                      : isPaidLead
                      ? 'border-slate-800/80 hover:border-amber-500 hover:shadow-md'
                      : 'border-slate-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3 flex-1 flex flex-col">
                    {/* Header with uniform height */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 min-h-[52px]">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                            {rfq.id}
                          </span>
                          <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-200/80 shrink-0">
                            <Clock className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                            <span>{getFreshRfqDate(rfq)}</span>
                          </span>
                          {isPaidLead ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-400/40 flex items-center gap-1 shadow-2xs shrink-0">
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                              <span>Paid Member Lead</span>
                            </span>
                          ) : isClaimed ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-500 flex items-center gap-1 shadow-2xs shrink-0">
                              <Zap className="w-2.5 h-2.5 fill-slate-950" />
                              <span>Free Lead Unlocked</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Free Claimable</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-bold mt-1 truncate">{rfq.category}</div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                        {rfq.urgency === 'URGENT' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 shrink-0 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                            <span>Urgent</span>
                          </span>
                        ) : null}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                          {rfq.quotesCount} Bids
                        </span>
                      </div>
                    </div>

                    {/* Title & Product Image with uniform height */}
                    <div className="flex items-center gap-3 h-13">
                      <div className="w-12 h-12 rounded-lg border border-slate-200 shrink-0 bg-slate-100 shadow-2xs flex items-center justify-center overflow-hidden">
                        {(rfq.image || rfq.images?.[0]) ? (
                          (() => {
                            const rawImg = rfq.image || rfq.images?.[0];
                            const cbImg = rawImg ? `${rawImg}${rawImg.includes('?') ? '&' : '?'}v=1` : '';
                            return (
                              <img
                                src={cbImg}
                                alt={rfq.productName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            );
                          })()
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                          {rfq.productName}
                        </h3>
                      </div>
                    </div>

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
                        <span className="font-semibold text-slate-800 text-right truncate">{rfq.destinationPort || 'Global Port'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500 shrink-0">Incoterms / Target:</span>
                        <span className="font-mono font-bold text-emerald-700 text-right truncate">
                          {rfq.preferredIncoterm} • {formatPrice(rfq.targetPriceUsd)}/unit
                        </span>
                      </div>
                    </div>

                    {/* Description Snippet Preview (Blurred for Free Users) */}
                    {!isCallerPaid && (!isClaimed || isPaidLead) ? (
                      (() => {
                        const fullDesc = rfq.detailedDescription || 'Bulk purchase specifications, delivery schedules, and compliance standards.';
                        const splitIndex = fullDesc.indexOf(' ', 32);
                        const safeSplit = splitIndex > 15 && splitIndex < 55 ? splitIndex : 35;
                        const previewSnippet = fullDesc.slice(0, safeSplit);
                        const blurredSnippet = fullDesc.slice(safeSplit) || '... technical compliance, packaging specs, inspection certification, and delivery timeline required.';

                        return (
                          <div
                            onClick={() => handleOpenLeadAccessModal(rfq)}
                            className="relative h-14 p-2.5 rounded-xl bg-slate-50/90 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group overflow-hidden shadow-2xs"
                            title="Click to upgrade and unlock full procurement specifications and buyer requirements"
                          >
                            <div className="text-[11px] leading-relaxed text-slate-700 select-none pr-1">
                              <span className="font-semibold text-slate-800">
                                "{previewSnippet}
                              </span>
                              <span className="blur-[3px] select-none text-slate-400 opacity-60">
                                {' '}{blurredSnippet}"
                              </span>
                            </div>

                            {/* Floating bottom blur shield with Upgrade CTA badge */}
                            <div className="absolute inset-x-0 bottom-0 pt-3 pb-1 px-2.5 bg-gradient-to-t from-white via-white/85 to-transparent flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 group-hover:text-amber-900 truncate">
                                <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate">Full description blurred for free members</span>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-950 bg-amber-300 hover:bg-amber-400 px-2 py-0.5 rounded-full border border-amber-400/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                                <Crown className="w-2.5 h-2.5 fill-amber-950" />
                                <span>Upgrade to View</span>
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="h-14 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                          "{rfq.detailedDescription}"
                        </p>
                      </div>
                    )}

                    {/* Buyer Company area */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 h-5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-semibold text-slate-700">
                            {rfq.buyerCompany} ({rfq.buyerCountry})
                          </span>
                        </div>
                      </div>

                      {/* Gated Buyer Email & Phone with uniform height container */}
                      <div className="pt-2">
                        {isPaidLead && !isCallerPaid ? (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-400/50 space-y-2 text-xs h-[180px] flex flex-col justify-between shadow-xs">
                            <div className="flex items-center justify-between text-[10px] font-black text-amber-400 pb-1.5 border-b border-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Paid Member Protected Data</span>
                              </span>
                              <span className="font-mono text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-400/30">
                                Paid Only
                              </span>
                            </div>
                            <div className="space-y-1 text-slate-300 text-[11px]">
                              <p className="leading-snug text-slate-300 font-medium">
                                Verified Paid Member Buyer: Contact details of paid members are strictly protected from unpaid members and cannot be claimed via free daily credits.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenLeadAccessModal(rfq)}
                              style={{
                                animationDelay: `${Math.min(idx * 60, 400)}ms`
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 animate-subtle-pop"
                            >
                              <Crown className="w-3.5 h-3.5 fill-slate-950" />
                              <span>Upgrade to View</span>
                            </button>
                          </div>
                        ) : isClaimed ? (
                          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2 text-xs h-[180px] flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[10px] font-black text-amber-950 pb-1.5 border-b border-amber-200">
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
                                <span>Unlocked with Daily Free Credit</span>
                              </span>
                              <span className="font-mono text-[9px] bg-amber-200 text-amber-900 px-1 py-0.5 rounded font-bold">Unvetted</span>
                            </div>
                            <div className="space-y-1.5 text-slate-800 text-[11px]">
                              <div className="truncate">
                                <strong>Email: </strong>
                                <a href={`mailto:${rfq.buyerEmail || 'procurement@' + rfq.buyerCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`} className="text-blue-600 hover:underline font-mono font-bold">
                                  {rfq.buyerEmail || `${rfq.buyerCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}@procurement.com`}
                                </a>
                              </div>
                              <div className="truncate">
                                <strong>Phone: </strong>
                                <span className="font-mono font-bold">{rfq.buyerPhone || '+1 (555) 382-9901'}</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-amber-900 font-medium italic pt-1 border-t border-amber-200/70 truncate">
                              (Free community inquiry—deals not guaranteed).
                            </div>
                          </div>
                        ) : (
                          <div className="h-[180px] flex flex-col">
                            <PremiumContactGate
                              currentUser={currentUser}
                              onOpenUpgradeModal={() => handleOpenLeadAccessModal(rfq)}
                              isMasked={Boolean(rfq.isContactMasked)}
                              paidMembersOnly={isPaidLead}
                              resourceTitle={isPaidLead ? "Paid Member Protected Desk Contact" : "Buyer Direct Desk Contact"}
                              className="h-full flex flex-col justify-between"
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
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectRfq(rfq)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                      >
                        <span>Quote Tender</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {!isCallerPaid && (
                        <button
                          type="button"
                          data-testid={`upgrade-to-view-btn-${rfq.id}`}
                          onClick={() => handleOpenLeadAccessModal(rfq)}
                          style={{
                            animationDelay: `${Math.min(idx * 60, 400)}ms`
                          }}
                          className="animate-subtle-pop py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 shrink-0"
                          title="Upgrade to view direct corporate buyer contact details and full lead specifications"
                        >
                          <Crown className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Upgrade to View</span>
                        </button>
                      )}

                      {isPaidLead && !isCallerPaid ? null : (
                        <a
                          href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${encodeURIComponent(`Hello TradeHeaven, I am quoting on Buy Lead: "${rfq.productName}" for ${rfq.buyerCompany} (Target: ${rfq.targetQuantity} ${rfq.quantityUnit} @ $${rfq.targetPriceUsd} ${rfq.preferredIncoterm}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm text-center shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(
                            new CustomEvent('tradeheaven_open_share', {
                              detail: {
                                type: 'RFQ',
                                id: rfq.id,
                                title: rfq.productName,
                                subtitle: `Buyer: ${rfq.buyerCompany} (${rfq.buyerCountry}) • Target: ${rfq.targetQuantity?.toLocaleString()} ${rfq.quantityUnit} @ $${rfq.targetPriceUsd}/unit`
                              }
                            })
                          );
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
                        title={`Share direct link to RFQ ${rfq.id}: ${rfq.productName}`}
                        aria-label="Share this RFQ"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Save Lead to Dashboard Button */}
                      <button
                        type="button"
                        data-testid={`save-lead-btn-${rfq.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSaveLead(rfq);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                          savedLeadIds.includes(rfq.id)
                            ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 shadow-2xs'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'
                        }`}
                        title={savedLeadIds.includes(rfq.id) ? "Saved in your Dashboard! Click to remove bookmark." : "Save Lead to your Dashboard"}
                        aria-label={savedLeadIds.includes(rfq.id) ? "Remove saved lead" : "Save this lead to dashboard"}
                      >
                        <Bookmark className={`w-4 h-4 ${savedLeadIds.includes(rfq.id) ? 'fill-amber-500 text-amber-600' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemsPerPageOptions={[18, 36, 54]}
          itemLabel="leads"
          scrollTargetId="buy-leads-view-root"
        />
      </div>
      )}

      {/* Direct Pitch Buyer Modal for Claimed Daily Free Lead */}
      {pitchRfq && (
        <PitchBuyerModal
          rfq={pitchRfq}
          currentUser={currentUser}
          selectedCurrency={selectedCurrency}
          onClose={() => setPitchRfq(null)}
          onOpenUpgradeModal={onOpenUpgradeModal}
        />
      )}

      {/* Contextual Modal Explaining Value of Full Lead Access */}
      <LeadAccessValueModal
        rfq={leadAccessModalRfq}
        isOpen={isLeadAccessModalOpen}
        onClose={() => setIsLeadAccessModalOpen(false)}
        onProceedToPremiumServices={handleProceedToPremiumServices}
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default BuyLeadsView;
