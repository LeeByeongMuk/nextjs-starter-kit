'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchPosts } from '../api/postsServices';
import { PostsReq, PostsRes } from '../api/types';

interface Props {
  searchFilters: PostsReq;
}

/** 검색 조건에 맞는 목록 데이터와 조회 상태를 화면에 제공한다. */
export default function usePostList({ searchFilters }: Props) {
  const postListQuery = useQuery({
    queryKey: ['posts', searchFilters],
    queryFn: () => fetchPosts(searchFilters),
    initialData: {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        total: 0,
      },
      links: {},
    } as unknown as PostsRes,
  });

  return postListQuery;
}
