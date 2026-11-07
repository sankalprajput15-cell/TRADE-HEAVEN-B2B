import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppNotification, DeliveryQueueHealthStatus } from '../types';
import { Upload, Edit, Trash2, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';

const DEFAULT_QUEUE_STATUS: DeliveryQueueHealthStatus = {
  minDelayMs: 2000,
  queueDepth: 0,
  isProcessing: false,
  totalProcessed: 0,
  consecutiveFailures: 0,
  failureThreshold: 5,
  isFlagged: false,
  lastFailureReason: null,
  lastFailureAlertId: null,
  lastFailureAlertTriggeredAt: null,
  lastDispatchedAt: null,
  recentDeliveries: []
};

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  deliveryQueueStatus: DeliveryQueueHealthStatus;
  isDeliveryQueueFlagged: boolean;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refreshDeliveryQueueStatus: () => Promise<DeliveryQueueHealthStatus | null>;
  resetDeliveryQueueAlert: () => Promise<void>;
  simulateDeliveryQueueFailures: (count?: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const isUserAuthenticated = Boolean(currentUser && isAuthenticated);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('tradeheaven_notifications');
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (n) =>
              n &&
              n.id &&
              !n.id.includes('notif-mark-johnson') &&
              !n.id.includes('notif-randy') &&
              !n.title?.toLowerCase().includes('message to mark johnson') &&
              !n.title?.toLowerCase().includes('message to mr. randy')
          );
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [deliveryQueueStatus, setDeliveryQueueStatus] = useState<DeliveryQueueHealthStatus>(DEFAULT_QUEUE_STATUS);
  const lastNotifiedAlertIdRef = useRef<string | null>(
    (() => {
      try {
        return localStorage.getItem('tradeheaven_last_queue_alert_id');
      } catch {
        return null;
      }
    })()
  );

  useEffect(() => {
    try {
      const cleaned = notifications.filter(
        (n) =>
          n &&
          n.id &&
          !n.id.includes('notif-mark-johnson') &&
          !n.id.includes('notif-randy') &&
          !n.title?.toLowerCase().includes('message to mark johnson') &&
          !n.title?.toLowerCase().includes('message to mr. randy')
      );
      localStorage.setItem('tradeheaven_notifications', JSON.stringify(cleaned));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Instantly clear and suppress any active toast if user is unauthenticated or in guest mode
  useEffect(() => {
    if (!isUserAuthenticated) {
      setActiveToast(null);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    }
  }, [isUserAuthenticated]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    // Strictly verify user authentication status before emitting any toast notifications or pop-up alerts
    // to ensure guest users are never interrupted by account-related messages.
    if (!currentUser || !isAuthenticated) {
      return;
    }

    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Show instant floating on-screen toast strictly for verified authenticated users
    setActiveToast(newNotif);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  }, [currentUser, isAuthenticated]);

  // Global listener for cross-app notifications (delete, edit, upload, system)
  useEffect(() => {
    const handleCustomNotify = (e: Event) => {
      // Guard at event entry point: guest users never process or emit notifications
      if (!currentUser || !isAuthenticated) {
        return;
      }
      const customEvent = e as CustomEvent<Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>>;
      if (customEvent.detail && customEvent.detail.title) {
        addNotification(customEvent.detail);
      }
    };
    window.addEventListener('tradeheaven_notify', handleCustomNotify);
    return () => window.removeEventListener('tradeheaven_notify', handleCustomNotify);
  }, [addNotification, currentUser, isAuthenticated]);

  const evaluateQueueHealthAndNotify = useCallback(
    (queue: DeliveryQueueHealthStatus) => {
      // System queue alerts are strictly for authenticated administrators
      if (!currentUser || !isAuthenticated || currentUser.role !== 'ADMIN') {
        return;
      }

      setDeliveryQueueStatus((prev) => {
        if (
          prev.consecutiveFailures === queue.consecutiveFailures &&
          prev.isFlagged === queue.isFlagged &&
          prev.queueDepth === queue.queueDepth &&
          prev.totalProcessed === queue.totalProcessed &&
          prev.lastFailureAlertId === queue.lastFailureAlertId
        ) {
          return prev;
        }
        return queue;
      });

      const threshold = queue.failureThreshold || 5;
      const isFlagged = queue.isFlagged || queue.consecutiveFailures >= threshold;

      if (isFlagged) {
        const alertKey =
          queue.lastFailureAlertId ||
          `dq-streak-${queue.consecutiveFailures}-${queue.lastFailureAlertTriggeredAt || 'active'}`;

        if (lastNotifiedAlertIdRef.current !== alertKey) {
          lastNotifiedAlertIdRef.current = alertKey;
          try {
            localStorage.setItem('tradeheaven_last_queue_alert_id', alertKey);
          } catch {
            // ignore
          }

          addNotification({
            type: 'SYSTEM',
            title: `🚨 Delivery Queue Alert: ${queue.consecutiveFailures} Consecutive Failures`,
            message: `The serialized SMTP delivery queue experienced ${queue.consecutiveFailures} consecutive failures (Threshold: ${threshold}). Last error: ${
              queue.lastFailureReason || 'Upstream SMTP transport failure'
            }. Status flagged in Admin Console.`,
            linkView: 'CLIENT_ADMIN'
          });
        }
      } else if (queue.consecutiveFailures === 0 && lastNotifiedAlertIdRef.current) {
        lastNotifiedAlertIdRef.current = null;
        try {
          localStorage.removeItem('tradeheaven_last_queue_alert_id');
        } catch {
          // ignore
        }
      }
    },
    [addNotification, currentUser, isAuthenticated]
  );

  const refreshDeliveryQueueStatus = useCallback(async (): Promise<DeliveryQueueHealthStatus | null> => {
    // Guest users should never poll or receive admin delivery queue health data
    if (!currentUser || !isAuthenticated || currentUser.role !== 'ADMIN') {
      return null;
    }

    try {
      const response = await fetch('/api/v1/auth/email-queue-status', {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data?.success && data?.queue) {
        evaluateQueueHealthAndNotify(data.queue);
        return data.queue as DeliveryQueueHealthStatus;
      }
    } catch {
      // ignore transient network errors during background polling
    }
    return null;
  }, [evaluateQueueHealthAndNotify, currentUser, isAuthenticated]);

  const resetDeliveryQueueAlert = useCallback(async () => {
    if (!currentUser || !isAuthenticated || currentUser.role !== 'ADMIN') return;
    try {
      const response = await fetch('/api/v1/auth/email-queue-reset-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.queue) {
          evaluateQueueHealthAndNotify(data.queue);
        }
      }
    } catch {
      // ignore
    }
  }, [evaluateQueueHealthAndNotify, currentUser, isAuthenticated]);

  const simulateDeliveryQueueFailures = useCallback(
    async (count = 5) => {
      if (!currentUser || !isAuthenticated || currentUser.role !== 'ADMIN') return;
      try {
        const response = await fetch('/api/v1/auth/email-queue-simulate-failures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            count,
            reason: 'SMTP relay timeout after 5 consecutive serialized dispatch attempts'
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.queue) {
            evaluateQueueHealthAndNotify(data.queue);
          }
        }
      } catch {
        // ignore
      }
    },
    [evaluateQueueHealthAndNotify, currentUser, isAuthenticated]
  );

  // Poll server-side delivery queue health every 30 seconds only when authenticated as Admin
  useEffect(() => {
    if (!currentUser || !isAuthenticated || currentUser.role !== 'ADMIN') {
      return;
    }
    void refreshDeliveryQueueStatus();
    const intervalId = setInterval(() => {
      void refreshDeliveryQueueStatus();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refreshDeliveryQueueStatus, currentUser, isAuthenticated]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const visibleNotifications = isUserAuthenticated ? notifications : [];
  const unreadCount = isUserAuthenticated ? notifications.filter((n) => !n.isRead).length : 0;
  const isDeliveryQueueFlagged =
    Boolean(isUserAuthenticated && currentUser?.role === 'ADMIN') &&
    (deliveryQueueStatus.isFlagged ||
      deliveryQueueStatus.consecutiveFailures >= (deliveryQueueStatus.failureThreshold || 5));

  return (
    <NotificationContext.Provider
      value={{
        notifications: visibleNotifications,
        unreadCount,
        deliveryQueueStatus,
        isDeliveryQueueFlagged,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        refreshDeliveryQueueStatus,
        resetDeliveryQueueAlert,
        simulateDeliveryQueueFailures,
      }}
    >
      {children}

      {/* Floating On-Screen Toast Notification - Strictly verified for authenticated users only */}
      {isUserAuthenticated && activeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              activeToast.type === 'DELETE'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : activeToast.type === 'UPLOAD'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : activeToast.type === 'EDIT'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {activeToast.type === 'DELETE' ? (
              <Trash2 className="w-4 h-4" />
            ) : activeToast.type === 'UPLOAD' ? (
              <Upload className="w-4 h-4" />
            ) : activeToast.type === 'EDIT' ? (
              <Edit className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  activeToast.type === 'DELETE'
                    ? 'bg-rose-500 text-white'
                    : activeToast.type === 'UPLOAD'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : activeToast.type === 'EDIT'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-blue-500 text-white'
                }`}
              >
                {activeToast.type}
              </span>
              <span className="text-xs font-black truncate">{activeToast.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {activeToast.message}
            </p>
            {activeToast.linkView && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('tradeheaven_navigate', { detail: activeToast.linkView })
                  );
                  setActiveToast(null);
                }}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 hover:text-blue-200 underline cursor-pointer"
              >
                <span>View in App</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

