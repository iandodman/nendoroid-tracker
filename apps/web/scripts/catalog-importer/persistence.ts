import { prisma } from "../../lib/prisma";

import type { NormalizedCatalogProduct } from "./types";

function buildCatalogData(
  product: NormalizedCatalogProduct,
) {
  return {
    number: product.number,
    name: product.name,
    series: product.series,
    manufacturer: product.manufacturer,
    imageUrl: product.imageUrl,
    releaseYear: product.releaseYear,
    releaseMonth: product.releaseMonth,
    source: product.source,
    sourceId: product.sourceId,
    officialUrl: product.officialUrl,
  };
}

export async function persistCatalogProduct(
  product: NormalizedCatalogProduct,
) {
  const catalogData = buildCatalogData(product);

  const existingBySource =
    await prisma.nendoroid.findUnique({
      where: {
        source_sourceId: {
          source: product.source,
          sourceId: product.sourceId,
        },
      },
    });

  if (existingBySource) {
    const nendoroid = await prisma.nendoroid.update({
      where: {
        id: existingBySource.id,
      },
      data: catalogData,
    });

    return {
      nendoroid,
      operation: "updated" as const,
    };
  }

  const existingByNumber =
    await prisma.nendoroid.findUnique({
      where: {
        number: product.number,
      },
    });

  if (existingByNumber) {
    const nendoroid = await prisma.nendoroid.update({
      where: {
        id: existingByNumber.id,
      },
      data: catalogData,
    });

    return {
      nendoroid,
      operation: "adopted" as const,
    };
  }

  const nendoroid = await prisma.nendoroid.create({
    data: catalogData,
  });

  return {
    nendoroid,
    operation: "created" as const,
  };
}