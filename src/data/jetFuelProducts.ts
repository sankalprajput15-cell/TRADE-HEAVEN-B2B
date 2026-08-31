import { Product } from '../types';

export const GLOBAL_JET_FUEL_PRODUCTS: Product[] = [
  // 1. Aviation Kerosene Jet A-1 / JP54 Colonial Grade
  {
    id: 'prod-th-jf-1',
    title: 'Aviation Kerosene Jet Fuel A-1 (ASTM D1655 / DEF STAN 91-091 Rotterdam & Houston Lift)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'A1 Jet Fuel',
    supplierId: 'comp-th-jf-1',
    supplierName: 'Global Fuel Oil Llc',
    supplierCountry: 'United Kingdom',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1,000,000 Barrels',
    priceRangeUsd: '$78 - $86 / Barrel',
    unit: 'Barrels',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'Fresh production Aviation Kerosene Jet A-1 certified to ASTM D1655, DEF STAN 91-091, and Joint Inspection Group (JIG) specifications. Stored in bonded shore tanks ready for immediate dip test and lift at Port of Rotterdam, Houston, and Jurong under FOB / CIF procedures.',
    specifications: {
      'Standard Grade': 'ASTM D1655 / DEF STAN 91-091 Issue 12',
      'Flash Point (Tag Closed)': '≥ 38.0 °C (Min 100 °F)',
      'Freezing Point': '≤ -47.0 °C (-52.6 °F)',
      'Density @ 15°C': '775.0 - 840.0 kg/m³',
      'Total Acidity': '≤ 0.015 mg KOH/g',
      'Smoke Point': '≥ 25.0 mm',
      'Inspection Protocol': 'SGS / Saybolt / Intertek Dip Test at Tank Terminal'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 68
  },

  // 2. Ultra Low Sulphur Diesel EN590 10PPM
  {
    id: 'prod-th-jf-2',
    title: 'Ultra Low Sulphur Diesel EN590 10PPM (Euro 5 / Euro 6 Standard Low Emission)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Automotive Diesel EN590',
    supplierId: 'comp-th-jf-3',
    supplierName: 'Temi Petroleum LLP',
    supplierCountry: 'Kazakhstan',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '50,000 Metric Tons',
    priceRangeUsd: '$520 - $580 / MT',
    unit: 'Metric Tons',
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'],
    description: 'High-purity Automotive Gas Oil / Ultra Low Sulphur Diesel meeting European standard EN 590:2013+A1:2017 with maximum 10 ppm sulfur content. Clean combustion, high cetane number (≥51.0), and optimal cold filter plugging point (CFPP) for summer/winter grades.',
    specifications: {
      'Sulfur Content': '≤ 10.0 mg/kg (10 PPM)',
      'Cetane Index / Number': '≥ 51.0 (ASTM D613)',
      'Density @ 15°C': '820.0 - 845.0 kg/m³',
      'Flash Point': '≥ 55.0 °C',
      'Distillation (95% Rec)': '≤ 360.0 °C',
      'Water Content': '≤ 200 mg/kg'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 54
  },

  // 3. Virgin Fuel Oil D6 (Low Pour / Heavy Distillate)
  {
    id: 'prod-th-jf-3',
    title: 'Virgin Fuel Oil D6 (Heavy Residual Distillate for Industrial & Power Generation)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Aviation Fuel Oil',
    supplierId: 'comp-th-jf-6',
    supplierName: 'Aktobe Petroleum Trade LLP',
    supplierCountry: 'Kazakhstan',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100,000,000 Gallons',
    priceRangeUsd: '$1.45 - $1.75 / Gallon',
    unit: 'Gallons',
    images: ['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80'],
    description: 'Virgin Fuel Oil D6 specifically processed and blended for power generation plants, thermal stations, and large industrial boiler applications. High calorific value (Gross Heat ≥ 18,500 BTU/lb) and strictly controlled water and sediment content (<0.5%).',
    specifications: {
      'Gross Heat of Combustion': '≥ 18,500 BTU/lb (43.0 MJ/kg)',
      'API Gravity @ 60°F': '12.0 - 18.0 °API',
      'Kinematic Viscosity @ 50°C': '≤ 380 cSt (CST-380 Grade)',
      'Flash Point (Pensky-Martens)': '≥ 65.0 °C',
      'Sulfur Content': '≤ 0.5% - 1.0% Max',
      'Sediment by Extraction': '≤ 0.15% Mass'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 39
  },

  // 4. European Diesel EN590 10PPM FOB Rotterdam / Houston
  {
    id: 'prod-th-jf-4',
    title: 'European Specification Diesel EN590 10PPM (FOB Rotterdam & CIF ASWP Direct Allocation)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Automotive Diesel EN590',
    supplierId: 'comp-th-jf-11',
    supplierName: 'A.P. Intertrade GmbH',
    supplierCountry: 'Austria',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100,000 Metric Tons',
    priceRangeUsd: '$530 - $575 / MT',
    unit: 'Metric Tons',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'Direct refinery allocation from top European and international refineries. Available for spot liftings and 12-month revolving contracts under Platts European Marketscan index pricing minus contractual discount.',
    specifications: {
      'Sulfur Content': '≤ 10 ppm (EN ISO 20846)',
      'Cetane Number': '≥ 51.0',
      'Cold Filter Plugging Point': '-10°C (Summer) / -20°C (Winter Grade)',
      'Copper Strip Corrosion (3h at 50°C)': 'Class 1',
      'Delivery Terms': 'FOB Rotterdam, FOB Houston, CIF ASWP'
    },
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 47
  }
];
