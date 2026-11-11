interface Props {
  headText: string;
}

/** 인증 화면의 유일한 페이지 제목을 표시한다. */
export default function AuthHeader({ headText }: Props) {
  return (
    <h1 className="mb-8 border-b border-line pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
      {headText}
    </h1>
  );
}
