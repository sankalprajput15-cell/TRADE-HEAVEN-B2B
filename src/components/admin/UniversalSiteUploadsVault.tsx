import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderLock, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Copy, 
  Trash2, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode, 
  ShieldCheck, 
  Building2, 
  Mail, 
  User, 
  Tag, 
  X, 
  Check, 
  Plus, 
  Grid, 
  List, 
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export interface MasterUploadItem {
  id: string;
  name: string;
  originalName: string;
  url: string;
  sizeBytes: number;
  sizeFormatted: string;
  extension: string;
  mimeType: string;
  category: 'PAYMENT_SLIP' | 'CONTRACT_AGREEMENT' | 'SUPPLIER_KYC' | 'PRODUCT_MEDIA' | 'CHAT_DESK' | 'MARKETING_ASSET' | 'GENERAL_DOCUMENT';
  categoryLabel: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderRole: 'BUYER' | 'SUPPLIER' | 'ADMIN' | 'SYSTEM';
  companyName: string;
  status: 'APPROVED' | 'PENDING' | 'FLAGGED' | 'ARCHIVED';
  uploadedAt: string;
  diskPath?: string;
  notes?: string;
  referenceCode?: string;
  amountUsd?: number;
}

interface Props {
  currentUserEmail?: string;
}

