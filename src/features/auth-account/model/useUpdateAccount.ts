import type { UserData } from '@entities/auth';
import { useMutation } from '@tanstack/react-query';
import { getSession, useSession } from 'next-auth/react';

import { fetchUpdateAccount } from '../api/accountService';

/** 회원 정보를 수정하고 성공하면 세션 정보를 갱신한다. */
export default function useUpdateAccount(
  onSaved?: (profile: UserData) => void
) {
  const { update } = useSession();

  return useMutation({
    mutationFn: fetchUpdateAccount,
    onSuccess: async ({ data }) => {
      // Auth.js는 갱신 데이터를 전달해야 jwt 콜백에 update 트리거를 보낸다.
      const session =
        (await update({}).catch(() => null)) ??
        (await getSession().catch(() => null));
      if (!session?.user || String(session.user.id) === String(data.id)) {
        onSaved?.(data);
      }
      alert('회원 정보를 수정했습니다.');
    },
    onError: () => {
      alert('회원 정보를 수정하지 못했습니다.');
    },
  });
}
