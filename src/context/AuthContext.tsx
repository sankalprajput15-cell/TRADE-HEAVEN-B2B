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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
      const storedUser = localStorage.getItem('th_session_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
          setIsAuthenticated(true);
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
      const isAdminEmail = cleanEmail === 'yr943334@gmail.com' || cleanEmail === 'yr943334@gmial.com' || cleanEmail === 'admin@tradeheaven.net';
      const isAdminPass = password === 'Yash@8532' || password === 'Admin@2026!' || password === 'admin' || password === 'Admin@123' || password === 'admin123';
      if (isAdminEmail && isAdminPass) {
        const canonicalEmail = cleanEmail.replace('@gmial.com', '@gmail.com');
        const adminUser: AuthUser = {
          id: 'admin-001',
          name: 'Yash Rajput',
          email: canonicalEmail,
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
        setUser(res.user);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('th_session_user', JSON.stringify(res.user));
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
            actorEmail: res.user.email,
            actorRole: res.user.role,
            targetResource: '/login',
            details: `User ${res.user.name} successfully authenticated.`,
            status: 'SUCCESS',
            actorUid: res.user.id
          })
        }).catch(console.warn);

        return { success: true, user: res.user };
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
      setUser(nextUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('th_session_user', JSON.stringify(nextUser));
      } catch {}
    } else {
      logout();
    }
  };

  const isAdmin = Boolean(isAuthenticated && (user?.role === 'ADMIN' || user?.isVerifiedAdmin === true));
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

