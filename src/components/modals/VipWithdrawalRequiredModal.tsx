import React from 'react';
import {
  X,
  Crown,
  Lock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Building2,
  Wallet
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

export interface VipWithdrawalRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  companyName?: string;
  balanceFormatted?: string;
  onUpgrade?: () => void;
  onUpgradeToVip?: () => void;
}

export function triggerVipWithdrawalModal(detail?: {
  userName?: string;
  companyName?: string;
  balanceFormatted?: string;
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tradeheaven_open_vip_withdrawal_modal', { detail })
    );
  }
}

export const VipWithdrawalRequiredModal: React.FC<VipWithdrawalRequiredModalProps> = ({
  isOpen,
  onClose,
  userName = 'Melissa Prezios',
  companyName = 'MP Commodity Brokers Australia Pty Ltd',
  balanceFormatted = '$50,000.00 USD',
  onUpgrade,
  onUpgradeToVip
}) => {
  const handleUpgradeAction = onUpgradeToVip || onUpgrade;
  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    if (handleUpgradeAction) {
      handleUpgradeAction();
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
      aria-labelledby="vip-withdrawal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-100 fill-amber-100" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-100 font-bold block">
                Trade Heaven Treasury Compliance
              </span>
              <h3 className="text-sm sm:text-base font-black leading-tight">
                VIP Plan Membership Required
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Main User Prompt Requirement Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 sm:p-4 text-center space-y-1 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black tracking-wide uppercase shadow-2xs">
              <Lock className="w-3 h-3" /> Withdrawal Access Policy
            </div>
            <div
              id="vip-withdrawal-modal-title"
              className="text-base sm:text-lg font-black text-amber-950 pt-1"
            >
              VIP plan member are eligible to do it
            </div>
            <p className="text-xs sm:text-[13px] text-amber-900/90 font-medium">
              Direct fund withdrawals to bank accounts are strictly reserved for verified VIP Plan members.
            </p>
          </div>

          {/* Account Balance Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Account Holder
              </span>
              <span className="font-bold text-slate-900 text-right truncate max-w-[220px]">
                {userName} &bull; {companyName}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/70">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Treasury Available Balance
              </span>
              <span className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                {balanceFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/70">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Current Plan Tier
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">
                Basic Plan (Withdrawal Locked)
              </span>
            </div>
          </div>

          {/* Plan Comparison Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Membership Eligibility Matrix
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Basic Plan */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-1.5">
                <div className="font-bold text-rose-900 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Basic Plan (Current)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-rose-800/90 pl-1">
                  <li>&bull; Fund Bank Withdrawals: <strong>Blocked</strong></li>
                  <li>&bull; Direct Payouts: <strong>Not Eligible</strong></li>
                  <li>&bull; Safe Escrow Holding: Active</li>
                </ul>
              </div>

              {/* VIP Plan */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>VIP Plan (Eligible)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-emerald-800/90 pl-1">
                  <li>&bull; Fund Bank Withdrawals: <strong>100% Eligible</strong></li>
                  <li>&bull; SWIFT / ACH / Wire: <strong>Enabled</strong></li>
                  <li>&bull; Direct Treasury Payouts: <strong>Instant</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Treasury Protection Statement */}
          <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed border border-slate-200">
            <strong>Trade Heaven Treasury Rule:</strong> To safeguard international escrow balances and comply with SBLC and trade assurance provisions, payouts are authorized solely for active VIP Plan members. Once upgraded to VIP, the full <strong>{balanceFormatted}</strong> will be instantly withdrawable to your verified corporate bank account.
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4 fill-white" />
            <span>Upgrade to VIP Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>VIP Desk</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipWithdrawalRequiredModal;
