/**
 * Image CDN Integration Service
 * Provides automatic optimization, format conversion (WebP/AVIF/Auto), and intelligent resizing
 * based on user viewport for Cloudinary, Imgix, or custom CDNs.
 */

export type ImageCdnProvider = 'none' | 'cloudinary' | 'imgix' | 'custom';

export interface ImageCdnConfig {
  provider: ImageCdnProvider;
  cloudinaryCloudName: string;
  imgixDomain: string;
  customCdnBaseUrl: string;
  autoFormat: boolean; // f_auto / auto=format
  autoQuality: boolean; // q_auto / auto=compress
  defaultQuality: number; // 75-85
  enableResponsiveDpr: boolean; // dpr=auto / dpr=2
  enabled: boolean;
}

const CDN_CONFIG_STORAGE_KEY = 'trade_heaven_image_cdn_config_v1';
export const IMAGE_CDN_UPDATED_EVENT = 'tradeheaven:image-cdn-updated';

const DEFAULT_CDN_CONFIG: ImageCdnConfig = {
  provider: 'none',
  cloudinaryCloudName: '',
  imgixDomain: '',
  customCdnBaseUrl: '',
  autoFormat: true,
  autoQuality: true,
  defaultQuality: 82,
  enableResponsiveDpr: true,
  enabled: false
};

const LEGACY_PLACEHOLDER_CLOUDS = new Set(['tradeheaven-global-cdn']);
const LEGACY_PLACEHOLDER_IMGIX = new Set(['tradeheaven.imgix.net']);
const LEGACY_PLACEHOLDER_CUSTOM = new Set(['https://cdn.tradeheaven.com/assets']);

