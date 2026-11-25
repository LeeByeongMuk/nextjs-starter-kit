import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  type PostFormInput,
  type PostFormOutput,
  PostFormSchema,
} from '../../model/form';
import PostForm from './PostForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));
jest.mock('next/dynamic', () => () => {
  function MockEditor({
    onChange,
    onImageRead,
  }: {
    onChange: (value: string) => void;
    onImageRead: (reading: boolean) => void;
  }) {
    return (
      <>
        <textarea
          aria-label="본문"
          onChange={event => onChange(event.target.value)}
        />
        <button type="button" onClick={() => onImageRead(true)}>
          이미지 읽기 시작
        </button>
        <button type="button" onClick={() => onImageRead(false)}>
          이미지 읽기 완료
        </button>
      </>
    );
  }
  return MockEditor;
});

const post = {
  title: '제목',
  type: 'free',
  contents: '<p>본문</p>',
  isOpen: '1',
} as const;
const contentsWithImage =
  '<p>본문<img src="data:image/png;base64,AAAA" alt="첨부"></p>';

function PostFormHarness({
  onSave,
  defaultValues = post,
}: {
  onSave: (data: PostFormOutput) => Promise<unknown>;
  defaultValues?: PostFormInput;
}) {
  const methods = useForm<PostFormInput, unknown, PostFormOutput>({
    defaultValues,
    resolver: zodResolver(PostFormSchema),
  });
  return (
    <FormProvider {...methods}>
      <PostForm onSave={onSave} />
    </FormProvider>
  );
}

test('이미지를 읽는 동안에는 저장을 미루고 읽기가 끝난 본문으로 저장한다', async () => {
  const save = jest.fn().mockResolvedValue(undefined);
  render(<PostFormHarness onSave={save} />);
  const submit = screen.getByRole('button', { name: '저장' });

  fireEvent.click(screen.getByRole('button', { name: '이미지 읽기 시작' }));
  fireEvent.click(submit);

  expect(await screen.findByRole('alert')).toHaveTextContent(
    '이미지를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.'
  );
  expect(save).not.toHaveBeenCalled();
  expect(submit).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: '이미지 읽기 완료' }));
  fireEvent.change(screen.getByLabelText('본문'), {
    target: { value: contentsWithImage },
  });
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  );

  fireEvent.click(submit);
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({ ...post, contents: contentsWithImage })
  );
});

test('다른 입력에 오류가 있어도 이미지를 읽는 중이면 본문에 함께 안내한다', async () => {
  const save = jest.fn();
  render(
    <PostFormHarness onSave={save} defaultValues={{ ...post, title: '' }} />
  );

  fireEvent.click(screen.getByRole('button', { name: '이미지 읽기 시작' }));
  fireEvent.click(screen.getByRole('button', { name: '저장' }));

  await waitFor(() =>
    expect(
      screen.getAllByRole('alert').map(alert => alert.textContent)
    ).toEqual([
      '제목을 입력해 주세요.',
      '이미지를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.',
    ])
  );
  expect(save).not.toHaveBeenCalled();
});

test('본문이 비어 있으면 이미지를 읽는 중에도 입력을 먼저 요청한다', async () => {
  const save = jest.fn();
  render(
    <PostFormHarness onSave={save} defaultValues={{ ...post, contents: '' }} />
  );

  fireEvent.click(screen.getByRole('button', { name: '이미지 읽기 시작' }));
  fireEvent.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    '본문을 입력해 주세요.'
  );
  expect(save).not.toHaveBeenCalled();
});

test('이미지를 읽는 동안 본문이 바뀌어도 읽기 안내를 유지하고 다 읽으면 지운다', async () => {
  render(<PostFormHarness onSave={jest.fn()} />);
  const startReading = screen.getByRole('button', { name: '이미지 읽기 시작' });
  const finishReading = screen.getByRole('button', {
    name: '이미지 읽기 완료',
  });
  const changeContents = (value: string) =>
    fireEvent.change(screen.getByLabelText('본문'), { target: { value } });
  const reading = '이미지를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.';

  fireEvent.click(startReading);
  fireEvent.click(startReading);
  fireEvent.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(reading);

  fireEvent.click(finishReading);
  changeContents(contentsWithImage);
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(screen.getByRole('alert')).toHaveTextContent(reading);

  fireEvent.click(finishReading);
  changeContents(`${contentsWithImage}<p>둘째</p>`);
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  );
});
