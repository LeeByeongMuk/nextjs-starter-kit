import React from 'react';
import { useFormContext } from 'react-hook-form';

import {
  ButtonBox,
  IsOpenCheckbox,
  TitleInput,
  TypeSelect,
} from '@entities/post';
// ContentsEditor wraps TUI Editor which references DOM globals at module
// load; it is excluded from the @entities/post barrel to keep SSR pages
// safe, so consumers must deep-import it from a `'use client'` file.
// eslint-disable-next-line boundaries/entry-point
import ContentsEditor from '@entities/post/ui/Form/ContentsEditor';

import { UpdatePostFormInput } from '../model/form';

interface UpdatePostFormProps {
  handleUpdatePost: (req: UpdatePostFormInput) => void;
}

export default function UpdatePostForm({
  handleUpdatePost,
}: UpdatePostFormProps) {
  const { handleSubmit } = useFormContext<UpdatePostFormInput>();

  return (
    <form onSubmit={handleSubmit(handleUpdatePost)}>
      <TitleInput />

      <TypeSelect />

      <ContentsEditor />

      <IsOpenCheckbox />

      <ButtonBox />
    </form>
  );
}
