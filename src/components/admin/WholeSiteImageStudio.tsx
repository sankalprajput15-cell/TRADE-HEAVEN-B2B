import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Upload,
  Wand2,
  Search,
  RefreshCw,
  Check,
  X,
  Link2,
  Trash2,
  FolderUp,
  Square,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  Eye,
  Crop
} from 'lucide-react';
import { ActiveView, Product, RfqRequirement } from '../../types';
import { AdminQuickImageInspectorModal } from './AdminQuickImageInspectorModal';
import { ImageEditingOverlay } from './ImageEditingOverlay';
import { useSiteContent } from '../../context/SiteContentContext';
import { CATEGORIES_TREE, MOCK_PRODUCTS, MOCK_RFQS } from '../../data/mockData';
import { api } from '../../services/apiService';
import {
  productImageManagerService,
  normalizeProductAssetUrl,
  optimizeImageUrl
} from '../../services/productImageManagerService';
import {
  isGenericOrPlaceholderImageUrl,
  isSyntheticSpecCardOrPlaceholder,
  extractProductHeadingSearchQueries,
  matchesProductHeadingSearch
} from '../../services/visualProductImageService';
import {
  replaceSiteImage,
  autoFixSiteImages,
  deleteSiteImageFile
} from '../../services/siteImageControlService';

export type SiteImageTargetType = 'PRODUCT' | 'CATEGORY' | 'RFQ' | 'HERO_SLIDE' | 'SITE_ASSET';

interface UnifiedSiteImageItem {
  id: string;
  type: SiteImageTargetType;
  title: string;
  category: string;
  fieldPath?: string;
  baseUrl: string;
  currentUrl: string;
  status: 'VERIFIED' | 'DUPLICATE' | 'NEEDS_FIX';
  statusDetail: string;
  updatedAt?: string;
  changedAtMs: number;
  isChangedLive: boolean;
  sessionAction?: 'UPLOAD' | 'AUTO_FIX' | 'URL';
  siteLocationLabel: string;
  liveRouteView: ActiveView;
  liveHref: string;
  isOnHomepage?: boolean;
}

interface BulkUploadQueueItem {
  queueId: string;
  file: File;
  previewUrl: string;
  targetId: string;
  matchNote: string;
  state: 'ready' | 'uploading' | 'done' | 'error';
  message?: string;
}

type ScopeFilter = 'ALL' | 'CHANGED' | 'NEEDS_FIX' | 'DUPLICATE' | 'SKIPPED' | 'PRODUCT' | 'CATEGORY' | 'RFQ' | 'BANNERS';

interface WholeSiteImageStudioProps {
  onViewLiveItem?: (item: { recordId: string; recordType: string }) => void;
}

const ITEMS_PER_PAGE = 25;

