import { AuthUser, DetailedVendorProfile, Product } from '../types';
import { MOCK_COMPANIES } from '../data/mockData';
import { DETAILED_VENDOR_PROFILES, getDetailedVendorProfile } from '../data/detailedVendorProfiles';
import { loadCustomVendorProfile } from './mediaUploadUtils';

const USER_TO_STOREFRONT_ID: Record<string, string> = {
  'user-supplier-melissa': 'comp-melissa-mpcommodity',
  'user-supplier-zac': 'comp-zac-importation-fadetech',
  'user-supplier-svetlana': 'comp-joy-bamboo-forest-farm',
  'user-supplier-randy': 'comp-middle-fox-llc',
  'user-supplier-mark': 'comp-atlantic-power-equip',
  'user-supplier-afreh-yaw': 'comp-afreh-group-limited'
};

/**
 * Resolves the canonical storefront companyId for any signed-in user
 * so dashboard actions, newly added products, and public storefront previews stay 100% aligned.
 */
export function resolveUserStorefrontId(user?: AuthUser | null): string {
  if (!user) return 'comp-melissa-mpcommodity';

  const uid = String(user.id || '').trim();
  const email = String(user.email || '').toLowerCase().trim();
  const companyName = String(user.companyName || '').toLowerCase().trim();

  if (uid && USER_TO_STOREFRONT_ID[uid]) {
    return USER_TO_STOREFRONT_ID[uid];
  }

  if (email.includes('mpcommoditybroker')) return 'comp-melissa-mpcommodity';
  if (email.includes('midforkcap') || email.includes('randy@')) return 'comp-middle-fox-llc';
  if (email.includes('atlanticpowerequip') || email.includes('mjohnson@')) return 'comp-atlantic-power-equip';
  if (email.includes('joybambooforestfarm')) return 'comp-joy-bamboo-forest-farm';
  if (email.includes('fadetech') || email.includes('zac@')) return 'comp-zac-importation-fadetech';

  if (uid && DETAILED_VENDOR_PROFILES[uid]) {
    return uid;
  }

  const detailedMatch = Object.values(DETAILED_VENDOR_PROFILES).find(v => {
    const vEmail = String(v.contactEmail || '').toLowerCase().trim();
    const vCompany = String(v.companyName || '').toLowerCase().trim();
    return (email && vEmail === email) || (companyName && vCompany === companyName);
  });
  if (detailedMatch) return detailedMatch.id;

  const mockCompanyMatch = MOCK_COMPANIES.find(c => {
    const cEmail = String(c.contactEmail || '').toLowerCase().trim();
    const cCompany = String(c.companyName || '').toLowerCase().trim();
    return (
      (uid && c.ownerUid === uid) ||
      (uid && c.id === uid) ||
      (email && cEmail === email) ||
      (companyName && cCompany === companyName)
    );
  });
  if (mockCompanyMatch) return mockCompanyMatch.id;

  if (uid) {
    return uid.startsWith('comp-') ? uid : `comp-${uid}`;
  }
  return 'comp-default';
}

/**
 * Builds an editable, complete DetailedVendorProfile for the current user,
 * preferring any saved custom storefront edits in localStorage.
 */
export function buildVendorProfileForUser(
  user?: AuthUser | null,
  explicitCompanyId?: string
): DetailedVendorProfile {
  const storefrontId = explicitCompanyId || resolveUserStorefrontId(user);
  const customSaved = loadCustomVendorProfile(storefrontId);
  if (customSaved) {
    return customSaved;
  }

  const mockComp = MOCK_COMPANIES.find(
    c =>
      c.id === storefrontId ||
      (user?.email && c.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
      (user?.companyName && c.companyName?.toLowerCase() === user.companyName.toLowerCase())
  );

  const base = getDetailedVendorProfile(storefrontId, mockComp || {
    id: storefrontId,
    companyName: user?.companyName || (user?.name ? `${user.name} Enterprise` : 'My Trade Heaven Storefront'),
    country: user?.country || 'Global',
    contactPerson: user?.name || 'Trade Representative',
    contactEmail: user?.email || 'contact@tradeheaven.net',
    contactPhone: user?.phone || '+1 (800) 555-0199',
    whatsapp: user?.phone || '+1 (800) 555-0199',
    tier: (user?.tier as any) || 'GOLD'
  });

  if (!user) return base;

  return {
    ...base,
    id: base.id || storefrontId,
    companyName: DETAILED_VENDOR_PROFILES[storefrontId] ? base.companyName : (user.companyName || base.companyName),
    country: DETAILED_VENDOR_PROFILES[storefrontId] ? base.country : (user.country || base.country),
    contactPerson: DETAILED_VENDOR_PROFILES[storefrontId] ? base.contactPerson : (user.name || base.contactPerson),
    contactEmail: DETAILED_VENDOR_PROFILES[storefrontId] ? base.contactEmail : (user.email || base.contactEmail),
    contactPhone: DETAILED_VENDOR_PROFILES[storefrontId] ? base.contactPhone : (user.phone || base.contactPhone)
  };
}

/**
 * Determines whether a catalog product belongs to the given storefront/user.
 */
export function doesProductBelongToStorefront(
  product: Product | null | undefined,
  storefrontId: string,
  user?: AuthUser | null
): boolean {
  if (!product) return false;
  const pSuppId = String(product.supplierId || '').trim();
  const sId = String(storefrontId || '').trim();
  const uId = String(user?.id || '').trim();

  if (pSuppId && sId && pSuppId === sId) return true;
  if (pSuppId && uId && pSuppId === uId) return true;

  const userEmail = String(user?.email || '').toLowerCase().trim();
  const userCompany = String(user?.companyName || '').toLowerCase().trim();
  const prodCompany = String(product.supplierName || '').toLowerCase().trim();

  if (userCompany && prodCompany && (prodCompany === userCompany || prodCompany.includes(userCompany.slice(0, 12)))) {
    return true;
  }
  if (userEmail && userEmail.includes('mpcommoditybroker') && product.id.includes('melissa')) {
    return true;
  }
  if (userEmail && (userEmail.includes('mjohnson') || userEmail.includes('atlanticpowerequip')) && product.id.includes('mj-')) {
    return true;
  }
  return false;
}

export function getPublicStorefrontUrl(storefrontId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tradeheaven.net';
  return `${origin}/?view=VENDOR_PROFILE&supplier=${encodeURIComponent(storefrontId)}`;
}
