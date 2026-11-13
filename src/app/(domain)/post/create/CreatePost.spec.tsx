import CreatePost from '@app/(domain)/post/create/page';
import { useCreatePost } from '@features/post-create';
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
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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

describe('게시글 생성 테스트', () => {
  const useSessionMock = useSession as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
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
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));

      // then - 에러 메시지가 출력된다
      await waitFor(() =>
        expect(screen.getByLabelText('제목')).toHaveAccessibleDescription(
          '제목을 입력해 주세요.'
        )
      );
    });
    test('제목을 입력하면 에러 메시지를 출력하지 않는다', () => {
      // when - 제목을 입력하고 제출 버튼을 클릭한다
      fireEvent.input(screen.getByLabelText('제목'), {
        target: {
          value: '제목',
        },
      });
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));

      // then - 에러 메시지가 출력되지 않는다
      expect(screen.getByLabelText('제목')).toHaveAttribute(
        'aria-invalid',
        'false'
      );
    });
  });

  describe('분류 선택지를 확인한다', () => {
    test('분류 선택, 자유, 공지, FAQ 순서로 표시한다', () => {
      const select = screen.getByRole<HTMLSelectElement>('combobox', {
        name: '분류',
      });

      expect(
        Array.from(select.options, option => [option.text, option.value])
      ).toEqual([
        ['분류 선택', ''],
        ['자유', 'free'],
        ['공지', 'notice'],
        ['FAQ', 'faq'],
      ]);
    });
  });

  describe('내용 형식을 확인한다', () => {
    test('내용이 입력되지 않으면 에러 메시지를 출력한다', async () => {
      // when - 내용을 입력하지 않고 제출 버튼을 클릭한다
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));

      // then - 에러 메시지가 출력된다
      await waitFor(() =>
        expect(screen.getByLabelText('본문')).toHaveAccessibleDescription(
          '본문을 입력해 주세요.'
        )
      );
    });
    test('내용을 입력하면 에러 메시지를 출력하지 않는다', () => {
      // when - 내용을 입력하고 제출 버튼을 클릭한다
      fireEvent.change(screen.getByRole('textbox', { name: '본문' }), {
        target: {
          value: '내용',
        },
      });
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));
      // then - 에러 메시지가 출력되지 않는다
      expect(screen.getByLabelText('본문')).toHaveAttribute(
        'aria-invalid',
        'false'
      );
    });
  });

  describe('게시글 공개 여부 라디오박스 형식을 확인한다', () => {
    test('태그가 입력되지 않으면 에러 메시지를 출력한다', async () => {
      // when - 제출 버튼을 클릭한다
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));

      // then - 에러 메시지가 출력된다
      await waitFor(() =>
        expect(
          screen.getByRole('group', { name: '공개 범위' })
        ).toHaveAccessibleDescription('공개 범위를 선택해 주세요.')
      );
    });
    test('태그를 입력하면 에러 메시지를 출력하지 않는다', () => {
      // when - 라디오박스를 선택하고 제출 버튼을 클릭한다
      fireEvent.click(screen.getByLabelText('공개'));
      fireEvent.submit(screen.getByRole('button', { name: '저장' }));

      // then - 에러 메시지가 출력되지 않는다
      expect(screen.getByRole('group', { name: '공개 범위' })).toHaveAttribute(
        'aria-invalid',
        'false'
      );
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
