export const getHandlerURI = (path: string): string => {
  console.log('process.env', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'test') {
    const domain = process.env.APP_API_URL || 'http://localhost:9090';
    return `${domain}${path}`;
  }

  return path;
};
