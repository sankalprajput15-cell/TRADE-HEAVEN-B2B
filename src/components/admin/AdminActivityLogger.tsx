import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../types';
import { Activity, ShieldCheck, Trash2, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export interface AdminActivityItem {
  id: string;
  timestamp: string;
  actionType: 'PLAN_PRICE_UPDATE' | 'ENTITY_CREATION' | 'IMPERSONATION' | 'USER_PRIVILEGE_UPDATE' | 'SETTINGS_UPDATE';
  description: string;
  status: 'SUCCESS' | 'FAILURE';
  actor: string;
}

interface Props {
  currentUser?: AuthUser | null;
}

// In-memory non-persistent event bus for admin activities
class AdminActivityBus {
  private listeners: ((items: AdminActivityItem[]) => void)[] = [];
  private items: AdminActivityItem[] = [];

  public logActivity(actionType: AdminActivityItem['actionType'], description: string, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS', actor = 'Admin') {
    const item: AdminActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      actionType,
      description,
      status,
      actor
    };
    this.items.unshift(item);
    if (this.items.length > 50) {
      this.items = this.items.slice(0, 50);
    }
    this.notify();
  }

  public getItems(): AdminActivityItem[] {
    return [...this.items];
  }

  public clear() {
    this.items = [];
    this.notify();
  }

  public subscribe(cb: (items: AdminActivityItem[]) => void) {
    this.listeners.push(cb);
    cb(this.getItems());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const current = this.getItems();
    this.listeners.forEach(l => l(current));
  }
}

export const adminActivityBus = new AdminActivityBus();

export const AdminActivityLogger: React.FC<Props> = ({ currentUser }) => {
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const isAdmin = Boolean(currentUser && (currentUser.role === 'ADMIN' || currentUser.isVerifiedAdmin === true));

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = adminActivityBus.subscribe(items => {
      setActivities(items);
    });
    return unsubscribe;
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Dashboard Activity Stream</span>
          </div>
          <h3 className="text-base font-black text-slate-900">
            Real-Time Admin Activity Logger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-persistent live session log intercepting admin actions (plan updates, entity creations, impersonations).
          </p>
        </div>

        {activities.length > 0 && (
          <button
            type="button"
            onClick={() => adminActivityBus.clear()}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Stream</span>
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
          <Zap className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <span className="font-bold">No admin activities recorded yet in this session.</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Actions like updating plan pricing, creating entities, or logging in as clients will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {activities.map(act => (
            <div
              key={act.id}
              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`p-2 rounded-xl shrink-0 ${
                  act.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {act.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {act.actionType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.timestamp}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 mt-1 truncate">
                    {act.description}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-white px-2 py-1 rounded border border-slate-200">
                By: {act.actor}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
