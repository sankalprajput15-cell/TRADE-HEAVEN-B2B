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
  Crop,
  LayoutGrid,
  List
} from 'lucide-react';
import { ActiveView, Product, RfqRequirement } from '../../types';
import { AdminQuickImageInspectorModal } from './AdminQuickImageInspectorModal';
import { ImageEditingOverlay } from './ImageEditingOverlay';
import { useSiteContent } from '../../context/SiteContentContext';
import { CATEGORIES_TREE, MOCK_PRODUCTS, MOCK_RFQS } from '../../data/mockData';
import {
  api,
  getDeletedProductIdsSet,
  getDeletedRfqIdsSet,
  markProductIdsDeleted,
  markRfqIdsDeleted,
  syncDeletedProductIdsFromServer,
  syncDeletedRfqIdsFromServer
} from '../../services/apiService';
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
  deleteSiteImageFile,
  deleteSiteListingsPermanently
} from '../../services/siteImageControlService';
import {
  backgroundAutoFixService,
  BackgroundAutoFixItem,
  BackgroundAutoFixSnapshot
} from '../../services/backgroundAutoFixService';

export type SiteImageTargetType = 'PRODUCT' | 'CATEGORY' | 'RFQ' | 'HERO_SLIDE' | 'SITE_ASSET';

interface UnifiedSiteImageItem {
  id: string;
  type: SiteImageTargetType;
  title: string;
  category: string;
  specifications?: string;
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

type ScopeFilter =
  | 'ALL'
  | 'VERIFIED'
  | 'CHANGED'
  | 'NEEDS_FIX'
  | 'DUPLICATE'
  | 'SKIPPED'
  | 'PRODUCT'
  | 'CATEGORY'
  | 'RFQ'
  | 'BANNERS';

interface WholeSiteImageStudioProps {
  onViewLiveItem?: (item: { recordId: string; recordType: string }) => void;
}

const DEFAULT_ITEMS_PER_PAGE = 24;

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
  const [layoutMode, setLayoutMode] = useState<'GRID' | 'ROWS'>('GRID');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const [busyRowIds, setBusyRowIds] = useState<Record<string, string>>({});
  const [urlEditor, setUrlEditor] = useState<{ itemId: string; value: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [inspectingItem, setInspectingItem] = useState<UnifiedSiteImageItem | null>(null);
  const [croppingItem, setCroppingItem] = useState<UnifiedSiteImageItem | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    changedItem?: UnifiedSiteImageItem;
    showChangedTabShortcut?: boolean;
  } | null>(null);
  const [bgSnapshot, setBgSnapshot] = useState<BackgroundAutoFixSnapshot>(() =>
    backgroundAutoFixService.getSnapshot()
  );
  const [localSkippedItems, setLocalSkippedItems] = useState<Record<string, { reason: string; at: number }>>({});
  // Keyed by item.id -> exact URL that failed to load, so any new URL immediately clears the broken state
  const [brokenThumbUrls, setBrokenThumbUrls] = useState<Record<string, string>>({});
  const prevBgActiveRef = useRef<boolean>(bgSnapshot.active);

  const sessionChanges = bgSnapshot.sessionChanges;
  const totalDeletedFilesSession = bgSnapshot.totalDeletedFilesSession;
  const skippedItems = useMemo(
    () => ({ ...bgSnapshot.skippedItems, ...localSkippedItems }),
    [bgSnapshot.skippedItems, localSkippedItems]
  );
  const bgQueuedSet = useMemo(() => new Set<string>(bgSnapshot.queuedIds), [bgSnapshot.queuedIds]);

  // Local batch upload progress (file -> multiple rows) + Background Auto-Fix progress
  const [localUploadProgress, setLocalUploadProgress] = useState<{
    active: boolean;
    total: number;
    completed: number;
    fixed: number;
    failed: number;
    deletedOld: number;
    currentLabel: string;
  } | null>(null);
  const abortBatchRef = useRef<boolean>(false);

