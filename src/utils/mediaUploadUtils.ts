import { MediaUploadValidationResult, UploadedMediaItem } from '../types';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function validateMediaFile(
  file: File,
  category: 'LOGO' | 'BANNER' | 'PRODUCT' | 'CERTIFICATE' | 'FACTORY'
): MediaUploadValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const isDoc = category === 'CERTIFICATE';
  const allowedTypes = isDoc ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
  const maxSize = isDoc ? MAX_DOC_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const maxSizeLabel = isDoc ? '10MB' : '5MB';

  const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const validExtensions = isDoc 
    ? ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
    : ['.jpg', '.jpeg', '.png', '.webp'];

  const typeMatches = allowedTypes.includes(file.type) || validExtensions.includes(fileExt);

  if (!typeMatches) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || fileExt}). Allowed formats: ${validExtensions.join(', ')}.`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds the ${maxSizeLabel} limit. Selected file is ${formatBytes(file.size)}.`
    };
  }

  return {
    valid: true,
    formattedSize: formatBytes(file.size)
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error.'));
    reader.readAsDataURL(file);
  });
}

export function reorderArray<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export const VENDOR_CUSTOM_PROFILE_KEY = 'tradeheaven_custom_vendor_profile';

export function saveCustomVendorProfile(profile: any): void {
  try {
    localStorage.setItem(VENDOR_CUSTOM_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save custom vendor profile to localStorage:', err);
  }
}

export function loadCustomVendorProfile(): any | null {
  try {
    const saved = localStorage.getItem(VENDOR_CUSTOM_PROFILE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load custom vendor profile from localStorage:', err);
  }
  return null;
}
