import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthUser, ChatConversation, ChatMediaType, MultiChatMessage } from '../../types';
import {
  fetchChatConversations,
  fetchChatMessages,
  markChatMessagesRead,
  sendChatMessage,
  subscribeMultiIdentityChatEvents
} from '../../services/multiIdentityChatService';
import { ChatMediaBubbleContent } from '../chat/ChatMediaBubbleContent';
import { ChatMediaComposer } from '../chat/ChatMediaComposer';
import { MessageReadStatus } from '../chat/MessageReadStatus';
import { setupChatViewportReadObserver } from '../../utils/chatViewportReadObserver';
import {
  BadgeCheck,
  Building2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck
} from 'lucide-react';

interface SupplierMessagesInboxProps {
  currentUser: AuthUser | null;
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
  netherlands: '🇳🇱'
};

function getFlag(country?: string): string {
  return COUNTRY_FLAG_MAP[String(country || '').trim().toLowerCase()] || '🌐';
}

function formatMessageTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const SupplierMessagesInbox: React.FC<SupplierMessagesInboxProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messages, setMessages] = useState<MultiChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedConvIdRef = useRef<string>('');
  selectedConvIdRef.current = selectedConvId;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const supplierId = currentUser?.id || '';
  const supplierEmail = (currentUser?.email || '').trim().toLowerCase();

  const loadConversations = useCallback(async () => {
    try {
      const list = await fetchChatConversations({
        viewMode: 'supplier',
        supplierId,
        supplierEmail
      });
      setConversations(list);
      if (!selectedConvIdRef.current && list.length > 0) {
        setSelectedConvId(list[0].id);
      }
    } finally {
      setLoadingThreads(false);
    }
  }, [supplierId, supplierEmail]);

  const loadMessages = useCallback(async (convId: string, silent = false) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    if (!silent) setLoadingMsgs(true);
    try {
      const list = await fetchChatMessages(convId, 'supplier');
      setMessages(list);
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, unreadForSupplier: 0, unreadCount: 0 } : c
        )
      );
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConvId) {
      void loadMessages(selectedConvId);
    }
  }, [selectedConvId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedConvId]);

  // Viewport Intersection & Open Thread Read Observer for Supplier
  useEffect(() => {
    const container = messagesContainerRef.current;
    const convId = selectedConvId;
    if (!container || !convId) return;

    const cleanup = setupChatViewportReadObserver(
      container,
      convId,
      'supplier',
      () => {
        setMessages(prev =>
          prev.map(m =>
            m.senderRole === 'buyer_identity' && !m.isRead
              ? { ...m, isRead: true, readAt: new Date().toISOString() }
              : m
          )
        );
        setConversations(prev =>
          prev.map(c => (c.id === convId ? { ...c, unreadForSupplier: 0, unreadCount: 0 } : c))
        );
      }
    );
    return cleanup;
  }, [selectedConvId, messages.length]);

  // Mark incoming buyer messages as read when browser tab regains visibility/focus
  useEffect(() => {
    const syncVisibleRead = () => {
      const convId = selectedConvIdRef.current;
      if (!convId || document.visibilityState !== 'visible') return;
      const hasUnreadIncoming = messages.some(m => m.senderRole === 'buyer_identity' && !m.isRead);
      if (hasUnreadIncoming) {
        void markChatMessagesRead(convId, 'supplier').then(() => {
          setMessages(prev =>
            prev.map(m =>
              m.senderRole === 'buyer_identity' && !m.isRead
                ? { ...m, isRead: true, readAt: new Date().toISOString() }
                : m
            )
          );
          setConversations(prev =>
            prev.map(c => (c.id === convId ? { ...c, unreadForSupplier: 0, unreadCount: 0 } : c))
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

  useEffect(() => {
    const unsub = subscribeMultiIdentityChatEvents(evt => {
      if (evt.type === 'chat:new_message') {
        const msg: MultiChatMessage | undefined = evt.payload?.message;
        const convId = String(evt.payload?.conversationId || msg?.conversationId || '');
        if (convId && convId === selectedConvIdRef.current && msg) {
          const isIncomingAndVisible =
            msg.senderRole === 'buyer_identity' && document.visibilityState === 'visible';
          const normalizedMsg: MultiChatMessage = isIncomingAndVisible
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg;
          setMessages(prev =>
            prev.some(m => m.id === normalizedMsg.id) ? prev : [...prev, normalizedMsg]
          );
          if (isIncomingAndVisible) {
            void markChatMessagesRead(convId, 'supplier');
          }
        }
        void loadConversations();
      } else if (
        evt.type === 'chat:visibility_updated' ||
        evt.type === 'chat:conversation_created' ||
        evt.type === 'chat:identity_updated'
      ) {
        void loadConversations();
      } else if (evt.type === 'chat:messages_read') {
        const convId = String(evt.payload?.conversationId || '');
        const readSenderRole = String(evt.payload?.readSenderRole || '');
        const readAt = evt.payload?.readAt ? String(evt.payload.readAt) : new Date().toISOString();
        const targetSenderRole =
          readSenderRole ||
          (evt.payload?.readerRole === 'buyer_identity' ? 'supplier' : 'buyer_identity');

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
              if (evt.payload?.readerRole === 'supplier') {
                return { ...c, ...updateLast, unreadForSupplier: 0, unreadCount: 0 };
              }
              return { ...c, ...updateLast, unreadForAdmin: 0 };
            })
          );
        }
      }
    });
    return unsub;
  }, [loadConversations]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => {
      const idn = c.identity;
      return (
        (idn?.buyerName || '').toLowerCase().includes(q) ||
        (idn?.country || '').toLowerCase().includes(q) ||
        (idn?.productInterest || '').toLowerCase().includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  const activeConv = useMemo(
    () => conversations.find(c => c.id === selectedConvId) || null,
    [conversations, selectedConvId]
  );

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadForSupplier ?? c.unreadCount ?? 0), 0),
    [conversations]
  );

  const handleSendReply = async (payload: {
    messageText: string;
    mediaType: ChatMediaType;
    mediaUrl: string;
    mediaName: string;
    mediaSize: number;
  }) => {
    if (!activeConv) return;
    setSending(true);
    try {
      const sent = await sendChatMessage({
        conversationId: activeConv.id,
        senderRole: 'supplier',
        ...payload
      });
      setMessages(prev => (prev.some(m => m.id === sent.id) ? prev : [...prev, sent]));
      await loadConversations();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <MessagesSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Buyer Messages & Direct Inquiries
              {totalUnread > 0 && (
                <span className="ml-2 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {totalUnread} new
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Communicate directly with verified international buyers. Share factory photos, product videos, and PDF quotes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadConversations()}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Inbox
        </button>
      </div>

      {/* Main Inbox Grid */}
      <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[min(74vh,680px)] lg:min-h-[520px] lg:grid-cols-12">
        {/* Left Thread List */}
        <div className="flex min-w-0 min-h-0 flex-col border-b border-slate-200 bg-slate-50/70 lg:col-span-4 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 bg-white p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search buyer name, country, product..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 max-h-[260px] sm:max-h-[320px] lg:max-h-none divide-y divide-slate-200/70 overflow-y-auto overflow-x-hidden">
            {loadingThreads ? (
              <div className="flex items-center justify-center py-12 text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" /> Loading buyer threads...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <MessagesSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No buyer messages yet</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  When international buyers contact your company, their inquiries and shared files will appear right here.
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === selectedConvId;
                const unread = conv.unreadForSupplier ?? conv.unreadCount ?? 0;
                const buyer = conv.identity;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full px-3.5 py-3 text-left transition ${
                      isSelected ? 'border-l-4 border-l-blue-600 bg-blue-50/70' : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-base">
                          {getFlag(buyer?.country)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="truncate text-xs font-extrabold text-slate-900">
                              {buyer?.buyerName || 'International Buyer'}
                            </span>
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                            {unread > 0 && (
                              <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                {unread}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[11px] text-slate-500">
                            {buyer?.city ? `${buyer.city}, ` : ''}{buyer?.country || 'Global'}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatMessageTime(conv.updatedAt)}
                      </span>
                    </div>

                    {buyer?.productInterest && (
                      <p className="mt-1.5 truncate text-[10px] font-semibold text-blue-700">
                        Interest: {buyer.productInterest}
                      </p>
                    )}
                    {conv.lastMessage && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                        {conv.lastMessageSenderRole === 'supplier' && (
                          <MessageReadStatus
                            isRead={Boolean(conv.lastMessageIsRead)}
                            variant="compact"
                            recipientLabel="buyer"
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

        {/* Center Active Conversation */}
        <div className="flex min-w-0 min-h-0 flex-col lg:col-span-8">
          {!activeConv ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 text-center text-slate-500">
              <MessagesSquare className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-800">Select a Buyer Conversation</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Choose a buyer inquiry from the left inbox to view specifications, contact permissions, and reply with documents or media.
              </p>
            </div>
          ) : (
            <>
              {/* Buyer Identity Card Header (Respecting Privacy Toggles) */}
              <div className="border-b border-slate-200 bg-white p-3 sm:p-4 min-w-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between min-w-0">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl">
                      {getFlag(activeConv.identity?.country)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-900 break-words">
                          {activeConv.identity?.buyerName || 'Verified Buyer'}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3 shrink-0" /> Verified Buyer
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {activeConv.identity?.city ? `${activeConv.identity.city}, ` : ''}
                          {activeConv.identity?.country}
                        </span>
                      </div>
                      {activeConv.identity?.productInterest && (
                        <p className="mt-0.5 text-xs font-semibold text-blue-700 break-words">
                          Sourcing Interest: {activeConv.identity.productInterest}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buyer Contact Details Grid (Masked vs Unmasked Live) */}
                <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 sm:grid-cols-3 min-w-0">
                  <div className="flex min-w-0 items-start gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Phone / WhatsApp</p>
                      {activeConv.showPhone ? (
                        <p className="truncate text-xs font-bold text-slate-900">
                          {activeConv.identity?.phone || 'Not listed'}
                        </p>
                      ) : (
                        <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <Lock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{activeConv.identity?.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                      {activeConv.showEmail ? (
                        <p className="truncate text-xs font-bold text-slate-900">
                          {activeConv.identity?.email || 'Not listed'}
                        </p>
                      ) : (
                        <p className="inline-flex max-w-full items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <Lock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{activeConv.identity?.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-2">
                    <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Company & Address</p>
                      {activeConv.showCompany ? (
                        <div>
                          <p className="truncate text-xs font-bold text-slate-900">
                            {activeConv.identity?.companyName}
                          </p>
                          {activeConv.identity?.address && (
                            <p className="inline-flex items-center gap-1 truncate text-[11px] text-slate-600">
                              <MapPin className="h-3 w-3 shrink-0" /> {activeConv.identity.address}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <Lock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{activeConv.identity?.companyName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-[280px] sm:min-h-[320px] max-h-[55vh] lg:max-h-none space-y-3 overflow-y-auto overflow-x-hidden bg-slate-50/40 p-3 sm:p-4"
              >
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-10 text-xs text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" /> Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No messages in this conversation yet. Send your first response below.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderRole === 'supplier';
                    return (
                      <div
                        key={msg.id}
                        data-chat-message-id={msg.id}
                        className={`flex min-w-0 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`min-w-0 max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-xs sm:max-w-[75%] overflow-hidden ${
                            isOwn
                              ? 'rounded-br-sm bg-blue-600 text-white'
                              : 'rounded-bl-sm border border-slate-200 bg-white text-slate-900'
                          }`}
                        >
                          <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>
                            <span>
                              {isOwn ? currentUser?.companyName || currentUser?.name || 'You' : activeConv.identity?.buyerName || 'Buyer'}
                            </span>
                            <span>•</span>
                            <span>{formatMessageTime(msg.createdAt)}</span>
                          </div>

                          <ChatMediaBubbleContent message={msg} isOwnMessage={isOwn} />

                          {msg.messageText && (
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {msg.messageText}
                            </p>
                          )}

                          {isOwn ? (
                            <MessageReadStatus
                              isRead={Boolean(msg.isRead)}
                              readAt={msg.readAt}
                              variant="bubble"
                              recipientLabel="buyer"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
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

              {/* Composer */}
              <ChatMediaComposer
                sending={sending}
                placeholder={`Reply to ${activeConv.identity?.buyerName || 'buyer'} with quote details, images, video, or PDF...`}
                onSend={handleSendReply}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
