// lint-staged 설정 — 스테이징된 파일만 eslint/prettier 자동 교정
export default {
  '*.{ts,tsx,js,jsx,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css}': 'prettier --write',
};
