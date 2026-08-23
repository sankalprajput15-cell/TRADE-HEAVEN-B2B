import React from 'react';
import { Currency, UserRole, ActiveView, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { 
  X, 
  Settings, 
  Globe2, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  PlusCircle, 
  Calculator, 
  Database,
  Crown,
  Lock,
  ChevronRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: Currency;
  setSelectedCurrency?: (c: Currency) => void;
  onCurrencyChange?: (c: Currency) => void;
  currentUser: AuthUser | null;
  currentUserRole?: UserRole;
  setCurrentUserRole?: (role: UserRole) => void;
  activeView?: ActiveView;
  setActiveView?: (v: ActiveView) => void;
  onNavigate?: (v: ActiveView) => void;
  onOpenAuthModal: () => void;
  onOpenCreateRfq: () => void;
  onOpenDbModal?: () => void;
  onOpenBackendManager?: () => void;
}

export const QuickControlsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCurrency,
  setSelectedCurrency,
  onCurrencyChange,
  currentUser,
  currentUserRole,
  setCurrentUserRole,
  activeView,
  setActiveView,
  onNavigate,
  onOpenAuthModal,
  onOpenCreateRfq,
  onOpenDbModal,
  onOpenBackendManager
}) => {
  // Close on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCurrencyChange = (curr: Currency) => {
    if (onCurrencyChange) onCurrencyChange(curr);
    else if (setSelectedCurrency) setSelectedCurrency(curr);
  };

  const handleNavigate = (view: ActiveView) => {
    if (onNavigate) onNavigate(view);
    else if (setActiveView) setActiveView(view);
  };

  const handleOpenBackend = () => {
    if (onOpenDbModal) onOpenDbModal();
    else if (onOpenBackendManager) onOpenBackendManager();
  };

  return (
    <div 
      id="quick-controls-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        id="quick-controls-container"
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 my-auto text-slate-900 relative"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Workspace &amp; Quick Controls</h3>
              <p className="text-xs text-slate-500">Global currency, preferences &amp; platform shortcuts</p>
            </div>
          </div>
          <button
            id="quick-controls-close-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close / Cancel"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            Settlement Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CURRENCY_RATES.map(rate => (
              <button
                key={rate.code}
                onClick={() => handleCurrencyChange(rate.code)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedCurrency === rate.code
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {rate.code} ({rate.symbol})
              </button>
            ))}
          </div>
        </div>

        {/* Account / Auth State */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser ? currentUser.name : 'Guest Visitor'}
              </p>
              <p className="text-xs text-slate-500 font-medium truncate">
                {currentUser ? `${currentUser.role} • ${currentUser.companyName || 'Trade Heaven Member'}` : 'Browse read-only mode'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            {currentUser ? 'Switch Account' : 'Sign In / Register'}
          </button>
        </div>

        {/* Quick Launch Actions */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Actions
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onClose();
                onOpenCreateRfq();
              }}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold flex items-center gap-2 text-left transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Post New RFQ</span>
            </button>

            <button
              onClick={() => {
                onClose();
                handleNavigate('INCOTERMS_CALCULATOR');
              }}
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold flex items-center gap-2 text-left transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Incoterms Calculator</span>
            </button>

            <button
              onClick={() => {
                onClose();
                handleNavigate('PREMIUM_MEMBERSHIP');
              }}
              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold flex items-center gap-2 text-left transition-colors cursor-pointer"
            >
              <Crown className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Upgrade Membership</span>
            </button>

            {Boolean(currentUserRole === 'ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.email?.toLowerCase() === 'admin@tradeheaven.net') && (
              <button
                onClick={() => {
                  onClose();
                  handleOpenBackend();
                }}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2 text-left transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Database Sandbox</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Cancel / Close Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
