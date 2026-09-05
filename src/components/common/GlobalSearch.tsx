import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Package, 
  Factory, 
  FileText, 
  ChevronRight, 
  X, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Cpu, 
  Radio, 
  Zap, 
  Laptop, 
  Tractor, 
  Layers, 
  Shirt, 
  Wheat, 
  Car, 
  Stethoscope, 
  Sun, 
  Pickaxe, 
  CornerDownLeft, 
  Sparkles,
  Tag
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { MOCK_PRODUCTS, MOCK_COMPANIES, MOCK_RFQS, CATEGORIES_TREE, CURRENCY_RATES } from '../../data/mockData';
import { ActiveView, Product, Currency } from '../../types';

export interface GlobalSearchProps {
  onNavigate: (view: ActiveView | string, props?: any) => void;
  products?: Product[];
  selectedCurrency?: Currency;
  onSelectProduct?: (product: Product) => void;
  onNavigateToCategory?: (category: string, subcategory?: string) => void;
  onNavigateToSearch?: (query: string) => void;
}

interface CategoryMatch {
  id: string;
  name: string;
  matchedSubcategory?: string;
  count?: string;
  iconName?: string;
}

const TRENDING_CATEGORIES = [
  'Construction & Excavation Machinery',
  'Industrial Machinery & Automation',
  'Electrical Household & Other Goods, Components',
  'Electronics & Communications',
  'Welding & Soldering Equipment',
  'Computer Software & Hardware'
];

const POPULAR_SEARCH_TERMS = [
  'Excavator',
  'Solar Inverter',
  'CNC Lathe',
  'Copper Cathode',
  'Hydraulic Pump',
  'Welding Machine'
];

