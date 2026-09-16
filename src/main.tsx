import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline PWA support and caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nueva versión disponible.');
  },
  onOfflineReady() {
    console.log('Aplicación lista para uso offline sin conexión.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

