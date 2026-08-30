import React from 'react';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'monochrome' | 'dark' | 'light' | 'blue' | 'gold';
  wordmarkTheme?: 'light' | 'dark';
  showWordmark?: boolean;
  subtitle?: string | boolean;
  className?: string;
}

export const TradeHeavenLogo: React.FC<Props> = ({
  size = 'md',
  variant = 'dark',
  wordmarkTheme,
  showWordmark = true,
  subtitle = 'Global Sourcing & Trade Directory',
  className = ''
}) => {
  // Dimensions
  const sizeMap = {
    xs: { box: 'w-6 h-6', iconText: 'text-[11px]', title: 'text-xs', sub: 'text-[8px]' },
    sm: { box: 'w-8 h-8', iconText: 'text-sm', title: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', iconText: 'text-base', title: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', iconText: 'text-xl', title: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', iconText: 'text-2xl', title: 'text-2xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  // Variant themes
  const getBoxStyle = () => {
    switch (variant) {
      case 'light':
        return 'bg-white text-slate-950 border border-slate-200 shadow-xs';
      case 'monochrome':
        return 'bg-black text-white';
      case 'blue':
        return 'bg-blue-600 text-white shadow-md shadow-blue-600/20';
      case 'gold':
        return 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20';
      case 'dark':
      default:
        return 'bg-slate-950 text-white shadow-sm';
    }
  };

  const getWordmarkStyle = () => {
    if (wordmarkTheme === 'light' || variant === 'light') {
      return {
        trade: 'text-white',
        heaven: 'text-black',
        badge: 'bg-white/15 text-white border-white/20',
        sub: 'text-slate-300'
      };
    }
    if (variant === 'gold') {
      return {
        trade: 'text-slate-900',
        heaven: 'text-black',
        badge: 'bg-amber-400/20 text-amber-900 border-amber-400/40',
        sub: 'text-slate-600'
      };
    }
    if (variant === 'monochrome') {
      return {
        trade: 'text-black',
        heaven: 'text-black',
        badge: 'bg-slate-100 text-black border-slate-300',
        sub: 'text-slate-600'
      };
    }
    return {
      trade: 'text-slate-900',
      heaven: 'text-black',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      sub: 'text-slate-500'
    };
  };

  const wmStyle = getWordmarkStyle();

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official "TH" Monogram Icon Box */}
      <div 
        className={`${currentSize.box} ${getBoxStyle()} rounded-xl flex items-center justify-center font-black tracking-tighter shrink-0 transition-transform duration-200 group-hover:scale-105`}
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {/* Crisp Vector Rendering of the Official TH Logo */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-4/5 h-4/5" 
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Letter T */}
          <path d="M 14 24 H 48 V 35 H 36 V 76 H 26 V 35 H 14 Z" />
          {/* Letter H */}
          <path d="M 54 24 H 64 V 45 H 78 V 24 H 88 V 76 H 78 V 55 H 64 V 76 H 54 Z" />
        </svg>
      </div>

      {/* Brand Wordmark & Subtitle */}
      {showWordmark && (
        <div className="leading-tight hidden sm:block">
          <div className={`font-black ${currentSize.title} tracking-tight flex items-center gap-1.5`}>
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
