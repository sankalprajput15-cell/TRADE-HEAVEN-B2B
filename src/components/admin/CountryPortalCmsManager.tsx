import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  COUNTRIES_DATA,
  CountryData,
  CountrySupplier,
  CountryProduct,
  CountryBuyOffer,
  CountryVerifiedBuyer,
  getCountryTradeProfile,
  saveSingleCountryPortalOverride,
  resetSingleCountryPortalOverride,
  resolveWorldCountryMeta
} from '../../data/countriesData';
import { WORLD_COUNTRIES_LIST, WorldCountryMeta } from '../../data/worldCountriesAndBuyOrders';
import { bigrockApi } from '../../services/bigrockApi';
import { CountryFlag } from '../common/CountryFlag';
import { SafeImage } from '../common/SafeImage';
import {
  Globe,
  Search,
  Plus,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  Building2,
  Package,
  Users,
  FileText,
  CheckCircle2,
  RotateCcw,
  X,
  ExternalLink,
  Loader2,
  Award,
  SlidersHorizontal
} from 'lucide-react';

export type CountryCmsSectionTab = 'hero' | 'suppliers' | 'products' | 'buyers' | 'seo';

interface CountryPortalCmsManagerProps {
  initialCountryId?: string;
  initialSection?: CountryCmsSectionTab;
  compactModalMode?: boolean;
  onClose?: () => void;
  onSaved?: (countryId: string) => void;
  onPreviewLiveCountry?: (countryId: string) => void;
}

interface CountryDraftState {
  id: string;
  name: string;
  code: string;
  flag: string;
  heroBannerImage: string;
  primaryPort: string;
  complianceStandardsText: string;
  tradeCurrency: string;
  transitSummary: string;
  statsCompanies: number;
  statsProducts: number;
  statsRfqs: number;
  topExportsText: string;
  topImportsText: string;
  premiumSuppliers: CountrySupplier[];
  latestSuppliers: CountrySupplier[];
  latestProducts: CountryProduct[];
  verifiedBuyers: CountryVerifiedBuyer[];
  latestBuyOffers: CountryBuyOffer[];
  seoHeadline: string;
  seoSections: { title: string; body: string }[];
}

function buildDraftFromCountry(countryId: string): CountryDraftState {
  const profile = getCountryTradeProfile(countryId);
  const sections = profile.seoDescription?.sections || [];
  const paddedSections = [0, 1, 2, 3].map(idx => ({
    title: sections[idx]?.title || `Section ${idx + 1}`,
    body: sections[idx]?.body || ''
  }));

  return {
    id: profile.id,
    name: profile.name,
    code: profile.code,
    flag: profile.flag,
    heroBannerImage: profile.heroBannerImage || '',
    primaryPort: profile.primaryPort || '',
    complianceStandardsText: (profile.complianceStandards || []).join(', '),
    tradeCurrency: profile.tradeCurrency || 'USD',
    transitSummary: profile.transitSummary || '14–24 Days Ocean · 3–5 Days Air',
    statsCompanies: profile.stats.companies,
    statsProducts: profile.stats.products,
    statsRfqs: profile.stats.rfqs,
    topExportsText: (profile.topExports || []).join(', '),
    topImportsText: (profile.topImports || []).join(', '),
    premiumSuppliers: [...(profile.premiumSuppliers || [])],
    latestSuppliers: [...(profile.latestSuppliers || [])],
    latestProducts: [...(profile.latestProducts || [])],
    verifiedBuyers: [...(profile.verifiedBuyers || [])],
    latestBuyOffers: [...(profile.latestBuyOffers || [])],
    seoHeadline:
      profile.seoDescription?.headline ||
      `THE PREMIER B2B TRADE MARKETPLACE IN ${profile.name.toUpperCase()} – TRADE HEAVEN`,
    seoSections: paddedSections
  };
}

