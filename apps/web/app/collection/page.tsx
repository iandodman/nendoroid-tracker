import Link from "next/link";

import CollectionCard from "@/components/collection/CollectionCard";
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

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <Header />

      <section className="mt-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">My collection</h1>

          <p className="mt-1 text-sm text-zinc-400">
            {collection.length}{" "}
            {collection.length === 1 ? "Nendoroid" : "Nendoroids"}
          </p>
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {collection.map((item) => (
              <CollectionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}