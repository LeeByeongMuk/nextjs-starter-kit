import { type PostType } from '../model/types';

/** 게시글 분류별 표시명 — 분류 선택지도 이 순서를 따른다 */
export const POST_TYPE_LABELS: Record<PostType, string> = {
  free: '자유',
  notice: '공지',
  faq: 'FAQ',
};

const isPostType = (type: string): type is PostType =>
  Object.hasOwn(POST_TYPE_LABELS, type);

/** 게시글 분류 표시명 — 분류가 없거나 알 수 없는 값이면 '미분류' */
export const getPostTypeLabel = (type: string | null | undefined): string =>
  type && isPostType(type) ? POST_TYPE_LABELS[type] : '미분류';

const createTypeOptions = (emptyLabel: string) => [
  { value: '', label: emptyLabel },
  ...Object.entries(POST_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

/** 작성·수정 폼의 분류 선택지 */
export const TYPE_OPTIONS = createTypeOptions('분류 선택');

/** 목록 필터의 분류 선택지 */
export const LIST_TYPE_OPTIONS = createTypeOptions('전체');

export const PAGE_GROUP_NUMBER = 10;

export const DUMMY_DATA = Array.from({ length: PAGE_GROUP_NUMBER }, (_, i) => ({
  id: i,
  title: `Title ${i}`,
  type: 'Type',
}));
