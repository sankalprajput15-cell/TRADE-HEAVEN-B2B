export interface TierPlanCMS {
  id: string;
  name: string;
  badgeColor: string;
  description: string;
  annualUsd: number;
  monthlyUsd: number;
  dailyQuotes: string;
  catalogListings: string;
  escrowFee: string;
  features: string[];
  popular: boolean;
  cta: string;
}

export interface CreditPackCMS {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  costPerQuote: string;
  popular: boolean;
  description: string;
}

export interface FaqItemCMS {
  q: string;
  a: string;
}

export interface H2HFeatureCMS {
  number: string;
  title: string;
  description: string;
  color: string;
}

export interface TestimonialCMS {
  id: string;
  name: string;
  title: string;
  company: string;
  country: string;
  countryFlag: string;
  avatar: string;
  quote: string;
  rating: number;
  verifiedDealSize: string;
  category: string;
}

export interface TradeSpecialistCMS {
  name: string;
  title: string;
  quote: string;
  avatar: string;
  badge: string;
}

export interface EscrowMilestoneCMS {
  step: string;
  title: string;
  description: string;
  tag: string;
}

export interface CategoryItemCMS {
  id: string;
  name: string;
  description: string;
  iconName: string;
  image: string;
  badge?: string;
  productCount: string;
}

