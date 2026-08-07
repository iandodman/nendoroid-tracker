import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";

type NormalizedEdition = {
  slug: string;
  name: string;
  notes: string | null;
  source: string;
  externalId: string;
  officialUrl: string | null;
};

type NormalizedNendoroid = {
  number: string;
  numberBase: number;
  numberSuffix: string | null;
  name: string;
  series: string | null;
  manufacturer: string | null;
  imageUrl: string | null;
  releaseYear: number | null;
  releaseMonth: number | null;
  editions: NormalizedEdition[];
};

async function main() {
  const manualDirectory = path.join(
    process.cwd(),
    "data",
    "manual",
  );

  const files = (await fs.readdir(manualDirectory)).filter((file) =>
    file.endsWith(".normalized.json"),
  );

  if (files.length === 0) {
    console.log("No manual Nendoroids found.");
    return;
  }

  console.log(`Found ${files.length} manual Nendoroid(s).\n`);

  for (const file of files) {
    const filePath = path.join(manualDirectory, file);

    const raw = await fs.readFile(filePath, "utf8");

    const nendoroid =
      JSON.parse(raw) as NormalizedNendoroid;

    const saved = await prisma.nendoroid.upsert({
      where: {
        number: nendoroid.number,
      },
      update: {
        name: nendoroid.name,
        numberBase: nendoroid.numberBase,
        numberSuffix: nendoroid.numberSuffix,
        series: nendoroid.series,
        manufacturer: nendoroid.manufacturer,
        imageUrl: nendoroid.imageUrl,
        releaseYear: nendoroid.releaseYear,
        releaseMonth: nendoroid.releaseMonth,
      },
      create: {
        number: nendoroid.number,
        name: nendoroid.name,
        numberBase: nendoroid.numberBase,
        numberSuffix: nendoroid.numberSuffix,
        series: nendoroid.series,
        manufacturer: nendoroid.manufacturer,
        imageUrl: nendoroid.imageUrl,
        releaseYear: nendoroid.releaseYear,
        releaseMonth: nendoroid.releaseMonth,
      },
    });

    for (const edition of nendoroid.editions) {
      await prisma.nendoroidEdition.upsert({
        where: {
          nendoroidId_slug: {
            nendoroidId: saved.id,
            slug: edition.slug,
          },
        },
        update: {
          name: edition.name,
          notes: edition.notes,
          source: edition.source,
          externalId: edition.externalId,
          officialUrl: edition.officialUrl,
        },
        create: {
          nendoroidId: saved.id,
          slug: edition.slug,
          name: edition.name,
          notes: edition.notes,
          source: edition.source,
          externalId: edition.externalId,
          officialUrl: edition.officialUrl,
        },
      });
    }

    console.log(`✓ Imported #${nendoroid.number}`);
  }

  console.log("\nManual catalog import complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });