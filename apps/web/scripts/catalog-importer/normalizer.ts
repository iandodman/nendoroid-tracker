import type {
  NormalizedCatalogProduct,
  RawGoodSmileProduct,
} from "./types";

type NormalizedEdition = {
  slug: string;
  name: string;
};

function hasBonusEdition(name: string): boolean {
  return /\bbonus\b/i.test(name);
}

function hasDxEdition(name: string): boolean {
  return /\bdx(?:\s+ver\.?)?\b/i.test(name);
}

function normalizeProductName(name: string): string {
  return name
    .replace(/^Nendoroid\s+/i, "")
    .replace(/\s+(?:w\/|with)\s+.*bonus.*$/i, "")
    .replace(/\s+good\s+smile.*bonus.*$/i, "")
    .replace(/\s+bonus(?:\s+included)?.*$/i, "")
    .replace(/\s+dx(?:\s+ver\.?)?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEdition(name: string): NormalizedEdition {
  const isBonus = hasBonusEdition(name);
  const isDx = hasDxEdition(name);

  if (isDx && isBonus) {
    return {
      slug: "dx-good-smile-bonus",
      name: "DX Good Smile Bonus",
    };
  }

  if (isDx) {
    return {
      slug: "dx",
      name: "DX",
    };
  }

  if (isBonus) {
    return {
      slug: "good-smile-bonus",
      name: "Good Smile Bonus",
    };
  }

  return {
    slug: "standard",
    name: "Standard",
  };
}

export function normalizeGoodSmileProduct(
  product: RawGoodSmileProduct,
): NormalizedCatalogProduct {
  const initialRelease = product.releaseDates.find(
    (releaseDate) => releaseDate.type === "initial",
  );

  const edition = normalizeEdition(product.name);

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

    slug: edition.slug,
    editionName: edition.name,
  };
}