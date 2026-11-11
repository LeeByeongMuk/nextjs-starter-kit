import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { PasswordInput } from '@entities/auth';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SignInReq } from '../api/types';

interface SignInFormProps {
  handleSignIn: (req: SignInReq) => void;
}

/** 인증 정보를 검증한 뒤 제출한다. */
export default function SignInForm({ handleSignIn }: SignInFormProps) {
  const { handleSubmit } = useFormContext<SignInReq>();

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit(handleSignIn)}
    >
      <EmailInput />

      <PasswordInput />

      <ButtonBox buttonText="로그인" />
    </form>
  );
}
