import React, { useRef, useState } from 'react';
import {
  DEFAULT_HERO_BANNER_SLIDES,
  HeroBannerSlideCMS
} from '../../data/defaultSiteContent';
import { productImageManagerService } from '../../services/productImageManagerService';
import heroLogisticsBanner from '../../assets/images/b2b_global_logistics_hero_1795156803921.jpg';
import heroFactoryBanner from '../../assets/images/b2b_factory_machinery_hero_1795156798466.jpg';
import heroAgriBanner from '../../assets/images/b2b_bulk_trade_hero_1795156798871.jpg';
import {
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

const BUNDLED_FALLBACK_SLIDES = [
  heroLogisticsBanner,
  heroFactoryBanner,
  heroAgriBanner
];

/**
 * Resolves a hero slide's displayable image URL cleanly on the client,
 * respecting custom uploaded URLs, legacy `heroBgImage` for Slide 1, and bundled fallbacks.
 */
export function resolveHeroSlideImageSrc(
  slide: Partial<HeroBannerSlideCMS> | undefined,
  index: number,
  legacyHeroBgImage?: string
): string {
  const cleanCustom = (url?: string) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (trimmed.includes('unsplash.com') || trimmed.includes('vecteezy_')) return '';
    return trimmed.replace(/^\/assets\/aistudio\//, '/assets/uploads/');
  };

  const slideImg = cleanCustom(slide?.image);
  if (slideImg) return slideImg;

  if (index === 0) {
    const legacyImg = cleanCustom(legacyHeroBgImage);
    if (legacyImg) return legacyImg;
  }

  return BUNDLED_FALLBACK_SLIDES[index % BUNDLED_FALLBACK_SLIDES.length];
}

export function getNormalizedHeroSlides(
  slides?: HeroBannerSlideCMS[]
): HeroBannerSlideCMS[] {
  if (Array.isArray(slides) && slides.length > 0) {
    return slides.map((s, idx) => {
      const fallback = DEFAULT_HERO_BANNER_SLIDES[idx % DEFAULT_HERO_BANNER_SLIDES.length];
      return {
        id: s.id || `hero-slide-${idx + 1}`,
        eyebrow: s.eyebrow ?? fallback.eyebrow,
        title: s.title ?? fallback.title,
        highlight: s.highlight ?? fallback.highlight,
        suffix: s.suffix ?? fallback.suffix,
        subtitle: s.subtitle ?? fallback.subtitle,
        image: typeof s.image === 'string' ? s.image : '',
        imageAlt: s.imageAlt || fallback.imageAlt,
        primaryCta: s.primaryCta || fallback.primaryCta,
        primaryAction: s.primaryAction || fallback.primaryAction,
        secondaryCta: s.secondaryCta || fallback.secondaryCta,
        searchHint: typeof s.searchHint === 'string' ? s.searchHint : fallback.searchHint
      };
    });
  }
  return DEFAULT_HERO_BANNER_SLIDES.map(s => ({ ...s }));
}

interface HeroBannerSlidesEditorProps {
  slides?: HeroBannerSlideCMS[];
  legacyHeroBgImage?: string;
  onChange: (nextSlides: HeroBannerSlideCMS[]) => void;
  compact?: boolean;
}

export const HeroBannerSlidesEditor: React.FC<HeroBannerSlidesEditorProps> = ({
  slides,
  legacyHeroBgImage,
  onChange,
  compact = false
}) => {
  const normalizedSlides = getNormalizedHeroSlides(slides);
  const [expandedId, setExpandedId] = useState<string | null>(normalizedSlides[0]?.id || null);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetSlideIdRef = useRef<string | null>(null);

  const updateSlide = (slideId: string, patch: Partial<HeroBannerSlideCMS>) => {
    const next = normalizedSlides.map(s => (s.id === slideId ? { ...s, ...patch } : s));
    onChange(next);
  };

  const handleMoveSlide = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= normalizedSlides.length) return;
    const next = [...normalizedSlides];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  const handleAddSlide = () => {
    const newId = `hero-slide-${Date.now()}`;
    const newSlide: HeroBannerSlideCMS = {
      id: newId,
      eyebrow: 'Global B2B Trade Showcase',
      title: 'Direct Factory Supply for',
      highlight: 'Global Wholesale Buyers',
      suffix: '& Importers',
      subtitle:
        'Connect directly with audited manufacturers, request bulk quotations, and lock verified export terms.',
      image: '',
      imageAlt: 'Global B2B wholesale trade banner',
      primaryCta: 'Source Products',
      primaryAction: 'PRODUCTS',
      secondaryCta: 'Post Buy Offer',
      searchHint: ''
    };
    const next = [...normalizedSlides, newSlide];
    onChange(next);
    setExpandedId(newId);
    setStatusNotice({ type: 'success', text: `Added Slide ${next.length}. Upload a banner image or customize copy below.` });
  };

  const handleDeleteSlide = (slideId: string) => {
    if (normalizedSlides.length <= 1) {
      setStatusNotice({ type: 'error', text: 'At least one hero banner slide must remain active.' });
      return;
    }
    const next = normalizedSlides.filter(s => s.id !== slideId);
    onChange(next);
    if (expandedId === slideId) {
      setExpandedId(next[0]?.id || null);
    }
    setStatusNotice({ type: 'success', text: 'Slide removed from hero banner rotation.' });
  };

  const triggerUploadForSlide = (slideId: string) => {
    uploadTargetSlideIdRef.current = slideId;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slideId = uploadTargetSlideIdRef.current;
    if (!file || !slideId) return;

    setUploadingSlideId(slideId);
    setStatusNotice(null);
    try {
      const res = await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: 'webp',
        quality: 0.9
      });
      if (!res?.url) {
        throw new Error('Server did not return a saved banner image URL.');
      }
      updateSlide(slideId, { image: res.url });
      setStatusNotice({
        type: 'success',
        text: 'Banner image uploaded and attached to slide. Save or Publish Live to apply.'
      });
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        text: err?.message || 'Failed to upload banner image. Try another file or paste an image URL.'
      });
    } finally {
      setUploadingSlideId(null);
      uploadTargetSlideIdRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => void handleFileChange(e)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-slate-900">
            Hero Carousel Banner Slides ({normalizedSlides.length})
          </div>
          <p className="text-xs text-slate-500">
            Upload custom photos, paste URLs, reorder, add, or edit headlines for every rotating homepage banner slide.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSlide}
          className="px-3 py-1.5 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Add Banner Slide</span>
        </button>
      </div>

      {statusNotice && (
        <div
          role="status"
          className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusNotice.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span className="min-w-0 flex-1">{statusNotice.text}</span>
        </div>
      )}

      <div className="space-y-2.5">
        {normalizedSlides.map((slide, idx) => {
          const isExpanded = expandedId === slide.id;
          const isUploading = uploadingSlideId === slide.id;
          const resolvedSrc = resolveHeroSlideImageSrc(slide, idx, legacyHeroBgImage);
          const hasCustomImage = Boolean(slide.image && slide.image.trim());

          return (
            <div
              key={slide.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              {/* Slide Summary Bar */}
              <div className="p-3 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50/70">
                <div className="relative w-full sm:w-36 aspect-16/9 rounded-lg overflow-hidden bg-[#0F294D] border border-slate-200 shrink-0">
                  {resolvedSrc ? (
                    <img
                      src={resolvedSrc}
                      alt={slide.imageAlt || `Slide ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/75 via-transparent to-transparent" />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/75 text-white text-[10px] font-bold tabular-nums">
                    Slide {idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs font-bold text-[#0F294D] truncate">
                    {slide.title} <span className="text-[#EA580C]">{slide.highlight}</span> {slide.suffix}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {hasCustomImage ? slide.image : 'Using built-in default banner image'}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => triggerUploadForSlide(slide.id)}
                      className="px-2.5 py-1 rounded-md bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {isUploading ? (
                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      ) : (
                        <Upload className="w-3 h-3 shrink-0" />
                      )}
                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    </button>

                    {hasCustomImage && (
                      <button
                        type="button"
                        onClick={() => updateSlide(slide.id, { image: '' })}
                        className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                        title="Revert to built-in default banner"
                      >
                        <RotateCcw className="w-3 h-3 shrink-0" />
                        <span>Default</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : slide.id)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-[#0F294D] border border-slate-300 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Edit Text & URL'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Reorder & Remove Actions */}
                <div className="flex sm:flex-col items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlide(idx, -1)}
                    aria-label={`Move Slide ${idx + 1} up`}
                    title="Move up"
                    className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer disabled:opacity-35"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === normalizedSlides.length - 1}
                    onClick={() => handleMoveSlide(idx, 1)}
                    aria-label={`Move Slide ${idx + 1} down`}
                    title="Move down"
                    className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer disabled:opacity-35"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={normalizedSlides.length <= 1}
                    onClick={() => handleDeleteSlide(slide.id)}
                    aria-label={`Delete Slide ${idx + 1}`}
                    title="Delete slide"
                    className="w-7 h-7 rounded-md bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer disabled:opacity-35"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Slide Editor Fields */}
              {isExpanded && (
                <div className={`p-3.5 border-t border-slate-200 bg-white space-y-3 ${compact ? 'text-xs' : ''}`}>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Banner Image URL or Uploaded Path
                    </label>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={e => updateSlide(slide.id, { image: e.target.value })}
                      placeholder="Leave blank for built-in banner or paste /assets/uploads/... URL"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs font-mono text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={slide.eyebrow}
                        onChange={e => updateSlide(slide.id, { eyebrow: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Image Alt Description (SEO)
                      </label>
                      <input
                        type="text"
                        value={slide.imageAlt}
                        onChange={e => updateSlide(slide.id, { imageAlt: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Headline Part 1
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={e => updateSlide(slide.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Highlighted Words (Amber)
                      </label>
                      <input
                        type="text"
                        value={slide.highlight}
                        onChange={e => updateSlide(slide.id, { highlight: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs font-bold text-amber-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Headline Suffix
                      </label>
                      <input
                        type="text"
                        value={slide.suffix}
                        onChange={e => updateSlide(slide.id, { suffix: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Slide Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={slide.subtitle}
                      onChange={e => updateSlide(slide.id, { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={slide.primaryCta}
                        onChange={e => updateSlide(slide.id, { primaryCta: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primary Button Destination
                      </label>
                      <select
                        value={slide.primaryAction}
                        onChange={e =>
                          updateSlide(slide.id, {
                            primaryAction: e.target.value as 'PRODUCTS' | 'SUPPLIERS' | 'RFQS'
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="PRODUCTS">Products Directory</option>
                        <option value="SUPPLIERS">Suppliers Directory</option>
                        <option value="RFQS">Buy Leads / RFQs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Category / Search Filter Hint
                      </label>
                      <input
                        type="text"
                        value={slide.searchHint}
                        onChange={e => updateSlide(slide.id, { searchHint: e.target.value })}
                        placeholder="Optional category filter"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0F294D] text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
