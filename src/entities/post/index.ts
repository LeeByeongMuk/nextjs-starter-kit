export { default as Pagination } from './ui/Pagination';
export { default as ButtonBox } from './ui/Form/ButtonBox';
export { default as IsOpenCheckbox } from './ui/Form/IsOpenCheckbox';
export { default as TitleInput } from './ui/Form/TitleInput';
export { default as TypeSelect } from './ui/Form/TypeSelect';

// DOM-dependent components (TUI editor) are intentionally excluded from
// the barrel — import them via the deep path inside `'use client'` files:
//   import Editor from '@entities/post/ui/Editor';
//   import ContentsEditor from '@entities/post/ui/Form/ContentsEditor';

export type { PostType } from './model/types';

export {
  TYPE_OPTIONS,
  LIST_TYPE_OPTIONS,
  PAGE_GROUP_NUMBER,
  DUMMY_DATA,
} from './config/post';
