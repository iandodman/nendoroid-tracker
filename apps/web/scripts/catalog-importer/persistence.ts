import { prisma } from "../../lib/prisma";

import type { NormalizedCatalogProduct } from "./types";

type ProductImportOperation =
  | "created"
  | "updated";

function buildNendoroidData(
  product: NormalizedCatalogProduct,
) {
  return {
    name: product.name,
    series: product.series,
    manufacturer: product.manufacturer,
    imageUrl: product.imageUrl,
    releaseYear: product.releaseYear,
    releaseMonth: product.releaseMonth,
  };
}

function buildVariantData(
  product: NormalizedCatalogProduct,
) {
  return {
    name: product.name,
    fullName: product.name,
    source: product.source,
    sourceId: product.sourceId,
    officialUrl: product.officialUrl,
  };
}

async function findOrCreateNendoroid(
  product: NormalizedCatalogProduct,
) {
  const existingNendoroid =
    await prisma.nendoroid.findUnique({
      where: {
        number: product.number,
      },
    });

  if (existingNendoroid) {
    return existingNendoroid;
  }

  return prisma.nendoroid.create({
    data: {
      number: product.number,
      ...buildNendoroidData(product),
    },
  });
}

export async function persistCatalogProduct(
  product: NormalizedCatalogProduct,
): Promise<{
  nendoroid: Awaited<
    ReturnType<typeof findOrCreateNendoroid>
  >;
  operation: ProductImportOperation;
}> {
  const nendoroid =
    await findOrCreateNendoroid(product);

  const variantData =
    buildVariantData(product);

  const existingVariant =
    await prisma.nendoroidVariant.findUnique({
      where: {
        source_sourceId: {
          source: product.source,
          sourceId: product.sourceId,
        },
      },
    });

  if (existingVariant) {
    await prisma.nendoroidVariant.update({
      where: {
        id: existingVariant.id,
      },
      data: {
        ...variantData,
        nendoroidId: nendoroid.id,
      },
    });

    return {
      nendoroid,
      operation: "updated",
    };
  }

  await prisma.nendoroidVariant.create({
    data: {
      ...variantData,
      nendoroidId: nendoroid.id,
    },
  });

  return {
    nendoroid,
    operation: "created",
  };
}