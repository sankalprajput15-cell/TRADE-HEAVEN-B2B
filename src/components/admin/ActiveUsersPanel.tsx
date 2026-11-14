import React, { useState, useEffect } from 'react';
import {
  Users,
  RefreshCw,
  Mail,
  Bell,
  Search,
  Clock,
  Activity,
  Timer
} from 'lucide-react';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';

export interface ActivePlatformUserSession {
  userId: string;
  email: string;
  name: string;
  username?: string;
  role: string;
  tier: string;
  companyName: string;
  country: string;
  currentView: string;
  lastAction?: string;
  userAgent: string;
  ipAddress: string;
  loggedInAt: number;
  lastActiveAt: number;
  lastActionAt?: number;
  isOnlineNow: boolean;
  secondsAgo: number;
  lastActionSecondsAgo?: number;
  lastActionIso?: string;
  loggedInAtIso?: string;
  sessionDurationMs?: number;
  sessionDurationMinutes?: number;
  sessionDurationFormatted?: string;
  expiresInSeconds?: number;
}

export interface PlatformAuthEventItem {
  id: string;
  eventType: 'LOGIN' | 'LOGOUT';
  email: string;
  name: string;
  role: string;
  companyName: string;
  country: string;
  currentView: string;
  ipAddress: string;
  timestamp: string;
  emailAlertQueued?: boolean;
}

interface ActiveUsersPanelProps {
  sessions: ActivePlatformUserSession[];
  recentAuthEvents: PlatformAuthEventItem[];
  counts: {
    onlineCount: number;
    activeSessionCount: number;
    totalRegisteredUsers: number;
  };
  isLoading: boolean;
  authEmailAlertsEnabled: boolean;
  isTogglingAuthAlerts: boolean;
  onRefresh: () => void;
  onToggleAuthEmailAlerts: () => void;
}

