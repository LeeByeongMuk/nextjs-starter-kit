'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

import { PostType } from '@domains/post/_types/postType';
import { PostListSearch, PostsReq } from '@domains/post/list/_types/api';

interface UsePostListFormProps {
  setSearchFilters: React.Dispatch<React.SetStateAction<PostsReq>>;
}

export function usePostListForm({ setSearchFilters }: UsePostListFormProps) {
  const searchParams = useSearchParams();

  const methods = useForm<PostListSearch>({
    defaultValues: {
      type: (searchParams.get('type') as PostType) || '',
      q: searchParams.get('q') || '',
    },
  });

  const { getValues } = methods;

  const handleFormSubmit = (data: PostListSearch) => {
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

  return {
    methods,
    handleFormSubmit,
    updateTypeTrigger,
  };
}
