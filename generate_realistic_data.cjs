const fs = require('fs');

// --- Helpers ---
const getInc = (i, arr) => arr[i % arr.length];

// --- Data Pools ---
const countries = ['United States', 'Germany', 'Japan', 'China', 'South Korea', 'Italy', 'United Kingdom', 'Canada', 'Australia', 'Brazil'];
const cities = ['Houston', 'Munich', 'Tokyo', 'Shenzhen', 'Seoul', 'Milan', 'London', 'Toronto', 'Sydney', 'Sao Paulo'];
const tiers = ['GOLD', 'SILVER', 'FREE'];
const bizTypesSupplier = ['Manufacturer', 'Trading Company', 'Wholesaler', 'Exporter', 'Corporate Importer'];
const bizTypesBuyer = ['Corporate Importer', 'Wholesale Distributor', 'Retail Chain', 'Government Contractor', 'Trade House'];

// Excavator Pools
const excPre = ['Apex', 'Titan', 'IronTrack', 'Terra', 'HeavyTech', 'Vanguard', 'Prime', 'Solid', 'Goliath', 'Mammoth', 'Rhino', 'Atlas', 'Forge', 'Vulcan', 'Dozer'];
const excSuf = ['Earthmoving', 'Heavy Machinery', 'Equipment', 'Excavation', 'Construct', 'Industries', 'Systems', 'Global'];
const excProdPre = ['Heavy Duty', 'Compact', 'Ultra-Efficient', 'Rugged', 'Next-Gen', 'Advanced', 'Premium', 'Standard'];
const excProdCore = ['Crawler Excavator', 'Mini Excavator', 'Wheeled Excavator', 'Amphibious Excavator', 'Long-Reach Excavator'];
const excProdSuf = ['20-Ton', '3.5-Ton', '5-Ton', '30-Ton', '15-Ton', 'Series X', 'Pro Edition', 'V2'];

// Welder Pools
const weldPre = ['Precision', 'Spark', 'ArcMaster', 'Quantum', 'Fusion', 'WeldTech', 'Plasma', 'LaserCore', 'IronWeld', 'ProWeld', 'Nova', 'Lumi', 'Beam', 'Flux', 'Inert'];
const weldSuf = ['Industrial Lasers', 'Fabrication Systems', 'Welders', 'Technologies', 'Systems', 'Manufacturing', 'Automation', 'Works'];
const weldProdPre = ['Industrial', 'Portable', 'High-Precision', 'Automated', 'Heavy-Duty', 'Compact', 'Pro-Grade', 'Advanced'];
const weldProdCore = ['Fiber Laser Welder', 'MIG/MAG Inverter', 'TIG Welder', 'Submerged Arc Welder', 'Spot Welder', 'Ultrasonic Welder'];
const weldProdSuf = ['1500W', '2000W', '3000W', '315A', '500A', 'Air-Cooled', 'Water-Cooled'];

// RFQ Pools
const rfqVerbs = ['Urgent Need:', 'Looking for', 'Procuring', 'RFQ:', 'Tender for', 'Seeking Supplier for', 'Immediate Purchase:', 'Buying'];
const rfqQ = ['5 units of', '10x', 'Multiple', '1 container of', '2-3 units of', 'Bulk order:', 'Wholesale:'];

const incoterms = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR'];
const payTerms = ['L/C at sight', '30% T/T Deposit + 70% B/L', '100% T/T Advance', 'O/A 30 Days'];

// --- Generators ---
const generateCompany = (category, i) => {
    const isExc = category === 'exc';
    const pre = getInc(i, isExc ? excPre : weldPre);
    const suf = getInc(i, isExc ? excSuf : weldSuf);
    const name = `${pre} ${suf} ${i % 2 === 0 ? 'Corp' : 'LLC'}`;
    const desc = isExc
        ? `Leading provider of ${pre} earthmoving solutions. Specializing in durable ${suf} tailored for harsh environments.`
        : `Top-tier manufacturer of ${pre} welding systems. We deliver cutting-edge ${suf} for precision fabrication.`;

    return `  {
    id: 'comp-th-${category}-${i}',
    companyName: '${name}',
    businessType: '${getInc(i, bizTypesSupplier)}',
    country: '${getInc(i, countries)}',
    establishedYear: ${1990 + (i % 30)},
    totalEmployees: '${i % 2 === 0 ? '51 - 100' : '101 - 500'}',
    description: '${desc}',
    trustScore: ${75 + (i % 25)},
    legalRegistrationNumber: '${category.toUpperCase()}-REG-${10000 + i}',
    city: '${getInc(i, cities)}',
    address: 'Industrial Zone ${i}, ${getInc(i, cities)}',
    isVerifiedKYC: true,
    responseRate: '${90 + (i % 10)}%',
    avgResponseTime: '${1 + (i % 5)} hours',
    annualRevenueUsd: '${1 + (i % 10)}M',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: 'sales@${pre.toLowerCase()}${suf.toLowerCase().split(' ')[0]}.com',
    tradeAssuranceLimitUsd: ${10000 + (i * 2000)},
    completedOrdersCount: ${5 + (i * 3)},
    tier: '${getInc(i, tiers)}',
    contactPerson: 'Director ${pre}',
    contactPhone: '+1-800-555-${1000 + i}'
  }`;
};

