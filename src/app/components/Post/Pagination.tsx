import classNames from 'classnames';
import React from 'react';

import { PAGE_GROUP_NUMBER } from '@/app/constants/post';
import { PaginationMeta } from '@/app/types/pagination';
import { PostsReq } from '@/app/types/post';

interface Props {
  meta: PaginationMeta;
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

export default function Pagination({ meta, setSearchFilters }: Props) {
  const getPageGroup = () => {
    const pageGroupNum = Math.ceil(meta.current_page / PAGE_GROUP_NUMBER);
    const firstPageNum = (pageGroupNum - 1) * PAGE_GROUP_NUMBER + 1;
    const lastPageNum = Math.min(
      firstPageNum + PAGE_GROUP_NUMBER - 1,
      meta.last_page
    );

    return Array.from(
      { length: lastPageNum - firstPageNum + 1 },
      (_, i) => firstPageNum + i
    );
  };

  const onUpdatePage = (page: number) => {
    setSearchFilters(prev => ({ ...prev, page }));
  };

  const onPrevPage = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setSearchFilters(prev => ({ ...prev, page: meta.current_page - 1 }));
  };

  const onNextPage = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setSearchFilters(prev => ({ ...prev, page: meta.current_page + 1 }));
  };

  const pageGroup = getPageGroup();

  return (
    <nav className="mt-4 flex justify-center">
      <ul className="inline-flex -space-x-px text-sm">
        {meta.current_page > 1 && (
          <li>
            <a
              href="#"
              className="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={onPrevPage}
            >
              Previous
            </a>
          </li>
        )}

        {pageGroup.map(d => (
          <li key={d}>
            <a
              href={`/post/${d}`}
              className={classNames(
                'flex h-8 items-center justify-center border px-3 leading-tight',
                {
                  'border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white':
                    meta.current_page !== d,
                },
                {
                  'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white':
                    meta.current_page === d,
                }
              )}
              onClick={e => {
                e.preventDefault();
                onUpdatePage(d);
              }}
            >
              {d}
            </a>
          </li>
        ))}

        {meta.last_page !== meta.current_page && (
          <li>
            <a
              href="#"
              className="flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={onNextPage}
            >
              Next
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
