import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Factory, User, Building2, Package, ShieldCheck, Cpu, Flame, Wheat, Scissors } from 'lucide-react';
import { getAutoAltText } from '../../utils/imageSeo';
import { productImageManagerService } from '../../services/productImageManagerService';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
  category?: string;
  productId?: string;
  productTitle?: string;
  supplierName?: string;
  origin?: string;
  imageIndex?: number;
  totalImages?: number;
  isThumbnail?: boolean;
  type?: 'product' | 'logo' | 'avatar' | 'category' | 'rfq';
}

// 100% verified, highly accessible cargo and oil ships port image
const EVENING_TANKER_PORT_IMAGE = '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg';

const FALLBACK_SEEDS: string[] = [
  EVENING_TANKER_PORT_IMAGE,
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'
];

const CATEGORY_POOLS: Record<string, string[]> = {
  GOLD: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  ],
  COAL: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80'
  ],
  SEAFOOD: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80'
  ],
  CHEMICALS: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
  ],
  AGRICULTURE: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  ],
  MACHINERY: [
    EVENING_TANKER_PORT_IMAGE
  ],
  TEXTILES: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80'
  ],
  CONSTRUCTION: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  ],
  MEDICAL: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'
  ],
  ELECTRONICS: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  ],
  AUTOMOTIVE: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80'
  ],
  RENEWABLE: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80'
  ],
  INDUSTRIAL: [
    EVENING_TANKER_PORT_IMAGE,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
  ]
};

