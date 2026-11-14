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

async function postChatAction<T = any>(action: string, payload: Record<string, any>): Promise<T> {
  const res = await fetch(`${API_BASE}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ action, ...payload })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false || data?.status === 'error') {
    throw new Error(data?.message || `Chat API action "${action}" failed`);
  }
  return data as T;
}

export async function fetchBuyerIdentities(): Promise<AdminBuyerIdentity[]> {
  const res = await fetch(`${API_BASE}?action=get_buyer_identities&_t=${Date.now()}`, {
    headers: { Accept: 'application/json' }
  });
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? json.data : [];
}

export async function createBuyerIdentity(
  payload: Omit<AdminBuyerIdentity, 'id' | 'createdAt'>
): Promise<AdminBuyerIdentity> {
  const json = await postChatAction<{ data: AdminBuyerIdentity }>('create_buyer_identity', payload);
  return json.data;
}

export async function updateBuyerIdentity(
  payload: Partial<AdminBuyerIdentity> & { id: string }
): Promise<AdminBuyerIdentity> {
  const json = await postChatAction<{ data: AdminBuyerIdentity }>('update_buyer_identity', payload);
  return json.data;
}

export async function deleteBuyerIdentity(id: string): Promise<void> {
  await postChatAction('delete_buyer_identity', { id });
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

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? json.data : [];
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
  return json.data;
}

export async function fetchChatMessages(
  conversationId: string,
  readerRole?: ChatMessageSenderRole
): Promise<MultiChatMessage[]> {
  const params = new URLSearchParams({
    action: 'get_chat_messages',
    conversation_id: conversationId,
    _t: String(Date.now())
  });
  if (readerRole) params.set('reader_role', readerRole);
  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? json.data : [];
}

export async function markChatMessagesRead(
  conversationId: string,
  readerRole: ChatMessageSenderRole
): Promise<{
  conversationId: string;
  readerRole: ChatMessageSenderRole;
  readSenderRole: ChatMessageSenderRole;
  updatedCount: number;
  readAt: string;
}> {
  const json = await postChatAction<{
    data: {
      conversationId: string;
      readerRole: ChatMessageSenderRole;
      readSenderRole: ChatMessageSenderRole;
      updatedCount: number;
      readAt: string;
    };
  }>('mark_chat_read', { conversationId, readerRole });
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
}): Promise<MultiChatMessage> {
  const json = await postChatAction<{ data: MultiChatMessage }>('send_chat_message', payload);
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
    | string;
  payload?: any;
  timestamp?: string;
}

export function subscribeMultiIdentityChatEvents(
  onEvent: (evt: ChatSocketEvent) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let ws: WebSocket | null = null;
  let closedByCaller = false;
  let reconnectTimer: number | null = null;
  let pingTimer: number | null = null;
  let attempt = 0;

  const connect = () => {
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
          if (parsed && parsed.type && parsed.type !== 'pong') {
            onEvent(parsed);
          }
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
          reconnectTimer = window.setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {}
      };
    } catch {
      if (!closedByCaller) {
        reconnectTimer = window.setTimeout(connect, 4000);
      }
    }
  };

  connect();

  return () => {
    closedByCaller = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    if (pingTimer) window.clearInterval(pingTimer);
    try {
      ws?.close();
    } catch {}
  };
}
