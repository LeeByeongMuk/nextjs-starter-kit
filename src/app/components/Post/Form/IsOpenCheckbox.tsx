import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  checked?: boolean;
}

export default function IsOpenCheckbox({ checked }: Props) {
  const { register } = useFormContext();

  return (
    <div className="mt-5">
      <label
        htmlFor="isOpen"
        className="block text-xs font-medium text-gray-700"
      >
        Is Open
      </label>

      <input
        type="checkbox"
        id="isOpen"
        className="mt-1 rounded-md border-gray-200 shadow-sm sm:text-sm"
        defaultChecked={checked}
        {...register('isOpen')}
      />
    </div>
  );
}
