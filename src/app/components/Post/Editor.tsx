import { Editor as TuiEditor } from '@toast-ui/react-editor';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

interface Props {
  onChange: (contents: string) => void;
}

export default function Editor({ onChange }: Props) {
  const { getValues } = useFormContext();

  const editorRef = React.useRef<TuiEditor | null>(null);
  const toolbarItems = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr'],
    ['ul', 'ol', 'task'],
    ['table', 'link'],
    ['image'],
    ['code'],
    ['scrollSync'],
  ];

  const onEditorChange = () => {
    onChange(editorRef.current?.getInstance().getHTML() || '');
  };

  return (
    <TuiEditor
      id="contents"
      ref={editorRef}
      minHeight="400px"
      initialValue={getValues('contents') || ' '}
      initialEditType="wysiwyg"
      previewStyle={window.innerWidth > 1000 ? 'vertical' : 'tab'}
      theme={''}
      usageStatistics={false}
      toolbarItems={toolbarItems}
      language="ko-KR"
      onChange={onEditorChange}
    />
  );
}
