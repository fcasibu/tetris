import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app';
import { SocketClientProvider } from './providers/socket-client-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketClientProvider>
      <App />
    </SocketClientProvider>
  </StrictMode>,
);
