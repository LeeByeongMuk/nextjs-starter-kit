'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { type PostType } from '@entities/post';

import { PostsReq } from '../api/types';

export default function useSearchFilters() {
  const searchParams = useSearchParams();

  const [searchFilters, setSearchFilters] = useState<PostsReq>({
    type: (searchParams.get('type') as PostType) || '',
    q: searchParams.get('q') || '',
    page: Number(searchParams.get('page') || 1),
  });

  return { searchFilters, setSearchFilters };
}
