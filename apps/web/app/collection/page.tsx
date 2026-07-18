import Link from "next/link";

import CollectionClient from "@/components/collection/CollectionClient";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { getUserCollection } from "@/lib/collection";
import { prisma } from "@/lib/prisma";

export default async function CollectionPage() {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@nendodex.local",
    },
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
        <Header />

        <section className="mt-8">
          <h1 className="text-2xl font-bold">My collection</h1>

          <p className="mt-3 text-zinc-400">
            Development user not found.
          </p>
        </section>

        <BottomNavigation />
      </main>
    );
  }

  const collection = await getUserCollection(user.id);

  const uniqueNendoroids = collection.length;

  const totalFigures = collection.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <Header />

      <section className="mt-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">My collection</h1>

          <p className="mt-1 text-sm text-zinc-400">
            An overview of your Nendoroid collection.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5">
            <p className="text-xs text-zinc-500">
              Unique Nendoroids
            </p>

            <p className="mt-0.5 text-lg font-semibold">
              {uniqueNendoroids}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5">
            <p className="text-xs text-zinc-500">
              Total figures
            </p>

            <p className="mt-0.5 text-lg font-semibold">
              {totalFigures}
            </p>
          </div>
        </div>

        {collection.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h2 className="font-semibold">Your collection is empty</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Explore the catalog to find Nendoroids.
            </p>

            <Link
              href="/catalog"
              className="mt-4 inline-flex rounded-xl bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950"
            >
              Explore catalog
            </Link>
          </div>
        ) : (
          <CollectionClient collection={collection} />
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}