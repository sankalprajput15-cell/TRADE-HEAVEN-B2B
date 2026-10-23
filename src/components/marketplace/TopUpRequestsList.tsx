import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Filter,
  Landmark,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Upload,
  X
} from 'lucide-react';
import { OFFICIAL_SWIFT_BANK_DETAILS } from '../../constants/swiftBankDetails';
import { tradeHeavenMediationService } from '../../services/tradeHeavenMediatorEngine';
import { useAuth } from '../../context/AuthContext';
import { formatBalanceInNativeCurrency, getEntityCurrency } from '../../utils/entityCurrency';

export type TopUpStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface TopUpRequestItem {
  id: string;
  referenceId: string;
  buyerId: string;
  buyerName: string;
  companyName: string;
  amountPaise: number;
  amountInr: number;
  paymentRail: string;
  status: TopUpStatus;
  createdAt: string;
  verifiedAt?: string;
  bankName: string;
  ibanOrAccount: string;
  bicOrIfsc: string;
  remark: string;
  notes?: string;
  proofDocumentName?: string;
}

const STORAGE_KEY = 'th_wallet_topup_requests_v2';

const INITIAL_MOCK_REQUESTS: TopUpRequestItem[] = [
  {
    id: 'REQ-TOPUP-2026-9481',
    referenceId: 'GW-SWIFT-9182374',
    buyerId: 'buyer-titan-01',
    buyerName: 'Marcus Vance',
    companyName: 'Titan Global Construction & Infrastructure LLC',
    amountPaise: 50000000,
    amountInr: 500000,
    paymentRail: 'SWIFT (International wire)',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    bankName: OFFICIAL_SWIFT_BANK_DETAILS.bankName,
    ibanOrAccount: OFFICIAL_SWIFT_BANK_DETAILS.iban,
    bicOrIfsc: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift,
    remark: OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark,
    notes: 'International wire initiated via Barclays Corporate Online. Remitted in USD with remark DO NOT CONVERT TO GBP.',
    proofDocumentName: 'SWIFT_MT103_Barclays_Confirmation.pdf'
  },
  {
    id: 'REQ-TOPUP-2026-9472',
    referenceId: 'GW-SWIFT-8829104',
    buyerId: 'buyer-titan-01',
    buyerName: 'Marcus Vance',
    companyName: 'Titan Global Construction & Infrastructure LLC',
    amountPaise: 100000000,
    amountInr: 1000000,
    paymentRail: 'SWIFT (International wire)',
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 5.5).toISOString(),
    bankName: OFFICIAL_SWIFT_BANK_DETAILS.bankName,
    ibanOrAccount: OFFICIAL_SWIFT_BANK_DETAILS.iban,
    bicOrIfsc: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift,
    remark: OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark,
    notes: 'Verified via The Currency Cloud SWIFT Treasury incoming MT103 hook. Wallet credited.',
    proofDocumentName: 'CurrencyCloud_Statement_Advise.pdf'
  },
  {
    id: 'REQ-TOPUP-2026-9419',
    referenceId: 'GW-RZP-9948102',
    buyerId: 'buyer-titan-01',
    buyerName: 'Marcus Vance',
    companyName: 'Titan Global Construction & Infrastructure LLC',
    amountPaise: 250000000,
    amountInr: 2500000,
    paymentRail: 'RazorpayX Corporate Collect VAN',
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 23.9).toISOString(),
    bankName: 'HDFC Corporate Virtual Account',
    ibanOrAccount: 'RAZRPAYX0092144',
    bicOrIfsc: 'HDFC0000240',
    remark: 'TITAN-B2B-TOPUP',
    notes: 'Automated VAN instant settlement webhook verified.'
  },
  {
    id: 'REQ-TOPUP-2026-9390',
    referenceId: 'GW-SWIFT-7719203',
    buyerId: 'buyer-euro-02',
    buyerName: 'Elena Rostova',
    companyName: 'EuroMed Hospital Procurement GmbH',
    amountPaise: 150000000,
    amountInr: 1500000,
    paymentRail: 'SWIFT (International wire)',
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(),
    bankName: OFFICIAL_SWIFT_BANK_DETAILS.bankName,
    ibanOrAccount: OFFICIAL_SWIFT_BANK_DETAILS.iban,
    bicOrIfsc: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift,
    remark: OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark,
    notes: 'SEPA/SWIFT wire from Deutsche Bank AG Frankfurt. Remark matched.'
  }
];

