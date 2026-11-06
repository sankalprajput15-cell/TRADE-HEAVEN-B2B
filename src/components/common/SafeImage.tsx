import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Factory, User, Building2, Package, ShieldCheck, Cpu, Flame, Wheat, Scissors, Upload, Image as ImageIcon, X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { getAutoAltText } from '../../utils/imageSeo';
import {
  productImageManagerService,
  PRODUCT_IMAGE_SAVED_EVENT,
  PRODUCT_IMAGE_STORAGE_SAVED_EVENT,
  normalizeProductAssetUrl
} from '../../services/productImageManagerService';

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
  disableLiveUpload?: boolean;
}

// 100% verified, highly accessible cargo and oil ships port image
const EVENING_TANKER_PORT_IMAGE = '/assets/uploads/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg';

const FALLBACK_SEEDS: string[] = [
  EVENING_TANKER_PORT_IMAGE,
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'
];

const CATEGORY_POOLS: Record<string, string[]> = {
  JADE_GEMSTONE: [
    '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg',
    '/assets/uploads/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg'
  ],
  VANILLA: [
    '/assets/uploads/sidath-vimukthi-fIGw-jVGy5g-unsplash_c8b9928d.jpg',
    '/assets/uploads/sidath-vimukthi-jLQ6_9mMbjQ-unsplash_52b37684.jpg',
    '/assets/uploads/sidath-vimukthi-l5G_wxctMjA-unsplash_8846f366.jpg',
    '/assets/uploads/jocelyn-morales-GA6WtJ7DtSo-unsplash_0c56800e.jpg',
    '/assets/uploads/jocelyn-morales-TYA9f8hYEX4-unsplash_b1f3fbec.jpg',
    '/assets/uploads/kristy-an-ahfp3XOUnFQ-unsplash_c10d537c.jpg'
  ],
  AVOCADO: [
    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=80'
  ],
  BROCCOLI: [
    'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80'
  ],
  BAMBOO: [
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&auto=format&fit=crop&q=80'
  ],
  CASHEW: [
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600189020840-e9918c25269d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80'
  ],
  JAM: [
    'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
  ],
  GOLD: [
    'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=800&auto=format&fit=crop&q=80'
  ],
  COAL: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  ],
  FUEL_PETROLEUM: [
    '/assets/uploads/vecteezy_cargo-tanker-ship-marine-vessel-docking-and-oversea-berth_8017034_96d25d6f.jpg',
    '/assets/uploads/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'
  ],
  SEAFOOD: [
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80'
  ],
  CHEMICALS: [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&auto=format&fit=crop&q=80'
  ],
  AGRICULTURE: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
  ],
  MACHINERY: [
    '/assets/uploads/image002_50ab7837.png',
    '/assets/uploads/image003_6c1f0619.jpg',
    '/assets/uploads/image004_fa37a57a.png',
    '/assets/uploads/image005_20fe3db0.png',
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80'
  ],
  TEXTILES: [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80'
  ],
  HOTEL: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80'
  ],
  CONSTRUCTION: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  ],
  MEDICAL: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=80'
  ],
  ELECTRONICS: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  ],
  AUTOMOTIVE: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80'
  ],
  RENEWABLE: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop&q=80'
  ],
  INDUSTRIAL: [
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80'
  ]
};

