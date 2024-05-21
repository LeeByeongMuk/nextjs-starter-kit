import {
  PostCreateReq,
  PostCreateRes,
  PostReq,
  PostRes,
  PostsReq,
  PostsRes,
  PostUpdateReq,
  PostUpdateRes,
  PostUpdateResourceReq,
  PostUpdateResourceRes,
} from '@/app/types/post';
import { fetchApi } from '@/app/utils/api';

const fetchPosts = async ({ page, type, q }: PostsReq) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('type', type);
  params.append('q', q);

  const url = `/api/posts?${params.toString()}`;

  return (await fetchApi(url, {
    method: 'GET',
  })) as PostsRes;
};

const fetchPost = async ({ id }: PostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'GET',
  })) as PostRes;
};

const fetchPostCreate = async ({
  title,
  type,
  contents,
  is_open,
}: PostCreateReq) => {
  return (await fetchApi('/api/posts', {
    method: 'POST',
    body: JSON.stringify({
      title,
      type: type || null,
      contents,
      is_open,
    }),
  })) as PostCreateRes;
};

const fetchPostUpdate = async ({
  id,
  title,
  type,
  contents,
  is_open,
}: PostUpdateReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      type: type || null,
      contents,
      is_open,
    }),
  })) as PostUpdateRes;
};

const fetchPostUpdateResource = async ({ id }: PostUpdateResourceReq) => {
  return (await fetchApi(`/api/posts/${id}/edit`, {
    method: 'GET',
  })) as PostUpdateResourceRes;
};

export {
  fetchPosts,
  fetchPost,
  fetchPostCreate,
  fetchPostUpdate,
  fetchPostUpdateResource,
};
export type { PostCreateReq, PostUpdateReq };
