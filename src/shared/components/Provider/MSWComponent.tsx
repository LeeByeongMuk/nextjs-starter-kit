'use client';

import { useEffect } from 'react';

export default function MSWComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('@lib/mocks/browser');
    }
  }, []);

  return null;
}
