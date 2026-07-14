import Footer from '@shared/ui/layout/Footer';
import Header from '@shared/ui/layout/Header';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
