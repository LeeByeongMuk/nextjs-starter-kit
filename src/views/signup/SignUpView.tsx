'use client';

import { AuthHeader } from '@entities/auth';
import {
  SignUpForm,
  type SignUpFormInput,
  useSignup,
  useSignupForm,
} from '@features/auth-signup';
import LayerSpinner from '@shared/ui/spinner/LayerSpinner';
import Link from 'next/link';
import { useRef } from 'react';
import { FormProvider } from 'react-hook-form';

/** 인증 폼과 관련 화면으로의 이동을 제공한다. */
export default function SignUpView() {
  const methods = useSignupForm();
  const { mutateAsync, isPending } = useSignup();
  const submitting = useRef(false);
  const handleSignUp = async ({
    email,
    name,
    nickname,
    password,
  }: SignUpFormInput) => {
    if (submitting.current) return;

    submitting.current = true;
    try {
      // 가입에 성공하면 로그인한 화면으로 이동하므로 다시 제출할 수 없게 둔다.
      await mutateAsync({ email, name, nickname, password });
    } catch {
      // 실패는 QueryClient의 중앙 오류 처리가 알린다. 다시 제출할 수 있게 푼다.
      submitting.current = false;
    }
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
