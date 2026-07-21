import "dotenv/config";

import {
  DEFAULT_MAX_PAGES,
  discoverFullCatalog,
} from "./full-catalog-discovery";
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

function getMaxPages(): number {
  const rawValue = process.argv[2]?.trim();

  if (!rawValue) {
    return DEFAULT_MAX_PAGES;
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

async function main(): Promise<void> {
  const maxPages = getMaxPages();

  console.log(
    "Discovering Good Smile catalog...",
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

  for (
    let index = 0;
    index < discovery.productIds.length;
    index += 1
  ) {
    const productId =
      discovery.productIds[index];

    console.log(
      `[${index + 1}/${discovery.productIds.length}] Importing product ${productId}...`,
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
          `Skipped: ${result.productId} — ${result.reason}`,
        );

        continue;
      }

      successfulProducts.push({
        productId: result.productId,
        number: result.number,
        name: result.name,
        operation: result.operation,
      });

      console.log(
        `${result.operation}: Nendoroid #${result.number} — ${result.name}`,
      );
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
        `Failed to import product ${productId}: ${message}`,
      );
    }

    console.log("");
  }

  const operationCounts =
  successfulProducts.reduce(
    (counts, product) => {
      counts[product.operation] += 1;
      return counts;
    },
    {
      created: 0,
      updated: 0,
      adopted: 0,
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
    `  - Adopted: ${operationCounts.adopted}`,
  );
  console.log(
    `- Skipped: ${skippedProducts.length}`,
  );
  console.log(
    `- Failed: ${failedProducts.length}`,
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