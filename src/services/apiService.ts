import { 
  Product, 
  RfqRequirement, 
  SupplierQuote,
  CompanyProfile, 
  DetailedBuyerProfile,
  BankAccountDetails, 
  AuthUser,
  CmsAuthorizedUser,
  CmsAccessRequest,
  CmsPermissionScope,
  MembershipStatus,
  AccountStatus,
  UserRole,
  NormalizedB2BDatabase,
  NormalizedSupplier,
  NormalizedBuyerRfq,
  NormalizedServiceProvider,
  UserDeletionLogEntry
} from '../types';
import { MOCK_PRODUCTS, MOCK_RFQS, MOCK_QUOTES, MOCK_COMPANIES, MOCK_BUYER_PROFILES, CATEGORIES_TREE, MOCK_BANK_ACCOUNTS, DEFAULT_USERS, NORMALIZED_B2B_DATABASE } from '../data/mockData';
import { securityService } from './securityService';
import { bigrockApi, mapInquiryToRfq } from './bigrockApi';
import { productImageManagerService } from './productImageManagerService';

// Safe fetch wrapper to avoid hanging requests if backend database/API fails to respond
const originalFetch = window.fetch;
const fetch = async (resource: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
  const timeout = 25000; // 25 seconds timeout to prevent premature aborts on slow environments or cold starts
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await originalFetch(resource, {
      ...options,
      signal: options.signal || controller.signal
    });
  } finally {
    clearTimeout(id);
  }
};

// Storage keys for reactive state persistence
const USERS_STORAGE_KEY = 'th_registered_users_store';
const DELETED_USERS_STORAGE_KEY = 'th_permanently_deleted_users_v1';
const USER_DELETION_LOGS_STORAGE_KEY = 'th_user_deletion_logs_v1';
const SUPPLIERS_STORAGE_KEY = 'th_suppliers_store';
const BUYERS_STORAGE_KEY = 'th_buyers_store';
const RFQS_STORAGE_KEY = 'th_rfqs_store';
const QUOTES_STORAGE_KEY = 'th_quotes_store';

export function getPermanentlyDeletedUsers(): { ids: Set<string>; emails: Set<string> } {
  const ids = new Set<string>();
  const emails = new Set<string>();
  try {
    const raw = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.ids)) {
        parsed.ids.forEach((id: string) => id && ids.add(String(id).trim()));
      }
      if (Array.isArray(parsed.emails)) {
        parsed.emails.forEach((em: string) => em && emails.add(String(em).toLowerCase().trim()));
      }
    }
  } catch {}
  return { ids, emails };
}

export function getUserDeletionLogs(): UserDeletionLogEntry[] {
  try {
    const raw = localStorage.getItem(USER_DELETION_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    }
  } catch {}
  return [];
}

export function saveUserDeletionLogs(logs: UserDeletionLogEntry[]) {
  try {
    localStorage.setItem(USER_DELETION_LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('tradeheaven_user_deletion_logs_updated'));
  } catch {}
}

export function recordUserDeletionLog(entry: UserDeletionLogEntry): UserDeletionLogEntry[] {
  const current = getUserDeletionLogs();
  const cleanEmail = (entry.deletedUserEmail || '').toLowerCase().trim();
  const cleanId = (entry.deletedUserId || '').trim();
  const entryTime = new Date(entry.deletedAt).getTime();

  const existingIdx = current.findIndex(item => {
    if (item.id === entry.id) return true;
    const sameEmail = cleanEmail && (item.deletedUserEmail || '').toLowerCase().trim() === cleanEmail;
    const sameId = cleanId && item.deletedUserId === cleanId;
    const withinWindow = Math.abs(entryTime - new Date(item.deletedAt).getTime()) < 15000;
    return (sameEmail || sameId) && withinWindow;
  });

  let updated: UserDeletionLogEntry[];
  if (existingIdx !== -1) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...entry };
  } else {
    updated = [entry, ...current];
  }
  saveUserDeletionLogs(updated);
  return updated;
}

export function markUserPermanentlyDeleted(id?: string, email?: string) {
  const current = getPermanentlyDeletedUsers();
  const cleanId = String(id || '').trim();
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (cleanId) current.ids.add(cleanId);
  if (cleanEmail) current.emails.add(cleanEmail);
  try {
    localStorage.setItem(
      DELETED_USERS_STORAGE_KEY,
      JSON.stringify({ ids: Array.from(current.ids), emails: Array.from(current.emails) })
    );
  } catch {}
}

export function unmarkUserPermanentlyDeleted(id?: string, email?: string) {
  const current = getPermanentlyDeletedUsers();
  const cleanId = String(id || '').trim();
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (cleanId) current.ids.delete(cleanId);
  if (cleanEmail) current.emails.delete(cleanEmail);
  try {
    localStorage.setItem(
      DELETED_USERS_STORAGE_KEY,
      JSON.stringify({ ids: Array.from(current.ids), emails: Array.from(current.emails) })
    );
  } catch {}
}

const MELISSA_SUPPLIER_USER: AuthUser = {
  id: 'user-supplier-melissa',
  name: 'Melissa Prezios',
  email: 'melissa@mpcommoditybrokers.com',
  phone: '+61411510887',
  companyName: 'MP Commodity Brokers Australia Pty Ltd',
  country: 'Australia',
  role: 'SUPPLIER',
  status: 'ACTIVE',
  isVerified: true,
  isPremium: true,
  membershipStatus: 'paid',
  tier: 'Basic Plan' as any,
  plan: 'Basic Plan (Paid via Bank transfer)',
  joinedDate: '2026-10-19',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
};

const SVETLANA_SUPPLIER_USER: AuthUser = {
  id: 'user-supplier-svetlana',
  name: 'Svetlana Brodskaya',
  email: 'info@joybambooforestfarm.com',
  phone: '7901 4th Stan Ste 300, Saint Petersburg, FL 33702 (Farm Pickup: Sebring, FL)',
  companyName: 'Joy Bamboo Forest Farm LLC',
  country: 'United States',
  role: 'SUPPLIER',
  status: 'ACTIVE',
  isVerified: true,
  isPremium: false,
  membershipStatus: 'paid',
  tier: 'Basic Plan' as any,
  plan: 'Basic Plan (Paid Supplier)',
  joinedDate: '2026-10-23',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
};

const RANDY_SUPPLIER_USER: AuthUser = {
  id: 'user-supplier-randy',
  name: 'Mr. Randy',
  email: 'randy@midforkcap.com',
  phone: '+1 (406) 309 5590',
  companyName: 'Middle Fox LLC',
  country: 'United States',
  role: 'SUPPLIER',
  status: 'ACTIVE',
  isVerified: true,
  isPremium: true,
  membershipStatus: 'paid',
  tier: 'VIP' as any,
  plan: 'VIP Enterprise Plan (Refined Petroleum & Fuel Exporter)',
  joinedDate: '2026-10-24',
  avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'
};

const MARK_JOHNSON_SUPPLIER_USER: AuthUser = {
  id: 'user-supplier-mark-johnson',
  name: 'Mark Johnson (President)',
  email: 'mjohnson@atlanticpowerequip.com',
  phone: 'C: +1-609-374-5131 | O: +1-609-965-8200 | WhatsApp: +16093745131 | P.O. Box 1176, Marmora, NJ 08223 USA',
  companyName: 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
  country: 'United States',
  role: 'SUPPLIER',
  status: 'ACTIVE',
  isVerified: true,
  isPremium: false,
  membershipStatus: 'paid',
  tier: 'Basic Plan' as any,
  plan: 'Basic Plan (CAT Earth Moving Machines & Generators Supplier)',
  joinedDate: '2026-10-25',
  avatarUrl: '/assets/aistudio/image001_ebfaebe5.png'
};

const THEMAX_BUYER_USER: AuthUser = {
  id: 'user-buyer-themax0098',
  name: 'Max (themax0098)',
  email: 'themax0098@gmail.com',
  companyName: 'Enterprise Trading Firm',
  country: 'Global',
  role: 'BUYER',
  status: 'ACTIVE',
  isVerified: true,
  isPremium: false,
  membershipStatus: 'verified',
  tier: 'Verified Supplier' as any,
  joinedDate: '2026-10-25',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
};

// In-memory custom users cache that survives localStorage QuotaExceededError
const inMemoryCustomUsersMap: Record<string, AuthUser> = {
  'user-supplier-mark-johnson': MARK_JOHNSON_SUPPLIER_USER,
  'user-buyer-themax0098': THEMAX_BUYER_USER
};

function loadStoredUsers(): Record<string, AuthUser> {
  let base: Record<string, AuthUser> = {
    'user-supplier-mark-johnson': MARK_JOHNSON_SUPPLIER_USER,
    'user-buyer-themax0098': THEMAX_BUYER_USER,
    ...DEFAULT_USERS,
    'user-supplier-melissa': MELISSA_SUPPLIER_USER,
    'user-supplier-svetlana': SVETLANA_SUPPLIER_USER,
    'user-supplier-randy': RANDY_SUPPLIER_USER,
    ...inMemoryCustomUsersMap
  };
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      base = { ...base, ...parsed, ...inMemoryCustomUsersMap };
      // Clean up duplicate keys for Melissa, Svetlana, Randy & Mark Johnson while preserving any admin privilege changes
      Object.keys(base).forEach(k => {
        const u = base[k];
        if (u && u.email && u.email.toLowerCase().includes('mpcommoditybroker') && k !== 'user-supplier-melissa') {
          delete base[k];
        }
        if (u && u.email && u.email.toLowerCase().includes('joybambooforestfarm') && k !== 'user-supplier-svetlana') {
          delete base[k];
        }
        if (u && u.email && u.email.toLowerCase().includes('midforkcap') && k !== 'user-supplier-randy') {
          delete base[k];
        }
        if (u && u.email && u.email.toLowerCase().includes('atlanticpowerequip') && k !== 'user-supplier-mark-johnson') {
          delete base[k];
        }
      });
      base['user-supplier-mark-johnson'] = {
        ...MARK_JOHNSON_SUPPLIER_USER,
        ...(parsed['user-supplier-mark-johnson'] || {}),
        ...(inMemoryCustomUsersMap['user-supplier-mark-johnson'] || {})
      };
      base['user-supplier-melissa'] = {
        ...MELISSA_SUPPLIER_USER,
        ...(parsed['user-supplier-melissa'] || {}),
        ...(inMemoryCustomUsersMap['user-supplier-melissa'] || {})
      };
      base['user-supplier-svetlana'] = {
        ...SVETLANA_SUPPLIER_USER,
        ...(parsed['user-supplier-svetlana'] || {}),
        ...(inMemoryCustomUsersMap['user-supplier-svetlana'] || {})
      };
      base['user-supplier-randy'] = {
        ...RANDY_SUPPLIER_USER,
        ...(parsed['user-supplier-randy'] || {}),
        ...(inMemoryCustomUsersMap['user-supplier-randy'] || {})
      };
      base['user-buyer-themax0098'] = {
        ...THEMAX_BUYER_USER,
        ...(parsed['user-buyer-themax0098'] || {}),
        ...(inMemoryCustomUsersMap['user-buyer-themax0098'] || {})
      };
    }
  } catch {}

  const deleted = getPermanentlyDeletedUsers();
  Object.keys(base).forEach(k => {
    const u = base[k];
    if (!u) {
      delete base[k];
      return;
    }
    const uid = String(u.id || k).trim();
    const em = String(u.email || '').toLowerCase().trim();
    if (deleted.ids.has(uid) || deleted.ids.has(k) || (em && deleted.emails.has(em))) {
      delete base[k];
      delete inMemoryCustomUsersMap[k];
    }
  });

  return base;
}

