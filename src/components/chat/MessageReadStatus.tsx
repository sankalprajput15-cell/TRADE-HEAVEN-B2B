import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageReadStatusProps {
  isRead: boolean;
  readAt?: string;
  unconfirmedRead?: boolean;
  variant?: 'bubble' | 'compact';
  recipientLabel?: string;
  showLabel?: boolean;
}

function formatReadTimestamp(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const MessageReadStatus: React.FC<MessageReadStatusProps> = ({
  isRead,
  readAt,
  unconfirmedRead = false,
  variant = 'bubble',
  recipientLabel = 'recipient',
  showLabel = true
}) => {
  const formattedTime = formatReadTimestamp(readAt);
  const effectiveIsRead = Boolean(isRead && !unconfirmedRead);

  if (variant === 'compact') {
    return effectiveIsRead ? (
      <span
        data-testid="is-read-status-read"
        title={`Seen by ${recipientLabel}${formattedTime ? ` at ${formattedTime}` : ''}`}
        className="inline-flex shrink-0 items-center text-blue-600"
      >
        <CheckCheck className="h-3.5 w-3.5 text-blue-600" aria-label="Read" />
      </span>
    ) : (
      <span
        data-testid="is-read-status-sent"
        title={
          unconfirmedRead
            ? `Sent • No verified ${recipientLabel} login recorded`
            : `Sent • Unseen by ${recipientLabel}`
        }
        className="inline-flex shrink-0 items-center text-slate-400"
      >
        <Check className="h-3.5 w-3.5 text-slate-400" aria-label="Sent" />
      </span>
    );
  }

  return (
    <div
      data-testid={effectiveIsRead ? 'is-read-status-read' : 'is-read-status-sent'}
      className="mt-1 flex items-center justify-end gap-1 text-[10px]"
      title={
        effectiveIsRead
          ? `Seen by ${recipientLabel}${formattedTime ? ` at ${formattedTime}` : ''}`
          : unconfirmedRead
            ? `Delivered • Unconfirmed (No verified ${recipientLabel} login recorded)`
            : `Sent • Unseen by ${recipientLabel}`
      }
    >
      {effectiveIsRead ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 font-bold text-blue-600 shadow-2xs">
          <CheckCheck className="h-3.5 w-3.5 text-blue-600" aria-label="Read" />
          {showLabel && (
            <span>Seen{formattedTime ? ` • ${formattedTime}` : ''}</span>
          )}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-blue-100/90">
          <Check className="h-3.5 w-3.5 text-blue-100/90" aria-label="Sent" />
          {showLabel && (
            <span>{unconfirmedRead ? `Sent • No ${recipientLabel} login` : 'Sent'}</span>
          )}
        </span>
      )}
    </div>
  );
};
