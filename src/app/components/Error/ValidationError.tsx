import React from 'react';

interface Props {
  isError: boolean;
  message?: string;
}

export default function ValidationError({ isError, message }: Props) {
  if (!isError) return null;
  return (
    <span className="ml-1 mt-1 flex items-center text-xs font-medium tracking-wide text-red-500">
      {message || 'Invalid field!'}
    </span>
  );
}
