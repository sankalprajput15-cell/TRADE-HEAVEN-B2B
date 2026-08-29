import React, { useState, useEffect } from 'react';
import { CompanyProfile, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Calendar, 
  Factory, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  Crown,
  Lock,
  Mail,
  Phone
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenStorefront: (companyId: string) => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
}

export const SuppliersDirectoryView: React.FC<Props> = ({
  selectedCurrency,
  onOpenStorefront,
  currentUser = null,
  onOpenUpgradeModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  useEffect(() => {
    setIsLoading(true);
    api.getSuppliers(currentUser).then(data => {
      setCompanies(data);
      setIsLoading(false);
    });
  }, [currentUser]);

  const filtered = companies.filter(c => {
    const matchesSearch = searchTerm === '' ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const isUserPremium = currentUser?.role === 'ADMIN' || currentUser?.isPremium === true;

  return (
    <div id="suppliers-directory-root" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Award className="w-3.5 h-3.5" />
            <span>Audited Global Manufacturers &amp; Tier-1 Exporters (ISO / CE / SGS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Audited Exporter &amp; Factory Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
            Inspect on-site factory audit certificates, production capacity, machine lines, and verified contact channels. Server-side security gates raw corporate contacts for premium members.
          </p>
        </div>
      </div>

      {/* Access Clearance Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 flex-wrap ${
        isUserPremium 
          ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex items-center gap-2.5">
          {isUserPremium ? (
            <Crown className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
          )}
          <span className="font-semibold">
            {isUserPremium 
              ? 'Premium Corporate Sourcing Clearance: Supplier export manager emails, direct WhatsApp lines, and phones are unmasked.'
              : 'Standard Guest Access: Direct factory export desk telephone numbers and emails are masked. Upgrade to access direct contact details.'}
          </span>
        </div>

        {!isUserPremium && onOpenUpgradeModal && (
          <button
            onClick={onOpenUpgradeModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Unlock Direct Factory Lines</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by factory name, country, or machinery..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'GOLD', 'VERIFIED', 'PLATINUM'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTier === tier
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'All Exporter Tiers' : `${tier} Tier`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono shrink-0">
          <strong>{filtered.length}</strong> Verified Exporters
        </div>
      </div>

      {/* Factories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(company => (
          <div
            key={company.id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              {/* Banner */}
              <div 
                onClick={() => onOpenStorefront(company.id)}
                className="relative h-36 w-full bg-slate-100 overflow-hidden cursor-pointer group"
              >
                <img
                  src={company.bannerUrl || undefined}
                  alt={company.companyName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                    {company.tier} EXPORTER
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div 
                  onClick={() => onOpenStorefront(company.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={company.logoUrl || undefined}
                    alt={company.companyName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-white -mt-10 shadow-md relative z-10"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                      {company.companyName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{company.country}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400">Factory Area:</span>
                    <div className="font-bold text-slate-900">
                      {company.factorySizeSqM && company.factorySizeSqM > 0 
                        ? `${company.factorySizeSqM.toLocaleString()} m²` 
                        : 'Trading/Desk'}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400">trade protection Limit:</span>
                    <div className="font-mono font-bold text-emerald-600">${(company.tradeAssuranceLimitUsd / 1000).toFixed(0)}k</div>
                  </div>
                </div>

                {/* Direct Contact Clearance Gated Component */}
                <div className="pt-2 border-t border-slate-100">
                  <PremiumContactGate
                    currentUser={currentUser}
                    onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                    isMasked={Boolean(company.isContactMasked)}
                    resourceTitle="Factory Export Desk Contact"
                  >
                    <div className="space-y-1 text-xs text-slate-700">
                      <div><strong>Email:</strong> {company.contactEmail ? securityService.maskEmailAddress(company.contactEmail) : 'Contact via Inquiry Form'}</div>
                      <div><strong>Phone:</strong> {company.contactPhone ? securityService.maskPhoneNumber(company.contactPhone) : 'Contact via Inquiry Form'}</div>
                    </div>
                  </PremiumContactGate>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Verified Certifications:</div>
                  <div className="flex flex-wrap gap-1">
                    {(company.certifications || []).slice(0, 3).map((cert, idx) => (
                      <span key={`${company.id}-${cert || 'no-cert'}-${idx}`} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button 
                onClick={() => onOpenStorefront(company.id)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Storefront &amp; Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
