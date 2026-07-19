import type {
  NormalizedCatalogProduct,
  RawGoodSmileProduct,
  RawGoodSmileReleaseDate,
} from "./types";

function normalizeProductName(name: string): string {
  return name
    .replace(/^Nendoroid\s+/i, "")
    .trim();
}

function createIsoReleaseDate(
  releaseDate: RawGoodSmileReleaseDate | undefined,
): string | undefined {
  if (!releaseDate) {
    return undefined;
  }

  const month = String(releaseDate.month).padStart(
    2,
    "0",
  );

  return `${releaseDate.year}-${month}-01`;
}

export function normalizeGoodSmileProduct(
  product: RawGoodSmileProduct,
): NormalizedCatalogProduct {
  const initialRelease =
    product.releaseDates.find(
      (releaseDate) =>
        releaseDate.type === "initial",
    );

  return {
    source: product.source,
    sourceId: product.sourceId,
    officialUrl: product.officialUrl,

    number: product.number,
    name: normalizeProductName(product.name),
    series: product.series,
    manufacturer: product.manufacturer,
    imageUrl: product.mainImageUrl,

    releaseDate: createIsoReleaseDate(
      initialRelease,
    ),
  };
}