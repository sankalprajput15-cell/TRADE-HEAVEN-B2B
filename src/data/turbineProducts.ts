import { Product } from '../types';

export const GLOBAL_TURBINE_PRODUCTS: Product[] = [
  {
    id: 'prod-th-turb-01',
    supplierId: 'comp-th-turb-01',
    supplierName: 'Jianglian Heavy Industry Group Co., Ltd',
    supplierCountry: 'China',
    supplierTier: 'VIP',
    supplierTrustScore: 98,
    supplierIsVerified: true,
    title: 'Industrial High-Pressure Steam Turbine & Generator Set (5MW - 50MW)',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Turbines & Power Plant Equipment',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$180,000 - $850,000 / Set',
    unit: 'Sets',
    fobPriceUsd: 250000,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 45,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of boiler, pressure vessels, power plant, EPC, ESP, turbine, generator, biomass boiler, MSW boiler, waste recovery boiler, CFB. High-efficiency condensing and extraction steam turbines designed for biomass, municipal solid waste, and industrial captive power plants. Grade A Boiler and ASME certified.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 280000 },
      { minUnits: 3, maxUnits: 5, priceUsd: 230000 },
      { minUnits: 6, priceUsd: 180000 }
    ],
    specifications: [
      { name: 'Power Output Range', value: '5 MW to 50 MW' },
      { name: 'Inlet Steam Pressure', value: '3.43 MPa - 9.8 MPa' },
      { name: 'Inlet Steam Temperature', value: '435°C - 540°C' },
      { name: 'Rated Rotation Speed', value: '3000 / 3600 RPM' },
      { name: 'Turbine Type', value: 'Condensing / Extraction / Back-Pressure' },
      { name: 'Efficiency Rating', value: 'Over 88.5%' }
    ],
    certifications: ['Grade A Boiler License', 'ASME Stamp', 'ISO 9001:2015', 'CE Certification', 'TH Verified']
  },
  {
    id: 'prod-th-turb-02',
    supplierId: 'comp-th-turb-02',
    supplierName: 'Vogi International Trading Co., Ltd',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 92,
    supplierIsVerified: true,
    title: 'Steam Turbine DCS Vibration Monitoring Module & PLC Control Card System',
    category: 'Electronic & Electrical Supplies',
    subCategory: 'Industrial Automation & Controls',
    minOrderQuantity: '1 Piece',
    priceRangeUsd: '$450 - $2,800 / Piece',
    unit: 'Pieces',
    fobPriceUsd: 850,
    moq: 1,
    moqUnit: 'Pieces',
    leadTimeDays: 7,
    sampleAvailable: true,
    samplePriceUsd: 450,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of PLC module, DCS card, ESD system card, vibration monitoring module, turbine control parts. High reliability replacement control cards and vibration telemetry modules for steam turbine governors and emergency trip systems.',
    priceTiers: [
      { minUnits: 1, maxUnits: 10, priceUsd: 850 },
      { minUnits: 11, maxUnits: 50, priceUsd: 680 },
      { minUnits: 51, priceUsd: 450 }
    ],
    specifications: [
      { name: 'Compatibility', value: 'Bently Nevada, ABB, Emerson Ovation, Foxboro' },
      { name: 'Signal Type', value: 'Eddy Current Probe / 4-20mA / Modbus RS485' },
      { name: 'Response Time', value: '< 5 ms' },
      { name: 'Operating Temp', value: '-20°C to +70°C' }
    ],
    certifications: ['ISO 9001:2015', 'CE Industrial Automation', 'TH Verified']
  },
  {
    id: 'prod-th-turb-03',
    supplierId: 'comp-th-turb-03',
    supplierName: 'Dongfang Yoyik Engineering Co Ltd',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    supplierIsVerified: true,
    title: 'Hydro Turbine Generator Spare Parts & High-Pressure Hydraulic Filter Element',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Hydro Turbines & Power Spares',
    minOrderQuantity: '2 Pieces',
    priceRangeUsd: '$120 - $1,400 / Piece',
    unit: 'Pieces',
    fobPriceUsd: 320,
    moq: 2,
    moqUnit: 'Pieces',
    leadTimeDays: 10,
    sampleAvailable: true,
    samplePriceUsd: 150,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of hydro turbines, filter elements, hydrogen oil water system, sealing compounds. Specialized in precision replacement parts for Francis, Pelton, and Kaplan hydro turbines, turbine lube oil filter elements, and hydrogen-oil-water sealing rings.',
    priceTiers: [
      { minUnits: 2, maxUnits: 20, priceUsd: 320 },
      { minUnits: 21, maxUnits: 100, priceUsd: 220 },
      { minUnits: 101, priceUsd: 120 }
    ],
    specifications: [
      { name: 'Filtration Precision', value: '1μm, 3μm, 5μm, 10μm, 20μm' },
      { name: 'Filter Media', value: 'Stainless Steel Mesh / Inorganic Micro-Glassfiber' },
      { name: 'Collapse Pressure', value: '21 MPa' },
      { name: 'Application', value: 'Hydro Turbine EH Oil System & Generator Bearings' }
    ],
    certifications: ['ISO 9001:2015', 'Power Plant Equipment Certification', 'TH Verified']
  },
  {
    id: 'prod-th-turb-04',
    supplierId: 'comp-th-turb-04',
    supplierName: 'Mountain Air Insurance Services',
    supplierCountry: 'United States',
    supplierTier: 'GOLD',
    supplierTrustScore: 95,
    supplierIsVerified: true,
    title: 'Commercial Turbine Aircraft Hull & Liability Risk Insurance Underwriting Policy',
    category: 'Services - Business & Financial',
    subCategory: 'Aviation & Turbine Insurance',
    minOrderQuantity: '1 Policy',
    priceRangeUsd: '$3,500 - $45,000 / Annual Policy',
    unit: 'Policies',
    fobPriceUsd: 6500,
    moq: 1,
    moqUnit: 'Policies',
    leadTimeDays: 3,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519074069444-1ba4eae16e6e?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of Aviation Insurance, FBO Insurance, Aerial Spraying Insurance, Small Jet Insurance, Helicopter Insurance, Aviation Repair Shop Insurance, Turbine Aircraft Insurance. Tailored comprehensive underwriting solutions for turboprop aircraft, corporate jet fleets, and aviation maintenance hubs.',
    priceTiers: [
      { minUnits: 1, maxUnits: 5, priceUsd: 6500 },
      { minUnits: 6, maxUnits: 20, priceUsd: 5200 },
      { minUnits: 21, priceUsd: 3500 }
    ],
    specifications: [
      { name: 'Coverage Types', value: 'All-Risk Ground & Flight Hull, Third-Party Liability' },
      { name: 'Turbine Aircraft Types', value: 'Turboprop (King Air, Pilatus, Cessna Caravan), Turbofan Jets' },
      { name: 'Limit Coverage', value: 'Up to $50,000,000 USD Liability' },
      { name: 'Jurisdiction', value: 'FAA / US Domestic & International Flight Corridors' }
    ],
    certifications: ['Licensed Surplus Lines Broker', 'FAA / DOT Compliance', 'TH Verified']
  },
  {
    id: 'prod-th-turb-05',
    supplierId: 'comp-th-turb-05',
    supplierName: 'Flstronic',
    supplierCountry: 'Korea',
    supplierTier: 'GOLD',
    supplierTrustScore: 96,
    supplierIsVerified: true,
    title: 'Digital High-Precision Liquid & Gas Turbine Flow Meter (SS316 / Explosion-Proof)',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Turbine Flow Meters & Instrumentation',
    minOrderQuantity: '1 Unit',
    priceRangeUsd: '$280 - $1,650 / Unit',
    unit: 'Units',
    fobPriceUsd: 480,
    moq: 1,
    moqUnit: 'Units',
    leadTimeDays: 10,
    sampleAvailable: true,
    samplePriceUsd: 280,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Flowmeter, Water flow meter, Turbine flow meter, Oil flow meter. FLSTRONIC is a precision manufacturer specializing in Turbine Flow Meters and Positive Displacement Meters. Integrated production with digital pulse output, RS485 Modbus, and 4-20mA current loop.',
    priceTiers: [
      { minUnits: 1, maxUnits: 5, priceUsd: 480 },
      { minUnits: 6, maxUnits: 30, priceUsd: 360 },
      { minUnits: 31, priceUsd: 280 }
    ],
    specifications: [
      { name: 'Accuracy', value: '±0.5% (Optionally ±0.2%)' },
      { name: 'Body Material', value: 'Stainless Steel 316 / 304' },
      { name: 'Nominal Diameter', value: 'DN4 - DN200' },
      { name: 'Medium', value: 'Water, Fuel, Solvents, Diesel, Cryogenic Liquids' },
      { name: 'Output', value: 'Pulse / 4-20mA / RS485 Modbus / HART' }
    ],
    certifications: ['ISO 9001:2015', 'CE MID Directive', 'KTL Calibration', 'TH Verified']
  },
  {
    id: 'prod-th-turb-06',
    supplierId: 'comp-th-turb-06',
    supplierName: 'Craig & Rupert Denis Limited',
    supplierCountry: 'Russia',
    supplierTier: 'GOLD',
    supplierTrustScore: 91,
    supplierIsVerified: true,
    title: 'Industrial Heavy-Duty Gas Turbine Power Generator (10MW - 25MW)',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Gas Turbines & Power Sets',
    minOrderQuantity: '1 Unit',
    priceRangeUsd: '$650,000 - $2,900,000 / Unit',
    unit: 'Units',
    fobPriceUsd: 850000,
    moq: 1,
    moqUnit: 'Units',
    leadTimeDays: 60,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of GAS TURBINE GENERATORS, KEROSENE, MAZUT, TIMBER, SUNFLOWER OIL, CRAB, SEAFOOD. Turnkey industrial gas turbine power generating applications for petroleum refineries, remote mining sites, and continuous baseline electrical grids.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 850000 },
      { minUnits: 3, priceUsd: 720000 }
    ],
    specifications: [
      { name: 'Fuel Compatibility', value: 'Natural Gas, Diesel, Dual-Fuel, Kerosene' },
      { name: 'Continuous Output', value: '10 MW - 25 MW' },
      { name: 'Thermal Efficiency', value: '38.5% Simple Cycle / 52% Combined Cycle' },
      { name: 'Exhaust Temperature', value: '510°C' }
    ],
    certifications: ['GOST-R Compliance', 'EAC Conformity', 'TH Verified']
  },
  {
    id: 'prod-th-turb-07',
    supplierId: 'comp-th-turb-07',
    supplierName: 'Nantong R&X Energy Technology Co., Ltd',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 95,
    supplierIsVerified: true,
    title: 'Spiral Maglev Vertical Axis Wind Turbine Generator (1kW / 3kW / 5kW / 10kW)',
    category: 'Electrical Equipment & Components',
    subCategory: 'Wind Turbines & Wind Generators',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$380 - $2,400 / Set',
    unit: 'Sets',
    fobPriceUsd: 620,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 12,
    sampleAvailable: true,
    samplePriceUsd: 380,
    images: [
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of wind turbine, wind generator. Low start-up wind speed (1.3 m/s), ultra-quiet helical 3-blade vertical wind turbine with three-phase coreless permanent magnet generator. Designed for residential rooftop, telecom station, and streetlighting hybrid systems.',
    priceTiers: [
      { minUnits: 1, maxUnits: 5, priceUsd: 620 },
      { minUnits: 6, maxUnits: 20, priceUsd: 480 },
      { minUnits: 21, priceUsd: 380 }
    ],
    specifications: [
      { name: 'Start-Up Wind Speed', value: '1.3 m/s' },
      { name: 'Rated Wind Speed', value: '11 m/s' },
      { name: 'Survival Wind Speed', value: '45 m/s' },
      { name: 'Blade Material', value: 'Reinforced Carbon Fiber / FRP' },
      { name: 'Generator Type', value: '3-Phase AC Permanent Magnet Maglev' },
      { name: 'Lifespan', value: '20+ Years' }
    ],
    certifications: ['ISO 9001:2015', 'CE Wind Power Directive', 'RoHS', 'TH Verified']
  },
  {
    id: 'prod-th-turb-08',
    supplierId: 'comp-th-turb-08',
    supplierName: 'Renval Global Company',
    supplierCountry: 'Egypt',
    supplierTier: 'GOLD',
    supplierTrustScore: 92,
    supplierIsVerified: true,
    title: 'Commercial Wind Turbine & Solar Hybrid Power Plant Solutions (50kW - 500kW)',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Renewable Power Plants & Turbines',
    minOrderQuantity: '1 System',
    priceRangeUsd: '$18,000 - $140,000 / System',
    unit: 'Systems',
    fobPriceUsd: 35000,
    moq: 1,
    moqUnit: 'Systems',
    leadTimeDays: 25,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of Sugar, Poultry, Chicken Meat, Renewable Energy, Solar Panels, Wind Turbines, Iron, Steel, Metal Products, Food Commodities, Grains. Turnkey utility and commercial-grade wind turbine farms coupled with high-output solar arrays and smart grid controllers.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 35000 },
      { minUnits: 3, maxUnits: 10, priceUsd: 26000 },
      { minUnits: 11, priceUsd: 18000 }
    ],
    specifications: [
      { name: 'System Capacity', value: '50 kW to 500 kW Hybrid' },
      { name: 'Turbine Rotor Diameter', value: '14m - 28m' },
      { name: 'Tower Height', value: '18m - 36m Monopole Steel Tower' },
      { name: 'Grid Coupling', value: '3-Phase 380V / 480V Synchronous Inverter' }
    ],
    certifications: ['ISO 9001:2015', 'COMESA Trade Verified', 'TH Verified']
  },
  {
    id: 'prod-th-turb-09',
    supplierId: 'comp-th-turb-09',
    supplierName: 'Dalian Wills Machine Co., Ltd',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 93,
    supplierIsVerified: true,
    title: 'Precision Machined Wind Turbine Rotor Hub & Structural Foundation Flange',
    category: 'Metal & Metal Products',
    subCategory: 'Wind Turbine Castings & Structural Parts',
    minOrderQuantity: '5 Pieces',
    priceRangeUsd: '$850 - $4,200 / Piece',
    unit: 'Pieces',
    fobPriceUsd: 1400,
    moq: 5,
    moqUnit: 'Pieces',
    leadTimeDays: 20,
    sampleAvailable: true,
    samplePriceUsd: 900,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of mechanical, wind turbine, Prefab house. Dalian Wills Machine specializes in ductile iron QT400-18AL / QT350-22L low-temperature impact resistant wind turbine rotor hubs, main frames, and CNC machined foundation flanges.',
    priceTiers: [
      { minUnits: 5, maxUnits: 20, priceUsd: 1400 },
      { minUnits: 21, maxUnits: 50, priceUsd: 1100 },
      { minUnits: 51, priceUsd: 850 }
    ],
    specifications: [
      { name: 'Material Grade', value: 'Ductile Iron QT400-18AL, Forged 42CrMo4 Alloy' },
      { name: 'Low Temp Impact', value: 'Charpy V-Notch ≥12J at -20°C / -40°C' },
      { name: 'CNC Precision', value: 'Tolerance within ±0.015 mm' },
      { name: 'Non-Destructive Testing', value: '100% Ultrasonic & Magnetic Particle Inspection' }
    ],
    certifications: ['ISO 9001:2015', 'TUV Rheinland Audited', 'TH Verified']
  },
  {
    id: 'prod-th-turb-10',
    supplierId: 'comp-th-turb-10',
    supplierName: 'Huijue Solar',
    supplierCountry: 'China',
    supplierTier: 'VIP',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'High-Voltage Wind Turbine Hybrid Energy Storage Inverter & LiFePO4 Battery System',
    category: 'Electrical Equipment & Components',
    subCategory: 'Turbine Battery Storage & Inverters',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$4,200 - $32,000 / Set',
    unit: 'Sets',
    fobPriceUsd: 8500,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 4500,
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of solar inverter, battery, solar panel, wind turbine, solar system, LiFePO4, generators. Smart grid-interactive power conditioning system that converts wild AC power from wind turbines into stabilized pure sine wave electricity while managing high-cycle LiFePO4 battery banks.',
    priceTiers: [
      { minUnits: 1, maxUnits: 3, priceUsd: 8500 },
      { minUnits: 4, maxUnits: 10, priceUsd: 6200 },
      { minUnits: 11, priceUsd: 4200 }
    ],
    specifications: [
      { name: 'Rated Capacity', value: '30kW / 50kW / 100kW / 250kW' },
      { name: 'Battery Chemistry', value: 'Tier 1 LiFePO4 (6000+ Cycles at 80% DOD)' },
      { name: 'Grid Frequency', value: '50Hz / 60Hz Auto Sensing' },
      { name: 'Protection Class', value: 'IP65 Outdoor Enclosure' }
    ],
    certifications: ['IEC 61215/61730', 'UL 1741', 'ISO 9001/14001', 'TUV SUD', 'TH Verified']
  },
  {
    id: 'prod-th-turb-11',
    supplierId: 'comp-th-turb-11',
    supplierName: 'Guangxi Qianyun International Trading Co., Ltd',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 93,
    supplierIsVerified: true,
    title: 'Off-Grid Wind & Solar Hybrid Streetlighting System with Micro Wind Turbine (400W-800W)',
    category: 'Lighting & Lighting Accessories',
    subCategory: 'Solar & Wind Street Lights',
    minOrderQuantity: '10 Sets',
    priceRangeUsd: '$160 - $480 / Set',
    unit: 'Sets',
    fobPriceUsd: 240,
    moq: 10,
    moqUnit: 'Sets',
    leadTimeDays: 10,
    sampleAvailable: true,
    samplePriceUsd: 200,
    images: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Solar Generation System, Solar Light, Solar Streetlighting system, wind turbine. Self-sustaining highway and municipal street lighting powered by an integrated vertical/horizontal low-wind turbine and monocrystalline solar module.',
    priceTiers: [
      { minUnits: 10, maxUnits: 50, priceUsd: 240 },
      { minUnits: 51, maxUnits: 200, priceUsd: 190 },
      { minUnits: 201, priceUsd: 160 }
    ],
    specifications: [
      { name: 'Wind Turbine Power', value: '400W - 800W' },
      { name: 'Solar PV Power', value: '150W - 300W Monocrystalline' },
      { name: 'LED Lumens', value: '10,000 - 18,000 LM Ultra-Bright' },
      { name: 'Pole Height', value: '6m - 10m Hot-Dip Galvanized' }
    ],
    certifications: ['CE', 'RoHS', 'ISO 9001:2015', 'TH Verified']
  },
  {
    id: 'prod-th-turb-12',
    supplierId: 'comp-th-turb-12',
    supplierName: 'Harbin Tinvo Import & Export Trading Company',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 92,
    supplierIsVerified: true,
    title: 'Natural Gas & Heavy Diesel Turbine Backup Generator Set (500kW - 2500kW)',
    category: 'Electrical Equipment & Components',
    subCategory: 'Diesel & Gas Turbine Generators',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$48,000 - $220,000 / Set',
    unit: 'Sets',
    fobPriceUsd: 75000,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 30,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of wind turbine, generator, solar panel, diesel generator, natural gas generator, controller, inverter, gasoline generator. Rapid-start industrial emergency backup generator system engineered for continuous power at industrial factories, hospitals, and mining sites.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 75000 },
      { minUnits: 3, maxUnits: 5, priceUsd: 58000 },
      { minUnits: 6, priceUsd: 48000 }
    ],
    specifications: [
      { name: 'Prime Output', value: '500 kW to 2,500 kW' },
      { name: 'Engine Type', value: 'Turbocharged Intercooled Heavy Duty' },
      { name: 'Controller', value: 'DeepSea / SmartGen Automatic Synchronizing' },
      { name: 'Sound Level', value: 'Super Silent Canopy ≤ 72 dBA at 7m' }
    ],
    certifications: ['ISO 9001:2015', 'GOST Standard', 'TH Verified']
  },
  {
    id: 'prod-th-turb-13',
    supplierId: 'comp-th-turb-13',
    supplierName: 'Dalian KSK Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    supplierIsVerified: true,
    title: 'Heavy Marine & Wind Turbine Ductile Iron Castings and Large Pump Valves',
    category: 'Metal & Metal Products',
    subCategory: 'Marine & Turbine Castings',
    minOrderQuantity: '1 Metric Ton',
    priceRangeUsd: '$1,800 - $3,200 / Metric Ton',
    unit: 'Metric Tons',
    fobPriceUsd: 2100,
    moq: 1,
    moqUnit: 'Metric Tons',
    leadTimeDays: 25,
    sampleAvailable: true,
    samplePriceUsd: 300,
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of ship building, machine tool, wind turbine, pump valve. KSK delivers high-specification ductile iron (GGG40 / EN-GJS-400-18U-LT) and copper alloy castings up to 25 tons per single piece for offshore wind turbine structures and marine pump assemblies.',
    priceTiers: [
      { minUnits: 1, maxUnits: 10, priceUsd: 2100 },
      { minUnits: 11, maxUnits: 50, priceUsd: 1950 },
      { minUnits: 51, priceUsd: 1800 }
    ],
    specifications: [
      { name: 'Casting Standards', value: 'EN 1563, ASTM A536, ISO 1083' },
      { name: 'Max Single Weight', value: '25,000 kg (25 Metric Tons)' },
      { name: 'Inspection', value: '3.1 Material Certificate, 100% UT/MT/RT testing' },
      { name: 'Applications', value: 'Wind Turbine Bedplates, Marine Valves, Gear Housings' }
    ],
    certifications: ['ISO 9001:2015', 'DNV GL Foundry Approval', 'Bureau Veritas (BV)', 'TH Verified']
  },
  {
    id: 'prod-th-turb-14',
    supplierId: 'comp-th-turb-14',
    supplierName: 'Yueqing Zonhan Windpower Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'VIP',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'High-Reliability Horizontal Axis Wind Turbine Generator (2kW - 20kW Grid-Tie & Off-Grid)',
    category: 'Electrical Equipment & Components',
    subCategory: 'Wind Turbines & Generators',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$850 - $6,500 / Set',
    unit: 'Sets',
    fobPriceUsd: 1650,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 950,
    images: [
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of wind turbine, wind generator, micro hydro turbine, solar power system. Over 25 years of proven reliability. Features pitch-control overspeed braking, neodymium permanent magnet direct-drive alternator, and weatherproof IP65 nacelle.',
    priceTiers: [
      { minUnits: 1, maxUnits: 3, priceUsd: 1650 },
      { minUnits: 4, maxUnits: 15, priceUsd: 1200 },
      { minUnits: 16, priceUsd: 850 }
    ],
    specifications: [
      { name: 'Rated Power', value: '2kW, 5kW, 10kW, 20kW models' },
      { name: 'Rated Wind Speed', value: '9.0 m/s' },
      { name: 'Generator Type', value: 'Direct Drive NdFeB Permanent Magnet Synchronous' },
      { name: 'Braking Method', value: 'Electromagnetic + Mechanical Aerodynamic Furling' }
    ],
    certifications: ['ISO 9001', 'CE Wind Machinery Directive', 'IEC 61400-2', 'TH Verified']
  },
  {
    id: 'prod-th-turb-15',
    supplierId: 'comp-th-turb-15',
    supplierName: 'Tianjin Baozhong Electromechanical Equipment Technology Co.',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    supplierIsVerified: true,
    title: 'Blast Furnace Top Gas Recovery Turbine (TRT) & High-Pressure Axial Blower',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Turbines & Blast Furnace Equipment',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$120,000 - $680,000 / Set',
    unit: 'Sets',
    fobPriceUsd: 220000,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 50,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Air Compressors, Steam Turbines, Blast Furnace Blowers, general mechanical components, turbine generator sets, desulfurization equipment, ventilators, and EPCC comprehensive contracting projects. Pioneering energy recovery from steel blast furnace exhaust gas.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 220000 },
      { minUnits: 3, priceUsd: 180000 }
    ],
    specifications: [
      { name: 'Gas Flow Capacity', value: '50,000 - 350,000 Nm³/h' },
      { name: 'Inlet Gas Pressure', value: '0.15 - 0.28 MPa' },
      { name: 'Power Generation Output', value: '3,000 kW to 25,000 kW' },
      { name: 'Turbine Configuration', value: 'Multi-stage Reaction / Impulse Expander' }
    ],
    certifications: ['ISO 9001:2015', 'Pressure Vessel License', 'TH Verified']
  },
  {
    id: 'prod-th-turb-16',
    supplierId: 'comp-th-turb-16',
    supplierName: 'Tianjin Baozhong Machinery & Electrical Equipment Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'VIP',
    supplierTrustScore: 96,
    supplierIsVerified: true,
    title: 'Turnkey EPCC Industrial Steam Turbine Generator & Flue Gas Desulfurization Power Set',
    category: 'Industrial Machinery & Plants',
    subCategory: 'EPC Steam Turbines & Power Plants',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$250,000 - $1,200,000 / Set',
    unit: 'Sets',
    fobPriceUsd: 380000,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 60,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Air Compressors, Steam Turbines, Blast Furnace Blowers, general mechanical components, turbine generator sets, desulfurization equipment, ventilators, and EPCC comprehensive contracting projects. High efficiency thermal cycle with low emissions.',
    priceTiers: [
      { minUnits: 1, maxUnits: 2, priceUsd: 380000 },
      { minUnits: 3, priceUsd: 310000 }
    ],
    specifications: [
      { name: 'Turbine Capacity', value: '10 MW to 60 MW' },
      { name: 'Design Code', value: 'API 611 / API 612 / ASME PTC 6' },
      { name: 'Desulfurization Efficiency', value: '≥ 98.5% FGD compliance' },
      { name: 'Governor Control', value: 'Digital Electro-Hydraulic Control (DEH)' }
    ],
    certifications: ['ISO 9001:2015', 'CE Steam Turbine', 'CNAS Accredited', 'TH Verified']
  },
  {
    id: 'prod-th-turb-17',
    supplierId: 'comp-th-turb-17',
    supplierName: 'Kaifeng Chuangxin Measurement & Control Instrument Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 95,
    supplierIsVerified: true,
    title: 'Explosion-Proof Stainless Steel Gas & Liquid Turbine Flowmeter Sensor (DN15 - DN300)',
    category: 'Industrial Machinery & Plants',
    subCategory: 'Process Control Flowmeters',
    minOrderQuantity: '1 Piece',
    priceRangeUsd: '$190 - $1,150 / Piece',
    unit: 'Pieces',
    fobPriceUsd: 340,
    moq: 1,
    moqUnit: 'Pieces',
    leadTimeDays: 7,
    sampleAvailable: true,
    samplePriceUsd: 220,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of flowmeter, electromagnetic flowmeter, turbine flowmeter, vortex flowmeter. Turbine Flowmeter, Orifice Flowmeter, Metal Float Flowmeter, Ultrasonic Flowmeter, Swirlmeter. Designed for oil extraction, natural gas pipelines, and chemical batching.',
    priceTiers: [
      { minUnits: 1, maxUnits: 10, priceUsd: 340 },
      { minUnits: 11, maxUnits: 50, priceUsd: 260 },
      { minUnits: 51, priceUsd: 190 }
    ],
    specifications: [
      { name: 'Explosion Proof Rating', value: 'Ex d II C T6 Gb' },
      { name: 'Pressure Rating', value: '1.6 MPa, 2.5 MPa, 4.0 MPa, 6.3 MPa' },
      { name: 'Repeatability', value: '±0.05% - 0.2%' },
      { name: 'Display', value: 'LCD Dual Line: Instantaneous + Cumulative Flow' }
    ],
    certifications: ['ISO 9001:2015', 'Exd II CT6 Explosion Proof', 'SIL2', 'TH Verified']
  },
  {
    id: 'prod-th-turb-18',
    supplierId: 'comp-th-turb-18',
    supplierName: 'Zonhan New Energy Company Limited',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 94,
    supplierIsVerified: true,
    title: 'Micro Pelton & Turgo Hydro Water Turbine Generator (500W - 15kW)',
    category: 'Electrical Equipment & Components',
    subCategory: 'Hydro Turbines & Water Power',
    minOrderQuantity: '1 Set',
    priceRangeUsd: '$420 - $2,900 / Set',
    unit: 'Sets',
    fobPriceUsd: 780,
    moq: 1,
    moqUnit: 'Sets',
    leadTimeDays: 10,
    sampleAvailable: true,
    samplePriceUsd: 480,
    images: [
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of wind turbine, solar panels, water turbine, hydro turbine. Compact, high-efficiency Pelton wheel and Turgo runner micro hydro generators for rural streams, mountain homes, and off-grid eco lodges.',
    priceTiers: [
      { minUnits: 1, maxUnits: 5, priceUsd: 780 },
      { minUnits: 6, maxUnits: 20, priceUsd: 590 },
      { minUnits: 21, priceUsd: 420 }
    ],
    specifications: [
      { name: 'Water Head Range', value: '15m to 120m' },
      { name: 'Flow Rate', value: '2 L/s to 45 L/s' },
      { name: 'Voltage Output', value: '110V / 220V / 380V Pure AC' },
      { name: 'Runner Material', value: 'Cast Stainless Steel 304/316' }
    ],
    certifications: ['ISO 9001:2015', 'CE Certified', 'RoHS', 'TH Verified']
  },
  {
    id: 'prod-th-turb-19',
    supplierId: 'comp-th-turb-19',
    supplierName: 'Wuxi Maoshi Technology Co., Ltd.',
    supplierCountry: 'China',
    supplierTier: 'GOLD',
    supplierTrustScore: 96,
    supplierIsVerified: true,
    title: 'Inconel 713C Superalloy Turbocharger Turbine Wheel & Rotor Shaft Assembly',
    category: 'Automotive & Motorcycle Parts',
    subCategory: 'Turbocharger & Turbine Wheels',
    minOrderQuantity: '10 Pieces',
    priceRangeUsd: '$35 - $185 / Piece',
    unit: 'Pieces',
    fobPriceUsd: 65,
    moq: 10,
    moqUnit: 'Pieces',
    leadTimeDays: 14,
    sampleAvailable: true,
    samplePriceUsd: 50,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Manufacturer of Turbine Wheel Shaft. Precision vacuum investment casting using aerospace-grade Inconel 713C and 42CrMo high-tensile shaft, friction welded and dynamic high-speed VSR balanced up to 250,000 RPM.',
    priceTiers: [
      { minUnits: 10, maxUnits: 100, priceUsd: 65 },
      { minUnits: 101, maxUnits: 500, priceUsd: 48 },
      { minUnits: 501, priceUsd: 35 }
    ],
    specifications: [
      { name: 'Turbine Blade Alloy', value: 'Inconel 713C (Ni-Cr Superalloy)' },
      { name: 'Shaft Material', value: '42CrMo Alloy Steel' },
      { name: 'Balancing Standard', value: 'ISO 1940 Dynamic Balance G0.4' },
      { name: 'Temperature Resistance', value: 'Up to 980°C Exhaust Gas' }
    ],
    certifications: ['IATF 16949', 'ISO 9001:2015', 'TH Verified']
  },
  {
    id: 'prod-th-turb-20',
    supplierId: 'comp-th-turb-20',
    supplierName: 'Petroleum Trade',
    supplierCountry: 'Kazakhstan',
    supplierTier: 'VIP',
    supplierTrustScore: 97,
    supplierIsVerified: true,
    title: 'Aviation Turbine Fuel Jet A-1 & TS-1 (Refinery Direct Commercial Export Offer)',
    category: 'Chemicals & Allied Products',
    subCategory: 'Aviation Fuel & Turbine Kerosene',
    minOrderQuantity: '100,000 Barrels',
    priceRangeUsd: '$78 - $95 / BBL',
    unit: 'Barrels',
    fobPriceUsd: 84,
    moq: 100000,
    moqUnit: 'Barrels',
    leadTimeDays: 14,
    sampleAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Supplier of Aviation Turbine Jet Fuel. Genuine refinery Soft Corporate Offer (SCO) for Aviation Turbine Fuel (Jet A-1, TS-1, Colonial Grade 54 JP54). Available for FOB Rotterdam, FOB Houston, FOB Fujairah, and CIF World Ports. Rigorous SGS testing at loading port.',
    priceTiers: [
      { minUnits: 100000, maxUnits: 500000, priceUsd: 84 },
      { minUnits: 500001, maxUnits: 2000000, priceUsd: 80 },
      { minUnits: 2000001, priceUsd: 78 }
    ],
    specifications: [
      { name: 'Specification Standard', value: 'ASTM D1655 / DEF STAN 91-091 Check List Issue' },
      { name: 'Flash Point', value: 'Min 38.0°C' },
      { name: 'Freezing Point', value: 'Max -47.0°C (Jet A-1) / Max -50.0°C (TS-1)' },
      { name: 'Total Acidity', value: 'Max 0.015 mg KOH/g' },
      { name: 'Specific Gravity at 15°C', value: '0.775 - 0.840 kg/m³' }
    ],
    certifications: ['ASTM D1655', 'DEF STAN 91-091', 'SGS Batch Tested', 'TH Verified']
  }
];
