export interface VisualProductImageCandidate {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  sourceDomain?: string;
  width?: number;
  height?: number;
  relevanceScore?: number;
}

export interface VisualProductSearchResponse {
  success: boolean;
  status: 'ok' | 'cached' | 'api_key_missing' | 'quota_exceeded' | 'no_relevant_matches' | 'invalid_query' | 'error';
  message?: string;
  configRequired?: boolean;
  fromCache?: boolean;
  provider?: string;
  queryUsed?: string;
  totalVerified?: number;
  images: VisualProductImageCandidate[];
  pool: VisualProductImageCandidate[];
}

const SESSION_CACHE = new Map<string, { data: VisualProductSearchResponse; cachedAt: number }>();
const INFLIGHT_REQUESTS = new Map<string, Promise<VisualProductSearchResponse>>();
const BROKEN_EXTERNAL_URLS = new Set<string>();
const LOCAL_MIRROR_MAP = new Map<string, string>();
const INFLIGHT_AUTO_UPLOADS = new Map<string, Promise<string | null>>();
const BOUND_LOCAL_KEYS = new Set<string>();

const LOCAL_STORAGE_CACHE_KEY = 'th_visual_product_image_cache_v4';
const LOCAL_MIRROR_STORAGE_KEY = 'th_local_uploaded_image_mirrors_v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
let mirrorCacheHydrated = false;

const GENERIC_PLACEHOLDER_PATTERNS = [
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
  'alamy.com',
  '123rf.com',
  'depositphotos.com',
  'dreamstime.com',
  'vecteezy_',
  'default-icon',
  'diwali-offer-banner',
  'tradeheavenb2bbest.svg',
  '3c3cbe4e5111',
  '7a4884fb28b0',
  'cfabdbbb40fa',
  'e31092549661',
  'market-share',
  'global-market-insights',
  'changing-automotive',
  '3d-render',
  '3d_render'
];

const MISMATCH_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'export', 'grade', 'quality',
  'wholesale', 'bulk', 'supply', 'direct', 'factory', 'oem', 'odm', 'verified',
  'new', 'high', 'best', 'commercial', 'industrial', 'product', 'products', 'unit', 'units',
  'tons', 'metric', 'pcs', 'pieces', 'kgs', 'kg', 'ton', 'pure', 'natural', 'premium',
  'standard', 'international', 'global', 'certified', 'genuine', 'original', 'custom',
  'rfq', 'wanted', 'urgent', 'requirement', 'tender', 'cif', 'fob', 'port', 'auto', 'catalog'
]);

function extractTopicTokensClient(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !/^\d+$/.test(w) && !MISMATCH_STOPWORDS.has(w));
}

function tokenStemOverlap(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return true;
  const sa = a.endsWith('s') && a.length > 4 ? a.slice(0, -1) : a;
  const sb = b.endsWith('s') && b.length > 4 ? b.slice(0, -1) : b;
  return sa.length >= 3 && sb.length >= 3 && (sa === sb || (sa.length >= 4 && sb.length >= 4 && (sa.includes(sb) || sb.includes(sa))));
}

export function isMismatchedProductImageUrl(
  imageUrl?: string,
  productTitle?: string,
  category?: string
): boolean {
  const lowerUrl = String(imageUrl || '').trim().toLowerCase().split('?')[0];
  if (!lowerUrl) return false;
  const target = `${productTitle || ''} ${category || ''}`.toLowerCase();
  if (!target.trim()) return false;

  if (
    lowerUrl.includes('agricultural_rice_husk_powder') &&
    !/(rice|husk|agri|biomass|briquette|pellet|ash|powder)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('leather_belt') &&
    !/(leather|belt|apparel|fashion|strap|wallet|accessory|hide)/i.test(target)
  ) {
    return true;
  }
  if (
    (lowerUrl.includes('saree') || lowerUrl.includes('shree')) &&
    !/(saree|sari|textile|apparel|garment|silk|fabric|cloth)/i.test(target)
  ) {
    return true;
  }
  if (
    (lowerUrl.includes('image002_50ab7837') || lowerUrl.includes('image003_6c1f0619')) &&
    !/(generator|genset|cummins|cat power|diesel power|power generation)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('image004_fa37a57a') &&
    !/(tank|storage tank|fuel tank|gallon)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('image005_20fe3db0') &&
    !/(excavator|construction equipment|heavy equipment|cat\b|cummins|machinery|loader|bulldozer)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('stainless-steel-heavy-coils') &&
    !/(steel|coil|sheet|metal|alloy|iron|galvanized|rebar|plate)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('mineral-coal') &&
    !/(coal|anthracite|coking|steam coal|carbon|fuel|energy|mineral|mining|metallurgy)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('lithium-battery') &&
    !/(lithium|lifepo4|battery|batteries|energy storage|solar|power|electric|inverter|ess)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('en590-diesel') &&
    !/(diesel|en590|en 590|ulsd|fuel|oil|petroleum|energy|tank|gas oil)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('gold-bullion') &&
    !/(gold|bullion|bar|ingot|dore|precious metal|jewelry)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('sidath-vimukthi') &&
    !/(vanilla|pod|bean|spice|extract|orchid)/i.test(target)
  ) {
    return true;
  }
  if (
    lowerUrl.includes('whatsapp_image_') &&
    !/(jade|cabochon|turquoise|gemstone|nephrite|matrix|mineral|stone|jewel|crystal|blackstone|yunnan)/i.test(target)
  ) {
    return true;
  }

  // Enforce slug-to-title relevance on auto-generated or verified local upload filenames
  const fileName = lowerUrl.split('/').pop() || '';
  const autoMatch = fileName.match(/^(?:auto|verified)-([a-z0-9-]+)-[a-f0-9]{6,16}\.(?:webp|jpe?g|png)$/i) ||
    fileName.match(/^(?:verified-belt)-\d+\.(?:webp|jpe?g|png)$/i);
  if (autoMatch) {
    const rawSlug = autoMatch[1] || 'leather-belt';
    const slugTokens = extractTopicTokensClient(rawSlug.replace(/-/g, ' '));
    const targetTokens = extractTopicTokensClient(target);
    if (slugTokens.length >= 1 && targetTokens.length >= 1) {
      const hasOverlap = slugTokens.some(st =>
        targetTokens.some(tt => tokenStemOverlap(st, tt))
      );
      if (!hasOverlap) {
        return true;
      }
    }
  }

  return false;
}

function hydrateLocalMirrorMap(): void {
  if (typeof window === 'undefined' || mirrorCacheHydrated) return;
  mirrorCacheHydrated = true;
  try {
    const raw = window.localStorage.getItem(LOCAL_MIRROR_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === 'string' && typeof v === 'string' && v.startsWith('/assets/uploads/')) {
        LOCAL_MIRROR_MAP.set(k, v);
      }
    }
  } catch {
    // ignore storage errors
  }
}

function persistLocalMirrorMap(): void {
  if (typeof window === 'undefined') return;
  try {
    const out: Record<string, string> = {};
    const entries = Array.from(LOCAL_MIRROR_MAP.entries()).slice(-500);
    for (const [k, v] of entries) {
      out[k] = v;
    }
    window.localStorage.setItem(LOCAL_MIRROR_STORAGE_KEY, JSON.stringify(out));
  } catch {
    // ignore quota errors
  }
}

