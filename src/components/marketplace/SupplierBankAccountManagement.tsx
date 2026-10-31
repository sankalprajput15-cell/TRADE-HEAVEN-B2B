import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  Clock,
  DollarSign,
} from 'lucide-react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  BankTransferResult,
} from '../../services/tradeHeavenMediatorEngine';
import {
  formatBalanceInNativeCurrency,
  getEntityCurrency,
  localAmountToPaise,
  paiseToLocalAmount,
} from '../../utils/entityCurrency';
import {
  SavedSupplierBankAccount,
  SupplierWithdrawalRequestItem,
  getSavedSupplierBanks,
} from './SupplierBankWithdrawalPanel';

interface SupplierBankAccountManagementProps {
  currentUser?: {
    id?: string;
    name: string;
    company?: string;
    email?: string;
    role?: string;
    tier?: string;
  } | null;
  mediationState?: MediationSystemState | null;
}

const STORAGE_KEY_BANKS = 'th_supplier_saved_banks_v1';
const STORAGE_KEY_REQUESTS = 'th_supplier_withdrawal_requests_v1';

export const SupplierBankAccountManagement: React.FC<SupplierBankAccountManagementProps> = ({
  currentUser,
  mediationState: propMediationState,
}) => {
  const [localMediationState, setLocalMediationState] = useState<MediationSystemState | null>(null);

  useEffect(() => {
    if (propMediationState) return;
    const fetchState = async () => {
      try {
        const st = await tradeHeavenMediationService.getState();
        setLocalMediationState(st);
      } catch {
        // ignore
      }
    };
    fetchState();
    window.addEventListener('tradeheaven_mediation_updated', fetchState);
    return () => window.removeEventListener('tradeheaven_mediation_updated', fetchState);
  }, [propMediationState]);

  const mediationState = propMediationState || localMediationState;

  const entityId = currentUser?.id || 'comp-melissa-mpcommodity';
  const supplierCompany =
    currentUser?.company || currentUser?.name || 'Verified Supplier Corporate Account';

  const activeWallet = useMemo(() => {
    if (!mediationState) return null;
    return (
      mediationState.wallets.find(
        (w) =>
          w.entity_id === entityId ||
          w.entity_id.includes(entityId) ||
          (currentUser?.company &&
            w.company_name.toLowerCase().includes(currentUser.company.toLowerCase()))
      ) ||
      mediationState.wallets.find((w) => w.entity_type === 'SUPPLIER') ||
      mediationState.wallets[1] ||
      null
    );
  }, [mediationState, entityId, currentUser]);

  const currencyMeta = useMemo(
    () => getEntityCurrency(activeWallet || { id: entityId, name: supplierCompany }),
    [activeWallet, entityId, supplierCompany]
  );

  const availablePaise = activeWallet?.available_balance || '0';
  const availableLocal = useMemo(
    () => paiseToLocalAmount(Number(availablePaise), entityId),
    [availablePaise, entityId]
  );
  const nativeAvailFormatted = useMemo(
    () => formatBalanceInNativeCurrency(availablePaise, activeWallet || entityId),
    [availablePaise, activeWallet, entityId]
  );

  const [savedBanks, setSavedBanks] = useState<SavedSupplierBankAccount[]>(() =>
    getSavedSupplierBanks(entityId, supplierCompany)
  );
  const [selectedBankId, setSelectedBankId] = useState<string>(
    () => getSavedSupplierBanks(entityId, supplierCompany)[0]?.id || ''
  );

  // Security & Visibility State
  const [unmaskedBankIds, setUnmaskedBankIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add / Edit Bank Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [accountHolderName, setAccountHolderName] = useState(supplierCompany);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [showRawAccountInput, setShowRawAccountInput] = useState(false);
  const [ifscOrSwift, setIfscOrSwift] = useState('');
  const [branchCountry, setBranchCountry] = useState('');
  const [rail, setRail] = useState<'SWIFT' | 'RTGS' | 'NEFT' | 'IMPS' | 'ACH'>('SWIFT');
  const [setAsPrimaryOnSave, setSetAsPrimaryOnSave] = useState(true);
  const [bankFormError, setBankFormError] = useState<string | null>(null);
  const [bankSaveBanner, setBankSaveBanner] = useState<string | null>(null);

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fund Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>(() => {
    const suggested = availableLocal > 0 ? Math.min(5000, Number(availableLocal.toFixed(2))) : 1500;
    return String(suggested);
  });
  const [withdrawReference, setWithdrawReference] = useState('ORD-ESC-2026-8841');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [withdrawalRequests, setWithdrawalRequests] = useState<SupplierWithdrawalRequestItem[]>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
      return [];
    }
  );

  useEffect(() => {
    const syncBanks = () => {
      const updated = getSavedSupplierBanks(entityId, supplierCompany);
      setSavedBanks(updated);
      if (updated.length > 0 && !updated.some((b) => b.id === selectedBankId)) {
        const primary = updated.find((b) => b.isPrimary) || updated[0];
        setSelectedBankId(primary.id);
      }
    };
    window.addEventListener('tradeheaven_supplier_banks_updated', syncBanks);
    return () => window.removeEventListener('tradeheaven_supplier_banks_updated', syncBanks);
  }, [entityId, supplierCompany, selectedBankId]);

  const persistBanks = (updatedForEntity: SavedSupplierBankAccount[]) => {
    setSavedBanks(updatedForEntity);
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BANKS);
      const all: SavedSupplierBankAccount[] = raw ? JSON.parse(raw) : [];
      const others = all.filter((b) => b.entityId.toLowerCase() !== entityId.toLowerCase());
      localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify([...updatedForEntity, ...others]));
      window.dispatchEvent(new CustomEvent('tradeheaven_supplier_banks_updated'));
    } catch {
      // ignore storage errors
    }
  };

  const selectedBank =
    savedBanks.find((b) => b.id === selectedBankId) ||
    savedBanks.find((b) => b.isPrimary) ||
    savedBanks[0] ||
    null;

  const toggleMask = (id: string) => {
    setUnmaskedBankIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatMaskedAccount = (acct: string, isUnmasked: boolean) => {
    if (isUnmasked) return acct;
    const clean = acct.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    return `${'•'.repeat(Math.min(clean.length - 4, 10))}${clean.slice(-4)}`;
  };

  const openAddForm = () => {
    setEditingBankId(null);
    setAccountHolderName(supplierCompany);
    setBankName('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscOrSwift('');
    setBranchCountry('');
    setRail('SWIFT');
    setSetAsPrimaryOnSave(savedBanks.length === 0);
    setBankFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (bank: SavedSupplierBankAccount) => {
    setEditingBankId(bank.id);
    setAccountHolderName(bank.accountHolderName);
    setBankName(bank.bankName);
    setAccountNumber(bank.accountNumber);
    setConfirmAccountNumber(bank.accountNumber);
    setIfscOrSwift(bank.ifscOrSwift);
    setBranchCountry(bank.branchCountry);
    setRail(bank.rail);
    setSetAsPrimaryOnSave(bank.isPrimary);
    setBankFormError(null);
    setIsFormOpen(true);
  };

  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setBankFormError(null);

    const trimmedHolder = accountHolderName.trim();
    const trimmedBank = bankName.trim();
    const trimmedAccount = accountNumber.trim();
    const trimmedConfirm = confirmAccountNumber.trim();
    const trimmedSwift = ifscOrSwift.trim().toUpperCase();
    const trimmedCountry = branchCountry.trim() || 'International Corporate Branch';

    if (!trimmedHolder) {
      setBankFormError('Please enter the Beneficiary Account Holder Name.');
      return;
    }
    if (!trimmedBank) {
      setBankFormError('Please enter your Bank Name.');
      return;
    }
    if (!trimmedAccount || trimmedAccount.length < 5) {
      setBankFormError('Please enter a valid Account Number or IBAN (minimum 5 characters).');
      return;
    }
    if (trimmedAccount !== trimmedConfirm) {
      setBankFormError('Account Number and Confirm Account Number do not match.');
      return;
    }
    if (!trimmedSwift || trimmedSwift.length < 6) {
      setBankFormError('Please enter a valid SWIFT / BIC (8–11 chars) or IFSC code (11 chars).');
      return;
    }

    if (editingBankId) {
      const updated = savedBanks.map((b) => {
        if (b.id === editingBankId) {
          return {
            ...b,
            accountHolderName: trimmedHolder,
            bankName: trimmedBank,
            accountNumber: trimmedAccount,
            ifscOrSwift: trimmedSwift,
            branchCountry: trimmedCountry,
            rail,
            isPrimary: setAsPrimaryOnSave ? true : b.isPrimary,
            updatedAt: new Date().toISOString(),
          };
        }
        return setAsPrimaryOnSave ? { ...b, isPrimary: false } : b;
      });
      persistBanks(updated);
      setSelectedBankId(editingBankId);
      setBankSaveBanner(
        `Updated bank account "${trimmedBank} (••••${trimmedAccount.slice(-4)})"`
      );
    } else {
      const newBank: SavedSupplierBankAccount = {
        id: `bank-${Date.now()}`,
        entityId,
        accountHolderName: trimmedHolder,
        bankName: trimmedBank,
        accountNumber: trimmedAccount,
        ifscOrSwift: trimmedSwift,
        branchCountry: trimmedCountry,
        rail,
        isPrimary: setAsPrimaryOnSave || savedBanks.length === 0,
        verifiedByTradeHeaven: true,
        updatedAt: new Date().toISOString(),
      };

      const nextList = newBank.isPrimary
        ? [newBank, ...savedBanks.map((b) => ({ ...b, isPrimary: false }))]
        : [...savedBanks, newBank];

      persistBanks(nextList);
      setSelectedBankId(newBank.id);
      setBankSaveBanner(
        `Saved new withdrawal bank account "${trimmedBank} (••••${trimmedAccount.slice(-4)})"`
      );
    }

    setIsFormOpen(false);
    setEditingBankId(null);
    setTimeout(() => setBankSaveBanner(null), 5000);
  };

  const handleSetPrimary = (bankId: string) => {
    const updated = savedBanks.map((b) => ({
      ...b,
      isPrimary: b.id === bankId,
    }));
    persistBanks(updated);
    setSelectedBankId(bankId);
    const target = updated.find((b) => b.id === bankId);
    if (target) {
      setBankSaveBanner(`${target.bankName} set as your primary withdrawal account.`);
      setTimeout(() => setBankSaveBanner(null), 4000);
    }
  };

  const handleDeleteBank = (bankId: string) => {
    if (savedBanks.length <= 1) return;
    const remaining = savedBanks.filter((b) => b.id !== bankId);
    if (!remaining.some((b) => b.isPrimary) && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }
    persistBanks(remaining);
    if (selectedBankId === bankId && remaining[0]) {
      setSelectedBankId(remaining[0].id);
    }
    setConfirmDeleteId(null);
  };

  const handleCopyDetails = (bank: SavedSupplierBankAccount) => {
    const summary = `Beneficiary: ${bank.accountHolderName} | Bank: ${bank.bankName} | Acct: ${bank.accountNumber} | SWIFT/IFSC: ${bank.ifscOrSwift} | Rail: ${bank.rail}`;
    navigator.clipboard.writeText(summary);
    setCopiedId(bank.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawStatus(null);

    if (!selectedBank) {
      setWithdrawStatus({
        type: 'error',
        text: 'Please add and select a destination bank account first.',
      });
      return;
    }

    const amtLocal = parseFloat(withdrawAmount);
    if (isNaN(amtLocal) || amtLocal <= 0) {
      setWithdrawStatus({
        type: 'error',
        text: `Please enter a valid positive withdrawal amount in ${currencyMeta.currencyCode}.`,
      });
      return;
    }

    const amountPaise = localAmountToPaise(amtLocal, entityId);
    setSubmittingWithdrawal(true);

    try {
      let payoutResult: BankTransferResult = {
        payoutId: `TH-WD-${selectedBank.rail}-${Date.now().toString().slice(-6)}`,
        status: selectedBank.rail === 'IMPS' ? 'SETTLED' : 'INITIATED',
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
            rail: selectedBank.rail,
          },
          currentUser?.tier || 'VIP'
        );
        payoutResult = res.payoutResult;
        setLocalMediationState(res.state);
      }

      const formattedAmt = `${currencyMeta.symbol}${amtLocal.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      const newReq: SupplierWithdrawalRequestItem = {
        id: `wreq-${Date.now()}`,
        payoutId: payoutResult.payoutId,
        entityId,
        companyName: supplierCompany,
        amountLocal: amtLocal,
        currencySymbol: currencyMeta.symbol,
        currencyCode: currencyMeta.currencyCode,
        amountFormatted: formattedAmt,
        bankName: selectedBank.bankName,
        accountHolderName: selectedBank.accountHolderName,
        accountNumberMasked: `••••${selectedBank.accountNumber.slice(-4)}`,
        ifscOrSwift: selectedBank.ifscOrSwift,
        rail: selectedBank.rail,
        orderReference: withdrawReference.trim() || undefined,
        requestNote: `Supplier Dashboard Withdrawal Request to ${selectedBank.bankName}`,
        status: payoutResult.status,
        requestedAt: new Date().toISOString(),
      };

      const updatedReqs = [newReq, ...withdrawalRequests];
      setWithdrawalRequests(updatedReqs);
      try {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedReqs));
      } catch {
        // ignore
      }

      setWithdrawStatus({
        type: 'success',
        text: `Withdrawal request (${payoutResult.payoutId}) for ${formattedAmt} to ${selectedBank.bankName} (••••${selectedBank.accountNumber.slice(-4)}, SWIFT/IFSC: ${selectedBank.ifscOrSwift}) submitted to Trade Heaven Treasury.`,
      });
    } catch (err: any) {
      setWithdrawStatus({
        type: 'error',
        text: err?.message || 'Unable to process withdrawal request at this moment.',
      });
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Security & Balance Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted Beneficiary Bank Vault • Direct Trade Heaven Settlement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Supplier Bank Account Management &amp; Fund Withdrawals
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Input and save your verified corporate bank account details (
              <span className="text-white font-medium">Bank Name</span>,{' '}
              <span className="text-white font-medium">Account Number / IBAN</span>, and{' '}
              <span className="text-white font-medium">SWIFT / IFSC Code</span>) to receive Trade
              Heaven escrow settlements and direct fund withdrawals.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 shrink-0">
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg px-4 py-3 min-w-[175px]">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Withdrawable Balance
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {nativeAvailFormatted.nativeAmount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Cleared in Trade Heaven Wallet
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-lg px-4 py-3 min-w-[175px]">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Saved Bank Accounts
              </div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                {savedBanks.length} Verified
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Primary: {selectedBank?.rail || 'SWIFT'} Wire
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Banner */}
      {bankSaveBanner && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bankSaveBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setBankSaveBanner(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Grid: Left = Bank Account Vault & Form, Right = Request Withdrawal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Saved Bank Accounts & Add/Edit Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-slate-700" />
                  Saved Beneficiary Bank Accounts ({savedBanks.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an account below for fund withdrawals or add a new corporate bank account.
                </p>
              </div>

              {!isFormOpen && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bank Account
                </button>
              )}
            </div>

            {/* Add / Edit Bank Account Form */}
            {isFormOpen && (
              <form
                onSubmit={handleSaveBankAccount}
                className="p-6 bg-slate-50 border-b border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      {editingBankId
                        ? 'Edit Beneficiary Bank Account Details'
                        : 'Register New Beneficiary Bank Account'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingBankId(null);
                      setBankFormError(null);
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                {bankFormError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{bankFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Beneficiary Account Holder Name (Company / Legal Entity) *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="e.g., Apex Global Exports Pvt Ltd"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., HSBC Commercial / HDFC Bank / Citibank"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SWIFT / BIC or IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscOrSwift}
                      onChange={(e) => setIfscOrSwift(e.target.value.toUpperCase())}
                      placeholder="e.g., CITIUS33XXX or HDFC0000241"
                      className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Account Number / IBAN *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRawAccountInput((prev) => !prev)}
                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        {showRawAccountInput ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Show
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type={showRawAccountInput ? 'text' : 'password'}
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter full account number or IBAN"
                      className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Account Number / IBAN *
                    </label>
                    <input
                      type={showRawAccountInput ? 'text' : 'password'}
                      required
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="Re-enter account number to verify"
                      className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank Branch &amp; Country
                    </label>
                    <input
                      type="text"
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      placeholder="e.g., New York, USA or Mumbai, India"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Settlement Rail
                    </label>
                    <select
                      value={rail}
                      onChange={(e) =>
                        setRail(e.target.value as 'SWIFT' | 'RTGS' | 'NEFT' | 'IMPS' | 'ACH')
                      }
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="SWIFT">SWIFT International Wire (USD / Multi-Currency)</option>
                      <option value="RTGS">RTGS High-Value Real-Time Settlement</option>
                      <option value="ACH">ACH Commercial Direct Deposit</option>
                      <option value="NEFT">NEFT National Electronic Transfer</option>
                      <option value="IMPS">IMPS Instant Interbank Settlement</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={setAsPrimaryOnSave}
                    onChange={(e) => setSetAsPrimaryOnSave(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Set as primary default bank account for Trade Heaven fund withdrawals
                  </span>
                </label>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingBankId(null);
                      setBankFormError(null);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {editingBankId ? 'Update Bank Details' : 'Save Verified Bank Account'}
                  </button>
                </div>
              </form>
            )}

            {/* Saved Bank Cards List */}
            <div className="divide-y divide-slate-200">
              {savedBanks.map((bank) => {
                const isSelected = selectedBank?.id === bank.id;
                const isUnmasked = !!unmaskedBankIds[bank.id];

                return (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`p-5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <input
                          type="radio"
                          name="selectedWithdrawalBank"
                          checked={isSelected}
                          onChange={() => setSelectedBankId(bank.id)}
                          className="mt-1 text-slate-900 focus:ring-slate-900"
                        />
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {bank.bankName}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-600">
                              • {bank.rail}
                            </span>
                            {bank.isPrimary && (
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                Primary Account
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600">
                            Beneficiary:{' '}
                            <span className="font-semibold text-slate-800">
                              {bank.accountHolderName}
                            </span>{' '}
                            • {bank.branchCountry}
                          </div>

                          {/* Account Number & SWIFT/IFSC Row */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">Account No:</span>
                              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                                {formatMaskedAccount(bank.accountNumber, isUnmasked)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMask(bank.id);
                                }}
                                title={isUnmasked ? 'Mask account number' : 'Reveal account number'}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              >
                                {isUnmasked ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">SWIFT / IFSC:</span>
                              <span className="font-mono font-semibold text-slate-900">
                                {bank.ifscOrSwift}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Item Actions */}
                      <div
                        className="flex items-center gap-1.5 self-end sm:self-start shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!bank.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(bank.id)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                          >
                            Set Primary
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(bank)}
                          title="Edit bank details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyDetails(bank)}
                          title="Copy bank details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                        >
                          {copiedId === bank.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {savedBanks.length > 1 && (
                          <>
                            {confirmDeleteId === bank.id ? (
                              <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBank(bank.id)}
                                  className="text-[11px] font-bold text-red-700 hover:text-red-900"
                                >
                                  Confirm
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[11px] text-slate-500 hover:text-slate-800"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(bank.id)}
                                title="Remove bank account"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Direct Fund Withdrawal to Selected Bank */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  Withdraw Funds to Bank
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Request Trade Heaven to wire cleared funds to your selected bank account.
                </p>
              </div>
            </div>

            {selectedBank ? (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 mb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Destination Bank Account
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-700">
                    {selectedBank.rail} Wire
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedBank.bankName}</div>
                <div className="text-xs text-slate-600 font-mono">
                  Acct: ••••{selectedBank.accountNumber.slice(-4)} • SWIFT/IFSC:{' '}
                  {selectedBank.ifscOrSwift}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-4">
                Please add a beneficiary bank account on the left before requesting a withdrawal.
              </div>
            )}

            {withdrawStatus && (
              <div
                className={`p-3.5 rounded-lg border text-xs mb-4 flex items-start gap-2.5 ${
                  withdrawStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {withdrawStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{withdrawStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Withdrawal Amount ({currencyMeta.currencyCode}) *
                  </label>
                  {availableLocal > 0 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(Number(availableLocal.toFixed(2))))}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Withdraw Max ({nativeAvailFormatted.nativeAmount})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice / Settlement Reference (Optional)
                </label>
                <input
                  type="text"
                  value={withdrawReference}
                  onChange={(e) => setWithdrawReference(e.target.value)}
                  placeholder="e.g., Escrow Contract #ESC-1042 Release"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedBank || submittingWithdrawal}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                {submittingWithdrawal
                  ? 'Submitting to Trade Heaven Treasury...'
                  : 'Submit Bank Withdrawal Request'}
              </button>
            </form>
          </div>

          {/* Recent Bank Withdrawal Requests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Recent Withdrawal Requests ({withdrawalRequests.length})
              </h4>
            </div>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {withdrawalRequests.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-500">
                  No bank withdrawal requests submitted yet.
                </div>
              ) : (
                withdrawalRequests.map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {req.bankName}{' '}
                        <span className="font-mono text-slate-500">
                          ({req.accountNumberMasked})
                        </span>
                      </div>
                      <div className="text-slate-500 font-mono">
                        SWIFT/IFSC: {req.ifscOrSwift} • {req.rail}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(req.requestedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                        {req.amountFormatted}
                      </div>
                      <div
                        className={`text-[11px] font-semibold uppercase ${
                          req.status === 'SETTLED'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {req.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
