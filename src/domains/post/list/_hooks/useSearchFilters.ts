'use client';

import { PostType } from '@entities/post/model/types';
import { PostsReq } from '@domains/post/list/_types/api';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function useSearchFilters() {
  const searchParams = useSearchParams();

  const [searchFilters, setSearchFilters] = useState<PostsReq>({
    type: (searchParams.get('type') as PostType) || '',
    q: searchParams.get('q') || '',
    page: Number(searchParams.get('page') || 1),
  });

  return { searchFilters, setSearchFilters };
}
