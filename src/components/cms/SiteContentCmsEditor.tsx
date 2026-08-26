import React, { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { SiteContent, DEFAULT_SITE_CONTENT, CategoryItemCMS, TestimonialCMS, H2HFeatureCMS, TierPlanCMS } from '../../data/defaultSiteContent';
import { 
  FileEdit, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Globe2, 
  Layers, 
  Layout, 
  ShieldCheck, 
  Phone, 
  Mail,
  AlertCircle,
  Package,
  Award,
  DollarSign,
  Star,
  Users,
  Briefcase,
  HelpCircle,
  Download,
  Upload,
  Copy,
  Plus,
  Trash2,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  MessageCircle,
  ChevronRight,
  Lock,
  ShieldAlert,
  KeyRound
} from 'lucide-react';

type CmsTab = 
  | 'HERO_BRAND'
  | 'STATS_METRICS'
  | 'CATEGORIES'
  | 'H2H_ADVANTAGE'
  | 'ESCROW_SECURITY'
  | 'MEMBERSHIP_PLANS'
  | 'TESTIMONIALS'
  | 'CONTACT_WHATSAPP'
  | 'FOOTER_LEGAL'
  | 'SUBPAGES'
  | 'RAW_JSON';

export const SiteContentCmsEditor: React.FC = () => {
  const { 
    siteContent, 
    updateSiteContent, 
    resetToDefaults, 
    currentUser,
    isLiveEditMode,
    toggleLiveEditMode,
    isUserAuthorized
  } = useSiteContent();

  const [activeTab, setActiveTab] = useState<CmsTab>('HERO_BRAND');
  const [formData, setFormData] = useState<SiteContent>(siteContent);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const auth = isUserAuthorized(currentUser);
  const isAdmin = auth.isAuthorized;

  // Sync state if context changes externally
  React.useEffect(() => {
    setFormData(siteContent);
  }, [siteContent]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = await updateSiteContent(formData, currentUser);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset ALL site copy, banners, and categories to factory defaults?')) {
      await resetToDefaults(currentUser);
      setFormData(DEFAULT_SITE_CONTENT);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trade-heaven-site-content-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleApplyJson = () => {
    try {
      if (jsonInput.length > 5 * 1024 * 1024) {
        setJsonError(`JSON payload exceeds 5 MB limit (${(jsonInput.length / (1024 * 1024)).toFixed(1)} MB).`);
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setFormData(parsed);
      updateSiteContent(parsed, currentUser);
      setJsonError(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  // Category helpers
  const handleAddCategory = () => {
    const newCat: CategoryItemCMS = {
      id: `cat-${Date.now()}`,
      name: 'New Industrial Category',
      description: 'Custom industrial raw materials and factory supplies.',
      iconName: 'Box',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
      badge: 'Verified',
      productCount: '10,000+ Products'
    };
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        categoriesList: [...(prev.homepage.categoriesList || []), newCat]
      }
    }));
  };

  const handleRemoveCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        categoriesList: prev.homepage.categoriesList.filter((_, idx) => idx !== index)
      }
    }));
  };

  // Testimonials helpers
  const handleAddTestimonial = () => {
    const newTestimonial: TestimonialCMS = {
      id: `test-${Date.now()}`,
      name: 'Michael Chang',
      title: 'Procurement Director',
      company: 'Pacific Trade Dynamics Corp.',
      country: 'United States',
      countryFlag: '🇺🇸',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      quote: 'Seamless FOB cargo dispatch with reliable escrow release. Trade Heaven solved our tier-1 supplier discovery bottleneck.',
      rating: 5,
      verifiedDealSize: '$550,000 CIF Long Beach',
      category: 'Electronics OEM'
    };
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        testimonials: [...(prev.homepage.testimonials || []), newTestimonial]
      }
    }));
  };

  const handleRemoveTestimonial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        testimonials: prev.homepage.testimonials.filter((_, idx) => idx !== index)
      }
    }));
  };

  if (!isAdmin) {
    return (
      <div id="cms-restricted-view" className="py-12 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Authentication Required</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Site Content CMS Studio
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Live website CMS editing, global copy updates, and banner configurations require administrator privileges. Please sign in with administrator credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('tradeheaven_navigate', { detail: 'AUTH_LOGIN' }));
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Administrator</span>
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('tradeheaven_navigate', { detail: 'HOMEPAGE' }));
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="full-site-cms-editor" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* CMS Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Master Full-Site CMS Studio &amp; Content Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Edit Entire Website Content &amp; Visuals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Modify any headline, background banner, trade metrics, industrial sectors, H2H features, WhatsApp desk numbers, and footer copy in real time.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleLiveEditMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isLiveEditMode 
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400 ring-offset-2 animate-pulse' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isLiveEditMode ? 'Visual Edit Mode: ON' : 'Turn On Visual Edit Mode'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download full website content as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All website changes published successfully! The entire platform is now synchronized with your edits.</span>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {[
          { id: 'HERO_BRAND', label: '🌟 Hero & Branding', icon: Layout },
          { id: 'STATS_METRICS', label: '📊 Key Trade Metrics', icon: DollarSign },
          { id: 'CATEGORIES', label: '🏭 Industrial Sectors', icon: Package },
          { id: 'H2H_ADVANTAGE', label: '🤝 H2H & IEM Advantage', icon: Briefcase },
          { id: 'ESCROW_SECURITY', label: '🛡️ Trade Assurance & Escrow', icon: ShieldCheck },
          { id: 'MEMBERSHIP_PLANS', label: '💎 Pricing & Plans', icon: Award },
          { id: 'TESTIMONIALS', label: '⭐ Buyer Reviews', icon: Star },
          { id: 'CONTACT_WHATSAPP', label: '📞 WhatsApp & Support', icon: Phone },
          { id: 'FOOTER_LEGAL', label: '📑 Footer & Legal', icon: FileEdit },
          { id: 'SUBPAGES', label: '📄 Subpages Copy', icon: Layers },
          { id: 'RAW_JSON', label: '💾 Raw JSON Backup', icon: Download }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CmsTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">

        {/* TAB 1: HERO & BRANDING */}
        {activeTab === 'HERO_BRAND' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Global Brand Identity */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-600" />
                Global Platform Identity &amp; Top Announcement Bar
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Platform Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand.siteName}
                    onChange={e => setFormData({ ...formData, brand: { ...formData.brand, siteName: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Logo Sub-Badge</label>
                  <input
                    type="text"
                    value={formData.brand.logoBadge}
                    onChange={e => setFormData({ ...formData, brand: { ...formData.brand, logoBadge: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={formData.brand.siteTagline}
                    onChange={e => setFormData({ ...formData, brand: { ...formData.brand, siteTagline: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Top Announcement Bar Ticker</label>
                  <input
                    type="text"
                    value={formData.homepage.announcementTicker}
                    onChange={e => setFormData({ 
                      ...formData, 
                      homepage: { ...formData.homepage, announcementTicker: e.target.value },
                      brand: { ...formData.brand, topBarAnnouncement: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Hero Main Headlines & Visuals */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-600" />
                Hero Section Headlines &amp; Maritime Background
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Main Title (H1 Line 1)</label>
                  <input
                    type="text"
                    value={formData.homepage.heroHeadline}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroHeadline: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Highlighted Text (Gradient Gold Line 2)</label>
                  <input
                    type="text"
                    value={formData.homepage.heroHeadlineGradient}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroHeadlineGradient: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-amber-800 font-black focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Hero Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={formData.homepage.heroSubheadline}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroSubheadline: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trust Eyebrow Badge (Pill Above Title)</label>
                  <input
                    type="text"
                    value={formData.homepage.heroTrustEyebrow}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroTrustEyebrow: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Search Omnibar Placeholder Text</label>
                  <input
                    type="text"
                    value={formData.homepage.searchPlaceholder}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, searchPlaceholder: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Hero Background Image URL (Maritime Port / Logistics)</label>
                  <input
                    type="text"
                    value={formData.homepage.heroBgImage}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroBgImage: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                  />
                  {formData.homepage.heroBgImage && (
                    <div className="mt-2 h-20 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                      <img src={formData.homepage.heroBgImage} alt="Hero BG Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">Image Preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trade Specialist Card */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Featured Trade Specialist Card (Hero Right Box)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialist Name</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeSpecialist.name}
                    onChange={e => setFormData({ 
                      ...formData, 
                      homepage: { 
                        ...formData.homepage, 
                        tradeSpecialist: { ...formData.homepage.tradeSpecialist, name: e.target.value } 
                      } 
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialist Title</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeSpecialist.title}
                    onChange={e => setFormData({ 
                      ...formData, 
                      homepage: { 
                        ...formData.homepage, 
                        tradeSpecialist: { ...formData.homepage.tradeSpecialist, title: e.target.value } 
                      } 
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Specialist Quote</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeSpecialist.quote}
                    onChange={e => setFormData({ 
                      ...formData, 
                      homepage: { 
                        ...formData.homepage, 
                        tradeSpecialist: { ...formData.homepage.tradeSpecialist, quote: e.target.value } 
                      } 
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Specialist Photo URL</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeSpecialist.avatar}
                    onChange={e => setFormData({ 
                      ...formData, 
                      homepage: { 
                        ...formData.homepage, 
                        tradeSpecialist: { ...formData.homepage.tradeSpecialist, avatar: e.target.value } 
                      } 
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEY TRADE METRICS & STATS */}
        {activeTab === 'STATS_METRICS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Key Trade Volume &amp; Global Footprint Statistics
              </h3>
              <p className="text-slate-500 text-xs">
                These numbers display in the high-contrast stats banner on the homepage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verified Importers Count</label>
                  <input
                    type="text"
                    value={formData.homepage.verifiedBuyersCount}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, verifiedBuyersCount: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none focus:border-blue-500"
                  />
                  <label className="block text-[11px] text-slate-500 mt-1.5 mb-1 font-semibold">Sub-label</label>
                  <input
                    type="text"
                    value={formData.homepage.verifiedBuyersLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, verifiedBuyersLabel: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Audited Production Plants Count</label>
                  <input
                    type="text"
                    value={formData.homepage.activeSuppliersCount}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, activeSuppliersCount: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none focus:border-blue-500"
                  />
                  <label className="block text-[11px] text-slate-500 mt-1.5 mb-1 font-semibold">Sub-label</label>
                  <input
                    type="text"
                    value={formData.homepage.activeSuppliersLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, activeSuppliersLabel: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supported Countries Count</label>
                  <input
                    type="text"
                    value={formData.homepage.supportedCountriesCount}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, supportedCountriesCount: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none focus:border-blue-500"
                  />
                  <label className="block text-[11px] text-slate-500 mt-1.5 mb-1 font-semibold">Sub-label</label>
                  <input
                    type="text"
                    value={formData.homepage.supportedCountriesLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, supportedCountriesLabel: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual GMV Trade Volume</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeVolumeGmv}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, tradeVolumeGmv: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-emerald-700 font-black text-base focus:outline-none focus:border-blue-500"
                  />
                  <label className="block text-[11px] text-slate-500 mt-1.5 mb-1 font-semibold">Sub-label</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeVolumeGmvLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, tradeVolumeGmvLabel: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INDUSTRIAL SECTORS & MEGA DIRECTORY */}
        {activeTab === 'CATEGORIES' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Industrial Sourcing Sectors &amp; Mega Categories
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Customize directory categories, badges, product counts, and cover images.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section Main Heading</label>
                  <input
                    type="text"
                    value={formData.homepage.featuredCategoriesHeading}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, featuredCategoriesHeading: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section Subheading</label>
                  <input
                    type="text"
                    value={formData.homepage.featuredCategoriesSubheading}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, featuredCategoriesSubheading: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Cards List */}
              <div className="space-y-3 pt-2">
                {formData.homepage.categoriesList.map((cat, idx) => (
                  <div key={cat.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-mono text-[11px] font-black">
                          {idx + 1}
                        </span>
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Category Name</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={e => {
                            const updated = [...formData.homepage.categoriesList];
                            updated[idx] = { ...cat, name: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, categoriesList: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={cat.badge || ''}
                          onChange={e => {
                            const updated = [...formData.homepage.categoriesList];
                            updated[idx] = { ...cat, badge: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, categoriesList: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Product Volume Label</label>
                        <input
                          type="text"
                          value={cat.productCount}
                          onChange={e => {
                            const updated = [...formData.homepage.categoriesList];
                            updated[idx] = { ...cat, productCount: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, categoriesList: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Cover Image URL</label>
                        <input
                          type="text"
                          value={cat.image}
                          onChange={e => {
                            const updated = [...formData.homepage.categoriesList];
                            updated[idx] = { ...cat, image: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, categoriesList: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono text-[10px] focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Subcategory Highlights &amp; Scope</label>
                        <input
                          type="text"
                          value={cat.description}
                          onChange={e => {
                            const updated = [...formData.homepage.categoriesList];
                            updated[idx] = { ...cat, description: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, categoriesList: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: H2H & IEM ADVANTAGE */}
        {activeTab === 'H2H_ADVANTAGE' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Human-to-Human (H2H) &amp; International Export Management (IEM)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section Pill Badge</label>
                  <input
                    type="text"
                    value={formData.homepage.h2hPillBadge}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hPillBadge: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTA Action Button Text</label>
                  <input
                    type="text"
                    value={formData.homepage.h2hButtonText}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hButtonText: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">H2H Main Headline</label>
                  <input
                    type="text"
                    value={formData.homepage.h2hHeadline}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hHeadline: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">H2H Subtitle / Strategic Overview</label>
                  <textarea
                    rows={2}
                    value={formData.homepage.h2hSubheadline}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hSubheadline: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4 Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {formData.homepage.h2hFeatures.map((feat, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-xl text-white font-mono font-black text-xs flex items-center justify-center ${feat.color}`}>
                        {feat.number}
                      </span>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={e => {
                          const updated = [...formData.homepage.h2hFeatures];
                          updated[idx] = { ...feat, title: e.target.value };
                          setFormData({ ...formData, homepage: { ...formData.homepage, h2hFeatures: updated } });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-900 font-bold focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={feat.description}
                      onChange={e => {
                        const updated = [...formData.homepage.h2hFeatures];
                        updated[idx] = { ...feat, description: e.target.value };
                        setFormData({ ...formData, homepage: { ...formData.homepage, h2hFeatures: updated } });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ESCROW & SECURITY */}
        {activeTab === 'ESCROW_SECURITY' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Trade Assurance &amp; Custodial Escrow Guarantee
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Escrow Section Title</label>
                  <input
                    type="text"
                    value={formData.escrowPolicy.title}
                    onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, title: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clearing Banks Notice</label>
                  <input
                    type="text"
                    value={formData.escrowPolicy.bankRailNotice}
                    onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, bankRailNotice: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Escrow Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={formData.escrowPolicy.subtitle}
                    onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, subtitle: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">100% Refund Guarantee Policy Text</label>
                  <input
                    type="text"
                    value={formData.escrowPolicy.guaranteeNotice}
                    onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, guaranteeNotice: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4 Escrow Milestones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {formData.escrowPolicy.milestones.map((m, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
                        {m.step}
                      </span>
                      <input
                        type="text"
                        value={m.title}
                        onChange={e => {
                          const updated = [...formData.escrowPolicy.milestones];
                          updated[idx] = { ...m, title: e.target.value };
                          setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, milestones: updated } });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-900 font-bold focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={m.description}
                      onChange={e => {
                        const updated = [...formData.escrowPolicy.milestones];
                        updated[idx] = { ...m, description: e.target.value };
                        setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, milestones: updated } });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEMBERSHIP PLANS & PRICING */}
        {activeTab === 'MEMBERSHIP_PLANS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Exporter Membership Plans &amp; Quotation Limits
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pricing Page Title</label>
                  <input
                    type="text"
                    value={formData.premiumPlansPage.title}
                    onChange={e => setFormData({ ...formData, premiumPlansPage: { ...formData.premiumPlansPage, title: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual Discount Badge Text</label>
                  <input
                    type="text"
                    value={formData.premiumPlansPage.annualDiscountBadge}
                    onChange={e => setFormData({ ...formData, premiumPlansPage: { ...formData.premiumPlansPage, annualDiscountBadge: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tiers List */}
              <div className="space-y-4 pt-2">
                {formData.premiumPlansPage.tiers.map((tier, idx) => (
                  <div key={tier.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{tier.name}</span>
                      <span className="text-xs font-mono font-bold text-blue-700">${tier.annualUsd}/year (${tier.monthlyUsd}/mo)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Plan Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={e => {
                            const updated = [...formData.premiumPlansPage.tiers];
                            updated[idx] = { ...tier, name: e.target.value };
                            setFormData({ ...formData, premiumPlansPage: { ...formData.premiumPlansPage, tiers: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Monthly Price ($)</label>
                        <input
                          type="number"
                          value={tier.monthlyUsd}
                          onChange={e => {
                            const updated = [...formData.premiumPlansPage.tiers];
                            updated[idx] = { ...tier, monthlyUsd: Number(e.target.value) };
                            setFormData({ ...formData, premiumPlansPage: { ...formData.premiumPlansPage, tiers: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Annual Price ($)</label>
                        <input
                          type="number"
                          value={tier.annualUsd}
                          onChange={e => {
                            const updated = [...formData.premiumPlansPage.tiers];
                            updated[idx] = { ...tier, annualUsd: Number(e.target.value) };
                            setFormData({ ...formData, premiumPlansPage: { ...formData.premiumPlansPage, tiers: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TESTIMONIALS & CASE STUDIES */}
        {activeTab === 'TESTIMONIALS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Verified Importers &amp; Global Trade Reviews
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Customer testimonials, deal sizes, verified ratings, and importer country flags.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Review</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={formData.homepage.testimonialsHeading}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, testimonialsHeading: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={formData.homepage.testimonialsSubheading}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, testimonialsSubheading: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Testimonials List */}
              <div className="space-y-3 pt-2">
                {formData.homepage.testimonials.map((test, idx) => (
                  <div key={test.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>{test.countryFlag}</span>
                        <span>{test.name}</span>
                        <span className="text-slate-400 font-normal">({test.company})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestimonial(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Reviewer Name</label>
                        <input
                          type="text"
                          value={test.name}
                          onChange={e => {
                            const updated = [...formData.homepage.testimonials];
                            updated[idx] = { ...test, name: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, testimonials: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Company &amp; Country</label>
                        <input
                          type="text"
                          value={test.company}
                          onChange={e => {
                            const updated = [...formData.homepage.testimonials];
                            updated[idx] = { ...test, company: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, testimonials: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Verified Order Deal Size</label>
                        <input
                          type="text"
                          value={test.verifiedDealSize}
                          onChange={e => {
                            const updated = [...formData.homepage.testimonials];
                            updated[idx] = { ...test, verifiedDealSize: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, testimonials: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-emerald-800 font-mono font-bold focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Review Quote</label>
                        <textarea
                          rows={2}
                          value={test.quote}
                          onChange={e => {
                            const updated = [...formData.homepage.testimonials];
                            updated[idx] = { ...test, quote: e.target.value };
                            setFormData({ ...formData, homepage: { ...formData.homepage, testimonials: updated } });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: CONTACT, WHATSAPP & SUPPORT */}
        {activeTab === 'CONTACT_WHATSAPP' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Official WhatsApp Desk, Telephony &amp; Corporate Headquarters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official WhatsApp Desk Number</label>
                  <input
                    type="text"
                    value={formData.brand.whatsappNumber}
                    onChange={e => setFormData({ 
                      ...formData, 
                      brand: { 
                        ...formData.brand, 
                        whatsappNumber: e.target.value,
                        whatsappUrl: `https://wa.me/${e.target.value.replace(/[^0-9]/g, '')}?text=Hello%20Trade%20Heaven,%20I%20am%20inquiring%20about%20verified%20suppliers,%20RFQs,%20and%20B2B%20trade.`
                      } 
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-emerald-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Support Email</label>
                  <input
                    type="email"
                    value={formData.brand.supportEmail}
                    onChange={e => setFormData({ 
                      ...formData, 
                      brand: { ...formData.brand, supportEmail: e.target.value },
                      headerAndFooter: { ...formData.headerAndFooter, footerSupportEmail: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Toll-Free Phone Support</label>
                  <input
                    type="text"
                    value={formData.brand.supportPhone}
                    onChange={e => setFormData({ 
                      ...formData, 
                      brand: { ...formData.brand, supportPhone: e.target.value },
                      headerAndFooter: { ...formData.headerAndFooter, footerSupportPhone: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Direct Link URL</label>
                  <input
                    type="text"
                    value={formData.brand.whatsappUrl}
                    onChange={e => setFormData({ ...formData, brand: { ...formData.brand, whatsappUrl: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Global Headquarters Office Address</label>
                  <input
                    type="text"
                    value={formData.brand.officeAddress}
                    onChange={e => setFormData({ 
                      ...formData, 
                      brand: { ...formData.brand, officeAddress: e.target.value },
                      headerAndFooter: { ...formData.headerAndFooter, footerHeadquarters: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: FOOTER & LEGAL */}
        {activeTab === 'FOOTER_LEGAL' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-blue-600" />
                Footer Text, Mission Statement &amp; ISO Compliance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Footer Tagline</label>
                  <textarea
                    rows={2}
                    value={formData.headerAndFooter.footerTagline}
                    onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerTagline: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Footer Mission Statement</label>
                  <textarea
                    rows={2}
                    value={formData.headerAndFooter.footerMission}
                    onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerMission: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Copyright Notice</label>
                  <input
                    type="text"
                    value={formData.headerAndFooter.footerCopyright}
                    onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerCopyright: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISO / Security Compliance Badge Text</label>
                  <input
                    type="text"
                    value={formData.headerAndFooter.footerIsoText}
                    onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerIsoText: e.target.value } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SUBPAGES COPYWRITING */}
        {activeTab === 'SUBPAGES' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Subpages Banners &amp; Notice Copywriting
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Products Directory Page</h4>
                  <input
                    type="text"
                    value={formData.productsPage.title}
                    onChange={e => setFormData({ ...formData, productsPage: { ...formData.productsPage, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                    placeholder="Page Title"
                  />
                  <textarea
                    rows={2}
                    value={formData.productsPage.subtitle}
                    onChange={e => setFormData({ ...formData, productsPage: { ...formData.productsPage, subtitle: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-none"
                    placeholder="Page Subtitle"
                  />
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Buy Leads (RFQ Tenders) Page</h4>
                  <input
                    type="text"
                    value={formData.buyLeadsPage.title}
                    onChange={e => setFormData({ ...formData, buyLeadsPage: { ...formData.buyLeadsPage, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                    placeholder="Page Title"
                  />
                  <input
                    type="text"
                    value={formData.buyLeadsPage.urgentNoticeText}
                    onChange={e => setFormData({ ...formData, buyLeadsPage: { ...formData.buyLeadsPage, urgentNoticeText: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-rose-800 font-bold text-xs focus:outline-none"
                    placeholder="Urgent Notice Banner"
                  />
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Suppliers Directory Page</h4>
                  <input
                    type="text"
                    value={formData.suppliersPage.title}
                    onChange={e => setFormData({ ...formData, suppliersPage: { ...formData.suppliersPage, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                    placeholder="Page Title"
                  />
                  <textarea
                    rows={2}
                    value={formData.suppliersPage.auditGuaranteeText}
                    onChange={e => setFormData({ ...formData, suppliersPage: { ...formData.suppliersPage, auditGuaranteeText: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-none"
                    placeholder="Audit Guarantee Text"
                  />
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Post RFQ Sourcing Page</h4>
                  <input
                    type="text"
                    value={formData.postRfqPage.title}
                    onChange={e => setFormData({ ...formData, postRfqPage: { ...formData.postRfqPage, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                    placeholder="Page Title"
                  />
                  <input
                    type="text"
                    value={formData.postRfqPage.guaranteeText}
                    onChange={e => setFormData({ ...formData, postRfqPage: { ...formData.postRfqPage, guaranteeText: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none"
                    placeholder="Guarantee Text"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: RAW JSON IMPORT & EXPORT */}
        {activeTab === 'RAW_JSON' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    Complete Website Configuration (Raw JSON)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Export, import, or paste any JSON schema to instantly update every page, banner, and sector.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{jsonError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Paste JSON Content to Import &amp; Apply</label>
                <textarea
                  rows={12}
                  value={jsonInput || JSON.stringify(formData, null, 2)}
                  onChange={e => setJsonInput(e.target.value)}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl p-4 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyJson}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import &amp; Apply Pasted JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at Bottom */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Clicking <strong>Save All Changes</strong> updates live React state and writes to your local and server CMS storage.
          </span>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; Publish Website Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
