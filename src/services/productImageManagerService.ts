import { Product } from '../types';
import { autoSeoEngine } from './autoSeoEngine';


export const PRODUCT_IMAGE_SAVED_EVENT = 'tradeheaven_product_image_saved';
export const PRODUCT_IMAGE_STORAGE_SAVED_EVENT = 'tradeheaven:image-saved-to-storage';

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
  gallery: string[];
  format?: string;
  updatedAt: string;
  updatedBy?: string;
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
  globalDefaultImage: string | null;
  categoryOverrides: Record<string, string>;
  urlReplacements: Record<string, string>;
  mediaLibrary: MediaLibraryItem[];
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

const STORAGE_KEY = 'trade_heaven_product_image_system_v1';
const LEGACY_OVERRIDES_KEY = 'trade_heaven_image_overrides';
const PRODUCTS_CACHE_KEY = 'trade_heaven_v1_products_v2';
const IDB_NAME = 'trade_heaven_product_images_idb';
const IDB_STORE = 'image_system_state';
const IDB_KEY = 'active_state_v1';

export function normalizeProductAssetUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/^\/assets\/aistudio\//, '/assets/uploads/');
}

const DEFAULT_BUILTIN_OVERRIDES: Record<string, ProductImageOverrideEntry> = {
  'prod-1': {
    primary: '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
    gallery: ['/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg'],
    format: 'JPG',
    updatedAt: '2026-11-06T07:21:43.891Z'
  },
  'th-rh-prod-01': {
    primary: '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
    gallery: ['/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg'],
    format: 'JPG',
    updatedAt: '2026-11-06T07:21:43.891Z'
  },
  'th-rh-prod-02': {
    primary: '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
    gallery: [
      '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_3.59.07_PM_ed00bad4.jpeg'
    ],
    format: 'JPG',
    updatedAt: '2026-11-06T07:21:43.891Z'
  },
  'th-rh-prod-04': {
    primary: '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
    gallery: ['/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg'],
    format: 'JPG',
    updatedAt: '2026-11-06T07:21:43.891Z'
  },
  'prod-blackstone-black-jade-cabochon': {
    primary: '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg',
    gallery: [
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg',
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg'
    ],
    format: 'JPG',
    updatedAt: '2026-11-05T20:48:37.799Z'
  },
  'prod-blackstone-turquoise-rough-matrix': {
    primary: '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg',
    gallery: [
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg',
      '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg'
    ],
    format: 'JPG',
    updatedAt: '2026-11-05T20:48:37.799Z'
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
    updatedAt: '2026-11-05T20:48:37.799Z'
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
    updatedAt: '2026-11-05T20:48:37.799Z'
  },
  'prod-middle-fox-en590': {
    primary: '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg',
    gallery: [
      '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg',
      '/assets/uploads/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg'
    ],
    format: 'JPG',
    updatedAt: '2026-11-05T20:48:37.799Z'
  },
  'prod-middle-fox-jeta1': {
    primary: '/assets/uploads/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    gallery: [
      '/assets/uploads/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
      '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg'
    ],
    format: 'JPG',
    updatedAt: '2026-11-05T20:48:37.799Z'
  }
};

const DEFAULT_BUILTIN_MEDIA: MediaLibraryItem[] = [
  {
    id: 'builtin-rice-husk-powder',
    url: '/assets/uploads/Agricultural_Rice_Husk_Powder__Grind___Ashtradeheaven_d9763edd.jpeg',
    name: 'Agricultural Rice Husk Powder, Grind & Ash.jpeg',
    format: 'JPG',
    sizeBytes: 32795,
    uploadedAt: '2026-11-06T07:21:43Z'
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
  },
  {
    id: 'builtin-evening-cargo-port',
    url: '/assets/uploads/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    name: 'Evening Cargo & Oil Ships Dock at Port.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-20T08:23:00Z'
  },
  {
    id: 'builtin-cargo-tanker-berth',
    url: '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg',
    name: 'Cargo Tanker Ship Marine Vessel Docking.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-20T08:08:00Z'
  }
];

