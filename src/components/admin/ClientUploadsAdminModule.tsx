import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard, 
  Upload, 
  X, 
  AlertCircle,
  Paperclip,
  Check
} from 'lucide-react';

export interface ClientUploadRecord {
  id: string;
  orderId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName: string;
  planId?: string;
  planTitle?: string;
  amountUsd?: number;
  currency?: string;
  wireTxRef?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl: string;
  fileDataUrl?: string;
  uploadedAt: string;
  status: 'PENDING_REVIEW' | 'VERIFIED_APPROVED' | 'REJECTED';
  notes?: string;
  adminVerificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

interface Props {
  onOpenPaymentCheckout?: (data: any) => void;
  currentUserEmail?: string;
}

export const ClientUploadsAdminModule: React.FC<Props> = ({
  onOpenPaymentCheckout,
  currentUserEmail = 'admin@tradeheaven.net'
}) => {
  const [uploads, setUploads] = useState<ClientUploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'VERIFIED_APPROVED' | 'REJECTED'>('ALL');
  const [selectedUploadForPreview, setSelectedUploadForPreview] = useState<ClientUploadRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isManualUploadOpen, setIsManualUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual Upload form state
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientEmail, setManualClientEmail] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualAmountUsd, setManualAmountUsd] = useState('590');
  const [manualUtr, setManualUtr] = useState('');
  const [manualFile, setManualFile] = useState<{ name: string; size: string; type: string; dataUrl: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/client-uploads', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.uploads)) {
          setUploads(data.uploads);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch client uploads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUpdateStatus = async (
    id: string, 
    status: 'VERIFIED_APPROVED' | 'REJECTED', 
    note?: string
  ) => {
    setIsUpdatingStatus(id);
    try {
      const res = await fetch(`/api/v1/client-uploads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminVerificationNotes: note || (status === 'VERIFIED_APPROVED' ? 'Wire confirmed against treasury ledger.' : 'Wire confirmation rejected.'),
          verifiedBy: currentUserEmail
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setUploads(prev => prev.map(u => u.id === id ? data.record : u));
          if (selectedUploadForPreview?.id === id) {
            setSelectedUploadForPreview(data.record);
          }
          showToast(
            'success',
            status === 'VERIFIED_APPROVED'
              ? `Wire slip for "${data.record.companyName}" verified & marked APPROVED!`
              : `Wire slip for "${data.record.companyName}" marked as REJECTED.`
          );
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tradeheaven_notify', {
              detail: {
                type: 'EDIT',
                title: 'Wire Status Updated',
                message: status === 'VERIFIED_APPROVED'
                  ? `Wire slip for "${data.record.companyName}" verified & APPROVED.`
                  : `Wire slip for "${data.record.companyName}" rejected.`,
                linkView: 'admin'
              }
            }));
          }
        }
      } else {
        showToast('error', 'Failed to update upload status on server.');
      }
    } catch (err) {
      showToast('error', 'Network error while updating status.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeInKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setManualFile({
        name: file.name,
        size: sizeStr,
        type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFile) {
      showToast('error', 'Please choose a screenshot or PDF slip to upload.');
      return;
    }

    try {
      const res = await fetch('/api/v1/client-uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: manualClientName || 'Direct Client',
          clientEmail: manualClientEmail || 'client@tradeheaven.net',
          companyName: manualCompany || 'Client Enterprise',
          amountUsd: parseFloat(manualAmountUsd) || 0,
          currency: 'USD',
          wireTxRef: manualUtr,
          fileName: manualFile.name,
          fileSize: manualFile.size,
          fileType: manualFile.type,
          fileDataUrl: manualFile.dataUrl,
          notes: 'Admin manual upload on behalf of client.'
        })
      });

      if (res.ok) {
        showToast('success', 'Client wire confirmation recorded successfully.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tradeheaven_notify', {
            detail: {
              type: 'UPLOAD',
              title: 'Wire Transfer Slip Uploaded',
              message: `Recorded wire confirmation for ${manualCompany || manualClientName || 'Client'}.`,
              linkView: 'admin'
            }
          }));
        }
        setIsManualUploadOpen(false);
        setManualFile(null);
        setManualClientName('');
        setManualClientEmail('');
        setManualCompany('');
        setManualUtr('');
        fetchUploads();
      }
    } catch {
      showToast('error', 'Failed to record upload.');
    }
  };

  // Filtered dataset
  const filteredUploads = uploads.filter(u => {
    const matchesSearch = 
      u.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.wireTxRef && u.wireTxRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUploaded = uploads.length;
  const pendingCount = uploads.filter(u => u.status === 'PENDING_REVIEW').length;
  const verifiedCount = uploads.filter(u => u.status === 'VERIFIED_APPROVED').length;
  const totalVolumeUsd = uploads
    .filter(u => u.status === 'VERIFIED_APPROVED' && typeof u.amountUsd === 'number')
    .reduce((sum, u) => sum + (u.amountUsd || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border-emerald-500/50 shadow-emerald-950/40' 
            : 'bg-rose-950 text-rose-100 border-rose-500/50 shadow-rose-950/40'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Treasury Ops &bull; Client Uploaded Wire Confirmations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Client Uploads &amp; Wire Confirmation Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 max-w-2xl">
              Inspect, preview, download, and verify bank transfer slips, MT103 receipts, and PDFs uploaded by international buyers during checkout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchUploads}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200"
              title="Refresh uploaded files list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManualUploadOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Slip for Client</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Uploads</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalUploaded}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Submitted receipts</div>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Pending Review</span>
            </div>
            <div className="text-2xl font-black text-amber-950 mt-1">{pendingCount}</div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Awaiting audit approval</div>
          </div>

          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified &amp; Approved</span>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">{verifiedCount}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Settlement validated</div>
          </div>

          <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200">
            <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Approved Volume</span>
            </div>
            <div className="text-2xl font-black text-blue-950 mt-1 font-mono">
              ${totalVolumeUsd.toLocaleString()}
            </div>
            <div className="text-[10px] text-blue-700 font-semibold mt-0.5">USD Verified via SWIFT</div>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, company, UTR reference, or file name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Status:
          </span>
          {(['ALL', 'PENDING_REVIEW', 'VERIFIED_APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status === 'ALL' && 'All Slips'}
              {status === 'PENDING_REVIEW' && '⏳ Pending'}
              {status === 'VERIFIED_APPROVED' && '✓ Approved'}
              {status === 'REJECTED' && '✕ Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* UPLOADS LIST TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="font-black text-sm text-slate-900 flex items-center gap-2">
            <span>Uploaded Documents &amp; Receipts</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
              {filteredUploads.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            Showing verified SWIFT remittance &amp; customer wire proofs
          </span>
        </div>

        {filteredUploads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-slate-700">No client uploads match your criteria</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try clearing your search or status filter to see all client files.'
                : 'When clients submit wire transfers in the checkout modal, their confirmation screenshots & PDFs will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client &amp; Enterprise</th>
                  <th className="py-3 px-4">Uploaded File</th>
                  <th className="py-3 px-4">Transaction / UTR</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUploads.map((record) => {
                  const isPdf = record.fileType.includes('pdf') || record.fileName.toLowerCase().endsWith('.pdf');
                  const isPending = record.status === 'PENDING_REVIEW';
                  const isApproved = record.status === 'VERIFIED_APPROVED';
                  const isRejected = record.status === 'REJECTED';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Client info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{record.clientName}</div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{record.companyName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{record.clientEmail}</span>
                        </div>
                      </td>

                      {/* File Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-[200px] max-w-[280px]">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}>
                            {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate text-xs" title={record.fileName}>
                              {record.fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono">{record.fileSize}</span>
                              <span>&bull;</span>
                              <span className="uppercase text-[9px] font-bold text-slate-500">
                                {isPdf ? 'PDF Slip' : 'Screenshot'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* UTR & Transaction */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {record.wireTxRef || 'No UTR specified'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px] mt-0.5">
                          {record.planTitle || record.orderId || 'Direct Wire'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        {record.amountUsd ? (
                          <div className="font-mono font-black text-slate-900 text-xs">
                            ${record.amountUsd.toLocaleString()} USD
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">&mdash;</span>
                        )}
                        <span className="text-[10px] font-semibold text-blue-600 block">SWIFT Wire</span>
                      </td>

                      {/* Upload Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 text-[11px]">
                          {new Date(record.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(record.uploadedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified &bull; Right
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUploadForPreview(record)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Preview screenshot or PDF slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          {record.fileUrl && (
                            <a
                              href={record.fileUrl}
                              download={record.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title="Download original file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdatingStatus === record.id}
                                onClick={() => handleUpdateStatus(record.id, 'VERIFIED_APPROVED')}
                                className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Approve wire payment"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdatingStatus === record.id}
                                onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[11px] cursor-pointer disabled:opacity-50"
                                title="Reject slip"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW & AUDIT VERIFICATION MODAL */}
      {selectedUploadForPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUploadForPreview(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  {selectedUploadForPreview.fileType.includes('pdf') || selectedUploadForPreview.fileName.endsWith('.pdf') ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm text-white truncate max-w-md">
                    {selectedUploadForPreview.fileName}
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                    <span>{selectedUploadForPreview.companyName}</span>
                    <span>&bull;</span>
                    <span className="font-mono">{selectedUploadForPreview.clientEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedUploadForPreview.fileUrl && (
                  <a
                    href={selectedUploadForPreview.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Tab</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedUploadForPreview(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* Transaction Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Settlement Amount</span>
                  <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                    {selectedUploadForPreview.amountUsd ? `$${selectedUploadForPreview.amountUsd.toLocaleString()} USD` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bank UTR / Ref</span>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5 truncate select-all">
                    {selectedUploadForPreview.wireTxRef || 'Not specified'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Order / Plan</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {selectedUploadForPreview.planTitle || selectedUploadForPreview.orderId}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <div className="mt-0.5">
                    {selectedUploadForPreview.status === 'VERIFIED_APPROVED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ APPROVED
                      </span>
                    )}
                    {selectedUploadForPreview.status === 'PENDING_REVIEW' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        ⏳ PENDING
                      </span>
                    )}
                    {selectedUploadForPreview.status === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        ✕ REJECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Preview Stage */}
              <div className="bg-slate-100 rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center min-h-[360px] max-h-[500px] overflow-hidden relative">
                {selectedUploadForPreview.fileType.includes('pdf') || selectedUploadForPreview.fileName.endsWith('.pdf') ? (
                  <iframe
                    src={selectedUploadForPreview.fileUrl || selectedUploadForPreview.fileDataUrl}
                    title="Wire Slip PDF Preview"
                    className="w-full h-[460px] rounded-xl border border-slate-300 bg-white"
                  />
                ) : (
                  <img
                    src={selectedUploadForPreview.fileUrl || selectedUploadForPreview.fileDataUrl}
                    alt={selectedUploadForPreview.fileName}
                    className="max-h-[460px] max-w-full object-contain rounded-xl shadow-xs"
                  />
                )}
              </div>

              {/* Notes & Verification Details */}
              {selectedUploadForPreview.notes && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Client Notes / Transfer Details:</span>
                  </div>
                  <p className="text-[11px] text-blue-900 leading-relaxed font-normal">
                    {selectedUploadForPreview.notes}
                  </p>
                </div>
              )}

              {selectedUploadForPreview.adminVerificationNotes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 text-xs">
                    Admin Verification Ledger Note:
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {selectedUploadForPreview.adminVerificationNotes}
                  </p>
                  {selectedUploadForPreview.verifiedBy && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Verified by: {selectedUploadForPreview.verifiedBy} &bull; {selectedUploadForPreview.verifiedAt ? new Date(selectedUploadForPreview.verifiedAt).toLocaleString() : ''}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-slate-500 text-xs">
                File: <strong className="text-slate-800">{selectedUploadForPreview.fileName}</strong> ({selectedUploadForPreview.fileSize})
              </div>

              <div className="flex items-center gap-2">
                {selectedUploadForPreview.status !== 'VERIFIED_APPROVED' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus === selectedUploadForPreview.id}
                    onClick={() => handleUpdateStatus(selectedUploadForPreview.id, 'VERIFIED_APPROVED')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Mark Verified</span>
                  </button>
                )}

                {selectedUploadForPreview.status !== 'REJECTED' && (
                  <button
                    type="button"
                    disabled={isUpdatingStatus === selectedUploadForPreview.id}
                    onClick={() => handleUpdateStatus(selectedUploadForPreview.id, 'REJECTED')}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Slip</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedUploadForPreview(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL UPLOAD FOR CLIENT MODAL */}
      {isManualUploadOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsManualUploadOpen(false);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Record Client Wire Confirmation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload a wire slip received via email or WhatsApp</p>
              </div>
              <button
                type="button"
                onClick={() => setIsManualUploadOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualUpload} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Enterprise Name *</label>
                <input
                  type="text"
                  required
                  value={manualCompany}
                  onChange={e => setManualCompany(e.target.value)}
                  placeholder="e.g. IMPORTATION FADE-TECH (OTEC LTD)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={manualClientName}
                    onChange={e => setManualClientName(e.target.value)}
                    placeholder="e.g. Zachary Aldin (Zac)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Email *</label>
                  <input
                    type="email"
                    required
                    value={manualClientEmail}
                    onChange={e => setManualClientEmail(e.target.value)}
                    placeholder="e.g. zac@otec.ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    value={manualAmountUsd}
                    onChange={e => setManualAmountUsd(e.target.value)}
                    placeholder="590"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Wire UTR / Ref</label>
                  <input
                    type="text"
                    value={manualUtr}
                    onChange={e => setManualUtr(e.target.value)}
                    placeholder="e.g. MT103-AU-2026-984"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Receipt / Slip (Screenshot or PDF) *</label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf,application/pdf"
                  onChange={handleManualFileSelect}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer"
                />
                {manualFile && (
                  <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ready to upload: {manualFile.name} ({manualFile.size})</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Wire Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