// Helper to highlight matching characters
const HighlightText: React.FC<{ text: string; highlight: string; className?: string }> = ({ 
  text, 
  highlight, 
  className = '' 
}) => {
  if (!highlight.trim() || !text) {
    return <span className={className}>{text}</span>;
  }
  const cleanHighlight = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${cleanHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200/90 text-slate-950 font-black rounded-xs px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Dynamic Category Icon mapper
const CategoryIcon: React.FC<{ name?: string; className?: string }> = ({ name, className = 'w-4 h-4' }) => {
  const norm = (name || '').toLowerCase();
  if (norm.includes('tractor') || norm.includes('construct') || norm.includes('excavat')) {
    return <Tractor className={className} />;
  }
  if (norm.includes('flame') || norm.includes('weld')) {
    return <Flame className={className} />;
  }
  if (norm.includes('laptop') || norm.includes('computer') || norm.includes('software')) {
    return <Laptop className={className} />;
  }
  if (norm.includes('zap') || norm.includes('electric') || norm.includes('power')) {
    return <Zap className={className} />;
  }
  if (norm.includes('radio') || norm.includes('electronic') || norm.includes('comm')) {
    return <Radio className={className} />;
  }
  if (norm.includes('cpu') || norm.includes('machin') || norm.includes('auto')) {
    return <Cpu className={className} />;
  }
  if (norm.includes('shirt') || norm.includes('textile') || norm.includes('apparel') || norm.includes('cloth')) {
    return <Shirt className={className} />;
  }
  if (norm.includes('wheat') || norm.includes('agri') || norm.includes('food')) {
    return <Wheat className={className} />;
  }
  if (norm.includes('car') || norm.includes('vehicle') || norm.includes('auto')) {
    return <Car className={className} />;
  }
  if (norm.includes('steth') || norm.includes('medic') || norm.includes('health')) {
    return <Stethoscope className={className} />;
  }
  if (norm.includes('sun') || norm.includes('solar') || norm.includes('energy')) {
    return <Sun className={className} />;
  }
  if (norm.includes('pick') || norm.includes('metal') || norm.includes('scrap') || norm.includes('gold') || norm.includes('copper')) {
    return <Pickaxe className={className} />;
  }
  return <Layers className={className} />;
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onNavigate,
  products = MOCK_PRODUCTS,
  selectedCurrency = 'USD',
  onSelectProduct,
  onNavigateToCategory,
  onNavigateToSearch
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'CATEGORIES' | 'PRODUCTS' | 'SUPPLIERS' | 'RFQS'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tradeheaven_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, 6);
        localStorage.setItem('tradeheaven_recent_searches', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('tradeheaven_recent_searches');
      setRecentSearches([]);
    } catch {}
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format price in active currency
  const formatPrice = (priceUsd?: number) => {
    if (!priceUsd || priceUsd <= 0) return 'Inquire Price';
    const rateInfo = CURRENCY_RATES.find(c => c.code === selectedCurrency) || { rateToUSD: 1.0, symbol: '$' };
    const converted = priceUsd * (rateInfo.rateToUSD || 1.0);
    const symbol = rateInfo.symbol || '$';
    if (converted >= 10000) {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    if (converted >= 100) {
      return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  const normalizedQuery = (query || '').toLowerCase().trim();

  // 1. Real-time Category Matches
  const categoryResults: CategoryMatch[] = useMemo(() => {
    if (!normalizedQuery) return [];
    
    // Combine CATEGORIES_TREE and any unique categories from products
    const seen = new Set<string>();
    const matches: CategoryMatch[] = [];

    // Check CATEGORIES_TREE
    (CATEGORIES_TREE || []).forEach(cat => {
      const catName = cat.name || '';
      const catLower = catName.toLowerCase();
      const subs = cat.subcategories || [];
      
      const isCatMatch = catLower.includes(normalizedQuery);
      const matchedSub = subs.find(s => s.toLowerCase().includes(normalizedQuery));

      if (isCatMatch || matchedSub) {
        seen.add(catLower);
        matches.push({
          id: cat.id || `cat-${catLower.replace(/\s+/g, '-')}`,
          name: catName,
          matchedSubcategory: matchedSub,
          count: cat.count || 'Wholesale Directory',
          iconName: cat.icon || 'Layers'
        });
      }
    });

    // Also check product catalog categories not yet in tree
    const productCatalog = products && products.length > 0 ? products : MOCK_PRODUCTS;
    productCatalog.forEach(p => {
      if (p.category) {
        const cLower = p.category.toLowerCase();
        if (!seen.has(cLower) && cLower.includes(normalizedQuery)) {
          seen.add(cLower);
          matches.push({
            id: `prod-cat-${cLower.replace(/\s+/g, '-')}`,
            name: p.category,
            matchedSubcategory: p.subCategory?.toLowerCase().includes(normalizedQuery) ? p.subCategory : undefined,
            count: 'Verified Products',
            iconName: 'Package'
          });
        }
      }
    });

    return matches.slice(0, 5);
  }, [normalizedQuery, products]);

  // 2. Real-time Product Matches
  const productResults: Product[] = useMemo(() => {
    if (!normalizedQuery) return [];
    const sourceProducts = products && products.length > 0 ? products : MOCK_PRODUCTS;

    const scored: { product: Product; score: number }[] = [];

    sourceProducts.forEach(p => {
      const title = (p.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const sub = (p.subCategory || '').toLowerCase();
      const sup = (p.supplierName || '').toLowerCase();

      let score = 0;
      if (title === normalizedQuery) score += 100;
      else if (title.startsWith(normalizedQuery)) score += 60;
      else if (title.includes(normalizedQuery)) score += 40;

      if (sub === normalizedQuery) score += 35;
      else if (sub.includes(normalizedQuery)) score += 25;

      if (cat.includes(normalizedQuery)) score += 20;
      if (sup.includes(normalizedQuery)) score += 15;

      if (score > 0) {
        scored.push({ product: p, score });
      }
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product).slice(0, 6);
  }, [normalizedQuery, products]);

  // 3. Real-time Suppliers Matches
  const supplierResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_COMPANIES.filter(c => {
      const companyName = (c.companyName || '').toLowerCase();
      const businessType = (c.businessType || '').toLowerCase();
      const country = (c.country || '').toLowerCase();
      return companyName.includes(normalizedQuery) || businessType.includes(normalizedQuery) || country.includes(normalizedQuery);
    }).slice(0, 3);
  }, [normalizedQuery]);

  // 4. Real-time RFQs Matches
  const rfqResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_RFQS.filter(r => {
      const name = (r.productName || r.title || '').toLowerCase();
      const category = (r.category || '').toLowerCase();
      const buyerCountry = (r.buyerCountry || '').toLowerCase();
      return name.includes(normalizedQuery) || category.includes(normalizedQuery) || buyerCountry.includes(normalizedQuery);
    }).slice(0, 3);
  }, [normalizedQuery]);

  const totalResultsCount = categoryResults.length + productResults.length + supplierResults.length + rfqResults.length;

  // Flatten active navigable items for keyboard navigation
  const navigableItems = useMemo(() => {
    const items: Array<{ type: 'CATEGORY' | 'PRODUCT' | 'SUPPLIER' | 'RFQ'; data: any }> = [];
    if (activeFilterTab === 'ALL' || activeFilterTab === 'CATEGORIES') {
      categoryResults.forEach(c => items.push({ type: 'CATEGORY', data: c }));
    }
    if (activeFilterTab === 'ALL' || activeFilterTab === 'PRODUCTS') {
      productResults.forEach(p => items.push({ type: 'PRODUCT', data: p }));
    }
    if (activeFilterTab === 'ALL' || activeFilterTab === 'SUPPLIERS') {
      supplierResults.forEach(s => items.push({ type: 'SUPPLIER', data: s }));
    }
    if (activeFilterTab === 'ALL' || activeFilterTab === 'RFQS') {
      rfqResults.forEach(r => items.push({ type: 'RFQ', data: r }));
    }
    return items;
  }, [activeFilterTab, categoryResults, productResults, supplierResults, rfqResults]);

  // Reset selected index when query or tab changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, activeFilterTab]);

  // Handlers for selection
  const handleSelectCategory = (cat: CategoryMatch) => {
    saveRecentSearch(cat.matchedSubcategory || cat.name);
    setIsOpen(false);
    if (onNavigateToCategory) {
      onNavigateToCategory(cat.name, cat.matchedSubcategory);
    } else {
      onNavigate('PRODUCT_DIRECTORY', { 
        category: cat.name, 
        search: cat.matchedSubcategory || '' 
      });
    }
  };

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.title);
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      onNavigate('PRODUCT_DIRECTORY', { 
        productId: product.id, 
        search: product.title 
      });
    }
  };

  const handleSelectSupplier = (companyName: string) => {
    saveRecentSearch(companyName);
    setIsOpen(false);
    onNavigate('SUPPLIERS_DIRECTORY', { search: companyName });
  };

  const handleSelectRfq = (rfqTitle: string) => {
    saveRecentSearch(rfqTitle);
    setIsOpen(false);
    onNavigate('RFQ_HUB', { search: rfqTitle });
  };

  const handleExecuteFullSearch = (searchQuery: string) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;
    saveRecentSearch(finalQuery);
    setIsOpen(false);
    if (onNavigateToSearch) {
      onNavigateToSearch(finalQuery);
    } else {
      onNavigate('PRODUCT_DIRECTORY', { search: finalQuery });
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex(prev => (prev < navigableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : navigableItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
        const item = navigableItems[selectedIndex];
        if (item.type === 'CATEGORY') handleSelectCategory(item.data);
        else if (item.type === 'PRODUCT') handleSelectProduct(item.data);
        else if (item.type === 'SUPPLIER') handleSelectSupplier(item.data.companyName);
        else if (item.type === 'RFQ') handleSelectRfq(item.data.productName || item.data.title);
      } else {
        handleExecuteFullSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative z-50 shrink-0" ref={wrapperRef}>
      {/* Search Input Bar */}
      <div 
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="relative group flex items-center"
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          id="marketplace-header-search-input"
          placeholder="Search products, categories, suppliers..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions-popup"
          className="w-[140px] xs:w-[180px] sm:w-56 md:w-64 lg:w-72 xl:w-80 pl-9 pr-8 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50/90 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 transition-all text-xs sm:text-xs font-medium text-slate-900 placeholder-slate-400 outline-none shadow-2xs"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 p-0.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 text-[10px] text-slate-400 font-mono pointer-events-none">
            <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px]">↵</kbd>
          </div>
        )}
      </div>

      {/* Auto-Suggestion Floating Popup */}
      {isOpen && (
        <div 
          id="search-suggestions-popup"
          role="listbox"
          className="absolute top-full right-0 mt-2 w-[calc(100vw-24px)] sm:w-[440px] md:w-[490px] max-w-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[82vh] flex flex-col"
        >
          {/* TOP SECTION: WHEN QUERY IS TYPED */}
          {normalizedQuery.length > 0 ? (
            <>
              {/* Category & Filter Tabs Header */}
              <div className="px-3 pt-2.5 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto shrink-0 scrollbar-none">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      activeFilterTab === 'ALL'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    All ({totalResultsCount})
                  </button>

                  {categoryResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('CATEGORIES')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeFilterTab === 'CATEGORIES'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Categories ({categoryResults.length})</span>
                    </button>
                  )}

                  {productResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('PRODUCTS')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeFilterTab === 'PRODUCTS'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Package className="w-3 h-3" />
                      <span>Products ({productResults.length})</span>
                    </button>
                  )}

                  {supplierResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('SUPPLIERS')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        activeFilterTab === 'SUPPLIERS'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      Suppliers ({supplierResults.length})
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Real-time</span>
              </div>

              {/* RESULTS LIST BODY */}
              <div className="overflow-y-auto py-2 divide-y divide-slate-100 flex-1">
                
                {/* 1. CATEGORY AUTO-SUGGESTIONS (Top Priority when matching) */}
                {(activeFilterTab === 'ALL' || activeFilterTab === 'CATEGORIES') && categoryResults.length > 0 && (
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <h4 className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>Matching Categories ({categoryResults.length})</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">Direct directory filter</span>
                    </div>

                    <div className="space-y-1">
                      {categoryResults.map((cat, idx) => {
                        const itemIndex = navigableItems.findIndex(item => item.type === 'CATEGORY' && item.data.id === cat.id);
                        const isSelected = selectedIndex === itemIndex;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectCategory(cat)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer border ${
                              isSelected 
                                ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' 
                                : 'hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                                <CategoryIcon name={cat.iconName || cat.name} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    <HighlightText text={cat.name} highlight={query} />
                                  </p>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                    Category
                                  </span>
                                </div>
                                {cat.matchedSubcategory ? (
                                  <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
                                    <Tag className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span>Subcategory: </span>
                                    <span className="font-semibold text-emerald-800">
                                      <HighlightText text={cat.matchedSubcategory} highlight={query} />
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                    {cat.count}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-emerald-700">
                              <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Browse</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. PRODUCT AUTO-SUGGESTIONS */}
                {(activeFilterTab === 'ALL' || activeFilterTab === 'PRODUCTS') && productResults.length > 0 && (
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <h4 className="text-[10px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-blue-600" />
                        <span>Matching Products ({productResults.length})</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">Verified factory inventory</span>
                    </div>

                    <div className="space-y-1">
                      {productResults.map((product) => {
                        const itemIndex = navigableItems.findIndex(item => item.type === 'PRODUCT' && item.data.id === product.id);
                        const isSelected = selectedIndex === itemIndex;
                        const mainImage = (product.images && product.images[0]) || '';

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer border ${
                              isSelected 
                                ? 'bg-blue-50/90 border-blue-300 shadow-2xs' 
                                : 'hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                                <SafeImage 
                                  src={mainImage} 
                                  alt={product.title} 
                                  category={product.category}
                                  type="product"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                                  <HighlightText text={product.title} highlight={query} />
                                </p>
                                
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs font-black text-emerald-800">
                                    {formatPrice(product.fobPriceUsd)}
                                    {product.moqUnit ? ` / ${product.moqUnit}` : ''}
                                  </span>
                                  {product.moq && (
                                    <span className="text-[10px] text-slate-500">
                                      MOQ: {product.moq} {product.moqUnit || 'units'}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate mt-0.5">
                                  <span className="font-medium text-slate-700 truncate">{product.supplierName}</span>
                                  {product.supplierCountry && (
                                    <>
                                      <span>•</span>
                                      <span>{product.supplierCountry}</span>
                                    </>
                                  )}
                                  <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-blue-600">
                              <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">View</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. SUPPLIER AUTO-SUGGESTIONS (Optional/Secondary) */}
                {(activeFilterTab === 'ALL' || activeFilterTab === 'SUPPLIERS') && supplierResults.length > 0 && (
                  <div className="px-2 py-1.5">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1.5 px-2 flex items-center gap-1.5">
                      <Factory className="w-3 h-3 text-slate-500" />
                      <span>Verified Suppliers ({supplierResults.length})</span>
                    </h4>

                    <div className="space-y-1">
                      {supplierResults.map((company) => {
                        const itemIndex = navigableItems.findIndex(item => item.type === 'SUPPLIER' && item.data.id === company.id);
                        const isSelected = selectedIndex === itemIndex;

                        return (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleSelectSupplier(company.companyName)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer border ${
                              isSelected 
                                ? 'bg-amber-50/90 border-amber-300 shadow-2xs' 
                                : 'hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                <HighlightText text={company.companyName} highlight={query} />
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {company.businessType} • {company.country} • Verified Supplier
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. RFQ BUY LEADS (Optional/Secondary) */}
                {(activeFilterTab === 'ALL' || activeFilterTab === 'RFQS') && rfqResults.length > 0 && (
                  <div className="px-2 py-1.5">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1.5 px-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>Buy Requirements / RFQs ({rfqResults.length})</span>
                    </h4>

                    <div className="space-y-1">
                      {rfqResults.map((rfq) => {
                        const itemIndex = navigableItems.findIndex(item => item.type === 'RFQ' && item.data.id === rfq.id);
                        const isSelected = selectedIndex === itemIndex;
                        const rfqTitle = rfq.productName || rfq.title || 'Buy Requirement';

                        return (
                          <button
                            key={rfq.id}
                            type="button"
                            onClick={() => handleSelectRfq(rfqTitle)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer border ${
                              isSelected 
                                ? 'bg-indigo-50/90 border-indigo-300 shadow-2xs' 
                                : 'hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                <HighlightText text={rfqTitle} highlight={query} />
                                {rfq.targetQuantity ? ` (${rfq.targetQuantity} ${rfq.quantityUnit || ''})` : ''}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {rfq.destinationPort || 'Global Port'} • Buyer in {rfq.buyerCountry || 'Verified'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ZERO MATCHES FALLBACK */}
                {totalResultsCount === 0 && (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No exact matches for &quot;{query}&quot;</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Search all industrial directories or try a broader category keyword.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => handleExecuteFullSearch(query)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search &quot;{query}&quot; across full catalog</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* POPUP FOOTER: Full Search Action & Keyboard Tips */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExecuteFullSearch(query)}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-bold text-slate-800 hover:text-blue-700 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">View all catalog results for &quot;{query}&quot;</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0 font-mono">
                  <span>↑↓ Navigate</span>
                  <span>•</span>
                  <span>↵ Select</span>
                </div>
              </div>
            </>
          ) : (
            /* ZERO-QUERY INITIAL FOCUS STATE: Recent Searches & Trending Categories */
            <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          handleExecuteFullSearch(term);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories / Fast Jumps */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Popular Sourcing Categories
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5">
                  {TRENDING_CATEGORIES.map((catName) => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => {
                        if (onNavigateToCategory) {
                          onNavigateToCategory(catName);
                        } else {
                          onNavigate('PRODUCT_DIRECTORY', { category: catName });
                        }
                        setIsOpen(false);
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-left transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-blue-600">
                        <CategoryIcon name={catName} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                        {catName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Sourcing Queries */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 px-1 block">
                  Trending Industrial Terms
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {POPULAR_SEARCH_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setIsOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50 text-[11px] font-bold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-1">
                Type 1 or more letters to get instant category &amp; product matches.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

