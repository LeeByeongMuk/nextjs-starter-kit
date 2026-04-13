'use client';

import { fetchPosts } from '@features/post-list/api/postsServices';
import { PostsReq, PostsRes } from '@features/post-list/api/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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
        total: 0,
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
