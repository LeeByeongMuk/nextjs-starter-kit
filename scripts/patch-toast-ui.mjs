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
      '05455ecf4ba8d4e802bda04eb2c5e5c76836ae7888edca006a01135413f72d9a',
    patched: 'afdb191f7a5b679df98bb0438953acb8ab1f4a8a8311b5d2ef6eac076b6eb355',
  },
  {
    path: 'dist/esm/indexViewer.js',
    original:
      '64a05ae607c8f866e9f8dc8dea49f7e711bfb6796be6b7a651df41928e913d9d',
    patched: '47f3a5a06fbff0498bb56a860824daec5def0f45b1bc6e355c77ff6f9cdb6853',
  },
  {
    path: 'dist/toastui-editor.js',
    original:
      '1ea4b2f7d61153c03dd895acaa468e5994fb9f072b8663e1dd0f049dfaf05e5e',
    patched: 'd5e29ffcb00fdf28447afd59736ce1bd7ebd27cca7d49ab5ace6c1cb7fcbeede',
  },
  {
    path: 'dist/toastui-editor-viewer.js',
    original:
      '63b2622c5f78f233bea3f2d37c3a0b716c4f2ba189762d3a8e50c68228c57448',
    patched: '6b7beab413dd50d94bbe1e2b344e3ac30ab5fb7465a2a7502145c5e9d0e0fd2e',
  },
];
const dompurify = readFileSync(
  createRequire(resolve(editorRoot, 'package.json')).resolve('dompurify'),
  'utf8'
);

if (
  digest(dompurify) !==
  '84ebab629e420dc2b7c1e87df880e915df2834c5a8f0494bfbb077fed333fb32'
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
  'Toast UI의 ESM·UMD 에디터와 뷰어에 DOMPurify 3.5.0 적용을 확인했습니다.'
);
