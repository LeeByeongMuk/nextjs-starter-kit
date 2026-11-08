import Spinner from './index';

/** 진행 중인 저장 작업의 상태를 표시한다. */
export default function LayerSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper/85 p-5">
      <div className="rounded border border-line bg-surface px-8">
        <Spinner />
      </div>
    </div>
  );
}
