import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const editorRoot = resolve(root, 'node_modules/@toast-ui/editor');
const checkOnly = process.argv.includes('--check');
const digest = source => createHash('sha256').update(source).digest('hex');
const files = [
  {
    path: 'dist/esm/index.js',
    original:
      'ff71315070f5151b638307fc66faa7e22c479a5e8e3fd566442475958401e524',
    patched: 'f93cab11da3245e34e31826301410d52e3b47c5f3023f4d2046592581f0de14a',
  },
  {
    path: 'dist/esm/indexViewer.js',
    original:
      'ff1665cc086371b2a0be531a9a2559216e325a96074cb5ed0565f7a84f7a29ce',
    patched: '9fe883dfbfbeb7660589f4ef8ad1f90814cbbe7e4fba7a523d3932850c34268a',
  },
  {
    path: 'dist/toastui-editor.js',
    original:
      'f9553b03d05eea45f6f3c066e270f0e3f2911d345e194907381c61158cf6d51b',
    patched: '7c0589f12a1d5a640d5bc27c9e406c46de4704b50c5cd8dc5b865942bc1dc371',
  },
  {
    path: 'dist/toastui-editor-viewer.js',
    original:
      'a13b3fc83a1a3d0bfd4e0b1d6c1deaa756e0082689843cf9cde7fa17776160c2',
    patched: '8604fcaaecb03795c87dd50da0207c9352d1bf98aa242890a0021cae6d5ed469',
  },
];
const dompurify = readFileSync(
  createRequire(resolve(editorRoot, 'package.json')).resolve('dompurify'),
  'utf8'
);

if (
  digest(dompurify) !==
  'e9ddd339c8823bdef37e0efa07cf24a896f97bb137890da48d1ac28a4ba1940c'
) {
  throw new Error(
    'DOMPurify 배포물이 변경되었습니다. 보안 패치를 재검증하세요.'
  );
}

const replacement = `${dompurify.split('//# sourceMappingURL=')[0].trimEnd()}\n`;
const updates = files.flatMap(file => {
  const path = resolve(editorRoot, file.path);
  const source = readFileSync(path, 'utf8');
  const hash = digest(source);

  if (hash === file.patched) return [];
  if (hash !== file.original) {
    throw new Error(`Toast UI 배포물이 변경되었습니다: ${file.path}`);
  }
  if (checkOnly) {
    throw new Error(
      'Toast UI 보안 패치가 없습니다. npm run postinstall을 실행하세요.'
    );
  }

  const start = source.indexOf('/*! @license DOMPurify 2.3.3');
  const esm = file.path.startsWith('dist/esm/');
  const endMarker = esm
    ? '\nvar CAN_BE_WHITE_TAG_LIST'
    : '//# sourceMappingURL=purify.js.map';
  const end = source.indexOf(endMarker, start) + (esm ? 0 : endMarker.length);
  const patched =
    source.slice(0, start) +
    (esm ? "import purify from 'dompurify';\n" : replacement) +
    source.slice(end);

  if (digest(patched) !== file.patched) {
    throw new Error(
      `Toast UI 보안 패치 결과가 일치하지 않습니다: ${file.path}`
    );
  }
  return [{ path, source: patched }];
});

for (const update of updates) writeFileSync(update.path, update.source);
console.log(
  'Toast UI의 ESM·UMD 에디터와 뷰어에 DOMPurify 3.4.18 적용을 확인했습니다.'
);
