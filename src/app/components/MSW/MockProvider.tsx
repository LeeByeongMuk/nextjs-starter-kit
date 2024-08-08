'use client';

import { useEffect, useRef, useState } from 'react';

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [isMocking, setIsMocking] = useState(false);
  const isWorkerStarted = useRef(false);

  useEffect(() => {
    async function enableApiMocking() {
      if (typeof window !== 'undefined' && !isWorkerStarted.current) {
        isWorkerStarted.current = true;
        const { worker } = await import('@/mocks/browser');
        await worker.start();
        setIsMocking(true);
      }
    }

    enableApiMocking();
  }, []);

  if (!isMocking) {
    return null;
  }

  return <>{children}</>;
}
