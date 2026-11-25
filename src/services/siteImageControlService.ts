import {
  productImageManagerService,
  normalizeProductAssetUrl
} from './productImageManagerService';
import {
  fixSingleCatalogImage,
  isSyntheticSpecCardOrPlaceholder,
  validateRealImageUrlLoads
} from './visualProductImageService';

export type UnifiedSiteImageTargetType =
  | 'PRODUCT'
  | 'CATEGORY'
  | 'RFQ'
  | 'HERO_SLIDE'
  | 'SITE_ASSET';

export interface SiteImageReplaceParams {
  targetId: string;
  targetType: UnifiedSiteImageTargetType;
  fieldPath?: string;
  title: string;
  category: string;
  oldImageUrl?: string;
  file?: File;
  imageUrl?: string;
}

export interface SiteImageReplaceResult {
  success: boolean;
  newUrl: string;
  deletedOldUrls: string[];
  replacedOldUrls?: string[];
  updatedAt: string;
  imageUpdatedAt: number;
  usedFallback?: boolean;
}

export interface SiteImageAutoFixItemInput {
  id: string;
  type: UnifiedSiteImageTargetType;
  title: string;
  category: string;
  specifications?: string;
  currentUrl?: string;
  fieldPath?: string;
}

export interface SiteImageAutoFixRowResult {
  id: string;
  type: UnifiedSiteImageTargetType;
  success: boolean;
  newUrl?: string;
  oldUrl?: string;
  deletedOldUrls?: string[];
  updatedAt?: string;
  imageUpdatedAt?: number;
  error?: string;
}

function setNestedField(obj: any, dotPath: string, value: string): any {
  const clone = JSON.parse(JSON.stringify(obj || {}));
  const parts = dotPath.split('.').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return clone;
  let cur = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return clone;
}

/**
 * Helper used only during legacy PHP fallback when site_images_replace is not yet deployed on a remote host.
 * Persists HERO_SLIDE / CATEGORY / SITE_ASSET URL updates into site-content so they stay live across reloads.
 */
async function syncSiteContentFallback(
  params: Pick<SiteImageReplaceParams, 'targetId' | 'targetType' | 'fieldPath'>,
  newUrl: string
): Promise<void> {
  if (
    params.targetType !== 'HERO_SLIDE' &&
    params.targetType !== 'SITE_ASSET' &&
    params.targetType !== 'CATEGORY'
  ) {
    return;
  }
  try {
    let currentSiteContent: any = null;
    for (const getUrl of [`/api/site-content?_t=${Date.now()}`, `/api.php?action=get_content&_t=${Date.now()}`]) {
      try {
        const r = await fetch(getUrl, { cache: 'no-store' });
        if (!r.ok) continue;
        const j = await r.json().catch(() => null);
        const candidate = j?.data || j?.siteContent || (j?.homepage ? j : null);
        if (candidate && typeof candidate === 'object') {
          currentSiteContent = candidate;
          break;
        }
      } catch {
        // try next
      }
    }
    if (!currentSiteContent) return;

    let updated = JSON.parse(JSON.stringify(currentSiteContent));
    let dirty = false;
    if (params.targetType === 'HERO_SLIDE' && Array.isArray(updated?.homepage?.heroSlides)) {
      updated.homepage.heroSlides = updated.homepage.heroSlides.map((s: any) => {
        if (String(s?.id || '') === params.targetId) {
          dirty = true;
          return { ...s, image: newUrl };
        }
        return s;
      });
    } else if (params.targetType === 'CATEGORY' && Array.isArray(updated?.homepage?.categoriesList)) {
      updated.homepage.categoriesList = updated.homepage.categoriesList.map((c: any) => {
        if (String(c?.id || '') === params.targetId) {
          dirty = true;
          return { ...c, image: newUrl };
        }
        return c;
      });
    } else if (params.fieldPath) {
      updated = setNestedField(updated, params.fieldPath, newUrl);
      dirty = true;
    }

    if (!dirty) return;
    updated.siteContentUpdatedAt = Date.now();
    const saveTargets = [
      { url: '/api/site-content', method: 'PUT' },
      { url: '/api.php?action=save_content', method: 'POST' }
    ];
    for (const t of saveTargets) {
      try {
        const sr = await fetch(t.url, {
          method: t.method,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(updated)
        });
        const sj = await sr.json().catch(() => null);
        if (sr.ok && (sj?.success || sj?.status === 'success')) {
          break;
        }
      } catch {
        // try next
      }
    }
  } catch {
    // non-fatal
  }
}

