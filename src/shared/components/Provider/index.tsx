'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';

import MockProvider from '@shared/components/Provider/MockProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <MockProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </MockProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
