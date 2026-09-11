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
        keywords={`${targetProduct.title}, wholesale ${targetProduct.category}, ${targetProduct.subCategory ? `bulk ${targetProduct.subCategory}, ` : ''}${targetProduct.supplierCountry} manufacturers, factory direct ${targetProduct.title}, custom OEM ${targetProduct.title}, buy ${targetProduct.title} in bulk, ${targetProduct.title} supplier MOQ ${targetProduct.moq || 100}, verified ${targetProduct.supplierName}, international B2B sourcing, export container pricing, FOB wholesale rates, Trade Heaven`}
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
        title="Trade Heaven - Global B2B Marketplace | 20+ Years Sourcing & Closing Real Deals Globally" 
        description="Backed by 20+ years of international trade experience, Trade Heaven helps global clients close real multi-million dollar deals with verified manufacturers, live RFQs, and 100% escrow protection."
        keywords="Trade Heaven, TradeHeaven, 20 years experience B2B trade, closing real deals globally, global B2B deal closing, international wholesale platform, verified factory manufacturers, direct factory sourcing, cross border trade portal, buy wholesale direct from factory, international exporter directory, global B2B procurement platform, supply chain sourcing network, escrow protected trade transactions, bulk purchase import export, verified global vendors"
      />;
    case 'PRODUCT_DIRECTORY':
      return <SEO 
        title="Global Wholesale Products Directory | 20+ Years Sourcing | Trade Heaven"
        description="Browse thousands of wholesale products from verified international suppliers. Backed by 20+ years market experience helping clients close real factory-direct deals."
        keywords="wholesale product catalog, bulk industrial supplies, factory direct products, 20 years trade experience, closing real deals globally, B2B wholesale marketplace, manufacturing inventory, wholesale electronics suppliers, industrial machinery exporters, chemical suppliers direct, raw materials wholesale, OEM ODM private label products, container load wholesale pricing, minimum order quantity MOQ sourcing, direct from manufacturer, bulk commercial supplies, Trade Heaven"
        canonicalUrl="https://tradeheaven.net/?view=PRODUCT_DIRECTORY"
      />;
    case 'SUPPLIERS_DIRECTORY':
      return <SEO 
        title="Verified B2B Suppliers & Manufacturers Directory | Real Deal Execution | Trade Heaven"
        description="Find trusted, audited international suppliers and factories. Backed by 20+ years of trade experience in closing real cross-border manufacturing deals."
        keywords="verified global suppliers, international manufacturer directory, audited factory exporters, 20 years trade experience, closing real deals globally, ISO certified manufacturers, OEM ODM custom manufacturing partners, top exporters directory, verified Chinese manufacturers, Indian export suppliers, European wholesale factories, verified African suppliers, North American manufacturing partners, factory audit reports, wholesale supplier directory, Trade Heaven"
        canonicalUrl="https://tradeheaven.net/?view=SUPPLIERS_DIRECTORY"
      />;
    case 'BUYERS_DIRECTORY':
      return <SEO 
        title="Global Wholesale Buyers Directory | Enterprise Deals | Trade Heaven"
        description="Connect with active international wholesale buyers, importers, and procurement agents looking to source products and close real high-volume deals."
        keywords="international importers directory, verified wholesale buyers, global procurement officers, corporate purchasing agents, closing real deals globally, 20 years B2B experience, vetted trade importers, commodity buyers list, retail chain sourcing buyers, distributor network directory, international purchasing consortiums, high volume procurement leads, verified trade buyers, Trade Heaven"
        canonicalUrl="https://tradeheaven.net/?view=BUYERS_DIRECTORY"
      />;
    case 'BUY_LEADS':
    case 'RFQ_HUB':
      return <SEO 
        title="Live B2B Buy Leads & RFQs | Close Real Multi-Million Deals | Trade Heaven"
        description="Access real-time Request for Quotations (RFQs) and buy leads from active global importers. Quote directly and win real international contracts backed by 20+ years of deal-closing experience."
        keywords="live B2B RFQs, request for quotation tenders, active manufacturing tenders, global procurement tenders, closing real deals globally, 20 years trade experience, wholesale buy leads, international sourcing requests, bulk buyer inquiries, contract manufacturing RFQ, government and enterprise trade tenders, supplier quote submissions, industrial supply RFQ, commercial procurement bids, Trade Heaven RFQ hub"
        canonicalUrl="https://tradeheaven.net/?view=RFQ_HUB"
      />;
    case 'POST_BUY_REQUIREMENT':
      return <SEO 
        title="Post a Sourcing RFQ | Close Real Deals with Verified Factories | Trade Heaven"
        description="Submit your product sourcing requirements. Reach thousands of verified manufacturers with 20+ years of trade facilitation support to close real deals."
        keywords="post buy requirement, submit B2B sourcing request, create RFQ for manufacturers, request factory quotes, custom manufacturing quotes, closing real deals globally, find suppliers for my product, bulk procurement request, private label OEM inquiry, free RFQ submission, reverse auction sourcing, factory price discovery, Trade Heaven"
      />;
    case 'POST_SELL_OFFER':
      return <SEO 
        title="Post B2B Cargo Offers | Connect with Global Buyers | Trade Heaven"
        description="Broadcast your ready-to-ship inventory and cargo offers to thousands of active wholesale buyers globally to close real deals."
        keywords="post sell offer, list wholesale products, export products online, B2B product listing portal, find international buyers for my products, factory excess inventory sale, bulk stocklot offers, direct manufacturer catalog publishing, wholesale supply broadcasting, global trade leads, Trade Heaven"
      />;
    case 'INCOTERMS_CALCULATOR':
    case 'TRADE_TOOLS':
      return <SEO 
        title="Incoterms 2020 Calculator & Trade Tools | Trade Heaven"
        description="Calculate international shipping costs, FOB, CIF, EXW pricing, and manage your logistics with our B2B trade calculators backed by 20+ years of logistics expertise."
        keywords="Incoterms 2020 calculator, FOB vs CIF freight calculator, EXW DDP cost estimator, international shipping risk transfer, ocean freight cost calculator, air cargo tariff estimator, customs duty and freight estimator, landed cost calculation tool, container shipping volume calculator, port to port logistics estimator, Trade Heaven trade tools"
        canonicalUrl="https://tradeheaven.net/?view=INCOTERMS_CALCULATOR"
      />;
    case 'PREMIUM_SERVICES':
    case 'PREMIUM_MEMBERSHIP':
      return <SEO 
        title="Premium B2B Supplier Memberships | Priority Deal Access | Trade Heaven"
        description="Upgrade your supplier storefront. Get priority ranking, verified badges, and direct access to high-value RFQs and real enterprise deal closures."
        keywords="B2B premium supplier membership, verified exporter badge, priority RFQ access, top search ranking for manufacturers, global buyer contact reveals, trade matchmaking services, export marketing packages, verified trust seal certification, VIP supplier portal, high conversion B2B storefront, Trade Heaven Pro"
        canonicalUrl="https://tradeheaven.net/?view=PREMIUM_MEMBERSHIP"
      />;
    case 'ABOUT_US':
      return <SEO 
        title="About Trade Heaven | 20+ Years Global B2B Trade & Real Deal Execution"
        description="Discover how Trade Heaven leverages 20+ years of international trade experience to help clients worldwide close real multi-million dollar deals with verified manufacturers and escrow security."
        keywords="about Trade Heaven, 20 years experience B2B trade, closing real deals globally, Tradeheaven ECOM Solution LLP, global trade facilitation platform, international B2B mission, cross-border commerce vision, world trade network, trusted B2B trade marketplace, international export ecosystem"
        canonicalUrl="https://tradeheaven.net/?view=ABOUT_US"
      />;
    case 'TRUST_SAFETY':
      return <SEO 
        title="Trust & Safety | 20+ Years Escrow Protection | Trade Heaven"
        description="Discover our 100% escrow protection, SGS factory audits, and secure payment rails protecting buyers and sellers in closing real global deals."
        keywords="B2B escrow protection, secure cross border payments, factory audit verification, fraud prevention in international trade, dispute resolution for exporters, supplier credit background check, trade assurance guarantee, secure letter of credit handling, cargo inspection SGS compliance, safe international trade, closing real deals globally, Trade Heaven trust safety"
        canonicalUrl="https://tradeheaven.net/?view=TRUST_SAFETY"
      />;
    case 'INSIGHTS':
      return <SEO 
        title="Trade Finance & MT700 DLC Risk Insights | Trade Heaven"
        description="Is your cargo truly financeable? Understand MT700 DLC bankability, vessel risk, trade compliance, sanctions screening, and bulk export financing with Trade Heaven."
        keywords="Trade Finance MT700, Letter of Credit DLC bankable, cargo financing risk, bulk export transaction compliance, vessel sanctions screening, OFAC maritime compliance, bill of lading discrepancies, UCP 600 banking rules, trade risk mitigation, shipping document compliance, cargo financibility, international trade execution platform, Trade Heaven insights"
        canonicalUrl="https://tradeheaven.net/?view=INSIGHTS"
        ogType="article"
      />;
    case 'LANDING_PAGE':
      return <SEO 
        title="Trade Heaven Marketplace"
        description="Join the world's most secure B2B trading platform."
        keywords="Trade Heaven, B2B wholesale marketplace, verified factories, international procurement, factory direct inventory, trade assurance, global B2B exporters"
      />;
    case 'PRODUCT_LISTING_POLICY':
      return <SEO 
        title="Product Listing Policy & Prohibited Items | Trade Heaven"
        description="Learn about Trade Heaven's product listing rules, prohibited categories, intellectual property compliance, and zero-tolerance policies."
        keywords="product listing policy, prohibited B2B items, export compliance guidelines, restricted trade commodities, intellectual property rights IPR protection, anti-counterfeit policy, trade sanctions screening rules, Trade Heaven"
        canonicalUrl="https://tradeheaven.net/?view=PRODUCT_LISTING_POLICY"
      />;
    case 'PRIVACY_POLICY':
      return <SEO 
        title="Privacy Policy | Tradeheaven ECOM Solution LLP | Trade Heaven"
        description="Review Trade Heaven's privacy policy, data collection terms, B2B account protection, and data subject rights by Tradeheaven ECOM Solution LLP."
        keywords="Trade Heaven privacy policy, Tradeheaven ECOM Solution LLP data protection, B2B corporate privacy, GDPR data subject rights, international business data security, secure user authentication, trade confidentiality"
        canonicalUrl="https://tradeheaven.net/?view=PRIVACY_POLICY"
      />;
    case 'TERMS_OF_USE':
      return <SEO 
        title="Terms of Use Agreement | Tradeheaven ECOM Solution LLP | Trade Heaven"
        description="Read Trade Heaven's terms of use, membership rights, investigation-based refund policy, and trade dispute terms operated by Tradeheaven ECOM Solution LLP."
        keywords="Trade Heaven terms of use, B2B user agreement, membership rights, trade dispute mediation, commercial trade platform terms, Tradeheaven ECOM Solution LLP contract terms"
        canonicalUrl="https://tradeheaven.net/?view=TERMS_OF_USE"
      />;
    case 'REFUND_POLICY':
      return <SEO 
        title="Return & Refund Policy | Investigation & Dispute Terms | Trade Heaven"
        description="Review Trade Heaven's investigation-based refund conditions, service continuation terms, and dispute mediation rules."
        keywords="Trade Heaven refund policy, escrow dispute resolution terms, supplier cancellation policy, investigation-based refund conditions, inspection failure claims, trade assurance refund terms"
        canonicalUrl="https://tradeheaven.net/?view=REFUND_POLICY"
      />;
    default:
      return <SEO />;
  }
};
