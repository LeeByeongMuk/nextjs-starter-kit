import React from 'react';

import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
