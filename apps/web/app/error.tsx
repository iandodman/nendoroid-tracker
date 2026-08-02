"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
      <h1 className="text-xl font-semibold text-zinc-50">
        Something went wrong
      </h1>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        NendoDex could not load this page. Please try again.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-zinc-50 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
      >
        Try again
      </button>
    </section>
  );
}