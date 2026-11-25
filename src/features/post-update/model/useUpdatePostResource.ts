'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { fetchUpdatePostResource } from '../api/postUpdateServices';

/** 편집용 데이터와 조회 상태를 화면에 제공한다. */
export default function useUpdatePostResource() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const updatePostResource = useQuery({
    queryKey: ['posts', { id }],
    queryFn: () => fetchUpdatePostResource({ id }),
  });

  return updatePostResource;
}
