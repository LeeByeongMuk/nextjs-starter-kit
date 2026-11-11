'use client';

import { AuthHeader } from '@entities/auth';
import { SignInForm, useSignInForm } from '@features/auth-signin';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';

/** 인증 폼과 관련 화면으로의 이동을 제공한다. */
export default function SignInView() {
  const { isLoading, handleSignIn, methods } = useSignInForm();

  return (
    <FormProvider {...methods}>
      <section className="mx-auto w-full max-w-md py-4 sm:py-8">
        <AuthHeader headText="로그인" />

        <div>
          <SignInForm handleSignIn={handleSignIn} />
        </div>
        <p className="mt-8 text-sm text-muted">
          아직 계정이 없나요?{' '}
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center px-2 font-semibold text-accent underline underline-offset-4"
          >
            회원가입
          </Link>
        </p>
      </section>

      {isLoading && <LayerSpinner />}
    </FormProvider>
  );
}
