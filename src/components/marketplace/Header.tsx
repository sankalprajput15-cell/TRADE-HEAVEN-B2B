import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Currency, UserRole, ActiveView, AuthUser, Product } from '../../types';
import { TradeHeavenLogo } from '../common/TradeHeavenLogo';
import { NotificationBell } from './NotificationBell';
import { SafeImage } from '../common/SafeImage';
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
  Menu,
  X,
  Database,
  ArrowUpRight
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
  onLogout,
  products = [],
  onSelectProduct,
  onNavigateToSearch
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

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
    setMobileMenuOpen(false);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    setSearchFocused(false);
    setMobileMenuOpen(false);
    if (onNavigateToSearch) {
      onNavigateToSearch(trimmed);
    } else {
      handleNavClick('PRODUCT_DIRECTORY', { search: trimmed });
    }
  };

  const matchingSuggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return products
      .filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [products, searchTerm]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (onLogout) onLogout();
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUserRole === 'ADMIN';

  const navItems: { label: string; view: ActiveView; activeMatch: ActiveView[] }[] = [
    { label: 'Home', view: 'HOMEPAGE', activeMatch: ['HOMEPAGE', 'MARKETPLACE_HOME'] },
    { label: 'Products', view: 'PRODUCT_DIRECTORY', activeMatch: ['PRODUCT_DIRECTORY'] },
    { label: 'Suppliers', view: 'SUPPLIERS_DIRECTORY', activeMatch: ['SUPPLIERS_DIRECTORY'] },
    { label: 'Buy Leads', view: 'BUY_LEADS', activeMatch: ['BUY_LEADS', 'RFQ_HUB'] },
    { label: 'Services', view: 'PREMIUM_SERVICES', activeMatch: ['PREMIUM_SERVICES', 'PREMIUM_MEMBERSHIP'] }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-16 flex items-center justify-between gap-3 lg:gap-6">
        {/* Left: Brand Identity & Primary Navigation */}
        <div className="flex items-center gap-5 lg:gap-8 min-w-0">
          <button
            type="button"
            onClick={() => handleNavClick('HOMEPAGE')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg cursor-pointer flex items-center shrink-0 group"
          >
            <TradeHeavenLogo size="sm" subtitle="Global B2B Marketplace" />
          </button>

          {/* Desktop Editorial Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 h-16">
            {navItems.map(item => {
              const isActive = item.activeMatch.includes(activeView);
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleNavClick(item.view)}
                  className={`relative h-full px-3 text-[13px] font-semibold tracking-tight transition-colors flex items-center cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavClick('PRODUCT_IMAGE_ADMIN')}
                className={`relative h-full px-3 text-[13px] font-semibold tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeView === 'PRODUCT_IMAGE_ADMIN'
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Product Images</span>
                {activeView === 'PRODUCT_IMAGE_ADMIN' && (
                  <span className="absolute bottom-0 inset-x-3 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Center: Global Product & Supplier Search Bar */}
        <div ref={searchWrapperRef} className="hidden md:block relative flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setSearchFocused(true)}
              onChange={e => {
                setSearchTerm(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search products, HS codes, or verified suppliers..."
              className="w-full h-9 pl-9 pr-16 rounded-lg bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-blue-600 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-12 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Find
            </button>
          </form>

          {/* Instant Search Autocomplete Dropdown */}
          {searchFocused && matchingSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 divide-y divide-slate-100">
              {matchingSuggestions.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    setSearchFocused(false);
                    if (onSelectProduct) {
                      onSelectProduct(prod);
                    } else {
                      handleNavClick('PRODUCT_DIRECTORY', { productId: prod.id });
                    }
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <SafeImage
                        src={prod.images?.[0]}
                        alt={prod.title}
                        productId={prod.id}
                        productTitle={prod.title}
                        category={prod.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {prod.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {prod.category} · <span className="font-mono">{prod.id}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Currency, Notifications, Primary CTA & User Account */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Currency Selector */}
          <div className="hidden sm:flex items-center h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition-colors">
            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
            <select
              aria-label="Select Currency"
              value={selectedCurrency}
              onChange={e => handleCurrencySelect(e.target.value as Currency)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              {CURRENCY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <NotificationBell onNavigate={handleNavClick} />

          {/* Primary Action: Post RFQ */}
          <button
            type="button"
            onClick={onOpenCreateRfq}
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Post RFQ</span>
          </button>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200 mx-0.5" />

          {/* User Profile or Auth Controls */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="h-9 pl-2 pr-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 border border-slate-300/80 shrink-0">
                  <SafeImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden xl:block leading-none max-w-[110px]">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-150 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 text-slate-800">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {currentUser.email}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {currentUser.companyName || 'Verified Account'} · {currentUser.role}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleNavClick(
                        currentUser.role === 'SUPPLIER' ? 'VENDOR_PROFILE' : 'BUYER_PROFILE'
                      );
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    <span>Account Dashboard</span>
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('PRODUCT_IMAGE_ADMIN');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Product Image System</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('CLIENT_ADMIN');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Admin Control Center</span>
                      </button>

                      {onOpenDbModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenDbModal();
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                        >
                          <Database className="w-4 h-4 text-slate-500" />
                          <span>Database &amp; Backups</span>
                        </button>
                      )}
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-rose-50 text-rose-600 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="h-9 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>
              {onOpenRegisterFree && (
                <button
                  type="button"
                  onClick={onOpenRegisterFree}
                  className="hidden sm:flex h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Free</span>
                </button>
              )}
            </div>
          )}

          {/* Mobile Navigation Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3 shadow-md">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products, categories, or suppliers..."
              className="w-full h-9 pl-9 pr-16 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-semibold cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {navItems.map(item => {
              const isActive = item.activeMatch.includes(activeView);
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleNavClick(item.view)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavClick('PRODUCT_IMAGE_ADMIN')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'PRODUCT_IMAGE_ADMIN'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Product Images</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
