import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

import { Editor as TuiEditor } from '@toast-ui/react-editor';
import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  onChange: (contents: string) => void;
  isInvalid?: boolean;
}

/** ToastUI의 HTML·도구 모음을 유지하며 편집 영역에 접근성 정보를 연결한다. */
export default function Editor({ onChange, isInvalid = false }: Props) {
  const { getValues } = useFormContext();
  const editorRef = useRef<TuiEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarItems = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr'],
    ['ul', 'ol', 'task'],
    ['table', 'link'],
    ['image'],
    ['code'],
    ['scrollSync'],
  ];

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
    const syncFields = () => {
      containerRef.current
        ?.querySelectorAll<HTMLElement>('[contenteditable="true"], textarea')
        .forEach(field => {
          if (field.contentEditable === 'true') {
            field.setAttribute('role', 'textbox');
            field.setAttribute('aria-multiline', 'true');
          }
          field.setAttribute('aria-label', '본문');
          field.setAttribute('aria-invalid', String(isInvalid));
          if (isInvalid)
            field.setAttribute('aria-describedby', 'contents-error');
          else field.removeAttribute('aria-describedby');
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
  }, [isInvalid]);

  return (
    <div ref={containerRef} className="post-editor">
      <TuiEditor
        ref={editorRef}
        minHeight="400px"
        initialValue={getValues('contents') || ' '}
        initialEditType="wysiwyg"
        previewStyle={window.innerWidth > 1000 ? 'vertical' : 'tab'}
        theme={
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : ''
        }
        usageStatistics={false}
        toolbarItems={toolbarItems}
        language="ko-KR"
        onChange={() =>
          onChange(editorRef.current?.getInstance().getHTML() || '')
        }
      />
    </div>
  );
}
