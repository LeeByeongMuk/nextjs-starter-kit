import { type PostType } from '@entities/post';

/** 목록의 게시글 분류 표시명 */
export const POST_TYPE_LABELS: Record<PostType | '', string> = {
  '': '전체',
  free: '자유',
  notice: '공지',
  faq: 'FAQ',
};
