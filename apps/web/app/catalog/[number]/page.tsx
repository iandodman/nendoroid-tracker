import Image from "next/image";
import Link from "next/link";

import {
  addToCollection,
  decreaseCollectionQuantity,
  increaseCollectionQuantity,
} from "@/app/actions/collection";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/actions/wishlist";
import { getUserCollectionItem } from "@/lib/collection";
import { prisma } from "@/lib/prisma";

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

type Props = {
  params: Promise<{
    number: string;
  }>;
};

export default async function NendoroidDetailPage({ params }: Props) {
  const { number } = await params;

  const nendoroid = await prisma.nendoroid.findUnique({
    where: {
      number,
    },
  });

  if (!nendoroid) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
        <Link
          href="/catalog"
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Back to catalog
        </Link>

        <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h1 className="text-xl font-bold">Nendoroid not found</h1>

          <p className="mt-2 text-sm text-zinc-400">
            The requested Nendoroid does not exist in the catalog.
          </p>
        </section>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
  });

  const collectionItem = user
    ? await getUserCollectionItem(user.id, nendoroid.id)
    : null;

  const addCurrentNendoroid = addToCollection.bind(
    null,
    nendoroid.number,
  );
  const wishlistItem = user
  ? await prisma.wishlistItem.findUnique({
      where: {
        userId_nendoroidId: {
          userId: user.id,
          nendoroidId: nendoroid.id,
        },
      },
    })
  : null;
  const addCurrentNendoroidToWishlist = addToWishlist.bind(
  null,
  nendoroid.number,
);

const removeCurrentNendoroidFromWishlist =
  removeFromWishlist.bind(null, nendoroid.number);

  const increaseCurrentNendoroid =
    increaseCollectionQuantity.bind(
      null,
      nendoroid.number,
    );
  const decreaseCurrentNendoroid =
    decreaseCollectionQuantity.bind(
      null,
      nendoroid.number,
    );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <Link
        href="/catalog"
        className="text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← Back to catalog
      </Link>

      {nendoroid.imageUrl ? (
        <Image
          src={nendoroid.imageUrl}
          alt={nendoroid.name}
          width={500}
          height={500}
          className="mt-6 aspect-square w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="mt-6 flex aspect-square w-full items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500">
          No image
        </div>
      )}

      <h1 className="mt-6 text-3xl font-bold">
        {nendoroid.name}
      </h1>

      <p className="mt-2 text-zinc-400">
        #{nendoroid.number}
      </p>

      <p className="mt-1 text-zinc-500">
        {nendoroid.series}
      </p>

      {collectionItem ? (
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="font-semibold text-zinc-50">
            ✓ In your collection
          </p>

          <p className="mt-4 text-sm text-zinc-400">
            Quantity
          </p>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <form action={decreaseCurrentNendoroid}>
              <button
                type="submit"
                aria-label="Decrease quantity"
                className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-xl font-semibold text-zinc-50 transition hover:bg-zinc-800"
              >
                −
              </button>
            </form>

            <span className="min-w-10 text-center text-xl font-bold text-zinc-50">
              {collectionItem.quantity}
            </span>

            <form action={increaseCurrentNendoroid}>
              <button
                type="submit"
                aria-label="Increase quantity"
                className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-xl font-semibold text-zinc-50 transition hover:bg-zinc-800"
              >
                +
              </button>
            </form>
          </div>
        </section>
      ) : (
        <form action={addCurrentNendoroid} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-50 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Add to collection
          </button>
        </form>
      )}
      {wishlistItem ? (
        <form
          action={removeCurrentNendoroidFromWishlist}
          className="mt-4"
        >
          <button
            type="submit"
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-50 transition hover:bg-zinc-800"
          >
            Remove from wishlist
          </button>
        </form>
      ) : (
        <form
          action={addCurrentNendoroidToWishlist}
          className="mt-4"
        >
          <button
            type="submit"
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-50 transition hover:bg-zinc-800"
          >
            Add to wishlist
          </button>
        </form>
      )}
    </main>
  );
}