/**
 * Trade4Deals / Trade Heaven - Pure REST API Client
 *
 * Requirements:
 * 1. getRfqs(): Fetches `./api.php?action=get_rfqs`, safely unwraps `res.data || []`.
 * 2. submitRfq(rfq): POSTs raw JSON with `headers: { 'Content-Type': 'application/json' }`
 *    to `./api.php?action=submit_rfq`, validates `res.status === 'success'`, and returns `{ success: true, data: res.data }`.
 * 3. Never overrides `window.fetch`.
 */

import { RFQ, Product, AuthUser } from '../types';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  id?: number | string;
  token?: string;
  user?: AuthUser;
}

export interface RawRFQPayload {
  title?: string;
  category?: string;
  quantity?: string | number;
  unit?: string;
  targetPrice?: string | number;
  incoterms?: string;
  destinationPort?: string;
  specifications?: string;
  buyer_name?: string;
  buyer_country?: string;
  buyer_email?: string;
  buyer_company?: string;
  buyer_phone?: string;
  // Alternative aliases for maximum cross-compatibility
  product_name?: string;
  quantity_unit?: string;
  target_price?: number | string;
  incoterm?: string;
  destination_port?: string;
  requirements?: string;
  status?: string;
}

export interface RawListingPayload {
  title: string;
  category?: string;
  sub_category?: string;
  price?: string;
  moq?: number;
  moq_unit?: string;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone?: string;
  supplier_country?: string;
  location?: string;
  description?: string;
  images?: string[] | string;
  image_url?: string;
  status?: string;
}

const API_BASE = typeof window !== 'undefined' && window.location
  ? `${window.location.origin}/api.php`
  : 'https://tradeheaven.net/api.php';

