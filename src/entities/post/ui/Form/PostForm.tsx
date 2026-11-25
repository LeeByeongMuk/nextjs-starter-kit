'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { type PostFormInput, type PostFormOutput } from '../../model/form';
import ButtonBox from './ButtonBox';
import ContentsEditor from './ContentsEditor';
import IsOpenCheckbox from './IsOpenCheckbox';
import TitleInput from './TitleInput';
import TypeSelect from './TypeSelect';

interface Props {
  onSave: (data: PostFormOutput) => Promise<unknown>;
}

/** 게시글 입력을 검증하고 한 번에 하나의 저장 요청을 처리한다. */
export default function PostForm({ onSave }: Props) {
  const {
    handleSubmit,
    getValues,
    setError,
    formState: { isSubmitting },
  } = useFormContext<PostFormInput, unknown, PostFormOutput>();
  const submission = useRef<'idle' | 'submitting' | 'saved'>('idle');
  const readingImages = useRef(0);
  const [isSaved, setIsSaved] = useState(false);

  // 이미지 읽기는 폼 값이 아닌 진행 상태라 스키마 밖에서 확인한다. 빈 본문 안내 다음, 다른 본문 오류보다 먼저 안내한다.
  const holdWhileReadingImages = () => {
    if (readingImages.current === 0 || !getValues('contents')) return false;

    setError('contents', {
      type: 'imageReading',
      message: '이미지를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.',
    });
    return true;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submission.current !== 'idle') return;

    submission.current = 'submitting';
    try {
      await handleSubmit(async data => {
        if (holdWhileReadingImages()) return;

        await onSave(data);
        submission.current = 'saved';
        setIsSaved(true);
      }, holdWhileReadingImages)(event);
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
      <ContentsEditor
        onImageRead={reading => {
          readingImages.current += reading ? 1 : -1;
        }}
        holdWhileReadingImages={holdWhileReadingImages}
      />
      <IsOpenCheckbox />
      <ButtonBox isSubmitting={isSubmitting} isSaved={isSaved} />
    </form>
  );
}
