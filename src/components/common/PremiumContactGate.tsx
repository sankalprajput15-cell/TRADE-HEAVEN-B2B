import React from 'react';
import { Lock, Crown, ShieldCheck, ArrowRight, CheckCircle2, Mail, Phone } from 'lucide-react';
import { AuthUser } from '../../types';

interface Props {
  currentUser: AuthUser | null;
  onOpenUpgradeModal: () => void;
  children: React.ReactNode;
  isMasked?: boolean;
  resourceTitle?: string;
  className?: string;
  compact?: boolean;
}

export const PremiumContactGate: React.FC<Props> = ({
  currentUser,
  onOpenUpgradeModal,
  children,
  isMasked = true,
  resourceTitle = 'Direct Factory Contact Details & Verified Liaison',
  className = '',
  compact = false,
}) => {
  const isPremiumOrAdmin = 
    currentUser?.role === 'ADMIN' || 
    (currentUser?.isPremium === true && currentUser?.membershipStatus === 'paid');

  if (isPremiumOrAdmin && !isMasked) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Direct Factory Line Unlocked</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-950 font-black shrink-0">
            Active
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/70 to-amber-100/40 p-3.5 space-y-2.5 shadow-xs ${className}`}>
      {/* Header with lock status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
          <div className="w-5 h-5 rounded-md bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
            <Lock className="w-3 h-3" />
          </div>
          <span className="truncate">{resourceTitle || 'Direct Contact Details'}</span>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 shrink-0">
          Protected
        </span>
      </div>

      {/* Masked Contact Lines Preview */}
      <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/60 space-y-1 text-xs text-slate-600 font-mono">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">exp•••••@••••••.com</span>
          </div>
          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">+86 ••• •••• 9811</span>
          </div>
          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
        </div>
      </div>

      {/* Clear, unclipped CTA Button and Trust Message */}
      <div className="space-y-1.5 pt-0.5">
        <button
          type="button"
          onClick={onOpenUpgradeModal}
          className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 text-slate-950 shrink-0" />
          <span>Unlock Direct Contact Lines</span>
          <ArrowRight className="w-3 h-3 text-slate-950 shrink-0" />
        </button>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium text-center">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Instant unmasking with Corporate Buyer clearance</span>
        </div>
      </div>
    </div>
  );
};

