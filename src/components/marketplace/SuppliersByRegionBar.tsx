import React from 'react';
import { TRENDING_KEYWORDS, ALL_COUNTRY_ITEMS } from '../../data/countriesData';
import { Globe, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
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

      {/* 2. SUPPLIERS BY REGION MULTI-COLUMN GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Suppliers By Region &amp; Global Trade Ecosystem</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Select a country to explore verified manufacturers, top buyers, latest export products &amp; active RFQs.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-bold shrink-0 self-start sm:self-auto">
            34 Active Regional Trade Portals
          </span>
        </div>

        {/* 6-COLUMN GRID FOR 34 COUNTRIES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2.5 pt-2">
          {ALL_COUNTRY_ITEMS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCountry(c.id)}
              className="group flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 hover:border-blue-500/40 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <span className="text-lg leading-none shrink-0 group-hover:scale-125 transition-transform duration-200">
                {c.flag}
              </span>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-700 transition-colors truncate">
                {c.name}
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
