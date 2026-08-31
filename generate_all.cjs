const fs = require('fs');

const generateExcavatorCompanies = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'comp-th-exc-${i}',
    companyName: 'Excavator Supplier ${i} LLC',
    businessType: 'Manufacturer',
    country: 'United States',
    establishedYear: ${2000 + (i % 20)},
    totalEmployees: '51 - 100',
    description: 'A trusted manufacturer and supplier of heavy-duty excavators and construction equipment based in the US.',
    trustScore: ${75 + (i % 20)},
    legalRegistrationNumber: 'EXC-${1000 + i}',
    city: 'City ${i}',
    address: 'Address ${i}, USA',
    isVerifiedKYC: true,
    responseRate: '95%',
    avgResponseTime: '2 hours',
    annualRevenueUsd: '${(i % 5) + 1}M',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: 'contact${i}@excavatorsupplier.com',
    tradeAssuranceLimitUsd: ${10000 + (i * 1000)},
    completedOrdersCount: ${10 + i},
    tier: '${i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'FREE'}',
    contactPerson: 'Manager ${i}',
    contactPhone: '+1-555-${1000 + i}'
  }`);
  }
  return arr.join(',\n');
};

const generateExcavatorBuyers = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'buyer-exc-${i}',
    companyName: 'Global Excavator Buyer ${i}',
    legalRegistrationNumber: 'BUY-${1000 + i}',
    country: 'United States',
    city: 'City ${i}',
    address: 'Buyer Address ${i}',
    establishedYear: ${2005 + (i % 15)},
    businessType: 'Corporate Importer',
    tier: '${i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'FREE'}',
    isVerifiedKYC: true,
    trustScore: ${70 + (i % 25)},
    contactPerson: 'Buyer ${i}',
    contactEmail: 'buyer${i}@globalexcavator.com',
    contactPhone: '+1-555-000${i}'
  }`);
  }
  return arr.join(',\n');
};

const generateExcavatorProducts = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'prod-exc-${i}',
    supplierId: 'comp-th-exc-${i}',
    supplierName: 'Excavator Supplier ${i} LLC',
    supplierCountry: 'United States',
    supplierTier: '${i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'FREE'}',
    title: 'Heavy Duty Excavator Model ${i}',
    description: 'High performance excavator suitable for large scale construction.',
    category: 'Construction & Excavation Machinery',
    subCategory: 'Crawler Excavator',
    priceRangeUsd: '$${20000 + i*100} - $${30000 + i*100}',
    unit: 'Unit',
    minOrderQuantity: '1',
    images: ['https://images.unsplash.com/photo-1579541300958-c0b7d3f114c0?w=600&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Operating Weight', value: '20,000 kg' }
    ]
  }`);
  }
  return arr.join(',\n');
};

const generateExcavatorRfqs = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'rfq-exc-${i}',
    buyerId: 'buyer-exc-${i}',
    buyerName: 'Global Excavator Buyer ${i}',
    buyerCompany: 'Global Excavator Buyer ${i}',
    buyerCountry: 'United States',
    buyerVerified: true,
    title: 'Looking for 5 units of Excavators - RFQ ${i}',
    productName: 'Heavy Duty Crawler Excavator',
    category: 'Construction & Excavation Machinery',
    targetQuantity: 5,
    quantityUnit: 'Units',
    status: 'OPEN',
    postedDate: new Date(Date.now() - ${i} * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    detailedRequirements: 'We are looking to purchase 5 units of heavy-duty crawler excavators.',
    targetPriceUsd: 40000,
    preferredIncoterm: 'FOB',
    destinationPort: 'Houston, TX',
    paymentTerms: 'L/C at sight',
    urgency: 'STANDARD',
    quotesCount: ${i % 5}
  }`);
  }
  return arr.join(',\n');
};


const generateWelderCompanies = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'comp-th-weld-${i}',
    companyName: 'Welder Supplier ${i} Co., Ltd.',
    businessType: 'Manufacturer',
    country: 'China',
    establishedYear: ${2000 + (i % 20)},
    totalEmployees: '51 - 100',
    description: 'A trusted manufacturer and supplier of welding machines.',
    trustScore: ${75 + (i % 20)},
    legalRegistrationNumber: 'WELD-${1000 + i}',
    city: 'City ${i}',
    address: 'Address ${i}, China',
    isVerifiedKYC: true,
    responseRate: '95%',
    avgResponseTime: '2 hours',
    annualRevenueUsd: '${(i % 5) + 1}M',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: 'contact${i}@weldersupplier.com',
    tradeAssuranceLimitUsd: ${10000 + (i * 1000)},
    completedOrdersCount: ${10 + i},
    tier: '${i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'FREE'}',
    contactPerson: 'Manager ${i}',
    contactPhone: '+86-555-${1000 + i}'
  }`);
  }
  return arr.join(',\n');
};

const generateWelderBuyers = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'buyer-weld-${i}',
    companyName: 'Global Welder Buyer ${i}',
    legalRegistrationNumber: 'BUY-${2000 + i}',
    country: 'United States',
    city: 'City ${i}',
    address: 'Buyer Address ${i}',
    establishedYear: ${2005 + (i % 15)},
    businessType: 'Corporate Importer',
    tier: '${i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'FREE'}',
    isVerifiedKYC: true,
    trustScore: ${70 + (i % 25)},
    contactPerson: 'Buyer ${i}',
    contactEmail: 'buyer${i}@globalwelder.com',
    contactPhone: '+1-555-000${i}'
  }`);
  }
  return arr.join(',\n');
};

