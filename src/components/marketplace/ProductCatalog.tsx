import React, { useState } from 'react';
import { Product, Currency, SupplierTier, Incoterm } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { SafeImage } from '../common/SafeImage';
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
  Sparkles
} from 'lucide-react';

interface Props {
  products: Product[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenStorefront: (supplierId: string) => void;
  onContactSupplier: (product: Product) => void;
}

export const ProductCatalog: React.FC<Props> = ({
  products,
  selectedCurrency,
  onSelectProduct,
  onOpenStorefront,
  onContactSupplier
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>('ALL');
  const [maxMoq, setMaxMoq] = useState<number>(5000);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const curr = CURRENCY_RATES.find(c => c.code === selectedCurrency) || CURRENCY_RATES[0];

  const formatPrice = (usdPrice: number) => {
    const converted = usdPrice * curr.rateToUSD;
    if (converted >= 1000) {
      return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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

  // Filter logic
  const filtered = products.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesTier = selectedTier === 'ALL' || p.supplierTier === selectedTier;
    const matchesIncoterm = selectedIncoterm === 'ALL' || p.supportedIncoterms.includes(selectedIncoterm as Incoterm);
    const matchesMoq = p.moq <= maxMoq;
    return matchesSearch && matchesCat && matchesTier && matchesIncoterm && matchesMoq;
  });

  return (
    <div id="product-catalog-section" className="space-y-4 sm:space-y-6">
      {/* Search & Top Controls */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-2xs">
        <div className="relative flex-1 w-full">
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
        <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 shrink-0">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <div className="text-[11px] sm:text-xs text-slate-600 font-mono">
            <strong className="text-slate-900 font-bold">{filtered.length}</strong> Products
          </div>
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Faceted Filter Sidebar (Collapsible on mobile) */}
        <div className={`space-y-4 sm:space-y-5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 h-fit shadow-2xs ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Sourcing Filters
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedTier('ALL');
                setSelectedIncoterm('ALL');
                setMaxMoq(5000);
                setSearchTerm('');
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
            >
              Reset
            </button>
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
              <span>Trade Assurance Escrow</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-800 font-medium">
              <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>SGS / TÜV Audited Plants</span>
            </div>
          </div>
        </div>

        {/* Product Results Grid/List */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center space-y-2.5 shadow-2xs">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto" />
              <div className="text-sm sm:text-base font-bold text-slate-900">No products match your criteria</div>
              <p className="text-xs text-slate-500">Try broadening your MOQ range or clearing specific filter tags.</p>
            </div>
          ) : viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map(product => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    {/* Image Thumbnail */}
                    <div 
                      onClick={() => onSelectProduct(product)}
                      className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      <SafeImage
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        {getTierBadge(product.supplierTier)}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-3.5 sm:p-4 space-y-2.5">
                      <div 
                        onClick={() => onSelectProduct(product)}
                        className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                      >
                        {product.title}
                      </div>

                      {/* Tiered FOB Price range */}
                      <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">FOB Volume Price</div>
                        <div className="text-sm sm:text-base font-black text-emerald-700 font-mono mt-0.5">
                          {formatPrice(product.priceTiers[product.priceTiers.length - 1].priceUsd)} - {formatPrice(product.priceTiers[0].priceUsd)}
                          <span className="text-[11px] sm:text-xs font-normal text-slate-600"> / {product.moqUnit}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5 flex items-center justify-between font-medium pt-1.5 border-t border-slate-200/60">
                          <span>MOQ: <strong className="text-slate-900 font-bold">{product.moq.toLocaleString()} {product.moqUnit}</strong></span>
                          <span>Lead: <strong className="text-slate-900 font-bold">{product.leadTimeDays}d</strong></span>
                        </div>
                      </div>

                      {/* Supplier Trust Summary */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => onOpenStorefront(product.supplierId)}
                          className="text-slate-700 hover:text-blue-600 font-medium truncate max-w-[150px] sm:max-w-[170px] text-left flex items-center gap-1 group/sup transition-colors cursor-pointer"
                        >
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{product.supplierName}</span>
                        </button>
                        <span className="text-slate-500 text-[10px] shrink-0 font-mono font-medium">
                          {product.supplierCountry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-3.5 sm:p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onContactSupplier(product)}
                      className="w-full py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 min-h-[40px] cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Contact</span>
                    </button>
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="w-full py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs min-h-[40px] flex items-center justify-center cursor-pointer"
                    >
                      <span>Get Latest Price</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2.5 sm:space-y-3">
              {filtered.map(product => (
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
                        src={product.images[0]}
                        alt={product.title}
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
                        <span className="hidden xs:inline">•</span>
                        <span className="hidden xs:inline">{product.leadTimeDays}d lead</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-base font-extrabold text-emerald-700 font-mono">
                        {formatPrice(product.priceTiers[product.priceTiers.length - 1].priceUsd)} - {formatPrice(product.priceTiers[0].priceUsd)}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500">per {product.moqUnit} (FOB)</div>
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
        </div>
      </div>
    </div>
  );
};
