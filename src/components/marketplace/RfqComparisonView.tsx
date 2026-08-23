import React, { useState } from 'react';
import { RfqRequirement, SupplierQuote, Currency, Incoterm } from '../../types';
import { MOCK_QUOTES, CURRENCY_RATES } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  FileText, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Building, 
  Truck, 
  Layers, 
  ArrowRight, 
  PlusCircle, 
  Download, 
  Sparkles,
  Calendar,
  DollarSign,
  Radio,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface Props {
  rfqs: RfqRequirement[];
  selectedRfqId: string | null;
  onSelectRfqId: (id: string) => void;
  selectedCurrency: Currency;
  onOpenCreateRfq: () => void;
  onAcceptQuote: (quote: SupplierQuote) => void;
}

export const RfqComparisonView: React.FC<Props> = ({
  rfqs,
  selectedRfqId,
  onSelectRfqId,
  selectedCurrency,
  onOpenCreateRfq,
  onAcceptQuote
}) => {
  const activeRfq = (rfqs || []).find(r => r.id === selectedRfqId) || (rfqs && rfqs[0]);
  const relatedQuotes = (MOCK_QUOTES || []).filter(q => q.rfqId === activeRfq?.id);

  const curr = (CURRENCY_RATES || []).find(c => c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div id="rfq-comparison-hub" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Supplier Bid Evaluation &amp; Proforma Comparison Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            RFQ Sourcing Hub &amp; Quotation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
            Compare structured supplier bids across FOB unit rates, Incoterms, sea-freight transit times, and payment terms side-by-side.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New RFQ</span>
          </button>
          
          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Sourcing Desk WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Layout: RFQ Selector Left + Quotes Comparison Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active RFQs List Left */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Sourcing Tenders ({rfqs.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Real-time Feed</span>
          </div>

          <div className="space-y-2.5">
            {rfqs.map(rfq => {
              const isSelected = rfq.id === activeRfq?.id;
              const quotesCount = MOCK_QUOTES.filter(q => q.rfqId === rfq.id).length;

              return (
                <div
                  key={rfq.id}
                  onClick={() => onSelectRfqId(rfq.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {rfq.id}
                        </span>
                        <span className="text-xs font-bold text-slate-500 truncate">{rfq.category}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {rfq.productName}
                      </h4>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      {quotesCount} Bids
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Volume Target:</span>
                      <div className="font-mono font-bold text-slate-900 text-[11px]">
                        {rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Destination:</span>
                      <div className="font-bold text-slate-800 text-[11px] truncate">
                        {rfq.destinationPort}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected RFQ & Comparison Studio Right */}
        <div className="lg:col-span-8 space-y-6">
          {activeRfq ? (
            <>
              {/* Selected RFQ Header Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Selected RFQ Tender • {activeRfq.id}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      {activeRfq.productName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border font-mono">
                      Target: <strong>{formatPrice(activeRfq.targetPriceUsd)}</strong> / {activeRfq.quantityUnit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px]">Buyer Enterprise:</span>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">{activeRfq.buyerCompany}</div>
                    <div className="text-[10px] text-slate-500">{activeRfq.buyerCountry}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px]">Shipping Term:</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{activeRfq.preferredIncoterm}</div>
                    <div className="text-[10px] text-slate-500">{activeRfq.destinationPort}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px]">Payment Terms:</span>
                    <div className="font-semibold text-slate-900 mt-0.5 truncate">{activeRfq.paymentTerms}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px]">Target Delivery:</span>
                    <div className="font-mono font-bold text-emerald-700 mt-0.5">{activeRfq.targetDeliveryDate}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
                  <strong>Specifications Note:</strong> {activeRfq.detailedDescription}
                </div>
              </div>

              {/* Quotations Matrix Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Received Factory Quotations ({relatedQuotes.length})
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Sorted by ISO Compliance &amp; Unit FOB Pricing
                </span>
              </div>

              {/* Quotes Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedQuotes.map(quote => (
                  <div
                    key={quote.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all space-y-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Supplier Top Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              {quote.supplierTier}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{quote.supplierCountry}</span>
                          </div>
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {quote.supplierName}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-mono">Trust Score</div>
                          <div className="font-black text-emerald-600 text-sm font-mono">
                            {quote.supplierTrustScore} / 100
                          </div>
                        </div>
                      </div>

                      {/* Financial Bid Details */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-500">Quoted Unit Price:</span>
                          <span className="text-base font-black text-emerald-700 font-mono">
                            {formatPrice(quote.unitPriceUsd)} <span className="text-xs font-normal text-slate-500">({quote.incoterm})</span>
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                          <span className="text-slate-500">Total Cargo Value:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatPrice(quote.totalAmountUsd)}
                          </span>
                        </div>
                      </div>

                      {/* Technical Breakdown */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Dispatch Port:</span>
                          <strong className="text-slate-900">{quote.dispatchPort}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Production Lead Time:</span>
                          <strong className="text-slate-900">{quote.productionLeadTimeDays} Days</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Estimated Transit:</span>
                          <strong className="text-slate-900">{quote.estimatedTransitDays} Days ({quote.shippingMethod})</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Payment Terms:</span>
                          <strong className="text-slate-900 text-right truncate max-w-[170px]">{quote.paymentTerms}</strong>
                        </div>
                      </div>

                      {/* Quotation Note */}
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-slate-600 italic">
                        "{quote.technicalNotes}"
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => onAcceptQuote(quote)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Bid &amp; Generate Proforma Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
              Select an RFQ on the left to review incoming quotations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
