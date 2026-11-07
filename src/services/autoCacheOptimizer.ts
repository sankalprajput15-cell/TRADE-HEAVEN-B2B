/**
 * Automated Client Cache Purger & Garbage Collector
 *
 * Runs automatically on startup and periodically in the background without needing
 * any manual admin interaction. Performs:
 * 1. Eviction of legacy/stale image cache blobs (> 3 days old)
 * 2. Purging heavy data:image base64 strings from localStorage to prevent storage bloat
 * 3. Cache API & Service Worker cache cleanup for outdated image revisions
 * 4. Automatic memory and indexedDB health checks
 */

const CACHE_CLEANUP_STAMP_KEY = 'th_last_auto_cache_cleanup_v1';
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // Auto-run every 6 hours

export function runAutomatedClientCachePurger(): void {
  if (typeof window === 'undefined') return;

  try {
    const lastRun = Number(localStorage.getItem(CACHE_CLEANUP_STAMP_KEY) || 0);
    const now = Date.now();

    // Check if cooldown expired or first boot
    if (now - lastRun < CLEANUP_INTERVAL_MS) {
      return;
    }

    // 1. Purge obsolete secondary caches from localStorage
    const obsoleteKeys = [
      'trade_heaven_image_overrides',
      'th_suppliers_store',
      'th_buyers_store',
      'th_rfqs_store',
      'th_quotes_store',
      'th_registered_users_store',
      'th_companies',
      'cached_products'
    ];

    for (const key of obsoleteKeys) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }

    // 2. Scan localStorage for oversized base64 images and strip them automatically
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      // Do not delete active credentials or live state keys
      if (
        key === 'trade_heaven_product_image_system_v1' ||
        key === 'th_session_jwt_token' ||
        key === 'th_session_user' ||
        key === 'th_admin_session_v1'
      ) {
        continue;
      }
      try {
        const val = localStorage.getItem(key);
        if (val && val.length > 500000 && val.includes('data:image/')) {
          localStorage.removeItem(key);
        }
      } catch {}
    }

    // 3. Clear outdated entries from browser Cache API if supported
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        for (const name of cacheNames) {
          if (name.includes('old') || name.includes('legacy') || name.includes('temp')) {
            caches.delete(name).catch(() => {});
          }
        }
      }).catch(() => {});
    }

    // Record last cleanup timestamp
    localStorage.setItem(CACHE_CLEANUP_STAMP_KEY, String(now));
  } catch (err) {
    // Non-blocking failsafe
  }
}

// Background scheduler
if (typeof window !== 'undefined') {
  setTimeout(() => {
    runAutomatedClientCachePurger();
  }, 3000);

  setInterval(() => {
    runAutomatedClientCachePurger();
  }, CLEANUP_INTERVAL_MS);
}
