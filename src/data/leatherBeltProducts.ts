import { Product } from '../types';
import { GLOBAL_LEATHER_BELT_COMPANIES } from './leatherBeltCompanies';

// Local authentic uploaded leather belt assets & verified curated high-res imagery
const IMG_BELT_01 = '/assets/uploads/leather_belt_trade_heaven_2_1f3c8230.jpeg'; // Stacked 5-color export belts
const IMG_BELT_02 = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'; // Industrial workman heavy-duty belt & pouch
const IMG_BELT_03 = '/assets/uploads/leather_belt_trade_heaven__3cd8dde8.jpeg'; // 4-Color catalog buffalo collection
const IMG_BELT_04 = '/assets/uploads/leather_belt__6cbe88c9.jpeg'; // Two-tone contrast stitched artisan belt
const IMG_BELT_05 = '/assets/uploads/leather_belt_3_trade_heaven_6962019f.jpeg'; // Pebble-grain tan handcrafted belt
const IMG_BELT_06 = 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80'; // Luxury bridle leather dress belt
const IMG_BELT_07 = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'; // Perforated casual leather belt
const IMG_BELT_08 = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'; // Exotic textured luxury leather goods
const IMG_BELT_09 = 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'; // Full-grain belt & wallet gift set
const IMG_BELT_10 = 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80'; // Classic cognac jeans belt
const IMG_BELT_11 = 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80'; // Stirrup bridle strap leather
const IMG_BELT_12 = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'; // Tanned genuine leather artisan craft
const IMG_BELT_13 = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'; // Denim casual two-tone leather belt
const IMG_BELT_14 = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'; // European classic reversible dress belt
const IMG_BELT_15 = 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80'; // Canadian heavy-gauge full-grain single hide
const IMG_BELT_16 = 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?auto=format&fit=crop&w=800&q=80'; // Milled double-loop leather belt
const IMG_BELT_17 = 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80'; // Turkish calfskin dress belt
const IMG_BELT_18 = 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'; // Export bundle belt & cardholder set
const IMG_BELT_19 = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'; // OEM factory fashion leather accessories
const IMG_BELT_20 = 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=800&q=80'; // Guangzhou ratchet cowhide dress belt

// Backward compatibility constants if referenced
const IMG_PEBBLE_TAN = IMG_BELT_05;
const IMG_STACK_FIVE = IMG_BELT_01;
const IMG_FOUR_CATALOG = IMG_BELT_03;
const IMG_FLYER_TWOTONE = IMG_BELT_04;
const ALL_BELT_IMGS = [IMG_BELT_01, IMG_BELT_02, IMG_BELT_03, IMG_BELT_04, IMG_BELT_05, IMG_BELT_06];

