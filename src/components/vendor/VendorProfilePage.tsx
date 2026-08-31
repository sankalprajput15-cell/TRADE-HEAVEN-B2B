import React, { useState, useEffect, useRef } from 'react';
import { 
  DetailedVendorProfile, 
  Product, 
  Currency, 
  AuthUser,
  ComplianceCertificate,
  FactoryTourImage,
  Incoterm
} from '../../types';
import { CURRENCY_RATES, MOCK_PRODUCTS } from '../../data/mockData';
import { DETAILED_VENDOR_PROFILES, getDetailedVendorProfile } from '../../data/detailedVendorProfiles';
import { loadCustomVendorProfile } from '../../utils/mediaUploadUtils';
import { MediaManagementStudio } from './MediaManagementStudio';
import { CompanyHeader } from './CompanyHeader';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { securityService } from '../../services/securityService';
import { UnifiedContactInquiryModal } from '../modals/UnifiedContactInquiryModal';
import { SafeImage } from '../common/SafeImage';
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  FileCheck, 
  Package, 
  Phone, 
  Mail, 
  Factory, 
  MessageCircle, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  Globe2, 
  Clock, 
  DollarSign, 
  Send, 
  Bookmark, 
  Share2, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  Maximize2, 
  X, 
  Paperclip, 
  ChevronRight, 
  Layers,
  HelpCircle,
  Truck,
  Flame,
  Check
} from 'lucide-react';

interface Props {
  companyId?: string;
  company?: DetailedVendorProfile;
  products?: Product[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenCreateRfq?: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  onNavigate?: (view: string) => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

export const VendorProfilePage: React.FC<Props> = ({
  companyId = 'comp-apex-motorsport',
  company: initialCompany,
  products = MOCK_PRODUCTS,
  selectedCurrency,
  onSelectProduct,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal,
  onNavigate,
  isModalView = false,
  onCloseModal
}) => {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CATALOG' | 'COMPLIANCE' | 'FACTORY_QC'>('OVERVIEW');
  
  // Active Profile state
  const [profile, setProfile] = useState<DetailedVendorProfile>(() => {
    const savedCustom = loadCustomVendorProfile();
    if (savedCustom && savedCustom.id === companyId) {
      return savedCustom;
    }
    return initialCompany || getDetailedVendorProfile(companyId);
  });

  // Media Management Studio state
  const [isMediaStudioOpen, setIsMediaStudioOpen] = useState(false);
  const [isContactInquiryModalOpen, setIsContactInquiryModalOpen] = useState(false);

  const isAuthorizedToEdit = Boolean(
    currentUser?.role === 'ADMIN' ||
    currentUser?.isVerifiedAdmin === true ||
    (currentUser?.email && profile.contactEmail && currentUser.email.toLowerCase() === profile.contactEmail.toLowerCase())
  );

  // Lightbox Modal state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Bookmark / Follow state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followersCount, setFollowersCount] = useState(1284);

  // Product Filter & Search within profile
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('ALL');

  // Sidebar Lead Generation RFQ Form state
  const [rfqMessage, setRfqMessage] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('500');
  const [rfqUnit, setRfqUnit] = useState('Units');
  const [rfqTargetPrice, setRfqTargetPrice] = useState('');
  const [rfqIncoterm, setRfqIncoterm] = useState<Incoterm>('FOB');
  const [rfqProductRef, setRfqProductRef] = useState('');
  const [rfqAttachmentName, setRfqAttachmentName] = useState<string | null>(null);
  const [rfqSubmittedSuccess, setRfqSubmittedSuccess] = useState(false);
  const [rfqSubmitting, setRfqSubmitting] = useState(false);

  // Sticky Nav Observer ref
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const rfqAttachmentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCustom = loadCustomVendorProfile();
    if (savedCustom && savedCustom.id === companyId) {
      setProfile(savedCustom);
    } else if (companyId) {
      setProfile(getDetailedVendorProfile(companyId, initialCompany));
    }
  }, [companyId, initialCompany]);

  const curr = (CURRENCY_RATES || []).find(c => c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };
  
