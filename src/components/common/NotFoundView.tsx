import React from 'react';
import { Home, Compass, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { ActiveView } from '../../types';

interface NotFoundViewProps {
  attemptedView?: string;
  onNavigate: (view: ActiveView | string) => void;
  onOpenContactModal?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  attemptedView,
  onNavigate,
  onOpenContactModal
}) => {
  return (
    <div className="min-h-[550px] w-full flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center space-y-6 shadow-xl relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider">
            <span>HTTP 404 • Destination Not Found</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Page or View Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The section {attemptedView ? <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono font-bold">"{attemptedView}"</code> : 'you navigated to'} might have been updated, relocated, or is under scheduled maintenance.
          </p>
        </div>

        {/* Quick Recovery Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('HOMEPAGE')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Feed</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('PRODUCT_DIRECTORY')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
          >
            <Search className="w-4 h-4" />
            <span>Search Products Catalog</span>
          </button>
        </div>

        {/* Support Link */}
        {onOpenContactModal && (
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Need assistance?</span>
            <button
              type="button"
              onClick={onOpenContactModal}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Contact 24/7 Trade Support Desk
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
