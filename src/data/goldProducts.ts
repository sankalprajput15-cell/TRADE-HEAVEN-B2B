import { Product } from '../types';

export const GLOBAL_GOLD_PRODUCTS: Product[] = [
  // 0. Madebert Minerals Limited (comp-th-gold-0)
  {
    id: 'prod-th-gold-0-1',
    title: 'Raw Alluvial Gold Dust & Unrefined Gold Nuggets (22K+ Au)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-0',
    supplierName: 'Madebet Minerals Limited',
    supplierCountry: 'United States - Connecticut',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '10 Kilograms',
    priceRangeUsd: '$68,500 - $72,000 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'Direct mine-site alluvial gold dust and raw gold nuggets sourced from certified Ghanaian concessions. Minimum purity 92% to 96% Au (22+ karats). Full PMMC assay, customs clearance, and export documentation provided.',
    specifications: {
      'Au Purity': '92% - 96.5% (22K - 23.16K)',
      'Form': 'Alluvial Dust & Granular Nuggets',
      'Origin': 'Accra, Ghana (Concession Sites)',
      'Assay Report': 'PMMC Ghana & SGS Certified',
      'Packaging': 'Tamper-Evident Metal Boxes'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 38
  },
  {
    id: 'prod-th-gold-0-2',
    title: 'Smelted Gold Dore Bars (1kg / 12.5kg Bars 96%+ Purity)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-0',
    supplierName: 'Madebet Minerals Limited',
    supplierCountry: 'United States - Connecticut',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '25 Kilograms',
    priceRangeUsd: '$69,200 - $72,500 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'],
    description: 'Unrefined smelted Gold Dore Bars suitable for delivery to accredited international refineries. Standard bars with stamped weights, serial numbers, and preliminary fire assay reports.',
    specifications: {
      'Purity': '96.2% - 98.4%',
      'Weight per Bar': '1 kg / 32.15 troy oz (or 12.5 kg)',
      'Origin': 'Ghana / West Africa',
      'Inspection': 'SGS / Ministry of Mines Export Certificate'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 24
  },

  // 1. Celia Consulting (comp-th-gold-1)
  {
    id: 'prod-th-gold-1-1',
    title: 'Physical Gold Bullion Bars 999.9 Fine (1kg LBMA Hallmarked)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-1',
    supplierName: 'Celia Consulting',
    supplierCountry: 'United States - New York',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '50 Kilograms',
    priceRangeUsd: '$73,500 - $75,000 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'Allocated physical 1kg gold bullion bars (999.9 fine) from LBMA-accredited refiners. Safe custody in bonded depository vaults with ledger-to-ledger or FOB/CIF delivery upon bank verification.',
    specifications: {
      'Fineness': '999.9 / 24 Karat Fine Gold',
      'Hallmark': 'LBMA / Valcambi / Heraeus / Perth Mint',
      'Custody': 'Bonded Depository Vault (Zurich / London / New York)',
      'Transaction Mode': 'Bank-to-Bank SWIFT MT103'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 45
  },

  // 2. Brown's Global Exchange (comp-th-gold-2)
  {
    id: 'prod-th-gold-2-1',
    title: 'High-Purity Iridium Powder & Sintered Iridium Crucibles (99.95%)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-2',
    supplierName: "Brown's Global Exchange",
    supplierCountry: 'United States - Illinois',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1 Kilogram',
    priceRangeUsd: '$150,000 - $165,000 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'Ultra-pure Iridium powder (-200 mesh) and custom deep-drawn Iridium crucibles (99.95% min purity). Engineered for single crystal growth (laser crystal fabrication, Czochralski process) and spark plug electrode manufacture.',
    specifications: {
      'Purity': '99.95% min Ir',
      'Mesh Size': '-200 to -325 mesh (powder) or custom crucibles',
      'Melting Point': '2,446 °C',
      'Origin': 'USA / Global Certified Refiners'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 52
  },

  // 3. Mustache Gold and Silver (comp-th-gold-3)
  {
    id: 'prod-th-gold-3-1',
    title: 'Wholesale Karat Gold Scrap Parcels (10k, 14k, 18k, 22k Melt)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-3',
    supplierName: 'Mustache Gold and Silver',
    supplierCountry: 'United States - Colorado',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '5 Kilograms',
    priceRangeUsd: '$52,000 - $55,000 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'],
    description: 'Pre-sorted wholesale melting scrap parcels consisting of estate jewelry, broken gold chains, watch casings, casting scrap, and clean bench sweeps. All lots tested by Thermo Scientific Niton XRF analyzers.',
    specifications: {
      'Average Fine Gold Content': '58.3% - 75.0% (14K - 18K Equivalent)',
      'Assay Method': 'XRF & Fire Assay Certified',
      'Origin': 'Denver, Colorado, USA',
      'Turnaround': 'Immediate dispatch from vault'
    },
    featured: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 31
  },

  // 4. Nknowvative Consulting (comp-th-gold-4)
  {
    id: 'prod-th-gold-4-1',
    title: 'High-Grade Natural Coltan Ore (Ta2O5 30%+ / Nb2O5 20%+)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Rare Earth & Industrial Ores',
    supplierId: 'comp-th-gold-4',
    supplierName: 'Nknowvative Consulting',
    supplierCountry: 'United States - California',
    supplierIsVerified: true,
    supplierTier: 'SILVER',
    minOrderQuantity: '25 MT',
    priceRangeUsd: '$120 - $145 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'High concentration Columbite-Tantalite (Coltan) mineral ore. Verified conflict-free with full traceability certificates. Ideal for electronic capacitor manufacturing, tantalum carbide tooling, and superalloys.',
    specifications: {
      'Ta2O5 Content': '30% - 38% min',
      'Nb2O5 Content': '20% - 25%',
      'U+Th Radiation': '< 0.5% (Safe Transport Compliant)',
      'Packaging': 'Steel Drums / 1 MT Big Bags'
    },
    featured: false,
    inStock: true,
    rating: 4.6,
    reviewCount: 19
  },

  // 5. Kax Group Llc (comp-th-gold-5)
  {
    id: 'prod-th-gold-5-1',
    title: 'Natural Uncut Rough Diamond Parcels (Kimberley Certified 2ct-10ct)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-5',
    supplierName: 'Kax Group Llc',
    supplierCountry: 'United States - New York',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '500 Carats',
    priceRangeUsd: '$1,800 - $2,400 / Carat',
    unit: 'Carats',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'Certified natural gem-quality rough diamond parcels ranging from 2.0 to 10.0+ carats per stone. Accompanied by original Kimberley Process Certificates and GIA Gemological appraisals.',
    specifications: {
      'Clarity Range': 'VVS1 to SI1',
      'Color Grade': 'D - H (Exceptional White to Near Colorless)',
      'Certification': 'Kimberley Process Compliant',
      'Origin': 'Botswana / South Africa / Canada'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 64
  },

  // 6. Gsk Global Traders (comp-th-gold-6)
  {
    id: 'prod-th-gold-6-1',
    title: 'Standard Gold Dore Bars 22K (96.5% Min Au) - Direct Offtake',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-6',
    supplierName: 'Gsk Global Traders',
    supplierCountry: 'United States - California',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '20 Kilograms',
    priceRangeUsd: '$68,900 - $71,800 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
    description: 'Direct mine-gate gold dore bars with 96.5%+ Au fineness. Clean title, free of liens and encumbrances. Delivered CIF to buyer designated international refinery with standard assay protocol.',
    specifications: {
      'Au Purity': '96.5% - 97.8%',
      'Bar Weight': '1 kg each',
      'Incoterms': 'CIF / FOB Los Angeles or Houston',
      'Inspection': 'Refinery Fire Assay & ICP Spectrometry'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 29
  },

  // 7. Peddy Pedro Enterprise (comp-th-gold-7)
  {
    id: 'prod-th-gold-7-1',
    title: 'Refined Pure White Cane Sugar ICUMSA 45 (50kg Export Bags)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Sugar & Agro Commodities',
    supplierId: 'comp-th-gold-7',
    supplierName: 'Peddy Pedro Enterprise',
    supplierCountry: 'United States - New York',
    supplierIsVerified: true,
    supplierTier: 'SILVER',
    minOrderQuantity: '500 MT',
    priceRangeUsd: '$410 - $450 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1581447109200-bf276912b649?w=800&auto=format&fit=crop&q=80'],
    description: 'Premium Brazilian cane sugar ICUMSA 45 for human consumption. Sparkling white crystal sugar packed in 50kg poly-lined export bags. SGS quality and weight certificates included.',
    specifications: {
      'Polarization': '99.80% min',
      'Moisture': '0.04% max',
      'ICUMSA Rating': '45 RBU max',
      'Origin': 'Brazil / Global Ports'
    },
    featured: false,
    inStock: true,
    rating: 4.5,
    reviewCount: 16
  },

  // 8. Gsk Global Traders Mining Division (comp-th-gold-8)
  {
    id: 'prod-th-gold-8-1',
    title: 'Electrolytic Copper Cathodes Grade A 99.99% (LME Standard)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Industrial Metals & Non-Ferrous',
    supplierId: 'comp-th-gold-8',
    supplierName: 'Gsk Global Traders Mining Division',
    supplierCountry: 'United States - California',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100 MT',
    priceRangeUsd: '$8,950 - $9,350 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
    description: 'High-purity Grade A Electrolytic Copper Cathodes (Cu 99.99% min) conforming to BS EN 1978:1998 (Cu-ETP-2) standards. Available for spot purchase or multi-year contracts with CIF delivery.',
    specifications: {
      'Copper Purity': '99.99% (ASTM B115)',
      'Dimensions': '914mm x 914mm x 12mm',
      'Weight per Sheet': '125 kg approx (+/- 1%)',
      'Packaging': 'Palletized & Steel Strapped Bundles'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 56
  },

  // 9. Lead Technologies (comp-th-gold-9)
  {
    id: 'prod-th-gold-9-1',
    title: 'Ultra-Low Sulfur Diesel EN590 10PPM & Aviation Kerosene Jet A-1',
    category: 'Energy & Fuels',
    subCategory: 'Petroleum & Refined Fuels',
    supplierId: 'comp-th-gold-9',
    supplierName: 'Lead Technologies',
    supplierCountry: 'United States - Wyoming',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '50,000 MT',
    priceRangeUsd: '$610 - $650 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80'],
    description: 'Commercial vessel and tank-to-tank allocations of EN590 (10PPM Euro 5/6) automotive diesel fuel and Jet A-1 aviation kerosene. Verifiable POP and standard banking procedures (SBLC / MT103).',
    specifications: {
      'Sulfur Content': 'Max 10 mg/kg (10 PPM)',
      'Flash Point': 'Min 55 °C',
      'Density @ 15°C': '0.820 - 0.845 kg/l',
      'Delivery Ports': 'Houston / Rotterdam / Fujairah'
    },
    featured: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 22
  },

  // 10. Rudkav International Pvt.Ltd (comp-th-gold-10)
  {
    id: 'prod-th-gold-10-1',
    title: 'Primary Aluminum Ingot A7 Grade (Al 99.70% Purity)',
    category: 'Metals & Metallurgy',
    subCategory: 'Aluminum Scrap & Alloys',
    supplierId: 'comp-th-gold-10',
    supplierName: 'Rudkav International Pvt.Ltd',
    supplierCountry: 'United States - Texas',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '50 MT',
    priceRangeUsd: '$2,350 - $2,480 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
    description: 'Primary electrolytic aluminum ingots grade A7 (GB/T 1196-2008 / Al99.70). Excellent ductility and conductivity for architectural extrusion, continuous sheet casting, and automotive alloy smelting.',
    specifications: {
      'Al Purity': '99.70% min',
      'Fe Content': '0.20% max',
      'Si Content': '0.10% max',
      'Ingot Weight': '20kg - 25kg / ingot'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 36
  },

  // 11. JL Enterprises (comp-th-gold-11)
  {
    id: 'prod-th-gold-11-1',
    title: 'LBMA Certified Good Delivery Gold Bars (400 oz / 12.5 kg)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-11',
    supplierName: 'JL Enterprises',
    supplierCountry: 'United States - New York',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100 Kilograms',
    priceRangeUsd: '$73,800 - $74,900 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'Institutional-grade London Good Delivery gold bullion bars (approx. 400 troy ounces / 12.5 kg each) with minimum fineness of 995.0 parts per thousand. Stamped with refiner mark, assay, serial number, and year of manufacture.',
    specifications: {
      'Fineness': '995.0 to 999.9 parts per 1,000',
      'Weight': 'Approx 400 troy ounces (12.44 kg - 12.5 kg)',
      'Accreditation': 'LBMA / COMEX Good Delivery List',
      'Vaulting': 'Bank-to-Bank Vault Transfer (Zurich / London / New York)'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 88
  },

  // 12. Gannon & Scott Inc (comp-th-gold-12)
  {
    id: 'prod-th-gold-12-1',
    title: 'Secondary Refined Fine Gold Grain & Casting Shot (.9999 Fine)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-12',
    supplierName: 'Gannon & Scott Inc',
    supplierCountry: 'United States - Arizona',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1 Kilogram',
    priceRangeUsd: '$74,200 - $75,500 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'High-purity 99.99% (Four Nines) fine gold casting grain produced from state-of-the-art thermal reduction and electrolytic refining processes. Optimal granule morphology for investment casting and jewelers.',
    specifications: {
      'Purity': '99.99% Au (24 Karat Pure)',
      'Form': 'Spherical & teardrop casting grain',
      'Refining Process': 'Thermal Reduction & Electrolytic Wohlwill Cell',
      'Origin': 'Phoenix, AZ / Cranston, RI, USA'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 112
  },

  // 13. Minetech Co., Limited (comp-th-gold-13)
  {
    id: 'prod-th-gold-13-1',
    title: 'Mobile Alluvial Gold Washing Trommel Plant & Centrifugal Concentrator',
    category: 'Industrial Machinery & Tools',
    subCategory: 'Mining & Mineral Processing Machinery',
    supplierId: 'comp-th-gold-13',
    supplierName: 'Minetech Co., Limited',
    supplierCountry: 'United States - California',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$38,000 - $65,000 / Set',
    unit: 'Sets',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
    description: 'Heavy duty wheel-mounted mobile gold rotary trommel scrubber equipped with Knelson-type centrifugal gravity concentrators, high-pressure water manifolds, and sluice boxes with gold capture miner moss carpet.',
    specifications: {
      'Capacity': '50 - 150 Tons Per Hour (TPH)',
      'Drum Diameter': '1200mm - 1800mm',
      'Power Source': 'Integrated Cummins Diesel Generator',
      'Gold Recovery Rate': 'Up to 98% for fine gold (-200 mesh)'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 41
  },

  // 14. Gig for International Trading and Consulting (comp-th-gold-14)
  {
    id: 'prod-th-gold-14-1',
    title: 'Investment Cast Gold Bars 24K (100g / 500g / 1kg Assayed)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-14',
    supplierName: 'Gig for International Trading and Consulting',
    supplierCountry: 'United States - Texas',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '5 Kilograms',
    priceRangeUsd: '$73,000 - $74,800 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'Premium minted and cast gold bars with individual tamper-proof CertiPAMP security blister cards. Serialized with official certificate of assay, ready for physical vault storage or direct import.',
    specifications: {
      'Metal': 'Fine Gold 999.9',
      'Weights Available': '100g, 250g, 500g, 1000g',
      'Security Packaging': 'CertiPAMP blister with UV security mark',
      'Origin': 'USA / Switzerland'
    },
    featured: false,
    inStock: true,
    rating: 4.7,
    reviewCount: 27
  },

  // 15. Anbao Group Co., Limited (comp-th-gold-15)
  {
    id: 'prod-th-gold-15-1',
    title: 'Hard Chrome Plated Piston Rods & Honed Tubes for Heavy Mining Machinery',
    category: 'Industrial Machinery & Tools',
    subCategory: 'Hydraulic Components & Steel Pipes',
    supplierId: 'comp-th-gold-15',
    supplierName: 'Anbao Group Co., Limited',
    supplierCountry: 'United States - California',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '5 MT',
    priceRangeUsd: '$1,650 - $2,200 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
    description: 'Precision hard chrome plated piston rods (CK45, 42CrMo4) and cold drawn hydraulic cylinder honed tubes (ST52, E355). Engineered to withstand extreme mechanical loads in Caterpillar and Komatsu mining excavators.',
    specifications: {
      'Steel Grade': 'CK45 / 42CrMo4 / ST52 / E355',
      'Chrome Layer': 'Min 20 - 30 microns (Corrosion resistance 120hrs NSS)',
      'Tolerance': 'ISO f7 / f8, Inner Honed H8 / H9',
      'Diameter Range': 'OD 12mm - 350mm'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 63
  },

  // 16. Henan Mingyuan Heavy Industrial Equipment Co., LTD (comp-th-gold-16)
  {
    id: 'prod-th-gold-16-1',
    title: 'High-Capacity Primary Jaw Crusher & Ball Mill for Gold Ore Beneficiation',
    category: 'Industrial Machinery & Tools',
    subCategory: 'Mining & Mineral Processing Machinery',
    supplierId: 'comp-th-gold-16',
    supplierName: 'Henan Mingyuan Heavy Industrial Equipment Co., LTD',
    supplierCountry: 'United States - Arizona',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$42,000 - $125,000 / Set',
    unit: 'Sets',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
    description: 'Complete gold ore crushing and grinding production line equipment. Heavy-duty PE/PEX Jaw Crushers paired with overflow energy-saving Ball Mills for optimal ore liberation prior to leaching or gravity separation.',
    specifications: {
      'Feed Size': 'Max 500mm - 800mm',
      'Discharge Size': '0.074mm - 10mm adjustable',
      'Processing Capacity': '10 - 200 TPH',
      'Liner Material': 'High Manganese Steel (Mn18Cr2)'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 35
  },

  // 17. Golden State Mint (comp-th-gold-17)
  {
    id: 'prod-th-gold-17-1',
    title: '1 oz .9999 Pure Fine Gold Bullion Rounds & Minted Bars (ISO 9001)',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-17',
    supplierName: 'Golden State Mint',
    supplierCountry: 'United States - Florida',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '10 Ounces',
    priceRangeUsd: '$2,380 - $2,490 / Ounce',
    unit: 'Ounces',
    images: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'],
    description: 'Freshly minted 1 troy ounce .9999 (24k) pure gold rounds and ingots from Golden State Mint. Beautiful mirror-finish relief strike, frosted fields, and anti-counterfeit reeded edges. IRA eligible.',
    specifications: {
      'Gold Purity': '.9999 Fine Gold (24 Karat)',
      'Weight': '1.00 Troy Ounce (31.103 grams)',
      'Diameter': '32.6 mm',
      'Mint': 'Golden State Mint, Sanford, Florida, USA'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 154
  },
  {
    id: 'prod-th-gold-17-2',
    title: '100 oz .999 Fine Silver Cast Bullion Ingot Bars',
    category: 'Minerals & Metallurgy',
    subCategory: 'Precious Metals & Bullion',
    supplierId: 'comp-th-gold-17',
    supplierName: 'Golden State Mint',
    supplierCountry: 'United States - Florida',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '5 Bars',
    priceRangeUsd: '$3,150 - $3,350 / Bar',
    unit: 'Bars',
    images: ['https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80'],
    description: 'Hand-poured and cast 100 troy ounce .999 fine silver bullion bars. Stamped with GSM logo, exact weight, and certified purity. Industry standard for low-premium physical silver allocation.',
    specifications: {
      'Silver Purity': '.999 Fine Silver',
      'Net Weight': '100 Troy Ounces (3.11 Kilograms)',
      'Dimensions': '133mm x 76mm x 28mm',
      'Packaging': 'Individual Protective Foam Sleeve & Master Cartons'
    },
    featured: false,
    inStock: true,
    rating: 4.9,
    reviewCount: 96
  },

  // 18. Scrap and Metal Collections Ltd (comp-th-gold-18)
  {
    id: 'prod-th-gold-18-1',
    title: 'Gold Ceramic CPU Processor Scrap (Intel / AMD / Motorola 486 / Pentium)',
    category: 'Metals & Metallurgy',
    subCategory: 'Electronic Scrap & Precious Recovery',
    supplierId: 'comp-th-gold-18',
    supplierName: 'Scrap and Metal Collections Ltd',
    supplierCountry: 'United States - Colorado',
    supplierIsVerified: true,
    supplierTier: 'SILVER',
    minOrderQuantity: '500 Kilograms',
    priceRangeUsd: '$180 - $260 / Kg',
    unit: 'Kilograms',
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'],
    description: 'High-grade gold-capped ceramic CPU scrap (Intel Pentium Pro, i486, i386, Motorola, Cyrix, AMD). Gold pin intact with high recovery yield of Au (0.5g to 2.5g Au per chip). Ideal for chemical and thermal refiners.',
    specifications: {
      'Material': 'Gold Capped Ceramic Package & Gold Pins',
      'Au Recovery Yield': '150g - 350g Au per Metric Ton',
      'Origin': 'Colorado Springs, CO, USA',
      'Packaging': 'Reinforced Fiber Drums / Gaylord Boxes'
    },
    featured: true,
    inStock: true,
    rating: 4.7,
    reviewCount: 33
  },

  // 19. Map Scraps Ltd (comp-th-gold-19)
  {
    id: 'prod-th-gold-19-1',
    title: 'Heavy Melting Steel Scrap HMS 1 & HMS 2 (80:20 Blend Standard)',
    category: 'Metals & Metallurgy',
    subCategory: 'Ferrous Scrap & Steel',
    supplierId: 'comp-th-gold-19',
    supplierName: 'Map Scraps Ltd',
    supplierCountry: 'United States - Texas',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '500 MT',
    priceRangeUsd: '$340 - $375 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
    description: 'High-density Heavy Melting Steel Scrap ISRI Code 200-206 (HMS 1/2 80:20 blend). Free of excessive rust, closed containers, explosives, and non-metallic contamination. Sourced from industrial demolitions.',
    specifications: {
      'Grade': 'ISRI 200-202 (HMS 1 min 6mm) / ISRI 203-206 (HMS 2 min 3mm)',
      'Dimensions': 'Max 1.5m x 0.5m x 0.5m pieces for furnace charging',
      'Density': 'Min 0.8 MT / cubic meter',
      'Shipment': 'Containerized (25 MT / 20ft FCL) or Bulk Vessel'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 47
  }
];