  const companyProducts = (products || []).filter(p => p && (p.supplierId === profile.id || p.supplierName?.toLowerCase().includes(profile.companyName.toLowerCase().slice(0, 8))));

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtered Products
  const categories = Array.from(new Set(companyProducts.map(p => p.category))).filter(Boolean);
  const filteredProducts = companyProducts.filter(p => {
    const matchCategory = selectedCatalogCategory === 'ALL' || p.category === selectedCatalogCategory;
    const matchSearch = !catalogSearch || p.title.toLowerCase().includes(catalogSearch.toLowerCase()) || p.description?.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Handle RFQ Form Submission
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqMessage.trim()) return;

    setRfqSubmitting(true);
    setTimeout(() => {
      setRfqSubmitting(false);
      setRfqSubmittedSuccess(true);
      setTimeout(() => {
        setRfqSubmittedSuccess(false);
        setRfqMessage('');
        setRfqAttachmentName(null);
      }, 5000);
    }, 800);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(prev => {
      const next = !prev;
      setFollowersCount(count => next ? count + 1 : count - 1);
      return next;
    });
  };

  return (
    <div ref={pageContainerRef} className="w-full max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200 text-slate-900">
      
      {/* 1. HERO / BANNER HEADER SECTION (16:9 Responsive Cover Banner + 1:1 Logo + Business Meta) */}
      <CompanyHeader
        profile={profile}
        isAuthorizedToEdit={isAuthorizedToEdit}
        onOpenMediaStudio={() => setIsMediaStudioOpen(true)}
        isModalView={isModalView}
        onCloseModal={onCloseModal}
      />

      {/* 2. STICKY NAVIGATION TAB BAR */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            1. Company Overview
          </button>

          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CATALOG'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>2. Product Catalog ({companyProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'COMPLIANCE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Trust &amp; Compliance ({(profile.complianceCertificates || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FACTORY_QC')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FACTORY_QC'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>4. Factory &amp; Quality Control</span>
          </button>
        </div>

        {isAuthorizedToEdit && (
          <button
            onClick={() => setIsMediaStudioOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Layers className="w-3 h-3 text-amber-600" />
            <span>Edit Assets</span>
          </button>
        )}
      </div>

      {/* 3. MAIN BODY WITH STICKY SIDEBAR LEAD GENERATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE TAB CONTENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW */}
          {/* ==================================================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Established
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {profile.establishedYear} ({new Date().getFullYear() - profile.establishedYear} Yrs Exp)
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5 text-blue-600" /> Factory Scale
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {profile.factorySizeSqM && profile.factorySizeSqM > 0 
                      ? `${profile.factorySizeSqM.toLocaleString()} m² (${profile.productionLines || 0} Lines)` 
                      : 'Trading / Brokerage Desk'}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Annual Revenue
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {profile.annualRevenueUsd}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Trust Score
                  </div>
                  <div className="text-base font-black text-amber-600 mt-1">
                    {profile.trustScore} / 100
                  </div>
                </div>
              </div>

              {/* Company Bio & Specialty */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  About {profile.companyName}
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {profile.description}
                </p>

                {profile.tagline && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-900 text-xs font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Core Focus: {profile.tagline}</span>
                  </div>
                )}
              </div>

              {/* International Trade Terms (Payment Terms & Incoterms) */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-blue-600" />
                  International Trade Terms &amp; Logistics Capabilities
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Accepted Payment Terms */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Accepted Payment Terms
                    </label>
                    <div className="space-y-1.5">
                      {(profile.acceptedPaymentTerms || [
                        'Trade Protection Certificate (Zero-Risk Protection)',
                        '100% Irrevocable Confirmed L/C at Sight',
                        '30% T/T Advance + 70% against B/L Copy',
                        'D/P (Documents Against Payment)'
                      ]).map((term, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supported Incoterms */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      Supported Incoterms 2020
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(profile.supportedIncotermsList || ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA']).map((inc, idx) => (
                        <span key={idx} className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 font-black text-xs border border-blue-200">
                          {inc}
                        </span>
                      ))}
                    </div>

                    {/* Ports of Dispatch */}
                    <div className="pt-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Primary Dispatch Ports:</div>
                      <div className="text-xs font-medium text-slate-700">
                        {(profile.portsOfDispatch || ['Primary International Container Port']).join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Export Markets Distribution */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-blue-600" />
                  Main Export Markets Distribution
                </h3>

                <div className="space-y-3">
                  {(profile.marketDistribution || [
                    { market: 'North America', percentage: 42, topCountries: ['USA', 'Canada', 'Mexico'] },
                    { market: 'Western Europe', percentage: 28, topCountries: ['Germany', 'UK', 'France'] },
                    { market: 'Asia-Pacific & Japan', percentage: 18, topCountries: ['Japan', 'Australia'] },
                    { market: 'Middle East & Gulf', percentage: 12, topCountries: ['UAE', 'Saudi Arabia'] }
                  ]).map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{item.market} {item.topCountries ? `(${item.topCountries.join(', ')})` : ''}</span>
                        <span className="font-mono text-blue-600 font-black">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PRODUCT CATALOG */}
          {/* ==================================================== */}
          {activeTab === 'CATALOG' && (
            <div className="space-y-6">
              {/* Search & Category Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search factory catalog..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setSelectedCatalogCategory('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCatalogCategory === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Items ({companyProducts.length})
                  </button>

                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCatalogCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCatalogCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-500 transition-all flex flex-col justify-between group"
                  >
                    <div className="p-4 space-y-3">
                      {/* Image Thumbnail with Lightbox */}
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                        <SafeImage
                          src={prod.images?.[0]}
                          alt={prod.title}
                          category={prod.category}
                          productId={prod.id}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                          {prod.category}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage({ url: prod.images?.[0] || '', title: prod.title, subtitle: `${formatPrice(prod.priceTiers[0].priceUsd)} / ${prod.moqUnit}` });
                          }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white text-xs shadow-md cursor-pointer"
                          title="Zoom image"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 
                          onClick={() => onSelectProduct(prod)}
                          className="font-black text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer"
                        >
                          {prod.title}
                        </h4>

                        {/* Price & MOQ */}
                        <div className="mt-2 flex items-baseline justify-between">
                          <div className="text-base font-black text-emerald-600 font-mono">
                            {formatPrice(prod.priceTiers[0].priceUsd)}
                            <span className="text-xs text-slate-500 font-normal font-sans ml-1">
                              / {prod.moqUnit} (FOB)
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            MOQ: {prod.moq} {prod.moqUnit}
                          </span>
                        </div>

                        {/* Specs Snippet */}
                        <div className="mt-2.5 text-[11px] text-slate-600 line-clamp-2">
                          {prod.description}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Lead Time: <strong>{prod.leadTimeDays} Days</strong></span>
                          <span>•</span>
                          <span>Port: <strong>{prod.portOfDispatch}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectProduct(prod)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs cursor-pointer flex-1"
                      >
                        View Full Specs
                      </button>

                      <button
                        onClick={() => {
                          setRfqProductRef(prod.title);
                          setRfqTargetPrice(String(prod.priceTiers[0].priceUsd));
                          setRfqQuantity(String(prod.moq));
                          setRfqUnit(prod.moqUnit);
                          const formEl = document.getElementById('sidebar-inquiry-form');
                          formEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1 flex-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Inquire Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: TRUST & COMPLIANCE */}
          {/* ==================================================== */}
          {activeTab === 'COMPLIANCE' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Verified Regulatory &amp; Quality Certifications
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All documents independently audited by SGS, TÜV, and accredited certification registries.
                    </p>
                  </div>

                  {isAuthorizedToEdit && (
                    <button
                      onClick={() => setIsMediaStudioOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Upload Certificate</span>
                    </button>
                  )}
                </div>

                {/* Certificates Grid with Lightbox Zoom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {(profile.complianceCertificates || []).map((cert, idx) => (
                    <div
                      key={cert.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                          <SafeImage
                            src={cert.thumbnailUrl || cert.documentUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'}
                            alt={cert.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            onClick={() => setLightboxImage({ url: cert.documentUrl, title: cert.name, subtitle: `Cert No: ${cert.certificateNumber} | Issued by ${cert.issuingAuthority}` })}
                            className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/60 transition-colors flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Zoom Document"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Certificate</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{cert.name}</h4>
                          <div className="text-[11px] text-slate-500 font-mono">No: {cert.certificateNumber}</div>
                          <div className="text-[10px] text-slate-600">Issuer: <strong>{cert.issuingAuthority}</strong></div>
                        </div>
                      </div>

                      {cert.scope && (
                        <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                          <strong>Scope:</strong> {cert.scope}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>Issued: {cert.issueDate}</span>
                        <span>Valid Until: <strong>{cert.expiryDate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: FACTORY & QUALITY CONTROL */}
          {/* ==================================================== */}
          {activeTab === 'FACTORY_QC' && (
            <div className="space-y-6">
              {/* Capacity & QC Stats */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-blue-600" />
                  Manufacturing Capacity &amp; QA Testing Standards
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500">Annual Capacity</div>
                    <div className="text-xs font-black text-slate-900 mt-1">
                      {profile.factoryDetails?.annualOutputUnits || '250,000 Units / Yr'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500">Monthly Output</div>
                    <div className="text-xs font-black text-slate-900 mt-1">
                      {profile.factoryDetails?.monthlyCapacity || '22,000 Units / Mo'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500">R&amp;D Engineers</div>
                    <div className="text-xs font-black text-slate-900 mt-1">
                      {profile.factoryDetails?.rdEngineersCount || 32} Specialized
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500">QC Inspectors</div>
                    <div className="text-xs font-black text-slate-900 mt-1">
                      {profile.factoryDetails?.qaInspectorsCount || 24} On-Line
                    </div>
                  </div>
                </div>

                {/* Quality Procedures */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    In-Line Quality Assurance Protocol:
                  </label>
                  <div className="space-y-1.5">
                    {(profile.factoryDetails?.qcProcedures || [
                      '100% In-Line Spectrometer Chemical Composition Analysis',
                      'CMM 3D Coordinate Precision Laser Scanning (±0.005mm)',
                      'Dynamic Radial & Cornering Fatigue Testing (SAE J2530 Standards)',
                      '100% Helium Leak Detection & X-Ray Structural Integrity Scan',
                      'Pre-Shipment Salt Spray Corrosion Testing (1000 Hours ASTM B117)'
                    ]).map((proc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{proc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Factory Floor Tour Gallery */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Factory className="w-5 h-5 text-blue-600" />
                    Factory Production Floor Tour Gallery ({(profile.factoryDetails?.tourGallery || []).length} Photos)
                  </h3>

                  {isAuthorizedToEdit && (
                    <button
                      onClick={() => setIsMediaStudioOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Photo</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(profile.factoryDetails?.tourGallery || []).map((tour, idx) => (
                    <div
                      key={tour.id || idx}
                      onClick={() => setLightboxImage({ url: tour.imageUrl, title: tour.title, subtitle: `${tour.department} — ${tour.caption || ''}` })}
                      className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="relative h-44 overflow-hidden bg-slate-200">
                        <SafeImage
                          src={tour.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'}
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white text-xs shadow-md">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tour.title}
                        </div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase">{tour.department}</div>
                        {tour.caption && (
                          <div className="text-[11px] text-slate-600 line-clamp-2">{tour.caption}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY SIDEBAR LEAD GENERATOR (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
          
          {/* Contact Person Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <SafeImage
                src={profile.contactPersonDetails?.avatarUrl || profile.logoUrl}
                alt={profile.contactPerson}
                type="avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-md bg-slate-50"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <span>{profile.contactPersonDetails?.name || profile.contactPerson}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online now" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {profile.contactPersonDetails?.designation || 'Head of Global Export Relations'}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  Avg. Response: {profile.contactPersonDetails?.responseTime || '< 1 hour'}
                </div>
              </div>
            </div>

            {/* Direct Contact Clearance Box */}
            <div className="pt-2 border-t border-slate-100">
              <PremiumContactGate
                currentUser={currentUser}
                onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                isMasked={Boolean(profile.isContactMasked)}
                resourceTitle="Direct Factory Export Desk"
              >
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{profile.contactEmail ? securityService.maskEmailAddress(profile.contactEmail) : 'Contact via Inquiry Form'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{profile.contactPhone ? securityService.maskPhoneNumber(profile.contactPhone) : 'Contact via Inquiry Form'}</span>
                  </div>
                  {profile.whatsapp && (
                    <a
                      href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold pt-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setIsContactInquiryModalOpen(true)}
                    className="w-full mt-3.5 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>View Full Contact</span>
                  </button>
                </div>
              </PremiumContactGate>
            </div>
          </div>

          {/* Sticky RFQ Lead Generator Form */}
          <div id="sidebar-inquiry-form" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Direct RFQ to Manufacturer</h3>
                <p className="text-[11px] text-slate-500">Guaranteed response within 2 business hours.</p>
              </div>
            </div>

            {rfqSubmittedSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 animate-in zoom-in-95">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Inquiry Dispatched Successfully!
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your RFQ has been logged and transmitted to {profile.companyName}'s international export desk.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3 text-xs">
                {/* Product Reference */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Product / Item Inquired</label>
                  <input
                    type="text"
                    value={rfqProductRef}
                    onChange={(e) => setRfqProductRef(e.target.value)}
                    placeholder="e.g. Forged 6061-T6 Monoblock Wheels"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  />
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Order Quantity</label>
                    <input
                      type="number"
                      required
                      value={rfqQuantity}
                      onChange={(e) => setRfqQuantity(e.target.value)}
                      placeholder="500"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Unit</label>
                    <select
                      value={rfqUnit}
                      onChange={(e) => setRfqUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Units">Units / Pcs</option>
                      <option value="Sets">Sets</option>
                      <option value="Cartons">Cartons</option>
                      <option value="Metric Tons">Metric Tons</option>
                      <option value="Containers (20ft)">20ft FCL Container</option>
                    </select>
                  </div>
                </div>

                {/* Target Price & Incoterm */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Target Price ($ USD)</label>
                    <input
                      type="number"
                      value={rfqTargetPrice}
                      onChange={(e) => setRfqTargetPrice(e.target.value)}
                      placeholder="Optional ($)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Incoterm</label>
                    <select
                      value={rfqIncoterm}
                      onChange={(e) => setRfqIncoterm(e.target.value as Incoterm)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="CFR">CFR</option>
                      <option value="EXW">EXW</option>
                      <option value="DDP">DDP</option>
                    </select>
                  </div>
                </div>

                {/* Message Details */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Detailed Requirements / Specs</label>
                  <textarea
                    required
                    rows={3}
                    value={rfqMessage}
                    onChange={(e) => setRfqMessage(e.target.value)}
                    placeholder="Provide technical specifications, dimensions, packaging, port of destination, and target delivery timeframe..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden resize-none font-medium text-xs"
                  />
                </div>

                {/* Attachment Trigger */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => rfqAttachmentRef.current?.click()}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{rfqAttachmentName ? rfqAttachmentName : 'Attach Spec Sheet (PDF/JPG)'}</span>
                  </button>
                  <input
                    type="file"
                    ref={rfqAttachmentRef}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setRfqAttachmentName(file.name);
                    }}
                  />

                  {rfqAttachmentName && (
                    <button
                      type="button"
                      onClick={() => setRfqAttachmentName(null)}
                      className="text-[10px] text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={rfqSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{rfqSubmitting ? 'Transmitting RFQ...' : 'Submit Inquiry to Supplier'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 4. MEDIA MANAGEMENT STUDIO MODAL */}
      {isMediaStudioOpen && (
        <MediaManagementStudio
          isOpen={isMediaStudioOpen}
          onClose={() => setIsMediaStudioOpen(false)}
          vendorProfile={profile}
          products={products}
          onSaveProfile={(updated) => setProfile(updated)}
        />
      )}

      {/* 5. LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-3 flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {lightboxImage.url && lightboxImage.url.trim() ? (
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl"
              />
            ) : null}
            <div className="mt-3 text-center px-4">
              <h4 className="text-sm font-black text-slate-900">{lightboxImage.title}</h4>
              {lightboxImage.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{lightboxImage.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. UNIFIED CONTACT INQUIRY MODAL */}
      <UnifiedContactInquiryModal
        isOpen={isContactInquiryModalOpen}
        onClose={() => setIsContactInquiryModalOpen(false)}
        targetType="SUPPLIER"
        targetId={profile.id}
        targetTitle={profile.companyName}
        supplierCompany={profile.companyName}
        contactEmail={profile.contactEmail}
        contactPhone={profile.contactPhone}
      />
    </div>
  );
};
