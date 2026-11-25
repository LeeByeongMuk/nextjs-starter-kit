import { getPostPath, getPostRequestBody } from './postRequest';
import { type PostBody } from './types';

const post = {
  title: '제목',
  type: 'free',
  contents: '<p>본문</p>',
  is_open: true,
} as const;

describe('게시글 요청 구성', () => {
  test('1 이상의 정수 식별자로 요청 경로를 만든다', () => {
    expect(getPostPath(42)).toBe('/api/posts/42');
  });

  test.each([0, -1, 4.2, Number.NaN, 2 ** 53, '42'])(
    '게시글 번호로 쓸 수 없는 값 %p은 거절한다',
    id => {
      expect(() => getPostPath(id as number)).toThrow(
        '게시글 번호를 확인해 주세요.'
      );
    }
  );

  test('허용된 필드만 직렬화하고 분류를 고르지 않은 글은 null로 보낸다', () => {
    const input = { ...post, extra: true };
    expect(JSON.parse(getPostRequestBody(input))).toEqual(post);
    for (const type of ['', null, undefined] as const) {
      expect(JSON.parse(getPostRequestBody({ ...post, type }))).toEqual({
        ...post,
        type: null,
      });
    }
  });

  test.each([
    ['입력 없음', undefined],
    ['문자열이 아닌 제목', { ...post, title: 1 }],
    ['본문 누락', { title: post.title, is_open: true }],
    ['지원하지 않는 분류', { ...post, type: 'legacy' }],
    ['불리언이 아닌 공개 여부', { ...post, is_open: '1' }],
  ])('형식이 맞지 않는 입력(%s)은 거절한다', (_, input) => {
    expect(() => getPostRequestBody(input as PostBody)).toThrow(
      '게시글 입력을 확인해 주세요.'
    );
  });
});
