import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { NameInput } from '@entities/auth';
import { NickNameInput } from '@entities/auth';
import { PasswordConfirmInput } from '@entities/auth';
import { PasswordInput } from '@entities/auth';

import { SignUpReq } from '../api/types';

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
