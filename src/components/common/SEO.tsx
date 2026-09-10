import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../context/LanguageContext';
import { getAutoAltText, generateProductAlt, generateLogoAlt } from '../../utils/imageSeo';

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
  ogImageAlt?: string;
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
  ogImageAlt,
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

  // Automatically compute rich, accessible alt text for social graph images
  const resolvedImageAlt = ogImageAlt || (
    ogType === 'product' && productData
      ? generateProductAlt(title, {
          category: productData.category,
          supplierName: productData.seller || productData.brand,
          origin: productData.countryOfOrigin
        })
      : generateLogoAlt('Trade Heaven')
  );
    
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

  // Construct comprehensive structured data schema
  const officialSocials = [
    "https://www.linkedin.com/in/trade-heaven-957bb633a/",
    "https://www.youtube.com/@tradeheaven-ce1eo",
    "https://www.instagram.com/tradeheavenb2b/",
    "https://www.facebook.com/profile.php?id=61569916454663",
    "https://twitter.com/tradeheaven",
    "https://wa.me/918532934479"
  ];

  const baseOrganizationSchema = {
    "@type": "Organization",
    "@id": "https://tradeheaven.net/#organization",
    "name": "Trade Heaven",
    "alternateName": ["TradeHeaven", "Trade Heaven B2B", "tradeheaven.net"],
    "url": "https://tradeheaven.net",
    "logo": "https://tradeheaven.net/logo.png",
    "image": "https://tradeheaven.net/og-image.png",
    "sameAs": officialSocials,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-85329-34479",
        "contactType": "customer service",
        "areaServed": "Global",
        "availableLanguage": ["English", "Hindi", "Spanish", "Chinese", "Arabic", "French", "German"]
      }
    ]
  };

  const structuredData = jsonLd || (
    ogType === 'product' && productData ? {
      "@context": "https://schema.org/",
      "@graph": [
        baseOrganizationSchema,
        {
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
          },
          ...(productData.rating ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": String(productData.rating),
              "reviewCount": String(productData.reviewCount || 10),
              "bestRating": "5",
              "worstRating": "1"
            }
          } : {})
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Trade Heaven",
              "item": "https://tradeheaven.net"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": productData.category || "Wholesale Products",
              "item": `https://tradeheaven.net/?view=PRODUCT_DIRECTORY`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": title,
              "item": canonicalUrl
            }
          ]
        }
      ]
    } : {
      "@context": "https://schema.org/",
      "@graph": [
        baseOrganizationSchema,
        {
          "@type": "WebSite",
          "@id": "https://tradeheaven.net/#website",
          "url": "https://tradeheaven.net",
          "name": "Trade Heaven",
          "alternateName": "TradeHeaven",
          "publisher": {
            "@id": "https://tradeheaven.net/#organization"
          },
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://tradeheaven.net/?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          ]
        }
      ]
    }
  );

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
      <meta property="og:image:alt" content={resolvedImageAlt} />
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
      <meta name="twitter:image:alt" content={resolvedImageAlt} />

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
