import Link from "next/link";

import CatalogClient from "@/components/catalog/CatalogClient";
import { prisma } from "@/lib/prisma";

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function CatalogPage({
  searchParams,
}: CatalogPageProps) {
  const { search } = await searchParams;

  const user = await prisma.user.findUnique({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
  });

  const nendoroids = await prisma.nendoroid.findMany({
    orderBy: {
      number: "asc",
    },
  });

  const collectionItems = user
    ? await prisma.collectionItem.findMany({
        where: {
          userId: user.id,
        },
        select: {
          nendoroidId: true,
          quantity: true,
        },
      })
    : [];

  const collectionQuantityByNendoroidId = new Map(
    collectionItems.map((item) => [
      item.nendoroidId,
      item.quantity,
    ]),
  );

  const catalogNendoroids = nendoroids.map((nendoroid) => ({
    ...nendoroid,
    collectionQuantity:
      collectionQuantityByNendoroidId.get(nendoroid.id) ?? 0,
  }));

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <header className="mb-6">
        <Link href="/" className="text-sm text-zinc-400">
          ← Home
        </Link>

        <p className="mt-4 text-sm text-zinc-400">Catalog</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Explore Nendoroids
        </h1>
      </header>

      <CatalogClient
        nendoroids={catalogNendoroids}
        initialSearch={search ?? ""}
      />

    </main>
  );
}