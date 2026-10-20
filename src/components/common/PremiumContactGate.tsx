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
  paidMembersOnly?: boolean;
}

export const PremiumContactGate: React.FC<Props> = ({
  currentUser,
  onOpenUpgradeModal,
  children,
  isMasked = true,
  resourceTitle = 'Direct Factory Contact Details & Verified Liaison',
  className = '',
  compact = false,
  paidMembersOnly = false,
}) => {
  const [isVerifiedLocally, setIsVerifiedLocally] = useState<boolean>(false);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

  const isPaidMemberOrAdmin = 
    currentUser?.role === 'ADMIN' || 
    currentUser?.isVerifiedAdmin === true ||
    currentUser?.isPremium === true || 
    currentUser?.membershipStatus === 'paid' ||
    currentUser?.membershipStatus === 'basic' ||
    String(currentUser?.tier || '').toLowerCase().includes('basic') ||
    String(currentUser?.tier || '').toLowerCase().includes('vip') ||
    String(currentUser?.tier || '').toLowerCase().includes('gold');

  const handleOpenPrompt = () => {
    if (paidMembersOnly) {
      onOpenUpgradeModal();
    } else {
      setShowVerificationModal(true);
    }
  };

  const handleVerifiedSuccess = () => {
    setIsVerifiedLocally(true);
  };

  if (isPaidMemberOrAdmin || (!paidMembersOnly && (!isMasked || isVerifiedLocally))) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Paid Member Clearance: Direct Contact Unlocked</span>
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
    <div className={`rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/60 to-slate-50 p-4 space-y-3 shadow-xs relative overflow-hidden ${className}`}>
      {/* Decorative corporate secure background element */}
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-amber-100/40 rounded-full blur-xl pointer-events-none" />

      {/* Header with lock status */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
          <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Lock className="w-3 h-3" />
          </div>
          <span className="truncate">{resourceTitle || 'Direct Contact Details'}</span>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
          {paidMembersOnly ? 'Paid Members Only' : 'Protected'}
        </span>
      </div>

      {/* Security Protection Notice */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col items-center text-center space-y-2.5 relative z-10 shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-600">
          <Crown className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800">
            {paidMembersOnly ? 'Paid Members Only Access' : 'Protected Business Contact'}
          </h4>
          <p className="text-[10px] text-slate-500 max-w-[220px] leading-relaxed mx-auto">
            {paidMembersOnly
              ? 'Full supplier street address, direct email, phone, and bank transfer details are strictly reserved for Paid Members.'
              : 'Contact information is secured to prevent automated spam. Verify your business to unlock immediately.'}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleOpenPrompt}
          className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer"
        >
          {paidMembersOnly ? (
            <>
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span>Upgrade to Paid Plan to Unlock</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Verify &amp; View Contact</span>
            </>
          )}
        </button>
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

