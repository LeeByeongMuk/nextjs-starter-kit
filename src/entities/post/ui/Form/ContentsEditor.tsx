import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';
import ValidationError from '@shared/ui/error/ValidationError';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { POST_IMAGE_MAX_BYTES } from '../../config/editor';
import { type PostFormInput } from '../../model/form';

const Editor = dynamic(() => import('../Editor'), { ssr: false });

interface Props {
  onImageRead: (reading: boolean) => void;
  waitingForImages: boolean;
}

/** HTML 편집기의 입력과 오류 설명을 연결한다. */
export default function ContentsEditor({
  onImageRead,
  waitingForImages,
}: Props) {
  const {
    control,
    setValue,
    register,
    trigger,
    formState: { errors },
  } = useFormContext<PostFormInput>();
  const hasContents = useWatch({
    control,
    name: 'contents',
    compute: Boolean,
  });
  const message =
    waitingForImages && hasContents
      ? '이미지를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.'
      : errors.contents?.message;

  useEffect(() => {
    register('contents');
  }, [register]);
  return (
    <div className="mt-6">
      <p id="contents-label" className="mb-2 text-sm font-semibold">
        본문
      </p>
      <p id="contents-size-hint" className="mb-2 text-sm text-muted">
        이미지 파일은 1개당 {POST_IMAGE_MAX_BYTES / 1024} KiB까지 첨부할 수
        있습니다. 제목과 본문을 포함한 글 전체는 {POST_REQUEST_MAX_BYTES / 1024}{' '}
        KiB까지 저장할 수 있습니다.
      </p>
      <Editor
        onImageRead={onImageRead}
        onChange={contents => {
          setValue('contents', contents, { shouldDirty: true });
          if (errors.contents || (waitingForImages && !contents))
            void trigger('contents');
        }}
        isInvalid={!!message}
      />
      <ValidationError
        id="contents-error"
        isError={!!message}
        message={message}
      />
    </div>
  );
}
