import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Megaphone,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { ActiveView } from '../../types';
import { PlatformOfferAnnouncement, PlatformCampaignTheme } from '../../types/platformOfferTypes';
import { optimizeImageUrl } from '../../services/productImageManagerService';

interface PlatformAnnouncementBannerProps {
  onNavigate?: (view: ActiveView) => void;
  variant?: 'top-ribbon' | 'hero-banner';
}

const THEME_STYLES: Record<
  PlatformCampaignTheme,
  {
    ribbonBg: string;
    ribbonBadge: string;
    ribbonCta: string;
    cardBorder: string;
    cardHeaderBg: string;
    cardBodyBg: string;
    cardAccentText: string;
    cardCta: string;
  }
> = {
  SLATE_DARK: {
    ribbonBg: 'bg-slate-900 text-white border-b border-slate-700',
    ribbonBadge: 'bg-blue-500 text-white',
    ribbonCta: 'bg-white text-slate-900 hover:bg-slate-100',
    cardBorder: 'border-slate-300',
    cardHeaderBg: 'bg-slate-900 text-white',
    cardBodyBg: 'bg-white text-slate-900',
    cardAccentText: 'text-blue-600',
    cardCta: 'bg-slate-900 hover:bg-slate-800 text-white'
  },
  INDIGO_ROYAL: {
    ribbonBg: 'bg-indigo-950 text-white border-b border-indigo-700',
    ribbonBadge: 'bg-indigo-400 text-slate-950',
    ribbonCta: 'bg-indigo-400 text-slate-950 hover:bg-indigo-300',
    cardBorder: 'border-indigo-200',
    cardHeaderBg: 'bg-indigo-950 text-white',
    cardBodyBg: 'bg-white text-slate-900',
    cardAccentText: 'text-indigo-600',
    cardCta: 'bg-indigo-600 hover:bg-indigo-700 text-white'
  },
  EMERALD_TRUST: {
    ribbonBg: 'bg-emerald-950 text-white border-b border-emerald-700',
    ribbonBadge: 'bg-emerald-400 text-slate-950',
    ribbonCta: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
    cardBorder: 'border-emerald-200',
    cardHeaderBg: 'bg-emerald-950 text-white',
    cardBodyBg: 'bg-white text-slate-900',
    cardAccentText: 'text-emerald-700',
    cardCta: 'bg-emerald-700 hover:bg-emerald-800 text-white'
  },
  AMBER_GOLD: {
    ribbonBg: 'bg-slate-900 text-white border-b border-amber-500/40',
    ribbonBadge: 'bg-amber-400 text-slate-950',
    ribbonCta: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    cardBorder: 'border-amber-300',
    cardHeaderBg: 'bg-amber-950 text-white',
    cardBodyBg: 'bg-white text-slate-900',
    cardAccentText: 'text-amber-700',
    cardCta: 'bg-amber-500 hover:bg-amber-400 text-slate-950'
  },
  CRIMSON_ALERT: {
    ribbonBg: 'bg-rose-950 text-white border-b border-rose-700',
    ribbonBadge: 'bg-rose-500 text-white',
    ribbonCta: 'bg-white text-rose-950 hover:bg-rose-50',
    cardBorder: 'border-rose-300',
    cardHeaderBg: 'bg-rose-950 text-white',
    cardBodyBg: 'bg-white text-slate-900',
    cardAccentText: 'text-rose-700',
    cardCta: 'bg-rose-700 hover:bg-rose-800 text-white'
  }
};

