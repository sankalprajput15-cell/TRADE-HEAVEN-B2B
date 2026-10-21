import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Globe2, 
  ExternalLink, 
  Mail, 
  MessageCircle, 
  Building2, 
  Package, 
  FileText, 
  Sparkles,
  QrCode,
  Smartphone
} from 'lucide-react';
import { 
  CustomLinkType, 
  buildCustomLink, 
  copyTextToClipboard, 
  shareViaPlatform, 
  shareNative 
} from '../../utils/customLinks';

export interface ShareModalConfig {
  isOpen: boolean;
  type: CustomLinkType;
  id?: string;
  title: string;
  subtitle?: string;
  view?: string;
  category?: string;
  search?: string;
  tab?: string;
  customUrl?: string;
}

interface Props {
  config: ShareModalConfig;
  onClose: () => void;
}

export const ShareCustomLinkModal: React.FC<Props> = ({ config, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState(config.tab || 'OVERVIEW');
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    if (config.tab) {
      setSelectedTab(config.tab);
    }
  }, [config.tab]);

  if (!config.isOpen) return null;

  // Compute live share URL
  const shareUrl = config.customUrl || buildCustomLink({
    type: config.type,
    id: config.id,
    title: config.title,
    view: config.view,
    category: config.category,
    search: config.search,
    tab: config.type === 'STOREFRONT' ? selectedTab : undefined
  });

  const handleCopy = async () => {
    const success = await copyTextToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    await shareNative({
      title: config.title,
      text: config.subtitle || `Check out ${config.title} on Trade Heaven B2B`,
      url: shareUrl
    });
  };

  const getBadgeIcon = () => {
    switch (config.type) {
      case 'STOREFRONT':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'PRODUCT':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'RFQ':
        return <FileText className="w-4 h-4 text-amber-600" />;
      default:
        return <Globe2 className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeLabel = () => {
    switch (config.type) {
      case 'STOREFRONT':
        return 'Verified Supplier Storefront Link';
      case 'PRODUCT':
        return 'Wholesale Catalog Product Link';
      case 'RFQ':
        return 'Active Sourcing Buy Lead Link';
      case 'CATEGORY':
        return 'Industry Sourcing Directory Link';
      default:
        return 'Direct Page Link';
    }
  };

  // QR code image generated via Google Charts API / QuickChart for easy scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              {getBadgeIcon()}
              <span>{getBadgeLabel()}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Custom Deep-Link</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2">
            {config.title}
          </h2>

          {config.subtitle && (
            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Storefront Specific Tab Selector (if applicable) */}
          {config.type === 'STOREFRONT' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Direct Link Landing Tab:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-semibold">
                {[
                  { key: 'OVERVIEW', label: '1. Overview' },
                  { key: 'CATALOG', label: '2. Catalog' },
                  { key: 'COMPLIANCE', label: '3. Compliance' },
                  { key: 'FACTORY_QC', label: '4. Factory & QC' }
                ].map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setSelectedTab(t.key)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                      selectedTab === t.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Copy Link Input & Button */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Shareable Direct URL:</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to copy</span>
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={handleCopy}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-slate-800 outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1-Click Fast Sharing Actions */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              1-Click Share to Partners & Clients:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => shareViaPlatform('whatsapp', { url: shareUrl, title: config.title, summary: config.subtitle })}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer hover:scale-[1.02]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => shareViaPlatform('email', { url: shareUrl, title: config.title, summary: config.subtitle })}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>Email</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => shareViaPlatform('linkedin', { url: shareUrl, title: config.title, summary: config.subtitle })}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
              </button>

              {/* QR Code Toggle */}
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] ${
                  showQrCode
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-purple-600" />
                <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
              </button>
            </div>

            {/* Mobile Native Share Button if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                <span>Open Mobile Sharing Sheet (AirDrop, Messages, Telegram, etc.)</span>
              </button>
            )}
          </div>

          {/* QR Code Display Panel */}
          {showQrCode && (
            <div className="p-4 bg-slate-50 border border-purple-200 rounded-2xl flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-200">
              <img
                src={qrCodeUrl}
                alt={`QR code for ${config.title}`}
                className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
              />
              <p className="text-[11px] text-slate-600 font-medium text-center">
                Scan with any smartphone camera to open directly on mobile
              </p>
            </div>
          )}

          {/* Informational reassurance notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2.5 text-slate-700">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Recipients will land directly here:</strong> When someone clicks or pastes this link, Trade Heaven automatically opens this exact specific view, bypassing default menus.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
