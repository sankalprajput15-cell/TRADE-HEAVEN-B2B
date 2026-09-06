/**
 * B2B Marketplace Image SEO & Accessibility Alt-Text Utility
 * 
 * Automatically generates descriptive, WCAG-compliant, and Google-SEO-optimized
 * 'alt' attributes for products, brand logos, categories, and tenders across the marketplace.
 * 
 * Best Practice Guidelines Followed:
 * 1. WCAG 2.2 Level AA / Section 508 accessibility standards for screen readers.
 * 2. Google Search Central Image SEO best practices (descriptive, keyword-rich, no "image of" / "photo of" filler).
 * 3. B2B wholesale context (includes product title, category, verified exporter/supplier information, FOB/CIF terms).
 */

export interface ProductAltOptions {
  category?: string;
  supplierName?: string;
  origin?: string;
  index?: number;
  total?: number;
  isThumbnail?: boolean;
  modelNumber?: string;
  moq?: string;
}

export interface LogoAltOptions {
  type?: 'platform' | 'supplier' | 'buyer' | 'partner' | 'avatar';
  country?: string;
  verificationBadge?: string;
}

/**
 * Cleans raw input strings by trimming, stripping file extensions,
 * removing redundant "image of" prefixes, and normalizing whitespace.
 */
export function sanitizeImageLabel(rawText?: string | null): string {
  if (!rawText || typeof rawText !== 'string') return '';
  
  let cleaned = rawText.trim();
  
  // Strip file extensions like .png, .jpg, .webp
  cleaned = cleaned.replace(/\.(png|jpg|jpeg|webp|svg|gif|avif)$/i, '');
  
  // Remove redundant screen-reader clichés (e.g., "Image of", "Photo of", "Picture of", "Screenshot of")
  cleaned = cleaned.replace(/^(image|photo|picture|icon|screenshot|thumbnail)\s+(of|for|about)\s+/i, '');
  cleaned = cleaned.replace(/\s+(image|photo|pic|screenshot|thumb)$/i, '');

  // Strip generic placeholders like "[object Object]", "undefined", "null"
  if (/^(\[object|undefined|null|none|n\/a)$/i.test(cleaned)) {
    return '';
  }

  // Normalize multiple spaces
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Generates an SEO-rich, descriptive alt text for marketplace products.
 * 
 * Examples:
 * - "Grade A Bituminous Coal 6000 kcal/kg - Wholesale Coal & Minerals Supplier FOB/CIF Direct Export"
 * - "Industrial Hydraulic Excavator 320D - View 2 Detail Specification"
 */
export function generateProductAlt(
  productOrTitle?: string | { title?: string; name?: string; category?: string; supplierName?: string; origin?: string; specs?: string } | null,
  options: ProductAltOptions = {}
): string {
  let title = '';
  let category = options.category;
  let supplierName = options.supplierName;
  const origin = options.origin;

  if (typeof productOrTitle === 'string') {
    title = sanitizeImageLabel(productOrTitle);
  } else if (productOrTitle && typeof productOrTitle === 'object') {
    title = sanitizeImageLabel(productOrTitle.title || productOrTitle.name);
    category = category || productOrTitle.category;
    supplierName = supplierName || productOrTitle.supplierName;
  }

  if (!title) {
    title = category ? `${category} Industrial Wholesale Product` : 'Verified B2B Industrial Wholesale Product';
  }

  // Handle multi-image carousel or thumbnail index
  let detailSuffix = '';
  if (options.isThumbnail) {
    detailSuffix = options.index !== undefined 
      ? ` - View ${options.index + 1} Specification Thumbnail` 
      : ' - Gallery Thumbnail';
  } else if (options.index !== undefined && options.total && options.total > 1) {
    detailSuffix = ` - Photo ${options.index + 1} of ${options.total}`;
  }

  // Build high-relevance B2B context
  const parts: string[] = [title + detailSuffix];

  if (category && !title.toLowerCase().includes(category.toLowerCase())) {
    parts.push(`Wholesale ${category}`);
  }

  if (supplierName && !title.toLowerCase().includes(supplierName.toLowerCase())) {
    parts.push(`Supplied by ${supplierName}`);
  }

  if (origin) {
    parts.push(`Origin: ${origin}`);
  }

  // Append standard wholesale trade tag if concise
  if (parts.length === 1) {
    parts.push('Direct Factory Wholesale FOB/CIF Export');
  }

  return parts.join(' | ');
}

/**
 * Generates descriptive alt text for corporate brand logos and partner emblems.
 * 
 * Examples:
 * - "Trade Heaven - Verified B2B Global Sourcing & Exporter Platform Official Logo"
 * - "Sany Heavy Industries - Audited Global Manufacturer & Exporter Logo"
 */
export function generateLogoAlt(
  companyName?: string | null,
  options: LogoAltOptions = {}
): string {
  const name = sanitizeImageLabel(companyName);
  const type = options.type || 'supplier';

  if (!name || name.toLowerCase().includes('trade heaven') || name.toLowerCase().includes('tradeheaven')) {
    return 'Trade Heaven - Verified B2B Global Sourcing & Exporter Platform Official Logo';
  }

  if (type === 'buyer') {
    const countryContext = options.country ? ` in ${options.country}` : '';
    return `${name} - Verified Global Importer & Buyer Profile${countryContext}`;
  }

  if (type === 'avatar') {
    return `${name} - Verified Trade Member Profile Photo`;
  }

  const countrySuffix = options.country ? ` (${options.country})` : '';
  return `${name}${countrySuffix} - Verified Manufacturer & Global Exporter Official Logo`;
}

/**
 * Generates alt text for category cards, banners, and mega-menu items.
 * 
 * Examples:
 * - "Chemicals & Petrochemicals - Wholesale Suppliers & B2B Manufacturer Catalog"
 */
export function generateCategoryAlt(categoryName?: string | null): string {
  const cat = sanitizeImageLabel(categoryName);
  if (!cat) return 'B2B Wholesale Product Categories & Global Supplier Directory';
  return `${cat} - Wholesale B2B Industrial Suppliers & Factory Catalog`;
}

/**
 * Generates alt text for Buyer RFQ Tenders and Buy Leads.
 */
export function generateRfqAlt(rfqTitle?: string | null, destinationCountry?: string | null): string {
  const title = sanitizeImageLabel(rfqTitle);
  if (!title) return 'Active Global Buyer RFQ Tender & Sourcing Lead';
  const dest = destinationCountry ? ` for Destination Port: ${destinationCountry}` : '';
  return `${title} - Verified Buyer Sourcing Tender${dest}`;
}

/**
 * Universal Alt Text Resolver: Intelligently identifies the image context
 * and returns the best descriptive, accessible, and SEO-optimized alt text.
 */
export function getAutoAltText(params: {
  alt?: string | null;
  title?: string | null;
  name?: string | null;
  category?: string | null;
  supplierName?: string | null;
  type?: 'product' | 'logo' | 'avatar' | 'category' | 'rfq';
  index?: number;
  total?: number;
  isThumbnail?: boolean;
}): string {
  const { alt, title, name, category, supplierName, type = 'product', index, total, isThumbnail } = params;
  
  const primaryText = title || name || alt;

  if (type === 'logo') {
    return generateLogoAlt(primaryText || supplierName, { type: 'supplier' });
  }

  if (type === 'avatar') {
    return generateLogoAlt(primaryText || name, { type: 'avatar' });
  }

  if (type === 'category') {
    return generateCategoryAlt(primaryText || category);
  }

  if (type === 'rfq') {
    return generateRfqAlt(primaryText);
  }

  // Default to product alt generator
  return generateProductAlt(primaryText || 'Industrial Product', {
    category: category || undefined,
    supplierName: supplierName || undefined,
    index,
    total,
    isThumbnail
  });
}
