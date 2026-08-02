import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import '@/shared/styles/global.css';

const rootElement = document.querySelector('#root');

if (!rootElement) {
  throw new Error('Application root element "#root" was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
