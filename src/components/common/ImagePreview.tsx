import React from 'react';
import { X, Image as ImageIcon, Eye, CheckCircle2, FileImage } from 'lucide-react';
import { ImagePreviewResult, ImageUploadService } from '../../services/imageUploadService';

export interface ImagePreviewItem {
  id?: string;
  url: string;
  name?: string;
  sizeBytes?: number;
  formattedSize?: string;
  width?: number;
  height?: number;
  file?: File;
  isPrimary?: boolean;
}

export interface ImagePreviewProps {
  /**
   * Array of preview items (can be ImagePreviewResult objects, raw data URLs, or ImagePreviewItem objects)
   */
  images: Array<ImagePreviewResult | ImagePreviewItem | string>;
  /**
   * Callback fired when an image is removed via the remove button overlay
   */
  onRemove?: (index: number, image: ImagePreviewResult | ImagePreviewItem | string) => void;
  /**
   * Callback fired when an image is clicked for expanded preview/inspection
   */
  onSelect?: (index: number, image: ImagePreviewResult | ImagePreviewItem | string) => void;
  /**
   * Callback fired when an image is designated as primary/cover image
   */
  onSetPrimary?: (index: number, image: ImagePreviewResult | ImagePreviewItem | string) => void;
  /**
   * Index of primary image (defaults to 0)
   */
  primaryIndex?: number;
  /**
   * Grid column layout class override (e.g. "grid-cols-2 sm:grid-cols-3 md:grid-cols-4")
   */
  columnsClassName?: string;
  /**
   * Custom CSS class wrapper
   */
  className?: string;
  /**
   * Whether to show file name and size metadata badge
   */
  showMetadata?: boolean;
  /**
   * Empty state placeholder message
   */
  emptyMessage?: string;
  /**
   * Component container DOM ID
   */
  id?: string;
}

/**
 * Normalizes input image representations into a consistent ImagePreviewItem shape
 */
function normalizeImageItem(item: ImagePreviewResult | ImagePreviewItem | string, index: number): ImagePreviewItem {
  if (typeof item === 'string') {
    return {
      id: `img-${index}`,
      url: item,
      name: `Image ${index + 1}`
    };
  }

  if ('previewUrl' in item) {
    return {
      id: `img-${index}`,
      url: item.previewUrl,
      name: item.name,
      sizeBytes: item.sizeBytes,
      formattedSize: item.formattedSize,
      width: item.width,
      height: item.height,
      file: item.file
    };
  }

  return {
    ...item,
    id: item.id || `img-${index}`
  };
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  onSelect,
  onSetPrimary,
  primaryIndex = 0,
  columnsClassName = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  className = '',
  showMetadata = true,
  emptyMessage = 'No product images selected yet.',
  id = 'image-preview-grid'
}) => {
  if (!images || images.length === 0) {
    return (
      <div
        id={id}
        className={`rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center flex flex-col items-center justify-center gap-2 ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
          <ImageIcon className="w-6 h-6 stroke-[1.5]" />
        </div>
        <p className="text-xs font-semibold text-slate-600">{emptyMessage}</p>
        <p className="text-[11px] text-slate-400">Upload images using the file picker above to preview them here.</p>
      </div>
    );
  }

  return (
    <div id={id} className={`space-y-3 ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <FileImage className="w-4 h-4 text-blue-600" />
          <span>
            {images.length} {images.length === 1 ? 'image' : 'images'} selected
          </span>
        </span>
        <span className="text-[11px] text-slate-400">
          Hover over an image to remove or inspect
        </span>
      </div>

      {/* Product Image Grid */}
      <div className={`grid gap-3.5 ${columnsClassName}`}>
        {images.map((rawItem, idx) => {
          const item = normalizeImageItem(rawItem, idx);
          const isPrimary = idx === primaryIndex;

          return (
            <div
              key={item.id || idx}
              id={`image-preview-card-${idx}`}
              className="group relative rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Aspect Ratio Container for Image */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name || `Product preview ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Primary/Cover Image Badge */}
                {isPrimary && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-md tracking-wider uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Cover</span>
                  </div>
                )}

                {/* Dimmed Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                  {onSelect && (
                    <button
                      type="button"
                      id={`preview-inspect-btn-${idx}`}
                      onClick={() => onSelect(idx, rawItem)}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md transition-transform hover:scale-110 active:scale-95"
                      title="View enlarged image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {onSetPrimary && !isPrimary && (
                    <button
                      type="button"
                      id={`preview-set-primary-btn-${idx}`}
                      onClick={() => onSetPrimary(idx, rawItem)}
                      className="px-2 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
                      title="Set as main cover image"
                    >
                      Set Cover
                    </button>
                  )}
                </div>

                {/* Remove Button Overlay (Always top-right on hover) */}
                {onRemove && (
                  <button
                    type="button"
                    id={`preview-remove-btn-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(idx, rawItem);
                    }}
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90"
                    title="Remove image"
                    aria-label={`Remove image ${item.name || idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Card Footer with Image Metadata */}
              {showMetadata && (
                <div className="p-2 bg-white flex flex-col justify-center border-t border-slate-100 text-[11px] min-w-0">
                  <p className="font-semibold text-slate-700 truncate" title={item.name}>
                    {item.name || `Image_${idx + 1}.jpg`}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>
                      {item.formattedSize || (item.sizeBytes ? ImageUploadService.formatBytes(item.sizeBytes) : 'Ready')}
                    </span>
                    {item.width && item.height && (
                      <span className="font-mono text-[9px] text-slate-400">
                        {item.width}×{item.height}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImagePreview;