export const GLOBAL_LEATHER_BELT_PRODUCTS: Product[] = [
  {
    id: 'prod-leather-belt-01',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[0].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[0].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[0].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[0].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[0].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '100 Pieces',
    priceRangeUsd: '$4.80 - $7.50 / Piece',
    unit: 'Pieces',
    title: 'Custom Private-Label Full-Grain Cowhide Leather Belts — Hand-Stitched Dress & Casual Series',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_01, IMG_BELT_05, IMG_BELT_03, IMG_BELT_04],
    description: 'Export-grade full-grain cowhide leather belts manufactured by Dynaw Industry in Sialkot, Punjab, Pakistan (Contact: Abdullah Tauqeer | +92-329-9004120). Available in dark espresso brown, navy blue, cognac tan, matte black, and vintage distressed finishes with solid stainless steel and brushed nickel roller buckles.',
    priceTiers: [
      { minUnits: 100, maxUnits: 499, priceUsd: 7.50 },
      { minUnits: 500, maxUnits: 1999, priceUsd: 5.90 },
      { minUnits: 2000, priceUsd: 4.80 }
    ],
    fobPriceUsd: 5.90,
    moq: 100,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 12,
    portOfDispatch: 'FOB Karachi / Sialkot Dry Port, Pakistan',
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'EXW'],
    specifications: [
      { name: 'Manufacturer', value: 'Dynaw Industry (Sialkot, Punjab, Pakistan)' },
      { name: 'Contact Person', value: 'Abdullah Tauqeer (+92-329-9004120)' },
      { name: 'Leather Grade', value: '100% Vegetable-Tanned Full-Grain Cowhide (3.8mm - 4.0mm)' },
      { name: 'Sizes & Width', value: '80cm - 125cm Length | 35mm / 38mm Width' }
    ]
  },
  {
    id: 'prod-leather-belt-02',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[1].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[1].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[1].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[1].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[1].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '200 Pieces',
    priceRangeUsd: '$6.20 - $9.80 / Piece',
    unit: 'Pieces',
    title: 'Heavy-Duty Leather Scaffolding Belt, Industrial Tool Belt & Reinforced Workman Waist Belt',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Industrial Tool & Scaffolding Belts',
    images: [IMG_BELT_02, IMG_BELT_04, IMG_BELT_10, IMG_BELT_11],
    description: 'Heavy-duty industrial leather scaffolding belts, carpenter tool belts, and double-prong work belts manufactured by Minha International in Uttar Pradesh, India (Contact: Danish Khan | +91-8840299336 / +91-9336930043). Twin-needle high-tensile perimeter stitching with gunmetal double-loop keeper and heavy-gauge buckle.',
    priceTiers: [
      { minUnits: 200, maxUnits: 999, priceUsd: 9.80 },
      { minUnits: 1000, maxUnits: 4999, priceUsd: 7.60 },
      { minUnits: 5000, priceUsd: 6.20 }
    ],
    fobPriceUsd: 7.60,
    moq: 200,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 30,
    leadTimeDays: 15,
    portOfDispatch: 'FOB Nhava Sheva / Mundra, India',
    supportedIncoterms: ['FOB', 'CIF', 'CFR', 'EXW'],
    specifications: [
      { name: 'Manufacturer', value: 'Minha International (Uttar Pradesh, India)' },
      { name: 'Contact Person', value: 'Danish Khan (+91-8840299336 / +91-9336930043)' },
      { name: 'Tensile Load Rating', value: 'Heavy-Duty Top-Grain Harness Leather (4.2mm)' },
      { name: 'Hardware', value: 'Forged Gunmetal / Solid Steel Double-Roller Buckle' }
    ]
  },
  {
    id: 'prod-leather-belt-03',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[2].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[2].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[2].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[2].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[2].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '500 Pieces',
    priceRangeUsd: '$3.60 - $5.40 / Piece',
    unit: 'Pieces',
    title: 'Buffalo Split & Buffalo Grain Leather Belt Collection (Charcoal Black, Chocolate Brown, Olive Green, Crimson Red)',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Buffalo & Cow Crust Leather Belt',
    images: [IMG_BELT_03, IMG_BELT_01, IMG_BELT_04, IMG_BELT_05],
    description: 'Supplied by Excellent Leather Agency, Dhaka, Bangladesh (Est. 1990 | Contact: MD. MASZIDUL ISLAM | +880-1805917381 / +880-1738156015). Complete 80–110cm Buffalo Split and Buffalo Grain leather belt line featuring Charcoal Black (shiny nickel pin buckle), Chocolate Brown (smooth grain), Olive Green (perforated tip & matt bronze buckle), and Crimson Red (waxy buffalo grain with perforated center).',
    priceTiers: [
      { minUnits: 500, maxUnits: 1999, priceUsd: 5.40 },
      { minUnits: 2000, maxUnits: 9999, priceUsd: 4.30 },
      { minUnits: 10000, priceUsd: 3.60 }
    ],
    fobPriceUsd: 4.30,
    moq: 500,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 20,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Chattogram Port, Bangladesh',
    supportedIncoterms: ['FOB', 'CIF', 'CFR'],
    specifications: [
      { name: 'Supplier', value: 'Excellent Leather Agency (Dhaka, Bangladesh — Est. 1990)' },
      { name: 'Contact Person', value: 'MD. MASZIDUL ISLAM (+880-1805917381)' },
      { name: 'Available Articles', value: 'Charcoal Black, Chocolate Brown, Olive Green, Crimson Red (80-110 CM)' },
      { name: 'Raw Hide Options', value: 'Cow, Goat & Buffalo Crust, Split, Suede, Pigmented & Belt Leather' }
    ]
  },
  {
    id: 'prod-leather-belt-04',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[3].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[3].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[3].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[3].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[3].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '150 Pieces',
    priceRangeUsd: '$4.50 - $6.90 / Piece',
    unit: 'Pieces',
    title: 'Men’s Two-Tone Contrast-Stitched Genuine Full-Grain Leather Belt with Antique Brass Buckle',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Full Grain Leather Belt',
    images: [IMG_BELT_04, IMG_BELT_05, IMG_BELT_13, IMG_BELT_01],
    description: 'Supplied by ShivShakti Enterprises, Haryana, India (Contact: Rahul Luthra | +91-72063-44810). Bold men’s full-grain leather belt featuring charcoal suede-textured center inlay, dark brown burnished edges, heavy double contrast stitching, brass-plated keeper badge, and solid antique brass pin buckle.',
    priceTiers: [
      { minUnits: 150, maxUnits: 499, priceUsd: 6.90 },
      { minUnits: 500, maxUnits: 1999, priceUsd: 5.40 },
      { minUnits: 2000, priceUsd: 4.50 }
    ],
    fobPriceUsd: 5.40,
    moq: 150,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 10,
    portOfDispatch: 'FOB ICD Tughlakabad / Mundra Port, India',
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'EXW'],
    specifications: [
      { name: 'Supplier', value: 'ShivShakti Enterprises (Haryana, India)' },
      { name: 'Contact Person', value: 'Rahul Luthra (+91-72063-44810)' },
      { name: 'Construction', value: 'Full-Grain Two-Tone Leather with Double Contrast Stitching' },
      { name: 'Buckle Finish', value: 'Brushed Antique Brass Single-Prong Frame' }
    ]
  },
  {
    id: 'prod-leather-belt-05',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[4].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[4].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[4].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[4].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[4].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '150 Pieces',
    priceRangeUsd: '$4.90 - $7.40 / Piece',
    unit: 'Pieces',
    title: 'Handcrafted Pebble-Grain Tan Leather Belt with Twin Stitched Loops & Gunmetal Buckle',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Genuine Leather Belt',
    images: [IMG_BELT_05, IMG_BELT_01, IMG_BELT_03, IMG_BELT_16],
    description: 'Manufactured by Nisharo Exports, Punjab, Pakistan (Contact: Nisha Amir | +92-3104038997 / +92-3104038996). Handcrafted milled pebble-grain tan cowhide belt with cream saddle-stitched borders, twin stitched leather keeper loops, and polished gunmetal rectangular buckle.',
    priceTiers: [
      { minUnits: 150, maxUnits: 499, priceUsd: 7.40 },
      { minUnits: 500, maxUnits: 1999, priceUsd: 5.80 },
      { minUnits: 2000, priceUsd: 4.90 }
    ],
    fobPriceUsd: 5.80,
    moq: 150,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 12,
    portOfDispatch: 'FOB Karachi / Lahore Airport, Pakistan',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Nisharo Exports (Punjab, Pakistan)' },
      { name: 'Contact Person', value: 'Nisha Amir (+92-3104038997)' },
      { name: 'Surface Finish', value: 'Natural Milled Pebble-Grain Tan Cowhide' },
      { name: 'Keeper Detail', value: 'Double Stitched Leather Loops with Cream Thread' }
    ]
  },
  {
    id: 'prod-leather-belt-06',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[5].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[5].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[5].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[5].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[5].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '100 Pieces',
    priceRangeUsd: '$9.50 - $14.80 / Piece',
    unit: 'Pieces',
    title: 'Heritage Luxury Vegetable-Tanned Bridle Leather Dress Belt Collection (Est. 1970)',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Fashion & Dress Belts',
    images: [IMG_BELT_06, IMG_BELT_14, IMG_BELT_01, IMG_BELT_10],
    description: 'Crafted by Salamanca Leathers (Est. 1970, United Kingdom | Contact: Fahed Islam | +44-7448-542946). Luxury heritage leather belts designed for retail boutiques and luxury department stores, featuring hand-burnished edges, drum-dyed full-grain hides, and solid nickel-free buckles.',
    priceTiers: [
      { minUnits: 100, maxUnits: 499, priceUsd: 14.80 },
      { minUnits: 500, maxUnits: 1499, priceUsd: 11.50 },
      { minUnits: 1500, priceUsd: 9.50 }
    ],
    fobPriceUsd: 11.50,
    moq: 100,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 40,
    leadTimeDays: 14,
    portOfDispatch: 'FCA London / FOB Felixstowe, United Kingdom',
    supportedIncoterms: ['FCA', 'FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Salamanca Leathers (United Kingdom — Est. 1970)' },
      { name: 'Contact Person', value: 'Fahed Islam (+44-7448-542946)' },
      { name: 'Tanning Process', value: '100% Vegetable-Tanned Bridle & Full-Grain Leather' },
      { name: 'Compliance', value: 'UK / EU REACH Nickel-Free Certified Hardware' }
    ]
  },
  {
    id: 'prod-leather-belt-07',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[6].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[6].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[6].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[6].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[6].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '300 Pieces',
    priceRangeUsd: '$4.20 - $6.50 / Piece',
    unit: 'Pieces',
    title: 'Wholesale Buffalo Grain & Perforated Casual Leather Belts (80–110 CM Export Assortment)',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_07, IMG_BELT_03, IMG_BELT_10, IMG_BELT_04],
    description: 'Manufactured by Atlantic International, Uttar Pradesh, India (Contact: Mohammad Tauseef | +91-8840-713114 | 51–100 Employees). Container-ready assortment of buffalo split and waxy buffalo grain belts in Charcoal Black, Chocolate Brown, Olive Green, and Perforated Crimson Red.',
    priceTiers: [
      { minUnits: 300, maxUnits: 999, priceUsd: 6.50 },
      { minUnits: 1000, maxUnits: 4999, priceUsd: 4.95 },
      { minUnits: 5000, priceUsd: 4.20 }
    ],
    fobPriceUsd: 4.95,
    moq: 300,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Mundra / Nhava Sheva, India',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Atlantic International (Uttar Pradesh, India)' },
      { name: 'Contact Person', value: 'Mohammad Tauseef (+91-8840-713114)' },
      { name: 'Factory Capacity', value: '51 - 100 Employees | 50,000 Belts / Month' },
      { name: 'Size Range', value: '80 CM - 110 CM (European & US Retail Sizing)' }
    ]
  },
  {
    id: 'prod-leather-belt-08',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[7].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[7].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[7].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[7].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[7].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '50 Pieces',
    priceRangeUsd: '$28.00 - $45.00 / Piece',
    unit: 'Pieces',
    title: 'CITES-Certified Exotic Crocodile, Alligator & Ostrich Skin Executive Leather Belts',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Crocodile & Exotic Leather Belts',
    images: [IMG_BELT_08, IMG_BELT_06, IMG_BELT_12, IMG_BELT_17],
    description: 'Manufactured by Thai Oriental Leather Co.,Ltd in Bangkok, Thailand (Est. 1998 | Contact: Pitada Charanja | +66-080-4218289). Genuine exotic crocodile, alligator, stingray, python, and ostrich leather belts lined with supple full-grain calfskin and accompanied by official CITES export permits.',
    priceTiers: [
      { minUnits: 50, maxUnits: 199, priceUsd: 45.00 },
      { minUnits: 200, maxUnits: 499, priceUsd: 34.00 },
      { minUnits: 500, priceUsd: 28.00 }
    ],
    fobPriceUsd: 34.00,
    moq: 50,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 65,
    leadTimeDays: 18,
    portOfDispatch: 'FOB Laem Chabang / Suvarnabhumi Airport, Bangkok',
    supportedIncoterms: ['FOB', 'CIF', 'CIP'],
    specifications: [
      { name: 'Manufacturer', value: 'Thai Oriental Leather Co.,Ltd (Bangkok, Thailand — Est. 1998)' },
      { name: 'Contact Person', value: 'Pitada Charanja (+66-080-4218289)' },
      { name: 'Exotic Skins', value: 'Genuine Crocodile, Alligator, Stingray, Python & Ostrich' },
      { name: 'Export Documentation', value: 'Full CITES Export Certificate & Country of Origin' }
    ]
  },
  {
    id: 'prod-leather-belt-09',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[8].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[8].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[8].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[8].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[8].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '200 Pieces',
    priceRangeUsd: '$4.60 - $6.80 / Piece',
    unit: 'Pieces',
    title: 'Executive Men’s Full-Grain Dress Belts & Matching Leather Wallet Gift Sets',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_09, IMG_BELT_18, IMG_BELT_01, IMG_BELT_06],
    description: 'Manufactured by SIMMCOM Private Limited, Punjab, Pakistan (Est. 2017 | Contact: Muhammad Salman | +92-345-8561718). 5-color executive belt assortment in Espresso Brown, Navy Blue, Cognac Tan, Jet Black, and Distressed Umber with polished silver-tone buckles.',
    priceTiers: [
      { minUnits: 200, maxUnits: 999, priceUsd: 6.80 },
      { minUnits: 1000, maxUnits: 2999, priceUsd: 5.40 },
      { minUnits: 3000, priceUsd: 4.60 }
    ],
    fobPriceUsd: 5.40,
    moq: 200,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Karachi, Pakistan',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'SIMMCOM Private Limited (Punjab, Pakistan — Est. 2017)' },
      { name: 'Contact Person', value: 'Muhammad Salman (+92-345-8561718)' },
      { name: 'Product Line', value: 'Leather Belts, Leather Wallets, Handbags & Jackets' },
      { name: 'Packaging', value: 'Custom Branded Rigid Gift Boxes & Dust Bags' }
    ]
  },
  {
    id: 'prod-leather-belt-10',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[9].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[9].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[9].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[9].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[9].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '250 Pieces',
    priceRangeUsd: '$3.90 - $5.90 / Piece',
    unit: 'Pieces',
    title: 'Classic Top-Grain Leather Casual & Formal Jeans Belts for Retail Chains',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Genuine Leather Belt',
    images: [IMG_BELT_10, IMG_BELT_13, IMG_BELT_04, IMG_BELT_15],
    description: 'Supplied by SN Exports, Delhi, India (Contact: Zaid Zarar | +91-8171909622 / +91-9897400440). Durable top-grain cow and buffalo leather belts engineered for denim and casual trousers with contrast twin stitching and antique brass hardware.',
    priceTiers: [
      { minUnits: 250, maxUnits: 999, priceUsd: 5.90 },
      { minUnits: 1000, maxUnits: 4999, priceUsd: 4.70 },
      { minUnits: 5000, priceUsd: 3.90 }
    ],
    fobPriceUsd: 4.70,
    moq: 250,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 20,
    leadTimeDays: 12,
    portOfDispatch: 'FOB New Delhi ICD / Mundra Port, India',
    supportedIncoterms: ['FOB', 'CIF', 'EXW'],
    specifications: [
      { name: 'Supplier', value: 'SN Exports (Delhi, India)' },
      { name: 'Contact Person', value: 'Zaid Zarar (+91-8171909622 / +91-9897400440)' },
      { name: 'Width', value: '38mm Jeans & Casual Standard' },
      { name: 'Stitching', value: 'High-Contrast Heavy Polyester Thread' }
    ]
  },
  {
    id: 'prod-leather-belt-11',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[10].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[10].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[10].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[10].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[10].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '200 Pieces',
    priceRangeUsd: '$5.20 - $8.10 / Piece',
    unit: 'Pieces',
    title: 'Equestrian Stirrup Leather Belts, Designer Bridle Belts & Finished Belt Leather Strips',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Full Grain Leather Belt',
    images: [IMG_BELT_11, IMG_BELT_06, IMG_BELT_12, IMG_BELT_02],
    description: 'Manufactured by Staria International, Uttar Pradesh, India (Contact: Naved M. Sharif | +91-639292-3988). Full equestrian leather belt range and designer bridle leather belts crafted from drum-dyed finished hides with stainless steel stirrup and roller buckles.',
    priceTiers: [
      { minUnits: 200, maxUnits: 799, priceUsd: 8.10 },
      { minUnits: 800, maxUnits: 2499, priceUsd: 6.40 },
      { minUnits: 2500, priceUsd: 5.20 }
    ],
    fobPriceUsd: 6.40,
    moq: 200,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 28,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Nhava Sheva / Kanpur ICD, India',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Staria International (Uttar Pradesh, India)' },
      { name: 'Contact Person', value: 'Naved M. Sharif (+91-639292-3988)' },
      { name: 'Specialty', value: 'Equestrian Saddlery Leather, Designer Bags & Finished Leather Belts' },
      { name: 'Thickness', value: '4.0mm - 4.5mm Heavy Bridle Leather' }
    ]
  },
  {
    id: 'prod-leather-belt-12',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[11].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[11].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[11].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[11].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[11].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '300 Pieces',
    priceRangeUsd: '$4.10 - $6.30 / Piece',
    unit: 'Pieces',
    title: 'Factory-Direct In-House Tanned Genuine Leather Belts with Custom Article Development',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_12, IMG_BELT_05, IMG_BELT_16, IMG_BELT_01],
    description: 'Produced in-house by Durel Leather, Punjab, Pakistan (Est. 2018 | 51–100 Employees | Contact: Haseeb Nasir | +92-310-7971756). Complete vertical manufacturing from raw crust hide finishing to precision strap cutting, edge beveling, and custom OEM buckle assembly.',
    priceTiers: [
      { minUnits: 300, maxUnits: 1499, priceUsd: 6.30 },
      { minUnits: 1500, maxUnits: 4999, priceUsd: 4.90 },
      { minUnits: 5000, priceUsd: 4.10 }
    ],
    fobPriceUsd: 4.90,
    moq: 300,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Karachi, Pakistan',
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'EXW'],
    specifications: [
      { name: 'Manufacturer', value: 'Durel Leather (Punjab, Pakistan — Est. 2018)' },
      { name: 'Contact Person', value: 'Haseeb Nasir (+92-310-7971756)' },
      { name: 'Workforce', value: '51 - 100 Dedicated Leather Technicians' },
      { name: 'Customization', value: 'In-House Tannery Custom Color & Grain Development' }
    ]
  },
  {
    id: 'prod-leather-belt-13',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[12].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[12].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[12].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[12].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[12].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '150 Pieces',
    priceRangeUsd: '$4.40 - $6.75 / Piece',
    unit: 'Pieces',
    title: 'Denim & Casual Wear Two-Tone Stitched Leather Belt with Custom Metal Loop Emblem',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Genuine Leather Belt',
    images: [IMG_BELT_13, IMG_BELT_04, IMG_BELT_10, IMG_BELT_16],
    description: 'Manufactured by Nixsha Wears, Sialkot, Punjab, Pakistan (Contact: Nixon Sohail | +92-3234415530 / +92-3416804577). Engineered to pair with premium denim and casual wear, featuring a brushed charcoal center strip, dark brown stitched leather borders, and custom brand emblem on the keeper loop.',
    priceTiers: [
      { minUnits: 150, maxUnits: 599, priceUsd: 6.75 },
      { minUnits: 600, maxUnits: 1999, priceUsd: 5.30 },
      { minUnits: 2000, priceUsd: 4.40 }
    ],
    fobPriceUsd: 5.30,
    moq: 150,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 12,
    portOfDispatch: 'FOB Sialkot / Karachi, Pakistan',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Nixsha Wears (Punjab, Pakistan)' },
      { name: 'Contact Person', value: 'Nixon Sohail (+92-3234415530 / +92-3416804577)' },
      { name: 'Style', value: 'Two-Tone Denim & Casual Leather Belt' },
      { name: 'Matching Accessories', value: 'Coordinated Leather Wallets & Bags Available' }
    ]
  },
  {
    id: 'prod-leather-belt-14',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[13].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[13].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[13].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[13].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[13].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '250 Pieces',
    priceRangeUsd: '$4.30 - $6.60 / Piece',
    unit: 'Pieces',
    title: 'European-Standard Genuine Leather Dress & Reversible Belts (Calcutta Leather Complex)',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Fashion & Dress Belts',
    images: [IMG_BELT_14, IMG_BELT_06, IMG_BELT_20, IMG_BELT_01],
    description: 'Manufactured by Cyntexia International, West Bengal, India (Est. 2010 | Contact: Prosenjit Biswas | +91-974-8574741). Smooth and grained genuine leather dress belts, reversible black/brown office belts, and coordinated leather wallets exported across Germany, France, Italy, and the USA.',
    priceTiers: [
      { minUnits: 250, maxUnits: 999, priceUsd: 6.60 },
      { minUnits: 1000, maxUnits: 3999, priceUsd: 5.10 },
      { minUnits: 4000, priceUsd: 4.30 }
    ],
    fobPriceUsd: 5.10,
    moq: 250,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Kolkata / Haldia Port, India',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Cyntexia International (West Bengal, India — Est. 2010)' },
      { name: 'Contact Person', value: 'Prosenjit Biswas (+91-974-8574741)' },
      { name: 'Core Range', value: 'Genuine Leather Belts, Wallets, Jackets & Office Bags' },
      { name: 'Chemical Compliance', value: 'AZO-Free & EU REACH Chrome-VI Compliant' }
    ]
  },
  {
    id: 'prod-leather-belt-15',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[14].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[14].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[14].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[14].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[14].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '100 Pieces',
    priceRangeUsd: '$11.50 - $17.50 / Piece',
    unit: 'Pieces',
    title: 'Canadian Full-Grain Single-Piece Hide Leather Belts — Lifetime Durability Series (Vaughan, ON)',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Full Grain Leather Belt',
    images: [IMG_BELT_15, IMG_BELT_10, IMG_BELT_04, IMG_BELT_05],
    description: 'Manufactured by Nab Leathers in Vaughan, Ontario, Canada (Est. 2009 | 51–100 Employees | Contact: Nab Leather Team | nableatherca@gmail.com | +1-647-574-1084). Cut from a single solid strap of ethically sourced North American full-grain cowhide that will never crack, peel, or delaminate.',
    priceTiers: [
      { minUnits: 100, maxUnits: 499, priceUsd: 17.50 },
      { minUnits: 500, maxUnits: 1999, priceUsd: 13.80 },
      { minUnits: 2000, priceUsd: 11.50 }
    ],
    fobPriceUsd: 13.80,
    moq: 100,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 35,
    leadTimeDays: 7,
    portOfDispatch: 'FCA Vaughan, Ontario / FOB Port of Montreal & Toronto, Canada',
    supportedIncoterms: ['FCA', 'FOB', 'DDP', 'EXW'],
    specifications: [
      { name: 'Manufacturer', value: 'Nab Leathers (Vaughan, Ontario, Canada — Est. 2009)' },
      { name: 'Contact Email & Phone', value: 'nableatherca@gmail.com | +1-647-574-1084' },
      { name: 'Leather Origin', value: 'Ethically Sourced 100% Full-Grain North American Steerhide (9-10 oz)' },
      { name: 'USMCA Duty Status', value: 'Duty-Free Across USA, Canada & Mexico (USMCA Certified)' }
    ]
  },
  {
    id: 'prod-leather-belt-16',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[15].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[15].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[15].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[15].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[15].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '150 Pieces',
    priceRangeUsd: '$4.50 - $6.90 / Piece',
    unit: 'Pieces',
    title: 'Handpicked Full-Grain & Top-Grain Milled Leather Belt with Double Keeper Loops',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Genuine Leather Belt',
    images: [IMG_BELT_16, IMG_BELT_05, IMG_BELT_12, IMG_BELT_03],
    description: 'Supplied by Yaco Traders, Punjab, Pakistan (Est. 2019 | Contact: Ayub Sabir | +92-345-6720344). Elegantly handcrafted out of handpicked full-grain and top-grain hides with heavy perimeter saddle stitching and interchangeable snap-off buckles.',
    priceTiers: [
      { minUnits: 150, maxUnits: 499, priceUsd: 6.90 },
      { minUnits: 500, maxUnits: 1999, priceUsd: 5.40 },
      { minUnits: 2000, priceUsd: 4.50 }
    ],
    fobPriceUsd: 5.40,
    moq: 150,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 12,
    portOfDispatch: 'FOB Karachi, Pakistan',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Supplier', value: 'Yaco Traders (Punjab, Pakistan — Est. 2019)' },
      { name: 'Contact Person', value: 'Ayub Sabir (+92-345-6720344)' },
      { name: 'Leather Grade', value: 'Handpicked Full-Grain & Top-Grain Cowhide' },
      { name: 'Coordinated Line', value: 'Leather Belts, Handbags & Leather Wallets' }
    ]
  },
  {
    id: 'prod-leather-belt-17',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[16].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[16].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[16].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[16].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[16].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '200 Pieces',
    priceRangeUsd: '$6.80 - $10.50 / Piece',
    unit: 'Pieces',
    title: 'Turkish Genuine Buffalo & Calfskin Men’s Dress Belts — Istanbul Luxury Accessories Line',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Fashion & Dress Belts',
    images: [IMG_BELT_17, IMG_BELT_06, IMG_BELT_14, IMG_BELT_03],
    description: 'Manufactured by Lefather Deri Anonim Sirketi in Istanbul, Turkey (Est. 2019 | 11–50 Employees | Contact: Onur Kaya | +90-532-6733953). Turkish-tanned full-grain calfskin and buffalo grain men’s belts with satin nickel and matte bronze Italian-style buckles for European menswear brands.',
    priceTiers: [
      { minUnits: 200, maxUnits: 799, priceUsd: 10.50 },
      { minUnits: 800, maxUnits: 2499, priceUsd: 8.20 },
      { minUnits: 2500, priceUsd: 6.80 }
    ],
    fobPriceUsd: 8.20,
    moq: 200,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 30,
    leadTimeDays: 10,
    portOfDispatch: 'FOB AmbarliPort Istanbul / Direct EU Road Freight, Turkey',
    supportedIncoterms: ['FOB', 'CIF', 'DAP', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Lefather Deri Anonim Sirketi (Istanbul, Turkey — Est. 2019)' },
      { name: 'Contact Person', value: 'Onur Kaya (+90-532-6733953)' },
      { name: 'Customs Advantage', value: 'EU-Turkey Customs Union (ATR Duty-Free to Europe)' },
      { name: 'Colors', value: 'Charcoal Black, Chocolate Brown, Olive Green, Crimson Red, Navy' }
    ]
  },
  {
    id: 'prod-leather-belt-18',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[17].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[17].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[17].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[17].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[17].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '300 Pieces',
    priceRangeUsd: '$3.80 - $5.75 / Piece',
    unit: 'Pieces',
    title: 'Export-Grade Men’s Denim Leather Belt, Card Holder & Genuine Leather Wallet Bundle',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_18, IMG_BELT_09, IMG_BELT_04, IMG_BELT_13],
    description: 'Supplied by Ar Razzaq Corporation, Dhaka, Bangladesh (Contact: Md. Asadujjaman | +880-1712-171630). Heavy-duty genuine leather belts crafted for men’s denim pants and casual retail lines alongside coordinated leather wallets, card holders, and leather shoes.',
    priceTiers: [
      { minUnits: 300, maxUnits: 999, priceUsd: 5.75 },
      { minUnits: 1000, maxUnits: 4999, priceUsd: 4.50 },
      { minUnits: 5000, priceUsd: 3.80 }
    ],
    fobPriceUsd: 4.50,
    moq: 300,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 20,
    leadTimeDays: 14,
    portOfDispatch: 'FOB Chattogram Port, Bangladesh',
    supportedIncoterms: ['FOB', 'CIF', 'CFR'],
    specifications: [
      { name: 'Supplier', value: 'Ar Razzaq Corporation (Dhaka, Bangladesh)' },
      { name: 'Contact Person', value: 'Md. Asadujjaman (+880-1712-171630)' },
      { name: 'Product Categories', value: 'Leather Belts, Wallets, Card Holders, Handbags & Shoes' },
      { name: 'Width & Holes', value: '38mm Width | 5 Laser-Traced Oval Pin Holes' }
    ]
  },
  {
    id: 'prod-leather-belt-19',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[18].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[18].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[18].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[18].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[18].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '500 Pieces',
    priceRangeUsd: '$3.50 - $5.60 / Piece',
    unit: 'Pieces',
    title: 'High-Volume OEM Genuine Leather Belts & Fashion Clutches (101–500 Staff Vietnam Factory)',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_19, IMG_BELT_14, IMG_BELT_20, IMG_BELT_01],
    description: 'Manufactured by Hadada Fashion Company Limited in Hung Yen, Vietnam (101–500 Employees | Contact: Truong Huy Hiep | +84-9-84904489). High-volume factory production of men’s and women’s genuine leather belts, fashion clutches, and wallets for global department store chains.',
    priceTiers: [
      { minUnits: 500, maxUnits: 1999, priceUsd: 5.60 },
      { minUnits: 2000, maxUnits: 9999, priceUsd: 4.25 },
      { minUnits: 10000, priceUsd: 3.50 }
    ],
    fobPriceUsd: 4.25,
    moq: 500,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 25,
    leadTimeDays: 15,
    portOfDispatch: 'FOB Hai Phong Port, Vietnam',
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    specifications: [
      { name: 'Manufacturer', value: 'Hadada Fashion Company Limited (Hung Yen, Vietnam)' },
      { name: 'Contact Person', value: 'Truong Huy Hiep (+84-9-84904489)' },
      { name: 'Factory Scale', value: '101 - 500 Employees | 14 Automated Assembly Lines' },
      { name: 'Trade Agreements', value: 'EVFTA & CPTPP Preferential Tariff Origin (Vietnam)' }
    ]
  },
  {
    id: 'prod-leather-belt-20',
    supplierId: GLOBAL_LEATHER_BELT_COMPANIES[19].id,
    supplierName: GLOBAL_LEATHER_BELT_COMPANIES[19].companyName,
    supplierCountry: GLOBAL_LEATHER_BELT_COMPANIES[19].country,
    supplierTier: GLOBAL_LEATHER_BELT_COMPANIES[19].tier,
    supplierTrustScore: GLOBAL_LEATHER_BELT_COMPANIES[19].trustScore,
    supplierIsVerified: true,
    minOrderQuantity: '300 Pieces',
    priceRangeUsd: '$3.70 - $5.85 / Piece',
    unit: 'Pieces',
    title: 'Guangzhou OEM/ODM Genuine Cowhide Dress Belt, Ratchet Buckle & Reversible Leather Belt',
    category: 'Leather Belts & Genuine Leather Goods',
    subCategory: 'Leather Belt',
    images: [IMG_BELT_20, IMG_BELT_14, IMG_BELT_06, IMG_BELT_01],
    description: 'Manufactured by Deconn Leather Industry Limited. in Guangzhou, Guangdong, China (Est. 2010 | 51–100 Employees | Contact: Jason Wong | +86-13570946773). Precision OEM/ODM leather belts with zinc-alloy and stainless steel buckles, laser-engraved logos, and custom retail packaging.',
    priceTiers: [
      { minUnits: 300, maxUnits: 999, priceUsd: 5.85 },
      { minUnits: 1000, maxUnits: 4999, priceUsd: 4.50 },
      { minUnits: 5000, priceUsd: 3.70 }
    ],
    fobPriceUsd: 4.50,
    moq: 300,
    moqUnit: 'Pieces',
    sampleAvailable: true,
    samplePriceUsd: 20,
    leadTimeDays: 10,
    portOfDispatch: 'FOB Guangzhou / Shenzhen Port, China',
    supportedIncoterms: ['FOB', 'CIF', 'DDP', 'EXW'],
    specifications: [
      { name: 'Manufacturer', value: 'Deconn Leather Industry Limited. (Guangzhou, Guangdong, China — Est. 2010)' },
      { name: 'Contact Person', value: 'Jason Wong (+86-13570946773)' },
      { name: 'Workforce', value: '51 - 100 Employees | 12 Production Lines' },
      { name: 'OEM Services', value: 'Custom Buckle Mold, Private Label Embossing & Barcode Packaging' }
    ]
  }
];
