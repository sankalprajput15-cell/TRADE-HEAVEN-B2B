/**
 * Service to manage the Go4WorldBusiness-style Daily Free Buyer Lead feature.
 * Suppliers get 1 free unvetted buyer inquiry credit every 24 hours.
 */

export interface FreeLeadState {
  canClaim: boolean;
  claimedRfqId: string | null;
  claimedTimestamp: number | null;
  msRemaining: number;
  timeRemainingFormatted: string;
  claimedRfqIdsHistory: string[];
}

const STORAGE_KEY = 'tradeheaven_daily_free_lead_claim_v1';
const CLAIM_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export const getFreeLeadStatus = (): FreeLeadState => {
  if (typeof window === 'undefined') {
    return {
      canClaim: true,
      claimedRfqId: null,
      claimedTimestamp: null,
      msRemaining: 0,
      timeRemainingFormatted: '',
      claimedRfqIdsHistory: []
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        canClaim: true,
        claimedRfqId: null,
        claimedTimestamp: null,
        msRemaining: 0,
        timeRemainingFormatted: '',
        claimedRfqIdsHistory: []
      };
    }

    const data = JSON.parse(raw);
    const lastTimestamp = typeof data.claimedTimestamp === 'number' ? data.claimedTimestamp : null;
    const claimedRfqId = data.claimedRfqId || null;
    const history = Array.isArray(data.claimedRfqIdsHistory) ? data.claimedRfqIdsHistory : [];

    if (!lastTimestamp) {
      return {
        canClaim: true,
        claimedRfqId: null,
        claimedTimestamp: null,
        msRemaining: 0,
        timeRemainingFormatted: '',
        claimedRfqIdsHistory: history
      };
    }

    const elapsed = Date.now() - lastTimestamp;
    if (elapsed >= CLAIM_INTERVAL_MS) {
      // 24 hours elapsed! User can claim a fresh new lead today!
      return {
        canClaim: true,
        claimedRfqId: null,
        claimedTimestamp: null,
        msRemaining: 0,
        timeRemainingFormatted: '',
        claimedRfqIdsHistory: history
      };
    }

    // Still within current 24-hour window
    const msRemaining = CLAIM_INTERVAL_MS - elapsed;
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const formatted = `${hours}h ${minutes}m`;

    return {
      canClaim: false,
      claimedRfqId,
      claimedTimestamp: lastTimestamp,
      msRemaining,
      timeRemainingFormatted: formatted,
      claimedRfqIdsHistory: history
    };
  } catch (e) {
    console.warn('[freeLeadService] Failed to read storage:', e);
    return {
      canClaim: true,
      claimedRfqId: null,
      claimedTimestamp: null,
      msRemaining: 0,
      timeRemainingFormatted: '',
      claimedRfqIdsHistory: []
    };
  }
};

export const isPaidMemberUser = (user: any): boolean => {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.isVerifiedAdmin === true) return true;

  const idStr = String(user.id || user.supplierId || '').trim();
  const emailStr = String(user.email || user.supplierEmail || '').toLowerCase().trim();
  const compStr = String(user.companyName || user.company_name || '').toLowerCase().trim();
  if (
    PAID_ENTITY_IDS.has(idStr) ||
    emailStr.includes('mpcommoditybroker') ||
    compStr.includes('mp commodity brokers')
  ) {
    return true;
  }

  const statusStr = String(user.membershipStatus || '').toLowerCase();
  const planStr = String(user.plan || '').toLowerCase();
  const tierStr = String(user.tier || '').toLowerCase();

  // Explicitly block free or unupgraded accounts even if they have a default display tier
  if (user.isPremium === false && (statusStr === 'free' || statusStr === 'verified' || statusStr === '')) {
    if (!planStr || planStr.includes('free')) {
      return false;
    }
  }

  return (
    user.isPremium === true ||
    statusStr === 'paid' ||
    statusStr === 'basic' ||
    statusStr === 'vip' ||
    statusStr === 'gold' ||
    (planStr.length > 0 && !planStr.includes('free')) ||
    (statusStr !== 'free' &&
      statusStr !== 'verified' &&
      (tierStr.includes('basic') ||
        tierStr.includes('vip') ||
        tierStr.includes('gold') ||
        tierStr.includes('silver') ||
        tierStr.includes('platinum') ||
        tierStr.includes('paid') ||
        tierStr.includes('enterprise') ||
        tierStr.includes('establishment') ||
        tierStr.includes('featured')))
  );
};