const generateBuyer = (category, i) => {
    const isExc = category === 'exc';
    const pre = getInc(i + 5, isExc ? excPre : weldPre); // offset
    const suf = getInc(i + 3, isExc ? excSuf : weldSuf);
    const name = `Global ${pre} Importers ${i % 2 === 0 ? 'Inc' : 'Ltd'}`;

    return `  {
    id: 'buyer-${category}-${i}',
    companyName: '${name}',
    legalRegistrationNumber: 'BUY-${category.toUpperCase()}-${20000 + i}',
    country: '${getInc(i + 1, countries)}',
    city: '${getInc(i + 1, cities)}',
    address: 'Commerce Avenue ${i}, ${getInc(i + 1, cities)}',
    establishedYear: ${1980 + (i % 40)},
    businessType: '${getInc(i, bizTypesBuyer)}',
    tier: '${getInc(i, tiers)}',
    isVerifiedKYC: true,
    trustScore: ${70 + (i % 30)},
    contactPerson: 'Purchasing Head ${i}',
    contactEmail: 'procurement@${pre.toLowerCase()}importers.com',
    contactPhone: '+1-888-000-${2000 + i}'
  }`;
};

const generateProduct = (category, i) => {
    const isExc = category === 'exc';
    const prodPre = getInc(i, isExc ? excProdPre : weldProdPre);
    const prodCore = getInc(i, isExc ? excProdCore : weldProdCore);
    const prodSuf = getInc(i, isExc ? excProdSuf : weldProdSuf);
    const title = `${prodPre} ${prodCore} ${prodSuf}`;

    const desc = isExc
        ? `This ${title} delivers exceptional digging power and fuel efficiency. Built with reinforced steel for maximum durability.`
        : `The ${title} provides stable arcs, deep penetration, and high-speed operation. Ideal for continuous industrial workloads.`;

    const image = isExc
        ? 'https://images.unsplash.com/photo-1579541300958-c0b7d3f114c0?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80';

    const spec1 = isExc ? 'Operating Weight' : 'Output Power';
    const spec1Val = isExc ? `${10 + (i % 20)} Tons` : `${1000 + (i * 100)} W/A`;

    return `  {
    id: 'prod-${category}-${i}',
    supplierId: 'comp-th-${category}-${i}',
    supplierName: '${getInc(i, isExc ? excPre : weldPre)} ${getInc(i, isExc ? excSuf : weldSuf)}',
    supplierCountry: '${getInc(i, countries)}',
    supplierTier: '${getInc(i, tiers)}',
    title: '${title}',
    description: '${desc}',
    category: '${isExc ? 'Construction & Excavation Machinery' : 'Welding & Soldering Equipment'}',
    subCategory: '${prodCore}',
    priceRangeUsd: '$${(isExc ? 20000 : 1000) + i * 500} - $${(isExc ? 30000 : 2000) + i * 500}',
    unit: 'Unit',
    minOrderQuantity: '${1 + (i % 5)}',
    images: ['${image}'],
    specifications: [
      { name: '${spec1}', value: '${spec1Val}' }
    ]
  }`;
};

