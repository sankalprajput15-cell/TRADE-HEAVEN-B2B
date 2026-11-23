import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Wand2,
  Upload,
  Crop,
  RotateCcw,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Check,
  Image as ImageIcon,
  ExternalLink,
  Link2,
  MapPin,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Product } from '../../types';
import {
  fetchVisualProductImages,
  cleanProductSearchSubject,
  VisualProductImageCandidate
} from '../../services/visualProductImageService';
import { productImageManagerService } from '../../services/productImageManagerService';
import { SafeImage } from '../common/SafeImage';
import { ImageEditingOverlay } from './ImageEditingOverlay';

interface AdminQuickImageInspectorModalProps {
  product: Product;
  currentImageUrl: string;
  targetType?: 'PRODUCT' | 'CATEGORY' | 'RFQ' | 'HERO_SLIDE' | 'SITE_ASSET';
  fieldPath?: string;
  siteLocationLabel?: string;
  liveHref?: string;
  onCheckLiveOnSite?: () => void;
  onImageDeleted?: (productId: string, deletedFile: boolean) => void;
  onClose: () => void;
  onImageUpdated: (
    productId: string,
    newUrl: string,
    activityMs: number,
    meta?: {
      deletedOldUrls?: string[];
      replacedOldUrls?: string[];
      updatedAt?: string;
      action?: 'UPLOAD' | 'AUTO_FIX' | 'URL';
    }
  ) => void;
}

