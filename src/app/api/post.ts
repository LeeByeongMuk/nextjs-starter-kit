import {
  CreatePostReq,
  CreatePostRes,
  PostReq,
  PostRes,
  PostsReq,
  PostsRes,
  UpdatePostReq,
  UpdatePostRes,
  UpdatePostResourceReq,
  UpdatePostResourceRes,
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

const fetchCreatePost = async ({
  title,
  type,
  contents,
  is_open,
}: CreatePostReq) => {
  return (await fetchApi('/api/posts', {
    method: 'POST',
    body: JSON.stringify({
      title,
      type: type || null,
      contents,
      is_open,
    }),
  })) as CreatePostRes;
};

const fetchUpdatePost = async ({
  id,
  title,
  type,
  contents,
  is_open,
}: UpdatePostReq) => {
  return (await fetchApi(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      type: type || null,
      contents,
      is_open,
    }),
  })) as UpdatePostRes;
};

const fetchUpdatePostResource = async ({ id }: UpdatePostResourceReq) => {
  return (await fetchApi(`/api/posts/${id}/edit`, {
    method: 'GET',
  })) as UpdatePostResourceRes;
};

export {
  fetchPosts,
  fetchPost,
  fetchCreatePost,
  fetchUpdatePost,
  fetchUpdatePostResource,
};
export type { CreatePostReq, UpdatePostReq };
