import ValidationError from '@shared/ui/error/ValidationError';
import { useFormContext } from 'react-hook-form';

interface Props {
  autoComplete?: 'current-password' | 'new-password';
}

/** 비밀번호 규칙과 오류를 입력에 연결한다. */
export default function PasswordInput({
  autoComplete = 'current-password',
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-semibold">
        비밀번호
      </label>
      <input
        id="password"
        type="password"
        autoComplete={autoComplete}
        aria-invalid={!!errors.password}
        aria-describedby={
          errors.password ? 'password-hint password-error' : 'password-hint'
        }
        className="mt-2 block min-h-12 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
        {...register('password', {
          required: '비밀번호를 입력해 주세요.',
          minLength: {
            value: 8,
            message: '비밀번호는 8자 이상 입력해 주세요.',
          },
          maxLength: {
            value: 20,
            message: '비밀번호는 20자 이하로 입력해 주세요.',
          },
          pattern: {
            value:
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            message: '대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.',
          },
        })}
      />
      <p id="password-hint" className="mt-2 text-sm text-muted">
        8~20자, 영문 대·소문자와 숫자, 특수문자 포함
      </p>
      <ValidationError
        id="password-error"
        isError={!!errors.password}
        message={errors.password?.message?.toString()}
      />
    </div>
  );
}
