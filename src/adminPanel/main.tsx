// This file allows the admin panel to run as a standalone app.
// It is not imported by the main application and can be used
// for manual testing or development of admin features in
// isolation from the main site.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
 