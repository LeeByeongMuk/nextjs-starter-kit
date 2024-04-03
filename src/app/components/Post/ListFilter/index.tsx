import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import SearchInput from '@/app/components/Post/ListFilter/SearchInput';
import TypeSelect from '@/app/components/Post/ListFilter/TypeSelect';
import { PostListSearch, PostsReq, PostType } from '@/app/types/post';

interface Props {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

export default function ListFilter({ setSearchFilters }: Props) {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const methods = useForm<PostListSearch>({
    defaultValues: {
      type: (searchParams.get('type') as PostType) || '',
      q: searchParams.get('q') || '',
    },
  });
  const { handleSubmit, getValues } = methods;

  const onSubmit: SubmitHandler<PostListSearch> = data => {
    setSearchFilters({
      ...data,
      page: 1,
    });
  };

  const updateTypeTrigger = () => {
    const type = getValues('type');
    setSearchFilters(prev => ({
      ...prev,
      type,
      page: 1,
    }));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between">
          <TypeSelect onChange={updateTypeTrigger} />

          <div className="flex">
            {status === 'authenticated' && (
              <Link
                href="/post/create"
                className="mr-2 flex items-center rounded border border-teal-600 bg-teal-600 px-4 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
                passHref={false}
              >
                Post Create
              </Link>
            )}
            <SearchInput />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
