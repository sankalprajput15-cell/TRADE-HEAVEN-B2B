import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Check
} from 'lucide-react';
import {
  fetchVisualProductImages,
  VisualProductImageCandidate,
  markBrokenExternalImageUrl,
  getNextHealthyReplacementUrl,
  fisherYatesShuffle,
  autoUploadDisplayedProductImage
} from '../../services/visualProductImageService';

interface VisualProductImagePickerProps {
  productName: string;
  category?: string;
  specifications?: string;
  hasManualImage: boolean;
  selectedImages: string[];
  maxSelect?: number;
  isAutoMatched?: boolean;
  onSelectImages: (urls: string[], isAuto: boolean) => void;
  compact?: boolean;
}

export const VisualProductImagePicker: React.FC<VisualProductImagePickerProps> = ({
  productName,
  category = '',
  specifications = '',
  hasManualImage,
  selectedImages,
  maxSelect = 4,
  isAutoMatched = false,
  onSelectImages,
  compact = false
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [displayedImages, setDisplayedImages] = useState<VisualProductImageCandidate[]>([]);
  const [fullPool, setFullPool] = useState<VisualProductImageCandidate[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'idle' | 'ok' | 'warning' | 'error'>('idle');
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  const lastQueryKeyRef = useRef<string>('');
  const selectedRef = useRef<string[]>(selectedImages);
  selectedRef.current = selectedImages;
  const hasManualRef = useRef<boolean>(hasManualImage);
  hasManualRef.current = hasManualImage;
  const onSelectRef = useRef(onSelectImages);
  onSelectRef.current = onSelectImages;

  const runVisualSearch = useCallback(
    async (opts: { forceRefresh?: boolean; shuffleOnly?: boolean; autoAssignTop?: boolean } = {}) => {
      const cleanName = String(productName || '').trim();
      if (cleanName.length < 3) {
        setStatusType('warning');
        setStatusMsg('Enter at least 3 characters in the Product Name to run Visual Product Search.');
        return;
      }

      setHasSearchedOnce(true);

      // Instant Fisher-Yates re-shuffle when pool already has >10 results unless forceRefresh requested
      if (opts.shuffleOnly && fullPool.length > 0) {
        const shuffled = fisherYatesShuffle(fullPool);
        const nextSlice = shuffled.slice(0, 15);
        setFullPool(shuffled);
        setDisplayedImages(nextSlice);
        if (!hasManualRef.current && nextSlice[0]?.url) {
          onSelectRef.current([nextSlice[0].url], true);
        }
        return;
      }

      setIsSearching(true);
      setStatusMsg(null);
      try {
        const res = await fetchVisualProductImages({
          productName: cleanName,
          category,
          specifications,
          count: 15,
          forceRefresh: opts.forceRefresh,
          shuffleOnly: opts.shuffleOnly
        });

        if (res.success && res.images.length > 0) {
          setDisplayedImages(res.images);
          setFullPool(res.pool.length > 0 ? res.pool : res.images);
          setStatusType('ok');
          setStatusMsg(null);

          if (!hasManualRef.current && (opts.autoAssignTop || selectedRef.current.length === 0)) {
            const topUrl = res.images[0].url;
            onSelectRef.current([topUrl], true);
            if (/^https?:\/\//i.test(topUrl)) {
              void autoUploadDisplayedProductImage({
                imageUrl: topUrl,
                productName: cleanName,
                category
              }).then(localUrl => {
                if (localUrl && !hasManualRef.current) {
                  onSelectRef.current([localUrl], true);
                }
              });
            }
          }
        } else {
          setDisplayedImages([]);
          setFullPool([]);
          setStatusType(res.configRequired ? 'warning' : 'error');
          setStatusMsg(
            res.message ||
              'Could not fetch verified product images. Please upload a product image manually.'
          );
          if (!hasManualRef.current && selectedRef.current.length > 0 && isAutoMatched) {
            onSelectRef.current([], false);
          }
        }
      } catch (err: any) {
        setStatusType('error');
        setStatusMsg(err?.message || 'Visual Product Search failed.');
      } finally {
        setIsSearching(false);
      }
    },
    [productName, category, specifications, fullPool, isAutoMatched]
  );

  // Module 1 Trigger: Auto-fetch when NO manual image is uploaded and user enters product title
  useEffect(() => {
    if (hasManualImage) return;
    const cleanName = String(productName || '').trim();
    if (cleanName.length < 3) return;

    const queryKey = `${cleanName.toLowerCase()}::${String(category || '').toLowerCase()}`;
    if (lastQueryKeyRef.current === queryKey) return;

    const timer = window.setTimeout(() => {
      if (hasManualRef.current) return;
      lastQueryKeyRef.current = queryKey;
      void runVisualSearch({ autoAssignTop: true });
    }, 650);

    return () => window.clearTimeout(timer);
  }, [productName, category, hasManualImage, runVisualSearch]);

  const handleToggleSelectCandidate = (candidateUrl: string) => {
    if (hasManualImage) {
      onSelectImages([candidateUrl], true);
      return;
    }
    const exists = selectedImages.includes(candidateUrl);
    let next: string[];
    if (exists) {
      next = selectedImages.filter(u => u !== candidateUrl);
    } else if (maxSelect <= 1) {
      next = [candidateUrl];
    } else if (selectedImages.length >= maxSelect) {
      next = [...selectedImages.slice(0, maxSelect - 1), candidateUrl];
    } else {
      next = [...selectedImages, candidateUrl];
    }
    onSelectImages(next, next.length > 0);
    if (!exists && /^https?:\/\//i.test(candidateUrl)) {
      void autoUploadDisplayedProductImage({
        imageUrl: candidateUrl,
        productName,
        category
      }).then(localUrl => {
        if (localUrl) {
          const updated = next.map(u => (u === candidateUrl ? localUrl : u));
          onSelectRef.current(updated, updated.length > 0);
        }
      });
    }
  };

  // Module 5: Seamless onError hotlink protection swapping broken external URL for next verified image in pool
  const handleCandidateError = (brokenUrl: string) => {
    markBrokenExternalImageUrl(brokenUrl);
    const activeUrls = [
      ...displayedImages.map(d => d.url),
      ...selectedImages
    ];
    const replacementUrl = getNextHealthyReplacementUrl(fullPool, activeUrls);

    setDisplayedImages(prev => {
      const filtered = prev.filter(item => item.url !== brokenUrl);
      if (replacementUrl) {
        const matchObj = fullPool.find(p => p.url === replacementUrl) || {
          url: replacementUrl,
          title: productName
        };
        return [...filtered, matchObj];
      }
      return filtered;
    });

    if (selectedImages.includes(brokenUrl)) {
      const nextSelected = selectedImages
        .map(u => (u === brokenUrl ? replacementUrl || '' : u))
        .filter(Boolean);
      onSelectImages(nextSelected, nextSelected.length > 0 && isAutoMatched);
    }
  };

  return (
    <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-3.5">
      {/* Header & Trigger Button Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => void runVisualSearch({ autoAssignTop: !hasManualImage })}
            disabled={isSearching || productName.trim().length < 2}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Search className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>Find Product Images (Auto Visual Search)</span>
          </button>

          {displayedImages.length > 0 && (
            <button
              type="button"
              onClick={() => void runVisualSearch({ shuffleOnly: true, autoAssignTop: !hasManualImage })}
              disabled={isSearching}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Shuffle / Refresh >10 randomized verified product photos"
            >
              <RefreshCw className={`w-3 h-3 ${isSearching ? 'animate-spin' : ''}`} />
              <span>Shuffle / Refresh Results</span>
            </button>
          )}
        </div>

        {isAutoMatched && selectedImages.length > 0 && !hasManualImage && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Auto-matched via Visual Product Search</span>
          </span>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold py-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Searching Google product photography for &ldquo;{productName.trim()}&rdquo;...</span>
        </div>
      )}

      {/* Missing Key / Quota / Empty Status Notice (Never shows fake Unsplash/Picsum fallbacks) */}
      {!isSearching && statusMsg && (
        <div
          className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
            statusType === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-0.5 min-w-0">
            <div className="font-bold">Visual Product Search Notice</div>
            <p className="leading-snug">{statusMsg}</p>
          </div>
        </div>
      )}

      {/* Active Auto-Matched Selected Gallery Preview (with onError seamless swap) */}
      {!hasManualImage && selectedImages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Selected ({selectedImages.length}/{maxSelect}):
          </span>
          {selectedImages.map((imgUrl, idx) => (
            <div
              key={`${imgUrl}-${idx}`}
              className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-emerald-500 bg-white shrink-0"
            >
              <img
                src={imgUrl}
                alt={`${productName} selected ${idx + 1}`}
                referrerPolicy="no-referrer"
                onError={() => handleCandidateError(imgUrl)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-emerald-700/90 text-white text-[8px] font-bold text-center leading-tight py-0.5">
                {idx === 0 ? 'Primary' : `#${idx + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Real Product Images Grid (>10 Verified Matches) */}
      {!isSearching && displayedImages.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-black text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Suggested Real Product Images ({displayedImages.length} Verified Matches)
              </span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Click to select up to {maxSelect} gallery {maxSelect === 1 ? 'image' : 'images'}
            </span>
          </div>

          <div
            className={`grid gap-2 ${
              compact
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
            } max-h-64 overflow-y-auto pr-1`}
          >
            {displayedImages.map((item, idx) => {
              const selIdx = selectedImages.indexOf(item.url);
              const isSelected = selIdx >= 0;
              return (
                <button
                  key={`${item.url}-${idx}`}
                  type="button"
                  onClick={() => handleToggleSelectCandidate(item.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-400/40 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-400'
                  }`}
                  title={item.title || productName}
                >
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || `${productName} match ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => handleCandidateError(item.url)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black flex items-center gap-0.5 shadow-sm">
                      <Check className="w-2.5 h-2.5" />
                      <span>{selIdx === 0 ? 'Primary' : `#${selIdx + 1}`}</span>
                    </div>
                  )}
                  {item.sourceDomain && (
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] font-mono px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.sourceDomain}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isSearching && !hasSearchedOnce && !hasManualImage && productName.trim().length < 3 && (
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Leave image upload blank &amp; type your product name — real product photos will auto-fetch automatically.
          </span>
        </p>
      )}
    </div>
  );
};