const PAID_ENTITY_IDS = new Set([
  'comp-atlantic-power-equip',
  'comp-joy-bamboo-forest-farm',
  'comp-melissa-mpcommodity',
  'comp-middle-fox-llc',
  'comp-apex-motorsport',
  'comp-shenzhen-batt',
  'comp-eec-poland-sp-zoo',
  'user-supplier-mark-johnson',
  'user-supplier-svetlana',
  'user-supplier-melissa',
  'user-supplier-randy'
]);

/**
 * Checks whether an entity (buyer, supplier, user, or RFQ tender) belongs to a paid member.
 */
export const isPaidEntity = (entity: any): boolean => {
  if (!entity) return false;
  if (entity.role === 'ADMIN' || entity.isVerifiedAdmin === true) return true;
  if (entity.isPremium === true) return true;

  const entityId = String(entity.id || entity.supplierId || entity.buyerId || entity.ownerUid || '').trim();
  if (PAID_ENTITY_IDS.has(entityId)) return true;

  const tier = String(entity.tier || entity.supplierTier || entity.memberTierLabel || '').toLowerCase();
  if (
    tier.includes('vip') ||
    tier.includes('gold') ||
    tier.includes('silver') ||
    tier.includes('platinum') ||
    tier.includes('basic') ||
    tier.includes('paid') ||
    tier.includes('enterprise') ||
    tier.includes('establishment') ||
    tier.includes('featured')
  ) {
    return true;
  }

  const membership = String(entity.membershipStatus || '').toLowerCase();
  if (membership === 'paid' || membership === 'basic' || membership === 'vip' || membership === 'gold') {
    return true;
  }

  const plan = String(entity.plan || '').toLowerCase();
  if (plan.length > 0 && !plan.includes('free')) {
    return true;
  }

  // RFQ lead-specific indicators of paid/VIP buyers or suppliers
  const title = String(entity.title || entity.productName || '').toLowerCase();
  const paymentTerms = String(entity.paymentTerms || '').toLowerCase();
  const buyerCompany = String(entity.buyerCompany || entity.companyName || '').toLowerCase();
  const detailed = String(entity.detailedRequirements || entity.detailedDescription || entity.description || '').toLowerCase();
  const email = String(entity.buyerEmail || entity.contactEmail || entity.email || '').toLowerCase();

  if (
    entity.isVipExclusive === true ||
    entity.isDiwaliOffer === true ||
    title.includes('vip') ||
    title.includes('golden lead') ||
    title.includes('special diwali') ||
    paymentTerms.includes('only accessed by vip') ||
    paymentTerms.includes('100% advance') ||
    buyerCompany.includes('vip golden lead') ||
    buyerCompany.includes('canadian northern grid') ||
    buyerCompany.includes('atlantic power') ||
    buyerCompany.includes('joy bamboo') ||
    buyerCompany.includes('mp commodity') ||
    buyerCompany.includes('middle fork') ||
    detailed.includes('basic plan') ||
    detailed.includes('paid basic') ||
    detailed.includes('only accessed by vip') ||
    email.includes('atlanticpowerequip') ||
    email.includes('midforkcap') ||
    email.includes('mpcommoditybroker') ||
    email.includes('joybambooforestfarm') ||
    email.includes('sorkindon') ||
    email.includes('titanindustrial')
  ) {
    return true;
  }

  return false;
};

/**
 * Redacts embedded emails, phone numbers, URLs, street addresses, and personal contact names
 * from free-text descriptions when the viewer is not a paid member.
 */
