import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://mcundxmcynpejdtdkacc.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_HtzE605lZLDEQvzXZQuVJA_6i3nv2Yx';
export const STORAGE_BUCKET = 'site-uploads';

// Initialize centralized Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Database record types
export interface DbUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company_name?: string;
  country?: string;
  avatar_url?: string;
  status?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  created_at?: string;
}

export interface DbInquiry {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  product_name?: string;
  status: 'pending' | 'resolved' | string;
  created_at?: string;
}

export interface DbListing {
  id?: string;
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  price?: number | string;
  price_tiers?: any;
  specs?: any;
  image_url?: string;
  moq?: number;
  moq_unit?: string;
  supplier_name?: string;
  supplier_country?: string;
  created_at?: string;
}

export interface DbFaq {
  id?: string;
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

// Fallback seed data for instant visual completeness
export const INITIAL_FAQS: DbFaq[] = [
  {
    id: 'faq-1',
    question: 'How does Trade Heaven Escrow & Trade Assurance protect buyers?',
    answer: 'Buyer deposit funds are held in secure, neutral Swiss escrow accounts. Payment is only released to the supplier once verified shipping documents (Bill of Lading) and independent SGS/TÜV quality inspection reports are confirmed.',
    category: 'Escrow & Payments',
    display_order: 1
  },
  {
    id: 'faq-2',
    question: 'What is the difference between Gold and Silver verified factories?',
    answer: 'Gold suppliers have undergone comprehensive on-site physical factory audits, verified business licenses, environmental compliance, and carry an escrow guarantee of up to $1,000,000 USD. Silver suppliers have completed standard legal KYC and tax verification.',
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
  site_title: 'Trade Heaven - Global B2B Marketplace & Escrow Hub',
  announcement_banner: '⚡ Live Global B2B Trading Hub: $480M+ Active Wholesale RFQs • 100% Swiss Escrow Guaranteed • 0% Platform Fees for Free Registered Accounts',
  support_phone: '+91 8532934479',
  support_email: 'help@tradeheaven.net',
  whatsapp_number: '+91 8532934479',
  headquarters_address: 'Trade Heaven Global Operations & Treasury, Zurich, Switzerland & London, UK',
  escrow_protection_limit: '$1,000,000 USD'
};

// -------------------------------------------------------------
// SUPABASE REAL-TIME DATA HELPER SERVICES
// -------------------------------------------------------------

export const supabaseService = {
  // 1. USERS & PROFILES
  async fetchUsers(): Promise<DbUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase users fetch warning]:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('[Supabase users error]:', err);
      return [];
    }
  },

  async upsertUser(user: DbUser): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        name: user.name,
        email: user.email.toLowerCase().trim(),
        phone: user.phone || '',
        role: user.role || 'BUYER',
        company_name: user.company_name || 'Enterprise Trading Firm',
        country: user.country || 'Global',
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        status: user.status || 'ACTIVE',
        is_verified: user.is_verified ?? false,
        is_premium: user.is_premium ?? false,
        created_at: user.created_at || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .upsert([payload], { onConflict: 'email' })
        .select();

      if (error) {
        // Retry with insert if upsert fails due to missing unique constraint
        const { data: insData, error: insError } = await supabase
          .from('users')
          .insert([payload])
          .select();

        if (insError) {
          return { success: false, error: insError.message };
        }
        return { success: true, data: insData?.[0] };
      }
      return { success: true, data: data?.[0] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save user' };
    }
  },

  // 2. INQUIRIES & LEADS
  async fetchInquiries(): Promise<DbInquiry[]> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase inquiries fetch warning]:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('[Supabase inquiries error]:', err);
      return [];
    }
  },

  async createInquiry(inquiry: Omit<DbInquiry, 'id' | 'created_at'>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        name: inquiry.name,
        email: inquiry.email.toLowerCase().trim(),
        phone: inquiry.phone || '',
        subject: inquiry.subject,
        message: inquiry.message,
        product_name: inquiry.product_name || 'General Wholesale Inquiry',
        status: inquiry.status || 'pending',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('inquiries')
        .insert([payload])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data?.[0] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit inquiry' };
    }
  },

  async updateInquiryStatus(id: string, status: 'pending' | 'resolved' | string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update inquiry status' };
    }
  },

  // 3. STORAGE FILE & IMAGE UPLOADS
  async uploadFile(file: File, pathPrefix: string = 'media'): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${pathPrefix}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.warn('[Supabase storage upload warning]:', uploadError.message);
        // If storage bucket isn't pre-created or RLS prevents upload, create clean data URL fallback
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { success: true, publicUrl: base64Url };
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        publicUrl: data.publicUrl
      };
    } catch (err: any) {
      console.error('[Supabase upload exception]:', err);
      // Fallback
      try {
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { success: true, publicUrl: base64Url };
      } catch {
        return { success: false, error: err?.message || 'Upload failed' };
      }
    }
  },

  // 4. LISTINGS & PRODUCTS
  async fetchListings(): Promise<DbListing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase listings fetch warning]:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('[Supabase listings error]:', err);
      return [];
    }
  },

  async createListing(listing: Omit<DbListing, 'id' | 'created_at'>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        title: listing.title,
        description: listing.description,
        category: listing.category,
        sub_category: listing.sub_category || '',
        price: listing.price || 0,
        price_tiers: listing.price_tiers || null,
        specs: listing.specs || null,
        image_url: listing.image_url || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
        moq: listing.moq || 10,
        moq_unit: listing.moq_unit || 'Units',
        supplier_name: listing.supplier_name || 'Verified Exporter',
        supplier_country: listing.supplier_country || 'Global',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('listings')
        .insert([payload])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data?.[0] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create listing' };
    }
  },

  async deleteListing(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete listing' };
    }
  },

  // 5. DYNAMIC FAQS
  async fetchFaqs(): Promise<DbFaq[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return INITIAL_FAQS;
      }
      return data;
    } catch (err) {
      return INITIAL_FAQS;
    }
  },

  async createFaq(faq: Omit<DbFaq, 'id' | 'created_at'>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const payload = {
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        display_order: faq.display_order || 1,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('faqs')
        .insert([payload])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data?.[0] };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create FAQ' };
    }
  },

  async deleteFaq(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete FAQ' };
    }
  },

  // 6. DYNAMIC SITE SETTINGS
  async fetchSiteSettings(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error || !data || data.length === 0) {
        return { ...INITIAL_SETTINGS };
      }

      const settingsMap: Record<string, string> = { ...INITIAL_SETTINGS };
      data.forEach((row: any) => {
        if (row.key && row.value !== undefined) {
          settingsMap[row.key] = String(row.value);
        }
      });
      return settingsMap;
    } catch (err) {
      return { ...INITIAL_SETTINGS };
    }
  },

  async updateSiteSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key, value, updated_at: new Date().toISOString() }], { onConflict: 'key' });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update setting' };
    }
  }
};
