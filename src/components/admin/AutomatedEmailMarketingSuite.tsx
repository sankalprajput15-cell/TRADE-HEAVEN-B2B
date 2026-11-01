import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Eye,
  CheckCheck,
  Check,
  Activity,
  Zap,
  FileText,
  Radio,
  ArrowUpRight,
  Copy,
  Building2,
  Clock,
  ShieldCheck,
  Filter,
  Play,
  Pause,
  Search,
  X,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import type {
  MailSuiteAnalyticsSummary,
  CompanyEmailHistoryEntry,
  SmtpWebhookEventLog
} from '../../services/smtpService';

export interface FailedAdLaunchAccountItem {
  id: string;
  recipientName: string;
  decisionMakerName: string;
  email: string;
  companyName: string;
  country: string;
  address: string;
  phone: string;
  invoiceRef: string;
  currentPlanName: string;
  targetFullPlanName: string;
  amountPaidUsd: number;
  standardPlanUsd: number;
  diwaliOfferPlanUsd: number;
  remainingBalanceUsd: number;
  failedCampaignId: string;
  failedCampaignName: string;
  failureReason: string;
  failedAt: string;
  accountStatus: 'PAUSE_WARNING_48H' | 'AD_HALTED' | 'FOLLOWUP_SENT' | 'RESOLVED';
  followUpCount: number;
  lastFollowUpAt?: string;
  lastTrackingId?: string;
  recommendedTemplateId: string;
}

export interface AutomatedMarketingTemplateItem {
  id: string;
  name: string;
  category: 'FAILED_AD_RECOVERY' | 'DIWALI_OFFER' | 'SUBSCRIPTION_UPSELL' | 'PAUSE_PREVENTION';
  badge: string;
  promoCode: string;
  discountPercent: number;
  subjectTemplate: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
}

export interface AutomatedMarketingCampaignItem {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  triggeredBy: string;
  dispatchMode: 'DEMO_TO_ADMIN' | 'LIVE_CLIENT_CAMPAIGN';
  createdAt: string;
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  trackingIds: string[];
  recipients: Array<{
    userId: string;
    recipientName: string;
    email: string;
    actualRecipientEmail: string;
    companyName: string;
    amountPaidUsd: number;
    remainingBalanceUsd: number;
    trackingId: string;
    status: string;
  }>;
}

interface AutomatedEmailMarketingSuiteProps {
  onOpenPaymentCheckout?: (data: any) => void;
  onSwitchToCustomDispatcher?: () => void;
}

