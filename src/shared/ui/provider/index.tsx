'use client';

import { getQueryClient } from '@shared/api/tanstack-query/client';
import { QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('@tanstack/react-query-devtools').then(
            module => module.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : null;

/** 세션과 서버 상태를 앱에 제공한다. */
export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={getQueryClient()}>
        {children}
        {ReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
