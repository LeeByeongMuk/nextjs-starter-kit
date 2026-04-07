import React from 'react';

type SessionValue = {
  data: unknown;
  status: 'authenticated' | 'loading' | 'unauthenticated';
  update: (...args: unknown[]) => Promise<unknown>;
};

const defaultSessionValue: SessionValue = {
  data: null,
  status: 'unauthenticated',
  update: async () => undefined,
};

export const useSession = jest.fn(() => defaultSessionValue);
export const signIn = jest.fn(async () => ({ ok: true }));
export const signOut = jest.fn(async () => undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
