import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Package, TrendingUp, Sparkles, ChevronRight, Loader2, X, ArrowUpRight } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_COMPANIES, MOCK_RFQS } from '../../data/mockData';
import { ActiveView } from '../../types';

interface GlobalSearchProps {
  onNavigate: (view: ActiveView, props?: any) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique categories and popular items from MOCK_PRODUCTS for predictive suggestions
  const { categories, popularItems } = useMemo(() => {
    const catMap = new Map<string, number>();
    const items: string[] = [];

    MOCK_PRODUCTS.forEach(p => {
      if (p.category) {
        catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
      }
      if (p.title && items.length < 15) {
        items.push(p.title);
      }
    });

    const sortedCats = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      categories: sortedCats,
      popularItems: items
    };
  }, []);

  const normalizedQuery = (query || '').toLowerCase().trim();

  // Filter products, suppliers, RFQs
  const productResults = useMemo(() => {
    if (!normalizedQuery) return MOCK_PRODUCTS.slice(0, 5);
    return MOCK_PRODUCTS.filter(p => {
      const title = (p.title || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const subCategory = (p.subCategory || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return title.includes(normalizedQuery) || category.includes(normalizedQuery) || subCategory.includes(normalizedQuery) || desc.includes(normalizedQuery);
    }).slice(0, 6);
  }, [normalizedQuery]);

  const categorySuggestions = useMemo(() => {
    if (!normalizedQuery) return categories.slice(0, 6);
    return categories.filter(c => c.toLowerCase().includes(normalizedQuery)).slice(0, 5);
  }, [normalizedQuery, categories]);

  const supplierResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_COMPANIES.filter(c => {
      const companyName = (c.companyName || '').toLowerCase();
      const country = (c.country || '').toLowerCase();
      const businessType = (c.businessType || '').toLowerCase();
      return companyName.includes(normalizedQuery) || country.includes(normalizedQuery) || businessType.includes(normalizedQuery);
    }).slice(0, 4);
  }, [normalizedQuery]);

  const rfqResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_RFQS.filter(r => {
      const name = (r.productName || r.title || '').toLowerCase();
      const category = (r.category || '').toLowerCase();
      return name.includes(normalizedQuery) || category.includes(normalizedQuery);
    }).slice(0, 3);
  }, [normalizedQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 150);
  };

  const handleSelectSuggestion = (text: string, type: 'category' | 'product' | 'query' = 'product') => {
    setQuery(text);
    setIsOpen(false);
    if (type === 'category') {
      onNavigate('PRODUCT_DIRECTORY', { category: text });
    } else {
      onNavigate('PRODUCT_DIRECTORY', { search: text });
    }
  };

  return (
    <div className="relative z-50 shrink-0" ref={wrapperRef}>
      {/* Search Input Bar */}
      <div className="relative group flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search products, categories, suppliers..."
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          className="w-[120px] sm:w-52 lg:w-60 xl:w-72 pl-9 pr-7 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50/90 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-[11px] sm:text-xs outline-none text-slate-900 placeholder-slate-400 font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(true);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition-all cursor-pointer"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Predictive Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[340px] sm:w-[440px] lg:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-8 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Finding matching products &amp; categories...</span>
            </div>
          ) : (
            <div className="py-3">
              
              {/* 1. Predictive Categories Section */}
              {categorySuggestions.length > 0 && (
                <div className="px-3 pb-3">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-600" /> Predictive Categories
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {categorySuggestions.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleSelectSuggestion(cat, 'category')}
                        className="px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100/80 text-blue-800 rounded-lg text-xs font-semibold transition-all border border-blue-100 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{cat}</span>
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Predictive Products (from Mock Products List) */}
              {productResults.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-emerald-600" />
                      {normalizedQuery ? 'Matching Products' : 'Trending Sourcing Items'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{productResults.length} items</span>
                  </div>
                  <div className="space-y-1">
                    {productResults.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectSuggestion(p.title, 'product')}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <img src={p.images[0] || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100'} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{p.title}</p>
                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                              <span className="font-semibold text-emerald-600">{p.priceRangeUsd}</span>
                              <span>•</span>
                              <span>{p.category}</span>
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Matching Suppliers */}
              {supplierResults.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <div className="px-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-indigo-600" /> Verified Suppliers
                    </span>
                  </div>
                  <div className="space-y-1">
                    {supplierResults.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('SUPPLIERS_DIRECTORY', { search: c.companyName });
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600">{c.companyName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{c.businessType} • {c.country} ({c.trustScore}% Trust)</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Matching Buy Leads / RFQs */}
              {rfqResults.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <div className="px-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-amber-600" /> Active RFQ Buy Leads
                    </span>
                  </div>
                  <div className="space-y-1">
                    {rfqResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('RFQ_HUB', { search: r.productName || r.title || '' });
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600">{r.productName || r.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">Qty: {r.targetQuantity} {r.quantityUnit} • {r.buyerCountry}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Search Suggestions Footer */}
              {!normalizedQuery && popularItems.length > 0 && (
                <div className="px-3 pt-3 border-t border-slate-100 bg-slate-50/50 pb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Popular Searches</p>
                  <div className="flex flex-wrap gap-1 px-1 pb-1">
                    {popularItems.slice(0, 8).map(item => (
                      <button
                        key={item}
                        onClick={() => handleSelectSuggestion(item, 'product')}
                        className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-medium border border-slate-200/80 transition-all shadow-2xs truncate max-w-[200px]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {normalizedQuery && productResults.length === 0 && supplierResults.length === 0 && rfqResults.length === 0 && (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">No marketplace matches for "{query}"</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try searching for broader keywords like "Rice", "Briquette", "Seafood", or "Machinery"</p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};
