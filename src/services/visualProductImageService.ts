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
const VERIFIED_LOADABLE_URLS = new Set<string>();
const LOCAL_MIRROR_MAP = new Map<string, string>();
const INFLIGHT_AUTO_UPLOADS = new Map<string, Promise<string | null>>();
const BOUND_LOCAL_KEYS = new Set<string>();

const LOCAL_STORAGE_CACHE_KEY = 'th_visual_product_image_cache_v6';
const LOCAL_MIRROR_STORAGE_KEY = 'th_local_uploaded_image_mirrors_v3';
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
  '3d_render',
  'data:image/svg',
  '.svg',
  'spec-card',
  'speccard',
  'fallback-card',
  'verified-b2b-export-spec',
  'company-isolated-catalog-asset',
  'unique-verified-asset',
  'auto-tyre-scraps-4a0f5066c723',
  'verified-prod-iqf-molai-broccoli-garlic'
];

const HEADING_NON_NOUN_WORDS = new Set([
  'origin', 'australia', 'australian', 'germany', 'german', 'poland', 'polish', 'uae', 'dubai',
  'japan', 'japanese', 'china', 'chinese', 'india', 'indian', 'france', 'french', 'italy',
  'italian', 'spain', 'spanish', 'chile', 'chilean', 'ecuador', 'mozambique', 'africa',
  'african', 'indonesia', 'indonesian', 'brazil', 'brazilian', 'vietnam', 'vietnamese',
  'thailand', 'thai', 'turkey', 'turkish', 'malaysia', 'malaysian', 'usa', 'american',
  'canada', 'canadian', 'uk', 'british', 'russia', 'russian', 'egypt', 'egyptian',
  'pakistan', 'pakistani', 'bangladesh', 'sri', 'lanka', 'peru', 'peruvian', 'mexico',
  'mexican', 'argentina', 'colombia', 'iqf', 'molai', 'eec', 'rcn', 'hms', 'icumas', 'icuma',
  'icumsa', 'brix', 'mesh', 'astm', 'iso', 'din', 'sae', 'api', 'jas', 'halal', 'kosher',
  'haccp', 'gmp', 'fda', 'ce', 'rohs', 'reach', 'sgs', 'brc', 'collection', 'assorted',
  'charcoal', 'chocolate', 'crimson', 'olive', 'emerald', 'amber', 'cobalt', 'ivory',
  'matte', 'glossy', 'satin', 'brushed', 'anodized', 'galvanized', 'baled', 'shredded',
  'compressed', 'packaged', 'packed', 'bagged', 'boxed', 'canned', 'bottled', 'drum',
  'drums', 'pallet', 'pallets', 'container', 'containers', 'shipment', 'delivery',
  'monthly', 'annual', 'spot', 'contract', 'lot', 'batch', 'stock', 'ready', 'available'
]);

const MISMATCH_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'export', 'grade', 'quality',
  'wholesale', 'bulk', 'supply', 'direct', 'factory', 'oem', 'odm', 'verified',
  'new', 'high', 'best', 'commercial', 'industrial', 'product', 'products', 'unit', 'units',
  'tons', 'metric', 'pcs', 'pieces', 'kgs', 'kg', 'ton', 'pure', 'natural', 'premium',
  'standard', 'international', 'global', 'certified', 'genuine', 'original', 'custom',
  'rfq', 'wanted', 'urgent', 'requirement', 'tender', 'cif', 'fob', 'port', 'auto', 'catalog',
  'heavy', 'duty', 'turnkey', 'configuration', 'config', 'solution', 'solutions', 'series',
  'edition', 'version', 'capacity', 'spec', 'specs', 'specification', 'specifications',
  'complete', 'professional', 'enterprise', 'advanced', 'modern', 'ultra', 'super', 'pro',
  'max', 'plus', 'type', 'class', 'model', 'system', 'systems', 'equipment', 'machinery', 'machine',
  'trade', 'heaven', 'tradeheaven'
]);

const COMPOUND_PRODUCT_NORMALIZATIONS_CLIENT: Array<[RegExp, string]> = [
  [/\bsun\s+flower(s)?\b/gi, 'sunflower$1'],
  [/\bsoy(?:a)?\s+bean(s)?\b/gi, 'soybean$1'],
  [/\bground\s+nut(s)?\b/gi, 'groundnut$1'],
  [/\bpea\s+nut(s)?\b/gi, 'peanut$1'],
  [/\bcoco\s+nut(s)?\b/gi, 'coconut$1'],
  [/\bpine\s+apple(s)?\b/gi, 'pineapple$1'],
  [/\bwater\s+melon(s)?\b/gi, 'watermelon$1'],
  [/\bsugar\s+cane(s)?\b/gi, 'sugarcane$1'],
  [/\bchick\s+pea(s)?\b/gi, 'chickpea$1'],
  [/\bcotton\s+seed(s)?\b/gi, 'cottonseed$1'],
  [/\bflax\s+seed(s)?\b/gi, 'flaxseed$1'],
  [/\bcarda\s+mom\b/gi, 'cardamom'],
  [/\bcorn\s+starch\b/gi, 'cornstarch'],
  [/\bsea\s+food\b/gi, 'seafood'],
  [/\bgear\s+box(es)?\b/gi, 'gearbox$1'],
  [/\bhand\s+bag(s)?\b/gi, 'handbag$1'],
  [/\bback\s+pack(s)?\b/gi, 'backpack$1'],
  [/\bfoot\s+wear\b/gi, 'footwear'],
  [/\brain\s+coat(s)?\b/gi, 'raincoat$1'],
  [/\bbed\s+sheet(s)?\b/gi, 'bedsheet$1'],
  [/\btooth\s+brush(es)?\b/gi, 'toothbrush$1'],
  [/\btooth\s+paste\b/gi, 'toothpaste'],
  [/\bhead\s+phone(s)?\b/gi, 'headphone$1'],
  [/\bear\s+bud(s)?\b/gi, 'earbud$1'],
  [/\bsmart\s+watch(es)?\b/gi, 'smartwatch$1'],
  [/\bpower\s+bank(s)?\b/gi, 'powerbank$1'],
  [/\bwork\s+wear\b/gi, 'workwear'],
  [/\bsports?\s+wear\b/gi, 'sportswear'],
  [/\btable\s+ware\b/gi, 'tableware'],
  [/\bkitchen\s+ware\b/gi, 'kitchenware'],
  [/\bcook\s+ware\b/gi, 'cookware'],
  [/\bglass\s+ware\b/gi, 'glassware'],
  [/\bhard\s+ware\b/gi, 'hardware'],
  [/\bfire\s+wood\b/gi, 'firewood'],
  [/\bply\s+wood\b/gi, 'plywood'],
  [/\bcard\s+board\b/gi, 'cardboard'],
  [/\bwheel\s+chair(s)?\b/gi, 'wheelchair$1'],
  [/\bfork\s+lift(s)?\b/gi, 'forklift$1'],
  [/\bbull\s+dozer(s)?\b/gi, 'bulldozer$1'],
  [/\bgreen\s+house(s)?\b/gi, 'greenhouse$1'],
  [/\bwind\s+mill(s)?\b/gi, 'windmill$1'],
  [/\bflash\s+light(s)?\b/gi, 'flashlight$1'],
  [/\bkey\s+board(s)?\b/gi, 'keyboard$1'],
  [/\bnote\s+book(s)?\b/gi, 'notebook$1']
];

