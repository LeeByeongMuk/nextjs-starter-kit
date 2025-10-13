import { PostType } from '@domains/post/_types/postType';
import { ApiResponse } from '@shared/types/api';

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
