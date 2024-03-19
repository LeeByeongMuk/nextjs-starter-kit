import { useRouter } from 'next/navigation';
import React from 'react';

export default function ButtonBox() {
  const router = useRouter();

  const redirectBack = () => {
    router.back();
  };

  return (
    <div className="mt-5 flex justify-center gap-2.5">
      <button
        type="button"
        className="inline-block rounded border border-teal-600 bg-teal-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
        onClick={redirectBack}
      >
        back
      </button>

      <button
        type="submit"
        className="inline-block rounded border border-teal-600 px-12 py-3 text-sm font-medium text-teal-600 hover:bg-teal-600 hover:text-white focus:outline-none focus:ring active:bg-teal-500"
      >
        submit
      </button>
    </div>
  );
}