const generateWelderProducts = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'prod-weld-${i}',
    supplierId: 'comp-th-weld-${i}',
    supplierName: 'Welder Supplier ${i} Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: '${i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'FREE'}',
    title: 'Industrial Laser Welder Model ${i}',
    description: 'High precision handheld fiber laser welding machine.',
    category: 'Welding & Soldering Equipment',
    subCategory: 'Laser Welder',
    priceRangeUsd: '$${8000 + i*100} - $${10000 + i*100}',
    unit: 'Unit',
    minOrderQuantity: '1',
    images: ['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80'],
    specifications: [
      { name: 'Laser Power', value: '1500W' }
    ]
  }`);
  }
  return arr.join(',\n');
};

const generateWelderRfqs = () => {
  const arr = [];
  for(let i=0; i<40; i++) {
    arr.push(`  {
    id: 'rfq-weld-${i}',
    buyerId: 'buyer-weld-${i}',
    buyerName: 'Global Welder Buyer ${i}',
    buyerCompany: 'Global Welder Buyer ${i}',
    buyerCountry: 'United States',
    buyerVerified: true,
    title: 'Urgent: Handheld Laser Welders 1500W - RFQ ${i}',
    productName: 'Handheld Fiber Laser Welding Machine',
    category: 'Welding & Soldering Equipment',
    targetQuantity: 10,
    quantityUnit: 'Units',
    status: 'OPEN',
    postedDate: new Date(Date.now() - ${i} * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    detailedRequirements: 'Looking for a reliable manufacturer to supply 10 units of handheld fiber laser welding machines.',
    targetPriceUsd: 8000,
    preferredIncoterm: 'FOB',
    destinationPort: 'Rotterdam',
    paymentTerms: 'L/C at sight',
    urgency: 'URGENT',
    quotesCount: ${i % 5}
  }`);
  }
  return arr.join(',\n');
};


fs.writeFileSync('src/data/excavatorCompanies.ts', `import { CompanyProfile } from '../types';\nexport const GLOBAL_EXCAVATOR_COMPANIES: CompanyProfile[] = [\n${generateExcavatorCompanies()}\n];\n`, 'utf-8');
fs.writeFileSync('src/data/excavatorBuyers.ts', `import { DetailedBuyerProfile } from '../types';\nexport const GLOBAL_EXCAVATOR_BUYER_PROFILES: DetailedBuyerProfile[] = [\n${generateExcavatorBuyers()}\n];\n`, 'utf-8');
fs.writeFileSync('src/data/excavatorProducts.ts', `import { Product } from '../types';\nexport const GLOBAL_EXCAVATOR_PRODUCTS: Product[] = [\n${generateExcavatorProducts()}\n];\n`, 'utf-8');
fs.writeFileSync('src/data/excavatorRfqs.ts', `import { RFQ } from '../types';\nexport const GLOBAL_EXCAVATOR_RFQS: RFQ[] = [\n${generateExcavatorRfqs()}\n];\n`, 'utf-8');

fs.writeFileSync('src/data/welderMachineCompanies.ts', `import { CompanyProfile } from '../types';\nexport const GLOBAL_WELDER_MACHINE_COMPANIES: CompanyProfile[] = [\n${generateWelderCompanies()}\n];\n`, 'utf-8');
fs.writeFileSync('src/data/welderMachineBuyers.ts', `import { DetailedBuyerProfile } from '../types';\nexport const GLOBAL_WELDER_MACHINE_BUYER_PROFILES: DetailedBuyerProfile[] = [\n${generateWelderBuyers()}\n];\n`, 'utf-8');
fs.writeFileSync('src/data/welderMachineProducts.ts', `import { Product } from '../types';\nexport const GLOBAL_WELDER_MACHINE_PRODUCTS: Product[] = [\n${generateWelderProducts()}\n];\n`, 'utf-8');
fs.writeFileSync('src/data/welderMachineRfqs.ts', `import { RFQ } from '../types';\nexport const GLOBAL_WELDER_MACHINE_RFQS: RFQ[] = [\n${generateWelderRfqs()}\n];\n`, 'utf-8');

console.log('All files updated successfully.');
