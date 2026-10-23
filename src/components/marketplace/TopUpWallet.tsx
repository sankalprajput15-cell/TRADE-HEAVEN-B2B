import React, { useState, useEffect, useMemo } from 'react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord,
  LedgerEntryRecord
} from '../../services/tradeHeavenMediatorEngine';
import { useAuth } from '../../context/AuthContext';
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
  Terminal,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  FileCheck2,
  Zap,
  Upload,
  Mail,
  FileText
} from 'lucide-react';
import { addTopUpRequest } from './TopUpRequestsList';
import {
  formatBalanceInNativeCurrency,
  getEntityCurrency,
  localAmountToPaise,
  formatLocalAmount
} from '../../utils/entityCurrency';

interface TopUpWalletProps {
  onSuccess?: (updatedState: MediationSystemState) => void;
  onNavigateToFullEngine?: () => void;
}

interface GatewayOption {
  id: 'CURRENCY_CLOUD_SWIFT' | 'RAZORPAY_X' | 'CASHFREE_B2B' | 'STRIPE_TREASURY' | 'HDFC_RTGS';
  name: string;
  subtitle: string;
  prefix: string;
  railLabel: string;
  settlementTime: string;
  badge: string;
}

export { OFFICIAL_SWIFT_BANK_DETAILS } from '../../constants/swiftBankDetails';
import { OFFICIAL_SWIFT_BANK_DETAILS } from '../../constants/swiftBankDetails';

