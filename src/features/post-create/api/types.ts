import { type PostType } from '@entities/post';
import { ApiResponse } from '@shared/api/types';

export interface CreatePostReq {
  title: string;
  type: PostType;
  contents: string;
  is_open: boolean;
}

export interface CreatePostRes extends ApiResponse {
  data: {
    id: number;
  };
}
