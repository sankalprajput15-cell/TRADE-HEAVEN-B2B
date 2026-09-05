import React, { useState, useEffect } from 'react';
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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const finalSrc = src || imageData?.url || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80';
  const finalBlur = blurDataUrl || imageData?.blurDataUrl || createSvgBlurPlaceholder(1200, 675, dominantColor || imageData?.themeColor || '#0f172a');
  const finalAlt = alt || imageData?.alt || 'Trade Heaven B2B Wholesale Hero';
  const finalAspect = aspectRatio || imageData?.aspectRatio || '16/9';
  const finalSrcSet = restProps.srcSet || imageData?.srcSet;
  const finalSizes = restProps.sizes || imageData?.sizes || '100vw';

  // Reset loading state when source changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [finalSrc]);

  return (
    <div
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
      <img
        src={finalBlur}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover object-center transform scale-105 filter blur-xl transition-opacity duration-700 ease-out z-0 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 3. Full Resolution Image with Crossfade */}
      {!hasError ? (
        <img
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
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out z-[1] ${
            isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] filter blur-sm'
          } ${imgClassName}`}
          {...restProps}
        />
      ) : (
        /* Graceful Fallback if Network Drop occurs */
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
          alt={finalAlt}
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
