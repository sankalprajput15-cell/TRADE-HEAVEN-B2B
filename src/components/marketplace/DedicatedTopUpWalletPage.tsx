import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import { AuthUser, Currency } from '../../types';
import { TopUpWallet } from './TopUpWallet';
import { SupplierBankWithdrawalPanel } from './SupplierBankWithdrawalPanel';
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
  Clock,
  Send
} from 'lucide-react';

interface Props {
  currentUser: AuthUser | null;
  selectedCurrency?: Currency;
  onNavigate: (view: any) => void;
  onOpenStorefront?: (companyId: string) => void;
  initialTab?: 'TOPUP' | 'WITHDRAW' | 'REQUESTS' | 'LEDGER' | 'ESCROW';
}

export const DedicatedTopUpWalletPage: React.FC<Props> = ({
  currentUser,
  selectedCurrency = 'USD',
  onNavigate,
  initialTab = 'TOPUP'
}) => {
  const [activeTab, setActiveTab] = useState<'TOPUP' | 'WITHDRAW' | 'REQUESTS' | 'LEDGER' | 'ESCROW'>(initialTab);
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

    return {
      id: `wal-personal-${currentUser?.id || 'guest'}`,
      entity_id: currentUser?.id || 'personal-client-wallet',
      entity_name: currentUser?.name || 'Logged-in Client',
      company_name: currentUser?.companyName || currentUser?.name || 'Personal Account',
      wallet_type: currentUser?.role === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER',
      available_balance: '0',
      locked_balance: '0',
      currency: 'INR',
      updated_at: new Date().toISOString()
    };
  }, [state, currentUser]);

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
              Wallet Top-Up &amp; Supplier Bank Withdrawal Portal
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('DIRECT_TRANSFER_GUIDE')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>How Direct Transfer Works &amp; Client Guide</span>
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
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh balances & ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">

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
              type="button"
              onClick={() => onNavigate('SUPPLIER_WITHDRAWAL')}
              className="h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
            >
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Supplier Bank Details &amp; Withdraw Funds Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
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
              selectedWalletId={activeWallet.entity_id}
              onRefreshParentState={() => loadState(false)}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Transfer Status Tracker View */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-6">
            <TopUpRequestsList
              selectedWalletId={activeWallet.entity_id}
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
