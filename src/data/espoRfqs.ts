import { RfqRequirement } from '../types';

export const GLOBAL_ESPO_RFQS: RfqRequirement[] = [
  // 1. ESPO Blend Crude Oil Allocation RFQ (Rizhao Port China)
  {
    id: 'rfq-th-espo-1',
    buyerId: 'buyer-th-espo-1',
    buyerName: 'John Zhang',
    buyerCompany: 'ZiLex Green Tech International, LLC',
    buyerCountry: 'United States',
    buyerVerified: true,
    productName: 'Eastern Siberian Pacific Ocean (ESPO) Blend Crude Oil',
    category: 'Petroleum, Oil & Related Products',
    targetQuantity: 2000000,
    quantityUnit: 'Barrels',
    targetPriceUsd: 70,
    preferredIncoterm: 'CIF',
    destinationPort: 'CIF Rizhao Port, China (CNRZH) / Qingdao Port',
    paymentTerms: 'Irrevocable Confirmed DLC MT700 / MT103 against CIQ Inspection',
    urgency: 'LONG_TERM_CONTRACT',
    quotesCount: 12,
    postedDate: '2026-08-27',
    expiryDate: '2026-09-30',
    status: 'OPEN',
    matchedSupplierCount: 9,
    detailedRequirements: 'We are direct end-buyer syndicate with signed refinery processing quotas in Shandong, China. Seeking 2,000,000 Barrels per month of authentic ESPO Blend Crude Oil (API 34.8°, sulfur <0.6%) for discharge at Rizhao Port, China (CNRZH). Contract structure: 12-month revolving with R&E. Verified POP, Q&Q SGS loading report, and standard maritime warranties required.'
  },

  // 2. High Grade Petroleum Coke RFQ
  {
    id: 'rfq-th-espo-2',
    buyerId: 'buyer-th-espo-2',
    buyerName: 'James Oh',
    buyerCompany: 'Paseo James Energy Trading Syndicate',
    buyerCountry: 'United States',
    buyerVerified: true,
    productName: 'Anode & Fuel Grade Green Delayed Petroleum Coke',
    category: 'Petroleum, Oil & Related Products',
    targetQuantity: 60000,
    quantityUnit: 'Metric Tons',
    targetPriceUsd: 145,
    preferredIncoterm: 'CIF',
    destinationPort: 'CIF Shanghai / Incheon Port / FOB Houston',
    paymentTerms: '100% Irrevocable LC at Sight MT700',
    urgency: 'STANDARD',
    quotesCount: 8,
    postedDate: '2026-08-26',
    expiryDate: '2026-09-28',
    status: 'OPEN',
    matchedSupplierCount: 6,
    detailedRequirements: 'Urgent requirement for 60,000 MT/month of Green Delayed Petroleum Coke with minimum GCV 8,200 kcal/kg, fixed carbon ≥87%, and sulfur max 2.5%. Bulk carrier shipment to Asian smelting hubs. Direct titleholders and refinery mandates only.'
  }
];
