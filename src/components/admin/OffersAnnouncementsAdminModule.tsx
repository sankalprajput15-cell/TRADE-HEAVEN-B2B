import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Megaphone,
  Tag,
  Image as ImageIcon,
  Plus,
  Mail,
  Send,
  Trash2,
  Edit3,
  Eye,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
  PlatformOfferAnnouncement,
  PlatformCampaignType,
  PlatformCampaignPlacement,
  PlatformCampaignTheme,
  PlatformCampaignEmailAudience,
  PlatformCampaignBatchStatus
} from '../../types/platformOfferTypes';

interface OffersAnnouncementsAdminModuleProps {
  onRefreshQueue?: () => Promise<any> | any;
}

const EMPTY_FORM: {
  id?: string;
  type: PlatformCampaignType;
  title: string;
  badgeLabel: string;
  message: string;
  ctaLabel: string;
  ctaView: string;
  ctaUrl: string;
  promoCode: string;
  discountPercent: string;
  bannerImageUrl: string;
  placement: PlatformCampaignPlacement;
  themePreset: PlatformCampaignTheme;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
  emailSubject: string;
  emailIntro: string;
} = {
  type: 'OFFER',
  title: '',
  badgeLabel: 'Special Offer',
  message: '',
  ctaLabel: 'Explore Plans',
  ctaView: 'PREMIUM_MEMBERSHIP',
  ctaUrl: '',
  promoCode: '',
  discountPercent: '',
  bannerImageUrl: '',
  placement: 'TOP_RIBBON',
  themePreset: 'SLATE_DARK',
  isActive: true,
  startsAt: '',
  expiresAt: '',
  emailSubject: '',
  emailIntro: ''
};

const THEME_PREVIEW_MAP: Record<
  PlatformCampaignTheme,
  { headerHex: string; accentHex: string; badgeTextHex: string; label: string; bgClass: string; btnClass: string }
> = {
  SLATE_DARK: {
    headerHex: '#0f172a',
    accentHex: '#2563eb',
    badgeTextHex: '#93c5fd',
    label: 'Slate Executive',
    bgClass: 'bg-slate-900 text-white',
    btnClass: 'bg-white text-slate-900'
  },
  INDIGO_ROYAL: {
    headerHex: '#1e1b4b',
    accentHex: '#4f46e5',
    badgeTextHex: '#c7d2fe',
    label: 'Indigo Royal',
    bgClass: 'bg-indigo-950 text-white',
    btnClass: 'bg-indigo-400 text-slate-950'
  },
  EMERALD_TRUST: {
    headerHex: '#064e3b',
    accentHex: '#059669',
    badgeTextHex: '#a7f3d0',
    label: 'Emerald Trade',
    bgClass: 'bg-emerald-950 text-white',
    btnClass: 'bg-emerald-400 text-slate-950'
  },
  AMBER_GOLD: {
    headerHex: '#451a03',
    accentHex: '#d97706',
    badgeTextHex: '#fde68a',
    label: 'Amber Gold',
    bgClass: 'bg-amber-950 text-white',
    btnClass: 'bg-amber-400 text-slate-950'
  },
  CRIMSON_ALERT: {
    headerHex: '#4c0519',
    accentHex: '#e11d48',
    badgeTextHex: '#fecdd3',
    label: 'Crimson Notice',
    bgClass: 'bg-rose-950 text-white',
    btnClass: 'bg-white text-rose-950'
  }
};

