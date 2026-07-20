import { fetchProductHtml } from "./fetch-product";
import { discoverProductIds } from "./discovery";
import {
  writeJsonFile,
  writeTextFile,
} from "./write-json";

const DEFAULT_CATALOG_URL =
  "https://www.goodsmile.com/en/aboutnendoroids";

function getCatalogUrl(): string {
  const value = process.argv[2]?.trim();

  if (!value) {
    return DEFAULT_CATALOG_URL;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `Invalid catalog URL: "${value}".`,
    );
  }

  if (url.origin !== "https://www.goodsmile.com") {
    throw new Error(
      "Catalog URL must belong to www.goodsmile.com.",
    );
  }

  return url.toString();
}

async function main(): Promise<void> {
  const catalogUrl = getCatalogUrl();

  console.log(
    `Downloading catalog page: ${catalogUrl}`,
  );

  const html = await fetchProductHtml(catalogUrl);

  await writeTextFile(
    "data/catalog/discovery-page.html",
    html,
  );

  const productIds = discoverProductIds(html);

  await writeJsonFile(
    "data/catalog/discovered-product-ids.json",
    {
      source: catalogUrl,
      discoveredAt: new Date().toISOString(),
      count: productIds.length,
      productIds,
    },
  );

  console.log(
    `Discovered ${productIds.length} unique product IDs.`,
  );

  console.log(
    "Output: data/catalog/discovered-product-ids.json",
  );

  if (productIds.length === 0) {
    throw new Error(
      "No product IDs were found on the catalog page.",
    );
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(
    `Catalog discovery failed: ${message}`,
  );

  process.exitCode = 1;
});