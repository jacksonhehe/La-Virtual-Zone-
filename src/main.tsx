import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import seed from './data/seed.json';
import { VZ_CLUBS_KEY, VZ_PLAYERS_KEY, VZ_FIXTURES_KEY } from './utils/storageKeys';

if (typeof localStorage !== 'undefined' && !localStorage.getItem('vz_initialized')) {
  try {
    localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(seed.clubs));
    localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(seed.players));
    localStorage.setItem(VZ_FIXTURES_KEY, JSON.stringify(seed.fixtures));
    localStorage.setItem('vz_initialized', 'true');
  } catch {
    // ignore write errors
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
 