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
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import CreatePost from '@app_domain/post/create/page';
import useCreatePost from '@domains/post/create/_hooks/useCreatePost';
import { server } from '@lib/mocks/testServer';
import { getQueryClient } from '@lib/tanstackQuery/client';
import { getHandlerURI } from '@shared/utils/url';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next-auth/react');
jest.mock('@toast-ui/react-editor');

const queryClient = getQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('게시글 생성 테스트', () => {
  const useSessionMock = useSession as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    (cookies as jest.Mock).mockReturnValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
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

    // given - 게시글 생성 페이지가 그려진다
    render(<CreatePost />, { wrapper });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('제목 형식을 확인한다', () => {
    test('제목이 입력되지 않으면 에러 메시지를 출력한다', async () => {
      // when - 제목을 입력하지 않고 제출 버튼을 클릭한다
      fireEvent.submit(screen.getByText('submit'));

      // then - 에러 메시지가 출력된다
      const errorMessage = await screen.findByRole('title-error-message');
      expect(errorMessage).toHaveTextContent('Title is required');
    });
    test('제목을 입력하면 에러 메시지를 출력하지 않는다', () => {
      // when - 제목을 입력하고 제출 버튼을 클릭한다
      fireEvent.input(screen.getByLabelText('Title'), {
        target: {
          value: '제목',
        },
      });
      fireEvent.submit(screen.getByText('submit'));

      // then - 에러 메시지가 출력되지 않는다
      expect(screen.queryByRole('title-error-message')).not.toBeInTheDocument();
    });
  });

  describe('내용 형식을 확인한다', () => {
    test('내용이 입력되지 않으면 에러 메시지를 출력한다', async () => {
      // when - 내용을 입력하지 않고 제출 버튼을 클릭한다
      fireEvent.submit(screen.getByText('submit'));

      // then - 에러 메시지가 출력된다
      expect(
        await screen.findByRole('contents-error-message')
      ).toHaveTextContent('Contents is required');
    });
    test('내용을 입력하면 에러 메시지를 출력하지 않는다', () => {
      // when - 내용을 입력하고 제출 버튼을 클릭한다
      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: '내용',
        },
      });
      fireEvent.submit(screen.getByText('submit'));
      // then - 에러 메시지가 출력되지 않는다
      expect(
        screen.queryByRole('contents-error-message')
      ).not.toBeInTheDocument();
    });
  });

  describe('게시글 공개 여부 라디오박스 형식을 확인한다', () => {
    test('태그가 입력되지 않으면 에러 메시지를 출력한다', async () => {
      // when - 제출 버튼을 클릭한다
      fireEvent.submit(screen.getByText('submit'));

      // then - 에러 메시지가 출력된다
      expect(await screen.findByRole('isOpen-error-message')).toHaveTextContent(
        'Is Open is required'
      );
    });
    test('태그를 입력하면 에러 메시지를 출력하지 않는다', () => {
      // when - 라디오박스를 선택하고 제출 버튼을 클릭한다
      fireEvent.click(screen.getByLabelText('Yes'));
      fireEvent.submit(screen.getByText('submit'));

      // then - 에러 메시지가 출력되지 않는다
      expect(
        screen.queryByRole('isOpen-error-message')
      ).not.toBeInTheDocument();
    });
  });

  describe('게시글 생성 API 호출', () => {
    test('게시글 생성에 성공하면 성공 메시지를 출력하고 상세페이지로 이동한다', async () => {
      const { result } = renderHook(() => useCreatePost(), { wrapper });

      act(() => {
        result.current.mutate({
          title: '제목',
          contents: '내용',
          type: 'notice',
          is_open: true,
        });
      });

      // then - 성공 메시지가 출력되고 상세페이지로 이동한다
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Post created successfully');
      expect(mockPush).toHaveBeenCalledWith(`/post/1`);
    });

    test('게시글 생성에 실패하면 에러 알럿이 출력한다', async () => {
      server.use(
        http.post(getHandlerURI('/api/posts'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      // given - 게시글 생성 API 가 실패한다
      const { result } = renderHook(() => useCreatePost(), { wrapper });

      act(() => {
        result.current.mutate({
          title: '제목',
          contents: '내용',
          type: 'notice',
          is_open: true,
        });
      });

      // then - 에러 알럿이 출력된다
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(window.alert).toHaveBeenCalledWith('Failed to create post');
    });
  });
});
