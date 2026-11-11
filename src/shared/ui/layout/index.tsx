import React from 'react';

import Footer from './Footer';
import Header from './Header';

/** 본문 건너뛰기와 단일 main을 포함하는 공통 앱 프레임이다. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="fixed top-3 left-5 z-50 -translate-y-24 rounded bg-accent px-5 py-3 font-semibold text-inverse focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1120px] flex-1 px-5 pt-10 pb-20 sm:px-8 sm:pt-16"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
