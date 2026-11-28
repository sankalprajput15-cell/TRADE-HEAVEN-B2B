import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { MOCK_PRODUCTS, MOCK_RFQS, CATEGORIES_TREE } from '../src/data/mockData.ts';
import { DEFAULT_SITE_CONTENT } from '../src/data/defaultSiteContent.ts';

const ROOT = process.cwd();
const UPLOADS_DIR = path.join(ROOT, 'public', 'assets', 'uploads');
const DIST_UPLOADS_DIR = path.join(ROOT, 'dist', 'assets', 'uploads');
const OVERRIDES_FILE = path.join(UPLOADS_DIR, 'product-image-overrides.json');
const SYSTEM_STATE_FILE = path.join(ROOT, 'public', 'data', 'productImageSystemState.json');
const PUBLIC_STATE_FILE = path.join(ROOT, 'public', 'data', 'productImagePublicState.json');
const SNAPSHOT_FILE = path.join(ROOT, 'public', 'data', 'fullCatalogSnapshot.json');
const SITE_CONTENT_FILE = path.join(ROOT, 'public', 'data', 'siteContentBackup.json');
const DIST_DIR = path.join(ROOT, 'dist');

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const BANNED_ALIBABA_REGEX =
  /watermark|shutterstock|istockphoto|gettyimages|alamy|dreamstime|123rf|logo|icon|badge|avatar|sprite|-tps-\d+|favicon|spec[-_]?sheet|datasheet|price[-_]?list|certificate|chart|diagram|infographic|invoice|quotation|banner|size[-_ ]?chart|size[-_ ]?guide|sizing[-_ ]?table|measurement|comparison|company[-_ ]?profile|why[-_ ]?choose|workflow|checklist|faq/i;

const ALIBABA_MODIFIERS = [
  'alibaba',
  'alibaba wholesale',
  'alibaba factory',
  'alibaba supplier',
  'alibaba manufacturer',
  'alibaba bulk',
  'alibaba china',
  'alibaba export',
  'alibaba oem',
  'alibaba industrial',
  'alibaba commercial',
  'alibaba trade',
  'alibaba custom',
  'alibaba direct',
  'alibaba hot sale',
  'alibaba supply',
  'alibaba professional',
  'alibaba quality',
  'alibaba heavy duty',
  'alibaba vendor',
  'alibaba global',
  'alibaba stock',
  'alibaba catalog',
  'alibaba factory price'
];

const BROAD_B2B_FALLBACK_TOPICS = [
  'industrial machinery equipment',
  'wholesale consumer electronics gadgets',
  'agricultural grains spices nuts',
  'steel metal pipes coils industrial',
  'commercial textile fabric garments',
  'packaging boxes bottles containers',
  'solar energy battery inverter',
  'construction building materials hardware',
  'automotive spare parts tires',
  'hospitality hotel kitchen equipment',
  'medical hospital supplies equipment',
  'chemical plastic resin granules',
  'furniture office wood chairs',
  'leather bags belts footwear',
  'food beverage edible oil',
  'mining minerals coal copper',
  'tools power drill welding',
  'lighting led lamps industrial'
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'bulk', 'wholesale', 'export', 'grade', 'quality',
  'premium', 'high', 'best', 'new', 'oem', 'odm', 'factory', 'direct', 'supplier', 'price',
  'china', 'global', 'trade', 'heaven', 'verified', 'certified', 'custom', 'private', 'label',
  'supply', 'product', 'products', 'commercial', 'industrial', 'standard', 'natural', 'pure',
  'fresh', 'raw', 'series', 'collection', 'pack', 'packing', 'container', 'tons', 'pcs', 'moq'
]);

function stripQuery(u: string): string {
  return String(u || '').split('?')[0].split('#')[0].trim();
}

