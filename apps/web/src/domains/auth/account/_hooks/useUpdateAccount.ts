import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { fetchUpdateAccount } from '@domains/auth/account/_services/accountService';

export default function useUpdateAccount() {
  const { update } = useSession();

  return useMutation({
    mutationFn: fetchUpdateAccount,
    onSuccess: async () => {
      alert('Account updated successfully');
      await update();
    },
    onError: () => {
      alert('Failed to update account');
    },
  });
}
