import React from 'react';
import { Globe2, TrendingUp, Package, DollarSign, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { MarketDemandInsight } from '../../types';

interface Props {
  insight: MarketDemandInsight | null;
  searchedProduct: string;
}

export const LiveMarketDemandBanner: React.FC<Props> = ({ insight, searchedProduct }) => {
  if (!insight || !insight.summary) return null;

  return (
    <div
      data-testid="live-market-demand-insight-banner"
      className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-md space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Market Demand Insight</span>
          </span>
          <span className="text-xs font-bold text-blue-200">
            Product: <strong className="text-white">{insight.keyword || searchedProduct}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{insight.fromCache ? 'Cached Market Sync' : 'Live Google Trade Index'}</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
        {insight.summary}
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
        {Array.isArray(insight.topImportingCountries) && insight.topImportingCountries.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-100">
            <Globe2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span>
              <strong>Active Hubs:</strong> {insight.topImportingCountries.join(', ')}
            </span>
          </div>
        )}

        {insight.typicalPriceRange && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-emerald-200 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong>Wholesale Benchmark:</strong> {insight.typicalPriceRange}
            </span>
          </div>
        )}

        {insight.packagingStandards && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-amber-100">
            <Package className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              <strong>Export Spec:</strong> {insight.packagingStandards}
            </span>
          </div>
        )}
      </div>

      {Array.isArray(insight.sources) && insight.sources.length > 0 && (
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1 font-semibold text-blue-300">
            <Sparkles className="w-3 h-3" />
            <span>Market Sources:</span>
          </span>
          {insight.sources.slice(0, 4).map((src, idx) => (
            <a
              key={`${src.uri}-${idx}`}
              href={src.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors truncate max-w-[220px]"
              title={src.title}
            >
              <span className="truncate">{src.title}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMarketDemandBanner;
