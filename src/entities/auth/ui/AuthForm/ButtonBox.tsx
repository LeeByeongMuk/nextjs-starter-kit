interface Props {
  buttonText: string;
}

/** 인증 폼의 제출 동작을 제공한다. */
export default function ButtonBox({ buttonText }: Props) {
  return (
    <button
      type="submit"
      className="flex min-h-12 w-full items-center justify-center rounded bg-accent px-5 py-3 font-semibold text-inverse hover:bg-accent-hover"
    >
      {buttonText}
    </button>
  );
}