const getCategoryPool = (categoryName?: string, titleName?: string): string[] => {
  const nameToSearch = `${categoryName || ''} ${titleName || ''}`.toUpperCase();
  
  if (nameToSearch.includes('JADE') || nameToSearch.includes('TURQUOISE') || nameToSearch.includes('CABOCHON') || nameToSearch.includes('GEMSTONE') || nameToSearch.includes('NEPHRITE')) {
    return CATEGORY_POOLS.JADE_GEMSTONE;
  }
  if (nameToSearch.includes('VANILLA') || nameToSearch.includes('BOURBON') || nameToSearch.includes('PLANIFOLIA')) {
    return CATEGORY_POOLS.VANILLA;
  }
  if (nameToSearch.includes('AVOCADO')) {
    return CATEGORY_POOLS.AVOCADO;
  }
  if (nameToSearch.includes('BROCCOLI') || nameToSearch.includes('CAULIFLOWER') || nameToSearch.includes('VEGETABLE')) {
    return CATEGORY_POOLS.BROCCOLI;
  }
  if (nameToSearch.includes('BAMBOO') || nameToSearch.includes('INCENSE') || nameToSearch.includes('AGARBATTI')) {
    return CATEGORY_POOLS.BAMBOO;
  }
  if (nameToSearch.includes('CASHEW') || nameToSearch.includes('ALMOND') || nameToSearch.includes('PISTACHIO') || nameToSearch.includes('WALNUT')) {
    return CATEGORY_POOLS.CASHEW;
  }
  if (nameToSearch.includes('JAM') || nameToSearch.includes('MARMALADE') || nameToSearch.includes('JELLY') || nameToSearch.includes('SUNFLOWER OIL') || nameToSearch.includes('COOKING OIL')) {
    return CATEGORY_POOLS.JAM;
  }
  if (nameToSearch.includes('GOLD') || nameToSearch.includes('BULLION') || nameToSearch.includes('INGOT') || nameToSearch.includes('DORE')) {
    return CATEGORY_POOLS.GOLD;
  }
  if (nameToSearch.includes('COAL') || nameToSearch.includes('ANTHRACITE') || nameToSearch.includes('BITUMINOUS') || nameToSearch.includes('LIGNITE') || nameToSearch.includes('BRIQUETTE')) {
    return CATEGORY_POOLS.COAL;
  }
  if (nameToSearch.includes('LOBSTER') || nameToSearch.includes('SEAFOOD') || nameToSearch.includes('FISH') || nameToSearch.includes('SHRIMP') || nameToSearch.includes('CRAB') || nameToSearch.includes('TUNA') || nameToSearch.includes('SALMON')) {
    return CATEGORY_POOLS.SEAFOOD;
  }
  if (nameToSearch.includes('DIESEL') || nameToSearch.includes('EN590') || nameToSearch.includes('ESPO') || nameToSearch.includes('CRUDE') || nameToSearch.includes('JET FUEL') || nameToSearch.includes('AVIATION') || nameToSearch.includes('PETROLEUM') || nameToSearch.includes('KEROSENE') || nameToSearch.includes('BITUMEN')) {
    return CATEGORY_POOLS.FUEL_PETROLEUM;
  }
  if (nameToSearch.includes('CHEM') || nameToSearch.includes('POLYMER') || nameToSearch.includes('SULPHUR') || nameToSearch.includes('UREA') || nameToSearch.includes('RESIN') || nameToSearch.includes('ACID') || nameToSearch.includes('PLASTIC') || nameToSearch.includes('ASPIRIN')) {
    return CATEGORY_POOLS.CHEMICALS;
  }
  if (nameToSearch.includes('HOTEL') || nameToSearch.includes('HOSPITALITY') || nameToSearch.includes('RESORT') || nameToSearch.includes('BEDDING')) {
    return CATEGORY_POOLS.HOTEL;
  }
  if (nameToSearch.includes('AGRI') || nameToSearch.includes('COMMOD') || nameToSearch.includes('WHEAT') || nameToSearch.includes('GRAIN') || nameToSearch.includes('CORN') || nameToSearch.includes('BEAN') || nameToSearch.includes('LENTIL') || nameToSearch.includes('COFFEE') || nameToSearch.includes('SUGAR') || nameToSearch.includes('RICE') || nameToSearch.includes('MAIZE') || nameToSearch.includes('COTTON') || nameToSearch.includes('JUTE') || nameToSearch.includes('SOY') || nameToSearch.includes('SPICE') || nameToSearch.includes('SEED') || nameToSearch.includes('FRUIT') || nameToSearch.includes('HARVEST')) {
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
  if (nameToSearch.includes('ELECTRON') || nameToSearch.includes('SEMICOND') || nameToSearch.includes('CHIP') || nameToSearch.includes('MOTHERBOARD') || nameToSearch.includes('CIRCUIT') || nameToSearch.includes('PHONE') || nameToSearch.includes('LAPTOP') || nameToSearch.includes('SOFTWARE') || nameToSearch.includes('HARDWARE') || nameToSearch.includes('GERMANIUM')) {
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

// Automatic image optimization utility (converts Unsplash images to auto WebP/AVIF format and responsive widths)
export const optimizeUnsplashUrl = (url: string, options: { width?: number; quality?: number; isThumbnail?: boolean } = {}) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('images.unsplash.com')) return url;

  const targetWidth = options.width || (options.isThumbnail ? 320 : 800);
  const targetQuality = options.quality || 70;
  const cleanBase = url.split('?')[0];

  return `${cleanBase}?auto=format&fit=crop&w=${targetWidth}&q=${targetQuality}`;
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

function checkIsAdminLiveEditActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const liveMode = localStorage.getItem('th_live_edit_mode') === 'true';
    if (!liveMode) return false;
    const rawUser = localStorage.getItem('th_admin_session_v1') || localStorage.getItem('th_session_user');
    if (!rawUser) return false;
    const parsed = JSON.parse(rawUser);
    const email = String(parsed?.email || '').toLowerCase();
    if (email === 'zac@otec.ltd' || email === 'zac@fadetech.com') return false;
    return parsed?.role === 'ADMIN' || parsed?.isVerifiedAdmin === true;
  } catch {
    return false;
  }
}

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
  disableLiveUpload = false,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hasIntersected, setHasIntersected] = useState<boolean>(true);
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLiveUploadActive, setIsLiveUploadActive] = useState<boolean>(() => checkIsAdminLiveEditActive());
  const [showLiveUploadModal, setShowLiveUploadModal] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>('');
  const [afterImageUrl, setAfterImageUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');

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

  const lastCandidateRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Always ensure hydrated from server (especially in Incognito)
    productImageManagerService.ensureHydrated().then(() => {
      if (isMounted) {
        setOverrideVersion(v => v + 1);
      }
    });

    const handleImageOverrideUpdate = () => {
      if (isMounted) {
        setAttemptIndex(0);
        setHasError(false);
        setOverrideVersion(v => v + 1);
      }
    };
    const handleLiveModeUpdate = () => {
      if (isMounted) {
        setIsLiveUploadActive(checkIsAdminLiveEditActive());
      }
    };

    window.addEventListener('tradeheaven_product_images_updated', handleImageOverrideUpdate);
    window.addEventListener(PRODUCT_IMAGE_SAVED_EVENT, handleImageOverrideUpdate);
    window.addEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handleImageOverrideUpdate);
    window.addEventListener('tradeheaven_image_saved_to_storage', handleImageOverrideUpdate);
    window.addEventListener('product_image_saved', handleImageOverrideUpdate);
    window.addEventListener('storage', handleImageOverrideUpdate);
    window.addEventListener('tradeheaven_live_edit_mode_changed', handleLiveModeUpdate);
    window.addEventListener('tradeheaven_auth_changed', handleLiveModeUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('tradeheaven_product_images_updated', handleImageOverrideUpdate);
      window.removeEventListener(PRODUCT_IMAGE_SAVED_EVENT, handleImageOverrideUpdate);
      window.removeEventListener(PRODUCT_IMAGE_STORAGE_SAVED_EVENT, handleImageOverrideUpdate);
      window.removeEventListener('tradeheaven_image_saved_to_storage', handleImageOverrideUpdate);
      window.removeEventListener('product_image_saved', handleImageOverrideUpdate);
      window.removeEventListener('storage', handleImageOverrideUpdate);
      window.removeEventListener('tradeheaven_live_edit_mode_changed', handleLiveModeUpdate);
      window.removeEventListener('tradeheaven_auth_changed', handleLiveModeUpdate);
    };
  }, []);

  // 2. Build prioritized candidate URLs list — ALWAYS respect effectiveSrc first!
  const candidates = useMemo(() => {
    const list: string[] = [];

    const effectiveSrc = productImageManagerService.resolveImageSrc({
      src,
      productId,
      productTitle: isLogoOrAvatar ? undefined : productTitle,
      category: isLogoOrAvatar ? undefined : category,
      imageIndex
    });

    if (effectiveSrc && typeof effectiveSrc === 'string' && effectiveSrc.trim()) {
      list.push(effectiveSrc.trim());
    }

    if (fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim() && !list.includes(fallbackSrc.trim())) {
      list.push(normalizeProductAssetUrl(fallbackSrc.trim()));
    }

    // Retrieve high-quality category pool
    const pool = getCategoryPool(category, productTitle || alt || resolvedAlt);
    const seedString = `${productId || ''}-${category || ''}-${productTitle || alt || 'industrial-product'}`;
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

    return list.length > 0 ? list : pool;
  }, [src, fallbackSrc, alt, category, productId, productTitle, imageIndex, isLogoOrAvatar, overrideVersion, resolvedAlt]);

  const primaryCandidate = candidates[0] || FALLBACK_SEEDS[0];
  const effectiveAttemptIndex = lastCandidateRef.current !== primaryCandidate ? 0 : attemptIndex;

  const currentCandidate = useMemo(() => {
    const raw = candidates[effectiveAttemptIndex] || FALLBACK_SEEDS[0];
    if (!raw || raw.startsWith('/assets/') || raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
    return optimizeUnsplashUrl(raw, {
      width: isThumbnail ? 320 : 800,
      quality: 70,
      isThumbnail
    });
  }, [candidates, effectiveAttemptIndex, isThumbnail]);

  useEffect(() => {
    if (lastCandidateRef.current !== primaryCandidate) {
      lastCandidateRef.current = primaryCandidate;
      setAttemptIndex(0);
      setHasError(false);
      setIsLoaded(false);
    }
  }, [primaryCandidate]);

  // Check if cached image loaded synchronously
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
    }
  }, [currentCandidate, hasIntersected]);

  const handleError = () => {
    if (effectiveAttemptIndex < candidates.length - 1) {
      setAttemptIndex(effectiveAttemptIndex + 1);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleOpenLiveUploader = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const overrideEntry = productId ? productImageManagerService.getState().overrides[productId] : undefined;
    setBeforeImageUrl(overrideEntry?.previousPrimary || currentCandidate || src || '');
    setAfterImageUrl(currentCandidate || src || '');
    setCustomUrlInput(currentCandidate || src || '');
    setUploadStatusMsg('');
    setShowLiveUploadModal(true);
  };

  const handleLiveFileSelected = async (file: File) => {
    setIsUploadingFile(true);
    setUploadStatusMsg('Uploading & syncing to server (Incognito ready)...');
    try {
      const oldImgBefore = currentCandidate || src || '';
      setBeforeImageUrl(oldImgBefore);
      const res = await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: 'jpg',
        quality: 0.92,
        productId: productId || undefined,
        oldUrlToReplace: !productId && (src || currentCandidate) ? (src || currentCandidate) : undefined
      });
      if (productId) {
        await productImageManagerService.setProductImage(productId, res.url);
      } else if (src || currentCandidate) {
        await productImageManagerService.replaceImageUrlEverywhere(src || currentCandidate, res.url);
      }
      await productImageManagerService.forceSyncToServer();
      setAfterImageUrl(res.url);
      setCustomUrlInput(res.url);
      setOverrideVersion(v => v + 1);
      setUploadStatusMsg('Uploaded & synced live! Visible immediately in Incognito & all tabs.');
    } catch (err: any) {
      setUploadStatusMsg(err?.message || 'Upload failed');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleApplyDirectUrl = async (targetUrl: string) => {
    const clean = targetUrl.trim();
    if (!clean) return;
    setIsUploadingFile(true);
    setUploadStatusMsg('Applying image & syncing to server...');
    try {
      const oldImgBefore = currentCandidate || src || '';
      if (oldImgBefore && oldImgBefore !== clean) {
        setBeforeImageUrl(oldImgBefore);
      }
      if (productId) {
        await productImageManagerService.setProductImage(productId, clean);
      } else if (src || currentCandidate) {
        await productImageManagerService.replaceImageUrlEverywhere(src || currentCandidate, clean);
      }
      await productImageManagerService.forceSyncToServer();
      setAfterImageUrl(clean);
      setCustomUrlInput(clean);
      setOverrideVersion(v => v + 1);
      setUploadStatusMsg('Image updated & synced live for Incognito!');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const showLiveButton = isLiveUploadActive && !disableLiveUpload && !isThumbnail;

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {/* Smooth non-blinking placeholder layer */}
      {(!isLoaded && !hasError) || !hasIntersected ? (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-1 pointer-events-none transition-opacity duration-300">
          {isLogoOrAvatar ? (
            <Building2 className="w-5 h-5 text-slate-300" />
          ) : (
            <Package className="w-5 h-5 text-slate-300" />
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
              key={currentCandidate}
              ref={imgRef}
              src={currentCandidate}
              alt={resolvedAlt || alt || 'Verified B2B Wholesale Product'}
              referrerPolicy="no-referrer"
              loading={props.loading || (isThumbnail ? 'eager' : 'lazy')}
              decoding={props.decoding || 'async'}
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full object-cover transition-opacity duration-200 ${imgClassName}`}
              {...props}
            />
          )}
        </>
      )}

      {/* Real-Time Live Edit & Upload Overlay Button */}
      {showLiveButton && (
        <button
          type="button"
          onClick={handleOpenLiveUploader}
          className="absolute bottom-2 left-2 z-30 px-2.5 py-1 rounded-lg bg-emerald-600/95 hover:bg-emerald-500 text-white text-[10px] font-black shadow-lg border border-emerald-300/60 flex items-center gap-1 cursor-pointer transition-all"
          title="Live Real-Time Upload & Change Image (Updates Everywhere + Incognito)"
        >
          <Upload className="w-3 h-3 shrink-0" />
          <span>Upload / Change</span>
        </button>
      )}

      {/* Built-in Real-Time Upload & Before/After Modal */}
      {showLiveUploadModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget) setShowLiveUploadModal(false);
            }}
          >
            <div
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Image Upload &amp; Before / After Comparison</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black truncate mt-0.5">
                    {productTitle || alt || (productId ? `Product ${productId}` : 'Page Image / Asset')}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {productId ? `Product ID: ${productId}` : `Target URL: ${(src || currentCandidate || '').slice(0, 60)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLiveUploadModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
                {/* BEFORE & AFTER SIDE-BY-SIDE PREVIEW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        BEFORE (Previous Image)
                      </span>
                    </div>
                    <div className="h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                      {beforeImageUrl ? (
                        <img
                          src={beforeImageUrl}
                          alt="Before upload"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No previous image</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        AFTER (Live Active Image)
                      </span>
                      {afterImageUrl && afterImageUrl !== beforeImageUrl && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Updated Live</span>
                        </span>
                      )}
                    </div>
                    <div className="h-40 rounded-xl overflow-hidden bg-white border-2 border-emerald-500 flex items-center justify-center">
                      {afterImageUrl ? (
                        <img
                          src={afterImageUrl}
                          alt="After upload"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Upload an image below</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Dropzone */}
                <label className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                  <Upload className="w-7 h-7 text-emerald-600 mb-1.5" />
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {isUploadingFile ? 'Uploading & Syncing to Server...' : 'Click to Upload New Image from Computer (Real-Time)'}
                  </span>
                  <span className="text-[11px] text-slate-600 mt-0.5">
                    Immediately updates this image on the page, saves Before/After history, and syncs for Incognito mode
                  </span>
                  <input
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg"
                    className="hidden"
                    disabled={isUploadingFile}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLiveFileSelected(file);
                      e.target.value = '';
                    }}
                  />
                </label>

                {uploadStatusMsg && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadStatusMsg}</span>
                  </div>
                )}

                {/* Direct URL or Media Library Quick Picker */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">
                    Or Paste Image URL / Asset Path &amp; Apply Immediately
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="/assets/uploads/... or https://..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      disabled={isUploadingFile}
                      onClick={() => handleApplyDirectUrl(customUrlInput)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      Apply URL
                    </button>
                  </div>
                </div>

                {/* Recent Uploaded Media Library */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">
                    Or Click Any Uploaded Image from Server Media Library
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {productImageManagerService.getState().mediaLibrary.slice(0, 18).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleApplyDirectUrl(item.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          afterImageUrl === item.url ? 'border-emerald-600 ring-2 ring-emerald-400/40' : 'border-slate-200 hover:border-blue-500'
                        }`}
                        title={item.name}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Changes are saved to server disk &amp; visible in Incognito immediately.
                </span>
                <button
                  type="button"
                  onClick={() => setShowLiveUploadModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

