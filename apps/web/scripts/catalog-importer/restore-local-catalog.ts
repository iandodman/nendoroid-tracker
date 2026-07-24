import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";

interface NormalizedProduct {
  source: string;
  sourceId: string;
  officialUrl: string;
  number: string;
  name: string;
  series: string;
  manufacturer: string;
  imageUrl: string;
  releaseYear: number | null;
  releaseMonth: number | null;
}

const PRODUCTS_DIRECTORY = path.resolve(
  process.cwd(),
  "data/catalog/products",
);

async function getNormalizedProductFiles(): Promise<string[]> {
  const entries = await readdir(PRODUCTS_DIRECTORY, {
    withFileTypes: true,
  });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".normalized.json"),
    )
    .map((entry) =>
      path.join(PRODUCTS_DIRECTORY, entry.name),
    );
}

async function readNormalizedProduct(
  filePath: string,
): Promise<NormalizedProduct> {
  const content = await readFile(filePath, "utf8");

  return JSON.parse(content) as NormalizedProduct;
}

async function main(): Promise<void> {
  const productFiles =
    await getNormalizedProductFiles();

  console.log(
    `Found ${productFiles.length} normalized catalog products.`,
  );

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const filePath of productFiles) {
    try {
      const product =
        await readNormalizedProduct(filePath);

      const existingNendoroid =
        await prisma.nendoroid.findUnique({
          where: {
            number: product.number,
          },
          select: {
            id: true,
          },
        });

      await prisma.nendoroid.upsert({
        where: {
          number: product.number,
        },
        update: {
          source: product.source,
          sourceId: product.sourceId,
          officialUrl: product.officialUrl,
          name: product.name,
          series: product.series,
          manufacturer: product.manufacturer,
          imageUrl: product.imageUrl,
          releaseYear: product.releaseYear,
          releaseMonth: product.releaseMonth,
        },
        create: {
          source: product.source,
          sourceId: product.sourceId,
          officialUrl: product.officialUrl,
          number: product.number,
          name: product.name,
          series: product.series,
          manufacturer: product.manufacturer,
          imageUrl: product.imageUrl,
          releaseYear: product.releaseYear,
          releaseMonth: product.releaseMonth,
        },
      });

      if (existingNendoroid) {
        updated += 1;
      } else {
        created += 1;
      }

      console.log(
        `${existingNendoroid ? "Updated" : "Created"}: Nendoroid #${product.number} — ${product.name}`,
      );
    } catch (error: unknown) {
      failed += 1;

      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred.";

      console.error(
        `Failed to restore ${path.basename(filePath)}: ${message}`,
      );
    }
  }

  console.log("");
  console.log("Local catalog restore complete.");
  console.log(`- Created: ${created}`);
  console.log(`- Updated: ${updated}`);
  console.log(`- Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";

    console.error(
      `Local catalog restore failed: ${message}`,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });