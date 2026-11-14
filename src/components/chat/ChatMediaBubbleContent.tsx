import React, { useState } from 'react';
import { Download, Eye, FileText, Maximize2, X, Film } from 'lucide-react';
import { MultiChatMessage } from '../../types';
import { formatChatMediaSize } from '../../services/multiIdentityChatService';

interface ChatMediaBubbleContentProps {
  message: MultiChatMessage;
  isOwnMessage: boolean;
}

export const ChatMediaBubbleContent: React.FC<ChatMediaBubbleContentProps> = ({
  message,
  isOwnMessage
}) => {
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  if (!message.mediaUrl || message.mediaType === 'none') {
    return null;
  }

  if (message.mediaType === 'image') {
    return (
      <>
        <div className="mb-1.5">
          <button
            type="button"
            onClick={() => setImageZoomOpen(true)}
            className="group relative block overflow-hidden rounded-xl border border-black/10 bg-black/5 text-left focus:outline-none"
            title="Click to zoom image"
          >
            <img
              src={message.mediaUrl}
              alt={message.mediaName || 'Shared trade image'}
              className="max-h-60 w-full max-w-[220px] sm:max-w-[300px] rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white opacity-90 group-hover:opacity-100">
              <Maximize2 className="h-3 w-3" /> Zoom
            </span>
          </button>
          {message.mediaName && (
            <div className={`mt-1 flex items-center justify-between gap-2 text-[11px] ${isOwnMessage ? 'text-white/80' : 'text-slate-500'}`}>
              <span className="truncate max-w-[210px]">{message.mediaName}</span>
              <a
                href={message.mediaUrl}
                download={message.mediaName || 'image'}
                className={`inline-flex items-center gap-1 underline ${isOwnMessage ? 'text-white' : 'text-blue-600'}`}
              >
                <Download className="h-3 w-3" /> Save
              </a>
            </div>
          )}
        </div>

        {imageZoomOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
            onClick={() => setImageZoomOpen(false)}
          >
            <div
              className="relative flex max-h-[90vh] max-w-4xl flex-col items-center gap-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex w-full items-center justify-between gap-4 text-white">
                <span className="truncate text-sm font-semibold">
                  {message.mediaName || 'Image Attachment'}
                  {message.mediaSize ? ` (${formatChatMediaSize(message.mediaSize)})` : ''}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={message.mediaUrl}
                    download={message.mediaName || 'chat-image'}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                  <button
                    type="button"
                    onClick={() => setImageZoomOpen(false)}
                    className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/25"
                    aria-label="Close image preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <img
                src={message.mediaUrl}
                alt={message.mediaName || 'Full size preview'}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  if (message.mediaType === 'video') {
    return (
      <div className="mb-1.5 w-full max-w-[240px] sm:max-w-[340px]">
        <div className="overflow-hidden rounded-xl border border-black/15 bg-slate-950">
          <video
            src={message.mediaUrl}
            controls
            preload="metadata"
            playsInline
            className="max-h-60 w-full rounded-xl bg-black"
          />
        </div>
        <div className={`mt-1 flex items-center justify-between gap-2 text-[11px] ${isOwnMessage ? 'text-white/80' : 'text-slate-500'}`}>
          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
            <Film className="h-3 w-3 shrink-0" />
            {message.mediaName || 'Video clip'}
            {message.mediaSize ? ` • ${formatChatMediaSize(message.mediaSize)}` : ''}
          </span>
          <a
            href={message.mediaUrl}
            download={message.mediaName || 'video.mp4'}
            className={`inline-flex items-center gap-1 font-medium underline ${isOwnMessage ? 'text-white' : 'text-blue-600'}`}
          >
            <Download className="h-3 w-3" /> Download
          </a>
        </div>
      </div>
    );
  }

  // PDF Document Card
  return (
    <>
      <div
        className={`mb-1.5 w-full max-w-[240px] sm:max-w-[290px] rounded-xl border p-2.5 sm:p-3 ${
          isOwnMessage
            ? 'border-white/20 bg-white/15 text-white'
            : 'border-slate-200 bg-slate-50 text-slate-800'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isOwnMessage ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
            }`}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">
              {message.mediaName || 'Trade_Document.pdf'}
            </p>
            <p className={`text-[11px] ${isOwnMessage ? 'text-white/75' : 'text-slate-500'}`}>
              PDF Document {message.mediaSize ? `• ${formatChatMediaSize(message.mediaSize)}` : ''}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPdfPreviewOpen(true)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
              isOwnMessage
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Preview PDF
          </button>
          <a
            href={message.mediaUrl}
            download={message.mediaName || 'document.pdf'}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
              isOwnMessage
                ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </a>
        </div>
      </div>

      {pdfPreviewOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => setPdfPreviewOpen(false)}
        >
          <div
            className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-rose-600" />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-900">
                    {message.mediaName || 'PDF Document Preview'}
                  </h4>
                  {message.mediaSize > 0 && (
                    <p className="text-xs text-slate-500">{formatChatMediaSize(message.mediaSize)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={message.mediaUrl}
                  download={message.mediaName || 'document.pdf'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setPdfPreviewOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                  aria-label="Close PDF preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={message.mediaUrl}
                title={message.mediaName || 'PDF Document'}
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
