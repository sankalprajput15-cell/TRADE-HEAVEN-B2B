const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf-8');

const newCategories = `
  {
    id: 'cat-construction-excavation',
    name: 'Construction & Excavation Machinery',
    icon: 'Tractor',
    image: 'https://images.unsplash.com/photo-1579541300958-c0b7d3f114c0?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Excavator', 'Bulldozer', 'Wheel Loader', 'Backhoe', 'Crawler Excavator', 'Mini Excavator', 'Skid Steer Loader', 'Dump Truck', 'Excavator Bucket', 'Hydraulic Excavator'],
    count: '1,240+ Verified Suppliers | 560+ RFQs'
  },
  {
    id: 'cat-welding-equipment',
    name: 'Welding & Soldering Equipment',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
    subcategories: ['Welder Machine', 'Laser Welder', 'Laser Cutting Machine', 'Plastic Welding Machine', 'Spot Welder', 'Butt Welding Machine', 'Ultrasonic Welder', 'MIG Welder', 'TIG Welder', 'Submerged Arc Welder'],
    count: '980+ Verified Suppliers | 420+ RFQs'
  },
`;

content = content.replace(
  "export const CATEGORIES_TREE = [",
  "export const CATEGORIES_TREE = [\n" + newCategories
);

fs.writeFileSync('src/data/mockData.ts', content, 'utf-8');
console.log('Categories updated.');
