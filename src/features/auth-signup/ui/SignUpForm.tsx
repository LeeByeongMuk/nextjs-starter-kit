import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { NameInput } from '@entities/auth';
import { NickNameInput } from '@entities/auth';
import { PasswordConfirmInput } from '@entities/auth';
import { PasswordInput } from '@entities/auth';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SignUpReq } from '../api/types';

interface SignUpFormProps {
  handleSignUp: (req: SignUpReq) => void;
}

/** 인증 정보를 검증한 뒤 제출한다. */
export default function SignUpForm({ handleSignUp }: SignUpFormProps) {
  const { handleSubmit } = useFormContext<SignUpReq>();

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit(handleSignUp)}
    >
      <EmailInput />

      <NameInput />

      <NickNameInput />

      <PasswordInput autoComplete="new-password" />

      <PasswordConfirmInput />

      <ButtonBox buttonText="회원가입" />
    </form>
  );
}
