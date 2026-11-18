import { execFileSync } from 'node:child_process';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { POST_IMAGE_MAX_BYTES } from '../config/editor';
import Editor from './Editor';

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

test('기존 이미지 URL을 복원하고 허용 크기의 이미지 파일만 본문에 삽입한다', async () => {
  const matchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  const change = jest.fn();
  const imageRead = jest.fn();

  function EditorForm() {
    const methods = useForm({
      defaultValues: { contents: '<p><img src="/sample.png" alt="예제"></p>' },
    });
    return (
      <FormProvider {...methods}>
        <Editor onChange={change} onImageRead={imageRead} />
      </FormProvider>
    );
  }

  try {
    const { container } = render(<EditorForm />);
    const field = container.querySelector<HTMLElement>(
      '.toastui-editor-ww-container [contenteditable="true"]'
    );
    if (!field) throw new Error('위지위그 편집 영역을 찾을 수 없습니다.');
    expect(within(field).getByAltText('예제')).toHaveAttribute(
      'src',
      '/sample.png'
    );

    const pasteImage = (size: number) => {
      const file = new window.File([new Uint8Array(size)], 'attachment.png', {
        type: 'image/png',
      });
      fireEvent.paste(field, {
        clipboardData: {
          getData: () => '',
          items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
        },
      });
    };

    pasteImage(POST_IMAGE_MAX_BYTES + 1);
    expect(screen.getByRole('alert')).toHaveTextContent('256 KiB를 넘습니다');
    expect(imageRead).not.toHaveBeenCalled();

    pasteImage(124 * 1024);
    await waitFor(() =>
      expect(change).toHaveBeenLastCalledWith(
        expect.stringContaining('data:image/png;base64,')
      )
    );
    expect(imageRead.mock.calls).toEqual([[true], [false]]);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(within(field).getByAltText('attachment.png')).toBeInTheDocument();
  } finally {
    if (matchMedia) Object.defineProperty(window, 'matchMedia', matchMedia);
    else Reflect.deleteProperty(window, 'matchMedia');
  }
});
