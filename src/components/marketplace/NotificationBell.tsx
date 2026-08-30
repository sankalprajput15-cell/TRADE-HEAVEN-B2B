import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ChevronRight, MessageSquare, FileText, Settings, X, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ActiveView } from '../../types';

interface NotificationBellProps {
  onNavigate: (view: ActiveView, props?: any) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.linkView) {
      onNavigate(notif.linkView);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'RFQ': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'MESSAGE': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'ORDER': return <Check className="w-4 h-4 text-emerald-500" />;
      default: return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative shrink-0" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all shrink-0 cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Notifications {unreadCount > 0 && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[9px]">{unreadCount} New</span>}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-0.5">You have no new notifications.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex gap-3 group relative cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={`text-xs truncate ${notif.isRead ? 'text-slate-700 font-semibold' : 'text-slate-900 font-black'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {notif.linkView && (
                      <div className="shrink-0 self-center">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
