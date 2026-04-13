import ButtonBox from '@entities/post/ui/Form/ButtonBox';
import ContentsEditor from '@entities/post/ui/Form/ContentsEditor';
import IsOpenCheckbox from '@entities/post/ui/Form/IsOpenCheckbox';
import TitleInput from '@entities/post/ui/Form/TitleInput';
import TypeSelect from '@entities/post/ui/Form/TypeSelect';
import { UpdatePostFormInput } from '@domains/post/update/_types/form';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
