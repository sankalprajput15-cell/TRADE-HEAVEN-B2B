/**
 * Robots.txt Generator for Trade Heaven B2B Global Marketplace
 * Generates an SEO-optimized robots.txt file in the public directory
 * 
 * Objectives:
 * - Explicitly ALLOW bot access to critical marketplace pages (Products, Categories, Suppliers, RFQs, Buy Leads, Public Docs)
 * - Explicitly DISALLOW private admin, internal negotiation rooms, user dashboards, API endpoints, and authentication paths
 * - Optimize crawl budget and prevent crawler traps from query parameters
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SITE_URL || process.env.APP_BASE_URL || 'https://tradeheaven.net';

// Critical public marketplace routes to allow
const ALLOWED_MARKETPLACE_ROUTES = [
  '/',
  '/?view=HOMEPAGE',
  '/?view=PRODUCT_DIRECTORY',
  '/?view=SUPPLIERS_DIRECTORY',
  '/?view=BUYERS_DIRECTORY',
  '/?view=BUY_LEADS',
  '/?view=RFQ_HUB',
  '/?view=POST_SELL_OFFER',
  '/?view=PREMIUM_MEMBERSHIP',
  '/?view=PREMIUM_SERVICES',
  '/?view=ONBOARD_WITH_US',
  '/?view=INCOTERMS_CALCULATOR',
  '/?view=ABOUT_US',
  '/?view=TRUST_SAFETY',
  '/?view=TERMS_OF_USE',
  '/?view=PRIVACY_POLICY',
  '/?view=PRODUCT_LISTING_POLICY',
  '/?view=REFUND_POLICY',
  '/?view=LANDING_PAGE',
  '/products',
  '/products/*',
  '/categories',
  '/categories/*',
  '/suppliers',
  '/suppliers/*',
  '/buyers',
  '/buyers/*',
  '/rfqs',
  '/rfqs/*',
  '/buy-leads',
  '/buy-leads/*',
  '/storefront/*',
  '/catalog/*',
  '/assets/*',
  '/images/*',
  '/*.js',
  '/*.css',
  '/*.png',
  '/*.jpg',
  '/*.jpeg',
  '/*.svg',
  '/*.webp',
  '/*.ico',
  '/*.webmanifest',
  '/sitemap.xml',
  '/robots.txt'
];

// Private, authenticated, and sensitive paths to disallow
const DISALLOWED_PRIVATE_ROUTES = [
  '/admin',
  '/admin/*',
  '/?view=ADMIN_*',
  '/?view=ADMIN_DASHBOARD',
  '/?view=ADMIN_USERS',
  '/?view=ADMIN_DISPUTES',
  '/?view=ADMIN_RFQS',
  '/?view=ADMIN_FEEDS',
  '/?view=ADMIN_REVENUE',
  '/?view=ADMIN_SECURITY_LOGS',
  '/?view=NEGOTIATION_ROOM',
  '/?view=TRADE_ROOM',
  '/?view=USER_DASHBOARD',
  '/?view=MY_ACCOUNT',
  '/?view=SETTINGS',
  '/negotiation',
  '/negotiation/*',
  '/negotiation-room',
  '/negotiation-room/*',
  '/trade-room',
  '/trade-room/*',
  '/chat',
  '/chat/*',
  '/dashboard',
  '/dashboard/*',
  '/user',
  '/user/*',
  '/account',
  '/account/*',
  '/my-account',
  '/my-account/*',
  '/profile/settings',
  '/api',
  '/api/*',
  '/auth',
  '/auth/*',
  '/login',
  '/register',
  '/reset-password',
  '/logout',
  '/escrow',
  '/escrow/*',
  '/payment',
  '/payment/*',
  '/checkout',
  '/checkout/*',
  '/drafts',
  '/drafts/*',
  '/preview',
  '/preview/*',
  '/*?*session_id=',
  '/*?*auth_token=',
  '/*?*access_token=',
  '/*?*redirect='
];

function generateRobotsContent() {
  const timestamp = new Date().toISOString();
  
  let content = `# ==============================================================================
# Trade Heaven B2B Global Sourcing & Exporter Portal - Robots.txt
# Auto-generated: ${timestamp}
# Documentation: https://developers.google.com/search/docs/crawling-indexing/robots/intro
# ==============================================================================

# Universal Crawler Instructions
User-agent: *
`;

  // Disallow private paths
  content += `\n# --- DISALLOW: Private Admin, Internal Chat, User Dashboards & API ---\n`;
  DISALLOWED_PRIVATE_ROUTES.forEach(route => {
    content += `Disallow: ${route}\n`;
  });

  // Explicitly allow critical marketplace paths
  content += `\n# --- ALLOW: Public B2B Marketplace Catalogs, Exporters & Tenders ---\n`;
  ALLOWED_MARKETPLACE_ROUTES.forEach(route => {
    content += `Allow: ${route}\n`;
  });

  // Specific bot configurations for Googlebot & Bingbot
  content += `
# ==============================================================================
# Googlebot Specific Rules (Ensure full rendering access to JS/CSS)
# ==============================================================================
User-agent: Googlebot
Allow: /*.js$
Allow: /*.css$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.webp$
Allow: /*.svg$
Disallow: /admin/
Disallow: /api/
Disallow: /negotiation/
Disallow: /negotiation-room/
Disallow: /dashboard/
Disallow: /account/
Disallow: /auth/

# ==============================================================================
# Bingbot Specific Rules
# ==============================================================================
User-agent: Bingbot
Crawl-delay: 1
Allow: /*.js$
Allow: /*.css$
Disallow: /admin/
Disallow: /api/
Disallow: /negotiation/
Disallow: /negotiation-room/
Disallow: /dashboard/
Disallow: /account/

# ==============================================================================
# Sitemaps Reference
# ==============================================================================
Sitemap: ${BASE_URL}/sitemap.xml
`;

  return content;
}

function writeRobotsTxt() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'robots.txt');
  const content = generateRobotsContent();
  
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`[ROBOTS GENERATOR] Successfully generated robots.txt at ${outputPath}`);
}

writeRobotsTxt();
