'use client';

import { documentNavigation } from '@shared/lib/url';
import { type FormEvent, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { signInCredentials } from '../api/signInCredentials';
import { SignInReq } from '../api/types';
import { resolveCallbackUrl } from '../lib/resolveCallbackUrl';

const requestError = '로그인 요청을 완료하지 못했습니다. 다시 시도해 주세요.';

/** 로그인 입력과 같은 출처의 복귀 경로를 관리한다. */
export function useSignInForm() {
  const submitting = useRef(false);
  const [isBusy, setIsBusy] = useState(false);
  const methods = useForm<SignInReq>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;

    submitting.current = true;
    let navigating = false;
    let failureMessage: string | undefined;
    try {
      await methods.handleSubmit(async data => {
        setIsBusy(true);
        const { origin, search } = window.location;
        const callbackUrl = new URLSearchParams(search).get('callbackUrl');
        const result = await signInCredentials(data, origin);
        if (result === 'success') {
          documentNavigation.assign(resolveCallbackUrl(callbackUrl, origin));
          navigating = true;
          return;
        }
        failureMessage =
          result === 'invalid-credentials'
            ? '로그인하지 못했습니다. 이메일과 비밀번호를 확인해 주세요.'
            : requestError;
      })(event);
    } catch {
      failureMessage = requestError;
    } finally {
      if (!navigating) {
        submitting.current = false;
        setIsBusy(false);
      }
    }
    if (failureMessage) alert(failureMessage);
  };

  return { handleSignIn, isBusy, methods };
}
