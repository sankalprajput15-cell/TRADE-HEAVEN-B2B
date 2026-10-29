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
import { DatabaseDiagnosticTool } from '../tools/DatabaseDiagnosticTool';
import { RegisteredSuppliersAdmin } from './RegisteredSuppliersAdmin';
import { BulkCsvProductImporter } from './BulkCsvProductImporter';
import { BatchImageCsvImporter } from './BatchImageCsvImporter';
import { MultiImageBatchUploader } from './MultiImageBatchUploader';
import { DedicatedProductImageSystem } from './DedicatedProductImageSystem';
import { CustomEmailDispatcherAdminModule } from './CustomEmailDispatcherAdminModule';
import { RenewalOfferEmailHtmlManager } from './RenewalOfferEmailHtmlManager';
import { RenewalInsightsAdminModule } from './RenewalInsightsAdminModule';
import { UserDeletionLogModule } from './UserDeletionLogModule';
import { useNotifications } from '../../context/NotificationContext';
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
  Activity,
  Terminal,
  Building2,
  FileSpreadsheet,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  RefreshCw,
  Mail,
  Bell,
  Code2,
  TrendingUp
} from 'lucide-react';

export type AdminDashboardTabId = 
  | 'CUSTOM_EMAIL_DISPATCHER'
  | 'RENEWAL_INSIGHTS'
  | 'RENEWAL_EMAIL_HTML_EDITOR'
  | 'PRODUCT_IMAGE_SYSTEM' 
  | 'CMS' 
  | 'DATABASE' 
  | 'DIAGNOSTICS' 
  | 'REGISTERED_SUPPLIERS' 
  | 'COUNTRIES' 
  | 'CRM' 
  | 'PRICING' 
  | 'ACTIVITY_LOGS' 
  | 'USER_DELETION_LOG'
  | 'BULK_CSV_IMPORT' 
  | 'BATCH_IMAGE_IMPORT' 
  | 'MULTI_FILE_UPLOAD';

