import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { importProduct } from "./import-product";

const DEFAULT_PRODUCT_DELAY_MS = 400;

async function readProductIdsFromFile(
  filePath: string,
): Promise<string[]> {
  const resolvedPath = path.resolve(
    process.cwd(),
    filePath,
  );

  const content = await readFile(
    resolvedPath,
    "utf8",
  );

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith("#"),
    );
}

function validateProductIds(
  productIds: string[],
): string[] {
  const uniqueProductIds = [
    ...new Set(productIds),
  ];

  const invalidProductId =
    uniqueProductIds.find(
      (productId) =>
        !/^[a-zA-Z0-9]+$/.test(productId),
    );

  if (invalidProductId) {
    throw new Error(
      `Invalid Good Smile product ID: "${invalidProductId}".`,
    );
  }

  return uniqueProductIds;
}

async function getProductIds(): Promise<string[]> {
  const arguments_ = process.argv
    .slice(2)
    .map((argument) => argument.trim())
    .filter(Boolean);

  if (arguments_.length === 0) {
    throw new Error(
      "Provide one or more Good Smile product IDs or the path to a .txt file.",
    );
  }

  if (
    arguments_.length === 1 &&
    arguments_[0].toLowerCase().endsWith(".txt")
  ) {
    const productIds =
      await readProductIdsFromFile(
        arguments_[0],
      );

    if (productIds.length === 0) {
      throw new Error(
        `No product IDs were found in "${arguments_[0]}".`,
      );
    }

    return validateProductIds(productIds);
  }

  return validateProductIds(arguments_);
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

function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function main(): Promise<void> {
  const productIds = await getProductIds();
  const productDelayMs =
    getProductDelayMs();

  const successfulProductIds: string[] = [];

  const skippedProducts: Array<{
    productId: string;
    message: string;
    productType?: string;
  }> = [];

  const failedProducts: Array<{
    productId: string;
    message: string;
  }> = [];

  console.log(
    `Preparing to import ${productIds.length} products.`,
  );
  console.log(
    `Product request delay: ${productDelayMs} ms.`,
  );

  for (
    let index = 0;
    index < productIds.length;
    index += 1
  ) {
    const productId = productIds[index];

    try {
      console.log("");
      console.log(
        `[${index + 1}/${productIds.length}] Importing Good Smile product ${productId}...`,
      );

      const result = await importProduct(
        productId,
        {
          artifactMode: "failed",
        },
      );

      if (result.status === "skipped") {
        skippedProducts.push({
          productId: result.productId,
          message: result.reason,
          productType: result.productType,
        });

        console.log(
          `Skipped product ${result.productId}: ${result.reason}`,
        );
      } else {
        successfulProductIds.push(
          result.productId,
        );

        console.log(
          `${result.operation}: Nendoroid #${result.number} — ${result.name}`,
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
        `Failed to import product ${productId}: ${message}`,
      );
    }

    if (
      productDelayMs > 0 &&
      index < productIds.length - 1
    ) {
      await sleep(productDelayMs);
    }
  }

  console.log("");
  console.log("Import summary:");
  console.log(
    `- Successful: ${successfulProductIds.length}`,
  );
  console.log(
    `- Skipped: ${skippedProducts.length}`,
  );
  console.log(
    `- Failed: ${failedProducts.length}`,
  );

  if (skippedProducts.length > 0) {
    console.log("- Skipped products:");

    for (const skipped of skippedProducts) {
      const productType =
        skipped.productType
          ? ` [${skipped.productType}]`
          : "";

      console.log(
        `  - ${skipped.productId}${productType}: ${skipped.message}`,
      );
    }
  }

  if (failedProducts.length > 0) {
    console.log("- Failed products:");

    for (const failure of failedProducts) {
      console.log(
        `  - ${failure.productId}: ${failure.message}`,
      );
    }

    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(
    `Catalog importer failed: ${message}`,
  );

  process.exitCode = 1;
});