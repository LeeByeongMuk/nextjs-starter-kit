import PostList from '@app/(domain)/post/(list)/page';
import { type PostListData, type PostsRes } from '@features/post-list';
import { server } from '@shared/api/mocks/testServer';
import { getHandlerURI } from '@shared/lib/url';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

jest.mock('next/headers');
jest.mock('next/navigation');
jest.mock('next-auth/react');

const posts: PostListData[] = (
  [
    {
      type: 'notice',
      titles: ['React 설치 공지', 'React 업데이트 공지', 'React 운영 공지'],
    },
    {
      type: 'free',
      titles: ['React 설치 후기', 'React 사용 후기', 'React 학습 후기'],
    },
    {
      type: 'faq',
      titles: ['React 설치 질문', 'React 사용 질문', 'React 배포 질문'],
    },
  ] as const
).flatMap((group, groupIndex) =>
  group.titles.map((title, index) => ({
    id: groupIndex * 3 + index + 1,
    type: group.type,
    title,
    hit: 0,
    created_at: '2026-09-01T00:00:00.000Z',
    user: { id: 1, name: '테스트 작성자', nickname: '작성자' },
  }))
);

describe('게시글 리스트 페이지 테스트', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  const postRequests = jest.fn();
  let queryClient: QueryClient;

  const renderPostList = (search = 'type=notice&q=React&page=1') => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(search));
    return render(
      <QueryClientProvider client={queryClient}>
        <PostList />
      </QueryClientProvider>
    );
  };

  const expectFilters = async (
    filters: { type: string; q: string; page: number },
    title: string
  ) => {
    await waitFor(() => {
      expect(screen.getByRole('link', { name: title })).toBeVisible();
      expect(postRequests).toHaveBeenLastCalledWith({
        type: filters.type,
        q: filters.q,
        page: String(filters.page),
      });
      expect(router.replace).toHaveBeenLastCalledWith(
        `?${new URLSearchParams({
          type: filters.type,
          q: filters.q,
          page: String(filters.page),
        })}`
      );
    });
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    router.push.mockClear();
    router.replace.mockClear();
    postRequests.mockClear();
    (cookies as jest.Mock).mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
      get: jest.fn(),
    });
    (useRouter as jest.Mock).mockReturnValue(router);
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    server.use(
      http.get(getHandlerURI('/api/posts'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        postRequests(Object.fromEntries(params));
        const page = Number(params.get('page'));
        const type = params.get('type');
        const q = params.get('q') || '';
        const filteredPosts = posts.filter(
          post => (!type || post.type === type) && post.title.includes(q)
        );
        return HttpResponse.json({
          ok: true,
          message: '',
          data: filteredPosts.slice(page - 1, page),
          meta: {
            current_page: page,
            last_page: Math.max(filteredPosts.length, 1),
            total: filteredPosts.length,
          },
        } satisfies PostsRes);
      })
    );
  });

  afterEach(() => {
    queryClient.clear();
  });

  test('초기 URL의 분류, 검색어, 페이지로 요청하고 해당 결과를 표시한다', async () => {
    renderPostList('type=notice&q=React&page=2');
    expect(screen.getByLabelText('검색')).toHaveValue('React');
    expect(screen.getByLabelText('분류')).toHaveValue('notice');
    await expectFilters(
      { type: 'notice', q: 'React', page: 2 },
      'React 업데이트 공지'
    );
    expect(screen.getByRole('link', { name: '2 페이지' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.queryByRole('link', { name: 'React 설치 공지' })
    ).not.toBeInTheDocument();
  });

  test('검색 제출은 분류를 보존하고 첫 페이지의 URL, 요청, 결과를 갱신한다', async () => {
    renderPostList('type=notice&q=React&page=3');
    await screen.findByRole('link', { name: 'React 운영 공지' });
    const requestCount = postRequests.mock.calls.length;
    fireEvent.change(screen.getByLabelText('검색'), {
      target: { value: '설치' },
    });
    expect(postRequests).toHaveBeenCalledTimes(requestCount);
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await expectFilters(
      { type: 'notice', q: '설치', page: 1 },
      'React 설치 공지'
    );
    expect(
      screen.queryByRole('link', { name: 'React 운영 공지' })
    ).not.toBeInTheDocument();
  });

  test('검색어를 비워 제출하면 검색 조건을 해제한다', async () => {
    renderPostList('type=notice&q=설치&page=1');
    await screen.findByRole('link', { name: 'React 설치 공지' });
    fireEvent.change(screen.getByLabelText('검색'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    await expectFilters({ type: 'notice', q: '', page: 1 }, 'React 설치 공지');
    expect(screen.getByRole('link', { name: '3 페이지' })).toHaveAttribute(
      'href',
      '/post?type=notice&q=&page=3'
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('한 글자 검색은 오류를 알리고 URL, 요청, 기존 결과를 유지한다', async () => {
    renderPostList();
    await screen.findByRole('link', { name: 'React 설치 공지' });
    const requestCount = postRequests.mock.calls.length;
    const replaceCount = router.replace.mock.calls.length;
    fireEvent.change(screen.getByLabelText('검색'), { target: { value: 'R' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '검색어를 2자 이상 입력하거나 비워 주세요.'
    );
    expect(screen.getByLabelText('검색')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByLabelText('검색')).toHaveAccessibleDescription(
      '검색어를 2자 이상 입력하거나 비워 주세요.'
    );
    expect(postRequests).toHaveBeenCalledTimes(requestCount);
    expect(router.replace).toHaveBeenCalledTimes(replaceCount);
    expect(screen.getByRole('link', { name: 'React 설치 공지' })).toBeVisible();
  });

  test('분류 select 변경은 검색어를 보존하고 첫 페이지를 요청한다', async () => {
    renderPostList('type=notice&q=React&page=3');
    await screen.findByRole('link', { name: 'React 운영 공지' });
    fireEvent.change(screen.getByLabelText('분류'), {
      target: { value: 'faq' },
    });
    await expectFilters(
      { type: 'faq', q: 'React', page: 1 },
      'React 설치 질문'
    );
    expect(screen.getByLabelText('분류')).toHaveValue('faq');
    expect(screen.getByRole('button', { name: 'FAQ' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test.each([
    ['전체', '', 'React 설치 공지'],
    ['자유', 'free', 'React 설치 후기'],
    ['공지', 'notice', 'React 설치 공지'],
    ['FAQ', 'faq', 'React 설치 질문'],
  ])(
    '%s 분류 버튼은 URL과 요청, 결과를 함께 갱신한다',
    async (label, type, title) => {
      renderPostList('type=faq&q=React&page=3');
      await screen.findByRole('link', { name: 'React 배포 질문' });
      fireEvent.click(screen.getByRole('button', { name: label }));
      await expectFilters({ type, q: 'React', page: 1 }, title);
      expect(screen.getByLabelText('분류')).toHaveValue(type);
      expect(screen.getByRole('button', { name: label })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    }
  );

  test('목록 행은 분류와 작성자를 상세 화면과 같은 이름으로 표시한다', async () => {
    server.use(
      http.get(getHandlerURI('/api/posts'), () =>
        HttpResponse.json({
          ok: true,
          message: '',
          data: [
            { ...posts[6], id: 101, title: '질문 행' },
            {
              ...posts[0],
              id: 102,
              title: '분류 없는 행',
              type: null,
              user: { id: 2, name: '', nickname: '' },
            },
          ],
          meta: { current_page: 1, last_page: 1, total: 2 },
        } satisfies PostsRes)
      )
    );
    renderPostList('type=&q=&page=1');
    const faqRow = (
      await screen.findByRole('link', { name: '질문 행' })
    ).closest('tr');
    const untypedRow = screen
      .getByRole('link', { name: '분류 없는 행' })
      .closest('tr');
    expect(faqRow).toHaveTextContent('FAQ');
    expect(untypedRow).toHaveTextContent('미분류');
    expect(untypedRow).toHaveTextContent('작성자 미상');
    expect(
      Array.from(
        (screen.getByLabelText('분류') as HTMLSelectElement).options,
        option => option.textContent
      )
    ).toEqual(['전체', '자유', '공지', 'FAQ']);
  });

  test('2 페이지, 다음, 이전 이동은 필터가 보존된 링크와 요청을 사용한다', async () => {
    renderPostList();
    await screen.findByRole('link', { name: 'React 설치 공지' });
    const secondPage = screen.getByRole('link', { name: '2 페이지' });
    expect(secondPage).toHaveAttribute(
      'href',
      '/post?type=notice&q=React&page=2'
    );
    expect(secondPage).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: '1 페이지' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.queryByRole('link', { name: '이전' })
    ).not.toBeInTheDocument();

    fireEvent.click(secondPage);
    await expectFilters(
      { type: 'notice', q: 'React', page: 2 },
      'React 업데이트 공지'
    );
    expect(screen.getByRole('link', { name: '2 페이지' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: '1 페이지' })).not.toHaveAttribute(
      'aria-current'
    );
    expect(screen.getByRole('link', { name: '이전' })).toHaveAttribute(
      'href',
      '/post?type=notice&q=React&page=1'
    );
    expect(screen.getByRole('link', { name: '다음' })).toHaveAttribute(
      'href',
      '/post?type=notice&q=React&page=3'
    );

    fireEvent.click(screen.getByRole('link', { name: '다음' }));
    await expectFilters(
      { type: 'notice', q: 'React', page: 3 },
      'React 운영 공지'
    );
    expect(screen.getByRole('link', { name: '3 페이지' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.queryByRole('link', { name: '다음' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '이전' })).toHaveAttribute(
      'href',
      '/post?type=notice&q=React&page=2'
    );

    fireEvent.click(screen.getByRole('link', { name: '이전' }));
    await expectFilters(
      { type: 'notice', q: 'React', page: 2 },
      'React 업데이트 공지'
    );
    expect(postRequests.mock.calls.map(([params]) => params.page)).toEqual([
      '1',
      '2',
      '3',
      '2',
    ]);
  });

  test.each([
    ['Meta', { metaKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['가운데 버튼', { button: 1 }],
  ])(
    '%s 클릭은 브라우저의 링크 동작을 취소하거나 현재 필터를 바꾸지 않는다',
    async (_, options) => {
      renderPostList();
      await screen.findByRole('link', { name: 'React 설치 공지' });
      const requestCount = postRequests.mock.calls.length;
      const replaceCount = router.replace.mock.calls.length;
      const secondPage = screen.getByRole('link', { name: '2 페이지' });
      const event = createEvent.click(secondPage, options);
      fireEvent(secondPage, event);
      expect(event.defaultPrevented).toBe(false);
      expect(secondPage).toHaveAttribute(
        'href',
        '/post?type=notice&q=React&page=2'
      );
      expect(router.replace).toHaveBeenCalledTimes(replaceCount);
      expect(postRequests).toHaveBeenCalledTimes(requestCount);
      expect(screen.getByRole('link', { name: '1 페이지' })).toHaveAttribute(
        'aria-current',
        'page'
      );
    }
  );

  test('일치하는 결과가 없으면 빈 목록과 다음 행동을 안내한다', async () => {
    renderPostList('type=notice&q=없는검색어&page=1');
    expect(await screen.findByText('표시할 게시글이 없습니다.')).toBeVisible();
    expect(
      screen.getByText('검색어를 바꾸거나 다른 분류를 선택해 보세요.')
    ).toBeVisible();
    expect(postRequests).toHaveBeenLastCalledWith({
      type: 'notice',
      q: '없는검색어',
      page: '1',
    });
    expect(
      screen.queryByRole('link', { name: '다음' })
    ).not.toBeInTheDocument();
  });

  test('응답을 기다리는 동안 로딩을 알리고 완료 후 결과를 표시한다', async () => {
    let releaseResponse!: () => void;
    const responseReady = new Promise<void>(resolve => {
      releaseResponse = resolve;
    });
    server.use(
      http.get(getHandlerURI('/api/posts'), async () => {
        await responseReady;
        return HttpResponse.json({
          ok: true,
          message: '',
          data: [posts[0]],
          meta: { current_page: 1, last_page: 3, total: 3 },
        } satisfies PostsRes);
      })
    );
    renderPostList();
    expect(screen.getByRole('status')).toHaveTextContent(
      '게시글을 불러오는 중…'
    );
    expect(
      screen.queryByText('표시할 게시글이 없습니다.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'React 설치 공지' })
    ).not.toBeInTheDocument();
    releaseResponse();
    expect(
      await screen.findByRole('link', { name: 'React 설치 공지' })
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('현재 1개 표시');
  });

  test('목록 요청 실패는 로딩을 끝내고 오류 UI와 기존 알림을 표시한다', async () => {
    server.use(
      http.get(
        getHandlerURI('/api/posts'),
        () => new HttpResponse(null, { status: 500 })
      )
    );
    renderPostList();
    expect(
      await screen.findByText('게시글을 불러오지 못했습니다.')
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      '목록을 불러오지 못했습니다.'
    );
    expect(
      screen.queryByText('표시할 게시글이 없습니다.')
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to fetch posts');
    });
  });
});
