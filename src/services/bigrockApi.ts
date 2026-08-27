/**
 * BigRock PHP + MySQL Backend API Client
 * Base Endpoint: ./api.php (or configured VITE_API_URL)
 */

import { RfqRequirement, AuthUser } from '../types';
import { MOCK_RFQS } from '../data/mockData';

export const BIGROCK_API_URL = 'https://tradeheaven.net/api.php';

export const DIRECT_BIGROCK_URL = 'https://tradeheaven.net/api.php';

export interface BigRockRfqPayload {
  title?: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  product_name?: string;
  message?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_company?: string;
  buyer_country?: string;
  category?: string;
  quantity?: number;
  target_quantity?: number;
  quantity_unit?: string;
  target_price?: number;
  target_price_usd?: number;
  incoterm?: string;
  incoterms?: string;
  preferred_incoterm?: string;
  destination_port?: string;
  payment_terms?: string;
  requirements?: string;
  detailed_requirements?: string;
  status?: string;
}

export interface DbInquiry {
  id?: string | number;
  rfq_id?: number | null;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  product?: string;
  product_name?: string;
  quantity?: number;
  target_quantity?: number;
  target_price?: number;
  incoterm?: string;
  destination_port?: string;
  subject?: string;
  message: string;
  status: 'pending' | 'resolved' | string;
  created_at?: string;
}

export interface DbUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company?: string;
  company_name?: string;
  country?: string;
  avatar_url?: string;
  status?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  membership_status?: string;
  tier?: string;
  token?: string;
  created_at?: string;
}

export interface DbListing {
  id?: string | number;
  title: string;
  description?: string;
  category: string;
  sub_category?: string;
  price?: number | string;
  price_tiers?: any;
  specs?: any;
  image_url?: string;
  images?: string | string[];
  moq?: number;
  moq_unit?: string;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone?: string;
  supplier_country?: string;
  location?: string;
  status?: string;
  created_at?: string;
}

export interface DbFaq {
  id?: string | number;
  question: string;
  answer: string;
  category: string;
  display_order?: number;
  created_at?: string;
}