/**
 * Checks whether a JSON response came from an unmatched PHP gateway default fallback
 * (which returns HTTP 200 {"status":"success","service":"Trade4Deals MySQL PDO API Gateway"})
 * or an HTML SPA fallback page.
 */
function isUnmatchedGatewayResponse(res: Response, json: any): boolean {
  if (res.status === 404 || res.status === 405) return true;
  if (!json || typeof json !== 'object') return true;
  if (typeof json.service === 'string' && !('newUrl' in json) && !('results' in json) && !('deletedUrl' in json)) {
    return true;
  }
  return false;
}

/**
 * Replaces any site image across Node (serverApp.ts), updated PHP (public/api.php),
 * and legacy PHP gateways (via upload_product_image / fix_single_catalog_image fallback).
 */
export async function replaceSiteImage(
  params: SiteImageReplaceParams
): Promise<SiteImageReplaceResult> {
  let base64Data: string | undefined;
  let fileName: string | undefined;
  let mimeType: string | undefined;

  if (params.file) {
    const converted = await productImageManagerService.convertImageFile(
      params.file,
      'webp',
      0.92,
      1400,
      true
    );
    base64Data = converted.dataUrl;
    fileName = converted.fileName;
    mimeType = converted.mimeType;
  }

  if (params.imageUrl && params.imageUrl.trim()) {
    const candidateUrl = params.imageUrl.trim();
    if (isSyntheticSpecCardOrPlaceholder(candidateUrl)) {
      throw new Error('Synthetic spec-card or placeholder images are not allowed. Please choose a real product photo.');
    }
    const loadsOk = await validateRealImageUrlLoads(candidateUrl);
    if (!loadsOk) {
      throw new Error('Selected image URL failed to load (must return HTTP 200 and naturalWidth > 0).');
    }
  }

  const payload = {
    targetId: params.targetId,
    targetType: params.targetType,
    fieldPath: params.fieldPath,
    title: params.title,
    category: params.category,
    fileName,
    mimeType,
    base64Data,
    imageUrl: params.imageUrl,
    oldImageUrl: params.oldImageUrl
  };

  let lastExplicitError = '';

  // 1. Try primary Node endpoint, then direct PHP action endpoint
  for (const endpoint of ['/api/v1/admin/site-images/replace', '/api.php?action=site_images_replace']) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.newUrl) {
        const cleanNewUrl = normalizeProductAssetUrl(String(json.newUrl)).split('?')[0];
        const deletedOldUrls = Array.isArray(json.deletedOldUrls) ? json.deletedOldUrls : [];
        void productImageManagerService.logAndVerifyUploadPropagation({
          targetId: params.targetId,
          targetType: params.targetType,
          expectedUrl: cleanNewUrl,
          deletedOldUrls,
          source: `replaceSiteImage:${endpoint}`
        });
        return {
          success: true,
          newUrl: cleanNewUrl,
          deletedOldUrls,
          replacedOldUrls: Array.isArray(json.replacedOldUrls) ? json.replacedOldUrls : undefined,
          updatedAt: String(json.updatedAt || new Date().toISOString()),
          imageUpdatedAt: Number(json.imageUpdatedAt || Date.now())
        };
      }
      if (!isUnmatchedGatewayResponse(res, json) && json?.message) {
        lastExplicitError = String(json.message);
      }
    } catch (err: any) {
      if (err?.message) lastExplicitError = String(err.message);
    }
  }

  // 2. Universal fallback for older deployed PHP/cPanel gateways where site_images_replace is not yet present
  if (params.file) {
    const uploaded = await productImageManagerService.uploadAndAssignImageFile(params.file, {
      productId: params.targetId,
      productName: params.title,
      category: params.category,
      oldUrlToReplace: params.oldImageUrl,
      targetFormat: 'webp',
      quality: 0.92,
      autoWebpLossless: true
    });
    const cleanNewUrl = normalizeProductAssetUrl(uploaded.url).split('?')[0];
    await syncSiteContentFallback(params, cleanNewUrl);
    const fallbackDeleted = (uploaded as any)?.deletedOldUrls;
    return {
      success: true,
      newUrl: cleanNewUrl,
      deletedOldUrls: Array.isArray(fallbackDeleted) ? fallbackDeleted : [],
      replacedOldUrls: params.oldImageUrl ? [params.oldImageUrl] : undefined,
      updatedAt: new Date().toISOString(),
      imageUpdatedAt: Date.now(),
      usedFallback: true
    };
  }

  if (params.imageUrl && params.imageUrl.trim()) {
    const rawUrl = params.imageUrl.trim();
    const recordTypeArg: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE' =
      params.targetType === 'CATEGORY'
        ? 'CATEGORY'
        : params.targetType === 'RFQ'
          ? 'RFQ'
          : params.targetType === 'PRODUCT'
            ? 'PRODUCT'
            : 'OVERRIDE';

    try {
      const fixed = await fixSingleCatalogImage({
        recordId: params.targetId,
        recordType: recordTypeArg,
        title: params.title,
        category: params.category,
        customImageUrl: rawUrl,
        previousImageUrl: params.oldImageUrl
      });
      if (fixed?.new_image_url) {
        const cleanNewUrl = normalizeProductAssetUrl(fixed.new_image_url).split('?')[0];
        await syncSiteContentFallback(params, cleanNewUrl);
        return {
          success: true,
          newUrl: cleanNewUrl,
          deletedOldUrls: Array.isArray((fixed as any).deletedOldUrls) ? (fixed as any).deletedOldUrls : [],
          replacedOldUrls: params.oldImageUrl ? [params.oldImageUrl] : undefined,
          updatedAt: fixed.updatedAt || new Date().toISOString(),
          imageUpdatedAt: fixed.imageUpdatedAt || Date.now(),
          usedFallback: true
        };
      }
    } catch {
      // Fall through to direct override assignment
    }

    await productImageManagerService.setProductImage(params.targetId, rawUrl, [rawUrl]);
    const cleanNewUrl = normalizeProductAssetUrl(rawUrl).split('?')[0];
    await syncSiteContentFallback(params, cleanNewUrl);
    return {
      success: true,
      newUrl: cleanNewUrl,
      deletedOldUrls: [],
      replacedOldUrls: params.oldImageUrl ? [params.oldImageUrl] : undefined,
      updatedAt: new Date().toISOString(),
      imageUpdatedAt: Date.now(),
      usedFallback: true
    };
  }

  throw new Error(lastExplicitError || 'Unable to upload or replace image on server. Please try again.');
}

