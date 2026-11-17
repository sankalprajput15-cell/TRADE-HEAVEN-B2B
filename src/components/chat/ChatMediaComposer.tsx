import React, { useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Loader2, Paperclip, Send, Video, X } from 'lucide-react';
import { ChatMediaType } from '../../types';
import {
  formatChatMediaSize,
  uploadChatMedia,
  validateChatMediaFile
} from '../../services/multiIdentityChatService';

export interface PendingMediaAttachment {
  id: string;
  mediaType: ChatMediaType;
  mediaUrl: string;
  mediaName: string;
  mediaSize: number;
}

export interface ChatMediaSendPayload {
  messageText: string;
  mediaType: ChatMediaType;
  mediaUrl: string;
  mediaName: string;
  mediaSize: number;
  attachments?: PendingMediaAttachment[];
}

interface ChatMediaComposerProps {
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  onSend: (payload: ChatMediaSendPayload) => Promise<void>;
}

export const ChatMediaComposer: React.FC<ChatMediaComposerProps> = ({
  disabled = false,
  sending = false,
  placeholder = 'Type your message, quotation terms, or attach Screenshots, Videos & PDFs...',
  onSend
}) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    current: number;
    total: number;
    fileName: string;
    progress: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<PendingMediaAttachment[]>([]);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const anyFileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const processAndUploadFiles = async (rawFiles: File[]) => {
    if (rawFiles.length === 0) return;

    if (attachments.length + rawFiles.length > 10) {
      setErrorMsg(`Maximum 10 files per message (currently ${attachments.length} attached).`);
      return;
    }

    setErrorMsg(null);
    setUploading(true);

    const newlyUploaded: PendingMediaAttachment[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const check = validateChatMediaFile(file);
      if (!check.valid) {
        errors.push(`${file.name}: ${check.error || 'Unsupported file'}`);
        continue;
      }

      setUploadStatus({
        current: i + 1,
        total: rawFiles.length,
        fileName: file.name,
        progress: 10
      });

      try {
        const result = await uploadChatMedia(file, pct => {
          setUploadStatus(prev => (prev ? { ...prev, progress: pct } : null));
        });

        newlyUploaded.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          mediaType: result.mediaType,
          mediaUrl: result.mediaUrl,
          mediaName: result.mediaName,
          mediaSize: result.mediaSize
        });
      } catch (err: any) {
        errors.push(`${file.name}: ${err?.message || 'Upload failed'}`);
      }
    }

    if (newlyUploaded.length > 0) {
      setAttachments(prev => [...prev, ...newlyUploaded]);
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join(' • '));
    }

    setUploading(false);
    setUploadStatus(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length > 0) {
      await processAndUploadFiles(files);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items || []);
    const fileItems = items.filter(item => item.kind === 'file');
    if (fileItems.length === 0) return;

    const files: File[] = [];
    for (const item of fileItems) {
      const f = item.getAsFile();
      if (f) files.push(f);
    }

    if (files.length > 0) {
      e.preventDefault();
      await processAndUploadFiles(files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const clearAllAttachments = () => {
    setAttachments([]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || sending || uploading) return;
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    setErrorMsg(null);
    try {
      const first = attachments[0];
      await onSend({
        messageText: trimmed,
        mediaType: first ? first.mediaType : 'none',
        mediaUrl: first ? first.mediaUrl : '',
        mediaName: first ? first.mediaName : '',
        mediaSize: first ? first.mediaSize : 0,
        attachments: attachments.length > 0 ? attachments : undefined
      });
      setText('');
      setAttachments([]);
      textareaRef.current?.focus();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send message.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full shrink-0 border-t border-slate-200 bg-white p-2.5 sm:p-3 relative z-20 shadow-xs"
    >
      {/* Hidden native inputs supporting multiple files */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={anyFileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {errorMsg && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
          <span className="truncate">{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="ml-2 text-rose-500 hover:text-rose-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {uploading && uploadStatus && (
        <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-blue-700">
            <span className="inline-flex items-center gap-1.5 truncate max-w-[80%]">
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>
                Uploading ({uploadStatus.current}/{uploadStatus.total}): {uploadStatus.fileName}
              </span>
            </span>
            <span className="shrink-0">{uploadStatus.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
            <div
              className="h-full bg-blue-600 transition-all duration-150"
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Multiple Attachments Tray */}
      {attachments.length > 0 && !uploading && (
        <div className="mb-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2 sm:p-2.5">
          <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] font-bold text-emerald-900">
            <span>
              Attached Files ({attachments.length}/10 • Ready to send together):
            </span>
            <button
              type="button"
              onClick={clearAllAttachments}
              className="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {attachments.map(att => (
              <div
                key={att.id}
                className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-1.5 shadow-2xs max-w-[260px] min-w-0"
              >
                {att.mediaType === 'image' && (
                  <img
                    src={att.mediaUrl}
                    alt={att.mediaName}
                    className="h-9 w-9 rounded-md object-cover border border-emerald-100 shrink-0"
                  />
                )}
                {att.mediaType === 'video' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-700 font-bold text-[10px]">
                    <Video className="h-4 w-4" />
                  </div>
                )}
                {att.mediaType === 'pdf' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                    <FileText className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800" title={att.mediaName}>
                    {att.mediaName}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold uppercase">
                    {att.mediaType} • {formatChatMediaSize(att.mediaSize)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 shrink-0 cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rich Media Toolbar */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => imageInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
            title="Attach screenshots or pictures (multiple files supported)"
          >
            <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
            <span>Screenshot / Image</span>
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => videoInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50 cursor-pointer transition-colors"
            title="Attach video recordings (multiple files supported)"
          >
            <Video className="h-3.5 w-3.5 text-purple-600" />
            <span>Video</span>
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 cursor-pointer transition-colors"
            title="Attach PDF specifications or documents (multiple files supported)"
          >
            <FileText className="h-3.5 w-3.5 text-rose-600" />
            <span>PDF / PO / LC</span>
          </button>
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => anyFileInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
            title="Attach any supported media files at once"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-[10.5px] text-slate-400 hidden sm:inline">
          Paste screenshot (Ctrl+V) or attach up to 10 files (max 50MB each)
        </span>
      </div>

      {/* Textarea + Fixed Send Button (Guaranteed Visible) */}
      <div className="flex min-w-0 items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={2}
          disabled={disabled}
          value={text}
          onChange={e => setText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 w-full flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50/70 px-3 sm:px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none disabled:opacity-60 leading-relaxed"
        />
        <button
          type="submit"
          disabled={disabled || sending || uploading || (!text.trim() && attachments.length === 0)}
          className="inline-flex h-10 sm:h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Send className="h-4 w-4 shrink-0" />
          )}
          <span>Send{attachments.length > 1 ? ` (${attachments.length})` : ''}</span>
        </button>
      </div>
    </form>
  );
};
