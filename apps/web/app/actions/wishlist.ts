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

function revalidateWishlistPages(nendoroidNumber: string) {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/wishlist");
  revalidatePath(`/catalog/${nendoroidNumber}`);
}

export async function addToWishlist(
  nendoroidNumber: string,
): Promise<void> {
  const { userId, nendoroid } =
    await getAuthenticatedUserAndNendoroid(nendoroidNumber);

  await prisma.wishlistItem.upsert({
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
    },
  });

  revalidateWishlistPages(nendoroid.number);
}

export async function removeFromWishlist(
  nendoroidNumber: string,
): Promise<void> {
  const { userId, nendoroid } =
    await getAuthenticatedUserAndNendoroid(nendoroidNumber);

  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      nendoroidId: nendoroid.id,
    },
  });

  revalidateWishlistPages(nendoroid.number);
}