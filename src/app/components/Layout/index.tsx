import React from 'react';

import Footer from '@/app/components/Layout/Footer';
import Header from '@/app/components/Layout/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
