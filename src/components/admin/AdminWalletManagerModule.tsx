import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet,
  PlusCircle,
  MinusCircle,
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  DollarSign,
  ShieldCheck,
  Clock
} from 'lucide-react';
import {
  tradeHeavenMediationService,
  MediationSystemState,
  WalletRecord
} from '../../services/tradeHeavenMediatorEngine';
import {
  formatBalanceInNativeCurrency,
  getEntityCurrency,
  localAmountToPaise,
  formatLocalAmount
} from '../../utils/entityCurrency';
import { getAllSuppliersWithUsers } from '../../services/apiService';
import { MOCK_COMPANIES } from '../../data/mockData';

const EMAIL_HISTORY_STORAGE_KEY = 'th_admin_dispatched_emails_history';

const KNOWN_ENTITY_EMAILS: Record<string, string> = {
  'comp-melissa-mpcommodity': 'melissa@mpcommoditybrokers.com',
  'comp-zac-importation-fadetech': 'zac@otec.ltd',
  'comp-atlantic-power-equip': 'mjohnson@atlanticpowerequip.com',
  'comp-joy-bamboo-forest-farm': 'joybambooforestfarm@gmail.com',
  'buyer-girlsenberries-01': 'sorkindon@gmail.com',
  'buyer-titan-01': 'procurement@titanglobal-infra.com',
  'buyer-euro-02': 'procurement@euromed-gmbh.de',
  'buyer-apex-03': 'sourcing@apexagro-imports.in',
  'comp-shenzhen-solar': 'export@luminanewenergy.cn',
  'comp-bharat-steel': 'exports@bharatprecisionforgings.in',
  'trade-heaven-treasury': 'yr943334@gmail.com'
};

interface DirectoryClientOption {
  entityId: string;
  entityName: string;
  companyName: string;
  email: string;
  walletType: 'BUYER' | 'SUPPLIER' | 'PLATFORM_REVENUE';
  country: string;
  planStatus: string;
  wallet?: WalletRecord;
}

