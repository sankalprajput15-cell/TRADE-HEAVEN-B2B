import React from 'react';
import {
  X,
  Crown,
  Lock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  Wallet,
  MessageCircle
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

export interface UpgradeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
  userName?: string;
  companyName?: string;
  onTriggerUpgrade: () => void;
}

export function triggerUpgradeRequiredModal(detail?: {
  currentTier?: string;
  userName?: string;
  companyName?: string;
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tradeheaven_open_upgrade_required_modal', { detail })
    );
  }
}

export const UpgradeRequiredModal: React.FC<UpgradeRequiredModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'Basic Plan',
  userName = 'Member',
  companyName = 'Trade Heaven Supplier',
  onTriggerUpgrade
}) => {
  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    if (onTriggerUpgrade) {
      onTriggerUpgrade();
    } else {
      window.dispatchEvent(
        new CustomEvent('tradeheaven_open_membership_upgrade_modal')
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-required-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200/80 transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-5 text-white relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/30 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
                <Crown className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-900/40 border border-amber-400/40 text-amber-200">
                  <Lock className="w-3 h-3" />
                  VIP / Enterprise Only Feature
                </div>
                <h3 id="upgrade-required-title" className="text-xl font-black text-white mt-1">
                  Upgrade Required
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-700/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-amber-100/90 mt-2 leading-relaxed">
            VIP plan member are eligible to do it. Bank payouts, SWIFT wire releases, and escrow liquidity withdrawals are exclusively enabled for <strong className="text-white">VIP</strong> and <strong className="text-white">Enterprise</strong> tier members.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* User & Current Tier Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{companyName}</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Member: {userName}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Current Tier
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3 h-3 text-red-500" />
                {currentTier}
              </span>
            </div>
          </div>

          {/* Policy & Eligibility Callout */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Treasury Settlement Policy Notice</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-800">
              By platform treasury regulations, users on standard or basic membership tiers cannot initiate bank payouts. Upgrading to the <strong className="text-amber-950">VIP Plan</strong> or <strong className="text-amber-950">Enterprise Tier</strong> immediately unlocks international wire transfers, domestic RTGS/NEFT rails, and instant IMPS settlement to your registered corporate accounts.
            </p>
          </div>

          {/* Membership Tier Feature Matrix */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Membership Withdrawal Matrix
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-slate-700 font-medium">Standard / Basic Plan</span>
                </div>
                <span className="text-[11px] font-bold text-red-600">Withdrawals Locked</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-950 font-bold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    VIP &amp; Enterprise Plan
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Instant Access Enabled</span>
              </div>
            </div>
          </div>

          {/* Unlocked Benefits Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Included with VIP &amp; Enterprise Membership:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              <li className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Unlimited Bank Wire Releases</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>SWIFT MT103 Bank Receipts</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Priority Treasury Settlement</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>24/7 Dedicated Account Desk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4 text-amber-200" />
            <span>Upgrade to VIP / Enterprise Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>VIP Desk</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeRequiredModal;