interface AdminDashboardProps {
  initialTab?: AdminDashboardTabId;
  currentUser: AuthUser | null;
  onNavigate: (view: any) => void;
  selectedCurrency: Currency;
  onOpenPaymentCheckout: (data: any) => void;
  onUpdateCurrentUser?: (updated: AuthUser) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'CUSTOM_EMAIL_DISPATCHER',
  currentUser,
  onNavigate,
  selectedCurrency,
  onOpenPaymentCheckout,
  onUpdateCurrentUser
}) => {
  const [activeTab, setActiveTab] = useState<AdminDashboardTabId>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const effectiveAdminUser: AuthUser = currentUser && currentUser.role === 'ADMIN'
    ? currentUser
    : {
        id: currentUser?.id || 'admin-master-01',
        name: currentUser?.name || 'Sankalp Rajput (Admin)',
        email: currentUser?.email || 'sankalprajput15@gmail.com',
        companyName: currentUser?.companyName || 'Trade Heaven Global B2B Administration',
        country: currentUser?.country || 'United States',
        role: 'ADMIN',
        status: 'ACTIVE',
        tier: 'VIP',
        isVerified: true,
        isVerifiedAdmin: true,
        isPremium: true,
        membershipStatus: 'paid'
      };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const {
    notifications,
    deliveryQueueStatus,
    isDeliveryQueueFlagged,
    resetDeliveryQueueAlert,
    simulateDeliveryQueueFailures,
    refreshDeliveryQueueStatus
  } = useNotifications();

  const [isSendingDiwaliOffer, setIsSendingDiwaliOffer] = useState(false);
  const [diwaliCampaignSummary, setDiwaliCampaignSummary] = useState<string | null>(null);
  const [diwaliBatchState, setDiwaliBatchState] = useState<{
    isRunning: boolean;
    totalClients: number;
    processedCount: number;
    deliveredCount: number;
    failedCount: number;
    currentRecipient: string | null;
    launchedAt: string | null;
    completedAt: string | null;
    receipts: Array<{
      recipient: string;
      success: boolean;
      enforcedDelayMs?: number;
      messageId?: string;
      dispatchedAt?: string;
      error?: string;
    }>;
  }>({
    isRunning: false,
    totalClients: 4,
    processedCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    currentRecipient: null,
    launchedAt: null,
    completedAt: null,
    receipts: []
  });

  // Load initial Diwali campaign status & eligible client count
  useEffect(() => {
    let active = true;
    fetch('/api/v1/admin/diwali-offer-clients', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data?.success) return;
        const c = data.lastCampaign;
        const clientCount = Array.isArray(data.clients) ? data.clients.length : 4;
        if (c) {
          setDiwaliBatchState({
            isRunning: Boolean(c.isRunning),
            totalClients: Number(c.totalClients || clientCount || 4),
            processedCount: Number(c.processedCount ?? c.deliveredCount ?? 0),
            deliveredCount: Number(c.deliveredCount || 0),
            failedCount: Number(c.failedCount || 0),
            currentRecipient: c.currentRecipient || null,
            launchedAt: c.launchedAt || null,
            completedAt: c.completedAt || null,
            receipts: Array.isArray(c.receipts) ? c.receipts : []
          });
          if (c.isRunning) {
            setIsSendingDiwaliOffer(true);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Poll live batch progress every 600ms while the Diwali campaign is running
  useEffect(() => {
    if (!isSendingDiwaliOffer && !diwaliBatchState.isRunning) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/admin/diwali-offer-clients', {
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) return;
        const data = await res.json();
        const c = data?.lastCampaign;
        if (c) {
          setDiwaliBatchState({
            isRunning: Boolean(c.isRunning),
            totalClients: Number(c.totalClients || 4),
            processedCount: Number(c.processedCount ?? 0),
            deliveredCount: Number(c.deliveredCount || 0),
            failedCount: Number(c.failedCount || 0),
            currentRecipient: c.currentRecipient || null,
            launchedAt: c.launchedAt || null,
            completedAt: c.completedAt || null,
            receipts: Array.isArray(c.receipts) ? c.receipts : []
          });

          if (!c.isRunning && c.launchedAt) {
            setIsSendingDiwaliOffer(false);
            await refreshDeliveryQueueStatus();
            const msg = `Diwali Maha Utsav (DIWALI10 - Flat 10% OFF) offer emailed to ${c.deliveredCount}/${c.totalClients} existing clients via serialized 2s delivery queue.`;
            setDiwaliCampaignSummary(msg);
          }
        }
      } catch {
        // ignore transient poll error
      }
    }, 600);

    return () => clearInterval(pollInterval);
  }, [isSendingDiwaliOffer, diwaliBatchState.isRunning, refreshDeliveryQueueStatus]);

  const handleBroadcastDiwaliOffer = async () => {
    setIsSendingDiwaliOffer(true);
    setDiwaliCampaignSummary(null);
    setDiwaliBatchState((prev) => ({
      ...prev,
      isRunning: true,
      processedCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      currentRecipient: null,
      completedAt: null,
      receipts: []
    }));

    try {
      const res = await fetch('/api/v1/admin/launch-diwali-offer-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ async: true })
      });
      const data = await res.json();
      if (data?.campaign) {
        const c = data.campaign;
        setDiwaliBatchState({
          isRunning: Boolean(c.isRunning),
          totalClients: Number(c.totalClients || 4),
          processedCount: Number(c.processedCount ?? 0),
          deliveredCount: Number(c.deliveredCount || 0),
          failedCount: Number(c.failedCount || 0),
          currentRecipient: c.currentRecipient || null,
          launchedAt: c.launchedAt || null,
          completedAt: c.completedAt || null,
          receipts: Array.isArray(c.receipts) ? c.receipts : []
        });
      }
      if (!data?.success) {
        setIsSendingDiwaliOffer(false);
        triggerToast('error', data?.message || 'Failed to launch Diwali offer campaign.');
      }
    } catch (err: any) {
      setIsSendingDiwaliOffer(false);
      triggerToast('error', err?.message || 'Network error while dispatching Diwali offer emails.');
    }
  };

  const latestQueueAlertNotification = notifications.find(
    (n) => n.type === 'SYSTEM' && n.title.toLowerCase().includes('delivery queue')
  );

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
    { id: 'RENEWAL_INSIGHTS', label: '📈 Renewal Insights (Open Rate)', icon: TrendingUp },
    { id: 'RENEWAL_EMAIL_HTML_EDITOR', label: '💻 Renewal Offer HTML Editor', icon: Code2 },
    { id: 'CUSTOM_EMAIL_DISPATCHER', label: '✉️ Dispatch & Mail Center', icon: Mail },
    { id: 'PRODUCT_IMAGE_SYSTEM', label: '📸 Product Image System (All)', icon: ImageIcon },
    { id: 'CMS', label: '🌟 Site Content CMS', icon: Layout },
    { id: 'DATABASE', label: '🗄️ Core Database', icon: Database },
    { id: 'BULK_CSV_IMPORT', label: '📥 Bulk CSV Product Import', icon: FileSpreadsheet },
    { id: 'BATCH_IMAGE_IMPORT', label: '🖼️ Batch Image URL Import', icon: ImageIcon },
    { id: 'MULTI_FILE_UPLOAD', label: '📂 Multi-File Image Uploader', icon: Upload },
    { id: 'DIAGNOSTICS', label: '🔬 Registration Diagnostics', icon: Terminal },
    { id: 'REGISTERED_SUPPLIERS', label: '🏭 Registered Suppliers', icon: Building2 },
    { id: 'COUNTRIES', label: '📄 Country Portals (SEO)', icon: Globe },
    { id: 'CRM', label: '📊 Lead CRM Hub', icon: Users },
    { id: 'PRICING', label: '💎 Pricing & API Engine', icon: CreditCard },
    { id: 'USER_DELETION_LOG', label: '🗑️ User Deletion Log', icon: Trash2 },
    { id: 'ACTIVITY_LOGS', label: '🛡️ System Activity Logs', icon: Activity }
  ] as const;

  const handleSelectSidebarTab = (tabId: AdminDashboardTabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
    if (typeof window !== 'undefined') {
      const mainEl = document.getElementById('admin-main-viewport');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div id="unified-admin-dashboard" className="min-h-screen bg-slate-50 flex flex-col lg:flex-row rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
      
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
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          type="button"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isSidebarOpen ? 'Close Menu' : 'Admin Menu'}</span>
        </button>
      </div>

      {/* PERSISTENT SIDEBAR DESKTOP / COLLAPSED MOBILE */}
      <div className={`
        ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}
        w-full lg:w-72 bg-slate-900 text-slate-200 flex-col border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 lg:min-h-screen
      `}>
        {/* LOGO SECTION */}
        <div className="p-5 border-b border-slate-800 hidden lg:flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20">
              TH
            </div>
            <div>
              <h1 className="font-black text-white text-sm tracking-tight leading-none">TRADE HEAVEN</h1>
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1 block">ADMIN CONSOLE</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
            Live
          </span>
        </div>

        {/* LOGGED IN USER CARD */}
        <div className="p-3.5 mx-4 mt-4 mb-2 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center font-black text-xs shrink-0">
              {effectiveAdminUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-black truncate">{effectiveAdminUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate font-semibold">{effectiveAdminUser.email}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-200 border border-blue-400/30 text-[9px] font-black uppercase shrink-0">
            Admin
          </span>
        </div>

        {/* SIDEBAR DELIVERY QUEUE STATUS INDICATOR (INTERACTIVE) */}
        <button
          type="button"
          id="admin-sidebar-queue-indicator"
          onClick={() => {
            handleSelectSidebarTab('CUSTOM_EMAIL_DISPATCHER');
            refreshDeliveryQueueStatus();
          }}
          className={`mx-4 mb-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            isDeliveryQueueFlagged
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-lg shadow-rose-950/50 hover:bg-rose-900/80'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-200'
          }`}
          title="Click to open Dispatch & Mail Center and refresh SMTP queue status"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isDeliveryQueueFlagged
                    ? 'bg-rose-500 animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-[11px] font-black uppercase tracking-wider truncate">
                {isDeliveryQueueFlagged ? 'Queue Flagged (5+ Err)' : 'Delivery Queue OK'}
              </span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                isDeliveryQueueFlagged
                  ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {deliveryQueueStatus.consecutiveFailures}/{deliveryQueueStatus.failureThreshold}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span>Min Delay: {deliveryQueueStatus.minDelayMs / 1000}s</span>
            <span>Sent: {deliveryQueueStatus.totalProcessed}</span>
          </div>
        </button>

        {/* NAVIGATION LINKS */}
        <nav aria-label="Admin Console Navigation" className="flex-1 px-3 py-1 space-y-1 overflow-y-auto max-h-[65vh] lg:max-h-none">
          {navigationItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSidebarTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-black ring-1 ring-blue-400/40' 
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'}
                `}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t border-slate-800 mt-auto">
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

      {/* MAIN VIEWPORT */}
      <main id="admin-main-viewport" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* TOP QUICK-SWITCH BAR FOR EMAIL OPEN RATE & RENEWAL MANAGEMENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectSidebarTab('RENEWAL_INSIGHTS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'RENEWAL_INSIGHTS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>📈 Mail Open Rate &amp; Renewal Insights</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSidebarTab('RENEWAL_EMAIL_HTML_EDITOR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'RENEWAL_EMAIL_HTML_EDITOR'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>💻 Renewal Offer HTML &amp; Brand Header/Footer Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSidebarTab('CUSTOM_EMAIL_DISPATCHER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'CUSTOM_EMAIL_DISPATCHER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>✉️ Dispatch &amp; Mail Center</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('HOMEPAGE')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </button>
        </div>
        
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

        {/* AUTOMATED DELIVERY QUEUE STATUS INDICATOR BANNER (Shown on Dispatch Center or if Flagged) */}
        {(activeTab === 'CUSTOM_EMAIL_DISPATCHER' || isDeliveryQueueFlagged) && (
        <div
          id="admin-delivery-queue-status-indicator"
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDeliveryQueueFlagged
              ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-md shadow-rose-500/10'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isDeliveryQueueFlagged
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {isDeliveryQueueFlagged ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-black tracking-tight">
                    {isDeliveryQueueFlagged
                      ? `🚨 DELIVERY QUEUE CRITICAL FLAG: ${deliveryQueueStatus.consecutiveFailures} Consecutive Failures Detected`
                      : 'Serialized SMTP Delivery Queue Status: HEALTHY'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      isDeliveryQueueFlagged
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isDeliveryQueueFlagged ? 'FLAGGED • ACTION REQUIRED' : 'SERIALIZED 2S INTERVAL'}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isDeliveryQueueFlagged ? 'text-rose-800 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {isDeliveryQueueFlagged
                    ? `Automated NotificationContext alert triggered after reaching the ${deliveryQueueStatus.failureThreshold}-failure threshold. Last error: "${
                        deliveryQueueStatus.lastFailureReason || 'SMTP transport error'
                      }".`
                    : `All single-recipient batch operations are strictly serialized with a minimum ${
                        deliveryQueueStatus.minDelayMs / 1000
                      }s delay. Consecutive failures: ${deliveryQueueStatus.consecutiveFailures}/${
                        deliveryQueueStatus.failureThreshold
                      } (Queue depth: ${deliveryQueueStatus.queueDepth}, Total processed: ${
                        deliveryQueueStatus.totalProcessed
                      }).`}
                </p>
                {isDeliveryQueueFlagged && latestQueueAlertNotification && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 border border-rose-200 text-[11px] text-rose-900 font-bold">
                    <Bell className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>
                      NotificationContext Logged: &ldquo;{latestQueueAlertNotification.title}&rdquo;
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isDeliveryQueueFlagged ? (
                <button
                  type="button"
                  onClick={async () => {
                    await resetDeliveryQueueAlert();
                    triggerToast('success', 'Delivery queue failure counter reset and status indicator cleared.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Acknowledge &amp; Reset Flag</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await simulateDeliveryQueueFailures(5);
                    triggerToast('error', 'Simulated 5 consecutive queue failures — NotificationContext alert triggered.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
                  title="Simulate 5 consecutive failures to verify NotificationContext & status flag"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Test 5-Failure Alert</span>
                </button>
              )}

              <button
                type="button"
                disabled={isSendingDiwaliOffer}
                onClick={handleBroadcastDiwaliOffer}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Send the Diwali Maha Utsav (FLAT 10% OFF • DIWALI10) banner offer email to all existing clients via the serialized 2s queue"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {isSendingDiwaliOffer
                    ? `Emails Sent ${diwaliBatchState.processedCount}/${diwaliBatchState.totalClients} (2s Queue)...`
                    : 'Mail Diwali Offer (DIWALI10) to Clients'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ACTIVITY_LOGS')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Inspect Logs</span>
              </button>
            </div>
          </div>

          {/* DIWALI OFFER BATCH PROGRESS BAR & STATUS COUNTER */}
          <div
            id="admin-diwali-batch-progress-monitor"
            className="mt-4 pt-3.5 border-t border-slate-200/80 space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  🪔 Diwali Offer Batch Monitor (Code: DIWALI10)
                </span>
                <span
                  id="admin-diwali-emails-sent-counter"
                  className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-black ${
                    isSendingDiwaliOffer || diwaliBatchState.isRunning
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : diwaliBatchState.processedCount > 0 &&
                        diwaliBatchState.processedCount === diwaliBatchState.totalClients
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Emails Sent {diwaliBatchState.processedCount}/{diwaliBatchState.totalClients}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                {diwaliBatchState.currentRecipient && (isSendingDiwaliOffer || diwaliBatchState.isRunning) && (
                  <span className="text-amber-700 font-mono">
                    Dispatching: {diwaliBatchState.currentRecipient}
                  </span>
                )}
                <span>
                  {diwaliBatchState.totalClients > 0
                    ? `${Math.round(
                        (diwaliBatchState.processedCount / diwaliBatchState.totalClients) * 100
                      )}% Complete`
                    : '0% Complete'}
                </span>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                id="admin-diwali-batch-progress-bar"
                className={`h-full transition-all duration-500 rounded-full ${
                  diwaliBatchState.failedCount > 0
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : isSendingDiwaliOffer || diwaliBatchState.isRunning
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{
                  width: `${
                    diwaliBatchState.totalClients > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (diwaliBatchState.processedCount / diwaliBatchState.totalClients) * 100
                          )
                        )
                      : 0
                  }%`
                }}
              />
            </div>

            {/* Per-Recipient Serialized Receipt Badges */}
            {diwaliBatchState.receipts.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {diwaliBatchState.receipts.map((rec, idx) => (
                  <span
                    key={`${rec.recipient}-${idx}`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                      rec.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{rec.recipient}</span>
                    {typeof rec.enforcedDelayMs === 'number' && (
                      <span className="text-slate-400">({rec.enforcedDelayMs / 1000}s)</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {diwaliCampaignSummary && (
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-2 pt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{diwaliCampaignSummary}</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* VIEW CONDITIONAL RENDERING */}
        {activeTab === 'CUSTOM_EMAIL_DISPATCHER' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black">
                    Manage Automated &lsquo;Renewal Offer&rsquo; HTML Templates &amp; Conversion Insights
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Edit raw HTML source with dynamic placeholders (<code className="text-amber-300 font-mono">{'{{userName}}'}</code>, <code className="text-emerald-300 font-mono">{'{{planName}}'}</code>) or monitor open rates, CTR, and conversion status.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectSidebarTab('RENEWAL_INSIGHTS')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Renewal Insights →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSidebarTab('RENEWAL_EMAIL_HTML_EDITOR')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Renewal HTML Editor →</span>
                </button>
              </div>
            </div>
            <CustomEmailDispatcherAdminModule onOpenPaymentCheckout={onOpenPaymentCheckout} />
          </div>
        )}

        {activeTab === 'RENEWAL_INSIGHTS' && (
          <div className="space-y-4">
            <RenewalInsightsAdminModule
              onOpenPaymentCheckout={onOpenPaymentCheckout}
              onNavigateToHtmlEditor={() => handleSelectSidebarTab('RENEWAL_EMAIL_HTML_EDITOR')}
              onNavigateToDispatcher={() => handleSelectSidebarTab('CUSTOM_EMAIL_DISPATCHER')}
            />
          </div>
        )}

        {activeTab === 'RENEWAL_EMAIL_HTML_EDITOR' && (
          <div className="space-y-4">
            <RenewalOfferEmailHtmlManager onOpenPaymentCheckout={onOpenPaymentCheckout} />
          </div>
        )}

        {activeTab === 'PRODUCT_IMAGE_SYSTEM' && (
          <div className="space-y-4">
            <DedicatedProductImageSystem />
          </div>
        )}

        {activeTab === 'BULK_CSV_IMPORT' && (
          <div className="space-y-4">
            <BulkCsvProductImporter onImportSuccess={(count) => triggerToast('success', `Successfully imported ${count} products into supplier catalog!`)} />
          </div>
        )}

        {activeTab === 'MULTI_FILE_UPLOAD' && (
          <div className="space-y-4">
            <MultiImageBatchUploader onAssignImages={(assignments) => triggerToast('success', `Successfully assigned and saved ${assignments.length} product images!`)} />
          </div>
        )}

        {activeTab === 'BATCH_IMAGE_IMPORT' && (
          <div className="space-y-4">
            <BatchImageCsvImporter onUpdateSuccess={(count) => triggerToast('success', `Successfully updated ${count} product image URLs!`)} />
          </div>
        )}

        {activeTab === 'CMS' && (
          <div className="space-y-4">
            <SiteContentCmsEditor currentUser={effectiveAdminUser} />
          </div>
        )}

        {activeTab === 'DATABASE' && (
          <div className="space-y-4">
            <ClientAdminView
              selectedCurrency={selectedCurrency}
              onOpenPaymentCheckout={onOpenPaymentCheckout}
              currentUser={effectiveAdminUser}
              onUpdateCurrentUser={onUpdateCurrentUser}
            />
          </div>
        )}

        {activeTab === 'DIAGNOSTICS' && (
          <div className="space-y-4">
            <DatabaseDiagnosticTool />
          </div>
        )}

        {activeTab === 'REGISTERED_SUPPLIERS' && (
          <div className="space-y-4">
            <RegisteredSuppliersAdmin />
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
              currentUserRole={effectiveAdminUser.role}
              onNavigateView={onNavigate}
            />
          </div>
        )}

        {activeTab === 'ACTIVITY_LOGS' && (
          <div className="space-y-4">
            <ActivityLogAdminModule />
          </div>
        )}

        {activeTab === 'USER_DELETION_LOG' && (
          <div className="space-y-4">
            <UserDeletionLogModule currentUser={effectiveAdminUser} />
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
