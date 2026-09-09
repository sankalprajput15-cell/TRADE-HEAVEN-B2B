import { Product } from '../types';

export const GLOBAL_TIRES_PRODUCTS: Product[] = [
  // 1. Hangzhou Fuyang Fuchun Co., Ltd - Premium Inner Tubes & Tyre Flaps
  {
    id: 'prod-tire-01',
    supplierId: 'comp-tire-06',
    supplierName: 'Hangzhou Fuyang Fuchun Co., Ltd',
    supplierCountry: 'China',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 96,
    supplierIsVerified: true,
    title: 'Heavy-Duty Butyl & Natural Rubber Inner Tubes with Reinforced Tyre Flaps for Trucks & OTR',
    category: 'Automotive & Tires',
    subCategory: 'Inner Tubes & Accessories',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufactured with high-grade butyl rubber providing outstanding airtightness, elongation rate > 500%, and heat resistance for commercial truck tires, light vehicles, and agricultural tractors.',
    fobPriceUsd: 4.80,
    priceRangeUsd: '$3.50 - $7.20',
    minOrderQuantity: '500 Pieces',
    unit: 'Piece',
    moq: 500,
    moqUnit: 'Pieces',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 15.00,
    supportedIncoterms: ['FOB', 'CIF', 'CFR', 'DDP'],
    portOfDispatch: 'Ningbo / Shanghai Port',
    certifications: ['ISO 9001:2015', 'DOT', 'SONCAP'],
    specifications: [
      { name: 'Material', value: '100% Butyl Rubber / Natural Rubber' },
      { name: 'Tensile Strength', value: '≥ 8.5 MPa' },
      { name: 'Elongation at Break', value: '≥ 520%' },
      { name: 'Valve Type', value: 'TR13, TR75A, TR175A, V3-02-14' },
      { name: 'Applicable Sizes', value: '12.00R20, 11.00R20, 315/80R22.5, 7.50-16' }
    ],
    packagingDetails: '1 pc/polybag, 10 pcs/woven bag or standard export cartons'
  },

  // 2. Double Star Group - All-Steel Commercial Radial Truck Tires (TBR)
  {
    id: 'prod-tire-02',
    supplierId: 'comp-tire-19',
    supplierName: 'Double Star Group',
    supplierCountry: 'China',
    supplierTier: 'VIP',
    supplierTrustScore: 99,
    supplierIsVerified: true,
    title: 'Doublestar 315/80R22.5 DSR118 Long-Haul All-Position TBR Commercial Radial Truck Tire',
    category: 'Automotive & Tires',
    subCategory: 'Commercial Truck Tires (TBR)',
    images: [
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'SmartWay-verified low rolling resistance all-steel radial tire engineered for long-haul highway steering and trailer axles. Features 4-groove straight tread design for optimal water evacuation and high fuel efficiency.',
    fobPriceUsd: 135.00,
    priceRangeUsd: '$120.00 - $155.00',
    minOrderQuantity: '100 Pieces (1x40HC)',
    unit: 'Piece',
    moq: 100,
    moqUnit: 'Pieces',
    leadTimeDays: 20,
    sampleAvailable: true,
    samplePriceUsd: 180.00,
    supportedIncoterms: ['FOB', 'CIF', 'CFR', 'DDP'],
    portOfDispatch: 'Qingdao Port, China',
    certifications: ['DOT', 'ECE E4', 'GCC', 'SmartWay', 'ISO/TS 16949'],
    specifications: [
      { name: 'Size', value: '315/80R22.5' },
      { name: 'Ply Rating', value: '20PR' },
      { name: 'Load Index / Speed Symbol', value: '156/150L' },
      { name: 'Standard Rim', value: '9.00 x 22.5' },
      { name: 'Tread Depth', value: '15.5 mm' }
    ],
    packagingDetails: 'Export standard wrapped plastic belt or un-wrapped in container'
  },

  // 3. GloEmpact LLC - Baled Scrap Tires for Pyrolysis & TDF
  {
    id: 'prod-tire-03',
    supplierId: 'comp-tire-28',
    supplierName: 'GloEmpact LLC',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 95,
    supplierIsVerified: true,
    title: 'High-Density Baled Scrap Passenger & Truck Tires (40HC Container Export for Pyrolysis & TDF)',
    category: 'Recycled Materials & Scrap',
    subCategory: 'Scrap Tires & Crumb Rubber',
    images: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Clean compressed scrap tire bales (approx. 100-110 tires per bale) packed with heavy steel wire binding. Average container payload 24-27 MT per 40ft High Cube container. Ideal for tyre oil pyrolysis, TDF cement kiln fuel, and crumb rubber milling.',
    fobPriceUsd: 45.00,
    priceRangeUsd: '$38.00 - $55.00',
    minOrderQuantity: '50 Metric Tons (2x40HC)',
    unit: 'Metric Ton',
    moq: 50,
    moqUnit: 'Metric Tons',
    leadTimeDays: 10,
    sampleAvailable: false,
    supportedIncoterms: ['FOB', 'CIF', 'CFR'],
    portOfDispatch: 'Port of Houston, TX / Savannah, GA',
    certifications: ['ISRI Certified', 'TCEQ Scrap Tire Authorization', 'Pre-shipment Inspection by SGS'],
    specifications: [
      { name: 'Product Type', value: 'Baled Scrap Tires (Passenger Car & Light Truck)' },
      { name: 'Bale Weight', value: 'Approx. 900 - 1000 kg per bale' },
      { name: 'Bale Dimensions', value: '5ft x 5ft x 3ft' },
      { name: 'Container Loading', value: '25-27 Metric Tons per 40HC Container' },
      { name: 'Wire Binding', value: '5 Galvanized High-Tensile Steel Wires' }
    ],
    packagingDetails: 'Compressed bales loaded directly into 40ft HC marine containers'
  },

  // 4. Hanah International Inc. - Grade A Used Tires from Korea
  {
    id: 'prod-tire-04',
    supplierId: 'comp-tire-18',
    supplierName: "Hanah International Inc., Seoul, Korea",
    supplierCountry: 'South Korea',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 96,
    supplierIsVerified: true,
    title: 'Grade A Korean Used Passenger Car Radial Tires (Tread Depth 5mm - 7mm)',
    category: 'Automotive & Tires',
    subCategory: 'Used Tires & Casings',
    images: [
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Thoroughly pressure tested and visually inspected Korean brand used tires (Hankook, Kumho, Nexen). No sidewall damage, bead defects, or shoulder punctures. Available in singles, doubles, and triples nesting for container optimization.',
    fobPriceUsd: 14.50,
    priceRangeUsd: '$11.00 - $18.50',
    minOrderQuantity: '1000 Pieces (1x40HC)',
    unit: 'Piece',
    moq: 1000,
    moqUnit: 'Pieces',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 25.00,
    supportedIncoterms: ['FOB', 'CIF', 'CFR'],
    portOfDispatch: 'Busan Port / Incheon Port, South Korea',
    certifications: ['KITA Exporter Verification', 'Pressure Test Inspection 100%'],
    specifications: [
      { name: 'Remaining Tread', value: '70% - 90% (5.0mm - 7.5mm)' },
      { name: 'Available Sizes', value: '13", 14", 15", 16", 17", 18", 19", 20"' },
      { name: 'Major Brands', value: 'Hankook, Kumho, Nexen, Michelin, Bridgestone' },
      { name: 'Nesting Options', value: 'Single, Doubled (2-in-1), Tripled (3-in-1)' },
      { name: 'Container Load Capacity', value: 'Up to 2,800 pcs (tripled) in 40HC' }
    ],
    packagingDetails: 'Loose loaded nested in 40HC container with loading manifest'
  },

  // 5. Zibo United Tech Machinery Co., Ltd. - Waste Tire Shredder Line
  {
    id: 'prod-tire-05',
    supplierId: 'comp-tire-32',
    supplierName: 'Zibo United Tech Machinery Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'Industrial Heavy-Duty Double Shaft Waste Tire Shredder & Wire Debeader Recycling Line',
    category: 'Industrial Machinery',
    subCategory: 'Tire Recycling Equipment',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'High torque, low speed dual shaft shredder engineered specifically for car, truck, and tractor tires. Handles whole scrap tires up to 1200mm diameter, outputting 50mm x 50mm uniform rubber chips with magnetic steel separator.',
    fobPriceUsd: 38500.00,
    priceRangeUsd: '$28,000 - $65,000',
    minOrderQuantity: '1 Set',
    unit: 'Set',
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 30,
    sampleAvailable: false,
    supportedIncoterms: ['FOB', 'CIF', 'EXW', 'DDP'],
    portOfDispatch: 'Qingdao Port, China',
    certifications: ['CE Certified', 'ISO 9001:2015', 'TUV Audited'],
    specifications: [
      { name: 'Motor Power', value: '2 x 45 kW (Siemens / WEG)' },
      { name: 'Capacity', value: '2,000 - 4,000 kg/hour' },
      { name: 'Blade Material', value: 'High Alloy Hardened Tool Steel (Cr12MoV / D2)' },
      { name: 'Chamber Size', value: '1200mm x 800mm' },
      { name: 'Control System', value: 'Siemens PLC Automatic Reverse on Overload' }
    ],
    packagingDetails: 'Heavy steel frame and moisture-proof wooden case export packing'
  },

  // 6. Roadstone Tire Company - Performance Passenger Car Radial Tires
  {
    id: 'prod-tire-06',
    supplierId: 'comp-tire-21',
    supplierName: 'Roadstone Tire Company',
    supplierCountry: 'United States',
    supplierTier: 'PLATINUM',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'Roadstone Eurovis Sport 04 Ultra-High-Performance Passenger Car Radial Tire',
    category: 'Automotive & Tires',
    subCategory: 'Passenger Car Radial (PCR)',
    images: [
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Asymmetric tread compound formulation engineered for superior wet grip, reduced road noise, and responsive dry cornering stability. Features reinforced belt structure and silica compounding for 60,000-mile treadwear warranty.',
    fobPriceUsd: 48.00,
    priceRangeUsd: '$38.00 - $62.00',
    minOrderQuantity: '200 Pieces',
    unit: 'Piece',
    moq: 200,
    moqUnit: 'Pieces',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 70.00,
    supportedIncoterms: ['FOB', 'CIF', 'DDP'],
    portOfDispatch: 'Port of Charleston / Wilmington, NC',
    certifications: ['DOT Certified', 'UTQG 400 A A', 'ECE', 'ISO 9001:2015'],
    specifications: [
      { name: 'Size', value: '225/45R17 94W XL' },
      { name: 'Speed Rating', value: 'W (Up to 168 mph / 270 km/h)' },
      { name: 'Treadwear / Traction / Temp', value: '400 / A / A' },
      { name: 'Tread Compound', value: 'High Dispersion Silica + Nano Polymer' },
      { name: 'Warranty', value: '60,000 Miles Manufacturer Limited Warranty' }
    ],
    packagingDetails: 'Factory labeled and container loaded'
  }
];
