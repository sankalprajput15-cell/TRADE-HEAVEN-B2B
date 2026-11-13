import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Currency, UserRole, ActiveView, AuthUser, Product } from '../../types';
import { useAuth, isStrictVerifiedRootAdmin } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { productImageManagerService } from '../../services/productImageManagerService';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { TradeHeavenLogo } from '../common/TradeHeavenLogo';
import { NotificationBell } from './NotificationBell';
import { LanguageRegionSelector } from './LanguageRegionSelector';
import { HeaderWalletBalance } from './HeaderWalletBalance';
import { SafeImage } from '../common/SafeImage';
import {
  SearchAutoSuggestDropdown,
  useSearchAutoSuggest,
  CategorySuggestion,
  SupplierSuggestion
} from '../common/SearchAutoSuggestDropdown';
import {
  Mail,
  PlusCircle,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Image as ImageIcon,
  Search,
  Globe,
  X,
  Database,
  ArrowUpRight,
  Share2,
  PackagePlus,
  Headphones,
  Edit3,
  User,
  Building2,
  Users,
  FileText,
  Calculator,
  BookOpen,
  Briefcase,
  MessageSquare,
  Info,
  TrendingUp,
  Package,
  Home,
  Wallet,
  Landmark,
  Activity,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Eye,
  Menu
} from 'lucide-react';

interface Props {
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  onNavigate?: (view: ActiveView | string, options?: any) => void;
  selectedCurrency: Currency;
  setSelectedCurrency?: (curr: Currency) => void;
  onCurrencyChange?: (curr: Currency) => void;
  currentUser: AuthUser | null;
  currentUserRole?: UserRole;
  setCurrentUserRole?: (role: UserRole) => void;
  onOpenCreateRfq?: () => void;
  onOpenBackendManager?: () => void;
  onOpenDbModal?: () => void;
  onOpenAuthModal: () => void;
  onOpenRegisterFree?: () => void;
  onOpenOnboardModal?: () => void;
  onOpenContactModal?: () => void;
  onLogout?: () => void;
  unreadMessagesCount?: number;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onOpenStorefront?: (companyId: string) => void;
  onNavigateToCategory?: (category: string, subcategory?: string) => void;
  onNavigateToSearch?: (query: string) => void;
}

const CURRENCY_OPTIONS: { code: Currency; symbol: string }[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'CNY', symbol: '¥' },
  { code: 'JPY', symbol: '¥' }
];

