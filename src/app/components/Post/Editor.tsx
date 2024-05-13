import { Editor as TuiEditor } from '@toast-ui/react-editor';
import React from 'react';

import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

interface Props {
  initialValue?: string;
  onChange: (contents: string) => void;
}

export default function Editor({ initialValue = '', onChange }: Props) {
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
      ref={editorRef}
      minHeight="400px"
      initialValue={initialValue || ' '}
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
