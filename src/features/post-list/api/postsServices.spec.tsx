import { server } from '@shared/api/mocks/testServer';
import { getHandlerURI } from '@shared/lib/url';
import { http, HttpResponse } from 'msw';
import { cookies } from 'next/headers';
import { ZodError } from 'zod';

import { fetchPosts } from './postsServices';
import { type PostsReq } from './types';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));

const filters = { page: 2, type: 'faq', q: 'React' } as const;
const post = {
  id: 1,
  type: 'faq',
  title: '제목',
  hit: 0,
  created_at: '2026-09-01T00:00:00.000Z',
  user: { id: 1, name: '작성자', nickname: '닉네임' },
};
const meta = { current_page: 2, last_page: 3, total: 21 };

describe('게시글 목록 서버 액션', () => {
  const request = jest.fn();
  const respond = jest.fn();

  beforeEach(() => {
    request.mockClear();
    respond.mockReset();
    jest.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    server.use(
      http.get(getHandlerURI('/api/posts'), ({ request: req }) => {
        request(Object.fromEntries(new URL(req.url).searchParams));
        return HttpResponse.json(respond());
      })
    );
  });

  test('검색 조건을 전송하고 화면에 필요한 필드만 전달한다', async () => {
    respond.mockReturnValue({
      data: [
        {
          ...post,
          contents: '<p>본문</p>',
          user: { ...post.user, email: 'a' },
        },
        { ...post, id: 2, type: 'legacy', user: null },
      ],
      meta: { ...meta, per_page: 10 },
      links: { next: null },
    });

    await expect(fetchPosts(filters)).resolves.toEqual({
      data: [post, { ...post, id: 2, type: 'legacy', user: null }],
      meta,
    });
    expect(request).toHaveBeenCalledWith({
      page: '2',
      type: 'faq',
      q: 'React',
    });
  });

  test.each([
    ['입력 없음', undefined],
    ['0 페이지', { ...filters, page: 0 }],
    ['정수가 아닌 페이지', { ...filters, page: 1.5 }],
    ['지원하지 않는 분류', { ...filters, type: 'legacy' }],
    ['문자열이 아닌 검색어', { ...filters, q: null }],
  ])(
    '형식이 맞지 않는 검색 조건(%s)은 API 요청 전에 거절한다',
    async (_, input) => {
      await expect(fetchPosts(input as unknown as PostsReq)).rejects.toThrow(
        '게시글 검색 조건을 확인해 주세요.'
      );
      expect(request).not.toHaveBeenCalled();
    }
  );

  test('분류나 작성자 이름이 비어 있는 행과 형식이 다른 공통 필드는 목록을 막지 않는다', async () => {
    const { type: _type, ...untyped } = post;
    const row = { ...untyped, user: { id: 1, name: null } };
    respond.mockReturnValue({ ok: 1, message: null, data: [row], meta });

    await expect(fetchPosts(filters)).resolves.toEqual({ data: [row], meta });
  });

  test('화면이 쓰지 않는 값이 없고 날짜가 비어 있는 행도 목록에 표시할 수 있게 전달한다', async () => {
    const row = {
      id: 3,
      title: '제목',
      created_at: null,
      user: { name: '작성자' },
    };
    respond.mockReturnValue({ data: [row], meta });

    await expect(fetchPosts(filters)).resolves.toEqual({
      data: [{ ...row, created_at: '' }],
      meta,
    });
  });

  test('페이지 정보가 없는 응답은 목록으로 전달하지 않는다', async () => {
    respond.mockReturnValue({ data: [post] });

    await expect(fetchPosts(filters)).rejects.toBeInstanceOf(ZodError);
  });

  test.each([0, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    '상세 경로에서 열 수 없는 식별자 %p를 목록 링크로 전달하지 않는다',
    async id => {
      respond.mockReturnValue({ data: [{ ...post, id }], meta });

      await expect(fetchPosts(filters)).rejects.toBeInstanceOf(ZodError);
    }
  );

  test.each([{ current_page: 0 }, { last_page: 1.5 }, { total: -1 }])(
    '목록에 쓸 수 없는 페이지 정보 %p를 거절한다',
    async invalid => {
      respond.mockReturnValue({ data: [post], meta: { ...meta, ...invalid } });
      await expect(fetchPosts(filters)).rejects.toBeInstanceOf(ZodError);
    }
  );
});
