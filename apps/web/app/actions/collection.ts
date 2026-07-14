"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

export async function addToCollection(
  nendoroidNumber: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
  });

  if (!user) {
    throw new Error("Development user not found.");
  }

  const nendoroid = await prisma.nendoroid.findUnique({
    where: {
      number: nendoroidNumber,
    },
  });

  if (!nendoroid) {
    throw new Error(`Nendoroid #${nendoroidNumber} not found.`);
  }

  await prisma.collectionItem.upsert({
    where: {
      userId_nendoroidId: {
        userId: user.id,
        nendoroidId: nendoroid.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      nendoroidId: nendoroid.id,
      quantity: 1,
    },
  });

  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath(`/catalog/${nendoroid.number}`);
}