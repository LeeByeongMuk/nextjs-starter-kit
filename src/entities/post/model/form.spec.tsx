import { POST_REQUEST_MAX_BYTES } from '@shared/config/request-size';
import { resolveFormErrors } from '@shared/lib/testing/form';

import { POST_FORM_DEFAULT_VALUES, PostFormSchema } from './form';

const post = {
  title: '제목',
  type: 'free',
  contents: '<p>본문</p>',
  isOpen: '1',
};
const oversized = '한'.repeat(POST_REQUEST_MAX_BYTES / 3);
const sizeMessage =
  '글 전체가 384 KiB를 넘습니다. 이미지나 본문을 줄인 뒤 다시 저장해 주세요.';

const shownMessages = (input: unknown) =>
  resolveFormErrors(PostFormSchema, input);

describe('게시글 폼 스키마', () => {
  test('검증을 통과한 값은 선택한 분류와 공개 범위를 유지한다', () => {
    expect(PostFormSchema.parse(post)).toEqual(post);
  });

  test.each([
    ['기본값', { ...POST_FORM_DEFAULT_VALUES, isOpen: null }],
    ['값이 없는 폼', {}],
  ])('%s으로 제출하면 필드마다 입력 안내를 보여 준다', async (_, input) => {
    await expect(shownMessages(input)).resolves.toEqual({
      title: '제목을 입력해 주세요.',
      type: '분류를 선택해 주세요.',
      contents: '본문을 입력해 주세요.',
      isOpen: '공개 범위를 선택해 주세요.',
    });
  });

  test.each(['legacy', undefined, null])(
    '지원하지 않는 분류 %p는 다시 선택하게 한다',
    async type => {
      await expect(shownMessages({ ...post, type })).resolves.toEqual({
        type: '분류를 선택해 주세요.',
      });
    }
  );

  test.each(['<p><br></p>', '<p> </p>', '<div></div>'])(
    '보이는 내용이 없는 본문 %p은 입력을 요청한다',
    async contents => {
      await expect(shownMessages({ ...post, contents })).resolves.toEqual({
        contents: '본문을 입력해 주세요.',
      });
    }
  );

  test.each(['<p><img src="/sample.png" alt="예제"></p>', '<hr>'])(
    '글자가 없어도 이미지나 구분선이 있는 본문 %p은 통과한다',
    contents => {
      expect(PostFormSchema.safeParse({ ...post, contents }).success).toBe(
        true
      );
    }
  );

  test('저장 요청 크기가 한도를 넘으면 본문 오류로 안내한다', async () => {
    await expect(
      shownMessages({ ...post, contents: `<p>${oversized}</p>` })
    ).resolves.toEqual({ contents: sizeMessage });
  });

  test('크기 초과는 보이는 내용이 없는 본문 안내보다 먼저 알리고 본문을 해석하지 않는다', async () => {
    const createElement = jest.spyOn(document, 'createElement');

    await expect(
      shownMessages({ ...post, title: oversized, contents: '<p><br></p>' })
    ).resolves.toEqual({ contents: sizeMessage });
    expect(createElement).not.toHaveBeenCalledWith('template');
  });

  test('빈 본문은 크기 초과보다 먼저 입력을 요청한다', async () => {
    await expect(
      shownMessages({ ...post, title: oversized, contents: '' })
    ).resolves.toEqual({ contents: '본문을 입력해 주세요.' });
  });

  test('다른 필드를 채우기 전에도 본문 크기와 내용을 함께 안내한다', async () => {
    await expect(
      shownMessages({
        title: '',
        type: '',
        isOpen: null,
        contents: `<p>${oversized}</p>`,
      })
    ).resolves.toEqual({
      title: '제목을 입력해 주세요.',
      type: '분류를 선택해 주세요.',
      contents: sizeMessage,
      isOpen: '공개 범위를 선택해 주세요.',
    });
    await expect(
      shownMessages({ ...post, type: '', isOpen: null, contents: '<p> </p>' })
    ).resolves.toEqual({
      type: '분류를 선택해 주세요.',
      contents: '본문을 입력해 주세요.',
      isOpen: '공개 범위를 선택해 주세요.',
    });
  });
});
