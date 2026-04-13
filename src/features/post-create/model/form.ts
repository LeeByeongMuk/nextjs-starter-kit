import { type PostType } from '@entities/post';

export interface CreatePostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}
