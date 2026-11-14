import React, { useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Loader2, Paperclip, Send, Video, X } from 'lucide-react';
import { ChatMediaType } from '../../types';
import {
  formatChatMediaSize,
  uploadChatMedia,
  validateChatMediaFile
} from '../../services/multiIdentityChatService';

interface PendingMediaAttachment {
  mediaType: ChatMediaType;
  mediaUrl: string;
  mediaName: string;
  mediaSize: number;
}

interface ChatMediaComposerProps {
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  onSend: (payload: {
    messageText: string;
    mediaType: ChatMediaType;
    mediaUrl: string;
    mediaName: string;
    mediaSize: number;
  }) => Promise<void>;
}

export const ChatMediaComposer: React.FC<ChatMediaComposerProps> = ({
  disabled = false,
  sending = false,
  placeholder = 'Type your message, quotation terms, or attach Image / Video / PDF...',
  onSend
}) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<PendingMediaAttachment | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const anyFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const check = validateChatMediaFile(file);
    if (!check.valid) {
      setErrorMsg(check.error || 'Unsupported file.');
      return;
    }

    setErrorMsg(null);
    setUploading(true);
    setUploadProgress(5);
    try {
      const result = await uploadChatMedia(file, pct => setUploadProgress(pct));
      setAttachment({
        mediaType: result.mediaType,
        mediaUrl: result.mediaUrl,
        mediaName: result.mediaName,
        mediaSize: result.mediaSize
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload file. Max size 50MB.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || sending || uploading) return;
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    setErrorMsg(null);
    try {
      await onSend({
        messageText: trimmed,
        mediaType: attachment ? attachment.mediaType : 'none',
        mediaUrl: attachment ? attachment.mediaUrl : '',
        mediaName: attachment ? attachment.mediaName : '',
        mediaSize: attachment ? attachment.mediaSize : 0
      });
      setText('');
      setAttachment(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send message.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
      {/* Hidden native inputs scoped by media type */}
      <input
        ref={imageInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={anyFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {errorMsg && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="ml-2 text-rose-500 hover:text-rose-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {uploading && (
        <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-blue-700">
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading media to secure storage...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
            <div
              className="h-full bg-blue-600 transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {attachment && !uploading && (
        <div className="mb-2 flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {attachment.mediaType === 'image' && (
              <img
                src={attachment.mediaUrl}
                alt={attachment.mediaName}
                className="h-10 w-10 rounded-lg object-cover border border-emerald-200"
              />
            )}
            {attachment.mediaType === 'video' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Video className="h-4 w-4" />
              </div>
            )}
            {attachment.mediaType === 'pdf' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <FileText className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{attachment.mediaName}</p>
              <p className="text-[11px] text-emerald-700">
                Ready to send • {attachment.mediaType.toUpperCase()} ({formatChatMediaSize(attachment.mediaSize)})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-rose-600"
            title="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Rich Media Toolbar */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => imageInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
          >
            <ImageIcon className="h-3.5 w-3.5 text-blue-600" /> Image
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => videoInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
          >
            <Video className="h-3.5 w-3.5 text-purple-600" /> Video
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5 text-rose-600" /> PDF / PO / LC
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => anyFileInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            title="Attach any supported media (max 50MB)"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-[11px] text-slate-400">JPG, PNG, WEBP, MP4, WEBM, MOV, PDF (up to 50MB)</span>
      </div>

      {/* Textarea + Send */}
      <div className="flex min-w-0 items-end gap-2">
        <textarea
          rows={2}
          disabled={disabled}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 w-full flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50/60 px-3 sm:px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || sending || uploading || (!text.trim() && !attachment)}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Send</span>
        </button>
      </div>
    </form>
  );
};
