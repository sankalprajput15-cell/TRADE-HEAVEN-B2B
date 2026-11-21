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
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../../types';
import {
  fixSingleCatalogImage,
  fetchVisualProductImages,
  VisualProductImageCandidate
} from '../../services/visualProductImageService';
import { productImageManagerService } from '../../services/productImageManagerService';
import { SafeImage } from '../common/SafeImage';
import { ImageEditingOverlay } from './ImageEditingOverlay';

interface AdminQuickImageInspectorModalProps {
  product: Product;
  currentImageUrl: string;
  onClose: () => void;
  onImageUpdated: (productId: string, newUrl: string, activityMs: number) => void;
}

export const AdminQuickImageInspectorModal: React.FC<AdminQuickImageInspectorModalProps> = ({
  product,
  currentImageUrl,
  onClose,
  onImageUpdated
}) => {
  const [originalUrl] = useState<string>(currentImageUrl);
  const [liveUrl, setLiveUrl] = useState<string>(currentImageUrl);
  const [previousUrl, setPreviousUrl] = useState<string>(currentImageUrl);
  const [searchQuery, setSearchQuery] = useState<string>(product.title || '');
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

  const syncAfterUpdate = useCallback(
    async (newUrl: string, prevUrl: string, updatedAt?: string, imageUpdatedAt?: number) => {
      const activityMs = imageUpdatedAt || Date.now();
      setPreviousUrl(prevUrl);
      setLiveUrl(newUrl);
      productImageManagerService.recordProductActivityTimestamp(product.id, activityMs, false);
      productImageManagerService.applyServerOverrideSnapshot([
        {
          id: product.id,
          url: newUrl,
          previousUrl: prevUrl || undefined,
          updatedAt: updatedAt || new Date(activityMs).toISOString(),
          updatedBy: 'admin-manual'
        }
      ]);
      try {
        await productImageManagerService.syncFromServer(true);
      } catch {
        // ignore sync errors
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      onImageUpdated(product.id, newUrl, activityMs);
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

  const handleAutoFix = async () => {
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const res = await fixSingleCatalogImage({
        recordId: product.id,
        recordType: 'PRODUCT',
        title: product.title,
        category: product.category,
        previousImageUrl: liveUrl
      });
      await syncAfterUpdate(res.new_image_url, liveUrl, res.updatedAt, res.imageUpdatedAt);
      setStatusMessage({
        type: 'success',
        text: `Auto-fixed with verified Trade Heaven SEO image (${res.new_image_url}).`
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
      const res = await fixSingleCatalogImage({
        recordId: product.id,
        recordType: 'PRODUCT',
        title: product.title,
        category: product.category,
        customImageUrl: candidateUrl,
        previousImageUrl: liveUrl
      });
      await syncAfterUpdate(res.new_image_url, liveUrl, res.updatedAt, res.imageUpdatedAt);
      setStatusMessage({
        type: 'success',
        text: 'Selected photo saved locally with Trade Heaven SEO metadata and updated live.'
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
      const uploaded = await productImageManagerService.uploadAndAssignImageFile(file, {
        productId: product.id,
        productName: product.title,
        category: product.category,
        targetFormat: 'webp',
        autoWebpLossless: true,
        oldUrlToReplace: undefined
      });
      if (!uploaded?.url || uploaded.url.startsWith('data:')) {
        throw new Error('Uploaded file was not persisted to the server.');
      }
      const cleanUrl = uploaded.url.split('?')[0];
      const res = await fixSingleCatalogImage({
        recordId: product.id,
        recordType: 'PRODUCT',
        title: product.title,
        category: product.category,
        customImageUrl: cleanUrl,
        previousImageUrl: liveUrl
      });
      await syncAfterUpdate(res.new_image_url, liveUrl, res.updatedAt, res.imageUpdatedAt);
      setStatusMessage({
        type: 'success',
        text: `Uploaded & saved (${cleanUrl}) with embedded Trade Heaven EXIF SEO metadata.`
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

  const handleRevert = async () => {
    if (!previousUrl || previousUrl === liveUrl) return;
    setIsApplying(true);
    setStatusMessage(null);
    try {
      const res = await fixSingleCatalogImage({
        recordId: product.id,
        recordType: 'PRODUCT',
        title: product.title,
        category: product.category,
        customImageUrl: previousUrl,
        previousImageUrl: liveUrl,
        revert: true
      });
      await syncAfterUpdate(res.new_image_url, originalUrl, res.updatedAt, res.imageUpdatedAt);
      setStatusMessage({
        type: 'success',
        text: 'Reverted to previous product image.'
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
            <p className="text-xs text-slate-300 mt-0.5 truncate">{product.category}</p>
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
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Before (Original)
              </div>
              <div className="aspect-4/3 rounded-lg bg-white border border-slate-200 overflow-hidden">
                <SafeImage
                  src={originalUrl}
                  alt={product.title}
                  productId={product.id}
                  productTitle={product.title}
                  category={product.category}
                  className="w-full h-full object-contain bg-slate-100"
                />
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
              <div className="aspect-4/3 rounded-lg bg-white border border-blue-200 overflow-hidden">
                <img
                  src={
                    liveUrl.startsWith('/assets/uploads/')
                      ? `${liveUrl.split('?')[0]}?v=${Date.now()}`
                      : liveUrl
                  }
                  alt={product.title}
                  className="w-full h-full object-contain bg-slate-100"
                />
              </div>
              <div className="text-[11px] font-mono text-slate-600 truncate" title={liveUrl}>
                {liveUrl || '(empty)'}
              </div>
            </div>
          </div>

          {/* Direct Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
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
              disabled={isUploading || isApplying}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
              <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
            </button>

            <button
              type="button"
              disabled={!liveUrl || isUploading || isApplying}
              onClick={() => setIsCropping(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop / Frame</span>
            </button>

            {liveUrl !== originalUrl && (
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

          {/* Visual Search Candidate Picker */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-black text-slate-900">
                Pick Verified Product Photo ({candidates.length} results)
              </div>
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
            </div>

            {isLoadingCandidates ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-4/3 rounded-lg bg-slate-100 animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                No matching candidates found for this query. Try editing the search words above or click <strong>Upload Photo</strong>.
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
