import { PostType } from '@/app/types/api/post';

interface PostFormInput {
  title: string;
  type: PostType;
  contents: string;
  isOpen: '1' | '0';
}

export type { PostFormInput };