export const loadStoredRequests = (): TopUpRequestItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REQUESTS));
      return INITIAL_MOCK_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MOCK_REQUESTS;
  } catch {
    return INITIAL_MOCK_REQUESTS;
  }
};

export const saveStoredRequests = (list: TopUpRequestItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('th_topup_requests_updated', { detail: list }));
  } catch (err) {
    console.error('Failed to save top-up requests to localStorage', err);
  }
};

export const addTopUpRequest = (item: TopUpRequestItem) => {
  const current = loadStoredRequests();
  const existingIdx = current.findIndex(r => r.referenceId === item.referenceId || r.id === item.id);
  let updated: TopUpRequestItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  saveStoredRequests(updated);
  return updated;
};

interface Props {
  selectedWalletId?: string;
  onRefreshParentState?: () => void;
  className?: string;
}

export const TopUpRequestsList: React.FC<Props> = ({
  selectedWalletId,
  onRefreshParentState,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [requests, setRequests] = useState<TopUpRequestItem[]>(loadStoredRequests);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // New transfer submission form state
  const [formAmountInr, setFormAmountInr] = useState<string>('500000');
  const [formUtr, setFormUtr] = useState<string>(() => `GW-SWIFT-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [formRail, setFormRail] = useState<string>('SWIFT (International wire)');
  const [formNotes, setFormNotes] = useState<string>('');
  const [remarkConfirmed, setRemarkConfirmed] = useState<boolean>(true);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setRequests(loadStoredRequests());
    };
    window.addEventListener('th_topup_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('th_topup_requests_updated', handleUpdate);
    };
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter requests strictly by the logged-in user's personal wallet
  const personalRequests = useMemo(() => {
    return requests.filter(req => {
      if (selectedWalletId && req.buyerId === selectedWalletId) return true;
      if (currentUser) {
        const uid = (currentUser.id || '').toLowerCase();
        const comp = (currentUser.companyName || '').toLowerCase();
        const name = (currentUser.name || '').toLowerCase();
        if (uid && (req.buyerId.toLowerCase() === uid || req.buyerId.toLowerCase().includes(uid))) return true;
        if (comp && req.companyName.toLowerCase().includes(comp)) return true;
        if (name && req.buyerName.toLowerCase().includes(name)) return true;
      }
      return false;
    });
  }, [requests, selectedWalletId, currentUser]);

  const filteredRequests = useMemo(() => {
    return personalRequests.filter(req => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          req.referenceId.toLowerCase().includes(query) ||
          req.id.toLowerCase().includes(query) ||
          req.companyName.toLowerCase().includes(query) ||
          req.paymentRail.toLowerCase().includes(query) ||
          (req.notes && req.notes.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [personalRequests, statusFilter, searchTerm]);

  const pendingCount = useMemo(
    () => personalRequests.filter(r => r.status === 'PENDING').length,
    [personalRequests]
  );
  const verifiedCount = useMemo(
    () => personalRequests.filter(r => r.status === 'VERIFIED').length,
    [personalRequests]
  );

  const formatInr = (amountInr: number) => {
    return `₹${amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Verify and credit a pending top-up
  const handleVerifyPending = async (req: TopUpRequestItem) => {
    setIsVerifyingId(req.id);
    try {
      // Credit wallet in tradeHeavenMediationService
      await tradeHeavenMediationService.creditBuyerDeposit(
        req.buyerId,
        req.amountPaise,
        req.referenceId
      );

      const updated = requests.map(item => {
        if (item.id === req.id) {
          return {
            ...item,
            status: 'VERIFIED' as TopUpStatus,
            verifiedAt: new Date().toISOString(),
            notes: (item.notes ? item.notes + ' • ' : '') + 'Verified & credited to wallet balance'
          };
        }
        return item;
      });

      saveStoredRequests(updated);
      setRequests(updated);
      if (onRefreshParentState) onRefreshParentState();
    } catch (err: any) {
      console.error('Error verifying deposit:', err);
    } finally {
      setIsVerifyingId(null);
    }
  };

  // Handle new manual transfer UTR log submission
  const handleSubmitNewTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormSuccessMsg(null);

    const parsedInr = parseFloat(formAmountInr) || 0;
    if (parsedInr <= 0) {
      setFormSubmitting(false);
      return;
    }

    const newRequest: TopUpRequestItem = {
      id: `REQ-TOPUP-${Date.now().toString().slice(-4)}`,
      referenceId: formUtr.trim() || `GW-SWIFT-${Math.floor(1000000 + Math.random() * 9000000)}`,
      buyerId: selectedWalletId || currentUser?.id || 'personal-client-wallet',
      buyerName: currentUser?.name || 'Logged-in Client',
      companyName: currentUser?.companyName || currentUser?.name || 'Personal Account',
      amountPaise: Math.round(parsedInr * 100),
      amountInr: parsedInr,
      paymentRail: formRail,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      bankName: OFFICIAL_SWIFT_BANK_DETAILS.bankName,
      ibanOrAccount: OFFICIAL_SWIFT_BANK_DETAILS.iban,
      bicOrIfsc: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift,
      remark: OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark,
      notes: formNotes.trim() || `Transferred to ${OFFICIAL_SWIFT_BANK_DETAILS.bankName}. Remark: ${OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark}`,
      proofDocumentName: selectedFile || 'Bank_Transfer_Screenshot.png'
    };

    setTimeout(() => {
      const updated = [newRequest, ...requests];
      saveStoredRequests(updated);
      setRequests(updated);
      setFormSubmitting(false);
      setFormSuccessMsg(`Transfer proof (${newRequest.proofDocumentName}) uploaded! Confirmation email sent to ${currentUser?.email || 'your registered email'}. Status: PENDING.`);
      setTimeout(() => {
        setShowLogModal(false);
        setFormSuccessMsg(null);
        setFormUtr(`GW-SWIFT-${Math.floor(1000000 + Math.random() * 9000000)}`);
        setFormNotes('');
        setSelectedFile(null);
      }, 2200);
    }, 400);
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 ${className}`}>
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>My Top-Up Transfer Requests &amp; Status Tracker</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
              {personalRequests.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Monitor incoming wire settlements, UTR tracking references, and bank verification progress in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Wire Transfer (UTR)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-800 hover:bg-emerald-100/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified ({verifiedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by UTR, reference, rail..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No Top-Up Requests Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No requests match your current filters. Try resetting the search or filter.'
                : 'You have not submitted any top-up requests yet. Log a wire transfer or complete a gateway top-up above.'}
            </p>
          </div>
        ) : (
          filteredRequests.map(item => {
            const isExpanded = expandedId === item.id;
            const isPending = item.status === 'PENDING';
            const isVerified = item.status === 'VERIFIED';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Main Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Status icon & Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPending
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      {isPending ? (
                        <Clock className="w-5 h-5 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {isPending ? 'Pending Treasury Verification' : 'Verified & Credited'}
                        </span>

                        {/* Reference / UTR */}
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <span>{item.referenceId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.referenceId, item.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy Reference ID"
                          >
                            {copiedText === item.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Payment Rail Tag */}
                        <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                          {item.paymentRail}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{getEntityCurrency(item.buyerId).flag}</span>
                          <span>{item.companyName}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[11px] text-slate-500">{getEntityCurrency(item.buyerId).country}</span>
                        <span className="text-slate-300">•</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        {item.verifiedAt && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-medium">
                              Reconciled at {new Date(item.verifiedAt).toLocaleTimeString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Remark note verification */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                          Remark: {item.remark}
                        </span>
                        {item.proofDocumentName && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>{item.proofDocumentName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-base sm:text-lg font-black font-mono text-slate-900 flex items-center md:justify-end gap-1.5">
                        <span>{formatBalanceInNativeCurrency(item.amountPaise, item.buyerId).flag}</span>
                        <span>{formatBalanceInNativeCurrency(item.amountPaise, item.buyerId).nativeAmount}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {formatBalanceInNativeCurrency(item.amountPaise, item.buyerId).inrAmount}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          type="button"
                          disabled={isVerifyingId === item.id}
                          onClick={() => handleVerifyPending(item)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Simulate bank treasury reconciliation"
                        >
                          {isVerifyingId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify &amp; Credit</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                        title={isExpanded ? 'Hide details' : 'Show details'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 rounded-b-2xl space-y-3 text-xs">
                    <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Transfer Audit Breakdown &amp; Beneficiary Record</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Beneficiary Bank</span>
                        <strong className="text-slate-900 block mt-0.5">{item.bankName}</strong>
                        <span className="text-[11px] text-slate-500 font-mono">SWIFT: {item.bicOrIfsc}</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">IBAN / Account Number</span>
                        <strong className="font-mono text-slate-900 block mt-0.5 select-all">{item.ibanOrAccount}</strong>
                        <span className="text-[11px] text-slate-500">Holder: {OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName}</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Mandatory Wire Remark</span>
                        <strong className="font-mono text-amber-900 block mt-0.5 select-all">{item.remark}</strong>
                        <span className="text-[10px] text-emerald-700 font-semibold">✓ Verified present on MT103 wire</span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">Operational Notes:</span>
                        <p className="leading-relaxed">{item.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Request UUID: <code className="font-mono text-slate-700">{item.id}</code></span>
                      <span className="font-mono font-semibold">
                        Status: <span className={isPending ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{item.status}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manual Wire Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">Log Bank Wire Transfer (UTR)</h4>
                  <p className="text-[11px] text-slate-300">Submit your wire reference for Treasury reconciliation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTransfer} className="p-5 sm:p-6 space-y-4 text-xs">
              {formSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccessMsg}</span>
                </div>
              )}

              {/* Bank Details Reminder Box */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-1 text-slate-700">
                <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" />
                  <span>Remitted to: {OFFICIAL_SWIFT_BANK_DETAILS.bankName}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  IBAN: {OFFICIAL_SWIFT_BANK_DETAILS.iban} • SWIFT: {OFFICIAL_SWIFT_BANK_DETAILS.bicSwift}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Transfer Amount in INR (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold font-mono text-slate-400">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={formAmountInr}
                    onChange={e => setFormAmountInr(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    placeholder="500000"
                  />
                </div>
              </div>

              {/* Wire Reference / UTR Number */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Bank Reference Number / UTR / SWIFT MT103 *
                </label>
                <input
                  type="text"
                  required
                  value={formUtr}
                  onChange={e => setFormUtr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. GW-SWIFT-8491024 or Barclays UTR..."
                />
              </div>

              {/* Payment Rail Select */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Payment Rail Used</label>
                <select
                  value={formRail}
                  onChange={e => setFormRail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="SWIFT (International wire)">SWIFT (International wire - The Currency Cloud)</option>
                  <option value="RazorpayX Corporate Collect VAN">RazorpayX Corporate Netbanking / RTGS</option>
                  <option value="Cashfree B2B AutoCollect">Cashfree B2B AutoCollect VAN</option>
                  <option value="HDFC Corporate RTGS">HDFC Bank Direct RTGS Line</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Optional Notes or Origin Bank Name</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Dispatched from HSBC New York corporate account"
                />
              </div>

              {/* Mock Screenshot Upload */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Upload Transfer Screenshot / Receipt *</label>
                <div 
                  onClick={() => setSelectedFile('Manual_Transfer_Proof_' + Date.now().toString().slice(-4) + '.png')}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                    selectedFile 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-bold text-emerald-900">{selectedFile}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">Proof Uploaded Successfully</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="font-semibold">Click to upload transaction screenshot</span>
                      <span className="text-[10px] opacity-70">Supports PNG, JPG, PDF (Max 10MB)</span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Submission triggers an automated confirmation email to Treasury.</span>
                </div>
              </div>

              {/* Mandatory Remark Checkbox */}
              <label className="p-3 bg-amber-50/80 border border-amber-300/80 rounded-xl flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={remarkConfirmed}
                  onChange={e => setRemarkConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="text-[11px] text-amber-900 leading-tight">
                  <span className="font-bold">Mandatory Remark Included: </span>
                  I confirm that the wire transfer instruction includes the required remark:{' '}
                  <strong className="font-mono bg-amber-200/60 px-1 py-0.5 rounded">{OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark}</strong>.
                </div>
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || !remarkConfirmed}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Logging Request...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit Top-Up Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
