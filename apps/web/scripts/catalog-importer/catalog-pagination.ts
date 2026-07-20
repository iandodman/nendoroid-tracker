import { discoverProductIds } from "./discovery";
import { fetchProductHtml } from "./fetch-product";

const CATALOG_ENDPOINT =
  "https://www.goodsmile.com/en/search/list";

export const DEFAULT_PAGE_LIMIT = 60;

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

export function buildCatalogPageUrl(
  offset: number,
  limit = DEFAULT_PAGE_LIMIT,
): string {
  const url = new URL(CATALOG_ENDPOINT);

  url.searchParams.set(
    "filter",
    JSON.stringify(SEARCH_FILTER),
  );
  url.searchParams.set("orderBy", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("couponId", "null");
  url.searchParams.set("searchIndex", "-1");

  return url.toString();
}

export async function fetchCatalogProductIds(
  offset: number,
  limit = DEFAULT_PAGE_LIMIT,
): Promise<string[]> {
  const url = buildCatalogPageUrl(offset, limit);
  const html = await fetchProductHtml(url);

  return discoverProductIds(html);
}