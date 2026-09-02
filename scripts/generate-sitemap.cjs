const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://tradeheaven.net';

// The list of indexable views based on activeView in App.tsx
const activeViews = [
  { view: 'HOMEPAGE', priority: '1.0' },
  { view: 'PRODUCT_DIRECTORY', priority: '0.9' },
  { view: 'SUPPLIERS_DIRECTORY', priority: '0.9' },
  { view: 'BUYERS_DIRECTORY', priority: '0.9' },
  { view: 'BUY_LEADS', priority: '0.9' },
  { view: 'RFQ_HUB', priority: '0.9' },
  { view: 'POST_SELL_OFFER', priority: '0.8' },
  { view: 'PREMIUM_MEMBERSHIP', priority: '0.8' },
  { view: 'PREMIUM_SERVICES', priority: '0.8' },
  { view: 'ONBOARD_WITH_US', priority: '0.8' },
  { view: 'INCOTERMS_CALCULATOR', priority: '0.7' },
  { view: 'ABOUT_US', priority: '0.8' },
  { view: 'TRUST_SAFETY', priority: '0.8' },
  { view: 'TERMS_OF_USE', priority: '0.6' },
  { view: 'PRIVACY_POLICY', priority: '0.6' },
  { view: 'PRODUCT_LISTING_POLICY', priority: '0.6' },
  { view: 'REFUND_POLICY', priority: '0.6' },
  { view: 'LANDING_PAGE', priority: '0.7' },
];

function generateSitemap() {
  const date = new Date().toISOString().split('T')[0];

  const urls = activeViews.map(({ view, priority }) => {
    // HOMEPAGE maps to the root URL
    const loc = view === 'HOMEPAGE' ? BASE_URL : `${BASE_URL}/?view=${view}`;
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const outputPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent, 'utf8');

  console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap();
