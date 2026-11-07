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
  eager = false,
  showGradientOverlay = false,
  children,
  ...restProps
}) => {
  const rawSrc = src === 'vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034.jpg'
    ? '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg'
    : src;
  const resolvedSrc = rawSrc ? rawSrc.replace(/^\/assets\/aistudio\//, '/assets/uploads/') : undefined;
  const finalSrc = resolvedSrc || imageData?.url?.replace(/^\/assets\/aistudio\//, '/assets/uploads/') || '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg';
  const [hasError, setHasError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const finalAlt = alt || imageData?.alt || 'Trade Heaven B2B Wholesale Hero';
  const finalAspect = aspectRatio || imageData?.aspectRatio || '16/9';
  const rawSrcSet = restProps.srcSet || imageData?.srcSet;
  const finalSrcSet = rawSrcSet && rawSrcSet.trim() !== '' && !rawSrcSet.endsWith(' 1x') ? rawSrcSet : undefined;
  const finalSizes = finalSrcSet ? (restProps.sizes || imageData?.sizes || '100vw') : undefined;

  useEffect(() => {
    setHasError(false);
    setIsInView(true);
  }, [finalSrc]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-950 ${className}`}
      style={{ aspectRatio: finalAspect }}
    >
      {/* 1. Base Layer: Instant Dominant Color Background */}
      <div 
        className="absolute inset-0 bg-slate-950 z-0"
        style={{
          backgroundColor: dominantColor || imageData?.themeColor || '#0f172a'
        }}
      />

      {/* 2. Full Resolution Image (Instant, non-blinking render) */}
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
          onError={() => {
            setHasError(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center z-[1] ${imgClassName}`}
          {...restProps}
        />
      ) : (
        /* Graceful Fallback if Network Drop occurs */
        <img
          src="/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg"
          alt={finalAlt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 z-[1]"
        />
      )}

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
