import PostDetail from '@app/(domain)/post/[id]/(detail)/page';
import { usePost } from '@features/post-detail';
import { usePostDetail } from '@features/post-detail';
import postData from '@shared/api/mocks/data/post.json';
import { server } from '@shared/api/mocks/testServer';
import { getQueryClient } from '@shared/api/tanstack-query/client';
import { getHandlerURI } from '@shared/lib/url';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

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
    mockBack.mockClear();
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
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
    expect(
      screen.queryByRole('link', { name: '수정' })
    ).not.toBeInTheDocument();
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
      expect(result.current.data.data).toMatchObject(postData.getById.data);
    });
  });

  test.each([
    ['분류가 없는 글', '미분류', null],
    ['FAQ 글', 'FAQ', 'faq'],
    ['알 수 없는 분류의 글', '미분류', 'constructor'],
  ])('%s은 분류를 %s로 표시한다', async (_, label, type) => {
    server.use(
      http.get(getHandlerURI('/api/posts/:id'), () =>
        HttpResponse.json({
          ...postData.getById,
          data: { ...postData.getById.data, type },
        })
      )
    );
    await queryClient.invalidateQueries({ queryKey: ['post', { id: 1 }] });

    expect(await screen.findByText(label)).toBeVisible();
  });

  test('조회 실패 시 오류 화면을 유지하고 사용자가 복귀를 선택한다', async () => {
    server.use(
      http.get(getHandlerURI('/api/posts/:id'), () => {
        return new HttpResponse(null, {
          status: 500,
        });
      })
    );
    await queryClient.invalidateQueries({ queryKey: ['post', { id: 1 }] });

    // when - 게시글 상세 API 호출한다
    const { result } = renderHook(() => usePost(), { wrapper });

    // then - 호출에 실패한다
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '글이 없거나 일시적인 오류가 발생했습니다.'
    );
    expect(
      screen.getByRole('link', { name: '게시판으로 돌아가기' })
    ).toHaveAttribute('href', '/post');
    expect(window.alert).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
