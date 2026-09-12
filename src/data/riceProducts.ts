import { Product } from '../types';

export const GLOBAL_RICE_PRODUCTS: Product[] = [
  {
    id: 'prod-rice-01',
    supplierId: 'comp-rice-astra',
    supplierName: 'Astra Commodities LLC',
    supplierCountry: 'United States',
    supplierTier: 'GOLD',
    title: 'Premium White Rice Long Grain - Export Grade',
    description: 'High quality white rice for bulk wholesale export. Cleaned, sorted, and packed in 50kg PP bags. Ready for international shipment.',
    category: 'Agriculture & Food',
    subCategory: 'Grains & Rice',
    priceRangeUsd: '$420 - $490',
    unit: 'MT',
    minOrderQuantity: '25',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Broken', value: '5% Max' },
      { name: 'Moisture', value: '14% Max' },
      { name: 'Admixture', value: '0.5% Max' },
      { name: 'Crop Year', value: '2025/2026' }
    ]
  },
  {
    id: 'prod-rice-02',
    supplierId: 'comp-rice-pinyang',
    supplierName: 'Hubei Pinyang Technology Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'PLATINUM',
    title: 'Commercial Rice Milling Machine & Paddy Processing Plant',
    description: 'Advanced paddy processing machine and rice milling equipment. High efficiency, low breakage rate, complete turnkey grain processing machinery.',
    category: 'Industrial Machinery',
    subCategory: 'Agricultural Machinery',
    priceRangeUsd: '$12,500 - $35,000',
    unit: 'Set',
    minOrderQuantity: '1',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Capacity', value: '1-5 T/H' },
      { name: 'Power', value: '37kW' },
      { name: 'Voltage', value: '380V/50Hz' },
      { name: 'Warranty', value: '2 Years' }
    ]
  },
  {
    id: 'prod-rice-03',
    supplierId: 'comp-rice-jangfood',
    supplierName: 'JangFood',
    supplierCountry: 'Korea',
    supplierTier: 'SILVER',
    title: 'Korean Rice Cake (Tteokbokki) & HMR Instant Rice Meals',
    description: 'Authentic Korean rice cakes, sauces, and ready-to-eat instant rice meal packs. Frozen and vacuum packed for global distribution.',
    category: 'Agriculture & Food',
    subCategory: 'Processed Foods',
    priceRangeUsd: '$2.50 - $4.80',
    unit: 'Carton',
    minOrderQuantity: '100',
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Shelf Life', value: '12 Months' },
      { name: 'Storage', value: 'Frozen / Ambient' },
      { name: 'Certification', value: 'HACCP / ISO' }
    ]
  },
  {
    id: 'prod-rice-04',
    supplierId: 'comp-rice-semchorong',
    supplierName: 'Semchorong',
    supplierCountry: 'Korea',
    supplierTier: 'GOLD',
    title: 'Flower Tteokbokki & Premium Rice Food Products',
    description: 'Handcrafted flower-shaped rice cakes and traditional Korean rice snacks. Made with 100% premium domestic rice.',
    category: 'Agriculture & Food',
    subCategory: 'Rice Snacks & Cakes',
    priceRangeUsd: '$3.20 - $6.50',
    unit: 'Kg',
    minOrderQuantity: '50',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Ingredients', value: 'Rice Flour 99%' },
      { name: 'Type', value: 'Fresh & Frozen' }
    ]
  },
  {
    id: 'prod-rice-05',
    supplierId: 'comp-rice-togolmy',
    supplierName: 'TOGOLMY Inc.',
    supplierCountry: 'Korea',
    supplierTier: 'SILVER',
    title: 'Organic Roasted Brown Rice Tea (Hyeonmi-cha)',
    description: 'Traditional Korean brown rice tea bags and loose leaf roasted organic grains. Caffeine-free, soothing, and rich in antioxidants.',
    category: 'Agriculture & Food',
    subCategory: 'Beverages & Tea',
    priceRangeUsd: '$4.50 - $9.00',
    unit: 'Box',
    minOrderQuantity: '50',
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Packaging', value: '20 Tea Bags / Box' },
      { name: 'Origin', value: 'South Korea' }
    ]
  },
  {
    id: 'prod-rice-06',
    supplierId: 'comp-rice-aahlad',
    supplierName: 'Aahlad Exports',
    supplierCountry: 'India',
    supplierTier: 'GOLD',
    title: 'Indian Basmati Rice 1121 Extra Long Grain',
    description: 'World-renowned 1121 Extra Long Grain Basmati Rice. Aged to perfection, aromatic, fluffy, and non-sticky upon cooking.',
    category: 'Agriculture & Food',
    subCategory: 'Grains & Rice',
    priceRangeUsd: '$950 - $1,250',
    unit: 'MT',
    minOrderQuantity: '20',
    images: ['https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Grain Length', value: '8.3mm Min' },
      { name: 'Aroma', value: 'Strong Natural Fragrance' },
      { name: 'Broken', value: '1% Max' }
    ]
  },
  {
    id: 'prod-rice-07',
    supplierId: 'comp-rice-najiha',
    supplierName: 'Najiha Global Trade',
    supplierCountry: 'Indonesia',
    supplierTier: 'SILVER',
    title: 'Konjac Rice & Porang Low-Calorie Diet Rice',
    description: 'Zero-carb konjac shirataki rice and glucomannan porang rice. Ideal for keto diets, diabetics, and health-conscious consumers.',
    category: 'Agriculture & Food',
    subCategory: 'Health Foods',
    priceRangeUsd: '$2,100 - $2,800',
    unit: 'MT',
    minOrderQuantity: '5',
    images: ['https://images.unsplash.com/photo-1543168256-418811576931?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Calories', value: '9 kcal per 100g' },
      { name: 'Fiber', value: 'High Glucomannan' },
      { name: 'Certification', value: 'Halal / GMP' }
    ]
  },
  {
    id: 'prod-rice-08',
    supplierId: 'comp-rice-goodprice',
    supplierName: 'Goodprice Viet Nam',
    supplierCountry: 'Vietnam',
    supplierTier: 'GOLD',
    title: 'Vietnamese Jasmine Rice ST25 & White Rice 5% Broken',
    description: 'Award-winning Vietnamese Jasmine fragrant rice ST25 and standard 5% broken white rice. Direct from Mekong Delta farms.',
    category: 'Agriculture & Food',
    subCategory: 'Grains & Rice',
    priceRangeUsd: '$480 - $620',
    unit: 'MT',
    minOrderQuantity: '25',
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Variety', value: 'Jasmine ST25' },
      { name: 'Moisture', value: '14% Max' },
      { name: 'Crop', value: 'New Crop' }
    ]
  },
  {
    id: 'prod-rice-09',
    supplierId: 'comp-rice-nanjun',
    supplierName: 'Nanjundeswarar Rice Mill & Exporters',
    supplierCountry: 'India',
    supplierTier: 'PLATINUM',
    title: 'Sona Masoori Steam Rice & Traditional Basmati',
    description: 'Premium Sona Masoori lightweight aromatic steam rice and long-grain Basmati rice. Superior quality milling and sorting.',
    category: 'Agriculture & Food',
    subCategory: 'Grains & Rice',
    priceRangeUsd: '$650 - $880',
    unit: 'MT',
    minOrderQuantity: '20',
    images: ['https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Processing', value: 'Steam Parboiled' },
      { name: 'Purity', value: '98%' }
    ]
  },
  {
    id: 'prod-rice-10',
    supplierId: 'comp-rice-enrich',
    supplierName: 'Enrich',
    supplierCountry: 'Thailand',
    supplierTier: 'GOLD',
    title: 'Thai Hom Mali Jasmine Rice (Grade A)',
    description: 'Authentic Thai Hom Mali fragrant rice with delicate jasmine aroma and soft texture. Certified Thai Department of Foreign Trade.',
    category: 'Agriculture & Food',
    subCategory: 'Grains & Rice',
    priceRangeUsd: '$720 - $890',
    unit: 'MT',
    minOrderQuantity: '25',
    images: ['https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Purity', value: '92% Min Hom Mali' },
      { name: 'Crop', value: 'New Harvest' }
    ]
  },
  {
    id: 'prod-rice-11',
    supplierId: 'comp-rice-yongyao',
    supplierName: 'Hangzhou Yongyao Technology Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'PLATINUM',
    title: 'Smart Electric Rice Cooker & Multifunction Kitchen Cooker',
    description: 'High-tech micro-pressure induction heating smart rice cooker with fuzzy logic control and non-stick ceramic inner pot.',
    category: 'Home Appliances',
    subCategory: 'Kitchen Appliances',
    priceRangeUsd: '$28 - $65',
    unit: 'Piece',
    minOrderQuantity: '200',
    images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Capacity', value: '4.0 Liters' },
      { name: 'Voltage', value: '220V / 110V' },
      { name: 'Functions', value: '12 Smart Menus' }
    ]
  },
  {
    id: 'prod-rice-12',
    supplierId: 'comp-rice-arcom',
    supplierName: 'Arcom Private Ltd.',
    supplierCountry: 'Pakistan',
    supplierTier: 'GOLD',
    title: 'Pakistan Irri-6 Long Grain White Rice (5% & 25% Broken)',
    description: 'Pure quality Pakistan Irri-6 long grain white rice. Average length 7.2mm, aromatic, competitive bulk pricing.',
    category: 'Agriculture & Food',
    subCategory: 'Grains & Rice',
    priceRangeUsd: '$390 - $460',
    unit: 'MT',
    minOrderQuantity: '50',
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Variety', value: 'Irri-6 Long Grain' },
      { name: 'Broken', value: '5% / 25%' },
      { name: 'Length', value: '7.2mm' }
    ]
  }
];
