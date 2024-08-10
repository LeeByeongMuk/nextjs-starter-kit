import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import React from 'react';

import Signup from '@/app/(auth)/signup/page';
import useSignup from '@/app/hooks/auth/useSignup';
import { server } from '@/mocks/node';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next-auth/react');

global.alert = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('회원가입 테스트', () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();

    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    (cookies as jest.Mock).mockReturnValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue,
    });

    // given - 회원가입 페이지가 그려짐
    render(<Signup />, { wrapper });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('이메일 형식을 확인 한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 이메일 값이 입력되지 않음
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('email-error-message');
      expect(errorMessage).toHaveTextContent('Email is required');
    });

    test('이메일 형식이 아닌 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 이메일 형식이 아닌 값 입력
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'wrongEmail' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('email-error-message');
      expect(errorMessage).toHaveTextContent('Invalid email address');
    });
  });

  describe('이름 형식을 확인한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 이름 값이 입력되지 않음
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('name-error-message');
      expect(errorMessage).toHaveTextContent('Name is required');
    });

    test('이름이 2자 미만이면 에러메세지가 표시된다', async () => {
      // when - 이름이 2자 미만
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 's' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('name-error-message');
      expect(errorMessage).toHaveTextContent(
        'Name must be at least 2 characters long'
      );
    });

    test('이름이 30자 초과이면 에러메세지가 표시된다', async () => {
      // when - 이름이 30자 초과
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 's'.repeat(31) },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('name-error-message');
      expect(errorMessage).toHaveTextContent(
        'Name must be at most 30 characters long'
      );
    });
  });

  describe('닉네임 형식을 확인한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 닉네임 값이 입력되지 않음
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('nickname-error-message');
      expect(errorMessage).toHaveTextContent('NickName is required');
    });

    test('닉네임이 2자 미만이면 에러메세지가 표시된다', async () => {
      // when - 닉네임이 2자 미만
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 's' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('nickname-error-message');
      expect(errorMessage).toHaveTextContent(
        'NickName must be at least 2 characters long'
      );
    });

    test('닉네임이 30자 초과이면 에러메세지가 표시된다', async () => {
      // when - 닉네임이 30자 초과
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 's'.repeat(31) },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('nickname-error-message');
      expect(errorMessage).toHaveTextContent(
        'NickName must be at most 30 characters long'
      );
    });
  });

  describe('비밀번호 형식을 확인한다', () => {
    test('빈 값이 입력되면 에러메세지가 표시된다', async () => {
      // when - 비밀번호 값이 입력되지 않음
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('password-error-message');
      expect(errorMessage).toHaveTextContent('Password is required');
    });

    test('비밀번호가 8자 미만이면 에러메세지가 표시된다', async () => {
      // when - 비밀번호가 8자 미만
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 's'.repeat(7) },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('password-error-message');
      expect(errorMessage).toHaveTextContent(
        'Password must be at least 8 characters long'
      );
    });

    test('비밀번호가 20자 초과이면 에러메세지가 표시된다', async () => {
      // when - 비밀번호가 20자 초과
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 's'.repeat(21) },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('password-error-message');
      expect(errorMessage).toHaveTextContent(
        'Password must be at most 20 characters long'
      );
    });

    test('비밀번호가 대문자, 소문자, 숫자, 특수문자를 포함하지 않으면 에러메세지가 표시된다', async () => {
      // when - 비밀번호가 대문자, 소문자, 숫자, 특수문자를 포함하지 않음
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('password-error-message');
      expect(errorMessage).toHaveTextContent(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    });

    test('비밀번호와 비밀번호 확인 값이 일치하지 않으면 에러메세지가 표시된다', async () => {
      // when - 비밀번호와 비밀번호 확인 값이 일치하지 않음
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.change(screen.getByLabelText('Password Confirmation'), {
        target: { value: 'wrongPassword' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

      // then - 에러메세지가 표시됨
      const errorMessage = await screen.findByRole('pw-confirm-error-message');
      expect(errorMessage).toHaveTextContent('Passwords do not match');
    });
  });

  describe('회원가입 API 호출', () => {
    test('회원가입에 성공하면 회원가입이 완료된다', async () => {
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 'nickname' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.change(screen.getByLabelText('Password Confirmation'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

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
      expect(window.alert).toHaveBeenCalledWith('Signed up successfully!');
      expect(result.current.data).toStrictEqual({
        data: { access_token: '1|mockaccesstoken0000' },
      });
    });

    test('회원가입에 실패하면 에러 알럿이 출력된다', async () => {
      server.use(
        http.post('/api/users/signup', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      // 회원가입 인풋 입력
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'fail' },
      });
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 'nickname' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.change(screen.getByLabelText('Password Confirmation'), {
        target: { value: 'Password11!!' },
      });
      fireEvent.submit(screen.getByTestId('submit-button'));

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
      expect(window.alert).toHaveBeenCalledWith('Failed to sign up');
      expect(result.current.data).toBeUndefined();
    });
  });
});
