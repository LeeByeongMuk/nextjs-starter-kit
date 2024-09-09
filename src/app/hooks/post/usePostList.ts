'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchPosts } from '@/app/api/post';
import { PostsReq, PostsRes } from '@/app/types/api/post';

interface Props {
  searchFilters: PostsReq;
}

export default function usePostList({ searchFilters }: Props) {
  const postListQuery = useQuery({
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
  const { isError } = postListQuery;

  useEffect(() => {
    if (isError) {
      alert('Failed to fetch posts');
    }
  }, [isError]);

  return postListQuery;
}
