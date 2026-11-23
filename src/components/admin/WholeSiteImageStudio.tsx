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
  ExternalLink
} from 'lucide-react';
import { Product, RfqRequirement } from '../../types';
import { useSiteContent } from '../../context/SiteContentContext';
import { CATEGORIES_TREE, MOCK_PRODUCTS, MOCK_RFQS } from '../../data/mockData';
import { api } from '../../services/apiService';
import {
  productImageManagerService,
  normalizeProductAssetUrl,
  optimizeImageUrl
} from '../../services/productImageManagerService';
import { isGenericOrPlaceholderImageUrl } from '../../services/visualProductImageService';

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

type ScopeFilter = 'ALL' | 'NEEDS_FIX' | 'PRODUCT' | 'CATEGORY' | 'RFQ' | 'BANNERS';

interface WholeSiteImageStudioProps {
  onViewLiveItem?: (item: { recordId: string; recordType: string }) => void;
}

const ITEMS_PER_PAGE = 25;

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
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [totalDeletedFilesSession, setTotalDeletedFilesSession] = useState<number>(0);

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
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);

  // Single-row hidden file picker
  const rowFileInputRef = useRef<HTMLInputElement | null>(null);
  const rowUploadTargetRef = useRef<UnifiedSiteImageItem | null>(null);
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

      const [prodRes, rfqRes] = await Promise.allSettled([
        api.getProducts(),
        api.getRfqs()
      ]);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
        const mergedMap = new Map<string, Product>();
        for (const p of prodRes.value) {
          if (p?.id) mergedMap.set(String(p.id).trim(), p);
        }
        for (const p of MOCK_PRODUCTS) {
          if (p?.id && !mergedMap.has(String(p.id).trim())) {
            mergedMap.set(String(p.id).trim(), p);
          }
        }
        setProducts(Array.from(mergedMap.values()));
      }

      if (rfqRes.status === 'fulfilled' && Array.isArray(rfqRes.value) && rfqRes.value.length > 0) {
        const mergedRfqs = new Map<string, RfqRequirement>();
        for (const r of rfqRes.value) {
          if (r?.id) mergedRfqs.set(String(r.id).trim(), r);
        }
        for (const r of MOCK_RFQS) {
          if (r?.id && !mergedRfqs.has(String(r.id).trim())) {
            mergedRfqs.set(String(r.id).trim(), r);
          }
        }
        setRfqs(Array.from(mergedRfqs.values()));
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

  // Build unified inventory across the ENTIRE website
  const allItems = useMemo<UnifiedSiteImageItem[]>(() => {
    const overrides = productImageManagerService.getState().overrides || {};
    const rawList: Array<Omit<UnifiedSiteImageItem, 'status' | 'statusDetail'>> = [];
    const seenIds = new Set<string>();

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
      pushRaw({
        id,
        type: 'HERO_SLIDE',
        title: slide?.title || `Hero Slide #${idx + 1}`,
        category: 'Homepage Hero Carousel',
        baseUrl: base,
        currentUrl: current,
        updatedAt: ov?.updatedAt
      });
    });

    const coreSiteAssetSlots: Array<{ id: string; title: string; category: string; fieldPath: string }> = [
      { id: 'site-hero-bg', title: 'Homepage Main Hero Background', category: 'Homepage Banner', fieldPath: 'homepage.heroBgImage' },
      { id: 'site-onboarding-banner', title: 'Homepage Partner Onboarding Banner', category: 'Homepage Banner', fieldPath: 'homepage.onboardingBannerImage' },
      { id: 'site-brand-logo', title: 'Header & Footer Brand Logo', category: 'Global Brand', fieldPath: 'brand.logoUrl' },
      { id: 'site-products-banner', title: 'Products Directory Header Banner', category: 'Directory Banner', fieldPath: 'productsDirectory.bannerImage' },
      { id: 'site-buyleads-banner', title: 'Buy Leads & RFQs Header Banner', category: 'Directory Banner', fieldPath: 'buyLeads.bannerImage' },
      { id: 'site-suppliers-banner', title: 'Verified Suppliers Header Banner', category: 'Directory Banner', fieldPath: 'suppliersDirectory.bannerImage' },
      { id: 'site-post-rfq-banner', title: 'Post Buying Request Banner', category: 'Page Banner', fieldPath: 'postBuyingRequest.bannerImage' },
      { id: 'site-post-offer-banner', title: 'Post Sell Offer Banner', category: 'Page Banner', fieldPath: 'postSellOffer.bannerImage' },
      { id: 'site-membership-banner', title: 'Premium Membership Banner', category: 'Page Banner', fieldPath: 'membership.bannerImage' },
      { id: 'site-escrow-banner', title: 'Escrow & Trade Assurance Banner', category: 'Page Banner', fieldPath: 'escrow.bannerImage' }
    ];

    for (const slot of coreSiteAssetSlots) {
      const fieldUrl = getNestedString(siteContent, slot.fieldPath);
      const ov = overrides[slot.id];
      const current = cleanBaseUrl(fieldUrl || ov?.primary);
      pushRaw({
        id: slot.id,
        type: 'SITE_ASSET',
        title: slot.title,
        category: slot.category,
        fieldPath: slot.fieldPath,
        baseUrl: cleanBaseUrl(fieldUrl),
        currentUrl: current,
        updatedAt: ov?.updatedAt
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
      pushRaw({
        id,
        type: 'CATEGORY',
        title: cat.name || id,
        category: 'Procurement Sector',
        baseUrl: cleanBaseUrl(cat.image),
        currentUrl: current,
        updatedAt: ov?.updatedAt
      });
    }

    // 3. All Products
    for (const prod of products) {
      const id = String(prod?.id || '').trim();
      if (!id) continue;
      const ov = overrides[id];
      const base = cleanBaseUrl(prod.images?.[0] || (prod as any).image);
      const current = cleanBaseUrl(ov?.primary || base);
      pushRaw({
        id,
        type: 'PRODUCT',
        title: prod.title || id,
        category: prod.category || 'General Trade',
        baseUrl: base,
        currentUrl: current,
        updatedAt: ov?.updatedAt
      });
    }

    // 4. All Buy Leads / RFQs
    for (const rfq of rfqs) {
      const id = String(rfq?.id || '').trim();
      if (!id) continue;
      const ov = overrides[id];
      const base = cleanBaseUrl((rfq as any).image || (rfq as any).images?.[0]);
      const current = cleanBaseUrl(ov?.primary || base);
      pushRaw({
        id,
        type: 'RFQ',
        title: rfq.productName || (rfq as any).title || id,
        category: rfq.category || 'Buy Lead',
        baseUrl: base,
        currentUrl: current,
        updatedAt: ov?.updatedAt
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

      if (!u || isGenericOrPlaceholderImageUrl(u) || /^https?:\/\//i.test(u)) {
        return {
          ...item,
          status: 'NEEDS_FIX' as const,
          statusDetail: !u
            ? 'Missing image'
            : isGenericOrPlaceholderImageUrl(u)
              ? 'Placeholder / stock image'
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
        statusDetail: isManualOrLocked ? 'Saved & locked on server' : 'Verified local image'
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, rfqs, siteContent, stateVersion]);

  const stats = useMemo(() => {
    let verified = 0;
    let duplicates = 0;
    let needsFix = 0;
    let productsCount = 0;
    let categoriesCount = 0;
    let rfqsCount = 0;
    let bannersCount = 0;

    for (const it of allItems) {
      if (it.status === 'VERIFIED') verified++;
      else if (it.status === 'DUPLICATE') duplicates++;
      else needsFix++;

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
      flaggedTotal: duplicates + needsFix,
      productsCount,
      categoriesCount,
      rfqsCount,
      bannersCount
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter(it => {
      if (scopeFilter === 'NEEDS_FIX' && it.status === 'VERIFIED') return false;
      if (scopeFilter === 'PRODUCT' && it.type !== 'PRODUCT') return false;
      if (scopeFilter === 'CATEGORY' && it.type !== 'CATEGORY') return false;
      if (scopeFilter === 'RFQ' && it.type !== 'RFQ') return false;
      if (scopeFilter === 'BANNERS' && it.type !== 'HERO_SLIDE' && it.type !== 'SITE_ASSET') return false;

      if (!q) return true;
      return (
        it.id.toLowerCase().includes(q) ||
        it.title.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.currentUrl.toLowerCase().includes(q)
      );
    });
  }, [allItems, scopeFilter, searchQuery]);

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
      }>
    ) => {
      if (entries.length === 0) return;
      let deletedCount = 0;
      let needsSiteContentRefresh = false;
      const snapshotPayload = entries.map(e => {
        if (Array.isArray(e.deletedOldUrls)) deletedCount += e.deletedOldUrls.length;
        if (e.type === 'CATEGORY' || e.type === 'HERO_SLIDE' || e.type === 'SITE_ASSET') {
          needsSiteContentRefresh = true;
        }
        return {
          id: e.id,
          url: e.newUrl,
          updatedAt: e.updatedAt || new Date().toISOString(),
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          replacedOldUrls: e.replacedOldUrls,
          deletedOldUrls: e.deletedOldUrls
        };
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
        let base64Data: string | undefined;
        let fileName: string | undefined;
        let mimeType: string | undefined;

        if (source.file) {
          const converted = await productImageManagerService.convertImageFile(
            source.file,
            'webp',
            0.92,
            1400,
            true
          );
          base64Data = converted.dataUrl;
          fileName = converted.fileName;
          mimeType = converted.mimeType;
        }

        const res = await fetch('/api/v1/admin/site-images/replace', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            targetId: item.id,
            targetType: item.type,
            fieldPath: item.fieldPath,
            title: item.title,
            category: item.category,
            fileName,
            mimeType,
            base64Data,
            imageUrl: source.imageUrl,
            oldImageUrl: item.currentUrl || item.baseUrl
          })
        });

        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success || !json?.newUrl) {
          throw new Error(json?.message || `Server returned HTTP ${res.status}`);
        }

        const deletedOldUrls: string[] = Array.isArray(json.deletedOldUrls) ? json.deletedOldUrls : [];
        await applyLocalSync([
          {
            id: item.id,
            type: item.type,
            newUrl: json.newUrl,
            deletedOldUrls,
            replacedOldUrls: Array.isArray(json.replacedOldUrls) ? json.replacedOldUrls : undefined,
            updatedAt: json.updatedAt
          }
        ]);

        return {
          success: true,
          newUrl: json.newUrl,
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
        text: `Replaced image for "${target.title}" (${out.newUrl})${
          out.deletedCount > 0
            ? ` — ${out.deletedCount} old image file permanently deleted from server.`
            : ' — saved to server & live for all visitors.'
        }`
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
        text: `Updated "${item.title}" to ${out.newUrl}${
          out.deletedCount > 0 ? ` and permanently deleted ${out.deletedCount} old file(s) from server.` : '.'
        }`
      });
    } else {
      setBannerNotice({
        type: 'error',
        text: `Could not apply URL for "${item.title}": ${out.message}`
      });
    }
  };

  // Single-row Auto-Fix
  const handleAutoFixSingle = async (item: UnifiedSiteImageItem) => {
    setBusyRowIds(prev => ({ ...prev, [item.id]: 'Auto-fixing...' }));
    setBannerNotice(null);
    try {
      const res = await fetch('/api/v1/admin/site-images/auto-fix', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: item.id,
              type: item.type,
              title: item.title,
              category: item.category,
              currentUrl: item.currentUrl,
              fieldPath: item.fieldPath
            }
          ]
        })
      });
      const json = await res.json().catch(() => null);
      const rowRes = Array.isArray(json?.results) ? json.results[0] : null;
      if (!res.ok || !rowRes?.success || !rowRes?.newUrl) {
        throw new Error(rowRes?.error || json?.message || 'Auto-fix could not find a unique replacement photo.');
      }

      const deletedOld: string[] = Array.isArray(rowRes.deletedOldUrls) ? rowRes.deletedOldUrls : [];
      await applyLocalSync([
        {
          id: item.id,
          type: item.type,
          newUrl: rowRes.newUrl,
          deletedOldUrls: deletedOld,
          replacedOldUrls: item.currentUrl ? [item.currentUrl] : undefined,
          updatedAt: rowRes.updatedAt
        }
      ]);

      setBannerNotice({
        type: 'success',
        text: `Auto-fixed "${item.title}" with unique local image (${rowRes.newUrl})${
          deletedOld.length > 0 ? ` and permanently deleted ${deletedOld.length} old file(s) from server.` : '.'
        }`
      });
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        text: `Auto-Fix failed for "${item.title}": ${err?.message || 'Try uploading a custom image.'}`
      });
    } finally {
      setBusyRowIds(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

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

    const CHUNK_SIZE = 5;
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
        const res = await fetch('/api/v1/admin/site-images/auto-fix', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            items: chunk.map(c => ({
              id: c.id,
              type: c.type,
              title: c.title,
              category: c.category,
              currentUrl: c.currentUrl,
              fieldPath: c.fieldPath
            }))
          })
        });
        const json = await res.json().catch(() => null);
        const resList: any[] = Array.isArray(json?.results) ? json.results : [];
        const toSync: Array<{
          id: string;
          type: SiteImageTargetType;
          newUrl: string;
          deletedOldUrls?: string[];
          replacedOldUrls?: string[];
          updatedAt?: string;
        }> = [];

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
              updatedAt: match.updatedAt
            });
          } else {
            failed++;
          }
        }

        if (toSync.length > 0) {
          await applyLocalSync(toSync);
        }
      } catch {
        completed += chunk.length;
        failed += chunk.length;
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
    setBannerNotice({
      type: fixed > 0 ? 'success' : 'error',
      text: abortBatchRef.current
        ? `Batch Auto-Fix stopped: fixed ${fixed} of ${targets.length} items (${deletedOld} old server files permanently deleted).`
        : `Batch Auto-Fix finished: ${fixed} fixed, ${failed} skipped/failed, ${deletedOld} old server files permanently deleted.`
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
      text: `Bulk upload completed: ${succeeded} of ${readyItems.length} images replaced (${deletedTotal} old files permanently deleted from server).`
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

      {/* Clean Single-Row Metric Strip (No nested cards, tabular numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/70">
        <div className="px-5 py-3">
          <div className="text-xs text-slate-500">Total Site Images</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {stats.total.toLocaleString()}
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="text-xs text-slate-500">Verified on Server</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {stats.verified.toLocaleString()}
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="text-xs text-slate-500">Duplicates</div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${stats.duplicates > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {stats.duplicates.toLocaleString()}
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="text-xs text-slate-500">Missing / Stock</div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${stats.needsFix > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stats.needsFix.toLocaleString()}
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="text-xs text-slate-500">Old Files Deleted</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {totalDeletedFilesSession.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Status Notice Banner */}
      {bannerNotice && (
        <div
          className={`px-6 py-3 border-b text-xs font-medium flex items-center justify-between gap-3 ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : bannerNotice.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            )}
            <span className="break-words">{bannerNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="p-1 rounded hover:bg-black/5 cursor-pointer shrink-0"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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
                <div className="flex items-center gap-2">
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
                {bulkQueue.map(qItem => (
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
                      {allItems.slice(0, 600).map(opt => (
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
                ))}
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
              { id: 'NEEDS_FIX', label: `Needs Fix (${stats.flaggedTotal})` },
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
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, category, file..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
            />
          </div>

          {selectedIdList.length > 0 && (
            <>
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
              <th className="py-2.5 px-3 w-44">Status</th>
              <th className="py-2.5 pl-3 pr-6 text-right w-72">Actions</th>
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
                  <td className="py-3 px-3"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                  <td className="py-3 pl-3 pr-6"><div className="h-7 w-44 bg-slate-200 rounded ml-auto" /></td>
                </tr>
              ))
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-6 text-center text-sm text-slate-500">
                  {scopeFilter === 'NEEDS_FIX'
                    ? 'Every scanned image across the entire site is verified on server storage.'
                    : 'No matching site items found for your search filter.'}
                </td>
              </tr>
            ) : (
              pageItems.map(item => {
                const isSelected = Boolean(selectedIds[item.id]);
                const rowBusyLabel = busyRowIds[item.id];
                const isEditingUrl = urlEditor?.itemId === item.id;
                const thumbSrc = item.currentUrl
                  ? item.currentUrl.startsWith('/assets/uploads/')
                    ? `${optimizeImageUrl(item.currentUrl, { width: 160, isThumbnail: true })}&_v=${stateVersion}`
                    : item.currentUrl
                  : '';

                return (
                  <React.Fragment key={item.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
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
                        <div className="w-16 h-12 rounded-md border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">No Image</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-middle min-w-0 max-w-md">
                        <div className="font-semibold text-slate-900 truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{item.type.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-600">{item.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[180px]">{item.category}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 truncate mt-0.5" title={item.currentUrl}>
                          {item.currentUrl || '(no server file assigned)'}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <div
                          className={`font-semibold ${
                            item.status === 'VERIFIED'
                              ? 'text-emerald-700'
                              : item.status === 'DUPLICATE'
                                ? 'text-amber-700'
                                : 'text-red-700'
                          }`}
                        >
                          {item.status === 'VERIFIED'
                            ? 'Verified'
                            : item.status === 'DUPLICATE'
                              ? 'Duplicate'
                              : 'Needs Image'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.statusDetail}</div>
                      </td>

                      <td className="py-3 pl-3 pr-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                            onClick={() => {
                              rowUploadTargetRef.current = item;
                              rowFileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{rowBusyLabel === 'Uploading...' ? 'Uploading...' : 'Upload'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel) || Boolean(batchProgress?.active)}
                            onClick={() => void handleAutoFixSingle(item)}
                            className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                          >
                            <Wand2 className={`w-3.5 h-3.5 ${rowBusyLabel === 'Auto-fixing...' ? 'animate-spin' : ''}`} />
                            <span>{rowBusyLabel === 'Auto-fixing...' ? 'Fixing...' : 'Auto-Fix'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(rowBusyLabel)}
                            onClick={() =>
                              setUrlEditor(
                                isEditingUrl ? null : { itemId: item.id, value: item.currentUrl || '' }
                              )
                            }
                            className="px-2 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Replace with image URL"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>URL</span>
                          </button>

                          {onViewLiveItem && (item.type === 'PRODUCT' || item.type === 'CATEGORY' || item.type === 'RFQ') && (
                            <button
                              type="button"
                              onClick={() => onViewLiveItem({ recordId: item.id, recordType: item.type })}
                              className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-300 cursor-pointer shrink-0"
                              title="View on live storefront"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isEditingUrl && (
                      <tr className="bg-slate-50">
                        <td colSpan={5} className="px-6 py-3">
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
    </div>
  );
};
