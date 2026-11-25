import { type PostType } from './types';

/** 글쓰기와 글 수정 폼에서 사용하는 입력값이다. */
export interface PostFormInput {
  title: string;
  type: PostType | '';
  contents: string;
  isOpen: '1' | '0';
}
