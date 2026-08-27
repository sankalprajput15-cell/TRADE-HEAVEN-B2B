import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import { AuthUser, CmsAuthorizedUser, CmsAccessRequest, CmsPermissionScope, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/apiService';
import { securityService } from '../services/securityService';
import { apiClient } from '../services/apiClient';

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

interface SiteContentContextType {
  siteContent: SiteContent;
  updateSiteContent: (newContent: SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  updatePageContent: <K extends keyof SiteContent>(pageKey: K, pageData: Partial<SiteContent[K]>, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  resetPageToDefault: (pageKey?: keyof SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  resetToDefaults: (user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
  exportContentJson: () => string;
  importContentJson: (jsonString: string, user?: AuthUser | null) => Promise<boolean>;
  isLoading: boolean;
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

const LOCAL_STORAGE_KEY = 'trade_heaven_site_content_v1';
const RBAC_STORAGE_KEY = 'trade_heaven_rbac_matrix_v1';

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: currentUser, setUser: setCurrentUser } = useAuth();

  // Remove the useEffect that wrote to localStorage
  
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
        return { ...DEFAULT_SITE_CONTENT, ...parsed };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SITE_CONTENT;
  });

  // Initial Hydration from Server API
  useEffect(() => {
    let isMounted = true;
    const fetchLiveContent = async () => {
      try {
        const res = await apiClient.getSiteContent();
        if (res.success && res.data && isMounted) {
          // Merge with default to ensure no missing keys
          const merged = { ...DEFAULT_SITE_CONTENT, ...res.data };
          setSiteContent(merged);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to hydrate CMS content from server, using fallback.', err);
      }
    };
    fetchLiveContent();
    return () => { isMounted = false; };
  }, []);

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
    async function loadServerContent() {
      try {
        setIsLoading(true);
        const [res, permsData] = await Promise.all([
          fetch('/api/site-content'),
          api.getCmsPermissions()
        ]);
        if (res.ok) {
          const data = await res.json();
          if (data && data.data) {
            setSiteContent(prev => {
              const merged = { ...DEFAULT_SITE_CONTENT, ...prev, ...data.data };
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
        if (permsData) {
          if (Array.isArray(permsData.authorizedUsers)) setAuthorizedUsers(permsData.authorizedUsers);
          if (Array.isArray(permsData.accessRequests)) setAccessRequests(permsData.accessRequests);
        }
      } catch (err) {
        console.warn('Using local site content store');
      } finally {
        setIsLoading(false);
      }
    }
    loadServerContent();
  }, []);

  // Helper to check if a specific user is authorized to edit CMS or access admin areas
  const isUserAuthorized = (user: AuthUser | null): UserAuthorizationResult => {
    if (!user) {
      return {
        isAuthorized: false,
        isSuperAdmin: false,
        scopes: [],
        statusText: 'Guest / Not Signed In (Read-Only)'
      };
    }

    // 1. Strict Server-Resolved Administrator Role
    if (user.role === 'ADMIN' || user.isVerifiedAdmin === true) {
      return {
        isAuthorized: true,
        isSuperAdmin: true,
        scopes: ['ALL_ADMIN', 'EDIT_CONTENT', 'EDIT_PRICING', 'EDIT_MEDIA', 'PUBLISH_PRODUCTS', 'MANAGE_PERMISSIONS'],
        statusText: 'Administrator (Full Unrestricted Access)'
      };
    }

    // 2. Check explicitly granted delegated permission matrix
    const email = (user.email || '').trim().toLowerCase();
    const delegated = authorizedUsers.find(
      u => u.status === 'ACTIVE' && u.email.toLowerCase() === email
    );
    if (delegated) {
      return {
        isAuthorized: true,
        isSuperAdmin: false,
        permission: delegated,
        scopes: delegated.scopes,
        statusText: `Delegated Staff (${delegated.role})`
      };
    }
    
    // Non-admin users have zero edit/admin access
    return {
      isAuthorized: false,
      isSuperAdmin: false,
      scopes: [],
      statusText: 'Access Restricted (Administrator Privileges Required)'
    };
  };

  const updateSiteContent = async (newContent: SiteContent, user?: AuthUser | null): Promise<{ success: boolean; message?: string }> => {
    const auth = isUserAuthorized(user ?? null);
    if (!auth.isAuthorized) {
      return {
        success: false,
        message: 'Permission Denied: Only administrators or users granted explicit CMS permissions can modify site content.'
      };
    }

    setSiteContent(newContent);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newContent));
    } catch {}

    // Persist to server API
    const apiResult = await apiClient.updateSiteContent(newContent);
    if (!apiResult.success) {
      console.warn('Offline persistence active for site content');
      return { success: false, message: apiResult.message || 'Server rejected changes. Saved locally in browser cache.' };
    }
    return { success: true, message: apiResult.message || 'Site content updated' };
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

  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(false);
  const [activeQuickEditSection, setActiveQuickEditSection] = useState<string | null>(null);

  // Automatically deactivate live edit mode if current user is not an administrator or creator
  useEffect(() => {
    const auth = isUserAuthorized(currentUser);
    if (!auth.isAuthorized) {
      setIsLiveEditMode(false);
      setActiveQuickEditSection(null);
    }
  }, [currentUser]);

  const toggleLiveEditMode = () => {
    const auth = isUserAuthorized(currentUser);
    if (!auth.isAuthorized) {
      return;
    }
    setIsLiveEditMode(prev => !prev);
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
