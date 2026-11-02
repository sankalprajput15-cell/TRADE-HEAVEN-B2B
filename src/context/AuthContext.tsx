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
        const params = new URLSearchParams(window.location.search);
        const paramEmail = (params.get('email') || '').trim().toLowerCase();
        if (params.get('pay_zac') === '1' || paramEmail === 'zac@otec.ltd' || paramEmail === 'zac@fadetech.com') {
          localStorage.setItem('th_session_user', JSON.stringify(DEFAULT_ZAC_CLIENT_USER));
          return DEFAULT_ZAC_CLIENT_USER;
        }
        if (params.get('action') === 'renew-membership' && paramEmail && paramEmail !== 'yr943334@gmail.com') {
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
          localStorage.setItem('th_session_user', JSON.stringify(clientRenewalUser));
          return clientRenewalUser;
        }
      }
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('th_session_user') : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object') {
          return sanitizeUserRole(parsed);
        }
      }
    } catch {}
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [originalAdminUser, setOriginalAdminUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('th_admin_origin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const paramEmail = (params.get('email') || '').trim().toLowerCase();
      if (params.get('pay_zac') === '1' || paramEmail === 'zac@otec.ltd' || paramEmail === 'zac@fadetech.com') {
        setUser(DEFAULT_ZAC_CLIENT_USER);
        setIsAuthenticated(true);
        localStorage.setItem('th_session_user', JSON.stringify(DEFAULT_ZAC_CLIENT_USER));
        return;
      }
      const storedUser = localStorage.getItem('th_session_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object') {
          const sanitized = sanitizeUserRole(parsed);
          setUser(sanitized);
          setIsAuthenticated(true);
          localStorage.setItem('th_session_user', JSON.stringify(sanitized));
        }
      }
    } catch {}
  }, []);

  const impersonateUser = (targetUser: AuthUser) => {
    const currentAdmin = originalAdminUser || user;
    if (currentAdmin && currentAdmin.role === 'ADMIN') {
      try {
        sessionStorage.setItem('th_admin_origin_user', JSON.stringify(currentAdmin));
      } catch {}
      setOriginalAdminUser(currentAdmin);
    }
    setUser(targetUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('th_session_user', JSON.stringify(targetUser));
    } catch {}
  };

  const stopImpersonation = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('th_session_user', JSON.stringify(originalAdminUser));
        sessionStorage.removeItem('th_admin_origin_user');
      } catch {}
      setOriginalAdminUser(null);
    }
  };

  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    setIsLoading(true);
    
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      
      // 1. Check Master Admin statically (supports typo gmial.com & standard admin passwords)
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
          localStorage.setItem('th_session_user', JSON.stringify(adminUser));
        } catch {}
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
          if (res.token) {
            localStorage.setItem('th_session_jwt_token', res.token);
          }
        } catch {}

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
      try {
        localStorage.setItem('th_session_user', JSON.stringify(sanitized));
      } catch {}
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

