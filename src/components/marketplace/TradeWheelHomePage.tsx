import React from 'react';
import { Product, Currency, CompanyProfile, RfqRequirement, ActiveView } from '../../types';
import { CURRENCY_RATES, MOCK_COMPANIES, MOCK_RFQS } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { SafeImage } from '../common/SafeImage';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { HeroSection } from './HeroSection';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { LiveGlobalTradeFeed } from './LiveGlobalTradeFeed';
import { ProductCatalog } from './ProductCatalog';
import { DynamicFaqSection } from '../common/DynamicFaqSection';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { SuppliersByRegionBar } from './SuppliersByRegionBar';
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  ArrowRight, 
  Globe2, 
  Package, 
  Truck, 
  CheckCircle2, 
  PlusCircle, 
  TrendingUp, 
  FileText, 
  Calendar,
  Clock,
  MessageCircle,
  ExternalLink,
  Lock,
  Headphones
} from 'lucide-react';
import { getFreshRfqDate } from '../../utils/rfqDateUtils';

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
  onNavigateToCategory?: (catName: string, subcategory?: string) => void;
  onNavigateToSuppliers?: (sectorName?: string) => void;
  onNavigateToRfqs?: (categoryName?: string) => void;
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
  onSelectRfq,
  onNavigateToCategory,
  onNavigateToSuppliers,
  onNavigateToRfqs
}) => {
  const { t, tText } = useLanguage();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [showAllSuppliers, setShowAllSuppliers] = React.useState(false);
  const activeRfqsPool = rfqs && rfqs.length > 0 ? rfqs : MOCK_RFQS;
  const displayedRfqs = activeRfqsPool.slice(0, 12);
  const displayedCompanies = showAllSuppliers ? MOCK_COMPANIES : MOCK_COMPANIES.slice(0, 6);

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

  const handleSelectCategoryFromMenu = (catName: string) => {
    setSelectedCategory(catName || null);
    if (catName) {
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
        rfqs={activeRfqsPool}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
        onOpenStorefront={onOpenStorefront}
        onNavigate={onNavigate}
        onSelectRfq={onSelectRfq}
      />

      {/* 2. VERIFIED SECTORS & MEGA DIRECTORY */}
      <CategoryMegaMenu
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryFromMenu}
        onNavigateToCategory={onNavigateToCategory || ((cat, sub) => {
          setSelectedCategory(cat);
          onNavigate('PRODUCT_DIRECTORY');
        })}
        onNavigateToSuppliers={onNavigateToSuppliers || (() => onNavigate('SUPPLIERS_DIRECTORY'))}
        onNavigateToRfqs={onNavigateToRfqs || (() => onNavigate('BUY_LEADS'))}
        onNavigate={onNavigate}
        onOpenCreateRfq={onOpenCreateRfq}
      />

      {/* 2.5 LIVE GLOBAL TRADE FEED */}
      <div className="pt-1 pb-2">
        <LiveGlobalTradeFeed 
          onSelectLead={(lead) => {
            if (onNavigateToRfqs) {
              onNavigateToRfqs(lead.product);
            } else {
              onNavigate('BUY_LEADS');
            }
          }}
        />
      </div>

      {/* 3. FEATURED PRODUCTS CATALOG SECTION */}
      <div id="featured-products-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              {t('featuredProducts')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source directly from audited manufacturing plants with live FOB/CIF tier pricing and guaranteed lead times.
            </p>
          </div>
          <button
            onClick={() => onNavigate('PRODUCT_DIRECTORY')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>{t('viewAllProducts')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <ProductCatalog
          products={products}
          selectedCurrency={selectedCurrency}
          onSelectProduct={onSelectProduct}
          onOpenStorefront={onOpenStorefront}
          onContactSupplier={onContactSupplier}
          selectedCategory={selectedCategory || 'ALL'}
          onCategoryChange={(cat) => setSelectedCategory(cat === 'ALL' ? null : cat)}
        />
      </div>

      {/* 4. VERIFIED FACTORY EXPORTERS SHOWCASE */}
      <div className="bg-slate-50/90 text-slate-900 rounded-3xl p-6 sm:p-9 lg:p-10 space-y-6 relative overflow-hidden border border-slate-200 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 mb-2">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Audited Global Manufacturers (ISO 9001, CE, TÜV)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('auditedSuppliersHeading')}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Inspect on-site factory audit certificates, production line capacity, and trade protection limits of premier export partners.
            </p>
          </div>

          <button
            onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span>{t('exploreAllSuppliers')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayedCompanies.map((company, index) => (
            <div
              key={company.id || index}
              onClick={() => onOpenStorefront(company.id)}
              className="bg-white hover:bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={company.logoUrl}
                    alt={company.companyName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                    fetchPriority="high"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {company.tier}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{tText(company.country)}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate mt-0.5">
                      {company.companyName}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">{t('tradeAssurance')}:</span>
                    <div className="font-mono font-bold text-emerald-600">
                      ${(company.tradeAssuranceLimitUsd / 1000).toFixed(0)}k USD
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">{t('factorySize')}:</span>
                    <div className="font-bold text-slate-800">
                      {company.factorySizeSqM && company.factorySizeSqM > 0 
                        ? `${company.factorySizeSqM.toLocaleString()} m²` 
                        : 'Trading/Desk'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>{t('viewFactoryAudit')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Section 4 Footer Toggle */}
        <div className="relative z-10 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 text-xs">
            Showing <strong className="text-slate-900 font-bold">{displayedCompanies.length}</strong> of <strong className="text-slate-900 font-bold">{MOCK_COMPANIES.length}</strong> audited supplier profiles
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAllSuppliers(!showAllSuppliers)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {showAllSuppliers ? 'Show Top 6 Featured Suppliers' : `Show All ${MOCK_COMPANIES.length} Suppliers`}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{t('fullSupplierDirectory')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. LIVE BUY LEADS FEED TEASER */}
      <div id="recent-rfqs-section" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Live Global Sourcing Tenders &amp; RFQ Feed ({activeRfqsPool.length} Active Leads)</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {t('recentBuyLeads')}
            </h3>
            <p className="text-xs text-slate-500">
              Verified buyers seeking direct factory quotations. Exporters can submit binding bids directly.
            </p>
          </div>

          <button
            onClick={() => onNavigate('BUY_LEADS')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span>{t('viewAllRfqs')} ({activeRfqsPool.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {displayedRfqs && displayedRfqs.length > 0 ? (
          <div className="space-y-4">
            {/* 3x4 / 4x3 Responsive RFQ Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedRfqs.map(rfq => (
                <div
                  key={rfq.id}
                  onClick={() => onSelectRfq ? onSelectRfq(rfq) : onNavigate('BUY_LEADS')}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer space-y-2.5 flex flex-col justify-between h-full"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {rfq.id}
                          </span>
                          <span className="text-[9px] text-blue-700 font-semibold flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/80">
                            <Clock className="w-2.5 h-2.5 text-blue-500" />
                            <span>{getFreshRfqDate(rfq)}</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-2 leading-snug">
                          {rfq.productName}
                        </h4>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        {rfq.quotesCount} Bids
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Volume:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Port:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[90px]">
                          {rfq.destinationPort}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">{rfq.preferredIncoterm}:</span>
                        <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                          <span>Confidential Target</span>
                          <Lock className="w-2.5 h-2.5 text-amber-600" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 space-y-1.5">
                    <div className="text-[10px] text-slate-600 flex items-center justify-between">
                      <span className="truncate max-w-[100px] font-medium">{rfq.buyerCountry}</span>
                      <span className="text-blue-600 font-bold shrink-0 text-[10px] flex items-center gap-0.5">
                        <span>Quote</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    {/* Gated Contact Details Pill */}
                    <div className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-between gap-1 text-[9px]">
                      <span className="truncate text-slate-600 font-semibold">
                        Direct Buyer Contact
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-amber-800 font-bold bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/80 shrink-0">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>Gated</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation Controls */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full">
              <div className="text-slate-600 font-medium text-center sm:text-left">
                Showing <strong className="text-slate-900 font-bold">{Math.min(12, activeRfqsPool.length)}</strong> recent requests of{' '}
                <strong className="text-slate-900 font-bold">{activeRfqsPool.length}</strong> active buyer RFQs
              </div>

              <button
                type="button"
                onClick={() => onNavigate('BUY_LEADS')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <span>Explore Full RFQ Directory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-slate-50 rounded-3xl p-6 sm:p-10 border border-blue-200 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Free Registration • Verified Partner Vetting</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"><EditableText contentKey="homepage.onboardingBannerTitle" defaultText="Ready to Board with Us? Connect with" /> <span className="text-blue-600"><EditableText contentKey="homepage.onboardingBannerHighlight" defaultText="Audited Factories & Verified Buyers" /></span></h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal"><EditableText contentKey="homepage.onboardingBannerDesc" defaultText="Zero fake inquiries, zero spam brokers. Register for free as an importer or audited factory to access $480M+ active RFQs, Swiss trade protection protection, and direct wholesale pricing." /></p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('ONBOARD_WITH_US')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span><EditableText contentKey="homepage.btnOnboard" defaultText="Onboard / Work With Us" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('POST_BUY_REQUIREMENT')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <span><EditableText contentKey="homepage.btnPostRfq" defaultText="Post Free Buy RFQ" /></span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. DYNAMIC FAQS ACCORDION */}
      <DynamicFaqSection onOpenContactModal={onOpenCreateRfq} />

      {/* 7. TRADE HEAVEN TRUST & trade protection RAIL INFRASTRUCTURE */}
      <div className="bg-gradient-to-b from-slate-50 via-slate-50/80 to-blue-50/30 text-slate-900 rounded-3xl p-6 sm:p-9 lg:p-12 space-y-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>trade protection &amp; Compliance Guarantee</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Why Enterprise Importers &amp; Factories Choose Trade Heaven
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Eliminating international trade risk through certified multi-currency trade protection vaults, third-party SGS factory inspections, and automated Proforma Invoice (P/I) reconciliation.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900">100% trade protection Protection</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Buyer deposits are held in neutral Swiss trade protection vaults and only released upon certified Bill of Lading (B/L) and SGS pre-shipment sign-off.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Factory On-Site Audits</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Every Gold and VIP supplier undergoes strict legal KYC registration, environmental compliance, and physical manufacturing capacity verification.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Dedicated Trade Managers</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Human-to-Human (H2H) trade specialists assist with Incoterms 2020 compliance, sea freight container booking, and customs clearance mediation.
            </p>
          </div>
        </div>

        {/* WhatsApp & Sourcing Assistance Strip */}
        <div className="relative z-10 p-5 bg-white rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Need Urgent Sourcing or Factory Matchmaking?</div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">Connect directly with our senior trade desk on WhatsApp: +91 8532934479</div>
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

      {/* 8. SUPPLIERS BY REGION FOOTER BAR (TradeWheel Directory Ecosystem) */}
      <SuppliersByRegionBar
        onSelectCountry={(countryId) => {
          onNavigate('COUNTRY_HUB');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onKeywordClick={() => {
          onNavigate('COUNTRY_HUB');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
