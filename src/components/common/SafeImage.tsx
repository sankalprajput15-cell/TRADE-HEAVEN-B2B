import React, { useState, useEffect } from 'react';
import { Factory, User, ShieldCheck } from 'lucide-react';

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

const CATEGORY_POOLS: Record<string, string[]> = {
  CHEMICALS: [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80'
  ],
  AGRICULTURE: [
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592997573562-b76ee297f294?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
  ],
  MACHINERY: [
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513828742140-ccaa34f3165a?w=800&auto=format&fit=crop&q=80'
  ],
  TEXTILES: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524295988350-dfa806967073?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605697319999-e686c5f949dc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558258695-2e3893b01140?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565192647048-f997ded879ab?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80'
  ],
  CONSTRUCTION: [
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80'
  ],
  MEDICAL: [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581093588401-f3c22d745e53?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1631553127989-10c0e5a9ee43?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=800&auto=format&fit=crop&q=80'
  ],
  ELECTRONICS: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80'
  ],
  AUTOMOTIVE: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format&fit=crop&q=80'
  ],
  RENEWABLE: [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548504769-900b70ed122e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80'
  ],
  INDUSTRIAL: [
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
  ]
};

const getCategoryPool = (categoryName?: string, titleName?: string): string[] => {
  const nameToSearch = `${categoryName || ''} ${titleName || ''}`.toUpperCase();
  
  if (nameToSearch.includes('CHEM') || nameToSearch.includes('POLYMER') || nameToSearch.includes('SULPHUR') || nameToSearch.includes('DIESEL') || nameToSearch.includes('OIL') || nameToSearch.includes('FUEL') || nameToSearch.includes('GAS') || nameToSearch.includes('UREA') || nameToSearch.includes('RESIN') || nameToSearch.includes('PETROLEUM') || nameToSearch.includes('EN590') || nameToSearch.includes('JET') || nameToSearch.includes('KEROSENE') || nameToSearch.includes('ACID') || nameToSearch.includes('PLASTIC') || nameToSearch.includes('ASPIRIN')) {
    return CATEGORY_POOLS.CHEMICALS;
  }
  if (nameToSearch.includes('AGRI') || nameToSearch.includes('COMMOD') || nameToSearch.includes('WHEAT') || nameToSearch.includes('GRAIN') || nameToSearch.includes('CORN') || nameToSearch.includes('BEAN') || nameToSearch.includes('LENTIL') || nameToSearch.includes('COFFEE') || nameToSearch.includes('SUGAR') || nameToSearch.includes('RICE') || nameToSearch.includes('MAIZE') || nameToSearch.includes('BAMBOO') || nameToSearch.includes('COTTON') || nameToSearch.includes('JUTE') || nameToSearch.includes('SOY') || nameToSearch.includes('SPICE') || nameToSearch.includes('SEED') || nameToSearch.includes('FRUIT') || nameToSearch.includes('HARVEST') || nameToSearch.includes('VEGETABLE')) {
    return CATEGORY_POOLS.AGRICULTURE;
  }
  if (nameToSearch.includes('MACHINE') || nameToSearch.includes('EQUIP') || nameToSearch.includes('CNC') || nameToSearch.includes('TOOL') || nameToSearch.includes('FORG') || nameToSearch.includes('WELD') || nameToSearch.includes('ROBOT') || nameToSearch.includes('AUTOMAT') || nameToSearch.includes('ENGINE') || nameToSearch.includes('PUMP') || nameToSearch.includes('LASER') || nameToSearch.includes('CUTTER') || nameToSearch.includes('MOTOR') || nameToSearch.includes('EXCAVATOR')) {
    return CATEGORY_POOLS.MACHINERY;
  }
  if (nameToSearch.includes('TEXTILE') || nameToSearch.includes('GARM') || nameToSearch.includes('FABRIC') || nameToSearch.includes('CLOTH') || nameToSearch.includes('YARN') || nameToSearch.includes('SPOOL') || nameToSearch.includes('WOOL') || nameToSearch.includes('SILK') || nameToSearch.includes('POLYESTER') || nameToSearch.includes('LINEN') || nameToSearch.includes('ATELIER') || nameToSearch.includes('TAILOR')) {
    return CATEGORY_POOLS.TEXTILES;
  }
  if (nameToSearch.includes('BUILD') || nameToSearch.includes('CONSTRUCT') || nameToSearch.includes('CONCRETE') || nameToSearch.includes('CEMENT') || nameToSearch.includes('LUMBER') || nameToSearch.includes('WOOD') || nameToSearch.includes('STEEL') || nameToSearch.includes('BEAM') || nameToSearch.includes('IRON') || nameToSearch.includes('COPPER') || nameToSearch.includes('ALUMINUM') || nameToSearch.includes('BILLET') || nameToSearch.includes('SCAFFOLD') || nameToSearch.includes('REBAR') || nameToSearch.includes('PIPE')) {
    return CATEGORY_POOLS.CONSTRUCTION;
  }
  if (nameToSearch.includes('MEDIC') || nameToSearch.includes('DIAGNOS') || nameToSearch.includes('PHARMA') || nameToSearch.includes('GLOVE') || nameToSearch.includes('MASK') || nameToSearch.includes('SYRINGE') || nameToSearch.includes('HEALTH') || nameToSearch.includes('TEST') || nameToSearch.includes('VIAL') || nameToSearch.includes('BIOTECH') || nameToSearch.includes('CLINIC') || nameToSearch.includes('CAPSULE')) {
    return CATEGORY_POOLS.MEDICAL;
  }
  if (nameToSearch.includes('ELECTRON') || nameToSearch.includes('SEMICOND') || nameToSearch.includes('CHIP') || nameToSearch.includes('MOTHERBOARD') || nameToSearch.includes('CIRCUIT') || nameToSearch.includes('PHONE') || nameToSearch.includes('LAPTOP')) {
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

// Simple deterministic string hashing helper
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
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // 1. Detect if this is an avatar or logo to skip randomized product overrides
  const isLogoOrAvatar = React.useMemo(() => {
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

  // 2. Build candidate URLs list with perfect category mapping and deterministic hashing
  const candidates = React.useMemo(() => {
    const list: string[] = [];

    // For logos and avatars, strictly prioritize the original source
    if (isLogoOrAvatar) {
      if (src && typeof src === 'string' && src.trim()) {
        list.push(src.trim());
      }
      if (fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim()) {
        list.push(fallbackSrc.trim());
      }
      return list;
    }

    // For products, retrieve the corresponding high-quality category pool
    const pool = getCategoryPool(category, alt);

    // Create a robust seed combining the product ID, category name, and product title
    const seedString = `${productId || ''}-${category || ''}-${alt || 'industrial-product'}`;
    const hash = getDeterministicHash(seedString);

    // Select a primary stable image from the matching pool
    const primaryIndex = hash % pool.length;
    const primaryImageUrl = pool[primaryIndex];
    list.push(primaryImageUrl);

    // Add other images from the pool as backup candidates to eliminate broken images
    for (let i = 1; i < pool.length; i++) {
      const backupIndex = (primaryIndex + i) % pool.length;
      list.push(pool[backupIndex]);
    }

    // Append the original source if available
    if (src && typeof src === 'string' && src.trim() && !list.includes(src.trim())) {
      list.push(src.trim());
    }

    return list;
  }, [src, fallbackSrc, alt, category, productId, isLogoOrAvatar]);

  useEffect(() => {
    setAttemptIndex(0);
    setIsLoaded(false);
    setHasError(false);
  }, [src, fallbackSrc, category, productId]);

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
      {/* Dynamic Skeletal Loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center">
          {isLogoOrAvatar ? (
            <User className="w-5 h-5 text-slate-400/50" />
          ) : (
            <Factory className="w-5 h-5 text-slate-400/50" />
          )}
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
