import '@testing-library/jest-dom';

import Signup from '@app/(domain)/(auth)/signup/page';
import { useSignup } from '@features/auth-signup';
import userData from '@shared/api/mocks/data/user.json';
import { server } from '@shared/api/mocks/testServer';
import { getQueryClient } from '@shared/api/tanstack-query/client';
import { spyOnToast } from '@shared/lib/testing/toast';
import { getHandlerURI } from '@shared/lib/url';
import Toaster from '@shared/ui/toast/Toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw/http';
import { cookies } from 'next/headers';
import { signIn } from 'next-auth/react';
import React from 'react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next-auth/react');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('회원가입 테스트', () => {
  beforeEach(() => {
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
    });

    // given - 회원가입 페이지가 그려짐
    render(<Signup />, { wrapper });
    render(<Toaster />);
  });

  describe('이메일 형식을 확인 한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 이메일 값이 입력되지 않음
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('이메일')).toHaveAccessibleDescription(
          '이메일을 입력해 주세요.'
        )
      );
    });

    test('이메일 형식이 아닌 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 이메일 형식이 아닌 값 입력
      fireEvent.change(screen.getByLabelText('이메일'), {
        target: { value: 'wrongEmail' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('이메일')).toHaveAccessibleDescription(
          '올바른 이메일 주소를 입력해 주세요.'
        )
      );
    });
  });

  describe('이름 형식을 확인한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 이름 값이 입력되지 않음
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('이름')).toHaveAccessibleDescription(
          '이름을 입력해 주세요.'
        )
      );
    });

    test('이름이 2자 미만이면 에러메세지가 표시된다', async () => {
      // when - 이름이 2자 미만
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: 's' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('이름')).toHaveAccessibleDescription(
          '이름은 2자 이상 입력해 주세요.'
        )
      );
    });

    test('이름이 30자 초과이면 에러메세지가 표시된다', async () => {
      // when - 이름이 30자 초과
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: 's'.repeat(31) },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('이름')).toHaveAccessibleDescription(
          '이름은 30자 이하로 입력해 주세요.'
        )
      );
    });
  });

  describe('닉네임 형식을 확인한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 닉네임 값이 입력되지 않음
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('닉네임')).toHaveAccessibleDescription(
          '닉네임을 입력해 주세요.'
        )
      );
    });

    test('닉네임이 2자 미만이면 에러메세지가 표시된다', async () => {
      // when - 닉네임이 2자 미만
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: 's' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('닉네임')).toHaveAccessibleDescription(
          '닉네임은 2자 이상 입력해 주세요.'
        )
      );
    });

    test('닉네임이 30자 초과이면 에러메세지가 표시된다', async () => {
      // when - 닉네임이 30자 초과
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: 's'.repeat(31) },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('닉네임')).toHaveAccessibleDescription(
          '닉네임은 30자 이하로 입력해 주세요.'
        )
      );
    });
  });

  describe('비밀번호 형식을 확인한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 비밀번호 값이 입력되지 않음
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
          '8~20자, 영문 대·소문자와 숫자, 특수문자 포함 비밀번호를 입력해 주세요.'
        )
      );
    });

    test('비밀번호가 8자 미만이면 에러메세지가 표시된다', async () => {
      // when - 비밀번호가 8자 미만
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 's'.repeat(7) },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
          '8~20자, 영문 대·소문자와 숫자, 특수문자 포함 비밀번호는 8자 이상 입력해 주세요.'
        )
      );
    });

    test('비밀번호가 20자 초과이면 에러메세지가 표시된다', async () => {
      // when - 비밀번호가 20자 초과
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 's'.repeat(21) },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
          '8~20자, 영문 대·소문자와 숫자, 특수문자 포함 비밀번호는 20자 이하로 입력해 주세요.'
        )
      );
    });

    test('비밀번호가 대문자, 소문자, 숫자, 특수문자를 포함하지 않으면 에러메세지가 표시된다', async () => {
      // when - 비밀번호가 대문자, 소문자, 숫자, 특수문자를 포함하지 않음
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 'password' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
          '8~20자, 영문 대·소문자와 숫자, 특수문자 포함 대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'
        )
      );
    });

    test('공백은 특수문자로 인정하지 않는다', async () => {
      // when - 특수문자 대신 끝 공백만 포함
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 'Password123 ' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
          '8~20자, 영문 대·소문자와 숫자, 특수문자 포함 대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'
        )
      );
    });

    test('비밀번호에 특수문자만 누락돼도 에러메세지가 표시된다', async () => {
      // when - 대문자·소문자·숫자는 충족하고 특수문자만 없음
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 'Password123' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
          '8~20자, 영문 대·소문자와 숫자, 특수문자 포함 대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'
        )
      );
    });

    test('비밀번호와 비밀번호 확인 값이 일치하지 않으면 에러메세지가 표시된다', async () => {
      // when - 비밀번호와 비밀번호 확인 값이 일치하지 않음
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
        target: { value: 'wrongPassword' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      // then - 에러메세지가 표시됨
      await waitFor(() =>
        expect(
          screen.getByLabelText('비밀번호 확인')
        ).toHaveAccessibleDescription('비밀번호가 일치하지 않습니다.')
      );
    });
  });

  describe('회원가입 API 호출', () => {
    const signupRequest = jest.fn();
    const account = {
      email: 'test@email.com',
      name: 'name',
      nickname: 'nickname',
      password: 'Password11!!',
    };
    const submitAccount = () => {
      fireEvent.change(screen.getByLabelText('이메일'), {
        target: { value: account.email },
      });
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: account.name },
      });
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: account.nickname },
      });
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: account.password },
      });
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
        target: { value: account.password },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));
    };

    beforeEach(() => {
      signupRequest.mockClear();
      jest.mocked(signIn).mockClear();
      server.use(
        http.post(getHandlerURI('/api/users/signup'), async ({ request }) => {
          signupRequest(await request.json());
          return HttpResponse.json(userData.signup);
        })
      );
    });

    test('화면에서 가입하면 입력한 계정으로 한 번 요청하고 그 계정으로 로그인한다', async () => {
      const toastCalls = spyOnToast();

      submitAccount();

      await waitFor(() =>
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: account.email,
          password: account.password,
          redirectTo: '/',
        })
      );
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signupRequest).toHaveBeenCalledTimes(1);
      expect(signupRequest).toHaveBeenCalledWith(account);
      expect(toastCalls.success).toHaveBeenCalledWith(
        '회원가입이 완료되었습니다.',
        { survivesNavigation: true }
      );
    });

    test('연속으로 제출해도 가입과 로그인을 한 번씩만 요청한다', async () => {
      submitAccount();
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => expect(signIn).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      );
      expect(signupRequest).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledTimes(1);
    });

    test('가입에 실패한 뒤에는 다시 제출할 수 있다', async () => {
      server.use(
        http.post(
          getHandlerURI('/api/users/signup'),
          () => new HttpResponse(null, { status: 500 }),
          { once: true }
        )
      );

      submitAccount();
      await screen.findByText('회원가입을 완료하지 못했습니다.');
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => expect(signupRequest).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    });

    test('가입한 계정으로 로그인하는 동안 다시 제출해도 한 번만 요청하고 완료 알림을 유지한다', async () => {
      let finishSignIn = () => {};
      jest.mocked(signIn).mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishSignIn = () =>
              resolve({
                error: undefined,
                code: undefined,
                status: 200,
                ok: true,
                url: null,
              });
          })
      );

      submitAccount();
      await screen.findByText('회원가입이 완료되었습니다.');
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));
      finishSignIn();

      await waitFor(() =>
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      );
      expect(signupRequest).toHaveBeenCalledTimes(1);
      expect(screen.getByText('회원가입이 완료되었습니다.')).toBeVisible();
    });

    test('회원가입에 성공하면 회원가입이 완료된다', async () => {
      fireEvent.change(screen.getByLabelText('이메일'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: 'nickname' },
      });
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));
      expect(
        await screen.findByText('회원가입이 완료되었습니다.')
      ).toBeInTheDocument();

      // when - 회원가입에 성공
      const { result } = renderHook(() => useSignup(), { wrapper });

      // then - 회원가입이 완료됨
      act(() => {
        result.current.mutate({
          email: 'test@email.com',
          name: 'name',
          nickname: 'nickname',
          password: 'wrongPassword',
        });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({
        ok: true,
        message: 'success',
        data: { id: 1 },
      });
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@email.com',
        password: 'wrongPassword',
        redirectTo: '/',
      });
    });

    test('회원가입에 실패하면 에러 알럿이 출력된다', async () => {
      server.use(
        http.post(getHandlerURI('/api/users/signup'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      // 회원가입 인풋 입력
      fireEvent.change(screen.getByLabelText('이메일'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('이름'), {
        target: { value: 'fail' },
      });
      fireEvent.change(screen.getByLabelText('닉네임'), {
        target: { value: 'nickname' },
      });
      fireEvent.change(screen.getByLabelText('비밀번호'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByRole('button', { name: '회원가입' }));
      expect(
        await screen.findByText('회원가입을 완료하지 못했습니다.')
      ).toBeInTheDocument();

      // when - 회원가입에 실패
      const { result } = renderHook(() => useSignup(), { wrapper });

      // then - 에러 알럿이 나타남
      act(() => {
        result.current.mutate({
          email: 'test@email.com',
          name: 'fail',
          nickname: 'nickname',
          password: 'wrongPassword',
        });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.data).toBeUndefined();
    });
  });
});
