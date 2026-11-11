import ValidationError from '@shared/ui/error/ValidationError';
import dynamic from 'next/dynamic';
import { useFormContext } from 'react-hook-form';

const Editor = dynamic(() => import('../Editor'), { ssr: false });

/** HTML 편집기의 입력과 오류 설명을 연결한다. */
export default function ContentsEditor() {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext();
  register('contents', {
    required: '본문을 입력해 주세요.',
    validate: (value: string) => {
      const element = document.createElement('div');
      element.innerHTML = value;
      return (
        !!(
          (element.textContent || '').trim() ||
          element.querySelector('img, video, iframe, audio, hr')
        ) || '본문을 입력해 주세요.'
      );
    },
  });
  return (
    <div className="mt-6">
      <p id="contents-label" className="mb-2 text-sm font-semibold">
        본문
      </p>
      <Editor
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
