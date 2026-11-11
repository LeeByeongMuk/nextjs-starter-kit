/** 보조 기술과 화면에 진행 상태를 함께 표시한다. */
export default function Spinner() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-16 text-sm text-muted"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-line border-t-accent"
      />
      불러오는 중입니다.
    </div>
  );
}
