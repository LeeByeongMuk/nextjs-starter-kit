export { default as ButtonBox } from './ui/Form/ButtonBox';
export { default as IsOpenCheckbox } from './ui/Form/IsOpenCheckbox';
export { default as TitleInput } from './ui/Form/TitleInput';
export { default as TypeSelect } from './ui/Form/TypeSelect';
export { default as Pagination } from './ui/Pagination';

// DOM-dependent components (TUI editor) are intentionally excluded from
// the barrel — import them via the deep path inside `'use client'` files:
//   import Editor from '@entities/post/ui/Editor';
//   import ContentsEditor from '@entities/post/ui/Form/ContentsEditor';

export type { DeletePostReq, DeletePostRes } from './api/types';
export {
  DUMMY_DATA,
  LIST_TYPE_OPTIONS,
  PAGE_GROUP_NUMBER,
  TYPE_OPTIONS,
} from './config/post';
export type { PostType } from './model/types';
export { default as useDeletePost } from './model/useDeletePost';
