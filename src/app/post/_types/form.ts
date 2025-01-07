import { PostType } from '@/app/post/_types/api';

interface PostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}

export type { PostFormInput };
