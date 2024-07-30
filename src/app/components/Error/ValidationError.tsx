import React from 'react';

interface Props {
  isError: boolean;
  message?: string;
  role?: string;
}

export default function ValidationError({ isError, message, role }: Props) {
  if (!isError) return <div className="pb-5" />;

  return (
    <span
      role={role}
      data-testid="error-message"
      className="ml-1 mt-1 flex items-center text-xs font-medium tracking-wide text-red-500">
      {message || 'Invalid field!'}
    </span>
  );
}
