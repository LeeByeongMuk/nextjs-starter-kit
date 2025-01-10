import { PostsReq, PostsRes } from '@domains/post/list/_types/api';
import { fetchApi } from '@shared/utils/api';

export const fetchPosts = async ({ page, type, q }: PostsReq) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('type', type);
  params.append('q', q);

  const url = `/api/posts?${params.toString()}`;

  return (await fetchApi(url, {
    method: 'GET',
  })) as PostsRes;
};
