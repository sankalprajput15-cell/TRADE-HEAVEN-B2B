import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { productImageManagerService } from './services/productImageManagerService';
import { MOCK_PRODUCTS, MOCK_RFQS, CATEGORIES_TREE, MOCK_COMPANIES, MOCK_BUYER_PROFILES } from './data/mockData';
import { ALL_COUNTRY_ITEMS } from './data/countriesData';

// Common Components
import { Header } from './components/marketplace/Header';
import { LiveRfqTicker } from './components/marketplace/LiveRfqTicker';
import { TradeHeavenSocialBar } from './components/common/TradeHeavenSocialBar';
import { TradeHeavenFooter } from './components/common/TradeHeavenFooter';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { SEOManager } from './components/common/SEOManager';
import { BreadcrumbNavigation } from './components/common/BreadcrumbNavigation';
import { NotFoundView } from './components/common/NotFoundView';
import { TradeWheelHomePage } from './components/marketplace/TradeWheelHomePage';
import { PlatformAnnouncementBanner } from './components/marketplace/PlatformAnnouncementBanner';
import { CustomerReviews } from './components/marketplace/CustomerReviews';
import { TradeHeavenLiveChatWidget } from './components/common/TradeHeavenLiveChatWidget';
import { ProductCatalog } from './components/marketplace/ProductCatalog';

// Core High-Traffic Directory Views (Imported directly to prevent dynamic chunk fetch errors in Chrome after deployments)
import { SuppliersDirectoryView } from './components/services/SuppliersDirectoryView';
import { BuyLeadsView } from './components/services/BuyLeadsView';
import { BuyersDirectoryView } from './components/services/BuyersDirectoryView';
import { PremiumServicesView } from './components/services/PremiumServicesView';
import { BuyerSupplierDashboard } from './components/marketplace/BuyerSupplierDashboard';
import { VerifiedSupplierDedicatedDashboard } from './components/vendor/VerifiedSupplierDedicatedDashboard';

// Helper for retryable lazy loaded views with automatic cache-busting reload and resilient fallback recovery
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default?: T; [key: string]: any }>,
  namedExport?: string
) {
  return React.lazy(async () => {
    const ChunkRecoveryView: React.FC<any> = () => (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Updating Marketplace Section</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          A fresh version of this section is ready. If it didn't reload automatically, click below to refresh.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Refresh Page
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );

    const resolveExport = (module: any): { default: T } => {
      if (module && 'default' in module && module.default) {
        return { default: module.default as T };
      }
      if (namedExport && module && module[namedExport]) {
        return { default: module[namedExport] as T };
      }
      const firstKey = module ? Object.keys(module)[0] : undefined;
      if (firstKey && module[firstKey]) {
        return { default: module[firstKey] as T };
      }
      return { default: ChunkRecoveryView as unknown as T };
    };

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(res => setTimeout(res, 350 * attempt));
        }
        const module = await componentImport();
        return resolveExport(module);
      } catch (err) {
        if (attempt === 2) {
          console.warn('[lazyWithRetry] Module load failed after retries for:', namedExport || 'module', err);
        }
      }
    }

    // Trigger loop-guarded automatic reload for Chrome post-deploy chunk mismatch
    if (typeof window !== 'undefined') {
      try {
        const lastReload = Number(sessionStorage.getItem('th_chunk_reload_lock') || 0);
        if (Date.now() - lastReload > 25000) {
          sessionStorage.setItem('th_chunk_reload_lock', String(Date.now()));
          window.location.reload();
        }
      } catch {}
    }

    return { default: ChunkRecoveryView as unknown as T };
  });
}

// Views
const RfqComparisonView = lazyWithRetry(() => import('./components/marketplace/RfqComparisonView'), 'RfqComparisonView');
const TradeNegotiationChat = lazyWithRetry(() => import('./components/marketplace/TradeNegotiationChat'), 'TradeNegotiationChat');
const IncotermsCalculator = lazyWithRetry(() => import('./components/tools/IncotermsCalculator'), 'IncotermsCalculator');
const PostSellOfferView = lazyWithRetry(() => import('./components/services/PostSellOfferView'), 'PostSellOfferView');

const RefundPolicyView = lazyWithRetry(() => import('./components/services/RefundPolicyView'), 'RefundPolicyView');
const ProductListingPolicyView = lazyWithRetry(() => import('./components/services/ProductListingPolicyView'), 'ProductListingPolicyView');
const PrivacyPolicyView = lazyWithRetry(() => import('./components/services/PrivacyPolicyView'), 'PrivacyPolicyView');
const TermsOfUseView = lazyWithRetry(() => import('./components/services/TermsOfUseView'), 'TermsOfUseView');

const AdminDashboard = lazyWithRetry(() => import('./components/admin/AdminDashboard'), 'AdminDashboard');
const MailDeliveryHistoryPage = lazyWithRetry(() => import('./components/admin/MailDeliveryHistoryPage'), 'MailDeliveryHistoryPage');
const ClientAdminView = lazyWithRetry(() => import('./components/services/ClientAdminView'), 'ClientAdminView');
const PlanPricingAdminModule = lazyWithRetry(() => import('./components/admin/PlanPricingAdminModule'), 'PlanPricingAdminModule');
const BulkEntityCrmModule = lazyWithRetry(() => import('./components/admin/BulkEntityCrmModule'), 'BulkEntityCrmModule');
const AboutUs = lazyWithRetry(() => import('./components/marketplace/AboutUs'), 'AboutUs');
const TrustAndSafety = lazyWithRetry(() => import('./components/marketplace/TrustAndSafety'), 'TrustAndSafety');
const InsightsBlog = lazyWithRetry(() => import('./components/marketplace/InsightsBlog'), 'InsightsBlog');
const TradeHeavenMediatorView = lazyWithRetry(() => import('./components/marketplace/TradeHeavenMediatorView'), 'TradeHeavenMediatorView');

const OnboardWithUsPage = lazyWithRetry(() => import('./components/marketplace/OnboardWithUsPage'), 'OnboardWithUsPage');
const AboutTradeHeavenView = lazyWithRetry(() => import('./components/services/AboutTradeHeavenView'), 'AboutTradeHeavenView');
const LandingPageView = lazyWithRetry(() => import('./components/marketplace/LandingPageView'), 'LandingPageView');
const VendorProfilePage = lazyWithRetry(() => import('./components/vendor/VendorProfilePage'), 'VendorProfilePage');
const BuyerProfilePage = lazyWithRetry(() => import('./components/buyer/BuyerProfilePage'), 'BuyerProfilePage');
const CountryTradeHubView = lazyWithRetry(() => import('./components/marketplace/CountryTradeHubView'), 'CountryTradeHubView');
const DedicatedTopUpWalletPage = lazyWithRetry(() => import('./components/marketplace/DedicatedTopUpWalletPage'), 'DedicatedTopUpWalletPage');
const SupplierBankWithdrawalLandingPage = lazyWithRetry(() => import('./components/marketplace/SupplierBankWithdrawalLandingPage'), 'SupplierBankWithdrawalLandingPage');
const DirectSiteTransferGuidePage = lazyWithRetry(() => import('./components/marketplace/DirectSiteTransferGuidePage'), 'DirectSiteTransferGuidePage');
import { TradeAssuranceCertificateView } from './components/services/TradeAssuranceCertificateView';
import { B2BTrustCertificatePage } from './components/services/B2BTrustCertificatePage';

// Core Interactive Modals - Lazy loaded on-demand to keep initial load lightweight
const ProductDetailModal = lazyWithRetry(() => import('./components/marketplace/ProductDetailModal'), 'ProductDetailModal');
const RfqDetailModal = lazyWithRetry(() => import('./components/marketplace/RfqDetailModal'), 'RfqDetailModal');
const SupplierStorefrontModal = lazyWithRetry(() => import('./components/marketplace/SupplierStorefrontModal'), 'SupplierStorefrontModal');
const RfqCreationModal = lazyWithRetry(() => import('./components/marketplace/RfqCreationModal'), 'RfqCreationModal');
const UnifiedContactInquiryModal = lazyWithRetry(() => import('./components/modals/UnifiedContactInquiryModal'), 'UnifiedContactInquiryModal');
const AuthModal = lazyWithRetry(() => import('./components/modals/AuthModal'), 'AuthModal');
const PaymentCheckoutModal = lazyWithRetry(() => import('./components/modals/PaymentCheckoutModal'), 'PaymentCheckoutModal');
const BackendDataManagementModal = lazyWithRetry(() => import('./components/modals/BackendDataManagementModal'), 'BackendDataManagementModal');
const CustomShareModal = lazyWithRetry(() => import('./components/modals/CustomShareModal'), 'CustomShareModal');
import { 
  CustomLinkTarget, 
  resolveSupplierId, 
  resolveProduct, 
  resolveRfq, 
  resolveBuyerId, 
  VIEW_ALIASES, 
  SupplierTab, 
  RfqModalTab, 
  BuyerModalTab 
} from './utils/customLinkService';
import { DETAILED_VENDOR_PROFILES } from './data/detailedVendorProfiles';

