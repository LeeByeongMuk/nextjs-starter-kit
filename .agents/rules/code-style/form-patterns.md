---
paths:
  - 'src/**/model/**'
  - 'src/**/ui/**'
---

# Forms Guide

> 대상: **React Hook Form v7** + **Zod v4** (`@hookform/resolvers`)
> 상위 문서: [`.agents/rules/code-style/code-conventions.md`](../code-style/code-conventions.md)

## 1. 파일 3분할 규약

하나의 폼은 아래 3파일로 나눈다 (전부 슬라이스 내부).

| 파일                      | 내용                                                    | 예시                                                            |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| `model/form.ts`           | 폼 스키마, 스키마에서 유도한 입력 타입, 기본값 상수     | `SignUpFormSchema`, `SignUpFormInput`, `SIGN_UP_DEFAULT_VALUES` |
| `model/use<Slice>Form.ts` | `defaultValues`와 `zodResolver`를 연결한 `useForm` 래퍼 | `useSignupForm`                                                 |
| `ui/<Slice>Form.tsx`      | `FormProvider` 소비 컴포넌트                            | `SignUpForm`                                                    |

근거: `src/features/auth-signup/`, `src/features/auth-signin/` 구조.

여러 폼이 같은 규칙을 쓰면 스키마를 `entities`로 내려 공유한다.

- 인증 필드 규칙(`EmailSchema`, `NameSchema`, `NicknameSchema`, `PasswordSchema`) → `src/entities/auth/model/form.ts`. 로그인·가입·계정 폼 스키마가 조합해 쓴다.
- 글쓰기·글 수정 폼(`PostFormSchema`, `POST_FORM_DEFAULT_VALUES`) → `src/entities/post/model/form.ts`. 두 feature의 `model/form.ts`는 타입 별칭만 둔다.

계정 폼은 세션 값과 폼을 함께 맞추므로 `useForm` 호출이 `src/features/auth-account/model/useAccountManager.ts`에 있다.

---

## 2. `defaultValues` 필수

모든 `useForm` 호출은 `defaultValues`를 **반드시** 명시한다.

```ts
// src/features/auth-signup/model/useSignupForm.ts
export function useSignupForm(): UseFormReturn<SignUpFormInput> {
  return useForm<SignUpFormInput>({
    defaultValues: SIGN_UP_DEFAULT_VALUES,
    resolver: zodResolver(SignUpFormSchema),
  });
}
```

이유:

- uncontrolled → controlled 전환 경고 방지
- 초기값이 `undefined`일 때 RHF 내부 state 불일치 차단
- 리셋 동작(`reset()`) 예측 가능

기본값은 모든 입력 필드를 채운다. 게시글 폼의 공개 범위처럼 사용자가 직접 골라야 하는 선택 항목만 비워 두고, 스키마가 선택하지 않은 상태를 오류로 안내한다.

계정처럼 같은 레코드의 서버 값이 편집 중에 갱신되는 폼은 `dirtyFields`를 구독하고 `reset(서버 값, { keepDirtyValues: true })`로 편집 중인 필드를 유지한다. 저장에 성공하면 서버가 확인한 값으로 `reset()`하여 다음 편집의 기준을 갱신한다.

게시글 수정 폼은 글 ID별로 최초 조회가 끝나면 마운트한다. 같은 글을 다시 조회할 때는 `values`와 `resetOptions.keepDirtyValues`로 사용자가 수정한 필드를 보존하고, 나머지 필드에 최신 값을 반영한다. 재조회 중에도 본문 편집기를 유지해 입력 포커스를 보존한다.

---

## 3. FormProvider + `useFormContext` 패턴

view 또는 상위 컴포넌트가 `methods`를 만들어 `<FormProvider {...methods}>`로 감싸고, 내부 컴포넌트는 `useFormContext()`로 소비한다. **prop drilling 금지**.

```tsx
// src/views/post-create/PostCreateView.tsx
const methods = useCreatePostForm();
return (
  <FormProvider {...methods}>
    <CreatePostForm handleCreatePost={handleCreatePost} />
  </FormProvider>
);
```

```tsx
// src/features/auth-signup/ui/SignUpForm.tsx
const { handleSubmit } = useFormContext<SignUpFormInput>();
```

여러 폼이 함께 쓰는 입력 컴포넌트(`src/entities/auth/ui/AuthForm/*`)는 폼 타입을 지정하지 않고 자기 필드 이름으로 `register`한다. 이 컴포넌트를 쓰는 폼의 스키마는 해당 필드 규칙을 포함해야 한다.

---

## 4. 검증 — Zod 스키마

### 4.1 규칙은 스키마에만 둔다

검증 규칙과 오류 문구는 `model/form.ts`의 스키마에 두고 `use<Slice>Form.ts`에서 `zodResolver(schema)`로 연결한다. 입력 컴포넌트는 `register('email')`만 호출한다. resolver를 연결한 폼에서는 RHF가 `register()`의 인라인 룰을 실행하지 않으므로 인라인 룰을 쓰지 않는다.

```ts
// src/entities/auth/model/form.ts
const required = (message: string) => z.string(message).min(1, message);

const minLength = (length: number) => (value: string) => value.length >= length;
const maxLength = (length: number) => (value: string) => value.length <= length;

export const NameSchema = required('이름을 입력해 주세요.')
  .refine(minLength(2), '이름은 2자 이상 입력해 주세요.')
  .refine(maxLength(30), '이름은 30자 이하로 입력해 주세요.');
```