export const Header: React.FC<Props> = ({
  activeView,
  setActiveView,
  onNavigate,
  selectedCurrency,
  setSelectedCurrency,
  onCurrencyChange,
  currentUser,
  currentUserRole = currentUser?.role || 'BUYER',
  onOpenCreateRfq,
  onOpenDbModal,
  onOpenAuthModal,
  onOpenRegisterFree,
  onOpenOnboardModal,
  onOpenContactModal,
  onLogout,
  products = [],
  onSelectProduct,
  onOpenStorefront,
  onNavigateToCategory,
  onNavigateToSearch
}) => {
  const { setCurrentUser, logout, login } = useAuth();
  const { isLiveEditMode, setIsLiveEditMode, toggleLiveEditMode, publishChangesToServer, updatePageContent } = useSiteContent();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSuggestIndex, setActiveSuggestIndex] = useState(-1);

  // Top Admin Bar Real-Time Quick Upload & Sync State
  const [showAdminQuickUploadModal, setShowAdminQuickUploadModal] = useState(false);
  const [quickUploadTargetType, setQuickUploadTargetType] = useState<'PRODUCT' | 'HERO' | 'GLOBAL_ALL'>('PRODUCT');
  const [selectedQuickProductId, setSelectedQuickProductId] = useState<string>('');
  const [quickProductFilter, setQuickProductFilter] = useState<string>('');
  const [quickBeforeUrl, setQuickBeforeUrl] = useState<string>('');
  const [quickAfterUrl, setQuickAfterUrl] = useState<string>('');
  const [quickDirectUrl, setQuickDirectUrl] = useState<string>('');
  const [isQuickUploading, setIsQuickUploading] = useState<boolean>(false);
  const [quickUploadMessage, setQuickUploadMessage] = useState<string>('');
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [liveSyncBadgeText, setLiveSyncBadgeText] = useState<string>('');

  const availableProductsList = useMemo(() => {
    const base = products && products.length > 0 ? products : MOCK_PRODUCTS;
    return productImageManagerService.applyOverridesToProductList(base);
  }, [products, quickAfterUrl]);

  useEffect(() => {
    if (!selectedQuickProductId && availableProductsList.length > 0) {
      const first = availableProductsList[0];
      setSelectedQuickProductId(first.id);
      const ov = productImageManagerService.getState().overrides[first.id];
      setQuickBeforeUrl(ov?.previousPrimary || first.images?.[0] || '');
      setQuickAfterUrl(ov?.primary || first.images?.[0] || '');
      setQuickDirectUrl(ov?.primary || first.images?.[0] || '');
    }
  }, [availableProductsList, selectedQuickProductId]);

  const handleSelectQuickProduct = (pid: string) => {
    setSelectedQuickProductId(pid);
    const prod = availableProductsList.find(p => p.id === pid);
    const ov = productImageManagerService.getState().overrides[pid];
    const currentPrimary = ov?.primary || prod?.images?.[0] || '';
    const prevPrimary = ov?.previousPrimary || prod?.images?.[0] || currentPrimary;
    setQuickBeforeUrl(prevPrimary);
    setQuickAfterUrl(currentPrimary);
    setQuickDirectUrl(currentPrimary);
    setQuickUploadMessage('');
  };

  const handleTopBarQuickFileUpload = async (file: File) => {
    setIsQuickUploading(true);
    setQuickUploadMessage('Uploading image & syncing live to server (Incognito ready)...');
    try {
      if (quickUploadTargetType === 'PRODUCT' && selectedQuickProductId) {
        const prod = availableProductsList.find(p => p.id === selectedQuickProductId);
        const currentImg = productImageManagerService.getState().overrides[selectedQuickProductId]?.primary || prod?.images?.[0] || '';
        setQuickBeforeUrl(currentImg);

        const res = await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: 'jpg',
          quality: 0.92,
          productId: selectedQuickProductId
        });
        await productImageManagerService.setProductImage(selectedQuickProductId, res.url);
        await productImageManagerService.forceSyncToServer();
        setQuickAfterUrl(res.url);
        setQuickDirectUrl(res.url);
        setQuickUploadMessage(`Uploaded & updated "${prod?.title || selectedQuickProductId}" in real time! Active in Incognito.`);
      } else if (quickUploadTargetType === 'HERO') {
        const res = await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: 'jpg',
          quality: 0.92
        });
        await updatePageContent('homepage', { heroBgImage: res.url });
        await publishChangesToServer();
        await productImageManagerService.forceSyncToServer();
        setQuickAfterUrl(res.url);
        setQuickDirectUrl(res.url);
        setQuickUploadMessage('Hero Banner image uploaded & published live to server (Incognito ready)!');
      } else if (quickUploadTargetType === 'GLOBAL_ALL') {
        const res = await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: 'jpg',
          quality: 0.92,
          applyToAll: true,
          productIds: availableProductsList.map(p => p.id)
        });
        await productImageManagerService.setAllProductsImage(res.url, availableProductsList.map(p => p.id));
        await productImageManagerService.forceSyncToServer();
        setQuickAfterUrl(res.url);
        setQuickDirectUrl(res.url);
        setQuickUploadMessage('Uploaded & applied image across all listed products in real time!');
      }
    } catch (err: any) {
      setQuickUploadMessage(err?.message || 'Upload failed');
    } finally {
      setIsQuickUploading(false);
    }
  };

  const handleTopBarApplyDirectUrl = async (urlToApply: string) => {
    const clean = urlToApply.trim();
    if (!clean) return;
    setIsQuickUploading(true);
    setQuickUploadMessage('Applying image URL & syncing live to server...');
    try {
      if (quickUploadTargetType === 'PRODUCT' && selectedQuickProductId) {
        const prod = availableProductsList.find(p => p.id === selectedQuickProductId);
        const currentImg = productImageManagerService.getState().overrides[selectedQuickProductId]?.primary || prod?.images?.[0] || '';
        if (currentImg && currentImg !== clean) {
          setQuickBeforeUrl(currentImg);
        }
        await productImageManagerService.setProductImage(selectedQuickProductId, clean);
        await productImageManagerService.forceSyncToServer();
        setQuickAfterUrl(clean);
        setQuickDirectUrl(clean);
        setQuickUploadMessage(`Applied image to "${prod?.title || selectedQuickProductId}" & synced for Incognito!`);
      } else if (quickUploadTargetType === 'HERO') {
        await updatePageContent('homepage', { heroBgImage: clean });
        await publishChangesToServer();
        await productImageManagerService.forceSyncToServer();
        setQuickAfterUrl(clean);
        setQuickDirectUrl(clean);
        setQuickUploadMessage('Hero Banner image updated & synced live!');
      } else if (quickUploadTargetType === 'GLOBAL_ALL') {
        await productImageManagerService.setAllProductsImage(clean, availableProductsList.map(p => p.id));
        await productImageManagerService.forceSyncToServer();
        setQuickAfterUrl(clean);
        setQuickDirectUrl(clean);
        setQuickUploadMessage('Applied image across all listed products & synced live!');
      }
    } finally {
      setIsQuickUploading(false);
    }
  };

  const handleTopBarSyncLiveNow = async () => {
    setIsSyncingLive(true);
    setLiveSyncBadgeText('Syncing to Server...');
    try {
      await Promise.all([
        productImageManagerService.forceSyncToServer(),
        publishChangesToServer().catch(() => ({ success: true }))
      ]);
      setLiveSyncBadgeText('Synced Live (Incognito Ready)!');
      setTimeout(() => setLiveSyncBadgeText(''), 4000);
    } finally {
      setIsSyncingLive(false);
    }
  };

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: ActiveView | string, options?: any) => {
    setUserMenuOpen(false);
    if (onNavigate) {
      onNavigate(view, options);
    } else if (setActiveView) {
      setActiveView(view as ActiveView);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCurrencySelect = (curr: Currency) => {
    if (onCurrencyChange) {
      onCurrencyChange(curr);
    } else if (setSelectedCurrency) {
      setSelectedCurrency(curr);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchTerm.trim();
    setSearchFocused(false);
    setUserMenuOpen(false);
    setActiveSuggestIndex(-1);
    if (onNavigateToSearch) {
      onNavigateToSearch(trimmed);
    } else {
      handleNavClick('PRODUCT_DIRECTORY', { search: trimmed });
    }
  };

  const autoSuggestions = useSearchAutoSuggest(searchTerm, products, 5, 5, 3);

  const handleSelectSuggestedCategory = (cat: CategorySuggestion) => {
    setSearchFocused(false);
    setActiveSuggestIndex(-1);
    setSearchTerm(cat.name);
    if (onNavigateToCategory) {
      if (cat.isSubcategory && cat.parentCategory) {
        onNavigateToCategory(cat.parentCategory, cat.name);
      } else {
        onNavigateToCategory(cat.name, '');
      }
    } else if (onNavigateToSearch) {
      onNavigateToSearch(cat.name);
    } else {
      handleNavClick('PRODUCT_DIRECTORY');
    }
  };

  const handleSelectSuggestedSupplier = (supp: SupplierSuggestion) => {
    setSearchFocused(false);
    setActiveSuggestIndex(-1);
    setSearchTerm(supp.companyName);
    if (onOpenStorefront && supp.id && !supp.id.startsWith('supp-')) {
      onOpenStorefront(supp.id);
    } else if (onNavigateToSearch) {
      onNavigateToSearch(supp.companyName);
    } else {
      handleNavClick('SUPPLIERS_DIRECTORY');
    }
  };

  const handleSelectSuggestedProduct = (prod: Product) => {
    setSearchFocused(false);
    setActiveSuggestIndex(-1);
    setSearchTerm(prod.title);
    if (onSelectProduct) {
      onSelectProduct(prod);
    } else if (onNavigateToSearch) {
      onNavigateToSearch(prod.title);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchFocused(false);
      setActiveSuggestIndex(-1);
      return;
    }
    const totalItems =
      autoSuggestions.categories.length +
      autoSuggestions.suppliers.length +
      autoSuggestions.products.length;

    if (!totalItems) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchFocused(true);
      setActiveSuggestIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchFocused(true);
      setActiveSuggestIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeSuggestIndex >= 0) {
      e.preventDefault();
      const catLen = autoSuggestions.categories.length;
      const suppLen = autoSuggestions.suppliers.length;
      if (activeSuggestIndex < catLen) {
        handleSelectSuggestedCategory(autoSuggestions.categories[activeSuggestIndex]);
      } else if (activeSuggestIndex < catLen + suppLen) {
        handleSelectSuggestedSupplier(autoSuggestions.suppliers[activeSuggestIndex - catLen]);
      } else {
        const prodIdx = activeSuggestIndex - catLen - suppLen;
        if (autoSuggestions.products[prodIdx]) {
          handleSelectSuggestedProduct(autoSuggestions.products[prodIdx]);
        }
      }
    }
  };

  const isPaidAndRegisteredMember = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    const isRegisteredRole = currentUser.role === 'BUYER' || currentUser.role === 'SUPPLIER';
    if (!isRegisteredRole) return false;
    
    // Strictly require paid membership status, isPremium flag, or paid tier (GOLD/PLATINUM/SILVER)
    const isPaid = 
      currentUser.membershipStatus === 'paid' || 
      currentUser.isPremium === true ||
      (Boolean(currentUser.tier) && currentUser.tier !== 'FREE');
      
    return isPaid;
  }, [currentUser]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      logout();
      setCurrentUser(null);
    }
  };

  const isAdmin = isStrictVerifiedRootAdmin(currentUser);

  const handleToggleTopBarRealtimeEdit = () => {
    if (!isAdmin) return;
    toggleLiveEditMode();
  };

  const handleOpenFundsTopUp = () => {
    setUserMenuOpen(false);
    handleNavClick('WALLET_TOPUP');
  };

  // Primary inline top-bar links
  const primaryNavItems: { label: string; view: ActiveView; activeMatch: ActiveView[] }[] = [
    { label: 'Home', view: 'HOMEPAGE', activeMatch: ['HOMEPAGE', 'MARKETPLACE_HOME', 'LANDING_PAGE'] },
    { label: 'Products', view: 'PRODUCT_DIRECTORY', activeMatch: ['PRODUCT_DIRECTORY'] },
    { label: 'Suppliers', view: 'SUPPLIERS_DIRECTORY', activeMatch: ['SUPPLIERS_DIRECTORY', 'VENDOR_PROFILE'] },
    { label: 'Buy Leads', view: 'BUY_LEADS', activeMatch: ['BUY_LEADS', 'RFQ_HUB'] },
    { label: 'Services', view: 'PREMIUM_SERVICES', activeMatch: ['PREMIUM_SERVICES', 'PREMIUM_MEMBERSHIP'] }
  ];

  // Marketplace & directory options inside the Account Toggle menu
  const accountMenuOptions: {
    label: string;
    view: ActiveView;
    icon: React.ComponentType<{ className?: string }>;
    activeMatch: ActiveView[];
    authOnly?: boolean;
  }[] = [
    { label: 'Home', view: 'HOMEPAGE', icon: Home, activeMatch: ['HOMEPAGE', 'MARKETPLACE_HOME', 'LANDING_PAGE'] },
    { label: 'Trust Certificate', view: 'B2B_TRUST_CERTIFICATE', icon: ShieldCheck, activeMatch: ['B2B_TRUST_CERTIFICATE'] },
    { label: 'Trade Assurance Certificate', view: 'TRADE_ASSURANCE_CERTIFICATE', icon: ShieldCheck, activeMatch: ['TRADE_ASSURANCE_CERTIFICATE'] },
    { label: 'Dashboard & Ledger', view: 'DASHBOARD', icon: LayoutDashboard, activeMatch: ['DASHBOARD'], authOnly: true },
    { label: 'Wallet Funds Top-Up', view: 'WALLET_TOPUP', icon: Wallet, activeMatch: ['WALLET_TOPUP', 'MEDIATOR_ENGINE'], authOnly: true },
    { label: 'Supplier Bank & Withdrawals', view: 'SUPPLIER_WITHDRAWAL', icon: Landmark, activeMatch: ['SUPPLIER_WITHDRAWAL'], authOnly: true },
    { label: 'Direct Transfer & Mediation Guide', view: 'DIRECT_TRANSFER_GUIDE', icon: ShieldCheck, activeMatch: ['DIRECT_TRANSFER_GUIDE'] },
    { label: 'Products Catalog', view: 'PRODUCT_DIRECTORY', icon: Package, activeMatch: ['PRODUCT_DIRECTORY'] },
    { label: 'Admin: Product Media & Image Catalog Manager', view: 'PRODUCT_IMAGE_ADMIN' as ActiveView, icon: ImageIcon, activeMatch: ['PRODUCT_IMAGE_ADMIN' as ActiveView] },
    { label: 'Verified Suppliers', view: 'SUPPLIERS_DIRECTORY', icon: Building2, activeMatch: ['SUPPLIERS_DIRECTORY', 'VENDOR_PROFILE'] },
    { label: 'Verified Buyers', view: 'BUYERS_DIRECTORY', icon: Users, activeMatch: ['BUYERS_DIRECTORY', 'BUYER_PROFILE'] },
    { label: 'Buy Leads', view: 'BUY_LEADS', icon: TrendingUp, activeMatch: ['BUY_LEADS'] },
    { label: 'RFQ Hub & Tenders', view: 'RFQ_HUB', icon: FileText, activeMatch: ['RFQ_HUB'] },
    { label: 'Country Trade Hubs', view: 'COUNTRY_HUB', icon: Globe, activeMatch: ['COUNTRY_HUB'] },
    { label: 'Incoterms Calculator', view: 'INCOTERMS_CALCULATOR', icon: Calculator, activeMatch: ['INCOTERMS_CALCULATOR', 'TRADE_TOOLS'] },
    { label: 'News & Insights', view: 'INSIGHTS', icon: BookOpen, activeMatch: ['INSIGHTS'] },
    { label: 'Trust & Safety', view: 'TRUST_SAFETY', icon: ShieldCheck, activeMatch: ['TRUST_SAFETY'] },
    { label: 'Services & Plans', view: 'PREMIUM_SERVICES', icon: Briefcase, activeMatch: ['PREMIUM_SERVICES', 'PREMIUM_MEMBERSHIP'] },
    { label: 'Negotiation Room', view: 'NEGOTIATION_ROOM', icon: MessageSquare, activeMatch: ['NEGOTIATION_ROOM'] },
    { label: 'Post Sell Offer', view: 'POST_SELL_OFFER', icon: PackagePlus, activeMatch: ['POST_SELL_OFFER'] },
    { label: 'About Us', view: 'ABOUT_US', icon: Info, activeMatch: ['ABOUT_US'] },
    { label: 'Work With Us', view: 'ONBOARD_WITH_US', icon: UserPlus, activeMatch: ['ONBOARD_WITH_US'] }
  ];

  const visibleMenuOptions = accountMenuOptions.filter(item => {
    if (item.view === 'PRODUCT_IMAGE_ADMIN' && !isAdmin) return false;
    if (item.authOnly && !currentUser) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Persistent Top Admin Real-Time Change & Upload Bar on Every Page (Admin Only) */}
      {isAdmin && (
        <div
          id="top-admin-realtime-edit-bar"
          className="w-full bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 text-white border-b border-blue-800/60 px-2.5 sm:px-4 lg:px-6 py-1.5"
        >
          <div className="w-full px-2.5 sm:px-4 lg:px-6 xl:px-8 flex flex-wrap items-center justify-between gap-2">
            {/* Left: Admin Bar Identity & Real-Time Live Edit Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-600/30 border border-blue-400/40 text-[10px] font-black uppercase tracking-wider text-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Admin Live Bar</span>
              </span>

              <button
                type="button"
                onClick={handleToggleTopBarRealtimeEdit}
                data-testid="top-admin-enable-realtime-change-btn"
                className={`px-3 py-1 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                  isLiveEditMode
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 ring-2 ring-emerald-400/40'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400'
                }`}
                title="Toggle Real-Time Change & Upload Buttons on Every Image and Text Across Every Page"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveEditMode ? 'bg-slate-950' : 'bg-emerald-300'
                  }`}
                />
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isLiveEditMode
                    ? 'Real-Time Change & Upload: ENABLED (ON)'
                    : 'Enable Real-Time Change & Upload'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAdmin) return;
                  setQuickUploadMessage('');
                  setShowAdminQuickUploadModal(true);
                }}
                data-testid="top-admin-quick-upload-btn"
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Upload & Replace Any Product or Page Image in Real Time with Before/After Comparison"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>Quick Upload &amp; Change Image (Before / After)</span>
              </button>
            </div>

            {/* Right: Product Image Studio & 1-Click Server/Incognito Sync */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {liveSyncBadgeText && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{liveSyncBadgeText}</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleTopBarSyncLiveNow}
                disabled={isSyncingLive}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 border border-emerald-400/50 transition-colors cursor-pointer"
                title="Force-sync all uploaded images and changes to server so Incognito mode shows them immediately"
              >
                <RefreshCw className={`w-3 h-3 shrink-0 ${isSyncingLive ? 'animate-spin' : ''}`} />
                <span>{isSyncingLive ? 'Syncing...' : 'Sync & Publish Live (Incognito)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAdmin) return;
                  handleNavClick('PRODUCT_IMAGE_ADMIN');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  activeView === 'PRODUCT_IMAGE_ADMIN'
                    ? 'bg-white text-slate-950 border-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>All Product Images Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2.5 min-w-0">
        {/* Zone 1: Brand Identity & Primary Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => handleNavClick('HOMEPAGE')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg cursor-pointer flex items-center shrink-0 group"
          >
            <TradeHeavenLogo size="sm" subtitle={false} />
          </button>

          {/* Primary Inline Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 h-14 sm:h-16 shrink-0">
            {primaryNavItems.map(item => {
              const isActive = item.activeMatch.includes(activeView);
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleNavClick(item.view)}
                  className={`relative h-full px-1.5 xl:px-2.5 text-xs font-semibold tracking-tight transition-colors flex items-center cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-1.5 xl:inset-x-2 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zone 2: Global Search Bar with Real-Time Category & Supplier Auto-Suggest Dropdown */}
        <div
          ref={searchWrapperRef}
          className="relative flex-1 min-w-[120px] sm:min-w-[160px] md:min-w-[190px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-1 sm:mx-2 lg:mx-2.5"
        >
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full min-w-0">
            <Search className="absolute left-2.5 sm:left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="header-global-search-input"
              type="text"
              value={searchTerm}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchFocused(true);
                setActiveSuggestIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products, suppliers, commodities..."
              className="w-full min-w-0 h-8 sm:h-9 pl-7 sm:pl-8 pr-7 sm:pr-8 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 text-[11px] sm:text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={searchFocused && searchTerm.trim().length > 0}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveSuggestIndex(-1);
                }}
                className="absolute right-2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {searchFocused && searchTerm.trim().length > 0 && (
            <SearchAutoSuggestDropdown
              query={searchTerm}
              suggestions={autoSuggestions}
              activeIndex={activeSuggestIndex}
              onSelectCategory={handleSelectSuggestedCategory}
              onSelectSupplier={handleSelectSuggestedSupplier}
              onSelectProduct={handleSelectSuggestedProduct}
              onViewAllResults={() => handleSearchSubmit()}
              className="fixed inset-x-2.5 top-14 sm:absolute sm:inset-x-auto sm:top-full sm:left-0 sm:right-0 sm:mt-1.5 w-full sm:min-w-[380px] lg:min-w-full z-50 shadow-2xl"
            />
          )}
        </div>

        {/* Zone 3: Wallet Balance, Primary CTA & Account Menu */}
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0 ml-auto">
          {/* Authenticated & Paid Registered Buyers/Suppliers Wallet Balance */}
          {isPaidAndRegisteredMember && currentUser && (
            <HeaderWalletBalance
              currentUser={currentUser}
              isActiveView={activeView === 'WALLET_TOPUP' || activeView === 'SUPPLIER_WITHDRAWAL' || activeView === 'MEDIATOR_ENGINE'}
              onOpenTopUp={handleOpenFundsTopUp}
              onOpenWithdrawalPage={() => handleNavClick('SUPPLIER_WITHDRAWAL')}
              onOpenLedger={() => handleNavClick('DASHBOARD')}
            />
          )}

          {/* Quick Access: SEO Health, Mail Open Rate & Renewal Insights (Admin Only) */}
          {isAdmin && (
            <div className="hidden lg:flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleNavClick('CLIENT_ADMIN', { tab: 'seo-health' })}
                className={`flex h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg font-bold text-xs items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap border ${
                  activeView === 'CLIENT_ADMIN' && new URLSearchParams(window.location.search).get('tab') === 'seo-health'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                }`}
                title="Monitor Global Organic Traffic & Keyword Visibility Map"
              >
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">SEO Health</span>
                <span className="xl:hidden">SEO</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('RENEWAL_INSIGHTS')}
                className={`flex h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg font-bold text-xs items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap border ${
                  activeView === 'RENEWAL_INSIGHTS' || activeView === 'RENEWAL_EMAIL_EDITOR'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
                title="Check Mail Open Rates, Click-Through Rates & Renewal Conversions"
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Mail Open Rate</span>
                <span className="xl:hidden">Mail Rate</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('MAIL_DELIVERY_HISTORY')}
                className={`flex h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg font-bold text-xs items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap border ${
                  activeView === 'MAIL_DELIVERY_HISTORY'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                }`}
                title="View full Mail Delivery History & Telemetry logs"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Mail History</span>
                <span className="xl:hidden">Mail Logs</span>
              </button>
            </div>
          )}

          {/* Primary Action: Post RFQ */}
          <button
            type="button"
            onClick={onOpenCreateRfq}
            className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Post RFQ</span>
            <span className="sm:hidden">RFQ</span>
          </button>

          {currentUser && (
            <NotificationBell onNavigate={handleNavClick} />
          )}

          {/* Account & Navigation Toggle Bar Dropdown */}
          <div className="relative shrink-0 z-50" ref={userMenuRef}>
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="h-8 sm:h-9 pl-1.5 sm:pl-2 pr-1.5 sm:pr-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 transition-colors text-left cursor-pointer shrink-0 shadow-2xs"
                  title="Open Toggle Bar & Account Menu"
                  data-testid="header-account-button"
                >
                  <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-slate-200 border border-slate-300/80 shrink-0 flex items-center justify-center">
                    <SafeImage
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      type="avatar"
                      disableLiveUpload={true}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col leading-none max-w-[100px] sm:max-w-[130px] shrink-0 text-left">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-900 truncate">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate uppercase tracking-wider">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-150 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Direct Logout Button (Hidden on smaller screens; available inside Account menu) */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden xl:flex h-8 sm:h-9 px-2 xl:px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
                  title="Sign Out / Logout"
                  data-testid="header-logout-button"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden 2xl:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Sign In with Corporate Email & OTP"
                  data-testid="header-signin-button"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Open Toggle Bar & Account Menu"
                  data-testid="header-account-button"
                >
                  <Menu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Menu &amp; Account</span>
                  <span className="sm:hidden">Menu</span>
                  <ChevronDown
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Account & Navigation Toggle Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[min(92vw,24rem)] max-h-[82vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-[100] text-slate-800">
                {/* User Identity or Sign In Header */}
                {currentUser ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {currentUser.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                sessionStorage.setItem('th_client_admin_active_tab', 'RBAC_USERS');
                                sessionStorage.setItem('th_open_add_user_modal', 'true');
                              } catch {}
                              handleNavClick('CLIENT_ADMIN', { tab: 'DATABASE' });
                              setTimeout(() => {
                                window.dispatchEvent(
                                  new CustomEvent('tradeheaven_admin_switch_tab', {
                                    detail: { tab: 'DATABASE' }
                                  })
                                );
                                window.dispatchEvent(new CustomEvent('tradeheaven_open_user_registration'));
                              }, 60);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap shadow-2xs"
                            title="Register & Add New Users"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>User Registration</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleNavClick('DASHBOARD')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Trade Heaven Account
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Sign in or register new user
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In</span>
                        </button>
                        {onOpenRegisterFree && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              onOpenRegisterFree();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>User Registration</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Marketplace & Directory Options (Strictly Visible After Login) */}
                {currentUser && (
                  <div className="pt-1 pb-1">
                    <div className="text-[11px] font-semibold text-slate-400 px-2 mb-1.5">
                      Toggle Menu · Marketplace &amp; Directories
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {visibleMenuOptions.map(item => {
                        const Icon = item.icon;
                        const isActive = item.activeMatch.includes(activeView);
                        return (
                          <button
                            key={item.view}
                            type="button"
                            onClick={() => {
                              if (item.view === 'MEDIATOR_ENGINE' || item.label.includes('Top-Up')) {
                                handleOpenFundsTopUp();
                              } else if (item.label.includes('Dashboard')) {
                                handleNavClick('DASHBOARD');
                              } else if (item.view === 'ONBOARD_WITH_US' && onOpenOnboardModal) {
                                setUserMenuOpen(false);
                                onOpenOnboardModal();
                              } else {
                                handleNavClick(item.view);
                              }
                            }}
                            className={`px-2.5 py-2 rounded-lg text-left text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onOpenContactModal) {
                            onOpenContactModal();
                          } else {
                            handleNavClick('CONTACT_US');
                          }
                        }}
                        className={`px-2.5 py-2 rounded-lg text-left text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                          activeView === 'CONTACT_US'
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">Contact Desk</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Utilities: Language, Currency & Share Page */}
                <div className="border-t border-slate-100 mt-2 pt-2.5 px-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <LanguageRegionSelector variant="compact" />
                    <select
                      aria-label="Select Currency"
                      value={selectedCurrency}
                      onChange={e => handleCurrencySelect(e.target.value as Currency)}
                      className="bg-slate-100 hover:bg-slate-200/70 rounded-md px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer tabular-nums"
                    >
                      {CURRENCY_OPTIONS.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.dispatchEvent(
                        new CustomEvent('tradeheaven_open_share', {
                          detail: {
                            type: 'PAGE',
                            view: activeView,
                            title: document.title
                          }
                        })
                      );
                    }}
                    className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Admin & Email Analytics Control Options (Strictly Admin Only) */}
                {isAdmin && (
                  <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">
                      Email Analytics &amp; Admin Controls
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAdmin) return;
                          try {
                            sessionStorage.setItem('th_client_admin_active_tab', 'RBAC_USERS');
                            sessionStorage.setItem('th_open_add_user_modal', 'true');
                          } catch {}
                          handleNavClick('CLIENT_ADMIN', { tab: 'DATABASE' });
                          setTimeout(() => {
                            window.dispatchEvent(
                              new CustomEvent('tradeheaven_admin_switch_tab', {
                                detail: { tab: 'DATABASE' }
                              })
                            );
                            window.dispatchEvent(new CustomEvent('tradeheaven_open_user_registration'));
                          }, 60);
                        }}
                        className="col-span-2 px-2.5 py-2 text-left text-xs font-bold bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-2 text-white border border-emerald-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-white shrink-0" />
                        <span className="truncate">User Registration (+ Add New User)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('CLIENT_ADMIN', { tab: 'seo-health' })}
                        className="px-2.5 py-2 text-left text-xs font-bold bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-2 text-blue-800 border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">SEO Health &amp; Map</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('RENEWAL_INSIGHTS')}
                        className="px-2.5 py-2 text-left text-xs font-bold bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-2 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Mail Open Rate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('RENEWAL_EMAIL_EDITOR')}
                        className="px-2.5 py-2 text-left text-xs font-bold bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-2 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Renewal HTML Editor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('PRODUCT_IMAGE_ADMIN')}
                        className="px-2.5 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">Product Images</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('CLIENT_ADMIN')}
                        className="px-2.5 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Admin Portal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('CMS_MANAGEMENT')}
                        className="px-2.5 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700 hover:text-amber-700 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">CMS Editor</span>
                      </button>

                      {onOpenDbModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenDbModal();
                          }}
                          className="px-2.5 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">DB &amp; Backups</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {currentUser && (
                  <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-2.5 py-2 text-left text-xs font-semibold hover:bg-rose-50 text-rose-600 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Scrollable Quick-Navigation Strip (< xl) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="xl:hidden border-t border-slate-200/70 bg-slate-50/90 px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
      >
        {[
          { label: 'Home', view: 'HOMEPAGE' as ActiveView, activeMatch: ['HOMEPAGE', 'MARKETPLACE_HOME', 'LANDING_PAGE'] as ActiveView[] },
          { label: 'Products', view: 'PRODUCT_DIRECTORY' as ActiveView, activeMatch: ['PRODUCT_DIRECTORY'] as ActiveView[] },
          { label: 'Suppliers', view: 'SUPPLIERS_DIRECTORY' as ActiveView, activeMatch: ['SUPPLIERS_DIRECTORY', 'VENDOR_PROFILE'] as ActiveView[] },
          { label: 'Buy Leads', view: 'BUY_LEADS' as ActiveView, activeMatch: ['BUY_LEADS', 'RFQ_HUB'] as ActiveView[] },
          ...(currentUser
            ? [{ label: 'Dashboard', view: 'DASHBOARD' as ActiveView, activeMatch: ['DASHBOARD'] as ActiveView[] }]
            : []),
          { label: 'Services', view: 'PREMIUM_SERVICES' as ActiveView, activeMatch: ['PREMIUM_SERVICES', 'PREMIUM_MEMBERSHIP'] as ActiveView[] },
        ].map((item) => {
          const isActive = item.activeMatch.includes(activeView);
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => handleNavClick(item.view)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Top Admin Bar Real-Time Quick Upload & Before/After Modal */}
      {showAdminQuickUploadModal && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdminQuickUploadModal(false);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-900">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Top Admin Bar · Real-Time Image Upload &amp; Before / After Controller</span>
                </div>
                <h3 className="text-sm sm:text-base font-black mt-0.5">
                  Upload &amp; Change Any Product or Page Image in Real Time (Incognito Ready)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminQuickUploadModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Target Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'PRODUCT', label: '1. Specific Product (Before / After)' },
                  { id: 'HERO', label: '2. Homepage Hero Banner Image' },
                  { id: 'GLOBAL_ALL', label: '3. Apply to All Listed Products' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setQuickUploadTargetType(tab.id as any);
                      setQuickUploadMessage('');
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-left transition-all cursor-pointer ${
                      quickUploadTargetType === tab.id
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Product Picker when PRODUCT target is active */}
              {quickUploadTargetType === 'PRODUCT' && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase">
                      Select Product to Change Image ({availableProductsList.length} Products)
                    </label>
                    <input
                      type="text"
                      value={quickProductFilter}
                      onChange={(e) => setQuickProductFilter(e.target.value)}
                      placeholder="Filter products by name or ID..."
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <select
                    value={selectedQuickProductId}
                    onChange={(e) => handleSelectQuickProduct(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {availableProductsList
                      .filter((p) => {
                        if (!quickProductFilter.trim()) return true;
                        const q = quickProductFilter.toLowerCase();
                        return (
                          (p.title || '').toLowerCase().includes(q) ||
                          (p.id || '').toLowerCase().includes(q) ||
                          (p.category || '').toLowerCase().includes(q)
                        );
                      })
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.id}] {p.title} ({p.category})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* BEFORE & AFTER SIDE-BY-SIDE COMPARISON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      BEFORE (Previous Image)
                    </span>
                  </div>
                  <div className="h-44 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                    {quickBeforeUrl ? (
                      <img
                        src={quickBeforeUrl}
                        alt="Before product upload"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No previous image</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      AFTER (Live Uploaded Image)
                    </span>
                    {quickAfterUrl && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Live &amp; Incognito Synced</span>
                      </span>
                    )}
                  </div>
                  <div className="h-44 rounded-xl overflow-hidden bg-white border-2 border-emerald-500 flex items-center justify-center">
                    {quickAfterUrl ? (
                      <img
                        src={quickAfterUrl}
                        alt="After product upload"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Upload an image below</span>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload Dropzone */}
              <label className="border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <Upload className="w-7 h-7 text-blue-600 mb-1.5" />
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {isQuickUploading
                    ? 'Uploading & Publishing Live to Server...'
                    : 'Click to Upload New Image File from Computer (Real-Time)'}
                </span>
                <span className="text-[11px] text-slate-600 mt-0.5">
                  Supports JPG, PNG, WEBP, AVIF, GIF, SVG · Saves to server disk &amp; updates Incognito immediately
                </span>
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg"
                  className="hidden"
                  disabled={isQuickUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleTopBarQuickFileUpload(file);
                    e.target.value = '';
                  }}
                />
              </label>

              {quickUploadMessage && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{quickUploadMessage}</span>
                </div>
              )}

              {/* Direct URL Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Or Paste Direct Image URL / Local Asset Path
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickDirectUrl}
                    onChange={(e) => setQuickDirectUrl(e.target.value)}
                    placeholder="/assets/uploads/... or https://..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    disabled={isQuickUploading}
                    onClick={() => handleTopBarApplyDirectUrl(quickDirectUrl)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Apply Now
                  </button>
                </div>
              </div>

              {/* Server Media Library Picker */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Or Select Any Uploaded Image from Server Media Library
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {productImageManagerService.getState().mediaLibrary.slice(0, 21).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTopBarApplyDirectUrl(item.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        quickAfterUrl === item.url
                          ? 'border-emerald-600 ring-2 ring-emerald-400/40'
                          : 'border-slate-200 hover:border-blue-500'
                      }`}
                      title={item.name}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdminQuickUploadModal(false);
                  handleNavClick('PRODUCT_IMAGE_ADMIN');
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Full Product Image Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAdminQuickUploadModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

