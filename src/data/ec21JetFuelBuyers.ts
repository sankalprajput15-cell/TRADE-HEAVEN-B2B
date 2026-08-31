import { DetailedBuyerProfile } from '../types';

export const EC21_JET_FUEL_BUYER_PROFILES: DetailedBuyerProfile[] = [
  // 1. PetroAir Global Aviation Fuel Consortium
  {
    id: 'buyer-ec21-jf-1',
    companyName: 'PetroAir Global Aviation Fuel Consortium',
    legalRegistrationNumber: 'REG-US-DE-201831',
    country: 'United States',
    city: 'Houston / Miami International',
    address: 'Aviation Logistics Gateway, Houston Intercontinental District, TX, USA',
    establishedYear: 2018,
    businessType: 'Corporate Importer',
    tier: 'PLATINUM',
    isVerifiedKYC: true,
    trustScore: 99,
    responseRate: '99%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '51 - 100',
    annualPurchasingVolumeUsd: '$250M+',
    preferredPaymentTerms: ['DLC (Documentary Letter of Credit MT700)', 'SBLC (MT760)', 'Escrow MT103 on Dip Test'],
    preferredIncoterms: ['FOB', 'CIF', 'TTO', 'DDP'],
    targetCategories: ['Petroleum, Oil & Related Products', 'A1 Jet Fuel', 'Automotive Diesel EN590'],
    activeRfqsCount: 4,
    completedOrdersCount: 96,
    logoUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff16def?w=200&auto=format&fit=crop&q=80',
    description: 'International aviation fuel procurement syndicate serving commercial airlines, private charter operators, and airport fueling hydrants. Sourcing 2,000,000 to 5,000,000 barrels/month Jet A-1 on FOB Rotterdam / Houston or CIF worldwide airports.',
    contactPerson: 'Marcus Sterling',
    contactEmail: 'm.sterling@petroair-global.com',
    contactPhone: '+1-713-882-9104'
  },

  // 2. EuroEnergy Logistics B.V.
  {
    id: 'buyer-ec21-jf-2',
    companyName: 'EuroEnergy Logistics B.V.',
    legalRegistrationNumber: 'KVK-NL-2017992',
    country: 'Netherlands',
    city: 'Rotterdam Port Terminal',
    address: 'Europoort Petroleum Haven, Rotterdam, Netherlands',
    establishedYear: 2017,
    businessType: 'Wholesale Distributor',
    tier: 'PLATINUM',
    isVerifiedKYC: true,
    trustScore: 98,
    responseRate: '98%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '11 - 50',
    annualPurchasingVolumeUsd: '$180M+',
    preferredPaymentTerms: ['MT103 against SGS Dip Test', 'Irrevocable Confirmed L/C at Sight'],
    preferredIncoterms: ['FOB', 'CIF'],
    targetCategories: ['Petroleum, Oil & Related Products', 'Automotive Diesel EN590', 'Aviation Fuel Oil'],
    activeRfqsCount: 3,
    completedOrdersCount: 78,
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    description: 'Rotterdam-based downstream fuel distribution syndicate with extensive tank farm storage leases. Active buyers of EN590 10ppm diesel (100,000 MT/month) and Virgin Fuel D6 for European grid heating and transportation utilities.',
    contactPerson: 'Henrik Van Der Meer',
    contactEmail: 'henrik@euroenergy-logistics.nl',
    contactPhone: '+31-10-892-3401'
  }
];
