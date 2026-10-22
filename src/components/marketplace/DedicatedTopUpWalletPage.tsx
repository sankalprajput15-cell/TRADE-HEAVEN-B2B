import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import { AuthUser, Currency } from '../../types';
import { TopUpWallet } from './TopUpWallet';
import { TransactionLedgerView } from './TransactionLedgerView';
import { TradeHeavenMediatorView } from './TradeHeavenMediatorView';
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
  AlertCircle
} from 'lucide-react';

interface Props {
  currentUser: AuthUser | null;
  selectedCurrency?: Currency;
  onNavigate: (view: any) => void;
  onOpenStorefront?: (companyId: string) => void;
  initialTab?: 'TOPUP' | 'LEDGER' | 'ESCROW';
}

export const DedicatedTopUpWalletPage: React.FC<Props> = ({
  currentUser,
  selectedCurrency = 'USD',
  onNavigate,
  initialTab = 'TOPUP'
}) => {
  const [activeTab, setActiveTab] = useState<'TOPUP' | 'LEDGER' | 'ESCROW'>(initialTab);
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('buyer-titan-01');

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

  const availablePaise = activeWallet?.available_balance || '0';
  const lockedPaise = activeWallet?.locked_balance || '0';
  const totalPaise = (BigInt(availablePaise) + BigInt(lockedPaise)).toString();

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
                Dedicated gateway for corporate buyer liquidity replenishment, instantaneous RazorpayX/Cashfree webhook verification, and double-entry transaction ledger tracking.
              </p>
            </div>

            {/* Corporate Wallet Selector Pill */}
            {state?.wallets && state.wallets.length > 0 && (
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 shrink-0 lg:min-w-[280px]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Selected Account</span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    {activeWallet?.wallet_type}
                  </span>
                </div>
                <select
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-600 text-xs font-medium text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {state.wallets.map(w => (
                    <option key={w.id || w.entity_id} value={w.entity_id}>
                      {w.company_name} ({w.wallet_type})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 mt-2 truncate flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{activeWallet?.entity_name}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-slate-400 text-[10px]">{activeWallet?.entity_id}</span>
                </div>
              </div>
            )}
          </div>

          {/* Core Balance Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700/60">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Available Cash Liquidity</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-400">
                {formatInrFromPaise(availablePaise)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Approx. ${(Number(availablePaise) / 8350).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD · Unrestricted
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Locked in Escrow Mediation</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-400">
                {formatInrFromPaise(lockedPaise)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Held under B2B milestone contract guarantees
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Net Wallet Liquidity</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white">
                {formatInrFromPaise(totalPaise)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {formatCompactInr(totalPaise)} aggregated balance
              </div>
            </div>
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
          </div>
        )}

        {/* Tab 2: Transaction Ledger History */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-6">
            <TransactionLedgerView
              onNavigateToTopUp={() => setActiveTab('TOPUP')}
              onNavigateToMediationEngine={() => setActiveTab('ESCROW')}
            />
          </div>
        )}

        {/* Tab 3: Full Mediation Engine */}
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