function normalizeAlicdnUrl(rawU: string): string {
  let u = String(rawU || '').trim();
  if (u.startsWith('//')) u = `https:${u}`;
  if (/alicdn\.com\/kf\//i.test(u)) {
    u = u.replace(
      /_(?:50|60|80|100|120|140|160|220|250|300)x(?:50|60|80|100|120|140|160|220|250|300)[^.]*\.(?:jpg|jpeg|webp)$/i,
      ''
    );
  }
  return u;
}

function cleanQueryPhrase(raw: string): string {
  const s = String(raw || '')
    .replace(/^(?:trade-heaven|auto|verified|cat|manual|rfq|prod)[-_]+/i, '')
    .replace(/-[a-f0-9]{6,16}\.[a-z0-9]+$/i, '')
    .replace(/-\d{10,14}\.[a-z0-9]+$/i, '')
    .replace(/\.[a-z0-9]{2,5}$/i, '')
    .replace(/[^a-zA-Z0-9\s]+/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = s
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()));
  if (words.length >= 2) return words.slice(0, 4).join(' ');
  if (words.length === 1) return words[0];
  return s.split(/\s+/).slice(0, 3).join(' ').trim();
}

function slugify(str: string): string {
  return (
    String(str || 'product')
      .toLowerCase()
      .replace(/^trade[-_\s]*heaven[-_\s]*/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) || 'product'
  );
}

function deriveTitleFromOverride(id: string, ov: any): string {
  const primary = stripQuery(ov?.primary || '');
  const base = path.basename(primary);
  if (base && !/^whatsapp/i.test(base) && !/^img[_-]/i.test(base) && !/^screenshot/i.test(base)) {
    const cleaned = base
      .replace(/^(?:trade-heaven|auto|verified|cat|manual)[-_]+/i, '')
      .replace(/-[a-f0-9]{8,16}(?:-\d{10,14})?\.[a-z0-9]+$/i, '')
      .replace(/-\d{10,14}\.[a-z0-9]+$/i, '')
      .replace(/\.[a-z0-9]{2,5}$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    if (cleaned.length >= 3 && !/^[a-f0-9\s]{8,}$/i.test(cleaned)) {
      return cleaned;
    }
  }
  const idClean = String(id || '')
    .replace(/^(?:prod|rfq|cat|hero|site)[-_]+/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b(?:db|us|eu|in|cn|uk|uae|ext2026|2026|2025|metric|mkt|auto|th|p\d+|\d+)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return idClean.length >= 3 ? idClean : 'industrial wholesale product';
}

interface TopicState {
  queue: string[];
  nextPage: number;
  emptyStreak: number;
}

const topicPools = new Map<string, TopicState>();
const topicFetchLocks = new Map<string, Promise<void>>();
const globalSeenFetchedUrls = new Set<string>();

async function fetchAlibabaPage(topic: string, pageNum: number): Promise<string[]> {
  const mod = ALIBABA_MODIFIERS[pageNum % ALIBABA_MODIFIERS.length];
  const cycle = Math.floor(pageNum / ALIBABA_MODIFIERS.length);
  const first = 1 + cycle * 45 + (pageNum % 4) * 12;
  const query = `${topic} ${mod}`.trim();
  const url = `https://www.bing.com/images/async?q=${encodeURIComponent(query)}&first=${first}&count=48&mmasync=1`;
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(4500)
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const out: string[] = [];
    for (const m of html.matchAll(/m="(\{&quot;[^"]+\})"/g)) {
      try {
        const rawJson = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
        const meta = JSON.parse(rawJson);
        const murl = normalizeAlicdnUrl(String(meta?.murl || ''));
        if (!murl || !/^https?:\/\//i.test(murl)) continue;
        if (/\.(svg|gif|ico)(\?|$)/i.test(murl)) continue;
        const purl = String(meta?.purl || '').trim();
        const titleStr = String(meta?.t || meta?.desc || '').trim();
        if (BANNED_ALIBABA_REGEX.test(`${titleStr} ${murl}`)) continue;
        const isAli =
          /(?:alicdn\.com|alibaba\.com|aliexpress\.com|1688\.com)/i.test(murl) ||
          /(?:alicdn\.com|alibaba\.com|aliexpress\.com|1688\.com)/i.test(purl);
        if (!isAli) continue;
        const normKey = murl.split('#')[0];
        if (globalSeenFetchedUrls.has(normKey)) continue;
        globalSeenFetchedUrls.add(normKey);
        out.push(normKey);
      } catch {}
    }
    return out;
  } catch {
    return [];
  }
}