import { bigrockApi } from './services/bigrockApi';
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
import { GuardedRootView } from './components/admin/GuardedRootView';
import { Loader2, Mail, CheckCircle2, AlertCircle, Send, Tag, X, Home, Package, FileText, Landmark, LayoutDashboard } from 'lucide-react';
import { TradeHeavenDataLoader } from './components/common/TradeHeavenDataLoader';
import { EditableText } from './components/EditableText';
import { EditableImage } from './components/EditableImage';
import { getDynamicHeroImageForView } from './utils/heroImageOptimization';
import { OptimizedHeroImage } from './components/common/OptimizedHeroImage';

interface ParsedEmailLinkRoute {
  isEmailLink: boolean;
  msTrk: string | null;
  forcedView: ActiveView | null;
  action: string | null;
  payZac: boolean;
  email: string | null;
  company: string | null;
  decisionMaker: string | null;
  address: string | null;
  paymentMethod: string | null;
  planId: string | null;
  amountUsd: number | null;
}

/**
 * Centralized Email Link Parser:
 * Parses incoming 'ms_trk' and custom email query parameters ('view', 'email_view',
 * 'target_view', 'action', 'pay_zac', 'policy', 'case_id', 'ticket', 'email', 'company', etc.)
 * and resolves the exact target ActiveView to force after initialization.
 */
function parseIncomingEmailLinkParams(rawSearch: string): ParsedEmailLinkRoute {
  const params = new URLSearchParams(rawSearch || '');
  const msTrk = (params.get('ms_trk') || params.get('trackingId') || params.get('trk') || '').trim() || null;
  const rawView = (
    params.get('view') ||
    params.get('email_view') ||
    params.get('target_view') ||
    params.get('page') ||
    ''
  ).trim();
  const action = (params.get('action') || '').trim().toLowerCase() || null;
  const payZac = params.get('pay_zac') === '1' || params.get('pay_zac') === 'true';
  const policy = (params.get('policy') || '').trim().toLowerCase();
  const caseId = (params.get('case_id') || params.get('ticket') || params.get('ref') || '').trim();
  const email = (params.get('email') || params.get('clientEmail') || params.get('recipient') || '').trim() || null;
  const company = (params.get('company') || params.get('companyName') || '').trim() || null;
  const decisionMaker = (params.get('decisionMaker') || '').trim() || null;
  const address = (params.get('address') || '').trim() || null;
  const paymentMethod = (params.get('paymentMethod') || '').trim() || null;
  const planId = (params.get('planId') || '').trim() || null;
  const rawAmount = Number(params.get('amount') || params.get('amountUsd'));
  const amountUsd = !Number.isNaN(rawAmount) && rawAmount > 0 ? rawAmount : null;

  const isEmailLink = Boolean(
    msTrk ||
      payZac ||
      action === 'renew-membership' ||
      action === 'pay-balance' ||
      action === 'refund-policy' ||
      action === 'case-closed' ||
      policy ||
      caseId ||
      params.get('utm_source') === 'email' ||
      params.get('from_email') === '1' ||
      (rawView && (msTrk || email || company || caseId))
  );

  let forcedView: ActiveView | null = null;

  // 1. Explicit view query param resolution
  if (rawView) {
    const lower = rawView.toLowerCase();
    const upper = rawView.toUpperCase();
    if (VIEW_ALIASES[lower]) {
      forcedView = VIEW_ALIASES[lower];
    } else if (upper === 'PRICING' || upper === 'PLANS' || upper === 'MEMBERSHIP') {
      forcedView = 'PREMIUM_MEMBERSHIP';
    } else if (upper === 'REFUND' || upper === 'REFUND_POLICY') {
      forcedView = 'REFUND_POLICY';
    } else if (upper === 'DASHBOARD' || upper === 'PORTAL' || upper === 'SUPPLIER_PORTAL' || upper === 'SUPPLIER_DASHBOARD') {
      forcedView = 'DASHBOARD';
    } else {
      forcedView = upper as ActiveView;
    }
  }

  // 2. Custom email action / policy / checkout query param resolution
  if (!forcedView) {
    if (payZac || action === 'renew-membership' || action === 'pay-balance') {
      forcedView = 'PREMIUM_MEMBERSHIP';
    } else if (policy === 'refund' || action === 'refund-policy' || caseId.toUpperCase().includes('ESC-REF')) {
      forcedView = 'REFUND_POLICY';
    } else if (policy === 'terms') {
      forcedView = 'TERMS_OF_USE';
    } else if (policy === 'privacy') {
      forcedView = 'PRIVACY_POLICY';
    } else if (action === 'case-closed' || action === 'portal-dashboard') {
      forcedView = 'DASHBOARD';
    } else if (action === 'post-sell') {
      forcedView = 'POST_SELL_OFFER';
    } else if (params.get('article') || params.get('post')) {
      forcedView = 'INSIGHTS';
    } else if (params.get('buyer') || params.get('buyerId')) {
      forcedView = 'BUYER_PROFILE';
    } else if (params.get('cert') || params.get('certificate')) {
      forcedView = 'TRADE_ASSURANCE_CERTIFICATE';
    } else if (params.get('supplier') || params.get('supplierId') || params.get('vendor')) {
      forcedView = 'VENDOR_PROFILE';
    }
  }

  // 3. Fallback inference directly from 'ms_trk' token when email clients strip or omit 'view'
  if (!forcedView && msTrk) {
    const trkLower = msTrk.toLowerCase();
    if (trkLower.includes('refund') || trkLower.includes('escalat')) {
      forcedView = 'REFUND_POLICY';
    } else if (
      trkLower.includes('balance') ||
      trkLower.includes('ads-failed') ||
      trkLower.includes('renewal') ||
      trkLower.includes('diwali')
    ) {
      forcedView = 'PREMIUM_MEMBERSHIP';
    } else if (
      trkLower.includes('case-closed') ||
      trkLower.includes('ad-launched') ||
      trkLower.includes('onboarding') ||
      trkLower.includes('ext')
    ) {
      forcedView = 'DASHBOARD';
    } else {
      forcedView = 'DASHBOARD';
    }
  }

  const restrictedAdminViews: ActiveView[] = [
    'CLIENT_ADMIN',
    'PLAN_PRICING_ADMIN',
    'CMS_MANAGEMENT',
    'BULK_ENTITY_CRM',
    'PRODUCT_IMAGE_ADMIN',
    'RENEWAL_INSIGHTS',
    'RENEWAL_EMAIL_EDITOR',
    'MAIL_DELIVERY_HISTORY'
  ];
  if (forcedView && restrictedAdminViews.includes(forcedView)) {
    forcedView = null;
  }

  return {
    isEmailLink,
    msTrk,
    forcedView,
    action,
    payZac,
    email,
    company,
    decisionMaker,
    address,
    paymentMethod,
    planId,
    amountUsd
  };
}