export const AdminQuickImageInspectorModal: React.FC<AdminQuickImageInspectorModalProps> = ({
  product,
  currentImageUrl,
  targetType = 'PRODUCT',
  fieldPath,
  siteLocationLabel,
  liveHref,
  onCheckLiveOnSite,
  onImageDeleted,
  onClose,
  onImageUpdated
}) => {
  const [originalUrl] = useState<string>(currentImageUrl);
  const [liveUrl, setLiveUrl] = useState<string>(currentImageUrl);
  const [liveVersion, setLiveVersion] = useState<number>(() => Date.now());
  const [previousUrl, setPreviousUrl] = useState<string>(currentImageUrl);
  const [oldFileDeletedPermanently, setOldFileDeletedPermanently] = useState<boolean>(false);
  const [manualUrlInput, setManualUrlInput] = useState<string>('');
  const [showUrlBar, setShowUrlBar] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'CANDIDATES' | 'MEDIA_LIBRARY'>('CANDIDATES');
  const [libraryFilter, setLibraryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(
    cleanProductSearchSubject(product.title || '') || product.title || ''
  );
  const [candidates, setCandidates] = useState<VisualProductImageCandidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaLibraryItems = productImageManagerService.getState().mediaLibrary || [];
  const filteredLibraryItems = libraryFilter.trim()
    ? mediaLibraryItems.filter(m =>
        `${m.name || ''} ${m.url || ''}`.toLowerCase().includes(libraryFilter.trim().toLowerCase())
      )
    : mediaLibraryItems;

  const syncAfterUpdate = useCallback(
    async (
      newUrl: string,
      prevUrl: string,
      updatedAt?: string,
      imageUpdatedAt?: number,
      replacedOldUrls?: string[],
      deletedOldUrls?: string[],
      action?: 'UPLOAD' | 'AUTO_FIX' | 'URL'
    ) => {
      const activityMs = imageUpdatedAt || Date.now();
      if (Array.isArray(deletedOldUrls) && deletedOldUrls.length > 0) {
        setOldFileDeletedPermanently(true);
      }
      setPreviousUrl(prevUrl);
      setLiveUrl(newUrl);
      setLiveVersion(Date.now());
      productImageManagerService.recordProductActivityTimestamp(product.id, activityMs, false);
      productImageManagerService.applyServerOverrideSnapshot([
        {
          id: product.id,
          url: newUrl,
          updatedAt: updatedAt || new Date(activityMs).toISOString(),
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          replacedOldUrls,
          deletedOldUrls
        }
      ]);
      try {
        await productImageManagerService.syncFromServer(true, false, { bypassCooldown: true });
      } catch {
        // ignore sync errors
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      onImageUpdated(product.id, newUrl, activityMs, {
        deletedOldUrls,
        replacedOldUrls,
        updatedAt,
        action
      });
    },
    [product.id, onImageUpdated]
  );

  const loadCandidates = useCallback(
    async (queryText: string, forceRefresh = false) => {
      const q = String(queryText || product.title || '').trim();
      if (!q) return;
      setIsLoadingCandidates(true);
      try {
        const res = await fetchVisualProductImages({
          productName: q,
          productId: product.id,
          category: product.category,
          count: 15,
          forceRefresh
        });
        const list = Array.isArray(res?.pool) && res.pool.length > 0 ? res.pool : res?.images || [];
        setCandidates(list);
      } catch {
        setCandidates([]);
      } finally {
        setIsLoadingCandidates(false);
      }
    },
    [product.id, product.title, product.category]
  );

  useEffect(() => {
    void loadCandidates(product.title, false);
  }, [loadCandidates, product.title]);

  const replaceViaWholeSiteEndpoint = async (source: { file?: File; imageUrl?: string }) => {
    let base64Data: string | undefined;
    let fileName: string | undefined;
    let mimeType: string | undefined;
    if (source.file) {
      const converted = await productImageManagerService.convertImageFile(
        source.file,
        'webp',
        0.92,
        1400,
        true
      );
      base64Data = converted.dataUrl;
      fileName = converted.fileName;
      mimeType = converted.mimeType;
    }

    const res = await fetch('/api/v1/admin/site-images/replace', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        targetId: product.id,
        targetType,
        fieldPath,
        title: product.title,
        category: product.category,
        fileName,
        mimeType,
        base64Data,
        imageUrl: source.imageUrl,
        oldImageUrl: liveUrl
      })
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success || !json?.newUrl) {
      throw new Error(json?.message || `Server returned HTTP ${res.status}`);
    }
    return json;
  };

  const handleAutoFix = async () => {
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/v1/admin/site-images/auto-fix', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: product.id,
              type: targetType,
              title: product.title,
              category: product.category,
              currentUrl: liveUrl,
              fieldPath
            }
          ]
        })
      });
      const json = await res.json().catch(() => null);
      const rowRes = Array.isArray(json?.results) ? json.results[0] : null;
      if (!res.ok || !rowRes?.success || !rowRes?.newUrl) {
        throw new Error(rowRes?.error || json?.message || 'Could not auto-fetch a replacement photo.');
      }
      const deletedOldUrls: string[] = Array.isArray(rowRes.deletedOldUrls) ? rowRes.deletedOldUrls : [];
      await syncAfterUpdate(
        rowRes.newUrl,
        liveUrl,
        rowRes.updatedAt,
        rowRes.imageUpdatedAt,
        liveUrl ? [liveUrl] : undefined,
        deletedOldUrls,
        'AUTO_FIX'
      );
      setStatusMessage({
        type: 'success',
        text: `Auto-fixed (${rowRes.newUrl})${
          deletedOldUrls.length > 0 ? ` — ${deletedOldUrls.length} old file permanently deleted from server.` : '.'
        }`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not auto-fetch a replacement photo. Try picking a candidate or uploading manually.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handlePickCandidate = async (candidateUrl: string) => {
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const json = await replaceViaWholeSiteEndpoint({ imageUrl: candidateUrl });
      const deletedOldUrls: string[] = Array.isArray(json.deletedOldUrls) ? json.deletedOldUrls : [];
      await syncAfterUpdate(
        json.newUrl,
        liveUrl,
        json.updatedAt,
        json.imageUpdatedAt,
        json.replacedOldUrls,
        deletedOldUrls,
        'URL'
      );
      setStatusMessage({
        type: 'success',
        text: `Saved photo (${json.newUrl})${
          deletedOldUrls.length > 0 ? ` — ${deletedOldUrls.length} old file permanently deleted from server.` : ' and updated live.'
        }`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to apply selected candidate image.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const json = await replaceViaWholeSiteEndpoint({ file });
      const deletedOldUrls: string[] = Array.isArray(json.deletedOldUrls) ? json.deletedOldUrls : [];
      await syncAfterUpdate(
        json.newUrl,
        liveUrl,
        json.updatedAt,
        json.imageUpdatedAt,
        json.replacedOldUrls,
        deletedOldUrls,
        'UPLOAD'
      );
      setStatusMessage({
        type: 'success',
        text: `Uploaded & saved (${json.newUrl})${
          deletedOldUrls.length > 0 ? ` — ${deletedOldUrls.length} old image permanently deleted from server.` : ' and updated live.'
        }`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Manual upload failed.'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyManualUrl = async () => {
    const clean = manualUrlInput.trim();
    if (!clean) return;
    setShowUrlBar(false);
    await handlePickCandidate(clean);
  };

  const handleSaveCropped = async (editedDataUrl: string) => {
    setIsCropping(false);
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const croppedFile = productImageManagerService.dataUrlToFile(
        editedDataUrl,
        `${product.id}-cropped-${Date.now()}.png`
      );
      await handleFileUpload(croppedFile);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save cropped image.'
      });
      setIsUploading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setConfirmDelete(false);
    setIsApplying(true);
    setStatusMessage(null);
    try {
      let deletedFile = false;
      if (liveUrl && liveUrl.startsWith('/assets/uploads/')) {
        const res = await fetch('/api/v1/admin/site-images/delete-file', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            url: liveUrl,
            force: true,
            targetId: product.id,
            targetType,
            fieldPath
          })
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          deletedFile = true;
        }
      }
      await productImageManagerService.resetProductImage(product.id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      setOldFileDeletedPermanently(deletedFile);
      setLiveUrl('');
      setLiveVersion(Date.now());
      if (onImageDeleted) onImageDeleted(product.id, deletedFile);
      setStatusMessage({
        type: 'success',
        text: deletedFile
          ? 'Image permanently deleted from server storage and override cleared.'
          : 'Image override cleared.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to delete image.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRevert = async () => {
    if (!previousUrl || previousUrl === liveUrl) return;
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const json = await replaceViaWholeSiteEndpoint({ imageUrl: previousUrl });
      const deletedOldUrls: string[] = Array.isArray(json.deletedOldUrls) ? json.deletedOldUrls : [];
      await syncAfterUpdate(
        json.newUrl,
        originalUrl,
        json.updatedAt,
        json.imageUpdatedAt,
        json.replacedOldUrls,
        deletedOldUrls,
        'URL'
      );
      setStatusMessage({
        type: 'success',
        text: 'Reverted to previous image.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to revert image.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Inspect and edit image for ${product.title}`}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) void handleFileUpload(f);
          }}
        />

        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Admin Image Inspector</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-300 truncate">{product.id}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white mt-0.5 line-clamp-1">
              {product.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
              <span>{product.category}</span>
              {siteLocationLabel && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{siteLocationLabel}</span>
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer shrink-0"
            aria-label="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {statusMessage && (
            <div
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="break-all">{statusMessage.text}</span>
            </div>
          )}

          {/* Before vs Live Preview + Direct Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {oldFileDeletedPermanently ? 'Replaced Image (Deleted From Server)' : 'Previous Image'}
                </div>
              </div>
              <div className="aspect-4/3 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                {oldFileDeletedPermanently ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Old image file permanently removed from server disk.
                  </div>
                ) : (
                  <SafeImage
                    src={originalUrl}
                    alt={product.title}
                    productId={product.id}
                    productTitle={product.title}
                    category={product.category}
                    className="w-full h-full object-contain bg-slate-100"
                  />
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate" title={originalUrl}>
                {originalUrl || '(empty)'}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Live Active Image
                </span>
                {liveUrl !== originalUrl && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                    Updated Live
                  </span>
                )}
              </div>
              <div className="aspect-4/3 rounded-lg bg-white border border-blue-200 overflow-hidden flex items-center justify-center">
                {liveUrl ? (
                  <img
                    src={
                      liveUrl.startsWith('/assets/uploads/')
                        ? `${liveUrl.split('?')[0]}?v=${liveVersion}`
                        : liveUrl
                    }
                    alt={product.title}
                    className="w-full h-full object-contain bg-slate-100"
                  />
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No active image assigned. Upload, pick from library, or click Auto-Fix.
                  </div>
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-600 truncate" title={liveUrl}>
                {liveUrl || '(empty)'}
              </div>
            </div>
          </div>

          {/* Direct All-In-One Action Toolbar */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isUploading || isApplying}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
                <span>{isUploading ? 'Uploading...' : 'Manual Upload'}</span>
              </button>

              <button
                type="button"
                disabled={isApplying || isUploading}
                onClick={() => void handleAutoFix()}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
                <span>{isApplying ? 'Fixing...' : 'Auto-Fix Now'}</span>
              </button>

              <button
                type="button"
                disabled={!liveUrl || isUploading || isApplying}
                onClick={() => setIsCropping(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Crop / Edit Filters</span>
              </button>

              <button
                type="button"
                disabled={isApplying || isUploading}
                onClick={() => {
                  setManualUrlInput(liveUrl || '');
                  setShowUrlBar(prev => !prev);
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Paste URL</span>
              </button>

              {onCheckLiveOnSite && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCheckLiveOnSite();
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#0F294D] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Check on Site</span>
                </button>
              )}

              {liveHref && (
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open New Tab</span>
                </a>
              )}

              <button
                type="button"
                disabled={!liveUrl || isApplying || isUploading}
                onClick={() => {
                  setShowUrlBar(false);
                  setConfirmDelete(prev => !prev);
                }}
                className="px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>

              {liveUrl !== originalUrl && !oldFileDeletedPermanently && (
                <button
                  type="button"
                  disabled={isApplying || isUploading}
                  onClick={() => void handleRevert()}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert</span>
                </button>
              )}
            </div>

            {showUrlBar && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="text"
                  value={manualUrlInput}
                  onChange={e => setManualUrlInput(e.target.value)}
                  placeholder="Paste https://... or /assets/uploads/... URL"
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#0F294D]"
                />
                <button
                  type="button"
                  disabled={isApplying || !manualUrlInput.trim()}
                  onClick={() => void handleApplyManualUrl()}
                  className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  Save &amp; Delete Old File
                </button>
              </div>
            )}

            {confirmDelete && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
                <span className="text-rose-900 font-medium">
                  Permanently delete <span className="font-mono font-semibold">{liveUrl}</span> from server storage?
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => void handlePermanentDelete()}
                    className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visual Search Candidate Picker & Server Media Library Picker */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start">
                <button
                  type="button"
                  onClick={() => setPickerTab('CANDIDATES')}
                  className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                    pickerTab === 'CANDIDATES'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Verified Photo Search ({candidates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTab('MEDIA_LIBRARY')}
                  className={`px-3 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    pickerTab === 'MEDIA_LIBRARY'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Server Media Library ({mediaLibraryItems.length})</span>
                </button>
              </div>

              {pickerTab === 'CANDIDATES' ? (
                <form
                  className="flex items-center gap-2 w-full sm:w-auto"
                  onSubmit={e => {
                    e.preventDefault();
                    void loadCandidates(searchQuery, true);
                  }}
                >
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Refine photo search..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoadingCandidates}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCandidates ? 'animate-spin' : ''}`} />
                    <span>Search</span>
                  </button>
                </form>
              ) : (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={libraryFilter}
                    onChange={e => setLibraryFilter(e.target.value)}
                    placeholder="Filter server uploads..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {pickerTab === 'CANDIDATES' ? (
              isLoadingCandidates ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-4/3 rounded-lg bg-slate-100 animate-pulse border border-slate-200" />
                  ))}
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  No matching candidates found for this query. Try editing the search words above or click <strong>Manual Upload</strong>.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {candidates.slice(0, 15).map((cand, idx) => {
                    const isCurrent =
                      cand.url.split('?')[0] === liveUrl.split('?')[0];
                    return (
                      <button
                        key={`${cand.url}-${idx}`}
                        type="button"
                        disabled={isApplying || isUploading}
                        onClick={() => void handlePickCandidate(cand.url)}
                        className={`group relative rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:border-blue-600 hover:shadow-md'
                        }`}
                      >
                        <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                          <img
                            src={cand.thumbnailUrl || cand.url}
                            alt={cand.title || product.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="px-2 py-1 bg-white text-[10px] font-semibold text-slate-700 truncate flex items-center justify-between gap-1">
                          <span className="truncate">{cand.sourceDomain || 'Verified'}</span>
                          {isCurrent && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : filteredLibraryItems.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                No uploaded files in the server media library match your filter.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredLibraryItems.slice(0, 40).map(item => {
                  const cleanU = item.url.split('?')[0];
                  const isCurrent = cleanU === liveUrl.split('?')[0];
                  return (
                    <button
                      key={item.id || item.url}
                      type="button"
                      disabled={isApplying || isUploading}
                      onClick={() => void handlePickCandidate(cleanU)}
                      className={`group relative rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 hover:border-blue-600 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                        <img
                          src={cleanU}
                          alt={item.name || 'Uploaded image'}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="px-2 py-1 bg-white text-[10px] font-semibold text-slate-700 truncate flex items-center justify-between gap-1">
                        <span className="truncate">{item.name || cleanU.split('/').pop()}</span>
                        {isCurrent && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {isCropping && liveUrl && (
        <ImageEditingOverlay
          imageSrc={liveUrl}
          imageName={product.title}
          onSave={editedDataUrl => void handleSaveCropped(editedDataUrl)}
          onClose={() => setIsCropping(false)}
        />
      )}
    </div>
  );
};
