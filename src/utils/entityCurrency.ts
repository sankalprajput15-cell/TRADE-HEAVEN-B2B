export interface EntityCurrencyConfig {
  country: string;
  countryCode: string;
  currencyCode: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  inrToLocalRate: number; // Multiply INR amount by this to get the local currency value
}

// Exchange rates based on 1 USD = 84.80 INR
export const ENTITY_CURRENCIES: Record<string, EntityCurrencyConfig> = {
  // United States
  US: {
    country: 'United States',
    countryCode: 'US',
    currencyCode: 'USD',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    inrToLocalRate: 1 / 84.80 // ≈ 0.01179245
  },
  USD: {
    country: 'United States',
    countryCode: 'US',
    currencyCode: 'USD',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    inrToLocalRate: 1 / 84.80
  },
  // Germany / Eurozone
  DE: {
    country: 'Germany',
    countryCode: 'DE',
    currencyCode: 'EUR',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇩🇪',
    inrToLocalRate: 0.92 / 84.80 // ≈ 0.01084905
  },
  EUR: {
    country: 'European Union',
    countryCode: 'EU',
    currencyCode: 'EUR',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇪🇺',
    inrToLocalRate: 0.92 / 84.80
  },
  // Australia
  AU: {
    country: 'Australia',
    countryCode: 'AU',
    currencyCode: 'AUD',
    currency: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
    inrToLocalRate: 1.54 / 84.80 // ≈ 0.01816038
  },
  AUD: {
    country: 'Australia',
    countryCode: 'AU',
    currencyCode: 'AUD',
    currency: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
    inrToLocalRate: 1.54 / 84.80
  },
  // China
  CN: {
    country: 'China',
    countryCode: 'CN',
    currencyCode: 'CNY',
    currency: 'CNY',
    currencySymbol: '¥',
    flag: '🇨🇳',
    inrToLocalRate: 7.24 / 84.80 // ≈ 0.08537736
  },
  CNY: {
    country: 'China',
    countryCode: 'CN',
    currencyCode: 'CNY',
    currency: 'CNY',
    currencySymbol: '¥',
    flag: '🇨🇳',
    inrToLocalRate: 7.24 / 84.80
  },
  // United Kingdom
  GB: {
    country: 'United Kingdom',
    countryCode: 'GB',
    currencyCode: 'GBP',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    inrToLocalRate: 0.79 / 84.80 // ≈ 0.00931604
  },
  GBP: {
    country: 'United Kingdom',
    countryCode: 'GB',
    currencyCode: 'GBP',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    inrToLocalRate: 0.79 / 84.80
  },
  // India
  IN: {
    country: 'India',
    countryCode: 'IN',
    currencyCode: 'INR',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    inrToLocalRate: 1.0
  },
  INR: {
    country: 'India',
    countryCode: 'IN',
    currencyCode: 'INR',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    inrToLocalRate: 1.0
  },
  // Japan
  JP: {
    country: 'Japan',
    countryCode: 'JP',
    currencyCode: 'JPY',
    currency: 'JPY',
    currencySymbol: '¥',
    flag: '🇯🇵',
    inrToLocalRate: 153.20 / 84.80
  },
  JPY: {
    country: 'Japan',
    countryCode: 'JP',
    currencyCode: 'JPY',
    currency: 'JPY',
    currencySymbol: '¥',
    flag: '🇯🇵',
    inrToLocalRate: 153.20 / 84.80
  },
  // UAE
  AE: {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    currencyCode: 'AED',
    currency: 'AED',
    currencySymbol: 'AED',
    flag: '🇦🇪',
    inrToLocalRate: 3.67 / 84.80
  },
  AED: {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    currencyCode: 'AED',
    currency: 'AED',
    currencySymbol: 'AED',
    flag: '🇦🇪',
    inrToLocalRate: 3.67 / 84.80
  }
};

/**
 * Mapping specific buyers and suppliers to their home country and local currency
 */
export const ENTITY_TO_COUNTRY_MAP: Record<string, string> = {
  // Buyers
  'buyer-titan-01': 'US',
  'wal-buyer-titan': 'US',
  'titan global': 'US',
  'user-buyer-001': 'US',
  'david sterling': 'US',

  'buyer-euro-02': 'DE',
  'wal-buyer-euro': 'DE',
  'euromed': 'DE',

  'buyer-apex-03': 'IN',
  'wal-buyer-apex': 'IN',
  'apex agro': 'IN',

  // Suppliers
  'comp-melissa-mpcommodity': 'AU',
  'wal-supp-melissa': 'AU',
  'melissa prezios': 'AU',
  'mp commodity': 'AU',

  'comp-shenzhen-solar': 'CN',
  'wal-supp-shenzhen': 'CN',
  'shenzhen lumina': 'CN',
  'chen wei': 'CN',

  'comp-bharat-steel': 'IN',
  'wal-supp-bharat': 'IN',
  'bharat precision': 'IN',
  'vikramaditya': 'IN',

  'comp-hans-cnc': 'DE',
  'comp-forged-wheels': 'JP',
  'comp-anatolian-yarns': 'TR',

  // Platform Treasury
  'trade-heaven-treasury': 'GB',
  'wal-platform-rev': 'GB',
  'trade heaven global operations': 'GB'
};

/**
 * Resolve country currency config for an entity, wallet, or country string
 */
