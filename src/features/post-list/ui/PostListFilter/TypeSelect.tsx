import { LIST_TYPE_OPTIONS } from '@entities/post';
import { useFormContext } from 'react-hook-form';

interface Props {
  onChange: () => void;
}

/** 현재 분류를 반영하는 접근 가능한 선택 필터다. */
export default function TypeSelect({ onChange }: Props) {
  const { register } = useFormContext();
  const field = register('type');
  return (
    <div className="flex min-h-12 items-center gap-3">
      <label htmlFor="filter-type" className="shrink-0 text-sm font-semibold">
        분류
      </label>
      <select
        id="filter-type"
        className="min-h-12 w-full rounded border border-line bg-surface py-2 pr-9 pl-3 text-sm text-ink sm:w-40"
        {...field}
        onChange={event => {
          void field.onChange(event);
          onChange();
        }}
      >
        {LIST_TYPE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.value === ''
              ? '전체 글'
              : option.value === 'notice'
                ? '공지'
                : option.value === 'faq'
                  ? '자주 묻는 질문'
                  : '자유'}
          </option>
        ))}
      </select>
    </div>
  );
}
