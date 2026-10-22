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
  ShieldCheck,
  Landmark,
  Search,
  Filter,
  RefreshCw,
  Download,
  Terminal,
  Copy,
  Check,
  CreditCard,
  Layers,
  Eye,
  X,
  Zap,
  Database
} from 'lucide-react';
import { formatBalanceInNativeCurrency, getEntityCurrency } from '../../utils/entityCurrency';

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

      if (exactTypeFilter !== 'ALL' && entry.transaction_type !== exactTypeFilter) {
        return false;
      }

      if (
        walletFilter !== 'ALL' &&
        entry.source_wallet_id !== walletFilter &&
        entry.destination_wallet_id !== walletFilter
      ) {
        return false;
      }

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

  const getTransactionTypeMeta = (type: LedgerTransactionType) => {
    switch (type) {
      case 'WALLET_TOPUP':
        return {
          label: 'WALLET_TOPUP',
          categoryLabel: 'Deposit',
          textClass: 'text-emerald-700',
          amountClass: 'text-emerald-600',
          prefix: '+',
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        };
      case 'ORDER_LOCK_ESCROW':
        return {
          label: 'ORDER_LOCK_ESCROW',
          categoryLabel: 'Escrow Hold',
          textClass: 'text-amber-700',
          amountClass: 'text-amber-700',
          prefix: '',
          icon: <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        };
      case 'ESCROW_RELEASE':
        return {
          label: 'ESCROW_RELEASE',
          categoryLabel: 'Escrow Payout',
          textClass: 'text-blue-700',
          amountClass: 'text-blue-600',
          prefix: '',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        };
      case 'PLATFORM_FEE':
        return {
          label: 'PLATFORM_FEE',
          categoryLabel: 'Mediation Fee',
          textClass: 'text-indigo-700',
          amountClass: 'text-indigo-600',
          prefix: '+',
          icon: <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        };
      case 'SUPPLIER_PAYOUT':
        return {
          label: 'SUPPLIER_PAYOUT',
          categoryLabel: 'Bank Withdrawal',
          textClass: 'text-purple-700',
          amountClass: 'text-purple-700',
          prefix: '-',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        };
    }
  };

  const renderWalletCell = (walletId: string | null, fallbackLabel: string, fallbackSub: string) => {
    if (!walletId) {
      return (
        <div className="text-xs">
          <div className="font-medium text-slate-700">{fallbackLabel}</div>
          <div className="text-[11px] font-mono text-slate-400">{fallbackSub}</div>
        </div>
      );
    }

    const w = walletMap.get(walletId);
    if (!w) {
      return (
        <div className="text-xs">
          <div className="font-mono font-semibold text-slate-700">{walletId}</div>
        </div>
      );
    }

    const roleColor =
      w.wallet_type === 'BUYER'
        ? 'text-blue-600'
        : w.wallet_type === 'SUPPLIER'
        ? 'text-emerald-600'
        : 'text-indigo-600';

    const entityCurrency = getEntityCurrency(w.entity_id);

    return (
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-slate-900 truncate max-w-[200px] flex items-center gap-1.5" title={w.company_name}>
          <span className="shrink-0">{entityCurrency.flag}</span>
          <span className="truncate">{w.company_name}</span>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
          <span className={`font-semibold ${roleColor}`}>
            {w.wallet_type === 'PLATFORM_REVENUE' ? 'TREASURY' : w.wallet_type}
          </span>
          <span aria-hidden="true">·</span>
          <span>{entityCurrency.country} ({entityCurrency.currency})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Database className="w-3.5 h-3.5" />
            <span>Double-Entry SQL Ledger (`ledger_entries`)</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-mono">{metrics.totalCount} Committed Records</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Transaction Ledger &amp; Audit History
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Real-time database feed of buyer gateway deposits (<code className="text-slate-800 font-mono">WALLET_TOPUP</code>),
            escrow locks and mediated supplier settlements (<code className="text-slate-800 font-mono">ORDER_LOCK_ESCROW</code>, <code className="text-slate-800 font-mono">ESCROW_RELEASE</code>, <code className="text-slate-800 font-mono">PLATFORM_FEE</code>),
            and bank withdrawals (<code className="text-slate-800 font-mono">SUPPLIER_PAYOUT</code>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToTopUp && (
            <button
              type="button"
              onClick={onNavigateToTopUp}
              className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Top-Up Deposit</span>
            </button>
          )}
          {onNavigateToMediationEngine && (
            <button
              type="button"
              onClick={onNavigateToMediationEngine}
              className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Escrow Console</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={loadLedgerState}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title="Refresh Database Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards by Transaction Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter('DEPOSIT');
            setExactTypeFilter('ALL');
          }}
          className={`p-5 rounded-xl border text-left transition-colors cursor-pointer ${
            categoryFilter === 'DEPOSIT'
              ? 'bg-emerald-50/50 border-emerald-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Gateway Deposits (Top-Ups)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatInrFromPaise(metrics.totalDepositsPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
            <span className="text-emerald-700 font-medium">
              {metrics.depositCount} WALLET_TOPUP
            </span>
            <span>≈ {formatUsdEquivalent(metrics.totalDepositsPaise)}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter('ESCROW');
            setExactTypeFilter('ALL');
          }}
          className={`p-5 rounded-xl border text-left transition-colors cursor-pointer ${
            categoryFilter === 'ESCROW' && exactTypeFilter === 'ALL'
              ? 'bg-amber-50/50 border-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Escrow Locked &amp; Settled</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatInrFromPaise(metrics.totalEscrowLockedPaise + metrics.totalEscrowReleasedPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
            <span>Hold: {formatInrFromPaise(metrics.totalEscrowLockedPaise)}</span>
            <span>Paid: {formatInrFromPaise(metrics.totalEscrowReleasedPaise)}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter('ESCROW');
            setExactTypeFilter('PLATFORM_FEE');
          }}
          className={`p-5 rounded-xl border text-left transition-colors cursor-pointer ${
            exactTypeFilter === 'PLATFORM_FEE'
              ? 'bg-indigo-50/50 border-indigo-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Platform Mediation Fees</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatInrFromPaise(metrics.totalPlatformFeesPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
            <span className="text-indigo-700 font-medium">PLATFORM_FEE (2.5%)</span>
            <span>≈ {formatUsdEquivalent(metrics.totalPlatformFeesPaise)}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter('WITHDRAWAL');
            setExactTypeFilter('ALL');
          }}
          className={`p-5 rounded-xl border text-left transition-colors cursor-pointer ${
            categoryFilter === 'WITHDRAWAL'
              ? 'bg-purple-50/50 border-purple-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Bank Payout Withdrawals</span>
            <Landmark className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatInrFromPaise(metrics.totalWithdrawalsPaise)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
            <span className="text-purple-700 font-medium">
              {metrics.withdrawalCount} SUPPLIER_PAYOUT
            </span>
            <span>IMPS · NEFT · SWIFT</span>
          </div>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Segmented Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80 overflow-x-auto">
          {(
            [
              { id: 'ALL', label: `All Entries (${metrics.totalCount})` },
              { id: 'DEPOSIT', label: `Deposits (${metrics.depositCount})` },
              { id: 'ESCROW', label: `Escrow & Fees (${metrics.escrowCount})` },
              { id: 'WITHDRAWAL', label: `Withdrawals (${metrics.withdrawalCount})` }
            ] as Array<{ id: CategoryFilter; label: string }>
          ).map(tab => {
            const isActive = categoryFilter === tab.id && exactTypeFilter === 'ALL';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setExactTypeFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Filters: Exact Type + Wallet + Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by SQL Transaction Type"
            value={exactTypeFilter}
            onChange={e => setExactTypeFilter(e.target.value as LedgerTransactionType | 'ALL')}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="ALL">All SQL Types</option>
            <option value="WALLET_TOPUP">WALLET_TOPUP (Deposit)</option>
            <option value="ORDER_LOCK_ESCROW">ORDER_LOCK_ESCROW (Escrow Hold)</option>
            <option value="ESCROW_RELEASE">ESCROW_RELEASE (Settlement)</option>
            <option value="PLATFORM_FEE">PLATFORM_FEE (Commission)</option>
            <option value="SUPPLIER_PAYOUT">SUPPLIER_PAYOUT (Withdrawal)</option>
          </select>

          <select
            aria-label="Filter by Wallet"
            value={walletFilter}
            onChange={e => setWalletFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 max-w-[220px] cursor-pointer"
          >
            <option value="ALL">All Wallets ({state?.wallets.length || 0})</option>
            {state?.wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.company_name} ({w.wallet_type})
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[210px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Tx ID, Ref, Wallet..."
              className="w-full h-9 pl-8 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
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

      {/* Main Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Ledger Entries (`SELECT * FROM ledger_entries ORDER BY created_at DESC`)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-500 tabular-nums">
            Showing <span className="font-semibold text-slate-900">{filteredEntries.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{state?.ledgerEntries.length || 0}</span> rows
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-800">No matching ledger transactions found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clear your search query or reset the transaction type filter to view all deposit, escrow, and withdrawal entries.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('ALL');
                setExactTypeFilter('ALL');
                setWalletFilter('ALL');
                setSearchQuery('');
              }}
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Ledger ID &amp; Time</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Source Wallet (Debit)</th>
                  <th className="py-3 px-4">Destination Wallet (Credit)</th>
                  <th className="py-3 px-4 text-right">Amount (INR / Paise)</th>
                  <th className="py-3 px-4 text-right">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEntries.map(entry => {
                  const meta = getTransactionTypeMeta(entry.transaction_type);
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

                  const relWallet =
                    entry.destination_wallet_id && walletMap.get(entry.destination_wallet_id)?.wallet_type !== 'PLATFORM_REVENUE'
                      ? walletMap.get(entry.destination_wallet_id)
                      : (entry.source_wallet_id ? walletMap.get(entry.source_wallet_id) : null);
                  const nativeFormatted = relWallet ? formatBalanceInNativeCurrency(entry.amount, relWallet.entity_id) : null;

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Ledger ID & Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900 tabular-nums">
                          {entry.id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 font-mono text-xs font-semibold ${meta.textClass}`}>
                          {meta.icon}
                          <span>{meta.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</div>
                      </td>

                      {/* Reference ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
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
                      <td className="py-3 px-4">
                        {renderWalletCell(entry.source_wallet_id, sourceFallback.label, sourceFallback.sub)}
                      </td>

                      {/* Destination Wallet */}
                      <td className="py-3 px-4">
                        {renderWalletCell(entry.destination_wallet_id, destFallback.label, destFallback.sub)}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className={`text-sm font-bold font-mono tabular-nums ${meta.amountClass}`}>
                          {meta.prefix}
                          {nativeFormatted ? nativeFormatted.nativeAmount : formatInrFromPaise(entry.amount)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 tabular-nums flex items-center justify-end gap-1">
                          {nativeFormatted && <span>{nativeFormatted.flag}</span>}
                          <span>{formatInrFromPaise(entry.amount)}</span>
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEntry(entry);
                          }}
                          className="h-7 px-2.5 rounded-md border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
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

      {/* Selected Ledger Entry Inspector Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-600">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>LEDGER RECORD INSPECTOR</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedEntry.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedEntry.notes}
                </h3>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  Recorded at {new Date(selectedEntry.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key Monetary Breakdown */}
            {(() => {
              const selRelWallet =
                selectedEntry.destination_wallet_id && walletMap.get(selectedEntry.destination_wallet_id)?.wallet_type !== 'PLATFORM_REVENUE'
                  ? walletMap.get(selectedEntry.destination_wallet_id)
                  : (selectedEntry.source_wallet_id ? walletMap.get(selectedEntry.source_wallet_id) : null);
              const selNative = selRelWallet ? formatBalanceInNativeCurrency(selectedEntry.amount, selRelWallet.entity_id) : null;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Native Country Currency
                    </div>
                    <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5 flex items-center gap-1.5 truncate">
                      {selNative ? (
                        <>
                          <span className="shrink-0">{selNative.flag}</span>
                          <span className="truncate">{selNative.nativeAmount}</span>
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Amount (INR Ledger)</div>
                    <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {formatInrFromPaise(selectedEntry.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">BigInt Paise Value</div>
                    <div className="text-xs font-semibold font-mono tabular-nums text-indigo-700 mt-1">
                      {Number(selectedEntry.amount).toLocaleString()} paise
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Reference Key</div>
                    <div className="text-xs font-semibold font-mono text-slate-800 mt-1 break-all">
                      {selectedEntry.reference_id}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Double-Entry Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="text-[11px] font-semibold text-rose-600">
                  Source Wallet (Debit / Origin)
                </div>
                {renderWalletCell(
                  selectedEntry.source_wallet_id,
                  'External Payment Gateway',
                  'Buyer Deposit Collection Webhook'
                )}
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="text-[11px] font-semibold text-emerald-600">
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
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>PostgreSQL `ledger_entries` Row</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(selectedEntry, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(selectedEntry, null, 2))}
                className="h-9 px-4 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
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
                className="h-9 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
