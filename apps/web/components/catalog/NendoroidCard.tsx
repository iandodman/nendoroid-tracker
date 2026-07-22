import Image from "next/image";
import Link from "next/link";

import type { Nendoroid } from "@/app/generated/prisma/client";

export type CatalogNendoroid = Nendoroid & {
  collectionQuantity: number;
  isWishlisted: boolean;
};

type NendoroidCardProps = {
  nendoroid: CatalogNendoroid;
  footer?: React.ReactNode;
};

export default function NendoroidCard({
  nendoroid,
  footer,
}: NendoroidCardProps) {
  const isOwned = nendoroid.collectionQuantity > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <Link
        href={`/catalog/${nendoroid.number}`}
        className="block"
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

          <div className="absolute right-2 top-2 flex flex-col items-end gap-2">
            {isOwned && (
              <span className="rounded-full bg-zinc-950/90 px-2 py-1 text-xs font-semibold text-zinc-50">
                {nendoroid.collectionQuantity > 1
                  ? `Owned ×${nendoroid.collectionQuantity}`
                  : "Owned"}
              </span>
            )}

            {nendoroid.isWishlisted && (
              <span className="rounded-full bg-rose-500/90 px-2 py-1 text-xs font-semibold text-white">
                Wishlist
              </span>
            )}
          </div>
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

      {footer && (
        <div className="mt-auto border-t border-zinc-800 p-2">
          {footer}
        </div>
      )}
    </article>
  );
}