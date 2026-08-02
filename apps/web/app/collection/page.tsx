import Link from "next/link";

import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/auth";
import SignInRequired from "@/components/auth/SignInRequired";
import type { CatalogNendoroid } from "@/components/catalog/NendoroidCard";
import CollectionClient, {
  type CollectionSort,
} from "@/components/collection/CollectionClient";
import type { CollectionFilter } from "@/components/collection/CollectionToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

const COLLECTION_PAGE_SIZE = 24;

type CollectionPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    filter?: string;
  }>;
};

function parsePage(
  value: string | undefined,
): number {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function parseSort(
  value: string | undefined,
): CollectionSort {
  switch (value) {
    case "recently-added":
    case "number-asc":
    case "number-desc":
    case "name-asc":
    case "name-desc":
    case "quantity-desc":
      return value;

    default:
      return "recently-added";
  }
}

function parseFilter(
  value: string | undefined,
): CollectionFilter {
  switch (value) {
    case "all":
    case "single-copy":
    case "duplicates":
      return value;

    default:
      return "all";
  }
}

function getCollectionOrderBy(
  sort: CollectionSort,
): Prisma.CollectionItemOrderByWithRelationInput[] {
  switch (sort) {
    case "number-asc":
      return [
        {
          nendoroid: {
            numberBase: "asc",
          },
        },
        {
          nendoroid: {
            numberSuffix: {
              sort: "asc",
              nulls: "first",
            },
          },
        },
        {
          id: "asc",
        },
      ];

    case "number-desc":
      return [
        {
          nendoroid: {
            numberBase: "desc",
          },
        },
        {
          nendoroid: {
            numberSuffix: {
              sort: "desc",
              nulls: "last",
            },
          },
        },
        {
          id: "asc",
        },
      ];

    case "name-asc":
      return [
        {
          nendoroid: {
            name: "asc",
          },
        },
        {
          id: "asc",
        },
      ];

    case "name-desc":
      return [
        {
          nendoroid: {
            name: "desc",
          },
        },
        {
          id: "asc",
        },
      ];

    case "quantity-desc":
      return [
        {
          quantity: "desc",
        },
        {
          addedAt: "desc",
        },
        {
          id: "desc",
        },
      ];

    case "recently-added":
    default:
      return [
        {
          addedAt: "desc",
        },
        {
          id: "desc",
        },
      ];
  }
}

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <>
        <PageHeader
          title="Collection"
          description="Your saved Nendoroids."
        />

        <SignInRequired
          title="Sign in to view your collection"
          description="Your collection is linked to your account so it stays available across devices."
          redirectTo="/collection"
        />
      </>
    );
  }

  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const requestedPage = parsePage(params.page);
  const sort = parseSort(params.sort);
  const filter = parseFilter(params.filter);

  const where: Prisma.CollectionItemWhereInput = {
    userId,

    ...(filter === "single-copy"
      ? {
          quantity: 1,
        }
      : filter === "duplicates"
        ? {
            quantity: {
              gt: 1,
            },
          }
        : {}),

    ...(search
      ? {
          nendoroid: {
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
          },
        }
      : {}),
  };

  const [
    uniqueNendoroids,
    quantityAggregate,
    totalResults,
  ] = await Promise.all([
    prisma.collectionItem.count({
      where: {
        userId,
      },
    }),

    prisma.collectionItem.aggregate({
      where: {
        userId,
      },
      _sum: {
        quantity: true,
      },
    }),

    prisma.collectionItem.count({
      where,
    }),
  ]);

  const totalFigures =
    quantityAggregate._sum.quantity ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalResults / COLLECTION_PAGE_SIZE,
    ),
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const collectionItems =
    await prisma.collectionItem.findMany({
      where,
      orderBy: getCollectionOrderBy(sort),
      skip:
        (currentPage - 1) *
        COLLECTION_PAGE_SIZE,
      take: COLLECTION_PAGE_SIZE,
      include: {
        nendoroid: {
          include: {
            wishlistItems: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

  const nendoroids: CatalogNendoroid[] =
    collectionItems.map(
      ({ nendoroid, quantity }) => ({
        id: nendoroid.id,
        number: nendoroid.number,
        numberBase: nendoroid.numberBase,
        numberSuffix: nendoroid.numberSuffix,
        name: nendoroid.name,
        series: nendoroid.series,
        manufacturer: nendoroid.manufacturer,
        imageUrl: nendoroid.imageUrl,
        releaseYear: nendoroid.releaseYear,
        releaseMonth: nendoroid.releaseMonth,
        createdAt: nendoroid.createdAt,
        updatedAt: nendoroid.updatedAt,
        collectionQuantity: quantity,
        isWishlisted:
          nendoroid.wishlistItems.length > 0,
      }),
    );

  return (
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

      {uniqueNendoroids === 0 ? (
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
        <CollectionClient
          nendoroids={nendoroids}
          initialSearch={search}
          initialSort={sort}
          initialFilter={filter}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
        />
      )}
    </section>
  );
}