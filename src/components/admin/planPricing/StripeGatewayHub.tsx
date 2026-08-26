import React, { useState } from 'react';
import { 
  SaaSPlan, 
  StripeSyncEvent, 
  PlanPricingMetrics 
} from '../../../types/planPricingTypes';
import { 
  Database, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Code,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

interface StripeGatewayHubProps {
  plans: SaaSPlan[];
  stripeLogs: StripeSyncEvent[];
  metrics: PlanPricingMetrics;
  onSyncCatalog: () => Promise<void>;
  onSimulateWebhook: (eventType: string, payload: any) => Promise<void>;
}

export const StripeGatewayHub: React.FC<StripeGatewayHubProps> = ({
  plans,
  stripeLogs,
  metrics,
  onSyncCatalog,
  onSimulateWebhook
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('invoice.payment_succeeded');
  const [customPayloadJson, setCustomPayloadJson] = useState(`{
  "id": "evt_simulated_${Date.now()}",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_1NqSimulatedPayment",
      "customer": "cus_gemini_buyer_943",
      "amount_paid": 9900,
      "currency": "usd",
      "status": "paid",
      "subscription": "sub_gemini_pro_001"
    }
  }
}`);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncStatusNotice, setSyncStatusNotice] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncCatalog();
      setSyncStatusNotice('Stripe Product Catalog & Price IDs successfully verified.');
      setTimeout(() => setSyncStatusNotice(null), 3500);
    } catch (err: any) {
      setSyncStatusNotice(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFireWebhook = async () => {
    setIsSimulating(true);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(customPayloadJson);
      } catch {
        parsed = { raw: customPayloadJson };
      }
      await onSimulateWebhook(selectedEventType, parsed);
      setSyncStatusNotice(`Webhook "${selectedEventType}" successfully ingested and processed.`);
      setTimeout(() => setSyncStatusNotice(null), 3500);
    } catch (err: any) {
      setSyncStatusNotice(`Webhook simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const PRESET_WEBHOOK_EVENTS = [
    {
      type: 'invoice.payment_succeeded',
      name: 'Invoice Payment Succeeded (Active Subscription Renewed)',
      payload: {
        id: `evt_inv_${Date.now()}`,
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_1NqPaySuccess',
            customer: 'cus_gemini_pro_user',
            amount_paid: 9900,
            currency: 'usd',
            paid: true
          }
        }
      }
    },
    {
      type: 'customer.subscription.created',
      name: 'New Subscription Created (Provision Token Quotas)',
      payload: {
        id: `evt_sub_${Date.now()}`,
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_gemini_starter_992',
            customer: 'cus_new_developer',
            plan: { id: 'price_1NqStarterM_29', interval: 'month' },
            status: 'active'
          }
        }
      }
    },
    {
      type: 'customer.subscription.updated',
      name: 'Subscription Plan Upgrade / Downgrade',
      payload: {
        id: `evt_sub_up_${Date.now()}`,
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_gemini_pro_001',
            customer: 'cus_gemini_pro_user',
            previous_attributes: { items: [{ price: { id: 'price_1Old_starter_25' } }] },
            items: [{ price: { id: 'price_1NqProStudioM_99' } }]
          }
        }
      }
    },
    {
      type: 'customer.subscription.deleted',
      name: 'Subscription Cancelled (Revert to Free Tier)',
      payload: {
        id: `evt_del_${Date.now()}`,
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_gemini_churned',
            customer: 'cus_leaving_user',
            status: 'canceled'
          }
        }
      }
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Hero Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Stripe &amp; Paddle Gateway Catalog Integration</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Healthy
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Automatic Stripe Product &amp; Price object provisioning with full price grandfathering preservation and verified webhook ingestion.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSync}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing Catalog...' : 'Trigger Stripe Re-Sync'}</span>
        </button>
      </div>

      {syncStatusNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatusNotice}</span>
        </div>
      )}

      {/* Plan Stripe Objects Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-800">
            Active Stripe Product &amp; Price IDs Mappings
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {plans.length} Provisioned Product Objects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-black uppercase text-slate-500">
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Stripe Product ID</th>
                <th className="py-3 px-4">Monthly Price ID</th>
                <th className="py-3 px-4">Annual Price ID</th>
                <th className="py-3 px-4">Grandfathered Versions</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {plans.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">${p.monthlyPriceUsd}/mo</div>
                  </td>

                  {/* Product ID */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                      <span>{p.stripeProductId || 'Not set'}</span>
                      <button
                        onClick={() => handleCopy(p.stripeProductId || '', `prod-${p.id}`)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {copiedId === `prod-${p.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  {/* Monthly Price ID */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold">
                      <span>{p.stripePriceIdMonthly || 'Not set'}</span>
                      <button
                        onClick={() => handleCopy(p.stripePriceIdMonthly || '', `m-${p.id}`)}
                        className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
                      >
                        {copiedId === `m-${p.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  {/* Annual Price ID */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-blue-900">
                      <span>{p.stripePriceIdAnnual || 'Not set'}</span>
                      <button
                        onClick={() => handleCopy(p.stripePriceIdAnnual || '', `y-${p.id}`)}
                        className="text-blue-500 hover:text-blue-800 cursor-pointer"
                      >
                        {copiedId === `y-${p.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  {/* Grandfathered Price IDs */}
                  <td className="py-3 px-4">
                    {p.previousStripePriceIds && p.previousStripePriceIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.previousStripePriceIds.map(oldPrice => (
                          <span key={oldPrice} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px]" title="Grandfathered Price ID">
                            {oldPrice}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None (Current only)</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Webhook Simulator & Realtime Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Webhook Simulator */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">Interactive Stripe Webhook Simulator</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dispatch simulated Stripe events directly into the server webhook controller to test token provisioning, plan switches, and cancellations in real-time.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Standard Event Preset
              </label>
              <select
                value={selectedEventType}
                onChange={e => {
                  const ev = PRESET_WEBHOOK_EVENTS.find(p => p.type === e.target.value);
                  setSelectedEventType(e.target.value);
                  if (ev) setCustomPayloadJson(JSON.stringify(ev.payload, null, 2));
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRESET_WEBHOOK_EVENTS.map(ev => (
                  <option key={ev.type} value={ev.type}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event JSON Payload
              </label>
              <textarea
                rows={6}
                value={customPayloadJson}
                onChange={e => setCustomPayloadJson(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleFireWebhook}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Sending Webhook...' : 'Dispatch Webhook Event'}</span>
            </button>
          </div>
        </div>

        {/* Realtime Event Logs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900">Stripe &amp; Webhook Audit Trail</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{stripeLogs.length} Events</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 space-y-2.5 pr-1">
            {stripeLogs.map(log => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{log.eventType}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{log.details}</p>
                {log.stripePriceId && (
                  <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                    Price ID: <span className="text-indigo-600 font-bold">{log.stripePriceId}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
