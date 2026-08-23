import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Globe2, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  Edit3,
  ChevronDown,
  X,
  Package,
  Building2,
  FileText,
  Wrench,
  Tag,
  DollarSign,
  Award,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CATEGORIES_TREE, MOCK_COMPANIES, MOCK_RFQS, CURRENCY_RATES } from '../../data/mockData';
import { Product, Currency, ActiveView, CompanyProfile, RfqRequirement } from '../../types';
import { useSiteContent } from '../../context/SiteContentContext';
import { SafeImage } from '../common/SafeImage';

interface Props {
  onSearch: (query: string, category: string) => void;
  onOpenCreateRfq: () => void;
  onOpenLiveTool: (tool: 'incoterms' | 'rfq_checker' | 'api_sandbox') => void;
  products?: Product[];
  selectedCurrency?: Currency;
  onSelectProduct?: (product: Product) => void;
  onOpenStorefront?: (companyId: string) => void;
  onNavigate?: (view: ActiveView) => void;
}

type SearchFilterType = 'ALL' | 'PRODUCTS' | 'SUPPLIERS' | 'RFQS' | 'CATEGORIES' | 'TOOLS';

interface SiteToolResult {
  id: string;
  name: string;
  category: string;
  description: string;
  actionType: 'tool' | 'view' | 'rfq';
  toolTarget?: 'incoterms' | 'rfq_checker' | 'api_sandbox';
  viewTarget?: ActiveView;
  badge: string;
}

const SITE_TOOLS: SiteToolResult[] = [
  {
    id: 'tool-incoterms',
    name: 'FOB / CIF Incoterms & Freight Calculator',
    category: 'Logistics Tool',
    description: 'Calculate maritime container shipping rates, port terminal charges, customs tariffs & cargo insurance.',
    actionType: 'tool',
    toolTarget: 'incoterms',
    badge: 'Live Tool'
  },
  {
    id: 'tool-rfq',
    name: 'Post Custom Sourcing RFQ (Buy Lead)',
    category: 'Procurement',
    description: 'Publish your specifications directly to 12,500+ verified factories for competitive quotes in 24h.',
    actionType: 'rfq',
    badge: '24h Quotes'
  },
  {
    id: 'tool-negotiation',
    name: 'Direct Trade Negotiation Room & Escrow',
    category: 'Escrow Services',
    description: 'Chat directly with factory export directors, draft digital sales contracts & lock Swiss escrow funds.',
    actionType: 'view',
    viewTarget: 'NEGOTIATION_ROOM',
    badge: 'Escrow Safe'
  },
  {
    id: 'tool-suppliers',
    name: 'Verified Suppliers & Factory Directory',
    category: 'Supplier Directory',
    description: 'Browse 480k+ audited manufacturers with ISO 9001, CE, TÜV on-site inspection reports.',
    actionType: 'view',
    viewTarget: 'SUPPLIERS_DIRECTORY',
    badge: 'Audited'
  },
  {
    id: 'tool-buyleads',
    name: 'Global Buy Leads & Sourcing Hub',
    category: 'Demand Marketplace',
    description: 'View active high-volume purchasing requirements from verified international importers.',
    actionType: 'view',
    viewTarget: 'BUY_LEADS',
    badge: 'High Volume'
  },
  {
    id: 'tool-sell-offer',
    name: 'Post Sell Offer / Factory Catalog Export',
    category: 'Supplier Tools',
    description: 'List your factory production lines and wholesale stock for international trade distribution.',
    actionType: 'view',
    viewTarget: 'POST_SELL_OFFER',
    badge: 'Exporter Tool'
  },
  {
    id: 'tool-premium',
    name: 'Trade Heaven VIP Membership & Verified Audits',
    category: 'Membership',
    description: 'Unlock direct unmasked supplier contact details, verified factory audits, and priority escrow lines.',
    actionType: 'view',
    viewTarget: 'PREMIUM_MEMBERSHIP',
    badge: 'VIP Service'
  }
];

const POPULAR_SEARCH_CHIPS = [
  '5-Axis CNC Milling',
  'Forged Alloy Wheels',
  'LiFePO4 Battery Cells',
  'Solar Inverters',
  'Virgin HDPE Polymer',
  'Selvedge Denim',
  'Corrugated Packaging'
];

