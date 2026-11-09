import React, { useState } from 'react';
import { TRENDING_KEYWORDS, ALL_COUNTRY_ITEMS } from '../../data/countriesData';
import { WORLD_COUNTRIES_LIST } from '../../data/worldCountriesAndBuyOrders';
import { CountryFlag } from '../common/CountryFlag';
import { Globe, MessageCircle, ShieldCheck, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface SuppliersByRegionBarProps {
  onSelectCountry: (countryId: string) => void;
  onContactClick?: () => void;
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

export const SuppliersByRegionBar: React.FC<SuppliersByRegionBarProps> = ({
  onSelectCountry,
  onContactClick,
  onKeywordClick,
  className = ''
}) => {
  const [showAllWorldCountries, setShowAllWorldCountries] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');

  const baseList = showAllWorldCountries ? WORLD_COUNTRIES_LIST : ALL_COUNTRY_ITEMS;
  const displayedCountries = countryFilter.trim()
    ? WORLD_COUNTRIES_LIST.filter(
        c =>
          c.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
          c.code.toLowerCase().includes(countryFilter.toLowerCase())
      )
    : baseList;

  return (
    <div className={`bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 ${className}`}>
      
      {/* 1. TRENDING ON TRADE HEAVEN KEYWORDS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Trending on Trade Heaven</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Global High-Volume B2B Searches
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
          {TRENDING_KEYWORDS.map((keyword, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onKeywordClick ? onKeywordClick(keyword) : null}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-amber-500/50 text-[11px] sm:text-xs font-medium transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-slate-200 my-4" />

      {/* 2. SUPPLIERS & BUYERS BY REGION MULTI-COLUMN GRID (ALL 196 WORLD COUNTRIES) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Global Buyers &amp; Suppliers By Country Flag ({WORLD_COUNTRIES_LIST.length} Countries)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Select any country flag to explore verified buyers, active buy orders, manufacturers &amp; export products.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                placeholder="Search 196 countries..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAllWorldCountries(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>
                {showAllWorldCountries
                  ? 'Show Top 34 Hubs'
                  : `Show All ${WORLD_COUNTRIES_LIST.length} World Flags`}
              </span>
              {showAllWorldCountries ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 6-COLUMN GRID FOR COUNTRIES WITH REAL FLAGS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2.5 pt-2 max-h-[420px] overflow-y-auto pr-1">
          {displayedCountries.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCountry(c.id)}
              className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 text-left border border-slate-200 hover:border-blue-500/40 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2 min-w-0">
                <CountryFlag country={c.code} size="sm" flagClassName="group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 transition-colors truncate">
                  {c.name}
                </span>
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-blue-600 shrink-0">
                {c.code}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-slate-200 my-4" />

      {/* 3. LEGAL NOTICE & GOOGLE PARTNER BAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-2 text-xs text-slate-500">
        <div className="max-w-2xl text-center lg:text-left space-y-1">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Kindly be advised that all content, including photographs, merchandise, pricing, promotions, and corporate data, submitted by users is exclusively their responsibility. TradeHeaven.net shall not be held accountable for any such submissions. We strictly forbid the utilization of any form of watermark or intellectual property mark on images posted on our platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Premier Partner</span>
          </div>

          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat With Live Trade Desk</span>
          </a>
        </div>
      </div>

    </div>
  );
};
