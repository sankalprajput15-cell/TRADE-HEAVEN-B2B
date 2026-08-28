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
  setUser: (user: AuthUser | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    setIsLoading(true);
    
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      
      // 1. Check Master Admin statically
      if (cleanEmail === 'yr943334@gmail.com' && password === 'Yash@8532') {
        const adminUser: AuthUser = {
          id: 'admin-001',
          name: 'Yash Rajput',
          email: cleanEmail,
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
            action: 'AUTH_LOGIN',
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
          action: 'AUTH_LOGIN',
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

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated,
        isLoading,
        role: user?.role || null,
        isAdmin,
        setUser: handleSetUser,
        setCurrentUser: handleSetUser,
        login,
        logout
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

