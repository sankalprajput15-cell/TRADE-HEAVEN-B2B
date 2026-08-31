import { Product } from '../types';

export const GLOBAL_ESPO_PRODUCTS: Product[] = [
  // 1. Eastern Siberian Pacific Ocean (ESPO) Blend Crude Oil
  {
    id: 'prod-th-espo-1',
    title: 'Eastern Siberian Pacific Ocean (ESPO) Blend Crude Oil (API 34.8° Sweet Low Sulfur Kozmino Lift)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Base Oil',
    supplierId: 'comp-th-espo-2',
    supplierName: 'Kazinst Petroleum Refinery',
    supplierCountry: 'United Kingdom',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1,000,000 Barrels',
    priceRangeUsd: '$68 - $76 / Barrel',
    unit: 'Barrels',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    description: 'High-yield sweet crude oil pipeline blend delivered via Eastern Siberia-Pacific Ocean network to Kozmino Port / Qingdao / Rizhao / Rotterdam. Ideal refining yield for high-octane gasoline, kerosene jet fuel, and middle distillates.',
    specifications: {
      'API Gravity @ 60°F': '34.8° API (Medium Sweet Crude)',
      'Specific Gravity @ 15°C': '0.850 - 0.855 g/cm³',
      'Sulfur Content': '≤ 0.55% - 0.62% Mass (Low Sulfur)',
      'Pour Point': '≤ -15.0 °C',
      'Kinematic Viscosity @ 20°C': '8.5 - 9.8 cSt',
      'Water and Sediment (BS&W)': '≤ 0.30% Max Volume',
      'Delivery Term': 'FOB Kozmino, CIF Rizhao/Qingdao (China), CIF Rotterdam'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 92
  },

  // 2. Ultra Low Sulphur Diesel EN590 10PPM (Chesapeake Energy)
  {
    id: 'prod-th-espo-2',
    title: 'Ultra Low Sulphur Diesel EN590 10PPM (US Gulf Coast / Rotterdam Export Allocation)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Automotive Diesel EN590',
    supplierId: 'comp-th-espo-10',
    supplierName: 'Chesapeake Energy Corporation',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100,000 Metric Tons',
    priceRangeUsd: '$525 - $570 / MT',
    unit: 'Metric Tons',
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'],
    description: 'Direct titleholder allocation of refinery fresh EN590 10PPM Diesel. Full banking capability, Proof of Product (POP), and standard ICC NCNDA / IMFPA protection for legitimate buyer mandates.',
    specifications: {
      'Sulfur Content': '≤ 10 mg/kg (10 PPM)',
      'Cetane Number': '≥ 52.0',
      'Flash Point': '≥ 60 °C',
      'Density @ 15°C': '825 - 845 kg/m³',
      'Lubricity (HFRR @ 60°C)': '≤ 400 µm',
      'Inspection': 'SGS / Intertek / CIQ Quality & Quantity Certificate'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 84
  },

  // 3. Petroleum Coke Anode & Fuel Grade (Dorcheat Oil & Gas)
  {
    id: 'prod-th-espo-3',
    title: 'Calcined & Green Petroleum Coke (Anode Grade for Aluminum Smelting & High GCV Fuel)',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Bitumen',
    supplierId: 'comp-th-espo-13',
    supplierName: 'Dorcheat Oil & Gas LLC',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '25,000 Metric Tons',
    priceRangeUsd: '$120 - $185 / MT',
    unit: 'Metric Tons',
    images: ['https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80'],
    description: 'High-density green delayed petroleum coke and calcined petcoke engineered for aluminum smelter anodes, steel carbon raisers, and high-efficiency thermal power utility boilers.',
    specifications: {
      'Gross Calorific Value (GCV)': '≥ 8,200 - 8,500 kcal/kg',
      'Fixed Carbon': '≥ 85.0% - 90.0%',
      'Sulfur Content': '≤ 1.5% - 3.5%',
      'Volatile Matter': '9.0% - 11.5%',
      'Total Moisture': '≤ 8.0%',
      'Ash Content': '≤ 0.50%'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 41
  },

  // 4. Light Cycle Oil (LCO) Industrial Blend (Goldclass Business Solutions)
  {
    id: 'prod-th-espo-4',
    title: 'Light Cycle Oil (LCO) High-Density Blend for Industrial Heating & Marine Bunker',
    category: 'Petroleum, Oil & Related Products',
    subCategory: 'Aviation Fuel Oil',
    supplierId: 'comp-th-espo-1',
    supplierName: 'Goldclass Business Solutions',
    supplierCountry: 'United Kingdom',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '50,000 Metric Tons',
    priceRangeUsd: '$460 - $510 / MT',
    unit: 'Metric Tons',
    images: ['https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=80'],
    description: 'Catalytic cracked Light Cycle Oil (LCO) providing exceptional thermal density and combustion characteristics for heavy transport blending, furnace fuels, and bunkering operations.',
    specifications: {
      'Density @ 15°C': '890 - 930 kg/m³',
      'Flash Point': '≥ 62.0 °C',
      'Kinematic Viscosity @ 40°C': '3.5 - 6.0 mm²/s',
      'Pour Point': '≤ -6.0 °C',
      'Distillation 90% Recovered': '≤ 365.0 °C'
    },
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 35
  }
];
