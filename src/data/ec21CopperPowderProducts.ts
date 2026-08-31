import { Product } from '../types';

export const EC21_COPPER_POWDER_PRODUCTS: Product[] = [
  // 1. Searaven Global Ltd - IGAS-Certified Ultra-Fine Copper Powder (Zurich)
  {
    id: 'prod-ec21-cu-1',
    title: 'IGAS-Certified Ultra-Fine Copper Powder (Purity 99.9995% 5N5 Zurich Origin)',
    category: 'Metals & Metallurgy',
    subCategory: 'High-Purity & Ultrafine Powders',
    supplierId: 'comp-ec21-cu-0',
    supplierName: 'Searaven Global Ltd',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100 Grams',
    priceRangeUsd: '$850 - $1,200 / Gram',
    unit: 'Grams',
    images: ['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80'],
    description: 'High-purity isotopic ultra-fine copper powder certified by IGAS Germany / Zurich vault. Chemical purity ≥ 99.9995% (5N5), isotope Cu63 / Cu65 stabilized, stored in specialized argon-flushed hermetic glass ampoules under security protocols.',
    specifications: {
      'Chemical Purity': '≥ 99.9995% (5N5) Total Metallic Purity',
      'Particle Size Distribution': 'D50 = 0.8 µm - 1.2 µm (Sub-Micron / Nano)',
      'Specific Surface Area': '≥ 4.5 m²/g (BET Method)',
      'Assay Certification': 'IGAS Testing Certificate & Zurich Security Vault SKR',
      'Packaging': 'Argon-Flushed Sealed Glass Ampoules / Steel Flight Cases'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 42
  },

  // 2. Lead Technologies - Nano / Ultrafine Copper & Zinc Powder
  {
    id: 'prod-ec21-cu-2',
    title: 'Ultrafine Nano Copper Powder (Spherical Morphology D50: 1-3 µm Purity 99.99%)',
    category: 'Metals & Metallurgy',
    subCategory: 'Additive Manufacturing & Conductive Inks',
    supplierId: 'comp-ec21-cu-2',
    supplierName: 'Lead Technologies',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '5 KG',
    priceRangeUsd: '$180 - $240 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'Gas-atomized spherical ultrafine copper powder engineered for conductive sintering paste, 3D metal printing, MLCC internal electrodes, and aerospace thermal heat pipes. Extremely low oxygen content (<0.15%).',
    specifications: {
      'Purity': '≥ 99.99% Cu (4N Grade)',
      'Morphology': '100% Spherical with Low Satellite Ratio',
      'Oxygen Content': '≤ 1500 ppm',
      'Apparent Density': '4.8 - 5.2 g/cm³',
      'Packaging': '1kg / 5kg Aluminum Vacuum Foil Bags in 25kg Steel Drums'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 38
  },

  // 3. Jovi International - Precision Copper Foils, Mesh & Shielding Tapes for MRI
  {
    id: 'prod-ec21-cu-3',
    title: 'High Conductivity Electrolytic Copper Foil & RF Shielding Copper Mesh for MRI',
    category: 'Metals & Metallurgy',
    subCategory: 'Electronic Copper Foils & Magnetic Shielding',
    supplierId: 'comp-ec21-cu-3',
    supplierName: 'Jovi International Company',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '50 Square Meters',
    priceRangeUsd: '$24 - $38 / Sq.m',
    unit: 'Sq.m',
    images: ['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80'],
    description: 'High-purity oxygen-free copper foil and seamless RF shielding mesh designed for clinical MRI room Faraday cages, high-frequency electromagnetic interference (EMI) protection, and lithium-ion battery anode current collectors.',
    specifications: {
      'Copper Content': '≥ 99.95% Electrolytic OFHC Copper',
      'Foil Thickness': '9µm, 12µm, 18µm, 35µm, 70µm',
      'Mesh Specifications': '80 Mesh, 100 Mesh, 200 Mesh Woven Wire Cloth',
      'Shielding Effectiveness': '≥ 100 dB (100 kHz - 10 GHz)',
      'Certifications': 'ISO 9001, RoHS, CE Medical Electromagnetic Shielding Compliant'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 55
  },

  // 4. Subseaoilgas - Non-Ferrous Copper Ingot, Wire & Millberry Scrap
  {
    id: 'prod-ec21-cu-4',
    title: 'Non-Ferrous Grade A Electrolytic Copper Cathode & Clean Millberry Wire Scrap',
    category: 'Metals & Metallurgy',
    subCategory: 'Copper Ingot & Metal Scrap',
    supplierId: 'comp-ec21-cu-5',
    supplierName: 'Subseaoilgas',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '25 Metric Tons',
    priceRangeUsd: '$8,400 - $8,900 / MT',
    unit: 'MT',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'LME Non-Ferrous Grade A Electrolytic Copper Cathodes (Cu 99.99%) and Millberry Copper Wire Scrap (99.9% purity). Free from burnt, brittle, or contaminated wires. Supplied with SGS / Alex Stewart inspection.',
    specifications: {
      'Copper Purity': '≥ 99.99% (Cathode) / ≥ 99.9% (Millberry Scrap)',
      'Dimensions': '914mm x 914mm x 12mm (approx. 125 kg/sheet cathode)',
      'Inspection Agency': 'SGS / Alex Stewart / Alfred H Knight Assay Report',
      'Packing': 'Bundled with high-tensile steel straps (2.5 MT per bundle)',
      'Standards': 'ASTM B115-00, LME Grade A, ISRI Millberry / Berry Spec'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 67
  }
];
