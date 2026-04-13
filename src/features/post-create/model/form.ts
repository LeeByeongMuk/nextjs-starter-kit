import { PostType } from '@entities/post/model/types';

export interface CreatePostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}
