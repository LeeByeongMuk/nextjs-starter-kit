import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { useSession } from 'next-auth/react';

import Account from '@/app/(auth)/account/page';
import useUserUpdate from '@/app/hooks/auth/useUserUpdate';
import { server } from '@/mocks/node';
import { cookies } from 'next/headers';

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

describe('마이페이지 페이지 테스트', () => {
  const useSessionMock = useSession as jest.Mock;

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();

    jest.spyOn(window, 'alert').mockImplementation(() => {});

    (cookies as jest.Mock).mockReturnValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue,
    });

    useSessionMock.mockReturnValue({
      user: {
        created_at: '2030-09-01T00:00:00.000Z',
        email: 'test@email.com',
        name: 'name',
        nickname: 'nickname',
        phone: null,
        provider: null,
      },
      update: jest.fn()
    });

    // given - 마이페이지가 그려짐
    render(<Account />, { wrapper });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('회원 정보 수정 테스트', () => {
    test('회원 정보 수정 성공 시 성공 메세지가 표시된다.', async () => {
      // when - 회원 정보 수정 버튼 클릭
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 'nickname' },
      });

      fireEvent.click(screen.getByText('Account Update'));

      // then - 성공 메세지가 표시된다.
      const { result } = renderHook(() => useUserUpdate(), { wrapper });

      act(() => {
        result.current.mutate({
          email: 'test@email.com',
          name: 'name',
          nickname: 'nickname',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Account updated successfully');
    });

    test('회원 정보 수정 실패 시 에러 메세지가 표시된다.', async () => {
      server.use(
        http.put('/api/users', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // when - 회원 정보 수정 버튼 클릭
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@email.com' },
      });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'name' },
      });
      fireEvent.change(screen.getByLabelText('NickName'), {
        target: { value: 'nickname' },
      });

      fireEvent.click(screen.getByText('Account Update'));

      // then - 에러 메세지가 표시된다.
      const { result } = renderHook(() => useUserUpdate(), { wrapper });

      act(() => {
        result.current.mutate({
          email: 'test@email.com',
          name: 'name',
          nickname: 'nickname',
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Failed to update account');
    });
  });

  // describe('회원 탈퇴 테스트', () => {
  //   test('회원 탈퇴 버튼 클릭 시 탈퇴 사유 입력 모달이 뜬다', async () => {});
  //
  //   test('탈퇴 사유를 입력하지 않으면 탈퇴 사유 입력 모달이 닫힌다', async () => {});
  //
  //   test('회원 탈퇴 성공 시 로그아웃 처리된다.', async () => {});
  //
  //   test('회원 탈퇴 실패 시 에러 메세지가 표시된다.', async () => {});
  // });
});
