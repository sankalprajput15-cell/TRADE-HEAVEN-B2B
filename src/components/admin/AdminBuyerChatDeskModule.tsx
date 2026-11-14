import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminBuyerIdentity,
  ChatConversation,
  ChatMediaType,
  MultiChatMessage
} from '../../types';
import {
  createBuyerIdentity,
  createOrGetChatConversation,
  deleteBuyerIdentity,
  fetchBuyerIdentities,
  fetchChatConversations,
  fetchChatMessages,
  markChatMessagesRead,
  processUnseenChatAlerts,
  sendChatMessage,
  subscribeMultiIdentityChatEvents,
  toggleChatVisibility,
  updateBuyerIdentity
} from '../../services/multiIdentityChatService';
import { ChatMediaBubbleContent } from '../chat/ChatMediaBubbleContent';
import { ChatMediaComposer } from '../chat/ChatMediaComposer';
import { MessageReadStatus } from '../chat/MessageReadStatus';
import { setupChatViewportReadObserver } from '../../utils/chatViewportReadObserver';
import {
  BadgeCheck,
  BellRing,
  Building2,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquarePlus,
  MessagesSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X
} from 'lucide-react';

interface RegisteredSupplierOption {
  id: string;
  name: string;
  email: string;
  companyName: string;
  country: string;
  role: string;
}

const COUNTRY_FLAG_MAP: Record<string, string> = {
  'united states': '🇺🇸',
  usa: '🇺🇸',
  germany: '🇩🇪',
  india: '🇮🇳',
  china: '🇨🇳',
  'united kingdom': '🇬🇧',
  uk: '🇬🇧',
  uae: '🇦🇪',
  'united arab emirates': '🇦🇪',
  sweden: '🇸🇪',
  singapore: '🇸🇬',
  japan: '🇯🇵',
  canada: '🇨🇦',
  france: '🇫🇷',
  italy: '🇮🇹',
  spain: '🇪🇸',
  brazil: '🇧🇷',
  australia: '🇦🇺',
  netherlands: '🇳🇱',
  turkey: '🇹🇷',
  vietnam: '🇻🇳',
  thailand: '🇹🇭'
};

function getCountryFlag(country?: string): string {
  const key = String(country || '').trim().toLowerCase();
  return COUNTRY_FLAG_MAP[key] || '🌐';
}

function formatChatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface IdentityFormState {
  id?: string;
  buyerName: string;
  companyName: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  productInterest: string;
  address: string;
}

const EMPTY_IDENTITY_FORM: IdentityFormState = {
  buyerName: '',
  companyName: '',
  country: 'United States',
  city: '',
  phone: '',
  email: '',
  productInterest: '',
  address: ''
};

