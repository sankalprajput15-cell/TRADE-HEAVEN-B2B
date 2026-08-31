import { Product } from '../types';

export const EC21_SEAFOOD_PRODUCTS: Product[] = [
  // 1. Jiangsu Youzhiqing - Seasoned Chuka Wakame Seaweed Salad
  {
    id: 'prod-ec21-sea-1',
    title: 'Frozen Seasoned Chuka Wakame Seaweed Salad with Roasted Sesame & Agar',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Seafood & Seaweed Products',
    supplierId: 'comp-ec21-sea-1',
    supplierName: 'Jiangsu Youzhiqing Food Co.,Ltd.',
    supplierCountry: 'China',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '2,000 KG',
    priceRangeUsd: '$2.80 - $3.40 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop&q=80'],
    description: 'Crisp, emerald green seasoned Undaria pinnatifida seaweed salad mixed with toasted sesame seeds, wood ear mushroom strips, chili rings, and pure sesame oil. Ready-to-eat appetizer for Japanese restaurant dining.',
    specifications: {
      'Main Ingredients': 'Wakame Seaweed (≥ 80%), Agar-Agar, Sesame Oil, Toasted White Sesame, Chili Flakes',
      'Storage Condition': 'Keep Frozen at -18°C (Shelf Life: 24 Months)',
      'Packing Format': '1kg Vacuum Bag (10 bags/carton) or 500g Retail Pouches',
      'Certifications': 'HACCP, ISO 22000, BRC Global, HALAL, FDA Registered'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 64
  },

  // 2. Fujian Hong An - Grade Gold Roasted Sushi Nori Sheets
  {
    id: 'prod-ec21-sea-2',
    title: 'Grade Gold Roasted Sushi Nori Sheets (Porphyra Yezoensis 100-Full Sheets)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Seaweed & Japanese Cuisine',
    supplierId: 'comp-ec21-sea-3',
    supplierName: 'Fujian Hong An Food Co., Ltd.',
    supplierCountry: 'China',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '500 Bags',
    priceRangeUsd: '$7.80 - $9.20 / Bag',
    unit: 'Bags',
    images: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80'],
    description: 'First-harvest Grade Gold roasted sushi nori seaweed sheets. Dark green-black luster, delicate umami flavor, and exceptional crispness that rolls cleanly around sushi rice without cracking.',
    specifications: {
      'Sheet Dimensions': 'Full Sheet: 21 cm x 19 cm (approx. 2.8g - 3.0g / sheet)',
      'Grade Quality': 'Grade Gold (A), Grade Silver (B), Grade Blue (C)',
      'Packing': '50 or 100 sheets per aluminum foil zip bag with desiccant (80 bags/carton)',
      'Certifications': 'Organic USDA / EU Bio, HACCP, ISO 22000, KOSHER, HALAL'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 82
  },

  // 3. PT Agro Global - Wild Sun-Dried Golden Sandfish Sea Cucumber
  {
    id: 'prod-ec21-sea-3',
    title: 'Wild-Caught Sun-Dried Golden Sandfish & White Teatfish Sea Cucumber (Teripang)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Dried Marine Delicacies',
    supplierId: 'comp-ec21-sea-2',
    supplierName: 'PT Agro Global Nusantara Berkah',
    supplierCountry: 'Indonesia',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '50 KG',
    priceRangeUsd: '$180 - $260 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'],
    description: 'Sustainably hand-harvested wild tropical sea cucumber from Indonesian coral reef waters. 100% naturally gut-cleaned, boiled, and sun-dried to <8% moisture. Exceptionally high collagen and chondroitin content.',
    specifications: {
      'Species': 'Holothuria scabra (Sandfish) / Holothuria fuscogilva (White Teat)',
      'Moisture Content': '≤ 7% - 8% (Completely Dry)',
      'Grading': 'Size L (15-20 pcs/kg), Size M (25-35 pcs/kg), Size S (40-50 pcs/kg)',
      'Packaging': '25kg Poly-woven bags or vacuum-sealed 1kg packs in export cartons',
      'Certifications': 'Indonesian Quarantine Health Certificate, CITES Non-Detriment Compliant'
    },
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 31
  },

  // 4. Sea Breeze Group - Premium Bohai Gulf Artemia Cysts (Brine Shrimp Eggs)
  {
    id: 'prod-ec21-sea-4',
    title: 'Bohai Gulf Artemia Cysts (Hatching Rate ≥ 90%, 260,000+ NPL/g)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Aquaculture Feeds & Hatchery Nutrition',
    supplierId: 'comp-ec21-sea-6',
    supplierName: 'Sea Breeze Group Company',
    supplierCountry: 'China',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '24 Cans',
    priceRangeUsd: '$38 - $46 / Can',
    unit: 'Cans',
    images: ['https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'],
    description: 'Industry benchmark aquaculture starter feed harvested from pristine hypersaline salt lakes in Bohai Bay. High hatching synchronization, rich in highly unsaturated fatty acids (HUFA/DHA/EPA).',
    specifications: {
      'Hatching Rate': '≥ 90% (Grade AAA)',
      'Nauplii Output': '≥ 260,000 Nauplii per Gram (NPL/g)',
      'Moisture Content': '≤ 7.5% Vacuum Sealed with Nitrogen Flush',
      'Packaging': '425g Cans (12 cans/carton) or 500g Vacuum Pouch',
      'Certifications': 'CIQ Export Quarantine Certificate, ISO 9001, HACCP'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 94
  },

  // 5. Duc Phuc - Well-Trimmed Pangasius Basa Fillets (Skinless/Boneless)
  {
    id: 'prod-ec21-sea-5',
    title: 'Frozen White Meat Pangasius (Basa) Fillets (Well-Trimmed, Skinless & Boneless)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Frozen Fish Fillets',
    supplierId: 'comp-ec21-sea-10',
    supplierName: 'Duc Phuc Import Export Co. Ltd',
    supplierCountry: 'Vietnam',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '25,000 KG',
    priceRangeUsd: '$2.15 - $2.45 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop&q=80'],
    description: 'ASC and GlobalGAP certified white meat Pangasius Hypophthalmus fillets farmed in the clean waters of the Mekong Delta. 100% skinless, boneless, red meat removed, belly fat trimmed, and individually quick frozen (IQF).',
    specifications: {
      'Trimming Grade': 'Well-Trimmed (White Meat, Belly Fat Off, Red Meat Off)',
      'Glazing Percentage': '10%, 15%, 20% or 0% Net Weight as required',
      'Size Distribution': '120-170g, 170-220g, 220g+ (4-6oz, 6-8oz, 8-10oz)',
      'Packaging': '10kg IQF Bulk Master Carton or 1kg Plain/Printed Retail Bag',
      'Certifications': 'ASC, BAP 4-Star, BRC Global Standard, IFS, HALAL'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 75
  },

  // 6. Seahawk Foods India - IQF Frozen Vannamei White Shrimp (Hatchery Certified)
  {
    id: 'prod-ec21-sea-6',
    title: 'Frozen Indian Vannamei White Shrimp (Headless Shell-On & Peeled Deveined)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Prawns & Crustaceans',
    supplierId: 'comp-ec21-sea-8',
    supplierName: 'Seahawk Foods India',
    supplierCountry: 'India',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '10,000 KG',
    priceRangeUsd: '$6.80 - $8.90 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'],
    description: 'Farm-fresh Indian Vannamei white shrimp processed within 2 hours of harvesting in Kochi. Available in HLSO, PD (Peeled & Deveined), PUD, and Tail-On formats. Zero antibiotic residue guarantee (EU/USFDA compliant).',
    specifications: {
      'Processing Format': 'IQF / Semi-IQF / Block Frozen',
      'Size Counts (pcs/lb)': '16/20, 21/25, 26/30, 31/40, 41/50, 51/60',
      'Chemical Treatment': 'Non-Treated (EU Grade) or Moisture Retentive Treated',
      'Packaging': '1kg Polybag (10 bags/master carton) or 1.8kg/2kg Blocks',
      'Certifications': 'BAP 4-Star, BRC Food Grade AA, HACCP, EIA India Approved'
    },
    featured: false,
    inStock: true,
    rating: 4.9,
    reviewCount: 68
  },

  // 7. Dongsung Enterprise - Cooked Frozen Snow Crab Sections (Chionoecetes Opilio)
  {
    id: 'prod-ec21-sea-7',
    title: 'Cooked Frozen Snow Crab Clusters & Sections (Chionoecetes Opilio / Bairdi)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Crabs & Shellfish',
    supplierId: 'comp-ec21-sea-14',
    supplierName: 'Dongsung Enterprise / Jisan Global Corp',
    supplierCountry: 'Korea',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1,000 KG',
    priceRangeUsd: '$16.50 - $22.00 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop&q=80'],
    description: 'Ocean-harvested wild Snow Crab harvested from deep sub-Arctic seas, freshly boiled in seawater on vessel, and brine blast-frozen into intact leg/shoulder sections with sweet, succulently tender meat.',
    specifications: {
      'Cluster Sizes': '2L (150-200g), 3L (200-250g), 4L (250-300g), 5L (300g+)',
      'Meat Fill Rate': '≥ 85% - 90% High Meat Fill Guarantee',
      'Salt Level': '1.5% - 2.2% (Perfect Table Taste)',
      'Packaging': '5kg or 10kg Master Cartons with thermal insulation liner',
      'Certifications': 'HACCP, ISO 22000, MSC Sustainable Fishery Certified'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 47
  }
];
