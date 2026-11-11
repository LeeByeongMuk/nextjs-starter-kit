import '@styles/globals.css';

import Layout from '@shared/ui/layout';
import Provider from '@shared/ui/provider';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

/** 앱의 기본 제목과 설명이다. */
export const metadata: Metadata = {
  title: 'next-starter-kit',
  description: '인증과 게시판 예제를 갖춘 Next.js 스타터킷',
};

/** 전역 스타일과 공급자를 연결한다. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Provider>
          <Suspense>
            <Layout>{children}</Layout>
          </Suspense>
        </Provider>
      </body>
    </html>
  );
}
