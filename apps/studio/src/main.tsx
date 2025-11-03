import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { studioConfig } from './config/studio.config';
import './index.css';

// Expose API base URL globally for hooks that need it (e.g., useJobEvents)
if (typeof window !== 'undefined') {
  (window as any).__KB_LABS_API_BASE_URL__ = studioConfig.apiBaseUrl;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