export const OffersAnnouncementsAdminModule: React.FC<OffersAnnouncementsAdminModuleProps> = ({
  onRefreshQueue
}) => {
  const [subView, setSubView] = useState<'LIST' | 'EDITOR' | 'EMAIL'>('LIST');
  const [items, setItems] = useState<PlatformOfferAnnouncement[]>([]);
  const [clientCounts, setClientCounts] = useState({ all: 0, suppliers: 0, buyers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | PlatformCampaignType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LIVE' | 'PAUSED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email Studio State
  const [selectedEmailCampaignId, setSelectedEmailCampaignId] = useState<string>('');
  const [emailAudience, setEmailAudience] = useState<PlatformCampaignEmailAudience>('ADMIN_PREVIEW');
  const [customEmailsInput, setCustomEmailsInput] = useState('');
  const [emailSubjectOverride, setEmailSubjectOverride] = useState('');
  const [emailIntroOverride, setEmailIntroOverride] = useState('');
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [batchStatus, setBatchStatus] = useState<PlatformCampaignBatchStatus>({
    campaignId: null,
    campaignTitle: '',
    isRunning: false,
    totalRecipients: 0,
    processedCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    currentRecipient: null,
    launchedAt: null,
    completedAt: null,
    receipts: []
  });

  const notifyStorefront = () => {
    window.dispatchEvent(new CustomEvent('tradeheaven_platform_offers_updated'));
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/platform-offers', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        if (data?.clientCounts) {
          setClientCounts(data.clientCounts);
        }
      }
    } catch {
      showFeedback('error', 'Failed to load platform offers and announcements.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOffers();
    fetch('/api/v1/admin/platform-offers/email-status', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.batch) {
          setBatchStatus(data.batch);
          if (data.batch.isRunning) setIsSendingEmails(true);
        }
      })
      .catch(() => {});
  }, [fetchOffers]);

  // Poll email broadcast progress while active
  useEffect(() => {
    if (!isSendingEmails && !batchStatus.isRunning) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/admin/platform-offers/email-status', {
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.batch) {
          setBatchStatus(data.batch);
          if (!data.batch.isRunning && data.batch.launchedAt) {
            setIsSendingEmails(false);
            await fetchOffers();
            if (onRefreshQueue) await onRefreshQueue();
            showFeedback(
              data.batch.deliveredCount > 0 ? 'success' : 'error',
              `Email broadcast completed: ${data.batch.deliveredCount}/${data.batch.totalRecipients} delivered.`
            );
          }
        }
      } catch {
        // ignore transient poll errors
      }
    }, 650);
    return () => clearInterval(timer);
  }, [isSendingEmails, batchStatus.isRunning, fetchOffers, onRefreshQueue]);

  const handleOpenCreate = (presetType: PlatformCampaignType = 'OFFER') => {
    setForm({
      ...EMPTY_FORM,
      type: presetType,
      badgeLabel:
        presetType === 'OFFER'
          ? 'Special Offer'
          : presetType === 'BANNER'
          ? 'Featured Banner'
          : 'Announcement',
      placement: presetType === 'BANNER' ? 'HERO_BANNER' : 'TOP_RIBBON'
    });
    setSubView('EDITOR');
  };

  const handleOpenEdit = (item: PlatformOfferAnnouncement) => {
    setForm({
      id: item.id,
      type: item.type,
      title: item.title,
      badgeLabel: item.badgeLabel || '',
      message: item.message,
      ctaLabel: item.ctaLabel || 'Learn More',
      ctaView: item.ctaView || 'PREMIUM_MEMBERSHIP',
      ctaUrl: item.ctaUrl || '',
      promoCode: item.promoCode || '',
      discountPercent: item.discountPercent ? String(item.discountPercent) : '',
      bannerImageUrl: item.bannerImageUrl || '',
      placement: item.placement,
      themePreset: item.themePreset,
      isActive: item.isActive,
      startsAt: item.startsAt || '',
      expiresAt: item.expiresAt || '',
      emailSubject: item.emailSubject || '',
      emailIntro: item.emailIntro || ''
    });
    setSubView('EDITOR');
  };

  const handleOpenEmailStudio = (item: PlatformOfferAnnouncement) => {
    setSelectedEmailCampaignId(item.id);
    setEmailSubjectOverride(item.emailSubject || `${item.title} — Trade Heaven`);
    setEmailIntroOverride(
      item.emailIntro ||
        `We are pleased to share our latest ${item.type.toLowerCase()} update with your enterprise account.`
    );
    setSubView('EMAIL');
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/v1/admin/platform-offers/upload-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ filename: file.name, dataUrl })
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        setForm((prev) => ({ ...prev, bannerImageUrl: data.url }));
        showFeedback('success', 'Banner image uploaded and optimized.');
      } else {
        showFeedback('error', data?.message || 'Could not upload banner image.');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Banner upload failed.');
    } finally {
      setIsUploadingBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveCampaign = async (afterSave?: 'LIST' | 'EMAIL') => {
    if (!form.title.trim() || !form.message.trim()) {
      showFeedback('error', 'Please enter both a Title and Message before saving.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/admin/platform-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        showFeedback('error', data?.message || 'Failed to save campaign.');
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : items);
      notifyStorefront();
      showFeedback(
        'success',
        form.id
          ? `Updated "${data.item.title}" successfully.`
          : `Created "${data.item.title}" successfully.`
      );
      if (afterSave === 'EMAIL' && data.item) {
        handleOpenEmailStudio(data.item);
      } else if (afterSave === 'LIST') {
        setSubView('LIST');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Network error while saving campaign.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLive = async (item: PlatformOfferAnnouncement) => {
    try {
      const res = await fetch(`/api/v1/admin/platform-offers/${encodeURIComponent(item.id)}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive })
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.items)) {
        setItems(data.items);
        notifyStorefront();
        showFeedback(
          'success',
          `"${item.title}" is now ${!item.isActive ? 'live on the platform' : 'paused'}.`
        );
      }
    } catch {
      showFeedback('error', 'Failed to update live visibility.');
    }
  };

  const handleDelete = async (item: PlatformOfferAnnouncement) => {
    if (!window.confirm(`Delete "${item.title}" permanently?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/platform-offers/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.items)) {
        setItems(data.items);
        notifyStorefront();
        if (selectedEmailCampaignId === item.id) {
          setSelectedEmailCampaignId('');
        }
        showFeedback('success', `Deleted "${item.title}".`);
      }
    } catch {
      showFeedback('error', 'Failed to delete campaign.');
    }
  };

  const handleLaunchEmailBroadcast = async () => {
    if (!selectedEmailCampaignId) {
      showFeedback('error', 'Select a campaign to broadcast via email.');
      return;
    }
    if (emailAudience === 'CUSTOM' && !customEmailsInput.trim()) {
      showFeedback('error', 'Enter at least one recipient email address for Custom List.');
      return;
    }
    setIsSendingEmails(true);
    try {
      const res = await fetch(
        `/api/v1/admin/platform-offers/${encodeURIComponent(selectedEmailCampaignId)}/send-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            audience: emailAudience,
            customEmails: customEmailsInput,
            emailSubject: emailSubjectOverride,
            emailIntro: emailIntroOverride,
            async: true
          })
        }
      );
      const data = await res.json();
      if (data?.batch) {
        setBatchStatus(data.batch);
      }
      if (!res.ok || !data?.success) {
        setIsSendingEmails(false);
        showFeedback('error', data?.message || 'Failed to launch email broadcast.');
      }
    } catch (err: any) {
      setIsSendingEmails(false);
      showFeedback('error', err?.message || 'Network error dispatching campaign email.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterStatus === 'LIVE' && !item.isActive) return false;
    if (filterStatus === 'PAUSED' && item.isActive) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        (item.promoCode || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const liveCount = items.filter((i) => i.isActive).length;
  const offerCount = items.filter((i) => i.type === 'OFFER').length;
  const totalEmailsSent = items.reduce((acc, i) => acc + (i.lastEmailCount || 0), 0);

  const selectedEmailCampaign =
    items.find((i) => i.id === selectedEmailCampaignId) || items[0] || null;
  const activeEmailCampaignId = selectedEmailCampaign?.id || '';
  const activeThemePreview = THEME_PREVIEW_MAP[form.themePreset] || THEME_PREVIEW_MAP.SLATE_DARK;

  return (
    <div id="admin-offers-announcements-hub" className="space-y-6">
      {/* Top Bar Contract Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500">
            Admin Console / Offers, Banners &amp; Announcements
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Offers, Banners &amp; Announcements Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Create, schedule, and publish promotional offers, storefront banners, or announcements across the platform and broadcast them directly via SMTP email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenCreate('OFFER')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Offer / Banner / Announcement</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (items.length > 0 && !selectedEmailCampaignId) {
                handleOpenEmailStudio(items[0]);
              } else {
                setSubView('EMAIL');
              }
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Email Broadcast Studio</span>
          </button>
        </div>
      </div>

      {/* Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Total Campaigns</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums font-mono">
            {items.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Live on Platform</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums font-mono">
            {liveCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Promo Offers</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums font-mono">
            {offerCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Campaign Emails Sent</div>
          <div className="mt-1 text-2xl font-bold text-blue-700 tabular-nums font-mono">
            {totalEmailsSent}
          </div>
        </div>
      </div>

      {/* Segmented Workspace Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            type="button"
            onClick={() => setSubView('LIST')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              subView === 'LIST'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Campaigns ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView('EDITOR')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              subView === 'EDITOR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {form.id ? 'Edit Campaign' : 'Create Offer / Banner'}
          </button>
          <button
            type="button"
            onClick={() => setSubView('EMAIL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              subView === 'EMAIL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Email Broadcast Studio
          </button>
        </div>

        <button
          type="button"
          onClick={() => void fetchOffers()}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* VIEW 1: CAMPAIGNS TABLE / DIRECTORY */}
      {subView === 'LIST' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'OFFER', 'BANNER', 'ANNOUNCEMENT'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filterType === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'ALL' ? 'All Types' : t === 'OFFER' ? 'Offers' : t === 'BANNER' ? 'Banners' : 'Announcements'}
                </button>
              ))}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="LIVE">Live on Site</option>
                <option value="PAUSED">Paused / Draft</option>
              </select>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, message, or code..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-3">
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  No Active Platform Offers or Announcements
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seasonal Diwali promotions have been removed. Create a new promotional offer, visual storefront banner, or platform announcement to display it live on Trade Heaven or send it via email.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCreate('OFFER')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Create Promo Offer
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreate('BANNER')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Create Visual Banner
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreate('ANNOUNCEMENT')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Create Announcement
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Type / Placement</th>
                    <th className="py-3 px-4">Offer Code</th>
                    <th className="py-3 px-4">Emails Sent</th>
                    <th className="py-3 px-4">Site Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          {item.bannerImageUrl && (
                            <img
                              src={item.bannerImageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-9 rounded object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{item.title}</div>
                            <div className="text-slate-500 truncate mt-0.5">{item.message}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <span className="font-semibold text-slate-800">{item.type}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span>{item.placement.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums">
                        {item.promoCode ? (
                          <span className="font-bold text-slate-900">
                            {item.promoCode}
                            {item.discountPercent ? ` (-${item.discountPercent}%)` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums font-mono text-slate-700">
                        {item.lastEmailCount ? (
                          <div>
                            <div className="font-semibold">{item.lastEmailCount} sent</div>
                            {item.lastEmailedAt && (
                              <div className="text-[11px] text-slate-400">
                                {new Date(item.lastEmailedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => void handleToggleLive(item)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                            item.isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {item.isActive ? 'Live' : 'Paused'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEmailStudio(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Broadcast this campaign by email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Edit campaign"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CAMPAIGN STUDIO BUILDER */}
      {subView === 'EDITOR' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Campaign Builder Form */}
          <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {form.id ? 'Edit Platform Offer / Announcement' : 'Configure New Offer, Banner or Announcement'}
              </h2>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Publish Live on Platform</span>
              </label>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'OFFER', label: 'Promo Offer', icon: Tag },
                { id: 'BANNER', label: 'Visual Banner', icon: ImageIcon },
                { id: 'ANNOUNCEMENT', label: 'Announcement', icon: Megaphone }
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = form.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: opt.id }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Q4 Verified Supplier Launch Offer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Label / Kicker
                </label>
                <input
                  type="text"
                  value={form.badgeLabel}
                  onChange={(e) => setForm((p) => ({ ...p, badgeLabel: e.target.value }))}
                  placeholder="e.g., Flash Offer or Trade Update"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Offer / Announcement Message *
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Describe the promotion terms, announcement details, or trade benefit..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Promo & Discount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  value={form.promoCode}
                  onChange={(e) => setForm((p) => ({ ...p, promoCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g., EXPORT15"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount % (Optional, applies to membership checkout)
                </label>
                <input
                  type="number"
                  min={0}
                  max={95}
                  value={form.discountPercent}
                  onChange={(e) => setForm((p) => ({ ...p, discountPercent: e.target.value }))}
                  placeholder="e.g., 15"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Placement & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platform Display Placement
                </label>
                <select
                  value={form.placement}
                  onChange={(e) => setForm((p) => ({ ...p, placement: e.target.value as PlatformCampaignPlacement }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="TOP_RIBBON">Top Site Ribbon Only</option>
                  <option value="HERO_BANNER">Homepage Banner Section Only</option>
                  <option value="BOTH">Both (Top Ribbon + Homepage Banner)</option>
                  <option value="EMAIL_ONLY">Email Campaign Only (Hidden on Site)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visual Color Theme
                </label>
                <select
                  value={form.themePreset}
                  onChange={(e) => setForm((p) => ({ ...p, themePreset: e.target.value as PlatformCampaignTheme }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  {Object.entries(THEME_PREVIEW_MAP).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Button Label
                </label>
                <input
                  type="text"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))}
                  placeholder="e.g., View Membership Plans"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination View
                </label>
                <select
                  value={form.ctaView}
                  onChange={(e) => setForm((p) => ({ ...p, ctaView: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="PREMIUM_MEMBERSHIP">Membership &amp; Pricing Plans</option>
                  <option value="PRODUCT_DIRECTORY">Product Directory</option>
                  <option value="SUPPLIERS_DIRECTORY">Suppliers Directory</option>
                  <option value="BUY_LEADS">Buy Leads / RFQs</option>
                  <option value="CUSTOM_URL">Custom External URL</option>
                </select>
              </div>
            </div>

            {form.ctaView === 'CUSTOM_URL' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Destination URL
                </label>
                <input
                  type="url"
                  value={form.ctaUrl}
                  onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))}
                  placeholder="https://www.tradeheaven.net/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            )}

            {/* Banner Image Upload & URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Banner Image (Displayed on Storefront Banner &amp; Embedded in Campaign Emails)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={form.bannerImageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, bannerImageUrl: e.target.value }))}
                  placeholder="/assets/uploads/your-banner.jpg or https://..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingBanner}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                </button>
              </div>
            </div>

            {/* Optional Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSubView('LIST')}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void saveCampaign('LIST')}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
              >
                {isSaving ? 'Saving...' : form.id ? 'Update Campaign' : 'Save Campaign'}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void saveCampaign('EMAIL')}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Save &amp; Send via Email</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Storefront Preview */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Live Platform Preview</span>
                </h3>
                <span className="text-[11px] font-medium text-slate-500">
                  {form.placement.replace('_', ' ')}
                </span>
              </div>

              {/* Ribbon Preview */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-slate-500">Top Site Ribbon Preview</div>
                <div className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs ${activeThemePreview.bgClass}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[10px] font-bold uppercase shrink-0">
                      {form.badgeLabel || form.type}
                    </span>
                    <span className="font-semibold truncate">
                      {form.title || 'Your Headline Will Appear Here'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {form.promoCode && (
                      <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] font-bold">
                        {form.promoCode}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${activeThemePreview.btnClass}`}>
                      {form.ctaLabel || 'Learn More'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Banner Card Preview */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-medium text-slate-500">Storefront Banner Card Preview</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {form.bannerImageUrl && (
                    <img
                      src={form.bannerImageUrl}
                      alt="Banner preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover border-b border-slate-200"
                    />
                  )}
                  <div className="p-4 space-y-2.5">
                    <div className="text-[11px] font-semibold text-slate-500">
                      {form.badgeLabel || form.type}
                      {form.discountPercent ? ` · ${form.discountPercent}% OFF` : ''}
                      {form.expiresAt ? ` · Ends ${form.expiresAt}` : ''}
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {form.title || 'Campaign Title'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {form.message || 'Your promotional offer, banner copy, or official announcement message will render cleanly here.'}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {form.promoCode && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-900">
                          Code: {form.promoCode}
                        </span>
                      )}
                      <span
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1"
                        style={{ backgroundColor: activeThemePreview.accentHex }}
                      >
                        <span>{form.ctaLabel || 'Explore Now'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INTEGRATED EMAIL BROADCAST STUDIO */}
      {subView === 'EMAIL' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Controls */}
          <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Dispatch Offer / Announcement via Email
            </h2>

            {items.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600">
                  Create an offer, banner, or announcement first so you can broadcast it to clients via SMTP email.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreate('OFFER')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Create First Campaign
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Campaign to Email
                  </label>
                  <select
                    value={activeEmailCampaignId}
                    onChange={(e) => {
                      const found = items.find((i) => i.id === e.target.value);
                      setSelectedEmailCampaignId(e.target.value);
                      if (found) {
                        setEmailSubjectOverride(found.emailSubject || `${found.title} — Trade Heaven`);
                        setEmailIntroOverride(
                          found.emailIntro ||
                            `We are pleased to share our latest ${found.type.toLowerCase()} update with your enterprise account.`
                        );
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                  >
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.type}] {item.title} {item.promoCode ? `(${item.promoCode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={emailAudience}
                    onChange={(e) => setEmailAudience(e.target.value as PlatformCampaignEmailAudience)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="ADMIN_PREVIEW">Admin Test Preview (yr943334 &amp; sankalprajput15)</option>
                    <option value="ALL_CLIENTS">All Registered Clients ({clientCounts.all})</option>
                    <option value="SUPPLIERS_ONLY">Verified Suppliers Only ({clientCounts.suppliers})</option>
                    <option value="BUYERS_ONLY">Verified Buyers Only ({clientCounts.buyers})</option>
                    <option value="CUSTOM">Custom Recipient Emails</option>
                  </select>
                </div>

                {emailAudience === 'CUSTOM' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom Recipient Emails (comma or line separated)
                    </label>
                    <textarea
                      rows={3}
                      value={customEmailsInput}
                      onChange={(e) => setCustomEmailsInput(e.target.value)}
                      placeholder="client1@company.com, client2@company.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubjectOverride}
                    onChange={(e) => setEmailSubjectOverride(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personal Opening Message
                  </label>
                  <textarea
                    rows={3}
                    value={emailIntroOverride}
                    onChange={(e) => setEmailIntroOverride(e.target.value)}
                    placeholder="Opening note above the offer card..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSendingEmails || !selectedEmailCampaign}
                  onClick={() => void handleLaunchEmailBroadcast()}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSendingEmails
                      ? `Sending ${batchStatus.processedCount}/${batchStatus.totalRecipients} via SMTP Queue...`
                      : emailAudience === 'ADMIN_PREVIEW'
                      ? 'Send Test Email to Admin'
                      : 'Broadcast Campaign Emails'}
                  </span>
                </button>

                {/* Live Batch Delivery Progress */}
                {(batchStatus.isRunning || batchStatus.receipts.length > 0) && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>SMTP Queue Progress</span>
                      <span className="font-mono tabular-nums">
                        {batchStatus.deliveredCount}/{batchStatus.totalRecipients} delivered
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${
                            batchStatus.totalRecipients > 0
                              ? Math.min(
                                  100,
                                  Math.round((batchStatus.processedCount / batchStatus.totalRecipients) * 100)
                                )
                              : 0
                          }%`
                        }}
                      />
                    </div>
                    {batchStatus.currentRecipient && batchStatus.isRunning && (
                      <div className="text-[11px] font-mono text-slate-600">
                        Sending to: {batchStatus.currentRecipient}
                      </div>
                    )}
                    {batchStatus.receipts.length > 0 && (
                      <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
                        {batchStatus.receipts.map((r, idx) => (
                          <div
                            key={`${r.recipient}-${idx}`}
                            className="flex items-center justify-between text-[11px] font-mono px-2 py-1 rounded bg-white border border-slate-200"
                          >
                            <span className="truncate text-slate-700">{r.recipient}</span>
                            <span className={r.success ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                              {r.success ? 'SENT' : 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Bordered Responsive Email Preview */}
          <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Responsive Email Preview
              </div>
              {selectedEmailCampaign && (
                <div className="text-[11px] text-slate-500">
                  Subject: <strong className="text-slate-800">{emailSubjectOverride || selectedEmailCampaign.title}</strong>
                </div>
              )}
            </div>

            {selectedEmailCampaign ? (
              <div className="email-style-container">
                <div
                  className="rounded-xl overflow-hidden border-2 border-slate-300 bg-white max-w-[600px] mx-auto"
                >
                  <div
                    className="p-6 text-center text-white border-b border-slate-700"
                    style={{
                      backgroundColor:
                        (THEME_PREVIEW_MAP[selectedEmailCampaign.themePreset] || THEME_PREVIEW_MAP.SLATE_DARK).headerHex
                    }}
                  >
                    <div className="inline-block px-3 py-1 rounded border border-white/30 bg-white/10 text-[10px] font-bold uppercase tracking-widest mb-2">
                      {selectedEmailCampaign.badgeLabel || selectedEmailCampaign.type}
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {selectedEmailCampaign.title}
                    </h3>
                  </div>

                  {selectedEmailCampaign.bannerImageUrl && (
                    <div className="bg-slate-950 border-b border-slate-300">
                      <img
                        src={selectedEmailCampaign.bannerImageUrl}
                        alt={selectedEmailCampaign.title}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-60 object-cover block"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-4 text-slate-800 text-xs sm:text-sm">
                    <p className="m-0">
                      Hello <strong>Valued Trade Partner</strong>,
                    </p>
                    <p className="m-0 text-slate-600 leading-relaxed">
                      {emailIntroOverride ||
                        `We are pleased to share our latest ${selectedEmailCampaign.type.toLowerCase()} update with your enterprise account.`}
                    </p>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 leading-relaxed whitespace-pre-line">
                      {selectedEmailCampaign.message}
                    </div>

                    {(selectedEmailCampaign.promoCode || (selectedEmailCampaign.discountPercent || 0) > 0) && (
                      <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-50 text-center space-y-1.5">
                        {selectedEmailCampaign.discountPercent ? (
                          <div className="text-base font-bold text-slate-900">
                            {selectedEmailCampaign.discountPercent}% OFF Special Benefit
                          </div>
                        ) : null}
                        {selectedEmailCampaign.promoCode && (
                          <div className="inline-block px-4 py-1.5 rounded-lg bg-slate-900 text-white font-mono text-sm font-bold tracking-widest">
                            {selectedEmailCampaign.promoCode}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-center pt-2">
                      <span
                        className="inline-block px-6 py-2.5 rounded-lg text-white text-xs font-bold"
                        style={{
                          backgroundColor:
                            (THEME_PREVIEW_MAP[selectedEmailCampaign.themePreset] || THEME_PREVIEW_MAP.SLATE_DARK).accentHex
                        }}
                      >
                        {selectedEmailCampaign.ctaLabel || 'Open Trade Heaven'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 text-center text-[11px] text-slate-500">
                    Trade Heaven Global B2B Marketplace • Automated Dispatch via noreply@tradeheaven.net
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select or create a campaign to preview its email layout.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
