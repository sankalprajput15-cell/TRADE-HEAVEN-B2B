import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  getCountryTradeProfile,
  CountryTradeProfile,
  CountrySupplier,
  CountryBuyOffer,
  COUNTRY_DATA_UPDATED_EVENT
} from '../../data/countriesData';
import {
  WORLD_COUNTRIES_LIST,
  WorldCountryMeta,
  generateContextualPageRfqs
} from '../../data/worldCountriesAndBuyOrders';
import { MOCK_COMPANIES } from '../../data/mockData';
import { Product, RfqRequirement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CountryFlag } from '../common/CountryFlag';
import { SafeImage } from '../common/SafeImage';
import { formatRequirementDate } from '../../utils/rfqDateUtils';
import {
  CountryPortalCmsManager,
  CountryCmsSectionTab
} from '../admin/CountryPortalCmsManager';
import europeHeroImg from '../../assets/images/country_hero_europe_trade_1795254805670.jpg';
import asiaPacificHeroImg from '../../assets/images/country_hero_asia_pacific_trade_1795254797932.jpg';
import americasHeroImg from '../../assets/images/country_hero_americas_trade_1795254805062.jpg';
import menaHeroImg from '../../assets/images/country_hero_mena_trade_1795254794155.jpg';
import {
  Building2,
  Package,
  FileText,
  Search,
  Globe2,
  ShieldCheck,
  ExternalLink,
  Send,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Award,
  Filter,
  Clock,
  MapPin,
  Ship,
  Compass,
  Users,
  X,
  ArrowUpRight,
  Pencil,
  ImagePlus
} from 'lucide-react';

export type CountryPortalTab = 'overview' | 'suppliers' | 'buyers' | 'products' | 'map';

interface CountryB2bPortalViewProps {
  countryId: string;
  products?: Product[];
  rfqs?: RfqRequirement[];
  activeTab?: CountryPortalTab;
  onTabChange?: (tab: CountryPortalTab) => void;
  onSelectCountry: (countryId: string) => void;
  onSelectProduct?: (product: Product) => void;
  onOpenProductModal?: (productTitle: string) => void;
  onOpenRfqModal?: (rfqTitle: string) => void;
  onOpenContactModal?: (supplierName: string, country: string) => void;
  onPostRfqForCountry?: (reqData: { productName: string; quantity: string; notes: string; country: string }) => void;
  onViewAllBuyers?: (countryName: string) => void;
  onOpenAllCountriesDirectory?: () => void;
  onNavigateBack?: () => void;
}

const REGION_HERO_IMAGE: Record<WorldCountryMeta['region'], string> = {
  Europe: europeHeroImg,
  'Asia-Pacific': asiaPacificHeroImg,
  Americas: americasHeroImg,
  'Middle East & Africa': menaHeroImg
};

function matchesCountryName(candidate: string | undefined, profile: CountryTradeProfile): boolean {
  if (!candidate) return false;
  const sc = candidate.toLowerCase().trim();
  const targetName = profile.name.toLowerCase();
  if (sc === targetName || sc.includes(targetName)) return true;
  if (profile.code === 'GB' && (sc === 'uk' || sc.includes('united kingdom') || sc.includes('britain'))) return true;
  if (profile.code === 'US' && (sc === 'usa' || sc === 'us' || sc.includes('united states'))) return true;
  if (profile.code === 'AE' && (sc === 'uae' || sc.includes('arab emirates') || sc.includes('dubai'))) return true;
  if (profile.code === 'TR' && (sc.includes('türkiye') || sc.includes('turkey'))) return true;
  if (profile.code === 'KR' && (sc.includes('south korea') || sc === 'korea')) return true;
  return false;
}

const MONOGRAM_ACCENTS = [
  'bg-slate-900 text-white',
  'bg-[#0F294D] text-amber-300',
  'bg-blue-950 text-sky-200',
  'bg-emerald-950 text-emerald-200',
  'bg-slate-800 text-slate-100',
  'bg-indigo-950 text-indigo-200'
];

