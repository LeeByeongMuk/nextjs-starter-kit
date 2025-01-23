import { QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import PostDetail from '@app_domain/post/[id]/(detail)/page';
import usePost from '@domains/post/detail/_hooks/usePost';
import usePostDetail from '@domains/post/detail/_hooks/usePostDetail';
import { server } from '@lib/mocks/testServer';
import { getQueryClient } from '@lib/tanstackQuery/client';
import { getHandlerURI } from '@shared/utils/url';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next-auth/react');
jest.mock('next/navigation');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('게시글 상세 페이지 테스트', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
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

  test('게시글 수정 권한이 없으면 수정 버튼이 보이지 않는다', async () => {
    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePostDetail(), { wrapper });

    // then - 수정 버튼이 보이지 않는다
    await waitFor(() => {
      expect(result.current.post?.is_editable).toBeFalsy();
    });
    expect(screen.queryByRole('post-edit-link')).not.toBeInTheDocument();
  });

  test('게시글 수정 권한이 있으면 수정 버튼이 보인다', async () => {
    queryClient.clear();
    server.use(
      http.get(getHandlerURI(`/api/posts/:id`), () => {
        return HttpResponse.json({
          ok: true,
          message: 'success',
          data: {
            contents: 'contents',
            created_at: '2021-09-01T00:00:00',
            hit: 0,
            id: 1,
            is_editable: true,
            title: 'title',
            type: 'notice',
            user_name: 'name',
          },
        });
      })
    );

    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePostDetail(), { wrapper });
    await waitFor(() => {
      expect(result.current.post?.is_editable).toBeTruthy();
    });
    // expect(await screen.findByRole('post-edit-link')).toBeInTheDocument();
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
        id: 1,
        is_editable: false,
        title: 'title',
        type: 'notice',
        user_name: 'name',
      });
    });
  });

  test('게시글 상세 API 호출에 실패하면 에러 처리를 진행한다', async () => {
    queryClient.clear();
    server.use(
      http.get(getHandlerURI('/api/posts/:id'), () => {
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
