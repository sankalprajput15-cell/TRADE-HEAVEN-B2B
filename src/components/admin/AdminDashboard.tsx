import React, { useState, useEffect } from 'react';
import { AuthUser, Currency } from '../../types';
import { ClientAdminView } from '../services/ClientAdminView';
import { SiteContentCmsEditor } from '../cms/SiteContentCmsEditor';
import { BulkEntityCrmModule } from './BulkEntityCrmModule';
import { PlanPricingAdminModule } from './PlanPricingAdminModule';
import { 
  ALL_COUNTRY_ITEMS, 
  COUNTRIES_DATA, 
  DEDICATED_COUNTRY_SEO_COPY,
  saveCountriesToStorage,
  loadCountriesFromStorage
} from '../../data/countriesData';
import { ActivityLogAdminModule } from './ActivityLogAdminModule';
import { 
  Layout, 
  Database, 
  Globe, 
  Users, 
  CreditCard, 
  Menu, 
  X, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  ArrowLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: 'CMS' | 'DATABASE' | 'COUNTRIES' | 'CRM' | 'PRICING' | 'ACTIVITY_LOGS';
  currentUser: AuthUser | null;
  onNavigate: (view: any) => void;
  selectedCurrency: Currency;
  onOpenPaymentCheckout: (data: any) => void;
  onUpdateCurrentUser?: (updated: AuthUser) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'CMS',
  currentUser,
  onNavigate,
  selectedCurrency,
  onOpenPaymentCheckout,
  onUpdateCurrentUser
}) => {
  const [activeTab, setActiveTab] = useState<'CMS' | 'DATABASE' | 'COUNTRIES' | 'CRM' | 'PRICING' | 'ACTIVITY_LOGS'>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync tab if initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // --- COUNTRY PORTALS STATE ---
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  
  // Country edit/add form states
  const [isEditingCountry, setIsEditingCountry] = useState(false);
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [countryForm, setCountryForm] = useState({
    id: '',
    name: '',
    code: '',
    flag: '🌐',
    statsCompanies: 1500,
    statsProducts: 2000,
    statsRfqs: 500,
    topExports: '',
    topImports: '',
    seoHeadline: '',
    seoSections: [
      { title: '', body: '' },
      { title: '', body: '' },
      { title: '', body: '' },
      { title: '', body: '' }
    ]
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load countries lists
  useEffect(() => {
    loadCountriesFromStorage();
    setAllCountries([...ALL_COUNTRY_ITEMS]);
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Select country to view/edit
  const handleSelectCountry = (id: string) => {
    setSelectedCountryId(id);
    const countryObj = COUNTRIES_DATA[id] || {
      id,
      name: id,
      code: id.slice(0, 2).toUpperCase(),
      flag: '🌐',
      stats: { companies: 1200, products: 1800, rfqs: 400 },
      topExports: [],
      topImports: []
    };
    const seoObj = DEDICATED_COUNTRY_SEO_COPY[id] || {
      headline: '',
      sections: []
    };

    // fill form
    setCountryForm({
      id: countryObj.id,
      name: countryObj.name,
      code: countryObj.code,
      flag: countryObj.flag || '🌐',
      statsCompanies: countryObj.stats?.companies || 1000,
      statsProducts: countryObj.stats?.products || 1000,
      statsRfqs: countryObj.stats?.rfqs || 200,
      topExports: (countryObj.topExports || []).join(', '),
      topImports: (countryObj.topImports || []).join(', '),
      seoHeadline: seoObj.headline || `THE LARGEST B2B MARKETPLACE IN ${countryObj.name.toUpperCase()} – TRADE HEAVEN`,
      seoSections: [
        { title: seoObj.sections?.[0]?.title || 'Leading Cross-Border Trade Facilitator', body: seoObj.sections?.[0]?.body || '' },
        { title: seoObj.sections?.[1]?.title || 'Seamless Market Access', body: seoObj.sections?.[1]?.body || '' },
        { title: seoObj.sections?.[2]?.title || 'Build High-Value Partnerships', body: seoObj.sections?.[2]?.body || '' },
        { title: seoObj.sections?.[3]?.title || 'Value-Added Sourcing Support', body: seoObj.sections?.[3]?.body || '' }
      ]
    });
    setIsEditingCountry(true);
    setIsAddingCountry(false);
  };

  // Open empty add country form
  const handleOpenAddCountry = () => {
    setCountryForm({
      id: '',
      name: '',
      code: '',
      flag: '🌐',
      statsCompanies: 2400,
      statsProducts: 3100,
      statsRfqs: 650,
      topExports: 'Raw Commodities, Agricultural Products, Heavy Machinery, Textiles',
      topImports: 'Industrial Electronics, Refined Petroleum, Chemicals, Vehicles',
      seoHeadline: '',
      seoSections: [
        { title: 'Leading Cross-Border Trade Facilitator', body: 'Trade Heaven breaks down international sourcing friction.' },
        { title: 'Seamless Market Access', body: 'Connect directly with certified manufacturers and bulk importers.' },
        { title: 'Build High-Value Partnerships', body: 'Accelerate wholesale trading under Swiss Trade Protection.' },
        { title: 'Value-Added Sourcing Support', body: 'Get dedicated account managers and fast multi-currency settlement.' }
      ]
    });
    setIsAddingCountry(true);
    setIsEditingCountry(false);
    setSelectedCountryId(null);
  };

  // Save Country form
  const handleSaveCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryForm.id || !countryForm.name) {
      triggerToast('error', 'Country ID and Name are required.');
      return;
    }

    const normId = countryForm.id.toLowerCase().trim().replace(/\s+/g, '-');
    
    // 1. Prepare country metadata
    const countryMeta = {
      id: normId,
      name: countryForm.name.trim(),
      code: countryForm.code.toUpperCase().trim() || normId.slice(0, 2).toUpperCase(),
      flag: countryForm.flag.trim() || '🌐'
    };

    // 2. Prepare detailed country data
    const exportsArray = countryForm.topExports.split(',').map(s => s.trim()).filter(Boolean);
    const importsArray = countryForm.topImports.split(',').map(s => s.trim()).filter(Boolean);

    const updatedCountryData = {
      id: normId,
      name: countryMeta.name,
      code: countryMeta.code,
      flag: countryMeta.flag,
      stats: {
        companies: Number(countryForm.statsCompanies) || 1200,
        products: Number(countryForm.statsProducts) || 2000,
        rfqs: Number(countryForm.statsRfqs) || 500
      },
      topExports: exportsArray.length > 0 ? exportsArray : ['Industrial Raw Materials', 'Machinery Spare Parts'],
      topImports: importsArray.length > 0 ? importsArray : ['Consumer Hardware', 'Chemical Resins'],
      premiumSuppliers: COUNTRIES_DATA[normId]?.premiumSuppliers || [],
      latestSuppliers: COUNTRIES_DATA[normId]?.latestSuppliers || [],
      latestProducts: COUNTRIES_DATA[normId]?.latestProducts || [],
      latestBuyOffers: COUNTRIES_DATA[normId]?.latestBuyOffers || []
    };

    // 3. Prepare SEO copywriting
    const updatedSeoCopy = {
      headline: countryForm.seoHeadline || `THE LARGEST B2B MARKETPLACE IN ${countryMeta.name.toUpperCase()} – TRADE HEAVEN`,
      sections: countryForm.seoSections.filter(s => s.title.trim() && s.body.trim())
    };

    // Save to cache structures and persistent storage
    const currentList = [...ALL_COUNTRY_ITEMS];
    const existingIndex = currentList.findIndex(c => c.id === normId);
    
    if (existingIndex > -1) {
      currentList[existingIndex] = countryMeta;
    } else {
      currentList.push(countryMeta);
    }

    const currentData = { ...COUNTRIES_DATA, [normId]: updatedCountryData };
    const currentSeo = { ...DEDICATED_COUNTRY_SEO_COPY, [normId]: updatedSeoCopy };

    saveCountriesToStorage(currentList, currentData, currentSeo);
    
    // Sync React states
    setAllCountries(currentList);
    loadCountriesFromStorage();

    triggerToast('success', `Successfully saved country portal: ${countryMeta.flag} ${countryMeta.name}`);
    setIsEditingCountry(false);
    setIsAddingCountry(false);
    setSelectedCountryId(null);
  };

  // Remove Country portal
  const handleRemoveCountry = (id: string) => {
    if (!confirm(`Are you sure you want to delete the ${id} B2B Portal? This cannot be undone.`)) return;

    const newList = ALL_COUNTRY_ITEMS.filter(c => c.id !== id);
    const newData = { ...COUNTRIES_DATA };
    delete newData[id];
    const newSeo = { ...DEDICATED_COUNTRY_SEO_COPY };
    delete newSeo[id];

    saveCountriesToStorage(newList, newData, newSeo);
    setAllCountries(newList);
    loadCountriesFromStorage();

    triggerToast('success', `Successfully deleted B2B portal page: "${id}"`);
    if (selectedCountryId === id) {
      setIsEditingCountry(false);
      setSelectedCountryId(null);
    }
  };

  const filteredCountries = allCountries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigationItems = [
    { id: 'CMS', label: '🌟 Site Content CMS', icon: Layout },
    { id: 'DATABASE', label: '🗄️ MySQL Database', icon: Database },
    { id: 'COUNTRIES', label: '📄 Country Portals (SEO)', icon: Globe },
    { id: 'CRM', label: '📊 Lead CRM Hub', icon: Users },
    { id: 'PRICING', label: '💎 Pricing & API Engine', icon: CreditCard },
    { id: 'ACTIVITY_LOGS', label: '🛡️ Backend Activity Logs', icon: Activity }
  ] as const;

  return (
    <div id="unified-admin-dashboard" className="min-h-screen bg-slate-50 flex flex-col lg:flex-row animate-in fade-in duration-300">
      
      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
            TH
          </div>
          <div>
            <div className="font-extrabold text-xs tracking-wider">TRADE HEAVEN</div>
            <div className="text-[10px] text-blue-400 font-bold uppercase">System Control Center</div>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          type="button"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* PERSISTENT SIDEBAR DESKTOP / COLLAPSED MOBILE */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-50 transform transition-transform duration-200 ease-in-out border-r border-slate-850 shrink-0
      `}>
        {/* LOGO SECTION */}
        <div className="p-6 border-b border-slate-800 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20">
            TH
          </div>
          <div>
            <h1 className="font-black text-white text-sm tracking-tight leading-none">TRADE HEAVEN</h1>
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1 block">ADMIN CONSOLE</span>
          </div>
        </div>

        {/* LOGGED IN USER CARD */}
        <div className="p-4 mx-4 my-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-black truncate">{currentUser?.name || 'Administrator'}</div>
            <div className="text-[10px] text-slate-500 truncate font-semibold">{currentUser?.email || 'yr943334@gmail.com'}</div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navigationItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10 font-black' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('HOMEPAGE')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace Home</span>
          </button>
        </div>
      </div>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className={`
            fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-350
            ${toastMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'}
          `}>
            <CheckCircle2 className={`w-5 h-5 ${toastMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className="text-xs font-bold">{toastMessage.text}</span>
          </div>
        )}

        {/* VIEW CONDITIONAL RENDERING */}
        {activeTab === 'CMS' && (
          <div className="space-y-4">
            <SiteContentCmsEditor />
          </div>
        )}

        {activeTab === 'DATABASE' && (
          <div className="space-y-4">
            <ClientAdminView
              selectedCurrency={selectedCurrency}
              onOpenPaymentCheckout={onOpenPaymentCheckout}
              currentUser={currentUser}
              onUpdateCurrentUser={onUpdateCurrentUser}
            />
          </div>
        )}

        {activeTab === 'CRM' && (
          <div className="space-y-4">
            <BulkEntityCrmModule />
          </div>
        )}

        {activeTab === 'PRICING' && (
          <div className="space-y-4">
            <PlanPricingAdminModule
              currentUserRole={currentUser?.role}
              onNavigateView={onNavigate}
            />
          </div>
        )}

        {activeTab === 'ACTIVITY_LOGS' && (
          <div className="space-y-4">
            <ActivityLogAdminModule />
          </div>
        )}

        {activeTab === 'COUNTRIES' && (
          <div className="space-y-6">
            
            {/* Country Portals Title block */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Regional Sourcing B2B Portals &amp; SEO Suite</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Manage Country Pages &amp; SEO Copy
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                    Configure custom SEO copywriting, modify company stats, edit imports/exports, or add/reduce country hubs instantly from the system controller.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleOpenAddCountry}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Country Portal</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* COUNTRY PORTALS LIST (5 COLS) */}
              <div className="xl:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      placeholder="Search active portals..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* List items */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {filteredCountries.map(item => {
                      const hasCustomData = !!COUNTRIES_DATA[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`
                            p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer
                            ${selectedCountryId === item.id 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-white hover:bg-slate-50 border-slate-200'}
                          `}
                          onClick={() => handleSelectCountry(item.id)}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl shrink-0">{item.flag || '🌐'}</span>
                            <div className="min-w-0">
                              <h3 className="text-xs font-black text-slate-900 truncate">
                                {item.name}
                              </h3>
                              <p className="text-[10px] text-slate-500 font-mono">
                                ID: {item.id} &bull; Code: {item.code}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {hasCustomData ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-extrabold uppercase">
                                Customized
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-extrabold uppercase">
                                Fallback
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCountry(item.id);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete B2B portal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredCountries.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        No B2B country portals found matching search.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EDITOR COLUMN (7 COLS) */}
              <div className="xl:col-span-7">
                {isEditingCountry || isAddingCountry ? (
                  <form onSubmit={handleSaveCountry} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <span>{isAddingCountry ? '🆕 Create New B2B Portal' : '✏️ Configure Portal:'}</span>
                        {!isAddingCountry && <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-black uppercase font-mono">{countryForm.id}</span>}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCountry(false);
                          setIsAddingCountry(false);
                          setSelectedCountryId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Section: Metadata */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        1. Basic Portal Configuration
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isAddingCountry && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 uppercase">Country Unique ID (hyphenated-slug)</label>
                            <input
                              type="text"
                              value={countryForm.id}
                              onChange={e => setCountryForm({ ...countryForm, id: e.target.value })}
                              placeholder="e.g. united-kingdom"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                              required
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Display Name</label>
                          <input
                            type="text"
                            value={countryForm.name}
                            onChange={e => setCountryForm({ ...countryForm, name: e.target.value })}
                            placeholder="e.g. United Kingdom"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Two-Letter Country Code (ISO)</label>
                          <input
                            type="text"
                            value={countryForm.code}
                            onChange={e => setCountryForm({ ...countryForm, code: e.target.value })}
                            placeholder="e.g. GB"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Flag Emoji</label>
                          <input
                            type="text"
                            value={countryForm.flag}
                            onChange={e => setCountryForm({ ...countryForm, flag: e.target.value })}
                            placeholder="e.g. 🇬🇧"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500 text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Stats */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        2. Marketplace Statistics (Display Numbers)
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Registered Companies</label>
                          <input
                            type="number"
                            value={countryForm.statsCompanies}
                            onChange={e => setCountryForm({ ...countryForm, statsCompanies: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Catalog Products</label>
                          <input
                            type="number"
                            value={countryForm.statsProducts}
                            onChange={e => setCountryForm({ ...countryForm, statsProducts: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Active RFQs / Tenders</label>
                          <input
                            type="number"
                            value={countryForm.statsRfqs}
                            onChange={e => setCountryForm({ ...countryForm, statsRfqs: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Commodities */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        3. Major Export &amp; Import Commodities
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase block">Top Exports (Comma-separated)</label>
                          <textarea
                            rows={2}
                            value={countryForm.topExports}
                            onChange={e => setCountryForm({ ...countryForm, topExports: e.target.value })}
                            placeholder="e.g. Wood Pellets, Cocoa Beans, Nickel, Iron Scrap"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase block">Top Imports (Comma-separated)</label>
                          <textarea
                            rows={2}
                            value={countryForm.topImports}
                            onChange={e => setCountryForm({ ...countryForm, topImports: e.target.value })}
                            placeholder="e.g. Industrial Machinery, EV Batteries, Dermal Fillers"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: SEO Copy */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>4. Custom SEO Copywriting &amp; Main Headings</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Primary SEO Title Headline (Display Display Heading)</label>
                          <input
                            type="text"
                            value={countryForm.seoHeadline}
                            onChange={e => setCountryForm({ ...countryForm, seoHeadline: e.target.value })}
                            placeholder="e.g. THE LARGEST B2B MARKETPLACE IN THE UNITED KINGDOM"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>

                        {/* Sections edit blocks */}
                        <div className="space-y-3 pt-2">
                          <h4 className="font-bold text-[11px] text-slate-700">Detailed Sourcing Sections (Up to 4 Content Columns)</h4>
                          {countryForm.seoSections.map((sec, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-250 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400">COLUMN 0{idx + 1}</span>
                              </div>
                              <input
                                type="text"
                                value={sec.title}
                                onChange={e => {
                                  const list = [...countryForm.seoSections];
                                  list[idx].title = e.target.value;
                                  setCountryForm({ ...countryForm, seoSections: list });
                                }}
                                placeholder="Section Heading"
                                className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-extrabold text-slate-850"
                              />
                              <textarea
                                rows={2}
                                value={sec.body}
                                onChange={e => {
                                  const list = [...countryForm.seoSections];
                                  list[idx].body = e.target.value;
                                  setCountryForm({ ...countryForm, seoSections: list });
                                }}
                                placeholder="Section Body Paragraph..."
                                className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-600 font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCountry(false);
                          setIsAddingCountry(false);
                          setSelectedCountryId(null);
                        }}
                        className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Portal Changes</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs text-center space-y-4 py-16">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">Select B2B country portal to edit</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Choose any country from the left-hand column to edit its display parameters, statistics, and main SEO copy blocks, or add a completely new market.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};
