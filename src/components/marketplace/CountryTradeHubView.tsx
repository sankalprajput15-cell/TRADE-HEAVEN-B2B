import React, { useState } from 'react';
import { CountryB2bPortalView } from './CountryB2bPortalView';
import { SuppliersByRegionBar } from './SuppliersByRegionBar';
import { ALL_COUNTRY_ITEMS } from '../../data/countriesData';
import { Globe2, Search, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface CountryTradeHubViewProps {
  initialCountryId?: string;
  onOpenProductModal?: (title: string) => void;
  onOpenRfqModal?: (title: string) => void;
  onOpenContactModal?: (supplierName: string, country: string) => void;
  onPostRfqForCountry?: (reqData: { productName: string; quantity: string; notes: string; country: string }) => void;
}

export const CountryTradeHubView: React.FC<CountryTradeHubViewProps> = ({
  initialCountryId = 'uk',
  onOpenProductModal,
  onOpenRfqModal,
  onOpenContactModal,
  onPostRfqForCountry
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(initialCountryId);
  const [searchTerm, setSearchSearchTerm] = useState<string>('');

  const filteredCountries = ALL_COUNTRY_ITEMS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* GLOBAL HUB HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Trade Heaven Global Country Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              B2B Suppliers &amp; Exporters Directory By Country
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore 34+ dedicated national trade portals. Connect with verified manufacturers, request quotations, and view real-time import/export statistics.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 space-y-1.5 shrink-0">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Find Country Portal:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country (e.g., India, USA, Germany)..."
                value={searchTerm}
                onChange={(e) => setSearchSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Quick Country Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Popular Hubs:</span>
          {['uk', 'usa', 'india', 'germany', 'uae', 'china', 'brazil', 'australia'].map(cid => {
            const item = ALL_COUNTRY_ITEMS.find(x => x.id === cid);
            if (!item) return null;
            const isSelected = selectedCountryId === cid;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedCountryId(cid)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-105' 
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC PORTAL VIEW FOR SELECTED COUNTRY */}
      <CountryB2bPortalView
        countryId={selectedCountryId}
        onSelectCountry={(cid) => setSelectedCountryId(cid)}
        onOpenProductModal={onOpenProductModal}
        onOpenRfqModal={onOpenRfqModal}
        onOpenContactModal={onOpenContactModal}
        onPostRfqForCountry={onPostRfqForCountry}
        onNavigateBack={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* COMPONENT 1: "SUPPLIERS BY REGION" MULTI-COLUMN FLAG HUB (DARK THEME) */}
      <SuppliersByRegionBar
        onSelectCountry={(cid) => {
          setSelectedCountryId(cid);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onKeywordClick={(keyword) => {
          if (onOpenProductModal) {
            onOpenProductModal(keyword);
          }
        }}
      />

    </div>
  );
};
