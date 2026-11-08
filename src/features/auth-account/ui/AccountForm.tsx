import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { NameInput } from '@entities/auth';
import { NickNameInput } from '@entities/auth';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { UpdateAccountReq } from '../api/types';

interface AccountFormProps {
  handleUpdateAccount: (req: UpdateAccountReq) => void;
}

/** 인증 정보를 검증한 뒤 제출한다. */
export default function AccountForm({ handleUpdateAccount }: AccountFormProps) {
  const { data: session } = useSession();
  const { handleSubmit } = useFormContext<UpdateAccountReq>();

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit(handleUpdateAccount)}
    >
      <EmailInput defaultValue={session?.user?.email} />

      <NameInput defaultValue={session?.user?.name} />

      <NickNameInput defaultValue={session?.user?.nickname || undefined} />

      <ButtonBox buttonText="변경 사항 저장" />
    </form>
  );
}
