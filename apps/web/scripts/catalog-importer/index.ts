import "dotenv/config";

import { fetchProductHtml } from "./fetch-product";
import { normalizeGoodSmileProduct } from "./normalizer";
import { parseGoodSmileProduct } from "./parser";
import { persistCatalogProduct } from "./persistence";
import {
  writeJsonFile,
  writeTextFile,
} from "./write-json";

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

function buildProductUrl(productId: string): string {
  return `https://www.goodsmile.com/en/product/${productId}`;
}

async function importProduct(
  productId: string,
): Promise<void> {
  const productUrl = buildProductUrl(productId);

  console.log("");
  console.log(`Importing Good Smile product ${productId}...`);

  const html = await fetchProductHtml(productUrl);

  await writeTextFile(
    `data/catalog/${productId}.html`,
    html,
  );

  console.log(
    `Downloaded ${html.length.toLocaleString()} characters.`,
  );

  const product = parseGoodSmileProduct(
    html,
    productId,
    productUrl,
  );

  const normalizedProduct =
    normalizeGoodSmileProduct(product);

  await writeJsonFile(
    `data/catalog/${productId}.raw.json`,
    product,
  );

  await writeJsonFile(
    `data/catalog/${productId}.normalized.json`,
    normalizedProduct,
  );

  const {
    nendoroid,
    operation,
  } = await persistCatalogProduct(normalizedProduct);

  console.log(
    `${operation}: Nendoroid #${nendoroid.number} — ${nendoroid.name}`,
  );
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
      await importProduct(productId);
      successfulProductIds.push(productId);
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