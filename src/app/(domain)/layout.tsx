import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import Layout from '@shared/ui/layout';
import Provider from '@shared/ui/provider';

import '@styles/globals.css';

export const metadata: Metadata = {
  title: 'next-starter-kit',
  description: 'next js boilerplate with laravel boilerplate api',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Provider>
          <div className="container mx-auto">
            <Suspense>
              <Layout>{children}</Layout>
            </Suspense>
          </div>
        </Provider>
      </body>
    </html>
  );
}
