import React from 'react';
import { Product, Currency, RfqRequirement, ActiveView, AuthUser } from '../../types';
import { CURRENCY_RATES, MOCK_COMPANIES, MOCK_RFQS, MOCK_PRODUCTS } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { SafeImage } from '../common/SafeImage';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { HeroSection } from './HeroSection';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { DynamicFaqSection } from '../common/DynamicFaqSection';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { SuppliersByRegionBar } from './SuppliersByRegionBar';
import { CountryFlag } from '../common/CountryFlag';
import { FeaturedProductsCarousel, sortTopRatedProducts } from './FeaturedProductsCarousel';
import { PlatformAnnouncementBanner } from './PlatformAnnouncementBanner';
import heroLogisticsBanner from '../../assets/images/b2b_global_logistics_hero_1795156803921.jpg';
import {
  ShieldCheck,
  Award,
  Building2,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  MessageCircle,
  ExternalLink,
  Lock,
  Headphones
} from 'lucide-react';
import { getFreshRfqDate } from '../../utils/rfqDateUtils';
import { securityService } from '../../services/securityService';
import { isPaidMemberUser } from '../../services/freeLeadService';
import { productImageManagerService } from '../../services/productImageManagerService';
import { fixSingleCatalogImage } from '../../services/visualProductImageService';
import { AdminQuickImageInspectorModal } from '../admin/AdminQuickImageInspectorModal';
import { useSiteContent } from '../../context/SiteContentContext';
import { DEFAULT_SITE_SECTION_LAYOUTS } from '../../data/defaultSiteContent';
import { mergeHomepageDisplayConfig, getResponsiveGridColsClass } from '../../utils/gridLayoutUtils';

interface Props {
  products: Product[];
  rfqs?: RfqRequirement[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenStorefront: (companyId: string) => void;
  onContactSupplier: (product: Product) => void;
  onOpenCreateRfq: () => void;
  onNavigate: (view: ActiveView) => void;
  onOpenLiveTool: (tool: 'incoterms' | 'rfq_checker' | 'api_sandbox') => void;
  onSelectRfq?: (rfq: RfqRequirement) => void;
  onNavigateToCategory?: (catName: string, subcategory?: string) => void;
  onNavigateToSuppliers?: (sectorName?: string) => void;
  onNavigateToRfqs?: (categoryName?: string) => void;
  isLoadingProducts?: boolean;
  currentUser?: AuthUser | null;
  onOpenRegisterFree?: () => void;
  onSelectCountry?: (countryId: string) => void;
}

export const TradeWheelHomePage: React.FC<Props> = ({
  products,
  rfqs = [],
  selectedCurrency,
  onSelectProduct,
  onOpenStorefront,
  onContactSupplier,
  onOpenCreateRfq,
  onNavigate,
  onOpenLiveTool,
  onSelectRfq,
  onNavigateToCategory,
  onNavigateToSuppliers,
  onNavigateToRfqs,
  isLoadingProducts = false,
  currentUser = null,
  onOpenRegisterFree,
  onSelectCountry
}) => {
  const { t, tText } = useLanguage();
  const { siteContent } = useSiteContent();
  const displayConfig = React.useMemo(
    () => mergeHomepageDisplayConfig(siteContent?.homepageDisplayConfig),
    [siteContent?.homepageDisplayConfig]
  );
  const sectionVisibility = displayConfig.sectionVisibility;
  const sectionLayouts = displayConfig.sectionLayouts || DEFAULT_SITE_SECTION_LAYOUTS;
  const featuredProductsLayout = sectionLayouts.featuredProducts;
  const recentRfqsLayout = sectionLayouts.recentRfqs;
  const verifiedSuppliersLayout = sectionLayouts.verifiedSuppliers;
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [showAllSuppliers, setShowAllSuppliers] = React.useState(false);
  const [imageSyncVersion, setImageSyncVersion] = React.useState(0);
  const [fixingProductIds, setFixingProductIds] = React.useState<Record<string, boolean>>({});
  const [uploadingProductIds, setUploadingProductIds] = React.useState<Record<string, boolean>>({});
  const [inspectingProduct, setInspectingProduct] = React.useState<{
    product: Product;
    imageUrl: string;
  } | null>(null);
  const [adminImageNotice, setAdminImageNotice] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const quickUploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const quickUploadTargetRef = React.useRef<{ product: Product; currentUrl: string } | null>(null);

  const isAdminUser = React.useMemo(() => {
    if (currentUser?.role === 'ADMIN') return true;
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem('th_verified_otp_session_v5_strict_admin');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(
        parsed &&
          parsed.role === 'ADMIN' &&
          parsed.isVerifiedAdmin === true &&
          parsed.otpVerified === true &&
          typeof parsed.token === 'string' &&
          parsed.token.trim().length >= 8
      );
    } catch {
      return false;
    }
  }, [currentUser]);

