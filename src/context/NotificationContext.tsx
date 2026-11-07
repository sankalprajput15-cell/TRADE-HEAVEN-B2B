import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppNotification, DeliveryQueueHealthStatus } from '../types';

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
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const defaultMarkJohnsonNotif: AppNotification = {
      id: 'notif-mark-johnson-15-buyers-generators-cranes-2026',
      type: 'RFQ',
      title: '⚡🏗️ Message to Mark Johnson (Atlantic Power & Equipment Co.): 10 Buyers Inquired for Generators & 5 for Cranes',
      message:
        'Dispatched to mjohnson@atlanticpowerequip.com: 10 verified buyers visited your profile and inquired to buy Industrial Generators (CAT, Cummins, MTU, Perkins) and 5 buyers inquired to buy Heavy Cranes (Liebherr, Manitowoc, Grove, Tadano, Demag).',
      timestamp: Date.now(),
      isRead: false,
      linkView: 'DASHBOARD'
    };
    const defaultRandyNotif: AppNotification = {
      id: 'notif-randy-10-buyers-petroleum-2026',
      type: 'RFQ',
      title: '⛽ Message to Mr. Randy (Middle Fox LLC): 10 Buyers Visited Profile & Inquired for Petroleum',
      message:
        'Dispatched to randy@midforkcap.com: 10 verified buyers visited your Middle Fox LLC profile and inquired to buy petroleum products (EN 590 10PPM, Jet Fuel A-1, D6, ESPO Crude, MGO, Mazut M100, LNG, AGO, Petcoke & Base Oil SN500).',
      timestamp: Date.now() - 60000,
      isRead: false,
      linkView: 'DASHBOARD'
    };
    try {
      const saved = localStorage.getItem('tradeheaven_notifications');
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (n) => n.id !== defaultMarkJohnsonNotif.id && n.id !== defaultRandyNotif.id
          );
          return [defaultMarkJohnsonNotif, defaultRandyNotif, ...filtered];
        }
      }
      return [defaultMarkJohnsonNotif, defaultRandyNotif];
    } catch (e) {
      return [defaultMarkJohnsonNotif, defaultRandyNotif];
    }
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
      localStorage.setItem('tradeheaven_notifications', JSON.stringify(notifications));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const evaluateQueueHealthAndNotify = useCallback(
    (queue: DeliveryQueueHealthStatus) => {
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
    [addNotification]
  );

  const refreshDeliveryQueueStatus = useCallback(async (): Promise<DeliveryQueueHealthStatus | null> => {
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
  }, [evaluateQueueHealthAndNotify]);

  const resetDeliveryQueueAlert = useCallback(async () => {
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
  }, [evaluateQueueHealthAndNotify]);

  const simulateDeliveryQueueFailures = useCallback(
    async (count = 5) => {
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
    [evaluateQueueHealthAndNotify]
  );

  // Poll server-side delivery queue health every 30 seconds without causing unnecessary re-renders
  useEffect(() => {
    void refreshDeliveryQueueStatus();
    const intervalId = setInterval(() => {
      void refreshDeliveryQueueStatus();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refreshDeliveryQueueStatus]);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isDeliveryQueueFlagged =
    deliveryQueueStatus.isFlagged ||
    deliveryQueueStatus.consecutiveFailures >= (deliveryQueueStatus.failureThreshold || 5);

  // Mock real-time incoming notifications
  useEffect(() => {
    let timeoutId: any;
    
    // Simulate first real-time notification after 15 seconds
    timeoutId = setTimeout(() => {
      addNotification({
        type: 'RFQ',
        title: 'New Match: Steel Pipes RFQ',
        message: 'A buyer in UAE just posted an RFQ matching your product catalog.',
        linkView: 'RFQ_HUB'
      });
      
      // Then simulate another one randomly 30 seconds later
      setTimeout(() => {
        addNotification({
          type: 'MESSAGE',
          title: 'New Message Received',
          message: 'TechGlobal Inc. has replied to your quote in the Negotiation Room.',
          linkView: 'NEGOTIATION_ROOM'
        });
      }, 30000);
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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

