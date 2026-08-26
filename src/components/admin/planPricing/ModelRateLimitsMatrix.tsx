import React, { useState } from 'react';
import { 
  SaaSPlan, 
  GeminiModelMeta, 
  ModelRateLimitRule 
} from '../../../types/planPricingTypes';
import { 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Save, 
  Check, 
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

interface ModelRateLimitsMatrixProps {
  plans: SaaSPlan[];
  modelsCatalog: GeminiModelMeta[];
  rateLimits: ModelRateLimitRule[];
  onUpdateLimit: (rule: ModelRateLimitRule) => void;
}

export const ModelRateLimitsMatrix: React.FC<ModelRateLimitsMatrixProps> = ({
  plans,
  modelsCatalog,
  rateLimits,
  onUpdateLimit
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan-pro-ai');
  const [editingRules, setEditingRules] = useState<Record<string, Partial<ModelRateLimitRule>>>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handleRuleChange = (modelId: string, field: keyof ModelRateLimitRule, value: any) => {
    const key = `${selectedPlanId}_${modelId}`;
    setEditingRules(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveRule = (model: GeminiModelMeta) => {
    const key = `${selectedPlanId}_${model.id}`;
    const existing = rateLimits.find(r => r.planId === selectedPlanId && r.modelId === model.id) || {
      id: `limit-${Date.now()}`,
      planId: selectedPlanId,
      modelId: model.id,
      rpm: activePlan.rpm,
      rpd: activePlan.rpd,
      tpm: activePlan.tpm || 500000,
      maxConcurrent: activePlan.maxConcurrentRequests || 5,
      isPriorityQueue: activePlan.featureKeys.includes('priority_queue_sla')
    };

    const updated = {
      ...existing,
      ...(editingRules[key] || {})
    };

    onUpdateLimit(updated);
    setSavedSuccess(model.id);
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Gemini Model Dynamic Rate Limiting &amp; Routing Engine
            </h3>
            <p className="text-xs text-slate-400">
              Configure fine-grained Request Per Minute (RPM), Daily caps (RPD), and Concurrency overrides per tier and model.
            </p>
          </div>
        </div>

        {/* Plan Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 shrink-0">Select Plan:</span>
          <select
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plan Default Quota Overview */}
      {activePlan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Base Plan RPM</div>
            <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{activePlan.rpm} RPM</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Base Plan RPD</div>
            <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{activePlan.rpd.toLocaleString()} RPD</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Monthly Token Quota</div>
            <div className="text-lg font-black text-blue-600 font-mono mt-0.5">
              {(activePlan.tokenQuotaMonthly / 1000000).toLocaleString()}M
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Max Concurrency</div>
            <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{activePlan.maxConcurrentRequests} slots</div>
          </div>
        </div>
      )}

      {/* Models Rate Limits Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black uppercase text-slate-800">
              Per-Model Quota Overrides for &quot;{activePlan?.name}&quot;
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {modelsCatalog.length} Supported Google AI Models
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Google AI Model</th>
                <th className="py-3 px-4">Allowed in Plan</th>
                <th className="py-3 px-4">RPM Override</th>
                <th className="py-3 px-4">RPD Override</th>
                <th className="py-3 px-4">Max Concurrent</th>
                <th className="py-3 px-4">Priority SLA Queue</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {modelsCatalog.map(model => {
                const isModelAllowed = activePlan?.allowedModels.includes(model.id);
                const existingLimit = rateLimits.find(r => r.planId === selectedPlanId && r.modelId === model.id);
                const editKey = `${selectedPlanId}_${model.id}`;
                const staged = editingRules[editKey] || {};

                const curRpm = staged.rpm !== undefined ? staged.rpm : (existingLimit?.rpm ?? activePlan?.rpm ?? 60);
                const curRpd = staged.rpd !== undefined ? staged.rpd : (existingLimit?.rpd ?? activePlan?.rpd ?? 10000);
                const curConcurrent = staged.maxConcurrent !== undefined ? staged.maxConcurrent : (existingLimit?.maxConcurrent ?? activePlan?.maxConcurrentRequests ?? 5);
                const curPriority = staged.isPriorityQueue !== undefined ? staged.isPriorityQueue : (existingLimit?.isPriorityQueue ?? activePlan?.featureKeys.includes('priority_queue_sla') ?? false);

                return (
                  <tr key={model.id} className={`hover:bg-slate-50/70 transition-colors ${!isModelAllowed ? 'opacity-60 bg-slate-50/40' : ''}`}>
                    
                    {/* Model Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isModelAllowed ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{model.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{model.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Allowed Status */}
                    <td className="py-3 px-4">
                      {isModelAllowed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Enabled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          Locked (Upgrade)
                        </span>
                      )}
                    </td>

                    {/* RPM Input */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        value={curRpm}
                        disabled={!isModelAllowed}
                        onChange={e => handleRuleChange(model.id, 'rpm', Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </td>

                    {/* RPD Input */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={10}
                        value={curRpd}
                        disabled={!isModelAllowed}
                        onChange={e => handleRuleChange(model.id, 'rpd', Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </td>

                    {/* Max Concurrency */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        value={curConcurrent}
                        disabled={!isModelAllowed}
                        onChange={e => handleRuleChange(model.id, 'maxConcurrent', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </td>

                    {/* Priority Queue Toggle */}
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={curPriority}
                          disabled={!isModelAllowed}
                          onChange={e => handleRuleChange(model.id, 'isPriorityQueue', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                      </label>
                    </td>

                    {/* Save Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={!isModelAllowed}
                        onClick={() => handleSaveRule(model)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                          savedSuccess === model.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                      >
                        {savedSuccess === model.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Apply</span>
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
