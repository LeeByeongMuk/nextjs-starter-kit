/** 목록을 불러오는 동안 상태와 시각적 자리표시자를 표시한다. */
export default function PostListSkeletonUI() {
  return (
    <div role="status" className="border-t border-line">
      <span className="sr-only">게시글을 불러오는 중입니다.</span>
      <div aria-hidden="true">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-4 border-b border-line py-8">
            <div className="h-3 w-12 rounded bg-skeleton" />
            <div className="h-6 w-4/5 rounded bg-skeleton" />
            <div className="h-3 w-40 rounded bg-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
