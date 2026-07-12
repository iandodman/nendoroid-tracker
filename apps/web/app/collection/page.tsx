import Image from "next/image";
import Link from "next/link";

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
          <p className="mt-3 text-zinc-400">Development user not found.</p>
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
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <Link
                  href={`/catalog/${item.nendoroid.number}`}
                  className="block"
                >
                  <div className="relative aspect-square bg-zinc-800">
                    {item.nendoroid.imageUrl ? (
                      <Image
                        src={item.nendoroid.imageUrl}
                        alt={item.nendoroid.name}
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
                      #{item.nendoroid.number}
                    </p>

                    <h2 className="mt-1 line-clamp-1 font-semibold">
                      {item.nendoroid.name}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {item.nendoroid.series}
                    </p>

                    <p className="mt-3 text-xs font-medium text-zinc-300">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}