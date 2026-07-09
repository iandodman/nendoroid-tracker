import Link from "next/link";

import CatalogClient from "@/components/catalog/CatalogClient";
import { prisma } from "@/lib/prisma";

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function CatalogPage({
  searchParams,
}: CatalogPageProps) {
  const { search } = await searchParams;

  const nendoroids = await prisma.nendoroid.findMany({
    orderBy: {
      number: "asc",
    },
  });

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

      <CatalogClient nendoroids={nendoroids} initialSearch={search ?? ""} />
    </main>
  );
}