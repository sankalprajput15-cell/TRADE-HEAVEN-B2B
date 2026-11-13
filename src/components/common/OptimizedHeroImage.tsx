import React, { useState, useEffect, useRef } from 'react';
import { OptimizedHeroImageData } from '../../utils/heroImageOptimization';
import { optimizeImageUrl, normalizeProductAssetUrl } from '../../services/productImageManagerService';

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

const DEFAULT_HERO_IMAGE = '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg';

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
  const rawSrc =
    src === 'vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034.jpg'
      ? DEFAULT_HERO_IMAGE
      : src;
  const resolvedSrc = normalizeProductAssetUrl(rawSrc) || normalizeProductAssetUrl(imageData?.url) || DEFAULT_HERO_IMAGE;
  const finalSrc = optimizeImageUrl(resolvedSrc, { width: 1280 });
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const finalAlt = alt || imageData?.alt || 'Trade Heaven B2B Wholesale Hero';
  const finalAspect = aspectRatio || imageData?.aspectRatio || '16/9';

  const localSrcSet =
    resolvedSrc.startsWith('/assets/uploads/') && !resolvedSrc.toLowerCase().endsWith('.svg')
      ? `${optimizeImageUrl(resolvedSrc, { width: 720 })} 720w, ${optimizeImageUrl(resolvedSrc, { width: 1280 })} 1280w`
      : undefined;
  const rawSrcSet = restProps.srcSet || localSrcSet || imageData?.srcSet;
  const finalSrcSet = rawSrcSet && rawSrcSet.trim() !== '' && !rawSrcSet.endsWith(' 1x') ? rawSrcSet : undefined;
  const finalSizes = finalSrcSet ? (restProps.sizes || imageData?.sizes || '100vw') : undefined;

  useEffect(() => {
    setHasError(false);
  }, [finalSrc]);

  return (
    <div
      className={`relative overflow-hidden bg-slate-950 ${className}`}
      style={{ aspectRatio: finalAspect }}
    >
      {/* Base Layer: Instant Dominant Color Background */}
      <div
        className="absolute inset-0 bg-slate-950 z-0"
        style={{
          backgroundColor: dominantColor || imageData?.themeColor || '#0f172a'
        }}
      />

      {/* Full Resolution Optimized WebP Image */}
      {!hasError ? (
        <img
          ref={imgRef}
          src={finalSrc}
          srcSet={finalSrcSet}
          sizes={finalSizes}
          alt={finalAlt}
          decoding={eager ? 'sync' : 'async'}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center z-[1] ${imgClassName}`}
          {...restProps}
        />
      ) : (
        <img
          src={optimizeImageUrl(DEFAULT_HERO_IMAGE, { width: 1280 })}
          alt={finalAlt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 z-[1]"
        />
      )}

      {showGradientOverlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/30 z-[2] pointer-events-none" />
      )}

      {children && (
        <div className="relative z-[3] w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
};
