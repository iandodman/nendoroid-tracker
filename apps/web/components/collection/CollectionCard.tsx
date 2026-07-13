import Image from "next/image";
import Link from "next/link";

import { getUserCollection } from "@/lib/collection";

type CollectionItem = Awaited<ReturnType<typeof getUserCollection>>[number];

type CollectionCardProps = {
  item: CollectionItem;
};

export default function CollectionCard({ item }: CollectionCardProps) {
  const { nendoroid, quantity } = item;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <Link href={`/catalog/${nendoroid.number}`} className="block">
        <div className="relative aspect-square bg-zinc-800">
          {nendoroid.imageUrl ? (
            <Image
              src={nendoroid.imageUrl}
              alt={nendoroid.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No image
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs font-medium text-zinc-400">
            #{nendoroid.number}
          </p>

          <h2 className="mt-1 line-clamp-1 font-semibold">
            {nendoroid.name}
          </h2>

          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
            {nendoroid.series}
          </p>

          <p className="mt-3 text-xs font-medium text-zinc-300">
            Quantity: {quantity}
          </p>
        </div>
      </Link>
    </article>
  );
}