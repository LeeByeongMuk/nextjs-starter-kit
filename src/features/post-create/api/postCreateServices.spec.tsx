import { server } from '@shared/api/mocks/testServer';
import { TOKEN_KEY } from '@shared/config/auth';
import { getHandlerURI } from '@shared/lib/url';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { ZodError } from 'zod';

import { fetchCreatePost } from './postCreateServices';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));

const post = {
  type: 'free',
  title: '제목',
  contents: '<p>본문</p>',
  is_open: true,
} as const;

describe('게시글 등록 서버 액션', () => {
  const respond = (id: unknown) =>
    server.use(
      http.post(getHandlerURI('/api/posts'), () =>
        HttpResponse.json({ ok: true, message: 'success', data: { id } })
      )
    );

  beforeEach(() => {
    jest.mocked(cookies).mockResolvedValue({
      get: (key: string) =>
        key === TOKEN_KEY ? { name: key, value: 'test-token' } : undefined,
    } as Awaited<ReturnType<typeof cookies>>);
  });

  test('등록한 글의 식별자를 전달한다', async () => {
    respond(7);

    await expect(fetchCreatePost(post)).resolves.toEqual({
      ok: true,
      message: 'success',
      data: { id: 7 },
    });
  });

  test.each([0.5, 0, '7'])(
    '상세 화면 경로로 쓸 수 없는 식별자 %p는 등록 결과로 전달하지 않는다',
    async id => {
      respond(id);

      await expect(fetchCreatePost(post)).rejects.toBeInstanceOf(ZodError);
    }
  );
});
