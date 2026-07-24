import Link from "next/link";
import WishlistClient from "@/components/wishlist/WishlistClient";
import type { CatalogNendoroid } from "@/components/catalog/NendoroidCard";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <>
        <PageHeader
          title="Wishlist"
          description="Your saved Nendoroids."
        />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="font-semibold">
            Development user not found
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Run the development seed before using the wishlist.
          </p>
        </section>
      </>
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

  const wishlistDescription =
    wishlistNendoroids.length === 1
      ? "1 saved Nendoroid"
      : `${wishlistNendoroids.length} saved Nendoroids`;

  return (
    <>
      <PageHeader
        title="Wishlist"
        description={wishlistDescription}
      />

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
        <WishlistClient nendoroids={wishlistNendoroids} />
      )}
    </>
  );
}