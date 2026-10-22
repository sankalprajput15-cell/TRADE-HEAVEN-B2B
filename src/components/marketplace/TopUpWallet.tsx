import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord,
  LedgerEntryRecord
} from '../../services/tradeHeavenMediatorEngine';
import {
  Wallet,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Landmark,
  Lock,
  Sparkles,
  Terminal,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  FileCheck2,
  Zap
} from 'lucide-react';

interface TopUpWalletProps {
  onSuccess?: (updatedState: MediationSystemState) => void;
  onNavigateToFullEngine?: () => void;
}

interface GatewayOption {
  id: 'RAZORPAY_X' | 'CASHFREE_B2B' | 'STRIPE_TREASURY' | 'HDFC_RTGS';
  name: string;
  subtitle: string;
  prefix: string;
  railLabel: string;
  settlementTime: string;
  badge: string;
}

const GATEWAY_OPTIONS: GatewayOption[] = [
  {
    id: 'RAZORPAY_X',
    name: 'RazorpayX Corporate Collect',
    subtitle: 'Virtual Account VAN / Corporate Netbanking / RTGS',
    prefix: 'GW-RZP',
    railLabel: 'NEFT / RTGS / IMPS Webhook',
    settlementTime: 'Instant Webhook Confirmation',
    badge: 'Recommended B2B'
  },
  {
    id: 'CASHFREE_B2B',
    name: 'Cashfree B2B AutoCollect',
    subtitle: 'Dedicated Virtual IFSC & Escrow Collection Rail',
    prefix: 'GW-CF',
    railLabel: 'Virtual Account AutoCollect',
    settlementTime: 'Instant (24x7 RTGS)',
    badge: 'Zero Fee VAN'
  },
  {
    id: 'STRIPE_TREASURY',
    name: 'Stripe Global Treasury Wire',
    subtitle: 'Cross-Border USD/EUR to INR Trade Settlement',
    prefix: 'GW-STRP',
    railLabel: 'SWIFT / Fedwire / SEPA',
    settlementTime: 'Real-time FX Conversion',
    badge: 'Global Buyers'
  },
  {
    id: 'HDFC_RTGS',
    name: 'HDFC Corporate Treasury API',
    subtitle: 'Direct Host-to-Host Corporate Bank Line',
    prefix: 'GW-HDFC',
    railLabel: 'Direct API Corporate RTGS',
    settlementTime: 'Instant Core Banking Credit',
    badge: 'Tier-1 Bank'
  }
];

const PRESET_AMOUNTS_INR = [
  { label: '₹1,00,000', value: 100000, tag: 'Starter Lot' },
  { label: '₹2,50,000', value: 250000, tag: 'Sample & MOQ' },
  { label: '₹5,00,000', value: 500000, tag: 'Popular B2B' },
  { label: '₹10,00,000', value: 1000000, tag: 'Container Deposit' },
  { label: '₹25,00,000', value: 2500000, tag: 'Bulk Trade' },
  { label: '₹50,00,000', value: 5000000, tag: 'Enterprise L/C' }
];

type GatewaySimulationStep = 'CONFIGURE' | 'GATEWAY_CHECKOUT' | 'PROCESSING_WEBHOOK' | 'CONFIRMED';

