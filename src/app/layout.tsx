import type { Metadata } from 'next';
import React from 'react';

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
        <div className="container mx-auto">{children}</div>
      </body>
    </html>
  );
}
