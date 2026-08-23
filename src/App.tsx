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
    });
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
    if (view === 'POST_BUY_REQUIREMENT') {
      setIsCreateRfqOpen(true);
      return;
    }
    if (view === 'CONTACT_US') {
      setIsContactModalOpen(true);
      return;
    }
    if (view === 'TRADE_TOOLS') {
      setActiveView('INCOTERMS_CALCULATOR');
      return;
    }
    if (view === 'PREMIUM_PLANS' || view === 'PREMIUM_SERVICES') {
      setActiveView('PREMIUM_MEMBERSHIP');
      return;
    }
    if (view === 'CLIENT_PORTAL') {
      setActiveView('CLIENT_ADMIN');
      return;
    }
    if (view === 'TRADE_ESCROW') {
      setActiveView('DASHBOARD');
      return;
    }
    if (view === 'MARKETPLACE_HOME') {
      setActiveView('HOMEPAGE');
      return;
    }
    if (view === 'SELLER_OFFER') {
      setActiveView('POST_SELL_OFFER');
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white font-sans">
      
      {/* 1. TOP ANNOUNCEMENT & LIVE RFQ TICKER */}
      <LiveRfqTicker onRfqClick={() => setActiveView('RFQ_HUB')} />

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

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeView === 'HOMEPAGE' && (
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
        )}

        {activeView === 'PRODUCT_DIRECTORY' && (
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
        )}

        {activeView === 'RFQ_HUB' && (
          <RfqComparisonView
            selectedCurrency={selectedCurrency}
            onOpenCreateRfq={handleOpenCreateRfq}
            onAcceptQuote={(rfq, quote) => {
              setActiveView('NEGOTIATION_ROOM');
            }}
          />
        )}

        {activeView === 'NEGOTIATION_ROOM' && (
          <TradeNegotiationChat
            selectedCurrency={selectedCurrency}
            onInitiateEscrow={handleInitiateEscrow}
          />
        )}

        {activeView === 'DASHBOARD' && (
          <BuyerSupplierDashboard
            currentUserRole={currentUser?.role || 'BUYER'}
            selectedCurrency={selectedCurrency}
            onOpenCreateRfq={handleOpenCreateRfq}
            onOpenStorefront={handleOpenStorefront}
          />
        )}

        {activeView === 'INCOTERMS_CALCULATOR' && (
          <IncotermsCalculator selectedCurrency={selectedCurrency} />
        )}

        {activeView === 'PREMIUM_MEMBERSHIP' && (
          <PremiumServicesView
            selectedCurrency={selectedCurrency}
            onOpenPaymentCheckout={handleOpenPaymentCheckout}
          />
        )}

        {activeView === 'POST_SELL_OFFER' && (
          <PostSellOfferView
            selectedCurrency={selectedCurrency}
            onProductCreated={handleProductCreated}
          />
        )}

        {activeView === 'BUY_LEADS' && (
          <BuyLeadsView
            selectedCurrency={selectedCurrency}
            onSelectRfq={() => setActiveView('RFQ_HUB')}
            onOpenCreateRfq={handleOpenCreateRfq}
            currentUser={currentUser}
            onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
          />
        )}

        {activeView === 'SUPPLIERS_DIRECTORY' && (
          <SuppliersDirectoryView
            selectedCurrency={selectedCurrency}
            onOpenStorefront={handleOpenStorefront}
            currentUser={currentUser}
            onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
          />
        )}

        {activeView === 'REFUND_POLICY' && (
          <RefundPolicyView onOpenContactModal={() => setIsContactModalOpen(true)} />
        )}

        {activeView === 'ONBOARD_WITH_US' && (
          <OnboardWithUsPage
            currentUser={currentUser}
            onLogin={user => setCurrentUser(user)}
            onNavigate={handleNavigate}
            onOpenCreateRfq={handleOpenCreateRfq}
          />
        )}

        {activeView === 'CLIENT_ADMIN' && (
          <ClientAdminView
            selectedCurrency={selectedCurrency}
            onOpenPaymentCheckout={handleOpenPaymentCheckout}
            currentUser={currentUser}
            onUpdateCurrentUser={setCurrentUser}
          />
        )}

        {activeView === 'CMS_MANAGEMENT' && (
          currentUser?.role === 'ADMIN' || currentUser?.email?.toLowerCase() === 'admin@tradeheaven.net' ? (
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
          )
        )}
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
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          selectedCurrency={selectedCurrency}
          onOpenStorefront={handleOpenStorefront}
          onStartNegotiation={prod => {
            setSelectedProduct(null);
            setActiveView('NEGOTIATION_ROOM');
          }}
          onOpenCheckout={prod => {
            setSelectedProduct(null);
            setCheckoutData({
              planId: prod.id,
              title: prod.title,
              description: `MOQ Sample / Initial Order: ${prod.moq} ${prod.moqUnit} @ $${prod.priceTiers[0]?.priceUsd || 100}/unit`,
              amountUsd: prod.moq * (prod.priceTiers[0]?.priceUsd || 100),
              type: 'ESCROW_DEPOSIT',
              supplierCompany: prod.supplierName
            });
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
      />
    </div>
  );
};

export default function App() {
  return (
    <SiteContentProvider>
      <MainApp />
    </SiteContentProvider>
  );
}
