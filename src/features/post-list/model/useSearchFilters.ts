'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef } from 'react';

import { PostsReq } from '../api/types';
import { parseSearchFilters, stringifySearchFilters } from './searchFilters';

/** URL 검색 조건에서 목록 필터를 읽고 필터 변경은 URL 교체로 반영한다 */
export default function useSearchFilters() {
  const router = useRouter();
  const search = useSearchParams().toString();
  const searchFilters = useMemo(() => parseSearchFilters(search), [search]);
  // URL 교체는 비동기로 반영되므로 반영 전에 이어진 변경은 마지막 요청값을 기준으로 합친다
  const pendingFilters = useRef<PostsReq | null>(null);

  useEffect(() => {
    pendingFilters.current = null;
  }, [search]);

  const setSearchFilters = (action: React.SetStateAction<PostsReq>) => {
    const baseFilters = pendingFilters.current ?? searchFilters;
    const nextFilters =
      typeof action === 'function' ? action(baseFilters) : action;
    pendingFilters.current = nextFilters;
    router.replace(`?${stringifySearchFilters(nextFilters)}`);
  };

  return { searchFilters, setSearchFilters };
}