const getCategoryPool = (categoryName?: string, titleName?: string): string[] => {
  const nameToSearch = `${categoryName || ''} ${titleName || ''}`.toUpperCase();
  
  if (nameToSearch.includes('GOLD') || nameToSearch.includes('BULLION') || nameToSearch.includes('INGOT') || nameToSearch.includes('DORE')) {
    return CATEGORY_POOLS.GOLD;
  }
  if (nameToSearch.includes('COAL') || nameToSearch.includes('ANTHRACITE') || nameToSearch.includes('BITUMINOUS') || nameToSearch.includes('LIGNITE')) {
    return CATEGORY_POOLS.COAL;
  }
  if (nameToSearch.includes('LOBSTER') || nameToSearch.includes('SEAFOOD') || nameToSearch.includes('FISH') || nameToSearch.includes('SHRIMP') || nameToSearch.includes('CRAB') || nameToSearch.includes('TUNA') || nameToSearch.includes('SALMON')) {
    return CATEGORY_POOLS.SEAFOOD;
  }
  if (nameToSearch.includes('CHEM') || nameToSearch.includes('POLYMER') || nameToSearch.includes('SULPHUR') || nameToSearch.includes('DIESEL') || nameToSearch.includes('OIL') || nameToSearch.includes('FUEL') || nameToSearch.includes('GAS') || nameToSearch.includes('UREA') || nameToSearch.includes('RESIN') || nameToSearch.includes('PETROLEUM') || nameToSearch.includes('EN590') || nameToSearch.includes('JET') || nameToSearch.includes('KEROSENE') || nameToSearch.includes('ACID') || nameToSearch.includes('PLASTIC') || nameToSearch.includes('ASPIRIN')) {
    return CATEGORY_POOLS.CHEMICALS;
  }
  if (nameToSearch.includes('AGRI') || nameToSearch.includes('COMMOD') || nameToSearch.includes('WHEAT') || nameToSearch.includes('GRAIN') || nameToSearch.includes('CORN') || nameToSearch.includes('BEAN') || nameToSearch.includes('LENTIL') || nameToSearch.includes('COFFEE') || nameToSearch.includes('SUGAR') || nameToSearch.includes('RICE') || nameToSearch.includes('MAIZE') || nameToSearch.includes('BAMBOO') || nameToSearch.includes('COTTON') || nameToSearch.includes('JUTE') || nameToSearch.includes('SOY') || nameToSearch.includes('SPICE') || nameToSearch.includes('SEED') || nameToSearch.includes('FRUIT') || nameToSearch.includes('HARVEST') || nameToSearch.includes('VEGETABLE') || nameToSearch.includes('CASHEW') || nameToSearch.includes('VANILLA') || nameToSearch.includes('SUNFLOWER') || nameToSearch.includes('JAM') || nameToSearch.includes('HUSK')) {
    return CATEGORY_POOLS.AGRICULTURE;
  }
  if (nameToSearch.includes('MACHINE') || nameToSearch.includes('EQUIP') || nameToSearch.includes('CNC') || nameToSearch.includes('TOOL') || nameToSearch.includes('FORG') || nameToSearch.includes('WELD') || nameToSearch.includes('ROBOT') || nameToSearch.includes('AUTOMAT') || nameToSearch.includes('ENGINE') || nameToSearch.includes('PUMP') || nameToSearch.includes('LASER') || nameToSearch.includes('CUTTER') || nameToSearch.includes('MOTOR') || nameToSearch.includes('EXCAVATOR') || nameToSearch.includes('CONVEYOR')) {
    return CATEGORY_POOLS.MACHINERY;
  }
  if (nameToSearch.includes('TEXTILE') || nameToSearch.includes('GARM') || nameToSearch.includes('FABRIC') || nameToSearch.includes('CLOTH') || nameToSearch.includes('YARN') || nameToSearch.includes('SPOOL') || nameToSearch.includes('WOOL') || nameToSearch.includes('SILK') || nameToSearch.includes('POLYESTER') || nameToSearch.includes('LINEN') || nameToSearch.includes('ATELIER') || nameToSearch.includes('TAILOR')) {
    return CATEGORY_POOLS.TEXTILES;
  }
  if (nameToSearch.includes('BUILD') || nameToSearch.includes('CONSTRUCT') || nameToSearch.includes('CONCRETE') || nameToSearch.includes('CEMENT') || nameToSearch.includes('LUMBER') || nameToSearch.includes('WOOD') || nameToSearch.includes('STEEL') || nameToSearch.includes('BEAM') || nameToSearch.includes('IRON') || nameToSearch.includes('COPPER') || nameToSearch.includes('ALUMINUM') || nameToSearch.includes('BILLET') || nameToSearch.includes('SCAFFOLD') || nameToSearch.includes('REBAR') || nameToSearch.includes('PIPE') || nameToSearch.includes('SCRAP')) {
    return CATEGORY_POOLS.CONSTRUCTION;
  }
  if (nameToSearch.includes('MEDIC') || nameToSearch.includes('DIAGNOS') || nameToSearch.includes('PHARMA') || nameToSearch.includes('GLOVE') || nameToSearch.includes('MASK') || nameToSearch.includes('SYRINGE') || nameToSearch.includes('HEALTH') || nameToSearch.includes('TEST') || nameToSearch.includes('VIAL') || nameToSearch.includes('BIOTECH') || nameToSearch.includes('CLINIC') || nameToSearch.includes('CAPSULE')) {
    return CATEGORY_POOLS.MEDICAL;
  }
  if (nameToSearch.includes('ELECTRON') || nameToSearch.includes('SEMICOND') || nameToSearch.includes('CHIP') || nameToSearch.includes('MOTHERBOARD') || nameToSearch.includes('CIRCUIT') || nameToSearch.includes('PHONE') || nameToSearch.includes('LAPTOP') || nameToSearch.includes('SOFTWARE') || nameToSearch.includes('HARDWARE')) {
    return CATEGORY_POOLS.ELECTRONICS;
  }
  if (nameToSearch.includes('AUTO') || nameToSearch.includes('VEHIC') || nameToSearch.includes('CAR') || nameToSearch.includes('TRUCK') || nameToSearch.includes('TIRE') || nameToSearch.includes('BATTERY') || nameToSearch.includes('LITHIUM')) {
    return CATEGORY_POOLS.AUTOMOTIVE;
  }
  if (nameToSearch.includes('SOLAR') || nameToSearch.includes('RENEW') || nameToSearch.includes('ENERGY') || nameToSearch.includes('WIND') || nameToSearch.includes('TURBINE') || nameToSearch.includes('POWER')) {
    return CATEGORY_POOLS.RENEWABLE;
  }
  if (nameToSearch.includes('RAW') || nameToSearch.includes('MINER') || nameToSearch.includes('METAL') || nameToSearch.includes('INDUST') || nameToSearch.includes('WAREHOUSE') || nameToSearch.includes('LOGISTIC') || nameToSearch.includes('PORT') || nameToSearch.includes('SHIPPING') || nameToSearch.includes('CARGO')) {
    return CATEGORY_POOLS.INDUSTRIAL;
  }
  return FALLBACK_SEEDS;
};

