import { Incoterm, Product, RfqRequirement } from '../types';

export interface CatalogMappedEntry {
  main_category: string;
  subcategory: string;
  product_name: string;
  total_active_inquiries: number;
  active_rfq_sample: {
    rfq_id: string;
    buyer_region: string;
    quantity_required: string;
    incoterm: Incoterm | string;
    target_price: string;
    specs_summary: string;
    status: string;
  };
  product_image?: string;
  supplier_sample?: {
    company_name: string;
    country: string;
    moq: number;
    moq_unit: string;
    unit_price_usd: number;
    lead_time_days: number;
  };
}

export const MAPPED_CATALOG_DATABASE: CatalogMappedEntry[] = [
  {
    main_category: "Agri & Food Processing Machinery & Equipment",
    subcategory: "Grain Milling Equipment",
    product_name: "Automatic Commercial Flour Milling Plant (100 TPD)",
    total_active_inquiries: 142,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1001",
      buyer_region: "Alexandria Port, Egypt",
      quantity_required: "2 Complete Turnkey Lines",
      incoterm: "CIF",
      target_price: "$185,000 / Line",
      specs_summary: "Pneumatic roller mills, high-efficiency plansifter, CE certified, 380V/50Hz 3-Phase",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Apex Agro Machinery Heavy Industries Ltd.",
      country: "Germany",
      moq: 1,
      moq_unit: "Sets",
      unit_price_usd: 195000,
      lead_time_days: 45
    }
  },
  {
    main_category: "Agri & Food Processing Machinery & Equipment",
    subcategory: "Edible Oil Processing",
    product_name: "Continuous Soybean & Sunflower Seed Oil Extraction Press",
    total_active_inquiries: 98,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1002",
      buyer_region: "Port of Santos, Brazil",
      quantity_required: "4 Units (50 TPD Capacity)",
      incoterm: "FOB",
      target_price: "$42,000 / Unit",
      specs_summary: "Residual oil <6%, hardened alloy steel screw shaft, includes de-gumming filter press",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Zhengzhou Industrial Press Corp",
      country: "China",
      moq: 1,
      moq_unit: "Units",
      unit_price_usd: 44000,
      lead_time_days: 30
    }
  },
  {
    main_category: "Alcoholic Beverages, Tobacco & Related Products",
    subcategory: "Spirits & Distillates",
    product_name: "Bulk Aged Oak Cask Single Malt Scotch Whiskey (60% ABV)",
    total_active_inquiries: 86,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1003",
      buyer_region: "Port of Hamburg, Germany",
      quantity_required: "50 ISO Tank Containers (25,000L each)",
      incoterm: "CIF",
      target_price: "$8.50 / Liter",
      specs_summary: "Minimum 5 years maturation in ex-bourbon white oak casks, Certificate of Origin required",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Highland Spirits Distillers Ltd.",
      country: "United Kingdom",
      moq: 25000,
      moq_unit: "Liters",
      unit_price_usd: 8.8,
      lead_time_days: 20
    }
  },
  {
    main_category: "Alcoholic Beverages, Tobacco & Related Products",
    subcategory: "Raw Tobacco & Leaf",
    product_name: "Flue-Cured Virginia (FCV) Tobacco Leaf Grade 1",
    total_active_inquiries: 114,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1004",
      buyer_region: "Mersin Port, Turkey",
      quantity_required: "300 Metric Tons",
      incoterm: "CIF",
      target_price: "$4,200 / MT",
      specs_summary: "Nicotine 2.5-3.0%, reducing sugars >18%, moisture max 12%, packed in 200kg C-48 cardboard cartons",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Global Tobacco Leaf Growers Co.",
      country: "India",
      moq: 20,
      moq_unit: "Metric Tons",
      unit_price_usd: 4250,
      lead_time_days: 25
    }
  },
  {
    main_category: "Bar Accessories and Related Products",
    subcategory: "Commercial Dispensing & Cooling",
    product_name: "Commercial 4-Tap Glycol Beer Kegerator System",
    total_active_inquiries: 54,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1005",
      buyer_region: "Port of Long Beach, USA",
      quantity_required: "250 Units (3 x 40ft HC)",
      incoterm: "FOB",
      target_price: "$680 / Unit",
      specs_summary: "304 Stainless steel construction, R290 eco-refrigerant, ETL & NSF sanitation certified",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "BarCraft Equipment Mfg.",
      country: "China",
      moq: 10,
      moq_unit: "Units",
      unit_price_usd: 710,
      lead_time_days: 20
    }
  },
  {
    main_category: "Farm Inputs - Fertilizers, Pesticides & Seeds",
    subcategory: "Nitrogen Fertilizers",
    product_name: "Granular Urea 46% Nitrogen (Agricultural Bulk)",
    total_active_inquiries: 310,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1006",
      buyer_region: "Nhava Sheva Port, India",
      quantity_required: "50,000 Metric Tons",
      incoterm: "CIF",
      target_price: "$345 / MT",
      specs_summary: "Biuret max 1.0%, moisture max 0.5%, size 2.00-4.75mm min 90%, SGS inspection at loading",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Sudarshan Petrochem & Polymers Ltd.",
      country: "India",
      moq: 500,
      moq_unit: "Metric Tons",
      unit_price_usd: 350,
      lead_time_days: 15
    }
  },
  {
    main_category: "Farm Inputs - Fertilizers, Pesticides & Seeds",
    subcategory: "Phosphate & Complex Fertilizers",
    product_name: "Diammonium Phosphate (DAP 18-46-0 Fertilizer)",
    total_active_inquiries: 225,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1007",
      buyer_region: "Karachi Port, Pakistan",
      quantity_required: "25,000 Metric Tons",
      incoterm: "CIF",
      target_price: "$530 / MT",
      specs_summary: "Total nitrogen min 18%, available P2O5 min 46%, moisture max 1.5%, free flowing dark brown granules",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Apex Phosphate Chemicals",
      country: "Morocco",
      moq: 1000,
      moq_unit: "Metric Tons",
      unit_price_usd: 540,
      lead_time_days: 18
    }
  },
  {
    main_category: "Farm Products - Grains, Fruits etc",
    subcategory: "Rice & Cereal Grains",
    product_name: "1121 XXL Steam Basmati Rice (8.35mm Grain Length)",
    total_active_inquiries: 290,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1008",
      buyer_region: "Jebel Ali Port, UAE",
      quantity_required: "1,500 Metric Tons",
      incoterm: "CIF",
      target_price: "$1,080 / MT",
      specs_summary: "Max 1% broken, moisture max 12.5%, purity 95%, packed in 25kg non-woven master bags",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Royal Heritage Agri Commodities",
      country: "India",
      moq: 50,
      moq_unit: "Metric Tons",
      unit_price_usd: 1100,
      lead_time_days: 14
    }
  },
  {
    main_category: "Farm Products - Grains, Fruits etc",
    subcategory: "Oilseeds & Pulses",
    product_name: "Non-GMO Yellow Soybeans Grade #2",
    total_active_inquiries: 265,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1009",
      buyer_region: "Qingdao Port, China",
      quantity_required: "60,000 Metric Tons (Bulk Vessel)",
      incoterm: "CIF",
      target_price: "$465 / MT",
      specs_summary: "Protein min 35.5%, oil content min 18.5%, moisture max 13%, foreign matter max 1%",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "AgriCorp South America S.A.",
      country: "Brazil",
      moq: 5000,
      moq_unit: "Metric Tons",
      unit_price_usd: 470,
      lead_time_days: 20
    }
  },
  {
    main_category: "Fish & Fish Products",
    subcategory: "Frozen Seafood & Crustaceans",
    product_name: "Frozen Black Tiger Shrimp Headless Shell-On (HLSO 16/20)",
    total_active_inquiries: 178,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1010",
      buyer_region: "Port of Tokyo, Japan",
      quantity_required: "10 x 40ft Reefer FCL (240 MT)",
      incoterm: "CIF",
      target_price: "$11.20 / KG",
      specs_summary: "IQF, net weight 100% no glaze, HACCP & BRC certified, antibiotic-free test certificate",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Oceanic Harvest Vietnam Ltd.",
      country: "Vietnam",
      moq: 20,
      moq_unit: "Metric Tons",
      unit_price_usd: 11.5,
      lead_time_days: 15
    }
  },
  {
    main_category: "Horticulture - Flowers, Plants & Related Products",
    subcategory: "Fresh Cut Flowers",
    product_name: "Fresh Cut Long Stem Grand Gala Red Roses (60-80cm)",
    total_active_inquiries: 92,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1011",
      buyer_region: "Amsterdam Schiphol Cargo, Netherlands",
      quantity_required: "450,000 Stems / Week",
      incoterm: "CIF",
      target_price: "$0.28 / Stem",
      specs_summary: "Bud size 5.5cm+, cold-chain pre-cooled at 2°C, packaged in export telescopic cartons",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Equatorial Flora Farms",
      country: "Kenya",
      moq: 50000,
      moq_unit: "Pieces",
      unit_price_usd: 0.3,
      lead_time_days: 5
    }
  },
  {
    main_category: "Livestock, Poultry, Meat & Animal Products",
    subcategory: "Frozen Poultry & Cuts",
    product_name: "Halal Frozen Boneless Skinless Chicken Breast Fillet",
    total_active_inquiries: 284,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1012",
      buyer_region: "Jeddah Islamic Port, Saudi Arabia",
      quantity_required: "500 Metric Tons (20 x 40ft FCL)",
      incoterm: "CIF",
      target_price: "$2,250 / MT",
      specs_summary: "Strict Halal slaughter certification, blast frozen -18°C, water content <4%, Grade A export",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Sadia Export Meat Co.",
      country: "Brazil",
      moq: 50,
      moq_unit: "Metric Tons",
      unit_price_usd: 2300,
      lead_time_days: 18
    }
  },
  {
    main_category: "Processed Food & Beverages Products & By Products",
    subcategory: "Refined Edible Oils",
    product_name: "Refined Bleached Deodorized (RBD) Palm Olein CP8 / CP10",
    total_active_inquiries: 240,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1013",
      buyer_region: "Port Klang, Malaysia to Durban Port, South Africa",
      quantity_required: "5,000 Metric Tons in Flexibags",
      incoterm: "FOB",
      target_price: "$890 / MT",
      specs_summary: "FFA as Palmitic max 0.1%, IV min 56, moisture & impurities max 0.1%, PORAM specifications",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Sime Global Oleo Chemical Ltd.",
      country: "Malaysia",
      moq: 500,
      moq_unit: "Metric Tons",
      unit_price_usd: 905,
      lead_time_days: 16
    }
  },
  {
    main_category: "Computers, Electronics & Communications, Electrical",
    subcategory: "Industrial Energy Storage & Solar",
    product_name: "Lithium Iron Phosphate (LiFePO4) Battery Cells 3.2V 280Ah",
    total_active_inquiries: 195,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1014",
      buyer_region: "Port of Rotterdam, Netherlands",
      quantity_required: "12,000 Cells (Grade A)",
      incoterm: "CIF",
      target_price: "$48.50 / Cell",
      specs_summary: "6000+ cycle life @ 80% DoD, UN38.3, UL1973, matched internal resistance <0.2mΩ",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Shenzhen Apex Microelectronics Co., Ltd.",
      country: "China",
      moq: 100,
      moq_unit: "Pieces",
      unit_price_usd: 52,
      lead_time_days: 14
    }
  },
  {
    main_category: "Builders Hardware, Construction Material & Equipment",
    subcategory: "Structural Steel & Rebar",
    product_name: "Deformed Steel Rebar ASTM A615 Grade 60 (12mm - 32mm)",
    total_active_inquiries: 230,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1015",
      buyer_region: "Houston Port, USA",
      quantity_required: "15,000 Metric Tons",
      incoterm: "CIF",
      target_price: "$575 / MT",
      specs_summary: "Length 12 meters, mill test certificates with heat numbers, ASTM & BS 4449 compliant",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Kobe Heavy Metal Corporation",
      country: "Japan",
      moq: 500,
      moq_unit: "Metric Tons",
      unit_price_usd: 590,
      lead_time_days: 22
    }
  },
  {
    main_category: "Carpets, Mats, Rugs, Floorings",
    subcategory: "Commercial Vinyl & SPC Flooring",
    product_name: "Rigid Core SPC Vinyl Flooring Planks (5.0mm + 1.5mm IXPE)",
    total_active_inquiries: 115,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1016",
      buyer_region: "Port of Felixstowe, UK",
      quantity_required: "45,000 Square Meters",
      incoterm: "FOB",
      target_price: "$6.20 / SQM",
      specs_summary: "0.5mm (20mil) wear layer, UV coating, Unilin click lock system, FloorScore certified",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Changzhou DecoPlank Flooring",
      country: "China",
      moq: 1000,
      moq_unit: "Pieces",
      unit_price_usd: 6.5,
      lead_time_days: 15
    }
  },
  {
    main_category: "Furniture, Interior Decoration & Furnishings",
    subcategory: "Ergonomic Office Furniture",
    product_name: "High-Back Mesh Ergonomic Executive Chairs (3D Armrest)",
    total_active_inquiries: 160,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1017",
      buyer_region: "Sydney Port, Australia",
      quantity_required: "1,200 Units (4 x 40ft HC)",
      incoterm: "FOB",
      target_price: "$43.00 / Unit",
      specs_summary: "BIFMA X5.1 pass certified, Class 4 gas lift cylinder, breathable fire-retardant mesh",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1580481077197-28d54238e8a9?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Foshan Zenith Office Ergonomics",
      country: "China",
      moq: 50,
      moq_unit: "Units",
      unit_price_usd: 46,
      lead_time_days: 18
    }
  },
  {
    main_category: "Glass & Ceramics",
    subcategory: "Architectural Float Glass",
    product_name: "Clear Float Glass Sheets & Low-E Laminated Panels (6mm/8mm/10mm)",
    total_active_inquiries: 88,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1018",
      buyer_region: "Port of Dammam, Saudi Arabia",
      quantity_required: "20 Containers (Wooden Crates)",
      incoterm: "CIF",
      target_price: "$7.80 / SQM",
      specs_summary: "Grade A auto-float quality, zero optical distortion, EN 572-2 standard",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Saint-Gobain / Asahi Float Glass Partner",
      country: "Turkey",
      moq: 500,
      moq_unit: "Pieces",
      unit_price_usd: 8.2,
      lead_time_days: 20
    }
  },
  {
    main_category: "Jute & Wood Related Products",
    subcategory: "Industrial Jute Packaging",
    product_name: "Standard B.Twill Hydrocarbon-Free Jute Bags (Food Grade 50KG)",
    total_active_inquiries: 175,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1019",
      buyer_region: "Port of Tema, Ghana",
      quantity_required: "500,000 Bags (for Cocoa/Coffee Export)",
      incoterm: "CIF",
      target_price: "$1.28 / Bag",
      specs_summary: "Size 44\" x 26.5\", weight 2.25 lbs, IJO 98/01 compliant, vegetable oil treated",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Bengal Jute Mills Consortium",
      country: "India",
      moq: 10000,
      moq_unit: "Pieces",
      unit_price_usd: 1.32,
      lead_time_days: 15
    }
  },
  {
    main_category: "Chemicals & Allied Products",
    subcategory: "Industrial Solvents & Monomers",
    product_name: "Caustic Soda Flakes 99% (Sodium Hydroxide NaOH)",
    total_active_inquiries: 210,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1020",
      buyer_region: "Alexandria Port, Egypt",
      quantity_required: "1,000 Metric Tons",
      incoterm: "CIF",
      target_price: "$380 / MT",
      specs_summary: "Purity min 99.0%, Na2CO3 max 0.4%, NaCl max 0.03%, 25kg PP/PE woven bags with inner liner",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Sudarshan Petrochem & Polymers Ltd.",
      country: "India",
      moq: 50,
      moq_unit: "Metric Tons",
      unit_price_usd: 390,
      lead_time_days: 12
    }
  },
  {
    main_category: "Display, Printing & Packaging Products",
    subcategory: "Flexible Packaging Films",
    product_name: "Biaxially Oriented Polypropylene (BOPP) Plain & Heat-Sealable Film",
    total_active_inquiries: 135,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1021",
      buyer_region: "Nhava Sheva Port, India",
      quantity_required: "300 Metric Tons (Rolls)",
      incoterm: "CIF",
      target_price: "$1,420 / MT",
      specs_summary: "Thickness 18-35 micron, corona treated 38 dyne/cm, high clarity and tensile strength",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Treofan / Cosmo Films Global",
      country: "India",
      moq: 20,
      moq_unit: "Metric Tons",
      unit_price_usd: 1450,
      lead_time_days: 14
    }
  },
  {
    main_category: "Industrial Goods & Machinery",
    subcategory: "Heavy Machinery & Earthmoving",
    product_name: "Crawler Hydraulic Excavator 21-Ton (0.95m³ Bucket)",
    total_active_inquiries: 155,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1022",
      buyer_region: "Mombasa Port, Kenya",
      quantity_required: "12 Units",
      incoterm: "CIF",
      target_price: "$64,000 / Unit",
      specs_summary: "Tier 3 / Stage IIIA turbo diesel engine, Kawasaki hydraulic pumps, enclosed ROPS/FOPS cabin",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Sany / XCMG Heavy Industries Exporter",
      country: "China",
      moq: 1,
      moq_unit: "Units",
      unit_price_usd: 68000,
      lead_time_days: 25
    }
  },
  {
    main_category: "Marine Equipment & Machinery",
    subcategory: "Commercial Vessel Propulsion",
    product_name: "Marine Inboard Diesel Engine 800HP @ 1800RPM (IMO Tier II)",
    total_active_inquiries: 65,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1023",
      buyer_region: "Jurong Port, Singapore",
      quantity_required: "6 Complete Engine & Gearbox Sets",
      incoterm: "FOB",
      target_price: "$52,000 / Set",
      specs_summary: "CCS & DNV-GL marine classification type approved, heat exchanger cooling, electric 24V starting",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Weichai / Cummins Marine Heavy Power",
      country: "China",
      moq: 1,
      moq_unit: "Sets",
      unit_price_usd: 54000,
      lead_time_days: 35
    }
  },
  {
    main_category: "Metal, Mining & Metallurgy",
    subcategory: "Refined Non-Ferrous Metals",
    product_name: "Electrolytic Copper Cathodes Grade A (Purity 99.99%)",
    total_active_inquiries: 340,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1024",
      buyer_region: "Port of Tianjin, China",
      quantity_required: "5,000 Metric Tons per Month",
      incoterm: "CIF",
      target_price: "LME -12%",
      specs_summary: "BS EN 1978:1998 (Cu-ETP-2), non-radioactive, SGS inspection at port of discharge",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Zambia Copperbelt Smelters & Mining Corp",
      country: "Zambia",
      moq: 500,
      moq_unit: "Metric Tons",
      unit_price_usd: 8900,
      lead_time_days: 18
    }
  },
  {
    main_category: "Petroleum, Fuel & Energy Resources",
    subcategory: "Refined Petroleum Products",
    product_name: "Ultra-Low Sulfur Automotive Diesel Fuel EN590 10PPM",
    total_active_inquiries: 350,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1025",
      buyer_region: "Rotterdam Terminal Tank-to-Tank (TTO), Netherlands",
      quantity_required: "100,000 Metric Tons per Month (12-Month Contract)",
      incoterm: "TTO",
      target_price: "Platts European Market minus $18/MT",
      specs_summary: "Sulfur max 10 ppm, Cetane index min 46, Flash point min 55°C, SGS/Saybolt dip test prior to injection",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Gulf Energy Refinery Traders FZE",
      country: "United Arab Emirates",
      moq: 50000,
      moq_unit: "Metric Tons",
      unit_price_usd: 680,
      lead_time_days: 7
    }
  },
  {
    main_category: "Petroleum, Fuel & Energy Resources",
    subcategory: "Aviation Turbine Fuels",
    product_name: "Aviation Kerosene Colonial Grade Jet Fuel A1",
    total_active_inquiries: 325,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1026",
      buyer_region: "Houston Port / Barbour's Cut Terminal, USA",
      quantity_required: "2,000,000 Barrels (Trial Lift + Extension)",
      incoterm: "FOB",
      target_price: "Platts USGC minus $4.50/BBL",
      specs_summary: "DEF STAN 91-091 & ASTM D1655 compliant, flash point min 38°C, freeze point max -47°C",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1519074069444-1ba4ea16e91f?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Houston Energy & Marine Terminals",
      country: "United States",
      moq: 1000000,
      moq_unit: "Barrels",
      unit_price_usd: 88,
      lead_time_days: 5
    }
  },
  {
    main_category: "Plastic & Rubber Products",
    subcategory: "Virgin Polymer Resins",
    product_name: "Polypropylene (PP) Raffia Grade Granules (MFI 3.0)",
    total_active_inquiries: 185,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1027",
      buyer_region: "Karachi Port, Pakistan",
      quantity_required: "800 Metric Tons",
      incoterm: "CIF",
      target_price: "$960 / MT",
      specs_summary: "Homopolymer, high tensile tenacity, UV stabilized, packed in 25kg palletized bags",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "Sudarshan Petrochem & Polymers Ltd.",
      country: "India",
      moq: 50,
      moq_unit: "Metric Tons",
      unit_price_usd: 980,
      lead_time_days: 14
    }
  },
  {
    main_category: "Medical & HealthCare",
    subcategory: "Surgical & Disposable Consumables",
    product_name: "Medical Examination Powder-Free Nitrile Gloves (Blue)",
    total_active_inquiries: 275,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1028",
      buyer_region: "Port of Long Beach, USA",
      quantity_required: "50,000 Master Cartons (10 x 40ft HC)",
      incoterm: "FOB",
      target_price: "$31.50 / Carton (1000 pcs)",
      specs_summary: "ASTM D6319, EN 455 Parts 1-4, FDA 510(k), AQL 1.5, textured fingertips",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "TopGlove / Hartalega Export Alliance",
      country: "Malaysia",
      moq: 500,
      moq_unit: "Cartons",
      unit_price_usd: 33,
      lead_time_days: 12
    }
  },
  {
    main_category: "Safety & Security Equipment",
    subcategory: "Surveillance & CCTV Infrastructure",
    product_name: "4K Ultra-HD Outdoor AI Smart IP Surveillance Dome Cameras",
    total_active_inquiries: 190,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1029",
      buyer_region: "Jebel Ali Port, UAE",
      quantity_required: "3,500 Units",
      incoterm: "CIF",
      target_price: "$42.00 / Unit",
      specs_summary: "Sony STARVIS sensor, 50m IR night vision, IP67 weatherproof, IK10 vandal-proof, ONVIF Profile S/G/T",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "HikVision / Dahua OEM Tech Hub",
      country: "China",
      moq: 100,
      moq_unit: "Units",
      unit_price_usd: 45,
      lead_time_days: 10
    }
  },
  {
    main_category: "Safety & Security Equipment",
    subcategory: "Fire Protection & Suppression",
    product_name: "ABC Dry Chemical Powder Portable Fire Extinguishers (6KG/9KG)",
    total_active_inquiries: 165,
    active_rfq_sample: {
      rfq_id: "TH-RFQ-2026-1030",
      buyer_region: "Port of Santos, Brazil",
      quantity_required: "8,000 Cylinders (2 x 40ft FCL)",
      incoterm: "FOB",
      target_price: "$12.40 / Unit",
      specs_summary: "EN3 / CE 0036 certified, 75% MAP powder, seamless deep-drawn steel cylinder with pressure gauge",
      status: "Active / Verified"
    },
    product_image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
    supplier_sample: {
      company_name: "SafetyShield Fire Systems Co.",
      country: "Turkey",
      moq: 200,
      moq_unit: "Pieces",
      unit_price_usd: 13.5,
      lead_time_days: 14
    }
  }
];

