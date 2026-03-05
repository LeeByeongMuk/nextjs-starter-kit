'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { PostType } from '@domains/post/_types/postType';
import { PostsReq } from '@domains/post/list/_types/api';

export default function useSearchFilters() {
  const searchParams = useSearchParams();

  const [searchFilters, setSearchFilters] = useState<PostsReq>({
    type: (searchParams.get('type') as PostType) || '',
    q: searchParams.get('q') || '',
    page: Number(searchParams.get('page') || 1),
  });

  return { searchFilters, setSearchFilters };
}
