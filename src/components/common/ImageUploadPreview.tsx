import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageUploadService, ImagePreviewResult } from '../../services/imageUploadService';

interface ImageUploadPreviewProps {
  value?: string;
  onChange: (imageUrl: string, file?: File) => void;
  label?: string;
  maxSizeBytes?: number;
  className?: string;
  id?: string;
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  value,
  onChange,
  label = 'Product Image',
  maxSizeBytes = 8 * 1024 * 1024, // 8MB default
  className = '',
  id = 'product-image-uploader'
}) => {
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ImagePreviewResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setError(null);
    setIsReading(true);

    try {
      // 1. Instant local FileReader preview via frontend-only ImageUpload service
      const preview = await ImageUploadService.readAsPreview(file, {
        maxSizeBytes,
        autoDimensions: true
      });

      setPreviewData(preview);
      // Propagate the instant preview data URL to parent form
      onChange(preview.previewUrl, file);
    } catch (err: any) {
      setError(err?.message || 'Failed to read image for preview.');
    } finally {
      setIsReading(false);
    }
  };

  const handleClear = () => {
    setPreviewData(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = value || previewData?.previewUrl;

  return (
    <div className={`space-y-2 ${className}`} id={id}>
      {label && (
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Preview Thumbnail Container */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group shadow-inner">
          {isReading ? (
            <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-[9px] font-medium">Reading...</span>
            </div>
          ) : displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt="Product Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove preview"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
              <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[9px] mt-1 text-slate-400">No Image</span>
            </div>
          )}
        </div>

        {/* Action Controls & Info */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                className="hidden"
                disabled={isReading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
              />
            </label>

            {previewData && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>
                  {previewData.name} ({previewData.formattedSize}
                  {previewData.width && previewData.height ? ` • ${previewData.width}x${previewData.height}px` : ''})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Supports JPG, PNG, WEBP, SVG, GIF up to {ImageUploadService.formatBytes(maxSizeBytes)}</span>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