// Helper to convert MAPPED_CATALOG_DATABASE to standard RfqRequirement objects
export const MAPPED_CATALOG_DERIVED_RFQS: RfqRequirement[] = MAPPED_CATALOG_DATABASE.map((item, index) => {
  const parseQty = (qtyStr: string): { amount: number; unit: string } => {
    const cleaned = qtyStr.replace(/,/g, '');
    const match = cleaned.match(/^([\d.]+)\s*(.*)$/);
    if (match) {
      return { amount: parseFloat(match[1]) || 1000, unit: match[2] || 'Units' };
    }
    return { amount: 1000, unit: qtyStr };
  };

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/\$([\d,.]+)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, '')) || 500;
    }
    return 1000;
  };

  const qty = parseQty(item.active_rfq_sample.quantity_required);
  
  const FIRST_NAMES = ['Elena', 'Marcus', 'Sophia', 'Lucas', 'Astrid', 'Tariq', 'Chen', 'Mateo', 'Kareem', 'David', 'Vikram', 'Laurent', 'Amira', 'Klaus', 'Carlos', 'Isabella', 'Diego', 'Fatima', 'Liam', 'Zainab', 'Alexander', 'Freja', 'Nikolai', 'Kwame', 'Giovanni', 'Hugo', 'Henrik', 'Arjun', 'Ren', 'Thiago'];
  const LAST_NAMES = ['Sterling', 'Vance', 'Tremblay', 'Lindholm', 'MacLeod', 'Silva', 'Mendoza', 'Santoro', 'Rossi', 'Dubois', 'Moreau', 'Schneider', 'Fischer', 'Weber', 'Becker', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Tanaka', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Saito', 'Zhang', 'Wang', 'Li', 'Liu', 'Chen'];
  const CORP_NOUNS = ['Global Sourcing Ltd', 'Procurement AG', 'Supply Chain Network', 'Enterprises BV', 'Holdings Corp', 'Trade Alliance SA', 'Industries Pte Ltd', 'Commercial Partners Inc', 'Logistics & Trade', 'Merchants Group'];
  const GLOBAL_DESTS = [
    { country: 'United States', port: 'Port of Los Angeles, USA', code: '+1', domain: 'us' },
    { country: 'Germany', port: 'Port of Hamburg, Germany', code: '+49', domain: 'de' },
    { country: 'United Arab Emirates', port: 'Jebel Ali Port, Dubai, UAE', code: '+971', domain: 'ae' },
    { country: 'Singapore', port: 'Jurong Port, Singapore', code: '+65', domain: 'sg' },
    { country: 'Netherlands', port: 'Port of Rotterdam, Netherlands', code: '+31', domain: 'nl' },
    { country: 'United Kingdom', port: 'Port of Felixstowe, UK', code: '+44', domain: 'co.uk' },
    { country: 'Japan', port: 'Yokohama Port, Japan', code: '+81', domain: 'co.jp' },
    { country: 'Australia', port: 'Port of Melbourne, Australia', code: '+61', domain: 'com.au' },
    { country: 'Canada', port: 'Port of Vancouver, Canada', code: '+1', domain: 'ca' },
    { country: 'Brazil', port: 'Santos Port, Brazil', code: '+55', domain: 'com.br' }
  ];

  const fn = FIRST_NAMES[(index * 7 + 3) % FIRST_NAMES.length];
  const ln = LAST_NAMES[(index * 13 + 5) % LAST_NAMES.length];
  const noun = CORP_NOUNS[(index * 11 + 2) % CORP_NOUNS.length];
  const dest = GLOBAL_DESTS[(index * 17 + 1) % GLOBAL_DESTS.length];
  
  const bName = `${fn} ${ln}`;
  const bComp = `${ln} ${noun}`;
  const cleanComp = bComp.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPerson = `${fn.toLowerCase()}.${ln.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  const bEmail = `${cleanPerson}@${cleanComp}.${dest.domain}`;
  const bPhone = `${dest.code} ${Math.floor(200 + (index * 19) % 700)} ${Math.floor(100 + (index * 37) % 899)} ${Math.floor(1000 + (index * 61) % 8999)}`;

  return {
    id: item.active_rfq_sample.rfq_id,
    buyerName: bName,
    buyerCompany: bComp,
    buyerCountry: dest.country,
    buyerEmail: bEmail,
    buyerPhone: bPhone,
    buyerVerified: true,
    productName: item.product_name,
    category: item.main_category,
    targetQuantity: qty.amount,
    quantityUnit: qty.unit,
    targetPriceUsd: parsePrice(item.active_rfq_sample.target_price),
    preferredIncoterm: (item.active_rfq_sample.incoterm as Incoterm) || 'CIF',
    destinationPort: item.active_rfq_sample.buyer_region || dest.port,
    paymentTerms: 'Confirmed Irrevocable L/C at Sight or Escrow Trade Assurance',
    detailedRequirements: `${item.active_rfq_sample.specs_summary}. Immediate procurement for verified wholesale delivery under ${item.active_rfq_sample.incoterm} terms. Total live buying inquiries: ${item.total_active_inquiries}.`,
    detailedDescription: `${item.active_rfq_sample.specs_summary}. Immediate procurement for verified wholesale delivery under ${item.active_rfq_sample.incoterm} terms. Total live buying inquiries: ${item.total_active_inquiries}.`,
    urgency: item.total_active_inquiries > 200 ? 'URGENT' : 'LONG_TERM_CONTRACT',
    quotesCount: Math.min(24, Math.floor(item.total_active_inquiries / 12) + 3),
    postedDate: '2026-08-28',
    expiryDate: '2026-11-30',
    status: 'OPEN',
    matchedSupplierCount: Math.min(18, Math.floor(item.total_active_inquiries / 15) + 4),
    spamScore: 4
  };
});

// Helper to convert MAPPED_CATALOG_DATABASE to standard Product objects
export const MAPPED_CATALOG_DERIVED_PRODUCTS: Product[] = MAPPED_CATALOG_DATABASE.map((item, index) => {
  return {
    id: `prod-cat-${1000 + index}`,
    supplierId: `supp-mapped-${100 + index}`,
    supplierName: item.supplier_sample?.company_name || 'Verified Gold Manufacturer',
    supplierCountry: item.supplier_sample?.country || 'Global',
    supplierTier: 'GOLD',
    supplierTrustScore: 95 + (index % 5),
    title: item.product_name,
    category: item.main_category,
    subCategory: item.subcategory,
    images: [item.product_image || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'],
    description: `High specification ${item.product_name} suited for bulk commercial trading and industrial procurement. Meets international export standards: ${item.active_rfq_sample.specs_summary}. Active Trade Heaven inquiries: ${item.total_active_inquiries}.`,
    fobPriceUsd: item.supplier_sample?.unit_price_usd || 100,
    moq: item.supplier_sample?.moq || 10,
    moqUnit: item.supplier_sample?.moq_unit || 'Units',
    leadTimeDays: item.supplier_sample?.lead_time_days || 15,
    supportedIncoterms: ['CIF', 'FOB', 'EXW', 'TTO'] as Incoterm[],
    specifications: [
      { name: 'Subcategory', value: item.subcategory },
      { name: 'Active RFQ Sample', value: item.active_rfq_sample.rfq_id },
      { name: 'Target Destination', value: item.active_rfq_sample.buyer_region },
      { name: 'Procurement Specs', value: item.active_rfq_sample.specs_summary },
      { name: 'Live Inquiries on Trade Heaven', value: `${item.total_active_inquiries} Active Inquiries` }
    ],
    certifications: ['ISO 9001:2015', 'CE Certified', 'SGS Pre-Shipment Inspected', 'RoHS / REACH Compliant'],
    portOfDispatch: item.active_rfq_sample.buyer_region,
    featured: true,
    createdDate: '2026-08-25'
  };
});
