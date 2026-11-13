import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

export interface LoginResult {
  success: boolean;
  requiresOtp?: boolean;
  email?: string;
  maskedEmail?: string;
  role?: string;
  error?: string;
  message?: string;
  user?: AuthUser;
}

export interface OtpService {
  requestLoginOtp: (email: string, password?: string) => Promise<{
    success: boolean;
    requiresOtp?: boolean;
    email?: string;
    maskedEmail?: string;
    role?: string;
    message?: string;
    error?: string;
  }>;
  verifyLoginOtp: (email: string, otp: string) => Promise<LoginResult>;
  resendLoginOtp: (email: string) => Promise<{ success: boolean; maskedEmail?: string; message: string }>;
  requestRegistrationOtp: (email: string, name?: string, accountType?: 'BUYER' | 'SUPPLIER') => Promise<{
    success: boolean;
    maskedEmail?: string;
    message?: string;
    error?: string;
  }>;
}

export interface AuthContextType {
  user: AuthUser | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isImpersonating: boolean;
  otpService: OtpService;
  setUser: (user: AuthUser | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  login: (email?: string, password?: string, otp?: string) => Promise<LoginResult>;
  verifyLoginOtp: (email: string, otp: string) => Promise<LoginResult>;
  resendLoginOtp: (email: string) => Promise<{ success: boolean; maskedEmail?: string; message: string }>;
  revokeAllAdminSessions: (reason?: string) => Promise<void>;
  logout: () => void;
  impersonateUser: (targetUser: AuthUser) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const VERIFIED_OTP_SESSION_KEY = 'th_verified_otp_session_v5_strict_admin';

export const AUTHORIZED_ADMIN_EMAILS = new Set([
  'yr943334@gmail.com',
  'sankalprajput15@gmail.com'
]);

export function isStrictVerifiedRootAdmin(u: AuthUser | null | undefined): boolean {
  if (!u || typeof u !== 'object') return false;
  const emailLower = (u.email || '').trim().toLowerCase();
  if (
    emailLower === 'zac@otec.ltd' ||
    emailLower === 'zac@fadetech.com' ||
    u.id === 'user-supplier-zac'
  ) {
    return false;
  }
  return Boolean(
    AUTHORIZED_ADMIN_EMAILS.has(emailLower) &&
      u.role === 'ADMIN' &&
      u.isVerifiedAdmin === true &&
      (u as any).otpVerified === true &&
      typeof u.token === 'string' &&
      u.token.trim().length >= 8
  );
}

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

  // Strictly block any account from holding ADMIN role unless it is an authorized root admin
  // AND has completed server-side 2FA Email OTP verification with a valid JWT token
  const isVerifiedRootAdmin =
    AUTHORIZED_ADMIN_EMAILS.has(emailLower) &&
    Boolean(u.token) &&
    (u as any).otpVerified === true &&
    u.role === 'ADMIN';

  if (u.role === 'ADMIN' || u.isVerifiedAdmin) {
    if (!isVerifiedRootAdmin) {
      return {
        ...u,
        role: 'BUYER',
        isVerifiedAdmin: false,
        avatarUrl: baseAvatar
      };
    }
    return {
      ...u,
      role: 'ADMIN',
      isVerifiedAdmin: true,
      avatarUrl: baseAvatar
    };
  }

  return {
    ...u,
    isVerifiedAdmin: false,
    avatarUrl: baseAvatar
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        // Purge all legacy / exposed-key session tokens so any unverified session is signed out immediately
        localStorage.removeItem('th_admin_session_v1');
        localStorage.removeItem('th_session_user');
        localStorage.removeItem('th_verified_otp_session_v2');
        localStorage.removeItem('th_verified_otp_session_v3');
        localStorage.removeItem('th_verified_otp_session_v4_otp_only');
        localStorage.removeItem('tradeheaven_user');
        localStorage.removeItem('tradeheaven_auth_user');

        const params = new URLSearchParams(window.location.search);
        const paramEmail = (params.get('email') || '').trim().toLowerCase();
        if (params.get('pay_zac') === '1' || paramEmail === 'zac@otec.ltd' || paramEmail === 'zac@fadetech.com') {
          localStorage.removeItem('th_live_edit_mode');
          return DEFAULT_ZAC_CLIENT_USER;
        }
        if (
          params.get('action') === 'renew-membership' &&
          paramEmail &&
          !AUTHORIZED_ADMIN_EMAILS.has(paramEmail)
        ) {
          localStorage.removeItem('th_live_edit_mode');
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

        // Restore session ONLY if it was verified via the rotated OTP-only session key
        const savedVerifiedRaw = localStorage.getItem(VERIFIED_OTP_SESSION_KEY);
        if (savedVerifiedRaw) {
          const parsedUser = JSON.parse(savedVerifiedRaw);
          if (
            parsedUser &&
            typeof parsedUser === 'object' &&
            parsedUser.email &&
            parsedUser.token &&
            parsedUser.otpVerified === true
          ) {
            const sanitized = sanitizeUserRole(parsedUser);
            if (!isStrictVerifiedRootAdmin(sanitized)) {
              localStorage.removeItem('th_live_edit_mode');
            }
            return sanitized;
          } else {
            localStorage.removeItem(VERIFIED_OTP_SESSION_KEY);
            localStorage.removeItem('th_live_edit_mode');
          }
        } else {
          localStorage.removeItem('th_live_edit_mode');
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

  // Verify active JWT against the server's rotated cryptographic secret & global admin revocation epoch
  // Any administrator session signed with the old exposed secret or before a global revocation is immediately signed out
  useEffect(() => {
    if (!user?.token) return;
    let isMounted = true;

    const verifyActiveSessionWithServer = async () => {
      try {
        const result = await apiClient.verifySessionMe(user.token || '');
        if (!result.valid && result.revoked && isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setOriginalAdminUser(null);
          try {
            localStorage.removeItem(VERIFIED_OTP_SESSION_KEY);
            localStorage.removeItem('th_session_jwt_token');
            localStorage.removeItem('th_verified_otp_session_v2');
            localStorage.removeItem('th_verified_otp_session_v3');
          } catch {}
          window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: null } }));
        }
      } catch {
        // Ignore transient network offline states
      }
    };

    verifyActiveSessionWithServer();
    const intervalId = window.setInterval(verifyActiveSessionWithServer, 25000);
    const handleFocus = () => verifyActiveSessionWithServer();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.token]);

