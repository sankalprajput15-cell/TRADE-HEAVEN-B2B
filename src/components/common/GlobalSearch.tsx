import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Factory, FileText, ChevronRight, Loader2, X } from 'lucide-react';
import { TradeHeavenDataLoader } from './TradeHeavenDataLoader';
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

  // Simple search logic
  const normalizedQuery = (query || '').toLowerCase().trim();
  const showResults = isOpen && normalizedQuery.length >= 2;

  const productResults = MOCK_PRODUCTS.filter(p => {
    const title = (p.title || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    return title.includes(normalizedQuery) || category.includes(normalizedQuery);
  }).slice(0, 3);

  const supplierResults = MOCK_COMPANIES.filter(c => {
    const companyName = (c.companyName || '').toLowerCase();
    const businessType = (c.businessType || '').toLowerCase();
    return companyName.includes(normalizedQuery) || businessType.includes(normalizedQuery);
  }).slice(0, 3);

  const rfqResults = MOCK_RFQS.filter(r => {
    const name = (r.productName || r.title || '').toLowerCase();
    const category = (r.category || '').toLowerCase();
    return name.includes(normalizedQuery) || category.includes(normalizedQuery);
  }).slice(0, 3);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 200);
  };

  return (
    <div className="relative z-50 shrink-0" ref={wrapperRef}>
      {/* Search Input Bar */}
      <div className="relative group flex items-center">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search products, suppliers, RFQs..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          className="w-[110px] sm:w-48 lg:w-56 xl:w-64 pl-8 pr-2 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-[11px] sm:text-xs outline-none text-slate-800 placeholder-slate-400 focus:w-[130px] sm:focus:w-48"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-white rounded-full hidden md:block"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showResults && (
        <div className="absolute top-full right-0 mt-2 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-6">
              <TradeHeavenDataLoader 
                size="sm"
                message="Searching Trade Heaven..." 
                subMessage="Querying verified inventory & suppliers..." 
              />
            </div>
          ) : (
            <div className="py-2">
              {/* Products Section */}
              {productResults.length > 0 && (
                <div className="px-3 pb-2 pt-1">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2 flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Products
                  </h3>
                  <div className="space-y-1">
                    {productResults.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('PRODUCT_DIRECTORY', { search: p.title });
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{p.category}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers Section */}
              {supplierResults.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2 flex items-center gap-1.5">
                    <Factory className="w-3 h-3" /> Suppliers
                  </h3>
                  <div className="space-y-1">
                    {supplierResults.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('SUPPLIERS_DIRECTORY', { search: c.companyName });
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-slate-800 truncate">{c.companyName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{c.businessType} • {c.country}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RFQs Section */}
              {rfqResults.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Buy Leads / RFQs
                  </h3>
                  <div className="space-y-1">
                    {rfqResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('RFQ_HUB', { search: r.productName || r.title || '' });
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {r.productName || r.title || 'RFQ Requirement'} {r.targetQuantity ? `(${r.targetQuantity} ${r.quantityUnit || ''})` : ''}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {r.destinationPort || r.destinationCity || r.destinationCountry || 'Global'} • {r.buyerCountry || 'Verified Buyer'}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {productResults.length === 0 && supplierResults.length === 0 && rfqResults.length === 0 && (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">No results found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try searching for different keywords</p>
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
