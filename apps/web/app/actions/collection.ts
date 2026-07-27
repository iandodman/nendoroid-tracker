"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedUserAndNendoroid(
  nendoroidNumber: string,
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized.");
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
    userId,
    nendoroid,
  };
}

function revalidateCollectionPages(nendoroidNumber: string) {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/collection");
  revalidatePath(`/catalog/${nendoroidNumber}`);
}

export async function addToCollection(
  nendoroidNumber: string,
): Promise<void> {
  const { userId, nendoroid } =
    await getAuthenticatedUserAndNendoroid(nendoroidNumber);

  await prisma.collectionItem.upsert({
    where: {
      userId_nendoroidId: {
        userId,
        nendoroidId: nendoroid.id,
      },
    },
    update: {},
    create: {
      userId,
      nendoroidId: nendoroid.id,
      quantity: 1,
    },
  });

  revalidateCollectionPages(nendoroid.number);
}

export async function increaseCollectionQuantity(
  nendoroidNumber: string,
): Promise<void> {
  const { userId, nendoroid } =
    await getAuthenticatedUserAndNendoroid(nendoroidNumber);

  const collectionItem = await prisma.collectionItem.findUnique({
    where: {
      userId_nendoroidId: {
        userId,
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

export async function decreaseCollectionQuantity(
  nendoroidNumber: string,
): Promise<void> {
  const { userId, nendoroid } =
    await getAuthenticatedUserAndNendoroid(nendoroidNumber);

  const collectionItem = await prisma.collectionItem.findUnique({
    where: {
      userId_nendoroidId: {
        userId,
        nendoroidId: nendoroid.id,
      },
    },
  });

  if (!collectionItem) {
    throw new Error(
      `Nendoroid #${nendoroidNumber} is not in the user's collection.`,
    );
  }

  if (collectionItem.quantity === 1) {
    await prisma.collectionItem.delete({
      where: {
        id: collectionItem.id,
      },
    });
  } else {
    await prisma.collectionItem.update({
      where: {
        id: collectionItem.id,
      },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });
  }

  revalidateCollectionPages(nendoroid.number);
}