export function resolveLocalMirroredImageUrl(url?: string): string {
  const clean = String(url || '').trim();
  if (!clean) return '';
  if (clean.startsWith('/') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }
  hydrateLocalMirrorMap();
  const mirrored = LOCAL_MIRROR_MAP.get(clean);
  if (mirrored && !BROKEN_EXTERNAL_URLS.has(mirrored) && !BROKEN_EXTERNAL_URLS.has(mirrored.split('?')[0])) {
    return mirrored;
  }
  return clean;
}

export function cleanProductSearchSubject(rawName: string): string {
  let s = String(rawName || '').trim();
  if (!s) return '';
  // Remove parenthetical and bracketed logistics, VIP tags, engine, or port notes first
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\[[^\]]*\]/g, ' ');
  // Remove emoji / symbol prefixes and RFQ boilerplate tags
  s = s.replace(/^[^\wA-Za-z0-9]+/, '').trim();
  s = s.replace(/^(?:golden\s+lead|vip\s+exclusive|urgent\s+requirement|urgent\s+tender|buying\s+lead|buy\s+lead|sourcing\s+request|spot\s+tender|annual\s+contract|rfq|wanted)\b[\s:\-–—•]*/gi, '');
  s = s.replace(/^[^\wA-Za-z0-9]+/, '').trim();
  // Remove leading quantity/volume phrases e.g. "75,000 MT ", "10 Units ", "25,000 Barrels "
  s = s.replace(/^\d[\d,.]*\s*(?:mt|metric\s+tons?|tons?|units?|pcs|pieces|barrels?|bbl|containers?|fcl|teu|kg|kgs|liters?|lbs)\b\s*(?:of\s+)?/i, '');
  // Remove trailing contract/volume/tonnage specs e.g. "- 100,000 MT x 12 Months", "30-Ton", "500kW - 2,000kW"
  s = s.replace(/\s+[-–—]\s*\d[\d,.]*\s*(?:mt|tons?|units?|pcs|barrels?|fcl|mw|kw|months?|years?).*$/i, '');
  s = s.replace(/\b\d+(?:\.\d+)?\s*-\s*ton\b/gi, ' ');
  // Remove "Grade A" / "Grade-A" suffixes that narrow image search unnecessarily
  s = s.replace(/\bgrade\s+[a-z0-9+-]+\b/gi, ' ');
  // Remove manufacturer slash lists like "CAT / Cummins " so core product noun remains dominant
  s = s.replace(/\b[A-Za-z0-9]+\s*\/\s*[A-Za-z0-9]+\b/g, ' ');
  s = s.replace(/\s*&\s*/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s || String(rawName || '').trim();
}

function hydrateSessionCacheFromLocalStorage(): void {
  if (typeof window === 'undefined' || SESSION_CACHE.size > 0) return;
  hydrateLocalMirrorMap();
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    const now = Date.now();
    for (const [k, entry] of Object.entries(parsed)) {
      const rec = entry as { data?: VisualProductSearchResponse; cachedAt?: number };
      if (
        rec &&
        rec.data &&
        rec.data.success &&
        Array.isArray(rec.data.pool) &&
        rec.data.pool.length >= 10 &&
        typeof rec.cachedAt === 'number' &&
        now - rec.cachedAt < CACHE_TTL_MS
      ) {
        const mappedPool = rec.data.pool.map(item => ({
          ...item,
          url: resolveLocalMirroredImageUrl(item.url),
          thumbnailUrl: resolveLocalMirroredImageUrl(item.thumbnailUrl || item.url)
        }));
        SESSION_CACHE.set(k, {
          data: {
            ...rec.data,
            pool: mappedPool,
            images: mappedPool.slice(0, rec.data.images?.length || 15)
          },
          cachedAt: rec.cachedAt
        });
      }
    }
  } catch {
    // ignore storage errors
  }
}

function persistSessionCacheToLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const out: Record<string, { data: VisualProductSearchResponse; cachedAt: number }> = {};
    const entries = Array.from(SESSION_CACHE.entries()).slice(-120);
    for (const [k, v] of entries) {
      out[k] = v;
    }
    window.localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(out));
  } catch {
    // ignore storage quota errors
  }
}

