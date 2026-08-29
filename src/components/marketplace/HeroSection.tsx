import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShieldCheck, 
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
  Filter,
  Lock,
  LayoutGrid
} from 'lucide-react';
import { CATEGORIES_TREE, MOCK_COMPANIES, MOCK_RFQS, CURRENCY_RATES, GLOBAL_B2B_TRADE_METRICS } from '../../data/mockData';
import { Product, Currency, ActiveView, CompanyProfile, RfqRequirement } from '../../types';
import { useSiteContent } from '../../context/SiteContentContext';
import { SafeImage } from '../common/SafeImage';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface Props {
  onSearch: (query: string, category: string) => void;
  onOpenCreateRfq: () => void;
  onOpenLiveTool: (tool: 'incoterms' | 'rfq_checker' | 'api_sandbox') => void;
  products?: Product[];
  rfqs?: RfqRequirement[];
  selectedCurrency?: Currency;
  onSelectProduct?: (product: Product) => void;
  onOpenStorefront?: (companyId: string) => void;
  onNavigate?: (view: ActiveView) => void;
  onSelectRfq?: (rfq: RfqRequirement) => void;
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
    name: 'Direct Trade Negotiation Room & trade protection',
    category: 'trade protection Services',
    description: 'Chat directly with factory export directors, draft digital sales contracts & lock Swiss trade protection funds.',
    actionType: 'view',
    viewTarget: 'NEGOTIATION_ROOM',
    badge: 'trade protection Safe'
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
    description: 'Unlock direct unmasked supplier contact details, verified factory audits, and priority trade protection lines.',
    actionType: 'view',
    viewTarget: 'PREMIUM_MEMBERSHIP',
    badge: 'VIP Service'
  }
];

const POPULAR_SEARCH_CHIPS = [
  'Active Buy Leads',
  'High-Value RFQs',
  'Post Factory Catalog',
  'Verified Importers',
  'Bulk Trade Deals',
  'Escrow Orders',
  'Export Financing'
];

