import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../context/LanguageContext';

export interface ProductSeoData {
  price?: number | string;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder' | string;
  category?: string;
  brand?: string;
  retailerItemId?: string;
  condition?: string;
  moq?: number | string;
  moqUnit?: string;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  countryOfOrigin?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  productData?: ProductSeoData;
  jsonLd?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Trade Heaven - Global B2B Wholesale Marketplace & Exporter Hub',
  description = 'Trade Heaven is the premier global B2B marketplace. Source wholesale products, find verified manufacturers, and securely trade across borders with 100% escrow protection.',
  keywords = 'B2B marketplace, wholesale sourcing, manufacturers, global trade, import export, Trade Heaven, RFQ, escrow protection',
  canonicalUrl = 'https://tradeheaven.net',
  ogImage = 'https://tradeheaven.net/og-image.png',
  ogType = 'website',
  productData,
  jsonLd
}) => {
  const { languageCode } = useLanguage();
  
  // Create full title based on whether a specific page title was provided
  const siteName = 'Trade Heaven';
  const fullTitle = title === siteName || title.includes(siteName) 
    ? title 
    : `${title} | ${siteName}`;
    
  // Helper to append query params to base URL safely
  const buildLangUrl = (lang: string) => {
    try {
      const url = new URL(canonicalUrl);
      url.searchParams.set('lang', lang);
      return url.toString();
    } catch {
      return `${canonicalUrl}?lang=${lang}`;
    }
  };

  // Construct structured data schema if not provided
  const structuredData = jsonLd || (ogType === 'product' && productData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": title,
    "image": [ogImage],
    "description": description,
    "sku": productData.retailerItemId || undefined,
    "category": productData.category || undefined,
    "brand": {
      "@type": "Brand",
      "name": productData.brand || productData.seller || "Trade Heaven"
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": productData.currency || "USD",
      "price": String(productData.price || "0.00"),
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": productData.availability === 'out of stock' ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": productData.seller || "Trade Heaven Verified Supplier"
      }
    }
  } : null);

  return (
    <Helmet htmlAttributes={{ lang: languageCode }}>
      {/* Basic HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Product-Specific OpenGraph Tags */}
      {ogType === 'product' && productData && (
        <>
          <meta property="product:price:amount" content={String(productData.price ?? '')} />
          <meta property="product:price:currency" content={productData.currency || 'USD'} />
          <meta property="og:price:amount" content={String(productData.price ?? '')} />
          <meta property="og:price:currency" content={productData.currency || 'USD'} />
          <meta property="product:availability" content={productData.availability || 'in stock'} />
          <meta property="product:condition" content={productData.condition || 'new'} />
          {productData.retailerItemId && (
            <meta property="product:retailer_item_id" content={productData.retailerItemId} />
          )}
          {productData.category && (
            <meta property="product:category" content={productData.category} />
          )}
          {productData.brand && (
            <meta property="product:brand" content={productData.brand} />
          )}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Product-Specific Twitter Data Chips */}
      {ogType === 'product' && productData && (
        <>
          <meta name="twitter:label1" content="Price" />
          <meta name="twitter:data1" content={productData.price ? `$${productData.price} ${productData.currency || 'USD'}` : 'Contact Supplier'} />
          <meta name="twitter:label2" content="Minimum Order" />
          <meta name="twitter:data2" content={productData.moq ? `${productData.moq} ${productData.moqUnit || 'units'}` : 'Flexible MOQ'} />
        </>
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Alternate Language Links for SEO (Hreflang) */}
      <link rel="alternate" hrefLang="en" href={buildLangUrl('en')} />
      <link rel="alternate" hrefLang="zh-CN" href={buildLangUrl('zh')} />
      <link rel="alternate" hrefLang="es" href={buildLangUrl('es')} />
      <link rel="alternate" hrefLang="ar" href={buildLangUrl('ar')} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