export const HeroSection: React.FC<Props> = ({
  onSearch,
  onOpenCreateRfq,
  onOpenLiveTool,
  products = [],
  selectedCurrency = 'USD',
  onSelectProduct,
  onOpenStorefront,
  onNavigate
}) => {
  const { siteContent, isLiveEditMode, openQuickEdit } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All Categories');
  
  // Downward dropdown states
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>('ALL');

  const containerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
        setIsSearchPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const curr = useMemo(() => {
    return CURRENCY_RATES.find(c => c.code === selectedCurrency) || CURRENCY_RATES[0];
  }, [selectedCurrency]);

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Full-Site Multi-Index Search Query Matcher
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        products: [],
        suppliers: [],
        rfqs: [],
        categories: [],
        tools: [],
        totalCount: 0
      };
    }

    // 1. Match Products
    const matchedProducts = products.filter(p => {
      const matchCat = selectedCat === 'All Categories' || p.category.toLowerCase().includes(selectedCat.toLowerCase());
      if (!matchCat) return false;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        (p.supplierCountry && p.supplierCountry.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.specifications && p.specifications.some(s => s.name.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)))
      );
    }).slice(0, 6);

    // 2. Match Verified Suppliers & Manufacturers
    const matchedSuppliers = MOCK_COMPANIES.filter(c => {
      return (
        c.companyName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.businessType.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.certifications.some(cert => cert.toLowerCase().includes(q))
      );
    }).slice(0, 4);

    // 3. Match RFQs & Buy Leads
    const matchedRfqs = MOCK_RFQS.filter(r => {
      return (
        r.productName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.buyerCompany.toLowerCase().includes(q) ||
        (r.destinationPort && r.destinationPort.toLowerCase().includes(q)) ||
        (r.preferredIncoterm && r.preferredIncoterm.toLowerCase().includes(q))
      );
    }).slice(0, 4);

    // 4. Match Categories & Subcategories
    const matchedCategories: { name: string; icon: string; count: string; subcategory?: string }[] = [];
    CATEGORIES_TREE.forEach(cat => {
      if (cat.name.toLowerCase().includes(q)) {
        matchedCategories.push({ name: cat.name, icon: cat.icon, count: cat.count });
      }
      cat.subcategories.forEach(sub => {
        if (sub.toLowerCase().includes(q) && !matchedCategories.some(mc => mc.subcategory === sub)) {
          matchedCategories.push({ name: cat.name, icon: cat.icon, count: cat.count, subcategory: sub });
        }
      });
    });

    // 5. Match Site Tools & Services
    const matchedTools = SITE_TOOLS.filter(t => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }).slice(0, 4);

    const totalCount = 
      matchedProducts.length + 
      matchedSuppliers.length + 
      matchedRfqs.length + 
      matchedCategories.length + 
      matchedTools.length;

    return {
      products: matchedProducts,
      suppliers: matchedSuppliers,
      rfqs: matchedRfqs,
      categories: matchedCategories.slice(0, 4),
      tools: matchedTools,
      totalCount
    };
  }, [searchQuery, selectedCat, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchPopoverOpen(false);
    setIsCategoryMenuOpen(false);
    onSearch(searchQuery, selectedCat === 'All Categories' ? '' : selectedCat);
    if (onNavigate) {
      onNavigate('PRODUCT_DIRECTORY');
    }
  };

  const handleSelectCategory = (catName: string) => {
    setSelectedCat(catName);
    setIsCategoryMenuOpen(false);
    if (searchQuery.trim()) {
      onSearch(searchQuery, catName === 'All Categories' ? '' : catName);
    }
  };

  const handleProductClick = (product: Product) => {
    setIsSearchPopoverOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onNavigate) {
      onNavigate('PRODUCT_DIRECTORY');
    }
  };

  const handleSupplierClick = (companyId: string) => {
    setIsSearchPopoverOpen(false);
    if (onOpenStorefront) {
      onOpenStorefront(companyId);
    } else if (onNavigate) {
      onNavigate('SUPPLIERS_DIRECTORY');
    }
  };

  const handleRfqClick = (rfq: RfqRequirement) => {
    setIsSearchPopoverOpen(false);
    if (onNavigate) {
      onNavigate('RFQ_HUB');
    }
  };

  const handleToolClick = (tool: SiteToolResult) => {
    setIsSearchPopoverOpen(false);
    if (tool.actionType === 'tool' && tool.toolTarget) {
      onOpenLiveTool(tool.toolTarget);
    } else if (tool.actionType === 'rfq') {
      onOpenCreateRfq();
    } else if (tool.actionType === 'view' && tool.viewTarget && onNavigate) {
      onNavigate(tool.viewTarget);
    }
  };

  const handleChipClick = (term: string) => {
    setSearchQuery(term);
    setIsSearchPopoverOpen(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchPopoverOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const hp = siteContent.homepage;
  const specialist = hp.tradeSpecialist || {
    name: 'Elena Rostova',
    title: 'Global Sourcing Director',
    quote: 'Assisting enterprise buyers with verified factory matchmaking & Incoterms CIF logistics.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  };

  return (
    <div id="trade-heaven-hero" className="relative rounded-3xl bg-slate-950 p-6 sm:p-9 lg:p-12 shadow-2xl text-white border border-slate-800 group">
      
      {/* Live Visual Edit Trigger Button */}
      {isLiveEditMode && (
        <button
          type="button"
          onClick={() => openQuickEdit('HERO')}
          className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xl hover:bg-amber-300 transition-all cursor-pointer animate-bounce"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Hero &amp; Specialist</span>
        </button>
      )}

      {/* Real High-Resolution Maritime Cargo Port Background */}
      <div 
        className="absolute inset-0 rounded-3xl overflow-hidden bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000 pointer-events-none"
        style={{ backgroundImage: `url('${hp.heroBgImage || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=85'}')` }}
      />
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/80 pointer-events-none" />
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-7">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-4 max-w-2xl">
            {/* Trust Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-xs font-semibold text-blue-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{hp.heroTrustEyebrow || 'Audited Global Manufacturers • Real-Time FOB & CIF Sourcing • Trade Assurance'}</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {hp.heroHeadline || 'Direct Global Factory Sourcing &'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
                {hp.heroHeadlineGradient || 'Container Logistics Marketplace'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
              {hp.heroSubheadline || 'Connect directly with verified tier-1 manufacturing plants across 180+ countries. Negotiate volume FOB/CIF pricing, verify factory audits, and dispatch cargo with full escrow protection.'}
            </p>
          </div>

          {/* Verified Trade Specialist Card */}
          <div className="hidden lg:flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl shrink-0 max-w-xs">
            <img 
              src={specialist.avatar} 
              alt={specialist.name} 
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover border border-amber-400/50 shadow-md shrink-0" 
            />
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white">{specialist.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">{specialist.title}</div>
              <div className="text-[10px] text-slate-300 leading-tight">"{specialist.quote}"</div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ENHANCED PROFESSIONAL OMNIBAR SEARCH & DOWNWARD MENUS */}
        {/* ------------------------------------------------------------- */}
        <div ref={containerRef} className="relative max-w-4xl">
          <form onSubmit={handleSearchSubmit} className="relative z-30">
            <div className="bg-white p-2 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 transition-all ring-4 ring-black/10">
              
              {/* 1. Category Dropdown Trigger (Opens Strictly DOWNWARDS) */}
              <div ref={categoryDropdownRef} className="relative w-full sm:w-56 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryMenuOpen(!isCategoryMenuOpen);
                    setIsSearchPopoverOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    isCategoryMenuOpen 
                      ? 'bg-blue-50 text-blue-900 border-blue-400 ring-2 ring-blue-500/20' 
                      : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-900 border-slate-200'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryMenuOpen}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedCat}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* CATEGORIES DOWNWARD MENU */}
                {isCategoryMenuOpen && (
                  <div 
                    id="hero-categories-downward-menu"
                    className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="uppercase tracking-wider">Industrial Sectors</span>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                        {CATEGORIES_TREE.length} Sectors
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 text-xs font-medium">
                      {/* Option: All Categories */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('All Categories')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          selectedCat === 'All Categories'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className={`w-4 h-4 ${selectedCat === 'All Categories' ? 'text-white' : 'text-blue-600'}`} />
                          <span>All Verified Sectors</span>
                        </div>
                        {selectedCat === 'All Categories' && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>

                      {/* Category Options */}
                      {CATEGORIES_TREE.map(cat => {
                        const isSelected = selectedCat === cat.name;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectCategory(cat.name)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              <Tag className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <span className={`text-[10px] shrink-0 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {cat.count.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Omnibar Search Input */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    setIsCategoryMenuOpen(false);
                    if (searchQuery.trim().length > 0) {
                      setIsSearchPopoverOpen(true);
                    }
                  }}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().length > 0) {
                      setIsSearchPopoverOpen(true);
                    } else {
                      setIsSearchPopoverOpen(false);
                    }
                  }}
                  placeholder={hp.searchPlaceholder || "Search products, materials, factories, RFQs, or Incoterms tools..."}
                  className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                  autoComplete="off"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 3. Search Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-950" />
                <span>Search Catalog</span>
              </button>
            </div>
          </form>

          {/* ------------------------------------------------------------- */}
          {/* FULL-SITE LIVE SEARCH RESULTS POPOVER (OPENS DOWNWARDS) */}
          {/* ------------------------------------------------------------- */}
          {isSearchPopoverOpen && searchQuery.trim().length > 0 && (
            <div 
              id="hero-omnibar-results-popover"
              className="absolute top-full left-0 right-0 mt-2.5 z-40 bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* Header with Search Query & Filter Tabs */}
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-200 truncate">
                    Search results for <span className="text-amber-400 font-black">"{searchQuery}"</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold shrink-0">
                    {searchResults.totalCount} matches
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                      activeFilter === 'ALL'
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    All ({searchResults.totalCount})
                  </button>

                  {searchResults.products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('PRODUCTS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeFilter === 'PRODUCTS'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Products ({searchResults.products.length})
                    </button>
                  )}

                  {searchResults.suppliers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('SUPPLIERS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeFilter === 'SUPPLIERS'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Suppliers ({searchResults.suppliers.length})
                    </button>
                  )}

                  {searchResults.rfqs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('RFQS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeFilter === 'RFQS'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      RFQs ({searchResults.rfqs.length})
                    </button>
                  )}

                  {searchResults.tools.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('TOOLS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeFilter === 'TOOLS'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Tools ({searchResults.tools.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Results Feed */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-5">
                {searchResults.totalCount === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900">No direct matches found for "{searchQuery}"</div>
                      <div className="text-xs text-slate-500 max-w-sm mx-auto">
                        We couldn't find exact matches in our current index. Would you like to post an RFQ to get factory quotes in 24 hours?
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchPopoverOpen(false);
                          onOpenCreateRfq();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Post Custom RFQ for "{searchQuery}"</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: MATCHED PRODUCTS */}
                    {(activeFilter === 'ALL' || activeFilter === 'PRODUCTS') && searchResults.products.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-blue-600" />
                            Verified Factory Products ({searchResults.products.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="text-[11px] text-blue-600 font-bold hover:underline normal-case flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View in catalog</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.products.map(prod => {
                            const unitPrice = prod.priceTiers && prod.priceTiers[0] ? prod.priceTiers[0].priceUsd : 0;
                            const imgUrl = prod.images && prod.images[0] ? prod.images[0] : '';
                            const unitLabel = prod.moqUnit || 'Units';
                            return (
                              <div
                                key={prod.id}
                                onClick={() => handleProductClick(prod)}
                                className="p-2.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center gap-3 group/item bg-white"
                              >
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <SafeImage src={imgUrl} alt={prod.title} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="text-xs font-bold text-slate-900 group-hover/item:text-blue-600 transition-colors line-clamp-1">
                                    {prod.title}
                                  </div>
                                  <div className="text-[11px] font-mono font-black text-slate-900">
                                    {formatPrice(unitPrice)} <span className="text-[10px] text-slate-500 font-normal">/ {unitLabel}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span>MOQ: {prod.moq} {unitLabel}</span>
                                    <span>•</span>
                                    <span className="truncate">{prod.supplierCountry}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: MATCHED SUPPLIERS & FACTORIES */}
                    {(activeFilter === 'ALL' || activeFilter === 'SUPPLIERS') && searchResults.suppliers.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            Audited Manufacturers ({searchResults.suppliers.length})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.suppliers.map(supp => (
                            <div
                              key={supp.id}
                              onClick={() => handleSupplierClick(supp.id)}
                              className="p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group/item bg-white"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <SafeImage src={supp.logoUrl} alt={supp.companyName} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <div className="text-xs font-bold text-slate-900 group-hover/item:text-amber-700 transition-colors line-clamp-1">
                                    {supp.companyName}
                                  </div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                    <span>{supp.country}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-emerald-600">{supp.trustScore}% Trust Score</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                {supp.tier}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: MATCHED BUY LEADS & RFQS */}
                    {(activeFilter === 'ALL' || activeFilter === 'RFQS') && searchResults.rfqs.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            Active RFQs &amp; Buy Leads ({searchResults.rfqs.length})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.rfqs.map(rfq => (
                            <div
                              key={rfq.id}
                              onClick={() => handleRfqClick(rfq)}
                              className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer space-y-1 group/item bg-white"
                            >
                              <div className="text-xs font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors line-clamp-1">
                                {rfq.productName}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>Vol: {rfq.targetQuantity} {rfq.quantityUnit}</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {rfq.targetPriceUsd ? `Target: ${formatPrice(rfq.targetPriceUsd)}` : 'Competitive Quote'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Dest: {rfq.destinationPort} • {rfq.preferredIncoterm}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: MATCHED TOOLS & SERVICES */}
                    {(activeFilter === 'ALL' || activeFilter === 'TOOLS') && searchResults.tools.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                            Platform Tools &amp; Services ({searchResults.tools.length})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.tools.map(tool => (
                            <div
                              key={tool.id}
                              onClick={() => handleToolClick(tool)}
                              className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group/item bg-white"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="text-xs font-bold text-slate-900 group-hover/item:text-indigo-700 transition-colors line-clamp-1">
                                  {tool.name}
                                </div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">
                                  {tool.description}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 shrink-0">
                                {tool.badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Popover Footer Action */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] shadow-2xs">Enter</kbd> to search full catalog
                </span>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer text-xs"
                >
                  <span>Explore all "{searchQuery}" items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Popular Sourcing Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Trending:
          </span>
          {POPULAR_SEARCH_CHIPS.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Quick Sourcing Action Callouts */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            onClick={onOpenCreateRfq}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white transition-colors bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-500/30 cursor-pointer shadow-xs"
          >
            <span>Need supplier quotes in 24h?</span>
            <span className="underline decoration-amber-300 underline-offset-4 text-amber-300 font-bold">Post Custom RFQ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-white/30 hidden sm:inline">•</span>
          <button
            onClick={() => onOpenLiveTool('incoterms')}
            className="flex items-center gap-1.5 text-xs text-sky-300 hover:text-white transition-colors bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-500/30 cursor-pointer shadow-xs"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>FOB / CIF Landed Cost &amp; Freight Calculator</span>
          </button>
        </div>

        {/* Platform Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-800">
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center flex flex-col justify-center min-w-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-white font-mono tracking-tight break-words truncate">
              {hp.tradeVolumeGmv || '$142M+'}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-1 leading-snug line-clamp-2">
              {hp.tradeVolumeGmvLabel || 'Escrow Settled Volume'}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center flex flex-col justify-center min-w-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-400 font-mono tracking-tight break-words truncate">
              {hp.supportedCountriesCount || '180+'}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-1 leading-snug line-clamp-2">
              {hp.supportedCountriesLabel || 'Export Corridors'}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center flex flex-col justify-center min-w-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-sky-300 font-mono tracking-tight break-words truncate">
              {hp.verifiedBuyersCount || '45,000+'}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-1 leading-snug line-clamp-2">
              {hp.verifiedBuyersLabel || 'Verified Importers'}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center flex flex-col justify-center min-w-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-amber-400 font-mono tracking-tight break-words truncate">
              {hp.activeSuppliersCount || '12,500+'}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-1 leading-snug line-clamp-2">
              {hp.activeSuppliersLabel || 'Audited Factories'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
