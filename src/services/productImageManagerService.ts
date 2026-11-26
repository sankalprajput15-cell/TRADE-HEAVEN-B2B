import { Product } from '../types';
import { autoSeoEngine } from './autoSeoEngine';
import { imageCdnService } from './imageCdnService';
import {
  isMismatchedProductImageUrl,
  isGenericOrPlaceholderImageUrl,
  registerAttachedCatalogUrlsProvider
} from './visualProductImageService';
const regeneratedSupplierCoalImg = '/src/assets/images/regenerated_image_1794231796775.jpg';


export const PRODUCT_IMAGE_SAVED_EVENT = 'tradeheaven_product_image_saved';
export const PRODUCT_IMAGE_STORAGE_SAVED_EVENT = 'tradeheaven:image-saved-to-storage';

function dispatchNotification(type: 'UPLOAD' | 'EDIT' | 'DELETE', title: string, message: string, linkView = 'admin') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tradeheaven_notify', {
        detail: {
          type,
          title,
          message,
          linkView
        }
      })
    );
  }
}

export interface ProductImageSavedEventDetail {
  timestamp: number;
  state: ProductImageSystemState;
  overrides: Record<string, ProductImageOverrideEntry>;
  mediaLibrary: MediaLibraryItem[];
  productId?: string;
  url?: string;
  gallery?: string[];
  action?: string;
  details?: any;
}

export interface ProductImageOverrideEntry {
  primary: string;
  previousPrimary?: string;
  gallery: string[];
  format?: string;
  updatedAt: string;
  imageUpdatedAt?: number;
  updatedBy?: string;
  locked?: boolean;
  serverVerified?: boolean;
  verifiedAt?: string;
  replacedOldUrls?: string[];
}

export interface MediaLibraryItem {
  id: string;
  url: string;
  name: string;
  format: string;
  sizeBytes?: number;
  originalSizeBytes?: number;
  losslessCompression?: boolean;
  uploadedAt: string;
}

export interface ProductImageSystemState {
  overrides: Record<string, ProductImageOverrideEntry>;
  productActivityTimestamps?: Record<string, number>;
  globalDefaultImage: string | null;
  categoryOverrides: Record<string, string>;
  urlReplacements: Record<string, string>;
  mediaLibrary: MediaLibraryItem[];
  deletedUrls?: string[];
}

export type OutputImageFormat = 'jpg' | 'png' | 'webp' | 'original';

export interface ImageEditFilters {
  grayscale: number;  // 0 to 100 (%)
  sepia: number;      // 0 to 100 (%)
  brightness: number; // 50 to 150 (%), default 100
  contrast: number;   // 50 to 150 (%), default 100
}

export const DEFAULT_IMAGE_EDIT_FILTERS: ImageEditFilters = {
  grayscale: 0,
  sepia: 0,
  brightness: 100,
  contrast: 100
};

export function hasActiveImageFilters(filters?: Partial<ImageEditFilters>): boolean {
  if (!filters) return false;
  const g = filters.grayscale ?? 0;
  const s = filters.sepia ?? 0;
  const b = filters.brightness ?? 100;
  const c = filters.contrast ?? 100;
  return g > 0 || s > 0 || b !== 100 || c !== 100;
}

export function buildCssFilterString(filters?: Partial<ImageEditFilters>): string {
  if (!hasActiveImageFilters(filters)) return 'none';
  const g = Math.max(0, Math.min(100, filters?.grayscale ?? 0));
  const s = Math.max(0, Math.min(100, filters?.sepia ?? 0));
  const b = Math.max(40, Math.min(200, filters?.brightness ?? 100));
  const c = Math.max(40, Math.min(200, filters?.contrast ?? 100));
  return `brightness(${b}%) contrast(${c}%) grayscale(${g}%) sepia(${s}%)`;
}

const STORAGE_KEY = 'trade_heaven_product_image_system_v7';
const LEGACY_OVERRIDES_KEY = 'trade_heaven_image_overrides_v7';
const PRODUCTS_CACHE_KEY = 'trade_heaven_v1_products_v7';
const IDB_NAME = 'trade_heaven_product_images_idb';
const IDB_STORE = 'image_system_state';
const IDB_KEY = 'active_state_v8';

let activeProductImageManagerInstance: ProductImageManagerService | null = null;

export function normalizeProductAssetUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim().replace(/^\/assets\/aistudio\//, '/assets/uploads/');
  let existingQuery = '';
  const qIdx = clean.indexOf('?');
  if (qIdx !== -1) {
    existingQuery = clean.slice(qIdx + 1);
    clean = clean.slice(0, qIdx);
  }

  // Repair malformed double-query Unsplash strings like "...?w=800&auto=format&fit=crop&q=80-hash?w=100..."
  if (clean.includes('images.unsplash.com/photo-')) {
    const basePhoto = clean.split('?')[0];
    const lastQueryIdx = clean.lastIndexOf('?');
    if (lastQueryIdx > clean.indexOf('?')) {
      clean = `${basePhoto}?${clean.slice(lastQueryIdx + 1)}`;
    }
  }

  if (
    clean.startsWith('/assets/uploads/') ||
    clean.startsWith('/assets/client-uploads/') ||
    clean.startsWith('/assets/tradeheaven/') ||
    clean.startsWith('/src/assets/images/')
  ) {
    if (!existingQuery) {
      const versionTag =
        activeProductImageManagerInstance &&
        typeof activeProductImageManagerInstance.getVersionTagForUrl === 'function'
          ? activeProductImageManagerInstance.getVersionTagForUrl(clean)
          : 'v7';
      return `${clean}?v=${versionTag || 'v7'}`;
    }
    if (!existingQuery.includes('v=') && !existingQuery.includes('cb=')) {
      const versionTag =
        activeProductImageManagerInstance &&
        typeof activeProductImageManagerInstance.getVersionTagForUrl === 'function'
          ? activeProductImageManagerInstance.getVersionTagForUrl(clean)
          : 'v7';
      return `${clean}?${existingQuery}&v=${versionTag || 'v7'}`;
    }
    return `${clean}?${existingQuery}`;
  }

  if (existingQuery) {
    return `${clean}?${existingQuery}`;
  }
  return clean;
}

export function optimizeImageUrl(
  rawUrl: string | undefined | null,
  options: { width?: number; quality?: number; isThumbnail?: boolean } = {}
): string {
  const normalized = normalizeProductAssetUrl(rawUrl);
  if (!normalized || normalized.startsWith('data:') || normalized.startsWith('blob:')) return normalized;

  // Route through Image CDN service if enabled
  const cdnOptimized = imageCdnService.optimize(normalized, options);
  if (cdnOptimized && cdnOptimized !== normalized) {
    return cdnOptimized;
  }

  let base = normalized.split('?')[0];
  const queryParams = new URLSearchParams(normalized.split('?')[1] || '');

  const targetWidth = options.width || (options.isThumbnail ? 320 : 480);

  if (base.includes('images.unsplash.com')) {
    queryParams.set('auto', 'format');
    queryParams.set('fit', 'crop');
    queryParams.set('w', String(targetWidth));
    queryParams.set('q', String(options.quality || (targetWidth <= 360 ? 70 : 75)));
    return `${base}?${queryParams.toString()}`;
  }

  return normalized;
}

export function buildResponsiveImageSrcSet(
  rawUrl: string | undefined | null,
  targetWidth: number,
  isThumbnail = false
): string | undefined {
  const normalized = normalizeProductAssetUrl(rawUrl);
  if (!normalized || normalized.startsWith('data:') || normalized.startsWith('blob:')) return undefined;
  const base = normalized.split('?')[0];

  // Static local files in /assets/uploads/ are already pre-compressed WebP/JPEG on disk;
  // only generate multi-width srcSet for dynamic resize hosts like Unsplash.
  if (!base.includes('images.unsplash.com')) return undefined;

  const widths = isThumbnail
    ? [160, 320, 480]
    : targetWidth >= 900
      ? [480, 800, 1280]
      : [240, 320, 480, 640];

  const uniqueWidths = Array.from(new Set(widths.filter((w) => w <= Math.max(targetWidth * 1.5, 480))));
  if (uniqueWidths.length < 2) return undefined;

  return uniqueWidths
    .map((w) => `${optimizeImageUrl(normalized, { width: w, isThumbnail })} ${w}w`)
    .join(', ');
}

