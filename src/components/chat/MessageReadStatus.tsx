import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageReadStatusProps {
  isRead: boolean;
  readAt?: string;
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
  variant = 'bubble',
  recipientLabel = 'recipient',
  showLabel = true
}) => {
  const formattedTime = formatReadTimestamp(readAt);

  if (variant === 'compact') {
    return isRead ? (
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
        title={`Sent • Unseen by ${recipientLabel}`}
        className="inline-flex shrink-0 items-center text-slate-400"
      >
        <Check className="h-3.5 w-3.5 text-slate-400" aria-label="Sent" />
      </span>
    );
  }

  return (
    <div
      data-testid={isRead ? 'is-read-status-read' : 'is-read-status-sent'}
      className="mt-1 flex items-center justify-end gap-1 text-[10px]"
      title={
        isRead
          ? `Seen by ${recipientLabel}${formattedTime ? ` at ${formattedTime}` : ''}`
          : `Sent • Unseen by ${recipientLabel}`
      }
    >
      {isRead ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 font-bold text-blue-600 shadow-2xs">
          <CheckCheck className="h-3.5 w-3.5 text-blue-600" aria-label="Read" />
          {showLabel && (
            <span>Seen{formattedTime ? ` • ${formattedTime}` : ''}</span>
          )}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-blue-100/90">
          <Check className="h-3.5 w-3.5 text-blue-100/90" aria-label="Sent" />
          {showLabel && <span>Sent</span>}
        </span>
      )}
    </div>
  );
};
