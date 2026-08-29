import React from 'react';
import { DetailedVendorProfile } from '../../types';
import { SlidersHorizontal, MapPin, Building2, TrendingUp, X, ShieldCheck } from 'lucide-react';

interface Props {
  profile: DetailedVendorProfile;
  isAuthorizedToEdit: boolean;
  onOpenMediaStudio: () => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

export const CompanyHeader: React.FC<Props> = ({
  profile,
  isAuthorizedToEdit,
  onOpenMediaStudio,
  isModalView,
  onCloseModal,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Panoramic 16:9 Cover Banner */}
      <div className="relative h-56 sm:h-72 md:h-80 w-full bg-slate-900">
        <img
          src={profile.bannerUrl || undefined}
          alt={`${profile.companyName} Factory Banner`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {isAuthorizedToEdit && (
            <button
              onClick={onOpenMediaStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs backdrop-blur-md border border-white/20 shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Manage Media Studio</span>
            </button>
          )}

          {isModalView && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-start sm:items-end gap-4">
            <div className="relative shrink-0">
              <img
                src={profile.logoUrl || undefined}
                alt={`${profile.companyName} Logo`}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white bg-white object-cover shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-sm border border-amber-300">
                {profile.tier} TIER
              </div>
            </div>

            <div className="text-white space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold tracking-wide uppercase border border-blue-400 shadow-xs">
                  {profile.memberTierLabel || `${profile.tier} Verified Exporter`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 border border-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  KYC Audited ({profile.legalRegistrationNumber})
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                {profile.companyName}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-200 flex-wrap font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{profile.city}, {profile.country}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{profile.businessType}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-emerald-300 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{profile.responseRate} Response Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