  const broadcastHomeImageChange = React.useCallback(
    async (
      prodId: string,
      newUrl: string,
      prevUrl: string,
      updatedAt?: string,
      imageUpdatedAt?: number,
      replacedOldUrls?: string[],
      deletedOldUrls?: string[]
    ) => {
      const activityMs = imageUpdatedAt || Date.now();
      productImageManagerService.recordProductActivityTimestamp(prodId, activityMs, false);
      productImageManagerService.applyServerOverrideSnapshot([
        {
          id: prodId,
          url: newUrl,
          updatedAt: updatedAt || new Date(activityMs).toISOString(),
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          replacedOldUrls: replacedOldUrls || (prevUrl ? [prevUrl] : undefined),
          deletedOldUrls
        }
      ]);
      try {
        await productImageManagerService.syncFromServer(true, false, { bypassCooldown: true });
      } catch {
        // ignore sync errors
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      setImageSyncVersion(v => v + 1);
    },
    []
  );

  const handleDirectAdminFix = React.useCallback(
    async (e: React.MouseEvent, prod: Product, currentUrl: string) => {
      e.preventDefault();
      e.stopPropagation();
      const pid = prod.id;
      setFixingProductIds(prev => ({ ...prev, [pid]: true }));
      setAdminImageNotice(null);
      try {
        const res = await fixSingleCatalogImage({
          recordId: pid,
          recordType: 'PRODUCT',
          title: prod.title,
          category: prod.category,
          previousImageUrl: currentUrl
        });
        await broadcastHomeImageChange(
          pid,
          res.new_image_url,
          currentUrl,
          res.updatedAt,
          res.imageUpdatedAt,
          res.replacedOldUrls,
          res.deletedOldUrls
        );
        setAdminImageNotice({
          type: 'success',
          text: `Fixed image for "${prod.title}" (${res.new_image_url}).`
        });
      } catch (err: any) {
        setAdminImageNotice({
          type: 'error',
          text: err?.message || `Auto-fix failed for "${prod.title}". Click Inspect or Upload to pick a photo.`
        });
      } finally {
        setFixingProductIds(prev => ({ ...prev, [pid]: false }));
      }
    },
    [broadcastHomeImageChange]
  );

  const handleDirectAdminInspect = React.useCallback(
    (e: React.MouseEvent, prod: Product, currentUrl: string) => {
      e.preventDefault();
      e.stopPropagation();
      const resolvedUrl = productImageManagerService.resolveImageSrc({
        src: currentUrl,
        productId: prod.id,
        productTitle: prod.title,
        category: prod.category
      });
      setInspectingProduct({ product: prod, imageUrl: resolvedUrl || currentUrl });
    },
    []
  );

  const handleDirectAdminUploadClick = React.useCallback(
    (e: React.MouseEvent, prod: Product, currentUrl: string) => {
      e.preventDefault();
      e.stopPropagation();
      quickUploadTargetRef.current = { product: prod, currentUrl };
      if (quickUploadInputRef.current) {
        quickUploadInputRef.current.value = '';
        quickUploadInputRef.current.click();
      }
    },
    []
  );

  const handleQuickCardFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const target = quickUploadTargetRef.current;
      if (!file || !target) return;
      const { product: prod, currentUrl } = target;
      const pid = prod.id;
      setUploadingProductIds(prev => ({ ...prev, [pid]: true }));
      setAdminImageNotice(null);
      try {
        const uploaded = await productImageManagerService.uploadAndAssignImageFile(file, {
          productId: pid,
          productName: prod.title,
          category: prod.category,
          targetFormat: 'webp',
          autoWebpLossless: true,
          oldUrlToReplace: undefined
        });
        if (!uploaded?.url || uploaded.url.startsWith('data:')) {
          throw new Error('Uploaded file could not be persisted to server storage.');
        }
        const cleanUrl = uploaded.url.split('?')[0];
        const res = await fixSingleCatalogImage({
          recordId: pid,
          recordType: 'PRODUCT',
          title: prod.title,
          category: prod.category,
          customImageUrl: cleanUrl,
          previousImageUrl: currentUrl
        });
        await broadcastHomeImageChange(
          pid,
          res.new_image_url,
          currentUrl,
          res.updatedAt,
          res.imageUpdatedAt,
          res.replacedOldUrls,
          res.deletedOldUrls
        );
        setAdminImageNotice({
          type: 'success',
          text: `Uploaded & saved SEO image for "${prod.title}" (${cleanUrl}) — old image deleted from server.`
        });
      } catch (err: any) {
        setAdminImageNotice({
          type: 'error',
          text: err?.message || `Upload failed for "${prod.title}".`
        });
      } finally {
        setUploadingProductIds(prev => ({ ...prev, [pid]: false }));
        if (quickUploadInputRef.current) quickUploadInputRef.current.value = '';
      }
    },
    [broadcastHomeImageChange]
  );

  React.useEffect(() => {
    const handleImageUpdate = () => setImageSyncVersion(v => v + 1);
    window.addEventListener('tradeheaven_product_image_saved', handleImageUpdate);
    window.addEventListener('tradeheaven_products_updated', handleImageUpdate);
    window.addEventListener('tradeheaven_auth_changed', handleImageUpdate);
    const hasBootOverrides = Boolean(
      typeof window !== 'undefined' &&
      (window as any).__TH_BOOT__?.criticalOverrides &&
      Object.keys((window as any).__TH_BOOT__.criticalOverrides).length > 0
    );
    if (!productImageManagerService.isHydrated() && !hasBootOverrides) {
      productImageManagerService.ensureHydrated().then(() => {
        setImageSyncVersion(v => v + 1);
      }).catch(() => {});
    }
    return () => {
      window.removeEventListener('tradeheaven_product_image_saved', handleImageUpdate);
      window.removeEventListener('tradeheaven_products_updated', handleImageUpdate);
      window.removeEventListener('tradeheaven_auth_changed', handleImageUpdate);
    };
  }, []);

  const isUserPaidMember = isPaidMemberUser(currentUser);

  const rawRfqsSource = React.useMemo(() => (rfqs && rfqs.length > 0 ? rfqs : MOCK_RFQS), [rfqs]);

  const activeRfqsPool = React.useMemo(() => {
    const hiddenSet = new Set(displayConfig.hiddenRfqIds || []);
    const pinnedSet = new Set(displayConfig.pinnedRfqIds || []);
    const overrides = productImageManagerService.getState().overrides || {};
    const candidates: RfqRequirement[] = [];

    for (let i = 0; i < rawRfqsSource.length; i++) {
      const r = rawRfqsSource[i];
      if (!r || !r.id || hiddenSet.has(r.id)) continue;
      const isBaselineHead = i < 50;
      const isLiveOrPinned =
        pinnedSet.has(r.id) ||
        !String(r.id).startsWith('rfq-mock') ||
        Boolean((r as any).imageUpdatedAt) ||
        Boolean((r as any).updatedAt) ||
        Boolean(overrides[r.id]) ||
        Boolean(r.productName && overrides[r.productName]);
      if (isBaselineHead || isLiveOrPinned) {
        candidates.push(r);
      }
    }

    const enriched = candidates.map(rawRfq => {
      const r = securityService.gateRfqRequirement(rawRfq, currentUser);
      const rawPhoto = (r as any).image_url || (r as any).image || (r as any).images?.[0];
      const resolvedPhoto = productImageManagerService.resolveImageSrc({
        src: rawPhoto,
        productId: r.id,
        productTitle: r.productName,
        category: r.category
      });
      const rank = productImageManagerService.getLatestUploadedRank({
        id: r.id,
        title: r.productName,
        updatedAt: (r as any).updatedAt,
        imageUpdatedAt: (r as any).imageUpdatedAt
      });
      return {
        ...r,
        rawPhotoUrl: rawPhoto,
        resolvedPhotoUrl: resolvedPhoto || rawPhoto || '',
        recentActivityTs: rank.timestampMs
      };
    });

    enriched.sort((a, b) => {
      if (a.recentActivityTs !== b.recentActivityTs) {
        return b.recentActivityTs - a.recentActivityTs;
      }
      return 0;
    });

    return enriched.slice(0, 40);
  }, [rawRfqsSource, currentUser, imageSyncVersion, displayConfig.hiddenRfqIds, displayConfig.pinnedRfqIds]);

  const displayedRfqs = React.useMemo(() => {
    const rfqLimit = Math.max(1, recentRfqsLayout.itemCount || 8);
    const pinnedIds = displayConfig.pinnedRfqIds || [];
    const mode = displayConfig.featuredRfqsMode || 'PINNED_FIRST';
    if (mode !== 'AUTO_LATEST' && pinnedIds.length > 0) {
      const byId = new Map(activeRfqsPool.map(r => [r.id, r]));
      const pinned = pinnedIds.map(id => byId.get(id)).filter(Boolean) as typeof activeRfqsPool;
      if (mode === 'PINNED_ONLY' && pinned.length > 0) {
        return pinned.slice(0, rfqLimit);
      }
      const pinnedSet = new Set(pinned.map(r => r.id));
      const rest = activeRfqsPool.filter(r => !pinnedSet.has(r.id));
      return [...pinned, ...rest].slice(0, rfqLimit);
    }
    return activeRfqsPool.slice(0, rfqLimit);
  }, [activeRfqsPool, displayConfig.pinnedRfqIds, displayConfig.featuredRfqsMode, recentRfqsLayout.itemCount]);

  const featuredProducts = React.useMemo(() => {
    const prodLimit = Math.max(1, featuredProductsLayout.itemCount || 12);
    const hasLiveProducts = Boolean(products && products.length > 0);
    const source = hasLiveProducts ? products : MOCK_PRODUCTS;
    const synced =
      !hasLiveProducts || imageSyncVersion > 0
        ? productImageManagerService.sortProductsLatestUploadedFirst(
            productImageManagerService.applyOverridesToProductList(source)
          )
        : source;
    const hiddenSet = new Set(displayConfig.hiddenProductIds || []);
    const visibleSynced = synced.filter(p => p && !hiddenSet.has(p.id));
    const filtered = selectedCategory
      ? visibleSynced.filter(
          p => p && (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase())
        )
      : visibleSynced;
    const pool = filtered.length > 0 ? filtered : visibleSynced;
    const topRatedPool = sortTopRatedProducts(pool);

    const pinnedIds = displayConfig.pinnedProductIds || [];
    const mode = displayConfig.featuredProductsMode || 'PINNED_FIRST';
    if (!selectedCategory && mode !== 'AUTO_LATEST' && pinnedIds.length > 0) {
      const byId = new Map(topRatedPool.map(p => [p.id, p]));
      const pinned = pinnedIds.map(id => byId.get(id)).filter(Boolean) as Product[];
      if (mode === 'PINNED_ONLY' && pinned.length > 0) {
        return pinned.slice(0, prodLimit);
      }
      const pinnedSet = new Set(pinned.map(p => p.id));
      const rest = topRatedPool.filter(p => !pinnedSet.has(p.id));
      return [...pinned, ...rest].slice(0, prodLimit);
    }
    return topRatedPool.slice(0, prodLimit);
  }, [
    products,
    selectedCategory,
    imageSyncVersion,
    displayConfig.pinnedProductIds,
    displayConfig.hiddenProductIds,
    displayConfig.featuredProductsMode,
    featuredProductsLayout.itemCount
  ]);

  const displayedCompanies = React.useMemo(() => {
    const supplierLimit = Math.max(1, verifiedSuppliersLayout.itemCount || 6);
    const hiddenSet = new Set(displayConfig.hiddenSupplierIds || []);
    const visible = MOCK_COMPANIES.filter(c => !hiddenSet.has(c.id));
    const pinnedIds = displayConfig.pinnedSupplierIds || [];
    let ordered = visible;
    if (pinnedIds.length > 0) {
      const byId = new Map(visible.map(c => [c.id, c]));
      const pinned = pinnedIds.map(id => byId.get(id)).filter(Boolean) as typeof visible;
      const pinnedSet = new Set(pinned.map(c => c.id));
      ordered = [...pinned, ...visible.filter(c => !pinnedSet.has(c.id))];
    }
    return (showAllSuppliers ? ordered : ordered.slice(0, supplierLimit)).map(c =>
      securityService.gateCompanyProfile(c, currentUser)
    );
  }, [
    currentUser,
    showAllSuppliers,
    displayConfig.pinnedSupplierIds,
    displayConfig.hiddenSupplierIds,
    verifiedSuppliersLayout.itemCount
  ]);

  const curr =
    (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) ||
    CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const safeUsd = Number(usd);
    const converted = (Number.isFinite(safeUsd) ? safeUsd : 0) * (curr?.rateToUSD || 1);
    return `${curr?.symbol || '$'}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleHeroSearch = (
    query: string,
    category: string,
    targetMode?: 'PRODUCTS' | 'RFQS' | 'SUPPLIERS'
  ) => {
    if (category) {
      setSelectedCategory(category);
    }
    if (targetMode === 'SUPPLIERS' && onNavigateToSuppliers) {
      onNavigateToSuppliers(query);
    } else if (targetMode === 'RFQS' && onNavigateToRfqs) {
      onNavigateToRfqs(query);
    } else if (onNavigateToCategory) {
      onNavigateToCategory(category || 'ALL', query);
    }
  };

  const handleSelectCategoryFromMenu = (catName: string) => {
    setSelectedCategory(catName || null);
    if (catName) {
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div id="tradewheel-homepage-root" className="space-y-6 sm:space-y-8 pb-20 md:pb-4">
      {/* 1. TRADEWHEEL-STYLE 3-COLUMN PORTAL HERO & OMNIBAR */}
      <HeroSection
        onSearch={handleHeroSearch}
        onOpenCreateRfq={onOpenCreateRfq}
        onOpenLiveTool={onOpenLiveTool}
        products={products}
        rfqs={rawRfqsSource}
        selectedCurrency={selectedCurrency}
        onSelectProduct={onSelectProduct}
        onOpenStorefront={onOpenStorefront}
        onNavigate={onNavigate}
        onSelectRfq={onSelectRfq}
        onOpenRegisterFree={onOpenRegisterFree}
      />

      {/* 1.5 ADMIN-PUBLISHED STOREFRONT BANNERS & ANNOUNCEMENTS */}
      {sectionVisibility.announcementBanner && (
        <PlatformAnnouncementBanner variant="hero-banner" onNavigate={onNavigate} />
      )}

      {/* 2. LATEST BUY OFFERS & GLOBAL RFQS FEED */}
      {sectionVisibility.recentRfqs && (
      <section
        id="recent-rfqs-section"
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
              Live Global Demand · Importer Buy Leads
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F294D] mt-0.5">
              {t('recentBuyLeads')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified international buyers seeking direct factory quotations. Submit competitive bids directly.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCreateRfq}
              className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Post Buying Request</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('BUY_LEADS')}
              className="px-4 py-2 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
            >
              <span>{t('viewAllRfqs')} ({activeRfqsPool.length})</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>

        {displayedRfqs && displayedRfqs.length > 0 ? (
          <div className="space-y-4">
            <div className={`grid ${getResponsiveGridColsClass(recentRfqsLayout.columns)} gap-4`}>
              {displayedRfqs.map((rfq: any) => (
                <article
                  key={rfq.id}
                  onClick={() => (onSelectRfq ? onSelectRfq(rfq) : onNavigate('BUY_LEADS'))}
                  className="bg-white rounded-xl border border-slate-200 hover:border-[#0F294D] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="aspect-4/3 bg-slate-100 border-b border-slate-100 overflow-hidden">
                      <SafeImage
                        src={rfq.resolvedPhotoUrl || rfq.rawPhotoUrl}
                        fallbackSrc={rfq.rawPhotoUrl}
                        alt={rfq.productName}
                        productId={rfq.id}
                        productTitle={rfq.productName}
                        category={rfq.category}
                        type="rfq"
                        isThumbnail={true}
                        disableLiveUpload={true}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 tabular-nums">
                        <span className="font-mono font-bold text-slate-700 truncate">
                          {rfq.id}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{getFreshRfqDate(rfq)}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-emerald-700">{rfq.quotesCount} Bids</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0F294D] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                        {rfq.productName}
                      </h3>

                      <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500">Quantity:</span>
                          <span className="font-semibold text-slate-900 tabular-nums truncate">
                            {Number(rfq?.targetQuantity || 0).toLocaleString()} {rfq?.quantityUnit || 'Units'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500">Destination:</span>
                          <span className="font-semibold text-slate-800 truncate">
                            {rfq.destinationPort}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-500">{rfq.preferredIncoterm}:</span>
                          <span className="font-semibold text-slate-700 inline-flex items-center gap-1 shrink-0">
                            <span>Target Open</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-3.5 py-2.5 bg-[#F8FAFC] border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 min-w-0 font-semibold text-slate-700">
                      <CountryFlag country={rfq.buyerCountry} size="xs" />
                      <span className="truncate">{rfq.buyerCountry}</span>
                    </span>
                    <span className="text-[#EA580C] font-bold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <span>Quote</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Tell Us Your Buying Requirement Bottom Strip */}
            <div className="p-4 rounded-xl bg-[#0F294D] text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm font-bold text-white">
                  Cannot find the exact specification? Broadcast a custom Buying Request to 12,500+ factories.
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 tabular-nums">
                  Showing {displayedRfqs.length} featured buy offers of {activeRfqsPool.length} active international requests
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenCreateRfq}
                  className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Post Buying Request
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('BUY_LEADS')}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span>Full RFQ Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="text-sm font-bold text-slate-800">No active buying requirements posted yet</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Post the first request for quotation (RFQ) and start receiving direct quotes from verified global manufacturers.
            </p>
            <button
              type="button"
              onClick={onOpenCreateRfq}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New RFQ Now</span>
            </button>
          </div>
        )}
      </section>
      )}

      {/* 3. FEATURED TOP-RATED PRODUCTS AUTO-SLIDING CAROUSEL */}
      {sectionVisibility.featuredProducts && (
        <>
          <FeaturedProductsCarousel
            products={featuredProducts}
            selectedCategory={selectedCategory}
            onClearCategory={() => setSelectedCategory(null)}
            onSelectProduct={onSelectProduct}
            onContactSupplier={onContactSupplier}
            onViewAllProducts={() => onNavigate('PRODUCT_DIRECTORY')}
            formatPrice={formatPrice}
            isLoading={isLoadingProducts}
            layoutMode={featuredProductsLayout.layoutMode}
            desktopColumns={featuredProductsLayout.columns}
            rows={featuredProductsLayout.rows}
            autoSlide={featuredProductsLayout.autoSlide !== false}
            autoSlideIntervalMs={featuredProductsLayout.autoSlideIntervalMs || 4500}
            isAdminUser={isAdminUser}
            fixingProductIds={fixingProductIds}
            uploadingProductIds={uploadingProductIds}
            isAdminInspecting={Boolean(inspectingProduct)}
            adminImageNotice={adminImageNotice}
            onDismissAdminNotice={() => setAdminImageNotice(null)}
            onAdminFix={(e, prod, currentUrl) => void handleDirectAdminFix(e, prod, currentUrl)}
            onAdminInspect={handleDirectAdminInspect}
            onAdminUploadClick={handleDirectAdminUploadClick}
            quickUploadInputRef={quickUploadInputRef}
            onQuickCardFileChange={e => void handleQuickCardFileChange(e)}
          />

          {isAdminUser && inspectingProduct && (
            <AdminQuickImageInspectorModal
              product={inspectingProduct.product}
              currentImageUrl={inspectingProduct.imageUrl}
              onClose={() => setInspectingProduct(null)}
              onImageUpdated={(_productId, newUrl) => {
                setImageSyncVersion(v => v + 1);
                setAdminImageNotice({
                  type: 'success',
                  text: `Updated image for "${inspectingProduct.product.title}" (${newUrl}).`
                });
              }}
            />
          )}
        </>
      )}

      {/* 4. VERIFIED B2B INDUSTRIES & CATEGORY SHOWCASE */}
      {sectionVisibility.categoryShowcase && (
      <CategoryMegaMenu
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryFromMenu}
        onNavigateToCategory={
          onNavigateToCategory ||
          (cat => {
            setSelectedCategory(cat);
            onNavigate('PRODUCT_DIRECTORY');
          })
        }
        onNavigateToSuppliers={onNavigateToSuppliers || (() => onNavigate('SUPPLIERS_DIRECTORY'))}
        onNavigateToRfqs={onNavigateToRfqs || (() => onNavigate('BUY_LEADS'))}
        onNavigate={onNavigate}
        onOpenCreateRfq={onOpenCreateRfq}
      />
      )}

      {/* 5. AUDITED GLOBAL MANUFACTURERS & SUPPLIERS SHOWCASE */}
      {sectionVisibility.verifiedSuppliers && (
      <section className="cv-auto bg-[#F8FAFC] text-slate-900 rounded-2xl p-5 sm:p-8 space-y-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 inline-flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>ISO 9001 · CE · TÜV Verified Exporters</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F294D] mt-0.5">
              {t('auditedSuppliersHeading')}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Inspect on-site factory audit credentials, production capacity, and verified trade protection coverage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
            className="px-4 py-2.5 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>{t('exploreAllSuppliers')}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        <div className={`grid ${getResponsiveGridColsClass(verifiedSuppliersLayout.columns)} gap-4`}>
          {displayedCompanies.map((company, index) => (
            <article
              key={company.id || index}
              onClick={() => onOpenStorefront(company.id)}
              className="bg-white border border-slate-200 hover:border-[#0F294D] rounded-xl p-5 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={company.logoUrl}
                    alt={company.companyName}
                    type="logo"
                    isThumbnail={true}
                    className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="font-bold uppercase text-[#0F294D]">{company.tier}</span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <CountryFlag country={company.country} size="xs" />
                        <span className="truncate">{tText(company.country)}</span>
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0F294D] transition-colors truncate mt-0.5">
                      {company.companyName}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs tabular-nums">
                  <div>
                    <div className="text-[10px] text-slate-500">{t('tradeAssurance')}</div>
                    <div className="font-mono font-bold text-emerald-700">
                      ${(Number(company?.tradeAssuranceLimitUsd || 0) / 1000).toFixed(0)}k USD
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">{t('factorySize')}</div>
                    <div className="font-bold text-slate-800">
                      {Number(company?.factorySizeSqM || 0) > 0
                        ? `${Number(company.factorySizeSqM).toLocaleString()} m²`
                        : 'Trading Desk'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 truncate pr-2">
                  {isUserPaidMember
                    ? company.contactPerson
                      ? `Liaison: ${company.contactPerson}`
                      : 'Direct Factory Contact'
                    : 'Verified Factory Profile'}
                </span>
                <span className="text-[#EA580C] font-bold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <span>{t('viewFactoryAudit')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 tabular-nums">
            Showing <strong className="text-slate-900">{displayedCompanies.length}</strong> of{' '}
            <strong className="text-slate-900">{MOCK_COMPANIES.length}</strong> audited supplier profiles
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAllSuppliers(!showAllSuppliers)}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {showAllSuppliers
                ? `Show Top ${verifiedSuppliersLayout.itemCount} Suppliers`
                : `Show All ${MOCK_COMPANIES.length} Suppliers`}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
              className="px-4 py-2 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>{t('fullSupplierDirectory')}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </section>
      )}

      {/* 6. PARTNER ONBOARDING BANNER */}
      {sectionVisibility.onboardingBanner && (
      <section className="cv-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 max-w-2xl text-center sm:text-left">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
              <EditableImage
                contentKey="homepage.onboardingBannerImage"
                defaultSrc={heroLogisticsBanner}
                alt="Trade Heaven Verified Global Partner Network"
                targetWidth={320}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Free Registration · Verified Partner Network</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F294D] leading-tight">
                <EditableText
                  contentKey="homepage.onboardingBannerTitle"
                  defaultText="Ready to Board with Us? Connect with"
                />{' '}
                <span className="text-[#EA580C]">
                  <EditableText
                    contentKey="homepage.onboardingBannerHighlight"
                    defaultText="Audited Factories & Verified Buyers"
                  />
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <EditableText
                  contentKey="homepage.onboardingBannerDesc"
                  defaultText="Register as an international importer or audited factory to access global buyer RFQs, Trade Assurance protection, and direct wholesale pricing."
                />
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('ONBOARD_WITH_US')}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                <EditableText contentKey="homepage.btnOnboard" defaultText="Onboard / Work With Us" />
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('POST_BUY_REQUIREMENT')}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>
                <EditableText contentKey="homepage.btnPostRfq" defaultText="Post Free Buy RFQ" />
              </span>
            </button>
          </div>
        </div>
      </section>
      )}

      {/* 7. DYNAMIC FAQS ACCORDION */}
      {sectionVisibility.faqSection && (
        <DynamicFaqSection onOpenContactModal={onOpenCreateRfq} />
      )}

      {/* 8. WHY CHOOSE TRADE HEAVEN & DIRECT DESK */}
      {sectionVisibility.whyChooseSection && (
      <section className="cv-auto bg-white text-slate-900 rounded-2xl p-6 sm:p-9 space-y-7 border border-slate-200 shadow-2xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Trade Assurance &amp; Compliance Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F294D]">
            Why Enterprise Importers &amp; Factories Choose Trade Heaven
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Reducing cross-border procurement risk with verified supplier KYC checks, pre-shipment inspections, and transparent Incoterms reconciliation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#0F294D]">Trade Assurance Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured payment milestones aligned with verified Bills of Lading (B/L) and third-party SGS pre-shipment inspections.
            </p>
          </div>

          <div className="p-5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-[#0F294D] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#0F294D]">Factory On-Site Audits</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gold and VIP exporters undergo legal business verification, ISO compliance checks, and production capacity reviews.
            </p>
          </div>

          <div className="p-5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 text-[#EA580C] flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#0F294D]">Dedicated Trade Specialists</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Procurement specialists support Incoterms 2020 structuring, container freight coordination, and buyer-supplier mediation.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-[#F8FAFC] rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                Need Urgent Sourcing or Factory Matchmaking?
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5 tabular-nums">
                Connect directly with our senior trade desk on WhatsApp: +91 8532934479
              </div>
            </div>
          </div>

          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
      )}

      {/* 9. GLOBAL BUYERS & SUPPLIERS BY REGION BAR */}
      {sectionVisibility.regionBar && (
      <SuppliersByRegionBar
        onSelectCountry={(countryId) => {
          if (onSelectCountry) {
            onSelectCountry(countryId);
          } else {
            onNavigate('COUNTRY_HUB');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onKeywordClick={(keyword) => {
          if (onNavigateToCategory) {
            onNavigateToCategory('ALL', keyword);
          } else {
            onNavigate('PRODUCT_DIRECTORY');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      )}
    </div>
  );
};
