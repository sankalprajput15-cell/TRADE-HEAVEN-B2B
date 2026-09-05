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

export const claimDailyFreeLead = (rfqId: string): FreeLeadState => {
  if (typeof window === 'undefined') return getFreeLeadStatus();

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
