import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../app/generated/prisma/client";

const DEFAULT_CONCURRENCY = 5;

type SyncOptions = {
  dryRun: boolean;
  limit?: number;
  concurrency: number;
  numbers?: string[];
};

function getRequiredEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is not defined.`,
    );
  }

  return value;
}

function getOptions(): SyncOptions {
  let dryRun = false;
  let limit: number | undefined;
  let concurrency = DEFAULT_CONCURRENCY;
  let numbers: string[] | undefined;

  for (const argument of process.argv.slice(2)) {
    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (argument.startsWith("--limit=")) {
      const value = Number(
        argument.replace("--limit=", ""),
      );

      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(
          `Invalid limit: "${argument}".`,
        );
      }

      limit = value;
      continue;
    }

    if (argument.startsWith("--numbers=")) {
      numbers = argument
        .replace("--numbers=", "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      continue;
    }

    if (argument.startsWith("--concurrency=")) {
      const value = Number(
        argument.replace("--concurrency=", ""),
      );

      if (
        !Number.isInteger(value) ||
        value <= 0 ||
        value > 20
      ) {
        throw new Error(
          `Invalid concurrency: "${argument}". Use a value between 1 and 20.`,
        );
      }

      concurrency = value;
      continue;
    }

    throw new Error(
      `Unknown argument: "${argument}".`,
    );
  }

  return {
    dryRun,
    limit,
    concurrency,
    numbers,
  };
}

function createPrismaClient(
  connectionString: string,
  maxConnections: number,
): PrismaClient {
  const adapter = new PrismaPg({
    connectionString,
    max: maxConnections,
    connectionTimeoutMillis: 30_000,
    idleTimeoutMillis: 30_000,
  });

  return new PrismaClient({
    adapter,
  });
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (
    item: T,
    index: number,
  ) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      await worker(
        items[currentIndex],
        currentIndex,
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          concurrency,
          items.length,
        ),
      },
      () => runWorker(),
    ),
  );
}

async function main(): Promise<void> {
  const options = getOptions();

  const localDatabaseUrl =
    getRequiredEnvironmentVariable(
      "DATABASE_URL",
    );

  const productionDatabaseUrl =
    getRequiredEnvironmentVariable(
      "PRODUCTION_DATABASE_URL",
    );

  if (localDatabaseUrl === productionDatabaseUrl) {
    throw new Error(
      "DATABASE_URL and PRODUCTION_DATABASE_URL point to the same database.",
    );
  }

  const localPrisma = createPrismaClient(
  localDatabaseUrl,
  Math.max(2, options.concurrency),
);

const productionPrisma = createPrismaClient(
  productionDatabaseUrl,
  Math.max(1, options.concurrency),
);

  try {
    console.log(
      "Reading the local NendoDex catalog...",
    );

const localNendoroids =
  await localPrisma.nendoroid.findMany({
    ...(options.numbers
      ? {
          where: {
            number: {
              in: options.numbers,
            },
          },
        }
      : {}),

    include: {
      editions: {
        orderBy: {
          id: "asc",
        },
      },
    },

    orderBy: [
      {
        numberBase: "asc",
      },
      {
        numberSuffix: {
          sort: "asc",
          nulls: "first",
        },
      },
    ],

    ...(options.limit
      ? {
          take: options.limit,
        }
      : {}),
  });

    const localEditionCount =
      localNendoroids.reduce(
        (total, nendoroid) =>
          total + nendoroid.editions.length,
        0,
      );

    console.log(
      `Found ${localNendoroids.length} Nendoroids and ${localEditionCount} editions.`,
    );

    if (options.dryRun) {
      console.log("");
      console.log(
        "Dry run complete. No production data was changed.",
      );
      return;
    }

    const productionUserCount =
      await productionPrisma.user.count();

    console.log(
      `Production users before sync: ${productionUserCount}.`,
    );
    console.log(
      `Sync concurrency: ${options.concurrency}.`,
    );
    console.log("");

    let completed = 0;
    let created = 0;
    let updated = 0;
    let failed = 0;

    const failures: Array<{
      number: string;
      message: string;
    }> = [];

    await runWithConcurrency(
      localNendoroids,
      options.concurrency,
      async (localNendoroid) => {
        try {
          const result =
            await productionPrisma.$transaction(
              async (transaction) => {
                const existingNendoroid =
                  await transaction.nendoroid.findUnique({
                    where: {
                      number:
                        localNendoroid.number,
                    },
                    select: {
                      id: true,
                    },
                  });

                const productionNendoroid =
                  await transaction.nendoroid.upsert({
                    where: {
                      number:
                        localNendoroid.number,
                    },
                    update: {
                      name: localNendoroid.name,
                      numberBase:
                        localNendoroid.numberBase,
                      numberSuffix:
                        localNendoroid.numberSuffix,
                      series:
                        localNendoroid.series,
                      manufacturer:
                        localNendoroid.manufacturer,
                      imageUrl:
                        localNendoroid.imageUrl,
                      releaseYear:
                        localNendoroid.releaseYear,
                      releaseMonth:
                        localNendoroid.releaseMonth,
                    },
                    create: {
                      number:
                        localNendoroid.number,
                      name: localNendoroid.name,
                      numberBase:
                        localNendoroid.numberBase,
                      numberSuffix:
                        localNendoroid.numberSuffix,
                      series:
                        localNendoroid.series,
                      manufacturer:
                        localNendoroid.manufacturer,
                      imageUrl:
                        localNendoroid.imageUrl,
                      releaseYear:
                        localNendoroid.releaseYear,
                      releaseMonth:
                        localNendoroid.releaseMonth,
                      createdAt:
                        localNendoroid.createdAt,
                    },
                  });

                for (const edition of localNendoroid.editions) {
                  await transaction.nendoroidEdition.upsert({
                    where: {
                      nendoroidId_slug: {
                        nendoroidId:
                          productionNendoroid.id,
                        slug: edition.slug,
                      },
                    },
                    update: {
                      name: edition.name,
                      notes: edition.notes,
                      source: edition.source,
                      externalId:
                        edition.externalId,
                      officialUrl:
                        edition.officialUrl,
                    },
                    create: {
                      slug: edition.slug,
                      name: edition.name,
                      notes: edition.notes,
                      source: edition.source,
                      externalId:
                        edition.externalId,
                      officialUrl:
                        edition.officialUrl,
                      nendoroidId:
                        productionNendoroid.id,
                      createdAt:
                        edition.createdAt,
                    },
                  });
                }

                return {
                  created:
                    existingNendoroid === null,
                };
              },
            );

          if (result.created) {
            created += 1;
          } else {
            updated += 1;
          }
        } catch (error: unknown) {
          failed += 1;

          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred.";

          failures.push({
            number: localNendoroid.number,
            message,
          });

          console.error(
            `Failed: Nendoroid #${localNendoroid.number} — ${message}`,
          );
        } finally {
          completed += 1;

          if (
            completed % 50 === 0 ||
            completed === localNendoroids.length
          ) {
            console.log(
              `[${completed}/${localNendoroids.length}] Catalog sync progress.`,
            );
          }
        }
      },
    );

    const [
      productionNendoroidCount,
      productionEditionCount,
      finalProductionUserCount,
    ] = await Promise.all([
      productionPrisma.nendoroid.count(),
      productionPrisma.nendoroidEdition.count(),
      productionPrisma.user.count(),
    ]);

    console.log("");
    console.log(
      "Production catalog sync complete.",
    );
    console.log(`- Created: ${created}`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Failed: ${failed}`);
    console.log(
      `- Production Nendoroids: ${productionNendoroidCount}`,
    );
    console.log(
      `- Production editions: ${productionEditionCount}`,
    );
    console.log(
      `- Production users: ${finalProductionUserCount}`,
    );

    if (failures.length > 0) {
      console.log("");
      console.log("Failed Nendoroids:");

      for (const failure of failures) {
        console.log(
          `- #${failure.number}: ${failure.message}`,
        );
      }

      process.exitCode = 1;
    }
  } finally {
    await Promise.all([
      localPrisma.$disconnect(),
      productionPrisma.$disconnect(),
    ]);
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(
    `Production catalog sync failed: ${message}`,
  );

  process.exitCode = 1;
});