async function popNextAlibabaCandidate(topic: string): Promise<string | null> {
  const key = String(topic || '').toLowerCase().trim();
  if (!key) return null;
  let state = topicPools.get(key);
  if (!state) {
    state = { queue: [], nextPage: 0, emptyStreak: 0 };
    topicPools.set(key, state);
  }
  if (state.queue.length > 0) {
    return state.queue.shift() || null;
  }
  if (state.emptyStreak >= 4 || state.nextPage >= 36) {
    return null;
  }
  if (topicFetchLocks.has(key)) {
    await topicFetchLocks.get(key);
    return state.queue.length > 0 ? state.queue.shift() || null : null;
  }
  const p = (async () => {
    const pagesToFetch = state!.nextPage === 0 ? [0, 1] : [state!.nextPage, state!.nextPage + 1];
    state!.nextPage += pagesToFetch.length;
    const batches = await Promise.all(pagesToFetch.map(pn => fetchAlibabaPage(key, pn)));
    let added = 0;
    for (const b of batches) {
      for (const u of b) {
        state!.queue.push(u);
        added++;
      }
    }
    if (added === 0) state!.emptyStreak += 1;
    else state!.emptyStreak = 0;
  })();
  topicFetchLocks.set(key, p);
  try {
    await p;
  } finally {
    topicFetchLocks.delete(key);
  }
  return state.queue.length > 0 ? state.queue.shift() || null : null;
}

// Global 1-to-1 Uniqueness Registry (ZERO duplicates by URL, sourceUrl, URL hash, or SHA-256 binary hash!)
const usedLocalUrls = new Set<string>();
const usedSourceUrls = new Set<string>();
const usedUrlHashes = new Set<string>();
const usedContentHashes = new Set<string>();

function isAlibabaOverrideAlreadyValidAndUnique(ov: any) {
  if (!ov || typeof ov !== 'object') return false;
  const src = String(ov.imageSource || '').toLowerCase();
  const sourceUrl = stripQuery(ov.sourceUrl || '');
  const isAli = src === 'alibaba' || /alicdn\.com|alibaba\.com/i.test(sourceUrl);
  if (!isAli) return false;
  const localUrl = stripQuery(ov.primary || '');
  if (!localUrl.startsWith('/assets/uploads/')) return false;
  const fp = path.join(UPLOADS_DIR, path.basename(localUrl));
  if (!fs.existsSync(fp)) return false;
  try {
    if (fs.statSync(fp).size < 2000) return false;
  } catch {
    return false;
  }
  const contentHash =
    String(ov.imageContentHash || '').trim() ||
    crypto.createHash('sha256').update(fs.readFileSync(fp)).digest('hex');
  const urlHash = sourceUrl ? crypto.createHash('sha1').update(sourceUrl).digest('hex').slice(0, 12) : '';
  if (usedLocalUrls.has(localUrl)) return false;
  if (sourceUrl && usedSourceUrls.has(sourceUrl)) return false;
  if (urlHash && usedUrlHashes.has(urlHash)) return false;
  if (usedContentHashes.has(contentHash)) return false;
  return { localUrl, sourceUrl, urlHash, contentHash };
}

interface TargetItem {
  id: string;
  type: string;
  title: string;
  category: string;
}

