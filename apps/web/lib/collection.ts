import "server-only";

import { prisma } from "@/lib/prisma";

export async function getUserCollection(userId: number) {
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

export async function getUserCollectionCount(userId: number) {
  return prisma.collectionItem.count({
    where: {
      userId,
    },
  });
}