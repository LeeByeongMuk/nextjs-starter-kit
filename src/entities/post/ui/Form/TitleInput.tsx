import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

/** 제목과 해당 검증 오류를 연결한다. */
export default function TitleInput() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label htmlFor="title" className="block text-sm font-semibold">
        제목
      </label>
      <input
        type="text"
        id="title"
        aria-invalid={!!errors.title}
        aria-describedby={errors.title ? 'title-error' : undefined}
        className="mt-2 min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
        placeholder="어떤 이야기를 나누고 싶나요?"
        {...register('title', { required: '제목을 입력해 주세요.' })}
      />
      <ValidationError
        id="title-error"
        isError={!!errors.title}
        message={errors.title?.message?.toString()}
      />
    </div>
  );
}
