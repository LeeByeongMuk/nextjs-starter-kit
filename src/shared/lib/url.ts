export const getHandlerURI = (path: string): string => {
  if (process.env.NODE_ENV === 'test') {
    const domain = process.env.APP_API_URL || 'http://localhost:9090';
    return `${domain}${path}`;
  }

  return path;
};

/** 브라우저가 문서 탐색에 사용할 주소를 전달한다. */
export const documentNavigation = {
  assign(url: string) {
    window.location.assign(url);
  },
};
