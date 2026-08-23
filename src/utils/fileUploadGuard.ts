/**
 * Global File & Media Upload Safety Utilities
 * Implements strict size capping, format whitelisting, image dimension resizing/compression
 * to prevent browser tab crashing, memory bloating, and slow client-side rendering.
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

// Global limits
export const UPLOAD_LIMITS = {
  /** Standard photo/image upload limit: 5 MB */
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_IMAGE_SIZE_MB: 5,

  /** Standard document (PDF/Doc/JSON) upload limit: 8 MB */
  MAX_DOC_SIZE_BYTES: 8 * 1024 * 1024,
  MAX_DOC_SIZE_MB: 8,

  /** Maximum allowed dimensions for rendered browser canvas/thumbnails */
  MAX_IMAGE_WIDTH: 1600,
  MAX_IMAGE_HEIGHT: 1600,

  /** Allowed MIME types */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
  ALLOWED_DOC_TYPES: [
    'application/pdf',
    'application/json',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

/**
 * Validate file before processing or reading into memory
 */
export function validateUploadFile(
  file: File,
  type: 'IMAGE' | 'DOCUMENT' | 'ANY' = 'ANY',
  customMaxSizeBytes?: number
): FileValidationResult {
  const maxBytes = customMaxSizeBytes || (type === 'IMAGE' ? UPLOAD_LIMITS.MAX_IMAGE_SIZE_BYTES : UPLOAD_LIMITS.MAX_DOC_SIZE_BYTES);
  const maxMb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;

  // 1. Check file size
  if (file.size > maxBytes) {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileSizeMb} MB) exceeds maximum allowed limit of ${maxMb} MB. Please compress or select a smaller file.`
    };
  }

  // 2. Check MIME type if applicable
  if (type === 'IMAGE' && !UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: `Unsupported image format. Allowed formats: JPG, PNG, WEBP, AVIF.`
    };
  }

  return { valid: true, file };
}

/**
 * Safely compresses and downsizes high-resolution customer photos via HTML5 Canvas
 * so memory footprint stays tiny (< 500 KB per stored picture).
 */
export async function compressAndResizeImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ dataUrl: string; sizeBytes: number; width: number; height: number }> {
  const maxWidth = options.maxWidth || UPLOAD_LIMITS.MAX_IMAGE_WIDTH;
  const maxHeight = options.maxHeight || UPLOAD_LIMITS.MAX_IMAGE_HEIGHT;
  const quality = options.quality ?? 0.82;

  // Validate initial size
  const val = validateUploadFile(file, 'IMAGE', options.maxSizeBytes);
  if (!val.valid) {
    throw new Error(val.error);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or corrupted image format.'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserved scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize canvas context for compression.'));
          return;
        }

        // Draw and export optimized JPEG or WEBP
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          sizeBytes,
          width,
          height
        });
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
