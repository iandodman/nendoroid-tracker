import "dotenv/config";

import { discoverFullCatalog } from "./full-catalog-discovery";
import {
  importProduct,
  type ProductImportOperation,
} from "./import-product";
import { writeJsonFile } from "./write-json";

interface FailedProductImport {
  productId: string;
  message: string;
}

interface SkippedProductImport {
  productId: string;
  reason: string;
  productType?: string;
}

interface SuccessfulProductImport {
  productId: string;
  number: string;
  name: string;
  operation: ProductImportOperation;
}

const DEFAULT_PRODUCT_DELAY_MS = 400;
const DEFAULT_IMPORT_CONCURRENCY = 2;

function getMaxPages(): number | undefined {
  const rawValue = process.argv[2]?.trim();

  if (!rawValue) {
    return undefined;
  }

  const maxPages = Number(rawValue);

  if (
    !Number.isInteger(maxPages) ||
    maxPages <= 0
  ) {
    throw new Error(
      `Invalid maximum page count: "${rawValue}".`,
    );
  }

  return maxPages;
}

function getProductDelayMs(): number {
  const rawValue =
    process.env.CATALOG_IMPORT_DELAY_MS?.trim();

  if (!rawValue) {
    return DEFAULT_PRODUCT_DELAY_MS;
  }

  const delayMs = Number(rawValue);

  if (
    !Number.isInteger(delayMs) ||
    delayMs < 0
  ) {
    throw new Error(
      `Invalid catalog import delay: "${rawValue}".`,
    );
  }

  return delayMs;
}

function getImportConcurrency(): number {
  const rawValue =
    process.env.CATALOG_IMPORT_CONCURRENCY?.trim();

  if (!rawValue) {
    return DEFAULT_IMPORT_CONCURRENCY;
  }

  const concurrency = Number(rawValue);

  if (
    !Number.isInteger(concurrency) ||
    concurrency <= 0
  ) {
    throw new Error(
      `Invalid catalog import concurrency: "${rawValue}".`,
    );
  }

  return concurrency;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function main(): Promise<void> {
  const maxPages = getMaxPages();
  const productDelayMs = getProductDelayMs();
  const importConcurrency = getImportConcurrency();

  console.log(
    "Discovering Good Smile catalog...",
  );
  console.log(
    `Product request delay: ${productDelayMs} ms.`,
  );
  console.log(
    `Import concurrency: ${importConcurrency}.`,
  );
  console.log("");

  const discovery = await discoverFullCatalog({
    maxPages,

    onPageStart(pageNumber, offset) {
      console.log(
        `Downloading catalog page ${pageNumber} at offset ${offset}...`,
      );
    },

    onPageComplete(page) {
      console.log(
        `Found ${page.count} IDs. Total unique: ${page.uniqueCount}.`,
      );
    },
  });

  console.log("");
  console.log(
    `Catalog discovery finished with ${discovery.uniqueCount} unique product IDs.`,
  );
  console.log("");

  const successfulProducts:
    SuccessfulProductImport[] = [];

  const skippedProducts:
    SkippedProductImport[] = [];

  const failedProducts:
    FailedProductImport[] = [];

  let nextProductIndex = 0;
  let completedCount = 0;

  async function importNextProduct(
    workerId: number,
  ): Promise<void> {
    while (true) {
      const currentIndex = nextProductIndex;

      if (
        currentIndex >=
        discovery.productIds.length
      ) {
        return;
      }

      nextProductIndex += 1;

      const productId =
        discovery.productIds[currentIndex];

      console.log(
        `[worker ${workerId}] [${currentIndex + 1}/${discovery.productIds.length}] Importing product ${productId}...`,
      );

      try {
        const result = await importProduct(
          productId,
          {
            artifactMode: "failed",
          },
        );

        if (result.status === "skipped") {
          skippedProducts.push({
            productId: result.productId,
            reason: result.reason,
            productType: result.productType,
          });

          console.log(
            `[worker ${workerId}] Skipped: ${result.productId} - ${result.reason}`,
          );
        } else {
          successfulProducts.push({
            productId: result.productId,
            number: result.number,
            name: result.name,
            operation: result.operation,
          });

          console.log(
            `[worker ${workerId}] ${result.operation}: Nendoroid #${result.number} - ${result.name}`,
          );
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "An unknown error occurred.";

        failedProducts.push({
          productId,
          message,
        });

        console.error(
          `[worker ${workerId}] Failed to import product ${productId}: ${message}`,
        );
      }

      completedCount += 1;

      console.log(
        `Progress: ${completedCount}/${discovery.productIds.length}`,
      );
      console.log("");

      if (
        productDelayMs > 0 &&
        completedCount <
          discovery.productIds.length
      ) {
        await sleep(productDelayMs);
      }
    }
  }

  const workers = Array.from(
    {
      length: Math.min(
        importConcurrency,
        discovery.productIds.length,
      ),
    },
    (_, index) =>
      importNextProduct(index + 1),
  );

  await Promise.all(workers);

  const operationCounts =
    successfulProducts.reduce(
      (counts, product) => {
        counts[product.operation] += 1;
        return counts;
      },
      {
        created: 0,
        updated: 0,
      } satisfies Record<
        ProductImportOperation,
        number
      >,
    );

  const completedAt =
    new Date().toISOString();

  await writeJsonFile(
    "data/catalog/full-catalog-import-report.json",
    {
      startedAt: discovery.discoveredAt,
      completedAt,

      discovery: {
        pageLimit: discovery.pageLimit,
        maxPages: discovery.maxPages,
        processedPages:
          discovery.processedPages,
        stopReason: discovery.stopReason,
        discoveredProductCount:
          discovery.uniqueCount,
        pages: discovery.pages,
      },

      import: {
        attempted:
          discovery.productIds.length,
        successful:
          successfulProducts.length,
        skipped:
          skippedProducts.length,
        failed:
          failedProducts.length,

        concurrency: importConcurrency,
        productDelayMs,

        operations: operationCounts,

        successfulProducts,
        skippedProducts,
        failedProducts,
      },
    },
  );

  console.log(
    "Full catalog import complete.",
  );
  console.log(
    `- Discovered: ${discovery.uniqueCount}`,
  );
  console.log(
    `- Successful: ${successfulProducts.length}`,
  );
  console.log(
    `  - Created: ${operationCounts.created}`,
  );
  console.log(
    `  - Updated: ${operationCounts.updated}`,
  );
  console.log(
    `- Skipped: ${skippedProducts.length}`,
  );
  console.log(
    `- Failed: ${failedProducts.length}`,
  );
  console.log(
    `- Concurrency: ${importConcurrency}`,
  );
  console.log(
    `- Product delay: ${productDelayMs} ms`,
  );
  console.log(
    "- Report: data/catalog/full-catalog-import-report.json",
  );

  if (failedProducts.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(
    `Full catalog import failed: ${message}`,
  );

  process.exitCode = 1;
});