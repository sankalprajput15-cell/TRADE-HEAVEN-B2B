import { 
  CompanyProfile, 
  CurrencyRate, 
  KycVerificationRecord, 
  NegotiationThread, 
  EscrowTransaction,
  Product, 
  RfqRequirement, 
  SupplierQuote,
  BankAccountDetails,
  PaidClientRecord,
  PaymentTransaction,
  SubscriptionPlanConfig,
  AuthUser,
  UserRole
} from '../types';

export const DEFAULT_USERS: Record<UserRole, AuthUser> = {
  BUYER: {
    id: 'user-buyer-001',
    name: 'David Sterling',
    email: 'david.sterling@sterlingprocure.com',
    companyName: 'Sterling Global Procurement Corp',
    country: 'United States',
    role: 'BUYER',
    status: 'ACTIVE',
    isVerified: true,
    isPremium: false,
    membershipStatus: 'free',
    joinedDate: '2024-03-15',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  SUPPLIER: {
    id: 'user-supp-001',
    name: 'Elena Zhao',
    email: 'elena.zhao@apexmicro.cn',
    companyName: 'Shenzhen Apex Microelectronics Co., Ltd.',
    country: 'China',
    role: 'SUPPLIER',
    status: 'ACTIVE',
    tier: 'GOLD',
    isVerified: true,
    isPremium: false,
    membershipStatus: 'free',
    joinedDate: '2023-08-20',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
  },
  VERIFIER: {
    id: 'user-verif-001',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@tradeheaven-audit.org',
    companyName: 'SGS / TUV Verified Trade Audit Bureau',
    country: 'Germany',
    role: 'VERIFIER',
    status: 'ACTIVE',
    isVerified: true,
    isPremium: false,
    membershipStatus: 'free',
    joinedDate: '2022-11-01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  ADMIN: {
    id: 'user-admin-001',
    name: 'Sarah Jenkins',
    email: 'admin@tradeheaven.net',
    companyName: 'Trade Heaven Global Operations & Treasury',
    country: 'United Kingdom',
    role: 'ADMIN',
    status: 'ACTIVE',
    tier: 'VIP',
    isVerified: true,
    isPremium: true,
    membershipStatus: 'paid',
    joinedDate: '2022-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  }
};

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', symbol: '$', rateToUSD: 1.0, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rateToUSD: 0.92, name: 'Euro' },
  { code: 'GBP', symbol: '£', rateToUSD: 0.79, name: 'British Pound' },
  { code: 'CNY', symbol: '¥', rateToUSD: 7.24, name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', rateToUSD: 84.80, name: 'Indian Rupee' },
  { code: 'AED', symbol: 'AED', rateToUSD: 3.67, name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', rateToUSD: 153.20, name: 'Japanese Yen' }
];

export const CATEGORIES_TREE = [
  {
    id: 'cat-machinery',
    name: 'Industrial Machinery & Automation',
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    subcategories: ['CNC Machining Centers', 'Hydraulic Presses', 'Plastic Injection Molding', 'Laser Cutting Machines', 'Conveyor Systems', 'Robotic Welding Arms'],
    count: '24,800+ Products'
  },
  {
    id: 'cat-automotive',
    name: 'Automotive Parts & Transportation',
    icon: 'Car',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Forged Alloy Wheels', 'Turbochargers & Engine Assemblies', 'Big Brake Kits & Calipers', 'EV Powertrain & BMS', 'Carbon Fiber Aero Kits', 'Automotive Wire Harnesses'],
    count: '38,400+ Products'
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Component PCB',
    icon: 'Radio',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Multilayer PCBs', 'Semiconductors & ICs', 'Lithium LiFePO4 Batteries', 'Sensors & Transducers', 'Power Inverters', 'SMT Surface Mount Assemblies'],
    count: '42,100+ Products'
  },
  {
    id: 'cat-chemicals',
    name: 'Chemicals, Polymers & Resins',
    icon: 'FlaskConical',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Virgin HDPE / Polypropylene', 'Industrial Solvents', 'Titanium Dioxide Pigments', 'Water Treatment Chemicals', 'Specialty Adhesives', 'Agrochemicals'],
    count: '18,300+ Products'
  },
  {
    id: 'cat-textiles',
    name: 'Textiles, Fabrics & Apparel',
    icon: 'Scissors',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Organic Cotton Fabrics', 'Raw Selvedge Denim', 'Technical Workwear', 'Polyester Filament Yarn', 'Non-Woven Geotextiles', 'Home Textile Linens'],
    count: '31,500+ Products'
  },
  {
    id: 'cat-agriculture',
    name: 'Agriculture, Spices & Food Commodities',
    icon: 'Wheat',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Basmati & Jasmine Rice', 'Refined Sunflower Oil', 'Raw Cashew Nuts & Spices', 'Green Coffee Beans', 'Frozen Seafood', 'Organic Fertilizer'],
    count: '15,900+ Products'
  },
  {
    id: 'cat-medical',
    name: 'Medical Devices & Healthcare',
    icon: 'Stethoscope',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Surgical Instruments', 'Hospital Beds & Equipment', 'Nitrile Examination Gloves', 'Diagnostic Test Kits', 'Orthopedic Titanium Implants', 'Dental Units'],
    count: '12,400+ Products'
  },
  {
    id: 'cat-renewable',
    name: 'Renewable Energy & Solar',
    icon: 'Sun',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Monocrystalline Solar Panels', 'Hybrid Solar Inverters', 'Commercial ESS Battery Packs', 'Wind Turbine Generators', 'EV Fast Charging Stations', 'Solar Water Heaters'],
    count: '9,700+ Products'
  },
  {
    id: 'cat-packaging',
    name: 'Packaging, Paper & Logistics',
    icon: 'Box',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Corrugated Shipping Cartons', 'Biodegradable Mailers', 'Glass Cosmetic Bottles', 'Aluminum Can Packaging', 'Custom Printed Stand-Up Pouches', 'Stretch Film Rolls'],
    count: '14,200+ Products'
  }
];

export const MOCK_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-hans-cnc',
    companyName: 'KUKA Precision Engineering GmbH',
    legalRegistrationNumber: 'DE-HRB-984210',
    country: 'Germany',
    city: 'Stuttgart',
    address: 'Industriestraße 45, 70565 Stuttgart',
    establishedYear: 1994,
    businessType: 'Manufacturer',
    tier: 'VIP',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-01-15',
    trustScore: 99,
    responseRate: '99.2%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '500-1000',
    annualRevenueUsd: '$85M - $120M',
    mainMarkets: ['Western Europe', 'North America', 'Middle East', 'Japan'],
    certifications: ['ISO 9001:2015', 'CE Marking', 'TÜV Rheinland Certified', 'RoHS Compliance'],
    factorySizeSqM: 45000,
    productionLines: 12,
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    description: 'Premier European manufacturer of 5-Axis CNC milling machines, precision laser cutting centers, and robotic assembly cells with over 30 years of industrial export excellence.',
    contactPerson: 'Dr. Klaus Becker (VP International Sales)',
    contactEmail: 'export@kuka-precision.de',
    contactPhone: '+49 711 9842 100',
    tradeAssuranceLimitUsd: 1500000,
    completedOrdersCount: 412
  },
  {
    id: 'comp-apex-motorsport',
    companyName: 'Apex Dynamics Motorsport & Forgings Inc.',
    legalRegistrationNumber: 'US-DEL-5892104',
    country: 'United States',
    city: 'Indianapolis / Los Angeles',
    address: '4200 Speedway Boulevard, Indianapolis, IN 46222',
    establishedYear: 2006,
    businessType: 'Manufacturer',
    tier: 'VIP',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-02-14',
    trustScore: 98,
    responseRate: '99.0%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '350',
    annualRevenueUsd: '$45M - $75M',
    mainMarkets: ['North America', 'Western Europe', 'Japan', 'Australia', 'UAE'],
    certifications: ['IATF 16949:2016', 'ISO 9001:2015', 'TÜV Wheel Safety Certified', 'JWL / VIA Approved'],
    factorySizeSqM: 38000,
    productionLines: 8,
    logoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80',
    description: 'Specialist OEM manufacturer of forged 6061-T6 aerospace-grade racing alloy wheels, high-flow billet turbochargers, monobloc brake kits, and high-performance automotive motorsport components.',
    contactPerson: 'Brett Vance (Director of Global Racing Sales)',
    contactEmail: 'export@apexdynamics-racing.com',
    contactPhone: '+1 317 890 4420',
    tradeAssuranceLimitUsd: 1800000,
    completedOrdersCount: 520
  },
  {
    id: 'comp-shenzhen-batt',
    companyName: 'ApexPower Energy Tech Co., Ltd.',
    legalRegistrationNumber: 'CN-91440300MA5FQ99L',
    country: 'China',
    city: 'Shenzhen',
    address: 'Tower 4, High-Tech Industrial Park, Nanshan, Shenzhen',
    establishedYear: 2012,
    businessType: 'Manufacturer',
    tier: 'GOLD',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-02-10',
    trustScore: 96,
    responseRate: '98.5%',
    avgResponseTime: '< 2 hours',
    totalEmployees: '1200+',
    annualRevenueUsd: '$150M - $200M',
    mainMarkets: ['North America', 'Europe', 'Australia', 'Southeast Asia'],
    certifications: ['ISO 9001', 'ISO 14001', 'UL 1973', 'CE', 'UN 38.3', 'IEC 62619'],
    factorySizeSqM: 80000,
    productionLines: 20,
    logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    description: 'Tier-1 manufacturer of Grade-A LiFePO4 battery cells, 48V rack-mounted server rack batteries, commercial energy storage systems (BESS), and solar inverters.',
    contactPerson: 'Elena Zhao (Senior Export Director)',
    contactEmail: 'sales@apexpower-energy.com',
    contactPhone: '+86 755 8392 4110',
    tradeAssuranceLimitUsd: 2000000,
    completedOrdersCount: 680
  },
  {
    id: 'comp-mumbai-chem',
    companyName: 'Sudarshan Petrochem & Polymers Ltd.',
    legalRegistrationNumber: 'IN-U24100MH2001PLC1329',
    country: 'India',
    city: 'Mumbai',
    address: 'Nariman Point, Marine Drive, Mumbai 400021',
    establishedYear: 2001,
    businessType: 'Manufacturer',
    tier: 'GOLD',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-03-01',
    trustScore: 94,
    responseRate: '97.0%',
    avgResponseTime: '< 3 hours',
    totalEmployees: '850',
    annualRevenueUsd: '$60M - $90M',
    mainMarkets: ['Middle East', 'Africa', 'Europe', 'South America'],
    certifications: ['ISO 9001:2015', 'REACH Registered', 'GMP Certified', 'HALAL / KOSHER'],
    factorySizeSqM: 65000,
    productionLines: 8,
    logoUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    description: 'Leading producer of virgin HDPE resin, specialty masterbatches, titanium dioxide (TiO2), industrial solvents, and water purification polymers.',
    contactPerson: 'Rajesh Singhania (Head of Global Trading)',
    contactEmail: 'export@sudarshanpetro.in',
    contactPhone: '+91 22 6789 5400',
    tradeAssuranceLimitUsd: 1200000,
    completedOrdersCount: 390
  },
  {
    id: 'comp-istanbul-textile',
    companyName: 'Anatolian Organic Yarns & Fabrics A.S.',
    legalRegistrationNumber: 'TR-34-ISTANBUL-5892',
    country: 'Turkey',
    city: 'Bursa / Istanbul',
    address: 'Organize Sanayi Bolgesi 12. Cadde, Bursa',
    establishedYear: 2008,
    businessType: 'Manufacturer',
    tier: 'SILVER',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-01-20',
    trustScore: 91,
    responseRate: '95.8%',
    avgResponseTime: '< 4 hours',
    totalEmployees: '420',
    annualRevenueUsd: '$35M - $50M',
    mainMarkets: ['European Union', 'United Kingdom', 'North America'],
    certifications: ['GOTS Certified Organic', 'OEKO-TEX Standard 100', 'ISO 14001', 'SEDEX Audited'],
    factorySizeSqM: 32000,
    productionLines: 6,
    logoUrl: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&auto=format&fit=crop&q=80',
    description: 'Certified manufacturer of 100% GOTS organic cotton yarn, luxury denim fabrics, non-woven geotextiles, and heavy-duty technical workwear fabrics.',
    contactPerson: 'Merve Yilmaz (Export Coordinator)',
    contactEmail: 'trade@anatolianyarns.com.tr',
    contactPhone: '+90 224 441 8900',
    tradeAssuranceLimitUsd: 800000,
    completedOrdersCount: 245
  },
  {
    id: 'comp-vietnam-agro',
    companyName: 'Mekong Delta Agri-Commodities Corp',
    legalRegistrationNumber: 'VN-0309981245',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    address: '72 Le Thanh Ton, District 1, Ho Chi Minh City',
    establishedYear: 2015,
    businessType: 'Exporter',
    tier: 'GOLD',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-02-18',
    trustScore: 93,
    responseRate: '96.5%',
    avgResponseTime: '< 3 hours',
    totalEmployees: '310',
    annualRevenueUsd: '$40M - $65M',
    mainMarkets: ['Middle East', 'USA', 'EU', 'Japan', 'China'],
    certifications: ['HACCP Certified', 'ISO 22000:2018', 'FDA Registered', 'BRC Global Standard'],
    factorySizeSqM: 40000,
    productionLines: 5,
    logoUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    description: 'Premier exporter of Premium Jasmine & ST25 Fragrant Rice, W320/W240 Raw & Roasted Cashew Nuts, Robusta Green Coffee, and Black Pepper.',
    contactPerson: 'Nguyen Van Minh (Managing Director)',
    contactEmail: 'sales@mekongagricom.vn',
    contactPhone: '+84 28 3822 9100',
    tradeAssuranceLimitUsd: 1000000,
    completedOrdersCount: 310
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-forged-racing-wheels',
    supplierId: 'comp-apex-motorsport',
    supplierName: 'Apex Dynamics Motorsport & Forgings Inc.',
    supplierCountry: 'United States',
    supplierTier: 'VIP',
    supplierTrustScore: 98,
    title: 'Custom Forged Monoblock 6061-T6 Aluminum Motorsport Racing Wheels (18-21 Inch Deep Concave)',
    category: 'Automotive Parts & Transportation',
    subCategory: 'Forged Alloy Wheels',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'
    ],
    description: '10,000-ton forged aerospace 6061-T6 aluminum alloy motorsport wheels. Engineered for high-speed track endurance, circuit racing, and luxury performance vehicles. Custom PCD bolt patterns (5x112, 5x114.3, 5x120, Centerlock) and high-load ratings.',
    priceTiers: [
      { minUnits: 4, maxUnits: 19, priceUsd: 480 },
      { minUnits: 20, maxUnits: 99, priceUsd: 395 },
      { minUnits: 100, priceUsd: 340 }
    ],
    moq: 4,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 550,
    leadTimeDays: 15,
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'EXW'],
    specifications: [
      { name: 'Material', value: 'Forged Aerospace 6061-T6 Aerospace Aluminum' },
      { name: 'Sizes Available', value: '18x8.5J to 21x12.5J Custom Widths' },
      { name: 'Load Rating', value: '890 kg / 1,960 lbs per corner (Track Spec)' },
      { name: 'Manufacturing Process', value: '10,000 Ton Forging Press + 5-Axis CNC Milling' },
      { name: 'Finish', value: 'Brushed Titanium / Satin Bronze / Gloss Black' },
      { name: 'Certifications', value: 'TÜV Rheinland, JWL / VIA Japan, ISO 9001' }
    ],
    packagingDetails: 'Heavy-duty honeycomb foam ring protection, non-scratch microfiber cloth, individual double-wall export carton.',
    portOfDispatch: 'Long Beach / Los Angeles Port (or Air Express DHL/FedEx)',
    certifications: ['TÜV Certified', 'JWL', 'VIA', 'IATF 16949:2016'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '3,000 Sets / Month',
    featured: true,
    createdDate: '2025-02-15'
  },
  {
    id: 'prod-billet-turbocharger',
    supplierId: 'comp-apex-motorsport',
    supplierName: 'Apex Dynamics Motorsport & Forgings Inc.',
    supplierCountry: 'United States',
    supplierTier: 'VIP',
    supplierTrustScore: 98,
    title: 'Twin-Scroll Ceramic Dual Ball Bearing Billet Turbocharger Assembly (550HP - 900HP Rated)',
    category: 'Automotive Parts & Transportation',
    subCategory: 'Turbochargers & Engine Assemblies',
    images: [
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'High-performance motorsport turbocharger featuring point-milled billet compressor wheel, silicon nitride ceramic ball bearings, and Inconel 713C turbine wheel. Anti-surge ported shroud for high boost response.',
    priceTiers: [
      { minUnits: 5, maxUnits: 24, priceUsd: 650 },
      { minUnits: 25, maxUnits: 99, priceUsd: 560 },
      { minUnits: 100, priceUsd: 490 }
    ],
    moq: 5,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 720,
    leadTimeDays: 12,
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Compressor Wheel', value: 'Forged Billet 11-Blade 62mm / 82mm' },
      { name: 'Turbine Wheel', value: 'Inconel 713C 68mm / 62mm' },
      { name: 'Bearing Type', value: 'Dual Ceramic Ball Bearing with Oil/Water Cooling' },
      { name: 'Turbine Housing', value: 'Stainless Steel Twin Scroll V-Band / T3 Flange' },
      { name: 'Horsepower Rating', value: '550 - 900 BHP' }
    ],
    packagingDetails: 'Precision molded EVA foam casing in reinforced export cartons.',
    portOfDispatch: 'Los Angeles / Chicago O\'Hare Hub',
    certifications: ['ISO 9001:2015', 'CE', 'IATF 16949'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '2,500 Units / Month',
    featured: true,
    createdDate: '2025-02-18'
  },
  {
    id: 'prod-5axis-cnc',
    supplierId: 'comp-hans-cnc',
    supplierName: 'KUKA Precision Engineering GmbH',
    supplierCountry: 'Germany',
    supplierTier: 'VIP',
    supplierTrustScore: 99,
    title: 'Heavy-Duty 5-Axis High Precision CNC Machining Center with Siemens Sinumerik ONE Controller',
    category: 'Industrial Machinery & Automation',
    subCategory: 'CNC Machining Centers',
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'State-of-the-art 5-Axis CNC Milling Center designed for aerospace, automotive mold making, and medical titanium implants. Features direct-drive torque motors, 24,000 RPM high-speed spindle, and full thermodynamic compensation.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 148000 },
      { minUnits: 3, maxUnits: 5, priceUsd: 139000 },
      { minUnits: 6, priceUsd: 128000 }
    ],
    moq: 1,
    moqUnit: 'Sets',
    sampleAvailable: false,
    samplePriceUsd: 0,
    leadTimeDays: 45,
    supportedIncoterms: ['FOB', 'CIF', 'EXW', 'DDP'],
    specifications: [
      { name: 'X/Y/Z Travel', value: '850 x 700 x 500 mm' },
      { name: 'Spindle Speed', value: '24,000 RPM (Heller Ceramic Bearings)' },
      { name: 'Spindle Taper', value: 'HSK-A63' },
      { name: 'Max Table Load', value: '800 kg' },
      { name: 'Positioning Accuracy', value: '± 0.003 mm' },
      { name: 'CNC Controller', value: 'Siemens Sinumerik ONE / Heidenhain TNC 640' }
    ],
    packagingDetails: 'Anti-rust vacuum sealed foil, reinforced heavy-duty wooden sea-freight crate.',
    portOfDispatch: 'Hamburg / Rotterdam Port',
    certifications: ['CE', 'ISO 9001:2015', 'TÜV Rheinland'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '25 Sets / Month',
    featured: true,
    createdDate: '2025-01-10'
  },
  {
    id: 'prod-lifepo4-48v',
    supplierId: 'comp-shenzhen-batt',
    supplierName: 'ApexPower Energy Tech Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 96,
    title: '51.2V 100Ah 5.12kWh Server Rack LiFePO4 Battery Module with Smart Active BMS (6000+ Cycles)',
    category: 'Electronics & Component PCB',
    subCategory: 'Lithium LiFePO4 Batteries',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Commercial 3U standard 19-inch rack-mounted lithium iron phosphate battery module. Compatible with Victron, Growatt, Deye, SMA, and GoodWe inverters via RS485 and CAN-bus communication.',
    priceTiers: [
      { minUnits: 10, maxUnits: 49, priceUsd: 820 },
      { minUnits: 50, maxUnits: 199, priceUsd: 740 },
      { minUnits: 200, priceUsd: 680 }
    ],
    moq: 10,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 890,
    leadTimeDays: 14,
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'CFR'],
    specifications: [
      { name: 'Nominal Voltage', value: '51.2V' },
      { name: 'Rated Capacity', value: '100Ah (5.12 kWh)' },
      { name: 'Cell Type', value: 'Grade A EVE LF100K LiFePO4 Prismatic Cells' },
      { name: 'Cycle Life', value: '≥ 6,000 cycles @ 80% DOD, 0.5C' },
      { name: 'Communication', value: 'CAN / RS485 / RS232' },
      { name: 'Weight', value: '46.5 kg' }
    ],
    packagingDetails: 'UN-certified hazardous goods pallet box with custom foam inserts.',
    portOfDispatch: 'Shenzhen / Yantian Port',
    certifications: ['UL 1973', 'CE', 'UN 38.3', 'IEC 62619', 'MSDS'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '8,000 Units / Month',
    featured: true,
    createdDate: '2025-01-18'
  },
  {
    id: 'prod-solar-pv-panels',
    supplierId: 'comp-shenzhen-batt',
    supplierName: 'ApexPower Energy Tech Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 96,
    title: '580W TOPCon Bifacial Monocrystalline Commercial Solar Panels (22.8% Module Efficiency)',
    category: 'Renewable Energy & Solar',
    subCategory: 'Monocrystalline Solar Panels',
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df57046475a?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'N-Type TOPCon 144-half-cut bifacial dual-glass solar PV modules. Up to 25% additional rear-side power yield. Anti-PID, 30-year linear power warranty, and MC4-EVO2 connectors.',
    priceTiers: [
      { minUnits: 62, maxUnits: 371, priceUsd: 78 },
      { minUnits: 372, maxUnits: 1859, priceUsd: 69 },
      { minUnits: 1860, priceUsd: 63 }
    ],
    moq: 62,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 110,
    leadTimeDays: 14,
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'CFR'],
    specifications: [
      { name: 'Max Power (Pmax)', value: '580W (Bifacial up to 700W)' },
      { name: 'Module Efficiency', value: '22.84%' },
      { name: 'Cell Type', value: 'N-Type TOPCon 182x182mm Half-Cell' },
      { name: 'Dimensions', value: '2278 x 1134 x 30 mm' },
      { name: 'Warranty', value: '15-Year Product / 30-Year Performance' }
    ],
    packagingDetails: '31 pieces per pallet, 620 pieces per 40ft High Cube Container (FCL).',
    portOfDispatch: 'Shanghai / Ningbo Port',
    certifications: ['TÜV Rheinland', 'CE', 'IEC 61215', 'UL 61730'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '50,000 Panels / Month',
    featured: true,
    createdDate: '2025-02-05'
  },
  {
    id: 'prod-virgin-hdpe',
    supplierId: 'comp-mumbai-chem',
    supplierName: 'Sudarshan Petrochem & Polymers Ltd.',
    supplierCountry: 'India',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    title: 'High-Density Polyethylene (HDPE) Virgin Resin Granules (Blow Molding Grade - MFI 0.05)',
    category: 'Chemicals, Polymers & Resins',
    subCategory: 'Virgin HDPE / Polypropylene',
    images: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    description: '100% Prime Virgin HDPE polymer granules specially engineered for industrial containers, jerry cans, lube oil bottles, and high-pressure chemical drums with outstanding environmental stress crack resistance (ESCR).',
    priceTiers: [
      { minUnits: 25, maxUnits: 99, priceUsd: 1120 },
      { minUnits: 100, maxUnits: 499, priceUsd: 1040 },
      { minUnits: 500, priceUsd: 980 }
    ],
    moq: 25,
    moqUnit: 'Metric Tons',
    sampleAvailable: true,
    samplePriceUsd: 50,
    leadTimeDays: 10,
    supportedIncoterms: ['FOB', 'CIF', 'CFR'],
    specifications: [
      { name: 'Melt Flow Index (MFI 190°C/2.16kg)', value: '0.05 g/10min' },
      { name: 'Density', value: '0.954 g/cm³' },
      { name: 'Tensile Strength @ Yield', value: '28 MPa' },
      { name: 'ESCR (Condition B, F50)', value: '> 1000 Hours' },
      { name: 'Form', value: 'Cylindrical Pellets / Granules' }
    ],
    packagingDetails: '25 kg multi-wall moisture-proof PP bags with PE liner, 1 MT jumbo bag on shrink-wrapped heat-treated pallets.',
    portOfDispatch: 'Nhava Sheva (JNPT) / Mundra Port',
    certifications: ['ISO 9001', 'REACH', 'RoHS', 'FDA Food Contact Certified'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '5,000 Metric Tons / Month',
    featured: false,
    createdDate: '2025-02-02'
  },
  {
    id: 'prod-organic-cotton-denim',
    supplierId: 'comp-istanbul-textile',
    supplierName: 'Anatolian Organic Yarns & Fabrics A.S.',
    supplierCountry: 'Turkey',
    supplierTier: 'SILVER',
    supplierTrustScore: 91,
    title: 'GOTS Certified 100% Organic Aegean Ring Spun Denim Fabric (12.5 oz Indigo Dyed)',
    category: 'Textiles, Fabrics & Apparel',
    subCategory: 'Organic Cotton Fabrics',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Eco-conscious raw denim roll fabric crafted from 100% Aegean organic long-staple cotton with sulfur-bottom pure indigo dye. Superb wash-down effects and soft hand-feel for luxury fashion brands.',
    priceTiers: [
      { minUnits: 1000, maxUnits: 4999, priceUsd: 4.80 },
      { minUnits: 5000, maxUnits: 19999, priceUsd: 4.20 },
      { minUnits: 20000, priceUsd: 3.75 }
    ],
    moq: 1000,
    moqUnit: 'Meters',
    sampleAvailable: true,
    samplePriceUsd: 15,
    leadTimeDays: 18,
    supportedIncoterms: ['FOB', 'CIF', 'EXW', 'DDP'],
    specifications: [
      { name: 'Composition', value: '100% GOTS Organic Cotton' },
      { name: 'Fabric Weight', value: '12.5 oz/sq yard (424 g/m²)' },
      { name: 'Weave Type', value: '3/1 Right Hand Twill (RHT)' },
      { name: 'Width', value: '150 cm (59 inches)' },
      { name: 'Color', value: 'Deep Indigo (Pure Vegetable & Synthetic Blend)' }
    ],
    packagingDetails: 'Double-polyethylene wrapped rolls on cardboard core tubes, barcoded roll tags.',
    portOfDispatch: 'Ambarli Port, Istanbul / Gemlik Port',
    certifications: ['GOTS Organic', 'OEKO-TEX 100', 'SEDEX SMETA'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '250,000 Meters / Month',
    featured: false,
    createdDate: '2025-02-12'
  },
  {
    id: 'prod-jasmine-rice-st25',
    supplierId: 'comp-vietnam-agro',
    supplierName: 'Mekong Delta Agri-Commodities Corp',
    supplierCountry: 'Vietnam',
    supplierTier: 'GOLD',
    supplierTrustScore: 93,
    title: 'World-Awarded Vietnam ST25 Premium Fragrant Jasmine Rice (5% Broken, Long Grain)',
    category: 'Agriculture, Spices & Food Commodities',
    subCategory: 'Basmati & Jasmine Rice',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Naturally pandan-scented ST25 long-grain white rice harvested from organic alluvial soil in Soc Trang province. Awarded World Best Rice title. Super soft texture that stays tender when cold.',
    priceTiers: [
      { minUnits: 25, maxUnits: 99, priceUsd: 780 },
      { minUnits: 100, maxUnits: 499, priceUsd: 720 },
      { minUnits: 500, priceUsd: 680 }
    ],
    moq: 25,
    moqUnit: 'Metric Tons',
    sampleAvailable: true,
    samplePriceUsd: 30,
    leadTimeDays: 12,
    supportedIncoterms: ['FOB', 'CIF', 'CFR'],
    specifications: [
      { name: 'Grain Length', value: '7.2 - 7.5 mm Average' },
      { name: 'Broken Ratio', value: '≤ 5.0% Max' },
      { name: 'Moisture Content', value: '≤ 14.0% Max' },
      { name: 'Foreign Matter', value: '≤ 0.1% Max' },
      { name: 'Crop Year', value: '2025/2026 Fresh Harvest' }
    ],
    packagingDetails: '5kg, 10kg, 25kg, 50kg BOPP Laminated bags or 1 MT bulk jumbo bags in 20ft FCL (25-27 MT per container).',
    portOfDispatch: 'Cat Lai Port, Ho Chi Minh City',
    certifications: ['HACCP', 'ISO 22000', 'FDA Registered', 'Phytosanitary Certificate'],
    customizationAvailable: true,
    supplyAbilityPerMonth: '10,000 Metric Tons / Month',
    featured: true,
    createdDate: '2025-02-20'
  }
];

export const MOCK_RFQS: RfqRequirement[] = [
  {
    id: 'rfq-2026-901',
    buyerName: 'Marcus Vance',
    buyerCompany: 'Nordic Clean Energy Solutions AB',
    buyerCountry: 'Sweden',
    buyerVerified: true,
    productName: 'Commercial 5.12kWh LiFePO4 Server Rack Batteries (48V / 51.2V 100Ah)',
    category: 'Electronics & Component PCB',
    targetQuantity: 500,
    quantityUnit: 'Pieces',
    targetPriceUsd: 650,
    preferredIncoterm: 'CIF',
    destinationPort: 'Gothenburg Port, Sweden',
    paymentTerms: '30% T/T Deposit, 70% against Bill of Lading (B/L)',
    detailedRequirements: 'Looking for Tier-1 certified LiFePO4 battery modules for telecom backup and commercial solar projects. Must have UL1973, CE, and UN38.3 test reports. Compatible with Victron GX and Deye inverters. Need initial 500 units by next month with recurring 200 units/quarter.',
    urgency: 'URGENT',
    quotesCount: 4,
    postedDate: '2026-08-19',
    expiryDate: '2026-09-15',
    status: 'OPEN',
    matchedSupplierCount: 8,
    spamScore: 4.2
  },
  {
    id: 'rfq-2026-902',
    buyerName: 'Daisuke Takahashi',
    buyerCompany: 'Nippon Precision Molding Corp',
    buyerCountry: 'Japan',
    buyerVerified: true,
    productName: 'Virgin HDPE Granules (Blow Molding Grade - MFI 0.05)',
    category: 'Chemicals, Polymers & Resins',
    targetQuantity: 120,
    quantityUnit: 'Metric Tons',
    targetPriceUsd: 1020,
    preferredIncoterm: 'CIF',
    destinationPort: 'Yokohama Port, Japan',
    paymentTerms: '100% Irrevocable Letter of Credit (L/C at sight)',
    detailedRequirements: 'Require 120 MT of prime virgin HDPE blow molding grade for 20L chemical jerry cans. Must pass ESCR > 1000 hours test. Need full COA (Certificate of Analysis) and REACH compliance declarations before shipment.',
    urgency: 'STANDARD',
    quotesCount: 3,
    postedDate: '2026-08-20',
    expiryDate: '2026-09-20',
    status: 'OPEN',
    matchedSupplierCount: 5,
    spamScore: 2.1
  },
  {
    id: 'rfq-2026-903',
    buyerName: 'Claire Beaumont',
    buyerCompany: 'Atelier Mode Paris SARL',
    buyerCountry: 'France',
    buyerVerified: true,
    productName: 'GOTS Organic Cotton Denim Fabric (12-13 oz Indigo Dyed)',
    category: 'Textiles, Fabrics & Apparel',
    targetQuantity: 15000,
    quantityUnit: 'Meters',
    targetPriceUsd: 4.10,
    preferredIncoterm: 'DDP',
    destinationPort: 'Le Havre / Warehouse Paris, France',
    paymentTerms: 'Trade Assurance Escrow (50% upfront, 50% upon SGS inspection)',
    detailedRequirements: 'Sourcing 15,000 meters of 100% organic cotton raw selvedge/ring denim for Spring 2027 collection. Must provide GOTS TC (Transaction Certificate) issued to our company name. Need lab dips and 5m sample roll within 7 days.',
    urgency: 'STANDARD',
    quotesCount: 5,
    postedDate: '2026-08-18',
    expiryDate: '2026-09-10',
    status: 'OPEN',
    matchedSupplierCount: 7,
    spamScore: 3.8
  },
  {
    id: 'rfq-2026-904',
    buyerName: 'Ahmed Al-Mansoor',
    buyerCompany: 'Gulf Foodstuff Distribution W.L.L.',
    buyerCountry: 'United Arab Emirates',
    buyerVerified: true,
    productName: 'Vietnam ST25 Jasmine Fragrant Rice (5% Broken)',
    category: 'Agriculture, Spices & Food Commodities',
    targetQuantity: 500,
    quantityUnit: 'Metric Tons',
    targetPriceUsd: 710,
    preferredIncoterm: 'CIF',
    destinationPort: 'Jebel Ali Port, Dubai, UAE',
    paymentTerms: '100% Confirmed Irrevocable L/C at Sight',
    detailedRequirements: 'Annual contract for 500 MT of fresh crop ST25 jasmine rice packaged in 25kg BOPP laminated bags with our private brand artwork. Mandatory SGS pre-shipment quality and moisture inspection.',
    urgency: 'LONG_TERM_CONTRACT',
    quotesCount: 6,
    postedDate: '2026-08-15',
    expiryDate: '2026-09-30',
    status: 'MATCHED',
    matchedSupplierCount: 9,
    spamScore: 1.5
  },
  {
    id: 'rfq-2026-905',
    buyerName: 'Liam O\'Connor',
    buyerCompany: 'Pacific Rim Precision Engineering Pty Ltd',
    buyerCountry: 'Australia',
    buyerVerified: true,
    productName: '12kW Dual-Shuttle High Power Fiber Laser Cutting Machine',
    category: 'Industrial Machinery & Automation',
    targetQuantity: 3,
    quantityUnit: 'Sets',
    targetPriceUsd: 58000,
    preferredIncoterm: 'CIF',
    destinationPort: 'Port of Melbourne / Sydney, Australia',
    paymentTerms: '20% Deposit, 80% Irrevocable L/C at Sight',
    detailedRequirements: 'Seeking 3 units of 12kW industrial fiber laser cutters with auto-focus Raytools head and IPG laser source for heavy structural steel fabrication. Must include Australian AS/NZS electrical compliance certificates.',
    urgency: 'URGENT',
    quotesCount: 4,
    postedDate: '2026-08-21',
    expiryDate: '2026-09-25',
    status: 'OPEN',
    matchedSupplierCount: 6,
    spamScore: 1.8
  }
];

export const MOCK_QUOTES: SupplierQuote[] = [
  {
    id: 'quote-8801',
    rfqId: 'rfq-2026-901',
    supplierId: 'comp-shenzhen-batt',
    supplierName: 'ApexPower Energy Tech Co., Ltd.',
    supplierTier: 'GOLD',
    unitPriceUsd: 680,
    totalAmountUsd: 340000,
    offeredIncoterm: 'CIF',
    portOfLoading: 'Shenzhen Yantian Port',
    leadTimeDays: 15,
    validityDays: 30,
    paymentTerms: '30% T/T Deposit, 70% against B/L copy',
    sampleOffered: true,
    notes: 'We can match your 500-unit requirement with Grade-A EVE prismatic cells and smart active BMS. UL1973 and UN38.3 test certificates available immediately.',
    submittedDate: '2026-08-20',
    status: 'UNDER_NEGOTIATION'
  },
  {
    id: 'quote-8802',
    rfqId: 'rfq-2026-901',
    supplierId: 'comp-hans-cnc',
    supplierName: 'KUKA Precision Engineering GmbH (OEM Partner)',
    supplierTier: 'VIP',
    unitPriceUsd: 720,
    totalAmountUsd: 360000,
    offeredIncoterm: 'DDP',
    portOfLoading: 'Rotterdam Warehouse',
    leadTimeDays: 7,
    validityDays: 20,
    paymentTerms: 'Trade Assurance Escrow / Net 30 for EU buyers',
    sampleOffered: true,
    notes: 'Stock readily available in our European distribution center in Rotterdam. Next-week delivery with zero import clearance hassle for Sweden.',
    submittedDate: '2026-08-20',
    status: 'PENDING'
  },
  {
    id: 'quote-8803',
    rfqId: 'rfq-2026-903',
    supplierId: 'comp-istanbul-textile',
    supplierName: 'Anatolian Organic Yarns & Fabrics A.S.',
    supplierTier: 'SILVER',
    unitPriceUsd: 3.95,
    totalAmountUsd: 59250,
    offeredIncoterm: 'DDP',
    portOfLoading: 'Ambarli Port, Istanbul',
    leadTimeDays: 14,
    validityDays: 25,
    paymentTerms: '50% Deposit, 50% upon SGS pre-shipment report',
    sampleOffered: true,
    notes: 'GOTS Transaction Certificate will be issued upon order placement. 5m sample swatch ready for express air courier dispatch today.',
    submittedDate: '2026-08-19',
    status: 'ACCEPTED'
  }
];

export const MOCK_NEGOTIATION_THREADS: NegotiationThread[] = [
  {
    id: 'thread-9901',
    rfqId: 'rfq-2026-901',
    productTitle: 'Commercial 5.12kWh LiFePO4 Server Rack Batteries (500 Units)',
    buyerId: 'user-nordic-marcus',
    buyerName: 'Marcus Vance',
    buyerCompany: 'Nordic Clean Energy Solutions AB',
    supplierId: 'comp-shenzhen-batt',
    supplierName: 'ApexPower Energy Tech Co., Ltd.',
    agreedPriceUsd: 670,
    agreedQuantity: 500,
    agreedIncoterm: 'CIF',
    escrowStatus: 'FUNDS_LOCKED',
    lastUpdated: '2026-08-21T18:30:00Z',
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-nordic-marcus',
        senderName: 'Marcus Vance',
        senderRole: 'BUYER',
        timestamp: '2026-08-20T10:14:00Z',
        message: 'Hello Elena, we reviewed your quote for 500 units of 51.2V 100Ah battery modules. Can you offer CIF Gothenburg at $665/unit if we commit to an additional 300 units in Q4?'
      },
      {
        id: 'msg-2',
        senderId: 'comp-shenzhen-batt',
        senderName: 'Elena Zhao (ApexPower)',
        senderRole: 'SUPPLIER',
        timestamp: '2026-08-20T11:45:00Z',
        message: 'Hello Marcus! Thank you for the update. Given current lithium carbonate raw material indices, the best volume price we can offer for 500 units CIF Gothenburg is $670/unit including marine insurance. We will include 2% complimentary spare BMS boards.',
        attachment: {
          type: 'COUNTER_OFFER',
          title: 'Official Counter Offer: $670.00 / unit CIF Gothenburg',
          valueSummary: 'Total: $335,000.00 USD (Includes 500 units + 10 spare BMS boards)'
        }
      },
      {
        id: 'msg-3',
        senderId: 'user-nordic-marcus',
        senderName: 'Marcus Vance',
        senderRole: 'BUYER',
        timestamp: '2026-08-21T09:20:00Z',
        message: 'That works for us. Please issue the Proforma Invoice with 30% T/T deposit and 70% against B/L copy, with Trade Assurance protection enabled.'
      },
      {
        id: 'msg-4',
        senderId: 'comp-shenzhen-batt',
        senderName: 'Elena Zhao (ApexPower)',
        senderRole: 'SUPPLIER',
        timestamp: '2026-08-21T10:05:00Z',
        message: 'Wonderful! Here is the signed Proforma Invoice PI-2026-8891. Trade Assurance escrow deposit link is attached below.',
        attachment: {
          type: 'PROFORMA_INVOICE',
          title: 'Proforma Invoice PI-2026-8891.pdf',
          valueSummary: 'Deposit Due: $100,500.00 USD (30%) | Escrow Protected'
        }
      }
    ]
  }
];

export const MOCK_KYC_RECORDS: KycVerificationRecord[] = [
  {
    id: 'kyc-701',
    companyId: 'comp-hans-cnc',
    companyName: 'KUKA Precision Engineering GmbH',
    country: 'Germany',
    registrationNumber: 'DE-HRB-984210',
    taxId: 'DE814592019',
    documents: [
      { type: 'Commercial Register Extract (Handelsregister)', fileName: 'handelsregister_extract_2025.pdf', verified: true },
      { type: 'TÜV Rheinland Factory Audit Certificate', fileName: 'tuv_audit_report_stuttgart.pdf', verified: true },
      { type: 'Deutsche Bank Verification Letter', fileName: 'bank_solvency_letter.pdf', verified: true }
    ],
    auditAgentNotes: 'Enterprise Tier verified. On-site inspection performed by SGS Munich branch. Verified active factory with 12 operational CNC assembly lines.',
    status: 'VERIFIED',
    submittedAt: '2025-01-10',
    tierRequested: 'VIP'
  },
  {
    id: 'kyc-702',
    companyId: 'comp-shenzhen-batt',
    companyName: 'ApexPower Energy Tech Co., Ltd.',
    country: 'China',
    registrationNumber: 'CN-91440300MA5FQ99L',
    taxId: '91440300MA5FQ99L',
    documents: [
      { type: 'China Business License (Unified Social Credit)', fileName: 'business_license_apexpower.pdf', verified: true },
      { type: 'UL 1973 & UN38.3 Lab Test Reports', fileName: 'ul1973_un383_test_certification.pdf', verified: true },
      { type: 'Tax Bureau Good Standing Certificate', fileName: 'shenzhen_tax_bureau_cert.pdf', verified: true }
    ],
    auditAgentNotes: 'High-tech manufacturer verified. Automated chamber of commerce cross-check confirmed matching legal representative and export license.',
    status: 'VERIFIED',
    submittedAt: '2025-02-05',
    tierRequested: 'GOLD'
  },
  {
    id: 'kyc-703',
    companyId: 'comp-new-applicant',
    companyName: 'Vanguard Industrial Forgings Ltd.',
    country: 'India',
    registrationNumber: 'IN-U28112DL2018PTC',
    taxId: '07AAACV1294F1Z8',
    documents: [
      { type: 'Ministry of Corporate Affairs Certificate', fileName: 'mca_incorporation_cert.pdf', verified: true },
      { type: 'GST Registration Document', fileName: 'gstin_certificate.pdf', verified: false }
    ],
    auditAgentNotes: 'Pending tax certificate re-upload due to expired GST verification seal. Assigned to agent Sarah Lin.',
    status: 'UNDER_REVIEW',
    submittedAt: '2026-08-20',
    tierRequested: 'SILVER'
  }
];

export const MOCK_BANK_ACCOUNTS: BankAccountDetails[] = [
  {
    id: 'bank-usd-primary',
    label: 'Trade Heaven Treasury - USD Global Wire & Settlement',
    currency: 'USD',
    bankName: 'JPMorgan Chase Bank, N.A. (New York)',
    swiftBic: 'CHASUS33XXX',
    ibanAccountNumber: 'US89CHAS021000021983049210',
    beneficiaryName: 'TRADE HEAVEN GLOBAL TRADE TECHNOLOGIES INC.',
    routingCode: '021000021 (Fedwire / ABA Routing)',
    branchAddress: '270 Park Avenue, Manhattan, New York, NY 10017, United States',
    intermediaryBank: 'JPMorgan Chase NY Main Clearing Branch',
    intermediarySwift: 'CHASUS33',
    isPrimaryForCurrency: true,
    status: 'ACTIVE'
  },
  {
    id: 'bank-eur-sepa',
    label: 'European Trade Operations & SEPA Clearing Vault',
    currency: 'EUR',
    bankName: 'Deutsche Bank AG (Frankfurt am Main)',
    swiftBic: 'DEUTDEDBFXX',
    ibanAccountNumber: 'DE89500700100874523901',
    beneficiaryName: 'TRADE HEAVEN EUROPE B.V.',
    routingCode: '50070010 (BLZ Bankleitzahl)',
    branchAddress: 'Taunusanlage 12, 60325 Frankfurt am Main, Germany',
    intermediaryBank: 'Deutsche Bank Euro Clearing Hub',
    intermediarySwift: 'DEUTDEDBF',
    isPrimaryForCurrency: true,
    status: 'ACTIVE'
  },
  {
    id: 'bank-gbp-chaps',
    label: 'UK & Commonwealth Sourcing Settlement',
    currency: 'GBP',
    bankName: 'Barclays Bank PLC (London)',
    swiftBic: 'BARCGB22XXX',
    ibanAccountNumber: 'GB29BARC20000087654321',
    beneficiaryName: 'TRADE HEAVEN UK LTD.',
    routingCode: '20-00-00 (UK Sort Code)',
    branchAddress: '1 Churchill Place, Canary Wharf, London E14 5HP, United Kingdom',
    isPrimaryForCurrency: true,
    status: 'ACTIVE'
  },
  {
    id: 'bank-asia-pac',
    label: 'Asia-Pacific Multi-Currency Settlement & Escrow Vault',
    currency: 'CNY',
    bankName: 'HSBC Hong Kong (The Hongkong and Shanghai Banking Corporation)',
    swiftBic: 'HSBCHKHHXXX',
    ibanAccountNumber: 'HK04HSBC004839201948201',
    beneficiaryName: 'TRADE HEAVEN ASIA-PACIFIC TRADING LTD.',
    routingCode: '004 (Clearing Code) / 839 (Branch)',
    branchAddress: '1 Queen\'s Road Central, Central, Hong Kong SAR',
    isPrimaryForCurrency: false,
    status: 'ACTIVE'
  }
];

export const MOCK_PLAN_CONFIGS: SubscriptionPlanConfig[] = [
  {
    id: 'SILVER',
    name: 'Silver Verified Exporter',
    priceAnnualUsd: 599,
    priceMonthlyUsd: 69,
    dailyLeadQuota: 15,
    catalogLimit: 50,
    trustBadge: 'Silver Verified Seal',
    escrowDiscountPercent: 0.5,
    priorityPlacement: '3x Boost in Category Search',
    dedicatedManager: false,
    apiAccess: false,
    features: [
      '15 Daily High-Priority Buy Lead Unlocks',
      'Verified Legal Entity Trust Seal',
      '3x Higher Catalog Search Placement',
      'Up to 50 Detailed Product Listings',
      'Real-time WhatsApp & Email Lead Notifications',
      'Standard Technical Support (12h SLA)'
    ]
  },
  {
    id: 'GOLD',
    name: 'Gold Manufacturer & Exporter',
    priceAnnualUsd: 1899,
    priceMonthlyUsd: 229,
    dailyLeadQuota: 50,
    catalogLimit: 'UNLIMITED',
    trustBadge: 'Gold Verified Manufacturer',
    escrowDiscountPercent: 1.5,
    priorityPlacement: 'Top 3 Search Placement Guaranteed',
    dedicatedManager: true,
    apiAccess: false,
    features: [
      '50 Daily Verified High-Value Buy Leads',
      'Gold Supplier Verified Trust Badge + Factory Audit Seal',
      'Top 3 Search Placement in Categories & Keywords',
      'Unlimited Product Listings & 4K Factory Video Tours',
      'Dedicated Key Account Manager & Buyer Matchmaker',
      'Verified SGS / TÜV On-Site Factory Audit Included',
      'Custom Subdomain (company.tradeheaven.com)',
      '1.5% Escrow Fee Discount on Trade Assurance'
    ]
  },
  {
    id: 'VIP',
    name: 'VIP Enterprise Conglomerate',
    priceAnnualUsd: 4999,
    priceMonthlyUsd: 549,
    dailyLeadQuota: 999,
    catalogLimit: 'UNLIMITED',
    trustBadge: 'VIP Enterprise Exporter',
    escrowDiscountPercent: 2.5,
    priorityPlacement: '#1 Permanent Category Sponsorship + Featured Hero',
    dedicatedManager: true,
    apiAccess: true,
    features: [
      'Unlimited Global RFQ Unlocks & Instant Buyer Direct Dials',
      'Exclusive VIP Crown Badge + Featured Homepage Spotlight',
      'Guaranteed #1 Top-Ranked Category Sponsorship',
      'Bespoke Buyer Sourcing Delegation & Virtual Trade Mission',
      '5 Sub-Accounts for Corporate Sales Teams',
      'Zero Transaction Fees on Escrow up to $500,000',
      'Custom REST API & ERP Catalog Auto-Sync',
      '24/7 Dedicated VIP Concierge & Customs Legal Counsel'
    ]
  }
];

export const MOCK_PAID_CLIENTS: PaidClientRecord[] = [
  {
    id: 'client-001',
    companyId: 'comp-hans-cnc',
    companyName: 'KUKA Precision Engineering GmbH',
    tier: 'VIP',
    status: 'ACTIVE',
    startsAt: '2025-01-15',
    renewsAt: '2027-01-15',
    amountPaidUsd: 4999,
    ltvUsd: 9998,
    quoteCreditsRemaining: 680,
    paymentMethod: 'WIRE_TRANSFER',
    contactPerson: 'Klaus Reinhardt (VP Export Operations)',
    contactEmail: 'klaus.reinhardt@kuka-precision-export.de',
    country: 'Germany',
    autoRenew: true,
    lastInvoiceRef: 'INV-TH-2026-8942',
    assignedAccountManager: 'Sophia Sterling (Senior Enterprise VP)'
  },
  {
    id: 'client-002',
    companyId: 'comp-shenzhen-batt',
    companyName: 'ApexPower Energy Tech Co., Ltd.',
    tier: 'GOLD',
    status: 'ACTIVE',
    startsAt: '2025-03-01',
    renewsAt: '2026-03-01',
    amountPaidUsd: 1899,
    ltvUsd: 3798,
    quoteCreditsRemaining: 245,
    paymentMethod: 'WIRE_TRANSFER',
    contactPerson: 'David Chen (International Sourcing Director)',
    contactEmail: 'david.chen@apexpower-energy.com',
    country: 'China',
    autoRenew: true,
    lastInvoiceRef: 'INV-TH-2026-7811',
    assignedAccountManager: 'Marcus Vance (Asia-Pacific Lead)'
  },
  {
    id: 'client-003',
    companyId: 'comp-forged-wheels',
    companyName: 'ApexForged Engineering Co., Ltd.',
    tier: 'GOLD',
    status: 'ACTIVE',
    startsAt: '2025-06-10',
    renewsAt: '2026-06-10',
    amountPaidUsd: 1899,
    ltvUsd: 1899,
    quoteCreditsRemaining: 180,
    paymentMethod: 'STRIPE_CC',
    contactPerson: 'Kenji Takahashi (Head of Global OEM)',
    contactEmail: 'export@apexforged-wheels.jp',
    country: 'Japan',
    autoRenew: true,
    lastInvoiceRef: 'INV-TH-2026-6420',
    assignedAccountManager: 'Sarah Jenkins (Automotive Trade Director)'
  }
];

export const MOCK_NEGOTIATIONS: NegotiationThread[] = [
  {
    id: 'thread-9901',
    rfqId: 'rfq-2026-901',
    productTitle: 'Commercial 5.12kWh LiFePO4 Server Rack Batteries (500 Units)',
    buyerCompany: 'Nordic Clean Energy Solutions AB',
    supplierCompany: 'ApexPower Energy Tech Co., Ltd.',
    currentPriceUsd: 670,
    orderQuantity: 500,
    currentIncoterm: 'CIF',
    destinationPort: 'Gothenburg Port, Sweden',
    status: 'IN_PROGRESS',
    escrowStatus: 'FUNDS_LOCKED',
    messages: [
      {
        id: 'msg-1',
        senderRole: 'BUYER',
        senderName: 'Marcus Vance',
        senderCompany: 'Nordic Clean Energy Solutions AB',
        content: 'Hello Elena, we reviewed your quote for 500 units of 51.2V 100Ah battery modules. Can you offer CIF Gothenburg at $665/unit if we commit to an additional 300 units in Q4?',
        timestamp: '2026-08-20 10:14'
      },
      {
        id: 'msg-2',
        senderRole: 'SUPPLIER',
        senderName: 'Elena Zhao',
        senderCompany: 'ApexPower Energy Tech Co., Ltd.',
        content: 'Hello Marcus! Thank you for the update. Best volume price for 500 units CIF Gothenburg is $670/unit including marine insurance. We will include 2% complimentary spare BMS boards.',
        timestamp: '2026-08-20 11:45',
        proposedPriceUsd: 670,
        proposedIncoterm: 'CIF'
      },
      {
        id: 'msg-3',
        senderRole: 'BUYER',
        senderName: 'Marcus Vance',
        senderCompany: 'Nordic Clean Energy Solutions AB',
        content: 'That works for us. Please issue the Proforma Invoice with 30% T/T deposit and 70% against B/L copy, with Trade Assurance protection enabled.',
        timestamp: '2026-08-21 09:20'
      }
    ]
  }
];

export const MOCK_ESCROWS: EscrowTransaction[] = [
  {
    id: 'ESC-TH-2026-4421',
    rfqId: 'rfq-2026-901',
    productTitle: '5.12kWh LiFePO4 Server Rack Batteries (500 Units)',
    buyerCompany: 'Nordic Clean Energy Solutions AB',
    supplierCompany: 'ApexPower Energy Tech Co., Ltd.',
    totalAmountUsd: 335000,
    depositAmountUsd: 100500,
    incoterm: 'CIF',
    portOfDestination: 'Gothenburg Port, Sweden',
    status: 'HELD_IN_ESCROW',
    milestones: [
      { title: 'Initial Production Advance (30%)', percentage: 30, amountUsd: 100500, status: 'RELEASED' },
      { title: 'Factory Pre-Shipment Inspection (40%)', percentage: 40, amountUsd: 134000, status: 'PENDING_APPROVAL' },
      { title: 'Port of Discharge Delivery Confirmation (30%)', percentage: 30, amountUsd: 100500, status: 'PENDING' }
    ],
    createdAt: '2026-08-18'
  },
  {
    id: 'ESC-TH-2026-4422',
    rfqId: 'rfq-2026-903',
    productTitle: '100% Organic Aegean Denim Fabric (15,000m)',
    buyerCompany: 'Atelier Mode Paris SARL',
    supplierCompany: 'Anatolian Organic Yarns & Fabrics A.S.',
    totalAmountUsd: 59250,
    depositAmountUsd: 29625,
    incoterm: 'DDP',
    portOfDestination: 'Le Havre, France',
    status: 'PRODUCTION_ACTIVE',
    milestones: [
      { title: 'Yarn Spinning & Dyeing Deposit (50%)', percentage: 50, amountUsd: 29625, status: 'RELEASED' },
      { title: 'Final Inspection & Custom Clearance (50%)', percentage: 50, amountUsd: 29625, status: 'PENDING' }
    ],
    createdAt: '2026-08-20'
  }
];

