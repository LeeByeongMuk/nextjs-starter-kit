import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { fetchUpdateAccount } from '../api/accountService';

/** 회원 정보를 수정하고 성공하면 세션 정보를 갱신한다. */
export default function useUpdateAccount() {
  const { update } = useSession();

  return useMutation({
    mutationFn: fetchUpdateAccount,
    onSuccess: async () => {
      alert('회원 정보를 수정했습니다.');
      await update();
    },
    onError: () => {
      alert('회원 정보를 수정하지 못했습니다.');
    },
  });
}
