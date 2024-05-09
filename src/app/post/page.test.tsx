import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { fetchPosts } from '@/app/api/post';
import { PostsReq } from '@/app/types/post';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mock API 호출을 담당하는 함수
jest.mock('@/app/api/post', () => ({
  fetchPosts: jest.fn(),
}));

test('useQuery 훅이 정상적으로 데이터를 가져오는지 확인', async () => {
  const postsReq: PostsReq = {
    page: 1,
    type: 'notice',
    q: '',
  };
  // API 호출이 성공적으로 완료될 경우 반환할 데이터
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

  // fetchPosts 함수가 성공적으로 호출될 때 반환할 값을 설정
  (fetchPosts as jest.Mock).mockResolvedValueOnce(postsData);

  // useQuery 훅을 렌더링합니다.
  const { result } = renderHook(
    () =>
      useQuery({
        queryKey: ['posts', postsReq],
        queryFn: () => fetchPosts(postsReq),
      }),
    { wrapper }
  );

  // useQuery 훅이 데이터를 가져오기를 기다립니다.
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  // useQuery 훅의 반환값을 확인합니다.
  expect(result.current.data).toEqual(postsData);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBe(null);
});
