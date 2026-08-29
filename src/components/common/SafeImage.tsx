import React, { useState, useEffect } from 'react';
import { Factory, Box, ShieldCheck } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
}

const FALLBACK_SEEDS: string[] = [
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
];

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  imgClassName = '',
  ...props
}) => {
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Build candidate URL list with deterministic seed offset based on alt text
  const candidates = React.useMemo(() => {
    const list: string[] = [];
    if (src && typeof src === 'string' && src.trim()) {
      list.push(src.trim());
    }
    if (fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim() && !list.includes(fallbackSrc.trim())) {
      list.push(fallbackSrc.trim());
    }
    
    // Deterministic offset based on alt string hash
    const hash = (alt || 'product').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offset = hash % FALLBACK_SEEDS.length;
    for (let i = 0; i < FALLBACK_SEEDS.length; i++) {
      const seed = FALLBACK_SEEDS[(offset + i) % FALLBACK_SEEDS.length];
      if (!list.includes(seed)) {
        list.push(seed);
      }
    }
    return list;
  }, [src, fallbackSrc, alt]);

  useEffect(() => {
    setAttemptIndex(0);
    setIsLoaded(false);
    setHasError(false);
  }, [src, fallbackSrc]);

  const currentUrl = candidates[attemptIndex] || FALLBACK_SEEDS[0];

  const handleError = () => {
    if (attemptIndex < candidates.length - 1) {
      setAttemptIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center">
          <Factory className="w-5 h-5 text-slate-400/50" />
        </div>
      )}

      {hasError ? (
        <div className="w-full h-full min-h-[40px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-2 text-white text-center select-none">
          <Factory className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mb-0.5" />
          <span className="text-[9px] font-bold text-slate-200 truncate max-w-full px-1">
            {alt || 'Verified Industrial Sector'}
          </span>
          <span className="text-[8px] text-amber-400/90 font-mono uppercase tracking-wider hidden sm:block">
            Direct Exporter
          </span>
        </div>
      ) : (
        <img
          src={currentUrl}
          alt={alt || 'Industrial product or sector'}
          referrerPolicy="no-referrer"
          loading={props.loading || (props.fetchPriority === 'high' ? 'eager' : 'lazy')}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  );
};

