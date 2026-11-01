import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Send,
  Zap,
  UserCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  Eye,
  MousePointerClick,
  Check,
  CheckCheck,
  X
} from 'lucide-react';
import type {
  CompanyEmailHistoryEntry,
  EmailDispatchType,
  EmailHistoryCategory,
  MailSuiteAnalyticsSummary
} from '../../services/smtpService';

export interface CompanyEmailHistorySectionProps {
  companyId?: string;
  companyName: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  onClose?: () => void;
  onOpenFullDispatcher?: (prefill: {
    recipientName: string;
    recipientEmail: string;
    companyName: string;
    contactPhone?: string;
  }) => void;
}

const CATEGORY_LABELS: Record<EmailHistoryCategory, { label: string; colorClass: string }> = {
  ONBOARDING: {
    label: 'Onboarding & Credentials',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  BUYER_INQUIRY: {
    label: 'Buyer Inquiry / Tender',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  LOGIN_ALERT: {
    label: 'Security Login Alert',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  OTP_SECURITY: {
    label: 'OTP Verification',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  CAMPAIGN: {
    label: 'Promotional Campaign',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  CUSTOM_ADMIN: {
    label: 'Custom Admin Dispatch',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  SYSTEM_ALERT: {
    label: 'Automated System & KYC',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-300'
  }
};

export const CompanyEmailHistorySection: React.FC<CompanyEmailHistorySectionProps> = ({
  companyId,
  companyName,
  contactName = 'Trade Partner',
  contactEmail,
  contactPhone = '',
  onClose,
  onOpenFullDispatcher
}) => {
  const [entries, setEntries] = useState<CompanyEmailHistoryEntry[]>([]);
  const [mailSuiteStats, setMailSuiteStats] = useState<MailSuiteAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | EmailDispatchType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Quick inline manual dispatch state
  const [showQuickSend, setShowQuickSend] = useState<boolean>(false);
  const [quickSubject, setQuickSubject] = useState<string>(
    `Important Update for ${companyName} — Trade Heaven Global B2B Portal`
  );
  const [quickIntro, setQuickIntro] = useState<string>(
    `We have updated your ${companyName} merchant dashboard with new verified buyer inquiries. Please sign in to review the specifications and submit your quotation.`
  );
  const [quickIncludeCreds, setQuickIncludeCreds] = useState<boolean>(true);
  const [quickSending, setQuickSending] = useState<boolean>(false);
  const [quickNotice, setQuickNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCompanyHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (contactEmail) params.set('email', contactEmail);
      if (companyName) params.set('companyName', companyName);
      if (companyId) params.set('companyId', companyId);

      const res = await fetch(`/api/v1/admin/email-history?${params.toString()}`, {
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      const serverEntries: CompanyEmailHistoryEntry[] = Array.isArray(data?.history) ? data.history : [];
      if (data?.mailSuiteStats) {
        setMailSuiteStats(data.mailSuiteStats);
      }

      // Also merge any localStorage manual dispatches for this email/company that aren't already in serverEntries
      let localEntries: CompanyEmailHistoryEntry[] = [];
      try {
        const rawLocal = localStorage.getItem('th_admin_dispatched_emails_history');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            const cleanTargetEmail = (contactEmail || '').toLowerCase().trim();
            const cleanTargetCompany = (companyName || '').toLowerCase().trim();
            localEntries = parsed
              .filter((item: any) => {
                const iEmail = String(item.recipientEmail || '').toLowerCase().trim();
                const iComp = String(item.companyName || '').toLowerCase().trim();
                return (
                  (cleanTargetEmail && iEmail === cleanTargetEmail) ||
                  (cleanTargetCompany && iComp && iComp.includes(cleanTargetCompany))
                );
              })
              .map((item: any) => ({
                id: String(item.id || `local-${Date.now()}`),
                trackingId: item.trackingId || `ms-trk-${item.id || 'local'}`,
                recipient: String(item.recipientEmail || contactEmail),
                recipientName: String(item.recipientName || contactName),
                companyName: String(item.companyName || companyName),
                companyId,
                subject: String(item.subject || 'Manual Admin Email'),
                dispatchType: 'MANUAL' as const,
                category: 'CUSTOM_ADMIN' as const,
                sender: '"Trade Heaven Global B2B" <noreply@tradeheaven.net>',
                success: Boolean(item.success ?? true),
                messageId: item.messageId,
                dispatchedAt: String(item.dispatchedAt || new Date().toISOString()),
                enforcedDelayMs: 0,
                error: item.error,
                summaryText: `Manual dispatch via Admin Mail Center (${item.templatePreset || 'Custom Template'}).`,
                opened: Boolean(item.opened),
                openCount: Number(item.openCount || 0),
                clicked: Boolean(item.clicked),
                clickCount: Number(item.clickCount || 0)
              }));
          }
        }
      } catch {}

      const seenMsgIds = new Set(
        serverEntries.map((e) => e.messageId || `${e.subject}-${e.dispatchedAt}`)
      );
      const merged = [...serverEntries];
      for (const loc of localEntries) {
        const key = loc.messageId || `${loc.subject}-${loc.dispatchedAt}`;
        if (!seenMsgIds.has(key)) {
          seenMsgIds.add(key);
          merged.push(loc);
        }
      }

      merged.sort((a, b) => new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime());
      setEntries(merged);
    } catch (err) {
      console.error('[CompanyEmailHistorySection] Failed to load email history:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, companyName, contactEmail, contactName]);

  useEffect(() => {
    fetchCompanyHistory();
  }, [fetchCompanyHistory]);

  const handleSimulateMailSuiteEvent = async (
    entry: CompanyEmailHistoryEntry,
    eventType: 'OPEN' | 'CLICK'
  ) => {
    const key = entry.trackingId || entry.id;
    setSimulatingId(`${key}-${eventType}`);
    try {
      const res = await fetch('/api/v1/admin/mailsuite/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          trackingId: entry.trackingId,
          emailId: entry.id,
          recipientEmail: entry.recipient,
          eventType
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuickNotice({
          type: 'success',
          text: data.message
        });
        await fetchCompanyHistory();
      }
    } catch (err: any) {
      setQuickNotice({
        type: 'error',
        text: err?.message || 'Failed to simulate tracking event.'
      });
    } finally {
      setSimulatingId(null);
    }
  };

  const handleQuickSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !quickSubject.trim()) return;
    setQuickSending(true);
    setQuickNotice(null);

    try {
      const response = await fetch('/api/v1/admin/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          recipientEmail: contactEmail,
          recipientName: contactName,
          companyName,
          contactPhone,
          loginEmail: contactEmail,
          portalUrl: 'https://www.tradeheaven.net',
          subject: quickSubject.trim(),
          headline: `Account & Inquiry Update for ${companyName}`,
          subheadline: `Direct Notice from Trade Heaven Administration`,
          introMessage: quickIntro.trim(),
          includeCredentialsBox: quickIncludeCreds,
          includeLoginGuide: quickIncludeCreds,
          includeEscrowBadge: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setQuickNotice({
          type: 'success',
          text: `Email dispatched to ${contactEmail} (Message ID: ${data.receipt?.messageId || 'sent'})`
        });
        setShowQuickSend(false);
        await fetchCompanyHistory();
      } else {
        setQuickNotice({
          type: 'error',
          text: data.message || 'Failed to dispatch email.'
        });
      }
    } catch (err: any) {
      setQuickNotice({
        type: 'error',
        text: err?.message || 'Network error while dispatching email.'
      });
    } finally {
      setQuickSending(false);
    }
  };

  const automatedCount = entries.filter((e) => e.dispatchType === 'AUTOMATED').length;
  const manualCount = entries.filter((e) => e.dispatchType === 'MANUAL').length;

  const filteredEntries = entries.filter((entry) => {
    if (filterType !== 'ALL' && entry.dispatchType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubj = entry.subject.toLowerCase().includes(q);
      const matchMsgId = (entry.messageId || '').toLowerCase().includes(q);
      const matchSummary = (entry.summaryText || '').toLowerCase().includes(q);
      const matchCat = entry.category.toLowerCase().includes(q);
      return matchSubj || matchMsgId || matchSummary || matchCat;
    }
    return true;
  });

  return (
    <div
      id={`company-email-history-${companyId || companyName.replace(/\s+/g, '-').toLowerCase()}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">
                Email History — {companyName}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {entries.length} Total Sent
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Contact: <strong className="text-white">{contactName}</strong> (
              <span className="font-mono text-blue-300">{contactEmail}</span>) • Complete log of all automated &amp; manual SMTP dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowQuickSend(!showQuickSend)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{showQuickSend ? 'Cancel Compose' : 'Send Email to Contact'}</span>
          </button>

          {onOpenFullDispatcher && (
            <button
              type="button"
              onClick={() =>
                onOpenFullDispatcher({
                  recipientName: contactName,
                  recipientEmail: contactEmail,
                  companyName,
                  contactPhone
                })
              }
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title="Open in Full Mail Center with Tenders Builder"
            >
              Full Template Editor
            </button>
          )}

          <button
            type="button"
            onClick={fetchCompanyHistory}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Refresh Email History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Close Email History"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Notice Toast */}
      {quickNotice && (
        <div
          className={`px-5 py-3 text-xs font-bold flex items-center justify-between border-b ${
            quickNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {quickNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{quickNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setQuickNotice(null)}
            className="text-[10px] uppercase font-black text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Inline Compose Drawer */}
      {showQuickSend && (
        <form
          onSubmit={handleQuickSendEmail}
          className="p-5 bg-blue-50/60 border-b border-blue-200 space-y-3 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Manual Email Dispatch to {contactName} ({contactEmail})</span>
            </span>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={quickIncludeCreds}
                onChange={(e) => setQuickIncludeCreds(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Include Portal Login Guide &amp; User ID</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={quickSubject}
                onChange={(e) => setQuickSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Message Content
              </label>
              <input
                type="text"
                required
                value={quickIntro}
                onChange={(e) => setQuickIntro(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowQuickSend(false)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={quickSending}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {quickSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending via SMTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MailSuite Open-Rate & Click-Through Analytics Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs">
              ✓✓
            </span>
            <div>
              <div className="text-xs font-black tracking-tight text-white flex items-center gap-2">
                <span>MailSuite Read-Receipt &amp; Open-Rate Tracker</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  1x1 Pixel + Link Redirect Active
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Real-time tracking of email opens, read timestamps, recipient devices, and CTA link clicks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="text-[9px] uppercase font-bold text-slate-400">Open Rate</div>
              <div className="text-sm font-black text-emerald-400">
                {mailSuiteStats
                  ? `${mailSuiteStats.openRatePercent}%`
                  : entries.length > 0
                  ? `${Math.round((entries.filter((e) => e.opened || (e.openCount || 0) > 0).length / entries.length) * 100)}%`
                  : '0%'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="text-[9px] uppercase font-bold text-slate-400">✓✓ Opened</div>
              <div className="text-sm font-black text-white">
                {mailSuiteStats
                  ? `${mailSuiteStats.totalOpened}/${mailSuiteStats.totalDelivered} (${mailSuiteStats.totalOpensCount}x)`
                  : `${entries.filter((e) => e.opened || (e.openCount || 0) > 0).length}/${entries.length}`}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="text-[9px] uppercase font-bold text-slate-400">Click Rate (CTR)</div>
              <div className="text-sm font-black text-blue-400">
                {mailSuiteStats
                  ? `${mailSuiteStats.clickThroughRatePercent}%`
                  : entries.length > 0
                  ? `${Math.round((entries.filter((e) => e.clicked || (e.clickCount || 0) > 0).length / entries.length) * 100)}%`
                  : '0%'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="text-[9px] uppercase font-bold text-slate-400">🔗 Link Clicks</div>
              <div className="text-sm font-black text-amber-300">
                {mailSuiteStats
                  ? `${mailSuiteStats.totalClicksCount} Clicks`
                  : `${entries.reduce((s, e) => s + (e.clickCount || 0), 0)} Clicks`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI & Filter Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>All Emails ({entries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('MANUAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'MANUAL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manual Dispatches ({manualCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('AUTOMATED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'AUTOMATED'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automated System ({automatedCount})</span>
          </button>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by subject, Message-ID, or type..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Email History List */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {loading && entries.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-bold">Loading email history for {companyName}...</p>
          </div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map((item) => {
            const catMeta = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.CUSTOM_ADMIN;
            const isExpanded = expandedEmailId === item.id;
            const isOpened = Boolean(item.opened || (item.openCount || 0) > 0);
            const isClicked = Boolean(item.clicked || (item.clickCount || 0) > 0);
            const openCount = item.openCount || 0;
            const clickCount = item.clickCount || 0;

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/80 transition-colors space-y-2.5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        isOpened
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                          : item.dispatchType === 'AUTOMATED'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}
                      title={
                        isOpened
                          ? `MailSuite Read Receipt: Opened ${openCount} time(s)`
                          : 'Sent & Tracked with MailSuite (Unopened)'
                      }
                    >
                      {isOpened ? (
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Check className="w-4 h-4 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* MailSuite Double-Check Status Badge */}
                        {isOpened ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCheck className="w-3 h-3 text-emerald-700" />
                            <span>✓✓ OPENED ({openCount}x)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <Check className="w-3 h-3 text-slate-500" />
                            <span>✓ SENT • TRACKING ACTIVE</span>
                          </span>
                        )}

                        {isClicked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                            <MousePointerClick className="w-3 h-3 text-blue-700" />
                            <span>🔗 CLICKED ({clickCount}x)</span>
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                            item.dispatchType === 'AUTOMATED'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {item.dispatchType === 'AUTOMATED' ? '⚡ AUTOMATED' : '👤 MANUAL'}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catMeta.colorClass}`}
                        >
                          {catMeta.label}
                        </span>
                      </div>

                      <div className="text-xs font-black text-slate-900 leading-snug">
                        {item.subject}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {item.summaryText}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[10px] text-slate-400 font-mono">
                        <span>To: {item.recipient}</span>
                        {item.trackingId && (
                          <span className="text-indigo-700 font-semibold">
                            MailSuite ID: {item.trackingId}
                          </span>
                        )}
                        {item.lastOpenedAt && (
                          <span className="text-emerald-700 font-bold">
                            Last Read: {new Date(item.lastOpenedAt).toLocaleTimeString()}
                          </span>
                        )}
                        {item.messageId && (
                          <span className="text-slate-500">
                            Message-ID: {item.messageId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.dispatchedAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={simulatingId === `${item.trackingId || item.id}-OPEN`}
                        onClick={() => handleSimulateMailSuiteEvent(item, 'OPEN')}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Test MailSuite 1x1 Open Pixel for this email"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Test Open</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedEmailId(isExpanded ? null : item.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Tracker' : 'MailSuite Log'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Email Metadata & MailSuite Read-Receipt Inspector */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 bg-slate-50 rounded-xl p-3.5 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Recipient &amp; Company
                        </span>
                        <span className="font-bold text-slate-800">
                          {item.recipientName} ({item.companyName})
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          MailSuite Read Status
                        </span>
                        <span className={`font-black ${isOpened ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {isOpened
                            ? `✓✓ Opened ${openCount}x (Unique: ${item.uniqueOpens || 1})`
                            : '✓ Sent (Waiting for First Open)'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          CTA Link Engagement
                        </span>
                        <span className={`font-black ${isClicked ? 'text-blue-700' : 'text-slate-600'}`}>
                          {isClicked ? `🔗 Clicked ${clickCount}x` : 'No Link Clicks Yet'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Tracking Pixel ID
                        </span>
                        <span className="font-mono font-bold text-indigo-700 truncate block">
                          {item.trackingId || `ms-trk-${item.id}`}
                        </span>
                      </div>
                    </div>

                    {/* MailSuite Event History & Simulation Controls */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>MailSuite Read-Receipt &amp; Click Activity Timeline</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSimulateMailSuiteEvent(item, 'OPEN')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            + Simulate Open Pixel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulateMailSuiteEvent(item, 'CLICK')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            + Simulate CTA Click
                          </button>
                        </div>
                      </div>

                      {(item.openEvents && item.openEvents.length > 0) ||
                      (item.clickEvents && item.clickEvents.length > 0) ? (
                        <div className="space-y-1.5 pt-1">
                          {(item.openEvents || []).map((op, i) => (
                            <div
                              key={op.id || i}
                              className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-black text-emerald-800">✓✓ OPEN #{i + 1}</span>
                                <span className="text-slate-700 font-semibold">{op.clientDevice}</span>
                                <span className="font-mono text-[10px] text-slate-500">IP: {op.ip}</span>
                              </div>
                              <span className="font-mono text-[10px] text-emerald-900 font-bold">
                                {new Date(op.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {(item.clickEvents || []).map((cl, i) => (
                            <div
                              key={cl.id || i}
                              className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-black text-blue-800">🔗 CLICK #{i + 1}</span>
                                <span className="text-slate-800 font-bold truncate max-w-xs">
                                  &ldquo;{cl.label}&rdquo;
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  {cl.clientDevice} ({cl.ip})
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-blue-900 font-bold">
                                {new Date(cl.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 py-2">
                          1x1 Tracking Pixel is embedded in this email. As soon as {item.recipient} opens the email in Gmail, Outlook, or Apple Mail, read receipts will appear here in real time.
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Dispatched Content Summary
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {item.summaryText}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center space-y-2">
            <Mail className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              No {filterType !== 'ALL' ? filterType.toLowerCase() : ''} emails recorded yet for {companyName}
            </div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Click &ldquo;Send Email to Contact&rdquo; above to dispatch a customized onboarding guide, credential package, or buyer inquiry alert to {contactEmail}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
