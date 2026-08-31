import { RfqRequirement } from '../types';

export const GLOBAL_JET_FUEL_RFQS: RfqRequirement[] = [
  // 1. Aviation Jet A-1 Fuel RFQ
  {
    id: 'rfq-th-jf-1',
    buyerId: 'buyer-th-jf-1',
    buyerName: 'Marcus Sterling',
    buyerCompany: 'PetroAir Global Aviation Fuel Consortium',
    buyerCountry: 'United States',
    buyerVerified: true,
    productName: 'Aviation Kerosene Jet Fuel A-1 (ASTM D1655 / JIG Specs)',
    category: 'Petroleum, Oil & Related Products',
    targetQuantity: 2000000,
    quantityUnit: 'Barrels',
    targetPriceUsd: 80,
    preferredIncoterm: 'FOB',
    destinationPort: 'Port of Rotterdam / Houston / Jurong (FOB Dip & Pay)',
    paymentTerms: 'DLC MT700 / Escrow MT103 upon SGS Dip Test',
    urgency: 'URGENT',
    quotesCount: 9,
    postedDate: '2026-08-28',
    expiryDate: '2026-09-30',
    status: 'OPEN',
    matchedSupplierCount: 8,
    detailedRequirements: 'We are direct commercial aviation fuel buyers with verified TSA and pipeline injection credentials. Seeking 2,000,000 Barrels Jet Fuel A-1 for immediate dip test and injection at Port of Rotterdam or Port of Houston shore tanks. Standard ASTM D1655 / DEF STAN 91-091 specifications required. Seller must issue valid Soft Corporate Offer (SCO) and Proof of Product (POP) / TSR for tank-to-tank transfer.'
  },

  // 2. EN590 10PPM Diesel Fuel Allocation RFQ
  {
    id: 'rfq-th-jf-2',
    buyerId: 'buyer-th-jf-2',
    buyerName: 'Henrik Van Der Meer',
    buyerCompany: 'EuroEnergy Logistics B.V.',
    buyerCountry: 'Netherlands',
    buyerVerified: true,
    productName: 'Ultra Low Sulphur Diesel EN590 10PPM (Euro 6)',
    category: 'Petroleum, Oil & Related Products',
    targetQuantity: 100000,
    quantityUnit: 'Metric Tons',
    targetPriceUsd: 535,
    preferredIncoterm: 'FOB',
    destinationPort: 'FOB Rotterdam Tank Terminal / CIF Antwerp',
    paymentTerms: 'Irrevocable DLC / MT103 against SGS Q&Q Certificate',
    urgency: 'STANDARD',
    quotesCount: 14,
    postedDate: '2026-08-25',
    expiryDate: '2026-09-25',
    status: 'OPEN',
    matchedSupplierCount: 12,
    detailedRequirements: 'Procuring 100,000 MT/month of Euro 6 standard EN590 10PPM Diesel Fuel for European commercial fleet network. Require direct refinery title holders or certified mandates with valid Tank Storage Agreement (TSA) or injection authorization. Dip test in Rotterdam shore tanks or CIF discharge with full maritime warranties.'
  }
];