class ImageCdnService {
  private config: ImageCdnConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): ImageCdnConfig {
    if (typeof window === 'undefined') return { ...DEFAULT_CDN_CONFIG };
    try {
      const raw = localStorage.getItem(CDN_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: ImageCdnConfig = { ...DEFAULT_CDN_CONFIG, ...parsed };
        const hasLegacyPlaceholder =
          LEGACY_PLACEHOLDER_CLOUDS.has(String(merged.cloudinaryCloudName || '').trim()) ||
          LEGACY_PLACEHOLDER_IMGIX.has(String(merged.imgixDomain || '').trim()) ||
          LEGACY_PLACEHOLDER_CUSTOM.has(String(merged.customCdnBaseUrl || '').trim());

        if (hasLegacyPlaceholder) {
          const cleaned: ImageCdnConfig = {
            ...merged,
            provider: 'none',
            enabled: false,
            cloudinaryCloudName: LEGACY_PLACEHOLDER_CLOUDS.has(String(merged.cloudinaryCloudName || '').trim())
              ? ''
              : merged.cloudinaryCloudName,
            imgixDomain: LEGACY_PLACEHOLDER_IMGIX.has(String(merged.imgixDomain || '').trim())
              ? ''
              : merged.imgixDomain,
            customCdnBaseUrl: LEGACY_PLACEHOLDER_CUSTOM.has(String(merged.customCdnBaseUrl || '').trim())
              ? ''
              : merged.customCdnBaseUrl
          };
          try {
            localStorage.setItem(CDN_CONFIG_STORAGE_KEY, JSON.stringify(cleaned));
          } catch {}
          return cleaned;
        }
        return merged;
      }
    } catch {}
    return { ...DEFAULT_CDN_CONFIG };
  }

  public getConfig(): ImageCdnConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ImageCdnConfig>): ImageCdnConfig {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CDN_CONFIG_STORAGE_KEY, JSON.stringify(this.config));
        window.dispatchEvent(
          new CustomEvent(IMAGE_CDN_UPDATED_EVENT, { detail: this.config })
        );
      } catch {}
    }
    return { ...this.config };
  }

  /**
   * Transforms any image URL through the configured Image CDN with automatic format conversion (WebP/AVIF),
   * intelligent sizing, and quality optimization.
   */
  public optimize(
    rawUrl: string | undefined | null,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
      isThumbnail?: boolean;
    } = {}
  ): string {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const trimmed = rawUrl.trim();

    // Never CDN-optimize data URLs, blobs, or SVGs/GIFs
    if (
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:') ||
      trimmed.toLowerCase().endsWith('.svg') ||
      trimmed.toLowerCase().endsWith('.gif')
    ) {
      return trimmed;
    }

    // Never rewrite relative paths or private/preview origin URLs through external fetch CDNs
    if (
      trimmed.startsWith('/') ||
      /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(trimmed) ||
      /\.run\.app\b/i.test(trimmed)
    ) {
      return trimmed;
    }

    // If CDN is disabled, return original URL
    if (!this.config.enabled || this.config.provider === 'none') {
      return trimmed;
    }

    // Guard against unconfigured or placeholder CDN domains
    if (
      (this.config.provider === 'cloudinary' && (!this.config.cloudinaryCloudName || LEGACY_PLACEHOLDER_CLOUDS.has(this.config.cloudinaryCloudName.trim()))) ||
      (this.config.provider === 'imgix' && (!this.config.imgixDomain || LEGACY_PLACEHOLDER_IMGIX.has(this.config.imgixDomain.trim()))) ||
      (this.config.provider === 'custom' && (!this.config.customCdnBaseUrl || LEGACY_PLACEHOLDER_CUSTOM.has(this.config.customCdnBaseUrl.trim())))
    ) {
      return trimmed;
    }

    const targetWidth = options.width || (options.isThumbnail ? 320 : 640);
    const quality = options.quality || this.config.defaultQuality;
    const format = options.format || (this.config.autoFormat ? 'auto' : 'webp');

    let cleanUrl = trimmed;
    // Extract existing query params (e.g. cache-busting ?v=...)
    let queryParams = '';
    const qIdx = cleanUrl.indexOf('?');
    if (qIdx !== -1) {
      queryParams = cleanUrl.slice(qIdx + 1);
      cleanUrl = cleanUrl.slice(0, qIdx);
    }

    const absoluteUrl = cleanUrl;

    let transformed = trimmed;

    switch (this.config.provider) {
      case 'cloudinary': {
        const cloudName = this.config.cloudinaryCloudName || 'demo';
        // Cloudinary fetch / upload URL construction
        // e.g. https://res.cloudinary.com/<cloud>/image/fetch/f_auto,q_auto,w_640/<url>
        const transforms: string[] = [];
        if (format === 'auto' || this.config.autoFormat) transforms.push('f_auto');
        else transforms.push(`f_${format}`);

        if (this.config.autoQuality) transforms.push(`q_${quality}`);
        else transforms.push(`q_${quality}`);

        if (targetWidth) transforms.push(`w_${targetWidth}`);
        transforms.push('c_limit'); // don't upscale beyond original

        if (this.config.enableResponsiveDpr) {
          transforms.push('dpr_auto');
        }

        const transformStr = transforms.join(',');
        const encoded = encodeURIComponent(absoluteUrl);
        transformed = `https://res.cloudinary.com/${cloudName}/image/fetch/${transformStr}/${encoded}`;
        break;
      }

      case 'imgix': {
        const domain = this.config.imgixDomain || 'assets.imgix.net';
        const params = new URLSearchParams();
        params.set('auto', 'format,compress');
        if (targetWidth) params.set('w', String(targetWidth));
        if (options.height) params.set('h', String(options.height));
        params.set('q', String(quality));
        params.set('fit', 'max');

        const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
        transformed = `https://${domain}${path}?${params.toString()}`;
        break;
      }

      case 'custom': {
        const base = (this.config.customCdnBaseUrl || '').replace(/\/+$/, '');
        if (base) {
          const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
          const params = new URLSearchParams();
          if (targetWidth) params.set('w', String(targetWidth));
          params.set('q', String(quality));
          params.set('fmt', format);
          const pStr = params.toString();
          transformed = `${base}${path}${pStr ? `?${pStr}` : ''}`;
        }
        break;
      }

      default:
        break;
    }

    // Preserve original version/cache-busting query parameter if present
    if (queryParams) {
      const sep = transformed.includes('?') ? '&' : '?';
      transformed = `${transformed}${sep}${queryParams}`;
    }

    return transformed;
  }
}

export const imageCdnService = new ImageCdnService();
