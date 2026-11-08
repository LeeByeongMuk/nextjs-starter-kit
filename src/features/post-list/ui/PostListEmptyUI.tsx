/** 검색 결과가 없음을 로딩과 구별해 안내한다. */
export default function PostListEmptyUI() {
  return (
    <div role="status" className="border-y border-line py-20 text-center">
      <p className="text-xl font-semibold">게시글이 없습니다.</p>
      <p className="mt-3 text-sm text-muted">
        다른 검색어나 분류를 선택해 보세요.
      </p>
    </div>
  );
}