  const impersonateUser = (targetUser: AuthUser) => {
    const currentAdmin = originalAdminUser || user;
    if (currentAdmin && currentAdmin.role === 'ADMIN' && (currentAdmin as any).otpVerified === true) {
      setOriginalAdminUser(currentAdmin);
      setUser(targetUser);
      setIsAuthenticated(true);
    }
  };

  const stopImpersonation = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      setIsAuthenticated(true);
      setOriginalAdminUser(null);
    }
  };

  const login = async (email?: string, password?: string, otp?: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const isRootAdminEmail = AUTHORIZED_ADMIN_EMAILS.has(cleanEmail);

      if (!cleanEmail) {
        return { success: false, error: 'Registered email address is required.' };
      }
      if (!isRootAdminEmail && !password) {
        return { success: false, error: 'Both registered email and password are required.' };
      }

      const res = await apiClient.login(cleanEmail, isRootAdminEmail ? undefined : password, otp);

      if (res.success && res.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: res.email || cleanEmail,
          maskedEmail: res.maskedEmail || cleanEmail,
          role: res.role,
          message: res.message
        };
      }

      if (res.success && res.user) {
        const sanitizedUser = sanitizeUserRole({
          ...res.user,
          otpVerified: true
        } as AuthUser);
        setUser(sanitizedUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(VERIFIED_OTP_SESSION_KEY, JSON.stringify(sanitizedUser));
          if (res.token) {
            localStorage.setItem('th_session_jwt_token', res.token);
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: sanitizedUser } }));
        return { success: true, user: sanitizedUser, message: res.message };
      }

      return { success: false, error: res.error || res.message || 'Invalid credentials' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network communication failure' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLoginOtp = async (email: string, otp: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const res = await apiClient.verifyLoginOtp(cleanEmail, otp);

      if (res.success && res.user) {
        const verifiedUser = sanitizeUserRole({
          ...res.user,
          otpVerified: true
        } as AuthUser);

        setUser(verifiedUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(VERIFIED_OTP_SESSION_KEY, JSON.stringify(verifiedUser));
          if (res.token) {
            localStorage.setItem('th_session_jwt_token', res.token);
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: verifiedUser } }));
        return {
          success: true,
          user: verifiedUser,
          message: res.message
        };
      }

      return {
        success: false,
        error: res.error || res.message || 'Invalid or expired 6-digit OTP code.'
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'OTP verification failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendLoginOtp = async (email: string) => {
    return await apiClient.resendLoginOtp(email);
  };

  const logout = () => {
    if (user?.token || user?.email) {
      fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify({ email: user?.email || '' })
      }).catch(() => {});
    }

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
      localStorage.removeItem('th_verified_otp_session_v2');
      localStorage.removeItem('th_verified_otp_session_v3');
      localStorage.removeItem('th_verified_otp_session_v4_otp_only');
      localStorage.removeItem(VERIFIED_OTP_SESSION_KEY);
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

  const revokeAllAdminSessions = async (reason?: string) => {
    try {
      await apiClient.revokeAllAdminSessionsGlobally(
        reason || 'Emergency global administrator sign-out due to secret key rotation'
      );
    } catch {}
    logout();
  };

  const handleSetUser = (nextUser: AuthUser | null) => {
    if (nextUser) {
      const sanitized = sanitizeUserRole(nextUser);
      setUser(sanitized);
      setIsAuthenticated(true);
      try {
        if (!isStrictVerifiedRootAdmin(sanitized)) {
          localStorage.removeItem('th_live_edit_mode');
        }
        if ((sanitized as any).otpVerified === true && sanitized.token) {
          localStorage.setItem(VERIFIED_OTP_SESSION_KEY, JSON.stringify(sanitized));
        }
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_auth_changed', { detail: { user: sanitized } }));
      }
    } else {
      logout();
    }
  };

  const isAdmin = Boolean(isAuthenticated && isStrictVerifiedRootAdmin(user));
  const isImpersonating = Boolean(originalAdminUser);
  const otpService: OtpService = {
    requestLoginOtp: async (email: string, password?: string) => {
      const cleanEmail = (email || '').trim().toLowerCase();
      const isRootAdmin = AUTHORIZED_ADMIN_EMAILS.has(cleanEmail);
      return await apiClient.sendAuthOtp({
        email: cleanEmail,
        password: isRootAdmin ? undefined : password,
        mode: 'LOGIN'
      });
    },
    verifyLoginOtp: async (email: string, otp: string) => {
      return await verifyLoginOtp(email, otp);
    },
    resendLoginOtp: async (email: string) => {
      return await resendLoginOtp(email);
    },
    requestRegistrationOtp: async (email: string, name?: string, accountType: 'BUYER' | 'SUPPLIER' = 'BUYER') => {
      return await apiClient.sendAuthOtp({
        email: (email || '').trim().toLowerCase(),
        name: (name || '').trim() || undefined,
        mode: 'REGISTER',
        accountType
      });
    }
  };

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
        otpService,
        setUser: handleSetUser,
        setCurrentUser: handleSetUser,
        login,
        verifyLoginOtp,
        resendLoginOtp,
        revokeAllAdminSessions,
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

