import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  ArrowRight,
  Upload,
  Wand2,
  RotateCcw,
  Link2,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  runCatalogImageAuditAndCleanup,
  fixSingleCatalogImage,
  fetchVisualProductImages,
  CatalogImageAuditSummary,
  CatalogImageAuditLogItem,
  CatalogScannedCleanRecord,
  VisualProductImageCandidate
} from '../../services/visualProductImageService';
import { productImageManagerService } from '../../services/productImageManagerService';
import { Product } from '../../types';
import { SafeImage } from '../common/SafeImage';

interface CatalogImageAuditorWidgetProps {
  products?: Product[];
  onAuditCompleted?: (summary: CatalogImageAuditSummary) => void;
}

type AuditorFilterTab = 'ALL_ISSUES' | 'DUPLICATE' | 'MISMATCHED' | 'FIXED' | 'ALL_SCANNED';

interface UnifiedAuditRow {
  record_id: string;
  record_type: 'PRODUCT' | 'RFQ' | 'OVERRIDE';
  title: string;
  category: string;
  issue_type: 'DUPLICATE' | 'PLACEHOLDER_OR_MISSING' | 'MISMATCHED' | 'BROKEN_ASSET' | 'HEALTHY';
  issue_reason: string;
  old_image_url: string;
  new_image_url: string;
  query_used: string;
  status: 'FIXED' | 'FLAGGED' | 'CLEAN';
  source?: string;
  is_fallback_card?: boolean;
  updatedAt?: string;
}

const ITEMS_PER_PAGE = 25;
const EMPTY_PRODUCTS: Product[] = [];

function withDisplayCacheBust(url: string | undefined, versionTag?: string): string {
  const clean = String(url || '').trim();
  if (!clean || clean === '(empty)' || clean === '(pending audit fix)') return '';
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return clean;
  if (clean.startsWith('/assets/uploads/') && versionTag) {
    const base = clean.split('?')[0];
    return `${base}?v=${encodeURIComponent(versionTag)}`;
  }
  return clean;
}

