import { server } from '@shared/api/mocks/testServer';
import { TOKEN_KEY } from '@shared/config/auth';
import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';
import { getHandlerURI } from '@shared/lib/url';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';

import { fetchUpdatePost, fetchUpdatePostResource } from './postUpdateServices';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));

const post = {
  id: 42,
  type: 'free',
  title: '제목',
  contents: '<p>본문</p>',
  is_open: false,
} as const;

describe('게시글 수정 서버 액션', () => {
  const updateRequest = jest.fn();

  beforeEach(() => {
    updateRequest.mockClear();
    jest.mocked(cookies).mockResolvedValue({
      get: (key: string) =>
        key === TOKEN_KEY ? { name: key, value: 'test-token' } : undefined,
    } as Awaited<ReturnType<typeof cookies>>);
    server.use(
      http.put(getHandlerURI('/api/posts/42'), async ({ request }) => {
        updateRequest(
          await request.json(),
          request.headers.get('Authorization')
        );
        return HttpResponse.json({
          ok: true,
          message: 'success',
          data: { id: post.id, extra: true },
        });
      })
    );
  });

  test('허용된 필드만 전송하고 응답에서 게시글 식별자만 전달한다', async () => {
    const input = { ...post, extra: true };
    await expect(fetchUpdatePost(input)).resolves.toEqual({
      ok: true,
      message: 'success',
      data: { id: post.id },
    });
    expect(updateRequest).toHaveBeenCalledWith(
      {
        type: post.type,
        title: post.title,
        contents: post.contents,
        is_open: post.is_open,
      },
      'test-token'
    );
  });

  test('응답에 식별자가 없어도 수정 결과를 실패로 만들지 않는다', async () => {
    server.use(
      http.put(getHandlerURI('/api/posts/42'), () =>
        HttpResponse.json({ data: {} })
      )
    );

    await expect(fetchUpdatePost(post)).resolves.toEqual({ data: {} });
  });

  test('편집용 데이터에 분류가 없어도 폼에서 다시 고를 수 있게 전달한다', async () => {
    const { type: _type, id: _id, ...resource } = post;
    server.use(
      http.get(getHandlerURI('/api/posts/42/edit'), () =>
        HttpResponse.json({ data: resource })
      )
    );

    await expect(fetchUpdatePostResource({ id: post.id })).resolves.toEqual({
      data: resource,
    });
  });

  test('유효하지 않은 식별자 또는 크기 초과는 API 요청 전에 거절한다', async () => {
    await expect(fetchUpdatePost({ ...post, id: 4.2 })).rejects.toThrow(
      '게시글 번호를 확인해 주세요.'
    );
    await expect(
      fetchUpdatePost({
        ...post,
        contents: '한'.repeat(POST_REQUEST_MAX_BYTES / 3),
      })
    ).rejects.toThrow('게시글 크기가 허용 범위를 초과했습니다.');
    expect(updateRequest).not.toHaveBeenCalled();
  });

  test('편집용 데이터와 수정 요청에 API 토큰이 필요하다', async () => {
    jest.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as Awaited<ReturnType<typeof cookies>>);

    await expect(fetchUpdatePostResource({ id: post.id })).rejects.toThrow(
      '로그인이 필요합니다.'
    );
    await expect(fetchUpdatePost(post)).rejects.toThrow('로그인이 필요합니다.');
    expect(updateRequest).not.toHaveBeenCalled();
  });
});
