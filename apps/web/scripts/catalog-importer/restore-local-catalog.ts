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
  series?: string | null;
  manufacturer?: string | null;
  imageUrl?: string | null;

  releaseYear?: number | null;
  releaseMonth?: number | null;

  // Present in normalized files generated with the new importer.
  slug?: string;
  editionName?: string;
  notes?: string | null;
}

interface RestoredEdition {
  slug: string;
  name: string;
}

interface RestoredNumber {
  base: number;
  suffix?: string;
}

const PRODUCTS_DIRECTORY = path.resolve(
  process.cwd(),
  "data/catalog/products",
);

function hasBonusEdition(name: string): boolean {
  return /\bbonus\b/i.test(name);
}

function hasDxEdition(name: string): boolean {
  return /\bdx(?:\s+ver\.?)?\b/i.test(name);
}

function normalizeNendoroidName(name: string): string {
  return name
    .replace(/^Nendoroid\s+/i, "")
    .replace(/\s+(?:w\/|with)\s+.*bonus.*$/i, "")
    .replace(/\s+good\s+smile.*bonus.*$/i, "")
    .replace(/\s+bonus(?:\s+included)?.*$/i, "")
    .replace(/\s+dx(?:\s+ver\.?)?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveEdition(name: string): RestoredEdition {
  const isBonus = hasBonusEdition(name);
  const isDx = hasDxEdition(name);

  if (isDx && isBonus) {
    return {
      slug: "dx-good-smile-bonus",
      name: "DX Good Smile Bonus",
    };
  }

  if (isDx) {
    return {
      slug: "dx",
      name: "DX",
    };
  }

  if (isBonus) {
    return {
      slug: "good-smile-bonus",
      name: "Good Smile Bonus",
    };
  }

  return {
    slug: "standard",
    name: "Standard",
  };
}

function normalizeNendoroidNumber(
  number: string,
): RestoredNumber {
  const normalizedNumber = number.trim();
  const match = normalizedNumber.match(/^(\d+)(.*)$/);

  if (!match) {
    throw new Error(
      `Invalid Nendoroid number: "${number}".`,
    );
  }

  const base = Number.parseInt(match[1], 10);

  const suffix = match[2]
    .replace(/^[\s\-‐-‒–—―・]+/, "")
    .trim();

  return {
    base,
    suffix: suffix || undefined,
  };
}

function getEdition(
  product: NormalizedProduct,
): RestoredEdition {
  if (product.slug && product.editionName) {
    return {
      slug: product.slug,
      name: product.editionName,
    };
  }

  return deriveEdition(product.name);
}

async function getNormalizedProductFiles(): Promise<
  string[]
> {
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

      const edition = getEdition(product);

      const normalizedNumber =
        normalizeNendoroidNumber(product.number);

      const result = await prisma.$transaction(
        async (transaction) => {
          const nendoroid =
            await transaction.nendoroid.upsert({
              where: {
                number: product.number,
              },
              update: {
                numberBase: normalizedNumber.base,
                numberSuffix:
                  normalizedNumber.suffix,
                name: normalizeNendoroidName(
                  product.name,
                ),
                series: product.series,
                manufacturer: product.manufacturer,
                imageUrl: product.imageUrl,
                releaseYear: product.releaseYear,
                releaseMonth: product.releaseMonth,
              },
              create: {
                number: product.number,
                numberBase: normalizedNumber.base,
                numberSuffix:
                  normalizedNumber.suffix,
                name: normalizeNendoroidName(
                  product.name,
                ),
                series: product.series,
                manufacturer: product.manufacturer,
                imageUrl: product.imageUrl,
                releaseYear: product.releaseYear,
                releaseMonth: product.releaseMonth,
              },
            });

          const existingEdition =
            await transaction.nendoroidEdition.findUnique(
              {
                where: {
                  nendoroidId_slug: {
                    nendoroidId: nendoroid.id,
                    slug: edition.slug,
                  },
                },
                select: {
                  id: true,
                },
              },
            );

          await transaction.nendoroidEdition.upsert({
            where: {
              nendoroidId_slug: {
                nendoroidId: nendoroid.id,
                slug: edition.slug,
              },
            },
            update: {
              name: edition.name,
              notes: product.notes,
              source: product.source,
              externalId: product.sourceId,
              officialUrl: product.officialUrl,
            },
            create: {
              slug: edition.slug,
              name: edition.name,
              notes: product.notes,
              source: product.source,
              externalId: product.sourceId,
              officialUrl: product.officialUrl,
              nendoroidId: nendoroid.id,
            },
          });

          return {
            editionCreated: !existingEdition,
            nendoroid,
          };
        },
      );

      if (result.editionCreated) {
        created += 1;
      } else {
        updated += 1;
      }

      console.log(
        `${result.editionCreated ? "Created" : "Updated"}: Nendoroid #${product.number} — ${result.nendoroid.name} (${edition.name})`,
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
  console.log(`- Editions created: ${created}`);
  console.log(`- Editions updated: ${updated}`);
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