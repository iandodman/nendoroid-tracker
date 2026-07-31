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

function buildEditionData(
  product: NormalizedCatalogProduct,
) {
  return {
    slug: product.slug,
    name: product.editionName,
    notes: product.notes,
    source: product.source,
    externalId: product.sourceId,
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
    return prisma.nendoroid.update({
      where: {
        id: existingNendoroid.id,
      },
      data: buildNendoroidData(product),
    });
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

  const editionData =
    buildEditionData(product);

  const existingEdition =
    await prisma.nendoroidEdition.findUnique({
      where: {
        nendoroidId_slug: {
          nendoroidId: nendoroid.id,
          slug: product.slug,
        },
      },
    });

  if (existingEdition) {
    await prisma.nendoroidEdition.update({
      where: {
        id: existingEdition.id,
      },
      data: editionData,
    });

    return {
      nendoroid,
      operation: "updated",
    };
  }

  await prisma.nendoroidEdition.create({
    data: {
      ...editionData,
      nendoroidId: nendoroid.id,
    },
  });

  return {
    nendoroid,
    operation: "created",
  };
}