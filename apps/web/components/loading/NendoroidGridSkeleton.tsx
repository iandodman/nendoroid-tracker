import NendoroidCardSkeleton from "@/components/loading/NendoroidCardSkeleton";

type NendoroidGridSkeletonProps = {
  count?: number;
};

export default function NendoroidGridSkeleton({
  count = 8,
}: NendoroidGridSkeletonProps) {
  return (
    <section
      aria-label="Loading Nendoroids"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <NendoroidCardSkeleton key={index} />
      ))}
    </section>
  );
}