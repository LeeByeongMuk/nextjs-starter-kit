import React from 'react';
import { useFormContext } from 'react-hook-form';

import ValidationError from '@/app/components/Error/ValidationError';

interface Props {
  defaultValue?: string;
}

export default function NameInput({ defaultValue }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label
        htmlFor="name"
        form="name"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Name
      </label>
      <div className="mt-2">
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          defaultValue={defaultValue || undefined}
          {...register('name', {
            required: {
              value: true,
              message: 'Name is required',
            },
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters long',
            },
            maxLength: {
              value: 30,
              message: 'Name must be at most 30 characters long',
            },
          })}
        />

        <ValidationError
          isError={!!errors.name}
          message={errors.name?.message?.toString()}
        />
      </div>
    </div>
  );
}