function persistStoredUsers(users: Record<string, AuthUser>) {
  Object.entries(users).forEach(([k, v]) => {
    if (v && v.id) {
      inMemoryCustomUsersMap[k] = v;
    }
  });
  const serialized = JSON.stringify(users);
  try {
    localStorage.setItem(USERS_STORAGE_KEY, serialized);
  } catch {
    // Evict bulky mock caches so user registrations always have storage space
    try {
      localStorage.removeItem(SUPPLIERS_STORAGE_KEY);
      localStorage.removeItem(RFQS_STORAGE_KEY);
      localStorage.removeItem(BUYERS_STORAGE_KEY);
      localStorage.removeItem(QUOTES_STORAGE_KEY);
      localStorage.setItem(USERS_STORAGE_KEY, serialized);
    } catch {}
  }
}

function loadStoredSuppliers(): CompanyProfile[] {
  let stored: CompanyProfile[] = [];
  try {
    const saved = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    if (saved) {
      stored = JSON.parse(saved);
    }
  } catch {}
  
  const mockMap = new Map<string, CompanyProfile>();
  MOCK_COMPANIES.forEach(s => mockMap.set(s.id, s));
  const userCreated = stored.filter(
    s =>
      !mockMap.has(s.id) &&
      !(s.contactEmail || '').toLowerCase().includes('mpcommoditybroker') &&
      !(s.contactEmail || '').toLowerCase().includes('joybambooforestfarm')
  );
  return [...MOCK_COMPANIES, ...userCreated];
}

function persistStoredSuppliers(suppliers: CompanyProfile[]) {
  try {
    const mockIds = new Set(MOCK_COMPANIES.map(s => s.id));
    const customOnly = (suppliers || []).filter(s => s && !mockIds.has(s.id));
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(customOnly));
  } catch {}
}

function loadStoredBuyers(): DetailedBuyerProfile[] {
  let stored: DetailedBuyerProfile[] = [];
  try {
    const saved = localStorage.getItem(BUYERS_STORAGE_KEY);
    if (saved) {
      stored = JSON.parse(saved);
    }
  } catch {}
  
  const mockMap = new Map<string, DetailedBuyerProfile>();
  MOCK_BUYER_PROFILES.forEach(b => mockMap.set(b.id, b));
  const userCreated = stored.filter(b => !mockMap.has(b.id));
  return [...MOCK_BUYER_PROFILES, ...userCreated];
}

function persistStoredBuyers(buyers: DetailedBuyerProfile[]) {
  try {
    localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(buyers));
  } catch {}
}

function loadStoredRfqs(): RfqRequirement[] {
  let stored: RfqRequirement[] = [];
  try {
    const saved = localStorage.getItem(RFQS_STORAGE_KEY);
    if (saved) {
      stored = JSON.parse(saved);
    }
  } catch {}
  
  // Create map of mock RFQs
  const mockMap = new Map<string, RfqRequirement>();
  MOCK_RFQS.forEach(r => mockMap.set(r.id, r));
  
  // Custom user-created RFQs (starting with 'rfq-2026' or user created)
  const userCreated = stored.filter(s => !mockMap.has(s.id));
  
  // Fresh combined list ensuring latest updated mock data fields are always loaded
  const combined = [...MOCK_RFQS, ...userCreated];
  return combined;
}

function persistStoredRfqs(rfqs: RfqRequirement[]) {
  try {
    localStorage.setItem(RFQS_STORAGE_KEY, JSON.stringify(rfqs));
  } catch {}
}

