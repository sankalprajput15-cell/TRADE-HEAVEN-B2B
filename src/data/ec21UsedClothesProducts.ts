import { Product } from '../types';

export const EC21_USED_CLOTHES_PRODUCTS: Product[] = [
  // 1. KY Trading Co.,Ltd - Korean Grade A Sorted Used Clothes Bales
  {
    id: 'prod-ec21-uc-1',
    title: 'Grade A Korean Used Clothing Bales (Men / Women / Children 80kg - 100kg Bales)',
    category: 'Apparel & Fashion',
    subCategory: 'Used Clothing & Vintage Bales',
    supplierId: 'comp-ec21-uc-0',
    supplierName: 'KY Trading Co.,Ltd',
    supplierCountry: 'South Korea',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1 x 20ft FCL (130 Bales)',
    priceRangeUsd: '$1.40 - $2.20 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'],
    description: 'First-class Korean secondhand apparel collected from premium residential districts in Seoul and Busan. Carefully graded for vibrant colors, zero tears, zero stains, and trending modern cuts.',
    specifications: {
      'Grade Quality': 'Cream Grade & Grade A (No holes, no stains, original zippers/buttons)',
      'Bale Weight': '80 KG / 100 KG Hydraulic High-Density Pressed Bales',
      'Categories Available': 'Ladies Summer Dress, Silk Blouses, Men T-shirts, Jeans, Kids Mixed',
      'Container Capacity': '20ft FCL: ~13 MT (130-140 bales) / 40ft HC: ~28 MT (280-300 bales)',
      'Fumigation & Inspection': 'Fumigation Certificate, Phytosanitary & SGS Pre-Shipment Inspection'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 78
  },

  // 2. vesti - USA Premium Summer & Winter Sorted Clothing Bales
  {
    id: 'prod-ec21-uc-2',
    title: 'USA Sorted Secondhand Clothing & Mixed Rags in 40ft High Cube Containers',
    category: 'Apparel & Fashion',
    subCategory: 'Bulk Export Bales',
    supplierId: 'comp-ec21-uc-1',
    supplierName: 'vesti',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1 x 40ft HC Container (56,000 Lbs)',
    priceRangeUsd: '$0.85 - $1.65 / LB',
    unit: 'Lbs',
    images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80'],
    description: 'Export-grade USA secondhand apparel categorized into summer lightweight, cotton tees, polo shirts, denim pants, and branded sportswear. Packed into standard machine-pressed export bales.',
    specifications: {
      'Origin': '100% USA Virgin Institutional & Charity Collections',
      'Packaging': '1,000 Lbs (450 KG) Giant Bales or 100 Lbs (45 KG) Small Bales',
      'Load Weight': '56,000 Lbs - 58,000 Lbs per 40ft High Cube Container',
      'Assortment': 'Tropical Summer Mix (60% Women, 25% Men, 15% Children)',
      'Shipping Terms': 'FOB Houston / CIF Cotonou, Tema, Lagos, Mombasa'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 64
  },

  // 3. Yuchang Trading Co.,Ltd - Door-to-Door Cream Quality Clothes, Shoes & Bags
  {
    id: 'prod-ec21-uc-3',
    title: 'Door-to-Door Selected Korean Cream Secondhand Clothes, Shoes & Fashion Bags',
    category: 'Apparel & Fashion',
    subCategory: 'Cream Quality & Accessories',
    supplierId: 'comp-ec21-uc-2',
    supplierName: 'Yuchang Trading Co.,Ltd',
    supplierCountry: 'South Korea',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '50 Bales (4,000 KG)',
    priceRangeUsd: '$1.80 - $2.90 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'],
    description: 'Direct door-to-door raw material selection bypassing middlemen. High ratio of branded items, designer streetwear, pristine leather shoes, and Korean fashion handbags with excellent resale margins.',
    specifications: {
      'Product Scope': 'Cream Clothes (80kg), Paired Secondhand Shoes (25kg bags), Bags (45kg)',
      'Sorting Accuracy': 'Strict 3-pass human inspection line',
      'Rejection Rate': 'Under 1.5% defect tolerance',
      'Export Markets': 'Nigeria, Ghana, Kenya, India, Indonesia, Philippines',
      'Bale Packaging': 'Transparent waterproof woven wrap with color-coded strapping'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 92
  },

  // 4. Galaxy Rags - 45kg Compact Export Bales of Sorted Mix Rags
  {
    id: 'prod-ec21-uc-4',
    title: 'Precision Sorted 45kg Export Bales of North American Mixed Clothing & Rags',
    category: 'Apparel & Fashion',
    subCategory: 'Sorted 45kg Bales',
    supplierId: 'comp-ec21-uc-7',
    supplierName: 'Galaxy Rags',
    supplierCountry: 'Pakistan',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '100 Bales (4,500 KG)',
    priceRangeUsd: '$0.95 - $1.75 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80'],
    description: 'High-speed sorting facility processing imported USA/Canadian mix rags into over 80 specific garment categories. Compact 45kg bale format optimized for local West & East African market distribution.',
    specifications: {
      'Bale Dimensions': '45 KG (100 Lbs) Compact Hydraulic Bales',
      'Item Breakdown': 'Tropical Mens Shirts, Ladies Blouses, Cotton Trousers, Children Rompers',
      'Inspection Standards': 'No wet items, no heavy industrial oil stains, no torn rags',
      'Dispatch Port': 'Port Qasim / Karachi Port to Worldwide Destinations',
      'Capacity': '60 x 40ft Containers per month'
    },
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 56
  }
];
