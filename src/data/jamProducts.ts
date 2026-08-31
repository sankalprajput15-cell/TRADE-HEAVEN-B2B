import { Product } from '../types';

export const GLOBAL_JAM_PRODUCTS: Product[] = [
  // 1. Delimet Foods - Artisanal Spanish Strawberry & Wild Berry Jam
  {
    id: 'prod-th-jam-1',
    title: 'Artisan Organic Strawberry & Forest Berry Jam (No Artificial Pectin)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Fruit Jams & Preserves',
    supplierId: 'comp-th-jam-0',
    supplierName: 'Delimet Foods, S.L.',
    supplierCountry: 'Spain',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1,200 Jars',
    priceRangeUsd: '$3.00 - $3.50 / Jar',
    unit: 'Jars',
    images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80'],
    description: 'Mediterranean artisan strawberry jam cooked with 65% whole ripe Spanish berries, organic cane sugar, and fresh lemon juice. Free from artificial colorants, synthetic preservatives, and modified starches.',
    specifications: {
      'Fruit Content': '≥ 65% Whole Strawberries',
      'Brix Level': '58° - 62° Brix',
      'Shelf Life': '24 Months at Room Temperature',
      'Packaging': '370g Hexagonal Glass Jar with Twist-Off Gold Cap',
      'Certifications': 'EU Bio Organic, HACCP, ISO 22000, IFS Food'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 38
  },

  // 2. Yantai Shunxingyuan - Industrial Bakery Strawberry & Blueberry Jam Filling
  {
    id: 'prod-th-jam-2',
    title: 'Bake-Stable Fruit Jam Filling (Strawberry / Blueberry / Peach / Passion Fruit)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Bakery Ingredients',
    supplierId: 'comp-th-jam-1',
    supplierName: 'Yantai Shunxingyuan Foods Technology CO., LTD',
    supplierCountry: 'China',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '2,000 KG',
    priceRangeUsd: '$1.50 - $1.80 / KG',
    unit: 'KG',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
    description: 'Thermo-stable industrial fruit jam developed for automated bakery lines, croissant injection, danish pastry topping, and Swiss rolls. Retains gloss, vibrant color, and fresh fruit aroma after 220°C oven baking.',
    specifications: {
      'Bake Stability': 'Stable at 200°C - 230°C for 15-20 minutes without boil-over',
      'Total Soluble Solids': '65° - 68° Brix',
      'pH Level': '3.2 - 3.6',
      'Packaging': '5kg / 20kg Food-Grade Plastic Pails or Aseptic Drums (200kg)',
      'Certifications': 'BRC Global Standard, ISO 22000, HALAL, KOSHER, FDA'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 52
  },

  // 3. Kassumay LLC - Senegalese Hibiscus (Bissap) Flower Fruit Spread
  {
    id: 'prod-th-jam-3',
    title: 'Gourmet Wild Hibiscus (Bissap) & Mango Artisanal Fruit Spread',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Specialty Gourmet Spreads',
    supplierId: 'comp-th-jam-2',
    supplierName: 'Kassumay LLC',
    supplierCountry: 'United States',
    supplierIsVerified: true,
    supplierTier: 'GOLD',
    minOrderQuantity: '500 Jars',
    priceRangeUsd: '$4.20 - $4.80 / Jar',
    unit: 'Jars',
    images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80'],
    description: 'Award-winning handcrafted fruit spread blending tart Senegalese hibiscus calyces with sweet sun-ripened tropical mango and a touch of ginger. Non-GMO, vegan, gluten-free, and rich in natural antioxidants.',
    specifications: {
      'Ingredients': 'Dried Hibiscus Calyces, Tropical Mango, Pure Cane Sugar, Citrus Pectin, Lemon Juice',
      'Allergen Info': 'Gluten-Free, Nut-Free, Soy-Free, 100% Plant-Based',
      'Packaging': '8 oz (227g) Premium Glass Jar with safety tamper seal',
      'Certifications': 'Non-GMO Project Verified, Kosher, Made in USA'
    },
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewCount: 29
  },

  // 4. BCF Egypt - Export Grade Fig & Orange Marmalade Jams
  {
    id: 'prod-th-jam-4',
    title: 'Commercial Egyptian Fig Jam & Seville Bitter Orange Marmalade',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Canned Food & Jams',
    supplierId: 'comp-th-jam-3',
    supplierName: 'BCF Egypt',
    supplierCountry: 'Egypt',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '18,000 Jars',
    priceRangeUsd: '$1.05 - $1.25 / Jar',
    unit: 'Jars',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
    description: 'High-volume export jam produced from sun-drenched Egyptian black mission figs and fine-cut Seville orange peels. Engineered for retail supermarket chains, hotel buffets, and airline catering.',
    specifications: {
      'Fruit Content': '≥ 45% Real Fruit',
      'Brix': '65° Brix Standard',
      'Packing Format': '370g glass jar (24 jars/carton), or 850g catering tin',
      'Container Load': '1,800 cartons per 20ft Dry FCL',
      'Certifications': 'ISO 22000, HACCP, HALAL, FDA Registered'
    },
    featured: false,
    inStock: true,
    rating: 4.9,
    reviewCount: 41
  },

  // 5. Jangguri Cooperative (COFILIA) - Korean Patented Fermented Honey Fruit Jam
  {
    id: 'prod-th-jam-5',
    title: 'Zero-Additive Fermented Wildflower Honey & Berry Jam (Worldwide Patented)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Functional Health Foods',
    supplierId: 'comp-th-jam-8',
    supplierName: 'Jangguri Cooperative (COFILIA)',
    supplierCountry: 'Korea',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '600 Jars',
    priceRangeUsd: '$5.50 - $6.20 / Jar',
    unit: 'Jars',
    images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80'],
    description: 'Revolutionary fermented fruit jam formulated using proprietary natural lactobacillus fermentation with pure Korean mountain wildflower honey. Absolutely 0% refined white sugar, 0% synthetic preservatives, and 0% artificial thickeners.',
    specifications: {
      'Patents': 'Registered Patents in Korea, USA, Taiwan, and 10 European Nations',
      'Fermentation Tech': 'Patented Low-Temperature Fruit Fermentation Process',
      'Active Ingredients': 'Natural Polyphenols, Organic Acids, Active Bio-Enzymes',
      'Packaging': '300g Hexagon Luxury Jar with Holographic Seal',
      'Certifications': 'FSSC 22000, ISO 22000, FDA Registered, HACCP'
    },
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewCount: 33
  },

  // 6. CJWC Yuzu Sudachi - Honey Citron Yuzu Marmalade / Tea Jam Base
  {
    id: 'prod-th-jam-6',
    title: 'Honey Citron Yuzu Tea Marmalade Jam (Sliced Yuzu Peel 45%)',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Citrus Beverages & Marmalades',
    supplierId: 'comp-th-jam-11',
    supplierName: 'CJWC Yuzu Sudachi GZ Food Co.,Ltd.',
    supplierCountry: 'China',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1,000 Jars',
    priceRangeUsd: '$2.75 - $3.10 / Jar',
    unit: 'Jars',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
    description: 'Authentic sliced Yuzu (Citrus junos) fruit peel infused in natural mountain honey and golden cane syrup. Widely used for hot citrus tea, iced tea infusions, gourmet salad vinaigrettes, and artisanal cocktail mixology.',
    specifications: {
      'Yuzu Peel & Pulp': '≥ 45% Fresh Sliced Citrus Peel',
      'Honey Content': '≥ 15% Pure Acacia / Wildflower Honey',
      'Brix': '62° - 65° Brix',
      'Packaging': '1kg Glass Jar with easy-pour handle, or 2kg / 15kg Foodservice Pail',
      'Certifications': 'HACCP, ISO 22000, HALAL, JAS Organic Standard'
    },
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 57
  },

  // 7. Sayin Group - Traditional Turkish Pomegranate Molasses & Fig Jam
  {
    id: 'prod-th-jam-7',
    title: '100% Pure Pomegranate Molasses & Anatolian Quince Fruit Jam',
    category: 'Agriculture & Food Commodities',
    subCategory: 'Traditional Mediterranean Specialties',
    supplierId: 'comp-th-jam-13',
    supplierName: 'Sayin Group',
    supplierCountry: 'Turkey',
    supplierIsVerified: true,
    supplierTier: 'PLATINUM',
    minOrderQuantity: '1,500 Bottles',
    priceRangeUsd: '$2.90 - $3.30 / Bottle',
    unit: 'Bottles',
    images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80'],
    description: 'Traditional slow-simmered 100% natural sour pomegranate molasses (Nar Ekşisi) and fragrant Anatolian quince jam with cloves. Zero added glucose syrup or artificial caramel coloring.',
    specifications: {
      'Purity': '100% Pure Pomegranate Juice Reduction (No Added Sugar)',
      'Acidity': '4.5% - 6.0% Natural Citric Equivalent',
      'Brix': '68° - 70° Brix',
      'Packaging': '500ml Marasca Glass Bottle (12 pcs/box) / 380g Jam Jar',
      'Certifications': 'TSE Turkish Food Codex, HALAL, ISO 22000, HACCP'
    },
    featured: false,
    inStock: true,
    rating: 4.9,
    reviewCount: 44
  }
];
