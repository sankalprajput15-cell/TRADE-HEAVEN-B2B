import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser } from '../../types';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import { TopUpWallet } from './TopUpWallet';
import {
  Wallet,
  Lock,
  Plus,
  ChevronDown,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  BookOpen,
  X,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { formatBalanceInNativeCurrency, getEntityCurrency } from '../../utils/entityCurrency';

interface HeaderWalletBalanceProps {
  currentUser: AuthUser;
  isActiveView?: boolean;
  onOpenTopUp: () => void;
  onOpenLedger?: () => void;
}

export const HeaderWalletBalance: React.FC<HeaderWalletBalanceProps> = ({
  currentUser,
  isActiveView = false,
  onOpenTopUp,
  onOpenLedger
}) => {
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseHighlight, setPulseHighlight] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadWalletState = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await tradeHeavenMediationService.getState();
      setState(data);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletState(true);

    const handleMediationUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<MediationSystemState>;
      if (customEvent.detail && customEvent.detail.wallets) {
        setState(customEvent.detail);
      } else {
        loadWalletState(true);
      }
      setPulseHighlight(true);
      setTimeout(() => setPulseHighlight(false), 1200);
    };

    window.addEventListener('tradeheaven_mediation_updated', handleMediationUpdated);
    return () => {
      window.removeEventListener('tradeheaven_mediation_updated', handleMediationUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Match currentUser to a wallet or pick role-appropriate default wallet
  const activeWallet: WalletRecord | null = useMemo(() => {
    if (!state?.wallets || state.wallets.length === 0) return null;

    if (selectedEntityId) {
      const explicit = state.wallets.find(w => w.entity_id === selectedEntityId);
      if (explicit) return explicit;
    }

    const userIdLower = (currentUser.id || '').toLowerCase();
    const userNameLower = (currentUser.name || '').toLowerCase();
    const companyLower = (currentUser.companyName || '').toLowerCase();

    const matched = state.wallets.find(
      w =>
        w.entity_id.toLowerCase() === userIdLower ||
        (companyLower && w.company_name.toLowerCase().includes(companyLower)) ||
        (userNameLower && w.entity_name.toLowerCase().includes(userNameLower))
    );
    if (matched) return matched;

    if (currentUser.role === 'SUPPLIER') {
      return (
        state.wallets.find(w => w.wallet_type === 'SUPPLIER') ||
        state.wallets[0]
      );
    }

    return (
      state.wallets.find(w => w.wallet_type === 'BUYER') ||
      state.wallets[0]
    );
  }, [state, selectedEntityId, currentUser]);

  const formatCompactINR = (paiseStr?: string) => {
    const rupees = Number(paiseStr || '0') / 100;
    if (rupees >= 10000000) {
      return `₹${(rupees / 10000000).toFixed(2)}Cr`;
    }
    if (rupees >= 100000) {
      return `₹${(rupees / 100000).toFixed(2)}L`;
    }
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatFullINR = (paiseStr?: string) => {
    const rupees = Number(paiseStr || '0') / 100;
    return `₹${rupees.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const availablePaise = activeWallet?.available_balance || '0';
  const lockedPaise = activeWallet?.locked_balance || '0';
  const totalPaise = (BigInt(availablePaise) + BigInt(lockedPaise)).toString();

  const walletCurrency = useMemo(
    () => getEntityCurrency(activeWallet || currentUser),
    [activeWallet, currentUser]
  );

  const nativeAvailCompact = useMemo(
    () => formatBalanceInNativeCurrency(availablePaise, activeWallet || currentUser, { compact: true }),
    [availablePaise, activeWallet, currentUser]
  );

  const nativeLockedCompact = useMemo(
    () => formatBalanceInNativeCurrency(lockedPaise, activeWallet || currentUser, { compact: true }),
    [lockedPaise, activeWallet, currentUser]
  );

  const nativeAvailFull = useMemo(
    () => formatBalanceInNativeCurrency(availablePaise, activeWallet || currentUser),
    [availablePaise, activeWallet, currentUser]
  );

  const nativeLockedFull = useMemo(
    () => formatBalanceInNativeCurrency(lockedPaise, activeWallet || currentUser),
    [lockedPaise, activeWallet, currentUser]
  );

  const nativeTotalFull = useMemo(
    () => formatBalanceInNativeCurrency(totalPaise, activeWallet || currentUser),
    [totalPaise, activeWallet, currentUser]
  );

  return (
    <>
      <div className="relative flex items-center shrink-0" ref={containerRef}>
        {/* Compact Toggle Pill Button */}
        <button
          type="button"
          onClick={() => setPopoverOpen(prev => !prev)}
          className={`h-8 sm:h-9 p-1 pr-2.5 rounded-full border flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-2xs group active:scale-95 bg-white ${
            pulseHighlight
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : isActiveView || popoverOpen
              ? 'border-emerald-500 bg-emerald-50/40'
              : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
          }`}
          title={`Toggle Wallet Balance (${walletCurrency.country} • ${walletCurrency.currencyCode})`}
          aria-expanded={popoverOpen}
          data-testid="header-wallet-toggle-button"
        >
          {/* Left Emerald Icon Pill */}
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center gap-1 shadow-2xs group-hover:bg-emerald-700 transition-colors shrink-0">
            <Wallet className="w-3 h-3 text-white shrink-0" />
            <span className="hidden sm:inline">Wallet</span>
          </span>

          {/* Compact Available Balance Readout */}
          <div className="flex items-center gap-1 leading-none whitespace-nowrap font-mono text-xs font-bold text-slate-900">
            <span className="text-emerald-700 font-mono font-bold" data-testid="header-available-balance">
              {nativeAvailCompact.primary}
            </span>
          </div>

          <ChevronDown
            className={`w-3 h-3 text-slate-400 group-hover:text-emerald-700 transition-transform duration-200 shrink-0 ${
              popoverOpen ? 'rotate-180 text-emerald-700' : ''
            }`}
          />
        </button>

        {/* Wallet Breakdown Dropdown Popover */}
        {popoverOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-fadeIn">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>Trade Heaven Escrow Wallet</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                      {activeWallet?.wallet_type || currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate flex items-center gap-1 mt-0.5">
                    <span>{walletCurrency.flag}</span>
                    <span className="font-semibold text-emerald-400">{walletCurrency.country}</span>
                    <span className="text-slate-400">· {activeWallet?.company_name || currentUser.companyName || currentUser.name}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadWalletState(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                title="Sync Wallet Balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>

            {/* Wallet Switcher (allows inspecting linked Buyer/Supplier wallets with country tags) */}
            {state?.wallets && state.wallets.length > 1 && (
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  Active Wallet:
                </span>
                <select
                  aria-label="Select Active Wallet"
                  value={activeWallet?.entity_id || ''}
                  onChange={e => setSelectedEntityId(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500 truncate max-w-[210px] cursor-pointer"
                >
                  {state.wallets.map(w => {
                    const c = getEntityCurrency(w);
                    return (
                      <option key={w.id} value={w.entity_id}>
                        {c.flag} {w.company_name} ({w.wallet_type}) · {c.currencyCode}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Balances Breakdown in Native Country Currency */}
            <div className="p-4 space-y-2.5">
              {/* Available Balance Card */}
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Available Liquidity ({walletCurrency.flag} {walletCurrency.currencyCode})</span>
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {nativeAvailFull.primary}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                    {nativeAvailFull.secondary} · {Number(availablePaise).toLocaleString('en-IN')} paise
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  LIQUID
                </span>
              </div>

              {/* Locked Balance Card */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Locked in Escrow ({walletCurrency.flag} {walletCurrency.currencyCode})</span>
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {nativeLockedFull.primary}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 tabular-nums">
                    {nativeLockedFull.secondary} · {Number(lockedPaise).toLocaleString('en-IN')} paise
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  ESCROW
                </span>
              </div>

              {/* Total Wallet Equity */}
              <div className="pt-1.5 px-1 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="font-semibold text-slate-500">Total Net Balance</span>
                <span className="font-bold font-mono tabular-nums text-slate-900">
                  {nativeTotalFull.primary} <span className="text-[10px] text-slate-400 font-normal">({nativeTotalFull.secondary})</span>
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPopoverOpen(false);
                    onOpenTopUp();
                  }}
                  className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Top-Up Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPopoverOpen(false);
                    onOpenTopUp();
                  }}
                  className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Escrow Engine</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {onOpenLedger && (
                <button
                  type="button"
                  onClick={() => {
                    setPopoverOpen(false);
                    onOpenLedger();
                  }}
                  className="w-full h-8 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Transaction Ledger History</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instant Top-Up Wallet Modal Overlay */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Top-Up Trade Heaven Wallet</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      creditBuyerDeposit()
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add funds via simulated corporate payment gateway webhook into your available balance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTopUpModalOpen(false);
                    onOpenTopUp();
                  }}
                  className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Mediator View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTopUpModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Top-Up Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <TopUpWallet
                onSuccess={updatedState => {
                  setState(updatedState);
                }}
                onNavigateToFullEngine={() => {
                  setTopUpModalOpen(false);
                  onOpenTopUp();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