export const PlatformAnnouncementBanner: React.FC<PlatformAnnouncementBannerProps> = ({
  onNavigate,
  variant = 'hero-banner'
}) => {
  const [items, setItems] = useState<PlatformOfferAnnouncement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('th_dismissed_announcements');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const loadActiveCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/platform-offers?activeOnly=1', {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.items)) {
        setItems(data.items);
      }
    } catch {
      // ignore transient network errors
    }
  }, []);

  useEffect(() => {
    void loadActiveCampaigns();
    const handler = () => {
      void loadActiveCampaigns();
    };
    window.addEventListener('tradeheaven_platform_offers_updated', handler);
    return () => {
      window.removeEventListener('tradeheaven_platform_offers_updated', handler);
    };
  }, [loadActiveCampaigns]);

  const matchingItems = items.filter((item) => {
    if (variant === 'top-ribbon') {
      return (item.placement === 'TOP_RIBBON' || item.placement === 'BOTH') && !dismissedIds.has(item.id);
    }
    return item.placement === 'HERO_BANNER' || item.placement === 'BOTH';
  });

  useEffect(() => {
    if (activeIndex >= matchingItems.length && matchingItems.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, matchingItems.length]);

  if (matchingItems.length === 0) {
    return null;
  }

  const current = matchingItems[activeIndex] || matchingItems[0];
  const theme = THEME_STYLES[current.themePreset] || THEME_STYLES.SLATE_DARK;

  const handleCopyPromo = (item: PlatformOfferAnnouncement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item.promoCode) return;
    try {
      navigator.clipboard.writeText(item.promoCode);
      sessionStorage.setItem('th_active_promo_code', item.promoCode);
    } catch {
      // ignore clipboard restriction
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleActionClick = (item: PlatformOfferAnnouncement) => {
    if (item.promoCode) {
      try {
        sessionStorage.setItem('th_active_promo_code', item.promoCode);
      } catch {
        // ignore
      }
    }
    if (item.ctaView === 'CUSTOM_URL' && item.ctaUrl) {
      window.location.href = item.ctaUrl;
      return;
    }
    if (onNavigate && item.ctaView) {
      onNavigate(item.ctaView as ActiveView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDismissRibbon = (id: string) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);
    try {
      sessionStorage.setItem('th_dismissed_announcements', JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

  if (variant === 'top-ribbon') {
    return (
      <>
        <div
          id="platform-announcement-top-ribbon"
          className={`w-full ${theme.ribbonBg} relative z-40`}
        >
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {current.bannerImageUrl && (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(current.bannerImageUrl || null)}
                  className="hidden sm:block shrink-0 rounded overflow-hidden border border-white/20 cursor-pointer"
                  title="Preview Banner Image"
                >
                  <img
                    src={current.bannerImageUrl}
                    alt={current.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-7 object-cover block"
                  />
                </button>
              )}

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${theme.ribbonBadge}`}>
                {current.badgeLabel || current.type}
              </span>

              <div className="min-w-0 truncate font-medium text-white/95">
                <strong className="font-bold text-white">{current.title}</strong>
                <span className="hidden md:inline text-white/80"> — {current.message}</span>
                {typeof current.discountPercent === 'number' && current.discountPercent > 0 && (
                  <span className="ml-2 font-bold text-amber-300 whitespace-nowrap">
                    ({current.discountPercent}% OFF)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {matchingItems.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 border border-white/20 rounded px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveIndex((prev) => (prev - 1 + matchingItems.length) % matchingItems.length)}
                    className="p-0.5 hover:text-white text-white/75 cursor-pointer"
                    aria-label="Previous announcement"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono tabular-nums px-1">
                    {activeIndex + 1}/{matchingItems.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((prev) => (prev + 1) % matchingItems.length)}
                    className="p-0.5 hover:text-white text-white/75 cursor-pointer"
                    aria-label="Next announcement"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {current.promoCode && (
                <button
                  type="button"
                  onClick={(e) => handleCopyPromo(current, e)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Copy Promo Code"
                >
                  <span>{current.promoCode}</span>
                  {copiedId === current.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/80" />
                  )}
                </button>
              )}

              {current.ctaLabel && (
                <button
                  type="button"
                  onClick={() => handleActionClick(current)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${theme.ribbonCta}`}
                >
                  <span>{current.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDismissRibbon(current.id)}
                className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {lightboxUrl && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={optimizeImageUrl(lightboxUrl, { width: 1280, quality: 82 })} alt={current.title} decoding="async" referrerPolicy="no-referrer" className="w-full h-auto block" />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <section id="platform-offers-banner-section" className="space-y-4">
      {matchingItems.map((item) => {
        const cardTheme = THEME_STYLES[item.themePreset] || THEME_STYLES.SLATE_DARK;
        const TypeIcon = item.type === 'OFFER' ? Tag : item.type === 'BANNER' ? ImageIcon : Megaphone;

        return (
          <div
            key={item.id}
            className={`w-full rounded-2xl overflow-hidden border ${cardTheme.cardBorder} ${cardTheme.cardBodyBg} shadow-xs`}
          >
            <div className={`grid grid-cols-1 ${item.bannerImageUrl ? 'lg:grid-cols-12' : ''} items-stretch`}>
              {item.bannerImageUrl && (
                <div className="lg:col-span-7 relative bg-slate-950 flex items-center justify-center">
                  <img
                    src={optimizeImageUrl(item.bannerImageUrl, { width: 960, quality: 80 })}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full max-h-[380px] object-cover block cursor-pointer"
                    onClick={() => setLightboxUrl(item.bannerImageUrl || null)}
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(item.bannerImageUrl || null)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Banner</span>
                  </button>
                </div>
              )}

              <div className={`${item.bannerImageUrl ? 'lg:col-span-5' : ''} p-6 sm:p-8 flex flex-col justify-between gap-5`}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <TypeIcon className={`w-4 h-4 ${cardTheme.cardAccentText}`} />
                    <span>{item.badgeLabel || item.type}</span>
                    {typeof item.discountPercent === 'number' && item.discountPercent > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className={`font-bold ${cardTheme.cardAccentText}`}>
                          {item.discountPercent}% OFF
                        </span>
                      </>
                    )}
                    {item.expiresAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Ends {item.expiresAt}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight text-balance">
                    {item.title}
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                  {item.promoCode && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyPromo(item, e)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-mono text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Code: {item.promoCode}</span>
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleActionClick(item)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${cardTheme.cardCta}`}
                  >
                    <span>{item.ctaLabel || 'Explore Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={optimizeImageUrl(lightboxUrl, { width: 1280, quality: 82 })} alt="Banner preview" decoding="async" referrerPolicy="no-referrer" className="w-full h-auto block" />
          </div>
        </div>
      )}
    </section>
  );
};
