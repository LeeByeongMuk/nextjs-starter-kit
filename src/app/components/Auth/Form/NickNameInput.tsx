import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function NickNameInput() {
  const { register } = useFormContext();

  return (
    <div>
      <label
        htmlFor="nickname"
        form="nickname"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        NickName
      </label>
      <div className="mt-2">
        <input
          id="name"
          type="text"
          autoComplete="nickname"
          required
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          {...register('nickname', { required: true })}
        />
      </div>
    </div>
  );
}
