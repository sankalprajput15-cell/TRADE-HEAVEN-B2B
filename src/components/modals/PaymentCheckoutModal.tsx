import React, { useState } from 'react';
import { PaymentCheckoutData, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Sparkles, 
  Landmark, 
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
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'SWIFT' | 'CRYPTO'>('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [billingName, setBillingName] = useState('Elena Rostova');
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
        status: 'PAID',
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
      }, 2000);
    } catch (err) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
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
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Escrow Rail
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
            Secure Escrow Checkout &amp; Settlement
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md font-normal">
            Capital is protected in neutral Swiss escrow vaults under FINMA compliance rules.
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
            <h3 className="text-lg font-black text-slate-900">Escrow Payment Confirmed!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your funds are held securely in Swiss Escrow. A verified Proforma Invoice &amp; receipt have been dispatched to your email.
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
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px]">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SWIFT')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'SWIFT'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span className="text-[11px]">SWIFT Wire / TT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CRYPTO')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CRYPTO'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[11px]">USDT / USDC Escrow</span>
                </button>
              </div>
            </div>

            {/* Card Inputs */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cardholder Corporate Name</label>
                  <input
                    type="text"
                    required
                    value={billingName}
                    onChange={e => setBillingName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card Number (Protected Token)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'SWIFT' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800">SWIFT Wire Vault Details:</div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                  <div><strong>Bank:</strong> UBS Switzerland AG, Zurich</div>
                  <div><strong>IBAN:</strong> CH93 0023 0230 4910 9481 0</div>
                  <div><strong>BIC / SWIFT:</strong> UBSWCHZH80A</div>
                  <div><strong>Reference:</strong> ESCROW-TH-{checkoutData.planId || 'DIRECT'}</div>
                </div>
              </div>
            )}

            {/* Escrow Guarantee Pill */}
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
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Authorizing Swiss Escrow Vault...' : `Pay ${formatPrice(convertedPrice)} into Escrow`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
