import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MousePointerClick,
  Globe,
  Clock,
  Building2,
  User,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  Layers,
  ArrowLeft,
  Smartphone,
  Monitor,
  Trash2
} from 'lucide-react';
import type { CompanyEmailHistoryEntry, MailSuiteAnalyticsSummary } from '../../services/smtpService';
import { AdminRouteGuard } from './AdminRouteGuard';
import { AuthUser, ActiveView } from '../../types';

function sanitizeAndResolveEmailPreviewHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/cid:torchveinedboulder(@tradeheaven\.net)?/gi, '/assets/aistudio/WhatsApp_Image_2026-11-12_at_7.26.16_AM__1__878cb8ad.jpeg')
    .replace(/cid:giacabochonspecimen(@tradeheaven\.net)?/gi, '/assets/aistudio/WhatsApp_Image_2026-11-12_at_7.26.17_AM__1__a240ea1b.jpeg')
    .replace(/cid:giacabochonbox(@tradeheaven\.net)?/gi, '/assets/aistudio/WhatsApp_Image_2026-11-12_at_7.26.17_AM__1__a240ea1b.jpeg')
    .replace(/cid:blackjadecabochon(@tradeheaven\.net)?/gi, '/assets/aistudio/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg')
    .replace(/cid:turquoisematrix(@tradeheaven\.net)?/gi, '/assets/aistudio/WhatsApp_Image_2026-11-04_at_7.44.20_PM_754649c9.jpeg')
    .replace(/https:\/\/ais-(?:dev|pre)-[^"'\s\)]+\/assets\/aistudio\//gi, '/assets/aistudio/')
    .replace(/display:\s*flex;\s*gap:\s*[^;]+;\s*flex-wrap:\s*wrap;?/gi, 'display: block; width: 100%; max-width: 100%; box-sizing: border-box;')
    .replace(/flex:\s*1;\s*min-width:\s*\d+px;/gi, 'display: block; width: 100%; max-width: 100%; box-sizing: border-box; margin-bottom: 12px;');
}

interface MailDeliveryHistoryPageProps {
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onNavigate: (view: ActiveView) => void;
}

export const MailDeliveryHistoryPage: React.FC<MailDeliveryHistoryPageProps> = ({
  currentUser,
  onOpenAuthModal,
  onNavigate
}) => {
  const [history, setHistory] = useState<CompanyEmailHistoryEntry[]>([]);
  const [summary, setSummary] = useState<MailSuiteAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<CompanyEmailHistoryEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fetchHistoryAndAnalytics = async (silent: boolean | any = false) => {
    const isSilent = silent === true;
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/marketing-suite/state');
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          if (Array.isArray(data.history)) {
            setHistory(data.history);
            setSelectedEntry((prev) => {
              if (!prev) return null;
              return data.history.find((h: CompanyEmailHistoryEntry) => h.id === prev.id || h.trackingId === prev.trackingId) || prev;
            });
          }
          if (data.summary) setSummary(data.summary);
        }
      }
    } catch (err: any) {
      if (!isSilent) {
        setStatusBanner({ type: 'error', message: `Failed to load email delivery history: ${err?.message || 'Network error'}` });
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistoryAndAnalytics(false);
    const interval = setInterval(() => {
      void fetchHistoryAndAnalytics(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSingleTracking = async (entry: CompanyEmailHistoryEntry, eventType: 'OPEN' | 'CLICK') => {
    const trkId = entry.trackingId || entry.id;
    try {
      if (eventType === 'OPEN') {
        // Also fire the live 1x1 GIF pixel endpoint directly to verify end-to-end pixel tracking
        await fetch(`/api/v1/track/open/${encodeURIComponent(trkId)}.gif?t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store'
        });
        await fetchHistoryAndAnalytics(true);
        setStatusBanner({
          type: 'success',
          message: `✓✓ Live 1x1 Tracking Pixel Fired: Open event recorded for ${entry.recipient} (${entry.companyName})!`
        });
        return;
      }

      const res = await fetch('/api/v1/admin/mailsuite/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: trkId,
          emailId: entry.id,
          recipientEmail: entry.recipient,
          eventType
        })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics(true);
        setStatusBanner({
          type: 'success',
          message: data.message || `Recorded ${eventType} event for ${entry.recipient}.`
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || `Failed to record ${eventType} event.`
      });
    }
  };

  const handleCopyText = (text: string, id: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleDownloadPdf = (entry: CompanyEmailHistoryEntry) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      setStatusBanner({ type: 'error', message: 'Pop-up blocked. Please allow pop-ups to generate PDF reports.' });
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TradeHeaven_Mail_Telemetry_Report_${entry.recipient.replace(/[^a-z0-9]/gi, '_')}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 750px; margin: auto; line-height: 1.5; background: #fff; }
          h1 { color: #0f172a; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; }
          .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; }
          .meta div { margin-bottom: 4px; }
          .body-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-top: 16px; background: #fff; font-size: 13px; }
          .footer { margin-top: 24px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Trade Heaven MailSuite™ Delivery &amp; Telemetry PDF Report</h1>
        <div class="meta">
          <div><strong>Recipient:</strong> ${entry.recipientName} (${entry.recipient})</div>
          <div><strong>Company:</strong> ${entry.companyName}</div>
          <div><strong>Subject:</strong> ${entry.subject}</div>
          <div><strong>Category / Type:</strong> ${entry.category} / ${entry.dispatchType}</div>
          <div><strong>Delivery Status:</strong> ${entry.success ? 'Delivered (250 OK)' : 'Bounced / Failed'}</div>
          <div><strong>Tracking ID:</strong> ${entry.trackingId || 'N/A'}</div>
          <div><strong>Message ID:</strong> ${entry.messageId || 'N/A'}</div>
          <div><strong>Dispatched At:</strong> ${new Date(entry.dispatchedAt).toLocaleString()}</div>
          <div><strong>Engagement:</strong> Opens: ${entry.openCount || 0} | Clicks: ${entry.clickCount || 0}</div>
        </div>
        <h3 style="font-size: 14px; margin: 12px 0 6px 0;">Audit Summary</h3>
        <p style="font-size: 12px; color: #334155;">${entry.summaryText || 'No summary notes.'}</p>
        <h3 style="font-size: 14px; margin: 16px 0 6px 0;">Dispatched Email Body Message (PDF Format)</h3>
        <div class="body-box">
          ${sanitizeAndResolveEmailPreviewHtml(entry.htmlPreview || '') || '<p>No HTML body stored.</p>'}
        </div>
        <div class="footer">
          Trade Heaven Global B2B Platform • Secure MailSuite Telemetry Audit Record • Generated ${new Date().toLocaleString()}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setStatusBanner({ type: 'success', message: `PDF print & download dialog opened for ${entry.recipient}. Select "Save as PDF" to download.` });
  };

  const handleRunSimulation = async (action: 'ALL_DELIVERED' | 'BATCH_OPENS' | 'BATCH_CLICKS' | 'SIMULATE_BOUNCE' | 'RESET_ALL') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/marketing-suite/simulate-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        if (Array.isArray(data.history)) setHistory(data.history);
        if (data.summary) setSummary(data.summary);
        setStatusBanner({ type: 'success', message: data.message || `Simulation ${action} executed successfully.` });
      } else {
        setStatusBanner({ type: 'error', message: data?.message || 'Simulation failed.' });
      }
    } catch (err: any) {
      setStatusBanner({ type: 'error', message: err?.message || 'Simulation communication failure.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendZacRefundEscalation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-zac-refund-escalation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message: data.message || 'Dispatched Refund Case Escalation email (Export Manager David) to zac@otec.ltd!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch refund escalation email.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching refund escalation email.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendZacCaseClosedExtension = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-zac-case-closed-extension-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message: data.message || 'Dispatched Case Closed (Extension of Services) email to zac@otec.ltd!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch case closed email.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching case closed email.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRandy10BuyersPetroleumAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-randy-10-buyers-petroleum-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '⛽ Dispatched message to Mr. Randy (randy@midforkcap.com • Middle Fox LLC): 10 verified buyers visited his profile and inquired to buy petroleum products!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch message to Mr. Randy.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching message to Mr. Randy.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMarkJohnson15BuyersGeneratorsAndCranesAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-mark-johnson-15-buyers-generators-cranes-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '⚡🏗️ Dispatched message to Mark Johnson (mjohnson@atlanticpowerequip.com • Atlantic Power & Equipment Co.): 10 buyers visited his profile and inquired to buy generators and 5 for cranes!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch message to Mark Johnson.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching message to Mark Johnson.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAli29BuyersFuelAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-ali-29-buyers-fuel-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'yr943334@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '⛽ Dispatched message to Ali Charley Ezekiah (ezekiahali355@gmail.com • ACE Intermediary): 29 verified buyers showed buying fuel from him and contacted him via Trade Heaven + copy to yr943334@gmail.com!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch message to Ali.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching message to Ali.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReverseEnergy47BuyersCoalAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-reverse-energy-47-buyers-coal-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'yr943334@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '⚡⛏️ Dispatched message to Emmanuel (reverseenergypty@gmail.com • Reverse Energy Pty Ltd): 47 verified buyers for coal contacted them via Trade Heaven + copy to yr943334@gmail.com!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch message to Emmanuel.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching message to Emmanuel.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDonald47BuyersCoalAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-donald-47-buyers-coal-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'yr943334@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '⚡⛏️ Dispatched message to Donald Sorkin (sorkindon@gmail.com • Girlsenberries): 47 verified buyers for coal contacted them via Trade Heaven + copy to yr943334@gmail.com!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch message to Donald.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching message to Donald.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBlackstoneJade59BuyersStonesAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-blackstone-jade-59-buyers-stones-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: 'yr943334@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '⚡💎 Dispatched email to Brat / Lars Barnhart (Larsbarnhart25@gmail.com • Blackstone Jade Co): 5+ buyers visited site showing interest in buying stones + Attorney USD Money, Contract, Bank Financials & Proof of Business verification package!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to dispatch message to Brat / Lars Barnhart.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while dispatching message to Brat / Lars Barnhart.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRealisticClientGeniusDemoMail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/send-realistic-client-demo-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: 'yr943334@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        await fetchHistoryAndAnalytics();
        setStatusBanner({
          type: 'success',
          message:
            data.message ||
            '🏛️ Realistic genius client demo mail delivered to yr943334@gmail.com after all yesterday\'s mail!'
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: data?.message || 'Failed to deliver realistic client demo mail.'
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err?.message || 'Network error while delivering realistic client demo mail.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.trackingId || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'DELIVERED' && item.success && item.mailSuiteStatus !== 'OPENED' && item.mailSuiteStatus !== 'CLICKED') ||
        (statusFilter === 'OPENED' && item.opened) ||
        (statusFilter === 'CLICKED' && item.clicked) ||
        (statusFilter === 'BOUNCED' && (!item.success || item.mailSuiteStatus === 'BOUNCED'));

      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [history, searchTerm, statusFilter, categoryFilter]);

  return (
    <AdminRouteGuard
      currentUser={currentUser}
      onOpenAuthModal={onOpenAuthModal}
      onNavigate={onNavigate}
      title="Mail Delivery History & Telemetry Hub"
      description="Monitor full audit history, MailSuite open/click telemetry, SMTP delivery receipts, and recipient engagement for all dispatched emails."
    >
      <div className="max-w-[1440px] mx-auto px-4 py-8 space-y-6">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>MailSuite™ Production Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Email Delivery History &amp; Engagement Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time delivery status, 1x1 open tracking pixels, click-through audit trails, and server response logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleSendRealisticClientGeniusDemoMail}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-700 hover:from-black hover:to-amber-800 text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 border border-amber-400/50"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>🏛️ Send Realistic Genius Client Mail Demo (yr943334@gmail.com)</span>
            </button>

            <button
              type="button"
              onClick={handleSendMarkJohnson15BuyersGeneratorsAndCranesAlert}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>⚡🏗️ Send Mark Johnson: 10 Buyers (Generators) &amp; 5 Buyers (Cranes)</span>
            </button>

            <button
              type="button"
              onClick={handleSendRandy10BuyersPetroleumAlert}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>⛽ Send Randy: 10 Buyers Visited &amp; Inquired (Petroleum)</span>
            </button>

            <button
              type="button"
              onClick={handleSendAli29BuyersFuelAlert}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>⛽ Send Ali (ACE Intermediary): 29 Buyers Contacted (Fuel)</span>
            </button>

            <button
              type="button"
              onClick={handleSendReverseEnergy47BuyersCoalAlert}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-stone-800 to-amber-700 hover:from-black hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 border border-amber-500/40"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡⛏️ Send Emmanuel (Reverse Energy): 47 Buyers (Coal)</span>
            </button>

            <button
              type="button"
              onClick={handleSendDonald47BuyersCoalAlert}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-sky-800 hover:from-black hover:to-sky-900 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 border border-sky-400/40"
            >
              <Send className="w-3.5 h-3.5 text-sky-300" />
              <span>⚡⛏️ Send Donald: 47 Buyers (Coal)</span>
            </button>

            <button
              type="button"
              onClick={handleSendBlackstoneJade59BuyersStonesAlert}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-900 to-cyan-900 hover:from-black hover:to-teal-950 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 border border-teal-400/40"
            >
              <Send className="w-3.5 h-3.5 text-teal-300" />
              <span>⚡💎 Email Brat / Lars Barnhart: 5+ Stone Buyers + Attorney USD &amp; Contract Proof</span>
            </button>

            <button
              type="button"
              onClick={handleSendZacCaseClosedExtension}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✅ Send Zac Case Closed (Service Extension)</span>
            </button>

            <button
              type="button"
              onClick={handleSendZacRefundEscalation}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>⚖️ Send Zac Refund Escalation (Export Manager David)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('RENEWAL_INSIGHTS')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Renewal Insights</span>
            </button>

            <button
              type="button"
              onClick={fetchHistoryAndAnalytics}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh Logs'}</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
            statusBanner.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
            statusBanner.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
            'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <span>{statusBanner.message}</span>
            <button type="button" onClick={() => setStatusBanner(null)} className="text-current opacity-70 hover:opacity-100 cursor-pointer">
              &times;
            </button>
          </div>
        )}

        {/* Analytics Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Sent</div>
              <div className="text-2xl font-black text-slate-900">{summary.totalSent}</div>
              <div className="text-[10px] text-slate-400">Queued &amp; Dispatched</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Delivered</div>
              <div className="text-2xl font-black text-emerald-600">{summary.totalDelivered}</div>
              <div className="text-[10px] text-emerald-700 font-medium">SMTP 250 OK Verified</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Opened</div>
              <div className="text-2xl font-black text-blue-600">{summary.totalOpened}</div>
              <div className="text-[10px] text-blue-700 font-medium">{summary.openRatePercent}% Open Rate</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Clicked</div>
              <div className="text-2xl font-black text-indigo-600">{summary.totalClicked}</div>
              <div className="text-[10px] text-indigo-700 font-medium">{summary.clickThroughRatePercent}% CTR</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Opens</div>
              <div className="text-2xl font-black text-slate-900">{summary.totalOpensCount}</div>
              <div className="text-[10px] text-slate-400">Pixel Fetches</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Clicks</div>
              <div className="text-2xl font-black text-slate-900">{summary.totalClicksCount}</div>
              <div className="text-[10px] text-slate-400">CTA Redirects</div>
            </div>
          </div>
        )}

        {/* Simulation Controls Toolbar */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">MailSuite™ Mock Tracking Simulation Controls</div>
              <div className="text-xs text-slate-400">Test opens, Clicks, and 250 OK delivery confirmations instantly.</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleRunSimulation('ALL_DELIVERED')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Simulate All Delivered
            </button>
            <button
              type="button"
              onClick={() => handleRunSimulation('BATCH_OPENS')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Simulate Batch Opens
            </button>
            <button
              type="button"
              onClick={() => handleRunSimulation('BATCH_CLICKS')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Simulate Batch Clicks
            </button>
            <button
              type="button"
              onClick={() => handleRunSimulation('RESET_ALL')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700"
            >
              Reset Telemetry
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by recipient email, name, company, subject..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              {['ALL', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === st ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="CUSTOM_ADMIN">Custom Admin</option>
              <option value="CAMPAIGN">Campaign</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="BUYER_INQUIRY">Buyer Inquiry</option>
              <option value="OTP_SECURITY">OTP Security</option>
              <option value="LOGIN_ALERT">Login Alert</option>
            </select>
          </div>
        </div>

        {/* Email Delivery History Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-5">Recipient &amp; Company</th>
                  <th className="py-4 px-5">Subject &amp; Category</th>
                  <th className="py-4 px-5">Delivery Status</th>
                  <th className="py-4 px-5">Engagement Telemetry</th>
                  <th className="py-4 px-5">Tracking ID &amp; Message ID</th>
                  <th className="py-4 px-5">Dispatched At</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No email delivery records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((entry) => {
                    const isOpened = Boolean(entry.opened || (entry.openCount || 0) > 0);
                    const isClicked = Boolean(entry.clicked || (entry.clickCount || 0) > 0);
                    const isBounced = !entry.success || entry.mailSuiteStatus === 'BOUNCED';

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 truncate max-w-[200px]">
                            {entry.recipientName}
                          </div>
                          <div className="text-blue-600 font-mono text-[11px] truncate max-w-[200px]">
                            {entry.recipient}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {entry.companyName}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-900 line-clamp-1 max-w-[280px]" title={entry.subject}>
                            {entry.subject}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                              {entry.category}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                              {entry.dispatchType}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          {isBounced ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Bounced</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Delivered (250 OK)</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void handleTriggerSingleTracking(entry, 'OPEN')}
                              title="Click to fire 1x1 tracking pixel and record open receipt"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                isOpened
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              <span>
                                {isOpened ? '✓✓ ' : ''}
                                {entry.openCount || 0} Open{(entry.openCount || 0) === 1 ? '' : 's'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleTriggerSingleTracking(entry, 'CLICK')}
                              title="Click to record CTA link click"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                isClicked
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'
                              }`}
                            >
                              <MousePointerClick className="w-3 h-3" />
                              <span>{entry.clickCount || 0} Click{(entry.clickCount || 0) === 1 ? '' : 's'}</span>
                            </button>
                          </div>
                          {entry.lastOpenedAt && (
                            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                              Last opened: {new Date(entry.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5 font-mono text-[11px]">
                          <div className="text-slate-700 truncate max-w-[160px]" title={entry.trackingId}>
                            Trk: {entry.trackingId || 'N/A'}
                          </div>
                          <div className="text-slate-400 truncate max-w-[160px] text-[10px]" title={entry.messageId}>
                            Msg: {entry.messageId || 'sent'}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-slate-500 whitespace-nowrap text-[11px]">
                          {new Date(entry.dispatchedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void handleTriggerSingleTracking(entry, 'OPEN')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                              title="Fire live 1x1 open tracking pixel"
                            >
                              <Eye className="w-3 h-3" />
                              <span>+Open</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedEntry(entry)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details & HTML Preview Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold uppercase">
                    MailSuite™ Delivery Telemetry Report
                  </div>
                  <h3 className="text-lg font-black mt-1 text-white truncate max-w-xl">
                    {selectedEntry.subject}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                
                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div>
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Recipient</div>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedEntry.recipientName}</div>
                    <div className="text-blue-600 font-mono">{selectedEntry.recipient}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Company</div>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedEntry.companyName}</div>
                    <div className="text-slate-500 text-[11px]">{selectedEntry.category} &bull; {selectedEntry.dispatchType}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Tracking IDs</div>
                    <div className="font-mono text-slate-900 mt-0.5 truncate">Trk: {selectedEntry.trackingId}</div>
                    <div className="font-mono text-slate-500 text-[10px] truncate">Msg: {selectedEntry.messageId || 'sent'}</div>
                  </div>
                </div>

                {/* Summary Text / Summary Notice */}
                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-blue-900 space-y-1">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-blue-700">Audit Summary</div>
                  <div className="leading-relaxed">{selectedEntry.summaryText}</div>
                </div>

                {/* Live 1x1 Pixel Verification & Open/Click Controls */}
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold uppercase text-[10px] tracking-wider text-emerald-800">
                      MailSuite™ Live 1x1 Tracking Pixel Endpoint
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 break-all mt-0.5">
                      {selectedEntry.trackingPixelUrl || `/api/v1/track/open/${selectedEntry.trackingId || selectedEntry.id}.gif`}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleTriggerSingleTracking(selectedEntry, 'OPEN')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Fire 1x1 Open Pixel (+1 Open)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleTriggerSingleTracking(selectedEntry, 'CLICK')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span>Record Click (+1 Click)</span>
                    </button>
                  </div>
                </div>

                {/* Open & Click Event Logs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-blue-600" /> Open Events ({selectedEntry.openEvents?.length || 0})</span>
                      <span className="text-[10px] text-slate-400 font-mono">1x1 Pixel Tracker</span>
                    </div>
                    {(!selectedEntry.openEvents || selectedEntry.openEvents.length === 0) ? (
                      <div className="text-slate-400 text-[11px] italic py-2">No open events recorded yet.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedEntry.openEvents.map((ev, i) => (
                          <div key={ev.id || i} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>{ev.clientDevice}</span>
                              <span className="text-[10px] text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-slate-500 font-mono text-[10px]">IP: {ev.ip} {ev.locationHint ? `• ${ev.locationHint}` : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MousePointerClick className="w-4 h-4 text-indigo-600" /> Click Events ({selectedEntry.clickEvents?.length || 0})</span>
                      <span className="text-[10px] text-slate-400 font-mono">CTA Redirect</span>
                    </div>
                    {(!selectedEntry.clickEvents || selectedEntry.clickEvents.length === 0) ? (
                      <div className="text-slate-400 text-[11px] italic py-2">No click events recorded yet.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedEntry.clickEvents.map((cev, i) => (
                          <div key={cev.id || i} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span className="truncate max-w-[200px]" title={cev.label}>{cev.label}</span>
                              <span className="text-[10px] text-slate-400">{new Date(cev.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-indigo-600 font-mono text-[10px] truncate" title={cev.url}>{cev.url}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* HTML Email Preview */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Dispatched HTML Email Body &amp; Watermark Preview</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedEntry.htmlPreview || '', 'html-body')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'html-body' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'html-body' ? 'Copied HTML' : 'Copy HTML'}</span>
                    </button>
                  </div>
                  <div className="email-style-container email-preview-wrapper overflow-y-auto max-h-96">
                    {selectedEntry.htmlPreview ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeAndResolveEmailPreviewHtml(selectedEntry.htmlPreview) }} />
                    ) : (
                      <div className="text-slate-400 italic py-8 text-center">No HTML preview stored for this entry.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedEntry)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>📥 Generate &amp; Download Mail PDF Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminRouteGuard>
  );
};
