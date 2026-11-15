import {
  AdminBuyerIdentity,
  ChatConversation,
  ChatMediaUploadResult,
  ChatMessageSenderRole,
  ChatMediaType,
  MultiChatMessage
} from '../types';

const API_BASE = '/api.php';

export const ALLOWED_CHAT_MEDIA_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.mp4',
  '.webm',
  '.mov',
  '.pdf'
];

export const MAX_CHAT_MEDIA_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export function formatChatMediaSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateChatMediaFile(file: File): { valid: boolean; error?: string; mediaType?: ChatMediaType } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  const lowerName = (file.name || '').toLowerCase();
  const extMatch = ALLOWED_CHAT_MEDIA_EXTENSIONS.find(ext => lowerName.endsWith(ext));
  if (!extMatch) {
    return {
      valid: false,
      error: 'Unsupported format. Allowed: Images (.jpg, .png, .webp), Videos (.mp4, .webm, .mov), PDF (.pdf).'
    };
  }
  if (file.size > MAX_CHAT_MEDIA_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatChatMediaSize(file.size)}) exceeds the 50 MB maximum limit.`
    };
  }
  let mediaType: ChatMediaType = 'image';
  if (['.mp4', '.webm', '.mov'].includes(extMatch)) {
    mediaType = 'video';
  } else if (extMatch === '.pdf') {
    mediaType = 'pdf';
  }
  return { valid: true, mediaType };
}

const CHAT_BROADCAST_CHANNEL = 'tradeheaven_chat_events';

function emitLocalChatBroadcast(type: string, payload: any) {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(CHAT_BROADCAST_CHANNEL);
    bc.postMessage({ type, payload, timestamp: new Date().toISOString() });
    bc.close();
  } catch {}
}

async function postChatAction<T = any>(
  action: string,
  payload: Record<string, any>,
  authToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    cache: 'no-store',
    headers,
    body: JSON.stringify({ action, ...payload })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false || data?.status === 'error') {
    const err: any = new Error(data?.message || `Chat API action "${action}" failed`);
    err.status = res.status;
    err.code = data?.code;
    err.quota = data?.quota || data?.data;
    if (data?.code === 'FREE_MEMBER_DAILY_MESSAGE_LIMIT' && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('tradeheaven_free_message_quota_updated', { detail: err.quota }));
      } catch {}
    }
    throw err;
  }
  return data as T;
}

const cachedBuyerIdentities: AdminBuyerIdentity[] = [];
const cachedConversationsByKey = new Map<string, ChatConversation[]>();
const cachedMessagesByConvId = new Map<string, MultiChatMessage[]>();

async function fetchJsonWithRetry(url: string, init: RequestInit): Promise<any> {
  let lastErr: any;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, init);
      return await res.json().catch(() => ({}));
    } catch (err) {
      lastErr = err;
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }
  throw lastErr;
}

export async function fetchBuyerIdentities(): Promise<AdminBuyerIdentity[]> {
  try {
    const json = await fetchJsonWithRetry(`${API_BASE}?action=get_buyer_identities&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
    if (Array.isArray(json?.data)) {
      cachedBuyerIdentities.splice(0, cachedBuyerIdentities.length, ...json.data);
      return json.data;
    }
    return [...cachedBuyerIdentities];
  } catch {
    return [...cachedBuyerIdentities];
  }
}

export async function createBuyerIdentity(
  payload: Omit<AdminBuyerIdentity, 'id' | 'createdAt'>
): Promise<AdminBuyerIdentity> {
  const json = await postChatAction<{ data: AdminBuyerIdentity }>('create_buyer_identity', payload);
  emitLocalChatBroadcast('chat:identity_updated', { identity: json.data });
  return json.data;
}

export async function updateBuyerIdentity(
  payload: Partial<AdminBuyerIdentity> & { id: string }
): Promise<AdminBuyerIdentity> {
  const json = await postChatAction<{ data: AdminBuyerIdentity }>('update_buyer_identity', payload);
  emitLocalChatBroadcast('chat:identity_updated', { identity: json.data });
  return json.data;
}

export async function deleteBuyerIdentity(id: string): Promise<void> {
  await postChatAction('delete_buyer_identity', { id });
  emitLocalChatBroadcast('chat:identity_deleted', { id });
}