export const CountryPortalCmsManager: React.FC<CountryPortalCmsManagerProps> = ({
  initialCountryId = 'uk',
  initialSection = 'hero',
  compactModalMode = false,
  onClose,
  onSaved,
  onPreviewLiveCountry
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(() =>
    resolveWorldCountryMeta(initialCountryId).id
  );
  const [sectionTab, setSectionTab] = useState<CountryCmsSectionTab>(initialSection);
  const [draft, setDraft] = useState<CountryDraftState>(() => buildDraftFromCountry(initialCountryId));

  // Country list filters (Admin Dashboard mode)
  const [countrySearch, setCountrySearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'CUSTOMIZED' | WorldCountryMeta['region']>('ALL');
  const [isAddingNewCountry, setIsAddingNewCountry] = useState(false);

  // Upload & save status
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [revision, setRevision] = useState(0);

  // Quick Add Forms
  const [newSupplierGroup, setNewSupplierGroup] = useState<'premium' | 'latest'>('premium');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    city: '',
    mainProduct: '',
    website: '',
    tier: 'Gold Member' as 'Gold Member' | 'Silver Member',
    logo: ''
  });

  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Industrial Machinery',
    moq: '20 MT / 1 FCL',
    fobRange: '$450 – $980 / MT',
    image: ''
  });

  const [newBuyer, setNewBuyer] = useState({
    companyName: '',
    city: '',
    annualVolume: '$5.0M / yr',
    targetProducts: '',
    orderFrequency: 'Monthly FCL',
    preferredIncoterms: 'CIF / FOB · Escrow'
  });

  const [newOffer, setNewOffer] = useState({
    title: '',
    quantity: '25 MT',
    incoterm: 'CIF',
    category: 'Wholesale Trade'
  });

  const heroFileInputRef = useRef<HTMLInputElement | null>(null);
  const newSupplierLogoInputRef = useRef<HTMLInputElement | null>(null);
  const newProductImgInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const resolvedId = resolveWorldCountryMeta(initialCountryId).id;
    setSelectedCountryId(resolvedId);
    setDraft(buildDraftFromCountry(resolvedId));
    setIsAddingNewCountry(false);
  }, [initialCountryId]);

  useEffect(() => {
    setSectionTab(initialSection);
  }, [initialSection]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleSelectCountry = (countryId: string) => {
    const resolvedId = resolveWorldCountryMeta(countryId).id;
    setSelectedCountryId(resolvedId);
    setDraft(buildDraftFromCountry(resolvedId));
    setIsAddingNewCountry(false);
  };

  const handleStartNewCountry = () => {
    setIsAddingNewCountry(true);
    setSectionTab('hero');
    setDraft({
      id: '',
      name: '',
      code: '',
      flag: '🌐',
      heroBannerImage: '',
      primaryPort: '',
      complianceStandardsText: 'ISO 9001:2015, SGS Inspected, Export License Verified',
      tradeCurrency: 'USD / Local',
      transitSummary: '14–24 Days Ocean · 3–5 Days Air',
      statsCompanies: 1850,
      statsProducts: 2640,
      statsRfqs: 540,
      topExportsText: 'Industrial Machinery, Agricultural Commodities, Textiles, Chemicals',
      topImportsText: 'Electronics, Construction Steel, Solar Modules, Packaging Materials',
      premiumSuppliers: [],
      latestSuppliers: [],
      latestProducts: [],
      verifiedBuyers: [],
      latestBuyOffers: [],
      seoHeadline: '',
      seoSections: [
        { title: 'Cross-Border B2B Trade Hub', body: '' },
        { title: 'Verified Suppliers & Direct Buyers', body: '' },
        { title: 'Gateway Logistics & Escrow Protection', body: '' },
        { title: 'Start Sourcing on Trade Heaven', body: '' }
      ]
    });
  };

  const uploadImageFile = async (file: File, key: string): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (JPG, PNG, or WebP).');
      return null;
    }
    setUploadingKey(key);
    try {
      const res = await bigrockApi.uploadFile(file, 'country-portals');
      if (res.success && (res.url || res.publicUrl)) {
        showToast('success', 'Image uploaded and stamped with Trade Heaven SEO metadata.');
        return res.url || res.publicUrl || null;
      }
      showToast('error', res.error || 'Image upload failed. Please try again.');
      return null;
    } catch {
      showToast('error', 'Upload error occurred.');
      return null;
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSavePortal = () => {
    const cleanId = (draft.id || draft.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanId || !draft.name.trim()) {
      showToast('error', 'Country Name and Slug ID are required.');
      return;
    }

    const cleanCode = (draft.code || cleanId.slice(0, 2)).toUpperCase().trim().slice(0, 2);
    const exportsArr = draft.topExportsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const importsArr = draft.topImportsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const complianceArr = draft.complianceStandardsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const seoCopy = {
      headline:
        draft.seoHeadline.trim() ||
        `THE PREMIER B2B TRADE MARKETPLACE IN ${draft.name.trim().toUpperCase()} – TRADE HEAVEN`,
      sections: draft.seoSections.filter(s => s.title.trim() || s.body.trim())
    };

    const payload: CountryData = {
      id: cleanId,
      name: draft.name.trim(),
      code: cleanCode,
      flag: draft.flag.trim() || '🌐',
      heroBannerImage: draft.heroBannerImage.trim() || undefined,
      primaryPort: draft.primaryPort.trim() || undefined,
      complianceStandards: complianceArr.length > 0 ? complianceArr : undefined,
      tradeCurrency: draft.tradeCurrency.trim() || undefined,
      transitSummary: draft.transitSummary.trim() || undefined,
      stats: {
        companies: Math.max(0, Number(draft.statsCompanies) || 0),
        products: Math.max(0, Number(draft.statsProducts) || 0),
        rfqs: Math.max(0, Number(draft.statsRfqs) || 0)
      },
      topExports: exportsArr,
      topImports: importsArr,
      premiumSuppliers: draft.premiumSuppliers,
      latestSuppliers: draft.latestSuppliers,
      latestProducts: draft.latestProducts,
      latestBuyOffers: draft.latestBuyOffers,
      verifiedBuyers: draft.verifiedBuyers,
      seoDescription: seoCopy
    };

    saveSingleCountryPortalOverride(cleanId, payload, seoCopy);
    setSelectedCountryId(cleanId);
    setIsAddingNewCountry(false);
    setRevision(r => r + 1);
    showToast('success', `Saved ${payload.name} portal & images live.`);
    if (onSaved) onSaved(cleanId);
  };

  const handleResetToDefaults = () => {
    if (!selectedCountryId) return;
    resetSingleCountryPortalOverride(selectedCountryId);
    setDraft(buildDraftFromCountry(selectedCountryId));
    setRevision(r => r + 1);
    showToast('success', `Restored default template for ${draft.name}.`);
    if (onSaved) onSaved(selectedCountryId);
  };

  // Add Supplier
  const handleAddSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.mainProduct.trim()) {
      showToast('error', 'Enter supplier company name and main products.');
      return;
    }
    const created: CountrySupplier = {
      id: `${draft.id || 'country'}_sup_${Date.now()}`,
      name: newSupplier.name.trim(),
      city: newSupplier.city.trim() || draft.primaryPort.split('/')[0].trim() || draft.name,
      country: draft.name,
      website: newSupplier.website.trim() || undefined,
      tier: newSupplier.tier,
      verified: true,
      mainProduct: newSupplier.mainProduct.trim(),
      logo: newSupplier.logo.trim() || undefined,
      responseRate: '99%',
      yearsActive: 6
    };

    setDraft(prev => ({
      ...prev,
      premiumSuppliers:
        newSupplierGroup === 'premium' ? [created, ...prev.premiumSuppliers] : prev.premiumSuppliers,
      latestSuppliers:
        newSupplierGroup === 'latest' ? [created, ...prev.latestSuppliers] : prev.latestSuppliers
    }));
    setNewSupplier({
      name: '',
      city: '',
      mainProduct: '',
      website: '',
      tier: 'Gold Member',
      logo: ''
    });
    showToast('success', 'Supplier added to draft. Click "Save Country Portal" to publish.');
  };

  // Add Product
  const handleAddProduct = () => {
    if (!newProduct.title.trim()) {
      showToast('error', 'Enter product title.');
      return;
    }
    const created: CountryProduct = {
      id: `${draft.id || 'country'}_prod_${Date.now()}`,
      title: newProduct.title.trim(),
      category: newProduct.category.trim() || 'Wholesale Export',
      image: newProduct.image.trim(),
      moq: newProduct.moq.trim() || '1 Container',
      fobRange: newProduct.fobRange.trim() || 'Request FOB Quote'
    };
    setDraft(prev => ({
      ...prev,
      latestProducts: [created, ...prev.latestProducts]
    }));
    setNewProduct({
      title: '',
      category: 'Industrial Machinery',
      moq: '20 MT / 1 FCL',
      fobRange: '$450 – $980 / MT',
      image: ''
    });
    showToast('success', 'Product added to draft. Click "Save Country Portal" to publish.');
  };

  // Add Verified Buyer
  const handleAddBuyer = () => {
    if (!newBuyer.companyName.trim()) {
      showToast('error', 'Enter buyer company name.');
      return;
    }
    const created: CountryVerifiedBuyer = {
      id: `${draft.id || 'country'}_buyer_${Date.now()}`,
      companyName: newBuyer.companyName.trim(),
      city: newBuyer.city.trim() || draft.primaryPort.split('/')[0].trim() || draft.name,
      country: draft.name,
      annualVolume: newBuyer.annualVolume.trim() || '$4.0M / yr',
      targetProducts: newBuyer.targetProducts
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      orderFrequency: newBuyer.orderFrequency.trim() || 'Monthly',
      preferredIncoterms: newBuyer.preferredIncoterms.trim() || 'CIF / FOB',
      verifiedSince: new Date().getFullYear()
    };
    setDraft(prev => ({
      ...prev,
      verifiedBuyers: [created, ...prev.verifiedBuyers]
    }));
    setNewBuyer({
      companyName: '',
      city: '',
      annualVolume: '$5.0M / yr',
      targetProducts: '',
      orderFrequency: 'Monthly FCL',
      preferredIncoterms: 'CIF / FOB · Escrow'
    });
    showToast('success', 'Verified Buyer added to draft. Click "Save Country Portal" to publish.');
  };

  // Add Buy Offer
  const handleAddBuyOffer = () => {
    if (!newOffer.title.trim()) {
      showToast('error', 'Enter buy offer requirement title.');
      return;
    }
    const created: CountryBuyOffer = {
      id: `${draft.id || 'country'}_offer_${Date.now()}`,
      title: newOffer.title.trim(),
      date: 'Recent',
      quantity: newOffer.quantity.trim() || '20 MT',
      buyerCountry: draft.name,
      category: newOffer.category.trim() || 'Wholesale Trade',
      incoterm: newOffer.incoterm.trim() || 'CIF'
    };
    setDraft(prev => ({
      ...prev,
      latestBuyOffers: [created, ...prev.latestBuyOffers]
    }));
    setNewOffer({
      title: '',
      quantity: '25 MT',
      incoterm: 'CIF',
      category: 'Wholesale Trade'
    });
    showToast('success', 'Buy Offer added to draft. Click "Save Country Portal" to publish.');
  };

  const filteredWorldCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    return WORLD_COUNTRIES_LIST.filter(c => {
      if (regionFilter === 'CUSTOMIZED') {
        if (!COUNTRIES_DATA[c.id]) return false;
      } else if (regionFilter !== 'ALL' && c.region !== regionFilter) {
        return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.port.toLowerCase().includes(q)
      );
    });
  }, [countrySearch, regionFilter, revision]);

  const editorBody = (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
      {/* Editor Header */}
      <div className="px-5 py-4 bg-[#0B1F3A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {!isAddingNewCountry && <CountryFlag country={draft.code} size="md" />}
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {isAddingNewCountry ? 'Create New Country Portal' : `Editing Country Portal · ISO ${draft.code}`}
            </div>
            <h2 className="text-base sm:text-lg font-black truncate">
              {isAddingNewCountry ? 'New Country / Territory' : `${draft.name} — Buyers, Suppliers & Media`}
            </h2>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {!isAddingNewCountry && onPreviewLiveCountry && (
            <button
              type="button"
              onClick={() => onPreviewLiveCountry(selectedCountryId)}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live</span>
            </button>
          )}
          {!isAddingNewCountry && COUNTRIES_DATA[selectedCountryId] && (
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-rose-600/80 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Reset this country back to generated defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSavePortal}
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Country Portal</span>
          </button>
          {compactModalMode && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Close editor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Toast feedback */}
      {toast && (
        <div
          className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-b border-rose-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.text}</span>
          </span>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Sub-Tabs */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        {(
          [
            { id: 'hero', label: 'Hero Banner & Overview', icon: ImageIcon },
            {
              id: 'suppliers',
              label: `Suppliers & Logos (${draft.premiumSuppliers.length + draft.latestSuppliers.length})`,
              icon: Building2
            },
            { id: 'products', label: `Products & Photos (${draft.latestProducts.length})`, icon: Package },
            {
              id: 'buyers',
              label: `Buyers & Offers (${draft.verifiedBuyers.length + draft.latestBuyOffers.length})`,
              icon: Users
            },
            { id: 'seo', label: 'SEO Guide Text', icon: FileText }
          ] as const
        ).map(tab => {
          const Icon = tab.icon;
          const active = sectionTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSectionTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-[#0F294D] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
        {/* TAB 1: HERO BANNER, STATS, PORT & EXPORTS/IMPORTS */}
        {sectionTab === 'hero' && (
          <div className="space-y-6">
            {/* Hero Banner Image Uploader */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Country Hero Banner Image
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Upload a custom skyline, port, or trade landmark photo (16:9 recommended) for {draft.name || 'this country'}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      const url = await uploadImageFile(file, 'hero-banner');
                      if (url) setDraft(prev => ({ ...prev, heroBannerImage: url }));
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingKey === 'hero-banner'}
                    onClick={() => heroFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-[#0F294D] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  >
                    {uploadingKey === 'hero-banner' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Banner Photo</span>
                  </button>
                  {draft.heroBannerImage && (
                    <button
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, heroBannerImage: '' }))}
                      className="px-2.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      Use Default
                    </button>
                  )}
                </div>
              </div>

              {draft.heroBannerImage && (
                <div className="relative h-36 rounded-lg overflow-hidden border border-slate-300 bg-slate-900">
                  <img
                    src={draft.heroBannerImage}
                    alt={`${draft.name} custom hero banner preview`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Or Paste Direct Banner Image URL
                </label>
                <input
                  type="text"
                  value={draft.heroBannerImage}
                  onChange={e => setDraft(prev => ({ ...prev, heroBannerImage: e.target.value }))}
                  placeholder="/assets/uploads/trade-heaven-...jpg or https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Identity & Trade Desk Facts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isAddingNewCountry && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    URL Slug ID *
                  </label>
                  <input
                    type="text"
                    value={draft.id}
                    onChange={e => setDraft(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. united-kingdom"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Country Display Name *
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  ISO 2-Letter Code
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={draft.code}
                  onChange={e => setDraft(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Primary Gateway Port
                </label>
                <input
                  type="text"
                  value={draft.primaryPort}
                  onChange={e => setDraft(prev => ({ ...prev, primaryPort: e.target.value }))}
                  placeholder="e.g. Port of Felixstowe / London Gateway"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Trade Currency
                </label>
                <input
                  type="text"
                  value={draft.tradeCurrency}
                  onChange={e => setDraft(prev => ({ ...prev, tradeCurrency: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Transit Summary
                </label>
                <input
                  type="text"
                  value={draft.transitSummary}
                  onChange={e => setDraft(prev => ({ ...prev, transitSummary: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Verified Companies Count
                </label>
                <input
                  type="number"
                  value={draft.statsCompanies}
                  onChange={e => setDraft(prev => ({ ...prev, statsCompanies: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold tabular-nums text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Wholesale Products Count
                </label>
                <input
                  type="number"
                  value={draft.statsProducts}
                  onChange={e => setDraft(prev => ({ ...prev, statsProducts: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold tabular-nums text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Active RFQs Count
                </label>
                <input
                  type="number"
                  value={draft.statsRfqs}
                  onChange={e => setDraft(prev => ({ ...prev, statsRfqs: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold tabular-nums text-slate-900"
                />
              </div>
            </div>

            {/* Compliance, Top Exports, Top Imports */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Compliance &amp; Customs Standards (comma-separated)
                </label>
                <input
                  type="text"
                  value={draft.complianceStandardsText}
                  onChange={e => setDraft(prev => ({ ...prev, complianceStandardsText: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Top Exports of {draft.name} (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={draft.topExportsText}
                  onChange={e => setDraft(prev => ({ ...prev, topExportsText: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Top Imports of {draft.name} (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={draft.topImportsText}
                  onChange={e => setDraft(prev => ({ ...prev, topImportsText: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPPLIERS (PREMIUM & LATEST) + LOGO UPLOADS */}
        {sectionTab === 'suppliers' && (
          <div className="space-y-6">
            {/* Add New Supplier Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Add New Supplier to {draft.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewSupplierGroup('premium')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                      newSupplierGroup === 'premium'
                        ? 'bg-[#0F294D] text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    Premium Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSupplierGroup('latest')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                      newSupplierGroup === 'latest'
                        ? 'bg-[#0F294D] text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    Latest Supplier
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="City / Industrial Zone"
                  value={newSupplier.city}
                  onChange={e => setNewSupplier(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Main Products *"
                  value={newSupplier.mainProduct}
                  onChange={e => setNewSupplier(prev => ({ ...prev, mainProduct: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Website (optional, e.g. www.company.com)"
                  value={newSupplier.website}
                  onChange={e => setNewSupplier(prev => ({ ...prev, website: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <select
                  value={newSupplier.tier}
                  onChange={e =>
                    setNewSupplier(prev => ({
                      ...prev,
                      tier: e.target.value as 'Gold Member' | 'Silver Member'
                    }))
                  }
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
                >
                  <option value="Gold Member">Gold Member</option>
                  <option value="Silver Member">Silver Member</option>
                </select>

                <div className="flex items-center gap-2">
                  <input
                    ref={newSupplierLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      const url = await uploadImageFile(file, 'new-supplier-logo');
                      if (url) setNewSupplier(prev => ({ ...prev, logo: url }));
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingKey === 'new-supplier-logo'}
                    onClick={() => newSupplierLogoInputRef.current?.click()}
                    className="flex-1 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {uploadingKey === 'new-supplier-logo' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-700" />
                    )}
                    <span>{newSupplier.logo ? 'Logo Uploaded ✓' : 'Upload Logo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSupplier}
                    className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Premium Suppliers */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Premium Suppliers ({draft.premiumSuppliers.length})</span>
              </h3>
              <div className="space-y-2">
                {draft.premiumSuppliers.map((sup, idx) => (
                  <div
                    key={sup.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center font-black text-xs text-slate-700 shrink-0">
                        {sup.logo ? (
                          <img src={sup.logo} alt={sup.name} className="w-full h-full object-cover" />
                        ) : (
                          sup.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          value={sup.name}
                          onChange={e => {
                            const next = [...draft.premiumSuppliers];
                            next[idx] = { ...next[idx], name: e.target.value };
                            setDraft(prev => ({ ...prev, premiumSuppliers: next }));
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-bold text-slate-900"
                        />
                        <input
                          type="text"
                          value={sup.mainProduct}
                          onChange={e => {
                            const next = [...draft.premiumSuppliers];
                            next[idx] = { ...next[idx], mainProduct: e.target.value };
                            setDraft(prev => ({ ...prev, premiumSuppliers: next }));
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-700"
                        />
                        <input
                          type="text"
                          value={sup.city}
                          onChange={e => {
                            const next = [...draft.premiumSuppliers];
                            next[idx] = { ...next[idx], city: e.target.value };
                            setDraft(prev => ({ ...prev, premiumSuppliers: next }));
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-200">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingKey === `ps-${sup.id}` ? 'Uploading...' : 'Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (!file) return;
                            const url = await uploadImageFile(file, `ps-${sup.id}`);
                            if (url) {
                              const next = [...draft.premiumSuppliers];
                              next[idx] = { ...next[idx], logo: url };
                              setDraft(prev => ({ ...prev, premiumSuppliers: next }));
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft(prev => ({
                            ...prev,
                            premiumSuppliers: prev.premiumSuppliers.filter(s => s.id !== sup.id)
                          }))
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Existing Latest Suppliers */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Latest Suppliers ({draft.latestSuppliers.length})
              </h3>
              <div className="space-y-2">
                {draft.latestSuppliers.map((sup, idx) => (
                  <div
                    key={sup.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center font-black text-xs text-slate-700 shrink-0">
                        {sup.logo ? (
                          <img src={sup.logo} alt={sup.name} className="w-full h-full object-cover" />
                        ) : (
                          sup.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          value={sup.name}
                          onChange={e => {
                            const next = [...draft.latestSuppliers];
                            next[idx] = { ...next[idx], name: e.target.value };
                            setDraft(prev => ({ ...prev, latestSuppliers: next }));
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-bold text-slate-900"
                        />
                        <input
                          type="text"
                          value={sup.mainProduct}
                          onChange={e => {
                            const next = [...draft.latestSuppliers];
                            next[idx] = { ...next[idx], mainProduct: e.target.value };
                            setDraft(prev => ({ ...prev, latestSuppliers: next }));
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-700"
                        />
                        <input
                          type="text"
                          value={sup.city}
                          onChange={e => {
                            const next = [...draft.latestSuppliers];
                            next[idx] = { ...next[idx], city: e.target.value };
                            setDraft(prev => ({ ...prev, latestSuppliers: next }));
                          }}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-slate-200">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingKey === `ls-${sup.id}` ? 'Uploading...' : 'Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (!file) return;
                            const url = await uploadImageFile(file, `ls-${sup.id}`);
                            if (url) {
                              const next = [...draft.latestSuppliers];
                              next[idx] = { ...next[idx], logo: url };
                              setDraft(prev => ({ ...prev, latestSuppliers: next }));
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft(prev => ({
                            ...prev,
                            latestSuppliers: prev.latestSuppliers.filter(s => s.id !== sup.id)
                          }))
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & PRODUCT PHOTO UPLOADS */}
        {sectionTab === 'products' && (
          <div className="space-y-6">
            {/* Add New Product Form */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Add New Wholesale Product to {draft.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Product Title *"
                  value={newProduct.title}
                  onChange={e => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Agriculture & Food)"
                  value={newProduct.category}
                  onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="MOQ (e.g. 25 MT / 500 Units)"
                  value={newProduct.moq}
                  onChange={e => setNewProduct(prev => ({ ...prev, moq: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="FOB Price Range (e.g. $850 – $980 / MT)"
                  value={newProduct.fobRange}
                  onChange={e => setNewProduct(prev => ({ ...prev, fobRange: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Image URL (or upload button →)"
                  value={newProduct.image}
                  onChange={e => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />

                <div className="flex items-center gap-2">
                  <input
                    ref={newProductImgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      const url = await uploadImageFile(file, 'new-product-img');
                      if (url) setNewProduct(prev => ({ ...prev, image: url }));
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingKey === 'new-product-img'}
                    onClick={() => newProductImgInputRef.current?.click()}
                    className="flex-1 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {uploadingKey === 'new-product-img' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-700" />
                    )}
                    <span>{newProduct.image ? 'Photo Ready ✓' : 'Upload Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Cards Grid with Direct Image Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draft.latestProducts.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <SafeImage
                      src={prod.image}
                      alt={prod.title}
                      category={prod.category}
                      productId={prod.id}
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-950/85 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingKey === `prod-${prod.id}` ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;
                          const url = await uploadImageFile(file, `prod-${prod.id}`);
                          if (url) {
                            const next = [...draft.latestProducts];
                            next[idx] = { ...next[idx], image: url };
                            setDraft(prev => ({ ...prev, latestProducts: next }));
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="p-3 space-y-2">
                    <input
                      type="text"
                      value={prod.title}
                      onChange={e => {
                        const next = [...draft.latestProducts];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setDraft(prev => ({ ...prev, latestProducts: next }));
                      }}
                      className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs font-bold text-slate-900"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={prod.category}
                        onChange={e => {
                          const next = [...draft.latestProducts];
                          next[idx] = { ...next[idx], category: e.target.value };
                          setDraft(prev => ({ ...prev, latestProducts: next }));
                        }}
                        placeholder="Category"
                        className="px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-700"
                      />
                      <input
                        type="text"
                        value={prod.fobRange || ''}
                        onChange={e => {
                          const next = [...draft.latestProducts];
                          next[idx] = { ...next[idx], fobRange: e.target.value };
                          setDraft(prev => ({ ...prev, latestProducts: next }));
                        }}
                        placeholder="Price range"
                        className="px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-700"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <input
                        type="text"
                        value={prod.moq || ''}
                        onChange={e => {
                          const next = [...draft.latestProducts];
                          next[idx] = { ...next[idx], moq: e.target.value };
                          setDraft(prev => ({ ...prev, latestProducts: next }));
                        }}
                        placeholder="MOQ"
                        className="flex-1 mr-2 px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft(prev => ({
                            ...prev,
                            latestProducts: prev.latestProducts.filter(p => p.id !== prod.id)
                          }))
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VERIFIED BUYERS & LATEST BUY OFFERS */}
        {sectionTab === 'buyers' && (
          <div className="space-y-6">
            {/* Add New Verified Buyer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Add Verified Importer / Corporate Buyer in {draft.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Buyer Company Name *"
                  value={newBuyer.companyName}
                  onChange={e => setNewBuyer(prev => ({ ...prev, companyName: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="City / Port"
                  value={newBuyer.city}
                  onChange={e => setNewBuyer(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Annual Import Volume (e.g. $6.5M / yr)"
                  value={newBuyer.annualVolume}
                  onChange={e => setNewBuyer(prev => ({ ...prev, annualVolume: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Target Products (comma-separated)"
                  value={newBuyer.targetProducts}
                  onChange={e => setNewBuyer(prev => ({ ...prev, targetProducts: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 sm:col-span-2"
                />
                <button
                  type="button"
                  onClick={handleAddBuyer}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Verified Buyer</span>
                </button>
              </div>
            </div>

            {/* Existing Verified Buyers */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Verified Buyers ({draft.verifiedBuyers.length})
              </h3>
              {draft.verifiedBuyers.map((buyer, idx) => (
                <div
                  key={buyer.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <input
                      type="text"
                      value={buyer.companyName}
                      onChange={e => {
                        const next = [...draft.verifiedBuyers];
                        next[idx] = { ...next[idx], companyName: e.target.value };
                        setDraft(prev => ({ ...prev, verifiedBuyers: next }));
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-bold text-slate-900"
                    />
                    <input
                      type="text"
                      value={buyer.annualVolume}
                      onChange={e => {
                        const next = [...draft.verifiedBuyers];
                        next[idx] = { ...next[idx], annualVolume: e.target.value };
                        setDraft(prev => ({ ...prev, verifiedBuyers: next }));
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700"
                    />
                    <input
                      type="text"
                      value={buyer.targetProducts.join(', ')}
                      onChange={e => {
                        const next = [...draft.verifiedBuyers];
                        next[idx] = {
                          ...next[idx],
                          targetProducts: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        };
                        setDraft(prev => ({ ...prev, verifiedBuyers: next }));
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft(prev => ({
                        ...prev,
                        verifiedBuyers: prev.verifiedBuyers.filter(b => b.id !== buyer.id)
                      }))
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer self-end sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Buy Offer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Add New Buy Offer (RFQ) in {draft.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Buy Offer Requirement Title *"
                  value={newOffer.title}
                  onChange={e => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Quantity (e.g. 50 MT)"
                  value={newOffer.quantity}
                  onChange={e => setNewOffer(prev => ({ ...prev, quantity: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddBuyOffer}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Offer</span>
                </button>
              </div>
            </div>

            {/* Existing Buy Offers */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Latest Buy Offers ({draft.latestBuyOffers.length})
              </h3>
              {draft.latestBuyOffers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                    <input
                      type="text"
                      value={offer.title}
                      onChange={e => {
                        const next = [...draft.latestBuyOffers];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setDraft(prev => ({ ...prev, latestBuyOffers: next }));
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-900 sm:col-span-3"
                    />
                    <input
                      type="text"
                      value={offer.quantity}
                      onChange={e => {
                        const next = [...draft.latestBuyOffers];
                        next[idx] = { ...next[idx], quantity: e.target.value };
                        setDraft(prev => ({ ...prev, latestBuyOffers: next }));
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft(prev => ({
                        ...prev,
                        latestBuyOffers: prev.latestBuyOffers.filter(o => o.id !== offer.id)
                      }))
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SEO EDITORIAL GUIDE */}
        {sectionTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Primary SEO Headline
              </label>
              <input
                type="text"
                value={draft.seoHeadline}
                onChange={e => setDraft(prev => ({ ...prev, seoHeadline: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.seoSections.map((sec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    Editorial Block 0{idx + 1}
                  </div>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={e => {
                      const next = [...draft.seoSections];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setDraft(prev => ({ ...prev, seoSections: next }));
                    }}
                    placeholder="Section heading"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900"
                  />
                  <textarea
                    rows={3}
                    value={sec.body}
                    onChange={e => {
                      const next = [...draft.seoSections];
                      next[idx] = { ...next[idx], body: e.target.value };
                      setDraft(prev => ({ ...prev, seoSections: next }));
                    }}
                    placeholder="Write country trade guide copy..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Compact Modal Mode (opened directly from any live Country Page by an Admin!)
  if (compactModalMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-5xl my-auto shadow-2xl">{editorBody}</div>
      </div>
    );
  }

  // Full Admin Dashboard Mode (196-Country Directory Sidebar + Editor Workspace)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>All {WORLD_COUNTRIES_LIST.length} Countries Portals &amp; Media Manager</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Edit Any Country Portal, Add Entries &amp; Upload Images
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Select any of the {WORLD_COUNTRIES_LIST.length} countries below to upload custom hero banners, supplier logos, product photos, verified buyers, buy offers, and SEO copy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNewCountry}
          className="px-4 py-2.5 rounded-lg bg-[#0F294D] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Country Portal</span>
        </button>
      </div>

      {/* 12-Col Master/Detail Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 4 cols: All 196 Countries List */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={countrySearch}
              onChange={e => setCountrySearch(e.target.value)}
              placeholder={`Search all ${WORLD_COUNTRIES_LIST.length} countries or ports...`}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {(['ALL', 'CUSTOMIZED', 'Europe', 'Asia-Pacific', 'Americas', 'Middle East & Africa'] as const).map(
              reg => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegionFilter(reg)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                    regionFilter === reg
                      ? 'bg-[#0F294D] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {reg === 'ALL'
                    ? `All (${WORLD_COUNTRIES_LIST.length})`
                    : reg === 'CUSTOMIZED'
                    ? 'Customized'
                    : reg.split(' ')[0]}
                </button>
              )
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
            {filteredWorldCountries.map(c => {
              const isSelected = !isAddingNewCountry && selectedCountryId === c.id;
              const isCustom = Boolean(COUNTRIES_DATA[c.id]);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c.id)}
                  className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag country={c.code} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 truncate">{c.name}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{c.port}</span>
                    </span>
                  </span>
                  <span className="text-[10px] font-mono shrink-0 text-right">
                    <span className={isCustom ? 'text-blue-700 font-extrabold' : 'text-slate-400'}>
                      {isCustom ? 'Edited' : c.code}
                    </span>
                  </span>
                </button>
              );
            })}
            {filteredWorldCountries.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-500">
                No countries match your filter.
              </div>
            )}
          </div>
        </div>

        {/* Right 8 cols: Full Portal Editor */}
        <div className="xl:col-span-8">{editorBody}</div>
      </div>
    </div>
  );
};
