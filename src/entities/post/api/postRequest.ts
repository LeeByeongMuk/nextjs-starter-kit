import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';

import { isPostType } from '../config/post';
import { serializePostBody } from './serializePostBody';

/** 게시글 식별자를 검증하고 API 요청 경로를 구성한다. */
export function getPostPath(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('게시글 번호를 확인해 주세요.');
  }
  return `/api/posts/${id}`;
}

/** 게시글 입력의 형식과 크기를 확인하고 등록·수정에 보낼 JSON을 만든다. */
export function getPostRequestBody(
  req: Parameters<typeof serializePostBody>[0]
) {
  const { title, type, contents, is_open } = req ?? {};
  if (
    typeof title !== 'string' ||
    typeof contents !== 'string' ||
    typeof is_open !== 'boolean' ||
    (type != null && type !== '' && !isPostType(type))
  ) {
    throw new Error('게시글 입력을 확인해 주세요.');
  }

  const body = serializePostBody({ title, type, contents, is_open });
  if (new TextEncoder().encode(body).byteLength > POST_REQUEST_MAX_BYTES) {
    throw new Error('게시글 크기가 허용 범위를 초과했습니다.');
  }
  return body;
}
