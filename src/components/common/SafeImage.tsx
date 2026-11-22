import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { User, Building2, Package, Upload, X, CheckCircle2, Sparkles } from 'lucide-react';
import { getAutoAltText } from '../../utils/imageSeo';
import {
  productImageManagerService,
  PRODUCT_IMAGE_SAVED_EVENT,
  normalizeProductAssetUrl,
  optimizeImageUrl,
  buildResponsiveImageSrcSet
} from '../../services/productImageManagerService';
import {
  fetchVisualProductImages,
  isGenericOrPlaceholderImageUrl,
  isMismatchedProductImageUrl,
  markBrokenExternalImageUrl,
  isBrokenExternalImageUrl,
  normalizeVisualQueryKey,
  autoUploadDisplayedProductImage,
  resolveLocalMirroredImageUrl
} from '../../services/visualProductImageService';

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
  priority?: boolean;
  targetWidth?: number;
  type?: 'product' | 'logo' | 'avatar' | 'category' | 'rfq';
  disableLiveUpload?: boolean;
}

export const optimizeUnsplashUrl = (
  url: string,
  options: { width?: number; quality?: number; isThumbnail?: boolean } = {}
) => {
  return optimizeImageUrl(url, options);
};

// Module-level shared status caches (prevents duplicate fade flashes & broken URL retries)
const LOADED_IMAGE_URLS = new Set<string>();
const FAILED_IMAGE_URLS = new Set<string>();

function checkIsAdminLiveEditActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const liveMode = localStorage.getItem('th_live_edit_mode') === 'true';
    if (!liveMode) return false;
    const rawUser = localStorage.getItem('th_verified_otp_session_v5_strict_admin');
    if (!rawUser) return false;
    const parsed = JSON.parse(rawUser);
    if (!parsed || typeof parsed !== 'object') return false;
    const email = String(parsed.email || '').trim().toLowerCase();
    const isRootAdminEmail =
      email === 'yr943334@gmail.com' ||
      email === 'sankalprajput15@gmail.com';
    return Boolean(
      isRootAdminEmail &&
        parsed.role === 'ADMIN' &&
        parsed.isVerifiedAdmin === true &&
        parsed.otpVerified === true &&
        typeof parsed.token === 'string' &&
        parsed.token.trim().length >= 8
    );
  } catch {
    return false;
  }
}

// Shared singleton listener hub so 50+ cards only register ONE set of window listeners
const overrideSubscribers = new Set<() => void>();
const liveModeSubscribers = new Set<(active: boolean) => void>();
let cachedLiveMode = typeof window !== 'undefined' ? checkIsAdminLiveEditActive() : false;
let hubInitialized = false;