/**
 * Auto-fixes one or many site images with automatic fallback to fixSingleCatalogImage
 * when running against a host that does not yet expose /api/v1/admin/site-images/auto-fix.
 */
export async function autoFixSiteImages(
  items: SiteImageAutoFixItemInput[]
): Promise<{ results: SiteImageAutoFixRowResult[] }> {
  if (items.length === 0) return { results: [] };

  const serverResultsById = new Map<string, SiteImageAutoFixRowResult>();
  try {
    const res = await fetch('/api/v1/admin/site-images/auto-fix', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items })
    });
    const json = await res.json().catch(() => null);
    if (res.ok && Array.isArray(json?.results) && json.results.length > 0) {
      for (const r of json.results) {
        if (
          r?.success &&
          r?.id &&
          r?.newUrl &&
          !isSyntheticSpecCardOrPlaceholder(r) &&
          !isSyntheticSpecCardOrPlaceholder(r.newUrl)
        ) {
          const loadsOk = await validateRealImageUrlLoads(String(r.newUrl));
          if (loadsOk) {
            serverResultsById.set(String(r.id), r);
            void productImageManagerService.logAndVerifyUploadPropagation({
              targetId: r.id,
              targetType: r.type,
              expectedUrl: r.newUrl,
              deletedOldUrls: r.deletedOldUrls,
              source: 'autoFixSiteImages'
            });
          }
        }
      }
      if (serverResultsById.size === items.length) {
        return {
          results: items.map(it => serverResultsById.get(it.id)!).filter(Boolean)
        };
      }
    }
  } catch {
    // Fall through to per-item sequential heading search & upload fallback below
  }

  // Fallback for any item that did not receive a real, loadable photo from batch auto-fix
  const results: SiteImageAutoFixRowResult[] = [];
  for (const item of items) {
    const verifiedServerRow = serverResultsById.get(item.id);
    if (verifiedServerRow) {
      results.push(verifiedServerRow);
      continue;
    }
    try {
      const recordTypeArg: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE' =
        item.type === 'CATEGORY'
          ? 'CATEGORY'
          : item.type === 'RFQ'
            ? 'RFQ'
            : item.type === 'PRODUCT'
              ? 'PRODUCT'
              : 'OVERRIDE';

      const fixed = await fixSingleCatalogImage({
        recordId: item.id,
        recordType: recordTypeArg,
        title: item.title,
        category: item.category,
        specifications: item.specifications,
        previousImageUrl: item.currentUrl
      });

      if (fixed?.new_image_url) {
        const cleanNewUrl = normalizeProductAssetUrl(fixed.new_image_url).split('?')[0];
        await syncSiteContentFallback(
          { targetId: item.id, targetType: item.type, fieldPath: item.fieldPath },
          cleanNewUrl
        );
        results.push({
          id: item.id,
          type: item.type,
          success: true,
          newUrl: cleanNewUrl,
          oldUrl: fixed.old_image_url || item.currentUrl,
          deletedOldUrls: Array.isArray((fixed as any).deletedOldUrls) ? (fixed as any).deletedOldUrls : [],
          updatedAt: fixed.updatedAt || new Date().toISOString(),
          imageUpdatedAt: fixed.imageUpdatedAt || Date.now()
        });
      } else {
        results.push({
          id: item.id,
          type: item.type,
          success: false,
          error: 'Could not find a unique replacement photo.'
        });
      }
    } catch (err: any) {
      results.push({
        id: item.id,
        type: item.type,
        success: false,
        error: err?.message || 'Auto-fix failed for this item.'
      });
    }
  }

  return { results };
}

