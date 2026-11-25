'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { type PostFormInput } from '../../model/form';
import ButtonBox from './ButtonBox';
import ContentsEditor from './ContentsEditor';
import IsOpenCheckbox from './IsOpenCheckbox';
import TitleInput from './TitleInput';
import TypeSelect from './TypeSelect';

interface Props {
  onSave: (data: PostFormInput) => Promise<unknown>;
}

/** 게시글 입력을 검증하고 한 번에 하나의 저장 요청을 처리한다. */
export default function PostForm({ onSave }: Props) {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<PostFormInput>();
  const submission = useRef<'idle' | 'submitting' | 'saved'>('idle');
  const [isSaved, setIsSaved] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submission.current !== 'idle') return;

    submission.current = 'submitting';
    try {
      await handleSubmit(async data => {
        await onSave(data);
        submission.current = 'saved';
        setIsSaved(true);
      })(event);
    } catch {
      // 저장 오류는 mutation의 onError에서 안내한다.
    } finally {
      if (submission.current === 'submitting') submission.current = 'idle';
    }
  };

  return (
    <form noValidate onSubmit={submit} aria-busy={isSubmitting}>
      <TitleInput />
      <TypeSelect />
      <ContentsEditor />
      <IsOpenCheckbox />
      <ButtonBox isSubmitting={isSubmitting} isSaved={isSaved} />
    </form>
  );
}
