import { execFileSync } from 'node:child_process';

interface EditorInstance {
  destroy(): void;
  setHTML(html: string, cursorToEnd?: boolean): void;
  getHTML(): string;
}

// Toast UI의 exports에 types가 없어 실제 모듈의 테스트 대상 계약을 명시한다.
const ToastEditor =
  jest.requireActual<
    new (options: {
      el: HTMLElement;
      initialEditType: 'wysiwyg';
      autofocus: boolean;
      usageStatistics: boolean;
    }) => EditorInstance
  >('@toast-ui/editor');

describe('에디터 보안 패치', () => {
  let editor: EditorInstance;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    editor = new ToastEditor({
      el: container,
      initialEditType: 'wysiwyg',
      autofocus: false,
      usageStatistics: false,
    });
  });

  afterEach(() => {
    editor.destroy();
    container.remove();
  });

  test('설치된 에디터와 뷰어의 모든 배포 경로에 보안 패치가 적용된다', () => {
    expect(() =>
      execFileSync(
        process.execPath,
        ['scripts/patch-toast-ui.mjs', '--check'],
        {
          stdio: 'pipe',
        }
      )
    ).not.toThrow();
  });

  test.each([
    '<p onclick="window.__xss = true">본문<img src="/missing.png" onerror="window.__xss = true"></p><script>window.__xss = true</script>',
    '<a href="javascript:window.__xss = true">링크</a>',
    '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=/missing.png onerror=window.__xss=true>">',
  ])('외부 HTML의 실행 가능한 태그와 속성을 제거한다: %s', html => {
    editor.setHTML(html, false);
    const result = document.createElement('div');
    result.innerHTML = editor.getHTML();

    expect(result.querySelector('script, [onclick], [onerror]')).toBeNull();
    expect(result.querySelector('[href^="javascript:"]')).toBeNull();
  });

  test('표·링크·이미지·코드를 저장한 뒤 다시 편집해도 유지한다', () => {
    const html =
      '<h2>제목</h2><p><strong>강조</strong> <a href="https://example.com">링크</a></p>' +
      '<table><thead><tr><th>항목</th></tr></thead><tbody><tr><td>값</td></tr></tbody></table>' +
      '<p><img src="/sample.png" alt="예제"></p><pre><code>const value = 1;</code></pre>';
    editor.setHTML(html);
    const saved = editor.getHTML();
    editor.setHTML(saved);
    const result = document.createElement('div');
    result.innerHTML = editor.getHTML();

    expect(result.querySelector('h2')).toHaveTextContent('제목');
    expect(result.querySelector('strong')).toHaveTextContent('강조');
    expect(result.querySelector('a')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(result.querySelector('th')).toHaveTextContent('항목');
    expect(result.querySelector('td')).toHaveTextContent('값');
    expect(result.querySelector('img')).toHaveAttribute('src', '/sample.png');
    expect(result.querySelector('pre code')).toHaveTextContent(
      'const value = 1;'
    );
  });
});
