import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';
import ValidationError from '@shared/ui/error/ValidationError';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { POST_IMAGE_MAX_BYTES } from '../../config/editor';
import { type PostFormInput } from '../../model/form';

const Editor = dynamic(() => import('../Editor'), { ssr: false });

interface Props {
  onImageRead: (reading: boolean) => void;
  /** 이미지를 읽는 중이라 본문 오류를 그 안내로 바꿨으면 true를 반환한다 */
  holdWhileReadingImages: () => boolean;
}

/** HTML 편집기의 입력과 오류 설명을 연결한다. */
export default function ContentsEditor({
  onImageRead,
  holdWhileReadingImages,
}: Props) {
  const {
    setValue,
    register,
    trigger,
    formState: { errors },
  } = useFormContext<PostFormInput>();

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
          // 표시 중인 본문 오류는 본문이 바뀔 때 다시 확인하되, 이미지를 읽는 동안에는 그 안내를 유지한다.
          if (errors.contents && !holdWhileReadingImages()) trigger('contents');
        }}
        isInvalid={!!errors.contents}
      />
      <ValidationError
        id="contents-error"
        isError={!!errors.contents}
        message={errors.contents?.message?.toString()}
      />
    </div>
  );
}
