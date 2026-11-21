import { WORLD_COUNTRIES_LIST, WorldCountryMeta } from './worldCountriesAndBuyOrders';

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
  responseRate?: string;
  yearsActive?: number;
}

export interface CountryVerifiedBuyer {
  id: string;
  companyName: string;
  city: string;
  country: string;
  annualVolume: string;
  targetProducts: string[];
  orderFrequency: string;
  preferredIncoterms: string;
  verifiedSince: number;
}

export interface CountryProduct {
  id: string;
  title: string;
  category: string;
  image: string;
  moq?: string;
  fobRange?: string;
}

export interface CountryBuyOffer {
  id: string;
  title: string;
  date: string;
  quantity: string;
  buyerCountry?: string;
  category?: string;
  incoterm?: string;
}

export interface CountryData {
  id: string;
  name: string;
  code: string;
  flag: string;
  heroBannerImage?: string;
  primaryPort?: string;
  complianceStandards?: string[];
  tradeCurrency?: string;
  transitSummary?: string;
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
  verifiedBuyers?: CountryVerifiedBuyer[];
  seoDescription?: {
    headline: string;
    sections: { title: string; body: string }[];
  };
}

export interface CountryTradeProfile extends CountryData {
  slug: string;
  region: WorldCountryMeta['region'];
  primaryPort: string;
  flagUrl: string;
  flagSvgUrl: string;
  complianceStandards: string[];
  tradeCurrency: string;
  popularIncoterms: string[];
  transitSummary: string;
  avgResponseHours: string;
  escrowCoverageRate: string;
  verifiedBuyers: CountryVerifiedBuyer[];
  partnerCountries: WorldCountryMeta[];
  isCustomized?: boolean;
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
      { id: "lp1", title: "Sub 4mm Glass Plate Fines", category: "Industrial Minerals", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80" },
      { id: "lp2", title: "LNG (Liquefied Natural Gas)", category: "Energy & Petroleum", image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80" },
      { id: "lp3", title: "QELVANT BSV-ND 300ml Unscented Home Odour Neutralizer", category: "Home & Garden", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80" },
      { id: "lp4", title: "Custom Frosted Plastic Zip Lock Garment Packaging", category: "Packaging & Printing", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80" },
      { id: "lp5", title: "Mist Spray Pump 24/410", category: "Cosmetic Packaging", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80" },
      { id: "lp6", title: "Premium Quality Biomass Pellets For Efficient Eco Heating", category: "Renewable Energy", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80" },
      { id: "lp7", title: "Basrah Medium Crude Oil", category: "Petroleum & Energy", image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80" },
      { id: "lp8", title: "Panasonic EY9L40 14.4V 3.0Ah Lithium Ion Battery", category: "Electronics & Batteries", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80" },
      { id: "lp9", title: "Chrome Ore Lumpy 42-44%", category: "Ores & Minerals", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop&q=80" },
      { id: "lp10", title: "Electric Forklift Trucks | Buy Direct", category: "Machinery & Equipment", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&auto=format&fit=crop&q=80" },
      { id: "lp11", title: "Palm Oil & Palm Kernel Cake", category: "Agriculture & Edible Oils", image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&auto=format&fit=crop&q=80" },
      { id: "lp12", title: "Bitter Kola Raw Bulk Export", category: "Agro Produce", image: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=800&auto=format&fit=crop&q=80" }
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
      { id: "us_lp1", title: "ULSD 10ppm Diesel Fuel Fuel Oil Grade A", category: "Petroleum", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80" },
      { id: "us_lp2", title: "Nonpareil Supreme 23/25 Raw Shelled Almonds", category: "Agriculture", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80" },
      { id: "us_lp3", title: "Heavy Duty CNC Milling Machines 5-Axis", category: "Machinery", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80" }
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
      { id: "in_lp1", title: "1121 Extra Long Grain Parboiled Basmati Rice", category: "Agro Foods", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80" },
      { id: "in_lp2", title: "Handmade Organic Cotton Bedsheets 300 TC", category: "Textiles", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80" },
      { id: "in_lp3", title: "Polished Black Galaxy Granite Slabs 20mm", category: "Stone & Marble", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80" }
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
      { id: "de_lp1", title: "5-Axis High Precision CNC Vertical Machining Center", category: "Machinery", image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80" },
      { id: "de_lp2", title: "Industrial Polyurethane Sealants & Structural Adhesives", category: "Chemicals", image: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80" }
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
      { id: "ae_lp1", title: "LBMA Certified 999.9 Gold Kilobar 1KG", category: "Precious Metals", image: "https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=800&auto=format&fit=crop&q=80" },
      { id: "ae_lp2", title: "Concentrated Dehn Al Oud Fragrance Oil 100ml", category: "Perfumes", image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80" }
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

// --- DETERMINISTIC 196-COUNTRY PORTAL RESOLUTION & INTELLIGENCE ENGINE ---

function seededHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function toCountryUrlSlug(metaOrName: WorldCountryMeta | string): string {
  const name = typeof metaOrName === 'string' ? metaOrName : metaOrName.name;
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const COUNTRY_ALIAS_TO_CODE: Record<string, string> = {
  uk: 'GB',
  gb: 'GB',
  britain: 'GB',
  'great-britain': 'GB',
  'united-kingdom': 'GB',
  england: 'GB',
  usa: 'US',
  us: 'US',
  'united-states': 'US',
  'united-states-of-america': 'US',
  america: 'US',
  uae: 'AE',
  ae: 'AE',
  'united-arab-emirates': 'AE',
  dubai: 'AE',
  turkiye: 'TR',
  turkey: 'TR',
  'republic-of-turkiye': 'TR',
  'south-korea': 'KR',
  korea: 'KR',
  'republic-of-korea': 'KR',
  'czech-republic': 'CZ',
  czechia: 'CZ',
  'cote-divoire': 'CI',
  'ivory-coast': 'CI',
  'dr-congo': 'CD',
  drc: 'CD',
  holland: 'NL',
  'the-netherlands': 'NL'
};

export function findCountryByUrlSegment(rawInput?: string | null): WorldCountryMeta | null {
  if (!rawInput) return null;
  const cleaned = String(rawInput)
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/^country-/, '');
  if (!cleaned) return null;

  const aliasCode = COUNTRY_ALIAS_TO_CODE[cleaned];
  if (aliasCode) {
    const byAlias = WORLD_COUNTRIES_LIST.find(c => c.code === aliasCode);
    if (byAlias) return byAlias;
  }

  // Direct id or ISO-2 code match
  const direct = WORLD_COUNTRIES_LIST.find(
    c =>
      c.id.toLowerCase() === cleaned ||
      c.code.toLowerCase() === cleaned ||
      toCountryUrlSlug(c) === cleaned ||
      c.name.toLowerCase() === cleaned
  );
  if (direct) return direct;

  return null;
}

export function resolveWorldCountryMeta(countryIdOrName?: string | null): WorldCountryMeta {
  const exact = findCountryByUrlSegment(countryIdOrName);
  if (exact) return exact;

  if (countryIdOrName) {
    const norm = String(countryIdOrName).trim().toLowerCase();
    const partial = WORLD_COUNTRIES_LIST.find(
      c => c.name.toLowerCase().includes(norm) || norm.includes(c.name.toLowerCase())
    );
    if (partial) return partial;
  }

  return WORLD_COUNTRIES_LIST.find(c => c.code === 'GB') || WORLD_COUNTRIES_LIST[0];
}

const REGION_TRADE_TEMPLATES: Record<
  WorldCountryMeta['region'],
  {
    exports: string[];
    imports: string[];
    compliance: string[];
    currency: string;
    transit: string;
    productCatalog: Array<{ title: string; category: string; moq: string; fobRange: string }>;
    supplierTypes: Array<{ suffix: string; product: string }>;
    buyerTypes: Array<{ suffix: string; volume: string; products: string[]; freq: string }>;
  }
> = {
  Europe: {
    exports: [
      'Precision CNC Machinery', 'Industrial Valves & Pumps', 'Automotive Components', 'Pharmaceutical APIs',
      'Specialty Chemicals', 'Recycled Copper & Aluminum Scrap', 'Wood Pellets & Biomass', 'Dairy & Food Ingredients',
      'Surgical & Medical Devices', 'Electrical Switchgear', 'Stainless Steel Coils', 'Solar Inverters',
      'Packaging Machinery', 'Marine Hardware', 'Eco Paperboard & Kraft', 'Industrial Lubricants',
      'Hydraulic Cylinders', 'Polymer Resins (HDPE/LDPE)'
    ],
    imports: [
      'Basmati & Long Grain Rice', 'Cotton Garments & Knitwear', 'Lithium-Ion Battery Cells', 'Organic Spices & Tea',
      'Natural Rubber & Tyres', 'Solar PV Modules', 'Steel Fasteners & Hardware', 'Leather Goods & Footwear',
      'Urea 46% Fertilizer', 'Aluminum Extrusions', 'Plastic Injection Moulds', 'Essential Oils & Cosmetics',
      'Hand Tools & Workshop Gear', 'Frozen Seafood', 'Ceramic Tiles & Sanitaryware'
    ],
    compliance: ['CE Marking', 'ISO 9001:2015', 'REACH Compliant', 'EORI Customs Verified'],
    currency: 'EUR / GBP / USD',
    transit: '14–26 Days Ocean · 3–5 Days Air Freight',
    productCatalog: [
      { title: 'Precision 5-Axis CNC Machined Alloy Components', category: 'Industrial Machinery', moq: '250 Pcs', fobRange: '$18 – $64 / Pc' },
      { title: 'ENplus A1 Certified Industrial Wood Pellets', category: 'Renewable Energy', moq: '24 MT (1 FCL)', fobRange: '$245 – $285 / MT' },
      { title: 'Millberry 99.9% Bright Copper Wire Scrap', category: 'Metals & Scrap', moq: '20 MT', fobRange: '$7,850 – $8,320 / MT' },
      { title: 'ISO 13485 Stainless Surgical Instrument Kits', category: 'Medical & Healthcare', moq: '100 Kits', fobRange: '$42 – $115 / Kit' },
      { title: 'High-Pressure Flanged Industrial Centrifugal Pumps', category: 'Industrial Machinery', moq: '5 Units', fobRange: '$1,240 – $3,400 / Unit' },
      { title: 'Virgin & Recycled HDPE Injection Molding Granules', category: 'Chemicals & Polymers', moq: '25 MT', fobRange: '$940 – $1,180 / MT' },
      { title: 'Food-Grade Kraft Corrugated Export Cartons', category: 'Packaging & Printing', moq: '5,000 Pcs', fobRange: '$0.42 – $1.10 / Pc' },
      { title: 'Three-Phase Industrial Power Distribution Switchgear', category: 'Electronics & Power', moq: '10 Units', fobRange: '$680 – $2,150 / Unit' }
    ],
    supplierTypes: [
      { suffix: 'Industrial Engineering Ltd', product: 'CNC Precision Parts, Hydraulic Valves & Steel Assemblies' },
      { suffix: 'EuroMetals & Alloys Group', product: 'Copper Cathodes, Aluminum Ingots & Ferrous Scrap' },
      { suffix: 'Maritime Logistics & Export Co', product: 'Bulk Cargo Forwarding, Export Consolidation & Customs' },
      { suffix: 'BioEnergy & Wood Pellets BV', product: 'ENplus A1 Biomass Pellets & Sustainable Timber' },
      { suffix: 'MedTech Surgical Instruments GmbH', product: 'CE Certified Hospital Equipment & Diagnostic Supplies' },
      { suffix: 'PolyChem Materials & Resins', product: 'HDPE, LDPE, Polypropylene & Industrial Solvents' },
      { suffix: 'Continental Food & Beverage Exports', product: 'Milk Powder, Confectionery, Olive Oil & Beverages' },
      { suffix: 'Apex Packaging & Paperboard Solutions', product: 'Eco Kraft Cartons, Corrugated Pallets & Films' },
      { suffix: 'Vanguard Automation & Switchgear', product: 'PLC Control Panels, Industrial Sensors & Motors' }
    ],
    buyerTypes: [
      { suffix: 'Wholesale Distribution Group', volume: '$4.8M / yr', products: ['Cotton Apparel', 'Home Textiles', 'Packaging Cartons'], freq: 'Monthly FCL' },
      { suffix: 'Industrial Procurement Partners', volume: '$11.2M / yr', products: ['Stainless Fasteners', 'CNC Forgings', 'Electric Motors'], freq: 'Bi-Weekly' },
      { suffix: 'AgriFood Import House', volume: '$6.5M / yr', products: ['1121 Basmati Rice', 'Organic Spices', 'Cashew Kernels'], freq: 'Monthly 40ft' },
      { suffix: 'GreenGrid Energy Buyers', volume: '$14.0M / yr', products: ['Bifacial Solar Panels', 'LiFePO4 Batteries', 'Inverters'], freq: 'Quarterly Bulk' },
      { suffix: 'MedSupply Healthcare Imports', volume: '$3.9M / yr', products: ['Nitrile Gloves', 'Surgical Disposables', 'Lab Glassware'], freq: 'Monthly' },
      { suffix: 'BuildCore Hardware Merchants', volume: '$7.4M / yr', products: ['Ceramic Tiles', 'Sanitary Valves', 'Scaffolding Steel'], freq: 'Bi-Monthly' }
    ]
  },
  'Asia-Pacific': {
    exports: [
      '1121 Basmati & Jasmine Rice', 'Cotton Fabrics & Ready-Made Garments', 'Pharmaceutical Formulations',
      'Solar PV Modules & Lithium Cells', 'Spices, Tea & Coffee Beans', 'Forged Steel & Auto Parts',
      'LED Lighting & Consumer Electronics', 'Ceramic Tiles & Granite Slabs', 'Leather Footwear & Bags',
      'Natural Rubber & Palm Oil', 'PP Woven Bags & Flexible Packaging', 'CNC Machine Tools',
      'Stainless Steel Kitchenware', 'Marine & Frozen Seafood', 'Organic Essential Oils',
      'PVC Pipes & Fittings', 'Agro Fertilizers & Micronutrients', 'Electric Two-Wheelers & Parts'
    ],
    imports: [
      'Heavy Melting Steel Scrap (HMS 1&2)', 'Copper & Aluminum Scrap', 'Wood Pulp & Waste Paper',
      'Crude & Refined Petroleum', 'Precision German/Japanese CNC Machines', 'Dairy Milk Powder',
      'Medical Imaging Systems', 'Industrial Polymers & Resins', 'Semiconductor Wafers',
      'Raw Cashew & Almonds', 'Coal & Industrial Minerals', 'Laboratory Instruments',
      'Specialty Agrochemicals', 'Timber Logs & Lumber', 'Aviation & Marine Spare Parts'
    ],
    compliance: ['ISO 9001:2015', 'SGS Pre-Shipment Inspected', 'Phytosanitary / CoO', 'Export License Verified'],
    currency: 'USD / Local Clearing',
    transit: '12–24 Days Ocean · 2–4 Days Air Express',
    productCatalog: [
      { title: 'Export Grade 1121 Steam Basmati Rice (Sortex Clean)', category: 'Agriculture & Food', moq: '25 MT (1x20ft)', fobRange: '$920 – $1,080 / MT' },
      { title: '550W Monocrystalline Tier-1 Bifacial Solar Modules', category: 'Renewable Energy', moq: '1 Pallet (31 Pcs)', fobRange: '$0.14 – $0.18 / W' },
      { title: '100% Combed Organic Cotton Knitwear & Apparel', category: 'Textiles & Apparel', moq: '1,000 Pcs', fobRange: '$4.20 – $9.80 / Pc' },
      { title: 'WHO-GMP Certified Generic Pharmaceutical Tablets', category: 'Medical & Healthcare', moq: '10,000 Boxes', fobRange: '$0.85 – $3.40 / Box' },
      { title: 'Heavy-Duty CNC Precision Turned Automotive Shafts', category: 'Automotive & Parts', moq: '500 Pcs', fobRange: '$6.50 – $22.00 / Pc' },
      { title: 'Bulk Whole Spices, Turmeric Fingers & Black Pepper', category: 'Agriculture & Food', moq: '5 MT', fobRange: '$1,850 – $4,600 / MT' },
      { title: 'Porcelain Vitrified Floor Tiles 600x1200mm Glossy', category: 'Construction & Hardware', moq: '1,400 Sq.m', fobRange: '$6.80 – $11.50 / Sq.m' },
      { title: 'UV-Stabilized PP Woven Jumbo FIBC Bulk Bags', category: 'Packaging & Printing', moq: '2,000 Bags', fobRange: '$3.20 – $6.90 / Bag' }
    ],
    supplierTypes: [
      { suffix: 'Overseas Exporters Pvt Ltd', product: 'Basmati Rice, Whole Spices, Pulses & Agro Commodities' },
      { suffix: 'Precision Engineering & Forgings', product: 'Automotive Gears, Fasteners, CNC Machined Parts' },
      { suffix: 'Textiles & Apparel Mills', product: '100% Cotton Fabrics, Denim, Knitwear & Home Linen' },
      { suffix: 'Solar & CleanTech Manufacturing', product: 'Solar PV Panels, Lithium Packs & Hybrid Inverters' },
      { suffix: 'Global Pharma & Lifesciences', product: 'WHO-GMP Formulations, APIs & Surgical Disposables' },
      { suffix: 'Ceramics, Granite & Building Corp', product: 'Porcelain Tiles, Natural Stone Slabs & Sanitaryware' },
      { suffix: 'Polymers & Packaging Industries', product: 'FIBC Bulk Bags, BOPP Films & Rigid Containers' },
      { suffix: 'Marine & ColdChain Exports', product: 'IQF Vannamei Shrimp, Frozen Fish & Seafood' },
      { suffix: 'Industrial Chemicals & Dyes Ltd', product: 'Textile Dyes, Pigments, Caustic Soda & Solvents' }
    ],
    buyerTypes: [
      { suffix: 'Steel & Scrap Recycling Mills', volume: '$18.5M / yr', products: ['HMS 1&2 Steel Scrap', 'Shredded Aluminum', 'Copper Wire'], freq: 'Weekly Bulk' },
      { suffix: 'Industrial Automation Importers', volume: '$9.2M / yr', products: ['CNC Lathes', 'PLC Drives', 'Precision Bearings'], freq: 'Monthly' },
      { suffix: 'PetroChem Raw Material Desk', volume: '$12.4M / yr', products: ['Virgin HDPE/LLDPE', 'Base Oil SN500', 'Methanol'], freq: 'Bi-Weekly FCL' },
      { suffix: 'Paper & Pulp Converting Group', volume: '$5.6M / yr', products: ['OCC 11 Waste Paper', 'Kraft Linerboard', 'Wood Pulp'], freq: 'Monthly' },
      { suffix: 'Food & Nut Processing Co', volume: '$6.8M / yr', products: ['Raw In-Shell Almonds', 'Walnuts', 'Skimmed Milk Powder'], freq: 'Monthly' },
      { suffix: 'Hospital & Diagnostics Supply', volume: '$4.3M / yr', products: ['Ultrasound Systems', 'Dental Units', 'Reagents'], freq: 'Quarterly' }
    ]
  },
  Americas: {
    exports: [
      'Yellow Corn & Non-GMO Soybeans', 'Refined Petroleum & LNG', 'ICUMSA 45 White Sugar',
      'Arabica Coffee Beans & Cocoa', 'Copper Cathodes & Iron Ore', 'Heavy Construction Machinery',
      'Medical & Dental Instruments', 'Industrial Chemicals & Resins', 'Poultry & Frozen Beef',
      'Timber, Lumber & Wood Pulp', 'Almonds, Walnuts & Pistachios', 'Aviation & Automotive Parts',
      'Oilfield Drilling Equipment', 'Recycled Aluminum & Copper Scrap', 'Pharmaceuticals & Nutraceuticals'
    ],
    imports: [
      'Industrial Machinery & Tools', 'Consumer Electronics & Smartphones', 'Ready-Made Apparel & Footwear',
      'Solar Modules & Energy Storage', 'Furniture & Home Decor', 'Ceramic & Porcelain Tiles',
      'Automotive Aftermarket Parts', 'Pharmaceutical Generics', 'Packaging Films & Cartons',
      'Stainless Steel Kitchen Equipment', 'Organic Tea, Coffee & Spices', 'Urea & NPK Fertilizers',
      'Industrial Valves & Pipe Fittings', 'Rubber Tyres & Conveyor Belts', 'LED Commercial Fixtures'
    ],
    compliance: ['ISO 9001:2015', 'FDA / USDA / UL Eligible', 'CBP Customs Verified', 'SGS / Intertek Inspected'],
    currency: 'USD / CAD / Local',
    transit: '10–22 Days Ocean · 2–4 Days Air Cargo',
    productCatalog: [
      { title: 'ICUMSA 45 Refined White Cane Sugar (50kg PP Bags)', category: 'Agriculture & Food', moq: '125 MT', fobRange: '$460 – $535 / MT' },
      { title: 'Grade A Yellow Corn & Non-GMO Bulk Soybeans', category: 'Agriculture & Food', moq: '100 MT', fobRange: '$290 – $440 / MT' },
      { title: 'Grade A Electrolytic Copper Cathodes 99.99%', category: 'Metals & Scrap', moq: '25 MT', fobRange: '$8,450 – $8,920 / MT' },
      { title: 'Heavy-Duty Hydraulic Excavator & Earthmoving Attachments', category: 'Industrial Machinery', moq: '2 Units', fobRange: '$3,800 – $14,500 / Unit' },
      { title: 'Specialty Washed Arabica Green Coffee Beans', category: 'Agriculture & Food', moq: '19 MT (1 FCL)', fobRange: '$4,100 – $5,200 / MT' },
      { title: 'Kiln-Dried Softwood Lumber & Construction Timber', category: 'Construction & Hardware', moq: '40 CBM', fobRange: '$310 – $480 / CBM' },
      { title: 'API Certified Oilfield Gate Valves & Flanges', category: 'Energy & Petroleum', moq: '20 Units', fobRange: '$490 – $1,950 / Unit' },
      { title: 'Bulk California/Americas Shelled Almonds & Walnuts', category: 'Agriculture & Food', moq: '10 MT', fobRange: '$5,200 – $6,400 / MT' }
    ],
    supplierTypes: [
      { suffix: 'AgriCommodities Export Corp', product: 'Soybeans, Yellow Corn, ICUMSA 45 Sugar & Pulses' },
      { suffix: 'Pacific Metals & Mining LLC', product: 'Copper Cathodes, Aluminum Ingots & Ferrous Scrap' },
      { suffix: 'Industrial Machinery & Energy Inc', product: 'Oilfield Valves, Compressors & Power Generators' },
      { suffix: 'Continental Timber & Pulp Co', product: 'Kiln-Dried Lumber, Wood Pellets & Kraft Paper' },
      { suffix: 'BioMed & Clinical Technologies', product: 'Diagnostic Equipment, Lab Instruments & Consumables' },
      { suffix: 'Specialty Coffee & Agro Traders', product: 'Green Coffee Beans, Cocoa, Nuts & Edible Oils' },
      { suffix: 'PetroPolymers & Specialty Chem', product: 'LDPE, HDPE, Industrial Lubricants & Solvents' },
      { suffix: 'FreightLine Port Logistics', product: 'Containerized Ocean Freight, Reefer & Customs Brokerage' },
      { suffix: 'AutoParts & Heavy Fleet Supply', product: 'OEM Truck Axles, Brake Assemblies & Filters' }
    ],
    buyerTypes: [
      { suffix: 'Wholesale Retail Supply Inc', volume: '$16.4M / yr', products: ['Apparel & Activewear', 'Packaging Cartons', 'Homewares'], freq: 'Weekly FCL' },
      { suffix: 'Construction & Hardware Group', volume: '$12.8M / yr', products: ['Steel Rebar', 'Porcelain Tiles', 'Hand Tools'], freq: 'Bi-Weekly' },
      { suffix: 'CleanPower Solar Distributors', volume: '$21.0M / yr', products: ['Tier-1 Solar Panels', 'Battery Inverters', 'Cables'], freq: 'Monthly' },
      { suffix: 'FoodService Wholesale Importers', volume: '$8.9M / yr', products: ['Basmati Rice', 'Organic Spices', 'Canned Produce'], freq: 'Monthly' },
      { suffix: 'Industrial Valve & Pipe Corp', volume: '$7.2M / yr', products: ['Stainless Flanges', 'Forged Fittings', 'Bearings'], freq: 'Bi-Monthly' },
      { suffix: 'AutoFleet Aftermarket Buyers', volume: '$10.5M / yr', products: ['Radial Tyres', 'LED Headlights', 'Brake Pads'], freq: 'Monthly' }
    ]
  },
  'Middle East & Africa': {
    exports: [
      'Bitumen 60/70 & Petrochemicals', 'Urea 46% & Phosphate Fertilizers', 'Base Oil SN500 & Lubricants',
      'Raw Cashew Nuts & Sesame Seeds', 'Aluminum Ingots & Copper Blister', 'Dates, Citrus & Fresh Produce',
      'Gold, Chrome Ore & Manganese', 'Cocoa Beans & Arabica Coffee', 'Natural Marble & Limestone',
      'Polyethylene (HDPE/LLDPE) Granules', 'Portland Cement & Clinker', 'Frankincense, Gum Arabic & Resins',
      'Shea Butter & Organic Oils', 'Frozen Seafood & Fish Meal', 'Refined Diesel EN590 & Jet A1'
    ],
    imports: [
      'Basmati & Parboiled Rice', 'Refined Sunflower & Palm Cooking Oil', 'Heavy Construction Machinery',
      'Structural Steel, Billets & Rebar', 'Pharmaceuticals & Medical Kits', 'Solar Power & Off-Grid Inverters',
      'Automotive Spare Parts & Tyres', 'Textiles, Fabrics & Footwear', 'Dairy Milk Powder & Sugar',
      'Electrical Cables & Transformers', 'Agricultural Tractors & Pumps', 'Packaging Materials & PET Preforms',
      'Industrial Chemicals & Water Treatment', 'Commercial Kitchen & Hotel Supplies', 'Building Materials & Sanitaryware'
    ],
    compliance: ['ISO 9001:2015', 'SGS / Bureau Veritas CoC', 'Halal & Chamber Attested', 'Port Customs Verified'],
    currency: 'USD / AED / Local',
    transit: '10–21 Days Ocean · 2–4 Days Air Cargo',
    productCatalog: [
      { title: 'Penetration Grade 60/70 Export Bitumen (New Steel Drums)', category: 'Energy & Petroleum', moq: '100 MT', fobRange: '$365 – $420 / MT' },
      { title: 'Prilled & Granular Urea 46% Nitrogen Fertilizer', category: 'Chemicals & Polymers', moq: '500 MT', fobRange: '$325 – $375 / MT' },
      { title: 'W320 Export Grade Raw & Processed Cashew Kernels', category: 'Agriculture & Food', moq: '16 MT (1x20ft)', fobRange: '$5,800 – $6,650 / MT' },
      { title: 'High-Purity 99.7% A7 Aluminum Ingots (LME Standard)', category: 'Metals & Scrap', moq: '25 MT', fobRange: '$2,180 – $2,390 / MT' },
      { title: 'Hulled & Natural White Sesame Seeds (99.95% Sortex)', category: 'Agriculture & Food', moq: '19 MT', fobRange: '$1,620 – $1,890 / MT' },
      { title: 'Virgin Film-Grade LLDPE & HDPE Polymer Resins', category: 'Chemicals & Polymers', moq: '24.75 MT', fobRange: '$960 – $1,140 / MT' },
      { title: 'OPC 42.5N Bulk Portland Cement & Grey Clinker', category: 'Construction & Hardware', moq: '1,000 MT', fobRange: '$58 – $74 / MT' },
      { title: 'Unrefined Grade-A Organic Raw Shea Butter (25kg Cartons)', category: 'Cosmetics & Personal Care', moq: '5 MT', fobRange: '$2,450 – $3,100 / MT' }
    ],
    supplierTypes: [
      { suffix: 'PetroChem & Bitumen Trading LLC', product: 'Bitumen 60/70, Base Oils, Urea 46% & Polymers' },
      { suffix: 'AgroExporters & Commodity House', product: 'Sesame Seeds, Raw Cashews, Cocoa & Gum Arabic' },
      { suffix: 'Gulf & Continental Metals Group', product: 'A7 Aluminum Ingots, Copper Concentrates & Scrap' },
      { suffix: 'Horizon Cement & Minerals Co', product: 'Portland Cement, Clinker, Gypsum & Natural Marble' },
      { suffix: 'Oasis Foodstuffs & Dates Exports', product: 'Medjool Dates, Citrus, Edible Oils & Pulses' },
      { suffix: 'Maritime Trade & Freezone Logistics', product: 'Port Clearance, Bulk Chartering & Bonded Warehousing' },
      { suffix: 'Natural Botanicals & Shea Co', product: 'Raw Shea Butter, Frankincense Resin & Essential Oils' },
      { suffix: 'Prime Fertilizers & Chemical Works', product: 'DAP, NPK Fertilizers, Sulfur Granular & Acids' },
      { suffix: 'RedSea & Atlantic Seafood Exports', product: 'Frozen Pelagic Fish, Cuttlefish & Marine Produce' }
    ],
    buyerTypes: [
      { suffix: 'National Foodstuffs Trading LLC', volume: '$14.6M / yr', products: ['Parboiled & Basmati Rice', 'Sunflower Oil', 'ICUMSA 45 Sugar'], freq: 'Weekly FCL' },
      { suffix: 'InfraBuild Construction Materials', volume: '$19.2M / yr', products: ['Deformed Steel Rebar', 'Ceramic Tiles', 'Electrical Cables'], freq: 'Bi-Weekly' },
      { suffix: 'SunGrid Solar & Power Systems', volume: '$8.4M / yr', products: ['550W Solar Panels', 'Hybrid Inverters', 'Tubular Batteries'], freq: 'Monthly' },
      { suffix: 'MedCare Pharma Distributors', volume: '$6.1M / yr', products: ['Generic Medicines', 'IV Fluids', 'Surgical Gloves'], freq: 'Monthly' },
      { suffix: 'AutoParts & Heavy Machinery ImpEx', volume: '$9.8M / yr', products: ['Truck Tyres', 'Excavator Spare Parts', 'Diesel Generators'], freq: 'Monthly' },
      { suffix: 'Textiles & Garment Wholesale Hub', volume: '$5.2M / yr', products: ['Printed Cotton Fabrics', 'Ready-Made Apparel', 'Footwear'], freq: 'Bi-Monthly' }
    ]
  }
};

const COUNTRY_COMPLIANCE_OVERRIDES: Record<string, string[]> = {
  GB: ['UKCA Certified', 'ISO 9001:2015', 'EORI UK Customs', 'Companies House Verified'],
  US: ['FDA / UL / ASTM Eligible', 'CBP Importer Verified', 'ISO 9001:2015', 'DUNS Registered'],
  IN: ['BIS / IEC Certified', 'DGFT IEC Verified', 'FSSAI / APEDA Export', 'ISO 9001:2015'],
  CN: ['CCC / CIQ Inspected', 'ISO 9001:2015', 'RoHS & CE Export', 'SGS Factory Audited'],
  DE: ['CE & TÜV Rheinland', 'DIN / ISO 9001', 'EU REACH Compliant', 'EORI Verified'],
  AE: ['ESMA / MOIAT Approved', 'Dubai Chamber Verified', 'GSO / Halal Ready', 'Jebel Ali Freezone'],
  SA: ['SASO SABER Certified', 'SFDA Compliant', 'GSO / Halal Approved', 'ISO 9001:2015'],
  JP: ['JIS / PSE Certified', 'METI Export Verified', 'ISO 9001:2015', 'JAS Compliant'],
  KR: ['KC Mark Certified', 'KITA Verified Exporter', 'ISO 9001:2015', 'CE / RoHS Export'],
  AU: ['RCM / Standards Australia', 'ABF Customs Verified', 'ISO 9001:2015', 'DAFF Biosecurity']
};

function sanitizeUnsplashImage(url?: string): string {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) return '';
  return url;
}

function extractPrimaryCity(port: string, countryName: string): string {
  const clean = port
    .replace(/Port of /gi, '')
    .replace(/Freeport of /gi, '')
    .replace(/Port /gi, '')
    .replace(/\(.*?\)/g, '')
    .split('/')[0]
    .split(',')[0]
    .trim();
  return clean && clean.length > 2 ? clean : countryName;
}

function buildCityPool(port: string, countryName: string): string[] {
  const primary = extractPrimaryCity(port, countryName);
  const parts = port
    .replace(/Port of /gi, '')
    .replace(/Freeport of /gi, '')
    .replace(/Container Terminals?/gi, '')
    .replace(/Islamic Port/gi, '')
    .replace(/Autonomous Port/gi, '')
    .replace(/\(.*?\)/g, '')
    .split(/[\/,]/)
    .map(p => p.trim())
    .filter(p => p.length > 2);

  const pool = [
    ...parts,
    `${primary} Trade Zone`,
    `${primary} Industrial Park`,
    `${countryName} Export Hub`
  ];
  return Array.from(new Set(pool));
}

// Helper function to dynamically generate consistent, realistic data for ANY of the 196 world countries
export function getCountryData(countryId: string): CountryData {
  const meta = resolveWorldCountryMeta(countryId);
  const curated = COUNTRIES_DATA[meta.id] || COUNTRIES_DATA[countryId];
  const seed = seededHash(`${meta.code}:${meta.name}`);
  const tpl = REGION_TRADE_TEMPLATES[meta.region];
  const cities = buildCityPool(meta.port, meta.name);
  const slug = toCountryUrlSlug(meta);

  if (curated) {
    return {
      ...curated,
      id: meta.id,
      name: meta.name,
      code: meta.code,
      flag: meta.flagEmoji,
      premiumSuppliers: curated.premiumSuppliers.map((sup, i) => ({
        ...sup,
        responseRate: sup.responseRate || `${96 + ((seed + i) % 4)}%`,
        yearsActive: sup.yearsActive || 5 + ((seed + i * 3) % 14)
      })),
      latestSuppliers: curated.latestSuppliers.map((sup, i) => ({
        ...sup,
        responseRate: sup.responseRate || `${94 + ((seed + i) % 5)}%`,
        yearsActive: sup.yearsActive || 3 + ((seed + i * 2) % 10)
      })),
      latestProducts: curated.latestProducts.map((p, i) => ({
        ...p,
        image: sanitizeUnsplashImage(p.image),
        moq: p.moq || tpl.productCatalog[i % tpl.productCatalog.length].moq,
        fobRange: p.fobRange || tpl.productCatalog[i % tpl.productCatalog.length].fobRange
      })),
      seoDescription: getSeoCopyForCountry(meta.id, meta.name)
    };
  }

  const name = meta.name;
  const companiesCount = 1150 + (seed % 4650);
  const productsCount = Math.round(companiesCount * (1.28 + ((seed % 45) / 100)));
  const rfqsCount = Math.round(companiesCount * (0.29 + ((seed % 20) / 100)));

  const rotate = <T,>(arr: T[], offset: number): T[] => {
    const start = offset % arr.length;
    return [...arr.slice(start), ...arr.slice(0, start)];
  };

  const supplierList = rotate(tpl.supplierTypes, seed % tpl.supplierTypes.length);
  const productList = rotate(tpl.productCatalog, (seed >> 2) % tpl.productCatalog.length);
  const exportList = rotate(tpl.exports, seed % tpl.exports.length);
  const importList = rotate(tpl.imports, (seed >> 3) % tpl.imports.length);

  const brandPrefixes = [
    `${name} Meridian`,
    `${cities[0]} Apex`,
    `Global ${name}`,
    `Pacific-Atlantic ${meta.code}`,
    `Sovereign ${name}`,
    `Prime ${cities[0]}`,
    `Continental ${name}`,
    `Vanguard ${meta.code}`,
    `HarborLine ${name}`
  ];

  const premiumSuppliers: CountrySupplier[] = supplierList.slice(0, 6).map((st, idx) => ({
    id: `${meta.id}_ps_${idx + 1}`,
    name: `${brandPrefixes[idx % brandPrefixes.length]} ${st.suffix}`,
    city: `${cities[idx % cities.length]}, ${name}`,
    country: name,
    website: `www.${slug}-${st.suffix.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}.com`,
    tier: idx < 4 ? 'Gold Member' : 'Silver Member',
    verified: true,
    mainProduct: st.product,
    responseRate: `${96 + ((seed + idx) % 4)}%`,
    yearsActive: 4 + ((seed + idx * 3) % 15)
  }));

  const latestSuppliers: CountrySupplier[] = supplierList.map((st, idx) => ({
    id: `${meta.id}_ls_${idx + 1}`,
    name: `${cities[idx % cities.length]} ${st.suffix}`,
    city: cities[idx % cities.length],
    country: name,
    tier: idx % 2 === 0 ? 'Gold Member' : 'Silver Member',
    verified: true,
    mainProduct: st.product,
    responseRate: `${93 + ((seed + idx) % 6)}%`,
    yearsActive: 2 + ((seed + idx * 2) % 9)
  }));

  const latestProducts: CountryProduct[] = productList.map((prod, idx) => ({
    id: `${meta.id}_lp_${idx + 1}`,
    title: `${prod.title} — ${name} Export`,
    category: prod.category,
    image: '',
    moq: prod.moq,
    fobRange: prod.fobRange
  }));

  const offerQuantities = ['20 MT (1x20ft)', '5,000 Units', '100 MT', '2x40ft HC', '25,000 Pcs', '500 Units', '50 MT', '10,000 Sets'];
  const offerIncoterms = ['CIF', 'FOB', 'CFR', 'DDP'];
  const latestBuyOffers: CountryBuyOffer[] = importList.slice(0, 8).map((imp, idx) => ({
    id: `${meta.id}_bo_${idx + 1}`,
    title: `Sourcing ${imp} — Verified ${name} Importer (${meta.port.split('/')[0].trim()})`,
    date: 'Recent',
    quantity: offerQuantities[(seed + idx) % offerQuantities.length],
    buyerCountry: name,
    category: productList[idx % productList.length].category,
    incoterm: offerIncoterms[(seed + idx) % offerIncoterms.length]
  }));

  return {
    id: meta.id,
    name,
    code: meta.code,
    flag: meta.flagEmoji,
    stats: {
      companies: companiesCount,
      products: productsCount,
      rfqs: rfqsCount
    },
    topExports: exportList,
    topImports: importList,
    premiumSuppliers,
    latestSuppliers,
    latestProducts,
    latestBuyOffers,
    seoDescription: getSeoCopyForCountry(meta.id, name)
  };
}

export function getCountryTradeProfile(countryIdOrSlug: string): CountryTradeProfile {
  const meta = resolveWorldCountryMeta(countryIdOrSlug);
  const base = getCountryData(meta.id);
  const tpl = REGION_TRADE_TEMPLATES[meta.region];
  const seed = seededHash(`profile:${meta.code}`);
  const cities = buildCityPool(meta.port, meta.name);

  const rotate = <T,>(arr: T[], offset: number): T[] => {
    const start = offset % arr.length;
    return [...arr.slice(start), ...arr.slice(0, start)];
  };

  const buyerTemplates = rotate(tpl.buyerTypes, seed % tpl.buyerTypes.length);
  const buyerPrefixes = [
    `${cities[0]}`,
    `${meta.name} Sterling`,
    `Atlas ${meta.code}`,
    `Crown ${cities[0]}`,
    `Horizon ${meta.name}`,
    `Nordic-Global ${meta.code}`
  ];

  const defaultVerifiedBuyers: CountryVerifiedBuyer[] = buyerTemplates.map((bt, idx) => ({
    id: `${meta.id}_vb_${idx + 1}`,
    companyName: `${buyerPrefixes[idx % buyerPrefixes.length]} ${bt.suffix}`,
    city: `${cities[idx % cities.length]}, ${meta.name}`,
    country: meta.name,
    annualVolume: bt.volume,
    targetProducts: bt.products,
    orderFrequency: bt.freq,
    preferredIncoterms: idx % 2 === 0 ? 'CIF / FOB · Escrow' : 'FOB / LC at Sight',
    verifiedSince: 2019 + ((seed + idx) % 6)
  }));

  const curatedOverride = COUNTRIES_DATA[meta.id] || COUNTRIES_DATA[countryIdOrSlug];
  const verifiedBuyers =
    curatedOverride?.verifiedBuyers && curatedOverride.verifiedBuyers.length > 0
      ? curatedOverride.verifiedBuyers
      : defaultVerifiedBuyers;

  // 8 neighboring / regional trade partner hubs (same region first + top global hubs)
  const sameRegion = WORLD_COUNTRIES_LIST.filter(
    c => c.region === meta.region && c.code !== meta.code
  ).slice(0, 5);
  const majorGlobal = WORLD_COUNTRIES_LIST.filter(
    c =>
      ['US', 'GB', 'DE', 'IN', 'CN', 'AE', 'SG', 'JP'].includes(c.code) &&
      c.code !== meta.code &&
      !sameRegion.some(s => s.code === c.code)
  ).slice(0, 3);

  return {
    ...base,
    slug: toCountryUrlSlug(meta),
    region: meta.region,
    heroBannerImage: curatedOverride?.heroBannerImage || base.heroBannerImage || undefined,
    primaryPort: curatedOverride?.primaryPort || meta.port,
    flagUrl: meta.flagUrl,
    flagSvgUrl: meta.flagSvgUrl,
    complianceStandards:
      curatedOverride?.complianceStandards && curatedOverride.complianceStandards.length > 0
        ? curatedOverride.complianceStandards
        : COUNTRY_COMPLIANCE_OVERRIDES[meta.code] || tpl.compliance,
    tradeCurrency: curatedOverride?.tradeCurrency || tpl.currency,
    popularIncoterms: ['FOB', 'CIF', 'CFR', 'DDP', 'Trade Assurance Escrow'],
    transitSummary: curatedOverride?.transitSummary || tpl.transit,
    avgResponseHours: `${2 + (seed % 5)} hrs`,
    escrowCoverageRate: `${97 + (seed % 3)}.${4 + (seed % 5)}%`,
    verifiedBuyers,
    partnerCountries: [...sameRegion, ...majorGlobal],
    isCustomized: Boolean(curatedOverride)
  };
}

// --- PERSISTENT STORAGE SYNCHRONIZATION HELPERS ---
const STORAGE_ALL_COUNTRIES_KEY = 'th_admin_all_countries_items_v1';
const STORAGE_COUNTRIES_DATA_KEY = 'th_admin_countries_data_v1';
const STORAGE_COUNTRY_SEO_KEY = 'th_admin_country_seo_copy_v1';
export const COUNTRY_DATA_UPDATED_EVENT = 'th-country-data-updated';

export function emitCountryDataUpdated(countryId?: string) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(COUNTRY_DATA_UPDATED_EVENT, { detail: { countryId } }));
    }
  } catch {
    // ignore
  }
}

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
    emitCountryDataUpdated();
  } catch (err) {
    console.error('Failed to save countries to storage:', err);
  }
}

export function saveSingleCountryPortalOverride(
  countryId: string,
  updatedData: CountryData,
  seoCopy?: { headline: string; sections: { title: string; body: string }[] }
) {
  const normId = countryId.toLowerCase().trim().replace(/\s+/g, '-');
  COUNTRIES_DATA[normId] = {
    ...updatedData,
    id: normId
  };

  if (seoCopy) {
    DEDICATED_COUNTRY_SEO_COPY[normId] = seoCopy;
  } else if (updatedData.seoDescription) {
    DEDICATED_COUNTRY_SEO_COPY[normId] = updatedData.seoDescription;
  }

  // Ensure entry exists in ALL_COUNTRY_ITEMS if newly added
  const idx = ALL_COUNTRY_ITEMS.findIndex(c => c.id === normId);
  const metaEntry = {
    id: normId,
    name: updatedData.name,
    code: updatedData.code,
    flag: updatedData.flag || '🌐'
  };
  if (idx > -1) {
    ALL_COUNTRY_ITEMS[idx] = metaEntry;
  } else {
    ALL_COUNTRY_ITEMS.push(metaEntry);
  }

  saveCountriesToStorage([...ALL_COUNTRY_ITEMS], { ...COUNTRIES_DATA }, { ...DEDICATED_COUNTRY_SEO_COPY });
  emitCountryDataUpdated(normId);
}

export function resetSingleCountryPortalOverride(countryId: string) {
  const normId = countryId.toLowerCase().trim().replace(/\s+/g, '-');
  delete COUNTRIES_DATA[normId];
  delete DEDICATED_COUNTRY_SEO_COPY[normId];
  saveCountriesToStorage([...ALL_COUNTRY_ITEMS], { ...COUNTRIES_DATA }, { ...DEDICATED_COUNTRY_SEO_COPY });
  emitCountryDataUpdated(normId);
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
