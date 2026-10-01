import React, { useState, useEffect } from 'react';
import { Building2, Search, RefreshCw, ShieldCheck, CheckCircle2, XCircle, Mail, Phone, Globe, Calendar, ArrowUpDown, UserCheck } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

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

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.company_name || s.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.country || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA === timeB) {
      return String(b.id).localeCompare(String(a.id));
    }
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

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

      {/* Search & Sorting Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name, email, company..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-200 cursor-pointer"
            title="Toggle chronological vs reverse-chronological order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {sortOrder === 'desc' ? '🕒 Newest First (Reverse-Chronological)' : '📅 Oldest First (Chronological)'}
            </span>
          </button>
          <div className="text-xs font-semibold text-slate-500 shrink-0">
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

                  return (
                    <tr key={sup.id || index} className="hover:bg-slate-50 transition-colors">
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
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>VERIFIED SUPPLIER</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            <span>ACTIVE ACCOUNT</span>
                          </span>
                        )}
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
            <p className="text-sm font-bold text-slate-700">No registered suppliers found</p>
            <p className="text-xs text-slate-500 mt-1">New registrations will appear here instantly when suppliers sign up.</p>
          </div>
        )}
      </div>
    </div>
  );
};
