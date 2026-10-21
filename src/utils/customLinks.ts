/**
 * Custom Deep-Linking and URL Sharing Utilities for Trade Heaven
 * Enables custom, clean shareable links for every page, storefront, product, RFQ, and category.
 */

import { Product, CompanyProfile, RfqRequirement, ActiveView } from '../types';
import { MOCK_COMPANIES, MOCK_PRODUCTS, MOCK_RFQS } from '../data/mockData';
import { DETAILED_VENDOR_PROFILES } from '../data/detailedVendorProfiles';

export type CustomLinkType = 'STOREFRONT' | 'PRODUCT' | 'RFQ' | 'BUYER' | 'CATEGORY' | 'PAGE';

export interface CustomLinkOptions {
  type: CustomLinkType;
  id?: string;
  title?: string;
  view?: ActiveView | string;
  category?: string;
  search?: string;
  tab?: string;
  buyerId?: string;
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a company ID from either direct ID or human-readable slug / company name
 */
export function resolveCompanyId(idOrSlug: string, customCompanies?: CompanyProfile[]): string | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.trim();
  const lower = clean.toLowerCase();
  const slug = slugify(clean);

  // 1. Direct ID match in DETAILED_VENDOR_PROFILES
  if (DETAILED_VENDOR_PROFILES[clean]) return clean;

  // 2. Direct ID or slug match in passed or mock companies
  const companyPool = customCompanies && customCompanies.length > 0 ? customCompanies : MOCK_COMPANIES;
  const found = companyPool.find(c => {
    if (!c) return false;
    if (c.id === clean || c.id.toLowerCase() === lower) return true;
    if (slugify(c.companyName) === slug) return true;
    if (c.companyName && c.companyName.toLowerCase().includes(lower)) return true;
    return false;
  });
  if (found) return found.id;

  // 3. Check DETAILED_VENDOR_PROFILES by name or slug
  for (const [id, prof] of Object.entries(DETAILED_VENDOR_PROFILES)) {
    if (id.toLowerCase() === lower) return id;
    if (slugify(prof.companyName) === slug) return id;
    if (prof.companyName.toLowerCase().includes(lower)) return id;
  }

  // 4. Special cases (e.g. mp-commodity, apex, etc.)
  if (lower.includes('mpcommodity') || lower.includes('mp-commodity') || lower.includes('melissa')) {
    return 'comp-melissa-mpcommodity';
  }
  if (lower.includes('apex')) {
    return 'comp-apex-motorsport';
  }

  return clean;
}

/**
 * Resolves a product ID from either direct ID, slug, or title keyword
 */
export function resolveProductId(idOrSlug: string, productPool: Product[] = MOCK_PRODUCTS): string | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.trim();
  const lower = clean.toLowerCase();
  const slug = slugify(clean);

  // Direct ID match
  const direct = productPool.find(p => p.id === clean || p.id.toLowerCase() === lower);
  if (direct) return direct.id;

  // Slug or title match
  const bySlug = productPool.find(p => {
    if (!p) return false;
    if (slugify(p.title) === slug) return true;
    if (p.title.toLowerCase().includes(lower)) return true;
    return false;
  });
  if (bySlug) return bySlug.id;

  return clean;
}

/**
 * Resolves an RFQ ID from either direct ID, slug, or title keyword
 */
export function resolveRfqId(idOrSlug: string, rfqPool: RfqRequirement[] = MOCK_RFQS): string | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.trim();
  const lower = clean.toLowerCase();
  const slug = slugify(clean);

  const direct = rfqPool.find(r => r.id === clean || r.id.toLowerCase() === lower);
  if (direct) return direct.id;

  const bySlug = rfqPool.find(r => {
    if (!r) return false;
    if (slugify(r.productName || r.title || '') === slug) return true;
    if ((r.productName || r.title || '').toLowerCase().includes(lower)) return true;
    return false;
  });
  if (bySlug) return bySlug.id;

  return clean;
}

/**
 * Generates an absolute custom deep link for any entity or view
 */
export function buildCustomLink(options: CustomLinkOptions): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tradeheaven.net';
  const url = new URL(origin);

  switch (options.type) {
    case 'STOREFRONT': {
      if (options.id) {
        url.searchParams.set('company', options.id);
      }
      if (options.title) {
        url.searchParams.set('supplier', slugify(options.title));
      }
      if (options.tab) {
        url.searchParams.set('tab', options.tab);
      }
      break;
    }

    case 'PRODUCT': {
      if (options.id) {
        url.searchParams.set('product', options.id);
      }
      if (options.category && options.category !== 'ALL') {
        url.searchParams.set('category', options.category);
      }
      break;
    }

    case 'RFQ': {
      if (options.id) {
        url.searchParams.set('rfq', options.id);
      }
      url.searchParams.set('view', 'BUY_LEADS');
      break;
    }

    case 'BUYER': {
      if (options.id || options.buyerId) {
        url.searchParams.set('buyer', options.id || options.buyerId || '');
      }
      url.searchParams.set('view', 'BUYER_PROFILE');
      break;
    }

    case 'CATEGORY': {
      url.searchParams.set('view', 'PRODUCT_DIRECTORY');
      if (options.category && options.category !== 'ALL') {
        url.searchParams.set('category', options.category);
      }
      if (options.search) {
        url.searchParams.set('search', options.search);
      }
      break;
    }

    case 'PAGE':
    default: {
      if (options.view && options.view !== 'HOMEPAGE') {
        url.searchParams.set('view', options.view);
      }
      if (options.category && options.category !== 'ALL') {
        url.searchParams.set('category', options.category);
      }
      if (options.search) {
        url.searchParams.set('search', options.search);
      }
      break;
    }
  }

  return url.toString();
}

/**
 * Robust copy-to-clipboard with fallback for iframe / security restricted environments
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Fall back to DOM execCommand
  }

  // 2. Fallback via temporary textarea
  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.warn('[copyTextToClipboard] Fallback failed:', err);
  }

  return false;
}

/**
 * 1-Click Social Sharing actions
 */
export function shareViaPlatform(
  platform: 'whatsapp' | 'email' | 'linkedin' | 'twitter',
  data: { url: string; title: string; summary?: string }
): void {
  const { url, title, summary } = data;
  const encodedUrl = encodeURIComponent(url);
  const textMessage = `${title}${summary ? `\n${summary}` : ''}\n\nView direct on Trade Heaven:`;

  let shareTarget = '';
  switch (platform) {
    case 'whatsapp':
      shareTarget = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${textMessage}\n${url}`)}`;
      break;
    case 'email':
      shareTarget = `mailto:?subject=${encodeURIComponent(`Trade Heaven: ${title}`)}&body=${encodeURIComponent(`${textMessage}\n\n${url}`)}`;
      break;
    case 'linkedin':
      shareTarget = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'twitter':
      shareTarget = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`;
      break;
  }

  if (shareTarget && typeof window !== 'undefined') {
    window.open(shareTarget, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Native device share dialog (mobile devices / web share API)
 */
export async function shareNative(data: { url: string; title: string; text?: string }): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text || `${data.title} on Trade Heaven B2B Portal`,
        url: data.url
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed:', err);
      }
    }
  }
  return false;
}
