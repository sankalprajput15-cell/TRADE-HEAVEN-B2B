import React, { useState, useEffect, useMemo } from 'react';
import {
  Trash2,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  UserCheck,
  Clock,
  Building2,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  UserX,
  Filter
} from 'lucide-react';
import { UserDeletionLogEntry, AuthUser, UserRole } from '../../types';
import { api, getUserDeletionLogs, unmarkUserPermanentlyDeleted } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface UserDeletionLogModuleProps {
  currentUser?: AuthUser | null;
  compact?: boolean;
  onUserRestored?: (restoredUser: AuthUser) => void;
}

export const UserDeletionLogModule: React.FC<UserDeletionLogModuleProps> = ({
  currentUser: propUser,
  compact = false,
  onUserRestored
}) => {
  const { user: authUser } = useAuth();
  const effectiveAdmin: AuthUser = propUser || authUser || {
    id: 'user-admin-001',
    name: 'Administrator (Yash Rajput)',
    email: 'yr943334@gmail.com',
    companyName: 'Trade Heaven Global Operations & Treasury',
    country: 'United Kingdom',
    role: 'ADMIN',
    status: 'ACTIVE',
    isVerified: true,
    isVerifiedAdmin: true,
    isPremium: true,
    membershipStatus: 'paid'
  };

  const [logs, setLogs] = useState<UserDeletionLogEntry[]>(() => getUserDeletionLogs());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPPLIER' | 'BUYER' | 'ADMIN' | 'VERIFIER'>('ALL');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserDeletionLogs();
      setLogs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const handleLogsUpdated = () => {
      setLogs(getUserDeletionLogs());
    };
    window.addEventListener('tradeheaven_user_deletion_logs_updated', handleLogsUpdated);
    window.addEventListener('tradeheaven_users_updated', handleLogsUpdated);
    return () => {
      window.removeEventListener('tradeheaven_user_deletion_logs_updated', handleLogsUpdated);
      window.removeEventListener('tradeheaven_users_updated', handleLogsUpdated);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(entry => {
      const entryRole = String(entry.deletedUserRole || '').toUpperCase();
      if (roleFilter !== 'ALL' && entryRole !== roleFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (entry.deletedUserName || '').toLowerCase().includes(q) ||
        (entry.deletedUserEmail || '').toLowerCase().includes(q) ||
        (entry.deletedUserId || '').toLowerCase().includes(q) ||
        (entry.deletedUserCompany || '').toLowerCase().includes(q) ||
        (entry.deletedByAdminName || '').toLowerCase().includes(q) ||
        (entry.deletedByAdminEmail || '').toLowerCase().includes(q) ||
        (entry.reason || '').toLowerCase().includes(q) ||
        (entry.complianceRef || '').toLowerCase().includes(q)
      );
    });
  }, [logs, roleFilter, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Compliance Ref',
      'Deleted At (ISO)',
      'Deleted User Name',
      'Deleted User Email',
      'Deleted User ID',
      'Deleted User Role',
      'Company Name',
      'Membership Tier',
      'Country',
      'Deleted By Admin Name',
      'Deleted By Admin Email',
      'Deleted By Admin Role',
      'Deletion Source',
      'Reason'
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredLogs.map(l => [
      l.complianceRef || l.id,
      l.deletedAt,
      l.deletedUserName,
      l.deletedUserEmail,
      l.deletedUserId,
      l.deletedUserRole,
      l.deletedUserCompany || '',
      l.deletedUserTier || '',
      l.deletedUserCountry || '',
      l.deletedByAdminName,
      l.deletedByAdminEmail,
      l.deletedByAdminRole,
      l.deletionSource || 'Admin Console',
      l.reason || 'Permanent administrative account removal'
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map(r => r.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tradeheaven-user-deletion-compliance-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreUser = async (entry: UserDeletionLogEntry) => {
    setRestoringId(entry.id);
    try {
      unmarkUserPermanentlyDeleted(entry.deletedUserId, entry.deletedUserEmail);
      const restoredRole = (['BUYER', 'SUPPLIER', 'ADMIN', 'VERIFIER'].includes(String(entry.deletedUserRole).toUpperCase())
        ? String(entry.deletedUserRole).toUpperCase()
        : 'SUPPLIER') as UserRole;

      const res = await api.adminCreateUser(
        {
          name: entry.deletedUserName,
          email: entry.deletedUserEmail,
          role: restoredRole,
          companyName: entry.deletedUserCompany || 'Enterprise Trading Firm',
          country: entry.deletedUserCountry || 'Global',
          status: 'ACTIVE',
          isVerified: true,
          isPremium: String(entry.deletedUserTier || '').toLowerCase().includes('vip'),
          membershipStatus: 'paid'
        },
        effectiveAdmin
      );

      if (res.success && res.data) {
        setBannerMessage({
          type: 'success',
          text: `✓ Re-instated user "${entry.deletedUserName}" (${entry.deletedUserEmail}) to active database. Historical deletion log entry preserved for compliance.`
        });
        setTimeout(() => setBannerMessage(null), 5000);
        if (onUserRestored) {
          onUserRestored(res.data);
        }
      }
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: `Failed to restore user: ${err?.message || 'Unknown error'}`
      });
    } finally {
      setRestoringId(null);
    }
  };

  const supplierDeletedCount = logs.filter(l => String(l.deletedUserRole || '').toUpperCase() === 'SUPPLIER').length;
  const buyerDeletedCount = logs.filter(l => String(l.deletedUserRole || '').toUpperCase() === 'BUYER').length;
  const latestDeletion = logs[0] || null;

  return (
    <div id="user-deletion-log-module" className="space-y-4">
      {!compact && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-rose-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Compliance &amp; Data Traceability Ledger</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Immutable Audit Trail Active</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <UserX className="w-6 h-6 text-rose-400 shrink-0" />
              <span>User Deletion Log &amp; Compliance Registry</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Tracks every permanent user account removal across the platform—recording <strong>who was deleted</strong>, <strong>when</strong>, <strong>by which administrator</strong>, and the compliance reason.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredLogs.length === 0}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white border border-white/15 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export Compliance CSV</span>
            </button>
            <button
              type="button"
              onClick={loadLogs}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Deleted Users
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
              {logs.length}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
              Permanently purged from DB
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Role Breakdown
            </div>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {supplierDeletedCount} Suppliers • {buyerDeletedCount} Buyers
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Categorized by account role
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Latest Deletion Event
            </div>
            <div className="text-xs font-black text-slate-900 mt-1 truncate">
              {latestDeletion ? latestDeletion.deletedUserName : 'No deletions recorded'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
              {latestDeletion ? new Date(latestDeletion.deletedAt).toLocaleString() : '—'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Last Actioning Admin
            </div>
            <div className="text-xs font-black text-slate-900 mt-1 truncate">
              {latestDeletion ? latestDeletion.deletedByAdminName : effectiveAdmin.name}
            </div>
            <div className="text-[11px] text-emerald-700 font-mono truncate mt-0.5">
              {latestDeletion ? latestDeletion.deletedByAdminEmail : effectiveAdmin.email}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {bannerMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-[10px] uppercase font-black hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Log Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Permanent User Deletion Audit Trail</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Full compliance log of deleted users, timestamps, actioning administrators, and deletion reasons.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search deleted user, email, or admin..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['ALL', 'SUPPLIER', 'BUYER', 'ADMIN'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-all ${
                    roleFilter === role
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {compact && (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredLogs.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-sm font-black text-slate-800">
              {searchQuery || roleFilter !== 'ALL'
                ? 'No user deletion logs match your current filter'
                : 'No Users Have Been Permanently Deleted Yet'}
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Whenever an administrator permanently deletes a user or supplier account from <strong>User Registrations</strong> or <strong>Registered Suppliers</strong>, the complete compliance record (who was deleted, when, and by which administrator) is automatically logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="p-3">Who Was Deleted (User &amp; Company)</th>
                  <th className="p-3">Role &amp; Tier</th>
                  <th className="p-3">When Deleted (Timestamp)</th>
                  <th className="p-3">Deleted By Administrator</th>
                  <th className="p-3">Reason &amp; Compliance Ref</th>
                  <th className="p-3 text-right">Traceability Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map(entry => (
                  <tr key={entry.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="p-3">
                      <div className="font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{entry.deletedUserName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black uppercase">
                          DELETED
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-700 font-mono font-bold flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{entry.deletedUserEmail}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span>{entry.deletedUserCompany || 'Enterprise Account'}</span>
                        {entry.deletedUserCountry && (
                          <span className="text-slate-400">• {entry.deletedUserCountry}</span>
                        )}
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                          UID: {entry.deletedUserId}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                            String(entry.deletedUserRole).toUpperCase() === 'SUPPLIER'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : String(entry.deletedUserRole).toUpperCase() === 'ADMIN'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`}
                        >
                          {entry.deletedUserRole || 'USER'}
                        </span>
                        {entry.deletedUserTier && (
                          <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px]" title={entry.deletedUserTier}>
                            {entry.deletedUserTier}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>{new Date(entry.deletedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600">
                        {new Date(entry.deletedAt).toLocaleTimeString()}
                      </div>
                      <div className="font-mono text-[9px] text-slate-400">
                        {entry.deletedAt}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{entry.deletedByAdminName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        {entry.deletedByAdminEmail}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 text-[9px] font-black uppercase">
                          {entry.deletedByAdminRole || 'ADMIN'}
                        </span>
                        {entry.deletionSource && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            via {entry.deletionSource}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="text-[11px] text-slate-800 font-semibold leading-snug">
                        {entry.reason || 'Permanent administrative account removal'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Ref: {entry.complianceRef || entry.id}
                      </div>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={restoringId === entry.id}
                        onClick={() => handleRestoreUser(entry)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-600 text-[10px] font-black inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        title="Re-instate this deleted user account back into the active database"
                      >
                        <RotateCcw className={`w-3 h-3 ${restoringId === entry.id ? 'animate-spin' : ''}`} />
                        <span>{restoringId === entry.id ? 'Restoring...' : 'Restore User'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDeletionLogModule;
