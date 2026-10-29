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
  'comp-zac-importation-fadetech',
  'comp-apex-motorsport',
  'comp-shenzhen-batt',
  'comp-eec-poland-sp-zoo',
  'user-supplier-mark-johnson',
  'user-supplier-svetlana',
  'user-supplier-melissa',
  'user-supplier-randy',
  'user-supplier-zac'
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
    buyerCompany.includes('fade-tech') ||
    buyerCompany.includes('otec ltd') ||
    detailed.includes('basic plan') ||
    detailed.includes('paid basic') ||
    detailed.includes('only accessed by vip') ||
    email.includes('atlanticpowerequip') ||
    email.includes('midforkcap') ||
    email.includes('mpcommoditybroker') ||
    email.includes('joybambooforestfarm') ||
    email.includes('otec.ltd') ||
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