export function fisherYatesShuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function normalizeVisualQueryKey(productName: string, category?: string): string {
  const cleanedSubject = cleanProductSearchSubject(productName);
  const n = String(cleanedSubject || productName || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const c = String(category || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return c ? `${n}::${c}` : n;
}

export function isGenericOrPlaceholderImageUrl(url?: string): boolean {
  const clean = String(url || '').trim().toLowerCase();
  if (!clean) return true;
  return GENERIC_PLACEHOLDER_PATTERNS.some(p => clean.includes(p));
}

export function isManuallyUploadedImageUrl(url?: string): boolean {
  const clean = String(url || '').trim();
  if (!clean) return false;
  if (isGenericOrPlaceholderImageUrl(clean)) return false;
  if (
    clean.startsWith('data:image/') ||
    clean.startsWith('blob:') ||
    clean.startsWith('/assets/uploads/') ||
    clean.startsWith('/uploads/') ||
    clean.startsWith('/src/assets/')
  ) {
    return true;
  }
  return /^https?:\/\//i.test(clean);
}

export function markBrokenExternalImageUrl(url: string): void {
  const clean = String(url || '').trim();
  if (!clean) return;
  BROKEN_EXTERNAL_URLS.add(clean);
  const base = clean.split('?')[0];
  if (base) BROKEN_EXTERNAL_URLS.add(base);
  let evicted = false;
  for (const [k, v] of LOCAL_MIRROR_MAP.entries()) {
    if (v === clean || v.split('?')[0] === base) {
      LOCAL_MIRROR_MAP.delete(k);
      evicted = true;
    }
  }
  if (evicted) {
    persistLocalMirrorMap();
  }
}

export function isBrokenExternalImageUrl(url?: string): boolean {
  const clean = String(url || '').trim();
  return clean ? BROKEN_EXTERNAL_URLS.has(clean) : true;
}

export function getNextHealthyReplacementUrl(
  pool: Array<VisualProductImageCandidate | string>,
  excludeUrls: string[] = []
): string | null {
  const excluded = new Set(excludeUrls.map(u => String(u || '').trim()).filter(Boolean));
  for (const item of pool || []) {
    const u = typeof item === 'string' ? item : item?.url;
    const clean = resolveLocalMirroredImageUrl(String(u || '').trim());
    if (!clean || excluded.has(clean) || BROKEN_EXTERNAL_URLS.has(clean)) continue;
    return clean;
  }
  return null;
}

function replaceUrlInSessionCaches(externalUrl: string, localUrl: string): void {
  let changed = false;
  for (const [, entry] of SESSION_CACHE.entries()) {
    let poolUpdated = false;
    const nextPool = (entry.data.pool || []).map(item => {
      if (item.url === externalUrl || item.thumbnailUrl === externalUrl) {
        poolUpdated = true;
        return {
          ...item,
          url: item.url === externalUrl ? localUrl : item.url,
          thumbnailUrl: item.thumbnailUrl === externalUrl ? localUrl : item.thumbnailUrl
        };
      }
      return item;
    });
    if (poolUpdated) {
      entry.data.pool = nextPool;
      entry.data.images = (entry.data.images || []).map(item =>
        item.url === externalUrl ? { ...item, url: localUrl, thumbnailUrl: localUrl } : item
      );
      changed = true;
    }
  }
  if (changed) {
    persistSessionCacheToLocalStorage();
  }
}

export async function autoUploadDisplayedProductImage(params: {
  imageUrl: string;
  productId?: string;
  productName?: string;
  category?: string;
}): Promise<string | null> {
  const rawUrl = String(params.imageUrl || '').trim();
  if (!rawUrl) return null;
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }

  const cleanProductId = String(params.productId || '').trim();
  const cleanProductTitle = cleanProductSearchSubject(params.productName || '');
  const isAlreadyLocal =
    rawUrl.startsWith('/assets/uploads/') ||
    rawUrl.startsWith('/src/assets/') ||
    rawUrl.startsWith('/uploads/');

  if (isAlreadyLocal) {
    const cleanLocal = rawUrl.split('?')[0];
    if (!cleanProductId && cleanProductTitle.length < 3) {
      return cleanLocal;
    }
    const bindKey = `${cleanLocal}::${cleanProductId}::${cleanProductTitle}`;
    if (BOUND_LOCAL_KEYS.has(bindKey)) {
      return cleanLocal;
    }
    if (INFLIGHT_AUTO_UPLOADS.has(bindKey)) {
      return INFLIGHT_AUTO_UPLOADS.get(bindKey)!;
    }
    const bindJob = (async (): Promise<string | null> => {
      const bindPayload = {
        image_url: cleanLocal,
        product_id: cleanProductId,
        product_name: cleanProductTitle,
        category: params.category || ''
      };
      try {
        const res = await fetch('/api/v1/products/auto-upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bindPayload)
        });
        if (res.ok) {
          const json = await res.json();
          const resolved = String(json?.localUrl || json?.url || cleanLocal).trim();
          BOUND_LOCAL_KEYS.add(bindKey);
          return resolved || cleanLocal;
        }
      } catch {}
      try {
        const phpRes = await fetch('/api.php?action=auto_upload_product_image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bindPayload)
        });
        if (phpRes.ok) {
          BOUND_LOCAL_KEYS.add(bindKey);
        }
      } catch {}
      return cleanLocal;
    })();
    INFLIGHT_AUTO_UPLOADS.set(bindKey, bindJob);
    try {
      return await bindJob;
    } finally {
      INFLIGHT_AUTO_UPLOADS.delete(bindKey);
    }
  }

  if (!/^https?:\/\//i.test(rawUrl) || BROKEN_EXTERNAL_URLS.has(rawUrl)) {
    return null;
  }

  hydrateLocalMirrorMap();
  const extBindKey = `${rawUrl}::${cleanProductId}::${cleanProductTitle}`;
  if (LOCAL_MIRROR_MAP.has(rawUrl)) {
    const cachedLocal = LOCAL_MIRROR_MAP.get(rawUrl)!;
    if ((cleanProductId || cleanProductTitle.length >= 3) && !BOUND_LOCAL_KEYS.has(extBindKey)) {
      BOUND_LOCAL_KEYS.add(extBindKey);
      void autoUploadDisplayedProductImage({
        imageUrl: cachedLocal,
        productId: cleanProductId,
        productName: cleanProductTitle,
        category: params.category
      });
    }
    return cachedLocal;
  }

  if (INFLIGHT_AUTO_UPLOADS.has(extBindKey)) {
    return INFLIGHT_AUTO_UPLOADS.get(extBindKey)!;
  }

  const job = (async (): Promise<string | null> => {
    const payload = {
      image_url: rawUrl,
      product_id: cleanProductId,
      product_name: cleanProductTitle,
      category: params.category || ''
    };

    try {
      const res = await fetch('/api/v1/products/auto-upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        const localUrl = String(json?.localUrl || json?.url || '').trim();
        if (json?.success && localUrl.startsWith('/assets/uploads/')) {
          LOCAL_MIRROR_MAP.set(rawUrl, localUrl);
          if (cleanProductId) {
            LOCAL_MIRROR_MAP.set(`pid::${cleanProductId}`, localUrl);
          }
          BOUND_LOCAL_KEYS.add(extBindKey);
          BOUND_LOCAL_KEYS.add(`${localUrl}::${cleanProductId}::${cleanProductTitle}`);
          persistLocalMirrorMap();
          replaceUrlInSessionCaches(rawUrl, localUrl);
          return localUrl;
        }
      }
    } catch {
      // fallback to PHP endpoint
    }

    try {
      const phpRes = await fetch('/api.php?action=auto_upload_product_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (phpRes.ok) {
        const json = await phpRes.json();
        const localUrl = String(json?.localUrl || json?.url || '').trim();
        if (json?.success && localUrl.startsWith('/assets/uploads/')) {
          LOCAL_MIRROR_MAP.set(rawUrl, localUrl);
          if (cleanProductId) {
            LOCAL_MIRROR_MAP.set(`pid::${cleanProductId}`, localUrl);
          }
          BOUND_LOCAL_KEYS.add(extBindKey);
          BOUND_LOCAL_KEYS.add(`${localUrl}::${cleanProductId}::${cleanProductTitle}`);
          persistLocalMirrorMap();
          replaceUrlInSessionCaches(rawUrl, localUrl);
          return localUrl;
        }
      }
    } catch {
      // ignore
    }

    return null;
  })();

  INFLIGHT_AUTO_UPLOADS.set(extBindKey, job);
  try {
    return await job;
  } finally {
    INFLIGHT_AUTO_UPLOADS.delete(extBindKey);
  }
}

const MAX_CONCURRENT_REQUESTS = 4;
let activeRequestCount = 0;
const requestQueue: Array<() => void> = [];

async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (activeRequestCount >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>(resolve => requestQueue.push(resolve));
  }
  activeRequestCount++;
  try {
    return await fn();
  } finally {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    const next = requestQueue.shift();
    if (next) next();
  }
}