async function downloadAndSaveUniqueAlibabaImage(candUrl: string, item: TargetItem) {
  const normSource = candUrl.split('#')[0].trim();
  const urlHash = crypto.createHash('sha1').update(normSource).digest('hex').slice(0, 12);
  if (usedSourceUrls.has(normSource) || usedUrlHashes.has(urlHash)) return null;

  try {
    const resp = await fetch(normSource, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'image/webp,image/png,image/jpeg,image/*;q=0.8',
        Referer: 'https://www.alibaba.com/'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5500)
    });
    if (!resp.ok) return null;
    const ctype = String(resp.headers.get('content-type') || '').toLowerCase();
    if (ctype.includes('text/html') || ctype.includes('json') || ctype.includes('svg') || ctype.includes('gif')) {
      return null;
    }
    const rawBuf = Buffer.from(await resp.arrayBuffer());
    if (rawBuf.length < 2200) return null;

    const meta = await sharp(rawBuf, { failOn: 'none' }).metadata();
    const w = Number(meta.width || 0);
    const h = Number(meta.height || 0);
    if (w < 200 || h < 200) return null;
    const ratio = w / Math.max(1, h);
    if (ratio > 4.2 || ratio < 0.24) return null;

    const rawSha = crypto.createHash('sha256').update(rawBuf).digest('hex');
    if (usedContentHashes.has(rawSha)) return null;

    const cleanTitle = String(item.title || item.id).slice(0, 120);
    const cleanCat = String(item.category || 'Global Wholesale').slice(0, 60);
    const webpBuf = await sharp(rawBuf, { failOn: 'none' })
      .rotate()
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .withMetadata({
        exif: {
          IFD0: {
            ImageDescription: `${cleanTitle} | ${cleanCat} | Verified Wholesale on Trade Heaven (tradeheaven.net)`,
            Artist: 'Trade Heaven (https://tradeheaven.net)',
            Copyright: 'Trade Heaven Global B2B Trade Portal',
            Software: 'Trade Heaven Alibaba Verified Catalog'
          }
        }
      })
      .webp({ quality: 82 })
      .toBuffer();

    const finalSha = crypto.createHash('sha256').update(webpBuf).digest('hex');
    if (usedContentHashes.has(finalSha) || usedContentHashes.has(rawSha)) return null;

    const fileName = `trade-heaven-${slugify(cleanTitle)}-${urlHash}.webp`;
    const localUrl = `/assets/uploads/${fileName}`;
    if (usedLocalUrls.has(localUrl)) return null;

    // Claim immediately before async write to guarantee zero duplicates
    usedLocalUrls.add(localUrl);
    usedSourceUrls.add(normSource);
    usedUrlHashes.add(urlHash);
    usedContentHashes.add(rawSha);
    usedContentHashes.add(finalSha);

    const outPath = path.join(UPLOADS_DIR, fileName);
    await fs.promises.writeFile(outPath, webpBuf);
    if (fs.existsSync(DIST_UPLOADS_DIR)) {
      fs.promises.writeFile(path.join(DIST_UPLOADS_DIR, fileName), webpBuf).catch(() => {});
    }

    return {
      localUrl,
      sourceUrl: normSource,
      contentHash: finalSha,
      sizeBytes: webpBuf.length
    };
  } catch {
    return null;
  }
}

let fallbackTopicCursor = 0;

