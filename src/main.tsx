import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
