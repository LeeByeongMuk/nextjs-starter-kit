import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function PwInput() {
  const { register } = useFormContext();

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="password"
          form="password"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Password
        </label>
        <div className="text-sm">
          <a
            href="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <div className="mt-2">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          {...register('password', { required: true })}
        />
      </div>
    </div>
  );
}
