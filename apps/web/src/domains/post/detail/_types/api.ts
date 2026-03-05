import { PostType } from '@domains/post/_types/postType';
import { ApiResponse } from '@shared/types/api';

export interface PostReq {
  id: number;
}

export interface PostData {
  contents: string;
  created_at: string;
  hit: number;
  id: number;
  is_editable: boolean;
  title: string;
  type: PostType | null;
  user_name: string;
}

export interface PostRes extends ApiResponse {
  data: PostData;
}
