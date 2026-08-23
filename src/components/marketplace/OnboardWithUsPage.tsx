import React, { useState } from 'react';
import { AuthUser, Incoterm, UserRole, VerifiedPartnerRegistration } from '../../types';
import { api } from '../../services/apiService';
import { SafeImage } from '../common/SafeImage';
import { CATEGORIES_TREE } from '../../data/mockData';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Factory, 
  ShoppingBag, 
  Globe2, 
  Lock, 
  Mail, 
  Phone, 
  FileText, 
  Award, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Check, 
  Briefcase,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Stamp,
  UserCheck
} from 'lucide-react';

interface Props {
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onNavigate: (view: any) => void;
  onOpenCreateRfq?: () => void;
}

const COMMON_CERTIFICATIONS = [
  'ISO 9001:2015 (Quality)',
  'ISO 14001 (Environmental)',
  'CE Marking (European Conformity)',
  'FDA Registered (USA)',
  'RoHS & REACH Compliant',
  'BSCI Social Audit',
  'SGS Verified Facility',
  'TÜV Rheinland Audited',
  'GMP Certified',
  'OEKO-TEX Standard 100'
];

const INCOTERMS_OPTIONS: Incoterm[] = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR', 'FCA'];

export const OnboardWithUsPage: React.FC<Props> = ({
  currentUser,
  onLogin,
  onNavigate,
  onOpenCreateRfq
}) => {
  // Step navigation: 1 = Role & Account, 2 = Company & Legal Vetting, 3 = Trade Specs & Capacity, 4 = Success Certificate
  const [step, setStep] = useState<number>(1);
  const [onboardingType, setOnboardingType] = useState<'GENUINE_BUYER' | 'VERIFIED_SUPPLIER' | 'TRADE_AGENT'>('GENUINE_BUYER');

  // Form State
  const [fullName, setFullName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState<'Factory / Manufacturer' | 'OEM / ODM Exporter' | 'Corporate Importer' | 'Wholesale Distributor' | 'Trade House'>('Corporate Importer');
  const [legalRegistrationNumber, setLegalRegistrationNumber] = useState('');
  const [taxOrVatId, setTaxOrVatId] = useState('');
  const [dunsNumber, setDunsNumber] = useState('');
  const [establishedYear, setEstablishedYear] = useState<number>(2018);
  const [annualTradeVolumeUsd, setAnnualTradeVolumeUsd] = useState('$5M - $25M');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Industrial Machinery & CNC']);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(['ISO 9001:2015 (Quality)']);
  const [selectedIncoterms, setSelectedIncoterms] = useState<Incoterm[]>(['FOB', 'CIF']);
  const [factoryAddress, setFactoryAddress] = useState('');
  const [productionCapacityOrRequirement, setProductionCapacityOrRequirement] = useState('');
  const [verificationDocName, setVerificationDocName] = useState('');
  const [agreedToVettingPolicy, setAgreedToVettingPolicy] = useState(true);

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);

  // Quick category toggle
  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  // Quick cert toggle
  const toggleCert = (cert: string) => {
    if (selectedCertifications.includes(cert)) {
      setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
    } else {
      setSelectedCertifications([...selectedCertifications, cert]);
    }
  };

  // Quick incoterm toggle
  const toggleIncoterm = (term: Incoterm) => {
    if (selectedIncoterms.includes(term)) {
      setSelectedIncoterms(selectedIncoterms.filter(t => t !== term));
    } else {
      setSelectedIncoterms([...selectedIncoterms, term]);
    }
  };

  // Step 1 Validation
  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !corporateEmail.trim() || !companyName.trim() || !phoneOrWhatsapp.trim()) {
      setError('Please complete all required fields (Name, Corporate Email, Phone/WhatsApp, Company Name).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter a secure password of at least 6 characters.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Step 2 Validation
  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!legalRegistrationNumber.trim() && !taxOrVatId.trim()) {
      setError('Please provide at least a Legal Registration Number or Tax/VAT/GST ID to ensure genuine partner vetting.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Final Submission Handler
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToVettingPolicy) {
      setError('Please accept the Real & Genuine Business Vetting and Anti-Fraud Trade Terms to complete registration.');
      return;
    }

    setIsLoading(true);

    const payload: VerifiedPartnerRegistration = {
      fullName: fullName.trim(),
      corporateEmail: corporateEmail.trim(),
      phoneOrWhatsapp: phoneOrWhatsapp.trim(),
      companyName: companyName.trim(),
      websiteUrl: websiteUrl.trim(),
      country: country.trim(),
      city: city.trim() || 'Headquarters',
      roleIntent: onboardingType,
      businessType,
      legalRegistrationNumber: legalRegistrationNumber.trim() || `REG-${Date.now().toString().slice(-6)}`,
      taxOrVatId: taxOrVatId.trim() || `TAX-${Date.now().toString().slice(-6)}`,
      dunsNumber: dunsNumber.trim(),
      establishedYear,
      annualTradeVolumeUsd,
      primaryCategories: selectedCategories,
      certifications: selectedCertifications,
      preferredIncoterms: selectedIncoterms,
      factoryAddress: factoryAddress.trim(),
      productionCapacityOrRequirement: productionCapacityOrRequirement.trim(),
      verificationDocName: verificationDocName.trim() || 'Certificate_Of_Incorporation.pdf',
      agreedToVettingPolicy: true,
      status: 'VERIFIED',
      submittedAt: new Date().toISOString()
    };

    try {
      const res = await api.onboardVerifiedPartner(payload, password);
      if (res.success && res.user) {
        setRegisteredUser(res.user);
        onLogin(res.user);
        setStep(4);
        window.scrollTo({ top: 80, behavior: 'smooth' });
      } else {
        setError(res.message || 'Onboarding verification failed. Please check your data.');
      }
    } catch {
      setError('Service connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="onboard-with-us-portal" className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* 1. TOP HERO HEADER & TRUST BANNER */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Free Registration • Zero Middlemen • Swiss Escrow Protected</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Work &amp; Trade with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400">Real, Genuine</span> Buyers &amp; Suppliers
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Join the verified international trade network. No subscription fees for onboarding. Every buyer has authentic purchasing power, and every supplier is audited for genuine production capacity.
              </p>

              {/* Quick Trust Highlights */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200">KYC Verified Profiles</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-200">100% Escrow Guarantee</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Award className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-semibold text-slate-200">$0 Registration Fee</span>
                </div>
              </div>
            </div>

            {/* Live Trust Metrics Card */}
            <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-amber-400" />
                  <span className="font-black text-sm tracking-wide">VERIFIED ECOSYSTEM</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                  Live Network
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Audited Factory Directs:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">480,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Verified Global Buyers:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">5,200,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Active Procurement RFQs:</span>
                  <span className="font-mono font-bold text-blue-300 text-sm">$480M+ Monthly</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Fraud &amp; Fake Lead Rate:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">0.0% (Zero Tolerance)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Anti-scam screening runs on every corporate registration.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ONBOARDING & REGISTRATION WIZARD */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Step Progress Tracker */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200 mb-8">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            
            <div className={`p-3 rounded-2xl transition-all ${step >= 1 ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold' : 'bg-slate-50 text-slate-400'}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  1
                </span>
                <span className="text-xs sm:text-sm font-black hidden sm:inline">Role &amp; Identity</span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">Account &amp; Intent</p>
            </div>

            <div className={`p-3 rounded-2xl transition-all ${step >= 2 ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold' : 'bg-slate-50 text-slate-400'}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  2
                </span>
                <span className="text-xs sm:text-sm font-black hidden sm:inline">Legal Vetting</span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">Tax &amp; Business Reg</p>
            </div>

            <div className={`p-3 rounded-2xl transition-all ${step >= 3 ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold' : 'bg-slate-50 text-slate-400'}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  3
                </span>
                <span className="text-xs sm:text-sm font-black hidden sm:inline">Trade Capacity</span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">Specs &amp; Certifications</p>
            </div>

            <div className={`p-3 rounded-2xl transition-all ${step >= 4 ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold' : 'bg-slate-50 text-slate-400'}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  4
                </span>
                <span className="text-xs sm:text-sm font-black hidden sm:inline">Verified Pass</span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">Instant Activation</p>
            </div>

          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* STEP 1: ROLE SELECTION & ESSENTIAL CREDENTIALS */}
        {step === 1 && (
          <form onSubmit={handleNextToStep2} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <span>Select Your Business Trading Intent</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose how you want to work with verified businesses on TradeHeaven. Registration is 100% free with instant access.
              </p>
            </div>

            {/* Intent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Intent 1: Genuine Buyer */}
              <div
                onClick={() => {
                  setOnboardingType('GENUINE_BUYER');
                  setBusinessType('Corporate Importer');
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative ${
                  onboardingType === 'GENUINE_BUYER'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {onboardingType === 'GENUINE_BUYER' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">I am a Genuine Buyer</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Importer, Wholesaler, Retailer, Brand</p>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Direct Factory Pricing (Zero Markup)
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Escrow Milestone Protection
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Post Free Targeted Buy RFQs
                  </li>
                </ul>
              </div>

              {/* Intent 2: Verified Supplier */}
              <div
                onClick={() => {
                  setOnboardingType('VERIFIED_SUPPLIER');
                  setBusinessType('Factory / Manufacturer');
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative ${
                  onboardingType === 'VERIFIED_SUPPLIER'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {onboardingType === 'VERIFIED_SUPPLIER' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">I am a Manufacturer / Exporter</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Factory, Plant Owner, OEM/ODM</p>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Direct access to $50M+ Buyer RFQs
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Free Storefront &amp; Catalog Listing
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Factory Audit Badge
                  </li>
                </ul>
              </div>

              {/* Intent 3: Trade Agent / Partner */}
              <div
                onClick={() => {
                  setOnboardingType('TRADE_AGENT');
                  setBusinessType('Trade House');
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative ${
                  onboardingType === 'TRADE_AGENT'
                    ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {onboardingType === 'TRADE_AGENT' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Trade Partner / Agent</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sourcing Agent, Inspection Desk</p>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Protected Broker Commissions
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Multi-factory RFQ dispatch
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Landed Cost &amp; Incoterms Tools
                  </li>
                </ul>
              </div>

            </div>

            {/* Essential Contact & Account Fields */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                Contact &amp; Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. elena@industrial-procure.com"
                      value={corporateEmail}
                      onChange={e => setCorporateEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 312 555 0192"
                      value={phoneOrWhatsapp}
                      onChange={e => setPhoneOrWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Used for urgent verified RFQ inquiries and quotation notifications.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Security Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Technologies Ltd."
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country / Regional Headquarters <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Germany / United States / China / India"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Continue to Business Legitimacy Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: BUSINESS LEGITIMACY & ANTI-FRAUD VETTING */}
        {step === 2 && (
          <form onSubmit={handleNextToStep3} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Business Legitimacy &amp; Vetting Data</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  We verify all companies against official government registries to prevent fake inquiries, spam, and non-genuine parties.
                </p>
              </div>
              <div className="text-[11px] px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold">
                🔒 Encrypted Enterprise Verification
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Business Model <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Factory / Manufacturer">Factory / Manufacturer (Direct Producer)</option>
                  <option value="OEM / ODM Exporter">OEM / ODM Exporter (Custom Engineering)</option>
                  <option value="Corporate Importer">Corporate Importer (Direct Sourcing)</option>
                  <option value="Wholesale Distributor">Wholesale Distributor &amp; Stockist</option>
                  <option value="Trade House">Trade House / Buying Desk</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Website / Catalog URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Legal Registration / CR Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HRB-892104 / US-LLC-48190"
                  value={legalRegistrationNumber}
                  onChange={e => setLegalRegistrationNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Company registration number from your local chamber of commerce.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tax ID / VAT / GST / EIN Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DE814892100 / GSTIN-27AAAAA0000A1Z5"
                  value={taxOrVatId}
                  onChange={e => setTaxOrVatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Required for invoice tax receipts and cross-border customs declarations.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dun &amp; Bradstreet D-U-N-S Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-345-6789"
                  value={dunsNumber}
                  onChange={e => setDunsNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Year of Establishment
                </label>
                <input
                  type="number"
                  min={1950}
                  max={2026}
                  value={establishedYear}
                  onChange={e => setEstablishedYear(parseInt(e.target.value) || 2018)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  {onboardingType === 'VERIFIED_SUPPLIER' ? 'Factory / Operational Facility Address' : 'Corporate HQ Physical Address'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100 Innovation Parkway, Suite 400, Frankfurt / Shenzhen / Chicago"
                  value={factoryAddress}
                  onChange={e => setFactoryAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

            </div>

            {/* Anti-Fraud Declaration Callout */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Zero Tolerance for Fraudulent Leads &amp; Shell Companies</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                By submitting your business tax ID and registration number, you confirm that your company is a legally registered active entity with genuine procurement or manufacturing capacity. TradeHeaven verifies all credentials to protect genuine buyers and suppliers.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Continue to Trade Specifications</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: TRADE SPECIFICATIONS, CAPACITY & SUBMISSION */}
        {step === 3 && (
          <form onSubmit={handleCompleteOnboarding} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                <span>Trade Capacity, Product Categories &amp; Terms</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Help our matching algorithm connect you with the most relevant buyers, factory tenders, and verified RFQs.
              </p>
            </div>

            {/* Annual Trade Volume */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {onboardingType === 'VERIFIED_SUPPLIER' ? 'Annual Production & Export Turnover (USD)' : 'Estimated Annual Sourcing Budget (USD)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['$100K - $1M', '$1M - $5M', '$5M - $25M', '$25M - $100M+'].map(bracket => (
                  <button
                    key={bracket}
                    type="button"
                    onClick={() => setAnnualTradeVolumeUsd(bracket)}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      annualTradeVolumeUsd === bracket
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {bracket}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Sourcing Categories */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Primary Product Sectors (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {CATEGORIES_TREE.map(cat => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications & Audits */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Factory &amp; Quality Compliance Certifications Held / Required
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {COMMON_CERTIFICATIONS.map(cert => {
                  const isSelected = selectedCertifications.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cert}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Incoterms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Supported Shipping Incoterms
              </label>
              <div className="flex flex-wrap gap-2">
                {INCOTERMS_OPTIONS.map(term => {
                  const isSelected = selectedIncoterms.includes(term);
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => toggleIncoterm(term)}
                      className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capacity or Requirement Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {onboardingType === 'VERIFIED_SUPPLIER'
                  ? 'Factory Production Lines & Monthly Output Capacity'
                  : 'Specific Procurement Requirements or Standard MOQ Needs'}
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 5 CNC production lines with 10,000 units monthly capacity, or Regular monthly container imports for retail distribution..."
                value={productionCapacityOrRequirement}
                onChange={e => setProductionCapacityOrRequirement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Trade Terms & Vetting Consent */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToVettingPolicy}
                  onChange={e => setAgreedToVettingPolicy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm that all business information provided is true and accurate. I agree to trade with verified partners under TradeHeaven's <strong>Trade Assurance Escrow</strong> rules and zero-scam compliance policy.
                </span>
              </label>
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    <span>Vetting Business Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Complete Free Registration &amp; Activate Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: VERIFIED PASS & SUCCESS CERTIFICATE */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-emerald-200 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Top Success Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Verification Approved
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Welcome to TradeHeaven Verified Network!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your business credentials for <strong>{companyName || 'Your Company'}</strong> have been authenticated. You now have direct zero-broker access to verified global buyers and audited manufacturers.
              </p>
            </div>

            {/* Verified Digital Certificate Card */}
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-left space-y-4 border border-amber-400/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-amber-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                    Trade Assurance Verified Partner
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                  STATUS: ACTIVE / VETTED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Company Name:</span>
                  <span className="font-bold text-white text-sm truncate block">{companyName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Trading Intent / Role:</span>
                  <span className="font-bold text-amber-300">{onboardingType.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Registration / Tax ID:</span>
                  <span className="font-mono text-slate-200 font-semibold">{legalRegistrationNumber || taxOrVatId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Country / HQ:</span>
                  <span className="font-semibold text-slate-200">{country}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Escrow &amp; Inspection Eligible</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">UID: {registeredUser?.id || 'th-verified-user'}</span>
              </div>
            </div>

            {/* Next Step Action Buttons */}
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onboardingType === 'GENUINE_BUYER' ? (
                <>
                  <button
                    onClick={() => {
                      if (onOpenCreateRfq) onOpenCreateRfq();
                      else onNavigate('RFQ_HUB');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md transition-all"
                  >
                    Post Your First Buy RFQ
                  </button>
                  <button
                    onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer transition-all"
                  >
                    Explore Wholesale Factory Products
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('BUY_LEADS')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md transition-all"
                  >
                    Browse $50M+ Buyer RFQs
                  </button>
                  <button
                    onClick={() => onNavigate('POST_SELL_OFFER')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer transition-all"
                  >
                    List Your Factory Products
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Need assistance? Contact our VIP Onboarding Desk on WhatsApp (+91 85329 34479) or email help@tradeheaven.net
            </p>

          </div>
        )}

      </main>

      {/* 3. COMPARISON SECTION: UNVERIFIED OPEN WEB VS TRADEHEAVEN */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Why Real Buyers &amp; Suppliers Choose TradeHeaven
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            Traditional open forums are filled with non-genuine inquiries and fake brokers. TradeHeaven strictly enforces enterprise-grade identity vetting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Bad: Traditional Unverified Sites */}
          <div className="p-6 rounded-3xl bg-rose-50/60 border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Generic Open Web Marketplaces</span>
            </div>
            <ul className="space-y-2.5 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Unverified anonymous buyers submitting fake RFQs for price fishing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Middlemen brokers masquerading as direct factory plants.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Unprotected wire transfers with high risk of non-delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>High upfront mandatory listing fees before any deals close.</span>
              </li>
            </ul>
          </div>

          {/* Good: TradeHeaven Verified Rail */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>TradeHeaven Verified &amp; Escrow Backed</span>
            </div>
            <ul className="space-y-2.5 text-slate-800 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>100% Free registration for genuine buyers and audited factories.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Tax ID and CR validation on all corporate onboarding accounts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Funds locked in Swiss Trade Assurance Escrow until pre-shipment sign-off.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Direct plant manager negotiation with real-time Incoterms calculations.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
};
