import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Clear mock data and any cached/default auth sessions from local/session storage on boot
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
