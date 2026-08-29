import { CompanyProfile } from '../types';

export const ASTRA_COMMODITIES_PROFILE: CompanyProfile = {
  id: 'astra-commodities-llc',
  name: 'Astra Commodities Llc',
  contactPerson: 'Fred Bernard Zaziski',
  contactEmail: 'contact@astracommodities.com',
  contactPhone: '+1 939-214-3022',
  country: 'United States',
  address: '12333 SOWDEN RD STE B PMB 479436, HOUSTON, Texas, United States',
  description: 'Astra Commodities Llc is a bulk exporter specializing in commodities including diesel fuel, metals, and industrial materials.',
  products: [
    { name: 'EN590 10ppm Diesel Fuel', price: 520, minOrder: 10000 },
    { name: 'Copper Cathode 99.99%', price: 11500, minOrder: 25 },
    { name: 'Zinc Ingot SHG 99.995%', price: 3200, minOrder: 25 },
    { name: 'Aluminum Ingot A7 99.7%', price: 2850, minOrder: 25 },
    { name: 'Copper Wire Scrap 99.99%', price: 10800, minOrder: 25 },
    { name: 'Refined White Sugar', price: 0, minOrder: 0 } // Price/minOrder not specified in text
  ]
};