export function getEntityCurrency(target?: any): EntityCurrencyConfig {
  if (!target) return ENTITY_CURRENCIES.US;

  // If target is an object with country / entity_id / company_name
  if (typeof target === 'object') {
    if (target.native_currency && ENTITY_CURRENCIES[target.native_currency]) {
      return ENTITY_CURRENCIES[target.native_currency];
    }
    if (target.country) {
      const match = findCurrencyByCountry(target.country);
      if (match) return match;
    }
    if (target.entity_id && ENTITY_TO_COUNTRY_MAP[target.entity_id.toLowerCase()]) {
      const code = ENTITY_TO_COUNTRY_MAP[target.entity_id.toLowerCase()];
      return ENTITY_CURRENCIES[code] || ENTITY_CURRENCIES.US;
    }
    if (target.id && ENTITY_TO_COUNTRY_MAP[target.id.toLowerCase()]) {
      const code = ENTITY_TO_COUNTRY_MAP[target.id.toLowerCase()];
      return ENTITY_CURRENCIES[code] || ENTITY_CURRENCIES.US;
    }
    if (target.company_name) {
      const lower = target.company_name.toLowerCase();
      for (const [key, code] of Object.entries(ENTITY_TO_COUNTRY_MAP)) {
        if (lower.includes(key)) return ENTITY_CURRENCIES[code] || ENTITY_CURRENCIES.US;
      }
    }
  }

  // If target is a string (entity ID, country name, or currency code)
  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (ENTITY_CURRENCIES[trimmed.toUpperCase()]) {
      return ENTITY_CURRENCIES[trimmed.toUpperCase()];
    }
    const lower = trimmed.toLowerCase();
    if (ENTITY_TO_COUNTRY_MAP[lower]) {
      const code = ENTITY_TO_COUNTRY_MAP[lower];
      return ENTITY_CURRENCIES[code] || ENTITY_CURRENCIES.US;
    }
    const match = findCurrencyByCountry(trimmed);
    if (match) return match;
  }

  return ENTITY_CURRENCIES.US;
}

function findCurrencyByCountry(countryStr: string): EntityCurrencyConfig | null {
  const lower = countryStr.toLowerCase();
  if (lower.includes('united states') || lower.includes('usa') || lower.includes('america')) return ENTITY_CURRENCIES.US;
  if (lower.includes('germany') || lower.includes('france') || lower.includes('europe') || lower.includes('spain') || lower.includes('italy')) return ENTITY_CURRENCIES.DE;
  if (lower.includes('australia') || lower.includes('aussie')) return ENTITY_CURRENCIES.AU;
  if (lower.includes('china') || lower.includes('chinese')) return ENTITY_CURRENCIES.CN;
  if (lower.includes('united kingdom') || lower.includes('britain') || lower.includes('england') || lower.includes('uk')) return ENTITY_CURRENCIES.GB;
  if (lower.includes('india') || lower.includes('indian')) return ENTITY_CURRENCIES.IN;
  if (lower.includes('japan')) return ENTITY_CURRENCIES.JP;
  if (lower.includes('emirates') || lower.includes('uae') || lower.includes('dubai')) return ENTITY_CURRENCIES.AE;
  return null;
}

/**
 * Format balance in the native currency of the buyer or supplier's country
 */
export function formatBalanceInNativeCurrency(
  paiseVal: string | number,
  target?: any,
  options?: {
    showBoth?: boolean;
    compact?: boolean;
    includeFlag?: boolean;
    includeCode?: boolean;
  }
): {
  primary: string;
  secondary: string;
  nativeAmount: string;
  inrAmount: string;
  symbol: string;
  code: string;
  currency: string;
  country: string;
  flag: string;
  value: number;
} {
  const config = getEntityCurrency(target);
  const paiseNum = Number(paiseVal || 0);
  const inrVal = paiseNum / 100;
  const localVal = inrVal * config.inrToLocalRate;

  const flagPrefix = options?.includeFlag !== false ? `${config.flag} ` : '';
  const codeSuffix = options?.includeCode ? ` ${config.currencyCode}` : '';

  let primary = '';
  if (options?.compact) {
    if (localVal >= 1000000) {
      primary = `${config.currencySymbol}${(localVal / 1000000).toFixed(2)}M${codeSuffix}`;
    } else if (localVal >= 1000) {
      primary = `${config.currencySymbol}${(localVal / 1000).toFixed(1)}k${codeSuffix}`;
    } else {
      primary = `${config.currencySymbol}${localVal.toFixed(2)}${codeSuffix}`;
    }
  } else {
    primary = `${config.currencySymbol}${localVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}${codeSuffix}`;
  }

  // Format the secondary ledger INR equivalent
  let secondary = '';
  if (config.currencyCode === 'INR') {
    // If native is already INR, secondary can show USD
    const usdVal = inrVal / 84.80;
    secondary = `≈ $${usdVal.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`;
  } else {
    secondary = `₹${inrVal.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} INR`;
  }

  const fullPrimary = `${flagPrefix}${primary}`;

  return {
    primary: fullPrimary,
    secondary,
    nativeAmount: fullPrimary,
    inrAmount: secondary,
    symbol: config.currencySymbol,
    code: config.currencyCode,
    currency: config.currencyCode,
    country: config.country,
    flag: config.flag,
    value: localVal
  };
}
