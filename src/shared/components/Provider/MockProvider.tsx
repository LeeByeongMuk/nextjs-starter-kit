'use client';

import { useEffect, useState } from 'react';

export default function MockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const initMsw = await import('@lib/mocks').then(res => res.initMsw);
      await initMsw();
      setIsReady(true);
    };

    if (!isReady) {
      init();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
