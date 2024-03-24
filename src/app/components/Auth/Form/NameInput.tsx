import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function NameInput() {
  const { register } = useFormContext();

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
          required
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          {...register('name', { required: true })}
        />
      </div>
    </div>
  );
}
