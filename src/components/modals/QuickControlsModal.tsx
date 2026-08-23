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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Quick Controls &amp; Settings</h3>
              <p className="text-xs text-slate-500">Global currency, account roles &amp; shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
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
          <div className="grid grid-cols-4 gap-2">
            {CURRENCY_RATES.map(rate => (
              <button
                key={rate.code}
                onClick={() => handleCurrencyChange(rate.code)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
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
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {currentUser ? currentUser.name : 'Guest Visitor'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {currentUser ? `${currentUser.role} • ${currentUser.companyName}` : 'Browse read-only mode'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            {currentUser ? 'Switch Account' : 'Sign In / Register'}
          </button>
        </div>

        {/* Quick Launch Actions */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Actions
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onClose();
                onOpenCreateRfq();
              }}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold flex items-center gap-2 text-left transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Post New RFQ</span>
            </button>

            <button
              onClick={() => {
                onClose();
                handleNavigate('INCOTERMS_CALCULATOR');
              }}
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold flex items-center gap-2 text-left transition-colors"
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Incoterms Calculator</span>
            </button>

            <button
              onClick={() => {
                onClose();
                handleNavigate('PREMIUM_MEMBERSHIP');
              }}
              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold flex items-center gap-2 text-left transition-colors"
            >
              <Crown className="w-4 h-4 text-purple-600" />
              <span>Upgrade Membership</span>
            </button>

            <button
              onClick={() => {
                onClose();
                handleOpenBackend();
              }}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2 text-left transition-colors"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Sandbox</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
