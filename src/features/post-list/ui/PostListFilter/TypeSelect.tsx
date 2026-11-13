import { LIST_TYPE_OPTIONS } from '@entities/post';
import { useFormContext } from 'react-hook-form';

interface Props {
  onChange: () => void;
}

/** 화면 폭에 맞춰 표시하는 게시글 분류 선택 */
export default function TypeSelect({ onChange }: Props) {
  const { register, watch, setValue } = useFormContext();
  const selectedType = watch('type');

  return (
    <div className="shrink-0">
      <div className="sm:hidden">
        <label
          htmlFor="type"
          className="mb-2 block text-sm font-medium text-ink"
        >
          분류
        </label>

        <select
          id="type"
          className="min-h-12 w-full rounded-md bg-surface border-line text-sm text-ink focus:border-accent focus:ring-accent"
          {...register('type', { onChange })}
        >
          {LIST_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <div className="flex gap-1" role="group" aria-label="게시글 분류">
          {LIST_TYPE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === selectedType}
              aria-controls="post-list"
              className={`min-h-11 shrink-0 cursor-pointer rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${
                option.value === selectedType
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:bg-skeleton hover:text-ink'
              }`}
              onClick={() => {
                setValue('type', option.value);
                onChange();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
