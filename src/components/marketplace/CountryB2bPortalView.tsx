import React, { useState } from 'react';
import { 
  getCountryData, 
  ALL_COUNTRY_ITEMS, 
  CountrySupplier, 
  CountryProduct, 
  CountryBuyOffer 
} from '../../data/countriesData';
import { 
  Building2, 
  Package, 
  FileText, 
  Search, 
  Globe2, 
  ShieldCheck, 
  ExternalLink, 
  Send, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Award,
  Filter
} from 'lucide-react';
import { SafeImage } from '../common/SafeImage';

interface CountryB2bPortalViewProps {
  countryId: string;
  onSelectCountry: (countryId: string) => void;
  onOpenProductModal?: (productTitle: string) => void;
  onOpenRfqModal?: (rfqTitle: string) => void;
  onOpenContactModal?: (supplierName: string, country: string) => void;
  onPostRfqForCountry?: (reqData: { productName: string; quantity: string; notes: string; country: string }) => void;
  onNavigateBack?: () => void;
}

export const CountryB2bPortalView: React.FC<CountryB2bPortalViewProps> = ({
  countryId,
  onSelectCountry,
  onOpenProductModal,
  onOpenRfqModal,
  onOpenContactModal,
  onPostRfqForCountry,
  onNavigateBack
}) => {
  const data = getCountryData(countryId);

  // Quick RFQ form state
  const [rfqProductName, setRfqProductName] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('');
  const [rfqNotes, setRfqNotes] = useState('');
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // Active Keyword Search filter state
  const [filterKeyword, setFilterKeyword] = useState<string | null>(null);

  const handleQuickRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqProductName.trim()) return;

    if (onPostRfqForCountry) {
      onPostRfqForCountry({
        productName: rfqProductName,
        quantity: rfqQuantity || '1 Container / Batch',
        notes: rfqNotes,
        country: data.name
      });
    }

    setRfqSubmitted(true);
    setTimeout(() => {
      setRfqProductName('');
      setRfqQuantity('');
      setRfqNotes('');
      setRfqSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* TOP NAVIGATION & COUNTRY SWITCHER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack || (() => onSelectCountry('uk'))}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Regional Hubs</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Marketplace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Suppliers By Region</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-slate-900">{data.name} Hub</span>
          </div>
        </div>

        {/* COUNTRY SELECTOR DROPDOWN */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="country-select" className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Switch Portal:</span>
          </label>
          <select
            id="country-select"
            value={data.id}
            onChange={(e) => onSelectCountry(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer w-full sm:w-48"
          >
            {ALL_COUNTRY_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.flag} {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPONENT 2, STEP 1: DYNAMIC COUNTRY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/60 opacity-90 z-0" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Title & Headline */}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
                <span className="text-base">{data.flag}</span>
                <span>Official B2B Country Portal</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
                {data.name} - TOP BUYERS &amp; SELLERS
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium">
                B2B Buyers &amp; Suppliers in {data.name} &bull; Verified Exporters &amp; Direct Importers Directory
              </p>
            </div>

            {/* Metric Badges */}
            <div className="flex flex-wrap lg:flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">COMPANIES</div>
                  <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                    {data.stats.companies.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-400/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">PRODUCTS</div>
                  <div className="text-lg sm:text-xl font-black text-blue-300 font-mono">
                    {data.stats.products.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">ACTIVE RFQS</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                    {data.stats.rfqs.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* COMPONENT 2, STEP 2: TOP EXPORTS & TOP IMPORTS KEYWORD SECTIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* TOP EXPORTS LIST */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Top Exports of {data.name}
            </h2>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
            {data.topExports.map((item, index) => (
              <React.Fragment key={index}>
                <button
                  type="button"
                  onClick={() => setFilterKeyword(filterKeyword === item ? null : item)}
                  className={`hover:text-blue-600 hover:underline cursor-pointer transition-colors ${
                    filterKeyword === item ? 'font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md' : ''
                  }`}
                >
                  {item}
                </button>
                {index < data.topExports.length - 1 && (
                  <span className="text-slate-300 font-bold mx-2">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-slate-100" />

        {/* TOP IMPORTS LIST */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Top Imports of {data.name}
            </h2>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
            {data.topImports.map((item, index) => (
              <React.Fragment key={index}>
                <button
                  type="button"
                  onClick={() => setFilterKeyword(filterKeyword === item ? null : item)}
                  className={`hover:text-blue-600 hover:underline cursor-pointer transition-colors ${
                    filterKeyword === item ? 'font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md' : ''
                  }`}
                >
                  {item}
                </button>
                {index < data.topImports.length - 1 && (
                  <span className="text-slate-300 font-bold mx-2">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {filterKeyword && (
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between gap-3 text-xs text-blue-900 font-medium">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filtering view by commodity: <strong>"{filterKeyword}"</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setFilterKeyword(null)}
              className="text-blue-700 font-bold underline hover:text-blue-900 text-[11px] cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

      </div>

      {/* COMPONENT 2, STEP 3: SPLIT BODY LAYOUT (MAIN FEED + RIGHT SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: MAIN FEED (8 COLS) */}
        <div className="lg:col-span-8 space-y-10">

          {/* 3a. PREMIUM SUPPLIERS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Premium Suppliers in {data.name}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Verified Gold &amp; Silver Exporters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.premiumSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 group-hover:scale-105 transition-transform">
                        {sup.name.slice(0, 2).toUpperCase()}
                      </div>
                      
                      {sup.tier === 'Gold Member' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-extrabold text-[10px] uppercase flex items-center gap-1 shadow-2xs">
                          <span>Gold Member</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-[10px] uppercase flex items-center gap-1">
                          <span>Silver Member</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {sup.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        📍 {sup.city}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase">Main Offering:</span>
                      <span className="line-clamp-2">{sup.mainProduct}</span>
                    </div>

                    {sup.website && (
                      <a
                        href={`https://${sup.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline font-mono flex items-center gap-1 truncate"
                      >
                        <Globe2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{sup.website}</span>
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenContactModal ? onOpenContactModal(sup.name, data.name) : null}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Inquire Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3b. LATEST SUPPLIERS SECTION */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Latest Suppliers in {data.name}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Newly Onboarded Exporters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.latestSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-xs shrink-0">
                        {sup.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-slate-900 truncate">
                          {sup.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {sup.city}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Main Products:</span>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-2">{sup.mainProduct}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenContactModal ? onOpenContactModal(sup.name, data.name) : null}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Contact Exporter
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3c. LATEST PRODUCTS GRID (6-COLUMN COMPACT GRID) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Latest Products from {data.name}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Bulk Catalog Highlights</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {data.latestProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onOpenProductModal ? onOpenProductModal(prod.title) : null}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="aspect-square bg-slate-100 overflow-hidden relative">
                    <SafeImage
                      src={prod.image}
                      alt={prod.title}
                      category={prod.category}
                      productId={prod.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase">
                      {prod.category.split(' ')[0]}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <h3 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {prod.title}
                    </h3>
                    <div className="text-[10px] text-blue-600 font-bold">
                      Inquire Wholesale
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3d. SEO MARKET OVERVIEW / DESCRIPTIVE TEXT SECTION */}
          {data.seoDescription && (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {data.seoDescription.headline}
                </h2>
                <div className="h-1 w-16 bg-blue-600 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
                {data.seoDescription.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight text-[11px]">
                      {sec.title}
                    </h3>
                    <p>{sec.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

          {/* SIDEBAR A: LATEST BUY OFFERS / LIVE RFQS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Latest Buy Offers
                </h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                Live Requirements
              </span>
            </div>

            <div className="space-y-3">
              {data.latestBuyOffers.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => onOpenRfqModal ? onOpenRfqModal(offer.title) : null}
                  className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {offer.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Qty: {offer.quantity}
                    </span>
                    <span>{offer.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenRfqModal ? onOpenRfqModal(`Buy Offers for ${data.name}`) : null}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <span>View All Buyers From {data.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* SIDEBAR B: QUICK RFQ POST BOX */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-blue-800 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-400/30">
                <Send className="w-3 h-3 text-amber-400" />
                <span>Instant Sourcing</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Post Buying Request for {data.name}
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Receive quotes from verified suppliers in {data.name} within 24 hours.
              </p>
            </div>

            {rfqSubmitted ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-center space-y-2 text-white">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-extrabold text-sm">RFQ Submitted Successfully!</h4>
                <p className="text-xs text-emerald-200">
                  Verified suppliers in {data.name} have been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickRfqSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-200 mb-1">
                    What product or material do you need?
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1121 Basmati Rice, CNC Lathes..."
                    value={rfqProductName}
                    onChange={(e) => setRfqProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-200 mb-1">
                    Target Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100 MT, 5,000 Units"
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-200 mb-1">
                    Requirement Details / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide specifications, target price, or port of destination..."
                    value={rfqNotes}
                    onChange={(e) => setRfqNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <Send className="w-4 h-4" />
                  <span>Post RFQ Now</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
