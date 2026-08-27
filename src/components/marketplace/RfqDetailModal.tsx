import React, { useState, useEffect } from 'react';
import { RfqRequirement, SupplierQuote, Currency, Incoterm, AuthUser } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { PremiumContactGate } from '../common/PremiumContactGate';
import { 
  X, 
  FileText, 
  Building2, 
  Globe2, 
  ShieldCheck, 
  Award, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Send, 
  PlusCircle, 
  ExternalLink, 
  MessageCircle, 
  Lock, 
  Crown,
  Layers,
  Clock,
  Anchor,
  Box,
  Check
} from 'lucide-react';

interface Props {
  rfq: RfqRequirement;
  selectedCurrency: Currency;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  onOpenBuyerProfile?: (buyerId: string) => void;
  onOpenNegotiation?: () => void;
  onAcceptQuote?: (quote: SupplierQuote) => void;
}

export const RfqDetailModal: React.FC<Props> = ({
  rfq,
  selectedCurrency,
  onClose,
  currentUser = null,
  onOpenUpgradeModal,
  onOpenBuyerProfile,
  onOpenNegotiation,
  onAcceptQuote
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'QUOTES' | 'SUBMIT_QUOTE'>('DETAILS');
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    supplierName: currentUser?.companyName || 'Verified Global Exporter',
    supplierTier: (currentUser?.isPremium ? 'GOLD' : 'SILVER') as 'GOLD' | 'SILVER' | 'VIP',
    supplierCountry: currentUser?.country || 'United States',
    unitPriceUsd: rfq?.targetPriceUsd ? rfq.targetPriceUsd * 0.95 : 100,
    offeredIncoterm: (rfq?.preferredIncoterm || 'FOB') as Incoterm,
    dispatchPort: rfq?.destinationPort ? `Export Port to ${rfq.destinationPort}` : 'Shenzhen Yantian / Ningbo',
    productionLeadTimeDays: 14,
    estimatedTransitDays: 20,
    shippingMethod: 'Ocean Freight (FCL Container)',
    paymentTerms: '30% T/T Deposit, 70% against B/L copy',
    sampleOffered: true,
    technicalNotes: 'Direct factory quote strictly following buyer specifications. ISO9001 and SGS inspection included.'
  });

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const loadQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const data = await api.getQuotesForRfq(rfq.id);
      setQuotes(data || []);
    } catch (err) {
      console.error('Failed to load quotes for rfq:', err);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (rfq?.id) {
      loadQuotes();
    }
  }, [rfq?.id]);

  const totalCargoBudget = (rfq.targetPriceUsd || 0) * (rfq.targetQuantity || 1);
  const quoteTotalValue = (quoteForm.unitPriceUsd || 0) * (rfq.targetQuantity || 1);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitSupplierQuote({
        rfqId: rfq.id,
        supplierId: currentUser?.id || 'comp-verified-supplier',
        supplierName: quoteForm.supplierName,
        supplierTier: quoteForm.supplierTier,
        supplierCountry: quoteForm.supplierCountry,
        unitPriceUsd: Number(quoteForm.unitPriceUsd),
        totalAmountUsd: Number(quoteTotalValue),
        offeredIncoterm: quoteForm.offeredIncoterm,
        incoterm: quoteForm.offeredIncoterm,
        portOfLoading: quoteForm.dispatchPort,
        dispatchPort: quoteForm.dispatchPort,
        leadTimeDays: Number(quoteForm.productionLeadTimeDays),
        productionLeadTimeDays: Number(quoteForm.productionLeadTimeDays),
        estimatedTransitDays: Number(quoteForm.estimatedTransitDays),
        shippingMethod: quoteForm.shippingMethod,
        paymentTerms: quoteForm.paymentTerms,
        sampleOffered: quoteForm.sampleOffered,
        notes: quoteForm.technicalNotes,
        technicalNotes: quoteForm.technicalNotes
      });

      if (res.success) {
        setSubmitSuccess(true);
        await loadQuotes();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('QUOTES');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit quote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        id="rfq-detail-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {rfq.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {rfq.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Sourcing Tender
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white line-clamp-1">
              {rfq.productName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2 font-medium">
              <span>Target Buyer: <strong>{rfq.buyerCompany}</strong> ({rfq.buyerCountry})</span>
              <span>•</span>
              <span>Posted: {rfq.postedDate || 'Recent'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tender Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('QUOTES')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'QUOTES'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Received Factory Quotes ({quotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SUBMIT_QUOTE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'SUBMIT_QUOTE'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Submit Factory Quotation</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'DETAILS' && (
            <div className="space-y-6">
              {/* Financial & Shipping Highlights Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Target Volume</span>
                  <div className="text-base font-mono font-black text-slate-900 mt-1">
                    {rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">Target Unit Price</span>
                  <div className="text-base font-mono font-black text-blue-900 mt-1">
                    {formatPrice(rfq.targetPriceUsd)} <span className="text-xs font-normal text-blue-700">/ {rfq.quantityUnit}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Est. Total Cargo Value</span>
                  <div className="text-base font-mono font-black text-emerald-900 mt-1">
                    {formatPrice(totalCargoBudget)}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Shipping Incoterm</span>
                  <div className="text-base font-mono font-black text-slate-900 mt-1">
                    {rfq.preferredIncoterm}
                  </div>
                </div>
              </div>

              {/* Specifications Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Procurement Specifications &amp; Requirements</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {rfq.detailedRequirements || rfq.detailedDescription || 'Buyer is seeking verified manufacturers capable of producing high-volume cargo meeting international ISO and CE standards.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Destination Port:</span>
                    <strong className="text-slate-900 font-bold">{rfq.destinationPort || 'Major International Container Port'}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Target Delivery Date:</span>
                    <strong className="text-emerald-700 font-mono font-bold">{rfq.targetDeliveryDate || '30 - 45 Days'}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Payment Term Preference:</span>
                    <strong className="text-slate-900 font-semibold">{rfq.paymentTerms || '30% T/T Deposit, 70% against B/L or trade protection'}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Tender Expiry:</span>
                    <strong className="text-slate-700 font-mono">{rfq.expiryDate || '30 Days Remaining'}</strong>
                  </div>
                </div>
              </div>

              {/* Buyer Enterprise Identity Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Buyer Enterprise Dossier</span>
                  </div>

                  {onOpenBuyerProfile && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBuyerProfile(rfq.buyerId || 'buyer-001');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Buyer Full Profile &amp; Warehouses</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{rfq.buyerCompany}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{rfq.buyerCountry} • Verified Corporate Importer</div>
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>D&amp;B Verified Enterprise Buyer</span>
                    </div>
                  </div>

                  {/* Gated Contacts */}
                  <div>
                    <PremiumContactGate
                      currentUser={currentUser}
                      onOpenUpgradeModal={onOpenUpgradeModal || (() => {})}
                      isMasked={Boolean(rfq.isContactMasked)}
                      resourceTitle="Buyer Direct Procurement Desk"
                    >
                      <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                        <div><strong>Contact Officer:</strong> {rfq.buyerName || 'Procurement Director'}</div>
                        <div><strong>Email:</strong> {rfq.buyerEmail || 'procurement@tradebuyer.org'}</div>
                        <div><strong>Phone:</strong> {rfq.buyerPhone || '+1 (555) 902-8411'}</div>
                      </div>
                    </PremiumContactGate>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'QUOTES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Submitted Factory Quotes ({quotes.length})</span>
                </h3>

                <button
                  onClick={() => setActiveTab('SUBMIT_QUOTE')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit Your Factory Bid</span>
                </button>
              </div>

              {isLoadingQuotes ? (
                <div className="p-8 text-center text-slate-500">Loading incoming factory bids...</div>
              ) : quotes.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">No factory quotes submitted yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Be the first verified factory to submit a formal price bid for this tender requirement.
                  </p>
                  <button
                    onClick={() => setActiveTab('SUBMIT_QUOTE')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit Competitive Factory Quote</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotes.map(quote => (
                    <div
                      key={quote.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all space-y-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {quote.supplierTier}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{quote.supplierCountry}</span>
                            </div>
                            <div className="font-bold text-sm text-slate-900 mt-1 truncate">
                              {quote.supplierName}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">Trust Score</div>
                            <div className="font-black text-emerald-600 text-sm font-mono">
                              {quote.supplierTrustScore || 95} / 100
                            </div>
                          </div>
                        </div>

                        {/* Price Card */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-slate-500">Unit Price:</span>
                            <span className="text-base font-mono font-black text-emerald-700">
                              {formatPrice(quote.unitPriceUsd)} <span className="text-xs font-normal text-slate-500">({quote.incoterm || quote.offeredIncoterm})</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                            <span className="text-slate-500">Total Cargo Value:</span>
                            <span className="font-mono font-bold text-slate-900">
                              {formatPrice(quote.totalAmountUsd || quote.unitPriceUsd * rfq.targetQuantity)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Port of Loading:</span>
                            <strong className="text-slate-900">{quote.dispatchPort || quote.portOfLoading}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Production Lead Time:</span>
                            <strong className="text-slate-900">{quote.productionLeadTimeDays || quote.leadTimeDays} Days</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Terms:</span>
                            <strong className="text-slate-900 truncate max-w-[160px]">{quote.paymentTerms}</strong>
                          </div>
                        </div>

                        <div className="p-2 bg-blue-50/60 rounded-lg text-[11px] text-slate-600 italic">
                          "{quote.notes || quote.technicalNotes}"
                        </div>
                      </div>

                      <div className="pt-2">
                        {onAcceptQuote && (
                          <button
                            onClick={() => {
                              onClose();
                              onAcceptQuote(quote);
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Bid &amp; Open Negotiation</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'SUBMIT_QUOTE' && (
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>Official Tender Bid Submission:</strong> Your factory quotation will be evaluated by {rfq.buyerCompany}. Provide your most competitive FOB/CIF rates.
                </div>
              </div>

              {submitSuccess && (
                <div className="bg-emerald-600 text-white p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Factory quotation successfully submitted! Redirecting to quotes matrix...</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Supplier / Factory Name *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.supplierName}
                    onChange={e => setQuoteForm({ ...quoteForm, supplierName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Export Country *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.supplierCountry}
                    onChange={e => setQuoteForm({ ...quoteForm, supplierCountry: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Quoted Unit Price (USD) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={quoteForm.unitPriceUsd}
                      onChange={e => setQuoteForm({ ...quoteForm, unitPriceUsd: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Buyer Target: ${rfq.targetPriceUsd}/unit • Est. Total: {formatPrice(quoteTotalValue)}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Offered Incoterm *</label>
                  <select
                    value={quoteForm.offeredIncoterm}
                    onChange={e => setQuoteForm({ ...quoteForm, offeredIncoterm: e.target.value as Incoterm })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="FOB">FOB - Free on Board</option>
                    <option value="CIF">CIF - Cost, Insurance, Freight</option>
                    <option value="DDP">DDP - Delivered Duty Paid</option>
                    <option value="CFR">CFR - Cost and Freight</option>
                    <option value="EXW">EXW - Ex Works</option>
                    <option value="FCA">FCA - Free Carrier</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Port of Loading / Dispatch Port *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.dispatchPort}
                    onChange={e => setQuoteForm({ ...quoteForm, dispatchPort: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Production Lead Time (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quoteForm.productionLeadTimeDays}
                    onChange={e => setQuoteForm({ ...quoteForm, productionLeadTimeDays: parseInt(e.target.value) || 14 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold font-mono focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Payment Terms Offered *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.paymentTerms}
                    onChange={e => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Technical Notes &amp; Quality Assurances</label>
                  <textarea
                    rows={3}
                    value={quoteForm.technicalNotes}
                    onChange={e => setQuoteForm({ ...quoteForm, technicalNotes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
                    placeholder="Certifications, SGS inspection, sample availability, packaging specs..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('DETAILS')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Bid...' : 'Submit Official Factory Quote'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All bids protected by TradeHeaven trade protection &amp; Proforma Verification</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
            <a
              href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${encodeURIComponent(`Hello TradeHeaven, I am reviewing RFQ: "${rfq.productName}" for ${rfq.buyerCompany}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {onOpenNegotiation && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNegotiation();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span>Trade Chat</span>
              </button>
            )}

            {activeTab !== 'SUBMIT_QUOTE' && (
              <button
                onClick={() => setActiveTab('SUBMIT_QUOTE')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Factory Quote</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
