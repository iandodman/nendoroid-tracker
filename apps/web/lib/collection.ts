import "server-only";

import { prisma } from "@/lib/prisma";

export async function getUserCollection(userId: string) {
  return prisma.collectionItem.findMany({
    where: {
      userId,
    },
    include: {
      nendoroid: true,
    },
    orderBy: {
      addedAt: "desc",
    },
  });
}

export async function getUserCollectionCount(userId: string) {
  return prisma.collectionItem.count({
    where: {
      userId,
    },
  });
}

export async function getUserCollectionItem(
  userId: string,
  nendoroidId: number,
) {
  return prisma.collectionItem.findUnique({
    where: {
      userId_nendoroidId: {
        userId,
        nendoroidId,
      },
    },
  });
}