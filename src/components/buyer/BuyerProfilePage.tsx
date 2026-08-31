import React, { useState, useEffect } from 'react';
import { 
  DetailedBuyerProfile, 
  Currency, 
  AuthUser,
  RfqRequirement,
  BuyerWarehouse
} from '../../types';
import { CURRENCY_RATES, MOCK_BUYER_PROFILES, MOCK_RFQS } from '../../data/mockData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { SafeImage } from '../common/SafeImage';
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  FileCheck, 
  Package, 
  Phone, 
  Mail, 
  MessageCircle, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  Globe2, 
  Clock, 
  DollarSign, 
  Send, 
  Bookmark, 
  Share2, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  Maximize2, 
  X, 
  Paperclip, 
  ChevronRight, 
  Layers,
  HelpCircle,
  Truck,
  Warehouse,
  Flame,
  Check,
  BadgeCheck,
  ShoppingBag,
  Briefcase,
  Lock,
  Edit3,
  Save,
  Crown,
  ArrowRight
} from 'lucide-react';

interface Props {
  buyerId?: string;
  initialBuyer?: DetailedBuyerProfile;
  selectedCurrency: Currency;
  onOpenCreateRfq?: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  onNavigate?: (view: string) => void;
  onOpenRfqModal?: (rfq: RfqRequirement) => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

export const BuyerProfilePage: React.FC<Props> = ({
  buyerId = 'buyer-001',
  initialBuyer,
  selectedCurrency,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal,
  onNavigate,
  onOpenRfqModal,
  isModalView = false,
  onCloseModal
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SOURCING_DEMANDS' | 'WAREHOUSES' | 'COMPLIANCE'>('OVERVIEW');
  const [profile, setProfile] = useState<DetailedBuyerProfile>(() => {
    if (initialBuyer) return initialBuyer;
    const found = MOCK_BUYER_PROFILES.find(b => b.id === buyerId);
    return found || MOCK_BUYER_PROFILES[0];
  });
  const [rfqs, setRfqs] = useState<RfqRequirement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<DetailedBuyerProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // STRICT ACCESS CONTROL LOCKDOWN:
  // Only the creator/owner (by UID or contactEmail) or authorized Admin can view/use the edit buttons
  const isAuthorizedToEdit = Boolean(
    currentUser?.role === 'ADMIN' ||
    currentUser?.isVerifiedAdmin === true ||
    (currentUser?.id && profile.ownerUid && currentUser.id === profile.ownerUid) ||
    (currentUser?.email && profile.contactEmail && currentUser.email.toLowerCase() === profile.contactEmail.toLowerCase())
  );

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  useEffect(() => {
    // Fetch live gated profile
    api.getBuyerById(buyerId, currentUser).then(data => {
      if (data) {
        setProfile(data);
        setEditFormData(data);
      }
    });

    // Fetch related RFQs
    api.getRfqs({}, currentUser).then(allRfqs => {
      const buyerRfqs = allRfqs.filter(r => 
        r.buyerCompany.toLowerCase().includes(profile.companyName.toLowerCase()) ||
        r.ownerUid === profile.ownerUid
      );
      setRfqs(buyerRfqs.length > 0 ? buyerRfqs : allRfqs.slice(0, 3));
    });
  }, [buyerId, currentUser, profile.companyName, profile.ownerUid]);

  const handleStartEdit = () => {
    if (!isAuthorizedToEdit) return;
    setEditFormData({ ...profile });
    setIsEditing(true);
    setSaveStatus(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedToEdit) return;
    setIsSaving(true);
    setSaveStatus(null);

    const res = await api.updateBuyerProfile(profile.id, editFormData, currentUser);
    setIsSaving(false);
    if (res.success && res.data) {
      setProfile(res.data);
      setIsEditing(false);
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus(res.error || 'Failed to update buyer profile');
    }
  };

  const isContactMasked = Boolean(profile.isContactMasked);

  return (
    <div id="buyer-profile-root" className="space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <button 
            onClick={() => onNavigate ? onNavigate('BUYERS_DIRECTORY') : null}
            className="hover:text-blue-600 transition-colors font-medium cursor-pointer"
          >
            Verified Buyers Directory
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">{profile.companyName}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sourcing Subscription Status */}
          <div className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
            profile.tier === 'VIP'
              ? 'bg-slate-900 text-amber-300 border border-amber-400/40 shadow-xs'
              : profile.tier === 'GOLD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
          }`}>
            <Crown className="w-3.5 h-3.5" />
            <span>{profile.tier} SOURCING TIER</span>
          </div>

          {/* EDIT BUTTON (STRICTLY GATED TO CREATOR / ADMIN ONLY) */}
          {isAuthorizedToEdit && (
            <button
              id="buyer-profile-edit-btn"
              onClick={handleStartEdit}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Details</span>
            </button>
          )}

          {isModalView && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 16:9 Hero Banner & Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="relative h-48 sm:h-64 lg:h-72 w-full bg-slate-900 overflow-hidden">
          <SafeImage
            src={profile.bannerUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80'}
            alt={profile.companyName}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-mono border border-white/10">
              <span className="text-slate-400">Trade Protection Capacity:</span>{' '}
              <strong className="text-emerald-400">
                ${(profile.tradeAssuranceEscrowSecuredUsd / 1000).toLocaleString()}k
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-mono border border-white/10">
              <span className="text-slate-400">Purchasing Vol:</span>{' '}
              <strong className="text-amber-300">{profile.annualPurchasingVolumeUsd}</strong>
            </div>
          </div>
        </div>

        {/* Company Identity Bar */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-6">
            <div className="flex items-end gap-4">
              <SafeImage
                src={profile.logoUrl}
                alt={profile.companyName}
                type="logo"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white bg-white shadow-xl relative z-10 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {profile.companyName}
                  </h1>
                  {profile.isVerifiedKYC && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>KYC AUDITED</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{profile.city}, {profile.country}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-blue-600">{profile.businessType}</span>
                  <span className="text-slate-300">•</span>
                  <span>Est. {profile.establishedYear}</span>
                  <span className="text-slate-300">•</span>
                  <span>{profile.totalEmployees} Employees</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate ? onNavigate('NEGOTIATION_ROOM') : null}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Sourcing Proposal</span>
              </button>
              {onOpenCreateRfq && (
                <button
                  onClick={onOpenCreateRfq}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                  <span>Post Tender</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Import Frequency</div>
              <div className="font-bold text-slate-900 mt-0.5">{profile.importFrequency}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Completed Imports</div>
              <div className="font-bold text-slate-900 mt-0.5">{profile.completedImportsCount} Shipments</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Preferred Incoterms</div>
              <div className="font-bold text-blue-600 mt-0.5">{(profile.preferredIncoterms || []).join(', ')}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Response Speed</div>
              <div className="font-bold text-emerald-600 mt-0.5">{profile.avgResponseTime} ({profile.responseRate})</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Company Overview &amp; Contacts
        </button>
        <button
          onClick={() => setActiveTab('SOURCING_DEMANDS')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'SOURCING_DEMANDS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Sourcing Demands &amp; Active RFQs</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
            {rfqs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('WAREHOUSES')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'WAREHOUSES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Global Warehouses &amp; Ports</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {(profile.warehouses || []).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'COMPLIANCE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Compliance &amp; KYC Credentials
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>About {profile.companyName}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {profile.description}
              </p>

              {/* Target Sourcing Categories */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">Primary Procurement Sectors:</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.targetCategories || []).map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                      <span>{cat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment & Commercial Preferences */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">Preferred Commercial Terms:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Payment Terms:</span>
                    <strong className="text-slate-900">{profile.preferredPaymentTerms?.join(', ') || 'Trade Protection Certificate'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Incoterms:</span>
                    <strong className="text-slate-900">{profile.preferredIncoterms?.join(', ') || 'FOB / CIF'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Sourcing Requirements Highlights */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Current Active Buy Leads</span>
                </h2>
                <button
                  onClick={() => setActiveTab('SOURCING_DEMANDS')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All ({rfqs.length})
                </button>
              </div>

              <div className="space-y-3">
                {rfqs.slice(0, 2).map(rfq => (
                  <div
                    key={rfq.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {rfq.category}
                        </span>
                        <span className="text-xs font-black text-slate-900">{rfq.productName}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Target: <strong>{rfq.targetQuantity} {rfq.quantityUnit}</strong> • Incoterm: <strong>{rfq.preferredIncoterm}</strong> to <strong>{rfq.destinationPort}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate ? onNavigate('NEGOTIATION_ROOM') : null}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Submit Factory Quote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Contact & Verification Cards (Server-side Contact Gated) */}
          <div className="space-y-6">
            {/* Contact Card with Premium Contact Gate */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Procurement Desk</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Contact
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{profile.contactPerson}</div>
                  <div className="text-[11px] text-slate-500">{profile.contactDesignation}</div>
                </div>

                <PremiumContactGate
                  currentUser={currentUser}
                  onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                  isMasked={isContactMasked}
                  resourceTitle="Corporate Buyer Direct Contact"
                >
                  <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{profile.contactEmail ? securityService.maskEmailAddress(profile.contactEmail) : 'Contact via Inquiry Form'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{profile.contactPhone ? securityService.maskPhoneNumber(profile.contactPhone) : 'Contact via Inquiry Form'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-mono">{profile.whatsapp || profile.contactPhone ? securityService.maskPhoneNumber(profile.whatsapp || profile.contactPhone) : 'Contact via Inquiry Form'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{profile.address}, {profile.city}, {profile.country}</span>
                    </div>
                  </div>
                </PremiumContactGate>
              </div>

              <button
                onClick={() => onNavigate ? onNavigate('NEGOTIATION_ROOM') : null}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Start Direct Chat</span>
              </button>
            </div>

            {/* Corporate Registration Data */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm text-xs">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Registration &amp; D&amp;B Data</span>
              </h3>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Legal Reg Number:</span>
                  <span className="font-mono font-bold text-slate-900">{profile.legalRegistrationNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">D-U-N-S® Number:</span>
                  <span className="font-mono font-bold text-blue-600">{profile.dunsNumber || '08-552-1190'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tax / VAT ID:</span>
                  <span className="font-mono font-bold text-slate-900">{profile.taxVatNumber || 'EIN-12-3456789'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Trust Index:</span>
                  <span className="font-mono font-bold text-emerald-600">{profile.trustScore} / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCING DEMANDS */}
      {activeTab === 'SOURCING_DEMANDS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Active Procurement Tenders &amp; RFQs
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Direct purchasing demands posted by {profile.companyName}. Factories may submit binding quotations.
                </p>
              </div>

              {onOpenCreateRfq && isAuthorizedToEdit && (
                <button
                  onClick={onOpenCreateRfq}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post New Tender</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {rfqs.map(rfq => (
                <div
                  key={rfq.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-500 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {rfq.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Posted: {rfq.postedDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{rfq.productName}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {rfq.detailedRequirements || rfq.detailedDescription}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Target Volume:</span>
                        <div className="font-bold text-slate-900">{rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Target Price:</span>
                        <div className="font-bold text-emerald-600 font-mono">${rfq.targetPriceUsd} / unit</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Incoterm:</span>
                        <div className="font-bold text-slate-900">{rfq.preferredIncoterm} ({rfq.destinationPort})</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Quotes Received:</span>
                        <div className="font-bold text-blue-600">{rfq.quotesCount} proposals</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenRfqModal) {
                        onOpenRfqModal(rfq);
                      } else if (onNavigate) {
                        onNavigate('RFQ_HUB');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Inspect Tender &amp; Submit Bid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WAREHOUSES */}
      {activeTab === 'WAREHOUSES' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">
              Receiving Warehouses &amp; Logistics Hubs
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Verified storage capacity, customs clearing points, and discharge ports utilized by {profile.companyName}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {(profile.warehouses || [
                {
                  id: 'wh-1',
                  locationName: 'Midwest Central Distribution Hub',
                  city: 'Chicago, IL',
                  country: 'United States',
                  capacitySqFt: 180000,
                  preferredPortOfDischarge: 'Port of Los Angeles / Long Beach Rail',
                  customsBonded: true
                },
                {
                  id: 'wh-2',
                  locationName: 'Rotterdam Euro Hub',
                  city: 'Rotterdam',
                  country: 'Netherlands',
                  capacitySqFt: 120000,
                  preferredPortOfDischarge: 'Port of Rotterdam',
                  customsBonded: true
                }
              ]).map((wh, idx) => (
                <div
                  key={wh.id || idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Warehouse className="w-4 h-4 text-blue-600" />
                      <span>{wh.locationName}</span>
                    </span>
                    {wh.customsBonded && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Bonded
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <div><strong>City/Country:</strong> {wh.city}, {wh.country}</div>
                    <div><strong>Floor Area:</strong> {wh.capacitySqFt.toLocaleString()} sq. ft.</div>
                    <div><strong>Discharge Port:</strong> {wh.preferredPortOfDischarge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & KYC */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Buyer Verification &amp; Compliance Requirements
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                KYC corporate registry audit and mandatory certifications expected from manufacturing partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>TradeHeaven Verified Importer Seal</span>
                </div>
                <p className="text-xs text-emerald-800">
                  This enterprise has passed third-party identity and corporate registry audits. Trade Protection Certificate payment capacity is secured up to ${(profile.tradeAssuranceEscrowSecuredUsd / 1000).toLocaleString()}k.
                </p>
                <div className="text-xs text-emerald-700 font-mono">
                  Audit Status: <strong>PASS (Level 3 Verification)</strong>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  <span>Required Supplier Certifications</span>
                </div>
                <p className="text-xs text-blue-800">
                  Suppliers submitting quotes to {profile.companyName} must hold one or more of these accredited certifications:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(profile.complianceRequirements || ['ISO 9001:2015', 'CE Marking', 'RoHS Compliant', 'UL Listed']).map((req, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white text-blue-900 text-xs font-bold border border-blue-200 shadow-2xs"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (ONLY ACCESSIBLE TO CREATOR / ADMIN) */}
      {isEditing && isAuthorizedToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Edit Verified Buyer Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Authorized Owner / Administrator Control Panel
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    value={editFormData.companyName || ''}
                    onChange={e => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Business Type</label>
                  <input
                    type="text"
                    value={editFormData.businessType || ''}
                    onChange={e => setEditFormData({ ...editFormData, businessType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Company Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description || ''}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Country</label>
                  <input
                    type="text"
                    value={editFormData.country || ''}
                    onChange={e => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Officer Name</label>
                  <input
                    type="text"
                    value={editFormData.contactPerson || ''}
                    onChange={e => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Officer Designation</label>
                  <input
                    type="text"
                    value={editFormData.contactDesignation || ''}
                    onChange={e => setEditFormData({ ...editFormData, contactDesignation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Direct Procurement Email</label>
                  <input
                    type="email"
                    value={editFormData.contactEmail || ''}
                    onChange={e => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Direct Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editFormData.contactPhone || ''}
                    onChange={e => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Annual Purchasing Volume</label>
                  <input
                    type="text"
                    value={editFormData.annualPurchasingVolumeUsd || ''}
                    onChange={e => setEditFormData({ ...editFormData, annualPurchasingVolumeUsd: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Import Frequency</label>
                  <input
                    type="text"
                    value={editFormData.importFrequency || ''}
                    onChange={e => setEditFormData({ ...editFormData, importFrequency: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Banner Image URL (16:9)</label>
                <input
                  type="text"
                  value={editFormData.bannerUrl || ''}
                  onChange={e => setEditFormData({ ...editFormData, bannerUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
