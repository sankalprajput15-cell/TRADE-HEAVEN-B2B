import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import './services/autoCacheOptimizer';

// Global Defense-in-Depth against unexpected HTML/empty responses (e.g. Apache 404/500/502/SPA redirects)
// Prevents "Unexpected token '<', '<!doctype '... is not valid JSON" from ever throwing in Chrome
if (typeof window !== 'undefined' && typeof Response !== 'undefined' && Response.prototype && Response.prototype.json) {
  Response.prototype.json = async function patchedJson<T = any>(): Promise<T> {
    try {
      const text = await this.text();
      if (!text || !text.trim()) {
        return {} as T;
      }
      const trimmed = text.trim();
      if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
        console.warn('[TradeHeaven API] Intercepted HTML document where JSON was expected. Safely returning fallback object.');
        return {
          status: 'fallback',
          success: false,
          data: [],
          message: 'Received HTML response instead of JSON'
        } as unknown as T;
      }
      return JSON.parse(trimmed) as T;
    } catch {
      return {} as T;
    }
  };
}

// Safely clear mock data and any cached/default auth sessions from local/session storage on boot
try {
  localStorage.removeItem('th_suppliers_store');
  localStorage.removeItem('th_buyers_store');
  localStorage.removeItem('th_rfqs_store');
  localStorage.removeItem('th_quotes_store');
  localStorage.removeItem('th_registered_users_store');
  localStorage.removeItem('th_companies');
  // Preserve user's customized product images and cached product edits across reloads
  localStorage.removeItem('th_session_user');
  localStorage.removeItem('tradeheaven_user');
  localStorage.removeItem('tradeheaven_auth_user');
  localStorage.removeItem('th_session_jwt_token');
  localStorage.removeItem('th_admin_origin_user');
  sessionStorage.removeItem('th_admin_origin_user');
  sessionStorage.removeItem('th_session_user');
} catch {
  // Ignore storage restrictions in sandboxed third-party iframes
}

// Automatically recover from stale chunk mismatches after new production deployments in Chrome
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const lastReload = Number(sessionStorage.getItem('th_vite_chunk_reload_stamp') || 0);
    if (Date.now() - lastReload > 25000) {
      sessionStorage.setItem('th_vite_chunk_reload_stamp', String(Date.now()));
      window.location.reload();
    }
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
}
