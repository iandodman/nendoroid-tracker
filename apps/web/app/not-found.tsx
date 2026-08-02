import Link from "next/link";

export default function NotFound() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
      <p className="text-sm font-medium text-[#fb588c]">
        404
      </p>

      <h1 className="mt-2 text-xl font-semibold text-zinc-50">
        Page not found
      </h1>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        The page you requested does not exist or may have moved.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-zinc-50 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
      >
        Return home
      </Link>
    </section>
  );
}