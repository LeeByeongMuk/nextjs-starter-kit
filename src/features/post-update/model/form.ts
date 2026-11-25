import { type PostFormInput, type PostFormOutput } from '@entities/post';

/** 글 수정 폼에 입력하는 값이다. */
export type UpdatePostFormInput = PostFormInput;

/** 검증을 통과한 글 수정 폼의 값이다. */
export type UpdatePostFormOutput = PostFormOutput;
