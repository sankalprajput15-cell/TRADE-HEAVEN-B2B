import { NotificationProvider } from "./context/NotificationContext";
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { 
  ActiveView, 
  Currency, 
  Product, 
  CompanyProfile, 
  RfqRequirement, 
  NegotiationThread, 
  PaymentCheckoutData,
  AuthUser
} from './types';
import { api } from './services/apiService';
import { apiClient } from './services/apiClient';
import { MOCK_PRODUCTS, MOCK_RFQS } from './data/mockData';

// Common Components
import { Header } from './components/marketplace/Header';
import { LiveRfqTicker } from './components/marketplace/LiveRfqTicker';
import { TradeHeavenSocialBar } from './components/common/TradeHeavenSocialBar';
import { CustomerReviews } from './components/marketplace/CustomerReviews';
import { TradeHeavenFooter } from './components/common/TradeHeavenFooter';
import { TradeHeavenLiveChatWidget } from './components/common/TradeHeavenLiveChatWidget';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { SEOManager } from './components/common/SEOManager';
import { BreadcrumbNavigation } from './components/common/BreadcrumbNavigation';
import { NotFoundView } from './components/common/NotFoundView';
import { TradeWheelHomePage } from './components/marketplace/TradeWheelHomePage';

// Helper for retryable lazy loaded views
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | { [key: string]: T }>,
  namedExport?: string
) {
  return React.lazy(async () => {
    try {
      const module = await componentImport();
      if ('default' in module && module.default) {
        return { default: module.default as T };
      }
      if (namedExport && (module as any)[namedExport]) {
        return { default: (module as any)[namedExport] as T };
      }
      const firstKey = Object.keys(module)[0];
      return { default: (module as any)[firstKey] as T };
    } catch (error) {
      console.warn('[lazyWithRetry] Retrying dynamic chunk load...', error);
      try {
        await new Promise(res => setTimeout(res, 300));
        const module = await componentImport();
        if ('default' in module && module.default) {
          return { default: module.default as T };
        }
        if (namedExport && (module as any)[namedExport]) {
          return { default: (module as any)[namedExport] as T };
        }
        const firstKey = Object.keys(module)[0];
        return { default: (module as any)[firstKey] as T };
      } catch (retryErr) {
        console.error('[lazyWithRetry] Module failed to load after retry:', retryErr);
        if (typeof window !== 'undefined') {
          const reloadKey = 'chunk_reload_' + (namedExport || 'view');
          const hasReloaded = sessionStorage.getItem(reloadKey);
          if (!hasReloaded) {
            sessionStorage.setItem(reloadKey, 'true');
            window.location.reload();
          }
        }
        const FallbackView: React.FC<any> = () => null;
        return { default: FallbackView as unknown as T };
      }
    }
  });
}

// Views
const ProductCatalog = lazyWithRetry(() => import('./components/marketplace/ProductCatalog'), 'ProductCatalog');
const RfqComparisonView = lazyWithRetry(() => import('./components/marketplace/RfqComparisonView'), 'RfqComparisonView');
const TradeNegotiationChat = lazyWithRetry(() => import('./components/marketplace/TradeNegotiationChat'), 'TradeNegotiationChat');
const BuyerSupplierDashboard = lazyWithRetry(() => import('./components/marketplace/BuyerSupplierDashboard'), 'BuyerSupplierDashboard');
const IncotermsCalculator = lazyWithRetry(() => import('./components/tools/IncotermsCalculator'), 'IncotermsCalculator');
const PremiumServicesView = lazyWithRetry(() => import('./components/services/PremiumServicesView'), 'PremiumServicesView');
const PostSellOfferView = lazyWithRetry(() => import('./components/services/PostSellOfferView'), 'PostSellOfferView');
const BuyLeadsView = lazyWithRetry(() => import('./components/services/BuyLeadsView'), 'BuyLeadsView');
const SuppliersDirectoryView = lazyWithRetry(() => import('./components/services/SuppliersDirectoryView'), 'SuppliersDirectoryView');
const BuyersDirectoryView = lazyWithRetry(() => import('./components/services/BuyersDirectoryView'), 'BuyersDirectoryView');
const RefundPolicyView = lazyWithRetry(() => import('./components/services/RefundPolicyView'), 'RefundPolicyView');
const ProductListingPolicyView = lazyWithRetry(() => import('./components/services/ProductListingPolicyView'), 'ProductListingPolicyView');
const PrivacyPolicyView = lazyWithRetry(() => import('./components/services/PrivacyPolicyView'), 'PrivacyPolicyView');
const TermsOfUseView = lazyWithRetry(() => import('./components/services/TermsOfUseView'), 'TermsOfUseView');
const ClientAdminView = lazyWithRetry(() => import('./components/services/ClientAdminView'), 'ClientAdminView');

const PlanPricingAdminModule = lazyWithRetry(() => import('./components/admin/PlanPricingAdminModule'), 'PlanPricingAdminModule');
const BulkEntityCrmModule = lazyWithRetry(() => import('./components/admin/BulkEntityCrmModule'), 'BulkEntityCrmModule');
const AdminDashboard = lazyWithRetry(() => import('./components/admin/AdminDashboard'), 'AdminDashboard');
const OnboardWithUsPage = lazyWithRetry(() => import('./components/marketplace/OnboardWithUsPage'), 'OnboardWithUsPage');
const AboutTradeHeavenView = lazyWithRetry(() => import('./components/services/AboutTradeHeavenView'), 'AboutTradeHeavenView');
const LandingPageView = lazyWithRetry(() => import('./components/marketplace/LandingPageView'), 'LandingPageView');
const VendorProfilePage = lazyWithRetry(() => import('./components/vendor/VendorProfilePage'), 'VendorProfilePage');
const BuyerProfilePage = lazyWithRetry(() => import('./components/buyer/BuyerProfilePage'), 'BuyerProfilePage');
const CountryTradeHubView = lazyWithRetry(() => import('./components/marketplace/CountryTradeHubView'), 'CountryTradeHubView');

// Core Interactive Modals (Direct imports ensure zero dynamic chunk fetch failures)
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { RfqDetailModal } from './components/marketplace/RfqDetailModal';
import { SupplierStorefrontModal } from './components/marketplace/SupplierStorefrontModal';
import { RfqCreationModal } from './components/marketplace/RfqCreationModal';
import { UnifiedContactInquiryModal } from './components/modals/UnifiedContactInquiryModal';
import { AuthModal } from './components/modals/AuthModal';
const PaymentCheckoutModal = lazyWithRetry(() => import('./components/modals/PaymentCheckoutModal'), 'PaymentCheckoutModal');
const BackendDataManagementModal = lazyWithRetry(() => import('./components/modals/BackendDataManagementModal'), 'BackendDataManagementModal');

