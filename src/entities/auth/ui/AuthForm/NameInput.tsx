import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

interface Props {
  defaultValue?: string;
}

/** 이름 입력과 검증 오류를 연결한다. */
export default function NameInput({ defaultValue }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-semibold">
        이름
      </label>
      <input
        id="name"
        type="text"
        autoComplete="name"
        defaultValue={defaultValue || undefined}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'name-error' : undefined}
        className="mt-2 block min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
        {...register('name', {
          required: '이름을 입력해 주세요.',
          minLength: { value: 2, message: '이름은 2자 이상 입력해 주세요.' },
          maxLength: {
            value: 30,
            message: '이름은 30자 이하로 입력해 주세요.',
          },
        })}
      />
      <ValidationError
        id="name-error"
        isError={!!errors.name}
        message={errors.name?.message?.toString()}
      />
    </div>
  );
}
