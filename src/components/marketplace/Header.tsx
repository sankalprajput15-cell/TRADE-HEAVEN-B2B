import React, { useState } from 'react';
import { Currency, UserRole, ActiveView, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { TradeHeavenLogo } from '../common/TradeHeavenLogo';
import { SafeImage } from '../common/SafeImage';
import { QuickControlsModal } from '../modals/QuickControlsModal';
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
  const { setCurrentUser } = useSiteContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [isQuickControlsOpen, setIsQuickControlsOpen] = useState(false);

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

  const changeCurrency = (curr: Currency) => {
    if (onCurrencyChange) onCurrencyChange(curr);
    else if (setSelectedCurrency) setSelectedCurrency(curr);
  };

  const openBackend = () => {
    if (onOpenDbModal) onOpenDbModal();
    else if (onOpenBackendManager) onOpenBackendManager();
  };

  const handleNavClick = (view: ActiveView) => {
    navigate(view);
    setMobileMenuOpen(false);
    setMoreToolsOpen(false);
  };

  const isSecondaryActive = [
    'POST_SELL_OFFER',
    'PREMIUM_SERVICES',
    'TRADE_TOOLS',
    'CLIENT_ADMIN',
    'DASHBOARD',
    'ARCHITECTURE_BLUEPRINT'
  ].includes(activeView);

  const roleStyles: Record<UserRole, { badge: string; label: string; dot: string }> = {
    BUYER: { badge: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Buyer', dot: 'bg-blue-500' },
    SUPPLIER: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Supplier', dot: 'bg-emerald-500' },
    VERIFIER: { badge: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Verifier', dot: 'bg-purple-500' },
    ADMIN: { badge: 'bg-amber-100 text-amber-900 border-amber-300 font-black', label: 'Admin', dot: 'bg-amber-500' }
  };

  return (
    <header id="trade-heaven-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm w-full">
      {/* Top Utility Bar: Global Trade, Quick Controls Button, Social Tags & Authentication */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 px-3 sm:px-4 lg:px-8 py-1.5 text-xs overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          
          {/* Left: Trust & Escrow Guarantee + Quick Social Tags + WhatsApp Direct */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">100% Escrow &amp; Trade Assurance Protected</span>
              <span className="md:hidden">Escrow Protected</span>
            </span>
            <span className="hidden sm:inline-block text-slate-700">|</span>

            {/* Direct Official WhatsApp Desk Link */}
            <a
              id="top-bar-whatsapp-btn"
              href={OFFICIAL_WHATSAPP_DATA.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`WhatsApp Trade Desk (${OFFICIAL_WHATSAPP_DATA.phone})`}
              aria-label={`WhatsApp Trade Desk ${OFFICIAL_WHATSAPP_DATA.phone}`}
              className="flex items-center justify-center bg-[#25D366]/20 hover:bg-[#25D366] text-emerald-300 hover:text-white p-1.5 rounded-lg border border-[#25D366]/40 transition-all shadow-2xs group cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white shrink-0" />
            </a>

            <span className="hidden xl:inline-block text-slate-700">|</span>

            {/* Social Tags In Utility Bar */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Official Channels:</span>
              <div className="flex items-center gap-1">
                {SOCIAL_LINKS.map(s => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${s.name}: ${s.handle}`}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Workspace Switcher + FX Selector + Authentication State */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Workspace & Role Mode Switcher */}
            <button
              id="top-quick-controls-btn"
              onClick={() => setIsQuickControlsOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border border-slate-700 cursor-pointer"
              title="Workspace Mode & Trading Preferences"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace View</span>
            </button>

            {/* Currency FX Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-700 shadow-2xs">
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase">FX</span>
              <select
                id="currency-selector"
                value={selectedCurrency}
                onChange={e => setSelectedCurrency(e.target.value as Currency)}
                className="bg-transparent text-[11px] sm:text-xs text-slate-200 font-bold font-mono focus:outline-none cursor-pointer"
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
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg px-2 sm:px-2.5 py-1 transition-all text-left group cursor-pointer"
                  title="Account Profile & Credentials"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-slate-700 shrink-0">
                    <SafeImage src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 max-w-[110px] sm:max-w-[160px] truncate">
                    <span className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${roleStyles[currentUser.role]?.badge || 'bg-slate-700 text-white'}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                {/* Sign Out Button */}
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer"
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
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer border border-white/20"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-300" />
                  <span>Sign In</span>
                </button>
                <button
                  id="header-register-free-btn"
                  onClick={onOpenRegisterFree || onOpenAuthModal}
                  className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Register Free</span>
                </button>
              </div>
            )}

            {/* Backend Data Manager Button (Gated to Admin) */}
            {onOpenBackendManager && currentUserRole === 'ADMIN' && (
              <button
                id="header-backend-manager-btn"
                onClick={onOpenBackendManager}
                className="hidden lg:flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                title="Admin Realtime Data Manager"
              >
                <Database className="w-3 h-3 text-amber-400" />
                <span>Backend Database</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 w-full">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-logo-home-btn"
              onClick={() => handleNavClick('HOMEPAGE')}
              className="text-left focus:outline-none cursor-pointer"
            >
              <TradeHeavenLogo size="md" subtitle="Global B2B Marketplace &amp; Escrow Rail" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2 shrink-0">
            <button
              id="nav-link-homepage"
              onClick={() => handleNavClick('HOMEPAGE')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'HOMEPAGE' || activeView === 'MARKETPLACE_HOME'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home Marketplace
            </button>
            <button
              id="nav-link-products"
              onClick={() => handleNavClick('PRODUCT_DIRECTORY')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'PRODUCT_DIRECTORY'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Products
            </button>
            <button
              id="nav-link-suppliers"
              onClick={() => handleNavClick('SUPPLIERS_DIRECTORY')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'SUPPLIERS_DIRECTORY'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Verified Suppliers
            </button>
            <button
              id="nav-link-rfqs"
              onClick={() => handleNavClick('RFQ_HUB')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'RFQ_HUB'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              RFQ Sourcing Hub
            </button>
            <button
              id="nav-link-buy-leads"
              onClick={() => handleNavClick('BUY_LEADS')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'BUY_LEADS'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Buy Leads Feed
            </button>

            {/* Onboard With Us / Work With Us Button */}
            <button
              id="nav-link-onboard"
              onClick={() => handleNavClick('ONBOARD_WITH_US')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'ONBOARD_WITH_US'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Work With Us</span>
            </button>

            {/* Admin Suite Nav Link (Visible or Gated) */}
            <button
              id="nav-link-admin"
              onClick={() => handleNavClick('CLIENT_ADMIN')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'CLIENT_ADMIN'
                  ? 'bg-amber-100 text-amber-900 font-extrabold'
                  : currentUserRole === 'ADMIN'
                  ? 'text-amber-700 bg-amber-50/70 hover:bg-amber-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Admin &amp; Treasury</span>
              {currentUserRole !== 'ADMIN' && (
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </button>

            {/* Contact & Help Desk Link */}
            <button
              id="nav-link-contact"
              onClick={() => handleNavClick('CONTACT_US')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'CONTACT_US'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Contact Us</span>
            </button>

            {/* Full Site CMS Editor Link */}
            <button
              id="nav-link-cms"
              onClick={() => handleNavClick('CMS_MANAGEMENT')}
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'CMS_MANAGEMENT'
                  ? 'bg-amber-100 text-amber-950 font-black border border-amber-300'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
              }`}
              title="Full-Site Live CMS Editor"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Edit Site</span>
            </button>

            {/* Dropdown: More B2B Services */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  isSecondaryActive && activeView !== 'CLIENT_ADMIN' && activeView !== 'CONTACT_US'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>

              {moreToolsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleNavClick('ONBOARD_WITH_US')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-emerald-50 flex items-center gap-2.5 text-emerald-950 border-b border-slate-100 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-emerald-700 font-bold">Onboard / Work With Us</div>
                      <div className="text-[10px] text-slate-500 font-normal">Real &amp; Genuine Partner Vetting ($0 Free)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('CONTACT_US')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-b border-slate-100 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-blue-600 font-bold">Contact Help Desk</div>
                      <div className="text-[10px] text-slate-400 font-mono">help@tradeheaven.net</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('PREMIUM_SERVICES')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-amber-500" />
                    <div>
                      <div>Gold Supplier Upgrades</div>
                      <div className="text-[10px] text-slate-400 font-normal">Membership &amp; Credit Packs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('TRADE_TOOLS')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-blue-500" />
                    <div>
                      <div>Trade Calculators &amp; HS Codes</div>
                      <div className="text-[10px] text-slate-400 font-normal">Landed Cost &amp; Tariff Lookup</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('POST_SELL_OFFER')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <PackagePlus className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div>Post Product / Sell Offer</div>
                      <div className="text-[10px] text-slate-400 font-normal">Direct Factory Listing</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('SUPPLIERS_DIRECTORY')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Workflow className="w-4 h-4 text-purple-500" />
                    <div>
                      <div>Audited Factory Directory</div>
                      <div className="text-[10px] text-slate-400 font-normal">KYC &amp; Verified Exporters</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('REFUND_POLICY')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-t border-slate-100 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div>Return &amp; Refund Policy</div>
                      <div className="text-[10px] text-slate-400 font-normal">30-Day Terms &amp; EU Compliance</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Post RFQ Button */}
            <button
              id="header-post-rfq-btn"
              onClick={onOpenCreateRfq}
              className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Post Buy RFQ</span>
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
              title="Trade Workspace Dashboard"
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
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
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
            <button
              onClick={() => handleNavClick('CLIENT_ADMIN')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-between cursor-pointer"
            >
              <span>Admin Suite</span>
              {currentUserRole !== 'ADMIN' && <Lock className="w-3 h-3 text-slate-400" />}
            </button>
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
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Buy RFQ</span>
          </button>
        </div>
      )}

      {/* QUICK CONTROLS MODAL */}
      <QuickControlsModal
        isOpen={isQuickControlsOpen}
        onClose={() => setIsQuickControlsOpen(false)}
        activeView={activeView}
        setActiveView={handleNavClick}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        currentUser={currentUser}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        onOpenCreateRfq={() => {
          setIsQuickControlsOpen(false);
          onOpenCreateRfq();
        }}
        onOpenBackendManager={onOpenBackendManager}
        onOpenAuthModal={() => {
          setIsQuickControlsOpen(false);
          onOpenAuthModal();
        }}
      />
    </header>
  );
};
