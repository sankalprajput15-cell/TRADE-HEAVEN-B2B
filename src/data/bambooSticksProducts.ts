import { Product } from '../types';
import { GLOBAL_BAMBOO_STICKS_COMPANIES } from './bambooSticksCompanies';

export const GLOBAL_BAMBOO_STICKS_PRODUCTS: Product[] = [
  {
    id: "prod-bamboo-01",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[0].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[0].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[0].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[0].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[0].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "1,000 Pieces",
    priceRangeUsd: "$0.01 - $0.05 / Piece",
    unit: "Pieces",
    title: "Eco-Friendly Natural Bamboo Skewers & Teppo Skewers for BBQ and Food Presentation",
    category: "Bamboo & Wood Products",
    subCategory: "Bamboo Sticks & Skewers",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80&sig=10",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80&sig=1"
    ],
    description: "Premium natural bamboo skewers, Teppo skewers, knotted skewers, plant supporters, garden canes, and fruit sticks manufactured by Ganzhou Haicheng Bamboo Industry Co., Ltd.",
    priceTiers: [
      { minUnits: 1000, maxUnits: 10000, priceUsd: 0.04 },
      { minUnits: 10001, maxUnits: 50000, priceUsd: 0.03 },
      { minUnits: 50001, priceUsd: 0.02 }
    ],
    fobPriceUsd: 0.03,
    moq: 1000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 7,
    supportedIncoterms: ["FOB", "CIF", "EXW", "DDP"],
    specifications: [
      { name: "Material", value: "100% Natural Moso Bamboo" },
      { name: "Length", value: "10cm - 30cm (Customizable)" },
      { name: "Grade", value: "Food Grade Premium A" },
      { name: "Application", value: "BBQ, Cocktail, Catering, Gardening" }
    ]
  },
  {
    id: "prod-bamboo-02",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[1].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[1].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[1].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[1].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[1].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "500 Kilograms",
    priceRangeUsd: "$3.50 - $6.20 / Kg",
    unit: "Kilograms",
    title: "Premium Bamboo-Core Incense Sticks & Scented Fragrance Cones (50+ Scents)",
    category: "Bamboo & Wood Products",
    subCategory: "Incense & Raw Materials",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80&sig=12",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80&sig=13"
    ],
    description: "High-grade bamboo-core incense sticks, cone incense, incense sachet, and burners in Floral, Fruity, Woody, and Oriental fragrance families from Jiangsu Honorscent Industrial Development Co., Ltd.",
    priceTiers: [
      { minUnits: 500, maxUnits: 2000, priceUsd: 5.50 },
      { minUnits: 2001, maxUnits: 10000, priceUsd: 4.80 },
      { minUnits: 10001, priceUsd: 4.00 }
    ],
    fobPriceUsd: 4.80,
    moq: 500,
    moqUnit: "Kilograms",
    sampleAvailable: true,
    samplePriceUsd: 40,
    leadTimeDays: 10,
    supportedIncoterms: ["FOB", "CIF", "EXW"],
    specifications: [
      { name: "Fragrance Families", value: "Floral, Fruity, Woody, Oriental" },
      { name: "Core Material", value: "Natural Bamboo" },
      { name: "Burning Time", value: "45 - 60 minutes per stick" }
    ]
  },
  {
    id: "prod-bamboo-03",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[2].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[2].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[2].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[2].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[2].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "5 Metric Tons",
    priceRangeUsd: "$850 - $1,250 / Metric Ton",
    unit: "Metric Tons",
    title: "Raw & Perfume Incense Sticks, Joss Powder, and Bamboo Stick Raw Materials",
    category: "Bamboo & Wood Products",
    subCategory: "Incense Raw Materials",
    images: [
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80&sig=14"
    ],
    description: "Raw INCENSE STICK, Joss powder, wood powder, and bamboo sticks manufactured by Gmex Import Export Joint Stock Company in Hanoi, Vietnam.",
    priceTiers: [
      { minUnits: 5, maxUnits: 20, priceUsd: 1100 },
      { minUnits: 21, maxUnits: 100, priceUsd: 980 },
      { minUnits: 101, priceUsd: 890 }
    ],
    fobPriceUsd: 980,
    moq: 5,
    moqUnit: "Metric Tons",
    sampleAvailable: true,
    samplePriceUsd: 50,
    leadTimeDays: 14,
    supportedIncoterms: ["FOB", "CIF", "CFR", "DDP"],
    specifications: [
      { name: "Origin", value: "Vietnam" },
      { name: "Product Type", value: "Raw Incense Stick & Joss Powder" },
      { name: "Moisture", value: "< 12%" }
    ]
  },
  {
    id: "prod-bamboo-04",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[3].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[3].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[3].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[3].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[3].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "10 Metric Tons",
    priceRangeUsd: "$780 - $1,150 / Metric Ton",
    unit: "Metric Tons",
    title: "Joss Powder, Bamboo Sticks, and Broom Sticks (Yen Bai Origin)",
    category: "Bamboo & Wood Products",
    subCategory: "Bamboo & Joss Powder",
    images: [
      "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=800&auto=format&fit=crop&q=80&sig=16"
    ],
    description: "Export quality Joss Powder, Bamboo Sticks, and Broom Sticks produced by Global Dream in Yen Bai Province, Vietnam with 10 years manufacturing expertise.",
    priceTiers: [
      { minUnits: 10, maxUnits: 50, priceUsd: 1020 },
      { minUnits: 51, priceUsd: 890 }
    ],
    fobPriceUsd: 1020,
    moq: 10,
    moqUnit: "Metric Tons",
    sampleAvailable: true,
    samplePriceUsd: 60,
    leadTimeDays: 12,
    supportedIncoterms: ["FOB", "CIF", "CFR"],
    specifications: [
      { name: "Origin", value: "Yen Bai, Vietnam" },
      { name: "Certification", value: "ISO 9001, FSC" }
    ]
  },
  {
    id: "prod-bamboo-05",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[4].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[4].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[4].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[4].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[4].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "2,000 Pieces",
    priceRangeUsd: "$0.02 - $0.15 / Piece",
    unit: "Pieces",
    title: "Bamboo Sticks, Chopsticks, Toothpicks, Fruit Picks, Skewers & Bamboo Bowls",
    category: "Bamboo & Wood Products",
    subCategory: "Kitchen & Tableware",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80&sig=18"
    ],
    description: "Assorted bamboo sticks, chopsticks, toothpicks, fruit picks, skewers, incense sticks, bamboo bowls, trays, grinders, and scoop spoons from Fuzhou Sweety Bamboo.",
    priceTiers: [
      { minUnits: 2000, maxUnits: 10000, priceUsd: 0.12 },
      { minUnits: 10001, priceUsd: 0.08 }
    ],
    fobPriceUsd: 0.10,
    moq: 2000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 30,
    leadTimeDays: 7,
    supportedIncoterms: ["FOB", "EXW", "CIF"],
    specifications: [
      { name: "Material", value: "Natural Bamboo" },
      { name: "Finish", value: "Polished Food Grade" }
    ]
  },
  {
    id: "prod-bamboo-06",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[5].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[5].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[5].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[5].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[5].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "1,000 Pieces",
    priceRangeUsd: "$0.50 - $4.50 / Piece",
    unit: "Pieces",
    title: "Round Bamboo Sticks, Bamboo Mats, Poles & Bamboo Fences",
    category: "Bamboo & Wood Products",
    subCategory: "Garden & Construction Bamboo",
    images: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80&sig=20"
    ],
    description: "Durable round bamboo sticks, bamboo mats, poles, and garden fences from Ecol Bamboo (Zhejiang, China).",
    priceTiers: [
      { minUnits: 1000, maxUnits: 5000, priceUsd: 3.20 },
      { minUnits: 5001, priceUsd: 2.50 }
    ],
    fobPriceUsd: 2.80,
    moq: 1000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 35,
    leadTimeDays: 10,
    supportedIncoterms: ["FOB", "CIF", "EXW"],
    specifications: [
      { name: "Origin", value: "Zhejiang, China" },
      { name: "Treatment", value: "Anti-mold and UV Resistant" }
    ]
  },
  {
    id: "prod-bamboo-07",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[6].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[6].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[6].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[6].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[6].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "3 Metric Tons",
    priceRangeUsd: "$1,200 - $2,100 / Metric Ton",
    unit: "Metric Tons",
    title: "Agarbatti, Incense, Bamboo Sticks, Powder, Cinnamon & Lotus Seeds",
    category: "Bamboo & Agricultural",
    subCategory: "Incense & Spices",
    images: [
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80&sig=22"
    ],
    description: "Premium agarbatti, incense, bamboo sticks, powder, alongside high-grade Cinnamon and lotus seeds from Bui Thi Agriculture Import Export Processing Company Limited.",
    priceTiers: [
      { minUnits: 3, maxUnits: 10, priceUsd: 1850 },
      { minUnits: 11, priceUsd: 1550 }
    ],
    fobPriceUsd: 1700,
    moq: 3,
    moqUnit: "Metric Tons",
    sampleAvailable: true,
    samplePriceUsd: 45,
    leadTimeDays: 12,
    supportedIncoterms: ["FOB", "CIF", "CFR"],
    specifications: [
      { name: "Origin", value: "Hanoi, Vietnam" },
      { name: "Quality", value: "Export Grade" }
    ]
  },
  {
    id: "prod-bamboo-08",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[7].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[7].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[7].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[7].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[7].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "1,000 Pieces",
    priceRangeUsd: "$0.80 - $6.50 / Piece",
    unit: "Pieces",
    title: "Bamboo Canes, Wire Baskets, Flower Sticks, Garden Fencing & Trellises",
    category: "Bamboo & Garden",
    subCategory: "Garden & Agriculture",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80&sig=24"
    ],
    description: "Bamboo canes, wire baskets, bamboo flower sticks, fencing, edging hanging baskets, garden products, bamboo trellises, and bamboo furnitures from Win-win Bamboo Manufacturing Co., Ltd.",
    priceTiers: [
      { minUnits: 1000, maxUnits: 5000, priceUsd: 4.50 },
      { minUnits: 5001, priceUsd: 3.60 }
    ],
    fobPriceUsd: 4.00,
    moq: 1000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 40,
    leadTimeDays: 10,
    supportedIncoterms: ["FOB", "CIF", "DDP"],
    specifications: [
      { name: "Application", value: "Garden & Agricultural Landscaping" },
      { name: "Material", value: "Natural Treated Bamboo" }
    ]
  },
  {
    id: "prod-bamboo-09",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[8].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[8].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[8].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[8].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[8].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "2,000 Pieces",
    priceRangeUsd: "$0.10 - $2.50 / Piece",
    unit: "Pieces",
    title: "Bamboo Sticks, Incense Sticks, Poles & Towel Products (MIT Vietnam)",
    category: "Bamboo & Textiles",
    subCategory: "Bamboo & Household",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80&sig=26"
    ],
    description: "Manufacturer of towels, bamboo sticks, incense sticks, bamboo poles, and bamboo products from MIT Vietnam Co., Ltd.",
    priceTiers: [
      { minUnits: 2000, maxUnits: 10000, priceUsd: 1.50 },
      { minUnits: 10001, priceUsd: 1.10 }
    ],
    fobPriceUsd: 1.30,
    moq: 2000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 30,
    leadTimeDays: 8,
    supportedIncoterms: ["FOB", "CIF", "EXW"],
    specifications: [
      { name: "Origin", value: "Hanoi, Vietnam" },
      { name: "Standard", value: "ISO 9001" }
    ]
  },
  {
    id: "prod-bamboo-10",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[9].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[9].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[9].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[9].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[9].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "10,000 Pieces",
    priceRangeUsd: "$0.005 - $0.02 / Piece",
    unit: "Pieces",
    title: "High-Precision Bamboo Toothpicks & Food Sticks (Jiangxi Jinzhu)",
    category: "Bamboo & Wood Products",
    subCategory: "Toothpicks & Food Sticks",
    images: [
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80&sig=28"
    ],
    description: "High-tech manufactured bamboo food sticks and toothpicks from Jiangxi Jinzhu Industrial Co. Ltd.",
    priceTiers: [
      { minUnits: 10000, maxUnits: 50000, priceUsd: 0.015 },
      { minUnits: 50001, priceUsd: 0.01 }
    ],
    fobPriceUsd: 0.012,
    moq: 10000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 20,
    leadTimeDays: 6,
    supportedIncoterms: ["FOB", "CIF", "EXW"],
    specifications: [
      { name: "Material", value: "Natural Bamboo" },
      { name: "Sterilization", value: "High Temperature UV Sterilized" }
    ]
  },
  {
    id: "prod-bamboo-11",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[10].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[10].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[10].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[10].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[10].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "5,000 Pieces",
    priceRangeUsd: "$0.02 - $0.08 / Piece",
    unit: "Pieces",
    title: "Wooden Ice Cream Sticks, Coffee Stirrers & Bamboo Skewers (Yantai Vinzor)",
    category: "Wood & Bamboo Products",
    subCategory: "Ice Cream Sticks & Tableware",
    images: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80&sig=30"
    ],
    description: "Wooden ice cream sticks, coffee stirrers, tongue depressors, paper bowls, bamboo skewers, and decorative toothpicks from Yantai Vinzor Wood Products Co., Ltd.",
    priceTiers: [
      { minUnits: 5000, maxUnits: 20000, priceUsd: 0.05 },
      { minUnits: 20001, priceUsd: 0.03 }
    ],
    fobPriceUsd: 0.04,
    moq: 5000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 7,
    supportedIncoterms: ["FOB", "CIF", "EXW"],
    specifications: [
      { name: "Material", value: "Natural Birch Wood & Bamboo" },
      { name: "Grade", value: "Food Contact Safe" }
    ]
  },
  {
    id: "prod-bamboo-12",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[11].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[11].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[11].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[11].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[11].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "5,000 Pieces",
    priceRangeUsd: "$0.01 - $0.09 / Piece",
    unit: "Pieces",
    title: "Wooden & Bamboo Toothpicks, Skewers, Ice Cream Sticks & Cocktail Picks",
    category: "Wood & Bamboo Products",
    subCategory: "Disposable Tableware & Skewers",
    images: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80&sig=32"
    ],
    description: "Manufacturer and exporter of wooden and bamboo toothpicks, bamboo and wooden skewers, wooden ice cream sticks, spoons, paper doilies, paper baking cups, and cocktail picks from Hongchang Industry Co. Ltd.",
    priceTiers: [
      { minUnits: 5000, maxUnits: 25000, priceUsd: 0.04 },
      { minUnits: 25001, priceUsd: 0.025 }
    ],
    fobPriceUsd: 0.03,
    moq: 5000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 30,
    leadTimeDays: 8,
    supportedIncoterms: ["FOB", "CIF", "DDP", "EXW"],
    specifications: [
      { name: "Certification", value: "ISO 9001, HACCP, FSC" },
      { name: "Origin", value: "Liaoning, China" }
    ]
  },
  {
    id: "prod-bamboo-13",
    supplierId: GLOBAL_BAMBOO_STICKS_COMPANIES[12].id,
    supplierName: GLOBAL_BAMBOO_STICKS_COMPANIES[12].companyName,
    supplierCountry: GLOBAL_BAMBOO_STICKS_COMPANIES[12].country,
    supplierTier: GLOBAL_BAMBOO_STICKS_COMPANIES[12].tier,
    supplierTrustScore: GLOBAL_BAMBOO_STICKS_COMPANIES[12].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: "1,000 Pieces",
    priceRangeUsd: "$0.20 - $3.50 / Piece",
    unit: "Pieces",
    title: "Ice Cream Sticks, Wooden Dowels, Skewers, Knife Holders & Cutting Boards",
    category: "Wood & Bamboo Products",
    subCategory: "Wooden & Bamboo Housewares",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80&sig=34"
    ],
    description: "Ice cream sticks, wooden dowel pin, wooden dowel rod, wooden skewer, knife holder, cutting board, flag stick, wooden cigarette holder, wooden box, chopping board, kitchen knife holder, coffee stick from DaLian YiChun GuoFeng Trading Co.,Ltd.",
    priceTiers: [
      { minUnits: 1000, maxUnits: 5000, priceUsd: 2.20 },
      { minUnits: 5001, priceUsd: 1.60 }
    ],
    fobPriceUsd: 1.80,
    moq: 1000,
    moqUnit: "Pieces",
    sampleAvailable: true,
    samplePriceUsd: 35,
    leadTimeDays: 10,
    supportedIncoterms: ["FOB", "CIF", "EXW"],
    specifications: [
      { name: "Material", value: "Birch Wood & Bamboo" },
      { name: "Origin", value: "Liaoning, China" }
    ]
  }
];
