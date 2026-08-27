import { DetailedVendorProfile } from '../types';

export const DETAILED_VENDOR_PROFILES: Record<string, DetailedVendorProfile> = {
  'comp-apex-motorsport': {
    id: 'comp-apex-motorsport',
    companyName: 'Apex Dynamics Precision Forging & Motorsport Ltd.',
    tradeName: 'Apex Dynamics Racing Systems',
    legalRegistrationNumber: 'US-IN-2006-LLC-884920',
    taxVatNumber: 'US849302194',
    dunsNumber: '08-492-8193',
    country: 'United States',
    city: 'Indianapolis, IN',
    address: '4200 Speedway Boulevard, Industrial Park II, Indianapolis, IN 46222',
    establishedYear: 2006,
    yearsInBusiness: 19,
    businessType: 'Manufacturer',
    tier: 'VIP',
    memberTierLabel: 'Diamond VIP Verified Exporter',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-02-14',
    trustScore: 98.4,
    responseRate: '99.2%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '350 - 500 Staff',
    annualRevenueUsd: '$45M - $75M USD',
    tradeAssuranceLimitUsd: 2500000,
    completedOrdersCount: 520,
    factorySizeSqM: 38000,
    productionLines: 8,
    logoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&auto=format&fit=crop&q=80',
    tagline: 'Aerospace-Grade Precision Forged Alloy Wheels, Turbochargers & Monobloc Braking Hardware',
    description: 'Apex Dynamics is an IATF 16949-certified tier-1 manufacturer specializing in aerospace-grade forged 6061-T6 aluminum alloy wheels, CNC billet turbocharger systems, and monobloc racing brake assemblies. Serving professional motorsport series, supercar tuners, and wholesale distributors in over 45 countries with full custom engineering and OEM private label support.',
    acceptedPaymentTerms: [
      'Trade Protection Certificate (Zero-Risk)',
      'L/C at Sight (Irrevocable Confirmed)',
      '30% T/T Advance + 70% against B/L',
      'D/P (Documents Against Payment)'
    ],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA'],
    portsOfDispatch: [
      'Port of Los Angeles (USLAX)',
      'Port of Long Beach (USLGB)',
      'Port of New York / New Jersey (USNYC)'
    ],
    marketDistribution: [
      { market: 'North America', percentage: 42, topCountries: ['USA', 'Canada', 'Mexico'] },
      { market: 'Western Europe', percentage: 28, topCountries: ['Germany', 'UK', 'Italy', 'France'] },
      { market: 'Asia-Pacific & Japan', percentage: 18, topCountries: ['Japan', 'Australia', 'South Korea'] },
      { market: 'Middle East & Gulf', percentage: 12, topCountries: ['UAE', 'Saudi Arabia', 'Qatar'] }
    ],
    oemOdmCapabilities: {
      oemServicesOffered: true,
      customLogoPrinting: true,
      customPackaging: true,
      sampleLeadTimeDays: 7,
      prototype3DModeling: true,
      reverseEngineering: true
    },
    contactPerson: 'Brett Vance',
    contactEmail: 'b.vance@apexdynamics-racing.com',
    contactPhone: '+1 (317) 890-4420',
    whatsapp: '+13178904420',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      name: 'Brett Vance',
      designation: 'Director of International Trade & Motorsport OEM Relations',
      email: 'b.vance@apexdynamics-racing.com',
      phone: '+1 (317) 890-4420',
      whatsapp: '+13178904420',
      languages: ['English', 'German', 'Spanish'],
      timezone: 'EST (UTC-5) / 08:00 - 19:00',
      isVerified: true,
      responseTime: 'Under 30 minutes'
    },
    complianceCertificates: [
      {
        id: 'cert-iatf-16949',
        name: 'IATF 16949:2016 Automotive Quality System',
        category: 'QUALITY',
        certificateNumber: 'IATF-US-0482910-A',
        issuingAuthority: 'TÜV SÜD Automotive Bureau',
        issueDate: '2023-04-10',
        expiryDate: '2026-04-09',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Design, precision forging, CNC finishing, and structural verification of alloy wheels and powertrain hardware.'
      },
      {
        id: 'cert-tuv-wheel',
        name: 'TÜV Rheinland Wheel Safety & Fatigue Approval',
        category: 'SAFETY',
        certificateNumber: 'TUV-DE-WHEEL-99420-KBA',
        issuingAuthority: 'TÜV Rheinland Kraftfahrt GmbH (Germany)',
        issueDate: '2024-01-15',
        expiryDate: '2027-01-14',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Radial fatigue, dynamic cornering bending test, and 13-degree impact resistance compliance (ECE R124).'
      },
      {
        id: 'cert-iso-9001',
        name: 'ISO 9001:2015 Global Quality Management',
        category: 'QUALITY',
        certificateNumber: 'ISO-9001-QMS-891024',
        issuingAuthority: 'SGS United Kingdom Ltd.',
        issueDate: '2023-09-01',
        expiryDate: '2026-08-31',
        documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Quality control across casting, 10,000-ton forging presses, anodizing, and multi-axis milling.'
      },
      {
        id: 'cert-jwl-via',
        name: 'JWL / VIA Japanese Light Alloy Wheel Safety Registry',
        category: 'REGISTRATION',
        certificateNumber: 'VIA-JP-REG-2024-7832',
        issuingAuthority: 'Japan Vehicle Inspection Association (VIA)',
        issueDate: '2024-03-01',
        expiryDate: '2027-02-28',
        documentUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Official accreditation for lightweight forged wheels exported to Japanese domestic market.'
      }
    ],
    factoryDetails: {
      factorySizeSqM: 38000,
      productionLines: 8,
      annualOutputUnits: '250,000 Forged Wheel Sets / Year',
      monthlyCapacity: '22,000 Units / Month',
      rdEngineersCount: 32,
      qaInspectorsCount: 24,
      qcProcedures: [
        '100% In-Line Spectrometer Chemical Composition Analysis',
        'CMM 3D Coordinate Precision Laser Scanning (±0.005mm)',
        'Dynamic Radial & Cornering Fatigue Testing (SAE J2530 Standards)',
        '100% Helium Leak Detection & X-Ray Structural Integrity Scan',
        'Pre-Shipment Salt Spray Corrosion Testing (1000 Hours ASTM B117)'
      ],
      testingEquipment: [
        'Zeiss Industrial 3D CMM Laser Coordinate Scanner',
        'Tinius Olsen 300kN Universal Tensile Testing Machine',
        'Shimadzu Optical Emission Spectrometer (OES)',
        'MTS Dynamic Wheel Radial Bending Fatigue Rig',
        'Ascott 450L Atmospheric Salt Spray Chamber',
        'Mitutoyo Surface Roughness & Roundness Analyzers'
      ],
      tourGallery: [
        {
          id: 'tour-1',
          title: '10,000-Ton Hydraulic Forging Press Line',
          department: 'Heavy Forging & Forming Bay',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
          caption: 'High-temperature forging of aerospace 6061-T6 aluminum billets into dense wheel blanks.'
        },
        {
          id: 'tour-2',
          title: '5-Axis DMG MORI CNC Machining Center',
          department: 'Precision Milling & Finishing',
          imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
          caption: 'Ultra-precision high-speed 5-axis CNC machining creating intricate multi-spoke motorsport profiles.'
        },
        {
          id: 'tour-3',
          title: 'Automated Dust-Free Powder Coating & Anodizing',
          department: 'Surface Finishing & Treatment',
          imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80',
          caption: 'Class-1000 cleanroom robotic electro-static coating with ceramic clear-coat thermal curing.'
        },
        {
          id: 'tour-4',
          title: 'Metrology & CMM Quality Testing Laboratory',
          department: 'QA & Metrology Center',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
          caption: 'Laser 3D coordinate validation guaranteeing runout tolerances within ±0.005mm.'
        }
      ]
    }
  },
  'comp-shenzhen-batt': {
    id: 'comp-shenzhen-batt',
    companyName: 'ApexPower Energy Tech Co., Ltd.',
    tradeName: 'ApexPower Global Energy Systems',
    legalRegistrationNumber: 'CN-91440300MA5FQ99L',
    taxVatNumber: 'CN91440300MA5FQ99L82',
    country: 'China',
    city: 'Shenzhen / Huizhou',
    address: 'Tower 4, High-Tech Industrial Park, Nanshan, Shenzhen, Guangdong 518057',
    establishedYear: 2012,
    yearsInBusiness: 13,
    businessType: 'Manufacturer',
    tier: 'GOLD',
    memberTierLabel: 'Gold Verified Exporter',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-02-10',
    trustScore: 96.8,
    responseRate: '98.5%',
    avgResponseTime: '< 2 hours',
    totalEmployees: '1200+ Staff',
    annualRevenueUsd: '$150M - $200M USD',
    tradeAssuranceLimitUsd: 2000000,
    completedOrdersCount: 680,
    factorySizeSqM: 80000,
    productionLines: 20,
    logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1600&auto=format&fit=crop&q=80',
    tagline: 'Grade-A LiFePO4 Battery Cells, 48V Rack Storage & Commercial Solar Energy Systems',
    description: 'ApexPower is a tier-1 energy storage manufacturer operating 80,000 m² of automated cleanroom facilities in Shenzhen. Specializing in high-cycle LiFePO4 cells (6000+ cycles), residential solar storage batteries, server-rack UPS systems, and smart cloud-monitored battery management systems (BMS).',
    acceptedPaymentTerms: [
      'Trade Protection Certificate',
      'L/C at Sight (Irrevocable Confirmed)',
      '30% T/T Advance + 70% B/L',
      'CAD (Cash Against Documents)'
    ],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR', 'DDP', 'EXW'],
    portsOfDispatch: [
      'Port of Shenzhen (Yantian / Shekou)',
      'Port of Guangzhou (Nansha)',
      'Port of Hong Kong'
    ],
    marketDistribution: [
      { market: 'Europe (EU & UK)', percentage: 38, topCountries: ['Germany', 'Netherlands', 'UK', 'Poland'] },
      { market: 'North America', percentage: 32, topCountries: ['USA', 'Canada'] },
      { market: 'Australia & NZ', percentage: 16, topCountries: ['Australia', 'New Zealand'] },
      { market: 'Southeast Asia & Africa', percentage: 14, topCountries: ['South Africa', 'Philippines', 'Vietnam'] }
    ],
    oemOdmCapabilities: {
      oemServicesOffered: true,
      customLogoPrinting: true,
      customPackaging: true,
      sampleLeadTimeDays: 5,
      prototype3DModeling: true
    },
    contactPerson: 'Elena Zhao',
    contactEmail: 'sales@apexpower-energy.com',
    contactPhone: '+86 755 8392 4110',
    whatsapp: '+8613800138000',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      name: 'Elena Zhao',
      designation: 'Senior International Sales Director & Energy Storage Specialist',
      email: 'sales@apexpower-energy.com',
      phone: '+86 755 8392 4110',
      whatsapp: '+8613800138000',
      languages: ['English', 'Mandarin', 'Cantonese'],
      timezone: 'CST (UTC+8) / 08:30 - 20:30',
      isVerified: true,
      responseTime: 'Under 1 hour'
    },
    complianceCertificates: [
      {
        id: 'cert-ul-1973',
        name: 'UL 1973 / UL 9540A Energy Storage Safety Certification',
        category: 'SAFETY',
        certificateNumber: 'UL-ESS-2024-91048',
        issuingAuthority: 'Underwriters Laboratories (UL LLC)',
        issueDate: '2024-02-01',
        expiryDate: '2027-01-31',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Stationary battery energy storage systems, thermal runaway containment, and BMS safety logic.'
      },
      {
        id: 'cert-ce-emc',
        name: 'CE Marking & Low Voltage Directive (LVD/EMC)',
        category: 'SAFETY',
        certificateNumber: 'CE-EU-2023-LVD-88391',
        issuingAuthority: 'SGS Fimko Ltd. (CE 0598)',
        issueDate: '2023-06-12',
        expiryDate: '2026-06-11',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Compliance with EN 62619, EN 61000-6-1/3 standards for grid-tied residential energy storage.'
      },
      {
        id: 'cert-un383',
        name: 'UN 38.3 Dangerous Goods Transport Safety Test',
        category: 'TRADE',
        certificateNumber: 'UN383-DGR-2024-00918',
        issuingAuthority: 'Shanghai Research Institute of Chemical Industry',
        issueDate: '2024-01-08',
        expiryDate: '2026-12-31',
        documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Altitude simulation, thermal test, vibration, shock, external short circuit, impact, overcharge.'
      }
    ],
    factoryDetails: {
      factorySizeSqM: 80000,
      productionLines: 20,
      annualOutputUnits: '12 GWh Annual Energy Storage Capacity',
      monthlyCapacity: '1.0 GWh / Month',
      rdEngineersCount: 85,
      qaInspectorsCount: 60,
      qcProcedures: [
        '100% Automated Cell OCV & IR High-Precision Grading',
        'Automatic Laser Welding with Real-Time Penetration Inspection',
        'Full Thermal Chamber Charge/Discharge Capacity Verification',
        'BMS Protocol Communication & Fault Injection Emulation',
        'High-Voltage Dielectric & Insulation Resistance Testing (3750V DC)'
      ],
      tourGallery: [
        {
          id: 'tour-batt-1',
          title: 'Automated Cleanroom Cell Assembly Line',
          department: 'Cell Stacking & Packaging',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
          caption: 'Class-10,000 humidity-controlled cleanroom for precision electrode winding and electrolyte filling.'
        },
        {
          id: 'tour-batt-2',
          title: 'Robotic Laser Welding & Busbar Bonding Bay',
          department: 'Pack Assembly Bay',
          imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
          caption: 'High-speed robotic fiber lasers bonding copper-nickel busbars with zero heat degradation.'
        },
        {
          id: 'tour-batt-3',
          title: 'Full Aging & Formation Testing Center',
          department: 'Burn-In & QC Testing',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
          caption: 'Multi-cycle formation and thermal aging racks ensuring 100% capacity matching and zero early decay.'
        }
      ]
    }
  },
  'comp-mumbai-chem': {
    id: 'comp-mumbai-chem',
    companyName: 'Sudarshan Petrochem & Polymers Ltd.',
    tradeName: 'Sudarshan Global Polymers',
    legalRegistrationNumber: 'IN-U24100MH2001PLC1329',
    taxVatNumber: '27AABCS1429K1Z4',
    country: 'India',
    city: 'Mumbai',
    address: 'Nariman Point, Marine Drive, Mumbai, Maharashtra 400021',
    establishedYear: 2001,
    yearsInBusiness: 24,
    businessType: 'Manufacturer',
    tier: 'GOLD',
    memberTierLabel: 'Gold Verified Exporter',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-03-01',
    trustScore: 94.5,
    responseRate: '97.0%',
    avgResponseTime: '< 3 hours',
    totalEmployees: '850 Staff',
    annualRevenueUsd: '$60M - $90M USD',
    tradeAssuranceLimitUsd: 1200000,
    completedOrdersCount: 390,
    factorySizeSqM: 65000,
    productionLines: 8,
    logoUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80',
    tagline: 'Industrial Petrochemicals, Virgin HDPE Resins & Specialty Titanium Dioxide (TiO2)',
    description: 'Sudarshan Petrochem is an ISO 9001 and REACH-certified producer of chemical commodities, titanium dioxide pigment, polymer resins, industrial solvents, and water treatment compounds. Supplying international packaging converters, paint manufacturers, and industrial compounders across Europe, Middle East, and the Americas.',
    acceptedPaymentTerms: [
      'Trade Protection Certificate',
      '100% Irrevocable Confirmed L/C at Sight',
      '30% Advance + 70% against BL Copy',
      'CAD (Cash Against Documents)'
    ],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR', 'FCA'],
    portsOfDispatch: [
      'Nhava Sheva / JNPT Port, Mumbai (INNSA)',
      'Mundra Port, Gujarat (INMUN)'
    ],
    marketDistribution: [
      { market: 'Middle East & GCC', percentage: 35, topCountries: ['UAE', 'Saudi Arabia', 'Oman'] },
      { market: 'European Union', percentage: 30, topCountries: ['Italy', 'Spain', 'Germany'] },
      { market: 'Africa', percentage: 20, topCountries: ['Egypt', 'Nigeria', 'Kenya'] },
      { market: 'South America', percentage: 15, topCountries: ['Brazil', 'Chile', 'Colombia'] }
    ],
    contactPerson: 'Rajesh Singhania',
    contactEmail: 'export@sudarshanpetro.in',
    contactPhone: '+91 22 6789 5400',
    whatsapp: '+912267895400',
    complianceCertificates: [
      {
        id: 'cert-reach-eu',
        name: 'EU REACH Compliance Registration',
        category: 'SAFETY',
        certificateNumber: 'REACH-EU-01-2119489379-17',
        issuingAuthority: 'European Chemicals Agency (ECHA)',
        issueDate: '2023-05-10',
        expiryDate: '2026-05-09',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true,
        scope: 'Full registration of Titanium Dioxide (TiO2) and Polyethylene grades for European import.'
      }
    ],
    factoryDetails: {
      factorySizeSqM: 65000,
      productionLines: 8,
      annualOutputUnits: '180,000 Metric Tons / Year',
      monthlyCapacity: '15,000 MT / Month'
    }
  }
};

