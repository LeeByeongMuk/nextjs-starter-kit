import Spinner from '@/app/components/Spinner';

export default function LayerSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900 opacity-50" />
      <div className="relative flex h-16 w-16 items-center">
        <Spinner />
      </div>
    </div>
  );
}
