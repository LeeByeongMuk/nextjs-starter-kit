import { type PostFormInput, type PostFormOutput } from '@entities/post';

/** 글쓰기 폼에 입력하는 값이다. */
export type CreatePostFormInput = PostFormInput;

/** 검증을 통과한 글쓰기 폼의 값이다. */
export type CreatePostFormOutput = PostFormOutput;
