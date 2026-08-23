import React from 'react';
import { Lock, Award, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthUser } from '../../types';

interface Props {
  currentUser: AuthUser | null;
  onOpenUpgradeModal: () => void;
  children: React.ReactNode;
  isMasked?: boolean;
  resourceTitle?: string;
  className?: string;
}

export const PremiumContactGate: React.FC<Props> = ({
  currentUser,
  onOpenUpgradeModal,
  children,
  isMasked = true,
  resourceTitle = 'Direct Factory Contact Details & Verified Liaison',
  className = ''
}) => {
  const isPremiumOrAdmin = 
    currentUser?.role === 'ADMIN' || 
    (currentUser?.isPremium === true && currentUser?.membershipStatus === 'paid');

  if (isPremiumOrAdmin && !isMasked) {
    return (
      <div className={`relative ${className}`}>
        <div className="mb-2 flex items-center justify-between px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Premium Member Access — Direct Unmasked Contacts</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-950 font-black">
            Unlocked
          </span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 ${className}`}>
      {/* Blurred / Masked Content Behind */}
      <div className="filter blur-[3.5px] select-none pointer-events-none opacity-50 space-y-2">
        {children}
      </div>

      {/* Overlay Banner */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-slate-900/80 text-white backdrop-blur-[2px] text-center space-y-2.5 transition-all">
        <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
          <Lock className="w-4 h-4" />
        </div>

        <div className="space-y-1 max-w-xs">
          <div className="text-xs font-black text-white flex items-center justify-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Premium Sourcing Clearance Required</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Direct export emails, verified phone numbers, and WhatsApp factory liaisons are gated to paid corporate members.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpgradeModal}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
          <span>Upgrade to Premium to Unlock</span>
          <ArrowRight className="w-3 h-3 text-slate-950" />
        </button>

        <div className="text-[9px] text-slate-400 font-mono">
          Anti-Scraping 0-Trust Policy Enforced
        </div>
      </div>
    </div>
  );
};
