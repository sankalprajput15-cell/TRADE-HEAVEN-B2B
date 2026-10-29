import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Currency, UserRole, ActiveView, AuthUser, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
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
  Wallet
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
  const { setCurrentUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSuggestIndex, setActiveSuggestIndex] = useState(-1);

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
    if (!currentUser) {
      if (onOpenRegisterFree) {
        onOpenRegisterFree();
      } else {
        onOpenAuthModal();
      }
      return;
    }
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
    if (!currentUser) {
      if (onOpenRegisterFree) onOpenRegisterFree();
      else onOpenAuthModal();
      return;
    }
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
    if (!currentUser) {
      if (onOpenRegisterFree) onOpenRegisterFree();
      else onOpenAuthModal();
      return;
    }
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
    if (!currentUser) {
      if (onOpenRegisterFree) onOpenRegisterFree();
      else onOpenAuthModal();
      return;
    }
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
    if (!currentUser) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setSearchFocused(false);
        if (onOpenRegisterFree) onOpenRegisterFree();
        else onOpenAuthModal();
      }
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

  const handleQuickDemoSession = (role: 'BUYER' | 'SUPPLIER') => {
    const demoUser: AuthUser =
      role === 'BUYER'
        ? {
            id: 'buyer-titan-01',
            name: 'Vikram Singhania',
            email: 'procurement@titanindustrial.in',
            role: 'BUYER',
            companyName: 'Titan Global Imports Pvt Ltd',
            country: 'India',
            isVerified: true,
            isPremium: true,
            membershipStatus: 'paid',
            status: 'ACTIVE'
          }
        : {
            id: 'comp-melissa-mpcommodity',
            name: 'Rajesh Sharma',
            email: 'exports@mpcommodity.in',
            role: 'SUPPLIER',
            companyName: 'Melissa MP Commodity Exports',
            country: 'India',
            isVerified: true,
            isPremium: true,
            membershipStatus: 'paid',
            status: 'ACTIVE'
          };

    setCurrentUser(demoUser);
    try {
      localStorage.setItem('th_session_user', JSON.stringify(demoUser));
    } catch {}
    setUserMenuOpen(false);

    if (role === 'BUYER') {
      handleNavClick('WALLET_TOPUP');
    } else {
      handleNavClick('DASHBOARD');
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('tradeheaven_open_dashboard_tab', {
            detail: { tab: 'TRANSACTION_LEDGER' }
          })
        );
      }, 50);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUserRole === 'ADMIN';

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
    { label: 'Trade Assurance Certificate', view: 'TRADE_ASSURANCE_CERTIFICATE', activeMatch: ['TRADE_ASSURANCE_CERTIFICATE'] },
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
    { label: 'Trade Assurance Certificate', view: 'TRADE_ASSURANCE_CERTIFICATE', icon: ShieldCheck, activeMatch: ['TRADE_ASSURANCE_CERTIFICATE'] },
    { label: 'Dashboard & Ledger', view: 'DASHBOARD', icon: LayoutDashboard, activeMatch: ['DASHBOARD'] },
    { label: 'Wallet Funds Top-Up', view: 'WALLET_TOPUP', icon: Wallet, activeMatch: ['WALLET_TOPUP', 'MEDIATOR_ENGINE', 'DASHBOARD'] },
    { label: 'Direct Transfer & Mediation Guide', view: 'DIRECT_TRANSFER_GUIDE', icon: ShieldCheck, activeMatch: ['DIRECT_TRANSFER_GUIDE'] },
    { label: 'Products Catalog', view: 'PRODUCT_DIRECTORY', icon: Package, activeMatch: ['PRODUCT_DIRECTORY'] },
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

  const visibleMenuOptions = accountMenuOptions.filter(item => !item.authOnly || Boolean(currentUser));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-[1440px] mx-auto w-full px-2.5 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand Identity & Primary Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('HOMEPAGE')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg cursor-pointer flex items-center shrink-0 group"
          >
            <TradeHeavenLogo size="sm" subtitle={false} />
          </button>

          {/* Primary Inline Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden xl:flex items-center gap-1.5 h-16 shrink-0">
            {primaryNavItems.map(item => {
              const isActive = item.activeMatch.includes(activeView);
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleNavClick(item.view)}
                  className={`relative h-full px-2.5 text-xs font-semibold tracking-tight transition-colors flex items-center cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zone 2: Global Search Bar with Real-Time Category & Supplier Auto-Suggest Dropdown */}
        <div ref={searchWrapperRef} className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md mx-1 sm:mx-2 min-w-[130px]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
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
              placeholder="Search categories, suppliers, products..."
              className="w-full h-8 sm:h-9 pl-8 pr-7 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
              className="absolute top-full left-0 right-0 mt-1.5 min-w-[290px] sm:min-w-[380px]"
            />
          )}
        </div>

        {/* Zone 3: Wallet Balance, Primary CTA & Account Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Authenticated & Paid Registered Buyers/Suppliers Wallet Balance */}
          {isPaidAndRegisteredMember && currentUser && (
            <HeaderWalletBalance
              currentUser={currentUser}
              isActiveView={activeView === 'WALLET_TOPUP' || activeView === 'MEDIATOR_ENGINE'}
              onOpenTopUp={handleOpenFundsTopUp}
              onOpenLedger={() => handleNavClick('DASHBOARD')}
            />
          )}

          {/* Primary Action: Post RFQ */}
          <button
            type="button"
            onClick={onOpenCreateRfq}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Post RFQ</span>
            <span className="sm:hidden">RFQ</span>
          </button>

          <NotificationBell onNavigate={handleNavClick} />

          {/* Account Toggle Dropdown */}
          <div className="relative shrink-0" ref={userMenuRef}>
            {currentUser ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="h-8 sm:h-9 pl-1.5 sm:pl-2 pr-2 sm:pr-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 sm:gap-2 transition-colors text-left cursor-pointer shrink-0"
                  title="Open Account Menu"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-slate-200 border border-slate-300/80 shrink-0">
                    <SafeImage
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden lg:block leading-none max-w-[96px]">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0 transition-transform duration-150 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Direct Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
                  title="Sign Out / Logout"
                  data-testid="header-logout-button"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="hidden sm:inline">Account</span>
                <ChevronDown
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}

            {/* Account Toggle Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.25rem)] sm:w-96 max-w-sm max-h-[82vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-slate-800">
                {/* User Identity or Sign In Header */}
                {currentUser ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {currentUser.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavClick('DASHBOARD')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Trade Heaven Account
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Sign in to view RFQs
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
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            Join Free
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Marketplace & Directory Options (Registered Users Only) */}
                {currentUser && (
                  <div className="pt-1 pb-1">
                    <div className="text-[11px] font-semibold text-slate-400 px-2 mb-1.5">
                      Marketplace &amp; Directories
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

                {/* Admin Control Options */}
                {isAdmin && (
                  <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">
                      Admin Controls
                    </div>
                    <div className="grid grid-cols-2 gap-1">
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
    </header>
  );
};

