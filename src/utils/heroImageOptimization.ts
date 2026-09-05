import { ActiveView } from '../types';
import { SiteContent } from '../data/defaultSiteContent';

export interface OptimizedHeroImageData {
  url: string;
  blurDataUrl: string;
  aspectRatio: string; // e.g. '16/9', '1.91/1', '21/9'
  width: number;
  height: number;
  srcSet: string;
  sizes: string;
  alt: string;
  themeColor: string;
}

export type AspectRatioType = '16:9' | '1.91:1' | '21:9' | '4:3';

interface AspectRatioDimensions {
  ratioStr: string;
  cssRatio: string;
  calcHeight: (w: number) => number;
}

const ASPECT_RATIO_MAP: Record<AspectRatioType, AspectRatioDimensions> = {
  '16:9': {
    ratioStr: '16:9',
    cssRatio: '16/9',
    calcHeight: (w: number) => Math.round((w * 9) / 16)
  },
  '1.91:1': {
    ratioStr: '1.91:1',
    cssRatio: '1.91/1',
    calcHeight: (w: number) => Math.round(w / 1.91)
  },
  '21:9': {
    ratioStr: '21:9',
    cssRatio: '21/9',
    calcHeight: (w: number) => Math.round((w * 9) / 21)
  },
  '4:3': {
    ratioStr: '4:3',
    cssRatio: '4/3',
    calcHeight: (w: number) => Math.round((w * 3) / 4)
  }
};

/**
 * Creates an inline SVG shimmer blur placeholder (Data URI)
 * Renders instantly (0ms network time) while image loads
 */
export const createSvgBlurPlaceholder = (width: number, height: number, dominantColor = '#0f172a'): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stop-color="${dominantColor}" offset="0%"/>
        <stop stop-color="#1e293b" offset="50%"/>
        <stop stop-color="${dominantColor}" offset="100%"/>
      </linearGradient>
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <circle cx="${Math.round(width * 0.3)}" cy="${Math.round(height * 0.4)}" r="${Math.round(height * 0.35)}" fill="#38bdf8" opacity="0.18" filter="url(#b)"/>
    <circle cx="${Math.round(width * 0.75)}" cy="${Math.round(height * 0.6)}" r="${Math.round(height * 0.3)}" fill="#34d399" opacity="0.14" filter="url(#b)"/>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Strips existing query parameters from an Unsplash URL and builds optimized dynamic queries
 */
export const buildOptimizedUnsplashUrl = (
  baseUrl: string,
  width: number,
  height: number,
  quality = 80,
  blur?: number
): string => {
  if (!baseUrl || !baseUrl.includes('unsplash.com')) {
    return baseUrl;
  }

  // Remove existing query string if present
  const cleanUrl = baseUrl.split('?')[0];
  const params = new URLSearchParams();
  params.set('auto', 'format');
  params.set('fit', 'crop');
  params.set('w', String(width));
  params.set('h', String(height));
  params.set('q', String(quality));

  if (blur !== undefined && blur > 0) {
    params.set('blur', String(blur));
  }

  return `${cleanUrl}?${params.toString()}`;
};

/**
 * Generate responsive srcset for modern viewport breakpoints
 */
export const generateSrcSet = (rawUrl: string, aspectConfig: AspectRatioDimensions): string => {
  if (!rawUrl.includes('unsplash.com')) {
    return `${rawUrl} 1x`;
  }

  const widths = [640, 960, 1200, 1600, 2000];
  return widths
    .map(w => {
      const h = aspectConfig.calcHeight(w);
      const optUrl = buildOptimizedUnsplashUrl(rawUrl, w, h, 80);
      return `${optUrl} ${w}w`;
    })
    .join(', ');
};

// Curated view-specific dynamic base templates with semantic theme colors
interface ViewHeroConfig {
  baseImage: string;
  alt: string;
  themeColor: string;
}

