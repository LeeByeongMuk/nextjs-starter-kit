import { PostType } from '@domains/post/_types/postType';

export interface CreatePostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}
