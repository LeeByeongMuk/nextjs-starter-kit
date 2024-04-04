import { PaginationData } from '@/app/types/pagination';

type PostType = 'notice' | 'faq' | 'free';

interface PostsReq {
  page: number;
  type: PostType;
  q: string;
}

type PostListSearch = Omit<PostsReq, 'page'>;

interface PostListData {
  created_at: string;
  hit: number;
  id: number;
  title: string;
  type: PostType | null;
  user: {
    id: number;
    name: string;
  };
}

interface PostsRes extends PaginationData {
  data: PostListData[];
}

interface PostReq {
  id: number;
}

interface PostData {
  contents: string;
  created_at: string;
  hit: number;
  id: number;
  is_edit: boolean;
  title: string;
  type: PostType | null;
  user: {
    name: string;
    nickname: string;
  };
}

interface PostRes {
  data: PostData;
}

interface PostCreateReq {
  title: string;
  type: string | null;
  contents: string;
  is_open: boolean | null;
}

interface PostCreateRes {
  data: {
    id: number;
    message: string;
  };
}

interface PostUpdateReq {
  id: number;
  title: string;
  type: string | null;
  contents: string;
  is_open: boolean | null;
}

interface PostUpdateRes {
  data: {
    id: number;
    message: string;
  };
}

interface PostUpdateResourceReq {
  id: number;
}

interface PostUpdateResourceRes {
  data: {
    id: number;
    type: PostType | null;
    title: string;
    contents: string;
    is_open: boolean;
  };
}

export type {
  PostType,
  PostsReq,
  PostListSearch,
  PostListData,
  PostsRes,
  PostReq,
  PostData,
  PostRes,
  PostCreateReq,
  PostCreateRes,
  PostUpdateReq,
  PostUpdateRes,
  PostUpdateResourceReq,
  PostUpdateResourceRes,
};