- 화면에는 필드마다 **첫 오류**만 표시한다. 한 필드의 규칙은 빈 값 → 길이 → 형식처럼 안내할 순서대로 선언한다.
- Zod의 기본 오류 문구는 영어다. 필수 입력은 값이 없을 때(타입 오류)와 빈 값일 때 같은 문구가 나오도록 `z.string(message)`에도 문구를 준다.
- 문자열 길이는 `.refine()`에서 `value.length`로 비교한다. Zod의 `.min()`·`.max()`는 코드 포인트를 세므로 이모지처럼 UTF-16 두 단위를 쓰는 문자가 있으면 정규식 수량자(`.{8,}`)와 결과가 달라진다. 비어 있는지만 확인하는 `.min(1)`은 그대로 쓴다.
- 선택지는 `z.union()`으로 묶지 않고 `z.enum()` 하나로 선언한다. resolver는 union 오류에서 union에 지정한 문구 대신 분기 안쪽 오류의 문구를 표시한다 (`PostFormSchema`의 분류).
- 한 필드에 순서가 있는 객체 수준 규칙이 여럿이면 `.superRefine()` 하나에서 차례로 확인해 첫 오류만 남긴다. 앞선 규칙에서 결정되면 뒤의 비싼 확인(본문 HTML 해석)을 건너뛴다 (`PostFormSchema`의 본문).
- 필드 사이의 규칙은 객체 스키마의 `.refine()`에 `path`를 지정해 오류를 표시할 필드를 정한다 (비밀번호 확인, 게시글 저장 요청 크기).
- 객체 수준의 `.refine()`·`.superRefine()`은 다른 필드가 타입부터 맞지 않으면 실행되지 않는다. 아직 고르지 않은 선택 항목과 관계없이 함께 안내해야 하면 `when`으로 실행 조건을 정한다 (`PostFormSchema`의 본문 확인).

### 4.2 입력 타입과 출력 타입

폼 입력 타입은 `z.input<typeof Schema>`로 유도한다. 검증을 통과하면 타입이 좁혀지는 폼은 `z.output` 타입도 내보내고 `useForm<Input, unknown, Output>`으로 연결한다. 제출 핸들러는 출력 타입을 받는다.

```ts
// src/entities/post/model/form.ts — 분류는 입력 중에는 빈 문자열일 수 있고 검증 후에는 PostType이다
export type PostFormInput = z.input<typeof PostFormSchema>;
export type PostFormOutput = z.output<typeof PostFormSchema>;
```

### 4.3 스키마로 표현할 수 없는 조건

폼 값이 아닌 진행 상태는 스키마에 넣지 않는다. 그 필드를 검증하는 모든 경로에서 확인하고 `setError()`로 안내한다. 본문 이미지를 읽는 동안의 저장 보류가 이 방식이다 (`src/entities/post/ui/Form/PostForm.tsx`, `ContentsEditor.tsx`).

- 제출: `handleSubmit`의 성공 콜백과 실패 콜백 양쪽에서 확인한다. 실패 콜백에서도 확인해야 다른 필드에 오류가 있을 때 함께 안내된다.
- 값이 바뀔 때의 재검증: 표시 중인 오류를 `trigger()`로 다시 확인하기 전에 진행 상태를 먼저 확인한다. 진행 중이면 그 안내를 유지한다.

### 4.4 폼 스키마와 요청 스키마

- **폼 스키마** (`model/form.ts`): 사용자 입력 규칙과 오류 문구. 브라우저 DOM이 필요한 규칙(보이는 내용이 없는 본문 판정)도 여기에 둔다.
- **요청 스키마** (`api/types.ts`): 서버 액션이 받는 값의 형식. 규칙은 [`data-fetching.md`](../architecture/data-fetching.md) §7을 따른다.

두 스키마는 분리한다. 폼에만 있는 값(비밀번호 확인)이나 폼 표현(`isOpen: '1' | '0'`)이 API 형식에 섞이지 않게 한다.

---

## 5. `handle*` 함수와 form → API 변환

mutation 호출을 감싸는 함수는 `handle<Action>`으로 이름 붙이고 내부 컴포넌트에 prop으로 내린다. view에 두거나, 화면 상태를 묶는 feature 훅(`useUpdatePostManager`, `useAccountManager`)에 둔다.

```tsx
// src/views/post-create/PostCreateView.tsx
const { mutateAsync, isPending } = useCreatePost();

const handleCreatePost = (data: CreatePostFormOutput) =>
  mutateAsync({
    title: data.title,
    type: data.type,
    contents: data.contents,
    is_open: data.isOpen === '1',
  });

return <CreatePostForm handleCreatePost={handleCreatePost} />;
```

form → API 형식 변환(위의 `is_open` 변환, 가입 요청에서 비밀번호 확인 제외)은 이 `handle*` 함수에서 수행한다.

---

## 6. 참고 자료

- React Hook Form 공식: https://react-hook-form.com
- Zod 공식: https://zod.dev
- 현존 폼 예시: `src/features/auth-signup/`, `src/features/auth-signin/`, `src/features/post-create/`, `src/entities/post/model/form.ts`
