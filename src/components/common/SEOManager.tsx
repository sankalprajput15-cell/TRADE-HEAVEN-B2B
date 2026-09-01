import React from 'react';
import { ActiveView } from '../../types';
import { SEO } from './SEO';

interface SEOManagerProps {
  activeView: ActiveView | string;
}

export const SEOManager: React.FC<SEOManagerProps> = ({ activeView }) => {
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
      />;
    case 'SUPPLIERS_DIRECTORY':
      return <SEO 
        title="Verified B2B Suppliers & Manufacturers Directory | Trade Heaven"
        description="Find trusted, audited international suppliers and factories. View inspection reports, production capacities, and compliance certifications."
      />;
    case 'BUYERS_DIRECTORY':
      return <SEO 
        title="Global Wholesale Buyers Directory | Trade Heaven"
        description="Connect with active international wholesale buyers, importers, and procurement agents looking to source products."
      />;
    case 'BUY_LEADS':
    case 'RFQ_HUB':
      return <SEO 
        title="Live B2B Buy Leads & RFQs | Trade Heaven"
        description="Access real-time Request for Quotations (RFQs) and buy leads from active global importers. Quote directly and win international contracts."
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
      />;
    case 'PREMIUM_SERVICES':
    case 'PREMIUM_MEMBERSHIP':
      return <SEO 
        title="Premium B2B Supplier Memberships | Trade Heaven"
        description="Upgrade your supplier storefront. Get priority ranking, verified badges, and direct access to high-value RFQs."
      />;
    case 'ABOUT_US':
      return <SEO 
        title="About Trade Heaven | Global B2B Trade Engine"
        description="Learn how Trade Heaven is digitizing cross-border trade with secure escrow, verified factory audits, and transparent supply chain tools."
      />;
    case 'TRUST_SAFETY':
      return <SEO 
        title="Trust & Safety | Escrow Protection | Trade Heaven"
        description="Discover our 100% escrow protection, SGS factory audits, and secure payment rails protecting buyers and sellers in global trade."
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
      />;
    case 'PRIVACY_POLICY':
      return <SEO 
        title="Privacy Policy | Tradeheaven ECOM Solution LLP | Trade Heaven"
        description="Review Trade Heaven's privacy policy, data collection terms, B2B account protection, and data subject rights by Tradeheaven ECOM Solution LLP."
      />;
    case 'TERMS_OF_USE':
      return <SEO 
        title="Terms of Use Agreement | Tradeheaven ECOM Solution LLP | Trade Heaven"
        description="Read Trade Heaven's terms of use, membership rights, 60-day refund policy, and trade dispute terms operated by Tradeheaven ECOM Solution LLP."
      />;
    case 'REFUND_POLICY':
      return <SEO 
        title="Return & Refund Policy | Trade Protection Guarantee | Trade Heaven"
        description="Review Trade Heaven's refund conditions, milestone payment protections, and SGS dispute mediation terms."
      />;
    default:
      return <SEO />;
  }
};
