import React from 'react';
import { useFormContext } from 'react-hook-form';

import ButtonBox from '@domains/post/_components/Form/ButtonBox';
import ContentsEditor from '@domains/post/_components/Form/ContentsEditor';
import IsOpenCheckbox from '@domains/post/_components/Form/IsOpenCheckbox';
import TitleInput from '@domains/post/_components/Form/TitleInput';
import TypeSelect from '@domains/post/_components/Form/TypeSelect';
import { UpdatePostFormInput } from '@domains/post/update/_types/form';

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
