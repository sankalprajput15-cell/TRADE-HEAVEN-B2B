import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  LedgerEntryRecord,
  LedgerTransactionType,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Landmark,
  Search,
  Filter,
  RefreshCw,
  Download,
  Terminal,
  Copy,
  Check,
  Building2,
  CreditCard,
  ArrowRight,
  Layers,
  Eye,
  X,
  FileText,
  Sparkles,
  Database
} from 'lucide-react';

interface TransactionLedgerViewProps {
  onNavigateToTopUp?: () => void;
  onNavigateToMediationEngine?: () => void;
}

type CategoryFilter = 'ALL' | 'DEPOSIT' | 'ESCROW' | 'WITHDRAWAL';

const formatInrFromPaise = (paiseInput: string | number): string => {
  const num = typeof paiseInput === 'string' ? Number(paiseInput) : paiseInput;
  if (Number.isNaN(num)) return '₹0.00';
  const rupees = num / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
};

const formatUsdEquivalent = (paiseInput: string | number): string => {
  const num = typeof paiseInput === 'string' ? Number(paiseInput) : paiseInput;
  if (Number.isNaN(num)) return '$0';
  const inr = num / 100;
  const usd = inr / 83.5;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(usd);
};

export const TransactionLedgerView: React.FC<TransactionLedgerViewProps> = ({
  onNavigateToTopUp,
  onNavigateToMediationEngine
}) => {
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [exactTypeFilter, setExactTypeFilter] = useState<LedgerTransactionType | 'ALL'>('ALL');
  const [walletFilter, setWalletFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntryRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadLedgerState = async () => {
    setLoading(true);
    try {
      const data = await tradeHeavenMediationService.getState();
      setState(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerState();
    const handleMediationUpdate = () => {
      loadLedgerState();
    };
    window.addEventListener('tradeheaven_mediation_updated', handleMediationUpdate);
    return () => window.removeEventListener('tradeheaven_mediation_updated', handleMediationUpdate);
  }, []);

  const walletMap = useMemo(() => {
    const map = new Map<string, WalletRecord>();
    if (!state?.wallets) return map;
    for (const w of state.wallets) {
      map.set(w.id, w);
    }
    return map;
  }, [state]);

  const metrics = useMemo(() => {
    const entries = state?.ledgerEntries || [];
    let totalDepositsPaise = 0;
    let totalEscrowLockedPaise = 0;
    let totalEscrowReleasedPaise = 0;
    let totalPlatformFeesPaise = 0;
    let totalWithdrawalsPaise = 0;

    let depositCount = 0;
    let escrowCount = 0;
    let withdrawalCount = 0;

    for (const entry of entries) {
      const amt = Number(entry.amount) || 0;
      switch (entry.transaction_type) {
        case 'WALLET_TOPUP':
          totalDepositsPaise += amt;
          depositCount++;
          break;
        case 'ORDER_LOCK_ESCROW':
          totalEscrowLockedPaise += amt;
          escrowCount++;
          break;
        case 'ESCROW_RELEASE':
          totalEscrowReleasedPaise += amt;
          escrowCount++;
          break;
        case 'PLATFORM_FEE':
          totalPlatformFeesPaise += amt;
          escrowCount++;
          break;
        case 'SUPPLIER_PAYOUT':
          totalWithdrawalsPaise += amt;
          withdrawalCount++;
          break;
      }
    }

    return {
      totalDepositsPaise,
      totalEscrowLockedPaise,
      totalEscrowReleasedPaise,
      totalPlatformFeesPaise,
      totalWithdrawalsPaise,
      depositCount,
      escrowCount,
      withdrawalCount,
      totalCount: entries.length
    };
  }, [state]);

  const filteredEntries = useMemo(() => {
    if (!state?.ledgerEntries) return [];

    return state.ledgerEntries.filter(entry => {
      // Category filter
      if (categoryFilter === 'DEPOSIT' && entry.transaction_type !== 'WALLET_TOPUP') {
        return false;
      }
      if (
        categoryFilter === 'ESCROW' &&
        !['ORDER_LOCK_ESCROW', 'ESCROW_RELEASE', 'PLATFORM_FEE'].includes(entry.transaction_type)
      ) {
        return false;
      }
      if (categoryFilter === 'WITHDRAWAL' && entry.transaction_type !== 'SUPPLIER_PAYOUT') {
        return false;
      }

      // Exact transaction_type filter
      if (exactTypeFilter !== 'ALL' && entry.transaction_type !== exactTypeFilter) {
        return false;
      }

      // Wallet filter
      if (
        walletFilter !== 'ALL' &&
        entry.source_wallet_id !== walletFilter &&
        entry.destination_wallet_id !== walletFilter
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const srcWallet = entry.source_wallet_id ? walletMap.get(entry.source_wallet_id) : null;
        const dstWallet = entry.destination_wallet_id ? walletMap.get(entry.destination_wallet_id) : null;

        const matchId = entry.id.toLowerCase().includes(q);
        const matchRef = entry.reference_id.toLowerCase().includes(q);
        const matchType = entry.transaction_type.toLowerCase().includes(q);
        const matchNotes = entry.notes.toLowerCase().includes(q);
        const matchSrc =
          srcWallet?.company_name.toLowerCase().includes(q) ||
          srcWallet?.entity_name.toLowerCase().includes(q) ||
          (entry.source_wallet_id || '').toLowerCase().includes(q);
        const matchDst =
          dstWallet?.company_name.toLowerCase().includes(q) ||
          dstWallet?.entity_name.toLowerCase().includes(q) ||
          (entry.destination_wallet_id || '').toLowerCase().includes(q);

        if (!matchId && !matchRef && !matchType && !matchNotes && !matchSrc && !matchDst) {
          return false;
        }
      }

      return true;
    });
  }, [state, categoryFilter, exactTypeFilter, walletFilter, searchQuery, walletMap]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    if (!filteredEntries.length) return;
    const headers = [
      'Ledger Entry ID',
      'Timestamp',
      'Transaction Type',
      'Reference ID',
      'Source Wallet ID',
      'Source Entity',
      'Destination Wallet ID',
      'Destination Entity',
      'Amount (Paise)',
      'Amount (INR)',
      'Notes'
    ];

    const rows = filteredEntries.map(e => {
      const src = e.source_wallet_id ? walletMap.get(e.source_wallet_id) : null;
      const dst = e.destination_wallet_id ? walletMap.get(e.destination_wallet_id) : null;
      const inrValue = (Number(e.amount) / 100).toFixed(2);
      return [
        e.id,
        e.created_at,
        e.transaction_type,
        e.reference_id,
        e.source_wallet_id || 'EXTERNAL_GATEWAY',
        src ? `"${src.company_name}"` : 'Gateway / External',
        e.destination_wallet_id || 'ESCROW_VAULT_OR_BANK',
        dst ? `"${dst.company_name}"` : 'Escrow Hold / Bank Rail',
        e.amount,
        inrValue,
        `"${e.notes.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TradeHeaven_Transaction_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionTypeBadge = (type: LedgerTransactionType) => {
    switch (type) {
      case 'WALLET_TOPUP':
        return {
          label: 'WALLET_TOPUP',
          categoryLabel: 'Deposit',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          amountClass: 'text-emerald-600',
          prefix: '+',
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'ORDER_LOCK_ESCROW':
        return {
          label: 'ORDER_LOCK_ESCROW',
          categoryLabel: 'Escrow Hold',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          amountClass: 'text-amber-700',
          prefix: '🔒 ',
          icon: <Lock className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'ESCROW_RELEASE':
        return {
          label: 'ESCROW_RELEASE',
          categoryLabel: 'Escrow Payout',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          amountClass: 'text-blue-600',
          prefix: '→ ',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        };
      case 'PLATFORM_FEE':
        return {
          label: 'PLATFORM_FEE',
          categoryLabel: 'Mediation Fee',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          amountClass: 'text-indigo-600',
          prefix: '+',
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        };
      case 'SUPPLIER_PAYOUT':
        return {
          label: 'SUPPLIER_PAYOUT',
          categoryLabel: 'Bank Withdrawal',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          amountClass: 'text-purple-700',
          prefix: '-',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
        };
    }
  };

  const renderWalletCell = (walletId: string | null, fallbackLabel: string, fallbackSub: string) => {
    if (!walletId) {
      return (
        <div className="text-xs">
          <div className="font-semibold text-slate-600">{fallbackLabel}</div>
          <div className="text-[10px] font-mono text-slate-400">{fallbackSub}</div>
        </div>
      );
    }

    const w = walletMap.get(walletId);
    if (!w) {
      return (
        <div className="text-xs">
          <div className="font-mono font-bold text-slate-700">{walletId}</div>
        </div>
      );
    }

    const roleColor =
      w.wallet_type === 'BUYER'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : w.wallet_type === 'SUPPLIER'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200';

    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${roleColor}`}>
            {w.wallet_type === 'PLATFORM_REVENUE' ? 'TREASURY' : w.wallet_type}
          </span>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]" title={w.company_name}>
            {w.company_name}
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          {w.id} • {w.entity_name}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Database className="w-3.5 h-3.5" />
              <span>Immutable Double-Entry SQL Ledger (`ledger_entries`)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Transaction Ledger &amp; Audit History
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time feed of all database ledger records across gateway deposits (<code className="text-emerald-300 font-mono">WALLET_TOPUP</code>),
              escrow locks &amp; mediated supplier settlements (<code className="text-amber-300 font-mono">ORDER_LOCK_ESCROW</code>, <code className="text-blue-300 font-mono">ESCROW_RELEASE</code>, <code className="text-indigo-300 font-mono">PLATFORM_FEE</code>),
              and bank withdrawals (<code className="text-purple-300 font-mono">SUPPLIER_PAYOUT</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToTopUp && (
              <button
                type="button"
                onClick={onNavigateToTopUp}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>+ Top-Up Deposit</span>
              </button>
            )}
            {onNavigateToMediationEngine && (
              <button
                type="button"
                onClick={onNavigateToMediationEngine}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Escrow &amp; Payout Console</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadLedgerState}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              title="Refresh Database Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards by Transaction Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setCategoryFilter('DEPOSIT');
            setExactTypeFilter('ALL');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'DEPOSIT'
              ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Gateway Deposits (Top-Ups)</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatInrFromPaise(metrics.totalDepositsPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="font-mono text-emerald-700 font-bold">
              {metrics.depositCount} WALLET_TOPUP entries
            </span>
            <span className="text-slate-400 font-mono">
              ≈ {formatUsdEquivalent(metrics.totalDepositsPaise)}
            </span>
          </div>
        </div>

        <div
          onClick={() => {
            setCategoryFilter('ESCROW');
            setExactTypeFilter('ALL');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'ESCROW'
              ? 'bg-amber-50/70 border-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Escrow Locked &amp; Settled</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatInrFromPaise(metrics.totalEscrowLockedPaise + metrics.totalEscrowReleasedPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="font-mono text-amber-700 font-bold">
              Locked: {formatInrFromPaise(metrics.totalEscrowLockedPaise)}
            </span>
            <span className="text-blue-600 font-mono font-bold">
              Released: {formatInrFromPaise(metrics.totalEscrowReleasedPaise)}
            </span>
          </div>
        </div>

        <div
          onClick={() => {
            setCategoryFilter('ESCROW');
            setExactTypeFilter('PLATFORM_FEE');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            exactTypeFilter === 'PLATFORM_FEE'
              ? 'bg-indigo-50/70 border-indigo-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Platform Mediation Fees</span>
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatInrFromPaise(metrics.totalPlatformFeesPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="font-mono text-indigo-700 font-bold">
              PLATFORM_FEE (2.5% Comm.)
            </span>
            <span className="text-slate-400 font-mono">
              ≈ {formatUsdEquivalent(metrics.totalPlatformFeesPaise)}
            </span>
          </div>
        </div>

        <div
          onClick={() => {
            setCategoryFilter('WITHDRAWAL');
            setExactTypeFilter('ALL');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'WITHDRAWAL'
              ? 'bg-purple-50/70 border-purple-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-purple-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Bank Payout Withdrawals</span>
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatInrFromPaise(metrics.totalWithdrawalsPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="font-mono text-purple-700 font-bold">
              {metrics.withdrawalCount} SUPPLIER_PAYOUT entries
            </span>
            <span className="text-slate-400 font-mono">
              IMPS / NEFT / SWIFT
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'ALL', label: `All Transactions (${metrics.totalCount})` },
                { id: 'DEPOSIT', label: `Deposits (${metrics.depositCount})` },
                { id: 'ESCROW', label: `Escrow & Fees (${metrics.escrowCount})` },
                { id: 'WITHDRAWAL', label: `Withdrawals (${metrics.withdrawalCount})` }
              ] as Array<{ id: CategoryFilter; label: string }>
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setExactTypeFilter('ALL');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === tab.id && exactTypeFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Filters: Exact Type + Wallet + Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={exactTypeFilter}
                onChange={e => setExactTypeFilter(e.target.value as LedgerTransactionType | 'ALL')}
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All SQL Transaction Types</option>
                <option value="WALLET_TOPUP">WALLET_TOPUP (Deposit)</option>
                <option value="ORDER_LOCK_ESCROW">ORDER_LOCK_ESCROW (Escrow Hold)</option>
                <option value="ESCROW_RELEASE">ESCROW_RELEASE (Supplier Settlement)</option>
                <option value="PLATFORM_FEE">PLATFORM_FEE (Commission)</option>
                <option value="SUPPLIER_PAYOUT">SUPPLIER_PAYOUT (Bank Withdrawal)</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={walletFilter}
                onChange={e => setWalletFilter(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 max-w-[230px]"
              >
                <option value="ALL">All Wallets ({state?.wallets.length || 0})</option>
                {state?.wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    [{w.wallet_type}] {w.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Tx ID, Ref, Wallet, Notes..."
                className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">
              Database Ledger Entries (`SELECT * FROM ledger_entries ORDER BY created_at DESC`)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredEntries.length}</span> of{' '}
            <span className="font-bold text-slate-900">{state?.ledgerEntries.length || 0}</span> rows
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">No matching ledger transactions found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try clearing your active search query or switching the transaction type filter to view all deposit, escrow, and withdrawal entries.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('ALL');
                setExactTypeFilter('ALL');
                setWalletFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Ledger ID &amp; Time</th>
                  <th className="py-3.5 px-4">Transaction Type</th>
                  <th className="py-3.5 px-4">Reference ID</th>
                  <th className="py-3.5 px-4">Source Wallet (Debit)</th>
                  <th className="py-3.5 px-4">Destination Wallet (Credit)</th>
                  <th className="py-3.5 px-4 text-right">Amount (INR / Paise)</th>
                  <th className="py-3.5 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEntries.map(entry => {
                  const badge = getTransactionTypeBadge(entry.transaction_type);
                  const isSelected = selectedEntry?.id === entry.id;

                  const sourceFallback =
                    entry.transaction_type === 'WALLET_TOPUP'
                      ? { label: 'Payment Gateway Webhook', sub: 'Virtual Account / RTGS Rail' }
                      : { label: 'Escrow Mediation Lock', sub: 'Locked Balance Pool' };

                  const destFallback =
                    entry.transaction_type === 'ORDER_LOCK_ESCROW'
                      ? { label: 'Trade Heaven Escrow Vault', sub: 'wallets.locked_balance' }
                      : entry.transaction_type === 'SUPPLIER_PAYOUT'
                      ? { label: 'External Beneficiary Bank', sub: 'IMPS / NEFT / SWIFT Rail' }
                      : { label: 'System Settlement Account', sub: 'Internal Ledger' };

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50/90'
                      }`}
                    >
                      {/* Ledger ID & Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{entry.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${badge.badgeClass}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</div>
                      </td>

                      {/* Reference ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
                          <span>{entry.reference_id}</span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleCopy(entry.reference_id);
                            }}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy Reference ID"
                          >
                            {copiedId === entry.reference_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Source Wallet */}
                      <td className="py-3.5 px-4">
                        {renderWalletCell(entry.source_wallet_id, sourceFallback.label, sourceFallback.sub)}
                      </td>

                      {/* Destination Wallet */}
                      <td className="py-3.5 px-4">
                        {renderWalletCell(entry.destination_wallet_id, destFallback.label, destFallback.sub)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className={`text-sm font-black font-mono ${badge.amountClass}`}>
                          {badge.prefix}
                          {formatInrFromPaise(entry.amount)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {Number(entry.amount).toLocaleString()} paise • {formatUsdEquivalent(entry.amount)}
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEntry(entry);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Ledger Entry Inspector Drawer / Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-mono font-bold border border-indigo-200">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>LEDGER RECORD INSPECTOR • {selectedEntry.id}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">
                  {selectedEntry.notes}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Recorded at {new Date(selectedEntry.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key Monetary Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Amount (INR)</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  {formatInrFromPaise(selectedEntry.amount)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">BigInt Paise Value</div>
                <div className="text-sm font-bold font-mono text-indigo-700 mt-1">
                  {Number(selectedEntry.amount).toLocaleString()} paise
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Reference Key</div>
                <div className="text-xs font-bold font-mono text-slate-800 mt-1 break-all">
                  {selectedEntry.reference_id}
                </div>
              </div>
            </div>

            {/* Double-Entry Flow Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                <div className="text-[10px] font-black uppercase text-rose-600">
                  Source Wallet (Debit / Origin)
                </div>
                {renderWalletCell(
                  selectedEntry.source_wallet_id,
                  'External Payment Gateway',
                  'Buyer Deposit Collection Webhook'
                )}
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                <div className="text-[10px] font-black uppercase text-emerald-600">
                  Destination Wallet (Credit / Target)
                </div>
                {renderWalletCell(
                  selectedEntry.destination_wallet_id,
                  selectedEntry.transaction_type === 'ORDER_LOCK_ESCROW'
                    ? 'Escrow Locked Balance'
                    : 'External Bank Payout Rail',
                  selectedEntry.transaction_type === 'ORDER_LOCK_ESCROW'
                    ? 'Held in Trade Heaven Mediation'
                    : 'Beneficiary Corporate Bank Account'
                )}
              </div>
            </div>

            {/* Raw Database Row JSON */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>PostgreSQL `ledger_entries` Row Representation</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(selectedEntry, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(selectedEntry, null, 2))}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === JSON.stringify(selectedEntry, null, 2) ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied JSON</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Row JSON</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
