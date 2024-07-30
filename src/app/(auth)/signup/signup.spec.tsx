import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Signup from '@/app/(auth)/signup/page';

global.alert = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {},
});

describe('회원가입 테스트', () => {
  beforeEach(() => {
    // given - 회원가입 페이지가 그려짐

    render(
      <QueryClientProvider client={queryClient}>
        <Signup />
      </QueryClientProvider>
    );
  });

  test('비밀번호와 비밀번호 확인 값이 일치하지 않으면 에러메세지가 표시된다', async () => {
    // when - 비밀번호와 비밀번호 확인 값이 일치하지 않음
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {
        value: 'password',
      },
    });
    fireEvent.change(screen.getByLabelText('Password Confirmation'), {
      target: {
        value: 'wrongPassword',
      },
    });
    fireEvent.submit(screen.getByTestId('submit-button'));

    // then - 에러메세지가 표시됨
    const errorMessage = await screen.findByRole('pw-confirm-error-message');
    expect(errorMessage).toBeInTheDocument();
  });

  test('회원가입 인풋 입력란의 필수값을 입력하고 조건의 만족하면 에러 메세지가 표시되지 않는다.', async () => {
    // when 회원가입 필수 입력란 입력
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {
        value: 'signin@email.com',
      },
    });
    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'name',
      },
    });
    fireEvent.change(screen.getByLabelText('NickName'), {
      target: {
        value: 'nickname',
      },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {
        value: 'password',
      },
    });
    fireEvent.change(screen.getByLabelText('Password Confirmation'), {
      target: {
        value: 'password',
      },
    });
    fireEvent.submit(screen.getByTestId('submit-button'));

    // then - 에러메세지 비활성화
    await waitFor(() => {
      const errorMessage = screen.queryByTestId('error-message');
      expect(errorMessage).not.toBeInTheDocument();
    });
  });
});
