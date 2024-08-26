import React from 'react';
import { useFormContext } from 'react-hook-form';

import ValidationError from '@/app/components/Error/ValidationError';

export default function IsPublishedCheckbox() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mt-5">
      <label className="block text-xs font-medium text-gray-700">Is Open</label>

      <div className="mt-2 flex gap-5">
        <div className="flex items-center">
          <input
            type="radio"
            id="isOpen1"
            className="rounded-md border-gray-200 shadow-sm sm:text-sm"
            value="1"
            {...register('isPublished', {
              required: 'Is Open is required',
            })}
          />
          <label htmlFor="isOpen1" className="ml-2">
            Yes
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="radio"
            id="isOpen2"
            className="rounded-md border-gray-200 shadow-sm sm:text-sm"
            value="0"
            {...register('isPublished', {
              required: 'Is Open is required',
            })}
          />
          <label htmlFor="isOpen2" className="ml-2">
            No
          </label>
        </div>
      </div>

      <ValidationError
        role="isOpen-error-message"
        isError={!!errors.isPublished}
        message={errors.isPublished?.message?.toString()}
      />
    </div>
  );
}
