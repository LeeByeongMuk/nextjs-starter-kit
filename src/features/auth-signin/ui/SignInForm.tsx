import { ButtonBox } from '@entities/auth';
import { EmailInput } from '@entities/auth';
import { PasswordInput } from '@entities/auth';
import { type FormEventHandler } from 'react';

interface SignInFormProps {
  handleSignIn: FormEventHandler<HTMLFormElement>;
  isBusy: boolean;
}

/** 인증 정보를 검증한 뒤 제출한다. */
export default function SignInForm({ handleSignIn, isBusy }: SignInFormProps) {
  return (
    <form noValidate aria-busy={isBusy} onSubmit={handleSignIn}>
      <fieldset disabled={isBusy} className="min-w-0 space-y-6">
        <EmailInput />
        <PasswordInput />
        <ButtonBox buttonText="로그인" />
      </fieldset>
    </form>
  );
}
