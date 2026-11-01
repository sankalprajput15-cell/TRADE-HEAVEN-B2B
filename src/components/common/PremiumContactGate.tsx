import React, { useState } from 'react';
import { Lock, Crown, ShieldCheck, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { AuthUser } from '../../types';
import { SecureContactVerificationModal } from './SecureContactVerificationModal';
import { isPaidMemberUser } from '../../services/freeLeadService';

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

  const isPaidMemberOrAdmin = isPaidMemberUser(currentUser);

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
    <div className={`rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs min-w-0">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">{resourceTitle || 'Direct Procurement Desk'}</span>
        </div>
        <span className="text-[11px] text-slate-500 shrink-0">
          Verified Liaison
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {paidMembersOnly
            ? 'Direct buyer desk phone & corporate email available for verified members.'
            : 'Verify your business profile to view direct phone and email.'}
        </p>

        <button
          type="button"
          onClick={handleOpenPrompt}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          <span>{paidMembersOnly ? 'Connect' : 'View Desk'}</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
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