function initSafeImageGlobalHub() {
  if (hubInitialized || typeof window === 'undefined') return;
  hubInitialized = true;

  if (!productImageManagerService.isHydrated()) {
    productImageManagerService.ensureHydrated().then(() => {
      overrideSubscribers.forEach(cb => cb());
    }).catch(() => {});
  }

  const notifyOverrides = () => {
    FAILED_IMAGE_URLS.clear();
    overrideSubscribers.forEach(cb => cb());
  };
  const notifyLiveMode = () => {
    cachedLiveMode = checkIsAdminLiveEditActive();
    liveModeSubscribers.forEach(cb => cb(cachedLiveMode));
  };

  window.addEventListener(PRODUCT_IMAGE_SAVED_EVENT, notifyOverrides);
  window.addEventListener('tradeheaven_product_images_updated', notifyOverrides);
  window.addEventListener('storage', notifyOverrides);
  window.addEventListener('tradeheaven_live_edit_mode_changed', notifyLiveMode);
  window.addEventListener('tradeheaven_auth_changed', notifyLiveMode);

  // Automatic 60-second background sweep disabled to prevent continuous re-renders and network writes
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
  priority = false,
  targetWidth,
  type = 'product',
  disableLiveUpload = false,
  loading: callerLoading,
  decoding: callerDecoding,
  fetchPriority: callerFetchPriority,
  onLoad: callerOnLoad,
  onError: callerOnError,
  style: callerStyle,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [attemptIndex, setAttemptIndex] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const hasErrorRef = useRef<boolean>(false);
  hasErrorRef.current = hasError;
  const [isLiveUploadActive, setIsLiveUploadActive] = useState<boolean>(() => {
    initSafeImageGlobalHub();
    return cachedLiveMode;
  });
  const [showLiveUploadModal, setShowLiveUploadModal] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>('');
  const [afterImageUrl, setAfterImageUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  const [visualPool, setVisualPool] = useState<string[]>([]);
  const visualFetchedKeyRef = useRef<string>('');

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

  const isLogoOrAvatar = useMemo(() => {
    if (type === 'logo' || type === 'avatar') return true;
    if (type === 'product' || type === 'rfq' || type === 'category') return false;
    if (productId || productTitle) return false;
    const lowerSrc = (src || '').toLowerCase();
    const lowerAlt = (resolvedAlt || alt || '').toLowerCase();
    return (
      lowerSrc.includes('logo') ||
      lowerSrc.includes('avatar') ||
      lowerAlt.includes('logo') ||
      lowerAlt.includes('avatar')
    );
  }, [src, alt, resolvedAlt, type, productId, productTitle]);

  const [overrideVersion, setOverrideVersion] = useState(0);
  const prevEffectiveSrcRef = useRef<string | undefined>(
    productImageManagerService.resolveImageSrc({
      src,
      productId,
      productTitle: isLogoOrAvatar ? undefined : productTitle,
      category: isLogoOrAvatar ? undefined : category,
      imageIndex
    })
  );

  useEffect(() => {
    initSafeImageGlobalHub();

    const checkRefresh = () => {
      const nextEffective = productImageManagerService.resolveImageSrc({
        src,
        productId,
        productTitle: isLogoOrAvatar ? undefined : productTitle,
        category: isLogoOrAvatar ? undefined : category,
        imageIndex
      });
      if (nextEffective !== prevEffectiveSrcRef.current) {
        prevEffectiveSrcRef.current = nextEffective;
        setAttemptIndex(0);
        setHasError(false);
        setOverrideVersion(v => v + 1);
      } else if (hasErrorRef.current) {
        setAttemptIndex(0);
        setHasError(false);
        setOverrideVersion(v => v + 1);
      }
    };

    const handleLive = (active: boolean) => setIsLiveUploadActive(active);

    overrideSubscribers.add(checkRefresh);
    liveModeSubscribers.add(handleLive);
    return () => {
      overrideSubscribers.delete(checkRefresh);
      liveModeSubscribers.delete(handleLive);
    };
  }, [src, productId, productTitle, category, imageIndex, isLogoOrAvatar]);

  const optimalWidth = useMemo(() => {
    if (targetWidth && targetWidth > 0) return targetWidth;
    if (isThumbnail || type === 'avatar' || type === 'logo' || type === 'category') return 320;
    if (priority) return 960;
    return 480;
  }, [targetWidth, isThumbnail, type, priority]);

  const effectiveSrc = useMemo(
    () =>
      productImageManagerService.resolveImageSrc({
        src,
        productId,
        productTitle: isLogoOrAvatar ? undefined : productTitle,
        category: isLogoOrAvatar ? undefined : category,
        imageIndex
      }),
    [src, productId, productTitle, category, imageIndex, isLogoOrAvatar, overrideVersion]
  );

  const hasManualOverride = useMemo(
    () => productImageManagerService.isManualOverride(productId, isLogoOrAvatar ? undefined : productTitle),
    [productId, productTitle, isLogoOrAvatar, overrideVersion]
  );

  // Automatic background visual product & category header fetch/upload disabled to prevent continuous file writes
  useEffect(() => {
    // Only resolve local overrides without triggering background network scrapes or disk writes
  }, []);

  const candidates = useMemo(() => {
    const list: string[] = [];
    const lowerSupplier = (supplierName || '').toLowerCase();
    const pid = (productId || '').trim();

    const pushCandidateWithRawFallback = (rawCandidate: string, optCandidate: string) => {
      if (optCandidate && !list.includes(optCandidate)) {
        list.push(optCandidate);
      }
      if (rawCandidate && !rawCandidate.startsWith('data:')) {
        const cleanRaw = rawCandidate.startsWith('/') ? (rawCandidate.split('?')[0] || rawCandidate) : rawCandidate;
        if (cleanRaw && cleanRaw !== optCandidate && !list.includes(cleanRaw)) {
          list.push(cleanRaw);
        }
        if (rawCandidate !== cleanRaw && rawCandidate !== optCandidate && !list.includes(rawCandidate)) {
          list.push(rawCandidate);
        }
      }
    };

    const isCrossCompanyAsset = (url: string): boolean => {
      const u = url.toLowerCase();
      if (u.includes('leather_belt_')) return true;
      if (u.includes('image00') && !lowerSupplier.includes('atlantic')) return true;
      if (u.includes('whatsapp_image_') && !lowerSupplier.includes('blackstone') && !lowerSupplier.includes('yunnan')) return true;
      return isMismatchedProductImageUrl(url, productTitle || alt, category);
    };

    const manualMirrored =
      hasManualOverride && effectiveSrc && typeof effectiveSrc === 'string' && effectiveSrc.trim()
        ? resolveLocalMirroredImageUrl(effectiveSrc.trim())
        : '';
    const optManualEff = manualMirrored
      ? manualMirrored.startsWith('data:image/')
        ? manualMirrored
        : optimizeImageUrl(manualMirrored, { width: optimalWidth, isThumbnail })
      : '';

    if (optManualEff) {
      pushCandidateWithRawFallback(manualMirrored, optManualEff);
    }

    if (pid.startsWith('prod-leather-belt-')) {
      const num = pid.replace('prod-leather-belt-', '');
      const legacyBelt = `/assets/uploads/verified-belt-${num}.webp`;
      if (!list.includes(legacyBelt)) list.push(legacyBelt);
    } else if (pid.startsWith('prod-exc-')) {
      const legacyExc = `/assets/uploads/verified-${pid}.webp`;
      if (!list.includes(legacyExc)) list.push(legacyExc);
    }

    if (
      !optManualEff &&
      effectiveSrc &&
      typeof effectiveSrc === 'string' &&
      effectiveSrc.trim() &&
      !isGenericOrPlaceholderImageUrl(effectiveSrc.trim()) &&
      !isCrossCompanyAsset(effectiveSrc.trim())
    ) {
      const mirroredEff = resolveLocalMirroredImageUrl(effectiveSrc.trim());
      const optEff = mirroredEff.startsWith('data:image/')
        ? mirroredEff
        : optimizeImageUrl(mirroredEff, { width: optimalWidth, isThumbnail });
      pushCandidateWithRawFallback(mirroredEff, optEff);
    }

    if (
      src &&
      typeof src === 'string' &&
      src.trim() &&
      src.trim() !== (effectiveSrc || '').trim() &&
      !isGenericOrPlaceholderImageUrl(src.trim()) &&
      !isCrossCompanyAsset(src.trim())
    ) {
      const mirroredRawSrc = resolveLocalMirroredImageUrl(src.trim());
      const optRawSrc = mirroredRawSrc.startsWith('data:image/')
        ? mirroredRawSrc
        : optimizeImageUrl(mirroredRawSrc, { width: optimalWidth, isThumbnail });
      pushCandidateWithRawFallback(mirroredRawSrc, optRawSrc);
    }

    if (
      fallbackSrc &&
      typeof fallbackSrc === 'string' &&
      fallbackSrc.trim() &&
      !isGenericOrPlaceholderImageUrl(fallbackSrc.trim()) &&
      !isCrossCompanyAsset(fallbackSrc.trim())
    ) {
      const mirroredFb = resolveLocalMirroredImageUrl(fallbackSrc.trim());
      const optFb = mirroredFb.startsWith('data:image/')
        ? mirroredFb
        : optimizeImageUrl(mirroredFb, { width: optimalWidth, isThumbnail });
      pushCandidateWithRawFallback(mirroredFb, optFb);
    }

    if (!isLogoOrAvatar && visualPool.length > 0) {
      const seedStr = String(productId || imageIndex || productTitle || '');
      let offset = 0;
      if (seedStr && visualPool.length > 1) {
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
        }
        offset = hash % visualPool.length;
      }
      for (let i = 0; i < visualPool.length; i++) {
        const rawVUrl = visualPool[(i + offset) % visualPool.length];
        if (!rawVUrl || isCrossCompanyAsset(rawVUrl)) continue;
        const mirroredVUrl = resolveLocalMirroredImageUrl(rawVUrl);
        const optVUrl = mirroredVUrl.startsWith('/assets/uploads/')
          ? optimizeImageUrl(mirroredVUrl, { width: optimalWidth, isThumbnail })
          : mirroredVUrl;
        pushCandidateWithRawFallback(mirroredVUrl, optVUrl);
      }
    }

    // Subject-matched real local fallback photo ONLY when topic explicitly matches (otherwise render bespoke spec card SVG instead of wrong photo)
    if (!isLogoOrAvatar && (type === 'product' || type === 'rfq' || type === 'category' || Boolean(productId || productTitle))) {
      const subjectText = `${productId || ''} ${productTitle || ''} ${category || ''} ${alt || ''}`.toLowerCase();
      let verifiedRealFallback = '';
      if (/vanilla|pod|bean|extract|spice/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-double-fold-pure-vanilla-extract-c-a3ff90b9f6f3.webp';
      } else if (/\bgold\b|bullion|dore|nugget|prod-au-|rfq-au-/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-lbma-good-delivery-gold-bullion-ba-6f8695d4a3e8.webp';
      } else if (/solar|battery|lithium|ess|renewable|energy|inverter|photovoltaic|panel|monocryst/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-renewable-energy-solar-eee659d6f297.webp';
      } else if (/generator|genset|diesel|cat\b|cummins/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/image002_50ab7837.png';
      } else if (/leather|belt|tannery|hide|wallet/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/verified-belt-01.webp';
      } else if (/electric vehicle|\bev\b|car charger|charging station/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-automotive-electric-vehicles-e1d9ff82a34f.webp';
      } else if (/semiconductor|microchip|silicon wafer|pcb|circuit board|cnc milling/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-electronics-semiconductors-8cd68208c5af.webp';
      } else if (/polymer pellets|hdpe resin|petrochemical|bitumen|solvent/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-chemicals-allied-products-produc-a6afe87a0b15.webp';
      } else if (/nitrile glove|surgical glove|examination glove|mri scanner/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-disposable-nitrile-examination-7302dff17ffb.webp';
      } else if (/\bwheat\b|\bsoybean\b|\bgreen coffee\b|\bcashew\b|\bbasmati rice\b/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-agriculture-agro-commodities-1e606ba818e1.webp';
      } else if (/\bbricks\b|\bclay brick\b|\brebar\b|\bcement\b|\bconcrete\b|\bconstruction materials\b/.test(subjectText)) {
        verifiedRealFallback = '/assets/uploads/auto-building-construction-materials-37394a3c058e.webp';
      }
      if (verifiedRealFallback && !list.includes(verifiedRealFallback)) {
        list.push(verifiedRealFallback);
      }
    }

    const validList = list.filter(u => u && !FAILED_IMAGE_URLS.has(u));
    if (validList.length === 0 || (!isLogoOrAvatar && (type === 'category' || type === 'product' || type === 'rfq' || Boolean(productId || productTitle)))) {
      const PALETTES: Array<[string, string, string]> = [
        ['#064E3B', '#047857', '#6EE7B7'],
        ['#7F1D1D', '#B91C1C', '#FCA5A5'],
        ['#1E3A8A', '#1D4ED8', '#93C5FD'],
        ['#4C1D95', '#6D28D9', '#C4B5FD'],
        ['#78350F', '#B45309', '#FCD34D'],
        ['#134E4A', '#0F766E', '#5EEAD4'],
        ['#831843', '#BE185D', '#F9A8D4'],
        ['#365314', '#4D7C0F', '#BEF264'],
        ['#312E81', '#4338CA', '#A5B4FC'],
        ['#7C2D12', '#C2410C', '#FDBA74'],
        ['#0C4A6E', '#0369A1', '#7DD3FC'],
        ['#581C87', '#7E22CE', '#D8B4FE']
      ];
      const seed = `${productId || ''}-${productTitle || ''}-${supplierName || ''}-${alt || ''}-${imageIndex || 0}`;
      let h = 0;
      for (let i = 0; i < seed.length; i++) {
        h = (h * 33 + seed.charCodeAt(i)) >>> 0;
      }
      const [c1, c2, acc] = PALETTES[h % PALETTES.length];
      const cleanSvgStr = (raw: string, maxLen: number) =>
        Array.from(String(raw || '').replace(/[\uD800-\uDFFF\x00-\x1F\x7F]/g, '').replace(/[&<>"']/g, ' ').trim())
          .slice(0, maxLen)
          .join('');
      const safeTitle = cleanSvgStr(productTitle || alt || 'Verified B2B Specification', 44) || 'Verified B2B Specification';
      const safeSupplier = cleanSvgStr(supplierName || category || 'Direct OEM', 38) || 'Direct OEM';
      const asciiWords = safeTitle.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      const mono = (asciiWords.length >= 2 ? `${asciiWords[0][0]}${asciiWords[1][0]}` : (asciiWords[0] || 'TH').slice(0, 2)).toUpperCase();
      const svgCard = isThumbnail || isLogoOrAvatar
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="240" height="240" rx="36" fill="url(#g)"/><circle cx="120" cy="120" r="88" fill="none" stroke="${acc}" stroke-width="5" opacity="0.5"/><text x="120" y="144" text-anchor="middle" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="#FFFFFF">${mono}</text></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="960" height="720" fill="url(#g)"/><circle cx="480" cy="290" r="130" fill="#FFFFFF" fill-opacity="0.12" stroke="${acc}" stroke-width="4"/><text x="480" y="322" text-anchor="middle" font-family="Arial, sans-serif" font-size="92" font-weight="900" fill="#FFFFFF">${mono}</text><rect x="68" y="490" width="824" height="156" rx="18" fill="#090D16" fill-opacity="0.65" stroke="${acc}" stroke-width="2"/><text x="96" y="538" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${acc}" letter-spacing="1.4">${safeSupplier.toUpperCase()}</text><text x="96" y="586" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF">${safeTitle}</text></svg>`;
      try {
        validList.push(`data:image/svg+xml;utf8,${encodeURIComponent(svgCard)}`);
      } catch {
        const asciiSafeSvg = svgCard.replace(/[^\x20-\x7E]/g, ' ');
        validList.push(`data:image/svg+xml;utf8,${encodeURIComponent(asciiSafeSvg)}`);
      }
    }

    return validList;
  }, [src, effectiveSrc, fallbackSrc, isLogoOrAvatar, hasManualOverride, visualPool, optimalWidth, isThumbnail, productId, imageIndex, productTitle, category, alt, supplierName, type]);

  const primaryCandidate = candidates[0] || '';
  const lastCandidateRef = useRef<string>(primaryCandidate);
  const effectiveAttemptIndex = lastCandidateRef.current !== primaryCandidate ? 0 : attemptIndex;
  const currentCandidate = candidates[effectiveAttemptIndex] || '';

  const [isLoaded, setIsLoaded] = useState<boolean>(() =>
    Boolean(
      currentCandidate &&
        (LOADED_IMAGE_URLS.has(currentCandidate) ||
          currentCandidate.startsWith('data:') ||
          currentCandidate.startsWith('blob:'))
    )
  );

  useEffect(() => {
    if (lastCandidateRef.current !== primaryCandidate) {
      lastCandidateRef.current = primaryCandidate;
      setAttemptIndex(0);
      setHasError(false);
    }
  }, [primaryCandidate]);

  useEffect(() => {
    if (!currentCandidate) {
      setIsLoaded(false);
      return;
    }
    if (
      LOADED_IMAGE_URLS.has(currentCandidate) ||
      currentCandidate.startsWith('data:') ||
      currentCandidate.startsWith('blob:')
    ) {
      setIsLoaded(true);
      return;
    }
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete) {
      if (imgEl.naturalWidth > 0) {
        LOADED_IMAGE_URLS.add(currentCandidate);
        setIsLoaded(true);
      } else {
        FAILED_IMAGE_URLS.add(currentCandidate);
        markBrokenExternalImageUrl(currentCandidate);
        if (effectiveAttemptIndex < candidates.length - 1) {
          setAttemptIndex(effectiveAttemptIndex + 1);
        } else {
          setHasError(true);
        }
      }
    } else {
      setIsLoaded(false);
    }

    // Fast stall guard: if a slow external third-party URL hangs > 4.5s and a local fallback candidate exists, advance immediately
    if (
      /^https?:\/\//i.test(currentCandidate) &&
      effectiveAttemptIndex < candidates.length - 1
    ) {
      const stallTimer = setTimeout(() => {
        const el = imgRef.current;
        if (el && (!el.complete || el.naturalWidth === 0)) {
          FAILED_IMAGE_URLS.add(currentCandidate);
          setAttemptIndex((prev) => (prev === effectiveAttemptIndex ? prev + 1 : prev));
        }
      }, 4500);
      return () => clearTimeout(stallTimer);
    }
  }, [currentCandidate, effectiveAttemptIndex, candidates.length]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentCandidate) {
      FAILED_IMAGE_URLS.add(currentCandidate);
      markBrokenExternalImageUrl(currentCandidate);
    }
    if (effectiveAttemptIndex < candidates.length - 1) {
      setAttemptIndex(effectiveAttemptIndex + 1);
    } else {
      setHasError(true);
    }
    callerOnError?.(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentCandidate) {
      LOADED_IMAGE_URLS.add(currentCandidate);
      // Auto-upload & bind displayed product/category/RFQ image onto the site (/assets/uploads/...) so next load is instant & persistent
      if (!isLogoOrAvatar && !hasManualOverride && (type === 'product' || type === 'rfq' || type === 'category' || Boolean(productId || productTitle))) {
        const resolvedTitle = (productTitle || alt || '').trim();
        const stateOverrides = productImageManagerService.getState()?.overrides || {};
        const pidOv = productId ? (stateOverrides[productId.trim()] || stateOverrides[productId.trim().toLowerCase()]) : undefined;
        const titleOv = resolvedTitle ? (stateOverrides[resolvedTitle] || stateOverrides[resolvedTitle.toLowerCase()]) : undefined;
        const isProtectedUpdater = (u?: string) =>
          u === 'admin-manual' || u === 'user-upload' || u === 'catalog-image-auditor';
        if (isProtectedUpdater(pidOv?.updatedBy) || isProtectedUpdater(titleOv?.updatedBy)) {
          setHasError(false);
          setIsLoaded(true);
          callerOnLoad?.(e);
          return;
        }

        const cleanCandidate =
          currentCandidate.startsWith('/assets/uploads/') || currentCandidate.startsWith('/src/assets/')
            ? currentCandidate.split('?')[0]
            : currentCandidate;
        const existingPidOverride = productId ? productImageManagerService.getProductImage(productId) : undefined;
        const existingTitleOverride = resolvedTitle ? productImageManagerService.getProductImage(resolvedTitle) : undefined;
        const hasSavedLocalPid = Boolean(existingPidOverride && existingPidOverride.startsWith('/assets/uploads/'));
        const hasSavedLocalTitle = Boolean(existingTitleOverride && existingTitleOverride.startsWith('/assets/uploads/'));
        const needsPersistence =
          /^https?:\/\//i.test(cleanCandidate) ||
          (Boolean(productId) && !hasSavedLocalPid) ||
          (!productId && resolvedTitle.length >= 3 && !hasSavedLocalTitle);

        const cleanBasePath = cleanCandidate.split('?')[0];
        const isGenericFallbackAsset =
          /^\/assets\/uploads\/auto-(?:building-construction-materials|agriculture-agro-commodities|electronics-semiconductors|chemicals-allied-products|automotive-electric-vehicles|renewable-energy-solar)-[a-f0-9]+\.webp$/i.test(cleanBasePath);
        if (
          needsPersistence &&
          !isGenericFallbackAsset &&
          !cleanCandidate.startsWith('data:') &&
          !cleanCandidate.startsWith('blob:') &&
          !isGenericOrPlaceholderImageUrl(cleanCandidate) &&
          !isMismatchedProductImageUrl(cleanCandidate, resolvedTitle, category)
        ) {
          const scheduleBackgroundPersist = () => {
            void autoUploadDisplayedProductImage({
              imageUrl: cleanCandidate,
              productId,
              productName: resolvedTitle,
              category
            }).then(localUrl => {
              if (
                localUrl &&
                !isMismatchedProductImageUrl(localUrl, resolvedTitle, category) &&
                (productId || resolvedTitle.length >= 3)
              ) {
                productImageManagerService.registerAutoSavedImage({
                  productId,
                  productTitle: resolvedTitle || undefined,
                  url: localUrl,
                  originalUrl: /^https?:\/\//i.test(cleanCandidate) ? cleanCandidate : undefined
                });
              }
            });
          };
          // Defer background mirroring until browser idle so visible images & LCP never compete for network sockets
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(scheduleBackgroundPersist, { timeout: 4000 });
          } else {
            setTimeout(scheduleBackgroundPersist, 2000);
          }
        }
      }
    }
    setHasError(false);
    setIsLoaded(true);
    callerOnLoad?.(e);
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
      const oldImgBefore = normalizeProductAssetUrl(currentCandidate || src || '');
      setBeforeImageUrl(oldImgBefore);
      const cleanOldTarget = normalizeProductAssetUrl(src || currentCandidate || '');
      const res = await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: 'jpg',
        quality: 0.92,
        productId: productId || undefined,
        oldUrlToReplace: !productId && cleanOldTarget ? cleanOldTarget : undefined
      });
      if (productId) {
        await productImageManagerService.setProductImage(productId, res.url);
      } else if (cleanOldTarget) {
        await productImageManagerService.replaceImageUrlEverywhere(cleanOldTarget, res.url);
      }
      setHasError(false);
      setAttemptIndex(0);
      FAILED_IMAGE_URLS.clear();
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
    const clean = normalizeProductAssetUrl(targetUrl);
    if (!clean) return;
    setIsUploadingFile(true);
    setUploadStatusMsg('Applying image & syncing to server...');
    try {
      const oldImgBefore = normalizeProductAssetUrl(currentCandidate || src || '');
      if (oldImgBefore && oldImgBefore !== clean) {
        setBeforeImageUrl(oldImgBefore);
      }
      const cleanOldTarget = normalizeProductAssetUrl(src || currentCandidate || '');
      if (productId) {
        await productImageManagerService.setProductImage(productId, clean);
      } else if (cleanOldTarget) {
        await productImageManagerService.replaceImageUrlEverywhere(cleanOldTarget, clean);
      }
      setHasError(false);
      setAttemptIndex(0);
      setAfterImageUrl(clean);
      setCustomUrlInput(clean);
      setOverrideVersion(v => v + 1);
      setUploadStatusMsg('Image updated & synced live for Incognito!');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const showLiveButton = isLiveUploadActive && !disableLiveUpload && !isThumbnail && !isLogoOrAvatar;
  const effectiveLoading = callerLoading || (priority ? 'eager' : 'lazy');
  const effectiveDecoding = callerDecoding || (priority ? 'sync' : 'async');
  const effectiveFetchPriority = callerFetchPriority || (priority ? 'high' : undefined);
  const responsiveSrcSet = useMemo(() => {
    if (!currentCandidate || effectiveAttemptIndex > 0 || currentCandidate.startsWith('data:') || currentCandidate.startsWith('blob:')) {
      return undefined;
    }
    return buildResponsiveImageSrcSet(currentCandidate, optimalWidth, Boolean(isThumbnail));
  }, [currentCandidate, effectiveAttemptIndex, optimalWidth, isThumbnail]);
  const responsiveSizes = responsiveSrcSet
    ? (props.sizes || (isThumbnail ? '(max-width: 640px) 45vw, 240px' : priority ? '(max-width: 1024px) 100vw, 800px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px'))
    : props.sizes;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${isLoaded ? 'bg-transparent' : 'bg-slate-100 animate-pulse'} ${className}`}
    >
      {hasError || !currentCandidate ? (
        isLogoOrAvatar ? (
          <div className="w-full h-full min-w-full min-h-full flex items-center justify-center bg-slate-200 text-slate-500 rounded-full select-none">
            <User className="w-1/2 h-1/2" />
          </div>
        ) : (
          <div className="w-full h-full min-h-[44px] flex items-center justify-center bg-slate-100 text-slate-400 select-none">
            {type === 'category' ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <Package className="w-6 h-6" />
            )}
          </div>
        )
      ) : (
        <img
          ref={imgRef}
          src={currentCandidate}
          srcSet={responsiveSrcSet}
          sizes={responsiveSizes}
          alt={resolvedAlt || alt || (isLogoOrAvatar ? 'User Avatar' : 'Verified B2B Wholesale Product')}
          {...(/^https?:\/\//i.test(currentCandidate) ? { referrerPolicy: 'no-referrer' as const } : {})}
          loading={effectiveLoading}
          decoding={effectiveDecoding}
          {...(effectiveFetchPriority ? { fetchPriority: effectiveFetchPriority } : {})}
          onLoad={handleLoad}
          onError={handleError}
          style={callerStyle}
          className={`w-full h-full object-cover transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...props}
        />
      )}

      {/* Real-Time Live Edit & Upload Overlay Button (Admin Live Edit Only) */}
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
                        <img src={optimizeImageUrl(item.url, { width: 160, isThumbnail: true })} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
