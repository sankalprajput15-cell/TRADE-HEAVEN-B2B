import React, { useState, useEffect, useRef } from 'react';
import { Product, Currency, Incoterm } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { SafeImage } from '../common/SafeImage';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { bigrockApi } from '../../services/bigrockApi';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Building, 
  Truck, 
  FileText, 
  Send, 
  Layers, 
  Box, 
  Globe2, 
  CheckCircle2, 
  Calculator,
  Download,
  AlertCircle,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  product: Product;
  selectedCurrency: Currency;
  onClose: () => void;
  onOpenStorefront: (supplierId: string) => void;
  onStartNegotiation: (product: Product, quantity: number, targetPriceUsd: number, incoterm: Incoterm) => void;
}

export const ProductDetailModal: React.FC<Props> = ({
  product,
  selectedCurrency,
  onClose,
  onOpenStorefront,
  onStartNegotiation
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedIncoterm, setSelectedIncoterm] = useState<Incoterm>(product?.supportedIncoterms?.[0] || 'FOB');
  const [orderQuantity, setOrderQuantity] = useState<number>(product?.moq || 1);
  const [customInquiryNote, setCustomInquiryNote] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
  }, [product?.id]);

  const curr = (CURRENCY_RATES || []).find(c => c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  // Determine active price tier
  const matchedTier = (product?.priceTiers || []).find(tier => {
    if (tier.maxUnits) {
      return orderQuantity >= tier.minUnits && orderQuantity <= tier.maxUnits;
    }
    return orderQuantity >= tier.minUnits;
  }) || product?.priceTiers?.[0] || { minUnits: 1, maxUnits: 100, priceUsd: 100 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);

    try {
      await bigrockApi.submitRfq({
        buyer_name: 'Procurement Buyer',
        buyer_email: 'buyer@tradeheaven.net',
        buyer_phone: '',
        buyer_company: 'Procurement Buyer Enterprise',
        buyer_country: 'United States',
        product_name: product.title,
        category: product.category,
        quantity: orderQuantity,
        quantity_unit: product.moqUnit || 'Units',
        target_price: matchedTier.priceUsd,
        incoterm: selectedIncoterm,
        destination_port: product.portOfDispatch || 'Port of Hamburg',
        payment_terms: 'Trade Protection Certificate (Swiss Vault)',
        requirements: `Product ID: ${product.id} | Supplier: ${product.supplierName} (${product.supplierCountry}) | Incoterm: ${selectedIncoterm} | Target Unit Rate: $${matchedTier.priceUsd} | Buyer Note: ${customInquiryNote || 'Seeking FOB/CIF commercial quotation and lead times.'}`,
        name: 'Procurement Buyer',
        email: 'buyer@tradeheaven.net',
        phone: '',
        subject: `Direct Product Inquiry: ${orderQuantity} ${product.moqUnit || 'Units'} of ${product.title}`,
        message: `Product ID: ${product.id} | Supplier: ${product.supplierName} (${product.supplierCountry}) | Incoterm: ${selectedIncoterm} | Target Unit Rate: $${matchedTier.priceUsd} | Buyer Note: ${customInquiryNote || 'Seeking FOB/CIF commercial quotation and lead times.'}`
      });
      window.dispatchEvent(new CustomEvent('tradeheaven_rfq_created'));
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      onStartNegotiation(product, orderQuantity, matchedTier.priceUsd, selectedIncoterm);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col overflow-hidden shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white/90 hover:text-white transition-colors cursor-pointer shadow-md"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div ref={modalScrollRef} className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Top Section: Media + Pricing & Inquiry Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Left */}
            <div className="lg:col-span-5 space-y-3">
              <div className="h-64 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 relative">
                <SafeImage
                  src={product?.images?.[activeImageIdx] || product?.images?.[0] || ''}
                  alt={product?.title || 'Product Image'}
                  className="w-full h-full"
                />
              </div>

              {/* Thumbnails */}
              {(product?.images?.length ?? 0) > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(product?.images || []).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIdx === idx ? 'border-blue-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage src={img} alt="" className="w-full h-full" />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Supplier Trust Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-600">Verified Manufacturer</div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black bg-amber-100 text-amber-900 border border-amber-300">
                    {product.supplierTier} TIER
                  </span>
                </div>

                <div 
                  onClick={() => onOpenStorefront(product.supplierId)}
                  className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>{product.supplierName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[11px] font-medium">Trust Score:</span>
                    <div className="font-black text-emerald-600 font-mono">{product.supplierTrustScore} / 100</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] font-medium">Dispatch Port:</span>
                    <div className="font-bold text-slate-800 truncate">{product.portOfDispatch}</div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenStorefront(product.supplierId)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Visit Verified Storefront &amp; Factory Audit</span>
                </button>
              </div>
            </div>

            {/* Product Details & Volume Pricing Right */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                  {product.category} • {product.subCategory}
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {product.title}
                </h1>
              </div>

              {/* Volume FOB Pricing Matrix Table */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Tiered Volume FOB Pricing Matrix</span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">Currency: {curr.code}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(product?.priceTiers || []).map((tier, idx) => {
                    const isSelected = orderQuantity >= tier.minUnits && (!tier.maxUnits || orderQuantity <= tier.maxUnits);
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] text-slate-500 font-medium">
                          {tier.minUnits} {tier.maxUnits ? `- ${tier.maxUnits}` : '+'} {product.moqUnit || 'Units'}
                        </div>
                        <div className="text-sm sm:text-base font-black text-emerald-700 font-mono mt-0.5">
                          {formatPrice(tier.priceUsd)}
                        </div>
                        <div className="text-[10px] text-slate-400">per {product.moqUnit || 'Unit'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Configurator & Instant RFQ Generator */}
              <form onSubmit={handleInquirySubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Order Quantity (Min: {product.moq || 1} {product.moqUnit || 'Units'})
                    </label>
                    <input
                      id="pdp-quantity-input"
                      type="number"
                      min={product.moq || 1}
                      step="1"
                      value={orderQuantity}
                      onChange={e => setOrderQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || product.moq || 1))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-none shadow-xs"
                    />
                  </div>
                  {/* Incoterm Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Incoterm</label>
                    <select
                      id="pdp-incoterm-select"
                      value={selectedIncoterm}
                      onChange={e => setSelectedIncoterm(e.target.value as Incoterm)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-none cursor-pointer shadow-xs"
                    >
                      {(product.supportedIncoterms || ['FOB', 'CIF', 'EXW', 'DDP']).map(term => (
                        <option key={term} value={term}>{term} (Shipping &amp; Port Delivery)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subtotal Calculation */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Estimated Cargo Value ({orderQuantity} {product.moqUnit || 'Units'})</div>
                    <div className="text-lg font-black text-slate-900 font-mono">
                      {formatPrice((matchedTier?.priceUsd ?? product.fobPriceUsd ?? 0) * orderQuantity)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-700 font-bold">
                    <ShieldCheck className="w-4 h-4 inline mr-1 text-emerald-600" />
                    Trade Protection Certificate Included
                  </div>
                </div>

                {/* Custom Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Inquiry / Packaging Specification</label>
                  <textarea
                    id="pdp-inquiry-notes"
                    rows={2}
                    placeholder="Specify destination port, packaging requirements, OEM logo printing, or custom dimensions..."
                    value={customInquiryNote}
                    onChange={e => setCustomInquiryNote(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
                  />
                </div>

                {/* Action Buttons: Negotiation & WhatsApp Direct */}
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={inquirySent}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                      inquirySent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {inquirySent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Opening Live Negotiation Room...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Start Direct Trade Negotiation / Request Proforma Invoice</span>
                      </>
                    )}
                  </button>

                  {/* Direct WhatsApp Instant Quote Button */}
                  <a
                    href={`https://wa.me/918532934479?text=${encodeURIComponent(`Hello Trade Heaven, I am interested in sourcing ${orderQuantity} ${product.moqUnit} of "${product.title}" with ${selectedIncoterm} shipping.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire Instant MOQ &amp; Price on WhatsApp (+91 8532934479)</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* Technical Specifications Table & Packaging */}
          <div className="space-y-3.5 pt-5 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Technical Parameter Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(product?.specifications || []).map((spec, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">{spec.name}</span>
                  <span className="text-slate-900 font-bold text-right">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-600" /> Packaging &amp; Sea-Freight Logistics
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{product.packagingDetails}</p>
              <div className="text-slate-600 text-[11px] font-medium">
                Monthly Supply Capability: <strong className="text-slate-900">{product.supplyAbilityPerMonth}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
