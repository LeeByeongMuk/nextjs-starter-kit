import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { UpdateAccountReq } from '../api/types';
import useDeleteAccount from './useDeleteAccount';
import useUpdateAccount from './useUpdateAccount';

/** 세션 회원 정보로 채운 폼과 수정·탈퇴 동작을 화면에 제공한다. */
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
      '회원 탈퇴를 진행하려면 탈퇴 사유를 입력해 주세요.'
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
