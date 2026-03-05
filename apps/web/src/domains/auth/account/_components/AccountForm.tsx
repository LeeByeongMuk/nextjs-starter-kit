import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import ButtonBox from '@domains/auth/_components/AuthForm/ButtonBox';
import EmailInput from '@domains/auth/_components/AuthForm/EmailInput';
import NameInput from '@domains/auth/_components/AuthForm/NameInput';
import NickNameInput from '@domains/auth/_components/AuthForm/NickNameInput';
import { UpdateAccountReq } from '@domains/auth/account/_types/api';

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