export const CountryB2bPortalView: React.FC<CountryB2bPortalViewProps> = ({
  countryId,
  products = [],
  rfqs = [],
  activeTab: controlledTab,
  onTabChange,
  onSelectCountry,
  onSelectProduct,
  onOpenProductModal,
  onOpenRfqModal,
  onOpenContactModal,
  onPostRfqForCountry,
  onViewAllBuyers,
  onOpenAllCountriesDirectory
}) => {
  const { isAdmin } = useAuth();
  const [cmsRevision, setCmsRevision] = useState(0);
  const [adminEditorOpen, setAdminEditorOpen] = useState(false);
  const [adminEditorSection, setAdminEditorSection] = useState<CountryCmsSectionTab>('hero');

  useEffect(() => {
    const handleCountryUpdate = () => setCmsRevision(v => v + 1);
    window.addEventListener(COUNTRY_DATA_UPDATED_EVENT, handleCountryUpdate);
    return () => window.removeEventListener(COUNTRY_DATA_UPDATED_EVENT, handleCountryUpdate);
  }, []);

  const profile = useMemo(
    () => getCountryTradeProfile(countryId),
    [countryId, cmsRevision]
  );

  const openAdminEditor = (section: CountryCmsSectionTab) => {
    setAdminEditorSection(section);
    setAdminEditorOpen(true);
  };

  const [internalTab, setInternalTab] = useState<CountryPortalTab>('overview');
  const activeTab = controlledTab ?? internalTab;

  const setActiveTab = (tab: CountryPortalTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  // Country Switcher Popover state (all 196 countries)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [switcherQuery, setSwitcherQuery] = useState('');
  const [switcherRegion, setSwitcherRegion] = useState<'ALL' | WorldCountryMeta['region']>('ALL');
  const switcherRef = useRef<HTMLDivElement | null>(null);

  // Active commodity/keyword filter
  const [filterKeyword, setFilterKeyword] = useState<string | null>(null);
  const [inlineSearch, setInlineSearch] = useState('');

  // Quick RFQ form state
  const [rfqProductName, setRfqProductName] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('');
  const [rfqNotes, setRfqNotes] = useState('');
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // Reset keyword filter when country changes
  useEffect(() => {
    setFilterKeyword(null);
    setInlineSearch('');
    setIsSwitcherOpen(false);
  }, [profile.id]);

  // Close switcher popover on outside click
  useEffect(() => {
    if (!isSwitcherOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isSwitcherOpen]);

  const filteredCountriesList = useMemo(() => {
    const q = switcherQuery.trim().toLowerCase();
    return WORLD_COUNTRIES_LIST.filter(c => {
      if (switcherRegion !== 'ALL' && c.region !== switcherRegion) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.port.toLowerCase().includes(q)
      );
    });
  }, [switcherQuery, switcherRegion]);

  // Merge real live companies matching this country with country profile suppliers
  const mergedLatestSuppliers = useMemo<CountrySupplier[]>(() => {
    const realMatching: CountrySupplier[] = MOCK_COMPANIES.filter(comp =>
      matchesCountryName(comp.country, profile)
    ).map((comp, idx) => ({
      id: `live-comp-${comp.id}`,
      name: comp.companyName,
      city: comp.city || profile.primaryPort.split('/')[0].trim(),
      country: profile.name,
      tier: comp.isVerifiedKYC || comp.tier === 'GOLD' || comp.tier === 'PLATINUM' || comp.tier === 'VIP'
        ? 'Gold Member'
        : 'Silver Member',
      verified: Boolean(comp.isVerifiedKYC),
      mainProduct: comp.description
        ? comp.description.slice(0, 96)
        : comp.businessType || 'Wholesale Industrial Trade',
      responseRate: comp.responseRate || `${97 + (idx % 3)}%`,
      yearsActive: comp.establishedYear ? Math.max(2, 2026 - comp.establishedYear) : 8
    }));

    const seen = new Set(realMatching.map(s => s.name.toLowerCase()));
    const combined = [...realMatching];
    profile.latestSuppliers.forEach(sup => {
      if (!seen.has(sup.name.toLowerCase())) {
        seen.add(sup.name.toLowerCase());
        combined.push(sup);
      }
    });
    return combined;
  }, [profile]);

  // Merge REAL live marketplace products matching this country FIRST, then curated export catalog
  const mergedProducts = useMemo<
    Array<{
      id: string;
      title: string;
      category: string;
      image: string;
      moq: string;
      priceLabel: string;
      supplierName: string;
      sourceProduct?: Product;
    }>
  >(() => {
    const realMatches = (products || [])
      .filter(p => p && matchesCountryName(p.supplierCountry, profile))
      .slice(0, 12)
      .map(p => ({
        id: p.id,
        title: p.title,
        category: p.category || 'Wholesale Export',
        image: p.images?.[0] || '',
        moq: p.moq
          ? `${p.moq.toLocaleString()} ${p.moqUnit || p.unit || 'Units'}`
          : p.minOrderQuantity || '1 Container',
        priceLabel: p.fobPriceUsd
          ? `$${p.fobPriceUsd.toLocaleString()} / ${p.moqUnit || p.unit || 'Unit'}`
          : p.priceRangeUsd || 'Request FOB Quote',
        supplierName: p.supplierName || `${profile.name} Verified Exporter`,
        sourceProduct: p
      }));

    const seen = new Set(realMatches.map(m => m.title.toLowerCase()));
    const fallbackItems = profile.latestProducts
      .filter(lp => !seen.has(lp.title.toLowerCase()))
      .map((lp, idx) => ({
        id: lp.id,
        title: lp.title,
        category: lp.category,
        image: lp.image,
        moq: lp.moq || '20 MT / 1 FCL',
        priceLabel: lp.fobRange || 'Request FOB Quote',
        supplierName:
          profile.premiumSuppliers[idx % profile.premiumSuppliers.length]?.name ||
          `${profile.name} Export Corp`
      }));

    return [...realMatches, ...fallbackItems].slice(0, 12);
  }, [products, profile]);

  // Merge REAL live RFQs matching this country + contextual Go4World-style RFQs + curated buy offers
  const mergedBuyOffers = useMemo<CountryBuyOffer[]>(() => {
    const list: CountryBuyOffer[] = [];
    const seen = new Set<string>();

    // 1. Live marketplace RFQs targeting or originating from this country
    (rfqs || [])
      .filter(r => r && matchesCountryName(r.buyerCountry, profile))
      .slice(0, 5)
      .forEach(r => {
        const displayTitle = r.title || r.productName;
        const key = (displayTitle || '').toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        list.push({
          id: r.id,
          title: displayTitle,
          date: r.postedDate || 'Recent',
          quantity: r.targetQuantity
            ? `${r.targetQuantity.toLocaleString()} ${r.quantityUnit || 'Units'}`
            : '1 Container',
          buyerCountry: profile.name,
          category: r.category,
          incoterm: r.preferredIncoterm || 'CIF'
        });
      });

    // 2. Deterministic contextual buy offers specifically for this country
    const contextual = generateContextualPageRfqs({
      page: 1,
      country: profile.name,
      count: 6
    });
    contextual.forEach(r => {
      const displayTitle = r.title || r.productName;
      const key = (displayTitle || '').toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({
        id: r.id,
        title: displayTitle,
        date: r.postedDate || 'Recent',
        quantity: r.targetQuantity
          ? `${r.targetQuantity.toLocaleString()} ${r.quantityUnit || 'MT'}`
          : '20 MT',
        buyerCountry: profile.name,
        category: r.category,
        incoterm: r.preferredIncoterm || 'CIF'
      });
    });

    // 3. Curated country buy offers
    profile.latestBuyOffers.forEach(bo => {
      const key = bo.title.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      list.push(bo);
    });

    return list.slice(0, 9);
  }, [rfqs, profile]);

  // Active text query combining clicked commodity link & inline search
  const effectiveQuery = (filterKeyword || inlineSearch).trim().toLowerCase();

  const visiblePremiumSuppliers = useMemo(() => {
    if (!effectiveQuery) return profile.premiumSuppliers;
    const matched = profile.premiumSuppliers.filter(
      s =>
        s.name.toLowerCase().includes(effectiveQuery) ||
        s.mainProduct.toLowerCase().includes(effectiveQuery) ||
        s.city.toLowerCase().includes(effectiveQuery)
    );
    return matched.length > 0 ? matched : profile.premiumSuppliers.slice(0, 3);
  }, [profile.premiumSuppliers, effectiveQuery]);

  const visibleLatestSuppliers = useMemo(() => {
    if (!effectiveQuery) return mergedLatestSuppliers.slice(0, 9);
    const matched = mergedLatestSuppliers.filter(
      s =>
        s.name.toLowerCase().includes(effectiveQuery) ||
        s.mainProduct.toLowerCase().includes(effectiveQuery) ||
        s.city.toLowerCase().includes(effectiveQuery)
    );
    return matched.length > 0 ? matched.slice(0, 9) : mergedLatestSuppliers.slice(0, 6);
  }, [mergedLatestSuppliers, effectiveQuery]);

  const visibleProducts = useMemo(() => {
    if (!effectiveQuery) return mergedProducts;
    const matched = mergedProducts.filter(
      p =>
        p.title.toLowerCase().includes(effectiveQuery) ||
        p.category.toLowerCase().includes(effectiveQuery) ||
        p.supplierName.toLowerCase().includes(effectiveQuery)
    );
    return matched.length > 0 ? matched : mergedProducts.slice(0, 8);
  }, [mergedProducts, effectiveQuery]);

  const visibleBuyOffers = useMemo(() => {
    if (!effectiveQuery) return mergedBuyOffers;
    const matched = mergedBuyOffers.filter(
      o =>
        o.title.toLowerCase().includes(effectiveQuery) ||
        (o.category || '').toLowerCase().includes(effectiveQuery)
    );
    return matched.length > 0 ? matched : mergedBuyOffers.slice(0, 6);
  }, [mergedBuyOffers, effectiveQuery]);

  const handleQuickRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqProductName.trim()) return;

    if (onPostRfqForCountry) {
      onPostRfqForCountry({
        productName: rfqProductName,
        quantity: rfqQuantity || '1 Container / Batch',
        notes: rfqNotes,
        country: profile.name
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

  const heroBackdrop = profile.heroBannerImage || REGION_HERO_IMAGE[profile.region] || europeHeroImg;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. COMPACT BREADCRUMB & 196-COUNTRY SWITCHER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3 sm:px-5 rounded-xl border border-slate-200">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Trade Heaven</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => (onOpenAllCountriesDirectory ? onOpenAllCountriesDirectory() : setIsSwitcherOpen(true))}
            className="font-medium text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            All 196 Country Portals
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <CountryFlag country={profile.code} size="xs" />
            <span>{profile.name}</span>
          </span>
        </nav>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Searchable 196-Country Switcher Popover */}
          <div className="relative" ref={switcherRef}>
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(prev => !prev)}
              className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Switch Country ({WORLD_COUNTRIES_LIST.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[400px] bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 space-y-2.5 bg-slate-50">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={switcherQuery}
                      onChange={e => setSwitcherQuery(e.target.value)}
                      placeholder="Search any of 196 countries, ISO code, or port..."
                      autoFocus
                      className="w-full pl-8 pr-8 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    {switcherQuery && (
                      <button
                        type="button"
                        onClick={() => setSwitcherQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {(['ALL', 'Europe', 'Asia-Pacific', 'Americas', 'Middle East & Africa'] as const).map(reg => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setSwitcherRegion(reg)}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          switcherRegion === reg
                            ? 'bg-[#0F294D] text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {reg === 'ALL' ? 'All 196' : reg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {filteredCountriesList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No matching countries found.
                    </div>
                  ) : (
                    filteredCountriesList.map(c => {
                      const isActive = c.code === profile.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            onSelectCountry(c.id);
                            setIsSwitcherOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <CountryFlag country={c.code} size="sm" />
                            <span className="truncate">{c.name}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {c.code} · {c.region.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => openAdminEditor('hero')}
              className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Portal &amp; Upload Images</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'map' ? 'overview' : 'map')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
              activeTab === 'map'
                ? 'bg-[#0F294D] text-white border-[#0F294D]'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{activeTab === 'map' ? 'Back to Country Portal' : 'Interactive Trade Map'}</span>
          </button>
        </div>
      </div>

      {/* 2. ARCHITECTURAL PANORAMIC COUNTRY HERO BANNER (INSPIRED BY TRADEWHEEL + TRADE HEAVEN UPGRADE) */}
      <section className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Top Panoramic Skylines Band */}
        <div className="relative min-h-[210px] sm:min-h-[245px] flex items-center bg-[#09182E]">
          <img
            src={heroBackdrop}
            alt={`${profile.name} maritime trade skyline and commercial export gateway`}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081529]/95 via-[#0D2344]/84 to-[#0D2344]/35" />

          {isAdmin && (
            <button
              type="button"
              onClick={() => openAdminEditor('hero')}
              className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/25 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Change Banner Photo</span>
            </button>
          )}

          <div className="relative z-10 w-full px-6 py-7 sm:px-9 sm:py-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 max-w-3xl">
              {/* Circular Flag Emblem matching reference silhouette */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 p-1.5 shadow-lg border-2 border-white/80 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={profile.flagSvgUrl || profile.flagUrl}
                  alt={`${profile.name} national flag`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = profile.flagUrl;
                  }}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
                  {profile.region} · ISO {profile.code} · Official Trade Heaven Country Portal
                </div>
                <h1
                  className="text-2xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight uppercase leading-[1.08]"
                  style={{ textWrap: 'balance' }}
                >
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide uppercase">
                  Top B2B Buyers, Manufacturers &amp; Verified Exporters
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span>Gateway: {profile.primaryPort}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span>{profile.transitSummary}</span>
                </div>
              </div>
            </div>

            {/* Direct Action CTA in Hero */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('country-quick-rfq-box');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  else if (onOpenRfqModal) onOpenRfqModal(`Buy Request for ${profile.name}`);
                }}
                className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Buying Request</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onOpenContactModal
                    ? onOpenContactModal(`${profile.name} Verified Exporters Desk`, profile.name)
                    : null
                }
                className="px-4 py-2.5 rounded-lg bg-white/12 hover:bg-white/20 text-white border border-white/25 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Source From {profile.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom High-Contrast Metrics & Compliance Header Strip (directly inspired by Tradewheel's UK stat strip) */}
        <div className="px-6 py-4 sm:px-9 bg-white border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-black text-[#8B1E24] tracking-tight uppercase">
              B2B Buyers &amp; Suppliers in {profile.name}
            </h2>
            <p className="text-xs text-slate-600">
              Standards: <span className="font-semibold text-slate-800">{profile.complianceStandards.join(' · ')}</span>
            </p>
          </div>

          <div className="flex items-center divide-x divide-slate-200 shrink-0">
            <div className="pr-5 sm:pr-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Companies</div>
              <div className="text-xl sm:text-2xl font-black text-[#C0392B] tabular-nums leading-tight">
                {profile.stats.companies.toLocaleString()}
              </div>
            </div>
            <div className="px-5 sm:px-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Products</div>
              <div className="text-xl sm:text-2xl font-black text-[#C0392B] tabular-nums leading-tight">
                {profile.stats.products.toLocaleString()}
              </div>
            </div>
            <div className="pl-5 sm:pl-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active RFQs</div>
              <div className="text-xl sm:text-2xl font-black text-[#0F294D] tabular-nums leading-tight">
                {profile.stats.rfqs.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PORTAL NAVIGATION TABS & IN-COUNTRY SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 sm:px-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: 'overview', label: 'Full Portal Overview', icon: Globe2 },
              { id: 'suppliers', label: `Suppliers (${profile.premiumSuppliers.length + mergedLatestSuppliers.length})`, icon: Building2 },
              { id: 'buyers', label: `Buyers & Buy Offers (${profile.verifiedBuyers.length + mergedBuyOffers.length})`, icon: Users },
              { id: 'products', label: `Products (${mergedProducts.length})`, icon: Package },
              { id: 'map', label: 'Trade Corridor Map', icon: Compass }
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#0F294D] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inlineSearch}
            onChange={e => setInlineSearch(e.target.value)}
            placeholder={`Search in ${profile.name}...`}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
          {inlineSearch && (
            <button
              type="button"
              onClick={() => setInlineSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* When activeTab === 'map', parent CountryTradeHubView renders the interactive world map right below this header */}
      {activeTab !== 'map' && (
        <>
          {/* 4. MAIN 2-COLUMN ARCHITECTURE (LEFT 8-COL DIRECTORY + RIGHT 4-COL STICKY BUY OFFERS & TOOLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* LEFT COLUMN: MAIN FEED (8 COLS) */}
            <div className="lg:col-span-8 space-y-8">
              {/* 4a. TOP EXPORTS & TOP IMPORTS (PIPE-SEPARATED DIRECTORY LINKS MATCHING REFERENCE) */}
              {(activeTab === 'overview' || activeTab === 'products') && (
                <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Top Exports of {profile.name}
                    </h2>
                    <div className="text-xs sm:text-[13px] text-slate-600 leading-7">
                      {profile.topExports.map((item, index) => (
                        <React.Fragment key={`${item}-${index}`}>
                          <button
                            type="button"
                            onClick={() => setFilterKeyword(filterKeyword === item ? null : item)}
                            className={`hover:text-blue-700 hover:underline cursor-pointer transition-colors ${
                              filterKeyword === item
                                ? 'font-bold text-blue-800 underline underline-offset-2'
                                : ''
                            }`}
                          >
                            {item}
                          </button>
                          {index < profile.topExports.length - 1 && (
                            <span className="text-slate-300 mx-2 select-none" aria-hidden="true">|</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Top Imports of {profile.name}
                    </h2>
                    <div className="text-xs sm:text-[13px] text-slate-600 leading-7">
                      {profile.topImports.map((item, index) => (
                        <React.Fragment key={`${item}-${index}`}>
                          <button
                            type="button"
                            onClick={() => setFilterKeyword(filterKeyword === item ? null : item)}
                            className={`hover:text-blue-700 hover:underline cursor-pointer transition-colors ${
                              filterKeyword === item
                                ? 'font-bold text-blue-800 underline underline-offset-2'
                                : ''
                            }`}
                          >
                            {item}
                          </button>
                          {index < profile.topImports.length - 1 && (
                            <span className="text-slate-300 mx-2 select-none" aria-hidden="true">|</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {filterKeyword && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-blue-900">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          Showing matches for <strong className="font-bold">"{filterKeyword}"</strong> in {profile.name}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setFilterKeyword(null)}
                        className="text-blue-700 hover:text-blue-950 font-bold underline cursor-pointer"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* 4b. PREMIUM SUPPLIERS IN COUNTRY */}
              {(activeTab === 'overview' || activeTab === 'suppliers') && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Premium Suppliers in {profile.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Audited Gold &amp; Silver manufacturers and export houses
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => openAdminEditor('suppliers')}
                          className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Add / Edit Suppliers &amp; Logos</span>
                        </button>
                      )}
                      <span className="text-xs font-semibold text-slate-500 tabular-nums hidden sm:inline">
                        {visiblePremiumSuppliers.length} Featured
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {visiblePremiumSuppliers.map((sup, idx) => (
                      <article
                        key={sup.id}
                        className="bg-white rounded-xl border border-slate-200 hover:border-slate-400 p-4 flex flex-col justify-between gap-3.5 transition-colors group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2.5">
                            <div
                              className={`w-11 h-11 rounded-lg flex items-center justify-center font-black text-sm tracking-tight shrink-0 overflow-hidden ${
                                sup.logo ? 'bg-white border border-slate-200' : MONOGRAM_ACCENTS[idx % MONOGRAM_ACCENTS.length]
                              }`}
                            >
                              {sup.logo ? (
                                <img src={sup.logo} alt={`${sup.name} logo`} className="w-full h-full object-cover" />
                              ) : (
                                sup.name
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map(w => w[0])
                                  .join('')
                                  .toUpperCase()
                              )}
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-end gap-1 ${
                                  sup.tier === 'Gold Member' ? 'text-amber-700' : 'text-slate-600'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5 shrink-0" />
                                <span>{sup.tier}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                                {sup.responseRate || '98%'} Resp · {sup.yearsActive || 7} yrs
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                              {sup.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{sup.city}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Main Products: </span>
                            <span className="line-clamp-2">{sup.mainProduct}</span>
                          </div>

                          {sup.website && (
                            <div className="text-[11px] text-blue-700 font-mono truncate">
                              {sup.website}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenContactModal ? onOpenContactModal(sup.name, profile.name) : null
                          }
                          className="w-full py-2 rounded-lg bg-[#0F294D] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Inquire Now</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* 4c. LATEST SUPPLIERS IN COUNTRY (3-COL DIRECTORY MATCHING SCREENSHOT 1) */}
              {(activeTab === 'overview' || activeTab === 'suppliers') && (
                <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
                  <div className="flex items-end justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Latest Suppliers in {profile.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Newly verified manufacturers, trading companies &amp; wholesale distributors
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 tabular-nums hidden sm:inline">
                      {visibleLatestSuppliers.length} Listed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6">
                    {visibleLatestSuppliers.map((sup, idx) => (
                      <div
                        key={sup.id}
                        className="flex items-start gap-3.5 group"
                      >
                        <div
                          className={`w-14 h-14 rounded-lg border border-slate-200 flex items-center justify-center font-black text-lg shrink-0 overflow-hidden ${
                            sup.logo
                              ? 'bg-white'
                              : idx % 3 === 0
                              ? 'bg-slate-100 text-[#0F294D]'
                              : idx % 3 === 1
                              ? 'bg-[#0F294D] text-white'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {sup.logo ? (
                            <img src={sup.logo} alt={`${sup.name} logo`} className="w-full h-full object-cover" />
                          ) : (
                            sup.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenContactModal ? onOpenContactModal(sup.name, profile.name) : null
                            }
                            className="text-left font-bold text-xs sm:text-[13px] text-slate-900 hover:text-blue-700 leading-snug line-clamp-2 cursor-pointer transition-colors"
                          >
                            {sup.name}
                          </button>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            <span className="font-semibold text-slate-800">Main Products: </span>
                            {sup.mainProduct}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            <span className="font-semibold text-slate-700">City: </span>
                            {sup.city}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4d. LATEST PRODUCTS FROM COUNTRY (HIGH-CLARITY PHOTO GRID MATCHING SCREENSHOTS 3 & 4) */}
              {(activeTab === 'overview' || activeTab === 'products') && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Latest Products from {profile.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Direct factory catalog &amp; export-ready wholesale shipments
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => openAdminEditor('products')}
                          className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ImagePlus className="w-3.5 h-3.5" />
                          <span>Add / Upload Product Photos</span>
                        </button>
                      )}
                      <span className="text-xs font-semibold text-slate-500 tabular-nums hidden sm:inline">
                        {visibleProducts.length} Active Listings
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {visibleProducts.map(prod => (
                      <article
                        key={prod.id}
                        onClick={() => {
                          if (prod.sourceProduct && onSelectProduct) {
                            onSelectProduct(prod.sourceProduct);
                          } else if (onOpenProductModal) {
                            onOpenProductModal(prod.title);
                          }
                        }}
                        className="bg-white rounded-xl border border-slate-200 hover:border-blue-500 overflow-hidden flex flex-col justify-between transition-all cursor-pointer group"
                      >
                        <div>
                          <div className="aspect-square bg-slate-100 overflow-hidden relative">
                            <SafeImage
                              src={prod.image}
                              alt={`${prod.title} | ${profile.name} Wholesale Supplier | Trade Heaven`}
                              category={prod.category}
                              productId={prod.id}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="p-3 space-y-1.5">
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 truncate">
                              {prod.category}
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                              {prod.title}
                            </h3>
                          </div>
                        </div>

                        <div className="px-3 pb-3 pt-1.5 border-t border-slate-100 space-y-0.5">
                          <div className="text-xs font-extrabold text-[#0F294D] tabular-nums truncate">
                            {prod.priceLabel}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            MOQ: {prod.moq}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* 4e. VERIFIED BUYERS & CORPORATE IMPORTERS IN COUNTRY (UNIQUE TRADE HEAVEN FEATURE) */}
              {(activeTab === 'overview' || activeTab === 'buyers') && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Verified Buyers &amp; Active Importers in {profile.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Direct corporate procurement desks actively sourcing international bulk shipments
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => openAdminEditor('buyers')}
                          className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Add / Edit Buyers &amp; Offers</span>
                        </button>
                      )}
                      {onViewAllBuyers && (
                        <button
                          type="button"
                          onClick={() => onViewAllBuyers(profile.name)}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer shrink-0"
                        >
                          Browse All Buyers
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.verifiedBuyers.map(buyer => (
                      <article
                        key={buyer.id}
                        className="bg-white rounded-xl border border-slate-200 hover:border-slate-400 p-4 flex flex-col justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>Verified Importer · Since {buyer.verifiedSince}</span>
                              </div>
                              <h3 className="font-bold text-sm text-slate-900 mt-0.5 truncate">
                                {buyer.companyName}
                              </h3>
                              <p className="text-xs text-slate-500 truncate">{buyer.city}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] font-bold uppercase text-slate-400">Annual Vol.</div>
                              <div className="text-xs font-black text-slate-900 tabular-nums">
                                {buyer.annualVolume}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <span className="font-semibold text-slate-800">Buying: </span>
                            <span>{buyer.targetProducts.join(' · ')}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Cadence: <strong className="text-slate-700">{buyer.orderFrequency}</strong></span>
                            <span>{buyer.preferredIncoterms}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenRfqModal
                              ? onOpenRfqModal(`Quote for ${buyer.companyName} (${profile.name})`)
                              : null
                          }
                          className="w-full py-2 rounded-lg bg-slate-100 hover:bg-[#0F294D] text-slate-900 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Send Wholesale Quotation
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* 4f. EDITORIAL COUNTRY TRADE GUIDE (SEO SECTION MATCHING SCREENSHOTS 5 & 7) */}
              {activeTab === 'overview' && profile.seoDescription && (
                <section className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-7 space-y-5">
                  <div className="space-y-1.5 border-b border-slate-200 pb-4">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                      {profile.seoDescription.headline}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Gateway Maritime Terminal: {profile.primaryPort} · Region: {profile.region}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
                    {profile.seoDescription.sections.map((sec, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <h3 className="font-bold text-slate-900 uppercase tracking-tight text-xs">
                          {sec.title}
                        </h3>
                        <p>{sec.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT STICKY SIDEBAR (4 COLS) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* SIDEBAR A: LATEST BUY OFFERS (DIRECTLY MATCHING SCREENSHOT 2 RIGHT PANEL) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <h2 className="text-base font-black text-[#8B1E24] tracking-tight">
                    Latest Buy Offers
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      onViewAllBuyers
                        ? onViewAllBuyers(profile.name)
                        : onOpenRfqModal?.(`Buy Offers for ${profile.name}`)
                    }
                    className="text-[11px] font-bold text-slate-700 hover:text-blue-700 underline underline-offset-2 cursor-pointer shrink-0"
                  >
                    View All Buyers From {profile.name}
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {visibleBuyOffers.map(offer => (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => (onOpenRfqModal ? onOpenRfqModal(offer.title) : null)}
                      className="w-full py-3 first:pt-0 last:pb-0 text-left flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          <CountryFlag country={profile.code} size="xs" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-2 leading-snug">
                            {offer.title}
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            Qty: <span className="font-semibold text-slate-700">{offer.quantity}</span>
                            {offer.incoterm ? ` · ${offer.incoterm}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0 tabular-nums flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRequirementDate(offer.date, offer.id)}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onViewAllBuyers
                      ? onViewAllBuyers(profile.name)
                      : onOpenRfqModal?.(`Buy Offers for ${profile.name}`)
                  }
                  className="w-full py-2.5 rounded-lg bg-[#0F294D] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View All Buyers From {profile.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* SIDEBAR B: BILATERAL TRADE READINESS & CUSTOMS INTELLIGENCE (TRADE HEAVEN UNIQUE) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    {profile.name} Trade Desk Facts
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    ISO {profile.code}
                  </span>
                </div>

                <dl className="space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-500 shrink-0">Gateway Port</dt>
                    <dd className="font-semibold text-slate-900 text-right">{profile.primaryPort}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-500 shrink-0">Trade Currency</dt>
                    <dd className="font-semibold text-slate-900 text-right">{profile.tradeCurrency}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-500 shrink-0">Incoterms</dt>
                    <dd className="font-semibold text-slate-900 text-right">
                      {profile.popularIncoterms.slice(0, 4).join(' · ')}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-500 shrink-0">Avg. Supplier Reply</dt>
                    <dd className="font-bold text-emerald-700 text-right tabular-nums">
                      Under {profile.avgResponseHours}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-500 shrink-0">Escrow Coverage</dt>
                    <dd className="font-bold text-slate-900 text-right tabular-nums">
                      {profile.escrowCoverageRate} Eligible
                    </dd>
                  </div>
                </dl>
              </div>

              {/* SIDEBAR C: QUICK RFQ POST BOX */}
              <div
                id="country-quick-rfq-box"
                className="bg-[#0B1F3A] text-white rounded-xl p-5 border border-slate-800 space-y-4"
              >
                <div className="space-y-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                    Instant Sourcing Desk
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    Post Buying Request for {profile.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Receive competing FOB / CIF quotes from verified suppliers in {profile.name} within 24 hours.
                  </p>
                </div>

                {rfqSubmitted ? (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-center space-y-1.5">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-sm text-white">Buying Request Posted</h4>
                    <p className="text-xs text-emerald-200">
                      Verified exporters in {profile.name} have been notified.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleQuickRfqSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                        Product or Commodity Required
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`e.g. ${profile.topExports[0] || 'Industrial Materials'}`}
                        value={rfqProductName}
                        onChange={e => setRfqProductName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                        Target Order Quantity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 25 MT, 5,000 Units"
                        value={rfqQuantity}
                        onChange={e => setRfqQuantity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                        Specifications &amp; Destination Port
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Grade, certifications, target price, or destination port..."
                        value={rfqNotes}
                        onChange={e => setRfqNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Buying Request</span>
                    </button>
                  </form>
                )}
              </div>

              {/* SIDEBAR D: NEARBY & PARTNER COUNTRY PORTALS */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Explore Partner Country Hubs
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSwitcherOpen(true)}
                    className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    All 196
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {profile.partnerCountries.map(partner => (
                    <button
                      key={partner.code}
                      type="button"
                      onClick={() => {
                        onSelectCountry(partner.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 flex items-center justify-between gap-1.5 text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <CountryFlag country={partner.code} size="xs" />
                        <span className="text-[11px] font-semibold text-slate-800 truncate">
                          {partner.name}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {partner.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* ADMIN DIRECT COUNTRY PORTAL & IMAGE UPLOAD MODAL */}
      {isAdmin && adminEditorOpen && (
        <CountryPortalCmsManager
          compactModalMode
          initialCountryId={profile.id}
          initialSection={adminEditorSection}
          onClose={() => setAdminEditorOpen(false)}
          onSaved={() => {
            setCmsRevision(v => v + 1);
          }}
        />
      )}
    </div>
  );
};
