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
  is_editable: boolean;
  title: string;
  type: PostType | null;
  user_name: string;
}

interface PostRes {
  data: PostData;
}

interface CreatePostReq {
  title: string;
  type: PostType;
  contents: string;
  is_open: boolean;
}

interface CreatePostRes {
  data: {
    id: number;
    message: string;
  };
}

interface UpdatePostReq {
  id: number;
  title: string;
  type: PostType;
  contents: string;
  is_open: boolean;
}

interface UpdatePostRes {
  data: {
    id: number;
    message: string;
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

interface UpdatePostResourceRes {
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