async function patchItemFromAlibaba(item: TargetItem) {
  const topics: string[] = [];
  const seenT = new Set<string>();
  const addTopic = (t: string) => {
    const c = cleanQueryPhrase(t);
    if (c.length >= 2 && !seenT.has(c.toLowerCase())) {
      seenT.add(c.toLowerCase());
      topics.push(c);
    }
  };

  addTopic(item.title);
  const words = cleanQueryPhrase(item.title).split(/\s+/).filter(Boolean);
  if (words.length >= 2) addTopic(words.slice(0, 2).join(' '));
  if (words.length >= 3) addTopic(words.slice(-2).join(' '));
  if (words.length >= 1) addTopic(words[0]);
  if (item.category && !/general|buy lead|override/i.test(item.category)) {
    addTopic(item.category);
  }

  for (const topic of topics) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const cand = await popNextAlibabaCandidate(topic);
      if (!cand) break;
      const saved = await downloadAndSaveUniqueAlibabaImage(cand, item);
      if (saved) return saved;
    }
  }

  // Zero-Skip Guaranteed Fallback across Alibaba B2B topics
  for (let round = 0; round < BROAD_B2B_FALLBACK_TOPICS.length * 2; round++) {
    const fbTopic = BROAD_B2B_FALLBACK_TOPICS[fallbackTopicCursor++ % BROAD_B2B_FALLBACK_TOPICS.length];
    for (let attempt = 0; attempt < 6; attempt++) {
      const cand = await popNextAlibabaCandidate(fbTopic);
      if (!cand) break;
      const saved = await downloadAndSaveUniqueAlibabaImage(cand, item);
      if (saved) return saved;
    }
  }
  return null;
}

function getNestedValue(obj: any, fieldPath: string): string {
  const parts = String(fieldPath || '').split('.').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return '';
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : '';
}

function setNestedValue(obj: any, fieldPath: string, val: string) {
  const parts = String(fieldPath || '').split('.').filter(Boolean);
  if (parts.length === 0) return;
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = val;
}

