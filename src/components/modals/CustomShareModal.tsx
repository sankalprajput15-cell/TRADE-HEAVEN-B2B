import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Mail, 
  QrCode, 
  ExternalLink, 
  Layers, 
  Building2, 
  Package, 
  FileText, 
  Sparkles, 
  Globe2, 
  Send,
  FileCheck,
  Factory,
  Warehouse,
  PlusCircle,
  BookOpen,
  Users,
  Download,
  Maximize2,
  Minimize2,
  Smartphone,
  ShieldCheck,
  Link2
} from 'lucide-react';
import { 
  CustomLinkTarget, 
  GeneratedCustomLink, 
  buildCustomLink, 
  copyToClipboard, 
  SupplierTab,
  RfqModalTab,
  BuyerModalTab,
  generateScannableQrSvgString,
  generateTradeShowBadgePng,
  slugify
} from '../../utils/customLinkService';
import { SafeImage } from '../common/SafeImage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  target: CustomLinkTarget | null;
}

type ShareViewMode = 'LINK' | 'QR';

export const CustomShareModal: React.FC<Props> = ({ isOpen, onClose, target }) => {
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [selectedTab, setSelectedTab] = useState<SupplierTab>(target?.supplierTab || 'OVERVIEW');
  const [selectedRfqTab, setSelectedRfqTab] = useState<RfqModalTab>(target?.rfqTab || 'DETAILS');
  const [selectedBuyerTab, setSelectedBuyerTab] = useState<BuyerModalTab>(target?.buyerTab || 'OVERVIEW');
  const [viewMode, setViewMode] = useState<ShareViewMode>(target?.autoShowQr ? 'QR' : 'LINK');
  const [qrFgColor, setQrFgColor] = useState<string>('#0f172a');
  const [isBoothFullscreen, setIsBoothFullscreen] = useState(false);
  const [isDownloadingBadge, setIsDownloadingBadge] = useState(false);

  useEffect(() => {
    if (target?.supplierTab) {
      setSelectedTab(target.supplierTab);
    } else {
      setSelectedTab('OVERVIEW');
    }
    if (target?.rfqTab) {
      setSelectedRfqTab(target.rfqTab);
    } else {
      setSelectedRfqTab('DETAILS');
    }
    if (target?.buyerTab) {
      setSelectedBuyerTab(target.buyerTab);
    } else {
      setSelectedBuyerTab('OVERVIEW');
    }
    setCustomNote(target?.customNote || '');
    setCopied(false);
    setViewMode(target?.autoShowQr ? 'QR' : 'LINK');
    setIsBoothFullscreen(false);
  }, [target, isOpen]);

  // Generate dynamic link based on current settings
  const generated: GeneratedCustomLink | null = useMemo(() => {
    if (!target) return null;
    return buildCustomLink({
      ...target,
      supplierTab: target.type === 'SUPPLIER' ? selectedTab : undefined,
      rfqTab: target.type === 'RFQ' ? selectedRfqTab : undefined,
      buyerTab: target.type === 'BUYER' ? selectedBuyerTab : undefined,
      customNote: customNote.trim() || undefined
    });
  }, [target, selectedTab, selectedRfqTab, selectedBuyerTab, customNote]);

  if (!isOpen || !target || !generated) return null;

  const handleCopy = async () => {
    if (!generated) return;
    const success = await copyToClipboard(generated.fullUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getTargetIcon = () => {
    switch (target.type) {
      case 'SUPPLIER':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'PRODUCT':
        return <Package className="w-4 h-4 text-emerald-500" />;
      case 'RFQ':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'BUYER':
        return <Users className="w-4 h-4 text-indigo-500" />;
      case 'ARTICLE':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      default:
        return <Globe2 className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getTargetBadge = () => {
    switch (target.type) {
      case 'SUPPLIER':
        return 'Verified Supplier Storefront';
      case 'PRODUCT':
        return 'Wholesale Product Offer';
      case 'RFQ':
        return 'Active Sourcing RFQ Tender';
      case 'BUYER':
        return 'Verified Corporate Buyer Dossier';
      case 'ARTICLE':
        return 'Trade Heaven Editorial Insight';
      case 'CATEGORY':
        return 'Industry Sourcing Category';
      case 'SEARCH':
        return 'Wholesale Search Results';
      default:
        return 'Trade Heaven Marketplace Page';
    }
  };

  const handleDownloadBadgePng = async () => {
    setIsDownloadingBadge(true);
    try {
      const badgePngUrl = await generateTradeShowBadgePng({
        url: generated.fullUrl,
        badgeType: getTargetBadge(),
        title: target.title || generated.title,
        subtitle: target.subtitle || target.description || generated.summary,
        note: customNote.trim() || undefined
      });
      const link = document.createElement('a');
      const fileSlug = slugify(target.title || generated.title || 'tradeheaven-qr').slice(0, 40);
      link.download = `tradeheaven-qr-badge-${fileSlug || 'item'}.png`;
      link.href = badgePngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloadingBadge(false);
    }
  };

  const handleDownloadQrSvg = async () => {
    const svgString = await generateScannableQrSvgString(generated.fullUrl);
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileSlug = slugify(target.title || generated.title || 'tradeheaven-qr').slice(0, 40);
    link.download = `tradeheaven-qr-${fileSlug || 'item'}.svg`;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold">
                <Share2 className="w-3.5 h-3.5" />
                <span>Direct Link &amp; Mobile QR Code Generator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {viewMode === 'QR' ? 'Scan to Mobile QR Code' : 'Share Custom Direct Link'}
              </h2>
              <p className="text-xs text-slate-300">
                {viewMode === 'QR'
                  ? 'Point any smartphone camera to open this exact target immediately during offline trade shows.'
                  : 'Customize the destination tab or add a note, then copy the link or switch to Scan to Mobile.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary View Mode Toggle: Copy Link vs Scan to Mobile */}
          <div
            role="tablist"
            aria-label="Share view mode"
            className="grid grid-cols-2 p-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'LINK'}
              onClick={() => setViewMode('LINK')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                viewMode === 'LINK'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Copy Link View</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'QR'}
              onClick={() => setViewMode('QR')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                viewMode === 'QR'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan to Mobile (QR Code)</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(90vh-180px)] overflow-y-auto">

          {/* Target Summary Card with Quick Mode Switch */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-3 sm:gap-4 shadow-xs">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              {target.imageUrl ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                  <SafeImage
                    src={target.imageUrl}
                    alt={target.title || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                  {getTargetIcon()}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                  {getTargetIcon()}
                  <span>{getTargetBadge()}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {target.title || generated.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {target.subtitle || target.description || generated.summary}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode(prev => (prev === 'QR' ? 'LINK' : 'QR'))}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 shrink-0 transition-all cursor-pointer ${
                viewMode === 'QR'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
              title={viewMode === 'QR' ? 'Switch to Copy Link View' : 'Switch to Scan to Mobile QR View'}
            >
              {viewMode === 'QR' ? (
                <>
                  <Link2 className="w-5 h-5 text-white" />
                  <span className="text-[10px] whitespace-nowrap">Copy Link</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] whitespace-nowrap">Scan QR</span>
                </>
              )}
            </button>
          </div>

          {/* Supplier Tab Selector if applicable */}
          {target.type === 'SUPPLIER' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Specific Storefront Tab to Share:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'OVERVIEW', label: '1. Overview', icon: Building2 },
                  { id: 'CATALOG', label: '2. Catalog', icon: Package },
                  { id: 'COMPLIANCE', label: '3. Compliance', icon: FileCheck },
                  { id: 'FACTORY_QC', label: '4. Factory & QC', icon: Factory }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id as SupplierTab)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-2 ring-blue-600/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RFQ Tab Selector if applicable */}
          {target.type === 'RFQ' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Select Specific RFQ Tender View to Share:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'DETAILS', label: '1. Tender Specs', icon: FileText },
                  { id: 'QUOTES', label: '2. Factory Quotes', icon: Layers },
                  { id: 'SUBMIT_QUOTE', label: '3. Submit Quote Form', icon: PlusCircle }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedRfqTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRfqTab(tab.id as RfqModalTab)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-xs ring-2 ring-amber-600/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buyer Profile Tab Selector if applicable */}
          {target.type === 'BUYER' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Specific Buyer Profile Tab to Share:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'OVERVIEW', label: '1. Overview', icon: Building2 },
                  { id: 'SOURCING_DEMANDS', label: '2. Active RFQs', icon: FileText },
                  { id: 'WAREHOUSES', label: '3. Warehouses', icon: Warehouse },
                  { id: 'COMPLIANCE', label: '4. KYC & Audit', icon: FileCheck }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedBuyerTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedBuyerTab(tab.id as BuyerModalTab)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add optional note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Add a Personal Note / Booth Instruction (Optional):</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Live-updates Link &amp; QR</span>
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Met at Booth #402 — Check our EN590 CIF Rotterdam specs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>

          {viewMode === 'QR' ? (
            /* SCAN TO MOBILE VIEW (Visual QR Code Generator via qrcode.react) */
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4 animate-in fade-in zoom-in-95 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-white tracking-wide">
                      Scan to Mobile • Offline Trade Show QR Pass
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Point any iOS or Android camera to open this {target.type.toLowerCase()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* QR Color Accent Picker */}
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                    {[
                      { color: '#0f172a', label: 'Slate' },
                      { color: '#1d4ed8', label: 'Trade Blue' },
                      { color: '#047857', label: 'Emerald' }
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => setQrFgColor(swatch.color)}
                        title={`QR Theme: ${swatch.label}`}
                        className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                          qrFgColor === swatch.color ? 'scale-125 border-white' : 'border-slate-500 opacity-70'
                        }`}
                        style={{ backgroundColor: swatch.color }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBoothFullscreen(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Expand QR code for tabletop or booth display"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Booth Display</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-3.5 rounded-2xl border-2 border-blue-400/40 shadow-md shrink-0 flex flex-col items-center">
                  <QRCodeSVG
                    value={generated.fullUrl}
                    size={168}
                    level="H"
                    fgColor={qrFgColor}
                    bgColor="#ffffff"
                    marginSize={1}
                  />
                  <span className="mt-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-500">
                    Scan with Camera
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-blue-300">
                      {getTargetBadge()}
                    </div>
                    <div className="text-sm font-black text-white line-clamp-2">
                      {target.title || generated.title}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {customNote.trim()
                        ? `Includes note: "${customNote.trim()}"`
                        : 'High error-correction QR code encodes your exact target and tab selection.'}
                    </p>
                  </div>

                  {/* Download & Copy Actions inside Scan View */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadBadgePng}
                      disabled={isDownloadingBadge}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingBadge ? 'Preparing Badge...' : 'Download Badge (PNG)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadQrSvg}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vector SVG</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copied ? 'Link Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD COPY LINK VIEW */
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Direct Shareable Link:</span>
                  <span className="font-mono text-[10px] text-slate-500">Works on mobile &amp; desktop</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      readOnly
                      value={generated.fullUrl}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-slate-800 select-all focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        copied
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-100" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('QR')}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span>Scan to Mobile</span>
                    </button>
                  </div>
                </div>
                {copied && (
                  <p className="text-[11px] text-emerald-600 font-bold animate-in fade-in flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Link copied to clipboard! Ready to paste into WhatsApp, email, or chat.</span>
                  </p>
                )}
              </div>

              {/* Instant Share Channels */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">
                  Share Instantly via:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* WhatsApp Button */}
                  <a
                    href={generated.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Email Button */}
                  <a
                    href={generated.emailUrl}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>

                  {/* Scan to Mobile QR Button */}
                  <button
                    type="button"
                    onClick={() => setViewMode('QR')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Scan to Mobile</span>
                  </button>

                  {/* Telegram */}
                  <a
                    href={generated.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={generated.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition-all"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={generated.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-medium transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>X / Twitter</span>
                  </a>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Trade Heaven Custom Link &amp; QR Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

      {/* Fullscreen Trade Show Booth Kiosk Overlay */}
      {isBoothFullscreen && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBoothFullscreen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border-4 border-blue-600 relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsBoothFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Exit Booth Display Mode"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                TRADE HEAVEN • {getTargetBadge()}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {target.title || generated.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {target.subtitle || target.description || generated.summary}
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-inner inline-block mx-auto">
              <QRCodeSVG
                value={generated.fullUrl}
                size={256}
                level="H"
                fgColor={qrFgColor}
                bgColor="#ffffff"
                marginSize={1}
              />
            </div>

            {customNote.trim() && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                "{customNote.trim()}"
              </div>
            )}

            <div className="space-y-2 pt-1">
              <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Scan with Smartphone Camera to Open Instantly</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Counterparty • 100% Escrow Protected Trade</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBadgePng}
                disabled={isDownloadingBadge}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable Badge</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBoothFullscreen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Kiosk View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

