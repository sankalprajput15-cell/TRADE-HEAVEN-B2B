import React from 'react';
import { AuthUser, ActiveView } from '../../types';
import { ShieldAlert, Lock, KeyRound, ArrowLeft, UserX, ExternalLink } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onNavigate: (view: ActiveView) => void;
  title?: string;
  description?: string;
  targetViewName?: string;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  currentUser,
  onOpenAuthModal,
  onNavigate,
  title = 'Administrator Control Panel',
  description = 'This administrative hub, trade protection release portal, and system settings are strictly restricted to verified administrators.',
  targetViewName
}) => {
  // 1. Unauthenticated Visitor State (401 Unauthorized)
  if (!currentUser) {
    return (
      <div 
        id="admin-guard-unauthorized-401" 
        className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-900/5 sm:py-16"
      >
        <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-black uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>401 Unauthorized • Admin Access Required</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Zero-Trust Security Policy Active</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Visitors browse Trade Heaven as public guests. To access administrative controls, please authenticate using authorized enterprise admin credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="admin-guard-login-btn"
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Administrator</span>
            </button>

            <button
              id="admin-guard-return-home-btn"
              type="button"
              onClick={() => onNavigate('HOMEPAGE')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Non-Admin Role (403 Forbidden)
  if (currentUser.role !== 'ADMIN' && !currentUser.isVerifiedAdmin) {
    return (
      <div 
        id="admin-guard-forbidden-403" 
        className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-900/5 sm:py-16"
      >
        <div className="max-w-xl w-full bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <UserX className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-black uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>403 Forbidden • Insufficient Privileges</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Access Restricted
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              You are currently signed in as <strong className="text-slate-800">{currentUser.name}</strong> with the <strong className="text-blue-600 font-mono">[{currentUser.role}]</strong> role. This section requires elevated <strong className="text-amber-700 font-mono">[ADMIN]</strong> privileges.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="admin-guard-switch-login-btn"
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Switch to Admin Account</span>
            </button>

            <button
              id="admin-guard-forbidden-home-btn"
              type="button"
              onClick={() => onNavigate('HOMEPAGE')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Session Granted
  return <>{children}</>;
};
