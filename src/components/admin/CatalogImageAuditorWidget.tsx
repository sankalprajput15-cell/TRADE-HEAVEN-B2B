import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import {
  runCatalogImageAuditAndCleanup,
  CatalogImageAuditSummary,
  CatalogImageAuditLogItem
} from '../../services/visualProductImageService';
import { productImageManagerService } from '../../services/productImageManagerService';
import { Product } from '../../types';
import { SafeImage } from '../common/SafeImage';

interface CatalogImageAuditorWidgetProps {
  products?: Product[];
  onAuditCompleted?: (summary: CatalogImageAuditSummary) => void;
}

export const CatalogImageAuditorWidget: React.FC<CatalogImageAuditorWidgetProps> = ({
  products = [],
  onAuditCompleted
}) => {
  const [summary, setSummary] = useState<CatalogImageAuditSummary | null>(null);
  const [isScanningPreview, setIsScanningPreview] = useState<boolean>(false);
  const [isRunningFix, setIsRunningFix] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    detail: string;
  } | null>(null);
  const [showLogTable, setShowLogTable] = useState<boolean>(false);

  const buildCompactCatalogPayload = useCallback(() => {
    return products.slice(0, 80).map(p => ({
      id: String(p.id),
      type: 'PRODUCT' as const,
      title: String(p.title || ''),
      category: String(p.category || 'General'),
      image_url: String(p.images?.[0] || '')
    }));
  }, [products]);

  const fetchPreviewStats = useCallback(async () => {
    setIsScanningPreview(true);
    try {
      const res = await runCatalogImageAuditAndCleanup({
        dryRun: true,
        catalogItems: buildCompactCatalogPayload()
      });
      setSummary(prev => {
        // Keep last records_fixed count if we already ran a fix in this session and preview now shows 0 issues
        if (prev && !prev.dry_run && prev.records_fixed > 0 && res.duplicates_detected === 0 && (res.mismatched_detected || 0) === 0) {
          return {
            ...res,
            records_fixed: prev.records_fixed,
            audit_log: prev.audit_log
          };
        }
        return res;
      });
    } catch {
      // Ignore background preview errors
    } finally {
      setIsScanningPreview(false);
    }
  }, [buildCompactCatalogPayload]);

  useEffect(() => {
    void fetchPreviewStats();
  }, [fetchPreviewStats]);

  const handleRunAuditAndClean = async () => {
    if (isRunningFix) return;
    setIsRunningFix(true);
    setAlertMessage(null);

    try {
      const result = await runCatalogImageAuditAndCleanup({
        dryRun: false,
        catalogItems: buildCompactCatalogPayload()
      });

      setSummary(result);
      if (result.audit_log && result.audit_log.length > 0) {
        setShowLogTable(true);
      }

      // Sync updated overrides from server so all frontend product & RFQ cards refresh immediately
      await productImageManagerService.syncFromServer(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }

      const dupCount = Number(result.duplicates_detected || 0);
      const mismatchCount = Number(result.mismatched_detected || 0);
      const fixedCount = Number(result.records_fixed || 0);

      if (fixedCount > 0) {
        setAlertMessage({
          type: 'success',
          title: `Audit Complete: Cleaned ${dupCount} Duplicate(s) & Fixed ${mismatchCount} Mismatched/Placeholder Photo(s)`,
          detail: `Scanned ${result.total_scanned} catalog records (Products & RFQs). Assigned ${fixedCount} unique, verified, category-relevant product photos via Gemini Google Search Grounding.`
        });
      } else {
        setAlertMessage({
          type: 'info',
          title: `Catalog Verified Clean: 0 Duplicates & 0 Mismatched Photos Across ${result.total_scanned} Records`,
          detail: 'Every product and RFQ in the database currently has a unique, verified, high-resolution product photo.'
        });
      }

      if (onAuditCompleted) {
        onAuditCompleted(result);
      }
    } catch (err: any) {
      setAlertMessage({
        type: 'error',
        title: 'Catalog Image Audit Failed',
        detail: err?.message || 'Unable to complete catalog image audit. Please try again.'
      });
    } finally {
      setIsRunningFix(false);
    }
  };

  const totalScanned = summary?.total_scanned ?? 0;
  const duplicatesDetected = summary?.duplicates_detected ?? 0;
  const mismatchedDetected = summary?.mismatched_detected ?? 0;
  const recordsFixed = summary?.records_fixed ?? 0;
  const auditLog: CatalogImageAuditLogItem[] = summary?.audit_log ?? [];

  return (
    <section
      aria-label="Catalog Image Quality & Duplicate Auditor"
      data-testid="catalog-image-auditor-widget"
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Catalog Image Quality &amp; Duplicate Auditor
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              Gemini Search Grounded
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl">
            Scans all database products, supplier listings, and RFQs for duplicate <code className="font-mono text-slate-800">image_url</code> entries, generic placeholders, broken links, or cross-category mismatches—and automatically replaces them with unique, verified product photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isScanningPreview || isRunningFix}
            onClick={() => void fetchPreviewStats()}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Re-scan catalog in preview mode"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningPreview ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isScanningPreview ? 'Scanning...' : 'Re-Scan Stats'}</span>
          </button>

          <button
            type="button"
            disabled={isRunningFix}
            onClick={() => void handleRunAuditAndClean()}
            data-testid="run-image-audit-btn"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isRunningFix ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing &amp; Fixing Catalog Images...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Image Audit &amp; Clean Duplicates</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* REAL-TIME KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Scanned</span>
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-mono">
            {totalScanned.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Products, Listings &amp; RFQs
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Duplicates Detected</span>
            <Copy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 tabular-nums font-mono">
            {duplicatesDetected.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-700">
            Shared image_url records
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Mismatched / Placeholders</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 tabular-nums font-mono">
            {mismatchedDetected.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-700">
            Broken, stock, or off-topic
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Records Fixed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums font-mono">
            {recordsFixed.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700">
            Unique verified photos bound
          </div>
        </div>
      </div>

      {/* RESULT ALERT BANNER */}
      {alertMessage && (
        <div
          role="status"
          data-testid="catalog-audit-alert"
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-50 border-emerald-700'
              : alertMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-950 text-rose-50 border-rose-700'
          }`}
        >
          <CheckCircle2
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              alertMessage.type === 'success'
                ? 'text-emerald-400'
                : alertMessage.type === 'info'
                ? 'text-blue-400'
                : 'text-rose-400'
            }`}
          />
          <div className="space-y-1 flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-black">{alertMessage.title}</div>
            <div className="text-xs text-slate-300 leading-relaxed">{alertMessage.detail}</div>
          </div>
        </div>
      )}

      {/* EXPANDABLE AUDIT LOG TABLE */}
      {auditLog.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLogTable(prev => !prev)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>
                Audit &amp; Visual Search Correction Log ({auditLog.length} Record{auditLog.length === 1 ? '' : 's'})
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>{showLogTable ? 'Hide Details' : 'View Details'}</span>
              {showLogTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {showLogTable && (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {auditLog.slice(0, 50).map((item, idx) => (
                <div
                  key={`${item.record_id}-${idx}`}
                  className="p-3.5 bg-white hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {item.record_type} • {item.record_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.issue_type === 'DUPLICATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.issue_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'FIXED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{item.issue_reason}</div>
                  </div>

                  {item.status === 'FIXED' && item.new_image_url && item.new_image_url !== '(pending audit fix)' && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden md:block max-w-[180px]">
                        <div className="text-[10px] font-bold text-emerald-700">Verified Unique Asset</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{item.new_image_url}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                      <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                        <SafeImage
                          src={item.new_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
