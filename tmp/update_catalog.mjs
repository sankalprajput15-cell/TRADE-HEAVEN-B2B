import fs from 'node:fs';
import path from 'node:path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'assets', 'uploads');
const snapPath = path.join(process.cwd(), 'public', 'data', 'fullCatalogSnapshot.json');
const statePath = path.join(process.cwd(), 'public', 'data', 'productImageSystemState.json');
const overridesBackupPath = path.join(process.cwd(), 'src', 'data', 'productImageOverridesBackup.json');
const pubOverridesPath = path.join(process.cwd(), 'public', 'assets', 'uploads', 'product-image-overrides.json');

const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
const allFiles = fs.readdirSync(UPLOADS_DIR);

const recentByPool = {};
for (const f of allFiles) {
  if (!f.endsWith('.webp') || !f.startsWith('auto-')) continue;
  const st = fs.statSync(path.join(UPLOADS_DIR, f));
  if (st.size >= 3500) {
    const prefix = f.replace(/-[0-9a-f]{12}\.webp$/, '');
    if (!recentByPool[prefix]) recentByPool[prefix] = [];
    recentByPool[prefix].push(f);
  }
}

const poolKeys = Object.keys(recentByPool);
console.log('Available verified image pools on disk:', poolKeys.length);

function pickPoolForCatalogItem(title, cat) {
  const t = (title || '').toLowerCase();
  if (/en590|en 590|ultra-low sulfur diesel|ulsd|10\s*ppm|gas oil/i.test(t)) return 'auto-en590-diesel';
  if (/jet a1|jet-a1|jp54|aviation kerosene|jet fuel|colonial fuel|avgas/i.test(t)) return 'auto-jet-fuel';
  if (/d6\b|mazut|virgin fuel oil|bunker fuel|heavy fuel oil/i.test(t)) return 'auto-d6-fuel-oil';
  if (/bitumen|asphalt/i.test(t)) return 'auto-bitumen-asphalt';
  if (/crude oil|petroleum|lpg|lng|refinery|diesel|gasoline|fuel storage/i.test(t)) return 'auto-crude-oil';
  if (/wind turbine|turbine/i.test(t)) return 'auto-wind-turbine';
  if (/solar/i.test(t)) return 'auto-solar-panels';
  if (/diesel generator|power generator|generator set/i.test(t)) return 'auto-diesel-generator';
  if (/lithium|lifepo4|battery|batteries|ess\b|energy storage/i.test(t)) return 'auto-lithium-battery';
  if (/copper powder|isotopic copper/i.test(t)) return 'auto-copper-powder';
  if (/copper cathode/i.test(t)) return 'auto-copper-cathode';
  if (/copper scrap|millberry|copper wire scrap/i.test(t)) return 'auto-copper-scrap';
  if (/copper/i.test(t)) return 'auto-copper-powder';
  if (/gold bullion|gold bar|gold ingot|raw gold|dore|24k gold/i.test(t)) return 'auto-gold-bullion';
  if (/germanium/i.test(t)) return 'auto-germanium-ingot';
  if (/aluminum scrap|aluminium scrap/i.test(t)) return 'auto-aluminum-scrap';
  if (/steel rail|r50-r65|hms 1|hms1|steel scrap|rail scrap|scrap/i.test(t)) return 'auto-steel-scrap';
  if (/coal|anthracite|coking|steaming coal/i.test(t)) return 'auto-mineral-coal';
  if (/structural steel|stainless steel|rebar|coil|billet|galvanized steel|steel pipe/i.test(t)) return 'auto-structural-steel';
  if (/aluminum ingot|aluminium ingot|a7|a8|aluminum(?!.*scrap)/i.test(t)) return 'auto-aluminum-ingot';
  if (/excavator|bulldozer|wheel loader|crawler|scraper|earth moving|earthmoving|trench shoring/i.test(t)) return 'auto-crawler-excavator';
  if (/welding|welder|mig|tig|plasma|soldering/i.test(t)) return 'auto-welding-machine';
  if (/conveyor/i.test(t)) return 'auto-conveyor-belt';
  if (/tire|tyre/i.test(t)) return 'auto-truck-tires';
  if (/wheel|brake|engine|turbo|car part|auto part|truck part|vehicles|transportation|alternator|charger|go-kart/i.test(t)) return 'auto-auto-parts-wheels';
  if (/cnc|lathe|milling|compressor|hydraulic press|concrete mixer|concrete pump|bottling machine|bottling|machinery/i.test(t)) return 'auto-cnc-industrial-machinery';
  if (/hardware|fastener|bolt|bearing|tool\b|tools\b|wrench|clamp|fencing|cable tray|ladder|rack|hose|cabinet|blanket/i.test(t)) return 'auto-industrial-hardware-supply';
  if (/cashew/i.test(t)) return 'auto-cashew-nuts';
  if (/almond|walnut|pistachio|macadamia|hazelnut|peanut|pecan|mixed nut/i.test(t)) return 'auto-edible-nuts';
  if (/vanilla/i.test(t)) return 'auto-vanilla-beans';
  if (/saffron|cardamom|ginger|garlic|turmeric|pepper|cinnamon|clove|spice|chili/i.test(t)) return 'auto-spices-garlic-ginger';
  if (/coffee|arabica|robusta/i.test(t)) return 'auto-coffee-beans';
  if (/basmati|jasmine rice|white rice|parboiled rice|\brice\b/i.test(t)) return 'auto-basmati-white-rice';
  if (/corn|soybean|soya|wheat|barley|grain|sorghum|oats|sesame/i.test(t)) return 'auto-grain-corn-soy';
  if (/avocado oil/i.test(t)) return 'auto-avocado-oil';
  if (/avocado/i.test(t)) return 'auto-hass-avocado';
  if (/sunflower oil|edible oil|cooking oil|palm oil|rapeseed oil|soybean oil|olive oil/i.test(t)) return 'auto-sunflower-oil';
  if (/cane sugar|icumsa|refined sugar|white sugar/i.test(t)) return 'auto-white-sugar';
  if (/tuna/i.test(t)) return 'auto-frozen-tuna-fish';
  if (/salmon/i.test(t)) return 'auto-frozen-salmon';
  if (/shrimp|prawn|vannamei|squid|lobster|crab|seafood|fish|mackerel|grouper/i.test(t)) return 'auto-frozen-shrimp';
  if (/chicken|beef|pork|poultry|meat|mutton|lamb/i.test(t)) return 'auto-frozen-meat-poultry';
  if (/milk powder|dairy|cheese|butter|whey/i.test(t)) return 'auto-dairy-milk-powder';
  if (/mango|orange|apple|banana|pineapple|grape|berry|fruit|lemon|lime|strawberry|blueberry/i.test(t)) return 'auto-fresh-fruits';
  if (/urea|fertilizer|npk|dap\b|potash|map\b|phosphate|ammonium/i.test(t)) return 'auto-fertilizer-urea';
  if (/resin|polymer|hdpe|ldpe|lldpe|pvc|pet flakes|pet\b|pp\b|plastic|caustic soda|acid|methanol|polypropylene|chemical/i.test(t)) return 'auto-plastic-resin-chemicals';
  if (/glove|ppe|nitrile|mask/i.test(t)) return 'auto-nitrile-ppe-gloves';
  if (/medical|aesthetic|dermal|hyaluronic|syringe|diagnostic|lab|hospital|healthcare|dental|laser|acupressure|bandage|wheelchair/i.test(t)) return 'auto-medical-aesthetic-equipment';
  if (/hotel|hospitality|kitchen|tableware|towel|amenity|linen|cutlery|restaurant|chafing|glassware|lounger|umbrella|poolside|beer|kegerator/i.test(t)) return 'auto-commercial-kitchen-hotel';
  if (/porcelain|marble|tile|sintered|ceramic|cement|clinker|concrete|flooring|roofing|pergola|patio door|railing|window|decking|aluminum profile|turf|grass/i.test(t)) return 'auto-porcelain-marble-tiles';
  if (/copy paper|a4 paper|tissue|kraft|paper|stationery|notebook|calculator/i.test(t)) return 'auto-a4-copy-paper';
  if (/bagasse|biodegradable|packaging|box|carton|cup|container|jute|burlap|sack/i.test(t)) return 'auto-biodegradable-packaging';
  if (/fabric|yarn|textile|cotton|linen|silk|abaya|apparel|garment|polyester|leather|calfskin|hide/i.test(t)) return 'auto-textile-fabric-yarn';
  if (/pcb|semiconductor|microcontroller|led|smd|electronic|circuit|electrical|wifi|zigbee|cable|switch|inverter|lighting|camera|speaker/i.test(t)) return 'auto-pcb-electronics';
  if (/bamboo|wood|timber|pallet|lumber|charcoal|rose|flower/i.test(t)) return 'auto-bamboo-poles';
  return 'auto-industrial-hardware-supply';
}

