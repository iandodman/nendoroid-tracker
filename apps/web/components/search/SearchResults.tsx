import NendoroidImage from "@/components/images/NendoroidImage";import Link from "next/link";

import type { QuickSearchResult } from "@/app/actions/search";

type SearchResultsProps = {
  nendoroids: QuickSearchResult[];
};

export default function SearchResults({
  nendoroids,
}: SearchResultsProps) {
  if (nendoroids.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 space-y-2">
      {nendoroids.map((nendoroid) => (
        <Link
          key={nendoroid.id}
          href={`/catalog/${nendoroid.number}`}
          className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-3 py-3 transition hover:bg-zinc-800"
        >
          <NendoroidImage
            src={nendoroid.imageUrl}
            alt={nendoroid.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl object-cover"
          />

          <div className="min-w-0">
            <p className="text-sm text-zinc-400">
              #{nendoroid.number}
            </p>

            <p className="truncate font-medium">
              {nendoroid.name}
            </p>

            {nendoroid.series && (
              <p className="truncate text-sm text-zinc-500">
                {nendoroid.series}
              </p>
            )}
          </div>
        </Link>
      ))}
    </section>
  );
}