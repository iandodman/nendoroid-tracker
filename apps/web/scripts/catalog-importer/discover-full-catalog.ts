import {
  DEFAULT_PAGE_LIMIT,
  fetchCatalogProductIds,
} from "./catalog-pagination";
import { writeJsonFile } from "./write-json";

const DEFAULT_MAX_PAGES = 100;

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
  const discoveredIds = new Set<string>();
  const pages: Array<{
    offset: number;
    count: number;
  }> = [];

  let stoppedBecausePageWasIncomplete = false;

  for (
    let pageIndex = 0;
    pageIndex < maxPages;
    pageIndex += 1
  ) {
    const offset =
      pageIndex * DEFAULT_PAGE_LIMIT;

    console.log(
      `Downloading page ${pageIndex + 1} at offset ${offset}...`,
    );

    const productIds =
      await fetchCatalogProductIds(offset);

    pages.push({
      offset,
      count: productIds.length,
    });

    for (const productId of productIds) {
      discoveredIds.add(productId);
    }

    console.log(
      `Found ${productIds.length} IDs. Total unique: ${discoveredIds.size}.`,
    );

    if (
      productIds.length <
      DEFAULT_PAGE_LIMIT
    ) {
      stoppedBecausePageWasIncomplete = true;
      break;
    }
  }

  const productIds = [...discoveredIds];

  await writeJsonFile(
    "data/catalog/full-catalog-product-ids.json",
    {
      discoveredAt: new Date().toISOString(),
      pageLimit: DEFAULT_PAGE_LIMIT,
      maxPages,
      processedPages: pages.length,
      stopReason:
        stoppedBecausePageWasIncomplete
          ? "incomplete-page"
          : "maximum-pages",
      uniqueCount: productIds.length,
      pages,
      productIds,
    },
  );

  console.log("");
  console.log("Full catalog discovery complete.");
  console.log(
    `- Processed pages: ${pages.length}`,
  );
  console.log(
    `- Unique product IDs: ${productIds.length}`,
  );
  console.log(
    `- Stop reason: ${
      stoppedBecausePageWasIncomplete
        ? "incomplete page"
        : "maximum page limit"
    }`,
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(
    `Full catalog discovery failed: ${message}`,
  );

  process.exitCode = 1;
});