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
    validate: (value: string) => value.replace(/<!--|--!?>/g, '') !== '',
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