export const UniversalSiteUploadsVault: React.FC<Props> = ({
  currentUserEmail = 'admin@tradeheaven.net'
}) => {
  const [items, setItems] = useState<MasterUploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Preview & Edit modal states
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<MasterUploadItem | null>(null);
  const [editingItem, setEditingItem] = useState<MasterUploadItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Universal Uploader Form State
  const [newFile, setNewFile] = useState<{ file: File; name: string; size: string; type: string; base64: string } | null>(null);
  const [newCategory, setNewCategory] = useState<MasterUploadItem['category']>('GENERAL_DOCUMENT');
  const [newUploaderName, setNewUploaderName] = useState('Admin (Sankalp Rajput)');
  const [newUploaderEmail, setNewUploaderEmail] = useState(currentUserEmail);
  const [newUploaderRole, setNewUploaderRole] = useState<MasterUploadItem['uploaderRole']>('ADMIN');
  const [newCompany, setNewCompany] = useState('Trade Heaven Administration');
  const [newRefCode, setNewRefCode] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAmountUsd, setNewAmountUsd] = useState('');
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/master-uploads', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.items)) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch master uploads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.originalName.toLowerCase().includes(q) ||
        item.uploaderName.toLowerCase().includes(q) ||
        item.uploaderEmail.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        (item.referenceCode && item.referenceCode.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesRole = roleFilter === 'ALL' || item.uploaderRole === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      let matchesFormat = true;
      if (formatFilter === 'PDF') {
        matchesFormat = item.extension === 'PDF' || item.mimeType.includes('pdf');
      } else if (formatFilter === 'IMAGE') {
        matchesFormat = ['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG', 'GIF'].includes(item.extension) || item.mimeType.includes('image');
      } else if (formatFilter === 'SPREADSHEET') {
        matchesFormat = ['CSV', 'XLS', 'XLSX'].includes(item.extension);
      }

      return matchesSearch && matchesCat && matchesRole && matchesStatus && matchesFormat;
    });
  }, [items, searchQuery, categoryFilter, roleFilter, formatFilter, statusFilter]);

  // Actions
  const handleCopyLink = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    showToast('success', `Copied link to clipboard: ${url}`);
  };

  const handleUpdateStatus = async (id: string, newStatus: MasterUploadItem['status']) => {
    try {
      const res = await fetch(`/api/v1/admin/master-uploads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
        if (selectedItemForPreview?.id === id) {
          setSelectedItemForPreview(prev => prev ? { ...prev, status: newStatus } : null);
        }
        showToast('success', `File marked as ${newStatus}`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tradeheaven_notify', {
            detail: {
              type: 'EDIT',
              title: 'Vault File Status Changed',
              message: `Asset status updated to ${newStatus}.`,
              linkView: 'admin'
            }
          }));
        }
      }
    } catch {
      showToast('error', 'Failed to update file status');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the asset vault?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/master-uploads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
        if (selectedItemForPreview?.id === id) setSelectedItemForPreview(null);
        showToast('success', `Deleted "${name}" successfully.`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tradeheaven_notify', {
            detail: {
              type: 'DELETE',
              title: 'Asset Deleted from Vault',
              message: `Permanently removed "${name}" from the asset vault.`,
              linkView: 'admin'
            }
          }));
        }
      }
    } catch {
      showToast('error', 'Failed to delete asset');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeInKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setNewFile({
        file,
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        base64: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUniversalUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile) {
      showToast('error', 'Please choose a file to upload.');
      return;
    }

    setIsSubmittingUpload(true);
    try {
      const res = await fetch('/api/v1/admin/master-uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: newFile.name,
          base64Data: newFile.base64,
          mimeType: newFile.type,
          category: newCategory,
          uploaderName: newUploaderName,
          uploaderEmail: newUploaderEmail,
          uploaderRole: newUploaderRole,
          companyName: newCompany,
          notes: newNotes,
          referenceCode: newRefCode,
          amountUsd: newAmountUsd ? parseFloat(newAmountUsd) : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.item) {
          setItems(prev => [data.item, ...prev]);
        }
        showToast('success', `File "${newFile.name}" uploaded & saved to asset vault!`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tradeheaven_notify', {
            detail: {
              type: 'UPLOAD',
              title: 'File Uploaded to Vault',
              message: `Uploaded "${newFile.name}" (${newFile.size}) to the Universal Asset Vault.`,
              linkView: 'admin'
            }
          }));
        }
        setIsUploadModalOpen(false);
        setNewFile(null);
        setNewRefCode('');
        setNewNotes('');
        setNewAmountUsd('');
        fetchUploads();
      } else {
        showToast('error', 'Server error while uploading file.');
      }
    } catch {
      showToast('error', 'Network error during file upload.');
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  // Metrics
  const totalFiles = items.length;
  const totalPaymentSlips = items.filter(i => i.category === 'PAYMENT_SLIP').length;
  const totalAgreements = items.filter(i => i.category === 'CONTRACT_AGREEMENT').length;
  const totalKycDocs = items.filter(i => i.category === 'SUPPLIER_KYC').length;
  const totalProductMedia = items.filter(i => i.category === 'PRODUCT_MEDIA').length;
  const totalChatSlips = items.filter(i => i.category === 'CHAT_DESK').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 border ${
          toastMsg.type === 'success' 
            ? 'bg-slate-900 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40' 
            : 'bg-rose-950 text-rose-100 border-rose-500/50 shadow-rose-950/40'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* MASTER VAULT HEADER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <FolderLock className="w-3.5 h-3.5 text-blue-400" />
              <span>Universal Site Uploads &amp; Master File Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Master File &amp; Asset Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-2xl leading-relaxed">
              One centralized hub to <strong>check, inspect, preview, download, and manage everything uploaded on the site by anyone</strong> &mdash; client wire receipts, signed bilateral contracts, supplier KYC audits, WhatsApp chat media, product catalog images, and platform assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchUploads}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Sync Disk &amp; DB</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Anything to Site</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Uploads</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalFiles}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Scanned files on site</div>
          </div>

          <div className="p-3 bg-blue-950/40 rounded-2xl border border-blue-900/50">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Payment Slips</div>
            <div className="text-2xl font-black text-blue-200 mt-0.5">{totalPaymentSlips}</div>
            <div className="text-[10px] text-blue-400 font-medium mt-0.5">Client SWIFT &amp; UTR</div>
          </div>

          <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-900/50">
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Contracts / PDFs</div>
            <div className="text-2xl font-black text-amber-200 mt-0.5">{totalAgreements}</div>
            <div className="text-[10px] text-amber-400 font-medium mt-0.5">Signed trade agreements</div>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-900/50">
            <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Supplier KYC</div>
            <div className="text-2xl font-black text-emerald-200 mt-0.5">{totalKycDocs}</div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">Audits &amp; Certs</div>
          </div>

          <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-900/50">
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Product Media</div>
            <div className="text-2xl font-black text-purple-200 mt-0.5">{totalProductMedia}</div>
            <div className="text-[10px] text-purple-400 font-medium mt-0.5">Catalog &amp; Gallery</div>
          </div>

          <div className="p-3 bg-teal-950/40 rounded-2xl border border-teal-900/50">
            <div className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Chat &amp; Desk</div>
            <div className="text-2xl font-black text-teal-200 mt-0.5">{totalChatSlips}</div>
            <div className="text-[10px] text-teal-400 font-medium mt-0.5">WhatsApp &amp; Support</div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search bar & View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, client/supplier name, company, email, or UTR/memo code..."
              className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Detailed Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {[
            { id: 'ALL', label: 'All Files' },
            { id: 'PAYMENT_SLIP', label: '💳 Payment Slips' },
            { id: 'CONTRACT_AGREEMENT', label: '📜 Contracts' },
            { id: 'SUPPLIER_KYC', label: '🛡️ Supplier KYC' },
            { id: 'PRODUCT_MEDIA', label: '📦 Product Media' },
            { id: 'CHAT_DESK', label: '💬 Chat Media' },
            { id: 'MARKETING_ASSET', label: '🎨 Marketing' },
            { id: 'GENERAL_DOCUMENT', label: '📄 General Docs' }
          ].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === c.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {c.label}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {/* Format Filter */}
          <span className="text-[11px] font-bold text-slate-400">Format:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PDF', label: 'PDFs' },
            { id: 'IMAGE', label: 'Images' },
            { id: 'SPREADSHEET', label: 'CSVs' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormatFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                formatFilter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {/* Role Filter */}
          <span className="text-[11px] font-bold text-slate-400">Uploaded By:</span>
          {[
            { id: 'ALL', label: 'Everyone' },
            { id: 'BUYER', label: 'Buyers' },
            { id: 'SUPPLIER', label: 'Suppliers' },
            { id: 'ADMIN', label: 'Admin' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRoleFilter(r.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                roleFilter === r.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ASSET LIST / GRID VIEW */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FolderLock className="w-7 h-7" />
          </div>
          <div className="font-bold text-slate-800 text-sm">No uploaded assets match your filters</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Try adjusting your search keywords, category filters, or click &ldquo;Upload Anything to Site&rdquo; to add a new document or image.
          </p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const isPdf = item.extension === 'PDF' || item.mimeType.includes('pdf');
            const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG', 'GIF'].includes(item.extension) || item.mimeType.includes('image');

            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div>
                  {/* Category Pill & Status Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 truncate max-w-[170px]">
                      {item.categoryLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      item.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Thumbnail / File Icon Preview Stage */}
                  <div 
                    onClick={() => setSelectedItemForPreview(item)}
                    className="w-full h-36 bg-slate-100 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center cursor-pointer group-hover:border-blue-400 transition-all relative"
                  >
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : isPdf ? (
                      <div className="text-center p-3 space-y-1">
                        <FileText className="w-10 h-10 text-rose-600 mx-auto" />
                        <span className="text-[10px] font-black uppercase text-rose-700 block">PDF Document</span>
                        <span className="text-[9px] text-slate-400 font-mono block">Click to view in reader</span>
                      </div>
                    ) : (
                      <div className="text-center p-3 space-y-1">
                        <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                        <span className="text-[10px] font-black uppercase text-slate-600 block">{item.extension}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Eye className="w-3 h-3" /> Preview
                      </span>
                    </div>
                  </div>

                  {/* File Title & Info */}
                  <div className="mt-3 space-y-1">
                    <h3 
                      className="font-black text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.companyName}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>{item.sizeFormatted} &bull; {item.extension}</span>
                      <span className="text-slate-600 font-bold">{item.uploaderRole}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedItemForPreview(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Preview Document / Image"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>

                    <a
                      href={item.url}
                      download={item.name}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.url)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="Copy Public Link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.status !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer"
                        title="Mark Approved / Verified"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">File Name &amp; Category</th>
                  <th className="py-3.5 px-4">Uploaded By</th>
                  <th className="py-3.5 px-4">Format / Size</th>
                  <th className="py-3.5 px-4">Ref Code / Amount</th>
                  <th className="py-3.5 px-4">Date Uploaded</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 max-w-[280px]">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                          {item.extension === 'PDF' ? <FileText className="w-4 h-4 text-rose-600" /> : <ImageIcon className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate text-xs" title={item.name}>
                            {item.name}
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold block truncate">
                            {item.categoryLabel}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.uploaderName}</div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate max-w-[180px]">
                        {item.companyName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.uploaderEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{item.extension}</div>
                      <div className="text-[10px] text-slate-500">{item.sizeFormatted}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.amountUsd ? (
                        <div className="font-mono font-black text-slate-900 text-xs">
                          ${item.amountUsd.toLocaleString()} USD
                        </div>
                      ) : null}
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                        {item.referenceCode || 'No Ref'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 text-[11px]">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        item.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedItemForPreview(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <a
                          href={item.url}
                          download={item.name}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(item.url)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL-SCREEN LIVE PREVIEW MODAL */}
      {selectedItemForPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItemForPreview(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  {selectedItemForPreview.extension === 'PDF' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm text-white truncate max-w-lg">
                    {selectedItemForPreview.name}
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                    <span>{selectedItemForPreview.categoryLabel}</span>
                    <span>&bull;</span>
                    <span>{selectedItemForPreview.companyName}</span>
                    <span>&bull;</span>
                    <span className="font-mono">{selectedItemForPreview.sizeFormatted}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedItemForPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open In New Tab</span>
                </a>

                <a
                  href={selectedItemForPreview.url}
                  download={selectedItemForPreview.name}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedItemForPreview(null)}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Uploader</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                    {selectedItemForPreview.uploaderName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {selectedItemForPreview.uploaderEmail}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enterprise / Org</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                    {selectedItemForPreview.companyName}
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-800 mt-1 inline-block">
                    {selectedItemForPreview.uploaderRole}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ref / Value</span>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5 truncate">
                    {selectedItemForPreview.referenceCode || 'No Reference Code'}
                  </div>
                  {selectedItemForPreview.amountUsd ? (
                    <span className="text-emerald-700 font-mono font-bold text-[11px] block mt-0.5">
                      ${selectedItemForPreview.amountUsd.toLocaleString()} USD
                    </span>
                  ) : null}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Status</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      selectedItemForPreview.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      selectedItemForPreview.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedItemForPreview.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Stage */}
              <div className="bg-slate-100 rounded-2xl border border-slate-300 p-2 sm:p-4 flex items-center justify-center min-h-[420px] max-h-[580px] overflow-hidden relative">
                {selectedItemForPreview.extension === 'PDF' || selectedItemForPreview.mimeType.includes('pdf') ? (
                  <iframe
                    src={selectedItemForPreview.url}
                    title="Document Previewer"
                    className="w-full h-[540px] rounded-xl border border-slate-300 bg-white shadow-xs"
                  />
                ) : ['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG', 'GIF'].includes(selectedItemForPreview.extension) ? (
                  <img
                    src={selectedItemForPreview.url}
                    alt={selectedItemForPreview.name}
                    className="max-h-[540px] max-w-full object-contain rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileSpreadsheet className="w-16 h-16 text-slate-400 mx-auto" />
                    <div className="font-bold text-slate-700 text-sm">{selectedItemForPreview.name}</div>
                    <p className="text-xs text-slate-500">
                      This file format ({selectedItemForPreview.extension}) is ready to download.
                    </p>
                    <a
                      href={selectedItemForPreview.url}
                      download={selectedItemForPreview.name}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
                    >
                      <Download className="w-4 h-4" /> Download File
                    </a>
                  </div>
                )}
              </div>

              {selectedItemForPreview.notes && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block text-xs">Description &amp; File Context:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {selectedItemForPreview.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Change Status:</span>
                {(['APPROVED', 'PENDING', 'FLAGGED'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedItemForPreview.id, s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedItemForPreview.status === s
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedItemForPreview.url)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Direct URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItemForPreview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL UPLOADER MODAL ("Upload Anything to Site") */}
      {isUploadModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingUpload) setIsUploadModalOpen(false);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Upload Anything to Platform Asset Vault</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Universal uploader: Accepts images, PDF contracts, bank wire slips, specs, and documents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUniversalUpload} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              {/* File Dropzone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File (Any Format: PDF, JPG, PNG, CSV, etc.) *</label>
                <input
                  type="file"
                  required
                  onChange={handleFileSelect}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer"
                />
                {newFile && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{newFile.name} ({newFile.size})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 text-[10px] font-mono font-bold shrink-0">
                      {newFile.type}
                    </span>
                  </div>
                )}
              </div>

              {/* Category selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Category *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="PAYMENT_SLIP">💳 Payment Slip / Bank Wire Confirmation</option>
                  <option value="CONTRACT_AGREEMENT">📜 Bilateral Contract / Signed Agreement</option>
                  <option value="SUPPLIER_KYC">🛡️ Supplier KYC / Factory Audit / Certificate</option>
                  <option value="PRODUCT_MEDIA">📦 Product Media / Catalog / Listing Asset</option>
                  <option value="CHAT_DESK">💬 WhatsApp &amp; Desk Media Slip</option>
                  <option value="MARKETING_ASSET">🎨 Marketing Banner / Promotional Asset</option>
                  <option value="GENERAL_DOCUMENT">📄 General Platform Document</option>
                </select>
              </div>

              {/* Entity info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Enterprise Name</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    placeholder="e.g. IMPORTATION FADE-TECH"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Uploader Role</label>
                  <select
                    value={newUploaderRole}
                    onChange={e => setNewUploaderRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="BUYER">BUYER</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="SYSTEM">SYSTEM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={newUploaderName}
                    onChange={e => setNewUploaderName(e.target.value)}
                    placeholder="e.g. Zachary Aldin (Zac)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newUploaderEmail}
                    onChange={e => setNewUploaderEmail(e.target.value)}
                    placeholder="e.g. zac@otec.ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ref Code / UTR / Memo (Optional)</label>
                  <input
                    type="text"
                    value={newRefCode}
                    onChange={e => setNewRefCode(e.target.value)}
                    placeholder="e.g. UTR-2026-AU-984210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount in USD (If Payment)</label>
                  <input
                    type="number"
                    value={newAmountUsd}
                    onChange={e => setNewAmountUsd(e.target.value)}
                    placeholder="e.g. 590"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Internal Ledger Note</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Verified trade assurance contract signed by both parties on Nov 1, 2026."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingUpload}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpload}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold flex items-center gap-2 shadow-sm"
                >
                  {isSubmittingUpload ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading to Vault...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Save &amp; Store Asset</span>
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
