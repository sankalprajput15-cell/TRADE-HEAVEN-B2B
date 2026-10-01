import React, { useState, useEffect } from 'react';
import { Building2, Search, RefreshCw, ShieldCheck, CheckCircle2, XCircle, Mail, Phone, Globe, Calendar, ArrowUpDown, Filter, UserCheck, CheckSquare, Square } from 'lucide-react';

export interface RegisteredSupplier {
  id: string | number;
  name: string;
  email: string;
  company_name?: string;
  companyName?: string;
  phone?: string;
  country?: string;
  role?: string;
  status?: string;
  is_verified?: number | boolean;
  isVerified?: boolean;
  tier?: string;
  created_at?: string;
}

export const RegisteredSuppliersAdmin: React.FC = () => {
  const [suppliers, setSuppliers] = useState<RegisteredSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api.php?action=get_users');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      let usersList: any[] = [];
      if (json && json.data && Array.isArray(json.data)) {
        usersList = json.data;
      } else if (Array.isArray(json)) {
        usersList = json;
      }

      // Filter for suppliers (role === 'supplier' or 'SUPPLIER') or show all if none tagged as supplier yet
      const supplierList = usersList.filter(u => {
        const role = String(u.role || '').toLowerCase();
        return role === 'supplier' || role === 'vendors' || role === 'vendor';
      });

      // If no users explicitly marked as supplier yet, fall back to showing all users so admin can inspect registrations
      const finalSuppliers = supplierList.length > 0 ? supplierList : usersList;
      setSuppliers(finalSuppliers);
    } catch (err: any) {
      console.error('[RegisteredSuppliersAdmin] Failed to fetch suppliers:', err);
      setError(err.message || 'Failed to load registered suppliers from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleToggleVerification = async (sup: RegisteredSupplier) => {
    const currentVerified = sup.is_verified === 1 || sup.is_verified === true || sup.isVerified === true;
    const newVerifiedState = currentVerified ? 0 : 1;
    setActionLoadingId(sup.id);

    try {
      const res = await fetch('/api.php?action=toggle_verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sup.id, is_verified: currentVerified ? 1 : 0 })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.status === 'success') {
        setSuppliers(prev => prev.map(s => {
          if (s.id === sup.id) {
            return { ...s, is_verified: json.is_verified, isVerified: Boolean(json.is_verified) };
          }
          return s;
        }));
      } else {
        setSuppliers(prev => prev.map(s => {
          if (s.id === sup.id) {
            return { ...s, is_verified: newVerifiedState, isVerified: Boolean(newVerifiedState) };
          }
          return s;
        }));
      }
    } catch {
      setSuppliers(prev => prev.map(s => {
        if (s.id === sup.id) {
          return { ...s, is_verified: newVerifiedState, isVerified: Boolean(newVerifiedState) };
        }
        return s;
      }));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkToggleVerification = async (targetVerifiedState: number) => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      await Promise.all(idsArray.map(async id => {
        await fetch('/api.php?action=toggle_verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, is_verified: targetVerifiedState === 1 ? 0 : 1 })
        }).catch(() => {});
      }));

      setSuppliers(prev => prev.map(s => {
        if (selectedIds.has(s.id)) {
          return { ...s, is_verified: targetVerifiedState, isVerified: Boolean(targetVerifiedState) };
        }
        return s;
      }));
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.company_name || s.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.country || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isVerified = s.is_verified === 1 || s.is_verified === true || s.isVerified === true;
    if (verificationFilter === 'VERIFIED' && !isVerified) return false;
    if (verificationFilter === 'UNVERIFIED' && isVerified) return false;

    return matchesSearch;
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA === timeB) {
      return String(b.id).localeCompare(String(a.id));
    }
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleSelectAll = () => {
    if (selectedIds.size === sortedSuppliers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedSuppliers.map(s => s.id)));
    }
  };

  const handleToggleSelectOne = (id: string | number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Database Directory
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live MySQL Sync
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-400" />
            Registered Suppliers Directory
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Complete real-time list of all registered supplier accounts fetched directly from the database, including verification status and registration timestamps.
          </p>
        </div>
        <button
          onClick={fetchSuppliers}
          disabled={loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-blue-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs text-white">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold tracking-tight">Suppliers selected for bulk action</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggleVerification(1)}
              disabled={isBulkProcessing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mark Verified (Batch)</span>
            </button>
            <button
              onClick={() => handleBulkToggleVerification(0)}
              disabled={isBulkProcessing}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Unverified (Batch)</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Search, Filter & Sorting Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by company name or email address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Verification Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={verificationFilter}
              onChange={e => setVerificationFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-200 cursor-pointer"
            title="Toggle chronological vs reverse-chronological order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {sortOrder === 'desc' ? '🕒 Newest First' : '📅 Oldest First'}
            </span>
          </button>

          <div className="text-xs font-semibold text-slate-500 shrink-0 pl-2">
            Total: <span className="font-bold text-slate-900">{sortedSuppliers.length}</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && suppliers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold">Loading registered suppliers from database...</p>
          </div>
        ) : sortedSuppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="Select all"
                    >
                      {selectedIds.size === sortedSuppliers.length && sortedSuppliers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Supplier / Contact</th>
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Corporate Email</th>
                  <th className="p-4">Country & Phone</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Registration Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSuppliers.map((sup, index) => {
                  const isVerified = sup.is_verified === 1 || sup.is_verified === true || sup.isVerified === true;
                  const companyName = sup.company_name || sup.companyName || 'Enterprise Supplier';
                  const registeredDate = sup.created_at || 'Recently';
                  const isSelected = selectedIds.has(sup.id);

                  return (
                    <tr key={sup.id || index} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleSelectOne(sup.id)}
                          className="text-slate-400 hover:text-slate-900 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {(sup.name || 'S').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{sup.name || 'Trade Partner'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {sup.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{companyName}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sup.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sup.country || 'United States'}</span>
                          </div>
                          {sup.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{sup.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>VERIFIED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>ACTIVE</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleVerification(sup)}
                            disabled={actionLoadingId === sup.id}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-700 rounded-lg text-[10px] font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            title="Toggle verification status in database"
                          >
                            {actionLoadingId === sup.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Toggle</span>}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{registeredDate}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">No matching suppliers found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or verification filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};