async function main() {
  const tStart = Date.now();
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'public', 'data'), { recursive: true });

  const state = fs.existsSync(OVERRIDES_FILE)
    ? JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'))
    : { overrides: {}, urlReplacements: {}, mediaLibrary: [] };
  if (!state.overrides) state.overrides = {};
  if (!state.urlReplacements) state.urlReplacements = {};
  if (!Array.isArray(state.mediaLibrary)) state.mediaLibrary = [];

  const snapRaw = fs.existsSync(SNAPSHOT_FILE) ? JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')) : [];
  const snapArr: any[] = Array.isArray(snapRaw) ? snapRaw : snapRaw.products || snapRaw.items || [];
  const siteContent: any = fs.existsSync(SITE_CONTENT_FILE)
    ? JSON.parse(fs.readFileSync(SITE_CONTENT_FILE, 'utf8'))
    : JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));

  const itemMap = new Map<string, TargetItem>();
  const addItem = (id: string, type: string, title: string, category: string) => {
    const cleanId = String(id || '').trim();
    if (!cleanId || cleanId === 'site-brand-logo' || cleanId === 'test-probe-ali') return;
    if (!itemMap.has(cleanId)) {
      itemMap.set(cleanId, {
        id: cleanId,
        type,
        title: String(title || cleanId),
        category: String(category || 'Global Wholesale')
      });
    }
  };

  // 1. Seeded static products (992)
  for (const p of MOCK_PRODUCTS) {
    addItem(String(p.id), 'PRODUCT', String(p.title || p.id), String(p.category || 'Global Wholesale'));
  }

  // 2. Seeded static RFQs (1876)
  for (const r of MOCK_RFQS as any[]) {
    const rawId = String(r.id || '').trim();
    addItem(rawId, 'RFQ', String(r.productName || r.title || rawId), String(r.category || 'Buy Leads & RFQs'));
  }

  // 3. All 68 procurement categories
  for (const c of CATEGORIES_TREE) {
    addItem(String(c.id), 'CATEGORY', String(c.name || c.id), 'Procurement Sector');
  }

  // 4. All catalog snapshot items
  for (const p of snapArr) {
    addItem(String(p.id), p.type || 'PRODUCT', String(p.title || p.name || p.id), String(p.category || 'Global Wholesale'));
  }

  // 5. All Hero Slides & Site Banners (excluding protected site-brand-logo)
  const heroSlides = Array.isArray(siteContent?.homepage?.heroSlides)
    ? siteContent.homepage.heroSlides
    : DEFAULT_SITE_CONTENT.homepage.heroSlides || [];
  heroSlides.forEach((s: any, i: number) => {
    addItem(
      String(s.id || `hero-slide-${i + 1}`),
      'HERO_SLIDE',
      `${s.title || 'Global B2B Trade'} shipping container port cargo`,
      'Industrial Logistics'
    );
  });

  const bannerSlots = [
    { id: 'site-hero-bg', title: 'Global Cargo Shipping Port Logistics', fieldPath: 'homepage.heroBgImage' },
    { id: 'site-onboarding-banner', title: 'Factory Manufacturing Warehouse Export', fieldPath: 'homepage.onboardingBannerImage' },
    { id: 'site-products-banner', title: 'Wholesale Industrial Products Warehouse', fieldPath: 'productsDirectory.bannerImage' },
    { id: 'site-buyleads-banner', title: 'Global Container Freight Trade Port', fieldPath: 'buyLeads.bannerImage' },
    { id: 'site-suppliers-banner', title: 'Verified Factory Exporter Production Line', fieldPath: 'suppliersDirectory.bannerImage' },
    { id: 'site-post-rfq-banner', title: 'International Procurement Trade Supply Chain', fieldPath: 'postBuyingRequest.bannerImage' },
    { id: 'site-post-offer-banner', title: 'Export Wholesale Packaging Cargo', fieldPath: 'postSellOffer.bannerImage' },
    { id: 'site-membership-banner', title: 'Commercial Shipping Port Trade', fieldPath: 'membership.bannerImage' },
    { id: 'site-escrow-banner', title: 'Secure Global Trade Logistics Freight', fieldPath: 'escrow.bannerImage' }
  ];
  for (const b of bannerSlots) {
    addItem(b.id, 'SITE_ASSET', b.title, 'Industrial Logistics');
  }

  // 6. Any remaining overrides
  for (const [id, ov] of Object.entries(state.overrides)) {
    if (id === 'site-brand-logo' || id === 'test-probe-ali') continue;
    if (!itemMap.has(id)) {
      const derived = deriveTitleFromOverride(id, ov);
      const type = /rfq/i.test(id) ? 'RFQ' : id.startsWith('cat-') ? 'CATEGORY' : 'PRODUCT';
      addItem(id, type, derived, type === 'RFQ' ? 'Buy Leads & RFQs' : 'Global Wholesale');
    }
  }

  delete state.overrides['test-probe-ali'];

  const allTargets = Array.from(itemMap.values());
  const toPatch: TargetItem[] = [];
  let alreadyValidAli = 0;

  for (const item of allTargets) {
    const existing = state.overrides[item.id];
    const check = isAlibabaOverrideAlreadyValidAndUnique(existing);
    if (check) {
      usedLocalUrls.add(check.localUrl);
      if (check.sourceUrl) usedSourceUrls.add(check.sourceUrl);
      if (check.urlHash) usedUrlHashes.add(check.urlHash);
      usedContentHashes.add(check.contentHash);
      alreadyValidAli++;
    } else {
      toPatch.push(item);
    }
  }

  console.log(
    `[AlibabaFullPatch] Total site items: ${allTargets.length} | Already unique Alibaba: ${alreadyValidAli} | To patch from Alibaba: ${toPatch.length}`
  );

  const replacedOldFiles = new Set<string>();
  let completed = 0;
  let patchedCount = 0;
  let failedCount = 0;

  const CONCURRENCY = 26;
  let cursor = 0;

  const flushCheckpoint = () => {
    const jsonStr = JSON.stringify(state);
    fs.writeFileSync(OVERRIDES_FILE, jsonStr, 'utf8');
    fs.writeFileSync(SYSTEM_STATE_FILE, jsonStr, 'utf8');
  };

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= toPatch.length) break;
      const item = toPatch[idx];
      const existing = state.overrides[item.id];
      const oldPrimary = stripQuery(existing?.primary || '');

      const saved = await patchItemFromAlibaba(item);
      completed++;
      if (saved) {
        patchedCount++;
        const nowMs = Date.now();
        const nowIso = new Date(nowMs).toISOString();
        if (oldPrimary && oldPrimary !== saved.localUrl && oldPrimary.startsWith('/assets/uploads/')) {
          replacedOldFiles.add(oldPrimary);
        }
        state.overrides[item.id] = {
          ...(existing || {}),
          primary: saved.localUrl,
          gallery: [saved.localUrl],
          format: 'WEBP',
          updatedAt: nowIso,
          imageUpdatedAt: nowMs,
          updatedBy: 'alibaba-zero-skip-patcher',
          locked: true,
          serverVerified: true,
          verifiedAt: nowIso,
          imageSource: 'alibaba',
          sourceUrl: saved.sourceUrl,
          imageContentHash: saved.contentHash
        };
        delete state.overrides[item.id].previousPrimary;
        state.urlReplacements[saved.sourceUrl] = saved.localUrl;
      } else {
        failedCount++;
        console.error(`[FAIL] Could not find Alibaba image for ${item.id} (${item.title})`);
      }

      if (completed % 250 === 0 || completed === toPatch.length) {
        const elapsedSec = ((Date.now() - tStart) / 1000).toFixed(1);
        console.log(
          `[AlibabaFullPatch] Progress: ${completed}/${toPatch.length} | Patched: ${patchedCount} | Failed: ${failedCount} | Elapsed: ${elapsedSec}s`
        );
        if (completed % 500 === 0) {
          flushCheckpoint();
        }
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  // Update snapshot products
  let snapUpdated = 0;
  const nowMsFinal = Date.now();
  for (const p of snapArr) {
    const ov = state.overrides[String(p.id)];
    if (ov?.primary) {
      p.image = ov.primary;
      p.image_url = ov.primary;
      p.images = [ov.primary];
      p.imageUpdatedAt = ov.imageUpdatedAt || nowMsFinal;
      snapUpdated++;
    }
  }
  const snapOut = Array.isArray(snapRaw) ? snapArr : { ...snapRaw, products: snapArr };
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapOut), 'utf8');

  // Update siteContent categories, heroSlides, and banners
  if (siteContent) {
    if (Array.isArray(siteContent?.homepage?.categoriesList)) {
      for (const c of siteContent.homepage.categoriesList) {
        const ov = state.overrides[c.id];
        if (ov?.primary) c.image = ov.primary;
      }
    }
    if (Array.isArray(siteContent?.homepage?.heroSlides)) {
      siteContent.homepage.heroSlides.forEach((s: any, i: number) => {
        const sid = s.id || `hero-slide-${i + 1}`;
        const ov = state.overrides[sid];
        if (ov?.primary) s.image = ov.primary;
      });
    }
    for (const b of bannerSlots) {
      const ov = state.overrides[b.id];
      if (ov?.primary && getNestedValue(siteContent, b.fieldPath) !== undefined) {
        setNestedValue(siteContent, b.fieldPath, ov.primary);
      }
    }
    siteContent.siteContentUpdatedAt = nowMsFinal;
    fs.writeFileSync(SITE_CONTENT_FILE, JSON.stringify(siteContent, null, 2), 'utf8');
  }

  // Rebuild clean mediaLibrary from active overrides
  const activeUrlSet = new Set<string>();
  const nextMediaLib: any[] = [];
  for (const [, ov] of Object.entries<any>(state.overrides)) {
    const u = stripQuery(ov?.primary || '');
    if (!u || activeUrlSet.has(u)) continue;
    activeUrlSet.add(u);
    if (u.startsWith('/assets/uploads/')) {
      const fp = path.join(UPLOADS_DIR, path.basename(u));
      let size = 0;
      try {
        size = fs.statSync(fp).size;
      } catch {}
      nextMediaLib.push({
        url: u,
        fileName: path.basename(u),
        sizeBytes: size,
        uploadedAt: ov.updatedAt || new Date().toISOString()
      });
    }
  }
  state.mediaLibrary = nextMediaLib;
  state.generatedAt = new Date().toISOString();

  // Delete orphaned replaced upload files safely
  let deletedOldCount = 0;
  for (const oldU of replacedOldFiles) {
    if (activeUrlSet.has(oldU)) continue;
    const base = path.basename(oldU);
    if (!base || base.includes('logo') || base.includes('tradeheaven_317b5f4c')) continue;
    const fp = path.join(UPLOADS_DIR, base);
    try {
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
        deletedOldCount++;
      }
      const distFp = path.join(DIST_UPLOADS_DIR, base);
      if (fs.existsSync(distFp)) fs.unlinkSync(distFp);
    } catch {}
  }

  // Persist final state atomically across all stores
  const prettyState = JSON.stringify(state, null, 2);
  fs.writeFileSync(OVERRIDES_FILE, prettyState, 'utf8');
  fs.writeFileSync(SYSTEM_STATE_FILE, prettyState, 'utf8');
  fs.writeFileSync(PUBLIC_STATE_FILE, prettyState, 'utf8');
  if (fs.existsSync(DIST_DIR)) {
    try {
      fs.mkdirSync(path.join(DIST_DIR, 'data'), { recursive: true });
      fs.mkdirSync(DIST_UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(DIST_UPLOADS_DIR, 'product-image-overrides.json'), prettyState, 'utf8');
      fs.writeFileSync(path.join(DIST_DIR, 'data', 'productImageSystemState.json'), prettyState, 'utf8');
      fs.writeFileSync(path.join(DIST_DIR, 'data', 'productImagePublicState.json'), prettyState, 'utf8');
      fs.writeFileSync(path.join(DIST_DIR, 'data', 'fullCatalogSnapshot.json'), JSON.stringify(snapOut), 'utf8');
      if (siteContent) {
        fs.writeFileSync(path.join(DIST_DIR, 'data', 'siteContentBackup.json'), JSON.stringify(siteContent, null, 2), 'utf8');
      }
    } catch {}
  }

  // Final Zero-Duplicate, Zero-Skip, 100% Alibaba Verification Audit
  const urlAudit = new Map<string, number>();
  const hashAudit = new Map<string, number>();
  let nonAliCount = 0;
  let missingFileCount = 0;
  const totalOverrides = Object.keys(state.overrides).length;
  for (const [id, ov] of Object.entries<any>(state.overrides)) {
    if (id === 'site-brand-logo') continue;
    const u = stripQuery(ov?.primary || '');
    const h = String(ov?.imageContentHash || '');
    if (ov?.imageSource !== 'alibaba') nonAliCount++;
    if (!u.startsWith('/assets/uploads/') || !fs.existsSync(path.join(UPLOADS_DIR, path.basename(u)))) {
      missingFileCount++;
    }
    urlAudit.set(u, (urlAudit.get(u) || 0) + 1);
    if (h) hashAudit.set(h, (hashAudit.get(h) || 0) + 1);
  }
  const dupUrls = [...urlAudit.values()].filter(c => c > 1).length;
  const dupHashes = [...hashAudit.values()].filter(c => c > 1).length;

  console.log('=== ALIBABA FULL SITE PATCH AUDIT ===');
  console.log({
    totalTargets: allTargets.length,
    totalOverrides,
    patchedNow: patchedCount,
    alreadyValidAli,
    failedCount,
    snapUpdated,
    deletedOldCount,
    nonAliCount,
    missingFileCount,
    dupUrls,
    dupHashes,
    elapsedSeconds: ((Date.now() - tStart) / 1000).toFixed(1)
  });

  if (failedCount > 0 || nonAliCount > 0 || dupUrls > 0 || dupHashes > 0 || missingFileCount > 0) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('[AlibabaFullPatch] Fatal:', err);
  process.exit(1);
});
