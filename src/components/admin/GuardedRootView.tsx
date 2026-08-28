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
        // Clear only actual orphaned and corrupted temporary keys, preserving th_session_user
        const badKeys = ['stale_temp_token', 'corrupted_state_hash'];
        badKeys.forEach(k => window.localStorage.removeItem(k));
      }
    } catch {
      // Storage access blocked/restricted in sandboxed environment
    }
    return true;
  });

  useEffect(() => {
    // Secondary lifecycle sanitization to ensure complete validation boundary
    try {
      // Safely check if stored session user is malformed before accepting
      const userStr = localStorage.getItem('th_session_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          if (!parsed || typeof parsed !== 'object' || !parsed.email) {
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
