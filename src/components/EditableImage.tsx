import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { ImagePlus, Upload, Link, Check, X, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import {
  productImageManagerService,
  PRODUCT_IMAGE_SAVED_EVENT,
  PRODUCT_IMAGE_STORAGE_SAVED_EVENT,
  ProductImageSavedEventDetail,
  optimizeImageUrl
} from '../services/productImageManagerService';

export interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  productId?: string;
  aspectRatio?: string;
  targetWidth?: number;
  onImageChange?: (newUrl: string) => void;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  contentKey,
  defaultSrc,
  alt,
  className = '',
  imgClassName = '',
  productId,
  aspectRatio,
  targetWidth = 480,
  onImageChange
}) => {
  const { siteContent, updateField, isUserAuthorized, currentUser, isLiveEditMode } = useSiteContent();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onImageChangeRef = useRef(onImageChange);
  onImageChangeRef.current = onImageChange;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'URL' | 'UPLOAD'>('URL');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localEditedSrc, setLocalEditedSrc] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  const canEdit = Boolean(isUserAuthorized(currentUser).isAuthorized && isLiveEditMode);

  // Purely derived image source computed during render — NEVER calls setState in useEffect
  const currentSrc = useMemo((): string => {
    const pick = (): string => {
      if (imgLoadError) {
        return defaultSrc && defaultSrc.trim()
          ? defaultSrc.trim()
          : 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=480&auto=format&fit=crop&q=75';
      }

      if (localEditedSrc) {
        return localEditedSrc;
      }

      const key = (productId || contentKey || '').trim();
      const overrides = productImageManagerService.getState()?.overrides || {};

      if (key && overrides[key]?.primary) {
        return overrides[key].primary;
      }

      const rawSrc = contentKey.split('.').reduce((o: any, i: string) => (o ? o[i] : null), siteContent);
      if (rawSrc && typeof rawSrc === 'string' && rawSrc.trim()) {
        const clean = rawSrc.trim();
        const resolved = productImageManagerService.resolveImageSrc({ src: clean, productId: key });
        return resolved || overrides[clean]?.primary || overrides[key]?.primary || clean;
      }

      if (defaultSrc && typeof defaultSrc === 'string' && defaultSrc.trim()) {
        const resolvedDefault = productImageManagerService.resolveImageSrc({
          src: defaultSrc.trim(),
          productId: key || undefined
        });
        return resolvedDefault || defaultSrc.trim();
      }

      return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=480&auto=format&fit=crop&q=75';
    };

    return optimizeImageUrl(pick(), { width: targetWidth });
  }, [localEditedSrc, productId, contentKey, siteContent, defaultSrc, tick, imgLoadError, targetWidth]);

  const lastHandledEventTsRef = useRef<number>(0);

  // Hook into productImageManagerService custom events emitted on storage save
  useEffect(() => {
    let isMounted = true;
    if (!productImageManagerService.isHydrated()) {
      productImageManagerService.ensureHydrated().then(() => {
        if (isMounted) {
          setTick((t) => (t + 1) % 1000000);
        }
      });
    }

    const handleImageSavedToStorage = (event: Event) => {
      if (!isMounted) return;
      const customEv = event as CustomEvent<ProductImageSavedEventDetail>;
      const detail = customEv?.detail;
      const evTs = detail?.timestamp || 0;
      if (evTs > 0 && evTs === lastHandledEventTsRef.current) {
        return;
      }
      if (evTs > 0) {
        lastHandledEventTsRef.current = evTs;
      }

      const key = (productId || contentKey || '').trim();

      // Clear any temporary local override so fresh storage source takes over
      setLocalEditedSrc(null);
      setImgLoadError(false);

      // Force this component to re-render with the latest source from storage
      setTick((t) => (t + 1) % 1000000);

      if (detail?.url && onImageChangeRef.current) {
        if (
          (detail.productId && (detail.productId === key || detail.productId.toLowerCase() === key.toLowerCase())) ||
          (detail.overrides && key && detail.overrides[key]?.primary)
        ) {
          onImageChangeRef.current(detail.url);
        }
      }
    };

    // Listen to primary custom event dispatched when an image is saved to storage
    window.addEventListener(PRODUCT_IMAGE_SAVED_EVENT, handleImageSavedToStorage);
    window.addEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handleImageSavedToStorage);
    window.addEventListener('tradeheaven_product_images_updated', handleImageSavedToStorage);

    // Cross-tab/window storage synchronization
    const handleStorageEvent = (e: StorageEvent) => {
      if (!isMounted) return;
      if (
        !e.key ||
        e.key === 'trade_heaven_product_image_system_v1' ||
        e.key === 'trade_heaven_image_overrides' ||
        e.key === 'tradeheaven_product_images_state' ||
        e.key === 'tradeheaven_product_images_overrides' ||
        e.key === 'site_content_override'
      ) {
        setLocalEditedSrc(null);
        setImgLoadError(false);
        setTick((t) => (t + 1) % 1000000);
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      isMounted = false;
      window.removeEventListener(PRODUCT_IMAGE_SAVED_EVENT, handleImageSavedToStorage);
      window.removeEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handleImageSavedToStorage);
      window.removeEventListener('tradeheaven_product_images_updated', handleImageSavedToStorage);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [contentKey, productId]);

  // Open replace modal
  const handleOpenEditor = (e: React.MouseEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setUrlInput(currentSrc);
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  // Save new URL to storage
  const handleSaveUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid image URL' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      // 1. Update siteContent if this corresponds to a siteContent key
      if (contentKey) {
        updateField(contentKey, trimmed);
      }

      // 2. Save directly into productImageManagerService (which saves to storage & emits the custom event)
      const targetKey = productId || contentKey;
      if (targetKey) {
        await productImageManagerService.setProductImage(targetKey, trimmed);
      }

      setLocalEditedSrc(trimmed);
      setImgLoadError(false);
      onImageChangeRef.current?.(trimmed);

      setStatusMessage({ type: 'success', text: 'Image successfully saved to storage!' });
      setTimeout(() => {
        setIsModalOpen(false);
      }, 700);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save image' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload image file directly
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const targetKey = productId || contentKey;
      const result = await productImageManagerService.uploadAndAssignImageFile(file, {
        productId: targetKey,
        targetFormat: 'original'
      });

      if (result?.url) {
        if (contentKey) {
          updateField(contentKey, result.url);
        }
        setLocalEditedSrc(result.url);
        setImgLoadError(false);
        onImageChangeRef.current?.(result.url);

        setStatusMessage({ type: 'success', text: `Saved to storage (${result.name})!` });
        setTimeout(() => {
          setIsModalOpen(false);
        }, 700);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to upload image file' });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle image load error fallback without loop
  const handleImageError = () => {
    if (!imgLoadError) {
      setImgLoadError(true);
    }
  };

  return (
    <>
      <div
        className={`relative ${canEdit ? 'group cursor-pointer' : ''} ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
        onClick={canEdit ? handleOpenEditor : undefined}
        title={canEdit ? 'Click to replace or update image' : alt}
      >
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className={`w-full h-full object-cover rounded-inherit ${imgClassName}`}
        />

        {canEdit && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-10 backdrop-blur-[1px]">
            <div className="bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-xl flex items-center gap-1.5 border border-slate-200">
              <ImagePlus size={14} className="text-blue-600" />
              <span>Replace Image</span>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal for Authorized Admins */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-slate-900 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ImagePlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Update Image Asset</h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-[240px]">
                    {productId || contentKey}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview */}
            <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
              <img
                src={urlInput.trim() || currentSrc}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = currentSrc;
                }}
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs">
                Live Source Preview
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalMode('URL')}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalMode === 'URL' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link size={14} />
                <span>Image URL</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode('UPLOAD')}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalMode === 'UPLOAD' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload size={14} />
                <span>Upload File</span>
              </button>
            </div>

            {/* Tab Contents */}
            {modalMode === 'URL' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image Source URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://... or /assets/..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Saves directly to storage and emits a custom event so all matching images immediately re-render.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    Click to select an image from your device
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Supports JPG, PNG, WEBP, AVIF with automatic storage persistence
                  </div>
                </button>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <Check size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {modalMode === 'URL' && (
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  disabled={isProcessing}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to Storage...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Save &amp; Broadcast</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
