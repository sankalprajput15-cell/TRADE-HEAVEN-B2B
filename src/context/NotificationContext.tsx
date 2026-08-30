import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppNotification, ActiveView } from '../types';

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('tradeheaven_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tradeheaven_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

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
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
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
