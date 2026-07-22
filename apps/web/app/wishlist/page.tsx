import Link from "next/link";

import { removeFromWishlist } from "@/app/actions/wishlist";
import NendoroidCard, {
  type CatalogNendoroid,
} from "@/components/catalog/NendoroidCard";
import { prisma } from "@/lib/prisma";

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

export default async function WishlistPage() {
  const user = await prisma.user.findUnique({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Wishlist</h1>

          <p className="mt-2 text-zinc-400">
            Your saved Nendoroids.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="font-semibold">
            Development user not found
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Run the development seed before using the wishlist.
          </p>
        </section>
      </main>
    );
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId: user.id,
    },
    include: {
      nendoroid: {
        include: {
          collectionItems: {
            where: {
              userId: user.id,
            },
            select: {
              quantity: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const wishlistNendoroids: CatalogNendoroid[] =
    wishlistItems.map(({ nendoroid }) => ({
        id: nendoroid.id,
        number: nendoroid.number,
        name: nendoroid.name,
        series: nendoroid.series,
        manufacturer: nendoroid.manufacturer,
        imageUrl: nendoroid.imageUrl,
        releaseYear: nendoroid.releaseYear,
        releaseMonth: nendoroid.releaseMonth,
        source: nendoroid.source,
        sourceId: nendoroid.sourceId,
        officialUrl: nendoroid.officialUrl,
        createdAt: nendoroid.createdAt,
        updatedAt: nendoroid.updatedAt,
        collectionQuantity:
        nendoroid.collectionItems[0]?.quantity ?? 0,
        isWishlisted: true,
  }));

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Wishlist</h1>

        <p className="mt-2 text-zinc-400">
          {wishlistNendoroids.length === 1
            ? "1 saved Nendoroid"
            : `${wishlistNendoroids.length} saved Nendoroids`}
        </p>
      </header>

      {wishlistNendoroids.length === 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="text-lg font-semibold">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Browse the catalog and save the Nendoroids you want.
          </p>

          <Link
            href="/catalog"
            className="mt-6 inline-block rounded-xl bg-zinc-50 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Browse catalog
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-2 items-stretch gap-3">
          {wishlistNendoroids.map((nendoroid) => {
            const removeCurrentNendoroid =
              removeFromWishlist.bind(
                null,
                nendoroid.number,
              );

            return (
              <NendoroidCard
                key={nendoroid.id}
                nendoroid={nendoroid}
                footer={
                    <form action={removeCurrentNendoroid}>
                        <button
                            type="submit"
                            className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-red-500 hover:bg-red-500/15 hover:text-red-400 active:border-red-500 active:bg-red-500/25 active:text-red-300"
                        >
                            Remove
                        </button>
                    </form>
                }
                />
            );
          })}
        </section>
      )}
    </main>
  );
}