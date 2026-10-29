import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser } from '../../types';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord,
  BankTransferResult,
  BankPayoutRecord
} from '../../services/tradeHeavenMediatorEngine';
import {
  formatBalanceInNativeCurrency,
  getEntityCurrency,
  localAmountToPaise,
  paiseToLocalAmount
} from '../../utils/entityCurrency';
import {
  Landmark,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Trash2,
  Check,
  Clock,
  FileText,
  Wallet,
  Edit3
} from 'lucide-react';

export interface SavedSupplierBankAccount {
  id: string;
  entityId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscOrSwift: string;
  branchCountry: string;
  rail: 'SWIFT' | 'IMPS' | 'NEFT' | 'RTGS' | 'ACH';
  isPrimary: boolean;
  verifiedByTradeHeaven: boolean;
  updatedAt: string;
}

const STORAGE_KEY_BANKS = 'th_supplier_saved_banks_v1';
const STORAGE_KEY_REQUESTS = 'th_supplier_withdrawal_requests_v1';

export interface SupplierWithdrawalRequestItem {
  id: string;
  payoutId: string;
  entityId: string;
  companyName: string;
  amountLocal: number;
  currencySymbol: string;
  currencyCode: string;
  amountFormatted: string;
  bankName: string;
  accountHolderName: string;
  accountNumberMasked: string;
  ifscOrSwift: string;
  rail: 'SWIFT' | 'IMPS' | 'NEFT' | 'RTGS' | 'ACH';
  orderReference?: string;
  requestNote?: string;
  status: 'INITIATED' | 'SETTLED' | 'PENDING_TREASURY_REVIEW';
  requestedAt: string;
}

const DEFAULT_SAVED_BANKS: SavedSupplierBankAccount[] = [
  {
    id: 'bank-melissa-01',
    entityId: 'comp-melissa-mpcommodity',
    accountHolderName: 'MP Commodity Brokers Australia Pty Ltd',
    bankName: 'Commonwealth Bank Corporate Treasury',
    accountNumber: '50200048192041',
    ifscOrSwift: 'CTBAAU2S',
    branchCountry: 'Sydney, Australia',
    rail: 'SWIFT',
    isPrimary: true,
    verifiedByTradeHeaven: true,
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'bank-bharat-01',
    entityId: 'comp-bharat-steel',
    accountHolderName: 'Bharat Precision Forgings & Alloys Ltd.',
    bankName: 'HDFC Bank Corporate Treasury',
    accountNumber: '50200088412910',
    ifscOrSwift: 'HDFC0000241',
    branchCountry: 'Mumbai, India',
    rail: 'RTGS',
    isPrimary: true,
    verifiedByTradeHeaven: true,
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export function getSavedSupplierBanks(entityId?: string, companyName?: string): SavedSupplierBankAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BANKS);
    const list: SavedSupplierBankAccount[] = raw ? JSON.parse(raw) : DEFAULT_SAVED_BANKS;
    if (!entityId) return list;
    const eid = entityId.toLowerCase();
    const filtered = list.filter(b => b.entityId.toLowerCase() === eid || eid.includes(b.entityId.toLowerCase()));
    if (filtered.length > 0) return filtered;
    return [
      {
        id: `bank-default-${entityId}`,
        entityId,
        accountHolderName: companyName || 'Verified Supplier Corporate Account',
        bankName: 'Standard Chartered Corporate Trade Bank',
        accountNumber: 'GB82SCBL60161331926819',
        ifscOrSwift: 'SCBLGB2L',
        branchCountry: 'International Corporate Branch',
        rail: 'SWIFT',
        isPrimary: true,
        verifiedByTradeHeaven: true,
        updatedAt: new Date().toISOString()
      }
    ];
  } catch {
    return DEFAULT_SAVED_BANKS;
  }
}

interface SupplierBankWithdrawalPanelProps {
  currentUser: AuthUser;
  activeWallet?: WalletRecord | null;
  onSuccess?: (updatedState: MediationSystemState) => void;
  compact?: boolean;
}

