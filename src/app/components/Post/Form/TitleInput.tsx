import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  defaultValue?: string;
}

export default function TitleInput({ defaultValue = '' }: Props) {
  const { register } = useFormContext();
  return (
    <div>
      <label
        htmlFor="title"
        className="block text-xs font-medium text-gray-700"
      >
        Title
      </label>

      <input
        type="text"
        id="title"
        className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
        placeholder="Post title..."
        defaultValue={defaultValue}
        {...register('title', { required: true })}
      />
    </div>
  );
}
