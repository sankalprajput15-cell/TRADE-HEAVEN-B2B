import React, { useState } from 'react';
import { getCountryFlagInfo } from '../../data/worldCountriesAndBuyOrders';

interface CountryFlagProps {
  country?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showCode?: boolean;
  className?: string;
  flagClassName?: string;
}

const SIZE_CLASSES: Record<NonNullable<CountryFlagProps['size']>, string> = {
  xs: 'w-4 h-3 rounded-[2px]',
  sm: 'w-5 h-3.5 rounded-[3px]',
  md: 'w-6 h-4 rounded-[3px]',
  lg: 'w-7 h-5 rounded-xs',
  xl: 'w-9 h-6 rounded-sm'
};

const SIZE_DIMENSIONS: Record<NonNullable<CountryFlagProps['size']>, { w: number; h: number }> = {
  xs: { w: 16, h: 12 },
  sm: { w: 20, h: 14 },
  md: { w: 24, h: 16 },
  lg: { w: 28, h: 20 },
  xl: { w: 36, h: 24 }
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  country,
  size = 'sm',
  showName = false,
  showCode = false,
  className = '',
  flagClassName = ''
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const info = getCountryFlagInfo(country);
  const dims = SIZE_DIMENSIONS[size];

  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      {!imgFailed && info.code !== 'UN' ? (
        <img
          src={info.flagUrl}
          alt={`${info.name} flag`}
          title={`${info.name} (${info.code})`}
          width={dims.w}
          height={dims.h}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
          className={`${SIZE_CLASSES[size]} object-cover border border-slate-300/80 shrink-0 bg-slate-100 ${flagClassName}`}
        />
      ) : (
        <span
          className="text-sm leading-none shrink-0"
          title={`${info.name} (${info.code})`}
        >
          {info.flagEmoji}
        </span>
      )}
      {showName && (
        <span className="truncate">{country || info.name}</span>
      )}
      {showCode && (
        <span className="text-[10px] font-mono text-slate-400 uppercase">({info.code})</span>
      )}
    </span>
  );
};
