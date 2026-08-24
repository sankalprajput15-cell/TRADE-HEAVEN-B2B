import React, { useState, useEffect } from 'react';
import { Currency, UserRole, ActiveView, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { TradeHeavenLogo } from '../common/TradeHeavenLogo';
import { SafeImage } from '../common/SafeImage';
import { SOCIAL_LINKS, OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { useSiteContent } from '../../context/SiteContentContext';
import { 
  Globe2, 
  ShieldCheck, 
  MessageSquare, 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  PlusCircle, 
  Search, 
  ShoppingBag, 
  Building2, 
  Lock, 
  Workflow, 
  Menu, 
  X, 
  PackagePlus, 
  Factory, 
  ChevronDown, 
  Crown, 
  Landmark, 
  Database,
  LogIn,
  LogOut,
  UserCheck,
  User,
  Sparkles,
  ShieldAlert,
  Sliders,
  SlidersHorizontal,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  Mail
} from 'lucide-react';

interface Props {
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  onNavigate?: (view: ActiveView) => void;
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
}

export const Header: React.FC<Props> = ({
  activeView,
  setActiveView,
  onNavigate,
  selectedCurrency,
  setSelectedCurrency,
  onCurrencyChange,
  currentUser,
  currentUserRole = currentUser?.role || 'BUYER',
  setCurrentUserRole,
  onOpenCreateRfq = () => {},
  onOpenBackendManager,
  onOpenDbModal,
  onOpenAuthModal,
  onOpenRegisterFree,
  onOpenOnboardModal,
  onOpenContactModal,
  onLogout = () => {},
  unreadMessagesCount = 2
}) => {
  const { setCurrentUser, isUserAuthorized } = useSiteContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const auth = isUserAuthorized(currentUser);
  const isAdmin = currentUser?.role === 'ADMIN' || 
    auth.isSuperAdmin || 
    currentUser?.email?.toLowerCase() === 'yr943334@gmail.com' || 
    currentUser?.email?.toLowerCase() === 'admin@tradeheaven.net';

  // Automatically close open dropdown menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#nav-link-admin-dropdown') && !target.closest('#nav-link-services-dropdown')) {
        setServicesMenuOpen(false);
        setAdminMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesMenuOpen(false);
        setAdminMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('th_session_jwt_token');
    } catch {}
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    if (onLogout) {
      onLogout();
    }
  };

  const navigate = (view: ActiveView) => {
    if (onNavigate) onNavigate(view);
    else if (setActiveView) setActiveView(view);
  };

  const handleNavClick = (view: ActiveView) => {
    navigate(view);
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
    setAdminMenuOpen(false);
  };

  const isServicesActive = [
    'POST_SELL_OFFER',
    'PREMIUM_SERVICES',
    'PREMIUM_MEMBERSHIP',
    'TRADE_TOOLS',
    'INCOTERMS_CALCULATOR',
    'REFUND_POLICY',
    'ARCHITECTURE_BLUEPRINT'
  ].includes(activeView);

  const isAdminActive = [
    'CLIENT_ADMIN',
    'CMS_MANAGEMENT'
  ].includes(activeView);

  const roleStyles: Record<UserRole, { badge: string; label: string }> = {
    BUYER: { badge: 'bg-blue-900/60 text-blue-300 border-blue-700/60', label: 'Buyer' },
    SUPPLIER: { badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60', label: 'Supplier' },
    VERIFIER: { badge: 'bg-purple-900/60 text-purple-300 border-purple-700/60', label: 'Verifier' },
    ADMIN: { badge: 'bg-amber-900/80 text-amber-300 border-amber-500/80 font-black', label: 'Admin' }
  };

  return (
    <header id="trade-heaven-header" className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs w-full">
      {/* 1. TOP UTILITY BAR (Fixed, Zero Scroll, High-Contrast Precision) */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-1.5 text-xs w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 w-full">
          
          {/* Left: Security & Direct Assistance */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">100% Escrow &amp; Trade Assurance</span>
              <span className="sm:hidden">Escrow Protected</span>
            </span>

            <span className="hidden md:inline-block text-slate-700">|</span>

            {/* Direct Official WhatsApp Desk Link */}
            <a
              id="top-bar-whatsapp-btn"
              href={OFFICIAL_WHATSAPP_DATA.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`WhatsApp Trade Desk (${OFFICIAL_WHATSAPP_DATA.phone})`}
              aria-label={`WhatsApp Trade Desk ${OFFICIAL_WHATSAPP_DATA.phone}`}
              className="hidden sm:flex items-center gap-1 bg-[#25D366]/15 hover:bg-[#25D366] text-emerald-300 hover:text-white px-2 py-0.5 rounded-md border border-[#25D366]/30 transition-all text-[11px] font-medium group cursor-pointer"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366] group-hover:text-white shrink-0" />
              <span>WhatsApp Desk</span>
            </a>

            <span className="hidden lg:inline-block text-slate-700">|</span>

            {/* Quick Email link */}
            <button
              onClick={() => handleNavClick('CONTACT_US')}
              className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Mail className="w-3 h-3 text-blue-400 shrink-0" />
              <span>help@tradeheaven.net</span>
            </button>
          </div>

          {/* Right: FX Selector + Mode Switcher + Authentication State */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Currency FX Selector */}
            <div className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-700/80 shadow-2xs transition-colors">
              <span className="text-[9px] text-amber-400 font-bold uppercase">FX</span>
              <select
                id="currency-selector"
                value={selectedCurrency}
                onChange={e => {
                  const val = e.target.value as Currency;
                  if (onCurrencyChange) onCurrencyChange(val);
                  else if (setSelectedCurrency) setSelectedCurrency(val);
                }}
                className="bg-transparent text-[11px] text-slate-200 font-bold font-mono focus:outline-none cursor-pointer pr-1"
              >
                {CURRENCY_RATES.map(c => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* AUTHENTICATION CONTROL SECTION */}
            {currentUser ? (
              // LOGGED IN SESSION
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="header-user-profile-btn"
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 transition-all text-left group cursor-pointer"
                  title="Account Profile & Credentials"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-white/20 bg-slate-700 shrink-0">
                    <SafeImage src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 max-w-[90px] sm:max-w-[140px] truncate">
                    <span className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded border ${roleStyles[currentUser.role]?.badge || 'bg-slate-800 text-white'}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                {/* Sign Out Button */}
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 px-2 py-0.5 sm:py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              // LOGGED OUT STATE: SIGN IN + REGISTER FREE
              <div className="flex items-center gap-1.5">
                <button
                  id="header-login-btn"
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer border border-slate-700/80"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-300" />
                  <span>Sign In</span>
                </button>
                <button
                  id="header-register-free-btn"
                  onClick={onOpenRegisterFree || onOpenAuthModal}
                  className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Register Free</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR (Proportional, Clean Hierarchy, No Multi-line Wrapping) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 w-full">
        <div className="flex items-center justify-between gap-2 lg:gap-4 w-full">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-logo-home-btn"
              onClick={() => handleNavClick('HOMEPAGE')}
              className="text-left focus:outline-none cursor-pointer"
            >
              <TradeHeavenLogo size="md" subtitle="Global B2B Marketplace &amp; Escrow Rail" />
            </button>
          </div>

          {/* Center: Desktop Nav Links (Streamlined & Grouped) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            <button
              id="nav-link-homepage"
              onClick={() => handleNavClick('HOMEPAGE')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'HOMEPAGE' || activeView === 'MARKETPLACE_HOME'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              id="nav-link-products"
              onClick={() => handleNavClick('PRODUCT_DIRECTORY')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'PRODUCT_DIRECTORY'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Products
            </button>

            <button
              id="nav-link-suppliers"
              onClick={() => handleNavClick('SUPPLIERS_DIRECTORY')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'SUPPLIERS_DIRECTORY'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Suppliers
            </button>

            {/* Direct Vendor Profile Demo */}
            <button
              id="nav-link-vendor-profile"
              onClick={() => handleNavClick('VENDOR_PROFILE')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'VENDOR_PROFILE'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100 hover:text-blue-900 border border-blue-200/60'
              }`}
              title="View full verified vendor profile with 16:9 banner, ISO certs, factory tour and RFQ form"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendor Profile</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                Demo
              </span>
            </button>

            <button
              id="nav-link-rfqs"
              onClick={() => handleNavClick('RFQ_HUB')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'RFQ_HUB'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              RFQs
            </button>

            <button
              id="nav-link-buy-leads"
              onClick={() => handleNavClick('BUY_LEADS')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'BUY_LEADS'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Buy Leads
            </button>

            {/* Onboard / Partner Badge */}
            <button
              id="nav-link-onboard"
              onClick={() => handleNavClick('ONBOARD_WITH_US')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'ONBOARD_WITH_US'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Work With Us</span>
            </button>

            {/* Dropdown: Trade Services & Tools */}
            <div className="relative shrink-0">
              <button
                id="nav-link-services-dropdown"
                onClick={() => {
                  setServicesMenuOpen(!servicesMenuOpen);
                  setAdminMenuOpen(false);
                }}
                className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  isServicesActive
                    ? 'bg-blue-50 text-blue-600 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Services &amp; Tools</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>

              {servicesMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleNavClick('POST_SELL_OFFER')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <PackagePlus className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Post Product / Sell Offer</div>
                      <div className="text-[10px] text-slate-400 font-normal">Direct Factory Listing</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('PREMIUM_SERVICES')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-amber-500" />
                    <div>
                      <div>Gold Supplier Upgrades</div>
                      <div className="text-[10px] text-slate-400 font-normal">Membership &amp; Credit Packs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('TRADE_TOOLS')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-blue-500" />
                    <div>
                      <div>Trade Calculators &amp; Incoterms</div>
                      <div className="text-[10px] text-slate-400 font-normal">Landed Cost &amp; CIF/FOB Rules</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('REFUND_POLICY')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-t border-slate-100 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div>Return &amp; Refund Policy</div>
                      <div className="text-[10px] text-slate-400 font-normal">30-Day Escrow Terms &amp; Compliance</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Contact Us */}
            <button
              id="nav-link-contact"
              onClick={() => handleNavClick('CONTACT_US')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'CONTACT_US'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Contact</span>
            </button>

            {/* Admin Management Dropdown (Visible for Admins / Authenticated Staff) */}
            {isAdmin ? (
              <div className="relative shrink-0">
                <button
                  id="nav-link-admin-dropdown"
                  onClick={() => {
                    setAdminMenuOpen(!adminMenuOpen);
                    setServicesMenuOpen(false);
                  }}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isAdminActive
                      ? 'bg-amber-100 text-amber-950 font-extrabold border border-amber-300'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Admin Hub</span>
                  <ChevronDown className="w-3 h-3 shrink-0" />
                </button>

                {adminMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => handleNavClick('CLIENT_ADMIN')}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 text-slate-800 border-b border-slate-100 cursor-pointer"
                    >
                      <Landmark className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-amber-900 font-bold">Admin &amp; Treasury Portal</div>
                        <div className="text-[10px] text-slate-500 font-normal">Escrow releases &amp; user control</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavClick('CMS_MANAGEMENT')}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 text-slate-800 border-b border-slate-100 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-amber-900 font-bold">Full Site CMS Editor</div>
                        <div className="text-[10px] text-slate-500 font-normal">Edit copy, hero banners, &amp; sections</div>
                      </div>
                    </button>
                    {onOpenBackendManager && (
                      <button
                        onClick={() => {
                          setAdminMenuOpen(false);
                          onOpenBackendManager();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-amber-600" />
                        <div>
                          <div className="text-amber-900 font-bold">Database Management</div>
                          <div className="text-[10px] text-slate-500 font-normal">Live mock products &amp; API state</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </nav>

          {/* Right: Key Direct Action Cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Post RFQ Button */}
            <button
              id="header-post-rfq-btn"
              onClick={onOpenCreateRfq}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 sm:px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Post Buy RFQ</span>
              <span className="sm:hidden">RFQ</span>
            </button>

            {/* Messages / Negotiation Room */}
            <button
              id="header-negotiation-btn"
              onClick={() => handleNavClick('NEGOTIATION_ROOM')}
              className={`p-2 rounded-xl border relative transition-all shrink-0 cursor-pointer ${
                activeView === 'NEGOTIATION_ROOM'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Negotiation Room &amp; Inquiries"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Dashboard Link */}
            <button
              id="header-dashboard-btn"
              onClick={() => handleNavClick('DASHBOARD')}
              className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                activeView === 'DASHBOARD'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Trade Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              id="header-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* User Status Bar */}
          <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200">
                  <SafeImage src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{currentUser.role}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">Not signed in</div>
            )}
            {currentUser ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenAuthModal();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    if (onOpenRegisterFree) onOpenRegisterFree();
                    else onOpenAuthModal();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer"
                >
                  Register Free
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('HOMEPAGE')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Home Marketplace
            </button>
            <button
              onClick={() => handleNavClick('ONBOARD_WITH_US')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-between cursor-pointer"
            >
              <span>Work With Us</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              onClick={() => handleNavClick('PRODUCT_DIRECTORY')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Find Products
            </button>
            <button
              onClick={() => handleNavClick('SUPPLIERS_DIRECTORY')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Verified Suppliers
            </button>
            <button
              onClick={() => handleNavClick('VENDOR_PROFILE')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-between cursor-pointer"
            >
              <span>Vendor Profile (Demo)</span>
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              onClick={() => handleNavClick('RFQ_HUB')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              RFQ Hub
            </button>
            <button
              onClick={() => handleNavClick('BUY_LEADS')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Buy Leads Feed
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNavClick('CLIENT_ADMIN')}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-between cursor-pointer"
              >
                <span>Admin Suite</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('CMS_MANAGEMENT')}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200 flex items-center justify-between cursor-pointer"
              >
                <span>Edit Site CMS</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}
            <button
              onClick={() => handleNavClick('PREMIUM_SERVICES')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Gold Membership
            </button>
            <button
              onClick={() => handleNavClick('TRADE_TOOLS')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Trade Tools
            </button>
            <button
              onClick={() => handleNavClick('POST_SELL_OFFER')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Post Sell Offer
            </button>
            <button
              onClick={() => handleNavClick('REFUND_POLICY')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              Refund Policy
            </button>
            <button
              onClick={() => handleNavClick('CONTACT_US')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-between col-span-2 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Contact Help Desk</span>
              </div>
              <span className="text-[10px] font-mono text-blue-600">help@tradeheaven.net</span>
            </button>
          </div>

          <button
            onClick={() => {
              onOpenCreateRfq();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Buy RFQ</span>
          </button>
        </div>
      )}
    </header>
  );
};
