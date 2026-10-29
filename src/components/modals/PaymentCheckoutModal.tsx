import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Wallet,
  PlusCircle,
  ArrowDownLeft
} from 'lucide-react';
import { api } from '../../services/apiService';
import { tradeHeavenMediationService, WalletRecord } from '../../services/tradeHeavenMediatorEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  checkoutData: PaymentCheckoutData | null;
  selectedCurrency: Currency;
  onPaymentSuccess?: (orderId: string) => void;
  onNavigate?: (view: any) => void;
}

export const PaymentCheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  checkoutData,
  selectedCurrency,
  onPaymentSuccess,
  onNavigate
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'WALLET_TOPUP' | 'REQUEST_LINK' | 'SWIFT' | 'REQUEST_INFO'>('WALLET_TOPUP');
  const [clientEmail, setClientEmail] = useState('elena@vostoksourcing.com');
  const [clientPhone, setClientPhone] = useState('+91 8532934479');
  const [billingName, setBillingName] = useState('Elena Rostova');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live Mediation Wallet Top-Up state
  const [buyerWallets, setBuyerWallets] = useState<WalletRecord[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-titan-01');
  const [topupAmountInr, setTopupAmountInr] = useState<string>('500000');
  const [gatewayTxId, setGatewayTxId] = useState<string>(() => `GW-RZP-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [walletStatusMsg, setWalletStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (checkoutData) {
        if (checkoutData.clientEmail) {
          setClientEmail(checkoutData.clientEmail);
        }
        if (checkoutData.billingName || checkoutData.decisionMakerName || checkoutData.supplierCompany) {
          const companyLabel = checkoutData.supplierCompany || checkoutData.billingName || '';
          const dmLabel = checkoutData.decisionMakerName || '';
          setBillingName(
            dmLabel && companyLabel && !companyLabel.includes(dmLabel)
              ? `${dmLabel} (${companyLabel})`
              : companyLabel || dmLabel
          );
        }
        if (checkoutData.address || checkoutData.preferredPaymentMethod) {
          const noteParts: string[] = [];
          if (checkoutData.supplierCompany) noteParts.push(`Company: ${checkoutData.supplierCompany}`);
          if (checkoutData.decisionMakerName) noteParts.push(`Decision Maker: ${checkoutData.decisionMakerName}`);
          if (checkoutData.address) noteParts.push(`Address: ${checkoutData.address}`);
          if (checkoutData.preferredPaymentMethod) noteParts.push(`Payment Method: ${checkoutData.preferredPaymentMethod}`);
          setPaymentNotes(noteParts.join(' | '));
        }
        if (
          checkoutData.preferredPaymentMethod &&
          checkoutData.preferredPaymentMethod.toLowerCase().includes('debit')
        ) {
          setPaymentMethod('REQUEST_LINK');
        }
      }
      tradeHeavenMediationService.getState().then(st => {
        const buyers = (st.wallets || []).filter(w => w.wallet_type === 'BUYER');
        setBuyerWallets(buyers);
        if (buyers.length > 0 && !buyers.some(b => b.entity_id === selectedBuyerId)) {
          setSelectedBuyerId(buyers[0].entity_id);
        }
      }).catch(() => {});
    }
  }, [isOpen, checkoutData]);

  if (!isOpen || !checkoutData) return null;

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };
  const convertedPrice = checkoutData.amountUsd * curr.rateToUSD;

  const formatPrice = (amount: number) => {
    return `${curr.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleInstantWalletTopUp = async () => {
    setWalletStatusMsg(null);
    const inr = parseFloat(topupAmountInr);
    if (isNaN(inr) || inr <= 0) {
      setWalletStatusMsg({ type: 'error', text: 'Please enter a valid positive top-up amount in INR.' });
      return;
    }
    const amountPaise = Math.round(inr * 100);
    setIsToppingUp(true);
    try {
      const updated = await tradeHeavenMediationService.creditBuyerDeposit(
        selectedBuyerId,
        amountPaise,
        gatewayTxId.trim() || `GW-RZP-${Date.now()}`
      );
      setBuyerWallets((updated.wallets || []).filter(w => w.wallet_type === 'BUYER'));
      setGatewayTxId(`GW-RZP-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setWalletStatusMsg({
        type: 'success',
        text: `Top-Up Successful! Credited ₹${inr.toLocaleString('en-IN')} (${amountPaise.toLocaleString()} paise) to ${selectedBuyerId} via creditBuyerDeposit.`
      });
    } catch (err: any) {
      setWalletStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to credit buyer wallet deposit.'
      });
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const orderId = `ORD-TH-${Date.now().toString().slice(-6)}`;

    try {
      if (paymentMethod === 'WALLET_TOPUP') {
        const orderPaise = Math.round(checkoutData.amountUsd * 83.5 * 100);
        await tradeHeavenMediationService.lockOrderFundsInEscrow(
          selectedBuyerId,
          orderId,
          orderPaise,
          'comp-melissa-mpcommodity',
          checkoutData.title
        );
      }

      await api.createOrder({
        id: orderId,
        buyerId: selectedBuyerId || 'usr-buyer-001',
        buyerCompany: billingName,
        supplierCompany: checkoutData.supplierCompany || 'Trade Heaven Global SA',
        productTitle: checkoutData.title,
        quantity: 1,
        totalAmountUsd: checkoutData.amountUsd,
        currency: selectedCurrency,
        incoterm: 'FOB',
        status: paymentMethod === 'REQUEST_LINK' ? 'PENDING' : 'PAID',
        paymentMethod: paymentMethod === 'WALLET_TOPUP' ? 'SWIFT' : paymentMethod,
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
    } catch (err: any) {
      if (paymentMethod === 'WALLET_TOPUP') {
        setWalletStatusMsg({
          type: 'error',
          text: err?.message || 'Insufficient available wallet funds to lock in escrow. Please click "+ Top-Up Wallet Balance" first.'
        });
        setIsProcessing(false);
        return;
      }
      setIsSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(orderId);
      }
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
            Secure Trade Protection Checkout &amp; Wallet Top-Up
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md font-normal">
            Top up your Trade Heaven buyer wallet (`creditBuyerDeposit`) or lock funds in mediated escrow.
          </p>
        </div>

        {/* Order Summary Strip + Direct Funds Top-Up Action */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between shrink-0 gap-3">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 font-bold uppercase">{checkoutData.type}</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate">{checkoutData.title}</div>
            <div className="text-[11px] text-slate-600 font-medium truncate">{checkoutData.description}</div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPaymentMethod('WALLET_TOPUP')}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Funds Top-Up</span>
            </button>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-medium">Total Settlement</div>
              <div className="text-lg sm:text-xl font-black text-emerald-600 font-mono">
                {formatPrice(convertedPrice)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                (${checkoutData.amountUsd.toLocaleString()} USD)
              </div>
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
                : 'Escrow Lock & Settlement Logged!'}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {paymentMethod === 'REQUEST_LINK' 
                ? `Your request for ${checkoutData.title} (${formatPrice(convertedPrice)}) has been sent to Treasury. Check your email (${clientEmail}) for your custom secure payment link.`
                : paymentMethod === 'REQUEST_INFO'
                ? `Your inquiry regarding ${checkoutData.title} (${formatPrice(convertedPrice)}) has been logged. Our Treasury Operations team will contact you at ${clientEmail} with complete payment information.`
                : 'Your funds have been locked in Trade Heaven Mediated Escrow (ORDER_LOCK_ESCROW).'}
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
              <label className="block font-bold text-slate-800">Select Settlement &amp; Top-Up Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET_TOPUP')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'WALLET_TOPUP'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">Wallet &amp; Top-Up</span>
                </button>

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
                  <span className="text-[11px]">Payment Link</span>
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
                  <span className="text-[11px]">Request Info</span>
                </button>
              </div>
            </div>

            {/* Wallet Top-Up & Mediated Escrow View */}
            {paymentMethod === 'WALLET_TOPUP' && (
              <div className="space-y-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>1. Buyer Wallet Funds Top-Up (`creditBuyerDeposit`)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add funds to your Trade Heaven wallet in INR/Paise or open the full 4-Stage Mediation Console.
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate('MEDIATOR_ENGINE');
                        setTimeout(() => {
                          window.dispatchEvent(
                            new CustomEvent('tradeheaven_open_mediation_stage', {
                              detail: { stage: 'TOPUP' }
                            })
                          );
                        }, 60);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] shrink-0 cursor-pointer"
                    >
                      Full Console
                    </button>
                  )}
                </div>

                {walletStatusMsg && (
                  <div
                    className={`p-3 rounded-xl border text-[11px] font-medium flex items-start gap-2 ${
                      walletStatusMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {walletStatusMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{walletStatusMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Buyer Wallet (`buyerId`)</label>
                  <select
                    value={selectedBuyerId}
                    onChange={e => setSelectedBuyerId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {buyerWallets.map(w => (
                      <option key={w.id} value={w.entity_id}>
                        {w.company_name} ({w.entity_id}) — Avail: ₹{(Number(w.available_balance) / 100).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Top-Up Deposit Amount (INR ₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={topupAmountInr}
                      onChange={e => setTopupAmountInr(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      = {Math.round((parseFloat(topupAmountInr) || 0) * 100).toLocaleString()} paise
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gateway Tx Reference (`gatewayTxId`)</label>
                    <input
                      type="text"
                      value={gatewayTxId}
                      onChange={e => setGatewayTxId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[100000, 500000, 1000000, 2500000].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopupAmountInr(String(preset))}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-mono font-semibold text-slate-700 cursor-pointer"
                    >
                      +₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleInstantWalletTopUp}
                  disabled={isToppingUp}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{isToppingUp ? 'Crediting Deposit...' : '+ Top-Up Wallet Balance Now (creditBuyerDeposit)'}</span>
                </button>
              </div>
            )}

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
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    <span>Official SWIFT (International Wire) Account Details:</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Direct Wire
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 font-sans text-[12px] space-y-2.5 leading-relaxed shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Account Holder Name:</span>
                    <strong className="text-slate-900 font-semibold">TRADEHEAVEN ECOM SOLUTION LLP</strong>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Payment Method:</span>
                    <span className="font-semibold text-slate-800">SWIFT (International wire)</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 bg-blue-50/50 p-2 rounded-lg">
                    <span className="text-blue-900 font-bold">IBAN (Account Number):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-950 text-xs sm:text-sm select-all">
                        GB81TCCL04140453340868
                      </span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('GB81TCCL04140453340868')}
                        className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">BIC / SWIFT Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 select-all">TCCLGB3L</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('TCCLGB3L')}
                        className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Bank Name:</span>
                    <strong className="text-slate-900">The Currency Cloud Limited</strong>
                  </div>
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 font-medium shrink-0">Beneficiary Address:</span>
                    <span className="text-right text-slate-700">1 Sheldon Square, London, W2 6TT, United Kingdom</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Beneficiary Bank Country:</span>
                    <span className="font-semibold text-slate-800">United Kingdom</span>
                  </div>

                  {/* Mandatory Remark Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                    <div className="font-bold flex items-center justify-between gap-1 text-[11px]">
                      <span>Mandatory Transfer Remark:</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('DO NOT CONVERT TO GBP')}
                        className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Copy Remark
                      </button>
                    </div>
                    <div className="font-mono font-extrabold text-amber-950 text-xs bg-amber-100/70 p-1.5 rounded select-all">
                      DO NOT CONVERT TO GBP
                    </div>
                    <p className="text-[10px] text-amber-800">
                      When initiating this transfer with your bank, please add the above remark to preserve original currency value.
                    </p>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Reference / Memo Code:</span>
                    <strong>TH-{checkoutData.planId || 'DIRECT'}-{Date.now().toString().slice(-4)}</strong>
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
