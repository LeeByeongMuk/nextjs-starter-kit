import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { render, renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { fetchPosts } from '@/app/api/post';
import useReplaceSearchParams from '@/app/hooks/post/useReplaceSearchParams';
import { PostsReq } from '@/app/types/post';

// 테스트마다 새로운 QueryClient를 생성하는 함수
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

// Mock API 호출을 담당하는 함수
jest.mock('@/app/api/post', () => ({
  fetchPosts: jest.fn(),
}));

describe('게시글 목록 api 테스트', () => {
  const postsData = {
    data: [
      {
        create_at: '2024-01-01 00:00:00',
        hit: 0,
        id: 1,
        title: 'title',
        type: 'notice',
        user: { id: 1, name: 'name' },
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 mock을 초기화합니다.
  });

  const renderUseQueryHook = (postsReq: PostsReq) =>
    renderHook(
      () =>
        useQuery({
          queryKey: ['posts', postsReq],
          queryFn: () => fetchPosts(postsReq),
        }),
      { wrapper }
    );

  test('useQuery 훅이 정상적으로 fetchPosts 데이터를 가져오는지 확인', async () => {
    const postsReq: PostsReq = {
      page: 1,
      type: 'notice',
      q: '',
    };

    (fetchPosts as jest.Mock).mockResolvedValueOnce(postsData);

    const { result } = renderUseQueryHook(postsReq);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(postsData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('useQuery 훅이 fetchPosts 호출 실패 시 오류를 처리하는지 확인', async () => {
    const postsReq: PostsReq = {
      page: 1,
      type: 'notice',
      q: '',
    };

    const error = new Error('Failed to fetch posts');

    (fetchPosts as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderUseQueryHook(postsReq);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(error);
  });

  test('fetchPosts 검색 성공 테스트', async () => {
    const postsReq: PostsReq = {
      page: 1,
      type: 'notice',
      q: 'title',
    };

    (fetchPosts as jest.Mock).mockResolvedValueOnce(postsData);

    const { result } = renderUseQueryHook(postsReq);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(postsData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('fetchPosts 검색 실패 테스트', async () => {
    const postsReq = {
      page: 0,
      type: 'type',
      q: '',
    };

    const error = new Error('Failed to fetch posts');

    (fetchPosts as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderUseQueryHook(postsReq as PostsReq);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(error);
  });
});

// useRouter 를 모킹합니다.
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const MockComponent = ({ searchFilters }: { searchFilters: PostsReq }) => {
  useReplaceSearchParams({ searchFilters });
  return <div data-test={searchFilters} />;
};

describe('게시글 페이지 기능 테스트', () => {
  let routerReplaceMock: jest.Mock;

  beforeEach(() => {
    routerReplaceMock = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      replace: routerReplaceMock,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('useEffect 가 URL 을 올바르게 변경하는지 확인', async () => {
    const searchFilters: PostsReq = {
      type: 'notice',
      q: 'query',
      page: 1,
    };
    await act(async () => {
      render(<MockComponent searchFilters={searchFilters} />);
    });

    // 기대하는 URL 파라미터
    const expectedUrl = '?type=notice&q=query&page=1';

    // router.replace 가 올바르게 호출되었는지 확인합니다.
    expect(routerReplaceMock).toHaveBeenCalledWith(expectedUrl);
  });
});
