import { resolveFormErrors } from '@shared/lib/testing/form';

import { SIGN_UP_DEFAULT_VALUES, SignUpFormSchema } from './form';

const account = {
  email: 'test@email.com',
  name: 'name',
  nickname: 'nickname',
  password: 'Password11!!',
  passwordConfirmation: 'Password11!!',
};

const shownMessages = (input: unknown) =>
  resolveFormErrors(SignUpFormSchema, input);

describe('회원가입 폼 스키마', () => {
  test('모든 규칙을 지킨 입력을 그대로 통과시킨다', () => {
    expect(SignUpFormSchema.parse(account)).toEqual(account);
  });

  test('기본값으로 제출하면 필드마다 입력 안내를 보여 준다', async () => {
    await expect(shownMessages(SIGN_UP_DEFAULT_VALUES)).resolves.toEqual({
      email: '이메일을 입력해 주세요.',
      name: '이름을 입력해 주세요.',
      nickname: '닉네임을 입력해 주세요.',
      password: '비밀번호를 입력해 주세요.',
      passwordConfirmation: '비밀번호 확인을 입력해 주세요.',
    });
  });

  test('비밀번호 확인이 비어 있으면 불일치보다 입력 안내를 먼저 보여 준다', async () => {
    await expect(
      shownMessages({ ...account, passwordConfirmation: '' })
    ).resolves.toEqual({
      passwordConfirmation: '비밀번호 확인을 입력해 주세요.',
    });
  });

  test('다른 필드에 오류가 있어도 비밀번호 불일치를 함께 알린다', async () => {
    await expect(
      shownMessages({
        ...account,
        email: '',
        passwordConfirmation: 'wrongPassword',
      })
    ).resolves.toEqual({
      email: '이메일을 입력해 주세요.',
      passwordConfirmation: '비밀번호가 일치하지 않습니다.',
    });
  });
});
