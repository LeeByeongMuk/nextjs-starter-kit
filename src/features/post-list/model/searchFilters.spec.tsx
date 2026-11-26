import { PostListSearchSchema } from './form';
import { parseSearchFilters, stringifySearchFilters } from './searchFilters';

describe('목록 검색 조건', () => {
  test('URL의 분류, 검색어, 페이지를 목록 필터로 읽는다', () => {
    expect(parseSearchFilters('type=notice&q=React&page=2')).toEqual({
      type: 'notice',
      q: 'React',
      page: 2,
    });
  });

  test('검색 조건이 없으면 전체 분류의 1페이지를 사용한다', () => {
    expect(parseSearchFilters('')).toEqual({ type: '', q: '', page: 1 });
  });

  test.each([
    ['type=bogus', { type: '', q: '', page: 1 }],
    ['type=constructor&q=검색', { type: '', q: '검색', page: 1 }],
    ['page=abc', { type: '', q: '', page: 1 }],
    ['page=0', { type: '', q: '', page: 1 }],
    ['page=-2', { type: '', q: '', page: 1 }],
    ['page=1.5', { type: '', q: '', page: 1 }],
    ['page=', { type: '', q: '', page: 1 }],
    ['page=9007199254740992', { type: '', q: '', page: 1 }],
    ['type=faq&page=%203%20', { type: 'faq', q: '', page: 3 }],
  ])('허용되지 않는 값(%s)은 필드별 기본값으로 바꾼다', (search, filters) => {
    expect(parseSearchFilters(search)).toEqual(filters);
  });

  test('목록 필터를 type, q, page 순서의 검색 조건으로 만든다', () => {
    expect(
      stringifySearchFilters({ type: 'faq', q: 'React 설치', page: 3 })
    ).toBe('type=faq&q=React+%EC%84%A4%EC%B9%98&page=3');
  });
});

describe('목록 검색 폼 스키마', () => {
  test.each(['', 'Re', 'React 설치'])('검색어 %p를 허용한다', q => {
    expect(PostListSearchSchema.safeParse({ type: '', q }).success).toBe(true);
  });

  test('한 글자 검색어는 다시 입력하게 한다', () => {
    expect(
      PostListSearchSchema.safeParse({ type: 'notice', q: 'R' }).error?.issues
    ).toEqual([
      expect.objectContaining({
        path: ['q'],
        message: '검색어를 2자 이상 입력하거나 비워 주세요.',
      }),
    ]);
  });
});
