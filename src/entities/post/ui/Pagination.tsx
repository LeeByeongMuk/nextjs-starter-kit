import { PaginationMeta } from '@shared/api/pagination';

import { PAGE_GROUP_NUMBER } from '../config/post';

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

/** 페이지 이동을 상세 URL과 혼동하지 않는 버튼으로 제공한다. */
export default function Pagination({ meta, onPageChange }: Props) {
  const firstPage =
    (Math.ceil(meta.current_page / PAGE_GROUP_NUMBER) - 1) * PAGE_GROUP_NUMBER +
    1;
  const lastPage = Math.min(firstPage + PAGE_GROUP_NUMBER - 1, meta.last_page);
  const pages = Array.from(
    { length: Math.max(lastPage - firstPage + 1, 1) },
    (_, i) => firstPage + i
  );

  return (
    <nav aria-label="게시글 페이지" className="mt-10 border-t border-line pt-6">
      <ul className="flex flex-wrap items-center justify-center gap-1 text-sm">
        {meta.current_page > 1 && (
          <li>
            <button
              type="button"
              onClick={() => onPageChange(meta.current_page - 1)}
              className="min-h-11 min-w-11 rounded px-3 text-muted hover:bg-accent-soft hover:text-accent"
            >
              이전
            </button>
          </li>
        )}
        {pages.map(page => (
          <li key={page}>
            <button
              type="button"
              aria-label={`${page} 페이지`}
              aria-current={page === meta.current_page ? 'page' : undefined}
              onClick={() => onPageChange(page)}
              className={`min-h-11 min-w-11 rounded px-3 font-medium ${page === meta.current_page ? 'bg-accent text-inverse' : 'text-muted hover:bg-accent-soft hover:text-accent'}`}
            >
              {page}
            </button>
          </li>
        ))}
        {meta.current_page < meta.last_page && (
          <li>
            <button
              type="button"
              onClick={() => onPageChange(meta.current_page + 1)}
              className="min-h-11 min-w-11 rounded px-3 text-muted hover:bg-accent-soft hover:text-accent"
            >
              다음
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
