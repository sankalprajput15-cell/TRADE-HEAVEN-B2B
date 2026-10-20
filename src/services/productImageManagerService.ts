import { Product } from '../types';

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

const DEFAULT_BUILTIN_MEDIA: MediaLibraryItem[] = [
  {
    id: 'builtin-evening-cargo-port',
    url: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    name: 'Evening Cargo & Oil Ships Dock at Port.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-20T08:23:00Z'
  },
  {
    id: 'builtin-cargo-tanker-berth',
    url: '/assets/aistudio/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg',
    name: 'Cargo Tanker Ship Marine Vessel Docking.jpg',
    format: 'JPG',
    uploadedAt: '2026-10-20T08:08:00Z'
  }
];

class ProductImageManagerService {
  private state: ProductImageSystemState;
  private isHydratedFromServer = false;
  private hydrationPromise: Promise<ProductImageSystemState> | null = null;

  constructor() {
    this.state = this.loadFromLocalStorage();
    if (typeof window !== 'undefined') {
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
      overrides: {},
      globalDefaultImage: null,
      categoryOverrides: {},
      urlReplacements: {},
      mediaLibrary: [...DEFAULT_BUILTIN_MEDIA]
    };
  }

  private loadFromLocalStorage(): ProductImageSystemState {
    const base = this.getInitialEmptyState();
    if (typeof window === 'undefined') return base;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          base.overrides = parsed.overrides || {};
          base.globalDefaultImage = parsed.globalDefaultImage || null;
          base.categoryOverrides = parsed.categoryOverrides || {};
          base.urlReplacements = parsed.urlReplacements || {};
          if (Array.isArray(parsed.mediaLibrary)) {
            const urls = new Set(parsed.mediaLibrary.map((m: MediaLibraryItem) => m.url));
            base.mediaLibrary = [
              ...parsed.mediaLibrary,
              ...DEFAULT_BUILTIN_MEDIA.filter(d => !urls.has(d.url))
            ];
          }
        }
      }

      // Also merge legacy overrides if present
      const legacyRaw = localStorage.getItem(LEGACY_OVERRIDES_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (legacyParsed && typeof legacyParsed === 'object') {
          for (const [key, val] of Object.entries(legacyParsed)) {
            if (!base.overrides[key] && val && typeof val === 'object') {
              const entry = val as any;
              if (entry.primary) {
                base.overrides[key] = {
                  primary: entry.primary,
                  gallery: Array.isArray(entry.gallery) && entry.gallery.length > 0 ? entry.gallery : [entry.primary],
                  format: this.detectFormatFromUrl(entry.primary),
                  updatedAt: new Date().toISOString()
                };
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

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      // Also sync legacy key for backward compatibility
      localStorage.setItem(LEGACY_OVERRIDES_KEY, JSON.stringify(this.state.overrides));
      this.syncCachedProductsInLocalStorage();
    } catch (err) {
      console.warn('[ProductImageManagerService] Error saving to localStorage:', err);
    }
  }

  private syncCachedProductsInLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const rawProducts = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (rawProducts) {
        const parsed = JSON.parse(rawProducts);
        if (Array.isArray(parsed)) {
          const updated = this.applyOverridesToProductList(parsed);
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updated));
        }
      }
      // Also sync cached_products used by ProductCatalog
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
      const res = await fetch(`/api/v1/admin/product-images?_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          const srv: ProductImageSystemState = json.data;
          // Merge server overrides with local overrides
          this.state.overrides = {
            ...this.state.overrides,
            ...(srv.overrides || {})
          };
          if (srv.globalDefaultImage) {
            this.state.globalDefaultImage = srv.globalDefaultImage;
          }
          this.state.categoryOverrides = {
            ...this.state.categoryOverrides,
            ...(srv.categoryOverrides || {})
          };
          this.state.urlReplacements = {
            ...this.state.urlReplacements,
            ...(srv.urlReplacements || {})
          };
          if (Array.isArray(srv.mediaLibrary)) {
            const seen = new Set<string>();
            const mergedMedia: MediaLibraryItem[] = [];
            for (const item of [...srv.mediaLibrary, ...this.state.mediaLibrary, ...DEFAULT_BUILTIN_MEDIA]) {
              if (item && item.url && !seen.has(item.url)) {
                seen.add(item.url);
                mergedMedia.push(item);
              }
            }
            this.state.mediaLibrary = mergedMedia;
          }
          this.isHydratedFromServer = true;
          this.saveToLocalStorage();
          this.notifyListeners();
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

    // 1. Check direct productId override
    if (productId && this.state.overrides[productId]) {
      const entry = this.state.overrides[productId];
      if (imageIndex > 0 && entry.gallery && entry.gallery[imageIndex]) {
        return entry.gallery[imageIndex];
      }
      if (entry.primary) return entry.primary;
    }

    // 2. Check productTitle override if matched by title
    if (productTitle && this.state.overrides[productTitle]) {
      const entry = this.state.overrides[productTitle];
      if (entry.primary) return entry.primary;
    }

    // 3. Check URL replacement rules
    if (src) {
      if (this.state.urlReplacements[src]) {
        return this.state.urlReplacements[src];
      }
      for (const [oldSubstr, newUrl] of Object.entries(this.state.urlReplacements)) {
        if (oldSubstr && src.includes(oldSubstr)) {
          return newUrl;
        }
      }
    }

    // 4. Check category-wide override
    if (category && this.state.categoryOverrides[category]) {
      return this.state.categoryOverrides[category];
    }

    // 5. Check global all-products image override (only when rendering a product card / product with productId or category)
    if ((productId || category || productTitle) && this.state.globalDefaultImage) {
      return this.state.globalDefaultImage;
    }

    return src;
  }

  /**
   * Resolves the full images array for a Product object
   */
  public resolveProductImages(product: Partial<Product> & { image?: string }): string[] {
    const rawImages = Array.isArray(product.images) && product.images.length > 0
      ? [...product.images]
      : product.image
        ? [product.image]
        : ['/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg'];

    if (product.id && this.state.overrides[product.id]) {
      const entry = this.state.overrides[product.id];
      if (Array.isArray(entry.gallery) && entry.gallery.length > 0) {
        return [entry.primary, ...entry.gallery.filter(u => u !== entry.primary)];
      }
      return [entry.primary, ...rawImages.slice(1)];
    }

    if (product.title && this.state.overrides[product.title]) {
      const entry = this.state.overrides[product.title];
      return [entry.primary, ...rawImages.slice(1)];
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

    try {
      const response = await fetch('/api/v1/admin/upload-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.url) {
          finalUrl = data.url;
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
      console.warn('[ProductImageManagerService] Server upload fallback to local DataURL:', err);
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
      const existing = this.state.overrides[options.productId];
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

      this.state.overrides[options.productId] = {
        primary,
        gallery,
        format: finalFormat,
        updatedAt: nowIso
      };

      if (isAppend) {
        try {
          await fetch('/api/v1/admin/product-images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: options.productId,
              primaryUrl: primary,
              galleryUrls: gallery,
              format: finalFormat
            })
          });
        } catch {}
      }
    }
    if (Array.isArray(options?.productIds)) {
      for (const pid of options!.productIds) {
        if (!pid) continue;
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

    this.saveToLocalStorage();
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
    try {
      const response = await fetch('/api/v1/admin/upload-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          mimeType: 'image/jpeg',
          base64Data: dataUrl,
          targetFormat: 'jpg',
          productId: options?.productId,
          productIds: options?.productIds,
          category: options?.category,
          applyToAll: options?.applyToAll
        })
      });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson?.success && resJson?.url) {
          finalUrl = resJson.url;
        }
      }
    } catch {}

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
    const cleanPrimary = primaryUrl.trim();
    const existing = this.state.overrides[productId];
    const resolvedGallery = Array.isArray(galleryUrls) && galleryUrls.length > 0
      ? galleryUrls.filter(Boolean)
      : existing?.gallery
        ? [cleanPrimary, ...existing.gallery.filter(u => u !== cleanPrimary)]
        : [cleanPrimary];

    const format = this.detectFormatFromUrl(cleanPrimary);
    this.state.overrides[productId] = {
      primary: cleanPrimary,
      gallery: resolvedGallery,
      format,
      updatedAt: new Date().toISOString()
    };

    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          primaryUrl: cleanPrimary,
          galleryUrls: resolvedGallery,
          format
        })
      });
    } catch {}
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
    const cleanPrimary = primaryUrl.trim();
    const format = this.detectFormatFromUrl(cleanPrimary);
    const nowIso = new Date().toISOString();

    for (const pid of productIds) {
      if (!pid) continue;
      const existing = this.state.overrides[pid];
      const resolvedGallery = Array.isArray(galleryUrls) && galleryUrls.length > 0
        ? galleryUrls
        : existing?.gallery
          ? [cleanPrimary, ...existing.gallery.filter(u => u !== cleanPrimary)]
          : [cleanPrimary];

      this.state.overrides[pid] = {
        primary: cleanPrimary,
        gallery: resolvedGallery,
        format,
        updatedAt: nowIso
      };
    }

    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds,
          primaryUrl: cleanPrimary,
          galleryUrls,
          format
        })
      });
    } catch {}
  }

  /**
   * Set image for all products in a specific category
   */
  public async setCategoryImage(category: string, primaryUrl: string, matchingProductIds: string[] = []): Promise<void> {
    if (!category || !primaryUrl) return;
    const cleanPrimary = primaryUrl.trim();
    this.state.categoryOverrides[category] = cleanPrimary;

    if (matchingProductIds.length > 0) {
      const format = this.detectFormatFromUrl(cleanPrimary);
      const nowIso = new Date().toISOString();
      for (const pid of matchingProductIds) {
        this.state.overrides[pid] = {
          primary: cleanPrimary,
          gallery: [cleanPrimary],
          format,
          updatedAt: nowIso
        };
      }
    }

    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          productIds: matchingProductIds,
          primaryUrl: cleanPrimary
        })
      });
    } catch {}
  }

  /**
   * Set image for ALL listed products across the entire app
   */
  public async setAllProductsImage(primaryUrl: string, allProductIds: string[] = []): Promise<void> {
    if (!primaryUrl) return;
    const cleanPrimary = primaryUrl.trim();
    this.state.globalDefaultImage = cleanPrimary;

    if (allProductIds.length > 0) {
      const format = this.detectFormatFromUrl(cleanPrimary);
      const nowIso = new Date().toISOString();
      for (const pid of allProductIds) {
        this.state.overrides[pid] = {
          primary: cleanPrimary,
          gallery: [cleanPrimary],
          format,
          updatedAt: nowIso
        };
      }
    }

    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applyToAll: true,
          productIds: allProductIds,
          primaryUrl: cleanPrimary
        })
      });
    } catch {}
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
    const cleanNew = newUrl.trim();
    this.state.urlReplacements[oldUrlToReplace] = cleanNew;

    if (matchingProductIds.length > 0) {
      const format = this.detectFormatFromUrl(cleanNew);
      const nowIso = new Date().toISOString();
      for (const pid of matchingProductIds) {
        this.state.overrides[pid] = {
          primary: cleanNew,
          gallery: [cleanNew],
          format,
          updatedAt: nowIso
        };
      }
    }

    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldUrlToReplace,
          productIds: matchingProductIds,
          primaryUrl: cleanNew
        })
      });
    } catch {}
  }

  /**
   * Reset a single product's image back to its catalog default
   */
  public async resetProductImage(productId: string): Promise<void> {
    if (!productId) return;
    delete this.state.overrides[productId];
    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
    } catch {}
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
        delete this.state.overrides[pid];
      }
    }
    for (const title of productTitles) {
      if (title) {
        delete this.state.overrides[title];
      }
    }

    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds })
      });
    } catch {}
  }

  /**
   * Reset all custom product image overrides back to default catalog images
   */
  public async resetAllProductImages(): Promise<void> {
    this.state.overrides = {};
    this.state.globalDefaultImage = null;
    this.state.categoryOverrides = {};
    this.state.urlReplacements = {};
    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await fetch('/api/v1/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetAll: true })
      });
    } catch {}
  }
}

export const productImageManagerService = new ProductImageManagerService();
