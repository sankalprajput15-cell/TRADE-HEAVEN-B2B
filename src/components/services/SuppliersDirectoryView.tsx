import React, { useState, useEffect } from 'react';
import { CompanyProfile, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { SafeImage } from '../common/SafeImage';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';
import { PaginationControls } from '../common/PaginationControls';
import { SearchRegistrationGate } from '../common/SearchAutoSuggestDropdown';
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
  Phone,
  Share2
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenStorefront: (companyId: string) => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  initialSearch?: string;
}

export const SuppliersDirectoryView: React.FC<Props> = ({
  selectedCurrency,
  onOpenStorefront,
  currentUser = null,
  onOpenUpgradeModal,
  initialSearch = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  useEffect(() => {
    setIsLoading(true);
    api.getSuppliers(currentUser).then(data => {
      setCompanies(data);
      setIsLoading(false);
    });
  }, [currentUser]);

  const filtered = companies.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.country || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.businessType || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.contactPerson || '').toLowerCase().includes(q) ||
      (c.contactEmail || '').toLowerCase().includes(q);
    const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTier]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCompanies = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isUserPremium = securityService.isAllowedToViewContacts(currentUser);

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
              ? 'Paid Member Sourcing Clearance: Full supplier street addresses, direct emails, phone numbers, and Bank transfer details are unlocked.'
              : 'Standard Guest Access: Direct supplier street addresses, telephone numbers, emails, and Bank transfer details are reserved for Paid Members.'}
          </span>
        </div>

        {!isUserPremium && onOpenUpgradeModal && (
          <button
            onClick={onOpenUpgradeModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Unlock Paid Member Access</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by supplier name, company, fuel, email, or country..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'SILVER', 'GOLD', 'VERIFIED', 'PLATINUM'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTier === tier
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'All Exporter Tiers' : tier === 'SILVER' ? 'Basic Plan' : `${tier} Tier`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono shrink-0">
          {!currentUser && searchTerm.trim() !== '' ? (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Search Locked</span>
            </span>
          ) : (
            <><strong>{filtered.length}</strong> Verified Exporters</>
          )}
        </div>
      </div>

      {/* Factories Grid */}
      {!currentUser && searchTerm.trim() !== '' ? (
        <SearchRegistrationGate
          query={searchTerm}
          variant="panel"
          onClearSearch={() => setSearchTerm('')}
        />
      ) : isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <TradeHeavenDataLoader 
            message="Fetching audited factory suppliers..." 
            subMessage="Connecting to global manufacturer records and inspection databases..."
            size="lg"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-base font-bold text-slate-800 mb-1">No Exporters Found</p>
          <p className="text-xs text-slate-500">No factory profiles match your search criteria. Try clearing filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCompanies.map(company => {
              const isMelissaCompany = company.id === 'comp-melissa-mpcommodity' || (company.companyName || '').toLowerCase().includes('mp commodity');
              return (
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
                  <SafeImage
                    src={company.bannerUrl || '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg'}
                    alt={company.companyName}
                    category={isMelissaCompany ? 'CHEMICALS' : undefined}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                      {isMelissaCompany ? 'PAID BASIC PLAN MEMBER' : `${company.tier} EXPORTER`}
                    </span>
                    {isMelissaCompany && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                        ALL SERVICES ENABLED • FUEL
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div 
                    onClick={() => onOpenStorefront(company.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <SafeImage
                      src={company.logoUrl}
                      alt={company.companyName}
                      type="logo"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-white -mt-10 shadow-md relative z-10"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                        {company.companyName}
                      </h3>
                      {isUserPremium && company.contactPerson ? (
                        <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">Supplier: {company.contactPerson}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 mt-0.5">
                          <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span className="truncate">Protected Liaison (Paid Members Only)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{isUserPremium && isMelissaCompany ? 'SYDNEY, Australia' : company.country}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {company.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400">{isMelissaCompany ? 'Primary Commodity:' : 'Factory Area:'}</span>
                      <div className="font-bold text-slate-900">
                        {isMelissaCompany
                          ? 'Fuel & Petroleum'
                          : company.factorySizeSqM && company.factorySizeSqM > 0 
                            ? `${company.factorySizeSqM.toLocaleString()} m²` 
                            : 'Trading/Desk'}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400">{isMelissaCompany ? 'Membership Status:' : 'trade protection Limit:'}</span>
                      <div className="font-mono font-bold text-emerald-600">
                        {isMelissaCompany ? 'Basic Plan (Paid)' : `$${(company.tradeAssuranceLimitUsd / 1000).toFixed(0)}k`}
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Clearance Gated Component — Strictly Paid Members Only */}
                  <div className="pt-2 border-t border-slate-100">
                    <PremiumContactGate
                      currentUser={currentUser}
                      onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                      isMasked={Boolean(company.isContactMasked)}
                      paidMembersOnly={true}
                      resourceTitle="Paid Members Only — Supplier Details"
                    >
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div><strong>Company:</strong> {isMelissaCompany ? 'MP Commodity Brokers Australia Pty Ltd' : company.companyName}</div>
                        <div><strong>Address:</strong> {isMelissaCompany ? '2 Park Road, Sans souci NSW 2219, SYDNEY Australia' : (company.address || company.country)}</div>
                        <div><strong>Email:</strong> {isMelissaCompany ? 'melissa@mpcommoditybrokers.com' : (company.contactEmail || 'Contact via Inquiry Form')}</div>
                        <div><strong>Phone:</strong> {isMelissaCompany ? '+61411510887' : (company.contactPhone || 'Contact via Inquiry Form')}</div>
                        <div><strong>Payment:</strong> {isMelissaCompany ? 'Bank transfer' : 'Bank Transfer / L/C'}</div>
                        {isMelissaCompany && (
                          <div className="pt-1 text-[11px] font-bold text-emerald-700">
                            ✓ Paid Basic Plan Member • All Services Enabled • Dealing in Fuel
                          </div>
                        )}
                      </div>
                    </PremiumContactGate>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Verified Certifications &amp; Services:</div>
                    <div className="flex flex-wrap gap-1">
                      {(company.certifications || []).slice(0, 4).map((cert, idx) => (
                        <span key={`${company.id}-${cert || 'no-cert'}-${idx}`} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <button 
                  onClick={() => onOpenStorefront(company.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Full Storefront &amp; Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent('tradeheaven_open_share', {
                        detail: {
                          type: 'SUPPLIER',
                          id: company.id,
                          title: company.companyName,
                          subtitle: `${isMelissaCompany ? 'SYDNEY, Australia' : company.country} • ${company.tier} Exporter`
                        }
                      })
                    );
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-700 border border-slate-200 transition-all cursor-pointer shrink-0"
                  title={`Share direct link to ${company.companyName}`}
                  aria-label="Share supplier storefront"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
              );
            })}
        </div>

        {/* Pagination Bar */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemsPerPageOptions={[12, 24, 48]}
          itemLabel="suppliers"
          scrollTargetId="suppliers-directory-root"
        />
      </div>
      )}
    </div>
  );
};