const MainApp: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    isAuthenticated,
    isAdmin,
    isImpersonating,
    logout,
    stopImpersonation
  } = useAuth();

  const { 
    siteContent,
    activeQuickEditSection,
    closeQuickEdit
  } = useSiteContent();

  const { addNotification } = useNotifications();

  // Capture initial URL search string before any startup effects can mutate or strip query params
  const initialEmailSearchRef = useRef<string>(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const initialParsedEmailRoute = parseIncomingEmailLinkParams(initialEmailSearchRef.current);
  const emailLinkForcedViewRef = useRef<ActiveView | null>(initialParsedEmailRoute.forcedView);
  const hasRecordedEmailClickRef = useRef<boolean>(false);
  const [isAppInitialized, setIsAppInitialized] = useState<boolean>(false);

  // Navigation & Currency State - Initialize from URL / Email Link Handler if present
  const getInitialView = (): ActiveView => {
    if (typeof window !== 'undefined') {
      const parsed = parseIncomingEmailLinkParams(window.location.search);
      if (parsed.forcedView) {
        return parsed.forcedView;
      }
    }
    return 'HOMEPAGE';
  };

  const [activeView, setActiveView] = useState<ActiveView>(getInitialView());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  // Global listener: on any unexpected error event, safely divert directly to HOMEPAGE
  // UNLESS an incoming Email Link forced a specific target view.
  useEffect(() => {
    const handleDbError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; code?: string }>;
      console.warn('[TradeHeaven Safety Handled Error]:', customEvent?.detail);
      if (emailLinkForcedViewRef.current) {
        setActiveView(emailLinkForcedViewRef.current);
        return;
      }
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

  // Background prefetch for popular categories, suppliers, and assets after initial load
  useEffect(() => {
    const prefetchPopularData = () => {
      try {
        const topCategoryImages = [
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=70',
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=70',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=70',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=70'
        ];
        topCategoryImages.forEach(url => {
          const img = new Image();
          img.src = url;
        });
      } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchPopularData, { timeout: 2500 });
      } else {
        setTimeout(prefetchPopularData, 1200);
      }
    }
  }, []);

  // Products and entities initialized with default rich marketplace dataset + custom local products + active image overrides
  const [products, setProducts] = useState<Product[]>(() => {
    let baseList: Product[] = [...MOCK_PRODUCTS];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const rawCustom = localStorage.getItem('trade_heaven_custom_products');
        if (rawCustom) {
          const customList: Product[] = JSON.parse(rawCustom);
          if (Array.isArray(customList) && customList.length > 0) {
            const baseMap = new Map<string, Product>();
            baseList.forEach(p => baseMap.set(p.id, p));
            const newAdditions: Product[] = [];
            customList.forEach(c => {
              if (c && c.id) {
                if (baseMap.has(c.id)) {
                  baseMap.set(c.id, { ...baseMap.get(c.id)!, ...c });
                } else {
                  newAdditions.push(c);
                }
              }
            });
            baseList = [...newAdditions, ...Array.from(baseMap.values())];
          }
        }
      }
    } catch {}
    return productImageManagerService.applyOverridesToProductList(baseList);
  });

  useEffect(() => {
    const mergeCustomCatalog = (companies: any[], customProducts: any[]) => {
      try {
        if (Array.isArray(companies) && companies.length > 0) {
          companies.forEach(comp => {
            if (comp && comp.id) {
              const existingIdx = MOCK_COMPANIES.findIndex(c => c.id === comp.id);
              if (existingIdx >= 0) {
                MOCK_COMPANIES[existingIdx] = { ...MOCK_COMPANIES[existingIdx], ...comp };
              } else {
                MOCK_COMPANIES.unshift(comp);
              }
            }
          });
        }
        if (Array.isArray(customProducts) && customProducts.length > 0) {
          setProducts(prev => {
            const byId = new Map<string, Product>();
            prev.forEach(p => byId.set(p.id, p));
            const additions: Product[] = [];
            customProducts.forEach(cp => {
              if (cp && cp.id) {
                if (byId.has(cp.id)) {
                  byId.set(cp.id, { ...byId.get(cp.id)!, ...cp });
                } else {
                  additions.push(cp);
                }
              }
            });
            return productImageManagerService.applyOverridesToProductList([
              ...additions,
              ...Array.from(byId.values())
            ]);
          });
        }
      } catch {}
    };

    const syncFromServer = async () => {
      try {
        const res = await fetch('/api/v1/public/custom-catalog');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success) {
          mergeCustomCatalog(data.companies || [], data.products || []);
        }
      } catch {}
    };

    void syncFromServer();

    const handleStudioUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.company || detail?.product) {
        mergeCustomCatalog(detail.company ? [detail.company] : [], detail.product ? [detail.product] : []);
      } else {
        void syncFromServer();
      }
    };
    window.addEventListener('tradeheaven_custom_catalog_updated', handleStudioUpdated);
    return () => window.removeEventListener('tradeheaven_custom_catalog_updated', handleStudioUpdated);
  }, []);
  const [rfqs, setRfqs] = useState<RfqRequirement[]>(MOCK_RFQS);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(MOCK_RFQS[0]?.id || null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(false);

  // Static category and country lists available immediately in memory without JSON serialization overhead
  const [prefetchedCategories] = useState<any[]>(CATEGORIES_TREE || []);
  const [prefetchedCountryLists] = useState<any[]>(ALL_COUNTRY_ITEMS || []);

  // Modals & Deep-Linked Entities state initialized directly from URL
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product') || params.get('productId');
      if (prodId) {
        return resolveProduct(prodId, MOCK_PRODUCTS);
      }
    }
    return null;
  });

  const [selectedRfqForModal, setSelectedRfqForModal] = useState<RfqRequirement | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rfqId = params.get('rfq') || params.get('rfqId') || params.get('lead');
      if (rfqId) {
        return resolveRfq(rfqId, MOCK_RFQS);
      }
    }
    return null;
  });

  const [storefrontCompanyId, setStorefrontCompanyId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isCheckoutUrl = params.get('action') === 'renew-membership' || params.get('pay_zac') === '1';
      if (!isCheckoutUrl) {
        const sup = params.get('supplier') || params.get('supplierId') || params.get('company') || params.get('vendor');
        if (sup) {
          return resolveSupplierId(sup);
        }
      }
    }
    return null;
  });

  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const buyer = params.get('buyer') || params.get('buyerId');
      if (buyer) return resolveBuyerId(buyer) || buyer;
    }
    return 'buyer-001';
  });

  const [sharedNote, setSharedNote] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const note = params.get('note');
      if (note && note.trim()) return note.trim();
    }
    return null;
  });

  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      return action === 'post-rfq' || action === 'create-rfq';
    }
    return false;
  });

  const [catalogCategory, setCatalogCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || params.get('cat');
      if (cat) return decodeURIComponent(cat);
    }
    return 'ALL';
  });

  const [catalogSearch, setCatalogSearch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('search') || params.get('query');
      if (q) return decodeURIComponent(q);
    }
    return '';
  });

  const [selectedSupplierTiers, setSelectedSupplierTiers] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  // Share Modal state
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    target: CustomLinkTarget | null;
  }>({
    isOpen: false,
    target: null
  });

  const handleDebouncedSearch = useCallback((query: string, immediate = false) => {
    if (searchTimer) clearTimeout(searchTimer);
    if (immediate) {
      setCatalogSearch(query);
      return;
    }
    const timer = setTimeout(() => {
      setCatalogSearch(query);
    }, 350);
    setSearchTimer(timer);
  }, [searchTimer]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const rawView = params.get('view');
      const prodId = params.get('product') || params.get('productId');
      const supId = params.get('supplier') || params.get('supplierId') || params.get('company') || params.get('vendor');
      const rfqId = params.get('rfq') || params.get('rfqId') || params.get('lead');
      const buyerIdParam = params.get('buyer') || params.get('buyerId');
      const cat = params.get('category') || params.get('cat');
      const q = params.get('q') || params.get('search') || params.get('query');
      const note = params.get('note');

      if (note && note.trim()) {
        setSharedNote(note.trim());
      } else {
        setSharedNote(null);
      }

      const restrictedAdminViews: ActiveView[] = [
        'CLIENT_ADMIN',
        'PLAN_PRICING_ADMIN',
        'CMS_MANAGEMENT',
        'BULK_ENTITY_CRM',
        'PRODUCT_IMAGE_ADMIN',
        'RENEWAL_INSIGHTS',
        'RENEWAL_EMAIL_EDITOR',
        'MAIL_DELIVERY_HISTORY'
      ];

      if (rawView) {
        const lower = rawView.toLowerCase();
        const targetView = VIEW_ALIASES[lower] || (rawView as ActiveView);
        if (restrictedAdminViews.includes(targetView) && (!currentUser || !isAdmin)) {
          setActiveView('HOMEPAGE');
        } else {
          setActiveView(targetView);
        }
      } else if (params.get('article') || params.get('post')) {
        setActiveView('INSIGHTS');
      } else if (buyerIdParam) {
        setActiveView('BUYER_PROFILE');
      } else {
        setActiveView('HOMEPAGE');
      }

      if (buyerIdParam) {
        setSelectedBuyerId(resolveBuyerId(buyerIdParam) || buyerIdParam);
      }

      const isCheckoutUrl = params.get('action') === 'renew-membership' || params.get('pay_zac') === '1';
      if (supId && !isCheckoutUrl) {
        setStorefrontCompanyId(resolveSupplierId(supId));
      } else {
        setStorefrontCompanyId(null);
      }

      if (prodId && products.length > 0) {
        const found = resolveProduct(prodId, products);
        if (found) setSelectedProduct(found);
      } else if (!prodId) {
        setSelectedProduct(null);
      }

      if (rfqId && rfqs.length > 0) {
        const found = resolveRfq(rfqId, rfqs);
        if (found) setSelectedRfqForModal(found);
      } else if (!rfqId) {
        setSelectedRfqForModal(null);
      }

      if (cat) setCatalogCategory(decodeURIComponent(cat));
      else setCatalogCategory('ALL');

      if (q) setCatalogSearch(decodeURIComponent(q));
      else setCatalogSearch('');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, rfqs]);

  // Sync selectedProduct & selectedRfqForModal with URL when products/rfqs update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product') || params.get('productId');
      if (prodId && products.length > 0) {
        const found = resolveProduct(prodId, products);
        if (found && (!selectedProduct || selectedProduct.id !== found.id)) {
          setSelectedProduct(found);
        }
      }
      const rfqId = params.get('rfq') || params.get('rfqId') || params.get('lead');
      if (rfqId && rfqs.length > 0) {
        const found = resolveRfq(rfqId, rfqs);
        if (found && (!selectedRfqForModal || selectedRfqForModal.id !== found.id)) {
          setSelectedRfqForModal(found);
          setSelectedRfqId(found.id);
        }
      }
    }
  }, [products, rfqs]);

  // Update URL when activeView, storefrontCompanyId, selectedProduct, selectedRfqForModal, selectedBuyerId, category, or search changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (activeView === 'HOMEPAGE') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', activeView);
      }

      if (activeView === 'BUYER_PROFILE' && selectedBuyerId) {
        url.searchParams.set('buyer', selectedBuyerId);
        url.searchParams.delete('buyerId');
      } else {
        url.searchParams.delete('buyer');
        url.searchParams.delete('buyerId');
        url.searchParams.delete('buyerTab');
      }

      if (storefrontCompanyId) {
        url.searchParams.set('supplier', storefrontCompanyId);
        url.searchParams.delete('supplierId');
        url.searchParams.delete('company');
      } else {
        url.searchParams.delete('supplier');
        url.searchParams.delete('supplierId');
        url.searchParams.delete('company');
        url.searchParams.delete('vendor');
        url.searchParams.delete('tab');
      }

      if (selectedProduct) {
        url.searchParams.set('product', selectedProduct.id);
        url.searchParams.delete('productId');
      } else {
        url.searchParams.delete('product');
        url.searchParams.delete('productId');
      }

      if (selectedRfqForModal) {
        url.searchParams.set('rfq', selectedRfqForModal.id);
        url.searchParams.delete('rfqId');
      } else {
        url.searchParams.delete('rfq');
        url.searchParams.delete('rfqId');
        url.searchParams.delete('lead');
      }

      if (activeView === 'PRODUCT_DIRECTORY') {
        if (catalogCategory && catalogCategory !== 'ALL') {
          url.searchParams.set('category', catalogCategory);
        } else {
          url.searchParams.delete('category');
          url.searchParams.delete('cat');
        }
        if (catalogSearch && catalogSearch.trim()) {
          url.searchParams.set('q', catalogSearch.trim());
        } else {
          url.searchParams.delete('q');
          url.searchParams.delete('search');
        }
      } else {
        url.searchParams.delete('category');
        url.searchParams.delete('cat');
        url.searchParams.delete('q');
        url.searchParams.delete('search');
      }

      // Only push if the URL actually changed to prevent infinite loops with popstate
      if (url.toString() !== window.location.href) {
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [activeView, storefrontCompanyId, selectedProduct, selectedRfqForModal, selectedBuyerId, catalogCategory, catalogSearch]);

  // Global listener for tradeheaven_open_share custom event
  useEffect(() => {
    const handleOpenShare = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const detail = customEvent?.detail;
      if (!detail || (detail.type === 'PAGE' && !detail.id)) {
        // Context-aware fallback when clicking global Share button in Header
        if (selectedProduct) {
          setShareModalConfig({
            isOpen: true,
            target: {
              type: 'PRODUCT',
              productId: selectedProduct.id,
              title: selectedProduct.title,
              subtitle: `${selectedProduct.supplierName} (${selectedProduct.supplierCountry})`,
              imageUrl: selectedProduct.images?.[0]
            }
          });
          return;
        }
        if (selectedRfqForModal) {
          setShareModalConfig({
            isOpen: true,
            target: {
              type: 'RFQ',
              rfqId: selectedRfqForModal.id,
              title: selectedRfqForModal.productName,
              subtitle: `Buyer: ${selectedRfqForModal.buyerCompany} (${selectedRfqForModal.buyerCountry}) • Target: $${selectedRfqForModal.targetPriceUsd}/unit`,
              imageUrl: selectedRfqForModal.image || selectedRfqForModal.images?.[0]
            }
          });
          return;
        }
        if (storefrontCompanyId || activeView === 'VENDOR_PROFILE') {
          const supId = storefrontCompanyId || 'comp-melissa-mpcommodity';
          const vendorProfile = DETAILED_VENDOR_PROFILES[supId];
          setShareModalConfig({
            isOpen: true,
            target: {
              type: 'SUPPLIER',
              supplierId: supId,
              title: vendorProfile?.companyName,
              subtitle: vendorProfile ? `${vendorProfile.city}, ${vendorProfile.country}` : undefined,
              imageUrl: vendorProfile?.logoUrl || vendorProfile?.bannerUrl
            }
          });
          return;
        }
        if (activeView === 'BUYER_PROFILE' && selectedBuyerId) {
          const buyerProfile = MOCK_BUYER_PROFILES.find(b => b.id === selectedBuyerId) || MOCK_BUYER_PROFILES[0];
          setShareModalConfig({
            isOpen: true,
            target: {
              type: 'BUYER',
              buyerId: buyerProfile.id,
              title: buyerProfile.companyName,
              subtitle: `${buyerProfile.city}, ${buyerProfile.country} • ${buyerProfile.businessType}`,
              imageUrl: buyerProfile.logoUrl || buyerProfile.bannerUrl
            }
          });
          return;
        }
        if (activeView === 'PRODUCT_DIRECTORY' && catalogSearch && catalogSearch.trim()) {
          setShareModalConfig({
            isOpen: true,
            target: {
              type: 'SEARCH',
              search: catalogSearch.trim(),
              category: catalogCategory !== 'ALL' ? catalogCategory : undefined,
              title: `"${catalogSearch.trim()}" Wholesale Suppliers & Products`
            }
          });
          return;
        }
        if (activeView === 'PRODUCT_DIRECTORY' && catalogCategory && catalogCategory !== 'ALL') {
          setShareModalConfig({
            isOpen: true,
            target: {
              type: 'CATEGORY',
              category: catalogCategory,
              title: `${catalogCategory} Wholesale Suppliers & Products`
            }
          });
          return;
        }
        setShareModalConfig({
          isOpen: true,
          target: {
            type: 'PAGE',
            view: (detail?.view as ActiveView) || activeView,
            title: detail?.title || document.title,
            subtitle: detail?.subtitle
          }
        });
        return;
      }

      let formattedTarget: CustomLinkTarget;
      if (detail.type === 'STOREFRONT' || detail.type === 'SUPPLIER') {
        const supId = resolveSupplierId(detail.id || detail.supplierId || storefrontCompanyId) || 'comp-melissa-mpcommodity';
        const vendorProfile = DETAILED_VENDOR_PROFILES[supId];
        formattedTarget = {
          type: 'SUPPLIER',
          supplierId: supId,
          supplierTab: (detail.tab as SupplierTab) || 'OVERVIEW',
          title: detail.title || vendorProfile?.companyName,
          subtitle: detail.subtitle || (vendorProfile ? `${vendorProfile.city}, ${vendorProfile.country}` : undefined),
          imageUrl: vendorProfile?.logoUrl || vendorProfile?.bannerUrl
        };
      } else if (detail.type === 'PRODUCT') {
        const prodId = detail.id || detail.productId || selectedProduct?.id;
        const prod = resolveProduct(prodId, products) || selectedProduct;
        formattedTarget = {
          type: 'PRODUCT',
          productId: prod?.id || prodId,
          title: detail.title || prod?.title,
          subtitle: detail.subtitle || (prod ? `${prod.supplierName} • MOQ: ${prod.moq || 100} ${prod.moqUnit || 'units'}` : undefined),
          imageUrl: prod?.images?.[0]
        };
      } else if (detail.type === 'RFQ') {
        const rfqId = detail.id || detail.rfqId || selectedRfqForModal?.id;
        const rfq = resolveRfq(rfqId, rfqs) || selectedRfqForModal;
        formattedTarget = {
          type: 'RFQ',
          rfqId: rfq?.id || rfqId,
          rfqTab: (detail.rfqTab as RfqModalTab) || 'DETAILS',
          title: detail.title || rfq?.productName,
          subtitle: detail.subtitle || (rfq ? `Buyer: ${rfq.buyerCompany} (${rfq.buyerCountry}) • Target: $${rfq.targetPriceUsd}/unit` : undefined),
          imageUrl: rfq?.image || rfq?.images?.[0]
        };
      } else if (detail.type === 'BUYER') {
        const bId = resolveBuyerId(detail.id || detail.buyerId || selectedBuyerId) || 'buyer-001';
        const bProf = MOCK_BUYER_PROFILES.find(b => b.id === bId) || MOCK_BUYER_PROFILES[0];
        formattedTarget = {
          type: 'BUYER',
          buyerId: bId,
          buyerTab: (detail.buyerTab as BuyerModalTab) || 'OVERVIEW',
          title: detail.title || bProf?.companyName,
          subtitle: detail.subtitle || (bProf ? `${bProf.city}, ${bProf.country} • ${bProf.businessType}` : undefined),
          imageUrl: bProf?.logoUrl || bProf?.bannerUrl
        };
      } else if (detail.type === 'ARTICLE') {
        formattedTarget = {
          type: 'ARTICLE',
          articleId: detail.articleId || detail.id,
          view: 'INSIGHTS',
          title: detail.title || 'Trade Heaven Editorial Insight',
          subtitle: detail.subtitle
        };
      } else if (detail.type === 'CATEGORY') {
        formattedTarget = {
          type: 'CATEGORY',
          category: detail.category || catalogCategory,
          title: detail.title || `${detail.category || catalogCategory} Wholesale Suppliers & Products`
        };
      } else {
        formattedTarget = {
          type: 'PAGE',
          view: activeView,
          title: detail.title || document.title,
          subtitle: detail.subtitle
        };
      }

      setShareModalConfig({
        isOpen: true,
        target: formattedTarget
      });
    };

    window.addEventListener('tradeheaven_open_share', handleOpenShare);
    return () => window.removeEventListener('tradeheaven_open_share', handleOpenShare);
  }, [activeView, storefrontCompanyId, selectedProduct, selectedRfqForModal, selectedBuyerId, catalogCategory, catalogSearch, products, rfqs]);
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
  const [renewalSuccessToast, setRenewalSuccessToast] = useState<{
    orderId: string;
    companyName: string;
    decisionMakerName?: string;
    planTitle: string;
    paymentMethod?: string;
  } | null>(null);

  useEffect(() => {
    if (!renewalSuccessToast) return;
    const timer = setTimeout(() => {
      setRenewalSuccessToast(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [renewalSuccessToast]);

  const handleOpenRegisterFree = () => {
    setAuthModalMode('REGISTER');
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const handleRegisterEvent = () => {
      setAuthModalMode('REGISTER');
      setIsAuthModalOpen(true);
    };
    const handleLoginEvent = () => {
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
    };
    const handleSearchProductDirectory = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      const q = customEvent?.detail?.query ?? '';
      setCatalogSearch(q);
      setActiveView('PRODUCT_DIRECTORY');
    };
    const handleSearchRfqLeads = (e: Event) => {
      const customEvent = e as CustomEvent<{ rfq?: RfqRequirement; query?: string }>;
      if (customEvent?.detail?.rfq) {
        setSelectedRfqForModal(customEvent.detail.rfq);
        setSelectedRfqId(customEvent.detail.rfq.id);
      } else {
        setActiveView('BUY_LEADS');
      }
    };
    window.addEventListener('tradeheaven_open_register', handleRegisterEvent);
    window.addEventListener('tradeheaven_open_login', handleLoginEvent);
    window.addEventListener('tradeheaven_search_product_directory', handleSearchProductDirectory);
    window.addEventListener('tradeheaven_search_rfq_leads', handleSearchRfqLeads);
    return () => {
      window.removeEventListener('tradeheaven_open_register', handleRegisterEvent);
      window.removeEventListener('tradeheaven_open_login', handleLoginEvent);
      window.removeEventListener('tradeheaven_search_product_directory', handleSearchProductDirectory);
      window.removeEventListener('tradeheaven_search_rfq_leads', handleSearchRfqLeads);
    };
  }, [currentUser]);

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

  // Fetch live RFQs from BigRock PHP API non-blocking in background
  const fetchRFQs = async () => {
    try {
      const loadedRfqs = await apiClient.getRfqs();
      const mockIds = new Set(MOCK_RFQS.map(r => r.id));
      const extraLoaded = Array.isArray(loadedRfqs) ? loadedRfqs.filter(r => !mockIds.has(r.id)) : [];
      if (extraLoaded.length > 0) {
        const mergedRfqs = [...MOCK_RFQS, ...extraLoaded];
        setRfqs(mergedRfqs as any);
        setSelectedRfqId(prev => (prev && mergedRfqs.some(r => r.id === prev)) ? prev : mergedRfqs[0].id);
      }
    } catch (err) {}
  };

  // Fetch live Products/Listings non-blocking in background
  const fetchProducts = async () => {
    try {
      const prods = await api.getProducts();
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    } catch (err) {}
  };

  // 1. Fetch live data asynchronously in background without blocking UI
  const initializeData = async () => {
    await Promise.allSettled([
      fetchProducts(),
      fetchRFQs()
    ]);
  };

  // Async Initialization on Mount with instant non-blocking background hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__TRADEHEAVEN_PREFETCHED_CATEGORIES = CATEGORIES_TREE;
      (window as any).__TRADEHEAVEN_PREFETCHED_COUNTRIES = ALL_COUNTRY_ITEMS;
    }

    let isMounted = true;
    const applyOverridesIfChanged = (prevList: Product[]): Product[] => {
      const nextList = productImageManagerService.applyOverridesToProductList(prevList);
      let changed = nextList.length !== prevList.length;
      if (!changed) {
        for (let i = 0; i < prevList.length; i++) {
          const p = prevList[i];
          const n = nextList[i];
          if (
            p.id !== n.id ||
            p.images?.[0] !== n.images?.[0] ||
            (p.images?.length || 0) !== (n.images?.length || 0)
          ) {
            changed = true;
            break;
          }
        }
      }
      return changed ? nextList : prevList;
    };

    const hydrationPromise = productImageManagerService.ensureHydrated().then(() => {
      if (isMounted) {
        setProducts(prev => applyOverridesIfChanged(prev));
        setSelectedProduct(prev => {
          if (!prev) return null;
          const [updated] = productImageManagerService.applyOverridesToProductList([prev]);
          if (updated && updated.images?.[0] !== prev.images?.[0]) {
            return updated;
          }
          return prev;
        });
      }
    });

    // Run background fetch immediately without delay and mark initialization complete once settled
    Promise.allSettled([initializeData(), hydrationPromise]).finally(() => {
      if (isMounted) {
        setIsAppInitialized(true);
      }
    });

    const handleRfqRefresh = () => {
      fetchRFQs();
    };
    const handleProductImagesUpdated = () => {
      setProducts(prev => applyOverridesIfChanged(prev));
      setSelectedProduct(prev => {
        if (!prev) return null;
        const [updated] = productImageManagerService.applyOverridesToProductList([prev]);
        return updated || prev;
      });
    };
    const handleProductsUpdated = () => {
      fetchProducts();
    };
    window.addEventListener('tradeheaven_rfq_created', handleRfqRefresh);
    window.addEventListener('tradeheaven_product_images_updated', handleProductImagesUpdated);
    window.addEventListener('tradeheaven_products_updated', handleProductsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('tradeheaven_rfq_created', handleRfqRefresh);
      window.removeEventListener('tradeheaven_product_images_updated', handleProductImagesUpdated);
      window.removeEventListener('tradeheaven_products_updated', handleProductsUpdated);
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

  // Guard against unauthenticated or non-admin visitors accessing admin views directly
  useEffect(() => {
    const adminViews: ActiveView[] = [
      'CLIENT_ADMIN',
      'PLAN_PRICING_ADMIN',
      'CMS_MANAGEMENT',
      'BULK_ENTITY_CRM',
      'PRODUCT_IMAGE_ADMIN',
      'RENEWAL_INSIGHTS',
      'RENEWAL_EMAIL_EDITOR',
      'MAIL_DELIVERY_HISTORY'
    ];
    if (adminViews.includes(activeView) && (!currentUser || !isAdmin)) {
      setActiveView('HOMEPAGE');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('view')) {
          url.searchParams.delete('view');
          window.history.replaceState({}, '', url.toString());
        }
      }
      return;
    }
    if (currentUser?.token) {
      fetch('/api/v1/auth/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ currentView: activeView })
      }).catch(() => {});
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
    } else if (storefrontCompanyId) {
      const supProfile = DETAILED_VENDOR_PROFILES[storefrontCompanyId];
      const supCompany = MOCK_COMPANIES.find(c => c.id === storefrontCompanyId);
      const cName = supProfile?.companyName || supCompany?.companyName || 'Verified Global Supplier';
      const cCountry = supProfile?.country || supCompany?.country || 'International';
      const cType = supProfile?.businessType || supCompany?.businessType || 'Wholesale Manufacturer';
      title = `${cName} (${cCountry}) — Verified ${cType} | Trade Heaven`;
      description = supProfile?.description?.slice(0, 160) || `View verified factory profile, product catalog, and compliance certificates for ${cName} on Trade Heaven.`;
      canonical = `https://tradeheaven.net/?supplier=${encodeURIComponent(storefrontCompanyId)}`;
      if (supProfile?.bannerUrl || supProfile?.logoUrl) {
        ogImage = supProfile.bannerUrl || supProfile.logoUrl;
        ogImageAlt = `${cName} Storefront`;
      }
    } else if (selectedRfqForModal) {
      title = `Live RFQ Tender: ${selectedRfqForModal.productName} | Trade Heaven`;
      description = `Buyer: ${selectedRfqForModal.buyerCompany} (${selectedRfqForModal.buyerCountry}). Target Qty: ${selectedRfqForModal.targetQuantity} ${selectedRfqForModal.quantityUnit}. Submit your factory quote directly.`;
      canonical = `https://tradeheaven.net/?rfq=${encodeURIComponent(selectedRfqForModal.id)}`;
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
        case 'TRADE_ASSURANCE_CERTIFICATE':
          title = 'Trade Assurance Certificate Registry & Verification | Trade Heaven';
          description = 'Apply for an official Trade Heaven Trade Assurance Certificate ($150k–$2M USD escrow protection) by paying verification fees, or search and verify any certificate serial number online.';
          keywords = 'Trade Heaven Trade Assurance Certificate, verify trade assurance certificate number, THC-2026 certificate lookup, apply for trade assurance certificate, B2B escrow protection certificate, SGS factory audit certificate, TradeHeaven certificate verification';
          canonical = 'https://tradeheaven.net/?view=TRADE_ASSURANCE_CERTIFICATE';
          break;
        case 'B2B_TRUST_CERTIFICATE':
          title = 'B2B Trust Certificate (7-Day Audit) | Trade Heaven';
          description = 'Apply for the official Trade Heaven Independent B2B Trust Certificate (7-day complete audit). Verifies ISO 9001, SOC 2, and country-specific government documents.';
          keywords = 'Trade Heaven B2B Trust Certificate, B2B trust seal verification, ISO 9001 SOC 2 B2B certificate, country specific government registration check, GST IEC EIN VAT EORI verification, corporate verification';
          canonical = 'https://tradeheaven.net/?view=B2B_TRUST_CERTIFICATE';
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
  }, [activeView, selectedProduct, storefrontCompanyId, selectedRfqForModal, products, siteContent]);

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

  const handleProductCreated = async (newProd: Partial<Product>) => {
    const fullProd = {
      ...newProd,
      id: newProd.id || `prod-${Date.now()}`
    } as Product;
    await api.createProduct(fullProd);
    setProducts(prev => [fullProd, ...prev.filter(p => p.id !== fullProd.id)]);
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

  // Centralized Email Link Handler:
  // Specifically parses incoming 'ms_trk' or custom email query params and programmatically
  // forces the app's activeView state (and associated checkout/modal state), overriding any
  // failed default routing both on initial mount, after initialization, and on in-app email link clicks.
  useEffect(() => {
    const handleCustomPaymentEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PaymentCheckoutData>;
      if (customEvent.detail) {
        setCheckoutData(customEvent.detail);
      }
    };
    window.addEventListener('tradeheaven_open_payment_checkout', handleCustomPaymentEvent);

    const applyEmailSearchRoute = (searchString: string, clickedUrl?: string) => {
      try {
        const parsed = parseIncomingEmailLinkParams(searchString);

        // 1. Record MailSuite click telemetry if ms_trk is present
        if (parsed.msTrk && (!hasRecordedEmailClickRef.current || clickedUrl)) {
          hasRecordedEmailClickRef.current = true;
          fetch('/api/v1/admin/mailsuite/simulate-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trackingId: parsed.msTrk,
              eventType: 'CLICK',
              url: clickedUrl || (typeof window !== 'undefined' ? window.location.href : 'https://www.tradeheaven.net'),
              label: `Direct Email Link Click (${parsed.forcedView || 'HOMEPAGE'})`
            })
          }).catch(() => {});
        }

        // 2. Programmatically force activeView when ms_trk or custom email query params are present,
        // overriding any failed default routing after application initialization completes.
        if (parsed.forcedView) {
          emailLinkForcedViewRef.current = parsed.forcedView;
          setActiveView(prev => (prev !== parsed.forcedView ? parsed.forcedView! : prev));

          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (parsed.forcedView !== 'HOMEPAGE') {
              url.searchParams.set('view', parsed.forcedView);
            }
            if (parsed.msTrk && !url.searchParams.has('ms_trk')) {
              url.searchParams.set('ms_trk', parsed.msTrk);
            }
            if (url.toString() !== window.location.href) {
              window.history.replaceState({}, '', url.toString());
            }
          }
        }

        // 3. Open pre-configured payment checkout modal for balance fund / membership renewal email links
        const isZacBalanceLink =
          parsed.payZac ||
          (parsed.msTrk &&
            (parsed.msTrk.toLowerCase().includes('zac-balance') ||
              parsed.msTrk.toLowerCase().includes('zac-ads-failed') ||
              parsed.msTrk.toLowerCase().includes('zac-demo')));

        if (isZacBalanceLink) {
          const company = parsed.company || 'IMPORTATION FADE-TECH (OTEC LTD)';
          const email = parsed.email || 'zac@otec.ltd';
          const amountUsd = parsed.amountUsd || 590;

          setCheckoutData({
            planId: 'ZAC-BALANCE-FUND-590',
            title: `Full Plan Balance Settlement ($${amountUsd}.00 USD) — ${company}`,
            description: `Remaining Plan Balance Settlement for Zachary Aldin (${company}) • Earlier Paid: $400.00 USD • Remaining Balance Due: $${amountUsd}.00 USD`,
            amountUsd,
            type: 'SUBSCRIPTION',
            supplierCompany: company,
            clientEmail: email,
            billingName: `Zachary Aldin (${company})`,
            decisionMakerName: 'Zachary Aldin',
            preferredPaymentMethod: 'Direct Bank Wire Transfer'
          });
        } else if (parsed.action === 'renew-membership') {
          const company = parsed.company || 'ACE Intermediary';
          const email = parsed.email || 'ezekiahali355@gmail.com';
          const decisionMaker = parsed.decisionMaker || 'Ali Charley Ezekiah';
          const address = parsed.address || '1241 Hackberry Avenue Corsicana Texas 75110';
          const paymentMethod = parsed.paymentMethod || 'Debit Card';
          const planId = parsed.planId || 'VIP-RENEWAL-OFFER-2026';
          const amountUsd = parsed.amountUsd || 1499;

          setCheckoutData({
            planId,
            title: `Membership Renewal — Current Offer & Exciting Deals (${company})`,
            description: `Annual Membership Renewal for ${company} (${address}) • Decision Maker: ${decisionMaker} • Preferred Payment: ${paymentMethod}`,
            amountUsd,
            type: 'SUBSCRIPTION',
            supplierCompany: company,
            clientEmail: email,
            billingName: `${decisionMaker} (${company})`,
            address,
            decisionMakerName: decisionMaker,
            preferredPaymentMethod: paymentMethod
          });
        }
      } catch {}
    };

    const activeSearch =
      typeof window !== 'undefined' && window.location.search
        ? window.location.search
        : initialEmailSearchRef.current;
    applyEmailSearchRoute(activeSearch);

    // Global click interceptor for any email preview / internal tradeheaven.net / ms_trk links
    // so clicking links inside rendered email bodies routes inside the SPA instead of hitting iframe/403 errors.
    const handleGlobalEmailAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (!anchor) return;
      const rawHref = anchor.getAttribute('href') || '';
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('blob:') ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      try {
        let resolvedUrl = new URL(rawHref, 'https://www.tradeheaven.net');
        if (resolvedUrl.pathname.includes('/api/v1/track/click/')) {
          const nested = resolvedUrl.searchParams.get('url');
          if (nested) {
            resolvedUrl = new URL(nested, 'https://www.tradeheaven.net');
          }
        }
        const host = resolvedUrl.hostname.toLowerCase();
        const isTradeHeavenOrPreviewLink =
          host.includes('tradeheaven.net') ||
          host.includes('.run.app') ||
          host.includes('aistudio.google.com') ||
          (typeof window !== 'undefined' && host === window.location.hostname.toLowerCase());

        if (isTradeHeavenOrPreviewLink) {
          e.preventDefault();
          e.stopPropagation();
          if (resolvedUrl.search) {
            applyEmailSearchRoute(resolvedUrl.search, resolvedUrl.toString());
          } else {
            setActiveView('HOMEPAGE');
          }
        }
      } catch {}
    };

    document.addEventListener('click', handleGlobalEmailAnchorClick, true);

    return () => {
      window.removeEventListener('tradeheaven_open_payment_checkout', handleCustomPaymentEvent);
      document.removeEventListener('click', handleGlobalEmailAnchorClick, true);
    };
  }, [isAppInitialized]);

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
    options?: { search?: string; category?: string; subcategory?: string; productId?: string; tab?: string; [key: string]: any }
  ) => {
    // Release initial email-link forced view lock once the user manually navigates
    emailLinkForcedViewRef.current = null;
    const target = String(view || '').trim().toUpperCase();

    if (options?.category) {
      setCatalogCategory(options.category);
    }
    if (options?.search !== undefined) {
      handleDebouncedSearch(options.search, false);
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

    // Sync specific options like 'tab' to URL immediately for components that read from window.location
    if (typeof window !== 'undefined' && options) {
      const url = new URL(window.location.href);
      if (options.tab) {
        url.searchParams.set('tab', options.tab);
      }
      // Handle other generic options
      Object.entries(options).forEach(([key, val]) => {
        if (key !== 'search' && key !== 'category' && key !== 'subcategory' && key !== 'productId' && key !== 'tab') {
          url.searchParams.set(key, String(val));
        }
      });
      window.history.pushState({}, '', url.toString());
      if (options.tab) {
        window.dispatchEvent(
          new CustomEvent('tradeheaven_admin_switch_tab', {
            detail: { tab: options.tab }
          })
        );
      }
    }

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
    if (target === 'B2B_TRUST_CERTIFICATE' || target === 'TRUST_CERTIFICATE') {
      setActiveView('B2B_TRUST_CERTIFICATE');
      return;
    }
    if (target === 'TRADE_ASSURANCE_CERTIFICATE' || target === 'TRADE_ASSURANCE' || target === 'TRADE_PROTECTION' || target === 'VERIFY_CERTIFICATE' || target === 'CERTIFICATE') {
      setActiveView('TRADE_ASSURANCE_CERTIFICATE');
      return;
    }
    if (target === 'DASHBOARD' || target === 'MY_DASHBOARD') {
      setActiveView('DASHBOARD');
      return;
    }
    if (target === 'WALLET_TOPUP' || target === 'TOPUP' || target === 'TOPUP_WALLET' || target === 'WALLET' || target === 'TOP_UP') {
      setActiveView('WALLET_TOPUP');
      return;
    }
    if (target === 'MEDIATOR_ENGINE' || target === 'MEDIATION_WALLET' || target === 'MEDIATION' || target === 'ESCROW_MEDIATOR') {
      setActiveView('MEDIATOR_ENGINE');
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
    if (target === 'PRODUCT_IMAGE_ADMIN' || target === 'PRODUCT_IMAGES' || target === 'IMAGE_MANAGER') {
      if (!currentUser || !isAdmin) {
        setActiveView('HOMEPAGE');
        setAuthModalMode('LOGIN');
        setIsAuthModalOpen(true);
        return;
      }
      setActiveView('PRODUCT_IMAGE_ADMIN');
      return;
    }

    const restrictedAdminTargets = [
      'CLIENT_ADMIN',
      'PLAN_PRICING_ADMIN',
      'CMS_MANAGEMENT',
      'BULK_ENTITY_CRM',
      'PRODUCT_IMAGE_ADMIN',
      'RENEWAL_INSIGHTS',
      'RENEWAL_EMAIL_EDITOR',
      'MAIL_DELIVERY_HISTORY'
    ];
    if (restrictedAdminTargets.includes(target)) {
      if (!currentUser || !isAdmin) {
        setActiveView('HOMEPAGE');
        setAuthModalMode('LOGIN');
        setIsAuthModalOpen(true);
        return;
      }
      setActiveView(target as ActiveView);
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white font-sans pb-16 md:pb-0">
      {/* Scroll restoration anchor */}
      <ScrollToTop activeView={activeView} />
      {/* Dynamic SEO Meta Tags Manager */}
      <SEOManager 
        activeView={activeView} 
        selectedProduct={selectedProduct} 
        products={products} 
      />



      {/* Active Admin Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-3 shadow-md z-50 sticky top-0 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded bg-black/20 text-amber-200 uppercase font-black text-[10px] tracking-wider">
              Admin Impersonation Mode
            </span>
            <span className="truncate">
              You are currently logged in &amp; operating as <strong>{currentUser?.name}</strong> ({currentUser?.companyName || currentUser?.email}).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopImpersonation();
              handleNavigate('CLIENT_ADMIN');
            }}
            className="px-3 py-1 rounded-lg bg-white text-amber-900 hover:bg-amber-50 font-extrabold text-[11px] shadow-xs shrink-0 cursor-pointer whitespace-nowrap transition-colors"
          >
            Exit &amp; Return to Admin Dashboard
          </button>
        </div>
      )}

      {/* 1.5 DYNAMIC ADMIN-CONTROLLED PLATFORM OFFERS & ANNOUNCEMENTS RIBBON */}
      <PlatformAnnouncementBanner variant="top-ribbon" onNavigate={handleNavigate} />

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
        onOpenStorefront={(companyId) => {
          handleOpenStorefront(companyId);
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
      <main className="flex-1 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 min-h-[calc(100vh-160px)]">
        {/* Shared Custom Note Banner when ?note=... is present in the URL */}
        {sharedNote && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-500/30 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                <Tag className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                  Shared Link Note / Instruction
                </div>
                <p className="text-xs sm:text-sm font-bold text-white break-words">
                  "{sharedNote}"
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSharedNote(null);
                const url = new URL(window.location.href);
                url.searchParams.delete('note');
                window.history.replaceState({}, '', url.toString());
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Dismiss note"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
                      if (sector !== undefined) {
                        setCatalogSearch(sector);
                      }
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
              case 'MEDIATOR_ENGINE':
                return <TradeHeavenMediatorView embedded={false} />;
              case 'INSIGHTS':
                return <InsightsBlog onNavigate={handleNavigate} currentUser={currentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />;
              case 'PRODUCT_DIRECTORY':
                return (
                  <div id="product-directory-wrapper" className="space-y-6">
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
                      selectedSupplierTiers={selectedSupplierTiers}
                      onSupplierTiersChange={setSelectedSupplierTiers}
                      selectedCountries={selectedCountries}
                      onCountriesChange={setSelectedCountries}
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
              case 'SUPPLIER_DASHBOARD':
                if (currentUser?.role === 'SUPPLIER' || activeView === 'SUPPLIER_DASHBOARD') {
                  return (
                    <VerifiedSupplierDedicatedDashboard
                      currentUser={currentUser}
                      selectedCurrency={selectedCurrency}
                      onOpenStorefront={handleOpenStorefront}
                      onNavigate={handleNavigate}
                      onOpenCreateRfq={handleOpenCreateRfq}
                    />
                  );
                }
                return (
                  <BuyerSupplierDashboard
                    currentUser={currentUser}
                    currentUserRole={currentUser?.role || 'BUYER'}
                    selectedCurrency={selectedCurrency}
                    rfqs={rfqs}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    onOpenStorefront={handleOpenStorefront}
                    onNavigate={handleNavigate}
                    onSelectRfq={(rfq) => {
                      setSelectedRfqId(rfq.id);
                      setSelectedRfqForModal(rfq);
                    }}
                    onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
                  />
                );

              case 'INCOTERMS_CALCULATOR':
                return (
                  <IncotermsCalculator selectedCurrency={selectedCurrency} />
                );

              case 'PREMIUM_SERVICES':
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
                    onNavigate={handleNavigate}
                  />
                );

              case 'SUPPLIERS_DIRECTORY':
                return (
                  <SuppliersDirectoryView
                    selectedCurrency={selectedCurrency}
                    onOpenStorefront={handleOpenStorefront}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => setActiveView('PREMIUM_MEMBERSHIP')}
                    initialSearch={catalogSearch}
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

              case 'VENDOR_PROFILE': {
                const resolvedVendorCompanyId = storefrontCompanyId || (
                  currentUser?.email?.toLowerCase().includes('mpcommoditybroker')
                    ? 'comp-melissa-mpcommodity'
                    : (currentUser?.role === 'SUPPLIER'
                        ? (MOCK_COMPANIES.find(c =>
                            (c.contactEmail && currentUser.email && c.contactEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                            (c.companyName && currentUser.companyName && c.companyName.toLowerCase() === currentUser.companyName.toLowerCase())
                          )?.id || 'comp-melissa-mpcommodity')
                        : 'comp-melissa-mpcommodity')
                );
                return (
                  <VendorProfilePage
                    companyId={resolvedVendorCompanyId}
                    products={products}
                    selectedCurrency={selectedCurrency}
                    onSelectProduct={handleSelectProduct}
                    onOpenCreateRfq={handleOpenCreateRfq}
                    currentUser={currentUser}
                    onOpenUpgradeModal={() => handleNavigate('PREMIUM_MEMBERSHIP')}
                    onNavigate={handleNavigate}
                  />
                );
              }

              case 'COUNTRY_HUB':
                return (
                  <CountryTradeHubView
                    initialCountryId="uk"
                    products={products}
                    onSelectProduct={handleSelectProduct}
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

              case 'MAIL_DELIVERY_HISTORY':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Mail Delivery History & Telemetry Hub"
                    description="Email delivery telemetry, SMTP status logs, and open/click tracking are restricted to verified System Administrators."
                    targetViewName="MAIL_DELIVERY_HISTORY"
                  >
                    <MailDeliveryHistoryPage
                      currentUser={currentUser}
                      onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      onNavigate={handleNavigate}
                    />
                  </AdminRouteGuard>
                );

              case 'RENEWAL_INSIGHTS':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Mail Open Rate & Renewal Analytics"
                    description="Email campaign telemetry, open rates, and renewal conversion analytics are restricted to verified System Administrators."
                    targetViewName="RENEWAL_INSIGHTS"
                  >
                    <AdminDashboard
                      initialTab="RENEWAL_INSIGHTS"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              case 'RENEWAL_EMAIL_EDITOR':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Renewal Email HTML Editor"
                    description="The Renewal Email HTML Editor and campaign dispatch controls are restricted to verified System Administrators."
                    targetViewName="RENEWAL_EMAIL_EDITOR"
                  >
                    <AdminDashboard
                      initialTab="RENEWAL_EMAIL_HTML_EDITOR"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              case 'CLIENT_ADMIN':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Administrator Control Portal"
                    description="The Administrator Control Portal is restricted to verified System Administrators."
                    targetViewName="CLIENT_ADMIN"
                  >
                    <AdminDashboard
                      initialTab="ADMIN_MENU_OVERVIEW"
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

              case 'PRODUCT_IMAGE_ADMIN':
                return (
                  <AdminRouteGuard
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigate={handleNavigate}
                    title="Dedicated Product Image Management & Upload System"
                    description="Change or upload new images in JPG or any format for all listed products across the marketplace."
                    targetViewName="PRODUCT_IMAGE_ADMIN"
                  >
                    <AdminDashboard
                      initialTab="PRODUCT_IMAGE_SYSTEM"
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                      selectedCurrency={selectedCurrency}
                      onOpenPaymentCheckout={handleOpenPaymentCheckout}
                      onUpdateCurrentUser={setCurrentUser}
                    />
                  </AdminRouteGuard>
                );

              case 'WALLET_TOPUP':
                return (
                  <DedicatedTopUpWalletPage
                    currentUser={currentUser}
                    selectedCurrency={selectedCurrency}
                    onNavigate={handleNavigate}
                    onOpenStorefront={handleOpenStorefront}
                  />
                );

              case 'SUPPLIER_WITHDRAWAL':
                return (
                  <SupplierBankWithdrawalLandingPage
                    currentUser={currentUser}
                    selectedCurrency={selectedCurrency}
                    onNavigate={handleNavigate}
                  />
                );

              case 'DIRECT_TRANSFER_GUIDE':
                return (
                  <DirectSiteTransferGuidePage
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                    onOpenStorefront={handleOpenStorefront}
                  />
                );

              case 'TRADE_ASSURANCE_CERTIFICATE':
                return (
                  <TradeAssuranceCertificateView
                    selectedCurrency={selectedCurrency}
                    currentUser={currentUser}
                    onOpenPaymentCheckout={handleOpenPaymentCheckout}
                    onOpenStorefront={handleOpenStorefront}
                    onNavigate={handleNavigate}
                  />
                );

              case 'B2B_TRUST_CERTIFICATE':
                return (
                  <B2BTrustCertificatePage
                    selectedCurrency={selectedCurrency}
                    currentUser={currentUser}
                    onOpenPaymentCheckout={handleOpenPaymentCheckout}
                    onNavigate={handleNavigate}
                  />
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
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 pb-8">
        <TradeHeavenSocialBar onContactClick={() => handleOpenContactModal({ targetType: 'GENERAL' })} />
      </div>

      {activeView === 'HOMEPAGE' && <CustomerReviews />}

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

      {/* 7. GLOBAL PERSISTENT MOBILE BOTTOM NAVIGATION BAR (< md) */}
      <nav
        id="global-mobile-bottom-nav"
        aria-label="Mobile Marketplace Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_20px_-6px_rgba(15,23,42,0.12)] px-1.5 py-1"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto gap-0.5">
          <button
            type="button"
            onClick={() => {
              handleNavigate('HOMEPAGE');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeView === 'HOMEPAGE' || activeView === 'MARKETPLACE_HOME' || activeView === 'LANDING_PAGE'
                ? 'text-blue-600 bg-blue-50/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 leading-tight truncate">Home</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleNavigate('PRODUCT_DIRECTORY');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeView === 'PRODUCT_DIRECTORY'
                ? 'text-blue-600 bg-blue-50/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 leading-tight truncate">Products</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleNavigate('BUY_LEADS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeView === 'BUY_LEADS' || activeView === 'RFQ_HUB'
                ? 'text-emerald-600 bg-emerald-50/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <FileText className="w-4 h-4" />
              <span className="absolute -top-1 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-emerald-600 text-white text-[8px] font-black flex items-center justify-center">
                {rfqs.length > 99 ? '99+' : rfqs.length}
              </span>
            </div>
            <span className="text-[10px] mt-0.5 leading-tight truncate">RFQs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleNavigate('SUPPLIER_WITHDRAWAL');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeView === 'SUPPLIER_WITHDRAWAL' || activeView === 'WALLET_TOPUP'
                ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 leading-tight truncate">Withdraw</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleNavigate('DASHBOARD');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeView === 'DASHBOARD'
                ? 'text-blue-600 bg-blue-50/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className="w-4 h-4" />
              {currentUser && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight truncate">Dashboard</span>
          </button>
        </div>
      </nav>

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

        {storefrontCompanyId && activeView !== 'VENDOR_PROFILE' && (
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
          onNavigate={handleNavigate}
          onPaymentSuccess={orderId => {
            const isMembershipOrSubscription =
              !checkoutData ||
              checkoutData.type === 'SUBSCRIPTION' ||
              checkoutData.type === 'MEMBERSHIP' ||
              checkoutData.title?.toLowerCase().includes('renewal') ||
              checkoutData.title?.toLowerCase().includes('membership') ||
              checkoutData.planId?.toLowerCase().includes('renewal') ||
              checkoutData.planId?.toLowerCase().includes('vip');

            const companyName =
              checkoutData?.supplierCompany ||
              currentUser?.companyName ||
              'ACE Intermediary';

            if (currentUser && isMembershipOrSubscription) {
              setCurrentUser({
                ...currentUser,
                isPremium: true,
                membershipStatus: 'paid',
                tier: 'VIP',
                isVerified: true
              });
            }

            setRenewalSuccessToast({
              orderId,
              companyName,
              decisionMakerName: checkoutData?.decisionMakerName,
              planTitle: checkoutData?.title || 'VIP Membership Renewal',
              paymentMethod: checkoutData?.preferredPaymentMethod || 'Debit Card'
            });

            // Sync conversion status with Admin Renewal Insights
            const targetEmail =
              checkoutData?.clientEmail || currentUser?.email || 'ezekiahali355@gmail.com';
            fetch('/api/v1/admin/renewal-insights/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: targetEmail,
                eventType: 'CONVERT',
                orderId
              })
            }).catch(() => {});

            addNotification({
              type: 'ORDER',
              title: 'Membership Renewal Complete — Account Updated',
              message: `Account status for ${companyName} is now updated to Active VIP (Ref: ${orderId}). You can now access all your new membership benefits and priority trade deals.`,
              linkView: 'BUY_LEADS'
            });
          }}
        />

        {renewalSuccessToast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[100] max-w-md w-[calc(100vw-2rem)] bg-slate-900 text-white border border-emerald-500/50 rounded-2xl shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Membership Renewed • Status Updated
                  </span>
                  <button
                    type="button"
                    onClick={() => setRenewalSuccessToast(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-black text-white mt-1.5 leading-snug">
                  Account Status Updated for {renewalSuccessToast.companyName}!
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Your membership renewal payment (<span className="font-mono text-emerald-300 font-bold">{renewalSuccessToast.orderId}</span>) succeeded. Your account status is now updated and you can immediately access your new VIP benefits, priority Golden Leads, and zero-fee escrow deals.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 truncate">
                    {renewalSuccessToast.decisionMakerName
                      ? `Attn: ${renewalSuccessToast.decisionMakerName}`
                      : renewalSuccessToast.planTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutData(null);
                      setRenewalSuccessToast(null);
                      handleNavigate('BUY_LEADS');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black tracking-wide transition-colors shrink-0 cursor-pointer"
                  >
                    Access New Benefits →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <BackendDataManagementModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setAuthModalMode('LOGIN');
            setIsAuthModalOpen(true);
          }}
        />

        <CustomShareModal
          isOpen={shareModalConfig.isOpen}
          onClose={() => setShareModalConfig(prev => ({ ...prev, isOpen: false }))}
          target={shareModalConfig.target}
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

