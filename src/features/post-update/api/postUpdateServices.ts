'use server';

import { getPostPath, getPostRequestBody } from '@entities/post';
import { fetchApi } from '@shared/lib/api';

import {
  UpdatePostReq,
  UpdatePostResourceReq,
  UpdatePostResourceRes,
  UpdatePostResourceResSchema,
  UpdatePostResSchema,
} from './types';

/** 게시글 수정 내용을 저장한다. 수정 권한은 백엔드에서 확인한다. */
export const fetchUpdatePost = async (req: UpdatePostReq) => {
  return fetchApi(getPostPath(req.id), {
    method: 'PUT',
    auth: 'required',
    body: getPostRequestBody(req),
    schema: UpdatePostResSchema,
  });
};

/** 로그인한 사용자의 게시글 편집에 필요한 값만 조회한다. */
export const fetchUpdatePostResource = async ({
  id,
}: UpdatePostResourceReq): Promise<UpdatePostResourceRes> => {
  return fetchApi(`${getPostPath(id)}/edit`, {
    method: 'GET',
    auth: 'required',
    schema: UpdatePostResourceResSchema,
  });
};
