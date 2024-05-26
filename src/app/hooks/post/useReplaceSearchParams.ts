import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { PostsReq } from '@/app/types/post';

interface Props {
  searchFilters: PostsReq;
}

export default function useReplaceSearchParams({ searchFilters }: Props) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.append('type', searchFilters.type);
    params.append('q', searchFilters.q);
    params.append('page', searchFilters.page.toString());

    const url = `?${params.toString()}`;
    router.replace(url);
  }, [searchFilters, router]);
}
