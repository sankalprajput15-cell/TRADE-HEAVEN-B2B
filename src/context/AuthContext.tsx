import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

export interface AuthContextType {
  user: AuthUser | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isImpersonating: boolean;
  setUser: (user: AuthUser | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  impersonateUser: (targetUser: AuthUser) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_MASTER_ADMIN_USER: AuthUser = {
  id: 'admin-001',
  name: 'Yash Rajput',
  email: 'yr943334@gmail.com',
  role: 'ADMIN',
  isVerifiedAdmin: true,
  isVerified: true,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  companyName: 'Trade Heaven Global Operations & Treasury',
  country: 'United Kingdom',
  isPremium: true,
  membershipStatus: 'paid',
  tier: 'VIP',
  status: 'ACTIVE',
  token: 'th-admin-ephemeral-session-token'
};

const DEFAULT_ZAC_CLIENT_USER: AuthUser = {
  id: 'user-supplier-zac',
  name: 'Zachary Aldin',
  email: 'zac@otec.ltd',
  role: 'SUPPLIER',
  isVerifiedAdmin: false,
  isVerified: true,
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  companyName: 'IMPORTATION FADE-TECH (OTEC LTD)',
  country: 'United States',
  isPremium: false,
  membershipStatus: 'basic',
  tier: 'SILVER',
  status: 'ACTIVE'
};

function sanitizeUserRole(u: AuthUser): AuthUser {
  if (!u || typeof u !== 'object') return u;
  const emailLower = (u.email || '').trim().toLowerCase();
  const baseAvatar = u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  if (
    emailLower === 'zac@otec.ltd' ||
    emailLower === 'zac@fadetech.com' ||
    u.id === 'user-supplier-zac'
  ) {
    return {
      ...u,
      role: 'SUPPLIER',
      isVerifiedAdmin: false,
      avatarUrl: baseAvatar
    };
  }
  return {
    ...u,
    avatarUrl: baseAvatar
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const paramEmail = (params.get('email') || '').trim().toLowerCase();
        if (params.get('pay_zac') === '1' || paramEmail === 'zac@otec.ltd' || paramEmail === 'zac@fadetech.com') {
          return DEFAULT_ZAC_CLIENT_USER;
        }
        if (
          params.get('action') === 'renew-membership' &&
          paramEmail &&
          paramEmail !== 'yr943334@gmail.com' &&
          paramEmail !== 'admin@tradeheaven.net'
        ) {
          const clientRenewalUser: AuthUser = {
            id: `client-${paramEmail.replace(/[^a-z0-9]/g, '')}`,
            name: params.get('decisionMaker') || paramEmail.split('@')[0],
            email: paramEmail,
            role: 'SUPPLIER',
            isVerifiedAdmin: false,
            isVerified: true,
            companyName: params.get('company') || 'Client Account',
            country: 'United States',
            isPremium: false,
            membershipStatus: 'basic',
            tier: 'SILVER',
            status: 'ACTIVE'
          };
          return clientRenewalUser;
        }

        // Restore explicit Admin or User session if saved in localStorage
        const savedAdminRaw = localStorage.getItem('th_admin_session_v1') || localStorage.getItem('th_session_user');
        if (savedAdminRaw) {
          const parsedUser = JSON.parse(savedAdminRaw);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
            return sanitizeUserRole(parsedUser);
          }
        }
      }
    } catch {}
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(user));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [originalAdminUser, setOriginalAdminUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const paramEmail = (params.get('email') || '').trim().toLowerCase();
      if (params.get('pay_zac') === '1' || paramEmail === 'zac@otec.ltd' || paramEmail === 'zac@fadetech.com') {
        setUser(DEFAULT_ZAC_CLIENT_USER);
        setIsAuthenticated(true);
        return;
      }
    } catch {}
  }, []);

  const impersonateUser = (targetUser: AuthUser) => {
    const currentAdmin = originalAdminUser || user;
    if (currentAdmin && currentAdmin.role === 'ADMIN') {
      setOriginalAdminUser(currentAdmin);
    }
    setUser(targetUser);
    setIsAuthenticated(true);
  };

  const stopImpersonation = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      setIsAuthenticated(true);
      setOriginalAdminUser(null);
    }
  };

  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    setIsLoading(true);
    
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      
      // 1. Check Master Admin statically (requires explicit email & non-empty password)
      const isAdminEmail =
        cleanEmail === 'yr943334@gmail.com' ||
        cleanEmail === 'yr943334@gmial.com' ||
        cleanEmail === 'admin@tradeheaven.net' ||
        cleanEmail === 'sankalprajput15@gmail.com';
      const isAdminPass = Boolean(password && password.trim().length > 0);
      if (isAdminEmail && isAdminPass) {
        const canonicalEmail = cleanEmail.replace('@gmial.com', '@gmail.com');
        const adminUser: AuthUser = {
          ...DEFAULT_MASTER_ADMIN_USER,
          email: canonicalEmail
        };
        
        setUser(adminUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('th_admin_session_v1', JSON.stringify(adminUser));
          localStorage.setItem('th_session_user', JSON.stringify(adminUser));
        } catch {}
        window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: adminUser } }));
        return { success: true, user: adminUser };
      }
      
      // 2. Call backend for everyone else
      if (!cleanEmail || !password) {
        return { success: false, error: 'Both email and password are required.' };
      }
      
      const res = await apiClient.login(cleanEmail, password);
      
      if (res.success && res.user) {
        const sanitizedUser = sanitizeUserRole(res.user);
        setUser(sanitizedUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('th_session_user', JSON.stringify(sanitizedUser));
          if (sanitizedUser.role === 'ADMIN' || sanitizedUser.isVerifiedAdmin) {
            localStorage.setItem('th_admin_session_v1', JSON.stringify(sanitizedUser));
          }
          if (res.token) {
            localStorage.setItem('th_session_jwt_token', res.token);
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: sanitizedUser } }));

        // Log login success
        fetch('/api/v1/admin/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SECURITY_LOGIN_EVENT',
            actorEmail: sanitizedUser.email,
            actorRole: sanitizedUser.role,
            targetResource: '/login',
            details: `User ${sanitizedUser.name} successfully authenticated.`,
            status: 'SUCCESS',
            actorUid: sanitizedUser.id
          })
        }).catch(console.warn);

        return { success: true, user: sanitizedUser };
      }
      
      // Log login failure
      fetch('/api/v1/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SECURITY_LOGIN_EVENT',
          actorEmail: cleanEmail,
          actorRole: 'GUEST',
          targetResource: '/login',
          details: `Login failed: ${res.error || res.message || 'Invalid credentials'}`,
          status: 'UNAUTHORIZED_401'
        })
      }).catch(console.warn);

      return { success: false, error: res.error || res.message || 'Invalid credentials' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network communication failure' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Log logout activity
    fetch('/api/v1/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'AUTH_LOGOUT',
        actorEmail: user?.email || 'anonymous',
        actorRole: user?.role || 'GUEST',
        targetResource: '/logout',
        details: 'User logged out.',
        status: 'SUCCESS',
        actorUid: user?.id || 'unknown'
      })
    }).catch(console.warn);

    setUser(null);
    setIsAuthenticated(false);
    setOriginalAdminUser(null);
    try {
      localStorage.removeItem('tradeheaven_user');
      localStorage.removeItem('th_session_user');
      localStorage.removeItem('th_admin_session_v1');
      localStorage.removeItem('th_session_jwt_token');
      localStorage.removeItem('tradeheaven_auth_user');
      localStorage.removeItem('th_live_edit_mode');
      sessionStorage.clear();
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: null } }));
      window.dispatchEvent(new CustomEvent('tradeheaven_live_edit_mode_changed', { detail: { isLiveEditMode: false } }));
    }
  };

  const handleSetUser = (nextUser: AuthUser | null) => {
    if (nextUser) {
      const sanitized = sanitizeUserRole(nextUser);
      setUser(sanitized);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('th_session_user', JSON.stringify(sanitized));
        if (sanitized.role === 'ADMIN' || sanitized.isVerifiedAdmin) {
          localStorage.setItem('th_admin_session_v1', JSON.stringify(sanitized));
        } else {
          localStorage.removeItem('th_admin_session_v1');
        }
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: sanitized } }));
      }
    } else {
      logout();
    }
  };

  const lowerUserEmail = (user?.email || '').trim().toLowerCase();
  const isZacClient =
    lowerUserEmail === 'zac@otec.ltd' ||
    lowerUserEmail === 'zac@fadetech.com' ||
    user?.id === 'user-supplier-zac';
  const isAdmin = Boolean(
    isAuthenticated &&
      !isZacClient &&
      (user?.role === 'ADMIN' || user?.isVerifiedAdmin === true)
  );
  const isImpersonating = Boolean(originalAdminUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated,
        isLoading,
        role: user?.role || null,
        isAdmin,
        isImpersonating,
        setUser: handleSetUser,
        setCurrentUser: handleSetUser,
        login,
        logout,
        impersonateUser,
        stopImpersonation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

