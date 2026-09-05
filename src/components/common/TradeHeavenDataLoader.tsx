import React from 'react';

interface Props {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

/**
 * Official Trade Heaven Data Loader.
 * Displays the bold, high-contrast black & white "TH" monogram
 * while fetching marketplace data, catalog inventory, or RFQ buy leads.
 * Completely replaces all generic circular spinners with the official brandmark.
 */
export const TradeHeavenDataLoader: React.FC<Props> = ({
  message = 'Fetching Trade Heaven Data...',
  subMessage = 'Connecting to verified international B2B directories...',
  size = 'md',
  className = ''
}) => {
  const boxDimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    fullscreen: 'w-20 h-20'
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 select-none ${className}`}>
      {/* Official TH Monogram Badge with Gentle Breathing Animation */}
      <div className="relative mb-4 group">
        {/* Subtle Ambient Halo */}
        <div className="absolute -inset-2 bg-slate-300/50 rounded-2xl blur-xs animate-pulse" />

        {/* Clean White Square Monogram Box matching tradeheavenbg1 */}
        <div className={`relative ${boxDimensions} bg-white border-2 border-slate-900 rounded-2xl shadow-md overflow-hidden flex items-center justify-center p-1.5 transition-all duration-300 animate-pulse`}>
          <svg 
            viewBox="0 0 512 512" 
            className="w-full h-full" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="512" height="512" fill="#FFFFFF" />
            <g fill="#000000">
              {/* Letter T */}
              <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
              {/* Letter H */}
              <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
            </g>
          </svg>
        </div>
      </div>

      {/* Progress Shimmer Bar */}
      <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200 relative">
        <div className="w-full h-full bg-slate-900 rounded-full animate-shimmer" />
      </div>

      {/* Primary Status Message */}
      <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
        {message}
      </div>

      {/* Optional Subtitle */}
      {subMessage && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed font-medium">
          {subMessage}
        </p>
      )}
    </div>
  );

  if (size === 'fullscreen') {
    return (
      <div className="min-h-[55vh] w-full flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Compact Inline Loader for buttons, input bars, or micro widgets
 */
export const TradeHeavenInlineLoader: React.FC<{ label?: string; className?: string }> = ({ 
  label = 'Fetching data...', 
  className = '' 
}) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <div className="w-5 h-5 bg-white border border-slate-900 rounded shadow-xs overflow-hidden flex items-center justify-center p-0.5 animate-pulse shrink-0">
      <svg viewBox="0 0 512 512" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#FFFFFF" />
        <g fill="#000000">
          <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
          <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
        </g>
      </svg>
    </div>
    {label && <span className="text-xs font-bold text-slate-800">{label}</span>}
  </div>
);