export interface SiteContent {
  brand: {
    siteName: string;
    siteTagline: string;
    logoBadge: string;
    topBarAnnouncement: string;
    supportEmail: string;
    supportPhone: string;
    whatsappNumber: string;
    whatsappUrl: string;
    officeAddress: string;
    escrowBadgeNotice: string;
    countriesNotice: string;
  };
  homepage: {
    announcementTicker: string;
    heroHeadline: string;
    heroHeadlineGradient: string;
    heroSubheadline: string;
    heroTrustEyebrow: string;
    heroBgImage: string;
    searchPlaceholder: string;
    tradeSpecialist: TradeSpecialistCMS;
    bannerImageCol1: string;
    bannerTitleCol1: string;
    bannerDescCol1: string;
    bannerImageCol2: string;
    bannerTitleCol2: string;
    bannerSubtitleCol2: string;
    bannerBadgeCol2: string;
    bannerImageCol3: string;
    bannerTitleCol3: string;
    bannerDescCol3: string;
    verifiedBuyersCount: string;
    verifiedBuyersLabel: string;
    activeSuppliersCount: string;
    activeSuppliersLabel: string;
    supportedCountriesCount: string;
    supportedCountriesLabel: string;
    tradeVolumeGmv: string;
    tradeVolumeGmvLabel: string;
    h2hHeadline: string;
    h2hSubheadline: string;
    h2hPillBadge: string;
    h2hButtonText: string;
    h2hFeatures: H2HFeatureCMS[];
    featuredCategoriesHeading: string;
    featuredCategoriesSubheading: string;
    categoriesList: CategoryItemCMS[];
    flashDealsHeading: string;
    flashDealsSubheading: string;
    testimonialsHeading: string;
    testimonialsSubheading: string;
    testimonials: TestimonialCMS[];
  };
  productsPage: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    badgeText: string;
    ctaBannerTitle: string;
    ctaBannerDesc: string;
    ctaButtonText: string;
  };
  buyLeadsPage: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    badgeText: string;
    urgentNoticeText: string;
    postRfqButtonText: string;
  };
  suppliersPage: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    badgeText: string;
    auditGuaranteeText: string;
  };
  postRfqPage: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    badgeText: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    guaranteeText: string;
  };
  postSellOfferPage: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    badgeText: string;
    sellerNotice: string;
    complianceTip: string;
  };
  premiumPlansPage: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    annualDiscountBadge: string;
    tiers: TierPlanCMS[];
    creditPacks: CreditPackCMS[];
    faqs: FaqItemCMS[];
    vipConsultingHeadline: string;
    vipConsultingDescription: string;
    vipConsultingButtonText: string;
  };
  escrowPolicy: {
    title: string;
    subtitle: string;
    bankRailNotice: string;
    guaranteeNotice: string;
    milestones: EscrowMilestoneCMS[];
    refundTermsSnippet: string;
  };
  clientAdminPage: {
    title: string;
    subtitle: string;
    wireInstructionsNotice: string;
    treasuryGuarantee: string;
  };
  tradeToolsPage: {
    title: string;
    subtitle: string;
    incotermsDesc: string;
    cbmDesc: string;
    piGeneratorDesc: string;
  };
  headerAndFooter: {
    headerEscrowNotice: string;
    headerCountriesNotice: string;
    footerTagline: string;
    footerMission: string;
    footerCopyright: string;
    footerIsoText: string;
    footerSupportEmail: string;
    footerSupportPhone: string;
    footerHeadquarters: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    siteName: "Trade Heaven",
    siteTagline: "Global B2B Marketplace & Verified Exporters Network",
    logoBadge: "VERIFIED TRADE",
    topBarAnnouncement: "Exclusive Deal: 2026 Global Sourcing Expo online passes now active • 0% Trade Protection fee for first $50,000 container orders",
    supportEmail: "support@tradeheaven.net",
    supportPhone: "+1 (800) 555-TRADE / +91 85329 34479",
    whatsappNumber: "+91 85329 34479",
    whatsappUrl: "https://wa.me/918532934479?text=Hello%20Trade%20Heaven,%20I%20am%20inquiring%20about%20verified%20suppliers,%20RFQs,%20and%20B2B%20trade.",
    officeAddress: "Trade Heaven Global HQ, 140 Fenchurch St, London EC3M 6BL, UK & Operations Hub in Mumbai, India",
    escrowBadgeNotice: "100% trade protection & Trade Assurance Protected",
    countriesNotice: "180+ Countries Sourcing"
  },
  homepage: {
    announcementTicker: "Exclusive Deal: 2026 Global Sourcing Expo online passes now active • 0% Trade Protection fee for first $50,000 container orders",
    heroHeadline: "Close Trade Deals With",
    heroHeadlineGradient: "Verified Global Buyers & Bulk RFQs",
    heroSubheadline: "Connect your factory directly with 125,000+ verified international importers, secure instant escrow protection, and scale your export revenue with zero friction.",
    heroTrustEyebrow: "Audited Global Manufacturers • Real-Time FOB & CIF Sourcing • Trade Assurance",
    heroBgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=85",
    searchPlaceholder: "Search 500,000+ products, factory OEM services, CAS numbers, or HS codes...",
    tradeSpecialist: {
      name: "Elena Rostova",
      title: "Global Sourcing Director",
      quote: "Assisting enterprise buyers with verified factory matchmaking & Incoterms CIF logistics.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      badge: "Verified Trade Specialist"
    },
    bannerImageCol1: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    bannerTitleCol1: "Verified Container Sourcing",
    bannerDescCol1: "Direct FOB / CIF container shipments with factory audit guarantee.",
    bannerImageCol2: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80",
    bannerTitleCol2: "2026 Global Sourcing & Manufacturing Expo",
    bannerSubtitleCol2: "Connect directly with 10,000+ verified Asian & European production plants.",
    bannerBadgeCol2: "FEATURED GLOBAL TRADE EVENT",
    bannerImageCol3: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=80",
    bannerTitleCol3: "Gold Exporter Membership",
    bannerDescCol3: "Get 30 daily high-priority quotes and first-page catalog placement.",
    verifiedBuyersCount: "5,200,000+",
    verifiedBuyersLabel: "Verified Importers & Procurement Officers",
    activeSuppliersCount: "480,000+",
    activeSuppliersLabel: "Audited Production Plants & Factories",
    supportedCountriesCount: "184+",
    supportedCountriesLabel: "Active Maritime Export Corridors",
    tradeVolumeGmv: "$142,850,000+",
    tradeVolumeGmvLabel: "trade protection-Protected Container Orders (2025-26)",
    h2hHeadline: "Personalized International Export Management & Matchmaking",
    h2hSubheadline: "Unlike generic directory listings, Trade Heaven provides every enterprise exporter and high-volume buyer with a dedicated International Export Manager (IEM) to coordinate communication, verify contracts, and ensure smooth delivery.",
    h2hPillBadge: "Trade Heaven H2H (Human-to-Human) & IEM Advantage",
    h2hButtonText: "Speak with an IEM Specialist",
    h2hFeatures: [
      {
        number: "01",
        title: "H2H Account Management",
        description: "Dedicated Key Account Managers assist with quote translations, buyer verification, follow-ups, and negotiation support.",
        color: "bg-blue-600"
      },
      {
        number: "02",
        title: "IEM Strategic Advisory",
        description: "Export market intelligence, pricing strategy benchmarked against global trade flows, and regulatory compliance consulting.",
        color: "bg-emerald-600"
      },
      {
        number: "03",
        title: "D2D Direct Sourcing",
        description: "Direct connection to active purchasing agents without middleman markups, ensuring transparent wholesale FOB rates.",
        color: "bg-amber-500"
      },
      {
        number: "04",
        title: "Verified Inspection & trade protection",
        description: "On-site factory audits by SGS/TÜV and secure bank wire custody until verified Bill of Lading (B/L) release.",
        color: "bg-purple-600"
      }
    ],
    featuredCategoriesHeading: "Explore Verified Industrial Sectors & Raw Materials",
    featuredCategoriesSubheading: "Browse over 450+ sub-sectors with direct manufacturer contact and compliance documentation.",
    categoriesList: [
      {
        id: "cat-1",
        name: "Machinery & Industrial Equipment",
        description: "CNC milling machines, packaging lines, hydraulic presses, automation.",
        iconName: "Cpu",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80",
        badge: "Top Sourced",
        productCount: "48,200+ Products"
      },
      {
        id: "cat-2",
        name: "Automotive & Electric Vehicles",
        description: "EV battery cells, charging stations, Tier-1 brake assemblies, alloy wheels.",
        iconName: "Car",
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80",
        badge: "High Growth",
        productCount: "32,900+ Products"
      },
      {
        id: "cat-3",
        name: "Electronics & Semiconductors",
        description: "SMD microcontrollers, OLED display panels, power transformers, sensors.",
        iconName: "Radio",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
        badge: "Verified OEM",
        productCount: "64,100+ Products"
      },
      {
        id: "cat-4",
        name: "Chemicals & Raw Polymers",
        description: "Industrial solvents, HDPE resins, specialty pigments, organic additives.",
        iconName: "FlaskConical",
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80",
        badge: "REACH Compliant",
        productCount: "28,500+ Products"
      },
      {
        id: "cat-5",
        name: "Textiles, Garments & Fabrics",
        description: "Organic cotton yarns, waterproof technical outerwear, silk jacquard.",
        iconName: "Scissors",
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80",
        badge: "OEKO-TEX",
        productCount: "52,400+ Products"
      },
      {
        id: "cat-6",
        name: "Renewable Energy & Solar",
        description: "Tier-1 N-Type TOPCon solar panels, commercial hybrid inverters, BESS.",
        iconName: "Sun",
        image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        badge: "CE / TÜV Certified",
        productCount: "19,800+ Products"
      },
      {
        id: "cat-7",
        name: "Agriculture & Agro Commodities",
        description: "Refined ICUMSA 45 sugar, Non-GMO soy, Robusta coffee, cashew nuts.",
        iconName: "Wheat",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80",
        badge: "Phytosanitary Cert",
        productCount: "41,300+ Products"
      },
      {
        id: "cat-8",
        name: "Medical & Diagnostic Supplies",
        description: "Nitrile examination gloves, hospital ICU patient monitors, surgical drape sets.",
        iconName: "Stethoscope",
        image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
        badge: "FDA 510(k) / CE",
        productCount: "15,700+ Products"
      },
      {
        id: "cat-9",
        name: "Building & Construction Materials",
        description: "Deformed steel rebar, porcelain floor tiles, extruded aluminum profiles.",
        iconName: "Box",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
        badge: "ASTM / ISO",
        productCount: "37,000+ Products"
      }
    ],
    flashDealsHeading: "Limited-Time Factory Direct Flash Deals",
    flashDealsSubheading: "Discounted container lots with ready stock available for immediate maritime shipment.",
    testimonialsHeading: "Verified Importers & Global Trade Case Studies",
    testimonialsSubheading: "See how international purchasing directors and enterprise manufacturers execute multi-million dollar container shipments through Trade Heaven.",
    testimonials: [
      {
        id: "test-1",
        name: "Henrik Lindqvist",
        title: "VP of Global Procurement",
        company: "Nordic Industrial Logistics AB",
        country: "Sweden",
        countryFlag: "🇸🇪",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        quote: "We sourced thirty 40HQ containers of high-purity industrial chemicals through Trade Heaven. The trade protection custody and third-party TÜV pre-shipment inspection gave our board 100% peace of mind.",
        rating: 5,
        verifiedDealSize: "$420,000 CIF Gothenburg",
        category: "Industrial Chemicals"
      },
      {
        id: "test-2",
        name: "Victoria Sterling",
        title: "Chief Supply Chain Officer",
        company: "Apex Solar & Infrastructure UK",
        country: "United Kingdom",
        countryFlag: "🇬🇧",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        quote: "The H2H Key Account Manager assigned to our company coordinated daily with the Shanghai solar factory to streamline our customs proforma invoice and Bill of Lading.",
        rating: 5,
        verifiedDealSize: "$1,850,000 CIF Southampton",
        category: "Renewable Energy"
      },
      {
        id: "test-3",
        name: "Carlos Mendoza",
        title: "Managing Director",
        company: "MexAgro Importers S.A.",
        country: "Mexico",
        countryFlag: "🇲🇽",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        quote: "Zero broker markups and true factory direct pricing. We cut our raw material procurement lead time by 18 days and saved $64,000 on our first quarter orders.",
        rating: 5,
        verifiedDealSize: "$310,000 FOB Santos",
        category: "Agro Commodities"
      }
    ]
  },
  productsPage: {
    title: "Global Wholesale Product Catalog",
    subtitle: "Explore verified industrial machinery, raw chemicals, electronics, textiles, and green energy products directly from audited production facilities.",
    bannerImageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80",
    badgeText: "Factory-Direct Wholesale Catalog",
    ctaBannerTitle: "Looking for Custom Specifications or OEM / ODM?",
    ctaBannerDesc: "Post a tailored Request for Quotation (RFQ) to receive competing proposals from verified manufacturers within 24 hours.",
    ctaButtonText: "Post Buy Requirement (Free)"
  },
  buyLeadsPage: {
    title: "Live Global Buy Leads & Purchasing RFQs",
    subtitle: "Real-time buying tenders broadcasted by verified international procurement managers seeking immediate container shipments.",
    bannerImageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    badgeText: "Real-Time Sourcing Tenders",
    urgentNoticeText: "🔥 24 Urgent Buy Leads Added in the Last 3 Hours from North America & EU Buyers",
    postRfqButtonText: "Post New Sourcing Tender"
  },
  suppliersPage: {
    title: "Audited Global Exporters & Manufacturing Directory",
    subtitle: "Partner with ISO 9001, CE, and SGS audited production facilities across 180+ countries with verified export records.",
    bannerImageUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&auto=format&fit=crop&q=80",
    badgeText: "Vetted Manufacturing Facilities",
    auditGuaranteeText: "Every Gold and VIP supplier on Trade Heaven undergoes rigorous on-site factory verification, corporate registry audits, and financial solvency checks."
  },
  postRfqPage: {
    title: "Post Your Sourcing Requirement (RFQ)",
    subtitle: "Submit your product specifications, target volume, and preferred Incoterm to receive competitive quotes from verified global manufacturers.",
    bannerImageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
    badgeText: "Zero Broker Fee Sourcing",
    step1Title: "1. Specify Product & Quantity",
    step2Title: "2. Delivery & Incoterms Requirements",
    step3Title: "3. Buyer Credentials & Submission",
    guaranteeText: "100% Buyer Privacy Guarantee: Your personal contact information is protected until you choose to accept a supplier's quote."
  },
  postSellOfferPage: {
    title: "Post a Wholesale Product / Sell Offer",
    subtitle: "List your manufactured goods and container lots in Trade Heaven's global B2B directory to receive direct RFQ inquiries.",
    bannerImageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80",
    badgeText: "Global Exporter Listing Suite",
    sellerNotice: "High-resolution product imagery, exact HS codes, and verified compliance certifications result in 4x higher buyer inquiry rates.",
    complianceTip: "Ensure your FOB / CIF price ranges and minimum order quantities (MOQ) accurately reflect current production capacity."
  },
  premiumPlansPage: {
    title: "Trade Heaven Exporter Membership & Growth Plans",
    subtitle: "Accelerate your international trade revenue with high-priority buy lead quotes, dedicated Account Managers, and premier catalog positioning.",
    bannerImageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
    annualDiscountBadge: "Save 20% with Annual B2B Exporter Billing",
    tiers: [],
    creditPacks: [],
    faqs: [
      {
        q: "What is the difference between Free and Gold Exporter membership?",
        a: "Gold Verified Suppliers receive a verified audit badge, 30 daily high-priority quotes (compared to 3), instant WhatsApp buy lead notifications, top category rankings, and a dedicated bilingual Key Account Manager."
      },
      {
        q: "How does the Trade Heaven Trade Protection Certificate work?",
        a: "The buyer deposits invoice funds directly into a secure custodial trade protection account. The funds are only released to the supplier once SGS/Bureau Veritas inspects the cargo and verifies the ocean Bill of Lading (B/L)."
      },
      {
        q: "Can I pay via international bank wire (T/T)?",
        a: "Yes! We accept international wire transfers in USD, EUR, GBP, AED, and SGD. Official proforma invoices with SWIFT/IBAN details are generated automatically in the Client Admin portal."
      }
    ],
    vipConsultingHeadline: "Need Custom Enterprise Sourcing or Government Tender Support?",
    vipConsultingDescription: "Our International Export Management (IEM) team provides bespoke contract structuring, letters of credit (L/C), and international logistics oversight.",
    vipConsultingButtonText: "Schedule VIP Consultation"
  },
  escrowPolicy: {
    title: "100% Trade Assurance & Custodial trade protection Protection",
    subtitle: "Every cross-border transaction is safeguarded by strict multi-stage custodial protocols, third-party SGS factory inspections, and ocean Bill of Lading verification.",
    bankRailNotice: "Funds deposited in segregated institutional custodial bank accounts cleared by State Bank Of India.",
    guaranteeNotice: "100% Refund Guarantee if products fail verified third-party laboratory specifications or if shipping containers fail to dispatch by agreed contractual deadline.",
    milestones: [
      {
        step: "01",
        title: "Proforma Invoice & Trade Protection Deposit",
        description: "Buyer and supplier finalize Incoterms FOB/CIF contract. Buyer locks deposit in Trade Heaven custodial trade protection",
        tag: "Funds Safeguarded"
      },
      {
        step: "02",
        title: "Manufacturing & SGS Inspection",
        description: "Supplier proceeds with production. Certified independent inspectors (SGS, TÜV, BV) test cargo against agreed specs.",
        tag: "On-site Verification"
      },
      {
        step: "03",
        title: "Container Loading & Bill of Lading",
        description: "Container sealed at port of origin. Master ocean Bill of Lading (B/L) issued and uploaded to platform.",
        tag: "Transit Locked"
      },
      {
        step: "04",
        title: "Customs Clearance & Funds Release",
        description: "Buyer confirms container arrival and receipt of commercial documents. trade protection automatically releases balance to supplier.",
        tag: "Final Settlement"
      }
    ],
    refundTermsSnippet: "In the event of contractual non-performance or shipment cancellation before container lading, 100% of trade protection principal is remitted back to buyer within 48 banking hours."
  },
  clientAdminPage: {
    title: "Client Billing & Treasury Operations",
    subtitle: "Manage platform subscription tiers, review wire transfer payments, download official tax invoices, and configure banking details.",
    wireInstructionsNotice: "The Bank Transfer Instructions are as follows: Beneficiary Account Name - TRADEHEAVEN ECOM SOLUTION LLP | A/c No: 44153189222 | A/c type: Current account Bank Account | Bank Name - State Bank Of India | Branch Name & Address - State Bank of India NTPC dibiyapur auraiya, Uttar Pradesh, 206244 | SWIFT CODE: SBININBB124 | IFSC Code: SBIN0010346",
    treasuryGuarantee: "Enterprise Banking Rail protected by State Bank Of India."
  },
  tradeToolsPage: {
    title: "Global Trade Intelligence & Calculation Tools",
    subtitle: "Calculate Incoterms 2020 cost breakdowns, container volumetric CBM capacity, and generate automated Proforma Invoices (P/I).",
    incotermsDesc: "Instant liability, insurance, and freight cost mapping between EXW, FOB, CFR, CIF, and DDP.",
    cbmDesc: "Accurately calculate how many pallets and master cartons fit inside standard 20GP, 40GP, and 40HQ maritime containers.",
    piGeneratorDesc: "Generate export-ready proforma invoices compliant with international trade law."
  },
  headerAndFooter: {
    headerEscrowNotice: "100% trade protection & Trade Assurance Protected",
    headerCountriesNotice: "180+ Countries Sourcing",
    footerTagline: "Trade Heaven is an international B2B marketplace and export portal connecting verified global buyers with vetted manufacturing plants across 180+ countries.",
    footerMission: "Empowering transparent global trade through verified manufacturer audits, dedicated Key Account Managers, and bank trade protection protections.",
    footerCopyright: "© 2025–2026 Trade Heaven Inc. All rights reserved.",
    footerIsoText: "ISO 27001 & GDPR Compliant Enterprise",
    footerSupportEmail: "support@tradeheaven.net",
    footerSupportPhone: "+1 (800) 555-TRADE / +91 85329 34479",
    footerHeadquarters: "Trade Heaven Global HQ, 140 Fenchurch St, London, UK & Operations Hub in Mumbai, India"
  }
};