export const apiClient = {
  /**
   * Fetch live CMS Site Content from the backend API.
   * Uses ./api.php?action=get_content
   */
  async getSiteContent(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=get_content&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: json.status === 'success' || json.success === true, data: json.data || json.siteContent, message: json.message };
    } catch (e: any) {
      console.warn('[apiClient] getSiteContent error:', e);
      return { success: false, message: e.message || 'Failed to fetch site content' };
    }
  },

  /**
   * Update live CMS Site Content via the backend API.
   * Uses ./api.php?action=save_content
   */
  async saveSiteContent(payload: any): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=save_content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ siteContent: payload })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: json.status === 'success' || json.success === true, message: json.message || 'Updated successfully' };
    } catch (e: any) {
      console.error('[apiClient] saveSiteContent error:', e);
      return { success: false, message: e.message || 'Failed to save site content' };
    }
  },
  /**
   * Fetch all active RFQ buying leads from MySQL backend via ./api.php?action=get_rfqs
   * Safely unwraps res.data || [] (always returns an array, never null or string)
   */
  async getRfqs(): Promise<RFQ[]> {
    try {
      const res = await fetch(`${API_BASE}?action=get_rfqs`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json' 
        },
        cache: 'no-cache'
      });

      if (!res.ok) {
        return [];
      }

      const json: ApiResponse<RFQ[]> = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (e) {
      console.warn('[apiClient] getRfqs network error, returning empty list:', e);
      return [];
    }
  },

  /**
   * Submit an RFQ to MySQL database via ./api.php?action=submit_rfq
   * POSTs raw JSON with 'Content-Type': 'application/json', validates status === 'success',
   * and returns { success: true, data: res.data }
   */
  async submitRfq(payload: RawRFQPayload): Promise<{ success: boolean; data?: RFQ; message?: string }> {
    try {
      // Normalize payload with both schema standards
      const normalizedPayload = {
        title: payload.title || payload.product_name || 'Wholesale Product',
        category: payload.category || 'Industrial Machinery & CNC',
        quantity: String(payload.quantity || '1000'),
        unit: payload.unit || payload.quantity_unit || 'Pieces',
        targetPrice: String(payload.targetPrice ?? payload.target_price ?? '0'),
        incoterms: payload.incoterms || payload.incoterm || 'FOB',
        destinationPort: payload.destinationPort || payload.destination_port || 'Port of Hamburg',
        specifications: payload.specifications || payload.requirements || 'Standard export specifications.',
        buyer_name: payload.buyer_name || 'Procurement Officer',
        buyer_country: payload.buyer_country || 'United States',
        buyer_email: payload.buyer_email || 'buyer@tradeheaven.net',
        buyer_company: payload.buyer_company || payload.buyer_name || 'Enterprise Trading Firm',
        buyer_phone: payload.buyer_phone || ''
      };

      const res = await fetch(`${API_BASE}?action=submit_rfq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(normalizedPayload)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP status ${res.status}`);
      }

      const json = await res.json();
      if (json && json.status === 'success' && json.data) {
        return { success: true, data: json.data, message: json.message };
      }

      return { success: false, message: json.message || 'Failed to record RFQ into MySQL database.' };
    } catch (e: any) {
      console.error('[apiClient] submitRfq error:', e);
      return { success: false, message: e.message || 'Network communication failure with database.' };
    }
  },

  /**
   * Fetch all supplier product listings from MySQL
   */
  async getListings(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}?action=get_listings`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });
      if (!res.ok) return [];
      const json: ApiResponse<any[]> = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        return json.data.map(item => ({
          id: `prod-db-${item.id}`,
          title: item.title,
          category: item.category || 'General',
          subCategory: item.sub_category || 'Industrial Equipment',
          images: [item.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
          moq: Number(item.moq || 1),
          moqUnit: item.moq_unit || 'Pieces',
          priceTiers: [
            { minUnits: Number(item.moq || 1), priceUsd: Number(item.price || 100) }
          ],
          supportedIncoterms: ['FOB', 'CIF', 'EXW'] as any,
          portOfDispatch: item.location || 'Port of Shanghai',
          leadTimeDays: 14,
          supplyAbilityPerMonth: '50,000 Units',
          packagingDetails: 'Standard seaworthy export packaging',
          supplierId: `supp-${item.id}`,
          supplierName: item.supplier_name || 'Verified Exporter',
          supplierCountry: item.supplier_country || 'China',
          supplierTier: 'GOLD' as any,
          supplierTrustScore: 95,
          sampleAvailable: true,
          samplePriceUsd: 50,
          certifications: ['ISO 9001:2015', 'CE Certified'],
          customizationAvailable: true,
          featured: true,
          createdDate: new Date().toISOString().split('T')[0],
          hsCode: '8457.10.00',
          warrantyMonths: 24,
          isFeatured: true,
          specifications: [
            { name: 'Category', value: item.category || 'General' },
            { name: 'MOQ', value: `${item.moq || 1} ${item.moq_unit || 'Pieces'}` }
          ],
          description: item.description || item.title
        }));
      }
      return [];
    } catch (e) {
      console.warn('[apiClient] getListings error:', e);
      return [];
    }
  },

  /**
   * Submit a product listing to MySQL
   */
  async submitListing(payload: RawListingPayload): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=submit_listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const json = await res.json();
      return { success: json.status === 'success', data: json.data, message: json.message };
    } catch (e: any) {
      console.error('[apiClient] submitListing error:', e);
      return { success: false, message: e.message || 'Failed to submit listing' };
    }
  },

  /**
   * Authenticate user with corporate email and password
   */
  async login(
    email: string,
    password?: string
  ): Promise<{ success: boolean; data?: any; token?: string; user?: AuthUser; error?: string; message?: string }> {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { success: false, error: 'Both corporate email and password are required.', message: 'Both corporate email and password are required.' };
      }

      // 1. Authenticate via Express API Auth Endpoint
      try {
        const authRes = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: cleanEmail, password })
        });
        const authJson = await authRes.json();
        if (authRes.ok && authJson.success && authJson.user) {
          const user = authJson.user;
          const token = authJson.token || user.token;
          try {
          } catch {}

          return {
            success: true,
            token,
            data: user,
            user,
            message: authJson.message || 'Authenticated successfully.'
          };
        }
      } catch {
        // Fallback to local service verification if server endpoint unreachable
      }

      const res = await fetch(`${API_BASE}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const json = await res.json().catch(() => ({}));
      const isSuccess = res.ok && (json.status === 'success' || json.success === true);

      if (isSuccess && (json.user || json.data)) {
        const rawUser = json.user || json.data;
        const isAdmin = rawUser.role === 'ADMIN' || rawUser.isVerifiedAdmin === true || cleanEmail === 'yr943334@gmail.com';
        const isSupplier = String(rawUser.role).toUpperCase() === 'SUPPLIER';
        const normalizedUser: AuthUser = {
          id: String(rawUser.id || `user-${Date.now()}`),
          name: rawUser.name || (isAdmin ? 'Administrator' : 'Trade Partner'),
          email: rawUser.email || cleanEmail,
          role: (isAdmin ? 'ADMIN' : (isSupplier ? 'SUPPLIER' : 'BUYER')),
          isPremium: isAdmin,
          membershipStatus: isAdmin ? 'paid' : 'free',
          status: rawUser.status || 'ACTIVE',
          isVerified: Boolean(rawUser.isVerified ?? true),
          isVerifiedAdmin: isAdmin,
          tier: isAdmin ? 'VIP' : 'FREE',
          companyName: rawUser.companyName || rawUser.company_name || (isAdmin ? 'Trade Heaven Global Operations & Treasury' : 'Enterprise Trading Firm'),
          country: rawUser.country || (isAdmin ? 'United Kingdom' : 'United States'),
          phone: rawUser.phone || '',
          avatarUrl: rawUser.avatarUrl || (isAdmin ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'),
          token: json.token || rawUser.token
        };

        try {
        } catch {}

        return { 
          success: true, 
          token: json.token, 
          data: json.data || normalizedUser, 
          user: normalizedUser, 
          message: json.message || 'Authenticated successfully' 
        };
      }

      const errMsg = json.message || json.error || 'Invalid email or password';
      return { success: false, error: errMsg, message: errMsg };
    } catch (e: any) {
      const errMsg = e.message || 'Login connection failure';
      return { success: false, error: errMsg, message: errMsg };
    }
  },

  /**
   * Register new B2B user account
   */
  async register(payload: {
    name: string;
    email: string;
    password?: string;
    company_name?: string;
    companyName?: string;
    phone?: string;
    phoneOrWhatsapp?: string;
    country?: string;
    role?: string;
    accountType?: 'BUYER' | 'SUPPLIER';
  }): Promise<{ success: boolean; data?: any; token?: string; user?: AuthUser; error?: string; message?: string }> {
    try {
      const cleanEmail = (payload.email || '').trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: 'Email address is required.', message: 'Email address is required.' };
      }

      const company = (payload.company_name || payload.companyName || 'Enterprise Trading Firm').trim();
      const phone = (payload.phone || payload.phoneOrWhatsapp || '').trim();
      const resolvedRole = (payload.accountType === 'SUPPLIER' || payload.role === 'supplier' || payload.role === 'SUPPLIER') ? 'supplier' : 'buyer';

      const requestPayload = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: (payload.name || 'Trade Partner').trim(),
        email: cleanEmail,
        password: payload.password || '',
        company_name: company,
        companyName: company,
        phone: phone,
        phoneOrWhatsapp: phone,
        country: (payload.country || 'United States').trim(),
        role: resolvedRole,
        accountType: resolvedRole === 'supplier' ? 'SUPPLIER' : 'BUYER'
      };

      const res = await fetch(`${API_BASE}?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      const json = await res.json().catch(() => ({}));
      const isSuccess = res.ok && (json.status === 'success' || json.success === true);

      if (isSuccess && (json.user || json.data)) {
        const rawUser = json.user || json.data;
        const isAdmin = rawUser.role === 'ADMIN' || cleanEmail === 'yr943334@gmail.com';
        const isSupplier = resolvedRole === 'supplier';
        const normalizedUser: AuthUser = {
          id: String(rawUser.id || `user-${Date.now()}`),
          name: rawUser.name || requestPayload.name,
          email: rawUser.email || cleanEmail,
          role: isAdmin ? 'ADMIN' : (isSupplier ? 'SUPPLIER' : 'BUYER'),
          isPremium: isAdmin,
          membershipStatus: isAdmin ? 'paid' : 'free',
          status: 'ACTIVE',
          isVerified: true,
          isVerifiedAdmin: isAdmin,
          tier: isAdmin ? 'VIP' : 'FREE',
          companyName: company,
          country: requestPayload.country,
          phone: phone,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          token: json.token || rawUser.token
        };

        try {
        } catch {}

        return { 
          success: true, 
          token: json.token, 
          data: json.data || normalizedUser, 
          user: normalizedUser, 
          message: json.message || 'Account successfully registered!' 
        };
      }

      const errMsg = json.message || json.error || 'Registration failed';
      return { success: false, error: errMsg, message: errMsg };
    } catch (e: any) {
      const errMsg = e.message || 'Registration connection error';
      return { success: false, error: errMsg, message: errMsg };
    }
  }
};
