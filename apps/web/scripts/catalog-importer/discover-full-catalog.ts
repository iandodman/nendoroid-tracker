import {
  DEFAULT_MAX_PAGES,
  discoverFullCatalog,
} from "./full-catalog-discovery";
import { writeJsonFile } from "./write-json";

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

  const result = await discoverFullCatalog({
    maxPages,

    onPageStart(pageNumber, offset) {
      console.log(
        `Downloading page ${pageNumber} at offset ${offset}...`,
      );
    },

    onPageComplete(page) {
      console.log(
        `Found ${page.count} IDs. Total unique: ${page.uniqueCount}.`,
      );
    },
  });

  await writeJsonFile(
    "data/catalog/full-catalog-product-ids.json",
    result,
  );

  console.log("");
  console.log(
    "Full catalog discovery complete.",
  );
  console.log(
    `- Processed pages: ${result.processedPages}`,
  );
  console.log(
    `- Unique product IDs: ${result.uniqueCount}`,
  );
  console.log(
    `- Stop reason: ${result.stopReason}`,
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