import React from 'react';
import { DetailedVendorProfile } from '../../types';
import { SlidersHorizontal, MapPin, Building2, TrendingUp, X, ShieldCheck, Share2 } from 'lucide-react';
import { SafeImage } from '../common/SafeImage';

interface Props {
  profile: DetailedVendorProfile;
  isAuthorizedToEdit: boolean;
  onOpenMediaStudio: () => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
  activeTab?: 'OVERVIEW' | 'CATALOG' | 'COMPLIANCE' | 'FACTORY_QC';
}

export const CompanyHeader: React.FC<Props> = ({
  profile,
  isAuthorizedToEdit,
  onOpenMediaStudio,
  isModalView,
  onCloseModal,
  activeTab = 'OVERVIEW'
}) => {
  const effectiveTier = (() => {
    try {
      const raw = localStorage.getItem('th_supplier_tier_overrides_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        const sid = String(profile.id || '').toLowerCase().trim();
        const semail = String(profile.contactEmail || '').toLowerCase().trim();
        const override = parsed[sid] || parsed[semail];
        if (override) return override.tier;
      }
    } catch {}
    return profile.memberTierLabel || `${profile.tier} Verified Exporter`;
  })();

  const isFreeMember = String(effectiveTier).toLowerCase().includes('free');
  const isBasicPlan = !isFreeMember && String(effectiveTier).toLowerCase().includes('basic plan');

  const handleShareClick = () => {
    window.dispatchEvent(
      new CustomEvent('tradeheaven_open_share', {
        detail: {
          type: 'STOREFRONT',
          id: profile.id,
          tab: activeTab,
          title: profile.companyName,
          subtitle: `${profile.city}, ${profile.country} • ${profile.businessType} • ${profile.responseRate} Response Rate`
        }
      })
    );
  };

  const safeCompName = (profile.companyName || 'Verified Exporter').replace(/[\uD800-\uDFFF&<>"']/g, ' ');
  const safeReg = (profile.legalRegistrationNumber || 'ISO-9001-VERIFIED').replace(/[\uD800-\uDFFF&<>"']/g, ' ');
  const asciiParts = safeCompName
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const initials = (
    asciiParts.length >= 2
      ? `${asciiParts[0][0]}${asciiParts[1][0]}`
      : (asciiParts[0] || 'TH').slice(0, 2)
  ).toUpperCase();

  const HEADER_PALETTES: Array<[string, string, string]> = [
    ['#064E3B', '#047857', '#6EE7B7'],
    ['#7F1D1D', '#B91C1C', '#FCA5A5'],
    ['#1E3A8A', '#1D4ED8', '#93C5FD'],
    ['#4C1D95', '#6D28D9', '#C4B5FD'],
    ['#78350F', '#B45309', '#FCD34D'],
    ['#134E4A', '#0F766E', '#5EEAD4'],
    ['#831843', '#BE185D', '#F9A8D4'],
    ['#312E81', '#4338CA', '#A5B4FC'],
    ['#7C2D12', '#C2410C', '#FDBA74'],
    ['#0C4A6E', '#0369A1', '#7DD3FC']
  ];
  let compHash = 0;
  for (let i = 0; i < safeCompName.length; i++) {
    compHash = (compHash * 31 + safeCompName.charCodeAt(i)) >>> 0;
  }
  const [cStart, cEnd, cAccent] = HEADER_PALETTES[compHash % HEADER_PALETTES.length];

  const encodeSvgUri = (svg: string) => {
    try {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/[^\x20-\x7E]/g, ' '))}`;
    }
  };

  const bespokeBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="420" viewBox="0 0 1440 420"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${cStart}"/><stop offset="100%" stop-color="${cEnd}"/></linearGradient></defs><rect width="1440" height="420" fill="url(#bg)"/><circle cx="1220" cy="190" r="240" fill="none" stroke="${cAccent}" stroke-width="2" opacity="0.25"/><circle cx="1220" cy="190" r="170" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.18"/><rect x="52" y="38" width="560" height="38" rx="8" fill="#090D16" fill-opacity="0.45" stroke="${cAccent}" stroke-width="1.5"/><text x="72" y="62" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${cAccent}" letter-spacing="1.8">OFFICIAL CORPORATE STOREFRONT • REG: ${safeReg}</text><text x="52" y="138" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF" opacity="0.18" letter-spacing="3">${safeCompName.toUpperCase()}</text></svg>`;
  const bespokeBannerDataUri = encodeSvgUri(bespokeBannerSvg);

  const bespokeLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="crest" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${cStart}"/><stop offset="100%" stop-color="${cEnd}"/></linearGradient></defs><rect width="240" height="240" rx="36" fill="url(#crest)"/><rect x="14" y="14" width="212" height="212" rx="28" fill="none" stroke="${cAccent}" stroke-width="4"/><text x="120" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="76" font-weight="bold" fill="#FFFFFF" letter-spacing="2">${initials}</text><text x="120" y="188" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="${cAccent}" letter-spacing="1.5">VERIFIED OEM</text></svg>`;
  const bespokeLogoDataUri = encodeSvgUri(bespokeLogoSvg);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Panoramic 16:9 Executive Corporate Storefront Banner */}
      <div className="relative h-56 sm:h-72 md:h-80 w-full bg-slate-950">
        <SafeImage
          src={bespokeBannerDataUri}
          alt={`${profile.companyName} Official Corporate Banner`}
          supplierName={profile.companyName}
          targetWidth={1280}
          priority={true}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs backdrop-blur-md border border-blue-400/40 shadow-lg transition-all cursor-pointer hover:scale-105"
            title="Share Direct Link to this Storefront"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-200" />
            <span>Share Storefront</span>
          </button>
          {isAuthorizedToEdit && (
            <button
              onClick={onOpenMediaStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs backdrop-blur-md border border-white/20 shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Manage Media Studio</span>
            </button>
          )}
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-start sm:items-end gap-4">
            <div className="relative shrink-0">
              <SafeImage
                src={bespokeLogoDataUri}
                alt={`${profile.companyName} Corporate Crest`}
                supplierName={profile.companyName}
                type="logo"
                isThumbnail={true}
                targetWidth={320}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white bg-slate-900 object-cover shadow-2xl"
              />
              <div className={`absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                isFreeMember
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : isBasicPlan
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-amber-400 text-slate-950 border-amber-300'
              }`}>
                {isFreeMember ? 'FREE MEMBER' : isBasicPlan ? 'BASIC PLAN' : `${profile.tier} TIER`}
              </div>
            </div>

            <div className="text-white space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold tracking-wide uppercase border shadow-xs ${
                  isFreeMember
                    ? 'bg-slate-700/95 border-slate-500'
                    : isBasicPlan
                    ? 'bg-slate-700/95 border-slate-500'
                    : 'bg-blue-600/90 border-blue-400'
                }`}>
                  {effectiveTier}
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
