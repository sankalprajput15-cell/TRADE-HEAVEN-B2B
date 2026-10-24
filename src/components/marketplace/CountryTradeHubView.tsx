import React, { useState, useMemo } from 'react';
import { CountryB2bPortalView } from './CountryB2bPortalView';
import { SuppliersByRegionBar } from './SuppliersByRegionBar';
import { ALL_COUNTRY_ITEMS, getCountryData } from '../../data/countriesData';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { Product } from '../../types';
import { SafeImage } from '../common/SafeImage';
import {
  Globe2,
  Search,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Ship,
  Package,
  Building2,
  FileText,
  Filter,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface CountryTradeHubViewProps {
  initialCountryId?: string;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onOpenProductModal?: (title: string) => void;
  onOpenRfqModal?: (title: string) => void;
  onOpenContactModal?: (supplierName: string, country: string) => void;
  onPostRfqForCountry?: (reqData: { productName: string; quantity: string; notes: string; country: string }) => void;
}

interface MapCountryHub {
  id: string;
  name: string;
  code: string;
  flag: string;
  x: number;
  y: number;
  region: 'Americas' | 'Europe' | 'Middle East & Africa' | 'Asia-Pacific';
  majorPort: string;
  exportShare: string;
}

interface TradeCorridor {
  id: string;
  name: string;
  fromId: string;
  toId: string;
  viaIds?: string[];
  volumeAnnual: string;
  transitDays: string;
  primaryCargo: string;
  color: string;
}

const MAP_COUNTRY_HUBS: MapCountryHub[] = [
  { id: 'canada', name: 'Canada', code: 'CA', flag: '🇨🇦', x: 185, y: 118, region: 'Americas', majorPort: 'Port of Vancouver', exportShare: '$598B' },
  { id: 'usa', name: 'USA', code: 'US', flag: '🇺🇸', x: 210, y: 175, region: 'Americas', majorPort: 'Port of Los Angeles / Houston', exportShare: '$2.06T' },
  { id: 'brazil', name: 'Brazil', code: 'BR', flag: '🇧🇷', x: 332, y: 342, region: 'Americas', majorPort: 'Port of Santos', exportShare: '$340B' },
  { id: 'uk', name: 'United Kingdom', code: 'GB', flag: '🇬🇧', x: 472, y: 132, region: 'Europe', majorPort: 'Port of Felixstowe', exportShare: '$512B' },
  { id: 'netherlands', name: 'Netherlands', code: 'NL', flag: '🇳🇱', x: 492, y: 138, region: 'Europe', majorPort: 'Port of Rotterdam', exportShare: '$720B' },
  { id: 'france', name: 'France', code: 'FR', flag: '🇫🇷', x: 486, y: 158, region: 'Europe', majorPort: 'Port of Le Havre', exportShare: '$618B' },
  { id: 'portugal', name: 'Portugal', code: 'PT', flag: '🇵🇹', x: 458, y: 180, region: 'Europe', majorPort: 'Port of Sines', exportShare: '$84B' },
  { id: 'germany', name: 'Germany', code: 'DE', flag: '🇩🇪', x: 510, y: 142, region: 'Europe', majorPort: 'Port of Hamburg', exportShare: '$1.68T' },
  { id: 'sweden', name: 'Sweden', code: 'SE', flag: '🇸🇪', x: 520, y: 102, region: 'Europe', majorPort: 'Port of Gothenburg', exportShare: '$198B' },
  { id: 'poland', name: 'Poland', code: 'PL', flag: '🇵🇱', x: 534, y: 140, region: 'Europe', majorPort: 'Port of Gdansk', exportShare: '$381B' },
  { id: 'italy', name: 'Italy', code: 'IT', flag: '🇮🇹', x: 516, y: 174, region: 'Europe', majorPort: 'Port of Genoa', exportShare: '$676B' },
  { id: 'ukraine', name: 'Ukraine', code: 'UA', flag: '🇺🇦', x: 564, y: 148, region: 'Europe', majorPort: 'Port of Odesa', exportShare: '$42B' },
  { id: 'bulgaria', name: 'Bulgaria', code: 'BG', flag: '🇧🇬', x: 548, y: 170, region: 'Europe', majorPort: 'Port of Varna', exportShare: '$47B' },
  { id: 'turkiye', name: 'Republic of Türkiye', code: 'TR', flag: '🇹🇷', x: 568, y: 184, region: 'Europe', majorPort: 'Port of Mersin / Ambarli', exportShare: '$256B' },
  { id: 'egypt', name: 'Egypt', code: 'EG', flag: '🇪🇬', x: 564, y: 224, region: 'Middle East & Africa', majorPort: 'Port Said (Suez Canal)', exportShare: '$53B' },
  { id: 'saudi-arabia', name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', x: 602, y: 236, region: 'Middle East & Africa', majorPort: 'Jeddah Islamic Port', exportShare: '$322B' },
  { id: 'uae', name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', x: 632, y: 238, region: 'Middle East & Africa', majorPort: 'Jebel Ali Port (Dubai)', exportShare: '$490B' },
  { id: 'south-africa', name: 'South Africa', code: 'ZA', flag: '🇿🇦', x: 548, y: 382, region: 'Middle East & Africa', majorPort: 'Port of Durban', exportShare: '$124B' },
  { id: 'pakistan', name: 'Pakistan', code: 'PK', flag: '🇵🇰', x: 675, y: 220, region: 'Asia-Pacific', majorPort: 'Port of Karachi', exportShare: '$32B' },
  { id: 'india', name: 'India', code: 'IN', flag: '🇮🇳', x: 704, y: 245, region: 'Asia-Pacific', majorPort: 'Nhava Sheva (JNPT Mumbai)', exportShare: '$778B' },
  { id: 'bangladesh', name: 'Bangladesh', code: 'BD', flag: '🇧🇩', x: 734, y: 238, region: 'Asia-Pacific', majorPort: 'Port of Chittagong', exportShare: '$55B' },
  { id: 'china', name: 'China', code: 'CN', flag: '🇨🇳', x: 778, y: 196, region: 'Asia-Pacific', majorPort: 'Port of Shanghai / Ningbo', exportShare: '$3.38T' },
  { id: 'hong-kong', name: 'Hong Kong', code: 'HK', flag: '🇭🇰', x: 792, y: 232, region: 'Asia-Pacific', majorPort: 'Hong Kong Kwai Tsing', exportShare: '$574B' },
  { id: 'taiwan', name: 'Taiwan', code: 'TW', flag: '🇹🇼', x: 812, y: 226, region: 'Asia-Pacific', majorPort: 'Port of Kaohsiung', exportShare: '$432B' },
  { id: 'south-korea', name: 'South Korea', code: 'KR', flag: '🇰🇷', x: 824, y: 184, region: 'Asia-Pacific', majorPort: 'Port of Busan', exportShare: '$632B' },
  { id: 'japan', name: 'Japan', code: 'JP', flag: '🇯🇵', x: 858, y: 186, region: 'Asia-Pacific', majorPort: 'Port of Tokyo / Yokohama', exportShare: '$717B' },
  { id: 'thailand', name: 'Thailand', code: 'TH', flag: '🇹🇭', x: 758, y: 266, region: 'Asia-Pacific', majorPort: 'Laem Chabang Port', exportShare: '$284B' },
  { id: 'vietnam', name: 'Vietnam', code: 'VN', flag: '🇻🇳', x: 778, y: 264, region: 'Asia-Pacific', majorPort: 'Cat Lai / Hai Phong Port', exportShare: '$355B' },
  { id: 'philippines', name: 'Philippines', code: 'PH', flag: '🇵🇭', x: 816, y: 268, region: 'Asia-Pacific', majorPort: 'Port of Manila', exportShare: '$74B' },
  { id: 'malaysia', name: 'Malaysia', code: 'MY', flag: '🇲🇾', x: 764, y: 296, region: 'Asia-Pacific', majorPort: 'Port Klang', exportShare: '$312B' },
  { id: 'singapore', name: 'Singapore', code: 'SG', flag: '🇸🇬', x: 770, y: 306, region: 'Asia-Pacific', majorPort: 'Port of Singapore (PSA)', exportShare: '$476B' },
  { id: 'indonesia', name: 'Indonesia', code: 'ID', flag: '🇮🇩', x: 794, y: 322, region: 'Asia-Pacific', majorPort: 'Tanjung Priok (Jakarta)', exportShare: '$259B' },
  { id: 'australia', name: 'Australia', code: 'AU', flag: '🇦🇺', x: 842, y: 386, region: 'Asia-Pacific', majorPort: 'Port of Melbourne / Hedland', exportShare: '$371B' },
  { id: 'new-zealand', name: 'New Zealand', code: 'NZ', flag: '🇳🇿', x: 918, y: 422, region: 'Asia-Pacific', majorPort: 'Port of Tauranga', exportShare: '$44B' }
];

const ACTIVE_TRADE_CORRIDORS: TradeCorridor[] = [
  {
    id: 'corridor-eurasia-maritime',
    name: 'Asia–Europe Maritime Silk Route',
    fromId: 'china',
    toId: 'netherlands',
    viaIds: ['singapore', 'uae', 'egypt', 'germany', 'uk'],
    volumeAnnual: '$1.42T / yr',
    transitDays: '24–32 Days (FOB/CIF)',
    primaryCargo: 'Industrial Machinery, Electronics, Solar Modules & Chemicals',
    color: '#38bdf8'
  },
  {
    id: 'corridor-trans-pacific',
    name: 'Trans-Pacific East–West Express',
    fromId: 'china',
    toId: 'usa',
    viaIds: ['south-korea', 'japan', 'taiwan', 'canada'],
    volumeAnnual: '$1.18T / yr',
    transitDays: '14–19 Days (CIF/DDP)',
    primaryCargo: 'Semiconductors, Automotive Parts, Consumer Goods & Steel',
    color: '#fbbf24'
  },
  {
    id: 'corridor-imeec',
    name: 'India–Middle East–Europe Corridor (IMEEC)',
    fromId: 'india',
    toId: 'uk',
    viaIds: ['uae', 'saudi-arabia', 'turkiye', 'italy', 'germany'],
    volumeAnnual: '$640B / yr',
    transitDays: '16–22 Days (FOB/CIP)',
    primaryCargo: 'Pharmaceuticals, Agro Commodities, Textiles & Refined Metals',
    color: '#34d399'
  },
  {
    id: 'corridor-south-atlantic',
    name: 'Americas–Europe–Asia Agri & Mineral Bridge',
    fromId: 'brazil',
    toId: 'germany',
    viaIds: ['usa', 'uk', 'netherlands', 'portugal'],
    volumeAnnual: '$485B / yr',
    transitDays: '15–21 Days (CFR/FOB)',
    primaryCargo: 'Soybeans, Coffee, Sugar, Timber, Iron Ore & Bio-Energy',
    color: '#a78bfa'
  },
  {
    id: 'corridor-asean-oceania',
    name: 'ASEAN–Oceania Resource & Manufacturing Lane',
    fromId: 'australia',
    toId: 'japan',
    viaIds: ['indonesia', 'singapore', 'malaysia', 'vietnam', 'thailand'],
    volumeAnnual: '$590B / yr',
    transitDays: '10–16 Days (FOB/CIF)',
    primaryCargo: 'LNG, Lithium, Coal, Palm Oil, Rubber & Precision Assemblies',
    color: '#f472b6'
  },
  {
    id: 'corridor-africa-mena',
    name: 'Cape-to-Gulf & Mediterranean Trade Artery',
    fromId: 'south-africa',
    toId: 'uae',
    viaIds: ['egypt', 'saudi-arabia', 'turkiye', 'india'],
    volumeAnnual: '$310B / yr',
    transitDays: '12–18 Days (FOB/CFR)',
    primaryCargo: 'Precious Metals, Fertilizers, Citrus, Petrochemicals & Cement',
    color: '#fb923c'
  }
];

interface UnifiedOriginProduct {
  id: string;
  title: string;
  category: string;
  image: string;
  countryName: string;
  countryId: string;
  supplierName: string;
  priceLabel: string;
  moqLabel: string;
  verified: boolean;
  sourceProduct?: Product;
}

export const CountryTradeHubView: React.FC<CountryTradeHubViewProps> = ({
  initialCountryId = 'uk',
  products = MOCK_PRODUCTS,
  onSelectProduct,
  onOpenProductModal,
  onOpenRfqModal,
  onOpenContactModal,
  onPostRfqForCountry
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(initialCountryId);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const [activeCorridorId, setActiveCorridorId] = useState<string | null>(null);
  const [searchTerm, setSearchSearchTerm] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('ALL');
  const [showAllOriginsProducts, setShowAllOriginsProducts] = useState<boolean>(false);

  const activeHub = useMemo(
    () =>
      MAP_COUNTRY_HUBS.find(h => h.id === selectedCountryId) ||
      MAP_COUNTRY_HUBS.find(h => h.id === 'uk')!,
    [selectedCountryId]
  );

  const hoveredHub = useMemo(
    () => (hoveredCountryId ? MAP_COUNTRY_HUBS.find(h => h.id === hoveredCountryId) || null : null),
    [hoveredCountryId]
  );

  const inspectedHub = hoveredHub || activeHub;

  // Corridors connected to the selected (or hovered) country
  const connectedCorridors = useMemo(() => {
    const targetId = hoveredCountryId || selectedCountryId;
    return ACTIVE_TRADE_CORRIDORS.filter(
      c => c.fromId === targetId || c.toId === targetId || (c.viaIds && c.viaIds.includes(targetId))
    );
  }, [selectedCountryId, hoveredCountryId]);

  // Unified Origin Products combining live marketplace products + dedicated country portal catalog
  const originFilteredProducts = useMemo<UnifiedOriginProduct[]>(() => {
    const targetCountries = showAllOriginsProducts
      ? MAP_COUNTRY_HUBS
      : [activeHub];

    const list: UnifiedOriginProduct[] = [];
    const seenTitles = new Set<string>();

    targetCountries.forEach(hub => {
      const countryPortal = getCountryData(hub.id);
      const normalizedCountryName = hub.name.toLowerCase();

      // 1. Match products from main marketplace catalog by supplierCountry
      const matchingCatalogProducts = (products || []).filter(p => {
        if (!p || !p.supplierCountry) return false;
        const sc = p.supplierCountry.toLowerCase();
        if (hub.id === 'uk' && (sc.includes('united kingdom') || sc === 'uk' || sc.includes('britain'))) return true;
        if (hub.id === 'usa' && (sc.includes('united states') || sc === 'usa' || sc === 'us')) return true;
        if (hub.id === 'uae' && (sc.includes('arab emirates') || sc === 'uae' || sc.includes('dubai'))) return true;
        if (hub.id === 'turkiye' && (sc.includes('türkiye') || sc.includes('turkey'))) return true;
        return sc.includes(normalizedCountryName);
      });

      matchingCatalogProducts.forEach(prod => {
        const key = `${hub.id}:${prod.title.toLowerCase()}`;
        if (seenTitles.has(key)) return;
        seenTitles.add(key);
        list.push({
          id: prod.id,
          title: prod.title,
          category: prod.category || 'Industrial & Wholesale',
          image: prod.images?.[0] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
          countryName: hub.name,
          countryId: hub.id,
          supplierName: prod.supplierName || `${hub.name} Verified Exporter`,
          priceLabel: prod.fobPriceUsd
            ? `$${prod.fobPriceUsd.toLocaleString()} / ${prod.moqUnit || prod.unit || 'Unit'}`
            : prod.priceRangeUsd || 'FOB Direct Quote',
          moqLabel: prod.moq
            ? `${prod.moq.toLocaleString()} ${prod.moqUnit || 'Units'}`
            : prod.minOrderQuantity || '1 Container',
          verified: prod.supplierIsVerified !== false,
          sourceProduct: prod
        });
      });

      // 2. Include country portal's curated export products
      (countryPortal.latestProducts || []).forEach((cp, idx) => {
        const key = `${hub.id}:${cp.title.toLowerCase()}`;
        if (seenTitles.has(key)) return;
        seenTitles.add(key);
        const matchedSupplier =
          countryPortal.premiumSuppliers?.[idx % Math.max(1, countryPortal.premiumSuppliers.length)]?.name ||
          `${hub.name} Export Consortium`;
        list.push({
          id: `${hub.id}-${cp.id}`,
          title: cp.title,
          category: cp.category || 'Export Goods',
          image: cp.image,
          countryName: hub.name,
          countryId: hub.id,
          supplierName: matchedSupplier,
          priceLabel: 'Factory FOB Price',
          moqLabel: '1x20ft FCL / Wholesale Lot',
          verified: true
        });
      });
    });

    return list.filter(item => {
      const matchesCat =
        selectedProductCategory === 'ALL' ||
        item.category.toLowerCase() === selectedProductCategory.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeHub, products, showAllOriginsProducts, selectedProductCategory, searchTerm]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    const portal = getCountryData(activeHub.id);
    (portal.latestProducts || []).forEach(p => {
      if (p.category) cats.add(p.category);
    });
    (products || []).forEach(p => {
      if (p?.category) cats.add(p.category);
    });
    return ['ALL', ...Array.from(cats).slice(0, 8)];
  }, [activeHub.id, products]);

  const visibleMapHubs = useMemo(() => {
    return MAP_COUNTRY_HUBS.filter(hub => {
      if (selectedRegionFilter !== 'ALL' && hub.region !== selectedRegionFilter) return false;
      return true;
    });
  }, [selectedRegionFilter]);

  const handleSelectCountryOnMap = (countryId: string) => {
    setSelectedCountryId(countryId);
    setShowAllOriginsProducts(false);
    setSelectedProductCategory('ALL');
  };

  // Helper to construct smooth quadratic SVG curve between two map hubs
  const getCorridorPath = (fromId: string, toId: string) => {
    const from = MAP_COUNTRY_HUBS.find(h => h.id === fromId);
    const to = MAP_COUNTRY_HUBS.find(h => h.id === toId);
    if (!from || !to) return '';
    const midX = (from.x + to.x) / 2;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const curveOffset = Math.min(85, Math.max(28, dist * 0.2));
    const midY = Math.min(from.y, to.y) - curveOffset;
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* GLOBAL HUB HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold tracking-wide uppercase">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span>Trade Heaven Global Country Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              B2B Suppliers &amp; Exporters Directory By Country
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore 34+ dedicated national trade portals, inspect active maritime trade corridors on the interactive world map, and click any country to filter verified export products by origin.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80 space-y-1.5 shrink-0">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Search Country or Export Product:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country, port, or product..."
                value={searchTerm}
                onChange={(e) => setSearchSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Quick Country Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Popular Hubs:</span>
          {['uk', 'usa', 'india', 'germany', 'uae', 'china', 'brazil', 'australia', 'japan', 'singapore'].map(cid => {
            const item = ALL_COUNTRY_ITEMS.find(x => x.id === cid);
            if (!item) return null;
            const isSelected = selectedCountryId === cid && !showAllOriginsProducts;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => handleSelectCountryOnMap(cid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
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

      {/* INTERACTIVE SVG WORLD MAP & ACTIVE TRADE CORRIDORS CONSOLE */}
      <section
        id="interactive-world-trade-map-section"
        className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Map Top Control Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
              <Ship className="w-4 h-4" />
              <span>Interactive Origin &amp; Maritime Trade Corridor Map</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 font-normal">
                Click any country node to filter products by origin
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Global Supply Corridors &amp; Country-of-Origin Product Filter
            </h2>
          </div>

          {/* Region Filter Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'Americas', 'Europe', 'Middle East & Africa', 'Asia-Pacific'] as const).map(region => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegionFilter(region)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedRegionFilter === region
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {region === 'ALL' ? 'All Regions (34)' : region}
              </button>
            ))}
          </div>
        </div>

        {/* Main SVG Map + Live Telemetry Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* SVG World Map Viewport */}
          <div className="lg:col-span-8 relative bg-[#071124] p-3 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-[#050d1d]">
              <svg
                viewBox="0 0 1000 480"
                className="w-full h-auto block select-none"
                role="img"
                aria-label="Interactive global trade corridors and country origin filter world map"
              >
                <defs>
                  <radialGradient id="oceanGlow" cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#0f284e" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#040b18" stopOpacity="1" />
                  </radialGradient>
                  <linearGradient id="continentFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Ocean Backdrop */}
                <rect width="1000" height="480" fill="url(#oceanGlow)" />

                {/* Subtle Graticule Grid Lines */}
                {[80, 160, 240, 320, 400].map(y => (
                  <line
                    key={`lat-${y}`}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth={y === 240 ? '1' : '0.6'}
                    strokeDasharray={y === 240 ? '4 4' : '2 6'}
                    opacity="0.65"
                  />
                ))}
                {[160, 320, 480, 640, 800].map(x => (
                  <line
                    key={`lon-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="480"
                    stroke="#1e293b"
                    strokeWidth="0.6"
                    strokeDasharray="2 6"
                    opacity="0.55"
                  />
                ))}

                {/* Stylized Continental Landmass Polygons */}
                <g fill="url(#continentFill)" stroke="#334155" strokeWidth="1.2" opacity="0.92">
                  {/* North & Central America */}
                  <path d="M 75 72 L 165 58 L 265 68 L 308 112 L 268 175 L 236 218 L 195 236 L 164 212 L 132 168 L 88 124 Z" />
                  {/* Greenland */}
                  <path d="M 325 42 L 395 36 L 410 75 L 352 88 Z" />
                  {/* South America */}
                  <path d="M 256 248 L 332 256 L 378 312 L 352 396 L 304 445 L 278 412 L 262 325 Z" />
                  {/* Europe */}
                  <path d="M 445 88 L 515 72 L 588 86 L 604 148 L 575 190 L 518 192 L 452 184 L 442 142 Z" />
                  {/* Africa */}
                  <path d="M 446 204 L 548 198 L 606 248 L 616 312 L 568 402 L 522 406 L 494 334 L 442 276 Z" />
                  {/* Asia & Middle East */}
                  <path d="M 588 92 L 735 74 L 892 96 L 912 168 L 856 238 L 792 288 L 742 282 L 698 268 L 634 256 L 584 214 Z" />
                  {/* Maritime Southeast Asia & Japan */}
                  <path d="M 756 292 L 832 296 L 848 336 L 764 338 Z" />
                  {/* Oceania / Australia */}
                  <path d="M 778 352 L 882 348 L 902 406 L 826 422 L 774 396 Z" />
                  {/* New Zealand */}
                  <path d="M 910 408 L 934 414 L 926 438 L 904 430 Z" />
                </g>

                {/* Active Global Maritime Trade Corridors */}
                <g>
                  {ACTIVE_TRADE_CORRIDORS.map(corridor => {
                    const isHighlighted =
                      activeCorridorId === corridor.id ||
                      connectedCorridors.some(c => c.id === corridor.id);

                    // Build multi-leg segments including via hubs
                    const legPoints = [
                      corridor.fromId,
                      ...(corridor.viaIds || []).slice(0, 2),
                      corridor.toId
                    ];

                    return (
                      <g
                        key={corridor.id}
                        className="cursor-pointer"
                        onClick={() =>
                          setActiveCorridorId(prev => (prev === corridor.id ? null : corridor.id))
                        }
                      >
                        {legPoints.slice(0, -1).map((startId, idx) => {
                          const endId = legPoints[idx + 1];
                          const d = getCorridorPath(startId, endId);
                          if (!d) return null;
                          return (
                            <React.Fragment key={`${corridor.id}-${startId}-${endId}`}>
                              {/* Soft outer corridor track glow */}
                              <path
                                d={d}
                                fill="none"
                                stroke={corridor.color}
                                strokeWidth={isHighlighted ? 5 : 2}
                                strokeOpacity={isHighlighted ? 0.22 : 0.08}
                                strokeLinecap="round"
                              />
                              {/* Animated dashed directional trade flow path */}
                              <path
                                d={d}
                                fill="none"
                                stroke={corridor.color}
                                strokeWidth={isHighlighted ? 2.2 : 1.2}
                                strokeOpacity={isHighlighted ? 0.92 : 0.42}
                                strokeLinecap="round"
                                className={
                                  isHighlighted
                                    ? 'trade-flow-line-active'
                                    : 'trade-flow-line-ambient'
                                }
                              />
                              {/* High-contrast moving trade shipment stream along highlighted corridors */}
                              {isHighlighted && (
                                <path
                                  d={d}
                                  fill="none"
                                  stroke="#ffffff"
                                  strokeWidth="2.6"
                                  strokeOpacity="0.9"
                                  strokeLinecap="round"
                                  className="trade-flow-packet"
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>

                {/* Interactive Country Nodes */}
                <g>
                  {visibleMapHubs.map(hub => {
                    const isSelected = hub.id === selectedCountryId && !showAllOriginsProducts;
                    const isHovered = hub.id === hoveredCountryId;
                    const isCorridorPeer = connectedCorridors.some(
                      c =>
                        c.fromId === hub.id ||
                        c.toId === hub.id ||
                        (c.viaIds && c.viaIds.includes(hub.id))
                    );

                    return (
                      <g
                        key={hub.id}
                        transform={`translate(${hub.x}, ${hub.y})`}
                        onClick={() => handleSelectCountryOnMap(hub.id)}
                        onMouseEnter={() => setHoveredCountryId(hub.id)}
                        onMouseLeave={() => setHoveredCountryId(null)}
                        className="cursor-pointer group"
                      >
                        {/* Outer animated beacon ring for selected or hovered country */}
                        {(isSelected || isHovered) && (
                          <circle
                            r={isSelected ? 13 : 10}
                            fill="none"
                            stroke={isSelected ? '#fbbf24' : '#38bdf8'}
                            strokeWidth="1.8"
                            opacity="0.85"
                            className="hub-beacon-ring"
                          />
                        )}

                        {/* Main clickable node circle */}
                        <circle
                          r={isSelected ? 6.5 : isHovered ? 6 : isCorridorPeer ? 4.5 : 3.6}
                          fill={
                            isSelected
                              ? '#fbbf24'
                              : isHovered
                              ? '#38bdf8'
                              : isCorridorPeer
                              ? '#60a5fa'
                              : '#94a3b8'
                          }
                          stroke="#020617"
                          strokeWidth="1.5"
                        />

                        {/* Country Code / Label on Map */}
                        {(isSelected ||
                          isHovered ||
                          ['usa', 'uk', 'germany', 'india', 'china', 'uae', 'brazil', 'australia', 'japan', 'singapore', 'south-africa'].includes(
                            hub.id
                          )) && (
                          <g transform="translate(0, -10)">
                            <rect
                              x={-hub.code.length * 4 - 6}
                              y={-11}
                              width={hub.code.length * 8 + 12}
                              height={14}
                              rx={4}
                              fill={isSelected ? '#fbbf24' : '#0f172a'}
                              stroke={isSelected ? '#f59e0b' : '#334155'}
                              strokeWidth="0.8"
                              opacity="0.95"
                            />
                            <text
                              x="0"
                              y="-1.5"
                              textAnchor="middle"
                              fontSize="8.5"
                              fontWeight="800"
                              fill={isSelected ? '#020617' : '#f8fafc'}
                            >
                              {hub.code}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Floating Map Legend Overlay */}
              <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span>Selected Origin ({activeHub.name})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                    <span>Corridor Partner Hubs</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 bg-sky-400 inline-block" />
                    <span>Active Maritime Route ({connectedCorridors.length} Active)</span>
                  </span>
                </div>
                <div className="text-slate-400">
                  Tip: Click any country marker to filter products below by country of origin
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Selected Country Origin Telemetry & Active Trade Corridors */}
          <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between space-y-5 bg-slate-900/40">
            <div className="space-y-4">
              {/* Inspected Country Header */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none">{inspectedHub.flag}</span>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {inspectedHub.region} · ISO {inspectedHub.code}
                      </div>
                      <h3 className="text-lg font-black text-white leading-tight">
                        {inspectedHub.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {inspectedHub.exportShare} Exports
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-slate-400">Primary Gateway Port:</span>
                  <span className="font-semibold text-white">{inspectedHub.majorPort}</span>
                </div>
              </div>

              {/* Active Trade Corridors List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Trade Corridors ({connectedCorridors.length || ACTIVE_TRADE_CORRIDORS.length})
                  </h4>
                  {activeCorridorId && (
                    <button
                      type="button"
                      onClick={() => setActiveCorridorId(null)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                      Show All Routes
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(connectedCorridors.length > 0 ? connectedCorridors : ACTIVE_TRADE_CORRIDORS).map(
                    corridor => {
                      const isSelectedCorridor = activeCorridorId === corridor.id;
                      const fromHub = MAP_COUNTRY_HUBS.find(h => h.id === corridor.fromId);
                      const toHub = MAP_COUNTRY_HUBS.find(h => h.id === corridor.toId);
                      return (
                        <button
                          key={corridor.id}
                          type="button"
                          onClick={() => {
                            setActiveCorridorId(prev =>
                              prev === corridor.id ? null : corridor.id
                            );
                            handleSelectCountryOnMap(corridor.fromId);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                            isSelectedCorridor
                              ? 'bg-slate-800/90 border-sky-400/70'
                              : 'bg-slate-900/70 hover:bg-slate-800/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: corridor.color }}
                              />
                              <span className="truncate">{corridor.name}</span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                              {corridor.volumeAnnual}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <span>
                              {fromHub?.flag} {fromHub?.name}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span>
                              {toHub?.flag} {toHub?.name}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400">{corridor.transitDays}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {corridor.primaryCargo}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action to Jump to Full Country Portal */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Showing <strong className="text-white">{originFilteredProducts.length}</strong> verified export products
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('origin-filtered-products-showcase');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>View Origin Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ORIGIN-FILTERED PRODUCTS SHOWCASE BAR */}
        <div
          id="origin-filtered-products-showcase"
          className="p-5 sm:p-6 bg-slate-900/90 border-t border-slate-800 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                <Package className="w-4 h-4" />
                <span>
                  {showAllOriginsProducts
                    ? 'Global Origin Catalog (All 34 Country Portals)'
                    : `Origin Filter Active: ${activeHub.flag} ${activeHub.name} (${activeHub.code})`}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {showAllOriginsProducts
                  ? 'Verified Export Products Across All Active Trade Corridors'
                  : `Verified Export Products Originating from ${activeHub.name}`}
              </h3>
            </div>

            {/* Origin Scope & Category Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllOriginsProducts(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  showAllOriginsProducts
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {showAllOriginsProducts
                    ? `Filter by ${activeHub.name} Only`
                    : 'Show All Country Origins'}
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedProductCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtered Origin Product Cards Grid */}
          {originFilteredProducts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-300 font-semibold">
                No products matched your current category or keyword filter for {activeHub.name}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductCategory('ALL');
                  setSearchSearchTerm('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Reset Product Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {originFilteredProducts.slice(0, 8).map(item => (
                <div
                  key={item.id}
                  className="bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                      <SafeImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Origin: {item.countryName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <div className="text-xs text-slate-300 truncate">
                        Supplier: <span className="font-semibold text-white">{item.supplierName}</span>
                      </div>
                      <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-800/80">
                        <span className="font-mono font-bold text-amber-300">{item.priceLabel}</span>
                        <span className="text-[11px] text-slate-400">MOQ: {item.moqLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.sourceProduct && onSelectProduct) {
                          onSelectProduct(item.sourceProduct);
                        } else if (onOpenProductModal) {
                          onOpenProductModal(item.title);
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-colors cursor-pointer"
                    >
                      Inspect Product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenContactModal) {
                          onOpenContactModal(item.supplierName, item.countryName);
                        } else if (onOpenProductModal) {
                          onOpenProductModal(item.title);
                        }
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DYNAMIC PORTAL VIEW FOR SELECTED COUNTRY */}
      <CountryB2bPortalView
        countryId={selectedCountryId}
        onSelectCountry={(cid) => handleSelectCountryOnMap(cid)}
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
          handleSelectCountryOnMap(cid);
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
