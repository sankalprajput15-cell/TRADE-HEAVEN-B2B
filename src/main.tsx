import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Clear mock data from local storage to ensure fresh generation takes effect
localStorage.removeItem('th_suppliers_store');
localStorage.removeItem('th_buyers_store');
localStorage.removeItem('th_rfqs_store');
localStorage.removeItem('th_quotes_store');
localStorage.removeItem('th_registered_users_store');
localStorage.removeItem('th_companies');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
