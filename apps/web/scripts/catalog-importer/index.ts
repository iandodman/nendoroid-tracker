import { fetchProductHtml } from "./fetch-product";
import { parseGoodSmileProduct } from "./parser";
import {
  writeJsonFile,
  writeTextFile,
} from "./write-json";

const SAMPLE_PRODUCT = {
  sourceId: "56111",
  url: "https://www.goodsmile.com/en/product/56111",
};

async function main(): Promise<void> {
  console.log(
    `Downloading Good Smile product ${SAMPLE_PRODUCT.sourceId}...`,
  );

  const html = await fetchProductHtml(SAMPLE_PRODUCT.url);

  await writeTextFile(
    "data/catalog/sample-product.html",
    html,
  );

  console.log(
    `Downloaded ${html.length.toLocaleString()} characters.`,
  );

  console.log("Parsing product analytics data...");

  const product = parseGoodSmileProduct(
    html,
    SAMPLE_PRODUCT.sourceId,
    SAMPLE_PRODUCT.url,
  );

  await writeJsonFile(
    "data/catalog/sample-product.json",
    product,
  );

  console.log("Parsed product:");
  console.log(`- Name: ${product.name}`);
  console.log(
    `- Series: ${product.series ?? "Unknown"}`,
  );
  console.log(
    `- Sculptor: ${product.sculptor ?? "Unknown"}`,
  );
  console.log(
    `- Release information: ${
      product.relatedInformation ?? "Unknown"
    }`,
  );
  console.log(
    `- Manufacturer: ${product.manufacturer ?? "Unknown"}`,
  );
  console.log(
    `- Product type: ${product.productType ?? "Unknown"}`,
  );
  console.log(`- Releases: ${product.releases.length}`);
  console.log("Sample product imported successfully.");
  console.log(
  `- Release dates: ${product.releaseDates.length}`,
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