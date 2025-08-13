import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './index.css';
import seed from './data/seed.json';
import { players as mockPlayers } from './data/mockData';
import { getImportedPlayers } from './utils/importPlayers';
import { VZ_CLUBS_KEY, VZ_PLAYERS_KEY, VZ_FIXTURES_KEY } from './utils/storageKeys';
import './utils/fixTournaments';

// Update this value when modifying seed.json to force re-seeding
const SEED_VERSION_KEY = 'vz_seed_version';
const SEED_VERSION = '4';

Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });

if (typeof localStorage !== 'undefined') {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (storedVersion !== SEED_VERSION) {
    try {
      localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(seed.clubs));
      // Fusionar mockPlayers con importados (si existen)
      try {
        const imported = getImportedPlayers();
        const merged = Array.isArray(imported) && imported.length > 0
          ? [...mockPlayers, ...imported]
          : mockPlayers;
        localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(merged));
      } catch {
        localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(mockPlayers));
      }
      localStorage.setItem(VZ_FIXTURES_KEY, JSON.stringify(seed.fixtures));
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    } catch {
      // ignore write errors
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
 