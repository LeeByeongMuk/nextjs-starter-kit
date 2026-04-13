import { PostType } from '@domains/post/_types/postType';
import { ApiResponse } from '@shared/api/types';
import { PaginationData } from '@shared/api/pagination';

export interface PostsReq {
  page: number;
  type: PostType;
  q: string;
}

export type PostListSearch = Omit<PostsReq, 'page'>;

export interface PostListData {
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

export interface PostsRes extends ApiResponse, PaginationData {
  data: PostListData[];
}
