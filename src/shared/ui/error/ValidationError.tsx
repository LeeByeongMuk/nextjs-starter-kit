interface Props {
  id: string;
  isError: boolean;
  message?: string;
}

/** 해당 입력과 연결된 검증 오류를 알린다. */
export default function ValidationError({ id, isError, message }: Props) {
  if (!isError) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-danger">
      {message || '입력 내용을 확인해 주세요.'}
    </p>
  );
}
