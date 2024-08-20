'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchPosts } from '@/app/api/post';
import { PostsReq, PostsRes } from '@/app/types/post';

interface Props {
  searchFilters: PostsReq;
}

export default function usePostList({ searchFilters }: Props) {
  return useQuery({
    queryKey: ['posts', searchFilters],
    queryFn: () => fetchPosts(searchFilters),
    initialData: {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
      },
      links: {},
    } as unknown as PostsRes,
  });
}
