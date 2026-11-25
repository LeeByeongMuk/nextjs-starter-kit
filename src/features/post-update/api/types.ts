import { type PostType } from '@entities/post';
import { ApiResponse } from '@shared/api/types';

export interface UpdatePostReq {
  id: number;
  title: string;
  type: PostType | null;
  contents: string;
  is_open: boolean;
}

export interface UpdatePostRes extends ApiResponse {
  data: {
    id: number;
  };
}

export interface UpdatePostResourceData {
  id: number;
  type: string | null;
  title: string;
  contents: string;
  is_open: boolean;
}

export interface UpdatePostResourceReq {
  id: number;
}

export interface UpdatePostResourceRes extends ApiResponse {
  data: UpdatePostResourceData;
}
