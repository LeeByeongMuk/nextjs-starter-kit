'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { fetchPost } from '../api/postDetailServices';
import { PostRes } from '../api/types';

/** 상세 데이터와 조회 상태를 화면에 제공한다. */
export default function usePost() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const postQuery = useQuery({
    initialData: {
      data: {
        contents: '',
        created_at: '',
        hit: 0,
        id: 0,
        is_editable: false,
        title: '',
        type: '',
        user_name: '',
      },
    } as unknown as PostRes,
    queryFn: () => fetchPost({ id }),
    queryKey: ['post', { id }],
  });
  return postQuery;
}
