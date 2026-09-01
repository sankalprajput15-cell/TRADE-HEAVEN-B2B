/**
 * Frontend-only ImageUpload service wrapper
 * Uses the browser's native FileReader API to generate instant high-fidelity local data URL previews
 * before files are processed or saved to mock/backend storage.
 */

export interface ImagePreviewResult {
  file: File;
  previewUrl: string;
  name: string;
  sizeBytes: number;
  formattedSize: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface ImageUploadValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageUploadProcessOptions extends ImageUploadValidationOptions {
  autoDimensions?: boolean;
}

export interface ImageUploadError {
  code: 'FILE_EMPTY' | 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'READ_ERROR' | 'DIMENSION_ERROR';
  message: string;
}

export class ImageUploadService {
  private static readonly DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  private static readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif'
  ];

  /**
   * Formats raw bytes into readable human format
   */
  public static formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Validates a file against allowed MIME types and max payload constraints
   */
  public static validate(
    file: File,
    options?: ImageUploadValidationOptions
  ): { valid: boolean; error?: ImageUploadError } {
    if (!file) {
      return {
        valid: false,
        error: { code: 'FILE_EMPTY', message: 'No file selected for preview.' }
      };
    }

    const maxBytes = options?.maxSizeBytes ?? this.DEFAULT_MAX_SIZE_BYTES;
    const allowedTypes = options?.allowedMimeTypes ?? this.DEFAULT_ALLOWED_TYPES;

    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidType =
      allowedTypes.includes(file.type) ||
      file.type.startsWith('image/') ||
      ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'].includes(fileExt);

    if (!isValidType) {
      return {
        valid: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Unsupported image format (${file.type || fileExt}). Please upload JPG, PNG, WEBP, GIF, or SVG.`
        }
      };
    }

    if (file.size > maxBytes) {
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size (${this.formatBytes(file.size)}) exceeds allowed maximum of ${this.formatBytes(maxBytes)}.`
        }
      };
    }

    return { valid: true };
  }

  /**
   * Generates a local preview Data URL via FileReader API
   */
  public static readAsPreview(
    file: File,
    options?: ImageUploadProcessOptions
  ): Promise<ImagePreviewResult> {
    return new Promise((resolve, reject) => {
      const validation = this.validate(file, options);
      if (!validation.valid && validation.error) {
        return reject(validation.error);
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          return reject({
            code: 'READ_ERROR',
            message: 'FileReader failed to return valid string representation.'
          } as ImageUploadError);
        }

        const previewUrl = reader.result;
        const baseResult: ImagePreviewResult = {
          file,
          previewUrl,
          name: file.name,
          sizeBytes: file.size,
          formattedSize: this.formatBytes(file.size),
          mimeType: file.type || 'image/jpeg'
        };

        if (options?.autoDimensions !== false) {
          const img = new Image();
          img.onload = () => {
            baseResult.width = img.naturalWidth;
            baseResult.height = img.naturalHeight;
            resolve(baseResult);
          };
          img.onerror = () => {
            // Still resolve preview even if dimension extraction fails (e.g. some SVGs)
            resolve(baseResult);
          };
          img.src = previewUrl;
        } else {
          resolve(baseResult);
        }
      };

      reader.onerror = () => {
        reject({
          code: 'READ_ERROR',
          message: reader.error?.message || 'Error occurred while reading the image file.'
        } as ImageUploadError);
      };

      reader.onabort = () => {
        reject({
          code: 'READ_ERROR',
          message: 'Image preview generation was aborted.'
        } as ImageUploadError);
      };

      // Native browser FileReader API execution
      reader.readAsDataURL(file);
    });
  }

  /**
   * Batch preview for multiple selected product images
   */
  public static async readMultipleAsPreview(
    files: FileList | File[],
    options?: ImageUploadProcessOptions
  ): Promise<ImagePreviewResult[]> {
    const fileArray = Array.from(files);
    const results: ImagePreviewResult[] = [];

    for (const file of fileArray) {
      try {
        const preview = await this.readAsPreview(file, options);
        results.push(preview);
      } catch (err) {
        console.warn(`[ImageUploadService] Failed to preview ${file.name}:`, err);
      }
    }

    return results;
  }

  /**
   * Safe helper to revoke temporary object URLs if created
   */
  public static revoke(url: string): void {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  }
}

// Convenient export alias and singleton helper
export const imageUploadService = ImageUploadService;
export default ImageUploadService;
