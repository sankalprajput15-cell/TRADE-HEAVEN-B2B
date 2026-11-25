import React, { useState, useEffect } from 'react';
import {
  Wand2,
  CheckCircle2,
  AlertCircle,
  X,
  StopCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Trash2,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  backgroundAutoFixService,
  BackgroundAutoFixSnapshot
} from '../../services/backgroundAutoFixService';
import { ActiveView } from '../../types';

interface GlobalBackgroundAutoFixIndicatorProps {
  currentView?: ActiveView;
  onNavigateToStudio?: () => void;
}

export const GlobalBackgroundAutoFixIndicator: React.FC<GlobalBackgroundAutoFixIndicatorProps> = ({
  currentView,
  onNavigateToStudio
}) => {
  const [snapshot, setSnapshot] = useState<BackgroundAutoFixSnapshot>(() =>
    backgroundAutoFixService.getSnapshot()
  );
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissedNotice, setIsDismissedNotice] = useState<boolean>(false);

  useEffect(() => {
    const unsub = backgroundAutoFixService.subscribe(nextSnap => {
      setSnapshot(nextSnap);
      if (nextSnap.active) {
        setIsDismissedNotice(false);
      }
    });
    return unsub;
  }, []);

  const hasNotice = Boolean(
    !snapshot.active &&
      snapshot.lastCompletedNotice &&
      !isDismissedNotice &&
      Date.now() - (snapshot.lastCompletedNotice?.at || 0) < 18000
  );

  const isVisible = snapshot.active || hasNotice;

  // Auto-dismiss completed notice after 15 seconds
  useEffect(() => {
    if (hasNotice && !snapshot.active) {
      const timer = window.setTimeout(() => {
        setIsDismissedNotice(true);
        backgroundAutoFixService.dismissNotice();
      }, 15000);
      return () => window.clearTimeout(timer);
    }
  }, [hasNotice, snapshot.active]);

  if (!isVisible) return null;

  const total = Math.max(1, snapshot.total);
  const completed = Math.min(snapshot.completed, total);
  const percent = Math.min(100, Math.round((completed / total) * 100));

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await backgroundAutoFixService.stop();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissedNotice(true);
    backgroundAutoFixService.dismissNotice();
  };

  const handleOpenStudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToStudio) {
      onNavigateToStudio();
    } else if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'PRODUCT_IMAGE_ADMIN');
      window.location.href = url.toString();
    }
  };

  // Compact Minimized Pill
  if (isMinimized) {
    return (
      <div
        id="bg-autofix-indicator-minimized"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-24 z-[9990] flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 shadow-2xl hover:border-emerald-500/60 transition-all cursor-pointer group"
        onClick={() => setIsMinimized(false)}
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2.5 w-2.5">
          {snapshot.active && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              snapshot.active ? 'bg-emerald-500' : 'bg-blue-400'
            }`}
          />
        </span>
        <Wand2 className={`w-3.5 h-3.5 ${snapshot.active ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
        <span className="text-xs font-semibold text-slate-100">
          {snapshot.active
            ? `Auto-Fixing ${completed}/${total} (${percent}%)`
            : `Auto-Fix Done (${snapshot.fixed} fixed)`}
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
      </div>
    );
  }

  // Expanded Active / Completed Floating Card
  return (
    <div
      id="bg-autofix-indicator-card"
      className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[390px] z-[9990] bg-slate-950/95 backdrop-blur-md text-white rounded-2xl border border-slate-700/80 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-200"
      role="status"
      aria-live="polite"
    >
      {/* Top Gradient Accent Bar */}
      <div
        className={`h-1 w-full ${
          snapshot.active
            ? 'bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500'
            : snapshot.lastCompletedNotice?.type === 'error'
              ? 'bg-rose-500'
              : 'bg-emerald-500'
        }`}
      />

      <div className="p-3.5 sm:p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                snapshot.active
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : snapshot.lastCompletedNotice?.type === 'error'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {snapshot.active ? (
                <Wand2 className="w-4 h-4 animate-pulse text-emerald-400" />
              ) : snapshot.lastCompletedNotice?.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {snapshot.active ? 'Background Auto-Fix' : 'Auto-Fix Complete'}
                </span>
                {snapshot.active && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {snapshot.active
                  ? 'Safe to navigate or do any work — continues running'
                  : 'All queued items processed'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Minimize pill"
              aria-label="Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {!snapshot.active && (
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Dismiss"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Progress View */}
        {snapshot.active && (
          <div className="space-y-2.5">
            {/* Progress Bar & Counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span>
                  Processing <strong className="text-white font-bold">{completed}</strong> of{' '}
                  <strong className="text-white font-bold">{total}</strong> items
                </span>
                <span className="text-emerald-400 font-bold">{percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Currently Processing Item */}
            {snapshot.currentLabel && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                <span className="text-slate-400 shrink-0 font-medium text-[11px]">Item:</span>
                <span className="text-slate-200 font-semibold truncate text-[11px]" title={snapshot.currentLabel}>
                  {snapshot.currentLabel}
                </span>
              </div>
            )}

            {/* Stats row: Fixed, Skipped, Deleted */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
              <span className="text-emerald-400 font-medium">✓ {snapshot.fixed} fixed</span>
              {snapshot.failed > 0 && (
                <span className="text-amber-400 font-medium">· {snapshot.failed} skipped</span>
              )}
              {snapshot.deletedOld > 0 && (
                <span className="inline-flex items-center gap-1 text-slate-300">
                  · <Trash2 className="w-3 h-3 text-rose-400" />
                  {snapshot.deletedOld} old server files deleted
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={handleOpenStudio}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span>Open Whole-Site Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleStop}
                disabled={snapshot.stopping}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer disabled:opacity-60"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>{snapshot.stopping ? 'Stopping...' : 'Stop Auto-Fix'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Finished Notice View */}
        {!snapshot.active && snapshot.lastCompletedNotice && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-200 leading-relaxed">
              {snapshot.lastCompletedNotice.text}
            </p>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={handleOpenStudio}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span>View Results in Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