export const redactSensitiveContactText = (text?: string, canView: boolean = false): string => {
  if (!text) return '';
  if (canView) return text;

  let cleaned = text;
  // Remove parenthesized contact/address blocks like (216 N Main St, ... | email | phone)
  cleaned = cleaned.replace(/\([^)]*(?:@|\+\d|NSW\s*\d{4}|street|Main\s*St|Ste\s*\d+)[^)]*\)/gi, '');
  // Redact email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[🔒 Protected Email]');
  // Redact websites
  cleaned = cleaned.replace(/(?:https?:\/\/|www\.)[^\s,)|]+/gi, '[🔒 Protected Website]');
  // Redact phone numbers
  cleaned = cleaned.replace(/(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}/g, '[🔒 Protected Phone]');
  // Redact P.O. Boxes and explicit mailing address sentences
  cleaned = cleaned.replace(/Corporate Mailing Address:[^.]*\./gi, '');
  cleaned = cleaned.replace(/Farm address where the bamboo will be picked up[^.]*\./gi, '');
  cleaned = cleaned.replace(/Managed by [^.]*\./gi, '');
  cleaned = cleaned.replace(/Authorized Representative:[^.]*\./gi, '');
  cleaned = cleaned.replace(/Note:\s*Direct on-site fund transfers are not active[^.]*\./gi, '');
  cleaned = cleaned.replace(/P\.?O\.?\s*Box\s*\d+[^,.]*/gi, '[🔒 Protected Address]');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  return cleaned;
};

/**
 * Verifies if a given RFQ can be claimed via the daily free lead credit.
 * Unpaid members are strictly disallowed from claiming or seeing contact data of paid members.
 */
export const canClaimRfqFree = (
  rfq: any,
  user: any
): { allowed: boolean; reason?: string } => {
  const isPaidTarget = isPaidEntity(rfq);
  const isCallerPaid = isPaidMemberUser(user);

  if (isPaidTarget && !isCallerPaid) {
    return {
      allowed: false,
      reason: 'This buy lead is posted by a verified paid member. By platform policy, unpaid members cannot access contact information of paid suppliers, buyers, or users with free credits. Upgrade to a paid plan to unlock.'
    };
  }

  const status = getFreeLeadStatus();
  if (!status.canClaim) {
    return {
      allowed: false,
      reason: `Daily free lead already claimed today. Next free lead available in ${status.timeRemainingFormatted || '24 hours'}.`
    };
  }

  return { allowed: true };
};

