import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
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
import { NotFoundView } from './components/common/NotFoundView';

// Views
const TradeWheelHomePage = React.lazy(() => import('./components/marketplace/TradeWheelHomePage').then(m => ({ default: m.TradeWheelHomePage })));
const ProductCatalog = React.lazy(() => import('./components/marketplace/ProductCatalog').then(m => ({ default: m.ProductCatalog })));
const RfqComparisonView = React.lazy(() => import('./components/marketplace/RfqComparisonView').then(m => ({ default: m.RfqComparisonView })));
const TradeNegotiationChat = React.lazy(() => import('./components/marketplace/TradeNegotiationChat').then(m => ({ default: m.TradeNegotiationChat })));
const BuyerSupplierDashboard = React.lazy(() => import('./components/marketplace/BuyerSupplierDashboard').then(m => ({ default: m.BuyerSupplierDashboard })));
const IncotermsCalculator = React.lazy(() => import('./components/tools/IncotermsCalculator').then(m => ({ default: m.IncotermsCalculator })));
const PremiumServicesView = React.lazy(() => import('./components/services/PremiumServicesView').then(m => ({ default: m.PremiumServicesView })));
const PostSellOfferView = React.lazy(() => import('./components/services/PostSellOfferView').then(m => ({ default: m.PostSellOfferView })));
const BuyLeadsView = React.lazy(() => import('./components/services/BuyLeadsView').then(m => ({ default: m.BuyLeadsView })));
const SuppliersDirectoryView = React.lazy(() => import('./components/services/SuppliersDirectoryView').then(m => ({ default: m.SuppliersDirectoryView })));
const BuyersDirectoryView = React.lazy(() => import('./components/services/BuyersDirectoryView').then(m => ({ default: m.BuyersDirectoryView })));
const RefundPolicyView = React.lazy(() => import('./components/services/RefundPolicyView').then(m => ({ default: m.RefundPolicyView })));
const ClientAdminView = React.lazy(() => import('./components/services/ClientAdminView').then(m => ({ default: m.ClientAdminView })));
const PlanPricingAdminModule = React.lazy(() => import('./components/admin/PlanPricingAdminModule').then(m => ({ default: m.PlanPricingAdminModule })));
const BulkEntityCrmModule = React.lazy(() => import('./components/admin/BulkEntityCrmModule').then(m => ({ default: m.BulkEntityCrmModule })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OnboardWithUsPage = React.lazy(() => import('./components/marketplace/OnboardWithUsPage').then(m => ({ default: m.OnboardWithUsPage })));
const AboutTradeHeavenView = React.lazy(() => import('./components/services/AboutTradeHeavenView').then(m => ({ default: m.AboutTradeHeavenView })));
const LandingPageView = React.lazy(() => import('./components/marketplace/LandingPageView').then(m => ({ default: m.LandingPageView })));
const VendorProfilePage = React.lazy(() => import('./components/vendor/VendorProfilePage').then(m => ({ default: m.VendorProfilePage })));
const BuyerProfilePage = React.lazy(() => import('./components/buyer/BuyerProfilePage').then(m => ({ default: m.BuyerProfilePage })));
const CountryTradeHubView = React.lazy(() => import('./components/marketplace/CountryTradeHubView').then(m => ({ default: m.CountryTradeHubView })));

// Modals
const ProductDetailModal = React.lazy(() => import('./components/marketplace/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
const RfqDetailModal = React.lazy(() => import('./components/marketplace/RfqDetailModal').then(m => ({ default: m.RfqDetailModal })));
const SupplierStorefrontModal = React.lazy(() => import('./components/marketplace/SupplierStorefrontModal').then(m => ({ default: m.SupplierStorefrontModal })));
const RfqCreationModal = React.lazy(() => import('./components/marketplace/RfqCreationModal').then(m => ({ default: m.RfqCreationModal })));
const UnifiedContactInquiryModal = React.lazy(() => import('./components/modals/UnifiedContactInquiryModal').then(m => ({ default: m.UnifiedContactInquiryModal })));
const AuthModal = React.lazy(() => import('./components/modals/AuthModal').then(m => ({ default: m.AuthModal })));
const PaymentCheckoutModal = React.lazy(() => import('./components/modals/PaymentCheckoutModal').then(m => ({ default: m.PaymentCheckoutModal })));
const BackendDataManagementModal = React.lazy(() => import('./components/modals/BackendDataManagementModal').then(m => ({ default: m.BackendDataManagementModal })));

import { bigrockApi } from './services/bigrockApi';
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
import { GuardedRootView } from './components/admin/GuardedRootView';
import { Loader2, Mail, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { EditableText } from './components/EditableText';
import { EditableImage } from './components/EditableImage';

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

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceError, setMaintenanceError] = useState<{ message: string; code?: string } | null>(null);

  // Global listener for database/insertion errors to activate Maintenance Mode
  useEffect(() => {
    const handleDbError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; code?: string }>;
      setMaintenanceMode(true);
      if (customEvent.detail) {
        setMaintenanceError(customEvent.detail);
      } else {
        setMaintenanceError({ message: 'A database synchronization error was detected during transaction execution.' });
      }
    };
    window.addEventListener('tradeheaven_database_error', handleDbError);
    return () => window.removeEventListener('tradeheaven_database_error', handleDbError);
  }, []);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view) setActiveView(view as ActiveView);
      else setActiveView('HOMEPAGE');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when activeView changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (activeView === 'HOMEPAGE') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', activeView);
      }
      // Only push if the URL actually changed to prevent infinite loops with popstate
      if (url.toString() !== window.location.href) {
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [activeView]);

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

  // Dynamic SEO & Meta Tags based on active view
  useEffect(() => {
    let title = 'Trade Heaven | Global B2B Wholesale Marketplace';
    let description = 'Connect with verified global suppliers, compare live RFQs, and secure wholesale deals with Trade Heaven\'s secure B2B platform.';
    let canonical = 'https://tradeheaven.com';
    let ogImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200'; // Global premium B2B hero image

    switch (activeView) {
      case 'HOMEPAGE':
      case 'LANDING_PAGE':
        title = 'Trade Heaven | Secure Global B2B Wholesale Marketplace';
        description = 'Discover verified factory inventory, connect with global suppliers, and trade securely with Trade Heaven.';
        canonical = 'https://tradeheaven.com';
        ogImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'PRODUCT_DIRECTORY':
        title = 'Global Product Catalog & Wholesale Directory | Trade Heaven';
        description = 'Browse verified factory inventory across industrial sectors. Compare tiered volume pricing and source high-quality products.';
        canonical = 'https://tradeheaven.com/?view=PRODUCT_DIRECTORY';
        ogImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'RFQ_HUB':
        title = 'Live B2B RFQs & Tenders | Trade Heaven';
        description = 'View live Requests for Quotation (RFQs), submit wholesale quotes, and connect with verified buyers worldwide.';
        canonical = 'https://tradeheaven.com/?view=RFQ_HUB';
        ogImage = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'SUPPLIERS_DIRECTORY':
        title = 'Verified Global Suppliers & Exporters | Trade Heaven';
        description = 'Find and partner with verified manufacturers, exporters, and wholesale suppliers from around the globe.';
        canonical = 'https://tradeheaven.com/?view=SUPPLIERS_DIRECTORY';
        ogImage = 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'BUYERS_DIRECTORY':
        title = 'Verified Global Buyers & Importers | Trade Heaven';
        description = 'Connect with verified international buyers and importers actively seeking wholesale product sourcing.';
        canonical = 'https://tradeheaven.com/?view=BUYERS_DIRECTORY';
        ogImage = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'BUY_LEADS':
        title = 'Active Wholesale Buy Leads | Trade Heaven';
        description = 'Access active buy leads from verified global importers. Quote on RFQs and grow your export business.';
        canonical = 'https://tradeheaven.com/?view=BUY_LEADS';
        ogImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'TRUST_SAFETY':
        title = 'Trust & Safety Center | Trade Heaven';
        description = 'Learn how Trade Heaven ensures secure international B2B transactions through supplier verification and escrow protection.';
        canonical = 'https://tradeheaven.com/?view=TRUST_SAFETY';
        ogImage = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'INSIGHTS':
        title = 'B2B Trade Insights & Industry News | Trade Heaven';
        description = 'Expert insights on global B2B trade, physical commodity trading, supply chain due diligence, and verified sourcing.';
        canonical = 'https://tradeheaven.com/?view=INSIGHTS';
        ogImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'PREMIUM_MEMBERSHIP':
        title = 'Premium B2B Supplier Membership | Trade Heaven';
        description = 'Upgrade your supplier profile to access priority RFQs, verified buyer data, and enhanced storefront visibility.';
        canonical = 'https://tradeheaven.com/?view=PREMIUM_MEMBERSHIP';
        ogImage = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'INCOTERMS_CALCULATOR':
        title = 'Incoterms Cost & Risk Calculator | Trade Heaven';
        description = 'Calculate shipping costs and understand risk transfers for global trade using our interactive Incoterms tool.';
        canonical = 'https://tradeheaven.com/?view=INCOTERMS_CALCULATOR';
        ogImage = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'ABOUT_US':
        title = 'About Trade Heaven | Verified B2B Marketplace';
        description = 'Learn about Trade Heaven\'s mission to connect global wholesale buyers and verified suppliers safely.';
        canonical = 'https://tradeheaven.com/?view=ABOUT_US';
        ogImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200';
        break;
      case 'VENDOR_PROFILE':
        title = 'Verified Supplier Storefront | Trade Heaven';
        description = 'View verified supplier profiles, browse product catalogs, and review manufacturing certifications on Trade Heaven.';
        canonical = 'https://tradeheaven.com/?view=VENDOR_PROFILE';
        ogImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200';
        break;
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

    // 2. Set description meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:description', description, true);
    setMetaTag('name', 'twitter:description', description);

    // 3. Set OpenGraph & Twitter title & metadata
    setMetaTag('property', 'og:title', title, true);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('property', 'og:url', canonical, true);
    setMetaTag('property', 'og:type', 'website', true);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    // 4. Set OpenGraph & Twitter image tags
    setMetaTag('property', 'og:image', ogImage, true);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Update or create canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }
  }, [activeView]);

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
        buyer_email: (newRfq as any).buyerEmail || currentUser?.email || 'buyer@tradeheaven.net',
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

  const handleNavigate = (view: ActiveView | string) => {
    const target = String(view || '').trim().toUpperCase();

    // Reset modals on navigation
    setSelectedProduct(null);
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

  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans antialiased">
        {/* Banner */}
        <div className="bg-amber-500 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide">
          ⚠️ DATABASE COOPERATIVE ALERT &bull; COLD FAILSAFE STANDBY WIDGET ACTIVE
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full">
          <div className="w-20 h-20 bg-amber-100 border border-amber-300 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
            <svg className="w-10 h-10 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center tracking-tight leading-none mb-3">
            System Undergoing Maintenance
          </h1>
          <p className="text-slate-600 text-center max-w-lg mb-8 leading-relaxed text-base">
            We detected a database synchronization or transaction exception. To safeguard active negotiations and B2B global trade assets, our failsafe circuit-breaker has engaged Standby Failsafe Mode.
          </p>

          {/* Error Details Card */}
          <div className="w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-6 mb-8 overflow-hidden relative text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Logs & Trace</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {maintenanceError?.code || 'DATABASE_INSERT_ERROR'}
              </span>
            </div>
            
            <div className="space-y-3 font-mono text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 select-none shrink-0">[Exception]:</span>
                <span className="font-semibold break-all text-red-600">
                  {maintenanceError?.message || 'Database insertion mismatch during execution.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 select-none shrink-0">[Timestamp]:</span>
                <span>{new Date().toISOString()}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 select-none shrink-0">[Subsystem]:</span>
                <span className="text-indigo-600">PDO MySQL Gateway (api.php)</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-slate-500">
                Our operations &amp; database engineering teams have been dispatched automatically via system-level webhooks.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => {
                // Clear state and attempt re-initialization
                setMaintenanceMode(false);
                setMaintenanceError(null);
                initializeData();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
              </svg>
              <span>Attempt Recovery</span>
            </button>
            <a
              href="mailto:sankalprajput15@gmail.com"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold transition-all duration-200 inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Contact System Architect</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white py-6 px-4 text-center">
          <p className="text-xs text-slate-400">
            Trade Heaven Global Systems Ltd &bull; Swiss Custodial Ledger Persistence &bull; &copy; 2026 All Rights Reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white font-sans">
      {/* Scroll restoration anchor */}
      <ScrollToTop activeView={activeView} />

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
      />

      {/* 3. MAIN CONTENT CONTAINER WITH ERROR BOUNDARY & VIEW DISPATCH */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <GlobalErrorBoundary fallbackTitle="TradeHeaven Section View Recovery" onReset={() => setActiveView('HOMEPAGE')}>
          <React.Suspense fallback={
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium animate-pulse">Loading dynamic view...</p>
            </div>
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
                  />
                );

              case 'ABOUT_US':
                return <AboutUs onNavigate={handleNavigate} />;
              case 'TRUST_SAFETY':
                return <TrustAndSafety />;
              case 'INSIGHTS':
                return <InsightsBlog onNavigate={handleNavigate} />;
              case 'PRODUCT_DIRECTORY':
                return (
                  <div className="space-y-6">
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
                  />
                );

              case 'NEGOTIATION_ROOM':
                return (
                  <TradeNegotiationChat
                    selectedCurrency={selectedCurrency}
                    onInitiateEscrow={handleInitiateEscrow}
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
                      const prod = products.find(p => p.title.toLowerCase().includes(title.toLowerCase()));
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
                  />
                );
            }
          })()}
          </React.Suspense>
        </GlobalErrorBoundary>
      </main>

      {/* 4. OFFICIAL SOCIAL & WHATSAPP NETWORK BAR */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
            <MainApp />
          </SiteContentProvider>
        </AuthProvider>
      </GuardedRootView>
    </GlobalErrorBoundary>
  );
}

