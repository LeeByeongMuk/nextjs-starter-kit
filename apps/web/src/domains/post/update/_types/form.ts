import { PostType } from '@domains/post/_types/postType';

export interface UpdatePostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}