export const AutomatedEmailMarketingSuite: React.FC<AutomatedEmailMarketingSuiteProps> = ({
  onOpenPaymentCheckout,
  onSwitchToCustomDispatcher
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'FAILED_ADS_QUEUE' | 'PREBUILT_TEMPLATES' | 'TRACKING_SERVICE' | 'WEBHOOK_LOGS'
  >('FAILED_ADS_QUEUE');

  const [failedAdUsers, setFailedAdUsers] = useState<FailedAdLaunchAccountItem[]>([]);
  const [templates, setTemplates] = useState<AutomatedMarketingTemplateItem[]>([]);
  const [campaigns, setCampaigns] = useState<AutomatedMarketingCampaignItem[]>([]);
  const [summary, setSummary] = useState<MailSuiteAnalyticsSummary>({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    unopenedCount: 0,
    openRatePercent: 0,
    totalOpensCount: 0,
    totalClicked: 0,
    clickThroughRatePercent: 0,
    clickToOpenRatePercent: 0,
    totalClicksCount: 0,
    recentEvents: []
  });
  const [history, setHistory] = useState<CompanyEmailHistoryEntry[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<SmtpWebhookEventLog[]>([]);

  const [automationRules, setAutomationRules] = useState({
    autoTriggerOnFailedAdLaunch: true,
    autoAttachDiwaliPromo: true,
    requireAdminDemoFirst: true,
    defaultTemplateId: 'tpl-failed-ads-diwali-combo',
    sendAdminCopyOnLiveDispatch: true,
    adminNotificationEmail: 'yr943334@gmail.com',
    webhookTrackingEnabled: true,
    pixelTrackingEnabled: true
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['fad-zac-otec-001']);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-failed-ads-diwali-combo');
  const [demoAdminEmail, setDemoAdminEmail] = useState<string>('yr943334@gmail.com');
  const [sendAdminCopy, setSendAdminCopy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTriggeringDemo, setIsTriggeringDemo] = useState<boolean>(false);
  const [isTriggeringLive, setIsTriggeringLive] = useState<boolean>(false);
  const [isFiringWebhook, setIsFiringWebhook] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [trackingFilter, setTrackingFilter] = useState<'ALL' | 'OPENED' | 'CLICKED' | 'DELIVERED' | 'BOUNCED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatingBatch, setIsSimulatingBatch] = useState<boolean>(false);
  const [activeSimulationAction, setActiveSimulationAction] = useState<string | null>(null);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [autoSimStep, setAutoSimStep] = useState<number>(0);
  const [recentSimulationLog, setRecentSimulationLog] = useState<
    Array<{ id: string; timestamp: string; action: string; message: string; badge: string }>
  >([
    {
      id: 'sim-init-01',
      timestamp: new Date().toLocaleTimeString(),
      action: 'DELIVERED',
      message: 'SMTP 250 OK BigRock TLS Queue initialized and ready for simulation tracking.',
      badge: 'SMTP_READY'
    }
  ]);
  const [toastNotifications, setToastNotifications] = useState<
    Array<{
      id: string;
      type: 'success' | 'error' | 'info';
      title: string;
      message: string;
      timestamp: string;
    }>
  >([]);

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string, customTitle?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const title =
        customTitle ||
        (type === 'success'
          ? 'Action Successful'
          : type === 'error'
          ? 'Action Failed'
          : 'Action Status');

      const newToast = {
        id,
        type,
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setToastNotifications((prev) => [newToast, ...prev.slice(0, 3)]);
      setStatusBanner({
        type: type === 'error' ? 'error' : 'success',
        text: `${title}: ${message}`
      });

      setTimeout(() => {
        setToastNotifications((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    []
  );

  const showNotice = useCallback(
    (type: 'success' | 'error', text: string) => {
      showNotification(type, text);
    },
    [showNotification]
  );

  const fetchSuiteState = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/marketing-suite/state', {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success) {
        if (Array.isArray(data.failedAdUsers)) setFailedAdUsers(data.failedAdUsers);
        if (Array.isArray(data.templates)) setTemplates(data.templates);
        if (Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
        if (data.summary) setSummary(data.summary);
        if (Array.isArray(data.history)) setHistory(data.history);
        if (Array.isArray(data.webhookLogs)) setWebhookLogs(data.webhookLogs);
        if (data.automationRules) {
          setAutomationRules((prev) => ({ ...prev, ...data.automationRules }));
        }
      }
    } catch {
      // ignore transient error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSuiteState();
  }, [fetchSuiteState]);

  const handleManualRefreshLedger = async () => {
    setIsLoading(true);
    try {
      await fetchSuiteState();
      showNotification('success', `Successfully refreshed Email Tracking Activity ledger (${history.length} emails up to date).`, 'Ledger Refreshed');
    } catch (err: any) {
      showNotification('error', `Failed to refresh tracking ledger: ${err?.message || 'Connection error'}`, 'Refresh Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoSimulating = () => {
    const next = !isAutoSimulating;
    setIsAutoSimulating(next);
    if (next) {
      showNotification(
        'success',
        'Auto-Run Mock Tracking Simulation started! Simulating live opens & clicks every 4.5 seconds.',
        'Simulation Started'
      );
    } else {
      showNotification(
        'info',
        'Auto-Run Mock Tracking Simulation paused.',
        'Simulation Paused'
      );
    }
  };

  const handleCopyTrackingId = (trkId: string) => {
    try {
      navigator.clipboard?.writeText(trkId);
      setCopiedTrackingId(trkId);
      showNotification('success', `Successfully copied Tracking ID "${trkId}" to clipboard!`, 'Tracking ID Copied');
      setTimeout(() => setCopiedTrackingId(null), 2000);
    } catch {
      showNotification('error', 'Failed to copy Tracking ID to clipboard. Clipboard access denied.', 'Copy Failed');
    }
  };

  const handleCopyPixelUrl = (url: string, trkId: string) => {
    try {
      navigator.clipboard?.writeText(url);
      setCopiedTrackingId(`pix-${trkId}`);
      showNotification('success', 'Successfully copied 1x1 Tracking Pixel URL to clipboard!', 'Pixel URL Copied');
      setTimeout(() => setCopiedTrackingId(null), 2000);
    } catch {
      showNotification('error', 'Failed to copy Tracking Pixel URL to clipboard.', 'Copy Failed');
    }
  };

  const handleSelectTrackingFilter = (f: 'ALL' | 'OPENED' | 'CLICKED' | 'DELIVERED' | 'BOUNCED') => {
    setTrackingFilter(f);
    const count = history.filter((item) => {
      if (f === 'ALL') return true;
      if (f === 'CLICKED') return Boolean(item.clicked || (item.clickCount || 0) > 0);
      if (f === 'OPENED') return Boolean(item.opened || (item.openCount || 0) > 0);
      if (f === 'BOUNCED') return !item.success || item.mailSuiteStatus === 'BOUNCED';
      if (f === 'DELIVERED') return item.success;
      return true;
    }).length;
    showNotification('info', `Filtered table to ${f} status (${count} email(s) found).`, 'Filter Applied');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    showNotification('info', 'Search query filter cleared. Displaying all matching status records.', 'Search Cleared');
  };

  const handleToggleUserSelection = (id: string) => {
    const isSelected = selectedUserIds.includes(id);
    const targetUser = failedAdUsers.find((u) => u.id === id);
    setSelectedUserIds((prev) =>
      isSelected ? prev.filter((item) => item !== id) : [...prev, id]
    );
    showNotification(
      'success',
      isSelected
        ? `Deselected "${targetUser?.recipientName || id}" from campaign queue.`
        : `Successfully selected "${targetUser?.recipientName || id}" for automated campaign queue.`,
      isSelected ? 'Account Deselected' : 'Account Selected'
    );
  };

  const handleToggleRule = async (key: keyof typeof automationRules) => {
    const nextVal = !automationRules[key];
    const updated = { ...automationRules, [key]: nextVal };
    setAutomationRules(updated);
    try {
      const res = await fetch('/api/v1/admin/marketing-suite/automation-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data?.success) {
        showNotification(
          'success',
          `Successfully updated automation rule: ${String(key)} is now ${nextVal ? 'ENABLED' : 'DISABLED'}.`,
          'Rule Updated'
        );
      } else {
        showNotification('error', data?.message || `Failed to update rule: ${String(key)}`, 'Rule Update Failed');
      }
    } catch (err: any) {
      showNotification('error', err?.message || `Network error while updating rule ${String(key)}.`, 'Rule Update Failed');
    }
  };

  const handleTriggerCampaign = async (isDemoOnAdmin: boolean, overrideUserIds?: string[], overrideTemplateId?: string) => {
    const targetIds = overrideUserIds && overrideUserIds.length > 0 ? overrideUserIds : selectedUserIds;
    if (targetIds.length === 0) {
      showNotice('error', 'Please select at least one account with a failed ad launch.');
      return;
    }

    if (isDemoOnAdmin) {
      setIsTriggeringDemo(true);
    } else {
      setIsTriggeringLive(true);
    }

    try {
      const res = await fetch('/api/v1/admin/marketing-suite/trigger-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          userIds: targetIds,
          templateId: overrideTemplateId || selectedTemplateId,
          isDemoOnAdmin,
          demoAdminEmail,
          sendAdminCopy,
          adminCopyEmail: demoAdminEmail
        })
      });
      const data = await res.json();
      if (data?.success) {
        showNotice('success', data.message || 'Campaign triggered with MailSuite pixel & webhook tracking!');
        if (Array.isArray(data.failedAdUsers)) setFailedAdUsers(data.failedAdUsers);
        if (Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
        if (data.summary) setSummary(data.summary);
        if (Array.isArray(data.history)) setHistory(data.history);
        if (Array.isArray(data.webhookLogs)) setWebhookLogs(data.webhookLogs);
      } else {
        showNotice('error', data?.message || 'Failed to trigger campaign.');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Network error while triggering campaign.');
    } finally {
      setIsTriggeringDemo(false);
      setIsTriggeringLive(false);
    }
  };

  const handleSendZacBalanceFundAndAdminRight = async () => {
    setIsTriggeringLive(true);
    try {
      const res = await fetch('/api/v1/admin/send-zac-balance-fund-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: 'zac@otec.ltd',
          adminEmails: [demoAdminEmail || 'yr943334@gmail.com', 'sankalprajput15@gmail.com']
        })
      });
      const data = await res.json();
      if (data?.success) {
        showNotice(
          'success',
          data.message ||
            '✅ Sent Balance Fund ($590.00 USD) invoice to Zac (zac@otec.ltd).'
        );
        if (Array.isArray(data.failedAdUsers)) setFailedAdUsers(data.failedAdUsers);
        if (data.summary) setSummary(data.summary);
        if (Array.isArray(data.history)) setHistory(data.history);
        if (Array.isArray(data.webhookLogs)) setWebhookLogs(data.webhookLogs);
        await fetchSuiteState();
      } else {
        showNotice('error', data?.message || 'Failed to dispatch Balance Fund & Admin Confirmation emails.');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Network error while dispatching Balance Fund emails.');
    } finally {
      setIsTriggeringLive(false);
    }
  };

  const handleFireSmtpWebhook = async (
    eventType: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'DEFERRED',
    target: { trackingId?: string; emailId?: string; recipientEmail?: string; source?: 'SMTP_WEBHOOK' | 'PIXEL_TRACKER' | 'CLICK_REDIRECT' }
  ) => {
    const key = `${eventType}-${target.trackingId || target.emailId || target.recipientEmail}`;
    setIsFiringWebhook(key);
    try {
      const res = await fetch('/api/v1/webhooks/smtp-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          eventType,
          trackingId: target.trackingId,
          emailId: target.emailId,
          recipientEmail: target.recipientEmail,
          source:
            target.source ||
            (eventType === 'OPENED'
              ? 'PIXEL_TRACKER'
              : eventType === 'CLICKED'
              ? 'CLICK_REDIRECT'
              : 'SMTP_WEBHOOK')
        })
      });
      const data = await res.json();
      if (data?.success) {
        showNotice('success', data.message || `SMTP Webhook [${eventType}] logged!`);
        await fetchSuiteState();
      } else {
        showNotice('error', data?.message || 'Failed to fire webhook event.');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Error firing SMTP webhook.');
    } finally {
      setIsFiringWebhook(null);
    }
  };

  const handleExecuteBatchSimulation = async (
    action: 'ALL_DELIVERED' | 'BATCH_OPENS' | 'BATCH_CLICKS' | 'SIMULATE_BOUNCE' | 'RESET_ALL',
    targetTrackingId?: string,
    isSilentTicker?: boolean
  ) => {
    setIsSimulatingBatch(true);
    setActiveSimulationAction(action);
    try {
      const res = await fetch('/api/v1/admin/marketing-suite/simulate-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action, trackingId: targetTrackingId })
      });
      const data = await res.json();
      if (data?.success) {
        if (!isSilentTicker) {
          showNotice('success', data.message || `Simulation [${action}] succeeded!`);
        }
        if (data.summary) setSummary(data.summary);
        if (Array.isArray(data.history)) setHistory(data.history);
        if (Array.isArray(data.webhookLogs)) setWebhookLogs(data.webhookLogs);
        if (Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
        setRecentSimulationLog((prev) => [
          {
            id: `sim-log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            timestamp: new Date().toLocaleTimeString(),
            action,
            message: data.message || `Executed simulation ${action}`,
            badge:
              action === 'SIMULATE_BOUNCE'
                ? 'SMTP_550'
                : action === 'BATCH_OPENS'
                ? 'PIXEL_1X1'
                : action === 'BATCH_CLICKS'
                ? 'CTA_CLICK'
                : action === 'RESET_ALL'
                ? 'RESET_ALL'
                : 'SMTP_250'
          },
          ...prev.slice(0, 5)
        ]);
      } else {
        showNotice('error', data?.message || `Failed to run simulation ${action}`);
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Network error while executing simulation.');
    } finally {
      setIsSimulatingBatch(false);
      setActiveSimulationAction(null);
    }
  };

  useEffect(() => {
    if (!isAutoSimulating) return;
    const interval = setInterval(() => {
      setAutoSimStep((prev) => {
        const next = (prev + 1) % 3;
        if (next === 0) {
          void handleExecuteBatchSimulation('ALL_DELIVERED', undefined, true);
        } else if (next === 1) {
          void handleExecuteBatchSimulation('BATCH_OPENS', undefined, true);
        } else {
          void handleExecuteBatchSimulation('BATCH_CLICKS', undefined, true);
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoSimulating]);

  const selectedTemplateObj =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const searchedAndFilteredHistory = history.filter((item) => {
    if (trackingFilter === 'CLICKED' && !(item.clicked || (item.clickCount || 0) > 0)) return false;
    if (trackingFilter === 'OPENED' && !(item.opened || (item.openCount || 0) > 0)) return false;
    if (trackingFilter === 'BOUNCED' && (item.success && item.mailSuiteStatus !== 'BOUNCED')) return false;
    if (trackingFilter === 'DELIVERED' && !item.success) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (item.recipientName || '').toLowerCase().includes(q);
      const matchEmail = (item.recipient || '').toLowerCase().includes(q);
      const matchCompany = (item.companyName || '').toLowerCase().includes(q);
      const matchSubject = (item.subject || '').toLowerCase().includes(q);
      const matchTracking = (item.trackingId || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCompany && !matchSubject && !matchTracking) {
        return false;
      }
    }
    return true;
  });

  const filteredHistory = searchedAndFilteredHistory;

  const bouncedCount = history.filter((e) => !e.success || e.mailSuiteStatus === 'BOUNCED').length;
  const bounceRatePercent = history.length > 0 ? Math.round((bouncedCount / history.length) * 1000) / 10 : 0;

  const deliveryRatePercent =
    summary.totalSent > 0
      ? Math.round((summary.totalDelivered / summary.totalSent) * 1000) / 10
      : 100;

  const clampedDeliveryWidth = Math.max(0, Math.min(100, deliveryRatePercent));
  const clampedOpenRateWidth = Math.max(0, Math.min(100, summary.openRatePercent));
  const clampedClickRateWidth = Math.max(0, Math.min(100, summary.clickThroughRatePercent));
  const clampedCtorWidth = Math.max(0, Math.min(100, summary.clickToOpenRatePercent));

  const failedAdResolvedCount = failedAdUsers.filter(
    (u) => u.accountStatus === 'FOLLOWUP_SENT' || u.accountStatus === 'RESOLVED' || u.followUpCount > 0
  ).length;
  const failedAdCoveragePercent =
    failedAdUsers.length > 0
      ? Math.round((failedAdResolvedCount / failedAdUsers.length) * 100)
      : 100;

  return (
    <div id="automated-email-marketing-suite" className="space-y-6">
      {/* GLOBAL FLOATING ACTION NOTIFICATIONS STACK (FIXED TO TOP-RIGHT OF VIEWPORT) */}
      <div
        id="admin-action-toasts-container"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
        aria-live="polite"
      >
        {toastNotifications.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border transition-all duration-300 transform translate-y-0 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/80 text-white shadow-emerald-950/60'
                : toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/80 text-white shadow-rose-950/60'
                : 'bg-slate-900/95 border-slate-700 text-white shadow-slate-950/60'
            }`}
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                {toast.type === 'success' ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                ) : toast.type === 'error' ? (
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                )}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        toast.type === 'success'
                          ? 'text-emerald-300'
                          : toast.type === 'error'
                          ? 'text-rose-300'
                          : 'text-blue-300'
                      }`}
                    >
                      {toast.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {toast.timestamp}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-100 leading-snug break-words">
                    {toast.message}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setToastNotifications((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Animated Bottom Indicator */}
            <div className="mt-2.5 w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full rounded-full animate-pulse ${
                  toast.type === 'success'
                    ? 'bg-emerald-400'
                    : toast.type === 'error'
                    ? 'bg-rose-400'
                    : 'bg-blue-400'
                }`}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* TOP KPI SUMMARY CARDS & VISUAL CAMPAIGN PERFORMANCE PROGRESS BAR */}
      <div
        id="admin-email-suite-overview-header"
        className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Automated Email Marketing Suite &amp; MailSuite Performance Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Failed Ad Launch Follow-Up Automation, Diwali Offers &amp; Real-Time Pixel / SMTP Webhook Tracking
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Instant campaign performance overview across all automated follow-ups (including{' '}
              <strong className="text-amber-300">Zachary Aldin • IMPORTATION FADE-TECH — $400 Paid Basic Plan / $590 Diwali Balance</strong>
              ), pre-built Diwali &amp; VIP upsell templates, and real-time open/click telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleManualRefreshLedger()}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Sync Tracking Telemetry</span>
            </button>
            {onSwitchToCustomDispatcher && (
              <button
                type="button"
                onClick={onSwitchToCustomDispatcher}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Custom Composer</span>
              </button>
            )}
          </div>
        </div>

        {/* PRIMARY KPI SUMMARY CARDS (TOTAL SENT, AVERAGE OPEN RATE, AVERAGE CLICK RATE) */}
        <div
          id="admin-email-suite-kpi-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
        >
          {/* KPI CARD 1: TOTAL SENT */}
          <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Total Sent</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {summary.totalSent}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black">
                    {deliveryRatePercent}% Delivered
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-300">
                  {summary.totalDelivered} Delivered • {bouncedCount} Bounced
                </span>
                <span className="text-amber-300">{campaigns.length} Campaigns</span>
              </div>
              <svg
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="w-full h-2 rounded-full overflow-hidden bg-slate-950"
                role="img"
                aria-label={`Delivery rate ${deliveryRatePercent}%`}
              >
                <rect x="0" y="0" width="100" height="6" fill="#0f172a" />
                <rect
                  x="0"
                  y="0"
                  width={clampedDeliveryWidth}
                  height="6"
                  rx="3"
                  fill="#f59e0b"
                />
              </svg>
            </div>
          </div>

          {/* KPI CARD 2: AVERAGE OPEN RATE */}
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>Average Open Rate</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
                    {summary.openRatePercent}%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-black">
                    {summary.totalOpened}/{summary.totalDelivered || summary.totalSent} Opened
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-200/90">
                  {summary.totalOpened} Unique • {summary.totalOpensCount} Total Pixel Opens
                </span>
                <span className="text-emerald-300">✓✓ Pixel Active</span>
              </div>
              <svg
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="w-full h-2 rounded-full overflow-hidden bg-slate-950"
                role="img"
                aria-label={`Average open rate ${summary.openRatePercent}%`}
              >
                <rect x="0" y="0" width="100" height="6" fill="#064e3b" />
                <rect
                  x="0"
                  y="0"
                  width={clampedOpenRateWidth}
                  height="6"
                  rx="3"
                  fill="#10b981"
                />
              </svg>
            </div>
          </div>

          {/* KPI CARD 3: AVERAGE CLICK RATE */}
          <div className="bg-blue-950/50 border border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <MousePointerClick className="w-4 h-4 text-blue-400" />
                  <span>Average Click Rate</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-blue-300 tracking-tight">
                    {summary.clickThroughRatePercent}%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-black">
                    {summary.clickToOpenRatePercent}% CTOR
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-blue-200/90">
                  {summary.totalClicked} Unique Clicks • {summary.totalClicksCount} Total Clicks
                </span>
                <span className="text-blue-300">CTA Redirects</span>
              </div>
              <svg
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="w-full h-2 rounded-full overflow-hidden bg-slate-950"
                role="img"
                aria-label={`Average click rate ${summary.clickThroughRatePercent}%`}
              >
                <rect x="0" y="0" width="100" height="6" fill="#172554" />
                <rect
                  x="0"
                  y="0"
                  width={clampedClickRateWidth}
                  height="6"
                  rx="3"
                  fill="#3b82f6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* VISUAL CAMPAIGN PERFORMANCE PROGRESS BAR & MULTI-STAGE FUNNEL */}
        <div
          id="admin-email-suite-campaign-progress-bar"
          className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                Campaign Performance &amp; Conversion Funnel Progress
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase">
                Live MailSuite Telemetry
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-300">
              <span>
                Failed Ad Queue Coverage:{' '}
                <strong className="text-amber-300">
                  {failedAdResolvedCount}/{failedAdUsers.length} ({failedAdCoveragePercent}%)
                </strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                SMTP Webhooks Logged: <strong className="text-indigo-300">{webhookLogs.length}</strong>
              </span>
            </div>
          </div>

          {/* COMPOSITE MULTI-STAGE VISUAL PROGRESS BAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Sent ({summary.totalSent})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
                <span>Delivered ({deliveryRatePercent}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Opened ✓✓ ({summary.openRatePercent}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                <span>Clicked CTA ({summary.clickThroughRatePercent}%)</span>
              </span>
            </div>

            <svg
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              className="w-full h-3.5 rounded-full overflow-hidden bg-slate-950 border border-slate-700"
              role="img"
              aria-label="Composite campaign funnel progress bar"
            >
              {/* Background Track */}
              <rect x="0" y="0" width="100" height="10" fill="#090d16" />
              {/* Delivered Bar */}
              <rect
                x="0"
                y="0"
                width={clampedDeliveryWidth}
                height="10"
                fill="#f59e0b"
                opacity="0.35"
              />
              {/* Open Rate Bar */}
              <rect
                x="0"
                y="0"
                width={clampedOpenRateWidth}
                height="10"
                fill="#10b981"
                opacity="0.75"
              />
              {/* Click Rate Bar */}
              <rect
                x="0"
                y="0"
                width={clampedClickRateWidth}
                height="10"
                rx="4"
                fill="#3b82f6"
              />
            </svg>
          </div>

          {/* 4-STAGE GRANULAR PROGRESS BREAKDOWN */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>1. Delivery Rate</span>
                <span className="text-amber-300">{deliveryRatePercent}%</span>
              </div>
              <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-1.5 rounded-full overflow-hidden">
                <rect x="0" y="0" width="100" height="5" fill="#1e293b" />
                <rect x="0" y="0" width={clampedDeliveryWidth} height="5" rx="2.5" fill="#f59e0b" />
              </svg>
              <div className="text-[11px] font-bold text-slate-300">
                {summary.totalDelivered} of {summary.totalSent} emails delivered
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>2. Avg Open Rate</span>
                <span className="text-emerald-300">{summary.openRatePercent}%</span>
              </div>
              <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-1.5 rounded-full overflow-hidden">
                <rect x="0" y="0" width="100" height="5" fill="#1e293b" />
                <rect x="0" y="0" width={clampedOpenRateWidth} height="5" rx="2.5" fill="#10b981" />
              </svg>
              <div className="text-[11px] font-bold text-slate-300">
                {summary.totalOpened} unique opens ({summary.totalOpensCount} total)
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>3. Avg Click Rate</span>
                <span className="text-blue-300">{summary.clickThroughRatePercent}%</span>
              </div>
              <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-1.5 rounded-full overflow-hidden">
                <rect x="0" y="0" width="100" height="5" fill="#1e293b" />
                <rect x="0" y="0" width={clampedClickRateWidth} height="5" rx="2.5" fill="#3b82f6" />
              </svg>
              <div className="text-[11px] font-bold text-slate-300">
                {summary.totalClicked} recipients clicked offer CTA
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>4. Click-To-Open (CTOR)</span>
                <span className="text-indigo-300">{summary.clickToOpenRatePercent}%</span>
              </div>
              <svg viewBox="0 0 100 5" preserveAspectRatio="none" className="w-full h-1.5 rounded-full overflow-hidden">
                <rect x="0" y="0" width="100" height="5" fill="#1e293b" />
                <rect x="0" y="0" width={clampedCtorWidth} height="5" rx="2.5" fill="#818cf8" />
              </svg>
              <div className="text-[11px] font-bold text-slate-300">
                {failedAdUsers.length} failed ad accounts ($6,610 balance)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS NOTICE BANNER */}
      {statusBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs font-black underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* NAVIGATION SUB-TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('FAILED_ADS_QUEUE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'FAILED_ADS_QUEUE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>1. Failed Ad Launches &amp; Campaign Trigger ({failedAdUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PREBUILT_TEMPLATES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'PREBUILT_TEMPLATES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>2. Pre-Built Diwali &amp; Upsell Templates ({templates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('TRACKING_SERVICE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'TRACKING_SERVICE'
              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span>3. Email Tracking Activity ({history.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('WEBHOOK_LOGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'WEBHOOK_LOGS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>4. SMTP Webhook &amp; Pixel Event Logs ({webhookLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: FAILED AD LAUNCHES & AUTOMATED FOLLOW-UP CAMPAIGN TRIGGER */}
      {activeSubTab === 'FAILED_ADS_QUEUE' && (
        <div className="space-y-6">
          {/* AUTOMATION RULES ENGINE BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Automated Trigger Rules Engine</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Configure how the suite responds when a supplier&rsquo;s Sponsored Ad Campaign fails billing or tier verification.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleToggleRule('autoTriggerOnFailedAdLaunch')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all ${
                    automationRules.autoTriggerOnFailedAdLaunch
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      automationRules.autoTriggerOnFailedAdLaunch ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span>Auto-Follow-Up on Failed Ad Launch</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleToggleRule('autoAttachDiwaliPromo')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all ${
                    automationRules.autoAttachDiwaliPromo
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      automationRules.autoAttachDiwaliPromo ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  />
                  <span>Auto-Include Diwali 10% Offer (DIWALI10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleToggleRule('pixelTrackingEnabled')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all ${
                    automationRules.pixelTrackingEnabled
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      automationRules.pixelTrackingEnabled ? 'bg-blue-500' : 'bg-slate-400'
                    }`}
                  />
                  <span>1x1 Pixel &amp; SMTP Webhook Tracking</span>
                </button>
              </div>
            </div>
          </div>

          {/* CAMPAIGN LAUNCH CONTROLLER */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 border border-amber-500/30 shadow-md space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  Selected Campaign Template &amp; Dispatch Controls ({selectedUserIds.length} Account{selectedUserIds.length === 1 ? '' : 's'} Selected)
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {selectedTemplateObj?.name || '⚠️ Failed Ad Launch + Full Plan Balance + 🪔 Diwali Max Benefit'}
                </h3>
                <p className="text-xs text-slate-300">
                  {selectedTemplateObj?.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isTriggeringLive}
                  onClick={() => void handleSendZacBalanceFundAndAdminRight()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-slate-950 text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isTriggeringLive
                      ? 'Dispatching Balance Fund Invoice...'
                      : '💳 Send Balance Fund ($590) Invoice to Zac (zac@otec.ltd)'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isTriggeringDemo || selectedUserIds.length === 0}
                  onClick={() => void handleTriggerCampaign(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {isTriggeringDemo
                      ? 'Sending Admin Demo...'
                      : `Step 1: Send Demo Mail to Admin (${demoAdminEmail})`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isTriggeringLive || selectedUserIds.length === 0}
                  onClick={() => void handleTriggerCampaign(false)}
                  className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isTriggeringLive
                      ? 'Dispatching Live Campaign...'
                      : `Step 2: Trigger Live Follow-Up Campaign (${selectedUserIds.length})`}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Active Follow-Up Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedTemplateId(newId);
                    const chosen = templates.find((t) => t.id === newId);
                    showNotification('info', `Active template changed to: ${chosen?.name || newId}`, 'Template Selected');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Admin Demo / Copy Recipient Email
                </label>
                <input
                  type="email"
                  value={demoAdminEmail}
                  onChange={(e) => setDemoAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  placeholder="sankalprajput15@gmail.com"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={sendAdminCopy}
                    onChange={(e) => {
                      const nextChecked = e.target.checked;
                      setSendAdminCopy(nextChecked);
                      showNotification(
                        'info',
                        nextChecked
                          ? `Admin copy enabled with 1x1 tracking pixel (${demoAdminEmail}).`
                          : 'Admin copy disabled.',
                        'Preference Updated'
                      );
                    }}
                    className="rounded border-slate-600"
                  />
                  <span>Send Admin Copy + Inject 1x1 Pixel &amp; Click Tracking</span>
                </label>
              </div>
            </div>
          </div>

          {/* USERS WITH FAILED AD LAUNCHES QUEUE */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-600" />
                  <span>Accounts With Failed / Halted Ad Campaign Launches</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select one or more accounts below to trigger automated follow-up campaigns with Diwali 10% OFF &amp; Full Plan upsell links.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserIds(failedAdUsers.map((u) => u.id));
                    showNotification(
                      'success',
                      `Selected all ${failedAdUsers.length} failed ad accounts for campaign trigger.`,
                      'Accounts Selected'
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Select All ({failedAdUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserIds(['fad-zac-otec-001']);
                    showNotification(
                      'success',
                      'Selected Zachary Aldin • IMPORTATION FADE-TECH ($400 Paid / $590 Balance).',
                      'Account Selected'
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black cursor-pointer"
                >
                  Select Zac Only ($400 Paid)
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {failedAdUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const isZac = user.email.toLowerCase() === 'zac@otec.ltd';
                return (
                  <div
                    key={user.id}
                    className={`p-4 sm:p-5 transition-all ${
                      isSelected
                        ? 'bg-amber-50/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleUserSelection(user.id)}
                          className="mt-1.5 w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900">
                              {user.companyName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                              {user.invoiceRef}
                            </span>
                            {isZac && (
                              <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase">
                                Primary Target • $400 Paid Basic Plan
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                user.accountStatus === 'PAUSE_WARNING_48H'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : user.accountStatus === 'FOLLOWUP_SENT'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {user.accountStatus === 'PAUSE_WARNING_48H'
                                ? '⚠️ 48h Account Pause Warning'
                                : user.accountStatus === 'FOLLOWUP_SENT'
                                ? '✓ Follow-Up Sent'
                                : 'Ad Launch Halted'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                              <strong>Decision Maker:</strong> {user.decisionMakerName}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-blue-600 font-bold">{user.email}</span>
                            <span>•</span>
                            <span>{user.phone}</span>
                            <span>•</span>
                            <span>{user.address}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 space-y-1">
                            <div className="font-black flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>
                                Failed Ad Launch ({user.failedCampaignId}): {user.failedCampaignName}
                              </span>
                            </div>
                            <div className="text-[11px] text-rose-800 font-semibold">
                              {user.failureReason}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Amount Paid</div>
                              <div className="text-xs font-black text-emerald-700">${user.amountPaidUsd.toLocaleString()} USD</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Standard Plan</div>
                              <div className="text-xs font-bold text-slate-600 line-through">${user.standardPlanUsd.toLocaleString()} USD</div>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                              <div className="text-[10px] font-bold text-amber-800 uppercase">🪔 Diwali 10% Offer</div>
                              <div className="text-xs font-black text-amber-900">${user.diwaliOfferPlanUsd.toLocaleString()} USD</div>
                            </div>
                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                              <div className="text-[10px] font-bold text-rose-800 uppercase">Net Balance Due</div>
                              <div className="text-xs font-black text-rose-700">${user.remainingBalanceUsd.toLocaleString()} USD</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isTriggeringDemo}
                          onClick={() => void handleTriggerCampaign(true, [user.id], user.recommendedTemplateId)}
                          className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black flex items-center justify-center gap-1.5 border border-amber-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Demo Mail to Admin</span>
                        </button>

                        <button
                          type="button"
                          disabled={isTriggeringLive}
                          onClick={() => void handleTriggerCampaign(false, [user.id], user.recommendedTemplateId)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Follow-Up to {user.recipientName.split(' ')[0]}</span>
                        </button>

                        {onOpenPaymentCheckout && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenPaymentCheckout({
                                planId: 'basic-business-plan',
                                title: `Full Plan Settlement (${user.companyName})`,
                                planName: `Full Plan Settlement (${user.companyName})`,
                                description: `Full Plan Settlement ($${user.remainingBalanceUsd} USD balance with Diwali Offer DIWALI10 after $${user.amountPaidUsd} credit) for ${user.companyName}`,
                                amountUsd: Number(user.remainingBalanceUsd) || 590,
                                amount: Number(user.remainingBalanceUsd) || 590,
                                type: 'SUBSCRIPTION',
                                billingCycle: 'annual',
                                supplierCompany: user.companyName,
                                companyName: user.companyName,
                                clientEmail: user.email,
                                customerEmail: user.email,
                                billingName: user.companyName,
                                decisionMakerName: user.decisionMakerName,
                                customerName: user.decisionMakerName,
                                address: user.address
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer"
                          >
                            <span>Preview ${user.remainingBalanceUsd} Checkout</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRE-BUILT TEMPLATES (DIWALI OFFERS, FAILED AD RECOVERY & SUBSCRIPTION UPSELL) */}
      {activeSubTab === 'PREBUILT_TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {templates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId;
            return (
              <div
                key={tpl.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                      {tpl.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-black">
                      Promo: {tpl.promoCode} ({tpl.discountPercent}% OFF)
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">{tpl.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{tpl.description}</p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Subject Line Template
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-800 break-words">
                      {tpl.subjectTemplate}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Included Campaign Deliverables &amp; Upsell Triggers:
                    </div>
                    <ul className="space-y-1">
                      {tpl.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setActiveSubTab('FAILED_ADS_QUEUE');
                      showNotification(
                        'success',
                        `Selected template "${tpl.name}" for campaign follow-ups.`,
                        'Template Selected'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer"
                  >
                    Use Template in Campaign Queue →
                  </button>

                  <button
                    type="button"
                    disabled={isTriggeringDemo}
                    onClick={() => void handleTriggerCampaign(true, ['fad-zac-otec-001'], tpl.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black border border-amber-300 cursor-pointer"
                  >
                    Send Admin Demo (Zac)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: EMAIL TRACKING ACTIVITY & MOCK TRACKING SERVICE SIMULATION */}
      {activeSubTab === 'TRACKING_SERVICE' && (
        <div className="space-y-6">
          {/* HEADER & METRIC SUMMARY CARDS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center justify-center">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Email Tracking Activity
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">
                  Comprehensive activity ledger across all sent system, campaign, and trade desk emails. Tracks real-time 1x1 read-receipt pixels, link click redirects, and SMTP delivery states with interactive simulation controls.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleManualRefreshLedger()}
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Ledger</span>
                </button>
              </div>
            </div>

            {/* 5-METRIC TELEMETRY COUNTER TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Sent</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{history.length}</div>
                <div className="text-[11px] font-bold text-slate-500">100% Dispatched</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-teal-700">Delivered</div>
                <div className="text-xl sm:text-2xl font-black text-teal-900">{summary.totalDelivered}</div>
                <div className="text-[11px] font-bold text-teal-700">{deliveryRatePercent}% Delivery Rate</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Opened (Read)</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-900">{summary.totalOpened}</div>
                <div className="text-[11px] font-bold text-emerald-700">{summary.openRatePercent}% Open Rate ({summary.totalOpensCount}x total)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">Clicked (CTA)</div>
                <div className="text-xl sm:text-2xl font-black text-blue-900">{summary.totalClicked}</div>
                <div className="text-[11px] font-bold text-blue-700">{summary.clickThroughRatePercent}% CTR ({summary.totalClicksCount}x clicks)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Bounced / Rejected</div>
                <div className="text-xl sm:text-2xl font-black text-rose-900">{bouncedCount}</div>
                <div className="text-[11px] font-bold text-rose-700">{bounceRatePercent}% Bounce Rate</div>
              </div>
            </div>
          </div>

          {/* MOCK TRACKING SERVICE SIMULATION CONSOLE */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-black tracking-tight text-white">
                    Mock Tracking Service Simulation Console
                  </span>
                  {isAutoSimulating ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Auto-Runner Active (Step {autoSimStep + 1}/3)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Standby (Ready)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Simulate tracking events across sent emails to test read-receipts, CTA conversions, and delivery reports without waiting for real recipient interactions.
                </p>
              </div>

              {/* AUTO-RUN TOGGLE */}
              <button
                type="button"
                onClick={handleToggleAutoSimulating}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                  isAutoSimulating
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Auto-Runner</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>▶ Auto-Run Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* SIMULATION QUICK ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                disabled={isSimulatingBatch}
                onClick={() => void handleExecuteBatchSimulation('ALL_DELIVERED')}
                className={`px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeSimulationAction === 'ALL_DELIVERED'
                    ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-teal-500/30'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span>Simulate All Delivered (250 OK)</span>
              </button>

              <button
                type="button"
                disabled={isSimulatingBatch}
                onClick={() => void handleExecuteBatchSimulation('BATCH_OPENS')}
                className={`px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeSimulationAction === 'BATCH_OPENS'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Batch Opens (75% Reads)</span>
              </button>

              <button
                type="button"
                disabled={isSimulatingBatch}
                onClick={() => void handleExecuteBatchSimulation('BATCH_CLICKS')}
                className={`px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeSimulationAction === 'BATCH_CLICKS'
                    ? 'bg-blue-500 text-slate-950 border-blue-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-blue-500/30'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulate Batch Clicks (40% CTR)</span>
              </button>

              <button
                type="button"
                disabled={isSimulatingBatch}
                onClick={() => void handleExecuteBatchSimulation('SIMULATE_BOUNCE')}
                className={`px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeSimulationAction === 'SIMULATE_BOUNCE'
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-rose-500/30'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Bounce (SMTP 550)</span>
              </button>

              <button
                type="button"
                disabled={isSimulatingBatch}
                onClick={() => void handleExecuteBatchSimulation('RESET_ALL')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>
            </div>

            {/* LIVE SIMULATION TICKER FEED */}
            <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/80 space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Recent Simulation Activity Ticker</span>
                <span className="text-slate-600 font-mono">Live Ingestion Active</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[11px]">
                {recentSimulationLog.map((log) => (
                  <div key={log.id} className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0 ${
                        log.badge === 'PIXEL_1X1'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.badge === 'CTA_CLICK'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : log.badge === 'SMTP_550'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {log.badge}
                    </span>
                    <span className="truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS TOOLBAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectTrackingFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  trackingFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All ({history.length})
              </button>

              <button
                type="button"
                onClick={() => handleSelectTrackingFilter('DELIVERED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  trackingFilter === 'DELIVERED'
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                }`}
              >
                ✓ Delivered ({summary.totalDelivered})
              </button>

              <button
                type="button"
                onClick={() => handleSelectTrackingFilter('OPENED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  trackingFilter === 'OPENED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                ✓✓ Opened ({summary.totalOpened})
              </button>

              <button
                type="button"
                onClick={() => handleSelectTrackingFilter('CLICKED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  trackingFilter === 'CLICKED'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                🔗 Clicked ({summary.totalClicked})
              </button>

              <button
                type="button"
                onClick={() => handleSelectTrackingFilter('BOUNCED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  trackingFilter === 'BOUNCED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                ⚠️ Bounced ({bouncedCount})
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative min-w-[260px] max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient, company, subject, ID..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* EMAIL TRACKING ACTIVITY TABLE */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-black text-slate-900">
                  Email Tracking Activity List ({searchedAndFilteredHistory.length} of {history.length})
                </h4>
              </div>
              <div className="text-xs text-slate-500">
                Sorted by most recent dispatch • Showing real-time delivery status &amp; read-receipt timestamps
              </div>
            </div>

            {searchedAndFilteredHistory.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-700">No emails match the selected filter.</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing the search query or selecting a different status filter chip.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 sm:px-5">Recipient &amp; Company</th>
                      <th className="py-3 px-4">Subject &amp; Tracking ID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timestamps</th>
                      <th className="py-3 px-4 sm:px-5 text-right">Mock Simulation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {searchedAndFilteredHistory.map((item) => {
                      const trkId = item.trackingId || `ms-trk-${item.id}`;
                      const isBounced = !item.success || item.mailSuiteStatus === 'BOUNCED';
                      const isClicked = Boolean(item.clicked || (item.clickCount || 0) > 0);
                      const isOpened = Boolean(item.opened || (item.openCount || 0) > 0);
                      const isDelivered = item.success && !isBounced;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group text-xs align-top"
                        >
                          {/* RECIPIENT & COMPANY */}
                          <td className="py-4 px-4 sm:px-5 space-y-1 min-w-[210px]">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                                {(item.recipientName || item.recipient || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-slate-900 truncate">
                                  {item.recipientName || 'Trade Partner'}
                                </div>
                                <div className="font-mono text-[11px] text-blue-600 font-bold truncate">
                                  {item.recipient}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                <span>{item.companyName}</span>
                              </span>
                              {item.dispatchType === 'AUTOMATED' ? (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase">
                                  Automated
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-black uppercase">
                                  Manual / Admin
                                </span>
                              )}
                            </div>
                          </td>

                          {/* SUBJECT & TRACKING ID */}
                          <td className="py-4 px-4 space-y-1.5 min-w-[240px] max-w-sm">
                            <div className="font-bold text-slate-900 leading-snug line-clamp-2" title={item.subject}>
                              {item.subject}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black uppercase">
                                {item.category || 'CAMPAIGN'}
                              </span>
                              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                <span className="truncate max-w-[140px]">{trkId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTrackingId(trkId)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  title="Copy Tracking ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {copiedTrackingId === trkId && (
                                  <span className="text-[9px] text-emerald-600 font-bold">Copied!</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* STATUS (DELIVERED, BOUNCED, OPENED, CLICKED) */}
                          <td className="py-4 px-4 space-y-1 min-w-[170px]">
                            {isClicked ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 font-black text-[11px] shadow-2xs">
                                  <MousePointerClick className="w-3.5 h-3.5 text-blue-700" />
                                  <span>Clicked ({item.clickCount || 1}x)</span>
                                </span>
                                <div className="text-[10px] font-bold text-blue-700 mt-1">
                                  CTA redirect confirmed
                                </div>
                              </div>
                            ) : isOpened ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[11px] shadow-2xs">
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Opened ({item.openCount || 1}x)</span>
                                </span>
                                <div className="text-[10px] font-bold text-emerald-700 mt-1">
                                  1x1 Pixel Read-Receipt
                                </div>
                              </div>
                            ) : isBounced ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 font-black text-[11px] shadow-2xs">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                                  <span>Bounced</span>
                                </span>
                                <div className="text-[10px] font-medium text-rose-700 mt-1 truncate max-w-[160px]" title={item.error || 'SMTP 550 Mailbox Unavailable'}>
                                  {item.error || 'SMTP 550 Mailbox Unavailable'}
                                </div>
                              </div>
                            ) : isDelivered ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-300 font-black text-[11px]">
                                  <Check className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Delivered</span>
                                </span>
                                <div className="text-[10px] font-bold text-slate-500 mt-1">
                                  SMTP 250 OK (Unopened)
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px]">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Queued</span>
                                </span>
                              </div>
                            )}
                          </td>

                          {/* TIMESTAMPS */}
                          <td className="py-4 px-4 space-y-1 min-w-[210px] font-mono text-[11px]">
                            <div className="text-slate-700 flex items-center justify-between gap-2">
                              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Sent:</span>
                              <span className="font-bold">{new Date(item.dispatchedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="text-teal-800 flex items-center justify-between gap-2">
                              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Delivered:</span>
                              <span>{item.success ? new Date(item.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Opened:</span>
                              {item.opened && item.lastOpenedAt ? (
                                <span className="text-emerald-700 font-bold">
                                  {new Date(item.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              ) : (
                                <span className="text-slate-400">Unopened</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Clicked:</span>
                              {item.clicked && item.lastClickedAt ? (
                                <span className="text-blue-700 font-bold">
                                  {new Date(item.lastClickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </div>
                          </td>

                          {/* MOCK TRACKING SIMULATION ACTIONS */}
                          <td className="py-4 px-4 sm:px-5 text-right space-y-1.5 min-w-[190px]">
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              {/* Mock Open Button */}
                              <button
                                type="button"
                                disabled={isFiringWebhook !== null || isSimulatingBatch}
                                onClick={() =>
                                  void handleFireSmtpWebhook('OPENED', {
                                    trackingId: trkId,
                                    emailId: item.id,
                                    recipientEmail: item.recipient,
                                    source: 'PIXEL_TRACKER'
                                  })
                                }
                                className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black cursor-pointer flex items-center gap-1 transition-all"
                                title="Simulate 1x1 Pixel Open Event"
                              >
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>+ Mock Open</span>
                              </button>

                              {/* Mock Click Button */}
                              <button
                                type="button"
                                disabled={isFiringWebhook !== null || isSimulatingBatch}
                                onClick={() =>
                                  void handleFireSmtpWebhook('CLICKED', {
                                    trackingId: trkId,
                                    emailId: item.id,
                                    recipientEmail: item.recipient,
                                    source: 'CLICK_REDIRECT'
                                  })
                                }
                                className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-black cursor-pointer flex items-center gap-1 transition-all"
                                title="Simulate CTA Link Click Redirect"
                              >
                                <MousePointerClick className="w-3 h-3 text-blue-600" />
                                <span>+ Mock Click</span>
                              </button>

                              {/* Mock Delivered Button */}
                              <button
                                type="button"
                                disabled={isFiringWebhook !== null || isSimulatingBatch}
                                onClick={() =>
                                  void handleFireSmtpWebhook('DELIVERED', {
                                    trackingId: trkId,
                                    emailId: item.id,
                                    recipientEmail: item.recipient,
                                    source: 'SMTP_WEBHOOK'
                                  })
                                }
                                className="px-2 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                                title="Simulate SMTP 250 OK Delivered Event"
                              >
                                <Check className="w-3 h-3 text-teal-600" />
                                <span>Delivered</span>
                              </button>

                              {/* Mock Bounce Button */}
                              <button
                                type="button"
                                disabled={isFiringWebhook !== null || isSimulatingBatch}
                                onClick={() =>
                                  void handleFireSmtpWebhook('BOUNCED', {
                                    trackingId: trkId,
                                    emailId: item.id,
                                    recipientEmail: item.recipient,
                                    source: 'SMTP_WEBHOOK'
                                  })
                                }
                                className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                                title="Simulate SMTP 550 Mailbox Unavailable Event"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Bounce</span>
                              </button>
                            </div>

                            {/* Pixel URL Copy link */}
                            {item.trackingPixelUrl && (
                              <button
                                type="button"
                                onClick={() => handleCopyPixelUrl(item.trackingPixelUrl || '', trkId)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 underline font-mono cursor-pointer"
                              >
                                {copiedTrackingId === `pix-${trkId}` ? '✓ Copied Pixel GIF URL!' : 'Copy Pixel GIF'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SMTP WEBHOOK & PIXEL EVENT LOGS */}
      {activeSubTab === 'WEBHOOK_LOGS' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Real-Time SMTP Webhook &amp; 1x1 Pixel Event Stream</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                POST /api/v1/webhooks/smtp-delivery • GET /api/v1/track/open/:trackingId.gif • GET /api/v1/track/click/:trackingId
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void handleFireSmtpWebhook('OPENED', {
                    trackingId: 'ms-trk-zac-demo-admin-2026',
                    recipientEmail: 'zac@otec.ltd',
                    source: 'PIXEL_TRACKER'
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
              >
                Test Pixel Open (Zac)
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleFireSmtpWebhook('CLICKED', {
                    trackingId: 'ms-trk-zac-demo-admin-2026',
                    recipientEmail: 'zac@otec.ltd',
                    source: 'CLICK_REDIRECT'
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black cursor-pointer"
              >
                Test CTA Click (Zac)
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {webhookLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase ${
                        log.eventType === 'OPENED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : log.eventType === 'CLICKED'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : log.eventType === 'DELIVERED'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {log.eventType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {log.source}
                    </span>
                    <span className="font-black text-slate-900">{log.companyName || 'Trade Partner'}</span>
                    <span className="font-mono text-blue-600 font-bold">&lt;{log.recipient}&gt;</span>
                  </div>
                  <div className="text-slate-600 font-medium">{log.subject}</div>
                  {log.smtpResponse && (
                    <div className="text-[11px] font-mono text-slate-500">
                      MTA Response: {log.smtpResponse}
                    </div>
                  )}
                  {log.targetUrl && (
                    <div className="text-[11px] font-mono text-blue-600 truncate max-w-2xl">
                      Clicked URL: {log.targetUrl}
                    </div>
                  )}
                </div>

                <div className="text-right font-mono text-[11px] text-slate-400 shrink-0">
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                  <div>ID: {log.trackingId}</div>
                  {log.ip && <div>IP: {log.ip}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
