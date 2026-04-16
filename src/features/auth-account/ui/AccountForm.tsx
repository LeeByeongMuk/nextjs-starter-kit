import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { NameInput } from '@entities/auth';
import { NickNameInput } from '@entities/auth';

import { UpdateAccountReq } from '../api/types';

interface AccountFormProps {
  handleUpdateAccount: (req: UpdateAccountReq) => void;
}

export default function AccountForm({ handleUpdateAccount }: AccountFormProps) {
  const { data: session } = useSession();
  const { handleSubmit } = useFormContext<UpdateAccountReq>();

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleUpdateAccount)}>
      <EmailInput defaultValue={session?.user?.email} />

      <NameInput defaultValue={session?.user?.name} />

      <NickNameInput defaultValue={session?.user?.nickname || undefined} />

      <ButtonBox buttonText="Account Update" />
    </form>
  );
}
