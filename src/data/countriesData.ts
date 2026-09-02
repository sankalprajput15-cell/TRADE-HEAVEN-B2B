export interface CountrySupplier {
  id: string;
  name: string;
  city: string;
  country: string;
  website?: string;
  tier: 'Gold Member' | 'Silver Member';
  verified: boolean;
  mainProduct: string;
  logo?: string;
}

export interface CountryProduct {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface CountryBuyOffer {
  id: string;
  title: string;
  date: string;
  quantity: string;
  buyerCountry?: string;
}

export interface CountryData {
  id: string;
  name: string;
  code: string;
  flag: string;
  stats: {
    companies: number;
    products: number;
    rfqs: number;
  };
  topExports: string[];
  topImports: string[];
  premiumSuppliers: CountrySupplier[];
  latestSuppliers: CountrySupplier[];
  latestProducts: CountryProduct[];
  latestBuyOffers: CountryBuyOffer[];
  seoDescription?: {
    headline: string;
    sections: { title: string; body: string }[];
  };
}

export const TRENDING_KEYWORDS = [
  "Wholesale Wood Pellets",
  "China Shoes Wholesale",
  "China Phone Suppliers",
  "Bulk Palm Oil Suppliers",
  "Inflatable Pool Manufacturers",
  "Raw Olives For Sale",
  "Sportswear Buyers",
  "Agarwood Buyers",
  "Stocklot Buyers",
  "Leather Jacket Importers",
  "T-Shirts Buyers",
  "Outdoor Furniture Importers",
  "CNC Machinery Buyers",
  "Buy Dermal Fillers",
  "Wholesale Coffee Beans Suppliers",
  "Personal Care Products Suppliers",
  "Korean Cosmetics Suppliers",
  "Home Appliances Suppliers",
  "Wholesale Learning Toys",
  "Bulk Rattan Furniture Supplier",
  "Pet Products",
  "Wholesale Mushroom Buyers",
  "Bulk Firewood Buyers",
  "Wood Pellet Importers",
  "Human Hair Wigs Suppliers",
  "Glass Tables",
  "Crates",
  "Sunglasses Manufacturers",
  "Headwear Sellers",
  "Grater Suppliers",
  "Lubricant Oil Buyers"
];

export const ALL_COUNTRY_ITEMS: { id: string; name: string; code: string; flag: string }[] = [
  { id: "australia", name: "Australia", code: "AU", flag: "🇦🇺" },
  { id: "bangladesh", name: "Bangladesh", code: "BD", flag: "🇧🇩" },
  { id: "brazil", name: "Brazil", code: "BR", flag: "🇧🇷" },
  { id: "bulgaria", name: "Bulgaria", code: "BG", flag: "🇧🇬" },
  { id: "canada", name: "Canada", code: "CA", flag: "🇨🇦" },
  { id: "china", name: "China", code: "CN", flag: "🇨🇳" },
  { id: "egypt", name: "Egypt", code: "EG", flag: "🇪🇬" },
  { id: "france", name: "France", code: "FR", flag: "🇫🇷" },
  { id: "germany", name: "Germany", code: "DE", flag: "🇩🇪" },
  { id: "hong-kong", name: "Hong Kong", code: "HK", flag: "🇭🇰" },
  { id: "india", name: "India", code: "IN", flag: "🇮🇳" },
  { id: "indonesia", name: "Indonesia", code: "ID", flag: "🇮🇩" },
  { id: "italy", name: "Italy", code: "IT", flag: "🇮🇹" },
  { id: "japan", name: "Japan", code: "JP", flag: "🇯🇵" },
  { id: "malaysia", name: "Malaysia", code: "MY", flag: "🇲🇾" },
  { id: "netherlands", name: "Netherlands", code: "NL", flag: "🇳🇱" },
  { id: "new-zealand", name: "New Zealand", code: "NZ", flag: "🇳🇿" },
  { id: "pakistan", name: "Pakistan", code: "PK", flag: "🇵🇰" },
  { id: "philippines", name: "Philippines", code: "PH", flag: "🇵🇭" },
  { id: "poland", name: "Poland", code: "PL", flag: "🇵🇱" },
  { id: "portugal", name: "Portugal", code: "PT", flag: "🇵🇹" },
  { id: "turkiye", name: "Republic of Türkiye", code: "TR", flag: "🇹🇷" },
  { id: "saudi-arabia", name: "Saudi Arabia", code: "SA", flag: "🇸🇦" },
  { id: "singapore", name: "Singapore", code: "SG", flag: "🇸🇬" },
  { id: "south-africa", name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { id: "south-korea", name: "South Korea", code: "KR", flag: "🇰🇷" },
  { id: "sweden", name: "Sweden", code: "SE", flag: "🇸🇪" },
  { id: "taiwan", name: "Taiwan", code: "TW", flag: "🇹🇼" },
  { id: "thailand", name: "Thailand", code: "TH", flag: "🇹🇭" },
  { id: "uae", name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { id: "ukraine", name: "Ukraine", code: "UA", flag: "🇺🇦" },
  { id: "uk", name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { id: "usa", name: "USA", code: "US", flag: "🇺🇸" },
  { id: "vietnam", name: "Vietnam", code: "VN", flag: "🇻🇳" }
];

export const COUNTRIES_DATA: Record<string, CountryData> = {
  "uk": {
    id: "uk",
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    stats: { companies: 4542, products: 4023, rfqs: 1280 },
    topExports: [
      "Pistachio Nuts", "Walnuts", "Milk Powder", "Zinc Ingot", "Cocoa Beans", "Almonds", 
      "Mineral Water", "Plastic Raw Materials", "Alfalfa Hay", "Battery Scrap", "Jet Fuel", 
      "Wood Pellets", "Sugar", "Copper", "Processors", "Copper Cathode", "LDPE", 
      "Iron Scrap", "Sea Cucumber", "Sunflower Oil", "Rice", "HDPE", "Aluminum Scrap", 
      "Aluminum Ingots", "Copper Scrap"
    ],
    topImports: [
      "Gas Cylinders", "Oxide", "Soft Drinks", "Nail Gel", "Urea 46 Fertilizer", 
      "Clothes Hanger", "Jet A1", "Scaffoldings", "Nitrogen Fertilizer", "Winter Clothing",
      "Basmati Rice", "Dermal Fillers", "CNC Machinery", "Surgical Instruments", "Linen Fabrics"
    ],
    premiumSuppliers: [
      { id: "ps1", name: "Dandada Logistic Limited", city: "Royston, Hertfordshire", country: "United Kingdom", website: "www.dandada-logistics.co.uk", tier: "Gold Member", verified: true, mainProduct: "Global Cargo Shipping & Air Logistics" },
      { id: "ps2", name: "Aslan Resources Metals Limited", city: "London, London", country: "United Kingdom", website: "www.asianresources.co.uk", tier: "Gold Member", verified: true, mainProduct: "Non-Ferrous Scrap & Copper Ingots" },
      { id: "ps3", name: "Dimension Logic Technology", city: "Doncaster, South Yorkshire", country: "United Kingdom", website: "www.dimensionlogic.co.uk", tier: "Silver Member", verified: true, mainProduct: "Industrial Automation & Sensor Systems" },
      { id: "ps4", name: "Eximmate Ltd", city: "London, London", country: "United Kingdom", website: "www.eximmate.co.uk", tier: "Gold Member", verified: true, mainProduct: "Wholesale Chemicals & Polymers" },
      { id: "ps5", name: "LOTUS GROUP INTERNATIONAL LIMITED", city: "Norwich, Norfolk", country: "United Kingdom", website: "www.lotusgroupintl.com", tier: "Silver Member", verified: true, mainProduct: "Eco Packaging & Paperboard" },
      { id: "ps6", name: "Envirostock Ltd", city: "Wakefield, Yorkshire", country: "United Kingdom", website: "www.envirostock.co.uk", tier: "Silver Member", verified: true, mainProduct: "Recycled Plastics & HDPE Pellets" }
    ],
    latestSuppliers: [
      { id: "ls1", name: "Parnavie Exports", city: "Walthamstow, London", country: "United Kingdom", tier: "Gold Member", verified: true, mainProduct: "Wood Pellets & Biomass Fuel" },
      { id: "ls2", name: "Gnm Distribution Limited", city: "London", country: "United Kingdom", tier: "Gold Member", verified: true, mainProduct: "Wholesale General Consumer Trade" },
      { id: "ls3", name: "Al Noor Pulse Store", city: "Woodhouse, Leeds", country: "United Kingdom", tier: "Silver Member", verified: true, mainProduct: "Bulk Pulses & Spices Import" },
      { id: "ls4", name: "Trade Price Limited", city: "Stanmore, Middlesex", country: "United Kingdom", tier: "Gold Member", verified: true, mainProduct: "Building Supplies & Hardware" },
      { id: "ls5", name: "Maplin Electronics", city: "West Yorkshire", country: "United Kingdom", tier: "Gold Member", verified: true, mainProduct: "Electronics, Mobile Phones, Graphics Cards" },
      { id: "ls6", name: "Okean Capital Ltd", city: "Chunya", country: "United Kingdom", tier: "Silver Member", verified: true, mainProduct: "Financial Escrow & Commodity Trade" },
      { id: "ls7", name: "Evatronicsbreeze Breeze Electronics", city: "Manchester", country: "United Kingdom", tier: "Gold Member", verified: true, mainProduct: "Consumer Electronics & Microchips" },
      { id: "ls8", name: "Bestway Gadgets And Electronics Store", city: "Taipei / UK Office", country: "United Kingdom", tier: "Gold Member", verified: true, mainProduct: "Smartphones & Mobile Accessories" },
      { id: "ls9", name: "Premium Golf Carts UK", city: "London", country: "United Kingdom", tier: "Silver Member", verified: true, mainProduct: "Electric Golf Carts & Utility Buggies" }
    ],
    latestProducts: [
      { id: "lp1", title: "Sub 4mm Glass Plate Fines", category: "Industrial Minerals", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80" },
      { id: "lp2", title: "LNG (Liquefied Natural Gas)", category: "Energy & Petroleum", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80" },
      { id: "lp3", title: "QELVANT BSV-ND 300ml Unscented Home Odour Neutralizer", category: "Home & Garden", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
      { id: "lp4", title: "Custom Frosted Plastic Zip Lock Garment Packaging", category: "Packaging & Printing", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80" },
      { id: "lp5", title: "Mist Spray Pump 24/410", category: "Cosmetic Packaging", image: "https://images.unsplash.com/photo-1608248597260-6521e102f97c?w=400&q=80" },
      { id: "lp6", title: "Premium Quality Biomass Pellets For Efficient Eco Heating", category: "Renewable Energy", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80" },
      { id: "lp7", title: "Basrah Medium Crude Oil", category: "Petroleum & Energy", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80" },
      { id: "lp8", title: "Panasonic EY9L40 14.4V 3.0Ah Lithium Ion Battery", category: "Electronics & Batteries", image: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&q=80" },
      { id: "lp9", title: "Chrome Ore Lumpy 42-44%", category: "Ores & Minerals", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80" },
      { id: "lp10", title: "Electric Forklift Trucks | Buy Direct", category: "Machinery & Equipment", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80" },
      { id: "lp11", title: "Palm Oil & Palm Kernel Cake", category: "Agriculture & Edible Oils", image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&q=80" },
      { id: "lp12", title: "Bitter Kola Raw Bulk Export", category: "Agro Produce", image: "https://images.unsplash.com/photo-1509358217958-89c02ff5438a?w=400&q=80" }
    ],
    latestBuyOffers: [
      { id: "bo1", title: "Looking For Wholesale Supplier Of Womens Sets & Casual Apparel", date: "26 Aug, 2026", quantity: "2,000 Sets", buyerCountry: "United Kingdom" },
      { id: "bo2", title: "Need Hookah Parts & Precision Brass Valves", date: "26 Aug, 2026", quantity: "5,000 Units", buyerCountry: "United Kingdom" },
      { id: "bo3", title: "Repeat Order Inquiry For Metal Frames For UK Furniture", date: "26 Aug, 2026", quantity: "500 Sets", buyerCountry: "United Kingdom" },
      { id: "bo4", title: "Need Handmade Snooker Pool Cues Factory Supplier", date: "26 Aug, 2026", quantity: "1,000 Cues", buyerCountry: "United Kingdom" },
      { id: "bo5", title: "Sample Request For 800W High Power Pure Sine Wave Inverters", date: "25 Aug, 2026", quantity: "50 Units", buyerCountry: "United Kingdom" },
      { id: "bo6", title: "Sourcing Instant And Freeze-Dried Tea Powders", date: "25 Aug, 2026", quantity: "5 MT", buyerCountry: "United Kingdom" },
      { id: "bo7", title: "Mini Excavators 1.5-5 Ton Class Needed For UK Construction", date: "24 Aug, 2026", quantity: "10 Units", buyerCountry: "United Kingdom" }
    ],
    seoDescription: {
      headline: "THE LARGEST B2B MARKETPLACE IN THE UNITED KINGDOM - TRADEHEAVEN.NET",
      sections: [
        {
          title: "B2B Trade in the United Kingdom",
          body: "B2B trade has long been a prominent feature in the United Kingdom's economy, and TradeHeaven.net has been the number one facilitator for their cross-border trade activities. Made to connect manufacturers, exporters, and foreign buyers of the United Kingdom easy access to the rest of the world."
        },
        {
          title: "PROVIDING EASY ENTRY ON THE LEADING B2B MARKETPLACE IN UK",
          body: "Young entrepreneurs, SMEs, and even established businesses look for the easiest business opportunities. At TradeHeaven.net, we have been serving this B2B industry with genuine business openings that are cost-effective and time-effective. Create your digital store on our platform and start selling today."
        },
        {
          title: "GET CLOSER TO YOUR CUSTOMERS WITH THE TOP B2B PLATFORM UK",
          body: "We help UK B2B businesses to get closer to their customers. Brands trust TradeHeaven.net to deliver creative solutions to their complex business problems. Developing long-standing partnerships is the key to any successful business."
        },
        {
          title: "VALUE-ADDED SERVICES - GLOBAL B2B SOURCING PLATFORM",
          body: "To further help the B2B suppliers in UK, we have come up with value-added services. Now you can simply register on our website and get access to thousands of products and buying leads with an active business approach."
        }
      ]
    }
  },
  "usa": {
    id: "usa",
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    stats: { companies: 11450, products: 14200, rfqs: 5890 },
    topExports: [
      "Crude Petroleum", "Refined Petroleum", "Integrated Circuits", "Aircraft & Parts", "Cars & Light Trucks",
      "Natural Gas & LNG", "Soybeans", "Medical Instruments", "Industrial Machinery", "Plastics Materials",
      "Pharmaceuticals", "Optical Apparatus", "Chemical Products", "Aluminium", "Raw Cotton"
    ],
    topImports: [
      "Cars & Passenger Vehicles", "Computers & Laptops", "Telephones & Mobile Devices", "Integrated Circuits",
      "Packaged Medicaments", "Crude Petroleum", "Vehicle Parts", "Medical Devices", "Furniture", "Plastics",
      "Footwear", "Apparel", "Solar Panels", "Lithium Batteries", "Organic Chemicals"
    ],
    premiumSuppliers: [
      { id: "us_ps1", name: "Texas Energy & Refined Products LLC", city: "Houston, Texas", country: "United States", website: "www.texasenergyrefined.com", tier: "Gold Member", verified: true, mainProduct: "Ultra-Low Sulfur Diesel (ULSD) & Propane" },
      { id: "us_ps2", name: "Midwest Harvest Grain Logistics", city: "Chicago, Illinois", country: "United States", website: "www.midwestharvest.com", tier: "Gold Member", verified: true, mainProduct: "Yellow Corn & Soybeans Bulk Vessel" },
      { id: "us_ps3", name: "Silicon Valley Optical Tech Corp", city: "San Jose, California", country: "United States", website: "www.svopticaltech.com", tier: "Silver Member", verified: true, mainProduct: "Industrial Optical Transceivers 400G" },
      { id: "us_ps4", name: "Atlantic Maritime Hardware Inc", city: "Boston, Massachusetts", country: "United States", website: "www.atlanticmaritimehardware.com", tier: "Gold Member", verified: true, mainProduct: "Marine Winches & Deck Machinery" }
    ],
    latestSuppliers: [
      { id: "us_ls1", name: "California Almond & Nut Growers", city: "Fresno, CA", country: "United States", tier: "Gold Member", verified: true, mainProduct: "Nonpareil Supreme Raw Almonds" },
      { id: "us_ls2", name: "Detroit Heavy Automotive Tooling", city: "Detroit, MI", country: "United States", tier: "Gold Member", verified: true, mainProduct: "Hydraulic Stamping Presses" },
      { id: "us_ls3", name: "Miami International Marine Spares", city: "Miami, FL", country: "United States", tier: "Silver Member", verified: true, mainProduct: "Outboard Engine Parts & Props" }
    ],
    latestProducts: [
      { id: "us_lp1", title: "ULSD 10ppm Diesel Fuel Fuel Oil Grade A", category: "Petroleum", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80" },
      { id: "us_lp2", title: "Nonpareil Supreme 23/25 Raw Shelled Almonds", category: "Agriculture", image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=400&q=80" },
      { id: "us_lp3", title: "Heavy Duty CNC Milling Machines 5-Axis", category: "Machinery", image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80" }
    ],
    latestBuyOffers: [
      { id: "us_bo1", title: "Sourcing Certified PPE Nitrile Examination Gloves 100k Boxes", date: "27 Aug, 2026", quantity: "100,000 Boxes", buyerCountry: "United States" },
      { id: "us_bo2", title: "Inquiry for 100% Cotton Hotel Quality Bed Sheets FCL", date: "26 Aug, 2026", quantity: "10,000 Sets", buyerCountry: "United States" },
      { id: "us_bo3", title: "Looking for High Volume Heavy Duty Industrial Ball Bearings", date: "25 Aug, 2026", quantity: "25,000 Units", buyerCountry: "United States" }
    ],
    seoDescription: {
      headline: "LARGEST B2B SUPPLIERS & BUYERS DIRECTORY IN THE USA - TRADEHEAVEN.NET",
      sections: [
        {
          title: "United States B2B Global Trade Network",
          body: "The United States represents the largest wholesale consumer market globally. TradeHeaven.net provides seamless connectivity between American importers, distributors, manufacturers, and international bulk suppliers."
        }
      ]
    }
  },
  "india": {
    id: "india",
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    stats: { companies: 12850, products: 15420, rfqs: 5420 },
    topExports: [
      "1121 Basmati Rice", "Refined Petroleum", "Packaged Medicaments", "Diamonds & Jewelry", 
      "Automotive Components", "Cotton Yarn & Apparel", "Organic Chemicals", "Iron & Steel", 
      "Engineering Goods", "Marine Products & Shrimp", "Spices & Spices Extracts", "Ceramic Tiles",
      "Granite Slabs", "Leather Goods", "Handloom Textiles"
    ],
    topImports: [
      "Crude Petroleum", "Gold & Silver", "Coal & Briquettes", "Integrated Circuits", 
      "Liquefied Natural Gas", "Vegetable Oils & Palm Oil", "Fertilizers", "Plastics Raw Materials", 
      "Telecommunication Gear", "Optical Instruments", "Precision Tools", "Scrap Metal"
    ],
    premiumSuppliers: [
      { id: "in_ps1", name: "Royal Basmati & Grain Exporters Ltd", city: "Karnal, Haryana", country: "India", website: "www.royalbasmatigrain.in", tier: "Gold Member", verified: true, mainProduct: "1121 Steam & Pusa Basmati Rice" },
      { id: "in_ps2", name: "Bharat Heavy Industrial Tools LLP", city: "Ludhiana, Punjab", country: "India", website: "www.bharatindustrialtools.in", tier: "Gold Member", verified: true, mainProduct: "Agricultural Implements & Tractors" },
      { id: "in_ps3", name: "Deccan Fine Pharma Labs", city: "Hyderabad, Telangana", country: "India", website: "www.deccanfinepharma.in", tier: "Silver Member", verified: true, mainProduct: "Active Pharmaceutical Ingredients (APIs)" }
    ],
    latestSuppliers: [
      { id: "in_ls1", name: "Surat Diamond Polishing Hub", city: "Surat, Gujarat", country: "India", tier: "Gold Member", verified: true, mainProduct: "Lab Grown & Natural Diamonds" },
      { id: "in_ls2", name: "Tirupur Knitwear Export House", city: "Tirupur, Tamil Nadu", country: "India", tier: "Gold Member", verified: true, mainProduct: "Cotton T-Shirts & Pajamas" },
      { id: "in_ls3", name: "Varanasi Silk & Handloom Crafts", city: "Varanasi, UP", country: "India", tier: "Silver Member", verified: true, mainProduct: "Jacquard Silk Fabrics & Sarees" }
    ],
    latestProducts: [
      { id: "in_lp1", title: "1121 Extra Long Grain Parboiled Basmati Rice", category: "Agro Foods", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
      { id: "in_lp2", title: "Handmade Organic Cotton Bedsheets 300 TC", category: "Textiles", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80" },
      { id: "in_lp3", title: "Polished Black Galaxy Granite Slabs 20mm", category: "Stone & Marble", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" }
    ],
    latestBuyOffers: [
      { id: "in_bo1", title: "Requirement for 250 MT High Grade Steam Coal 6000 GCV", date: "27 Aug, 2026", quantity: "250 MT", buyerCountry: "India" },
      { id: "in_bo2", title: "Inquiry for Refined Bleached Palm Olein (RBD)", date: "26 Aug, 2026", quantity: "100 MT", buyerCountry: "India" },
      { id: "in_bo3", title: "Looking for High Speed CNC Wire EDM Machines", date: "25 Aug, 2026", quantity: "2 Units", buyerCountry: "India" }
    ],
    seoDescription: {
      headline: "PREMIER B2B MARKETPLACE IN INDIA - TRADEHEAVEN.NET",
      sections: [
        {
          title: "India's Global B2B Export Powerhouse",
          body: "As one of the world's fastest-growing major trade economies, India provides unrivaled supply capabilities in agricultural commodities, pharmaceuticals, textiles, engineering goods, and handicrafts. TradeHeaven.net connects global buyers directly with verified Indian manufacturers."
        }
      ]
    }
  },
  "germany": {
    id: "germany",
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    stats: { companies: 6840, products: 6120, rfqs: 2180 },
    topExports: [
      "Cars & Motor Vehicles", "Vehicle Parts", "Packaged Medicaments", "Industrial Machinery", 
      "Medical Instruments", "Chemical Products", "Electrical Apparatus", "Plastics", 
      "Aircraft", "Iron & Steel Articles", "Precision Tools", "Optics & Sensors"
    ],
    topImports: [
      "Cars & Auto Parts", "Crude Petroleum", "Petroleum Gas", "Integrated Circuits", 
      "Computers", "Packaged Medicaments", "Electrical Machinery", "Plastics", 
      "Medical Devices", "Apparel"
    ],
    premiumSuppliers: [
      { id: "de_ps1", name: "Bavaria Precision Machine Tools GmbH", city: "Munich, Bavaria", country: "Germany", website: "www.bavariaprecision.de", tier: "Gold Member", verified: true, mainProduct: "5-Axis CNC Milling Centers" },
      { id: "de_ps2", name: "Rheinland Chemical & Polymer AG", city: "Frankfurt, Hesse", country: "Germany", website: "www.rheinlandchemie.de", tier: "Gold Member", verified: true, mainProduct: "Industrial Polyurethane & Adhesives" },
      { id: "de_ps3", name: "Stuttgart Auto Components KG", city: "Stuttgart, BW", country: "Germany", website: "www.stuttgartautocomponents.de", tier: "Silver Member", verified: true, mainProduct: "Heavy Duty Brake Calipers & Sensors" }
    ],
    latestSuppliers: [
      { id: "de_ls1", name: "Hamburg Port Logistics Network", city: "Hamburg", country: "Germany", tier: "Gold Member", verified: true, mainProduct: "Global Multimodal Freight Services" },
      { id: "de_ls2", name: "Berlin MedTech Innovations", city: "Berlin", country: "Germany", tier: "Gold Member", verified: true, mainProduct: "Diagnostic Ultrasound Equipment" },
      { id: "de_ls3", name: "Dresden Solar Wafer Fabrication", city: "Dresden", country: "Germany", tier: "Silver Member", verified: true, mainProduct: "Silicon Ingots & Solar Cells" }
    ],
    latestProducts: [
      { id: "de_lp1", title: "5-Axis High Precision CNC Vertical Machining Center", category: "Machinery", image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80" },
      { id: "de_lp2", title: "Industrial Polyurethane Sealants & Structural Adhesives", category: "Chemicals", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" }
    ],
    latestBuyOffers: [
      { id: "de_bo1", title: "Inquiry for High Precision Aluminium Die Castings", date: "27 Aug, 2026", quantity: "50,000 Units", buyerCountry: "Germany" },
      { id: "de_bo2", title: "Looking for Basmati Rice Grade 1121 XXL Grain", date: "26 Aug, 2026", quantity: "5 Containers", buyerCountry: "Germany" }
    ]
  },
  "uae": {
    id: "uae",
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    stats: { companies: 7450, products: 6890, rfqs: 2840 },
    topExports: [
      "Crude Petroleum", "Gold & Precious Metals", "Refined Petroleum Products", 
      "Broadcasting Equipment", "Diamonds", "Petroleum Gas & LNG", "Aluminium", 
      "Perfumes & Oud", "Re-Export Vehicles", "Polymers & Plastics"
    ],
    topImports: [
      "Gold & Bullion", "Broadcasting Gear & Phones", "Cars & Motor Vehicles", 
      "Refined Petroleum", "Diamonds", "Packaged Medicaments", "Jewelry", 
      "Aircraft Parts", "Computers", "Foodstuffs"
    ],
    premiumSuppliers: [
      { id: "ae_ps1", name: "Emirates Gold Refining DMCC", city: "Dubai", country: "United Arab Emirates", website: "www.emiratesgoldrefining.ae", tier: "Gold Member", verified: true, mainProduct: "999.9 Fine Gold Bullion & Kilobars" },
      { id: "ae_ps2", name: "Al-Dhafra Petrochemical Trading", city: "Abu Dhabi", country: "United Arab Emirates", website: "www.aldhafrapetrochem.ae", tier: "Gold Member", verified: true, mainProduct: "Linear Low-Density Polyethylene (LLDPE)" },
      { id: "ae_ps3", name: "Sharjah Luxury Fragrances FZC", city: "Sharjah", country: "United Arab Emirates", website: "www.sharjahfragrances.ae", tier: "Silver Member", verified: true, mainProduct: "Pure Cambodian Oud & Concentrated Oils" }
    ],
    latestSuppliers: [
      { id: "ae_ls1", name: "JAFZA Multi-Commodity Logistics", city: "Dubai", country: "United Arab Emirates", tier: "Gold Member", verified: true, mainProduct: "Bonded Cold Chain Hub Services" },
      { id: "ae_ls2", name: "Ras Al Khaimah Ceramic Works", city: "Ras Al Khaimah", country: "United Arab Emirates", tier: "Gold Member", verified: true, mainProduct: "Heavy Duty Vitrified Floor Tiles" }
    ],
    latestProducts: [
      { id: "ae_lp1", title: "LBMA Certified 999.9 Gold Kilobar 1KG", category: "Precious Metals", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&q=80" },
      { id: "ae_lp2", title: "Concentrated Dehn Al Oud Fragrance Oil 100ml", category: "Perfumes", image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&q=80" }
    ],
    latestBuyOffers: [
      { id: "ae_bo1", title: "Procurement of 1121 Basmati Rice XXL Grain", date: "27 Aug, 2026", quantity: "20 Containers", buyerCountry: "United Arab Emirates" },
      { id: "ae_bo2", title: "Urgent Requirement for Galvanized Steel Pipes 4 Inch", date: "26 Aug, 2026", quantity: "500 MT", buyerCountry: "United Arab Emirates" }
    ]
  }
};

export const DEDICATED_COUNTRY_SEO_COPY: Record<string, { headline: string; sections: { title: string; body: string }[] }> = {
  "uk": {
    headline: "THE LARGEST B2B MARKETPLACE IN THE UNITED KINGDOM – TRADE HEAVEN",
    sections: [
      {
        title: "Leading Cross-Border Trade Facilitator for UK Enterprises",
        body: "Cross-border B2B trade is the lifeblood of the United Kingdom’s economy, and Trade Heaven is built to serve as the premier digital gateway for British enterprises. Designed to empower manufacturers, verified distributors, and high-volume importers across England, Scotland, Wales, and Northern Ireland, Trade Heaven breaks down international sourcing friction. We connect UK suppliers directly with genuine overseas bulk buyers while equipping local importers with transparent access to global production hubs."
      },
      {
        title: "Seamless Market Access on the UK's Leading B2B Platform",
        body: "Whether you are an emerging SME in Birmingham or an established multinational distributor in London, securing direct, high-margin trade routes is critical. Trade Heaven delivers a streamlined, B2C-grade digital procurement experience tailored for wholesale transactions. By launching your digital storefront on Trade Heaven, British exporters eliminate middleman markups, receive authenticated global RFQs, and secure foreign supply contracts with speed and total transparency."
      },
      {
        title: "Build High-Value Partnerships in Key British Export Sectors",
        body: "The United Kingdom continues to lead international demand across high-value sectors, including aerospace parts, precision automotive engineering, Scotch whisky, pharmaceuticals, and specialized industrial machinery. Trade Heaven provides targeted B2B trade corridors, verified escrow milestones, and integrated multi-currency clearing to help UK suppliers expand their export footprints across North America, the Middle East, and the Asia-Pacific region."
      },
      {
        title: "Value-Added Sourcing & Verified Buyer Matching",
        body: "Modern wholesale commerce demands agility and verified trust. Through Trade Heaven's Gold Supplier memberships, UK businesses gain access to curated buyer leads, prioritized RFQ placement, and dedicated relationship managers. Experience a simpler, faster, and more profitable way to conduct international trade with Trade Heaven UK."
      }
    ]
  },
  "usa": {
    headline: "THE PREMIER GLOBAL B2B TRADE HUB IN THE UNITED STATES – TRADE HEAVEN",
    sections: [
      {
        title: "Powering American Wholesale Commerce & Cross-Border Supply Chains",
        body: "As the world's most dynamic commercial market, the United States demands an enterprise-grade B2B trade platform built for scale, speed, and verification. Trade Heaven serves as the ultimate digital bridge for American manufacturers, commercial distributors, and Fortune-grade sourcing teams, streamlining trade flows between North America and key manufacturing regions across the globe."
      },
      {
        title: "Frictionless Supplier Onboarding for US Exporters and Distributors",
        body: "From agricultural conglomerates in the Midwest to advanced technology hubs in California and heavy manufacturing plants in Texas, American businesses leverage Trade Heaven to expand their international reach. Our unified trade directory allows US suppliers to list catalog lines, receive real-time bulk RFQs, and negotiate directly with pre-vetted international importers without third-party commission leakage."
      },
      {
        title: "Capitalize on High-Demand US Export Categories",
        body: "Global demand for American-made goods—including refined energy products, industrial automation equipment, aerospace components, medical instrumentation, and agricultural commodities—is at an all-time high. Trade Heaven optimizes your digital visibility across high-converting international trade channels, connecting you directly with qualified enterprise buyers ready to execute large-scale purchase orders."
      },
      {
        title: "Enterprise Trade Assurance & Value-Added Sourcing Services",
        body: "Navigating international compliance and payment verification is effortless with Trade Heaven. Backed by end-to-end buyer authentication, secure trade protocols, and automated RFQ matching, US businesses can safely scale import and export operations with maximum efficiency."
      }
    ]
  },
  "india": {
    headline: "INDIA'S LEADING B2B EXPORT & IMPORT MARKETPLACE – TRADE HEAVEN",
    sections: [
      {
        title: "Empowering Indian Manufacturers & Exporters to Scale Globally",
        body: "India's rapid emergence as a global manufacturing powerhouse requires a dedicated digital marketplace that bridges domestic producers with international wholesale buyers. Trade Heaven is engineered to solve the operational hurdles faced by Indian exporters, eliminating language barriers, fragmented supply chains, and untrusted lead funnels."
      },
      {
        title: "Direct Global Access for Indian MSMEs and Industrial Clusters",
        body: "From the textile hubs of Tirupur and Surat to the rice-growing belts of Punjab and Haryana and the engineering clusters of Ludhiana and Pune, Trade Heaven provides a direct route to overseas markets. Indian sellers can establish verified digital storefronts, showcase export-ready product lines, and receive authentic, high-value inquiries directly from global procurement teams."
      },
      {
        title: "Maximize Returns on Core Indian Export Commodities",
        body: "Trade Heaven drives targeted buyer traffic to India's most competitive export sectors, including 1121 Basmati rice, organic spices, cotton textiles, pharmaceuticals, agro-machinery, and precision brass fittings. Our verified trade mechanisms ensure that Indian suppliers secure recurring bulk contracts with dependable payment terms."
      },
      {
        title: "Comprehensive Trade Enablement & Gold Exporter Support",
        body: "With dedicated relationship managers, optimized SEO storefronts, and guaranteed RFQ dispatching, Trade Heaven equips Indian exporters with the digital infrastructure needed to outperform traditional trade methods and capture profitable foreign market share."
      }
    ]
  },
  "uae": {
    headline: "THE CENTRAL B2B SOURCING & RE-EXPORT PLATFORM IN THE UAE – TRADE HEAVEN",
    sections: [
      {
        title: "Connecting Dubai & UAE Re-Export Hubs with Global Trade Corridors",
        body: "Positioned at the crossroads of East-West trade, the United Arab Emirates is the world's premier commercial transshipment hub. Trade Heaven serves as the central digital trade network for UAE-based trading houses, free zone entities, and bulk distributors operating out of Dubai, Abu Dhabi, Sharjah, and JAFZA."
      },
      {
        title: "Accelerate Wholesale Procurement for Middle Eastern Importers & Exporters",
        body: "Whether sourcing raw gold bullion, refined polymers, consumer electronics, or premium food commodities, Trade Heaven connects UAE businesses directly with primary factory lines in Asia, Europe, and the Americas. Our high-performance interface facilitates rapid quotation cycles and direct vendor communication."
      },
      {
        title: "Dominating Trade in High-Volume Regional Commodities",
        body: "Capitalizing on the UAE's leadership in petrochemicals, luxury perfumery (Dehn Al Oud), construction materials, precious metals, and re-export vehicles, Trade Heaven creates dedicated international buying channels that ensure maximum liquidity and rapid transaction closing."
      },
      {
        title: "Trade Assurance Built for Gulf Enterprises",
        body: "Trade Heaven provides stringent supplier verification, multi-currency escrow frameworks, and integrated logistics tracking, making it the most trusted B2B trade portal for businesses scaling across the GCC, MENA, and international markets."
      }
    ]
  },
  "germany": {
    headline: "GERMANY'S ADVANCED INDUSTRIAL B2B MARKETPLACE – TRADE HEAVEN",
    sections: [
      {
        title: "Digital Trade Solutions for Germany's World-Class Mittelstand & Industrial Exporters",
        body: "As the industrial engine of Europe, Germany sets the global standard for engineering precision, automotive manufacturing, and chemical innovation. Trade Heaven serves as the digital sourcing ecosystem connecting German industrial manufacturers with vetted global enterprises requiring top-tier technology and components."
      },
      {
        title: "Direct Sourcing Channels for German Importers & Industrial Buyers",
        body: "German procurement managers demand rigor, reliability, and precision. Trade Heaven streamlines international procurement by delivering a curated directory of ISO-certified suppliers, pre-vetted raw material producers, and verified component manufacturers across multiple continents."
      },
      {
        title: "Expanding Global Reach for German Engineering and High-Tech Exports",
        body: "From 5-axis CNC machine tools and automotive sub-assemblies in Bavaria to specialized polymers in the Rhineland and medical technology in Berlin, Trade Heaven amplifies German export visibility, enabling suppliers to capture lucrative international contract orders."
      },
      {
        title: "Enterprise Gold Membership & Verified RFQ Management",
        body: "Through structured digital catalog tools, priority lead filtering, and end-to-end trade assurance, Trade Heaven provides German businesses with a secure, highly efficient portal to maintain global supply chain leadership."
      }
    ]
  },
  "china": {
    headline: "THE ULTIMATE DIRECT-FROM-FACTORY B2B PLATFORM IN CHINA – TRADE HEAVEN",
    sections: [
      {
        title: "Unlocking Direct Access to the World’s Largest Manufacturing Base",
        body: "China remains the powerhouse of global manufacturing and wholesale supply. Trade Heaven establishes a direct, verified bridge between Chinese OEM/ODM factories, industrial manufacturers, and international bulk importers across North America, Europe, the Middle East, and Southeast Asia."
      },
      {
        title: "Eliminate Intermediaries with Direct Factory Connections",
        body: "From electronics hubs in Shenzhen to heavy machinery clusters in Ningbo and solar panel production in Jiangsu, Trade Heaven allows global buyers to negotiate directly with verified factory owners. Avoid unnecessary trader markups and secure rock-bottom wholesale pricing with full production transparency."
      },
      {
        title: "Scaling High-Volume Chinese Exports Across Worldwide Markets",
        body: "Chinese suppliers on Trade Heaven benefit from high-converting international search indexing, targeted buyer inquiries, and automated multi-language translation, ensuring their consumer electronics, lithium battery systems, industrial tools, and textiles reach genuine global procurement desks."
      },
      {
        title: "Protected Cross-Border Procurement and Quality Assurance",
        body: "Trade Heaven protects overseas buyers with verified factory audits, certified supplier tiers, and secure milestone disbursements, making wholesale sourcing from China transparent, reliable, and friction-free."
      }
    ]
  }
};

export function getSeoCopyForCountry(countryId: string, countryName: string) {
  const normId = countryId.toLowerCase().trim();
  const keyMap: Record<string, string> = {
    "uk": "uk",
    "united-kingdom": "uk",
    "gb": "uk",
    "usa": "usa",
    "united-states": "usa",
    "us": "usa",
    "india": "india",
    "in": "india",
    "uae": "uae",
    "united-arab-emirates": "uae",
    "ae": "uae",
    "germany": "germany",
    "de": "germany",
    "china": "china",
    "cn": "china"
  };

  const matchedKey = keyMap[normId];
  if (matchedKey && DEDICATED_COUNTRY_SEO_COPY[matchedKey]) {
    return DEDICATED_COUNTRY_SEO_COPY[matchedKey];
  }

  return {
    headline: `THE PREMIER B2B TRADE MARKETPLACE IN ${countryName.toUpperCase()} – TRADE HEAVEN`,
    sections: [
      {
        title: `Facilitating High-Growth Cross-Border Trade in ${countryName}`,
        body: `B2B commerce is a foundational driver of economic expansion in ${countryName}, and Trade Heaven serves as the premier digital ecosystem connecting local manufacturers, distributors, and bulk buyers with high-value trade corridors across the globe. We streamline international sourcing by providing verified access to authentic wholesale markets.`
      },
      {
        title: `Easy Onboarding and Direct Sourcing for ${countryName} Businesses`,
        body: `SMEs and established enterprises in ${countryName} rely on Trade Heaven to simplify wholesale buying and selling. By creating a verified supplier profile or posting high-priority RFQs, companies can cut procurement cycles in half, eliminate middleman overhead, and secure profitable trade agreements quickly.`
      },
      {
        title: `Capitalizing on Core National Imports and Exports`,
        body: `Whether expanding export channels for top agricultural, mineral, and manufactured commodities or importing high-demand industrial machinery and raw materials into ${countryName}, Trade Heaven delivers targeted buyer exposure, real-time analytics, and guaranteed quotation matching.`
      },
      {
        title: `Value-Added Sourcing and Enterprise Trade Assurance`,
        body: `With dedicated relationship managers, authenticated buyer directories, and transparent transaction monitoring, Trade Heaven is the trusted choice for ${countryName} businesses seeking profitable, sustainable global expansion.`
      }
    ]
  };
}

// Helper function to dynamically generate fallback data for any of the 34 countries
export function getCountryData(countryId: string): CountryData {
  if (COUNTRIES_DATA[countryId]) {
    const rawData = COUNTRIES_DATA[countryId];
    return {
      ...rawData,
      seoDescription: getSeoCopyForCountry(countryId, rawData.name)
    };
  }

  const foundItem = ALL_COUNTRY_ITEMS.find(c => c.id === countryId) || {
    id: countryId,
    name: countryId.charAt(0).toUpperCase() + countryId.slice(1).replace(/-/g, ' '),
    code: countryId.slice(0, 2).toUpperCase(),
    flag: "🌐"
  };

  const name = foundItem.name;

  return {
    id: foundItem.id,
    name: name,
    code: foundItem.code,
    flag: foundItem.flag,
    stats: {
      companies: Math.floor(Math.random() * 3000) + 1500,
      products: Math.floor(Math.random() * 4000) + 2000,
      rfqs: Math.floor(Math.random() * 1000) + 500
    },
    topExports: [
      `${name} Premium Grain & Agriculture`, `${name} Refined Minerals`, `${name} Textiles & Garments`,
      `${name} Precision Electronics`, `${name} Heavy Machinery Tools`, `${name} Petroleum & Chemicals`,
      `${name} Medical & Surgical Gear`, `${name} Wood Pellets & Biomass`, `${name} Raw Metals & Copper`,
      `${name} Industrial Packaging`, `${name} Solar Energy Equipment`, `${name} Processed Foodstuffs`,
      `${name} Automotive Spare Parts`, `${name} Marine Products`, `${name} Organic Cosmetics`
    ],
    topImports: [
      `Crude Petroleum to ${name}`, `Heavy Industrial Tools to ${name}`, `Computers & Laptops`,
      `Integrated Circuits`, `Packaged Medicaments`, `Fertilizers Urea 46%`, `Structural Steel & Rebar`,
      `Vehicles & Auto Components`, `Polymer & Plastics`, `Organic Chemicals`, `Raw Cotton & Yarn`,
      `Solar Modules`, `Consumer Appliances`, `Telecom Gear`, `Paperboard Packaging`
    ],
    premiumSuppliers: [
      {
        id: `${foundItem.id}_ps1`,
        name: `${name} Global Trade Corp Ltd`,
        city: "Capital Industrial Zone",
        country: name,
        website: `www.${foundItem.id}-globaltrade.com`,
        tier: "Gold Member",
        verified: true,
        mainProduct: `Bulk Exports of ${name} Industrial Commodities`
      },
      {
        id: `${foundItem.id}_ps2`,
        name: `${name} Agro & Mineral Industries`,
        city: "Port Hub City",
        country: name,
        website: `www.${foundItem.id}-agrominerals.com`,
        tier: "Gold Member",
        verified: true,
        mainProduct: `Agricultural Produce & Processed Ores`
      },
      {
        id: `${foundItem.id}_ps3`,
        name: `${name} Precision Manufacturing Co`,
        city: "Tech Development Zone",
        country: name,
        website: `www.${foundItem.id}-precision.com`,
        tier: "Silver Member",
        verified: true,
        mainProduct: `OEM Machine Components & Electrical Tools`
      }
    ],
    latestSuppliers: [
      {
        id: `${foundItem.id}_ls1`,
        name: `${name} Apex Logistics Ltd`,
        city: "Central Port",
        country: name,
        tier: "Gold Member",
        verified: true,
        mainProduct: "Freight Forwarding & Customs Clearance"
      },
      {
        id: `${foundItem.id}_ls2`,
        name: `${name} National Chemicals & Resins`,
        city: "Industrial Park",
        country: name,
        tier: "Gold Member",
        verified: true,
        mainProduct: "Polypropylene & Industrial Solvents"
      },
      {
        id: `${foundItem.id}_ls3`,
        name: `${name} Textile & Apparel Exporters`,
        city: "Garment Hub",
        country: name,
        tier: "Silver Member",
        verified: true,
        mainProduct: "100% Cotton Fabrics & Outerwear"
      }
    ],
    latestProducts: [
      {
        id: `${foundItem.id}_lp1`,
        title: `High Grade Raw Material from ${name}`,
        category: "Raw Commodities",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80"
      },
      {
        id: `${foundItem.id}_lp2`,
        title: `Precision Engineered Equipment - ${name} Standard`,
        category: "Industrial Equipment",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80"
      },
      {
        id: `${foundItem.id}_lp3`,
        title: `Bulk Organic Agricultural Produce from ${name}`,
        category: "Agro Produce",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80"
      },
      {
        id: `${foundItem.id}_lp4`,
        title: `Heavy Duty Packaging Cartons & Pallets`,
        category: "Packaging",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80"
      },
      {
        id: `${foundItem.id}_lp5`,
        title: `High Output Solar Energy Inverters`,
        category: "Renewable Energy",
        image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
      },
      {
        id: `${foundItem.id}_lp6`,
        title: `Refined Petrochemical Olefins & Resins`,
        category: "Chemicals",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
      }
    ],
    latestBuyOffers: [
      {
        id: `${foundItem.id}_bo1`,
        title: `Inquiry for Wholesale Supply of Industrial Hardware in ${name}`,
        date: "27 Aug, 2026",
        quantity: "5,000 Units",
        buyerCountry: name
      },
      {
        id: `${foundItem.id}_bo2`,
        title: `Bulk Requirement for Urea 46% Granular Fertilizer`,
        date: "26 Aug, 2026",
        quantity: "1,000 MT",
        buyerCountry: name
      },
      {
        id: `${foundItem.id}_bo3`,
        title: `Sample Order Request for Stainless Steel Fasteners`,
        date: "25 Aug, 2026",
        quantity: "50,000 Pcs",
        buyerCountry: name
      }
    ],
    seoDescription: {
      headline: `THE LARGEST B2B MARKETPLACE IN ${name.toUpperCase()} - TRADEHEAVEN.NET`,
      sections: [
        {
          title: `B2B Sourcing Hub in ${name}`,
          body: `TradeHeaven.net connects manufacturers, suppliers, and foreign buyers in ${name} with global trade partners across 180+ countries.`
        },
        {
          title: "EASY B2B PORTAL ACCESS",
          body: `Register your company on TradeHeaven.net to publish product catalogs, post RFQs, and negotiate directly with verified suppliers in ${name}.`
        }
      ]
    }
  };
}

// --- PERSISTENT STORAGE SYNCHRONIZATION HELPERS ---
const STORAGE_ALL_COUNTRIES_KEY = 'th_admin_all_countries_items_v1';
const STORAGE_COUNTRIES_DATA_KEY = 'th_admin_countries_data_v1';
const STORAGE_COUNTRY_SEO_KEY = 'th_admin_country_seo_copy_v1';

export function saveCountriesToStorage(
  allCountries: typeof ALL_COUNTRY_ITEMS,
  countriesData: typeof COUNTRIES_DATA,
  seoCopy: typeof DEDICATED_COUNTRY_SEO_COPY
) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_ALL_COUNTRIES_KEY, JSON.stringify(allCountries));
      window.localStorage.setItem(STORAGE_COUNTRIES_DATA_KEY, JSON.stringify(countriesData));
      window.localStorage.setItem(STORAGE_COUNTRY_SEO_KEY, JSON.stringify(seoCopy));
    }
  } catch (err) {
    console.error('Failed to save countries to storage:', err);
  }
}

export function loadCountriesFromStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cachedAll = window.localStorage.getItem(STORAGE_ALL_COUNTRIES_KEY);
      const cachedData = window.localStorage.getItem(STORAGE_COUNTRIES_DATA_KEY);
      const cachedSeo = window.localStorage.getItem(STORAGE_COUNTRY_SEO_KEY);

      if (cachedAll) {
        const parsed = JSON.parse(cachedAll);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ALL_COUNTRY_ITEMS.splice(0, ALL_COUNTRY_ITEMS.length, ...parsed);
        }
      }
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed && typeof parsed === 'object') {
          Object.keys(COUNTRIES_DATA).forEach(key => delete COUNTRIES_DATA[key]);
          Object.assign(COUNTRIES_DATA, parsed);
        }
      }

      if (cachedSeo) {
        const parsed = JSON.parse(cachedSeo);
        if (parsed && typeof parsed === 'object') {
          Object.keys(DEDICATED_COUNTRY_SEO_COPY).forEach(key => delete DEDICATED_COUNTRY_SEO_COPY[key]);
          Object.assign(DEDICATED_COUNTRY_SEO_COPY, parsed);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load country updates from storage, using static defaults.', err);
  }
}

// Perform initial hydration on module execution
try {
  loadCountriesFromStorage();
} catch {}
