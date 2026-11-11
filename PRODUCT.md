# Next.js 스타터 킷

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

로그인과 게시판 예제를 확인하고 자신의 프로젝트로 확장하는 개발자.

## Product Purpose

기존 인증·게시글 흐름을 실제 화면에서 확인할 수 있는 Next.js 스타터.

## Capabilities and Constraints

- `/`는 `/post`로 이동한다. 게시판은 검색, 분류, 페이지 이동, 상세 링크를 제공한다.
- 로그인한 사용자에게만 `/post/create` 글쓰기 링크를 표시한다.
- 검색 조건은 기존 `type`, `q`, `page` 쿼리 매개변수를 사용한다.
- 게시글과 페이지 정보는 API 응답으로 제공한다.

## Brand Commitments

의미별 색상과 라이트·다크 테마는 `.agents/rules/code-style/styling.md`를 따른다. 공통 헤더·푸터와 앱 컨테이너는 공유 레이아웃이 관리한다.

## Evidence on Hand

기능과 기술의 정본은 `README.md`, `package.json`, `.agents/rules/`, `src/features/post-list/`다. 수치·성능·이용자에 대한 별도 주장은 제공되지 않았다.
