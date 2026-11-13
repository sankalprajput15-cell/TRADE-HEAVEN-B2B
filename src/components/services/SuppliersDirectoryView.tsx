import React, { useState, useEffect } from 'react';
import { CompanyProfile, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES, MOCK_COMPANIES } from '../../data/mockData';
import { ALL_COUNTRY_ITEMS } from '../../data/countriesData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { SafeImage } from '../common/SafeImage';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';
import { PaginationControls } from '../common/PaginationControls';
import { SearchRegistrationGate } from '../common/SearchAutoSuggestDropdown';
import regeneratedSupplierCoalImg from '../../assets/images/regenerated_image_1794231796775.jpg';
import { 
  Search, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  MessageCircle,
  Lock,
  Share2,
  Bookmark
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenStorefront: (companyId: string) => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  initialSearch?: string;
}

const SAVED_SUPPLIERS_KEY = 'tradeheaven_saved_suppliers_v1';

const COUNTRY_FLAG_FALLBACKS: Record<string, string> = {
  'united states': '🇺🇸',
  'usa': '🇺🇸',
  'u.s.a.': '🇺🇸',
  'united kingdom': '🇬🇧',
  'uk': '🇬🇧',
  'united arab emirates': '🇦🇪',
  'uae': '🇦🇪',
  'nigeria': '🇳🇬',
  'turkey': '🇹🇷',
  'republic of türkiye': '🇹🇷',
  'türkiye': '🇹🇷',
  'south korea': '🇰🇷',
  'korea': '🇰🇷',
  'russia': '🇷🇺',
  'kazakhstan': '🇰🇿',
  'qatar': '🇶🇦',
  'oman': '🇴🇲',
  'kuwait': '🇰🇼',
  'spain': '🇪🇸',
  'belgium': '🇧🇪',
  'switzerland': '🇨🇭',
  'mexico': '🇲🇽',
  'chile': '🇨🇱',
  'peru': '🇵🇪',
  'colombia': '🇨🇴',
  'argentina': '🇦🇷',
  'kenya': '🇰🇪',
  'ghana': '🇬🇭',
  'tanzania': '🇹🇿',
  'morocco': '🇲🇦'
};

const getCountryFlag = (countryName?: string): string => {
  if (!countryName) return '🌐';
  const normalized = countryName.trim().toLowerCase();
  if (COUNTRY_FLAG_FALLBACKS[normalized]) {
    return COUNTRY_FLAG_FALLBACKS[normalized];
  }
  const found = ALL_COUNTRY_ITEMS.find(
    c =>
      c.name.toLowerCase() === normalized ||
      c.id.toLowerCase() === normalized ||
      normalized.includes(c.name.toLowerCase())
  );
  return found ? found.flag : '🌐';
};

