import { StrictMode } from 'react';
import 'whatwg-fetch'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
 