import NendoroidGridSkeleton from "@/components/loading/NendoroidGridSkeleton";

type ListingPageSkeletonProps = {
  showFilter?: boolean;
};

export default function ListingPageSkeleton({
  showFilter = false,
}: ListingPageSkeletonProps) {
  return (
    <section className="animate-pulse">
      <div className="h-8 w-36 rounded-lg bg-zinc-800" />
      <div className="mt-2 h-4 w-48 rounded bg-zinc-900" />

      <div className="mt-6 h-[62px] rounded-2xl border border-zinc-800 bg-zinc-900" />

      <div
        className={`mt-4 grid gap-3 ${
          showFilter ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        <div className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900" />

        {showFilter && (
          <div className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900" />
        )}
      </div>

      <div className="mt-6">
        <NendoroidGridSkeleton count={8} />
      </div>
    </section>
  );
}