# Forms Guide

> 대상: **React Hook Form v7**
> 상위 문서: [`docs/CONVENTIONS.md`](./CONVENTIONS.md)

## 1. 파일 3분할 규약

하나의 폼은 아래 3파일로 나눈다 (전부 슬라이스 내부).

| 파일 | 내용 | 예시 |
|---|---|---|
| `model/form.ts` | 폼 입력 타입, 기본값 상수 | `CreatePostFormInput`, `defaultValues` |
| `model/use<Slice>Form.ts` | `useForm<...>()` 래퍼 훅 | `useCreatePostForm` |
| `ui/<Slice>Form.tsx` | `FormProvider` 소비 컴포넌트 | `CreatePostForm` |

근거: `src/features/post-create/`, `src/features/auth-signup/` 구조.

---

## 2. `defaultValues` 필수

모든 `useForm` 호출은 `defaultValues`를 **반드시** 명시한다.

```ts
export const useSignupForm = () =>
  useForm<SignUpReq>({
    defaultValues: { email: '', name: '', nickname: '', password: '' },
  });
```

이유:

- uncontrolled → controlled 전환 경고 방지
- 초기값이 `undefined`일 때 RHF 내부 state 불일치 차단
- 리셋 동작(`reset()`) 예측 가능

현행에서 `useSignInForm`이 이 규칙을 누락 — 별도 리팩터 PR에서 교정 예정.

---

## 3. FormProvider + `useFormContext` 패턴

view 또는 상위 컴포넌트가 `methods`를 만들어 `<FormProvider {...methods}>`로 감싸고, 내부 컴포넌트는 `useFormContext<ReqType>()`로 소비한다. **prop drilling 금지**.

```tsx
// views/post-create/PostCreateView.tsx
const methods = useCreatePostForm();
return (
  <FormProvider {...methods}>
    <CreatePostForm handleCreatePost={handleCreatePost} />
  </FormProvider>
);
```

```tsx
// features/post-create/ui/CreatePostForm.tsx
const { register, handleSubmit, formState: { errors } } = useFormContext<CreatePostFormInput>();
```

---

## 4. 검증 (현행 + 목표)

### 4.1 현행

`register()`의 인라인 룰 사용 (regex, required, minLength 등):

```tsx
<input
  {...register('email', {
    required: '이메일을 입력하세요',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '이메일 형식 오류' },
  })}
/>
```

### 4.2 목표

**Zod 도입** 후 `zodResolver(schema)`로 검증 로직을 스키마 한 곳으로 단일화. API 응답 검증도 동일 스키마 재사용. 상세는 `docs/LIBRARY_DECISIONS.md` §Zod 도입 — 4단계 체크리스트.

### 4.3 지금의 규칙

신규 폼은 Zod 도입 전까지 **인라인 룰 유지** (검증 방식 혼재 방지).

---

## 5. view 레이어의 `handle*` 네이밍

view에서 mutation 호출을 래핑할 때만 `handle<Action>` 이름 사용. 내부 컴포넌트에 콜백을 prop으로 내릴 때 구분 용도.

```tsx
const { mutate } = useCreatePost();

const handleCreatePost = (data: CreatePostFormInput) => {
  mutate({ title: data.title, type: data.type, is_open: data.isOpen === '1', contents: data.contents });
};

return <CreatePostForm handleCreatePost={handleCreatePost} />;
```

form → API 형식 변환(위의 `is_open` 변환 등)은 view의 이 `handle*` 함수에서 수행. form 타입과 API 타입은 분리돼 있어야 폼 UI 제약이 API 스펙을 오염시키지 않는다.

---

## 6. 참고 자료

- React Hook Form 공식: https://react-hook-form.com
- 현존 폼 예시: `src/features/post-create/`, `src/features/auth-signup/`, `src/features/auth-signin/`
