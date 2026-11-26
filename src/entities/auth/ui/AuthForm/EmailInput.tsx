'use client';

import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

interface Props {
  defaultValue?: string;
}

/** 이메일 입력과 검증 오류를 연결한다. */
export default function EmailInput({ defaultValue }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-semibold">
        이메일
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultValue || undefined}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
        className="mt-2 block min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
        {...register('email')}
      />
      <ValidationError
        id="email-error"
        isError={!!errors.email}
        message={errors.email?.message?.toString()}
      />
    </div>
  );
}
