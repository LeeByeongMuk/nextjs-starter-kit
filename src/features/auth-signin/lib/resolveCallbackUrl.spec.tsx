import { resolveCallbackUrl } from './resolveCallbackUrl';

const origin = 'https://example.com';

it.each([
  '/account',
  '/post/12/update?type=notice&q=React#error',
  'https://example.com/account?section=profile#name',
])(
  '보호 경로의 쿼리와 해시를 포함한 같은 출처의 주소를 반환한다 (%s)',
  input => {
    expect(resolveCallbackUrl(input, origin)).toBe(new URL(input, origin).href);
  }
);

it.each([null, '', 'https://outside.example/account', 'https://[invalid'])(
  '같은 출처의 유효한 주소가 없으면 홈을 반환한다 (%s)',
  input => {
    expect(resolveCallbackUrl(input, origin)).toBe(`${origin}/`);
  }
);