export async function fetchVisualProductImages(params: {
  productName: string;
  productId?: string;
  category?: string;
  specifications?: string;
  count?: number;
  forceRefresh?: boolean;
  shuffleOnly?: boolean;
}): Promise<VisualProductSearchResponse> {
  hydrateSessionCacheFromLocalStorage();

  const rawProductName = String(params.productName || '').trim();
  const cleanedProductName = cleanProductSearchSubject(rawProductName);
  const productName = cleanedProductName.length >= 2 ? cleanedProductName : rawProductName;
  const productId = String(params.productId || '').trim();
  const category = String(params.category || '').trim();
  const specifications = String(params.specifications || '').trim();
  const count = Math.max(12, Math.min(18, Number(params.count) || 15));

  if (productName.length < 2) {
    return {
      success: false,
      status: 'invalid_query',
      message: 'Enter a product title to auto-fetch verified product images.',
      images: [],
      pool: []
    };
  }

  const key = normalizeVisualQueryKey(productName, category);

  // Instant Fisher-Yates shuffle on cached session pool when user clicks Shuffle/Refresh
  if (params.shuffleOnly && SESSION_CACHE.has(key)) {
    const cached = SESSION_CACHE.get(key)!.data;
    if (cached.success && Array.isArray(cached.pool) && cached.pool.length > 0) {
      const healthyPool = cached.pool
        .filter(img => img?.url && !BROKEN_EXTERNAL_URLS.has(img.url))
        .map(img => ({
          ...img,
          url: resolveLocalMirroredImageUrl(img.url),
          thumbnailUrl: resolveLocalMirroredImageUrl(img.thumbnailUrl || img.url)
        }));
      const shuffled = fisherYatesShuffle(healthyPool.length > 0 ? healthyPool : cached.pool);
      return {
        ...cached,
        fromCache: true,
        images: shuffled.slice(0, count),
        pool: shuffled
      };
    }
  }

  if (!params.forceRefresh && SESSION_CACHE.has(key)) {
    const entry = SESSION_CACHE.get(key)!;
    if (Date.now() - entry.cachedAt < CACHE_TTL_MS && entry.data.success && entry.data.pool.length > 0) {
      const healthyPool = entry.data.pool
        .filter(img => img?.url && !BROKEN_EXTERNAL_URLS.has(img.url))
        .map(img => ({
          ...img,
          url: resolveLocalMirroredImageUrl(img.url),
          thumbnailUrl: resolveLocalMirroredImageUrl(img.thumbnailUrl || img.url)
        }));
      const shuffled = fisherYatesShuffle(healthyPool.length > 0 ? healthyPool : entry.data.pool);
      return {
        ...entry.data,
        fromCache: true,
        images: shuffled.slice(0, count),
        pool: shuffled
      };
    }
  }

  const inflightKey = `${key}::${params.forceRefresh ? 'fresh' : 'std'}`;
  if (INFLIGHT_REQUESTS.has(inflightKey)) {
    return INFLIGHT_REQUESTS.get(inflightKey)!;
  }

  const runPromise = withConcurrencyLimit(async (): Promise<VisualProductSearchResponse> => {
    const payload = {
      product_name: productName,
      product_id: productId,
      category,
      specifications,
      count,
      force_refresh: Boolean(params.forceRefresh)
    };

    const parsePayload = (raw: any): VisualProductSearchResponse => {
      const rawPool: VisualProductImageCandidate[] = Array.isArray(raw?.pool)
        ? raw.pool
        : Array.isArray(raw?.images)
        ? raw.images
        : [];
      const healthyPool = rawPool
        .filter(c => c?.url && !BROKEN_EXTERNAL_URLS.has(c.url))
        .map(c => ({
          ...c,
          url: resolveLocalMirroredImageUrl(c.url),
          thumbnailUrl: resolveLocalMirroredImageUrl(c.thumbnailUrl || c.url)
        }));
      const finalPool = fisherYatesShuffle(healthyPool.length > 0 ? healthyPool : rawPool);
      const selected = finalPool.slice(0, count);
      return {
        success: Boolean(raw?.success) && selected.length > 0,
        status: raw?.status || (selected.length > 0 ? 'ok' : 'error'),
        message: raw?.message,
        configRequired: Boolean(raw?.configRequired),
        fromCache: Boolean(raw?.fromCache),
        provider: raw?.provider,
        queryUsed: raw?.queryUsed,
        totalVerified: Number(raw?.totalVerified || finalPool.length) || finalPool.length,
        images: selected,
        pool: finalPool
      };
    };

    const tryBackendFetch = async (endpoint: string): Promise<VisualProductSearchResponse | null> => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        const ctype = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || ctype.includes('text/html')) return null;
        const json = await res.json().catch(() => null);
        if (!json || typeof json !== 'object') return null;
        if (json.service && !Array.isArray(json.images) && !Array.isArray(json.pool)) return null;
        const normalized = parsePayload(json);
        // Reject off-topic candidates returned by older PHP fallbacks
        const cleanPool = normalized.pool.filter(
          c => !isGenericOrPlaceholderImageUrl(c.url) && !isMismatchedProductImageUrl(c.url, productName, category)
        );
        if (normalized.success && cleanPool.length > 0) {
          const finalNorm: VisualProductSearchResponse = {
            ...normalized,
            pool: cleanPool,
            images: cleanPool.slice(0, count),
            totalVerified: cleanPool.length
          };
          SESSION_CACHE.set(key, { data: finalNorm, cachedAt: Date.now() });
          persistSessionCacheToLocalStorage();
          return finalNorm;
        }
      } catch {
        // ignore network/parse error
      }
      return null;
    };

    const primaryVisual = await tryBackendFetch('/api/v1/products/fetch-images');
    if (primaryVisual) return primaryVisual;

    const phpVisual = await tryBackendFetch('/api.php?action=fetch_product_images');
    if (phpVisual) return phpVisual;

    // Standalone Chrome fallback: query Wikimedia Commons directly via CORS (origin=*) with crisp focused queries
    try {
      const wikiCandidates = await fetchWikimediaCommonsCorsCandidates(productName, category, count);
      if (wikiCandidates.length > 0) {
        const wikiResp: VisualProductSearchResponse = {
          success: true,
          status: 'ok',
          provider: 'wikimedia_commons_live',
          queryUsed: `${productName} ${category}`.trim(),
          totalVerified: wikiCandidates.length,
          images: wikiCandidates.slice(0, count),
          pool: wikiCandidates
        };
        SESSION_CACHE.set(key, { data: wikiResp, cachedAt: Date.now() });
        persistSessionCacheToLocalStorage();
        return wikiResp;
      }
    } catch {
      // ignore Wikimedia fallback errors
    }

    // Only return verified server media library assets that actually match this product's tokens (never score-0 random images)
    try {
      const serverMediaCandidates = await buildServerMediaLibraryCandidates(productName, category, count);
      if (serverMediaCandidates.length > 0) {
        const fallbackResp: VisualProductSearchResponse = {
          success: true,
          status: 'ok',
          provider: 'server_media_library_verified',
          queryUsed: `${productName} ${category}`.trim(),
          totalVerified: serverMediaCandidates.length,
          images: serverMediaCandidates.slice(0, count),
          pool: serverMediaCandidates
        };
        SESSION_CACHE.set(key, { data: fallbackResp, cachedAt: Date.now() });
        persistSessionCacheToLocalStorage();
        return fallbackResp;
      }
    } catch {
      // ignore fallback errors
    }

    return {
      success: false,
      status: 'no_relevant_matches',
      message: `No matching verified photos were found automatically for "${productName}". Please upload a photo manually or refine the title.`,
      images: [],
      pool: []
    };
  });

  INFLIGHT_REQUESTS.set(inflightKey, runPromise);
  try {
    return await runPromise;
  } finally {
    INFLIGHT_REQUESTS.delete(inflightKey);
  }
}

const ASSIGNED_UPLOAD_IMAGE_URLS = new Set<string>();

/**
 * Ensures any new product or RFQ posted without a manual image upload (or with a placeholder/duplicate image)
 * automatically receives a verified, unique, category-relevant image from our >10 randomized relevant results pool.
 */
