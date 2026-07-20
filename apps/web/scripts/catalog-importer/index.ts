import "dotenv/config";

import { importProduct } from "./import-product";

function getProductIds(): string[] {
  const productIds = process.argv
    .slice(2)
    .map((productId) => productId.trim())
    .filter(Boolean);

  if (productIds.length === 0) {
    throw new Error(
      "At least one Good Smile product ID is required. Example: npm run import:product -- 56111 56112",
    );
  }

  const invalidProductId = productIds.find(
    (productId) => !/^[a-zA-Z0-9]+$/.test(productId),
  );

  if (invalidProductId) {
    throw new Error(
      `Invalid Good Smile product ID: "${invalidProductId}".`,
    );
  }

  return productIds;
}

async function main(): Promise<void> {
  const productIds = getProductIds();

  const successfulProductIds: string[] = [];
  const failedProducts: Array<{
    productId: string;
    message: string;
  }> = [];

  for (const productId of productIds) {
    try {
      console.log("");
      console.log(
        `Importing Good Smile product ${productId}...`,
      );

      const result = await importProduct(
        productId,
        {
          artifactMode: "all",
        },
      );

      successfulProductIds.push(productId);

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
  }

  console.log("");
  console.log("Import summary:");
  console.log(
    `- Successful: ${successfulProductIds.length}`,
  );
  console.log(`- Failed: ${failedProducts.length}`);

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

  console.error(`Catalog importer failed: ${message}`);
  process.exitCode = 1;
});