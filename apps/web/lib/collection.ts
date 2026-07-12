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