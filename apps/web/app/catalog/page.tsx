import { auth } from "@/auth";
import CatalogClient, {
  type CatalogSort,
} from "@/components/catalog/CatalogClient";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const CATALOG_PAGE_SIZE = 24;

type CatalogPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
  }>;
};

function parsePage(value: string | undefined): number {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function parseSort(value: string | undefined): CatalogSort {
  switch (value) {
    case "number-asc":
    case "number-desc":
    case "name-asc":
    case "name-desc":
      return value;

    default:
      return "number-desc";
  }
}

function getCatalogOrderBy(
  sort: CatalogSort,
): Prisma.NendoroidOrderByWithRelationInput[] {
  switch (sort) {
    case "number-asc":
      return [
        {
          numberBase: "asc",
        },
        {
          numberSuffix: {
            sort: "asc",
            nulls: "first",
          },
        },
        {
          id: "asc",
        },
      ];

    case "number-desc":
      return [
        {
          numberBase: "desc",
        },
        {
          numberSuffix: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          id: "asc",
        },
      ];

    case "name-asc":
      return [
        {
          name: "asc",
        },
        {
          numberBase: "asc",
        },
        {
          id: "asc",
        },
      ];

    case "name-desc":
      return [
        {
          name: "desc",
        },
        {
          numberBase: "desc",
        },
        {
          id: "asc",
        },
      ];
  }
}

export default async function CatalogPage({
  searchParams,
}: CatalogPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const requestedPage = parsePage(params.page);
  const sort = parseSort(params.sort);

  const session = await auth();
  const userId = session?.user?.id;

  const where: Prisma.NendoroidWhereInput = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            series: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            number: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const totalResults = await prisma.nendoroid.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / CATALOG_PAGE_SIZE),
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const nendoroids = await prisma.nendoroid.findMany({
    where,
    orderBy: getCatalogOrderBy(sort),
    skip: (currentPage - 1) * CATALOG_PAGE_SIZE,
    take: CATALOG_PAGE_SIZE,
  });

  const currentNendoroidIds = nendoroids.map(
    (nendoroid) => nendoroid.id,
  );

  const [collectionItems, wishlistItems] =
    userId && currentNendoroidIds.length > 0
      ? await Promise.all([
          prisma.collectionItem.findMany({
            where: {
              userId,
              nendoroidId: {
                in: currentNendoroidIds,
              },
            },
            select: {
              nendoroidId: true,
              quantity: true,
            },
          }),
          prisma.wishlistItem.findMany({
            where: {
              userId,
              nendoroidId: {
                in: currentNendoroidIds,
              },
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

  const catalogNendoroids = nendoroids.map(
    (nendoroid) => ({
      ...nendoroid,
      collectionQuantity:
        collectionQuantityByNendoroidId.get(
          nendoroid.id,
        ) ?? 0,
      isWishlisted: wishlistNendoroidIds.has(
        nendoroid.id,
      ),
    }),
  );

  return (
    <>
      <PageHeader
        title="Catalog"
        description="Explore Nendoroids"
      />

      <CatalogClient
        nendoroids={catalogNendoroids}
        initialSearch={search}
        initialSort={sort}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
      />
    </>
  );
}