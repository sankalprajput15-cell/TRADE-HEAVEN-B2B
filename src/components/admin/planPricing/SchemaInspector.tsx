import React, { useState } from 'react';
import { PRISMA_SCHEMA_DEFINITION, SQL_DDL_DEFINITION } from '../../../data/planPricingSchema';
import { 
  Database, 
  Code, 
  Copy, 
  Check, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Server, 
  Key,
  ExternalLink
} from 'lucide-react';

export const SchemaInspector: React.FC = () => {
  const [selectedSchemaType, setSelectedSchemaType] = useState<'PRISMA' | 'SQL'>('PRISMA');
  const [copied, setCopied] = useState(false);

  const currentContent = selectedSchemaType === 'PRISMA' ? PRISMA_SCHEMA_DEFINITION : SQL_DDL_DEFINITION;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">Relational Data Architecture &amp; Schema Engine</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Fully normalized relational model designed for PostgreSQL &amp; Cloud SQL with Prisma ORM definitions, composite keys, token usage indexes, and audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSchemaType('PRISMA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSchemaType === 'PRISMA'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Prisma Schema (.prisma)
          </button>
          <button
            onClick={() => setSelectedSchemaType('SQL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSchemaType === 'SQL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            PostgreSQL DDL (.sql)
          </button>
        </div>
      </div>

      {/* Relational Table Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>plans</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Tier definitions, pricing, token quotas, RPM/RPD caps, Stripe Product IDs.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>features</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Feature flags catalog (Grounding, Execution, Multimodal, Priority SLAs).</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>plan_features</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Many-to-many junction mapping plans to enabled capabilities.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>model_rate_limits</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Per-model RPM, RPD, TPM and concurrency overrides per plan.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <FileText className="w-4 h-4 text-rose-600" />
            <span>user_subscriptions</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Live customer subscriptions, token usage counters, renewal cycle timestamps.</p>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {selectedSchemaType === 'PRISMA' ? 'prisma/schema.prisma' : 'migrations/001_plans_and_pricing_schema.sql'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre font-normal">
            {currentContent}
          </pre>
        </div>
      </div>

    </div>
  );
};
