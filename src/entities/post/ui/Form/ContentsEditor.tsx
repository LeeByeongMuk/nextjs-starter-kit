import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';
import ValidationError from '@shared/ui/error/ValidationError';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { serializePostBody } from '../../api/serializePostBody';
import { POST_IMAGE_MAX_BYTES } from '../../config/editor';
import { type PostFormInput } from '../../model/form';

const Editor = dynamic(() => import('../Editor'), { ssr: false });

/** HTML 편집기의 입력과 오류 설명을 연결한다. */
export default function ContentsEditor() {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<PostFormInput>();
  const readingImages = useRef(0);

  useEffect(() => {
    register('contents', {
      required: '본문을 입력해 주세요.',
      validate: (contents, values) => {
        if (readingImages.current > 0) {
          return '이미지를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.';
        }

        const body = serializePostBody({
          ...values,
          contents,
          is_open: values.isOpen === '1',
        });
        if (
          new TextEncoder().encode(body).byteLength > POST_REQUEST_MAX_BYTES
        ) {
          return `글 전체가 ${POST_REQUEST_MAX_BYTES / 1024} KiB를 넘습니다. 이미지나 본문을 줄인 뒤 다시 저장해 주세요.`;
        }

        const template = document.createElement('template');
        template.innerHTML = contents;
        return (
          !!(
            template.content.textContent?.trim() ||
            template.content.querySelector('img, video, iframe, audio, hr')
          ) || '본문을 입력해 주세요.'
        );
      },
    });
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
        onImageRead={reading => {
          readingImages.current += reading ? 1 : -1;
        }}
        onChange={contents =>
          setValue('contents', contents, {
            shouldDirty: true,
            shouldValidate: !!errors.contents,
          })
        }
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