import { bigrockApi } from './services/bigrockApi';
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
import { GuardedRootView } from './components/admin/GuardedRootView';
import { Loader2, Mail, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { TradeHeavenDataLoader } from './components/common/TradeHeavenDataLoader';
import { EditableText } from './components/EditableText';
import { EditableImage } from './components/EditableImage';
import { getDynamicHeroImageForView } from './utils/heroImageOptimization';
import { OptimizedHeroImage } from './components/common/OptimizedHeroImage';

const AboutUs = React.lazy(() => import('./components/marketplace/AboutUs').then(m => ({ default: m.AboutUs })));
const TrustAndSafety = React.lazy(() => import('./components/marketplace/TrustAndSafety').then(m => ({ default: m.TrustAndSafety })));
const InsightsBlog = React.lazy(() => import('./components/marketplace/InsightsBlog').then(m => ({ default: m.InsightsBlog })));

const MainApp: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    isAuthenticated,
    isAdmin,
    logout
  } = useAuth();

  const { 
    siteContent,
    activeQuickEditSection,
    closeQuickEdit
  } = useSiteContent();

  // Navigation & Currency State - Initialize from URL if present
  const getInitialView = (): ActiveView => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view) return view as ActiveView;
    }
    return 'HOMEPAGE';
  };

  const [activeView, setActiveView] = useState<ActiveView>(getInitialView());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  // Global listener: on any unexpected error event, safely divert directly to HOMEPAGE
  useEffect(() => {
    const handleDbError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; code?: string }>;
      console.warn('[TradeHeaven Safety Handled Error - Diverting to Home]:', customEvent?.detail);
      setActiveView('HOMEPAGE');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('view')) {
          url.searchParams.delete('view');
          window.history.replaceState({}, '', url.pathname);
        }
      }
    };
    window.addEventListener('tradeheaven_database_error', handleDbError);
    return () => window.removeEventListener('tradeheaven_database_error', handleDbError);
  }, []);

  // Products and entities initialized with default rich marketplace dataset
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [rfqs, setRfqs] = useState<RfqRequirement[]>(MOCK_RFQS);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(MOCK_RFQS[0]?.id || null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRfqForModal, setSelectedRfqForModal] = useState<RfqRequirement | null>(null);
  const [storefrontCompanyId, setStorefrontCompanyId] = useState<string | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-001');
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const prodId = params.get('productId') || params.get('product');

      if (view) setActiveView(view as ActiveView);
      else setActiveView('HOMEPAGE');

      if (prodId && products.length > 0) {
        const found = products.find(p => p.id === prodId);
        if (found) setSelectedProduct(found);
      } else if (!prodId) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Sync selectedProduct with URL on mount / when products update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('productId') || params.get('product');
      if (prodId && products.length > 0) {
        const found = products.find(p => p.id === prodId);
        if (found && (!selectedProduct || selectedProduct.id !== found.id)) {
          setSelectedProduct(found);
        }
      }
    }
  }, [products]);

  // Update URL when activeView or selectedProduct changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (activeView === 'HOMEPAGE') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', activeView);
      }

      if (selectedProduct) {
        url.searchParams.set('productId', selectedProduct.id);
      } else {
        url.searchParams.delete('productId');
        url.searchParams.delete('product');
      }

      // Only push if the URL actually changed to prevent infinite loops with popstate
      if (url.toString() !== window.location.href) {
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [activeView, selectedProduct]);
  const [contactModalConfig, setContactModalConfig] = useState<{
    isOpen: boolean;
    targetType: 'RFQ' | 'PRODUCT' | 'SUPPLIER' | 'GENERAL';
    targetId?: string;
    targetTitle?: string;
    targetSubtitle?: string;
    contactEmail?: string;
    contactPhone?: string;
    supplierCompany?: string;
    initialQuantity?: number;
    initialPrice?: number;
  }>({
    isOpen: false,
    targetType: 'GENERAL'
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER' | 'WORK_WITH_US'>('LOGIN');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<PaymentCheckoutData | null>(null);

  const handleOpenRegisterFree = () => {
    setAuthModalMode('REGISTER');
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const handleRegisterEvent = () => {
      handleOpenRegisterFree();
    };
    window.addEventListener('tradeheaven_open_register', handleRegisterEvent);
    return () => {
      window.removeEventListener('tradeheaven_open_register', handleRegisterEvent);
    };
  }, []);

  // Exponential backoff helper to prevent application crashes when backend/database is slow to respond
  const fetchWithRetry = async <T,>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
    backoffFactor: number = 2
  ): Promise<T> => {
    try {
      const result = await fn();
      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new Error('Empty response or empty dataset returned.');
      }
      return result;
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      console.warn(`[API Failsafe] Request failed. Retrying in ${delay}ms... (Remaining attempts: ${retries})`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * backoffFactor, backoffFactor);
    }
  };

  // Fetch live RFQs from BigRock PHP API (GET /api.php?action=get_rfqs) with exponential backoff failsafes
  const fetchRFQs = async () => {
    try {
      const loadedRfqs = await fetchWithRetry(() => apiClient.getRfqs(), 3, 1000, 2);
      if (Array.isArray(loadedRfqs) && loadedRfqs.length > 0) {
        const existingIds = new Set(loadedRfqs.map(r => r.id));
        const mergedRfqs = [...loadedRfqs, ...MOCK_RFQS.filter(r => !existingIds.has(r.id))];
        setRfqs(mergedRfqs as any);
        setSelectedRfqId(prev => (prev && mergedRfqs.some(r => r.id === prev)) ? prev : mergedRfqs[0].id);
      }
    } catch (err) {
      console.error('[Failed to load BigRock rfqs after retries]:', err);
    }
  };

  // Fetch live Products/Listings with exponential backoff failsafes
  const fetchProducts = async () => {
    try {
      const prods = await fetchWithRetry(() => api.getProducts(), 3, 1000, 2);
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    } catch (err) {
      console.error('[Failed to load products after retries]:', err);
    }
  };

  // 1. Fetch live data with Promise.allSettled to guarantee UI never hangs
  const initializeData = async () => {
    setIsLoadingInitialData(true);
    await Promise.allSettled([
      fetchProducts(),
      fetchRFQs()
    ]);
    setIsLoadingInitialData(false);
  };

  // Async Initialization on Mount with Deferred Data Hydration strategy
  useEffect(() => {
    // Defer the hydration process to allow initial UI mounting instantly and smoothly
    const deferTimer = setTimeout(() => {
      initializeData();
    }, 400);

    // 2. Listen for custom RFQ creation / refresh triggers
    const handleRfqRefresh = () => {
      fetchRFQs();
    };
    window.addEventListener('tradeheaven_rfq_created', handleRfqRefresh);

    return () => {
      clearTimeout(deferTimer);
      window.removeEventListener('tradeheaven_rfq_created', handleRfqRefresh);
    };
  }, []);

  // Global listener for cross-component navigation events
  useEffect(() => {
    const handleGlobalNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent?.detail) {
        handleNavigate(customEvent.detail);
      }
    };
    window.addEventListener('tradeheaven_navigate', handleGlobalNav);
    return () => {
      window.removeEventListener('tradeheaven_navigate', handleGlobalNav);
    };
  }, []);

  // Guard against unauthenticated visitors accessing admin views directly
  useEffect(() => {
    const adminViews: ActiveView[] = ['CLIENT_ADMIN', 'PLAN_PRICING_ADMIN', 'CMS_MANAGEMENT', 'BULK_ENTITY_CRM'];
    if (adminViews.includes(activeView) && (!currentUser || !isAdmin)) {
      setActiveView('HOMEPAGE');
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
    }
  }, [activeView, currentUser, isAdmin]);

  // Dynamic SEO, OpenGraph & Meta Tags based on active view, selected product, and dynamic hero placeholder
  useEffect(() => {
    // Check if target product is specified via selectedProduct state or URL query
    let targetProduct: Product | null = selectedProduct;
    if (!targetProduct && typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlProdId = params.get('productId') || params.get('product');
        if (urlProdId && products.length > 0) {
          targetProduct = products.find(p => p.id === urlProdId) || null;
        }
      } catch {
        targetProduct = null;
      }
    }

    let title = 'Trade Heaven | Global B2B Wholesale Marketplace';
    let description = 'Connect with verified global suppliers, compare live RFQs, and secure wholesale deals with Trade Heaven\'s secure B2B platform.';
    let keywords = 'Trade Heaven, TradeHeaven, global B2B marketplace, international wholesale platform, verified factory manufacturers, direct factory sourcing, cross border trade portal, buy wholesale direct from factory, international exporter directory, global B2B procurement platform, escrow protected trade transactions, bulk purchase import export, verified global vendors';
    let canonical = 'https://tradeheaven.net';
    let ogType = 'website';
    let ogImage = '';
    let ogImageWidth = '1200';
    let ogImageHeight = '630';
    let ogImageAlt = 'Trade Heaven - Global B2B Marketplace';
    const isProductPage = Boolean(targetProduct);

    // Dynamic hero image placeholder utilizing optimized 1.91:1 / 16:9 aspect ratios and blur-up loading effects
    const dynamicHeroImage = getDynamicHeroImageForView(activeView, siteContent, '1.91:1', 1200, 80);
    ogImage = dynamicHeroImage.url;
    ogImageAlt = dynamicHeroImage.alt;
    ogImageWidth = String(dynamicHeroImage.width);
    ogImageHeight = String(dynamicHeroImage.height);

    if (targetProduct) {
      const priceVal = targetProduct.fobPriceUsd || (targetProduct.priceTiers && targetProduct.priceTiers[0]?.priceUsd) || 0;
      const priceText = priceVal > 0 ? `$${priceVal}` : 'Factory Direct';
      const moqText = `${targetProduct.moq || targetProduct.minOrderQuantity || 100} ${targetProduct.moqUnit || 'units'}`;
      const cleanDesc = targetProduct.description 
        ? targetProduct.description.slice(0, 160).trim() 
        : `Buy ${targetProduct.title} wholesale at direct manufacturing rates.`;
      
      title = `${targetProduct.title} - Wholesale ${targetProduct.category} | Trade Heaven`;
      description = `${cleanDesc} Verified supplier ${targetProduct.supplierName} (${targetProduct.supplierCountry}). MOQ: ${moqText}. FOB: ${priceText}. 100% Escrow Trade Protection on Trade Heaven.`;
      keywords = [
        targetProduct.title,
        `wholesale ${targetProduct.category}`,
        targetProduct.subCategory ? `bulk ${targetProduct.subCategory}` : '',
        `${targetProduct.supplierCountry} manufacturers`,
        `factory direct ${targetProduct.title}`,
        `custom OEM ${targetProduct.title}`,
        `buy ${targetProduct.title} in bulk`,
        `${targetProduct.title} supplier MOQ ${targetProduct.moq || 100}`,
        `verified ${targetProduct.supplierName}`,
        'international B2B sourcing',
        'export container pricing',
        'FOB wholesale rates',
        'verified trade assurance supplier',
        'Trade Heaven'
      ].filter(Boolean).join(', ');
      canonical = `https://tradeheaven.net/?view=PRODUCT_DIRECTORY&productId=${encodeURIComponent(targetProduct.id)}`;
      ogType = 'product';

      if (targetProduct.images && targetProduct.images.length > 0 && targetProduct.images[0]) {
        ogImage = targetProduct.images[0];
        ogImageAlt = `${targetProduct.title} - ${targetProduct.supplierName}`;
        ogImageWidth = '800';
        ogImageHeight = '800';
      }
    } else {
      switch (activeView) {
        case 'HOMEPAGE':
        case 'LANDING_PAGE':
        case 'MARKETPLACE_HOME':
          title = 'Trade Heaven | Secure Global B2B Wholesale Marketplace';
          description = 'Discover verified factory inventory, connect with global suppliers, and trade securely with Trade Heaven.';
          keywords = 'Trade Heaven, TradeHeaven, global B2B marketplace, international wholesale platform, verified factory manufacturers, direct factory sourcing, cross border trade portal, buy wholesale direct from factory, international exporter directory, global B2B procurement platform, supply chain sourcing network, escrow protected trade transactions, bulk purchase import export, verified global vendors';
          canonical = 'https://tradeheaven.net';
          break;
        case 'PRODUCT_DIRECTORY':
          title = 'Global Product Catalog & Wholesale Directory | Trade Heaven';
          description = 'Browse verified factory inventory across industrial sectors. Compare tiered volume pricing and source high-quality products.';
          keywords = 'wholesale product catalog, bulk industrial supplies, factory direct products, B2B wholesale marketplace, manufacturing inventory, wholesale electronics suppliers, industrial machinery exporters, chemical suppliers direct, raw materials wholesale, OEM ODM private label products, container load wholesale pricing, minimum order quantity MOQ sourcing, direct from manufacturer, bulk commercial supplies, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=PRODUCT_DIRECTORY';
          break;
        case 'RFQ_HUB':
          title = 'Live B2B RFQs & Tenders | Trade Heaven';
          description = 'View live Requests for Quotation (RFQs), submit wholesale quotes, and connect with verified buyers worldwide.';
          keywords = 'live B2B RFQs, request for quotation tenders, active manufacturing tenders, global procurement tenders, wholesale buy leads, international sourcing requests, bulk buyer inquiries, contract manufacturing RFQ, government and enterprise trade tenders, supplier quote submissions, industrial supply RFQ, commercial procurement bids, Trade Heaven RFQ hub';
          canonical = 'https://tradeheaven.net/?view=RFQ_HUB';
          break;
        case 'SUPPLIERS_DIRECTORY':
          title = 'Verified Global Suppliers & Exporters | Trade Heaven';
          description = 'Find and partner with verified manufacturers, exporters, and wholesale suppliers from around the globe.';
          keywords = 'verified global suppliers, international manufacturer directory, audited factory exporters, ISO certified manufacturers, OEM ODM custom manufacturing partners, top exporters directory, verified Chinese manufacturers, Indian export suppliers, European wholesale factories, verified African suppliers, North American manufacturing partners, factory audit reports, wholesale supplier directory, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=SUPPLIERS_DIRECTORY';
          break;
        case 'BUYERS_DIRECTORY':
          title = 'Verified Global Buyers & Importers | Trade Heaven';
          description = 'Connect with verified international buyers and importers actively seeking wholesale product sourcing.';
          keywords = 'international importers directory, verified wholesale buyers, global procurement officers, corporate purchasing agents, vetted trade importers, commodity buyers list, retail chain sourcing buyers, distributor network directory, international purchasing consortiums, high volume procurement leads, verified trade buyers, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=BUYERS_DIRECTORY';
          break;
        case 'BUY_LEADS':
          title = 'Active Wholesale Buy Leads | Trade Heaven';
          description = 'Access active buy leads from verified global importers. Quote on RFQs and grow your export business.';
          keywords = 'verified buy leads, urgent purchase orders, international buyer leads, active import requirements, wholesale purchase tenders, verified procurement managers, corporate purchase orders, bulk commodity buy leads, high volume sourcing inquiries, export leads for manufacturers, international buyers seeking suppliers, Trade Heaven buy leads';
          canonical = 'https://tradeheaven.net/?view=BUY_LEADS';
          break;
        case 'POST_BUY_REQUIREMENT':
          title = 'Post Buy Requirement & Source Products | Trade Heaven';
          description = 'Submit your bulk product sourcing requirements. Reach thousands of verified manufacturers and receive fast factory-direct quotes.';
          keywords = 'post buy requirement, submit B2B sourcing request, create RFQ for manufacturers, request factory quotes, custom manufacturing quotes, find suppliers for my product, bulk procurement request, private label OEM inquiry, free RFQ submission, reverse auction sourcing, factory price discovery, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=POST_BUY_REQUIREMENT';
          break;
        case 'POST_SELL_OFFER':
          title = 'Post Sell Offer & Export Wholesale Cargo | Trade Heaven';
          description = 'Broadcast your factory-direct inventory and ready-to-ship wholesale cargo offers to verified international buyers.';
          keywords = 'post sell offer, list wholesale products, export products online, B2B product listing portal, find international buyers for my products, factory excess inventory sale, bulk stocklot offers, direct manufacturer catalog publishing, wholesale supply broadcasting, global trade leads, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=POST_SELL_OFFER';
          break;
        case 'TRUST_SAFETY':
          title = 'Trust & Safety Center | Trade Heaven';
          description = 'Learn how Trade Heaven ensures secure international B2B transactions through supplier verification and escrow protection.';
          keywords = 'B2B escrow protection, secure cross border payments, factory audit verification, fraud prevention in international trade, dispute resolution for exporters, supplier credit background check, trade assurance guarantee, secure letter of credit handling, cargo inspection SGS compliance, safe international trade, Trade Heaven trust safety';
          canonical = 'https://tradeheaven.net/?view=TRUST_SAFETY';
          break;
        case 'INSIGHTS':
          title = 'Trade Finance & MT700 DLC Risk Insights | Trade Heaven';
          description = 'Is your cargo truly financeable? Understand MT700 DLC bankability, vessel risk, trade compliance, sanctions screening, and bulk export financing with Trade Heaven.';
          keywords = 'Trade Finance MT700, Letter of Credit DLC bankable, cargo financing risk, bulk export transaction compliance, vessel sanctions screening, OFAC maritime compliance, bill of lading discrepancies, UCP 600 banking rules, trade risk mitigation, shipping document compliance, cargo financibility, international trade execution platform, Trade Heaven insights';
          canonical = 'https://tradeheaven.net/?view=INSIGHTS';
          break;
        case 'PREMIUM_MEMBERSHIP':
        case 'PREMIUM_SERVICES':
          title = 'Premium B2B Supplier Membership | Trade Heaven';
          description = 'Upgrade your supplier profile to access priority RFQs, verified buyer data, and enhanced storefront visibility.';
          keywords = 'B2B premium supplier membership, verified exporter badge, priority RFQ access, top search ranking for manufacturers, global buyer contact reveals, trade matchmaking services, export marketing packages, verified trust seal certification, VIP supplier portal, high conversion B2B storefront, Trade Heaven Pro';
          canonical = 'https://tradeheaven.net/?view=PREMIUM_MEMBERSHIP';
          break;
        case 'INCOTERMS_CALCULATOR':
        case 'TRADE_TOOLS':
          title = 'Incoterms Cost & Risk Calculator | Trade Heaven';
          description = 'Calculate shipping costs and understand risk transfers for global trade using our interactive Incoterms tool.';
          keywords = 'Incoterms 2020 calculator, FOB vs CIF freight calculator, EXW DDP cost estimator, international shipping risk transfer, ocean freight cost calculator, air cargo tariff estimator, customs duty and freight estimator, landed cost calculation tool, container shipping volume calculator, port to port logistics estimator, Trade Heaven trade tools';
          canonical = 'https://tradeheaven.net/?view=INCOTERMS_CALCULATOR';
          break;
        case 'NEGOTIATION_ROOM':
          title = 'B2B Trade Negotiation Room | Trade Heaven';
          description = 'Negotiate wholesale trade terms, draft proforma invoices, and establish secure escrow payment milestones.';
          keywords = 'B2B price negotiation, counter offer supplier room, formal proforma invoice generator, purchase contract drafting, escrow payment milestone tracking, international trade negotiation platform, wholesale order contract terms, trade milestone release, secure supplier messaging, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=NEGOTIATION_ROOM';
          break;
        case 'COUNTRY_HUB':
          title = 'Global Country Trade Hubs & Export Corridors | Trade Heaven';
          description = 'Explore international manufacturing hubs, bilateral export corridors, and country-specific trade tariffs.';
          keywords = 'country trade hubs, bilateral export corridors, import export directory by country, regional manufacturing clusters, free trade agreement FTAs, tariff rates by country, regional export promotion, cross border trade lanes, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=COUNTRY_HUB';
          break;
        case 'ABOUT_US':
          title = 'About Trade Heaven | Verified B2B Marketplace';
          description = 'Learn about Trade Heaven\'s mission to connect global wholesale buyers and verified suppliers safely.';
          keywords = 'about Trade Heaven, Tradeheaven ECOM Solution LLP, global trade facilitation platform, international B2B mission, cross-border commerce vision, world trade network, trusted B2B trade marketplace, international export ecosystem';
          canonical = 'https://tradeheaven.net/?view=ABOUT_US';
          break;
        case 'CONTACT_US':
        case 'ONBOARD_WITH_US':
          title = 'Contact & Onboard with Trade Heaven | Global Trade Desk';
          description = 'Get in touch with Trade Heaven trade advisors for supplier verification, buyer onboarding, and wholesale sourcing support.';
          keywords = 'contact Trade Heaven, B2B support helpdesk, supplier onboarding support, trade advisor consultation, international trade desk phone, WhatsApp trade support, register as global exporter, become verified buyer, supplier onboarding assistance';
          canonical = 'https://tradeheaven.net/?view=CONTACT_US';
          break;
        case 'PRODUCT_LISTING_POLICY':
          title = 'Product Listing Policy & Prohibited Items | Trade Heaven';
          description = 'Review Trade Heaven\'s terms of listing products, restricted items, IPR compliance, and regulatory sanctions.';
          keywords = 'product listing policy, prohibited B2B items, export compliance guidelines, restricted trade commodities, intellectual property rights IPR protection, anti-counterfeit policy, trade sanctions screening rules, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=PRODUCT_LISTING_POLICY';
          break;
        case 'PRIVACY_POLICY':
          title = 'Privacy Policy | Tradeheaven ECOM Solution LLP | Trade Heaven';
          description = 'Review Trade Heaven\'s privacy terms, data protection commitment, and B2B user rights managed by Tradeheaven ECOM Solution LLP.';
          keywords = 'Trade Heaven privacy policy, Tradeheaven ECOM Solution LLP data protection, B2B corporate privacy, GDPR data subject rights, international business data security, secure user authentication, trade confidentiality';
          canonical = 'https://tradeheaven.net/?view=PRIVACY_POLICY';
          break;
        case 'TERMS_OF_USE':
          title = 'Terms of Use Agreement | Tradeheaven ECOM Solution LLP | Trade Heaven';
          description = 'Review Trade Heaven\'s user terms of use, membership rights, trade guidelines, and refund policy operated by Tradeheaven ECOM Solution LLP.';
          keywords = 'Trade Heaven terms of use, B2B user agreement, membership rights, trade dispute mediation, commercial trade platform terms, Tradeheaven ECOM Solution LLP contract terms';
          canonical = 'https://tradeheaven.net/?view=TERMS_OF_USE';
          break;
        case 'REFUND_POLICY':
          title = 'Return & Refund Policy | Dispute Terms | Trade Heaven';
          description = 'Review Trade Heaven\'s investigation-based refund conditions, inspection failure terms, and dispute mediation rules.';
          keywords = 'Trade Heaven refund policy, escrow dispute resolution terms, supplier cancellation policy, investigation-based refund conditions, inspection failure claims, trade assurance refund terms';
          canonical = 'https://tradeheaven.net/?view=REFUND_POLICY';
          break;
        case 'VENDOR_PROFILE':
          title = 'Verified Supplier Storefront | Trade Heaven';
          description = 'View verified supplier profiles, browse product catalogs, and review manufacturing certifications on Trade Heaven.';
          keywords = 'verified supplier storefront, audited factory profile, manufacturer catalog, factory facility inspection reports, supplier trust rating score, export transaction history, supplier MOQ and factory lead time, OEM ODM production capacity, certified manufacturer profile, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=VENDOR_PROFILE';
          break;
        case 'BUYER_PROFILE':
          title = 'Verified Global Buyer Profile | Trade Heaven';
          description = 'View verified buyer company profiles, procurement volume requirements, and sourcing history on Trade Heaven.';
          keywords = 'verified buyer profile, importer purchasing history, corporate sourcing criteria, buyer credit rating, target procurement volume, annual import requirements, verified KYC importer, corporate purchasing profile, Trade Heaven';
          canonical = 'https://tradeheaven.net/?view=BUYER_PROFILE';
          break;
      }
    }

    // 1. Update document title
    document.title = title;
    
    // Helper function to create or update meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, content: string, isProperty: boolean = false) => {
      const selector = isProperty 
        ? `meta[property="${attributeValue}"]` 
        : `meta[name="${attributeValue}"]`;
      
      let metaElement = document.querySelector(selector);
      if (metaElement) {
        metaElement.setAttribute('content', content);
      } else {
        metaElement = document.createElement('meta');
        if (isProperty) {
          metaElement.setAttribute('property', attributeValue);
        } else {
          metaElement.setAttribute('name', attributeValue);
        }
        metaElement.setAttribute('content', content);
        document.head.appendChild(metaElement);
      }
    };

    // Helper function to remove meta tags when not on product page
    const removeMetaTag = (attributeValue: string, isProperty: boolean = false) => {
      const selector = isProperty 
        ? `meta[property="${attributeValue}"]` 
        : `meta[name="${attributeValue}"]`;
      const metaElement = document.querySelector(selector);
      if (metaElement) {
        metaElement.remove();
      }
    };

    // 2. Set description meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:description', description, true);
    setMetaTag('name', 'twitter:description', description);

    // 3. Set OpenGraph & Twitter title & metadata
    setMetaTag('property', 'og:title', title, true);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('property', 'og:url', canonical, true);
    setMetaTag('property', 'og:type', ogType, true);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    // 4. Set OpenGraph & Twitter image tags with dynamic aspect ratio metadata
    setMetaTag('property', 'og:image', ogImage, true);
    setMetaTag('property', 'og:image:secure_url', ogImage, true);
    setMetaTag('property', 'og:image:width', ogImageWidth, true);
    setMetaTag('property', 'og:image:height', ogImageHeight, true);
    setMetaTag('property', 'og:image:alt', ogImageAlt, true);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:image:alt', ogImageAlt);
    setMetaTag('name', 'theme-color', dynamicHeroImage.themeColor);

    // 5. Product-specific OpenGraph and Twitter tags for social previews and search indexing
    if (isProductPage && targetProduct) {
      const priceVal = targetProduct.fobPriceUsd || (targetProduct.priceTiers && targetProduct.priceTiers[0]?.priceUsd) || 0;
      setMetaTag('property', 'product:price:amount', String(priceVal), true);
      setMetaTag('property', 'product:price:currency', 'USD', true);
      setMetaTag('property', 'og:price:amount', String(priceVal), true);
      setMetaTag('property', 'og:price:currency', 'USD', true);
      setMetaTag('property', 'product:availability', targetProduct.inStock !== false ? 'in stock' : 'preorder', true);
      setMetaTag('property', 'product:condition', 'new', true);
      setMetaTag('property', 'product:retailer_item_id', targetProduct.id, true);
      setMetaTag('property', 'product:category', targetProduct.category, true);
      setMetaTag('property', 'product:brand', targetProduct.supplierName, true);
      if (targetProduct.subCategory) {
        setMetaTag('property', 'product:retailer_category', targetProduct.subCategory, true);
      }

      setMetaTag('name', 'twitter:label1', 'Price');
      setMetaTag('name', 'twitter:data1', priceVal > 0 ? `$${priceVal} USD` : 'Contact for Wholesale Price');
      setMetaTag('name', 'twitter:label2', 'Minimum Order (MOQ)');
      setMetaTag('name', 'twitter:data2', `${targetProduct.moq || targetProduct.minOrderQuantity || 100} ${targetProduct.moqUnit || 'units'}`);
      setMetaTag('name', 'keywords', keywords);
    } else {
      removeMetaTag('product:price:amount', true);
      removeMetaTag('product:price:currency', true);
      removeMetaTag('og:price:amount', true);
      removeMetaTag('og:price:currency', true);
      removeMetaTag('product:availability', true);
      removeMetaTag('product:condition', true);
      removeMetaTag('product:retailer_item_id', true);
      removeMetaTag('product:category', true);
      removeMetaTag('product:brand', true);
      removeMetaTag('product:retailer_category', true);
      removeMetaTag('twitter:label1', false);
      removeMetaTag('twitter:data1', false);
      removeMetaTag('twitter:label2', false);
      removeMetaTag('twitter:data2', false);
      setMetaTag('name', 'keywords', keywords);
    }

    // 6. Update or create canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }

    // 7. Dynamic Schema.org Product Structured Data injection for search engines
    const ldScriptId = 'tradeheaven-dynamic-product-ld';
    let ldScript = document.getElementById(ldScriptId) as HTMLScriptElement | null;
    if (isProductPage && targetProduct) {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.id = ldScriptId;
        ldScript.type = 'application/ld+json';
        document.head.appendChild(ldScript);
      }
      const priceVal = targetProduct.fobPriceUsd || (targetProduct.priceTiers && targetProduct.priceTiers[0]?.priceUsd) || 0;
      const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": targetProduct.title,
        "image": (targetProduct.images && targetProduct.images.length > 0) ? targetProduct.images : [ogImage],
        "description": description,
        "sku": targetProduct.id,
        "category": targetProduct.category,
        "brand": {
          "@type": "Brand",
          "name": targetProduct.supplierName
        },
        "offers": {
          "@type": "Offer",
          "url": canonical,
          "priceCurrency": "USD",
          "price": String(priceVal || "0.00"),
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": targetProduct.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          "seller": {
            "@type": "Organization",
            "name": targetProduct.supplierName,
            "address": {
              "@type": "PostalAddress",
              "addressCountry": targetProduct.supplierCountry
            }
          }
        }
      };
      ldScript.textContent = JSON.stringify(productSchema);
    } else {
      if (ldScript) {
        ldScript.remove();
      }
    }
  }, [activeView, selectedProduct, products, siteContent]);

  // Handlers
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOpenStorefront = (companyId: string) => {
    setStorefrontCompanyId(companyId);
  };

  const handleContactSupplier = (product: Product) => {
    setSelectedProduct(null);
    setActiveView('NEGOTIATION_ROOM');
  };

  const handleOpenCreateRfq = () => {
    setIsCreateRfqOpen(true);
  };

  const handleRfqCreated = async (newRfq: Partial<RfqRequirement>) => {
    try {
      // Direct submission via apiClient if not already saved
      const payload = {
        title: newRfq.productName || (newRfq as any).title || 'Industrial Sourcing Requirement',
        category: newRfq.category || 'Industrial Machinery & CNC',
        quantity: String(newRfq.targetQuantity || (newRfq as any).quantity || '1000'),
        unit: newRfq.quantityUnit || (newRfq as any).unit || 'Pieces',
        targetPrice: String(newRfq.targetPriceUsd || (newRfq as any).targetPrice || '0'),
        incoterms: newRfq.preferredIncoterm || (newRfq as any).incoterms || 'FOB',
        destinationPort: newRfq.destinationPort || 'Port of Hamburg',
        specifications: newRfq.detailedRequirements || newRfq.detailedDescription || (newRfq as any).specifications || '',
        buyer_name: newRfq.buyerName || currentUser?.name || 'Procurement Officer',
        buyer_country: newRfq.buyerCountry || 'United States',
        buyer_email: (newRfq as any).buyerEmail || currentUser?.email || 'support@tradeheaven.net',
        buyer_company: newRfq.buyerCompany || currentUser?.companyName || 'Enterprise Buyer Ltd'
      };

      const res = await apiClient.submitRfq(payload);
      if (res.success && res.data) {
        const created = res.data as RfqRequirement;
        setRfqs(prev => {
          const filtered = prev.filter(r => r.id !== created.id);
          return [created, ...filtered];
        });
        setSelectedRfqId(created.id);
      } else {
        const fallbackRfq: RfqRequirement = {
          id: newRfq.id || `rfq-${Date.now()}`,
          buyerName: newRfq.buyerName || currentUser?.name || 'Procurement Officer',
          buyerCompany: newRfq.buyerCompany || currentUser?.companyName || 'Enterprise Buyer Ltd',
          buyerCountry: newRfq.buyerCountry || 'United States',
          buyerVerified: true,
          productName: newRfq.productName || 'Industrial Sourcing Requirement',
          category: newRfq.category || 'Industrial Machinery & CNC',
          targetQuantity: newRfq.targetQuantity || 100,
          quantityUnit: newRfq.quantityUnit || 'Units',
          targetPriceUsd: newRfq.targetPriceUsd || 100,
          preferredIncoterm: newRfq.preferredIncoterm || 'FOB',
          destinationPort: newRfq.destinationPort || 'Port of Hamburg',
          paymentTerms: newRfq.paymentTerms || 'Trade Protection Certificate (Swiss Vault)',
          detailedRequirements: newRfq.detailedRequirements || newRfq.detailedDescription || '',
          urgency: 'STANDARD',
          quotesCount: 0,
          postedDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'OPEN',
          matchedSupplierCount: 4,
          spamScore: 1.0
        };
        setRfqs(prev => [fallbackRfq, ...prev]);
        setSelectedRfqId(fallbackRfq.id);
      }
    } catch (e) {
      console.error('[handleRfqCreated error]:', e);
    }
    setIsCreateRfqOpen(false);
    setActiveView('RFQ_HUB');
  };

  const handleProductCreated = (newProd: Partial<Product>) => {
    const fullProd = {
      ...newProd,
      id: `prod-${Date.now()}`
    } as Product;
    setProducts(prev => [fullProd, ...prev]);
    setActiveView('PRODUCT_DIRECTORY');
  };

  const handleInitiateEscrow = (thread: NegotiationThread) => {
    setCheckoutData({
      planId: thread.id,
      title: `Trade Protection Deposit: ${thread.productTitle}`,
      description: `${thread.orderQuantity} units @ $${thread.currentPriceUsd}/unit (${thread.currentIncoterm}) to ${thread.destinationPort}`,
      amountUsd: thread.currentPriceUsd * thread.orderQuantity,
      type: 'ESCROW_DEPOSIT',
      supplierCompany: thread.supplierCompany
    });
  };

  const handleOpenPaymentCheckout = (data: PaymentCheckoutData) => {
    setCheckoutData(data);
  };

  const handleOpenContactModal = (config?: Partial<typeof contactModalConfig>) => {
    setContactModalConfig({
      isOpen: true,
      targetType: config?.targetType || 'GENERAL',
      targetId: config?.targetId,
      targetTitle: config?.targetTitle,
      targetSubtitle: config?.targetSubtitle,
      contactEmail: config?.contactEmail,
      contactPhone: config?.contactPhone,
      supplierCompany: config?.supplierCompany,
      initialQuantity: config?.initialQuantity,
      initialPrice: config?.initialPrice
    });
  };

  const handleCloseContactModal = () => {
    setContactModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleNavigate = (
    view: ActiveView | string, 
    options?: { search?: string; category?: string; subcategory?: string; productId?: string }
  ) => {
    const target = String(view || '').trim().toUpperCase();

    if (options?.category) {
      setCatalogCategory(options.category);
    }
    if (options?.search !== undefined) {
      setCatalogSearch(options.search);
    }
    if (options?.productId) {
      const prod = products.find(p => p.id === options.productId);
      if (prod) {
        setSelectedProduct(prod);
      }
    } else {
      setSelectedProduct(null);
    }
    setStorefrontCompanyId(null);

    // Specific modal actions
    if (target === 'POST_BUY_REQUIREMENT' || target === 'CREATE_RFQ') {
      setIsCreateRfqOpen(true);
      return;
    }
    if (target === 'CONTACT_US' || target === 'CONTACT' || target === 'SUPPORT') {
      handleOpenContactModal({ targetType: 'GENERAL' });
      return;
    }
    if (target === 'AUTH_LOGIN' || target === 'LOGIN') {
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
      return;
    }
    if (target === 'AUTH_REGISTER' || target === 'REGISTER') {
      setAuthModalMode('REGISTER');
      setIsAuthModalOpen(true);
      return;
    }
    if (target === 'DATABASE_BACKUP' || target === 'DATA_MANAGEMENT') {
      setIsDbModalOpen(true);
      return;
    }

    // View Aliases
    if (target === 'HOME' || target === 'MARKETPLACE_HOME' || target === 'HOMEPAGE' || target === '/') {
      setActiveView('HOMEPAGE');
      return;
    }
    if (target === 'PRODUCTS' || target === 'PRODUCT_CATALOG' || target === 'PRODUCT_DIRECTORY' || target === 'CATALOG' || target === 'LISTINGS' || target === 'CATEGORIES') {
      setActiveView('PRODUCT_DIRECTORY');
      return;
    }
    if (target === 'RFQS' || target === 'RFQ_HUB' || target === 'RFQ_COMPARISON' || target === 'TENDERS') {
      setActiveView('RFQ_HUB');
      return;
    }
    if (target === 'TRADE_TOOLS' || target === 'INCOTERMS_CALCULATOR' || target === 'TOOLS' || target === 'CALCULATOR') {
      setActiveView('INCOTERMS_CALCULATOR');
      return;
    }
    if (target === 'PREMIUM_PLANS' || target === 'PREMIUM_SERVICES' || target === 'PREMIUM_MEMBERSHIP' || target === 'PRICING') {
      setActiveView('PREMIUM_MEMBERSHIP');
      return;
    }
    if (target === 'CLIENT_PORTAL' || target === 'CLIENT_ADMIN' || target === 'ADMIN_PORTAL') {
      if (!currentUser || !isAdmin) {
        setActiveView('HOMEPAGE');
        setAuthModalMode('LOGIN');
        setIsAuthModalOpen(true);
        return;
      }
      setActiveView('CLIENT_ADMIN');
      return;
    }
    if (target === 'PLAN_PRICING_ADMIN' || target === 'PRICING_ADMIN') {
      if (!currentUser || !isAdmin) {
        setActiveView('HOMEPAGE');
        setAuthModalMode('LOGIN');
        setIsAuthModalOpen(true);
        return;
      }
      setActiveView('PLAN_PRICING_ADMIN');
      return;
    }
    if (target === 'TRADE_PROTECTION' || target === 'DASHBOARD' || target === 'MY_DASHBOARD') {
      setActiveView('DASHBOARD');
      return;
    }
    if (target === 'SELLER_OFFER' || target === 'POST_SELL_OFFER' || target === 'SELL') {
      setActiveView('POST_SELL_OFFER');
      return;
    }
    if (target === 'BUY_LEADS' || target === 'LEADS') {
      setActiveView('BUY_LEADS');
      return;
    }
    if (target === 'SUPPLIERS_DIRECTORY' || target === 'SUPPLIERS' || target === 'EXPORTERS') {
      setActiveView('SUPPLIERS_DIRECTORY');
      return;
    }
    if (target === 'BUYERS_DIRECTORY' || target === 'BUYERS' || target === 'VERIFIED_BUYERS' || target === 'IMPORTERS') {
      setActiveView('BUYERS_DIRECTORY');
      return;
    }
    if (target === 'REFUND_POLICY' || target === 'REFUND' || target === 'TRADE_PROTECTION_POLICY') {
      setActiveView('REFUND_POLICY');
      return;
    }
    if (target === 'PRODUCT_LISTING_POLICY' || target === 'LISTING_POLICY' || target === 'PRODUCT_POLICY' || target === 'PROHIBITED_ITEMS' || target === 'PROHIBITED_PRODUCTS' || target === 'LISTING_RULES') {
      setActiveView('PRODUCT_LISTING_POLICY');
      return;
    }
    if (target === 'PRIVACY_POLICY' || target === 'PRIVACY' || target === 'PRIVACY_STATEMENT' || target === 'TERMS_PRIVACY') {
      setActiveView('PRIVACY_POLICY');
      return;
    }
    if (target === 'TERMS_OF_USE' || target === 'TERMS' || target === 'TERMS_AND_CONDITIONS' || target === 'TOS' || target === 'USER_AGREEMENT') {
      setActiveView('TERMS_OF_USE');
      return;
    }
    if (target === 'ONBOARD_WITH_US' || target === 'ONBOARD' || target === 'REGISTER_SELLER' || target === 'WORK_WITH_US') {
      setActiveView('ONBOARD_WITH_US');
      return;
    }
    if (target === 'NEGOTIATION' || target === 'NEGOTIATION_ROOM' || target === 'CHAT') {
      setActiveView('NEGOTIATION_ROOM');
      return;
    }
    if (target === 'VENDOR_PROFILE' || target === 'VENDOR' || target === 'PROFILE' || target === 'STOREFRONT' || target === 'SUPPLIER_PROFILE' || target === 'DEMO_PROFILE') {
      setActiveView('VENDOR_PROFILE');
      return;
    }
    if (target === 'BUYER_PROFILE' || target === 'BUYER' || target === 'BUYER_DEMO' || target === 'IMPORTER_PROFILE') {
      setActiveView('BUYER_PROFILE');
      return;
    }
    if (target === 'CMS_MANAGEMENT' || target === 'CMS' || target === 'SITE_EDITOR') {
      if (!currentUser || !isAdmin) {
        setActiveView('HOMEPAGE');
        setAuthModalMode('LOGIN');
        setIsAuthModalOpen(true);
        return;
      }
      setActiveView('CMS_MANAGEMENT');
      return;
    }

    setActiveView(view as ActiveView);
  };

  const handleOpenLiveTool = (tool: 'incoterms' | 'rfq_checker' | 'api_sandbox') => {
    if (tool === 'incoterms') {
      setActiveView('INCOTERMS_CALCULATOR');
    } else if (tool === 'rfq_checker') {
      setActiveView('RFQ_HUB');
    } else if (tool === 'api_sandbox') {
      setIsDbModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white font-sans">
      {/* Scroll restoration anchor */}
      <ScrollToTop activeView={activeView} />
      {/* Dynamic SEO Meta Tags Manager */}
      <SEOManager 
        activeView={activeView} 
        selectedProduct={selectedProduct} 
        products={products} 
      />

      {/* 1. TOP ANNOUNCEMENT & LIVE RFQ TICKER */}
      <LiveRfqTicker
        rfqs={rfqs}
        onSelectRfq={(rfq) => {
          setSelectedRfqId(rfq.id);
          setSelectedRfqForModal(rfq);
        }}
      />

      {/* 2. MAIN MARKETPLACE APP HEADER */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        currentUser={currentUser}
        onLogout={() => logout()}
        onOpenAuthModal={() => {
          setAuthModalMode('LOGIN');
          setIsAuthModalOpen(true);
        }}
        onOpenRegisterFree={() => {
          setAuthModalMode('REGISTER');
          setIsAuthModalOpen(true);
        }}
        onOpenOnboardModal={() => {
          handleNavigate('ONBOARD_WITH_US');
        }}
        onOpenContactModal={() => handleOpenContactModal({ targetType: 'GENERAL' })}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenCreateRfq={handleOpenCreateRfq}
        products={products}
        onSelectProduct={(prod) => {
          handleSelectProduct(prod);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToCategory={(category, subcategory) => {
          setCatalogCategory(category || 'ALL');
          setCatalogSearch(subcategory || '');
          setSelectedProduct(null);
          setActiveView('PRODUCT_DIRECTORY');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToSearch={(query) => {
          setCatalogCategory('ALL');
          setCatalogSearch(query);
          setSelectedProduct(null);
          setActiveView('PRODUCT_DIRECTORY');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 3. MAIN CONTENT CONTAINER WITH ERROR BOUNDARY & VIEW DISPATCH */}
      <main className="flex-1 w-full max-w-[1400px] overflow-x-hidden mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-[calc(100vh-200px)]">
        {/* Lightweight, Schema-Compliant Breadcrumb Navigation (rendered on all views except homepage) */}
        <BreadcrumbNavigation
          activeView={activeView}
          onNavigate={handleNavigate}
          selectedProduct={selectedProduct}
          selectedRfq={selectedRfqForModal}
          catalogCategory={catalogCategory}
          catalogSearch={catalogSearch}
          storefrontCompanyId={storefrontCompanyId}
          selectedBuyerId={selectedBuyerId}
          onClearProduct={() => setSelectedProduct(null)}
          onClearCategory={() => {
            setCatalogCategory('ALL');
            setCatalogSearch('');
          }}
          onBack={() => {
            if (selectedProduct) {
              setSelectedProduct(null);
            } else if (catalogCategory && catalogCategory !== 'ALL') {
              setCatalogCategory('ALL');
              setCatalogSearch('');
            } else {
              handleNavigate('HOMEPAGE');
            }
          }}
        />

        <GlobalErrorBoundary fallbackTitle="TradeHeaven Section View Recovery" onReset={() => setActiveView('HOMEPAGE')}>
          <React.Suspense fallback={
            <TradeHeavenDataLoader 
              size="fullscreen" 
              message="Fetching Trade Heaven Data..." 
              subMessage="Loading international trade views and verified factory directories..." 
            />
          }>
            {(() => {
              switch (activeView) {
              case 'HOMEPAGE':
                return (
                  <TradeWheelHomePage
                    products={products}
                    rfqs={rfqs}
                    selectedCurrency={selectedCurrency}
                    onSelectProduct={handleSelectProduct}
                    onOpenStorefront={handleOpenStorefront}
                    onContactSupplier={handleContactSupplier}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onNavigate={handleNavigate}
                    onOpenLiveTool={handleOpenLiveTool}
                    onSelectRfq={(rfq) => {
                      setSelectedRfqId(rfq.id);
                      setSelectedRfqForModal(rfq);
                    }}
                    onNavigateToCategory={(cat, sub) => {
                      setCatalogCategory(cat || 'ALL');
                      setCatalogSearch(sub || '');
                      setActiveView('PRODUCT_DIRECTORY');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToSuppliers={(sector) => {
                      setActiveView('SUPPLIERS_DIRECTORY');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToRfqs={(cat) => {
                      setActiveView('BUY_LEADS');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isLoadingProducts={isLoadingInitialData}
                    currentUser={currentUser}
                    onOpenRegisterFree={handleOpenRegisterFree}
                  />
                );

              case 'ABOUT_US':
                return <AboutUs onNavigate={handleNavigate} />;
              case 'TRUST_SAFETY':
                return <TrustAndSafety />;
              case 'INSIGHTS':
                return <InsightsBlog onNavigate={handleNavigate} currentUser={currentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />;
              case 'PRODUCT_DIRECTORY':
                return (
                  <div id="product-catalog-section" className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Global Product Catalog &amp; Wholesale Directory
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Browse verified factory inventory across 12 industrial sectors. Compare tiered volume pricing and verify manufacturing certifications.
                      </p>
                    </div>

                    <ProductCatalog
                      products={products}
                      selectedCurrency={selectedCurrency}
                      onSelectProduct={handleSelectProduct}
                      onOpenStorefront={handleOpenStorefront}
                      onContactSupplier={handleContactSupplier}
                      selectedCategory={catalogCategory}
                      onCategoryChange={setCatalogCategory}
                      initialSearch={catalogSearch}
                      isLoading={isLoadingInitialData}
                    />
                  </div>
                );

              case 'RFQ_HUB':
                return (
                  <RfqComparisonView
                    rfqs={rfqs}
                    selectedRfqId={selectedRfqId || rfqs[0]?.id || null}
                    onSelectRfqId={setSelectedRfqId}
                    selectedCurrency={selectedCurrency}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onAcceptQuote={(quote) => {
                      setActiveView('NEGOTIATION_ROOM');
                    }}
                    onOpenRfqModal={(rfq) => setSelectedRfqForModal(rfq)}
                    onOpenBuyerProfile={(buyerId) => {
                      setSelectedBuyerId(buyerId);
                      setActiveView('BUYER_PROFILE');
                    }}
                    onOpenNegotiation={() => setActiveView('NEGOTIATION_ROOM')}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
                    isLoading={isLoadingInitialData}
                  />
                );

              case 'NEGOTIATION_ROOM':
                return (
                  <TradeNegotiationChat
                    selectedCurrency={selectedCurrency}
                    onInitiateEscrow={handleInitiateEscrow}
                    currentUser={currentUser}
                    onOpenStorefront={handleOpenStorefront}
                    onOpenBuyerProfile={(buyerId) => {
                      setSelectedBuyerId(buyerId);
                      setActiveView('BUYER_PROFILE');
                    }}
                    onNavigate={handleNavigate}
                    onOpenContactModal={handleOpenContactModal}
                  />
                );

              case 'DASHBOARD':
                return (
                  <BuyerSupplierDashboard
                    currentUser={currentUser}
                    currentUserRole={currentUser?.role || 'BUYER'}
                    selectedCurrency={selectedCurrency}
                    rfqs={rfqs}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onOpenStorefront={handleOpenStorefront}
                  />
                );

              case 'INCOTERMS_CALCULATOR':
                return (
                  <IncotermsCalculator selectedCurrency={selectedCurrency} />
                );

              case 'PREMIUM_MEMBERSHIP':
                return (
                  <PremiumServicesView
                    selectedCurrency={selectedCurrency}
                    onOpenPaymentCheckout={handleOpenPaymentCheckout}
                    onNavigateToAdmin={isAdmin ? () => setActiveView('PLAN_PRICING_ADMIN') : undefined}
                  />
                );

              case 'POST_SELL_OFFER':
                return (
                  <PostSellOfferView
                    selectedCurrency={selectedCurrency}
                    onProductCreated={handleProductCreated}
                    onNavigate={handleNavigate}
                  />
                );

              case 'BUY_LEADS':
                return (
                  <BuyLeadsView
                    selectedCurrency={selectedCurrency}
                    onSelectRfq={(rfq) => {
                      setSelectedRfqId(rfq.id);
                      setSelectedRfqForModal(rfq);
                    }}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
                    onOpenRegisterFree={handleOpenRegisterFree}
                  />
                );

              case 'SUPPLIERS_DIRECTORY':
                return (
                  <SuppliersDirectoryView
                    selectedCurrency={selectedCurrency}
                    onOpenStorefront={handleOpenStorefront}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
                  />
                );

              case 'BUYERS_DIRECTORY':
                return (
                  <BuyersDirectoryView
                    selectedCurrency={selectedCurrency}
                    onOpenBuyerProfile={(buyerId) => {
                      setSelectedBuyerId(buyerId);
                      setActiveView('BUYER_PROFILE');
                    }}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
                  />
                );

              case 'BUYER_PROFILE':
                return (
                  <BuyerProfilePage
                    buyerId={selectedBuyerId || 'buyer-001'}
                    selectedCurrency={selectedCurrency}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => handleNavigate('PREMIUM_MEMBERSHIP')}
                    onNavigate={handleNavigate}
                    onOpenRfqModal={(rfq) => setSelectedRfqForModal(rfq)}
                  />
                );

              case 'REFUND_POLICY':
                return (
                  <RefundPolicyView onOpenContactModal={() => handleOpenContactModal({ targetType: 'GENERAL' })} />
                );

              case 'PRODUCT_LISTING_POLICY':
                return (
                  <ProductListingPolicyView
                    onNavigate={handleNavigate}
                    onOpenContactModal={handleOpenContactModal}
                  />
                );

              case 'PRIVACY_POLICY':
                return (
                  <PrivacyPolicyView
                    onNavigate={handleNavigate}
                    onOpenContactModal={handleOpenContactModal}
                  />
                );

              case 'TERMS_OF_USE':
                return (
                  <TermsOfUseView
                    onNavigate={handleNavigate}
                    onOpenContactModal={handleOpenContactModal}
                  />
                );

              case 'ONBOARD_WITH_US':
                return (
                  <OnboardWithUsPage
                    currentUser={currentUser}
                    onLogin={user => setCurrentUser(user)}
                    onNavigate={handleNavigate}
                    onOpenCreateRfq={handleOpenCreateRfq}
                  />
                );

              case 'LANDING_PAGE':
                return (
                  <LandingPageView
                    onNavigate={handleNavigate}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onCategorySelect={() => {
                      handleNavigate('PRODUCT_DIRECTORY');
                    }}
                  />
                );

              case 'VENDOR_PROFILE':
                return (
                  <VendorProfilePage
                    companyId={storefrontCompanyId || 'comp-apex-motorsport'}
                    products={products}
                    selectedCurrency={selectedCurrency}
                    onSelectProduct={handleSelectProduct}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => handleNavigate('PREMIUM_MEMBERSHIP')}
                    onNavigate={handleNavigate}
                  />
                );

              case 'COUNTRY_HUB':
                return (
                  <CountryTradeHubView
                    initialCountryId="uk"
                    onOpenProductModal={(title) => {
                      const prod = products.find(p => p && p.title && p.title.toLowerCase().includes((title || '').toLowerCase()));
                      if (prod) setSelectedProduct(prod);
                      else handleOpenContactModal({ targetType: 'GENERAL', targetTitle: `Inquiry: ${title}` });
                    }}
                    onOpenRfqModal={(title) => {
                      handleOpenCreateRfq();
                    }}
                    onOpenContactModal={(supName, cName) => {
                      handleOpenContactModal({
                        targetType: 'SUPPLIER',
                        supplierCompany: cName,
                        targetTitle: `Inquiry for ${supName} (${cName})`
                      });
                    }}
                    onPostRfqForCountry={(req) => {
                      handleOpenCreateRfq();
                    }}
                  />
                );

              case 'CLIENT_ADMIN':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Treasury & Administrative Control Center"
                    description="Access to custodial trade protection releases, user management, and database orchestration requires authenticated administrator credentials."
                    targetViewName="CLIENT_ADMIN"
                  >
                    <AdminDashboard
                      initialTab="DATABASE"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              case 'BULK_ENTITY_CRM':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Bulk Lead & Entity CRM Management"
                    description="Upload, validate, edit, assign, and bulk-sync B2B buyer leads, verified suppliers, RFQs, and trade records."
                    targetViewName="BULK_ENTITY_CRM"
                  >
                    <AdminDashboard
                      initialTab="CRM"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              case 'PLAN_PRICING_ADMIN':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Plan & Pricing Engine (Gemini & Subscriptions)"
                    description="Configure SaaS membership tiers, Gemini context rate limits, and Stripe synchronization with verified administrator credentials."
                    targetViewName="PLAN_PRICING_ADMIN"
                  >
                    <AdminDashboard
                      initialTab="PRICING"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              case 'CMS_MANAGEMENT':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Full-Site CMS & Access Permissions"
                    description="The Full-Site CMS Editor and RBAC Governance Matrix are restricted to verified System Administrators."
                    targetViewName="CMS_MANAGEMENT"
                  >
                    <AdminDashboard
                      initialTab="CMS"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              default:
                return (
                  <TradeWheelHomePage
                    products={products}
                    rfqs={rfqs}
                    selectedCurrency={selectedCurrency}
                    onSelectProduct={handleSelectProduct}
                    onOpenStorefront={handleOpenStorefront}
                    onContactSupplier={handleContactSupplier}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onNavigate={handleNavigate}
                    onOpenLiveTool={handleOpenLiveTool}
                    onSelectRfq={(rfq) => {
                      setSelectedRfqId(rfq.id);
                      setSelectedRfqForModal(rfq);
                    }}
                    onNavigateToCategory={(cat, sub) => {
                      setCatalogCategory(cat || 'ALL');
                      setCatalogSearch(sub || '');
                      setActiveView('PRODUCT_DIRECTORY');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToSuppliers={() => {
                      setActiveView('SUPPLIERS_DIRECTORY');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToRfqs={() => {
                      setActiveView('BUY_LEADS');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isLoadingProducts={isLoadingInitialData}
                    currentUser={currentUser}
                    onOpenRegisterFree={handleOpenRegisterFree}
                  />
                );
            }
          })()}
          </React.Suspense>
        </GlobalErrorBoundary>
      </main>

      {/* 4. OFFICIAL SOCIAL & WHATSAPP NETWORK BAR */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <TradeHeavenSocialBar onContactClick={() => handleOpenContactModal({ targetType: 'GENERAL' })} />
      </div>

      <CustomerReviews />

      {/* 5. GLOBAL FOOTER */}
      <TradeHeavenFooter
        onNavigate={handleNavigate}
        onContactClick={() => handleOpenContactModal({ targetType: 'GENERAL' })}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 6. REAL-TIME AI LIVE CHAT & WHATSAPP DESK WIDGET */}
      <TradeHeavenLiveChatWidget
        currentUser={currentUser}
        onOpenContactModal={() => handleOpenContactModal({ targetType: 'GENERAL' })}
        onOpenRfqModal={handleOpenCreateRfq}
        onOpenStorefront={handleOpenStorefront}
      />

      

      {/* 8. QUICK SECTION LIVE EDIT MODAL (Strictly Creator & Admin Only) */}
      

      {/* 9. ALL MODALS */}
      <React.Suspense fallback={null}>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            selectedCurrency={selectedCurrency}
            onOpenStorefront={handleOpenStorefront}
            onStartNegotiation={() => {
              setSelectedProduct(null);
              setActiveView('NEGOTIATION_ROOM');
            }}
          />
        )}

        {selectedRfqForModal && (
          <RfqDetailModal
            rfq={selectedRfqForModal}
            selectedCurrency={selectedCurrency}
            onClose={() => setSelectedRfqForModal(null)}
            currentUser={currentUser}
            onOpenRegisterFree={handleOpenRegisterFree}
            onOpenUpgradeModal={() => {
              setSelectedRfqForModal(null);
              setActiveView('PREMIUM_MEMBERSHIP');
            }}
            onOpenBuyerProfile={(buyerId) => {
              setSelectedRfqForModal(null);
              setSelectedBuyerId(buyerId);
              setActiveView('BUYER_PROFILE');
            }}
            onOpenNegotiation={() => {
              setSelectedRfqForModal(null);
              setActiveView('NEGOTIATION_ROOM');
            }}
            onAcceptQuote={(quote) => {
              setSelectedRfqForModal(null);
              setActiveView('NEGOTIATION_ROOM');
            }}
          />
        )}

        {storefrontCompanyId && (
          <SupplierStorefrontModal
            companyId={storefrontCompanyId}
            isOpen={Boolean(storefrontCompanyId)}
            onClose={() => setStorefrontCompanyId(null)}
            selectedCurrency={selectedCurrency}
            onSelectProduct={handleSelectProduct}
            onOpenCreateRfq={handleOpenCreateRfq}
            currentUser={currentUser}
            onOpenUpgradeModal={() => {
              setStorefrontCompanyId(null);
              handleNavigate('PREMIUM_MEMBERSHIP');
            }}
          />
        )}

        <RfqCreationModal
          isOpen={isCreateRfqOpen}
          onClose={() => setIsCreateRfqOpen(false)}
          selectedCurrency={selectedCurrency}
          onSubmitRfq={handleRfqCreated}
          onRfqCreated={handleRfqCreated}
        />

        <UnifiedContactInquiryModal
          isOpen={contactModalConfig.isOpen}
          onClose={handleCloseContactModal}
          targetType={contactModalConfig.targetType}
          targetId={contactModalConfig.targetId}
          targetTitle={contactModalConfig.targetTitle}
          targetSubtitle={contactModalConfig.targetSubtitle}
          contactEmail={contactModalConfig.contactEmail}
          contactPhone={contactModalConfig.contactPhone}
          supplierCompany={contactModalConfig.supplierCompany}
          initialQuantity={contactModalConfig.initialQuantity}
          initialPrice={contactModalConfig.initialPrice}
          onSuccess={() => {
            fetchRFQs();
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          initialMode={authModalMode}
          onNavigate={handleNavigate}
          onLogin={user => {
            setCurrentUser(user);
          }}
          onLogout={() => {
            logout();
          }}
        />

        <PaymentCheckoutModal
          isOpen={Boolean(checkoutData)}
          onClose={() => setCheckoutData(null)}
          checkoutData={checkoutData}
          selectedCurrency={selectedCurrency}
          onPaymentSuccess={orderId => {
            // Success
          }}
        />

        <BackendDataManagementModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setAuthModalMode('LOGIN');
            setIsAuthModalOpen(true);
          }}
        />

        {/* Floating SMTP Test Sandbox Widget (Publicly Accessible) - REMOVED */}
      </React.Suspense>
    </div>
  );
};

export default function App() {
  return (
    <GlobalErrorBoundary fallbackTitle="TradeHeaven Marketplace Recovery">
      <GuardedRootView>
        <AuthProvider>
          <SiteContentProvider>
            <LanguageProvider>
              <NotificationProvider><MainApp /></NotificationProvider>
            </LanguageProvider>
          </SiteContentProvider>
        </AuthProvider>
      </GuardedRootView>
    </GlobalErrorBoundary>
  );
}

