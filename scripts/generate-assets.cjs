const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Icon SVG (Monogram "TH" on dark slate background)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0f172a"/>
  <g fill="#ffffff">
    <!-- Letter T -->
    <path d="M 72 120 H 246 V 180 H 185 V 390 H 133 V 180 H 72 Z"/>
    <!-- Letter H -->
    <path d="M 276 120 H 328 V 230 H 400 V 120 H 452 V 390 H 400 V 282 H 328 V 390 H 276 Z"/>
  </g>
  <!-- Subtle accent dot or golden border -->
  <rect x="8" y="8" width="496" height="496" rx="94" fill="none" stroke="#2563eb" stroke-width="8" opacity="0.4"/>
</svg>`;

// 2. Full Brand Logo SVG (Icon + "TRADE HEAVEN B2B" wordmark)
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" width="800" height="240">
  <!-- Icon Box -->
  <g transform="translate(20, 20)">
    <rect width="200" height="200" rx="44" fill="#0f172a"/>
    <g fill="#ffffff">
      <!-- Letter T -->
      <path d="M 28 48 H 96 V 70 H 72 V 152 H 52 V 70 H 28 Z"/>
      <!-- Letter H -->
      <path d="M 108 48 H 128 V 90 H 156 V 48 H 176 V 152 H 156 V 110 H 128 V 152 H 108 Z"/>
    </g>
    <rect x="4" y="4" width="192" height="192" rx="40" fill="none" stroke="#2563eb" stroke-width="4" opacity="0.5"/>
  </g>

  <!-- Wordmark Text -->
  <text x="250" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="68" fill="#0f172a" letter-spacing="-1.5">
    TRADE <tspan fill="#2563eb">HEAVEN</tspan>
  </text>
  
  <!-- B2B Badge -->
  <rect x="670" y="66" width="68" height="34" rx="8" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="704" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="18" fill="#1d4ed8" text-anchor="middle">
    B2B
  </text>

  <!-- Subtitle -->
  <text x="252" y="158" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="19" fill="#64748b" letter-spacing="3">
    GLOBAL SOURCING &amp; TRADE DIRECTORY
  </text>
</svg>`;

// 3. OpenGraph / Twitter Card SVG (1200x630)
const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <!-- Gradient Background -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="60%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#60a5fa" />
    </linearGradient>
  </defs>
  
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Geometric Grid Accent -->
  <g opacity="0.08" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="200" x2="1200" y2="200"/>
    <line x1="0" y1="300" x2="1200" y2="300"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="500" x2="1200" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Brand Icon -->
  <g transform="translate(100, 160)">
    <rect width="180" height="180" rx="38" fill="#1e293b" stroke="#3b82f6" stroke-width="4"/>
    <g fill="#ffffff">
      <!-- Letter T -->
      <path d="M 25 42 H 86 V 63 H 65 V 138 H 46 V 63 H 25 Z"/>
      <!-- Letter H -->
      <path d="M 97 42 H 115 V 80 H 140 V 42 H 158 V 138 H 140 V 98 H 115 V 138 H 97 Z"/>
    </g>
  </g>

  <!-- Brand Typography -->
  <text x="320" y="245" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="76" fill="#ffffff" letter-spacing="-2">
    TRADE <tspan fill="#60a5fa">HEAVEN</tspan>
  </text>
  
  <rect x="805" y="190" width="80" height="40" rx="10" fill="#2563eb"/>
  <text x="845" y="218" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">
    B2B
  </text>

  <text x="325" y="300" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="24" fill="#94a3b8" letter-spacing="4">
    GLOBAL SOURCING &amp; B2B TRADE MARKETPLACE
  </text>

  <!-- Value Badges -->
  <g transform="translate(100, 420)">
    <rect width="280" height="60" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="140" y="37" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="18" fill="#f8fafc" text-anchor="middle">
      1M+ Verified Importers
    </text>
  </g>
  
  <g transform="translate(410, 420)">
    <rect width="280" height="60" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="140" y="37" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="18" fill="#f8fafc" text-anchor="middle">
      Real-Time RFQ Leads
    </text>
  </g>

  <g transform="translate(720, 420)">
    <rect width="380" height="60" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="190" y="37" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="18" fill="#f8fafc" text-anchor="middle">
      190+ Countries • Trade Assurance
    </text>
  </g>
</svg>`;

async function generateAll() {
  console.log('Generating high-res vectors and Google-compliant icon/logo assets...');
  
  // Save SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullLogoSvg);

  const iconBuffer = Buffer.from(iconSvg);
  const logoBuffer = Buffer.from(fullLogoSvg);
  const ogBuffer = Buffer.from(ogImageSvg);

  // Generate PNG sizes
  // 1. Google Favicon multiples of 48px: 48x48, 96x96, 144x144, 192x192, 512x512
  await sharp(iconBuffer).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  await sharp(iconBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(iconBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon-48x48.png'));
  await sharp(iconBuffer).resize(96, 96).png().toFile(path.join(publicDir, 'favicon-96x96.png'));
  await sharp(iconBuffer).resize(144, 144).png().toFile(path.join(publicDir, 'favicon-144x144.png'));
  await sharp(iconBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'android-chrome-512x512.png'));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'));

  // Also create favicon.ico as a 48x48 PNG (modern browsers and Googlebot handle ICO/PNG format)
  await sharp(iconBuffer).resize(48, 48).toFile(path.join(publicDir, 'favicon.ico'));

  // 2. Full Brand Logo (Square and Horizontal for Schema.org and Google Knowledge Panel)
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'logo.png'));
  await sharp(logoBuffer).resize(800, 240).png().toFile(path.join(publicDir, 'logo-horizontal.png'));

  // 3. OpenGraph / Twitter Banner
  await sharp(ogBuffer).resize(1200, 630).png().toFile(path.join(publicDir, 'og-image.png'));

  // 4. Web App Manifest
  const manifest = {
    name: "Trade Heaven - Global B2B Marketplace",
    short_name: "Trade Heaven",
    description: "International B2B trade marketplace connecting verified manufacturers, suppliers, and global importers.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

  console.log('All Google SEO logo & favicon assets successfully generated!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
