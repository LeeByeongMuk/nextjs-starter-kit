'use client';

import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

interface Props {
  defaultValue?: string;
}

/** 닉네임 입력과 검증 오류를 연결한다. */
export default function NickNameInput({ defaultValue }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label htmlFor="nickname" className="block text-sm font-semibold">
        닉네임
      </label>
      <input
        id="nickname"
        type="text"
        autoComplete="nickname"
        defaultValue={defaultValue || undefined}
        aria-invalid={!!errors.nickname}
        aria-describedby={errors.nickname ? 'nickname-error' : undefined}
        className="mt-2 block min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
        {...register('nickname')}
      />
      <ValidationError
        id="nickname-error"
        isError={!!errors.nickname}
        message={errors.nickname?.message?.toString()}
      />
    </div>
  );
}
