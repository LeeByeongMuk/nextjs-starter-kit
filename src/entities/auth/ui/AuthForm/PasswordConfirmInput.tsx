'use client';

import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

/** 비밀번호 확인 값의 일치 여부를 알린다. */
export default function PasswordConfirmInput() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label
        htmlFor="passwordConfirmation"
        className="block text-sm font-semibold"
      >
        비밀번호 확인
      </label>
      <input
        id="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        aria-invalid={!!errors.passwordConfirmation}
        aria-describedby={
          errors.passwordConfirmation ? 'passwordConfirmation-error' : undefined
        }
        className="mt-2 block min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
        {...register('passwordConfirmation')}
      />
      <ValidationError
        id="passwordConfirmation-error"
        isError={!!errors.passwordConfirmation}
        message={errors.passwordConfirmation?.message?.toString()}
      />
    </div>
  );
}
