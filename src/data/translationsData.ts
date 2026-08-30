import { LanguageCode } from '../context/LanguageContext';

export interface Translations {
  buyerSourcingHub: string;
  buyLeadsNav: string;
  postBuyRequirement: string;
  fullSupplierDirectory: string;
  rfqHubNav: string;
  incotermsNav: string;
  suppliersExportersHub: string;
  workWithUsNav: string;
  postCargoOffer: string;
  membershipPlans: string;
  exporterDashboard: string;
  landingPageNav: string;
  helpDeskHeading: string;
  featuredProducts: string;
  auditedSuppliersHeading: string;
  exploreAllSuppliers: string;
  factorySize: string;
  viewFactoryAudit: string;
  recentBuyLeads: string;
  viewAllRfqs: string;
  // Navigation & General
  brandTagline: string;
  sourceProducts: string;
  sellGlobally: string;
  postRfq: string;
  postBuyRfq: string;
  searchPlaceholder: string;
  allCategories: string;
  verifiedSuppliers: string;
  activeBuyers: string;
  globalPorts: string;
  tradeProtection: string;
  freeQuote: string;
  exploreCatalog: string;
  home: string;
  aboutUs: string;
  trustSafety: string;
  newsInsights: string;
  premiumServices: string;
  buyers: string;
  suppliers: string;
  menu: string;
  signIn: string;
  registerFree: string;
  signOut: string;
  tradeAssurance: string;

  // Landing Page & Hero Section
  heroBadge: string;
  heroTitle1: string;
  heroTitleGradient: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroSearchBtn: string;
  heroCategoryAll: string;
  searchProductsTab: string;
  searchSuppliersTab: string;
  searchRfqsTab: string;
  searchToolsTab: string;
  searchOmniPlaceholder: string;
  searchRfqPlaceholder: string;
  searchSupplierPlaceholder: string;
  findDeals: string;
  verifiedSectors: string;
  liveMatches: string;
  popularSearches: string;

  // Key Features / Value Prop
  featuresTitle: string;
  featuresSubtitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;

  // Sourcing Corridor
  corridorTitle: string;
  corridorSubtitle: string;
  corridorViewDetails: string;
  corridorStatLabel: string;
  corridorTopCommodities: string;

  // Interactive RFQ Stepper
  rfqStep1Title: string;
  rfqStep2Title: string;
  rfqStep3Title: string;
  rfqProductNameLabel: string;
  rfqQuantityLabel: string;
  rfqCategoryLabel: string;
  rfqIncotermLabel: string;
  rfqDestinationLabel: string;
  rfqSpecsLabel: string;
  rfqCompanyLabel: string;
  rfqContactLabel: string;
  rfqEmailLabel: string;
  rfqPhoneLabel: string;
  rfqNextBtn: string;
  rfqSubmitBtn: string;
  rfqSuccessTitle: string;
  rfqSuccessSubtitle: string;
  rfqResetBtn: string;

  // Stats Bar
  statsVolume: string;
  statsVolumeLabel: string;
  statsSuppliers: string;
  statsSuppliersLabel: string;
  statsCountries: string;
  statsCountriesLabel: string;
  statsSpeed: string;
  statsSpeedLabel: string;

  // Categories Section
  categoriesHeading: string;
  categoriesSubheading: string;
  catAgri: string;
  catApparel: string;
  catPpe: string;
  catMachinery: string;
  catFurniture: string;
  catChemicals: string;

  // Products Section
  productsSectionTitle: string;
  productsSectionSubtitle: string;
  viewAllProducts: string;
  contactSupplier: string;
  requestQuotation: string;
  verifiedFactory: string;
  moq: string;
  fobPrice: string;
  inStock: string;

  // Live Trade Feed & Ticker
  liveFeedTitle: string;
  liveFeedSubtitle: string;
  liveTickerBadge: string;
  postedBy: string;
  viewRfqDetails: string;
  submitProposal: string;

  // Customer Reviews
  reviewsTitle: string;
  reviewsSubtitle: string;
  trustScore: string;
  verifiedTrader: string;

  // Footer
  footerAbout: string;
  footerAboutText: string;
  footerSourcing: string;
  footerSuppliers: string;
  footerLegal: string;
  footerNewsletterTitle: string;
  footerNewsletterSubtitle: string;
  footerSubscribeBtn: string;
  footerRights: string;
  escrowGuaranteed: string;

  // Bottom CTA
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonBuyer: string;
  ctaButtonSupplier: string;
}

