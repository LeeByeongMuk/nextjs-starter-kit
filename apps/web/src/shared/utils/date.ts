const getFormattedDate = (date: string) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('ko-KR').format(new Date(date));
};

export { getFormattedDate };
