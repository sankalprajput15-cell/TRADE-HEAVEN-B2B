import React from 'react';

interface ThTradeIconProps {
  className?: string;
  size?: number | string;
  showBackground?: boolean;
}

/**
 * Official vector app icon for TradeHeaven B2B trade marketplace.
 * Bold, high-contrast black monogram letters "TH" on pure white,
 * matching the official tradeheavenbg1 brand asset.
 */
export const ThTradeIcon: React.FC<ThTradeIconProps> = ({
  className = '',
  size = 64,
  showBackground = true
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none ${className}`}
    >
      {/* White Background */}
      {showBackground && <rect width="512" height="512" fill="#FFFFFF" rx="24" />}

      {/* Bold Monogram TH */}
      <g fill="#000000">
        {/* Letter T */}
        <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
        {/* Letter H */}
        <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
      </g>
    </svg>
  );
};
