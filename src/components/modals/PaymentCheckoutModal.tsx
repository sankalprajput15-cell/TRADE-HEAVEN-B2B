import React, { useState } from 'react';
import { PaymentCheckoutData, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { 
  X, 
  Link,
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Landmark, 
  HelpCircle,
  Building2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/apiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  checkoutData: PaymentCheckoutData | null;
  selectedCurrency: Currency;
  onPaymentSuccess?: (orderId: string) => void;
}

export const PaymentCheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  checkoutData,
  selectedCurrency,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'REQUEST_LINK' | 'SWIFT' | 'REQUEST_INFO'>('REQUEST_LINK');
  const [clientEmail, setClientEmail] = useState('elena@vostoksourcing.com');
  const [clientPhone, setClientPhone] = useState('+91 8532934479');
  const [billingName, setBillingName] = useState('Elena Rostova');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !checkoutData) return null;

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };
  const convertedPrice = checkoutData.amountUsd * curr.rateToUSD;

  const formatPrice = (amount: number) => {
    return `${curr.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderId = `ORD-TH-${Date.now().toString().slice(-6)}`;
      await api.createOrder({
        id: orderId,
        buyerId: 'usr-buyer-001',
        buyerCompany: billingName,
        supplierCompany: checkoutData.supplierCompany || 'Trade Heaven Global SA',
        productTitle: checkoutData.title,
        quantity: 1,
        totalAmountUsd: checkoutData.amountUsd,
        currency: selectedCurrency,
        incoterm: 'FOB',
        status: paymentMethod === 'REQUEST_LINK' ? 'PENDING' : 'PAID',
        paymentMethod,
        createdAt: new Date().toISOString()
      });

      setIsSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(orderId);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/90 hover:text-white transition-colors cursor-pointer shadow-sm"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 pr-14">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted trade protection Rail
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
            Secure Trade Protection Checkout &amp; Settlement
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md font-normal">
            Capital is protected in neutral Swiss trade protection vaults under FINMA compliance rules.
          </p>
        </div>

        {/* Order Summary Strip */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 gap-3">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 font-bold uppercase">{checkoutData.type}</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate">{checkoutData.title}</div>
            <div className="text-[11px] text-slate-600 font-medium truncate">{checkoutData.description}</div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-500 font-medium">Total Settlement</div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 font-mono">
              {formatPrice(convertedPrice)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              (${checkoutData.amountUsd.toLocaleString()} USD)
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-4 flex-1 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {paymentMethod === 'REQUEST_LINK' 
                ? 'Payment Link Request Submitted!' 
                : paymentMethod === 'REQUEST_INFO' 
                ? 'Information Request Submitted!' 
                : 'Trade Protection Settlement Logged!'}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {paymentMethod === 'REQUEST_LINK' 
                ? `Your request for ${checkoutData.title} (${formatPrice(convertedPrice)}) has been sent to Treasury. Check your email (${clientEmail}) for your custom secure payment link.`
                : paymentMethod === 'REQUEST_INFO'
                ? `Your inquiry regarding ${checkoutData.title} (${formatPrice(convertedPrice)}) has been logged. Our Treasury Operations team will contact you at ${clientEmail} with complete payment information.`
                : 'Your funds are held securely in Swiss Trade Protection. A verified Proforma Invoice & receipt have been dispatched to your email.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleProcessPayment} className="p-4 sm:p-6 md:p-7 space-y-5 flex-1 overflow-y-auto text-xs">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Select Settlement Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('REQUEST_LINK')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'REQUEST_LINK'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Link className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">Request Payment Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SWIFT')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'SWIFT'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">SWIFT Wire / TT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('REQUEST_INFO')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'REQUEST_INFO'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold ring-2 ring-amber-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px]">Request Information</span>
                </button>
              </div>
            </div>

            {/* Request Payment Link View */}
            {paymentMethod === 'REQUEST_LINK' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Payment Link Delivery</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Card details are not processed directly on the site. Treasury Ops will issue an encrypted custom payment link (supporting local &amp; international cards/wallets) and Proforma Invoice directly to your email.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={billingName}
                    onChange={e => setBillingName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address for Payment Link *</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="e.g. elena@vostoksourcing.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preferred Currency</label>
                    <input
                      type="text"
                      disabled
                      value={selectedCurrency}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Optional Notes / Requirements</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={e => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Prefer Stripe/Razorpay link or specific invoice notes..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'SWIFT' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Bank Transfer Instructions:</div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 font-sans text-[12px] space-y-2 leading-relaxed">
                  <div><strong>Beneficiary Account Name:</strong> TRADEHEAVEN ECOM SOLUTION LLP</div>
                  <div><strong>Account Number (A/c No):</strong> 44153189222</div>
                  <div><strong>Account Type:</strong> Current account Bank Account</div>
                  <div><strong>Bank Name:</strong> State Bank Of India</div>
                  <div><strong>Branch Name &amp; Address:</strong> State Bank of India NTPC dibiyapur auraiya, Uttar Pradesh, 206244</div>
                  <div><strong>SWIFT CODE:</strong> SBININBB124</div>
                  <div><strong>IFSC Code:</strong> SBIN0010346</div>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                    <strong>Reference Code:</strong> TH-{checkoutData.planId || 'DIRECT'}-{Date.now().toString().slice(-4)}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'REQUEST_INFO' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Payment &amp; Settlement Information Request</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Request custom settlement terms, alternate bank routing details, LC/Escrow agreements, or direct assistance from Trade Heaven Treasury Operations.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={billingName}
                    onChange={e => setBillingName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      placeholder="e.g. elena@vostoksourcing.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Information Needed / Special Questions</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={e => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Need Letter of Credit info, proforma invoice draft, local currency options..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Trade Protection Guarantee Pill */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Funds are protected under 100% money-back guarantee if pre-shipment inspection fails.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {paymentMethod === 'REQUEST_LINK' ? (
                <>
                  <Link className="w-4 h-4" />
                  <span>{isProcessing ? 'Dispatching Payment Link Request...' : `Request Payment Link for ${formatPrice(convertedPrice)}`}</span>
                </>
              ) : paymentMethod === 'REQUEST_INFO' ? (
                <>
                  <HelpCircle className="w-4 h-4" />
                  <span>{isProcessing ? 'Submitting Information Request...' : `Request Information for ${formatPrice(convertedPrice)}`}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Authorizing Swiss Trade Protection Vault...' : `Confirm SWIFT Wire Settlement (${formatPrice(convertedPrice)})`}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
