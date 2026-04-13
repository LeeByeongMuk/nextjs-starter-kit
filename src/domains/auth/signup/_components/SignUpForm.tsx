import ButtonBox from '@entities/auth/ui/AuthForm/ButtonBox';
import EmailInput from '@entities/auth/ui/AuthForm/EmailInput';
import NameInput from '@entities/auth/ui/AuthForm/NameInput';
import NickNameInput from '@entities/auth/ui/AuthForm/NickNameInput';
import PasswordConfirmInput from '@entities/auth/ui/AuthForm/PasswordConfirmInput';
import PasswordInput from '@entities/auth/ui/AuthForm/PasswordInput';
import { SignUpReq } from '@domains/auth/signup/_types/api';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
