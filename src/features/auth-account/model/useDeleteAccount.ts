import { deleteAccessToken } from '@shared/lib/deleteAccessToken';
import { toast } from '@shared/ui/toast';
import { useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { fetchDeleteAccount } from '../api/accountService';

/** 회원 탈퇴를 요청하고 성공하면 API 토큰을 지운 뒤 로그아웃한다. */
export default function useDeleteAccount() {
  return useMutation({
    mutationFn: fetchDeleteAccount,
    meta: { errorMessage: '회원 탈퇴를 완료하지 못했습니다.' },
    onSuccess: async () => {
      toast.success('회원 탈퇴가 완료되었습니다.', {
        survivesNavigation: true,
      });
      await deleteAccessToken();
      await signOut({
        redirectTo: '/',
      });
    },
  });
}