const escapeHtml = (str: string) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const AdminWalletManagerModule: React.FC = () => {
  const [mediationState, setMediationState] = useState<MediationSystemState | null>(null);
  const [registeredSuppliers, setRegisteredSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selected entity / form state
  const [selectedEntityId, setSelectedEntityId] = useState<string>('comp-melissa-mpcommodity');
  const [customEntityMode, setCustomEntityMode] = useState<boolean>(false);
  const [customCompanyName, setCustomCompanyName] = useState<string>('');
  const [customContactName, setCustomContactName] = useState<string>('');
  const [customWalletType, setCustomWalletType] = useState<'BUYER' | 'SUPPLIER'>('SUPPLIER');

  const [operation, setOperation] = useState<'ADD' | 'REMOVE'>('ADD');
  const [balanceTarget, setBalanceTarget] = useState<'AVAILABLE' | 'LOCKED'>('AVAILABLE');
  const [amountInput, setAmountInput] = useState<string>('+5000');
  const [referenceId, setReferenceId] = useState<string>(
    () => `TH-WAL-${Date.now().toString().slice(-6)}`
  );
  const [reason, setReason] = useState<string>('');

  // Email Notification Controls
  const [sendClientEmail, setSendClientEmail] = useState<boolean>(true);
  const [sendAdminCopy, setSendAdminCopy] = useState<boolean>(true);
  const [clientEmail, setClientEmail] = useState<string>('melissa@mpcommoditybrokers.com');
  const [adminCopyEmail, setAdminCopyEmail] = useState<string>('yr943334@gmail.com');
  const [customEmailNote, setCustomEmailNote] = useState<string>(
    'Your Trade Heaven wallet balance has been updated by the Treasury & Compliance Desk. Log in to your dashboard to view your updated funds ledger or initiate an authorized transfer.'
  );
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(true);

  const [walletSearch, setWalletSearch] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    emailStatus?: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const medState = await tradeHeavenMediationService.getState();
      const suppliers = getAllSuppliersWithUsers();
      setMediationState(medState);
      setRegisteredSuppliers(Array.isArray(suppliers) ? suppliers : []);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Failed to Load Wallet State',
        message: err?.message || 'Unable to load wallet records.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const onMedUpdate = (e: Event) => {
      const detail = (e as CustomEvent<MediationSystemState>).detail;
      if (detail && detail.wallets) {
        setMediationState(detail);
      } else {
        loadData();
      }
    };
    window.addEventListener('tradeheaven_mediation_updated', onMedUpdate);
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('th_mediation_wallet_sync');
        bc.onmessage = () => loadData();
      }
    } catch {}
    return () => {
      window.removeEventListener('tradeheaven_mediation_updated', onMedUpdate);
      try {
        bc?.close();
      } catch {}
    };
  }, [loadData]);

  // Combine wallets + known suppliers/companies into unified selectable options
  const clientOptions: DirectoryClientOption[] = useMemo(() => {
    const map = new Map<string, DirectoryClientOption>();
    const wallets = mediationState?.wallets || [];

    const findEmailForEntity = (entityId: string, companyName: string, contactName: string): string => {
      if (KNOWN_ENTITY_EMAILS[entityId]) return KNOWN_ENTITY_EMAILS[entityId];
      const lowerComp = (companyName || '').toLowerCase();
      const lowerName = (contactName || '').toLowerCase();
      const sup = registeredSuppliers.find(
        (s: any) =>
          String(s.id || '').toLowerCase() === entityId.toLowerCase() ||
          (lowerComp && String(s.companyName || '').toLowerCase().includes(lowerComp)) ||
          (lowerName && String(s.contactName || s.name || '').toLowerCase().includes(lowerName))
      );
      if (sup?.contactEmail || sup?.email) return sup.contactEmail || sup.email;
      const mock = MOCK_COMPANIES.find(
        c =>
          c.id.toLowerCase() === entityId.toLowerCase() ||
          (lowerComp && c.companyName.toLowerCase().includes(lowerComp))
      );
      if (mock?.contactEmail) return mock.contactEmail;
      return '';
    };

    wallets.forEach(w => {
      map.set(w.entity_id, {
        entityId: w.entity_id,
        entityName: w.entity_name,
        companyName: w.company_name,
        email: findEmailForEntity(w.entity_id, w.company_name, w.entity_name),
        walletType: w.wallet_type,
        country: w.country || 'United States',
        planStatus: w.plan_status || 'VIP',
        wallet: w
      });
    });

    [...MOCK_COMPANIES, ...registeredSuppliers].forEach((c: any) => {
      const id = c.id || c.entity_id;
      if (!id || map.has(id)) return;
      map.set(id, {
        entityId: id,
        entityName: c.contactName || c.name || c.companyName || id,
        companyName: c.companyName || c.name || id,
        email: c.contactEmail || c.email || KNOWN_ENTITY_EMAILS[id] || '',
        walletType: 'SUPPLIER',
        country: c.country || 'United States',
        planStatus: c.tier || c.membershipTier || 'BASIC'
      });
    });

    return Array.from(map.values());
  }, [mediationState, registeredSuppliers]);

  const activeWallet: WalletRecord | undefined = useMemo(() => {
    if (customEntityMode) return undefined;
    return (mediationState?.wallets || []).find(w => w.entity_id === selectedEntityId);
  }, [mediationState, selectedEntityId, customEntityMode]);

  const selectedClientOpt = useMemo(
    () => clientOptions.find(o => o.entityId === selectedEntityId),
    [clientOptions, selectedEntityId]
  );

  // Sync client email automatically when user switches wallet selection
  const handleSelectClient = (opt: DirectoryClientOption, nextOp?: 'ADD' | 'REMOVE') => {
    setCustomEntityMode(false);
    setSelectedEntityId(opt.entityId);
    if (opt.email) {
      setClientEmail(opt.email);
    }
    if (nextOp) {
      handleSelectOperation(nextOp);
      setReason(
        nextOp === 'ADD'
          ? `Funds Added (+Credit) to ${opt.companyName} Wallet`
          : `Funds Removed (-Debit) from ${opt.companyName} Wallet`
      );
    }
    setReferenceId(`TH-WAL-${Date.now().toString().slice(-6)}`);
    setFeedback(null);
  };

  const currencyTarget = useMemo(() => {
    if (customEntityMode) return 'United States';
    return activeWallet || selectedClientOpt?.country || selectedEntityId;
  }, [customEntityMode, activeWallet, selectedClientOpt, selectedEntityId]);

  const currencyConfig = useMemo(() => getEntityCurrency(currencyTarget), [currencyTarget]);

  const currentBalancePaise = useMemo(() => {
    if (!activeWallet) return 0;
    return Number(
      balanceTarget === 'LOCKED' ? activeWallet.locked_balance : activeWallet.available_balance || 0
    );
  }, [activeWallet, balanceTarget]);

  const handleAmountChange = (rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9.+\-]/g, '');
    setAmountInput(cleaned);
    if (cleaned.startsWith('-')) {
      setOperation('REMOVE');
    } else if (cleaned.startsWith('+')) {
      setOperation('ADD');
    }
  };

  const handleSelectOperation = (nextOp: 'ADD' | 'REMOVE') => {
    setOperation(nextOp);
    const unsigned = amountInput.replace(/^[+\-]/, '');
    if (unsigned) {
      setAmountInput(`${nextOp === 'ADD' ? '+' : '-'}${unsigned}`);
    }
  };

  const parsedLocalAmount = useMemo(() => {
    const v = Math.abs(parseFloat(amountInput.replace(/^\+/, '')));
    return isNaN(v) || v <= 0 ? 0 : v;
  }, [amountInput]);

  const adjustmentPaise = useMemo(
    () => localAmountToPaise(parsedLocalAmount, currencyTarget),
    [parsedLocalAmount, currencyTarget]
  );

  const projectedBalancePaise = useMemo(() => {
    if (operation === 'ADD') return currentBalancePaise + adjustmentPaise;
    return Math.max(0, currentBalancePaise - adjustmentPaise);
  }, [operation, currentBalancePaise, adjustmentPaise]);

  const currentFormatted = formatBalanceInNativeCurrency(currentBalancePaise, currencyTarget, {
    includeCode: true
  });
  const adjustmentFormatted = formatLocalAmount(parsedLocalAmount, currencyTarget, {
    includeFlag: true,
    includeCode: true
  });
  const projectedFormatted = formatBalanceInNativeCurrency(projectedBalancePaise, currencyTarget, {
    includeCode: true
  });

  const buildWalletNotificationHtml = (opts: {
    op: 'ADD' | 'REMOVE';
    recipientName: string;
    companyName: string;
    prevFmt: string;
    deltaFmt: string;
    nextFmt: string;
    refId: string;
    reasonText: string;
    noteText: string;
    targetLabel: string;
  }) => {
    const isCredit = opts.op === 'ADD';
    const accent = isCredit ? '#059669' : '#dc2626';
    const badgeBg = isCredit ? '#ecfdf5' : '#fef2f2';
    const badgeBorder = isCredit ? '#a7f3d0' : '#fecaca';
    const actionLabel = isCredit ? 'FUNDS CREDITED (+)' : 'FUNDS REMOVED (-)';
    const sign = isCredit ? '+' : '-';

    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,41,77,0.06);">
    <div style="background:#0f294d;padding:24px 28px;color:#ffffff;">
      <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#93c5fd;">TRADE HEAVEN • TREASURY &amp; CUSTODIAL WALLET DESK</div>
      <h1 style="margin:8px 0 0 0;font-size:21px;font-weight:800;line-height:1.3;">Wallet Balance ${isCredit ? 'Credit' : 'Adjustment'} Notice</h1>
    </div>
    <div style="padding:28px;">
      <div style="display:inline-block;padding:6px 12px;border-radius:8px;background:${badgeBg};border:1px solid ${badgeBorder};color:${accent};font-size:11px;font-weight:800;letter-spacing:0.6px;margin-bottom:16px;">
        ${actionLabel} • REF: ${escapeHtml(opts.refId)}
      </div>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#334155;">
        Dear <strong>${escapeHtml(opts.recipientName)}</strong> (${escapeHtml(opts.companyName)}),
      </p>
      <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#334155;">
        ${escapeHtml(opts.noteText)}
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:7px 0;color:#64748b;">Wallet Ledger Scope:</td>
            <td style="padding:7px 0;text-align:right;font-weight:700;color:#0f172a;">${escapeHtml(opts.targetLabel)}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;border-top:1px solid #e2e8f0;">Previous Balance:</td>
            <td style="padding:7px 0;text-align:right;font-weight:700;color:#475569;border-top:1px solid #e2e8f0;">${escapeHtml(opts.prevFmt)}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;border-top:1px solid #e2e8f0;">${isCredit ? 'Amount Added' : 'Amount Removed'}:</td>
            <td style="padding:7px 0;text-align:right;font-weight:800;font-size:15px;color:${accent};border-top:1px solid #e2e8f0;">${sign}${escapeHtml(opts.deltaFmt)}</td>
          </tr>
          <tr>
            <td style="padding:9px 0 4px 0;color:#0f294d;font-weight:800;border-top:2px solid #cbd5e1;">Updated Available Balance:</td>
            <td style="padding:9px 0 4px 0;text-align:right;font-weight:900;font-size:17px;color:#0f294d;border-top:2px solid #cbd5e1;">${escapeHtml(opts.nextFmt)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;font-size:12px;color:#78350f;margin-bottom:22px;">
        <strong>Treasury Reference / Memo:</strong> ${escapeHtml(opts.reasonText)}<br/>
        <strong>Transaction Reference:</strong> ${escapeHtml(opts.refId)}
      </div>

      <div style="text-align:center;">
        <a href="https://www.tradeheaven.net/?view=WALLET_TOPUP" style="display:inline-block;padding:12px 24px;background:#0f294d;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;font-size:13px;">
          View Wallet &amp; Transaction Ledger →
        </a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:16px 28px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;">
      Trade Heaven Global B2B Treasury &amp; Escrow Mediation Desk &bull; support@tradeheaven.net
    </div>
  </div>
</body>
</html>`;
  };

  const dispatchClientNotificationEmail = async (params: {
    op: 'ADD' | 'REMOVE';
    recipientEmail: string;
    recipientName: string;
    companyName: string;
    prevPaise: number;
    deltaPaise: number;
    nextPaise: number;
    refId: string;
    reasonText: string;
  }) => {
    const cleanTo = params.recipientEmail.trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      return { success: false, message: 'Skipped email: valid client email address was not provided.' };
    }

    const prevFmt = formatBalanceInNativeCurrency(params.prevPaise, currencyTarget, { includeCode: true }).primary;
    const deltaFmt = formatBalanceInNativeCurrency(params.deltaPaise, currencyTarget, { includeCode: true }).primary;
    const nextFmt = formatBalanceInNativeCurrency(params.nextPaise, currencyTarget, { includeCode: true }).primary;
    const targetLabel = balanceTarget === 'LOCKED' ? 'Locked Escrow Balance' : 'Available Wallet Balance';

    const subject =
      params.op === 'ADD'
        ? `Wallet Credited (+${deltaFmt}): Updated Balance ${nextFmt} — ${params.companyName} (${params.refId})`
        : `Wallet Balance Adjusted (-${deltaFmt}): Updated Balance ${nextFmt} — ${params.companyName} (${params.refId})`;

    const html = buildWalletNotificationHtml({
      op: params.op,
      recipientName: params.recipientName,
      companyName: params.companyName,
      prevFmt,
      deltaFmt,
      nextFmt,
      refId: params.refId,
      reasonText: params.reasonText,
      noteText: customEmailNote,
      targetLabel
    });

    const payload = {
      recipientEmail: cleanTo,
      recipientName: params.recipientName,
      companyName: params.companyName,
      subject,
      headline:
        params.op === 'ADD'
          ? `Wallet Credited (+${deltaFmt})`
          : `Wallet Balance Adjusted (-${deltaFmt})`,
      subheadline: `Updated ${targetLabel}: ${nextFmt} | Ref: ${params.refId}`,
      introMessage: customEmailNote,
      rawHtmlOverride: html,
      category: 'WALLET_NOTIFICATION',
      dispatchType: 'MANUAL',
      sendAdminCopy: sendAdminCopy && adminCopyEmail.includes('@'),
      adminCopyEmail: adminCopyEmail.trim()
    };

    let resData: any = null;
    try {
      const res = await fetch('/api/v1/admin/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const parsed = await res.json().catch(() => null);
      if (res.ok && parsed && parsed.status !== 'fallback') resData = parsed;
    } catch {}

    if (!resData) {
      const phpRes = await fetch('/api.php?action=send_custom_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      resData = await phpRes.json().catch(() => null);
    }

    // Record in localStorage & notify open Chrome tabs so Mail History stays in lockstep
    try {
      const raw = localStorage.getItem(EMAIL_HISTORY_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(list) ? list : [];
      const entry = {
        id: `hist-wal-${Date.now()}`,
        recipient: cleanTo,
        recipientEmail: cleanTo,
        recipientName: params.recipientName,
        companyName: params.companyName,
        subject,
        templatePreset: 'wallet_balance_notification',
        messageId: resData?.receipt?.messageId || resData?.messageId || `<wal-${Date.now()}@tradeheaven.net>`,
        trackingId: resData?.receipt?.trackingId || resData?.trackingId,
        dispatchedAt: new Date().toISOString(),
        deliveryMode: resData?.receipt?.deliveryMode || resData?.deliveryMode || 'LIVE_SMTP',
        success: resData?.success !== false,
        summaryText: `${params.op === 'ADD' ? 'Credited +' : 'Removed -'}${deltaFmt} (${params.refId}) • New Balance: ${nextFmt}`,
        htmlPreview: html
      };
      localStorage.setItem(EMAIL_HISTORY_STORAGE_KEY, JSON.stringify([entry, ...arr].slice(0, 200)));
      window.dispatchEvent(new Event('tradeheaven_email_history_updated'));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('th_admin_email_history_sync');
        bc.postMessage({ type: 'EMAIL_SENT', at: Date.now() });
        bc.close();
      }
    } catch {}

    if (resData?.success) {
      return {
        success: true,
        message: `Email notification delivered to ${cleanTo}${sendAdminCopy && adminCopyEmail ? ` (+ Admin Copy ${adminCopyEmail})` : ''} & recorded in Email History.`
      };
    }
    return {
      success: false,
      message: resData?.message || 'Wallet updated, but SMTP mail dispatch returned an error.'
    };
  };

  const handleApplyWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (parsedLocalAmount <= 0 || adjustmentPaise <= 0) {
      setFeedback({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a positive fund amount greater than 0.'
      });
      return;
    }

    const targetEntityId = customEntityMode
      ? (clientEmail.trim() || customCompanyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      : selectedEntityId;

    if (!targetEntityId) {
      setFeedback({
        type: 'error',
        title: 'Target Client Required',
        message: 'Select a wallet or enter a client email / company name.'
      });
      return;
    }

    const targetName = customEntityMode
      ? customContactName.trim() || clientEmail.trim() || 'Client Partner'
      : selectedClientOpt?.entityName || activeWallet?.entity_name || targetEntityId;

    const targetCompany = customEntityMode
      ? customCompanyName.trim() || targetName
      : selectedClientOpt?.companyName || activeWallet?.company_name || targetName;

    setIsSubmitting(true);
    try {
      const result = await tradeHeavenMediationService.adminAdjustWallet({
        entityId: targetEntityId,
        operation,
        amountPaise: adjustmentPaise,
        entityName: targetName,
        companyName: targetCompany,
        walletType: customEntityMode ? customWalletType : selectedClientOpt?.walletType,
        country: customEntityMode ? 'United States' : selectedClientOpt?.country || activeWallet?.country,
        nativeCurrency: currencyConfig.currencyCode,
        nativeSymbol: currencyConfig.currencySymbol,
        referenceId: referenceId.trim(),
        reason: reason.trim(),
        balanceTarget
      });

      setMediationState(result.state);
      if (customEntityMode) {
        setCustomEntityMode(false);
        setSelectedEntityId(result.wallet.entity_id);
      }

      let emailMsg = 'Email notification skipped (toggle off).';
      if (sendClientEmail) {
        const emailOutcome = await dispatchClientNotificationEmail({
          op: operation,
          recipientEmail: clientEmail,
          recipientName: targetName,
          companyName: targetCompany,
          prevPaise: Number(result.previousBalancePaise || 0),
          deltaPaise: adjustmentPaise,
          nextPaise: Number(result.newBalancePaise || 0),
          refId: result.ledgerEntry.reference_id,
          reasonText: reason.trim()
        });
        emailMsg = emailOutcome.message;
      }

      const newBalDisplay = formatBalanceInNativeCurrency(result.newBalancePaise, currencyTarget, {
        includeCode: true
      }).primary;

      setFeedback({
        type: 'success',
        title:
          operation === 'ADD'
            ? `Added +${adjustmentFormatted} to ${targetCompany}`
            : `Removed -${adjustmentFormatted} from ${targetCompany}`,
        message: `Updated ${balanceTarget === 'LOCKED' ? 'Locked Escrow' : 'Available'} Balance: ${newBalDisplay} (Ref: ${result.ledgerEntry.reference_id}).`,
        emailStatus: emailMsg
      });
      setReferenceId(`TH-WAL-${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Wallet Adjustment Failed',
        message: err?.message || 'Could not apply wallet balance update.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNotificationOnly = async () => {
    setFeedback(null);
    const targetName = customEntityMode
      ? customContactName.trim() || 'Client Partner'
      : selectedClientOpt?.entityName || activeWallet?.entity_name || selectedEntityId;
    const targetCompany = customEntityMode
      ? customCompanyName.trim() || targetName
      : selectedClientOpt?.companyName || activeWallet?.company_name || targetName;

    setIsSubmitting(true);
    try {
      const outcome = await dispatchClientNotificationEmail({
        op: operation,
        recipientEmail: clientEmail,
        recipientName: targetName,
        companyName: targetCompany,
        prevPaise: currentBalancePaise,
        deltaPaise: adjustmentPaise || 0,
        nextPaise: currentBalancePaise,
        refId: referenceId.trim(),
        reasonText: reason.trim()
      });
      setFeedback({
        type: outcome.success ? 'success' : 'error',
        title: outcome.success ? 'Wallet Email Notification Sent' : 'Email Notification Issue',
        message: outcome.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWallets = useMemo(() => {
    const list = mediationState?.wallets || [];
    const q = walletSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      w =>
        w.company_name.toLowerCase().includes(q) ||
        w.entity_name.toLowerCase().includes(q) ||
        w.entity_id.toLowerCase().includes(q) ||
        (KNOWN_ENTITY_EMAILS[w.entity_id] || '').toLowerCase().includes(q)
    );
  }, [mediationState, walletSearch]);

  const adminLedgerEntries = useMemo(() => {
    return (mediationState?.ledgerEntries || []).slice(0, 20);
  }, [mediationState]);

  const targetCompanyLabel = customEntityMode
    ? customCompanyName.trim() || 'Custom Client Wallet'
    : selectedClientOpt?.companyName || activeWallet?.company_name || selectedEntityId;

  const targetPersonLabel = customEntityMode
    ? customContactName.trim() || 'Trade Partner'
    : selectedClientOpt?.entityName || activeWallet?.entity_name || 'Client Partner';

  return (
    <div className="space-y-6" data-testid="admin-wallet-manager">
      {/* HEADER */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Financial Management — Client Wallet &amp; Funds Control
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold uppercase">
                Manual +/- Adjustment + Auto Email Alert
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Manually add (+) or deduct (-) funds on any client wallet, attach an optional memo note, and optionally trigger an automatic email notification to the client.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Wallets</span>
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <div className="font-black text-sm">{feedback.title}</div>
            <div className="font-semibold">{feedback.message}</div>
            {feedback.emailStatus && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-bold mt-1">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>{feedback.emailStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN GRID: LEFT = ADD/REMOVE FUNDS + EMAIL NOTIFY, RIGHT = WALLETS TABLE & EMAIL PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: WALLET ADJUSTMENT FORM */}
        <form
          onSubmit={handleApplyWalletAdjustment}
          className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>1. Select Client Wallet &amp; Fund Action</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setCustomEntityMode(!customEntityMode);
                setFeedback(null);
              }}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {customEntityMode ? '← Pick Existing Wallet' : '+ New / Custom Client Wallet'}
            </button>
          </div>

          {/* CLIENT SELECTOR */}
          {!customEntityMode ? (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600">
                Target Client / Supplier / Buyer Wallet
              </label>
              <select
                value={selectedEntityId}
                onChange={e => {
                  const found = clientOptions.find(o => o.entityId === e.target.value);
                  if (found) handleSelectClient(found);
                }}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden text-slate-900"
              >
                {clientOptions.map(opt => {
                  const balLabel = opt.wallet
                    ? formatBalanceInNativeCurrency(opt.wallet.available_balance, opt.wallet, {
                        includeCode: true
                      }).primary
                    : `${getEntityCurrency(opt.country).currencySymbol}0.00 (New Wallet)`;
                  return (
                    <option key={opt.entityId} value={opt.entityId}>
                      [{opt.walletType}] {opt.companyName} — {opt.entityName} ({balLabel})
                    </option>
                  );
                })}
              </select>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Current Available
                  </div>
                  <div className="font-black text-slate-900 text-sm mt-0.5 tabular-nums">
                    {activeWallet
                      ? formatBalanceInNativeCurrency(activeWallet.available_balance, currencyTarget, {
                          includeCode: true
                        }).primary
                      : `${currencyConfig.currencySymbol}0.00`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Locked in Escrow
                  </div>
                  <div className="font-black text-amber-700 text-sm mt-0.5 tabular-nums">
                    {activeWallet
                      ? formatBalanceInNativeCurrency(activeWallet.locked_balance, currencyTarget, {
                          includeCode: true
                        }).primary
                      : `${currencyConfig.currencySymbol}0.00`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Company / Entity Name
                </label>
                <input
                  type="text"
                  value={customCompanyName}
                  onChange={e => setCustomCompanyName(e.target.value)}
                  placeholder="e.g. Middle Fox LLC"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact / Owner Name
                </label>
                <input
                  type="text"
                  value={customContactName}
                  onChange={e => setCustomContactName(e.target.value)}
                  placeholder="e.g. Mr. Randy"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Wallet Role
                </label>
                <select
                  value={customWalletType}
                  onChange={e => setCustomWalletType(e.target.value as 'BUYER' | 'SUPPLIER')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  <option value="SUPPLIER">SUPPLIER WALLET</option>
                  <option value="BUYER">BUYER WALLET</option>
                </select>
              </div>
            </div>
          )}

          {/* ADD VS REMOVE SWITCH */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-600">
              Adjustment Direction (Or Type +/- Directly Below)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectOperation('ADD')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  operation === 'ADD'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Funds (+ Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectOperation('REMOVE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  operation === 'REMOVE'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>Reduce Funds (- Debit)</span>
              </button>
            </div>
          </div>

          {/* AMOUNT + LEDGER TARGET */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Adjustment Amount ({currencyConfig.currencySymbol} {currencyConfig.currencyCode}) — supports + or -
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="e.g. +5000 or -1500"
                className={`w-full px-3 py-2.5 text-sm font-black rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden tabular-nums ${
                  operation === 'ADD'
                    ? 'border-emerald-300 text-emerald-900 focus:border-emerald-500'
                    : 'border-rose-300 text-rose-900 focus:border-rose-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Wallet Bucket
              </label>
              <select
                value={balanceTarget}
                onChange={e => setBalanceTarget(e.target.value as 'AVAILABLE' | 'LOCKED')}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              >
                <option value="AVAILABLE">Available</option>
                <option value="LOCKED">Locked Escrow</option>
              </select>
            </div>
          </div>

          {/* QUICK AMOUNT PRESETS */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Fill:</span>
            {['500', '1000', '5000', '10000', '25000', '50000'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountInput(`${operation === 'ADD' ? '+' : '-'}${val}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-bold text-slate-700 border border-slate-200 cursor-pointer"
              >
                {operation === 'ADD' ? '+' : '-'}{currencyConfig.currencySymbol}{Number(val).toLocaleString()}
              </button>
            ))}
          </div>

          {/* LIVE BALANCE PREVIEW BOX */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
              operation === 'ADD'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase block opacity-75">Current</span>
              <span className="font-bold tabular-nums">{currentFormatted.primary}</span>
            </div>
            <span className="font-black text-base">→</span>
            <div>
              <span className="text-[10px] font-bold uppercase block opacity-75">
                {operation === 'ADD' ? 'Adding' : 'Removing'}
              </span>
              <span className="font-black tabular-nums">
                {operation === 'ADD' ? '+' : '-'}{adjustmentFormatted}
              </span>
            </div>
            <span className="font-black text-base">→</span>
            <div>
              <span className="text-[10px] font-bold uppercase block opacity-75">New Balance</span>
              <span className="font-black text-sm tabular-nums">{projectedFormatted.primary}</span>
            </div>
          </div>

          {/* REFERENCE & REASON */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Reference ID
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={e => setReferenceId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Optional Note / Memo
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Optional note (e.g. Wire deposit received, refund deduction)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          {/* CLIENT EMAIL NOTIFICATION TOGGLE */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={sendClientEmail}
                onClick={() => setSendClientEmail(!sendClientEmail)}
                className="flex items-center gap-2.5 cursor-pointer text-left"
              >
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    sendClientEmail ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                      sendClientEmail ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </span>
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Auto-Send Email Notification to Client</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="text-[11px] font-bold text-blue-600 flex items-center gap-1 cursor-pointer shrink-0"
              >
                {showEmailPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showEmailPreview ? 'Hide Preview' : 'Preview Mail'}</span>
              </button>
            </div>

            {sendClientEmail && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Client Email Address *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Admin Archive Copy
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendAdminCopy}
                        onChange={e => setSendAdminCopy(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-600 shrink-0"
                      />
                      <input
                        type="email"
                        value={adminCopyEmail}
                        onChange={e => setAdminCopyEmail(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Notification Message Body
                  </label>
                  <textarea
                    rows={2}
                    value={customEmailNote}
                    onChange={e => setCustomEmailNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 ${
                operation === 'ADD'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : operation === 'ADD' ? (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {sendClientEmail
                      ? 'Put Funds in Wallet & Notify Client'
                      : 'Put Funds in Wallet'}
                  </span>
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4" />
                  <span>
                    {sendClientEmail
                      ? 'Remove Funds & Notify Client'
                      : 'Remove Funds from Wallet'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting || !clientEmail}
              onClick={() => void handleSendNotificationOnly()}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email Only</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: LIVE EMAIL PREVIEW + ALL WALLETS DIRECTORY */}
        <div className="lg:col-span-6 space-y-6">
          {showEmailPreview && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="text-xs font-black flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Client Email Notification Preview</span>
                </div>
                <span className="text-[10px] font-mono text-slate-300 truncate max-w-[200px]">
                  To: {clientEmail || 'No email set'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        operation === 'ADD'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {operation === 'ADD' ? 'FUNDS CREDITED (+)' : 'FUNDS REMOVED (-)'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Ref: {referenceId}</span>
                  </div>
                  <div className="text-slate-800">
                    Dear <strong>{targetPersonLabel}</strong> ({targetCompanyLabel}),
                  </div>
                  <p className="text-slate-600 leading-relaxed">{customEmailNote}</p>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Previous Balance:</span>
                      <span className="font-bold tabular-nums">{currentFormatted.primary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {operation === 'ADD' ? 'Funds Added:' : 'Funds Removed:'}
                      </span>
                      <span
                        className={`font-black tabular-nums ${
                          operation === 'ADD' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {operation === 'ADD' ? '+' : '-'}{adjustmentFormatted}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span className="font-black text-[#0F294D]">Updated Balance:</span>
                      <span className="font-black text-[#0F294D] tabular-nums">
                        {projectedFormatted.primary}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    <strong>Note:</strong> {reason}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ALL CLIENT WALLETS LIST WITH 1-CLICK + / - BUTTONS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>All Client Wallets ({filteredWallets.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click + Add or - Remove on any client wallet to load it into the form.
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={walletSearch}
                  onChange={e => setWalletSearch(e.target.value)}
                  placeholder="Search wallet / company..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {filteredWallets.map(w => {
                const availFmt = formatBalanceInNativeCurrency(w.available_balance, w, {
                  includeCode: true
                });
                const lockedFmt = formatBalanceInNativeCurrency(w.locked_balance, w, {
                  includeCode: true
                });
                const matchedOpt = clientOptions.find(o => o.entityId === w.entity_id);
                const isSelected = !customEntityMode && selectedEntityId === w.entity_id;

                return (
                  <div
                    key={w.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-black uppercase">
                          {w.wallet_type}
                        </span>
                        <span className="text-xs font-black text-slate-900 truncate">
                          {w.company_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        {w.entity_name}
                        {matchedOpt?.email ? ` • ${matchedOpt.email}` : ''}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] pt-0.5">
                        <span className="font-black text-emerald-700 tabular-nums">
                          Avail: {availFmt.primary}
                        </span>
                        {Number(w.locked_balance || 0) > 0 && (
                          <span className="font-bold text-amber-700 tabular-nums">
                            Locked: {lockedFmt.primary}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (matchedOpt) handleSelectClient(matchedOpt, 'ADD');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>+ Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (matchedOpt) handleSelectClient(matchedOpt, 'REMOVE');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>- Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT WALLET TRANSACTIONS & ADMIN ADJUSTMENTS LEDGER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Recent Wallet Credits, Debits &amp; Escrow Ledger ({adminLedgerEntries.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-3">Reference</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Wallet</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Notes</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminLedgerEntries.map(entry => {
                const walletId = entry.destination_wallet_id || entry.source_wallet_id;
                const w = (mediationState?.wallets || []).find(item => item.id === walletId);
                const amtFmt = formatBalanceInNativeCurrency(entry.amount, w || 'USD', {
                  includeCode: true
                }).primary;
                const isDebit =
                  entry.transaction_type === 'ADMIN_WALLET_DEBIT' ||
                  entry.transaction_type === 'SUPPLIER_PAYOUT' ||
                  entry.transaction_type === 'ORDER_LOCK_ESCROW';
                return (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {entry.reference_id}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isDebit
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {entry.transaction_type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">
                      {w ? w.company_name : walletId || 'External'}
                    </td>
                    <td
                      className={`py-2.5 pr-3 font-black tabular-nums whitespace-nowrap ${
                        isDebit ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {isDebit ? '-' : '+'}{amtFmt}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600 max-w-xs truncate">
                      {entry.notes}
                    </td>
                    <td className="py-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {adminLedgerEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No ledger entries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
