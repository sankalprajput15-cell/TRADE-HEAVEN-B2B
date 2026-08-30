import { LanguageRegionSelector } from './LanguageRegionSelector';
import React, { useState, useEffect } from 'react';
import { Currency, UserRole, ActiveView, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { TradeHeavenLogo } from '../common/TradeHeavenLogo';
import { GlobalSearch } from '../common/GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { SafeImage } from '../common/SafeImage';
import { SOCIAL_LINKS, OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { useSiteContent } from '../../context/SiteContentContext';
import { useLanguage } from '../../context/LanguageContext';
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
  FileSpreadsheet,
  LogIn,
  LogOut,
  UserCheck,
  User,
  UserPlus,
  ShieldAlert,
  Sliders,
  SlidersHorizontal,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  Mail,
  BadgeCheck,
  Layers
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
  const { languageCode } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const auth = isUserAuthorized(currentUser);
  const isAdmin = auth.isAuthorized;

  const navDict = {
    home: { en: 'Home', zh: '首页', es: 'Inicio', ar: 'الرئيسية', de: 'Startseite', fr: 'Accueil', pt: 'Início', ru: 'Главная', ja: 'ホーム', hi: 'होम', tr: 'Ana Sayfa', vi: 'Trang chủ' },
    aboutUs: { en: 'About Us', zh: '关于我们', es: 'Sobre Nosotros', ar: 'معلومات عنا', de: 'Über uns', fr: 'À propos', pt: 'Sobre Nós', ru: 'О нас', ja: '会社概要', hi: 'हमारे बारे में', tr: 'Hakkımızda', vi: 'Về chúng tôi' },
    trustSafety: { en: 'Trust & Safety', zh: '安全信保', es: 'Seguridad', ar: 'الأمان والثقة', de: 'Sicherheit', fr: 'Sécurité', pt: 'Segurança', ru: 'Безопасность', ja: '信頼と安全', hi: 'सुरक्षा और विश्वास', tr: 'Güvenlik', vi: 'An toàn & Tin cậy' },
    newsInsights: { en: 'News & Insights', zh: '行业资讯', es: 'Noticias', ar: 'الأخبار', de: 'Nachrichten', fr: 'Actualités', pt: 'Notícias', ru: 'Новости', ja: 'ニュース', hi: 'समाचार', tr: 'Haberler', vi: 'Tin tức' },
    premiumServices: { en: 'Premium Services', zh: '尊享服务', es: 'Servicios Premium', ar: 'خدمات متميزة', de: 'Premium-Dienste', fr: 'Services Premium', pt: 'Serviços Premium', ru: 'Премиум', ja: 'プレミアム', hi: 'प्रीमियम सेवाएं', tr: 'Premium Hizmetler', vi: 'Dịch vụ cao cấp' },
    buyers: { en: 'Buyers', zh: '采购买家', es: 'Compradores', ar: 'المشترون', de: 'Käufer', fr: 'Acheteurs', pt: 'Compradores', ru: 'Покупатели', ja: 'バイヤー', hi: 'खरीदार', tr: 'Alıcılar', vi: 'Người mua' },
    suppliers: { en: 'Suppliers', zh: '认证供应商', es: 'Proveedores', ar: 'الموردون', de: 'Lieferanten', fr: 'Fournisseurs', pt: 'Fornecedores', ru: 'Поставщики', ja: 'サプライヤー', hi: 'आपूर्तिकर्ता', tr: 'Tedarikçiler', vi: 'Nhà cung cấp' },
    menu: { en: 'Menu', zh: '全站菜单', es: 'Menú', ar: 'القائمة', de: 'Menü', fr: 'Menu', pt: 'Menu', ru: 'Меню', ja: 'メニュー', hi: 'मेन्यू', tr: 'Menü', vi: 'Menu' },
    postBuyRfq: { en: 'Post Buy RFQ', zh: '发布采购需求', es: 'Publicar RFQ', ar: 'نشر طلب RFQ', de: 'RFQ erstellen', fr: 'Publier RFQ', pt: 'Publicar RFQ', ru: 'Разместить RFQ', ja: '調達案件投稿', hi: 'खरीद मांग दर्ज करें', tr: 'RFQ Oluştur', vi: 'Đăng RFQ' },
    signIn: { en: 'Sign In', zh: '登录', es: 'Iniciar Sesión', ar: 'تسجيل الدخول', de: 'Anmelden', fr: 'Connexion', pt: 'Entrar', ru: 'Войти', ja: 'ログイン', hi: 'साइन इन', tr: 'Giriş Yap', vi: 'Đăng nhập' },
    registerFree: { en: 'Register Free', zh: '免费注册', es: 'Registro Gratis', ar: 'تسجيل مجاني', de: 'Kostenlos registrieren', fr: 'Inscription Gratuite', pt: 'Cadastre-se', ru: 'Регистрация', ja: '無料会員登録', hi: 'मुफ़्त पंजीकरण', tr: 'Ücretsiz Kayıt', vi: 'Đăng ký miễn phí' },
    signOut: { en: 'Sign Out', zh: '退出', es: 'Cerrar Sesión', ar: 'خروج', de: 'Abmelden', fr: 'Déconnexion', pt: 'Sair', ru: 'Выйти', ja: 'ログアウト', hi: 'साइन आउट', tr: 'Çıkış', vi: 'Đăng xuất' },
    tradeAssurance: { en: '100% trade protection & Trade Assurance', zh: '100% 资金托管与信保体系', es: '100% Protección Comercial', ar: 'حماية وضمان تجاري 100%', de: '100% Handelsschutz', fr: '100% Protection commerciale', pt: '100% Proteção Comercial', ru: '100% Защита сделок', ja: '100% 取引保証・エスクロー', hi: '100% व्यापार सुरक्षा', tr: '%100 Ticaret Güvencesi', vi: '100% Bảo vệ giao dịch' }
  };

  const getTxt = (key: keyof typeof navDict): string => {
    const entry = navDict[key] as Record<string, string>;
    return entry[languageCode] || entry.en || '';
  };

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
      localStorage.removeItem('tradeheaven_user');
      localStorage.removeItem('th_session_user');
      localStorage.removeItem('th_session_jwt_token');
      localStorage.removeItem('tradeheaven_auth_user');
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
    'LANDING_PAGE',
    'POST_SELL_OFFER',
    'TRADE_TOOLS',
    'INCOTERMS_CALCULATOR',
    'REFUND_POLICY',
    'ARCHITECTURE_BLUEPRINT'
  ].includes(activeView);

  const isAdminActive = [
    'CLIENT_ADMIN',
    'CMS_MANAGEMENT',
    'PLAN_PRICING_ADMIN',
    'BULK_ENTITY_CRM'
  ].includes(activeView);

  const roleStyles: Record<UserRole, { badge: string; label: string }> = {
    BUYER: { badge: 'bg-blue-900/60 text-blue-300 border-blue-700/60 font-bold', label: 'BUYER' },
    SUPPLIER: { badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60 font-bold', label: 'SUPPLIER' },
    VERIFIER: { badge: 'bg-purple-900/60 text-purple-300 border-purple-700/60 font-bold', label: 'VERIFIER' },
    ADMIN: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-black tracking-wider shadow-2xs', label: 'ADMIN' }
  };

  return (
    <header id="trade-heaven-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs w-full">
      {/* 1. TOP UTILITY BAR (Fixed, Zero Scroll, High-Contrast Precision) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-200 border-b border-indigo-900/60 shadow-xs px-2 sm:px-6 lg:px-8 py-1.5 text-xs w-full">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 w-full">
          
          {/* Left: Security & Direct Assistance */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">{getTxt('tradeAssurance')}</span>
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
          </div>

          {/* Right: FX Selector + Language/Region + Authentication State */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto justify-end">
            
            {/* Compact Language & Region Selector */}
            {/* Custom Styled Language & Region Selector */}
            <LanguageRegionSelector variant="compact" />
            

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
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
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
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded border tracking-wider ${roleStyles[currentUser.role]?.badge || 'bg-amber-950/90 text-amber-300 border-amber-500/90'}`}>
                      [{currentUser.role}]
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
                  <span className="hidden sm:inline">{getTxt('signOut')}</span>
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
                  <span>{getTxt('signIn')}</span>
                </button>
                <button
                  id="header-register-free-btn"
                  onClick={onOpenRegisterFree || onOpenAuthModal}
                  className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-100" />
                  <span>{getTxt('registerFree')}</span>
                </button>
              </div>
            )}
            </div>
            </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR (Proportional, Clean Hierarchy, No Multi-line Wrapping) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2 w-full">
        <div className="flex items-center justify-between gap-3 lg:gap-4 xl:gap-6 w-full min-w-0">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center shrink-0 min-w-0">
            <button
              id="header-logo-home-btn"
              onClick={() => handleNavClick('HOMEPAGE')}
              className="text-left focus:outline-none cursor-pointer truncate"
            >
              <TradeHeavenLogo size="md" subtitle="B2B Marketplace" />
            </button>
          </div>

          {/* Center: Desktop Nav Links (Streamlined) */}
          <nav className="hidden lg:flex items-center flex-1 justify-center gap-1 xl:gap-2 min-w-0">
            <button
              onClick={() => handleNavClick('HOMEPAGE')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'HOMEPAGE' || activeView === 'MARKETPLACE_HOME'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {getTxt('home')}
            </button>
            <button
              onClick={() => handleNavClick('ABOUT_US')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'ABOUT_US'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {getTxt('aboutUs')}
            </button>
            <button
              onClick={() => handleNavClick('TRUST_SAFETY')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'TRUST_SAFETY'
                  ? 'bg-emerald-50 text-emerald-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {getTxt('trustSafety')}
            </button>
            <button
              onClick={() => handleNavClick('INSIGHTS')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'INSIGHTS'
                  ? 'bg-amber-50 text-amber-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {getTxt('newsInsights')}
            </button>

            {/* Premium Services (Top Nav Button) */}
            <button
              id="nav-link-premium-services"
              onClick={() => handleNavClick('PREMIUM_SERVICES')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                activeView === 'PREMIUM_SERVICES' || activeView === 'PREMIUM_MEMBERSHIP'
                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-sm'
                  : 'bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{getTxt('premiumServices')}</span>
            </button>

            <button
              id="nav-link-buyers"
              onClick={() => handleNavClick('BUYERS_DIRECTORY')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'BUYERS_DIRECTORY'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {getTxt('buyers')}
            </button>

            <button
              id="nav-link-suppliers"
              onClick={() => handleNavClick('SUPPLIERS_DIRECTORY')}
              className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'SUPPLIERS_DIRECTORY'
                  ? 'bg-blue-50 text-blue-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {getTxt('suppliers')}
            </button>

            {/* Dropdown: Menu (Contains all other options) */}
            <div className="relative shrink-0">
              <button
                id="nav-link-services-dropdown"
                onClick={() => {
                  setServicesMenuOpen(!servicesMenuOpen);
                  setAdminMenuOpen(false);
                }}
                className={`px-2 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isServicesActive
                    ? 'bg-blue-50 text-blue-600 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{getTxt('menu')}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>

              {servicesMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleNavClick('LANDING_PAGE')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-blue-50/80 flex items-center gap-2.5 text-slate-900 border-b border-slate-100 cursor-pointer"
                  >
                    <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-blue-700">
                        <span>Global Trade Hub</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase">
                          NEW
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">Corridors, Sectors, Live Tickers &amp; 3-Step RFQ</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('PRODUCT_DIRECTORY')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Products Catalog</div>
                      <div className="text-[10px] text-slate-400 font-normal">Browse verified export inventory</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('COUNTRY_HUB')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Landmark className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Country Hub Portals</div>
                      <div className="text-[10px] text-slate-400 font-normal">Explore 34 regional trade hubs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('RFQ_HUB')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <div>RFQ Marketplace</div>
                      <div className="text-[10px] text-slate-400 font-normal">Live buyer quote requests</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('BUY_LEADS')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <Workflow className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div>Buy Leads &amp; Inquiries</div>
                      <div className="text-[10px] text-slate-400 font-normal">Verified international trade leads</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('VENDOR_PROFILE')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-t border-slate-100 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Verified Vendor Profile</div>
                      <div className="text-[10px] text-slate-400 font-normal">Factory dossier &amp; ISO certs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('BUYER_PROFILE')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Corporate Buyer Profile</div>
                      <div className="text-[10px] text-slate-400 font-normal">D&amp;B audited dossier</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('POST_SELL_OFFER')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-t border-slate-100 cursor-pointer"
                  >
                    <PackagePlus className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Post Product / Sell Offer</div>
                      <div className="text-[10px] text-slate-400 font-normal">Direct Factory Listing</div>
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
                    onClick={() => handleNavClick('ABOUT_US')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-t border-slate-100 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>About Trade Heaven</div>
                      <div className="text-[10px] text-slate-400 font-normal">Company mission &amp; guarantees</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('ONBOARD_WITH_US')}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Work With Us / Onboard</div>
                      <div className="text-[10px] text-slate-400 font-normal">Partner program &amp; verification</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavClick('CONTACT_US')}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 border-t border-slate-100 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Contact Assistance Desk</div>
                      <div className="text-[10px] text-slate-400 font-normal">24/7 Global Support</div>
                    </div>
                  </button>
                </div>
              )}
            </div>



            {/* Admin Management Dropdown (Visible for Admins / Authenticated Staff) */}
            {isAdmin ? (
              <div className="relative shrink-0">
                <button
                  id="nav-link-admin-dropdown"
                  onClick={() => {
                    setAdminMenuOpen(!adminMenuOpen);
                    setServicesMenuOpen(false);
                  }}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
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
                      onClick={() => handleNavClick('PLAN_PRICING_ADMIN')}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 text-slate-800 border-b border-slate-100 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-amber-900 font-bold flex items-center gap-1.5">
                          <span>Plan &amp; Pricing Engine</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-black uppercase">SaaS</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">Quotas, rate limits, models &amp; Stripe</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavClick('BULK_ENTITY_CRM')}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 text-slate-800 border-b border-slate-100 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-amber-900 font-bold">Bulk Lead &amp; Entity CRM</div>
                        <div className="text-[10px] text-slate-500 font-normal">Excel/CSV uploader, validation &amp; IEM sync</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavClick('CLIENT_ADMIN')}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 text-slate-800 border-b border-slate-100 cursor-pointer"
                    >
                      <Landmark className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-amber-900 font-bold">Admin &amp; Treasury Portal</div>
                        <div className="text-[10px] text-slate-500 font-normal">trade protection releases &amp; user control</div>
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <GlobalSearch onNavigate={handleNavClick} />
            <NotificationBell onNavigate={handleNavClick} />
            {/* Post RFQ Button */}
            <button
              id="header-post-rfq-btn"
              onClick={onOpenCreateRfq}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{getTxt('postBuyRfq')}</span>
            </button>

            {/* Messages / Negotiation Room */}
            <button
              id="header-negotiation-btn"
              onClick={() => handleNavClick('NEGOTIATION_ROOM')}
              className={`p-1.5 sm:p-2 rounded-xl border relative transition-all shrink-0 cursor-pointer ${
                activeView === 'NEGOTIATION_ROOM'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Negotiation Room &amp; Inquiries"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Dashboard Link */}
            <button
              id="header-dashboard-btn"
              onClick={() => handleNavClick('DASHBOARD')}
              className={`hidden sm:flex p-1.5 sm:p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
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
              className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
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
                  <div className={`inline-block mt-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border tracking-wider ${roleStyles[currentUser.role]?.badge || 'bg-amber-950/90 text-amber-300 border-amber-500/90'}`}>
                    [{currentUser.role}]
                  </div>
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
              onClick={() => handleNavClick('ABOUT_US')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('TRUST_SAFETY')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-emerald-50 text-emerald-700 cursor-pointer col-span-2 text-center"
            >
              Security & Trust Center
            </button>
            <button
              onClick={() => handleNavClick('INSIGHTS')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-amber-50 text-amber-700 cursor-pointer col-span-2 text-center"
            >
              News & Insights
            </button>
            <button
              onClick={() => handleNavClick('LANDING_PAGE')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Global Hub</span>
              </div>
              <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-blue-600 text-white">NEW</span>
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
              onClick={() => handleNavClick('BUYERS_DIRECTORY')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-blue-50/70 text-blue-900 border border-blue-200/60 flex items-center justify-between cursor-pointer"
            >
              <span>Verified Buyers</span>
              <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              onClick={() => handleNavClick('VENDOR_PROFILE')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-between cursor-pointer"
            >
              <span>Vendor Profile (Demo)</span>
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              onClick={() => handleNavClick('BUYER_PROFILE')}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span>Buyer Profile (Demo)</span>
              <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
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
                onClick={() => handleNavClick('PLAN_PRICING_ADMIN')}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-blue-50 text-blue-950 border border-blue-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Plan &amp; Pricing Engine</span>
                </div>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-200 text-blue-900">SaaS</span>
              </button>
            )}
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
              className={`p-2.5 rounded-xl text-left text-xs font-black flex items-center justify-between col-span-2 cursor-pointer ${
                activeView === 'PREMIUM_SERVICES' || activeView === 'PREMIUM_MEMBERSHIP'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-amber-500/10 text-amber-900 border border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Premium Services &amp; Memberships</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-950">Plans</span>
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
