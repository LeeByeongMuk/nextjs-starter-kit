import React from 'react';
import { useFormContext } from 'react-hook-form';

import ButtonBox from '@domains/auth/_components/AuthForm/ButtonBox';
import EmailInput from '@domains/auth/_components/AuthForm/EmailInput';
import NameInput from '@domains/auth/_components/AuthForm/NameInput';
import NickNameInput from '@domains/auth/_components/AuthForm/NickNameInput';
import PasswordConfirmInput from '@domains/auth/_components/AuthForm/PasswordConfirmInput';
import PasswordInput from '@domains/auth/_components/AuthForm/PasswordInput';
import { SignUpReq } from '@domains/auth/signup/_types/api';

interface SignUpFormProps {
  handleSignUp: (req: SignUpReq) => void;
}

export default function SignUpForm({ handleSignUp }: SignUpFormProps) {
  const { handleSubmit } = useFormContext<SignUpReq>();

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleSignUp)}>
      <EmailInput />

      <NameInput />

      <NickNameInput />

      <PasswordInput />

      <PasswordConfirmInput />

      <ButtonBox buttonText="Sign up" />
    </form>
  );
}
