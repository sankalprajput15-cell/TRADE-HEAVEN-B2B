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
    logoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80&sig=1',
    bannerUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
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
    contactEmail: 'contact@apexdynamics.mock',
    contactPhone: '+1 (317) 890-4420',
    whatsapp: '+13178904420',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80&sig=3',
      name: 'Brett Vance',
      designation: 'Director of International Trade & Motorsport OEM Relations',
      email: 'contact@apexdynamics.mock',
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
        documentUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80&sig=4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80&sig=5',
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
        documentUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80&sig=6',
        thumbnailUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80&sig=7',
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
        documentUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80&sig=8',
        thumbnailUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
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
        documentUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80&sig=10',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80&sig=11',
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
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80&sig=12',
          caption: 'High-temperature forging of aerospace 6061-T6 aluminum billets into dense wheel blanks.'
        },
        {
          id: 'tour-2',
          title: '5-Axis DMG MORI CNC Machining Center',
          department: 'Precision Milling & Finishing',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80&sig=13',
          caption: 'Ultra-precision high-speed 5-axis CNC machining creating intricate multi-spoke motorsport profiles.'
        },
        {
          id: 'tour-3',
          title: 'Automated Dust-Free Powder Coating & Anodizing',
          department: 'Surface Finishing & Treatment',
          imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80&sig=14',
          caption: 'Class-1000 cleanroom robotic electro-static coating with ceramic clear-coat thermal curing.'
        },
        {
          id: 'tour-4',
          title: 'Metrology & CMM Quality Testing Laboratory',
          department: 'QA & Metrology Center',
          imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80&sig=15',
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
    logoUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80&sig=17',
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
    contactEmail: 'contact@apexpower.mock',
    contactPhone: '+86 755 8392 4110',
    whatsapp: '+8613800138000',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80&sig=18',
      name: 'Elena Zhao',
      designation: 'Senior International Sales Director & Energy Storage Specialist',
      email: 'contact@apexpower.mock',
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
        documentUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80&sig=19',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80&sig=20',
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
        documentUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80&sig=21',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80&sig=22',
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
        documentUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80&sig=24',
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
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80&sig=25',
          caption: 'Class-10,000 humidity-controlled cleanroom for precision electrode winding and electrolyte filling.'
        },
        {
          id: 'tour-batt-2',
          title: 'Robotic Laser Welding & Busbar Bonding Bay',
          department: 'Pack Assembly Bay',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80&sig=26',
          caption: 'High-speed robotic fiber lasers bonding copper-nickel busbars with zero heat degradation.'
        },
        {
          id: 'tour-batt-3',
          title: 'Full Aging & Formation Testing Center',
          department: 'Burn-In & QC Testing',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80&sig=27',
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
    logoUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80&sig=28',
    bannerUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80&sig=29',
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
    contactEmail: 'contact@sudarshanpetro.in',
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
        documentUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80&sig=31',
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
  },
  'comp-astra-commodities': {
    id: 'comp-astra-commodities',
    companyName: 'Astra Commodities Llc',
    tradeName: 'Astra Commodities Llc',
    legalRegistrationNumber: 'N/A',
    country: 'United States',
    city: 'Houston',
    address: '12333 SOWDEN RD STE B PMB 479436, HOUSTON, Texas, United States',
    establishedYear: 2026,
    yearsInBusiness: 1,
    businessType: 'Exporter',
    tier: 'FREE',
    memberTierLabel: 'Free Member',
    isVerifiedKYC: false,
    kycVerificationDate: '',
    trustScore: 70,
    responseRate: '95%',
    avgResponseTime: '< 4 hours',
    totalEmployees: '10-50 Staff',
    annualRevenueUsd: '$5M - $10M USD',
    tradeAssuranceLimitUsd: 500000,
    completedOrdersCount: 0,
    factorySizeSqM: 0,
    productionLines: 0,
    logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80&sig=32',
    bannerUrl: '',
    tagline: 'Bulk Commodity Exporter',
    description: 'Astra Commodities Llc is a bulk exporter specializing in commodities including diesel fuel, metals, and industrial materials.',
    acceptedPaymentTerms: ['Trade Protection Certificate', 'L/C at Sight'],
    supportedIncotermsList: ['FOB'],
    portsOfDispatch: ['Houston Port'],
    marketDistribution: [
      { market: 'Global', percentage: 100, topCountries: ['Global'] }
    ],
    contactPerson: 'Fred Bernard Zaziski',
    contactEmail: 'contact@astracomodities.com',
    contactPhone: '+1 939-214-3022',
    contactPersonDetails: {
      name: 'Fred Bernard Zaziski',
      designation: 'Export Liaison',
      email: 'contact@astracomodities.com',
      phone: '+1 939-214-3022',
      isVerified: true
    }
  },
  'comp-netgas-energy': {
    id: 'comp-netgas-energy',
    companyName: 'NetGas Energy Services',
    tradeName: 'NetGas Energy Services',
    legalRegistrationNumber: 'N/A',
    country: 'Canada',
    city: 'Edmonton',
    address: '10423 101 St NW, Edmonton, Alberta, Canada',
    establishedYear: 2007,
    yearsInBusiness: 15,
    businessType: 'Brokerage',
    origin: 'Kazakhstan',
    tier: 'FREE',
    memberTierLabel: 'Free Member',
    isVerifiedKYC: false,
    kycVerificationDate: '',
    trustScore: 70,
    responseRate: '90%',
    avgResponseTime: '< 6 hours',
    totalEmployees: '50-100 Staff',
    annualRevenueUsd: '$10M - $20M USD',
    tradeAssuranceLimitUsd: 100000,
    completedOrdersCount: 0,
    factorySizeSqM: 0,
    productionLines: 0,
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80&sig=33',
    bannerUrl: '',
    tagline: 'Largest Independent Inter-Dealer Broker',
    description: 'NetGas Energy is the largest independent inter-dealer broker of commodities, focusing on global commodity markets with high-quality execution and technological innovation.',
    acceptedPaymentTerms: ['Wire Transfer', 'L/C'],
    supportedIncotermsList: ['FOB', 'CIF'],
    portsOfDispatch: ['Global'],
    marketDistribution: [
      { market: 'Global', percentage: 100, topCountries: ['Global'] }
    ],
    contactPerson: 'BRENDA BLANCHE HAMEL',
    contactEmail: 'contact@netgas.ca',
    contactPhone: '+1 825-255-7022',
    contactPersonDetails: {
      name: 'BRENDA BLANCHE HAMEL',
      designation: 'Business Manager',
      email: 'contact@netgas.ca',
      phone: '+1 825-255-7022',
      isVerified: false
    }
  },
  'comp-eec-poland-sp-zoo': {
    id: 'comp-eec-poland-sp-zoo',
    companyName: 'EEC POLAND SP ZOO',
    tradeName: 'EEC Poland European Trade & Export Co.',
    legalRegistrationNumber: 'KRS-0000849201 / NIP: PL5252849102',
    taxVatNumber: 'PL5252849102',
    dunsNumber: '52-849-1029',
    country: 'Poland',
    city: 'Warsaw',
    address: 'Kosciuszko Coast 31/33, 00-379 Warsaw, Poland',
    establishedYear: 2014,
    yearsInBusiness: 12,
    businessType: 'Wholesaler & Exporter',
    tier: 'GOLD',
    memberTierLabel: 'Gold Verified European Supplier',
    isVerifiedKYC: true,
    kycVerificationDate: '2025-06-12',
    trustScore: 92.0,
    responseRate: '98.5%',
    avgResponseTime: '< 2 hours',
    totalEmployees: '50 - 100 Employees',
    annualRevenueUsd: '$10M - $25M USD',
    tradeAssuranceLimitUsd: 1500000,
    completedOrdersCount: 284,
    factorySizeSqM: 18000,
    productionLines: 6,
    logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80&sig=34',
    bannerUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80&sig=35',
    tagline: 'Premier European Wholesale Exporter of Agro Fertilizers, Pure Oils, Polymers, Machinery & Commodities',
    description: 'EEC POLAND SP ZOO is an accredited European wholesale trading and export house based in Warsaw, Poland. Supplying verified international buyers across 40+ countries with top-tier water-soluble MAP & NPK fertilizers, refined edible oils, fresh agricultural produce, recycled hot-washed PET polymer flakes, concrete mixers, go-karts, automotive components, and food commodities with certified Baltic sea freight and road transport.',
    acceptedPaymentTerms: [
      'Trade Protection Certificate',
      'L/C at Sight (Irrevocable Confirmed)',
      '30% T/T Advance + 70% against B/L',
      'D/P (Documents Against Payment)'
    ],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA'],
    portsOfDispatch: [
      'Port of Gdansk, Poland (PLGDN)',
      'Port of Gdynia, Poland (PLGDY)',
      'Port of Szczecin, Poland (PLSZZ)'
    ],
    marketDistribution: [
      { market: 'European Union & UK', percentage: 45, topCountries: ['Germany', 'France', 'Netherlands', 'UK'] },
      { market: 'Middle East & GCC', percentage: 25, topCountries: ['UAE', 'Saudi Arabia', 'Qatar'] },
      { market: 'North America', percentage: 18, topCountries: ['USA', 'Canada'] },
      { market: 'Asia-Pacific', percentage: 12, topCountries: ['Vietnam', 'India', 'Japan'] }
    ],
    oemOdmCapabilities: {
      oemServicesOffered: true,
      customLogoPrinting: true,
      customPackaging: true,
      sampleLeadTimeDays: 5,
      prototype3DModeling: false,
      reverseEngineering: false
    },
    contactPerson: 'Marek Kowalski',
    contactEmail: 'export@eecpoland.trade',
    contactPhone: '+48 22 849 2011',
    whatsapp: '+48228492011',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80&sig=36',
      name: 'Marek Kowalski',
      designation: 'Head of International Trade & Export Logistics',
      email: 'export@eecpoland.trade',
      phone: '+48 22 849 2011',
      whatsapp: '+48228492011',
      languages: ['Polish', 'English', 'German', 'Russian'],
      timezone: 'CET (UTC+1) / 08:00 - 18:00',
      isVerified: true,
      responseTime: '< 2 hours'
    },
    complianceCertificates: [
      {
        id: 'cert-eec-iso9001',
        name: 'ISO 9001:2015 Quality Management System',
        category: 'QUALITY',
        certificateNumber: 'PL-ISO-9001-88429-A',
        issuingAuthority: 'Polish Centre for Testing and Certification (PCBC)',
        issueDate: '2024-02-10',
        expiryDate: '2027-02-09',
        documentUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80&sig=38',
        type: 'IMAGE',
        verified: true,
        scope: 'Wholesale, storage, and global export distribution of agricultural commodities, chemical fertilizers, polymers, and machinery.'
      },
      {
        id: 'cert-eec-haccp',
        name: 'HACCP & ISO 22000 Food Safety System',
        category: 'SAFETY',
        certificateNumber: 'HACCP-EU-2024-99182',
        issuingAuthority: 'TÜV Rheinland Polska Sp. z o.o.',
        issueDate: '2024-03-01',
        expiryDate: '2027-02-28',
        documentUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80&sig=39',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80&sig=40',
        type: 'IMAGE',
        verified: true,
        scope: 'Procurement, packaging, and export of edible oils, grains, fresh fruits, eggs, and food staples.'
      },
      {
        id: 'cert-eec-reach',
        name: 'EU REACH Compliance Certificate',
        category: 'ENVIRONMENTAL',
        certificateNumber: 'REACH-PL-REG-5252849102',
        issuingAuthority: 'European Chemicals Agency (ECHA) Registered',
        issueDate: '2023-11-15',
        expiryDate: '2026-11-14',
        documentUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80&sig=41',
        thumbnailUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80&sig=42',
        type: 'IMAGE',
        verified: true,
        scope: 'Conformity of recycled PET flakes and technical fertilizer compounds with EU environmental thresholds.'
      }
    ],
    factoryDetails: {
      factorySizeSqM: 18000,
      productionLines: 6,
      annualOutputUnits: '120,000 Metric Tons & Units / Year',
      monthlyCapacity: '10,000 Metric Tons & Units / Month'
    }
  },
  'comp-zac-importation-fadetech': {
    id: 'comp-zac-importation-fadetech',
    companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
    tradeName: 'IMPORTATION FADE-TECH',
    legalRegistrationNumber: 'TRD-INV-27-0004',
    country: 'Australia',
    city: 'Hurstville, NSW',
    address: '42a Bassett street hurstville, New South Wales 2220, Australia',
    establishedYear: 2018,
    yearsInBusiness: 8,
    businessType: 'Australian Coal Exporter & Energy Commodities Merchant',
    tier: 'SILVER',
    memberTierLabel: 'Basic Plan Holder • Direct On-Site Funds Transfer Disabled (Invoice TRD-INV-27-0004)',
    isVerifiedKYC: true,
    kycVerificationDate: '2026-09-04',
    trustScore: 99,
    responseRate: '99.8%',
    avgResponseTime: '< 30 mins',
    totalEmployees: '50-100 Staff',
    annualRevenueUsd: '$35M - $70M USD',
    tradeAssuranceLimitUsd: 1500000,
    completedOrdersCount: 215,
    factorySizeSqM: 45000,
    productionLines: 8,
    logoUrl: '/assets/aistudio/trade_heaven_agreement_zac__4__83a8fdf9.pdf',
    bannerUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Verified Australian Thermal & Coking Coal Exporter • Basic Plan Holder',
    description: 'IMPORTATION FADE-TECH (42a Bassett street hurstville, Australia | Zac@otec.ltd) is a Trade Heaven Basic Plan Holder with invoice TRD-INV-27-0004. Note: Direct on-site funds receiving from buyers is disabled for Basic Plan holders (VIP Members Only). Specializing in high-calorific Australian export coal including High-CV Thermal Coal (GAR 6000-6500 kcal/kg), Hard Coking Metallurgical Coal for steelworks, and High-Carbon PCI Coal. Authorized Representative: Zachary Aldin (+61 424 854 899).',
    acceptedPaymentTerms: ['Offline Bank Wire Transfer (Direct On-Site Transfer Disabled)', 'Irrevocable L/C at Sight', 'SBLC / DLC'],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR'],
    portsOfDispatch: ['Port of Newcastle, NSW Australia', 'Port of Gladstone, QLD Australia', 'Hay Point Coal Terminal, QLD Australia'],
    marketDistribution: [
      { market: 'Asia-Pacific & Japan', percentage: 50 },
      { market: 'South Asia & India', percentage: 25 },
      { market: 'Europe & UK', percentage: 15 },
      { market: 'Middle East', percentage: 10 }
    ],
    contactPerson: 'Zachary Aldin',
    contactEmail: 'Zac@otec.ltd',
    contactPhone: '+61 424 854 899',
    whatsapp: '+61424854899',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      name: 'Zachary Aldin',
      designation: 'Authorized Representative / Managing Director — Coal Export Division',
      email: 'Zac@otec.ltd',
      phone: '+61 424 854 899',
      whatsapp: '+61424854899',
      languages: ['English'],
      isVerified: true,
      responseTime: '< 30 mins'
    },
    complianceCertificates: [
      {
        id: 'cert-th-sow-01',
        name: 'Trade Heaven B2B Service Agreement & Statement of Work',
        category: 'COMPLIANCE',
        certificateNumber: 'TRD-INV-27-0004',
        issuingAuthority: 'Trade Heaven Ecom Solution',
        issueDate: '2026-09-04',
        expiryDate: '2027-09-04',
        documentUrl: '/assets/aistudio/trade_heaven_agreement_zac__4__83a8fdf9.pdf',
        thumbnailUrl: '/assets/aistudio/trade_heaven_agreement_zac__4__83a8fdf9.pdf',
        type: 'PDF',
        verified: true
      },
      {
        id: 'cert-aus-coal-02',
        name: 'SGS Australian Coal Quality Inspection & Calorific Value Certificate',
        category: 'QUALITY',
        certificateNumber: 'SGS-AU-COAL-2026-88',
        issuingAuthority: 'SGS Australia Inspection Services',
        issueDate: '2026-08-15',
        expiryDate: '2027-08-14',
        documentUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        verified: true
      }
    ],
    factoryDetails: {
      factorySizeSqM: 45000,
      productionLines: 8,
      annualOutputUnits: '2,500,000 Metric Tons / Year',
      monthlyCapacity: '210,000 Metric Tons / Month'
    }
  },
  'comp-melissa-mpcommodity': {
    id: 'comp-melissa-mpcommodity',
    companyName: 'MP Commodity Brokers Australia Pty Ltd',
    tradeName: 'MP Commodity Brokers Australia Pty Ltd',
    legalRegistrationNumber: 'ABN-61-648-291-004',
    country: 'Australia',
    city: 'Sans souci NSW 2219, SYDNEY',
    address: '2 Park Road, Sans souci NSW 2219, SYDNEY Australia',
    establishedYear: 2016,
    yearsInBusiness: 10,
    businessType: 'Fuel & Petroleum Commodity Broker',
    tier: 'SILVER',
    memberTierLabel: 'Paid Basic Plan • All Services Enabled • Fuel Broker',
    isVerifiedKYC: true,
    kycVerificationDate: '2026-10-19',
    trustScore: 98,
    responseRate: '99.5%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '25-50 Staff',
    annualRevenueUsd: '$25M - $50M USD',
    tradeAssuranceLimitUsd: 1100000,
    completedOrdersCount: 168,
    factorySizeSqM: 28000,
    productionLines: 6,
    logoUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    bannerUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    tagline: 'Verified Australian Fuel, EN590 10PPM Diesel, Jet A-1 & Petroleum Commodity Brokerage',
    description: 'MP Commodity Brokers Australia Pty Ltd (2 Park Road, Sans souci NSW 2219, SYDNEY Australia) is a verified Paid Basic Plan member with all platform services enabled. Specializing in bulk Fuel and Petroleum commodities including EN590 10PPM Ultra-Low Sulfur Diesel, Aviation Turbine Fuel (Jet A-1), D6 Virgin Fuel Oil, and Automotive/Marine Gasoil. Accepted Payment: Bank transfer.',
    acceptedPaymentTerms: ['Bank transfer', 'T/T Bank Wire Transfer', 'Irrevocable L/C at Sight', 'SBLC / DLC'],
    supportedIncotermsList: ['FOB', 'CIF', 'CFR', 'TTO'],
    portsOfDispatch: ['Port of Sydney (Port Botany Fuel Terminal), Australia', 'Port of Melbourne, Australia', 'Port of Fremantle, Australia'],
    marketDistribution: [
      { market: 'Asia-Pacific & Oceania', percentage: 45 },
      { market: 'Middle East & Gulf', percentage: 25 },
      { market: 'Europe', percentage: 20 },
      { market: 'North America', percentage: 10 }
    ],
    contactPerson: 'Melissa Prezios',
    contactEmail: 'melissa@mpcommoditybrokers.com',
    contactPhone: '+61411510887',
    whatsapp: '+61411510887',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      name: 'Melissa Prezios',
      designation: 'Managing Director — Fuel & Petroleum Brokerage',
      email: 'melissa@mpcommoditybrokers.com',
      phone: '+61411510887',
      whatsapp: '+61411510887',
      languages: ['English'],
      isVerified: true,
      responseTime: '< 1 hour'
    },
    complianceCertificates: [
      {
        id: 'cert-mp-1',
        name: 'Australian ASIC Corporate & Fuel Brokerage Registration',
        category: 'TRADE',
        issuingAuthority: 'Australian Securities & Investments Commission (ASIC)',
        issueDate: '2016-04-12',
        expiryDate: '2029-04-12',
        certificateNumber: 'ABN-61-648-291-004',
        type: 'IMAGE',
        verified: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'cert-mp-2',
        name: 'SGS Petroleum & Fuel Dip Test Quality Assurance (ISO 9001:2015)',
        category: 'QUALITY',
        issuingAuthority: 'SGS Australia Pty Ltd',
        issueDate: '2024-02-01',
        expiryDate: '2027-02-01',
        certificateNumber: 'AU-SGS-FUEL-88412',
        type: 'IMAGE',
        verified: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
        documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80'
      }
    ],
    factoryDetails: {
      factorySizeSqM: 28000,
      productionLines: 6,
      annualOutputUnits: '500,000 Metric Tons / Year (Bulk Fuel)',
      monthlyCapacity: '45,000 Metric Tons / Month',
      tourGallery: [
        {
          id: 'tour-mp-1',
          title: 'Bulk Fuel Tank Farm & Petroleum Loading Terminal',
          department: 'Fuel Storage & Tanker Dispatch',
          imageUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
          caption: 'Bulk fuel storage tanks and marine tanker loading terminal in Sydney, Australia.'
        },
        {
          id: 'tour-mp-2',
          title: 'SGS Fuel Assay, Octane & Sulfur Content Testing Lab',
          department: 'Petroleum Quality Control',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
          caption: 'Pre-shipment SGS dip test and ASTM D975 / EN590 laboratory certification.'
        }
      ]
    }
  },
  'comp-joy-bamboo-forest-farm': {
    id: 'comp-joy-bamboo-forest-farm',
    companyName: 'Joy Bamboo Forest Farm LLC',
    tradeName: 'Joy Bamboo Forest Farm LLC',
    legalRegistrationNumber: 'FL-LLC-2026-JBFF-300',
    taxVatNumber: 'US-FL-JBFF-33702',
    dunsNumber: '11-849-3370',
    country: 'United States',
    city: 'Saint Petersburg / Sebring, FL',
    address: 'Mailing Address: 7901 4th Stan Ste 300, Saint Petersburg, FL 33702 | Farm Pickup Address: Sebring, FL',
    establishedYear: 2020,
    yearsInBusiness: 6,
    businessType: 'Manufacturer',
    tier: 'SILVER',
    memberTierLabel: 'Paid Basic Plan • Direct On-Site Funds Transfer Not Active',
    isVerifiedKYC: true,
    kycVerificationDate: '2026-10-23',
    trustScore: 96.0,
    responseRate: '99.0%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '11 - 50 Staff',
    annualRevenueUsd: '$2M - $10M USD',
    tradeAssuranceLimitUsd: 250000,
    completedOrdersCount: 42,
    factorySizeSqM: 45000,
    productionLines: 4,
    logoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    bannerUrl: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    tagline: 'Florida Farm-Grown Timber Bamboo Poles, Raw Culms & Agricultural Bamboo Supplier (Pickup in Sebring, FL)',
    description: 'Joy Bamboo Forest Farm LLC is a verified Paid Basic Plan supplier in Florida, United States. Corporate Mailing Address: 7901 4th Stan Ste 300, Saint Petersburg, FL 33702. Farm address where the bamboo will be picked up is in Sebring, FL. Managed by Svetlana Brodskaya (Manager, info@joybambooforestfarm.com). Note: Direct on-site fund transfers are not active for Basic Plan accounts — please contact Svetlana Brodskaya directly at info@joybambooforestfarm.com for order payment and farm pickup coordination.',
    acceptedPaymentTerms: [
      'Direct Supplier Coordination (Contact Supplier Directly)',
      'Bank Wire Transfer (T/T)',
      'ACH Corporate Transfer',
      'Farm Pickup Settlement (Sebring, FL)'
    ],
    supportedIncotermsList: ['EXW', 'FCA', 'FOB', 'DDP'],
    portsOfDispatch: [
      'Sebring, FL (Direct Farm Pickup Facility)',
      'Port Tampa Bay, FL (USTPA)',
      'Port Miami, FL (USMIA)'
    ],
    marketDistribution: [
      { market: 'United States (Domestic)', percentage: 70, topCountries: ['Florida', 'Southeast USA', 'East Coast USA'] },
      { market: 'North America & Canada', percentage: 15, topCountries: ['Canada', 'Mexico'] },
      { market: 'Caribbean & Latin America', percentage: 10, topCountries: ['Bahamas', 'Puerto Rico', 'Dominican Republic'] },
      { market: 'European Union', percentage: 5, topCountries: ['United Kingdom', 'Netherlands'] }
    ],
    oemOdmCapabilities: {
      oemServicesOffered: true,
      customLogoPrinting: false,
      customPackaging: true,
      sampleLeadTimeDays: 5,
      prototype3DModeling: false,
      reverseEngineering: false
    },
    contactPerson: 'Svetlana Brodskaya',
    contactEmail: 'info@joybambooforestfarm.com',
    contactPhone: 'info@joybambooforestfarm.com',
    whatsapp: 'info@joybambooforestfarm.com',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      name: 'Svetlana Brodskaya',
      designation: 'Manager — Joy Bamboo Forest Farm LLC',
      email: 'info@joybambooforestfarm.com',
      phone: '7901 4th Stan Ste 300, Saint Petersburg, FL 33702 (Farm Pickup: Sebring, FL)',
      whatsapp: 'info@joybambooforestfarm.com',
      languages: ['English', 'Russian'],
      timezone: 'EST (UTC-5) / Florida Business Hours',
      isVerified: true,
      responseTime: 'Under 1 hour'
    },
    complianceCertificates: [
      {
        id: 'cert-jbff-1',
        name: 'Paid Basic Plan Supplier Verification & Florida LLC Registration',
        category: 'GOVERNMENT',
        issuingAuthority: 'State of Florida Division of Corporations & Trade Heaven',
        issueDate: '2026-10-23',
        expiryDate: '2027-10-23',
        certificateNumber: 'FL-LLC-JBFF-33702',
        type: 'IMAGE',
        verified: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'cert-jbff-2',
        name: 'Florida Agricultural Bamboo Farm & Sebring Pickup Facility Compliance',
        category: 'QUALITY',
        issuingAuthority: 'Florida Agricultural Inspection Bureau',
        issueDate: '2026-01-15',
        expiryDate: '2028-01-15',
        certificateNumber: 'FL-AG-SEBRING-2026',
        type: 'IMAGE',
        verified: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
        documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80'
      }
    ],
    factoryDetails: {
      factorySizeSqM: 45000,
      productionLines: 4,
      annualOutputUnits: '250,000 Bamboo Poles & Stakes / Year',
      monthlyCapacity: '20,000 Poles / Month (Sebring, FL Farm Pickup)',
      tourGallery: [
        {
          id: 'tour-jbff-1',
          title: 'Sebring, FL Bamboo Plantation & Direct Farm Pickup Yard',
          department: 'Bamboo Harvesting & Loading Yard (Sebring, FL)',
          imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
          caption: 'Farm address where the bamboo is harvested, graded, and picked up in Sebring, Florida.'
        },
        {
          id: 'tour-jbff-2',
          title: 'Saint Petersburg Corporate Office & Dispatch Administration',
          department: 'Corporate Mailing Office (7901 4th Stan Ste 300, Saint Petersburg, FL 33702)',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
          caption: 'Managed by Svetlana Brodskaya (Manager, info@joybambooforestfarm.com).'
        }
      ]
    }
  }
};

export function getDetailedVendorProfile(companyId: string, fallbackBase?: any): DetailedVendorProfile {
  if (companyId === 'user-supplier-melissa') {
    return DETAILED_VENDOR_PROFILES['comp-melissa-mpcommodity'];
  }
  if (companyId === 'user-supplier-zac') {
    return DETAILED_VENDOR_PROFILES['comp-zac-importation-fadetech'];
  }
  if (companyId === 'user-supplier-svetlana') {
    return DETAILED_VENDOR_PROFILES['comp-joy-bamboo-forest-farm'];
  }
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
    logoUrl: base.logoUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80&sig=43',
    bannerUrl: base.bannerUrl || '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
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
    contactEmail: base.contactEmail || 'contact@companytrade.mock',
    contactPhone: base.contactPhone || '+1 (800) 555-0199',
    whatsapp: base.whatsapp || '+18005550199',
    contactPersonDetails: {
      avatarUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80585314062340-f1a5a7c9328d?w=800&auto=format&fit=crop&q=80&sig=45',
      name: base.contactPerson || 'Export Liaison Officer',
      designation: 'Director of International Trade Relations',
      email: base.contactEmail || 'contact@companytrade.mock',
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
      documentUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80&sig=46',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80&sig=47',
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
