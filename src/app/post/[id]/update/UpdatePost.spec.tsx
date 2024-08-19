import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  renderHook,
  waitFor,
  screen,
  act,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import useUpdatePost from '@/app/hooks/post/useUpdatePost';
import useUpdatePostResource from '@/app/hooks/post/useUpdatePostResource';
import UpdatePost from '@/app/post/[id]/update/page';
import { server } from '@/mocks/node';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('next-auth/react');
jest.mock('@toast-ui/react-editor');
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

describe('게시글 수정 테스트', () => {
  const useSessionMock = useSession as jest.Mock;
  const mockPush = jest.fn();

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

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
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
      update: jest.fn(),
    });

    // given - 게시글 수정 페이지가 그려진다
    render(<UpdatePost />, { wrapper });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('게시글 수정 리소스 API 호출', () => {
    test('게시글 수정 리소스 API 호출에 성공하면 게시글 정보를 가져온다', async () => {
      // when - 게시글 수정 리소스 API 호출에 성공
      const { result } = renderHook(() => useUpdatePostResource(), { wrapper });

      // then - 게시글 정보를 가져온다
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data.data).toEqual({
          id: 1,
          title: 'title',
          contents: 'contents',
          type: 'notice',
          is_open: true,
        });
      });
    });

    test('게시글 수정 리소스 API 호출에 실패하면 실패 메시지를 출력한다', async () => {
      queryClient.clear();
      server.use(
        http.get('/api/posts/:id/edit', () => {
          return new HttpResponse(null, {
            status: 500,
          });
        })
      );

      // when - 게시글 수정 리소스 API 호출에 실패
      const { result } = renderHook(() => useUpdatePostResource(), { wrapper });

      // then - 실패 메시지를 출력한다
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(window.alert).toHaveBeenCalledWith('Failed to fetch post');
        expect(mockPush).toHaveBeenCalledWith('/post');
      });
    });
  });

  describe('게시글 수정 API 호출', () => {
    test('게시글 수정에 성공하면 성공 메시지를 출력하고 상세페이지로 이동한다', async () => {
      // when - 제목, 내용, 타입, 라디오박스를 입력하고 제출 버튼을 클릭한다
      fireEvent.input(await screen.findByLabelText('Title'), {
        target: {
          value: '제목',
        },
      });
      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: '내용',
        },
      });
      fireEvent.click(screen.getByLabelText('Yes'));
      fireEvent.submit(screen.getByText('submit'));

      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.mutate({
          id: 1,
          title: '제목',
          contents: '내용',
          type: 'notice',
          is_open: true,
        });
      });

      // then - 성공 메시지가 출력되고 상세페이지로 이동한다
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Post updated successfully');
      expect(mockPush).toHaveBeenCalledWith(`/post/1`);
    });

    test('게시글 수정에 실패하면 실패 메시지를 출력한다', async () => {
      server.use(
        http.put('/api/posts/:id', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      // given - 게시글 수정 API 가 실패한다
      const { result } = renderHook(() => useUpdatePost(), { wrapper });

      act(() => {
        result.current.mutate({
          id: 1,
          title: '제목',
          contents: '내용',
          type: 'notice',
          is_open: true,
        });
      });

      // then - 실패 메시지가 출력된다
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Failed to update post');
    });
  });
});
