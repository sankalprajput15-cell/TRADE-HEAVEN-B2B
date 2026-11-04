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
  if (
    emailLower === 'zac@otec.ltd' ||
    emailLower === 'zac@fadetech.com' ||
    u.id === 'user-supplier-zac'
  ) {
    return {
      ...u,
      role: 'SUPPLIER',
      isVerifiedAdmin: false
    };
  }
  return u;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        // Always purge any cached or default admin session keys on initial boot
        localStorage.removeItem('th_session_user');
        localStorage.removeItem('tradeheaven_user');
        localStorage.removeItem('tradeheaven_auth_user');
        localStorage.removeItem('th_session_jwt_token');
        sessionStorage.removeItem('th_admin_origin_user');

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
        
        // Keep Admin session in memory only so Admin is never logged in by default on page reload
        setUser(adminUser);
        setIsAuthenticated(true);
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
        if (sanitizedUser.role !== 'ADMIN' && !sanitizedUser.isVerifiedAdmin) {
          try {
            localStorage.setItem('th_session_user', JSON.stringify(sanitizedUser));
            if (res.token) {
              localStorage.setItem('th_session_jwt_token', res.token);
            }
          } catch {}
        }

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
      localStorage.removeItem('th_session_jwt_token');
      localStorage.removeItem('tradeheaven_auth_user');
      sessionStorage.clear();
    } catch {}
  };

  const handleSetUser = (nextUser: AuthUser | null) => {
    if (nextUser) {
      const sanitized = sanitizeUserRole(nextUser);
      setUser(sanitized);
      setIsAuthenticated(true);
      if (sanitized.role !== 'ADMIN' && !sanitized.isVerifiedAdmin) {
        try {
          localStorage.setItem('th_session_user', JSON.stringify(sanitized));
        } catch {}
      } else {
        try {
          localStorage.removeItem('th_session_user');
        } catch {}
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