export const HeroSection: React.FC<Props> = ({
  onSearch,
  onOpenCreateRfq,
  onOpenLiveTool,
  products = [],
  rfqs = [],
  selectedCurrency = 'USD',
  onSelectProduct,
  onOpenStorefront,
  onNavigate,
  onSelectRfq
}) => {
  const { siteContent, isLiveEditMode, openQuickEdit, currentUser, isUserAuthorized } = useSiteContent();
  const auth = isUserAuthorized(currentUser);
  const isAdmin = auth.isAuthorized;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [searchTargetMode, setSearchTargetMode] = useState<'PRODUCTS' | 'RFQS' | 'SUPPLIERS'>('PRODUCTS');
  
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
    return (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };
  }, [selectedCurrency]);

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const activeRfqPool = useMemo(() => (rfqs && rfqs.length > 0 ? rfqs : MOCK_RFQS), [rfqs]);

  // Full-Site Multi-Index Search Query Matcher
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      const defaultRfqs = activeRfqPool.slice(0, 40);
      const defaultProducts = products.slice(0, 16);
      const defaultSuppliers = MOCK_COMPANIES.slice(0, 16);
      const defaultTools = SITE_TOOLS.slice(0, 6);
      const defaultTradeMetrics = (GLOBAL_B2B_TRADE_METRICS || []).slice(0, 8);
      return {
        products: defaultProducts,
        suppliers: defaultSuppliers,
        rfqs: defaultRfqs,
        categories: defaultTradeMetrics,
        tools: defaultTools,
        totalCount: defaultProducts.length + defaultSuppliers.length + defaultRfqs.length + defaultTools.length + defaultTradeMetrics.length
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
    }).slice(0, 16);

    // 2. Match Verified Suppliers & Manufacturers
    const matchedSuppliers = MOCK_COMPANIES.filter(c => {
      return (
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.businessType && c.businessType.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.contactPhone && c.contactPhone.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        ((c.certifications || []).some(cert => cert && cert.toLowerCase().includes(q)))
      );
    }).slice(0, 16);

    // 3. Match RFQs & Buy Leads (Searches live database feed)
    const matchedRfqs = activeRfqPool.filter(r => {
      const pName = (r.productName || '').toLowerCase();
      const bCompany = (r.buyerCompany || '').toLowerCase();
      const bName = (r.buyerName || '').toLowerCase();
      const bCountry = (r.buyerCountry || '').toLowerCase();
      const desc = (r.detailedRequirements || r.detailedDescription || '').toLowerCase();
      const cat = (r.category || '').toLowerCase();
      const port = (r.destinationPort || '').toLowerCase();
      const inco = (r.preferredIncoterm || '').toLowerCase();
      const pay = (r.paymentTerms || '').toLowerCase();
      const targetPrice = (r.targetPriceUsd ? String(r.targetPriceUsd) : '').toLowerCase();
      const rfqId = (r.id || '').toLowerCase();

      return (
        pName.includes(q) ||
        bCompany.includes(q) ||
        bName.includes(q) ||
        bCountry.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        port.includes(q) ||
        inco.includes(q) ||
        pay.includes(q) ||
        targetPrice.includes(q) ||
        rfqId.includes(q)
      );
    }).slice(0, 30);

    // 4. Match Categories & Subcategories Trade Metrics
    const matchedTradeMetrics = (GLOBAL_B2B_TRADE_METRICS || []).filter(m => {
      return (
        m.main_category.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q)
      );
    }).slice(0, 16);

    // 5. Match Site Tools & Services
    const matchedTools = SITE_TOOLS.filter(t => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }).slice(0, 6);

    const totalCount = 
      matchedProducts.length + 
      matchedSuppliers.length + 
      matchedRfqs.length + 
      matchedTradeMetrics.length + 
      matchedTools.length;

    return {
      products: matchedProducts,
      suppliers: matchedSuppliers,
      rfqs: matchedRfqs,
      categories: matchedTradeMetrics,
      tools: matchedTools,
      totalCount
    };
  }, [searchQuery, selectedCat, products, rfqs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchPopoverOpen(false);
    setIsCategoryMenuOpen(false);
    onSearch(searchQuery, selectedCat === 'All Categories' ? '' : selectedCat);
    if (onNavigate) {
      if (searchTargetMode === 'RFQS') {
        onNavigate('BUY_LEADS');
      } else if (searchTargetMode === 'SUPPLIERS') {
        onNavigate('SUPPLIERS_DIRECTORY');
      } else {
        onNavigate('PRODUCT_DIRECTORY');
      }
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
    if (onSelectRfq) {
      onSelectRfq(rfq);
    }
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
    <div id="trade-heaven-hero" className="relative bg-slate-900 overflow-hidden min-h-[580px] rounded-3xl flex items-center shadow-2xl border border-slate-800 group">
      
      {/* Live Visual Edit Trigger Button (Strictly Admin / Creator Only) */}
      {isAdmin && isLiveEditMode && (
        <button
          type="button"
          onClick={() => openQuickEdit('HERO')}
          className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl hover:bg-blue-500 transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Hero Content</span>
        </button>
      )}

      {/* Background Image with Professional Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={hp.heroBgImage || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80"} 
          alt="Global B2B Logistics and Trade Shipping Port" 
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        {/* Balanced gradient overlay ensuring high text readability while keeping port colors luminous */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-slate-900/25"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-md mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">🚀 For Exporters & Manufacturers • 125k+ Active Buyers</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-6 flex flex-wrap gap-2">
            <EditableText contentKey="homepage.heroHeadline" defaultText="Close Deals with" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              <EditableText contentKey="homepage.heroHeadlineGradient" defaultText="Verified High-Intent" />
            </span>
            Global Buyers.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl font-normal leading-relaxed">
            <EditableText contentKey="homepage.heroSubheadline" defaultText="Empower your factory export pipeline with instant access to high-value buy leads, verified RFQ broadcasts, direct buyer chats, and Swiss escrow trade protection." />
          </p>

        {/* ------------------------------------------------------------- */}
        {/* ENHANCED PROFESSIONAL OMNIBAR SEARCH & DOWNWARD MENUS */}
        {/* ------------------------------------------------------------- */}
        <div ref={containerRef} className="relative max-w-4xl">

          {/* Search Target Mode Switcher Pills */}
          <div className="flex items-center gap-2 mb-2.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSearchTargetMode('PRODUCTS');
                setActiveFilter('PRODUCTS');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                searchTargetMode === 'PRODUCTS'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700/80'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchTargetMode('RFQS');
                setActiveFilter('RFQS');
                setIsSearchPopoverOpen(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                searchTargetMode === 'RFQS'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md ring-2 ring-emerald-400/50'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live RFQs &amp; Buy Leads</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-pulse">
                LIVE
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchTargetMode('SUPPLIERS');
                setActiveFilter('SUPPLIERS');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                searchTargetMode === 'SUPPLIERS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Audited Suppliers</span>
            </button>
          </div>

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
                    setIsSearchPopoverOpen(true);
                  }}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setIsSearchPopoverOpen(true);
                  }}
                  placeholder={
                    searchTargetMode === 'RFQS'
                      ? "Search 1,200+ active RFQs by product, port, Incoterms, buyer country, or ID..."
                      : searchTargetMode === 'SUPPLIERS'
                      ? "Search verified factories, suppliers, certifications, and countries..."
                      : hp.searchPlaceholder || "Search products, materials, factories, RFQs, or Incoterms tools..."
                  }
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
                className={`w-full sm:w-auto font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm shrink-0 cursor-pointer flex items-center justify-center gap-2 ${
                  searchTargetMode === 'RFQS'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black ring-2 ring-emerald-400/50'
                    : searchTargetMode === 'SUPPLIERS'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>
                  {searchTargetMode === 'RFQS'
                    ? 'Search Live RFQs'
                    : searchTargetMode === 'SUPPLIERS'
                    ? 'Search Suppliers'
                    : 'Source Products'}
                </span>
              </button>
            </div>
          </form>

          {/* ------------------------------------------------------------- */}
          {/* FULL-SITE LIVE SEARCH RESULTS POPOVER (OPENS DOWNWARDS) */}
          {/* ------------------------------------------------------------- */}
          {isSearchPopoverOpen && (
            <div 
              id="hero-omnibar-results-popover"
              className="absolute top-full left-0 right-0 mt-2.5 z-40 bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* Header with Search Query & Filter Tabs */}
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {searchQuery.trim() ? (
                      <>Search results for <span className="text-amber-400 font-black">"{searchQuery}"</span></>
                    ) : (
                      <>Live RFQs &amp; International Sourcing Directory</>
                    )}
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
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === 'ALL'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>All</span>
                  </button>

                  {searchResults.rfqs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('RFQS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'RFQS'
                          ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700/60'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>RFQs</span>
                    </button>
                  )}

                  {searchResults.products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('PRODUCTS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'PRODUCTS'
                          ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700/60'
                      }`}
                    >
                      <Package className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>Products</span>
                    </button>
                  )}

                  {searchResults.suppliers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('SUPPLIERS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'SUPPLIERS'
                          ? 'bg-purple-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700/60'
                      }`}
                    >
                      <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>Suppliers</span>
                    </button>
                  )}

                  {searchResults.tools.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('TOOLS')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'TOOLS'
                          ? 'bg-indigo-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700/60'
                      }`}
                    >
                      <Wrench className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Tools</span>
                    </button>
                  )}

                  {searchResults.categories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('CATEGORIES')}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'CATEGORIES'
                          ? 'bg-blue-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700/60'
                      }`}
                    >
                      <Layers className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>Trade Metrics</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Results Feed */}
              <div className="max-h-[500px] sm:max-h-[560px] overflow-y-auto p-4 space-y-5">
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
                    {/* SECTION 1: MATCHED BUY LEADS & RFQS */}
                    {(activeFilter === 'ALL' || activeFilter === 'RFQS') && searchResults.rfqs.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            Active RFQs &amp; Buy Leads ({searchResults.rfqs.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSearchPopoverOpen(false);
                              onNavigate('BUY_LEADS');
                            }}
                            className="text-[11px] text-emerald-600 font-bold hover:underline normal-case flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View all buy leads</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(activeFilter === 'ALL' ? searchResults.rfqs.slice(0, 6) : searchResults.rfqs).map(rfq => (
                            <div
                              key={rfq.id}
                              onClick={() => handleRfqClick(rfq)}
                              className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer space-y-2 group/item bg-white shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                                    {rfq.id}
                                  </span>
                                  <div className="text-xs font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors line-clamp-1">
                                    {rfq.productName}
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                  {rfq.quotesCount} Bids
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                <div>
                                  <span className="text-slate-400">Target Vol:</span>{' '}
                                  <strong className="text-slate-900">{rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">Port:</span>{' '}
                                  <strong className="text-slate-800 truncate">{rfq.destinationPort}</strong>
                                </div>
                                <div className="col-span-2 text-emerald-700 font-bold font-mono pt-0.5 border-t border-slate-100">
                                  {rfq.preferredIncoterm} • {rfq.targetPriceUsd ? formatPrice(rfq.targetPriceUsd) : 'Market Quote'}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-100 gap-1">
                                <span className="truncate">Buyer: <strong className="text-slate-800">{rfq.buyerCompany}</strong> ({rfq.buyerCountry})</span>
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-bold text-[9px] border border-amber-200 shrink-0">
                                  <Lock className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Hidden Contact</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: MATCHED PRODUCTS */}
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
                          {(activeFilter === 'ALL' ? searchResults.products.slice(0, 4) : searchResults.products).map(prod => {
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

                    {/* SECTION 3: MATCHED SUPPLIERS & FACTORIES */}
                    {(activeFilter === 'ALL' || activeFilter === 'SUPPLIERS') && searchResults.suppliers.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            Audited Manufacturers ({searchResults.suppliers.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSearchPopoverOpen(false);
                              onNavigate('SUPPLIERS_DIRECTORY');
                            }}
                            className="text-[11px] text-amber-600 font-bold hover:underline normal-case flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View all suppliers</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(activeFilter === 'ALL' ? searchResults.suppliers.slice(0, 4) : searchResults.suppliers).map(supp => (
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

                    {/* SECTION 4: MATCHED TOOLS & SERVICES */}
                    {(activeFilter === 'ALL' || activeFilter === 'TOOLS') && searchResults.tools.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                            Platform Tools &amp; Services ({searchResults.tools.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSearchPopoverOpen(false);
                              onNavigate('INCOTERMS_CALCULATOR');
                            }}
                            className="text-[11px] text-indigo-600 font-bold hover:underline normal-case flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Explore tools</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
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

                    {/* SECTION 5: MATCHED B2B TRADE METRICS & CATEGORIES */}
                    {(activeFilter === 'ALL' || activeFilter === 'CATEGORIES') && searchResults.categories.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            Verified B2B Trade Metrics &amp; Categories ({searchResults.categories.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSearchPopoverOpen(false);
                              if (onNavigate) onNavigate('PRODUCT_DIRECTORY');
                            }}
                            className="text-[11px] text-blue-600 font-bold hover:underline normal-case flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Browse categories</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.categories.map((metric, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setIsSearchPopoverOpen(false);
                                onSearch(metric.subcategory, metric.main_category);
                                if (onNavigate) onNavigate('PRODUCT_DIRECTORY');
                              }}
                              className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer space-y-2 group/item bg-white shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[180px]">
                                  {metric.main_category}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                  {metric.growth_trend}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-slate-900 group-hover/item:text-blue-700 transition-colors">
                                {metric.subcategory}
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="text-slate-500">Suppliers:</span>{' '}
                                  <strong className="text-slate-900 font-mono">{metric.total_verified_suppliers.toLocaleString()}</strong>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="text-slate-500">Buy Leads:</span>{' '}
                                  <strong className="text-slate-900 font-mono">{metric.total_buying_leads_rfqs.toLocaleString()}</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Popover Footer Action */}
              <div className="p-3 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-amber-400 font-bold">Enter</kbd>
                  <span>Press Enter to explore full catalog</span>
                </span>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
                >
                  <span>View All {searchResults.totalCount} Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

          {/* Trust Metrics */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              100% Verified Manufacturers
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Secure Cross-Border trade protection
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Zero Middleman Markup
            </span>
          </div>

          {/* Popular Sourcing Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-6 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Popular:
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
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={onOpenCreateRfq}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white transition-colors bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-500/30 cursor-pointer shadow-xs"
            >
              <span>Need supplier quotes in 24h?</span>
              <span className="underline decoration-blue-300 underline-offset-4 text-blue-300 font-bold">Post Custom RFQ</span>
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
        </div>
      </div>
    </div>
  );
};
