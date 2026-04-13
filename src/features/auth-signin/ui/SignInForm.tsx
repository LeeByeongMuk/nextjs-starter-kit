import ButtonBox from '@entities/auth/ui/AuthForm/ButtonBox';
import EmailInput from '@entities/auth/ui/AuthForm/EmailInput';
import PasswordInput from '@entities/auth/ui/AuthForm/PasswordInput';
import { SignInReq } from '@features/auth-signin/api/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
