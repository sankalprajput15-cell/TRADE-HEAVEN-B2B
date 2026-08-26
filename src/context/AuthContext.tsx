import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { securityService } from '../services/securityService';

export interface AuthContextType {
  user: AuthUser | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  setUser: (user: AuthUser | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial user state strictly starts as null and unauthenticated for cold-starts/incognito
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 2. Safe cold-start session verification from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('th_session_jwt_token');
      const savedUserStr = localStorage.getItem('th_session_user') || localStorage.getItem('tradeheaven_user');

      if (!savedToken && !savedUserStr) {
        // No session exists: visitor is strictly a guest
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      if (savedToken) {
        const payload = securityService.verifySessionToken(savedToken);
        if (payload) {
          const restoredUser: AuthUser = {
            id: payload.uid,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            isPremium: payload.isPremium,
            membershipStatus: payload.membershipStatus,
            status: payload.status,
            isVerified: payload.isVerified,
            isVerifiedAdmin: payload.role === 'ADMIN',
            tier: payload.tier,
            companyName: payload.companyName,
            country: 'United Kingdom',
            token: savedToken
          };
          setUser(restoredUser);
          setIsAuthenticated(true);
          return;
        }
      }

      // If token is missing, invalid or expired, purge storage and ensure unauthenticated guest state
      localStorage.removeItem('th_session_jwt_token');
      localStorage.removeItem('th_session_user');
      localStorage.removeItem('tradeheaven_user');
      localStorage.removeItem('tradeheaven_auth_user');
      setUser(null);
      setIsAuthenticated(false);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = (authenticatedUser: AuthUser, token?: string) => {
    const userToken = token || authenticatedUser.token || '';
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('tradeheaven_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('th_session_user', JSON.stringify(authenticatedUser));
      if (userToken) {
        localStorage.setItem('th_session_jwt_token', userToken);
      }
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('tradeheaven_user');
      localStorage.removeItem('th_session_user');
      localStorage.removeItem('th_session_jwt_token');
      localStorage.removeItem('tradeheaven_auth_user');
    } catch {}
  };

  const handleSetUser = (nextUser: AuthUser | null) => {
    if (nextUser) {
      login(nextUser, nextUser.token);
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
