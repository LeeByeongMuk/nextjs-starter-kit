// ts/js는 eslint-plugin-prettier가 --fix에서 포맷까지 수행하므로 prettier 중복 실행 없음
const config = {
  '*.{ts,tsx,js,jsx,mjs}': 'eslint --fix',
  '*.{json,md,css}': 'prettier --write',
};

export default config;
