import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function PwConfInput() {
  const { register } = useFormContext();

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="passwordConfirmation"
          form="passwordConfirmation"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Password Confirmation
        </label>
      </div>
      <div className="mt-2">
        <input
          id="passwordConfirmation"
          type="password"
          required
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          {...register('passwordConfirmation', { required: true })}
        />
      </div>
    </div>
  );
}
