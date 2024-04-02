import { useSearchParams } from 'next/navigation';
import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import SearchInput from '@/app/components/Post/ListFilter/SearchInput';
import TypeSelect from '@/app/components/Post/ListFilter/TypeSelect';
import { PostListSearch, PostsReq, PostType } from '@/app/types/post';

interface Props {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

export default function ListFilter({ setSearchFilters }: Props) {
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

          <SearchInput />
        </div>
      </form>
    </FormProvider>
  );
}
