import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../context/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Trade Heaven - Global B2B Wholesale Marketplace & Exporter Hub',
  description = 'Trade Heaven is the premier global B2B marketplace. Source wholesale products, find verified manufacturers, and securely trade across borders with 100% escrow protection.',
  keywords = 'B2B marketplace, wholesale sourcing, manufacturers, global trade, import export, Trade Heaven, RFQ, escrow protection',
  canonicalUrl = 'https://tradeheaven.net',
  ogImage = 'https://tradeheaven.net/og-image.png',
  ogType = 'website'
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
      <meta property="og:site_name" content={siteName} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Alternate Language Links for SEO (Hreflang) */}
      <link rel="alternate" hrefLang="en" href={buildLangUrl('en')} />
      <link rel="alternate" hrefLang="zh-CN" href={buildLangUrl('zh')} />
      <link rel="alternate" hrefLang="es" href={buildLangUrl('es')} />
      <link rel="alternate" hrefLang="ar" href={buildLangUrl('ar')} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
    </Helmet>
  );
};