export const SuppliersDirectoryView: React.FC<Props> = ({
  selectedCurrency,
  onOpenStorefront,
  currentUser = null,
  onOpenUpgradeModal,
  initialSearch = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [companies, setCompanies] = useState<CompanyProfile[]>(() => MOCK_COMPANIES || []);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [savedSupplierIds, setSavedSupplierIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_SUPPLIERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  useEffect(() => {
    let isMounted = true;
    api.getSuppliers(currentUser)
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCompanies(data);
        }
      })
      .catch(err => {
        console.warn('[SuppliersDirectoryView] Error fetching suppliers:', err);
      });
    return () => { isMounted = false; };
  }, [currentUser]);

  const handleToggleBookmarkSupplier = (companyId: string) => {
    setSavedSupplierIds(prev => {
      const next = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      try {
        localStorage.setItem(SAVED_SUPPLIERS_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

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

  const formatTradeLimit = (limitUsd?: number) => {
    const baseUsd = limitUsd && limitUsd > 0 ? limitUsd : 150000;
    const converted = baseUsd * (curr.rateToUSD || 1);
    return `${curr.symbol}${(converted / 1000).toFixed(0)}k`;
  };

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
            Inspect on-site factory audit certificates, production capacity, machine lines, and verified export supply desks across global manufacturing hubs.
          </p>
        </div>
      </div>

      {/* Calm Business Verification Notice */}
      <div className="p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 flex-wrap bg-blue-50/80 border-blue-200 text-blue-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">
            {isUserPremium
              ? 'Verified Trade Clearance Active: Direct factory street addresses, executive emails, telephone desks, and banking coordinates are enabled.'
              : 'Verified Supplier Directory: Browse audited factory capabilities, trade limits, and certifications. Open any supplier desk to request quotes or inspect full audit files.'}
          </span>
        </div>
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
          <strong>{filtered.length}</strong> Verified Exporters
        </div>
      </div>

      {/* Factories Grid */}
      {isLoading ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {paginatedCompanies.map((company, index) => {
              const isMelissaCompany = company.id === 'comp-melissa-mpcommodity' || (company.companyName || '').toLowerCase().includes('mp commodity');
              const isReverseEnergyOrFirstCard =
                (currentPage === 1 && index === 0) ||
                company.id === 'user-supplier-emmanuel-reverse-energy' ||
                company.id === 'comp-reverse-energy-sa' ||
                (company.companyName || '').toLowerCase().includes('reverse energy');
              const countryDisplay = isMelissaCompany ? 'Australia' : (company.country || 'Global');
              const cityDisplay = isMelissaCompany ? 'Sydney' : (company.city || countryDisplay);
              const flagEmoji = getCountryFlag(countryDisplay);
              const isBookmarked = savedSupplierIds.includes(company.id);
              const categoryLabel = isMelissaCompany
                ? 'Fuel & Petroleum'
                : (company.businessType || 'Verified Exporter');

              return (
                <div
                  key={company.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 transition-all flex flex-col justify-between h-full shadow-2xs hover:shadow-md group"
                >
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Unboxed Editorial Kicker: Category · Est. Year on left, Orders / Response on right */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="font-semibold text-blue-600 truncate">
                          {categoryLabel}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-400 font-mono text-[11px] shrink-0">
                          Est. {company.establishedYear || 2016}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[11px]">
                        {company.isVerifiedKYC && (
                          <>
                            <span className="font-semibold text-emerald-600">ISO / SGS</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                          </>
                        )}
                        <span className="font-mono font-medium text-slate-600 tabular-nums">
                          {company.completedOrdersCount || 20} shipments
                        </span>
                      </div>
                    </div>

                    {/* Supplier Thumbnail & Title + Country Flag */}
                    <div
                      onClick={() => onOpenStorefront(company.id)}
                      className="flex items-start gap-3.5 cursor-pointer"
                    >
                      <SafeImage
                        src={isReverseEnergyOrFirstCard ? regeneratedSupplierCoalImg : (company.logoUrl || company.bannerUrl)}
                        alt={company.companyName}
                        productId={company.id}
                        productTitle={`${company.companyName} ${company.description || ''}`}
                        category={isMelissaCompany ? 'CHEMICALS' : company.businessType}
                        isThumbnail
                        className="w-12 h-12 rounded-xl border border-slate-200/80 shrink-0 bg-slate-100"
                        imgClassName="group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-[15px] text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                            {company.companyName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                          <span className="text-sm leading-none" title={countryDisplay}>{flagEmoji}</span>
                          <span className="font-medium text-slate-700 truncate">
                            {cityDisplay !== countryDisplay ? `${cityDisplay}, ${countryDisplay}` : countryDisplay}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-400 font-mono truncate">
                            Ref: {company.legalRegistrationNumber || company.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Structured 3-Column Procurement Metric Strip */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-400">Capacity</div>
                        <div className="font-mono font-semibold text-slate-900 tabular-nums truncate mt-0.5">
                          {isMelissaCompany
                            ? 'Bulk Tanker'
                            : company.factorySizeSqM && company.factorySizeSqM > 0
                              ? `${company.factorySizeSqM.toLocaleString()} m²`
                              : (company.totalEmployees ? `${company.totalEmployees} Staff` : 'Export Desk')}
                        </div>
                      </div>
                      <div className="min-w-0 border-l border-slate-100 pl-2.5">
                        <div className="text-[11px] text-slate-400">Trade Limit</div>
                        <div className="font-mono font-semibold text-emerald-700 tabular-nums truncate mt-0.5">
                          {formatTradeLimit(company.tradeAssuranceLimitUsd)} <span className="text-[10px] font-normal text-slate-400">/FOB·CIF</span>
                        </div>
                      </div>
                      <div className="min-w-0 border-l border-slate-100 pl-2.5">
                        <div className="text-[11px] text-slate-400">Origin Hub</div>
                        <div className="font-medium text-slate-800 truncate mt-0.5 flex items-center gap-1" title={`${cityDisplay}, ${countryDisplay}`}>
                          <span>{flagEmoji}</span>
                          <span className="truncate">{countryDisplay}</span>
                        </div>
                      </div>
                    </div>

                    {/* Readable Specifications & Capabilities Summary (No Blur Shield) */}
                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {company.description || 'Audited global manufacturer and bulk export supplier offering ISO-certified quality control, SGS pre-shipment inspection, and flexible L/C or T/T settlement.'}
                      </p>

                      {(company.certifications && company.certifications.length > 0) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {company.certifications.slice(0, 3).map((cert, idx) => (
                            <span
                              key={`${company.id}-${cert}-${idx}`}
                              className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md font-medium"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subtle Supplier Liaison Row — No Heavy Lock Banner */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {(company.companyName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                            <span>{flagEmoji} {countryDisplay}</span>
                            <span aria-hidden="true">·</span>
                            {isUserPremium ? (
                              <span className="text-emerald-700 font-medium truncate">
                                {isMelissaCompany ? 'melissa@mpcommoditybrokers.com' : (company.contactEmail || 'Direct Desk Active')}
                              </span>
                            ) : (
                              <span className="text-slate-500 truncate">
                                {company.responseRate || '98%'} Response ({company.avgResponseTime || '< 2h'})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenStorefront(company.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
                        title="Open supplier company dossier and export desk"
                      >
                        Supplier Desk
                      </button>
                    </div>
                  </div>

                  {/* Streamlined Action Bar: Send Quote, WhatsApp, Share, Bookmark */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenStorefront(company.id)}
                      className="flex-1 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Send Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${encodeURIComponent(`Hello TradeHeaven, I would like to connect with ${company.companyName} (${countryDisplay}) regarding bulk export supply and pricing.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      title="Inquire via WhatsApp Trade Desk"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

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
                              subtitle: `${flagEmoji} ${countryDisplay} • ${company.tier} Exporter`
                            }
                          })
                        );
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0"
                      title={`Share direct link to ${company.companyName}`}
                      aria-label="Share supplier storefront"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmarkSupplier(company.id);
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                        isBookmarked
                          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title={isBookmarked ? 'Bookmarked Supplier' : 'Bookmark Supplier'}
                      aria-label={isBookmarked ? 'Remove bookmarked supplier' : 'Bookmark supplier'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
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
