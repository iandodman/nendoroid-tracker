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

function revalidateWishlistPages(nendoroidNumber: string) {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/wishlist");
  revalidatePath(`/catalog/${nendoroidNumber}`);
}

export async function addToWishlist(
  nendoroidNumber: string,
): Promise<void> {
  const { user, nendoroid } =
    await getDevelopmentUserAndNendoroid(nendoroidNumber);

  await prisma.wishlistItem.upsert({
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
    },
  });

  revalidateWishlistPages(nendoroid.number);
}

export async function removeFromWishlist(
  nendoroidNumber: string,
): Promise<void> {
  const { user, nendoroid } =
    await getDevelopmentUserAndNendoroid(nendoroidNumber);

  await prisma.wishlistItem.deleteMany({
    where: {
      userId: user.id,
      nendoroidId: nendoroid.id,
    },
  });

  revalidateWishlistPages(nendoroid.number);
}