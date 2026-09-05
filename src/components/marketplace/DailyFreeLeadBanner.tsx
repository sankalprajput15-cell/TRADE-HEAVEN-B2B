import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  Check,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { getFreeLeadStatus, FreeLeadState, claimDailyFreeLead } from '../../services/freeLeadService';
import { RfqRequirement, AuthUser } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onUpgradeToPlans?: () => void;
  onSelectClaimedRfq?: (rfqId: string) => void;
  featuredRfq?: RfqRequirement | null;
  onClaimLead?: (rfq: RfqRequirement) => void;
  currentUser?: AuthUser | null;
  onOpenRegisterFree?: () => void;
  className?: string;
}

export const DailyFreeLeadBanner: React.FC<Props> = ({
  onUpgradeToPlans,
  onSelectClaimedRfq,
  featuredRfq,
  onClaimLead,
  currentUser: propUser,
  onOpenRegisterFree: propOnRegister,
  className = ''
}) => {
  const auth = useAuth();
  const currentUser = propUser !== undefined ? propUser : auth.currentUser;
  const isAuthenticated = Boolean(currentUser);

  const [status, setStatus] = useState<FreeLeadState>(getFreeLeadStatus());

  useEffect(() => {
    const update = () => {
      setStatus(getFreeLeadStatus());
    };

    update();
    const interval = setInterval(update, 30000); // Check every 30s
    window.addEventListener('tradeheaven_free_lead_updated', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tradeheaven_free_lead_updated', update);
    };
  }, []);

  const handleOpenRegister = () => {
    if (propOnRegister) {
      propOnRegister();
    } else {
      window.dispatchEvent(new CustomEvent('tradeheaven_open_register'));
    }
  };

  const handleQuickClaimFeatured = () => {
    if (!isAuthenticated) {
      handleOpenRegister();
      return;
    }

    if (featuredRfq && status.canClaim) {
      const nextState = claimDailyFreeLead(featuredRfq.id);
      setStatus(nextState);
      if (onClaimLead) {
        onClaimLead(featuredRfq);
      }
    }
  };

  return (
    <div 
      id="daily-free-lead-banner"
      className={`relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 p-6 sm:p-7 shadow-md transition-all ${className}`}
    >
      {/* Decorative B2B Trade Bulletin Stamp */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 border border-amber-300 text-amber-950 text-[11px] font-mono font-bold tracking-tight">
        {!isAuthenticated ? (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>Free Member Registration Required</span>
          </>
        ) : status.canClaim ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
            <span>1 Daily Free Buy Order Credit Available</span>
          </>
        ) : (
          <>
            <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>Resets in: {status.timeRemainingFormatted || 'Tomorrow'}</span>
          </>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Main Title & Lead Pitch Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wide uppercase shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Trade Heaven Exclusive</span>
            </span>

            {!isAuthenticated ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold border border-blue-200">
                <UserCheck className="w-3 h-3 text-blue-700" />
                <span>Free Member Portal Access Only</span>
              </span>
            ) : status.canClaim ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>1/1 Free Credit Ready</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Credit Used Today ({status.claimedRfqId})</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            ⚡ Claim Your 1 Free Buy Order Today!
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed max-w-3xl">
            Register as a free member on the portal to unlock 1 open buy order inquiry every 24 hours—100% free. Pitch directly to prospective buyers and start exporting!
          </p>
        </div>

        {/* Free Leads Disclaimer / Community Note */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300/80 text-amber-950 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            (Note: Free buy orders are accessible only after registering as a free member on the portal. Inquiries are unvetted community requests—deals &amp; buyer legitimacy are not guaranteed).
          </p>
        </div>

        {/* Interactive Claiming / Active Status Widget */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Daily Free Sourcing Quota • Free Member Privilege
            </span>
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Free registration required: Create your free member account in 30 seconds to unlock today's free buy order.</span>
                </div>
              ) : status.canClaim ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Your 24-Hour Free Buy Order Pass is Active! Click any tender card below to claim &amp; unlock contact info.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Claimed today for Order <strong>#{status.claimedRfqId}</strong>. Next free buy order unlocks in{' '}
                    <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-950">{status.timeRemainingFormatted}</span>.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {!isAuthenticated ? (
              <button
                type="button"
                id="banner-register-free-claim-btn"
                onClick={handleOpenRegister}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 animate-scale-pulse"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>Register Free to Claim Buy Order</span>
              </button>
            ) : status.canClaim && featuredRfq ? (
              <button
                type="button"
                onClick={handleQuickClaimFeatured}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Claim Top Buy Order: #{featuredRfq.id}</span>
              </button>
            ) : null}

            {isAuthenticated && !status.canClaim && status.claimedRfqId && onSelectClaimedRfq ? (
              <button
                type="button"
                onClick={() => onSelectClaimedRfq(status.claimedRfqId!)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>View My Claimed Buy Order (#{status.claimedRfqId})</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Serious Buyers Pitch & Direct Upgrade Action */}
        <div className="pt-2 border-t border-amber-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-2.5 text-xs text-slate-800">
            <span className="text-base shrink-0">🛡️</span>
            <p className="font-bold leading-snug text-slate-900">
              Want Serious, Ready-to-Buy Importers?{' '}
              <span className="font-normal text-slate-700">
                Skip the risk and unlock pre-vetted global buyers, guaranteed RFQs, and secure trade protection.
              </span>
            </p>
          </div>

          {onUpgradeToPlans && (
            <button
              type="button"
              id="upgrade-to-basic-establishment-btn"
              onClick={onUpgradeToPlans}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
            >
              <span>👉 Upgrade to Basic or Establishment Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