export const claimDailyFreeLead = (rfqId: string, rfq?: any, currentUser?: any): FreeLeadState => {
  if (typeof window === 'undefined') return getFreeLeadStatus();

  // If RFQ is provided and represents a paid member, reject claim for unpaid users
  if (rfq && isPaidEntity(rfq) && !isPaidMemberUser(currentUser)) {
    console.warn('[freeLeadService] Blocked attempt by unpaid member to claim paid entity lead:', rfqId);
    return getFreeLeadStatus();
  }

  try {
    const current = getFreeLeadStatus();
    const historySet = new Set(current.claimedRfqIdsHistory);
    historySet.add(rfqId);

    const updated = {
      claimedRfqId: rfqId,
      claimedTimestamp: Date.now(),
      claimedRfqIdsHistory: Array.from(historySet)
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for real-time reactivity across components
    window.dispatchEvent(new CustomEvent('tradeheaven_free_lead_updated', {
      detail: { rfqId, timestamp: updated.claimedTimestamp }
    }));

    return getFreeLeadStatus();
  } catch (e) {
    console.error('[freeLeadService] Failed to save claim:', e);
    return getFreeLeadStatus();
  }
};

export const isRfqClaimedFree = (rfqId: string): boolean => {
  if (!rfqId) return false;
  const status = getFreeLeadStatus();
  // Active in current 24 hour window
  if (status.claimedRfqId === rfqId) return true;
  // Or in historically claimed free leads
  return status.claimedRfqIdsHistory.includes(rfqId);
};

// ============================================================================
// FREE TIER DAILY BUYER MESSAGE QUOTA (STRICT 1 MESSAGE / 24 HOURS)
// ============================================================================

export const FREE_MEMBER_DAILY_MESSAGE_LIMIT = 1;
const DAILY_MSG_STORAGE_KEY = 'tradeheaven_free_member_daily_message_v1';

export interface SupplierDailyMessageQuota {
  isFreeMember: boolean;
  dailyLimit: number | null;
  sentToday: number;
  remainingToday: number | null;
  isRestricted: boolean;
  nextResetAt: string | null;
  resetInFormatted: string;
  accountTier: string;
  supplierEmail?: string;
  supplierId?: string;
}

interface LocalMessageSendRecord {
  sentAt: number;
  targetId?: string;
}

function getSupplierQuotaKey(user: any): string {
  const email = String(user?.email || '').trim().toLowerCase();
  if (email) return email;
  const id = String(user?.id || '').trim();
  return id || 'anonymous';
}

function formatQuotaDuration(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function isFreeTierSupplierUser(user: any): boolean {
  if (!user) return false;
  if (String(user.role || '').toUpperCase() === 'ADMIN' || user.isVerifiedAdmin === true) return false;
  return !isPaidMemberUser(user);
}

function readLocalDailyMessageStore(): Record<string, LocalMessageSendRecord[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DAILY_MSG_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getLocalFreeMemberMessageQuota(user: any): SupplierDailyMessageQuota {
  const isFree = isFreeTierSupplierUser(user);
  const accountTier = String(user?.tier || (isFree ? 'Free Member' : 'Paid Member'));
  const supplierEmail = String(user?.email || '').trim().toLowerCase();
  const supplierId = String(user?.id || '').trim();

  if (!isFree) {
    return {
      isFreeMember: false,
      dailyLimit: null,
      sentToday: 0,
      remainingToday: null,
      isRestricted: false,
      nextResetAt: null,
      resetInFormatted: '',
      accountTier,
      supplierEmail,
      supplierId
    };
  }

  const now = Date.now();
  const cutoff = now - CLAIM_INTERVAL_MS;
  const store = readLocalDailyMessageStore();
  const key = getSupplierQuotaKey(user);
  const entries = Array.isArray(store[key])
    ? store[key].filter(e => e && typeof e.sentAt === 'number' && e.sentAt >= cutoff).sort((a, b) => a.sentAt - b.sentAt)
    : [];

  const sentToday = entries.length;
  const remainingToday = Math.max(0, FREE_MEMBER_DAILY_MESSAGE_LIMIT - sentToday);
  const isRestricted = sentToday >= FREE_MEMBER_DAILY_MESSAGE_LIMIT;
  const earliest = entries.length > 0 ? entries[0].sentAt : null;
  const nextResetMs = earliest ? earliest + CLAIM_INTERVAL_MS : null;

  return {
    isFreeMember: true,
    dailyLimit: FREE_MEMBER_DAILY_MESSAGE_LIMIT,
    sentToday,
    remainingToday,
    isRestricted,
    nextResetAt: nextResetMs ? new Date(nextResetMs).toISOString() : null,
    resetInFormatted: nextResetMs ? formatQuotaDuration(Math.max(0, nextResetMs - now)) : '',
    accountTier,
    supplierEmail,
    supplierId
  };
}

export function recordLocalFreeMemberMessageSend(user: any, targetId?: string): SupplierDailyMessageQuota {
  if (typeof window === 'undefined' || !isFreeTierSupplierUser(user)) {
    return getLocalFreeMemberMessageQuota(user);
  }
  try {
    const now = Date.now();
    const cutoff = now - CLAIM_INTERVAL_MS;
    const store = readLocalDailyMessageStore();
    const key = getSupplierQuotaKey(user);
    const existing = Array.isArray(store[key])
      ? store[key].filter(e => e && typeof e.sentAt === 'number' && e.sentAt >= cutoff)
      : [];
    existing.push({ sentAt: now, targetId });
    store[key] = existing;
    localStorage.setItem(DAILY_MSG_STORAGE_KEY, JSON.stringify(store));
  } catch {}

  const updated = getLocalFreeMemberMessageQuota(user);
  try {
    window.dispatchEvent(new CustomEvent('tradeheaven_free_message_quota_updated', { detail: updated }));
  } catch {}
  return updated;
}

function mergeQuotaWithLocal(serverQuota: SupplierDailyMessageQuota, localQuota: SupplierDailyMessageQuota): SupplierDailyMessageQuota {
  if (!serverQuota.isFreeMember && !localQuota.isFreeMember) {
    return serverQuota;
  }
  const sentToday = Math.max(Number(serverQuota.sentToday || 0), Number(localQuota.sentToday || 0));
  const dailyLimit = serverQuota.dailyLimit ?? FREE_MEMBER_DAILY_MESSAGE_LIMIT;
  const remainingToday = Math.max(0, dailyLimit - sentToday);
  return {
    ...serverQuota,
    isFreeMember: true,
    dailyLimit,
    sentToday,
    remainingToday,
    isRestricted: sentToday >= dailyLimit,
    nextResetAt: serverQuota.nextResetAt || localQuota.nextResetAt,
    resetInFormatted: serverQuota.resetInFormatted || localQuota.resetInFormatted
  };
}

export async function fetchSupplierDailyMessageQuota(params: {
  supplierId?: string;
  supplierEmail?: string;
  conversationId?: string;
  authToken?: string;
  user?: any;
}): Promise<SupplierDailyMessageQuota> {
  const localQuota = getLocalFreeMemberMessageQuota(params.user);
  try {
    const qs = new URLSearchParams({ _t: String(Date.now()) });
    if (params.supplierId) qs.set('supplier_id', params.supplierId);
    if (params.supplierEmail) qs.set('supplier_email', params.supplierEmail);
    if (params.conversationId) qs.set('conversation_id', params.conversationId);

    const headers: Record<string, string> = { Accept: 'application/json', 'Cache-Control': 'no-cache' };
    if (params.authToken) {
      headers.Authorization = `Bearer ${params.authToken}`;
    }

    const res = await fetch(`/api/v1/chat/supplier-message-quota?${qs.toString()}`, {
      cache: 'no-store',
      headers
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.data) {
      return mergeQuotaWithLocal(json.data as SupplierDailyMessageQuota, localQuota);
    }
  } catch {}
  return localQuota;
}

export async function recordServerDailyMessageSend(params: {
  supplierId?: string;
  supplierEmail?: string;
  conversationId?: string;
  targetId?: string;
  targetType?: 'chat' | 'pitch' | 'quote' | 'inquiry';
  authToken?: string;
  user?: any;
}): Promise<{ allowed: boolean; quota: SupplierDailyMessageQuota; message?: string }> {
  const localQuota = getLocalFreeMemberMessageQuota(params.user);
  if (localQuota.isFreeMember && localQuota.isRestricted) {
    return {
      allowed: false,
      quota: localQuota,
      message: `Daily limit reached: Free tier members can only send 1 message to buyers per day (${localQuota.sentToday}/${localQuota.dailyLimit} used).`
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (params.authToken) {
      headers.Authorization = `Bearer ${params.authToken}`;
    }
    const res = await fetch('/api/v1/chat/record-daily-message', {
      method: 'POST',
      cache: 'no-store',
      headers,
      body: JSON.stringify({
        supplierId: params.supplierId || params.user?.id || '',
        supplierEmail: params.supplierEmail || params.user?.email || '',
        conversationId: params.conversationId || '',
        targetId: params.targetId || '',
        targetType: params.targetType || 'pitch'
      })
    });
    const json = await res.json().catch(() => ({}));
    const serverQuota = (json?.data || localQuota) as SupplierDailyMessageQuota;

    if (res.status === 429 || json?.code === 'FREE_MEMBER_DAILY_MESSAGE_LIMIT') {
      const merged = mergeQuotaWithLocal(serverQuota, localQuota);
      try {
        window.dispatchEvent(new CustomEvent('tradeheaven_free_message_quota_updated', { detail: merged }));
      } catch {}
      return {
        allowed: false,
        quota: merged,
        message: json?.message || 'Daily limit reached: Free tier members can only send 1 message to buyers per day.'
      };
    }

    if (res.ok) {
      const updatedLocal = isFreeTierSupplierUser(params.user)
        ? recordLocalFreeMemberMessageSend(params.user, params.targetId || params.conversationId)
        : localQuota;
      const merged = mergeQuotaWithLocal(serverQuota, updatedLocal);
      try {
        window.dispatchEvent(new CustomEvent('tradeheaven_free_message_quota_updated', { detail: merged }));
      } catch {}
      return { allowed: true, quota: merged };
    }
  } catch {}

  // Offline / transient network fallback
  if (isFreeTierSupplierUser(params.user)) {
    const updated = recordLocalFreeMemberMessageSend(params.user, params.targetId || params.conversationId);
    return { allowed: true, quota: updated };
  }
  return { allowed: true, quota: localQuota };
}
