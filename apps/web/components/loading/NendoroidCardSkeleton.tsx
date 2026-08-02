export default function NendoroidCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="h-full animate-pulse overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
    >
      <div className="aspect-square bg-zinc-800" />

      <div className="space-y-2 p-3">
        <div className="h-3 w-14 rounded bg-zinc-800" />
        <div className="h-4 w-4/5 rounded bg-zinc-800" />
        <div className="h-3 w-3/5 rounded bg-zinc-800" />
      </div>
    </article>
  );
}