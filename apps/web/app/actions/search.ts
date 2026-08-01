"use server";

import { prisma } from "@/lib/prisma";

const HOME_SEARCH_RESULT_LIMIT = 5;

export type QuickSearchResult = {
  id: number;
  number: string;
  name: string;
  series: string | null;
  imageUrl: string | null;
};

export async function searchNendoroids(
  rawQuery: string,
): Promise<QuickSearchResult[]> {
  const query = rawQuery.trim();

  if (query.length < 2) {
    return [];
  }

  return prisma.nendoroid.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          series: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          number: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: [
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
    ],
    take: HOME_SEARCH_RESULT_LIMIT,
    select: {
      id: true,
      number: true,
      name: true,
      series: true,
      imageUrl: true,
    },
  });
}