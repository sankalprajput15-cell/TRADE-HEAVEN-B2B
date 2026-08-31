import React, { useState } from 'react';
import { 
  SaaSPlan, 
  GeminiModelMeta, 
  FeatureFlagDefinition 
} from '../../../types/planPricingTypes';
import { 
  Check, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Globe, 
  Terminal, 
  Code, 
  Brain, 
  ArrowRight, 
  HelpCircle, 
  Clock, 
  Layers, 
  ChevronDown 
} from 'lucide-react';

interface CustomerPricingPreviewProps {
  plans: SaaSPlan[];
  modelsCatalog: GeminiModelMeta[];
  featuresCatalog: FeatureFlagDefinition[];
  onSelectPlanForCheckout?: (plan: SaaSPlan, cycle: 'MONTHLY' | 'ANNUAL') => void;
}

export const CustomerPricingPreview: React.FC<CustomerPricingPreviewProps> = ({
  plans,
  modelsCatalog,
  featuresCatalog,
  onSelectPlanForCheckout
}) => {
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(true);

  const activePlans = plans.filter(p => p.status === 'ACTIVE').sort((a, b) => a.displayOrder - b.displayOrder);

  // Map model ID to name
  const modelMap = new Map(modelsCatalog.map(m => [m.id, m]));
  // Map feature key to def
  const featureMap = new Map(featuresCatalog.map(f => [f.key, f]));

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Header & Billing Cycle Switch */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Production Ready Infrastructure</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Flexible Pricing for Enterprise SaaS &amp; API Builders
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Scale seamlessly from free local prototyping to high-throughput multimodal pipelines with 2,000,000 token context windows.
        </p>
        </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {activePlans.map(plan => {
          const price = plan.annualPriceUsd;
          const isFree = plan.annualPriceUsd === 0;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'bg-slate-900 text-white shadow-xl ring-2 ring-blue-500 scale-[1.02]'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Most Popular</span>
                </div>
              )}

              {/* Card Top */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    plan.isPopular
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {plan.tierBadge || plan.name}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {plan.activeSubscribersCount} active teams
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black">{plan.name}</h3>
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${plan.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-dashed border-slate-200/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono">
                      {isFree ? 'Free' : `$${price}`}
                    </span>
                    {!isFree && (
                      <span className={`text-xs ${plan.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                        / year
                      </span>
                    )}
                  </div>
                </div>

                {/* Core Allocation Badges */}
                <div className="space-y-2 py-1">
                  <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
                    plan.isPopular ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>Tokens / Mo</span>
                    </span>
                    <span className="font-mono text-blue-400 font-black">
                      {(plan.tokenQuotaMonthly / 1000000).toLocaleString()}M
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
                    plan.isPopular ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>Rate Limits</span>
                    </span>
                    <span className="font-mono">{plan.rpm} RPM · {plan.rpd.toLocaleString()} RPD</span>
                  </div>
                </div>

                {/* Allowed Models */}
                <div className="space-y-1.5 pt-2">
                  <div className={`text-[10px] font-black uppercase tracking-wider ${
                    plan.isPopular ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Included AI Models:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plan.allowedModels.slice(0, 3).map(mId => {
                      const m = modelMap.get(mId);
                      return (
                        <span
                          key={mId}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            plan.isPopular ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {m?.name.replace('Google ', '') || mId}
                        </span>
                      );
                    })}
                    {plan.allowedModels.length > 3 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        plan.isPopular ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        +{plan.allowedModels.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 pt-3 border-t border-slate-200/20">
                  <div className={`text-[10px] font-black uppercase tracking-wider ${
                    plan.isPopular ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Platform Capabilities:
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{(plan.maxContextWindow / 1000).toLocaleString()}k max token context</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{plan.maxConcurrentRequests} parallel requests</span>
                    </li>
                    {plan.featureKeys.slice(0, 4).map(fKey => {
                      const f = featureMap.get(fKey);
                      return (
                        <li key={fKey} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f?.name || fKey}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => onSelectPlanForCheckout && onSelectPlanForCheckout(plan, 'ANNUAL')}
                  className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    plan.isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : isFree
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{isFree ? 'Start Building Free' : `Get Started with ${plan.name}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div 
          onClick={() => setShowComparisonMatrix(!showComparisonMatrix)}
          className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Comprehensive Plan Feature Comparison Matrix</h3>
              <p className="text-xs text-slate-500">Side-by-side technical breakdown of token rates, models, and compliance SLAs.</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${showComparisonMatrix ? 'rotate-180' : ''}`} />
        </div>

        {showComparisonMatrix && (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-black text-slate-700 w-1/4">Feature &amp; Metric</th>
                  {activePlans.map(p => (
                    <th key={p.id} className="py-3 px-4 font-black text-slate-900 text-center">
                      <div className="font-black text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ${p.annualPriceUsd}/year
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Monthly Tokens */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Monthly Token Allocation</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                      {(p.tokenQuotaMonthly / 1000000).toLocaleString()}M
                    </td>
                  ))}
                </tr>

                {/* Rate Limits */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Requests Per Minute (RPM)</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center font-mono font-bold">
                      {p.rpm} RPM
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Requests Per Day (RPD)</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center font-mono">
                      {p.rpd.toLocaleString()} RPD
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Max Context Window</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center font-bold">
                      {(p.maxContextWindow / 1000).toLocaleString()}k Tokens
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Flagship Pro Model Access</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center">
                      {p.allowedModels.includes('gemini-2.5-pro') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[3]" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Deep Reasoning &amp; CoT Engine</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center">
                      {p.allowedModels.includes('gemini-2.0-flash-thinking-exp') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[3]" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Multimodal Audio / Video Streaming</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center">
                      {p.featureKeys.includes('multimodal_audio_video') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[3]" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Web Search Grounding</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center">
                      {p.featureKeys.includes('web_search_grounding') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[3]" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Code Execution Sandbox</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center">
                      {p.featureKeys.includes('code_execution_sandbox') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[3]" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">SLA 99.95% Guaranteed Uptime</td>
                  {activePlans.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center">
                      {p.featureKeys.includes('sla_99_95_uptime') ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          99.95% SLA
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
