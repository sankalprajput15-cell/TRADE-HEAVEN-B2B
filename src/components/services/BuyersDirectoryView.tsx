import React, { useState, useEffect } from 'react';
import { DetailedBuyerProfile, Currency, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { SafeImage } from '../common/SafeImage';
import { TradeHeavenDataLoader } from '../common/TradeHeavenDataLoader';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  Crown,
  Lock,
  Mail,
  Phone,
  ShoppingBag,
  Warehouse,
  FileCheck,
  BadgeCheck,
  DollarSign,
  Globe2,
  Boxes
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenBuyerProfile: (buyerId: string) => void;
  onOpenCreateRfq?: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
}

export const BuyersDirectoryView: React.FC<Props> = ({
  selectedCurrency,
  onOpenBuyerProfile,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [buyers, setBuyers] = useState<DetailedBuyerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  useEffect(() => {
    setIsLoading(true);
    api.getBuyers(currentUser).then(data => {
      setBuyers(data);
      setIsLoading(false);
    });
  }, [currentUser]);

  const filtered = buyers.filter(b => {
    const matchesSearch = searchTerm === '' ||
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.targetCategories || []).some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTier = selectedTier === 'ALL' || b.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const isUserPremium = currentUser?.role === 'ADMIN' || currentUser?.isPremium === true;

  return (
    <div id="buyers-directory-root" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>KYC-Verified Corporate Buyers &amp; High-Volume Importers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Verified Global Buyers &amp; Importers Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
            Connect directly with verified wholesale distributors, OEM procurement desks, and multi-container importers. Verified purchasing capacity, D&amp;B audits, and trade requirements.
          </p>
        </div>

        {onOpenCreateRfq && (
          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Post Buy Requirement</span>
          </button>
        )}
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
              ? 'Verified Supplier Clearance: Buyer direct procurement officer emails, WhatsApp lines, and phones are unmasked.'
              : 'Standard Guest Access: Direct corporate buyer procurement contact details are masked. Upgrade to access direct buyer contacts.'}
          </span>
        </div>

        {!isUserPremium && onOpenUpgradeModal && (
          <button
            onClick={onOpenUpgradeModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Unlock Direct Buyer Lines</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by buyer name, country, sector, or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'VIP', 'GOLD', 'SILVER', 'VERIFIED'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTier === tier
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'All Buyer Tiers' : `${tier} Tier`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono shrink-0">
          <strong>{filtered.length}</strong> Verified Buyers
        </div>
      </div>

      {/* Buyers Grid */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <TradeHeavenDataLoader 
            message="Fetching verified buyer profiles..." 
            subMessage="Connecting to global importer database and active procurement records..."
            size="lg"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-base font-bold text-slate-800 mb-1">No Buyers Found</p>
          <p className="text-xs text-slate-500">No buyer profiles match your search criteria. Try clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(buyer => (
          <div
            key={buyer.id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              {/* Banner */}
              <div 
                onClick={() => onOpenBuyerProfile(buyer.id)}
                className="relative h-36 w-full bg-slate-100 overflow-hidden cursor-pointer group"
              >
                <SafeImage
                  src={buyer.bannerUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'}
                  alt={buyer.companyName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                    buyer.tier === 'VIP' 
                      ? 'bg-slate-900 text-amber-300 border border-amber-400/40' 
                      : buyer.tier === 'GOLD'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-white'
                  }`}>
                    {buyer.tier} BUYER
                  </span>
                  {buyer.isVerifiedKYC && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>KYC AUDITED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div 
                  onClick={() => onOpenBuyerProfile(buyer.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <SafeImage
                    src={buyer.logoUrl}
                    alt={buyer.companyName}
                    type="logo"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-white -mt-10 shadow-md relative z-10"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                      {buyer.companyName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{buyer.country}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-600 font-semibold">{buyer.businessType}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {buyer.description}
                </p>

                {/* Sourcing Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400">Annual Purchasing:</span>
                    <div className="font-bold text-slate-900">{buyer.annualPurchasingVolumeUsd}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400">Trade Protection Capacity:</span>
                    <div className="font-mono font-bold text-emerald-600">
                      ${(buyer.tradeAssuranceEscrowSecuredUsd / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>

                {/* Target Categories */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Sourcing Categories:</div>
                  <div className="flex flex-wrap gap-1">
                    {(buyer.targetCategories || []).slice(0, 2).map((cat, idx) => (
                      <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Contact Clearance Gated Component */}
                <div className="pt-2 border-t border-slate-100">
                  <PremiumContactGate
                    currentUser={currentUser}
                    onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                    isMasked={Boolean(buyer.isContactMasked)}
                    resourceTitle="Buyer Procurement Desk Contact"
                  >
                    <div className="space-y-1 text-xs text-slate-700">
                      <div><strong>Lead:</strong> {buyer.contactPerson} ({buyer.contactDesignation})</div>
                      <div><strong>Email:</strong> {buyer.contactEmail ? securityService.maskEmailAddress(buyer.contactEmail) : 'Contact via Inquiry Form'}</div>
                      <div><strong>Phone:</strong> {buyer.contactPhone ? securityService.maskPhoneNumber(buyer.contactPhone) : 'Contact via Inquiry Form'}</div>
                    </div>
                  </PremiumContactGate>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button 
                onClick={() => onOpenBuyerProfile(buyer.id)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Buyer Profile &amp; Demands</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
