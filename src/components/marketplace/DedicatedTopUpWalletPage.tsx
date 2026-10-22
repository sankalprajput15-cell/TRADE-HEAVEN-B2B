import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import { AuthUser, Currency } from '../../types';
import { TopUpWallet } from './TopUpWallet';
import { OFFICIAL_SWIFT_BANK_DETAILS } from '../../constants/swiftBankDetails';
import { TransactionLedgerView } from './TransactionLedgerView';
import { TradeHeavenMediatorView } from './TradeHeavenMediatorView';
import { TopUpRequestsList } from './TopUpRequestsList';
import { formatBalanceInNativeCurrency, getEntityCurrency } from '../../utils/entityCurrency';
import {
  Wallet,
  Lock,
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Layers,
  RefreshCw,
  Building2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  Landmark,
  Clock
} from 'lucide-react';

interface Props {
  currentUser: AuthUser | null;
  selectedCurrency?: Currency;
  onNavigate: (view: any) => void;
  onOpenStorefront?: (companyId: string) => void;
  initialTab?: 'TOPUP' | 'REQUESTS' | 'LEDGER' | 'ESCROW';
}

export const DedicatedTopUpWalletPage: React.FC<Props> = ({
  currentUser,
  selectedCurrency = 'USD',
  onNavigate,
  initialTab = 'TOPUP'
}) => {
  const [activeTab, setActiveTab] = useState<'TOPUP' | 'REQUESTS' | 'LEDGER' | 'ESCROW'>(initialTab);
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('buyer-titan-01');
  const [copiedSwiftField, setCopiedSwiftField] = useState<string | null>(null);

  const handleCopySwiftField = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSwiftField(field);
    setTimeout(() => setCopiedSwiftField(null), 2000);
  };

  const loadState = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await tradeHeavenMediationService.getState();
      setState(data);
    } finally {
      setLoading(false);
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
    };
    window.addEventListener('tradeheaven_mediation_updated', handleMediationUpdated);
    return () => {
      window.removeEventListener('tradeheaven_mediation_updated', handleMediationUpdated);
    };
  }, []);

  const activeWallet: WalletRecord | undefined = useMemo(() => {
    if (!state?.wallets) return undefined;
    return state.wallets.find(w => w.entity_id === selectedWalletId) || state.wallets[0];
  }, [state, selectedWalletId]);

  const formatInrFromPaise = (paiseVal: string | number) => {
    const inr = Number(paiseVal || 0) / 100;
    return `₹${inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCompactInr = (paiseVal: string | number) => {
    const rupees = Number(paiseVal || 0) / 100;
    if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} Cr`;
    if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} Lakh`;
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const walletCurrency = useMemo(() => getEntityCurrency(activeWallet), [activeWallet]);

  const totalPaise = useMemo(
    () => (Number(activeWallet?.available_balance || 0) + Number(activeWallet?.locked_balance || 0)).toString(),
    [activeWallet]
  );

  const nativeAvail = useMemo(
    () => formatBalanceInNativeCurrency(activeWallet?.available_balance || '0', activeWallet),
    [activeWallet]
  );
  const nativeLocked = useMemo(
    () => formatBalanceInNativeCurrency(activeWallet?.locked_balance || '0', activeWallet),
    [activeWallet]
  );
  const nativeTotal = useMemo(
    () => formatBalanceInNativeCurrency(totalPaise, activeWallet),
    [activeWallet, totalPaise]
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Breadcrumb & Return Action Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate('HOMEPAGE')}
              className="hover:text-slate-900 transition-colors font-medium flex items-center gap-1 cursor-pointer"
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
            <span className="font-semibold text-emerald-700 truncate">
              Wallet Top-Up Portal
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('DASHBOARD')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
              <span>Buyer Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => loadState(false)}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh balances & ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Main Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trade Heaven Custodial Liquidity Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Corporate Wallet &amp; Top-Up Engine
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Dedicated gateway for corporate buyer and supplier liquidity, displaying balances in local country currencies ({walletCurrency.flag} {walletCurrency.currencyCode}) alongside real-time transaction ledger tracking.
              </p>
            </div>

            {/* Corporate Wallet Selector Pill */}
            {state?.wallets && state.wallets.length > 0 && (
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 shrink-0 lg:min-w-[300px]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Selected Account</span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    <span>{walletCurrency.flag}</span>
                    <span>{walletCurrency.currencyCode} ({walletCurrency.currencySymbol})</span>
                  </div>
                </div>
                <select
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-600 text-xs font-medium text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {state.wallets.map(w => {
                    const c = getEntityCurrency(w);
                    return (
                      <option key={w.id || w.entity_id} value={w.entity_id}>
                        {c.flag} {w.company_name} ({w.wallet_type}) · {c.currencyCode}
                      </option>
                    );
                  })}
                </select>
                <div className="text-[11px] text-slate-400 mt-2 truncate flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{activeWallet?.entity_name}</span>
                  </div>
                  <span className="font-mono text-emerald-400 text-[10px] font-semibold shrink-0">
                    {walletCurrency.country}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Core Balance Metrics Strip in Buyer/Supplier Country Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700/60">
            {/* Available Balance in Country Currency */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Available Cash Liquidity</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {walletCurrency.flag} {walletCurrency.currencyCode}
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-400 truncate">
                {nativeAvail.primary}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{walletCurrency.country}</span>
                <span className="font-mono text-slate-300 font-medium">{nativeAvail.secondary}</span>
              </div>
            </div>

            {/* Locked Balance in Country Currency */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Locked in Escrow Mediation</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {walletCurrency.flag} {walletCurrency.currencyCode}
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-400 truncate">
                {nativeLocked.primary}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Under contract guarantee</span>
                <span className="font-mono text-slate-300 font-medium">{nativeLocked.secondary}</span>
              </div>
            </div>

            {/* Total Balance in Country Currency */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Net Wallet Liquidity</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                  {walletCurrency.flag} {walletCurrency.currencyCode}
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white truncate">
                {nativeTotal.primary}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Combined Equity</span>
                <span className="font-mono text-slate-300 font-medium">{nativeTotal.secondary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Bank Account for Balance Top-Up Banner */}
        <div className="bg-white border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Official Wire Account for Balance Top-Up:
                </span>
                <span className="font-semibold text-xs text-blue-900">
                  {OFFICIAL_SWIFT_BANK_DETAILS.bankName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  SWIFT: {OFFICIAL_SWIFT_BANK_DETAILS.bicSwift}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Account Holder: <strong>{OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName}</strong></span>
                <span className="text-slate-300">•</span>
                <span>IBAN: <strong className="font-mono text-slate-900 select-all">{OFFICIAL_SWIFT_BANK_DETAILS.iban}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Mandatory Remark Reminder Pill */}
            <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Mandatory Remark:</span>
              <strong className="font-mono text-amber-950 font-bold">{OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark}</strong>
              <button
                type="button"
                onClick={() => handleCopySwiftField('REMARK', OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark)}
                className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200/70 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer"
              >
                {copiedSwiftField === 'REMARK' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleCopySwiftField('IBAN', OFFICIAL_SWIFT_BANK_DETAILS.iban)}
              className="px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedSwiftField === 'IBAN' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-800" />
                  <span>IBAN Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IBAN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dedicated Section Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs overflow-x-auto">
          <div role="tablist" aria-label="Wallet Navigation" className="flex items-center gap-1.5 min-w-max">
            <button
              role="tab"
              aria-selected={activeTab === 'TOPUP'}
              type="button"
              onClick={() => setActiveTab('TOPUP')}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'TOPUP'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${activeTab === 'TOPUP' ? 'text-white' : 'text-slate-400'}`} />
              <span>Payment Gateway Top-Up Simulation</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                activeTab === 'TOPUP' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                creditBuyerDeposit()
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'REQUESTS'}
              type="button"
              onClick={() => setActiveTab('REQUESTS')}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'REQUESTS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'REQUESTS' ? 'text-white' : 'text-slate-400'}`} />
              <span>Transfer Status &amp; Requests</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                activeTab === 'REQUESTS' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Pending &amp; Verified
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'LEDGER'}
              type="button"
              onClick={() => setActiveTab('LEDGER')}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'LEDGER'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'LEDGER' ? 'text-white' : 'text-slate-400'}`} />
              <span>Transaction Ledger History</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                activeTab === 'LEDGER' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {state?.ledgerEntries?.length || 0}
              </span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'ESCROW'}
              type="button"
              onClick={() => setActiveTab('ESCROW')}
              className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'ESCROW'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'ESCROW' ? 'text-white' : 'text-slate-400'}`} />
              <span>Full Escrow &amp; Mediation Engine</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Instant Payment Gateway Top-Up */}
        {activeTab === 'TOPUP' && (
          <div className="space-y-6">
            <TopUpWallet
              onSuccess={updated => {
                setState(updated);
              }}
              onNavigateToFullEngine={() => setActiveTab('ESCROW')}
            />

            {/* Previous Top-Up Requests & Status List */}
            <TopUpRequestsList
              selectedWalletId={selectedWalletId}
              onRefreshParentState={() => loadState(false)}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Transfer Status Tracker View */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-6">
            <TopUpRequestsList
              selectedWalletId={selectedWalletId}
              onRefreshParentState={() => loadState(false)}
            />
          </div>
        )}

        {/* Tab 3: Transaction Ledger History */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-6">
            <TransactionLedgerView
              onNavigateToTopUp={() => setActiveTab('TOPUP')}
              onNavigateToMediationEngine={() => setActiveTab('ESCROW')}
            />
          </div>
        )}

        {/* Tab 4: Full Mediation Engine */}
        {activeTab === 'ESCROW' && (
          <div className="space-y-6">
            <TradeHeavenMediatorView embedded={true} />
          </div>
        )}
      </div>
    </div>
  );
};
export default DedicatedTopUpWalletPage;
