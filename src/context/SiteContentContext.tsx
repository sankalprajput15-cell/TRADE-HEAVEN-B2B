import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SiteContent, DEFAULT_SITE_CONTENT, DEFAULT_HOMEPAGE_DISPLAY_CONFIG } from '../data/defaultSiteContent';
import { AuthUser, CmsAuthorizedUser, CmsAccessRequest, CmsPermissionScope, UserRole } from '../types';
import { useAuth, isStrictVerifiedRootAdmin } from './AuthContext';
import { api } from '../services/apiService';
import { securityService } from '../services/securityService';
import { apiClient } from '../services/apiClient';
import { productImageManagerService, normalizeProductAssetUrl } from '../services/productImageManagerService';

export interface RbacRolePermissions {
  canEditCmsContent: boolean;
  canReleaseEscrow: boolean;
  canPostRfq: boolean;
  canSubmitQuotes: boolean;
  canVerifySuppliers: boolean;
  canManageData: boolean;
}

export type RbacMatrix = Record<UserRole, RbacRolePermissions>;

export const DEFAULT_RBAC_CONFIG: RbacMatrix = {
  ADMIN: {
    canEditCmsContent: true,
    canReleaseEscrow: true,
    canPostRfq: true,
    canSubmitQuotes: true,
    canVerifySuppliers: true,
    canManageData: true
  },
  BUYER: {
    canEditCmsContent: false,
    canReleaseEscrow: true,
    canPostRfq: true,
    canSubmitQuotes: false,
    canVerifySuppliers: false,
    canManageData: false
  },
  SUPPLIER: {
    canEditCmsContent: false,
    canReleaseEscrow: false,
    canPostRfq: false,
    canSubmitQuotes: true,
    canVerifySuppliers: false,
    canManageData: false
  },
  VERIFIER: {
    canEditCmsContent: false,
    canReleaseEscrow: false,
    canPostRfq: false,
    canSubmitQuotes: false,
    canVerifySuppliers: true,
    canManageData: false
  }
};

interface UserAuthorizationResult {
  isAuthorized: boolean;
  isSuperAdmin: boolean;
  permission?: CmsAuthorizedUser;
  scopes: CmsPermissionScope[];
  statusText: string;
}

export interface SiteContentDraftRecord {
  content: SiteContent;
  savedAt: string;
  savedBy?: string;
  source?: string;
}

interface SiteContentContextType {
  siteContent: SiteContent;
  updateSiteContent: (newContent: SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  updatePageContent: <K extends keyof SiteContent>(pageKey: K, pageData: Partial<SiteContent[K]>, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  resetPageToDefault: (pageKey?: keyof SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  resetToDefaults: (user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  exportContentJson: () => string;
  importContentJson: (jsonString: string, user?: AuthUser | null) => Promise<boolean>;
  isLoading: boolean;
  saveStatus: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  hasUnsavedChanges: boolean;
  publishChangesToServer: () => Promise<{ success: boolean; message?: string }>;
  saveToServer: () => Promise<{ success: boolean; message?: string }>;
  updateSection: <K extends keyof SiteContent>(sectionKey: K, data: Partial<SiteContent[K]>) => Promise<{ success: boolean; message?: string }>;
  updateField: (path: string, value: any) => void;
  forceSaveNow: (content: SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  refreshFromServer: () => Promise<boolean>;
  // Local Draft Persistence (non-deploying)
  draftRecord: SiteContentDraftRecord | null;
  hasSavedDraft: boolean;
  saveDraft: (draftContent: SiteContent, source?: string) => { success: boolean; savedAt: string; message?: string };
  discardDraft: () => void;
  getSavedDraft: () => SiteContentDraftRecord | null;
  // Visual Live Edit Mode
  isLiveEditMode: boolean;
  setIsLiveEditMode: (val: boolean) => void;
  toggleLiveEditMode: () => void;
  activeQuickEditSection: string | null;
  openQuickEdit: (section: string) => void;
  closeQuickEdit: () => void;
  // Current user state
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  // RBAC Config
  rbacConfig: RbacMatrix;
  updateRbacRole: (role: UserRole, partial: Partial<RbacRolePermissions>) => void;
  // Permissions & Access Control
  authorizedUsers: CmsAuthorizedUser[];
  accessRequests: CmsAccessRequest[];
  refreshPermissions: () => Promise<void>;
  isUserAuthorized: (user: AuthUser | null) => UserAuthorizationResult;
  grantPermission: (
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
  ) => Promise<{ success: boolean; message?: string }>;
  revokePermission: (idOrEmail: string, adminUser?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  requestAccess: (payload: {
    email: string;
    name?: string;
    companyName?: string;
    role?: string;
    requestedScopes?: CmsPermissionScope[];
    reason?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  approveAccessRequest: (id: string, adminUser?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  rejectAccessRequest: (id: string, adminUser?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
}

const LOCAL_STORAGE_KEY = 'trade_heaven_site_content_v2';
export const SITE_CONTENT_DRAFT_STORAGE_KEY = 'trade_heaven_site_content_draft_v1';
const RBAC_STORAGE_KEY = 'trade_heaven_rbac_matrix_v1';
const HERO_TANKER_IMAGE = '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg';

function readSiteContentDraftFromStorage(): SiteContentDraftRecord | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SITE_CONTENT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.content && typeof parsed.content === 'object') {
      return {
        content: normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...parsed.content }),
        savedAt: typeof parsed.savedAt === 'string' && parsed.savedAt ? parsed.savedAt : new Date().toISOString(),
        savedBy: typeof parsed.savedBy === 'string' ? parsed.savedBy : undefined,
        source: typeof parsed.source === 'string' ? parsed.source : undefined
      };
    }
  } catch {
    // ignore malformed draft storage
  }
  return null;
}

function normalizeHeroImage(content: SiteContent): SiteContent {
  const mergedDisplayConfig = {
    ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG,
    ...(content?.homepageDisplayConfig || {}),
    sectionVisibility: {
      ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG.sectionVisibility,
      ...(content?.homepageDisplayConfig?.sectionVisibility || {})
    }
  };
  const nextContent: SiteContent = {
    ...content,
    homepageDisplayConfig: mergedDisplayConfig
  };
  if (!nextContent?.homepage) return nextContent;
  const currentBg = nextContent.homepage.heroBgImage;
  if (
    !currentBg ||
    currentBg === 'vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034.jpg' ||
    currentBg.includes('unsplash.com') ||
    currentBg.includes('1542601906990') ||
    currentBg.includes('1578575437130')
  ) {
    return {
      ...nextContent,
      homepage: {
        ...nextContent.homepage,
        heroBgImage: HERO_TANKER_IMAGE
      }
    };
  }
  return nextContent;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const hasUnsavedChanges = saveStatus === 'pending';
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLocalSiteMutationRef = useRef<boolean>(false);

  const [rbacConfig, setRbacConfig] = useState<RbacMatrix>(() => {
    try {
      const cached = localStorage.getItem(RBAC_STORAGE_KEY);
      if (cached) return { ...DEFAULT_RBAC_CONFIG, ...JSON.parse(cached) };
    } catch {}
    return DEFAULT_RBAC_CONFIG;
  });

  const updateRbacRole = (role: UserRole, partial: Partial<RbacRolePermissions>) => {
    setRbacConfig(prev => {
      const updated = {
        ...prev,
        [role]: { ...prev[role], ...partial }
      };
      try {
        localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...parsed });
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SITE_CONTENT;
  });

  const [draftRecord, setDraftRecord] = useState<SiteContentDraftRecord | null>(() => readSiteContentDraftFromStorage());
  const hasSavedDraft = Boolean(draftRecord);

  const getSavedDraft = (): SiteContentDraftRecord | null => {
    const stored = readSiteContentDraftFromStorage();
    setDraftRecord(stored);
    return stored;
  };

  const saveDraft = (
    draftContent: SiteContent,
    source = 'Site Content CMS'
  ): { success: boolean; savedAt: string; message?: string } => {
    const savedAt = new Date().toISOString();
    const record: SiteContentDraftRecord = {
      content: normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...draftContent }),
      savedAt,
      savedBy: currentUser?.email || currentUser?.name || 'Administrator',
      source
    };
    try {
      localStorage.setItem(SITE_CONTENT_DRAFT_STORAGE_KEY, JSON.stringify(record));
      setDraftRecord(record);
      return {
        success: true,
        savedAt,
        message: 'Draft saved locally. Live website remains unchanged until published.'
      };
    } catch (err: any) {
      return {
        success: false,
        savedAt,
        message: err?.message || 'Unable to save draft to browser local storage.'
      };
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(SITE_CONTENT_DRAFT_STORAGE_KEY);
      localStorage.removeItem('th_whole_site_draft_v1');
    } catch {}
    setDraftRecord(null);
  };

  const [authorizedUsers, setAuthorizedUsers] = useState<CmsAuthorizedUser[]>([
    {
      id: 'perm-admin-001',
      email: 'yr943334@gmail.com',
      name: 'Administrator (Yash)',
      role: 'ADMIN',
      companyName: 'Trade Heaven Global Operations & Treasury',
      grantedBy: 'System Root',
      grantedAt: '2025-01-01',
      scopes: ['ALL_ADMIN', 'EDIT_CONTENT', 'EDIT_PRICING', 'EDIT_MEDIA', 'PUBLISH_PRODUCTS', 'MANAGE_PERMISSIONS'],
      status: 'ACTIVE',
      notes: 'Master Administrator with unconditional global rights, full CMS and RBAC matrix access'
    },
    {
      id: 'perm-admin-002',
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
      grantedBy: 'Administrator (Super Admin)',
      grantedAt: '2025-02-15',
      scopes: ['EDIT_CONTENT', 'EDIT_MEDIA', 'PUBLISH_PRODUCTS'],
      status: 'ACTIVE',
      notes: 'Senior Verifier delegated to update audit notices and directory media'
    }
  ]);

  const [accessRequests, setAccessRequests] = useState<CmsAccessRequest[]>([
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
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const lastLocalSaveTsRef = useRef<number>(0);

  // Fetch latest content and permissions from backend API on mount
  const refreshPermissions = async () => {
    try {
      const data = await api.getCmsPermissions();
      if (data && data.authorizedUsers) {
        setAuthorizedUsers(data.authorizedUsers);
      }
      if (data && data.accessRequests) {
        setAccessRequests(data.accessRequests);
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadServerContent() {
      try {
        setIsLoading(true);
        const [contentRes, permsData] = await Promise.all([
          apiClient.getSiteContent(),
          api.getCmsPermissions()
        ]);
        if (!isMounted) return;
        if (
          !hasLocalSiteMutationRef.current &&
          contentRes.success &&
          contentRes.data &&
          typeof contentRes.data === 'object' &&
          !Array.isArray(contentRes.data)
        ) {
          setSiteContent(prev => {
            if (hasLocalSiteMutationRef.current) return prev;
            const prevTs = Number((prev as any)?.siteContentUpdatedAt || 0);
            const incomingTs = Number((contentRes.data as any)?.siteContentUpdatedAt || 0);
            if (prevTs > 0 && incomingTs > 0 && prevTs > incomingTs) {
              return prev;
            }
            if (lastLocalSaveTsRef.current > 0 && (incomingTs === 0 || lastLocalSaveTsRef.current > incomingTs)) {
              return prev;
            }
            const merged = normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...prev, ...contentRes.data });
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
        if (permsData) {
          if (Array.isArray(permsData.authorizedUsers)) setAuthorizedUsers(permsData.authorizedUsers);
          if (Array.isArray(permsData.accessRequests)) setAccessRequests(permsData.accessRequests);
        }
      } catch (err) {
        console.warn('Using local site content store');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadServerContent();

    const shouldAcceptIncomingSiteContent = (incoming: any, current: any): boolean => {
      if (!incoming || typeof incoming !== 'object') return false;
      const incomingTs = Number(incoming.siteContentUpdatedAt || 0);
      const currentTs = Math.max(
        Number(current?.siteContentUpdatedAt || 0),
        lastLocalSaveTsRef.current
      );
      if (currentTs > 0 && incomingTs > 0 && incomingTs < currentTs) return false;
      if (lastLocalSaveTsRef.current > 0 && incomingTs === 0) return false;
      return true;
    };

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSiteContent(prev =>
            shouldAcceptIncomingSiteContent(parsed, prev)
              ? normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...parsed })
              : prev
          );
        } catch {}
      } else if (e.key === SITE_CONTENT_DRAFT_STORAGE_KEY) {
        setDraftRecord(readSiteContentDraftFromStorage());
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('th_site_content_sync');
        bc.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            setSiteContent(prev =>
              shouldAcceptIncomingSiteContent(event.data, prev)
                ? normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...event.data })
                : prev
            );
          }
        };
      }
    } catch {}

    window.addEventListener('storage', handleStorageSync);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageSync);
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, []);

