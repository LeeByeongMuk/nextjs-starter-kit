import { type PostType } from '@entities/post';

export interface UpdatePostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}
