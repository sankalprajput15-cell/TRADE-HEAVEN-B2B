import React, { useState } from 'react';
import { Lock, Crown, ShieldCheck, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { AuthUser } from '../../types';
import { SecureContactVerificationModal } from './SecureContactVerificationModal';

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
  const [isVerifiedLocally, setIsVerifiedLocally] = useState<boolean>(false);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

  const isPremiumOrAdmin = 
    currentUser?.role === 'ADMIN' || 
    (currentUser?.isPremium === true && currentUser?.membershipStatus === 'paid');

  const handleOpenPrompt = () => {
    setShowVerificationModal(true);
  };

  const handleVerifiedSuccess = () => {
    setIsVerifiedLocally(true);
  };

  if ((isPremiumOrAdmin && !isMasked) || isVerifiedLocally) {
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
    <div className={`rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-slate-50 p-4 space-y-3 shadow-xs relative overflow-hidden ${className}`}>
      {/* Decorative corporate secure background element */}
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-blue-100/40 rounded-full blur-xl pointer-events-none" />

      {/* Header with lock status */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
          <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Lock className="w-3 h-3" />
          </div>
          <span className="truncate">{resourceTitle || 'Direct Contact Details'}</span>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
          Protected
        </span>
      </div>

      {/* Security Protection Notice & Free Verification Action */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col items-center text-center space-y-2.5 relative z-10 shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800">Protected Business Contact</h4>
          <p className="text-[10px] text-slate-500 max-w-[210px] leading-relaxed mx-auto">
            Contact information is secured to prevent automated spam. Verify your business to unlock immediately.
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleOpenPrompt}
          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span>Verify &amp; View Contact (Free)</span>
        </button>

        <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-semibold pt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>100% Free • No Payment Required</span>
        </div>
      </div>

      {/* Interactive Verification Modal Prompt */}
      <SecureContactVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        currentUser={currentUser}
        resourceTitle={resourceTitle}
        onVerified={handleVerifiedSuccess}
      />
    </div>
  );
};

