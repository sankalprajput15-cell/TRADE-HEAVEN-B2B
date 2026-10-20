import React, { useState, useEffect, useRef } from 'react';
import { OptimizedHeroImageData, createSvgBlurPlaceholder } from '../../utils/heroImageOptimization';

interface OptimizedHeroImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageData?: OptimizedHeroImageData;
  src?: string;
  blurDataUrl?: string;
  aspectRatio?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  dominantColor?: string;
  eager?: boolean;
  showGradientOverlay?: boolean;
  children?: React.ReactNode;
}

export const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({
  imageData,
  src,
  blurDataUrl,
  aspectRatio,
  alt,
  className = '',
  imgClassName = '',
  dominantColor,
  eager = true,
  showGradientOverlay = false,
  children,
  ...restProps
}) => {
  const resolvedSrc = src === 'vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034.jpg'
    ? '/assets/aistudio/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg'
    : src;
  const finalSrc = resolvedSrc || imageData?.url || '/assets/aistudio/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg';
  const isLocalAsset = finalSrc.startsWith('/assets/') || finalSrc.startsWith('/');
  const [isLoaded, setIsLoaded] = useState<boolean>(isLocalAsset);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(eager);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const finalBlur = blurDataUrl || imageData?.blurDataUrl || createSvgBlurPlaceholder(1200, 675, dominantColor || imageData?.themeColor || '#0f172a');
  const finalAlt = alt || imageData?.alt || 'Trade Heaven B2B Wholesale Hero';
  const finalAspect = aspectRatio || imageData?.aspectRatio || '16/9';
  const rawSrcSet = restProps.srcSet || imageData?.srcSet;
  const finalSrcSet = rawSrcSet && rawSrcSet.trim() !== '' && !rawSrcSet.endsWith(' 1x') ? rawSrcSet : undefined;
  const finalSizes = finalSrcSet ? (restProps.sizes || imageData?.sizes || '100vw') : undefined;

  // IntersectionObserver for below-the-fold lazy loading
  useEffect(() => {
    if (eager) {
      setIsInView(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const currentRef = containerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsInView(true);
            obs.unobserve(entry.target);
            obs.disconnect();
          }
        });
      },
      {
        rootMargin: '200px 0px', // start loading slightly before scrolling into view
        threshold: 0.01
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [eager]);

  // Reset loading state when source changes, or mark loaded if already complete
  useEffect(() => {
    if (isInView) {
      setHasError(false);
      if (isLocalAsset || imgRef.current?.complete) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    }
  }, [finalSrc, isInView, isLocalAsset]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-950 ${className}`}
      style={{ aspectRatio: finalAspect }}
    >
      {/* 1. Base Layer: Instant SVG / Dominant Color Background */}
      <div 
        className="absolute inset-0 bg-slate-950 z-0"
        style={{
          backgroundColor: dominantColor || imageData?.themeColor || '#0f172a'
        }}
      />

      {/* 2. Blur-up Low-Resolution Placeholder Layer */}
      {!isLocalAsset && (
        <img
          src={finalBlur}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-center transform scale-105 filter blur-xl transition-opacity duration-700 ease-out z-0 pointer-events-none ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* 3. Full Resolution Image with Crossfade (Loaded only when in view or eager) */}
      {isInView && !hasError ? (
        <img
          ref={imgRef}
          src={finalSrc}
          srcSet={finalSrcSet}
          sizes={finalSizes}
          alt={finalAlt}
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-in-out z-[1] ${
            isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] filter blur-sm'
          } ${imgClassName}`}
          {...restProps}
        />
      ) : isInView && hasError ? (
        /* Graceful Fallback if Network Drop occurs */
        <img
          src="/assets/aistudio/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg"
          alt={finalAlt}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 z-[1]"
        />
      ) : null}

      {/* Optional Gradient Overlay for High Text Readability */}
      {showGradientOverlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/30 z-[2] pointer-events-none" />
      )}

      {/* Embedded Children (Text, Badges, Search Bars, etc.) */}
      {children && (
        <div className="relative z-[3] w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
};
