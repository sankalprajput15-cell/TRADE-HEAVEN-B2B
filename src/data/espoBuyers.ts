import { DetailedBuyerProfile } from '../types';

export const GLOBAL_ESPO_BUYER_PROFILES: DetailedBuyerProfile[] = [
  // 1. ZiLex Green Tech International, LLC (US Buyer for Rizhao Port China)
  {
    id: 'buyer-th-espo-1',
    companyName: 'ZiLex Green Tech International, LLC',
    legalRegistrationNumber: 'REG-US-PA-198421',
    country: 'United States',
    city: 'Pennsylvania / Rizhao Port Discharge Hub',
    address: 'International Trade Corridor, Swarthmore / Philadelphia, PA, USA',
    establishedYear: 1984,
    businessType: 'Corporate Importer',
    tier: 'PLATINUM',
    isVerifiedKYC: true,
    trustScore: 99,
    responseRate: '99%',
    avgResponseTime: '< 1 hour',
    totalEmployees: '51 - 100',
    annualPurchasingVolumeUsd: '$300M+',
    preferredPaymentTerms: ['DLC (Documentary Letter of Credit MT700)', 'Irrevocable SBLC (MT760)', 'Escrow MT103 against CIQ Discharge Port Inspection'],
    preferredIncoterms: ['CIF', 'FOB', 'TTO'],
    targetCategories: ['Petroleum, Oil & Related Products', 'Base Oil', 'Automotive Diesel EN590'],
    activeRfqsCount: 5,
    completedOrdersCount: 142,
    logoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&auto=format&fit=crop&q=80',
    description: 'Corporate energy buyer sourcing 2,000,000 to 4,000,000 Barrels/month of ESPO Crude Oil for major state-owned and independent refineries discharging at Rizhao Port (CNRZH) and Qingdao Port, China. Verified top-tier banking and ready issuance of DLC/SBLC.',
    contactPerson: 'John Zhang',
    contactEmail: 'john.zhang@zilex-greentech.com',
    contactPhone: '+1-610-328-9506'
  },

  // 2. Paseo James Energy Trading Syndicate
  {
    id: 'buyer-th-espo-2',
    companyName: 'Paseo James Energy Trading Syndicate',
    legalRegistrationNumber: 'REG-US-CA-201931',
    country: 'United States',
    city: 'California',
    address: 'Newport Beach Coastal Financial Center, California, USA',
    establishedYear: 2019,
    businessType: 'Corporate Importer',
    tier: 'GOLD',
    isVerifiedKYC: true,
    trustScore: 97,
    responseRate: '97%',
    avgResponseTime: '< 2 hours',
    totalEmployees: '6 - 10',
    annualPurchasingVolumeUsd: '$90M - $200M',
    preferredPaymentTerms: ['DLC at Sight MT700', 'MT103 against SGS inspection'],
    preferredIncoterms: ['FOB', 'CIF'],
    targetCategories: ['Petroleum, Oil & Related Products', 'Bitumen', 'Automotive Diesel EN590'],
    activeRfqsCount: 3,
    completedOrdersCount: 48,
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80',
    description: 'Direct procurement desk for Pacific Rim industrial accounts. Sourcing Petroleum Coke (50,000 MT/month) and EN590 10ppm diesel for delivery to Asian industrial processing plants.',
    contactPerson: 'James Oh',
    contactEmail: 'james.oh@paseojames-org.com',
    contactPhone: '+1-949-241-7782'
  }
];
