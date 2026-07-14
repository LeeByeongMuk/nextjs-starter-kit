import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { PasswordInput } from '@entities/auth';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SignInReq } from '../api/types';

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
