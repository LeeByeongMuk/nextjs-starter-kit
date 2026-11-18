import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('Toast UI 설치 패치의 검증 경계', () => {
  let directory: string;
  const distributions = [
    'dist/esm/index.js',
    'dist/esm/indexViewer.js',
    'dist/toastui-editor.js',
    'dist/toastui-editor-viewer.js',
  ];
  const run = (...args: string[]) =>
    execFileSync(process.execPath, ['scripts/patch-toast-ui.mjs', ...args], {
      cwd: directory,
      stdio: 'pipe',
    });
  const editorPath = (file: string) =>
    join(directory, 'node_modules/@toast-ui/editor', file);

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'toast-ui-security-'));
    for (const file of [
      'scripts/patch-toast-ui.mjs',
      'node_modules/@toast-ui/editor',
      'node_modules/dompurify',
    ]) {
      cpSync(file, join(directory, file), { recursive: true });
    }
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  test('재실행해도 적용된 배포물은 변하지 않는다', () => {
    const before = distributions.map(file => readFileSync(editorPath(file)));
    run();
    run('--check');
    expect(distributions.map(file => readFileSync(editorPath(file)))).toEqual(
      before
    );
  });

  test.each(distributions)('예상하지 못한 배포물은 거부한다: %s', file => {
    appendFileSync(editorPath(file), '\n');
    expect(() => run()).toThrow('Toast UI 배포물이 변경되었습니다');
    expect(() => run('--check')).toThrow('Toast UI 배포물이 변경되었습니다');
  });

  test('에디터가 다른 중첩 DOMPurify를 해석하면 거부한다', () => {
    const nested = editorPath('node_modules/dompurify');
    cpSync(join(directory, 'node_modules/dompurify'), nested, {
      recursive: true,
    });
    appendFileSync(join(nested, 'dist/purify.cjs.js'), '\n');
    expect(() => run('--check')).toThrow('DOMPurify 배포물이 변경되었습니다');
  });
});