export const CatalogImageAuditorWidget: React.FC<CatalogImageAuditorWidgetProps> = ({
  products = EMPTY_PRODUCTS,
  onAuditCompleted
}) => {
  const [summary, setSummary] = useState<CatalogImageAuditSummary | null>(null);
  const [auditRows, setAuditRows] = useState<UnifiedAuditRow[]>([]);
  const [cleanRecords, setCleanRecords] = useState<CatalogScannedCleanRecord[]>([]);
  const [cleanLoaded, setCleanLoaded] = useState<boolean>(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);

  const [isScanningPreview, setIsScanningPreview] = useState<boolean>(false);
  const [isRunningFix, setIsRunningFix] = useState<boolean>(false);
  const [fixingRecordIds, setFixingRecordIds] = useState<Record<string, boolean>>({});
  const [uploadingRecordIds, setUploadingRecordIds] = useState<Record<string, boolean>>({});
  const [sessionTouchedIds, setSessionTouchedIds] = useState<Record<string, boolean>>({});

  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    detail: string;
    actionRow?: UnifiedAuditRow;
  } | null>(null);

  const [showWorkbench, setShowWorkbench] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<AuditorFilterTab>('ALL_ISSUES');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  const [candidatesByRecord, setCandidatesByRecord] = useState<Record<string, VisualProductImageCandidate[]>>({});
  const [loadingCandidatesFor, setLoadingCandidatesFor] = useState<string | null>(null);
  const [candidateError, setCandidateError] = useState<string | null>(null);

  const productsRef = useRef<Product[]>(products);
  productsRef.current = products;

  const didInitialScanRef = useRef<boolean>(false);
  const rowFileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetRowRef = useRef<UnifiedAuditRow | null>(null);

  const buildCompactCatalogPayload = useCallback(() => {
    return (productsRef.current || []).map(p => ({
      id: String(p.id),
      type: 'PRODUCT' as const,
      title: String(p.title || ''),
      category: String(p.category || 'General'),
      image_url: String(p.images?.[0] || '')
    }));
  }, []);

  const mapLogToUnifiedRows = useCallback((logs: CatalogImageAuditLogItem[]): UnifiedAuditRow[] => {
    return (logs || []).map(item => ({
      record_id: item.record_id,
      record_type: item.record_type,
      title: item.title,
      category: item.category,
      issue_type: item.issue_type,
      issue_reason: item.issue_reason,
      old_image_url: item.old_image_url,
      new_image_url: item.new_image_url,
      query_used: item.query_used,
      status: item.status
    }));
  }, []);

  const syncMarketplaceImageListeners = useCallback(async () => {
    try {
      await productImageManagerService.syncFromServer(true);
    } catch {
      // ignore sync errors
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
      window.dispatchEvent(new Event('tradeheaven_products_updated'));
    }
  }, []);

  const fetchPreviewStats = useCallback(
    async (opts?: { includeCatalog?: boolean; clearSessionTouched?: boolean }) => {
      const includeCat = Boolean(opts?.includeCatalog);
      if (includeCat) setIsLoadingCatalog(true);
      setIsScanningPreview(true);
      try {
        const res = await runCatalogImageAuditAndCleanup({
          dryRun: true,
          includeCatalog: includeCat,
          catalogItems: buildCompactCatalogPayload()
        });

        const incomingRows = mapLogToUnifiedRows(res.audit_log || []);
        setSummary(prev => {
          if (
            prev &&
            !prev.dry_run &&
            prev.records_fixed > 0 &&
            res.duplicates_detected === 0 &&
            (res.mismatched_detected || 0) === 0
          ) {
            return {
              ...res,
              records_fixed: prev.records_fixed
            };
          }
          return res;
        });

        if (opts?.clearSessionTouched) {
          setSessionTouchedIds({});
        }

        setAuditRows(prevRows => {
          const sessionFixedMap = new Map<string, UnifiedAuditRow>();
          for (const r of prevRows) {
            if (r.status === 'FIXED') {
              sessionFixedMap.set(r.record_id, r);
            }
          }
          const merged: UnifiedAuditRow[] = [];
          const seenIds = new Set<string>();
          for (const row of incomingRows) {
            seenIds.add(row.record_id);
            const fixedPrev = sessionFixedMap.get(row.record_id);
            if (fixedPrev && row.status === 'FLAGGED') {
              merged.push(row);
            } else {
              merged.push(fixedPrev || row);
            }
          }
          for (const [fid, fixedRow] of sessionFixedMap.entries()) {
            if (!seenIds.has(fid)) {
              merged.unshift(fixedRow);
            }
          }
          return merged;
        });

        if (includeCat && Array.isArray(res.catalog_records)) {
          setCleanRecords(res.catalog_records);
          setCleanLoaded(true);
        }

        if (incomingRows.length > 0) {
          setShowWorkbench(true);
          setSelectedRecordId(curr => curr || incomingRows[0].record_id);
        }
      } catch {
        // Ignore background preview errors
      } finally {
        setIsScanningPreview(false);
        setIsLoadingCatalog(false);
      }
    },
    [buildCompactCatalogPayload, mapLogToUnifiedRows]
  );

  useEffect(() => {
    if (didInitialScanRef.current) return;
    didInitialScanRef.current = true;
    void fetchPreviewStats();
  }, [fetchPreviewStats]);

  const combinedSourceRows = useMemo<UnifiedAuditRow[]>(() => {
    if (activeFilter !== 'ALL_SCANNED') {
      return auditRows;
    }
    const mapById = new Map<string, UnifiedAuditRow>();
    for (const row of auditRows) {
      mapById.set(row.record_id, row);
    }
    for (const clean of cleanRecords) {
      if (!mapById.has(clean.record_id)) {
        mapById.set(clean.record_id, {
          record_id: clean.record_id,
          record_type: clean.record_type,
          title: clean.title,
          category: clean.category,
          issue_type: 'HEALTHY',
          issue_reason: 'Verified unique asset in catalog',
          old_image_url: clean.previous_image_url || clean.current_image_url || '(empty)',
          new_image_url: clean.current_image_url || '',
          query_used: clean.title,
          status: clean.status === 'FIXED' ? 'FIXED' : 'CLEAN',
          updatedAt: clean.updated_at
        });
      }
    }
    return Array.from(mapById.values());
  }, [activeFilter, auditRows, cleanRecords]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return combinedSourceRows.filter(row => {
      const keepSessionFixedVisible = Boolean(sessionTouchedIds[row.record_id]);
      if (activeFilter === 'DUPLICATE') {
        if (row.issue_type !== 'DUPLICATE' || (row.status === 'FIXED' && !keepSessionFixedVisible)) {
          return false;
        }
      } else if (activeFilter === 'MISMATCHED') {
        const isMismatchType =
          row.issue_type === 'MISMATCHED' ||
          row.issue_type === 'PLACEHOLDER_OR_MISSING' ||
          row.issue_type === 'BROKEN_ASSET';
        if (!isMismatchType || (row.status === 'FIXED' && !keepSessionFixedVisible)) {
          return false;
        }
      } else if (activeFilter === 'FIXED') {
        if (row.status !== 'FIXED') return false;
      } else if (activeFilter === 'ALL_ISSUES') {
        if (row.status === 'CLEAN') return false;
      }

      if (!q) return true;
      return (
        row.record_id.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.issue_reason.toLowerCase().includes(q) ||
        row.issue_type.toLowerCase().includes(q)
      );
    });
  }, [combinedSourceRows, activeFilter, searchTerm, sessionTouchedIds]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredRows, safePage]);

  const selectedRecord = useMemo(() => {
    if (!selectedRecordId) return paginatedRows[0] || filteredRows[0] || null;
    return (
      combinedSourceRows.find(r => r.record_id === selectedRecordId) ||
      paginatedRows[0] ||
      filteredRows[0] ||
      null
    );
  }, [selectedRecordId, combinedSourceRows, paginatedRows, filteredRows]);

  const handleLoadVisualCandidates = useCallback(
    async (row: UnifiedAuditRow, forceRefresh = false) => {
      const rid = row.record_id;
      setLoadingCandidatesFor(rid);
      setCandidateError(null);
      try {
        const res = await fetchVisualProductImages({
          productName: row.title,
          productId: rid,
          category: row.category,
          count: 12,
          forceRefresh,
          shuffleOnly: !forceRefresh && Boolean(candidatesByRecord[rid]?.length)
        });
        const list =
          Array.isArray(res.images) && res.images.length > 0
            ? res.images
            : Array.isArray(res.pool)
            ? res.pool.slice(0, 12)
            : [];
        if (list.length === 0) {
          setCandidateError(
            res.message || 'No visual alternatives returned; use Upload Photo or paste an image URL below.'
          );
        } else {
          setCandidatesByRecord(prev => ({ ...prev, [rid]: list }));
        }
      } catch (err: any) {
        setCandidateError(err?.message || 'Failed to fetch visual product candidates.');
      } finally {
        setLoadingCandidatesFor(null);
      }
    },
    [candidatesByRecord]
  );

  const handleSelectRow = (row: UnifiedAuditRow) => {
    setSelectedRecordId(row.record_id);
    setCandidateError(null);
    const currentResolved =
      row.new_image_url && row.new_image_url !== '(pending audit fix)' ? row.new_image_url : '';
    setStagedPreviewUrl(currentResolved);
    setCustomUrlInput(currentResolved || (row.old_image_url !== '(empty)' ? row.old_image_url : ''));
  };

  useEffect(() => {
    if (!selectedRecord) return;
    const currentResolved =
      selectedRecord.new_image_url && selectedRecord.new_image_url !== '(pending audit fix)'
        ? selectedRecord.new_image_url
        : '';
    setStagedPreviewUrl(currentResolved);
    setCustomUrlInput(
      currentResolved ||
        (selectedRecord.old_image_url && selectedRecord.old_image_url !== '(empty)'
          ? selectedRecord.old_image_url
          : '')
    );
  }, [selectedRecord?.record_id]);

  const handleFilterCardClick = (tab: AuditorFilterTab) => {
    setActiveFilter(tab);
    setCurrentPage(1);
    setShowWorkbench(true);
    setSessionTouchedIds({});
    if (tab === 'ALL_SCANNED' && !cleanLoaded) {
      void fetchPreviewStats({ includeCatalog: true });
    }
  };

  const applySingleRecordMutationResult = useCallback(
    (
      targetRow: UnifiedAuditRow,
      res: {
        old_image_url: string;
        new_image_url: string;
        source?: string;
        is_fallback_card?: boolean;
        status: 'FIXED' | 'FLAGGED';
        updatedAt?: string;
      }
    ) => {
      const wasFlagged = targetRow.status === 'FLAGGED';
      const nowFixed = res.status === 'FIXED';
      const ts = res.updatedAt || String(Date.now());

      setSessionTouchedIds(prev => ({ ...prev, [targetRow.record_id]: true }));

      setAuditRows(prev => {
        const exists = prev.some(r => r.record_id === targetRow.record_id);
        const updatedEntry: UnifiedAuditRow = {
          ...targetRow,
          old_image_url: res.old_image_url || targetRow.old_image_url,
          new_image_url: nowFixed ? res.new_image_url : '(pending audit fix)',
          status: nowFixed ? 'FIXED' : 'FLAGGED',
          source: res.source,
          is_fallback_card: Boolean(res.is_fallback_card),
          updatedAt: ts
        };
        if (!exists) return [updatedEntry, ...prev];
        return prev.map(r => (r.record_id === targetRow.record_id ? updatedEntry : r));
      });

      setCleanRecords(prev =>
        prev.map(c =>
          c.record_id === targetRow.record_id
            ? {
                ...c,
                previous_image_url: res.old_image_url || c.current_image_url,
                current_image_url: res.new_image_url,
                updated_at: ts,
                status: nowFixed ? 'FIXED' : 'FLAGGED'
              }
            : c
        )
      );

      setSummary(prev => {
        if (!prev) return prev;
        let dups = prev.duplicates_detected || 0;
        let mis = prev.mismatched_detected || 0;
        let fixed = prev.records_fixed || 0;

        if (wasFlagged && nowFixed) {
          if (targetRow.issue_type === 'DUPLICATE') dups = Math.max(0, dups - 1);
          else if (targetRow.issue_type !== 'HEALTHY') mis = Math.max(0, mis - 1);
          fixed += 1;
        } else if (!wasFlagged && !nowFixed) {
          if (targetRow.issue_type === 'DUPLICATE') dups += 1;
          else if (targetRow.issue_type !== 'HEALTHY') mis += 1;
          fixed = Math.max(0, fixed - 1);
        }

        return {
          ...prev,
          duplicates_detected: dups,
          mismatched_detected: mis,
          records_fixed: fixed
        };
      });

      setSelectedRecordId(targetRow.record_id);
      if (nowFixed) {
        setStagedPreviewUrl(res.new_image_url);
        setCustomUrlInput(res.new_image_url);
      } else {
        setStagedPreviewUrl('');
        setCustomUrlInput(res.old_image_url !== '(empty)' ? res.old_image_url : '');
      }
    },
    []
  );

  const handleFixSingleRecord = async (
    row: UnifiedAuditRow,
    options?: { customImageUrl?: string; revert?: boolean }
  ) => {
    const rid = row.record_id;
    if (fixingRecordIds[rid] || uploadingRecordIds[rid]) return;
    setFixingRecordIds(prev => ({ ...prev, [rid]: true }));
    setSelectedRecordId(rid);
    setAlertMessage(null);

    try {
      const result = await fixSingleCatalogImage({
        recordId: rid,
        recordType: row.record_type,
        title: row.title,
        category: row.category,
        customImageUrl: options?.customImageUrl,
        previousImageUrl: row.old_image_url && row.old_image_url !== '(empty)' ? row.old_image_url : undefined,
        revert: options?.revert
      });

      applySingleRecordMutationResult(row, result);
      await syncMarketplaceImageListeners();

      if (!options?.customImageUrl && !options?.revert && !candidatesByRecord[rid]?.length) {
        void handleLoadVisualCandidates(row);
      }

      if (options?.revert) {
        setAlertMessage({
          type: 'info',
          title: `Reverted Image for "${row.title}" (${rid})`,
          detail: `Restored original URL (${result.new_image_url}).`,
          actionRow: { ...row, status: 'FLAGGED' }
        });
      } else if (result.is_fallback_card) {
        setAlertMessage({
          type: 'info',
          title: `Fallback Spec Card Generated for "${row.title}" (${rid})`,
          detail:
            'No exact external product photo matched within the time limit. Use "Upload Photo Manually" if you want to upload the exact product photo yourself.',
          actionRow: { ...row, new_image_url: result.new_image_url, status: 'FIXED', is_fallback_card: true }
        });
      } else {
        setAlertMessage({
          type: 'success',
          title: `Fixed Image for "${row.title}" (${rid})`,
          detail: `Updated directly to verified unique asset: ${result.new_image_url}`,
          actionRow: { ...row, new_image_url: result.new_image_url, status: 'FIXED' }
        });
      }
    } catch (err: any) {
      setAlertMessage({
        type: 'error',
        title: `Auto-Fetch Could Not Fix "${row.title}"`,
        detail: `${err?.message || 'Unable to fetch right image automatically.'} Click "Upload Photo Manually" to assign a photo directly from your device.`,
        actionRow: row
      });
    } finally {
      setFixingRecordIds(prev => ({ ...prev, [rid]: false }));
    }
  };

  const triggerDirectRowUpload = (row: UnifiedAuditRow) => {
    uploadTargetRowRef.current = row;
    setSelectedRecordId(row.record_id);
    if (rowFileInputRef.current) {
      rowFileInputRef.current.value = '';
      rowFileInputRef.current.click();
    }
  };

  const handleUploadReplacementFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetRow = uploadTargetRowRef.current || selectedRecord;
    if (!file || !targetRow) return;

    const rid = targetRow.record_id;
    const preservedOldUrl =
      targetRow.old_image_url && targetRow.old_image_url !== '(empty)'
        ? targetRow.old_image_url
        : undefined;

    setUploadingRecordIds(prev => ({ ...prev, [rid]: true }));
    setSelectedRecordId(rid);
    setAlertMessage(null);

    try {
      const uploaded = await productImageManagerService.uploadAndAssignImageFile(file, {
        productId: rid,
        category: targetRow.category,
        targetFormat: 'webp',
        autoWebpLossless: true,
        oldUrlToReplace: undefined
      });

      const cleanUploadedUrl = uploaded.url.startsWith('data:')
        ? uploaded.url
        : uploaded.url.split('?')[0];

      const result = await fixSingleCatalogImage({
        recordId: rid,
        recordType: targetRow.record_type,
        title: targetRow.title,
        category: targetRow.category,
        customImageUrl: cleanUploadedUrl,
        previousImageUrl: preservedOldUrl
      });

      applySingleRecordMutationResult(targetRow, {
        ...result,
        old_image_url: preservedOldUrl || result.old_image_url,
        is_fallback_card: false
      });
      await syncMarketplaceImageListeners();

      setAlertMessage({
        type: 'success',
        title: `Manual Photo Uploaded for "${targetRow.title}" (${rid})`,
        detail: `Saved custom WebP image (${cleanUploadedUrl}) and updated the catalog immediately.`
      });
    } catch (err: any) {
      setAlertMessage({
        type: 'error',
        title: `Manual Upload Failed for "${targetRow.title}"`,
        detail: err?.message || 'Unable to upload replacement image file.',
        actionRow: targetRow
      });
    } finally {
      setUploadingRecordIds(prev => ({ ...prev, [rid]: false }));
      if (rowFileInputRef.current) rowFileInputRef.current.value = '';
    }
  };

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
      const nextRows = mapLogToUnifiedRows(result.audit_log || []);
      setAuditRows(nextRows);
      setSessionTouchedIds({});
      setShowWorkbench(true);
      if (nextRows.length > 0) {
        setSelectedRecordId(nextRows[0].record_id);
        setActiveFilter('FIXED');
        setCurrentPage(1);
      }

      await syncMarketplaceImageListeners();

      const dupCount = Number(result.duplicates_detected || 0);
      const mismatchCount = Number(result.mismatched_detected || 0);
      const fixedCount = Number(result.records_fixed || 0);

      if (fixedCount > 0) {
        setAlertMessage({
          type: 'success',
          title: `Audit Complete: Cleaned ${dupCount} Duplicate(s) & Fixed ${mismatchCount} Mismatched/Placeholder Photo(s)`,
          detail: `Scanned ${result.total_scanned} catalog records. Assigned ${fixedCount} unique photos—click any record below to view Before vs. After or manually upload a replacement.`
        });
      } else {
        setAlertMessage({
          type: 'info',
          title: `Catalog Verified Clean: 0 Duplicates & 0 Mismatched Photos Across ${result.total_scanned} Records`,
          detail: 'Every product and RFQ currently has a unique, verified product photo. Click Total Scanned to inspect or upload custom images for any item.'
        });
      }

      if (onAuditCompleted) {
        onAuditCompleted(result);
      }
    } catch (err: any) {
      setAlertMessage({
        type: 'error',
        title: 'Catalog Image Audit Failed',
        detail: err?.message || 'Unable to complete catalog image audit. You can still fix or upload individual rows manually below.'
      });
    } finally {
      setIsRunningFix(false);
    }
  };

  const totalScanned = summary?.total_scanned ?? 0;
  const duplicatesDetected = summary?.duplicates_detected ?? 0;
  const mismatchedDetected = summary?.mismatched_detected ?? 0;
  const recordsFixed = summary?.records_fixed ?? 0;

  const duplicateRowCount = useMemo(
    () => auditRows.filter(r => r.issue_type === 'DUPLICATE' && r.status === 'FLAGGED').length,
    [auditRows]
  );
  const mismatchedRowCount = useMemo(
    () =>
      auditRows.filter(
        r =>
          r.status === 'FLAGGED' &&
          (r.issue_type === 'MISMATCHED' ||
            r.issue_type === 'PLACEHOLDER_OR_MISSING' ||
            r.issue_type === 'BROKEN_ASSET')
      ).length,
    [auditRows]
  );
  const fixedRowCount = useMemo(
    () => auditRows.filter(r => r.status === 'FIXED').length,
    [auditRows]
  );

  const selectedCandidates = selectedRecord ? candidatesByRecord[selectedRecord.record_id] || [] : [];
  const selectedIsFixing = selectedRecord ? Boolean(fixingRecordIds[selectedRecord.record_id]) : false;
  const selectedIsUploading = selectedRecord ? Boolean(uploadingRecordIds[selectedRecord.record_id]) : false;

  const effectivePreviewAfterUrl = useMemo(() => {
    if (!selectedRecord) return '';
    if (stagedPreviewUrl && stagedPreviewUrl !== '(pending audit fix)') {
      return stagedPreviewUrl;
    }
    if (selectedRecord.new_image_url && selectedRecord.new_image_url !== '(pending audit fix)') {
      return selectedRecord.new_image_url;
    }
    return '';
  }, [selectedRecord, stagedPreviewUrl]);

  const hasUnsavedStagedChange = useMemo(() => {
    if (!selectedRecord || !stagedPreviewUrl) return false;
    const saved =
      selectedRecord.new_image_url && selectedRecord.new_image_url !== '(pending audit fix)'
        ? selectedRecord.new_image_url
        : selectedRecord.old_image_url;
    return stagedPreviewUrl !== saved;
  }, [selectedRecord, stagedPreviewUrl]);

  return (
    <section
      aria-label="Catalog Image Quality & Duplicate Auditor"
      data-testid="catalog-image-auditor-widget"
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Hidden shared file input for direct manual row or studio uploads */}
      <input
        ref={rowFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => void handleUploadReplacementFile(e)}
      />

      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Catalog Image Quality &amp; Duplicate Auditor
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              Direct Fix, Upload &amp; Live Diff
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl">
            Click <strong>Fix Now</strong> to auto-fetch a unique photo, click <strong>Upload</strong> on any row to manually upload your own image, or click any row to inspect Before vs. After changes live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isScanningPreview || isRunningFix}
            onClick={() =>
              void fetchPreviewStats({
                includeCatalog: activeFilter === 'ALL_SCANNED' || cleanLoaded,
                clearSessionTouched: true
              })
            }
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
                <span>Auditing &amp; Fixing All Issues...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Auto-Fix All Flagged Images</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CLICKABLE KPI FILTER CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => handleFilterCardClick('ALL_SCANNED')}
          aria-pressed={activeFilter === 'ALL_SCANNED'}
          data-testid="kpi-filter-all-scanned"
          className={`p-4 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
            activeFilter === 'ALL_SCANNED'
              ? 'bg-slate-100 border-slate-900 ring-2 ring-slate-900/15'
              : 'bg-slate-50 border-slate-200/80 hover:border-slate-400 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Total Scanned</span>
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-mono">
            {totalScanned.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-blue-700 flex items-center justify-between">
            <span>Products, Listings &amp; RFQs</span>
            <span>Browse →</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFilterCardClick('DUPLICATE')}
          aria-pressed={activeFilter === 'DUPLICATE'}
          data-testid="kpi-filter-duplicates"
          className={`p-4 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
            activeFilter === 'DUPLICATE'
              ? 'bg-amber-100/80 border-amber-600 ring-2 ring-amber-500/25'
              : 'bg-amber-50/60 border-amber-200/80 hover:border-amber-400 hover:bg-amber-100/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Duplicates Detected</span>
            <Copy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 tabular-nums font-mono">
            {duplicatesDetected.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-amber-800 flex items-center justify-between">
            <span>Shared image_url records</span>
            <span>Inspect &amp; Fix →</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFilterCardClick('MISMATCHED')}
          aria-pressed={activeFilter === 'MISMATCHED'}
          data-testid="kpi-filter-mismatched"
          className={`p-4 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
            activeFilter === 'MISMATCHED'
              ? 'bg-rose-100/80 border-rose-600 ring-2 ring-rose-500/25'
              : 'bg-rose-50/60 border-rose-200/80 hover:border-rose-400 hover:bg-rose-100/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Mismatched / Placeholders</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 tabular-nums font-mono">
            {mismatchedDetected.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-rose-800 flex items-center justify-between">
            <span>Broken, stock, or off-topic</span>
            <span>Inspect &amp; Fix →</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFilterCardClick('FIXED')}
          aria-pressed={activeFilter === 'FIXED'}
          data-testid="kpi-filter-fixed"
          className={`p-4 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
            activeFilter === 'FIXED'
              ? 'bg-emerald-100/80 border-emerald-600 ring-2 ring-emerald-500/25'
              : 'bg-emerald-50/70 border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-100/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Records Fixed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums font-mono">
            {recordsFixed.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
            <span>Unique verified photos bound</span>
            <span>View Changes →</span>
          </div>
        </button>
      </div>

      {/* RESULT ALERT BANNER */}
      {alertMessage && (
        <div
          role="status"
          data-testid="catalog-audit-alert"
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-50 border-emerald-700'
              : alertMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-950 text-rose-50 border-rose-700'
          }`}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                alertMessage.type === 'success'
                  ? 'text-emerald-400'
                  : alertMessage.type === 'info'
                  ? 'text-blue-400'
                  : 'text-rose-400'
              }`}
            />
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-black">{alertMessage.title}</div>
              <div className="text-xs text-slate-300 leading-relaxed">{alertMessage.detail}</div>
            </div>
          </div>

          {alertMessage.actionRow && (
            <button
              type="button"
              onClick={() => triggerDirectRowUpload(alertMessage.actionRow!)}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Photo Manually</span>
            </button>
          )}
        </div>
      )}

      {/* DIRECT INSPECTION & INLINE CORRECTION WORKBENCH */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        {/* Workbench Toggle & Filter Bar */}
        <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFilterCardClick('ALL_ISSUES')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'ALL_ISSUES'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Flagged ({duplicateRowCount + mismatchedRowCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterCardClick('DUPLICATE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'DUPLICATE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
              }`}
            >
              Duplicates ({duplicateRowCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterCardClick('MISMATCHED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'MISMATCHED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50'
              }`}
            >
              Mismatched / Broken ({mismatchedRowCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterCardClick('FIXED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'FIXED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
              }`}
            >
              Fixed Changes ({fixedRowCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterCardClick('ALL_SCANNED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'ALL_SCANNED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50'
              }`}
            >
              Full Catalog ({totalScanned})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ID, title, or issue..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowWorkbench(prev => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{showWorkbench ? 'Hide Panel' : 'Open Panel'}</span>
              {showWorkbench ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showWorkbench && (
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
            {/* LEFT PANE: CLICKABLE RECORDS QUEUE */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>
                  {isLoadingCatalog
                    ? 'Loading full catalog...'
                    : `Showing ${paginatedRows.length > 0 ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0}–${Math.min(
                        safePage * ITEMS_PER_PAGE,
                        filteredRows.length
                      )} of ${filteredRows.length} record${filteredRows.length === 1 ? '' : 's'} — Click any row to preview, Fix Now, or Upload`}
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 font-mono">
                      {safePage}/{totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-100">
                {paginatedRows.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">
                      {activeFilter === 'FIXED'
                        ? 'No records fixed yet in this view'
                        : 'No matching catalog records in this filter'}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Select another KPI card above or click Full Catalog to inspect and upload custom images directly.
                    </p>
                  </div>
                ) : (
                  paginatedRows.map(row => {
                    const isSelected = selectedRecord?.record_id === row.record_id;
                    const isRowFixing = Boolean(fixingRecordIds[row.record_id]);
                    const isRowUploading = Boolean(uploadingRecordIds[row.record_id]);
                    const hasNewImg = Boolean(row.new_image_url && row.new_image_url !== '(pending audit fix)');
                    const displayNewUrl = withDisplayCacheBust(row.new_image_url, row.updatedAt);
                    const displayThumbUrl = hasNewImg
                      ? displayNewUrl
                      : row.old_image_url !== '(empty)'
                      ? row.old_image_url
                      : '';

                    return (
                      <div
                        key={row.record_id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectRow(row)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectRow(row);
                          }
                        }}
                        data-testid={`audit-row-${row.record_id}`}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-l-4 border-l-blue-600'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {row.status === 'FIXED' && hasNewImg ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 opacity-70">
                                {row.old_image_url && row.old_image_url !== '(empty)' ? (
                                  <SafeImage src={row.old_image_url} alt="Before" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                    None
                                  </div>
                                )}
                              </div>
                              <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                              <div className="w-10 h-10 rounded-lg border-2 border-emerald-500 overflow-hidden bg-slate-100">
                                <SafeImage src={displayNewUrl} alt={row.title} className="w-full h-full object-cover" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                              {displayThumbUrl ? (
                                <SafeImage src={displayThumbUrl} alt={row.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                  Empty
                                </div>
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                {row.record_type} • {row.record_id}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.issue_type === 'DUPLICATE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : row.issue_type === 'HEALTHY'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {row.issue_type}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.status === 'FIXED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : row.status === 'CLEAN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {row.status}
                              </span>
                              {row.is_fallback_card && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  Fallback Card
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-slate-900 truncate">{row.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">{row.issue_reason}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={isRowFixing || isRowUploading}
                            onClick={e => {
                              e.stopPropagation();
                              void handleFixSingleRecord(row);
                            }}
                            data-testid={`fix-row-btn-${row.record_id}`}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ${
                              row.status === 'FLAGGED'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                            title={
                              row.status === 'FLAGGED'
                                ? 'Auto-assign unique verified photo and view change'
                                : 'Re-fetch a different verified product photo'
                            }
                          >
                            {isRowFixing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Wand2 className="w-3 h-3" />
                            )}
                            <span>{isRowFixing ? 'Fixing...' : row.status === 'FLAGGED' ? 'Fix Now' : 'Re-Fetch'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isRowUploading || isRowFixing}
                            onClick={e => {
                              e.stopPropagation();
                              triggerDirectRowUpload(row);
                            }}
                            data-testid={`upload-row-btn-${row.record_id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            title="Manually upload your own product photo for this item"
                          >
                            {isRowUploading ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                            ) : (
                              <Upload className="w-3 h-3 text-blue-600" />
                            )}
                            <span>{isRowUploading ? 'Uploading...' : 'Upload'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSelectRow(row);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isSelected ? 'Viewing' : 'Inspect'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANE: LIVE BEFORE / AFTER VIEWER & DIRECT CORRECTION STUDIO */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/70 space-y-4">
              {selectedRecord ? (
                <>
                  {/* Selected Header */}
                  <div className="space-y-1 pb-3 border-b border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                        {selectedRecord.record_type} • {selectedRecord.record_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          selectedRecord.status === 'FIXED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : selectedRecord.status === 'CLEAN'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {hasUnsavedStagedChange
                          ? 'Previewing Change'
                          : selectedRecord.status === 'FIXED'
                          ? 'Applied & Saved'
                          : selectedRecord.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 leading-snug">{selectedRecord.title}</h4>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">{selectedRecord.category}</span> — {selectedRecord.issue_reason}
                    </div>
                  </div>

                  {/* LIVE BEFORE VS AFTER COMPARISON BOX */}
                  <div className="grid grid-cols-2 gap-3" data-testid="live-diff-comparison">
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Before (Original)
                      </div>
                      <div className="aspect-[4/3] rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                        {selectedRecord.old_image_url && selectedRecord.old_image_url !== '(empty)' ? (
                          <SafeImage
                            src={selectedRecord.old_image_url}
                            alt={`Original ${selectedRecord.title}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">No Image / Empty</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate" title={selectedRecord.old_image_url}>
                        {selectedRecord.old_image_url || '(empty)'}
                      </div>
                    </div>

                    <div
                      className={`rounded-xl p-2.5 space-y-1.5 border ${
                        effectivePreviewAfterUrl
                          ? hasUnsavedStagedChange
                            ? 'bg-blue-50/70 border-blue-400'
                            : 'bg-emerald-50/70 border-emerald-400'
                          : 'bg-white border-dashed border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                        <span className={effectivePreviewAfterUrl ? 'text-emerald-800' : 'text-slate-500'}>
                          {hasUnsavedStagedChange ? 'After (Live Preview)' : 'After (Updated)'}
                        </span>
                        {effectivePreviewAfterUrl && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="aspect-[4/3] rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                        {effectivePreviewAfterUrl ? (
                          <SafeImage
                            src={withDisplayCacheBust(effectivePreviewAfterUrl, selectedRecord.updatedAt)}
                            alt={`New ${selectedRecord.title}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 text-center px-2">
                            Click Auto-Fix, Upload Photo, or pick an option below
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[10px] font-mono text-slate-600 truncate"
                        title={effectivePreviewAfterUrl || '(pending)'}
                      >
                        {effectivePreviewAfterUrl || '(pending selection)'}
                      </div>
                    </div>
                  </div>

                  {/* PRIMARY DIRECT ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedIsFixing || selectedIsUploading}
                      onClick={() => void handleFixSingleRecord(selectedRecord)}
                      data-testid="studio-autofix-btn"
                      className="flex-1 min-w-[150px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {selectedIsFixing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Fixing Record...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Auto-Fix Unique Photo</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={selectedIsUploading || selectedIsFixing}
                      onClick={() => triggerDirectRowUpload(selectedRecord)}
                      data-testid="studio-upload-btn"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {selectedIsUploading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{selectedIsUploading ? 'Uploading...' : 'Manual Upload'}</span>
                    </button>

                    {selectedRecord.status === 'FIXED' &&
                      selectedRecord.old_image_url &&
                      selectedRecord.old_image_url !== '(empty)' && (
                        <button
                          type="button"
                          disabled={selectedIsFixing || selectedIsUploading}
                          onClick={() =>
                            void handleFixSingleRecord(selectedRecord, {
                              customImageUrl: selectedRecord.old_image_url,
                              revert: true
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Restore previous image URL"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revert</span>
                        </button>
                      )}
                  </div>

                  {/* SAVE STAGED SELECTION BANNER */}
                  {hasUnsavedStagedChange && stagedPreviewUrl && (
                    <div className="p-2.5 rounded-xl bg-blue-950 text-white flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold">
                        Preview loaded — apply this photo to {selectedRecord.record_id}?
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setStagedPreviewUrl(
                              selectedRecord.new_image_url && selectedRecord.new_image_url !== '(pending audit fix)'
                                ? selectedRecord.new_image_url
                                : ''
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={selectedIsFixing}
                          onClick={() =>
                            void handleFixSingleRecord(selectedRecord, {
                              customImageUrl: stagedPreviewUrl
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black cursor-pointer disabled:opacity-50"
                        >
                          {selectedIsFixing ? 'Saving...' : 'Apply Change'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VISUAL ALTERNATIVES PICKER (CLICK TO PREVIEW LIVE) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-800">
                        Verified Product Alternatives
                      </span>
                      <button
                        type="button"
                        disabled={loadingCandidatesFor === selectedRecord.record_id}
                        onClick={() => void handleLoadVisualCandidates(selectedRecord, selectedCandidates.length > 0)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${loadingCandidatesFor === selectedRecord.record_id ? 'animate-spin text-blue-600' : ''}`}
                        />
                        <span>
                          {loadingCandidatesFor === selectedRecord.record_id
                            ? 'Searching...'
                            : selectedCandidates.length > 0
                            ? 'Shuffle New Options'
                            : 'Find Photos'}
                        </span>
                      </button>
                    </div>

                    {candidateError && (
                      <div className="text-[11px] text-amber-700 font-medium">{candidateError}</div>
                    )}

                    {selectedCandidates.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedCandidates.slice(0, 8).map((cand, i) => {
                          const isChosen = stagedPreviewUrl === cand.url;
                          return (
                            <button
                              key={`${cand.url}-${i}`}
                              type="button"
                              onClick={() => {
                                setStagedPreviewUrl(cand.url);
                                setCustomUrlInput(cand.url);
                              }}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 ${
                                isChosen
                                  ? 'border-blue-600 ring-2 ring-blue-500/30'
                                  : 'border-slate-200 hover:border-blue-400'
                              }`}
                              title="Click to preview in Before/After viewer"
                            >
                              <SafeImage
                                src={cand.thumbnailUrl || cand.url}
                                alt={cand.title || selectedRecord.title}
                                className="w-full h-full object-cover"
                              />
                              {isChosen && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Click <strong>Find Photos</strong> to browse verified alternatives, or click <strong>Manual Upload</strong> above to upload from your device.
                      </p>
                    )}
                  </div>

                  {/* CUSTOM IMAGE URL DIRECT APPLY */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <label
                      htmlFor="direct-custom-image-url"
                      className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <Link2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Direct Image URL (Updates Live Preview)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="direct-custom-image-url"
                        type="text"
                        value={customUrlInput}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomUrlInput(val);
                          if (val.trim()) {
                            setStagedPreviewUrl(val.trim());
                          }
                        }}
                        placeholder="https://... or /assets/uploads/..."
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                      />
                      <button
                        type="button"
                        disabled={selectedIsFixing || !customUrlInput.trim()}
                        onClick={() =>
                          void handleFixSingleRecord(selectedRecord, {
                            customImageUrl: customUrlInput.trim()
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer disabled:opacity-40 shrink-0"
                      >
                        Save URL
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center space-y-2 p-6">
                  <Eye className="w-8 h-8 text-slate-300" />
                  <div className="text-xs font-bold text-slate-700">Select Any Item on the Left</div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Click any flagged or catalog item to inspect its original image, auto-fix it, or manually upload your own replacement photo.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
