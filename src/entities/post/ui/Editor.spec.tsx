import { execFileSync } from 'node:child_process';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { StrictMode } from 'react';
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

describe('본문 편집기', () => {
  const matchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  const innerHTML = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'innerHTML'
  );
  const change = jest.fn();
  const imageRead = jest.fn();

  interface EditorFormProps {
    contents: string;
  }

  function EditorForm({ contents }: EditorFormProps) {
    const methods = useForm({
      defaultValues: { contents },
      values: { contents },
    });
    return (
      <FormProvider {...methods}>
        <Editor onChange={change} onImageRead={imageRead} />
      </FormProvider>
    );
  }

  const getField = (container: HTMLElement) => {
    const field = container.querySelector<HTMLElement>(
      '.toastui-editor-ww-container [contenteditable="true"]'
    );
    if (!field) throw new Error('위지위그 편집 영역을 찾을 수 없습니다.');
    return field;
  };

  const findExecutable = (root: ParentNode) =>
    root.querySelector(
      'script, [onclick], [onerror], [href^="javascript:"], [src^="javascript:"]'
    );

  /** 현재 문서의 요소에 innerHTML로 넣은 HTML을 모은다 — 이 시점에 이벤트 핸들러가 살아 있으면 브라우저가 실행한다 */
  const collectLiveHTML = () => {
    const assigned: string[] = [];
    Object.defineProperty(Element.prototype, 'innerHTML', {
      ...innerHTML,
      set(this: Element, html: string) {
        if (this.ownerDocument === document) assigned.push(String(html));
        innerHTML?.set?.call(this, html);
      },
    });
    return assigned;
  };

  beforeEach(() => {
    change.mockClear();
    imageRead.mockClear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      }),
    });
  });

  afterEach(() => {
    if (innerHTML)
      Object.defineProperty(Element.prototype, 'innerHTML', innerHTML);
    if (matchMedia) Object.defineProperty(window, 'matchMedia', matchMedia);
    else Reflect.deleteProperty(window, 'matchMedia');
  });

  describe.each([
    {
      html: '<p>본문<img src="/missing.png" onerror="window.__xss = true"></p>',
      text: '본문',
      kept: 'img[src="/missing.png"]',
    },
    {
      html: '<p><a href="javascript:window.__xss = true">링크</a> 설명</p>',
      text: '링크 설명',
      kept: 'p',
    },
  ])('실행 가능한 HTML: $html', ({ html, text, kept }) => {
    const expectSanitized = (assigned: string[], field: HTMLElement) => {
      expect(assigned.length).toBeGreaterThan(0);
      assigned.forEach(liveHTML =>
        expect(
          findExecutable(new DOMParser().parseFromString(liveHTML, 'text/html'))
        ).toBeNull()
      );
      expect(findExecutable(field)).toBeNull();
      expect(field).toHaveTextContent(text);
      expect(field.querySelector(kept)).not.toBeNull();
      expect(change).not.toHaveBeenCalled();
    };

    test('처음 불러온 본문은 현재 문서의 DOM으로 만들기 전에 정제한다', () => {
      const assigned = collectLiveHTML();

      const { container } = render(<EditorForm contents={html} />);

      expectSanitized(assigned, getField(container));
    });

    test('다시 불러온 본문도 현재 문서의 DOM으로 만들기 전에 정제한다', () => {
      const { container, rerender } = render(
        <EditorForm contents="<p>처음 본문</p>" />
      );
      const assigned = collectLiveHTML();

      rerender(<EditorForm contents={html} />);

      expectSanitized(assigned, getField(container));
    });
  });

  test('본문이 지정한 태그 이름으로 요소를 만들지 않는다', () => {
    const { container } = render(
      <EditorForm contents={'<p><b data-raw-html="script">굵은 글</b></p>'} />
    );
    const field = getField(container);

    expect(field.querySelector('script')).toBeNull();
    expect(field.querySelector('strong')).toHaveTextContent('굵은 글');
  });

  test('링크가 걸린 이미지로 끝나는 문단 뒤에 빈 문단을 만들지 않는다', () => {
    const { container } = render(
      <EditorForm
        contents={
          '<p><a href="https://example.com"><span class="image-link"><img src="/sample.png" alt="예제"></span></a><br></p>'
        }
      />
    );
    const field = getField(container);

    expect(field.querySelectorAll(':scope > p')).toHaveLength(1);
    expect(within(field).getByAltText('예제').closest('a')).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  test('빈 제목이 있는 본문을 열어도 빈 제목이 늘지 않는다', () => {
    const { container } = render(
      <EditorForm contents="<h2><br></h2><p>뒤</p>" />
    );
    const field = getField(container);

    expect(field.querySelectorAll(':scope > h2')).toHaveLength(1);
    expect(field.querySelectorAll(':scope > p')).toHaveLength(1);
  });

  const switchModes = (container: HTMLElement) => {
    const tabs = container.querySelectorAll<HTMLElement>(
      '.toastui-editor-mode-switch .tab-item'
    );
    expect(tabs).toHaveLength(2);
    fireEvent.click(tabs[0]);
    fireEvent.click(tabs[1]);
  };

  const pasteText = (field: HTMLElement, text: string) =>
    fireEvent.paste(field, {
      clipboardData: {
        getData: (type: string) => (type === 'text/plain' ? text : ''),
        items: [],
      },
    });

  const undo = (field: HTMLElement) =>
    fireEvent.keyDown(field, { key: 'z', keyCode: 90, ctrlKey: true });

  describe('모드 전환', () => {
    // jsdom은 레이아웃을 계산하지 않아 Markdown 모드가 예약하는 미리보기 스크롤 동기화 타이머가 실행되면 예외를 낸다. 예약된 타이머가 다른 테스트 도중 실행되지 않게 가짜 타이머로 버린다.
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('모드만 바꿨다 돌아오면 본문을 수정한 것으로 알리지 않는다', () => {
      const { container } = render(
        <EditorForm contents="<p><code>a</code> 글</p>" />
      );

      switchModes(container);

      expect(change).not.toHaveBeenCalled();
    });

    test('수정한 뒤 다른 모드에서 원래 내용으로 되돌리면 원문을 돌려준다', () => {
      const contents = '<p><code>a</code> 글</p>';
      const { container } = render(<EditorForm contents={contents} />);
      pasteText(getField(container), '추가');
      expect(change).toHaveBeenLastCalledWith(expect.stringContaining('추가'));
      const tabs = container.querySelectorAll<HTMLElement>(
        '.toastui-editor-mode-switch .tab-item'
      );
      fireEvent.click(tabs[0]);
      const markdown = container.querySelector<HTMLElement>(
        '.toastui-editor-md-container [contenteditable="true"]'
      );
      if (!markdown) throw new Error('Markdown 편집 영역을 찾을 수 없습니다.');

      fireEvent.keyDown(markdown, { key: 'a', keyCode: 65, ctrlKey: true });
      pasteText(markdown, '`a` 글');

      expect(change).toHaveBeenLastCalledWith(contents);
    });

    test('모드를 바꾼 적이 있어도 다시 불러온 본문은 실행 취소로 되돌아가지 않는다', () => {
      const { container, rerender } = render(
        <EditorForm contents="<p>처음 본문</p>" />
      );
      const field = getField(container);
      switchModes(container);

      rerender(<EditorForm contents="<p>서버가 바꾼 본문</p>" />);
      pasteText(field, '추가');
      expect(field).toHaveTextContent('추가');
      undo(field);
      undo(field);

      expect(field).toHaveTextContent('서버가 바꾼 본문');
      expect(field).not.toHaveTextContent('추가');
      expect(field).not.toHaveTextContent('처음 본문');
    });

    test('모드를 바꿨다 돌아온 뒤에도 다시 불러온 본문을 반영한다', () => {
      function ConnectedForm({ contents }: EditorFormProps) {
        const methods = useForm({
          defaultValues: { contents },
          values: { contents },
          resetOptions: { keepDirtyValues: true },
        });
        return (
          <FormProvider {...methods}>
            <Editor
              onChange={value =>
                methods.setValue('contents', value, { shouldDirty: true })
              }
              onImageRead={imageRead}
            />
          </FormProvider>
        );
      }
      const { container, rerender } = render(
        <ConnectedForm contents="<p><code>a</code> 글</p>" />
      );
      switchModes(container);

      rerender(<ConnectedForm contents="<p>서버가 바꾼 본문</p>" />);

      expect(getField(container)).toHaveTextContent('서버가 바꾼 본문');
    });
  });

  test('입력을 되돌려 불러온 내용과 같아지면 원문을 돌려준다', () => {
    const contents = '<p>글 <img src="/sample.png" alt="예제"></p>';
    const { container } = render(<EditorForm contents={contents} />);
    const field = getField(container);

    pasteText(field, '추가');
    expect(change).toHaveBeenLastCalledWith(expect.stringContaining('추가'));
    undo(field);

    expect(change).toHaveBeenLastCalledWith(contents);
  });

  test('불러온 본문과 다시 불러온 본문은 실행 취소로 되돌아가지 않는다', () => {
    const { container, rerender } = render(
      <EditorForm contents="<p>처음 본문</p>" />
    );
    const field = getField(container);

    undo(field);
    expect(field).toHaveTextContent('처음 본문');
    expect(change).not.toHaveBeenCalled();

    rerender(<EditorForm contents="<p>서버가 바꾼 본문</p>" />);
    pasteText(field, '추가');
    expect(field).toHaveTextContent('추가');
    undo(field);
    undo(field);

    expect(field).toHaveTextContent('서버가 바꾼 본문');
    expect(field).not.toHaveTextContent('추가');
  });

  test('블록 안의 줄바꿈은 공백으로, 코드 안의 줄바꿈은 그대로 넣는다', () => {
    const { container } = render(
      <EditorForm
        contents={
          '<p><span>가<br></span>나</p><table><thead><tr><th>머리</th></tr></thead><tbody><tr><td>1<br>2</td></tr></tbody></table><pre><code>a<br>b<br></code></pre><p>끝</p>'
        }
      />
    );
    const field = getField(container);

    expect(field.querySelector(':scope > p')).toHaveTextContent('가 나');
    expect(field.querySelectorAll('td')).toHaveLength(1);
    expect(field.querySelector('td')).toHaveTextContent('1 2');
    expect(field.querySelector('pre code')?.textContent).toBe('a\nb');
  });

  test('줄바꿈으로 끝나는 코드가 있는 글을 고쳐 저장하고 다시 열어도 코드가 늘지 않는다', () => {
    const edit = (contents: string) => {
      const { container, unmount } = render(<EditorForm contents={contents} />);
      pasteText(getField(container), '추가');
      const saved: string = change.mock.lastCall?.[0];
      unmount();
      return saved;
    };
    const codeOf = (html: string) =>
      new DOMParser().parseFromString(html, 'text/html').querySelector('pre')
        ?.innerHTML;

    const first = edit('<p>앞</p><pre><code>a\n<br></code></pre><p>뒤</p>');
    const second = edit(first);
    const third = edit(second);

    expect(codeOf(first)).toBe('<code>a\n<br></code>');
    expect(codeOf(second)).toBe(codeOf(first));
    expect(codeOf(third)).toBe(codeOf(first));
  });

  test('코드 블록에 빈 줄이 있는 본문도 편집기에 표시한다', () => {
    const { container } = render(
      <EditorForm
        contents={'<p>앞</p><pre><code>a\n\nb</code></pre><p>뒤</p>'}
      />
    );
    const field = getField(container);

    expect(field.querySelector('pre code')?.textContent).toBe('a\n\nb');
    expect(field).toHaveTextContent('뒤');
    expect(change).not.toHaveBeenCalled();
  });

  test('StrictMode가 편집기를 다시 만들어도 본문을 표시한다', () => {
    const { container } = render(
      <StrictMode>
        <EditorForm contents="<p>저장된 본문</p>" />
      </StrictMode>
    );

    expect(getField(container)).toHaveTextContent('저장된 본문');
    expect(change).not.toHaveBeenCalled();
  });

  test('서버 본문을 편집기에 반영하고 허용 크기의 이미지 파일만 본문에 삽입하며 링크 주소를 그대로 내보낸다', async () => {
    const { container, rerender } = render(
      <EditorForm
        contents={
          '<p><img src="/sample.png" alt="예제"> <a href="https://example.com/?a=1&amp;b=2">링크</a></p>'
        }
      />
    );
    const field = getField(container);
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
    expect(change).toHaveBeenLastCalledWith(
      expect.stringContaining('href="https://example.com/?a=1&amp;b=2"')
    );

    change.mockClear();
    rerender(<EditorForm contents="<p>서버에서 갱신된 본문</p>" />);
    await waitFor(() =>
      expect(field).toHaveTextContent('서버에서 갱신된 본문')
    );
    expect(change).not.toHaveBeenCalled();
    expect(field).toBeInTheDocument();
  });
});
