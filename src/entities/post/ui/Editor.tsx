import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

import ValidationError from '@shared/ui/error/ValidationError';
import { Editor as TuiEditor } from '@toast-ui/react-editor';
import DOMPurify from 'dompurify';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { POST_IMAGE_MAX_BYTES } from '../config/editor';
import { type PostFormInput } from '../model/form';

interface Props {
  onChange: (contents: string) => void;
  onImageRead: (reading: boolean) => void;
  isInvalid?: boolean;
}

interface ShownContents {
  editor: object;
  isMarkdown: boolean;
  value: string;
  source: string;
  markdown: string;
}

interface HistoryTransaction {
  setMeta(key: 'addToHistory', value: false): unknown;
}

interface HistoryPluginContext {
  instance: { isMarkdownMode(): boolean };
  pmState: {
    Plugin: new (spec: {
      filterTransaction: (transaction: HistoryTransaction) => boolean;
    }) => object;
  };
}

const BLOCKS = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre, div';

const XML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
};

function endsBlock(br: Element) {
  const block = br.closest(BLOCKS);
  for (
    let node: Node | null = br;
    node && node !== block;
    node = node.parentNode
  ) {
    if (node.nextSibling) return false;
  }
  return true;
}

function toEditorHTML(html: string) {
  const template = document.createElement('template');
  // setHTML은 정제하기 전에 현재 문서의 DOM을 만들므로 먼저 정제한다. data-raw-html은 편집기가 만들 태그 이름을 정하는 내부 속성이라 받지 않는다.
  template.innerHTML = DOMPurify.sanitize(html, {
    FORBID_ATTR: ['data-raw-html'],
  });
  // 편집기에는 줄바꿈 노드가 없어 setHTML이 <br>마다 블록을 새로 만든다. 편집기는 빈 블록, 이미지, 줄바꿈으로 끝나는 코드 뒤에 <br>을 붙여 내보내므로, 블록 끝의 <br>을 남기면 저장할 때마다 빈 블록이나 줄이 늘어난다.
  // 블록 끝의 <br>은 지우고, 블록 안의 <br>은 표 칸이나 목록 항목을 쪼개지 않게 코드에서는 줄바꿈, 그 밖에서는 공백으로 바꾼다.
  Array.from(template.content.querySelectorAll('br'))
    .reverse()
    .forEach(br => {
      if (endsBlock(br)) br.remove();
      else if (br.closest('pre')) br.replaceWith('\n');
      else if (br.parentElement) br.replaceWith(' ');
    });
  return template.innerHTML;
}

function fromEditorHTML(html: string) {
  // 편집기는 링크 주소를 이스케이프한 문자열로 DOM에 넣어, 내보낸 HTML에서 한 겹 더 이스케이프된다. 저장할 때마다 겹이 늘지 않게 한 겹을 되돌린다.
  if (!/&amp;(?:amp|lt|gt|quot);/.test(html)) return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('a[href]').forEach(link => {
    link.setAttribute(
      'href',
      (link.getAttribute('href') ?? '').replace(
        /&(?:amp|lt|gt|quot);/g,
        entity => XML_ENTITIES[entity]
      )
    );
  });
  return template.innerHTML;
}