// Deterministic string hashing
const getDeterministicHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  imgClassName = '',
  category,
  productId,
  productTitle,
  supplierName,
  origin,
  imageIndex,
  totalImages,
  isThumbnail,
  type = 'product',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hasIntersected, setHasIntersected] = useState<boolean>(false);
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (typeof window === 'undefined') {
      setHasIntersected(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setHasIntersected(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '250px', // Load 250px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Automatically compute descriptive, WCAG and SEO-optimized alt text
  const resolvedAlt = useMemo(() => {
    return getAutoAltText({
      alt,
      title: productTitle || (typeof props.title === 'string' ? props.title : undefined),
      category,
      supplierName,
      type,
      index: imageIndex,
      total: totalImages,
      isThumbnail
    });
  }, [alt, productTitle, props.title, category, supplierName, type, imageIndex, totalImages, isThumbnail]);

  // 1. Detect if this is an avatar or logo
  const isLogoOrAvatar = useMemo(() => {
    if (type === 'logo' || type === 'avatar') return true;
    const lowerSrc = (src || '').toLowerCase();
    const lowerAlt = (resolvedAlt || alt || '').toLowerCase();
    return (
      lowerSrc.includes('logo') ||
      lowerSrc.includes('avatar') ||
      lowerSrc.includes('profile') ||
      lowerSrc.includes('user') ||
      lowerAlt.includes('logo') ||
      lowerAlt.includes('avatar') ||
      lowerAlt.includes('profile') ||
      lowerAlt.includes('user')
    );
  }, [src, alt, resolvedAlt, type]);

  const [overrideVersion, setOverrideVersion] = useState(0);

  useEffect(() => {
    const handleImageOverrideUpdate = () => {
      setOverrideVersion(v => v + 1);
      setAttemptIndex(0);
      setHasError(false);
    };
    window.addEventListener('tradeheaven_product_images_updated', handleImageOverrideUpdate);
    return () => window.removeEventListener('tradeheaven_product_images_updated', handleImageOverrideUpdate);
  }, []);

  // 2. Build prioritized candidate URLs list
  const candidates = useMemo(() => {
    const list: string[] = [];

    const effectiveSrc = !isLogoOrAvatar
      ? productImageManagerService.resolveImageSrc({
          src,
          productId,
          productTitle,
          category,
          imageIndex
        })
      : src;

    // Prioritize effectiveSrc if non-empty and not a known generic broken string
    if (effectiveSrc && typeof effectiveSrc === 'string' && effectiveSrc.trim() && !effectiveSrc.includes('1579541300958-c0b7d3f114c0')) {
      const cleanSrc = effectiveSrc.trim();
      if (cleanSrc.includes('1518709268805') || cleanSrc.includes('518709268805')) {
        list.push(EVENING_TANKER_PORT_IMAGE);
      } else {
        list.push(cleanSrc);
      }
    }

    if (fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim()) {
      list.push(fallbackSrc.trim());
    }

    if (isLogoOrAvatar) {
      // Add reliable generic business avatar / logo seeds
      list.push(EVENING_TANKER_PORT_IMAGE);
      list.push('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80');
      return list;
    }

    // Retrieve high-quality category pool
    const pool = getCategoryPool(category, alt);
    const seedString = `${productId || ''}-${category || ''}-${alt || 'industrial-product'}`;
    const hash = getDeterministicHash(seedString);

    const primaryIndex = hash % pool.length;
    const primaryImageUrl = pool[primaryIndex];
    if (!list.includes(primaryImageUrl)) {
      list.push(primaryImageUrl);
    }

    // Add remaining pool items as backup candidates
    for (let i = 1; i < pool.length; i++) {
      const backupIndex = (primaryIndex + i) % pool.length;
      const backupUrl = pool[backupIndex];
      if (!list.includes(backupUrl)) {
        list.push(backupUrl);
      }
    }

    // Add fallback seeds
    for (const seed of FALLBACK_SEEDS) {
      if (!list.includes(seed)) {
        list.push(seed);
      }
    }

    return list.length > 0 ? list : FALLBACK_SEEDS;
  }, [src, fallbackSrc, alt, category, productId, productTitle, imageIndex, isLogoOrAvatar, overrideVersion]);

  const currentCandidate = useMemo(() => {
    const raw = candidates[attemptIndex] || FALLBACK_SEEDS[0];
    if (!raw || raw.startsWith('/assets/') || raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
    const sep = raw.includes('?') ? '&' : '?';
    return `${raw}${sep}v=1`;
  }, [candidates, attemptIndex]);

  useEffect(() => {
    setAttemptIndex(0);
    setIsLoaded(false);
    setHasError(false);
  }, [src, fallbackSrc, category, productId]);

  // Check if cached image loaded synchronously
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
    }
  }, [currentCandidate, hasIntersected]);

  const handleError = () => {
    if (attemptIndex < candidates.length - 1) {
      setAttemptIndex(prev => prev + 1);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {/* Subtle loader skeleton */}
      {(!isLoaded && !hasError) || !hasIntersected ? (
        <div className="absolute inset-0 bg-slate-200/60 animate-pulse flex items-center justify-center z-1">
          {isLogoOrAvatar ? (
            <Building2 className="w-5 h-5 text-slate-400" />
          ) : (
            <Package className="w-5 h-5 text-slate-400" />
          )}
        </div>
      ) : null}

      {hasIntersected && (
        <>
          {hasError ? (
            <div className="w-full h-full min-h-[44px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-2 text-white text-center select-none">
              <Factory className="w-4 h-4 text-amber-400 shrink-0 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-200 truncate max-w-full px-1">
                {resolvedAlt || alt || 'Verified Industrial Export'}
              </span>
              <span className="text-[8px] text-amber-400/90 font-mono uppercase tracking-wider">
                Audited Exporter
              </span>
            </div>
          ) : (
            <img
              ref={imgRef}
              src={currentCandidate}
              alt={resolvedAlt || alt || 'Verified B2B Wholesale Product'}
              referrerPolicy="no-referrer"
              loading={props.loading || 'lazy'}
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full object-cover transition-opacity duration-200 ${imgClassName}`}
              {...props}
            />
          )}
        </>
      )}
    </div>
  );
};

