import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

/** 공개 범위를 라디오 그룹과 설명으로 제공한다. */
export default function IsOpenCheckbox() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <fieldset
      className="mt-8"
      aria-invalid={!!errors.isOpen}
      aria-describedby={errors.isOpen ? 'isOpen-error' : undefined}
    >
      <legend className="text-sm font-semibold">공개 범위</legend>
      <div className="mt-2 flex flex-wrap gap-6">
        {[
          { value: '1', label: '공개' },
          { value: '0', label: '비공개' },
        ].map(option => (
          <label
            key={option.value}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="radio"
              value={option.value}
              aria-describedby={errors.isOpen ? 'isOpen-error' : undefined}
              className="size-4 border-line bg-surface text-accent focus:ring-accent"
              {...register('isOpen', {
                required: '공개 범위를 선택해 주세요.',
              })}
            />
            {option.label}
          </label>
        ))}
      </div>
      <ValidationError
        id="isOpen-error"
        isError={!!errors.isOpen}
        message={errors.isOpen?.message?.toString()}
      />
    </fieldset>
  );
}
