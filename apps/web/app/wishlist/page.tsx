import Link from "next/link";

import SignInRequired from "@/components/auth/SignInRequired";
import { auth } from "@/auth";
import type { CatalogNendoroid } from "@/components/catalog/NendoroidCard";
import { PageHeader } from "@/components/layout/PageHeader";
import WishlistClient from "@/components/wishlist/WishlistClient";
import { prisma } from "@/lib/prisma";

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <>
        <PageHeader
          title="Wishlist"
          description="Your saved Nendoroids."
        />

        <SignInRequired
          title="Sign in to view your wishlist"
          description="Sign in to save the Nendoroids you want and access them from any device."
          redirectTo="/wishlist"
        />
      </>
    );
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    include: {
      nendoroid: {
        include: {
          collectionItems: {
            where: {
              userId,
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
      numberBase: nendoroid.numberBase,
      numberSuffix: nendoroid.numberSuffix,
      name: nendoroid.name,
      series: nendoroid.series,
      manufacturer: nendoroid.manufacturer,
      imageUrl: nendoroid.imageUrl,
      releaseYear: nendoroid.releaseYear,
      releaseMonth: nendoroid.releaseMonth,
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