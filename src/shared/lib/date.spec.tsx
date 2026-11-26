import { getFormattedDate } from './date';

describe('날짜 표시', () => {
  test('날짜를 한국어 형식으로 표시한다', () => {
    expect(getFormattedDate('2026-09-01T00:00:00')).toBe('2026. 9. 1.');
  });

  test.each(['', 'invalid-date'])(
    '비어 있거나 해석할 수 없는 값 %p는 빈 문자열로 표시한다',
    date => {
      expect(getFormattedDate(date)).toBe('');
    }
  );
});
