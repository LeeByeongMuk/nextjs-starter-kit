import React from 'react';
import { useFormContext } from 'react-hook-form';
import ValidationError from '@/app/components/Error/ValidationError';

interface Props {
  checked?: boolean;
}

export default function IsOpenCheckbox({ checked }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mt-5">
      <label className="block text-xs font-medium text-gray-700">Is Open</label>

      <div>
        <input
          type="radio"
          id="isOpen"
          className="mt-1 rounded-md border-gray-200 shadow-sm sm:text-sm"
          value="true"
          defaultChecked={checked}
          {...register('isOpen', {
            required: 'Is Open is required',
            setValueAs: (value: string) => value === 'true',
          })}
        />
        <label htmlFor="isOpen" className="ml-2">
          Yes
        </label>
      </div>

      <div>
        <input
          type="radio"
          id="isOpen"
          className="mt-1 rounded-md border-gray-200 shadow-sm sm:text-sm"
          value="false"
          defaultChecked={checked}
          {...register('isOpen', {
            required: 'Is Open is required',
            setValueAs: (value: string) => value === 'true',
          })}
        />
        <label htmlFor="isOpen" className="ml-2">
          No
        </label>
      </div>

      <ValidationError
        role="isOpen-error-message"
        isError={!!errors.isOpen}
        message={errors.isOpen?.message?.toString()}
      />
    </div>
  );
}
