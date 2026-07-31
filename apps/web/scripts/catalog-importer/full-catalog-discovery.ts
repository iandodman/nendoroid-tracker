import {
  DEFAULT_PAGE_LIMIT,
  fetchCatalogProductIds,
} from "./catalog-pagination";

export const SAFETY_MAX_PAGES = 1000;

export type CatalogDiscoveryStopReason =
  | "end-of-catalog"
  | "no-new-products"
  | "maximum-pages";

export interface CatalogDiscoveryPage {
  pageNumber: number;
  offset: number;
  count: number;
  uniqueCount: number;
}

export interface FullCatalogDiscoveryResult {
  discoveredAt: string;
  pageLimit: number;
  maxPages: number | null;
  processedPages: number;
  stopReason: CatalogDiscoveryStopReason;
  uniqueCount: number;
  pages: CatalogDiscoveryPage[];
  productIds: string[];
}

interface DiscoverFullCatalogOptions {
  maxPages?: number;
  onPageStart?: (
    pageNumber: number,
    offset: number,
  ) => void;
  onPageComplete?: (
    page: CatalogDiscoveryPage,
  ) => void;
}

function validateMaxPages(maxPages: number): void {
  if (
    !Number.isInteger(maxPages) ||
    maxPages <= 0
  ) {
    throw new Error(
      `Invalid maximum page count: "${maxPages}".`,
    );
  }
}

export async function discoverFullCatalog(
  options: DiscoverFullCatalogOptions = {},
): Promise<FullCatalogDiscoveryResult> {
  const maxPages = options.maxPages;

  if (maxPages !== undefined) {
    validateMaxPages(maxPages);
  }

  const discoveredIds = new Set<string>();
  const pages: CatalogDiscoveryPage[] = [];

  let stopReason: CatalogDiscoveryStopReason =
    "maximum-pages";

  for (
    let pageIndex = 0;
    pageIndex < SAFETY_MAX_PAGES;
    pageIndex += 1
  ) {
    if (
      maxPages !== undefined &&
      pageIndex >= maxPages
    ) {
      stopReason = "maximum-pages";
      break;
    }

    const pageNumber = pageIndex + 1;
    const offset =
      pageIndex * DEFAULT_PAGE_LIMIT;

    options.onPageStart?.(
      pageNumber,
      offset,
    );

    const productIds =
      await fetchCatalogProductIds(offset);

    const uniqueCountBeforePage =
      discoveredIds.size;

    for (const productId of productIds) {
      discoveredIds.add(productId);
    }

    const addedCount =
      discoveredIds.size -
      uniqueCountBeforePage;

    const page: CatalogDiscoveryPage = {
      pageNumber,
      offset,
      count: productIds.length,
      uniqueCount: discoveredIds.size,
    };

    pages.push(page);
    options.onPageComplete?.(page);

    if (addedCount === 0) {
      stopReason = "no-new-products";
      break;
    }

    if (
      productIds.length <
      DEFAULT_PAGE_LIMIT
    ) {
      stopReason = "end-of-catalog";
      break;
    }
  }

  const productIds = [...discoveredIds];

  return {
    discoveredAt: new Date().toISOString(),
    pageLimit: DEFAULT_PAGE_LIMIT,
    maxPages: maxPages ?? null,
    processedPages: pages.length,
    stopReason,
    uniqueCount: productIds.length,
    pages,
    productIds,
  };
}