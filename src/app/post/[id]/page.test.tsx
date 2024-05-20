// 테스트마다 새로운 QueryClient를 생성하는 함수
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { fetchPost } from '@/app/api/post';
import { PostData, PostReq } from '@/app/types/post';

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
  fetchPost: jest.fn(),
}));

describe('게시글 상세 api 테스트', () => {
  const postData: PostData = {
    contents: '',
    created_at: '',
    hit: 0,
    id: 0,
    is_edit: false,
    title: '',
    type: 'notice',
    user: {
      name: '',
      nickname: '',
    },
  };

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 mock 을 초기화합니다.
  });

  const renderUseQueryHook = (postReq: PostReq) =>
    renderHook(
      () =>
        useQuery({
          queryKey: ['post', postReq],
          queryFn: () => fetchPost(postReq),
        }),
      { wrapper }
    );

  test('게시글 상세 api 호출 성공', async () => {
    const postReq = {
      id: 1,
    };
    (fetchPost as jest.Mock).mockResolvedValue(postData);
    const { result } = renderUseQueryHook(postReq);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(postData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('게시글 상세 api 호출 실패', async () => {
    const postReq = {
      id: 1,
    };
    const error = new Error('Failed to fetch posts');

    (fetchPost as jest.Mock).mockRejectedValue(error);
    const { result } = renderUseQueryHook(postReq);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(error);
  });
});
