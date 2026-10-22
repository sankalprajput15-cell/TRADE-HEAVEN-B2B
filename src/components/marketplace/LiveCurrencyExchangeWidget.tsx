import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Currency } from '../../types';
import {
  fetchLiveExchangeRates,
  convertCurrency,
  formatFxAmount,
  SUPPORTED_FX_CURRENCIES,
  CurrencyMetadata,
  LiveRatesResponse
} from '../../services/currencyExchangeService';
import {
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Check,
  Copy,
  Search,
  X,
  Coins,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowUpDown,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface Props {
  selectedCurrency?: Currency;
  onCurrencySelect?: (curr: Currency) => void;
  className?: string;
  variant?: 'header' | 'button' | 'embedded';
}

const POPULAR_B2B_AMOUNTS = [
  { label: '$1K', value: 1000 },
  { label: '$10K', value: 10000 },
  { label: '$50K', value: 50000 },
  { label: '$100K', value: 100000 },
  { label: '$500K', value: 500000 }
];

const POPULAR_PAIRS = [
  { from: 'USD', to: 'INR', label: 'USD/INR', desc: 'US - India Trade' },
  { from: 'EUR', to: 'USD', label: 'EUR/USD', desc: 'Europe - US Corridor' },
  { from: 'USD', to: 'CNY', label: 'USD/CNY', desc: 'US - China Manufacturing' },
  { from: 'USD', to: 'AED', label: 'USD/AED', desc: 'GCC / Middle East Hub' },
  { from: 'GBP', to: 'USD', label: 'GBP/USD', desc: 'UK - Global Settlements' },
  { from: 'AUD', to: 'USD', label: 'AUD/USD', desc: 'Commodity Exports' },
  { from: 'USD', to: 'JPY', label: 'USD/JPY', desc: 'Asia Tech Trade' },
  { from: 'USD', to: 'SGD', label: 'USD/SGD', desc: 'APAC Financial Center' }
];

export const LiveCurrencyExchangeWidget: React.FC<Props> = ({
  selectedCurrency = 'USD',
  onCurrencySelect,
  className = '',
  variant = 'header'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'market'>('converter');
  
  // Rate state
  const [fxData, setFxData] = useState<LiveRatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  
  // Converter inputs
  const [amount, setAmount] = useState<number>(10000);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>(
    selectedCurrency === 'USD' ? 'INR' : selectedCurrency
  );
  
  // Currency search inside dropdown selectors
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  
  // Market rates search
  const [marketSearch, setMarketSearch] = useState('');
  
  // Feedback
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [appliedMarketplaceSuccess, setAppliedMarketplaceSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fromPickerRef = useRef<HTMLDivElement>(null);
  const toPickerRef = useRef<HTMLDivElement>(null);

  // Load initial rates
  const loadRates = async (force = false) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveExchangeRates(force);
      setFxData(data);
      setLastRefreshedAt(new Date());
    } catch (e) {
      console.error('Failed to fetch live FX rates', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRates(false);
  }, []);

  // Update `toCurrency` if parent `selectedCurrency` changes and user hasn't explicitly customized yet
  useEffect(() => {
    if (selectedCurrency && selectedCurrency !== fromCurrency) {
      setToCurrency(selectedCurrency);
    }
  }, [selectedCurrency]);

  // Click outside to close widget and sub-pickers
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFromPickerOpen(false);
        setIsToPickerOpen(false);
      }
      if (fromPickerRef.current && !fromPickerRef.current.contains(e.target as Node)) {
        setIsFromPickerOpen(false);
      }
      if (toPickerRef.current && !toPickerRef.current.contains(e.target as Node)) {
        setIsToPickerOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsFromPickerOpen(false);
        setIsToPickerOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Perform dynamic conversion
  const conversion = useMemo(() => {
    const rates = fxData?.rates || {};
    return convertCurrency(amount, fromCurrency, toCurrency, rates);
  }, [amount, fromCurrency, toCurrency, fxData]);

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Copy converted result
  const handleCopyResult = () => {
    const textToCopy = `${conversion.result.toLocaleString(undefined, {
      maximumFractionDigits: 2
    })} ${toCurrency}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  // Set as Trade Heaven Marketplace Currency
  const handleApplyToMarketplace = () => {
    if (onCurrencySelect) {
      // If `toCurrency` is one of the supported platform currencies (USD, EUR, GBP, INR, AED, CNY, JPY)
      const validPlatformCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'CNY', 'JPY'];
      if (validPlatformCurrencies.includes(toCurrency as Currency)) {
        onCurrencySelect(toCurrency as Currency);
        setAppliedMarketplaceSuccess(true);
        setTimeout(() => setAppliedMarketplaceSuccess(false), 2200);
      }
    }
  };

  // Filtered currencies for dropdowns
  const filteredFromCurrencies = useMemo(() => {
    const q = fromSearch.trim().toLowerCase();
    if (!q) return SUPPORTED_FX_CURRENCIES;
    return SUPPORTED_FX_CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [fromSearch]);

  const filteredToCurrencies = useMemo(() => {
    const q = toSearch.trim().toLowerCase();
    if (!q) return SUPPORTED_FX_CURRENCIES;
    return SUPPORTED_FX_CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [toSearch]);

  // Market matrix list
  const filteredMarketCurrencies = useMemo(() => {
    const q = marketSearch.trim().toLowerCase();
    return SUPPORTED_FX_CURRENCIES.filter(c => {
      if (c.code === 'USD') return false; // base
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    });
  }, [marketSearch]);

  const fromMeta = SUPPORTED_FX_CURRENCIES.find(c => c.code === fromCurrency) || SUPPORTED_FX_CURRENCIES[0];
  const toMeta = SUPPORTED_FX_CURRENCIES.find(c => c.code === toCurrency) || SUPPORTED_FX_CURRENCIES[2];

  // Quick live rate for the header ticker
  const usdInrRate = fxData?.rates?.['INR'] ? fxData.rates['INR'].toFixed(2) : '84.82';
  const usdEurRate = fxData?.rates?.['EUR'] ? fxData.rates['EUR'].toFixed(3) : '0.925';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Header Bar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="h-9 px-2.5 rounded-lg border border-slate-200/90 hover:border-blue-400 bg-white hover:bg-slate-50/90 text-slate-800 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-2xs group"
        title="Live Currency Exchange & Interbank Converter"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-180 transition-transform duration-300" />
        </div>

        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-semibold text-slate-900 hidden sm:inline">Live FX</span>
          <span className="hidden md:inline text-slate-400 font-normal">|</span>
          <span className="text-[11px] font-mono font-medium text-slate-600 hidden md:inline">
            USD/INR {usdInrRate}
          </span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Popover / Modal Container */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[460px] md:w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 sm:p-5 z-50 text-slate-800 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-none">
                    Live FX &amp; Currency Exchange
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Feed
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time market rates for B2B cross-border contracts &amp; escrow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => loadRates(true)}
                disabled={isLoading}
                title="Refresh live market rates"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between gap-2 my-3">
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full">
              <button
                type="button"
                onClick={() => setActiveTab('converter')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'converter'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Quick Converter</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('market')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'market'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Market Rates Matrix</span>
              </button>
            </div>
          </div>

          {/* TAB 1: QUICK CONVERTER */}
          {activeTab === 'converter' && (
            <div className="space-y-3.5">
              {/* Amount Input & B2B Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="fx-amount" className="text-xs font-semibold text-slate-700">
                    Amount to Convert
                  </label>
                  <div className="flex items-center gap-1">
                    {POPULAR_B2B_AMOUNTS.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setAmount(preset.value)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                          amount === preset.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-semibold text-slate-400 text-sm">
                    {fromMeta.symbol}
                  </span>
                  <input
                    id="fx-amount"
                    type="number"
                    min="0"
                    step="any"
                    value={amount === 0 ? '' : amount}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setAmount(isNaN(val) ? 0 : val);
                    }}
                    placeholder="Enter amount"
                    className="w-full h-11 pl-9 pr-14 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-sm font-semibold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                    {fromCurrency}
                  </span>
                </div>
              </div>

              {/* Currency Pair Selectors with Swap Button */}
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                {/* From Selector */}
                <div className="relative" ref={fromPickerRef}>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    From
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFromPickerOpen(prev => !prev);
                      setIsToPickerOpen(false);
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none shrink-0">{fromMeta.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {fromMeta.code}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate leading-tight">
                          {fromMeta.name}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* From Dropdown Picker */}
                  {isFromPickerOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fromSearch}
                          onChange={e => setFromSearch(e.target.value)}
                          placeholder="Search currency or country..."
                          className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {filteredFromCurrencies.map(curr => (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => {
                              setFromCurrency(curr.code);
                              setIsFromPickerOpen(false);
                              setFromSearch('');
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              curr.code === fromCurrency
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-base">{curr.flag}</span>
                              <span className="font-bold">{curr.code}</span>
                              <span className="text-slate-400 text-[11px] truncate">{curr.name}</span>
                            </span>
                            {curr.code === fromCurrency && (
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Animated Swap Button */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwap}
                    title="Swap currencies"
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all cursor-pointer hover:rotate-180"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Selector */}
                <div className="relative" ref={toPickerRef}>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    To
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsToPickerOpen(prev => !prev);
                      setIsFromPickerOpen(false);
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none shrink-0">{toMeta.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {toMeta.code}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate leading-tight">
                          {toMeta.name}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* To Dropdown Picker */}
                  {isToPickerOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={toSearch}
                          onChange={e => setToSearch(e.target.value)}
                          placeholder="Search currency or country..."
                          className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {filteredToCurrencies.map(curr => (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => {
                              setToCurrency(curr.code);
                              setIsToPickerOpen(false);
                              setToSearch('');
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              curr.code === toCurrency
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-base">{curr.flag}</span>
                              <span className="font-bold">{curr.code}</span>
                              <span className="text-slate-400 text-[11px] truncate">{curr.name}</span>
                            </span>
                            {curr.code === toCurrency && (
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion Result Display Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase flex items-center justify-between">
                  <span>Converted B2B Settlement</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Interbank Mid-Market
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-2">
                    <span className="text-blue-400">{toMeta.symbol}</span>
                    <span>
                      {conversion.result.toLocaleString(undefined, {
                        minimumFractionDigits: toMeta.decimals,
                        maximumFractionDigits: toMeta.decimals
                      })}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-sans">
                      {toCurrency}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {amount.toLocaleString()} {fromCurrency} = {formatFxAmount(conversion.result, toCurrency)}
                  </div>
                </div>

                {/* Direct Cross-Rates Formula */}
                <div className="pt-2 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-mono">
                  <div>
                    1 {fromCurrency} ={' '}
                    <span className="text-white font-semibold">
                      {conversion.rate < 0.01
                        ? conversion.rate.toFixed(6)
                        : conversion.rate.toFixed(4)}{' '}
                      {toCurrency}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    1 {toCurrency} ={' '}
                    <span>
                      {conversion.inverseRate < 0.01
                        ? conversion.inverseRate.toFixed(6)
                        : conversion.inverseRate.toFixed(4)}{' '}
                      {fromCurrency}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Copy & Apply */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedAmount ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy Amount</span>
                      </>
                    )}
                  </button>

                  {toMeta.isPlatformCurrency && onCurrencySelect && (
                    <button
                      type="button"
                      onClick={handleApplyToMarketplace}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {appliedMarketplaceSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Applied to Store!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Use in Store ({toCurrency})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Popular Cross-Border Trading Pairs Shortcuts */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Popular B2B Trade Corridors
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {POPULAR_PAIRS.slice(0, 4).map(pair => (
                    <button
                      key={pair.label}
                      type="button"
                      onClick={() => {
                        setFromCurrency(pair.from);
                        setToCurrency(pair.to);
                      }}
                      className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        fromCurrency === pair.from && toCurrency === pair.to
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                          : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{pair.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{pair.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE MARKET RATES MATRIX */}
          {activeTab === 'market' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={marketSearch}
                  onChange={e => setMarketSearch(e.target.value)}
                  placeholder="Filter currencies (e.g. INR, EUR, CNY, Dirham)..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                <div className="bg-slate-100/80 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider grid grid-cols-[1.5fr,1.2fr,1fr,auto] items-center gap-2">
                  <span>Currency</span>
                  <span className="text-right">1 USD Rate</span>
                  <span className="text-right">24h Trend</span>
                  <span>Action</span>
                </div>

                {filteredMarketCurrencies.map(curr => {
                  const rate = fxData?.rates?.[curr.code] || 1;
                  const change = fxData?.changes24h?.[curr.code] || 0;
                  const isPositive = change >= 0;

                  return (
                    <div
                      key={curr.code}
                      className="px-3 py-2 text-xs grid grid-cols-[1.5fr,1.2fr,1fr,auto] items-center gap-2 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none">{curr.flag}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 leading-tight">
                            {curr.code}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate leading-tight">
                            {curr.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono font-semibold text-slate-800">
                        {rate < 0.1 ? rate.toFixed(4) : rate < 100 ? rate.toFixed(3) : rate.toFixed(1)}
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          <span>{isPositive ? `+${change}%` : `${change}%`}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFromCurrency('USD');
                          setToCurrency(curr.code);
                          setActiveTab('converter');
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                        title={`Convert USD to ${curr.code}`}
                      >
                        Convert
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Info & Disclaimers */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                Updated: {fxData?.lastUpdated || 'Live'} ({fxData?.source === 'api' ? 'Interbank API' : 'Cached Feed'})
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Escrow Rate Guarantee</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
