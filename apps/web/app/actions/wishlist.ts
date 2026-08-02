"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/action-result";

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
    throw new Error(
      `Nendoroid #${nendoroidNumber} not found.`,
    );
  }

  return {
    userId,
    nendoroid,
  };
}

function revalidateWishlistPages(
  nendoroidNumber: string,
): void {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/wishlist");
  revalidatePath(
    `/catalog/${nendoroidNumber}`,
  );
}

export async function addToWishlist(
  nendoroidNumber: string,
): Promise<ActionResult> {
  try {
    const { userId, nendoroid } =
      await getAuthenticatedUserAndNendoroid(
        nendoroidNumber,
      );

    const existingItem =
      await prisma.wishlistItem.findUnique({
        where: {
          userId_nendoroidId: {
            userId,
            nendoroidId: nendoroid.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingItem) {
      return {
        success: true,
        message: "Already in your wishlist.",
      };
    }

    await prisma.wishlistItem.create({
      data: {
        userId,
        nendoroidId: nendoroid.id,
      },
    });

    revalidateWishlistPages(
      nendoroid.number,
    );

    return {
      success: true,
      message: "Added to wishlist.",
    };
  } catch (error: unknown) {
    console.error(error);

    return {
      success: false,
      message:
        "Could not add this Nendoroid to your wishlist.",
    };
  }
}

export async function removeFromWishlist(
  nendoroidNumber: string,
): Promise<ActionResult> {
  try {
    const { userId, nendoroid } =
      await getAuthenticatedUserAndNendoroid(
        nendoroidNumber,
      );

    const result =
      await prisma.wishlistItem.deleteMany({
        where: {
          userId,
          nendoroidId: nendoroid.id,
        },
      });

    if (result.count === 0) {
      return {
        success: true,
        message:
          "This Nendoroid was not in your wishlist.",
      };
    }

    revalidateWishlistPages(
      nendoroid.number,
    );

    return {
      success: true,
      message: "Removed from wishlist.",
    };
  } catch (error: unknown) {
    console.error(error);

    return {
      success: false,
      message:
        "Could not remove this Nendoroid from your wishlist.",
    };
  }
}