export async function ensureUniqueVerifiedProductImageForUpload(params: {
  productId?: string;
  productName: string;
  category?: string;
  specifications?: string;
  existingImageUrl?: string;
  existingGallery?: string[];
  usedUrls?: Iterable<string>;
}): Promise<{ primaryUrl: string; gallery: string[]; autoAssigned: boolean }> {
  const used = new Set<string>(ASSIGNED_UPLOAD_IMAGE_URLS);
  if (params.usedUrls) {
    for (const u of params.usedUrls) {
      const clean = String(u || '').trim().split('?')[0];
      if (clean) used.add(clean);
    }
  }

  const rawPrimary = String(
    params.existingImageUrl ||
      (Array.isArray(params.existingGallery) && params.existingGallery.length > 0 ? params.existingGallery[0] : '') ||
      ''
  ).trim();
  const cleanPrimary = rawPrimary.split('?')[0];

  // If a valid manual upload is provided and is not a generic placeholder or duplicate, keep it
  if (
    cleanPrimary &&
    !isGenericOrPlaceholderImageUrl(cleanPrimary) &&
    !used.has(cleanPrimary) &&
    isManuallyUploadedImageUrl(cleanPrimary)
  ) {
    ASSIGNED_UPLOAD_IMAGE_URLS.add(cleanPrimary);
    const gallery =
      Array.isArray(params.existingGallery) && params.existingGallery.length > 0
        ? params.existingGallery.filter(Boolean)
        : [rawPrimary];
    return { primaryUrl: rawPrimary, gallery, autoAssigned: false };
  }

  // Otherwise automatically fetch from our >10 randomized relevant results pool
  try {
    const searchRes = await fetchVisualProductImages({
      productName: params.productName || 'Wholesale Commodity',
      productId: params.productId,
      category: params.category,
      specifications: params.specifications,
      count: 15,
      forceRefresh: false
    });

    const pool = fisherYatesShuffle(
      Array.isArray(searchRes.pool) && searchRes.pool.length > 0
        ? searchRes.pool
        : Array.isArray(searchRes.images)
        ? searchRes.images
        : []
    );

    const pickedGallery: string[] = [];
    for (const cand of pool) {
      const candUrl = resolveLocalMirroredImageUrl(String(cand?.url || '').trim());
      const cleanCand = candUrl.split('?')[0];
      if (!cleanCand || isGenericOrPlaceholderImageUrl(cleanCand) || used.has(cleanCand)) continue;
      pickedGallery.push(candUrl);
      used.add(cleanCand);
      if (pickedGallery.length >= 3) break;
    }

    if (pickedGallery.length > 0) {
      let finalPrimary = pickedGallery[0];
      if (/^https?:\/\//i.test(finalPrimary)) {
        const mirrored = await autoUploadDisplayedProductImage({
          imageUrl: finalPrimary,
          productId: params.productId,
          productName: params.productName,
          category: params.category
        });
        if (mirrored) {
          finalPrimary = mirrored;
          pickedGallery[0] = mirrored;
        }
      }
      ASSIGNED_UPLOAD_IMAGE_URLS.add(finalPrimary.split('?')[0]);
      return {
        primaryUrl: finalPrimary,
        gallery: pickedGallery,
        autoAssigned: true
      };
    }
  } catch {
    // Backend submit_rfq / submit_listing / POST /api/v1/products will also enforce server-side visual resolution
  }

  return {
    primaryUrl: rawPrimary,
    gallery: Array.isArray(params.existingGallery) ? params.existingGallery.filter(Boolean) : rawPrimary ? [rawPrimary] : [],
    autoAssigned: false
  };
}

export interface CatalogImageAuditLogItem {
  record_id: string;
  record_type: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE';
  title: string;
  category: string;
  issue_type: 'DUPLICATE' | 'PLACEHOLDER_OR_MISSING' | 'MISMATCHED' | 'BROKEN_ASSET';
  issue_reason: string;
  old_image_url: string;
  new_image_url: string;
  query_used: string;
  status: 'FIXED' | 'FLAGGED';
}

export interface CatalogScannedCleanRecord {
  record_id: string;
  record_type: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE';
  title: string;
  category: string;
  current_image_url: string;
  previous_image_url?: string;
  updated_at?: string;
  status: 'CLEAN' | 'FLAGGED' | 'FIXED';
}

export interface CatalogImageAuditSummary {
  status: string;
  success: boolean;
  dry_run?: boolean;
  total_scanned: number;
  products_scanned?: number;
  rfqs_scanned?: number;
  categories_scanned?: number;
  duplicates_detected: number;
  mismatched_detected?: number;
  records_fixed: number;
  healthy_records?: number;
  timestamp?: string;
  audit_log: CatalogImageAuditLogItem[];
  catalog_records?: CatalogScannedCleanRecord[];
}

export interface SingleCatalogImageFixResult {
  success: boolean;
  record_id: string;
  record_type: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE';
  title: string;
  category: string;
  old_image_url: string;
  new_image_url: string;
  query_used?: string;
  source?: string;
  is_fallback_card?: boolean;
  status: 'FIXED' | 'FLAGGED';
  updatedAt?: string;
  imageUpdatedAt?: number;
  message?: string;
}

async function fetchLiveServerImageStateRaw(): Promise<{
  overrides: Record<string, any>;
  mediaLibrary: Array<{ url?: string; name?: string }>;
}> {
  const endpoints = [
    `/api/v1/public/product-images?t=${Date.now()}`,
    `/api.php?action=get_product_images&t=${Date.now()}`
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { cache: 'no-store' });
      if (!res.ok) continue;
      const json = await res.json().catch(() => null);
      const data = json?.data || json;
      if (data && typeof data === 'object' && (data.overrides || data.mediaLibrary)) {
        return {
          overrides: (data.overrides && typeof data.overrides === 'object') ? data.overrides : {},
          mediaLibrary: Array.isArray(data.mediaLibrary) ? data.mediaLibrary : []
        };
      }
    } catch {
      // try next endpoint
    }
  }
  return { overrides: {}, mediaLibrary: [] };
}

function buildFocusedVisualSearchQueriesClient(productName: string, category?: string): string[] {
  const cleaned = cleanProductSearchSubject(productName).replace(/\s*&\s*/g, ', ');
  const clauses = cleaned
    .split(/[,;/]+/)
    .map(c => c.trim())
    .filter(c => c.length >= 3);
  const queries: string[] = [];
  const tokens = extractTopicTokensClient(cleaned);

  if (tokens.length >= 2 && tokens.length <= 4) {
    queries.push(tokens.join(' '));
  }
  for (const cl of clauses.slice(0, 3)) {
    const clTokens = extractTopicTokensClient(cl);
    if (clTokens.length >= 2) {
      queries.push(clTokens.slice(0, 3).join(' '));
    } else if (clTokens.length === 1 && tokens.length >= 2 && clTokens[0] !== tokens[0]) {
      queries.push(`${tokens[0]} ${clTokens[0]}`);
    } else if (clTokens.length === 1 && clTokens[0].length >= 4) {
      queries.push(clTokens[0]);
    }
  }
  if (tokens.length >= 3) {
    queries.push(tokens.slice(0, 3).join(' '));
    queries.push(`${tokens[0]} ${tokens[tokens.length - 1]}`);
  }
  if (queries.length === 0 && category) {
    const catToks = extractTopicTokensClient(category);
    if (catToks.length > 0) queries.push(catToks.slice(0, 2).join(' '));
  }
  return Array.from(new Set(queries.map(q => q.trim()).filter(q => q.length >= 3))).slice(0, 4);
}

