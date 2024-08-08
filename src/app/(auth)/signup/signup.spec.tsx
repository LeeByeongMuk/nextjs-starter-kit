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
import { cookies } from 'next/headers';
import React from 'react';

import Signup from '@/app/(auth)/signup/page';
import useSignup from '@/app/hooks/auth/useSignup';
import { server } from '@/mocks/node';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

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
    expect(errorMessage).toBeInTheDocument();
  });

  test('회원가입 인풋 입력란의 필수값을 입력하고 조건의 만족하면 에러 메세지가 표시되지 않는다', async () => {
    // when 회원가입 필수 입력란 입력
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'signin@email.com' },
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

    // then - 에러메세지 비활성화
    await waitFor(() => {
      const errorMessage = screen.queryByTestId('error-message');
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  test('회원가입에 실패하면 에러 알럿이 출력된다', async () => {
    // when - 회원가입에 실패
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

    const { result } = renderHook(() => useSignup(), { wrapper });

    // then - 에러 알럿이 나타남
    act(() => {
      result.current.mutate({
        email: 'test@email.com',
        name: 'name',
        nickname: 'nickname',
        password: 'wrongPassword',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(window.alert).toHaveBeenCalledWith('Failed to sign up');
    expect(result.current.data).toBeUndefined();
  });
});
