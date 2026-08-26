import React, { useState, useEffect } from 'react';
import { 
  SaaSPlan, 
  PlanPricingMetrics, 
  ModelRateLimitRule, 
  StripeSyncEvent, 
  GeminiModelMeta, 
  FeatureFlagDefinition,
  UserRole
} from '../../types/planPricingTypes';
import { planPricingService } from '../../services/planPricingService';
import { PlanEditModal } from './planPricing/PlanEditModal';
import { CustomerPricingPreview } from './planPricing/CustomerPricingPreview';
import { ModelRateLimitsMatrix } from './planPricing/ModelRateLimitsMatrix';
import { StripeGatewayHub } from './planPricing/StripeGatewayHub';
import { SchemaInspector } from './planPricing/SchemaInspector';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Archive, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Users, 
  Database, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Eye, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PlanPricingAdminModuleProps {
  currentUserRole?: UserRole;
  onNavigateView?: (view: any) => void;
}

type AdminSubTab = 'PLANS_CRUD' | 'PRICING_PREVIEW' | 'RATE_LIMITS' | 'STRIPE_GATEWAY' | 'SCHEMA_INSPECTOR';

export const PlanPricingAdminModule: React.FC<PlanPricingAdminModuleProps> = ({
  currentUserRole = 'ADMIN',
  onNavigateView
}) => {
  // Data State
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [metrics, setMetrics] = useState<PlanPricingMetrics | null>(null);
  const [stripeLogs, setStripeLogs] = useState<StripeSyncEvent[]>([]);
  const [modelsCatalog, setModelsCatalog] = useState<GeminiModelMeta[]>([]);
  const [featuresCatalog, setFeaturesCatalog] = useState<FeatureFlagDefinition[]>([]);
  const [rateLimits, setRateLimits] = useState<ModelRateLimitRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('PLANS_CRUD');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Interactivity
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SaaSPlan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<{ plan: SaaSPlan; cycle: 'MONTHLY' | 'ANNUAL' } | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { plans: fetchedPlans, metrics: fetchedMetrics } = await planPricingService.getPlans(statusFilter);
      setPlans(fetchedPlans);
      setMetrics(fetchedMetrics);
      setModelsCatalog(planPricingService.getModelsCatalog());
      setFeaturesCatalog(planPricingService.getFeaturesCatalog());
      setRateLimits(planPricingService.getModelRateLimits());
      const logs = await planPricingService.getStripeLogs();
      setStripeLogs(logs);
    } catch (err: any) {
      showNotice('ERROR', `Failed to load plans: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const showNotice = (type: 'SUCCESS' | 'ERROR', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Actions
  const handleCreateNewPlan = () => {
    setSelectedPlanForEdit(null);
    setIsEditModalOpen(true);
  };

  const handleEditPlan = (plan: SaaSPlan) => {
    setSelectedPlanForEdit(plan);
    setIsEditModalOpen(true);
  };

  const handleSavePlan = async (planData: Partial<SaaSPlan>) => {
    if (selectedPlanForEdit) {
      const res = await planPricingService.updatePlan(selectedPlanForEdit.id, planData);
      showNotice('SUCCESS', res.message);
    } else {
      const res = await planPricingService.createPlan(planData);
      showNotice('SUCCESS', res.message);
    }
    await loadData();
  };

  const handleArchiveToggle = async (plan: SaaSPlan) => {
    if (plan.status === 'ACTIVE' && plan.activeSubscribersCount > 0) {
      const confirmArchive = window.confirm(
        `Plan "${plan.name}" currently has ${plan.activeSubscribersCount} active subscribers. Archiving it will hide it from new customer checkouts, but existing subscribers will continue to be billed. Continue?`
      );
      if (!confirmArchive) return;
    }

    try {
      const res = await planPricingService.archivePlan(plan.id);
      showNotice('SUCCESS', res.message);
      await loadData();
    } catch (err: any) {
      showNotice('ERROR', err.message);
    }
  };

  const handleDuplicatePlan = async (plan: SaaSPlan) => {
    try {
      const res = await planPricingService.duplicatePlan(plan.id);
      showNotice('SUCCESS', res.message);
      await loadData();
    } catch (err: any) {
      showNotice('ERROR', err.message);
    }
  };

  const handleSyncStripe = async () => {
    const res = await planPricingService.syncStripeCatalog();
    showNotice('SUCCESS', res.message);
    await loadData();
  };

  const handleSimulateWebhook = async (eventType: string, payload: any) => {
    const res = await planPricingService.simulateWebhook(eventType, payload);
    showNotice('SUCCESS', res.message);
    await loadData();
  };

  const handleUpdateRateLimit = (rule: ModelRateLimitRule) => {
    planPricingService.updateModelRateLimit(rule);
    setRateLimits(planPricingService.getModelRateLimits());
    showNotice('SUCCESS', 'Model rate limit overrides updated.');
  };

  // Filter plans based on search query
  const displayedPlans = plans.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Breadcrumb & Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                  Admin Management
                </span>
                <span className="text-slate-500">/</span>
                <span className="text-xs font-bold text-slate-300">Google AI Studio &amp; Gemini Access</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <span>SaaS Plan &amp; Pricing Management Engine</span>
              </h1>
              <p className="text-xs text-slate-400">
                Dynamic tier provisioning, Gemini model rate limits, token allocations, and bi-directional Stripe catalog synchronization.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSyncStripe}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Sync Stripe</span>
              </button>

              <button
                type="button"
                onClick={handleCreateNewPlan}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Plan</span>
              </button>
            </div>

          </div>

          {/* Sub-Navigation Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-0">
            <button
              onClick={() => setActiveSubTab('PLANS_CRUD')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === 'PLANS_CRUD'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Plans &amp; Tier Catalog ({plans.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('PRICING_PREVIEW')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === 'PRICING_PREVIEW'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Customer Pricing Grid Preview</span>
            </button>

            <button
              onClick={() => setActiveSubTab('RATE_LIMITS')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === 'RATE_LIMITS'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Gemini Model Rate Limits Matrix</span>
            </button>

            <button
              onClick={() => setActiveSubTab('STRIPE_GATEWAY')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === 'STRIPE_GATEWAY'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Stripe Gateway &amp; Webhooks</span>
            </button>

            <button
              onClick={() => setActiveSubTab('SCHEMA_INSPECTOR')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === 'SCHEMA_INSPECTOR'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>SQL &amp; Prisma Architecture</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Flash Notification */}
        {notification && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in duration-150 ${
            notification.type === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Global Key Metrics Ribbon */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Plans</span>
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {metrics.activePlans} <span className="text-xs text-slate-400 font-normal">/ {metrics.totalPlans}</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{metrics.activePlans} Active in catalog</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Run Rate</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                ${metrics.totalMonthlyRevenueUsd.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">ARR: ${(metrics.annualRunRateUsd / 1000).toFixed(1)}k/yr</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Subscribers</span>
                <Users className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {metrics.totalSubscribers.toLocaleString()}
              </div>
              <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Across all 4 active tiers</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Tokens Consumed</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-black text-slate-900 font-mono mt-1 flex items-baseline gap-1">
                <span>{(metrics.totalTokensConsumedThisMonth / 1000000).toLocaleString()}M</span>
                <span className="text-xs text-slate-400 font-normal">/ {(metrics.totalTokensAllocated / 1000000).toLocaleString()}M allocated</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.tokenUtilizationRate)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-2xs border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stripe Sync</span>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{metrics.stripeSyncStatus}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Webhook auto-ack active</div>
            </div>
          </div>
        )}

        {/* TAB 1: PLANS CRUD & MATRIX TABLE */}
        {activeSubTab === 'PLANS_CRUD' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search plan by name, slug or description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses ({plans.length})</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="ARCHIVED">Archived Only</option>
                  <option value="DRAFT">Drafts</option>
                </select>
              </div>
            </div>

            {/* Plans List Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Plan Name &amp; Slug</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4">Token Quota / Mo</th>
                      <th className="py-3 px-4">Rate Limits</th>
                      <th className="py-3 px-4">Allowed Models</th>
                      <th className="py-3 px-4">Subscribers</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {displayedPlans.map((plan, idx) => (
                      <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Order */}
                        <td className="py-3 px-4 text-slate-400 font-mono font-bold">
                          #{plan.displayOrder || idx + 1}
                        </td>

                        {/* Name & Slug */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{plan.name}</span>
                            {plan.isPopular && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{plan.slug}</div>
                        </td>

                        {/* Pricing */}
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900 font-mono text-sm">
                            {plan.monthlyPriceUsd === 0 ? 'Free' : `$${plan.monthlyPriceUsd}/mo`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ${plan.annualPriceUsd}/yr
                          </div>
                        </td>

                        {/* Token Quota */}
                        <td className="py-3 px-4">
                          <div className="font-black text-blue-600 font-mono">
                            {(plan.tokenQuotaMonthly / 1000000).toLocaleString()}M tokens
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {(plan.maxContextWindow / 1000).toLocaleString()}k max context
                          </div>
                        </td>

                        {/* Rate Limits */}
                        <td className="py-3 px-4 font-mono">
                          <div>{plan.rpm} RPM</div>
                          <div className="text-[10px] text-slate-400">{plan.rpd.toLocaleString()} RPD</div>
                        </td>

                        {/* Allowed Models */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {plan.allowedModels.slice(0, 2).map(mId => (
                              <span key={mId} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[9px] font-bold truncate">
                                {mId.replace('gemini-', '')}
                              </span>
                            ))}
                            {plan.allowedModels.length > 2 && (
                              <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold">
                                +{plan.allowedModels.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Subscribers */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 font-mono">
                            {plan.activeSubscribersCount.toLocaleString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            plan.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : plan.status === 'ARCHIVED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {plan.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditPlan(plan)}
                              title="Edit Plan"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicatePlan(plan)}
                              title="Duplicate Plan"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleArchiveToggle(plan)}
                              title={plan.status === 'ACTIVE' ? 'Archive Plan' : 'Restore Plan'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                plan.status === 'ACTIVE'
                                  ? 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              {plan.status === 'ACTIVE' ? (
                                <Archive className="w-3.5 h-3.5" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: LIVE CUSTOMER PRICING GRID PREVIEW */}
        {activeSubTab === 'PRICING_PREVIEW' && (
          <CustomerPricingPreview
            plans={plans}
            modelsCatalog={modelsCatalog}
            featuresCatalog={featuresCatalog}
            onSelectPlanForCheckout={(plan, cycle) => {
              setCheckoutModalPlan({ plan, cycle });
            }}
          />
        )}

        {/* TAB 3: GEMINI MODEL RATE LIMITS MATRIX */}
        {activeSubTab === 'RATE_LIMITS' && (
          <ModelRateLimitsMatrix
            plans={plans}
            modelsCatalog={modelsCatalog}
            rateLimits={rateLimits}
            onUpdateLimit={handleUpdateRateLimit}
          />
        )}

        {/* TAB 4: STRIPE & WEBHOOK GATEWAY HUB */}
        {activeSubTab === 'STRIPE_GATEWAY' && (
          <StripeGatewayHub
            plans={plans}
            stripeLogs={stripeLogs}
            metrics={metrics || planPricingService.calculateMetrics()}
            onSyncCatalog={handleSyncStripe}
            onSimulateWebhook={handleSimulateWebhook}
          />
        )}

        {/* TAB 5: SCHEMA & ARCHITECTURE INSPECTOR */}
        {activeSubTab === 'SCHEMA_INSPECTOR' && (
          <SchemaInspector />
        )}

      </div>

      {/* Plan Edit / Create Modal */}
      <PlanEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        plan={selectedPlanForEdit}
        modelsCatalog={modelsCatalog}
        featuresCatalog={featuresCatalog}
        onSave={handleSavePlan}
      />

      {/* Simulated Checkout Modal */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Simulated Stripe Checkout</h3>
              </div>
              <button onClick={() => setCheckoutModalPlan(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Selected Plan:</span>
                <span className="text-slate-900 font-black">{checkoutModalPlan.plan.name}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="text-slate-900 uppercase">{checkoutModalPlan.cycle}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Target Price ID:</span>
                <span className="font-mono text-blue-600">
                  {checkoutModalPlan.cycle === 'MONTHLY' 
                    ? checkoutModalPlan.plan.stripePriceIdMonthly 
                    : checkoutModalPlan.plan.stripePriceIdAnnual}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-700">Total Billed:</span>
                <span className="font-black text-slate-900">
                  ${checkoutModalPlan.cycle === 'MONTHLY' ? checkoutModalPlan.plan.monthlyPriceUsd : checkoutModalPlan.plan.annualPriceUsd} USD
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              In production, this routes the user to the Stripe Checkout Hosted Session or invokes Stripe Elements with token quotas activated on webhook success.
            </p>

            <button
              onClick={async () => {
                await handleSimulateWebhook('customer.subscription.created', {
                  plan_id: checkoutModalPlan.plan.id,
                  price_id: checkoutModalPlan.plan.stripePriceIdMonthly
                });
                setCheckoutModalPlan(null);
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-colors cursor-pointer shadow-sm"
            >
              Complete Simulated Payment &amp; Provision Tokens
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