export function getDetailedVendorProfile(companyId: string, fallbackBase?: any): DetailedVendorProfile {
  if (DETAILED_VENDOR_PROFILES[companyId]) {
    return DETAILED_VENDOR_PROFILES[companyId];
  }
  // Generate high quality fallback from base company profile
  const base = fallbackBase || {};
  return {
    id: companyId || 'comp-default',
    companyName: base.companyName || 'Global Verified Exporter Corp.',
    tradeName: base.companyName || 'Global Verified Trading Co.',
    legalRegistrationNumber: base.legalRegistrationNumber || 'INTL-REG-2025-99201',
    country: base.country || 'Global',
    city: base.city || 'Export Center',
    address: base.address || 'Export Processing Zone, Port District',
    establishedYear: base.establishedYear || 2010,
    yearsInBusiness: new Date().getFullYear() - (base.establishedYear || 2010),
    businessType: base.businessType || 'Manufacturer',
    tier: base.tier || 'GOLD',
    memberTierLabel: `${base.tier || 'GOLD'} Verified Exporter`,
    isVerifiedKYC: base.isVerifiedKYC ?? true,
    kycVerificationDate: base.kycVerificationDate || '2025-01-15',
    trustScore: base.trustScore || 95,
    responseRate: base.responseRate || '98.0%',
    avgResponseTime: base.avgResponseTime || '< 2 hours',
    totalEmployees: base.totalEmployees || '300+ Staff',
    annualRevenueUsd: base.annualRevenueUsd || '$25M - $50M USD',
    tradeAssuranceLimitUsd: base.tradeAssuranceLimitUsd || 1000000,
    completedOrdersCount: base.completedOrdersCount || 250,
    factorySizeSqM: base.factorySizeSqM || 25000,
    productionLines: base.productionLines || 6,
    logoUrl: base.logoUrl || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=80',
    bannerUrl: base.bannerUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&auto=format&fit=crop&q=80',
    tagline: 'Certified International Manufacturer & Direct Exporter',
    description: base.description || 'Verified manufacturer offering bulk wholesale manufacturing, OEM/ODM private labeling, and global logistics support with full trade assurance protection.',
    acceptedPaymentTerms: ['Trade Protection Certificate', 'L/C at Sight', '30% T/T + 70% B/L', 'D/P'],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP'],
    portsOfDispatch: ['Primary International Container Port'],
    marketDistribution: [
      { market: 'North America', percentage: 40 },
      { market: 'Europe', percentage: 35 },
      { market: 'Middle East & Asia', percentage: 25 }
    ],
    contactPerson: base.contactPerson || 'Export Liaison Officer',
    contactEmail: base.contactEmail || 'export@company-trade.com',
    contactPhone: base.contactPhone || '+1 (800) 555-0199',
    whatsapp: base.whatsapp || '+18005550199',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      name: base.contactPerson || 'Export Liaison Officer',
      designation: 'Director of International Trade Relations',
      email: base.contactEmail || 'export@company-trade.com',
      phone: base.contactPhone || '+1 (800) 555-0199',
      whatsapp: base.whatsapp || '+18005550199',
      languages: ['English'],
      timezone: 'Standard Business Hours',
      isVerified: true,
      responseTime: '< 2 hours'
    },
    complianceCertificates: (base.certifications || ['ISO 9001:2015', 'CE Certified', 'SGS Audited']).map((c: string, idx: number) => ({
      id: `cert-${idx}`,
      name: c,
      category: 'QUALITY',
      certificateNumber: `AUDIT-REG-${2024 + idx}-009`,
      issuingAuthority: 'Accredited International Audit Bureau',
      issueDate: '2024-01-10',
      expiryDate: '2027-01-09',
      documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
      type: 'IMAGE',
      verified: true
    })),
    factoryDetails: {
      factorySizeSqM: base.factorySizeSqM || 25000,
      productionLines: base.productionLines || 6,
      annualOutputUnits: '150,000 Units / Year',
      monthlyCapacity: '12,500 Units / Month'
    }
  };
}
