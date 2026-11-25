import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

import ValidationError from '@shared/ui/error/ValidationError';
import { Editor as TuiEditor } from '@toast-ui/react-editor';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { POST_IMAGE_MAX_BYTES } from '../config/editor';
import { type PostFormInput } from '../model/form';

interface Props {
  onChange: (contents: string) => void;
  onImageRead: (reading: boolean) => void;
  isInvalid?: boolean;
}

/** ToastUI의 HTML·도구 모음을 유지하며 편집 영역에 접근성 정보를 연결한다. */
export default function Editor({
  onChange,
  onImageRead,
  isInvalid = false,
}: Props) {
  const contents = useWatch<PostFormInput, 'contents'>({ name: 'contents' });
  const displayedContents = useRef(contents);
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

  // Toast UI는 initialValue를 마운트할 때만 읽는다. 서버에서 바뀐 본문만 반영해 편집 중인 커서를 유지한다.
  useLayoutEffect(() => {
    const editor = editorRef.current?.getInstance();
    if (!editor || contents === displayedContents.current) return;

    applyingContents.current = true;
    try {
      editor.setHTML(contents, false);
      displayedContents.current = contents;
    } finally {
      applyingContents.current = false;
    }
  }, [contents]);

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
        initialValue={contents || ' '}
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
        language="ko-KR"
        onChange={() => {
          const editor = editorRef.current?.getInstance();
          if (!editor || applyingContents.current) return;

          const html = editor.getHTML();
          displayedContents.current = html;
          onChange(html);
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
