import Link from "next/link";

import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/auth";
import SignInRequired from "@/components/auth/SignInRequired";
import type { CatalogNendoroid } from "@/components/catalog/NendoroidCard";
import { PageHeader } from "@/components/layout/PageHeader";
import WishlistClient, {
  type WishlistSort,
} from "@/components/wishlist/WishlistClient";
import type { WishlistFilter } from "@/components/wishlist/WishlistToolbar";
import { prisma } from "@/lib/prisma";

const WISHLIST_PAGE_SIZE = 24;

type WishlistPageProps = {
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
): WishlistSort {
  switch (value) {
    case "recently-added":
    case "number-asc":
    case "number-desc":
    case "name-asc":
    case "name-desc":
      return value;

    default:
      return "recently-added";
  }
}

function parseFilter(
  value: string | undefined,
): WishlistFilter {
  switch (value) {
    case "all":
    case "not-owned":
    case "owned":
      return value;

    default:
      return "all";
  }
}

function getWishlistOrderBy(
  sort: WishlistSort,
): Prisma.WishlistItemOrderByWithRelationInput[] {
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

    case "recently-added":
    default:
      return [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ];
  }
}

export default async function WishlistPage({
  searchParams,
}: WishlistPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <>
        <PageHeader
          title="Wishlist"
          description="Your saved Nendoroids."
        />

        <SignInRequired
          title="Sign in to view your wishlist"
          description="Sign in to save the Nendoroids you want and access them from any device."
          redirectTo="/wishlist"
        />
      </>
    );
  }

  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const requestedPage = parsePage(params.page);
  const sort = parseSort(params.sort);
  const filter = parseFilter(params.filter);

  const where: Prisma.WishlistItemWhereInput = {
    userId,

    ...(filter === "owned"
      ? {
          nendoroid: {
            collectionItems: {
              some: {
                userId,
              },
            },
          },
        }
      : filter === "not-owned"
        ? {
            nendoroid: {
              collectionItems: {
                none: {
                  userId,
                },
              },
            },
          }
        : {}),

    ...(search
      ? {
          nendoroid: {
            ...(filter === "owned"
              ? {
                  collectionItems: {
                    some: {
                      userId,
                    },
                  },
                }
              : filter === "not-owned"
                ? {
                    collectionItems: {
                      none: {
                        userId,
                      },
                    },
                  }
                : {}),

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

  const [wishlistCount, totalResults] =
    await Promise.all([
      prisma.wishlistItem.count({
        where: {
          userId,
        },
      }),

      prisma.wishlistItem.count({
        where,
      }),
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalResults / WISHLIST_PAGE_SIZE,
    ),
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const wishlistItems =
    await prisma.wishlistItem.findMany({
      where,
      orderBy: getWishlistOrderBy(sort),
      skip:
        (currentPage - 1) *
        WISHLIST_PAGE_SIZE,
      take: WISHLIST_PAGE_SIZE,
      include: {
        nendoroid: {
          include: {
            collectionItems: {
              where: {
                userId,
              },
              select: {
                quantity: true,
              },
            },
          },
        },
      },
    });

  const wishlistNendoroids:
    CatalogNendoroid[] = wishlistItems.map(
    ({ nendoroid }) => ({
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
      collectionQuantity:
        nendoroid.collectionItems[0]?.quantity ??
        0,
      isWishlisted: true,
    }),
  );

  const wishlistDescription =
    wishlistCount === 1
      ? "1 saved Nendoroid"
      : `${wishlistCount} saved Nendoroids`;

  return (
    <>
      <PageHeader
        title="Wishlist"
        description={wishlistDescription}
      />

      {wishlistCount === 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="text-lg font-semibold">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Browse the catalog and save the Nendoroids
            you want.
          </p>

          <Link
            href="/catalog"
            className="mt-6 inline-block rounded-xl bg-zinc-50 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Browse catalog
          </Link>
        </section>
      ) : (
        <WishlistClient
          nendoroids={wishlistNendoroids}
          initialSearch={search}
          initialSort={sort}
          initialFilter={filter}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
        />
      )}
    </>
  );
}