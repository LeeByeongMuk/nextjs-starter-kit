'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

import { PostsReq } from '../api/types';
import { parseSearchFilters, stringifySearchFilters } from './searchFilters';

/** URL 검색 조건에서 목록 필터를 읽고 필터 변경은 URL 교체로 반영한다 */
export default function useSearchFilters() {
  const router = useRouter();
  const search = useSearchParams().toString();
  const searchFilters = useMemo(() => parseSearchFilters(search), [search]);

  const setSearchFilters = (action: React.SetStateAction<PostsReq>) => {
    const nextFilters =
      typeof action === 'function' ? action(searchFilters) : action;
    router.replace(`?${stringifySearchFilters(nextFilters)}`);
  };

  return { searchFilters, setSearchFilters };
}
