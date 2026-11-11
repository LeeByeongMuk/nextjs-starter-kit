import { useFormContext } from 'react-hook-form';

/** 제목과 본문 검색 입력 및 입력 길이 안내 */
export default function SearchInput() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="min-w-0 flex-1 lg:w-80 lg:flex-none">
      <label htmlFor="q" className="sr-only">
        검색
      </label>

      <div className="relative">
        <input
          type="search"
          autoComplete="off"
          id="q"
          placeholder="제목이나 내용으로 검색…"
          aria-invalid={Boolean(errors.q)}
          aria-describedby={errors.q ? 'post-search-error' : undefined}
          className="min-h-12 w-full rounded-md border-line bg-surface py-2.5 pr-24 pl-4 text-sm text-ink caret-accent placeholder:text-muted focus:border-accent focus:ring-accent"
          {...register('q', {
            minLength: 2,
          })}
        />

        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex w-20 gap-1.5 cursor-pointer items-center justify-center rounded-r-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span>검색</span>
        </button>
      </div>
      {errors.q && (
        <p
          id="post-search-error"
          role="alert"
          className="mt-2 text-sm text-danger"
        >
          검색어를 2자 이상 입력하거나 비워 주세요.
        </p>
      )}
    </div>
  );
}