export const TopUpWallet: React.FC<TopUpWalletProps> = ({
  onSuccess,
  onNavigateToFullEngine
}) => {
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-titan-01');
  const [amountInr, setAmountInr] = useState<string>('500000');
  const [selectedGatewayId, setSelectedGatewayId] = useState<GatewayOption['id']>('RAZORPAY_X');
  const [gatewayTxId, setGatewayTxId] = useState<string>(() => `GW-RZP-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [simStep, setSimStep] = useState<GatewaySimulationStep>('CONFIGURE');
  const [otpCode, setOtpCode] = useState<string>('849201');
  const [copiedTxId, setCopiedTxId] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [lastReceipt, setLastReceipt] = useState<{
    buyerName: string;
    companyName: string;
    buyerId: string;
    amountPaise: number;
    previousBalancePaise: number;
    newBalancePaise: number;
    gatewayTxId: string;
    gatewayName: string;
    timestamp: string;
  } | null>(null);

  const loadState = async () => {
    setLoading(true);
    try {
      const data = await tradeHeavenMediationService.getState();
      setState(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to load wallet state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const buyerWallets = useMemo(
    () => (state?.wallets || []).filter(w => w.wallet_type === 'BUYER'),
    [state]
  );

  const selectedWallet: WalletRecord | undefined = useMemo(
    () => buyerWallets.find(w => w.entity_id === selectedBuyerId) || buyerWallets[0],
    [buyerWallets, selectedBuyerId]
  );

  const selectedGateway = useMemo(
    () => GATEWAY_OPTIONS.find(g => g.id === selectedGatewayId) || GATEWAY_OPTIONS[0],
    [selectedGatewayId]
  );

  // Update gateway reference prefix when switching gateway option
  const handleSelectGateway = (gw: GatewayOption) => {
    setSelectedGatewayId(gw.id);
    setGatewayTxId(`${gw.prefix}-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  const regenerateGatewayTxId = () => {
    setGatewayTxId(`${selectedGateway.prefix}-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  const parsedInr = useMemo(() => {
    const num = parseFloat(amountInr);
    return isNaN(num) || num < 0 ? 0 : num;
  }, [amountInr]);

  const amountPaise = useMemo(() => Math.round(parsedInr * 100), [parsedInr]);
  const amountUsd = useMemo(() => parsedInr / 83.5, [parsedInr]);

  const formatInrFromPaise = (paiseVal: string | number) => {
    const inr = Number(paiseVal || 0) / 100;
    return `₹${inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter recent WALLET_TOPUP ledger entries
  const recentTopUps: LedgerEntryRecord[] = useMemo(() => {
    if (!state) return [];
    return state.ledger_entries
      .filter(entry => entry.transaction_type === 'WALLET_TOPUP')
      .slice(0, 6);
  }, [state]);

  const handleProceedToGatewayModal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (parsedInr <= 0) {
      setErrorMessage('Please select or enter a valid top-up amount greater than ₹0.');
      return;
    }
    if (!selectedWallet) {
      setErrorMessage('Please select a valid Buyer Wallet.');
      return;
    }
    setSimStep('GATEWAY_CHECKOUT');
  };

  const handleConfirmGatewayWebhook = async () => {
    if (!selectedWallet) return;
    setErrorMessage(null);
    setSimStep('PROCESSING_WEBHOOK');

    const prevBalancePaise = Number(selectedWallet.available_balance || 0);
    const finalTxId = gatewayTxId.trim() || `${selectedGateway.prefix}-${Date.now()}`;

    // Brief realistic simulation delay for webhook signature verification & DB commit
    setTimeout(async () => {
      try {
        const updatedState = await tradeHeavenMediationService.creditBuyerDeposit(
          selectedWallet.entity_id,
          amountPaise,
          finalTxId
        );
        setState(updatedState);

        const updatedBuyerWallet = updatedState.wallets.find(
          w => w.entity_id === selectedWallet.entity_id && w.wallet_type === 'BUYER'
        );
        const newBalancePaise = Number(
          updatedBuyerWallet?.available_balance ?? prevBalancePaise + amountPaise
        );

        setLastReceipt({
          buyerName: selectedWallet.entity_name,
          companyName: selectedWallet.company_name,
          buyerId: selectedWallet.entity_id,
          amountPaise,
          previousBalancePaise: prevBalancePaise,
          newBalancePaise,
          gatewayTxId: finalTxId,
          gatewayName: selectedGateway.name,
          timestamp: new Date().toLocaleTimeString()
        });

        setSimStep('CONFIRMED');
        if (onSuccess) {
          onSuccess(updatedState);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Payment gateway confirmation failed.');
        setSimStep('GATEWAY_CHECKOUT');
      }
    }, 650);
  };

  const handleStartAnotherTopUp = () => {
    regenerateGatewayTxId();
    setSimStep('CONFIGURE');
    setErrorMessage(null);
  };

  const handleCopyTxId = (txId: string) => {
    navigator.clipboard?.writeText(txId);
    setCopiedTxId(true);
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  if (loading && !state) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center justify-center gap-3 text-slate-600 shadow-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
        <span className="text-sm font-bold">Connecting to Trade Heaven Wallet &amp; Payment Gateway Engine...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Stage 1 Mediation • Instant Escrow Wallet Funding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span>Top-Up Buyer Trade Wallet</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Select a top-up package or custom deposit amount, simulate the B2B payment gateway webhook confirmation, and trigger{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs border border-slate-700">
                creditBuyerDeposit(buyerId, amountPaise, gatewayTxId)
              </code>{' '}
              to credit your available wallet balance in real time.
            </p>
          </div>

          {/* Active Buyer Balance Card */}
          {selectedWallet && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 min-w-[280px] sm:min-w-[320px] shrink-0 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Selected Buyer Wallet
                  </div>
                  <div className="text-sm font-black text-white truncate">
                    {selectedWallet.company_name}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  {selectedWallet.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/70 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold">Available Balance</div>
                  <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
                    {formatInrFromPaise(selectedWallet.available_balance)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {Number(selectedWallet.available_balance).toLocaleString('en-IN')} paise
                  </div>
                </div>

                <div className="bg-slate-800/70 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> In Escrow Lock
                  </div>
                  <div className="text-base sm:text-lg font-black text-amber-300 font-mono mt-0.5">
                    {formatInrFromPaise(selectedWallet.locked_balance)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {Number(selectedWallet.locked_balance).toLocaleString('en-IN')} paise
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Amount Selection & Payment Gateway Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step Progress Bar */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <div
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                simStep === 'CONFIGURE'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-emerald-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">
                1
              </span>
              <span className="truncate">1. Select Amount</span>
            </div>

            <div
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                simStep === 'GATEWAY_CHECKOUT' || simStep === 'PROCESSING_WEBHOOK'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : simStep === 'CONFIRMED'
                  ? 'text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                  simStep === 'GATEWAY_CHECKOUT' || simStep === 'PROCESSING_WEBHOOK' || simStep === 'CONFIRMED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                2
              </span>
              <span className="truncate">2. Gateway Confirm</span>
            </div>

            <div
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                simStep === 'CONFIRMED'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                  simStep === 'CONFIRMED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                3
              </span>
              <span className="truncate">3. Wallet Credited</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Top-Up Validation Error</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* STEP 1: CONFIGURE TOP-UP AMOUNT & GATEWAY */}
          {simStep === 'CONFIGURE' && (
            <form onSubmit={handleProceedToGatewayModal} className="space-y-6">
              {/* 1. Buyer Entity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  1. Select Destination Buyer Account
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {buyerWallets.map(w => {
                    const isSelected = w.entity_id === selectedWallet?.entity_id;
                    return (
                      <button
                        type="button"
                        key={w.id}
                        onClick={() => setSelectedBuyerId(w.entity_id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {w.entity_id}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-2 truncate">
                          {w.company_name}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-emerald-700 mt-1">
                          Avail: {formatInrFromPaise(w.available_balance)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Quick Preset Top-Up Amounts */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    2. Select Top-Up Amount (INR / Paise)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    1 INR = 100 Paise
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS_INR.map(preset => {
                    const active = parsedInr === preset.value;
                    return (
                      <button
                        type="button"
                        key={preset.value}
                        onClick={() => setAmountInr(String(preset.value))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              active
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {preset.tag}
                          </span>
                          {active && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-sm sm:text-base font-black font-mono mt-1.5">
                          {preset.label}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            active ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {(preset.value * 100).toLocaleString('en-IN')} paise
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="pt-2">
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-black font-mono text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={amountInr}
                      onChange={e => setAmountInr(e.target.value)}
                      placeholder="Enter custom deposit amount in INR"
                      className="w-full pl-9 pr-36 py-3.5 rounded-2xl border border-slate-300 focus:border-emerald-600 focus:outline-none text-base font-black font-mono text-slate-900 bg-slate-50/50"
                    />
                    <div className="absolute right-3 text-right">
                      <div className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ≈ ${amountUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1 font-mono">
                    <span>Exact Engine Value: <strong>{amountPaise.toLocaleString('en-IN')} paise</strong></span>
                    <span>Zero Platform Top-Up Fee (100% Credited)</span>
                  </div>
                </div>
              </div>

              {/* 3. Select Payment Gateway / Banking Collection Rail */}
              <div className="space-y-2.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  3. Select Payment Gateway / Collection Rail
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GATEWAY_OPTIONS.map(gw => {
                    const isSelected = gw.id === selectedGateway.id;
                    return (
                      <button
                        type="button"
                        key={gw.id}
                        onClick={() => handleSelectGateway(gw)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/15'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900">{gw.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {gw.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{gw.subtitle}</p>
                        <div className="text-[10px] font-mono text-slate-600 mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100">
                          <span>{gw.railLabel}</span>
                          <span className="text-emerald-700 font-bold">{gw.settlementTime}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  Proceed to Gateway Confirmation ({formatInrFromPaise(amountPaise)})
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: INTERACTIVE PAYMENT GATEWAY CONFIRMATION MOCKUP */}
          {(simStep === 'GATEWAY_CHECKOUT' || simStep === 'PROCESSING_WEBHOOK') && selectedWallet && (
            <div className="border-2 border-blue-600 rounded-3xl overflow-hidden bg-slate-50 shadow-lg">
              {/* Mock Gateway Top Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
                    PG
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">{selectedGateway.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                        256-BIT TLS SANDBOX
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Merchant: Trade Heaven Escrow Mediation Trust
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Payable Amount</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {formatInrFromPaise(amountPaise)}
                  </div>
                </div>
              </div>

              {/* Mock Gateway Body */}
              <div className="p-6 space-y-5">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Beneficiary Buyer Wallet:</span>
                    <span className="font-bold text-slate-900">
                      {selectedWallet.company_name} ({selectedWallet.entity_id})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Virtual Account / Collection Rail:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {selectedGateway.railLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-semibold">Exact Credit in Paise (BigInt Safe):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {amountPaise.toLocaleString('en-IN')} paise
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-slate-500 font-semibold">Gateway Reference ID (`gatewayTxId`):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={gatewayTxId}
                        onChange={e => setGatewayTxId(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={regenerateGatewayTxId}
                        title="Generate new Gateway Transaction ID"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Corporate Treasury Authorization / Webhook Payload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Corporate Treasury 2FA / UTR Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pre-filled simulated bank authorization code for instant sandbox approval:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        maxLength={6}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-black tracking-widest text-center text-slate-900 bg-slate-50"
                      />
                      <span className="px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                        ✓ Auto-Verified
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="text-emerald-400 font-bold flex items-center justify-between">
                      <span>WEBHOOK: payment.captured</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">HTTP 200</span>
                    </div>
                    <div className="text-slate-400 truncate">
                      {`{ "event": "virtual_account.credited",`}
                    </div>
                    <div className="text-slate-300 truncate">
                      {`  "buyerId": "${selectedWallet.entity_id}",`}
                    </div>
                    <div className="text-emerald-300 truncate">
                      {`  "amountPaise": ${amountPaise},`}
                    </div>
                    <div className="text-amber-300 truncate">
                      {`  "gatewayTxId": "${gatewayTxId}" }`}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    disabled={simStep === 'PROCESSING_WEBHOOK'}
                    onClick={() => setSimStep('CONFIGURE')}
                    className="px-5 py-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    ← Modify Amount
                  </button>

                  <button
                    type="button"
                    disabled={simStep === 'PROCESSING_WEBHOOK'}
                    onClick={handleConfirmGatewayWebhook}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {simStep === 'PROCESSING_WEBHOOK' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Webhook &amp; Running creditBuyerDeposit()...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulate Gateway Confirmation &amp; Credit Wallet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED RECEIPT VIEW */}
          {simStep === 'CONFIRMED' && lastReceipt && (
            <div className="border-2 border-emerald-500 rounded-3xl overflow-hidden bg-emerald-50/40 p-6 space-y-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ACID Transaction Committed • WALLET_TOPUP
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {formatInrFromPaise(lastReceipt.amountPaise)} Credited to Buyer Wallet
                    </h3>
                    <p className="text-xs text-slate-600">
                      Confirmed via {lastReceipt.gatewayName} at {lastReceipt.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-emerald-200">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Previous Available</div>
                  <div className="text-sm font-bold text-slate-600 font-mono mt-0.5">
                    {formatInrFromPaise(lastReceipt.previousBalancePaise)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-emerald-600">+ Top-Up Deposit</div>
                  <div className="text-sm font-black text-emerald-600 font-mono mt-0.5">
                    +{formatInrFromPaise(lastReceipt.amountPaise)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ({lastReceipt.amountPaise.toLocaleString('en-IN')} paise)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-900">New Available Balance</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                    {formatInrFromPaise(lastReceipt.newBalancePaise)}
                  </div>
                </div>
              </div>

              {/* Gateway Reference & SQL Execution Proof */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>TradeHeavenMediatorEngine.creditBuyerDeposit()</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTxId(lastReceipt.gatewayTxId)}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    {copiedTxId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{lastReceipt.gatewayTxId}</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div>BEGIN;</div>
                  <div>
                    SELECT id FROM wallets WHERE entity_id = '{lastReceipt.buyerId}' AND wallet_type = 'BUYER' FOR UPDATE;
                  </div>
                  <div className="text-emerald-300">
                    UPDATE wallets SET available_balance = available_balance + {lastReceipt.amountPaise}, updated_at = NOW();
                  </div>
                  <div className="text-amber-300">
                    INSERT INTO ledger_entries (reference_id, destination_wallet_id, amount, transaction_type, notes) VALUES ('{lastReceipt.gatewayTxId}', ..., {lastReceipt.amountPaise}, 'WALLET_TOPUP', 'Deposit via Gateway');
                  </div>
                  <div>COMMIT;</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleStartAnotherTopUp}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Make Another Top-Up Deposit</span>
                </button>
                {onNavigateToFullEngine && (
                  <button
                    type="button"
                    onClick={onNavigateToFullEngine}
                    className="py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Lock Funds in Order Escrow (Stage 2) →</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Wallet Overview & Recent Top-Up Ledger Entries (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* All Buyer Wallets Live Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Live Buyer Wallets (PostgreSQL State)
                </h3>
              </div>
              <button
                type="button"
                onClick={loadState}
                className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="space-y-2.5">
              {buyerWallets.map(w => {
                const isCurrent = w.entity_id === selectedWallet?.entity_id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedBuyerId(w.entity_id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-white border-emerald-500 shadow-sm'
                        : 'bg-white/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{w.company_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {w.entity_name} • {w.entity_id}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {w.wallet_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Available Balance</span>
                        <span className="font-mono font-black text-emerald-600">
                          {formatInrFromPaise(w.available_balance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Locked in Escrow</span>
                        <span className="font-mono font-bold text-amber-600">
                          {formatInrFromPaise(w.locked_balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Top-Up Ledger Feed */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Recent Gateway Top-Up Ledger (`WALLET_TOPUP`)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {recentTopUps.length} entries
              </span>
            </div>

            {recentTopUps.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                No top-up transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {recentTopUps.map(entry => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 truncate">
                          {entry.reference_id}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {entry.destination_wallet_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {entry.notes} • {new Date(entry.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-emerald-600">
                        +{formatInrFromPaise(entry.amount)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {Number(entry.amount).toLocaleString('en-IN')} paise
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