/** ToastUI의 HTML·도구 모음을 유지하며 편집 영역에 접근성 정보를 연결한다. */
export default function Editor({
  onChange,
  onImageRead,
  isInvalid = false,
}: Props) {
  const contents = useWatch<PostFormInput, 'contents'>({ name: 'contents' });
  const shown = useRef<ShownContents | null>(null);
  const applyingContents = useRef(false);
  const editorRef = useRef<TuiEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState('');
  const toolbarItems = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr'],
    ['ul', 'ol', 'task'],
    ['table', 'link'],
    ['image'],
    ['code'],
    ['scrollSync'],
  ];

  // 저장된 HTML은 setHTML로 넣는다. initialValue는 Markdown으로 해석되어 코드 블록에 빈 줄이 있으면 예외를 낸다.
  // 편집기가 보낸 값과 다를 때만 넣어 입력 중인 커서를 유지한다.
  useLayoutEffect(() => {
    const editor = editorRef.current?.getInstance();
    const current = shown.current;
    if (!editor || (current?.editor === editor && current?.value === contents))
      return;

    applyingContents.current = true;
    try {
      editor.setHTML(toEditorHTML(contents), false);
      // 새로 만든 편집기는 자동 초점이 커서 위치로 스크롤한다. 긴 글이 끝에서 열리지 않게 커서를 처음에 둔다.
      if (current?.editor !== editor) editor.moveCursorToStart(false);
      shown.current = {
        editor,
        isMarkdown: editor.isMarkdownMode(),
        value: contents,
        source: contents,
        markdown: editor.getMarkdown(),
      };
    } finally {
      applyingContents.current = false;
    }
  }, [contents]);

  // 편집기가 처음 채우는 내용, 폼에서 넣는 본문, 모드 전환이 만드는 변환은 실행 취소 이력에 남기지 않는다. 남기면 실행 취소가 불러온 본문을 지우거나 서버가 바꾼 본문을 이전 내용으로 되돌린다.
  const keepOutOfHistory = ({ instance, pmState }: HistoryPluginContext) => {
    const plugin = (isMarkdownEditor: boolean) => () =>
      new pmState.Plugin({
        filterTransaction: transaction => {
          const current = shown.current;
          if (
            applyingContents.current ||
            current?.editor !== instance ||
            current.isMarkdown !== instance.isMarkdownMode() ||
            current.isMarkdown !== isMarkdownEditor
          )
            transaction.setMeta('addToHistory', false);
          return true;
        },
      });
    return {
      wysiwygPlugins: [plugin(false)],
      markdownPlugins: [plugin(true)],
    };
  };

  const addImage = (blob: Blob, insert: (url: string) => void) => {
    if (blob.size === 0 || !blob.type.startsWith('image/')) {
      setImageError('읽을 수 있는 이미지 파일을 선택해 주세요.');
      return;
    }
    if (blob.size > POST_IMAGE_MAX_BYTES) {
      setImageError(
        `이미지 파일이 ${POST_IMAGE_MAX_BYTES / 1024} KiB를 넘습니다. 이미지를 줄이거나 이미지 URL을 사용해 주세요.`
      );
      return;
    }

    const reader = new FileReader();
    setImageError('');
    onImageRead(true);
    reader.onloadend = () => {
      onImageRead(false);
      if (!containerRef.current) return;
      if (typeof reader.result === 'string') insert(reader.result);
      else setImageError('이미지를 읽지 못했습니다. 다시 첨부해 주세요.');
    };
    reader.readAsDataURL(blob);
  };

  useEffect(() => {
    const container = containerRef.current;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () =>
      container
        ?.querySelector('.toastui-editor-defaultUI')
        ?.classList.toggle('toastui-editor-dark', media.matches);
    syncTheme();
    media.addEventListener('change', syncTheme);
    return () => media.removeEventListener('change', syncTheme);
  }, []);

  useEffect(() => {
    const descriptions = [
      'contents-size-hint',
      isInvalid ? 'contents-error' : '',
      imageError ? 'contents-image-error' : '',
    ].filter(Boolean);
    const syncFields = () => {
      containerRef.current
        ?.querySelectorAll<HTMLElement>('[contenteditable="true"], textarea')
        .forEach(field => {
          if (field.getAttribute('contenteditable') === 'true') {
            field.setAttribute('role', 'textbox');
            field.setAttribute('aria-multiline', 'true');
          }
          field.setAttribute('aria-label', '본문');
          field.setAttribute('aria-invalid', String(isInvalid));
          field.setAttribute('aria-describedby', descriptions.join(' '));
        });
      containerRef.current
        ?.querySelectorAll<HTMLButtonElement>('button.more')
        .forEach(button => {
          if (!button.getAttribute('aria-label')?.trim())
            button.setAttribute('aria-label', '도구 더 보기');
        });
    };
    syncFields();
    const observer = new MutationObserver(syncFields);
    if (containerRef.current)
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    return () => observer.disconnect();
  }, [imageError, isInvalid]);

  return (
    <div ref={containerRef} className="post-editor">
      <TuiEditor
        ref={editorRef}
        minHeight="400px"
        initialValue=" "
        initialEditType="wysiwyg"
        previewStyle={window.innerWidth > 1000 ? 'vertical' : 'tab'}
        theme={
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : ''
        }
        usageStatistics={false}
        toolbarItems={toolbarItems}
        hooks={{ addImageBlobHook: addImage }}
        plugins={[keepOutOfHistory]}
        language="ko-KR"
        onChange={() => {
          const editor = editorRef.current?.getInstance();
          const current = shown.current;
          if (!current || current.editor !== editor || applyingContents.current)
            return;

          // 편집기는 넣은 원문을 다른 HTML로 표현하고 모드에 따라 표현이 또 달라진다. 모드와 무관한 Markdown이 넣은 직후와 같으면 원문을 돌려줘 수정하지 않은 본문으로 남긴다.
          const value =
            editor.getMarkdown() === current.markdown
              ? current.source
              : fromEditorHTML(editor.getHTML());
          shown.current = {
            ...current,
            isMarkdown: editor.isMarkdownMode(),
            value,
          };
          if (value !== current.value) onChange(value);
        }}
      />
      <ValidationError
        id="contents-image-error"
        isError={!!imageError}
        message={imageError}
      />
    </div>
  );
}
