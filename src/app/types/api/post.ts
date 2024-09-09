import { ApiResponse } from '@/app/types/api/common';
import { PaginationData } from '@/app/types/api/pagination';

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
    nickname: string;
  };
}

interface PostsRes extends ApiResponse, PaginationData {
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
  is_editable: boolean;
  title: string;
  type: PostType | null;
  user_name: string;
}

interface PostRes extends ApiResponse {
  data: PostData;
}

interface CreatePostReq {
  title: string;
  type: PostType;
  contents: string;
  is_open: boolean;
}

interface CreatePostRes extends ApiResponse {
  data: {
    id: number;
  };
}

interface UpdatePostReq {
  id: number;
  title: string;
  type: PostType;
  contents: string;
  is_open: boolean;
}

interface UpdatePostRes extends ApiResponse {
  data: {
    id: number;
  };
}

interface UpdatePostResourceData {
  id: number;
  type: PostType;
  title: string;
  contents: string;
  is_open: boolean;
}

interface UpdatePostResourceReq {
  id: number;
}

interface UpdatePostResourceRes extends ApiResponse {
  data: UpdatePostResourceData;
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
  CreatePostReq,
  CreatePostRes,
  UpdatePostReq,
  UpdatePostRes,
  UpdatePostResourceData,
  UpdatePostResourceReq,
  UpdatePostResourceRes,
};
