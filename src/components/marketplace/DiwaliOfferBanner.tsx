import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, Gift, Maximize2, X, ShieldCheck } from 'lucide-react';
import { ActiveView } from '../../types';

export const DIWALI_OFFER_BANNER_IMAGE = '/assets/aistudio/Gemini_Generated_Image_obbsb1obbsb1obbs-clean_264b6c61.png';
export const DIWALI_PROMO_CODE = 'DIWALI10';

interface DiwaliOfferBannerProps {
  onNavigate?: (view: ActiveView) => void;
  variant?: 'top-ribbon' | 'hero-banner';
}

export const DiwaliOfferBanner: React.FC<DiwaliOfferBannerProps> = ({
  onNavigate,
  variant = 'hero-banner'
}) => {
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleCopyCode = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(DIWALI_PROMO_CODE);
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimOffer = () => {
    try {
      sessionStorage.setItem('th_active_promo_code', DIWALI_PROMO_CODE);
    } catch {
      // ignore
    }
    if (onNavigate) {
      onNavigate('PREMIUM_MEMBERSHIP');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (variant === 'top-ribbon') {
    if (isDismissed) return null;
    return (
      <>
        <div
          id="diwali-maha-utsav-top-ribbon"
          className="w-full bg-gradient-to-r from-[#580816] via-[#8b1122] to-[#0f172a] text-white border-b border-amber-400/30 shadow-md relative z-40"
        >
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="relative group shrink-0 rounded-lg overflow-hidden border border-amber-400/50 shadow-xs cursor-pointer"
                title="View Full Diwali Maha Utsav Offer Banner"
              >
                <img
                  src={DIWALI_OFFER_BANNER_IMAGE}
                  alt="Diwali Maha Utsav Offer"
                  className="w-14 h-8 object-cover group-hover:scale-105 transition-transform"
                />
              </button>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Diwali Maha Utsav
                </span>
                <span className="font-bold text-amber-100 text-xs sm:text-sm">
                  Brighten Your B2B Business — <strong className="text-amber-300 font-black">FLAT 10% OFF</strong> on All Subscription &amp; Membership Plans!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-mono text-xs font-extrabold transition-all cursor-pointer"
                title="Click to copy promo code DIWALI10"
              >
                <span>Code:</span>
                <span className="text-amber-300 font-black tracking-wider">{DIWALI_PROMO_CODE}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                )}
              </button>

              <button
                type="button"
                onClick={handleClaimOffer}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                <span>Claim 10% OFF</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss offer ribbon"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={DIWALI_OFFER_BANNER_IMAGE}
                alt="Trade Heaven Diwali Maha Utsav — Flat 10% OFF Promo Code DIWALI10"
                className="w-full h-auto block"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <section
      id="diwali-maha-utsav-banner-section"
      className="w-full rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-gradient-to-r from-[#4b0713] via-[#2b0918] to-[#0b1536] shadow-xl relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* Left/Center Full Promotional Artwork */}
        <div className="lg:col-span-8 relative group bg-slate-950">
          <img
            src={DIWALI_OFFER_BANNER_IMAGE}
            alt="Trade Heaven Diwali Maha Utsav — Brighten Your B2B Business — Flat 10% OFF on All Subscription & Membership Plans (Use Promo Code: DIWALI10)"
            className="w-full h-auto max-h-[420px] object-contain mx-auto block cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expand Full Banner</span>
          </button>
        </div>

        {/* Right Interactive Offer Action Panel */}
        <div className="lg:col-span-4 p-6 sm:p-7 text-white flex flex-col justify-between space-y-5 bg-gradient-to-b from-[#450a14]/90 via-[#2a0b1d]/95 to-[#0f172a]">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-widest">
              <Gift className="w-3.5 h-3.5" />
              <span>Limited-Time Festive Offer</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 leading-tight">
              DIWALI MAHA UTSAV
            </h2>
            <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
              Brighten Your B2B Business — Take Your Business Online
            </p>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Enjoy <strong className="text-amber-300 font-black">FLAT 10% OFF</strong> on all Trade Heaven Subscription &amp; Membership Plans (Basic, Silver, Gold &amp; VIP Enterprise Tiers).
            </p>
          </div>

          {/* Promo Code Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-400/50 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80">
                Use Official Promo Code
              </div>
              <div className="text-lg sm:text-xl font-black font-mono tracking-widest text-amber-300">
                {DIWALI_PROMO_CODE}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleClaimOffer}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Claim Flat 10% OFF Membership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-200/80 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Instant activation • Valid on www.tradeheaven.net</span>
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={DIWALI_OFFER_BANNER_IMAGE}
              alt="Trade Heaven Diwali Maha Utsav — Flat 10% OFF Promo Code DIWALI10"
              className="w-full h-auto block"
            />
          </div>
        </div>
      )}
    </section>
  );
};
