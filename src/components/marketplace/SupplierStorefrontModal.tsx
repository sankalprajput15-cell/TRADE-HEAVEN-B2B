import React, { useState, useEffect, useRef } from 'react';
import { CompanyProfile, Product, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES, MOCK_COMPANIES, MOCK_PRODUCTS } from '../../data/mockData';
import { api } from '../../services/apiService';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Building, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Calendar, 
  TrendingUp, 
  FileCheck, 
  Package, 
  Phone, 
  Mail, 
  Layers,
  Factory,
  MessageCircle,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface Props {
  companyId?: string;
  company?: CompanyProfile;
  products?: Product[];
  isOpen?: boolean;
  selectedCurrency: Currency;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCreateRfq?: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
}

export const SupplierStorefrontModal: React.FC<Props> = ({
  companyId,
  company: initialCompany,
  products = MOCK_PRODUCTS,
  isOpen = true,
  selectedCurrency,
  onClose,
  onSelectProduct,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal
}) => {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile | null>(initialCompany || null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
    }
  }, [companyId, initialCompany?.id]);

  useEffect(() => {
    if (companyId) {
      api.getSuppliers(currentUser).then(allSuppliers => {
        const found = (allSuppliers || []).find(c => c && c.id === companyId);
        if (found) {
          setActiveCompany(found);
        } else {
          const fallback = (MOCK_COMPANIES || []).find(c => c && c.id === companyId) || (MOCK_COMPANIES && MOCK_COMPANIES[0]);
          setActiveCompany(fallback);
        }
      });
    } else if (initialCompany) {
      setActiveCompany(initialCompany);
    }
  }, [companyId, initialCompany, currentUser]);

  if (!isOpen) return null;

  const company = activeCompany || (MOCK_COMPANIES && MOCK_COMPANIES[0]);
  const curr = (CURRENCY_RATES || []).find(c => c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };
  const companyProducts = (products || []).filter(p => p && p.supplierId === company?.id);

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8 text-slate-900 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-slate-700 hover:text-slate-950 hover:bg-white transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div ref={modalContainerRef} className="max-h-[85vh] overflow-y-auto space-y-5">
          {/* Company Hero Banner */}
          <div className="relative h-52 sm:h-64 w-full bg-slate-100">
            <img
              src={company.bannerUrl}
              alt={company.companyName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white bg-white object-cover shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded font-black bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                      {company.tier} EXPORTER
                    </span>
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified ({company.legalRegistrationNumber})
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white mt-1">
                    {company.companyName}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-slate-200 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{company.address}, {company.city}, {company.country}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-right shrink-0 shadow-lg">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Trust &amp; Assurance Limit</div>
                <div className="text-base font-black text-emerald-600 font-mono">
                  ${company.tradeAssuranceLimitUsd.toLocaleString()} USD
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            {/* Key Manufacturer Badges & Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Established
                </div>
                <div className="text-base font-black text-slate-900 mt-1">{company.establishedYear} ({new Date().getFullYear() - company.establishedYear} Yrs Exp)</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-blue-600" /> Factory Scale
                </div>
                <div className="text-base font-black text-slate-900 mt-1">{company.factorySizeSqM.toLocaleString()} m² ({company.productionLines} Lines)</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Response Rate
                </div>
                <div className="text-base font-black text-emerald-600 mt-1">{company.responseRate} ({company.avgResponseTime})</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" /> Workforce
                </div>
                <div className="text-base font-black text-slate-900 mt-1">{company.totalEmployees} Staff</div>
              </div>
            </div>

            {/* Company Overview & Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-3.5">
                <h3 className="text-sm font-black text-slate-900">About the Manufacturer</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {company.description}
                </p>
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-700 mb-2">Main Export Markets:</div>
                  <div className="flex flex-wrap gap-2">
                    {(company?.mainMarkets || []).map((market, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200">
                        • {market}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" /> Verified Audit Certifications
                </h3>
                <div className="space-y-1.5 text-xs">
                  {(company?.certifications || []).map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-xs">{cert}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Contact Clearance Gated Box */}
                <div className="pt-2 border-t border-slate-200">
                  <PremiumContactGate
                    currentUser={currentUser}
                    onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                    isMasked={Boolean(company?.isContactMasked)}
                    resourceTitle="Factory Export Desk Contact"
                  >
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div><strong>Contact:</strong> {company?.contactPerson || 'Export Liaison'}</div>
                      <div><strong>Email:</strong> {company?.contactEmail || 'export@factory.cn'}</div>
                      <div><strong>Phone:</strong> {company?.contactPhone || '+86 755 8320 9811'}</div>
                    </div>
                  </PremiumContactGate>
                </div>
              </div>
            </div>

            {/* Product Catalog Showcase */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Export Product Catalog ({(companyProducts || []).length} Items)
                </h3>

                {onOpenCreateRfq && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateRfq();
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Request Custom Quote for Factory</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(companyProducts || []).map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(prod);
                    }}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group shadow-xs"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-28 rounded-xl object-cover mb-2.5"
                    />
                    <div className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {prod.title}
                    </div>
                    <div className="text-xs font-black text-emerald-600 font-mono mt-1">
                      {formatPrice(prod.priceTiers[0].priceUsd)} / {prod.moqUnit}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      MOQ: {prod.moq} {prod.moqUnit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