  const batchProgress = bgSnapshot.active
    ? {
        active: true,
        isBackgroundAutoFix: true,
        stopping: bgSnapshot.stopping,
        total: bgSnapshot.total,
        completed: bgSnapshot.completed,
        fixed: bgSnapshot.fixed,
        failed: bgSnapshot.failed,
        deletedOld: bgSnapshot.deletedOld,
        currentLabel: bgSnapshot.currentLabel
      }
    : localUploadProgress
      ? {
          ...localUploadProgress,
          isBackgroundAutoFix: false,
          stopping: false
        }
      : null;

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
          productImageManagerService.syncFromServer(true, true, {
            bypassCooldown: true,
            emitEvenIfUnchanged: true
          }),
          refreshFromServer()
        ]);
      } else {
        await productImageManagerService.syncFromServer(true, true).catch(() => {});
      }

      const [prodRes, rfqRes, snapRes, delRes] = await Promise.allSettled([
        api.getProducts(),
        api.getRfqs(),
        fetch(`/data/fullCatalogSnapshot.json?_t=${Date.now()}`, { cache: 'no-store' })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch(`/api/v1/admin/site-items/deleted-ids?_t=${Date.now()}`, { cache: 'no-store' })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null)
      ]);

      if (delRes.status === 'fulfilled' && delRes.value?.success) {
        if (Array.isArray(delRes.value.deletedProductIds)) {
          syncDeletedProductIdsFromServer(delRes.value.deletedProductIds);
        }
        if (Array.isArray(delRes.value.deletedRfqIds)) {
          syncDeletedRfqIdsFromServer(delRes.value.deletedRfqIds);
        }
      }

      const deletedProdSet = getDeletedProductIdsSet();
      const deletedRfqSet = getDeletedRfqIdsSet();
      const isProdDeleted = (rawId: string) => {
        const s = String(rawId || '').trim();
        const stripped = s.replace(/^prod-db-/i, '');
        return deletedProdSet.has(s) || deletedProdSet.has(stripped) || deletedProdSet.has(`prod-db-${stripped}`);
      };
      const isRfqDeleted = (rawId: string) => {
        const s = String(rawId || '').trim();
        const stripped = s.replace(/^rfq-/i, '');
        return deletedRfqSet.has(s) || deletedRfqSet.has(stripped) || deletedRfqSet.has(`rfq-${stripped}`);
      };

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
          const pid = String(p?.id || '').trim();
          if (pid && !isProdDeleted(pid)) mergedProdMap.set(pid, p);
        }
      }
      for (const p of MOCK_PRODUCTS) {
        const pid = String(p?.id || '').trim();
        if (pid && !isProdDeleted(pid) && !mergedProdMap.has(pid)) {
          mergedProdMap.set(pid, p);
        }
      }
      for (const s of snapItems) {
        if (!s?.id || s.type === 'RFQ' || s.type === 'CATEGORY') continue;
        const sid = String(s.id).trim();
        if (!sid || isProdDeleted(sid) || mergedProdMap.has(sid)) continue;
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
      setProducts(Array.from(mergedProdMap.values()));

      const mergedRfqMap = new Map<string, RfqRequirement>();
      if (rfqRes.status === 'fulfilled' && Array.isArray(rfqRes.value)) {
        for (const r of rfqRes.value) {
          const rid = String(r?.id || '').trim();
          if (rid && !isRfqDeleted(rid)) mergedRfqMap.set(rid, r);
        }
      }
      for (const r of MOCK_RFQS) {
        const rid = String(r?.id || '').trim();
        if (rid && !isRfqDeleted(rid) && !mergedRfqMap.has(rid)) {
          mergedRfqMap.set(rid, r);
        }
      }
      for (const s of snapItems) {
        if (!s?.id || s.type !== 'RFQ') continue;
        const sid = String(s.id).trim();
        if (!sid || isRfqDeleted(sid) || mergedRfqMap.has(sid)) continue;
        const imgUrl = String(s.image_url || s.image || s.images?.[0] || '').trim();
        mergedRfqMap.set(sid, {
          id: sid,
          productName: String(s.title || s.productName || sid),
          category: String(s.category || 'Buy Lead'),
          specifications: String(s.specifications || s.description || s.details || '').trim(),
          description: String(s.description || s.specifications || '').trim(),
          image: imgUrl,
          images: imgUrl ? [imgUrl] : []
        } as unknown as RfqRequirement);
      }
      setRfqs(Array.from(mergedRfqMap.values()));
      setBrokenThumbUrls({});
      setStateVersion(v => v + 1);
    } finally {
      setIsLoadingInventory(false);
    }
  }, [refreshFromServer]);

  useEffect(() => {
    void loadAllInventory(true);
    void backgroundAutoFixService.pollServerJobOnce();
    const unsubBg = backgroundAutoFixService.subscribe(snap => {
      const wasActive = prevBgActiveRef.current;
      prevBgActiveRef.current = snap.active;
      setBgSnapshot(snap);
      setStateVersion(v => v + 1);
      if (wasActive && !snap.active) {
        // Force fresh authoritative server sync whenever a background batch finishes or stops
        void loadAllInventory(true);
      }
      if (!snap.active && snap.lastCompletedNotice) {
        const n = snap.lastCompletedNotice;
        if (Date.now() - n.at < 15 * 60 * 1000) {
          setBannerNotice(prev => {
            if (prev?.text === n.text) return prev;
            return {
              type: n.type,
              text: n.text,
              showChangedTabShortcut: n.fixed > 0
            };
          });
        }
      }
    });
    const onImageEvent = () => setStateVersion(v => v + 1);
    window.addEventListener('tradeheaven_product_images_updated', onImageEvent);
    window.addEventListener('tradeheaven_product_image_saved', onImageEvent);
    return () => {
      unsubBg();
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
        specifications: String(prod.description || (prod as any).specifications || '').trim() || undefined,
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
      const rfqSpecs = [
        (rfq as any).specifications,
        rfq.detailedRequirements,
        rfq.detailedDescription,
        (rfq as any).description
      ]
        .map(v => String(v || '').trim())
        .filter(Boolean)
        .join(' | ');
      pushRaw({
        id,
        type: 'RFQ',
        title: rfq.productName || (rfq as any).title || id,
        category: rfq.category || 'Buy Lead',
        specifications: rfqSpecs || undefined,
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

    const isClientCrossCategoryMismatch = (url: string, title: string, category: string): boolean => {
      if (!url) return false;
      const ul = url.toLowerCase();
      const tj = `${title || ''} ${category || ''}`.toLowerCase();
      if (/(automotive-electric-vehicles|abc-dry-chemical|oem-specification-accounting|industrial-ball-bearings-frozen-shri)/i.test(ul)) return true;
      if (ul.includes('monocrystalli') && !/(solar|photovoltaic|\bpv\b|monocrystalline|panel|germanium|wafer|infrared)/i.test(tj)) return true;
      if ((ul.includes('black-jade') || ul.includes('raw-stone')) && (!/(jade|cabochon|nephrite|gem|gemstone|crystal)/i.test(tj) || /(quartz|slab|tile|building|construction|cement)/i.test(tj))) return true;
      if ((ul.includes('5-axis-cnc') || ul.includes('cnc-milling')) && !/(cnc|milling|lathe|machining|tooling)/i.test(tj)) return true;
      if ((ul.includes('medical-ipl') || ul.includes('photorejuvenation')) && !/(ipl|photorejuvenation|laser\s*machine|aesthetic\s*machine|hair\s*removal)/i.test(tj)) return true;
      if (/(leather[_-]belt|cowhide|cowh-|verified-belt)/i.test(ul) && (!/(leather|cowhide|hide|footwear|shoe|handbag|wallet|saddle|waist\s*belt|dress\s*belt)/i.test(tj) || /(conveyor|abaya|agriculture|grain|wheat|rice|scrap)/i.test(tj))) return true;
      if (/(used-shoes|clothing-bales|winter-coat|vintage-denim|summer-clothing)/i.test(ul) && !/(cloth|apparel|garment|shoe|footwear|denim|coat|fashion|textile|fabric|bale|secondhand|used\s*cloth)/i.test(tj)) return true;
      if (/(tyre-scraps|rubber-offcut)/i.test(ul) && !/(scrap|tyre|tire|rubber|waste|recycl|polymer|plastic|crumb)/i.test(tj)) return true;
      if (/(deformed-reinforcing-steel-rebar|deformed-steel-rebar|steel-rebar)/i.test(ul) && !/(rebar|steel|iron|metal|billet|coil|bar|rod|building|construction|cement|hardware|elevator|escalator|scaffold)/i.test(tj)) return true;
      if (/(paper-shredder|paper-trimmers|a4-copy-paper)/i.test(ul) && !/(paper|stationery|office|print|book|packaging|carton|box|notebook|pulp|shredder|envelope)/i.test(tj)) return true;
      if (/(copper-wire|copper-cathode|copper-powder)/i.test(ul) && !/(copper|wire|cable|metal|scrap|cathode|ingot|mining|mineral|alloy|brass|aluminum)/i.test(tj)) return true;
      if (/(avocado|strawberry|apricot|mango|banana|chicken|egg|coffee|tea|turmeric|cardamom|jasmine-rice|basmati|cashew|sunflower|soybean|corn-maize|sugar-free|fruit-jam|vanilla|broccoli|asparagus)/i.test(ul) && !/(food|fruit|jam|spread|meat|poultry|chicken|egg|rice|grain|spice|tea|coffee|oil|agri|agriculture|nut|cashew|corn|maize|soy|sugar|vegetable|produce|seed|bean)/i.test(tj)) return true;
      return false;
    };

    return rawList.map(item => {
      const u = item.currentUrl;
      const ov = overrides[item.id];
      const isManualOrLocked = Boolean(
        ov &&
        u &&
        (ov.locked === true || ov.serverVerified === true || ov.updatedBy === 'admin-manual')
      );

      const isThumbMarkedBroken = Boolean(u && brokenThumbUrls[item.id] === u);
      const isOptionalEmptySiteAsset = item.type === 'SITE_ASSET' && !u;
      const isMismatched =
        item.type !== 'SITE_ASSET' &&
        item.type !== 'HERO_SLIDE' &&
        isClientCrossCategoryMismatch(u, item.title, item.category);
      if (
        !isOptionalEmptySiteAsset &&
        (!u ||
          isThumbMarkedBroken ||
          isMismatched ||
          isGenericOrPlaceholderImageUrl(u) ||
          isSyntheticSpecCardOrPlaceholder(u) ||
          /^https?:\/\//i.test(u))
      ) {
        return {
          ...item,
          status: 'NEEDS_FIX' as const,
          statusDetail: !u
            ? 'Missing image'
            : isThumbMarkedBroken
              ? 'Broken / missing file on server'
              : isMismatched
                ? 'Cross-category subject mismatch'
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
  }, [products, rfqs, siteContent, stateVersion, sessionChanges, brokenThumbUrls]);

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
      if (it.status !== 'VERIFIED' && skippedItems[it.id]) skippedCount++;

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
      if (scopeFilter === 'VERIFIED' && it.status !== 'VERIFIED') return false;
      if (scopeFilter === 'CHANGED' && !it.isChangedLive) return false;
      if (scopeFilter === 'NEEDS_FIX' && it.status === 'VERIFIED') return false;
      if (scopeFilter === 'DUPLICATE' && it.status !== 'DUPLICATE') return false;
      if (scopeFilter === 'SKIPPED' && (!skippedItems[it.id] || it.status === 'VERIFIED')) return false;
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, safePage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [scopeFilter, searchQuery, itemsPerPage]);

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

      backgroundAutoFixService.recordManualSessionChange(
        entries.map(e => ({
          id: e.id,
          deletedOldCount: Array.isArray(e.deletedOldUrls) ? e.deletedOldUrls.length : 0,
          action: e.action || 'UPLOAD'
        }))
      );
      setLocalSkippedItems(prev => {
        const next = { ...prev };
        for (const e of entries) {
          delete next[e.id];
        }
        return next;
      });
      setBrokenThumbUrls(prev => {
        const next = { ...prev };
        for (const e of entries) {
          delete next[e.id];
        }
        return next;
      });

      productImageManagerService.applyServerOverrideSnapshot(snapshotPayload);
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
        backgroundAutoFixService.recordManualSessionChange([
          { id: item.id, deletedOldCount: 1, action: 'UPLOAD' }
        ]);
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

  // Permanently delete entire listed thing(s) (Product / Buy Lead / Hero Slide / Category) + their image file(s) from the whole website & storage
  const handlePermanentDeleteEntireListing = async (targets: UnifiedSiteImageItem[]) => {
    if (targets.length === 0) return;
    setDeleteConfirmId(null);
    setBulkDeleteConfirm(false);
    setBannerNotice(null);
    const isBulk = targets.length > 1;
    if (isBulk) setIsBulkDeleting(true);
    setBusyRowIds(prev => {
      const next = { ...prev };
      for (const t of targets) next[t.id] = 'Deleting...';
      return next;
    });

    try {
      const res = await deleteSiteListingsPermanently(
        targets.map(t => ({
          id: t.id,
          type: t.type,
          currentUrl: t.currentUrl || t.baseUrl,
          fieldPath: t.fieldPath
        }))
      );

      if (res.deletedProductIds.length > 0) {
        syncDeletedProductIdsFromServer(res.deletedProductIds);
      }
      if (res.deletedRfqIds.length > 0) {
        syncDeletedRfqIdsFromServer(res.deletedRfqIds);
      }

      const deletedProdIds = targets.filter(t => t.type === 'PRODUCT').map(t => t.id);
      const deletedRfqIds = targets.filter(t => t.type === 'RFQ').map(t => t.id);
      const hasSiteContentChanges = targets.some(
        t => t.type === 'HERO_SLIDE' || t.type === 'CATEGORY' || t.type === 'SITE_ASSET'
      );

      if (deletedProdIds.length > 0) {
        markProductIdsDeleted(deletedProdIds);
        const delSet = new Set(deletedProdIds);
        setProducts(prev => prev.filter(p => !delSet.has(String(p.id))));
      }
      if (deletedRfqIds.length > 0) {
        markRfqIdsDeleted(deletedRfqIds);
        const delSet = new Set(deletedRfqIds);
        setRfqs(prev => prev.filter(r => !delSet.has(String(r.id))));
      }

      const targetIdSet = new Set(targets.map(t => t.id));
      setSelectedIds(prev => {
        const next = { ...prev };
        for (const id of targetIdSet) delete next[id];
        return next;
      });
      setLocalSkippedItems(prev => {
        const next = { ...prev };
        for (const id of targetIdSet) delete next[id];
        return next;
      });
      for (const id of targetIdSet) {
        backgroundAutoFixService.clearSkippedItem(id);
      }

      if (hasSiteContentChanges) {
        await refreshFromServer().catch(() => {});
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
        window.dispatchEvent(new Event('tradeheaven_rfqs_updated'));
      }
      setStateVersion(v => v + 1);

      setBannerNotice({
        type: 'success',
        text:
          targets.length === 1
            ? `Permanently deleted "${targets[0].title}" from the entire website${
                res.deletedFiles.length > 0 ? ` and removed ${res.deletedFiles.length} image file from server storage.` : '.'
              }`
            : `Permanently deleted ${res.deletedCount} selected listing(s) from the website and removed ${res.deletedFiles.length} image file(s) from server storage.`
      });
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        text: `Permanent delete failed: ${err?.message || 'Unable to delete listing(s).'}`
      });
    } finally {
      setIsBulkDeleting(false);
      setBusyRowIds(prev => {
        const next = { ...prev };
        for (const t of targets) delete next[t.id];
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
          specifications: item.specifications,
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
      setLocalSkippedItems(prev => ({
        ...prev,
        [item.id]: { reason: errReason, at: Date.now() }
      }));
      setBannerNotice({
        type: 'error',
        text: `Auto-Fix skipped "${item.title}": ${errReason} Click the item to pick from up to 50 Alibaba, Google & Web photos or upload manually.`,
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

  // Persistent Background Batch Auto-Fix (keeps running across Admin tab switches, page navigation, and reloads)
  const runBatchAutoFix = async (targets: UnifiedSiteImageItem[]) => {
    if (targets.length === 0 || localUploadProgress?.active) return;
    setBannerNotice(null);
    backgroundAutoFixService.dismissNotice();
    setLocalSkippedItems(prev => {
      const next = { ...prev };
      for (const t of targets) delete next[t.id];
      return next;
    });
    const queueItems: BackgroundAutoFixItem[] = targets.map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      category: c.category,
      specifications: c.specifications,
      currentUrl: c.currentUrl,
      fieldPath: c.fieldPath
    }));
    setSelectedIds({});
    await backgroundAutoFixService.enqueue(queueItems);
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

    setLocalUploadProgress({
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
      setLocalUploadProgress({
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

    setLocalUploadProgress(null);
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

  const unusedOrFlaggedList = useMemo(
    () => allItems.filter(it => (it.status === 'NEEDS_FIX' || it.status === 'DUPLICATE') && it.id !== 'site-brand-logo'),
    [allItems]
  );

  const handleSelectUnusedOrFlagged = () => {
    setSelectedIds(prev => {
      const next = { ...prev };
      const allSelected = unusedOrFlaggedList.length > 0 && unusedOrFlaggedList.every(it => next[it.id]);
      if (allSelected) {
        for (const it of unusedOrFlaggedList) delete next[it.id];
      } else {
        for (const it of unusedOrFlaggedList) next[it.id] = true;
      }
      return next;
    });
  };

  const flaggedItems = useMemo(
    () =>
      allItems
        .filter(it => it.status !== 'VERIFIED' && it.id !== 'site-brand-logo' && it.type !== 'SITE_ASSET')
        .sort((a, b) => {
          const rank = (t: SiteImageTargetType) =>
            t === 'PRODUCT' ? 0 : t === 'CATEGORY' ? 1 : t === 'RFQ' ? 2 : 3;
          return rank(a.type) - rank(b.type);
        }),
    [allItems]
  );

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

      {/* UNIFIED ALL-IN-ONE COMMAND DECK (Zero-Glide Control Header for PC & Mobile) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
        {/* Top Row: Title + Quick Metric Filters + Primary Actions */}
        <div className="px-3.5 sm:px-5 py-3 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Whole-Site Image Control Studio
            </h3>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {stats.total.toLocaleString()} total · {stats.verified.toLocaleString()} verified · {totalDeletedFilesSession.toLocaleString()} old files deleted
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={flaggedItems.length === 0 || Boolean(batchProgress?.active)}
              onClick={() => void runBatchAutoFix(flaggedItems)}
              className="px-3 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>
                {flaggedItems.length > 0
                  ? `Auto-Fix Flagged (${flaggedItems.length})`
                  : 'All Verified'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkUploader(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                showBulkUploader
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>{showBulkUploader ? 'Hide Bulk Upload' : 'Bulk Upload'}</span>
            </button>

            <button
              type="button"
              disabled={isLoadingInventory || Boolean(batchProgress?.active)}
              onClick={() => void loadAllInventory(true)}
              className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInventory ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* View Layout Switcher (Multi-Column Card Grid vs Full-Width Compact Rows) */}
            <div className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setLayoutMode('GRID')}
                className={`px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  layoutMode === 'GRID'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Multi-column card grid (1 col on mobile, 2–3 cols on PC)"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('ROWS')}
                className={`px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  layoutMode === 'ROWS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Compact single-column rows with inline actions"
              >
                <List className="w-3 h-3" />
                <span>Rows</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: All Status & Category Filters in One Wrapping Bar */}
        <div className="px-3.5 sm:px-5 py-2 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'ALL', label: `All (${stats.total})` },
              { id: 'VERIFIED', label: `Verified (${stats.verified})` },
              { id: 'CHANGED', label: `Changed Live (${stats.changedCount})` },
              { id: 'NEEDS_FIX', label: `Needs Fix (${stats.flaggedTotal})` },
              { id: 'DUPLICATE', label: `Duplicates (${stats.duplicates})` },
              { id: 'SKIPPED', label: `Skipped (${stats.skippedCount})` },
              { id: 'PRODUCT', label: `Products (${stats.productsCount})` },
              { id: 'CATEGORY', label: `Categories (${stats.categoriesCount})` },
              { id: 'RFQ', label: `Buy Leads (${stats.rfqsCount})` },
              { id: 'BANNERS', label: `Banners & Assets (${stats.bannersCount})` }
            ] as Array<{ id: ScopeFilter; label: string }>
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScopeFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                scopeFilter === tab.id
                  ? tab.id === 'CHANGED' || tab.id === 'VERIFIED'
                    ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                    : tab.id === 'DUPLICATE'
                      ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                      : tab.id === 'SKIPPED' || tab.id === 'NEEDS_FIX'
                        ? 'bg-red-600 text-white font-semibold shadow-2xs'
                        : 'bg-[#0F294D] text-white font-semibold shadow-2xs'
                  : tab.id === 'CHANGED' && Object.keys(sessionChanges).length > 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold'
                    : tab.id === 'DUPLICATE' && stats.duplicates > 0
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {stats.skippedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                backgroundAutoFixService.clearAllSkipped();
                setLocalSkippedItems({});
                if (scopeFilter === 'SKIPPED') setScopeFilter('NEEDS_FIX');
              }}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
              title="Clear skipped markers so items can be retried cleanly"
            >
              Clear Skipped
            </button>
          )}
        </div>

        {/* Third Row: Search + Select Page + Batch Selection Actions + Top Pagination in One Place */}
        <div className="px-3.5 sm:px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={toggleSelectPage}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label="Select all on page"
            >
              {allOnPageSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#0F294D]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Page ({pageItems.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSelectUnusedOrFlagged}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Select all flagged, broken, or duplicate items not in clean verified state"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Select Unused ({unusedOrFlaggedList.length})</span>
            </button>

            <button
              type="button"
              disabled={isBulkDeleting || Boolean(batchProgress?.active) || unusedOrFlaggedList.length === 0}
              onClick={() => {
                const next: Record<string, boolean> = {};
                for (const it of unusedOrFlaggedList) next[it.id] = true;
                setSelectedIds(next);
                setBulkDeleteConfirm(true);
              }}
              className="px-2.5 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              title="Select and permanently delete all unused, flagged, or duplicate data from the site in bulk completely"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Unused ({unusedOrFlaggedList.length})</span>
            </button>

            <div className="relative flex-1 min-w-[180px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search title, ID, category, location, or file..."
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
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={Boolean(batchProgress?.active)}
                  onClick={() => selectedRowsUploadInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                  title="Upload one image and apply it to every checked item"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload to Selected ({selectedIdList.length})</span>
                </button>
                <button
                  type="button"
                  disabled={Boolean(localUploadProgress?.active)}
                  onClick={() => {
                    const idSet = new Set(selectedIdList);
                    const targets = allItems.filter(it => idSet.has(it.id));
                    void runBatchAutoFix(targets);
                  }}
                  className="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>
                    {bgSnapshot.active
                      ? `Queue Auto-Fix (${selectedIdList.length})`
                      : `Auto-Fix Selected (${selectedIdList.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isBulkDeleting || Boolean(localUploadProgress?.active)}
                  onClick={() => setBulkDeleteConfirm(prev => !prev)}
                  className="px-2.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                  title="Permanently delete selected listings & images from the entire website"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIdList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds({});
                    setBulkDeleteConfirm(false);
                  }}
                  className="px-2 py-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Inline Top Pagination & Density Selector (No need to scroll to bottom to change page) */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-1.5 text-xs text-slate-600 shrink-0">
            <span className="tabular-nums text-[11px] text-slate-500">
              {filteredItems.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1}–
              {Math.min(safePage * itemsPerPage, filteredItems.length)} of {filteredItems.length.toLocaleString()}
            </span>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value) || DEFAULT_ITEMS_PER_PAGE)}
              aria-label="Items per page"
              className="px-1.5 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-700 font-medium focus:outline-none focus:border-[#0F294D]"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
              <option value={96}>96 / page</option>
            </select>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono tabular-nums text-[11px] text-slate-700">
                {safePage}/{totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer inline-flex items-center"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Inline Bulk Permanent Delete Confirmation Bar */}
        {bulkDeleteConfirm && selectedIdList.length > 0 && (
          <div className="px-3.5 sm:px-5 py-2.5 border-t border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-red-900 font-semibold">
              Permanently delete {selectedIdList.length} selected listing(s) and their image files from the entire website? This cannot be undone.
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => {
                  const idSet = new Set(selectedIdList);
                  const targets = allItems.filter(it => idSet.has(it.id));
                  void handlePermanentDeleteEntireListing(targets);
                }}
                className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulkDeleting ? 'Deleting...' : `Confirm Permanent Delete (${selectedIdList.length})`}</span>
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-medium cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Notice Banner with Direct Live Check & Changed-Items Jump */}
      {bannerNotice && (
        <div
          className={`px-4 sm:px-5 py-2.5 border-b text-xs font-medium flex flex-wrap items-center justify-between gap-2.5 ${
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
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
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
              onClick={() => {
                setBannerNotice(null);
                backgroundAutoFixService.dismissNotice();
              }}
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
        <div className="px-4 sm:px-5 py-3 border-b border-blue-200 bg-blue-50/70 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-semibold text-slate-900">
              {batchProgress.isBackgroundAutoFix
                ? `Auto-Fixing in background (${batchProgress.completed} / ${batchProgress.total})`
                : `Auto-Fixing images (${batchProgress.completed} / ${batchProgress.total})`}
              <span className="text-slate-500 font-normal ml-2">
                {batchProgress.fixed} fixed · {batchProgress.failed} skipped · {batchProgress.deletedOld} old files deleted
                {batchProgress.isBackgroundAutoFix ? ' · Keeps running if you switch pages' : ''}
              </span>
            </div>
            <button
              type="button"
              disabled={batchProgress.stopping}
              onClick={() => {
                if (batchProgress.isBackgroundAutoFix) {
                  void backgroundAutoFixService.stop();
                } else {
                  abortBatchRef.current = true;
                }
              }}
              className="px-3 py-1 rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {batchProgress.stopping ? 'Stopping...' : 'Stop Batch'}
            </button>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              handleBulkFilesAdded(e.dataTransfer.files);
            }}
            onClick={() => bulkFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0F294D] bg-white rounded-lg p-5 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
            <div className="text-xs sm:text-sm font-semibold text-slate-900">
              Drop multiple images here or click to select files
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Filenames matching a Product ID or title auto-assign automatically. Replaced old images are permanently deleted from server storage.
            </div>
          </div>

          {bulkQueue.length > 0 && (
            <div className="space-y-2.5">
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
                    className="px-3.5 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
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
                    <div key={qItem.queueId} className="px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2.5">
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

      {/* ZERO-GLIDE SELF-CONTAINED ITEM DECK (Every Option Visible In-Place on Mobile & Full-Screen PC) */}
      <div className="p-3 sm:p-4 bg-slate-50/60">
        {isLoadingInventory && pageItems.length === 0 ? (
          <div
            className={
              layoutMode === 'GRID'
                ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3'
                : 'grid grid-cols-1 gap-2.5'
            }
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-lg p-3 animate-pulse space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-16 bg-slate-200 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-7 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-10 px-6 text-center text-sm text-slate-500">
            {scopeFilter === 'CHANGED'
              ? 'No live changed images recorded yet. Upload, paste a URL, or Auto-Fix any item and it will appear here in real time.'
              : scopeFilter === 'NEEDS_FIX'
                ? 'Every scanned image across the entire site is verified on server storage.'
                : 'No matching site items found for your search filter.'}
          </div>
        ) : (
          <div
            className={
              layoutMode === 'GRID'
                ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3'
                : 'grid grid-cols-1 gap-2.5'
            }
          >
            {pageItems.map(item => {
              const isSelected = Boolean(selectedIds[item.id]);
              const rowBusyLabel = busyRowIds[item.id];
              const isEditingUrl = urlEditor?.itemId === item.id;
              const isConfirmingDelete = deleteConfirmId === item.id;
              const thumbSrc = item.currentUrl
                ? item.currentUrl.startsWith('/assets/uploads/')
                  ? `${optimizeImageUrl(item.currentUrl, { width: 200, isThumbnail: true })}&_v=${stateVersion}`
                  : item.currentUrl
                : '';

              const isBgQueued = bgSnapshot.active && bgQueuedSet.has(item.id);
              const isSkipped = Boolean(skippedItems[item.id]);
              const statusText = isBgQueued
                ? item.id === bgSnapshot.currentItemId
                  ? 'Auto-Fixing...'
                  : 'Queued'
                : isSkipped
                  ? 'Skipped'
                  : item.status === 'VERIFIED'
                    ? 'Verified'
                    : item.status === 'DUPLICATE'
                      ? 'Duplicate'
                      : 'Needs Image';

              const statusColorClass = isBgQueued
                ? 'text-blue-700'
                : isSkipped
                  ? 'text-red-700'
                  : item.status === 'VERIFIED'
                    ? 'text-emerald-700'
                    : item.status === 'DUPLICATE'
                      ? 'text-amber-700'
                      : 'text-red-700';

              const shortFileName = item.currentUrl
                ? item.currentUrl.split('?')[0].split('/').pop() || item.currentUrl
                : 'No server file';

              return (
                <div
                  key={item.id}
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
                            out.deletedCount > 0
                              ? ` (${out.deletedCount} old file permanently deleted from server).`
                              : '.'
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
                  className={`bg-white border rounded-lg p-3 transition-colors flex flex-col justify-between ${
                    dragOverRowId === item.id
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/30'
                      : isSelected
                        ? 'border-[#0F294D] bg-blue-50/25 ring-1 ring-[#0F294D]/20'
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Content Area: Checkbox + Thumbnail + Complete Item Details */}
                  <div
                    className={
                      layoutMode === 'ROWS'
                        ? 'flex flex-col lg:flex-row lg:items-center justify-between gap-3'
                        : 'space-y-2.5'
                    }
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Select Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-slate-900 cursor-pointer shrink-0"
                        aria-label={`Select ${item.title}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#0F294D]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Crisp Thumbnail Preview (Click to open 50-photo Inspector) */}
                      <button
                        type="button"
                        onClick={() => setInspectingItem(item)}
                        title="Click to inspect & choose from verified photos"
                        className="w-20 h-16 sm:w-22 sm:h-18 rounded-md border border-slate-200 hover:border-[#0F294D] bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group relative"
                      >
                        {thumbSrc && brokenThumbUrls[item.id] !== item.currentUrl && !isSyntheticSpecCardOrPlaceholder(item.currentUrl) ? (
                          <img
                            src={thumbSrc}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={() => {
                              setBrokenThumbUrls(prev =>
                                prev[item.id] === item.currentUrl
                                  ? prev
                                  : { ...prev, [item.id]: item.currentUrl }
                              );
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium text-center px-1 leading-tight">
                            {busyRowIds[item.id] ? 'Fixing...' : 'No Image'}
                          </span>
                        )}
                      </button>

                      {/* Right Info Stack: Status + Full Title + Metadata + Live Location */}
                      <div className="min-w-0 flex-1">
                        {/* Status & Live New-Tab Row */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setInspectingItem(item)}
                            className={`font-semibold hover:underline cursor-pointer ${statusColorClass}`}
                          >
                            {statusText}
                            {item.changedAtMs > 0 && (
                              <span className="text-slate-500 font-normal ml-1.5 tabular-nums">
                                · {formatRelativeChangeTime(item.changedAtMs)}
                              </span>
                            )}
                          </button>

                          <a
                            href={item.liveHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:underline inline-flex items-center gap-0.5 shrink-0"
                            title="Open live page in new tab"
                          >
                            <span>New Tab</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        {/* Item Title (2-line readable clamp, never truncated to 3 words) */}
                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#0F294D] hover:underline text-left line-clamp-2 leading-snug mt-0.5 cursor-pointer"
                          title={item.title}
                        >
                          {item.title}
                        </button>

                        {/* Unboxed Metadata: TYPE · ID · Category */}
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1 mt-0.5 leading-tight">
                          <span className="font-semibold text-slate-700">{item.type.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-600 break-all">{item.id}</span>
                          {item.category && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[150px]">{item.category}</span>
                            </>
                          )}
                        </div>

                        {/* Live Site Location & Compact Server Filename */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleCheckLiveOnSite(item)}
                            className="inline-flex items-center gap-1 text-[#0F294D] hover:text-[#EA580C] font-medium hover:underline cursor-pointer text-left min-w-0"
                            title={`Jump to live site location: ${item.siteLocationLabel}`}
                          >
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[230px] sm:max-w-[280px]">{item.siteLocationLabel}</span>
                          </button>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span
                            className="font-mono text-[10px] text-slate-400 truncate max-w-[170px]"
                            title={item.currentUrl || 'No server file assigned'}
                          >
                            {shortFileName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ALL-IN-ONE ACTION STRIP (Always Visible In-Place on Mobile & PC — Zero Horizontal Gliding) */}
                    <div
                      className={
                        layoutMode === 'ROWS'
                          ? 'pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex flex-wrap items-center gap-1.5 shrink-0'
                          : 'pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5'
                      }
                    >
                      <button
                        type="button"
                        disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                        onClick={() => {
                          rowUploadTargetRef.current = item;
                          rowFileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        title="Upload new image from device"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{rowBusyLabel === 'Uploading...' ? 'Uploading...' : 'Upload'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                        onClick={() => void handleAutoFixSingle(item)}
                        className="px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#0F294D] border border-blue-200 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        title="1-click Auto-Fix unique photo & delete old server file"
                      >
                        <Wand2 className={`w-3 h-3 ${rowBusyLabel === 'Auto-fixing...' ? 'animate-spin' : ''}`} />
                        <span>{rowBusyLabel === 'Auto-fixing...' ? 'Fixing...' : 'Auto-Fix'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                        onClick={() => setInspectingItem(item)}
                        className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        title="Pick from ~50 verified web photos or media library"
                      >
                        <Eye className="w-3 h-3 text-[#0F294D]" />
                        <span>Photos</span>
                      </button>

                      <button
                        type="button"
                        disabled={!item.currentUrl || Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                        onClick={() => setCroppingItem(item)}
                        className="px-2 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40"
                        title="Crop, rotate, zoom, or adjust image filters"
                      >
                        <Crop className="w-3 h-3" />
                        <span>Crop</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(rowBusyLabel)}
                        onClick={() => {
                          setDeleteConfirmId(null);
                          setUrlEditor(isEditingUrl ? null : { itemId: item.id, value: item.currentUrl || '' });
                        }}
                        className={`px-2 py-1.5 rounded-md border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                          isEditingUrl
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        title="Paste direct image URL"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>URL</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCheckLiveOnSite(item)}
                        className="px-2 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 hover:text-[#0F294D] border border-slate-300 text-xs font-medium inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                        title={`View live on site: ${item.siteLocationLabel}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(rowBusyLabel)}
                        onClick={() => {
                          setUrlEditor(null);
                          setDeleteConfirmId(isConfirmingDelete ? null : item.id);
                        }}
                        className={`px-2 py-1.5 rounded-md border text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 ${
                          isConfirmingDelete
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-red-50/70 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300'
                        }`}
                        title="Permanently delete this listing from website or delete its image"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{rowBusyLabel === 'Deleting...' ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline URL Editor (Expands cleanly inside the card) */}
                  {isEditingUrl && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                      <input
                        type="text"
                        value={urlEditor.value}
                        onChange={e => setUrlEditor({ itemId: item.id, value: e.target.value })}
                        placeholder="Paste https://... or /assets/uploads/... URL"
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:bg-white focus:border-[#0F294D]"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void handleSaveInlineUrl(item)}
                          className="flex-1 sm:flex-initial px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrlEditor(null)}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Delete Confirmation: Permanent Delete Entire Listing + Image OR Image Only */}
                  {isConfirmingDelete && (
                    <div className="mt-2.5 pt-2.5 border-t border-red-200 bg-red-50/85 -mx-3 -mb-3 p-3 rounded-b-lg flex flex-col gap-2 text-xs">
                      <div className="text-red-900 font-medium leading-snug">
                        {item.type === 'SITE_ASSET'
                          ? `Permanently delete image (${shortFileName}) and clear this site banner slot?`
                          : `Permanently delete "${item.title}" (${item.type.replace('_', ' ')}) from the entire website & server storage?`}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.type !== 'SITE_ASSET' && (
                          <button
                            type="button"
                            onClick={() => void handlePermanentDeleteEntireListing([item])}
                            className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Listing & Image</span>
                          </button>
                        )}
                        {item.currentUrl && (
                          <button
                            type="button"
                            onClick={() => void handlePermanentDeleteItemImage(item)}
                            className={`px-3 py-1.5 rounded-md font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                              item.type === 'SITE_ASSET'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-white hover:bg-red-100 text-red-700 border border-red-300'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{item.type === 'SITE_ASSET' ? 'Delete Image & Clear Slot' : 'Delete Image Only'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-medium cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Pagination Footer */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="tabular-nums">
          Showing {filteredItems.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1}–
          {Math.min(safePage * itemsPerPage, filteredItems.length)} of {filteredItems.length.toLocaleString()} items
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
              description: inspectingItem.specifications || inspectingItem.siteLocationLabel,
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
              backgroundAutoFixService.recordManualSessionChange([
                { id: inspectingItem.id, deletedOldCount: 1, action: 'UPLOAD' }
              ]);
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
            backgroundAutoFixService.recordManualSessionChange([
              {
                id,
                deletedOldCount: deletedCount,
                action: meta?.action || 'UPLOAD'
              }
            ]);
            setLocalSkippedItems(prev => {
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
