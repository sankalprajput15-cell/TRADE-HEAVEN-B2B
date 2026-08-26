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
        window.localStorage.removeItem('th_session_jwt_token');
        window.localStorage.removeItem('th_session_user');
        window.localStorage.removeItem('tradeheaven_user');
        window.localStorage.removeItem('tradeheaven_auth_user');
        window.localStorage.removeItem('th_active_auth_user');
        window.localStorage.removeItem('th_rbac_user');
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('th_session_jwt_token');
        window.sessionStorage.removeItem('th_session_user');
      }
    } catch {
      // Storage access blocked/restricted in sandboxed environment
    }
    return true;
  });

  useEffect(() => {
    // Secondary lifecycle sanitization to ensure complete cold-start boundary
    try {
      localStorage.removeItem('th_session_jwt_token');
      localStorage.removeItem('th_session_user');
      localStorage.removeItem('tradeheaven_user');
      localStorage.removeItem('tradeheaven_auth_user');
      localStorage.removeItem('th_active_auth_user');
      localStorage.removeItem('th_rbac_user');
    } catch {}
    setIsPreMountSanitized(true);
  }, []);

  if (!isPreMountSanitized) {
    return null;
  }

  return <>{children}</>;
};
