import React, { useState, useEffect } from 'react';
import { SecurityAuditLog, AuthUser } from '../../types';
import { securityService } from '../../services/securityService';
import { ShieldAlert, Terminal, Trash2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  currentUser?: AuthUser | null;
}

export const AdminActionLogger: React.FC<Props> = ({ currentUser }) => {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'FAILED_USER_CREATE' | 'ERRORS'>('FAILED_USER_CREATE');

  const isAdmin = Boolean(currentUser && (currentUser.role === 'ADMIN' || currentUser.isVerifiedAdmin === true));

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = securityService.subscribeAuditLogs(allLogs => {
      setLogs(allLogs);
    });
    return unsubscribe;
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
        <span>Access Denied: Admin Action Logger requires elevated administrator clearance.</span>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const isUserCreateFail = log.action === 'USER_CREATE_FAILED' || log.targetResource?.includes('user') && log.status !== 'SUCCESS';
    const isAnyError = log.status && log.status !== 'SUCCESS';
    if (filter === 'FAILED_USER_CREATE') return isUserCreateFail;
    if (filter === 'ERRORS') return isAnyError;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-1">
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
            <span>Secure Admin Diagnostics</span>
          </div>
          <h3 className="text-base font-black text-slate-900">
            Action &amp; Failed User Creation Logger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time diagnostics tracking error codes, timestamped messages, and failed user creation attempts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilter('FAILED_USER_CREATE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'FAILED_USER_CREATE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Failed User Creation
            </button>
            <button
              onClick={() => setFilter('ERRORS')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'ERRORS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Errors
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events
            </button>
          </div>

          <button
            onClick={() => {
              securityService.clearAuditLogs();
              setLogs([]);
            }}
            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
            title="Clear Action Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Recorded Failures or Actions</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No failed user creation attempts or matching security logs found in the active session buffer.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                log.status && log.status !== 'SUCCESS'
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                    log.status && log.status !== 'SUCCESS'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {log.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    ID: {log.id}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="font-medium text-slate-800 break-words">
                {log.details || 'No additional details provided.'}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                <div className="text-slate-600 truncate">
                  Actor: <strong className="text-slate-900">{log.actorEmail}</strong> ({log.actorRole})
                </div>
                <div className="text-slate-500 shrink-0">
                  Status: <span className="font-bold uppercase text-rose-700">{log.status || 'ERROR'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
