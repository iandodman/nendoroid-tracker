"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

async function getDevelopmentUserAndNendoroid(
  nendoroidNumber: string,
) {
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

  return {
    user,
    nendoroid,
  };
}

function revalidateCollectionPages(nendoroidNumber: string) {
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath(`/catalog/${nendoroidNumber}`);
}

export async function addToCollection(
  nendoroidNumber: string,
): Promise<void> {
  const { user, nendoroid } =
    await getDevelopmentUserAndNendoroid(nendoroidNumber);

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

  revalidateCollectionPages(nendoroid.number);
}

export async function increaseCollectionQuantity(
  nendoroidNumber: string,
): Promise<void> {
  const { user, nendoroid } =
    await getDevelopmentUserAndNendoroid(nendoroidNumber);

  const collectionItem = await prisma.collectionItem.findUnique({
    where: {
      userId_nendoroidId: {
        userId: user.id,
        nendoroidId: nendoroid.id,
      },
    },
  });

  if (!collectionItem) {
    throw new Error(
      `Nendoroid #${nendoroidNumber} is not in the user's collection.`,
    );
  }

  await prisma.collectionItem.update({
    where: {
      id: collectionItem.id,
    },
    data: {
      quantity: {
        increment: 1,
      },
    },
  });

  revalidateCollectionPages(nendoroid.number);
}