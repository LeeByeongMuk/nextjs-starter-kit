'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

import { type PostType } from '@entities/post';

import { PostListSearch, PostsReq } from '../api/types';

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