const generateRfq = (category, i) => {
    const isExc = category === 'exc';
    const prodCore = getInc(i, isExc ? excProdCore : weldProdCore);
    const verb = getInc(i, rfqVerbs);
    const qty = getInc(i, rfqQ);
    const title = `${verb} ${qty} ${prodCore}`;

    const desc = isExc
        ? `We have an upcoming commercial site prep project and urgently need ${prodCore}s. Must meet strict emission standards and have minimal downtime history.`
        : `Scaling up our production line. We require reliable ${prodCore} systems that can operate 24/7. Please provide warranty details.`;

    return `  {
    id: 'rfq-${category}-${i}',
    buyerId: 'buyer-${category}-${i}',
    buyerName: 'Global ${getInc(i + 5, isExc ? excPre : weldPre)} Importers',
    buyerCompany: 'Global ${getInc(i + 5, isExc ? excPre : weldPre)} Importers',
    buyerCountry: '${getInc(i + 1, countries)}',
    buyerVerified: true,
    title: '${title}',
    productName: '${prodCore}',
    category: '${isExc ? 'Construction & Excavation Machinery' : 'Welding & Soldering Equipment'}',
    targetQuantity: ${5 + (i % 20)},
    quantityUnit: 'Units',
    status: 'OPEN',
    postedDate: new Date(Date.now() - ${i} * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + ${10 + (i % 20)} * 24 * 60 * 60 * 1000).toISOString(),
    detailedRequirements: '${desc}',
    targetPriceUsd: ${(isExc ? 30000 : 3000) + (i * 200)},
    preferredIncoterm: '${getInc(i, incoterms)}',
    destinationPort: '${getInc(i, cities)} Port',
    paymentTerms: '${getInc(i, payTerms)}',
    urgency: '${i % 3 === 0 ? 'URGENT' : 'STANDARD'}',
    quotesCount: ${i % 7}
  }`;
};

const run = () => {
    const eComps = []; const eBuy = []; const eProd = []; const eRfq = [];
    const wComps = []; const wBuy = []; const wProd = []; const wRfq = [];

    for(let i=0; i<40; i++) {
        eComps.push(generateCompany('exc', i));
        eBuy.push(generateBuyer('exc', i));
        eProd.push(generateProduct('exc', i));
        eRfq.push(generateRfq('exc', i));

        wComps.push(generateCompany('weld', i));
        wBuy.push(generateBuyer('weld', i));
        wProd.push(generateProduct('weld', i));
        wRfq.push(generateRfq('weld', i));
    }

    fs.writeFileSync('src/data/excavatorCompanies.ts', `import { CompanyProfile } from '../types';\nexport const GLOBAL_EXCAVATOR_COMPANIES: CompanyProfile[] = [\n${eComps.join(',\n')}\n];\n`, 'utf-8');
    fs.writeFileSync('src/data/excavatorBuyers.ts', `import { DetailedBuyerProfile } from '../types';\nexport const GLOBAL_EXCAVATOR_BUYER_PROFILES: DetailedBuyerProfile[] = [\n${eBuy.join(',\n')}\n];\n`, 'utf-8');
    fs.writeFileSync('src/data/excavatorProducts.ts', `import { Product } from '../types';\nexport const GLOBAL_EXCAVATOR_PRODUCTS: Product[] = [\n${eProd.join(',\n')}\n];\n`, 'utf-8');
    fs.writeFileSync('src/data/excavatorRfqs.ts', `import { RFQ } from '../types';\nexport const GLOBAL_EXCAVATOR_RFQS: RFQ[] = [\n${eRfq.join(',\n')}\n];\n`, 'utf-8');

    fs.writeFileSync('src/data/welderMachineCompanies.ts', `import { CompanyProfile } from '../types';\nexport const GLOBAL_WELDER_MACHINE_COMPANIES: CompanyProfile[] = [\n${wComps.join(',\n')}\n];\n`, 'utf-8');
    fs.writeFileSync('src/data/welderMachineBuyers.ts', `import { DetailedBuyerProfile } from '../types';\nexport const GLOBAL_WELDER_MACHINE_BUYER_PROFILES: DetailedBuyerProfile[] = [\n${wBuy.join(',\n')}\n];\n`, 'utf-8');
    fs.writeFileSync('src/data/welderMachineProducts.ts', `import { Product } from '../types';\nexport const GLOBAL_WELDER_MACHINE_PRODUCTS: Product[] = [\n${wProd.join(',\n')}\n];\n`, 'utf-8');
    fs.writeFileSync('src/data/welderMachineRfqs.ts', `import { RFQ } from '../types';\nexport const GLOBAL_WELDER_MACHINE_RFQS: RFQ[] = [\n${wRfq.join(',\n')}\n];\n`, 'utf-8');

    console.log('Realistic data regenerated successfully.');
};

run();
