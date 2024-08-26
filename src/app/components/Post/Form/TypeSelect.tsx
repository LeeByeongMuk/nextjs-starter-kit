import React from 'react';
import { useFormContext } from 'react-hook-form';

import ValidationError from '@/app/components/Error/ValidationError';
import { TYPE_OPTIONS } from '@/app/constants/post';

export default function TypeSelect() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mt-5">
      <label htmlFor="type" className="block text-xs font-medium text-gray-700">
        Type
      </label>

      <select
        id="type"
        className="mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm"
        {...register('type', {
          required: 'Type is required',
        })}
      >
        {TYPE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <ValidationError
        isError={!!errors.type}
        message={errors.type?.message?.toString()}
      />
    </div>
  );
}