const RAW_BUILTIN_BASE: Record<string, ProductImageOverrideEntry> = {
  'prod-blackstone-black-jade-cabochon': {
    primary: '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg',
    gallery: [
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg',
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg'
    ],
    format: 'JPG',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'prod-blackstone-turquoise-rough-matrix': {
    primary: '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg',
    gallery: [
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg',
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg'
    ],
    format: 'JPG',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'prod-atlantic-power-1': {
    primary: '/assets/uploads/image002_50ab7837.png',
    gallery: [
      '/assets/uploads/image002_50ab7837.png',
      '/assets/uploads/image003_6c1f0619.jpg',
      '/assets/uploads/image004_fa37a57a.png',
      '/assets/uploads/image005_20fe3db0.png'
    ],
    format: 'PNG',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'prod-atlantic-power-2': {
    primary: '/assets/uploads/image005_20fe3db0.png',
    gallery: [
      '/assets/uploads/image005_20fe3db0.png',
      '/assets/uploads/image002_50ab7837.png',
      '/assets/uploads/image003_6c1f0619.jpg',
      '/assets/uploads/image004_fa37a57a.png'
    ],
    format: 'PNG',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  'prod-reverse-energy-sa-coal': {
    primary: regeneratedSupplierCoalImg,
    gallery: [regeneratedSupplierCoalImg],
    format: 'JPG',
    updatedAt: '2026-11-09T00:00:00.000Z'
  }
};

const DEFAULT_BUILTIN_OVERRIDES: Record<string, ProductImageOverrideEntry> = {
  ...RAW_BUILTIN_BASE
};

const DEFAULT_BUILTIN_MEDIA: MediaLibraryItem[] = [
  {
    id: 'builtin-construction-red-clay-bricks',
    url: '/assets/uploads/auto-bricks-bcc0b0120401.webp',
    name: 'Red Clay Construction Bricks - High Compressive Strength Masonry.webp',
    format: 'WEBP',
    uploadedAt: '2026-11-15T05:00:00Z'
  },
  {
    id: 'builtin-commercial-building-bricks',
    url: '/assets/uploads/auto-bricks-93945c6b34e1.webp',
    name: 'Commercial Facing & Construction Bricks.webp',
    format: 'WEBP',
    uploadedAt: '2026-11-15T05:01:00Z'
  },
  {
    id: 'builtin-rice-husk-powder',
    url: '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
    name: 'Agricultural Rice Husk Powder, Grind & Ash.jpeg',
    format: 'JPG',
    sizeBytes: 32795,
    uploadedAt: '2026-11-06T07:21:43Z'
  },
  {
    id: 'builtin-black-jade-torch-veined-boulder',
    url: '/assets/uploads/WhatsApp_Image_2026-11-12_at_7.26.16_AM__1__878cb8ad.jpeg',
    name: 'Blackstone Jade Co - Torch-Illuminated Nephrite Jade Boulder with Gold Veining.jpeg',
    format: 'JPG',
    uploadedAt: '2026-11-12T07:26:16Z'
  },
  {
    id: 'builtin-black-jade-gia-cabochon-box',
    url: '/assets/uploads/WhatsApp_Image_2026-11-12_at_7.26.17_AM__1__a240ea1b.jpeg',
    name: 'Blackstone Jade Co - GIA Certified Polished Black Jade Cabochon in Display Case.jpeg',
    format: 'JPG',
    uploadedAt: '2026-11-12T07:26:17Z'
  },
  {
    id: 'builtin-black-jade-cabochon',
    url: '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg',
    name: 'Blackstone Jade Co - Natural Black Jade Cabochon.jpeg',
    format: 'JPG',
    uploadedAt: '2026-11-04T19:44:21Z'
  },
  {
    id: 'builtin-turquoise-rough-matrix',
    url: '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg',
    name: 'Blackstone Jade Co - Natural Turquoise Rough Matrix.jpeg',
    format: 'JPG',
    uploadedAt: '2026-11-04T19:44:20Z'
  },
  {
    id: 'builtin-atlantic-cat-power',
    url: '/assets/uploads/image002_50ab7837.png',
    name: 'Atlantic Power - CAT Power Diesel Generator.png',
    format: 'PNG',
    uploadedAt: '2026-10-25T10:00:00Z'
  },
  {
    id: 'builtin-atlantic-cummins',
    url: '/assets/uploads/image003_6c1f0619.jpg',
    name: 'Atlantic Power - Cummins Power Generation.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-25T10:01:00Z'
  },
  {
    id: 'builtin-atlantic-large-tanks',
    url: '/assets/uploads/image004_fa37a57a.png',
    name: 'Atlantic Power - Large Fuel Storage Tanks (3,000-18,000 Gal).png',
    format: 'PNG',
    uploadedAt: '2026-10-25T10:02:00Z'
  },
  {
    id: 'builtin-atlantic-heavy-fleet',
    url: '/assets/uploads/image005_20fe3db0.png',
    name: 'Atlantic Power - Multi-Brand Heavy Construction Equipment.png',
    format: 'PNG',
    uploadedAt: '2026-10-25T10:03:00Z'
  },
  {
    id: 'builtin-vanilla-bundle-01',
    url: '/assets/uploads/sidath-vimukthi-fIGw-jVGy5g-unsplash_c8b9928d.jpg',
    name: 'Madagascar Bourbon Vanilla Beans Bundle.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-22T09:00:00Z'
  },
  {
    id: 'builtin-vanilla-extract-02',
    url: '/assets/uploads/sidath-vimukthi-jLQ6_9mMbjQ-unsplash_52b37684.jpg',
    name: 'Gourmet Vanilla Beans & Pure Extract.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-22T09:05:00Z'
  }
];

class ProductImageManagerService {
  private memoryStorage = new Map<string, string>();
  private productActivityMap = new Map<string, number>();
  private state: ProductImageSystemState;
  private isHydratedFromServer = false;
  private hydrationPromise: Promise<ProductImageSystemState> | null = null;
  private locallyDeletedIds = new Set<string>();
  private localMutationTimes = new Map<string, number>();
  private lastServerSyncAt = 0;
  private lastLocalMutationAt = 0;
  private lastEmitTimestamp = 0;
  private inFlightWriteCount = 0;
  private stateWriteVersion = 0;
  private readonly MANUAL_MUTATION_GRACE_MS = 10 * 60 * 1000;
  private syncChannel: BroadcastChannel | null = null;
  private urlVersionMap: Map<string, string> = new Map();
  private persistDebounceTimer: number | null = null;

  constructor() {
    this.state = this.loadFromLocalStorage();
    this.rebuildUrlVersionMap();
    activeProductImageManagerInstance = this;
    if (typeof window !== 'undefined') {
      this.hydrateFromIndexedDb();
      this.hydrationPromise = this.syncFromServer(true);

      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.syncChannel = new BroadcastChannel('tradeheaven_product_images_sync');
          this.syncChannel.onmessage = (ev) => {
            if (
              ev?.data?.type === 'sync' &&
              this.inFlightWriteCount === 0 &&
              Date.now() - this.lastLocalMutationAt > 2500
            ) {
              this.syncFromServer(true).catch(() => {});
            }
          };
        } catch {}
      }

      // Cross-window fallback ping via localStorage storage event (fires across all Chrome windows on same origin)
      window.addEventListener('storage', (ev: StorageEvent) => {
        if (
          ev.key === 'tradeheaven_product_images_sync_ping' &&
          this.inFlightWriteCount === 0 &&
          Date.now() - this.lastLocalMutationAt > 2500
        ) {
          this.syncFromServer(true).catch(() => {});
        }
      });

      // Automatically sync when tab becomes visible after a long pause (60s cooldown prevents UI jank on app switch)
      const triggerFocusSync = () => {
        if (
          this.inFlightWriteCount === 0 &&
          Date.now() - this.lastLocalMutationAt > 5000 &&
          Date.now() - this.lastServerSyncAt > 60000
        ) {
          this.syncFromServer(true).catch(() => {});
        }
      };
      window.addEventListener('focus', triggerFocusSync);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          triggerFocusSync();
        }
      });

      // Lightweight periodic cross-window sync (every 5 minutes to keep UI completely responsive)
      window.setInterval(() => {
        if (
          document.visibilityState === 'visible' &&
          this.inFlightWriteCount === 0 &&
          Date.now() - this.lastLocalMutationAt > 5000 &&
          Date.now() - this.lastServerSyncAt > 240000
        ) {
          this.syncFromServer(true).catch(() => {});
        }
      }, 300000);

      // Immediately refresh authoritative server image state on login/logout so guests never see stale pre-upload images
      window.addEventListener('tradeheaven_auth_changed', () => {
        if (this.inFlightWriteCount === 0) {
          this.syncFromServer(true, false, {
            bypassCooldown: true,
            emitEvenIfUnchanged: true
          }).catch(() => {});
        }
      });
    }
  }

  private beginWrite(): void {
    this.inFlightWriteCount += 1;
    this.stateWriteVersion += 1;
    this.lastLocalMutationAt = Date.now();
  }

  private endWrite(): void {
    this.inFlightWriteCount = Math.max(0, this.inFlightWriteCount - 1);
    this.lastLocalMutationAt = Date.now();
  }

  private stripLocalAssetQuery(url: string | undefined | null): string {
    return normalizeProductAssetUrl(url);
  }

  private withFreshCacheBuster(url: string | undefined | null, versionTs = Date.now()): string {
    const normalized = normalizeProductAssetUrl(url);
    if (!normalized || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
      return normalized;
    }
    const qIdx = normalized.indexOf('?');
    const base = qIdx !== -1 ? normalized.slice(0, qIdx) : normalized;
    const existingQuery = qIdx !== -1 ? normalized.slice(qIdx + 1) : '';
    if (
      base.startsWith('/assets/uploads/') ||
      base.startsWith('/assets/client-uploads/') ||
      base.startsWith('/assets/tradeheaven/') ||
      base.startsWith('/src/assets/images/')
    ) {
      const params = new URLSearchParams(existingQuery);
      params.delete('cb');
      params.set('v', String(versionTs));
      return `${base}?${params.toString()}`;
    }
    return normalized;
  }

  public pruneDeletedUrlsFromMemory(deletedUrls: string[]): void {
    if (!Array.isArray(deletedUrls) || deletedUrls.length === 0) return;
    const deletedSet = new Set(
      deletedUrls
        .filter((u): u is string => Boolean(u))
        .map(u => String(u).trim().split('?')[0])
    );
    if (deletedSet.size === 0) return;

    this.state.mediaLibrary = (this.state.mediaLibrary || []).filter(
      m => !m?.url || !deletedSet.has(String(m.url).trim().split('?')[0])
    );

    const mergedDeleted = new Set<string>([
      ...(Array.isArray(this.state.deletedUrls) ? this.state.deletedUrls : []),
      ...deletedSet
    ]);
    this.state.deletedUrls = Array.from(mergedDeleted).slice(-500);

    // Strip any stale previousPrimary or gallery references pointing to permanently deleted files
    for (const entry of Object.values(this.state.overrides || {})) {
      if (!entry) continue;
      if (entry.previousPrimary && deletedSet.has(String(entry.previousPrimary).trim().split('?')[0])) {
        delete entry.previousPrimary;
      }
      if (Array.isArray(entry.gallery) && entry.gallery.length > 0) {
        const cleanedGallery = entry.gallery.filter(
          u => u && !deletedSet.has(String(u).trim().split('?')[0])
        );
        entry.gallery = cleanedGallery.length > 0 ? cleanedGallery : (entry.primary ? [entry.primary] : []);
      }
    }

    // Remove urlReplacements entries whose target points to a permanently deleted file
    if (this.state.urlReplacements && typeof this.state.urlReplacements === 'object') {
      for (const [k, v] of Object.entries(this.state.urlReplacements)) {
        if (v && deletedSet.has(String(v).trim().split('?')[0])) {
          delete this.state.urlReplacements[k];
        }
      }
    }
  }

  public isUrlReplacedOrDeleted(
    url: string | undefined | null,
    productId?: string,
    productTitle?: string
  ): boolean {
    if (!url || typeof url !== 'string') return false;
    const cleanBase = normalizeProductAssetUrl(url).split('?')[0];
    if (!cleanBase) return false;
    if (Array.isArray(this.state.deletedUrls) && this.state.deletedUrls.includes(cleanBase)) {
      return true;
    }
    const checkEntry = (entry?: ProductImageOverrideEntry | null): boolean => {
      if (!entry) return false;
      const primaryBase = entry.primary ? normalizeProductAssetUrl(entry.primary).split('?')[0] : '';
      if (primaryBase && primaryBase === cleanBase) return false;
      if (Array.isArray(entry.replacedOldUrls)) {
        for (const oldU of entry.replacedOldUrls) {
          const oldBase = String(oldU || '').trim().split('?')[0];
          if (oldBase && oldBase === cleanBase) return true;
        }
      }
      return false;
    };
    if (productId) {
      const cleanId = productId.trim();
      if (checkEntry(this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()])) {
        return true;
      }
    }
    if (productTitle) {
      const cleanTitle = productTitle.trim();
      if (checkEntry(this.state.overrides[cleanTitle] || this.state.overrides[cleanTitle.toLowerCase()])) {
        return true;
      }
    }
    return false;
  }

  private parseTimestampMs(val: number | string | undefined | null): number {
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) return val;
    if (typeof val === 'string' && val.trim()) {
      const trimmed = val.trim();
      if (/^\d{10,15}$/.test(trimmed)) {
        const n = Number(trimmed);
        if (Number.isFinite(n) && n > 0) return n;
      }
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }

  public recordProductActivityTimestamp(
    productId: string | undefined | null,
    timestampMs = Date.now(),
    emitEvent = true
  ): void {
    const cleanId = String(productId || '').trim();
    if (!cleanId || !Number.isFinite(timestampMs) || timestampMs <= 0) return;
    const prev = this.productActivityMap.get(cleanId) || 0;
    const nextTs = Math.max(prev, timestampMs);
    this.productActivityMap.set(cleanId, nextTs);
    if (!this.state.productActivityTimestamps) {
      this.state.productActivityTimestamps = {};
    }
    this.state.productActivityTimestamps[cleanId] = nextTs;
    if (emitEvent) {
      this.saveToLocalStorage({ productId: cleanId, action: 'record_product_activity' });
      this.notifyListeners();
    }
  }

  private getEntryTimestampMs(entry?: ProductImageOverrideEntry | null): number {
    if (!entry) return 0;
    return Math.max(
      this.parseTimestampMs(entry.imageUpdatedAt),
      this.parseTimestampMs(entry.updatedAt)
    );
  }

  private isManualEntry(entry?: ProductImageOverrideEntry | null): boolean {
    if (!entry?.primary) return false;
    return (
      entry.locked === true ||
      entry.serverVerified === true ||
      entry.updatedBy === 'admin-manual' ||
      entry.updatedBy === 'user-upload' ||
      entry.updatedBy === 'catalog-image-auditor'
    );
  }

  private isProtectedManualOrAuditEntry(entry?: ProductImageOverrideEntry | null): boolean {
    if (!entry?.primary) return false;
    return (
      entry.locked === true ||
      entry.serverVerified === true ||
      entry.updatedBy === 'admin-manual' ||
      entry.updatedBy === 'user-upload' ||
      entry.updatedBy === 'catalog-image-auditor'
    );
  }

  public isManualOverride(productId?: string, productTitle?: string): boolean {
    if (productId) {
      const cleanId = productId.trim();
      const entry = this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()];
      if (this.isManualEntry(entry)) return true;
    }
    if (productTitle) {
      const cleanTitle = productTitle.trim();
      const entry = this.state.overrides[cleanTitle] || this.state.overrides[cleanTitle.toLowerCase()];
      if (this.isManualEntry(entry)) return true;
    }
    return false;
  }

  private rebuildUrlVersionMap(): void {
    const nextMap = new Map<string, string>();
    const overrides = this.state?.overrides;
    if (overrides) {
      for (const entry of Object.values(overrides)) {
        if (!entry) continue;
        let tag = '';
        if (entry.imageUpdatedAt && Number(entry.imageUpdatedAt) > 0) {
          tag = String(entry.imageUpdatedAt);
        } else if (entry.updatedAt) {
          const t = Date.parse(entry.updatedAt);
          if (!isNaN(t)) tag = String(t);
        }
        if (!tag) continue;
        if (entry.primary) {
          const qIdx = entry.primary.indexOf('?');
          const clean = qIdx === -1 ? entry.primary : entry.primary.slice(0, qIdx);
          nextMap.set(clean, tag);
        }
        if (Array.isArray(entry.gallery)) {
          for (let i = 0; i < entry.gallery.length; i++) {
            const u = entry.gallery[i];
            if (!u) continue;
            const qIdx = u.indexOf('?');
            const clean = qIdx === -1 ? u : u.slice(0, qIdx);
            if (!nextMap.has(clean)) nextMap.set(clean, tag);
          }
        }
      }
    }
    const media = this.state?.mediaLibrary;
    if (Array.isArray(media)) {
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        if (!m?.url || !m.uploadedAt) continue;
        const qIdx = m.url.indexOf('?');
        const clean = qIdx === -1 ? m.url : m.url.slice(0, qIdx);
        if (!nextMap.has(clean)) {
          const t = Date.parse(m.uploadedAt);
          if (!isNaN(t)) nextMap.set(clean, String(t));
        }
      }
    }
    this.urlVersionMap = nextMap;
  }

  private getCanonicalVisualHash(st: ProductImageSystemState): string {
    const overrides = st.overrides || {};
    const keys = Object.keys(overrides);
    let hash = 2166136261 >>> 0;
    const mix = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
    };
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const entry = overrides[k];
      if (!entry?.primary) continue;
      mix(k);
      mix(':');
      const pIdx = entry.primary.indexOf('?');
      mix(pIdx === -1 ? entry.primary : entry.primary.slice(0, pIdx));
      if (Array.isArray(entry.gallery) && entry.gallery.length > 1) {
        mix(`#${entry.gallery.length}`);
      }
    }
    const catKeys = Object.keys(st.categoryOverrides || {});
    const urlKeys = Object.keys(st.urlReplacements || {});
    const globalDef = st.globalDefaultImage || '';
    const mediaLen = Array.isArray(st.mediaLibrary) ? st.mediaLibrary.length : 0;
    return `${keys.length}:${hash}:${catKeys.length}:${urlKeys.length}:${globalDef}:${mediaLen}`;
  }

  public getVersionTagForUrl(url: string): string {
    if (!url) return String(this.stateWriteVersion || 'v7');
    const qIdx = url.indexOf('?');
    const cleanUrl = qIdx === -1 ? url : url.slice(0, qIdx);
    const cached = this.urlVersionMap.get(cleanUrl);
    if (cached) return cached;
    return String(this.stateWriteVersion || 'v7');
  }

  public isHydrated(): boolean {
    return this.isHydratedFromServer;
  }

  public async ensureHydrated(): Promise<ProductImageSystemState> {
    if (this.isHydratedFromServer) return this.state;
    if (this.hydrationPromise) {
      await this.hydrationPromise;
    } else if (typeof window !== 'undefined') {
      this.hydrationPromise = this.syncFromServer();
      await this.hydrationPromise;
    }
    return this.state;
  }

  private getInitialEmptyState(): ProductImageSystemState {
    return {
      overrides: { ...DEFAULT_BUILTIN_OVERRIDES },
      productActivityTimestamps: {},
      globalDefaultImage: null,
      categoryOverrides: {},
      urlReplacements: {},
      mediaLibrary: [...DEFAULT_BUILTIN_MEDIA]
    };
  }

  private isPlaceholderOverrideUrl(url: string | undefined | null): boolean {
    const clean = String(url || '').trim().toLowerCase();
    if (!clean) return true;
    return [
      'picsum.photos',
      'via.placeholder.com',
      'placeholder.com',
      'dummyimage.com',
      'placekitten.com',
      'images.unsplash.com',
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'shutterstock.com',
      'istockphoto.com',
      'gettyimages.com',
      'vecteezy_'
    ].some(p => clean.includes(p));
  }

  private normalizeOverrideMap(rawMap: Record<string, any>): Record<string, ProductImageOverrideEntry> {
    const out: Record<string, ProductImageOverrideEntry> = {};
    if (!rawMap || typeof rawMap !== 'object') return out;
    for (const [k, v] of Object.entries(rawMap)) {
      if (!v || typeof v !== 'object' || !v.primary) continue;
      const primary = normalizeProductAssetUrl(v.primary);
      const isManual = (v.updatedBy || '') !== 'auto-site-upload';
      if (!primary || (!isManual && this.isPlaceholderOverrideUrl(primary))) continue;
      const previousPrimary = v.previousPrimary ? normalizeProductAssetUrl(v.previousPrimary) : undefined;
      const gallery = Array.isArray(v.gallery) && v.gallery.length > 0
        ? v.gallery
            .map((u: string) => normalizeProductAssetUrl(u))
            .filter((u: string) => Boolean(u) && (isManual || !this.isPlaceholderOverrideUrl(u)))
        : [primary];
      const numericImgTs = this.parseTimestampMs(v.imageUpdatedAt);
      const replacedOldUrls: string[] | undefined = Array.isArray(v.replacedOldUrls)
        ? Array.from(new Set(v.replacedOldUrls.map((u: any) => String(u || '').trim().split('?')[0]).filter((u: string): u is string => Boolean(u))))
        : undefined;
      out[k] = {
        primary,
        ...(previousPrimary ? { previousPrimary } : {}),
        gallery: gallery.length > 0 ? gallery : [primary],
        format: v.format || this.detectFormatFromUrl(primary),
        updatedAt: v.updatedAt || '2024-01-01T00:00:00.000Z',
        ...(numericImgTs > 0 ? { imageUpdatedAt: numericImgTs } : {}),
        updatedBy: v.updatedBy,
        ...(v.locked === true ? { locked: true } : {}),
        ...(v.serverVerified === true ? { serverVerified: true } : {}),
        ...(v.verifiedAt ? { verifiedAt: String(v.verifiedAt) } : {}),
        ...(replacedOldUrls && replacedOldUrls.length > 0 ? { replacedOldUrls } : {})
      };
    }
    return out;
  }

  private loadFromLocalStorage(): ProductImageSystemState {
    const base = this.getInitialEmptyState();
    if (typeof window === 'undefined') return base;

    try {
      let raw = this.memoryStorage.get(STORAGE_KEY) || null;
      if (!raw) {
        try {
          raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) this.memoryStorage.set(STORAGE_KEY, raw);
        } catch {}
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const loadedOverrides = this.normalizeOverrideMap(parsed.overrides);
          base.overrides = { ...DEFAULT_BUILTIN_OVERRIDES };
          for (const [k, entry] of Object.entries(loadedOverrides)) {
            const builtin = base.overrides[k];
            if (!builtin) {
              base.overrides[k] = entry;
            } else {
              const builtinTime = this.getEntryTimestampMs(builtin);
              const loadedTime = this.getEntryTimestampMs(entry);
              const entryIsProtected = this.isProtectedManualOrAuditEntry(entry);
              if (entryIsProtected || loadedTime >= builtinTime) {
                base.overrides[k] = entry;
              }
            }
          }
          base.globalDefaultImage = typeof parsed.globalDefaultImage === 'string'
            ? normalizeProductAssetUrl(parsed.globalDefaultImage)
            : null;
          base.categoryOverrides = parsed.categoryOverrides && typeof parsed.categoryOverrides === 'object'
            ? { ...parsed.categoryOverrides }
            : {};
          base.urlReplacements = parsed.urlReplacements && typeof parsed.urlReplacements === 'object'
            ? { ...parsed.urlReplacements }
            : {};
          if (Array.isArray(parsed.mediaLibrary)) {
            const normalizedMedia = parsed.mediaLibrary
              .filter((m: any) => m && m.url && !String(m.url).includes('WhatsApp_Image_2026-11-02_at_5.43.28_PM_f16b3ccd'))
              .map((m: MediaLibraryItem) => ({
                ...m,
                url: normalizeProductAssetUrl(m.url)
              }));
            const urls = new Set(normalizedMedia.map((m: MediaLibraryItem) => m.url));
            base.mediaLibrary = [
              ...normalizedMedia,
              ...DEFAULT_BUILTIN_MEDIA.filter(d => !urls.has(d.url))
            ];
          }
        }
      }

      // Merge legacy overrides if present in browser localStorage or memory storage
      let legacyRaw = this.memoryStorage.get(LEGACY_OVERRIDES_KEY) || null;
      if (!legacyRaw) {
        try {
          legacyRaw = window.localStorage.getItem(LEGACY_OVERRIDES_KEY);
          if (legacyRaw) this.memoryStorage.set(LEGACY_OVERRIDES_KEY, legacyRaw);
        } catch {}
      }
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (legacyParsed && typeof legacyParsed === 'object') {
          const normalizedLegacy = this.normalizeOverrideMap(legacyParsed);
          for (const [key, entry] of Object.entries(normalizedLegacy)) {
            const existing = base.overrides[key];
            if (!existing) {
              base.overrides[key] = entry;
            } else {
              const legacyTime = this.getEntryTimestampMs(entry);
              const baseTime = this.getEntryTimestampMs(existing);
              const legacyIsManual = this.isManualEntry(entry);
              const existingIsManual = this.isManualEntry(existing);
              if (
                (legacyIsManual && !existingIsManual && legacyTime >= baseTime) ||
                (legacyTime > baseTime && (!existingIsManual || legacyIsManual))
              ) {
                base.overrides[key] = entry;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[ProductImageManagerService] Error reading persistent storage:', err);
    }

    return base;
  }

  private openIndexedDb(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async saveToIndexedDb(stateToSave: ProductImageSystemState): Promise<void> {
    try {
      const db = await this.openIndexedDb();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(stateToSave, IDB_KEY);
    } catch {}
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    if (this.isHydratedFromServer) return;
    try {
      const db = await this.openIndexedDb();
      if (!db || this.isHydratedFromServer) return;
      const idbState: ProductImageSystemState | null = await new Promise((resolve) => {
        try {
          const tx = db.transaction(IDB_STORE, 'readonly');
          const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
      if (this.isHydratedFromServer) return;
      if (idbState && idbState.overrides && typeof idbState.overrides === 'object') {
        let changed = false;
        const normalizedIdb = this.normalizeOverrideMap(idbState.overrides);
        for (const [pid, idbEntry] of Object.entries(normalizedIdb)) {
          if (this.locallyDeletedIds.has(pid)) continue;
          if (!this.isProtectedManualOrAuditEntry(idbEntry)) continue;
          const current = this.state.overrides[pid];
          const idbTime = this.getEntryTimestampMs(idbEntry);
          const curTime = this.getEntryTimestampMs(current);
          if (!current || idbTime > curTime) {
            this.state.overrides[pid] = idbEntry;
            changed = true;
          }
        }
        if (changed && !this.isHydratedFromServer) {
          this.rebuildUrlVersionMap();
          this.emitImageSavedEvent({ action: 'idb_hydrated' });
          this.notifyListeners();
        }
      }
    } catch {}
  }

  private flushPersistenceToStorage(): void {
    if (typeof window === 'undefined') return;
    const stateSnapshot = this.state;
    this.saveToIndexedDb(stateSnapshot);

    try {
      const compactOverrides: Record<string, ProductImageOverrideEntry> = {};
      for (const [k, v] of Object.entries(stateSnapshot.overrides || {})) {
        if (!v?.primary || v.primary.startsWith('data:')) continue;
        compactOverrides[k] = {
          ...v,
          gallery: Array.isArray(v.gallery) ? v.gallery.filter(u => u && !u.startsWith('data:')).slice(0, 4) : [v.primary]
        };
      }
      const compactState: ProductImageSystemState = {
        overrides: compactOverrides,
        productActivityTimestamps: stateSnapshot.productActivityTimestamps || {},
        globalDefaultImage:
          stateSnapshot.globalDefaultImage && !stateSnapshot.globalDefaultImage.startsWith('data:')
            ? stateSnapshot.globalDefaultImage
            : null,
        categoryOverrides: stateSnapshot.categoryOverrides || {},
        urlReplacements: stateSnapshot.urlReplacements || {},
        mediaLibrary: (stateSnapshot.mediaLibrary || []).filter(m => m?.url && !m.url.startsWith('data:')).slice(0, 120)
      };
      const serialized = JSON.stringify(compactState);
      this.memoryStorage.set(STORAGE_KEY, serialized);
      try {
        window.localStorage.setItem(STORAGE_KEY, serialized);
      } catch {}
      this.syncCachedProductsInLocalStorage();
    } catch (err) {
      console.warn('[ProductImageManagerService] Error saving to persistent storage:', err);
    }
  }

  private saveToLocalStorage(context?: { productId?: string; url?: string; gallery?: string[]; action?: string; details?: any }) {
    if (typeof window === 'undefined') return;

    this.rebuildUrlVersionMap();

    // Emit UI update immediately without blocking clicks on multi-MB JSON serialization
    this.emitImageSavedEvent(context);

    // Defer heavy IndexedDB & localStorage serialization so interaction latency stays near 0ms
    const isManualWrite = Boolean(context?.productId) || (context?.action && context.action !== 'sync_from_server');
    if (this.persistDebounceTimer !== null) {
      window.clearTimeout(this.persistDebounceTimer);
    }
    this.persistDebounceTimer = window.setTimeout(() => {
      this.persistDebounceTimer = null;
      const runFlush = () => this.flushPersistenceToStorage();
      if (typeof (window as any).requestIdleCallback === 'function' && !isManualWrite) {
        (window as any).requestIdleCallback(runFlush, { timeout: 2500 });
      } else {
        runFlush();
      }
    }, isManualWrite ? 150 : 1200);
  }

  private emitImageSavedEvent(context?: { productId?: string; url?: string; gallery?: string[]; action?: string; details?: any }) {
    if (typeof window === 'undefined') return;
    try {
      this.lastEmitTimestamp = Date.now();
      const detail: ProductImageSavedEventDetail = {
        timestamp: this.lastEmitTimestamp,
        state: this.state,
        overrides: this.state.overrides,
        mediaLibrary: this.state.mediaLibrary,
        productId: context?.productId,
        url: context?.url,
        gallery: context?.gallery,
        action: context?.action || 'save_to_storage',
        details: context?.details
      };

      // Dispatches primary event as requested
      window.dispatchEvent(new CustomEvent(PRODUCT_IMAGE_SAVED_EVENT, { detail }));
      // Dispatches secondary aliases for wide interoperability across components
      window.dispatchEvent(new CustomEvent(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, { detail }));
      window.dispatchEvent(new CustomEvent('tradeheaven_image_saved_to_storage', { detail }));
      window.dispatchEvent(new CustomEvent('product_image_saved', { detail }));
      window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated', { detail: this.state }));

      const actionName = String(context?.action || '');
      if (
        actionName !== 'sync_from_server' &&
        actionName !== 'idb_hydrated'
      ) {
        if (this.syncChannel) {
          try {
            this.syncChannel.postMessage({ type: 'sync', ts: this.lastEmitTimestamp });
          } catch {}
        }
        try {
          window.localStorage?.setItem(
            'tradeheaven_product_images_sync_ping',
            `${this.lastEmitTimestamp}:${context?.productId || ''}`
          );
        } catch {}
      }
    } catch (err) {
      console.warn('[ProductImageManagerService] Error emitting image saved event:', err);
    }
  }

  /**
   * Helper to subscribe to custom events emitted when an image is saved to storage.
   * Returns an unsubscribe cleanup function.
   */
  public onImageSaved(
    callback: (event: CustomEvent<ProductImageSavedEventDetail>) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};
    let lastHandledTs = 0;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ProductImageSavedEventDetail>;
      const ts = ce?.detail?.timestamp || Date.now();
      if (ts === lastHandledTs) return;
      lastHandledTs = ts;
      callback(ce);
    };
    window.addEventListener(PRODUCT_IMAGE_SAVED_EVENT, handler);
    window.addEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handler);
    return () => {
      window.removeEventListener(PRODUCT_IMAGE_SAVED_EVENT, handler);
      window.removeEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handler);
    };
  }

  /**
   * Get the primary image directly for a given product ID or content key.
   */
  public getProductImage(productIdOrKey: string): string | undefined {
    if (!productIdOrKey) return undefined;
    const override = this.state.overrides[productIdOrKey];
    if (override?.primary) return normalizeProductAssetUrl(override.primary);
    return undefined;
  }

  private syncCachedProductsInLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const applyAndPersist = (storage: Storage | Map<string, string>, key: string, isWebStorage: boolean) => {
        const raw = isWebStorage ? (storage as Storage).getItem(key) : (storage as Map<string, string>).get(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const updated = this.applyOverridesToProductList(parsed);
          const serialized = JSON.stringify(updated);
          if (isWebStorage) {
            (storage as Storage).setItem(key, serialized);
          } else {
            (storage as Map<string, string>).set(key, serialized);
          }
        }
      };

      applyAndPersist(this.memoryStorage, 'trade_heaven_custom_products', false);
      applyAndPersist(this.memoryStorage, PRODUCTS_CACHE_KEY, false);
      applyAndPersist(this.memoryStorage, 'cached_products', false);

      if (window.localStorage) {
        applyAndPersist(window.localStorage, 'trade_heaven_custom_products', true);
      }
    } catch {}
  }

  private notifyListeners() {
    if (typeof window !== 'undefined') {
      // Avoid duplicate dispatch if emitImageSavedEvent already fired in the same synchronous turn
      if (Date.now() - this.lastEmitTimestamp < 25) return;
      this.lastEmitTimestamp = Date.now();
      window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated', { detail: this.state }));
    }
  }

  public detectFormatFromUrl(url: string | undefined): string {
    if (!url) return 'JPG';
    if (url.startsWith('data:image/')) {
      const mime = url.slice(11, url.indexOf(';')).toUpperCase();
      return mime === 'JPEG' ? 'JPG' : mime === 'SVG+XML' ? 'SVG' : mime;
    }
    const clean = url.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop()?.toUpperCase();
    if (ext && ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG', 'AVIF', 'BMP', 'ICO', 'TIFF'].includes(ext)) {
      return ext === 'JPEG' ? 'JPG' : ext;
    }
    return 'JPG';
  }

  public getState(): ProductImageSystemState {
    return this.state;
  }

  public async syncFromServer(
    force = true,
    includeFullMedia = false,
    opts?: { bypassCooldown?: boolean; emitEvenIfUnchanged?: boolean }
  ): Promise<ProductImageSystemState> {
    if (this.inFlightWriteCount > 0) {
      return this.state;
    }
    if (!opts?.bypassCooldown && Date.now() - this.lastLocalMutationAt < 2500) {
      return this.state;
    }
    if (!force && !opts?.bypassCooldown && Date.now() - this.lastServerSyncAt < 5000) {
      return this.state;
    }
    const syncStartVersion = this.stateWriteVersion;
    this.lastServerSyncAt = Date.now();

    try {
      let srv: ProductImageSystemState | null = null;
      // 1. Try public & admin Node/Express endpoints (always cache-busted with no-store so another Chrome window never receives stale overrides)
      const bustQuery = `_t=${Date.now()}`;
      const publicQueryParts = [includeFullMedia ? 'includeMedia=1' : '', bustQuery].filter(Boolean).join('&');
      const publicUrl = `/api/v1/public/product-images?${publicQueryParts}`;
      const endpoints: Array<{ url: string; cacheMode: RequestCache }> = includeFullMedia
        ? [
            { url: `/api/v1/admin/product-images?_t=${Date.now()}`, cacheMode: 'no-store' },
            { url: publicUrl, cacheMode: 'no-store' }
          ]
        : [
            { url: publicUrl, cacheMode: 'no-store' },
            { url: `/api/v1/admin/product-images?_t=${Date.now()}`, cacheMode: 'no-store' }
          ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url, { cache: ep.cacheMode });
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json?.data) {
              srv = json.data;
              break;
            }
          }
        } catch {}
      }

      // 2. Fallback to PHP endpoint (for cPanel / BigRock deployment)
      if (!srv) {
        try {
          const phpRes = await fetch(`/api.php?action=get_product_images&_t=${Date.now()}`, {
            cache: 'no-store'
          });
          if (phpRes.ok) {
            const phpJson = await phpRes.json();
            if (phpJson?.success && phpJson?.data) {
              srv = phpJson.data;
            }
          }
        } catch {}
      }

      // 3. Static JSON fallback for Incognito / CDN / static environments
      if (!srv) {
        for (const fallbackUrl of [
          `/data/productImageSystemState.json?_t=${Date.now()}`,
          `/assets/uploads/product-image-overrides.json?_t=${Date.now()}`
        ]) {
          try {
            const staticRes = await fetch(fallbackUrl, { cache: 'no-store' });
            if (staticRes.ok) {
              const parsed = await staticRes.json();
              if (parsed && typeof parsed === 'object' && parsed.overrides) {
                srv = parsed;
                break;
              }
            }
          } catch {}
        }
      }

      // 4. Last-resort dynamic backup JSON fallback (lazy-loaded only if server & static endpoints fail)
      if (!srv) {
        try {
          const backupMod = await import('../data/productImageOverridesBackup.json');
          const parsed = (backupMod as any)?.default || backupMod;
          if (parsed && typeof parsed === 'object' && parsed.overrides) {
            srv = parsed;
          }
        } catch {}
      }

      // Never overwrite in-flight or newer local mutations made while the GET was in flight
      if (this.inFlightWriteCount > 0 || syncStartVersion !== this.stateWriteVersion) {
        this.isHydratedFromServer = true;
        return this.state;
      }

      if (srv) {
        const prevVisualHash = this.getCanonicalVisualHash(this.state);

        const localOverrides = this.state.overrides || {};
        const srvOverrides = this.normalizeOverrideMap(srv.overrides || {});
        const mergedOverrides: Record<string, ProductImageOverrideEntry> = {
          ...DEFAULT_BUILTIN_OVERRIDES
        };

        // Server overrides unconditionally supersede static DEFAULT_BUILTIN_OVERRIDES
        for (const [pid, srvEntry] of Object.entries(srvOverrides)) {
          if (this.locallyDeletedIds.has(pid)) continue;
          mergedOverrides[pid] = srvEntry;
        }

        // Authoritative server sync: ONLY preserve a local override over server state if it was actively mutated
        // in THIS tab within the last 30 seconds (prevents stale localStorage/IndexedDB in another Chrome window
        // from ever hiding newly auto-fixed images saved on the server).
        const nowMsForMerge = Date.now();
        for (const [pid, localEntry] of Object.entries(localOverrides)) {
          if (!localEntry?.primary || this.locallyDeletedIds.has(pid)) continue;
          const mutatedAt = this.localMutationTimes.get(pid) || 0;
          const recentlyMutatedInThisTab = mutatedAt > 0 && nowMsForMerge - mutatedAt < 30000;
          if (!recentlyMutatedInThisTab) continue;

          const localTime = this.getEntryTimestampMs(localEntry);
          const localIsProtected = this.isProtectedManualOrAuditEntry(localEntry);
          const srvEntry = srvOverrides[pid];
          const srvTime = this.getEntryTimestampMs(srvEntry);
          const srvIsProtected = this.isProtectedManualOrAuditEntry(srvEntry);

          if (!srvEntry) {
            mergedOverrides[pid] = localEntry;
          } else if (localTime > srvTime) {
            mergedOverrides[pid] = localEntry;
          } else if (localTime === srvTime && localIsProtected && !srvIsProtected) {
            mergedOverrides[pid] = localEntry;
          }
        }

        this.state.overrides = mergedOverrides;
        let activityTimestampsChanged = false;
        const nextActivityObj: Record<string, number> = {
          ...(this.state.productActivityTimestamps || {})
        };
        if (srv.productActivityTimestamps && typeof srv.productActivityTimestamps === 'object') {
          for (const [pid, rawTs] of Object.entries(srv.productActivityTimestamps)) {
            const ts = this.parseTimestampMs(rawTs as any);
            if (ts > 0) {
              const prevTs = Math.max(this.productActivityMap.get(pid) || 0, nextActivityObj[pid] || 0);
              if (ts > prevTs) {
                this.productActivityMap.set(pid, ts);
                nextActivityObj[pid] = ts;
                activityTimestampsChanged = true;
              }
            }
          }
        }
        for (const [pid, entry] of Object.entries(mergedOverrides)) {
          const ts = this.parseTimestampMs(entry?.imageUpdatedAt);
          if (ts > 0) {
            const prevTs = Math.max(this.productActivityMap.get(pid) || 0, nextActivityObj[pid] || 0);
            if (ts > prevTs) {
              this.productActivityMap.set(pid, ts);
              nextActivityObj[pid] = ts;
              activityTimestampsChanged = true;
            }
          }
        }
        this.state.productActivityTimestamps = nextActivityObj;

        this.state.globalDefaultImage = srv.globalDefaultImage !== undefined
          ? (srv.globalDefaultImage ? normalizeProductAssetUrl(srv.globalDefaultImage) : null)
          : (this.state.globalDefaultImage ?? null);
        if (srv.categoryOverrides && typeof srv.categoryOverrides === 'object') {
          this.state.categoryOverrides = { ...srv.categoryOverrides };
        }
        if (srv.urlReplacements && typeof srv.urlReplacements === 'object') {
          this.state.urlReplacements = { ...srv.urlReplacements };
        }

        if (Array.isArray(srv.mediaLibrary)) {
          const seen = new Set<string>();
          const mergedMedia: MediaLibraryItem[] = [];
          for (const item of [...srv.mediaLibrary, ...DEFAULT_BUILTIN_MEDIA]) {
            if (!item || !item.url) continue;
            if (String(item.url).includes('WhatsApp_Image_2026-11-02_at_5.43.28_PM_f16b3ccd')) continue;
            const cleanUrl = normalizeProductAssetUrl(item.url);
            if (cleanUrl && !seen.has(cleanUrl)) {
              seen.add(cleanUrl);
              mergedMedia.push({ ...item, url: cleanUrl });
            }
          }
          this.state.mediaLibrary = mergedMedia;
        }

        if (Array.isArray((srv as any).deletedUrls) && (srv as any).deletedUrls.length > 0) {
          this.pruneDeletedUrlsFromMemory((srv as any).deletedUrls);
        }

        const wasUnhydrated = !this.isHydratedFromServer;
        const nextVisualHash = this.getCanonicalVisualHash(this.state);
        this.isHydratedFromServer = true;

        // Save and notify UI components on initial hydration, whenever image URLs / activity timestamps change, or on explicit Refresh All
        if (wasUnhydrated || prevVisualHash !== nextVisualHash || activityTimestampsChanged || opts?.emitEvenIfUnchanged) {
          this.saveToLocalStorage({ action: 'sync_from_server' });
        }
      } else {
        this.isHydratedFromServer = true;
        if (opts?.emitEvenIfUnchanged) {
          this.notifyListeners();
        }
      }
    } catch {
      this.isHydratedFromServer = true;
    }
    return this.state;
  }

  /**
   * Immediately apply authoritative server fix/audit results into local state, mediaLibrary, and listeners
   * so newer server URLs are never overwritten by stale local mutations.
   */
  public applyServerOverrideSnapshot(
    entries: Array<{
      id: string;
      url: string;
      previousUrl?: string;
      updatedAt?: string;
      updatedBy?: string;
      revert?: boolean;
      locked?: boolean;
      serverVerified?: boolean;
      verifiedAt?: string;
      replacedOldUrls?: string[];
      deletedOldUrls?: string[];
    }>
  ): void {
    if (!Array.isArray(entries) || entries.length === 0) return;
    let changed = false;
    const nowIso = new Date().toISOString();
    const allDeletedToPrune: string[] = [];

    for (const item of entries) {
      const cleanId = String(item?.id || '').trim();
      const rawUrl = String(item?.url || '').trim();
      if (!cleanId) continue;

      if (item.revert) {
        if (!rawUrl || rawUrl === '(empty)') {
          if (this.state.overrides[cleanId]) {
            delete this.state.overrides[cleanId];
            this.localMutationTimes.set(cleanId, Date.now());
            changed = true;
          }
          continue;
        }
      }

      const cleanUrl = normalizeProductAssetUrl(rawUrl);
      if (!cleanUrl || cleanUrl === '(pending audit fix)' || cleanUrl === '(empty)') continue;

      const nowMs = Date.now();
      this.locallyDeletedIds.delete(cleanId);
      this.localMutationTimes.set(cleanId, nowMs);
      const existing = this.state.overrides[cleanId];
      const existingPrimaryBase = existing?.primary ? normalizeProductAssetUrl(existing.primary).split('?')[0] : '';
      const existingGallery = Array.isArray(existing?.gallery) ? existing!.gallery : [];
      const resolvedTs = this.parseTimestampMs(item.updatedAt) || nowMs;
      const cleanBase = cleanUrl.split('?')[0];
      const mergedReplaced = Array.from(
        new Set([
          ...(Array.isArray(existing?.replacedOldUrls) ? existing!.replacedOldUrls : []),
          ...(Array.isArray(item.replacedOldUrls) ? item.replacedOldUrls : []),
          ...(Array.isArray(item.deletedOldUrls) ? item.deletedOldUrls : []),
          ...(existingPrimaryBase && existingPrimaryBase !== cleanBase ? [existingPrimaryBase] : []),
          ...(item.previousUrl ? [item.previousUrl.split('?')[0]] : [])
        ])
      ).filter(u => u && u !== '(empty)' && u !== cleanBase);
      const replacedSet = new Set(mergedReplaced);
      if (Array.isArray(item.deletedOldUrls) && item.deletedOldUrls.length > 0) {
        allDeletedToPrune.push(...item.deletedOldUrls);
      }

      this.state.overrides[cleanId] = {
        primary: cleanUrl,
        gallery: [
          cleanUrl,
          ...existingGallery.filter(u => {
            const ub = u ? normalizeProductAssetUrl(u).split('?')[0] : '';
            return Boolean(ub) && ub !== cleanBase && !replacedSet.has(ub);
          })
        ],
        format: this.detectFormatFromUrl(cleanUrl),
        updatedAt: item.updatedAt || nowIso,
        imageUpdatedAt: resolvedTs,
        updatedBy: item.updatedBy || (item.revert ? 'auto-site-upload' : 'catalog-image-auditor'),
        locked: item.revert ? false : (item.locked ?? true),
        serverVerified: item.revert ? false : (item.serverVerified ?? true),
        ...(item.verifiedAt ? { verifiedAt: item.verifiedAt } : !item.revert ? { verifiedAt: nowIso } : {}),
        ...(mergedReplaced.length > 0 ? { replacedOldUrls: mergedReplaced } : {})
      };
      if (!item.revert) {
        this.recordProductActivityTimestamp(cleanId, resolvedTs, false);
      }

      if (cleanUrl.startsWith('/assets/uploads/')) {
        const existsInMedia = this.state.mediaLibrary.some(m => m?.url && m.url.split('?')[0] === cleanBase);
        if (!existsInMedia) {
          const fname = cleanBase.split('/').pop() || 'catalog-image.webp';
          this.state.mediaLibrary = [
            {
              id: `media-${fname}`,
              url: cleanBase,
              name: fname,
              format: this.detectFormatFromUrl(cleanBase),
              sizeBytes: 0,
              uploadedAt: item.updatedAt || nowIso
            },
            ...this.state.mediaLibrary
          ];
        }
      }

      changed = true;
    }

    if (allDeletedToPrune.length > 0) {
      this.pruneDeletedUrlsFromMemory(allDeletedToPrune);
    }

    if (changed) {
      this.stateWriteVersion++;
      this.saveToLocalStorage({ action: 'apply_server_override_snapshot' });
      this.notifyListeners();
    }
  }

  /**
   * Explicitly pushes all current image overrides, URL replacements, and category overrides
   * to the server so Incognito and all visitors see the exact current state immediately.
   */
  public async forceSyncToServer(): Promise<boolean> {
    this.beginWrite();
    try {
      const payload = JSON.stringify({
        fullOverridesMap: this.state.overrides,
        urlReplacements: this.state.urlReplacements,
        categoryOverrides: this.state.categoryOverrides,
        applyToAll: Boolean(this.state.globalDefaultImage),
        primaryUrl: this.state.globalDefaultImage || undefined,
        forceFullSync: true,
        updatedBy: 'admin-manual'
      });
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (res.ok) {
        this.saveToLocalStorage({ action: 'force_sync_to_server' });
        this.notifyListeners();
        return true;
      }
    } catch {
      // fallback to PHP endpoint below
    } finally {
      this.endWrite();
    }
    this.beginWrite();
    try {
      const phpRes = await fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullOverridesMap: this.state.overrides,
          urlReplacements: this.state.urlReplacements,
          categoryOverrides: this.state.categoryOverrides,
          forceFullSync: true,
          updatedBy: 'admin-manual'
        })
      });
      if (phpRes.ok) {
        this.saveToLocalStorage({ action: 'force_sync_to_server' });
        this.notifyListeners();
        return true;
      }
    } catch {
      // ignore offline error
    } finally {
      this.endWrite();
    }
    return false;
  }

  /**
   * Resolves a single image URL taking into account:
   * 1) Product-specific override (by productId or productTitle)
   * 2) Global URL replacement rules
   * 3) Category-level override
   * 4) Global all-products default override
   */
  public resolveImageSrc(params: {
    src?: string;
    productId?: string;
    productTitle?: string;
    category?: string;
    imageIndex?: number;
  }): string | undefined {
    const { src, productId, productTitle, category, imageIndex = 0 } = params;
    const normalizedSrc = src ? normalizeProductAssetUrl(src) : undefined;

    // 1. Check direct productId override FIRST (always honor explicit saved overrides before built-in prefixes)
    if (productId) {
      const cleanId = productId.trim();
      const entry = this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()];
      if (entry) {
        const candidateUrl =
          imageIndex > 0 && entry.gallery && entry.gallery[imageIndex]
            ? normalizeProductAssetUrl(entry.gallery[imageIndex])
            : entry.primary
              ? normalizeProductAssetUrl(entry.primary)
              : '';
        if (candidateUrl) {
          if (this.isProtectedManualOrAuditEntry(entry)) {
            return candidateUrl;
          }
          const lowerCand = candidateUrl.toLowerCase();
          const lowerTitle = (productTitle || '').toLowerCase();
          const hasCoalFile = /\bcoal\b/.test(lowerCand.replace(/[-_/]/g, ' ')) && !lowerCand.includes('charcoal');
          const isCharcoalOrLeather = lowerTitle.includes('charcoal') || lowerTitle.includes('leather') || lowerTitle.includes('belt');
          if (
            !(hasCoalFile && isCharcoalOrLeather) &&
            !isGenericOrPlaceholderImageUrl(candidateUrl) &&
            !isMismatchedProductImageUrl(candidateUrl, productTitle, category)
          ) {
            return candidateUrl;
          }
        }
      }
      if (cleanId.startsWith('prod-leather-belt-')) {
        const num = cleanId.replace('prod-leather-belt-', '');
        return `/assets/uploads/verified-belt-${num}.webp`;
      }
      if (cleanId.startsWith('prod-exc-')) {
        return `/assets/uploads/verified-${cleanId}.webp`;
      }
    }

    // 2. Check productTitle override (exact, case-insensitive, or key token match)
    if (productTitle) {
      const cleanTitle = productTitle.trim();
      const lowerTitle = cleanTitle.toLowerCase();
      const matchedEntry = this.state.overrides[cleanTitle] || this.state.overrides[lowerTitle];

      if (matchedEntry?.primary) {
        if (this.isProtectedManualOrAuditEntry(matchedEntry)) {
          return normalizeProductAssetUrl(matchedEntry.primary);
        }
        const candidatePrimary = normalizeProductAssetUrl(matchedEntry.primary);
        const isTargetSaree = /(saree|sari|textile|apparel|fabric|garment|silk|dress)/i.test(lowerTitle);
        const isEntrySaree = candidatePrimary.toLowerCase().includes('saree') || candidatePrimary.toLowerCase().includes('shree');
        if (
          (!isEntrySaree || isTargetSaree) &&
          !isGenericOrPlaceholderImageUrl(candidatePrimary) &&
          !isMismatchedProductImageUrl(candidatePrimary, productTitle, category)
        ) {
          return candidatePrimary;
        }
      }
    }

    // 3. Check URL replacement rules (fast-path when map is empty)
    const urlReplacements = this.state.urlReplacements;
    if (normalizedSrc && urlReplacements) {
      const replacementKeys = Object.keys(urlReplacements);
      if (replacementKeys.length > 0) {
        const strippedSrc = this.stripLocalAssetQuery(normalizedSrc);
        const acceptReplacement = (rawNewUrl: string): string | undefined => {
          const normNew = normalizeProductAssetUrl(rawNewUrl);
          if (!normNew || isGenericOrPlaceholderImageUrl(normNew)) return undefined;
          if (isMismatchedProductImageUrl(normNew, productTitle, category)) return undefined;
          return normNew;
        };
        if (urlReplacements[normalizedSrc]) {
          const ok = acceptReplacement(urlReplacements[normalizedSrc]);
          if (ok) return ok;
        }
        if (strippedSrc && urlReplacements[strippedSrc]) {
          const ok = acceptReplacement(urlReplacements[strippedSrc]);
          if (ok) return ok;
        }
        if (src && urlReplacements[src]) {
          const ok = acceptReplacement(urlReplacements[src]);
          if (ok) return ok;
        }
        for (let i = 0; i < replacementKeys.length; i++) {
          const oldSubstr = replacementKeys[i];
          const newUrl = urlReplacements[oldSubstr];
          const cleanSubstr = this.stripLocalAssetQuery(oldSubstr);
          if (
            oldSubstr &&
            (normalizedSrc.includes(oldSubstr) ||
              (cleanSubstr && strippedSrc.includes(cleanSubstr)) ||
              (src && src.includes(oldSubstr)))
          ) {
            const ok = acceptReplacement(newUrl);
            if (ok) return ok;
          }
        }
      }
    }

    // 4. Check category-wide override
    if (category && this.state.categoryOverrides[category]) {
      return normalizeProductAssetUrl(this.state.categoryOverrides[category]);
    }

    // 5. Check global all-products image override (only when rendering a product card / product with productId or category)
    if ((productId || category || productTitle) && this.state.globalDefaultImage) {
      return normalizeProductAssetUrl(this.state.globalDefaultImage);
    }

    return normalizedSrc;
  }

  /**
   * Resolves the full images array for a Product object
   */
  public resolveProductImages(product: Partial<Product> & { image?: string }): string[] {
    const rawImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(u => normalizeProductAssetUrl(u)).filter(Boolean)
      : product.image
        ? [normalizeProductAssetUrl(product.image)]
        : [];

    if (product.id) {
      const cleanId = product.id.trim();
      const entry = this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()];
      if (entry && entry.primary) {
        const cleanPrimary = normalizeProductAssetUrl(entry.primary);
        const entryAllowed =
          this.isProtectedManualOrAuditEntry(entry) ||
          (!isGenericOrPlaceholderImageUrl(cleanPrimary) &&
            !isMismatchedProductImageUrl(cleanPrimary, product.title, product.category));
        if (entryAllowed) {
          if (Array.isArray(entry.gallery) && entry.gallery.length > 0) {
            const cleanGallery = entry.gallery
              .map(u => normalizeProductAssetUrl(u))
              .filter(
                u =>
                  Boolean(u) &&
                  (this.isProtectedManualOrAuditEntry(entry) || !isMismatchedProductImageUrl(u, product.title, product.category))
              );
            return cleanGallery.length > 0 ? [cleanPrimary, ...cleanGallery.filter(u => u !== cleanPrimary)] : [cleanPrimary];
          }
          return [cleanPrimary, ...rawImages.slice(1).filter(u => !this.isPlaceholderOverrideUrl(u) && u !== cleanPrimary)];
        }
      }
    }

    if (product.title && this.state.overrides[product.title.trim()]) {
      const entry = this.state.overrides[product.title.trim()];
      const cleanPrimary = normalizeProductAssetUrl(entry.primary);
      const entryAllowed =
        this.isProtectedManualOrAuditEntry(entry) ||
        (!isGenericOrPlaceholderImageUrl(cleanPrimary) &&
          !isMismatchedProductImageUrl(cleanPrimary, product.title, product.category));
      if (entryAllowed) {
        return [cleanPrimary, ...rawImages.slice(1).filter(u => !this.isPlaceholderOverrideUrl(u) && u !== cleanPrimary)];
      }
    }

    // Apply URL replacements, category override, or global override
    return rawImages.map((imgUrl, idx) => {
      return this.resolveImageSrc({
        src: imgUrl,
        productId: product.id,
        productTitle: product.title,
        category: product.category,
        imageIndex: idx
      }) || imgUrl;
    });
  }

  /**
   * Returns a new array of products with all active image overrides applied
   */
  public applyOverridesToProductList<T extends Partial<Product> & { image?: string }>(products: T[]): T[] {
    if (!Array.isArray(products)) return [];
    const usedPrimaryUrls = new Set<string>();
    return products.map(prod => {
      const resolvedImages = this.resolveProductImages(prod);
      let primary = resolvedImages[0] || '';
      const normPrimary = primary.split('?')[0];
      const hasManual = this.isManualOverride(prod.id, prod.title);
      const cleanId = String(prod?.id || '').trim();
      const override = cleanId ? (this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()]) : undefined;
      const activityTs = Math.max(
        this.productActivityMap.get(cleanId) || 0,
        this.parseTimestampMs(override?.imageUpdatedAt),
        this.parseTimestampMs(prod.imageUpdatedAt)
      );
      const timestampPatch = activityTs > 0 ? { imageUpdatedAt: activityTs } : {};

      if (!hasManual && normPrimary && usedPrimaryUrls.has(normPrimary) && resolvedImages.length > 1) {
        const alt = resolvedImages.find(u => {
          const norm = String(u || '').split('?')[0];
          return norm && !usedPrimaryUrls.has(norm) && !this.isPlaceholderOverrideUrl(norm);
        });
        if (alt) {
          primary = alt;
          const reordered = [alt, ...resolvedImages.filter(u => u !== alt)];
          usedPrimaryUrls.add(alt.split('?')[0]);
          return {
            ...prod,
            ...timestampPatch,
            image: alt,
            images: reordered
          };
        }
      }
      if (normPrimary) usedPrimaryUrls.add(normPrimary);
      return {
        ...prod,
        ...timestampPatch,
        image: primary || resolvedImages[0],
        images: resolvedImages
      };
    });
  }

  /**
   * Computes recency tier and numeric timestamp (ms) so newly added products and products
   * with recently updated/uploaded images always sort first (descending by most recent activity).
   */
  public getLatestUploadedRank(
    product: Partial<Product> & { image?: string; createdAt?: number | string; updatedAt?: number | string; imageUpdatedAt?: number }
  ): { tier: number; timestampMs: number } {
    const cleanId = String(product?.id || '').trim();
    const cleanTitle = String(product?.title || '').trim();
    const override =
      (cleanId && (this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()])) ||
      (cleanTitle && (this.state.overrides[cleanTitle] || this.state.overrides[cleanTitle.toLowerCase()])) ||
      undefined;

    const activityMapTs =
      (cleanId && (this.productActivityMap.get(cleanId) || this.state.productActivityTimestamps?.[cleanId])) || 0;

    const overrideNumericTs = this.parseTimestampMs(override?.imageUpdatedAt);
    const overrideIsoTs = this.parseTimestampMs(override?.updatedAt);
    const updater = String(override?.updatedBy || '').toLowerCase();
    const isBaselineSeed =
      updater === 'verified-real-photos-v7' ||
      updater === 'auto-site-upload' ||
      override?.updatedAt === '2024-01-01T00:00:00.000Z';

    const overrideActivityTs =
      overrideNumericTs > 0
        ? overrideNumericTs
        : !isBaselineSeed &&
            (updater === 'admin-manual' || updater === 'user-upload' || updater === 'catalog-image-auditor')
          ? overrideIsoTs
          : 0;

    let idDerivedCreatedTs = 0;
    const idTsMatch = cleanId.match(/^(?:prod|custom|seller|onboard)[-_](\d{13})(?:$|[-_])/i);
    if (idTsMatch) {
      const parsed = Number(idTsMatch[1]);
      if (Number.isFinite(parsed) && parsed > 1700000000000) {
        idDerivedCreatedTs = parsed;
      }
    }

    const productActivityTs = Math.max(
      this.parseTimestampMs(product?.imageUpdatedAt),
      this.parseTimestampMs(product?.updatedAt),
      this.parseTimestampMs(product?.createdAt),
      idDerivedCreatedTs
    );

    const bestActivityTs = Math.max(activityMapTs, overrideActivityTs, productActivityTs);

    if (bestActivityTs > 0) {
      return {
        tier: 2,
        timestampMs: bestActivityTs
      };
    }

    return { tier: 0, timestampMs: 0 };
  }

  /**
   * Returns a new list with newly added products and products with recently updated images sorted first
   * (descending by imageUpdatedAt / createdAt / updatedAt), followed by remaining catalog items in normal order.
   */
  public sortProductsLatestUploadedFirst<
    T extends Partial<Product> & { image?: string; createdAt?: number | string; updatedAt?: number | string; imageUpdatedAt?: number }
  >(products: T[], extraScoreFn?: (prod: T) => number): T[] {
    if (!Array.isArray(products) || products.length <= 1) {
      return Array.isArray(products) ? [...products] : [];
    }
    const indexMap = new Map<T, number>();
    const rankMap = new Map<T, { tier: number; timestampMs: number; extra: number }>();
    products.forEach((p, idx) => {
      indexMap.set(p, idx);
      const r = this.getLatestUploadedRank(p);
      rankMap.set(p, {
        tier: r.tier,
        timestampMs: r.timestampMs,
        extra: extraScoreFn ? extraScoreFn(p) : 0
      });
    });

    return [...products].sort((a, b) => {
      const ra = rankMap.get(a)!;
      const rb = rankMap.get(b)!;
      if (ra.tier !== rb.tier) return rb.tier - ra.tier;
      if (ra.tier > 0 && ra.timestampMs !== rb.timestampMs) {
        return rb.timestampMs - ra.timestampMs;
      }
      if (ra.extra !== rb.extra) return rb.extra - ra.extra;
      if (ra.timestampMs !== rb.timestampMs) return rb.timestampMs - ra.timestampMs;
      return (indexMap.get(a) ?? 0) - (indexMap.get(b) ?? 0);
    });
  }

  /**
   * Returns true if any filter (grayscale, sepia, brightness, contrast) differs from default.
   */
  public hasActiveFilters(filters?: Partial<ImageEditFilters>): boolean {
    if (!filters) return false;
    const g = filters.grayscale ?? 0;
    const s = filters.sepia ?? 0;
    const b = filters.brightness ?? 100;
    const c = filters.contrast ?? 100;
    return g > 0 || s > 0 || b !== 100 || c !== 100;
  }

  /**
   * Builds a standard CSS / Canvas 2D filter string for grayscale, sepia, brightness, and contrast.
   */
  public buildCssFilterString(filters?: Partial<ImageEditFilters>): string {
    if (!this.hasActiveFilters(filters)) return 'none';
    const g = Math.max(0, Math.min(100, filters?.grayscale ?? 0));
    const s = Math.max(0, Math.min(100, filters?.sepia ?? 0));
    const b = Math.max(40, Math.min(200, filters?.brightness ?? 100));
    const c = Math.max(40, Math.min(200, filters?.contrast ?? 100));
    return `brightness(${b}%) contrast(${c}%) grayscale(${g}%) sepia(${s}%)`;
  }

  /**
   * Returns a compact human-readable label summarizing active filters (e.g., "Grayscale 100% · B:110%").
   */
  public formatFilterSummary(filters?: Partial<ImageEditFilters>): string {
    if (!this.hasActiveFilters(filters)) return '';
    const parts: string[] = [];
    if ((filters?.grayscale ?? 0) > 0) parts.push(`Gray ${filters!.grayscale}%`);
    if ((filters?.sepia ?? 0) > 0) parts.push(`Sepia ${filters!.sepia}%`);
    if ((filters?.brightness ?? 100) !== 100) parts.push(`B:${filters!.brightness}%`);
    if ((filters?.contrast ?? 100) !== 100) parts.push(`C:${filters!.contrast}%`);
    return parts.join(' · ');
  }

  /**
   * Rotates any image source (File, Blob URL, DataURL, or path) by 90-degree increments
   * and optionally applies filters, returning the processed DataURL and a File object.
   */
  public async rotateImageSource(
    source: File | string,
    deltaDegrees: number,
    fileNameHint = 'rotated-product-image.png',
    filters?: Partial<ImageEditFilters>
  ): Promise<{ dataUrl: string; file: File }> {
    const normalizedRotation = (((Math.round(deltaDegrees / 90) * 90) % 360) + 360) % 360;
    const cssFilter = this.buildCssFilterString(filters);
    const srcUrl =
      typeof source === 'string'
        ? source
        : await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = () => rej(new Error('Failed to read image file for rotation'));
            r.readAsDataURL(source);
          });

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width || 800;
          const height = img.naturalHeight || img.height || 800;
          const swapDims = normalizedRotation === 90 || normalizedRotation === 270;

          const canvas = document.createElement('canvas');
          canvas.width = swapDims ? height : width;
          canvas.height = swapDims ? width : height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.save();
            if (cssFilter !== 'none') {
              ctx.filter = cssFilter;
            }
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((normalizedRotation * Math.PI) / 180);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
          }

          const mimeType =
            typeof source !== 'string' && source.type && source.type.startsWith('image/')
              ? source.type
              : 'image/png';
          const rotatedDataUrl = canvas.toDataURL(mimeType, 1.0);

          // Convert DataURL back to a File object for seamless staging & bulk upload
          const arr = rotatedDataUrl.split(',');
          const bstr = atob(arr[1] || '');
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const finalFileName = typeof source !== 'string' ? source.name : fileNameHint;
          const rotatedFile = new File([u8arr], finalFileName, { type: mimeType });

          resolve({ dataUrl: rotatedDataUrl, file: rotatedFile });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for rotation'));
      img.src = srcUrl;
    });
  }

  /**
   * Converts a DataURL into a File object for staging in bulk uploaders.
   */
  public dataUrlToFile(dataUrl: string, fileName = 'edited-image.jpg'): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1] || '');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }

  /**
   * Converts any image File (PNG, WEBP, AVIF, GIF, BMP, SVG, JPG, etc.) into the requested format
   * (e.g., standard high-res JPG or PNG or WEBP or original) and returns its DataURL.
   * When `autoWebpLossless` is enabled, forces WebP conversion at quality = 1.0 (lossless WebP).
   * Also supports rotating the image by 90-degree increments (`rotationDegrees`: 0, 90, 180, 270)
   * and applying filters (`grayscale`, `sepia`, `brightness`, `contrast`) before saving.
   */
  public async convertImageFile(
    file: File,
    targetFormat: OutputImageFormat = 'webp',
    quality = 0.85,
    maxDimension = 1400,
    autoWebpLossless = false,
    rotationDegrees = 0,
    filters?: Partial<ImageEditFilters>
  ): Promise<{
    dataUrl: string;
    mimeType: string;
    extension: string;
    fileName: string;
    sizeBytes: number;
    originalSizeBytes: number;
    losslessCompression: boolean;
  }> {
    const effectiveTargetFormat: OutputImageFormat = autoWebpLossless ? 'webp' : targetFormat;
    const effectiveQuality = autoWebpLossless ? 1.0 : quality;
    const normalizedRotation = (((Math.round(rotationDegrees / 90) * 90) % 360) + 360) % 360;
    const hasFilters = this.hasActiveFilters(filters);
    const cssFilter = this.buildCssFilterString(filters);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = () => {
        const rawDataUrl = reader.result as string;
        const origExt = (file.name.split('.').pop() || 'jpg').toLowerCase();

        // If user selected 'original' (and not autoWebpLossless and no rotation or filters) and file is <= 4MB in a web-safe format, keep raw DataURL directly
        const isWebSafeOriginal =
          ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(origExt) ||
          /image\/(jpeg|jpg|png|webp|svg\+xml|gif)/i.test(file.type || '');
        if (
          !autoWebpLossless &&
          normalizedRotation === 0 &&
          !hasFilters &&
          effectiveTargetFormat === 'original' &&
          isWebSafeOriginal &&
          file.size <= 4 * 1024 * 1024
        ) {
          return resolve({
            dataUrl: rawDataUrl,
            mimeType:
              file.type ||
              (origExt === 'svg'
                ? 'image/svg+xml'
                : origExt === 'png'
                  ? 'image/png'
                  : origExt === 'webp'
                    ? 'image/webp'
                    : origExt === 'gif'
                      ? 'image/gif'
                      : 'image/jpeg'),
            extension: origExt === 'jpeg' ? 'jpg' : origExt,
            fileName: file.name,
            sizeBytes: file.size,
            originalSizeBytes: file.size,
            losslessCompression: origExt === 'png' || origExt === 'webp'
          });
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            let width = img.naturalWidth || img.width || 800;
            let height = img.naturalHeight || img.height || 800;

            if (width > maxDimension || height > maxDimension) {
              if (width >= height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const swapDimensions = normalizedRotation === 90 || normalizedRotation === 270;
            const canvas = document.createElement('canvas');
            canvas.width = swapDimensions ? height : width;
            canvas.height = swapDimensions ? width : height;
            const ctx = canvas.getContext('2d');

            const finalFormat = autoWebpLossless
              ? 'webp'
              : effectiveTargetFormat === 'original'
                ? (['png', 'webp'].includes(origExt) ? origExt : 'jpg')
                : effectiveTargetFormat;

            const outputMime =
              finalFormat === 'png'
                ? 'image/png'
                : finalFormat === 'webp'
                  ? 'image/webp'
                  : 'image/jpeg';

            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              // Fill white background only when converting transparent PNG/WEBP/SVG to JPG
              if (outputMime === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
              ctx.save();
              if (cssFilter !== 'none') {
                ctx.filter = cssFilter;
              }
              if (normalizedRotation !== 0) {
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((normalizedRotation * Math.PI) / 180);
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
              } else {
                ctx.drawImage(img, 0, 0, width, height);
              }
              ctx.restore();
            }

            const convertedDataUrl = canvas.toDataURL(outputMime, effectiveQuality);
            const base64Payload = convertedDataUrl.split(',')[1] || '';
            const estimatedBytes = base64Payload
              ? Math.round((base64Payload.length * 3) / 4)
              : file.size;
            const baseFileName = file.name.replace(/\.[^/.]+$/, '');
            resolve({
              dataUrl: convertedDataUrl,
              mimeType: outputMime,
              extension: finalFormat,
              fileName: `${baseFileName}.${finalFormat}`,
              sizeBytes: estimatedBytes,
              originalSizeBytes: file.size,
              losslessCompression: Boolean(autoWebpLossless || finalFormat === 'png' || effectiveQuality >= 1.0)
            });
          } catch {
            // Fallback to original data URL if canvas fails
            resolve({
              dataUrl: rawDataUrl,
              mimeType: autoWebpLossless ? 'image/webp' : (file.type || 'image/jpeg'),
              extension: autoWebpLossless ? 'webp' : (origExt === 'jpeg' ? 'jpg' : origExt),
              fileName: autoWebpLossless ? `${file.name.replace(/\.[^/.]+$/, '')}.webp` : file.name,
              sizeBytes: file.size,
              originalSizeBytes: file.size,
              losslessCompression: autoWebpLossless
            });
          }
        };
        img.onerror = () => {
          // Even if browser Image element can't decode an exotic format, still preserve raw DataURL
          resolve({
            dataUrl: rawDataUrl,
            mimeType: autoWebpLossless ? 'image/webp' : (file.type || 'image/jpeg'),
            extension: autoWebpLossless ? 'webp' : (origExt === 'jpeg' ? 'jpg' : origExt),
            fileName: autoWebpLossless ? `${file.name.replace(/\.[^/.]+$/, '')}.webp` : file.name,
            sizeBytes: file.size,
            originalSizeBytes: file.size,
            losslessCompression: autoWebpLossless
          });
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Processes an uploaded File (in JPG or any format), optionally rotates by 90-degree increments,
   * applies image filters (grayscale, sepia, brightness, contrast), and converts to WebP with lossless compression,
   * uploads it to the Express backend (/public/assets/uploads/...), adds it to the Media Library, and assigns it.
   */
  public async uploadAndAssignImageFile(
    file: File,
    options?: {
      targetFormat?: OutputImageFormat;
      quality?: number;
      autoWebpLossless?: boolean;
      rotationDegrees?: number;
      filters?: Partial<ImageEditFilters>;
      productId?: string;
      productIds?: string[];
      productName?: string;
      category?: string;
      applyToAll?: boolean;
      oldUrlToReplace?: string;
      appendToGallery?: boolean;
    }
  ): Promise<{
    url: string;
    format: string;
    name: string;
    sizeBytes: number;
    originalSizeBytes: number;
    losslessCompression: boolean;
  }> {
    const useWebpLossless = Boolean(options?.autoWebpLossless);
    const targetFormat: OutputImageFormat = useWebpLossless ? 'webp' : (options?.targetFormat || 'webp');
    const quality = useWebpLossless ? 1.0 : (options?.quality ?? 0.85);
    const rotationDegrees = options?.rotationDegrees ?? 0;

    this.beginWrite();
    try {
      const converted = await this.convertImageFile(
        file,
        targetFormat,
        quality,
        1400,
        useWebpLossless,
        rotationDegrees,
        options?.filters
      );

      let finalUrl = converted.dataUrl;
      let finalFormat = converted.extension.toUpperCase();
      let finalName = converted.fileName;
      let finalSizeBytes = converted.sizeBytes;
      let uploadedToServer = false;
      const cleanOldUrl = options?.oldUrlToReplace ? this.stripLocalAssetQuery(options.oldUrlToReplace) : undefined;

      const uploadPayload = {
        fileName: converted.fileName,
        mimeType: converted.mimeType,
        base64Data: converted.dataUrl,
        targetFormat: converted.extension,
        autoWebpLossless: useWebpLossless,
        losslessCompression: converted.losslessCompression,
        originalSizeBytes: converted.originalSizeBytes,
        productId: options?.appendToGallery ? undefined : options?.productId,
        productIds: options?.productIds,
        productName: options?.productName,
        category: options?.category,
        applyToAll: options?.applyToAll,
        oldUrlToReplace: cleanOldUrl,
        updatedBy: 'admin-manual'
      };

      let explicitServerError = '';
      let shouldTryPhpFallback = false;
      let deletedOldUrls: string[] = [];
      const uploadVersionTs = Date.now();
      try {
        const response = await fetch('/api/v1/admin/upload-product-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadPayload)
        });

        const data = await response.json().catch(() => null);
        if (response.ok && data?.success && data?.url) {
          finalUrl = this.withFreshCacheBuster(data.url, uploadVersionTs);
          uploadedToServer = true;
          if (Array.isArray(data.deletedOldUrls)) {
            deletedOldUrls = data.deletedOldUrls;
          }
          if (data.mediaEntry) {
            finalName = data.mediaEntry.name || finalName;
            finalFormat = data.mediaEntry.format || finalFormat;
            if (typeof data.mediaEntry.sizeBytes === 'number') {
              finalSizeBytes = data.mediaEntry.sizeBytes;
            }
          }
        } else if (response.status === 404) {
          shouldTryPhpFallback = true;
        } else {
          explicitServerError =
            (data?.message ? String(data.message) : '') ||
            (response.status === 413
              ? 'Selected image file is too large for server upload. Please choose a smaller image.'
              : `Server upload failed (HTTP ${response.status}).`);
        }
      } catch (err: any) {
        shouldTryPhpFallback = true;
        console.warn('[ProductImageManagerService] Primary upload endpoint fallback:', err);
      }

      // Fallback to PHP endpoint only on 404 / network error (cPanel / BigRock deployment)
      if (!uploadedToServer && shouldTryPhpFallback) {
        try {
          const phpRes = await fetch('/api.php?action=upload_product_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(uploadPayload)
          });
          const phpData = await phpRes.json().catch(() => null);
          if (phpRes.ok && phpData?.success && phpData?.url) {
            finalUrl = this.withFreshCacheBuster(phpData.url, uploadVersionTs);
            uploadedToServer = true;
            if (Array.isArray(phpData.deletedOldUrls)) {
              deletedOldUrls = phpData.deletedOldUrls;
            }
            if (phpData.mediaEntry) {
              finalName = phpData.mediaEntry.name || finalName;
              finalFormat = phpData.mediaEntry.format || finalFormat;
              if (typeof phpData.mediaEntry.sizeBytes === 'number') {
                finalSizeBytes = phpData.mediaEntry.sizeBytes;
              }
            }
          } else if (!explicitServerError) {
            explicitServerError =
              (phpData?.message ? String(phpData.message) : '') ||
              `Upload failed (HTTP ${phpRes.status}).`;
          }
        } catch (phpErr: any) {
          if (!explicitServerError) {
            explicitServerError = phpErr?.message || 'Network error while uploading image to server.';
          }
        }
      }

      if (!uploadedToServer) {
        throw new Error(
          explicitServerError || 'Image could not be uploaded to the server media library. Please try again.'
        );
      }

      // Prune any old server-deleted files from in-memory media library
      this.pruneDeletedUrlsFromMemory(deletedOldUrls);
      const deletedBaseSet = new Set(deletedOldUrls.map(u => String(u).trim().split('?')[0]));
      const finalBaseUrl = finalUrl.split('?')[0];

      // Record in local media library
      const mediaItem: MediaLibraryItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: finalUrl,
        name: finalName,
        format: finalFormat,
        sizeBytes: finalSizeBytes,
        originalSizeBytes: converted.originalSizeBytes,
        losslessCompression: converted.losslessCompression,
        uploadedAt: new Date().toISOString()
      };

      this.state.mediaLibrary = [
        mediaItem,
        ...this.state.mediaLibrary.filter(m => m?.url && m.url.split('?')[0] !== finalBaseUrl)
      ];

      // Apply requested assignments locally in memory as well
      const activityTs = Date.now();
      const nowIso = new Date(activityTs).toISOString();
      if (options?.applyToAll) {
        this.state.globalDefaultImage = finalUrl;
      }
      // Only set categoryOverrides when explicitly updating a category without targeting specific product(s)
      if (
        options?.category &&
        !options?.productId &&
        !(Array.isArray(options?.productIds) && options.productIds.length > 0)
      ) {
        this.state.categoryOverrides[options.category] = finalUrl;
      }
      if (cleanOldUrl) {
        const cleanOldBase = cleanOldUrl.split('?')[0];
        this.state.urlReplacements[cleanOldUrl] = finalUrl;
        if (options?.oldUrlToReplace) {
          this.state.urlReplacements[options.oldUrlToReplace] = finalUrl;
        }
        // Also update any local overrides whose primary currently equals cleanOldUrl
        for (const [k, entry] of Object.entries(this.state.overrides)) {
          if (entry?.primary && entry.primary.split('?')[0] === cleanOldBase) {
            this.localMutationTimes.set(k, activityTs);
            const mergedOldUrls = Array.from(
              new Set([
                ...(Array.isArray(entry.replacedOldUrls) ? entry.replacedOldUrls : []),
                cleanOldBase
              ])
            ).filter(u => u && u !== finalBaseUrl);
            this.state.overrides[k] = {
              primary: finalUrl,
              gallery: [
                finalUrl,
                ...(entry.gallery || []).filter(u => {
                  const ub = String(u || '').split('?')[0];
                  return Boolean(ub) && ub !== cleanOldBase && ub !== finalBaseUrl && !deletedBaseSet.has(ub);
                })
              ],
              format: finalFormat,
              updatedAt: nowIso,
              imageUpdatedAt: activityTs,
              updatedBy: 'admin-manual',
              locked: true,
              serverVerified: true,
              verifiedAt: nowIso,
              ...(mergedOldUrls.length > 0 ? { replacedOldUrls: mergedOldUrls } : {})
            };
            this.recordProductActivityTimestamp(k, activityTs, false);
          }
        }
      }
      if (options?.productId) {
        const cleanPid = options.productId.trim();
        this.locallyDeletedIds.delete(cleanPid);
        this.localMutationTimes.set(cleanPid, activityTs);
        const existing = this.state.overrides[cleanPid];
        const prevPrimaryBase = existing?.primary ? existing.primary.split('?')[0] : '';
        const existingGallery =
          existing?.gallery && existing.gallery.length > 0
            ? existing.gallery
            : existing?.primary
              ? [existing.primary]
              : [];
        const isAppend = options?.appendToGallery === true && Boolean(existing?.primary);
        const primary = isAppend ? existing.primary : finalUrl;
        const gallery = isAppend
          ? [
              ...existingGallery.filter(u => {
                const ub = String(u || '').split('?')[0];
                return Boolean(ub) && ub !== finalBaseUrl && !deletedBaseSet.has(ub);
              }),
              finalUrl
            ]
          : [finalUrl];
        const replacedOldUrls = Array.from(
          new Set([
            ...(Array.isArray(existing?.replacedOldUrls) ? existing!.replacedOldUrls : []),
            ...(!isAppend && prevPrimaryBase && prevPrimaryBase !== finalBaseUrl ? [prevPrimaryBase] : []),
            ...deletedOldUrls.map(u => String(u).trim().split('?')[0])
          ])
        ).filter(u => u && u !== finalBaseUrl);

        this.state.overrides[cleanPid] = {
          primary,
          gallery,
          format: finalFormat,
          updatedAt: nowIso,
          imageUpdatedAt: activityTs,
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          verifiedAt: nowIso,
          ...(replacedOldUrls.length > 0 ? { replacedOldUrls } : {})
        };
        this.recordProductActivityTimestamp(cleanPid, activityTs, false);

        if (isAppend) {
          const appendBody = JSON.stringify({
            productId: cleanPid,
            primaryUrl: primary,
            galleryUrls: gallery,
            format: finalFormat,
            updatedBy: 'admin-manual'
          });
          try {
            const appendRes = await fetch('/api/v1/admin/product-images', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: appendBody
            });
            if (!appendRes.ok) throw new Error('Primary endpoint non-200');
          } catch {
            await fetch('/api.php?action=set_product_images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: appendBody
            }).catch(() => {});
          }
        }
      }
      if (Array.isArray(options?.productIds)) {
        for (const rawPid of options!.productIds) {
          const pid = rawPid?.trim();
          if (!pid) continue;
          this.locallyDeletedIds.delete(pid);
          this.localMutationTimes.set(pid, activityTs);
          const existing = this.state.overrides[pid];
          const prevBase = existing?.primary ? existing.primary.split('?')[0] : '';
          const gallery = existing?.gallery
            ? [
                finalUrl,
                ...existing.gallery.filter(u => {
                  const ub = String(u || '').split('?')[0];
                  return Boolean(ub) && ub !== finalBaseUrl && ub !== prevBase && !deletedBaseSet.has(ub);
                })
              ]
            : [finalUrl];
          this.state.overrides[pid] = {
            primary: finalUrl,
            gallery,
            format: finalFormat,
            updatedAt: nowIso,
            imageUpdatedAt: activityTs,
            updatedBy: 'admin-manual'
          };
          this.recordProductActivityTimestamp(pid, activityTs, false);
        }
      }

      // Automatically run B2B & Export SEO optimization on the uploaded image and its assigned product(s)
      try {
        autoSeoEngine.autoOptimizeImageUpload({
          imageId: mediaItem.id,
          imageUrl: finalUrl,
          fileName: finalName,
          productId: options?.productId || (options?.productIds && options.productIds[0]) || undefined,
          category: options?.category || 'Global B2B Export'
        });
        if (Array.isArray(options?.productIds)) {
          for (const pid of options!.productIds) {
            if (pid) {
              autoSeoEngine.autoOptimizeImageUpload({
                imageId: `${mediaItem.id}-${pid}`,
                imageUrl: finalUrl,
                fileName: finalName,
                productId: pid,
                category: options?.category || 'Global B2B Export'
              });
            }
          }
        }
      } catch {}

      this.saveToLocalStorage({ productId: options?.productId, url: finalUrl, action: 'upload_and_assign' });
      this.notifyListeners();

      dispatchNotification(
        'UPLOAD',
        'Product Image Uploaded',
        `Uploaded "${finalName}" (${finalFormat}, ${(finalSizeBytes / 1024).toFixed(1)} KB) and assigned to catalog.`,
        'admin'
      );

      if (options?.productId) {
        void this.logAndVerifyUploadPropagation({
          targetId: options.productId,
          targetType: 'PRODUCT',
          expectedUrl: finalUrl,
          deletedOldUrls,
          source: 'uploadAndAssignImageFile'
        });
      }

      return {
        url: finalUrl,
        format: finalFormat,
        name: finalName,
        sizeBytes: finalSizeBytes,
        originalSizeBytes: converted.originalSizeBytes,
        losslessCompression: converted.losslessCompression
      };
    } finally {
      this.endWrite();
    }
  }

  /**
   * Intelligently matches an image filename to an existing Product ID or title.
   */
  public matchFileToProduct(
    fileName: string,
    products: Product[]
  ): { productId: string; confidence: 'exact-id' | 'partial-id' | 'title-match' | 'none' } {
    if (!fileName || !Array.isArray(products) || products.length === 0) {
      return { productId: '', confidence: 'none' };
    }
    const baseName = fileName.replace(/\.[^/.]+$/, '').trim();
    const normalized = baseName.toLowerCase().replace(/[\s_]+/g, '-');
    const compact = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Exact Product ID match
    for (const p of products) {
      const pid = (p.id || '').toLowerCase();
      if (pid && (pid === normalized || pid === baseName.toLowerCase() || pid.replace(/[^a-z0-9]/g, '') === compact)) {
        return { productId: p.id, confidence: 'exact-id' };
      }
    }

    // 2. Filename starts with or contains exact Product ID token (e.g. "prod-104_front.jpg" or "p1_main.png")
    const sortedByIdLength = [...products].sort((a, b) => (b.id?.length || 0) - (a.id?.length || 0));
    for (const p of sortedByIdLength) {
      const pid = (p.id || '').toLowerCase();
      if (!pid) continue;
      const escapedPid = pid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const boundaryRegex = new RegExp(`(^|[^a-z0-9])${escapedPid}($|[^a-z0-9])`, 'i');
      if (boundaryRegex.test(normalized) || boundaryRegex.test(baseName.toLowerCase())) {
        return { productId: p.id, confidence: 'partial-id' };
      }
    }

    // 3. Numeric suffix match if filename is a number or "product-12" matching "p12" / "prod-12" / "12"
    const numMatch = normalized.match(/(?:^|prod-|product-|id-|item-|sku-|p-)(\d+)(?:$|[^0-9])/);
    if (numMatch) {
      const numStr = numMatch[1];
      const matchedNumericProd = products.find(p => {
        const pid = (p.id || '').toLowerCase();
        return pid === numStr || pid === `prod-${numStr}` || pid === `p-${numStr}` || pid === `p${numStr}` || pid.endsWith(`-${numStr}`);
      });
      if (matchedNumericProd) {
        return { productId: matchedNumericProd.id, confidence: 'partial-id' };
      }
    }

    // 4. Title keyword overlap match
    const tokens = normalized
      .split(/[^a-z0-9]+/)
      .filter(t => t.length >= 3 && !['img', 'image', 'photo', 'pic', 'product', 'final', 'new', 'copy'].includes(t));

    if (tokens.length > 0) {
      let bestProduct: Product | null = null;
      let bestScore = 0;
      for (const p of products) {
        const titleLower = (p.title || '').toLowerCase();
        let score = 0;
        for (const tok of tokens) {
          if (titleLower.includes(tok)) score += tok.length;
        }
        if (score > bestScore) {
          bestScore = score;
          bestProduct = p;
        }
      }
      if (bestProduct && bestScore >= 4) {
        return { productId: bestProduct.id, confidence: 'title-match' };
      }
    }

    return { productId: '', confidence: 'none' };
  }

  /**
   * Upload a DataURL (e.g. from ImageEditingOverlay crop/studio editor) and assign it
   */
  public async uploadDataUrlAndAssign(
    dataUrl: string,
    fileName = 'edited-product-image.jpg',
    options?: {
      productId?: string;
      productIds?: string[];
      category?: string;
      applyToAll?: boolean;
    }
  ): Promise<string> {
    this.beginWrite();
    try {
      let finalUrl = dataUrl;
      const payload = JSON.stringify({
        fileName,
        mimeType: 'image/jpeg',
        base64Data: dataUrl,
        targetFormat: 'jpg',
        productId: options?.productId,
        productIds: options?.productIds,
        category: options?.category,
        applyToAll: options?.applyToAll,
        updatedBy: 'admin-manual'
      });

      let uploadedMediaEntry: MediaLibraryItem | null = null;
      let uploadErr = '';
      let shouldTryPhpFallback = false;
      let deletedOldUrls: string[] = [];
      const versionTs = Date.now();

      try {
        const response = await fetch('/api/v1/admin/upload-product-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        const resJson = await response.json().catch(() => null);
        if (response.ok && resJson?.success && resJson?.url) {
          finalUrl = this.withFreshCacheBuster(resJson.url, versionTs);
          if (resJson.mediaEntry) uploadedMediaEntry = { ...resJson.mediaEntry, url: finalUrl };
          if (Array.isArray(resJson.deletedOldUrls)) deletedOldUrls = resJson.deletedOldUrls;
        } else if (response.status === 404) {
          shouldTryPhpFallback = true;
        } else {
          uploadErr = resJson?.message || `Server upload failed (HTTP ${response.status}).`;
        }
      } catch (err: any) {
        shouldTryPhpFallback = true;
        uploadErr = err?.message || 'Network error uploading edited image.';
      }

      if (finalUrl === dataUrl && shouldTryPhpFallback) {
        try {
          const phpRes = await fetch('/api.php?action=upload_product_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          });
          const phpJson = await phpRes.json().catch(() => null);
          if (phpRes.ok && phpJson?.success && phpJson?.url) {
            finalUrl = this.withFreshCacheBuster(phpJson.url, versionTs);
            if (phpJson.mediaEntry) uploadedMediaEntry = { ...phpJson.mediaEntry, url: finalUrl };
            if (Array.isArray(phpJson.deletedOldUrls)) deletedOldUrls = phpJson.deletedOldUrls;
          } else {
            uploadErr = phpJson?.message || `Upload failed (HTTP ${phpRes.status}).`;
          }
        } catch {}
      }

      if (finalUrl === dataUrl || finalUrl.startsWith('data:')) {
        throw new Error(uploadErr || 'Failed to persist edited image onto server storage.');
      }

      this.pruneDeletedUrlsFromMemory(deletedOldUrls);

      const mediaItem: MediaLibraryItem = uploadedMediaEntry || {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: finalUrl,
        name: fileName,
        format: this.detectFormatFromUrl(finalUrl),
        sizeBytes: 0,
        uploadedAt: new Date().toISOString()
      };
      this.state.mediaLibrary = [
        mediaItem,
        ...this.state.mediaLibrary.filter(m => m?.url && m.url.split('?')[0] !== finalUrl.split('?')[0])
      ];

      if (options?.productId) {
        await this.setProductImage(options.productId, finalUrl);
      } else if (options?.productIds && options.productIds.length > 0) {
        await this.setBulkProductImages(options.productIds, finalUrl);
      } else if (options?.category) {
        await this.setCategoryImage(options.category, finalUrl);
      } else if (options?.applyToAll) {
        await this.setAllProductsImage(finalUrl);
      }

      dispatchNotification(
        'EDIT',
        'Image Edited & Synced',
        `Saved modified image "${fileName}" to catalog.`,
        'admin'
      );

      return finalUrl;
    } finally {
      this.endWrite();
    }
  }

  /**
   * Set primary & gallery images for a single product
   */
  public async setProductImage(
    productId: string,
    primaryUrl: string,
    galleryUrls?: string[]
  ): Promise<void> {
    if (!productId || !primaryUrl) return;
    this.beginWrite();
    try {
      const cleanId = productId.trim();
      const versionTs = Date.now();
      const cleanPrimary = this.withFreshCacheBuster(primaryUrl, versionTs);
      const cleanPrimaryBase = cleanPrimary.split('?')[0];
      this.locallyDeletedIds.delete(cleanId);
      this.localMutationTimes.set(cleanId, versionTs);

      const existing = this.state.overrides[cleanId];
      const existingBase = existing?.primary ? existing.primary.split('?')[0] : '';
      const resolvedGallery = Array.isArray(galleryUrls) && galleryUrls.length > 0
        ? galleryUrls.map(u => normalizeProductAssetUrl(u)).filter(Boolean)
        : [cleanPrimary];

      const format = this.detectFormatFromUrl(cleanPrimary);
      const nowIso = new Date(versionTs).toISOString();
      const replacedOldUrls = Array.from(
        new Set([
          ...(Array.isArray(existing?.replacedOldUrls) ? existing!.replacedOldUrls : []),
          ...(existingBase && existingBase !== cleanPrimaryBase ? [existingBase] : []),
          ...(existing?.previousPrimary ? [existing.previousPrimary.split('?')[0]] : [])
        ])
      ).filter(u => u && u !== cleanPrimaryBase);

      this.state.overrides[cleanId] = {
        primary: cleanPrimary,
        gallery: resolvedGallery,
        format,
        updatedAt: nowIso,
        imageUpdatedAt: versionTs,
        updatedBy: 'admin-manual',
        locked: true,
        serverVerified: true,
        verifiedAt: nowIso,
        ...(replacedOldUrls.length > 0 ? { replacedOldUrls } : {})
      };
      this.recordProductActivityTimestamp(cleanId, versionTs, false);

      try {
        autoSeoEngine.autoOptimizeImageUpload({
          imageUrl: cleanPrimary,
          productId: cleanId,
          fileName: `product-${cleanId}.${format.toLowerCase()}`
        });
      } catch {}

      this.saveToLocalStorage({ productId: cleanId, url: cleanPrimary, gallery: resolvedGallery, action: 'set_product_image' });
      this.notifyListeners();

      dispatchNotification(
        'EDIT',
        'Product Image Set',
        `Assigned display image for product #${cleanId}.`,
        'admin'
      );

      const bodyStr = JSON.stringify({
        productId: cleanId,
        primaryUrl: cleanPrimary,
        galleryUrls: resolvedGallery,
        format,
        imageUpdatedAt: versionTs,
        updatedAt: nowIso,
        updatedBy: 'admin-manual',
        locked: true,
        serverVerified: true,
        verifiedAt: nowIso,
        replacedOldUrls
      });

      let primaryPersisted = false;
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        const resJson = await res.json().catch(() => null);
        if (res.ok && (resJson?.success === true || resJson?.status === 'success')) {
          primaryPersisted = true;
          if (Array.isArray(resJson?.deletedOldUrls) && resJson.deletedOldUrls.length > 0) {
            this.pruneDeletedUrlsFromMemory(resJson.deletedOldUrls);
            this.saveToLocalStorage({ productId: cleanId, url: cleanPrimary, gallery: resolvedGallery, action: 'prune_deleted_old_images' });
            this.notifyListeners();
          }
        }
      } catch {}
      if (!primaryPersisted) {
        await fetch('/api.php?action=set_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }

      void this.logAndVerifyUploadPropagation({
        targetId: cleanId,
        targetType: 'PRODUCT',
        expectedUrl: cleanPrimary,
        source: 'setProductImage'
      });
    } finally {
      this.endWrite();
    }
  }

  /**
   * Silently persists an auto-fetched / auto-mirrored image in client overrides + localStorage + IndexedDB
   * without triggering toast popups or SEO/email alerts.
   */
  public registerAutoSavedImage(params: {
    productId?: string;
    productTitle?: string;
    url: string;
    originalUrl?: string;
  }): void {
    if (this.inFlightWriteCount > 0) return;
    const rawUrl = normalizeProductAssetUrl(params.url);
    if (!rawUrl || this.isPlaceholderOverrideUrl(rawUrl)) return;
    const cleanUrl =
      rawUrl.startsWith('/assets/uploads/') || rawUrl.startsWith('/src/assets/')
        ? rawUrl.split('?')[0]
        : rawUrl;

    const keys = Array.from(
      new Set([params.productId?.trim(), params.productTitle?.trim()].filter((k): k is string => Boolean(k && k.length >= 2)))
    );
    if (keys.length === 0 && !params.originalUrl) return;

    const nowIso = new Date().toISOString();
    const format = this.detectFormatFromUrl(cleanUrl);
    let updated = false;

    for (const key of keys) {
      if (this.locallyDeletedIds.has(key)) continue;
      const mutatedAt = this.localMutationTimes.get(key) || 0;
      if (mutatedAt > 0 && Date.now() - mutatedAt < this.MANUAL_MUTATION_GRACE_MS) continue;
      const existing = this.state.overrides[key];
      if (this.isManualEntry(existing)) continue;
      const existingPrimary = existing?.primary || '';
      const existingIsSavedLocal =
        (existingPrimary.startsWith('/assets/uploads/') || existingPrimary.startsWith('/src/assets/')) &&
        !this.isPlaceholderOverrideUrl(existingPrimary);
      if (existingIsSavedLocal) continue;

      this.localMutationTimes.set(key, Date.now());
      this.state.overrides[key] = {
        primary: cleanUrl,
        gallery: [cleanUrl],
        format,
        updatedAt: nowIso,
        updatedBy: 'auto-site-upload'
      };
      updated = true;
    }

    if (params.originalUrl && /^https?:\/\//i.test(params.originalUrl) && cleanUrl.startsWith('/assets/uploads/')) {
      if (!this.state.urlReplacements[params.originalUrl] && this.state.urlReplacements[params.originalUrl] !== cleanUrl) {
        this.state.urlReplacements[params.originalUrl] = cleanUrl;
        updated = true;
      }
    }

    if (
      cleanUrl.startsWith('/assets/uploads/') &&
      !this.state.mediaLibrary.some(m => m.url === cleanUrl)
    ) {
      const fileName = cleanUrl.split('/').pop() || 'auto-product.webp';
      this.state.mediaLibrary = [
        {
          id: `media-${fileName}`,
          url: cleanUrl,
          name: fileName,
          format,
          uploadedAt: nowIso
        },
        ...this.state.mediaLibrary
      ];
      updated = true;
    }

    if (updated) {
      this.saveToLocalStorage({ productId: params.productId, url: cleanUrl, action: 'auto_save_image' });
    }
  }

  /**
   * Set primary image for multiple products in bulk
   */
  public async setBulkProductImages(
    productIds: string[],
    primaryUrl: string,
    galleryUrls?: string[]
  ): Promise<void> {
    if (!Array.isArray(productIds) || productIds.length === 0 || !primaryUrl) return;
    this.beginWrite();
    try {
      const nowMs = Date.now();
      const cleanPrimary = this.withFreshCacheBuster(primaryUrl, nowMs);
      const format = this.detectFormatFromUrl(cleanPrimary);
      const nowIso = new Date(nowMs).toISOString();

      for (const rawPid of productIds) {
        const pid = rawPid?.trim();
        if (!pid) continue;
        this.locallyDeletedIds.delete(pid);
        this.localMutationTimes.set(pid, nowMs);
        const existing = this.state.overrides[pid];
        const resolvedGallery = Array.isArray(galleryUrls) && galleryUrls.length > 0
          ? galleryUrls.map(u => normalizeProductAssetUrl(u)).filter(Boolean)
          : existing?.gallery
            ? [cleanPrimary, ...existing.gallery.map(u => normalizeProductAssetUrl(u)).filter(u => u && u !== cleanPrimary)]
            : [cleanPrimary];

        const cleanPrimaryBase = cleanPrimary.split('?')[0];
        const existingBase = existing?.primary ? existing.primary.split('?')[0] : '';
        const replacedOldUrls = Array.from(
          new Set([
            ...(Array.isArray(existing?.replacedOldUrls) ? existing!.replacedOldUrls : []),
            ...(existingBase && existingBase !== cleanPrimaryBase ? [existingBase] : [])
          ])
        ).filter(u => u && u !== cleanPrimaryBase);

        this.state.overrides[pid] = {
          primary: cleanPrimary,
          gallery: resolvedGallery,
          format,
          updatedAt: nowIso,
          imageUpdatedAt: nowMs,
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          verifiedAt: nowIso,
          ...(replacedOldUrls.length > 0 ? { replacedOldUrls } : {})
        };
        this.recordProductActivityTimestamp(pid, nowMs, false);
      }

      try {
        for (const pid of productIds.slice(0, 50)) {
          if (pid) {
            autoSeoEngine.autoOptimizeImageUpload({
              imageUrl: cleanPrimary,
              productId: pid,
              fileName: `bulk-product-${pid}.${format.toLowerCase()}`
            });
          }
        }
      } catch {}

      this.saveToLocalStorage({ url: cleanPrimary, action: 'set_bulk_product_images', details: { productIds } });
      this.notifyListeners();

      dispatchNotification(
        'EDIT',
        'Bulk Images Assigned',
        `Updated image across ${productIds.length} catalog items.`,
        'admin'
      );

      const bodyStr = JSON.stringify({
        productIds,
        primaryUrl: cleanPrimary,
        galleryUrls,
        format,
        imageUpdatedAt: nowMs,
        updatedAt: nowIso,
        updatedBy: 'admin-manual',
        locked: true,
        serverVerified: true,
        verifiedAt: nowIso
      });

      let bulkPersisted = false;
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        const resJson = await res.json().catch(() => null);
        if (res.ok && (resJson?.success === true || resJson?.status === 'success')) {
          bulkPersisted = true;
        }
      } catch {}
      if (!bulkPersisted) {
        await fetch('/api.php?action=set_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  /**
   * Set image for all products in a specific category
   */
  public async setCategoryImage(category: string, primaryUrl: string, matchingProductIds: string[] = []): Promise<void> {
    if (!category || !primaryUrl) return;
    this.beginWrite();
    try {
      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const cleanPrimary = this.withFreshCacheBuster(primaryUrl, nowMs);
      this.state.categoryOverrides[category] = cleanPrimary;

      if (matchingProductIds.length > 0) {
        const format = this.detectFormatFromUrl(cleanPrimary);
        for (const pid of matchingProductIds) {
          this.locallyDeletedIds.delete(pid);
          this.localMutationTimes.set(pid, nowMs);
          this.state.overrides[pid] = {
            primary: cleanPrimary,
            gallery: [cleanPrimary],
            format,
            updatedAt: nowIso,
            imageUpdatedAt: nowMs,
            updatedBy: 'admin-manual'
          };
          this.recordProductActivityTimestamp(pid, nowMs, false);
        }
      }

      this.saveToLocalStorage({ url: cleanPrimary, action: 'set_category_image', details: { category } });
      this.notifyListeners();

      dispatchNotification(
        'EDIT',
        'Category Image Set',
        `Assigned primary image for category "${category}".`,
        'admin'
      );

      const bodyStr = JSON.stringify({
        category,
        productIds: matchingProductIds,
        primaryUrl: cleanPrimary,
        imageUpdatedAt: nowMs,
        updatedAt: nowIso,
        updatedBy: 'admin-manual'
      });

      let catPersisted = false;
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        const resJson = await res.json().catch(() => null);
        if (res.ok && (resJson?.success === true || resJson?.status === 'success')) {
          catPersisted = true;
        }
      } catch {}
      if (!catPersisted) {
        await fetch('/api.php?action=set_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  /**
   * Set image for ALL listed products across the entire app
   */
  public async setAllProductsImage(primaryUrl: string, allProductIds: string[] = []): Promise<void> {
    if (!primaryUrl) return;
    this.beginWrite();
    try {
      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const cleanPrimary = this.withFreshCacheBuster(primaryUrl, nowMs);
      this.state.globalDefaultImage = cleanPrimary;

      if (allProductIds.length > 0) {
        const format = this.detectFormatFromUrl(cleanPrimary);
        for (const pid of allProductIds) {
          this.locallyDeletedIds.delete(pid);
          this.localMutationTimes.set(pid, nowMs);
          this.state.overrides[pid] = {
            primary: cleanPrimary,
            gallery: [cleanPrimary],
            format,
            updatedAt: nowIso,
            imageUpdatedAt: nowMs,
            updatedBy: 'admin-manual'
          };
          this.recordProductActivityTimestamp(pid, nowMs, false);
        }
      }

      this.saveToLocalStorage({ url: cleanPrimary, action: 'set_all_products_image' });
      this.notifyListeners();

      dispatchNotification(
        'EDIT',
        'Global Product Image Set',
        'Set global fallback image across all catalog products.',
        'admin'
      );

      const bodyStr = JSON.stringify({
        applyToAll: true,
        productIds: allProductIds,
        primaryUrl: cleanPrimary,
        imageUpdatedAt: nowMs,
        updatedAt: nowIso,
        updatedBy: 'admin-manual'
      });

      let allPersisted = false;
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        const resJson = await res.json().catch(() => null);
        if (res.ok && (resJson?.success === true || resJson?.status === 'success')) {
          allPersisted = true;
        }
      } catch {}
      if (!allPersisted) {
        await fetch('/api.php?action=set_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  /**
   * Replace a specific image URL everywhere it appears across all products
   */
  public async replaceImageUrlEverywhere(
    oldUrlToReplace: string,
    newUrl: string,
    matchingProductIds: string[] = []
  ): Promise<void> {
    if (!oldUrlToReplace || !newUrl) return;
    this.beginWrite();
    try {
      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const cleanOld = this.stripLocalAssetQuery(oldUrlToReplace);
      const cleanNew = this.withFreshCacheBuster(newUrl, nowMs);
      if (cleanOld) {
        this.state.urlReplacements[cleanOld] = cleanNew;
      }
      this.state.urlReplacements[oldUrlToReplace] = cleanNew;

      const format = this.detectFormatFromUrl(cleanNew);

      // Update any existing local overrides matching cleanOld
      for (const [k, entry] of Object.entries(this.state.overrides)) {
        if (entry?.primary && this.stripLocalAssetQuery(entry.primary) === cleanOld) {
          this.localMutationTimes.set(k, nowMs);
          this.state.overrides[k] = {
            ...entry,
            primary: cleanNew,
            gallery: [cleanNew, ...(entry.gallery || []).filter(u => u && this.stripLocalAssetQuery(u) !== cleanOld && u !== cleanNew)],
            format,
            updatedAt: nowIso,
            imageUpdatedAt: nowMs,
            updatedBy: 'admin-manual'
          };
          this.recordProductActivityTimestamp(k, nowMs, false);
        }
      }

      if (matchingProductIds.length > 0) {
        for (const pid of matchingProductIds) {
          this.locallyDeletedIds.delete(pid);
          this.localMutationTimes.set(pid, nowMs);
          this.state.overrides[pid] = {
            primary: cleanNew,
            gallery: [cleanNew],
            format,
            updatedAt: nowIso,
            imageUpdatedAt: nowMs,
            updatedBy: 'admin-manual'
          };
          this.recordProductActivityTimestamp(pid, nowMs, false);
        }
      }

      this.saveToLocalStorage({ url: cleanNew, action: 'replace_image_url', details: { oldUrl: cleanOld || oldUrlToReplace } });
      this.notifyListeners();

      dispatchNotification(
        'EDIT',
        'Image Replaced Everywhere',
        'Replaced asset URL across all product occurrences.',
        'admin'
      );

      const bodyStr = JSON.stringify({
        oldUrlToReplace: cleanOld || oldUrlToReplace,
        productIds: matchingProductIds,
        primaryUrl: cleanNew,
        imageUpdatedAt: nowMs,
        updatedAt: nowIso,
        updatedBy: 'admin-manual'
      });

      let replacePersisted = false;
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        const resJson = await res.json().catch(() => null);
        if (res.ok && (resJson?.success === true || resJson?.status === 'success')) {
          replacePersisted = true;
        }
      } catch {}
      if (!replacePersisted) {
        await fetch('/api.php?action=set_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  /**
   * Reset a single product's image back to its catalog default
   */
  public async resetProductImage(productId: string): Promise<void> {
    if (!productId) return;
    this.beginWrite();
    try {
      const cleanId = productId.trim();
      this.locallyDeletedIds.add(cleanId);
      delete this.state.overrides[cleanId];
      this.saveToLocalStorage({ productId: cleanId, action: 'reset_product_image' });
      this.notifyListeners();

      dispatchNotification(
        'DELETE',
        'Product Image Override Reset',
        `Reset custom image override for product #${cleanId}.`,
        'admin'
      );

      const bodyStr = JSON.stringify({ productId: cleanId });
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        if (!res.ok) throw new Error('Primary endpoint non-200');
      } catch {
        await fetch('/api.php?action=delete_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  /**
   * Bulk-delete product image associations for multiple Product IDs
   */
  public async deleteBulkProductImageAssociations(
    productIds: string[],
    productTitles: string[] = []
  ): Promise<void> {
    if (!Array.isArray(productIds) || productIds.length === 0) return;
    this.beginWrite();
    try {
      for (const pid of productIds) {
        if (pid) {
          this.locallyDeletedIds.add(pid.trim());
          delete this.state.overrides[pid.trim()];
        }
      }
      for (const title of productTitles) {
        if (title) {
          this.locallyDeletedIds.add(title.trim());
          delete this.state.overrides[title.trim()];
        }
      }

      this.saveToLocalStorage({ action: 'delete_bulk_associations', details: { productIds } });
      this.notifyListeners();

      dispatchNotification(
        'DELETE',
        'Bulk Image Overrides Removed',
        `Removed custom image overrides for ${productIds.length} items.`,
        'admin'
      );

      const bodyStr = JSON.stringify({ productIds });
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        if (!res.ok) throw new Error('Primary endpoint non-200');
      } catch {
        await fetch('/api.php?action=delete_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  /**
   * Reset all custom product image overrides back to default catalog images
   */
  public async resetAllProductImages(): Promise<void> {
    this.beginWrite();
    try {
      for (const k of Object.keys(this.state.overrides)) {
        this.locallyDeletedIds.add(k);
      }
      this.state.overrides = {};
      this.state.globalDefaultImage = null;
      this.state.categoryOverrides = {};
      this.state.urlReplacements = {};

      if (typeof window !== 'undefined') {
        this.memoryStorage.delete(STORAGE_KEY);
        this.memoryStorage.delete(LEGACY_OVERRIDES_KEY);
        this.memoryStorage.delete(PRODUCTS_CACHE_KEY);
        this.memoryStorage.delete('cached_products');
      }

      this.saveToLocalStorage({ action: 'reset_all_product_images' });
      this.notifyListeners();

      dispatchNotification(
        'DELETE',
        'All Image Overrides Reset',
        'Reset all custom product image overrides across the platform.',
        'admin'
      );

      const bodyStr = JSON.stringify({ resetAll: true });
      try {
        const res = await fetch('/api/v1/admin/product-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        });
        if (!res.ok) throw new Error('Primary endpoint non-200');
      } catch {
        await fetch('/api.php?action=delete_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});
      }
    } finally {
      this.endWrite();
    }
  }

  private uploadDiagnosticsLog: Array<{
    id: string;
    timestamp: string;
    targetId: string;
    targetType: string;
    expectedUrl: string;
    serverReadbackUrl: string;
    assetHttpStatus: number;
    verifiedOnServer: boolean;
    autoHealed: boolean;
    deletedOldUrls: string[];
    source: string;
  }> = [];

  public getUploadDiagnosticsLog() {
    return [...this.uploadDiagnosticsLog];
  }

  /**
   * Diagnostic logging and immediate server GET readback callback verification for every 200 OK upload/replacement.
   * Ensures the uploaded file is reachable on disk and persisted in server overrides / siteContent, auto-healing any discrepancy.
   */
  public async logAndVerifyUploadPropagation(params: {
    targetId: string;
    targetType?: string;
    expectedUrl: string;
    deletedOldUrls?: string[];
    source: string;
  }) {
    const cleanTargetId = String(params.targetId || '').trim();
    const expectedBase = normalizeProductAssetUrl(String(params.expectedUrl || '').trim()).split('?')[0];
    const targetType = String(params.targetType || 'PRODUCT').toUpperCase();
    const deletedOldUrls = Array.isArray(params.deletedOldUrls) ? params.deletedOldUrls : [];
    const nowIso = new Date().toISOString();

    let assetHttpStatus = 0;
    let serverReadbackUrl = '';
    let verifiedOnServer = false;
    let autoHealed = false;

    if (typeof window !== 'undefined' && cleanTargetId && expectedBase) {
      try {
        // 1. Verify the uploaded asset file responds 200 OK
        if (expectedBase.startsWith('/')) {
          const headRes = await fetch(`${expectedBase}?_verify=${Date.now()}`, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => null);
          assetHttpStatus = headRes ? headRes.status : 0;
        } else {
          assetHttpStatus = 200;
        }

        // 2. Immediate GET readback callback from server override store
        const stateRes = await fetch(`/api/v1/admin/product-images?_verify=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
        }).catch(() => null);
        if (stateRes && stateRes.ok) {
          const stateJson = await stateRes.json().catch(() => null);
          const srvOverrides = stateJson?.data?.overrides || stateJson?.overrides || {};
          const srvEntry = srvOverrides?.[cleanTargetId];
          serverReadbackUrl = srvEntry?.primary ? normalizeProductAssetUrl(String(srvEntry.primary)).split('?')[0] : '';
          verifiedOnServer = serverReadbackUrl === expectedBase;
        }

        // 3. Auto-heal if server override readback did not match expectedBase
        if (!verifiedOnServer && (assetHttpStatus === 200 || assetHttpStatus === 304)) {
          const healTs = Date.now();
          const healRes = await fetch('/api/v1/admin/product-images', {
            method: 'PUT',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: cleanTargetId,
              primaryUrl: expectedBase,
              galleryUrls: [expectedBase],
              format: this.detectFormatFromUrl(expectedBase),
              imageUpdatedAt: healTs,
              updatedAt: new Date(healTs).toISOString(),
              updatedBy: 'admin-manual',
              locked: true,
              serverVerified: true,
              verifiedAt: new Date(healTs).toISOString(),
              replacedOldUrls: deletedOldUrls
            })
          }).catch(() => null);
          if (healRes && healRes.ok) {
            autoHealed = true;
            verifiedOnServer = true;
            serverReadbackUrl = expectedBase;
          }
        }
      } catch {}
    }

    const entry = {
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      targetId: cleanTargetId,
      targetType,
      expectedUrl: expectedBase,
      serverReadbackUrl,
      assetHttpStatus,
      verifiedOnServer,
      autoHealed,
      deletedOldUrls,
      source: params.source
    };

    this.uploadDiagnosticsLog = [entry, ...this.uploadDiagnosticsLog].slice(0, 100);
    console.info(
      `[UploadDiagnostic] target=${cleanTargetId} (${targetType}) url=${expectedBase} http=${assetHttpStatus} verified=${verifiedOnServer} autoHealed=${autoHealed} deletedOld=${deletedOldUrls.length} src=${params.source}`
    );
    return entry;
  }
}

export const productImageManagerService = new ProductImageManagerService();

registerAttachedCatalogUrlsProvider((excludeProductId?: string) => {
  const exclude = String(excludeProductId || '').trim();
  const state = productImageManagerService.getState();
  const attached: string[] = [];
  for (const [key, entry] of Object.entries(state.overrides || {})) {
    if (!entry || (exclude && key === exclude)) continue;
    if (entry.primary) attached.push(entry.primary);
    if (Array.isArray(entry.gallery)) {
      for (const g of entry.gallery) {
        if (g) attached.push(g);
      }
    }
  }
  return attached;
});