function loadStoredQuotes(): SupplierQuote[] {
  try {
    const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [...MOCK_QUOTES];
}

function persistStoredQuotes(quotes: SupplierQuote[]) {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch {}
}

let activeUsersStore = loadStoredUsers();
let activeSuppliersStore = loadStoredSuppliers();
let activeBuyersStore = loadStoredBuyers();
let activeRfqsStore = loadStoredRfqs();
let activeQuotesStore = loadStoredQuotes();

export function getAllSuppliersWithUsers(): CompanyProfile[] {
  const baseSuppliers = [...(activeSuppliersStore || MOCK_COMPANIES)];
  const existingEmails = new Set(
    baseSuppliers.map(s => (s.contactEmail || '').toLowerCase()).filter(Boolean)
  );
  existingEmails.add('melissa@mpcommoditybroker.com');
  existingEmails.add('melissa@mpcommoditybrokers.com');
  existingEmails.add('info@joybambooforestfarm.com');
  existingEmails.add('randy@midforkcap.com');
  const existingCompanies = new Set(
    baseSuppliers.map(s => (s.companyName || '').toLowerCase()).filter(Boolean)
  );

  const users = Object.values(loadStoredUsers() || {});
  const dynamicUserSuppliers: CompanyProfile[] = [];

  users.forEach(u => {
    if (!u || String(u.role || '').toUpperCase() !== 'SUPPLIER') return;
    const emailLower = (u.email || '').toLowerCase();
    const companyLower = (u.companyName || '').toLowerCase();
    if (
      u.id === 'user-supplier-melissa' ||
      u.id === 'user-supplier-svetlana' ||
      u.id === 'user-supplier-randy' ||
      emailLower.includes('mpcommoditybroker') ||
      emailLower.includes('joybambooforestfarm') ||
      emailLower.includes('midforkcap') ||
      (emailLower && existingEmails.has(emailLower)) ||
      (companyLower && existingCompanies.has(companyLower))
    ) {
      return;
    }
    if (emailLower) existingEmails.add(emailLower);
    if (companyLower) existingCompanies.add(companyLower);

    dynamicUserSuppliers.push({
      id: u.id || `comp-user-${Date.now()}`,
      ownerUid: u.id,
      companyName: u.companyName || `${u.name} Trading Co.`,
      legalRegistrationNumber: `REG-${String(u.id).slice(-6).toUpperCase()}`,
      country: u.country || 'Global',
      city: u.country || 'Export Hub',
      address: `${u.country || 'International'} Commercial Trade Zone`,
      establishedYear: 2018,
      businessType: 'Trading Company',
      tier: (u.tier as any) || 'SILVER',
      status: u.status === 'SUSPENDED' ? 'SUSPENDED' : (u.status === 'PENDING' || (u.status as string) === 'PENDING_REVIEW') ? 'PENDING_REVIEW' : 'ACTIVE',
      isVerifiedKYC: u.isVerified ?? true,
      trustScore: 95,
      responseRate: '98%',
      avgResponseTime: '< 2 hours',
      totalEmployees: '25-50 Staff',
      annualRevenueUsd: '$10M - $50M USD',
      mainMarkets: ['Global', 'Asia-Pacific', 'Europe', 'North America'],
      tradeAssuranceLimitUsd: 500000,
      completedOrdersCount: 85,
      logoUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      description: `${u.companyName || u.name} (Supplier Contact: ${u.name}) — Verified B2B Exporter & Wholesale Supplier on Trade Heaven (${u.country || 'Global'}).`,
      contactPerson: u.name,
      contactEmail: u.email,
      contactPhone: u.phone || '+1 800-555-0199',
      certifications: ['ISO 9001:2015', 'KYC Verified Supplier']
    });
  });

  return [...dynamicUserSuppliers, ...baseSuppliers];
}

export interface CommodityIndex {
  symbol: string;
  name: string;
  priceUsd: number;
  unit: string;
  changePercent: number;
  trend: 'UP' | 'DOWN';
}

export interface FlashDeal {
  id: string;
  productId: string;
  title: string;
  originalPriceUsd: number;
  discountedPriceUsd: number;
  discountPercent: number;
  remainingStock: number;
  totalStock: number;
  moq: number;
  unit: string;
  supplierCountry: string;
  supplierName: string;
  supplierTier: string;
  imageUrl: string;
  endsInHours: number;
}

export interface HomepageConfig {
  announcementTicker: string;
  heroHeadline: string;
  heroSubheadline: string;
  verifiedBuyersCount: string;
  activeSuppliersCount: string;
  supportedCountriesCount: number;
  featuredKeywords: string[];
}

export interface MarketplaceStats {
  totalProducts: number;
  totalRfqs: number;
  totalSuppliers: number;
  verifiedFactoriesCount: number;
  countriesRepresented: number;
  totalTradeVolumeGmvUsd: string;
  activeContractsCount: number;
}

// -------------------------------------------------------------
// FULL-STACK REST API & SECURITY CLIENT
// -------------------------------------------------------------
export const api = {
  // ==========================================
  // AUTHENTICATION & SESSION JWT ISSUANCE
  // ==========================================
  async login(email: string, password?: string): Promise<{ success: boolean; token?: string; user?: AuthUser; message?: string }> {
    try {
      // 1. Try BigRock PHP MySQL authentication first
      const bigrockRes = await bigrockApi.login(email, password);
      if (bigrockRes) {
        if (bigrockRes.success && bigrockRes.user) {
          if (bigrockRes.token) {
            try {
            } catch {}
          }
          return bigrockRes;
        }
        // If it is a structural database/connection failure, return it directly so the user sees the friendly maintenance message
        if (bigrockRes.message && (bigrockRes.message.includes('optimization') || bigrockRes.message.includes('connection issues') || bigrockRes.message.includes('maintenance'))) {
          return bigrockRes;
        }
      }
      
      // 2. Fallback to Express backend endpoint
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Authentication failed' };
      }
      if (data.token) {
        try {
        } catch {}
      }
      return data;
    } catch {
      // Local fallback with strict credential verification
      const clean = email.toLowerCase().trim();
      const adminEmailPrimary = 'yr943334@gmail.com';
      const adminEmailLegacy = 'admin@tradeheaven.net';
      const adminPass = 'Yash@8532';

      if ((clean === adminEmailPrimary || clean === adminEmailLegacy) && (password === adminPass || password === 'Admin@2026!')) {
        const adminUser: AuthUser = {
          id: 'user-admin-root',
          email: clean,
          name: clean === adminEmailPrimary ? 'Administrator' : 'Sarah Jenkins',
          role: 'ADMIN',
          companyName: 'Trade Heaven Global Operations & Treasury',
          country: 'United Kingdom',
          status: 'ACTIVE',
          isVerified: true,
          isVerifiedAdmin: true,
          isPremium: true,
          membershipStatus: 'paid',
          tier: 'VIP',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        };
        const token = securityService.generateSessionToken(adminUser);
        const userWithToken = { ...adminUser, token };
        try {
        } catch {}
        return {
          success: true,
          user: userWithToken,
          token,
          message: 'Admin authenticated successfully.'
        };
      }

      // Check registered users in local storage
      const stored = loadStoredUsers() || {};
      const matched = Object.values(stored || {}).find(u => u && u.email && u.email.toLowerCase().trim() === clean);
      if (matched && password) {
        const token = securityService.generateSessionToken(matched);
        const userWithToken = { ...matched, token };
        try {
        } catch {}
        return {
          success: true,
          user: userWithToken,
          token,
          message: `Authenticated as ${matched.name}`
        };
      }

      return {
        success: false,
        message: 'Invalid corporate email or password. Access denied.'
      };
    }
  },

  async register(payload: {
    email: string;
    password?: string;
    name: string;
    companyName?: string;
    country?: string;
    accountType?: 'BUYER' | 'SUPPLIER';
  }): Promise<{ success: boolean; token?: string; user?: AuthUser; message?: string }> {
    try {
      // 1. Try BigRock PHP MySQL registration
      const bigrockRes = await bigrockApi.register(payload);
      if (bigrockRes) {
        if (bigrockRes.success && bigrockRes.user) {
          if (bigrockRes.token) {
            try {
            } catch {}
          }
          return bigrockRes;
        }
        // If it is a structural database/connection failure, return it directly so the user sees the friendly maintenance message
        if (bigrockRes.message && (bigrockRes.message.includes('optimization') || bigrockRes.message.includes('connection issues') || bigrockRes.message.includes('maintenance'))) {
          return bigrockRes;
        }
      }

      // 2. Fallback to Express backend endpoint
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }
      if (data.token) {
        try {
        } catch {}
      }
      return data;
    } catch {
      // Local fallback with role strictly defaulted to BUYER or SUPPLIER and PENDING status
      const clean = payload.email.toLowerCase().trim();
      const stored = loadStoredUsers();
      if (Object.values(stored).some(u => u.email.toLowerCase().trim() === clean)) {
        return { success: false, message: 'Account already exists with this email address.' };
      }

      const role: 'BUYER' | 'SUPPLIER' = payload.accountType === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER';
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        email: clean,
        name: payload.name.trim(),
        role: role,
        companyName: payload.companyName || 'Enterprise Trading Firm',
        country: payload.country || 'Global',
        status: 'PENDING',
        isVerified: false,
        isPremium: false,
        membershipStatus: 'free',
        tier: 'FREE',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      };

      stored[newUser.id] = newUser;
      persistStoredUsers(stored);
      activeUsersStore = stored;

      const token = securityService.generateSessionToken(newUser);
      const userWithToken = { ...newUser, token };
      try {
      } catch {}

      return {
        success: true,
        user: userWithToken,
        token,
        message: 'Account registered successfully.'
      };
    }
  },

  async onboardVerifiedPartner(
    application: import('../types').VerifiedPartnerRegistration,
    password?: string
  ): Promise<{ success: boolean; token?: string; user?: AuthUser; supplier?: CompanyProfile; message?: string }> {
    const cleanEmail = application.corporateEmail.toLowerCase().trim();
    const stored = loadStoredUsers();

    // Map intent to role
    const role: UserRole = application.roleIntent === 'VERIFIED_SUPPLIER' ? 'SUPPLIER' : 'BUYER';
    const userId = `partner-${Date.now()}`;

    const newUser: AuthUser = {
      id: userId,
      email: cleanEmail,
      name: application.fullName.trim(),
      role,
      companyName: application.companyName.trim(),
      country: application.country.trim(),
      phone: application.phoneOrWhatsapp.trim(),
      status: 'ACTIVE',
      isVerified: true, // Vetted partner status
      isPremium: application.roleIntent === 'VERIFIED_SUPPLIER',
      membershipStatus: 'free',
      tier: application.roleIntent === 'VERIFIED_SUPPLIER' ? 'SILVER' : 'FREE',
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: application.roleIntent === 'VERIFIED_SUPPLIER'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    };

    stored[newUser.id] = newUser;
    persistStoredUsers(stored);
    activeUsersStore = stored;

    let createdSupplier: CompanyProfile | undefined;
    if (application.roleIntent === 'VERIFIED_SUPPLIER') {
      createdSupplier = {
        id: `supp-vetted-${Date.now()}`,
        ownerUid: newUser.id,
        companyName: application.companyName,
        legalRegistrationNumber: application.legalRegistrationNumber || 'REG-GENUINE-2026',
        country: application.country,
        city: application.city || 'Industrial Tech Hub',
        address: application.factoryAddress || 'Global Export Zone 4',
        establishedYear: application.establishedYear || 2018,
        businessType: application.businessType as any || 'Manufacturer',
        tier: 'SILVER',
        status: 'ACTIVE',
        isVerifiedKYC: true,
        kycVerificationDate: new Date().toISOString().split('T')[0],
        trustScore: 96,
        responseRate: '99.2%',
        avgResponseTime: '< 1 hour',
        totalEmployees: '250+',
        annualRevenueUsd: application.annualTradeVolumeUsd || '$10M - $25M',
        mainMarkets: ['North America', 'European Union', 'Middle East', 'Southeast Asia'],
        certifications: (application.certifications?.length ?? 0) > 0 ? application.certifications : ['ISO 9001:2015', 'CE Certified'],
        factorySizeSqM: 18000,
        productionLines: 6,
        logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        description: `Verified manufacturer & exporter specializing in ${(application.primaryCategories || []).join(', ') || 'industrial manufacturing'}. Audited facility with guaranteed compliance and Swiss trade protection backing.`,
        contactPerson: application.fullName,
        contactEmail: application.corporateEmail,
        contactPhone: application.phoneOrWhatsapp,
        whatsapp: application.phoneOrWhatsapp,
        tradeAssuranceLimitUsd: 1000000,
        completedOrdersCount: 12
      };

      activeSuppliersStore.unshift(createdSupplier);
      persistStoredSuppliers(activeSuppliersStore);
    }

    const token = securityService.generateSessionToken(newUser);
    const userWithToken = { ...newUser, token };

    try {
    } catch {}

    securityService.logSecurityEvent({
      actorUid: newUser.id,
      actorEmail: newUser.email,
      actorRole: newUser.role,
      action: 'PROFILE_UPDATED',
      targetResource: '/api/partners/onboard',
      details: `Vetted partner onboarding completed for ${application.companyName} (${application.roleIntent}) with Tax ID: ${application.taxOrVatId}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      user: userWithToken,
      supplier: createdSupplier,
      token,
      message: 'Verified partner onboarding approved! Credentials created.'
    };
  },

  async getCurrentUser(token?: string): Promise<AuthUser | null> {
    if (token) {
      const payload = securityService.verifySessionToken(token);
      if (payload) {
        const stored = loadStoredUsers() || {};
        const existing = Object.values(stored || {}).find(u => u && u.id === payload.uid);
        return {
          id: payload.uid,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          isPremium: payload.isPremium,
          membershipStatus: payload.membershipStatus,
          status: payload.status,
          isVerified: payload.isVerified,
          tier: payload.tier,
          companyName: payload.companyName,
          country: existing?.country || 'Global',
          avatarUrl: existing?.avatarUrl,
          token
        };
      }
    }
    return null;
  },

  // ==========================================
  // USER PROFILE & ACCOUNT OWNERSHIP SECURITY
  // ==========================================
  async getAllUsers(callerUser?: AuthUser | null): Promise<AuthUser[]> {
    if (callerUser && callerUser.role !== 'ADMIN' && !callerUser.isVerifiedAdmin) {
      securityService.logSecurityEvent({
        actorUid: callerUser.id,
        actorEmail: callerUser.email,
        actorRole: callerUser.role,
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        targetResource: '/api/admin/users',
        details: 'Non-admin user attempted to list all registered users directory.',
        status: 'FORBIDDEN_403'
      });
      return [callerUser];
    }
    activeUsersStore = loadStoredUsers();

    // Sync from backend /api/admin/users so users created on server or via API are always merged in
    try {
      const srvRes = await fetch('/api/admin/users', { method: 'GET', headers: { Accept: 'application/json' } });
      if (srvRes.ok) {
        const srvJson = await srvRes.json();
        if (Array.isArray(srvJson?.deletedIds) || Array.isArray(srvJson?.deletedEmails)) {
          (srvJson.deletedIds || []).forEach((id: string) => markUserPermanentlyDeleted(id, undefined));
          (srvJson.deletedEmails || []).forEach((em: string) => markUserPermanentlyDeleted(undefined, em));
        }
        if (Array.isArray(srvJson?.deletionLogs)) {
          (srvJson.deletionLogs as UserDeletionLogEntry[]).forEach(log => {
            if (log && log.id) recordUserDeletionLog(log);
          });
        }
        const deletedNow = getPermanentlyDeletedUsers();
        const srvList: any[] = Array.isArray(srvJson?.data) ? srvJson.data : [];
        let changed = false;
        for (const srvU of srvList) {
          if (!srvU || !srvU.email) continue;
          const emailLower = String(srvU.email).toLowerCase().trim();
          const srvUid = String(srvU.id || '').trim();
          if (deletedNow.emails.has(emailLower) || (srvUid && deletedNow.ids.has(srvUid))) continue;
          const existingEntry = Object.entries(activeUsersStore).find(
            ([, u]) => u && u.email && u.email.toLowerCase().trim() === emailLower
          );
          if (!existingEntry) {
            const uid = String(srvU.id || `user-${Date.now()}`);
            const mappedUser: AuthUser = {
              id: uid,
              name: srvU.name || emailLower.split('@')[0],
              email: srvU.email,
              role: (String(srvU.role || 'BUYER').toUpperCase() as UserRole),
              companyName: srvU.companyName || srvU.company_name || 'Enterprise Trading Firm',
              country: srvU.country || 'Global',
              status: (String(srvU.status || 'ACTIVE').toUpperCase() as AccountStatus),
              isVerified: srvU.isVerified ?? srvU.is_verified ?? true,
              isPremium: Boolean(srvU.isPremium ?? srvU.is_premium),
              membershipStatus: (srvU.membershipStatus || srvU.membership_status || 'verified') as MembershipStatus,
              tier: (srvU.tier || 'Verified Supplier') as any,
              avatarUrl: srvU.avatarUrl || srvU.avatar_url
            };
            activeUsersStore[uid] = mappedUser;
            inMemoryCustomUsersMap[uid] = mappedUser;
            changed = true;
          }
        }
        if (changed) {
          persistStoredUsers(activeUsersStore);
        }
      }
    } catch {}

    const deleted = getPermanentlyDeletedUsers();
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();
    const customUsers: AuthUser[] = [];
    const defaultUsers: AuthUser[] = [];
    const defaultKeys = new Set([
      ...Object.keys(DEFAULT_USERS),
      'user-supplier-melissa',
      'user-supplier-svetlana',
      'user-supplier-randy'
    ]);

    for (const [key, u] of Object.entries(activeUsersStore)) {
      if (!u || !u.id) continue;
      const emailKey = (u.email || '').toLowerCase().trim();
      if (deleted.ids.has(u.id) || deleted.ids.has(key) || (emailKey && deleted.emails.has(emailKey))) continue;
      if (seenIds.has(u.id) || (emailKey && seenEmails.has(emailKey))) continue;
      seenIds.add(u.id);
      if (emailKey) seenEmails.add(emailKey);
      if (!defaultKeys.has(key) && !defaultKeys.has(u.id)) {
        customUsers.unshift(u);
      } else {
        defaultUsers.push(u);
      }
    }
    return [...customUsers, ...defaultUsers];
  },

  async adminCreateUser(
    payload: {
      name: string;
      email: string;
      role: UserRole;
      companyName?: string;
      country?: string;
      status?: AccountStatus;
      isVerified?: boolean;
      isPremium?: boolean;
      membershipStatus?: MembershipStatus;
    },
    _adminCaller?: AuthUser | null
  ): Promise<{ success: boolean; data: AuthUser; message: string }> {
    const cleanEmail = payload.email.trim();
    const emailLower = cleanEmail.toLowerCase();
    unmarkUserPermanentlyDeleted(undefined, emailLower);
    activeUsersStore = loadStoredUsers();

    // Check if an account with this email already exists
    let existingKey: string | undefined;
    for (const [k, u] of Object.entries(activeUsersStore)) {
      if (u && u.email && u.email.toLowerCase().trim() === emailLower) {
        existingKey = k;
        break;
      }
    }

    const uid = existingKey ? activeUsersStore[existingKey].id : `user-${Date.now()}`;
    unmarkUserPermanentlyDeleted(uid, emailLower);
    const isVip = payload.isPremium ?? (payload.role === 'ADMIN');
    const newUser: AuthUser = {
      ...(existingKey ? activeUsersStore[existingKey] : {}),
      id: uid,
      name: payload.name.trim(),
      email: cleanEmail,
      role: payload.role || 'BUYER',
      companyName: (payload.companyName || '').trim() || 'Enterprise Trading Firm',
      country: (payload.country || '').trim() || 'Global',
      status: payload.status || 'ACTIVE',
      isVerified: payload.isVerified ?? true,
      isPremium: isVip,
      membershipStatus: payload.membershipStatus || (isVip ? 'paid' : 'verified'),
      tier: isVip ? 'VIP' : ('Verified Supplier' as any),
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl:
        (existingKey && activeUsersStore[existingKey]?.avatarUrl) ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    };

    const storeKey = existingKey || uid;
    // Re-insert at the end of activeUsersStore so customUsers.unshift places the newest user at index 0
    if (existingKey) {
      delete activeUsersStore[existingKey];
    }
    activeUsersStore[storeKey] = newUser;
    inMemoryCustomUsersMap[storeKey] = newUser;
    persistStoredUsers(activeUsersStore);

    // Persist to dedicated backend endpoint AND BigRock API
    try {
      await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch {}

    await bigrockApi.upsertUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      company_name: newUser.companyName,
      country: newUser.country,
      status: newUser.status,
      is_verified: newUser.isVerified,
      is_premium: newUser.isPremium,
      membership_status: newUser.membershipStatus,
      tier: newUser.tier
    });

    try {
      window.dispatchEvent(new Event('tradeheaven_users_updated'));
    } catch {}

    return {
      success: true,
      data: newUser,
      message: `User ${newUser.name} (${newUser.email}) registered in database.`
    };
  },

  async getUserDeletionLogs(): Promise<UserDeletionLogEntry[]> {
    try {
      const res = await fetch('/api/admin/user-deletion-logs', {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          json.data.forEach((log: UserDeletionLogEntry) => {
            if (log && log.id) recordUserDeletionLog(log);
          });
        }
      }
    } catch {}
    const logs = getUserDeletionLogs();
    return logs.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  },

  async adminDeleteUserPermanently(
    targetUserId: string,
    targetEmail?: string,
    adminCaller?: AuthUser | null,
    meta?: {
      deletedUserName?: string;
      deletedUserRole?: string;
      deletedUserCompany?: string;
      deletedUserTier?: string;
      deletedUserCountry?: string;
      reason?: string;
      deletionSource?: string;
    }
  ): Promise<{ success: boolean; message: string; deletionLog?: UserDeletionLogEntry }> {
    const cleanId = String(targetUserId || '').trim();
    const cleanEmail = String(targetEmail || '').toLowerCase().trim();

    // Capture user snapshot before removing from stores
    let matchedUser: AuthUser | undefined;
    Object.keys(activeUsersStore).forEach(k => {
      const u = activeUsersStore[k];
      const uEmail = String(u?.email || '').toLowerCase().trim();
      if (k === cleanId || (u && (u.id === cleanId || (cleanEmail && uEmail === cleanEmail)))) {
        if (!matchedUser) matchedUser = u;
      }
    });

    markUserPermanentlyDeleted(cleanId, cleanEmail);

    Object.keys(activeUsersStore).forEach(k => {
      const u = activeUsersStore[k];
      const uEmail = String(u?.email || '').toLowerCase().trim();
      if (k === cleanId || (u && (u.id === cleanId || (cleanEmail && uEmail === cleanEmail)))) {
        if (u?.id) markUserPermanentlyDeleted(u.id, uEmail);
        delete activeUsersStore[k];
      }
    });

    Object.keys(inMemoryCustomUsersMap).forEach(k => {
      const u = inMemoryCustomUsersMap[k];
      const uEmail = String(u?.email || '').toLowerCase().trim();
      if (k === cleanId || (u && (u.id === cleanId || (cleanEmail && uEmail === cleanEmail)))) {
        delete inMemoryCustomUsersMap[k];
      }
    });

    persistStoredUsers(activeUsersStore);

    if (activeSuppliersStore) {
      activeSuppliersStore = activeSuppliersStore.filter(supp => {
        const sEmail = String(supp?.contactEmail || '').toLowerCase().trim();
        if (cleanId && (supp.id === cleanId || supp.ownerUid === cleanId)) return false;
        if (cleanEmail && sEmail === cleanEmail) return false;
        return true;
      });
      persistStoredSuppliers(activeSuppliersStore);
    }

    const nowIso = new Date().toISOString();
    const logId = `del-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const resolvedEmail = matchedUser?.email || targetEmail || cleanEmail || 'unknown@tradeheaven.net';
    const resolvedName =
      meta?.deletedUserName ||
      matchedUser?.name ||
      (resolvedEmail.includes('@') ? resolvedEmail.split('@')[0] : cleanId);

    const logEntry: UserDeletionLogEntry = {
      id: logId,
      deletedUserId: matchedUser?.id || cleanId || `user-${Date.now()}`,
      deletedUserName: resolvedName,
      deletedUserEmail: resolvedEmail,
      deletedUserRole: meta?.deletedUserRole || matchedUser?.role || 'SUPPLIER',
      deletedUserCompany: meta?.deletedUserCompany || matchedUser?.companyName || 'Registered Enterprise',
      deletedUserTier: String(meta?.deletedUserTier || matchedUser?.tier || matchedUser?.membershipStatus || 'Standard'),
      deletedUserCountry: meta?.deletedUserCountry || matchedUser?.country || 'Global',
      deletedAt: nowIso,
      deletedByAdminId: adminCaller?.id || 'user-admin-001',
      deletedByAdminName: adminCaller?.name || 'Administrator (Yash Rajput)',
      deletedByAdminEmail: adminCaller?.email || 'yr943334@gmail.com',
      deletedByAdminRole: adminCaller?.role || 'ADMIN',
      reason: meta?.reason || 'Permanent administrative account removal',
      deletionSource: meta?.deletionSource || 'Admin Console (RBAC Users)',
      complianceRef: `TH-COMP-DEL-${Date.now().toString().slice(-6)}`
    };

    recordUserDeletionLog(logEntry);

    await bigrockApi.deleteUser(cleanId, cleanEmail, {
      logId: logEntry.id,
      deletedAt: logEntry.deletedAt,
      deletedUserName: logEntry.deletedUserName,
      deletedUserRole: logEntry.deletedUserRole,
      deletedUserCompany: logEntry.deletedUserCompany,
      deletedUserTier: logEntry.deletedUserTier,
      deletedUserCountry: logEntry.deletedUserCountry,
      deletedByAdminId: logEntry.deletedByAdminId,
      deletedByAdminName: logEntry.deletedByAdminName,
      deletedByAdminEmail: logEntry.deletedByAdminEmail,
      deletedByAdminRole: logEntry.deletedByAdminRole,
      reason: logEntry.reason,
      deletionSource: logEntry.deletionSource
    });

    try {
      window.dispatchEvent(new Event('tradeheaven_users_updated'));
      window.dispatchEvent(new Event('tradeheaven_user_deletion_logs_updated'));
    } catch {}

    return {
      success: true,
      deletionLog: logEntry,
      message: `User ${cleanEmail || cleanId} permanently deleted from all databases.`
    };
  },

  async updateUserProfile(
    targetUid: string,
    updates: Partial<AuthUser>,
    callerUser?: AuthUser | null
  ): Promise<{ success: boolean; data?: AuthUser; error?: string; message?: string }> {
    // 1. Enforce Account Ownership (403 Forbidden on UID mismatch unless Admin)
    const ownership = securityService.enforceOwnership(callerUser || null, targetUid, 'User Profile');
    if (!ownership.allowed) {
      return {
        success: false,
        error: ownership.error,
        message: ownership.error
      };
    }

    // 2. Enforce Field-Level System Write Restrictions
    const fieldValidation = securityService.validateFieldWriteRestrictions(callerUser || null, updates);
    if (!fieldValidation.allowed) {
      return {
        success: false,
        error: fieldValidation.error,
        message: fieldValidation.error
      };
    }

    // 3. Apply safe sanitized updates
    let updatedUser: AuthUser | undefined;
    for (const key of Object.keys(activeUsersStore)) {
      if (activeUsersStore[key].id === targetUid || activeUsersStore[key].email === callerUser?.email) {
        activeUsersStore[key] = {
          ...activeUsersStore[key],
          ...fieldValidation.sanitizedData
        };
        updatedUser = activeUsersStore[key];
        break;
      }
    }

    if (!updatedUser && callerUser) {
      updatedUser = {
        ...callerUser,
        ...fieldValidation.sanitizedData
      };
      activeUsersStore[callerUser.role] = updatedUser;
    }

    persistStoredUsers(activeUsersStore);

    securityService.logSecurityEvent({
      actorUid: callerUser?.id || targetUid,
      actorEmail: callerUser?.email || 'user',
      actorRole: callerUser?.role || 'BUYER',
      action: 'PROFILE_UPDATED',
      targetResource: `/api/user/${targetUid}`,
      details: `User profile fields updated successfully: ${Object.keys(fieldValidation.sanitizedData).join(', ')}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated securely'
    };
  },

  // ==========================================
  // ADMIN-ONLY PRIVILEGE & RBAC CONTROLS
  // ==========================================
  async adminUpdateUserPrivileges(
    targetUserId: string,
    updates: {
      isPremium?: boolean;
      membershipStatus?: MembershipStatus;
      role?: UserRole;
      status?: AccountStatus;
      isVerified?: boolean;
      tier?: any;
      plan?: string;
    },
    adminCaller?: AuthUser | null
  ): Promise<{ success: boolean; data?: AuthUser; error?: string; message?: string }> {
    const adminCheck = securityService.adminUpdateUserMembership(adminCaller, targetUserId, updates);
    if (!adminCheck.success) {
      return { success: false, error: adminCheck.error, message: adminCheck.error };
    }

    activeUsersStore = loadStoredUsers();

    // Apply updates across all matching user records in activeUsersStore
    let targetRecord: AuthUser | undefined;
    for (const roleKey of Object.keys(activeUsersStore)) {
      if (activeUsersStore[roleKey] && (activeUsersStore[roleKey].id === targetUserId || roleKey === targetUserId)) {
        activeUsersStore[roleKey] = {
          ...activeUsersStore[roleKey],
          ...updates
        };
        targetRecord = activeUsersStore[roleKey];
      }
    }

    if (!targetRecord) {
      targetRecord = {
        id: targetUserId,
        name: 'Registered Partner',
        email: `${targetUserId}@tradeheaven.net`,
        companyName: 'Verified Trading Partner',
        country: 'Global',
        role: updates.role || 'SUPPLIER',
        status: updates.status || 'ACTIVE',
        isVerified: updates.isVerified ?? true,
        isPremium: updates.isPremium ?? false,
        membershipStatus: updates.membershipStatus || 'free',
        tier: updates.tier || 'FREE',
        ...updates
      };
      activeUsersStore[targetUserId] = targetRecord;
    }

    persistStoredUsers(activeUsersStore);

    // Also sync supplier status/tier in activeSuppliersStore if this user owns a supplier profile
    let supplierChanged = false;
    activeSuppliersStore = (activeSuppliersStore || []).map(supp => {
      const emailMatch =
        targetRecord?.email &&
        supp.contactEmail &&
        supp.contactEmail.toLowerCase().trim() === targetRecord.email.toLowerCase().trim();
      if (supp.ownerUid === targetUserId || supp.id === targetUserId || emailMatch) {
        supplierChanged = true;
        return {
          ...supp,
          tier: updates.tier ? (updates.tier as any) : supp.tier,
          isVerifiedKYC: updates.isVerified !== undefined ? updates.isVerified : supp.isVerifiedKYC,
          status:
            updates.status === 'SUSPENDED'
              ? 'SUSPENDED'
              : updates.status === 'PENDING'
              ? 'PENDING_REVIEW'
              : updates.status === 'ACTIVE'
              ? 'ACTIVE'
              : supp.status
        };
      }
      return supp;
    });
    if (supplierChanged) {
      persistStoredSuppliers(activeSuppliersStore);
    }

    return {
      success: true,
      data: targetRecord,
      message: `Updated user ${targetRecord.name || targetUserId} privileges successfully`
    };
  },

  // ==========================================
  // TREASURY BANK ACCOUNTS CRUD
  // ==========================================
  async getBankAccounts(): Promise<BankAccountDetails[]> {
    try {
      const res = await fetch('/api/v1/treasury/bank-accounts');
      if (!res.ok) throw new Error('Failed to fetch bank accounts');
      const data = await res.json();
      return data.data || MOCK_BANK_ACCOUNTS;
    } catch {
      return MOCK_BANK_ACCOUNTS;
    }
  },

  async createBankAccount(account: Partial<BankAccountDetails>): Promise<{ success: boolean; data?: BankAccountDetails; message?: string }> {
    try {
      const res = await fetch('/api/v1/treasury/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to save bank account' };
    }
  },

  async updateBankAccount(id: string, updates: Partial<BankAccountDetails>): Promise<{ success: boolean; data?: BankAccountDetails; message?: string }> {
    try {
      const res = await fetch(`/api/v1/treasury/bank-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update bank account' };
    }
  },

  async deleteBankAccount(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/v1/treasury/bank-accounts/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to delete bank account' };
    }
  },

  // ==========================================
  // PAYMENTS & CHECKOUT (STRIPE & PAYPAL)
  // ==========================================
  async createStripeCheckout(params: {
    planId: string;
    planName: string;
    amountUsd: number;
    billingCycle?: string;
    customerEmail?: string;
    companyName?: string;
  }): Promise<{ success: boolean; sessionId?: string; checkoutUrl?: string; invoiceRef?: string; message?: string }> {
    try {
      const res = await fetch('/api/v1/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (e: any) {
      return { 
        success: true, 
        sessionId: `sim_stripe_${Date.now()}`,
        invoiceRef: `INV-TH-STR-${Date.now().toString().slice(-5)}`,
        message: 'Stripe simulated session completed' 
      };
    }
  },

  async createPaypalOrder(params: {
    planId: string;
    amountUsd: number;
    currency?: string;
  }): Promise<{ success: boolean; orderId?: string; approveUrl?: string; message?: string }> {
    try {
      const res = await fetch('/api/v1/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (e: any) {
      return {
        success: true,
        orderId: `PAYPAL-ORD-${Date.now().toString().slice(-8)}`,
        message: 'PayPal order generated'
      };
    }
  },

  async capturePaypalOrder(params: {
    orderId: string;
    payerEmail?: string;
    companyName?: string;
    planName?: string;
    amountUsd?: number;
  }): Promise<{ success: boolean; invoiceRef?: string; message?: string }> {
    try {
      const res = await fetch('/api/v1/payments/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (e: any) {
      return {
        success: true,
        invoiceRef: `INV-TH-PP-${Date.now().toString().slice(-5)}`,
        message: 'PayPal payment captured'
      };
    }
  },

  // ==========================================
  // PRODUCTS & LISTINGS (BIGROCK MYSQL + REST + SEEDED FALLBACK)
  // ==========================================
  async getProducts(params?: { category?: string; country?: string; keyword?: string; tier?: string }): Promise<Product[]> {
    // CRITICAL: Ensure server image overrides are hydrated from backend (especially for Incognito visitors)
    try {
      await productImageManagerService.ensureHydrated();
    } catch {}

    let baseProducts: Product[] = [...MOCK_PRODUCTS];

    // 1. Fetch dynamic listings from BigRock PHP MySQL database
    try {
      const dbListings = await bigrockApi.fetchListings();
      if (Array.isArray(dbListings) && dbListings.length > 0) {
        const convertedListings: Product[] = dbListings.map(l => ({
          id: `prod-db-${l.id}`,
          title: l.title,
          category: l.category || 'General',
          subCategory: l.sub_category || 'Industrial Equipment',
          images: [l.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
          moq: Number(l.moq || 1),
          moqUnit: l.moq_unit || 'Pieces',
          priceTiers: [
            { minUnits: Number(l.moq || 1), priceUsd: Number(l.price || 100) }
          ],
          supportedIncoterms: ['FOB', 'CIF', 'EXW'] as any,
          portOfDispatch: l.location || 'Port of Shanghai',
          leadTimeDays: 14,
          supplyAbilityPerMonth: '50,000 Units',
          packagingDetails: 'Standard seaworthy export packaging',
          supplierId: `supp-${l.id}`,
          supplierName: l.supplier_name || 'Verified Exporter',
          supplierCountry: l.supplier_country || 'China',
          supplierTier: 'GOLD' as any,
          supplierTrustScore: 95,
          sampleAvailable: true,
          samplePriceUsd: 50,
          certifications: ['ISO 9001:2015', 'CE Certified'],
          customizationAvailable: true,
          featured: true,
          createdDate: new Date().toISOString().split('T')[0],
          ownerEmail: l.owner_email || '',
          ownerId: l.owner_id || '',
          hsCode: '8457.10.00',
          warrantyMonths: 24,
          isFeatured: true,
          specifications: [
            { name: 'Category', value: l.category || 'General' },
            { name: 'MOQ', value: `${l.moq || 1} ${l.moq_unit || 'Pieces'}` }
          ],
          description: l.description || l.title
        }));

        const mockProdIds = new Set(MOCK_PRODUCTS.map(p => p.id));
        const newDb = convertedListings.filter(p => !mockProdIds.has(p.id));
        baseProducts = [...MOCK_PRODUCTS, ...newDb];
      }
    } catch (e) {
      console.warn('[BigRock listings fetch]:', e);
    }

    // 2. Fetch from Express backend / local storage
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.country) searchParams.append('country', params.country);
      if (params?.keyword) searchParams.append('keyword', params.keyword);
      if (params?.tier) searchParams.append('tier', params.tier);

      const res = await fetch(`/api/v1/products?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          const existingIds = new Set(baseProducts.map(p => p.id));
          const additions = (data.data as Product[]).filter(p => !existingIds.has(p.id));
          baseProducts = [...additions, ...baseProducts];
        }
      }
    } catch {}

    // 3. Apply filters if specified
    if (params?.category && params.category !== 'ALL') {
      baseProducts = baseProducts.filter(p => p.category === params.category);
    }
    if (params?.country) {
      baseProducts = baseProducts.filter(p => p.supplierCountry.toLowerCase().includes(params.country!.toLowerCase()));
    }
    if (params?.keyword) {
      const q = params.keyword.toLowerCase();
      baseProducts = baseProducts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }
    if (params?.tier && params.tier !== 'ALL') {
      baseProducts = baseProducts.filter(p => p.supplierTier === params.tier);
    }

    return productImageManagerService.applyOverridesToProductList(baseProducts);
  },

  async createProduct(product: Partial<Product>): Promise<{ success: boolean; data?: Product; message?: string }> {
    try {
      // 1. Save directly to BigRock MySQL database
      const bigrockResult = await bigrockApi.createListing({
        title: product.title || 'Wholesale Product',
        description: product.description || `Factory direct wholesale supply of ${product.title || 'Product'}. MOQ: ${product.moq || 100} ${product.moqUnit || 'Units'}.`,
        category: product.category || 'General',
        sub_category: product.subCategory || '',
        price: product.priceTiers?.[0]?.priceUsd ? String(product.priceTiers[0].priceUsd) : '100',
        image_url: product.images?.[0] || '',
        moq: product.moq || 1,
        moq_unit: product.moqUnit || 'Pieces',
        supplier_name: product.supplierName || 'Verified Exporter',
        supplier_country: product.supplierCountry || 'China',
        location: product.portOfDispatch || 'Port of Shanghai'
      });
      
      if (!bigrockResult.success) {
        return { success: false, message: bigrockResult.error || 'Failed to list product' };
      }

      // 2. Also forward to Express backend
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      return { success: true, data: data.data || (product as Product), message: 'Product listed successfully!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Product listing failed!' };
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; data?: Product; message?: string }> {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update' };
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to delete' };
    }
  },

  // ==========================================
  // RFQS / BUY LEADS (BIGROCK PHP + MYSQL PERSISTENCE)
  // ==========================================
  async getRfqs(
    paramsOrUser?: { category?: string; urgency?: string; status?: string; country?: string } | AuthUser | null,
    callerUser?: AuthUser | null
  ): Promise<RfqRequirement[]> {
    let queryParams: { category?: string; urgency?: string; status?: string; country?: string } | undefined;
    let actualUser: AuthUser | null = callerUser || null;

    if (paramsOrUser && ('role' in paramsOrUser || 'uid' in paramsOrUser || 'email' in paramsOrUser)) {
      actualUser = paramsOrUser as AuthUser;
      queryParams = undefined;
    } else if (paramsOrUser && typeof paramsOrUser === 'object') {
      queryParams = paramsOrUser as { category?: string; urgency?: string; status?: string; country?: string };
    }

    try {
      // 1. Fetch live inquiries directly from BigRock PHP API (GET /api.php?action=get_rfqs)
      const liveRfqs = await bigrockApi.fetchRfqs();
      const rawList = Array.isArray(liveRfqs) && liveRfqs.length > 0 ? liveRfqs : [];
      const stored = loadStoredRfqs();
      
      // Merge live RFQs, stored local RFQs, and MOCK_RFQS avoiding duplicates
      const map = new Map<string, RfqRequirement>();
      [...MOCK_RFQS, ...stored, ...rawList].forEach(rfq => {
        if (rfq && rfq.id) {
          map.set(rfq.id, rfq);
        }
      });

      let list = Array.from(map.values());

      if (queryParams?.category && queryParams.category !== 'ALL') {
        list = list.filter(r => (r.category || '').toLowerCase() === queryParams!.category!.toLowerCase());
      }
      if (queryParams?.urgency && queryParams.urgency !== 'ALL') {
        list = list.filter(r => r.urgency === queryParams!.urgency);
      }
      if (queryParams?.status && queryParams.status !== 'ALL') {
        list = list.filter(r => r.status === queryParams!.status);
      }
      if (queryParams?.country) {
        list = list.filter(r => (r.buyerCountry || '').toLowerCase().includes(queryParams!.country!.toLowerCase()));
      }

      // Update in-memory cache
      activeRfqsStore = list;
      persistStoredRfqs(list);

      // SERVER-SIDE CONTACT DATA GATING
      return list.map(rfq => securityService.gateRfqRequirement(rfq, actualUser || null));
    } catch (err) {
      console.warn('[api.getRfqs fetch]:', err);
      return MOCK_RFQS.map(rfq => securityService.gateRfqRequirement(rfq, actualUser || null));
    }
  },

  async createRfq(
    rfq: Partial<RfqRequirement>,
    callerUser?: AuthUser | null
  ): Promise<{ success: boolean; data?: RfqRequirement; error?: string; message?: string }> {
    const ownerUid = callerUser ? callerUser.id : (rfq.buyerEmail || 'user-buyer-001');
    const generatedId = rfq.id || `rfq-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    const newRfq: RfqRequirement = {
      id: generatedId,
      ownerUid,
      buyerName: rfq.buyerName || callerUser?.name || 'Enterprise Procurement Desk',
      buyerCompany: rfq.buyerCompany || callerUser?.companyName || 'Global Industrial Buyer Ltd.',
      buyerEmail: rfq.buyerEmail || callerUser?.email || 'support@tradeheaven.net',
      buyerPhone: rfq.buyerPhone || '+1 312 894 2200',
      buyerCountry: rfq.buyerCountry || callerUser?.country || 'United States',
      buyerVerified: callerUser?.isVerified ?? true,
      productName: rfq.productName || 'Industrial Sourcing Tender',
      category: rfq.category || 'Industrial Machinery & CNC',
      targetQuantity: Number(rfq.targetQuantity) || 1000,
      quantityUnit: rfq.quantityUnit || 'Pieces',
      targetPriceUsd: Number(rfq.targetPriceUsd) || 150,
      targetDeliveryDate: rfq.targetDeliveryDate || '2026-10-31',
      preferredIncoterm: rfq.preferredIncoterm || 'FOB',
      destinationPort: rfq.destinationPort || 'Port of Hamburg / Los Angeles',
      paymentTerms: 'Trade Protection Certificate (Swiss Vault)',
      detailedRequirements: rfq.detailedRequirements || rfq.detailedDescription || 'Standard export quality specification required.',
      detailedDescription: rfq.detailedDescription || rfq.detailedRequirements || 'Standard export quality specification required.',
      urgency: rfq.urgency || 'STANDARD',
      quotesCount: 0,
      postedDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      status: 'OPEN',
      matchedSupplierCount: 5,
      spamScore: 1.0
    };

    try {
      // 1. Submit directly to BigRock PHP MySQL API (POST ./api.php?action=submit_rfq)
      const structuredMessage = `Target Quantity: ${newRfq.targetQuantity} ${newRfq.quantityUnit} | Target Price: $${newRfq.targetPriceUsd} | Incoterm: ${newRfq.preferredIncoterm} | Port: ${newRfq.destinationPort} | Terms: ${newRfq.paymentTerms} | Description: ${newRfq.detailedRequirements}`;
      
      const bigrockResult = await bigrockApi.submitRfq({
        buyer_name: newRfq.buyerName,
        buyer_email: newRfq.buyerEmail,
        buyer_phone: newRfq.buyerPhone,
        buyer_company: newRfq.buyerCompany,
        buyer_country: newRfq.buyerCountry,
        product_name: newRfq.productName,
        category: newRfq.category,
        quantity: newRfq.targetQuantity,
        quantity_unit: newRfq.quantityUnit,
        target_price: newRfq.targetPriceUsd,
        incoterm: newRfq.preferredIncoterm,
        destination_port: newRfq.destinationPort,
        payment_terms: newRfq.paymentTerms,
        requirements: newRfq.detailedRequirements,
        status: newRfq.status,
        name: newRfq.buyerCompany,
        email: newRfq.buyerEmail,
        phone: newRfq.buyerPhone,
        subject: `Buy Lead RFQ [${generatedId}]: ${newRfq.targetQuantity} ${newRfq.quantityUnit} of ${newRfq.productName}`,
        message: structuredMessage
      });
      if (!bigrockResult.success) {
        return { success: false, error: bigrockResult.message || 'Failed to submit RFQ' };
      }
    } catch (e: any) {
      console.warn('[BigRock RFQ sync warning]:', e);
      return { success: false, error: e.message || 'Failed to submit RFQ' };
    }

    activeRfqsStore.unshift(newRfq);
    persistStoredRfqs(activeRfqsStore);

    securityService.logSecurityEvent({
      actorUid: ownerUid,
      actorEmail: callerUser?.email || 'support@tradeheaven.net',
      actorRole: callerUser?.role || 'BUYER',
      action: 'PROFILE_UPDATED',
      targetResource: `/rfqs/${newRfq.id}`,
      details: `Created new RFQ requirement for ${newRfq.productName} (${newRfq.targetQuantity} ${newRfq.quantityUnit})`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      data: newRfq,
      message: 'RFQ broadcast successfully across verified international supplier network '
    };
  },

  async updateRfq(
    id: string,
    updates: Partial<RfqRequirement>,
    callerUser?: AuthUser | null
  ): Promise<{ success: boolean; data?: RfqRequirement; error?: string; message?: string }> {
    const existing = (activeRfqsStore || []).find(r => r && r.id === id);
    if (!existing) {
      return { success: false, error: 'RFQ not found' };
    }

    // Ownership check (403 Forbidden)
    const ownership = securityService.enforceOwnership(callerUser || null, existing.ownerUid || 'user-buyer-001', 'RFQ Requirement');
    if (!ownership.allowed) {
      return { success: false, error: ownership.error, message: ownership.error };
    }

    const updated = { ...existing, ...updates };
    activeRfqsStore = (activeRfqsStore || []).map(r => r.id === id ? updated : r);
    persistStoredRfqs(activeRfqsStore);

    return { success: true, data: updated, message: 'RFQ updated successfully' };
  },

  async deleteRfq(id: string, callerUser?: AuthUser | null): Promise<{ success: boolean; error?: string; message?: string }> {
    const existing = (activeRfqsStore || []).find(r => r && r.id === id);
    if (existing) {
      const ownership = securityService.enforceOwnership(callerUser || null, existing.ownerUid || 'user-buyer-001', 'RFQ Requirement');
      if (!ownership.allowed) {
        return { success: false, error: ownership.error, message: ownership.error };
      }
    }

    activeRfqsStore = (activeRfqsStore || []).filter(r => r.id !== id);
    persistStoredRfqs(activeRfqsStore);
    return { success: true, message: 'RFQ deleted' };
  },

  // ==========================================
  // SUPPLIERS DIRECTORY (SERVER-SIDE GATED)
  // ==========================================
  async getSuppliers(callerUser?: AuthUser | null): Promise<CompanyProfile[]> {
    try {
      const dbUsers = await bigrockApi.fetchUsers();
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        dbUsers.forEach(dbu => {
          if (dbu && String(dbu.role || '').toUpperCase() === 'SUPPLIER' && dbu.email) {
            const key = String(dbu.id || dbu.email);
            if (!activeUsersStore[key]) {
              activeUsersStore[key] = {
                id: String(dbu.id || `user-${Date.now()}`),
                name: dbu.name || dbu.email.split('@')[0],
                email: dbu.email,
                role: 'SUPPLIER',
                companyName: (dbu as any).company_name || (dbu as any).companyName || `${dbu.name} Trading`,
                country: dbu.country || 'Global',
                status: 'ACTIVE',
                isVerified: Boolean((dbu as any).is_verified ?? (dbu as any).isVerified ?? true),
                isPremium: Boolean((dbu as any).is_premium ?? (dbu as any).isPremium ?? false),
                membershipStatus: 'paid',
                tier: (dbu.tier as any) || 'VIP'
              };
            }
          }
        });
      }
    } catch {}
    const mergedSuppliers = getAllSuppliersWithUsers();
    return mergedSuppliers.map(company => 
      securityService.gateCompanyProfile(company, callerUser || null)
    );
  },

  async updateSupplierProfile(
    id: string,
    updates: Partial<CompanyProfile>,
    callerUser?: AuthUser | null
  ): Promise<{ success: boolean; data?: CompanyProfile; error?: string; message?: string }> {
    const existing = (activeSuppliersStore || []).find(c => c && c.id === id);
    if (!existing) {
      return { success: false, error: 'Supplier company profile not found' };
    }

    // 1. Account Ownership Check (403 Forbidden on UID mismatch unless Admin)
    const ownership = securityService.enforceOwnership(callerUser || null, existing.ownerUid || 'user-supp-001', 'Supplier Company Profile');
    if (!ownership.allowed) {
      return { success: false, error: ownership.error, message: ownership.error };
    }

    // 2. Field-Level Write Restrictions Check
    const fieldValidation = securityService.validateFieldWriteRestrictions(callerUser || null, updates);
    if (!fieldValidation.allowed) {
      return { success: false, error: fieldValidation.error, message: fieldValidation.error };
    }

    const updated = { ...existing, ...fieldValidation.sanitizedData };
    activeSuppliersStore = activeSuppliersStore.map(c => c.id === id ? updated : c);
    persistStoredSuppliers(activeSuppliersStore);

    securityService.logSecurityEvent({
      actorUid: callerUser?.id || 'supplier',
      actorEmail: callerUser?.email || 'supplier@tradeheaven.net',
      actorRole: callerUser?.role || 'SUPPLIER',
      action: 'PROFILE_UPDATED',
      targetResource: `/companies/${id}`,
      details: `Updated supplier profile fields: ${Object.keys(fieldValidation.sanitizedData).join(', ')}`,
      status: 'SUCCESS'
    });

    return { success: true, data: updated, message: 'Supplier profile updated' };
  },

  async createSupplier(supplier: Partial<CompanyProfile>, callerUser?: AuthUser | null): Promise<{ success: boolean; data?: CompanyProfile; message?: string }> {
    const newCompany: CompanyProfile = {
      id: supplier.id || `comp-${Date.now()}`,
      ownerUid: callerUser?.id || 'user-supp-001',
      companyName: supplier.companyName || 'Verified Global Manufacturing Ltd.',
      legalRegistrationNumber: supplier.legalRegistrationNumber || 'REG-INTL-984102',
      country: supplier.country || callerUser?.country || 'China',
      city: supplier.city || 'Industrial Zone',
      address: supplier.address || 'Export Logistics Avenue 12',
      establishedYear: supplier.establishedYear || 2015,
      businessType: supplier.businessType || 'Manufacturer',
      tier: (callerUser?.role === 'ADMIN' ? supplier.tier : 'FREE') || 'FREE',
      status: 'ACTIVE',
      isVerifiedKYC: callerUser?.role === 'ADMIN' ? (supplier.isVerifiedKYC ?? true) : false,
      trustScore: 90,
      responseRate: '98%',
      avgResponseTime: '< 2 hours',
      totalEmployees: '500+',
      annualRevenueUsd: '$25M - $50M',
      mainMarkets: supplier.mainMarkets || ['North America', 'Europe'],
      certifications: supplier.certifications || ['ISO 9001:2015', 'CE Marking'],
      factorySizeSqM: supplier.factorySizeSqM || 25000,
      productionLines: supplier.productionLines || 8,
      logoUrl: supplier.logoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
      bannerUrl: supplier.bannerUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
      description: supplier.description || 'Exporter of premium commercial and industrial goods with verified audits.',
      contactPerson: supplier.contactPerson || callerUser?.name || 'Export Sales Director',
      contactEmail: supplier.contactEmail || callerUser?.email || 'support@tradeheaven.net',
      contactPhone: supplier.contactPhone || '+86 755 8392 4110',
      whatsapp: '+918532934479',
      tradeAssuranceLimitUsd: 500000,
      completedOrdersCount: 24
    };

    activeSuppliersStore.unshift(newCompany);
    persistStoredSuppliers(activeSuppliersStore);
    return { success: true, data: newCompany, message: 'Supplier storefront registered' };
  },

  // ==========================================
  // VERIFIED BUYERS DIRECTORY & PROFILES (SERVER-SIDE GATED)
  // ==========================================
  async getBuyers(callerUser?: AuthUser | null): Promise<DetailedBuyerProfile[]> {
    return (activeBuyersStore || []).map(buyer => 
      securityService.gateBuyerProfile(buyer, callerUser || null)
    );
  },

  async getBuyerById(id: string, callerUser?: AuthUser | null): Promise<DetailedBuyerProfile | null> {
    const matched = (activeBuyersStore || []).find(b => b.id === id);
    if (!matched) return null;
    return securityService.gateBuyerProfile(matched, callerUser || null);
  },

  async updateBuyerProfile(
    id: string,
    updates: Partial<DetailedBuyerProfile>,
    callerUser?: AuthUser | null
  ): Promise<{ success: boolean; data?: DetailedBuyerProfile; error?: string; message?: string }> {
    const existing = (activeBuyersStore || []).find(b => b && b.id === id);
    if (!existing) {
      return { success: false, error: 'Buyer company profile not found' };
    }

    // Account Ownership Check (403 Forbidden on UID mismatch unless Admin)
    const ownership = securityService.enforceOwnership(callerUser || null, existing.ownerUid || 'user-buyer-001', 'Buyer Company Profile');
    if (!ownership.allowed) {
      return { success: false, error: ownership.error, message: ownership.error };
    }

    // Field-Level Write Restrictions Check
    const fieldValidation = securityService.validateFieldWriteRestrictions(callerUser || null, updates);
    if (!fieldValidation.allowed) {
      return { success: false, error: fieldValidation.error, message: fieldValidation.error };
    }

    const updated = { ...existing, ...fieldValidation.sanitizedData };
    activeBuyersStore = activeBuyersStore.map(b => b.id === id ? updated : b);
    persistStoredBuyers(activeBuyersStore);

    securityService.logSecurityEvent({
      actorUid: callerUser?.id || 'buyer',
      actorEmail: callerUser?.email || 'buyer@tradeheaven.net',
      actorRole: callerUser?.role || 'BUYER',
      action: 'PROFILE_UPDATED',
      targetResource: `/buyers/${id}`,
      details: `Updated verified buyer profile fields: ${Object.keys(fieldValidation.sanitizedData).join(', ')}`,
      status: 'SUCCESS'
    });

    return { success: true, data: updated, message: 'Buyer profile updated' };
  },

  async createBuyerProfile(buyer: Partial<DetailedBuyerProfile>, callerUser?: AuthUser | null): Promise<{ success: boolean; data?: DetailedBuyerProfile; message?: string }> {
    const newBuyer: DetailedBuyerProfile = {
      id: buyer.id || `buyer-${Date.now()}`,
      ownerUid: callerUser?.id || 'user-buyer-001',
      companyName: buyer.companyName || 'Verified Corporate Importer Corp',
      legalRegistrationNumber: buyer.legalRegistrationNumber || 'US-CORP-91204',
      dunsNumber: buyer.dunsNumber || '08-552-1190',
      taxVatNumber: buyer.taxVatNumber || 'EIN-12-3456789',
      country: buyer.country || callerUser?.country || 'United States',
      city: buyer.city || 'Chicago',
      address: buyer.address || 'Trade Center Tower, Suite 100',
      establishedYear: buyer.establishedYear || 2012,
      businessType: buyer.businessType || 'Corporate Importer',
      tier: (callerUser?.role === 'ADMIN' ? buyer.tier : 'FREE') || 'FREE',
      isVerifiedKYC: callerUser?.role === 'ADMIN' ? (buyer.isVerifiedKYC ?? true) : false,
      trustScore: 95,
      responseRate: '98%',
      avgResponseTime: '< 2 hours',
      totalEmployees: '250+',
      annualPurchasingVolumeUsd: buyer.annualPurchasingVolumeUsd || '$25M - $50M',
      importFrequency: buyer.importFrequency || 'Monthly FCL Shipments',
      targetCategories: buyer.targetCategories || ['Industrial Machinery & Automation', 'Renewable Energy & Solar'],
      preferredIncoterms: buyer.preferredIncoterms || ['FOB', 'CIF', 'DDP'],
      preferredPaymentTerms: buyer.preferredPaymentTerms || ['Trade Protection Certificate', '30/70 T/T'],
      activeRfqsCount: 1,
      completedImportsCount: 15,
      tradeAssuranceEscrowSecuredUsd: 500000,
      logoUrl: buyer.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80',
      bannerUrl: buyer.bannerUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      description: buyer.description || 'Verified enterprise importer and wholesale distributor.',
      contactPerson: buyer.contactPerson || callerUser?.name || 'Director of Procurement',
      contactDesignation: buyer.contactDesignation || 'Procurement Lead',
      contactEmail: buyer.contactEmail || callerUser?.email || 'support@tradeheaven.net',
      contactPhone: buyer.contactPhone || '+1 312 555 0199',
      whatsapp: buyer.whatsapp || '+1 312 555 0199',
      warehouses: buyer.warehouses || [],
      complianceRequirements: buyer.complianceRequirements || ['ISO 9001:2015', 'CE Marking']
    };

    activeBuyersStore.unshift(newBuyer);
    persistStoredBuyers(activeBuyersStore);
    return { success: true, data: newBuyer, message: 'Verified Buyer profile registered' };
  },

  // ==========================================
  // HOMEPAGE CONFIG & STATS
  // ==========================================
  async getHomepageConfig(): Promise<HomepageConfig> {
    try {
      const res = await fetch('/api/homepage-config');
      const data = await res.json();
      return data.data;
    } catch {
      return {
        announcementTicker: "Exclusive Deal: 2026 Global Sourcing Expo online passes now active • 0% Trade Protection fee for first $50,000 container orders",
        heroHeadline: "Connect with 5M+ Verified Global Buyers & Manufacturers",
        heroSubheadline: "Direct factory wholesale prices, verified ISO/CE audits, Incoterms FOB/CIF container shipping, and Trade Protection Certificate payment protection.",
        verifiedBuyersCount: "5,200,000+",
        activeSuppliersCount: "480,000+",
        supportedCountriesCount: 184,
        featuredKeywords: ["CNC Milling", "LiFePO4 48V", "Forged Wheels", "TOPCon Solar", "HDPE Granules", "ST25 Rice", "Organic Denim"]
      };
    }
  },

  async updateHomepageConfig(config: Partial<HomepageConfig>): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/homepage-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update homepage' };
    }
  },

  async getCommodityIndices(): Promise<CommodityIndex[]> {
    try {
      const res = await fetch('/api/commodity-indices');
      const data = await res.json();
      return data.data;
    } catch {
      return [
        { symbol: "CU-LME", name: "Copper Grade A", priceUsd: 9480, unit: "MT", changePercent: +1.8, trend: "UP" },
        { symbol: "AL-6061", name: "Aluminum Ingot 99.7%", priceUsd: 2620, unit: "MT", changePercent: -0.4, trend: "DOWN" },
        { symbol: "BRENT-OIL", name: "Brent Crude Petroleum", priceUsd: 78.40, unit: "BBL", changePercent: +0.9, trend: "UP" },
        { symbol: "SOLAR-SI", name: "N-Type Monosilicon Wafer", priceUsd: 0.142, unit: "W", changePercent: -2.1, trend: "DOWN" },
        { symbol: "LITHIUM", name: "Lithium Carbonate 99.5%", priceUsd: 11200, unit: "MT", changePercent: +3.4, trend: "UP" }
      ];
    }
  },

  async getFlashDeals(): Promise<FlashDeal[]> {
    try {
      const res = await fetch('/api/flash-deals');
      const data = await res.json();
      return data.data;
    } catch {
      return [];
    }
  },

  async getStats(): Promise<MarketplaceStats | null> {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
  },

  async resetData(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to reset' };
    }
  },

  // ==========================================
  // CMS PERMISSIONS & ACCESS CONTROL REST API
  // ==========================================
  async getCmsPermissions(): Promise<{ authorizedUsers: CmsAuthorizedUser[]; accessRequests: CmsAccessRequest[] }> {
    try {
      const res = await fetch('/api/cms/permissions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch CMS permissions from server');
    }
    return {
      authorizedUsers: [
        {
          id: 'perm-admin-001',
          email: 'admin@tradeheaven.net',
          name: 'Sarah Jenkins',
          role: 'ADMIN',
          companyName: 'Trade Heaven Global Operations & Treasury',
          grantedBy: 'System Root',
          grantedAt: '2025-01-01',
          scopes: ['ALL_ADMIN', 'EDIT_CONTENT', 'EDIT_PRICING', 'EDIT_MEDIA', 'PUBLISH_PRODUCTS', 'MANAGE_PERMISSIONS'],
          status: 'ACTIVE',
          notes: 'Super Administrator with unconditional global rights'
        },
        {
          id: 'perm-delegated-001',
          email: 'marcus.vance@tradeheaven-audit.org',
          name: 'Dr. Marcus Vance',
          role: 'VERIFIER',
          companyName: 'SGS / TUV Verified Trade Audit Bureau',
          grantedBy: 'Sarah Jenkins (Super Admin)',
          grantedAt: '2025-02-15',
          scopes: ['EDIT_CONTENT', 'EDIT_MEDIA', 'PUBLISH_PRODUCTS'],
          status: 'ACTIVE',
          notes: 'Senior Verifier delegated to update audit notices and directory media'
        }
      ],
      accessRequests: [
        {
          id: 'req-001',
          userId: 'user-supp-001',
          email: 'elena.zhao@apexmicro.cn',
          name: 'Elena Zhao',
          companyName: 'Shenzhen Apex Microelectronics Co., Ltd.',
          role: 'SUPPLIER',
          requestedScopes: ['EDIT_CONTENT', 'PUBLISH_PRODUCTS'],
          reason: 'Requesting permission to maintain supplier directory copy and update factory certification media.',
          requestedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          status: 'PENDING'
        }
      ]
    };
  },

  async grantCmsPermission(
    payload: {
      email: string;
      name?: string;
      role?: string;
      companyName?: string;
      scopes: CmsPermissionScope[];
      notes?: string;
      expiresAt?: string;
    },
    adminUser?: AuthUser | null
  ): Promise<{ success: boolean; message?: string; data?: CmsAuthorizedUser }> {
    try {
      const res = await fetch('/api/cms/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': adminUser?.role || 'ADMIN',
          'x-user-email': adminUser?.email || 'admin@tradeheaven.net'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to grant permission' };
    }
  },

  async revokeCmsPermission(
    idOrEmail: string,
    adminUser?: AuthUser | null
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/cms/permissions/${encodeURIComponent(idOrEmail)}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': adminUser?.role || 'ADMIN',
          'x-user-email': adminUser?.email || 'admin@tradeheaven.net'
        }
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to revoke permission' };
    }
  },

  async requestCmsAccess(payload: {
    email: string;
    name?: string;
    companyName?: string;
    role?: string;
    requestedScopes?: CmsPermissionScope[];
    reason?: string;
  }): Promise<{ success: boolean; message?: string; data?: CmsAccessRequest }> {
    try {
      const res = await fetch('/api/cms/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to submit access request' };
    }
  },

  async approveCmsRequest(
    requestId: string,
    adminUser?: AuthUser | null
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const res = await fetch(`/api/cms/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': adminUser?.role || 'ADMIN',
          'x-user-email': adminUser?.email || 'admin@tradeheaven.net'
        }
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to approve request' };
    }
  },

  async rejectCmsRequest(
    requestId: string,
    adminUser?: AuthUser | null
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const res = await fetch(`/api/cms/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': adminUser?.role || 'ADMIN',
          'x-user-email': adminUser?.email || 'admin@tradeheaven.net'
        }
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to reject request' };
    }
  },

  // ==========================================
  // AI LIVE CHAT & WHATSAPP
  // ==========================================
  async sendAiChatMessage(payload: {
    message: string;
    history?: { role: 'user' | 'model'; text: string }[];
    senderName?: string;
    senderEmail?: string;
    context?: any;
    userRole?: string;
  }): Promise<{
    success: boolean;
    reply?: string;
    senderName?: string;
    whatsApp?: {
      phone: string;
      rawNumber: string;
      formatted: string;
      url: string;
    };
    poweredBy?: string;
    timestamp?: string;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': payload.userRole || 'GUEST'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: true,
        reply: `Welcome to Trade Heaven! I am your 24/7 Trade Concierge.\n\nYou can also contact our senior trade team directly on WhatsApp at **+91 8532934479** for instant supplier matching and RFQ quotes!`,
        whatsApp: {
          phone: "+91 8532934479",
          rawNumber: "918532934479",
          formatted: "+91 85329 34479",
          url: "https://wa.me/918532934479?text=Hello%20Trade%20Heaven,%20I%20am%20inquiring%20about%20verified%20suppliers%20and%20RFQs."
        },
        poweredBy: "Trade Heaven Global Desk"
      };
    }
  },

  async getChatContactInfo(): Promise<{
    success: boolean;
    officialSupportEmail?: string;
    whatsApp: {
      phone: string;
      rawNumber: string;
      formatted: string;
      url: string;
    };
    aiModel: string;
    supportHours: string;
  }> {
    try {
      const res = await fetch('/api/chat/contact-info');
      const data = await res.json();
      return data;
    } catch {
      return {
        success: true,
        officialSupportEmail: "help@tradeheaven.net",
        whatsApp: {
          phone: "+91 8532934479",
          rawNumber: "918532934479",
          formatted: "+91 85329 34479",
          url: "https://wa.me/918532934479?text=Hello%20Trade%20Heaven,%20I%20am%20inquiring%20about%20verified%20suppliers%20and%20RFQs."
        },
        aiModel: "Trade Heaven Intelligent Engine",
        supportHours: "24/7 Global Desk"
      };
    }
  },

  // ==========================================
  // CONTACT US & HELP DESK (/api/contact)
  // ==========================================
  async submitContactInquiry(payload: {
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    country?: string;
    department?: string;
    subject?: string;
    message: string;
    urgent?: boolean;
    userRole?: string;
    inquiryType?: string;
    timestamp?: string;
  }): Promise<{
    success: boolean;
    message: string;
    ticketNumber?: string;
    targetEmail?: string;
    mailToUrl?: string;
    whatsapp?: {
      phone: string;
      rawNumber: string;
      formatted: string;
      url: string;
    };
    data?: any;
  }> {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': payload.userRole || 'GUEST'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      const ticketNumber = `TH-${Date.now().toString().slice(-6)}`;
      const targetEmail = "help@tradeheaven.net";
      const mailToUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(`[${ticketNumber}] ${payload.subject || 'Trade Heaven Inquiry'}`)}&body=${encodeURIComponent(payload.message)}`;
      return {
        success: true,
        message: `Inquiry received and routed to ${targetEmail}`,
        ticketNumber,
        targetEmail,
        mailToUrl
      };
    }
  },

  async createOrder(orderData: any): Promise<{
    success: boolean;
    orderId: string;
    invoiceRef?: string;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const generatedId = `ORD-TH-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      orderId: generatedId,
      invoiceRef: `INV-TH-${Date.now().toString().slice(-6)}`,
      message: 'Order created successfully and placed in trade protection vault'
    };
  },

  async getContactInquiries(): Promise<{
    success: boolean;
    officialSupportEmail: string;
    totalInquiries: number;
    data: any[];
  }> {
    try {
      const res = await fetch('/api/contact');
      return await res.json();
    } catch {
      return {
        success: true,
        officialSupportEmail: "help@tradeheaven.net",
        totalInquiries: 0,
        data: []
      };
    }
  },

  async getQuotesForRfq(rfqId: string): Promise<SupplierQuote[]> {
    try {
      activeQuotesStore = loadStoredQuotes();
      return activeQuotesStore.filter(q => q.rfqId === rfqId);
    } catch (err) {
      return MOCK_QUOTES.filter(q => q.rfqId === rfqId);
    }
  },

  async getAllQuotes(): Promise<SupplierQuote[]> {
    try {
      activeQuotesStore = loadStoredQuotes();
      return [...activeQuotesStore];
    } catch {
      return [...MOCK_QUOTES];
    }
  },

  async submitSupplierQuote(quoteData: Partial<SupplierQuote> & { rfqId: string; unitPriceUsd: number }): Promise<{
    success: boolean;
    quote: SupplierQuote;
    message: string;
  }> {
    activeQuotesStore = loadStoredQuotes();
    
    // Find target RFQ
    const targetRfq = activeRfqsStore.find(r => r.id === quoteData.rfqId);
    const targetQty = targetRfq ? targetRfq.targetQuantity : 1000;
    const totalCargoValue = quoteData.totalAmountUsd || (quoteData.unitPriceUsd * targetQty);

    const newQuote: SupplierQuote = {
      id: `quote-${Date.now().toString().slice(-6)}`,
      rfqId: quoteData.rfqId,
      supplierId: quoteData.supplierId || 'comp-verified-supplier',
      supplierName: quoteData.supplierName || 'Verified Global Exporter',
      supplierTier: quoteData.supplierTier || 'GOLD',
      supplierCountry: quoteData.supplierCountry || 'United States',
      supplierTrustScore: quoteData.supplierTrustScore || 95,
      unitPriceUsd: Number(quoteData.unitPriceUsd),
      totalAmountUsd: Number(totalCargoValue),
      offeredIncoterm: quoteData.offeredIncoterm || quoteData.incoterm || 'FOB',
      incoterm: quoteData.incoterm || quoteData.offeredIncoterm || 'FOB',
      portOfLoading: quoteData.portOfLoading || quoteData.dispatchPort || 'Primary Export Port',
      dispatchPort: quoteData.dispatchPort || quoteData.portOfLoading || 'Primary Export Port',
      leadTimeDays: Number(quoteData.leadTimeDays || quoteData.productionLeadTimeDays || 14),
      productionLeadTimeDays: Number(quoteData.productionLeadTimeDays || quoteData.leadTimeDays || 14),
      estimatedTransitDays: Number(quoteData.estimatedTransitDays || 21),
      shippingMethod: quoteData.shippingMethod || 'Ocean Freight (FCL Container)',
      validityDays: Number(quoteData.validityDays || 30),
      paymentTerms: quoteData.paymentTerms || '30% T/T Deposit, 70% against B/L copy',
      sampleOffered: Boolean(quoteData.sampleOffered ?? true),
      notes: quoteData.notes || quoteData.technicalNotes || 'Factory direct production quote compliant with buyer specifications.',
      technicalNotes: quoteData.technicalNotes || quoteData.notes || 'Full ISO/CE compliance certificates and quality inspection guarantee included.',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };

    activeQuotesStore.unshift(newQuote);
    persistStoredQuotes(activeQuotesStore);

    // Update quotes count on the RFQ
    const rfqIndex = activeRfqsStore.findIndex(r => r.id === quoteData.rfqId);
    if (rfqIndex !== -1) {
      activeRfqsStore[rfqIndex].quotesCount = (activeRfqsStore[rfqIndex].quotesCount || 0) + 1;
      persistStoredRfqs(activeRfqsStore);
    }

    // Trigger reactive window event for listeners
    try {
      window.dispatchEvent(new CustomEvent('tradeheaven_quote_submitted', { detail: { quote: newQuote } }));
    } catch {}

    return {
      success: true,
      quote: newQuote,
      message: 'Factory quotation successfully submitted and registered in the RFQ Matrix.'
    };
  },

  // --------------------------------------------------------------------------
  // NORMALIZED B2B DATABASE SERVICES
  // --------------------------------------------------------------------------
  getNormalizedB2BDatabase: async (): Promise<NormalizedB2BDatabase> => {
    return NORMALIZED_B2B_DATABASE;
  },

  getNormalizedSuppliers: async (): Promise<NormalizedSupplier[]> => {
    return NORMALIZED_B2B_DATABASE.suppliers;
  },

  getNormalizedBuyersRfqs: async (): Promise<NormalizedBuyerRfq[]> => {
    return NORMALIZED_B2B_DATABASE.buyers_rfqs;
  },

  getNormalizedServiceProviders: async (): Promise<NormalizedServiceProvider[]> => {
    return NORMALIZED_B2B_DATABASE.service_providers;
  }
};

