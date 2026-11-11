import { useFormContext } from 'react-hook-form';

/** 검색어 입력과 제출, 최소 길이 오류를 함께 제공한다. */
export default function SearchInput() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="w-full sm:max-w-sm">
      <label htmlFor="q" className="sr-only">
        게시글 검색
      </label>
      <div className="flex rounded border border-line bg-surface">
        <input
          id="q"
          type="search"
          placeholder="제목과 본문 검색"
          aria-invalid={!!errors.q}
          aria-describedby={errors.q ? 'search-error' : undefined}
          className="min-h-12 w-full min-w-0 flex-1 border-0 bg-transparent px-3 text-ink placeholder:text-muted"
          {...register('q', {
            minLength: {
              value: 2,
              message: '검색어를 2자 이상 입력해 주세요.',
            },
          })}
        />
        <button
          type="submit"
          className="min-h-12 min-w-14 px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
        >
          검색
        </button>
      </div>
      {errors.q && (
        <p id="search-error" role="alert" className="mt-2 text-sm text-danger">
          {errors.q.message?.toString()}
        </p>
      )}
    </div>
  );
}
