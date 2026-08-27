import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';

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
  // 1. Initial user state strictly starts as null and unauthenticated (in-memory only)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 2. Cold-Start Reset: purge all legacy persistence keys on initial mount
  useEffect(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // 3. Auto Sign-Off on Unload / Page Leave / Refresh
  useEffect(() => {
    const handleSignOff = () => {
      setUser(null);
      setIsAuthenticated(false);
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    };

    window.addEventListener('beforeunload', handleSignOff);
    window.addEventListener('pagehide', handleSignOff);

    return () => {
      window.removeEventListener('beforeunload', handleSignOff);
      window.removeEventListener('pagehide', handleSignOff);
    };
  }, []);

  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    setIsLoading(true);
    
    // Simulate network delay for security feel
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      if (email === 'yr943334@gmail.com' && password === 'Yash@8532') {
        const adminUser: AuthUser = {
          id: 'admin-001',
          name: 'Yash Rajput',
          email: email,
          role: 'ADMIN',
          isVerifiedAdmin: true,
          isVerified: true,
          companyName: 'Trade Heaven Admin',
          country: 'Global',
          isPremium: true,
          status: 'ACTIVE',
          token: 'th-admin-ephemeral-session-token'
        };
        
        setUser(adminUser);
        setIsAuthenticated(true);
        return { success: true, user: adminUser };
      }
      
      return { success: false, error: 'Invalid admin credentials provided.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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
