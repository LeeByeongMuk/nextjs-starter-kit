'use client';

import { useEffect } from 'react';

export default function MSWComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@lib/mocks/browser');
    }
  }, []);

  return null;
}
