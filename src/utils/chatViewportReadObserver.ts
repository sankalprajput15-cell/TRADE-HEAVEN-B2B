import { markChatMessagesRead } from '../services/multiIdentityChatService';
import { ChatMessageSenderRole } from '../types';

export function setupChatViewportReadObserver(
  containerEl: HTMLElement | null,
  conversationId: string | null,
  readerRole: ChatMessageSenderRole,
  onMessagesMarkedRead?: () => void,
  options?: { authToken?: string; enabled?: boolean }
): () => void {
  if (!containerEl || !conversationId || options?.enabled === false) return () => {};

  let timeoutId: number | null = null;

  const triggerMarkRead = () => {
    if (!conversationId || options?.enabled === false) return;
    void markChatMessagesRead(conversationId, readerRole, options?.authToken)
      .then(res => {
        if (res && res.updatedCount > 0 && !res.skippedUnauthenticated) {
          onMessagesMarkedRead?.();
        }
      })
      .catch(() => {});
  };

  // Trigger immediately on mount/open
  triggerMarkRead();

  const handleScrollOrResize = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      triggerMarkRead();
    }, 250);
  };

  containerEl.addEventListener('scroll', handleScrollOrResize, { passive: true });
  window.addEventListener('resize', handleScrollOrResize, { passive: true });

  const observer = new IntersectionObserver(
    entries => {
      const hasVisibleUnread = entries.some(entry => entry.isIntersecting);
      if (hasVisibleUnread) {
        triggerMarkRead();
      }
    },
    {
      root: containerEl,
      threshold: 0.1
    }
  );

  const messageElements = containerEl.querySelectorAll('[data-chat-message-id]');
  messageElements.forEach(el => observer.observe(el));

  return () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    containerEl.removeEventListener('scroll', handleScrollOrResize);
    window.removeEventListener('resize', handleScrollOrResize);
    observer.disconnect();
  };
}
