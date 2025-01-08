import React from 'react';
import { useFormContext } from 'react-hook-form';

import ButtonBox from '@domains/auth/_components/AuthForm/ButtonBox';
import EmailInput from '@domains/auth/_components/AuthForm/EmailInput';
import PasswordInput from '@domains/auth/_components/AuthForm/PasswordInput';
import { SignInReq } from '@domains/auth/signin/_types/api';

interface SignInFormProps {
  handleSignIn: (req: SignInReq) => void;
}

export default function SignInForm({ handleSignIn }: SignInFormProps) {
  const { handleSubmit } = useFormContext<SignInReq>();

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleSignIn)}>
      <EmailInput />

      <PasswordInput />

      <ButtonBox buttonText="Sign in" />
    </form>
  );
}