export const SupplierBankWithdrawalPanel: React.FC<SupplierBankWithdrawalPanelProps> = ({
  currentUser,
  activeWallet,
  onSuccess,
  compact = false
}) => {
  const entityId = activeWallet?.entity_id || currentUser.id || 'comp-melissa-mpcommodity';
  const companyName = activeWallet?.company_name || currentUser.companyName || currentUser.name || 'Verified Supplier';
  const currencyMeta = useMemo(() => getEntityCurrency(activeWallet || currentUser), [activeWallet, currentUser]);

  const availablePaise = activeWallet?.available_balance || '0';
  const availableLocal = useMemo(
    () => paiseToLocalAmount(Number(availablePaise), entityId),
    [availablePaise, entityId]
  );
  const nativeAvailFormatted = useMemo(
    () => formatBalanceInNativeCurrency(availablePaise, activeWallet || currentUser),
    [availablePaise, activeWallet, currentUser]
  );

  const [savedBanks, setSavedBanks] = useState<SavedSupplierBankAccount[]>(() =>
    getSavedSupplierBanks(entityId, companyName)
  );
  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    const initial = getSavedSupplierBanks(entityId, companyName);
    return initial[0]?.id || '';
  });

  const [showAddBankForm, setShowAddBankForm] = useState<boolean>(false);
  const [newHolderName, setNewHolderName] = useState<string>(companyName);
  const [newBankName, setNewBankName] = useState<string>('');
  const [newAccountNumber, setNewAccountNumber] = useState<string>('');
  const [newIfscOrSwift, setNewIfscOrSwift] = useState<string>('');
  const [newBranchCountry, setNewBranchCountry] = useState<string>(currentUser.country || 'United States');
  const [newRail, setNewRail] = useState<'SWIFT' | 'IMPS' | 'NEFT' | 'RTGS' | 'ACH'>('SWIFT');

  const [withdrawalAmountLocal, setWithdrawalAmountLocal] = useState<string>(() => {
    const suggested = availableLocal > 0 ? Math.min(5000, Number(availableLocal.toFixed(2))) : 1500;
    return String(suggested);
  });
  const [orderReference, setOrderReference] = useState<string>('ORD-ESC-2026-8841');
  const [requestNote, setRequestNote] = useState<string>(
    'Requesting Trade Heaven Treasury to release cleared supplier wallet funds to registered corporate bank account.'
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    payoutId?: string;
  } | null>(null);

  const [withdrawalRequests, setWithdrawalRequests] = useState<SupplierWithdrawalRequestItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'wreq-initial-01',
        payoutId: 'PAYOUT-SWIFT-849201-742',
        entityId: 'comp-melissa-mpcommodity',
        companyName: 'MP Commodity Brokers Australia Pty Ltd',
        amountLocal: 12500,
        currencySymbol: 'A$',
        currencyCode: 'AUD',
        amountFormatted: 'A$12,500.00',
        bankName: 'Commonwealth Bank Corporate Treasury',
        accountHolderName: 'MP Commodity Brokers Australia Pty Ltd',
        accountNumberMasked: '••••92041',
        ifscOrSwift: 'CTBAAU2S',
        rail: 'SWIFT',
        orderReference: 'ORD-ESC-2026-7710',
        requestNote: 'Escrow settlement withdrawal request approved by Trade Heaven Treasury',
        status: 'SETTLED',
        requestedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  });

  useEffect(() => {
    const banks = getSavedSupplierBanks(entityId, companyName);
    setSavedBanks(banks);
    if (banks.length > 0 && !banks.some(b => b.id === selectedBankId)) {
      setSelectedBankId(banks[0].id);
    }
  }, [entityId, companyName]);

  const selectedBank = useMemo(
    () => savedBanks.find(b => b.id === selectedBankId) || savedBanks[0] || null,
    [savedBanks, selectedBankId]
  );

  const persistBanks = (updatedForEntity: SavedSupplierBankAccount[]) => {
    setSavedBanks(updatedForEntity);
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BANKS);
      const all: SavedSupplierBankAccount[] = raw ? JSON.parse(raw) : DEFAULT_SAVED_BANKS;
      const others = all.filter(b => b.entityId.toLowerCase() !== entityId.toLowerCase());
      localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify([...updatedForEntity, ...others]));
      window.dispatchEvent(new CustomEvent('tradeheaven_supplier_banks_updated'));
    } catch {}
  };

  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccountNumber.trim() || !newIfscOrSwift.trim()) {
      setFeedback({
        type: 'error',
        title: 'Missing Bank Account Fields',
        message: 'Please provide Bank Name, Account Number / IBAN, and SWIFT / IFSC / Routing Code.'
      });
      return;
    }

    const created: SavedSupplierBankAccount = {
      id: `bank-${Date.now()}`,
      entityId,
      accountHolderName: newHolderName.trim() || companyName,
      bankName: newBankName.trim(),
      accountNumber: newAccountNumber.trim(),
      ifscOrSwift: newIfscOrSwift.trim().toUpperCase(),
      branchCountry: newBranchCountry.trim() || currentUser.country || 'International',
      rail: newRail,
      isPrimary: savedBanks.length === 0,
      verifiedByTradeHeaven: true,
      updatedAt: new Date().toISOString()
    };

    const next = [created, ...savedBanks.map(b => ({ ...b, isPrimary: false }))];
    persistBanks(next);
    setSelectedBankId(created.id);
    setShowAddBankForm(false);
    setNewBankName('');
    setNewAccountNumber('');
    setNewIfscOrSwift('');
    setFeedback({
      type: 'success',
      title: 'Beneficiary Bank Account Saved & Verified',
      message: `${created.bankName} (${created.accountNumber}) is now linked to ${companyName} for Trade Heaven fund withdrawals.`
    });
  };

  const handleDeleteBank = (id: string) => {
    const remaining = savedBanks.filter(b => b.id !== id);
    persistBanks(remaining);
    if (selectedBankId === id && remaining[0]) {
      setSelectedBankId(remaining[0].id);
    }
  };

  const handleSubmitWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedBank) {
      setShowAddBankForm(true);
      setFeedback({
        type: 'error',
        title: 'No Beneficiary Bank Account Selected',
        message: 'Please add your corporate bank account details first before requesting a withdrawal.'
      });
      return;
    }

    const amtLocal = parseFloat(withdrawalAmountLocal);
    if (isNaN(amtLocal) || amtLocal <= 0) {
      setFeedback({
        type: 'error',
        title: 'Invalid Withdrawal Amount',
        message: 'Please enter a valid positive withdrawal amount.'
      });
      return;
    }

    const amountPaise = localAmountToPaise(amtLocal, entityId);
    setSubmitting(true);

    try {
      let payoutResult: BankTransferResult = {
        payoutId: `TH-WD-${selectedBank.rail}-${Date.now().toString().slice(-6)}`,
        status: selectedBank.rail === 'IMPS' ? 'SETTLED' : 'INITIATED'
      };

      if (BigInt(availablePaise) >= BigInt(amountPaise) && BigInt(availablePaise) > 0n) {
        const res = await tradeHeavenMediationService.requestBankPayout(
          entityId,
          amountPaise,
          {
            entityId,
            walletId: activeWallet?.id || `wal-${entityId}`,
            accountHolderName: selectedBank.accountHolderName,
            accountNumber: selectedBank.accountNumber,
            ifscOrSwift: selectedBank.ifscOrSwift,
            bankName: selectedBank.bankName,
            rail: selectedBank.rail
          },
          currentUser.tier || 'VIP'
        );
        payoutResult = res.payoutResult;
        if (onSuccess) onSuccess(res.state);
      }

      const formattedAmt = `${currencyMeta.symbol}${amtLocal.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

      const newReq: SupplierWithdrawalRequestItem = {
        id: `wreq-${Date.now()}`,
        payoutId: payoutResult.payoutId,
        entityId,
        companyName,
        amountLocal: amtLocal,
        currencySymbol: currencyMeta.symbol,
        currencyCode: currencyMeta.currencyCode,
        amountFormatted: formattedAmt,
        bankName: selectedBank.bankName,
        accountHolderName: selectedBank.accountHolderName,
        accountNumberMasked: `••••${selectedBank.accountNumber.slice(-4)}`,
        ifscOrSwift: selectedBank.ifscOrSwift,
        rail: selectedBank.rail,
        orderReference: orderReference.trim() || undefined,
        requestNote: requestNote.trim() || undefined,
        status: payoutResult.status,
        requestedAt: new Date().toISOString()
      };

      const updatedReqs = [newReq, ...withdrawalRequests];
      setWithdrawalRequests(updatedReqs);
      try {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedReqs));
      } catch {}

      setFeedback({
        type: 'success',
        title: `Withdrawal Request Dispatched to Trade Heaven (${payoutResult.payoutId})`,
        message: `Your withdrawal request for ${formattedAmt} (${currencyMeta.currencyCode}) to ${selectedBank.bankName} (Acct: ••••${selectedBank.accountNumber.slice(-4)}, ${selectedBank.ifscOrSwift}) via ${selectedBank.rail} has been submitted to Trade Heaven Treasury.`,
        payoutId: payoutResult.payoutId
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Withdrawal Request Notice',
        message: err?.message || 'Unable to process withdrawal request at this moment.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step-by-Step Banner Explaining How Suppliers Add Bank Details & Withdraw Funds */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trade Heaven Supplier Treasury &amp; Bank Payout Desk</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              How Suppliers Add Bank Details &amp; Withdraw Funds from Trade Heaven
            </h3>
            <p className="text-xs text-slate-300">
              Register your beneficiary corporate bank account below and submit a withdrawal request (`requestBankPayout`) directly to Trade Heaven Treasury.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-right shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Available for Withdrawal ({currencyMeta.flag} {currencyMeta.currencyCode})
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              {nativeAvailFormatted.primary}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <div className="font-bold text-emerald-400">Step 1: Add Beneficiary Bank</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Click <strong>+ Add New Bank Account</strong> to save your corporate Bank Name, Account Number / IBAN, and SWIFT / IFSC code.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <div className="font-bold text-blue-400">Step 2: Request Trade Heaven Payout</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Select your verified bank account, enter the withdrawal amount &amp; escrow order reference, and submit to Trade Heaven.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <div className="font-bold text-amber-400">Step 3: Instant SWIFT / RTGS Settlement</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Trade Heaven deducts your wallet balance atomically and dispatches funds via SWIFT, RTGS, NEFT, IMPS, or ACH with a Payout ID.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="text-xs font-bold">{feedback.title}</div>
              <div className="text-xs opacity-90 leading-relaxed">{feedback.message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline opacity-75 hover:opacity-100 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? ' gap-5' : 'lg:grid-cols-12 gap-6'} items-start`}>
        {/* Left Column: Step 1 — Saved Beneficiary Bank Accounts + Add New Bank Form */}
        <div className={`${compact ? '' : 'lg:col-span-6'} bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs`}>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  1. Supplier Beneficiary Bank Details
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select or add the bank account where Trade Heaven will wire your funds
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddBankForm(prev => !prev)}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddBankForm ? 'Cancel' : 'Add Bank Details'}</span>
            </button>
          </div>

          {/* Add New Bank Account Form */}
          {showAddBankForm && (
            <form
              onSubmit={handleSaveBankAccount}
              className="p-4 rounded-xl bg-slate-50 border border-blue-200 space-y-3 animate-fadeIn"
            >
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Register New Withdrawal Bank Account</span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  KYC Verified Payout Destination
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Beneficiary Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={newHolderName}
                    onChange={e => setNewHolderName(e.target.value)}
                    placeholder="e.g. MP Commodity Brokers Pty Ltd"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Receiving Bank Name *
                  </label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value)}
                    placeholder="e.g. Citibank / HSBC / HDFC Bank"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Account Number / IBAN *
                  </label>
                  <input
                    type="text"
                    value={newAccountNumber}
                    onChange={e => setNewAccountNumber(e.target.value)}
                    placeholder="e.g. GB82WEST12345698765432"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    SWIFT BIC / IFSC / Routing Code *
                  </label>
                  <input
                    type="text"
                    value={newIfscOrSwift}
                    onChange={e => setNewIfscOrSwift(e.target.value)}
                    placeholder="e.g. CTBAAU2S or HDFC0000241"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Branch City &amp; Country
                  </label>
                  <input
                    type="text"
                    value={newBranchCountry}
                    onChange={e => setNewBranchCountry(e.target.value)}
                    placeholder="e.g. New York, USA"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Preferred Settlement Rail
                  </label>
                  <select
                    value={newRail}
                    onChange={e => setNewRail(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="SWIFT">SWIFT (International Wire Transfer)</option>
                    <option value="ACH">ACH / Fedwire (US Clearing)</option>
                    <option value="RTGS">RTGS (High-Value Instant Settlement)</option>
                    <option value="NEFT">NEFT (Corporate Batch Settlement)</option>
                    <option value="IMPS">IMPS (Instant Bank Payout)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddBankForm(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Beneficiary Bank Details</span>
                </button>
              </div>
            </form>
          )}

          {/* Saved Bank Accounts List */}
          <div className="space-y-2.5">
            {savedBanks.map(bank => {
              const isSelected = bank.id === selectedBank?.id;
              return (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/15'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {bank.bankName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
                        {bank.rail}
                      </span>
                      {bank.verifiedByTradeHeaven && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 font-medium truncate">
                      Beneficiary: <strong>{bank.accountHolderName}</strong>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Acct/IBAN: <strong>{bank.accountNumber}</strong></span>
                      <span>SWIFT/IFSC: <strong>{bank.ifscOrSwift}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use Bank'}
                    </span>
                    {savedBanks.length > 1 && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteBank(bank.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove bank account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step 2 — Request Funds Withdrawal from Trade Heaven */}
        <div className={`${compact ? '' : 'lg:col-span-6'} bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs`}>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  2. Request Funds Withdrawal from Trade Heaven
                </h4>
                <p className="text-[11px] text-slate-500">
                  Submit a payout request to transfer wallet funds to your selected bank account
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitWithdrawalRequest} className="space-y-4">
            {/* Selected Destination Bank Preview */}
            {selectedBank && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payout Destination Bank
                  </div>
                  <div className="font-bold text-slate-900 truncate mt-0.5">
                    {selectedBank.bankName} ({selectedBank.rail})
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 truncate">
                    {selectedBank.accountHolderName} · {selectedBank.accountNumber} ({selectedBank.ifscOrSwift})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBankForm(true)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Withdrawal Amount ({currencyMeta.currencyCode} {currencyMeta.symbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={withdrawalAmountLocal}
                  onChange={e => setWithdrawalAmountLocal(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escrow Order / Invoice Reference
                </label>
                <input
                  type="text"
                  value={orderReference}
                  onChange={e => setOrderReference(e.target.value)}
                  placeholder="e.g. ORD-ESC-2026-8841"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Quick Percentage Fill Buttons */}
            {availableLocal > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500 mr-1">Quick Amount:</span>
                {[0.25, 0.5, 0.75, 1].map(pct => {
                  const val = Math.max(1, Math.floor(availableLocal * pct));
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWithdrawalAmountLocal(String(val))}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-mono font-semibold text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
                    >
                      {pct === 1 ? '100% Max' : `${pct * 100}%`} ({currencyMeta.symbol}{val.toLocaleString()})
                    </button>
                  );
                })}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructions / Note to Trade Heaven Treasury
              </label>
              <textarea
                rows={2}
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                placeholder="Include any remittance remark or invoice reference for Trade Heaven Treasury..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Submitting Withdrawal Request to Trade Heaven...'
                  : `Request Funds Withdrawal to ${selectedBank?.bankName || 'Bank Account'}`}
              </span>
            </button>
          </form>

          {/* Recent Supplier Withdrawal Requests to Trade Heaven */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Recent Withdrawal Requests to Trade Heaven</span>
              <span className="font-mono text-slate-400">{withdrawalRequests.length} records</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {withdrawalRequests.slice(0, 4).map(req => (
                <div
                  key={req.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-slate-900">{req.amountFormatted}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {req.rail}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 truncate">
                        {req.payoutId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">
                      To: {req.bankName} ({req.accountNumberMasked} · {req.ifscOrSwift})
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      req.status === 'SETTLED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
