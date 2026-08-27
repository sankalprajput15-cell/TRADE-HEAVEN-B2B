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
import { TradeHeavenFooter } from './components/common/TradeHeavenFooter';
import { TradeHeavenLiveChatWidget } from './components/common/TradeHeavenLiveChatWidget';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { NotFoundView } from './components/common/NotFoundView';

// Views
import { TradeWheelHomePage } from './components/marketplace/TradeWheelHomePage';
import { ProductCatalog } from './components/marketplace/ProductCatalog';
import { RfqComparisonView } from './components/marketplace/RfqComparisonView';
import { TradeNegotiationChat } from './components/marketplace/TradeNegotiationChat';
import { BuyerSupplierDashboard } from './components/marketplace/BuyerSupplierDashboard';
import { IncotermsCalculator } from './components/tools/IncotermsCalculator';
import { PremiumServicesView } from './components/services/PremiumServicesView';
import { PostSellOfferView } from './components/services/PostSellOfferView';
import { BuyLeadsView } from './components/services/BuyLeadsView';
import { SuppliersDirectoryView } from './components/services/SuppliersDirectoryView';
import { BuyersDirectoryView } from './components/services/BuyersDirectoryView';
import { RefundPolicyView } from './components/services/RefundPolicyView';
import { ClientAdminView } from './components/services/ClientAdminView';
import { PlanPricingAdminModule } from './components/admin/PlanPricingAdminModule';
import { OnboardWithUsPage } from './components/marketplace/OnboardWithUsPage';
import { VendorProfilePage } from './components/vendor/VendorProfilePage';
import { BuyerProfilePage } from './components/buyer/BuyerProfilePage';

// Modals
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { RfqDetailModal } from './components/marketplace/RfqDetailModal';
import { SupplierStorefrontModal } from './components/marketplace/SupplierStorefrontModal';
import { RfqCreationModal } from './components/marketplace/RfqCreationModal';
import { UnifiedContactInquiryModal } from './components/modals/UnifiedContactInquiryModal';
import { AuthModal } from './components/modals/AuthModal';
import { PaymentCheckoutModal } from './components/modals/PaymentCheckoutModal';
import { BackendDataManagementModal } from './components/modals/BackendDataManagementModal';
import { bigrockApi } from './services/bigrockApi';
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
import { GuardedRootView } from './components/admin/GuardedRootView';
import { Loader2 } from 'lucide-react';
import { EditableText } from './components/EditableText';
import { EditableImage } from './components/EditableImage';

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

  // Navigation & Currency State - Strictly defaults to public marketplace landing
  const [activeView, setActiveView] = useState<ActiveView>('HOMEPAGE');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

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

  // Fetch live RFQs from BigRock PHP API (GET /api.php?action=get_rfqs)
  const fetchRFQs = async () => {
    try {
      const loadedRfqs = await apiClient.getRfqs();
      if (Array.isArray(loadedRfqs) && loadedRfqs.length > 0) {
        setRfqs(loadedRfqs as any);
        if (loadedRfqs.length > 0) {
          setSelectedRfqId(prev => (prev && loadedRfqs.some(r => r.id === prev)) ? prev : loadedRfqs[0].id);
        }
      }
    } catch (err) {
      console.error('[Failed to load BigRock rfqs]:', err);
    }
  };

  // Fetch live Products/Listings
  const fetchProducts = async () => {
    try {
      const prods = await api.getProducts();
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    } catch (err) {
      console.error('[Failed to load products]:', err);
    }
  };

  // Async Initialization on Mount
  useEffect(() => {
    // 1. Fetch live data with Promise.allSettled to guarantee UI never hangs
    const initializeData = async () => {
      setIsLoadingInitialData(true);
      await Promise.allSettled([
        fetchProducts(),
        fetchRFQs()
      ]);
      setIsLoadingInitialData(false);
    };

    initializeData();

    // 2. Listen for custom RFQ creation / refresh triggers
    const handleRfqRefresh = () => {
      fetchRFQs();
    };
    window.addEventListener('tradeheaven_rfq_created', handleRfqRefresh);

    return () => {
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
    const adminViews: ActiveView[] = ['CLIENT_ADMIN', 'PLAN_PRICING_ADMIN', 'CMS_MANAGEMENT'];
    if (adminViews.includes(activeView) && (!currentUser || !isAdmin)) {
      setActiveView('HOMEPAGE');
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
    }
  }, [activeView, currentUser, isAdmin]);

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
                    <ClientAdminView
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      currentUser={currentUser}
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
                    <PlanPricingAdminModule
                      currentUserRole={currentUser?.role}
                      onNavigateView={handleNavigate}
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
                    <div className="space-y-8">
                      
                      
                    </div>
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
        </GlobalErrorBoundary>
      </main>

      {/* 4. OFFICIAL SOCIAL & WHATSAPP NETWORK BAR */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <TradeHeavenSocialBar onContactClick={() => handleOpenContactModal({ targetType: 'GENERAL' })} />
      </div>

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

