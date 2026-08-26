import React, { useState, useEffect } from 'react';
import { 
  SaaSPlan, 
  GeminiModelMeta, 
  FeatureFlagDefinition, 
  Currency,
  GeminiModelId,
  PlanCategory
} from '../../../types/planPricingTypes';
import { 
  X, 
  DollarSign, 
  Cpu, 
  Sliders, 
  CheckSquare, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Layers, 
  Lock, 
  Globe, 
  Terminal, 
  Code, 
  Brain, 
  Zap, 
  Film, 
  HelpCircle,
  Clock,
  ArrowRight,
  Database,
  Plus,
  Trash2,
  ListCheck,
  Factory,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface PlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SaaSPlan | null; // null means Creating new plan
  modelsCatalog: GeminiModelMeta[];
  featuresCatalog: FeatureFlagDefinition[];
  onSave: (planData: Partial<SaaSPlan>) => Promise<void>;
}

type ModalTab = 'BASIC' | 'PRICING' | 'MEMBERSHIP_FEATURES' | 'QUOTAS' | 'MODELS' | 'FEATURES';

export const PlanEditModal: React.FC<PlanEditModalProps> = ({
  isOpen,
  onClose,
  plan,
  modelsCatalog,
  featuresCatalog,
  onSave
}) => {
  const isEditing = Boolean(plan);

  // Form State
  const [activeTab, setActiveTab] = useState<ModalTab>('BASIC');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlanCategory>('SUPPLIER_MEMBERSHIP');
  const [targetAudience, setTargetAudience] = useState('');
  const [tierBadge, setTierBadge] = useState('STARTER');
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'BETA'>('ACTIVE');
  const [isPopular, setIsPopular] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);

  // Pricing
  const [monthlyPriceUsd, setMonthlyPriceUsd] = useState(49);
  const [annualPriceUsd, setAnnualPriceUsd] = useState(499);
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [currency, setCurrency] = useState<Currency>('USD');

  // Bullet Point Features (for Supplier/Buyer Memberships)
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureItem, setNewFeatureItem] = useState('');

  // Token & Rate Limits
  const [tokenQuotaMonthly, setTokenQuotaMonthly] = useState(50000000);
  const [rpm, setRpm] = useState(60);
  const [rpd, setRpd] = useState(10000);
  const [tpm, setTpm] = useState(500000);
  const [maxContextWindow, setMaxContextWindow] = useState(1000000);
  const [maxOutputTokens, setMaxOutputTokens] = useState(8192);
  const [maxConcurrentRequests, setMaxConcurrentRequests] = useState(8);

  // Allowed Models & Features
  const [allowedModels, setAllowedModels] = useState<GeminiModelId[]>(['gemini-2.5-flash', 'gemini-1.5-flash', 'text-embedding-004']);
  const [featureKeys, setFeatureKeys] = useState<string[]>(['web_search_grounding', 'function_calling_json']);

  // Validation & Submitting
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state
  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setSlug(plan.slug);
      setDescription(plan.description || '');
      setCategory(plan.category || 'API_SAAS');
      setTargetAudience(plan.targetAudience || '');
      setTierBadge(plan.tierBadge || 'STARTER');
      setStatus(plan.status);
      setIsPopular(Boolean(plan.isPopular));
      setDisplayOrder(plan.displayOrder || 1);

      setMonthlyPriceUsd(plan.monthlyPriceUsd);
      setAnnualPriceUsd(plan.annualPriceUsd);
      setDiscountPercentage(plan.discountPercentage || 17);
      setCurrency(plan.currency || 'USD');

      setFeaturesList(plan.featuresList && plan.featuresList.length > 0 ? [...plan.featuresList] : []);

      setTokenQuotaMonthly(plan.tokenQuotaMonthly || 25000000);
      setRpm(plan.rpm || 60);
      setRpd(plan.rpd || 10000);
      setTpm(plan.tpm || 500000);
      setMaxContextWindow(plan.maxContextWindow || 1000000);
      setMaxOutputTokens(plan.maxOutputTokens || 8192);
      setMaxConcurrentRequests(plan.maxConcurrentRequests || 8);

      setAllowedModels(plan.allowedModels && plan.allowedModels.length > 0 ? plan.allowedModels : ['gemini-2.5-flash', 'gemini-1.5-flash']);
      setFeatureKeys(plan.featureKeys || []);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setCategory('SUPPLIER_MEMBERSHIP');
      setTargetAudience('Emerging Exporters & Verified Factories');
      setTierBadge('SILVER');
      setStatus('ACTIVE');
      setIsPopular(false);
      setDisplayOrder(1);

      setMonthlyPriceUsd(49);
      setAnnualPriceUsd(499);
      setDiscountPercentage(15);
      setCurrency('USD');

      setFeaturesList([
        'Verified Member Badge',
        'Direct RFQ Matching',
        'Standard Escrow Support'
      ]);

      setTokenQuotaMonthly(50000000);
      setRpm(60);
      setRpd(10000);
      setTpm(500000);
      setMaxContextWindow(1000000);
      setMaxOutputTokens(8192);
      setMaxConcurrentRequests(8);

      setAllowedModels(['gemini-2.5-flash', 'gemini-1.5-flash', 'text-embedding-004']);
      setFeatureKeys(['web_search_grounding', 'function_calling_json', 'custom_system_prompts']);
    }
    setErrors({});
    setActiveTab('BASIC');
  }, [plan, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug from name if not manually editing slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Recalculate annual price when monthly or discount changes
  const handleMonthlyPriceChange = (val: number) => {
    const num = Math.max(0, val);
    setMonthlyPriceUsd(num);
    const calculatedAnnual = Math.round(num * 12 * (1 - discountPercentage / 100));
    setAnnualPriceUsd(calculatedAnnual);
  };

  const handleDiscountChange = (val: number) => {
    const disc = Math.min(99, Math.max(0, val));
    setDiscountPercentage(disc);
    const calculatedAnnual = Math.round(monthlyPriceUsd * 12 * (1 - disc / 100));
    setAnnualPriceUsd(calculatedAnnual);
  };

  const toggleModel = (modelId: GeminiModelId) => {
    if (allowedModels.includes(modelId)) {
      if (allowedModels.length === 1) {
        setErrors(prev => ({ ...prev, models: 'At least one model must be enabled for this plan.' }));
        return;
      }
      setAllowedModels(allowedModels.filter(m => m !== modelId));
    } else {
      setAllowedModels([...allowedModels, modelId]);
    }
    setErrors(prev => {
      const rest = { ...prev };
      delete rest.models;
      return rest;
    });
  };

  const toggleFeature = (key: string) => {
    if (featureKeys.includes(key)) {
      setFeatureKeys(featureKeys.filter(k => k !== key));
    } else {
      setFeatureKeys([...featureKeys, key]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Plan name is required.';
    if (!slug.trim()) newErrors.slug = 'URL slug is required.';
    if (monthlyPriceUsd < 0) newErrors.monthlyPrice = 'Monthly price cannot be negative.';
    if (annualPriceUsd < 0) newErrors.annualPrice = 'Annual price cannot be negative.';
    if (tokenQuotaMonthly <= 0) newErrors.tokenQuota = 'Monthly token quota must be greater than zero.';
    if (rpm <= 0) newErrors.rpm = 'Requests Per Minute (RPM) must be greater than zero.';
    if (rpd <= 0) newErrors.rpd = 'Requests Per Day (RPD) must be greater than zero.';
    if (allowedModels.length === 0) newErrors.models = 'Select at least one allowed model.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category,
        targetAudience: targetAudience.trim(),
        featuresList: featuresList.filter(f => f.trim().length > 0),
        tierBadge,
        status,
        isPopular,
        displayOrder: Number(displayOrder),
        monthlyPriceUsd: Number(monthlyPriceUsd),
        annualPriceUsd: Number(annualPriceUsd),
        discountPercentage: Number(discountPercentage),
        currency,
        tokenQuotaMonthly: Number(tokenQuotaMonthly),
        rpm: Number(rpm),
        rpd: Number(rpd),
        tpm: Number(tpm),
        maxContextWindow: Number(maxContextWindow),
        maxOutputTokens: Number(maxOutputTokens),
        maxConcurrentRequests: Number(maxConcurrentRequests),
        allowedModels,
        featureKeys
      });
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save plan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFeatureItem = () => {
    if (!newFeatureItem.trim()) return;
    setFeaturesList([...featuresList, newFeatureItem.trim()]);
    setNewFeatureItem('');
  };

  const handleRemoveFeatureItem = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  // Quick token quota presets
  const TOKEN_PRESETS = [
    { label: '5 Million', value: 5000000 },
    { label: '35 Million', value: 35000000 },
    { label: '180 Million', value: 180000000 },
    { label: '500 Million', value: 500000000 },
    { label: '1 Billion', value: 1000000000 }
  ];

  // Group features by category
  const featuresByCategory: Record<string, FeatureFlagDefinition[]> = {};
  featuresCatalog.forEach(f => {
    if (!featuresByCategory[f.category]) featuresByCategory[f.category] = [];
    featuresByCategory[f.category].push(f);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {isEditing ? `Edit Plan: ${plan?.name}` : 'Create New SaaS Plan'}
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                  status === 'ACTIVE' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' :
                  status === 'ARCHIVED' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' :
                  'bg-amber-950/80 text-amber-300 border-amber-500/50'
                }`}>
                  {status}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure base pricing, model rate limits, token quotas, and Stripe synchronization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('BASIC')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'BASIC'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. General &amp; Category</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PRICING')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'PRICING'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>2. Pricing &amp; Billing</span>
            {isEditing && (plan?.monthlyPriceUsd !== monthlyPriceUsd) && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Price modified (will version Stripe Price)" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEMBERSHIP_FEATURES')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'MEMBERSHIP_FEATURES'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListCheck className="w-4 h-4" />
            <span>3. Tier Feature Bullets ({featuresList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUOTAS')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'QUOTAS'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>4. Token Quotas &amp; Limits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MODELS')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'MODELS'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>5. Model Access ({allowedModels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FEATURES')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'FEATURES'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>6. Flag Matrix ({featureKeys.length})</span>
          </button>
        </div>

        {/* Global Errors Alert */}
        {Object.keys(errors).length > 0 && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please resolve validation errors before saving this plan.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'BASIC' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Category Selector Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Plan Category / Platform Realm <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('SUPPLIER_MEMBERSHIP');
                      if (!targetAudience) setTargetAudience('Emerging Exporters & Verified Factories');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      category === 'SUPPLIER_MEMBERSHIP'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Factory className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black">Supplier Membership</span>
                    </div>
                    <span className="text-[10px] text-slate-500">For Exporters, Factories &amp; Sellers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory('BUYER_MEMBERSHIP');
                      if (!targetAudience) setTargetAudience('Boutique Importers & Corporate Sourcing');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      category === 'BUYER_MEMBERSHIP'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-black">Buyer Membership</span>
                    </div>
                    <span className="text-[10px] text-slate-500">For Importers, Wholesalers &amp; Procurement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory('API_SAAS');
                      if (!targetAudience) setTargetAudience('Developers, Startups & Enterprises');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      category === 'API_SAAS'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Terminal className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-black">API &amp; Developer SaaS</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Token quotas, LLM models &amp; SDK access</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plan Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g., Gold Exporter Tier"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-900 shadow-2xs"
                  />
                  {errors.name && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug / Checkout Plan Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="e.g., gold-supplier-annual"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono text-slate-900 shadow-2xs"
                  />
                  {errors.slug && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.slug}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Audience Persona
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="e.g., Established Manufacturers & High-Volume Exporters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plan Description &amp; Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g., High-visibility tier for established manufacturers seeking consistent high-volume import tenders."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tier Category Badge
                  </label>
                  <input
                    type="text"
                    value={tierBadge}
                    onChange={e => setTierBadge(e.target.value)}
                    placeholder="e.g., GOLD, VIP ELITE, PRO"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-900 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-900 shadow-2xs"
                  >
                    <option value="ACTIVE">ACTIVE (Publicly listed)</option>
                    <option value="ARCHIVED">ARCHIVED (Existing users only)</option>
                    <option value="DRAFT">DRAFT (Admin preview only)</option>
                    <option value="BETA">BETA (Invite only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Priority / Sort Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={displayOrder}
                    onChange={e => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              {/* Popular Spotlight Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Featured &quot;Most Popular&quot; Ribbon</div>
                    <div className="text-[11px] text-slate-500">Highlights this plan on the public pricing grid with recommendation styling.</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={e => setIsPopular(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERSHIP BULLET FEATURES */}
          {activeTab === 'MEMBERSHIP_FEATURES' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-black">Customer-Facing Plan Highlights &amp; Inclusions</div>
                  <p className="text-indigo-800 text-[11px] leading-relaxed">
                    These bullet points are displayed directly on the Supplier &amp; Buyer Membership Cards in the live platform. Add, edit, or remove features instantly.
                  </p>
                </div>
              </div>

              {/* Add New Feature Item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureItem}
                  onChange={e => setNewFeatureItem(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeatureItem();
                    }
                  }}
                  placeholder="e.g., Gold Certified Factory Audit Badge or 100 Buy Lead Inquiries / mo"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddFeatureItem}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bullet</span>
                </button>
              </div>

              {/* Feature Items List */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Configured Feature Items ({featuresList.length})
                </div>

                {featuresList.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
                    No custom bullet features added yet. Add feature points above to showcase on the plan card.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {featuresList.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 group hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-black">
                            ✓
                          </span>
                          <span className="text-xs font-semibold text-slate-800 break-words">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureItem(index)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Remove feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & BILLING CYCLES */}
          {activeTab === 'PRICING' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold">Live Price Modification &amp; Grandfathering Safety</div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    When you modify pricing for an active plan, the platform automatically creates a new versioned Stripe Price ID. Existing subscribers remain grandfathered at their original locked rate until explicit migration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Price ({currency}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={monthlyPriceUsd}
                      onChange={e => handleMonthlyPriceChange(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-900 shadow-2xs font-mono"
                    />
                  </div>
                  {errors.monthlyPrice && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.monthlyPrice}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={discountPercentage}
                      onChange={e => handleDiscountChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-900 shadow-2xs font-mono"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Calculated Annual Price ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={annualPriceUsd}
                      onChange={e => setAnnualPriceUsd(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-900 shadow-2xs font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    Subscribers save ${(monthlyPriceUsd * 12 - annualPriceUsd).toFixed(0)}/yr
                  </p>
                </div>
              </div>

              {/* Stripe & Payment Gateway Mapping */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Stripe Gateway Product &amp; Price Mapping
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-[10px] font-mono border border-blue-700/50">
                    Live Auto-Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Stripe Product ID</div>
                    <div className="font-mono text-slate-200 truncate">
                      {plan?.stripeProductId || `prod_gemini_${slug.replace(/-/g, '_') || 'custom'}`}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Active Monthly Price ID</div>
                    <div className="font-mono text-emerald-300 truncate">
                      {plan?.stripePriceIdMonthly || `price_1Nq${slug.replace(/-/g, '_')}_M_${monthlyPriceUsd}`}
                    </div>
                  </div>
                </div>

                {isEditing && plan?.previousStripePriceIds && plan.previousStripePriceIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-amber-400 font-bold uppercase mb-1">
                      Grandfathered Price Versions ({plan.previousStripePriceIds.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.previousStripePriceIds.map(oldId => (
                        <span key={oldId} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                          {oldId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TOKEN & USAGE QUOTAS */}
          {activeTab === 'QUOTAS' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Monthly Token Allocation */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-slate-900">
                      Total Monthly Token Quota (Input + Output)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Hard or soft ceiling on tokens processed per billing cycle across API models.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-600 font-mono">
                      {(tokenQuotaMonthly / 1000000).toLocaleString()} Million
                    </span>
                    <span className="text-xs text-slate-400 font-medium"> tokens</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {TOKEN_PRESETS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setTokenQuotaMonthly(p.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tokenQuotaMonthly === p.value
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={1000000}
                  max={2000000000}
                  step={5000000}
                  value={tokenQuotaMonthly}
                  onChange={e => setTokenQuotaMonthly(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Rate Limits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RPM (Requests / Minute)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rpm}
                    onChange={e => setRpm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Per-minute burst rate limit</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RPD (Requests / Day)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={rpd}
                    onChange={e => setRpd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Daily cap on API calls</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Concurrent Requests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxConcurrentRequests}
                    onChange={e => setMaxConcurrentRequests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Parallel connection slots</p>
                </div>
              </div>

              {/* Context Window & Output Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Context Window (Tokens)
                  </label>
                  <select
                    value={maxContextWindow}
                    onChange={e => setMaxContextWindow(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-900"
                  >
                    <option value={32768}>32k Tokens (Fast Chat)</option>
                    <option value={128000}>128k Tokens (Standard)</option>
                    <option value={1000000}>1,000,000 Tokens (1M Context)</option>
                    <option value={2000000}>2,000,000 Tokens (2M Flagship)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Completion Output
                  </label>
                  <select
                    value={maxOutputTokens}
                    onChange={e => setMaxOutputTokens(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-900"
                  >
                    <option value={8192}>8,192 Tokens (Default)</option>
                    <option value={16384}>16,384 Tokens (Extended)</option>
                    <option value={65536}>65,536 Tokens (Full Code Output)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALLOWED MODELS */}
          {activeTab === 'MODELS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Assigned Platform Models</h3>
                  <p className="text-[11px] text-slate-500">Check which models subscribers of this plan have authorization to call.</p>
                </div>
                <span className="text-xs font-bold text-blue-600">{allowedModels.length} models enabled</span>
              </div>

              {errors.models && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {errors.models}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modelsCatalog.map(model => {
                  const isEnabled = allowedModels.includes(model.id);
                  return (
                    <div
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isEnabled
                          ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isEnabled ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 truncate">{model.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold uppercase">
                            {(model.contextWindowTokens / 1000).toLocaleString()}k ctx
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {model.description}
                        </p>
                        <div className="pt-1 flex flex-wrap gap-1">
                          {model.modalities.map(mod => (
                            <span key={mod} className="text-[8px] font-bold px-1 rounded bg-slate-100 text-slate-600">
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: FEATURE MATRIX & TOGGLES */}
          {activeTab === 'FEATURES' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Feature Matrix Flags &amp; Add-ons</h3>
                  <p className="text-[11px] text-slate-500">Toggle capabilities included in this tier (Grounding, Execution, SLA, Compliance).</p>
                </div>
                <span className="text-xs font-bold text-blue-600">{featureKeys.length} features active</span>
              </div>

              {Object.entries(featuresByCategory).map(([category, features]) => (
                <div key={category} className="space-y-2.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{category.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {features.map(f => {
                      const isChecked = featureKeys.includes(f.key);
                      return (
                        <div
                          key={f.key}
                          onClick={() => toggleFeature(f.key)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                            isChecked
                              ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 opacity-60'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{f.name}</span>
                              {f.isAddon && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  +${f.addonPriceMonthlyUsd}/mo
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-snug line-clamp-1">{f.description}</div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer pointer-events-none shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        </form>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTab !== 'BASIC' && (
              <button
                type="button"
                onClick={() => {
                  const tabs: ModalTab[] = ['BASIC', 'PRICING', 'MEMBERSHIP_FEATURES', 'QUOTAS', 'MODELS', 'FEATURES'];
                  const curIdx = tabs.indexOf(activeTab);
                  if (curIdx > 0) setActiveTab(tabs[curIdx - 1]);
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
            )}

            {activeTab !== 'FEATURES' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs: ModalTab[] = ['BASIC', 'PRICING', 'MEMBERSHIP_FEATURES', 'QUOTAS', 'MODELS', 'FEATURES'];
                  const curIdx = tabs.indexOf(activeTab);
                  if (curIdx < tabs.length - 1) setActiveTab(tabs[curIdx + 1]);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Syncing Plan with Stripe...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes & Sync Gateway' : 'Create Plan & Deploy Price'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
