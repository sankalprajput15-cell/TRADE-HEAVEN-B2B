/**
 * Trade Heaven - High-Conversion Empty State Component
 * Displayed when no RFQ buying leads or marketplace listings match current filters or exist in the database.
 */

import React from 'react';
import { PackageSearch, PlusCircle, RefreshCw, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  type: 'rfqs' | 'listings' | 'search';
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  onRefresh?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  onAction,
  actionLabel,
  onRefresh
}) => {
  const getDefaults = () => {
    switch (type) {
      case 'rfqs':
        return {
          title: title || 'No Active Buying Leads Found',
          description: description || 'There are currently no open RFQs in this category. Be the first verified buyer to broadcast your sourcing requirements directly to 50,000+ audited manufacturers.',
          actionLabel: actionLabel || 'Post Free RFQ Now',
          icon: <FileText className="w-8 h-8 text-blue-600" />
        };
      case 'listings':
        return {
          title: title || 'No Supplier Listings Available',
          description: description || 'No verified supplier catalog items found under these specifications. Post an instant RFQ to request direct factory quotes.',
          actionLabel: actionLabel || 'Broadcast Sourcing RFQ',
          icon: <PackageSearch className="w-8 h-8 text-emerald-600" />
        };
      case 'search':
      default:
        return {
          title: title || 'No Matching Records Found',
          description: description || 'We could not find any active RFQs or product listings matching your current keyword and filter criteria. Try resetting filters or post a customized request.',
          actionLabel: actionLabel || 'Create Buy Lead RFQ',
          icon: <PackageSearch className="w-8 h-8 text-indigo-600" />
        };
    }
  };

  const config = getDefaults();

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 shadow-inner">
        {config.icon}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight max-w-md">
        {config.title}
      </h3>

      <p className="text-sm sm:text-base text-slate-500 mt-2.5 max-w-lg leading-relaxed">
        {config.description}
      </p>

      {/* Value prop badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-6 border-t border-slate-100 max-w-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Commission Sourcing</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Swiss Trade Protection Protection</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Factory Responses</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full sm:w-auto">
        {onAction && (
          <button
            onClick={onAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{config.actionLabel}</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
