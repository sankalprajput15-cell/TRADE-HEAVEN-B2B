import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, Currency } from '../../types';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import {
  SupplierBankWithdrawalPanel,
  getSavedSupplierBanks,
  SavedSupplierBankAccount
} from './SupplierBankWithdrawalPanel';
import { formatBalanceInNativeCurrency, getEntityCurrency } from '../../utils/entityCurrency';
import {
  Landmark,
  Wallet,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
  RefreshCw,
  ArrowUpRight,
  Send,
  Globe,
  Clock,
  FileText,
  Building2,
  CreditCard,
  BookOpen
} from 'lucide-react';

interface SupplierBankWithdrawalLandingPageProps {
  currentUser: AuthUser | null;
  selectedCurrency?: Currency;
  onNavigate: (view: any) => void;
}

export const SupplierBankWithdrawalLandingPage: React.FC<SupplierBankWithdrawalLandingPageProps> = ({
  currentUser,
  onNavigate
}) => {
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedBanks, setSavedBanks] = useState<SavedSupplierBankAccount[]>(() => getSavedSupplierBanks());

  const loadState = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await tradeHeavenMediationService.getState();
      setState(data);
      setSavedBanks(getSavedSupplierBanks());
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadState(true);
    const handleMediationUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<MediationSystemState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      } else {
        loadState(true);
      }
      setSavedBanks(getSavedSupplierBanks());
    };
    window.addEventListener('tradeheaven_mediation_updated', handleMediationUpdated);
    return () => {
      window.removeEventListener('tradeheaven_mediation_updated', handleMediationUpdated);
    };
  }, []);

  const activeWallet: WalletRecord = useMemo(() => {
    const wallets = state?.wallets || [];
    if (currentUser) {
      const uid = (currentUser.id || '').toLowerCase();
      const email = (currentUser.email || '').toLowerCase();
      const comp = (currentUser.companyName || '').toLowerCase();
      const name = (currentUser.name || '').toLowerCase();

      const matched = wallets.find(w => {
        const eid = w.entity_id.toLowerCase();
        const wcomp = w.company_name.toLowerCase();
        const wname = w.entity_name.toLowerCase();
        if (uid && (eid === uid || eid.includes(uid))) return true;
        if (comp && (wcomp === comp || wcomp.includes(comp) || comp.includes(wcomp))) return true;
        if (name && (wname === name || wname.includes(name))) return true;
        if (email.includes('zac@otec.ltd') && eid.includes('zac')) return true;
        if (email.includes('melissa') && eid.includes('melissa')) return true;
        return false;
      });
      if (matched) return matched;
    }

    const firstSupplier = wallets.find(w => w.wallet_type === 'SUPPLIER');
    if (firstSupplier) return firstSupplier;

    return {
      id: `wal-personal-${currentUser?.id || 'supplier'}`,
      entity_id: currentUser?.id || 'comp-melissa-mpcommodity',
      entity_name: currentUser?.name || 'Verified Supplier Account',
      company_name: currentUser?.companyName || currentUser?.name || 'Verified Supplier',
      wallet_type: 'SUPPLIER',
      available_balance: '185000000',
      locked_balance: '0',
      currency: 'INR',
      updated_at: new Date().toISOString()
    };
  }, [state, currentUser]);

  const walletCurrency = useMemo(
    () => getEntityCurrency(activeWallet || currentUser),
    [activeWallet, currentUser]
  );

  const availablePaise = activeWallet?.available_balance || '0';
  const lockedPaise = activeWallet?.locked_balance || '0';

  const nativeAvailFull = useMemo(
    () => formatBalanceInNativeCurrency(availablePaise, activeWallet || currentUser),
    [availablePaise, activeWallet, currentUser]
  );

  const nativeLockedFull = useMemo(
    () => formatBalanceInNativeCurrency(lockedPaise, activeWallet || currentUser),
    [lockedPaise, activeWallet, currentUser]
  );

  const primaryBank = useMemo(
    () => savedBanks.find(b => b.isDefault) || savedBanks[0] || null,
    [savedBanks]
  );

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Sub-Header & Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate('HOMEPAGE')}
              className="hover:text-slate-900 transition-colors font-medium cursor-pointer"
            >
              Marketplace
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <button
              type="button"
              onClick={() => onNavigate('DASHBOARD')}
              className="hover:text-slate-900 transition-colors font-medium cursor-pointer"
            >
              Dashboard
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-indigo-700 truncate">
              Supplier Bank Details &amp; Fund Withdrawal Portal
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('WALLET_TOPUP')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Wallet Top-Up Portal</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('MEDIATOR_ENGINE')}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Escrow Mediation Engine</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('DASHBOARD')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
              <span>My Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => loadState(false)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh wallet & bank payout records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Hero Landing Header */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Trade Heaven Treasury Settlement • Stage 04 Bank Payout</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Supplier Beneficiary Bank Details &amp; Fund Withdrawal Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Register and verify the corporate bank account where you receive export proceeds, then submit an instant or scheduled fund withdrawal request to Trade Heaven Treasury via <strong className="text-white">SWIFT, IMPS, NEFT, RTGS, or ACH</strong>.
              </p>
            </div>

            {/* Live Account Summary Pill Box */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 min-w-[280px] sm:min-w-[320px] space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">
                    {walletCurrency.flag} {activeWallet.company_name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                  {activeWallet.wallet_type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Liquid Balance</span>
                  </div>
                  <div className="text-sm sm:text-base font-black font-mono text-white mt-0.5 tabular-nums">
                    {nativeAvailFull.primary}
                  </div>
                  <div className="text-[10px] text-emerald-300/80 font-mono">
                    Ready to Withdraw
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>In Escrow</span>
                  </div>
                  <div className="text-sm sm:text-base font-black font-mono text-white mt-0.5 tabular-nums">
                    {nativeLockedFull.primary}
                  </div>
                  <div className="text-[10px] text-amber-300/80 font-mono">
                    Awaiting Release
                  </div>
                </div>
              </div>

              {primaryBank && (
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="text-slate-400">Active Payout Bank:</span>
                  <span className="font-mono font-bold text-indigo-300 truncate max-w-[180px]">
                    {primaryBank.bankName} ({primaryBank.payoutMethod})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3-Step How Supplier Withdrawal Works Banner */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                01
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Add Beneficiary Bank Account
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Save your company's legal beneficiary name, Bank Name, Account Number / IBAN, and SWIFT BIC / IFSC code.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                02
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Request Withdrawal from Trade Heaven
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Select your verified bank account, choose the amount from your available liquid balance, and submit to Trade Heaven.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                03
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Bank Settlement &amp; UTR / SWIFT Receipt
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Trade Heaven atomically debits your wallet, dispatches the bank wire, and records an immutable UTR / SWIFT reference in your ledger.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Supplier Bank Details & Withdrawal Panel */}
        <SupplierBankWithdrawalPanel
          currentUser={currentUser}
          activeWallet={activeWallet}
          onSuccess={updatedState => {
            setState(updatedState);
            setSavedBanks(getSavedSupplierBanks());
          }}
        />

        {/* Settlement Rail & Compliance Reference Footer Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Supported Global Settlement Rails &amp; Treasury SLA</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All supplier withdrawal requests are verified against Trade Heaven Escrow release records before wire dispatch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('DIRECT_TRANSFER_GUIDE')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Direct Transfer &amp; Escrow Guide</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>SWIFT International Wire</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold">
                  GLOBAL
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Cross-border USD / EUR / GBP / AED payouts with MT103 SWIFT copy and UETR tracking.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>RTGS / NEFT Corporate</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                  HIGH VALUE
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                High-value domestic corporate settlement with instant UTR reference generation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>IMPS Instant Settlement</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 font-bold">
                  24x7 INSTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Immediate 24/7 bank credit for rapid supplier working capital withdrawals.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>ACH / SEPA Eurozone</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-bold">
                  US &amp; EU
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Automated clearing house &amp; SEPA IBAN settlement for North American and European suppliers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierBankWithdrawalLandingPage;
