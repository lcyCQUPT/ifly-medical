import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp } from 'antd';
import { isAxiosError } from 'axios';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalMessageBridge } from './components/GlobalMessageBridge';
import { getErrorMessage } from './utils/error';
import { notifyError } from './utils/message';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      notifyError(getErrorMessage(error, '数据加载失败'));
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AntApp>
          <GlobalMessageBridge />
          <AuthProvider queryClient={queryClient}>
            <App />
          </AuthProvider>
        </AntApp>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
