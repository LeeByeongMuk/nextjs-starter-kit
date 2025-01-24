'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';

import { getQueryClient } from '@lib/tanstackQuery/client';
import MSWComponent from '@shared/components/Provider/MSWComponent';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={getQueryClient()}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
        <MSWComponent />
      </QueryClientProvider>
    </SessionProvider>
  );
}
