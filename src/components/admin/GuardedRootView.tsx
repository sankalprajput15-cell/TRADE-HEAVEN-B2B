import React, { useState, useEffect } from 'react';

interface GuardedRootViewProps {
  children: React.ReactNode;
}

/**
 * Pre-Mount Security Guard
 * Intercepts application boot before any components render:
 * 1. Synchronously and defensively purges any stale, unauthenticated, or corrupted storage keys.
 * 2. Enforces guest-first cold starts and prevents unauthorized administrative interface flashing.
 */
export const GuardedRootView: React.FC<GuardedRootViewProps> = ({ children }) => {
  const [isPreMountSanitized, setIsPreMountSanitized] = useState<boolean>(() => {
    // Synchronous storage sanitization on module execution
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const badKeys = [
          'stale_temp_token',
          'corrupted_state_hash',
          'th_session_user',
          'tradeheaven_user',
          'tradeheaven_auth_user',
          'th_session_jwt_token',
          'th_admin_origin_user'
        ];
        badKeys.forEach(k => {
          window.localStorage.removeItem(k);
          window.sessionStorage?.removeItem(k);
        });
      }
    } catch {
      // Storage access blocked/restricted in sandboxed environment
    }
    return true;
  });

  useEffect(() => {
    // Secondary lifecycle sanitization to ensure guest-first boot (never auto-login admin)
    try {
      const userStr = localStorage.getItem('th_session_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          if (
            !parsed ||
            typeof parsed !== 'object' ||
            !parsed.email ||
            parsed.role === 'ADMIN' ||
            parsed.isVerifiedAdmin === true ||
            parsed.id === 'admin-001' ||
            parsed.id === 'user-admin-001' ||
            String(parsed.email).toLowerCase() === 'yr943334@gmail.com' ||
            String(parsed.email).toLowerCase() === 'admin@tradeheaven.net'
          ) {
            localStorage.removeItem('th_session_user');
            localStorage.removeItem('th_session_jwt_token');
          }
        } catch {
          localStorage.removeItem('th_session_user');
          localStorage.removeItem('th_session_jwt_token');
        }
      }
    } catch {}
    setIsPreMountSanitized(true);
  }, []);

  if (!isPreMountSanitized) {
    return null;
  }

  return <>{children}</>;
};