function formatDurationHm(durationMs: number): string {
  const safeMs = Math.max(0, durationMs);
  const totalMinutes = Math.floor(safeMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function formatRelativeSeconds(seconds?: number): string {
  const sec = Math.max(0, Number(seconds ?? 0));
  if (sec < 10) return 'Just now';
  if (sec < 60) return `${sec}s ago`;
  const mins = Math.floor(sec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function getRoleBadgeClass(role: string): string {
  const upper = (role || '').toUpperCase();
  if (upper === 'ADMIN') return 'bg-purple-100 text-purple-800 border-purple-200';
  if (upper === 'SUPPLIER') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (upper === 'BUYER') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export const ActiveUsersPanel: React.FC<ActiveUsersPanelProps> = ({
  sessions,
  recentAuthEvents,
  counts,
  isLoading,
  authEmailAlertsEnabled,
  isTogglingAuthAlerts,
  onRefresh,
  onToggleAuthEmailAlerts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'BUYER' | 'SUPPLIER' | 'ADMIN'>('ALL');
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  // Tick every 30s so session durations ('Xh Ym') and idle countdowns stay live between backend polls
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const filteredSessions = sessions.filter((sess) => {
    const matchesRole = roleFilter === 'ALL' || (sess.role || '').toUpperCase() === roleFilter;
    if (!matchesRole) return false;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (sess.username || sess.name || '').toLowerCase().includes(q) ||
      (sess.email || '').toLowerCase().includes(q) ||
      (sess.companyName || '').toLowerCase().includes(q) ||
      (sess.lastAction || '').toLowerCase().includes(q)
    );
  });

  return (
    <section
      aria-labelledby="admin-live-users-heading"
      data-testid="admin-live-users-panel"
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 id="admin-live-users-heading" className="text-base sm:text-lg font-black text-slate-900 flex flex-wrap items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Active Users</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live · 10s Sync
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              30m Idle Auto-Expire
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time logged-in sessions with roles, last portal action, total session duration, and automatic 30-minute inactivity expiration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={onToggleAuthEmailAlerts}
            disabled={isTogglingAuthAlerts}
            data-testid="toggle-auth-email-alerts-btn"
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              authEmailAlertsEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Send automated email notifications to Admin whenever any user logs in or logs out"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Login/Logout Email Alerts: {authEmailAlertsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            data-testid="refresh-live-users-btn"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh Active Users'}</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Online Now (&lt; 2m)</div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums mt-0.5">{counts.onlineCount}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Active Sessions (30m Timeout)</div>
          <div className="text-2xl font-black text-blue-900 tabular-nums mt-0.5">{counts.activeSessionCount}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Registered Accounts</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums mt-0.5">{counts.totalRegisteredUsers}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by username, email, company, or action..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'BUYER', 'SUPPLIER', 'ADMIN'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                roleFilter === role
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Active Sessions Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 font-extrabold text-slate-700 uppercase">Username &amp; Account</th>
              <th className="p-3 font-extrabold text-slate-700 uppercase">Role &amp; Plan</th>
              <th className="p-3 font-extrabold text-slate-700 uppercase">Last Portal Action</th>
              <th className="p-3 font-extrabold text-slate-700 uppercase">Last Action Time</th>
              <th className="p-3 font-extrabold text-slate-700 uppercase">Session Duration</th>
              <th className="p-3 font-extrabold text-slate-700 uppercase">Session Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSessions.map((sess) => {
              const actionTs = sess.lastActionAt || sess.lastActiveAt;
              const liveActionSec = Math.max(
                sess.lastActionSecondsAgo ?? sess.secondsAgo ?? 0,
                Math.floor((nowTick - actionTs) / 1000)
              );
              const liveDurationFormatted = sess.loggedInAt
                ? formatDurationHm(Math.max(sess.sessionDurationMs ?? 0, nowTick - sess.loggedInAt))
                : (sess.sessionDurationFormatted || '0h 0m');
              const remainingMins = Math.max(0, Math.ceil((30 * 60 - liveActionSec) / 60));

              return (
                <tr key={sess.email} className="hover:bg-slate-50" data-testid={`active-user-row-${sess.email}`}>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{sess.username || sess.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{sess.email}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {sess.companyName} · {sess.country}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-black uppercase ${getRoleBadgeClass(sess.role)}`}>
                      {sess.role}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">{sess.tier}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{sess.lastAction || `Viewing ${sess.currentView || 'HOMEPAGE'}`}</span>
                    </div>
                    <div className="text-[11px] font-mono text-blue-700 mt-0.5">
                      Page: {sess.currentView || 'HOMEPAGE'}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap tabular-nums">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatRelativeSeconds(liveActionSec)}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {new Date(actionTs).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap tabular-nums">
                    <div className="font-black text-slate-900 flex items-center gap-1.5" data-testid={`session-duration-${sess.email}`}>
                      <Timer className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{liveDurationFormatted}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Signed in {new Date(sess.loggedInAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        sess.isOnlineNow ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sess.isOnlineNow ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{sess.isOnlineNow ? 'Online Now' : 'Idle'}</span>
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Expires in {remainingMins}m
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 font-medium">
                  {isLoading ? (
                    <TradeHeavenDataLoader />
                  ) : sessions.length > 0 ? (
                    'No logged-in sessions match your search or role filter.'
                  ) : (
                    'No active logged-in sessions detected. Sessions automatically expire after 30 minutes of inactivity.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Login & Logout Notifications Stream */}
      <div className="pt-1 space-y-2.5" data-testid="admin-auth-events-feed">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Recent Login &amp; Logout Notifications</span>
          </h4>
          <span className="text-[11px] text-slate-500 tabular-nums">
            {recentAuthEvents.length} recent events
          </span>
        </div>

        {recentAuthEvents.length === 0 ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
            No login or logout notifications recorded in this server session yet. Events appear immediately when any buyer, supplier, or admin signs in, signs out, or expires after 30 minutes of inactivity.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {recentAuthEvents.slice(0, 20).map((evt) => {
              const isLogin = evt.eventType === 'LOGIN';
              return (
                <div
                  key={evt.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50"
                >
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0 ${
                        isLogin
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isLogin ? 'Logged In' : 'Logged Out'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {evt.name} <span className="font-normal text-slate-500">({evt.role})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        <span className="font-mono">{evt.email}</span>
                        {evt.companyName ? ` • ${evt.companyName}` : ''}
                        {evt.currentView ? ` • Page: ${evt.currentView}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 shrink-0 tabular-nums">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
