import React from 'react';
import { useFormContext } from 'react-hook-form';
import ValidationError from '@/app/components/Error/ValidationError';

interface Props {
  defaultValue?: string;
}

export default function TitleInput({ defaultValue = '' }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

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
        {...register('title', {
          required: {
            value: true,
            message: 'Title is required',
          },
        })}
      />

      <ValidationError
        role="title-error-message"
        isError={!!errors.title}
        message={errors.title?.message?.toString()}
      />
    </div>
  );
}
