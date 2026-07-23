import Link from "next/link";

import CollectionClient from "@/components/collection/CollectionClient";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <>
        <PageHeader title="Collection" />

        <section>
          <p className="text-zinc-400">
            Development user not found.
          </p>
        </section>
      </>
    );
  }

  const collection = await getUserCollection(user.id);

  const uniqueNendoroids = collection.length;

  const totalFigures = collection.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <>
      <section>
        <div className="mb-5 flex items-start justify-between gap-4">
          <PageHeader title="Collection" />

          <div className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2">
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-base font-semibold">
                  {uniqueNendoroids}
                </p>

                <p className="text-xs text-zinc-500">
                  Unique
                </p>
              </div>

              <div>
                <p className="text-base font-semibold">
                  {totalFigures}
                </p>

                <p className="text-xs text-zinc-500">
                  Figures
                </p>
              </div>
            </div>
          </div>
        </div>

        {collection.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h2 className="font-semibold">
              Your collection is empty
            </h2>

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
    </>
  );
}