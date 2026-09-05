import React from 'react';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'monochrome' | 'dark' | 'light' | 'blue' | 'gold';
  wordmarkTheme?: 'light' | 'dark';
  showWordmark?: boolean;
  useSearchEmblem?: boolean;
  subtitle?: string | boolean;
  className?: string;
}

/**
 * Official TradeHeaven Logo Component.
 * Displays the bold, high-contrast black & white "TH" monogram
 * exactly matching the tradeheavenbg1 brand asset.
 * Completely flat, geometric, and free of any circular or magnifying-glass emblems.
 */
export const TradeHeavenLogo: React.FC<Props> = ({
  size = 'md',
  variant = 'light',
  wordmarkTheme,
  showWordmark = true,
  subtitle = 'Global Sourcing & Trade Directory',
  className = ''
}) => {
  // Dimensions
  const sizeMap = {
    xs: { box: 'w-6 h-6', title: 'text-xs', sub: 'text-[8px]' },
    sm: { box: 'w-8 h-8', title: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', title: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', title: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', title: 'text-2xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  const isDarkCanvas = wordmarkTheme === 'light' || variant === 'dark';

  const getWordmarkStyle = () => {
    if (isDarkCanvas) {
      return {
        trade: 'text-white',
        heaven: 'text-white',
        badge: 'bg-white/15 text-white border-white/20',
        sub: 'text-slate-300'
      };
    }
    return {
      trade: 'text-black',
      heaven: 'text-black',
      badge: 'bg-slate-900 text-white border-slate-900',
      sub: 'text-slate-700'
    };
  };

  const wmStyle = getWordmarkStyle();

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official "TH" Square Monogram matching tradeheavenbg1 */}
      <div 
        className={`${currentSize.box} shrink-0 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex items-center justify-center p-0.5 transition-transform duration-200 group-hover:scale-105`}
        title="Trade Heaven - B2B Marketplace"
      >
        <svg 
          viewBox="0 0 512 512" 
          className="w-full h-full" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Clean White Background */}
          <rect width="512" height="512" fill="#FFFFFF" />

          {/* Solid Black Bold TH Monogram */}
          <g fill="#000000">
            {/* Letter T */}
            <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
            {/* Letter H */}
            <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
          </g>
        </svg>
      </div>

      {/* Brand Wordmark & Subtitle */}
      {showWordmark && (
        <div className="leading-tight hidden sm:block">
          <div className={`font-black ${currentSize.title} tracking-tight flex items-center gap-1.5 text-black`}>
            <span className={wmStyle.trade}>TRADE</span>
            <span className={wmStyle.heaven}>HEAVEN</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider border ${wmStyle.badge}`}>
              B2B
            </span>
          </div>
          {subtitle && (
            <div className={`${currentSize.sub} ${wmStyle.sub} tracking-wider uppercase font-bold mt-0.5 hidden sm:block truncate max-w-[140px] md:max-w-none`}>
              {typeof subtitle === 'string' ? subtitle : 'Global Sourcing & Trade Directory'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