class ProductImageManagerService {
  private state: ProductImageSystemState;
  private isHydratedFromServer = false;
  private hydrationPromise: Promise<ProductImageSystemState> | null = null;
  private locallyDeletedIds = new Set<string>();
  private localMutationTimes = new Map<string, number>();

  constructor() {
    this.state = this.loadFromLocalStorage();
    if (typeof window !== 'undefined') {
      this.hydrateFromIndexedDb();
      this.hydrationPromise = this.syncFromServer();
    }
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
      globalDefaultImage: null,
      categoryOverrides: {},
      urlReplacements: {},
      mediaLibrary: [...DEFAULT_BUILTIN_MEDIA]
    };
  }

  private normalizeOverrideMap(rawMap: Record<string, any>): Record<string, ProductImageOverrideEntry> {
    const out: Record<string, ProductImageOverrideEntry> = {};
    if (!rawMap || typeof rawMap !== 'object') return out;
    for (const [k, v] of Object.entries(rawMap)) {
      if (!v || typeof v !== 'object' || !v.primary) continue;
      const primary = normalizeProductAssetUrl(v.primary);
      if (!primary) continue;
      const gallery = Array.isArray(v.gallery) && v.gallery.length > 0
        ? v.gallery.map((u: string) => normalizeProductAssetUrl(u)).filter(Boolean)
        : [primary];
      out[k] = {
        primary,
        gallery,
        format: v.format || this.detectFormatFromUrl(primary),
        updatedAt: v.updatedAt || new Date().toISOString(),
        updatedBy: v.updatedBy
      };
    }
    return out;
  }

  private loadFromLocalStorage(): ProductImageSystemState {
    const base = this.getInitialEmptyState();
    if (typeof window === 'undefined') return base;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const loadedOverrides = this.normalizeOverrideMap(parsed.overrides);
          base.overrides = {
            ...DEFAULT_BUILTIN_OVERRIDES,
            ...loadedOverrides
          };
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

      // Merge legacy overrides if present
      const legacyRaw = localStorage.getItem(LEGACY_OVERRIDES_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (legacyParsed && typeof legacyParsed === 'object') {
          const normalizedLegacy = this.normalizeOverrideMap(legacyParsed);
          for (const [key, entry] of Object.entries(normalizedLegacy)) {
            const existing = base.overrides[key];
            if (!existing) {
              base.overrides[key] = entry;
            } else {
              const legacyTime = Date.parse(entry.updatedAt || '') || 0;
              const baseTime = Date.parse(existing.updatedAt || '') || 0;
              if (legacyTime > baseTime) {
                base.overrides[key] = entry;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[ProductImageManagerService] Error reading localStorage:', err);
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
      tx.objectStore(IDB_STORE).put(JSON.parse(JSON.stringify(stateToSave)), IDB_KEY);
    } catch {}
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    try {
      const db = await this.openIndexedDb();
      if (!db) return;
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
      if (idbState && idbState.overrides && typeof idbState.overrides === 'object') {
        let changed = false;
        const normalizedIdb = this.normalizeOverrideMap(idbState.overrides);
        for (const [pid, idbEntry] of Object.entries(normalizedIdb)) {
          if (this.locallyDeletedIds.has(pid)) continue;
          const current = this.state.overrides[pid];
          const idbTime = Date.parse(idbEntry.updatedAt || '') || 0;
          const curTime = current ? (Date.parse(current.updatedAt || '') || 0) : 0;
          if (!current || idbTime > curTime) {
            this.state.overrides[pid] = idbEntry;
            changed = true;
          }
        }
        if (changed) {
          this.emitImageSavedEvent({ action: 'idb_hydrated' });
          this.notifyListeners();
        }
      }
    } catch {}
  }

  private saveToLocalStorage(context?: { productId?: string; url?: string; gallery?: string[]; action?: string; details?: any }) {
    if (typeof window === 'undefined') return;

    // 1. Always persist full state to IndexedDB (unlimited quota for base64 & high-res assets)
    this.saveToIndexedDb(this.state);

    // 2. Persist to localStorage with automatic quota protection
    try {
      let serialized = JSON.stringify(this.state);
      if (serialized.length > 1800000) {
        // Strip heavy data:image URLs from mediaLibrary for localStorage while keeping all overrides intact
        const compactState: ProductImageSystemState = {
          ...this.state,
          mediaLibrary: this.state.mediaLibrary.filter(m => !m.url.startsWith('data:image/') || m.url.length < 150000).slice(0, 40)
        };
        serialized = JSON.stringify(compactState);
      }
      try {
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch {
        // Evict secondary caches to free up localStorage space and retry
        try {
          localStorage.removeItem('cached_products');
          localStorage.removeItem(PRODUCTS_CACHE_KEY);
          localStorage.removeItem(LEGACY_OVERRIDES_KEY);
        } catch {}
        const minimalState: ProductImageSystemState = {
          ...this.state,
          mediaLibrary: DEFAULT_BUILTIN_MEDIA
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalState));
      }

      try {
        localStorage.setItem(LEGACY_OVERRIDES_KEY, JSON.stringify(this.state.overrides));
      } catch {}

      this.syncCachedProductsInLocalStorage();
    } catch (err) {
      console.warn('[ProductImageManagerService] Error saving to localStorage:', err);
    } finally {
      // 3. ALWAYS emit custom events so EditableImage & SafeImage re-render immediately
      this.emitImageSavedEvent(context);
    }
  }

  private emitImageSavedEvent(context?: { productId?: string; url?: string; gallery?: string[]; action?: string; details?: any }) {
    if (typeof window === 'undefined') return;
    try {
      const detail: ProductImageSavedEventDetail = {
        timestamp: Date.now(),
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
    const handler = (e: Event) => callback(e as CustomEvent<ProductImageSavedEventDetail>);
    window.addEventListener(PRODUCT_IMAGE_SAVED_EVENT, handler);
    window.addEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handler);
    window.addEventListener('tradeheaven_image_saved_to_storage', handler);
    window.addEventListener('product_image_saved', handler);
    window.addEventListener('tradeheaven_product_images_updated', handler);
    return () => {
      window.removeEventListener(PRODUCT_IMAGE_SAVED_EVENT, handler);
      window.removeEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handler);
      window.removeEventListener('tradeheaven_image_saved_to_storage', handler);
      window.removeEventListener('product_image_saved', handler);
      window.removeEventListener('tradeheaven_product_images_updated', handler);
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
      // Update custom products if any custom product matches an override
      const rawCustom = localStorage.getItem('trade_heaven_custom_products');
      if (rawCustom) {
        const parsedCustom = JSON.parse(rawCustom);
        if (Array.isArray(parsedCustom)) {
          const updatedCustom = this.applyOverridesToProductList(parsedCustom);
          localStorage.setItem('trade_heaven_custom_products', JSON.stringify(updatedCustom));
        }
      }

      // Check if any override uses a large data URL; if so, remove cached_products so it re-computes in memory without overflowing localStorage
      const hasLargeDataUrl = Object.values(this.state.overrides).some(
        o => o?.primary?.startsWith('data:') && o.primary.length > 80000
      );
      if (hasLargeDataUrl) {
        localStorage.removeItem('cached_products');
        localStorage.removeItem(PRODUCTS_CACHE_KEY);
        return;
      }

      const rawProducts = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (rawProducts) {
        const parsed = JSON.parse(rawProducts);
        if (Array.isArray(parsed)) {
          const updated = this.applyOverridesToProductList(parsed);
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updated));
        }
      }
      const rawCatProducts = localStorage.getItem('cached_products');
      if (rawCatProducts) {
        const parsedCat = JSON.parse(rawCatProducts);
        if (Array.isArray(parsedCat)) {
          const updatedCat = this.applyOverridesToProductList(parsedCat);
          localStorage.setItem('cached_products', JSON.stringify(updatedCat));
        }
      }
    } catch {}
  }

  private notifyListeners() {
    if (typeof window !== 'undefined') {
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

  public async syncFromServer(): Promise<ProductImageSystemState> {
    try {
      let srv: ProductImageSystemState | null = null;

      // 1. Try Node/Express endpoint
      try {
        const res = await fetch(`/api/v1/admin/product-images?_t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            srv = json.data;
          }
        }
      } catch {}

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

      if (srv) {
        const localOverrides = this.state.overrides || {};
        const srvOverrides = this.normalizeOverrideMap(srv.overrides || {});
        const mergedOverrides: Record<string, ProductImageOverrideEntry> = {
          ...DEFAULT_BUILTIN_OVERRIDES
        };

        // Apply server overrides except any locally deleted in this session
        for (const [pid, srvEntry] of Object.entries(srvOverrides)) {
          if (this.locallyDeletedIds.has(pid)) continue;
          mergedOverrides[pid] = srvEntry;
        }

        let localHasNewerOrMissingOnServer = false;

        for (const [pid, localEntry] of Object.entries(localOverrides)) {
          if (!localEntry?.primary || this.locallyDeletedIds.has(pid)) continue;
          const srvEntry = srvOverrides[pid];
          const localMutatedRecently = (this.localMutationTimes.get(pid) || 0) > Date.now() - 120000;
          if (!srvEntry) {
            mergedOverrides[pid] = localEntry;
            localHasNewerOrMissingOnServer = true;
          } else {
            const localTime = Date.parse(localEntry.updatedAt || '') || 0;
            const srvTime = Date.parse(srvEntry.updatedAt || '') || 0;
            if (localMutatedRecently || localTime >= srvTime) {
              mergedOverrides[pid] = localEntry;
              if (localTime > srvTime) {
                localHasNewerOrMissingOnServer = true;
              }
            }
          }
        }

        this.state.overrides = mergedOverrides;
        this.state.globalDefaultImage = srv.globalDefaultImage
          ? normalizeProductAssetUrl(srv.globalDefaultImage)
          : (this.state.globalDefaultImage ?? null);
        this.state.categoryOverrides = {
          ...(this.state.categoryOverrides || {}),
          ...(srv.categoryOverrides || {})
        };
        this.state.urlReplacements = {
          ...(this.state.urlReplacements || {}),
          ...(srv.urlReplacements || {})
        };

        if (Array.isArray(srv.mediaLibrary)) {
          const seen = new Set<string>();
          const mergedMedia: MediaLibraryItem[] = [];
          for (const item of [...this.state.mediaLibrary, ...srv.mediaLibrary, ...DEFAULT_BUILTIN_MEDIA]) {
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

        this.isHydratedFromServer = true;
        this.saveToLocalStorage({ action: 'sync_from_server' });
        this.notifyListeners();

        // Push newer local overrides back up to server
        if (localHasNewerOrMissingOnServer && Object.keys(mergedOverrides).length > 0) {
          fetch('/api/v1/admin/product-images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullOverridesMap: mergedOverrides
            })
          }).catch(() => {});
        }
      }
    } catch {
      // Offline or local fallback
    }
    return this.state;
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

    // 1. Check direct productId override
    if (productId) {
      const cleanId = productId.trim();
      const entry = this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()];
      if (entry) {
        if (imageIndex > 0 && entry.gallery && entry.gallery[imageIndex]) {
          return normalizeProductAssetUrl(entry.gallery[imageIndex]);
        }
        if (entry.primary) return normalizeProductAssetUrl(entry.primary);
      }
    }

    // 2. Check productTitle override if matched by title
    if (productTitle) {
      const cleanTitle = productTitle.trim();
      const entry = this.state.overrides[cleanTitle];
      if (entry?.primary) return normalizeProductAssetUrl(entry.primary);
    }

    // 3. Check URL replacement rules
    if (normalizedSrc) {
      if (this.state.urlReplacements[normalizedSrc]) {
        return normalizeProductAssetUrl(this.state.urlReplacements[normalizedSrc]);
      }
      if (src && this.state.urlReplacements[src]) {
        return normalizeProductAssetUrl(this.state.urlReplacements[src]);
      }
      for (const [oldSubstr, newUrl] of Object.entries(this.state.urlReplacements)) {
        if (oldSubstr && (normalizedSrc.includes(oldSubstr) || (src && src.includes(oldSubstr)))) {
          return normalizeProductAssetUrl(newUrl);
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
        : ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'];

    if (product.id) {
      const cleanId = product.id.trim();
      const entry = this.state.overrides[cleanId] || this.state.overrides[cleanId.toLowerCase()];
      if (entry && entry.primary) {
        const cleanPrimary = normalizeProductAssetUrl(entry.primary);
        if (Array.isArray(entry.gallery) && entry.gallery.length > 0) {
          const cleanGallery = entry.gallery.map(u => normalizeProductAssetUrl(u)).filter(Boolean);
          return [cleanPrimary, ...cleanGallery.filter(u => u !== cleanPrimary)];
        }
        return [cleanPrimary, ...rawImages.slice(1)];
      }
    }

    if (product.title && this.state.overrides[product.title.trim()]) {
      const entry = this.state.overrides[product.title.trim()];
      const cleanPrimary = normalizeProductAssetUrl(entry.primary);
      return [cleanPrimary, ...rawImages.slice(1)];
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
    return products.map(prod => {
      const resolvedImages = this.resolveProductImages(prod);
      return {
        ...prod,
        image: resolvedImages[0],
        images: resolvedImages
      };
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
    targetFormat: OutputImageFormat = 'jpg',
    quality = 0.92,
    maxDimension = 1600,
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

        // If user selected 'original' (and not autoWebpLossless and no rotation or filters) and it's SVG or GIF, keep raw DataURL directly
        if (
          !autoWebpLossless &&
          normalizedRotation === 0 &&
          !hasFilters &&
          effectiveTargetFormat === 'original' &&
          (origExt === 'svg' || origExt === 'gif' || file.type.includes('svg') || file.type.includes('gif'))
        ) {
          return resolve({
            dataUrl: rawDataUrl,
            mimeType: file.type || (origExt === 'svg' ? 'image/svg+xml' : 'image/gif'),
            extension: origExt,
            fileName: file.name,
            sizeBytes: file.size,
            originalSizeBytes: file.size,
            losslessCompression: false
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
    const targetFormat: OutputImageFormat = useWebpLossless ? 'webp' : (options?.targetFormat || 'jpg');
    const quality = useWebpLossless ? 1.0 : (options?.quality ?? 0.92);
    const rotationDegrees = options?.rotationDegrees ?? 0;

    const converted = await this.convertImageFile(
      file,
      targetFormat,
      quality,
      1600,
      useWebpLossless,
      rotationDegrees,
      options?.filters
    );

    let finalUrl = converted.dataUrl;
    let finalFormat = converted.extension.toUpperCase();
    let finalName = converted.fileName;
    let finalSizeBytes = converted.sizeBytes;
    let uploadedToServer = false;

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
      category: options?.category,
      applyToAll: options?.applyToAll,
      oldUrlToReplace: options?.oldUrlToReplace
    };

    try {
      const response = await fetch('/api/v1/admin/upload-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadPayload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.url) {
          finalUrl = normalizeProductAssetUrl(data.url);
          uploadedToServer = true;
          if (data.mediaEntry) {
            finalName = data.mediaEntry.name || finalName;
            finalFormat = data.mediaEntry.format || finalFormat;
            if (typeof data.mediaEntry.sizeBytes === 'number') {
              finalSizeBytes = data.mediaEntry.sizeBytes;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[ProductImageManagerService] Primary upload endpoint fallback:', err);
    }

    // Fallback to PHP endpoint for cPanel / BigRock deployment
    if (!uploadedToServer) {
      try {
        const phpRes = await fetch('/api.php?action=upload_product_image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadPayload)
        });
        if (phpRes.ok) {
          const phpData = await phpRes.json();
          if (phpData?.success && phpData?.url) {
            finalUrl = normalizeProductAssetUrl(phpData.url);
            uploadedToServer = true;
            if (phpData.mediaEntry) {
              finalName = phpData.mediaEntry.name || finalName;
              finalFormat = phpData.mediaEntry.format || finalFormat;
              if (typeof phpData.mediaEntry.sizeBytes === 'number') {
                finalSizeBytes = phpData.mediaEntry.sizeBytes;
              }
            }
          }
        }
      } catch {}
    }

    // If still using local DataURL (offline/static fallback) and it is > 300KB, create a compact DataURL so localStorage never overflows
    if (!uploadedToServer && finalUrl.startsWith('data:image/') && finalUrl.length > 300000) {
      try {
        const compact = await this.convertImageFile(
          file,
          'jpg',
          0.82,
          900,
          false,
          rotationDegrees,
          options?.filters
        );
        if (compact.dataUrl && compact.dataUrl.length < finalUrl.length) {
          finalUrl = compact.dataUrl;
          finalSizeBytes = compact.sizeBytes;
        }
      } catch {}
    }

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
      ...this.state.mediaLibrary.filter(m => m.url !== finalUrl)
    ];

    // Apply requested assignments locally as well
    const nowIso = new Date().toISOString();
    if (options?.applyToAll) {
      this.state.globalDefaultImage = finalUrl;
    }
    if (options?.category) {
      this.state.categoryOverrides[options.category] = finalUrl;
    }
    if (options?.oldUrlToReplace) {
      this.state.urlReplacements[options.oldUrlToReplace] = finalUrl;
    }
    if (options?.productId) {
      const cleanPid = options.productId.trim();
      this.locallyDeletedIds.delete(cleanPid);
      this.localMutationTimes.set(cleanPid, Date.now());
      const existing = this.state.overrides[cleanPid];
      const existingGallery =
        existing?.gallery && existing.gallery.length > 0
          ? existing.gallery
          : existing?.primary
            ? [existing.primary]
            : [];
      const isAppend = options?.appendToGallery === true && Boolean(existing?.primary);
      const primary = isAppend ? existing.primary : finalUrl;
      const gallery = isAppend
        ? [...existingGallery.filter(u => u !== finalUrl), finalUrl]
        : [finalUrl, ...existingGallery.filter(u => u !== finalUrl)];

      this.state.overrides[cleanPid] = {
        primary,
        gallery,
        format: finalFormat,
        updatedAt: nowIso
      };

      if (isAppend) {
        const appendBody = JSON.stringify({
          productId: cleanPid,
          primaryUrl: primary,
          galleryUrls: gallery,
          format: finalFormat
        });
        fetch('/api/v1/admin/product-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: appendBody
        }).catch(() => {});
        fetch('/api.php?action=set_product_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: appendBody
        }).catch(() => {});
      }
    }
    if (Array.isArray(options?.productIds)) {
      for (const rawPid of options!.productIds) {
        const pid = rawPid?.trim();
        if (!pid) continue;
        this.locallyDeletedIds.delete(pid);
        this.localMutationTimes.set(pid, Date.now());
        const existing = this.state.overrides[pid];
        const gallery = existing?.gallery ? [finalUrl, ...existing.gallery.filter(u => u !== finalUrl)] : [finalUrl];
        this.state.overrides[pid] = {
          primary: finalUrl,
          gallery,
          format: finalFormat,
          updatedAt: nowIso
        };
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

    return {
      url: finalUrl,
      format: finalFormat,
      name: finalName,
      sizeBytes: finalSizeBytes,
      originalSizeBytes: converted.originalSizeBytes,
      losslessCompression: converted.losslessCompression
    };
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
    let finalUrl = dataUrl;
    const payload = JSON.stringify({
      fileName,
      mimeType: 'image/jpeg',
      base64Data: dataUrl,
      targetFormat: 'jpg',
      productId: options?.productId,
      productIds: options?.productIds,
      category: options?.category,
      applyToAll: options?.applyToAll
    });

    try {
      const response = await fetch('/api/v1/admin/upload-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson?.success && resJson?.url) {
          finalUrl = normalizeProductAssetUrl(resJson.url);
        }
      }
    } catch {}

    if (finalUrl === dataUrl) {
      try {
        const phpRes = await fetch('/api.php?action=upload_product_image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        if (phpRes.ok) {
          const phpJson = await phpRes.json();
          if (phpJson?.success && phpJson?.url) {
            finalUrl = normalizeProductAssetUrl(phpJson.url);
          }
        }
      } catch {}
    }

    if (options?.productId) {
      await this.setProductImage(options.productId, finalUrl);
    } else if (options?.productIds && options.productIds.length > 0) {
      await this.setBulkProductImages(options.productIds, finalUrl);
    } else if (options?.category) {
      await this.setCategoryImage(options.category, finalUrl);
    } else if (options?.applyToAll) {
      await this.setAllProductsImage(finalUrl);
    }

    return finalUrl;
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
    const cleanId = productId.trim();
    const cleanPrimary = normalizeProductAssetUrl(primaryUrl);
    this.locallyDeletedIds.delete(cleanId);
    this.localMutationTimes.set(cleanId, Date.now());

    const existing = this.state.overrides[cleanId];
    const resolvedGallery = Array.isArray(galleryUrls) && galleryUrls.length > 0
      ? galleryUrls.map(u => normalizeProductAssetUrl(u)).filter(Boolean)
      : existing?.gallery
        ? [cleanPrimary, ...existing.gallery.map(u => normalizeProductAssetUrl(u)).filter(u => u && u !== cleanPrimary)]
        : [cleanPrimary];

    const format = this.detectFormatFromUrl(cleanPrimary);
    this.state.overrides[cleanId] = {
      primary: cleanPrimary,
      gallery: resolvedGallery,
      format,
      updatedAt: new Date().toISOString()
    };

    try {
      autoSeoEngine.autoOptimizeImageUpload({
        imageUrl: cleanPrimary,
        productId: cleanId,
        fileName: `product-${cleanId}.${format.toLowerCase()}`
      });
    } catch {}

    this.saveToLocalStorage({ productId: cleanId, url: cleanPrimary, gallery: resolvedGallery, action: 'set_product_image' });
    this.notifyListeners();

    const bodyStr = JSON.stringify({
      productId: cleanId,
      primaryUrl: cleanPrimary,
      galleryUrls: resolvedGallery,
      format
    });

    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
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
    const cleanPrimary = normalizeProductAssetUrl(primaryUrl);
    const format = this.detectFormatFromUrl(cleanPrimary);
    const nowIso = new Date().toISOString();

    for (const rawPid of productIds) {
      const pid = rawPid?.trim();
      if (!pid) continue;
      this.locallyDeletedIds.delete(pid);
      this.localMutationTimes.set(pid, Date.now());
      const existing = this.state.overrides[pid];
      const resolvedGallery = Array.isArray(galleryUrls) && galleryUrls.length > 0
        ? galleryUrls.map(u => normalizeProductAssetUrl(u)).filter(Boolean)
        : existing?.gallery
          ? [cleanPrimary, ...existing.gallery.map(u => normalizeProductAssetUrl(u)).filter(u => u && u !== cleanPrimary)]
          : [cleanPrimary];

      this.state.overrides[pid] = {
        primary: cleanPrimary,
        gallery: resolvedGallery,
        format,
        updatedAt: nowIso
      };
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

    const bodyStr = JSON.stringify({
      productIds,
      primaryUrl: cleanPrimary,
      galleryUrls,
      format
    });

    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
    }
  }

  /**
   * Set image for all products in a specific category
   */
  public async setCategoryImage(category: string, primaryUrl: string, matchingProductIds: string[] = []): Promise<void> {
    if (!category || !primaryUrl) return;
    const cleanPrimary = normalizeProductAssetUrl(primaryUrl);
    this.state.categoryOverrides[category] = cleanPrimary;

    if (matchingProductIds.length > 0) {
      const format = this.detectFormatFromUrl(cleanPrimary);
      const nowIso = new Date().toISOString();
      for (const pid of matchingProductIds) {
        this.locallyDeletedIds.delete(pid);
        this.localMutationTimes.set(pid, Date.now());
        this.state.overrides[pid] = {
          primary: cleanPrimary,
          gallery: [cleanPrimary],
          format,
          updatedAt: nowIso
        };
      }
    }

    this.saveToLocalStorage({ url: cleanPrimary, action: 'set_category_image', details: { category } });
    this.notifyListeners();

    const bodyStr = JSON.stringify({
      category,
      productIds: matchingProductIds,
      primaryUrl: cleanPrimary
    });

    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
    }
  }

  /**
   * Set image for ALL listed products across the entire app
   */
  public async setAllProductsImage(primaryUrl: string, allProductIds: string[] = []): Promise<void> {
    if (!primaryUrl) return;
    const cleanPrimary = normalizeProductAssetUrl(primaryUrl);
    this.state.globalDefaultImage = cleanPrimary;

    if (allProductIds.length > 0) {
      const format = this.detectFormatFromUrl(cleanPrimary);
      const nowIso = new Date().toISOString();
      for (const pid of allProductIds) {
        this.locallyDeletedIds.delete(pid);
        this.localMutationTimes.set(pid, Date.now());
        this.state.overrides[pid] = {
          primary: cleanPrimary,
          gallery: [cleanPrimary],
          format,
          updatedAt: nowIso
        };
      }
    }

    this.saveToLocalStorage({ url: cleanPrimary, action: 'set_all_products_image' });
    this.notifyListeners();

    const bodyStr = JSON.stringify({
      applyToAll: true,
      productIds: allProductIds,
      primaryUrl: cleanPrimary
    });

    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
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
    const cleanNew = normalizeProductAssetUrl(newUrl);
    this.state.urlReplacements[oldUrlToReplace] = cleanNew;

    if (matchingProductIds.length > 0) {
      const format = this.detectFormatFromUrl(cleanNew);
      const nowIso = new Date().toISOString();
      for (const pid of matchingProductIds) {
        this.locallyDeletedIds.delete(pid);
        this.localMutationTimes.set(pid, Date.now());
        this.state.overrides[pid] = {
          primary: cleanNew,
          gallery: [cleanNew],
          format,
          updatedAt: nowIso
        };
      }
    }

    this.saveToLocalStorage({ url: cleanNew, action: 'replace_image_url', details: { oldUrl: oldUrlToReplace } });
    this.notifyListeners();

    const bodyStr = JSON.stringify({
      oldUrlToReplace,
      productIds: matchingProductIds,
      primaryUrl: cleanNew
    });

    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
    }
  }

  /**
   * Reset a single product's image back to its catalog default
   */
  public async resetProductImage(productId: string): Promise<void> {
    if (!productId) return;
    const cleanId = productId.trim();
    this.locallyDeletedIds.add(cleanId);
    delete this.state.overrides[cleanId];
    this.saveToLocalStorage({ productId: cleanId, action: 'reset_product_image' });
    this.notifyListeners();

    const bodyStr = JSON.stringify({ productId: cleanId });
    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=delete_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
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

    const bodyStr = JSON.stringify({ productIds });
    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=delete_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
    }
  }

  /**
   * Reset all custom product image overrides back to default catalog images
   */
  public async resetAllProductImages(): Promise<void> {
    for (const k of Object.keys(this.state.overrides)) {
      this.locallyDeletedIds.add(k);
    }
    this.state.overrides = {};
    this.state.globalDefaultImage = null;
    this.state.categoryOverrides = {};
    this.state.urlReplacements = {};
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_OVERRIDES_KEY);
        localStorage.removeItem(PRODUCTS_CACHE_KEY);
        localStorage.removeItem('cached_products');
      } catch {}
    }

    this.saveToLocalStorage({ action: 'reset_all_product_images' });
    this.notifyListeners();

    const bodyStr = JSON.stringify({ resetAll: true });
    try {
      const res = await fetch('/api/v1/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      if (!res.ok) throw new Error('Primary endpoint non-200');
    } catch {
      fetch('/api.php?action=delete_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});
    }
  }
}

export const productImageManagerService = new ProductImageManagerService();
