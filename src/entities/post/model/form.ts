import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';
import { z } from 'zod';

import { serializePostBody } from '../api/serializePostBody';
import { PostBodySchema } from '../api/types';
import { type PostType, PostTypeSchema } from './types';

const hasVisibleContents = (contents: string) => {
  const template = document.createElement('template');
  template.innerHTML = contents;
  return !!(
    template.content.textContent?.trim() ||
    template.content.querySelector('img, video, iframe, audio, hr')
  );
};

const TextFieldsSchema = PostBodySchema.pick({ title: true, contents: true });

const required = {
  title: '제목을 입력해 주세요.',
  type: '분류를 선택해 주세요.',
  contents: '본문을 입력해 주세요.',
  isOpen: '공개 범위를 선택해 주세요.',
};
const sizeLimit = `글 전체가 ${POST_REQUEST_MAX_BYTES / 1024} KiB를 넘습니다. 이미지나 본문을 줄인 뒤 다시 저장해 주세요.`;

const PostFieldsSchema = z.object({
  title: z.string(required.title).min(1, required.title),
  type: z
    .enum(['', ...PostTypeSchema.options], required.type)
    .refine((type): type is PostType => type !== '', required.type),
  contents: z.string(required.contents).min(1, required.contents),
  isOpen: z.enum(['1', '0'], required.isOpen),
});

/**
 * 글쓰기와 글 수정 폼 스키마 — 본문 오류는 빈 값, 저장 요청 크기, 보이는 내용 순서로 하나만 안내한다.
 * 본문 확인은 분류나 공개 범위를 고르기 전에도 함께 실행한다.
 */
export const PostFormSchema = PostFieldsSchema.superRefine(
  ({ title, type, contents, isOpen }, context) => {
    const body = serializePostBody({
      title,
      type,
      contents,
      is_open: isOpen === '1',
    });
    const message =
      new TextEncoder().encode(body).byteLength > POST_REQUEST_MAX_BYTES
        ? sizeLimit
        : !hasVisibleContents(contents) && required.contents;

    if (message) {
      context.addIssue({ code: 'custom', path: ['contents'], message });
    }
  },
  { when: ({ value }) => !!TextFieldsSchema.safeParse(value).data?.contents }
);

/** 글쓰기와 글 수정 폼에서 사용하는 입력값이다. */
export type PostFormInput = z.input<typeof PostFormSchema>;

/** 검증을 통과한 글쓰기와 글 수정 폼의 값 — 분류가 선택된 상태다 */
export type PostFormOutput = z.output<typeof PostFormSchema>;

/** 글쓰기와 글 수정 폼의 기본값 — 분류와 공개 범위는 직접 고르도록 비워 둔다 */
export const POST_FORM_DEFAULT_VALUES: Pick<
  PostFormInput,
  'title' | 'type' | 'contents'
> = {
  title: '',
  type: '',
  contents: '',
};