export const AdminBuyerChatDeskModule: React.FC = () => {
  const [identities, setIdentities] = useState<AdminBuyerIdentity[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [suppliers, setSuppliers] = useState<RegisteredSupplierOption[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messages, setMessages] = useState<MultiChatMessage[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [alertStatusBanner, setAlertStatusBanner] = useState<string | null>(null);

  // Filters & Top Switcher
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [filterIdentityId, setFilterIdentityId] = useState<string>('ALL');
  const [switcherIdentityId, setSwitcherIdentityId] = useState<string>('');
  const [switcherSupplierId, setSwitcherSupplierId] = useState<string>('');
  const [startingThread, setStartingThread] = useState(false);

  // Persona Manager Modal
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [personaForm, setPersonaForm] = useState<IdentityFormState>(EMPTY_IDENTITY_FORM);
  const [savingPersona, setSavingPersona] = useState(false);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedConvIdRef = useRef<string>('');
  selectedConvIdRef.current = selectedConvId;

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await fetch(`/api.php?action=get_users&_t=${Date.now()}`, {
        headers: { Accept: 'application/json' }
      });
      const json = await res.json().catch(() => ({}));
      const rawUsers = Array.isArray(json?.data) ? json.data : [];
      const mapped: RegisteredSupplierOption[] = rawUsers
        .filter((u: any) => String(u.role || '').toUpperCase() !== 'ADMIN')
        .map((u: any) => ({
          id: String(u.id),
          name: String(u.name || u.companyName || u.company_name || 'Verified Supplier'),
          email: String(u.email || ''),
          companyName: String(u.companyName || u.company_name || u.name || 'Verified Supplier'),
          country: String(u.country || 'Global'),
          role: String(u.role || 'SUPPLIER').toUpperCase()
        }));
      // Prioritize SUPPLIER accounts at the top
      mapped.sort((a, b) => {
        if (a.role === 'SUPPLIER' && b.role !== 'SUPPLIER') return -1;
        if (a.role !== 'SUPPLIER' && b.role === 'SUPPLIER') return 1;
        return a.companyName.localeCompare(b.companyName);
      });
      setSuppliers(mapped);
      if (mapped.length > 0) {
        setSwitcherSupplierId(prev => prev || mapped[0].id);
      }
    } catch {
      // keep existing
    }
  }, []);

  const refreshDeskData = useCallback(async () => {
    try {
      const [idList, convList] = await Promise.all([
        fetchBuyerIdentities(),
        fetchChatConversations({ viewMode: 'admin' })
      ]);
      setIdentities(idList);
      setConversations(convList);
      if (idList.length > 0) {
        setSwitcherIdentityId(prev => (prev && idList.some(i => i.id === prev) ? prev : idList[0].id));
      }
      if (!selectedConvIdRef.current && convList.length > 0) {
        setSelectedConvId(convList[0].id);
      }
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const loadMessagesForThread = useCallback(async (convId: string, silent = false) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    if (!silent) setLoadingMessages(true);
    try {
      const list = await fetchChatMessages(convId, 'buyer_identity');
      setMessages(list);
      // Clear local unread badge immediately after mark-read fetch
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, unreadForAdmin: 0, unreadCount: 0 } : c
        )
      );
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void refreshDeskData();
    void loadSuppliers();
  }, [refreshDeskData, loadSuppliers]);

  useEffect(() => {
    if (selectedConvId) {
      void loadMessagesForThread(selectedConvId);
    } else {
      setMessages([]);
    }
  }, [selectedConvId, loadMessagesForThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedConvId]);

  // Viewport Intersection & Open Thread Read Observer
  useEffect(() => {
    const container = messagesContainerRef.current;
    const convId = selectedConvId;
    if (!container || !convId) return;

    const cleanup = setupChatViewportReadObserver(
      container,
      convId,
      'buyer_identity',
      () => {
        setMessages(prev =>
          prev.map(m =>
            m.senderRole === 'supplier' && !m.isRead
              ? { ...m, isRead: true, readAt: new Date().toISOString() }
              : m
          )
        );
        setConversations(prev =>
          prev.map(c => (c.id === convId ? { ...c, unreadForAdmin: 0, unreadCount: 0 } : c))
        );
      }
    );
    return cleanup;
  }, [selectedConvId, messages.length]);

  // Mark active conversation incoming messages as read when tab becomes visible/focused
  useEffect(() => {
    const syncVisibleRead = () => {
      const convId = selectedConvIdRef.current;
      if (!convId || document.visibilityState !== 'visible') return;
      const hasUnreadIncoming = messages.some(m => m.senderRole === 'supplier' && !m.isRead);
      if (hasUnreadIncoming) {
        void markChatMessagesRead(convId, 'buyer_identity').then(() => {
          setMessages(prev =>
            prev.map(m =>
              m.senderRole === 'supplier' && !m.isRead
                ? { ...m, isRead: true, readAt: new Date().toISOString() }
                : m
            )
          );
          setConversations(prev =>
            prev.map(c => (c.id === convId ? { ...c, unreadForAdmin: 0, unreadCount: 0 } : c))
          );
        });
      }
    };
    window.addEventListener('focus', syncVisibleRead);
    document.addEventListener('visibilitychange', syncVisibleRead);
    return () => {
      window.removeEventListener('focus', syncVisibleRead);
      document.removeEventListener('visibilitychange', syncVisibleRead);
    };
  }, [messages]);

  // Real-time WebSocket subscription
  useEffect(() => {
    const unsub = subscribeMultiIdentityChatEvents(evt => {
      if (evt.type === 'chat:new_message') {
        const msg: MultiChatMessage | undefined = evt.payload?.message;
        const convId = String(evt.payload?.conversationId || msg?.conversationId || '');
        if (convId && convId === selectedConvIdRef.current && msg) {
          const isIncomingAndVisible =
            msg.senderRole === 'supplier' && document.visibilityState === 'visible';
          const normalizedMsg: MultiChatMessage = isIncomingAndVisible
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg;
          setMessages(prev =>
            prev.some(m => m.id === normalizedMsg.id) ? prev : [...prev, normalizedMsg]
          );
          if (isIncomingAndVisible) {
            void markChatMessagesRead(convId, 'buyer_identity');
          }
        }
        void fetchChatConversations({ viewMode: 'admin' }).then(setConversations);
      } else if (
        evt.type === 'chat:visibility_updated' ||
        evt.type === 'chat:conversation_created' ||
        evt.type === 'chat:identity_updated' ||
        evt.type === 'chat:identity_deleted'
      ) {
        void refreshDeskData();
      } else if (evt.type === 'chat:messages_read') {
        const convId = String(evt.payload?.conversationId || '');
        const readSenderRole = String(evt.payload?.readSenderRole || '');
        const readAt = evt.payload?.readAt ? String(evt.payload.readAt) : new Date().toISOString();
        const targetSenderRole =
          readSenderRole ||
          (evt.payload?.readerRole === 'supplier' ? 'buyer_identity' : 'supplier');

        if (convId && convId === selectedConvIdRef.current) {
          setMessages(prev =>
            prev.map(m =>
              m.senderRole === targetSenderRole && !m.isRead
                ? { ...m, isRead: true, readAt: m.readAt || readAt }
                : m
            )
          );
        }
        if (convId) {
          setConversations(prev =>
            prev.map(c => {
              if (c.id !== convId) return c;
              const updateLast =
                c.lastMessageSenderRole === targetSenderRole ? { lastMessageIsRead: true } : {};
              if (evt.payload?.readerRole === 'buyer_identity') {
                return { ...c, ...updateLast, unreadForAdmin: 0, unreadCount: 0 };
              }
              return { ...c, ...updateLast, unreadForSupplier: 0 };
            })
          );
        }
      } else if (evt.type === 'chat:alerts_processed') {
        const ids = Array.isArray(evt.payload?.messageIds) ? new Set<string>(evt.payload.messageIds.map(String)) : null;
        const sentAt = evt.payload?.emailAlertSentAt ? String(evt.payload.emailAlertSentAt) : new Date().toISOString();
        if (ids && ids.size > 0) {
          setMessages(prev =>
            prev.map(m =>
              ids.has(m.id) ? { ...m, emailAlertSent: true, emailAlertSentAt: m.emailAlertSentAt || sentAt } : m
            )
          );
        }
      }
    });
    return unsub;
  }, [refreshDeskData]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === selectedConvId) || null,
    [conversations, selectedConvId]
  );

  const activeFullIdentity = useMemo(() => {
    if (!activeConversation) return null;
    return identities.find(i => i.id === activeConversation.identityId) || null;
  }, [activeConversation, identities]);

  const filteredConversations = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    return conversations.filter(c => {
      if (filterIdentityId !== 'ALL' && c.identityId !== filterIdentityId) {
        return false;
      }
      if (!q) return true;
      return (
        c.supplierName.toLowerCase().includes(q) ||
        (c.supplierCompany || '').toLowerCase().includes(q) ||
        (c.supplierEmail || '').toLowerCase().includes(q) ||
        (c.identity?.buyerName || '').toLowerCase().includes(q) ||
        (c.identity?.companyName || '').toLowerCase().includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
      );
    });
  }, [conversations, filterIdentityId, sidebarSearch]);

  const totalUnreadCount = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unreadForAdmin ?? c.unreadCount ?? 0), 0),
    [conversations]
  );

  const handleOpenCreatePersona = () => {
    setPersonaError(null);
    setPersonaForm(EMPTY_IDENTITY_FORM);
    setPersonaModalOpen(true);
  };

  const handleOpenEditPersona = (identity: AdminBuyerIdentity) => {
    setPersonaError(null);
    setPersonaForm({
      id: identity.id,
      buyerName: identity.buyerName,
      companyName: identity.companyName,
      country: identity.country,
      city: identity.city,
      phone: identity.phone,
      email: identity.email,
      productInterest: identity.productInterest,
      address: identity.address || ''
    });
    setPersonaModalOpen(true);
  };

  const handleSavePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personaForm.buyerName.trim() || !personaForm.companyName.trim()) {
      setPersonaError('Buyer Full Name and Company / Import Firm Name are required.');
      return;
    }
    setSavingPersona(true);
    setPersonaError(null);
    try {
      if (personaForm.id) {
        const updated = await updateBuyerIdentity({
          id: personaForm.id,
          buyerName: personaForm.buyerName.trim(),
          companyName: personaForm.companyName.trim(),
          country: personaForm.country.trim() || 'United States',
          city: personaForm.city.trim(),
          phone: personaForm.phone.trim(),
          email: personaForm.email.trim(),
          productInterest: personaForm.productInterest.trim(),
          address: personaForm.address.trim(),
          verifiedBuyer: true
        });
        setIdentities(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      } else {
        const created = await createBuyerIdentity({
          buyerName: personaForm.buyerName.trim(),
          companyName: personaForm.companyName.trim(),
          country: personaForm.country.trim() || 'United States',
          city: personaForm.city.trim(),
          phone: personaForm.phone.trim(),
          email: personaForm.email.trim(),
          productInterest: personaForm.productInterest.trim(),
          address: personaForm.address.trim(),
          verifiedBuyer: true
        });
        setIdentities(prev => [created, ...prev]);
        setSwitcherIdentityId(created.id);
      }
      setPersonaModalOpen(false);
      await refreshDeskData();
    } catch (err: any) {
      setPersonaError(err?.message || 'Unable to save buyer persona.');
    } finally {
      setSavingPersona(false);
    }
  };

  const handleDeletePersona = async (id: string) => {
    try {
      await deleteBuyerIdentity(id);
      setIdentities(prev => prev.filter(i => i.id !== id));
      setConfirmDeleteId(null);
      await refreshDeskData();
    } catch {
      // ignore
    }
  };

  const handleStartConversation = async () => {
    if (!switcherIdentityId || !switcherSupplierId || startingThread) return;
    const supplier = suppliers.find(s => s.id === switcherSupplierId);
    if (!supplier) return;

    setStartingThread(true);
    try {
      const conv = await createOrGetChatConversation({
        identityId: switcherIdentityId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        supplierCompany: supplier.companyName,
        supplierCountry: supplier.country
      });
      await refreshDeskData();
      setSelectedConvId(conv.id);
    } finally {
      setStartingThread(false);
    }
  };

  const handleTogglePrivacy = async (field: 'showPhone' | 'showEmail' | 'showCompany') => {
    if (!activeConversation) return;
    const nextVal = !activeConversation[field];
    setTogglingKey(field);
    // Optimistic update
    setConversations(prev =>
      prev.map(c => (c.id === activeConversation.id ? { ...c, [field]: nextVal } : c))
    );
    try {
      await toggleChatVisibility({
        conversationId: activeConversation.id,
        [field]: nextVal
      });
    } catch {
      // Revert on failure
      setConversations(prev =>
        prev.map(c => (c.id === activeConversation.id ? { ...c, [field]: !nextVal } : c))
      );
    } finally {
      setTogglingKey(null);
    }
  };

  const handleSendAdminMessage = async (payload: {
    messageText: string;
    mediaType: ChatMediaType;
    mediaUrl: string;
    mediaName: string;
    mediaSize: number;
  }) => {
    if (!activeConversation) return;
    setSendingMessage(true);
    try {
      const sent = await sendChatMessage({
        conversationId: activeConversation.id,
        senderRole: 'buyer_identity',
        ...payload
      });
      setMessages(prev => (prev.some(m => m.id === sent.id) ? prev : [...prev, sent]));
      await fetchChatConversations({ viewMode: 'admin' }).then(setConversations);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRunUnseenAlertCheck = async () => {
    if (checkingAlerts) return;
    setCheckingAlerts(true);
    setAlertStatusBanner(null);
    try {
      const summary = await processUnseenChatAlerts(60);
      if (summary.alertsSent > 0) {
        const idSet = new Set(summary.messageIds || []);
        setMessages(prev =>
          prev.map(m =>
            idSet.has(m.id) ? { ...m, emailAlertSent: true, emailAlertSentAt: new Date().toISOString() } : m
          )
        );
        setAlertStatusBanner(
          `Dispatched ${summary.alertsSent} urgent 1-minute unseen alert email(s) (${summary.supplierAlerts} supplier, ${summary.adminAlerts} admin).`
        );
      } else {
        setAlertStatusBanner('No unseen messages older than 60 seconds pending email alert.');
      }
    } catch {
      setAlertStatusBanner('Unable to check 1-minute unseen alerts right now.');
    } finally {
      setCheckingAlerts(false);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-5">
      {/* Top Header & Identity Switcher / New Chat Bar */}
      <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <MessagesSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 break-words">
                  Buyer Identities &amp; Live Multi-Thread Chat Desk
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 break-words">
                  Manage international buyer personas, control contact privacy per thread, and chat live with Videos, Images &amp; PDFs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreatePersona}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Create Buyer Identity
            </button>
            <button
              type="button"
              disabled={checkingAlerts}
              onClick={() => void handleRunUnseenAlertCheck()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
              title="Scan all unread messages older than 60 seconds and send urgent deal alert emails"
            >
              {checkingAlerts ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BellRing className="h-3.5 w-3.5" />
              )}
              <span>Check 1m Alerts</span>
            </button>
            <button
              type="button"
              onClick={() => {
                void refreshDeskData();
                void loadSuppliers();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </button>
          </div>
        </div>

        {alertStatusBanner && (
          <div className="mt-3 flex items-start sm:items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 sm:px-3.5 py-2 text-xs font-semibold text-amber-900 min-w-0">
            <span className="inline-flex min-w-0 flex-1 items-start sm:items-center gap-1.5 break-words">
              <BellRing className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
              <span className="min-w-0 break-words">{alertStatusBanner}</span>
            </span>
            <button
              type="button"
              onClick={() => setAlertStatusBanner(null)}
              className="shrink-0 rounded p-0.5 text-amber-700 hover:bg-amber-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Saved Buyer Personas Strip */}
        <div className="mt-4 border-t border-slate-100 pt-4 min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Buyer Personas ({identities.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Select a persona below to filter threads or edit details
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5 min-w-0">
            {identities.map(persona => {
              const isFiltered = filterIdentityId === persona.id;
              return (
                <div
                  key={persona.id}
                  className={`group flex min-w-0 max-w-full items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-2 text-left transition ${
                    isFiltered
                      ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFilterIdentityId(isFiltered ? 'ALL' : persona.id);
                      setSwitcherIdentityId(persona.id);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-xs border border-slate-200">
                      {getCountryFlag(persona.country)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="truncate text-xs font-bold text-slate-900">{persona.buyerName}</span>
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                      </div>
                      <p className="truncate text-[11px] text-slate-500 max-w-[180px] sm:max-w-[240px]">
                        {persona.companyName} • {persona.city ? `${persona.city}, ` : ''}{persona.country}
                      </p>
                    </div>
                  </button>
                  <div className="ml-1 flex items-center gap-1 border-l border-slate-200 pl-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPersona(persona)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
                      title="Edit Buyer Persona"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {confirmDeleteId === persona.id ? (
                      <button
                        type="button"
                        onClick={() => handleDeletePersona(persona.id)}
                        className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(persona.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                        title="Delete Buyer Persona"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Identity Switcher -> Start Chat with any Registered Supplier */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 sm:p-3 overflow-hidden">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:flex xl:flex-row xl:items-center min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 shrink-0 md:col-span-2 xl:col-span-1">
              <MessageSquarePlus className="h-4 w-4 text-blue-600 shrink-0" /> Start / Open Thread:
            </span>
            <select
              value={switcherIdentityId}
              onChange={e => setSwitcherIdentityId(e.target.value)}
              className="w-full min-w-0 max-w-full xl:flex-1 truncate rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Buyer Identity --</option>
              {identities.map(i => (
                <option key={i.id} value={i.id}>
                  {getCountryFlag(i.country)} {i.buyerName} — {i.companyName} ({i.country})
                </option>
              ))}
            </select>
            <span className="hidden text-xs font-bold text-slate-400 xl:inline shrink-0">→</span>
            <select
              value={switcherSupplierId}
              onChange={e => setSwitcherSupplierId(e.target.value)}
              className="w-full min-w-0 max-w-full xl:flex-1 truncate rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Registered Supplier --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.companyName} ({s.name} • {s.country} • {s.role})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!switcherIdentityId || !switcherSupplierId || startingThread}
              onClick={handleStartConversation}
              className="inline-flex w-full md:col-span-2 xl:w-auto shrink-0 whitespace-nowrap items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:bg-slate-300"
            >
              {startingThread ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessagesSquare className="h-3.5 w-3.5" />}
              <span>Open Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Left Thread List + Center Active Chat Window */}
      <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[min(74vh,720px)] lg:min-h-[540px] lg:grid-cols-12">
        {/* LEFT SIDEBAR: Multi-Thread Conversation Inbox */}
        <div className="flex min-w-0 min-h-0 flex-col border-b border-slate-200 bg-slate-50/70 lg:col-span-4 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 bg-white p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                <Users className="h-4 w-4 text-blue-600" /> Supplier Threads
              </h3>
              {totalUnreadCount > 0 && (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {totalUnreadCount} unread
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
                placeholder="Search supplier, company, or persona..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            {filterIdentityId !== 'ALL' && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                <span>
                  Filtered: {identities.find(i => i.id === filterIdentityId)?.buyerName || 'Persona'}
                </span>
                <button
                  type="button"
                  onClick={() => setFilterIdentityId('ALL')}
                  className="underline hover:text-blue-900"
                >
                  Show All
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 max-h-[260px] sm:max-h-[320px] lg:max-h-none divide-y divide-slate-200/70 overflow-y-auto overflow-x-hidden">
            {loadingInitial ? (
              <div className="flex items-center justify-center py-14 text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" /> Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <MessagesSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No active supplier chats yet</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Pick a Buyer Identity and a Registered Supplier above and click &ldquo;Open Chat&rdquo; to start.
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === selectedConvId;
                const unread = conv.unreadForAdmin ?? conv.unreadCount ?? 0;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full px-3.5 py-3 text-left transition ${
                      isSelected
                        ? 'border-l-4 border-l-blue-600 bg-blue-50/70'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-extrabold text-slate-900">
                            {conv.supplierCompany || conv.supplierName}
                          </span>
                          {unread > 0 && (
                            <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-slate-500">
                          {conv.supplierName} {conv.supplierCountry ? `• ${conv.supplierCountry}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-slate-400">
                        {formatChatTime(conv.updatedAt)}
                      </span>
                    </div>

                    {/* Persona Badge */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        <span>{getCountryFlag(conv.identity?.country)}</span>
                        <span>Acting as: {conv.identity?.buyerName || 'Buyer'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        {conv.showPhone || conv.showEmail || conv.showCompany ? (
                          <Eye className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-amber-500" />
                        )}
                      </span>
                    </div>

                    {conv.lastMessage && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-600">
                        {conv.lastMessageSenderRole === 'buyer_identity' && (
                          <MessageReadStatus
                            isRead={Boolean(conv.lastMessageIsRead)}
                            variant="compact"
                            recipientLabel="supplier"
                          />
                        )}
                        <p className="truncate">{conv.lastMessage}</p>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER CHAT WINDOW */}
        <div className="flex min-w-0 min-h-0 flex-col lg:col-span-8">
          {!activeConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 text-center text-slate-500">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MessagesSquare className="h-7 w-7" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Select or Start a Supplier Conversation
              </h4>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Each conversation lets you act as your chosen international Buyer Identity, toggle Phone/Email/Company visibility live, and exchange Images, Videos, and PDF documents.
              </p>
            </div>
          ) : (
            <>
              {/* Active Chat Header + Live Privacy Controls */}
              <div className="border-b border-slate-200 bg-white px-3 sm:px-4 py-3 sm:py-3.5 min-w-0">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between min-w-0">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="text-sm font-extrabold text-slate-900 break-words">
                        {activeConversation.supplierCompany || activeConversation.supplierName}
                      </span>
                      {activeConversation.supplierCountry && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {getCountryFlag(activeConversation.supplierCountry)} {activeConversation.supplierCountry}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                        <UserCheck className="h-3 w-3 shrink-0" /> Acting as: {activeFullIdentity?.buyerName || activeConversation.identity?.buyerName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 break-words">
                      Persona: {activeFullIdentity?.companyName || activeConversation.identity?.companyName} •{' '}
                      {activeFullIdentity?.phone || activeConversation.identity?.phone} •{' '}
                      {activeFullIdentity?.email || activeConversation.identity?.email}
                    </p>
                  </div>

                  {/* Per-Chat Privacy Visibility Toggles */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={togglingKey === 'showPhone'}
                      onClick={() => handleTogglePrivacy('showPhone')}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                        activeConversation.showPhone
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                      title="Toggle Buyer Phone visibility for this supplier"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Phone: {activeConversation.showPhone ? 'Visible' : 'Hidden'}</span>
                      {activeConversation.showPhone ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      type="button"
                      disabled={togglingKey === 'showEmail'}
                      onClick={() => handleTogglePrivacy('showEmail')}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                        activeConversation.showEmail
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                      title="Toggle Buyer Email visibility for this supplier"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email: {activeConversation.showEmail ? 'Visible' : 'Hidden'}</span>
                      {activeConversation.showEmail ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      type="button"
                      disabled={togglingKey === 'showCompany'}
                      onClick={() => handleTogglePrivacy('showCompany')}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                        activeConversation.showCompany
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                      title="Toggle Buyer Company & Exact Address visibility for this supplier"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Company & Addr: {activeConversation.showCompany ? 'Visible' : 'Hidden'}</span>
                      {activeConversation.showCompany ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 bg-slate-50 px-3 sm:px-4 py-1.5 text-[11px] text-slate-600">
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  Supplier view privacy: Phone is{' '}
                  <strong>{activeConversation.showPhone ? 'UNMASKED' : 'MASKED'}</strong>, Email is{' '}
                  <strong>{activeConversation.showEmail ? 'UNMASKED' : 'MASKED'}</strong>, Company/Address is{' '}
                  <strong>{activeConversation.showCompany ? 'UNMASKED' : 'MASKED'}</strong>.
                </span>
                <span className="text-[10px] text-slate-400">Changes sync live to supplier</span>
              </div>

              {/* Messages List */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-[280px] sm:min-h-[320px] max-h-[55vh] lg:max-h-none space-y-3 overflow-y-auto overflow-x-hidden bg-slate-50/40 p-3 sm:p-4"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12 text-xs text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" /> Loading chat history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-600">
                      No messages yet with {activeConversation.supplierCompany || activeConversation.supplierName}
                    </p>
                    <p className="mt-1 text-[11px]">
                      Send an opening inquiry as {activeFullIdentity?.buyerName || 'this buyer identity'} or share product specs / PDF / video below.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isBuyerIdentity = msg.senderRole === 'buyer_identity';
                    return (
                      <div
                        key={msg.id}
                        data-chat-message-id={msg.id}
                        className={`flex min-w-0 ${isBuyerIdentity ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`min-w-0 max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-xs sm:max-w-[75%] overflow-hidden ${
                            isBuyerIdentity
                              ? 'rounded-br-sm bg-blue-600 text-white'
                              : 'rounded-bl-sm border border-slate-200 bg-white text-slate-900'
                          }`}
                        >
                          <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold ${isBuyerIdentity ? 'text-blue-100' : 'text-slate-500'}`}>
                            <span>
                              {isBuyerIdentity
                                ? `${activeFullIdentity?.buyerName || activeConversation.identity?.buyerName || 'Buyer Identity'}`
                                : activeConversation.supplierName}
                            </span>
                            <span>•</span>
                            <span>{formatChatTime(msg.createdAt)}</span>
                          </div>

                          <ChatMediaBubbleContent message={msg} isOwnMessage={isBuyerIdentity} />

                          {msg.messageText && (
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {msg.messageText}
                            </p>
                          )}

                          {isBuyerIdentity ? (
                            <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                              {msg.emailAlertSent && (
                                <span
                                  className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-100"
                                  title={
                                    msg.emailAlertSentAt
                                      ? `1-minute unseen alert emailed at ${new Date(msg.emailAlertSentAt).toLocaleString()}`
                                      : '1-minute unseen alert email sent to supplier'
                                  }
                                >
                                  <BellRing className="h-2.5 w-2.5" /> 1m Alert Sent
                                </span>
                              )}
                              <MessageReadStatus
                                isRead={Boolean(msg.isRead)}
                                readAt={msg.readAt}
                                variant="bubble"
                                recipientLabel="supplier"
                              />
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-slate-400">
                              {msg.emailAlertSent && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700 border border-amber-200">
                                  <BellRing className="h-2.5 w-2.5" /> 1m Admin Alert Sent
                                </span>
                              )}
                              <span>{msg.isRead ? 'Seen' : 'Unseen'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Rich Media Composer */}
              <ChatMediaComposer
                sending={sendingMessage}
                placeholder={`Reply as ${activeFullIdentity?.buyerName || activeConversation.identity?.buyerName || 'Buyer'}...`}
                onSend={handleSendAdminMessage}
              />
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Buyer Identity Modal */}
      {personaModalOpen && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setPersonaModalOpen(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-5 py-3.5 sm:py-4">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-5 w-5 shrink-0 text-blue-600" />
                <h3 className="truncate text-sm sm:text-base font-extrabold text-slate-900">
                  {personaForm.id ? 'Edit Buyer Identity' : 'Create New Buyer Identity'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPersonaModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersona} className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
              {personaError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {personaError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Buyer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={personaForm.buyerName}
                    onChange={e => setPersonaForm(p => ({ ...p, buyerName: e.target.value }))}
                    placeholder="e.g., Marcus Vance"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Company / Import Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={personaForm.companyName}
                    onChange={e => setPersonaForm(p => ({ ...p, companyName: e.target.value }))}
                    placeholder="e.g., Pacific Timber & Stone LLC"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={personaForm.country}
                    onChange={e => setPersonaForm(p => ({ ...p, country: e.target.value }))}
                    placeholder="e.g., United States"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    City / Port
                  </label>
                  <input
                    type="text"
                    value={personaForm.city}
                    onChange={e => setPersonaForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="e.g., Seattle, WA"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={personaForm.phone}
                    onChange={e => setPersonaForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g., +1 206-555-0194"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Business Email Address
                  </label>
                  <input
                    type="email"
                    value={personaForm.email}
                    onChange={e => setPersonaForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="e.g., marcus.vance@pacifictimberstone.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Product Interest / Category
                </label>
                <input
                  type="text"
                  value={personaForm.productInterest}
                  onChange={e => setPersonaForm(p => ({ ...p, productInterest: e.target.value }))}
                  placeholder="e.g., Black Jade, Minerals, Industrial Stone"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Exact Street / Port Warehouse Address (Hidden by default)
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={personaForm.address}
                    onChange={e => setPersonaForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="e.g., 1420 Harbor Island Way, Suite 410, Seattle, WA"
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPersonaModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPersona}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {savingPersona && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{personaForm.id ? 'Save Changes' : 'Save Buyer Identity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
