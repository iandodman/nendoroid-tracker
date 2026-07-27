import CatalogClient from "@/components/catalog/CatalogClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function CatalogPage({
  searchParams,
}: CatalogPageProps) {
  const { search } = await searchParams;

  const session = await auth();
  const userId = session?.user?.id;

  const nendoroids = await prisma.nendoroid.findMany({
    orderBy: {
      number: "asc",
    },
  });

  const [collectionItems, wishlistItems] = userId
    ? await Promise.all([
        prisma.collectionItem.findMany({
          where: {
            userId,
          },
          select: {
            nendoroidId: true,
            quantity: true,
          },
        }),
        prisma.wishlistItem.findMany({
          where: {
            userId,
          },
          select: {
            nendoroidId: true,
          },
        }),
      ])
    : [[], []];

  const collectionQuantityByNendoroidId = new Map(
    collectionItems.map((item) => [
      item.nendoroidId,
      item.quantity,
    ]),
  );

  const wishlistNendoroidIds = new Set(
    wishlistItems.map((item) => item.nendoroidId),
  );

  const catalogNendoroids = nendoroids.map((nendoroid) => ({
    ...nendoroid,
    collectionQuantity:
      collectionQuantityByNendoroidId.get(nendoroid.id) ?? 0,
    isWishlisted: wishlistNendoroidIds.has(nendoroid.id),
  }));

  return (
    <>
      <PageHeader
        title="Catalog"
        description="Explore Nendoroids"
      />

      <CatalogClient
        nendoroids={catalogNendoroids}
        initialSearch={search ?? ""}
      />
    </>
  );
}