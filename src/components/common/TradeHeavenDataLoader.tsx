import React from 'react';

interface Props {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

/**
 * Official Trade Heaven Data Loader.
 * Always renders the single, consistent central glowing "TH" logo only
 * across all data-loading states so the indicator never changes.
 */
export const TradeHeavenDataLoader: React.FC<Props> = ({
  size = 'md',
  className = ''
}) => {
  const containerClass =
    size === 'fullscreen'
      ? 'min-h-[65vh] w-full flex items-center justify-center p-6 select-none'
      : 'min-h-[220px] w-full flex items-center justify-center p-8 select-none';

  return (
    <div
      className={`${containerClass} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft Radiant Outer Glow */}
        <div className="absolute -inset-4 rounded-3xl bg-blue-500/25 blur-xl th-glow-halo pointer-events-none" />
        <div className="absolute -inset-2 rounded-2xl bg-sky-400/20 blur-md th-glow-halo pointer-events-none" />

        {/* Central Glowing TH Monogram Logo Only */}
        <div className="relative w-20 h-20 bg-white border-2 border-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-2 th-glow-logo-box">
          <svg
            viewBox="0 0 512 512"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="512" height="512" fill="#FFFFFF" />
            <g fill="#000000">
              <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
              <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Inline Loader matching the central glowing logo mark
 */
export const TradeHeavenInlineLoader: React.FC<{ label?: string; className?: string }> = ({
  className = ''
}) => (
  <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
    <div className="w-7 h-7 bg-white border border-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-0.5 th-glow-logo-box shrink-0">
      <svg viewBox="0 0 512 512" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="512" height="512" fill="#FFFFFF" />
        <g fill="#000000">
          <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
          <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
        </g>
      </svg>
    </div>
  </div>
);
