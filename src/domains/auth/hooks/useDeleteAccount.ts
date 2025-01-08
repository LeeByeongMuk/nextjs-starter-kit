import { useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { fetchDeleteAccount } from '@/app/api/auth';

export default function useDeleteAccount() {
  return useMutation({
    mutationFn: fetchDeleteAccount,
    onSuccess: async () => {
      alert('Account deleted successfully');
      await signOut({
        callbackUrl: '/',
      });
    },
    onError: () => {
      alert('Failed to delete account');
    },
  });
}
