import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import usePost from '@/app/hooks/post/usePost';
import PostDetail from '@/app/post/[id]/page';
import { server } from '@/mocks/node';
import { useSession } from 'next-auth/react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next-auth/react');
jest.mock('next/navigation');
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

describe('게시글 상세 페이지 테스트', () => {
  const mockBack = jest.fn();

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
      push: jest.fn(),
      back: mockBack,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
    });

    // given - 게시글 상세 페이지가 그려짐
    render(<PostDetail />, { wrapper });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  test('게시글 수정 권한이 없으면 수정 버튼이 보이지 않는다', async () => {
    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePost(), { wrapper });

    // then - 수정 버튼이 보이지 않는다
    await waitFor(() => {
      expect(result.current.data.data.is_edit).toBeFalsy();
    });
    expect(screen.queryByRole('post-edit-link')).not.toBeInTheDocument();
  });

  test('게시글 수정 권한이 있으면 수정 버튼이 보인다', async () => {
    queryClient.clear();

    server.use(
      http.get('/api/posts/:id', () => {
        return HttpResponse.json({
          data: {
            contents: 'contents',
            created_at: '2021-09-01T00:00:00',
            hit: 0,
            is_edit: true,
            title: 'title',
            type: 'notice',
            user: {
              name: 'name',
              nickname: 'nickname',
            },
          },
        });
      })
    );

    // given - 게시글 상세 페이지가 그려짐 (수정 권한 있음)
    render(<PostDetail />, { wrapper });

    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePost(), { wrapper });

    // then - 수정 버튼이 보인다
    await waitFor(() => {
      expect(result.current.data.data.is_edit).toBeTruthy();
    });
    expect(screen.getByRole('post-edit-link')).toBeInTheDocument();
  });

  test('게시글 상세 API 호출에 성공한다', async () => {
    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePost(), { wrapper });

    // then - 호출에 성공한다
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.data.data).toMatchObject({
        contents: 'contents',
        created_at: '2021-09-01T00:00:00',
        hit: 0,
        is_edit: false,
        title: 'title',
        type: 'notice',
        user: {
          name: 'name',
          nickname: 'nickname',
        },
      });
    });
  });

  test('게시글 상세 API 호출에 실패하면 에러 처리를 진행한다', async () => {
    queryClient.clear();

    server.use(
      http.get('/api/posts/:id', () => {
        return new HttpResponse(null, {
          status: 500,
        });
      })
    );

    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePost(), { wrapper });

    // then - 호출에 실패한다
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });
    expect(window.alert).toHaveBeenCalledWith('Failed to fetch post');
    expect(mockBack).toHaveBeenCalled();
  });
});