function formatRelativeChangeTime(ms: number): string {
  if (!ms || !Number.isFinite(ms)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function cleanBaseUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  return normalizeProductAssetUrl(url).split('?')[0].trim();
}

function getNestedString(obj: any, dotPath: string): string {
  if (!obj || typeof obj !== 'object') return '';
  const parts = dotPath.split('.');
  let cur: any = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return '';
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : '';
}

function matchFileToSiteItem(
  fileName: string,
  items: UnifiedSiteImageItem[]
): { targetId: string; matchNote: string } {
  const base = fileName.replace(/\.[^/.]+$/, '').trim().toLowerCase();
  const normalized = base.replace(/[\s_]+/g, '-');
  const compact = base.replace(/[^a-z0-9]/g, '');

  for (const it of items) {
    const lid = it.id.toLowerCase();
    if (lid === normalized || lid === base || lid.replace(/[^a-z0-9]/g, '') === compact) {
      return { targetId: it.id, matchNote: 'Exact ID match' };
    }
  }

  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !['img', 'image', 'photo', 'pic', 'product', 'new', 'final', 'copy', 'webp', 'jpg', 'png'].includes(t));

  if (tokens.length > 0) {
    let best: UnifiedSiteImageItem | null = null;
    let bestScore = 0;
    for (const it of items) {
      const hay = `${it.id} ${it.title} ${it.category}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (hay.includes(tok)) score += tok.length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = it;
      }
    }
    if (best && bestScore >= 4) {
      return { targetId: best.id, matchNote: 'Title match' };
    }
  }

  return { targetId: '', matchNote: 'Select target manually' };
}

export const WholeSiteImageStudio: React.FC<WholeSiteImageStudioProps> = ({ onViewLiveItem }) => {
  const { siteContent, refreshFromServer } = useSiteContent();

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [rfqs, setRfqs] = useState<RfqRequirement[]>(MOCK_RFQS);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(true);
  const [stateVersion, setStateVersion] = useState<number>(0);

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const [busyRowIds, setBusyRowIds] = useState<Record<string, string>>({});
  const [urlEditor, setUrlEditor] = useState<{ itemId: string; value: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [inspectingItem, setInspectingItem] = useState<UnifiedSiteImageItem | null>(null);
  const [croppingItem, setCroppingItem] = useState<UnifiedSiteImageItem | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    changedItem?: UnifiedSiteImageItem;
    showChangedTabShortcut?: boolean;
  } | null>(null);
  const [totalDeletedFilesSession, setTotalDeletedFilesSession] = useState<number>(0);
  const [sessionChanges, setSessionChanges] = useState<
    Record<string, { changedAt: number; action: 'UPLOAD' | 'AUTO_FIX' | 'URL'; deletedOldCount: number }>
  >({});
  const [skippedItems, setSkippedItems] = useState<Record<string, { reason: string; at: number }>>({});
  const [brokenThumbIds, setBrokenThumbIds] = useState<Record<string, boolean>>({});
  const autoFixedOutRowIdsRef = useRef<Set<string>>(new Set());
  const isAutoFixingVisibleOutRef = useRef<boolean>(false);

  // Batch Auto-Fix state
  const [batchProgress, setBatchProgress] = useState<{
    active: boolean;
    total: number;
    completed: number;
    fixed: number;
    failed: number;
    deletedOld: number;
    currentLabel: string;
  } | null>(null);
  const abortBatchRef = useRef<boolean>(false);

  // Bulk Upload drawer state
  const [showBulkUploader, setShowBulkUploader] = useState<boolean>(false);
  const [bulkQueue, setBulkQueue] = useState<BulkUploadQueueItem[]>([]);
  const [bulkTargetFilter, setBulkTargetFilter] = useState<string>('');
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);

  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  // Single-row & Selected-rows hidden file pickers
  const rowFileInputRef = useRef<HTMLInputElement | null>(null);
  const rowUploadTargetRef = useRef<UnifiedSiteImageItem | null>(null);
  const selectedRowsUploadInputRef = useRef<HTMLInputElement | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAllInventory = useCallback(async (forceSync = false) => {
    setIsLoadingInventory(true);
    try {
      if (forceSync) {
        await Promise.allSettled([
          productImageManagerService.syncFromServer(true, false, {
            bypassCooldown: true,
            emitEvenIfUnchanged: true
          }),
          refreshFromServer()
        ]);
      } else {
        await productImageManagerService.ensureHydrated().catch(() => {});
      }

      const [prodRes, rfqRes, snapRes] = await Promise.allSettled([
        api.getProducts(),
        api.getRfqs(),
        fetch('/data/fullCatalogSnapshot.json', { cache: 'no-store' })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null)
      ]);

      const snapItems: any[] =
        snapRes.status === 'fulfilled' && snapRes.value
          ? Array.isArray(snapRes.value)
            ? snapRes.value
            : Array.isArray(snapRes.value.items)
              ? snapRes.value.items
              : Array.isArray(snapRes.value.records)
                ? snapRes.value.records
                : []
          : [];

      const mergedProdMap = new Map<string, Product>();
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        for (const p of prodRes.value) {
          if (p?.id) mergedProdMap.set(String(p.id).trim(), p);
        }
      }
      for (const p of MOCK_PRODUCTS) {
        if (p?.id && !mergedProdMap.has(String(p.id).trim())) {
          mergedProdMap.set(String(p.id).trim(), p);
        }
      }
      for (const s of snapItems) {
        if (!s?.id || s.type === 'RFQ' || s.type === 'CATEGORY') continue;
        const sid = String(s.id).trim();
        if (!sid || mergedProdMap.has(sid)) continue;
        const imgUrl = String(s.image_url || s.image || s.images?.[0] || '').trim();
        mergedProdMap.set(sid, {
          id: sid,
          title: String(s.title || sid),
          category: String(s.category || 'General Trade'),
          subCategory: String(s.subCategory || ''),
          images: imgUrl ? [imgUrl] : [],
          description: String(s.description || s.title || '')
        } as Product);
      }
      if (mergedProdMap.size > 0) {
        setProducts(Array.from(mergedProdMap.values()));
      }

      const mergedRfqMap = new Map<string, RfqRequirement>();
      if (rfqRes.status === 'fulfilled' && Array.isArray(rfqRes.value)) {
        for (const r of rfqRes.value) {
          if (r?.id) mergedRfqMap.set(String(r.id).trim(), r);
        }
      }
      for (const r of MOCK_RFQS) {
        if (r?.id && !mergedRfqMap.has(String(r.id).trim())) {
          mergedRfqMap.set(String(r.id).trim(), r);
        }
      }
      for (const s of snapItems) {
        if (!s?.id || s.type !== 'RFQ') continue;
        const sid = String(s.id).trim();
        if (!sid || mergedRfqMap.has(sid)) continue;
        const imgUrl = String(s.image_url || s.image || s.images?.[0] || '').trim();
        mergedRfqMap.set(sid, {
          id: sid,
          productName: String(s.title || s.productName || sid),
          category: String(s.category || 'Buy Lead'),
          image: imgUrl,
          images: imgUrl ? [imgUrl] : []
        } as unknown as RfqRequirement);
      }
      if (mergedRfqMap.size > 0) {
        setRfqs(Array.from(mergedRfqMap.values()));
      }
      setStateVersion(v => v + 1);
    } finally {
      setIsLoadingInventory(false);
    }
  }, [refreshFromServer]);

  useEffect(() => {
    void loadAllInventory(true);
    const onImageEvent = () => setStateVersion(v => v + 1);
    window.addEventListener('tradeheaven_product_images_updated', onImageEvent);
    window.addEventListener('tradeheaven_product_image_saved', onImageEvent);
    return () => {
      window.removeEventListener('tradeheaven_product_images_updated', onImageEvent);
      window.removeEventListener('tradeheaven_product_image_saved', onImageEvent);
    };
  }, [loadAllInventory]);

  // Build unified inventory across the ENTIRE website with exact live site locations
  const allItems = useMemo<UnifiedSiteImageItem[]>(() => {
    const overrides = productImageManagerService.getState().overrides || {};
    const rawList: Array<Omit<UnifiedSiteImageItem, 'status' | 'statusDetail'>> = [];
    const seenIds = new Set<string>();

    const parseUpdatedMs = (ov: any, id: string): number => {
      const ses = sessionChanges[id]?.changedAt || 0;
      const imgTs = Number(ov?.imageUpdatedAt || 0);
      const isoTs = ov?.updatedAt ? Date.parse(String(ov.updatedAt)) || 0 : 0;
      return Math.max(ses, imgTs, isoTs);
    };

    const pinnedProductSet = new Set<string>(
      Array.isArray(siteContent?.homepageDisplayConfig?.pinnedProductIds)
        ? siteContent.homepageDisplayConfig.pinnedProductIds
        : []
    );
    const hiddenProductSet = new Set<string>(
      Array.isArray(siteContent?.homepageDisplayConfig?.hiddenProductIds)
        ? siteContent.homepageDisplayConfig.hiddenProductIds
        : []
    );
    const homepageProductCount = Math.max(
      12,
      Number(siteContent?.homepageDisplayConfig?.sectionLayouts?.featuredProducts?.itemCount || 12)
    );
    const topHomepageProductIds = new Set<string>(pinnedProductSet);
    for (const p of products) {
      if (topHomepageProductIds.size >= homepageProductCount) break;
      if (p?.id && !hiddenProductSet.has(p.id)) {
        topHomepageProductIds.add(p.id);
      }
    }

    const pushRaw = (entry: Omit<UnifiedSiteImageItem, 'status' | 'statusDetail'>) => {
      if (!entry.id || seenIds.has(entry.id)) return;
      seenIds.add(entry.id);
      rawList.push(entry);
    };

    // 1. Hero Slides & Core Site Banners / Brand Assets
    const heroSlides = Array.isArray(siteContent?.homepage?.heroSlides)
      ? siteContent.homepage.heroSlides
      : [];
    heroSlides.forEach((slide, idx) => {
      const id = String(slide?.id || `hero-slide-${idx + 1}`).trim();
      const ov = overrides[id];
      const base = cleanBaseUrl(slide?.image);
      const current = cleanBaseUrl(ov?.primary || slide?.image);
      const changedAtMs = parseUpdatedMs(ov, id);
      pushRaw({
        id,
        type: 'HERO_SLIDE',
        title: slide?.title || `Hero Slide #${idx + 1}`,
        category: 'Homepage Hero Carousel',
        baseUrl: base,
        currentUrl: current,
        updatedAt: ov?.updatedAt,
        changedAtMs,
        isChangedLive: Boolean(sessionChanges[id] || (ov?.primary && changedAtMs > 0)),
        sessionAction: sessionChanges[id]?.action,
        siteLocationLabel: `Homepage → Hero Banner Carousel (Slide #${idx + 1})`,
        liveRouteView: 'HOMEPAGE',
        liveHref: '/?view=HOMEPAGE',
        isOnHomepage: true
      });
    });

    const coreSiteAssetSlots: Array<{
      id: string;
      title: string;
      category: string;
      fieldPath: string;
      locationLabel: string;
      routeView: ActiveView;
      liveHref: string;
    }> = [
      { id: 'site-hero-bg', title: 'Homepage Main Hero Background', category: 'Homepage Banner', fieldPath: 'homepage.heroBgImage', locationLabel: 'Homepage → Top Hero Banner Background', routeView: 'HOMEPAGE', liveHref: '/?view=HOMEPAGE' },
      { id: 'site-onboarding-banner', title: 'Homepage Partner Onboarding Banner', category: 'Homepage Banner', fieldPath: 'homepage.onboardingBannerImage', locationLabel: 'Homepage → Partner Onboarding Section', routeView: 'HOMEPAGE', liveHref: '/?view=HOMEPAGE' },
      { id: 'site-brand-logo', title: 'Header & Footer Brand Logo', category: 'Global Brand', fieldPath: 'brand.logoUrl', locationLabel: 'Global Header & Footer (All Pages)', routeView: 'HOMEPAGE', liveHref: '/?view=HOMEPAGE' },
      { id: 'site-products-banner', title: 'Products Directory Header Banner', category: 'Directory Banner', fieldPath: 'productsDirectory.bannerImage', locationLabel: 'Products Catalog Page → Top Banner', routeView: 'PRODUCT_DIRECTORY', liveHref: '/?view=PRODUCT_DIRECTORY' },
      { id: 'site-buyleads-banner', title: 'Buy Leads & RFQs Header Banner', category: 'Directory Banner', fieldPath: 'buyLeads.bannerImage', locationLabel: 'Buy Leads & RFQs Page → Top Banner', routeView: 'BUY_LEADS', liveHref: '/?view=BUY_LEADS' },
      { id: 'site-suppliers-banner', title: 'Verified Suppliers Header Banner', category: 'Directory Banner', fieldPath: 'suppliersDirectory.bannerImage', locationLabel: 'Verified Suppliers Page → Top Banner', routeView: 'SUPPLIERS_DIRECTORY', liveHref: '/?view=SUPPLIERS_DIRECTORY' },
      { id: 'site-post-rfq-banner', title: 'Post Buying Request Banner', category: 'Page Banner', fieldPath: 'postBuyingRequest.bannerImage', locationLabel: 'Post Buy Requirement Page → Header Banner', routeView: 'POST_BUY_REQUIREMENT', liveHref: '/?view=POST_BUY_REQUIREMENT' },
      { id: 'site-post-offer-banner', title: 'Post Sell Offer Banner', category: 'Page Banner', fieldPath: 'postSellOffer.bannerImage', locationLabel: 'Post Sell Offer Page → Header Banner', routeView: 'POST_SELL_OFFER', liveHref: '/?view=POST_SELL_OFFER' },
      { id: 'site-membership-banner', title: 'Premium Membership Banner', category: 'Page Banner', fieldPath: 'membership.bannerImage', locationLabel: 'Premium Membership Page → Header Banner', routeView: 'PREMIUM_MEMBERSHIP', liveHref: '/?view=PREMIUM_MEMBERSHIP' },
      { id: 'site-escrow-banner', title: 'Escrow & Trade Assurance Banner', category: 'Page Banner', fieldPath: 'escrow.bannerImage', locationLabel: 'Escrow & Mediator Page → Header Banner', routeView: 'MEDIATOR_ENGINE', liveHref: '/?view=MEDIATOR_ENGINE' }
    ];

    for (const slot of coreSiteAssetSlots) {
      const fieldUrl = getNestedString(siteContent, slot.fieldPath);
      const ov = overrides[slot.id];
      const current = cleanBaseUrl(fieldUrl || ov?.primary);
      const changedAtMs = parseUpdatedMs(ov, slot.id);
      pushRaw({
        id: slot.id,
        type: 'SITE_ASSET',
        title: slot.title,
        category: slot.category,
        fieldPath: slot.fieldPath,
        baseUrl: cleanBaseUrl(fieldUrl),
        currentUrl: current,
        updatedAt: ov?.updatedAt,
        changedAtMs,
        isChangedLive: Boolean(sessionChanges[slot.id] || (ov?.primary && changedAtMs > 0)),
        sessionAction: sessionChanges[slot.id]?.action,
        siteLocationLabel: slot.locationLabel,
        liveRouteView: slot.routeView,
        liveHref: slot.liveHref,
        isOnHomepage: slot.routeView === 'HOMEPAGE'
      });
    }

    // 2. Homepage Categories / Procurement Sectors
    const siteCats = Array.isArray(siteContent?.homepage?.categoriesList)
      ? siteContent.homepage.categoriesList
      : [];
    const catList = siteCats.length > 0
      ? siteCats
      : (CATEGORIES_TREE || []).map(c => ({ id: c.id, name: c.name, image: c.image || '' }));

    for (const cat of catList) {
      const id = String(cat?.id || '').trim();
      if (!id) continue;
      const ov = overrides[id];
      const current = cleanBaseUrl(ov?.primary || cat?.image);
      const changedAtMs = parseUpdatedMs(ov, id);
      pushRaw({
        id,
        type: 'CATEGORY',
        title: cat.name || id,
        category: 'Procurement Sector',
        baseUrl: cleanBaseUrl(cat.image),
        currentUrl: current,
        updatedAt: ov?.updatedAt,
        changedAtMs,
        isChangedLive: Boolean(sessionChanges[id] || (ov?.primary && changedAtMs > 0)),
        sessionAction: sessionChanges[id]?.action,
        siteLocationLabel: 'Homepage → Procurement Sectors & Category Menu',
        liveRouteView: 'HOMEPAGE',
        liveHref: '/?view=HOMEPAGE',
        isOnHomepage: true
      });
    }

    // 3. All Products
    for (const prod of products) {
      const id = String(prod?.id || '').trim();
      if (!id) continue;
      const ov = overrides[id];
      const base = cleanBaseUrl(prod.images?.[0] || (prod as any).image);
      const current = cleanBaseUrl(ov?.primary || base);
      const changedAtMs = parseUpdatedMs(ov, id);
      const onHomepage = topHomepageProductIds.has(id);
      pushRaw({
        id,
        type: 'PRODUCT',
        title: prod.title || id,
        category: prod.category || 'General Trade',
        baseUrl: base,
        currentUrl: current,
        updatedAt: ov?.updatedAt,
        changedAtMs,
        isChangedLive: Boolean(sessionChanges[id] || (ov?.primary && changedAtMs > 0)),
        sessionAction: sessionChanges[id]?.action,
        siteLocationLabel: onHomepage
          ? 'Homepage → Featured Products · Products Catalog'
          : `Products Catalog → ${prod.category || 'All Products'} · Product Detail`,
        liveRouteView: onHomepage ? 'HOMEPAGE' : 'PRODUCT_DIRECTORY',
        liveHref: `/?view=PRODUCT_DIRECTORY&product=${encodeURIComponent(id)}`,
        isOnHomepage: onHomepage
      });
    }

    // 4. All Buy Leads / RFQs
    for (const rfq of rfqs) {
      const id = String(rfq?.id || '').trim();
      if (!id) continue;
      const ov = overrides[id];
      const base = cleanBaseUrl((rfq as any).image || (rfq as any).images?.[0]);
      const current = cleanBaseUrl(ov?.primary || base);
      const changedAtMs = parseUpdatedMs(ov, id);
      pushRaw({
        id,
        type: 'RFQ',
        title: rfq.productName || (rfq as any).title || id,
        category: rfq.category || 'Buy Lead',
        baseUrl: base,
        currentUrl: current,
        updatedAt: ov?.updatedAt,
        changedAtMs,
        isChangedLive: Boolean(sessionChanges[id] || (ov?.primary && changedAtMs > 0)),
        sessionAction: sessionChanges[id]?.action,
        siteLocationLabel: 'Buy Leads Directory & Homepage Recent RFQs',
        liveRouteView: 'BUY_LEADS',
        liveHref: `/?view=BUY_LEADS&rfq=${encodeURIComponent(id)}`,
        isOnHomepage: false
      });
    }

    // Count URL frequencies across catalog items to detect genuine duplicates
    const urlUsageCount = new Map<string, number>();
    for (const item of rawList) {
      if (item.type === 'SITE_ASSET' || item.type === 'HERO_SLIDE') continue;
      if (item.currentUrl && !isGenericOrPlaceholderImageUrl(item.currentUrl)) {
        urlUsageCount.set(item.currentUrl, (urlUsageCount.get(item.currentUrl) || 0) + 1);
      }
    }

    return rawList.map(item => {
      const u = item.currentUrl;
      const ov = overrides[item.id];
      const isManualOrLocked = Boolean(
        ov &&
        u &&
        (ov.locked === true || ov.serverVerified === true || ov.updatedBy === 'admin-manual')
      );

      if (
        !u ||
        brokenThumbIds[item.id] ||
        isGenericOrPlaceholderImageUrl(u) ||
        isSyntheticSpecCardOrPlaceholder(u) ||
        /^https?:\/\//i.test(u)
      ) {
        return {
          ...item,
          status: 'NEEDS_FIX' as const,
          statusDetail: !u
            ? 'Missing image'
            : brokenThumbIds[item.id]
              ? 'Broken / missing file on server'
              : isGenericOrPlaceholderImageUrl(u) || isSyntheticSpecCardOrPlaceholder(u)
                ? 'Placeholder / synthetic card image'
                : 'External URL (not stored on server)'
        };
      }

      if (
        item.type !== 'SITE_ASSET' &&
        item.type !== 'HERO_SLIDE' &&
        (urlUsageCount.get(u) || 0) > 1
      ) {
        return {
          ...item,
          status: 'DUPLICATE' as const,
          statusDetail: `Shared across ${urlUsageCount.get(u)} records`
        };
      }

      return {
        ...item,
        status: 'VERIFIED' as const,
        statusDetail: item.sessionAction
          ? `Changed live (${item.sessionAction === 'AUTO_FIX' ? 'Auto-Fix' : item.sessionAction === 'URL' ? 'URL' : 'Upload'})`
          : isManualOrLocked
            ? 'Saved & locked on server'
            : 'Verified local image'
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, rfqs, siteContent, stateVersion, sessionChanges, brokenThumbIds]);

  const duplicatePeersByUrl = useMemo(() => {
    const map = new Map<string, Array<{ id: string; title: string; type: SiteImageTargetType }>>();
    for (const it of allItems) {
      if (it.type === 'SITE_ASSET' || it.type === 'HERO_SLIDE' || !it.currentUrl) continue;
      const list = map.get(it.currentUrl) || [];
      list.push({ id: it.id, title: it.title, type: it.type });
      map.set(it.currentUrl, list);
    }
    return map;
  }, [allItems]);

  const stats = useMemo(() => {
    let verified = 0;
    let duplicates = 0;
    let needsFix = 0;
    let changedCount = 0;
    let skippedCount = 0;
    let productsCount = 0;
    let categoriesCount = 0;
    let rfqsCount = 0;
    let bannersCount = 0;

    for (const it of allItems) {
      if (it.status === 'VERIFIED') verified++;
      else if (it.status === 'DUPLICATE') duplicates++;
      else needsFix++;

      if (it.isChangedLive) changedCount++;
      if (skippedItems[it.id]) skippedCount++;

      if (it.type === 'PRODUCT') productsCount++;
      else if (it.type === 'CATEGORY') categoriesCount++;
      else if (it.type === 'RFQ') rfqsCount++;
      else bannersCount++;
    }
    return {
      total: allItems.length,
      verified,
      duplicates,
      needsFix,
      changedCount,
      skippedCount,
      flaggedTotal: duplicates + needsFix,
      productsCount,
      categoriesCount,
      rfqsCount,
      bannersCount
    };
  }, [allItems, skippedItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim();
    const scopeMatched = allItems.filter(it => {
      if (scopeFilter === 'CHANGED' && !it.isChangedLive) return false;
      if (scopeFilter === 'NEEDS_FIX' && it.status === 'VERIFIED') return false;
      if (scopeFilter === 'DUPLICATE' && it.status !== 'DUPLICATE') return false;
      if (scopeFilter === 'SKIPPED' && !skippedItems[it.id] && it.status !== 'NEEDS_FIX') return false;
      if (scopeFilter === 'PRODUCT' && it.type !== 'PRODUCT') return false;
      if (scopeFilter === 'CATEGORY' && it.type !== 'CATEGORY') return false;
      if (scopeFilter === 'RFQ' && it.type !== 'RFQ') return false;
      if (scopeFilter === 'BANNERS' && it.type !== 'HERO_SLIDE' && it.type !== 'SITE_ASSET') return false;
      return true;
    });

    let matched = scopeMatched;
    if (q) {
      // Step sequentially through heading queries (Full Heading -> Sub-headings -> Core 1-2 word nouns) if the full heading returns 0 rows
      const headingCandidates = [q, ...extractProductHeadingSearchQueries(q)];
      const seenQ = new Set<string>();
      for (const candidateQ of headingCandidates) {
        const cleanQ = String(candidateQ || '').trim();
        if (!cleanQ) continue;
        const lowerQ = cleanQ.toLowerCase();
        if (seenQ.has(lowerQ)) continue;
        seenQ.add(lowerQ);

        const hits = scopeMatched.filter(it =>
          matchesProductHeadingSearch(cleanQ, [
            it.title,
            it.id,
            it.category,
            it.siteLocationLabel,
            it.currentUrl
          ])
        );
        if (hits.length > 0) {
          matched = hits;
          break;
        }
        matched = [];
      }
    }

    if (scopeFilter === 'CHANGED') {
      return [...matched].sort((a, b) => (b.changedAtMs || 0) - (a.changedAtMs || 0));
    }
    return matched;
  }, [allItems, scopeFilter, searchQuery, skippedItems]);

  // Direct live-site jump handler for every item type (Products, Categories, RFQs, Hero Slides, Site Banners)
  const handleCheckLiveOnSite = useCallback(
    (item: UnifiedSiteImageItem) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tradeheaven_open_live_image_location', {
            detail: {
              recordId: item.id,
              recordType: item.type,
              routeView: item.liveRouteView,
              fieldPath: item.fieldPath,
              preferHomepageCard: Boolean(item.isOnHomepage)
            }
          })
        );
        return;
      }
      if (onViewLiveItem) {
        onViewLiveItem({ recordId: item.id, recordType: item.type });
      }
    },
    [onViewLiveItem]
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [scopeFilter, searchQuery]);

  const selectedIdList = useMemo(
    () => Object.keys(selectedIds).filter(id => selectedIds[id]),
    [selectedIds]
  );

  const bulkTargetOptions = useMemo(() => {
    const q = bulkTargetFilter.trim();
    const list = q
      ? allItems.filter(it =>
          matchesProductHeadingSearch(q, [it.title, it.id, it.type, it.category])
        )
      : allItems;
    return list.slice(0, 400);
  }, [allItems, bulkTargetFilter]);

  // Shared helper to broadcast update cleanly across all mounted components & SiteContentContext
  const applyLocalSync = useCallback(
    async (
      entries: Array<{
        id: string;
        type: SiteImageTargetType;
        newUrl: string;
        deletedOldUrls?: string[];
        replacedOldUrls?: string[];
        updatedAt?: string;
        action?: 'UPLOAD' | 'AUTO_FIX' | 'URL';
      }>
    ) => {
      if (entries.length === 0) return;
      let deletedCount = 0;
      let needsSiteContentRefresh = false;
      const nowMs = Date.now();
      const snapshotPayload = entries.map(e => {
        if (Array.isArray(e.deletedOldUrls)) deletedCount += e.deletedOldUrls.length;
        if (e.type === 'CATEGORY' || e.type === 'HERO_SLIDE' || e.type === 'SITE_ASSET') {
          needsSiteContentRefresh = true;
        }
        return {
          id: e.id,
          url: e.newUrl,
          updatedAt: e.updatedAt || new Date(nowMs).toISOString(),
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          replacedOldUrls: e.replacedOldUrls,
          deletedOldUrls: e.deletedOldUrls
        };
      });

      setSessionChanges(prev => {
        const next = { ...prev };
        for (const e of entries) {
          next[e.id] = {
            changedAt: nowMs,
            action: e.action || 'UPLOAD',
            deletedOldCount: Array.isArray(e.deletedOldUrls) ? e.deletedOldUrls.length : 0
          };
        }
        return next;
      });
      setSkippedItems(prev => {
        const next = { ...prev };
        for (const e of entries) {
          delete next[e.id];
        }
        return next;
      });
      setBrokenThumbIds(prev => {
        const next = { ...prev };
        for (const e of entries) {
          delete next[e.id];
        }
        return next;
      });

      productImageManagerService.applyServerOverrideSnapshot(snapshotPayload);
      if (deletedCount > 0) {
        setTotalDeletedFilesSession(prev => prev + deletedCount);
      }
      if (needsSiteContentRefresh) {
        await refreshFromServer().catch(() => {});
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      setStateVersion(v => v + 1);
    },
    [refreshFromServer]
  );

  // Upload & permanently replace a single item's image
  const executeReplaceImage = useCallback(
    async (
      item: UnifiedSiteImageItem,
      source: { file?: File; imageUrl?: string }
    ): Promise<{ success: boolean; newUrl?: string; deletedCount: number; message?: string }> => {
      setBusyRowIds(prev => ({ ...prev, [item.id]: source.file ? 'Uploading...' : 'Saving URL...' }));
      try {
        const result = await replaceSiteImage({
          targetId: item.id,
          targetType: item.type,
          fieldPath: item.fieldPath,
          title: item.title,
          category: item.category,
          oldImageUrl: item.currentUrl || item.baseUrl,
          file: source.file,
          imageUrl: source.imageUrl
        });

        const deletedOldUrls: string[] = Array.isArray(result.deletedOldUrls) ? result.deletedOldUrls : [];
        await applyLocalSync([
          {
            id: item.id,
            type: item.type,
            newUrl: result.newUrl,
            deletedOldUrls,
            replacedOldUrls: result.replacedOldUrls,
            updatedAt: result.updatedAt,
            action: source.file ? 'UPLOAD' : 'URL'
          }
        ]);

        return {
          success: true,
          newUrl: result.newUrl,
          deletedCount: deletedOldUrls.length
        };
      } catch (err: any) {
        return {
          success: false,
          deletedCount: 0,
          message: err?.message || 'Image replacement failed.'
        };
      } finally {
        setBusyRowIds(prev => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }
    },
    [applyLocalSync]
  );

  const handleRowFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = rowUploadTargetRef.current;
    e.target.value = '';
    if (!file || !target) return;

    setBannerNotice(null);
    const out = await executeReplaceImage(target, { file });
    if (out.success) {
      setBannerNotice({
        type: 'success',
        text: `Replaced image for "${target.title}" — Located at ${target.siteLocationLabel}${
          out.deletedCount > 0
            ? ` (${out.deletedCount} old file permanently deleted from server).`
            : ' (saved live for all visitors).'
        }`,
        changedItem: target,
        showChangedTabShortcut: true
      });
    } else {
      setBannerNotice({
        type: 'error',
        text: `Upload failed for "${target.title}": ${out.message}`
      });
    }
  };

  const handleSaveInlineUrl = async (item: UnifiedSiteImageItem) => {
    if (!urlEditor || urlEditor.itemId !== item.id) return;
    const raw = urlEditor.value.trim();
    if (!raw) return;
    setUrlEditor(null);
    setBannerNotice(null);
    const out = await executeReplaceImage(item, { imageUrl: raw });
    if (out.success) {
      setBannerNotice({
        type: 'success',
        text: `Updated "${item.title}" — Located at ${item.siteLocationLabel}${
          out.deletedCount > 0 ? ` (${out.deletedCount} old file(s) permanently deleted from server).` : '.'
        }`,
        changedItem: item,
        showChangedTabShortcut: true
      });
    } else {
      setBannerNotice({
        type: 'error',
        text: `Could not apply URL for "${item.title}": ${out.message}`
      });
    }
  };

  // Permanent delete of uploaded server file + override removal from the row
  const handlePermanentDeleteItemImage = async (item: UnifiedSiteImageItem) => {
    setDeleteConfirmId(null);
    setBusyRowIds(prev => ({ ...prev, [item.id]: 'Deleting...' }));
    setBannerNotice(null);
    try {
      const { deletedFile: deletedFileOk } = await deleteSiteImageFile({
        url: item.currentUrl,
        targetId: item.id,
        targetType: item.type,
        fieldPath: item.fieldPath
      });
      if (deletedFileOk) {
        setTotalDeletedFilesSession(prev => prev + 1);
      }
      await refreshFromServer().catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      setStateVersion(v => v + 1);
      setBannerNotice({
        type: 'success',
        text: deletedFileOk
          ? `Permanently deleted "${item.title}" image file from server (${item.currentUrl}) and cleared override.`
          : `Cleared image override for "${item.title}".`,
        changedItem: item
      });
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        text: `Could not delete image for "${item.title}": ${err?.message || 'Delete failed.'}`
      });
    } finally {
      setBusyRowIds(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  // Save edited/cropped canvas data directly via replace endpoint (auto-deletes old file)
  const handleSaveCroppedRowImage = async (item: UnifiedSiteImageItem, editedDataUrl: string) => {
    setCroppingItem(null);
    setBannerNotice(null);
    const croppedFile = productImageManagerService.dataUrlToFile(
      editedDataUrl,
      `${item.id}-edited-${Date.now()}.png`
    );
    const out = await executeReplaceImage(item, { file: croppedFile });
    if (out.success) {
      setBannerNotice({
        type: 'success',
        text: `Edited & saved image for "${item.title}" — Located at ${item.siteLocationLabel}${
          out.deletedCount > 0 ? ` (${out.deletedCount} old file permanently deleted from server).` : '.'
        }`,
        changedItem: item,
        showChangedTabShortcut: true
      });
    } else {
      setBannerNotice({
        type: 'error',
        text: `Could not save edited image for "${item.title}": ${out.message}`
      });
    }
  };

  // Single-row Auto-Fix
  const handleAutoFixSingle = async (item: UnifiedSiteImageItem) => {
    setBusyRowIds(prev => ({ ...prev, [item.id]: 'Auto-fixing...' }));
    setBannerNotice(null);
    try {
      const json = await autoFixSiteImages([
        {
          id: item.id,
          type: item.type,
          title: item.title,
          category: item.category,
          currentUrl: item.currentUrl,
          fieldPath: item.fieldPath
        }
      ]);
      const rowRes = Array.isArray(json?.results) ? json.results[0] : null;
      if (!rowRes?.success || !rowRes?.newUrl) {
        throw new Error(rowRes?.error || 'Auto-fix could not find a unique replacement photo.');
      }

      const deletedOld: string[] = Array.isArray(rowRes.deletedOldUrls) ? rowRes.deletedOldUrls : [];
      await applyLocalSync([
        {
          id: item.id,
          type: item.type,
          newUrl: rowRes.newUrl,
          deletedOldUrls: deletedOld,
          replacedOldUrls: item.currentUrl ? [item.currentUrl] : undefined,
          updatedAt: rowRes.updatedAt,
          action: 'AUTO_FIX'
        }
      ]);

      setBannerNotice({
        type: 'success',
        text: `Auto-fixed "${item.title}" — Located at ${item.siteLocationLabel}${
          deletedOld.length > 0 ? ` (${deletedOld.length} old file(s) permanently deleted from server).` : '.'
        }`,
        changedItem: item,
        showChangedTabShortcut: true
      });
    } catch (err: any) {
      const errReason = err?.message || 'Auto-fix could not find a unique replacement photo.';
      setSkippedItems(prev => ({
        ...prev,
        [item.id]: { reason: errReason, at: Date.now() }
      }));
      setBannerNotice({
        type: 'error',
        text: `Auto-Fix skipped "${item.title}": ${errReason} Click the item to pick from ~20 Google/Web photos or upload manually.`,
        changedItem: item
      });
    } finally {
      setBusyRowIds(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  // Automatically step through headings and upload real matching photos for visible rows whose images are out/missing/broken
  useEffect(() => {
    if (isLoadingInventory || batchProgress?.active || isAutoFixingVisibleOutRef.current) return;
    const outCandidate = pageItems.find(it => {
      if (autoFixedOutRowIdsRef.current.has(it.id) || busyRowIds[it.id]) return false;
      const u = it.currentUrl;
      return (
        !u ||
        Boolean(brokenThumbIds[it.id]) ||
        isGenericOrPlaceholderImageUrl(u) ||
        isSyntheticSpecCardOrPlaceholder(u)
      );
    });
    if (!outCandidate) return;

    autoFixedOutRowIdsRef.current.add(outCandidate.id);
    isAutoFixingVisibleOutRef.current = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          await handleAutoFixSingle(outCandidate);
        } finally {
          isAutoFixingVisibleOutRef.current = false;
        }
      })();
    }, 120);

    return () => {
      window.clearTimeout(timer);
      isAutoFixingVisibleOutRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageItems, brokenThumbIds, isLoadingInventory, batchProgress?.active, busyRowIds]);

  // Batch Auto-Fix (Selected OR All Flagged)
  const runBatchAutoFix = async (targets: UnifiedSiteImageItem[]) => {
    if (targets.length === 0 || batchProgress?.active) return;
    abortBatchRef.current = false;
    setBannerNotice(null);

    let completed = 0;
    let fixed = 0;
    let failed = 0;
    let deletedOld = 0;

    setBatchProgress({
      active: true,
      total: targets.length,
      completed: 0,
      fixed: 0,
      failed: 0,
      deletedOld: 0,
      currentLabel: targets[0].title
    });

    const CHUNK_SIZE = 1;
    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
      if (abortBatchRef.current) break;
      const chunk = targets.slice(i, i + CHUNK_SIZE);
      setBatchProgress({
        active: true,
        total: targets.length,
        completed,
        fixed,
        failed,
        deletedOld,
        currentLabel: chunk.map(c => c.title).slice(0, 2).join(', ')
      });

      try {
        const json = await autoFixSiteImages(
          chunk.map(c => ({
            id: c.id,
            type: c.type,
            title: c.title,
            category: c.category,
            currentUrl: c.currentUrl,
            fieldPath: c.fieldPath
          }))
        );
        const resList = Array.isArray(json?.results) ? json.results : [];
        const toSync: Array<{
          id: string;
          type: SiteImageTargetType;
          newUrl: string;
          deletedOldUrls?: string[];
          replacedOldUrls?: string[];
          updatedAt?: string;
          action?: 'UPLOAD' | 'AUTO_FIX' | 'URL';
        }> = [];
        const newlySkipped: Record<string, { reason: string; at: number }> = {};

        for (const c of chunk) {
          const match = resList.find(r => r.id === c.id);
          completed++;
          if (match?.success && match?.newUrl) {
            fixed++;
            const delList: string[] = Array.isArray(match.deletedOldUrls) ? match.deletedOldUrls : [];
            deletedOld += delList.length;
            toSync.push({
              id: c.id,
              type: c.type,
              newUrl: match.newUrl,
              deletedOldUrls: delList,
              replacedOldUrls: c.currentUrl ? [c.currentUrl] : undefined,
              updatedAt: match.updatedAt,
              action: 'AUTO_FIX'
            });
          } else {
            failed++;
            newlySkipped[c.id] = {
              reason: match?.error || 'Auto-fix skipped item (open inspector to pick from ~20 Google/Web images).',
              at: Date.now()
            };
          }
        }

        if (Object.keys(newlySkipped).length > 0) {
          setSkippedItems(prev => ({ ...prev, ...newlySkipped }));
        }
        if (toSync.length > 0) {
          await applyLocalSync(toSync);
        }
      } catch (err: any) {
        completed += chunk.length;
        failed += chunk.length;
        const newlySkipped: Record<string, { reason: string; at: number }> = {};
        for (const c of chunk) {
          newlySkipped[c.id] = {
            reason: err?.message || 'Batch auto-fix request failed for this item.',
            at: Date.now()
          };
        }
        setSkippedItems(prev => ({ ...prev, ...newlySkipped }));
      }

      setBatchProgress({
        active: true,
        total: targets.length,
        completed,
        fixed,
        failed,
        deletedOld,
        currentLabel: chunk[chunk.length - 1]?.title || ''
      });
    }

    setBatchProgress(null);
    setSelectedIds({});
    if (failed > 0 && fixed === 0) {
      setScopeFilter('SKIPPED');
    }
    setBannerNotice({
      type: fixed > 0 ? 'success' : 'error',
      text: abortBatchRef.current
        ? `Batch Auto-Fix stopped: fixed ${fixed} of ${targets.length} items (${deletedOld} old server files permanently deleted).`
        : `Batch Auto-Fix finished: ${fixed} fixed, ${failed} skipped/failed (click "Skipped" tab or any row to open ~20 Google/Web photos), ${deletedOld} old server files permanently deleted.`,
      showChangedTabShortcut: fixed > 0
    });
  };

  // Multi-file Bulk Uploader handlers
  const handleBulkFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const nextEntries: BulkUploadQueueItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;
      const matched = matchFileToSiteItem(file.name, allItems);
      nextEntries.push({
        queueId: `q-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        targetId: matched.targetId,
        matchNote: matched.matchNote,
        state: 'ready'
      });
    }
    if (nextEntries.length > 0) {
      setBulkQueue(prev => [...prev, ...nextEntries]);
      setShowBulkUploader(true);
    }
  };

  const handleRunBulkUploadQueue = async () => {
    const readyItems = bulkQueue.filter(q => q.targetId && q.state !== 'done');
    if (readyItems.length === 0 || isBulkUploading) return;
    setIsBulkUploading(true);
    let succeeded = 0;
    let deletedTotal = 0;

    const itemById = new Map(allItems.map(it => [it.id, it]));

    for (const qItem of readyItems) {
      const target = itemById.get(qItem.targetId);
      if (!target) continue;
      setBulkQueue(prev =>
        prev.map(x => (x.queueId === qItem.queueId ? { ...x, state: 'uploading', message: 'Uploading & deleting old file...' } : x))
      );

      const res = await executeReplaceImage(target, { file: qItem.file });
      if (res.success) {
        succeeded++;
        deletedTotal += res.deletedCount;
        setBulkQueue(prev =>
          prev.map(x =>
            x.queueId === qItem.queueId
              ? {
                  ...x,
                  state: 'done',
                  message: res.deletedCount > 0 ? 'Replaced & old file deleted' : 'Saved live'
                }
              : x
          )
        );
      } else {
        setBulkQueue(prev =>
          prev.map(x =>
            x.queueId === qItem.queueId ? { ...x, state: 'error', message: res.message || 'Failed' } : x
          )
        );
      }
    }

    setIsBulkUploading(false);
    setBannerNotice({
      type: succeeded > 0 ? 'success' : 'error',
      text: `Bulk upload completed: ${succeeded} of ${readyItems.length} images replaced (${deletedTotal} old files permanently deleted from server).`,
      showChangedTabShortcut: succeeded > 0
    });
  };

  // Apply one chosen file across all checked rows (deletes every replaced old server file)
  const handleApplyFileToSelectedRows = async (file: File) => {
    const idSet = new Set(selectedIdList);
    const targets = allItems.filter(it => idSet.has(it.id));
    if (targets.length === 0 || batchProgress?.active) return;

    abortBatchRef.current = false;
    setBannerNotice(null);
    let completed = 0;
    let fixed = 0;
    let failed = 0;
    let deletedOld = 0;

    setBatchProgress({
      active: true,
      total: targets.length,
      completed: 0,
      fixed: 0,
      failed: 0,
      deletedOld: 0,
      currentLabel: targets[0].title
    });

    for (const target of targets) {
      if (abortBatchRef.current) break;
      setBatchProgress({
        active: true,
        total: targets.length,
        completed,
        fixed,
        failed,
        deletedOld,
        currentLabel: target.title
      });
      const out = await executeReplaceImage(target, { file });
      completed++;
      if (out.success) {
        fixed++;
        deletedOld += out.deletedCount;
      } else {
        failed++;
      }
    }

    setBatchProgress(null);
    setSelectedIds({});
    setBannerNotice({
      type: fixed > 0 ? 'success' : 'error',
      text: `Applied "${file.name}" to ${fixed} of ${targets.length} selected items (${deletedOld} old server files permanently deleted).`,
      showChangedTabShortcut: fixed > 0
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const allOnPageSelected = pageItems.length > 0 && pageItems.every(it => Boolean(selectedIds[it.id]));

  const toggleSelectPage = () => {
    setSelectedIds(prev => {
      const next = { ...prev };
      if (allOnPageSelected) {
        for (const it of pageItems) delete next[it.id];
      } else {
        for (const it of pageItems) next[it.id] = true;
      }
      return next;
    });
  };

  const flaggedItems = useMemo(() => allItems.filter(it => it.status !== 'VERIFIED'), [allItems]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" data-testid="whole-site-image-studio">
      {/* Hidden File Pickers */}
      <input
        ref={rowFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleRowFilePicked}
        className="hidden"
      />
      <input
        ref={bulkFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => {
          handleBulkFilesAdded(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={selectedRowsUploadInputRef}
        type="file"
        accept="image/*"
        onChange={e => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void handleApplyFileToSelectedRows(f);
        }}
        className="hidden"
      />

      {/* Top Studio Header & Primary Controls */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900">
            Whole-Site Image Control &amp; Auto-Fix Studio
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload, replace, or auto-fix any product, category, RFQ, or site banner image. Replaced files are permanently deleted from the server immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowBulkUploader(prev => !prev)}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FolderUp className="w-3.5 h-3.5" />
            <span>{showBulkUploader ? 'Hide Bulk Uploader' : 'Bulk Upload Images'}</span>
          </button>

          <button
            type="button"
            disabled={isLoadingInventory || Boolean(batchProgress?.active)}
            onClick={() => void loadAllInventory(true)}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInventory ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            disabled={flaggedItems.length === 0 || Boolean(batchProgress?.active)}
            onClick={() => void runBatchAutoFix(flaggedItems)}
            className="px-4 py-2 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>
              {flaggedItems.length > 0
                ? `Auto-Fix All Flagged (${flaggedItems.length})`
                : 'All Images Verified'}
            </span>
          </button>
        </div>
      </div>

      {/* Clean Single-Row Interactive Metric Strip (Click any KPI to filter & inspect items) */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/70">
        <button
          type="button"
          onClick={() => setScopeFilter('ALL')}
          className={`px-5 py-3 text-left transition-colors cursor-pointer hover:bg-white ${
            scopeFilter === 'ALL' ? 'bg-white ring-1 ring-inset ring-[#0F294D]/20' : ''
          }`}
        >
          <div className="text-xs text-slate-500">Total Site Images</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {stats.total.toLocaleString()}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setScopeFilter('CHANGED')}
          className={`px-5 py-3 text-left transition-colors cursor-pointer hover:bg-white ${
            scopeFilter === 'CHANGED' ? 'bg-white ring-1 ring-inset ring-emerald-500/30' : ''
          }`}
        >
          <div className="text-xs text-slate-500">Verified on Server</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {stats.verified.toLocaleString()}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setScopeFilter('DUPLICATE')}
          className={`px-5 py-3 text-left transition-colors cursor-pointer hover:bg-amber-50/60 ${
            scopeFilter === 'DUPLICATE' ? 'bg-amber-50 ring-1 ring-inset ring-amber-400' : ''
          }`}
          title="Click to view and open all duplicate images"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Duplicates</span>
            <span className="text-[10px] font-semibold text-amber-700 underline">View All</span>
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${stats.duplicates > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {stats.duplicates.toLocaleString()}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setScopeFilter(stats.skippedCount > 0 ? 'SKIPPED' : 'NEEDS_FIX')}
          className={`px-5 py-3 text-left transition-colors cursor-pointer hover:bg-red-50/60 ${
            scopeFilter === 'NEEDS_FIX' || scopeFilter === 'SKIPPED' ? 'bg-red-50 ring-1 ring-inset ring-red-400' : ''
          }`}
          title="Click to view and open all missing, stock, or skipped images"
        >
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Missing / Skipped</span>
            <span className="text-[10px] font-semibold text-red-700 underline">View All</span>
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${stats.needsFix + stats.skippedCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {(stats.needsFix + stats.skippedCount).toLocaleString()}
          </div>
        </button>
        <div className="px-5 py-3">
          <div className="text-xs text-slate-500">Old Files Deleted</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {totalDeletedFilesSession.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Status Notice Banner with Direct Live Check & Changed-Items Jump */}
      {bannerNotice && (
        <div
          className={`px-6 py-3 border-b text-xs font-medium flex flex-wrap items-center justify-between gap-3 ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : bannerNotice.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            )}
            <span className="break-words">{bannerNotice.text}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {bannerNotice.changedItem && (
              <>
                <button
                  type="button"
                  onClick={() => handleCheckLiveOnSite(bannerNotice.changedItem!)}
                  className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Check Live on Site</span>
                </button>
                <a
                  href={bannerNotice.changedItem.liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open New Tab</span>
                </a>
              </>
            )}
            {bannerNotice.showChangedTabShortcut && scopeFilter !== 'CHANGED' && (
              <button
                type="button"
                onClick={() => setScopeFilter('CHANGED')}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Clock className="w-3 h-3" />
                <span>View Changed Live ({stats.changedCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="p-1 rounded hover:bg-black/5 cursor-pointer shrink-0"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Batch Auto-Fix Progress Strip */}
      {batchProgress?.active && (
        <div className="px-6 py-3.5 border-b border-blue-200 bg-blue-50/70 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-semibold text-slate-900">
              Auto-Fixing images ({batchProgress.completed} / {batchProgress.total})
              <span className="text-slate-500 font-normal ml-2">
                {batchProgress.fixed} fixed · {batchProgress.failed} skipped · {batchProgress.deletedOld} old files deleted
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                abortBatchRef.current = true;
              }}
              className="px-3 py-1 rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Stop Batch
            </button>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0F294D] transition-all duration-200"
              style={{
                width: `${Math.min(100, Math.round((batchProgress.completed / Math.max(1, batchProgress.total)) * 100))}%`
              }}
            />
          </div>
          <div className="text-xs text-slate-600 truncate">
            Processing: {batchProgress.currentLabel}
          </div>
        </div>
      )}

      {/* Multi-File Bulk Uploader Panel */}
      {showBulkUploader && (
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 space-y-4">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              handleBulkFilesAdded(e.dataTransfer.files);
            }}
            onClick={() => bulkFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0F294D] bg-white rounded-lg p-6 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-900">
              Drop multiple images here or click to select files
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Filenames matching a Product ID or title auto-assign automatically. Every replaced old image is permanently deleted from server storage.
            </div>
          </div>

          {bulkQueue.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-700 tabular-nums">
                  {bulkQueue.length} file(s) staged · {bulkQueue.filter(q => Boolean(q.targetId)).length} assigned
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={bulkTargetFilter}
                    onChange={e => setBulkTargetFilter(e.target.value)}
                    placeholder="Filter dropdown targets by ID or name..."
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md w-56 focus:outline-none focus:border-[#0F294D]"
                  />
                  <button
                    type="button"
                    disabled={isBulkUploading}
                    onClick={() => {
                      bulkQueue.forEach(q => URL.revokeObjectURL(q.previewUrl));
                      setBulkQueue([]);
                    }}
                    className="px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    Clear Queue
                  </button>
                  <button
                    type="button"
                    disabled={isBulkUploading || bulkQueue.filter(q => q.targetId && q.state !== 'done').length === 0}
                    onClick={() => void handleRunBulkUploadQueue()}
                    className="px-4 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isBulkUploading
                        ? 'Uploading & Replacing...'
                        : `Upload & Replace Assigned (${bulkQueue.filter(q => q.targetId && q.state !== 'done').length})`}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-72 overflow-y-auto">
                {bulkQueue.map(qItem => {
                  const matchedOpt = qItem.targetId ? allItems.find(it => it.id === qItem.targetId) : undefined;
                  const optionsToRender =
                    matchedOpt && !bulkTargetOptions.some(o => o.id === matchedOpt.id)
                      ? [matchedOpt, ...bulkTargetOptions]
                      : bulkTargetOptions;
                  return (
                  <div key={qItem.queueId} className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <img
                      src={qItem.previewUrl}
                      alt={qItem.file.name}
                      className="w-12 h-10 rounded object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 truncate">{qItem.file.name}</div>
                      <div className="text-xs text-slate-500">
                        {(qItem.file.size / 1024).toFixed(1)} KB · {qItem.message || qItem.matchNote}
                      </div>
                    </div>
                    <select
                      value={qItem.targetId}
                      disabled={isBulkUploading || qItem.state === 'done'}
                      onChange={e => {
                        const val = e.target.value;
                        setBulkQueue(prev =>
                          prev.map(x =>
                            x.queueId === qItem.queueId ? { ...x, targetId: val, matchNote: 'Manual assignment' } : x
                          )
                        );
                      }}
                      className="w-full sm:w-72 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0F294D]"
                    >
                      <option value="">-- Choose Product / Category / Banner --</option>
                      {optionsToRender.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          [{opt.type}] {opt.title.slice(0, 48)} ({opt.id})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 shrink-0">
                      {qItem.state === 'done' && (
                        <span className="text-xs font-semibold text-emerald-700">Replaced</span>
                      )}
                      {qItem.state === 'error' && (
                        <span className="text-xs font-semibold text-red-600">Error</span>
                      )}
                      <button
                        type="button"
                        disabled={isBulkUploading}
                        onClick={() => {
                          URL.revokeObjectURL(qItem.previewUrl);
                          setBulkQueue(prev => prev.filter(x => x.queueId !== qItem.queueId));
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        aria-label="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segmented Scope Filter Tabs + Search + Selection Actions */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {(
            [
              { id: 'ALL', label: `All (${stats.total})` },
              { id: 'CHANGED', label: `Changed Live (${stats.changedCount})` },
              { id: 'NEEDS_FIX', label: `Needs Fix (${stats.flaggedTotal})` },
              { id: 'DUPLICATE', label: `Duplicates (${stats.duplicates})` },
              { id: 'SKIPPED', label: `Skipped (${stats.skippedCount + stats.needsFix})` },
              { id: 'PRODUCT', label: `Products (${stats.productsCount})` },
              { id: 'CATEGORY', label: `Categories (${stats.categoriesCount})` },
              { id: 'RFQ', label: `Buy Leads (${stats.rfqsCount})` },
              { id: 'BANNERS', label: `Hero & Banners (${stats.bannersCount})` }
            ] as Array<{ id: ScopeFilter; label: string }>
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScopeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                scopeFilter === tab.id
                  ? tab.id === 'CHANGED'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : tab.id === 'DUPLICATE'
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : tab.id === 'SKIPPED'
                        ? 'bg-red-600 text-white font-semibold shadow-xs'
                        : 'bg-white text-slate-900 font-semibold shadow-xs'
                  : tab.id === 'CHANGED' && Object.keys(sessionChanges).length > 0
                    ? 'text-emerald-800 hover:text-emerald-950 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search any full product heading, ID, category..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedIdList.length > 0 && (
            <>
              <button
                type="button"
                disabled={Boolean(batchProgress?.active)}
                onClick={() => selectedRowsUploadInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                title="Upload one image and apply it to every checked row"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to Selected ({selectedIdList.length})</span>
              </button>
              <button
                type="button"
                disabled={Boolean(batchProgress?.active)}
                onClick={() => {
                  const idSet = new Set(selectedIdList);
                  const targets = allItems.filter(it => idSet.has(it.id));
                  void runBatchAutoFix(targets);
                }}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Fix Selected ({selectedIdList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds({})}
                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-2.5 pl-6 pr-2 w-10">
                <button
                  type="button"
                  onClick={toggleSelectPage}
                  className="text-slate-500 hover:text-slate-900 cursor-pointer flex items-center"
                  aria-label="Select all on page"
                >
                  {allOnPageSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#0F294D]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 w-20">Preview</th>
              <th className="py-2.5 px-3">Item &amp; File Path</th>
              <th className="py-2.5 px-3 w-64">Live Site Location</th>
              <th className="py-2.5 px-3 w-36">Status</th>
              <th className="py-2.5 pl-3 pr-6 text-right min-w-[275px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {isLoadingInventory && pageItems.length === 0 ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 pl-6 pr-2"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                  <td className="py-3 px-3"><div className="w-16 h-12 bg-slate-200 rounded" /></td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 w-56 bg-slate-200 rounded mb-1.5" />
                    <div className="h-3 w-80 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3 px-3"><div className="h-3.5 w-44 bg-slate-200 rounded" /></td>
                  <td className="py-3 px-3"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                  <td className="py-3 pl-3 pr-6"><div className="h-7 w-44 bg-slate-200 rounded ml-auto" /></td>
                </tr>
              ))
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center text-sm text-slate-500">
                  {scopeFilter === 'CHANGED'
                    ? 'No live changed images recorded yet. Upload, paste a URL, or Auto-Fix any item and it will appear here in real time.'
                    : scopeFilter === 'NEEDS_FIX'
                      ? 'Every scanned image across the entire site is verified on server storage.'
                      : 'No matching site items found for your search filter.'}
                </td>
              </tr>
            ) : (
              pageItems.map(item => {
                const isSelected = Boolean(selectedIds[item.id]);
                const rowBusyLabel = busyRowIds[item.id];
                const isEditingUrl = urlEditor?.itemId === item.id;
                const isConfirmingDelete = deleteConfirmId === item.id;
                const thumbSrc = item.currentUrl
                  ? item.currentUrl.startsWith('/assets/uploads/')
                    ? `${optimizeImageUrl(item.currentUrl, { width: 160, isThumbnail: true })}&_v=${stateVersion}`
                    : item.currentUrl
                  : '';

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onDragOver={e => {
                        e.preventDefault();
                        if (dragOverRowId !== item.id) setDragOverRowId(item.id);
                      }}
                      onDragLeave={e => {
                        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                        if (dragOverRowId === item.id) setDragOverRowId(null);
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        setDragOverRowId(null);
                        const droppedFile = e.dataTransfer.files?.[0];
                        if (!droppedFile || !droppedFile.type.startsWith('image/')) return;
                        void (async () => {
                          setBannerNotice(null);
                          const out = await executeReplaceImage(item, { file: droppedFile });
                          if (out.success) {
                            setBannerNotice({
                              type: 'success',
                              text: `Dropped & replaced image for "${item.title}" — Located at ${item.siteLocationLabel}${
                                out.deletedCount > 0 ? ` (${out.deletedCount} old file permanently deleted from server).` : '.'
                              }`,
                              changedItem: item,
                              showChangedTabShortcut: true
                            });
                          } else {
                            setBannerNotice({
                              type: 'error',
                              text: `Drop upload failed for "${item.title}": ${out.message}`
                            });
                          }
                        })();
                      }}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        dragOverRowId === item.id
                          ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-500'
                          : isSelected
                            ? 'bg-blue-50/40'
                            : ''
                      }`}
                    >
                      <td className="py-3 pl-6 pr-2 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(item.id)}
                          className="text-slate-500 hover:text-slate-900 cursor-pointer flex items-center"
                          aria-label={`Select ${item.title}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#0F294D]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          title="Click to inspect & choose from ~20 Google/Web photos"
                          className="w-16 h-12 rounded-md border border-slate-200 hover:border-[#0F294D] bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group relative"
                        >
                          {thumbSrc && !brokenThumbIds[item.id] && !isSyntheticSpecCardOrPlaceholder(item.currentUrl) ? (
                            <img
                              src={thumbSrc}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={() => {
                                setBrokenThumbIds(prev => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium text-center px-1 leading-tight">
                              {busyRowIds[item.id] ? 'Auto-Uploading...' : 'No Image'}
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 align-middle min-w-0 max-w-sm">
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          className="font-semibold text-slate-900 hover:text-[#0F294D] hover:underline truncate block max-w-full text-left cursor-pointer"
                          title={`Click to open Image Inspector for ${item.title}`}
                        >
                          {item.title}
                        </button>
                        <div className="text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{item.type.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-600">{item.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[160px]">{item.category}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 truncate mt-0.5" title={item.currentUrl}>
                          {item.currentUrl || '(no server file assigned)'}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <div className="flex items-start gap-1.5 text-slate-800 font-medium leading-snug">
                          <MapPin className="w-3.5 h-3.5 text-[#0F294D] shrink-0 mt-0.5" />
                          <span className="min-w-0">{item.siteLocationLabel}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 pl-5">
                          <button
                            type="button"
                            onClick={() => handleCheckLiveOnSite(item)}
                            className="text-[11px] font-semibold text-[#0F294D] hover:text-[#EA580C] hover:underline cursor-pointer whitespace-nowrap"
                          >
                            Check on Site →
                          </button>
                          <span aria-hidden="true" className="text-slate-300">|</span>
                          <a
                            href={item.liveHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:underline inline-flex items-center gap-0.5 whitespace-nowrap"
                          >
                            <span>New Tab</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          className="text-left cursor-pointer group"
                          title="Click to open Image Inspector and fix/replace this image"
                        >
                          <div
                            className={`font-semibold group-hover:underline ${
                              skippedItems[item.id]
                                ? 'text-red-700'
                                : item.status === 'VERIFIED'
                                  ? 'text-emerald-700'
                                  : item.status === 'DUPLICATE'
                                    ? 'text-amber-700'
                                    : 'text-red-700'
                            }`}
                          >
                            {skippedItems[item.id]
                              ? 'Skipped (Click to Fix)'
                              : item.status === 'VERIFIED'
                                ? 'Verified'
                                : item.status === 'DUPLICATE'
                                  ? 'Duplicate (Click to Open)'
                                  : 'Needs Image (Click to Open)'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {skippedItems[item.id]?.reason || item.statusDetail}
                          </div>
                          {item.changedAtMs > 0 && (
                            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 tabular-nums">
                              Updated {formatRelativeChangeTime(item.changedAtMs)}
                            </div>
                          )}
                        </button>
                      </td>

                      <td className="py-3 pl-3 pr-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap max-w-[310px] ml-auto">
                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                            onClick={() => {
                              rowUploadTargetRef.current = item;
                              rowFileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                            title="Manually upload image from computer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{rowBusyLabel === 'Uploading...' ? 'Uploading...' : 'Upload'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                            onClick={() => setInspectingItem(item)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                            title="Inspect before/after, search verified photo candidates, crop, or auto-fix"
                          >
                            <Eye className="w-3 h-3 text-[#0F294D]" />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            disabled={!item.currentUrl || Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                            onClick={() => setCroppingItem(item)}
                            className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40"
                            title="Crop, rotate, zoom, or adjust image filters"
                          >
                            <Crop className="w-3 h-3" />
                            <span>Crop</span>
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                            onClick={() => void handleAutoFixSingle(item)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                            title="Automatically assign unique photo & delete old server file"
                          >
                            <Wand2 className={`w-3 h-3 ${rowBusyLabel === 'Auto-fixing...' ? 'animate-spin' : ''}`} />
                            <span>{rowBusyLabel === 'Auto-fixing...' ? 'Fixing...' : 'Auto-Fix'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel)}
                            onClick={() => {
                              setDeleteConfirmId(null);
                              setUrlEditor(
                                isEditingUrl ? null : { itemId: item.id, value: item.currentUrl || '' }
                              );
                            }}
                            className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Paste image URL"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>URL</span>
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel) || !item.currentUrl}
                            onClick={() => {
                              setUrlEditor(null);
                              setDeleteConfirmId(isConfirmingDelete ? null : item.id);
                            }}
                            className="px-2 py-1 rounded-md bg-white hover:bg-red-50 text-red-700 border border-slate-300 hover:border-red-300 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40"
                            title="Permanently delete server image & clear override"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCheckLiveOnSite(item)}
                            className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 hover:text-[#0F294D] border border-slate-300 text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            title={`Check live at: ${item.siteLocationLabel}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Live</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isEditingUrl && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={urlEditor.value}
                              onChange={e => setUrlEditor({ itemId: item.id, value: e.target.value })}
                              placeholder="Paste https://... or /assets/uploads/... URL"
                              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0F294D]"
                            />
                            <button
                              type="button"
                              onClick={() => void handleSaveInlineUrl(item)}
                              className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save &amp; Delete Old File</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setUrlEditor(null)}
                              className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {isConfirmingDelete && (
                      <tr className="bg-red-50/70">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="text-red-900 font-medium">
                              Permanently delete{' '}
                              <span className="font-mono font-semibold">{item.currentUrl}</span> from server storage and clear this item&apos;s override?
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => void handlePermanentDeleteItemImage(item)}
                                className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Permanently</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-medium cursor-pointer whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="tabular-nums">
          Showing {filteredItems.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(safePage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length.toLocaleString()} items
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="px-2 font-mono tabular-nums text-slate-700">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* All-In-One Inspector Modal (Candidates + Manual Upload + Crop + Auto-Fix + URL + Live Check) */}
      {inspectingItem && (
        <AdminQuickImageInspectorModal
          product={
            {
              id: inspectingItem.id,
              title: inspectingItem.title,
              category: inspectingItem.category,
              images: inspectingItem.currentUrl ? [inspectingItem.currentUrl] : [],
              description: inspectingItem.siteLocationLabel,
              moq: 1,
              price: '0',
              supplierId: 'admin',
              supplierName: 'Trade Heaven',
              supplierCountry: 'Global'
            } as unknown as Product
          }
          currentImageUrl={inspectingItem.currentUrl}
          targetType={inspectingItem.type}
          fieldPath={inspectingItem.fieldPath}
          siteLocationLabel={inspectingItem.siteLocationLabel}
          liveHref={inspectingItem.liveHref}
          status={inspectingItem.status}
          statusDetail={inspectingItem.statusDetail}
          duplicatePeers={
            inspectingItem.currentUrl
              ? (duplicatePeersByUrl.get(inspectingItem.currentUrl) || []).filter(p => p.id !== inspectingItem.id)
              : undefined
          }
          skippedReason={skippedItems[inspectingItem.id]?.reason}
          onCheckLiveOnSite={() => handleCheckLiveOnSite(inspectingItem)}
          onImageDeleted={(_id, deletedFile) => {
            if (deletedFile) {
              setTotalDeletedFilesSession(prev => prev + 1);
            }
            void refreshFromServer().catch(() => {});
            setStateVersion(v => v + 1);
            setBannerNotice({
              type: 'success',
              text: deletedFile
                ? `Permanently deleted "${inspectingItem.title}" image file from server storage.`
                : `Cleared image override for "${inspectingItem.title}".`,
              changedItem: inspectingItem
            });
          }}
          onClose={() => setInspectingItem(null)}
          onImageUpdated={(id, newUrl, activityMs, meta) => {
            const deletedCount = Array.isArray(meta?.deletedOldUrls) ? meta.deletedOldUrls.length : 0;
            if (deletedCount > 0) {
              setTotalDeletedFilesSession(prev => prev + deletedCount);
            }
            setSessionChanges(prev => ({
              ...prev,
              [id]: {
                changedAt: activityMs || Date.now(),
                action: meta?.action || 'UPLOAD',
                deletedOldCount: deletedCount
              }
            }));
            setSkippedItems(prev => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            setStateVersion(v => v + 1);
            if (
              inspectingItem.type === 'CATEGORY' ||
              inspectingItem.type === 'HERO_SLIDE' ||
              inspectingItem.type === 'SITE_ASSET'
            ) {
              void refreshFromServer().catch(() => {});
            }
            setBannerNotice({
              type: 'success',
              text: `Updated "${inspectingItem.title}" (${newUrl}) — Located at ${inspectingItem.siteLocationLabel}${
                deletedCount > 0 ? ` (${deletedCount} old file permanently deleted from server).` : '.'
              }`,
              changedItem: { ...inspectingItem, currentUrl: newUrl },
              showChangedTabShortcut: true
            });
          }}
        />
      )}

      {/* Direct Crop / Rotate / Filter Editor Modal */}
      {croppingItem && croppingItem.currentUrl && (
        <ImageEditingOverlay
          imageSrc={croppingItem.currentUrl}
          imageName={croppingItem.title}
          onSave={editedDataUrl => void handleSaveCroppedRowImage(croppingItem, editedDataUrl)}
          onClose={() => setCroppingItem(null)}
        />
      )}
    </div>
  );
};
