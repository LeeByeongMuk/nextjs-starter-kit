import UpdatePost from '@app/(domain)/post/[id]/update/page';
import { useUpdatePost } from '@features/post-update';
import { useUpdatePostResource } from '@features/post-update';
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
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useWatch } from 'react-hook-form';

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
        value={useWatch({ name: 'contents' })}
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
    queryClient.clear();
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

    render(<Toaster />);
  });

  describe('게시글 수정 리소스 API 호출', () => {
    test('게시글 수정 리소스 API 호출에 성공하면 게시글 정보를 가져온다', async () => {
      // when - 게시글 수정 리소스 API 호출에 성공
      const { result } = renderHook(() => useUpdatePostResource(), { wrapper });

      // then - 게시글 정보를 가져온다
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data?.data).toEqual(postData.getEdit.data);
      });
    });

    test('수정 정보 조회 실패 시 오류 화면과 복귀 링크를 유지한다', async () => {
      const toastCalls = spyOnToast();
      server.use(
        http.get(getHandlerURI(`/api/posts/:id/edit`), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      render(<UpdatePost />, { wrapper });
      expect(screen.getByRole('status')).toHaveTextContent(
        '불러오는 중입니다.'
      );
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '수정할 글을 불러오지 못했습니다.'
      );
      expect(
        screen.getByRole('link', { name: '게시판으로 돌아가기' })
      ).toHaveAttribute('href', '/post');
      expect(toastCalls.success).not.toHaveBeenCalled();
      expect(toastCalls.error).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('수정 화면에 다시 들어오면 이전 방문의 값 대신 새로 조회한 값으로 시작한다', async () => {
      const firstVisit = render(<UpdatePost />, { wrapper });
      expect(await screen.findByRole('textbox', { name: '제목' })).toHaveValue(
        postData.getEdit.data.title
      );
      firstVisit.unmount();
      server.use(
        http.get(getHandlerURI('/api/posts/:id/edit'), () =>
          HttpResponse.json({
            ...postData.getEdit,
            data: { ...postData.getEdit.data, title: '저장한 제목' },
          })
        )
      );

      render(<UpdatePost />, { wrapper });

      expect(screen.getByRole('status')).toHaveTextContent(
        '불러오는 중입니다.'
      );
      expect(
        screen.queryByRole('textbox', { name: '제목' })
      ).not.toBeInTheDocument();
      expect(await screen.findByRole('textbox', { name: '제목' })).toHaveValue(
        '저장한 제목'
      );
    });

    test('이전 방문에서 시작한 조회의 응답을 편집 기준으로 쓰지 않는다', async () => {
      const firstVisit = render(<UpdatePost />, { wrapper });
      await screen.findByRole('textbox', { name: '제목' });
      const late = Promise.withResolvers<Response>();
      const reload = jest.fn(() => late.promise);
      server.use(
        http.get(getHandlerURI('/api/posts/:id/edit'), reload, { once: true })
      );
      void queryClient.invalidateQueries({ queryKey: ['posts', { id: 1 }] });
      await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      firstVisit.unmount();
      const visit = jest.fn(() =>
        HttpResponse.json({
          ...postData.getEdit,
          data: { ...postData.getEdit.data, title: '이번 방문의 제목' },
        })
      );
      server.use(http.get(getHandlerURI('/api/posts/:id/edit'), visit));

      render(<UpdatePost />, { wrapper });

      const title = await screen.findByRole('textbox', { name: '제목' });
      expect(visit).toHaveBeenCalledTimes(1);
      expect(title).toHaveValue('이번 방문의 제목');
      late.resolve(HttpResponse.json(postData.getEdit));
      await act(async () => {
        await late.promise;
      });
      expect(title).toHaveValue('이번 방문의 제목');
    });

    test('다른 글로 갔다 돌아오면 보류 중이던 조회 대신 새로 조회한다', async () => {
      const pending = Promise.withResolvers<Response>();
      let requests = 0;
      server.use(
        http.get(getHandlerURI('/api/posts/:id/edit'), ({ params }) => {
          if (params.id === '2') return new HttpResponse(null, { status: 500 });
          requests += 1;
          return requests === 1
            ? pending.promise
            : HttpResponse.json({
                ...postData.getEdit,
                data: { ...postData.getEdit.data, title: '다시 조회한 제목' },
              });
        })
      );
      const { rerender } = render(<UpdatePost />, { wrapper });
      await waitFor(() => expect(requests).toBe(1));

      (useParams as jest.Mock).mockReturnValue({ id: '2' });
      rerender(<UpdatePost />);
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '수정할 글을 불러오지 못했습니다.'
      );
      (useParams as jest.Mock).mockReturnValue({ id: '1' });
      rerender(<UpdatePost />);

      const title = await screen.findByRole('textbox', { name: '제목' });
      expect(requests).toBe(2);
      expect(title).toHaveValue('다시 조회한 제목');
      pending.resolve(HttpResponse.json(postData.getEdit));
      await act(async () => {
        await pending.promise;
      });
      expect(title).toHaveValue('다시 조회한 제목');
    });

    test('다시 들어왔을 때 조회에 실패하면 이전 방문의 값으로 폼을 열지 않는다', async () => {
      const firstVisit = render(<UpdatePost />, { wrapper });
      await screen.findByRole('textbox', { name: '제목' });
      firstVisit.unmount();
      server.use(
        http.get(
          getHandlerURI('/api/posts/:id/edit'),
          () => new HttpResponse(null, { status: 500 })
        )
      );

      render(<UpdatePost />, { wrapper });

      expect(await screen.findByRole('alert')).toHaveTextContent(
        '수정할 글을 불러오지 못했습니다.'
      );
      expect(
        screen.queryByRole('textbox', { name: '제목' })
      ).not.toBeInTheDocument();
    });
  });

  test('재조회 중 본문 포커스와 편집값을 유지하고 변경하지 않은 필드만 갱신한다', async () => {
    const response = Promise.withResolvers<Response>();
    const reload = jest.fn(() => response.promise);
    const save = jest.fn();
    render(<UpdatePost />, { wrapper });
    const title = await screen.findByRole('textbox', { name: '제목' });
    const editor = screen.getByRole('textbox', { name: '본문' });
    expect(editor).toHaveValue(postData.getEdit.data.contents);
    fireEvent.change(title, { target: { value: '작성 중 제목' } });
    editor.focus();
    fireEvent.change(editor, { target: { value: '<p>작성 중 본문</p>' } });

    server.use(
      http.get(getHandlerURI('/api/posts/:id/edit'), reload),
      http.put(getHandlerURI('/api/posts/:id'), async ({ request }) => {
        save(await request.json());
        return HttpResponse.json(postData.update);
      })
    );
    void queryClient.invalidateQueries({ queryKey: ['posts', { id: 1 }] });
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(editor).toHaveFocus();
    response.resolve(
      HttpResponse.json({
        ...postData.getEdit,
        data: {
          ...postData.getEdit.data,
          title: '서버 제목',
          contents: '<p>서버 본문</p>',
          type: 'faq',
        },
      })
    );

    await waitFor(() =>
      expect(screen.getByLabelText('분류')).toHaveValue('faq')
    );
    expect(title).toHaveValue('작성 중 제목');
    expect(editor).toHaveValue('<p>작성 중 본문</p>');
    expect(editor).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '작성 중 제목',
          contents: '<p>작성 중 본문</p>',
          type: 'faq',
        })
      )
    );
  });

  test('재조회 실패 후에도 편집을 계속하고 다른 글로 이동하면 새 글의 값으로 시작한다', async () => {
    const { rerender } = render(<UpdatePost />, { wrapper });
    const title = await screen.findByRole('textbox', { name: '제목' });
    fireEvent.change(title, { target: { value: '첫 글 임시 제목' } });
    const nextPost = {
      ...postData.getEdit,
      data: {
        ...postData.getEdit.data,
        id: 2,
        title: '다른 글',
        contents: '<p>다른 본문</p>',
      },
    };
    server.use(
      http.get(getHandlerURI('/api/posts/:id/edit'), ({ params }) =>
        params.id === '1'
          ? new HttpResponse(null, { status: 503 })
          : HttpResponse.json(nextPost)
      )
    );
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts', { id: 1 }] });
    });
    expect(
      await screen.findByText(/최신 글을 불러오지 못했습니다/)
    ).toBeInTheDocument();
    expect(title).toHaveValue('첫 글 임시 제목');
    fireEvent.change(title, { target: { value: '계속 편집' } });
    expect(title).toHaveValue('계속 편집');

    (useParams as jest.Mock).mockReturnValue({ id: '2' });
    rerender(<UpdatePost />);
    expect(await screen.findByDisplayValue('다른 글')).toBeInTheDocument();
    expect(screen.getByLabelText('본문')).toHaveValue('<p>다른 본문</p>');
  });

  describe('분류 선택지를 확인한다', () => {
    test('FAQ 글을 불러오면 FAQ를 선택하고 분류 선택, 자유, 공지, FAQ 순서로 표시한다', async () => {
      server.use(
        http.get(getHandlerURI('/api/posts/:id/edit'), () =>
          HttpResponse.json({
            ...postData.getEdit,
            data: { ...postData.getEdit.data, type: 'faq' },
          })
        )
      );
      render(<UpdatePost />, { wrapper });

      await waitFor(() =>
        expect(
          screen.getByRole('combobox', { name: '분류' })
        ).toHaveDisplayValue('FAQ')
      );
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

    test('이전 분류를 선택 상태로 표시하고 새 분류로 기존 HTML을 저장한다', async () => {
      const toastCalls = spyOnToast();
      const contents =
        '<p><strong>기존 본문</strong><img src="/sample.png" alt="예제"></p>';
      const save = jest.fn();
      server.use(
        http.get(getHandlerURI('/api/posts/:id/edit'), () =>
          HttpResponse.json({
            ...postData.getEdit,
            data: { ...postData.getEdit.data, type: 'legacy', contents },
          })
        ),
        http.put(getHandlerURI('/api/posts/:id'), async ({ request }) => {
          save(await request.json());
          return HttpResponse.json(postData.update);
        })
      );
      render(<UpdatePost />, { wrapper });

      await waitFor(() =>
        expect(
          screen.getByRole('combobox', { name: '분류' })
        ).toHaveDisplayValue('분류 선택')
      );
      const select = screen.getByRole('combobox', { name: '분류' });
      const button = screen.getByRole('button', { name: '저장' });
      fireEvent.submit(button);
      await waitFor(() =>
        expect(select).toHaveAccessibleDescription('분류를 선택해 주세요.')
      );
      expect(save).not.toHaveBeenCalled();
      expect(toastCalls.success).not.toHaveBeenCalled();
      expect(toastCalls.error).not.toHaveBeenCalled();

      fireEvent.change(select, { target: { value: 'notice' } });
      fireEvent.submit(button);
      await waitFor(() =>
        expect(save).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'notice', contents })
        )
      );
      expect(
        await screen.findByRole('button', { name: '저장 완료' })
      ).toBeDisabled();
    });
  });

  describe('게시글 수정 API 호출', () => {
    test('수정 요청 중과 성공 후 상세 화면으로 이동할 때까지 재제출을 막는다', async () => {
      const response = Promise.withResolvers<Response>();
      const save = jest.fn(() => response.promise);
      server.use(http.put(getHandlerURI('/api/posts/:id'), () => save()));
      render(<UpdatePost />, { wrapper });
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
      const button = screen.getByRole<HTMLButtonElement>('button', {
        name: '저장',
      });
      if (!button.form) throw new Error('게시글 폼을 찾을 수 없습니다.');
      const form = button.form;
      fireEvent.submit(form);
      await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
      expect(button).toBeDisabled();
      fireEvent.submit(form);
      response.resolve(HttpResponse.json(postData.update));

      expect(
        await screen.findByRole('button', { name: '저장 완료' })
      ).toBeDisabled();
      expect(mockPush).toHaveBeenCalledWith('/post/1');
      expect(form).toBeInTheDocument();
      await waitFor(() => expect(form).toHaveAttribute('aria-busy', 'false'));
      await act(async () => {
        fireEvent.submit(form);
      });
      expect(save).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(
        await screen.findByText('게시글을 수정했습니다.')
      ).toBeInTheDocument();
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
      expect(
        await screen.findByText('게시글을 수정하지 못했습니다.')
      ).toBeInTheDocument();
    });
  });
});
