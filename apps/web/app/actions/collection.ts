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

function revalidateCollectionPages(
  nendoroidNumber: string,
): void {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/collection");
  revalidatePath(
    `/catalog/${nendoroidNumber}`,
  );
}

export async function addToCollection(
  nendoroidNumber: string,
): Promise<ActionResult> {
  try {
    const { userId, nendoroid } =
      await getAuthenticatedUserAndNendoroid(
        nendoroidNumber,
      );

    const existingItem =
      await prisma.collectionItem.findUnique({
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
        message: "Already in your collection.",
      };
    }

    await prisma.collectionItem.create({
      data: {
        userId,
        nendoroidId: nendoroid.id,
        quantity: 1,
      },
    });

    revalidateCollectionPages(
      nendoroid.number,
    );

    return {
      success: true,
      message: "Added to collection.",
    };
  } catch (error: unknown) {
    console.error(error);

    return {
      success: false,
      message:
        "Could not add this Nendoroid to your collection.",
    };
  }
}

export async function increaseCollectionQuantity(
  nendoroidNumber: string,
): Promise<ActionResult> {
  try {
    const { userId, nendoroid } =
      await getAuthenticatedUserAndNendoroid(
        nendoroidNumber,
      );

    const collectionItem =
      await prisma.collectionItem.findUnique({
        where: {
          userId_nendoroidId: {
            userId,
            nendoroidId: nendoroid.id,
          },
        },
      });

    if (!collectionItem) {
      return {
        success: false,
        message:
          "This Nendoroid is not in your collection.",
      };
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

    revalidateCollectionPages(
      nendoroid.number,
    );

    return {
      success: true,
      message: "Quantity increased.",
    };
  } catch (error: unknown) {
    console.error(error);

    return {
      success: false,
      message:
        "Could not update the collection quantity.",
    };
  }
}

export async function decreaseCollectionQuantity(
  nendoroidNumber: string,
): Promise<ActionResult> {
  try {
    const { userId, nendoroid } =
      await getAuthenticatedUserAndNendoroid(
        nendoroidNumber,
      );

    const collectionItem =
      await prisma.collectionItem.findUnique({
        where: {
          userId_nendoroidId: {
            userId,
            nendoroidId: nendoroid.id,
          },
        },
      });

    if (!collectionItem) {
      return {
        success: false,
        message:
          "This Nendoroid is not in your collection.",
      };
    }

    if (collectionItem.quantity === 1) {
      await prisma.collectionItem.delete({
        where: {
          id: collectionItem.id,
        },
      });

      revalidateCollectionPages(
        nendoroid.number,
      );

      return {
        success: true,
        message: "Removed from collection.",
      };
    }

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

    revalidateCollectionPages(
      nendoroid.number,
    );

    return {
      success: true,
      message: "Quantity decreased.",
    };
  } catch (error: unknown) {
    console.error(error);

    return {
      success: false,
      message:
        "Could not update the collection quantity.",
    };
  }
}