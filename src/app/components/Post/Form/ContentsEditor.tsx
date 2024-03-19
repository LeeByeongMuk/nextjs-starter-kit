import dynamic from 'next/dynamic';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const Editor = dynamic(() => import('../Editor'), {
  ssr: false,
});

interface Props {
  defaultValue?: string;
}

export default function ContentsEditor({ defaultValue }: Props) {
  const { setValue } = useFormContext();

  const onEditorChange = (contents: string) => {
    setValue('contents', contents);
  };
  return (
    <div className="mt-5">
      <label className="block text-xs font-medium text-gray-700">
        Contents
      </label>

      <Editor initialValue={defaultValue} onChange={onEditorChange} />
    </div>
  );
}
