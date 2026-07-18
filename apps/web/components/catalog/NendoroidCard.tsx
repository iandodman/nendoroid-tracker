import Image from "next/image";
import Link from "next/link";

import type { CatalogNendoroid } from "@/components/catalog/CatalogClient";

type NendoroidCardProps = {
  nendoroid: CatalogNendoroid;
};

export default function NendoroidCard({
  nendoroid,
}: NendoroidCardProps) {
  const isOwned = nendoroid.collectionQuantity > 0;

  return (
    <Link
      href={`/catalog/${nendoroid.number}`}
      className="block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="relative aspect-square bg-zinc-800">
          <Image
            src={nendoroid.imageUrl}
            alt={nendoroid.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
          />

          {isOwned && (
            <span className="absolute right-2 top-2 rounded-full bg-zinc-950/90 px-2 py-1 text-xs font-semibold text-zinc-50">
              {nendoroid.collectionQuantity > 1
                ? `Owned ×${nendoroid.collectionQuantity}`
                : "Owned"}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-sm text-zinc-400">
            #{nendoroid.number}
          </p>

          <h2 className="mt-1 line-clamp-2 min-h-12 font-semibold">
            {nendoroid.name}
          </h2>

          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-zinc-500">
            {nendoroid.series}
          </p>
        </div>
      </article>
    </Link>
  );
}