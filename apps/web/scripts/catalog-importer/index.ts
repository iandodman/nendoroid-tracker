import { fetchProductHtml } from "./fetch-product";
import { parseGoodSmileProduct } from "./parser";
import {
  writeJsonFile,
  writeTextFile,
} from "./write-json";

function getProductId(): string {
  const productId = process.argv[2]?.trim();

  if (!productId) {
    throw new Error(
      "A Good Smile product ID is required. Example: npm run import:product -- 56111",
    );
  }

  if (!/^[a-zA-Z0-9]+$/.test(productId)) {
    throw new Error(
      `Invalid Good Smile product ID: "${productId}".`,
    );
  }

  return productId;
}

function buildProductUrl(productId: string): string {
  return `https://www.goodsmile.com/en/product/${productId}`;
}

async function main(): Promise<void> {
  const productId = getProductId();
  const productUrl = buildProductUrl(productId);

  console.log(
    `Downloading Good Smile product ${productId}...`,
  );

  const html = await fetchProductHtml(productUrl);

  await writeTextFile(
    `data/catalog/${productId}.html`,
    html,
  );

  console.log(
    `Downloaded ${html.length.toLocaleString()} characters.`,
  );

  console.log("Parsing product data...");

  const product = parseGoodSmileProduct(
    html,
    productId,
    productUrl,
  );

  await writeJsonFile(
    `data/catalog/${productId}.json`,
    product,
  );

  console.log("Parsed product:");
  console.log(`- Name: ${product.name}`);
  console.log(`- Number: ${product.number}`);
  console.log(`- Series: ${product.series ?? "Unknown"}`);
  console.log(
    `- Manufacturer: ${product.manufacturer ?? "Unknown"}`,
  );
  console.log(
    `- Product type: ${product.productType ?? "Unknown"}`,
  );
  console.log(
    `- Release dates: ${product.releaseDates.length}`,
  );
  console.log(`- Releases: ${product.releases.length}`);

  const missingFields: Array<
    [field: string, value: unknown]
  > = [
    ["mainImageUrl", product.mainImageUrl],
    ["series", product.series],
    ["manufacturer", product.manufacturer],
    ["distributedBy", product.distributedBy],
    ["specifications", product.specifications],
    ["sculptor", product.sculptor],
    [
      "productionCooperation",
      product.productionCooperation,
    ],
    ["relatedInformation", product.relatedInformation],
  ];

  const missingFieldNames = missingFields
    .filter(([, value]) => value == null || value === "")
    .map(([field]) => field);

  if (missingFieldNames.length > 0) {
    console.log(
      `- Missing optional fields: ${missingFieldNames.join(", ")}`,
    );
  } else {
    console.log("- Missing optional fields: none");
  }

  console.log(
    `- Output: data/catalog/${productId}.json`,
  );

  console.log(
    `Product ${productId} imported successfully.`,
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(`Catalog importer failed: ${message}`);
  process.exitCode = 1;
});