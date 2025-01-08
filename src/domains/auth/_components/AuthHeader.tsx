import React from 'react';

interface Props {
  headText: string;
}

export default function AuthHeader({ headText }: Props) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        className="mx-auto h-10 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
        alt="Your Company"
      />
      <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        {headText}
      </h2>
    </div>
  );
}
