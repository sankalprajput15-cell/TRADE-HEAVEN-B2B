import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord,
  LedgerTransactionType,
  BankTransferResult
} from '../../services/tradeHeavenMediatorEngine';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  Lock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  ShieldCheck,
  RefreshCw,
  Download,
  AlertCircle,
  Database,
  Landmark,
  FileSpreadsheet,
  ArrowRight,
  Search,
  BookOpen,
  CreditCard,
  Layers
} from 'lucide-react';
import { TopUpWallet } from './TopUpWallet';
import { TransactionLedgerView } from './TransactionLedgerView';
import {
  formatBalanceInNativeCurrency,
  getEntityCurrency,
  localAmountToPaise,
  paiseToLocalAmount,
  formatLocalAmount
} from '../../utils/entityCurrency';
import { MOCK_COMPANIES } from '../../data/mockData';

interface Props {
  embedded?: boolean;
}

type ActiveStage = 'TOPUP' | 'LOCK_ESCROW' | 'RELEASE_SETTLEMENT' | 'BANK_PAYOUT';
type ActiveLedgerFilter = 'ALL' | LedgerTransactionType;
type ActiveSectionTab = 'WORKBENCH' | 'TOPUP_SIMULATOR' | 'LEDGER_VIEW';

export const TradeHeavenMediatorView: React.FC<Props> = ({ embedded = false }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeSectionTab, setActiveSectionTab] = useState<ActiveSectionTab>('WORKBENCH');
  const [activeStage, setActiveStage] = useState<ActiveStage>('TOPUP');
  const [ledgerFilter, setLedgerFilter] = useState<ActiveLedgerFilter>('ALL');
  const [walletSearch, setWalletSearch] = useState<string>('');
  const [displayUnit, setDisplayUnit] = useState<'INR' | 'PAISE' | 'USD'>('INR');
  const [showSqlInspector, setShowSqlInspector] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Stage 1 Form: creditBuyerDeposit (in buyer's native country currency)
  const [topupBuyerId, setTopupBuyerId] = useState<string>('buyer-titan-01');
  const [topupAmountInr, setTopupAmountInr] = useState<string>('5000');
  const [topupGatewayTxId, setTopupGatewayTxId] = useState<string>(
    () => `GW-RZP-${Math.floor(1000000 + Math.random() * 9000000)}`
  );

  // Stage 2 Form: lockOrderFundsInEscrow (in buyer's native country currency)
  const [lockBuyerId, setLockBuyerId] = useState<string>('buyer-apex-03');
  const [lockSupplierId, setLockSupplierId] = useState<string>('comp-bharat-steel');
  const [lockOrderId, setLockOrderId] = useState<string>('ORD-ESC-2026-9102');
  const [lockProductTitle, setLockProductTitle] = useState<string>(
    'Hot-Dip Galvanized Structural Steel Coils S355JR (120 MT)'
  );
  const [lockAmountInr, setLockAmountInr] = useState<string>('6500');

  // Stage 3 Form: releaseEscrowToSupplier (in buyer's native country currency)
  const [releaseOrderId, setReleaseOrderId] = useState<string>('ORD-ESC-2026-8841');
  const [releaseBuyerId, setReleaseBuyerId] = useState<string>('buyer-titan-01');
  const [releaseSupplierId, setReleaseSupplierId] = useState<string>('comp-melissa-mpcommodity');
  const [releaseTotalAmountInr, setReleaseTotalAmountInr] = useState<string>('11000');
  const [releaseFeePercent, setReleaseFeePercent] = useState<string>('2.5');

  // Stage 4 Form: requestBankPayout (in entity's native country currency)
  const [payoutEntityId, setPayoutEntityId] = useState<string>('comp-melissa-mpcommodity');
  const [payoutAmountInr, setPayoutAmountInr] = useState<string>('5000');
  const [beneficiaryName, setBeneficiaryName] = useState<string>(
    'MP Commodity Brokers Australia Pty Ltd'
  );
  const [beneficiaryAccount, setBeneficiaryAccount] = useState<string>('50200048192041');
  const [beneficiaryIfsc, setBeneficiaryIfsc] = useState<string>('CTBAAU2S');
  const [beneficiaryBank, setBeneficiaryBank] = useState<string>('Commonwealth Bank Corporate Treasury');
  const [beneficiaryRail, setBeneficiaryRail] = useState<'IMPS' | 'NEFT' | 'RTGS' | 'ACH' | 'SWIFT'>('SWIFT');
  const [lastPayoutResult, setLastPayoutResult] = useState<BankTransferResult | null>(null);

  const loadMediationState = async () => {
    setLoading(true);
    try {
      const data = await tradeHeavenMediationService.getState();
      setState(data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Failed to load mediation state',
        message: err?.message || 'Unable to connect to mediation engine.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMediationState();
    const handleStageEvent = (e: Event) => {
      const custom = e as CustomEvent<{ stage?: ActiveStage; sectionTab?: ActiveSectionTab }>;
      if (custom?.detail?.stage) {
        setActiveStage(custom.detail.stage);
        if (custom.detail.stage === 'TOPUP') {
          setActiveSectionTab('TOPUP_SIMULATOR');
        }
      }
      if (custom?.detail?.sectionTab) {
        setActiveSectionTab(custom.detail.sectionTab);
      }
    };
    window.addEventListener('tradeheaven_open_mediation_stage', handleStageEvent);
    return () => window.removeEventListener('tradeheaven_open_mediation_stage', handleStageEvent);
  }, []);

  const buyerWallets = useMemo(() => {
    const wallets = state?.wallets || [];
    if (isAdmin) {
      return wallets.filter(w => w.wallet_type === 'BUYER');
    }
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
      if (matched) return [matched];
    }
    return [
      {
        id: `wal-personal-${currentUser?.id || 'guest'}`,
        entity_id: currentUser?.id || 'personal-client-wallet',
        entity_name: currentUser?.name || 'Logged-in Client',
        company_name: currentUser?.companyName || currentUser?.name || 'Personal Account',
        wallet_type: 'BUYER' as const,
        available_balance: '0',
        locked_balance: '0',
        currency: 'INR',
        updated_at: new Date().toISOString()
      }
    ];
  }, [state, isAdmin, currentUser]);

  useEffect(() => {
    if (!isAdmin && buyerWallets.length > 0) {
      const personalId = buyerWallets[0].entity_id;
      setTopupBuyerId(personalId);
      setLockBuyerId(personalId);
      setReleaseBuyerId(personalId);
    }
  }, [isAdmin, buyerWallets]);

  // Recipient supplier directory (merges all portal suppliers, never exposes balances to non-admins)
  const supplierWallets = useMemo(() => {
    const walletSuppliers = (state?.wallets || []).filter(w => w.wallet_type === 'SUPPLIER');
    const seenIds = new Set(walletSuppliers.map(w => w.entity_id));
    const merged: WalletRecord[] = [...walletSuppliers];

    for (const comp of MOCK_COMPANIES || []) {
      if (!comp?.id || seenIds.has(comp.id)) continue;
      seenIds.add(comp.id);
      merged.push({
        id: `wal-supp-${comp.id}`,
        entity_id: comp.id,
        entity_name: comp.contactPerson || 'Verified Exporter Representative',
        company_name: comp.companyName,
        wallet_type: 'SUPPLIER',
        available_balance: '0',
        locked_balance: '0',
        currency: 'INR',
        country: comp.country || 'United States',
        updated_at: new Date().toISOString()
      });
    }
    return merged;
  }, [state]);

  const [supplierDirectorySearch, setSupplierDirectorySearch] = useState<string>('');
  const filteredSupplierDirectory = useMemo(() => {
    const q = supplierDirectorySearch.trim().toLowerCase();
    if (!q) return supplierWallets;
    return supplierWallets.filter(
      s =>
        s.company_name.toLowerCase().includes(q) ||
        s.entity_name.toLowerCase().includes(q) ||
        (s.country || '').toLowerCase().includes(q) ||
        s.entity_id.toLowerCase().includes(q)
    );
  }, [supplierWallets, supplierDirectorySearch]);

  const platformWallet = useMemo(
    () => (state?.wallets || []).find(w => w.wallet_type === 'PLATFORM_REVENUE'),
    [state]
  );

  const lockedOrders = useMemo(
    () => (state?.orders || []).filter(o => {
      if (o.status !== 'LOCKED_IN_ESCROW') return false;
      if (isAdmin) return true;
      if (!currentUser) return false;
      // Show order if user is buyer or supplier
      return o.buyer_id === currentUser.id || o.supplier_id === currentUser.id || o.buyer_id.includes(currentUser.id) || o.supplier_id.includes(currentUser.id);
    }),
    [state, isAdmin, currentUser]
  );

  // Format paise in the active entity's native country currency
  const defaultEntityTarget = currentUser?.id || currentUser?.companyName || 'buyer-titan-01';
  const formatAmount = (paiseVal: string | number | bigint, entityTarget?: string): string => {
    return formatBalanceInNativeCurrency(paiseVal, entityTarget || defaultEntityTarget).nativeAmount;
  };

  // Aggregate metrics
  const metrics = useMemo(() => {
    if (!state) {
      return {
        totalBuyerAvailablePaise: 0,
        totalLockedEscrowPaise: 0,
        totalSupplierAvailablePaise: 0,
        platformRevenuePaise: 0
      };
    }
    let totalBuyerAvailablePaise = 0;
    let totalLockedEscrowPaise = 0;
    let totalSupplierAvailablePaise = 0;
    let platformRevenuePaise = 0;

    state.wallets.forEach(w => {
      // Privacy Gating: Non-admins only aggregate their own wallet data
      if (!isAdmin && currentUser) {
        const isOwnWallet = w.entity_id === currentUser.id || 
                           w.entity_id.includes(currentUser.id) || 
                           w.company_name === currentUser.companyName ||
                           (currentUser.companyName && w.company_name.toLowerCase().includes(currentUser.companyName.toLowerCase()));
        
        if (!isOwnWallet) return;
      }

      const avail = Number(w.available_balance || 0);
      const locked = Number(w.locked_balance || 0);
      totalLockedEscrowPaise += locked;
      if (w.wallet_type === 'BUYER') totalBuyerAvailablePaise += avail;
      if (w.wallet_type === 'SUPPLIER') totalSupplierAvailablePaise += avail;
      if (w.wallet_type === 'PLATFORM_REVENUE') platformRevenuePaise += avail;
    });

    return {
      totalBuyerAvailablePaise,
      totalLockedEscrowPaise,
      totalSupplierAvailablePaise,
      platformRevenuePaise
    };
  }, [state, isAdmin, currentUser]);

  // Auto-populate Stage 3 fields when selecting a locked order
  const handleSelectLockedOrder = (orderId: string) => {
    setReleaseOrderId(orderId);
    const found = (state?.orders || []).find(o => o.order_id === orderId);
    if (found) {
      setReleaseBuyerId(found.buyer_id);
      setReleaseSupplierId(found.supplier_id);
      const localVal = paiseToLocalAmount(found.total_amount_paise, found.buyer_id);
      setReleaseTotalAmountInr(String(Number(localVal.toFixed(2))));
    }
  };

  // Stage 1 Handler: creditBuyerDeposit
  const handleCreditDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const localAmt = parseFloat(topupAmountInr);
    if (isNaN(localAmt) || localAmt <= 0) {
      setFeedback({
        type: 'error',
        title: 'Invalid Deposit Amount',
        message: 'Please enter a valid positive deposit amount.'
      });
      return;
    }
    const amountPaise = localAmountToPaise(localAmt, topupBuyerId);
    setSubmitting(true);
    try {
      const updated = await tradeHeavenMediationService.creditBuyerDeposit(
        topupBuyerId,
        amountPaise,
        topupGatewayTxId.trim() || `GW-RZP-${Date.now()}`
      );
      setState(updated);
      setTopupGatewayTxId(`GW-RZP-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setFeedback({
        type: 'success',
        title: 'Buyer Deposit Credited (WALLET_TOPUP)',
        message: `Credited ${formatAmount(amountPaise, topupBuyerId)} to buyer wallet ${topupBuyerId}.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Transaction Rolled Back',
        message: err?.message || 'Could not credit buyer deposit.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 2 Handler: lockOrderFundsInEscrow
  const handleLockEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (lockSupplierId === 'comp-zac-importation-fadetech') {
      setFeedback({
        type: 'error',
        title: 'Direct On-Site Transfer Not Active',
        message: 'Direct on-site fund transfer is not active for IMPORTATION FADE-TECH (OTEC LTD). Please contact the supplier directly for it.'
      });
      return;
    }
    const localAmt = parseFloat(lockAmountInr);
    if (isNaN(localAmt) || localAmt <= 0) {
      setFeedback({
        type: 'error',
        title: 'Invalid Order Amount',
        message: 'Please enter a positive order amount to lock in escrow.'
      });
      return;
    }
    const totalAmountPaise = localAmountToPaise(localAmt, lockBuyerId);
    setSubmitting(true);
    try {
      const updated = await tradeHeavenMediationService.lockOrderFundsInEscrow(
        lockBuyerId,
        lockOrderId.trim() || `ORD-ESC-${Date.now().toString().slice(-5)}`,
        totalAmountPaise,
        lockSupplierId,
        lockProductTitle
      );
      setState(updated);
      setFeedback({
        type: 'success',
        title: 'Order Funds Locked in Escrow (ORDER_LOCK_ESCROW)',
        message: `Moved ${formatAmount(totalAmountPaise, lockBuyerId)} from ${lockBuyerId} available_balance into locked_balance for order ${lockOrderId}.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Escrow Lock Rolled Back',
        message: err?.message || 'Insufficient available wallet funds to lock in escrow.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 3 Handler: releaseEscrowToSupplier
  const handleReleaseEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (releaseSupplierId === 'comp-zac-importation-fadetech') {
      setFeedback({
        type: 'error',
        title: 'Direct On-Site Transfer Not Active',
        message: 'Direct on-site fund transfer is not active for IMPORTATION FADE-TECH (OTEC LTD). Please contact the supplier directly for it.'
      });
      return;
    }
    const totalLocal = parseFloat(releaseTotalAmountInr);
    const feePct = parseFloat(releaseFeePercent);
    if (isNaN(totalLocal) || totalLocal <= 0) {
      setFeedback({
        type: 'error',
        title: 'Invalid Settlement Amount',
        message: 'Please enter a positive total settlement amount.'
      });
      return;
    }
    const totalAmountPaise = localAmountToPaise(totalLocal, releaseBuyerId);
    const platformFeePaise = Math.round(totalAmountPaise * ((isNaN(feePct) ? 2.5 : feePct) / 100));
    const netSupplierPaise = totalAmountPaise - platformFeePaise;

    setSubmitting(true);
    try {
      const updated = await tradeHeavenMediationService.releaseEscrowToSupplier({
        orderId: releaseOrderId.trim(),
        buyerId: releaseBuyerId,
        supplierId: releaseSupplierId,
        totalAmountPaise,
        platformFeePaise
      });
      setState(updated);
      setFeedback({
        type: 'success',
        title: 'Serializable Mediated Settlement Committed (ESCROW_RELEASE + PLATFORM_FEE)',
        message: `Settled ${releaseOrderId}: Net ${formatAmount(netSupplierPaise, releaseSupplierId)} credited to supplier (${releaseSupplierId}) and ${formatAmount(platformFeePaise, releaseBuyerId)} platform commission credited to Trade Heaven Treasury.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Serializable Settlement Rolled Back',
        message: err?.message || 'Locked balance is less than settlement amount.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 4 Handler: requestBankPayout
  const handleBankPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const localAmt = parseFloat(payoutAmountInr);
    if (isNaN(localAmt) || localAmt <= 0) {
      setFeedback({
        type: 'error',
        title: 'Invalid Withdrawal Amount',
        message: 'Please enter a positive withdrawal amount.'
      });
      return;
    }
    const amountPaise = localAmountToPaise(localAmt, payoutEntityId);
    setSubmitting(true);
    try {
      const { payoutResult, state: updated } = await tradeHeavenMediationService.requestBankPayout(
        payoutEntityId,
        amountPaise,
        {
          accountHolderName: beneficiaryName,
          accountNumber: beneficiaryAccount,
          ifscOrSwift: beneficiaryIfsc,
          bankName: beneficiaryBank,
          rail: beneficiaryRail
        }
      );
      setState(updated);
      setLastPayoutResult(payoutResult);
      setFeedback({
        type: 'success',
        title: `Bank Payout ${payoutResult.status} (${payoutResult.payoutId})`,
        message: `Withdrew ${formatAmount(amountPaise, payoutEntityId)} from ${payoutEntityId} via ${beneficiaryRail} to ${beneficiaryBank} (${beneficiaryAccount}).`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Bank Withdrawal Rolled Back',
        message: err?.message || 'Insufficient funds available for bank withdrawal.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered ledger entries
  const filteredLedger = useMemo(() => {
    let list = state?.ledgerEntries || [];
    
    // Privacy Gating: Non-admins only see their own transactions
    if (!isAdmin && currentUser) {
      list = list.filter(entry => {
        const srcWallet = entry.source_wallet_id ? state?.wallets.find(w => w.id === entry.source_wallet_id) : null;
        const dstWallet = entry.destination_wallet_id ? state?.wallets.find(w => w.id === entry.destination_wallet_id) : null;
        
        const isRelatedToUser = 
          (srcWallet && (srcWallet.entity_id === currentUser.id || srcWallet.entity_id.includes(currentUser.id) || srcWallet.company_name === currentUser.companyName)) ||
          (dstWallet && (dstWallet.entity_id === currentUser.id || dstWallet.entity_id.includes(currentUser.id) || dstWallet.company_name === currentUser.companyName));
          
        return isRelatedToUser;
      });
    }

    if (ledgerFilter === 'ALL') return list;
    return list.filter(entry => entry.transaction_type === ledgerFilter);
  }, [state, ledgerFilter, isAdmin, currentUser]);

  // Filtered wallets
  const filteredWallets = useMemo(() => {
    let list = state?.wallets || [];

    // Privacy Gating: Non-admins only see their own wallets in the table
    if (!isAdmin && currentUser) {
      list = list.filter(w => 
        w.entity_id === currentUser.id || 
        w.entity_id.includes(currentUser.id) || 
        w.company_name === currentUser.companyName ||
        (currentUser.companyName && w.company_name.toLowerCase().includes(currentUser.companyName.toLowerCase()))
      );
    }

    const q = walletSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      w =>
        w.company_name.toLowerCase().includes(q) ||
        w.entity_name.toLowerCase().includes(q) ||
        w.entity_id.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
    );
  }, [state, walletSearch, isAdmin, currentUser]);

  const resolveWalletLabel = (walletId: string | null) => {
    if (!walletId) return 'External Gateway / Bank Rail';
    const w = state?.wallets.find(item => item.id === walletId);
    if (!w) return walletId;
    return `${w.company_name} (${w.id})`;
  };

  const handleExportLedgerCsv = () => {
    if (!state?.ledgerEntries.length) return;
    const headers = [
      'Entry ID',
      'Reference ID',
      'Transaction Type',
      'Source Wallet',
      'Destination Wallet',
      'Amount (Paise)',
      'Amount (INR)',
      'Notes',
      'Created At'
    ];
    const rows = state.ledgerEntries.map(e => [
      e.id,
      e.reference_id,
      e.transaction_type,
      e.source_wallet_id || 'EXTERNAL_SOURCE',
      e.destination_wallet_id || 'EXTERNAL_BANK',
      e.amount,
      (Number(e.amount) / 100).toFixed(2),
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.created_at
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tradeheaven_mediation_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const feePaisePreview = useMemo(() => {
    const totalPaise = localAmountToPaise(parseFloat(releaseTotalAmountInr) || 0, releaseBuyerId);
    const pct = parseFloat(releaseFeePercent) || 0;
    const fee = Math.round(totalPaise * (pct / 100));
    return {
      totalPaise,
      feePaise: fee,
      netPaise: Math.max(0, totalPaise - fee)
    };
  }, [releaseTotalAmountInr, releaseFeePercent, releaseBuyerId]);

  return (
    <div className={embedded ? 'space-y-8' : 'bg-slate-50 min-h-screen py-10'}>
      <div className={embedded ? 'space-y-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8'}>
        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <ShieldCheck className="w-4 h-4" />
              <span>TradeHeavenMediatorEngine</span>
              <span aria-hidden="true">·</span>
              <span>ACID Double-Entry Escrow &amp; Settlement Rails</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Escrow Mediation, Wallet Custody &amp; Bank Payout Engine
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Execute atomic PostgreSQL row-locked wallet top-ups, order escrow holds, serializable supplier settlements with automated platform fee splits, and direct IMPS/NEFT/SWIFT bank withdrawals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Country Native Currency Indicator */}
            <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>{getEntityCurrency(defaultEntityTarget).flag}</span>
              <span>Native Country Currency ({getEntityCurrency(defaultEntityTarget).currency})</span>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowSqlInspector(prev => !prev)}
                className={`h-9 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showSqlInspector
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>SQL Inspector ({state?.sqlLogs?.length || 0})</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadMediationState}
              disabled={loading}
              className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top-Level Segmented Tab Bar (when standalone) */}
        {!embedded && (
          <div className="bg-white border border-slate-200 rounded-xl p-1.5 overflow-x-auto">
            <div role="tablist" aria-label="Mediation Engine Views" className="flex items-center gap-1 min-w-max">
              <button
                role="tab"
                aria-selected={activeSectionTab === 'WORKBENCH'}
                type="button"
                onClick={() => setActiveSectionTab('WORKBENCH')}
                className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSectionTab === 'WORKBENCH'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 shrink-0 ${activeSectionTab === 'WORKBENCH' ? 'text-white' : 'text-slate-400'}`} />
                <span>Escrow Mediation Workbench</span>
              </button>

              <button
                role="tab"
                aria-selected={activeSectionTab === 'TOPUP_SIMULATOR'}
                type="button"
                onClick={() => setActiveSectionTab('TOPUP_SIMULATOR')}
                className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSectionTab === 'TOPUP_SIMULATOR'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <CreditCard className={`w-3.5 h-3.5 shrink-0 ${activeSectionTab === 'TOPUP_SIMULATOR' ? 'text-white' : 'text-slate-400'}`} />
                <span>Top-Up Wallet (Gateway Deposit)</span>
              </button>

              <button
                role="tab"
                aria-selected={activeSectionTab === 'LEDGER_VIEW'}
                type="button"
                onClick={() => setActiveSectionTab('LEDGER_VIEW')}
                className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSectionTab === 'LEDGER_VIEW'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <BookOpen className={`w-3.5 h-3.5 shrink-0 ${activeSectionTab === 'LEDGER_VIEW' ? 'text-white' : 'text-slate-400'}`} />
                <span>Transaction Ledger ({state?.ledgerEntries?.length || 0})</span>
              </button>
            </div>
          </div>
        )}

        {!embedded && activeSectionTab === 'TOPUP_SIMULATOR' && (
          <TopUpWallet
            onSuccess={updated => setState(updated)}
            onNavigateToFullEngine={() => {
              setActiveSectionTab('WORKBENCH');
              setActiveStage('LOCK_ESCROW');
            }}
          />
        )}

        {!embedded && activeSectionTab === 'LEDGER_VIEW' && (
          <TransactionLedgerView
            onNavigateToTopUp={() => setActiveSectionTab('TOPUP_SIMULATOR')}
            onNavigateToMediationEngine={() => setActiveSectionTab('WORKBENCH')}
          />
        )}

        {(embedded || activeSectionTab === 'WORKBENCH') && (
          <>
            {/* Treasury & Escrow Summary Metrics */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              {(isAdmin || currentUser?.role === 'BUYER') && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{isAdmin ? 'Total Buyer Available Liquidity' : 'Your Available Balance'}</span>
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {formatAmount(metrics.totalBuyerAvailablePaise)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isAdmin ? `${buyerWallets.length} active buyer wallets · Ready for escrow lock` : 'Funds available for trade protection & settlements'}
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{isAdmin ? 'Total Locked in Escrow' : 'Your Funds in Escrow'}</span>
                  <Lock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {formatAmount(metrics.totalLockedEscrowPaise)}
                </div>
                <div className="text-xs text-slate-500">
                  {isAdmin ? `${lockedOrders.length} active mediated orders · Held under FOR UPDATE lock` : `${lockedOrders.length} active mediated contracts held in neutral custody`}
                </div>
              </div>

              {(isAdmin || currentUser?.role === 'SUPPLIER') && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{isAdmin ? 'Total Supplier Settled Balance' : 'Your Settled Balance'}</span>
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {formatAmount(metrics.totalSupplierAvailablePaise)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isAdmin ? `${supplierWallets.length} verified suppliers · Available for bank withdrawal` : 'Cleared funds ready for bank withdrawal'}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Platform Revenue Vault</span>
                    <Landmark className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {formatAmount(metrics.platformRevenuePaise)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Wallet ID: <span className="font-mono">{platformWallet?.id || 'wal-platform-rev'}</span>
                  </div>
                </div>
              )}
            </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${
              feedback.type === 'success'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-red-50/70 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-sm font-semibold">{feedback.title}</div>
                <div className="text-xs mt-0.5 opacity-90">{feedback.message}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-semibold underline opacity-75 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SQL Transaction Log Inspector (Admin Only) */}
        {isAdmin && showSqlInspector && (
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  PostgreSQL Transaction &amp; Row-Level Lock Inspector
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time execution log of BEGIN, SELECT ... FOR UPDATE, SERIALIZABLE isolation, and COMMIT/ROLLBACK statements
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {(state?.sqlLogs || []).length} transactions recorded
              </span>
            </div>

            {(state?.sqlLogs || []).length === 0 ? (
              <div className="text-xs text-slate-400 py-4">
                Execute any mediation stage below (Top-Up, Lock Escrow, Release Settlement, or Bank Payout) to inspect the live SQL transaction queries.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(state?.sqlLogs || []).map(tx => (
                  <div
                    key={tx.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-blue-400 font-semibold">{tx.operation}()</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">Isolation: {tx.isolationLevel}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span
                          className={
                            tx.status === 'COMMITTED' ? 'text-emerald-400' : 'text-red-400'
                          }
                        >
                          {tx.status}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {tx.queries.join('\n')}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main 4-Stage Mediation Engine Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Columns: 4-Stage Interactive Execution Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                4-Stage Mediation Workflow Execution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a lifecycle operation to execute against the wallet &amp; ledger tables
              </p>
            </div>

            {/* Interactive Stage Selector Tabs */}
            <div role="tablist" aria-label="Mediation Stages" className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                role="tab"
                aria-selected={activeStage === 'TOPUP'}
                type="button"
                onClick={() => setActiveStage('TOPUP')}
                className={`px-3 py-2 text-left rounded-lg transition-colors cursor-pointer ${
                  activeStage === 'TOPUP'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-[11px] font-semibold text-blue-600">01. Top-Up Deposit</div>
                <div className="text-xs font-semibold text-slate-700 truncate">Credit Buyer Wallet</div>
              </button>

              <button
                role="tab"
                aria-selected={activeStage === 'LOCK_ESCROW'}
                type="button"
                onClick={() => setActiveStage('LOCK_ESCROW')}
                className={`px-3 py-2 text-left rounded-lg transition-colors cursor-pointer ${
                  activeStage === 'LOCK_ESCROW'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-[11px] font-semibold text-amber-600">02. Hold in Escrow</div>
                <div className="text-xs font-semibold text-slate-700 truncate">Lock Order Funds</div>
              </button>

              <button
                role="tab"
                aria-selected={activeStage === 'RELEASE_SETTLEMENT'}
                type="button"
                onClick={() => setActiveStage('RELEASE_SETTLEMENT')}
                className={`px-3 py-2 text-left rounded-lg transition-colors cursor-pointer ${
                  activeStage === 'RELEASE_SETTLEMENT'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-[11px] font-semibold text-emerald-600">03. Settlement</div>
                <div className="text-xs font-semibold text-slate-700 truncate">Release to Supplier</div>
              </button>

              <button
                role="tab"
                aria-selected={activeStage === 'BANK_PAYOUT'}
                type="button"
                onClick={() => setActiveStage('BANK_PAYOUT')}
                className={`px-3 py-2 text-left rounded-lg transition-colors cursor-pointer ${
                  activeStage === 'BANK_PAYOUT'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-[11px] font-semibold text-indigo-600">04. Bank Payout</div>
                <div className="text-xs font-semibold text-slate-700 truncate">Withdraw to Bank</div>
              </button>
            </div>

            {/* STAGE 1 FORM: creditBuyerDeposit */}
            {activeStage === 'TOPUP' && (
              <form onSubmit={handleCreditDeposit} className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    01. Buyer Wallet Top-Up (creditBuyerDeposit)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Locks the buyer wallet row (`FOR UPDATE`), increments `available_balance`, and records a `WALLET_TOPUP` ledger entry.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer Entity (`buyerId`)
                  </label>
                  <select
                    value={topupBuyerId}
                    onChange={e => setTopupBuyerId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {buyerWallets.map(w => {
                      const native = formatBalanceInNativeCurrency(w.available_balance, w.entity_id);
                      return (
                        <option key={w.id} value={w.entity_id}>
                          {native.flag} {w.company_name} ({native.country}) — Avail: {native.nativeAmount}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deposit Amount ({getEntityCurrency(topupBuyerId).currency} {getEntityCurrency(topupBuyerId).symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={topupAmountInr}
                      onChange={e => setTopupAmountInr(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      {getEntityCurrency(topupBuyerId).flag} {getEntityCurrency(topupBuyerId).country} ({getEntityCurrency(topupBuyerId).currency})
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gateway Webhook Reference (`gatewayTxId`)
                    </label>
                    <input
                      type="text"
                      value={topupGatewayTxId}
                      onChange={e => setTopupGatewayTxId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-500 mr-1">Quick Add:</span>
                  {[1000, 5000, 10000, 25000].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopupAmountInr(String(preset))}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-[11px] font-mono font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      +{formatLocalAmount(preset, topupBuyerId, 0)}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{submitting ? 'Committing Top-Up...' : 'Credit Buyer Wallet Deposit (Funds Top-Up)'}</span>
                </button>
              </form>
            )}

            {/* STAGE 2 FORM: lockOrderFundsInEscrow */}
            {activeStage === 'LOCK_ESCROW' && (
              <form onSubmit={handleLockEscrow} className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    02. Hold in Mediation (lockOrderFundsInEscrow)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verifies `BigInt(available_balance) &gt;= BigInt(totalAmountPaise)`, moves funds from `available_balance` to `locked_balance`, and writes `ORDER_LOCK_ESCROW`.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer Wallet (`buyerId`)
                  </label>
                  <select
                    value={lockBuyerId}
                    onChange={e => setLockBuyerId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {buyerWallets.map(w => {
                      const native = formatBalanceInNativeCurrency(w.available_balance, w.entity_id);
                      return (
                        <option key={w.id} value={w.entity_id}>
                          {native.flag} {w.company_name} ({native.country}) — Avail: {native.nativeAmount}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Order Reference ID (`orderId`)
                    </label>
                    <input
                      type="text"
                      value={lockOrderId}
                      onChange={e => setLockOrderId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Escrow Lock Amount ({getEntityCurrency(lockBuyerId).currency} {getEntityCurrency(lockBuyerId).symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={lockAmountInr}
                      onChange={e => setLockAmountInr(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      {getEntityCurrency(lockBuyerId).flag} {getEntityCurrency(lockBuyerId).country} ({getEntityCurrency(lockBuyerId).currency})
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Counterparty Supplier (`supplierId`)
                  </label>
                  <select
                    value={lockSupplierId}
                    onChange={e => setLockSupplierId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {supplierWallets.map(w => {
                      const info = getEntityCurrency(w.entity_id);
                      const isZacBasic = w.entity_id === 'comp-zac-importation-fadetech';
                      return (
                        <option key={w.id} value={w.entity_id}>
                          {info.flag} {w.company_name} ({info.country} - {info.currency}){' '}
                          {isZacBasic ? '— [Not Active • Contact Supplier]' : '— [Direct Transfer Active]'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contract Commodity / Description
                  </label>
                  <input
                    type="text"
                    value={lockProductTitle}
                    onChange={e => setLockProductTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{submitting ? 'Locking Funds...' : 'Lock Order Funds in Escrow'}</span>
                </button>
              </form>
            )}

            {/* STAGE 3 FORM: releaseEscrowToSupplier */}
            {activeStage === 'RELEASE_SETTLEMENT' && (
              <form onSubmit={handleReleaseEscrow} className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    03. Mediated Settlement (releaseEscrowToSupplier)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Runs under `SERIALIZABLE` isolation: deducts buyer `locked_balance`, credits net payout to supplier, and credits commission to `PLATFORM_REVENUE`.
                  </p>
                </div>

                {lockedOrders.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quick-Fill from Active Locked Escrow Order
                    </label>
                    <select
                      value={releaseOrderId}
                      onChange={e => handleSelectLockedOrder(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      {lockedOrders.map(o => (
                        <option key={o.order_id} value={o.order_id}>
                          {o.order_id} · {formatAmount(o.total_amount_paise)} · {o.product_title.slice(0, 38)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Order ID (`orderId`)
                    </label>
                    <input
                      type="text"
                      value={releaseOrderId}
                      onChange={e => setReleaseOrderId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Buyer Entity (`buyerId`)
                    </label>
                    <select
                      value={releaseBuyerId}
                      onChange={e => setReleaseBuyerId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      {buyerWallets.map(w => {
                        const native = formatBalanceInNativeCurrency(w.locked_balance, w.entity_id);
                        return (
                          <option key={w.id} value={w.entity_id}>
                            {native.flag} {w.company_name} ({native.country}) — Locked: {native.nativeAmount}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beneficiary Supplier (`supplierId`)
                  </label>
                  <select
                    value={releaseSupplierId}
                    onChange={e => setReleaseSupplierId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {supplierWallets.map(w => {
                      const isZacBasic = w.entity_id === 'comp-zac-importation-fadetech';
                      return (
                        <option key={w.id} value={w.entity_id}>
                          {w.company_name} ({w.entity_id}){' '}
                          {isZacBasic ? '— [Not Active • Contact Supplier]' : '— [Direct Transfer Active]'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Settlement ({getEntityCurrency(releaseBuyerId).currency} {getEntityCurrency(releaseBuyerId).symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={releaseTotalAmountInr}
                      onChange={e => setReleaseTotalAmountInr(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      step="0.1"
                      value={releaseFeePercent}
                      onChange={e => setReleaseFeePercent(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                {/* Settlement Split Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Buyer Locked Deduction ({getEntityCurrency(releaseBuyerId).currency}):</span>
                    <span className="font-mono font-semibold text-slate-900">
                      -{formatAmount(feePaisePreview.totalPaise, releaseBuyerId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Net Supplier Payout ({getEntityCurrency(releaseSupplierId).currency}):</span>
                    <span className="font-mono font-semibold">
                      +{formatAmount(feePaisePreview.netPaise, releaseSupplierId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-indigo-700">
                    <span>Trade Heaven Fee (`PLATFORM_FEE`):</span>
                    <span className="font-mono font-semibold">
                      +{formatAmount(feePaisePreview.feePaise, releaseBuyerId)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Settling Escrow...' : 'Release Escrow & Settle Supplier'}</span>
                </button>
              </form>
            )}

            {/* STAGE 4 FORM: requestBankPayout */}
            {activeStage === 'BANK_PAYOUT' && (
              <form onSubmit={handleBankPayout} className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    04. Real Bank Withdrawal (requestBankPayout)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deducts `available_balance` before invoking `bankRails.sendPayout()`, then writes `SUPPLIER_PAYOUT` with the returned `payoutId`.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wallet Entity (`entityId`)
                  </label>
                  <select
                    value={payoutEntityId}
                    onChange={e => {
                      setPayoutEntityId(e.target.value);
                      const found = state?.wallets.find(w => w.entity_id === e.target.value);
                      if (found) setBeneficiaryName(found.company_name);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {(state?.wallets || [])
                      .filter(w => w.wallet_type !== 'PLATFORM_REVENUE')
                      .map(w => {
                        const native = formatBalanceInNativeCurrency(w.available_balance, w.entity_id);
                        return (
                          <option key={w.id} value={w.entity_id}>
                            {native.flag} [{w.wallet_type}] {w.company_name} ({native.country}) — Avail: {native.nativeAmount}
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Withdrawal Amount ({getEntityCurrency(payoutEntityId).currency} {getEntityCurrency(payoutEntityId).symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={payoutAmountInr}
                      onChange={e => setPayoutAmountInr(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Banking Partner Rail
                    </label>
                    <select
                      value={beneficiaryRail}
                      onChange={e => setBeneficiaryRail(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="IMPS">IMPS (Instant Settled)</option>
                      <option value="NEFT">NEFT (Batch Initiated)</option>
                      <option value="RTGS">RTGS (High-Value Treasury)</option>
                      <option value="SWIFT">SWIFT (Cross-Border Wire)</option>
                      <option value="ACH">ACH (US Clearing House)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Beneficiary Account / IBAN
                    </label>
                    <input
                      type="text"
                      value={beneficiaryAccount}
                      onChange={e => setBeneficiaryAccount(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      IFSC / SWIFT BIC
                    </label>
                    <input
                      type="text"
                      value={beneficiaryIfsc}
                      onChange={e => setBeneficiaryIfsc(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Receiving Bank Name
                  </label>
                  <input
                    type="text"
                    value={beneficiaryBank}
                    onChange={e => setBeneficiaryBank(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                {lastPayoutResult && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono flex items-center justify-between">
                    <span className="text-slate-600">Last BankTransferResult:</span>
                    <span className="text-slate-900 font-semibold">
                      {lastPayoutResult.payoutId} · {lastPayoutResult.status}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{submitting ? 'Dispatching Bank Payout...' : 'Initiate Bank Withdrawal'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right 7 Columns: Live Wallets Table & Active Escrow Contracts */}
          <div className="lg:col-span-7 space-y-6">
            {/* Wallets Table (`wallets`) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Custodial Wallets Table (`wallets`)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Row-locked balances stored in integer paise (`BigInt` safe) across Buyer, Supplier, and Platform Revenue accounts
                  </p>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={walletSearch}
                    onChange={e => setWalletSearch(e.target.value)}
                    placeholder="Filter wallets..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 pr-4">Entity / Country</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 text-right">Available Balance (Native)</th>
                      <th className="py-2.5 px-3 text-right">Locked in Escrow</th>
                      <th className="py-2.5 pl-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredWallets.map((w: WalletRecord) => {
                      const entityCurrency = getEntityCurrency(w.entity_id);
                      const availNative = formatBalanceInNativeCurrency(w.available_balance, w.entity_id);
                      const lockedNative = formatBalanceInNativeCurrency(w.locked_balance, w.entity_id);
                      const isLockedPositive = Number(w.locked_balance) > 0;
                      return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="text-base shrink-0">{entityCurrency.flag}</span>
                            <span className="truncate">{w.company_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{w.id}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{w.entity_id}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-slate-600">
                              {entityCurrency.country} ({entityCurrency.currency})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              w.wallet_type === 'BUYER'
                                ? 'text-blue-600'
                                : w.wallet_type === 'SUPPLIER'
                                ? 'text-emerald-600'
                                : 'text-indigo-600'
                            }`}
                          >
                            {w.wallet_type === 'PLATFORM_REVENUE' ? 'TREASURY' : w.wallet_type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          <div className="font-mono font-bold text-slate-900">
                            {availNative.nativeAmount}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {availNative.inrAmount}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          {isLockedPositive ? (
                            <div>
                              <div className="font-mono font-bold text-amber-700">
                                {lockedNative.nativeAmount}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {lockedNative.inrAmount}
                              </div>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {w.wallet_type === 'BUYER' && (
                            <button
                              type="button"
                              onClick={() => {
                                setTopupBuyerId(w.entity_id);
                                setActiveStage('TOPUP');
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              Top-Up
                            </button>
                          )}
                          {w.wallet_type === 'SUPPLIER' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPayoutEntityId(w.entity_id);
                                setBeneficiaryName(w.company_name);
                                setActiveStage('BANK_PAYOUT');
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              Withdraw
                            </button>
                          )}
                          {w.wallet_type === 'PLATFORM_REVENUE' && (
                            <span className="text-[11px] text-slate-400">Treasury</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Directory of All Portal Suppliers Whom Buyers Can Pay (No Balances Shown) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      All Portal Suppliers — Direct Pay &amp; Escrow Directory ({supplierWallets.length})
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any verified supplier on the portal below to directly lock order funds in escrow or release settlement payment
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supplierDirectorySearch}
                    onChange={e => setSupplierDirectorySearch(e.target.value)}
                    placeholder="Search supplier name or country..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl px-4 bg-slate-50/40">
                {filteredSupplierDirectory.slice(0, 60).map(supp => {
                  const info = getEntityCurrency(supp);
                  const isSelectedLock = lockSupplierId === supp.entity_id && activeStage === 'LOCK_ESCROW';
                  const isSelectedRelease = releaseSupplierId === supp.entity_id && activeStage === 'RELEASE_SETTLEMENT';
                  return (
                    <div
                      key={supp.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span className="text-base shrink-0">{info.flag}</span>
                          <span className="truncate">{supp.company_name}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            VERIFIED SUPPLIER
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{supp.entity_name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{supp.country || info.country} ({info.currency})</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[10px] text-slate-400">{supp.entity_id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setLockSupplierId(supp.entity_id);
                            setLockProductTitle(`Commercial Supply Order — ${supp.company_name}`);
                            setActiveStage('LOCK_ESCROW');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelectedLock
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{isSelectedLock ? 'Selected for Escrow' : 'Lock Escrow'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReleaseSupplierId(supp.entity_id);
                            setActiveStage('RELEASE_SETTLEMENT');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelectedRelease
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-900 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>{isSelectedRelease ? 'Selected to Pay' : 'Pay Supplier'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredSupplierDirectory.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No suppliers match your search filter.
                  </div>
                )}
              </div>
            </div>

            {/* Mediated Escrow Orders Pipeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Active Mediated Contracts &amp; Escrow Holds
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any locked contract to pre-fill Stage 03 (`releaseEscrowToSupplier`) or pending contract for Stage 02 (`lockOrderFundsInEscrow`)
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {(state?.orders || []).map(order => (
                  <div
                    key={order.order_id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-800">{order.order_id}</span>
                        <span aria-hidden="true">·</span>
                        <span>Incoterm {order.incoterm}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            order.status === 'LOCKED_IN_ESCROW'
                              ? 'text-amber-700 font-semibold'
                              : order.status === 'SETTLED_TO_SUPPLIER'
                              ? 'text-emerald-700 font-semibold'
                              : 'text-slate-600 font-semibold'
                          }
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {order.product_title}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span>Buyer: {order.buyer_name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>Supplier: {order.supplier_name}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                          {formatBalanceInNativeCurrency(order.total_amount_paise, order.buyer_id).nativeAmount}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {formatBalanceInNativeCurrency(order.total_amount_paise, order.buyer_id).inrAmount}
                        </div>
                      </div>
                      {order.status === 'LOCKED_IN_ESCROW' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectLockedOrder(order.order_id);
                            setActiveStage('RELEASE_SETTLEMENT');
                          }}
                          className="h-7 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Release &amp; Settle
                        </button>
                      )}
                      {order.status === 'PENDING_LOCK' && (
                        <button
                          type="button"
                          onClick={() => {
                            setLockBuyerId(order.buyer_id);
                            setLockSupplierId(order.supplier_id);
                            setLockOrderId(order.order_id);
                            setLockProductTitle(order.product_title);
                            setLockAmountInr(String(Number(paiseToLocalAmount(order.total_amount_paise, order.buyer_id).toFixed(2))));
                            setActiveStage('LOCK_ESCROW');
                          }}
                          className="h-7 px-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Lock Escrow Funds
                        </button>
                      )}
                      {order.status === 'SETTLED_TO_SUPPLIER' && (
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Settled &amp; Audited
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Double-Entry Immutable Ledger Table (`ledger_entries`) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Immutable Double-Entry Ledger (`ledger_entries`)
              </h2>
              <p className="text-xs text-slate-500">
                Complete audit trail of all mediated wallet credits, escrow locks, supplier settlements, platform commissions, and bank payouts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Interactive Filter Controls */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {(
                  [
                    { id: 'ALL', label: 'All Entries' },
                    { id: 'WALLET_TOPUP', label: 'Top-Ups' },
                    { id: 'ORDER_LOCK_ESCROW', label: 'Escrow Locks' },
                    { id: 'ESCROW_RELEASE', label: 'Releases' },
                    { id: 'PLATFORM_FEE', label: 'Platform Fees' },
                    { id: 'SUPPLIER_PAYOUT', label: 'Bank Payouts' }
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLedgerFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      ledgerFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportLedgerCsv}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 pr-4">Ledger ID / Timestamp</th>
                  <th className="py-2.5 px-3">Reference ID</th>
                  <th className="py-2.5 px-3">Transaction Type</th>
                  <th className="py-2.5 px-3">Source Wallet</th>
                  <th className="py-2.5 px-3">Destination Wallet</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 pl-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLedger.map(entry => {
                  const dstW = entry.destination_wallet_id ? state?.wallets.find(w => w.id === entry.destination_wallet_id) : null;
                  const srcW = entry.source_wallet_id ? state?.wallets.find(w => w.id === entry.source_wallet_id) : null;
                  const targetW = dstW && dstW.wallet_type !== 'PLATFORM_REVENUE' ? dstW : srcW;
                  const rowNative = formatBalanceInNativeCurrency(entry.amount, targetW?.entity_id || defaultEntityTarget);
                  return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-mono font-semibold text-slate-900">{entry.id}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">{entry.reference_id}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono font-semibold text-[11px] ${
                          entry.transaction_type === 'WALLET_TOPUP'
                            ? 'text-blue-600'
                            : entry.transaction_type === 'ORDER_LOCK_ESCROW'
                            ? 'text-amber-600'
                            : entry.transaction_type === 'ESCROW_RELEASE'
                            ? 'text-emerald-600'
                            : entry.transaction_type === 'PLATFORM_FEE'
                            ? 'text-indigo-600'
                            : 'text-purple-600'
                        }`}
                      >
                        {entry.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                      {resolveWalletLabel(entry.source_wallet_id)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                      {resolveWalletLabel(entry.destination_wallet_id)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      <div>{rowNative.flag} {rowNative.nativeAmount}</div>
                      <div className="text-[10px] font-normal text-slate-400">{rowNative.secondary}</div>
                    </td>
                    <td className="py-3 pl-3 text-slate-500">{entry.notes}</td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradeHeavenMediatorView;
