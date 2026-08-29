import React from 'react';
import { DetailedVendorProfile } from '../../types';
import { BarChart3, CheckCircle2, ShieldCheck, TrendingUp, Package } from 'lucide-react';

interface Props {
  profile: DetailedVendorProfile;
}

export const SupplierPerformanceDashboard: React.FC<Props> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Trust Score</div>
          <div className="text-xl font-black text-slate-900">{profile.trustScore}/100</div>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Package className="w-5 h-5" /></div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Orders Completed</div>
          <div className="text-xl font-black text-slate-900">{profile.completedOrdersCount}</div>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Response Rate</div>
          <div className="text-xl font-black text-slate-900">{profile.responseRate}</div>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><BarChart3 className="w-5 h-5" /></div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Member Since</div>
          <div className="text-xl font-black text-slate-900">{profile.establishedYear}</div>
        </div>
      </div>
    </div>
  );
};
