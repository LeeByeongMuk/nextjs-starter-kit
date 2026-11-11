'use client';

import { AuthHeader } from '@entities/auth';
import {
  SignUpForm,
  type SignUpReq,
  useSignup,
  useSignupForm,
} from '@features/auth-signup';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';

/** 인증 폼과 관련 화면으로의 이동을 제공한다. */
export default function SignUpView() {
  const methods = useSignupForm();
  const { mutate, isPending } = useSignup();
  const handleSignUp = (req: SignUpReq) => {
    mutate(req);
  };

  return (
    <FormProvider {...methods}>
      <section className="mx-auto w-full max-w-md py-4 sm:py-8">
        <AuthHeader headText="회원가입" />

        <div>
          <SignUpForm handleSignUp={handleSignUp} />
        </div>
        <p className="mt-8 text-sm text-muted">
          이미 계정이 있나요?{' '}
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center px-2 font-semibold text-accent underline underline-offset-4"
          >
            로그인
          </Link>
        </p>
      </section>

      {isPending && <LayerSpinner />}
    </FormProvider>
  );
}
