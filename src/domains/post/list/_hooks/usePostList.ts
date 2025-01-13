'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchPosts } from '@domains/post/list/_services/postsServices';
import { PostsReq, PostsRes } from '@domains/post/list/_types/api';

interface Props {
  searchFilters: PostsReq;
}

export default function usePostList({ searchFilters }: Props) {
  const postListQuery = useQuery({
    queryKey: ['posts', searchFilters],
    queryFn: async () => {
      return await fetchPosts(searchFilters);

      const params = new URLSearchParams();
      params.append('page', searchFilters.page.toString());
      params.append('type', searchFilters.type);
      params.append('q', searchFilters.q);
      const res = await fetch(
        `${process.env.APP_API_URL}/api/posts?${params.toString()}`
      );

      return res.json();
    },
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
      console.log('asd');
      console.log(postListQuery.error);
      alert('Failed to fetch posts');
    }
  }, [isError]);

  return postListQuery;
}
