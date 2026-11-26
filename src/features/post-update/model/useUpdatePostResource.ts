'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useId } from 'react';

import { fetchUpdatePostResource } from '../api/postUpdateServices';

/** 편집용 데이터와 조회 상태를 화면에 제공한다. */
export default function useUpdatePostResource() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  // 편집 기준은 이번 방문에서 시작한 조회의 응답이어야 한다. 방문마다 키를 달리해 이전 방문의 캐시와 그때 시작된 조회를 쓰지 않는다.
  const visit = useId();

  const updatePostResource = useQuery({
    queryKey: ['posts', { id, visit }],
    queryFn: () => fetchUpdatePostResource({ id }),
    gcTime: 0,
  });

  return updatePostResource;
}
