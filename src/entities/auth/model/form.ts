import { z } from 'zod';

const required = (message: string) => z.string(message).min(1, message);

// Zod의 min·max는 코드 포인트를 세므로, 비밀번호 정규식과 같은 UTF-16 길이는 직접 비교한다.
const minLength = (length: number) => (value: string) => value.length >= length;
const maxLength = (length: number) => (value: string) => value.length <= length;

/** 이메일 입력 규칙 */
export const EmailSchema = required('이메일을 입력해 주세요.').regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  '올바른 이메일 주소를 입력해 주세요.'
);

/** 이름 입력 규칙 */
export const NameSchema = required('이름을 입력해 주세요.')
  .refine(minLength(2), '이름은 2자 이상 입력해 주세요.')
  .refine(maxLength(30), '이름은 30자 이하로 입력해 주세요.');

/** 닉네임 입력 규칙 */
export const NicknameSchema = required('닉네임을 입력해 주세요.')
  .refine(minLength(2), '닉네임은 2자 이상 입력해 주세요.')
  .refine(maxLength(30), '닉네임은 30자 이하로 입력해 주세요.');

/** 비밀번호 입력 규칙 */
export const PasswordSchema = required('비밀번호를 입력해 주세요.')
  .refine(minLength(8), '비밀번호는 8자 이상 입력해 주세요.')
  .refine(maxLength(20), '비밀번호는 20자 이하로 입력해 주세요.')
  .regex(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
    '대문자, 소문자, 숫자, 특수문자를 각각 포함해 주세요.'
  );
