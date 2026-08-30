import React, { useState, useEffect, useRef } from 'react';
import { Globe2, ChevronDown, Check, Search, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', region: 'Global / North America', flag: '🇺🇸', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', region: 'China / APAC', flag: '🇨🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Latin America / Spain', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Middle East / GCC', flag: '🇦🇪', dir: 'rtl' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Europe / DACH', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Europe / France', flag: '🇫🇷', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Brazil / Portugal', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Eurasia / CIS', flag: '🇷🇺', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Japan / East Asia', flag: '🇯🇵', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'India / South Asia', flag: '🇮🇳', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Turkey / Eurasia', flag: '🇹🇷', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Vietnam / ASEAN', flag: '🇻🇳', dir: 'ltr' }
];

interface LanguageRegionSelectorProps {
  variant?: 'compact' | 'mobile' | 'standard';
  className?: string;
  onLanguageChange?: (lang: LanguageOption) => void;
}

export const LanguageRegionSelector: React.FC<LanguageRegionSelectorProps> = ({
  variant = 'compact',
  className = '',
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { currentLanguage, languageCode, setLanguage } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLang = currentLanguage || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick, true);
      document.addEventListener('touchstart', handleOutsideClick, true);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        // Only auto-focus on non-touch devices to prevent mobile keyboard from immediately popping up and breaking layout
        if (window.innerWidth > 768) {
          searchInputRef.current?.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setLanguage(lang.code);

    if (onLanguageChange) {
      onLanguageChange(lang);
    }
    setIsOpen(false);
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (variant === 'mobile') {
    return (
      <div className={`w-full bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Language &amp; Region</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
            {currentLang.flag} {currentLang.code.toUpperCase()}
          </span>
        </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectLanguage(lang);
              }}
              className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] transition-colors text-left cursor-pointer ${
                languageCode === lang.code
                  ? 'bg-blue-600/30 text-sky-300 font-bold border border-blue-500/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </div>
              {languageCode === lang.code && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Compact Trigger Button */}
      <button
        id="language-region-selector-btn"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={`Select Region & Language: ${currentLang.nativeName} (${currentLang.region})`}
        aria-label={`Select Region & Language. Current: ${currentLang.nativeName}`}
        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-700/80 hover:border-sky-500/50 shadow-2xs transition-all text-xs text-slate-200 cursor-pointer group"
      >
        <Globe2 className="w-3.5 h-3.5 text-sky-400 group-hover:text-sky-300 shrink-0 transition-colors" />
        <span className="text-xs leading-none select-none">{currentLang.flag}</span>
        <span className="text-[11px] font-bold font-mono text-slate-200 uppercase tracking-tight">
          {currentLang.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          id="language-region-popover"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1.5 w-[calc(100vw-24px)] max-w-64 sm:max-w-72 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-[9999] overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Header & Search */}
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                Select Region / Language
              </span>
              <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                12 Locales
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search language or region..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-800/40">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching language or region found.
              </div>
            ) : (
              filteredLanguages.map(lang => {
                const isSelected = languageCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectLanguage(lang);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-sky-950/70 border border-sky-600/40 text-sky-200'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base shrink-0 select-none">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-300 font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                            {lang.nativeName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({lang.name})</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                          <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          <span className="truncate">{lang.region}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
                        {lang.code}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-2.5 py-1.5 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Marketplace localized view</span>
            <span className="font-mono text-[9px] text-sky-400">Trade Heaven Global</span>
          </div>
        </div>
      )}
    </div>
  );
};
