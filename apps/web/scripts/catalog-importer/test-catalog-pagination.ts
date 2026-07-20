import { discoverProductIds } from "./discovery";
import { fetchProductHtml } from "./fetch-product";
import { writeJsonFile } from "./write-json";

const CATALOG_ENDPOINT =
  "https://www.goodsmile.com/en/search/list";

const PAGE_LIMIT = 60;

const SEARCH_FILTER = {
  search_keyword: "",
  search_over18: false,
  search_category: [
    6, 15, 63, 59, 32, 93, 57, 51, 61, 41,
    21, 36, 35, 15, 63, 59, 32, 93, 57, 51,
    61, 41, 6, 15, 63, 59, 32, 93, 57, 51,
    61, 41, 21, 36, 35, 15, 63, 59, 32, 93,
    57, 51, 61, 41,
  ],
  search_maker: [],
  search_title: [],
  search_status: "0",
  release_date_from: "",
  release_date_to: "",
  search_bonus: false,
  search_exclusive: false,
  search_sale: false,
  search_sales_origin: false,
  tag: [],
};

function buildCatalogPageUrl(offset: number): string {
  const url = new URL(CATALOG_ENDPOINT);

  url.searchParams.set(
    "filter",
    JSON.stringify(SEARCH_FILTER),
  );
  url.searchParams.set("orderBy", "1");
  url.searchParams.set(
    "limit",
    String(PAGE_LIMIT),
  );
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("couponId", "null");
  url.searchParams.set("searchIndex", "-1");

  return url.toString();
}

async function fetchCatalogPage(
  offset: number,
): Promise<string[]> {
  const url = buildCatalogPageUrl(offset);

  console.log(`Downloading offset ${offset}...`);

  const html = await fetchProductHtml(url);
  const productIds = discoverProductIds(html);

  console.log(
    `Found ${productIds.length} product IDs at offset ${offset}.`,
  );

  return productIds;
}

async function main(): Promise<void> {
  const firstPageIds =
    await fetchCatalogPage(0);

  const secondPageIds =
    await fetchCatalogPage(PAGE_LIMIT);

  const uniqueProductIds = [
    ...new Set([
      ...firstPageIds,
      ...secondPageIds,
    ]),
  ];

  await writeJsonFile(
    "data/catalog/catalog-pagination-test.json",
    {
      endpoint: CATALOG_ENDPOINT,
      limit: PAGE_LIMIT,
      pages: [
        {
          offset: 0,
          count: firstPageIds.length,
          productIds: firstPageIds,
        },
        {
          offset: PAGE_LIMIT,
          count: secondPageIds.length,
          productIds: secondPageIds,
        },
      ],
      uniqueCount: uniqueProductIds.length,
      productIds: uniqueProductIds,
    },
  );

  console.log("");
  console.log("Pagination test complete.");
  console.log(
    `Unique product IDs: ${uniqueProductIds.length}`,
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "An unknown error occurred.";

  console.error(
    `Catalog pagination test failed: ${message}`,
  );

  process.exitCode = 1;
});