async function fetchWikimediaCommonsCorsCandidates(
  productName: string,
  category?: string,
  limit = 15
): Promise<VisualProductImageCandidate[]> {
  if (typeof fetch !== 'function') return [];
  const queries = buildFocusedVisualSearchQueriesClient(productName, category);
  if (queries.length === 0) return [];
  const titleTokens = extractTopicTokensClient(cleanProductSearchSubject(productName));
  const badTitleRe = /(diagram|chart|logo|icon|map|coat_of_arms|flag|signature|screenshot|pdf|djvu|infographic|cartoon|drawing|painting|sketch|poster|brochure|advert|newspaper|magazine|catalogue|postcard|statelib|fortepan|bundesarchiv|18[89]\d|19[0-8]\d)/i;

  const seen = new Set<string>();
  const collected: VisualProductImageCandidate[] = [];

  await Promise.allSettled(
    queries.map(async qStr => {
      try {
        const url = `https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(`${qStr} filetype:bitmap`)}&gsrnamespace=6&gsrlimit=18&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json`;
        const resp = await fetch(url);
        if (!resp.ok) return;
        const data: any = await resp.json().catch(() => null);
        const pages = Object.values(data?.query?.pages || {}) as any[];
        for (const p of pages) {
          const info = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
          if (!info) continue;
          const rawTitle = String(p?.title || '');
          if (badTitleRe.test(rawTitle)) continue;
          const mime = String(info.mime || '').toLowerCase();
          if (!mime.includes('jpeg') && !mime.includes('png') && !mime.includes('webp')) continue;
          const w = Number(info.width || 0);
          const h = Number(info.height || 0);
          if ((w > 0 && w < 380) || (h > 0 && h < 280)) continue;
          const candUrl = String(info.thumburl || info.url || '').trim();
          if (!candUrl || seen.has(candUrl)) continue;

          const readableTitle = rawTitle.replace(/^File:/i, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
          const checkHay = `${readableTitle} ${candUrl}`.toLowerCase();
          const hits = titleTokens.filter(tk => checkHay.includes(tk) || (tk.length >= 4 && tokenStemOverlap(tk, checkHay)));
          const minNeeded = titleTokens.length >= 4 ? 2 : 1;
          if (titleTokens.length > 0 && hits.length < minNeeded) continue;
          if (isMismatchedProductImageUrl(candUrl, productName, category)) continue;

          seen.add(candUrl);
          collected.push({
            url: candUrl,
            thumbnailUrl: candUrl,
            title: readableTitle || qStr,
            sourceDomain: 'commons.wikimedia.org',
            width: w || undefined,
            height: h || undefined,
            relevanceScore: hits.length * 4 + (w >= h ? 2 : 0)
          });
        }
      } catch {
        // ignore single query errors
      }
    })
  );

  return collected
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, Math.max(limit, 15));
}