  const refreshFromServer = async (): Promise<boolean> => {
    try {
      const contentRes = await apiClient.getSiteContent();
      if (
        !hasLocalSiteMutationRef.current &&
        contentRes.success &&
        contentRes.data &&
        typeof contentRes.data === 'object' &&
        !Array.isArray(contentRes.data)
      ) {
        setSiteContent(prev => {
          if (hasLocalSiteMutationRef.current) return prev;
          const prevTs = Number((prev as any)?.siteContentUpdatedAt || 0);
          const incomingTs = Number((contentRes.data as any)?.siteContentUpdatedAt || 0);
          if (prevTs > 0 && incomingTs > 0 && prevTs > incomingTs) {
            return prev;
          }
          if (lastLocalSaveTsRef.current > 0 && (incomingTs === 0 || lastLocalSaveTsRef.current > incomingTs)) {
            return prev;
          }
          const merged = normalizeHeroImage({ ...DEFAULT_SITE_CONTENT, ...prev, ...contentRes.data });
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Helper to check if a specific user is authorized to edit CMS or access admin areas
  const isUserAuthorized = (user: AuthUser | null = currentUser): UserAuthorizationResult => {
    if (!user) {
      return {
        isAuthorized: false,
        isSuperAdmin: false,
        scopes: [],
        statusText: 'Guest / Not Signed In (Read-Only)'
      };
    }

    // Strict Root Admin Verification: ONLY yr943334@gmail.com and sankalprajput15@gmail.com with verified OTP session
    if (isStrictVerifiedRootAdmin(user)) {
      return {
        isAuthorized: true,
        isSuperAdmin: true,
        scopes: ['ALL_ADMIN', 'EDIT_CONTENT', 'EDIT_PRICING', 'EDIT_MEDIA', 'PUBLISH_PRODUCTS', 'MANAGE_PERMISSIONS'],
        statusText: 'Administrator (Full Unrestricted Access)'
      };
    }

    // Non-admin users (buyers, suppliers, guests) have zero edit/admin access
    return {
      isAuthorized: false,
      isSuperAdmin: false,
      scopes: [],
      statusText: 'Access Restricted (Administrator Privileges Required)'
    };
  };

  const updateField = (path: string, value: any) => {
    if (!isUserAuthorized(currentUser).isAuthorized) {
      return;
    }
    hasLocalSiteMutationRef.current = true;
    const nowMs = Date.now();
    lastLocalSaveTsRef.current = nowMs;
    const normalizedVal =
      typeof value === 'string' && (path.toLowerCase().includes('image') || path.toLowerCase().includes('logo') || path.toLowerCase().includes('avatar'))
        ? normalizeProductAssetUrl(value)
        : value;

    let updatedSnapshot: SiteContent | null = null;
    setSiteContent(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = normalizedVal;
      (clone as any).siteContentUpdatedAt = nowMs;
      updatedSnapshot = clone;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clone));
      } catch {}
      return clone;
    });
    setSaveStatus('pending');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (updatedSnapshot) {
        void forceSaveNow(updatedSnapshot, currentUser);
      }
    }, 350);
  };

  const publishChangesToServer = async (): Promise<{ success: boolean; message?: string }> => {
    return await forceSaveNow(siteContent, currentUser);
  };

  const saveToServer = publishChangesToServer;

  const forceSaveNow = async (content: SiteContent, user?: AuthUser | null): Promise<{ success: boolean; message?: string }> => {
    const effectiveUser = user ?? currentUser;
    const auth = isUserAuthorized(effectiveUser);
    if (!auth.isAuthorized) return { success: false, message: 'Permission Denied' };

    const nowMs = Date.now();
    lastLocalSaveTsRef.current = nowMs;
    hasLocalSiteMutationRef.current = true;
    const stampedContent: SiteContent = {
      ...(content as any),
      siteContentUpdatedAt: nowMs
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stampedContent));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('th_site_content_sync');
        bc.postMessage(stampedContent);
        bc.close();
      }
    } catch {}

    setSaveStatus('saving');
    const apiResult = await apiClient.saveSiteContent(stampedContent, effectiveUser);

    if (!apiResult.success) {
      console.warn('Offline persistence active for site content');
      setSaveStatus('error');
      return { success: false, message: apiResult.message || 'Server rejected changes. Saved locally in browser cache.' };
    }

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
    }, 2500);
    return { success: true, message: apiResult.message || 'Site content updated' };
  };

  const updateSiteContent = async (newContent: SiteContent, user?: AuthUser | null): Promise<{ success: boolean; message?: string }> => {
    const effectiveUser = user ?? currentUser;
    const auth = isUserAuthorized(effectiveUser);
    if (!auth.isAuthorized) {
      return {
        success: false,
        message: 'Permission Denied: Only administrators or users granted explicit CMS permissions can modify site content.'
      };
    }

    const nowMs = Date.now();
    lastLocalSaveTsRef.current = nowMs;
    hasLocalSiteMutationRef.current = true;
    const stampedContent: SiteContent = {
      ...(newContent as any),
      siteContentUpdatedAt: nowMs
    };
    const prevCats = siteContent?.homepage?.categoriesList || [];
    const nextCats = stampedContent?.homepage?.categoriesList || [];
    const prevSlides = siteContent?.homepage?.heroSlides || [];
    const nextSlides = stampedContent?.homepage?.heroSlides || [];

    setSiteContent(stampedContent);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stampedContent));
    } catch {}

    const syncTasks: Promise<any>[] = [];

    // Keep productImageManagerService overrides in sync for any updated category cover images
    for (const cat of nextCats) {
      if (!cat?.id || !cat?.image) continue;
      const cleanImg = normalizeProductAssetUrl(cat.image);
      if (!cleanImg) continue;
      const prevCat = prevCats.find(c => c.id === cat.id);
      const prevImg = prevCat?.image ? normalizeProductAssetUrl(prevCat.image) : '';
      const existingOv = productImageManagerService.getProductImage(cat.id);
      if (cleanImg !== prevImg || !existingOv || existingOv.split('?')[0] !== cleanImg.split('?')[0]) {
        syncTasks.push(productImageManagerService.setProductImage(cat.id, cleanImg, [cleanImg]).catch(() => {}));
      }
    }

    // Keep productImageManagerService overrides in sync for any updated Hero Carousel Slides
    for (const slide of nextSlides) {
      if (!slide?.id || !slide?.image) continue;
      const cleanSlideImg = normalizeProductAssetUrl(slide.image);
      if (!cleanSlideImg) continue;
      const prevSlide = prevSlides.find(s => s.id === slide.id);
      const prevSlideImg = prevSlide?.image ? normalizeProductAssetUrl(prevSlide.image) : '';
      const existingOv = productImageManagerService.getProductImage(slide.id);
      if (cleanSlideImg !== prevSlideImg || !existingOv || existingOv.split('?')[0] !== cleanSlideImg.split('?')[0]) {
        syncTasks.push(productImageManagerService.setProductImage(slide.id, cleanSlideImg, [cleanSlideImg]).catch(() => {}));
      }
    }

    if (syncTasks.length > 0) {
      await Promise.allSettled(syncTasks);
    }

    return await forceSaveNow(stampedContent, effectiveUser);
  };

  const updatePageContent = async <K extends keyof SiteContent>(
    pageKey: K, 
    pageData: Partial<SiteContent[K]>,
    user?: AuthUser | null
  ): Promise<{ success: boolean; message?: string }> => {
    const updated = {
      ...siteContent,
      [pageKey]: {
        ...siteContent[pageKey],
        ...pageData
      }
    };
    return await updateSiteContent(updated, user);
  };

  const updateSection = async <K extends keyof SiteContent>(
    sectionKey: K,
    data: Partial<SiteContent[K]>
  ): Promise<{ success: boolean; message?: string }> => {
    return updatePageContent(sectionKey, data, currentUser);
  };

  const resetPageToDefault = async (pageKey?: keyof SiteContent, user?: AuthUser | null): Promise<{ success: boolean; message?: string }> => {
    if (pageKey) {
      const updated = {
        ...siteContent,
        [pageKey]: DEFAULT_SITE_CONTENT[pageKey]
      };
      return await updateSiteContent(updated, user);
    } else {
      return await updateSiteContent(DEFAULT_SITE_CONTENT, user);
    }
  };

  const exportContentJson = (): string => {
    return JSON.stringify(siteContent, null, 2);
  };

  const importContentJson = async (jsonString: string, user?: AuthUser | null): Promise<boolean> => {
    const auth = isUserAuthorized(user ?? null);
    if (!auth.isAuthorized) {
      return false;
    }
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        const merged = { ...DEFAULT_SITE_CONTENT, ...parsed };
        const res = await updateSiteContent(merged, user);
        return res.success;
      }
      return false;
    } catch (err) {
      console.error('Failed to parse imported JSON', err);
      return false;
    }
  };

  // Permission delegation actions
  const grantPermission = async (
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
  ) => {
    const res = await api.grantCmsPermission(payload, adminUser);
    if (res.success) {
      await refreshPermissions();
    }
    return res;
  };

  const revokePermission = async (idOrEmail: string, adminUser?: AuthUser | null) => {
    const res = await api.revokeCmsPermission(idOrEmail, adminUser);
    if (res.success) {
      await refreshPermissions();
    }
    return res;
  };

  const requestAccess = async (payload: {
    email: string;
    name?: string;
    companyName?: string;
    role?: string;
    requestedScopes?: CmsPermissionScope[];
    reason?: string;
  }) => {
    const res = await api.requestCmsAccess(payload);
    if (res.success) {
      await refreshPermissions();
    }
    return res;
  };

  const approveAccessRequest = async (id: string, adminUser?: AuthUser | null) => {
    const res = await api.approveCmsRequest(id, adminUser);
    if (res.success) {
      await refreshPermissions();
    }
    return res;
  };

  const rejectAccessRequest = async (id: string, adminUser?: AuthUser | null) => {
    const res = await api.rejectCmsRequest(id, adminUser);
    if (res.success) {
      await refreshPermissions();
    }
    return res;
  };

  const [isLiveEditMode, setIsLiveEditModeState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && isStrictVerifiedRootAdmin(currentUser)) {
        return localStorage.getItem('th_live_edit_mode') === 'true';
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('th_live_edit_mode');
      }
    } catch {}
    return false;
  });
  const [activeQuickEditSection, setActiveQuickEditSection] = useState<string | null>(null);

  const setIsLiveEditMode = (val: boolean) => {
    const allowed = isUserAuthorized(currentUser).isAuthorized;
    const effectiveVal = allowed ? val : false;
    setIsLiveEditModeState(effectiveVal);
    try {
      if (typeof window !== 'undefined') {
        if (effectiveVal) {
          localStorage.setItem('th_live_edit_mode', 'true');
        } else {
          localStorage.removeItem('th_live_edit_mode');
        }
        window.dispatchEvent(
          new CustomEvent('tradeheaven_live_edit_mode_changed', { detail: { isLiveEditMode: effectiveVal } })
        );
      }
    } catch {}
  };

  // Automatically deactivate live edit mode if current user is not a strict verified root administrator
  useEffect(() => {
    const auth = isUserAuthorized(currentUser);
    if (!auth.isAuthorized) {
      setIsLiveEditModeState(false);
      setActiveQuickEditSection(null);
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('th_live_edit_mode');
          window.dispatchEvent(
            new CustomEvent('tradeheaven_live_edit_mode_changed', { detail: { isLiveEditMode: false } })
          );
        }
      } catch {}
    } else {
      try {
        if (localStorage.getItem('th_live_edit_mode') === 'true') {
          setIsLiveEditModeState(true);
        }
      } catch {}
    }
  }, [currentUser]);

  const toggleLiveEditMode = () => {
    const auth = isUserAuthorized(currentUser);
    if (!auth.isAuthorized) {
      return;
    }
    setIsLiveEditMode(!isLiveEditMode);
  };

  const openQuickEdit = (section: string) => {
    const auth = isUserAuthorized(currentUser);
    if (!auth.isAuthorized) {
      return;
    }
    setActiveQuickEditSection(section);
  };

  const closeQuickEdit = () => {
    setActiveQuickEditSection(null);
  };

  const resetToDefaults = async (user?: AuthUser | null): Promise<{ success: boolean; message?: string }> => {
    return await updateSiteContent(DEFAULT_SITE_CONTENT, user);
  };

  return (
    <SiteContentContext.Provider
      value={{
        siteContent,
        updateSiteContent,
        updatePageContent,
        resetPageToDefault,
        resetToDefaults,
        exportContentJson,
        importContentJson,
        isLoading,
        saveStatus,
        hasUnsavedChanges,
        publishChangesToServer,
        saveToServer,
        updateSection,
        updateField,
        forceSaveNow,
        refreshFromServer,
        draftRecord,
        hasSavedDraft,
        saveDraft,
        discardDraft,
        getSavedDraft,
        isLiveEditMode,
        setIsLiveEditMode,
        toggleLiveEditMode,
        activeQuickEditSection,
        openQuickEdit,
        closeQuickEdit,
        currentUser,
        setCurrentUser,
        rbacConfig,
        updateRbacRole,
        authorizedUsers,
        accessRequests,
        refreshPermissions,
        isUserAuthorized,
        grantPermission,
        revokePermission,
        requestAccess,
        approveAccessRequest,
        rejectAccessRequest
      }}
    >
      {children}
      {/* Floating Status Badge & Publish Button */}
      {isUserAuthorized(currentUser).isAuthorized && saveStatus !== 'idle' && (
        <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          <div className="bg-slate-900 rounded-full shadow-2xl shadow-slate-900/50 border border-slate-700 px-5 py-3 flex items-center gap-3 text-sm font-semibold text-slate-100">
            {saveStatus === 'pending' && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-400">Unsaved Changes</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <span className="text-blue-400">Saving to Server...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-emerald-400">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-red-400">Save Failed</span>
              </>
            )}
          </div>

          {saveStatus === 'pending' && (
            <button
              onClick={saveToServer}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl shadow-blue-500/30 font-bold transition-all flex items-center gap-2"
            >
              💾 Save & Publish Changes
            </button>
          )}

        </div>
      )}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = (): SiteContentContextType => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};
