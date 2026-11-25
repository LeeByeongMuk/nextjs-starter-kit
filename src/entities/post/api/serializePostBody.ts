import { type PostType } from '../model/types';

interface PostBody {
  title: string;
  type?: PostType | '' | null;
  contents: string;
  is_open: boolean;
}

/** 작성·수정 요청을 동일한 JSON 형식으로 직렬화한다. */
export function serializePostBody({
  title,
  type,
  contents,
  is_open,
}: PostBody) {
  return JSON.stringify({ title, type: type || null, contents, is_open });
}