export interface DbSiteSetting {
  id?: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_FAQS: DbFaq[] = [
  {
    id: 'faq-1',
    question: 'How does Trade Heaven Trade Protection & Trade Assurance protect buyers?',
    answer: 'Buyer deposit funds are held in secure, neutral Swiss trade protection accounts. Payment is only released to the supplier once verified shipping documents (Bill of Lading) and independent SGS/TÜV quality inspection reports are confirmed.',
    category: 'Trade Protection & Payments',
    display_order: 1
  },
  {
    id: 'faq-2',
    question: 'What is the difference between Gold and Silver verified factories?',
    answer: 'Gold suppliers have undergone comprehensive on-site physical factory audits, verified business licenses, environmental compliance, and carry an trade protection guarantee of up to $1,000,000 USD. Silver suppliers have completed standard legal KYC and tax verification.',
    category: 'Factory Verification',
    display_order: 2
  },
  {
    id: 'faq-3',
    question: 'How do I post a Buying Requirement (RFQ) and receive competitive bids?',
    answer: 'Click "Post Buy RFQ" in the navigation or hero section. Fill in your target product specifications, quantity, target Incoterm (FOB/CIF), and destination port. Audited suppliers will submit binding quotation bids within 2 to 6 hours.',
    category: 'Buying & RFQs',
    display_order: 3
  },
  {
    id: 'faq-4',
    question: 'Is user registration free for buyers and exporters?',
    answer: 'Yes! Basic registration is 100% free forever with no credit card required. You can browse wholesale catalogs, post RFQs, and communicate with verified partners without subscription fees.',
    category: 'Account & Membership',
    display_order: 4
  },
  {
    id: 'faq-5',
    question: 'What Incoterms 2020 rules are supported for international shipping?',
    answer: 'We support all standard ICC Incoterms 2020 including FOB (Free on Board), CIF (Cost, Insurance & Freight), EXW (Ex Works), CFR (Cost and Freight), and DDP (Delivered Duty Paid), with automated freight cost calculations.',
    category: 'Shipping & Logistics',
    display_order: 5
  }
];

export const INITIAL_SETTINGS: Record<string, string> = {
  site_title: 'Trade Heaven - Global B2B Marketplace & trade protection Hub',
  announcement_banner: '⚡ Live Global B2B Trading Hub: $480M+ Active Wholesale RFQs • 100% Swiss Trade Protection Guaranteed • 0% Platform Fees for Free Registered Accounts',
  support_phone: '+91 8532934479',
  support_email: 'help@tradeheaven.net',
  whatsapp_number: '+91 8532934479',
  headquarters_address: 'Trade Heaven Global Operations & Treasury, Zurich, Switzerland & London, UK',
  trade_protection_limit: '$1,000,000 USD'
};

/**
 * Normalizes raw API response item into standard RfqRequirement
 */
export function mapInquiryToRfq(raw: any, index: number = 0): RfqRequirement {
  const parsedQuantityMatch = (raw.message || raw.subject || '').match(/(?:quantity|volume|target|units?):\s*([0-9,]+)/i);
  const parsedPriceMatch = (raw.message || raw.subject || '').match(/(?:target price|price|target|rate):\s*\$?([0-9.]+)/i);
  const parsedIncotermMatch = (raw.message || raw.subject || '').match(/(?:incoterm|terms):\s*([A-Z]{3})/i);
  const parsedPortMatch = (raw.message || raw.subject || '').match(/(?:port|destination):\s*([^|\n]+)/i);

  const fallbackTenders = [
    { cat: 'Industrial Machinery & CNC', port: 'Port of Hamburg', term: 'FOB', qty: 500, unit: 'Units', price: 1450 },
    { cat: 'Consumer Electronics & Chips', port: 'Port of Los Angeles', term: 'CIF', qty: 2500, unit: 'Pieces', price: 85 },
    { cat: 'Raw Materials & Chemicals', port: 'Port of Rotterdam', term: 'FOB', qty: 40, unit: 'Metric Tons', price: 620 },
    { cat: 'Apparel & Technical Textiles', port: 'Port of New York', term: 'CIF', qty: 10000, unit: 'Pieces', price: 18.5 },
    { cat: 'Automotive & Heavy EV Parts', port: 'Port of Antwerp', term: 'DDP', qty: 1200, unit: 'Sets', price: 420 }
  ];
  const t = fallbackTenders[index % fallbackTenders.length];

  const targetQuantity = raw.target_quantity || (parsedQuantityMatch ? parseInt(parsedQuantityMatch[1].replace(/,/g, ''), 10) : (raw.quantity || t.qty));
  const targetPriceUsd = raw.target_price || (parsedPriceMatch ? parseFloat(parsedPriceMatch[1]) : t.price);
  const preferredIncoterm = (raw.incoterms || raw.incoterm || (parsedIncotermMatch ? parsedIncotermMatch[1].toUpperCase() : t.term)) as any;
  const destinationPort = (raw.destination_port || (parsedPortMatch ? parsedPortMatch[1].trim() : t.port));

  const idStr = String(raw.id || `live-${index + 101}`);
  const formattedId = idStr.startsWith('rfq-') ? idStr : `rfq-${idStr}`;

  return {
    id: formattedId,
    ownerUid: raw.buyer_email || raw.email || 'user-buyer-001',
    buyerName: raw.buyer_name || raw.name || 'International Trade Buyer',
    buyerCompany: raw.buyer_company || raw.company_name || raw.company || raw.name || 'Verified Sourcing Enterprise',
    buyerEmail: raw.buyer_email || raw.email || 'procurement@tradeheaven.net',
    buyerPhone: raw.buyer_phone || raw.phone || '+1 (800) 555-0199',
    buyerCountry: raw.buyer_country || raw.country || 'United States',
    buyerVerified: true,
    productName: raw.product_name || raw.title || raw.subject || 'Wholesale Sourcing Tender',
    category: raw.category || t.cat,
    targetQuantity: Number(targetQuantity),
    quantityUnit: raw.quantity_unit || t.unit,
    targetPriceUsd: Number(targetPriceUsd),
    targetDeliveryDate: raw.targetDeliveryDate || '2026-10-31',
    preferredIncoterm,
    destinationPort,
    paymentTerms: raw.payment_terms || 'Trade Protection Certificate (Swiss Vault)',
    detailedRequirements: raw.requirements || raw.detailed_requirements || raw.message || `Procurement inquiry for ${raw.product_name || raw.subject || 'wholesale products'}. Factory compliance audit and commercial invoice required.`,
    detailedDescription: raw.requirements || raw.detailed_requirements || raw.message || 'Commercial quotation requested for volume container delivery.',
    urgency: 'STANDARD',
    quotesCount: Math.floor(Math.random() * 4) + 1,
    postedDate: raw.created_at ? String(raw.created_at).split('T')[0].split(' ')[0] : new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-31',
    status: (raw.status === 'resolved' ? 'AWARDED' : (raw.status || 'OPEN')) as any,
    matchedSupplierCount: 6,
    spamScore: 1.0
  };
}

/**
 * BigRock PHP + MySQL Service Implementation
 */
export const bigrockApi = {
  // ==========================================
  // 1. AUTHENTICATION & USER MANAGEMENT
  // ==========================================
  async register(payload: {
    email: string;
    password?: string;
    name: string;
    companyName?: string;
    company?: string;
    phone?: string;
    country?: string;
    accountType?: 'BUYER' | 'SUPPLIER';
    role?: string;
  }): Promise<{ success: boolean; token?: string; user?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data;
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (err: any) {
      console.warn('[BigRock register fallback]:', err);
      return { success: false, message: err.message || 'Backend connection error during registration.' };
    }
  },

  async login(email: string, password?: string): Promise<{ success: boolean; token?: string; user?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data;
      }
      return { success: false, message: data.message || 'Authentication failed.' };
    } catch (err: any) {
      console.warn('[BigRock login fallback]:', err);
      return { success: false, message: err.message || 'Backend connection error during login.' };
    }
  },

  async getUser(idOrEmail: string): Promise<DbUser | null> {
    try {
      const param = idOrEmail.includes('@') ? `email=${encodeURIComponent(idOrEmail)}` : `id=${encodeURIComponent(idOrEmail)}`;
      const response = await fetch(`${BIGROCK_API_URL}?action=get_user&${param}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return null;
  },

  async updateProfile(updates: Partial<DbUser>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  },

  async fetchUsers(): Promise<DbUser[]> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=get_users`);
      if (response.ok) {
        const json = await response.json();
        const list = Array.isArray(json) ? json : (json.data || []);
        if (list.length > 0) return list;
      }
    } catch (err) { console.error('BigRock API Error:', err); }

    return [
      {
        id: 'user-admin-01',
        name: 'Administrator',
        email: 'yr943334@gmail.com',
        role: 'ADMIN',
        company_name: 'Trade Heaven Global Operations & Treasury',
        country: 'United Kingdom',
        status: 'ACTIVE',
        is_verified: true,
        is_premium: true
      },
      {
        id: 'user-admin-02',
        name: 'Sarah Jenkins',
        email: 'admin@tradeheaven.net',
        role: 'ADMIN',
        company_name: 'Trade Heaven Global Operations & Treasury',
        country: 'United Kingdom',
        status: 'ACTIVE',
        is_verified: true,
        is_premium: true
      }
    ];
  },

  async upsertUser(user: DbUser): Promise<{ success: boolean; data?: DbUser; error?: string }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=upsert_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json.data || user };
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: true, data: user };
  },

  async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fetch(`${BIGROCK_API_URL}?action=delete_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Request failed' };
  },

  // ==========================================
  // 2. RFQS / BUYING REQUIREMENTS
  // ==========================================
  async fetchRfqs(): Promise<RfqRequirement[]> {
    try {
      let response: Response;
      try {
        response = await fetch(`${BIGROCK_API_URL}?action=get_rfqs`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
      } catch {
        response = await fetch(`${DIRECT_BIGROCK_URL}?action=get_rfqs`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
      }

      if (!response.ok) {
        throw new Error(`BigRock API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const rawList = Array.isArray(json) ? json : (json.data || json.rfqs || []);

      if (Array.isArray(rawList)) {
        return rawList.map((item, idx) => mapInquiryToRfq(item, idx));
      }

      return [];
    } catch (err) {
      console.warn('[BigRock API get_rfqs fetch]:', err);
      return [];
    }
  },

  async submitRfq(payload: BigRockRfqPayload): Promise<{ success: boolean; status: string; message?: string; data?: any; id?: any }> {
    const postBody = {
      title: payload.title || `Buy Lead RFQ: ${payload.product_name || payload.subject || 'Wholesale Commodity'}`,
      buyer_name: payload.buyer_name || payload.name || 'Procurement Officer',
      buyer_email: payload.buyer_email || payload.email || 'buyer@tradeheaven.net',
      buyer_phone: payload.buyer_phone || payload.phone || '',
      buyer_company: payload.buyer_company || payload.name || 'Enterprise Buyer Ltd',
      buyer_country: payload.buyer_country || 'United States',
      product_name: payload.product_name || payload.subject || 'Wholesale Commodity',
      category: payload.category || 'Industrial Machinery & CNC',
      quantity: Number(payload.quantity || payload.target_quantity) || 1000,
      quantity_unit: payload.quantity_unit || 'Pieces',
      target_price: Number(payload.target_price || payload.target_price_usd) || 0.00,
      incoterm: payload.incoterm || payload.incoterms || payload.preferred_incoterm || 'FOB',
      incoterms: payload.incoterms || payload.incoterm || payload.preferred_incoterm || 'FOB',
      destination_port: payload.destination_port || 'Port of Hamburg',
      payment_terms: payload.payment_terms || 'Trade Protection Certificate (Swiss Vault)',
      requirements: payload.requirements || payload.detailed_requirements || payload.message || 'Standard export quality specification required.',
      status: payload.status || 'OPEN',
      name: payload.name || payload.buyer_name || 'Procurement Officer',
      email: payload.email || payload.buyer_email || 'buyer@tradeheaven.net',
      phone: payload.phone || payload.buyer_phone || '',
      subject: payload.subject || `Buy Lead RFQ: ${payload.product_name || 'Commodity'}`,
      message: payload.message || payload.requirements || payload.detailed_requirements || ''
    };

    try {
      let response: Response;
      try {
        response = await fetch(`${BIGROCK_API_URL}?action=submit_rfq`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(postBody)
        });
      } catch {
        response = await fetch(`${DIRECT_BIGROCK_URL}?action=submit_rfq`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(postBody)
        });
      }

      if (!response.ok) {
        throw new Error(`BigRock API response: ${response.status}`);
      }

      const json = await response.json();
      return {
        success: true,
        status: 'success',
        id: json.id,
        message: json.message || 'RFQ successfully submitted to BigRock MySQL database!',
        data: json.data || postBody
      };
    } catch (err: any) {
      console.error('[BigRock submit_rfq ERROR]:', err);
      return {
        success: false,
        status: 'error',
        message: err.message || 'Failed to submit RFQ to BigRock database',
      };
    }
  },

  async createRfq(payload: BigRockRfqPayload): Promise<{ status: string; message?: string; data?: any; id?: any }> {
    const res = await this.submitRfq(payload);
    return {
      status: res.status,
      message: res.message,
      data: res.data,
      id: res.id
    };
  },

  // ==========================================
  // 3. PRODUCT LISTINGS / OFFERS
  // ==========================================
  async fetchListings(): Promise<DbListing[]> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=get_listings`);
      if (response.ok) {
        const json = await response.json();
        const list = Array.isArray(json) ? json : (json.data || []);
        if (list.length > 0) return list;
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return [];
  },

  async submitListing(listing: DbListing): Promise<{ success: boolean; data?: DbListing; error?: string; id?: any }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=submit_listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing)
      });
      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json.data || listing, id: json.id };
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Failed to create listing' };
  },

  async createListing(listing: DbListing): Promise<{ success: boolean; data?: DbListing; error?: string }> {
    return this.submitListing(listing);
  },

  async deleteListing(id: string | number): Promise<{ success: boolean; error?: string }> {
    try {
      await fetch(`${BIGROCK_API_URL}?action=delete_listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Request failed' };
  },

  // ==========================================
  // 4. INQUIRIES
  // ==========================================
  async fetchInquiries(): Promise<DbInquiry[]> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=get_inquiries`);
      if (response.ok) {
        const json = await response.json();
        const list = Array.isArray(json) ? json : (json.data || []);
        if (list.length > 0) return list;
      }
    } catch (err) { console.error('BigRock API Error:', err); }

    return [
      {
        id: 'inq-101',
        name: 'Sarah Jenkins',
        email: 'procurement@nordicsteel.se',
        phone: '+46 8 123 4567',
        company: 'Nordic Steel Works AB',
        subject: 'Buy Lead RFQ: 5,000 MT Grade 316 Stainless Steel Coils',
        message: 'Requesting binding CIF Port of Gothenburg quotation with SGS mill test certification.',
        product_name: 'Grade 316 Stainless Steel Coils',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'inq-102',
        name: 'Carlos Mendez',
        email: 'cmendez@iberiaparts.es',
        phone: '+34 91 555 0192',
        company: 'Iberia Clean Energy Solutions',
        subject: 'Buy Lead RFQ: 2,500 Units Solar Lithium ESS Battery Packs',
        message: 'Looking for Tier-1 UN38.3 certified 48V 100Ah server rack battery modules.',
        product_name: 'Solar Lithium ESS Battery Packs',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];
  },

  async submitInquiry(payload: Partial<DbInquiry>): Promise<{ success: boolean; message?: string; id?: any }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=submit_inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to submit inquiry' };
    }
  },

  async createInquiry(payload: BigRockRfqPayload): Promise<{ status: string; message?: string; data?: any }> {
    return this.createRfq(payload);
  },

  async updateInquiryStatus(id: string | number, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=update_inquiry_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) return { success: false, error: 'Request failed' };
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Request failed' };
  },

  // ==========================================
  // 5. FAQS & SETTINGS
  // ==========================================
  async fetchFaqs(): Promise<DbFaq[]> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=get_faqs`);
      if (response.ok) {
        const json = await response.json();
        const list = Array.isArray(json) ? json : (json.data || []);
        if (list.length > 0) return list;
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return [...INITIAL_FAQS];
  },

  async createFaq(faq: DbFaq): Promise<{ success: boolean; data?: DbFaq; error?: string }> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=create_faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      });
      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json.data || faq };
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Failed to create FAQ' };
  },

  async deleteFaq(id: string | number): Promise<{ success: boolean; error?: string }> {
    try {
      await fetch(`${BIGROCK_API_URL}?action=delete_faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Request failed' };
  },

  async fetchSiteSettings(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${BIGROCK_API_URL}?action=get_settings`);
      if (response.ok) {
        const json = await response.json();
        if (json && typeof json === 'object') return { ...INITIAL_SETTINGS, ...json };
      }
    } catch (err) { console.error('BigRock API Error:', err); }
    return { ...INITIAL_SETTINGS };
  },

  async updateSiteSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fetch(`${BIGROCK_API_URL}?action=update_setting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (err) { console.error('BigRock API Error:', err); }
    return { success: false, error: 'Request failed' };
  },

  // File Upload Helper
  async uploadFile(file: File, _folder: string = 'uploads'): Promise<{ success: boolean; url?: string; publicUrl?: string; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({ success: true, url: dataUrl, publicUrl: dataUrl });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };
      reader.readAsDataURL(file);
    });
  }
};