const VIEW_HERO_CATALOG: Record<string, ViewHeroConfig> = {
  HOMEPAGE: {
    baseImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec',
    alt: 'Global B2B Logistics and Maritime Container Port Hub',
    themeColor: '#0f172a'
  },
  LANDING_PAGE: {
    baseImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    alt: 'International Corporate Trade and Cross-Border B2B Negotiation',
    themeColor: '#0f172a'
  },
  PRODUCT_DIRECTORY: {
    baseImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
    alt: 'Modern Automated Industrial Warehouse and Global Distribution Center',
    themeColor: '#1e293b'
  },
  RFQ_HUB: {
    baseImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b',
    alt: 'Global Procurement Contracts and Live Sourcing Tenders',
    themeColor: '#091e3a'
  },
  SUPPLIERS_DIRECTORY: {
    baseImage: 'https://images.unsplash.com/photo-1565891741441-64926e441838',
    alt: 'Verified Advanced Manufacturing Facility and OEM Production Line',
    themeColor: '#111827'
  },
  BUYERS_DIRECTORY: {
    baseImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    alt: 'Verified International Importers and Procurement Directors',
    themeColor: '#0f172a'
  },
  BUY_LEADS: {
    baseImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    alt: 'High Volume Commercial Buy Leads and Export Demand Analytics',
    themeColor: '#1e1b4b'
  },
  TRUST_SAFETY: {
    baseImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
    alt: 'Encrypted Escrow Protection and Verified Supplier Due Diligence',
    themeColor: '#064e3b'
  },
  INSIGHTS: {
    baseImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
    alt: 'Global Commodity Trade Intelligence and Export Market Analysis',
    themeColor: '#0f172a'
  },
  PREMIUM_MEMBERSHIP: {
    baseImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e',
    alt: 'Premium Gold Exporter Membership Tier and Sourcing Acceleration',
    themeColor: '#1e293b'
  },
  INCOTERMS_CALCULATOR: {
    baseImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec',
    alt: 'Incoterms 2020 Freight Shipping and Customs Risk Assessment',
    themeColor: '#0f172a'
  },
  ABOUT_US: {
    baseImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    alt: 'Global Trade Heaven Operations Team and International Trade Network',
    themeColor: '#0f172a'
  },
  PRODUCT_LISTING_POLICY: {
    baseImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b',
    alt: 'International Trade Regulations and Export Compliance Framework',
    themeColor: '#0f172a'
  },
  PRIVACY_POLICY: {
    baseImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b',
    alt: 'Enterprise Data Protection and Privacy Compliance',
    themeColor: '#0f172a'
  },
  TERMS_OF_USE: {
    baseImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b',
    alt: 'Trade Heaven Enterprise User Agreement and Legal Terms',
    themeColor: '#0f172a'
  },
  VENDOR_PROFILE: {
    baseImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    alt: 'Verified Manufacturer Corporate Headquarters and Storefront',
    themeColor: '#0f172a'
  },
  DEFAULT: {
    baseImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    alt: 'Trade Heaven Global B2B Wholesale Marketplace',
    themeColor: '#0f172a'
  }
};

/**
 * Resolves a dynamic, optimized hero image data structure for any ActiveView
 * Uses dynamic siteContent when available, generates optimized aspect ratio queries,
 * and creates high-performance blur-up placeholders.
 */
export const getDynamicHeroImageForView = (
  view: ActiveView | string,
  siteContent?: SiteContent,
  aspectRatioType: AspectRatioType = '1.91:1',
  targetWidth = 1200,
  quality = 80
): OptimizedHeroImageData => {
  const aspectConfig = ASPECT_RATIO_MAP[aspectRatioType] || ASPECT_RATIO_MAP['1.91:1'];
  const targetHeight = aspectConfig.calcHeight(targetWidth);

  // Check if siteContent has a custom configured hero image for homepage
  let rawBaseUrl = '';
  if ((view === 'HOMEPAGE' || view === 'LANDING_PAGE') && siteContent?.homepage?.heroBgImage?.trim()) {
    rawBaseUrl = siteContent.homepage.heroBgImage.trim();
  }

  const catalogEntry = VIEW_HERO_CATALOG[view] || VIEW_HERO_CATALOG.DEFAULT;
  if (!rawBaseUrl) {
    rawBaseUrl = catalogEntry.baseImage;
  }

  // 1. Generate full-resolution optimized URL with dynamic query parameters
  const fullOptimizedUrl = buildOptimizedUnsplashUrl(rawBaseUrl, targetWidth, targetHeight, quality);

  // 2. Generate lightweight blur-up placeholder URL (tiny 40px width, heavy blur)
  const microBlurUrl = buildOptimizedUnsplashUrl(rawBaseUrl, 40, aspectConfig.calcHeight(40), 20, 20);

  // 3. Generate instant SVG shimmer data URI as fallback blur-up layer
  const instantSvgPlaceholder = createSvgBlurPlaceholder(targetWidth, targetHeight, catalogEntry.themeColor);

  // 4. Generate responsive srcSet for high-DPI and multi-device displays
  const srcSet = generateSrcSet(rawBaseUrl, aspectConfig);

  return {
    url: fullOptimizedUrl,
    blurDataUrl: microBlurUrl || instantSvgPlaceholder,
    aspectRatio: aspectConfig.cssRatio,
    width: targetWidth,
    height: targetHeight,
    srcSet,
    sizes: '(max-width: 768px) 100vw, (max-width: 1280px) 1200px, 1600px',
    alt: catalogEntry.alt,
    themeColor: catalogEntry.themeColor
  };
};
