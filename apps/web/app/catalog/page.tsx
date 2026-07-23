import CatalogClient from "@/components/catalog/CatalogClient";
import { PageHeader } from "@/components/layout/PageHeader";
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

  const [collectionItems, wishlistItems] = user
    ? await Promise.all([
        prisma.collectionItem.findMany({
          where: {
            userId: user.id,
          },
          select: {
            nendoroidId: true,
            quantity: true,
          },
        }),
        prisma.wishlistItem.findMany({
          where: {
            userId: user.id,
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