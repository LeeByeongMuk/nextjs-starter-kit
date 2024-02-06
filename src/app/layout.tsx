import type { Metadata } from 'next';

import Provider from '@/app/components/Provider';

import './globals.css';

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
          <div className="container mx-auto">{children}</div>
        </Provider>
      </body>
    </html>
  );
}
