/** 날짜를 한국어 형식으로 표시한다 — 비어 있거나 해석할 수 없는 값은 빈 문자열로 표시한다 */
const getFormattedDate = (date: string) => {
  const parsed = new Date(date);
  if (!date || Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR').format(parsed);
};

export { getFormattedDate };
