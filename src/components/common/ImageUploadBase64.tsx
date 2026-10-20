import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageUploadBase64Props {
  currentImageUrl?: string;
  onImageSelected: (base64Data: string) => void;
  label?: string;
  helperText?: string;
}

export const ImageUploadBase64: React.FC<ImageUploadBase64Props> = ({
  currentImageUrl,
  onImageSelected,
  label = 'Upload Local Image',
  helperText = 'Select PNG, JPG, or WebP image (max 5MB)'
}) => {
  const [previewBase64, setPreviewBase64] = useState<string | null>(currentImageUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      if (base64String) {
        setPreviewBase64(base64String);
        onImageSelected(base64String);
      }
    };
    reader.onerror = () => {
      setError('Failed to read local file.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleClear = () => {
    setPreviewBase64(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelected('');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      {previewBase64 ? (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-xs relative group">
            <img 
              src={previewBase64} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-700 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Image Converted &amp; Ready</span>
            </div>
            {fileName && (
              <p className="text-xs font-semibold text-slate-800 truncate">{fileName} ({fileSize})</p>
            )}
            <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
              Base64 Data URI length: {previewBase64.length} chars
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group
            ${isDragging ? 'border-blue-500 bg-blue-50/70' : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40'}
          `}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 mb-1">Click to browse or drag &amp; drop image here</span>
          <span className="text-[11px] text-slate-400">{helperText}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};