const OFF_TOPIC_CANDIDATE_RE =
  /(nasa|solar_flare|sunspot|eclipse|astronomy|telescope|observatory|nebula|galaxy|spacecraft|soho_|sdo_|sunset|sunrise|mountain_valley|canyon|glacier|volcano|konark|sun_temple|cathedral|mosque|pagoda|monument|ruins|statue|sculpture|tate_modern|turbine_hall|ai_weiwei|exhibition|installation|museum|herbarium|botanical_plate|botanical_illustration|engraving|lithograph|etching|woodcut|watercolor|encyclopedia|cyclopedia|dictionary|book_page|page_\d|plate_\d|flora_of|biodiversity_heritage|bhl_|popular_science|illustrations_of|natural_history|us_navy|soldier|military|selfie|wedding|diagram|chart|logo|icon|coat_of_arms|flag|signature|screenshot|pdf|djvu|infographic|cartoon|drawing|painting|sketch|poster|brochure|advert|newspaper|magazine|catalogue|postcard|statelib|fortepan|bundesarchiv|18[89]\d|19[0-8]\d)/i;

const CLIENT_GENERIC_MODIFIERS = new Set([
  'fresh', 'raw', 'black', 'white', 'red', 'green', 'yellow', 'blue', 'golden', 'silver',
  'refined', 'unrefined', 'organic', 'processed', 'frozen', 'dried', 'dry', 'wet', 'liquid',
  'solid', 'powder', 'powdered', 'granular', 'granules', 'crude', 'heavy', 'light', 'medium',
  'small', 'large', 'extra', 'long', 'short', 'whole', 'split', 'peeled', 'washed', 'polished',
  'roasted', 'salted', 'unsalted', 'hulled', 'shelled', 'edible', 'food', 'agricultural'
]);

function normalizeCompoundProductTermsClient(input: string): string {
  let out = String(input || '');
  for (const [re, rep] of COMPOUND_PRODUCT_NORMALIZATIONS_CLIENT) {
    out = out.replace(re, rep);
  }
  return out;
}

function extractTopicTokensClient(text: string): string[] {
  return normalizeCompoundProductTermsClient(String(text || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !/^\d+$/.test(w) && !MISMATCH_STOPWORDS.has(w));
}

function tokenMatchesHaystackWordBoundary(token: string, haystack: string): boolean {
  const tk = token.toLowerCase().trim();
  if (tk.length < 3) return false;
  const stems = new Set<string>([tk]);
  if (tk.length > 4) {
    if (tk.endsWith('ies')) stems.add(tk.slice(0, -3) + 'y');
    if (tk.endsWith('es')) stems.add(tk.slice(0, -2));
    if (tk.endsWith('s') && !tk.endsWith('ss')) stems.add(tk.slice(0, -1));
  }
  const words = haystack.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const s of stems) {
    if (s.length <= 4) {
      if (words.some(w => w === s || w === `${s}s` || w === `${s}es`)) return true;
    } else {
      if (words.some(w => w === s || w.startsWith(s) || (w.length >= s.length + 3 && w.includes(s)))) return true;
    }
  }
  return false;
}

function isCandidateOffTopicClient(
  cand: VisualProductImageCandidate,
  productName: string
): boolean {
  const checkHay = `${cand.title || ''} ${cand.url || ''} ${cand.sourceDomain || ''}`.toLowerCase();
  if (OFF_TOPIC_CANDIDATE_RE.test(checkHay)) return true;
  const cleaned = cleanProductSearchSubject(productName);
  const allToks = Array.from(new Set(extractTopicTokensClient(cleaned)));
  if (allToks.length === 0) return false;
  const coreToks = allToks.filter(t => !CLIENT_GENERIC_MODIFIERS.has(t));
  const targetCore = coreToks.length > 0 ? coreToks : allToks;
  const coreHits = targetCore.filter(tk => tokenMatchesHaystackWordBoundary(tk, checkHay)).length;
  const compactPhrase = targetCore.slice(0, 2).join('');
  const exactPhraseHit =
    targetCore.length >= 2 &&
    (checkHay.replace(/[^a-z0-9]+/g, ' ').includes(targetCore.slice(0, 2).join(' ')) ||
      (compactPhrase.length >= 7 && checkHay.replace(/[^a-z0-9]/g, '').includes(compactPhrase)));

  // For local/trusted mirrored tradeheaven uploads or Google thumbnails without descriptive filenames, don't discard if title already matches
  const isLocalUpload = String(cand.url || '').startsWith('/assets/uploads/');
  if (isLocalUpload) return false;

  if (targetCore.length >= 2 && coreHits < 2 && !exactPhraseHit) {
    return true;
  }
  if (targetCore.length === 1 && coreHits === 0) {
    return true;
  }
  return false;
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
  if (
    /(diesel[-_]?generat|genset)/i.test(lowerUrl) &&
    !/(diesel|generator|genset|cummins|caterpillar|power\s*gen)/i.test(target)
  ) {
    return true;
  }
  if (
    /(solar[-_]?panel|photovoltaic)/i.test(lowerUrl) &&
    !/(solar|photovoltaic|pv|monocrystalline|polycrystalline|renewable|inverter)/i.test(target)
  ) {
    return true;
  }

  // Enforce slug-to-title relevance on auto-generated or verified local upload filenames
  const fileName = lowerUrl.split('/').pop() || '';
  const autoMatch = fileName.match(/^(?:trade-heaven|auto|verified)-([a-z0-9-]+)-[a-f0-9]{6,16}\.(?:webp|jpe?g|png)$/i) ||
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

export function normalizeFullProductHeadingClient(rawName: string): string {
  let s = String(rawName || '').trim();
  if (!s) return '';
  s = s.replace(/^[^\wA-Za-z0-9]+/, '').trim();
  s = s.replace(
    /^(?:golden\s+lead|vip\s+exclusive|urgent\s+requirement|urgent\s+tender|buying\s+lead|buy\s+lead|sourcing\s+request|spot\s+tender|annual\s+contract|rfq|wanted)\b[\s:\-–—•]*/gi,
    ''
  );
  s = s.replace(/^[^\wA-Za-z0-9]+/, '').trim();
  s = normalizeCompoundProductTermsClient(s);
  s = s.replace(/[—–]+/g, ' ').replace(/\s+/g, ' ').trim();
  return s || String(rawName || '').trim();
}

export function cleanProductSearchSubject(rawName: string): string {
  let s = normalizeFullProductHeadingClient(rawName);
  if (!s) return '';
  s = s.replace(/\[[^\]]*\]/g, ' ');
  s = s.replace(/^\d[\d,.]*\s*(?:mt|metric\s+tons?|tons?|units?|pcs|pieces|barrels?|bbl|containers?|fcl|teu|kg|kgs|liters?|lbs)\b\s*(?:of\s+)?/i, '');
  s = s.replace(/\s+[-–—]\s*\d[\d,.]*\s*(?:mt|tons?|units?|pcs|barrels?|fcl|mw|kw|months?|years?).*$/i, '');
  s = normalizeCompoundProductTermsClient(s);
  s = s.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  return s || normalizeCompoundProductTermsClient(String(rawName || '').trim());
}