export async function fetchChatConversations(options: {
  viewMode: 'admin' | 'supplier';
  supplierId?: string;
  supplierEmail?: string;
}): Promise<ChatConversation[]> {
  const params = new URLSearchParams({
    action: 'get_chat_conversations',
    view_mode: options.viewMode,
    _t: String(Date.now())
  });
  if (options.supplierId) params.set('supplier_id', options.supplierId);
  if (options.supplierEmail) params.set('supplier_email', options.supplierEmail);
  const cacheKey = `${options.viewMode}:${options.supplierId || ''}:${options.supplierEmail || ''}`;

  try {
    const json = await fetchJsonWithRetry(`${API_BASE}?${params.toString()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
    if (Array.isArray(json?.data)) {
      cachedConversationsByKey.set(cacheKey, json.data);
      return json.data;
    }
    return cachedConversationsByKey.get(cacheKey) || [];
  } catch {
    return cachedConversationsByKey.get(cacheKey) || [];
  }
}

export async function createOrGetChatConversation(payload: {
  identityId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierCompany?: string;
  supplierCountry?: string;
}): Promise<ChatConversation> {
  const json = await postChatAction<{ data: ChatConversation }>('create_chat_conversation', payload);
  emitLocalChatBroadcast('chat:conversation_created', {
    conversationId: json.data?.id,
    supplierId: payload.supplierId,
    identityId: payload.identityId
  });
  return json.data;
}

export async function toggleChatVisibility(payload: {
  conversationId: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showCompany?: boolean;
}): Promise<{ conversationId: string; showPhone: boolean; showEmail: boolean; showCompany: boolean }> {
  const json = await postChatAction<{
    data: { conversationId: string; showPhone: boolean; showEmail: boolean; showCompany: boolean };
  }>('toggle_chat_visibility', payload);
  emitLocalChatBroadcast('chat:visibility_updated', json.data);
  return json.data;
}

export async function fetchChatMessages(
  conversationId: string,
  readerRole?: ChatMessageSenderRole,
  authToken?: string
): Promise<MultiChatMessage[]> {
  const params = new URLSearchParams({
    action: 'get_chat_messages',
    conversation_id: conversationId,
    _t: String(Date.now())
  });
  if (readerRole) params.set('reader_role', readerRole);
  const headers: Record<string, string> = { Accept: 'application/json', 'Cache-Control': 'no-cache' };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  try {
    const json = await fetchJsonWithRetry(`${API_BASE}?${params.toString()}`, {
      cache: 'no-store',
      headers
    });
    if (Array.isArray(json?.data)) {
      cachedMessagesByConvId.set(conversationId, json.data);
      return json.data;
    }
    return cachedMessagesByConvId.get(conversationId) || [];
  } catch {
    return cachedMessagesByConvId.get(conversationId) || [];
  }
}

export async function markChatMessagesRead(
  conversationId: string,
  readerRole: ChatMessageSenderRole,
  authToken?: string
): Promise<{
  conversationId: string;
  readerRole: ChatMessageSenderRole;
  readSenderRole: ChatMessageSenderRole;
  updatedCount: number;
  readAt: string;
  skippedUnauthenticated?: boolean;
}> {
  const json = await postChatAction<{
    data: {
      conversationId: string;
      readerRole: ChatMessageSenderRole;
      readSenderRole: ChatMessageSenderRole;
      updatedCount: number;
      readAt: string;
      skippedUnauthenticated?: boolean;
    };
  }>('mark_chat_read', { conversationId, readerRole }, authToken);
  if (json.data?.updatedCount > 0 && !json.data?.skippedUnauthenticated) {
    emitLocalChatBroadcast('chat:messages_read', json.data);
  }
  return json.data;
}

export interface VerifiedEmailAlertRecord {
  messageId: string;
  conversationId: string;
  supplierEmail: string;
  supplierMailAccepted: boolean;
  adminCopyRecipients: string[];
  adminCopyAccepted: boolean;
  deliveryMode: 'LIVE_SMTP' | 'PHP_MAIL_RELAY' | 'UNCONFIGURED';
  sentAt: string;
  error?: string;
}

export interface ChatThreadInsight {
  conversationId: string;
  supplierId: string;
  supplierEmail: string;
  hasVerifiedLogin: boolean;
  isCurrentlyOnline: boolean;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  loginCount: number;
  verifiedMessageIds: string[];
  lastVerifiedReadAt: string | null;
  lastVerifiedReadByEmail: string | null;
  verifiedEmailsByLogin: string[];
  verifiedConvReadIds: string[];
  smtpConfigured?: boolean;
  adminAlertRecipients?: string[];
  emailAlertReceiptsByMsgId?: Record<string, VerifiedEmailAlertRecord>;
}

export async function reverifyChatEmailAlert(payload: {
  conversationId: string;
  messageId: string;
  messageText?: string;
  supplierEmail?: string;
  supplierName?: string;
  supplierCompany?: string;
  buyerName?: string;
  buyerCountry?: string;
}): Promise<{ success: boolean; data?: VerifiedEmailAlertRecord; message?: string }> {
  const res = await fetch('/api/v1/admin/chat-reverify-email-alert', {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => ({}));
  return {
    success: Boolean(res.ok && json?.success),
    data: json?.data,
    message: json?.message
  };
}

export async function fetchChatThreadInsight(params: {
  conversationId: string;
  supplierEmail?: string;
  supplierId?: string;
}): Promise<ChatThreadInsight | null> {
  try {
    const qs = new URLSearchParams({
      conversation_id: params.conversationId,
      _t: String(Date.now())
    });
    if (params.supplierEmail) qs.set('supplier_email', params.supplierEmail);
    if (params.supplierId) qs.set('supplier_id', params.supplierId);
    const res = await fetch(`/api/v1/admin/chat-thread-insight?${qs.toString()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
    const json = await res.json().catch(() => ({}));
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function processUnseenChatAlerts(
  minAgeSeconds = 60,
  options?: { manualTrigger?: boolean; conversationId?: string }
): Promise<{
  processedCount: number;
  alertsSent: number;
  supplierAlerts: number;
  adminAlerts: number;
  adminCopiesSent?: number;
  failedCount?: number;
  checkedConversations?: number;
  checkedMessages?: number;
  smtpVerified?: boolean;
  messageIds?: string[];
  details: Array<{
    conversationId: string;
    targetRole: 'supplier' | 'admin' | 'admin_copy';
    recipient: string;
    subject: string;
    messageCount: number;
    supplierMailAccepted?: boolean;
    adminCopyAccepted?: boolean;
    deliveryMode?: string;
    error?: string;
  }>;
}> {
  const json = await postChatAction<{ data: any }>('process_unseen_alerts', {
    minAgeSeconds,
    manualTrigger: Boolean(options?.manualTrigger),
    conversationId: options?.conversationId || ''
  });
  return json.data;
}

export async function sendChatMessage(payload: {
  conversationId: string;
  senderRole: ChatMessageSenderRole;
  messageText?: string;
  mediaType?: ChatMediaType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  supplierId?: string;
  supplierEmail?: string;
  authToken?: string;
}): Promise<MultiChatMessage> {
  const { authToken, ...bodyPayload } = payload;
  const json = await postChatAction<{ data: MultiChatMessage }>('send_chat_message', bodyPayload, authToken);
  emitLocalChatBroadcast('chat:new_message', {
    conversationId: payload.conversationId,
    message: json.data
  });
  if (payload.senderRole === 'supplier' && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('tradeheaven_free_message_quota_updated'));
    } catch {}
  }
  return json.data;
}

export function uploadChatMedia(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ChatMediaUploadResult> {
  const validation = validateChatMediaFile(file);
  if (!validation.valid) {
    return Promise.reject(new Error(validation.error || 'Invalid file'));
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}?action=upload_chat_media`, true);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && parsed?.success && parsed?.mediaUrl) {
          onProgress?.(100);
          resolve({
            success: true,
            mediaType: parsed.mediaType || validation.mediaType || 'image',
            mediaUrl: parsed.mediaUrl,
            mediaName: parsed.mediaName || file.name,
            mediaSize: Number(parsed.mediaSize || file.size),
            mimeType: parsed.mimeType
          });
        } else {
          reject(new Error(parsed?.message || `Upload failed (HTTP ${xhr.status})`));
        }
      } catch {
        reject(new Error('Invalid JSON response from media upload endpoint.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading media attachment.'));
    };

    xhr.send(formData);
  });
}

export interface ChatSocketEvent {
  type:
    | 'chat:connected'
    | 'chat:new_message'
    | 'chat:visibility_updated'
    | 'chat:conversation_created'
    | 'chat:identity_updated'
    | 'chat:identity_deleted'
    | 'chat:messages_read'
    | 'chat:alerts_processed'
    | string;
  payload?: any;
  timestamp?: string;
}

export function subscribeMultiIdentityChatEvents(
  onEvent: (evt: ChatSocketEvent) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let ws: WebSocket | null = null;
  let sse: EventSource | null = null;
  let bc: BroadcastChannel | null = null;
  let closedByCaller = false;
  let reconnectTimer: number | null = null;
  let sseReconnectTimer: number | null = null;
  let pingTimer: number | null = null;
  let attempt = 0;

  // Deduplicate identical events delivered simultaneously by WS, SSE, and BroadcastChannel
  const recentKeys = new Map<string, number>();
  const dispatch = (evt: ChatSocketEvent) => {
    if (!evt || !evt.type || evt.type === 'pong') return;
    if (evt.type !== 'chat:connected') {
      const fingerprint = `${evt.type}:${evt.payload?.message?.id || evt.payload?.conversationId || evt.payload?.identity?.id || evt.payload?.id || ''}:${evt.timestamp || ''}`;
      const now = Date.now();
      const prevAt = recentKeys.get(fingerprint);
      if (prevAt && now - prevAt < 1500) return;
      recentKeys.set(fingerprint, now);
      if (recentKeys.size > 100) {
        for (const [k, ts] of recentKeys.entries()) {
          if (now - ts > 4000) recentKeys.delete(k);
        }
      }
    }
    onEvent(evt);
  };

  // 1. Cross-tab BroadcastChannel for instant multi-tab Chrome updates
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(CHAT_BROADCAST_CHANNEL);
      bc.onmessage = (msgEvt) => {
        const parsed = msgEvt.data;
        if (parsed && parsed.type) {
          dispatch(parsed);
        }
      };
    } catch {}
  }

  // 2. Server-Sent Events (/api/v1/chat/stream) — works reliably through HTTPS/HTTP2 proxies
  const connectSse = () => {
    if (closedByCaller || typeof EventSource === 'undefined') return;
    try {
      sse = new EventSource('/api/v1/chat/stream');
      sse.onmessage = (msgEvt) => {
        try {
          const parsed = JSON.parse(String(msgEvt.data || '{}'));
          dispatch(parsed);
        } catch {}
      };
      sse.onerror = () => {
        try {
          sse?.close();
        } catch {}
        sse = null;
        if (!closedByCaller && !sseReconnectTimer) {
          sseReconnectTimer = window.setTimeout(() => {
            sseReconnectTimer = null;
            connectSse();
          }, 3000);
        }
      };
    } catch {}
  };

  // 3. WebSocket (/ws/chat)
  const connectWs = () => {
    if (closedByCaller) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws/chat`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        attempt = 0;
        if (pingTimer) window.clearInterval(pingTimer);
        pingTimer = window.setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping' }));
            } catch {}
          }
        }, 25000);
      };

      ws.onmessage = (msgEvt) => {
        try {
          const parsed = JSON.parse(String(msgEvt.data || '{}'));
          dispatch(parsed);
        } catch {}
      };

      ws.onclose = () => {
        if (pingTimer) {
          window.clearInterval(pingTimer);
          pingTimer = null;
        }
        if (!closedByCaller) {
          attempt = Math.min(attempt + 1, 6);
          const delay = Math.min(15000, 1000 * Math.pow(1.6, attempt));
          reconnectTimer = window.setTimeout(connectWs, delay);
        }
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {}
      };
    } catch {
      if (!closedByCaller) {
        reconnectTimer = window.setTimeout(connectWs, 4000);
      }
    }
  };

  connectSse();
  connectWs();

  return () => {
    closedByCaller = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    if (sseReconnectTimer) window.clearTimeout(sseReconnectTimer);
    if (pingTimer) window.clearInterval(pingTimer);
    try {
      ws?.close();
    } catch {}
    try {
      sse?.close();
    } catch {}
    try {
      bc?.close();
    } catch {}
  };
}
