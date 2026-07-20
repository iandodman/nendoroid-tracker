import type {
  NormalizedCatalogProduct,
  RawGoodSmileProduct,
} from "./types";

function normalizeProductName(name: string): string {
  return name
    .replace(/^Nendoroid\s+/i, "")
    .trim();
}

export function normalizeGoodSmileProduct(
  product: RawGoodSmileProduct,
): NormalizedCatalogProduct {
  const initialRelease = product.releaseDates.find(
    (releaseDate) => releaseDate.type === "initial",
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

    releaseYear: initialRelease?.year,
    releaseMonth: initialRelease?.month,
  };
}