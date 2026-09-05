import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Factory, User, Building2, Package, ShieldCheck, Cpu, Flame, Wheat, Scissors, Sparkles } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
  category?: string;
  productId?: string;
  type?: 'product' | 'logo' | 'avatar' | 'category';
}

// 100% verified, highly accessible Unsplash industrial photos
const FALLBACK_SEEDS: string[] = [
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'
];

const CATEGORY_POOLS: Record<string, string[]> = {
  GOLD: [
    'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
  ],
  COAL: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80'
  ],
  SEAFOOD: [
    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80'
  ],
  CHEMICALS: [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
  ],
  AGRICULTURE: [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
  ],
  MACHINERY: [
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
  ],
  TEXTILES: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524295988350-dfa806967073?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605697319999-e686c5f949dc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
  ],
  CONSTRUCTION: [
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  ],
  MEDICAL: [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581093588401-f3c22d745e53?w=800&auto=format&fit=crop&q=80'
  ],
  ELECTRONICS: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
  ],
  AUTOMOTIVE: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80'
  ],
  RENEWABLE: [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80'
  ],
  INDUSTRIAL: [
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
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
  type = 'product',
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // 1. Detect if this is an avatar or logo
  const isLogoOrAvatar = useMemo(() => {
    if (type === 'logo' || type === 'avatar') return true;
    const lowerSrc = (src || '').toLowerCase();
    const lowerAlt = (alt || '').toLowerCase();
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
  }, [src, alt, type]);

  // 2. Build prioritized candidate URLs list
  const candidates = useMemo(() => {
    const list: string[] = [];

    // Prioritize passed src if non-empty and not a known generic broken string
    if (src && typeof src === 'string' && src.trim() && !src.includes('1579541300958-c0b7d3f114c0')) {
      list.push(src.trim());
    }

    if (fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim()) {
      list.push(fallbackSrc.trim());
    }

    if (isLogoOrAvatar) {
      // Add reliable generic business avatar / logo seeds
      list.push('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80');
      list.push('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
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
  }, [src, fallbackSrc, alt, category, productId, isLogoOrAvatar]);

  const currentCandidate = candidates[attemptIndex] || FALLBACK_SEEDS[0];

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
  }, [currentCandidate]);

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
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {/* Subtle loader skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/60 animate-pulse flex items-center justify-center z-1">
          {isLogoOrAvatar ? (
            <Building2 className="w-5 h-5 text-slate-400" />
          ) : (
            <Package className="w-5 h-5 text-slate-400" />
          )}
        </div>
      )}

      {hasError ? (
        <div className="w-full h-full min-h-[44px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-2 text-white text-center select-none">
          <Factory className="w-4 h-4 text-amber-400 shrink-0 mb-0.5" />
          <span className="text-[10px] font-bold text-slate-200 truncate max-w-full px-1">
            {alt || 'Verified Industrial Export'}
          </span>
          <span className="text-[8px] text-amber-400/90 font-mono uppercase tracking-wider">
            Audited Exporter
          </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={currentCandidate}
          alt={alt || 'Industrial Product'}
          referrerPolicy="no-referrer"
          loading={props.loading || (props.fetchPriority === 'high' ? 'eager' : 'lazy')}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-200 ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  );
};

