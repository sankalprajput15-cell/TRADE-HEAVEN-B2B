import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Server, 
  Sparkles,
  Layers,
  FileCode,
  AlertTriangle,
  Lock,
  LogIn
} from 'lucide-react';
import { api } from '../../services/apiService';
import { AuthUser } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export const BackendDataManagementModal: React.FC<Props> = ({ 
  isOpen, 
  onClose,
  currentUser,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'RESTORE' | 'HEALTH'>('EXPORT');
  const [jsonText, setJsonText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'ADMIN' || 
      (currentUser.email && currentUser.email.toLowerCase() === 'admin@tradeheaven.net')
    )
  );

  if (!isAdmin) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto shadow-2xl text-slate-900 relative p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-150">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Restricted Console
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Admin Access Only
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              The Database Sandbox &amp; State Persistence Console is restricted exclusively to System Administrators.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">Required Credentials:</div>
            <div>Role: <span className="font-mono text-slate-900 font-semibold">ADMIN</span> or root admin account</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    try {
      const dump = {
        exportedAt: new Date().toISOString(),
        siteContent: localStorage.getItem('th_site_content'),
        products: localStorage.getItem('th_products'),
        rfqs: localStorage.getItem('th_rfqs'),
        companies: localStorage.getItem('th_companies'),
        orders: localStorage.getItem('th_orders'),
        inquiries: localStorage.getItem('th_inquiries')
      };
      const formatted = JSON.stringify(dump, null, 2);
      setJsonText(formatted);

      // Download file
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-heaven-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: 'Database dump generated & downloaded successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Export failed: ${err.message}` });
    }
  };

  const handleRestoreData = () => {
    try {
      if (!jsonText.trim()) {
        setStatusMsg({ type: 'error', text: 'Please paste valid JSON database backup content.' });
        return;
      }

      // Safeguard: Limit restore payload size to prevent browser localStorage quota crash (max 4MB string)
      if (jsonText.length > 4 * 1024 * 1024) {
        setStatusMsg({ 
          type: 'error', 
          text: `JSON payload is too large (${(jsonText.length / (1024 * 1024)).toFixed(1)} MB). Limit is 4 MB to prevent browser memory freezing.` 
        });
        return;
      }

      const parsed = JSON.parse(jsonText);
      if (parsed.siteContent) localStorage.setItem('th_site_content', parsed.siteContent);
      if (parsed.products) localStorage.setItem('th_products', parsed.products);
      if (parsed.rfqs) localStorage.setItem('th_rfqs', parsed.rfqs);
      if (parsed.companies) localStorage.setItem('th_companies', parsed.companies);
      if (parsed.orders) localStorage.setItem('th_orders', parsed.orders);
      if (parsed.inquiries) localStorage.setItem('th_inquiries', parsed.inquiries);

      setStatusMsg({ type: 'success', text: 'Database state restored! Refreshing platform...' });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Invalid JSON format: ${err.message}` });
    }
  };

  const handleResetFactoryDefaults = () => {
    if (window.confirm('Are you sure you want to reset all mock databases to clean factory defaults?')) {
      localStorage.removeItem('th_site_content');
      localStorage.removeItem('th_products');
      localStorage.removeItem('th_rfqs');
      localStorage.removeItem('th_companies');
      localStorage.removeItem('th_orders');
      localStorage.removeItem('th_inquiries');
      setStatusMsg({ type: 'success', text: 'Reset completed! Reloading clean state...' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/90 hover:text-white transition-colors cursor-pointer shadow-sm"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 pr-14">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-amber-400" /> Database &amp; State Persistence Console
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
            Live Database Backup &amp; JSON Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md font-normal">
            Export, import, inspect schemas, and administer realtime persisted storage entities.
          </p>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`p-3.5 border-b text-xs font-bold flex items-center gap-2 shrink-0 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 pt-3 gap-4 text-xs font-bold bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`pb-2.5 cursor-pointer ${activeTab === 'EXPORT' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Export Backup
          </button>
          <button
            onClick={() => setActiveTab('RESTORE')}
            className={`pb-2.5 cursor-pointer ${activeTab === 'RESTORE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Restore JSON Dump
          </button>
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`pb-2.5 cursor-pointer ${activeTab === 'HEALTH' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            System Diagnostics
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 md:p-7 space-y-4 text-xs flex-1 overflow-y-auto">
          {activeTab === 'EXPORT' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Generate an all-in-one JSON snapshot containing all CMS content overrides, registered products, active RFQ tenders, escrow transactions, and support tickets.
              </p>

              <button
                onClick={handleExportData}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Generate &amp; Download Full Database Backup (.JSON)</span>
              </button>

              {jsonText && (
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Snapshot Preview:</span>
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto">
                    {jsonText.slice(0, 1000)}...
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'RESTORE' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Paste a previous Trade Heaven database JSON export to restore your catalog, customized header/footer CMS text, and active negotiations.
              </p>

              <textarea
                rows={6}
                placeholder="Paste backup JSON string here..."
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleRestoreData}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore From JSON</span>
                </button>

                <button
                  onClick={handleResetFactoryDefaults}
                  className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'HEALTH' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold">API Microservices:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 100% Operational
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold">Swiss Escrow Rail:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected (FINMA PSD2)
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
                <div className="font-bold">Persistent Storage Engine:</div>
                <div className="text-[11px] text-blue-800 mt-0.5">
                  Synchronized with browser LocalStorage state layer and mock REST endpoints in <code>src/services/apiService.ts</code>.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