export function extractProductHeadingSearchQueries(rawHeading: string, category?: string): string[] {
  const full = String(rawHeading || '').trim();
  if (!full) return [];
  const normalizedFull = normalizeFullProductHeadingClient(full);
  const cleaned = cleanProductSearchSubject(full);
  const parts = full
    .replace(/[()[\]]/g, ',')
    .split(/\s*(?:[—–|;,/]|(?:\s+-\s+)|\s+&\s+|\s+\+\s+)\s*/)
    .map(p => normalizeFullProductHeadingClient(p))
    .filter(p => p.length >= 3);

  const out: string[] = [];
  const seen = new Set<string>();
  const pushUnique = (val: string) => {
    const t = String(val || '').replace(/\s+/g, ' ').trim();
    if (t.length < 3) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  };

  // 1. Full heading and normalized/cleaned full heading
  pushUnique(full);
  if (normalizedFull && normalizedFull.toLowerCase() !== full.toLowerCase()) {
    pushUnique(normalizedFull);
  }
  if (cleaned && cleaned.toLowerCase() !== full.toLowerCase()) {
    pushUnique(cleaned);
  }

  // 2. Sub-headings / clauses
  for (const part of parts) {
    pushUnique(part);
    const cleanedPart = cleanProductSearchSubject(part);
    if (cleanedPart && cleanedPart.toLowerCase() !== part.toLowerCase()) {
      pushUnique(cleanedPart);
    }
  }

  // 3. Extract core 2-word and 1-word product nouns from each sub-heading and from the main heading
  const extractCoreNounTokens = (text: string): string[] =>
    normalizeCompoundProductTermsClient(String(text || ''))
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(
        w =>
          w.length >= 3 &&
          !/^\d+$/.test(w) &&
          !/^\d+(?:mm|cm|kg|mt|ml|kw|mw|gsm|oz|lb|lbs)$/i.test(w) &&
          !MISMATCH_STOPWORDS.has(w) &&
          !CLIENT_GENERIC_MODIFIERS.has(w) &&
          !HEADING_NON_NOUN_WORDS.has(w)
      );

  const mainNouns = extractCoreNounTokens(cleaned || full);
  if (mainNouns.length >= 3) {
    pushUnique(mainNouns.slice(0, 3).join(' '));
  }
  if (mainNouns.length >= 2) {
    pushUnique(mainNouns.slice(0, 2).join(' '));
    pushUnique(mainNouns.slice(-2).join(' '));
  }

  for (const part of parts) {
    const partNouns = extractCoreNounTokens(part);
    if (partNouns.length >= 2) {
      pushUnique(partNouns.slice(0, 2).join(' '));
      pushUnique(partNouns.slice(-2).join(' '));
    }
  }

  // 4. Individual 1-word core product nouns (tail nouns and specific commodity nouns)
  for (let i = mainNouns.length - 1; i >= 0; i--) {
    pushUnique(mainNouns[i]);
  }

  // 5. Category core noun fallback
  if (category && String(category).trim().length >= 3) {
    const cleanCat = String(category).replace(/[&/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (mainNouns.length > 0) {
      pushUnique(`${mainNouns[mainNouns.length - 1]} ${cleanCat}`);
    }
    const catNouns = extractCoreNounTokens(cleanCat);
    if (catNouns.length >= 2) {
      pushUnique(catNouns.slice(0, 2).join(' '));
    } else if (catNouns.length === 1) {
      pushUnique(catNouns[0]);
    }
  }

  return out.slice(0, 12);
}

export function matchesProductHeadingSearch(
  rawQuery: string,
  fields: Array<string | undefined | null>
): boolean {
  const q = String(rawQuery || '').trim().toLowerCase();
  if (!q) return true;
  const rawCombined = fields
    .map(f => String(f || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (!rawCombined) return false;
  if (rawCombined.includes(q)) return true;

  const normalizeText = (str: string) =>
    normalizeCompoundProductTermsClient(str)
      .toLowerCase()
      .replace(/[—–\-_/|,;&()+[\]]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normQuery = normalizeText(q);
  const normHay = normalizeText(rawCombined);
  if (!normQuery) return true;
  if (normHay.includes(normQuery)) return true;

  const queryTokens = normQuery.split(' ').filter(t => t.length >= 2);
  if (queryTokens.length === 0) return true;
  const hayWords = normHay.split(' ').filter(Boolean);

  return queryTokens.every(tok => {
    if (normHay.includes(tok)) return true;
    const stem = tok.endsWith('s') && tok.length > 4 ? tok.slice(0, -1) : tok;
    return hayWords.some(w => w.includes(stem) || stem.includes(w));
  });
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
  const fullHeading = normalizeFullProductHeadingClient(productName);
  const n = String(fullHeading || productName || '')
    .toLowerCase()
    .replace(/[^\w\s/-]/g, ' ')
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
  if (clean.startsWith('data:image/svg') || clean.endsWith('.svg')) return true;
  return GENERIC_PLACEHOLDER_PATTERNS.some(p => clean.includes(p));
}

export function isSyntheticSpecCardOrPlaceholder(item: any): boolean {
  if (!item) return true;
  if (typeof item === 'string') {
    return isGenericOrPlaceholderImageUrl(item);
  }
  if (
    item.is_fallback_card === true ||
    item.isFallbackCard === true ||
    item.source === 'gemini_grounded_unique_webp' ||
    item.source === 'synthetic_spec_card' ||
    item.provider === 'gemini_grounded_unique_webp'
  ) {
    return true;
  }
  const url = String(item.url || item.new_image_url || item.image_url || '').trim();
  if (isGenericOrPlaceholderImageUrl(url)) return true;
  const title = String(item.title || item.label || '').toLowerCase();
  if (
    title.includes('verified b2b export spec') ||
    title.includes('company-isolated catalog asset') ||
    title.includes('unique verified asset') ||
    title.includes('trade heaven global catalog')
  ) {
    return true;
  }
  return false;
}

export async function validateRealImageUrlLoads(url: string, timeoutMs = 4500): Promise<boolean> {
  const clean = String(url || '').trim();
  if (!clean || isGenericOrPlaceholderImageUrl(clean) || BROKEN_EXTERNAL_URLS.has(clean)) {
    return false;
  }
  const baseKey = clean.split('?')[0];
  if (BROKEN_EXTERNAL_URLS.has(baseKey)) {
    return false;
  }
  if (VERIFIED_LOADABLE_URLS.has(clean) || VERIFIED_LOADABLE_URLS.has(baseKey)) {
    return true;
  }
  if (clean.startsWith('data:image/')) {
    if (clean.startsWith('data:image/svg')) return false;
  }

  const isExternal = /^https?:\/\//i.test(clean);
  const proxyUrl = isExternal
    ? `/api/v1/products/proxy-image?url=${encodeURIComponent(clean)}`
    : clean;

  const checkHttp200Image = async (targetUrl: string): Promise<boolean> => {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
      let res = await fetch(targetUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller ? controller.signal : undefined
      });
      if (res.status === 405 || res.status === 501) {
        res = await fetch(targetUrl, {
          method: 'GET',
          cache: 'no-store',
          signal: controller ? controller.signal : undefined
        });
      }
      if (timer) clearTimeout(timer);
      if (!res.ok || res.status !== 200) {
        return false;
      }
      const ctype = (res.headers.get('content-type') || '').toLowerCase();
      if (
        ctype.includes('text/html') ||
        ctype.includes('application/json') ||
        ctype.includes('image/svg') ||
        (ctype && !ctype.startsWith('image/') && !ctype.includes('octet-stream'))
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const checkDomImage = (srcToLoad: string): Promise<boolean> =>
    new Promise<boolean>(resolve => {
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        resolve(true);
        return;
      }
      const img = new Image();
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(ok);
      };
      const timer = setTimeout(() => finish(false), timeoutMs);
      img.onload = () => {
        finish(img.naturalWidth > 0 && img.naturalHeight > 0);
      };
      img.onerror = () => finish(false);
      img.src = srcToLoad;
    });

  // For local/same-origin URLs (e.g., /assets/uploads/...), strictly confirm HTTP 200 + non-HTML/SVG image + naturalWidth > 0
  if (!isExternal && !clean.startsWith('data:') && !clean.startsWith('blob:')) {
    const httpOk = await checkHttp200Image(clean);
    if (!httpOk) {
      markBrokenExternalImageUrl(clean);
      return false;
    }
    const domOk = await checkDomImage(clean);
    if (!domOk) {
      markBrokenExternalImageUrl(clean);
      return false;
    }
    VERIFIED_LOADABLE_URLS.add(clean);
    VERIFIED_LOADABLE_URLS.add(baseKey);
    return true;
  }

  // For data:/blob: URLs, confirm DOM image decodes with naturalWidth > 0
  if (clean.startsWith('data:') || clean.startsWith('blob:')) {
    const domOk = await checkDomImage(clean);
    if (domOk) {
      VERIFIED_LOADABLE_URLS.add(clean);
      return true;
    }
    return false;
  }

  // For external URLs:
  // In browser, verify direct DOM load first (works on both Node and static/PHP hosts without requiring proxy-image),
  // and fall back to same-origin proxy-image HTTP 200 + DOM load if hotlink-protected.
  if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
    const directOk = await checkDomImage(clean);
    if (directOk) {
      VERIFIED_LOADABLE_URLS.add(clean);
      VERIFIED_LOADABLE_URLS.add(baseKey);
      return true;
    }
    const proxyHttpOk = await checkHttp200Image(proxyUrl);
    if (proxyHttpOk) {
      const proxyDomOk = await checkDomImage(proxyUrl);
      if (proxyDomOk) {
        VERIFIED_LOADABLE_URLS.add(clean);
        VERIFIED_LOADABLE_URLS.add(baseKey);
        return true;
      }
    }
    markBrokenExternalImageUrl(clean);
    return false;
  }

  // Non-browser fallback (Node/SSR): verify HTTP 200 + image content-type
  const remoteOk = (await checkHttp200Image(clean)) || (await checkHttp200Image(proxyUrl));
  if (remoteOk) {
    VERIFIED_LOADABLE_URLS.add(clean);
    VERIFIED_LOADABLE_URLS.add(baseKey);
    return true;
  }
  markBrokenExternalImageUrl(clean);
  return false;
}

export async function filterLoadableRealCandidates(
  candidates: VisualProductImageCandidate[],
  desiredCount = 48,
  timeoutMs = 3500
): Promise<VisualProductImageCandidate[]> {
  const cleanList = (candidates || []).filter(
    c => c?.url && !isSyntheticSpecCardOrPlaceholder(c) && !isGenericOrPlaceholderImageUrl(c.url) && !BROKEN_EXTERNAL_URLS.has(c.url)
  );
  if (cleanList.length === 0) return [];
  const verified: VisualProductImageCandidate[] = [];
  const batchSize = 12;
  const maxToInspect = Math.min(cleanList.length, Math.max(desiredCount + 20, 64));
  for (let i = 0; i < maxToInspect && verified.length < desiredCount; i += batchSize) {
    const batch = cleanList.slice(i, i + batchSize);
    const checks = await Promise.all(
      batch.map(async cand => {
        const ok = await validateRealImageUrlLoads(cand.url, timeoutMs);
        return ok ? cand : null;
      })
    );
    for (const item of checks) {
      if (item) verified.push(item);
    }
  }
  return verified;
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
  excludeUrls?: string[];
  searchPage?: number;
}): Promise<VisualProductSearchResponse> {
  hydrateSessionCacheFromLocalStorage();

  const rawProductName = String(params.productName || '').trim();
  const fullProductHeading = normalizeFullProductHeadingClient(rawProductName);
  const productName = fullProductHeading.length >= 2 ? fullProductHeading : rawProductName;
  const productId = String(params.productId || '').trim();
  const category = String(params.category || '').trim();
  const specifications = String(params.specifications || '').trim();
  const count = Math.max(20, Math.min(60, Number(params.count) || 48));
  const searchPage = Math.max(0, Number(params.searchPage) || 0);

  if (productName.length < 2) {
    return {
      success: false,
      status: 'invalid_query',
      message: 'Enter a product title to auto-fetch verified product images.',
      images: [],
      pool: []
    };
  }

  const callerExcludeBases = new Set<string>();
  const callerExcludeHashes = new Set<string>();
  if (Array.isArray(params.excludeUrls)) {
    for (const ex of params.excludeUrls) {
      const s = String(ex || '').trim();
      if (!s) continue;
      callerExcludeBases.add(s.split('?')[0].split('#')[0]);
      const tok = extractClientUploadUrlHashToken(s);
      if (tok) callerExcludeHashes.add(tok);
    }
  }

  const key = normalizeVisualQueryKey(productName, category);
  const attachedRegistry = buildClientAttachedRegistry(productId);
  const filterUnused = (list: VisualProductImageCandidate[]): VisualProductImageCandidate[] => {
    const seen = new Set<string>();
    return list.filter(img => {
      const rawU = String(img?.url || '').trim();
      if (!rawU || BROKEN_EXTERNAL_URLS.has(rawU)) return false;
      const mapped = resolveLocalMirroredImageUrl(rawU);
      const rawBase = rawU.split('?')[0].split('#')[0];
      const base = mapped.split('?')[0].split('#')[0];
      const tok = extractClientUploadUrlHashToken(mapped) || extractClientUploadUrlHashToken(rawU);
      if (seen.has(base) || (tok && seen.has(`h:${tok}`))) return false;
      if (callerExcludeBases.has(base) || callerExcludeBases.has(rawBase)) return false;
      if (tok && callerExcludeHashes.has(tok)) return false;
      if (attachedRegistry.isUsed(mapped) || attachedRegistry.isUsed(rawU)) return false;
      seen.add(base);
      if (tok) seen.add(`h:${tok}`);
      return true;
    });
  };

  // Instant Fisher-Yates shuffle on cached session pool when user clicks Shuffle/Refresh without forcing new network results
  if (params.shuffleOnly && searchPage === 0 && SESSION_CACHE.has(key)) {
    const cached = SESSION_CACHE.get(key)!.data;
    if (cached.success && Array.isArray(cached.pool) && cached.pool.length > 0) {
      const healthyPool = filterUnused(cached.pool).map(img => ({
        ...img,
        url: resolveLocalMirroredImageUrl(img.url),
        thumbnailUrl: img.url.startsWith('/assets/uploads/')
          ? resolveLocalMirroredImageUrl(img.url)
          : (img.thumbnailUrl || resolveLocalMirroredImageUrl(img.url))
      }));
      if (healthyPool.length > 0) {
        const shuffled = fisherYatesShuffle(healthyPool);
        return {
          ...cached,
          fromCache: true,
          images: shuffled.slice(0, count),
          pool: shuffled,
          totalVerified: shuffled.length
        };
      }
    }
  }

  if (!params.forceRefresh && searchPage === 0 && SESSION_CACHE.has(key)) {
    const entry = SESSION_CACHE.get(key)!;
    if (Date.now() - entry.cachedAt < CACHE_TTL_MS && entry.data.success && entry.data.pool.length > 0) {
      const healthyPool = filterUnused(entry.data.pool).map(img => ({
        ...img,
        url: resolveLocalMirroredImageUrl(img.url),
        thumbnailUrl: img.url.startsWith('/assets/uploads/')
          ? resolveLocalMirroredImageUrl(img.url)
          : (img.thumbnailUrl || resolveLocalMirroredImageUrl(img.url))
      }));
      // Only serve from client session cache if there are plenty of unseen photos left
      if (healthyPool.length >= Math.min(20, count)) {
        const shuffled = fisherYatesShuffle(healthyPool);
        return {
          ...entry.data,
          fromCache: true,
          images: shuffled.slice(0, count),
          pool: shuffled,
          totalVerified: shuffled.length
        };
      }
    }
  }

  const inflightKey = `${key}::${productId || 'anon'}::p${searchPage}::ex${callerExcludeBases.size}::${params.forceRefresh ? 'fresh' : 'std'}`;
  if (INFLIGHT_REQUESTS.has(inflightKey)) {
    return INFLIGHT_REQUESTS.get(inflightKey)!;
  }

  const runPromise = withConcurrencyLimit(async (): Promise<VisualProductSearchResponse> => {
    const headingQueries = extractProductHeadingSearchQueries(rawProductName, category);
    if (headingQueries.length === 0 && productName.length >= 2) {
      headingQueries.push(productName);
    }

    const parsePayload = (raw: any, queryAttempted: string): VisualProductSearchResponse => {
      const rawPool: VisualProductImageCandidate[] = Array.isArray(raw?.pool)
        ? raw.pool
        : Array.isArray(raw?.images)
        ? raw.images
        : [];
      const healthyPool = rawPool
        .filter(
          c =>
            c?.url &&
            !BROKEN_EXTERNAL_URLS.has(c.url) &&
            !isSyntheticSpecCardOrPlaceholder(c)
        )
        .map(c => {
          const resolvedUrl = resolveLocalMirroredImageUrl(c.url);
          const resolvedThumb = resolvedUrl.startsWith('/assets/uploads/')
            ? resolvedUrl
            : (c.thumbnailUrl || resolvedUrl);
          return {
            ...c,
            url: resolvedUrl,
            thumbnailUrl: resolvedThumb
          };
        });
      const rankedPool = healthyPool.slice().sort(
        (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );
      const finalPool = params.shuffleOnly ? fisherYatesShuffle(rankedPool) : rankedPool;
      const selected = finalPool.slice(0, count);
      return {
        success: Boolean(raw?.success) && selected.length > 0,
        status: raw?.status || (selected.length > 0 ? 'ok' : 'error'),
        message: raw?.message,
        configRequired: Boolean(raw?.configRequired),
        fromCache: Boolean(raw?.fromCache),
        provider: raw?.provider,
        queryUsed: queryAttempted || raw?.queryUsed,
        totalVerified: Number(raw?.totalVerified || finalPool.length) || finalPool.length,
        images: selected,
        pool: finalPool
      };
    };

    const tryBackendFetchForQuery = async (
      endpoint: string,
      queryChip: string
    ): Promise<VisualProductSearchResponse | null> => {
      try {
        const mergedExcludeUrls = Array.from(
          new Set([
            ...(Array.isArray(params.excludeUrls) ? params.excludeUrls : []),
            ...Array.from(ASSIGNED_UPLOAD_IMAGE_URLS).slice(-150)
          ])
        ).slice(0, 300);
        const payload = {
          product_name: queryChip,
          product_id: productId,
          category,
          specifications,
          count,
          force_refresh: Boolean(params.forceRefresh),
          search_page: searchPage,
          exclude_urls: mergedExcludeUrls
        };
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
        const normalized = parsePayload(json, queryChip);
        const serverVerifiedUnused = filterUnused(normalized.pool).filter(
          c => !isSyntheticSpecCardOrPlaceholder(c)
        );
        const strictPool = serverVerifiedUnused.filter(
          c =>
            !isMismatchedProductImageUrl(c.url, queryChip, category) &&
            !isCandidateOffTopicClient(c, queryChip)
        );
        const strictUrls = new Set(strictPool.map(c => c.url));
        const cleanPool =
          strictPool.length >= count
            ? strictPool
            : [
                ...strictPool,
                ...serverVerifiedUnused.filter(c => !strictUrls.has(c.url))
              ];
        if (normalized.success && cleanPool.length > 0) {
          const verifiedPool = await filterLoadableRealCandidates(cleanPool, count, 3500);
          if (verifiedPool.length > 0) {
            const finalNorm: VisualProductSearchResponse = {
              ...normalized,
              queryUsed: queryChip,
              pool: verifiedPool,
              images: verifiedPool.slice(0, count),
              totalVerified: verifiedPool.length
            };
            SESSION_CACHE.set(key, { data: finalNorm, cachedAt: Date.now() });
            persistSessionCacheToLocalStorage();
            return finalNorm;
          }
        }
      } catch {
        // ignore network/parse error
      }
      return null;
    };

    // Automatic Sequential Heading Advancement:
    // Step through Full Heading -> Sub-headings -> Core 2-word noun -> Core 1-word noun until real loadable photos are found
    for (const queryChip of headingQueries) {
      const primaryVisual = await tryBackendFetchForQuery('/api/v1/products/fetch-images', queryChip);
      if (primaryVisual && primaryVisual.images.length > 0) {
        return primaryVisual;
      }

      const phpVisual = await tryBackendFetchForQuery('/api.php?action=fetch_product_images', queryChip);
      if (phpVisual && phpVisual.images.length > 0) {
        return phpVisual;
      }

      try {
        const wikiCandidates = filterUnused(
          await fetchWikimediaCommonsCorsCandidates(queryChip, category, count)
        ).filter(c => !isSyntheticSpecCardOrPlaceholder(c));
        const verifiedWiki = await filterLoadableRealCandidates(wikiCandidates, count, 4000);
        if (verifiedWiki.length > 0) {
          const wikiResp: VisualProductSearchResponse = {
            success: true,
            status: 'ok',
            provider: 'wikimedia_commons_live',
            queryUsed: queryChip,
            totalVerified: verifiedWiki.length,
            images: verifiedWiki.slice(0, count),
            pool: verifiedWiki
          };
          SESSION_CACHE.set(key, { data: wikiResp, cachedAt: Date.now() });
          persistSessionCacheToLocalStorage();
          return wikiResp;
        }
      } catch {
        // continue to next heading query chip
      }
    }

    // Check verified UNUSED & LOADABLE server media library assets across the heading query sequence (excluding synthetic spec cards & broken 404s)
    for (const queryChip of headingQueries) {
      try {
        const serverMediaCandidates = filterUnused(
          await buildServerMediaLibraryCandidates(queryChip, category, count)
        ).filter(c => !isSyntheticSpecCardOrPlaceholder(c));
        const verifiedLocal = await filterLoadableRealCandidates(serverMediaCandidates, count, 3000);
        if (verifiedLocal.length > 0) {
          const fallbackResp: VisualProductSearchResponse = {
            success: true,
            status: 'ok',
            provider: 'server_media_library_verified',
            queryUsed: queryChip,
            totalVerified: verifiedLocal.length,
            images: verifiedLocal.slice(0, count),
            pool: verifiedLocal
          };
          SESSION_CACHE.set(key, { data: fallbackResp, cachedAt: Date.now() });
          persistSessionCacheToLocalStorage();
          return fallbackResp;
        }
      } catch {
        // continue to next heading query chip
      }
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
let attachedCatalogUrlsProvider: ((excludeProductId?: string) => string[]) | null = null;

export function registerAttachedCatalogUrlsProvider(
  provider: (excludeProductId?: string) => string[]
): void {
  attachedCatalogUrlsProvider = provider;
}

function extractClientUploadUrlHashToken(rawUrl: string | undefined | null): string {
  const clean = String(rawUrl || '').trim().split('?')[0].split('#')[0];
  if (!clean) return '';
  const m = clean.match(/[-_]([0-9a-f]{12})\.(?:webp|jpe?g|png|avif)$/i);
  return m ? m[1].toLowerCase() : '';
}

function buildClientAttachedRegistry(excludeProductId?: string, extraUsed?: Iterable<string>) {
  const urls = new Set<string>();
  const hashTokens = new Set<string>();

  const addOne = (raw: string | undefined | null) => {
    const clean = String(raw || '').trim().split('?')[0].split('#')[0];
    if (!clean || isGenericOrPlaceholderImageUrl(clean)) return;
    urls.add(clean);
    const tok = extractClientUploadUrlHashToken(clean);
    if (tok) hashTokens.add(tok);
    const mirrored = LOCAL_MIRROR_MAP.get(clean);
    if (mirrored) {
      const cleanMirrored = mirrored.split('?')[0].split('#')[0];
      if (cleanMirrored) {
        urls.add(cleanMirrored);
        const mt = extractClientUploadUrlHashToken(cleanMirrored);
        if (mt) hashTokens.add(mt);
      }
    }
  };

  for (const u of ASSIGNED_UPLOAD_IMAGE_URLS) addOne(u);
  if (attachedCatalogUrlsProvider) {
    try {
      for (const u of attachedCatalogUrlsProvider(excludeProductId)) addOne(u);
    } catch {}
  }
  if (extraUsed) {
    for (const u of extraUsed) addOne(u);
  }

  return {
    urls,
    hashTokens,
    isUsed(candidate: string | undefined | null): boolean {
      const clean = String(candidate || '').trim().split('?')[0].split('#')[0];
      if (!clean) return false;
      if (urls.has(clean)) return true;
      const tok = extractClientUploadUrlHashToken(clean);
      if (tok && hashTokens.has(tok)) return true;
      const mirrored = LOCAL_MIRROR_MAP.get(clean);
      if (mirrored) {
        const cleanMirrored = mirrored.split('?')[0].split('#')[0];
        if (cleanMirrored && urls.has(cleanMirrored)) return true;
        const mt = extractClientUploadUrlHashToken(cleanMirrored);
        if (mt && hashTokens.has(mt)) return true;
      }
      return false;
    },
    add: addOne
  };
}

/**
 * Ensures any new product or RFQ posted without a manual image upload (or with a placeholder/duplicate image)
 * automatically receives a verified, 100% globally unique, category-relevant image that is NOT attached to any other product.
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
  const attached = buildClientAttachedRegistry(params.productId, params.usedUrls);

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
    !attached.isUsed(cleanPrimary) &&
    isManuallyUploadedImageUrl(cleanPrimary)
  ) {
    ASSIGNED_UPLOAD_IMAGE_URLS.add(cleanPrimary);
    attached.add(cleanPrimary);
    const gallery =
      Array.isArray(params.existingGallery) && params.existingGallery.length > 0
        ? params.existingGallery.filter(Boolean)
        : [rawPrimary];
    return { primaryUrl: rawPrimary, gallery, autoAssigned: false };
  }

  // Otherwise automatically step through heading queries (Full Heading -> Sub-headings -> Core 1-2 word noun)
  // until a real, loadable product photo is found and uploaded!
  try {
    const headingQueries = extractProductHeadingSearchQueries(
      params.productName || 'Wholesale Commodity',
      params.category
    );
    const pickFromSearch = async (forceRefresh: boolean) => {
      for (const queryChip of headingQueries) {
        const searchRes = await fetchVisualProductImages({
          productName: queryChip,
          productId: params.productId,
          category: params.category,
          specifications: params.specifications,
          count: 15,
          forceRefresh
        });

        const pool =
          Array.isArray(searchRes.pool) && searchRes.pool.length > 0
            ? searchRes.pool
            : Array.isArray(searchRes.images)
            ? searchRes.images
            : [];

        for (const cand of pool) {
          if (isSyntheticSpecCardOrPlaceholder(cand)) continue;
          const candUrl = resolveLocalMirroredImageUrl(String(cand?.url || '').trim());
          const cleanCand = candUrl.split('?')[0];
          if (!cleanCand || isGenericOrPlaceholderImageUrl(cleanCand) || attached.isUsed(cleanCand)) continue;

          const loadsOk = await validateRealImageUrlLoads(candUrl);
          if (!loadsOk) continue;

          let finalPrimary = candUrl;
          if (/^https?:\/\//i.test(finalPrimary)) {
            const mirrored = await autoUploadDisplayedProductImage({
              imageUrl: finalPrimary,
              productId: params.productId,
              productName: params.productName || queryChip,
              category: params.category
            });
            if (!mirrored || isGenericOrPlaceholderImageUrl(mirrored)) continue;
            const cleanMirrored = mirrored.split('?')[0];
            if (attached.isUsed(cleanMirrored)) continue;
            const localLoadsOk = await validateRealImageUrlLoads(mirrored);
            if (!localLoadsOk) continue;
            finalPrimary = mirrored;
          }

          ASSIGNED_UPLOAD_IMAGE_URLS.add(finalPrimary.split('?')[0]);
          attached.add(finalPrimary);
          return {
            primaryUrl: finalPrimary,
            gallery: [finalPrimary],
            autoAssigned: true
          };
        }
      }
      return null;
    };

    const firstAttempt = await pickFromSearch(false);
    if (firstAttempt) return firstAttempt;

    const freshAttempt = await pickFromSearch(true);
    if (freshAttempt) return freshAttempt;
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
  locked?: boolean;
  server_verified?: boolean;
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
  duplicates_fixed?: number;
  mismatched_fixed?: number;
  newly_fixed_count?: number;
  records_fixed: number;
  healthy_records?: number;
  server_saved_verified?: boolean;
  disk_verified_count?: number;
  locked_count?: number;
  live_synced?: boolean;
  timestamp?: string;
  audit_log: CatalogImageAuditLogItem[];
  catalog_records?: CatalogScannedCleanRecord[];
}

export interface SingleCatalogImageFixResult {
  success: boolean;
  serverSavedVerified?: boolean;
  diskVerified?: boolean;
  locked?: boolean;
  verifiedAt?: string;
  liveSynced?: boolean;
  replacedOldUrls?: string[];
  deletedOldUrls?: string[];
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

export interface ServerVerifyLockVaultResult {
  success: boolean;
  serverSavedVerified: boolean;
  verifiedCount: number;
  lockedCount: number;
  missingOnDiskCount: number;
  blockedOldUrlsCount: number;
  totalOverridesOnDisk: number;
  liveSynced: boolean;
  liveSyncError?: string;
  verifiedAt: string;
  diskFiles?: string[];
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
  const tokens = Array.from(new Set(extractTopicTokensClient(cleaned)));

  if (tokens.length >= 2 && tokens.length <= 4) {
    queries.push(tokens.join(' '));
  }
  for (const cl of clauses.slice(0, 3)) {
    const clTokens = Array.from(new Set(extractTopicTokensClient(cl)));
    if (clTokens.length >= 2) {
      queries.push(clTokens.slice(0, 4).join(' '));
    } else if (clTokens.length === 1 && tokens.length >= 2 && clTokens[0] !== tokens[0]) {
      queries.push(`${tokens[0]} ${clTokens[0]}`);
    } else if (clTokens.length === 1 && clTokens[0].length >= 4) {
      queries.push(clTokens[0]);
    }
  }
  if (tokens.length >= 3) {
    queries.push(tokens.slice(0, 3).join(' '));
  }
  if (queries.length === 0 && tokens.length > 0) {
    queries.push(tokens.join(' '));
  }
  if (queries.length === 0 && category) {
    const catToks = extractTopicTokensClient(category);
    if (catToks.length > 0) queries.push(catToks.slice(0, 2).join(' '));
  }
  return Array.from(new Set(queries.map(q => q.trim()).filter(q => q.length >= 3))).slice(0, 3);
}

async function fetchWikimediaCommonsCorsCandidates(
  productName: string,
  category?: string,
  limit = 15
): Promise<VisualProductImageCandidate[]> {
  if (typeof fetch !== 'function') return [];
  const queries = buildFocusedVisualSearchQueriesClient(productName, category);
  if (queries.length === 0) return [];
  const allTitleTokens = Array.from(new Set(extractTopicTokensClient(cleanProductSearchSubject(productName))));
  const coreTitleTokens = allTitleTokens.filter(t => !CLIENT_GENERIC_MODIFIERS.has(t));
  const requiredTokens = coreTitleTokens.length > 0 ? coreTitleTokens : allTitleTokens;

  const seen = new Set<string>();
  const collected: VisualProductImageCandidate[] = [];

  await Promise.allSettled(
    queries.map(async qStr => {
      try {
        const words = qStr.trim().split(/\s+/).filter(Boolean);
        // Quote only clean 2-word phrases; leave 1-word or 3+ word queries unquoted so Wikimedia returns real product photos
        const searchTerms = words.length === 2 ? [`"${qStr}"`, qStr] : [qStr];
        for (const term of searchTerms) {
          const url = `https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(`${term} filetype:bitmap`)}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json`;
          const resp = await fetch(url);
          if (!resp.ok) continue;
          const data: any = await resp.json().catch(() => null);
          const pages = Object.values(data?.query?.pages || {}) as any[];
          let addedForTerm = 0;
          for (const p of pages) {
            const info = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
            if (!info) continue;
            const rawTitle = String(p?.title || '');
            if (OFF_TOPIC_CANDIDATE_RE.test(rawTitle)) continue;
            const mime = String(info.mime || '').toLowerCase();
            if (!mime.includes('jpeg') && !mime.includes('png') && !mime.includes('webp')) continue;
            const w = Number(info.width || 0);
            const h = Number(info.height || 0);
            if ((w > 0 && w < 380) || (h > 0 && h < 280)) continue;
            const candUrl = String(info.thumburl || info.url || '').trim();
            if (!candUrl || seen.has(candUrl)) continue;

            const readableTitle = rawTitle.replace(/^File:/i, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
            const checkHay = `${readableTitle} ${candUrl}`.toLowerCase();
            if (OFF_TOPIC_CANDIDATE_RE.test(checkHay)) continue;

            const coreHits = requiredTokens.filter(tk => tokenMatchesHaystackWordBoundary(tk, checkHay));
            const minNeeded = requiredTokens.length >= 2 && words.length <= 2 ? 2 : 1;
            const compactPhrase = requiredTokens.slice(0, 2).join('');
            const exactPhraseHit =
              requiredTokens.length >= 2 &&
              (checkHay.replace(/[^a-z0-9]+/g, ' ').includes(requiredTokens.slice(0, 2).join(' ')) ||
                (compactPhrase.length >= 7 && checkHay.replace(/[^a-z0-9]/g, '').includes(compactPhrase)));

            if (requiredTokens.length > 0 && coreHits.length < minNeeded && !exactPhraseHit) continue;
            if (isMismatchedProductImageUrl(candUrl, productName, category)) continue;

            seen.add(candUrl);
            addedForTerm++;
            collected.push({
              url: candUrl,
              thumbnailUrl: candUrl,
              title: readableTitle || qStr,
              sourceDomain: 'commons.wikimedia.org',
              width: w || undefined,
              height: h || undefined,
              relevanceScore: (exactPhraseHit ? 10 : 0) + coreHits.length * 4 + (w >= h ? 2 : 0)
            });
          }
          if (addedForTerm > 0) break;
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
    if (entry && typeof entry === 'object' && entry.primary && !isSyntheticSpecCardOrPlaceholder(entry)) {
      considerUrl(String(entry.primary), key);
    }
  }
  for (const item of mediaLibrary) {
    if (item?.url && !isSyntheticSpecCardOrPlaceholder(item)) {
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
    const cleanCurrent = currentUrl.split('?')[0];
    const isManualFixed = Boolean(
      ov &&
      cleanCurrent &&
      (ov.updatedBy === 'admin-manual' || ov.updatedBy === 'admin-upload' || ov.updatedBy === 'manual') &&
      !isGenericOrPlaceholderImageUrl(cleanCurrent)
    );
    const isAuditorFixed = Boolean(
      ov &&
      cleanCurrent &&
      (ov.locked === true ||
        ov.serverVerified === true ||
        ov.updatedBy === 'catalog-image-auditor' ||
        ov.updatedBy === 'system-repair') &&
      !isGenericOrPlaceholderImageUrl(cleanCurrent) &&
      !seenUrls.has(cleanCurrent)
    );
    const issue =
      isManualFixed || isAuditorFixed
        ? { flagged: false as const, type: 'MISMATCHED' as const, reason: '' }
        : classifyClientAuditIssue(item.id, item.title, item.category, currentUrl, seenUrls);

    if (!issue.flagged) {
      const cleanU = cleanCurrent;
      if (cleanU) seenUrls.set(cleanU, { id: item.id, title: item.title });
      const wasRecentlyFixed = Boolean(
        ov &&
          (ov.locked === true ||
            ov.serverVerified === true ||
            ov.updatedBy === 'admin-manual' ||
            ov.updatedBy === 'admin-upload' ||
            ov.updatedBy === 'manual' ||
            ov.updatedBy === 'catalog-image-auditor' ||
            ov.updatedBy === 'system-repair')
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
          status: wasRecentlyFixed ? 'FIXED' : 'CLEAN',
          locked: Boolean(ov?.locked || ov?.serverVerified),
          server_verified: Boolean(ov?.serverVerified || ov?.locked)
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
  const remainingFlaggedDup = auditLog.filter(r => r.status === 'FLAGGED' && r.issue_type === 'DUPLICATE').length;
  const remainingFlaggedMis = auditLog.filter(r => r.status === 'FLAGGED' && r.issue_type !== 'DUPLICATE').length;
  const newlyFixedDup = auditLog.filter(r => r.status === 'FIXED' && r.issue_type === 'DUPLICATE').length;
  const newlyFixedMis = auditLog.filter(r => r.status === 'FIXED' && r.issue_type !== 'DUPLICATE').length;
  const flaggedCount = remainingFlaggedDup + remainingFlaggedMis;
  return {
    status: 'success',
    success: true,
    dry_run: options.dryRun,
    total_scanned: totalScanned,
    products_scanned: productsScanned,
    rfqs_scanned: rfqsScanned,
    categories_scanned: categoriesScanned,
    duplicates_detected: options.dryRun ? duplicatesDetected : remainingFlaggedDup,
    mismatched_detected: options.dryRun ? mismatchedDetected : remainingFlaggedMis,
    duplicates_fixed: newlyFixedDup,
    mismatched_fixed: newlyFixedMis,
    newly_fixed_count: newlyFixedDup + newlyFixedMis,
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

  let lastServerError = '';
  try {
    const fallbackQuery = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const primaryRes = await fetch(`/api/v1/admin/audit-and-fix-catalog-images${fallbackQuery}`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(45000) : undefined
    });
    const ctype = (primaryRes.headers.get('content-type') || '').toLowerCase();
    if (primaryRes.ok && !ctype.includes('text/html')) {
      const json = await primaryRes.json().catch(() => null);
      if (isUsableAuditSummary(json)) {
        return json;
      }
    } else {
      const errJson = !ctype.includes('text/html') ? await primaryRes.json().catch(() => null) : null;
      lastServerError = errJson?.message || `Server audit endpoint returned HTTP ${primaryRes.status}`;
    }
  } catch (err: any) {
    lastServerError = err?.message || 'Unable to reach server audit endpoint';
  }

  try {
    const res = await fetch(`/api.php?action=audit_and_fix_catalog_images${querySuffix}`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(45000) : undefined
    });
    const ctype = (res.headers.get('content-type') || '').toLowerCase();
    if (res.ok && !ctype.includes('text/html')) {
      const json = await res.json().catch(() => null);
      if (isUsableAuditSummary(json)) {
        return json;
      }
    } else if (!lastServerError) {
      lastServerError = `PHP audit endpoint returned HTTP ${res.status}`;
    }
  } catch (err: any) {
    if (!lastServerError) lastServerError = err?.message || 'Unable to reach audit endpoint';
  }

  // STRICT PERSISTENCE GUARANTEE: NEVER fake a successful write audit when the server failed to save!
  if (!dryRun) {
    throw new Error(
      lastServerError ||
        'Server could not save catalog image audit changes. Please retry when the server is reachable.'
    );
  }

  // Dry-run preview fallback only (read-only)
  return runClientFallbackCatalogImageAudit({
    dryRun: true,
    includeCatalog,
    catalogItems: options?.catalogItems || []
  });
}

export async function fixSingleCatalogImage(params: {
  recordId: string;
  recordType?: 'PRODUCT' | 'RFQ' | 'CATEGORY' | 'OVERRIDE';
  title?: string;
  category?: string;
  specifications?: string;
  customImageUrl?: string;
  previousImageUrl?: string;
  revert?: boolean;
}): Promise<SingleCatalogImageFixResult> {
  const payload = {
    record_id: params.recordId,
    record_type: params.recordType,
    title: params.title,
    category: params.category,
    specifications: params.specifications,
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
        json.is_fallback_card !== true &&
        json.source !== 'gemini_grounded_unique_webp' &&
        json.source !== 'synthetic_spec_card' &&
        typeof json.record_id === 'string' &&
        typeof json.new_image_url === 'string' &&
        json.new_image_url.trim().length > 0 &&
        !isSyntheticSpecCardOrPlaceholder(json) &&
        !isGenericOrPlaceholderImageUrl(json.new_image_url) &&
        (params.revert ||
          Boolean(params.customImageUrl) ||
          json.serverSavedVerified === true ||
          json.diskVerified === true ||
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
        const loadsOk = await validateRealImageUrlLoads(json.new_image_url);
        if (loadsOk) {
          return json;
        }
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

  // Sequential Heading Advancement Fallback:
  // Step through Full Heading -> Sub-headings -> Core 2-word noun -> Core 1-word noun until a real, loadable photo is uploaded!
  let finalUrl = '';
  let source = 'direct_set_product_images';
  let matchedHeadingQuery = resolvedTitle;

  if (params.revert && prevUrl && prevUrl !== '(empty)') {
    finalUrl = prevUrl;
    source = 'revert_restore';
  } else if (params.customImageUrl && params.customImageUrl.trim()) {
    const customCandidate = params.customImageUrl.trim();
    if (isSyntheticSpecCardOrPlaceholder(customCandidate)) {
      throw new Error('Synthetic spec-card or placeholder image URLs are not allowed. Please select a real product photo.');
    }
    const loadsOk = await validateRealImageUrlLoads(customCandidate);
    if (!loadsOk) {
      throw new Error('Selected image URL failed to load (must return HTTP 200 and naturalWidth > 0).');
    }
    finalUrl = customCandidate;
    source = 'manual_custom_url';
  } else {
    const cleanPrev = prevUrl.split('?')[0];
    const headingQueries = extractProductHeadingSearchQueries(resolvedTitle, resolvedCategory);
    if (headingQueries.length === 0) headingQueries.push(resolvedTitle);

    for (const queryChip of headingQueries) {
      const visual = await fetchVisualProductImages({
        productName: queryChip,
        productId: cleanId,
        category: resolvedCategory,
        specifications: params.specifications,
        count: 36,
        forceRefresh: true
      });
      const pool = Array.isArray(visual.pool) && visual.pool.length > 0 ? visual.pool : visual.images || [];
      const relevantCandidates = pool.filter(
        c =>
          c?.url &&
          !isSyntheticSpecCardOrPlaceholder(c) &&
          !isGenericOrPlaceholderImageUrl(c.url) &&
          !isMismatchedProductImageUrl(c.url, queryChip, resolvedCategory) &&
          c.url.split('?')[0] !== cleanPrev
      );

      for (const picked of relevantCandidates) {
        let candidateUrl = picked.url;
        const candidateLoads = await validateRealImageUrlLoads(candidateUrl);
        if (!candidateLoads) continue;

        if (/^https?:\/\//i.test(candidateUrl)) {
          const mirrored = await autoUploadDisplayedProductImage({
            imageUrl: candidateUrl,
            productId: cleanId,
            productName: resolvedTitle,
            category: resolvedCategory
          });
          if (mirrored && !isGenericOrPlaceholderImageUrl(mirrored)) {
            const localLoads = await validateRealImageUrlLoads(mirrored);
            if (localLoads) {
              candidateUrl = mirrored;
            } else {
              continue;
            }
          } else {
            continue;
          }
        }
        finalUrl = candidateUrl;
        source = visual.provider || 'wikimedia_commons_live';
        matchedHeadingQuery = visual.queryUsed || queryChip;
        break;
      }

      if (finalUrl) break;
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
  let diskVerified = false;
  for (const ep of persistEndpoints) {
    try {
      const method = ep.includes('api.php') ? 'POST' : 'PUT';
      const saveRes = await fetch(ep, {
        method,
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          productId: cleanId,
          primaryUrl: cleanFinal,
          galleryUrls: [cleanFinal],
          format: ext,
          locked: !params.revert,
          serverVerified: !params.revert,
          imageUpdatedAt: nowMs
        })
      });
      const ctype = (saveRes.headers.get('content-type') || '').toLowerCase();
      if (ctype.includes('text/html')) continue;
      const saveJson = await saveRes.json().catch(() => null);
      if (saveRes.ok && saveJson && (saveJson.success === true || saveJson.status === 'success')) {
        persisted = true;
        const returnedPrimary = String(saveJson?.data?.overrides?.[cleanId]?.primary || '').split('?')[0];
        diskVerified = Boolean(
          saveJson.serverSavedVerified === true ||
            saveJson.diskVerified === true ||
            (returnedPrimary && returnedPrimary === cleanFinal.split('?')[0])
        );
        break;
      }
    } catch {
      // try next endpoint
    }
  }

  // STRICT GUARANTEE: NEVER claim success if the server did not confirm persistence!
  if (!persisted) {
    throw new Error(
      lastMeaningfulError ||
        `Server did NOT confirm saving the updated image for ${cleanId}. Please retry or check server connectivity.`
    );
  }

  // If fallback endpoint did not explicitly echo disk verification, run an explicit verify-and-lock confirmation for this ID
  if (!params.revert && !diskVerified) {
    try {
      const lockCheck = await verifyAndLockSavedCatalogImages([cleanId]);
      if (lockCheck.serverSavedVerified && lockCheck.verifiedCount > 0) {
        diskVerified = true;
      }
    } catch {
      // Keep persisted=true with diskVerified=false so UI reports status accurately
    }
  }

  return {
    success: true,
    serverSavedVerified: diskVerified,
    diskVerified,
    locked: !params.revert && diskVerified,
    verifiedAt: nowIso,
    record_id: cleanId,
    record_type: resolvedType,
    title: resolvedTitle,
    category: resolvedCategory,
    old_image_url: prevUrl || '(empty)',
    new_image_url: cleanFinal,
    query_used: matchedHeadingQuery || resolvedTitle,
    source,
    is_fallback_card: false,
    status: params.revert ? 'FLAGGED' : 'FIXED',
    updatedAt: nowIso,
    imageUpdatedAt: !params.revert ? nowMs : undefined
  };
}

export async function verifyAndLockSavedCatalogImages(
  recordIds?: string[]
): Promise<ServerVerifyLockVaultResult> {
  const payload =
    Array.isArray(recordIds) && recordIds.length > 0 ? { record_ids: recordIds } : {};
  const endpoints = [
    '/api/v1/admin/verify-and-lock-catalog-images',
    '/api.php?action=verify_and_lock_catalog_images'
  ];
  let lastError = 'Unable to reach server verification vault endpoint.';

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(30000) : undefined
        });
        const ctype = (res.headers.get('content-type') || '').toLowerCase();
        if (ctype.includes('text/html')) {
          lastError = `Verification vault endpoint returned HTTP ${res.status}`;
          continue;
        }
        const json = await res.json().catch(() => null);
        if (res.ok && json && typeof json.verifiedCount === 'number') {
          return {
            success: Boolean(json.success),
            serverSavedVerified: Boolean(json.serverSavedVerified),
            verifiedCount: Number(json.verifiedCount || 0),
            lockedCount: Number(json.lockedCount || 0),
            missingOnDiskCount: Number(json.missingOnDiskCount || 0),
            blockedOldUrlsCount: Number(json.blockedOldUrlsCount || 0),
            totalOverridesOnDisk: Number(json.totalOverridesOnDisk || 0),
            liveSynced: Boolean(json.liveSynced),
            liveSyncError: json.liveSyncError,
            verifiedAt: String(json.verifiedAt || new Date().toISOString()),
            diskFiles: Array.isArray(json.diskFiles) ? json.diskFiles : undefined,
            message: json.message
          };
        }
        if (json?.message) lastError = String(json.message);
        else if (res.status >= 400) lastError = `Server verification vault returned HTTP ${res.status}`;
      } catch (err: any) {
        if (err?.message) lastError = err.message;
      }
    }
    if (attempt === 0) {
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  throw new Error(lastError);
}

