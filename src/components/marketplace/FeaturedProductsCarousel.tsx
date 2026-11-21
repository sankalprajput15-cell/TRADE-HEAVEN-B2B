import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { SafeImage } from '../common/SafeImage';
import { CountryFlag } from '../common/CountryFlag';
import {
  Star,
  Mail,
  Package,
  ArrowRight,
  ShieldCheck,
  Wand2,
  Eye,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export interface FeaturedProductsCarouselProps {
  products: Product[];
  selectedCategory: string | null;
  onClearCategory?: () => void;
  onSelectProduct: (product: Product) => void;
  onContactSupplier: (product: Product) => void;
  onViewAllProducts: () => void;
  formatPrice: (usd: number) => string;
  isLoading?: boolean;
  autoSlideIntervalMs?: number;
  // Admin inline image tools (preserved from homepage)
  isAdminUser?: boolean;
  fixingProductIds?: Record<string, boolean>;
  uploadingProductIds?: Record<string, boolean>;
  isAdminInspecting?: boolean;
  adminImageNotice?: { type: 'success' | 'error'; text: string } | null;
  onDismissAdminNotice?: () => void;
  onAdminFix?: (e: React.MouseEvent, prod: Product, currentUrl: string) => void;
  onAdminInspect?: (e: React.MouseEvent, prod: Product, currentUrl: string) => void;
  onAdminUploadClick?: (e: React.MouseEvent, prod: Product, currentUrl: string) => void;
  quickUploadInputRef?: React.RefObject<HTMLInputElement | null>;
  onQuickCardFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TIER_BASE_RATING: Record<string, number> = {
  VIP: 4.9,
  PLATINUM: 4.9,
  GOLD: 4.8,
  SILVER: 4.7,
  FREE: 4.5
};

/**
 * Derives a consistent 1.0–5.0 rating score from the existing Product interface,
 * preferring explicit `rating` and falling back to verified supplier trust metrics.
 */
export function getProductEffectiveRating(product: Product): number {
  if (typeof product.rating === 'number' && Number.isFinite(product.rating) && product.rating > 0) {
    return Math.round(Math.min(5, Math.max(1, product.rating)) * 10) / 10;
  }

  if (
    typeof product.supplierTrustScore === 'number' &&
    Number.isFinite(product.supplierTrustScore) &&
    product.supplierTrustScore > 0
  ) {
    const normalized = 4.2 + ((Math.min(100, Math.max(70, product.supplierTrustScore)) - 70) / 30) * 0.75;
    return Math.round(Math.min(4.9, Math.max(4.3, normalized)) * 10) / 10;
  }

  const tierScore = TIER_BASE_RATING[String(product.supplierTier || '').toUpperCase()] ?? 4.6;
  const bonus = product.featured || product.isFeatured ? 0.1 : 0;
  return Math.round(Math.min(4.9, tierScore + bonus) * 10) / 10;
}

/**
 * Ranks a list of Product records by top rating, review volume, featured status, and trust score.
 */
export function sortTopRatedProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const ratingDiff = getProductEffectiveRating(b) - getProductEffectiveRating(a);
    if (Math.abs(ratingDiff) > 0.001) return ratingDiff;

    const reviewDiff = (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0);
    if (reviewDiff !== 0) return reviewDiff;

    const featuredA = a.featured || a.isFeatured ? 1 : 0;
    const featuredB = b.featured || b.isFeatured ? 1 : 0;
    if (featuredB !== featuredA) return featuredB - featuredA;

    const trustDiff = (Number(b.supplierTrustScore) || 0) - (Number(a.supplierTrustScore) || 0);
    if (trustDiff !== 0) return trustDiff;

    return 0;
  });
}