async function buildServerMediaLibraryCandidates(
  productName: string,
  category: string,
  count = 15
): Promise<VisualProductImageCandidate[]> {
  const { overrides, mediaLibrary } = await fetchLiveServerImageStateRaw();
  const titleTokens = extractTopicTokensClient(cleanProductSearchSubject(productName));
  const categoryTokens = extractTopicTokensClient(category);
  const tokens = titleTokens.length > 0 ? titleTokens : categoryTokens;
  if (tokens.length === 0) return [];

  const seenUrls = new Set<string>();
  const scored: Array<{ score: number; cand: VisualProductImageCandidate }> = [];

  const considerUrl = (rawUrl: string, labelHint: string) => {
    const clean = String(rawUrl || '').trim().split('?')[0];
    if (!clean || seenUrls.has(clean)) return;
    if (!clean.startsWith('/assets/uploads/')) return;
    if (isGenericOrPlaceholderImageUrl(clean) || /\.svg$/i.test(clean)) return;
    if (isMismatchedProductImageUrl(clean, productName, category)) return;
    seenUrls.add(clean);

    const hayTokens = extractTopicTokensClient(`${clean} ${labelHint}`);
    let titleHits = 0;
    let score = 0;
    for (const tok of titleTokens) {
      if (hayTokens.some(ht => ht === tok)) {
        titleHits++;
        score += 4;
      } else if (hayTokens.some(ht => tokenStemOverlap(ht, tok))) {
        titleHits++;
        score += 2;
      }
    }
    if (titleHits === 0) return;

    scored.push({
      score,
      cand: {
        url: clean,
        thumbnailUrl: clean,
        title: labelHint || clean.split('/').pop() || productName,
        sourceDomain: 'tradeheaven.net',
        relevanceScore: score
      }
    });
  };

  for (const [key, entry] of Object.entries(overrides)) {
    if (entry && typeof entry === 'object' && entry.primary) {
      considerUrl(String(entry.primary), key);
    }
  }
  for (const item of mediaLibrary) {
    if (item?.url) {
      considerUrl(String(item.url), String(item.name || ''));
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter(s => s.score >= 3)
    .map(s => s.cand)
    .slice(0, Math.max(count, 18));
}

function classifyClientAuditIssue(
  recId: string,
  title: string,
  category: string,
  imgUrl: string,
  seenUrls: Map<string, { id: string; title: string }>
): { flagged: false } | { flagged: true; type: CatalogImageAuditLogItem['issue_type']; reason: string } {
  const cleanUrl = String(imgUrl || '').trim().split('?')[0];
  if (!cleanUrl || cleanUrl === '(empty)') {
    return { flagged: true, type: 'PLACEHOLDER_OR_MISSING', reason: 'Empty or missing image_url' };
  }
  if (isGenericOrPlaceholderImageUrl(cleanUrl) || /\.svg$/i.test(cleanUrl)) {
    return { flagged: true, type: 'PLACEHOLDER_OR_MISSING', reason: 'Generic stock or placeholder asset detected' };
  }
  if (isMismatchedProductImageUrl(cleanUrl, title, category)) {
    return {
      flagged: true,
      type: 'MISMATCHED',
      reason: `Off-topic or cross-category image detected on "${title}"`
    };
  }
  const prev = seenUrls.get(cleanUrl);
  if (prev && prev.id !== recId) {
    return {
      flagged: true,
      type: 'DUPLICATE',
      reason: `Duplicate image_url shared with "${prev.title}" (${prev.id})`
    };
  }
  return { flagged: false };
}

async function runClientFallbackCatalogImageAudit(options: {
  dryRun: boolean;
  includeCatalog: boolean;
  catalogItems: Array<{
    id: string;
    type?: 'PRODUCT' | 'RFQ' | 'CATEGORY';
    title: string;
    category?: string;
    image_url?: string;
  }>;
}): Promise<CatalogImageAuditSummary> {
  const { overrides } = await fetchLiveServerImageStateRaw();
  let remoteRfqs: Array<{ id: string; title: string; category: string; image_url: string }> = [];
  try {
    const rRes = await fetch(`/api.php?action=get_rfqs&t=${Date.now()}`, { cache: 'no-store' });
    if (rRes.ok) {
      const rJson = await rRes.json().catch(() => null);
      const list = Array.isArray(rJson) ? rJson : Array.isArray(rJson?.data) ? rJson.data : Array.isArray(rJson?.rfqs) ? rJson.rfqs : [];
      remoteRfqs = list
        .filter((r: any) => r && (r.id || r.external_id) && String(r.title || '').trim().length > 0)
        .map((r: any) => {
          const rawId = String(r.external_id || r.id).trim();
          const normId = rawId.startsWith('rfq-') ? rawId : `rfq-${rawId}`;
          return {
            id: normId,
            title: String(r.title || normId),
            category: String(r.category || 'Global Sourcing'),
            image_url: String(r.image || r.image_url || (Array.isArray(r.images) ? r.images[0] : '') || '')
          };
        });
    }
  } catch {
    // ignore RFQ fetch errors
  }

  type ScanItem = {
    id: string;
    type: 'PRODUCT' | 'RFQ' | 'CATEGORY';
    title: string;
    category: string;
    baseUrl: string;
  };
  const dedupMap = new Map<string, ScanItem>();
  for (const item of options.catalogItems || []) {
    if (!item?.id) continue;
    const id = String(item.id).trim();
    dedupMap.set(id, {
      id,
      type: item.type || (id.startsWith('cat-') ? 'CATEGORY' : id.startsWith('rfq-') ? 'RFQ' : 'PRODUCT'),
      title: String(item.title || id),
      category: String(item.category || 'General'),
      baseUrl: String(item.image_url || '')
    });
  }
  for (const r of remoteRfqs) {
    if (!dedupMap.has(r.id)) {
      dedupMap.set(r.id, {
        id: r.id,
        type: 'RFQ',
        title: r.title,
        category: r.category,
        baseUrl: r.image_url
      });
    }
  }

  const seenUrls = new Map<string, { id: string; title: string }>();
  const auditLog: CatalogImageAuditLogItem[] = [];
  const catalogRecords: CatalogScannedCleanRecord[] = [];
  let productsScanned = 0;
  let rfqsScanned = 0;
  let categoriesScanned = 0;
  let duplicatesDetected = 0;
  let mismatchedDetected = 0;
  let recordsFixed = 0;
  const overridesToPersist: Record<string, any> = {};
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  for (const item of dedupMap.values()) {
    if (item.type === 'CATEGORY') categoriesScanned++;
    else if (item.type === 'RFQ') rfqsScanned++;
    else productsScanned++;

    const ov = overrides[item.id];
    const currentUrl = String(ov?.primary || item.baseUrl || '').trim();
    const prevUrl = String(ov?.previousPrimary || item.baseUrl || '').trim();
    const issue = classifyClientAuditIssue(item.id, item.title, item.category, currentUrl, seenUrls);

    if (!issue.flagged) {
      const cleanU = currentUrl.split('?')[0];
      if (cleanU) seenUrls.set(cleanU, { id: item.id, title: item.title });
      const wasRecentlyFixed = Boolean(
        ov && (ov.updatedBy === 'admin-manual' || ov.updatedBy === 'catalog-image-auditor' || ov.updatedBy === 'system-repair')
      );
      if (wasRecentlyFixed) recordsFixed++;
      if (options.includeCatalog) {
        catalogRecords.push({
          record_id: item.id,
          record_type: item.type,
          title: item.title,
          category: item.category,
          current_image_url: currentUrl,
          previous_image_url: prevUrl || currentUrl,
          updated_at: ov?.updatedAt,
          status: wasRecentlyFixed ? 'FIXED' : 'CLEAN'
        });
      }
      continue;
    }

    if (issue.type === 'DUPLICATE') duplicatesDetected++;
    else mismatchedDetected++;

    if (options.dryRun) {
      auditLog.push({
        record_id: item.id,
        record_type: item.type,
        title: item.title,
        category: item.category,
        issue_type: issue.type,
        issue_reason: issue.reason,
        old_image_url: currentUrl || '(empty)',
        new_image_url: '(pending audit fix)',
        query_used: `"${item.title}" ${item.category}`,
        status: 'FLAGGED'
      });
      if (options.includeCatalog) {
        catalogRecords.push({
          record_id: item.id,
          record_type: item.type,
          title: item.title,
          category: item.category,
          current_image_url: currentUrl,
          previous_image_url: prevUrl || currentUrl,
          updated_at: ov?.updatedAt,
          status: 'FLAGGED'
        });
      }
      continue;
    }

    // Only pick a verified local asset that genuinely matches this exact item's title/category (never unrelated images)
    let pickedUrl = '';
    const itemMatches = await buildServerMediaLibraryCandidates(item.title, item.category, 10);
    for (const c of itemMatches) {
      const cu = String(c.url || '').split('?')[0];
      if (cu && !seenUrls.has(cu) && !isMismatchedProductImageUrl(cu, item.title, item.category)) {
        pickedUrl = cu;
        break;
      }
    }

    if (pickedUrl) {
      seenUrls.set(pickedUrl, { id: item.id, title: item.title });
      overridesToPersist[item.id] = {
        primary: pickedUrl,
        previousPrimary: currentUrl || undefined,
        gallery: [pickedUrl],
        format: pickedUrl.split('.').pop()?.toUpperCase() || 'WEBP',
        updatedAt: nowIso,
        imageUpdatedAt: nowMs,
        updatedBy: 'catalog-image-auditor'
      };
      recordsFixed++;
      auditLog.push({
        record_id: item.id,
        record_type: item.type,
        title: item.title,
        category: item.category,
        issue_type: issue.type,
        issue_reason: issue.reason,
        old_image_url: currentUrl || '(empty)',
        new_image_url: pickedUrl,
        query_used: `"${item.title}" ${item.category}`,
        status: 'FIXED'
      });
    } else {
      auditLog.push({
        record_id: item.id,
        record_type: item.type,
        title: item.title,
        category: item.category,
        issue_type: issue.type,
        issue_reason: issue.reason,
        old_image_url: currentUrl || '(empty)',
        new_image_url: '(pending audit fix)',
        query_used: `"${item.title}" ${item.category}`,
        status: 'FLAGGED'
      });
    }
  }

  if (!options.dryRun && Object.keys(overridesToPersist).length > 0) {
    try {
      await fetch('/api.php?action=set_product_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullOverridesMap: overridesToPersist })
      });
    } catch {
      // ignore network error
    }
  }

  const totalScanned = productsScanned + rfqsScanned + categoriesScanned;
  const flaggedCount = auditLog.filter(r => r.status === 'FLAGGED').length;
  return {
    status: 'success',
    success: true,
    dry_run: options.dryRun,
    total_scanned: totalScanned,
    products_scanned: productsScanned,
    rfqs_scanned: rfqsScanned,
    categories_scanned: categoriesScanned,
    duplicates_detected: duplicatesDetected,
    mismatched_detected: mismatchedDetected,
    records_fixed: recordsFixed,
    healthy_records: Math.max(0, totalScanned - flaggedCount),
    timestamp: nowIso,
    audit_log: auditLog,
    ...(options.includeCatalog ? { catalog_records: catalogRecords } : {})
  };
}

export async function runCatalogImageAuditAndCleanup(options?: {
  dryRun?: boolean;
  includeCatalog?: boolean;
  catalogItems?: Array<{
    id: string;
    type?: 'PRODUCT' | 'RFQ' | 'CATEGORY';
    title: string;
    category?: string;
    image_url?: string;
  }>;
}): Promise<CatalogImageAuditSummary> {
  const dryRun = Boolean(options?.dryRun);
  const includeCatalog = Boolean(options?.includeCatalog);
  const queryParts: string[] = [];
  if (dryRun) queryParts.push('dry_run=1');
  if (includeCatalog) queryParts.push('include_catalog=1');
  const querySuffix = queryParts.length > 0 ? `&${queryParts.join('&')}` : '';
  const bodyPayload = {
    dry_run: dryRun,
    include_catalog: includeCatalog,
    catalog_items: options?.catalogItems || []
  };

  const isUsableAuditSummary = (json: any): json is CatalogImageAuditSummary => {
    if (!json || typeof json.total_scanned !== 'number') return false;
    if (json.total_scanned === 0 && (options?.catalogItems?.length || 0) > 0) return false;
    if (includeCatalog && !Array.isArray(json.catalog_records)) return false;
    return true;
  };

  try {
    const fallbackQuery = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const primaryRes = await fetch(`/api/v1/admin/audit-and-fix-catalog-images${fallbackQuery}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bodyPayload)
    });
    if (primaryRes.ok) {
      const json = await primaryRes.json().catch(() => null);
      if (isUsableAuditSummary(json)) {
        return json;
      }
    }
  } catch {}

  try {
    const res = await fetch(`/api.php?action=audit_and_fix_catalog_images${querySuffix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bodyPayload)
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (isUsableAuditSummary(json)) {
        return json;
      }
    }
  } catch {}

  // Universal fallback: works on any PHP/cPanel deployment even if api.php lacks catalog_records or returns 0
  return runClientFallbackCatalogImageAudit({
    dryRun,
    includeCatalog,
    catalogItems: options?.catalogItems || []
  });
}

export async function fixSingleCatalogImage(params: {
  recordId: string;
  recordType?: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE';
  title?: string;
  category?: string;
  customImageUrl?: string;
  previousImageUrl?: string;
  revert?: boolean;
}): Promise<SingleCatalogImageFixResult> {
  const payload = {
    record_id: params.recordId,
    record_type: params.recordType,
    title: params.title,
    category: params.category,
    custom_image_url: params.customImageUrl,
    previous_image_url: params.previousImageUrl,
    revert: Boolean(params.revert)
  };

  const cleanId = String(params.recordId || '').trim();
  const resolvedType: SingleCatalogImageFixResult['record_type'] =
    params.recordType || (cleanId.startsWith('cat-') ? 'CATEGORY' : cleanId.startsWith('rfq-') ? 'RFQ' : 'PRODUCT');
  const resolvedTitle = String(params.title || cleanId).trim();
  const resolvedCategory = String(params.category || 'General').trim();
  const prevUrl = String(params.previousImageUrl || '').trim();

  const isValidSingleFixResponse = (json: any): json is SingleCatalogImageFixResult =>
    Boolean(
      json &&
        json.success === true &&
        typeof json.record_id === 'string' &&
        typeof json.new_image_url === 'string' &&
        json.new_image_url.trim().length > 0 &&
        !isGenericOrPlaceholderImageUrl(json.new_image_url) &&
        (params.revert ||
          Boolean(params.customImageUrl) ||
          !isMismatchedProductImageUrl(json.new_image_url, resolvedTitle, resolvedCategory))
    );

  const singleFixEndpoints = [
    '/api/v1/admin/fix-single-catalog-image',
    '/api.php?action=fix_single_catalog_image',
    '/api.php?__route=v1/admin/fix-single-catalog-image'
  ];

  let lastMeaningfulError = '';
  for (const endpoint of singleFixEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const ctype = (res.headers.get('content-type') || '').toLowerCase();
      if (ctype.includes('text/html')) {
        continue;
      }
      const json = await res.json().catch(() => null);
      if (res.ok && isValidSingleFixResponse(json)) {
        return json;
      }
      if (json && json.message && !json.service) {
        lastMeaningfulError = String(json.message);
      } else if (res.status >= 400) {
        lastMeaningfulError = `Server endpoint returned status ${res.status}`;
      }
    } catch (err: any) {
      if (err?.message && !lastMeaningfulError) {
        lastMeaningfulError = err.message;
      }
    }
  }

  // Universal fallback: resolve via visual search (Backend -> PHP -> Live Wikimedia Commons CORS) & persist to server
  let finalUrl = '';
  let source = 'direct_set_product_images';

  if (params.revert && prevUrl && prevUrl !== '(empty)') {
    finalUrl = prevUrl;
    source = 'revert_restore';
  } else if (params.customImageUrl && params.customImageUrl.trim()) {
    finalUrl = params.customImageUrl.trim();
    source = 'manual_custom_url';
  } else {
    const cleanPrev = prevUrl.split('?')[0];
    const visual = await fetchVisualProductImages({
      productName: resolvedTitle,
      productId: cleanId,
      category: resolvedCategory,
      count: 15,
      forceRefresh: true
    });
    const pool = Array.isArray(visual.pool) && visual.pool.length > 0 ? visual.pool : visual.images || [];
    const relevantCandidates = pool.filter(
      c =>
        c?.url &&
        !isGenericOrPlaceholderImageUrl(c.url) &&
        !isMismatchedProductImageUrl(c.url, resolvedTitle, resolvedCategory)
    );
    const picked =
      relevantCandidates.find(c => c.url.split('?')[0] !== cleanPrev) || relevantCandidates[0];
    if (picked?.url) {
      let candidateUrl = picked.url;
      if (/^https?:\/\//i.test(candidateUrl)) {
        const mirrored = await autoUploadDisplayedProductImage({
          imageUrl: candidateUrl,
          productId: cleanId,
          productName: resolvedTitle,
          category: resolvedCategory
        });
        if (mirrored) {
          candidateUrl = mirrored;
        }
      }
      finalUrl = candidateUrl;
      source = visual.provider || 'wikimedia_commons_live';
    }
  }

  if (!finalUrl) {
    throw new Error(
      lastMeaningfulError ||
        `No matching verified photo found automatically for "${resolvedTitle}".`
    );
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const cleanFinal = finalUrl.startsWith('data:') ? finalUrl : finalUrl.split('?')[0];
  const ext = cleanFinal.startsWith('data:') ? 'WEBP' : cleanFinal.split('.').pop()?.toUpperCase() || 'WEBP';

  const persistEndpoints = [
    '/api/v1/admin/product-images',
    '/api.php?action=set_product_images'
  ];
  let persisted = false;
  for (const ep of persistEndpoints) {
    try {
      const method = ep.includes('api.php') ? 'POST' : 'PUT';
      const saveRes = await fetch(ep, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          productId: cleanId,
          primaryUrl: cleanFinal,
          galleryUrls: [cleanFinal],
          format: ext
        })
      });
      const ctype = (saveRes.headers.get('content-type') || '').toLowerCase();
      if (ctype.includes('text/html')) continue;
      const saveJson = await saveRes.json().catch(() => null);
      if (saveRes.ok && saveJson && (saveJson.success === true || saveJson.status === 'success')) {
        persisted = true;
        break;
      }
    } catch {
      // try next endpoint
    }
  }

  if (!persisted && !/^https?:\/\//i.test(cleanFinal)) {
    throw new Error(
      lastMeaningfulError || `Failed to save updated image for ${cleanId} to the server.`
    );
  }

  return {
    success: true,
    record_id: cleanId,
    record_type: resolvedType,
    title: resolvedTitle,
    category: resolvedCategory,
    old_image_url: prevUrl || '(empty)',
    new_image_url: cleanFinal,
    query_used: resolvedTitle,
    source,
    is_fallback_card: false,
    status: params.revert ? 'FLAGGED' : 'FIXED',
    updatedAt: nowIso,
    imageUpdatedAt: !params.revert ? nowMs : undefined
  };
}

