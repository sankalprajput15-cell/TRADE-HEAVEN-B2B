import { RfqRequirement } from '../types';

const STORAGE_KEY_PREFIX = 'tradeheaven_saved_leads';
const CACHE_KEY_PREFIX = 'tradeheaven_saved_rfq_cache';

function getStorageKey(userEmail?: string | null): string {
  if (userEmail && userEmail.trim()) {
    return `${STORAGE_KEY_PREFIX}_${userEmail.trim().toLowerCase()}`;
  }
  return `${STORAGE_KEY_PREFIX}_global`;
}

function getCacheKey(userEmail?: string | null): string {
  if (userEmail && userEmail.trim()) {
    return `${CACHE_KEY_PREFIX}_${userEmail.trim().toLowerCase()}`;
  }
  return `${CACHE_KEY_PREFIX}_global`;
}

export function getSavedLeadIds(userEmail?: string | null): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userEmail);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback to global if user-specific is empty
    if (userEmail) {
      const globalData = localStorage.getItem(`${STORAGE_KEY_PREFIX}_global`);
      if (globalData) {
        const parsed = JSON.parse(globalData);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('[savedLeadsService getSavedLeadIds error]:', err);
  }
  return [];
}

export function isLeadSaved(rfqId: string, userEmail?: string | null): boolean {
  if (!rfqId) return false;
  const ids = getSavedLeadIds(userEmail);
  return ids.includes(rfqId);
}

function getCachedRfqs(userEmail?: string | null): Record<string, RfqRequirement> {
  if (typeof window === 'undefined') return {};
  try {
    const key = getCacheKey(userEmail);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) || {};
    }
  } catch (e) {
    console.error('[savedLeadsService getCachedRfqs error]:', e);
  }
  return {};
}

function saveCachedRfq(rfq: RfqRequirement, userEmail?: string | null): void {
  if (typeof window === 'undefined' || !rfq || !rfq.id) return;
  try {
    const key = getCacheKey(userEmail);
    const current = getCachedRfqs(userEmail);
    current[rfq.id] = rfq;
    localStorage.setItem(key, JSON.stringify(current));
  } catch (e) {
    console.error('[savedLeadsService saveCachedRfq error]:', e);
  }
}

export function saveLead(rfq: RfqRequirement, userEmail?: string | null): boolean {
  if (typeof window === 'undefined' || !rfq || !rfq.id) return false;
  try {
    const key = getStorageKey(userEmail);
    const ids = getSavedLeadIds(userEmail);
    if (!ids.includes(rfq.id)) {
      const updated = [rfq.id, ...ids];
      localStorage.setItem(key, JSON.stringify(updated));
      saveCachedRfq(rfq, userEmail);

      window.dispatchEvent(
        new CustomEvent('tradeheaven_saved_leads_updated', {
          detail: { rfqId: rfq.id, isSaved: true, savedIds: updated }
        })
      );
      return true;
    }
  } catch (err) {
    console.error('[savedLeadsService saveLead error]:', err);
  }
  return false;
}

export function removeSavedLead(rfqId: string, userEmail?: string | null): boolean {
  if (typeof window === 'undefined' || !rfqId) return false;
  try {
    const key = getStorageKey(userEmail);
    const ids = getSavedLeadIds(userEmail);
    if (ids.includes(rfqId)) {
      const updated = ids.filter(id => id !== rfqId);
      localStorage.setItem(key, JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent('tradeheaven_saved_leads_updated', {
          detail: { rfqId, isSaved: false, savedIds: updated }
        })
      );
      return true;
    }
  } catch (err) {
    console.error('[savedLeadsService removeSavedLead error]:', err);
  }
  return false;
}

export function toggleSaveLead(rfq: RfqRequirement, userEmail?: string | null): boolean {
  if (!rfq || !rfq.id) return false;
  if (isLeadSaved(rfq.id, userEmail)) {
    removeSavedLead(rfq.id, userEmail);
    return false;
  } else {
    saveLead(rfq, userEmail);
    return true;
  }
}

export function getSavedLeads(availableRfqs: RfqRequirement[] = [], userEmail?: string | null): RfqRequirement[] {
  const ids = getSavedLeadIds(userEmail);
  if (ids.length === 0) return [];

  const cached = getCachedRfqs(userEmail);
  const rfqMap = new Map<string, RfqRequirement>();

  // Populate from available live RFQs
  availableRfqs.forEach(r => {
    if (r && r.id) rfqMap.set(r.id, r);
  });

  // Populate from cached saved RFQs if not found in availableRfqs
  Object.values(cached).forEach(r => {
    if (r && r.id && !rfqMap.has(r.id)) {
      rfqMap.set(r.id, r);
    }
  });

  const result: RfqRequirement[] = [];
  ids.forEach(id => {
    const found = rfqMap.get(id);
    if (found) {
      result.push(found);
    }
  });

  return result;
}

export function subscribeToSavedLeads(callback: (savedIds: string[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ savedIds?: string[] }>;
    if (custom?.detail?.savedIds) {
      callback(custom.detail.savedIds);
    } else {
      callback(getSavedLeadIds());
    }
  };

  window.addEventListener('tradeheaven_saved_leads_updated', handler);
  return () => {
    window.removeEventListener('tradeheaven_saved_leads_updated', handler);
  };
}
