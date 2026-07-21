import Image from "next/image";
import Link from "next/link";

import { getUserCollection } from "@/lib/collection";

type CollectionItem =
  Awaited<ReturnType<typeof getUserCollection>>[number];

type CollectionCardProps = {
  item: CollectionItem;
};

export default function CollectionCard({
  item,
}: CollectionCardProps) {
  const { nendoroid, quantity } = item;

  const ownedLabel =
    quantity === 1 ? "Owned" : `Owned ×${quantity}`;

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <Link
        href={`/catalog/${nendoroid.number}`}
        className="block h-full"
      >
        <div className="relative aspect-square bg-zinc-800">
          <Image
            src={
              nendoroid.imageUrl ??
              "/images/nendoroids/placeholder.png"
            }
            alt={nendoroid.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
          />

          <span className="absolute right-2 top-2 rounded-full bg-zinc-950/90 px-2 py-1 text-xs font-semibold text-zinc-50">
            {ownedLabel}
          </span>
        </div>

        <div className="p-3">
          <p className="text-xs text-zinc-400">
            #{nendoroid.number}
          </p>

          <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">
            {nendoroid.name}
          </h2>

          {nendoroid.series && (
            <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
              {nendoroid.series}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}