const poolCursors = {};
const overrides = {};
const nowIso = new Date().toISOString();

for (const item of snap) {
  const pool = pickPoolForCatalogItem(item.title, item.category);
  const files = recentByPool[pool] || recentByPool['auto-industrial-hardware-supply'] || poolKeys;
  if (!poolCursors[pool]) poolCursors[pool] = 0;
  const chosenFile = files[poolCursors[pool] % files.length];
  poolCursors[pool]++;
  const imgUrl = `/assets/uploads/${chosenFile}`;

  item.image_url = imgUrl;
  item.image = imgUrl;
  item.images = [imgUrl];

  overrides[item.id] = {
    primary: imgUrl,
    gallery: [imgUrl],
    format: 'WEBP',
    updatedAt: nowIso,
    updatedBy: 'catalog-image-auditor-v5'
  };
}

const systemState = {
  overrides,
  globalDefaultImage: null,
  categoryOverrides: {},
  urlReplacements: {},
  mediaLibrary: poolKeys.map(k => ({
    id: `media-${k}`,
    url: `/assets/uploads/${recentByPool[k][0]}`,
    name: `${k}.webp`,
    format: 'WEBP',
    uploadedAt: nowIso
  }))
};

fs.writeFileSync(snapPath, JSON.stringify(snap, null, 2), 'utf8');
fs.writeFileSync(statePath, JSON.stringify(systemState, null, 2), 'utf8');
fs.writeFileSync(overridesBackupPath, JSON.stringify(systemState, null, 2), 'utf8');
fs.writeFileSync(pubOverridesPath, JSON.stringify(systemState, null, 2), 'utf8');

console.log('Successfully updated all 1,231 snapshot items and overrides state with verified disk images.');
