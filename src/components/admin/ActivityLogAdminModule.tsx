import React, { useState, useEffect } from 'react';
import { SecurityAuditLog } from '../../types';
import { securityService } from '../../services/securityService';
import { RefreshCw, Trash2, Shield, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export const ActivityLogAdminModule: React.FC = () => {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const data = await securityService.fetchBackendAuditLogs();
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all backend activity audit logs? This action is permanent.')) return;
    await securityService.clearBackendAuditLogs();
    fetchLogs();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'FORBIDDEN_403':
      case 'UNAUTHORIZED_401':
      case 'DENIED': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Backend Activity Audit Logs
          </h2>
          <p className="text-xs text-slate-500 font-medium">Real-time monitoring of user actions and security events.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 font-extrabold text-slate-600 uppercase">Timestamp</th>
              <th className="p-3 font-extrabold text-slate-600 uppercase">Actor</th>
              <th className="p-3 font-extrabold text-slate-600 uppercase">Action</th>
              <th className="p-3 font-extrabold text-slate-600 uppercase">Status</th>
              <th className="p-3 font-extrabold text-slate-600 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-3 font-bold text-slate-900">
                  {log.actorEmail}
                  <div className="text-[10px] text-slate-400 font-medium">{log.actorRole}</div>
                </td>
                <td className="p-3 font-semibold text-slate-700">{log.action}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-3 text-slate-600 max-w-sm truncate">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No activity logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
