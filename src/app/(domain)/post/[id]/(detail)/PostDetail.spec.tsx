import PostDetail from '@app/(domain)/post/[id]/(detail)/page';
import { usePost } from '@features/post-detail';
import { usePostDetail } from '@features/post-detail';
import postData from '@shared/api/mocks/data/post.json';
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
  within,
} from '@testing-library/react';
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
  const mockPush = jest.fn();

  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
    });

    // given - 게시글 상세 페이지가 그려짐
    render(<PostDetail />, { wrapper });
    render(<Toaster />);
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

  test('작성자와 분류가 비어 있는 글은 대체 표시로 보여 준다', async () => {
    server.use(
      http.get(getHandlerURI('/api/posts/:id'), () =>
        HttpResponse.json({
          data: {
            title: postData.getById.data.title,
            contents: postData.getById.data.contents,
            created_at: null,
            user_name: null,
          },
        })
      )
    );
    await queryClient.invalidateQueries({ queryKey: ['post', { id: 1 }] });

    expect(await screen.findByText('작성자 미상')).toBeVisible();
    expect(screen.getByText('미분류')).toBeVisible();
  });

  describe('게시글 삭제', () => {
    const deleteRequest = jest.fn();
    const openConfirm = async () => {
      fireEvent.click(await screen.findByRole('button', { name: '삭제' }));
      return screen.getByRole('alertdialog', {
        name: '이 게시글을 삭제할까요?',
      });
    };

    beforeEach(async () => {
      deleteRequest.mockClear();
      server.use(
        http.get(getHandlerURI('/api/posts/:id'), () =>
          HttpResponse.json({
            ...postData.getById,
            data: { ...postData.getById.data, is_editable: true },
          })
        ),
        http.delete(getHandlerURI('/api/posts/:id'), ({ params }) => {
          deleteRequest(params.id);
          return HttpResponse.json(postData.delete);
        })
      );
      await queryClient.invalidateQueries({ queryKey: ['post', { id: 1 }] });
    });

    test('삭제 확인을 취소하면 삭제를 요청하지 않는다', async () => {
      const confirm = await openConfirm();
      const cancel = within(confirm).getByRole('button', { name: '취소' });
      expect(cancel).toHaveFocus();

      fireEvent.click(cancel);

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(deleteRequest).not.toHaveBeenCalled();
      expect(queryClient.isMutating()).toBe(0);
    });

    test('연속으로 삭제를 확인해도 한 번만 요청하고 홈 이동 전까지 다시 삭제할 수 없다', async () => {
      const response = Promise.withResolvers<Response>();
      server.use(
        http.delete(getHandlerURI('/api/posts/:id'), ({ params }) => {
          deleteRequest(params.id);
          return response.promise;
        })
      );
      const trigger = await screen.findByRole('button', { name: '삭제' });
      trigger.focus();
      const confirm = await openConfirm();
      const submit = within(confirm).getByRole('button', { name: '삭제' });

      act(() => {
        fireEvent.click(submit);
        fireEvent.click(submit);
      });

      await waitFor(() => expect(deleteRequest).toHaveBeenCalledWith('1'));
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).toHaveFocus();
      fireEvent.click(trigger);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      response.resolve(HttpResponse.json(postData.delete));

      expect(
        await screen.findByText('게시글을 삭제했습니다.')
      ).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(trigger);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(deleteRequest).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    test('삭제에 실패하면 같은 화면에서 다시 확인하고 삭제할 수 있다', async () => {
      server.use(
        http.delete(
          getHandlerURI('/api/posts/:id'),
          () => new HttpResponse(null, { status: 500 }),
          { once: true }
        )
      );
      const trigger = await screen.findByRole('button', { name: '삭제' });
      trigger.focus();
      const confirm = await openConfirm();

      fireEvent.click(within(confirm).getByRole('button', { name: '삭제' }));

      expect(
        await screen.findByText('게시글을 삭제하지 못했습니다.')
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-disabled', 'false');

      const retry = await openConfirm();
      fireEvent.click(within(retry).getByRole('button', { name: '삭제' }));

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
      expect(deleteRequest).toHaveBeenCalledTimes(1);
    });
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
    const toastCalls = spyOnToast();
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
    expect(toastCalls.success).not.toHaveBeenCalled();
    expect(toastCalls.error).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
