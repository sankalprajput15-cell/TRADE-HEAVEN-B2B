import React, { useState, useMemo } from 'react';
import { RfqRequirement, ActiveView } from '../../types';
import {
  WORLD_COUNTRIES_LIST,
  getCountryFlagInfo,
  generateRandomGo4WorldBuyOrders
} from '../../data/worldCountriesAndBuyOrders';
import { CountryFlag } from '../common/CountryFlag';
import {
  Globe2,
  Shuffle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Ship,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  X
} from 'lucide-react';

interface Go4WorldBuyOrdersShowcaseProps {
  onSelectRfq?: (rfq: RfqRequirement) => void;
  onNavigate?: (view: ActiveView) => void;
  onSelectCountryPortal?: (countryId: string) => void;
  compact?: boolean;
}

export const Go4WorldBuyOrdersShowcase: React.FC<Go4WorldBuyOrdersShowcaseProps> = ({
  onSelectRfq,
  onNavigate,
  onSelectCountryPortal,
  compact = false
}) => {
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [showAllFlags, setShowAllFlags] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(compact ? 8 : 12);

  // Dynamically generated Go4World-style buy orders pool
  const buyOrdersPool = useMemo(
    () => generateRandomGo4WorldBuyOrders(120, randomSeed),
    [randomSeed]
  );

  // Filter countries for the All-World Flags Directory
  const filteredCountries = useMemo(() => {
    return WORLD_COUNTRIES_LIST.filter(c => {
      if (selectedRegion !== 'ALL' && c.region !== selectedRegion) return false;
      if (countrySearch.trim()) {
        const q = countrySearch.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.port.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedRegion, countrySearch]);

  const displayedCountries = showAllFlags ? filteredCountries : filteredCountries.slice(0, 36);

  // Filter Go4World-style Buy Orders
  const filteredOrders = useMemo(() => {
    return buyOrdersPool.filter(order => {
      const cInfo = getCountryFlagInfo(order.buyerCountry);
      if (selectedCountryCode !== 'ALL' && cInfo.code !== selectedCountryCode) {
        return false;
      }
      if (selectedRegion !== 'ALL' && cInfo.region !== selectedRegion) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        return (
          order.productName.toLowerCase().includes(q) ||
          order.buyerCountry.toLowerCase().includes(q) ||
          order.buyerCompany.toLowerCase().includes(q) ||
          order.category.toLowerCase().includes(q) ||
          order.destinationPort.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [buyOrdersPool, selectedCountryCode, selectedRegion, orderSearch]);

  const handleRandomizeOrders = () => {
    setRandomSeed(prev => prev + Math.floor(Math.random() * 50) + 7);
  };

  return (
    <section
      id="go4world-global-buyers-flags-showcase"
      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6"
    >
      {/* 1. HEADER & RANDOMIZE ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              All {WORLD_COUNTRIES_LIST.length} World Countries Flags • Live Worldwide Buy Orders Directory
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Global Buyers &amp; Live Buy Orders by Country Flag
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Browse verified international buyers and live purchase orders across all {WORLD_COUNTRIES_LIST.length} countries with official flags, required quantities, destination ports, and L/C or T/T payment terms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRandomizeOrders}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Generate fresh random global buy orders and buyers across world countries"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Load Random Buy Orders</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('BUYERS_DIRECTORY')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>All Verified Buyers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. ALL WORLD COUNTRIES FLAGS DIRECTORY BAR */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Filter Buyers by Country Flag ({filteredCountries.length} Countries):</span>
            </span>

            {(['ALL', 'Americas', 'Europe', 'Middle East & Africa', 'Asia-Pacific'] as const).map(reg => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {reg === 'ALL' ? 'All Continents' : reg}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search any country flag..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {countrySearch && (
                <button
                  type="button"
                  onClick={() => setCountrySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAllFlags(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            >
              <span>
                {showAllFlags
                  ? 'Show Top 36 Flags'
                  : `View All ${filteredCountries.length} Flags`}
              </span>
              {showAllFlags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Country Flag Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[340px] overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setSelectedCountryCode('ALL')}
            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedCountryCode === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="text-sm">🌍</span>
              <span className="truncate">All Countries</span>
            </span>
            <span className="text-[10px] font-mono opacity-80">{WORLD_COUNTRIES_LIST.length}</span>
          </button>

          {displayedCountries.map(c => {
            const isSelected = selectedCountryCode === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountryCode(prev => (prev === c.code ? 'ALL' : c.code));
                }}
                onDoubleClick={() => {
                  if (onSelectCountryPortal) onSelectCountryPortal(c.id);
                }}
                className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-blue-50/60 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-blue-300'
                }`}
                title={`Click to filter Buy Orders from ${c.name} (${c.code})`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <CountryFlag country={c.code} size="sm" />
                  <span className="text-xs font-semibold truncate">{c.name}</span>
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded shrink-0 ${
                    isSelected
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }`}
                >
                  {c.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BUY ORDERS SEARCH & ACTIVE COUNTRY STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700">
            Showing <strong className="text-slate-950">{filteredOrders.length}</strong> Verified Buy Orders
          </span>
          {selectedCountryCode !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
              <CountryFlag country={selectedCountryCode} size="xs" />
              <span>
                Buyer Country: {getCountryFlagInfo(selectedCountryCode).name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCountryCode('ALL')}
                className="ml-1 text-blue-600 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            placeholder="Filter buy orders by commodity or port..."
            className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
          />
          {orderSearch && (
            <button
              type="button"
              onClick={() => setOrderSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. GO4WORLD-STYLE BUY ORDERS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.slice(0, visibleCount).map((order, idx) => {
          const countryInfo = getCountryFlagInfo(order.buyerCountry);
          const timeLabels = ['Just now', '14 mins ago', '38 mins ago', '1 hour ago', '2 hours ago', 'Today'];
          const timeLabel = timeLabels[idx % timeLabels.length];

          return (
            <div
              key={order.id}
              onClick={() => (onSelectRfq ? onSelectRfq(order) : onNavigate?.('BUY_LEADS'))}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3.5 group"
            >
              <div className="space-y-2.5">
                {/* Top Row: Country Flag + Buyer Origin + Verified / Gold Buyer Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/90">
                    <CountryFlag country={order.buyerCountry} size="md" />
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                      Buyer From {countryInfo.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      ({countryInfo.code})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-extrabold uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      <span>GOLD BUYER</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>VERIFIED</span>
                    </span>
                  </div>
                </div>

                {/* Go4World-style "WANTED : [Product]" Title */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-blue-800 group-hover:text-blue-600 transition-colors leading-snug">
                    {order.productName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                    <span>Buyer: <strong className="text-slate-700">{order.buyerCompany}</strong></span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{timeLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Go4World-style Inquiry Snippet */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  {order.detailedDescription}
                </p>

                {/* Key Order Specs Strip */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px]">Quantity Required</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {order.targetQuantity.toLocaleString()} {order.quantityUnit}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px]">Destination Port</span>
                    <span className="font-bold text-slate-800 truncate block" title={order.destinationPort}>
                      {order.destinationPort}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px]">Payment Terms</span>
                    <span className="font-bold text-emerald-700 truncate block" title={order.paymentTerms}>
                      {order.preferredIncoterm} • L/C or T/T
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Action Bar */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Order ID: {order.id}</span>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (onSelectRfq) onSelectRfq(order);
                    else onNavigate?.('BUY_LEADS');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Contact Buyer / Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. LOAD MORE / FOOTER CONTROLS */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Displaying <strong className="text-slate-900">{Math.min(visibleCount, filteredOrders.length)}</strong> of{' '}
          <strong className="text-slate-900">{filteredOrders.length}</strong> live global buy orders across{' '}
          <strong className="text-slate-900">{WORLD_COUNTRIES_LIST.length}</strong> countries
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {visibleCount < filteredOrders.length && (
            <button
              type="button"
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
            >
              Load More Buy Orders (+12)
            </button>
          )}
          <button
            type="button"
            onClick={handleRandomizeOrders}
            className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Refresh Random Global Leads</span>
          </button>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('BUY_LEADS')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Open Full Buy Leads Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
