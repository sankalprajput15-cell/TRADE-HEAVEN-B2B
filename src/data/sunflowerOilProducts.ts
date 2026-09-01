import { Product } from '../types';

export const GLOBAL_SUNFLOWER_OIL_PRODUCTS: Product[] = [
  {
    id: 'prod-sunflower-01',
    supplierId: 'comp-sunflower-03',
    supplierName: 'Bruce Sunflower Oil LTD',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 96,
    supplierIsVerified: true,
    title: '100% Pure Refined Sunflower Oil (Grade A Winterized & Deodorized)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '20 Metric Tons',
    priceRangeUsd: '$850 - $920 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 880,
    moq: 20,
    moqUnit: 'Metric Tons',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 50,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Refined Sunflower Oil, 100% Pure, Competitive price, Cooking oil. Premium light yellow, odorless, high-smoke point refined edible oil. Free from foreign odours, fully winterized with zero cholesterol and rich in Vitamin E. Available in 1L, 5L PET bottles, flexitanks (22,000L), and 200L steel drums.',
    priceTiers: [
      { minUnits: 20, maxUnits: 100, priceUsd: 920 },
      { minUnits: 101, maxUnits: 500, priceUsd: 880 },
      { minUnits: 501, priceUsd: 850 }
    ],
    specifications: [
      { name: 'Specific Gravity at 20°C', value: '0.916 - 0.923' },
      { name: 'Refractive Index at 20°C', value: '1.472 - 1.474' },
      { name: 'Free Fatty Acids (FFA)', value: 'Max 0.1%' },
      { name: 'Peroxide Value', value: 'Max 1.0 meq/kg' },
      { name: 'Moisture & Volatile Matter', value: 'Max 0.05%' },
      { name: 'Smoking Point', value: 'Min 230°C' },
      { name: 'Packaging Options', value: '1L/5L PET Bottles, 22MT Flexitanks, 1000L IBC' }
    ]
  },
  {
    id: 'prod-sunflower-02',
    supplierId: 'comp-sunflower-07',
    supplierName: 'Sunflower Oil Giants',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'Bulk Export Refined Sunflower Oil in Flexitank & IBC Totes (22MT)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '22 Metric Tons',
    priceRangeUsd: '$840 - $910 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 865,
    moq: 22,
    moqUnit: 'Metric Tons',
    leadTimeDays: 10,
    sampleAvailable: true,
    samplePriceUsd: 40,
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of sunflower oil, oil, agricultural seed. Best quality sunflower oil worldwide with 24/7 dedicated support teams for bulk vessel and flexitank container logistics. SGS certified at port of loading.',
    priceTiers: [
      { minUnits: 22, maxUnits: 150, priceUsd: 910 },
      { minUnits: 151, maxUnits: 1000, priceUsd: 865 },
      { minUnits: 1001, priceUsd: 840 }
    ],
    specifications: [
      { name: 'Grade', value: 'Human Consumption Grade A Refined' },
      { name: 'Taste & Odour', value: 'Neutral, characteristic of pure sunflower' },
      { name: 'Acid Value', value: 'Max 0.2 mg KOH/g' },
      { name: 'Iodine Value (WIJS)', value: '118 - 141' },
      { name: 'Saponification Value', value: '188 - 194 mg KOH/g' },
      { name: 'Certifications', value: 'ISO 22000, HACCP, Halal, Kosher, Non-GMO' }
    ]
  },
  {
    id: 'prod-sunflower-03',
    supplierId: 'comp-sunflower-11',
    supplierName: 'Agc Export S.A',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 99,
    supplierIsVerified: true,
    title: 'Commercial Pure Refined Sunflower Oil & Multi-Seed Edible Cooking Oils',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '50 Metric Tons',
    priceRangeUsd: '$830 - $890 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 850,
    moq: 50,
    moqUnit: 'Metric Tons',
    leadTimeDays: 12,
    sampleAvailable: true,
    samplePriceUsd: 60,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Corn Oil, Soybean Oil, Peanut Oil, Rapeseed Oil, Sunflower Oil, Coconut Oil, Cooking Oil, Vegetable Oil, Edible Oils. Direct farm-to-table refinery output with over 30 years of global distribution.',
    priceTiers: [
      { minUnits: 50, maxUnits: 250, priceUsd: 890 },
      { minUnits: 251, maxUnits: 1500, priceUsd: 850 },
      { minUnits: 1501, priceUsd: 830 }
    ],
    specifications: [
      { name: 'Appearance', value: 'Clear, light yellow liquid without sediment' },
      { name: 'Color (Lovibond 5 1/4")', value: 'Max 1.5 Red, 15 Yellow' },
      { name: 'FFA (as Oleic)', value: 'Max 0.08%' },
      { name: 'Cold Test (5.5 hrs at 0°C)', value: 'Passed / Clear' },
      { name: 'Supply Capacity', value: '15,000 MT / Month' }
    ]
  },
  {
    id: 'prod-sunflower-04',
    supplierId: 'comp-sunflower-10',
    supplierName: 'Eniva USA Inc',
    supplierCountry: 'United States',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    supplierIsVerified: true,
    title: 'Narisara Organic Refined Sunflower Oil (Bottled 1L, 2L, 5L for Supermarkets)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '1000 Cartons',
    priceRangeUsd: '$12.50 - $16.80 / Carton',
    unit: 'Cartons',
    fobPriceUsd: 14.20,
    moq: 1000,
    moqUnit: 'Cartons',
    leadTimeDays: 15,
    sampleAvailable: true,
    samplePriceUsd: 30,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Narisara Oil Export division under Eniva USA Inc. Leading provider of organic and edible oils. High-grade bottled sunflower oil packaged in private label or OEM cartons (12 x 1L or 4 x 5L bottles per carton).',
    priceTiers: [
      { minUnits: 1000, maxUnits: 5000, priceUsd: 16.80 },
      { minUnits: 5001, maxUnits: 20000, priceUsd: 14.20 },
      { minUnits: 20001, priceUsd: 12.50 }
    ],
    specifications: [
      { name: 'Bottle Sizes', value: '1L, 1.8L, 2L, 3L, 5L PET Bottles' },
      { name: 'Carton Packing', value: '12 x 1L or 4 x 5L per master carton' },
      { name: 'Purity', value: '100% Pure Sunflower Oil' },
      { name: 'Preservatives', value: 'None (100% Natural)' },
      { name: 'Shelf Life', value: '24 Months' }
    ]
  },
  {
    id: 'prod-sunflower-05',
    supplierId: 'comp-sunflower-14',
    supplierName: 'DENISMARK443',
    supplierCountry: 'United States',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    supplierIsVerified: true,
    title: 'Light Yellow Refined Deodorized Sunflower Oil (100% Pure Food Grade)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '25 Metric Tons',
    priceRangeUsd: '$860 - $930 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 890,
    moq: 25,
    moqUnit: 'Metric Tons',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 45,
    images: [
      'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Suppliers of BEST QUALITY Refined Sun Flower oil and looking for serious buyers. Our sunflower oil is selected light yellow grade, 100% pure refined deodorized winterized with comprehensive export documents.',
    priceTiers: [
      { minUnits: 25, maxUnits: 200, priceUsd: 930 },
      { minUnits: 201, maxUnits: 1000, priceUsd: 890 },
      { minUnits: 1001, priceUsd: 860 }
    ],
    specifications: [
      { name: 'Color', value: 'Clear Light Yellow' },
      { name: 'Acid Value', value: 'Max 0.15 mg KOH/g' },
      { name: 'Peroxide Number', value: 'Max 0.8 meq O2/kg' },
      { name: 'Insoluble Impurities', value: 'Max 0.01%' },
      { name: 'Certification', value: 'ISO 22000, HACCP, Halal Certified' }
    ]
  },
  {
    id: 'prod-sunflower-06',
    supplierId: 'comp-sunflower-18',
    supplierName: 'Bond Oil Co. LLC',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 98,
    supplierIsVerified: true,
    title: 'Refined Sunflower Oil (RFSO) & Biodiesel Feedstock Crude Sunflower Oil',
    category: 'Fuel & Energy Resources',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '100 Metric Tons',
    priceRangeUsd: '$810 - $875 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 835,
    moq: 100,
    moqUnit: 'Metric Tons',
    leadTimeDays: 12,
    sampleAvailable: true,
    samplePriceUsd: 50,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Bulk exporter of Refined Sunflower Oil (RFSO), Used Cooking Oil (UCO), Canola Rapeseed Oil, and Crude Palm Oil. ASTM and EN14214 certified for both food processors and biofuel refinery production.',
    priceTiers: [
      { minUnits: 100, maxUnits: 500, priceUsd: 875 },
      { minUnits: 501, maxUnits: 2500, priceUsd: 835 },
      { minUnits: 2501, priceUsd: 810 }
    ],
    specifications: [
      { name: 'Grade Options', value: 'RFSO (Food Grade) / CSFO (Technical & Biofuel Grade)' },
      { name: 'Flash Point', value: '> 300°C' },
      { name: 'Density at 15°C', value: '0.920 - 0.925 kg/l' },
      { name: 'Viscosity at 40°C', value: '32.6 mm2/s' },
      { name: 'Standard', value: 'EN 14214 / ASTM D6751 / CODEX STAN 210' }
    ]
  },
  {
    id: 'prod-sunflower-07',
    supplierId: 'comp-sunflower-05',
    supplierName: 'Vitality Nuts Inc',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 95,
    supplierIsVerified: true,
    title: 'California Farm-Pressed Non-GMO Sunflower Oil & Gourmet Almond Oil',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '500 Cases',
    priceRangeUsd: '$24.00 - $32.00 / Case',
    unit: 'Cases',
    fobPriceUsd: 27.50,
    moq: 500,
    moqUnit: 'Cases',
    leadTimeDays: 10,
    sampleAvailable: true,
    samplePriceUsd: 35,
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of California Nuts, Almonds, Food, Snacks, Sunflower Oil. High-oleic cold-pressed sunflower oil extracted from prime California crops. Rich in monounsaturated fats with long stability.',
    priceTiers: [
      { minUnits: 500, maxUnits: 2000, priceUsd: 32.00 },
      { minUnits: 2001, maxUnits: 10000, priceUsd: 27.50 },
      { minUnits: 10001, priceUsd: 24.00 }
    ],
    specifications: [
      { name: 'Oleic Acid (Omega-9)', value: 'Min 82% (High Oleic)' },
      { name: 'Linoleic Acid (Omega-6)', value: 'Max 9%' },
      { name: 'Smoke Point', value: '232°C (450°F)' },
      { name: 'Packaging', value: '6 x 1L Glass Bottles or 12 x 750ml PET' }
    ]
  },
  {
    id: 'prod-sunflower-08',
    supplierId: 'comp-sunflower-01',
    supplierName: 'Beam Copper Company',
    supplierCountry: 'United States',
    supplierTier: 'GOLD',
    supplierTrustScore: 93,
    supplierIsVerified: true,
    title: 'Food-Grade Refined Sunflower Oil in 5L & 20L Jerry Cans (Commercial Kitchens)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '15 Metric Tons',
    priceRangeUsd: '$870 - $940 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 900,
    moq: 15,
    moqUnit: 'Metric Tons',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 40,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of sunflower oil, A4 paper, foodstuffs, paper, frozen food, import and export. Bulk logistics supply of refined sunflower oil tailored for food manufacturing, restaurant chains, and wholesale distributors.',
    priceTiers: [
      { minUnits: 15, maxUnits: 100, priceUsd: 940 },
      { minUnits: 101, maxUnits: 500, priceUsd: 900 },
      { minUnits: 501, priceUsd: 870 }
    ],
    specifications: [
      { name: 'Packaging Type', value: '5L, 10L, 20L HDPE Jerry Cans' },
      { name: 'FFA', value: '< 0.10%' },
      { name: 'Moisture', value: '< 0.05%' },
      { name: 'Preservatives', value: 'Zero Artificial Additives' }
    ]
  },
  {
    id: 'prod-sunflower-09',
    supplierId: 'comp-sunflower-12',
    supplierName: 'Patorl Inc',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'Crude & Refined Sunflower Oil (Continuous Refinery Supply Contracts)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '50 Metric Tons',
    priceRangeUsd: '$825 - $885 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 845,
    moq: 50,
    moqUnit: 'Metric Tons',
    leadTimeDays: 15,
    sampleAvailable: true,
    samplePriceUsd: 50,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of jatropha oil, sunflower oil, soyabean oil, olive oil. Global manufacturer and exporter of refined and crude edible vegetable oils since 1969 with full laboratory analysis sheets.',
    priceTiers: [
      { minUnits: 50, maxUnits: 300, priceUsd: 885 },
      { minUnits: 301, maxUnits: 1500, priceUsd: 845 },
      { minUnits: 1501, priceUsd: 825 }
    ],
    specifications: [
      { name: 'Phosphorus', value: 'Max 5 ppm (Refined)' },
      { name: 'Free Fatty Acids', value: 'Max 0.08%' },
      { name: 'Refining Process', value: 'Full Physical & Chemical Neutralization, Bleaching, Deodorizing, Winterization' }
    ]
  },
  {
    id: 'prod-sunflower-10',
    supplierId: 'comp-sunflower-19',
    supplierName: 'Joll Llc',
    supplierCountry: 'United States',
    supplierTier: 'GOLD',
    supplierTrustScore: 92,
    supplierIsVerified: true,
    title: 'Refined Sunflower Oil & White Refined Cane Sugar (ICUMSA 45)',
    category: 'Farm Products - Grains, Fruits etc',
    subCategory: 'Sunflower Oil',
    minOrderQuantity: '20 Metric Tons',
    priceRangeUsd: '$860 - $935 / MT',
    unit: 'Metric Tons',
    fobPriceUsd: 895,
    moq: 20,
    moqUnit: 'Metric Tons',
    leadTimeDays: 12,
    sampleAvailable: true,
    samplePriceUsd: 40,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of Copper cathode sheets, Aluminum ingots, Sunflower oil, Refined White Sugar, Urea Fertilizer. High quality goods with comprehensive maritime export insurance.',
    priceTiers: [
      { minUnits: 20, maxUnits: 100, priceUsd: 935 },
      { minUnits: 101, maxUnits: 500, priceUsd: 895 },
      { minUnits: 501, priceUsd: 860 }
    ],
    specifications: [
      { name: 'Edible Standard', value: '100% Grade A Sunflower Oil' },
      { name: 'Purity', value: '99.9%' },
      { name: 'Inspection', value: 'SGS / Bureau Veritas at loading port' }
    ]
  }
];
