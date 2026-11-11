import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

import { TYPE_OPTIONS } from '../../config/post';

/** 게시글 분류를 선택한다. */
export default function TypeSelect() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="mt-6">
      <label htmlFor="type" className="block text-sm font-semibold">
        분류
      </label>
      <select
        id="type"
        aria-invalid={!!errors.type}
        aria-describedby={errors.type ? 'type-error' : undefined}
        className="mt-2 min-h-12 w-full rounded border border-line bg-surface py-2 pr-9 pl-3 text-ink"
        {...register('type', { required: '분류를 선택해 주세요.' })}
      >
        {TYPE_OPTIONS.map(({ value }) => (
          <option key={value} value={value}>
            {value === ''
              ? '분류 선택'
              : value === 'notice'
                ? '공지'
                : value === 'faq'
                  ? '자주 묻는 질문'
                  : '자유'}
          </option>
        ))}
      </select>
      <ValidationError
        id="type-error"
        isError={!!errors.type}
        message={errors.type?.message?.toString()}
      />
    </div>
  );
}