export const BASE_TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',




















    brandTagline: 'Global B2B Wholesale Marketplace & Trade Escrow',
    sourceProducts: 'Source Products (Buyer)',
    sellGlobally: 'Sell Globally (Supplier)',
    postRfq: 'Post Free RFQ',
    postBuyRfq: 'Post Buy RFQ',
    searchPlaceholder: 'Search commodities, HS codes, factories...',
    allCategories: 'All Categories',
    verifiedSuppliers: 'Verified Suppliers',
    activeBuyers: 'Active Buyers',
    globalPorts: 'Global Ports',
    tradeProtection: 'Custodial Escrow & Quality Inspection',
    freeQuote: 'Get Instant Quotation',
    exploreCatalog: 'Explore Product Catalog',
    home: 'Home',
    aboutUs: 'About Us',
    trustSafety: 'Trust & Safety',
    newsInsights: 'News & Insights',
    premiumServices: 'Premium Services',
    buyers: 'Buyers',
    suppliers: 'Suppliers',
    menu: 'Menu',
    signIn: 'Sign In',
    registerFree: 'Register Free',
    signOut: 'Sign Out',
    tradeAssurance: '100% trade protection & Trade Assurance',

    heroBadge: '180+ Global Ports • 125,000+ Active Wholesale Buyers',
    heroTitle1: 'The Next-Generation',
    heroTitleGradient: 'Global B2B Marketplace',
    heroTitle2: '& Cross-Border Sourcing Platform.',
    heroSubtitle: 'Connecting verified manufacturers, exporters, and wholesale buyers worldwide with direct RFQ broadcasting, transparent FOB/CIF pricing, and custodial trade protection.',
    heroSearchBtn: 'Find Deals',
    heroCategoryAll: 'All Sectors',
    searchProductsTab: 'Products',
    searchSuppliersTab: 'Verified Suppliers',
    searchRfqsTab: 'Live RFQs',
    searchToolsTab: 'Trade Tools',
    searchOmniPlaceholder: 'Search products, materials, factories, RFQs, or Incoterms tools...',
    searchRfqPlaceholder: 'Search 1,200+ active RFQs by product, port, Incoterms, buyer country...',
    searchSupplierPlaceholder: 'Search verified factories, suppliers, certifications, and countries...',
    findDeals: 'Find Wholesale Deals',
    verifiedSectors: 'All Verified Sectors',
    liveMatches: 'matches',
    popularSearches: 'Popular Searches',

    featuresTitle: 'Why Global Exporters & Procurement Desks Choose Trade Heaven',
    featuresSubtitle: 'Engineered for seamless international commerce, verifiable trade credentials, and risk-free payments.',
    feature1Title: 'Verified Tier-1 Exporters',
    feature1Desc: 'All suppliers are vetted with on-site factory audits, ISO/CE certifications, and verifiable export licenses.',
    feature2Title: 'Direct RFQ Broadcasting',
    feature2Desc: 'Submit your wholesale specification once; receive competitive FOB/CIF quotation breakdowns within 2 hours.',
    feature3Title: 'Multi-Currency Escrow',
    feature3Desc: 'Funds are safeguarded in custodial escrow until your bill of lading and third-party SGS inspection are verified.',
    feature4Title: 'Global Trade Corridors',
    feature4Desc: 'Optimized logistic lanes to Port of Los Angeles, Jebel Ali, Hamburg, Nhava Sheva, and Shanghai.',

    corridorTitle: 'Strategic Global Trade Corridors',
    corridorSubtitle: 'Real-time tariff data, monthly volume metrics, and express clearance across key international maritime lanes.',
    corridorViewDetails: 'Explore Port Logistics',
    corridorStatLabel: 'Port Turnaround',
    corridorTopCommodities: 'Top Traded Commodities',

    rfqStep1Title: '1. Product Specifications',
    rfqStep2Title: '2. Shipping & Port Logistics',
    rfqStep3Title: '3. Buyer Contact Details',
    rfqProductNameLabel: 'What product are you sourcing?',
    rfqQuantityLabel: 'Target Quantity & Unit (e.g. 5,000 MT)',
    rfqCategoryLabel: 'Industry Sector',
    rfqIncotermLabel: 'Preferred Incoterm',
    rfqDestinationLabel: 'Destination Port / Country (e.g. Port of Rotterdam)',
    rfqSpecsLabel: 'Technical Specifications & Quality Standards',
    rfqCompanyLabel: 'Company / Business Name',
    rfqContactLabel: 'Contact Person Name',
    rfqEmailLabel: 'Business Email Address',
    rfqPhoneLabel: 'WhatsApp / Phone (with Country Code)',
    rfqNextBtn: 'Continue to Next Step',
    rfqSubmitBtn: 'Broadcast RFQ to 5,000+ Verified Suppliers',
    rfqSuccessTitle: 'RFQ Broadcast Successfully Generated!',
    rfqSuccessSubtitle: 'Your procurement request is now live. Verified tier-1 suppliers will contact your procurement team directly.',
    rfqResetBtn: 'Submit Another Buying Requirement',

    statsVolume: '$4.2 Billion+',
    statsVolumeLabel: 'Facilitated Cross-Border Volume',
    statsSuppliers: '85,000+',
    statsSuppliersLabel: 'Verified Exporting Factories',
    statsCountries: '180+',
    statsCountriesLabel: 'Active Destination Ports',
    statsSpeed: '< 2 Hours',
    statsSpeedLabel: 'Average Supplier Response Time',

    categoriesHeading: 'Top International Procurement Sectors',
    categoriesSubheading: 'Browse verified high-capacity manufacturers and certified exporters across core wholesale industries.',
    catAgri: 'Agriculture & Food Commodities',
    catApparel: 'Textiles, Apparel & Fabrics',
    catPpe: 'Safety, PPE & Medical Equipment',
    catMachinery: 'Industrial Machinery & CNC Spares',
    catFurniture: 'Commercial Furniture & Fixtures',
    catChemicals: 'Petrochemicals & Raw Polymers',

    productsSectionTitle: 'Verified Direct Factory Products & Volume Wholesale',
    productsSectionSubtitle: 'Source directly from audited manufacturing plants with live FOB/CIF tier pricing and guaranteed lead times.',
    viewAllProducts: 'View All Products',
    contactSupplier: 'Contact Supplier',
    requestQuotation: 'Request Instant Quote',
    verifiedFactory: 'Verified Factory',
    moq: 'MOQ',
    fobPrice: 'FOB Price',
    inStock: 'In Stock',

    liveFeedTitle: 'Live Global B2B Trade & RFQ Feed',
    liveFeedSubtitle: 'Real-time wholesale RFQs, verified tender requests, and expedited procurement inquiries broadcasting globally.',
    liveTickerBadge: 'Live Leads',
    postedBy: 'Posted by',
    viewRfqDetails: 'View Details',
    submitProposal: 'Submit Quotation',

    reviewsTitle: 'Trusted by Over 125,000 Verified Importers & Exporters Worldwide',
    reviewsSubtitle: 'Read verified testimonials from international trading houses, procurement officers, and tier-1 manufacturing exporters.',
    trustScore: 'TrustScore 4.9/5.0 across 18,400+ international trades',
    verifiedTrader: 'Verified Global Trader',

    footerAbout: 'About Trade Heaven',
    footerAboutText: 'Trade Heaven is the premier cross-border B2B wholesale marketplace, connecting verified global manufacturers with qualified importers through custodial escrow protection.',
    footerSourcing: 'Sourcing & RFQ Tools',
    footerSuppliers: 'Suppliers & Factories',
    footerLegal: 'Trust, Safety & Legal',
    footerNewsletterTitle: 'Global Trade Intelligence',
    footerNewsletterSubtitle: 'Get weekly commodity price indices, tariff updates, and high-value buying leads delivered directly.',
    footerSubscribeBtn: 'Subscribe Free',
    footerRights: 'All rights reserved. Global trade escrow and authentication verified.',
    escrowGuaranteed: '100% Custodial Escrow & Quality Guaranteed',

    ctaTitle: 'Ready to Expand Your International Wholesale Operations?',
    ctaSubtitle: 'Join over 125,000 procurement officers, global trading houses, and manufacturing exporters trading securely on Trade Heaven.',
    ctaButtonBuyer: 'Post a Free Buying Request',
    ctaButtonSupplier: 'Register as Verified Exporter'
  },

  zh: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',




















    brandTagline: '全球B2B跨境批发贸易平台与托管结算中心',
    sourceProducts: '采购货源 (买家通道)',
    sellGlobally: '全球出海 (供应商入驻)',
    postRfq: '免费发布询价单 (RFQ)',
    postBuyRfq: '发布采购需求',
    searchPlaceholder: '搜索大宗商品、海关HS编码、制造工厂...',
    allCategories: '所有行业品类',
    verifiedSuppliers: '已认证实力工厂',
    activeBuyers: '活跃采购商',
    globalPorts: '全球挂靠港口',
    tradeProtection: '资金托管与第三方SGS验货保障',
    freeQuote: '即时获取报价',
    exploreCatalog: '浏览全球商品目录',
    home: '首页',
    aboutUs: '关于我们',
    trustSafety: '安全信保',
    newsInsights: '行业资讯',
    premiumServices: '尊享服务',
    buyers: '采购买家',
    suppliers: '认证供应商',
    menu: '全站菜单',
    signIn: '登录',
    registerFree: '免费注册',
    signOut: '退出',
    tradeAssurance: '100% 资金托管与信保体系',

    heroBadge: '覆盖全球 180+ 国际枢纽港口 • 125,000+ 活跃国际采购商',
    heroTitle1: '新一代数字化',
    heroTitleGradient: '全球B2B跨境贸易',
    heroTitle2: '与大宗商品源头直采平台',
    heroSubtitle: '连接全球认证生产企业、外贸出口商与国际批发采购商。提供全球RFQ即时广播、透明FOB/CIF离岸到岸比价与第三方资金托管履约保障。',
    heroSearchBtn: '快速寻盘',
    heroCategoryAll: '所有行业品类',
    searchProductsTab: '优质货源',
    searchSuppliersTab: '认证源头工厂',
    searchRfqsTab: '最新买家询盘',
    searchToolsTab: '外贸实用工具',
    searchOmniPlaceholder: '搜索全球商品、原材料、生产厂家、采购询盘或Incoterms工具...',
    searchRfqPlaceholder: '在1,200+条实时采购需求中搜索产品、目的港、贸易术语...',
    searchSupplierPlaceholder: '搜索全球认证实力工厂、出口企业、ISO认证及产地国家...',
    findDeals: '寻找批发商机',
    verifiedSectors: '所有认证产业类别',
    liveMatches: '条匹配结果',
    popularSearches: '热搜采购词',

    featuresTitle: '为什么全球进出口商与跨国采购部首选 Trade Heaven',
    featuresSubtitle: '专为跨境国际贸易打造，具备真实外贸资质核验与零风险履约保障体系。',
    feature1Title: '严选一级源头工厂 (Tier-1)',
    feature1Desc: '所有认证供应商均通过实地验厂、ISO/CE国际认证核准与海关进出口许可证审查。',
    feature2Title: '全网采购RFQ即时推送',
    feature2Desc: '一次提交采购规格书，2小时内获取多家实力工厂明细FOB/CIF价格与交期方案。',
    feature3Title: '多币种国际贸易资金托管',
    feature3Desc: '货款安全存管于银行合规托管账户，待正本提单与SGS质检报告确认无误后安全放款。',
    feature4Title: '战略级全球集运航线',
    feature4Desc: '直通洛杉矶港、迪拜杰贝阿里、汉堡港、印度JNPT港及上海/深圳港等全球核心大港。',

    corridorTitle: '全球重点贸易廊道与航运枢纽',
    corridorSubtitle: '实时掌握核心海运航线关税动态、月度集装箱贸易吞吐量与快速通关时效。',
    corridorViewDetails: '查看港口海运物流方案',
    corridorStatLabel: '港口通关时效',
    corridorTopCommodities: '重点进出口大宗品类',

    rfqStep1Title: '第一步：产品规格与采购要求',
    rfqStep2Title: '第二步：国际运输与目的港物流',
    rfqStep3Title: '第三步：买家企业及联络信息',
    rfqProductNameLabel: '您需要采购的产品名称？',
    rfqQuantityLabel: '目标采购数量及计量单位 (例如: 5,000 吨 / 10,000 件)',
    rfqCategoryLabel: '所属行业类别',
    rfqIncotermLabel: '首选国际贸易术语 (Incoterms)',
    rfqDestinationLabel: '目的港口 / 目的国 (例如: 鹿特丹港 / 洛杉矶港)',
    rfqSpecsLabel: '详细技术参数、执行标准与质检要求',
    rfqCompanyLabel: '采购企业 / 公司全称',
    rfqContactLabel: '采购负责人姓名',
    rfqEmailLabel: '企业商务电子邮箱',
    rfqPhoneLabel: 'WhatsApp / 手机号码 (含国际区号)',
    rfqNextBtn: '下一步：填写物流参数',
    rfqSubmitBtn: '立即向全球 5,000+ 认证工厂广播询盘',
    rfqSuccessTitle: '🎉 国际采购询价单 (RFQ) 发布成功！',
    rfqSuccessSubtitle: '您的采购需求已进入全球商机推送网络，认证供应商将通过企业邮箱及WhatsApp与您联系。',
    rfqResetBtn: '发布另一条采购需求',

    statsVolume: '42 亿美元+',
    statsVolumeLabel: '累计撮合跨境贸易额',
    statsSuppliers: '85,000+',
    statsSuppliersLabel: '全球认证出口制造工厂',
    statsCountries: '180+',
    statsCountriesLabel: '全球活跃直航挂靠港口',
    statsSpeed: '< 2 小时',
    statsSpeedLabel: '供应商平均初次报价响应时效',

    categoriesHeading: '核心国际大宗采购产业分类',
    categoriesSubheading: '直连各行业高产能源头工厂、规模化生产基地与品牌授权出口商。',
    catAgri: '农业与大宗食品农产品',
    catApparel: '纺织服装、面料纱线与配饰',
    catPpe: '安全防护、劳保PPE与医疗器械',
    catMachinery: '工业机械设备与数控CNC备件',
    catFurniture: '商用家具、办公家具与五金建材',
    catChemicals: '石油化工原料、高分子聚合物与特种化学品',

    productsSectionTitle: '认证源头工厂直供商品与大宗批发',
    productsSectionSubtitle: '直接向经过实地验厂的规模化制造工厂采购，支持FOB/CIF梯度批发价与准时交期保障。',
    viewAllProducts: '浏览全部商品',
    contactSupplier: '联系供应商',
    requestQuotation: '获取即时报价',
    verifiedFactory: '认证源头工厂',
    moq: '起订量 (MOQ)',
    fobPrice: 'FOB 离岸参考价',
    inStock: '现货储备',

    liveFeedTitle: '实时全球B2B外贸商机与采购需求流',
    liveFeedSubtitle: '汇聚来自全球180+国家的实时大宗批发采购需求、招标标讯与紧急寻盘。',
    liveTickerBadge: '实时商机',
    postedBy: '发布买家',
    viewRfqDetails: '查看详情',
    submitProposal: '提交报价方案',

    reviewsTitle: '赢得全球 125,000+ 认证进出口商与跨国企业的信赖',
    reviewsSubtitle: '阅读来自跨国商社、集团采购部与一级外贸制造企业的真实合作评价与信保反馈。',
    trustScore: '跨国贸易信誉评分 4.9/5.0 (累计 18,400+ 笔真实履约)',
    verifiedTrader: '认证全球外贸商',

    footerAbout: '关于 Trade Heaven',
    footerAboutText: 'Trade Heaven 是全球领先的数字化B2B跨境批发交易平台，依托资金合规托管与真实验厂机制，安全连接全球制造工厂与跨国采购商。',
    footerSourcing: '采购与寻盘工具',
    footerSuppliers: '供应商与制造工厂',
    footerLegal: '信保安全与合规协议',
    footerNewsletterTitle: '全球贸易情报与大宗价格指数',
    footerNewsletterSubtitle: '每周免费获取最新国际大宗行情、关税政策变动与高价值买家询盘列表。',
    footerSubscribeBtn: '免费订阅',
    footerRights: '版权所有。全球贸易资金托管与实地验厂双重安全认证。',
    escrowGuaranteed: '100% 银行资金托管与SGS质检履约保障',

    ctaTitle: '准备好拓展您的全球大宗批发与外贸出行业务了吗？',
    ctaSubtitle: '立即加入全球超过 125,000 名采购主管、跨国贸易商社与品牌制造工厂的跨境网络。',
    ctaButtonBuyer: '免费发布国际采购需求',
    ctaButtonSupplier: '入驻成为认证出口供应商'
  },

  es: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',




















    brandTagline: 'Mercado Mayorista Global B2B y Custodia Comercial',
    sourceProducts: 'Buscar Productos (Comprador)',
    sellGlobally: 'Vender Globalmente (Proveedor)',
    postRfq: 'Publicar RFQ Gratis',
    postBuyRfq: 'Publicar RFQ',
    searchPlaceholder: 'Buscar productos, códigos HS, fábricas...',
    allCategories: 'Todas las Categorías',
    verifiedSuppliers: 'Proveedores Verificados',
    activeBuyers: 'Compradores Activos',
    globalPorts: 'Puertos Globales',
    tradeProtection: 'Garantía Escrow e Inspección SGS',
    freeQuote: 'Obtener Cotización Inmediata',
    exploreCatalog: 'Explorar Catálogo de Productos',
    home: 'Inicio',
    aboutUs: 'Sobre Nosotros',
    trustSafety: 'Seguridad y Confianza',
    newsInsights: 'Noticias y Tendencias',
    premiumServices: 'Servicios Premium',
    buyers: 'Compradores',
    suppliers: 'Proveedores',
    menu: 'Menú',
    signIn: 'Iniciar Sesión',
    registerFree: 'Registro Gratis',
    signOut: 'Cerrar Sesión',
    tradeAssurance: '100% Protección Comercial y Garantía Escrow',

    heroBadge: '180+ Puertos Globales • 125.000+ Compradores Activos',
    heroTitle1: 'La Próxima Generación de',
    heroTitleGradient: 'Mercado B2B Global',
    heroTitle2: 'y Abastecimiento Transfronterizo.',
    heroSubtitle: 'Conectando fabricantes verificados, exportadores y compradores mayoristas con difusión directa de RFQ, precios transparentes FOB/CIF y protección de pago en custodia.',
    heroSearchBtn: 'Buscar Ofertas',
    heroCategoryAll: 'Todos los Sectores',
    searchProductsTab: 'Productos',
    searchSuppliersTab: 'Fábricas Verificadas',
    searchRfqsTab: 'RFQs en Vivo',
    searchToolsTab: 'Herramientas de Comercio',
    searchOmniPlaceholder: 'Buscar productos, materias primas, fábricas o herramientas Incoterms...',
    searchRfqPlaceholder: 'Buscar en 1.200+ RFQs activas por producto, puerto, Incoterms...',
    searchSupplierPlaceholder: 'Buscar fábricas verificadas, proveedores, certificaciones y países...',
    findDeals: 'Encontrar Ofertas Mayoristas',
    verifiedSectors: 'Todos los Sectores Verificados',
    liveMatches: 'resultados',
    popularSearches: 'Búsquedas Populares',

    featuresTitle: 'Por qué Compradores y Exportadores Globales Eligen Trade Heaven',
    featuresSubtitle: 'Diseñado para el comercio internacional sin fricciones, credenciales auditadas y pagos protegidos.',
    feature1Title: 'Exportadores Tier-1 Verificados',
    feature1Desc: 'Proveedores auditados con inspección física, certificados ISO/CE y licencias de exportación vigentes.',
    feature2Title: 'Difusión Directa de RFQs',
    feature2Desc: 'Envíe sus requerimientos y reciba ofertas competitivas FOB/CIF en menos de 2 horas.',
    feature3Title: 'Custodia Escrow Multidivisa',
    feature3Desc: 'Sus fondos quedan protegidos hasta la validación del conocimiento de embarque y la inspección de calidad SGS.',
    feature4Title: 'Corredores Comerciales Globales',
    feature4Desc: 'Rutas logísticas directas a Los Ángeles, Jebel Ali, Hamburgo, Nhava Sheva y Shanghái.',

    corridorTitle: 'Corredores Estratégicos de Comercio Global',
    corridorSubtitle: 'Aranceles en tiempo real, métricas de volumen mensual y despacho exprés en rutas marítimas clave.',
    corridorViewDetails: 'Explorar Logística Portuaria',
    corridorStatLabel: 'Tiempo de Despacho',
    corridorTopCommodities: 'Principales Productos Negociados',

    rfqStep1Title: '1. Especificaciones del Producto',
    rfqStep2Title: '2. Logística y Puerto de Destino',
    rfqStep3Title: '3. Datos de Contacto del Comprador',
    rfqProductNameLabel: '¿Qué producto desea cotizar?',
    rfqQuantityLabel: 'Cantidad y unidad (ej. 5.000 TM)',
    rfqCategoryLabel: 'Sector Industrial',
    rfqIncotermLabel: 'Incoterm Preferido',
    rfqDestinationLabel: 'Puerto / País de Destino',
    rfqSpecsLabel: 'Especificaciones técnicas y estándares de calidad',
    rfqCompanyLabel: 'Nombre de la Empresa',
    rfqContactLabel: 'Nombre de la Persona de Contacto',
    rfqEmailLabel: 'Correo Electrónico Corporativo',
    rfqPhoneLabel: 'WhatsApp / Teléfono (con código de país)',
    rfqNextBtn: 'Continuar al Siguiente Paso',
    rfqSubmitBtn: 'Transmitir RFQ a 5.000+ Proveedores Verificados',
    rfqSuccessTitle: '¡RFQ Transmitida Exitosamente!',
    rfqSuccessSubtitle: 'Su solicitud está activa. Los proveedores verificados se comunicarán directamente con su equipo.',
    rfqResetBtn: 'Publicar Otra Solicitud de Compra',

    statsVolume: '$4.2 Mil Millones+',
    statsVolumeLabel: 'Volumen Transfronterizo Facilitado',
    statsSuppliers: '85.000+',
    statsSuppliersLabel: 'Fábricas Exportadoras Verificadas',
    statsCountries: '180+',
    statsCountriesLabel: 'Puertos de Destino Activos',
    statsSpeed: '< 2 Horas',
    statsSpeedLabel: 'Tiempo Promedio de Respuesta',

    categoriesHeading: 'Principales Sectores de Abastecimiento Internacional',
    categoriesSubheading: 'Explore fabricantes certificados y exportadores en las principales industrias mayoristas.',
    catAgri: 'Agricultura y Alimentos a Granel',
    catApparel: 'Textiles, Confección y Telas',
    catPpe: 'Seguridad, EPP y Equipos Médicos',
    catMachinery: 'Maquinaria Industrial y Repuestos CNC',
    catFurniture: 'Muebles Comerciales y Construcción',
    catChemicals: 'Petroquímica y Polímeros Plásticos',

    productsSectionTitle: 'Productos de Fábrica Verificados y Venta Mayorista',
    productsSectionSubtitle: 'Abastézcase directamente de plantas auditadas con precios escalonados FOB/CIF y tiempos de entrega garantizados.',
    viewAllProducts: 'Ver Todos los Productos',
    contactSupplier: 'Contactar Proveedor',
    requestQuotation: 'Solicitar Cotización Inmediata',
    verifiedFactory: 'Fábrica Verificada',
    moq: 'Pedido Mínimo (MOQ)',
    fobPrice: 'Precio FOB',
    inStock: 'En Stock',

    liveFeedTitle: 'Flujo en Vivo de Oportunidades y RFQs Globales',
    liveFeedSubtitle: 'Demandas mayoristas en tiempo real, licitaciones verificadas y compras urgentes de todo el mundo.',
    liveTickerBadge: 'Demandas en Vivo',
    postedBy: 'Publicado por',
    viewRfqDetails: 'Ver Detalles',
    submitProposal: 'Enviar Cotización',

    reviewsTitle: 'Con la Confianza de Más de 125.000 Importadores y Exportadores',
    reviewsSubtitle: 'Lea testimonios verificados de casas de comercio internacional, directores de compras y fábricas exportadoras.',
    trustScore: 'Puntuación de Confianza 4.9/5.0 en más de 18.400 operaciones',
    verifiedTrader: 'Operador Comercial Verificado',

    footerAbout: 'Acerca de Trade Heaven',
    footerAboutText: 'Trade Heaven es el mercado B2B mayorista líder que conecta fabricantes verificados con importadores calificados bajo custodia financiera segura.',
    footerSourcing: 'Herramientas de Abastecimiento',
    footerSuppliers: 'Fábricas y Proveedores',
    footerLegal: 'Seguridad y Aspectos Legales',
    footerNewsletterTitle: 'Inteligencia de Comercio Global',
    footerNewsletterSubtitle: 'Reciba semanalmente índices de precios, actualizaciones arancelarias y oportunidades de compra.',
    footerSubscribeBtn: 'Suscribirse Gratis',
    footerRights: 'Todos los derechos reservados. Custodia comercial y verificación auditada.',
    escrowGuaranteed: '100% Custodia Escrow y Calidad Garantizada',

    ctaTitle: '¿Listo para Expandir sus Operaciones Mayoristas Internacionales?',
    ctaSubtitle: 'Únase a más de 125.000 profesionales de compras y exportadores que comercian con total seguridad.',
    ctaButtonBuyer: 'Publicar Solicitud de Compra Gratis',
    ctaButtonSupplier: 'Registrarse como Exportador Verificado'
  },

  ar: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',




















    brandTagline: 'سوق الجملة العالمي B2B وخدمات الضمان والوساطة المالية',
    sourceProducts: 'شراء المنتجات (بوابة المشتري)',
    sellGlobally: 'البيع عالمياً (انضمام الموردين)',
    postRfq: 'طلب عرض أسعار مجاني (RFQ)',
    postBuyRfq: 'نشر طلب شراء RFQ',
    searchPlaceholder: 'ابحث عن السلع، رموز النظام المنسق HS، المصانع...',
    allCategories: 'جميع القطاعات الصناعية',
    verifiedSuppliers: 'الموردون المعتمدون',
    activeBuyers: 'المشترون النشطون',
    globalPorts: 'الموانئ العالمية',
    tradeProtection: 'الضمان المالي وفحص الجودة SGS',
    freeQuote: 'الحصول على تسعيرة فورية',
    exploreCatalog: 'استعراض كتالوج المنتجات',
    home: 'الرئيسية',
    aboutUs: 'معلومات عنا',
    trustSafety: 'الأمان والثقة',
    newsInsights: 'أخبار التجارة والرؤى',
    premiumServices: 'خدمات متميزة',
    buyers: 'المشترون',
    suppliers: 'الموردون',
    menu: 'القائمة',
    signIn: 'تسجيل الدخول',
    registerFree: 'تسجيل مجاني',
    signOut: 'تسجيل الخروج',
    tradeAssurance: 'حماية تجارية وضمان مالي 100%',

    heroBadge: '180+ ميناء عالمي • 125,000+ مشترٍ دولي معتمد',
    heroTitle1: 'الجيل القادم من',
    heroTitleGradient: 'سوق التجارة العالمية B2B',
    heroTitle2: 'ومنصة التوريد الدولي الموثوقة.',
    heroSubtitle: 'ربط المصانع والمصدرين المعتمدين بالمشترين حول العالم مع بث مباشر لطلبات الأسعار وتسعير شفاف FOB/CIF وضمانات مصرفية متكاملة.',
    heroSearchBtn: 'بحث عن الصفقات',
    heroCategoryAll: 'جميع القطاعات',
    searchProductsTab: 'المنتجات والسلع',
    searchSuppliersTab: 'المصانع المعتمدة',
    searchRfqsTab: 'طلبات RFQ المباشرة',
    searchToolsTab: 'أدوات التجارة',
    searchOmniPlaceholder: 'ابحث عن المنتجات، المواد الخام، المصانع أو أدوات الإنكوتيرمز...',
    searchRfqPlaceholder: 'ابحث في أكثر من 1,200 طلب شراء حسب المنتج والميناء والدولة...',
    searchSupplierPlaceholder: 'ابحث عن المصانع المعتمدة والموردين وشهادات الجودة...',
    findDeals: 'استكشاف صفقات الجملة',
    verifiedSectors: 'كافة القطاعات المعتمدة',
    liveMatches: 'نتيجة مطابقة',
    popularSearches: 'عمليات البحث الشائعة',

    featuresTitle: 'لماذا يختار المصدرون ومكاتب المشتريات منصة Trade Heaven',
    featuresSubtitle: 'مصممة خصيصاً للتجارة الدولية السلسة مع تدقيق فوري للشهادات ودفع آمن.',
    feature1Title: 'مصدرون من الفئة الأولى (Tier-1)',
    feature1Desc: 'جميع الموردين خضعوا للتدقيق الميداني وشهادات ISO/CE وتراخيص التصدير الرسمية.',
    feature2Title: 'بث مباشر لطلبات الشراء RFQ',
    feature2Desc: 'أرسل مواصفات الشراء الخاصة بك مرة واحدة واحصل على عروض FOB/CIF خلال ساعتين.',
    feature3Title: 'حسابات ضمان متعددة العملات (Escrow)',
    feature3Desc: 'أموالك محمية في حساب ضمان معتمد حتى التحقق من بوليصة الشحن وفحص الجودة SGS.',
    feature4Title: 'ممرات تجارية استراتيجية',
    feature4Desc: 'مسارات شحن محسنة إلى ميناء لوس أنجلوس، جبل علي، هامبورغ، ونهافا شيفا وشانغهاي.',

    corridorTitle: 'الممرات التجارية والموانئ الاستراتيجية',
    corridorSubtitle: 'بيانات التعريفات الجمركية، أحجام الشحن الشهرية والتخليص السريع عبر الموانئ الحيوية.',
    corridorViewDetails: 'استكشاف الخدمات اللوجستية للموانئ',
    corridorStatLabel: 'سرعة التخليص',
    corridorTopCommodities: 'أهم السلع المتداولة',

    rfqStep1Title: '1. مواصفات المنتج والطلب',
    rfqStep2Title: '2. الشحن وميناء الوصول',
    rfqStep3Title: '3. بيانات اتصال المشتري',
    rfqProductNameLabel: 'ما هو المنتج المطلوب استيراده؟',
    rfqQuantityLabel: 'الكمية المستهدفة ووحدة القياس (مثال: 5,000 طن متري)',
    rfqCategoryLabel: 'القطاع الصناعي',
    rfqIncotermLabel: 'شرط التجارة الدولي المفضل (Incoterm)',
    rfqDestinationLabel: 'ميناء / دولة الوصول (مثال: ميناء روتردام)',
    rfqSpecsLabel: 'المواصفات الفنية ومعايير الجودة المطلوبة',
    rfqCompanyLabel: 'اسم الشركة / المؤسسة',
    rfqContactLabel: 'اسم المسؤول التجاري',
    rfqEmailLabel: 'البريد الإلكتروني للعمل',
    rfqPhoneLabel: 'واتساب / هاتف (مع رمز الدولة)',
    rfqNextBtn: 'المتابعة للخطوة التالية',
    rfqSubmitBtn: 'بث طلب الشراء إلى أكثر من 5,000 مصنع معتمد',
    rfqSuccessTitle: 'تم إرسال طلب الشراء (RFQ) بنجاح!',
    rfqSuccessSubtitle: 'طلبك معروض الآن أمام شبكة الموردين العالمية وسيقوم الموردون المعتمدون بالتواصل معك.',
    rfqResetBtn: 'تقديم طلب شراء جديد',

    statsVolume: '4.2+ مليار دولار',
    statsVolumeLabel: 'إجمالي حجم التجارة المنجزة',
    statsSuppliers: '85,000+',
    statsSuppliersLabel: 'مصانع ومصدرون معتمدون',
    statsCountries: '180+',
    statsCountriesLabel: 'موانئ وصول عالمية نشطة',
    statsSpeed: '< ساعتان',
    statsSpeedLabel: 'متوسط سرعة استجابة الموردين',

    categoriesHeading: 'أهم قطاعات الشراء والتوريد الدولية',
    categoriesSubheading: 'تصفح المصانع ذات الطاقة الإنتاجية العالية والمصدرين المعتمدين في الصناعات الأساسية.',
    catAgri: 'المنتجات الزراعية والسلع الغذائية',
    catApparel: 'المنسوجات والملابس والأقمشة',
    catPpe: 'معدات السلامة والوقاية والأجهزة الطبية',
    catMachinery: 'الآلات الصناعية وقطع الغيار CNC',
    catFurniture: 'الأثاث التجاري والمفروشات',
    catChemicals: 'البتروكيماويات والبوليمرات والمواد الكيميائية',

    productsSectionTitle: 'منتجات المصانع المباشرة والبيع بالجملة المعتمد',
    productsSectionSubtitle: 'استورد مباشرة من المصانع المعتمدة بأسعار FOB/CIF تدريجية وأوقات تسليم مضمونة.',
    viewAllProducts: 'عرض كافة المنتجات',
    contactSupplier: 'تواصل مع المصنع',
    requestQuotation: 'طلب تسعيرة فورية',
    verifiedFactory: 'مصنع معتمد',
    moq: 'الحد الأدنى للطلب (MOQ)',
    fobPrice: 'سعر FOB التقريبي',
    inStock: 'متوفر بالمخزون',

    liveFeedTitle: 'بث مباشر للفرص التجارية وطلبات الشراء العالمية',
    liveFeedSubtitle: 'طلبات شراء بالجملة ومناقصات دولية واستفسارات فورية تبث على مدار الساعة.',
    liveTickerBadge: 'فرص مباشرة',
    postedBy: 'بواسطة',
    viewRfqDetails: 'عرض التفاصيل',
    submitProposal: 'تقديم عرض سعر',

    reviewsTitle: 'موثوق من قبل أكثر من 125,000 مستورد ومصدر عالمي',
    reviewsSubtitle: 'اقرأ تقييمات موثقة من بيوت التجارة الدولية ومدراء المشتريات والمصانع الكبرى.',
    trustScore: 'مؤشر الثقة 4.9/5.0 في أكثر من 18,400 صفقة دولية',
    verifiedTrader: 'تاجر دولي معتمد',

    footerAbout: 'عن Trade Heaven',
    footerAboutText: 'تعد Trade Heaven المنصة الرائدة للتجارة بين الشركات B2B، حيث تربط المصانع بالمستوردين عبر ضمان مالي شامل.',
    footerSourcing: 'أدوات التوريد والطلبات',
    footerSuppliers: 'المصانع والموردون',
    footerLegal: 'الأمان والامتثال والضمان',
    footerNewsletterTitle: 'معلومات التجارة العالمية',
    footerNewsletterSubtitle: 'احصل أسبوعياً على مؤشرات أسعار السلع والتعريفات الجمركية وأحدث فرص الشراء.',
    footerSubscribeBtn: 'اشتراك مجاني',
    footerRights: 'جميع الحقوق محفوظة. ضمان مالي وتدقيق تجاري معتمد.',
    escrowGuaranteed: 'ضمان مالي 100% وفحص جودة معتمد',

    ctaTitle: 'هل أنت مستعد لتوسيع عملياتك التجارية الدولية بالجملة؟',
    ctaSubtitle: 'انضم إلى أكثر من 125,000 من مسؤولي المشتريات والمصدرين الذين يتداولون بأمان كامل.',
    ctaButtonBuyer: 'نشر طلب شراء مجاني',
    ctaButtonSupplier: 'التسجيل كمصدر معتمد'
  },

  de: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'Globaler B2B-Großhandelsmarktplatz & Treuhandservice',
    sourceProducts: 'Produkte beschaffen (Einkäufer)',
    sellGlobally: 'Weltweit verkaufen (Lieferant)',
    postRfq: 'Kostenlose RFQ erstellen',
    postBuyRfq: 'Kaufanfrage (RFQ) aufgeben',
    searchPlaceholder: 'Rohstoffe, HS-Codes, Fabriken suchen...',
    allCategories: 'Alle Kategorien',
    verifiedSuppliers: 'Geprüfte Lieferanten',
    activeBuyers: 'Aktive Einkäufer',
    globalPorts: 'Globale Häfen',
    tradeProtection: 'Treuhandabsicherung & SGS-Qualitätsprüfung',
    freeQuote: 'Sofortangebot anfordern',
    exploreCatalog: 'Produktkatalog durchsuchen',
    home: 'Startseite',
    aboutUs: 'Über uns',
    trustSafety: 'Sicherheit & Vertrauen',
    newsInsights: 'Nachrichten & Einblicke',
    premiumServices: 'Premium-Dienste',
    buyers: 'Käufer',
    suppliers: 'Lieferanten',
    menu: 'Menü',
    signIn: 'Anmelden',
    registerFree: 'Kostenlos registrieren',
    signOut: 'Abmelden',
    tradeAssurance: '100% Handelsschutz & Treuhandgarantie',

    heroBadge: '180+ Welthäfen • 125.000+ aktive Großhandelskäufer',
    heroTitle1: 'Die nächste Generation des',
    heroTitleGradient: 'globalen B2B-Marktplatzes',
    heroTitle2: '& grenzüberschreitenden Einkaufs.',
    heroSubtitle: 'Verbindung geprüfter Hersteller, Exporteure und Großhandelskäufer mit direktem RFQ-Broadcasting, transparenten FOB/CIF-Preisen und gesicherter Treuhandabwicklung.',
    heroSearchBtn: 'Angebote finden',
    heroCategoryAll: 'Alle Branchen',
    searchProductsTab: 'Produkte',
    searchSuppliersTab: 'Geprüfte Fabriken',
    searchRfqsTab: 'Live-RFQs',
    searchToolsTab: 'Handelstools',
    searchOmniPlaceholder: 'Produkte, Materialien, Fabriken, RFQs oder Incoterms-Tools suchen...',
    searchRfqPlaceholder: '1.200+ aktive RFQs nach Produkt, Hafen, Incoterms suchen...',
    searchSupplierPlaceholder: 'Geprüfte Fabriken, Zertifizierungen und Länder durchsuchen...',
    findDeals: 'Großhandelsangebote finden',
    verifiedSectors: 'Alle geprüften Branchen',
    liveMatches: 'Treffer',
    popularSearches: 'Beliebte Suchbegriffe',

    featuresTitle: 'Warum weltweite Exporteure Trade Heaven wählen',
    featuresSubtitle: 'Entwickelt für reibungslosen internationalen Handel, verifizierte Zertifikate und risikofreie Zahlungen.',
    feature1Title: 'Verifizierte Tier-1-Exporteure',
    feature1Desc: 'Alle Lieferanten werden durch Werksaudits, ISO/CE-Zertifikate und Exportlizenzen geprüft.',
    feature2Title: 'Direktes RFQ-Broadcasting',
    feature2Desc: 'Spezifikationen einmal einreichen und innerhalb von 2 Stunden detaillierte FOB/CIF-Angebote erhalten.',
    feature3Title: 'Multi-Währungs-Treuhandservice',
    feature3Desc: 'Kundengelder bleiben bis zur Vorlage des Konnossements und SGS-Prüfberichts sicher treuhänderisch verwahrt.',
    feature4Title: 'Globale Handelskorridore',
    feature4Desc: 'Optimierte Logistikrouten nach Los Angeles, Jebel Ali, Hamburg, Nhava Sheva und Shanghai.',

    corridorTitle: 'Strategische globale Handelskorridore',
    corridorSubtitle: 'Echtzeit-Zolldaten, monatliche Containermetriken und Express-Abfertigung auf zentralen Seerouten.',
    corridorViewDetails: 'Hafenlogistik erkunden',
    corridorStatLabel: 'Abfertigungsdauer',
    corridorTopCommodities: 'Meistgehandelte Güter',

    rfqStep1Title: '1. Produktspezifikationen',
    rfqStep2Title: '2. Versand & Zielhafen',
    rfqStep3Title: '3. Kontaktdaten des Käufers',
    rfqProductNameLabel: 'Welches Produkt beschaffen Sie?',
    rfqQuantityLabel: 'Zielmenge & Einheit (z. B. 5.000 Tonnen)',
    rfqCategoryLabel: 'Industriesektor',
    rfqIncotermLabel: 'Bevorzugte Lieferklausel (Incoterm)',
    rfqDestinationLabel: 'Zielhafen / Land (z. B. Hafen Hamburg)',
    rfqSpecsLabel: 'Technische Daten & Qualitätsanforderungen',
    rfqCompanyLabel: 'Firmenname',
    rfqContactLabel: 'Name des Ansprechpartners',
    rfqEmailLabel: 'Geschäftliche E-Mail-Adresse',
    rfqPhoneLabel: 'WhatsApp / Telefon (mit Ländervorwahl)',
    rfqNextBtn: 'Weiter zum nächsten Schritt',
    rfqSubmitBtn: 'RFQ an über 5.000 geprüfte Lieferanten senden',
    rfqSuccessTitle: 'RFQ erfolgreich übermittelt!',
    rfqSuccessSubtitle: 'Ihre Beschaffungsanfrage ist online. Geprüfte Lieferanten werden sich direkt bei Ihnen melden.',
    rfqResetBtn: 'Weitere Kaufanfrage erstellen',

    statsVolume: '4,2+ Mrd. USD',
    statsVolumeLabel: 'Vermitteltes Handelsvolumen',
    statsSuppliers: '85.000+',
    statsSuppliersLabel: 'Geprüfte Herstellerbetriebe',
    statsCountries: '180+',
    statsCountriesLabel: 'Aktive Zielhäfen',
    statsSpeed: '< 2 Stunden',
    statsSpeedLabel: 'Durchschnittliche Antwortzeit',

    categoriesHeading: 'Wichtigste internationale Beschaffungssektoren',
    categoriesSubheading: 'Entdecken Sie zertifizierte Hersteller und Exporteure in den Kernbranchen des Großhandels.',
    catAgri: 'Agrar- & Lebensmittelrohstoffe',
    catApparel: 'Textilien, Bekleidung & Stoffe',
    catPpe: 'Arbeitsschutz, PSA & Medizintechnik',
    catMachinery: 'Industriemaschinen & CNC-Ersatzteile',
    catFurniture: 'Gewerbemöbel & Baubeschläge',
    catChemicals: 'Petrochemikalien & Rohpolymere',

    productsSectionTitle: 'Geprüfte Fabrikdirektprodukte & Großhandel',
    productsSectionSubtitle: 'Direktbezug aus auditierten Werken mit gestaffelten FOB/CIF-Preisen und garantierten Lieferfristen.',
    viewAllProducts: 'Alle Produkte anzeigen',
    contactSupplier: 'Lieferant kontaktieren',
    requestQuotation: 'Sofortangebot anfordern',
    verifiedFactory: 'Geprüfter Hersteller',
    moq: 'Mindestbestellmenge (MOQ)',
    fobPrice: 'FOB-Preis',
    inStock: 'Auf Lager',

    liveFeedTitle: 'Live-B2B-Handelsfeed & weltweite Kaufanfragen',
    liveFeedSubtitle: 'Echtzeit-Kaufanfragen, Ausschreibungen und dringende Beschaffungsgesuche aus aller Welt.',
    liveTickerBadge: 'Live-Leads',
    postedBy: 'Eingestellt von',
    viewRfqDetails: 'Details anzeigen',
    submitProposal: 'Angebot einreichen',

    reviewsTitle: 'Von über 125.000 verifizierten Händlern weltweit geschätzt',
    reviewsSubtitle: 'Erfahrungsberichte von internationalen Handelshäusern, Einkaufsleitern und Fabrikexporteuren.',
    trustScore: 'TrustScore 4.9/5.0 bei über 18.400 abgeschlossenen Transaktionen',
    verifiedTrader: 'Geprüfter Welthändler',

    footerAbout: 'Über Trade Heaven',
    footerAboutText: 'Trade Heaven ist der führende B2B-Großhandelsmarktplatz, der geprüfte Hersteller und Einkäufer über sichere Treuhandkonten verbindet.',
    footerSourcing: 'Beschaffungstools',
    footerSuppliers: 'Fabriken & Lieferanten',
    footerLegal: 'Sicherheit & Rechtliches',
    footerNewsletterTitle: 'Global Trade Intelligence',
    footerNewsletterSubtitle: 'Wöchentliche Rohstoffpreisindizes, Zollaktualisierungen und aktuelle Kaufanfragen direkt erhalten.',
    footerSubscribeBtn: 'Kostenlos abonnieren',
    footerRights: 'Alle Rechte vorbehalten. Treuhandgarantie und Werksaudit verifiziert.',
    escrowGuaranteed: '100% Treuhandabsicherung & Qualitätsgarantie',

    ctaTitle: 'Bereit, Ihre internationalen Großhandelsaktivitäten zu skalieren?',
    ctaSubtitle: 'Schließen Sie sich über 125.000 Einkäufern und Herstellern an, die sicher über Trade Heaven handeln.',
    ctaButtonBuyer: 'Kostenlose Kaufanfrage aufgeben',
    ctaButtonSupplier: 'Als geprüfter Exporteur registrieren'
  },

  fr: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'Place de Marché B2B Mondiale & Séquestre Commercial',
    sourceProducts: 'Acheter des Produits (Acheteur)',
    sellGlobally: 'Vendre dans le Monde (Fournisseur)',
    postRfq: 'Publier un RFQ Gratuit',
    postBuyRfq: 'Publier une demande RFQ',
    searchPlaceholder: 'Rechercher matières premières, codes SH, usines...',
    allCategories: 'Toutes les Catégories',
    verifiedSuppliers: 'Fournisseurs Vérifiés',
    activeBuyers: 'Acheteurs Actifs',
    globalPorts: 'Ports Mondiaux',
    tradeProtection: 'Séquestre Bancaire & Contrôle Qualité SGS',
    freeQuote: 'Obtenir un Devis Immédiat',
    exploreCatalog: 'Explorer le Catalogue Produits',
    home: 'Accueil',
    aboutUs: 'À propos',
    trustSafety: 'Sécurité & Confiance',
    newsInsights: 'Actualités & Analyses',
    premiumServices: 'Services Premium',
    buyers: 'Acheteurs',
    suppliers: 'Fournisseurs',
    menu: 'Menu',
    signIn: 'Connexion',
    registerFree: 'Inscription Gratuite',
    signOut: 'Déconnexion',
    tradeAssurance: '100% Protection Commerciale & Garantie Séquestre',

    heroBadge: '180+ Ports Mondiaux • 125 000+ Acheteurs Actifs',
    heroTitle1: 'La Nouvelle Génération de',
    heroTitleGradient: 'Marché B2B Mondial',
    heroTitle2: '& d\'Approvisionnement International.',
    heroSubtitle: 'Connectez fabricants vérifiés, exportateurs et acheteurs en gros avec diffusion directe de RFQ, tarification FOB/CIF transparente et protection des paiements par séquestre.',
    heroSearchBtn: 'Trouver des Offres',
    heroCategoryAll: 'Tous les Secteurs',
    searchProductsTab: 'Produits',
    searchSuppliersTab: 'Usines Vérifiées',
    searchRfqsTab: 'RFQs en Direct',
    searchToolsTab: 'Outils Commerciaux',
    searchOmniPlaceholder: 'Rechercher produits, matières, usines, RFQs ou outils Incoterms...',
    searchRfqPlaceholder: 'Rechercher parmi 1 200+ RFQs par produit, port, Incoterms...',
    searchSupplierPlaceholder: 'Rechercher usines vérifiées, certifications et pays...',
    findDeals: 'Trouver des Offres de Gros',
    verifiedSectors: 'Tous les Secteurs Vérifiés',
    liveMatches: 'résultats',
    popularSearches: 'Recherches Populaires',

    featuresTitle: 'Pourquoi les Exportateurs et Acheteurs Choisissent Trade Heaven',
    featuresSubtitle: 'Conçu pour le commerce international fluide, la vérification rigoureuse et des paiements sécurisés.',
    feature1Title: 'Exportateurs Tier-1 Vérifiés',
    feature1Desc: 'Fournisseurs audités sur site, certifiés ISO/CE et détenteurs de licences d\'exportation valides.',
    feature2Title: 'Diffusion Directe des RFQ',
    feature2Desc: 'Soumettez votre cahier des charges et recevez des offres FOB/CIF détaillées en moins de 2 heures.',
    feature3Title: 'Séquestre Multi-Devises (Escrow)',
    feature3Desc: 'Vos fonds sont protégés jusqu\'à la validation du connaissement maritime et du rapport d\'inspection SGS.',
    feature4Title: 'Corridors Commerciaux Stratégiques',
    feature4Desc: 'Lignes maritimes directes vers Los Angeles, Jebel Ali, Hambourg, Nhava Sheva et Shanghai.',

    corridorTitle: 'Corridors Commerciaux & Hubs Stratégiques',
    corridorSubtitle: 'Tarifs douaniers en temps réel, volumes mensuels et dédouanement express sur les grandes routes maritimes.',
    corridorViewDetails: 'Explorer la Logistique Portuaire',
    corridorStatLabel: 'Délai de Dédouanement',
    corridorTopCommodities: 'Principales Matières Échangées',

    rfqStep1Title: '1. Spécifications du Produit',
    rfqStep2Title: '2. Expédition & Port de Destination',
    rfqStep3Title: '3. Coordonnées de l\'Acheteur',
    rfqProductNameLabel: 'Quel produit recherchez-vous ?',
    rfqQuantityLabel: 'Quantité cible et unité (ex. 5 000 TM)',
    rfqCategoryLabel: 'Secteur Industriel',
    rfqIncotermLabel: 'Incoterm Souhaité',
    rfqDestinationLabel: 'Port / Pays de Destination (ex. Port du Havre)',
    rfqSpecsLabel: 'Spécifications techniques & normes requises',
    rfqCompanyLabel: 'Nom de l\'Entreprise',
    rfqContactLabel: 'Nom du Responsable',
    rfqEmailLabel: 'Email Professionnel',
    rfqPhoneLabel: 'WhatsApp / Téléphone (avec indicatif)',
    rfqNextBtn: 'Passer à l\'Étape Suivante',
    rfqSubmitBtn: 'Diffuser la RFQ à plus de 5 000 Fournisseurs Vérifiés',
    rfqSuccessTitle: 'Demande RFQ diffusée avec succès !',
    rfqSuccessSubtitle: 'Votre demande est en ligne. Les usines vérifiées contacteront directement votre équipe d\'achat.',
    rfqResetBtn: 'Publier une Nouvelle Demande',

    statsVolume: '4,2+ Milliards $',
    statsVolumeLabel: 'Volume Commercial Traité',
    statsSuppliers: '85 000+',
    statsSuppliersLabel: 'Usines Exportatrices Vérifiées',
    statsCountries: '180+',
    statsCountriesLabel: 'Ports de Destination Actifs',
    statsSpeed: '< 2 Heures',
    statsSpeedLabel: 'Temps Moyen de Réponse',

    categoriesHeading: 'Principaux Secteurs d\'Approvisionnement Mondial',
    categoriesSubheading: 'Accédez à des fabricants certifiés et exportateurs majeurs dans les industries clés.',
    catAgri: 'Agriculture & Matières Agroalimentaires',
    catApparel: 'Textile, Habillement & Tissus',
    catPpe: 'Équipements de Protection & Médical',
    catMachinery: 'Machines Industrielles & Pièces CNC',
    catFurniture: 'Mobilier Commercial & Agencement',
    catChemicals: 'Pétrochimie & Polymères Plastiques',

    productsSectionTitle: 'Produits Direct Usine Vérifiés & Vente en Gros',
    productsSectionSubtitle: 'Achetez directement auprès d\'usines auditées avec tarifs dégressifs FOB/CIF et délais garantis.',
    viewAllProducts: 'Voir Tous les Produits',
    contactSupplier: 'Contacter l\'Usine',
    requestQuotation: 'Demander un Devis Immédiat',
    verifiedFactory: 'Usine Vérifiée',
    moq: 'Quantité Minimale (MOQ)',
    fobPrice: 'Prix FOB',
    inStock: 'En Stock',

    liveFeedTitle: 'Flux en Direct des Demandes d\'Achat B2B Mondiales',
    liveFeedSubtitle: 'Appels d\'offres en direct, demandes de cotation vérifiées et approvisionnements urgents.',
    liveTickerBadge: 'Demandes en Direct',
    postedBy: 'Publié par',
    viewRfqDetails: 'Voir Détails',
    submitProposal: 'Soumettre une Offre',

    reviewsTitle: 'Recommandé par plus de 125 000 Importateurs & Exportateurs',
    reviewsSubtitle: 'Découvrez les retours d\'expérience de centrales d\'achat et d\'industriels exportateurs.',
    trustScore: 'Score de Confiance 4.9/5.0 sur 18 400+ transactions',
    verifiedTrader: 'Opérateur Mondial Vérifié',

    footerAbout: 'À propos de Trade Heaven',
    footerAboutText: 'Trade Heaven est la plateforme B2B mondiale de référence reliant fabricants audités et acheteurs qualifiés sous séquestre bancaire.',
    footerSourcing: 'Outils d\'Achat & RFQ',
    footerSuppliers: 'Usines & Fournisseurs',
    footerLegal: 'Sécurité & Mentions Légales',
    footerNewsletterTitle: 'Intelligence Commerciale Mondiale',
    footerNewsletterSubtitle: 'Recevez chaque semaine les cours des matières premières, l\'actualité douanière et les opportunités d\'achat.',
    footerSubscribeBtn: 'S\'inscrire Gratuitement',
    footerRights: 'Tous droits réservés. Séquestre commercial et audits vérifiés.',
    escrowGuaranteed: '100% Séquestre Garanti & Contrôle Qualité SGS',

    ctaTitle: 'Prêt à Développer vos Opérations de Commerce de Gros International ?',
    ctaSubtitle: 'Rejoignez plus de 125 000 acheteurs et usines qui commercent en toute sécurité.',
    ctaButtonBuyer: 'Publier une Demande d\'Achat Gratuite',
    ctaButtonSupplier: 'Devenir Fournisseur Vérifié'
  },

  pt: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'Mercado Atacadista Global B2B e Custódia Comercial',
    sourceProducts: 'Comprar Produtos (Comprador)',
    sellGlobally: 'Vender Globalmente (Fornecedor)',
    postRfq: 'Publicar RFQ Grátis',
    postBuyRfq: 'Publicar RFQ de Compra',
    searchPlaceholder: 'Buscar commodities, códigos HS, fábricas...',
    allCategories: 'Todas as Categorias',
    verifiedSuppliers: 'Fornecedores Verificados',
    activeBuyers: 'Compradores Ativos',
    globalPorts: 'Portos Globais',
    tradeProtection: 'Garantia Escrow e Inspeção SGS',
    freeQuote: 'Obter Cotação Imediata',
    exploreCatalog: 'Explorar Catálogo de Produtos',
    home: 'Início',
    aboutUs: 'Sobre Nós',
    trustSafety: 'Segurança & Confiança',
    newsInsights: 'Notícias e Tendências',
    premiumServices: 'Serviços Premium',
    buyers: 'Compradores',
    suppliers: 'Fornecedores',
    menu: 'Menu',
    signIn: 'Entrar',
    registerFree: 'Cadastre-se Grátis',
    signOut: 'Sair',
    tradeAssurance: '100% Proteção Comercial & Garantia Escrow',

    heroBadge: '180+ Portos Globais • 125.000+ Compradores Ativos',
    heroTitle1: 'A Nova Geração do',
    heroTitleGradient: 'Mercado B2B Global',
    heroTitle2: 'e Comércio Transfronteiriço.',
    heroSubtitle: 'Conectando fabricantes auditados, exportadores e compradores atacadistas com cotações diretas, preços FOB/CIF transparentes e garantia de pagamento sob custódia.',
    heroSearchBtn: 'Buscar Ofertas',
    heroCategoryAll: 'Todos os Setores',
    searchProductsTab: 'Produtos',
    searchSuppliersTab: 'Fábricas Verificadas',
    searchRfqsTab: 'RFQs em Tempo Real',
    searchToolsTab: 'Ferramentas de Comércio',
    searchOmniPlaceholder: 'Buscar produtos, matérias-primas, fábricas ou ferramentas Incoterms...',
    searchRfqPlaceholder: 'Buscar em 1.200+ RFQs por produto, porto, Incoterms...',
    searchSupplierPlaceholder: 'Buscar fábricas verificadas, fornecedores e certificações...',
    findDeals: 'Encontrar Negócios no Atacado',
    verifiedSectors: 'Todos os Setores Verificados',
    liveMatches: 'resultados',
    popularSearches: 'Buscas Populares',

    featuresTitle: 'Por que Importadores e Exportadores Escolhem a Trade Heaven',
    featuresSubtitle: 'Criada para o comércio internacional sem atrito, auditoria rigorosa e pagamentos 100% seguros.',
    feature1Title: 'Exportadores Tier-1 Verificados',
    feature1Desc: 'Fornecedores auditados presencialmente, certificados ISO/CE e licenças de exportação válidas.',
    feature2Title: 'Distribuição Direta de RFQs',
    feature2Desc: 'Envie suas especificações e receba cotações detalhadas FOB/CIF em menos de 2 horas.',
    feature3Title: 'Custódia Escrow Multimoeda',
    feature3Desc: 'Seus recursos ficam protegidos até a conferência do conhecimento de embarque e inspeção SGS.',
    feature4Title: 'Corredores Comerciais Estratégicos',
    feature4Desc: 'Rotas diretas para Port of Los Angeles, Jebel Ali, Hamburgo, Santos e Xangai.',

    corridorTitle: 'Corredores Comerciais Globais Estratégicos',
    corridorSubtitle: 'Tarifas em tempo real, métricas mensais de contêineres e desembaraço aduaneiro expresso.',
    corridorViewDetails: 'Explorar Logística Portuária',
    corridorStatLabel: 'Tempo de Desembaraço',
    corridorTopCommodities: 'Principais Mercadorias Negociadas',

    rfqStep1Title: '1. Especificações do Produto',
    rfqStep2Title: '2. Envio e Porto de Destino',
    rfqStep3Title: '3. Dados de Contato do Comprador',
    rfqProductNameLabel: 'Qual produto você deseja comprar?',
    rfqQuantityLabel: 'Quantidade e unidade (ex: 5.000 TM)',
    rfqCategoryLabel: 'Setor Industrial',
    rfqIncotermLabel: 'Incoterm Preferido',
    rfqDestinationLabel: 'Porto / País de Destino (ex: Porto de Santos)',
    rfqSpecsLabel: 'Especificações técnicas e padrões de qualidade',
    rfqCompanyLabel: 'Nome da Empresa',
    rfqContactLabel: 'Nome do Responsável',
    rfqEmailLabel: 'E-mail Corporativo',
    rfqPhoneLabel: 'WhatsApp / Telefone (com DDI)',
    rfqNextBtn: 'Continuar para a Próxima Etapa',
    rfqSubmitBtn: 'Transmitir RFQ para mais de 5.000 Fábricas Verificadas',
    rfqSuccessTitle: 'RFQ Transmitida com Sucesso!',
    rfqSuccessSubtitle: 'Sua solicitação está ativa. Fornecedores qualificados entrarão em contato diretamente.',
    rfqResetBtn: 'Publicar Outro Requisito de Compra',

    statsVolume: 'US$ 4,2 Bilhões+',
    statsVolumeLabel: 'Volume Transacionado',
    statsSuppliers: '85.000+',
    statsSuppliersLabel: 'Fábricas Exportadoras Auditadas',
    statsCountries: '180+',
    statsCountriesLabel: 'Portos Ativos no Mundo',
    statsSpeed: '< 2 Horas',
    statsSpeedLabel: 'Tempo Médio de Resposta',

    categoriesHeading: 'Principais Setores de Compras Internacionais',
    categoriesSubheading: 'Acesse fabricantes certificados e grandes exportadores nas indústrias essenciais.',
    catAgri: 'Agronegócio & Commodities Alimentícias',
    catApparel: 'Têxtil, Confecção & Tecidos',
    catPpe: 'Equipamentos de Proteção EPI & Médico',
    catMachinery: 'Máquinas Industriais & Peças CNC',
    catFurniture: 'Móveis Comerciais & Construção',
    catChemicals: 'Petroquímica & Polímeros Plásticos',

    productsSectionTitle: 'Produtos de Fábrica Auditados e Atacado Global',
    productsSectionSubtitle: 'Compre diretamente de indústrias certificadas com preços FOB/CIF escalonados e entrega garantida.',
    viewAllProducts: 'Ver Todos os Produtos',
    contactSupplier: 'Falar com Fornecedor',
    requestQuotation: 'Solicitar Cotação Imediata',
    verifiedFactory: 'Fábrica Verificada',
    moq: 'Pedido Mínimo (MOQ)',
    fobPrice: 'Preço FOB',
    inStock: 'Em Estoque',

    liveFeedTitle: 'Feed em Tempo Real de Demandas de Compra B2B',
    liveFeedSubtitle: 'Cotações em tempo real, licitações verificadas e pedidos urgentes do mundo inteiro.',
    liveTickerBadge: 'Oportunidades em Tempo Real',
    postedBy: 'Publicado por',
    viewRfqDetails: 'Ver Detalhes',
    submitProposal: 'Enviar Proposta',

    reviewsTitle: 'Recomendado por mais de 125.000 Importadores e Exportadores',
    reviewsSubtitle: 'Depoimentos reais de tradings, diretores de suprimentos e indústrias exportadoras.',
    trustScore: 'Classificação de Confiança 4.9/5.0 em 18.400+ operações',
    verifiedTrader: 'Operador Global Verificado',

    footerAbout: 'Sobre a Trade Heaven',
    footerAboutText: 'A Trade Heaven é o marketplace B2B líder que conecta indústrias auditadas e importadores sob custódia bancária segura.',
    footerSourcing: 'Ferramentas de Compra & RFQ',
    footerSuppliers: 'Fábricas e Fornecedores',
    footerLegal: 'Segurança & Termos Legais',
    footerNewsletterTitle: 'Inteligência de Comércio Global',
    footerNewsletterSubtitle: 'Receba semanalmente cotações de commodities, tarifas alfandegárias e demandas ativas.',
    footerSubscribeBtn: 'Assinar Gratuitamente',
    footerRights: 'Todos os direitos reservados. Garantia escrow e auditoria industrial.',
    escrowGuaranteed: '100% Custódia Escrow e Qualidade SGS Garantida',

    ctaTitle: 'Pronto para Expandir suas Importações e Exportações no Atacado?',
    ctaSubtitle: 'Junte-se a mais de 125.000 profissionais de comércio exterior que negociam com total segurança.',
    ctaButtonBuyer: 'Publicar Demanda de Compra Grátis',
    ctaButtonSupplier: 'Cadastrar-se como Exportador Verificado'
  },

  ru: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',




















    brandTagline: 'Международная оптовая B2B-платформа и торговый эскроу-сервис',
    sourceProducts: 'Закупка товаров (Покупателям)',
    sellGlobally: 'Экспорт товаров (Поставщикам)',
    postRfq: 'Бесплатный запрос RFQ',
    postBuyRfq: 'Разместить заявку RFQ',
    searchPlaceholder: 'Поиск товаров, кодов ТН ВЭД, фабрик...',
    allCategories: 'Все категории',
    verifiedSuppliers: 'Проверенные поставщики',
    activeBuyers: 'Активные покупатели',
    globalPorts: 'Мировые порты',
    tradeProtection: 'Эскроу-депонирование и инспекция SGS',
    freeQuote: 'Получить расчет стоимости',
    exploreCatalog: 'Каталог продукции',
    home: 'Главная',
    aboutUs: 'О нас',
    trustSafety: 'Безопасность и гарантии',
    newsInsights: 'Новости и аналитика',
    premiumServices: 'Премиум-услуги',
    buyers: 'Покупатели',
    suppliers: 'Поставщики',
    menu: 'Меню',
    signIn: 'Войти',
    registerFree: 'Регистрация',
    signOut: 'Выйти',
    tradeAssurance: '100% Защита сделок и торговая гарантия',

    heroBadge: '180+ мировых портов • 125 000+ активных оптовых покупателей',
    heroTitle1: 'Новое поколение',
    heroTitleGradient: 'международного B2B-рынка',
    heroTitle2: 'и трансграничных оптовых поставок.',
    heroSubtitle: 'Прямое соединение проверенных производителей, экспортеров и импортеров с мгновенной рассылкой RFQ, прозрачными ценами FOB/CIF и защитой платежей через эскроу.',
    heroSearchBtn: 'Найти предложения',
    heroCategoryAll: 'Все отрасли',
    searchProductsTab: 'Товары',
    searchSuppliersTab: 'Проверенные заводы',
    searchRfqsTab: 'Прямые RFQ-запросы',
    searchToolsTab: 'Инструменты ВЭД',
    searchOmniPlaceholder: 'Поиск товаров, сырья, заводов, RFQ или калькулятора Инкотермс...',
    searchRfqPlaceholder: 'Поиск по 1 200+ активным RFQ: по товару, порту, Инкотермс...',
    searchSupplierPlaceholder: 'Поиск проверенных заводов, сертификатов и стран...',
    findDeals: 'Найти оптовые сделки',
    verifiedSectors: 'Все проверенные отрасли',
    liveMatches: 'совпадений',
    popularSearches: 'Популярные запросы',

    featuresTitle: 'Почему мировые экспортеры выбирают Trade Heaven',
    featuresSubtitle: 'Создано для бесперебойной международной торговли, верификации контрагентов и безопасных расчетов.',
    feature1Title: 'Проверенные экспортеры Tier-1',
    feature1Desc: 'Все поставщики проходят аудит на производстве, проверку сертификатов ISO/CE и экспортных лицензий.',
    feature2Title: 'Прямая рассылка запросов RFQ',
    feature2Desc: 'Отправьте спецификацию один раз и получите конкурентные предложения FOB/CIF в течение 2 часов.',
    feature3Title: 'Мультивалютный эскроу-сервис',
    feature3Desc: 'Средства депонируются до момента проверки коносамента и отчета независимой инспекции SGS.',
    feature4Title: 'Стратегические торговые коридоры',
    feature4Desc: 'Оптимальные маршруты доставки в порты Лос-Анджелеса, Джебель-Али, Гамбурга, Нава-Шева и Шанхая.',

    corridorTitle: 'Стратегические глобальные торговые коридоры',
    corridorSubtitle: 'Тарифы в реальном времени, ежемесячный объем контейнерооборота и экспресс-оформление.',
    corridorViewDetails: 'Логистика и порты',
    corridorStatLabel: 'Срок обработки',
    corridorTopCommodities: 'Основные экспортируемые товары',

    rfqStep1Title: '1. Спецификация товара',
    rfqStep2Title: '2. Логистика и порт назначения',
    rfqStep3Title: '3. Контактные данные покупателя',
    rfqProductNameLabel: 'Какой товар вы планируете закупить?',
    rfqQuantityLabel: 'Объем и единица измерения (напр. 5 000 т)',
    rfqCategoryLabel: 'Отрасль промышленности',
    rfqIncotermLabel: 'Условия поставки (Incoterms)',
    rfqDestinationLabel: 'Порт / страна назначения (напр. Порт Роттердам)',
    rfqSpecsLabel: 'Технические требования и стандарты качества',
    rfqCompanyLabel: 'Название компании',
    rfqContactLabel: 'Контактное лицо',
    rfqEmailLabel: 'Рабочий Email',
    rfqPhoneLabel: 'WhatsApp / Телефон (с кодом страны)',
    rfqNextBtn: 'Перейти к следующему шагу',
    rfqSubmitBtn: 'Разослать RFQ более чем 5 000 проверенным заводам',
    rfqSuccessTitle: 'Запрос RFQ успешно отправлен!',
    rfqSuccessSubtitle: 'Ваш запрос опубликован. Аккредитованные заводы свяжутся с вами напрямую.',
    rfqResetBtn: 'Создать новый запрос на покупку',

    statsVolume: '$4.2+ Млрд',
    statsVolumeLabel: 'Объем завершенных сделок',
    statsSuppliers: '85 000+',
    statsSuppliersLabel: 'Проверенных заводов-экспортеров',
    statsCountries: '180+',
    statsCountriesLabel: 'Активных портов назначения',
    statsSpeed: '< 2 часов',
    statsSpeedLabel: 'Среднее время отклика поставщиков',

    categoriesHeading: 'Ключевые отрасли международных закупок',
    categoriesSubheading: 'Прямой доступ к сертифицированным производителям и ведущим экспортерам.',
    catAgri: 'Сельское хозяйство и продовольствие',
    catApparel: 'Текстиль, одежда и ткани',
    catPpe: 'СИЗ, средства защиты и медтехника',
    catMachinery: 'Промышленное оборудование и детали ЧПУ',
    catFurniture: 'Коммерческая мебель и фурнитура',
    catChemicals: 'Нефтехимия и полимерное сырье',

    productsSectionTitle: 'Проверенная продукция от заводов и крупный опт',
    productsSectionSubtitle: 'Закупки напрямую у проверенных производств с градацией цен FOB/CIF и гарантией сроков.',
    viewAllProducts: 'Смотреть все товары',
    contactSupplier: 'Связаться с заводом',
    requestQuotation: 'Запросить расчет цены',
    verifiedFactory: 'Проверенный завод',
    moq: 'Мин. партия (MOQ)',
    fobPrice: 'Цена FOB',
    inStock: 'В наличии',

    liveFeedTitle: 'Прямой поток B2B-запросов и тендеров со всего мира',
    liveFeedSubtitle: 'Актуальные оптовые заявки, проверенные тендеры и срочные закупки в реальном времени.',
    liveTickerBadge: 'Свежие заявки',
    postedBy: 'Заказчик',
    viewRfqDetails: 'Подробнее',
    submitProposal: 'Отправить коммерческое предложение',

    reviewsTitle: 'Выбор более 125 000 импортеров и экспортеров по всему миру',
    reviewsSubtitle: 'Отзывы международных торговых домов, директоров по закупкам и заводов-экспортеров.',
    trustScore: 'Рейтинг надежности 4.9/5.0 на основе 18 400+ сделок',
    verifiedTrader: 'Проверенный участник ВЭД',

    footerAbout: 'О платформе Trade Heaven',
    footerAboutText: 'Trade Heaven — ведущая цифровая B2B-платформа, соединяющая проверенных производителей и импортеров с гарантией эскроу-депонирования.',
    footerSourcing: 'Инструменты закупок и RFQ',
    footerSuppliers: 'Заводы и поставщики',
    footerLegal: 'Безопасность и правовая база',
    footerNewsletterTitle: 'Аналитика мировой торговли',
    footerNewsletterSubtitle: 'Еженедельный дайджест цен на сырье, таможенных изменений и актуальных заявок на закупку.',
    footerSubscribeBtn: 'Подписаться',
    footerRights: 'Все права защищены. Банковское депонирование и аудит заводов.',
    escrowGuaranteed: '100% Защита через эскроу и гарантия качества SGS',

    ctaTitle: 'Готовы масштабировать международные оптовые поставки?',
    ctaSubtitle: 'Присоединяйтесь к 125 000+ специалистам ВЭД и заводам, торгующим с полной защитой.',
    ctaButtonBuyer: 'Разместить заявку на закупку',
    ctaButtonSupplier: 'Стать проверенным поставщиком'
  },

  ja: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'グローバルB2B卸売マーケットプレイス＆貿易エスクロー決済',
    sourceProducts: '商品を調達する（バイヤー）',
    sellGlobally: '世界へ輸出する（サプライヤー）',
    postRfq: '無料見積依頼（RFQ）を投稿',
    postBuyRfq: '調達案件（RFQ）を投稿',
    searchPlaceholder: '商品名、HSコード、工場名を検索...',
    allCategories: '全産業カテゴリー',
    verifiedSuppliers: '認証サプライヤー',
    activeBuyers: 'アクティブバイヤー',
    globalPorts: '世界主要港湾',
    tradeProtection: 'エスクロー資金保全＆SGS品質検査',
    freeQuote: '即時見積を取得',
    exploreCatalog: '製品カタログを見る',
    home: 'ホーム',
    aboutUs: '会社概要',
    trustSafety: '信頼と安全',
    newsInsights: '最新ニュース＆知見',
    premiumServices: 'プレミアム',
    buyers: 'バイヤー',
    suppliers: 'サプライヤー',
    menu: 'メニュー',
    signIn: 'ログイン',
    registerFree: '無料会員登録',
    signOut: 'ログアウト',
    tradeAssurance: '100% 取引保証・エスクロー保護',

    heroBadge: '世界180以上の主要港湾 • 125,000社以上のアクティブ卸売バイヤー',
    heroTitle1: '次世代のデジタル',
    heroTitleGradient: 'グローバルB2B貿易',
    heroTitle2: '＆越境調達プラットフォーム',
    heroSubtitle: '世界中の厳選された製造工場、輸出企業、卸売バイヤーを直結。RFQ即時配信、透明性の高いFOB/CIF価格、安全なエスクロー決済を提供します。',
    heroSearchBtn: '案件を検索',
    heroCategoryAll: '全カテゴリー',
    searchProductsTab: '取扱製品',
    searchSuppliersTab: '認証製造工場',
    searchRfqsTab: '最新RFQ案件',
    searchToolsTab: '貿易ツール',
    searchOmniPlaceholder: '製品、原材料、工場、RFQ案件、インコタームズツールを検索...',
    searchRfqPlaceholder: '1,200件以上の調達案件を製品・港・条件から検索...',
    searchSupplierPlaceholder: '認証工場、輸出企業、ISO認証、国名から検索...',
    findDeals: '卸売案件を探す',
    verifiedSectors: '全認証産業セクター',
    liveMatches: '件の一致',
    popularSearches: '人気の検索キーワード',

    featuresTitle: '世界中の輸出企業・調達部門がTrade Heavenを選ぶ理由',
    featuresSubtitle: '国際取引の円滑化、工場認証の可視化、リスクゼロの決済基盤を提供します。',
    feature1Title: '厳選されたTier-1輸出工場',
    feature1Desc: '現地工場監査、ISO/CE規格認証、正規輸出ライセンスを完全確認済み。',
    feature2Title: 'RFQ即時ブロードキャスト',
    feature2Desc: '仕様書を1度送信するだけで、2時間以内に複数の優良工場から詳細なFOB/CIF見積が届きます。',
    feature3Title: '多通貨エスクロー決済保護',
    feature3Desc: '船荷証券（B/L）および第三者SGS検査報告書の確認が完了するまで代金を安全に保全。',
    feature4Title: '戦略的グローバル航路',
    feature4Desc: 'ロサンゼルス港、ジュベル・アリ、ハンブルク、インドJNPT、上海港へ直結。',

    corridorTitle: '主要な国際貿易回廊と港湾ロジスティクス',
    corridorSubtitle: '主要海運ルートの関税データ、月間コンテナ取扱量、迅速通関ステータスをリアルタイム表示。',
    corridorViewDetails: '港湾物流の詳細を見る',
    corridorStatLabel: '通関リードタイム',
    corridorTopCommodities: '主要取引品目',

    rfqStep1Title: '1. 製品仕様と調達要件',
    rfqStep2Title: '2. 輸送と仕向港',
    rfqStep3Title: '3. バイヤー企業連絡先',
    rfqProductNameLabel: '調達したい製品名は何ですか？',
    rfqQuantityLabel: '目標調達数量と単位（例: 5,000 メトリックトン）',
    rfqCategoryLabel: '産業分野',
    rfqIncotermLabel: '希望インコタームズ (Incoterms)',
    rfqDestinationLabel: '仕向港 / 国（例: ロッテルダム港 / 東京港）',
    rfqSpecsLabel: '詳細な技術仕様と品質基準',
    rfqCompanyLabel: '企業名・法人名',
    rfqContactLabel: 'ご担当者様氏名',
    rfqEmailLabel: '法人メールアドレス',
    rfqPhoneLabel: 'WhatsApp / 電話番号（国番号付き）',
    rfqNextBtn: '次のステップへ進む',
    rfqSubmitBtn: '世界5,000社以上の認証サプライヤーへ一斉配信',
    rfqSuccessTitle: '調達案件（RFQ）の配信が完了しました！',
    rfqSuccessSubtitle: '調達案件が世界中のサプライヤーに公開されました。認証工場より直接ご連絡いたします。',
    rfqResetBtn: '別の調達要件を投稿する',

    statsVolume: '42億ドル以上',
    statsVolumeLabel: '成約越境取引高',
    statsSuppliers: '85,000社以上',
    statsSuppliersLabel: '認証輸出製造工場',
    statsCountries: '180港以上',
    statsCountriesLabel: 'アクティブ仕向港',
    statsSpeed: '2時間以内',
    statsSpeedLabel: '平均サプライヤー初回応答時間',

    categoriesHeading: '主要な国際大口調達セクター',
    categoriesSubheading: '主要産業分野における大規模生産工場や認証輸出企業を検索。',
    catAgri: '農業・食品コモディティ',
    catApparel: '繊維・アパレル・生地',
    catPpe: '安全衛生・PPE・医療機器',
    catMachinery: '産業機械・CNC工作機械部品',
    catFurniture: '商業家具・オフィス建材',
    catChemicals: '石油化学・ポリマー・化成品原料',

    productsSectionTitle: '認証工場直販製品＆ボリュームディスカウント卸売',
    productsSectionSubtitle: '監査済み工場からFOB/CIF階層価格と厳守される納期で直接調達。',
    viewAllProducts: 'すべての製品を見る',
    contactSupplier: '工場に問い合わせる',
    requestQuotation: '即時見積を依頼',
    verifiedFactory: '認証製造工場',
    moq: '最小発注数量 (MOQ)',
    fobPrice: 'FOB参考価格',
    inStock: '在庫あり',

    liveFeedTitle: 'リアルタイム グローバルB2B調達案件フィード',
    liveFeedSubtitle: '世界180カ国以上から発信される大口調達、入札案件、緊急見積依頼をリアルタイム表示。',
    liveTickerBadge: 'リアルタイム案件',
    postedBy: '投稿バイヤー',
    viewRfqDetails: '詳細を見る',
    submitProposal: '見積提案を提出',

    reviewsTitle: '世界125,000社以上の認証バイヤー＆輸出企業から支持',
    reviewsSubtitle: '国際商社、調達統括部門、一流製造企業からの評価とフィードバック。',
    trustScore: '取引信頼度スコア 4.9/5.0（18,400件以上の取引実績）',
    verifiedTrader: '認証国際貿易事業者',

    footerAbout: 'Trade Heavenについて',
    footerAboutText: 'Trade Heavenは、認証工場と世界のバイヤーを強固なエスクロー資金保全で結ぶグローバルB2Bマーケットプレイスです。',
    footerSourcing: '調達・RFQツール',
    footerSuppliers: '製造工場・サプライヤー',
    footerLegal: '信頼・安全・利用規約',
    footerNewsletterTitle: 'グローバル貿易インテリジェンス',
    footerNewsletterSubtitle: '国際コモディティ市況、関税の最新動向、高額バイヤー案件を週刊でお届けします。',
    footerSubscribeBtn: '無料購読',
    footerRights: '無断転載を禁じます。エスクロー資金保全および工場実地監査確認済み。',
    escrowGuaranteed: '100% エスクロー資金保全＆SGS品質保証',

    ctaTitle: '国際卸売・貿易ビジネスを拡大する準備はできましたか？',
    ctaSubtitle: '安全に取引を行う世界125,000社以上の調達担当者や製造工場ネットワークに今すぐ参加しましょう。',
    ctaButtonBuyer: '無料で調達案件を投稿する',
    ctaButtonSupplier: '認証サプライヤーとして登録'
  },

  hi: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'ग्लोबल B2B थोक व्यापार बाज़ार और ट्रेड एस्क्रो भुगतान सुरक्षा',
    sourceProducts: 'उत्पाद सोर्स करें (खरीदार)',
    sellGlobally: 'वैश्विक स्तर पर बेचें (आपूर्तिकर्ता)',
    postRfq: 'मुफ़्त RFQ मांग दर्ज करें',
    postBuyRfq: 'खरीद मांग दर्ज करें',
    searchPlaceholder: 'उत्पाद, एचएस कोड, कारखाने खोजें...',
    allCategories: 'सभी श्रेणियां',
    verifiedSuppliers: 'सत्यापित आपूर्तिकर्ता',
    activeBuyers: 'सक्रिय खरीदार',
    globalPorts: 'ग्लोबल बंदरगाह',
    tradeProtection: 'एस्क्रो फंड सुरक्षा और SGS गुणवत्ता निरीक्षण',
    freeQuote: 'तत्काल कोटेशन प्राप्त करें',
    exploreCatalog: 'उत्पाद कैटलॉग देखें',
    home: 'होम',
    aboutUs: 'हमारे बारे में',
    trustSafety: 'सुरक्षा और विश्वास',
    newsInsights: 'व्यापार समाचार',
    premiumServices: 'प्रीमियम सेवाएं',
    buyers: 'खरीदार',
    suppliers: 'आपूर्तिकर्ता',
    menu: 'मेन्यू',
    signIn: 'साइन इन',
    registerFree: 'मुफ़्त पंजीकरण',
    signOut: 'साइन आउट',
    tradeAssurance: '100% व्यापार सुरक्षा और ट्रेड एश्योरेंस',

    heroBadge: '180+ वैश्विक बंदरगाह • 125,000+ सक्रिय थोक खरीदार',
    heroTitle1: 'अगली पीढ़ी का',
    heroTitleGradient: 'ग्लोबल B2B थोक बाज़ार',
    heroTitle2: 'और अंतर्राष्ट्रीय सोर्सिंग प्लेटफ़ॉर्म।',
    heroSubtitle: 'प्रमाणित निर्माताओं, निर्यातकों और थोक खरीदारों को डायरेक्ट RFQ ब्रॉडकास्टिंग, पारदर्शी FOB/CIF कीमतों और ट्रेड एस्क्रो सुरक्षा से जोड़ता है।',
    heroSearchBtn: 'सौदा खोजें',
    heroCategoryAll: 'सभी क्षेत्र',
    searchProductsTab: 'उत्पाद',
    searchSuppliersTab: 'सत्यापित कारखाने',
    searchRfqsTab: 'लाइव RFQs',
    searchToolsTab: 'ट्रेड टूल्स',
    searchOmniPlaceholder: 'उत्पाद, सामग्री, कारखाने, RFQ या इनकोटर्म्स टूल खोजें...',
    searchRfqPlaceholder: 'उत्पाद, बंदरगाह, इनकोटर्म्स द्वारा 1,200+ सक्रिय RFQ खोजें...',
    searchSupplierPlaceholder: 'सत्यापित कारखाने, प्रमाणपत्र और देश खोजें...',
    findDeals: 'थोक सौदे खोजें',
    verifiedSectors: 'सभी सत्यापित उद्योग',
    liveMatches: 'परिणाम',
    popularSearches: 'लोकप्रिय खोजें',

    featuresTitle: 'दुनिया भर के निर्यातक Trade Heaven को क्यों चुनते हैं',
    featuresSubtitle: 'सुलभ अंतर्राष्ट्रीय व्यापार, सत्यापित प्रमाणपत्रों और जोखिम-मुक्त लेनदेन के लिए निर्मित।',
    feature1Title: 'सत्यापित Tier-1 निर्यातक कारखाने',
    feature1Desc: 'सभी आपूर्तिकर्ता ऑन-साइट फैक्ट्री ऑडिट, ISO/CE प्रमाणपत्रों और निर्यात लाइसेंस से जांचे गए हैं।',
    feature2Title: 'डायरेक्ट RFQ ब्रॉडकास्टिंग',
    feature2Desc: 'अपनी आवश्यकताएं दर्ज करें और 2 घंटे के भीतर प्रतिस्पर्धी FOB/CIF कोटेशन प्राप्त करें।',
    feature3Title: 'मल्टी-करेंसी एस्क्रो सुरक्षा',
    feature3Desc: 'बिल ऑफ लैडिंग और SGS गुणवत्ता निरीक्षण रिपोर्ट सत्यापित होने तक आपका भुगतान सुरक्षित रहता है।',
    feature4Title: 'रणनीतिक ट्रेड कॉरिडोर',
    feature4Desc: 'लॉस एंजिल्स, जेबेल अली, हैम्बर्ग, न्हावा शेवा और शंघाई बंदरगाहों के लिए समर्पित शिपिंग रूट्स।',

    corridorTitle: 'रणनीतिक ग्लोबल ट्रेड कॉरिडोर',
    corridorSubtitle: 'प्रमुख समुद्री मार्गों पर रीयल-टाइम टैरिफ डेटा, मासिक वॉल्यूम और एक्सप्रेस क्लीयरेंस।',
    corridorViewDetails: 'बंदरगाह लॉजिस्टिक्स देखें',
    corridorStatLabel: 'क्लीयरेंस समय',
    corridorTopCommodities: 'प्रमुख व्यापारिक वस्तुएं',

    rfqStep1Title: '1. उत्पाद विनिर्देश और आवश्यकताएं',
    rfqStep2Title: '2. शिपिंग और गंतव्य बंदरगाह',
    rfqStep3Title: '3. खरीदार संपर्क विवरण',
    rfqProductNameLabel: 'आप क्या उत्पाद सोर्स करना चाहते हैं?',
    rfqQuantityLabel: 'मात्रा और इकाई (उदा. 5,000 मीट्रिक टन)',
    rfqCategoryLabel: 'उद्योग क्षेत्र',
    rfqIncotermLabel: 'पसंदीदा इनकोटर्म (Incoterms)',
    rfqDestinationLabel: 'गंतव्य बंदरगाह / देश (उदा. न्हावा शेवा बंदरगाह)',
    rfqSpecsLabel: 'तकनीकी विनिर्देश और गुणवत्ता मानक',
    rfqCompanyLabel: 'कंपनी / फर्म का नाम',
    rfqContactLabel: 'संपर्क व्यक्ति का नाम',
    rfqEmailLabel: 'बिजनेस ईमेल आईडी',
    rfqPhoneLabel: 'व्हाट्सएप / फोन (कंट्री कोड के साथ)',
    rfqNextBtn: 'अगले चरण पर जाएं',
    rfqSubmitBtn: '5,000+ सत्यापित कारखानों को RFQ भेजें',
    rfqSuccessTitle: 'खरीद मांग (RFQ) सफलतापूर्वक दर्ज की गई!',
    rfqSuccessSubtitle: 'आपकी मांग लाइव है। सत्यापित आपूर्तिकर्ता जल्द ही आपकी खरीद टीम से संपर्क करेंगे।',
    rfqResetBtn: 'एक और खरीद मांग दर्ज करें',

    statsVolume: '$4.2 अरब+',
    statsVolumeLabel: 'कुल संपन्न व्यापार वॉल्यूम',
    statsSuppliers: '85,000+',
    statsSuppliersLabel: 'सत्यापित निर्यातक कारखाने',
    statsCountries: '180+',
    statsCountriesLabel: 'सक्रिय गंतव्य बंदरगाह',
    statsSpeed: '< 2 घंटे',
    statsSpeedLabel: 'आपूर्तिकर्ता औसत प्रतिक्रिया समय',

    categoriesHeading: 'शीर्ष अंतर्राष्ट्रीय थोक खरीद क्षेत्र',
    categoriesSubheading: 'प्रमुख उद्योगों में प्रमाणित निर्माताओं और बड़े निर्यातकों से सीधे जुड़ें।',
    catAgri: 'कृषि और खाद्य कमोडिटी',
    catApparel: 'कपड़ा, परिधान और यार्न',
    catPpe: 'सुरक्षा उपकरण, पीपीई और मेडिकल',
    catMachinery: 'औद्योगिक मशीनरी और सीएनसी पार्ट्स',
    catFurniture: 'वाणिज्यिक फर्नीचर और फिटिंग्स',
    catChemicals: 'पेट्रोकेमिकल्स और पॉलिमर कच्चा माल',

    productsSectionTitle: 'सत्यापित फैक्ट्री डायरेक्ट उत्पाद और बल्क थोक बिक्री',
    productsSectionSubtitle: 'सत्यापित कारखानों से स्तरीय FOB/CIF मूल्य और समयबद्ध डिलीवरी के साथ सीधे खरीदें।',
    viewAllProducts: 'सभी उत्पाद देखें',
    contactSupplier: 'आपूर्तिकर्ता से संपर्क करें',
    requestQuotation: 'तत्काल कोटेशन मांगें',
    verifiedFactory: 'सत्यापित कारखाना',
    moq: 'न्यूनतम ऑर्डर मात्रा (MOQ)',
    fobPrice: 'FOB संदर्भ मूल्य',
    inStock: 'स्टॉक में उपलब्ध',

    liveFeedTitle: 'रीयल-टाइम ग्लोबल B2B ट्रेड और RFQ फीड',
    liveFeedSubtitle: 'दुनिया भर से लाइव थोक मांगें, सत्यापित टेंडर और त्वरित खरीद आवश्यकताएं।',
    liveTickerBadge: 'लाइव मांगें',
    postedBy: 'दर्जकर्ता',
    viewRfqDetails: 'विवरण देखें',
    submitProposal: 'कोटेशन भेजें',

    reviewsTitle: 'दुनिया भर के 125,000+ सत्यापित व्यापारियों का भरोसा',
    reviewsSubtitle: 'अंतर्राष्ट्रीय ट्रेडिंग हाउसों, खरीद प्रमुखों और निर्यातक कारखानों की समीक्षाएं।',
    trustScore: '18,400+ ट्रेडों पर ट्रस्ट स्कोर 4.9/5.0',
    verifiedTrader: 'सत्यापित ग्लोबल ट्रेडर',

    footerAbout: 'Trade Heaven के बारे में',
    footerAboutText: 'Trade Heaven एक प्रमुख B2B थोक व्यापार मंच है जो प्रमाणित कारखानों और आयातकों को सुरक्षित एस्क्रो के माध्यम से जोड़ता है।',
    footerSourcing: 'सोर्सिंग और RFQ टूल्स',
    footerSuppliers: 'कारखाने और आपूर्तिकर्ता',
    footerLegal: 'सुरक्षा, एस्क्रो और कानूनी नियम',
    footerNewsletterTitle: 'ग्लोबल ट्रेड इंटेलिजेंस',
    footerNewsletterSubtitle: 'साप्ताहिक कमोडिटी मूल्य सूचकांक, कस्टम अपडेट और उच्च मूल्य की मांगें प्राप्त करें।',
    footerSubscribeBtn: 'मुफ़्त सब्सक्राइब करें',
    footerRights: 'सर्वाधिकार सुरक्षित। बैंक एस्क्रो और ऑन-साइट फैक्ट्री ऑडिट प्रमाणित।',
    escrowGuaranteed: '100% एस्क्रो सुरक्षा और SGS गुणवत्ता गारंटी',

    ctaTitle: 'क्या आप अपने अंतर्राष्ट्रीय थोक व्यापार को विस्तार देने के लिए तैयार हैं?',
    ctaSubtitle: 'उन 125,000+ खरीद अधिकारियों और निर्यातकों से जुड़ें जो Trade Heaven पर सुरक्षित व्यापार करते हैं।',
    ctaButtonBuyer: 'मुफ़्त खरीद मांग दर्ज करें',
    ctaButtonSupplier: 'सत्यापित निर्यातक के रूप में पंजीकरण करें'
  },

  tr: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'Küresel B2B Toptan Ticaret Pazarı ve Güvenli Ticaret Emaneti (Escrow)',
    sourceProducts: 'Ürün Tedarik Et (Alıcı)',
    sellGlobally: 'Küresel Satış Yap (Tedarikçi)',
    postRfq: 'Ücretsiz RFQ Talebi Oluştur',
    postBuyRfq: 'Alım Talebi (RFQ) Oluştur',
    searchPlaceholder: 'Emtia, GTİP/HS kodları, fabrikalar ara...',
    allCategories: 'Tüm Kategoriler',
    verifiedSuppliers: 'Onaylı Tedarikçiler',
    activeBuyers: 'Aktif Alıcılar',
    globalPorts: 'Küresel Limanlar',
    tradeProtection: 'Emanet Hesap Güvencesi ve SGS Kalite Denetimi',
    freeQuote: 'Anında Fiyat Teklifi Al',
    exploreCatalog: 'Ürün Kataloğunu İncele',
    home: 'Ana Sayfa',
    aboutUs: 'Hakkımızda',
    trustSafety: 'Güvenlik ve Koruma',
    newsInsights: 'Sektörel Haberler',
    premiumServices: 'Premium Hizmetler',
    buyers: 'Alıcılar',
    suppliers: 'Tedarikçiler',
    menu: 'Menü',
    signIn: 'Giriş Yap',
    registerFree: 'Ücretsiz Kayıt',
    signOut: 'Çıkış',
    tradeAssurance: '%100 Ticaret Güvencesi & Escrow Koruması',

    heroBadge: '180+ Küresel Liman • 125.000+ Aktif Toptan Alıcı',
    heroTitle1: 'Yeni Nesil',
    heroTitleGradient: 'Küresel B2B Pazaryeri',
    heroTitle2: 've Sınır Ötesi Tedarik Platformu.',
    heroSubtitle: 'Onaylı üreticileri, ihracatçıları ve toptan alıcıları doğrudan RFQ yayınlama, şeffaf FOB/CIF fiyatlandırması ve emanet ticaret koruması ile buluşturur.',
    heroSearchBtn: 'Fırsatları Bul',
    heroCategoryAll: 'Tüm Sektörler',
    searchProductsTab: 'Ürünler',
    searchSuppliersTab: 'Onaylı Fabrikalar',
    searchRfqsTab: 'Canlı RFQ Talepleri',
    searchToolsTab: 'Ticaret Araçları',
    searchOmniPlaceholder: 'Ürün, hammadde, fabrika, RFQ veya Incoterms araçları ara...',
    searchRfqPlaceholder: '1.200+ aktif RFQ talebini ürün, liman, Incoterms ile ara...',
    searchSupplierPlaceholder: 'Onaylı fabrikaları, sertifikaları ve ülkeleri ara...',
    findDeals: 'Toptan Fırsatları Keşfet',
    verifiedSectors: 'Tüm Onaylı Sektörler',
    liveMatches: 'eşleşme',
    popularSearches: 'Popüler Aramalar',

    featuresTitle: 'Dünya Genelindeki İhracatçılar Neden Trade Heaven\'ı Seçiyor',
    featuresSubtitle: 'Sorunsuz uluslararası ticaret, doğrulanmış kimlik bilgileri ve risksiz ödemeler için tasarlandı.',
    feature1Title: 'Onaylı 1. Kademe İhracatçılar',
    feature1Desc: 'Tüm tedarikçiler yerinde fabrika denetimi, ISO/CE sertifikaları ve ihracat lisansları ile doğrulanır.',
    feature2Title: 'Doğrudan RFQ Yayını',
    feature2Desc: 'Tedarik şartnamenizi bir kez gönderin; 2 saat içinde detaylı FOB/CIF teklifleri alın.',
    feature3Title: 'Çoklu Para Birimli Escrow Koruması',
    feature3Desc: 'Ödemeleriniz, konşimento ve SGS denetim raporu onaylanana kadar güvenli emanet hesapta tutulur.',
    feature4Title: 'Stratejik Ticaret Koridorları',
    feature4Desc: 'Los Angeles, Cebel Ali, Hamburg, Nhava Sheva ve Şanghay limanlarına optimize edilmiş lojistik hatlar.',

    corridorTitle: 'Stratejik Küresel Ticaret Koridorları',
    corridorSubtitle: 'Önemli deniz yollarında gerçek zamanlı gümrük tarifeleri, aylık hacimler ve hızlı gümrükleme.',
    corridorViewDetails: 'Liman Lojistiğini İncele',
    corridorStatLabel: 'Gümrük Süresi',
    corridorTopCommodities: 'En Çok İşlem Gören Emtialar',

    rfqStep1Title: '1. Ürün Özellikleri',
    rfqStep2Title: '2. Nakliye ve Varış Limanı',
    rfqStep3Title: '3. Alıcı İletişim Bilgileri',
    rfqProductNameLabel: 'Hangi ürünü tedarik etmek istiyorsunuz?',
    rfqQuantityLabel: 'Hedef Miktar ve Birim (örn. 5.000 Ton)',
    rfqCategoryLabel: 'Sanayi Sektörü',
    rfqIncotermLabel: 'Tercih Edilen Teslim Şekli (Incoterm)',
    rfqDestinationLabel: 'Varış Limanı / Ülke (örn. Ambarlı / Rotterdam Limanı)',
    rfqSpecsLabel: 'Teknik Özellikler ve Kalite Standartları',
    rfqCompanyLabel: 'Şirket / Firma Adı',
    rfqContactLabel: 'Yetkili Kişi Adı',
    rfqEmailLabel: 'Kurumsal E-posta Adresi',
    rfqPhoneLabel: 'WhatsApp / Telefon (Ülke kodu ile)',
    rfqNextBtn: 'Sonraki Adıma Geç',
    rfqSubmitBtn: 'RFQ Talebini 5.000+ Onaylı Fabrikaya Gönder',
    rfqSuccessTitle: 'RFQ Alım Talebi Başarıyla Oluşturuldu!',
    rfqSuccessSubtitle: 'Talebiniz yayında. Onaylı tedarikçiler doğrudan satın alma ekibinizle iletişime geçecektir.',
    rfqResetBtn: 'Yeni Bir Alım Talebi Oluştur',

    statsVolume: '4,2+ Milyar Dolar',
    statsVolumeLabel: 'Gerçekleşen Ticaret Hacmi',
    statsSuppliers: '85.000+',
    statsSuppliersLabel: 'Onaylı İhracatçı Fabrika',
    statsCountries: '180+',
    statsCountriesLabel: 'Aktif Varış Limanı',
    statsSpeed: '< 2 Saat',
    statsSpeedLabel: 'Ortalama Tedarikçi Yanıt Süresi',

    categoriesHeading: 'Başlıca Uluslararası Tedarik Sektörleri',
    categoriesSubheading: 'Temel toptan sanayi kollarında sertifikalı üreticilere ve ihracatçılara doğrudan ulaşın.',
    catAgri: 'Tarım ve Gıda Emtiaları',
    catApparel: 'Tekstil, Hazır Giyim ve Kumaş',
    catPpe: 'İş Güvenliği, KKD ve Medikal Ekipman',
    catMachinery: 'Endüstriyel Makineler ve CNC Parçaları',
    catFurniture: 'Ticari Mobilya ve Yapı Elemanları',
    catChemicals: 'Petrokimya ve Plastik Polimerler',

    productsSectionTitle: 'Doğrudan Fabrika Ürünleri ve Toptan Satış',
    productsSectionSubtitle: 'Kademeli FOB/CIF fiyatları ve garantili teslimat süreleri ile denetlenmiş fabrikalardan tedarik edin.',
    viewAllProducts: 'Tüm Ürünleri Gör',
    contactSupplier: 'Tedarikçiyle İletişime Geç',
    requestQuotation: 'Anında Teklif İste',
    verifiedFactory: 'Onaylı Fabrika',
    moq: 'Minimum Sipariş (MOQ)',
    fobPrice: 'FOB Fiyatı',
    inStock: 'Stokta Mevcut',

    liveFeedTitle: 'Canlı B2B Ticaret ve RFQ Akışı',
    liveFeedSubtitle: 'Dünyanın dört bir yanından canlı toptan alım talepleri, onaylı ihaleler ve acil tedarik ilanları.',
    liveTickerBadge: 'Canlı Talepler',
    postedBy: 'Yayınlayan',
    viewRfqDetails: 'Detayları Gör',
    submitProposal: 'Teklif Gönder',

    reviewsTitle: 'Dünya Çapında 125.000+ İthalatçı ve İhracatçının Tercihi',
    reviewsSubtitle: 'Uluslararası dış ticaret şirketleri ve üretici fabrikalardan doğrulanmış referanslar.',
    trustScore: '18.400+ işlemde Güven Puanı 4.9/5.0',
    verifiedTrader: 'Onaylı Küresel Tüccar',

    footerAbout: 'Trade Heaven Hakkında',
    footerAboutText: 'Trade Heaven, onaylı üreticileri ve nitelikli ithalatçıları güvenli emanet hesap (escrow) ile buluşturan lider B2B pazaryeridir.',
    footerSourcing: 'Tedarik & RFQ Araçları',
    footerSuppliers: 'Fabrikalar ve Tedarikçiler',
    footerLegal: 'Güvenlik ve Yasal Koşullar',
    footerNewsletterTitle: 'Küresel Ticaret İstihbaratı',
    footerNewsletterSubtitle: 'Haftalık emtia fiyat endeksleri, gümrük güncellemeleri ve sıcak alım taleplerini alın.',
    footerSubscribeBtn: 'Ücretsiz Abone Ol',
    footerRights: 'Tüm hakları saklıdır. Banka güvenceli emanet ve yerinde fabrika denetimi onaylı.',
    escrowGuaranteed: '%100 Emanet Koruması & SGS Kalite Garantisi',

    ctaTitle: 'Uluslararası Toptan Ticaretinizi Büyütmeye Hazır mısınız?',
    ctaSubtitle: 'Trade Heaven\'da güvenle ticaret yapan 125.000\'den fazla satın alma yetkilisi ve fabrikaya katılın.',
    ctaButtonBuyer: 'Ücretsiz Alım Talebi Oluştur',
    ctaButtonSupplier: 'Onaylı İhracatçı Olarak Kaydol'
  },

  vi: {
    buyerSourcingHub: 'Buyer Sourcing Hub',
    buyLeadsNav: 'Buy Leads',
    postBuyRequirement: 'Post Buy Requirement',
    fullSupplierDirectory: 'Supplier Directory',
    rfqHubNav: 'RFQ Hub',
    incotermsNav: 'Incoterms',
    suppliersExportersHub: 'Suppliers & Exporters Hub',
    workWithUsNav: 'Work With Us',
    postCargoOffer: 'Post Cargo Offer',
    membershipPlans: 'Membership Plans',
    exporterDashboard: 'Exporter Dashboard',
    landingPageNav: 'Landing Page',
    helpDeskHeading: 'Help Desk',
    featuredProducts: 'Featured Products',
    auditedSuppliersHeading: 'Audited Suppliers',
    exploreAllSuppliers: 'Explore All Suppliers',
    factorySize: 'Factory Size',
    viewFactoryAudit: 'View Factory Audit',
    recentBuyLeads: 'Recent Buy Leads',
    viewAllRfqs: 'View All RFQs',
    brandTagline: 'Sàn Giao Dịch B2B Bán Buôn Toàn Cầu & Ký Quỹ Escrow Thương Mại',
    sourceProducts: 'Tìm Nguồn Hàng (Người Mua)',
    sellGlobally: 'Bán Hàng Toàn Cầu (Nhà Cung Cấp)',
    postRfq: 'Đăng Yêu Cầu Báo Giá Miễn Phí',
    postBuyRfq: 'Đăng Yêu Cầu Mua (RFQ)',
    searchPlaceholder: 'Tìm kiếm sản phẩm, mã HS, nhà máy sản xuất...',
    allCategories: 'Tất cả danh mục ngành hàng',
    verifiedSuppliers: 'Nhà cung cấp đã xác minh',
    activeBuyers: 'Người mua đang hoạt động',
    globalPorts: 'Cảng biển quốc tế',
    tradeProtection: 'Bảo lãnh ký quỹ & Giám định chất lượng SGS',
    freeQuote: 'Nhận Báo Giá Nhanh',
    exploreCatalog: 'Xem Danh Mục Sản Phẩm',
    home: 'Trang chủ',
    aboutUs: 'Về chúng tôi',
    trustSafety: 'An toàn & Tin cậy',
    newsInsights: 'Tin tức & Phân tích',
    premiumServices: 'Dịch vụ cao cấp',
    buyers: 'Người mua',
    suppliers: 'Nhà cung cấp',
    menu: 'Menu',
    signIn: 'Đăng nhập',
    registerFree: 'Đăng ký miễn phí',
    signOut: 'Đăng xuất',
    tradeAssurance: '100% Bảo vệ giao dịch & Đảm bảo thương mại',

    heroBadge: '180+ Cảng biển toàn cầu • 125.000+ Người mua bán buôn',
    heroTitle1: 'Thế Hệ Mới Của',
    heroTitleGradient: 'Sàn Thương Mại B2B Toàn Cầu',
    heroTitle2: '& Nền Tảng Nguồn Hàng Xuyên Biên Giới.',
    heroSubtitle: 'Kết nối các nhà máy sản xuất, đơn vị xuất khẩu và người mua sỉ toàn cầu với tính năng phát RFQ trực tiếp, giá FOB/CIF minh bạch và bảo lãnh thanh toán ký quỹ.',
    heroSearchBtn: 'Tìm Cơ Hội',
    heroCategoryAll: 'Tất cả ngành',
    searchProductsTab: 'Sản phẩm',
    searchSuppliersTab: 'Nhà máy xác minh',
    searchRfqsTab: 'Yêu cầu RFQ trực tiếp',
    searchToolsTab: 'Công cụ thương mại',
    searchOmniPlaceholder: 'Tìm sản phẩm, nguyên liệu, nhà máy, RFQ hoặc công cụ Incoterms...',
    searchRfqPlaceholder: 'Tìm trong 1.200+ RFQ theo sản phẩm, cảng, điều kiện Incoterms...',
    searchSupplierPlaceholder: 'Tìm nhà máy xác minh, chứng nhận ISO, quốc gia...',
    findDeals: 'Tìm Giao Dịch Bán Buôn',
    verifiedSectors: 'Tất Cả Ngành Hàng Đã Xác Minh',
    liveMatches: 'kết quả',
    popularSearches: 'Tìm kiếm phổ biến',

    featuresTitle: 'Tại Sao Các Nhà Xuất Khẩu Toàn Cầu Chọn Trade Heaven',
    featuresSubtitle: 'Được thiết kế cho thương mại quốc tế thông suốt, hồ sơ năng lực minh bạch và thanh toán không rủi ro.',
    feature1Title: 'Nhà Xuất Khẩu Hạng 1 Đã Xác Minh',
    feature1Desc: 'Tất cả nhà cung cấp đều qua kiểm tra thực địa, chứng nhận ISO/CE và giấy phép xuất khẩu hợp lệ.',
    feature2Title: 'Phát RFQ Mua Hàng Trực Tiếp',
    feature2Desc: 'Gửi yêu cầu mua hàng một lần và nhận bảng báo giá FOB/CIF chi tiết trong vòng 2 giờ.',
    feature3Title: 'Tài Khoản Ký Quỹ Đa Tiền Tệ (Escrow)',
    feature3Desc: 'Tiền hàng được giữ an toàn tại tài khoản ký quỹ cho đến khi xác nhận vận đơn và biên bản SGS.',
    feature4Title: 'Hành Lang Thương Mại Chiến Lược',
    feature4Desc: 'Tuyến vận tải tối ưu đến Los Angeles, Jebel Ali, Hamburg, Cát Lái và Thượng Hải.',

    corridorTitle: 'Hành Lang Thương Mại & Cảng Biển Chiến Lược',
    corridorSubtitle: 'Biểu thuế quan theo thời gian thực, lưu lượng container hàng tháng và thông quan nhanh.',
    corridorViewDetails: 'Xem Logistics Cảng Biển',
    corridorStatLabel: 'Thời gian thông quan',
    corridorTopCommodities: 'Mặt hàng giao dịch hàng đầu',

    rfqStep1Title: '1. Thông số & Yêu cầu sản phẩm',
    rfqStep2Title: '2. Vận chuyển & Cảng đích',
    rfqStep3Title: '3. Thông tin liên hệ người mua',
    rfqProductNameLabel: 'Bạn cần tìm nguồn hàng gì?',
    rfqQuantityLabel: 'Số lượng mục tiêu & Đơn vị (VD: 5.000 Tấn)',
    rfqCategoryLabel: 'Ngành hàng sản xuất',
    rfqIncotermLabel: 'Điều kiện thương mại mong muốn (Incoterms)',
    rfqDestinationLabel: 'Cảng / Quốc gia đích (VD: Cảng Cát Lái / Hải Phòng)',
    rfqSpecsLabel: 'Yêu cầu kỹ thuật & Tiêu chuẩn chất lượng',
    rfqCompanyLabel: 'Tên Công ty / Doanh nghiệp',
    rfqContactLabel: 'Tên Người liên hệ',
    rfqEmailLabel: 'Email Doanh nghiệp',
    rfqPhoneLabel: 'WhatsApp / Số điện thoại (kèm mã quốc gia)',
    rfqNextBtn: 'Tiếp tục bước tiếp theo',
    rfqSubmitBtn: 'Gửi RFQ đến 5.000+ Nhà máy đã xác minh',
    rfqSuccessTitle: 'Đã gửi yêu cầu báo giá (RFQ) thành công!',
    rfqSuccessSubtitle: 'Yêu cầu của bạn đã lên hệ thống. Các nhà máy phù hợp sẽ liên hệ trực tiếp với bạn.',
    rfqResetBtn: 'Đăng Yêu Cầu Mua Hàng Khác',

    statsVolume: '4,2+ Tỷ USD',
    statsVolumeLabel: 'Tổng kim ngạch giao dịch',
    statsSuppliers: '85.000+',
    statsSuppliersLabel: 'Nhà máy xuất khẩu xác minh',
    statsCountries: '180+',
    statsCountriesLabel: 'Cảng đích quốc tế hoạt động',
    statsSpeed: '< 2 Giờ',
    statsSpeedLabel: 'Thời gian phản hồi trung bình',

    categoriesHeading: 'Các Ngành Mua Hàng Quốc Tế Trọng Điểm',
    categoriesSubheading: 'Kết nối trực tiếp với nhà máy công suất lớn và các nhà xuất khẩu uy tín.',
    catAgri: 'Nông nghiệp & Nông sản Thực phẩm',
    catApparel: 'Dệt may, Trang phục & Sợi vải',
    catPpe: 'Bảo hộ lao động, PPE & Thiết bị y tế',
    catMachinery: 'Máy móc công nghiệp & Phụ tùng CNC',
    catFurniture: 'Nội thất thương mại & Vật liệu',
    catChemicals: 'Hóa chất, Hóa dầu & Hạt nhựa',

    productsSectionTitle: 'Sản Phẩm Trực Tiếp Từ Nhà Máy & Bán Buôn Số Lượng Lớn',
    productsSectionSubtitle: 'Nhập hàng trực tiếp từ các xưởng sản xuất đã kiểm định với giá FOB/CIF theo bậc và cam kết tiến độ.',
    viewAllProducts: 'Xem tất cả sản phẩm',
    contactSupplier: 'Liên hệ nhà cung cấp',
    requestQuotation: 'Nhận báo giá ngay',
    verifiedFactory: 'Nhà máy xác minh',
    moq: 'Số lượng tối thiểu (MOQ)',
    fobPrice: 'Giá FOB tham khảo',
    inStock: 'Có sẵn trong kho',

    liveFeedTitle: 'Luồng Yêu Cầu Mua Hàng & RFQ Quốc Tế Trực Tiếp',
    liveFeedSubtitle: 'Tổng hợp các đơn đặt hàng bán buôn, hồ sơ mời thầu và nhu cầu mua hàng gấp trên toàn thế giới.',
    liveTickerBadge: 'Đơn hàng mới',
    postedBy: 'Đăng bởi',
    viewRfqDetails: 'Xem chi tiết',
    submitProposal: 'Gửi báo giá',

    reviewsTitle: 'Được hơn 125.000 Doanh Nghiệp Xuất Nhập Khẩu Toàn Cầu Tin Dùng',
    reviewsSubtitle: 'Đánh giá thực tế từ các tập đoàn thương mại, giám đốc thu mua và nhà máy xuất khẩu.',
    trustScore: 'Điểm tin cậy 4.9/5.0 trên 18.400+ giao dịch quốc tế',
    verifiedTrader: 'Doanh nghiệp thương mại xác minh',

    footerAbout: 'Về Trade Heaven',
    footerAboutText: 'Trade Heaven là sàn thương mại điện tử B2B hàng đầu kết nối các nhà sản xuất đã kiểm định với người mua quốc tế thông qua tài khoản ký quỹ an toàn.',
    footerSourcing: 'Công cụ tìm nguồn hàng & RFQ',
    footerSuppliers: 'Nhà máy & Nhà cung cấp',
    footerLegal: 'An toàn & Pháp lý',
    footerNewsletterTitle: 'Thông Tin Thị Trường Thương Mại',
    footerNewsletterSubtitle: 'Nhận chỉ số giá cả hàng hóa, cập nhật thuế quan và cơ hội mua hàng hàng tuần.',
    footerSubscribeBtn: 'Đăng ký miễn phí',
    footerRights: 'Bảo lưu mọi quyền. Đã xác minh ký quỹ ngân hàng và kiểm định nhà máy.',
    escrowGuaranteed: '100% Ký quỹ bảo lãnh & Cam kết chất lượng SGS',

    ctaTitle: 'Sẵn Sàng Mở Rộng Hoạt Động Thương Mại Bán Buôn Toàn Cầu?',
    ctaSubtitle: 'Tham gia cùng hơn 125.000 chuyên gia thu mua và nhà máy giao dịch an toàn trên Trade Heaven.',
    ctaButtonBuyer: 'Đăng Yêu Cầu Mua Hàng Miễn Phí',
    ctaButtonSupplier: 'Đăng Ký Làm Nhà Xuất Khẩu Xác Minh'
  }
};
