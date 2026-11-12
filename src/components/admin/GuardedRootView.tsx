import React, { useState, useEffect } from 'react';
import { VERIFIED_OTP_SESSION_KEY, isStrictVerifiedRootAdmin } from '../../context/AuthContext';

interface GuardedRootViewProps {
  children: React.ReactNode;
}

/**
 * Pre-Mount Security Guard
 * Intercepts application boot before any components render:
 * 1. Synchronously and defensively purges any stale, unauthenticated, or corrupted storage keys.
 * 2. Enforces guest-first cold starts and prevents unauthorized administrative interface or live-edit flashing.
 */
export const GuardedRootView: React.FC<GuardedRootViewProps> = ({ children }) => {
  const [isPreMountSanitized, setIsPreMountSanitized] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const badKeys = [
          'stale_temp_token',
          'corrupted_state_hash',
          'th_session_user',
          'th_admin_session_v1',
          'th_verified_otp_session_v2',
          'th_verified_otp_session_v3',
          'th_verified_otp_session_v4_otp_only',
          'tradeheaven_user',
          'tradeheaven_auth_user',
          'th_session_jwt_token',
          'th_admin_origin_user',
          'th_cms_access_permissions_v1'
        ];
        badKeys.forEach(k => {
          window.localStorage.removeItem(k);
          window.sessionStorage?.removeItem(k);
        });

        // Only allow th_live_edit_mode to remain if the active session is a strict verified root admin
        const activeSessionRaw = window.localStorage.getItem(VERIFIED_OTP_SESSION_KEY);
        if (!activeSessionRaw) {
          window.localStorage.removeItem('th_live_edit_mode');
        } else {
          try {
            const parsed = JSON.parse(activeSessionRaw);
            if (!isStrictVerifiedRootAdmin(parsed)) {
              window.localStorage.removeItem('th_live_edit_mode');
            }
          } catch {
            window.localStorage.removeItem(VERIFIED_OTP_SESSION_KEY);
            window.localStorage.removeItem('th_live_edit_mode');
          }
        }
      }
    } catch {
      // Storage access blocked/restricted in sandboxed environment
    }
    return true;
  });

  useEffect(() => {
    setIsPreMountSanitized(true);
  }, []);

  if (!isPreMountSanitized) {
    return null;
  }

  return <>{children}</>;
};
