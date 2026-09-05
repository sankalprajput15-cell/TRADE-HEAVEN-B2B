import React, { useState, useEffect } from 'react';
import { Product, Currency, SupplierTier, Incoterm } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { SafeImage } from '../common/SafeImage';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Award, 
  SlidersHorizontal, 
  Grid, 
  List, 
  ArrowUpDown,
  Building, 
  ExternalLink,
  MessageCircle,
  Package,
  Layers,
  Lock
} from 'lucide-react';
import { ProductCatalogGrid, ProductListSkeleton } from './ProductCatalogGrid';

interface Props {
  products: Product[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenStorefront: (supplierId: string) => void;
  onContactSupplier: (product: Product) => void;
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
  initialCategory?: string;
  initialSearch?: string;
  isLoading?: boolean;
}

export const ProductCatalog: React.FC<Props> = ({
  products,
  selectedCurrency,
  onSelectProduct,
  onOpenStorefront,
  onContactSupplier,
  selectedCategory: propCategory,
  onCategoryChange,
  initialCategory,
  initialSearch,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [internalCategory, setInternalCategory] = useState<string>(initialCategory || propCategory || 'ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>('ALL');
  const [maxMoq, setMaxMoq] = useState<number>(50000);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'MINE' | 'OTHERS'>('ALL');
  const [cachedProducts, setCachedProducts] = useState<Product[]>(products);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isUsingCache, setIsUsingCache] = useState<boolean>(false);

  // Connection monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOffline(!navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache products to localStorage when they update
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('cached_products', JSON.stringify(products));
      setCachedProducts(products);
      setIsUsingCache(false);
    }
  }, [products]);

  // Load from cache on mount or if offline/missing products prop
  useEffect(() => {
    if (products.length === 0 || isOffline) {
      const cached = localStorage.getItem('cached_products');
      if (cached) {
        setCachedProducts(JSON.parse(cached));
        setIsUsingCache(true);
      }
    } else if (products.length > 0) {
      setCachedProducts(products);
      setIsUsingCache(false);
    }
  }, [products, isOffline]);

  // Sync external category prop if provided
  useEffect(() => {
    if (propCategory !== undefined) {
      setInternalCategory(propCategory || 'ALL');
    }
  }, [propCategory]);

  useEffect(() => {
    if (initialCategory) {
      setInternalCategory(initialCategory);
    }
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialCategory, initialSearch]);

  const activeCategory = propCategory !== undefined ? (propCategory || 'ALL') : internalCategory;

  const handleCategorySelect = (cat: string) => {
    setInternalCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usdPrice: number) => {
    const val = usdPrice && usdPrice > 0 ? usdPrice : 285;
    const converted = val * curr.rateToUSD;
    if (converted >= 1000) {
      return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    if (converted < 1) {
      return `${curr.symbol}${converted.toFixed(2)}`;
    }
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTierBadge = (tier: SupplierTier) => {
    switch (tier) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" /> VIP
          </span>
        );
      case 'GOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-2xs">
            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-600" /> Gold
          </span>
        );
      case 'SILVER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" /> Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] text-slate-600 bg-slate-100 border border-slate-200">
            Free
          </span>
        );
    }
  };

  // Available unique categories extracted from products
  const availableCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filter logic (Robust matching)
  const filtered = cachedProducts.filter(p => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = term === '' || 
      p.title.toLowerCase().includes(term) ||
      p.supplierName.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term));
      
    const matchesCat = activeCategory === 'ALL' || 
      p.category === activeCategory ||
      p.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      activeCategory.toLowerCase().includes(p.category.toLowerCase());
      
    const matchesTier = selectedTier === 'ALL' || p.supplierTier === selectedTier;
    const matchesIncoterm = selectedIncoterm === 'ALL' || p.supportedIncoterms.includes(selectedIncoterm as Incoterm);
    const matchesMoq = maxMoq >= 50000 || p.moq <= maxMoq;

    const matchesOwnership = ownershipFilter === 'ALL' ||
      (ownershipFilter === 'MINE' && user && (p.ownerEmail === user.email || p.ownerId === user.id)) ||
      (ownershipFilter === 'OTHERS' && (!user || (p.ownerEmail !== user.email && p.ownerId !== user.id)));

    return matchesSearch && matchesCat && matchesTier && matchesIncoterm && matchesMoq && matchesOwnership;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12; // 3x4 / 4x3 product grid (12 items per page)

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, selectedTier, selectedIncoterm, maxMoq, ownershipFilter]);

  // Paginated subset
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div id="product-catalog-section" className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm min-w-0 max-w-full overflow-hidden">
      {/* Offline/Cached Connection Banner */}
      {(isOffline || isUsingCache) && (
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs animate-in fade-in slide-in-from-top-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="truncate">
              {isOffline 
                ? "Intermittent connectivity detected — You are currently offline." 
                : "Using offline backup — Displaying recently loaded product data."}
            </span>
          </div>
          <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded font-mono font-bold shrink-0">CACHED MODE</span>
        </div>
      )}

      {/* Search & Top Controls */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-2xs min-w-0">
        <div className="relative flex-1 w-full min-w-0">
          <Search className="absolute left-3 top-2.5 sm:top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Filter keywords, category, or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 shrink-0 min-w-0">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 cursor-pointer shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <div className="text-[11px] sm:text-xs text-slate-600 font-mono shrink-0">
            {isLoading || (products.length === 0 && !isUsingCache) ? (
              <span className="inline-block w-20 h-3 bg-slate-200 rounded animate-pulse align-middle" />
            ) : (
              <><strong className="text-slate-900 font-bold">{filtered.length}</strong> Products</>
            )}
          </div>
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1 sm:p-1.5 rounded cursor-pointer ${viewMode === 'GRID' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1 sm:p-1.5 rounded cursor-pointer ${viewMode === 'LIST' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start min-w-0 w-full">
        {/* Faceted Filter Sidebar (Collapsible on mobile) */}
        <div className={`space-y-4 sm:space-y-5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 h-fit shadow-2xs min-w-0 w-full ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Sourcing Filters
            </h3>
            <button
              onClick={() => {
                handleCategorySelect('ALL');
                setSelectedTier('ALL');
                setSelectedIncoterm('ALL');
                setMaxMoq(5000);
                setSearchTerm('');
                setOwnershipFilter('ALL');
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Industry Category Sector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 sm:mb-2">Industry Sector</label>
            <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="category"
                  checked={activeCategory === 'ALL'}
                  onChange={() => handleCategorySelect('ALL')}
                  className="accent-blue-600"
                />
                <span className={activeCategory === 'ALL' ? 'font-bold text-blue-600' : ''}>All Sectors</span>
              </label>
              {availableCategories.map(cat => (
                <label key={cat} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === cat}
                    onChange={() => handleCategorySelect(cat)}
                    className="accent-blue-600"
                  />
                  <span className={`line-clamp-1 ${activeCategory === cat ? 'font-bold text-blue-600' : ''}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data Separation / Listing Ownership */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
              🌐 Listing Source
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="ownership"
                  checked={ownershipFilter === 'ALL'}
                  onChange={() => setOwnershipFilter('ALL')}
                  className="accent-blue-600"
                />
                <span className={ownershipFilter === 'ALL' ? 'font-bold text-slate-900' : ''}>All Users' Listings</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="ownership"
                  checked={ownershipFilter === 'MINE'}
                  onChange={() => setOwnershipFilter('MINE')}
                  className="accent-blue-600"
                  disabled={!user}
                />
                <span className={`${ownershipFilter === 'MINE' ? 'font-bold text-slate-900' : ''} ${!user ? 'text-slate-400 cursor-not-allowed' : ''}`}>
                  My Listings Only {!user && <span className="text-[9px] text-amber-600 font-semibold">(Sign in required)</span>}
                </span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="ownership"
                  checked={ownershipFilter === 'OTHERS'}
                  onChange={() => setOwnershipFilter('OTHERS')}
                  className="accent-blue-600"
                />
                <span className={ownershipFilter === 'OTHERS' ? 'font-bold text-slate-900' : ''}>Exclude My Listings</span>
              </label>
            </div>
          </div>

          {/* Supplier Membership Tier */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 sm:mb-2">Supplier Verification Tier</label>
            <div className="space-y-1 text-xs">
              {['ALL', 'VIP', 'GOLD', 'SILVER'].map(tier => (
                <label key={tier} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="tier"
                    checked={selectedTier === tier}
                    onChange={() => setSelectedTier(tier)}
                    className="accent-blue-600"
                  />
                  <span>{tier === 'ALL' ? 'All Suppliers' : `${tier} Verified`}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Incoterms Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 sm:mb-2">Supported Trade Term (Incoterms)</label>
            <div className="space-y-1 text-xs">
              {['ALL', 'FOB', 'CIF', 'DDP', 'EXW', 'CFR'].map(term => (
                <label key={term} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="incoterm"
                    checked={selectedIncoterm === term}
                    onChange={() => setSelectedIncoterm(term)}
                    className="accent-blue-600"
                  />
                  <span className="font-mono font-semibold">{term}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Maximum MOQ Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-800">Max MOQ</span>
              <span className="text-emerald-700 font-mono font-bold">≤ {maxMoq.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5000"
              step="50"
              value={maxMoq}
              onChange={e => setMaxMoq(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2.5 sm:pt-3 border-t border-slate-200 space-y-1.5 text-[10px] sm:text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Trade Protection Certificate</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-800 font-medium">
              <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>SGS / TÜV Audited Plants</span>
            </div>
          </div>
        </div>

        {/* Product Results Grid/List */}
        <div className="lg:col-span-3 space-y-4 min-w-0 w-full">
          {/* Active Filter Chips */}
          {(activeCategory !== 'ALL' || searchTerm.trim() !== '' || selectedTier !== 'ALL' || selectedIncoterm !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-2 bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 sm:p-3 text-xs">
              <span className="text-slate-600 font-bold text-[11px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" /> Active Filters:
              </span>
              {activeCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                  <span>Sector: {activeCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('ALL')}
                    className="hover:text-blue-200 font-black cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm.trim() !== '' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs shadow-2xs">
                  <span>Search: "{searchTerm}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="hover:text-red-500 font-black cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTier !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs">
                  <span>Tier: {selectedTier}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTier('ALL')}
                    className="hover:text-amber-700 font-black cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedIncoterm !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs">
                  <span>Incoterm: {selectedIncoterm}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedIncoterm('ALL')}
                    className="hover:text-red-500 font-black cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  handleCategorySelect('ALL');
                  setSearchTerm('');
                  setSelectedTier('ALL');
                  setSelectedIncoterm('ALL');
                }}
                className="ml-auto text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {isLoading || (products.length === 0 && !isUsingCache) ? (
            <div id="product-catalog-loading-skeletons" className="space-y-4">
              {viewMode === 'GRID' ? (
                <ProductCatalogGrid
                  isLoading={true}
                  skeletonCount={itemsPerPage}
                  products={[]}
                  selectedCurrency={selectedCurrency}
                  onSelectProduct={onSelectProduct}
                  onOpenStorefront={onOpenStorefront}
                  onContactSupplier={onContactSupplier}
                  formatPrice={formatPrice}
                  getTierBadge={getTierBadge}
                />
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {Array.from({ length: Math.min(itemsPerPage, 8) }).map((_, i) => (
                    <ProductListSkeleton key={`list-skeleton-${i}`} />
                  ))}
                </div>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <>
            <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-2xs flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Search className="w-8 h-8" />
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900">No matching products found</div>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any products matching your current filters in this category. 
                Our sourcing network can still help you find exactly what you need.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md">
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTier('ALL');
                    setSelectedIncoterm('ALL');
                    setOwnershipFilter('ALL');
                    setMaxMoq(50000);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors w-full"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
            
            {/* Recommendations when empty */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Recommended Products</h3>
              <ProductCatalogGrid
                products={products.slice(0, 8).sort(() => Math.random() - 0.5)}
                selectedCurrency={selectedCurrency}
                onSelectProduct={onSelectProduct}
                onOpenStorefront={onOpenStorefront}
                onContactSupplier={onContactSupplier}
                formatPrice={formatPrice}
                getTierBadge={getTierBadge}
              />
            </div>
            </>
          ) : (
            <div className="space-y-4">
              {viewMode === 'GRID' ? (
                <ProductCatalogGrid
                  products={paginatedProducts}
                  selectedCurrency={selectedCurrency}
                  onSelectProduct={onSelectProduct}
                  onOpenStorefront={onOpenStorefront}
                  onContactSupplier={onContactSupplier}
                  formatPrice={formatPrice}
                  getTierBadge={getTierBadge}
                />
              ) : (
                /* List View */
                <div className="space-y-2.5 sm:space-y-3">
                  {paginatedProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 hover:border-blue-400 hover:shadow-md transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div 
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden shrink-0 cursor-pointer border border-slate-200"
                          onClick={() => onSelectProduct(product)}
                        >
                          <SafeImage
                            src={product.images?.[0]}
                            alt={product.title}
                            category={product.category}
                            productId={product.id}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {getTierBadge(product.supplierTier)}
                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">{product.supplierCountry}</span>
                          </div>
                          <div 
                            onClick={() => onSelectProduct(product)}
                            className="font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition-colors cursor-pointer truncate"
                          >
                            {product.title}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-600 flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="truncate max-w-[120px]">{product.supplierName}</span>
                            <span>•</span>
                            <span>MOQ: <strong>{product.moq} {product.moqUnit}</strong></span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{product.leadTimeDays}d lead</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center sm:justify-end gap-1 mb-0.5">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>Protected FOB Rate</span>
                            </span>
                          </div>
                          <div className="text-xs sm:text-base font-extrabold text-slate-800 font-mono">
                            Inquire for Price
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500">per {product.moqUnit || 'Unit'} (FOB)</div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => onContactSupplier(product)}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] sm:text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                          >
                            Inquire
                          </button>
                          <button
                            onClick={() => onSelectProduct(product)}
                            className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Pagination Bar for 3x4 / 4x3 Grid */}
              {totalPages > 1 && (
                <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs w-full">
                  <div className="text-slate-600 font-medium text-center sm:text-left">
                    Showing <strong className="text-slate-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of{' '}
                    <strong className="text-slate-900 font-bold">{filtered.length}</strong> products
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        const el = document.getElementById('featured-products-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors whitespace-nowrap shadow-2xs"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            const el = document.getElementById('featured-products-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`w-8 h-8 min-w-[32px] flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        const el = document.getElementById('featured-products-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors whitespace-nowrap shadow-2xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
