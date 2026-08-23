import React, { useState, useEffect } from 'react';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import { 
  ActiveView, 
  Currency, 
  Product, 
  CompanyProfile, 
  RfqRequirement, 
  NegotiationThread, 
  PaymentCheckoutData 
} from './types';
import { MOCK_PRODUCTS, MOCK_COMPANIES, MOCK_RFQS } from './data/mockData';
import { api } from './services/apiService';

// Common Components
import { Header } from './components/marketplace/Header';
import { LiveRfqTicker } from './components/marketplace/LiveRfqTicker';
import { TradeHeavenSocialBar } from './components/common/TradeHeavenSocialBar';
import { TradeHeavenFooter } from './components/common/TradeHeavenFooter';
import { TradeHeavenLiveChatWidget } from './components/common/TradeHeavenLiveChatWidget';
import { FloatingLiveEditorBar } from './components/cms/FloatingLiveEditorBar';
import { LiveSectionEditModal } from './components/cms/LiveSectionEditModal';
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
import { RefundPolicyView } from './components/services/RefundPolicyView';
import { ClientAdminView } from './components/services/ClientAdminView';
import { SiteContentCmsEditor } from './components/cms/SiteContentCmsEditor';
import { CmsPermissionsPanel } from './components/cms/CmsPermissionsPanel';
import { OnboardWithUsPage } from './components/marketplace/OnboardWithUsPage';

// Modals
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { SupplierStorefrontModal } from './components/marketplace/SupplierStorefrontModal';
import { RfqCreationModal } from './components/marketplace/RfqCreationModal';
import { ContactUsModal } from './components/modals/ContactUsModal';
import { AuthModal } from './components/modals/AuthModal';
import { PaymentCheckoutModal } from './components/modals/PaymentCheckoutModal';
import { BackendDataManagementModal } from './components/modals/BackendDataManagementModal';

const MainApp: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    siteContent,
    activeQuickEditSection,
    closeQuickEdit
  } = useSiteContent();

  // Navigation & Currency State
  const [activeView, setActiveView] = useState<ActiveView>('HOMEPAGE');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  // Products and entities in state for live additions
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [storefrontCompanyId, setStorefrontCompanyId] = useState<string | null>(null);
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER' | 'WORK_WITH_US'>('LOGIN');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<PaymentCheckoutData | null>(null);

  // Fetch initial products
  useEffect(() => {
    api.getProducts().then(prods => {
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
    }).catch(err => console.error('[Failed to load products]:', err));
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

  const handleRfqCreated = (newRfq: Partial<RfqRequirement>) => {
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
      title: `Escrow Deposit: ${thread.productTitle}`,
      description: `${thread.orderQuantity} units @ $${thread.currentPriceUsd}/unit (${thread.currentIncoterm}) to ${thread.destinationPort}`,
      amountUsd: thread.currentPriceUsd * thread.orderQuantity,
      type: 'ESCROW_DEPOSIT',
      supplierCompany: thread.supplierCompany
    });
  };

  const handleOpenPaymentCheckout = (data: PaymentCheckoutData) => {
    setCheckoutData(data);
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
      setIsContactModalOpen(true);
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
      setActiveView('CLIENT_ADMIN');
      return;
    }
    if (target === 'TRADE_ESCROW' || target === 'DASHBOARD' || target === 'MY_DASHBOARD') {
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
    if (target === 'REFUND_POLICY' || target === 'REFUND' || target === 'ESCROW_POLICY') {
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
    if (target === 'CMS_MANAGEMENT' || target === 'CMS' || target === 'SITE_EDITOR') {
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
      <LiveRfqTicker onSelectRfq={() => setActiveView('RFQ_HUB')} />

      {/* 2. MAIN MARKETPLACE APP HEADER */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
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
        onOpenContactModal={() => setIsContactModalOpen(true)}
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
                    selectedCurrency={selectedCurrency}
                    onSelectProduct={handleSelectProduct}
                    onOpenStorefront={handleOpenStorefront}
                    onContactSupplier={handleContactSupplier}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onNavigate={handleNavigate}
                    onOpenLiveTool={handleOpenLiveTool}
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
                    />
                  </div>
                );

              case 'RFQ_HUB':
                return (
                  <RfqComparisonView
                    rfqs={MOCK_RFQS}
                    selectedRfqId={MOCK_RFQS[0]?.id || null}
                    onSelectRfqId={() => {}}
                    selectedCurrency={selectedCurrency}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onAcceptQuote={() => {
                      setActiveView('NEGOTIATION_ROOM');
                    }}
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
                    onSelectRfq={() => setActiveView('RFQ_HUB')}
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

              case 'REFUND_POLICY':
                return (
                  <RefundPolicyView onOpenContactModal={() => setIsContactModalOpen(true)} />
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

              case 'CLIENT_ADMIN':
                return (
                  <ClientAdminView
                    selectedCurrency={selectedCurrency}
                    onOpenPaymentCheckout={handleOpenPaymentCheckout}
                    currentUser={currentUser}
                    onUpdateCurrentUser={setCurrentUser}
                  />
                );

              case 'CMS_MANAGEMENT':
                return currentUser?.role === 'ADMIN' || currentUser?.email?.toLowerCase() === 'admin@tradeheaven.net' ? (
                  <div className="space-y-8">
                    <SiteContentCmsEditor />
                    <CmsPermissionsPanel />
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Administrator Access Required</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The Full-Site CMS Editor and RBAC Governance Matrix are restricted to verified System Administrators.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Sign In as Administrator
                      </button>
                      <button
                        onClick={() => setActiveView('HOMEPAGE')}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Return to Homepage
                      </button>
                    </div>
                  </div>
                );

              default:
                return (
                  <NotFoundView
                    attemptedView={String(activeView)}
                    onNavigate={handleNavigate}
                    onOpenContactModal={() => setIsContactModalOpen(true)}
                  />
                );
            }
          })()}
        </GlobalErrorBoundary>
      </main>

      {/* 4. OFFICIAL SOCIAL & WHATSAPP NETWORK BAR */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <TradeHeavenSocialBar onContactClick={() => setIsContactModalOpen(true)} />
      </div>

      {/* 5. GLOBAL FOOTER */}
      <TradeHeavenFooter
        onNavigate={handleNavigate}
        onContactClick={() => setIsContactModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 6. REAL-TIME AI LIVE CHAT & WHATSAPP DESK WIDGET */}
      <TradeHeavenLiveChatWidget
        currentUser={currentUser}
        onOpenContactModal={() => setIsContactModalOpen(true)}
        onOpenRfqModal={handleOpenCreateRfq}
        onOpenStorefront={handleOpenStorefront}
      />

      {/* 7. LIVE VISUAL ON-SCREEN SITE EDITOR BAR */}
      <FloatingLiveEditorBar onNavigate={handleNavigate} />

      {/* 8. QUICK SECTION LIVE EDIT MODAL */}
      <LiveSectionEditModal
        isOpen={Boolean(activeQuickEditSection)}
        onClose={closeQuickEdit}
        sectionKey={activeQuickEditSection}
      />

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

      <ContactUsModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        initialMode={authModalMode}
        onNavigate={handleNavigate}
        onLogin={user => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
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
      <SiteContentProvider>
        <MainApp />
      </SiteContentProvider>
    </GlobalErrorBoundary>
  );
}

