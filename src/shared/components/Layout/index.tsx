import React from 'react';

import Footer from '@shared/components/Layout/Footer';
import Header from '@shared/components/Layout/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
