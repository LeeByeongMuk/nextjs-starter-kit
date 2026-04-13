import { fetchDeleteAccount } from '@features/auth-account/api/accountService';
import { useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

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
