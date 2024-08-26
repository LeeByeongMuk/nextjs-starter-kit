import dynamic from 'next/dynamic';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import ValidationError from '@/app/components/Error/ValidationError';

const Editor = dynamic(() => import('../Editor'), {
  ssr: false,
});

export default function ContentsEditor() {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext();

  register('contents', {
    required: 'Contents is required',
    validate: (value: string) => {
      const ele = document.createElement('div');
      ele.innerHTML = value;
      const text = ele.innerText;
      return text.length > 0 ? true : 'Contents is required';
    },
  });

  const onEditorChange = (contents: string) => {
    setValue('contents', contents);
  };

  return (
    <div className="mt-5">
      <label
        htmlFor="contents"
        className="block text-xs font-medium text-gray-700"
      >
        Contents
      </label>

      <Editor onChange={onEditorChange} />
      <ValidationError
        role="contents-error-message"
        isError={!!errors.contents}
        message={errors.contents?.message?.toString()}
      />
    </div>
  );
}
