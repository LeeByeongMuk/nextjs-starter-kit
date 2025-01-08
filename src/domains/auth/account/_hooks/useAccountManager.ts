import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import useDeleteAccount from '@domains/auth/account/_hooks/useDeleteAccount';
import useUpdateAccount from '@domains/auth/account/_hooks/useUpdateAccount';
import { UpdateAccountReq } from '@domains/auth/account/_types/api';

export function useAccountManager() {
  const { data: session } = useSession();
  const methods = useForm<UpdateAccountReq>({
    defaultValues: {
      email: session?.user?.email || '',
      name: session?.user?.name || '',
      nickname: session?.user?.nickname || '',
    },
  });
  const { reset } = methods;

  useEffect(() => {
    if (session?.user) {
      reset({
        email: session.user.email,
        name: session.user.name,
        nickname: session.user.nickname || '',
      });
    }
  }, [session?.user, reset]);

  const updateMutate = useUpdateAccount();
  const deleteMutate = useDeleteAccount();

  const handleUpdateAccount = (data: UpdateAccountReq) => {
    updateMutate.mutate(data);
  };

  const handleDeleteAccount = () => {
    const deletedReason = prompt(
      'Are you sure you want to delete your account? Please enter a reason'
    );
    if (!deletedReason) return;

    deleteMutate.mutate({ deleted_reason: deletedReason });
  };

  return {
    methods,
    handleUpdateAccount,
    handleDeleteAccount,
    isLoading: updateMutate.isPending || deleteMutate.isPending,
  };
}