function getVisibleCountForWidth(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1;
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  products,
  selectedCategory,
  onClearCategory,
  onSelectProduct,
  onContactSupplier,
  onViewAllProducts,
  formatPrice,
  isLoading = false,
  autoSlideIntervalMs = 4500,
  isAdminUser = false,
  fixingProductIds = {},
  uploadingProductIds = {},
  isAdminInspecting = false,
  adminImageNotice = null,
  onDismissAdminNotice,
  onAdminFix,
  onAdminInspect,
  onAdminUploadClick,
  quickUploadInputRef,
  onQuickCardFileChange
}) => {
  const { t, tText } = useLanguage();

  const [visibleCount, setVisibleCount] = useState<number>(() =>
    typeof window !== 'undefined' ? getVisibleCountForWidth(window.innerWidth) : 4
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocusWithin, setIsFocusWithin] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Track responsive card count
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setVisibleCount(getVisibleCountForWidth(window.innerWidth));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Respect OS reduced-motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  const totalProducts = products.length;
  const maxIndex = Math.max(0, totalProducts - visibleCount);
  const safeIndex = Math.min(currentIndex, maxIndex);
  const canSlide = maxIndex > 0;

  const isAnyAdminCardBusy = useMemo(() => {
    if (isAdminInspecting) return true;
    return (
      Object.values(fixingProductIds).some(Boolean) ||
      Object.values(uploadingProductIds).some(Boolean)
    );
  }, [fixingProductIds, uploadingProductIds, isAdminInspecting]);

  const isAutoPlaying =
    canSlide &&
    !isLoading &&
    !isHovered &&
    !isFocusWithin &&
    !isAnyAdminCardBusy &&
    !prefersReducedMotion;

  // Reset slide index when category or product list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory, totalProducts]);

  // Clamp slide index on resize
  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    if (!canSlide) return;
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [canSlide, maxIndex]);

  const handlePrev = useCallback(() => {
    if (!canSlide) return;
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [canSlide, maxIndex]);

  // Auto-sliding interval
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, autoSlideIntervalMs);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, maxIndex, autoSlideIntervalMs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const delta = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(delta) >= 40) {
      if (delta > 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section
      id="featured-products-section"
      aria-roledescription="carousel"
      aria-label="Featured Top-Rated Products"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
      onKeyDown={handleKeyDown}
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5 shadow-2xs"
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Top-Rated Catalog · Factory Direct Wholesale
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#0F294D] mt-0.5 text-balance">
            {selectedCategory
              ? `${tText(selectedCategory)} — Featured Products`
              : 'Featured Top-Rated Products'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Highest-rated verified export listings ranked by buyer score, supplier audit tier, and fulfillment reliability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedCategory && onClearCategory && (
            <button
              type="button"
              onClick={onClearCategory}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Show All Sectors ×
            </button>
          )}

          <button
            type="button"
            onClick={onViewAllProducts}
            className="px-4 py-2 rounded-lg bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewAllProducts')}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Hidden Admin Quick-Upload Input */}
      {isAdminUser && quickUploadInputRef && onQuickCardFileChange && (
        <input
          ref={quickUploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => onQuickCardFileChange(e)}
        />
      )}

      {/* Admin Status Banner */}
      {isAdminUser && adminImageNotice && (
        <div
          role="status"
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            adminImageNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {adminImageNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="truncate">{adminImageNotice.text}</span>
          </div>
          {onDismissAdminNotice && (
            <button
              type="button"
              onClick={onDismissAdminNotice}
              className="p-1 rounded hover:bg-black/5 cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Carousel Viewport */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(idx => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 h-80 animate-pulse" />
          ))}
        </div>
      ) : totalProducts === 0 ? (
        <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
          <div className="text-sm font-bold text-slate-800">No featured products match this sector yet</div>
          <p className="text-xs text-slate-500">
            Reset the active category filter or browse the complete wholesale catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="overflow-hidden py-1"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`flex -mx-2 ${
                prefersReducedMotion
                  ? ''
                  : 'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform'
              }`}
              style={{
                transform: `translate3d(-${(safeIndex * 100) / visibleCount}%, 0, 0)`
              }}
            >
              {products.map(prod => {
                const tiers = Array.isArray(prod.priceTiers) ? prod.priceTiers : [];
                const firstTier = tiers[0];
                const lastTier = tiers[tiers.length - 1];
                const fallbackPrice = Number(prod.fobPriceUsd ?? 0);
                const minPrice = Number(lastTier?.priceUsd ?? fallbackPrice) || 0;
                const maxPrice = Number(firstTier?.priceUsd ?? fallbackPrice) || 0;
                const safeMoq = Number(prod.moq ?? 1) || 1;
                const imgUrl = prod.images && prod.images[0] ? prod.images[0] : '';
                const unitLabel = prod.moqUnit || prod.unit || 'Units';
                const ratingScore = getProductEffectiveRating(prod);
                const hasVerifiedReviews =
                  typeof prod.reviewCount === 'number' && prod.reviewCount > 0;
                const isVerifiedExporter =
                  Boolean(prod.supplierIsVerified) ||
                  prod.supplierTier === 'GOLD' ||
                  prod.supplierTier === 'PLATINUM' ||
                  prod.supplierTier === 'VIP';
                const isCardFixing = Boolean(fixingProductIds[prod.id]);
                const isCardUploading = Boolean(uploadingProductIds[prod.id]);

                return (
                  <div
                    key={prod.id}
                    className="px-2 shrink-0"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <article
                      id={`featured-product-card-${prod.id}`}
                      onClick={() => onSelectProduct(prod)}
                      className="h-full bg-white rounded-xl border border-slate-200 hover:border-[#0F294D] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Product Photo */}
                        <div className="relative aspect-4/3 bg-slate-100 border-b border-slate-100 overflow-hidden">
                          <SafeImage
                            src={imgUrl}
                            alt={prod.title}
                            productId={prod.id}
                            productTitle={prod.title}
                            category={prod.category}
                            type="product"
                            isThumbnail={true}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {isAdminUser && onAdminFix && onAdminInspect && onAdminUploadClick && (
                            <div
                              onClick={e => e.stopPropagation()}
                              data-testid={`admin-card-image-actions-${prod.id}`}
                              className="absolute inset-x-1.5 bottom-1.5 z-20 flex items-center justify-center gap-1 rounded-lg bg-slate-950/85 backdrop-blur-xs p-1 shadow-lg border border-white/15"
                            >
                              <button
                                type="button"
                                disabled={isCardFixing || isCardUploading}
                                onClick={e => onAdminFix(e, prod, imgUrl)}
                                title="Auto-fix product image"
                                className="flex-1 px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Wand2 className={`w-3 h-3 shrink-0 ${isCardFixing ? 'animate-spin' : ''}`} />
                                <span>{isCardFixing ? 'Fixing' : 'Fix'}</span>
                              </button>

                              <button
                                type="button"
                                disabled={isCardFixing || isCardUploading}
                                onClick={e => onAdminInspect(e, prod, imgUrl)}
                                title="Inspect image, compare candidates, or crop"
                                className="flex-1 px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Eye className="w-3 h-3 shrink-0" />
                                <span>Inspect</span>
                              </button>

                              <button
                                type="button"
                                disabled={isCardFixing || isCardUploading}
                                onClick={e => onAdminUploadClick(e, prod, imgUrl)}
                                title="Upload replacement image directly"
                                className="flex-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Upload className={`w-3 h-3 shrink-0 ${isCardUploading ? 'animate-bounce' : ''}`} />
                                <span>{isCardUploading ? 'Saving' : 'Upload'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Product Body */}
                        <div className="p-3.5 space-y-2">
                          {/* Unboxed Metadata: Category & Top Rating */}
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-semibold text-blue-700 truncate">
                              {tText(prod.category)}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 shrink-0 font-bold text-slate-900 tabular-nums"
                              aria-label={`Rated ${ratingScore.toFixed(1)} out of 5`}
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                              <span>{ratingScore.toFixed(1)}</span>
                              {hasVerifiedReviews && (
                                <span className="text-slate-400 font-medium">
                                  ({prod.reviewCount})
                                </span>
                              )}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F294D] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                            {prod.title}
                          </h3>

                          <div className="pt-1">
                            <div className="text-base font-black text-[#0F294D] tabular-nums">
                              {minPrice > 0 && maxPrice > minPrice
                                ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                                : maxPrice > 0
                                ? formatPrice(maxPrice)
                                : prod.priceRangeUsd || 'Request Quote'}
                              <span className="text-[11px] font-medium text-slate-500"> / {unitLabel}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 tabular-nums truncate">
                              <span>
                                MOQ:{' '}
                                <strong className="text-slate-800">
                                  {safeMoq.toLocaleString()} {unitLabel}
                                </strong>
                              </span>
                              {typeof prod.leadTimeDays === 'number' && prod.leadTimeDays > 0 && (
                                <>
                                  <span className="text-slate-300" aria-hidden="true">·</span>
                                  <span>{prod.leadTimeDays}d lead</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Supplier Footer */}
                      <div className="px-3.5 py-2.5 bg-[#F8FAFC] border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 min-w-0 text-[11px] text-slate-600 font-semibold">
                          <CountryFlag country={prod.supplierCountry} size="xs" />
                          <span className="truncate">{prod.supplierName || prod.supplierCountry}</span>
                          {isVerifiedExporter && (
                            <ShieldCheck
                              className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                              aria-label="Verified Supplier"
                            />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onContactSupplier(prod);
                          }}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-[#EA580C] text-[#0F294D] hover:text-white border border-slate-300 hover:border-[#EA580C] text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>Inquire</span>
                        </button>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
