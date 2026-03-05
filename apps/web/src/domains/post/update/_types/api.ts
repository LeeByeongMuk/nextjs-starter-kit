import { PostType } from '@domains/post/_types/postType';
import { ApiResponse } from '@shared/types/api';

export interface UpdatePostReq {
  id: number;
  title: string;
  type: PostType;
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
  type: PostType;
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

export interface DeletePostReq {
  id: number;
}

export type DeletePostRes = ApiResponse;
