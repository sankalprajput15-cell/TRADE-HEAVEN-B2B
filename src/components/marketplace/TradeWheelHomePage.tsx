import React from 'react';
import { Product, Currency, CompanyProfile, RfqRequirement, ActiveView } from '../../types';
import { CURRENCY_RATES, MOCK_COMPANIES, MOCK_RFQS } from '../../data/mockData';
import { SafeImage } from '../common/SafeImage';
import { HeroSection } from './HeroSection';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { ProductCatalog } from './ProductCatalog';
import { DynamicFaqSection } from '../common/DynamicFaqSection';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Globe2, 
  Package, 
  Truck, 
  CheckCircle2, 
  PlusCircle, 
  TrendingUp, 
  FileText, 
  Calendar,
  MessageCircle,
  ExternalLink,
  Lock,
  Headphones
} from 'lucide-react';

interface Props {
  products: Product[];
  rfqs?: RfqRequirement[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenStorefront: (companyId: string) => void;
  onContactSupplier: (product: Product) => void;
  onOpenCreateRfq: () => void;
  onNavigate: (view: ActiveView) => void;
  onOpenLiveTool: (tool: 'incoterms' | 'rfq_checker' | 'api_sandbox') => void;
  onSelectRfq?: (rfq: RfqRequirement) => void;
}

export const TradeWheelHomePage: React.FC<Props> = ({
  products,
  rfqs = [],
  selectedCurrency,
  onSelectProduct,
  onOpenStorefront,
  onContactSupplier,
  onOpenCreateRfq,
  onNavigate,
  onOpenLiveTool,
  onSelectRfq
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleHeroSearch = (query: string, category: string) => {
    if (category) {
      setSelectedCategory(category);
    }
  };

  return (
    <div id="tradewheel-homepage-root" className="space-y-10 sm:space-y-12">
      {/* 1. HERO SECTION */}
      <HeroSection
        onSearch={handleHeroSearch}
        onOpenCreateRfq={onOpenCreateRfq}
        onOpenLiveTool={onOpenLiveTool}
        products={products}
        rfqs={rfqs}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
        onOpenStorefront={onOpenStorefront}
        onNavigate={onNavigate}
        onSelectRfq={onSelectRfq}
      />

      {/* 2. VERIFIED SECTORS & MEGA DIRECTORY */}
      <CategoryMegaMenu
        selectedCategory={selectedCategory}
        onSelectCategory={catName => setSelectedCategory(catName || null)}
      />

      {/* 3. FEATURED PRODUCTS CATALOG SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Verified Direct Factory Products &amp; Volume Wholesale
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source directly from audited manufacturing plants with live FOB/CIF tier pricing and guaranteed lead times.
            </p>
          </div>
          <button
            onClick={() => onNavigate('PRODUCT_DIRECTORY')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <ProductCatalog
          products={products}
          selectedCurrency={selectedCurrency}
          onSelectProduct={onSelectProduct}
          onOpenStorefront={onOpenStorefront}
          onContactSupplier={onContactSupplier}
        />
      </div>

      {/* 4. VERIFIED FACTORY EXPORTERS SHOWCASE */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 lg:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Audited Global Manufacturers (ISO 9001, CE, TÜV)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Featured Verified Supplier Storefronts
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Inspect on-site factory audit certificates, production line capacity, and escrow limits of premier export partners.
            </p>
          </div>

          <button
            onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span>Explore All 480k+ Suppliers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MOCK_COMPANIES.map(company => (
            <div
              key={company.id}
              onClick={() => onOpenStorefront(company.id)}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={company.logoUrl}
                    alt={company.companyName}
                    className="w-12 h-12 rounded-xl object-cover border border-white/20 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                        {company.tier}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{company.country}</span>
                    </div>
                    <div className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate mt-0.5">
                      {company.companyName}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Escrow Limit:</span>
                    <div className="font-mono font-bold text-emerald-400">
                      ${(company.tradeAssuranceLimitUsd / 1000).toFixed(0)}k USD
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Factory Size:</span>
                    <div className="font-bold text-slate-200">
                      {company.factorySizeSqM.toLocaleString()} m²
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs text-amber-300 font-bold">
                <span>View Factory Audit &amp; Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. LIVE BUY LEADS FEED TEASER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Live Global Sourcing Tenders &amp; RFQ Feed</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Recent Buying Requirements from International Importers
            </h3>
            <p className="text-xs text-slate-500">
              Verified buyers seeking direct factory quotations. Exporters can submit binding bids directly.
            </p>
          </div>

          <button
            onClick={() => onNavigate('BUY_LEADS')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span>View All Global Buy Leads</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {rfqs && rfqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rfqs.slice(0, 3).map(rfq => (
              <div
                key={rfq.id}
                onClick={() => onNavigate('RFQ_HUB')}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {rfq.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1.5 line-clamp-1">
                      {rfq.productName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    {rfq.quotesCount} Bids
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-500">Target Quantity:</span>
                    <div className="font-mono font-bold text-slate-900">
                      {rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Destination:</span>
                    <div className="font-bold text-slate-800 truncate">
                      {rfq.destinationPort}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>By: <strong>{rfq.buyerCompany}</strong> ({rfq.buyerCountry})</span>
                  <span className="text-blue-600 font-bold">Submit Quote &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="text-sm font-bold text-slate-800">No active buying requirements posted yet</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Post the first request for quotation (RFQ) and start receiving direct quotes from verified global manufacturers.
            </p>
            <button
              onClick={onOpenCreateRfq}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New RFQ Now</span>
            </button>
          </div>
        )}
      </div>

      {/* 5.5. WORK WITH US & VERIFIED PARTNER ONBOARDING BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 border border-blue-800/80 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free Registration • Real &amp; Genuine Partner Vetting</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Ready to Board with Us? Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300">Audited Factories &amp; Real Buyers</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Zero fake inquiries, zero spam brokers. Register for free as an importer or audited factory to access $480M+ active RFQs, Swiss escrow protection, and direct wholesale pricing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('ONBOARD_WITH_US')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Onboard / Work With Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('POST_BUY_REQUIREMENT')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <span>Post Free Buy RFQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. DYNAMIC FAQS ACCORDION */}
      <DynamicFaqSection onOpenContactModal={onOpenCreateRfq} />

      {/* 7. TRADE HEAVEN TRUST & ESCROW RAIL INFRASTRUCTURE */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-9 lg:p-12 space-y-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Escrow &amp; Compliance Guarantee</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Why Enterprise Importers &amp; Factories Choose Trade Heaven
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Eliminating international trade risk through certified multi-currency escrow vaults, third-party SGS factory inspections, and automated Proforma Invoice (P/I) reconciliation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-white">100% Escrow Protection</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Buyer deposits are held in neutral Swiss escrow vaults and only released upon certified Bill of Lading (B/L) and SGS pre-shipment sign-off.
            </p>
          </div>

          <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-white">Factory On-Site Audits</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Every Gold and VIP supplier undergoes strict legal KYC registration, environmental compliance, and physical manufacturing capacity verification.
            </p>
          </div>

          <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Headphones className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-white">Dedicated Trade Managers</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Human-to-Human (H2H) trade specialists assist with Incoterms 2020 compliance, sea freight container booking, and customs clearance mediation.
            </p>
          </div>
        </div>

        {/* WhatsApp & Sourcing Assistance Strip */}
        <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Need Urgent Sourcing or Factory Matchmaking?</div>
              <div className="text-xs text-emerald-300">Connect directly with our senior trade desk on WhatsApp: +91 8532934479</div>
            </div>
          </div>

          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