/**
 * Permanently deletes an uploaded server file & clears its references with Node + PHP fallback.
 */
export async function deleteSiteImageFile(params: {
  url?: string;
  targetId: string;
  targetType: UnifiedSiteImageTargetType;
  fieldPath?: string;
}): Promise<{ deletedFile: boolean }> {
  let deletedFile = false;
  const cleanUrl = params.url ? normalizeProductAssetUrl(params.url).split('?')[0] : '';

  if (cleanUrl && cleanUrl.startsWith('/assets/uploads/')) {
    const body = JSON.stringify({
      url: cleanUrl,
      force: true,
      targetId: params.targetId,
      targetType: params.targetType,
      fieldPath: params.fieldPath
    });
    for (const endpoint of ['/api/v1/admin/site-images/delete-file', '/api.php?action=site_images_delete_file']) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          deletedFile = true;
          break;
        }
      } catch {
        // try next
      }
    }
  }

  await productImageManagerService.resetProductImage(params.targetId);
  await syncSiteContentFallback(
    { targetId: params.targetId, targetType: params.targetType, fieldPath: params.fieldPath },
    ''
  );
  return { deletedFile };
}

export interface SiteListingDeleteInput {
  id: string;
  type: UnifiedSiteImageTargetType;
  currentUrl?: string;
  fieldPath?: string;
}

export interface SiteListingDeleteResult {
  success: boolean;
  deletedCount: number;
  deletedFiles: string[];
  deletedProductIds: string[];
  deletedRfqIds: string[];
  message?: string;
}

/**
 * Permanently deletes one or many listed items (Product, Buy Lead / RFQ, Hero Slide, Category, or Site Asset)
 * from the website catalog, database stores, snapshot, AND permanently removes their uploaded image file(s) from server storage.
 */
export async function deleteSiteListingsPermanently(
  items: SiteListingDeleteInput[]
): Promise<SiteListingDeleteResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      deletedCount: 0,
      deletedFiles: [],
      deletedProductIds: [],
      deletedRfqIds: [],
      message: 'No items selected to delete.'
    };
  }

  const res = await fetch('/api/v1/admin/site-items/delete-listing', {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items })
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Failed to permanently delete listing(s) (HTTP ${res.status}).`);
  }

  // Clear local override entries for every deleted item immediately
  for (const it of items) {
    if (it?.id) {
      await productImageManagerService.resetProductImage(it.id).catch(() => {});
    }
  }

  return {
    success: true,
    deletedCount: Number(json.deletedCount || items.length),
    deletedFiles: Array.isArray(json.deletedFiles) ? json.deletedFiles : [],
    deletedProductIds: Array.isArray(json.deletedProductIds) ? json.deletedProductIds : [],
    deletedRfqIds: Array.isArray(json.deletedRfqIds) ? json.deletedRfqIds : [],
    message: json.message
  };
}

