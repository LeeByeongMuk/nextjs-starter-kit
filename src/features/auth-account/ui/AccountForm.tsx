import ButtonBox from '@entities/auth/ui/AuthForm/ButtonBox';
import EmailInput from '@entities/auth/ui/AuthForm/EmailInput';
import NameInput from '@entities/auth/ui/AuthForm/NameInput';
import NickNameInput from '@entities/auth/ui/AuthForm/NickNameInput';
import { UpdateAccountReq } from '@features/auth-account/api/types';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
