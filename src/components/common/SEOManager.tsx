import React from 'react';
import { ActiveView, Product } from '../../types';
import { SEO } from './SEO';

interface SEOManagerProps {
  activeView: ActiveView | string;
  selectedProduct?: Product | null;
  products?: Product[];
}

export const SEOManager: React.FC<SEOManagerProps> = ({ 
  activeView, 
  selectedProduct,
  products 
}) => {
  // 1. Check if a specific product listing page is targeted (either via prop or URL param)
  const targetProduct = selectedProduct || (
    typeof window !== 'undefined' && products ? (
      (() => {
        try {
          const params = new URLSearchParams(window.location.search);
          const pId = params.get('productId') || params.get('product');
          return pId ? products.find(p => p.id === pId) || null : null;
        } catch {
          return null;
        }
      })()
    ) : null
  );

  if (targetProduct) {
    const price = targetProduct.fobPriceUsd || (targetProduct.priceTiers && targetProduct.priceTiers[0]?.priceUsd) || 0;
    const priceDisplay = price > 0 ? `$${price}` : 'Factory Direct';
    const moqDisplay = `${targetProduct.moq || targetProduct.minOrderQuantity || 100} ${targetProduct.moqUnit || 'units'}`;
    const cleanDesc = targetProduct.description 
      ? targetProduct.description.slice(0, 160).trim()
      : `Buy ${targetProduct.title} in bulk directly from verified international factories.`;
    const fullDesc = `${cleanDesc} Verified supplier ${targetProduct.supplierName} (${targetProduct.supplierCountry}). MOQ: ${moqDisplay}. FOB Price: ${priceDisplay}. 100% Escrow Trade Protection on Trade Heaven.`;

    const productOgImage = (targetProduct.images && targetProduct.images.length > 0 && targetProduct.images[0])
      ? targetProduct.images[0]
      : 'https://tradeheaven.net/og-image.png';

    return (
      <SEO
        title={`${targetProduct.title} - Wholesale ${targetProduct.category} | Trade Heaven`}
        description={fullDesc}
        keywords={`${targetProduct.title}, wholesale ${targetProduct.category}, ${targetProduct.subCategory || ''}, buy ${targetProduct.title} in bulk, ${targetProduct.supplierCountry} suppliers, factory direct, B2B trade, Trade Heaven`}
        canonicalUrl={`https://tradeheaven.net/?view=PRODUCT_DIRECTORY&productId=${encodeURIComponent(targetProduct.id)}`}
        ogImage={productOgImage}
        ogType="product"
        productData={{
          price: price > 0 ? price : undefined,
          currency: 'USD',
          availability: targetProduct.inStock !== false ? 'in stock' : 'preorder',
          category: targetProduct.category,
          brand: targetProduct.supplierName,
          seller: targetProduct.supplierName,
          retailerItemId: targetProduct.id,
          condition: 'new',
          moq: targetProduct.moq || targetProduct.minOrderQuantity || 1,
          moqUnit: targetProduct.moqUnit || 'units',
          rating: targetProduct.rating,
          reviewCount: targetProduct.reviewCount,
          countryOfOrigin: targetProduct.supplierCountry
        }}
      />
    );
  }

  // 2. View-specific standard SEO tags
  switch (activeView) {
    case 'HOMEPAGE':
    case 'MARKETPLACE_HOME':
      return <SEO 
        title="Trade Heaven - Global B2B Wholesale Marketplace & Exporter Hub" 
        description="Trade Heaven is the premier global B2B marketplace. Source wholesale products, find verified manufacturers, and securely trade across borders with 100% escrow protection."
      />;
    case 'PRODUCT_DIRECTORY':
      return <SEO 
        title="Global Wholesale Products Directory | Trade Heaven"
        description="Browse thousands of wholesale products from verified international suppliers. Get factory-direct pricing on electronics, apparel, machinery, and more."
        canonicalUrl="https://tradeheaven.net/?view=PRODUCT_DIRECTORY"
      />;
    case 'SUPPLIERS_DIRECTORY':
      return <SEO 
        title="Verified B2B Suppliers & Manufacturers Directory | Trade Heaven"
        description="Find trusted, audited international suppliers and factories. View inspection reports, production capacities, and compliance certifications."
        canonicalUrl="https://tradeheaven.net/?view=SUPPLIERS_DIRECTORY"
      />;
    case 'BUYERS_DIRECTORY':
      return <SEO 
        title="Global Wholesale Buyers Directory | Trade Heaven"
        description="Connect with active international wholesale buyers, importers, and procurement agents looking to source products."
        canonicalUrl="https://tradeheaven.net/?view=BUYERS_DIRECTORY"
      />;
    case 'BUY_LEADS':
    case 'RFQ_HUB':
      return <SEO 
        title="Live B2B Buy Leads & RFQs | Trade Heaven"
        description="Access real-time Request for Quotations (RFQs) and buy leads from active global importers. Quote directly and win international contracts."
        canonicalUrl="https://tradeheaven.net/?view=RFQ_HUB"
      />;
    case 'POST_BUY_REQUIREMENT':
      return <SEO 
        title="Post a Sourcing RFQ | Trade Heaven"
        description="Submit your product sourcing requirements. Reach thousands of verified manufacturers and get competitive factory-direct quotes."
      />;
    case 'POST_SELL_OFFER':
      return <SEO 
        title="Post B2B Cargo Offers | Trade Heaven"
        description="Broadcast your ready-to-ship inventory and cargo offers to thousands of active wholesale buyers globally."
      />;
    case 'INCOTERMS_CALCULATOR':
    case 'TRADE_TOOLS':
      return <SEO 
        title="Incoterms 2020 Calculator & Trade Tools | Trade Heaven"
        description="Calculate international shipping costs, FOB, CIF, EXW pricing, and manage your logistics with our B2B trade calculators."
        canonicalUrl="https://tradeheaven.net/?view=INCOTERMS_CALCULATOR"
      />;
    case 'PREMIUM_SERVICES':
    case 'PREMIUM_MEMBERSHIP':
      return <SEO 
        title="Premium B2B Supplier Memberships | Trade Heaven"
        description="Upgrade your supplier storefront. Get priority ranking, verified badges, and direct access to high-value RFQs."
        canonicalUrl="https://tradeheaven.net/?view=PREMIUM_MEMBERSHIP"
      />;
    case 'ABOUT_US':
      return <SEO 
        title="About Trade Heaven | Global B2B Trade Engine"
        description="Learn how Trade Heaven is digitizing cross-border trade with secure escrow, verified factory audits, and transparent supply chain tools."
        canonicalUrl="https://tradeheaven.net/?view=ABOUT_US"
      />;
    case 'TRUST_SAFETY':
      return <SEO 
        title="Trust & Safety | Escrow Protection | Trade Heaven"
        description="Discover our 100% escrow protection, SGS factory audits, and secure payment rails protecting buyers and sellers in global trade."
        canonicalUrl="https://tradeheaven.net/?view=TRUST_SAFETY"
      />;
    case 'INSIGHTS':
      return <SEO 
        title="Trade Finance & MT700 DLC Risk Insights | Trade Heaven"
        description="Is your cargo truly financeable? Understand MT700 DLC bankability, vessel risk, trade compliance, sanctions screening, and bulk export financing with Trade Heaven."
        canonicalUrl="https://tradeheaven.net/?view=INSIGHTS"
        ogType="article"
      />;
    case 'LANDING_PAGE':
      return <SEO 
        title="Trade Heaven Marketplace"
        description="Join the world's most secure B2B trading platform."
      />;
    case 'PRODUCT_LISTING_POLICY':
      return <SEO 
        title="Product Listing Policy & Prohibited Items | Trade Heaven"
        description="Learn about Trade Heaven's product listing rules, prohibited categories, intellectual property compliance, and zero-tolerance policies."
        canonicalUrl="https://tradeheaven.net/?view=PRODUCT_LISTING_POLICY"
      />;
    case 'PRIVACY_POLICY':
      return <SEO 
        title="Privacy Policy | Tradeheaven ECOM Solution LLP | Trade Heaven"
        description="Review Trade Heaven's privacy policy, data collection terms, B2B account protection, and data subject rights by Tradeheaven ECOM Solution LLP."
        canonicalUrl="https://tradeheaven.net/?view=PRIVACY_POLICY"
      />;
    case 'TERMS_OF_USE':
      return <SEO 
        title="Terms of Use Agreement | Tradeheaven ECOM Solution LLP | Trade Heaven"
        description="Read Trade Heaven's terms of use, membership rights, 60-day refund policy, and trade dispute terms operated by Tradeheaven ECOM Solution LLP."
        canonicalUrl="https://tradeheaven.net/?view=TERMS_OF_USE"
      />;
    case 'REFUND_POLICY':
      return <SEO 
        title="Return & Refund Policy | Trade Protection Guarantee | Trade Heaven"
        description="Review Trade Heaven's refund conditions, milestone payment protections, and SGS dispute mediation terms."
        canonicalUrl="https://tradeheaven.net/?view=REFUND_POLICY"
      />;
    default:
      return <SEO />;
  }
};
