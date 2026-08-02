export default function GlobalLoading() {
  return (
    <section
      aria-label="Loading page"
      className="animate-pulse"
    >
      <div className="h-8 w-32 rounded-lg bg-zinc-800" />

      <div className="mt-3 h-4 w-64 max-w-full rounded bg-zinc-900" />

      <div className="mt-8 space-y-4">
        <div className="h-14 rounded-2xl bg-zinc-900" />
        <div className="h-14 rounded-2xl bg-zinc-900" />
        <div className="h-14 rounded-2xl bg-zinc-900" />
      </div>
    </section>
  );
}