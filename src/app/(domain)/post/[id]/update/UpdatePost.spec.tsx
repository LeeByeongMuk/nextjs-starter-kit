import UpdatePost from '@app/(domain)/post/[id]/update/page';
import { useUpdatePost } from '@features/post-update';
import { useUpdatePostResource } from '@features/post-update';
import postData from '@shared/api/mocks/data/post.json';
import { server } from '@shared/api/mocks/testServer';
import { getQueryClient } from '@shared/api/tanstack-query/client';
import { getHandlerURI } from '@shared/lib/url';
import { QueryClientProvider } from '@tanstack/react-query';
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
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('next-auth/react');
jest.mock('next/dynamic', () => () => {
  function MockEditor({
    onChange,
    isInvalid,
  }: {
    onChange: (value: string) => void;
    isInvalid: boolean;
  }) {
    return (
      <textarea
        aria-label="본문"
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? 'contents-error' : undefined}
        onChange={event => onChange(event.target.value)}
      />
    );
  }
  return MockEditor;
});

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('게시글 수정 테스트', () => {
  const useSessionMock = useSession as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    mockPush.mockClear();
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
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

  describe('게시글 수정 리소스 API 호출', () => {
    test('게시글 수정 리소스 API 호출에 성공하면 게시글 정보를 가져온다', async () => {
      // when - 게시글 수정 리소스 API 호출에 성공
      const { result } = renderHook(() => useUpdatePostResource(), { wrapper });

      // then - 게시글 정보를 가져온다
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data.data).toEqual(postData.getEdit.data);
      });
    });

    test('수정 정보 조회 실패 시 오류 화면과 복귀 링크를 유지한다', async () => {
      server.use(
        http.get(getHandlerURI(`/api/posts/:id/edit`), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      await queryClient.invalidateQueries({ queryKey: ['posts', { id: 1 }] });

      // when - 게시글 수정 리소스 API 호출에 실패
      const { result } = renderHook(() => useUpdatePostResource(), { wrapper });

      // then - 실패 메시지를 출력한다
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '수정할 글을 불러오지 못했습니다.'
      );
      expect(
        screen.getByRole('link', { name: '게시판으로 돌아가기' })
      ).toHaveAttribute('href', '/post');
      expect(window.alert).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('게시글 수정 API 호출', () => {
    test('게시글 수정에 성공하면 성공 메시지를 출력하고 상세페이지로 이동한다', async () => {
      // when - 제목, 내용, 타입, 라디오박스를 입력하고 제출 버튼을 클릭한다
      fireEvent.input(await screen.findByLabelText('제목'), {
        target: {
          value: '제목',
        },
      });
      fireEvent.change(screen.getByRole('textbox', { name: '본문' }), {
        target: {
          value: '내용',
        },
      });
      fireEvent.click(screen.getByLabelText('공개'));
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));

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
        http.put(getHandlerURI('/api/posts/:id'), () => {
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
