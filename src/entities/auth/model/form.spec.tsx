import { resolveFormErrors } from '@shared/lib/testing/form';
import { z, type ZodType } from 'zod';

import {
  EmailSchema,
  NameSchema,
  NicknameSchema,
  PasswordSchema,
} from './form';

const shownMessage = async (schema: ZodType<unknown, string>, value: unknown) =>
  (await resolveFormErrors(z.object({ value: schema }), { value })).value;

describe('인증 폼 공용 필드 규칙', () => {
  test.each([
    ['이메일', EmailSchema],
    ['이름', NameSchema],
    ['닉네임', NicknameSchema],
    ['비밀번호', PasswordSchema],
  ])('%s 값이 없으면 빈 값과 같은 입력 안내를 보여 준다', async (_, schema) => {
    const message = await shownMessage(schema, undefined);

    expect(message).toBe(await shownMessage(schema, ''));
    expect(message).toMatch(/입력해 주세요\.$/);
  });

  test.each([
    ['', '이메일을 입력해 주세요.'],
    ['wrongEmail', '올바른 이메일 주소를 입력해 주세요.'],
    ['test@email', '올바른 이메일 주소를 입력해 주세요.'],
    ['test@email.com', undefined],
  ])('이메일 %p의 첫 오류는 %p이다', async (value, message) => {
    await expect(shownMessage(EmailSchema, value)).resolves.toBe(message);
  });

  test.each([
    ['이름', NameSchema],
    ['닉네임', NicknameSchema],
  ])(
    '%s은 빈 값, 2자 미만, 30자 초과 순서로 안내한다',
    async (label, schema) => {
      await expect(shownMessage(schema, '')).resolves.toBe(
        `${label}을 입력해 주세요.`
      );
      await expect(shownMessage(schema, 's')).resolves.toBe(
        `${label}은 2자 이상 입력해 주세요.`
      );
      await expect(shownMessage(schema, 's'.repeat(31))).resolves.toBe(
        `${label}은 30자 이하로 입력해 주세요.`
      );
      await expect(shownMessage(schema, 's'.repeat(30))).resolves.toBe(
        undefined
      );
    }
  );

  test.each([
    ['', '비밀번호를 입력해 주세요.'],
    ['s'.repeat(7), '비밀번호는 8자 이상 입력해 주세요.'],
    ['s'.repeat(21), '비밀번호는 20자 이하로 입력해 주세요.'],
    ['password', '대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'],
    ['Password123', '대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'],
    ['Password123 ', '대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'],
    ['Password11!!', undefined],
  ])('비밀번호 %p의 첫 오류는 %p이다', async (value, message) => {
    await expect(shownMessage(PasswordSchema, value)).resolves.toBe(message);
  });

  test('길이는 비밀번호 정규식과 같은 UTF-16 단위로 센다', async () => {
    const emoji = '\u{1F600}';

    expect(emoji).toHaveLength(2);
    await expect(shownMessage(NameSchema, emoji)).resolves.toBeUndefined();
    await expect(shownMessage(NicknameSchema, emoji.repeat(16))).resolves.toBe(
      '닉네임은 30자 이하로 입력해 주세요.'
    );
    await expect(
      shownMessage(PasswordSchema, `Aa1#${emoji.repeat(2)}`)
    ).resolves.toBeUndefined();
    await expect(
      shownMessage(PasswordSchema, `Aa1#${emoji.repeat(9)}`)
    ).resolves.toBe('비밀번호는 20자 이하로 입력해 주세요.');
  });
});
