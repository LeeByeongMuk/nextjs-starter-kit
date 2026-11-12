import { deleteAccessToken } from '@shared/lib/api';
import { useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { fetchDeleteAccount } from '../api/accountService';

export default function useDeleteAccount() {
  return useMutation({
    mutationFn: fetchDeleteAccount,
    onSuccess: async () => {
      alert('Account deleted successfully');
      await deleteAccessToken();
      await signOut({
        redirectTo: '/',
      });
    },
    onError: () => {
      alert('Failed to delete account');
    },
  });
}