const GATEWAY_OPTIONS: GatewayOption[] = [
  {
    id: 'CURRENCY_CLOUD_SWIFT',
    name: 'The Currency Cloud Limited (Official SWIFT)',
    subtitle: 'Direct International Wire (IBAN: GB81TCCL04140453340868)',
    prefix: 'GW-SWIFT',
    railLabel: 'SWIFT / BIC: TCCLGB3L',
    settlementTime: 'Official Direct Wire',
    badge: 'Primary Account'
  },
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

const PRESET_AMOUNTS_LOCAL = [
  { value: 1000, tag: 'Starter Lot' },
  { value: 2500, tag: 'Sample & MOQ' },
  { value: 5000, tag: 'Popular B2B' },
  { value: 10000, tag: 'Container Deposit' },
  { value: 25000, tag: 'Bulk Trade' },
  { value: 50000, tag: 'Enterprise L/C' }
];

type GatewaySimulationStep = 'CONFIGURE' | 'GATEWAY_CHECKOUT' | 'PROCESSING_WEBHOOK' | 'CONFIRMED';

export const TopUpWallet: React.FC<TopUpWalletProps> = ({
  onSuccess,
  onNavigateToFullEngine
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [state, setState] = useState<MediationSystemState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buyer-titan-01');
  const [amountInr, setAmountInr] = useState<string>('5000');
  const [selectedGatewayId, setSelectedGatewayId] = useState<GatewayOption['id']>('CURRENCY_CLOUD_SWIFT');
  const [gatewayTxId, setGatewayTxId] = useState<string>(() => `GW-SWIFT-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [simStep, setSimStep] = useState<GatewaySimulationStep>('CONFIGURE');
  const [otpCode, setOtpCode] = useState<string>('849201');
  const [copiedTxId, setCopiedTxId] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopyField = (fieldName: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAllSwiftDetails = () => {
    const fullText = `Account holder name: ${OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName}
Payment method: ${OFFICIAL_SWIFT_BANK_DETAILS.paymentMethod}
IBAN (Account number): ${OFFICIAL_SWIFT_BANK_DETAILS.iban}
BIC/SWIFT code: ${OFFICIAL_SWIFT_BANK_DETAILS.bicSwift}
Bank name: ${OFFICIAL_SWIFT_BANK_DETAILS.bankName}
Beneficiary address: ${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress}
Beneficiary bank country: ${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry}

When initiating this transfer, please add the following remark: ${OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark}`;

    navigator.clipboard?.writeText(fullText);
    setCopiedField('ALL_SWIFT');
    setTimeout(() => setCopiedField(null), 2500);
  };

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

  const [transferProofFile, setTransferProofFile] = useState<string | null>(null);
  const [transferUtrInput, setTransferUtrInput] = useState<string>('');
  const [confirmationEmail, setConfirmationEmail] = useState<string>(currentUser?.email || '');
  const [proofSubmittedBanner, setProofSubmittedBanner] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);

  const selectedWallet: WalletRecord = useMemo(() => {
    const wallets = state?.wallets || [];
    if (currentUser) {
      const uid = (currentUser.id || '').toLowerCase();
      const email = (currentUser.email || '').toLowerCase();
      const comp = (currentUser.companyName || '').toLowerCase();
      const name = (currentUser.name || '').toLowerCase();

      const matched = wallets.find(w => {
        const eid = w.entity_id.toLowerCase();
        const wcomp = w.company_name.toLowerCase();
        const wname = w.entity_name.toLowerCase();
        if (uid && (eid === uid || eid.includes(uid))) return true;
        if (comp && (wcomp === comp || wcomp.includes(comp) || comp.includes(wcomp))) return true;
        if (name && (wname === name || wname.includes(name))) return true;
        if (email.includes('zac@otec.ltd') && eid.includes('zac')) return true;
        if (email.includes('melissa') && eid.includes('melissa')) return true;
        return false;
      });
      if (matched) return matched;
    }

    return {
      id: `wal-personal-${currentUser?.id || 'guest'}`,
      entity_id: currentUser?.id || 'personal-client-wallet',
      entity_name: currentUser?.name || 'Logged-in Client',
      company_name: currentUser?.companyName || currentUser?.name || 'Personal Account',
      wallet_type: currentUser?.role === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER',
      available_balance: '0',
      locked_balance: '0',
      currency: 'INR',
      updated_at: new Date().toISOString()
    };
  }, [state, currentUser]);

  const buyerWallets = useMemo(() => [selectedWallet], [selectedWallet]);

  // Verified Suppliers directory for Buyer-to-Supplier Funds Transfer (only company name & country shown, never balances)
  const supplierRecipients = useMemo(
    () => (state?.wallets || []).filter(w => w.wallet_type === 'SUPPLIER'),
    [state]
  );

  const [targetSupplierId, setTargetSupplierId] = useState<string>('comp-melissa-mpcommodity');
  const [supplierTransferMode, setSupplierTransferMode] = useState<'DIRECT_VIP' | 'ESCROW_HOLD'>('DIRECT_VIP');
  const [supplierTransferAmountInr, setSupplierTransferAmountInr] = useState<string>('2500');
  const [supplierOrderRef, setSupplierOrderRef] = useState<string>(() => `PO-VIP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [isTransferringToSupplier, setIsTransferringToSupplier] = useState<boolean>(false);
  const [supplierTransferFeedback, setSupplierTransferFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const selectedRecipientWallet = useMemo(
    () => supplierRecipients.find(s => s.entity_id === targetSupplierId),
    [supplierRecipients, targetSupplierId]
  );

  const isCurrentUserBasicPlan = useMemo(
    () =>
      Boolean(
        currentUser &&
          tradeHeavenMediationService.isBasicPlanStatus(
            currentUser.tier || currentUser.plan || selectedWallet?.plan_status,
            currentUser.id
          )
      ),
    [currentUser, selectedWallet]
  );

  const isSelectedSupplierBasicPlan = useMemo(
    () =>
      tradeHeavenMediationService.isBasicPlanStatus(
        selectedRecipientWallet?.plan_status,
        targetSupplierId
      ),
    [selectedRecipientWallet, targetSupplierId]
  );

  const isDirectTransferBlockedByPlan = isCurrentUserBasicPlan || isSelectedSupplierBasicPlan;

  const handleTransferToSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierTransferFeedback(null);
    if (isCurrentUserBasicPlan) {
      setSupplierTransferFeedback({
        type: 'error',
        message:
          'Direct on-site fund transfer is currently not active for your account. Please contact the supplier directly for payment arrangements.'
      });
      return;
    }
    if (isSelectedSupplierBasicPlan) {
      setSupplierTransferFeedback({
        type: 'error',
        message:
          `Direct on-site fund transfer is not active for ${selectedRecipientWallet?.company_name || 'this supplier'}. Please contact the supplier directly for it.`
      });
      return;
    }
    const recipient = supplierRecipients.find(s => s.entity_id === targetSupplierId);
    const recipientCurrency = getEntityCurrency(recipient || targetSupplierId);
    const localVal = parseFloat(supplierTransferAmountInr);
    if (isNaN(localVal) || localVal <= 0) {
      setSupplierTransferFeedback({
        type: 'error',
        message: `Please enter a valid transfer amount greater than ${recipientCurrency.currencySymbol}0.`
      });
      return;
    }
    const transferPaise = localAmountToPaise(localVal, recipient || targetSupplierId);
    const availPaise = Number(selectedWallet.available_balance || 0);
    const orderRef = supplierOrderRef.trim() || `PO-VIP-${Date.now().toString().slice(-5)}`;
    const recipientName = recipient?.company_name || targetSupplierId;
    const formattedTransferNative = formatLocalAmount(localVal, recipient || targetSupplierId);

    setIsTransferringToSupplier(true);
    try {
      const senderPlan = currentUser?.tier || currentUser?.plan || selectedWallet.plan_status || 'VIP';
      const recipientPlan = recipient?.plan_status || 'VIP';

      // Auto-credit shortfall if buyer's wallet has less than the transfer amount
      if (availPaise < transferPaise) {
        const shortfallPaise = transferPaise - availPaise;
        await tradeHeavenMediationService.creditBuyerDeposit(
          selectedWallet.entity_id,
          shortfallPaise,
          `GW-AUTO-${orderRef}`,
          senderPlan
        );
      }

      // Step 1: Lock funds in escrow
      let updatedState = await tradeHeavenMediationService.lockOrderFundsInEscrow(
        selectedWallet.entity_id,
        orderRef,
        transferPaise,
        targetSupplierId,
        `Supplier Settlement (${orderRef})`,
        senderPlan,
        recipientPlan
      );

      // Step 2: If DIRECT_VIP mode, immediately release settlement to VIP supplier
      if (supplierTransferMode === 'DIRECT_VIP') {
        const feePaise = Math.round(transferPaise * 0.015); // 1.5% VIP settlement fee
        updatedState = await tradeHeavenMediationService.releaseEscrowToSupplier({
          orderId: orderRef,
          buyerId: selectedWallet.entity_id,
          supplierId: targetSupplierId,
          totalAmountPaise: transferPaise,
          platformFeePaise: feePaise,
          senderPlan,
          recipientPlan
        });
        setSupplierTransferFeedback({
          type: 'success',
          message: `Direct Transfer of ${formattedTransferNative} (${recipientCurrency.country}) settled to ${recipientName} (Ref: ${orderRef}).`
        });
      } else {
        setSupplierTransferFeedback({
          type: 'success',
          message: `${formattedTransferNative} (${recipientCurrency.country}) locked in Escrow for ${recipientName} (Order: ${orderRef}). Release anytime upon shipment confirmation.`
        });
      }

      setState(updatedState);
      setSupplierOrderRef(`PO-VIP-${Math.floor(10000 + Math.random() * 90000)}`);
      if (onSuccess) {
        onSuccess(updatedState);
      }
    } catch (err: any) {
      setSupplierTransferFeedback({
        type: 'error',
        message: err?.message || 'Unable to complete transfer to supplier.'
      });
    } finally {
      setIsTransferringToSupplier(false);
    }
  };

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

  const walletCurrency = useMemo(() => getEntityCurrency(selectedWallet), [selectedWallet]);

  const parsedInr = useMemo(() => {
    const num = parseFloat(amountInr);
    return isNaN(num) || num < 0 ? 0 : num;
  }, [amountInr]);

  const amountPaise = useMemo(
    () => localAmountToPaise(parsedInr, selectedWallet),
    [parsedInr, selectedWallet]
  );

  const formatNativeFromPaise = (paiseVal: string | number, targetEntity: any = selectedWallet) => {
    return formatBalanceInNativeCurrency(paiseVal, targetEntity, { includeCode: true }).primary;
  };

  // Filter recent WALLET_TOPUP ledger entries strictly for this user's personal wallet
  const recentTopUps: LedgerEntryRecord[] = useMemo(() => {
    if (!state) return [];
    const entries = state.ledgerEntries || (state as any).ledger_entries || [];
    return entries
      .filter(
        entry =>
          entry.transaction_type === 'WALLET_TOPUP' &&
          (entry.destination_wallet_id === selectedWallet.id ||
            entry.destination_wallet_id === selectedWallet.entity_id)
      )
      .slice(0, 6);
  }, [state, selectedWallet]);

  const handlePortalScreenshotSubmission = () => {
    setErrorMessage(null);
    setProofError(null);
    setProofSubmittedBanner(null);
    if (parsedInr <= 0) {
      setProofError(`Please enter a valid transfer amount greater than ${walletCurrency.currencySymbol}0.`);
      return;
    }
    if (!transferProofFile) {
      setProofError('Please attach your bank transfer screenshot or payment slip (PNG, JPG, or PDF) before submitting.');
      return;
    }
    setIsSubmittingProof(true);
    const refId = transferUtrInput.trim() || gatewayTxId || `GW-SWIFT-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const targetMail = (confirmationEmail || currentUser?.email || 'your registered email').trim();

    setTimeout(() => {
      addTopUpRequest({
        id: `REQ-TOPUP-${Date.now().toString().slice(-4)}`,
        referenceId: refId,
        buyerId: selectedWallet.entity_id,
        buyerName: selectedWallet.entity_name,
        companyName: selectedWallet.company_name,
        amountPaise,
        amountInr: Math.round(amountPaise / 100),
        paymentRail: 'Funds Transfer (Portal Screenshot Upload)',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        bankName: OFFICIAL_SWIFT_BANK_DETAILS.bankName,
        ibanOrAccount: OFFICIAL_SWIFT_BANK_DETAILS.iban,
        bicOrIfsc: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift,
        remark: OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark,
        notes: `Funds transfer screenshot (${transferProofFile}) uploaded on portal. Confirmation mail sent to ${targetMail} & billing@tradeheaven.org.`,
        proofDocumentName: transferProofFile
      });
      setIsSubmittingProof(false);
      setProofSubmittedBanner(
        `Transfer screenshot "${transferProofFile}" uploaded for ${formatLocalAmount(parsedInr, selectedWallet)} (Ref: ${refId}). Submission confirmation has been sent by mail to ${targetMail} and Trade Heaven Treasury (billing@tradeheaven.org).`
      );
      setTransferProofFile(null);
      setTransferUtrInput('');
    }, 450);
  };

  const handleProceedToGatewayModal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (parsedInr <= 0) {
      setErrorMessage(`Please select or enter a valid top-up amount greater than ${walletCurrency.currencySymbol}0.`);
      return;
    }
    if (!selectedWallet) {
      setErrorMessage('Please select a valid Personal Wallet.');
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

        const updatedBuyerWallet = (updatedState?.wallets || []).find(
          w => w.entity_id === selectedWallet.entity_id
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

        addTopUpRequest({
          id: `REQ-TOPUP-${Date.now().toString().slice(-4)}`,
          referenceId: finalTxId,
          buyerId: selectedWallet.entity_id,
          buyerName: selectedWallet.entity_name,
          companyName: selectedWallet.company_name,
          amountPaise,
          amountInr: parsedInr,
          paymentRail: selectedGateway.name,
          status: 'VERIFIED',
          createdAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString(),
          bankName: OFFICIAL_SWIFT_BANK_DETAILS.bankName,
          ibanOrAccount: OFFICIAL_SWIFT_BANK_DETAILS.iban,
          bicOrIfsc: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift,
          remark: OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark,
          notes: `Simulated gateway credit via ${selectedGateway.name}.`,
          proofDocumentName: 'Gateway_Verification_Receipt.pdf'
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
      {/* Top Banner: Shows ONLY Logged-In Client's Current Account Balance */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Account Wallet • Direct Funds Transfer &amp; Screenshot Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span>My Current Account Balance &amp; Top-Up Portal</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              View your personal account balance below. Top up via direct bank funds transfer and upload your transfer screenshot on this portal to receive instant submission confirmation by email.
            </p>
          </div>

          {/* Logged-In Client Personal Balance Card */}
          {selectedWallet && (() => {
            const buyerCurrency = getEntityCurrency(selectedWallet);
            const buyerAvail = formatBalanceInNativeCurrency(selectedWallet.available_balance, selectedWallet);
            const buyerLocked = formatBalanceInNativeCurrency(selectedWallet.locked_balance, selectedWallet);

            return (
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 min-w-[280px] sm:min-w-[340px] shrink-0 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <span>Logged-In Client Account</span>
                      <span className="font-mono">({buyerCurrency.flag} {buyerCurrency.currencyCode})</span>
                    </div>
                    <div className="text-sm font-black text-white truncate">
                      {currentUser?.companyName || selectedWallet.company_name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser?.name || selectedWallet.entity_name} {currentUser?.email ? `• ${currentUser.email}` : ''}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                    Personal Balance
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/70 rounded-xl p-2.5 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Current Balance</span>
                      <span className="text-[9px] font-mono text-emerald-400">{buyerCurrency.currencyCode}</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5 truncate">
                      {buyerAvail.primary}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {buyerAvail.secondary}
                    </div>
                  </div>

                  <div className="bg-slate-800/70 rounded-xl p-2.5 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-amber-400" /> In Escrow</span>
                      <span className="text-[9px] font-mono text-amber-400">{buyerCurrency.currencyCode}</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-300 font-mono mt-0.5 truncate">
                      {buyerLocked.primary}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {buyerLocked.secondary}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
            <div className="space-y-6">
              {/* Official Bank Account Details for Customer Balance Top-Up */}
              <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-blue-500/30 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/60 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                      <Landmark className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">Official Bank Account for Wallet Top-Up</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          SWIFT Wire
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Transfer funds from your bank to top up your corporate balance directly via international wire
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAllSwiftDetails}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      copiedField === 'ALL_SWIFT'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    }`}
                  >
                    {copiedField === 'ALL_SWIFT' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>All Details Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All Account Details</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bank Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {/* Account Holder Name */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Account Holder Name</div>
                      <div className="font-bold text-white mt-0.5 text-xs sm:text-sm">
                        {OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField('HOLDER', OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy Account Holder Name"
                    >
                      {copiedField === 'HOLDER' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Bank Name */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bank Name</div>
                      <div className="font-bold text-white mt-0.5 text-xs sm:text-sm">
                        {OFFICIAL_SWIFT_BANK_DETAILS.bankName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField('BANK', OFFICIAL_SWIFT_BANK_DETAILS.bankName)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy Bank Name"
                    >
                      {copiedField === 'BANK' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* IBAN (Account Number) */}
                  <div className="p-3 rounded-2xl bg-blue-900/20 border border-blue-500/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">IBAN (Account Number)</div>
                      <div className="font-mono font-black text-white mt-0.5 text-xs sm:text-sm tracking-wider select-all">
                        {OFFICIAL_SWIFT_BANK_DETAILS.iban}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField('IBAN', OFFICIAL_SWIFT_BANK_DETAILS.iban)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'IBAN' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-200" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* BIC / SWIFT */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">BIC / SWIFT Code</div>
                      <div className="font-mono font-bold text-white mt-0.5 text-xs sm:text-sm select-all">
                        {OFFICIAL_SWIFT_BANK_DETAILS.bicSwift}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField('BIC', OFFICIAL_SWIFT_BANK_DETAILS.bicSwift)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy BIC/SWIFT Code"
                    >
                      {copiedField === 'BIC' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Beneficiary Address */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Beneficiary Address</div>
                      <div className="text-slate-200 mt-0.5 text-xs">
                        {OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField('ADDR', OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedField === 'ADDR' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Beneficiary Bank Country & Payment Method */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bank Country &amp; Method</div>
                      <div className="text-slate-200 mt-0.5 text-xs">
                        {OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry} • {OFFICIAL_SWIFT_BANK_DETAILS.paymentMethod}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      UK Wire
                    </span>
                  </div>
                </div>

                {/* CRITICAL MANDATORY REMARK BOX */}
                <div className="bg-amber-500/15 border border-amber-400/40 rounded-2xl p-3.5 sm:p-4 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Mandatory Transfer Remark</span>
                    </div>
                    <div className="text-xs text-amber-100">
                      When initiating this transfer, please add the following remark:
                    </div>
                    <div className="font-mono font-black text-white text-sm sm:text-base tracking-wider bg-slate-950/90 px-3 py-1.5 rounded-xl border border-amber-400/40 inline-block mt-1 select-all">
                      {OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyField('REMARK', OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    {copiedField === 'REMARK' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Remark Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Remark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleProceedToGatewayModal} className="space-y-6">
              {/* 1. Funds Transfer Screenshot Upload & Mail Confirmation Portal */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Structured Header */}
                <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black tracking-tight text-white">
                        1. Top Up by Funds Transfer &amp; Screenshot Upload
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Transfer funds to the official bank account above, attach your payment screenshot, and receive submission confirmation by email.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Portal + Mail Receipt</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 bg-slate-50/50">
                  {/* Inline Error Banner */}
                  {proofError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div className="flex-1">{proofError}</div>
                    </div>
                  )}

                  {/* Inline Confirmation Banner */}
                  {proofSubmittedBanner && (
                    <div className="p-4 rounded-xl bg-emerald-950 text-white text-xs border border-emerald-700 flex items-start gap-3 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      <div className="space-y-1 flex-1">
                        <div className="font-black text-emerald-300">
                          Funds Transfer Screenshot Uploaded &amp; Confirmation Mail Sent
                        </div>
                        <div className="text-slate-200 leading-relaxed">{proofSubmittedBanner}</div>
                      </div>
                    </div>
                  )}

                  {/* Step Fields: Amount, Confirmation Email, and Reference ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Transfer Amount ({walletCurrency.country} • {walletCurrency.currencyCode})
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-black text-slate-400">
                          {walletCurrency.currencySymbol}
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={amountInr}
                          onChange={e => {
                            setAmountInr(e.target.value);
                            if (proofError) setProofError(null);
                          }}
                          placeholder="5000"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {walletCurrency.flag} {walletCurrency.country} ({walletCurrency.currencyCode})
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Confirmation Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="email"
                          value={confirmationEmail}
                          onChange={e => setConfirmationEmail(e.target.value)}
                          placeholder={currentUser?.email || 'client@company.com'}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        Instant mail receipt sent here
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        UTR / SWIFT Reference ID
                      </label>
                      <input
                        type="text"
                        value={transferUtrInput}
                        onChange={e => setTransferUtrInput(e.target.value)}
                        placeholder={gatewayTxId || 'SWIFT / Bank UTR'}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                      />
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        Optional • Auto-generated if blank
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Full-Width Screenshot Upload Dropzone */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700">
                        Payment Screenshot / Wire Advice Slip
                      </span>
                      {transferProofFile && (
                        <button
                          type="button"
                          onClick={() => setTransferProofFile(null)}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Remove File
                        </button>
                      )}
                    </div>

                    <label
                      className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        transferProofFile
                          ? 'border-emerald-500/70 bg-emerald-50/50'
                          : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            transferProofFile
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {transferProofFile ? (
                            <FileCheck2 className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {transferProofFile
                              ? transferProofFile
                              : 'Click to upload transfer screenshot or bank wire receipt'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {transferProofFile
                              ? 'Screenshot attached • Ready for portal verification & email confirmation'
                              : 'Supports PNG, JPG, JPEG, or PDF • Max 10 MB'}
                          </div>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setTransferProofFile(file.name);
                            setProofError(null);
                            setProofSubmittedBanner(null);
                          }
                        }}
                      />

                      <span
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 text-center transition-colors ${
                          transferProofFile
                            ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {transferProofFile ? 'Change Screenshot' : 'Browse Screenshot'}
                      </span>
                    </label>
                  </div>

                  {/* Action Footer Bar */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Confirmation Receipt:</span>{' '}
                      Sent to <span className="font-mono font-bold text-slate-900">{(confirmationEmail || currentUser?.email || 'your registered email').trim()}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingProof}
                      onClick={handlePortalScreenshotSubmission}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-xs disabled:opacity-60"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>
                        {isSubmittingProof
                          ? 'Uploading & Sending Confirmation Mail...'
                          : 'Submit Screenshot & Send Confirmation Mail'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Quick Preset Top-Up Amounts */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    2. Select Top-Up Amount ({walletCurrency.country} • {walletCurrency.currencyCode})
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {walletCurrency.flag} {walletCurrency.currencyCode} ({walletCurrency.currencySymbol})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS_LOCAL.map(preset => {
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
                          {active && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-sm sm:text-base font-black font-mono mt-1.5">
                          {walletCurrency.flag} {walletCurrency.currencySymbol}
                          {preset.value.toLocaleString('en-US')}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            active ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {walletCurrency.country} ({walletCurrency.currencyCode})
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="pt-2">
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-black font-mono text-base">
                      {walletCurrency.currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={amountInr}
                      onChange={e => setAmountInr(e.target.value)}
                      placeholder={`Enter custom deposit amount in ${walletCurrency.currencyCode}`}
                      className="w-full pl-10 pr-36 py-3.5 rounded-2xl border border-slate-300 focus:border-emerald-600 focus:outline-none text-base font-black font-mono text-slate-900 bg-slate-50/50"
                    />
                    <div className="absolute right-3 text-right">
                      <div className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {walletCurrency.flag} {walletCurrency.currencyCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1 font-mono">
                    <span>
                      Country Wallet Credit: <strong>{formatLocalAmount(parsedInr, selectedWallet)}</strong>
                    </span>
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
                  Proceed to Gateway Confirmation ({formatLocalAmount(parsedInr, selectedWallet)})
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          )}

          {/* STEP 2: INTERACTIVE PAYMENT GATEWAY CONFIRMATION MOCKUP */}
          {(simStep === 'GATEWAY_CHECKOUT' || simStep === 'PROCESSING_WEBHOOK') && selectedWallet && (
            <div className="border-2 border-blue-600 rounded-3xl overflow-hidden bg-slate-50 shadow-lg">
              {/* Mock Gateway Top Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
                    {selectedGateway.id === 'CURRENCY_CLOUD_SWIFT' ? 'SWIFT' : 'PG'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">{selectedGateway.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                        {selectedGateway.id === 'CURRENCY_CLOUD_SWIFT' ? 'OFFICIAL WIRE RAIL' : '256-BIT TLS SANDBOX'}
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
                    {formatLocalAmount(parsedInr, selectedWallet)}
                  </div>
                </div>
              </div>

              {/* Mock Gateway Body */}
              <div className="p-6 space-y-5">
                {/* Specialized SWIFT Wire Settlement Details Card if Currency Cloud */}
                {selectedGateway.id === 'CURRENCY_CLOUD_SWIFT' && (
                  <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-blue-500/30 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-blue-900 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-xs uppercase tracking-wider text-blue-200">
                          Official Settlement Wire Details
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAllSwiftDetails}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'ALL_SWIFT' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'ALL_SWIFT' ? 'Copied All' : 'Copy All'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Account Holder Name</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Bank Name</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{OFFICIAL_SWIFT_BANK_DETAILS.bankName}</span>
                      </div>
                      <div className="p-2.5 bg-blue-900/20 rounded-xl border border-blue-500/40 sm:col-span-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-blue-300 block uppercase font-semibold">IBAN (Account Number)</span>
                          <span className="font-mono font-black text-white text-xs sm:text-sm tracking-wider select-all">
                            {OFFICIAL_SWIFT_BANK_DETAILS.iban}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyField('IBAN_STEP2', OFFICIAL_SWIFT_BANK_DETAILS.iban)}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          {copiedField === 'IBAN_STEP2' ? 'Copied' : 'Copy IBAN'}
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">BIC / SWIFT Code</span>
                          <span className="font-mono font-bold text-white text-xs select-all">{OFFICIAL_SWIFT_BANK_DETAILS.bicSwift}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyField('BIC_STEP2', OFFICIAL_SWIFT_BANK_DETAILS.bicSwift)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                        >
                          {copiedField === 'BIC_STEP2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Beneficiary Bank Country</span>
                        <span className="text-white text-xs mt-0.5 block">{OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry}</span>
                      </div>
                    </div>

                    {/* Critical Mandatory Remark Box */}
                    <div className="p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl text-amber-200 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-300 block">Mandatory Transfer Remark:</span>
                        <span className="font-mono font-black text-white text-xs sm:text-sm tracking-wider select-all">
                          {OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyField('REMARK_STEP2', OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] cursor-pointer shrink-0"
                      >
                        {copiedField === 'REMARK_STEP2' ? 'Copied!' : 'Copy Remark'}
                      </button>
                    </div>
                  </div>
                )}

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
                    <span className="text-slate-500 font-semibold">
                      Wallet Credit ({walletCurrency.country}):
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatLocalAmount(parsedInr, selectedWallet)}
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
                      {formatNativeFromPaise(lastReceipt.amountPaise)} Credited to Buyer Wallet
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
                    {formatNativeFromPaise(lastReceipt.previousBalancePaise)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-emerald-600">+ Top-Up Deposit</div>
                  <div className="text-sm font-black text-emerald-600 font-mono mt-0.5">
                    +{formatNativeFromPaise(lastReceipt.amountPaise)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {walletCurrency.country} ({walletCurrency.currencyCode})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-900">New Available Balance</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                    {formatNativeFromPaise(lastReceipt.newBalancePaise)}
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
          {/* Logged-In Client Personal Wallet Status Only */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  My Personal Account Balance
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

            {selectedWallet && (
              <div className="p-4 rounded-xl border bg-white border-emerald-500 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>{getEntityCurrency(selectedWallet).flag}</span>
                      <span>{currentUser?.companyName || selectedWallet.company_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {currentUser?.name || selectedWallet.entity_name} • {getEntityCurrency(selectedWallet).country} ({getEntityCurrency(selectedWallet).currencyCode})
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    MY ACCOUNT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Available Balance</span>
                    <span className="font-mono font-black text-emerald-600 block text-sm">
                      {formatBalanceInNativeCurrency(selectedWallet.available_balance, selectedWallet).primary}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400 block">
                      {formatBalanceInNativeCurrency(selectedWallet.available_balance, selectedWallet).secondary}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Locked in Escrow</span>
                    <span className="font-mono font-bold text-amber-600 block text-sm">
                      {formatBalanceInNativeCurrency(selectedWallet.locked_balance, selectedWallet).primary}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400 block">
                      {formatBalanceInNativeCurrency(selectedWallet.locked_balance, selectedWallet).secondary}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mail Confirmation To:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800 truncate max-w-[180px]">
                    {confirmationEmail || currentUser?.email || 'Registered Client Email'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Direct Buyer-to-Supplier Funds Transfer Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Transfer Funds to Supplier
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                VIP Direct &amp; Escrow
              </span>
            </div>

            <form onSubmit={handleTransferToSupplier} className="p-5 space-y-3.5 bg-slate-50/50">
              {supplierTransferFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
                    supplierTransferFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {supplierTransferFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">{supplierTransferFeedback.message}</div>
                </div>
              )}

              {/* Transfer Mode Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSupplierTransferMode('DIRECT_VIP')}
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    supplierTransferMode === 'DIRECT_VIP'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  VIP Direct Settlement
                </button>
                <button
                  type="button"
                  onClick={() => setSupplierTransferMode('ESCROW_HOLD')}
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    supplierTransferMode === 'ESCROW_HOLD'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lock in Order Escrow
                </button>
              </div>

              {/* Recipient Supplier Select (Name & Country Only - Never Shows Balance) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recipient Verified Supplier
                </label>
                <select
                  value={targetSupplierId}
                  onChange={e => {
                    setTargetSupplierId(e.target.value);
                    setSupplierTransferFeedback(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {supplierRecipients.map(supp => {
                    const info = getEntityCurrency(supp);
                    const isSuppBasic = tradeHeavenMediationService.isBasicPlanStatus(
                      supp.plan_status,
                      supp.entity_id
                    );
                    return (
                      <option key={supp.id} value={supp.entity_id}>
                        {info.flag} {supp.company_name} ({info.country}){' '}
                        {isSuppBasic
                          ? '— [Not Active • Contact Supplier]'
                          : '— [Direct Transfer Active]'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {isCurrentUserBasicPlan && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
                  <div className="font-black uppercase tracking-wide text-[11px] text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Direct On-Site Transfer Not Active</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    Direct on-site fund transfer is currently not active for <strong>{currentUser?.companyName || currentUser?.name}</strong>. Please contact the supplier directly for payment arrangements.
                  </p>
                </div>
              )}

              {isSelectedSupplierBasicPlan && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
                  <div className="font-black uppercase tracking-wide text-[11px] text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Direct On-Site Transfer Not Active</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    Direct on-site fund transfer is not active for <strong>{selectedRecipientWallet?.company_name || 'IMPORTATION FADE-TECH (OTEC LTD)'}</strong>. Please contact the supplier directly for it.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Transfer Amount ({getEntityCurrency(selectedRecipientWallet || targetSupplierId).country} • {getEntityCurrency(selectedRecipientWallet || targetSupplierId).currencyCode})
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-black text-slate-400">
                      {getEntityCurrency(selectedRecipientWallet || targetSupplierId).currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={supplierTransferAmountInr}
                      onChange={e => setSupplierTransferAmountInr(e.target.value)}
                      disabled={isDirectTransferBlockedByPlan}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      required
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {getEntityCurrency(selectedRecipientWallet || targetSupplierId).flag}{' '}
                    {getEntityCurrency(selectedRecipientWallet || targetSupplierId).country} (
                    {getEntityCurrency(selectedRecipientWallet || targetSupplierId).currencyCode})
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PO / Invoice Reference
                  </label>
                  <input
                    type="text"
                    value={supplierOrderRef}
                    onChange={e => setSupplierOrderRef(e.target.value)}
                    disabled={isDirectTransferBlockedByPlan}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:border-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isTransferringToSupplier || isDirectTransferBlockedByPlan}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>
                  {isDirectTransferBlockedByPlan
                    ? 'Not Active — Contact Supplier for Payment'
                    : isTransferringToSupplier
                    ? 'Processing Supplier Transfer...'
                    : supplierTransferMode === 'DIRECT_VIP'
                    ? 'Send Direct Funds Transfer to Supplier'
                    : 'Lock Funds in Escrow for Supplier'}
                </span>
              </button>

              {onNavigateToFullEngine && (
                <button
                  type="button"
                  onClick={onNavigateToFullEngine}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Full 4-Stage Escrow &amp; Settlement Engine →</span>
                </button>
              )}
            </form>
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
                        +{formatBalanceInNativeCurrency(entry.amount, selectedWallet).primary}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {walletCurrency.country} ({walletCurrency.currencyCode})
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
