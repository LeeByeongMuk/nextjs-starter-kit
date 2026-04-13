import { PostType } from '@entities/post/model/types';

export interface UpdatePostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}
