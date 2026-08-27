import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  saveStatus: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  hasUnsavedChanges: boolean;
  publishChangesToServer: () => Promise<{ success: boolean; message?: string }>;
  saveToServer: () => Promise<{ success: boolean; message?: string }>;
  updateSection: <K extends keyof SiteContent>(sectionKey: K, data: Partial<SiteContent[K]>) => Promise<{ success: boolean; message?: string }>;
  updateField: (path: string, value: any) => void;
  forceSaveNow: (content: SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const hasUnsavedChanges = saveStatus === 'pending';
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const isUserAuthorized = (user: AuthUser | null = currentUser): UserAuthorizationResult => {
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


  const updateField = (path: string, value: any) => {
    setSiteContent(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return clone;
    });
    setSaveStatus('pending');
  };

  const publishChangesToServer = async (): Promise<{ success: boolean; message?: string }> => {

    return await forceSaveNow(siteContent, currentUser);
  };

  const saveToServer = publishChangesToServer;

  const forceSaveNow = async (content: SiteContent, user?: AuthUser | null): Promise<{ success: boolean; message?: string }> => {
    const auth = isUserAuthorized(user ?? currentUser);
    if (!auth.isAuthorized) return { success: false, message: 'Permission Denied' };
    
    setSaveStatus('saving');
    const apiResult = await apiClient.saveSiteContent(content);
    
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
    const auth = isUserAuthorized(user ?? currentUser);
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

    setSaveStatus('pending');

    return { success: true, message: 'Changes staged. Click Save & Publish to push live.' };
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
        saveStatus,
        hasUnsavedChanges,
        publishChangesToServer,
        saveToServer,
        updateSection,
        updateField,
        forceSaveNow,
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
      {isUserAuthorized(currentUser).isAuthorized && (
        <div className="fixed bottom-6 left-6 z-[999999] flex flex-col items-start gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          <div className="bg-slate-900 rounded-full shadow-2xl shadow-slate-900/50 border border-slate-700 px-5 py-3 flex items-center gap-3 text-sm font-semibold text-slate-100">
            {saveStatus === 'idle' && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>No Pending Changes</span>
              </>
            )}
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
